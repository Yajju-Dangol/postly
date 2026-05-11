import React from 'react';
import { LayoutDashboard, PlusCircle, Calendar, Lightbulb, Users, Settings, LogOut } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard },
    { id: 'compose', icon: PlusCircle },
    { id: 'queue', icon: Calendar },
    { id: 'ideas', icon: Lightbulb },
    { id: 'channels', icon: Users },
  ];

  return (
    <aside className="w-[80px] h-screen bg-black border-r border-border flex flex-col items-center py-8 fixed left-0 top-0 z-[100]">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-12 flex-shrink-0">
        <div className="w-5 h-5 bg-black rounded-sm" />
      </div>

      <nav className="flex-1 flex flex-col gap-6 w-full items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-white text-black shadow-lg shadow-white/10' 
                : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-6 mt-auto flex-shrink-0">
        <button className="p-3 text-text-muted hover:text-white transition-colors">
          <Settings size={20} />
        </button>
        <button className="p-3 text-text-muted hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};
