import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useStudioStore } from '../store/useStudioStore';
import { uploadToCloudinary } from '../api/cloudinary';
import {
  Sparkles,
  Download,
  PlusCircle,
  Image as ImageIcon,
  Lock,
  Layers,
  Sliders,
  Scissors,
  RefreshCcw,
  Type,
  BadgeCheck,
  Palette,
  FileText,
  Megaphone,
  Building2
} from 'lucide-react';

export function Studio({ onSelectImage }) {
  const showToast = useStore((state) => state.showToast);
  const brandDetails = useAuthStore((state) => state.brandDetails);
  const setBrandDetails = useAuthStore((state) => state.setBrandDetails);

  const isGeneratingImageRef = useRef(false);
  const isRenderingBrandRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showBrandDetails, setShowBrandDetails] = useState(false);
  const [editableBrand, setEditableBrand] = useState({ ...brandDetails });

  useEffect(() => {
    setEditableBrand({ ...brandDetails });
  }, [brandDetails]);

  const {
    prompt,
    stylePreset,
    aspectRatio,
    brandingEnabled,
    credits,
    generating,
    renderingBrand,
    gallery,
    selectedImageId,
    setPrompt,
    setStylePreset,
    setAspectRatio,
    setBrandingEnabled,
    setSelectedImageId,
    generateGeminiImage,
    generateNanobananaBrandAsset
  } = useStudioStore();

  const activeImageObj = gallery.find((g) => g.id === selectedImageId) || gallery[0];

  const getPreviewAspectRatio = (ratio = '1:1') => ratio.replace(':', ' / ');

  const getImageDimensions = (ratio = '1:1') => {
    const dimensions = {
      '1:1': '1024 x 1024',
      '3:4': '896 x 1200',
      '4:5': '928 x 1152',
      '16:9': '1376 x 768',
    };

    return dimensions[ratio] || '1024 x 1024';
  };

  const base64ToBlob = (base64Data) => {
    const [meta, data] = base64Data.split(',');
    const contentType = meta.split(':')[1].split(';')[0];
    const byteString = atob(data);
    const bytes = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i += 1) {
      bytes[i] = byteString.charCodeAt(i);
    }

    return new Blob([bytes], { type: contentType });
  };

  const handleSurpriseMe = () => {
    const prompts = [
      'A sleek professional workspace overlooking a glowing cyberpunk metropolis.',
      'Premium dark glassmorphic abstract shapes with golden strings, 3D render.',
      'Energetic young athlete running on a misty track under soft purple neon lights.',
      'Cozy minimalist organic tea packaging sitting on a warm wooden platform.'
    ];
    const rand = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(rand);
  };

  const handleGenerate = async () => {
    if (isGeneratingImageRef.current) return;
    if (!prompt.trim()) {
      showToast('Please specify what image you want to generate');
      return;
    }

    isGeneratingImageRef.current = true;
    try {
      showToast('Invoking Gemini Image Engine...');
      await generateGeminiImage();
      showToast('Successfully generated! Added to grid.');
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message}`);
    } finally {
      isGeneratingImageRef.current = false;
    }
  };

  const handleRenderBrandBanner = async () => {
    if (isRenderingBrandRef.current) return;

    isRenderingBrandRef.current = true;
    try {
      showToast('Rendering brand preset banner via Nanobanana...');
      await generateNanobananaBrandAsset(brandDetails.name, brandDetails.tagline);
      showToast('Brand banner created! Added to grid.');
    } catch (err) {
      console.error(err);
      showToast(`Rendering failed: ${err.message}`);
    } finally {
      isRenderingBrandRef.current = false;
    }
  };

  const handleDownload = () => {
    if (!activeImageObj) return;

    const link = document.createElement('a');
    link.href = activeImageObj.url;
    link.download = `postly_ai_${activeImageObj.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded AI creation successfully.');
  };

  const handleUseInPost = async () => {
    if (!activeImageObj) return;

    try {
      setIsUploading(true);

      let finalUrl = activeImageObj.url;
      if (activeImageObj.url.startsWith('data:image')) {
        const blob = base64ToBlob(activeImageObj.url);
        finalUrl = await uploadToCloudinary(blob);
      }

      onSelectImage(finalUrl);
      showToast('Applied image to composer draft.');
    } catch (err) {
      console.error(err);
      showToast(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pl-0 lg:pl-[240px] pt-20 lg:pt-10 min-h-screen bg-black text-white px-4 sm:px-6 lg:pr-10 pb-10 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
            Creative Studio <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Generate premium stunning marketing graphics and promotional assets with AI.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 border border-white/5 rounded-xl text-xs font-semibold text-zinc-400">
            <span>Credits:</span>
            <strong className="text-white font-mono">{credits}</strong>
          </div>
          <button
            onClick={() => showToast('Upgraded options coming soon')}
            className="btn-premium py-2 px-4 text-xs font-semibold hover:border-brand-purple hover:text-brand-purple"
          >
            Upgrade Tier
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-4 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-6">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">1. Prompt Settings</span>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Image Description</label>
              <button
                onClick={handleSurpriseMe}
                className="text-[9px] text-zinc-400 hover:text-white hover:underline font-semibold font-mono uppercase tracking-wider"
              >
                Surprise Me
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe scene, lighting, mood, color palette, or object specifications... e.g. Cinematic premium bottle mockups with abstract fluid gold flows"
              className="w-full min-h-[110px] bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-purple transition-colors resize-none placeholder-zinc-700 leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Style Preset</label>
            <div className="grid grid-cols-2 gap-2">
              {['Photorealistic', 'Minimalist', '3D Render', 'Watercolor', 'Illustration', 'Digital Art'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStylePreset(s)}
                  className={`py-2 px-3 text-[10px] font-bold rounded-lg border transition-all text-center cursor-pointer ${
                    stylePreset === s
                      ? 'bg-brand-purple/10 border-brand-purple text-brand-purple'
                      : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-zinc-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: '1:1', desc: 'Square' },
                { name: '3:4', desc: 'Portrait' },
                { name: '16:9', desc: 'Landscape' }
              ].map((r) => (
                <button
                  key={r.name}
                  onClick={() => setAspectRatio(r.name)}
                  className={`py-2 px-2 text-[10px] font-bold rounded-lg border transition-all text-center cursor-pointer ${
                    aspectRatio === r.name
                      ? 'bg-brand-purple/10 border-brand-purple text-brand-purple'
                      : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-zinc-800'
                  }`}
                >
                  <p className="font-mono text-[11px]">{r.name}</p>
                  <p className="text-[8px] text-zinc-500 font-normal">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Branding</label>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  Add your saved business profile and logo to AI generations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBrandingEnabled(!brandingEnabled)}
                className={`w-12 h-6 rounded-full border transition-all relative shrink-0 cursor-pointer p-0.5 ${
                  brandingEnabled ? 'bg-brand-purple border-brand-purple' : 'bg-zinc-900 border-white/10'
                }`}
                aria-pressed={brandingEnabled}
                title="Toggle branding"
              >
                <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  brandingEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {brandingEnabled && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowBrandDetails(!showBrandDetails);
                    if (!showBrandDetails) {
                      setEditableBrand({ ...brandDetails });
                    }
                  }}
                  className="w-full flex items-center gap-2 text-[10px] text-zinc-400 bg-black/40 border border-white/[0.03] rounded-xl p-3 hover:border-white/10 transition-colors cursor-pointer"
                >
                  {brandDetails.logoUrl ? (
                    <img src={brandDetails.logoUrl} alt="Brand logo" className="w-7 h-7 rounded-lg object-cover border border-white/10" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-brand-purple/20 text-brand-purple flex items-center justify-center font-bold">
                      {(brandDetails.name || 'B').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-bold text-white truncate">{brandDetails.name || 'Brand profile'}</p>
                    <p className="truncate">{brandDetails.tagline || brandDetails.industry || 'Business details enabled'}</p>
                  </div>
                  <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <svg className={`w-3 h-3 text-zinc-500 transition-transform ${showBrandDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {showBrandDetails && (
                  <div className="space-y-3 bg-black/40 border border-white/[0.03] rounded-xl p-4">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">AI Prompt Inputs — Editable</p>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wide flex items-center gap-1"><Building2 className="w-3 h-3" /> Brand Name</label>
                      <input
                        value={editableBrand.name}
                        onChange={(e) => setEditableBrand({ ...editableBrand, name: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-brand-purple transition-colors placeholder-zinc-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wide flex items-center gap-1"><Megaphone className="w-3 h-3" /> Tagline</label>
                      <input
                        value={editableBrand.tagline}
                        onChange={(e) => setEditableBrand({ ...editableBrand, tagline: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-brand-purple transition-colors placeholder-zinc-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wide flex items-center gap-1"><Building2 className="w-3 h-3" /> Industry</label>
                      <input
                        value={editableBrand.industry}
                        onChange={(e) => setEditableBrand({ ...editableBrand, industry: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-brand-purple transition-colors placeholder-zinc-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wide flex items-center gap-1"><FileText className="w-3 h-3" /> Description</label>
                      <textarea
                        value={editableBrand.description}
                        onChange={(e) => setEditableBrand({ ...editableBrand, description: e.target.value })}
                        rows={2}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-brand-purple transition-colors placeholder-zinc-700 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wide flex items-center gap-1"><Palette className="w-3 h-3" /> Tone</label>
                      <input
                        value={editableBrand.tone}
                        onChange={(e) => setEditableBrand({ ...editableBrand, tone: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-brand-purple transition-colors placeholder-zinc-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wide flex items-center gap-1"><Palette className="w-3 h-3" /> Brand Colors</label>
                      <div className="flex gap-2 flex-wrap">
                        {(editableBrand.colors || []).map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-zinc-950 border border-white/5 rounded-lg px-2 py-1">
                            <div className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: c }} />
                            <input
                              value={c}
                              onChange={(e) => {
                                const newColors = [...editableBrand.colors];
                                newColors[i] = e.target.value;
                                setEditableBrand({ ...editableBrand, colors: newColors });
                              }}
                              className="w-16 bg-transparent text-[9px] text-zinc-400 focus:outline-none font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wide flex items-center gap-1"><Sparkles className="w-3 h-3" /> Base Prompt</label>
                      <textarea
                        value={editableBrand.basePrompt}
                        onChange={(e) => setEditableBrand({ ...editableBrand, basePrompt: e.target.value })}
                        rows={2}
                        className="w-full bg-zinc-950 border border-white/5 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-brand-purple transition-colors placeholder-zinc-700 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          setBrandDetails(editableBrand);
                          showToast('Brand details updated for AI generations.');
                        }}
                        className="flex-1 py-2 text-[10px] font-bold bg-brand-purple/10 border border-brand-purple/30 text-brand-purple rounded-lg hover:bg-brand-purple/20 transition-colors cursor-pointer"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditableBrand({ ...brandDetails });
                          setShowBrandDetails(false);
                        }}
                        className="flex-1 py-2 text-[10px] font-bold bg-zinc-950 border border-white/5 text-zinc-400 rounded-lg hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={generating || renderingBrand || !prompt.trim()}
              className="w-full btn-accent py-3.5 text-xs font-semibold gap-1.5"
            >
              <Sparkles className="w-4 h-4 fill-white/10" />
              <span>{generating ? 'Generating AI Art...' : 'Generate Art (10 credits)'}</span>
            </button>

            <button
              onClick={handleRenderBrandBanner}
              disabled={generating || renderingBrand}
              className="w-full btn-premium py-3 text-xs font-semibold gap-1.5 border border-white/5 bg-zinc-950/80 hover:bg-zinc-900"
            >
              <Layers className="w-4 h-4 text-brand-purple" />
              <span>{renderingBrand ? 'Rendering Brand Asset...' : 'Render Brand Banner (15 credits)'}</span>
            </button>
          </div>
        </div>

        <div className="xl:col-span-5 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">2. Generated Results</span>

          <div className="min-h-[400px] rounded-2xl border border-white/5 bg-zinc-950/20 flex items-center justify-center relative overflow-hidden">
            {gallery.length === 0 && !generating && !renderingBrand ? (
              <div className="text-center space-y-2 text-zinc-600">
                <ImageIcon className="w-12 h-12 mx-auto text-zinc-800" />
                <p className="text-xs font-medium">your output here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full p-4">
                {(generating || renderingBrand) && (
                  <div className="col-span-1 aspect-square rounded-2xl bg-zinc-950 border border-white/5 flex flex-col items-center justify-center space-y-2 text-center p-3 animate-pulse">
                    <div className="w-6 h-6 border-2 border-white/10 border-t-brand-purple rounded-full animate-spin" />
                    <span className="text-[10px] text-zinc-500 font-semibold font-mono uppercase">
                      {generating ? 'Creating...' : 'Rendering...'}
                    </span>
                  </div>
                )}

                {gallery.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    style={{ aspectRatio: getPreviewAspectRatio(img.aspectRatio) }}
                    className={`rounded-2xl overflow-hidden border cursor-pointer relative group transition-all duration-300 bg-black ${
                      selectedImageId === img.id
                        ? 'border-brand-purple shadow-md shadow-brand-purple/15'
                        : 'border-white/5 hover:border-zinc-800'
                    }`}
                  >
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[9px] text-zinc-300 line-clamp-2 leading-relaxed">{img.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-3 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-6">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">3. Inspector Panel</span>

          {activeImageObj ? (
            <div className="space-y-6">
              <div
                className="rounded-2xl overflow-hidden border border-white/5 bg-black relative"
                style={{ aspectRatio: getPreviewAspectRatio(activeImageObj.aspectRatio) }}
              >
                <img src={activeImageObj.url} alt="Focused creation" className="w-full h-full object-contain mx-auto" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="btn-premium flex-1 py-3 text-xs gap-1.5 hover:border-zinc-700 hover:bg-zinc-900 border-white/5"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleUseInPost}
                  className="btn-accent flex-1 py-3 text-xs gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Use in Post</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-3.5 text-xs font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Preset Style</span>
                  <span className="text-zinc-300 uppercase tracking-wider text-[10px] font-bold font-mono">{activeImageObj.style}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Dimensions</span>
                  <span className="text-zinc-300 font-mono">{getImageDimensions(activeImageObj.aspectRatio)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-500">Prompt Logs</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/[0.02]">{activeImageObj.prompt}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Edit & Enhance</label>
                <div className="space-y-1.5 text-xs font-semibold">
                  {[
                    { label: 'Upscale (2x)', icon: Sliders },
                    { label: 'Remove Background', icon: Scissors },
                    { label: 'Regenerate Variations', icon: RefreshCcw },
                    { label: 'Add Typography Overlays', icon: Type }
                  ].map((act) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.label}
                        onClick={() => showToast(`${act.label} coming soon in v1.1`)}
                        className="w-full flex items-center justify-between p-3 bg-zinc-950 border border-white/5 hover:border-zinc-800 rounded-xl text-left text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{act.label}</span>
                        </div>
                        <Lock className="w-3 h-3 text-zinc-600" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <ImageIcon className="w-12 h-12 mb-2.5 text-zinc-800" />
              <p className="text-xs font-medium">your output here</p>
            </div>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl text-center space-y-4 shadow-2xl max-w-sm mx-4">
            <div className="w-12 h-12 border-4 border-white/10 border-t-brand-purple rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-white font-bold text-lg">Uploading Image</h3>
              <p className="text-zinc-400 text-xs mt-1">image getting uploaded to our cloud wait a minute</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
