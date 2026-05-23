import React from 'react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { Settings } from 'lucide-react';

export const BufferConfigOverlay = () => {
  const setActiveTab = useStore((state) => state.setActiveTab);
  const hasBufferApiKey = useAuthStore((state) => state.hasBufferApiKey);

  // Show overlay only if Buffer API is not configured
  if (hasBufferApiKey) {
    return null; // Don't show overlay if properly configured
  }

  const handleGoToSettings = () => {
    setActiveTab('brand'); // Navigate to brand details/settings page using Zustand
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-2xl max-w-md w-full mx-4">
        <div className="w-16 h-16 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mx-auto" />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Settings className="w-5 h-5 text-brand-purple" />
            API Configuration Required
          </h3>
          <p className="text-zinc-400 text-sm">
            Please configure your Buffer API credentials to access social media features.
          </p>
        </div>
        <button
          onClick={handleGoToSettings}
          className="btn-accent w-full py-3 text-sm font-semibold"
        >
          Configure API Keys
        </button>
        <p className="text-zinc-500 text-xs">
          Add your Buffer API key and Organization ID in settings to continue.
        </p>
      </div>
    </div>
  );
};