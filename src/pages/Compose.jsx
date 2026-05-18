import React, { useEffect } from 'react';
import { PostComposer } from '../components/PostComposer';
import { createPost } from '../api/buffer';
import { ArrowLeft, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';

export const Compose = ({ onBack }) => {
  const channels = useStore((state) => state.channels);
  const isLoadingChannels = useStore((state) => state.isLoadingChannels);
  const toast = useStore((state) => state.toast);
  const showToast = useStore((state) => state.showToast);
  const loadChannels = useStore((state) => state.loadChannels);
  const studioImage = useStore((state) => state.studioImage);

  useEffect(() => {
    if (channels.length === 0) {
      loadChannels();
    }
  }, [channels.length, loadChannels]);

  const handlePost = async (data) => {
    const result = await createPost(data);
    if (result.success) {
      showToast('Post scheduled successfully!', 2000);
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
    } else {
      const msg = result.message || 'Check your Buffer connection';
      showToast(`Error: ${msg}`, 5000);
    }
    return result;
  };

  return (
    <div className="flex min-h-screen bg-black pl-[80px] text-white">
      <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto animate-in fade-in duration-700">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline"
              size="icon"
              onClick={onBack}
              className="bg-[#050505] border-none rounded-xl text-text-muted hover:text-white transition-all hover:bg-[#333]"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-4xl font-bold tracking-tight">Create Post</h1>
          </div>
          
          <Button 
            variant="outline"
            size="icon"
            onClick={() => { localStorage.removeItem('postly_cache_channels'); window.location.reload(); }}
            className="bg-[#050505] border-none rounded-xl text-text-muted hover:text-white transition-all hover:bg-[#333]"
            title="Refresh Channels"
          >
            <Zap size={18} />
          </Button>
        </header>

        <div className="bg-[#050505] border-none rounded-2xl p-12 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          {isLoadingChannels ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-text-muted">Loading your channels...</p>
            </div>
          ) : (
            <PostComposer 
              channels={channels} 
              onPost={handlePost} 
              isFullPage={true} 
              initialImageUrl={studioImage}
            />
          )}
        </div>
      </main>

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
