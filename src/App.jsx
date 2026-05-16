import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Compose } from './pages/Compose';
import { Studio } from './pages/Studio';
import { Sidebar } from './components/Sidebar';
import { getTokens, saveTokens } from './utils/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studioImage, setStudioImage] = useState(null);

  useEffect(() => {
    // 1. Check for callback code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    const checkAuth = async () => {
      // Check existing tokens
      const tokens = getTokens();
      if (tokens && tokens.expiry > Date.now()) {
        setIsAuthenticated(true);
      } else if (code) {
        // Handle OAuth Callback
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
              code_verifier: verifier
            }),
          });
          const data = await response.json();
          if (data.access_token) {
            saveTokens(data);
            setIsAuthenticated(true);
            // Clean URL
            window.history.replaceState({}, document.title, "/");
          }
        } catch (err) {
          console.error('Auth failed', err);
        }
      } else if (import.meta.env.VITE_BUFFER_API_KEY) {
        // Fallback to PAT for development if provided
        setIsAuthenticated(true);
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  const handleTabChange = (tab) => {
    if (tab === 'compose') {
      setStudioImage(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="bg-black min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      {activeTab === 'dashboard' ? (
        <Dashboard setActiveTab={setActiveTab} />
      ) : activeTab === 'compose' ? (
        <Compose onBack={() => setActiveTab('dashboard')} initialImage={studioImage} />
      ) : activeTab === 'studio' ? (
        <Studio 
          onBack={() => setActiveTab('dashboard')} 
          onSelectImage={(img) => {
            setStudioImage(img);
            setActiveTab('compose');
          }} 
        />
      ) : (
        <div className="pl-[80px] pt-20 text-center text-text-muted">
          Coming Soon...
        </div>
      )}
    </div>
  );
}

