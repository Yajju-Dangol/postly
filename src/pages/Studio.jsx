import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useStudioStore } from '../store/useStudioStore';
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
  Type
} from 'lucide-react';

export function Studio({ onBack, onSelectImage }) {
  const showToast = useStore((state) => state.showToast);
  const brandDetails = useAuthStore((state) => state.brandDetails);

  const isGeneratingImageRef = useRef(false);
  const isRenderingBrandRef = useRef(false);

  // Bind to useStudioStore
  const {
    prompt,
    stylePreset,
    aspectRatio,
    credits,
    generating,
    renderingBrand,
    gallery,
    selectedImageId,
    setPrompt,
    setStylePreset,
    setAspectRatio,
    setSelectedImageId,
    generateGeminiImage,
    generateNanobananaBrandAsset
  } = useStudioStore();

  const handleSurpriseMe = () => {
    const prompts = [
      'A sleek professional workspace overlooking a glowing cyberpunk metropolis.',
      'Premium dark glassmorphic abstract shapes with golden strings, 3D render.',
      'Energetic young athlete running on a misty track under soft purple neon lights.',
      'Cozy minimalist organic tea packaging sitting on a warm wooden platform.',
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
    const current = gallery.find(g => g.id === selectedImageId) || gallery[0];
    if (!current) return;
    
    const link = document.createElement('a');
    link.href = current.url;
    link.download = `postly_ai_${current.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded AI creation successfully.');
  };

  const handleUseInPost = () => {
    const current = gallery.find(g => g.id === selectedImageId) || gallery[0];
    if (!current) return;

    onSelectImage(current.url);
    showToast('Applied image to composer draft.');
  };

  const activeImageObj = gallery.find(g => g.id === selectedImageId) || gallery[0];

  return (
    <div className="pl-[240px] min-h-screen bg-black text-white p-10 animate-fade-in-up">
      
      {/* Upper Action Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Creative Studio <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Generate premium stunning marketing graphics and promotional assets with AI.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
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

      {/* Main Studio Panels (Split Column Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* PANEL 1: AI Prompt Controls (Col Span 4) */}
        <div className="xl:col-span-4 p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-6">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">1. Prompt Settings</span>

          {/* Prompt inputs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Image Description</label>
              <div className="flex gap-2">
                <button 
                  onClick={handleSurpriseMe}
                  className="text-[9px] text-zinc-400 hover:text-white hover:underline font-semibold font-mono uppercase tracking-wider"
                >
                  Surprise Me
                </button>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe scene, lighting, mood, color palette, or object specifications... e.g. Cinematic premium bottle mockups with abstract fluid gold flows"
              className="w-full min-h-[110px] bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-purple transition-colors resize-none placeholder-zinc-700 leading-relaxed"
            />
          </div>

          {/* Presets styles list */}
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

          {/* Aspect Ratios */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: '1:1', desc: 'Square' },
                { name: '4:5', desc: 'Portrait' },
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

          {/* Actions grid */}
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

        {/* PANEL 2: Bento Results Grid (Col Span 5) */}
        <div className="xl:col-span-5 p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">2. Generated Results</span>

          {/* Grid layout */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Show generator item placeholder if generating or rendering */}
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
                className={`aspect-square rounded-2xl overflow-hidden border cursor-pointer relative group transition-all duration-300 ${
                  selectedImageId === img.id 
                    ? 'border-brand-purple shadow-md shadow-brand-purple/15' 
                    : 'border-white/5 hover:border-zinc-800'
                }`}
              >
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] text-zinc-300 line-clamp-2 leading-relaxed">{img.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 3: Focused Detail Viewer (Col Span 3) */}
        <div className="xl:col-span-3 p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-6">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">3. Inspector Panel</span>

          {activeImageObj ? (
            <div className="space-y-6">
              
              {/* Focus view container */}
              <div className="rounded-2xl overflow-hidden border border-white/5 bg-black relative aspect-square">
                <img src={activeImageObj.url} alt="Focused creation" className="w-full h-full object-contain mx-auto" />
              </div>

              {/* Actions row */}
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

              {/* Specifications logs details */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-3.5 text-xs font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Preset Style</span>
                  <span className="text-zinc-300 uppercase tracking-wider text-[10px] font-bold font-mono">{activeImageObj.style}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Dimensions</span>
                  <span className="text-zinc-300 font-mono">1024 × 1024</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-500">Prompt Logs</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/[0.02]">{activeImageObj.prompt}</p>
                </div>
              </div>

              {/* Graphic Enhancements items */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Edit & Enhance</label>
                <div className="space-y-1.5 text-xs font-semibold">
                  {[
                    { label: 'Upscale (2x)', icon: Sliders },
                    { label: 'Remove Background', icon: Scissors },
                    { label: 'Regenerate Variations', icon: RefreshCcw },
                    { label: 'Add Typography Overlays', icon: Type }
                  ].map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={idx}
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
              <ImageIcon className="w-10 h-10 mb-2.5 text-zinc-700 animate-pulse" />
              <p className="text-xs font-semibold">No active selection</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Select a grid card template to view details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
