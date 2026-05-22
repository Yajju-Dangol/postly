import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Building2, 
  Sparkles, 
  Palette, 
  Languages, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  Save, 
  Info,
  ShieldCheck
} from 'lucide-react';

export function BusinessDetails() {
  const brandDetails = useStore((state) => state.brandDetails);
  const setBrandDetails = useStore((state) => state.setBrandDetails);
  const showToast = useStore((state) => state.showToast);

  // Form states initialized from store values
  const [name, setName] = useState(brandDetails.name || 'Mountain Peak Co.');
  const [tagline, setTagline] = useState(brandDetails.tagline || 'Elevate Your Journey');
  const [industry, setIndustry] = useState(brandDetails.industry || 'Outdoor & Adventure');
  const [tone, setTone] = useState(brandDetails.tone || 'Inspirational, Adventurous, Trustworthy');
  const [colors, setColors] = useState(brandDetails.colors || ['#001b2a', '#f97316', '#0d1b2a']);
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [basePrompt, setBasePrompt] = useState(brandDetails.basePrompt || 'A highly professional, premium image.');
  const [description, setDescription] = useState(brandDetails.description || 'We inspire and equip adventurers to explore the world’s most breathtaking places. Quality gear, expert advice.');

  const handleSave = () => {
    setBrandDetails({
      name,
      tagline,
      industry,
      tone,
      colors,
      basePrompt,
      description
    });
    showToast('Brand Identity Profile saved successfully! ✨');
  };

  const handleColorChange = (index, value) => {
    const updated = [...colors];
    updated[index] = value;
    setColors(updated);
  };

  return (
    <div className="pl-[240px] min-h-screen bg-black text-white p-10 animate-fade-in-up">
      
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Business Details <Building2 className="w-5 h-5 text-brand-purple" />
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Configure your corporate brand guidelines, logos, colors, and tone to align AI outputs.</p>
        </div>

        <button
          onClick={handleSave}
          className="btn-accent gap-2 text-xs py-2.5 px-4 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </header>

      {/* Main Branding Panels (Two column layout) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: BRAND PROFILE FORMS (Col Span 7) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Section 1: Business Identity */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">1. Business Information</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Business Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mountain Peak Co."
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Tagline / Slogan</label>
                <div className="relative">
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Elevate Your Journey"
                    maxLength={60}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] font-mono text-zinc-500 font-semibold">{tagline.length}/60</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Industry / Niche</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                >
                  {['Technology', 'Outdoor & Adventure', 'Health & Wellness', 'Real Estate', 'B2B Services', 'E-commerce', 'Creative Agency'].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Tone of Voice</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Inspirational, energetic, bold"
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Description / Guidelines</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief guidelines describing brand message, audience demographics, or product definitions..."
                className="w-full min-h-[90px] bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-purple resize-none placeholder-zinc-700 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Logo and Visual System */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">2. Brand Assets & Visual Colors</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              
              {/* Logo block */}
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center relative shadow group shrink-0 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center font-bold text-brand-purple">
                    MP
                  </div>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => showToast('Logo uploader triggered (Mock)')}
                    className="btn-premium py-1.5 px-3 text-[10px] border-white/5 hover:border-zinc-700"
                  >
                    Change Logo
                  </button>
                  <p className="text-[9px] text-zinc-500">Supports JPG, PNG. Maximum size 2MB.</p>
                </div>
              </div>

              {/* Color swatch selectors */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Brand Color Palette</label>
                <div className="flex items-center gap-3">
                  {colors.map((c, idx) => (
                    <div key={idx} className="relative shrink-0">
                      <button
                        onClick={() => setActiveColorIdx(idx)}
                        className={`w-9 h-9 rounded-full border transition-all relative cursor-pointer ${
                          activeColorIdx === idx ? 'ring-2 ring-brand-purple scale-105 border-white' : 'border-white/10'
                        }`}
                        style={{ backgroundColor: c }}
                        title="Pick brand highlight color"
                      >
                        {activeColorIdx === idx && <Check className="w-3.5 h-3.5 text-white mx-auto stroke-[3px]" />}
                      </button>
                      <input 
                        type="color"
                        value={c}
                        onChange={(e) => handleColorChange(idx, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  ))}
                  <div className="text-xs font-mono text-zinc-400 font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-white/5">
                    {colors[activeColorIdx] || '#6366f1'}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: AI Customization instructions */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">3. AI Base Prompts Adaptation</span>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Brand Base Prompt Instruction</label>
              <textarea
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                placeholder="Global instruction prepended to all image generation prompts..."
                className="w-full min-h-[70px] bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-purple resize-none placeholder-zinc-700 leading-relaxed font-mono"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 leading-relaxed font-medium bg-zinc-950/80 p-3.5 rounded-xl border border-white/[0.02]">
              <Info className="w-4 h-4 text-brand-purple shrink-0" />
              <span>PostFlow automatically prepends these visual branding instructions when querying Gemini image generations in Creative Studio.</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: BRAND PREVIEWS & SUMMARIES (Col Span 5) */}
        <div className="xl:col-span-4 lg:sticky lg:top-6 space-y-6">
          
          {/* Brand Preview panel */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Brand Preview</span>
            <p className="text-[10px] text-zinc-500">This is how your brand attributes will be adapted inside AI output creations.</p>

            {/* Mock generated branding card visual */}
            <div className="rounded-2xl border border-white/5 overflow-hidden bg-zinc-950 p-4.5 relative space-y-3 shadow-2xl">
              
              {/* Dynamic Header color stripe */}
              <div className="h-1 rounded-full w-full" style={{ backgroundColor: colors[0] }} />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-brand-purple/20 flex items-center justify-center font-bold text-xs text-brand-purple">
                  MP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{name}</h4>
                  <p className="text-[8px] text-zinc-500 leading-none mt-0.5">{tagline}</p>
                </div>
              </div>

              {/* Landscape graphic mockup */}
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/5 relative bg-black">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-indigo/35 via-brand-purple/10 to-transparent flex items-end p-3.5">
                  <div>
                    <span className="text-[7px] font-bold uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-white backdrop-filter backdrop-blur-md">Featured Product</span>
                    <h5 className="text-[11px] font-bold text-white mt-1 pr-6 leading-tight">Explore the peaks. Gear designed for extreme summits.</h5>
                  </div>
                </div>
                {/* Visual highlight indicator */}
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ backgroundColor: colors[1] }} />
              </div>

              <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                "Our peak series delivers pure carbon fiber structures that feel incredibly light. Built for {industry} enthusiasts."
              </p>
            </div>
          </div>

          {/* Brand Summary Specs List */}
          <div className="p-6 rounded-[2rem] bg-zinc-950/40 border border-white/5 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Brand Summary</span>
            
            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 space-y-3.5 text-xs font-medium">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/[0.02]">
                <span className="text-zinc-500">Industry</span>
                <span className="text-white font-bold text-[10px] uppercase font-mono">{industry}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2.5 border-b border-b border-white/[0.02]">
                <span className="text-zinc-500">Tone Personality</span>
                <span className="text-zinc-300 font-bold truncate max-w-[140px]">{tone}</span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500">Visual Aesthetic Preset</span>
                <p className="text-[10px] text-zinc-400 bg-black/40 p-2.5 rounded-lg border border-white/[0.02] font-mono leading-relaxed">{basePrompt}</p>
              </div>

              <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-semibold pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Identity protected and synced.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
