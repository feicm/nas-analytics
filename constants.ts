
import { EventDefinition, Milestone, Metric } from './types';

export const PRD_TITLE = "NAS 行为数据采集（埋点）技术方案 PRD";
export const PRD_VERSION = "1.0";
export const PRD_DATE = "2025-11-26";

export const METRICS: Metric[] = [
  { name: "P95 Latency", target: "< 2s" },
  { name: "Success Rate", target: "≥ 95%" },
  { name: "Data Loss", target: "< 1%" },
  { name: "API Latency", target: "< 500ms" },
];

export const MILESTONES: Milestone[] = [
  { stage: "1.0 Event Definition", date: "2025-12-10", completed: true },
  { stage: "SDK Completion", date: "2026-01-15", completed: false },
  { stage: "Agent + API", date: "2026-02-01", completed: false },
  { stage: "Data Pipeline", date: "2026-02-20", completed: false },
  { stage: "Gray Release", date: "2026-03-01", completed: false },
  { stage: "Full Release", date: "2026-04-01", completed: false },
  { stage: "Compliance Cert", date: "2026-05-01", completed: false },
];

export const EVENTS_DATA: EventDefinition[] = [
  // Generic
  { id: "page_view", category: "generic", trigger: "Page Load", extraFields: ["url", "referrer"], samplingRate: "10%" },
  { id: "click", category: "generic", trigger: "Element Click", extraFields: ["selector", "element_text"], samplingRate: "10%" },
  { id: "scroll", category: "generic", trigger: "Scroll Threshold", extraFields: ["scroll_depth"], samplingRate: "Throttled" },
  // Business - Version
  { id: "nas_version", category: "business", trigger: "System Check", extraFields: ["nas_version", "build", "upgrade_available"], samplingRate: "100%" },
  { id: "desktop_version", category: "business", trigger: "App Launch", extraFields: ["desktop_version", "os_name"], samplingRate: "100%" },
  // Business - Modules
  { id: "module_open_freq", category: "business", trigger: "Module Open/Close", extraFields: ["module_name", "action", "duration"], samplingRate: "100%" },
  // Business - Docker/VM
  { id: "docker_install", category: "business", trigger: "Container Action", extraFields: ["container_id", "is_running"], samplingRate: "100%" },
  // Business - Search
  { id: "files_search_usage", category: "business", trigger: "Search", extraFields: ["query_text", "result_count"], samplingRate: "100%" },
  { id: "zettai_search", category: "business", trigger: "AI Search", extraFields: ["query_text", "response_time"], samplingRate: "100%" },
  // Business - Hardware
  { id: "hardware_info", category: "business", trigger: "Periodic", extraFields: ["drive", "ddr", "nic"], samplingRate: "100%" },
  { id: "video_error_code", category: "business", trigger: "Playback Error", extraFields: ["error_code", "codec", "retry_count"], samplingRate: "100%" },
  // System
  { id: "system_health", category: "system", trigger: "Periodic/Threshold", extraFields: ["cpu", "mem", "disk_free"], samplingRate: "100%" },
  { id: "api_failed", category: "system", trigger: "API Error", extraFields: ["endpoint", "status_code"], samplingRate: "100%" },
];

export const PRD_FULL_TEXT = `
NAS 行为数据采集（埋点）技术方案 PRD（精炼整理版）
版本：1.0 日期：2025-11-26 编写人：MiroThinker

1. 背景与目标
NAS 产品需要构建一套完整的行为数据采集系统（埋点系统）。覆盖 31 项关键指标，包括地区分布、在线率、版本分布、模块打开频率、Docker/VM 使用、搜索、升级进度、硬件信息等。
目标：数据完整性（关键事件 100% 采集，高频 10% 采样）、实时性（P95 < 2s）、可靠性（成功率 ≥ 95%）、合规性（GDPR/CCPA）、易维护性、可分析性（ClickHouse + S3）。

2. 范围
包含：Web/PC/手机端用户行为、NAS 后台硬件/网络信息、升级状态与异常、Docker/VM / SMB 使用、搜索与视频播放。
排除：未授权的个人敏感信息。

3. 事件模型（统一 Schema）
字段：event_id, event_type, timestamp, session_id, device_id, user_id (optional), client_type, extra (object).

4. 事件层级设计
4.1 通用事件层 (Generic): page_view, click, scroll, expose.
4.2 业务事件层 (Business): 
- 版本: nas_version, desktop_version
- 在线: nas_online_rate
- 模块: module_open_freq
- Docker/VM: docker_install, vm_install
- 搜索: files_search_usage, zettai_search, zettai_chat
- 升级: upgrade_progress, upgrade_status, nas_unhealthy
- 硬件: hardware_info, smb_usage, copy_key_usage
- 视频: video_player_compat, video_error_code
4.3 系统事件层 (System): system_health, session_timeout, login_failed, api_failed.

5. 服务端接口
POST /api/v1/events
认证: HMAC-SHA256
优先级: navigator.sendBeacon > fetch > Image.

6. SDK 与 NAS Agent
Web SDK: TypeScript, 自动采集 PV/Click, 10% 采样.
NAS Agent (Python/Go): 硬件采集 (30s), 重试机制.

7. 数据管道
Kafka -> Flink -> ClickHouse (业务/通用/系统表) + S3 (Parquet).

8. 非功能性
上报 P95 < 2s, 丢失率 < 1%, API 延迟 < 500ms, 支持 50+ 事件.

9. 采样规则
高频 10% (click/scroll), 关键事件 100%.

10. 隐私
默认匿名 device_id, 用户同意后上报 user_id.

11. 监控
报警: 成功率 < 95%, P95 > 2s, 错误率 > 1%.
`;

export const SDK_CODE_PREVIEW = `
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

export class NasAnalytics {
  private queue: EventPayload[] = [];
  
  // ... constructor ...

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
      extra: extra,
      _retryCount: 0
    };

    if (this.config.debug) {
      console.log(\`[NAS-SDK] Tracked:\`, payload);
    }

    this.enqueue(payload);
  }

  public async flush(): Promise<void> {
    if (this.queue.length === 0 || this.isFlushing) return;
    this.isFlushing = true;
    
    const batch = this.queue.slice(0, this.config.batchSize);

    try {
      const success = await this.sendBatch(batch);
      if (success) {
        // Remove successful events
        this.queue = this.queue.slice(batch.length);
        this.saveQueue();
      } else {
        // Trigger retry logic
        this.handleRetry(batch);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private handleRetry(batch: EventPayload[]) {
    const retryLimit = this.config.retryLimit;
    const preservedQueue: EventPayload[] = [];
    
    // Increment count & Filter exceeding limit
    for (let i = 0; i < batch.length; i++) {
        const event = this.queue[i];
        if (!event) break;
        const currentRetries = (event._retryCount || 0) + 1;
        
        if (currentRetries <= retryLimit) {
            event._retryCount = currentRetries;
            preservedQueue.push(event);
        } else {
             if (this.config.debug) console.warn('Dropped event', event.event_id);
        }
    }
    
    // Re-assemble queue
    const restOfQueue = this.queue.slice(batch.length);
    this.queue = [...preservedQueue, ...restOfQueue];
    this.saveQueue();
  }
}`;
