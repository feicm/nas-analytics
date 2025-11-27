
import React from 'react';
import { LayoutDashboard, Database, Activity, GitCommit, MessageSquare, Network, Terminal } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'events', label: 'Event Catalog', icon: Database },
    { id: 'sdk', label: 'SDK Implementation', icon: Terminal },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'timeline', label: 'Timeline', icon: GitCommit },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            NAS Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">PRD Viewer v1.0</p>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">MT</div>
            <div>
              <p className="text-sm font-medium">MiroThinker</p>
              <p className="text-xs text-slate-500">Author</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
