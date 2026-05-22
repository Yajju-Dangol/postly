import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  PlusCircle, 
  Check, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Maximize2,
  Trash2,
  Paperclip
} from 'lucide-react';
import { publishPostWorkflow } from '../api/publishWorkflow';
import { generateImage } from '../api/gemini';
import { GoogleGenAI } from "@google/genai";

export function Compose({ onBack }) {
  const channels = useStore((state) => state.channels);
  const loadChannels = useStore((state) => state.loadChannels);
  const isLoadingChannels = useStore((state) => state.isLoadingChannels);
  const showToast = useStore((state) => state.showToast);
  const studioImage = useStore((state) => state.studioImage);
  const setStudioImage = useStore((state) => state.setStudioImage);

  // States
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [mediaTab, setMediaTab] = useState('upload'); // 'upload' | 'generate'
  
  // Media states
  const [imageUrl, setImageUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const fileInputRef = useRef(null);

  // AI Image generation states
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1 (Square)');
  const [stylePreset, setStylePreset] = useState('Photorealistic');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedBase64, setGeneratedBase64] = useState('');

  // AI Caption Enhancer states
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isEnhancingCaption, setIsEnhancingCaption] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // Scheduling states
  const [scheduleMode, setScheduleMode] = useState('queue'); // 'queue' | 'later'
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  
  // Concurrency Guard
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Previews active tab
  const [previewTab, setPreviewTab] = useState('instagram');

  useEffect(() => {
    loadChannels();
    // Check if an image was passed from Creative Studio
    if (studioImage) {
      setImageUrl(studioImage);
      setMediaTab('upload');
    }
  }, [studioImage]);

  // Handle auto-selecting first channel
  useEffect(() => {
    if (channels.length > 0 && selectedChannels.length === 0) {
      setSelectedChannels([channels[0].id]);
      setPreviewTab(channels[0].service);
    }
  }, [channels]);

  // Select all channels helper
  const handleSelectAll = () => {
    if (selectedChannels.length === channels.length) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(channels.map(c => c.id));
    }
  };

  const handleChannelToggle = (id) => {
    if (selectedChannels.includes(id)) {
      setSelectedChannels(selectedChannels.filter(c => c !== id));
    } else {
      setSelectedChannels([...selectedChannels, id]);
    }
  };

  // Upload file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Gemini Image Generator
  const handleImageGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Please enter an image prompt first');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const base64 = await generateImage(prompt, {
        aspectRatio,
        style: stylePreset
      });
      setGeneratedBase64(base64);
      showToast('Image generated successfully! Click "Use Image" to attach.');
    } catch (err) {
      console.error(err);
      showToast(`Generation failed: ${err.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Use the generated AI Image in the post
  const handleUseGeneratedImage = () => {
    if (generatedBase64) {
      const dataUrl = `data:image/png;base64,${generatedBase64}`;
      setImageUrl(dataUrl);
      // Convert base64 to a raw file blob so Cloudinary can upload it
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "ai_generated.png", { type: "image/png" });
          setRawFile(file);
        });
      setGeneratedBase64('');
      showToast('AI Image attached to composer.');
    }
  };

  // Trigger Gemini Caption Enhancer
  const handleEnhanceCaption = async () => {
    if (!text.trim()) {
      showToast('Please type a caption draft first');
      return;
    }

    setIsEnhancingCaption(true);
    setSuggestionsOpen(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing');

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a social media copywriting expert. Based on this draft caption: "${text}", generate exactly 3 creative, engaging, and high-impact alternative social media captions. Make them highly sleek, add appropriate emojis, and list 3-5 hyper-relevant hashtags at the end of each. Separate options with "---".`
      });

      const generatedText = response.text || '';
      const parts = generatedText.split('---').map(p => p.trim()).filter(p => p.length > 0);
      setAiSuggestions(parts.slice(0, 3));
    } catch (err) {
      console.error(err);
      showToast('Caption generation failed. Check connection.');
      setSuggestionsOpen(false);
    } finally {
      setIsEnhancingCaption(false);
    }
  };

  // Post Submission Pipeline
  const handlePublish = async () => {
    if (!text.trim()) {
      showToast('Draft caption cannot be empty');
      return;
    }
    if (selectedChannels.length === 0) {
      showToast('Please select at least one channel');
      return;
    }
    if (scheduleMode === 'later' && (!scheduleDate || !scheduleTime)) {
      showToast('Please specify a date and time to schedule');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalDate = new Date();
      if (scheduleMode === 'later') {
        finalDate = new Date(`${scheduleDate}T${scheduleTime}`);
      }

      showToast('Uploading assets and scheduling. Please wait...');
      
      const result = await publishPostWorkflow({
        text,
        selectedChannels,
        channels,
        scheduleMode,
        startDate: finalDate,
        imageUrl,
        rawFile
      });

      if (result.success) {
        showToast('Success! Post scheduled successfully.');
        setStudioImage(null);
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        showToast(`Post failed: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to map platform icons
  const getPlatformIcon = (service) => {
    const iconClass = "w-5 h-5";
    switch (service) {
      case 'instagram': 
        return (
          <svg className={`${iconClass} text-pink-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        );
      case 'facebook': 
        return (
          <svg className={`${iconClass} text-blue-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        );
      case 'twitter': 
        return (
          <svg className={`${iconClass} text-zinc-100`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        );
      case 'linkedin': 
        return (
          <svg className={`${iconClass} text-blue-600`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        );
      default: return <Plus className="w-5 h-5" />;
    }
  };

  return (
    <div className="pl-[240px] min-h-screen bg-black text-white p-10 flex flex-col justify-between relative">
      
      {/* Dynamic Submitting Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-brand-purple rounded-full animate-spin" />
          <h3 className="text-lg font-bold text-white tracking-wide">Processing Pipeline...</h3>
          <p className="text-zinc-500 text-xs font-medium">Sequential rate guard and secure asset signing active.</p>
        </div>
      )}

      {/* Header title */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Post</h2>
          <p className="text-zinc-500 text-xs mt-1">Compose, customize, and schedule your post across multiple platforms.</p>
        </div>
        <button
          onClick={onBack}
          className="btn-premium py-2 px-4 text-xs font-semibold text-zinc-400 border border-white/5 hover:text-white"
        >
          Cancel
        </button>
      </header>

      {/* Main Composer Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
        
        {/* LEFT COLUMN: Workspace editor (span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. SELECT PLATFORMS */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">1. Select Platforms</span>
              <button 
                onClick={handleSelectAll}
                className="text-[10px] text-brand-purple font-semibold hover:underline cursor-pointer font-mono"
              >
                {selectedChannels.length === channels.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {isLoadingChannels ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
                {[1, 2, 3].map(k => (
                  <div key={k} className="h-14 rounded-xl bg-white/5" />
                ))}
              </div>
            ) : channels.length === 0 ? (
              <div className="p-4 border border-dashed border-white/5 rounded-xl text-center text-zinc-500 text-xs">
                No profiles loaded. Connect your social channels in Settings.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {channels.map((chan) => {
                  const isSel = selectedChannels.includes(chan.id);
                  return (
                    <button
                      key={chan.id}
                      onClick={() => handleChannelToggle(chan.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSel 
                          ? 'bg-brand-purple/10 border-brand-purple shadow-md shadow-brand-purple/5' 
                          : 'bg-zinc-950 border-white/5 hover:border-zinc-800'
                      }`}
                    >
                      <div className="shrink-0 relative">
                        {getPlatformIcon(chan.service)}
                        {isSel && (
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-brand-purple flex items-center justify-center border border-black shadow">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{chan.name}</p>
                        <p className="text-[9px] text-zinc-500 capitalize">{chan.service}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. CONTENT & AI HELPER */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">2. Content Draft</span>
              <span className="text-[10px] text-zinc-500 font-semibold font-mono tracking-wider">
                {text.length} / 2200
              </span>
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your caption draft here... Add emojis, slogans, or copy templates."
                className="w-full min-h-[140px] bg-zinc-950 border border-white/5 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-brand-purple transition-colors resize-none placeholder-zinc-600 leading-relaxed"
                maxLength={2200}
              />
              
              {/* Bottom utilities icons */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleEnhanceCaption}
                  disabled={isEnhancingCaption || !text}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/5 hover:border-brand-purple hover:text-brand-purple transition-all text-[10px] font-semibold text-zinc-400 cursor-pointer disabled:opacity-50"
                  title="Enhance Draft with Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEnhancingCaption ? 'Enhancing...' : 'Enhance Draft'}</span>
                </button>
              </div>
            </div>

            {/* AI Caption suggestions dropdown */}
            {suggestionsOpen && (
              <div className="mt-4 p-4 rounded-2xl bg-zinc-950/80 border border-brand-purple/20 space-y-3.5 animate-fade-in-up">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5 text-brand-purple text-xs font-bold font-mono">
                    <Sparkles className="w-3.5 h-3.5 fill-brand-purple/10" />
                    <span>GEMINI COPYWRITING ASSISTANT</span>
                  </div>
                  <button 
                    onClick={() => setSuggestionsOpen(false)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>

                {isEnhancingCaption ? (
                  <div className="space-y-2 py-4">
                    <div className="h-4 rounded bg-white/5 shimmer-bg w-[90%]" />
                    <div className="h-4 rounded bg-white/5 shimmer-bg w-[75%]" />
                    <div className="h-4 rounded bg-white/5 shimmer-bg w-[85%]" />
                  </div>
                ) : aiSuggestions.length === 0 ? (
                  <div className="text-center py-4 text-xs text-zinc-500 font-semibold flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed to generate variations. Try again.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-brand-purple/30 hover:bg-white/[0.02] transition-all cursor-pointer group relative"
                        onClick={() => {
                          setText(suggestion);
                          setSuggestionsOpen(false);
                          showToast(`Applied Option #${idx + 1}`);
                        }}
                      >
                        <span className="absolute top-2.5 right-2.5 text-[8px] font-bold font-mono text-zinc-600 bg-white/5 px-1 py-0.5 rounded uppercase tracking-wider">Option {idx + 1}</span>
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium pr-10">{suggestion}</p>
                        <p className="text-[9px] text-brand-purple font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to Apply Draft</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. MEDIA PIPELINE */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">3. Media Pipeline</span>
              <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-white/5">
                <button
                  onClick={() => setMediaTab('upload')}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                    mediaTab === 'upload' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Local Upload
                </button>
                <button
                  onClick={() => setMediaTab('generate')}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    mediaTab === 'generate' ? 'bg-brand-purple/10 text-brand-purple' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate with AI</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: LOCAL UPLOAD */}
            {mediaTab === 'upload' && (
              <div className="space-y-4">
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 group">
                    <img 
                      src={imageUrl} 
                      alt="Selected preview" 
                      className="w-full max-h-[220px] object-contain mx-auto" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-premium py-2 px-3.5 text-xs font-bold bg-white text-black hover:bg-zinc-200"
                      >
                        Change Image
                      </button>
                      <button
                        onClick={() => {
                          setImageUrl('');
                          setRawFile(null);
                          setStudioImage(null);
                        }}
                        className="p-2 bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500/30 transition-all cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-white/5 hover:border-zinc-800 transition-all bg-zinc-950 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
                  >
                    <Upload className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300 transition-colors mb-2.5" />
                    <p className="text-xs font-semibold text-zinc-300">Drag & drop files or click to upload</p>
                    <p className="text-[10px] text-zinc-500 mt-1">Supports PNG, JPG (maximum 10MB file size)</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            {/* TAB CONTENT: GENERATE IMAGE */}
            {mediaTab === 'generate' && (
              <div className="space-y-4">
                
                {/* Generation settings block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    >
                      {['1:1 (Square)', '4:5 (Portrait)', '16:9 (Landscape)'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Style Preset</label>
                    <select
                      value={stylePreset}
                      onChange={(e) => setStylePreset(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    >
                      {['Photorealistic', 'Minimalist', '3D Render', 'watercolor', 'Illustration'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">AI Text Prompt</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate... e.g. Minimal mountains sunrise mood"
                      className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    />
                    <button
                      onClick={handleImageGenerate}
                      disabled={isGeneratingImage || !prompt.trim()}
                      className="btn-accent py-2.5 px-4 text-xs font-semibold shrink-0 gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-white/10" />
                      <span>{isGeneratingImage ? 'Generating...' : 'Generate'}</span>
                    </button>
                  </div>
                </div>

                {/* Show active generated mockup results */}
                {isGeneratingImage && (
                  <div className="h-[220px] rounded-2xl bg-zinc-950 border border-white/5 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-brand-purple rounded-full animate-spin" />
                    <span className="text-zinc-500 text-xs font-semibold">Creating with NanoBanana Pro AI...</span>
                  </div>
                )}

                {generatedBase64 && !isGeneratingImage && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black">
                      <img 
                        src={`data:image/png;base64,${generatedBase64}`} 
                        alt="AI Generation output" 
                        className="w-full max-h-[220px] object-contain mx-auto" 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setGeneratedBase64('')}
                        className="btn-premium py-2 px-4 text-xs border-white/5 text-zinc-400 hover:text-white"
                      >
                        Regenerate
                      </button>
                      <button
                        onClick={handleUseGeneratedImage}
                        className="btn-accent py-2 px-4 text-xs"
                      >
                        Use Image in Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. SMART SCHEDULING MODE */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">5. Smart Scheduling</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setScheduleMode('queue')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  scheduleMode === 'queue' 
                    ? 'bg-brand-purple/10 border-brand-purple' 
                    : 'bg-zinc-950 border-white/5 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Add to Auto-Queue</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    scheduleMode === 'queue' ? 'border-brand-purple bg-brand-purple' : 'border-zinc-600'
                  }`}>
                    {scheduleMode === 'queue' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Publishes automatically based on your next optimal engagement time slots.</p>
              </button>

              <button
                onClick={() => setScheduleMode('later')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  scheduleMode === 'later' 
                    ? 'bg-brand-purple/10 border-brand-purple' 
                    : 'bg-zinc-950 border-white/5 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Schedule for Later</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    scheduleMode === 'later' ? 'border-brand-purple bg-brand-purple' : 'border-zinc-600'
                  }`}>
                    {scheduleMode === 'later' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Specify an exact customized calendar date and time for the posting pipeline.</p>
              </button>
            </div>

            {/* Custom Date selection widgets */}
            {scheduleMode === 'later' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-950 rounded-2xl border border-white/5 animate-fade-in-up">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Posting Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Posting Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Live Native Previews (span 5) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-6">
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">4. Live Preview</span>

            {/* Platform tab filters */}
            <div className="flex justify-between bg-zinc-950 p-1 rounded-xl border border-white/5">
              {['instagram', 'facebook', 'twitter', 'linkedin'].map((service) => (
                <button
                  key={service}
                  onClick={() => setPreviewTab(service)}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                    previewTab === service 
                      ? 'bg-white/5 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {service === 'twitter' ? 'X / Twitter' : service}
                </button>
              ))}
            </div>

            {/* Native preview cards matching each aesthetic */}
            <div className="rounded-2xl bg-zinc-950 border border-white/5 p-4.5 min-h-[300px] flex flex-col justify-between">
              
              {/* Instagram Style */}
              {previewTab === 'instagram' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold">AJ</div>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-white block">alex.johnson</span>
                        <span className="text-[9px] text-zinc-500 leading-none">Sponsored</span>
                      </div>
                    </div>
                    <span className="text-zinc-500 text-xs font-bold">•••</span>
                  </div>

                  {/* Attachment */}
                  <div className="aspect-square w-full rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden relative">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Instagram preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-zinc-600 space-y-1">
                        <ImageIcon className="w-10 h-10 mx-auto" />
                        <p className="text-[10px] font-semibold">Image Asset Area</p>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between text-zinc-300">
                    <div className="flex items-center gap-3">
                      <span className="cursor-pointer">❤️</span>
                      <span className="cursor-pointer">💬</span>
                      <span className="cursor-pointer">✈️</span>
                    </div>
                    <span className="cursor-pointer">📥</span>
                  </div>

                  {/* Caption block */}
                  <div className="text-xs space-y-1">
                    <p className="text-zinc-300 leading-relaxed">
                      <strong className="text-white mr-1.5">alex.johnson</strong>
                      {text || 'Enter your content caption on the left composer panel to see a live simulation of the output formatting.'}
                    </p>
                  </div>
                </div>
              )}

              {/* X / Twitter Style */}
              {previewTab === 'twitter' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">AJ</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white truncate">Alex Johnson</span>
                        <span className="text-[10px] text-zinc-500 truncate">@alex_johnson</span>
                        <span className="text-[10px] text-zinc-500 font-mono">• 2s</span>
                      </div>
                      
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed whitespace-pre-line">
                        {text || 'Write your microblog draft and hashtags... Custom platform adaptations will automatically adjust sizes.'}
                      </p>

                      {imageUrl && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/5 max-h-[220px]">
                          <img src={imageUrl} alt="X preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Tweet actions bar */}
                      <div className="flex justify-between mt-3 text-zinc-500 text-[11px] max-w-[280px]">
                        <span>💬 0</span>
                        <span>🔁 0</span>
                        <span>❤️ 1</span>
                        <span>📊 12</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Facebook Preview */}
              {previewTab === 'facebook' && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">AJ</div>
                    <div>
                      <span className="text-xs font-bold text-white block">Alex Johnson</span>
                      <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                        <span>Just now</span>
                        <span>•</span>
                        <span>🌍</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {text || 'Facebook supports rich paragraph formations, link extensions, and customized visual elements. Try it out!'}
                  </p>

                  {imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/5 max-h-[200px]">
                      <img src={imageUrl} alt="Facebook preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Actions split bar */}
                  <div className="grid grid-cols-3 gap-1 border-y border-white/5 py-2.5 text-center text-[10px] font-bold text-zinc-500 font-mono">
                    <span className="hover:text-white cursor-pointer">👍 Like</span>
                    <span className="hover:text-white cursor-pointer">💬 Comment</span>
                    <span className="hover:text-white cursor-pointer">↪️ Share</span>
                  </div>
                </div>
              )}

              {/* LinkedIn Preview */}
              {previewTab === 'linkedin' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-8.5 h-8.5 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs text-brand-purple">AJ</div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white">Alex Johnson</span>
                          <span className="text-[9px] text-zinc-500 font-normal">• 1st</span>
                        </div>
                        <p className="text-[9px] text-zinc-500">Senior Content Strategist & Consultant</p>
                        <p className="text-[8px] text-zinc-600 flex items-center gap-0.5">1h • 🌐</p>
                      </div>
                    </div>
                    <span className="text-zinc-500 text-xs font-bold">•••</span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {text || 'Design premium, highly professional copy adapted to business networking circles.'}
                  </p>

                  {imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/5 max-h-[190px]">
                      <img src={imageUrl} alt="LinkedIn preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* LinkedIn actions strip */}
                  <div className="flex justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-500 font-semibold font-mono">
                    <span className="cursor-pointer hover:text-white">👍 Like</span>
                    <span className="cursor-pointer hover:text-white">💬 Comment</span>
                    <span className="cursor-pointer hover:text-white">♻️ Repost</span>
                    <span className="cursor-pointer hover:text-white">✉️ Send</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 flex gap-4">
            <button
              onClick={() => showToast('Saved draft to local cache')}
              className="flex-1 btn-premium py-3 text-xs"
            >
              Save as Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting || !text.trim() || selectedChannels.length === 0}
              className="flex-1 btn-accent py-3 text-xs gap-1.5"
            >
              <span>{scheduleMode === 'later' ? 'Schedule Post' : 'Add to Queue'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
