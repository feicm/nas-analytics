
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import EventCatalog from './components/EventCatalog';
import ArchitectureView from './components/ArchitectureView';
import TimelineView from './components/TimelineView';
import AIChat from './components/AIChat';
import SDKImplementation from './components/SDKImplementation';
import { Menu } from 'lucide-react';
import { PRD_TITLE, PRD_VERSION, PRD_DATE } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'events': return <EventCatalog />;
      case 'sdk': return <SDKImplementation />;
      case 'architecture': return <ArchitectureView />;
      case 'timeline': return <TimelineView />;
      case 'chat': return <AIChat />;
      default: return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="md:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{PRD_TITLE}</h2>
              <div className="flex gap-3 text-xs text-slate-500 mt-1">
                <span className="bg-slate-100 px-2 py-0.5 rounded">v{PRD_VERSION}</span>
                <span>{PRD_DATE}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">Download PDF</a>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
