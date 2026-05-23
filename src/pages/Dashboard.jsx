import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { useAuthStore } from '../store/useAuthStore';
import { ContentCalendar } from '../components/ContentCalendar';
import {
  Plus,
  Calendar,
  Share2,
  CheckCircle2,
  Clock,
  ChevronDown,
  AlertTriangle,
  Activity,
  Layers,
  Settings,
  RefreshCw,
  Pencil,
  Trash2
} from 'lucide-react';

export function Dashboard() {
  const loadAllData = useStore((state) => state.loadAllData);
  const channels = useStore((state) => state.channels);
  const isLoadingChannels = useStore((state) => state.isLoadingChannels);
  const setActiveTab = useStore((state) => state.setActiveTab);
  
  // Bind calendar store for scheduled posts and error logs
  const posts = useCalendarStore((state) => state.posts);
  const errorLogs = useCalendarStore((state) => state.errorLogs);
  const loadCalendarPosts = useCalendarStore((state) => state.loadCalendarPosts);
  const loadErrorLogs = useCalendarStore((state) => state.loadErrorLogs);
  const deletePost = useCalendarStore((state) => state.deletePost);
  const isLoadingPosts = useCalendarStore((state) => state.isLoading);
  const isLoadingLogs = useCalendarStore((state) => state.isLoadingLogs);

  const setEditingPost = useStore((state) => state.setEditingPost);

  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Load Buffer channels & posts (which updates useStore)
    loadAllData();
    // Load Supabase scheduler posts & error logs
    loadCalendarPosts();
    loadErrorLogs();
  }, []);

  // Filter posts into upcoming scheduled posts
  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled' || p.status === 'queued')
    .slice(0, 3);

  // Scorecards calculation
  const connectedProfilesCount = channels.length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled' || p.status === 'queued').length;
  const executedCount = posts.filter(p => p.status === 'sent').length;
  const failedCount = errorLogs.length;

  const scorecards = [
    { 
      label: 'Connected Profiles', 
      value: connectedProfilesCount, 
      desc: 'Active social channels',
      color: 'from-purple-500/10 to-indigo-500/10 border-brand-purple/10',
      icon: Share2,
      iconColor: 'text-brand-purple'
    },
    { 
      label: 'Scheduled Volume', 
      value: scheduledCount, 
      desc: 'Posts queued in pipeline',
      color: 'from-blue-500/10 to-sky-500/10 border-blue-500/10',
      icon: Clock,
      iconColor: 'text-blue-400'
    },
    { 
      label: 'Executed Queue', 
      value: executedCount, 
      desc: 'Successfully dispatched posts',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/10',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    },
    { 
      label: 'Error Logs Registry', 
      value: failedCount, 
      desc: 'System & posting warnings',
      color: 'from-rose-500/10 to-orange-500/10 border-rose-500/10',
      icon: AlertTriangle,
      iconColor: 'text-rose-400'
    }
  ];

  return (
    <div className="pl-0 lg:pl-[240px] pt-20 lg:pt-10 min-h-screen bg-black text-white px-4 sm:px-6 lg:pr-10 pb-10 animate-fade-in-up">
      
      {/* 1. Welcoming Header Controls */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
            Social Operations Dashboard <Activity className="w-5 h-5 text-brand-purple" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Real-time status of your social channels, queued posts, and automated execution health.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-center">
          {/* Elegant Date Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-950 border border-white/5 hover:bg-zinc-900 transition-all rounded-xl text-xs font-semibold text-zinc-300 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-brand-purple" />
              <span>{dateFilter}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 p-1.5 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl z-20 w-48 animate-fade-in-up">
                  {['Last 7 Days', 'Last 30 Days', 'This Month', 'All Time'].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setDateFilter(f);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={async () => {
              setIsRefreshing(true);
              await loadAllData(true);
              await loadCalendarPosts();
              await loadErrorLogs();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 border border-white/5 hover:bg-zinc-900 transition-all rounded-xl text-xs font-semibold text-zinc-300 cursor-pointer disabled:opacity-50"
            title="Refresh all data from Buffer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-purple ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className="btn-accent gap-2 text-xs py-2.5 px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Post</span>
          </button>
        </div>
      </header>

      {/* 2. Analytical Scorecards Bento Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {scorecards.map((card, i) => {
          const IconComponent = card.icon;
          return (
            <div key={i} className="p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-zinc-950/40 border border-white/5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-brand-purple/20 transition-all duration-300">
              <div className="space-y-1 z-10">
                <span className="text-zinc-500 text-[10px] font-bold tracking-wide uppercase font-mono">{card.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-white">{card.value}</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">{card.desc}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-zinc-900 border border-white/5 ${card.iconColor} z-10 group-hover:scale-105 transition-transform`}>
                <IconComponent className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Scheduler Heatmap & Upcoming Queue / Error Log Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Bento: Posting Activity Heatmap */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Optimal Slots</span>
            <h3 className="text-base font-bold text-white mt-0.5">Posting Activity & Heatmap</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-2 my-4">
            {['Mon', 'Wed', 'Fri', 'Sun'].map((day, dIdx) => (
              <div key={dIdx} className="flex items-center gap-2">
                <span className="w-8 text-[10px] font-mono text-zinc-500 font-medium">{day}</span>
                <div className="flex-1 grid grid-cols-12 gap-1.5">
                  {Array.from({ length: 12 }).map((_, hIdx) => {
                    const intensity = (dIdx * 3 + hIdx * 2) % 4;
                    const colorClass = 
                      intensity === 3 ? 'bg-brand-purple shadow-sm shadow-brand-purple/20' :
                      intensity === 2 ? 'bg-brand-purple/60' :
                      intensity === 1 ? 'bg-brand-purple/25' :
                      'bg-white/5 border border-white/[0.02]';
                    
                    return (
                      <div 
                        key={hIdx} 
                        className={`h-4.5 rounded-md transition-all duration-300 hover:scale-110 cursor-pointer ${colorClass}`}
                        title="Optimal Scheduling Slot"
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono mt-4 pt-2 border-t border-white/5">
            <span>12 AM</span>
            <span>12 PM</span>
            <div className="flex items-center gap-1.5">
              <span>Muted</span>
              <span className="w-2.5 h-2.5 rounded bg-white/5" />
              <span className="w-2.5 h-2.5 rounded bg-brand-purple/25" />
              <span className="w-2.5 h-2.5 rounded bg-brand-purple/60" />
              <span className="w-2.5 h-2.5 rounded bg-brand-purple" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Center Bento: Live Upcoming Scheduled Queue */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Pipeline</span>
              <h3 className="text-base font-bold text-white mt-0.5">Upcoming scheduled</h3>
            </div>
            <button 
              onClick={() => setActiveTab('compose')}
              className="text-[10px] text-brand-purple hover:underline font-mono uppercase tracking-wider flex items-center gap-1"
            >
              Compose <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5 flex-1 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {isLoadingPosts ? (
              <div className="space-y-3">
                {[1, 2].map((k) => (
                  <div key={k} className="h-16 rounded-2xl shimmer-bg" />
                ))}
              </div>
            ) : upcomingPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 h-full border border-dashed border-white/5 rounded-2xl">
                <Clock className="w-8 h-8 text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-500 font-semibold">Queue is empty</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">No posts scheduled. Write one now!</p>
              </div>
            ) : (
          upcomingPosts.map((post) => (
            <div key={post.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 flex flex-col justify-between gap-2.5 hover:border-brand-purple/20 transition-all duration-300">
              <div className="flex justify-between items-start gap-2">
                <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed flex-1 font-medium">{post.text}</p>
                <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/10 px-2 py-0.5 rounded-full capitalize shrink-0">
                  {post.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold font-mono">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(post.scheduled_for).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-brand-purple transition-all cursor-pointer"
                    title="Edit post"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this scheduled post?')) return;
                      const res = await deletePost(post.id);
                      if (res.success) {
                        await loadCalendarPosts();
                        await loadErrorLogs();
                      } else {
                        alert('Delete failed: ' + res.message);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
                    title="Delete post"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
            )}
          </div>
        </div>

        {/* Right Bento: Error Logs Registry */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase font-mono">Warnings</span>
              <h3 className="text-base font-bold text-white mt-0.5">Error Logs Registry</h3>
            </div>
            <button 
              onClick={() => loadErrorLogs()}
              className="text-[10px] text-zinc-400 hover:text-white font-mono uppercase tracking-wider flex items-center gap-1"
            >
              Refresh Logs
            </button>
          </div>

          <div className="space-y-3 flex-1 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {isLoadingLogs ? (
              <div className="space-y-3">
                {[1, 2].map((k) => (
                  <div key={k} className="h-16 rounded-2xl shimmer-bg animate-pulse" />
                ))}
              </div>
            ) : errorLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 h-full border border-dashed border-white/5 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mb-2" />
                <p className="text-xs text-zinc-500 font-semibold">System healthy</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">No warnings or posting errors logged.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {errorLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-zinc-950 border border-rose-950/30 border-l-[3px] border-l-rose-500 flex flex-col justify-between gap-1.5 transition-all">
                    <div>
                      <p className="text-[11px] font-bold text-rose-400 line-clamp-1">{log.summary}</p>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 font-semibold">
                      {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Full-Width Content Calendar */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase font-mono">Schedule</span>
            <h3 className="text-base font-bold text-white mt-0.5">Content Calendar</h3>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-[10px] text-brand-purple hover:underline font-mono uppercase tracking-wider"
          >
            Open Full View →
          </button>
        </div>
        <ContentCalendar />
      </section>

    </div>
  );
}
