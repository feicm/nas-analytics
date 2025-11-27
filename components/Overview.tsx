import React from 'react';
import { METRICS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const Overview: React.FC = () => {
  const samplingData = [
    { name: 'Generic (Click/Scroll)', value: 10 },
    { name: 'Key Business Events', value: 100 },
  ];
  const COLORS = ['#64748b', '#3b82f6'];

  const goals = [
    { title: "Completeness", desc: "100% Key Events", icon: CheckCircle2, color: "text-green-500" },
    { title: "Real-time", desc: "P95 < 2s", icon: Zap, color: "text-yellow-500" },
    { title: "Reliability", desc: "Success ≥ 95%", icon: ShieldCheck, color: "text-blue-500" },
    { title: "Compliance", desc: "GDPR/CCPA", icon: AlertTriangle, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal) => {
            const Icon = goal.icon;
            return (
                <div key={goal.title} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-slate-50 ${goal.color}`}>
                            <Icon size={24} />
                        </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">{goal.title}</h3>
                    <p className="text-xl font-bold text-slate-900 mt-1">{goal.desc}</p>
                </div>
            )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sampling Strategy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={samplingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {samplingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Non-Functional Targets</h3>
          <div className="grid grid-cols-2 gap-4">
            {METRICS.map((m) => (
                <div key={m.name} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">{m.name}</p>
                    <p className="text-lg font-semibold text-slate-800">{m.target}</p>
                </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
             <strong>Note:</strong> Events are stored in ClickHouse (Business/System/Generic tables) + S3 (Parquet) for backup.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
