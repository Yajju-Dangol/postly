import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Building2, Save, Upload, Link as LinkIcon, Camera, LayoutTemplate, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BentoGrid, BentoItem } from '../components/BentoGrid';

export const BusinessDetails = () => {
  const brandDetails = useStore((state) => state.brandDetails);
  const setBrandDetails = useStore((state) => state.setBrandDetails);
  const showToast = useStore((state) => state.showToast);

  const [formData, setFormData] = useState({
    logoUrl: brandDetails.logoUrl || '',
    basePrompt: brandDetails.basePrompt || '',
    industry: brandDetails.industry || '',
    tone: brandDetails.tone || '',
    style: brandDetails.style || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setBrandDetails(formData);
    showToast('Brand details saved successfully!', 2000);
  };

  return (
    <div className="flex min-h-screen bg-black pl-[80px] text-white">
      <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto animate-in fade-in duration-700">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#050505] border-none rounded-xl flex items-center justify-center text-white">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Business Details</h1>
              <p className="text-white/40 text-sm mt-1">Configure your brand identity for Studio AI generations</p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            size="lg"
            className="flex items-center gap-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] py-5 px-6"
          >
            <Save size={18} />
            Save Details
          </Button>
        </header>

        <BentoGrid>
          {/* Logo & Identity */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <BentoItem title="Brand Logo" className="flex-none h-auto">
              <div className="flex items-start gap-6 mt-4">
                <div className="w-24 h-24 bg-[#0a0a0a] border-none rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 group relative">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Brand Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={32} className="text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm">
                    <Upload size={20} />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Logo URL</Label>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                      <Input 
                        name="logoUrl"
                        value={formData.logoUrl}
                        onChange={handleChange}
                        placeholder="https://..." 
                        className="bg-[#050505] border-none pl-11 rounded-xl py-6 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </BentoItem>

            <BentoItem title="Company Profile" className="flex-1 h-auto">
              <div className="space-y-6 mt-4">
                <div>
                  <Label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Industry</Label>
                  <Input 
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Technology, Fashion, Finance..." 
                    className="bg-[#050505] border-none rounded-xl py-6 shadow-inner"
                  />
                </div>
                <div>
                  <Label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Brand Tone</Label>
                  <Input 
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    placeholder="e.g. Professional and modern, Playful..." 
                    className="bg-[#050505] border-none rounded-xl py-6 shadow-inner"
                  />
                </div>
              </div>
            </BentoItem>
          </div>

          {/* AI Generation Context */}
          <BentoItem className="span-2 h-full" title="Studio AI Context">
            <p className="text-sm text-white/40 mb-8 mt-2 leading-relaxed">
              These settings act as the foundation for the Gemini model in the Creative Studio. They will be prepended to all your prompts to ensure generations align with your brand identity.
            </p>

            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col min-h-[160px]">
                <Label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Custom Base Prompt</Label>
                <Textarea 
                  name="basePrompt"
                  value={formData.basePrompt}
                  onChange={handleChange}
                  placeholder="A highly professional, premium image..." 
                  className="bg-[#050505] border-none rounded-xl flex-1 resize-none py-4 px-4 shadow-inner"
                />
              </div>

              <div>
                <Label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 px-1">Visual Style (Aesthetic)</Label>
                <Input 
                  name="style"
                  value={formData.style}
                  onChange={handleChange}
                  placeholder="e.g. Photorealistic, 3D Render, Flat Vector..." 
                  className="bg-[#050505] border-none rounded-xl py-6 shadow-inner"
                />
              </div>
            </div>
          </BentoItem>
        </BentoGrid>
      </main>
    </div>
  );
};
