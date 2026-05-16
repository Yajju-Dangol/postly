import React, { useState, useEffect } from 'react';
import { PostComposer } from '../components/PostComposer';
import { fetchChannels, createPost } from '../api/buffer';
import { ArrowLeft, Zap } from 'lucide-react';

export const Compose = ({ onBack, initialImage }) => {
  const [channels, setChannels] = useState([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setIsLoadingChannels(true);
        const c = await fetchChannels();
        setChannels(c);
      } catch (err) {
        console.error('Compose loadChannels Error:', err);
        setToast(`Connection Error: ${err.message}`);
      } finally {
        setIsLoadingChannels(false);
      }
    };
    loadChannels();
  }, []);

  const handlePost = async (data) => {
    const result = await createPost(data);
    if (result.success) {
      setToast('Post scheduled successfully!');
      setTimeout(() => {
        setToast(null);
        if (onBack) onBack();
      }, 2000);
    } else {
      const msg = result.message || 'Check your Buffer connection';
      setToast(`Error: ${msg}`);
      setTimeout(() => setToast(null), 5000);
    }
    return result;
  };

  return (
    <div className="bg-black min-h-screen text-white pl-[80px]">
      <main className="max-w-[1000px] mx-auto p-8 pt-16">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="p-3 bg-[#050505] border border-border rounded-xl text-text-muted hover:text-white transition-all hover:border-[#333]"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-4xl font-bold tracking-tight">Create Post</h1>
          </div>
          
          <button 
            onClick={() => { localStorage.removeItem('postly_cache_channels'); window.location.reload(); }}
            className="p-3 bg-[#050505] border border-border rounded-xl text-text-muted hover:text-white transition-all hover:border-[#333]"
            title="Refresh Channels"
          >
            <Zap size={18} />
          </button>
        </header>

        <div className="bg-[#0a0a0a] border border-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
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
              initialImageUrl={initialImage}
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
