import React, { useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Compose } from './pages/Compose';
import { Studio } from './pages/Studio';
import { BusinessDetails } from './pages/BusinessDetails';
import { ContentCalendar } from './components/ContentCalendar';
import { Sidebar } from './components/Sidebar';
import { BufferConfigOverlay } from './components/BufferConfigOverlay';
import { getTokens, saveTokens } from './utils/auth';
import { useStore } from './store/useStore';
import { useAuthStore } from './store/useAuthStore';
import { Menu, Zap } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading, initSessionListener, setDevBypass } = useAuthStore();
  const activeTab = useStore((state) => state.activeTab);
  const studioImage = useStore((state) => state.studioImage);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const setStudioImage = useStore((state) => state.setStudioImage);
  const showToast = useStore((state) => state.showToast);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. Initialize Supabase Auth listener
    const unsubscribe = initSessionListener();

    // 2. Check for Buffer OAuth callback code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    const handleBufferCallback = async () => {
      if (code) {
        try {
          const verifier = localStorage.getItem('code_verifier');
          const response = await fetch('https://auth.buffer.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: import.meta.env.VITE_BUFFER_CLIENT_ID || '65e72390f77987019e000000',
              grant_type: 'authorization_code',
              code,
              redirect_uri: window.location.origin + '/callback',
              code_verifier: verifier || ''
            }),
          });
          const data = await response.json();
          if (data.access_token) {
            saveTokens(data);
            showToast('Buffer integration connected successfully! 🚀');
            // Clean URL query parameters
            window.history.replaceState({}, document.title, "/");
          }
        } catch (err) {
          console.error('Buffer OAuth failed:', err);
          showToast('Failed to connect Buffer account');
        }
      }
    };

    handleBufferCallback();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-brand-purple rounded-full animate-spin" />
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">PostFlow Securing Session</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  return (
    <div className="bg-black min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/85 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-40 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 transition-all active:scale-95"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white fill-white/10" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">PostFlow</span>
        </div>
        <div className="w-10" /> {/* Spacer to balance the layout */}
      </header>
      
      {activeTab === 'dashboard' ? (
        <>
          <Dashboard />
          <BufferConfigOverlay />
        </>
      ) : activeTab === 'compose' ? (
        <>
          <Compose onBack={() => setActiveTab('dashboard')} />
          <BufferConfigOverlay />
        </>
      ) : activeTab === 'studio' ? (
        <>
          <Studio 
            onBack={() => setActiveTab('dashboard')} 
            onSelectImage={(img) => {
              setStudioImage(img);
              setActiveTab('compose');
            }} 
          />
          <BufferConfigOverlay />
        </>
      ) : activeTab === 'brand' ? (
        <BusinessDetails />
      ) : activeTab === 'calendar' ? (
        <>
          <div className="pl-0 lg:pl-[240px] pt-20 lg:pt-10 min-h-screen bg-black text-white px-4 sm:px-6 lg:pr-10 pb-10 animate-fade-in-up">
            <header className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white">Content Calendar</h2>
              <p className="text-zinc-500 text-xs mt-1">Drag and drop to reschedule posts across your content pipeline.</p>
            </header>
            <ContentCalendar />
          </div>
          <BufferConfigOverlay />
        </>
      ) : (
        <div className="pl-0 lg:pl-[240px] pt-24 lg:pt-10 pb-10 lg:pb-0 text-center text-zinc-500 font-mono text-xs">
          Workspace component not found.
        </div>
      )}
    </div>
  );
}
