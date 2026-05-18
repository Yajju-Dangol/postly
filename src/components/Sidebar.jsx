import React from 'react';
import { LayoutDashboard, PlusCircle, Sparkles, Lightbulb, Building2, Settings, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Sidebar = () => {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);

  const items = [
    { id: 'dashboard', icon: LayoutDashboard },
    { id: 'compose', icon: PlusCircle },
    { id: 'studio', icon: Sparkles },
    { id: 'ideas', icon: Lightbulb },
    { id: 'brand', icon: Building2 },
  ];

  return (
    <aside className="w-[80px] h-screen bg-[#0a0a0a] border-none flex flex-col items-center py-8 fixed left-0 top-0 z-[100] shadow-2xl">
      {/* Brand Logo - Blended */}
      <div className="w-12 h-12 flex items-center justify-center mb-10 flex-shrink-0 group cursor-pointer bg-transparent">
        <div className="w-10 h-10 bg-transparent border-none rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-white/5">
          <div className="w-4 h-4 border-none bg-white/20 group-hover:bg-white rounded-sm transition-all duration-500" />
        </div>
      </div>

      {/* Navigation - Blended */}
      <nav className="flex-1 flex flex-col gap-4 w-full items-center bg-transparent">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="group relative p-3.5 transition-all duration-300 outline-none bg-transparent hover:bg-transparent border-none"
            >
              {/* Active Indicator */}
              <div className={`absolute left-[-16px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/60 rounded-r-full transition-all duration-500 ${
                isActive ? 'opacity-100 translate-x-0 scale-y-100' : 'opacity-0 -translate-x-4 scale-y-0'
              }`} />
              
              <item.icon 
                size={22} 
                className={`transition-all duration-300 bg-transparent ${
                  isActive 
                    ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' 
                    : 'text-white/20 group-hover:text-white/60'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions - Blended */}
      <div className="flex flex-col gap-4 mt-auto flex-shrink-0 pb-6 bg-transparent">
        <button className="group p-3.5 outline-none bg-transparent hover:bg-transparent border-none">
          <Settings size={22} className="text-white/20 group-hover:text-white transition-colors duration-300 bg-transparent" />
        </button>
        <button className="group p-3.5 outline-none bg-transparent hover:bg-transparent border-none">
          <LogOut size={22} className="text-white/20 group-hover:text-red-500 transition-colors duration-300 bg-transparent" />
        </button>
      </div>
    </aside>
  );
};
