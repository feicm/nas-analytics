
export interface AnalyticsConfig {
  endpoint: string;
  appId: string;
  debug?: boolean;
  sampleRate?: number; // 0.0 to 1.0
  autoTrack?: boolean;
  batchSize?: number; // Max events per request (default: 10)
  flushInterval?: number; // Time in ms (default: 5000)
  maxQueueSize?: number; // Max stored events (default: 1000)
  retryLimit?: number; // Max retries for failed batches
}

export interface EventPayload {
  event_id: string;
  event_type: 'generic' | 'business' | 'system' | 'error';
  timestamp: number;
  session_id: string;
  device_id: string;
  user_id?: string;
  client_type: 'web';
  extra?: Record<string, any>;
  _retryCount?: number; // Internal for retry logic
}

export class NasAnalytics {
  public config: Required<AnalyticsConfig>; // Made public for inspection
  private deviceId: string;
  private sessionId: string;
  private userId?: string;
  private queue: EventPayload[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isFlushing: boolean = false;
  private readonly STORAGE_KEY_QUEUE = 'nas_analytics_queue';
  private readonly STORAGE_KEY_DEVICE = 'nas_analytics_device_id';

  constructor(config: AnalyticsConfig) {
    this.config = {
      debug: false,
      sampleRate: 1.0,
      autoTrack: true,
      batchSize: 5,
      flushInterval: 5000,
      maxQueueSize: 200,
      retryLimit: 3,
      ...config
    } as Required<AnalyticsConfig>;

    this.deviceId = this.getDeviceId();
    this.sessionId = this.generateSessionId();
    
    // 1. Load persisted events from local storage (Recovery)
    this.loadQueue();

    if (this.config.debug) {
      console.log(`[NAS-SDK] Initialized. Batch=${this.config.batchSize}, Interval=${this.config.flushInterval}ms, RetryLimit=${this.config.retryLimit}`);
    }

    // 2. Start periodic flush
    this.startFlushTimer();

    // 3. Handle Lifecycle
    this.registerLifecycleListeners();

    if (this.config.autoTrack) {
      this.initAutoTracking();
    }
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.config.debug) {
      console.log('[NAS-SDK] Instance destroyed.');
    }
  }

  public track(
    eventId: string, 
    eventType: EventPayload['event_type'] = 'generic', 
    extra: Record<string, any> = {}
  ): void {
    if (!this.shouldSample(eventId)) return;

    const payload: EventPayload = {
      event_id: eventId,
      event_type: eventType,
      timestamp: Date.now(),
      session_id: this.sessionId,
      device_id: this.deviceId,
      user_id: this.userId,
      client_type: 'web',
      extra: extra,
      _retryCount: 0
    };

    if (this.config.debug) {
      console.log(`[NAS-SDK] Tracked:`, payload);
    }

    this.enqueue(payload);
  }

  public identify(userId: string): void {
    this.userId = userId;
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public getQueue(): EventPayload[] {
    return [...this.queue];
  }

  /**
   * Manually trigger a flush (useful for testing or forcing data send)
   */
  public async flush(): Promise<void> {
    if (this.queue.length === 0) return;
    if (this.isFlushing) return;

    this.isFlushing = true;
    
    // Take a batch
    const batch = this.queue.slice(0, this.config.batchSize);
    
    if (this.config.debug) {
      console.log(`[NAS-SDK] Flushing batch of ${batch.length} events...`);
    }

    try {
      const success = await this.sendBatch(batch);
      
      if (success) {
        // Remove successful events
        this.queue = this.queue.slice(batch.length);
        this.saveQueue();
        if (this.config.debug) console.log(`[NAS-SDK] Flush success. Remaining: ${this.queue.length}`);
      } else {
        if (this.config.debug) console.warn(`[NAS-SDK] Flush failed. Triggering retry logic.`);
        this.handleRetry(batch);
      }
    } catch (e) {
      console.error('[NAS-SDK] Network error during flush', e);
      this.handleRetry(batch);
    } finally {
      this.isFlushing = false;
    }
  }

  private enqueue(payload: EventPayload): void {
    if (this.queue.length >= this.config.maxQueueSize) {
      // Strategy: Drop oldest to make room for new
      this.queue.shift(); 
    }
    this.queue.push(payload);
    this.saveQueue();
    
    // If we hit batch size, trigger immediate flush check
    if (this.queue.length >= this.config.batchSize) {
        // Use setTimeout to not block the main thread execution of track()
        setTimeout(() => this.flush(), 0);
    }
  }

  private async sendBatch(events: EventPayload[]): Promise<boolean> {
    const url = this.config.endpoint;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: events }),
        keepalive: true 
      });

      if (!response.ok) {
        // 4xx errors usually mean bad request, drop them (return true to remove from queue)
        if (response.status >= 400 && response.status < 500) {
            console.error('[NAS-SDK] Client error (4xx), dropping batch.');
            return true; 
        }
        return false; // 5xx or other errors, retry
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  private handleRetry(batch: EventPayload[]) {
    // Logic: Increment retry count, filter out those exceeding limit, and put back in queue
    const retryLimit = this.config.retryLimit;
    
    // 1. Remove the batch from the front (since we sliced it earlier, but didn't remove it from this.queue yet? 
    // Wait, in flush(), we only remove if success. So the batch is still at the HEAD of this.queue.)
    // However, to update _retryCount properly, we should modify the objects in place or replace them.
    
    // Let's modify the queue in place for simplicity
    const preservedQueue: EventPayload[] = [];
    const droppedEvents: string[] = [];

    // The batch corresponds to the first N elements of the queue
    for (let i = 0; i < batch.length; i++) {
        const event = this.queue[i];
        if (!event) break;

        const currentRetries = (event._retryCount || 0) + 1;
        if (currentRetries <= retryLimit) {
            event._retryCount = currentRetries;
            preservedQueue.push(event);
        } else {
            droppedEvents.push(event.event_id);
        }
    }

    if (droppedEvents.length > 0 && this.config.debug) {
        console.warn(`[NAS-SDK] Dropped ${droppedEvents.length} events due to retry limit:`, droppedEvents);
    }

    // Reconstruct queue: preserved retrying events + rest of the queue
    const restOfQueue = this.queue.slice(batch.length);
    this.queue = [...preservedQueue, ...restOfQueue];
    this.saveQueue();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_QUEUE);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.error('[NAS-SDK] Failed to load queue', e);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(this.STORAGE_KEY_QUEUE, JSON.stringify(this.queue));
    } catch (e) {
      // LocalStorage might be full
    }
  }

  private startFlushTimer() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private registerLifecycleListeners() {
    if (typeof window === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  // --- Helpers ---

  private shouldSample(eventId: string): boolean {
    const KEY_EVENTS = ['nas_version', 'upgrade_status', 'error', 'click'];
    if (KEY_EVENTS.some(key => eventId.includes(key))) return true;
    return Math.random() <= this.config.sampleRate;
  }

  private getDeviceId(): string {
    let id = localStorage.getItem(this.STORAGE_KEY_DEVICE);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem(this.STORAGE_KEY_DEVICE, id);
    }
    return id;
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9);
  }

  private initAutoTracking(): void {
    if (typeof window === 'undefined') return;
    this.track('page_view', 'generic', {
      url: window.location.href,
      referrer: document.referrer
    });
  }
}
