import React from 'react';
import { MILESTONES } from '../constants';
import { CheckCircle, Circle, Clock } from 'lucide-react';

const TimelineView: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-8">Project Roadmap & Milestones</h2>
      
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
        {MILESTONES.map((milestone, index) => {
          const isPast = new Date(milestone.date) < new Date();
          const isCurrent = !isPast && index === 1; // Simulated current state

          return (
            <div key={milestone.stage} className="relative pl-8">
              {/* Dot */}
              <div className={`absolute -left-[9px] top-1 w-5 h-5 rounded-full border-4 border-white ${
                milestone.completed ? 'bg-green-500' : isPast ? 'bg-blue-500' : 'bg-slate-300'
              }`}></div>
              
              <div className={`p-4 rounded-lg border ${
                milestone.completed 
                    ? 'bg-green-50 border-green-100' 
                    : isPast 
                        ? 'bg-blue-50 border-blue-100' 
                        : 'bg-white border-slate-100'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className={`font-bold ${milestone.completed ? 'text-green-800' : 'text-slate-800'}`}>
                            {milestone.stage}
                        </h3>
                        <p className="text-sm text-slate-500">{milestone.date}</p>
                    </div>
                    <div>
                        {milestone.completed && <div className="flex items-center text-green-600 text-sm font-medium"><CheckCircle size={16} className="mr-1"/> Completed</div>}
                        {isPast && !milestone.completed && <div className="flex items-center text-blue-600 text-sm font-medium"><Clock size={16} className="mr-1"/> In Progress</div>}
                        {!isPast && <div className="flex items-center text-slate-400 text-sm font-medium"><Circle size={16} className="mr-1"/> Planned</div>}
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
