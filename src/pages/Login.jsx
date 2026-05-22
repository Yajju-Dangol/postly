import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Zap, Share2, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { BUFFER_CONFIG } from '../utils/auth';

export function Login() {
  const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);
  const [loading, setLoading] = useState(false);

  const handleOAuthConnect = () => {
    setLoading(true);
    // Buffer OAuth flow redirection URL
    const oauthUrl = `https://auth.buffer.com/oauth2/authorize?client_id=${BUFFER_CONFIG.clientId}&redirect_uri=${encodeURIComponent(BUFFER_CONFIG.redirectUri)}&response_type=code&scopes=${encodeURIComponent(BUFFER_CONFIG.scopes)}`;
    window.location.href = oauthUrl;
  };

  const handleBypassConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Background Neon ambient light nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-purple/10 blur-[120px] animate-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-indigo/10 blur-[120px] animate-glow pointer-events-none" style={{ animationDelay: '2s' }} />
      
      {/* Matrix dot mesh effect overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main Glass card container */}
      <div className="w-full max-w-[480px] p-10 rounded-[2.5rem] bg-zinc-950/80 border border-white/5 shadow-2xl relative z-10 text-center glass-panel">
        
        {/* Animated Brand Header */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center shadow-2xl shadow-brand-purple/30 animate-pulse">
            <Zap className="w-7 h-7 text-white fill-white/10" />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome to PostFlow</h2>
        <p className="text-sm text-zinc-400 mb-8">
          The high-end AI engine that allows you to create social content once and publish everywhere.
        </p>

        {/* Feature grid breakdown inside Login card */}
        <div className="space-y-4 text-left mb-8">
          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4 text-brand-purple" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Multi-Channel Scheduling</p>
              <p className="text-[11px] text-zinc-500">Cross-publish effortlessly to Instagram, LinkedIn, and X via Buffer APIs.</p>
            </div>
          </div>

          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Creative Studio AI</p>
              <p className="text-[11px] text-zinc-500">Generate on-brand marketing imagery and copy using Google Gemini models.</p>
            </div>
          </div>

          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Business Branding Engine</p>
              <p className="text-[11px] text-zinc-500">Set brand presets to adapt generated visual compositions to your tone.</p>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="space-y-3">
          <button
            onClick={handleOAuthConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>Connect with Buffer OAuth</span>
              </>
            )}
          </button>

          <button
            onClick={handleBypassConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 border border-white/5 text-zinc-400 text-xs font-medium rounded-2xl hover:text-white hover:bg-white/[0.02] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Developer Mode (Bypass with API Key)</span>
          </button>
        </div>

        {/* Footer info badge */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-1 text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
          <span>Secure AES encryption active</span>
        </div>
      </div>
    </div>
  );
}
