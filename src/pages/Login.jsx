import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStore } from '../store/useStore';
import { Zap, Share2, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

export function Login() {
  const { signInWithGoogle, setDevBypass } = useAuthStore();
  const showToast = useStore((state) => state.showToast);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      showToast(`Login failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBypassConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setDevBypass(true);
      setLoading(false);
      showToast('Developer Mode: Session Bypassed! ✨');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Background Neon ambient light nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-glow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] animate-glow pointer-events-none" style={{ animationDelay: '2s' }} />
      
      {/* Matrix dot mesh effect overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Main Glass card container */}
      <div className="w-full max-w-[480px] p-10 rounded-[2.5rem] bg-zinc-950/80 border border-white/5 shadow-2xl relative z-10 text-center glass-panel">
        
        {/* Animated Brand Header */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
            <Zap className="w-7 h-7 text-white fill-white/10" />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome to PostFlow</h2>
        <p className="text-sm text-zinc-400 mb-8">
          The high-end AI social media scheduler. Authenticate to sync branding and schedule dispatches.
        </p>

        {/* Feature grid breakdown inside Login card */}
        <div className="space-y-4 text-left mb-8">
          <div className="flex gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4 text-purple-400" />
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
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                {/* Custom Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </div>
            )}
          </button>

          <button
            onClick={handleBypassConnect}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 border border-white/5 text-zinc-400 text-xs font-medium rounded-2xl hover:text-white hover:bg-white/[0.02] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Developer Mode (Bypass Auth)</span>
          </button>
        </div>

        {/* Footer info badge */}
        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-1 text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
          <span>Secure OAuth encryption active</span>
        </div>
      </div>
    </div>
  );
}
