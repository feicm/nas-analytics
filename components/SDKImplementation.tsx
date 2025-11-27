
import React, { useState, useEffect, useRef } from 'react';
import { SDK_CODE_PREVIEW } from '../constants';
import { NasAnalytics, EventPayload } from '../nas-sdk';
import { Play, Copy, Terminal, CheckCircle2, RotateCcw, Layers, Zap, Settings, RefreshCw, Trash2, Save, Type } from 'lucide-react';

const SDKImplementation: React.FC = () => {
  const [activeView, setActiveView] = useState<'playground' | 'code'>('playground');
  const [logs, setLogs] = useState<string[]>([]);
  const [queueSize, setQueueSize] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<EventPayload[]>([]);
  
  // Event Form State
  const [formData, setFormData] = useState({
    eventId: 'module_open_freq',
    eventType: 'business',
    extraKey: 'module_name',
    extraValue: 'Photos'
  });

  // Config Form State
  const [config, setConfig] = useState({
    batchSize: 3,
    flushInterval: 5000,
    maxQueueSize: 50,
    sampleRate: 1.0,
    retryLimit: 3
  });

  const sdkRef = useRef<NasAnalytics | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize SDK
  const initSDK = () => {
    if (sdkRef.current) {
      sdkRef.current.destroy();
    }

    const analytics = new NasAnalytics({
      endpoint: 'https://httpbin.org/post', // Echo endpoint
      appId: 'nas-demo-app',
      debug: true,
      autoTrack: false,
      batchSize: Number(config.batchSize),
      flushInterval: Number(config.flushInterval),
      maxQueueSize: Number(config.maxQueueSize),
      sampleRate: Number(config.sampleRate),
      retryLimit: Number(config.retryLimit)
    });

    sdkRef.current = analytics;
    setQueueSize(analytics.getQueueSize());
    setCurrentQueue(analytics.getQueue());
    setLogs(prev => [`${new Date().toLocaleTimeString()} [System] SDK Re-initialized. Batch: ${config.batchSize}, Interval: ${config.flushInterval}ms`, ...prev]);
  };

  useEffect(() => {
    // Monkey patch console.log to capture SDK output
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    const customLog = (...args: any[]) => {
      const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      if (msg.includes('[NAS-SDK]')) {
        setLogs(prev => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev]);
        // Update queue visual
        if (sdkRef.current) {
           setQueueSize(sdkRef.current.getQueueSize());
           setCurrentQueue(sdkRef.current.getQueue());
        }
      }
      originalLog(...args);
    };

    console.log = customLog;
    console.warn = customLog;
    console.error = customLog;

    // Clean up previous storage for clean demo
    if (!localStorage.getItem('nas_analytics_queue')) {
         localStorage.removeItem('nas_analytics_queue');
    }

    initSDK();

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      if (sdkRef.current) sdkRef.current.destroy();
    };
  }, []);

  // Update queue size periodically (for countdown timers/background flush updates)
  useEffect(() => {
      const interval = setInterval(() => {
          if (sdkRef.current) {
            setQueueSize(sdkRef.current.getQueueSize());
            setCurrentQueue(sdkRef.current.getQueue());
          }
      }, 1000);
      return () => clearInterval(interval);
  }, []);

  const handleTrack = () => {
    if (!sdkRef.current) return;
    const extra = formData.extraKey ? { [formData.extraKey]: formData.extraValue } : {};
    sdkRef.current.track(formData.eventId, formData.eventType as any, extra);
  };

  const handleFlush = () => {
    sdkRef.current?.flush();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SDK_CODE_PREVIEW);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleEventIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    let newType = formData.eventType;
    
    // Smart auto-select type based on convention
    if (['page_view', 'click', 'scroll'].includes(newId)) newType = 'generic';
    else if (['nas_version', 'module_open_freq', 'docker_install'].includes(newId)) newType = 'business';
    else if (['system_health', 'api_failed'].includes(newId)) newType = 'system';
    else if (['error_log'].includes(newId)) newType = 'error';

    setFormData({ ...formData, eventId: newId, eventType: newType });
  };

  const clearLogs = () => setLogs([]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'business': return 'bg-blue-100 text-blue-700';
      case 'system': return 'bg-red-100 text-red-700';
      case 'generic': return 'bg-slate-100 text-slate-700';
      case 'error': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => setActiveView('playground')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'playground' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Play size={16} />
          Playground & Config
        </button>
        <button
          onClick={() => setActiveView('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'code' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Terminal size={16} />
          Source Code
        </button>
      </div>

      {activeView === 'playground' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Config & Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Configuration Panel */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-3">
                <Settings size={18} />
                <h3 className="font-bold">SDK Configuration</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Batch Size (Events)</label>
                  <input 
                    type="number" 
                    value={config.batchSize}
                    onChange={(e) => setConfig({...config, batchSize: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Triggers flush when queue reaches this size.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Flush Interval (ms)</label>
                  <input 
                    type="number" 
                    value={config.flushInterval}
                    step={1000}
                    onChange={(e) => setConfig({...config, flushInterval: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Auto-flush timer.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Retry Limit</label>
                        <input 
                            type="number" 
                            value={config.retryLimit}
                            onChange={(e) => setConfig({...config, retryLimit: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Sample Rate</label>
                        <input 
                            type="number" 
                            value={config.sampleRate}
                            step={0.1} min={0} max={1}
                            onChange={(e) => setConfig({...config, sampleRate: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                </div>

                <button 
                  onClick={initSDK}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium mt-2"
                >
                  <RefreshCw size={14} />
                  Re-initialize SDK
                </button>
              </div>
            </div>

            {/* Event Simulator */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-slate-800 border-b border-slate-100 pb-3">
                <Zap size={18} />
                <h3 className="font-bold">Event Simulator</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Event ID</label>
                  <select 
                    value={formData.eventId}
                    onChange={handleEventIdChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="page_view">page_view</option>
                    <option value="click">click</option>
                    <option value="module_open_freq">module_open_freq</option>
                    <option value="nas_version">nas_version</option>
                    <option value="docker_install">docker_install</option>
                    <option value="system_health">system_health</option>
                    <option value="api_failed">api_failed</option>
                    <option value="error_log">error_log</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Event Type</label>
                  <select 
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="generic">generic</option>
                    <option value="business">business</option>
                    <option value="system">system</option>
                    <option value="error">error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Extra Data (Key: Value)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Key"
                      value={formData.extraKey}
                      onChange={(e) => setFormData({...formData, extraKey: e.target.value})}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <input 
                      type="text" 
                      placeholder="Value"
                      value={formData.extraValue}
                      onChange={(e) => setFormData({...formData, extraValue: e.target.value})}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={handleTrack}
                    className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-200"
                  >
                    Track Event
                  </button>
                  <button 
                    onClick={handleFlush}
                    className="flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm shadow-green-200"
                  >
                    Force Flush
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visualization & Logs */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Queue Visualization */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 min-h-[160px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-purple-600" />
                  <h3 className="font-bold text-slate-800">Queue Visualization</h3>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                  Count: {queueSize}
                </span>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                 {currentQueue.length === 0 && (
                     <div className="w-full text-center py-8 text-slate-400 text-sm italic">
                         Queue is empty. Track events to see them here.
                     </div>
                 )}
                 {currentQueue.map((ev, i) => (
                   <div key={`${ev.event_id}-${ev.timestamp}-${i}`} 
                        className="relative group w-24 h-24 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center p-2 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="text-[10px] font-mono text-slate-400 mb-1">{ev.timestamp.toString().substr(-6)}</div>
                      <div className="text-xs font-bold text-slate-700 text-center break-all leading-tight mb-1">{ev.event_id}</div>
                      <span className={`text-[9px] px-1 rounded-sm uppercase ${getEventTypeColor(ev.event_type)}`}>
                        {ev.event_type}
                      </span>
                      {ev._retryCount ? (
                         <div className="absolute top-1 right-1 w-4 h-4 bg-red-100 text-red-600 text-[9px] flex items-center justify-center rounded-full font-bold" title="Retry Count">
                             {ev._retryCount}
                         </div>
                      ) : null}
                   </div>
                 ))}
              </div>
              
              {/* Batch Indicator line */}
              {queueSize >= config.batchSize && (
                  <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-xs text-slate-400 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      Next batch of {config.batchSize} events is ready to flush
                  </div>
              )}
            </div>

            {/* Console Output */}
            <div className="bg-slate-900 rounded-xl overflow-hidden flex-1 flex flex-col min-h-[400px]">
              <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                <span className="text-slate-300 text-xs font-mono flex items-center gap-2">
                  <Terminal size={14} /> SDK Console Output
                </span>
                <button onClick={clearLogs} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              <div ref={scrollRef} className="p-4 font-mono text-xs space-y-2 overflow-y-auto flex-1 max-h-[400px]">
                {logs.length === 0 && <span className="text-slate-600 italic">No logs yet...</span>}
                {logs.map((log, i) => {
                  // Color coding based on log content
                  let colorClass = 'text-slate-300';
                  if (log.includes('error') || log.includes('dropped') || log.includes('failed')) colorClass = 'text-red-400';
                  else if (log.includes('warn') || log.includes('Retrying')) colorClass = 'text-yellow-400';
                  else if (log.includes('Flush success')) colorClass = 'text-green-400';
                  else if (log.includes('Flushing')) colorClass = 'text-blue-300';
                  else if (log.includes('Initialized')) colorClass = 'text-purple-300';

                  return (
                    <div key={i} className={`${colorClass} border-b border-slate-800/50 pb-1 last:border-0 whitespace-pre-wrap`}>
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCopyCode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isCopied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {isCopied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto border border-slate-800">
            <pre className="font-mono text-sm text-blue-300 leading-relaxed">
              {SDK_CODE_PREVIEW}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default SDKImplementation;
