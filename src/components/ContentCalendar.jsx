import React from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  isToday
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MessageSquare
} from 'lucide-react';
import { useStore } from '../store/useStore';

// Inline SVG brand icons (lucide-react doesn't export brand logos)
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export function ContentCalendar() {
  const posts = useCalendarStore((state) => state.posts);
  const viewMode = useCalendarStore((state) => state.viewMode);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const setViewMode = useCalendarStore((state) => state.setViewMode);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const movePost = useCalendarStore((state) => state.movePost);
  const loadCalendarPosts = useCalendarStore((state) => state.loadCalendarPosts);
  const showToast = useStore((state) => state.showToast);

  const isReschedulingRef = React.useRef(false);

  React.useEffect(() => {
    loadCalendarPosts();
  }, []);

  // Calculate days to display based on viewMode
  const getDays = () => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  };

  const days = getDays();

  // Navigation handlers
  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, postId) => {
    e.dataTransfer.setData('text/plain', postId);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    if (isReschedulingRef.current) return;
    const postId = e.dataTransfer.getData('text/plain');
    if (!postId) return;

    // We keep the original post's time (hours and minutes)
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const originalDate = new Date(post.scheduled_for);
    const newScheduledDate = new Date(targetDate);
    newScheduledDate.setHours(originalDate.getHours());
    newScheduledDate.setMinutes(originalDate.getMinutes());
    newScheduledDate.setSeconds(0);

    isReschedulingRef.current = true;
    try {
      showToast(`Rescheduling post to ${format(newScheduledDate, 'MMM d, yyyy h:mm a')}...`);
      const res = await movePost(postId, newScheduledDate);
      
      if (res.success) {
        showToast('Successfully rescheduled! 🚀');
      } else {
        showToast(`Reschedule failed: ${res.message} ⚠️`);
      }
    } catch (err) {
      console.error(err);
      showToast('An unexpected rescheduling error occurred');
    } finally {
      isReschedulingRef.current = false;
    }
  };

  // Render platform mini icon
  const renderChannelIcon = (channelType) => {
    const iconClass = "w-3 h-3";
    switch (channelType?.toLowerCase()) {
      case 'instagram':
        return <InstagramIcon className={`${iconClass} text-pink-500`} />;
      case 'linkedin':
        return <LinkedinIcon className={`${iconClass} text-blue-500`} />;
      case 'twitter':
      case 'x':
        return <TwitterIcon className={`${iconClass} text-zinc-100`} />;
      case 'facebook':
        return <FacebookIcon className={`${iconClass} text-blue-600`} />;
      default:
        return <MessageSquare className={`${iconClass} text-zinc-400`} />;
    }
  };

  return (
    <div className="w-full rounded-[2.5rem] bg-zinc-950/60 border border-white/5 p-8 flex flex-col shadow-2xl glass-panel relative overflow-hidden">
      
      {/* Glow highlight node */}
      <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-brand-purple/5 blur-[100px] pointer-events-none" />

      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'w, MMMM yyyy')}
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold font-mono uppercase tracking-wider">Content Schedule Matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle Month / Week view */}
          <div className="flex bg-black p-0.5 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-zinc-900 text-white border border-white/5' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-zinc-900 text-white border border-white/5' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              className="p-2 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/5 text-xs font-semibold hover:bg-zinc-800 text-white transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1 font-mono">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid Matrix */}
      <div className={`grid grid-cols-7 gap-2.5 flex-1 min-h-[380px]`}>
        {days.map((day, idx) => {
          const dayPosts = posts.filter(post => isSameDay(new Date(post.scheduled_for), day));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isT = isToday(day);

          return (
            <div
              key={idx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={`rounded-2xl border min-h-[90px] p-2 flex flex-col justify-between transition-all relative ${
                isT 
                  ? 'bg-brand-purple/5 border-brand-purple/20' 
                  : isCurrentMonth
                    ? 'bg-zinc-900/30 border-white/[0.03] hover:border-white/10'
                    : 'bg-zinc-950/20 border-transparent text-zinc-700 opacity-40'
              }`}
            >
              {/* Day Number Label */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold font-mono ${
                  isT 
                    ? 'text-brand-purple' 
                    : isCurrentMonth ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {format(day, 'd')}
                </span>
                {isT && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-ping" />
                )}
              </div>

              {/* Day Post Cards list */}
              <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[140px] custom-scrollbar">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, post.id)}
                    onDragEnd={handleDragEnd}
                    className="p-2 rounded-xl bg-zinc-950 border border-white/5 hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing text-left space-y-1.5 group select-none shadow-lg relative"
                    title={post.text}
                  >
                    {/* Caption preview snippet */}
                    <p className="text-[10px] font-medium text-zinc-300 line-clamp-2 leading-normal">
                      {post.text}
                    </p>

                    {/* Footer Info Row */}
                    <div className="flex items-center justify-between border-t border-white/[0.02] pt-1">
                      <div className="flex items-center gap-1">
                        {post.channel_ids?.map((cid, i) => (
                          <span key={i} className="opacity-80">
                            {renderChannelIcon(post.channel_service || (post.is_buffer_only ? 'buffer' : 'social'))}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-0.5 text-[8px] font-semibold text-zinc-500 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{format(new Date(post.scheduled_for), 'h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
