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
  Paperclip,
  RefreshCw
} from 'lucide-react';
import { publishPostWorkflow } from '../api/publishWorkflow';
import { useAuthStore } from '../store/useAuthStore';
import { useStudioStore } from '../store/useStudioStore';
import { useCalendarStore } from '../store/useCalendarStore';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from "@google/genai";

export function Compose({ onBack }) {
  const channels = useStore((state) => state.channels);
  const loadChannels = useStore((state) => state.loadChannels);
  const isLoadingChannels = useStore((state) => state.isLoadingChannels);
  const showToast = useStore((state) => state.showToast);
  const studioImage = useStore((state) => state.studioImage);
  const setStudioImage = useStore((state) => state.setStudioImage);
  const editingPost = useStore((state) => state.editingPost);
  const clearEditingPost = useStore((state) => state.clearEditingPost);

  // Brand Details state from auth store
  const brandDetails = useAuthStore((state) => state.brandDetails);

  // Bind prompt & generation controls to useStudioStore
  const prompt = useStudioStore((state) => state.prompt);
  const setPrompt = useStudioStore((state) => state.setPrompt);
  const stylePreset = useStudioStore((state) => state.stylePreset);
  const setStylePreset = useStudioStore((state) => state.setStylePreset);
  const aspectRatio = useStudioStore((state) => state.aspectRatio);
  const setAspectRatio = useStudioStore((state) => state.setAspectRatio);
  const isGeneratingImage = useStudioStore((state) => state.generating);
  const generateGeminiImage = useStudioStore((state) => state.generateGeminiImage);
  const isRenderingBrandBanner = useStudioStore((state) => state.renderingBrand);
  const generateNanobananaBrandAsset = useStudioStore((state) => state.generateNanobananaBrandAsset);

  // States
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [mediaTab, setMediaTab] = useState('upload'); // 'upload' | 'generate' | 'brand'
  
  // Media states
  const [imageUrl, setImageUrl] = useState('');
  const [rawFile, setRawFile] = useState(null);
  const fileInputRef = useRef(null);
  const isPublishingRef = useRef(false);
  const isGeneratingImageRef = useRef(false);
  const isRenderingBrandRef = useRef(false);
  const isEnhancingCaptionRef = useRef(false);

  // AI Image generation states (only local generated output review URL)
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');

  // Brand banner preview and options
  const [brandBannerTitle, setBrandBannerTitle] = useState('');
  const [brandBannerSlogan, setBrandBannerSlogan] = useState('');
  const [brandBannerPreview, setBrandBannerPreview] = useState('');

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
  const [isRefreshingChannels, setIsRefreshingChannels] = useState(false);

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
    if (!editingPost && channels.length > 0 && selectedChannels.length === 0) {
      setSelectedChannels([channels[0].id]);
      setPreviewTab(channels[0].service);
    }
  }, [channels, editingPost]);

  // Handle editingPost pre-population
  useEffect(() => {
    if (editingPost) {
      setText(editingPost.text || '');
      setSelectedChannels(editingPost.channel_ids || []);
      setImageUrl(editingPost.media_url || '');
      
      if (editingPost.scheduled_for) {
        const d = new Date(editingPost.scheduled_for);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setScheduleDate(`${year}-${month}-${day}`);
        
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setScheduleTime(`${hours}:${minutes}`);
        setScheduleMode('later');
      } else {
        setScheduleMode('queue');
      }
    }
  }, [editingPost]);

  // Clean up editingPost state on unmount
  useEffect(() => {
    return () => {
      clearEditingPost();
    };
  }, []);

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

  // Effect to initialize brand banner fields when brandDetails is fetched
  useEffect(() => {
    if (brandDetails) {
      setBrandBannerTitle(brandDetails.name || '');
      setBrandBannerSlogan(brandDetails.tagline || '');
    }
  }, [brandDetails]);

  // Trigger Gemini Image Generator via store
  const handleImageGenerate = async () => {
    if (isGeneratingImageRef.current) return;
    if (!prompt.trim()) {
      showToast('Please enter an image prompt first');
      return;
    }

    isGeneratingImageRef.current = true;
    try {
      showToast('Invoking Gemini Image Engine...');
      const url = await generateGeminiImage();
      setGeneratedImageUrl(url);
      showToast('Image generated successfully! Click "Use Image" to attach.');
    } catch (err) {
      console.error(err);
      showToast(`Generation failed: ${err.message}`);
    } finally {
      isGeneratingImageRef.current = false;
    }
  };

  // Use the generated AI Image in the post
  const handleUseGeneratedImage = () => {
    if (generatedImageUrl) {
      setImageUrl(generatedImageUrl);
      // Convert base64/URL to a raw file blob so Cloudinary can upload it
      fetch(generatedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "ai_generated.png", { type: "image/png" });
          setRawFile(file);
        });
      setGeneratedImageUrl('');
      showToast('AI Image attached to composer.');
    }
  };

  // Trigger Nanobanana Brand Banner rendering via store
  const handleRenderBrandBanner = async () => {
    if (isRenderingBrandRef.current) return;
    if (!brandBannerTitle.trim()) {
      showToast('Please enter a banner title');
      return;
    }
    isRenderingBrandRef.current = true;
    try {
      showToast('Rendering brand preset banner via Nanobanana...');
      const url = await generateNanobananaBrandAsset(brandBannerTitle, brandBannerSlogan);
      setBrandBannerPreview(url);
      showToast('Brand banner created successfully!');
    } catch (err) {
      console.error(err);
      showToast(`Rendering failed: ${err.message}`);
    } finally {
      isRenderingBrandRef.current = false;
    }
  };

  // Trigger Gemini Caption Enhancer
  const handleEnhanceCaption = async () => {
    if (isEnhancingCaptionRef.current) return;
    if (!text.trim()) {
      showToast('Please type a caption draft first');
      return;
    }

    isEnhancingCaptionRef.current = true;
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
      isEnhancingCaptionRef.current = false;
    }
  };

  // Post Submission Pipeline
  const handlePublish = async () => {
    if (isPublishingRef.current) return;
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

    isPublishingRef.current = true;
    setIsSubmitting(true);
    const user = useAuthStore.getState().user;
    let finalDate = new Date();
    if (scheduleMode === 'later') {
      finalDate = new Date(`${scheduleDate}T${scheduleTime}`);
    }

    // --- UPDATE FLOW ---
    if (editingPost) {
      try {
        showToast('Saving updates. Please wait...');
        
        let apiImageUrl = imageUrl;
        if (imageUrl?.startsWith('data:')) {
          const { uploadToCloudinary } = await import('../api/cloudinary');
          apiImageUrl = await uploadToCloudinary(rawFile || imageUrl);
        }

        const updates = {
          text,
          scheduled_for: finalDate.toISOString(),
          channel_ids: selectedChannels,
          media_url: apiImageUrl || imageUrl || '',
        };

        const res = await useCalendarStore.getState().updateAutomatedPost(editingPost.id, updates);

        if (res.success) {
          await useCalendarStore.getState().loadCalendarPosts();
          showToast('Success! Post updated successfully.');
          clearEditingPost();
          setStudioImage(null);
          setTimeout(() => {
            onBack();
          }, 1500);
        } else {
          showToast(`Update failed: ${res.message}`);
        }
      } catch (err) {
        console.error(err);
        showToast(`Update failed: ${err.message}`);
      } finally {
        setIsSubmitting(false);
        isPublishingRef.current = false;
      }
      return;
    }

    // --- NEW POST FLOW ---
    let dbPost = null;
    try {
      // 1. Insert record into Supabase automated_posts table with status 'ready_to_schedule'
      if (user) {
        const { data, error } = await supabase
          .from('automated_posts')
          .insert({
            user_id: user.id,
            text,
            scheduled_for: finalDate.toISOString(),
            status: 'ready_to_schedule',
            media_url: imageUrl || '',
            channel_ids: selectedChannels,
          })
          .select()
          .single();

        if (error) throw error;
        dbPost = data;
      }

      showToast('Uploading assets and scheduling. Please wait...');
      
      // 2. Call the sequential Buffer publishing pipeline
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
        // 3. On success, update record status to 'queued' and save the buffer_post_id
        if (user && dbPost) {
          const { error: updateErr } = await supabase
            .from('automated_posts')
            .update({
              status: 'queued',
              buffer_post_id: result.bufferPostId,
              media_url: result.mediaUrl || dbPost.media_url,
            })
            .eq('id', dbPost.id);
          if (updateErr) console.error('Failed to update post status in DB:', updateErr);
        } else if (!user) {
          // Dev bypass fallback
          await useCalendarStore.getState().createAutomatedPost({
            text,
            scheduled_for: finalDate.toISOString(),
            status: 'queued',
            media_url: imageUrl || '',
            channel_ids: selectedChannels,
            buffer_post_id: result.bufferPostId || `mock_buffer_${Date.now()}`
          });
        }

        // Refresh stores
        await useCalendarStore.getState().loadCalendarPosts();
        
        showToast('Success! Post scheduled successfully.');
        setStudioImage(null);
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        // 4. On failure, log the error and mark the post as 'error'
        if (user && dbPost) {
          await supabase
            .from('automated_posts')
            .update({ status: 'error' })
            .eq('id', dbPost.id);

          await supabase.from('error_logs').insert({
            user_id: user.id,
            summary: `Publish failed for post ${dbPost.id}`,
            details: result.message || 'Unknown Buffer publishing error',
            timestamp: new Date().toISOString()
          });

          await useCalendarStore.getState().loadErrorLogs();
          await useCalendarStore.getState().loadCalendarPosts();
        }
        showToast(`Post failed: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      // 4. On fatal exception/failure, log to error_logs and mark post as 'error'
      if (user && dbPost) {
        try {
          await supabase
            .from('automated_posts')
            .update({ status: 'error' })
            .eq('id', dbPost.id);

          await supabase.from('error_logs').insert({
            user_id: user.id,
            summary: `Fatal error publishing post ${dbPost.id}`,
            details: err.message || 'Unknown fatal exception',
            timestamp: new Date().toISOString()
          });

          await useCalendarStore.getState().loadErrorLogs();
          await useCalendarStore.getState().loadCalendarPosts();
        } catch (dbErr) {
          console.error('Failed to log fatal error to DB:', dbErr);
        }
      }
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      isPublishingRef.current = false;
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
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    setIsRefreshingChannels(true);
                    await loadChannels(true);
                    setIsRefreshingChannels(false);
                    showToast('Channels refreshed successfully');
                  }}
                  disabled={isRefreshingChannels}
                  className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-brand-purple font-semibold cursor-pointer font-mono transition-colors disabled:opacity-50"
                  title="Refresh channels from Buffer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingChannels ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button 
                  onClick={handleSelectAll}
                  className="text-[10px] text-brand-purple font-semibold hover:underline cursor-pointer font-mono"
                >
                  {selectedChannels.length === channels.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
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
                <button
                  onClick={() => setMediaTab('brand')}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    mediaTab === 'brand' ? 'bg-indigo-500/10 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Brand Banner</span>
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
                      <option value="1:1">1:1 (Square)</option>
                      <option value="4:5">4:5 (Portrait)</option>
                      <option value="16:9">16:9 (Landscape)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Style Preset</label>
                    <select
                      value={stylePreset}
                      onChange={(e) => setStylePreset(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                    >
                      {['Photorealistic', 'Minimalist', '3D Render', 'Watercolor', 'Illustration'].map(s => (
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

                {generatedImageUrl && !isGeneratingImage && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black">
                      <img 
                        src={generatedImageUrl} 
                        alt="AI Generation output" 
                        className="w-full max-h-[220px] object-contain mx-auto" 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setGeneratedImageUrl('')}
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

            {/* TAB CONTENT: BRAND BANNER (NANOBANANA) */}
            {mediaTab === 'brand' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Banner Title</label>
                    <input
                      type="text"
                      value={brandBannerTitle}
                      onChange={(e) => setBrandBannerTitle(e.target.value)}
                      placeholder="e.g. Mountain Peak Co."
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Banner Slogan</label>
                    <input
                      type="text"
                      value={brandBannerSlogan}
                      onChange={(e) => setBrandBannerSlogan(e.target.value)}
                      placeholder="e.g. Elevate Your Journey"
                      className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mr-1">Brand Colors:</span>
                    {brandDetails?.colors?.map((c, i) => (
                      <span key={i} className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button
                    onClick={handleRenderBrandBanner}
                    disabled={isRenderingBrandBanner}
                    className="btn-accent py-2 px-4 text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-xs font-semibold"
                  >
                    {isRenderingBrandBanner ? 'Rendering...' : 'Render Brand Banner'}
                  </button>
                </div>

                {/* Show rendered brand banner preview */}
                {isRenderingBrandBanner && (
                  <div className="h-[220px] rounded-2xl bg-zinc-950 border border-white/5 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-2 border-white/10 border-t-brand-purple rounded-full animate-spin" />
                    <span className="text-zinc-500 text-xs font-semibold">Compiling brand layout via Nanobanana...</span>
                  </div>
                )}

                {brandBannerPreview && !isRenderingBrandBanner && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black">
                      <img 
                        src={brandBannerPreview} 
                        alt="Nanobanana Brand Banner" 
                        className="w-full max-h-[220px] object-contain mx-auto" 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setImageUrl(brandBannerPreview);
                          // Convert data URL to a raw file blob so Cloudinary can upload it
                          fetch(brandBannerPreview)
                            .then(res => res.blob())
                            .then(blob => {
                              const file = new File([blob], "brand_banner.png", { type: "image/png" });
                              setRawFile(file);
                            });
                          showToast('Brand Banner attached to composer.');
                        }}
                        className="btn-accent py-2 px-4 text-xs"
                      >
                        Use Banner in Post
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
            {editingPost ? (
              <>
                <button
                  onClick={() => {
                    clearEditingPost();
                    onBack();
                  }}
                  className="flex-1 btn-premium py-3 text-xs"
                >
                  Cancel Edit
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isSubmitting || !text.trim() || selectedChannels.length === 0}
                  className="flex-1 btn-accent py-3 text-xs gap-1.5"
                >
                  <span>{isSubmitting ? 'Updating...' : 'Update Post'}</span>
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
