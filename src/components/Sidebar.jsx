import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, 
  PenSquare, 
  Sparkles, 
  Settings, 
  Layers, 
  Calendar, 
  BarChart3, 
  FolderHeart, 
  Image, 
  Compass, 
  LogOut,
  ChevronDown,
  User,
  Zap
} from 'lucide-react';
import { clearTokens } from '../utils/auth';

export function Sidebar() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const channels = useStore((state) => state.channels);
  const { user, signOut: authSignOut } = useAuthStore();

  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'compose', label: 'Create Post', icon: PenSquare },
    { id: 'posts', label: 'Posts', icon: FolderHeart, badge: 'Soon' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'Soon' },
    { id: 'studio', label: 'Creative Studio', icon: Sparkles, highlight: true },
    { id: 'media', label: 'Media Library', icon: Image, badge: 'Soon' },
    { id: 'integrations', label: 'Integrations', icon: Layers, badge: 'Soon' },
    { id: 'brand', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    clearTokens();
    await authSignOut();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-black border-r border-white/5 flex flex-col justify-between z-50">
      {/* Upper Navigation Section */}
      <div className="flex flex-col flex-1 px-4 pt-6 overflow-y-auto">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 px-3 mb-8 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center shadow-lg shadow-brand-purple/20 group-hover:scale-105 transition-all">
            <Zap className="w-5 h-5 text-white fill-white/10" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white group-hover:text-brand-purple transition-colors">PostFlow</h1>
            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">AUTOMATION</span>
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.badge !== 'Soon') {
                    setActiveTab(item.id);
                  }
                }}
                disabled={item.badge === 'Soon'}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group cursor-pointer ${
                  isActive 
                    ? 'text-white bg-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
                    : item.badge === 'Soon'
                      ? 'text-zinc-600 cursor-not-allowed opacity-60'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-purple" />
                )}
                
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    isActive 
                      ? 'text-brand-purple' 
                      : item.highlight 
                        ? 'text-amber-400' 
                        : 'text-zinc-400 group-hover:text-zinc-200'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[9px] font-semibold font-mono tracking-wider uppercase bg-white/5 border border-white/5 text-zinc-500 px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
                
                {item.highlight && !isActive && (
                  <span className="text-[9px] font-bold tracking-wider uppercase bg-amber-400/10 border border-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded-md animate-pulse">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Integration Connections & Profile Footnote */}
      <div className="p-4 border-t border-white/5 space-y-4 bg-zinc-950/20">
        {/* Connected API Statuses */}
        <div className="space-y-2.5 px-2">
          {/* Buffer Integration */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">Connected via</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-white font-mono uppercase bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded">Buffer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
            </div>
          </div>

          {/* Gemini AI Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">Image Gen</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-white font-mono uppercase bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded">NanoBanana</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
            </div>
          </div>
        </div>

        {/* User Card & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-brand-purple flex items-center justify-center font-semibold text-sm">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.user_metadata?.full_name || 'Developer'}</p>
                <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">{user?.email || 'dev@postly.local'}</p>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Options */}
          {profileOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 rounded-xl bg-zinc-950 border border-white/10 shadow-2xl z-20 animate-fade-in-up">
                <button
                  onClick={() => {
                    setActiveTab('brand');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-left"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>My Brand Profile</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect Account</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
