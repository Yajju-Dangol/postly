import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MessageSquare, 
  Share2, 
  Zap, 
  Bell, 
  Plus,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import { BentoGrid, BentoItem } from '../components/BentoGrid';
import { StatsCard } from '../components/StatsCard';
import { fetchChannels, fetchPosts } from '../api/buffer';

export const Dashboard = ({ setActiveTab }) => {
  const [channels, setChannels] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingChannels(true);
        const [c, p] = await Promise.all([fetchChannels(), fetchPosts()]);
        setChannels(c);
        setPosts(p);
      } catch (err) {
        console.error('Dashboard loadData Error:', err);
        setToast(`Connection Error: ${err.message}`);
      } finally {
        setLoading(false);
        setIsLoadingChannels(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="pl-[80px] min-h-screen flex flex-col">
        <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto">
          <header className="flex justify-between items-center mb-12 px-4">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
              <div className="hidden md:flex header-toggle-container shadow-inner">
                <button className="header-toggle-btn active">Weekly</button>
                <button className="header-toggle-btn">Monthly</button>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex gap-2">
                <button 
                  onClick={() => { 
                    localStorage.removeItem('postly_cache_channels'); 
                    localStorage.removeItem('postly_cache_posts'); 
                    window.location.reload(); 
                  }}
                  className="p-3 bg-[#050505] border border-border rounded-xl text-text-muted hover:text-white transition-all hover:border-[#333]"
                  title="Refresh Data (Clear Cache)"
                >
                  <Zap size={18} />
                </button>
                <button className="p-3 bg-[#050505] border border-border rounded-xl text-text-muted hover:text-white transition-all hover:border-[#333] relative">
                  <Bell size={18} />
                  <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-white rounded-full ring-2 ring-black" />
                </button>
              </div>
              <div className="h-10 w-[1px] bg-border mx-1" />
              <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-sm shadow-xl shadow-white/5">
                  JS
                </div>
              </div>
            </div>
          </header>

          <BentoGrid>
            {/* Main Action Area */}
            <BentoItem className="span-2" title="Quick Actions">
              <div className="flex gap-4 h-full">
                <button 
                  onClick={() => setActiveTab('compose')}
                  className="flex-1 bg-white text-black p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:scale-[1.02] transition-all group"
                >
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white group-hover:rotate-90 transition-transform duration-500">
                    <Plus size={32} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">Create New Post</span>
                </button>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex-1 bg-[#0a0a0a] border border-border rounded-[2.5rem] p-6 flex items-center justify-between group hover:border-[#333] transition-all cursor-pointer">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Queue Health</p>
                      <p className="text-xl font-bold">Stable</p>
                    </div>
                    <Zap size={24} className="text-text-muted group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 bg-[#0a0a0a] border border-border rounded-[2.5rem] p-6 flex items-center justify-between group hover:border-[#333] transition-all cursor-pointer">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Last Sync</p>
                      <p className="text-xl font-bold">Just Now</p>
                    </div>
                    <Globe size={24} className="text-text-muted group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </BentoItem>

            {/* Stats Section */}
            <BentoItem className="span-1">
              <StatsCard 
                label="Total Engagement" 
                value="24.8k" 
                trend="+12%" 
                icon={TrendingUp} 
              />
            </BentoItem>

            <BentoItem className="span-1">
              <StatsCard 
                label="Scheduled" 
                value={posts.length} 
                icon={MessageSquare} 
              />
            </BentoItem>

            <BentoItem className="span-1">
              <StatsCard 
                label="Active Channels" 
                value={channels.length} 
                icon={Share2} 
              />
            </BentoItem>

            <BentoItem className="span-1">
              <StatsCard 
                label="Reach" 
                value="156k" 
                trend="+4.2%" 
                icon={Zap} 
              />
            </BentoItem>

            {/* Detailed Lists */}
            <BentoItem className="span-2" title="Upcoming Queue">
              <div className="space-y-4">
                {posts.slice(0, 3).map(post => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-black border border-border rounded-2xl group hover:border-[#333] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] border border-border flex items-center justify-center text-xs font-bold">
                        {new Date(post.dueAt).getDate()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white line-clamp-1">{post.text}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
                          {new Date(post.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
                {posts.length === 0 && <p className="text-text-muted text-sm italic py-4">No posts in queue...</p>}
              </div>
            </BentoItem>

            <BentoItem className="span-2" title="Social Channels">
              <div className="grid grid-cols-2 gap-4">
                {isLoadingChannels ? (
                  <div className="col-span-2 py-8 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fetching Social Accounts...</p>
                  </div>
                ) : channels.length > 0 ? (
                  channels.map(channel => (
                    <div key={channel.id} className="flex items-center gap-3 p-4 bg-black border border-border rounded-2xl group hover:border-[#333] transition-all">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs group-hover:bg-white group-hover:text-black transition-colors">
                        {channel.service[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{channel.name}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest">{channel.service}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center flex flex-col items-center gap-3">
                    <Globe size={24} className="text-text-muted opacity-20" />
                    <p className="text-text-muted text-sm italic">No channels connected yet...</p>
                    <button 
                      onClick={() => { localStorage.removeItem('postly_cache_channels'); window.location.reload(); }}
                      className="text-[10px] font-black uppercase tracking-widest text-white hover:underline mt-2"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}
              </div>
            </BentoItem>
          </BentoGrid>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[200] bg-white text-black px-6 py-4 rounded-2xl font-bold shadow-2xl animate-fade-in flex items-center gap-3">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          {toast}
        </div>
      )}
    </div>
  );
};
