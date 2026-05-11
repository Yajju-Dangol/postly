import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { generateCodeVerifier, generateCodeChallenge, BUFFER_CONFIG } from '../utils/auth';

export const Login = () => {
  const handleLogin = async () => {
    const verifier = generateCodeVerifier();
    localStorage.setItem('code_verifier', verifier);
    
    const challenge = await generateCodeChallenge(verifier);
    
    const params = new URLSearchParams({
      client_id: BUFFER_CONFIG.clientId,
      redirect_uri: BUFFER_CONFIG.redirectUri,
      response_type: 'code',
      scope: BUFFER_CONFIG.scopes,
      state: Math.random().toString(36).substring(7),
      code_challenge: challenge,
      code_challenge_method: 'S256',
      prompt: 'consent'
    });

    window.location.href = `https://auth.buffer.com/auth?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-white/10">
          <div className="w-10 h-10 bg-black rounded-lg" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Postly Dashboard</h1>
          <p className="text-text-muted text-lg font-light leading-relaxed">
            Minimal social media automation. <br />
            Sign in with your Buffer account to begin.
          </p>
        </div>

        <button 
          onClick={handleLogin}
          className="btn-primary w-full py-5 rounded-2xl text-lg flex items-center justify-center gap-3 group"
        >
          Continue with Buffer
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-center gap-2 text-text-muted text-sm pt-8">
          <ShieldCheck size={16} />
          <span>Secure OAuth 2.0 PKCE Authorization</span>
        </div>
      </div>

      <div className="fixed bottom-8 text-[#1a1a1a] text-sm font-bold tracking-[0.2em] uppercase">
        Built for Speed & Minimalists
      </div>
    </div>
  );
};
