import React, { useState } from 'react';
import { EVENTS_DATA } from '../constants';
import { EventDefinition } from '../types';
import { Search, Filter, Box } from 'lucide-react';

const EventCatalog: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredEvents = EVENTS_DATA.filter(event => {
    const matchesCategory = filter === 'all' || event.category === filter;
    const matchesSearch = event.id.toLowerCase().includes(search.toLowerCase()) || 
                          event.trigger.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'system': return 'bg-red-100 text-red-700 border-red-200';
      case 'generic': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Event Schema Definition</h2>
        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm text-blue-300 font-mono">
          <pre>{`{
  "event_id": "String (Required)",
  "event_type": "generic | business | system | error",
  "timestamp": "Number (Unix ms)",
  "session_id": "String",
  "device_id": "String (Anonymous)",
  "user_id": "String (Optional, Consent required)",
  "client_type": "web | pc | mobile | nas",
  "extra": { ... }
}`}</pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Event Dictionary</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="business">Business</option>
              <option value="generic">Generic</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">ID</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Type</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Trigger</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Extra Fields</th>
                <th className="px-4 py-3 text-sm font-semibold text-slate-600">Sampling</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                    <Box size={14} className="text-slate-400" />
                    {event.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(event.category)}`}>
                      {event.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{event.trigger}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                    {event.extraFields.join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{event.samplingRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEvents.length === 0 && (
            <div className="text-center py-10 text-slate-500">No events found matching criteria.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCatalog;
