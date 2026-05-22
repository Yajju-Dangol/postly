import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';
import { updatePost as updateBufferPost, fetchPosts as fetchBufferPosts } from '../api/buffer';

const parseBufferDate = (dueAt) => {
  if (!dueAt) return new Date().toISOString();
  const numeric = Number(dueAt);
  if (!isNaN(numeric) && String(dueAt).trim() !== '') {
    if (numeric < 10000000000) {
      return new Date(numeric * 1000).toISOString();
    }
    return new Date(numeric).toISOString();
  }
  const d = new Date(dueAt);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }
  return new Date().toISOString();
};

export const useCalendarStore = create((set, get) => ({
  posts: [],
  errorLogs: [],
  isLoading: false,
  isLoadingLogs: false,
  viewMode: 'month', // 'month' | 'week'
  currentDate: new Date(),

  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentDate: (currentDate) => set({ currentDate }),

  loadErrorLogs: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      // Offline fallback mock errors
      set({ errorLogs: [
        { id: '1', summary: 'Buffer rate limit 429 triggered', details: 'Daily posting quota exceeded.', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', summary: 'Cloudinary upload timeout', details: 'Network latency during asset upload.', timestamp: new Date(Date.now() - 7200000).toISOString() }
      ]});
      return;
    }
    set({ isLoadingLogs: true });
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);
      if (error) throw error;
      set({ errorLogs: data || [] });
    } catch (err) {
      console.error('Failed to load error logs:', err);
    } finally {
      set({ isLoadingLogs: false });
    }
  },


  loadCalendarPosts: async () => {
    set({ isLoading: true });
    const user = useAuthStore.getState().user;
    
    try {
      let dbPosts = [];
      if (user) {
        const { data, error } = await supabase
          .from('automated_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_for', { ascending: true });

        if (error) throw error;
        dbPosts = data || [];
      }

      // Fallback/merge: If no database posts, or for local testing fallback, we can also load from Buffer
      // We will map Buffer posts to match the automated_posts structure
      let bufferPostsMapped = [];
      try {
        const bufferPosts = await fetchBufferPosts();
        bufferPostsMapped = (bufferPosts || []).map(bp => ({
          id: bp.id,
          is_buffer_only: true, // Mark so we know it's not in our DB
          text: bp.text,
          scheduled_for: parseBufferDate(bp.dueAt),
          status: bp.status === 'scheduled' ? 'queued' : bp.status,
          media_url: bp.assets?.[0]?.url || bp.assets?.[0]?.mimeType || '',
          buffer_post_id: bp.id,
          channel_ids: [bp.channelId],
        }));
      } catch (err) {
        console.warn('Failed to load Buffer posts:', err);
      }

      // Merge: unique by ID, preferring DB posts
      const mergedPosts = [...dbPosts];
      bufferPostsMapped.forEach(bp => {
        if (!mergedPosts.some(p => p.buffer_post_id === bp.id || p.id === bp.id)) {
          mergedPosts.push(bp);
        }
      });

      set({ posts: mergedPosts });
    } catch (err) {
      console.error('Error loading calendar posts:', err);
      // Fallback to local storage if user is offline or database isn't fully set up yet
      const fallback = JSON.parse(localStorage.getItem('postly_offline_posts')) || [];
      set({ posts: fallback });
    } finally {
      set({ isLoading: false });
    }
  },

  movePost: async (postId, newDate) => {
    const user = useAuthStore.getState().user;
    const posts = get().posts;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return { success: false, message: 'Post not found' };
    
    const post = posts[postIndex];
    const originalDate = post.scheduled_for;
    const newDateStr = newDate.toISOString();

    // 1. Reactive UI update (Optimistic UI update)
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = { ...post, scheduled_for: newDateStr };
    set({ posts: updatedPosts });

    try {
      // 2. Update local DB (Supabase)
      if (user && !post.is_buffer_only) {
        const { error } = await supabase
          .from('automated_posts')
          .update({ scheduled_for: newDateStr })
          .eq('id', postId);

        if (error) throw error;
      }

      // 3. Update Buffer scheduling if it's already queued in Buffer
      if (post.buffer_post_id) {
        const res = await updateBufferPost({
          id: post.buffer_post_id,
          dueAt: newDateStr
        });

        if (res.error) {
          throw new Error(`Buffer API update failed: ${res.message}`);
        }
      }

      // Save offline fallback cache
      localStorage.setItem('postly_offline_posts', JSON.stringify(updatedPosts));
      return { success: true };
    } catch (err) {
      console.error('Failed to move post:', err);
      
      // Rollback optimistic update
      const rolledBackPosts = [...posts];
      rolledBackPosts[postIndex] = { ...post, scheduled_for: originalDate };
      set({ posts: rolledBackPosts });
      
      // Log to Supabase error_logs table if user is active
      if (user) {
        try {
          await supabase.from('error_logs').insert({
            user_id: user.id,
            summary: `Rescheduling failed for post ${postId}`,
            details: err.message,
            timestamp: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error('Failed to log rescheduling error to DB:', dbErr);
        }
      }

      return { success: false, message: err.message };
    }
  },

  createAutomatedPost: async (newPost) => {
    const user = useAuthStore.getState().user;
    const posts = get().posts;

    try {
      let createdPost = { ...newPost };
      
      if (user) {
        const { data, error } = await supabase
          .from('automated_posts')
          .insert({
            user_id: user.id,
            text: newPost.text,
            scheduled_for: newPost.scheduled_for,
            status: newPost.status || 'ready_to_schedule',
            media_url: newPost.media_url || '',
            channel_ids: newPost.channel_ids || [],
            buffer_post_id: newPost.buffer_post_id || null,
          })
          .select()
          .single();

        if (error) throw error;
        createdPost = data;
      } else {
        // Mock ID for development bypass
        createdPost.id = `local_${Date.now()}`;
      }

      const updated = [...posts, createdPost];
      set({ posts: updated });
      localStorage.setItem('postly_offline_posts', JSON.stringify(updated));
      return { success: true, post: createdPost };
    } catch (err) {
      console.error('Failed to create automated post:', err);
      return { success: false, message: err.message };
    }
  }
}));
