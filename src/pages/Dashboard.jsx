import React, { useEffect } from 'react';
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
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';

export const Dashboard = () => {
  const channels = useStore(state => state.channels);
  const posts = useStore(state => state.posts);
  const isLoadingChannels = useStore(state => state.isLoadingChannels);
  const isLoadingPosts = useStore(state => state.isLoadingPosts);
  const loadAllData = useStore(state => state.loadAllData);
  const toast = useStore(state => state.toast);
  const setActiveTab = useStore(state => state.setActiveTab);

  useEffect(() => {
    if (channels.length === 0 || posts.length === 0) {
      loadAllData();
    }
  }, [loadAllData, channels.length, posts.length]);

  if (isLoadingChannels && isLoadingPosts && channels.length === 0 && posts.length === 0) {
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
                <Button variant="ghost" className="header-toggle-btn active text-white hover:text-white hover:bg-white/10 h-8 rounded-full">Weekly</Button>
                <Button variant="ghost" className="header-toggle-btn text-muted-foreground hover:text-white hover:bg-white/10 h-8 rounded-full">Monthly</Button>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => { 
                    localStorage.removeItem('postly_cache_channels'); 
                    localStorage.removeItem('postly_cache_posts'); 
                    window.location.reload(); 
                  }}
                  className="bg-[#050505] rounded-xl text-text-muted hover:text-white transition-all border-none"
                  title="Refresh Data (Clear Cache)"
                >
                  <Zap size={18} />
                </Button>
                <Button variant="outline" size="icon" className="bg-[#050505] border-none rounded-xl text-text-muted hover:text-white transition-all relative">
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full ring-2 ring-black" />
                </Button>
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
                <Button 
                  onClick={() => setActiveTab('compose')}
                  className="flex-1 bg-white text-black h-auto py-8 px-6 rounded-xl flex flex-col items-center justify-center gap-4 hover:scale-[1.02] hover:bg-white transition-all group"
                >
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white group-hover:rotate-90 transition-transform duration-500">
                    <Plus size={32} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">Create New Post</span>
                </Button>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex-1 bg-[#0a0a0a] border-none rounded-xl p-5 flex items-center justify-between group transition-all cursor-pointer">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Queue Health</p>
                      <p className="text-xl font-bold text-white">Stable</p>
                    </div>
                    <Zap size={24} className="text-text-muted group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 bg-[#0a0a0a] border-none rounded-xl p-5 flex items-center justify-between group transition-all cursor-pointer">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Last Sync</p>
                      <p className="text-xl font-bold text-white">Just Now</p>
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
                  <div key={post.id} className="flex items-center justify-between p-4 bg-black border-none rounded-xl group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0a0a0a] border-none flex items-center justify-center text-xs font-bold text-white">
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
                    <div key={channel.id} className="flex items-center gap-3 p-4 bg-black border-none rounded-xl group transition-all">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-white group-hover:bg-white group-hover:text-black transition-colors">
                        {channel.service[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{channel.name}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest">{channel.service}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center flex flex-col items-center gap-3">
                    <Globe size={24} className="text-text-muted opacity-20" />
                    <p className="text-text-muted text-sm italic">No channels connected yet...</p>
                    <Button 
                      variant="link"
                      onClick={() => { localStorage.removeItem('postly_cache_channels'); window.location.reload(); }}
                      className="text-[10px] font-black uppercase tracking-widest text-white hover:underline mt-2 p-0 h-auto"
                    >
                      Retry Connection
                    </Button>
                  </div>
                )}
              </div>
            </BentoItem>
          </BentoGrid>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[200] bg-white text-black px-6 py-4 rounded-xl font-bold shadow-2xl animate-fade-in flex items-center gap-3">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          {toast}
        </div>
      )}
    </div>
  );
};
