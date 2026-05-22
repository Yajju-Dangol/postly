import { create } from 'zustand';
import { fetchChannels, fetchPosts } from '../api/buffer';

export const useStore = create((set, get) => ({
  // Navigation & UI State
  activeTab: 'dashboard',
  setActiveTab: (tab) => {
    if (tab === 'compose') {
      set({ activeTab: tab, studioImage: null });
    } else {
      set({ activeTab: tab });
    }
  },
  
  studioImage: null,
  setStudioImage: (img) => set({ studioImage: img }),

  toast: null,
  showToast: (msg, duration = 3000) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: null }), duration);
  },

  // Auth State
  isAuthenticated: false,
  checkingAuth: true,
  setIsAuthenticated: (val) => set({ isAuthenticated: val }),
  setCheckingAuth: (val) => set({ checkingAuth: val }),

  // Buffer Data State
  channels: [],
  posts: [],
  isLoadingChannels: true,
  isLoadingPosts: true,

  // Brand Details State
  brandDetails: JSON.parse(localStorage.getItem('postly_brand_details')) || {
    logoUrl: '',
    basePrompt: 'A highly professional, premium image.',
    industry: 'Technology',
    tone: 'Professional and modern',
    style: 'Photorealistic, cinematic lighting',
  },
  setBrandDetails: (details) => {
    set((state) => {
      const newDetails = { ...state.brandDetails, ...details };
      localStorage.setItem('postly_brand_details', JSON.stringify(newDetails));
      return { brandDetails: newDetails };
    });
  },

  loadChannels: async (forceRefresh = false) => {
    set({ isLoadingChannels: true });
    try {
      const c = await fetchChannels(undefined, forceRefresh);
      set({ channels: c });
    } catch (err) {
      console.error('loadChannels Error:', err);
      get().showToast(`Connection Error: ${err.message}`);
    } finally {
      set({ isLoadingChannels: false });
    }
  },

  loadPosts: async (forceRefresh = false) => {
    set({ isLoadingPosts: true });
    try {
      const p = await fetchPosts(undefined, forceRefresh);
      set({ posts: p });
    } catch (err) {
      console.error('loadPosts Error:', err);
      get().showToast(`Connection Error: ${err.message}`);
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  loadAllData: async (forceRefresh = false) => {
    set({ isLoadingChannels: true, isLoadingPosts: true });
    try {
      const [c, p] = await Promise.all([
        fetchChannels(undefined, forceRefresh),
        fetchPosts(undefined, forceRefresh)
      ]);
      set({ channels: c, posts: p });
    } catch (err) {
      console.error('loadAllData Error:', err);
      get().showToast(`Connection Error: ${err.message}`);
    } finally {
      set({ isLoadingChannels: false, isLoadingPosts: false });
    }
  },
}));
