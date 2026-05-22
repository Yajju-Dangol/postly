import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Users, 
  Share2, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export function Dashboard() {
  const loadAllData = useStore((state) => state.loadAllData);
  const channels = useStore((state) => state.channels);
  const posts = useStore((state) => state.posts);
  const isLoadingChannels = useStore((state) => state.isLoadingChannels);
  const isLoadingPosts = useStore((state) => state.isLoadingPosts);
  const setActiveTab = useStore((state) => state.setActiveTab);

  const [dateFilter, setDateFilter] = useState('May 15 – May 21, 2024');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter posts into upcoming scheduled posts
  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled')
    .slice(0, 3);

  // Stats definition matching the design images
  const stats = [
    { 
      label: 'Posts Published', 
      value: posts.filter(p => p.status === 'sent').length + 28, // base offset + actual sent
      change: '+27%', 
      trend: 'up', 
      color: 'from-purple-500/10 to-indigo-500/10 border-brand-purple/10',
      sparkline: [20, 24, 22, 28, 25, 30, 28],
      iconColor: 'text-brand-purple'
    },
    { 
      label: 'Total Impressions', 
      value: '98.4K', 
      change: '+18%', 
      trend: 'up', 
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/10',
      sparkline: [70, 75, 82, 80, 88, 92, 98.4],
      iconColor: 'text-emerald-400'
    },
    { 
      label: 'Engagements', 
      value: '5.3K', 
      change: '+32%', 
      trend: 'up', 
      color: 'from-blue-500/10 to-sky-500/10 border-blue-500/10',
      sparkline: [3.8, 4.1, 4.5, 4.3, 4.8, 5.0, 5.3],
      iconColor: 'text-blue-400'
    },
    { 
      label: 'Link Clicks', 
      value: '1.2K', 
      change: '+21%', 
      trend: 'up', 
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/10',
      sparkline: [0.8, 0.9, 1.1, 1.0, 1.1, 1.2, 1.2],
      iconColor: 'text-amber-400'
    }
  ];

  // Platform Distribution matching the donut chart in design
  const platforms = [
    { name: 'Instagram', value: '4.2K', percentage: '33%', color: '#e1306c' },
    { name: 'Facebook', value: '3.1K', percentage: '25%', color: '#1877f2' },
    { name: 'X / Twitter', value: '2.6K', percentage: '21%', color: '#ffffff' },
    { name: 'LinkedIn', value: '2.3K', percentage: '18%', color: '#0a66c2' }
  ];

  // Performance chart data series
  const chartDays = ['May 15', 'May 16', 'May 17', 'May 18', 'May 19', 'May 20', 'May 21'];
  
  // Hand-drawn premium SVG sparkline helper
  const renderSparkline = (points) => {
    const width = 100;
    const height = 30;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const spread = max - min === 0 ? 1 : max - min;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / spread) * height * 0.8 - 3;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className="w-24 h-10 text-brand-purple shrink-0 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M 0,${height} L ${coords} L ${width},${height} Z`}
          fill="url(#sparklineGrad)"
          className="text-white/10"
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="pl-[240px] min-h-screen bg-black text-white p-10 animate-fade-in-up">
      {/* 1. Welcoming Header Controls */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Good morning, Alex! <span className="animate-bounce text-xl">👋</span>
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Here's what's happening with your content today.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Custom elegant Date Selector */}
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
                        setDateFilter(f === 'Last 7 Days' ? 'May 15 – May 21, 2024' : f);
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
            onClick={() => setActiveTab('compose')}
            className="btn-accent gap-2 text-xs py-2.5 px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Post</span>
          </button>
        </div>
      </header>

      {/* 2. Analytical Widgets Bento Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-brand-purple/20 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-zinc-500 text-[11px] font-semibold tracking-wide uppercase">{stat.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white">{stat.value}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  {stat.change}
                </span>
              </div>
              <p className="text-[10px] text-zinc-600">vs last 7 days</p>
            </div>
            {renderSparkline(stat.sparkline)}
          </div>
        ))}
      </section>

      {/* 3. Performance Chart & Top Performing Posts (Grid layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Large Performance SVG Line Chart Card */}
        <div className="lg:col-span-2 p-8 rounded-[2rem] bg-zinc-950/40 border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Performance Overview</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Impressions, Engagements & Clicks</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-semibold font-mono uppercase text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-purple" /> Impressions</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Engagements</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Clicks</span>
            </div>
          </div>

          {/* SVG Custom Premium Line Chart */}
          <div className="w-full h-[220px] relative overflow-visible mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              
              {/* Day Labels grid line projections */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <line key={i} x1={i * 100} y1="0" x2={i * 100} y2="200" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              ))}

              {/* Path 1: Impressions (Purple) */}
              <path
                d="M 0,120 Q 100,70 200,90 T 400,105 T 600,80"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,120 Q 100,70 200,90 T 400,105 T 600,80 L 600,200 L 0,200 Z"
                fill="url(#purpleGrad)"
              />

              {/* Path 2: Engagements (Blue) */}
              <path
                d="M 0,150 Q 100,130 200,120 T 400,140 T 600,135"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,150 Q 100,130 200,120 T 400,140 T 600,135 L 600,200 L 0,200 Z"
                fill="url(#blueGrad)"
              />

              {/* Path 3: Clicks (Green) */}
              <path
                d="M 0,175 Q 100,165 200,170 T 400,160 T 600,162"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 0,175 Q 100,165 200,170 T 400,160 T 600,162 L 600,200 L 0,200 Z"
                fill="url(#greenGrad)"
              />

              {/* Interactive Point Highlights */}
              <circle cx="100" cy="70" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="300" cy="95" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="500" cy="92" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between mt-2 pt-2 px-1 text-[10px] font-semibold text-zinc-500 font-mono">
            {chartDays.map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>
        </div>

        {/* Top Performing Posts Card */}
        <div className="p-8 rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Leaderboard</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Top Performing Posts</h3>
            </div>
            <button className="text-[10px] text-brand-purple hover:underline font-mono uppercase tracking-wider">View All</button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[220px] pr-1">
            {[
              {
                plat: 'instagram',
                text: 'Small steps every day lead to big results over time. Keep showing up!',
                impressions: '12.4K',
                engagement: '1.2K',
                time: 'May 18, 2024 • 10:00 AM'
              },
              {
                plat: 'facebook',
                text: 'Your future is created by what you do today. Start now.',
                impressions: '9.1K',
                engagement: '980',
                time: 'May 16, 2024 • 9:30 AM'
              },
              {
                plat: 'twitter',
                text: 'Focus on progress, not perfection. Keep pushing forward.',
                impressions: '7.8K',
                engagement: '710',
                time: 'May 17, 2024 • 8:45 AM'
              }
            ].map((post, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                  <span className="text-xs capitalize font-mono text-zinc-400">{post.plat[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white line-clamp-1">{post.text}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{post.time}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono text-zinc-400">
                    <span>Imps: <strong className="text-white">{post.impressions}</strong></span>
                    <span>•</span>
                    <span>Eng: <strong className="text-white">{post.engagement}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Audience demographics, Heatmaps and Queue (Matrix grids) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Followers by Platform & Audience Growth */}
        <div className="p-8 rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Demographics</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Audience Growth</h3>
          </div>

          <div className="flex items-center justify-center py-4 relative">
            {/* Elegant Hand-drawn Donut placeholder */}
            <div className="w-32 h-32 rounded-full border-[10px] border-zinc-900 flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 rounded-full border-[10px] border-brand-purple border-t-transparent border-r-transparent transform rotate-45" />
              <div className="absolute inset-0 rounded-full border-[10px] border-blue-500 border-b-transparent border-l-transparent transform -rotate-12" />
              <div className="text-center">
                <span className="text-xl font-bold text-white">12.6K</span>
                <p className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase mt-0.5">Followers</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            {platforms.map((p, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-zinc-300 truncate">{p.name}</p>
                  <p className="text-xs font-bold text-white font-mono">{p.value} <span className="text-[9px] font-normal text-zinc-500">{p.percentage}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posting Density Heatmap */}
        <div className="p-8 rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Schedules</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Posting Activity Heatmap</h3>
          </div>

          {/* Heatmap Grid Matrix */}
          <div className="flex-1 flex flex-col justify-center space-y-1.5 my-2">
            {['Mon', 'Wed', 'Fri', 'Sun'].map((day, dIdx) => (
              <div key={dIdx} className="flex items-center gap-2">
                <span className="w-8 text-[10px] font-mono text-zinc-500 font-medium">{day}</span>
                <div className="flex-1 grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, hIdx) => {
                    // Seed artificial heat intensity
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
                        title="Optimal Engagement Slot"
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
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded bg-white/5" />
              <span className="w-2.5 h-2.5 rounded bg-brand-purple/25" />
              <span className="w-2.5 h-2.5 rounded bg-brand-purple/60" />
              <span className="w-2.5 h-2.5 rounded bg-brand-purple" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Live Upcoming Scheduled Queue */}
        <div className="p-8 rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">Publish Queue</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Upcoming scheduled</h3>
            </div>
            <button 
              onClick={() => setActiveTab('compose')}
              className="text-[10px] text-brand-purple hover:underline font-mono uppercase tracking-wider flex items-center gap-1"
            >
              Compose <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5 flex-1 max-h-[220px] overflow-y-auto pr-1">
            {isLoadingPosts ? (
              <div className="space-y-3">
                {[1, 2].map((k) => (
                  <div key={k} className="h-16 rounded-2xl shimmer-bg" />
                ))}
              </div>
            ) : upcomingPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 h-full border border-dashed border-white/5 rounded-2xl">
                <Clock className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500 font-semibold">Queue is empty</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">No posts scheduled. Write one now!</p>
              </div>
            ) : (
              upcomingPosts.map((post) => (
                <div key={post.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-2.5 hover:border-brand-purple/20 transition-all duration-300">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed flex-1">{post.text}</p>
                    <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/10 px-2 py-0.5 rounded-full capitalize shrink-0">
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{new Date(post.dueAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(post.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
