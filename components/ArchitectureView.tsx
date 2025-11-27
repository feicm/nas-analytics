import React from 'react';
import { ArrowRight, Server, Database, BarChart3, Radio, FileJson, Layers, Shield } from 'lucide-react';

const Node = ({ icon: Icon, title, sub, color }: { icon: any, title: string, sub: string, color: string }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 ${color} bg-white shadow-sm min-w-[140px]`}>
    <Icon className={`mb-2 ${color.replace('border', 'text').replace('-200', '-600')}`} size={28} />
    <span className="font-bold text-slate-800 text-sm">{title}</span>
    <span className="text-xs text-slate-500 mt-1">{sub}</span>
  </div>
);

const Arrow = () => (
  <div className="flex items-center justify-center px-2 text-slate-400">
    <ArrowRight size={24} />
  </div>
);

const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-8">Data Pipeline Architecture</h2>
        
        <div className="flex flex-col gap-8">
          
          {/* Collection Layer */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-32 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Collection</div>
            <div className="flex-1 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-wrap gap-4 items-center justify-center">
               <Node icon={Radio} title="Web/PC SDK" sub="Beacon API" color="border-blue-200" />
               <Node icon={Server} title="NAS Agent" sub="Go/Python" color="border-blue-200" />
               <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded text-xs font-mono">POST /api/v1/events</div>
            </div>
          </div>

          <div className="flex justify-center"><ArrowRight className="rotate-90 text-slate-300" /></div>

          {/* Ingestion Layer */}
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="w-32 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Ingestion</div>
             <div className="flex-1 flex items-center justify-center gap-4">
                <Node icon={Layers} title="Kafka" sub="Raw/Sampled Topics" color="border-purple-200" />
                <Arrow />
                <Node icon={FileJson} title="Flink" sub="Validation & Schema" color="border-purple-200" />
             </div>
          </div>

          <div className="flex justify-center"><ArrowRight className="rotate-90 text-slate-300" /></div>

          {/* Storage Layer */}
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="w-32 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Storage</div>
             <div className="flex-1 flex items-center justify-center gap-4">
                <Node icon={Database} title="ClickHouse" sub="Real-time Analytics" color="border-green-200" />
                <span className="text-slate-400">+</span>
                <Node icon={Server} title="AWS S3" sub="Parquet (Cold)" color="border-green-200" />
             </div>
          </div>

          <div className="flex justify-center"><ArrowRight className="rotate-90 text-slate-300" /></div>

          {/* Application Layer */}
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="w-32 font-semibold text-slate-500 text-sm uppercase tracking-wider text-right">Analysis</div>
             <div className="flex-1 flex items-center justify-center gap-4">
                <Node icon={BarChart3} title="Metabase" sub="BI Dashboards" color="border-orange-200" />
                <Node icon={Shield} title="Monitoring" sub="Prometheus + Alerts" color="border-red-200" />
             </div>
          </div>

        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">Privacy & Compliance</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                <li><strong className="text-slate-800">Consent:</strong> Explicit user consent required for <code>user_id</code>.</li>
                <li><strong className="text-slate-800">Anonymity:</strong> <code>device_id</code> is anonymized by default.</li>
                <li><strong className="text-slate-800">Retention:</strong> Raw logs 90 days, Aggregated 1 year.</li>
                <li><strong className="text-slate-800">Right to Forget:</strong> Supported via API.</li>
            </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2">Technical Constraints</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                <li><strong className="text-slate-800">Protocol:</strong> HTTPS only.</li>
                <li><strong className="text-slate-800">Auth:</strong> HMAC-SHA256 (X-Event-Signature).</li>
                <li><strong className="text-slate-800">Failover:</strong> SDK local storage retry on failure.</li>
                <li><strong className="text-slate-800">Scaling:</strong> Auto-scale Consumers on Kafka lag.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureView;
