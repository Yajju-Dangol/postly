import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  brandDetails: {
    name: 'Mountain Peak Co.',
    tagline: 'Elevate Your Journey',
    industry: 'Technology',
    tone: 'Professional and modern',
    colors: ['#001b2a', '#f97316', '#0d1b2a'],
    basePrompt: 'A highly professional, premium image.',
    description: 'We inspire and equip adventurers to explore the world’s most breathtaking places. Quality gear, expert advice.',
    logoUrl: '',
    bufferApiKey: '',
    bufferOrgId: '',
    bufferClientId: '',
    bufferApiUrl: '',
  },
  hasBufferApiKey: false,

  signInWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, isAuthenticated: false });
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  },

  setBrandDetails: async (details) => {
    const user = get().user;
    const updatedDetails = { ...get().brandDetails, ...details };
    
    // Check if Buffer API credentials changed
    const oldDetails = get().brandDetails;
    const credentialsChanged = 
      oldDetails.bufferApiKey !== updatedDetails.bufferApiKey ||
      oldDetails.bufferOrgId !== updatedDetails.bufferOrgId;
    
    // If credentials changed, clear Buffer cache
    if (credentialsChanged && user) {
      const userId = user.id;
      localStorage.removeItem(`postly_cache_${userId}_channels`);
      localStorage.removeItem(`postly_cache_${userId}_posts`);
      console.log('[Buffer Cache] Cleared due to API credential change');
    }
    
    // Update local state immediately
    set({ 
      brandDetails: updatedDetails,
      hasBufferApiKey: Boolean(updatedDetails.bufferApiKey && updatedDetails.bufferOrgId)
    });
    
    // Also save in localStorage as fallback
    localStorage.setItem('postly_brand_details', JSON.stringify(updatedDetails));

    if (user) {
      try {
        const { error } = await supabase
          .from('businesses')
          .upsert({
            user_id: user.id,
            name: updatedDetails.name,
            tagline: updatedDetails.tagline,
            industry: updatedDetails.industry,
            tone: updatedDetails.tone,
            colors: updatedDetails.colors,
            base_prompt: updatedDetails.basePrompt,
            description: updatedDetails.description,
            logo_url: updatedDetails.logoUrl,
            buffer_api_key: updatedDetails.bufferApiKey,
            buffer_org_id: updatedDetails.bufferOrgId,
            buffer_client_id: updatedDetails.bufferClientId,
            buffer_api_url: updatedDetails.bufferApiUrl,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) throw error;
      } catch (err) {
        console.error('Failed to sync brand details to Supabase:', err);
      }
    }
  },

  fetchBrandDetails: async () => {
    const user = get().user;
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const brandDetails = {
          name: data.name || '',
          tagline: data.tagline || '',
          industry: data.industry || 'Technology',
          tone: data.tone || 'Professional and modern',
          colors: data.colors || ['#001b2a', '#f97316', '#0d1b2a'],
          basePrompt: data.base_prompt || 'A highly professional, premium image.',
          description: data.description || '',
          logoUrl: data.logo_url || '',
          bufferApiKey: data.buffer_api_key || '',
          bufferOrgId: data.buffer_org_id || '',
          bufferClientId: data.buffer_client_id || '',
          bufferApiUrl: data.buffer_api_url || '',
        };
        
        set({
          brandDetails,
          hasBufferApiKey: Boolean(brandDetails.bufferApiKey && brandDetails.bufferOrgId)
        });
      }
    } catch (err) {
      console.error('Error fetching brand details:', err);
    }
  },

  initSessionListener: () => {
    // Check current session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        set({ session, user: session.user, isAuthenticated: true, loading: false });
        get().fetchBrandDetails();
      } else {
        // Fallback check: Developer Mode local PAT bypass
        const devBypass = localStorage.getItem('postly_dev_bypass') === 'true';
        if (devBypass) {
          set({ isAuthenticated: true, loading: false });
        } else {
          set({ loading: false });
        }
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ session, user: session.user, isAuthenticated: true, loading: false });
        get().fetchBrandDetails();
      } else {
        const devBypass = localStorage.getItem('postly_dev_bypass') === 'true';
        if (devBypass) {
          set({ isAuthenticated: true, loading: false });
        } else {
          set({ session: null, user: null, isAuthenticated: false, loading: false });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  setDevBypass: (val) => {
    if (val) {
      localStorage.setItem('postly_dev_bypass', 'true');
      set({ isAuthenticated: true });
    } else {
      localStorage.removeItem('postly_dev_bypass');
      set({ isAuthenticated: false });
    }
  }
}));
