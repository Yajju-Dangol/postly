import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Send, Loader2, ArrowLeft, Download, Share2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BentoGrid, BentoItem } from '../components/BentoGrid';

export const Studio = ({ onBack, onSelectImage }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const brandDetails = useStore((state) => state.brandDetails);

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const fullPrompt = `${brandDetails.basePrompt}. Industry: ${brandDetails.industry}. Brand Tone: ${brandDetails.tone}. Required Aesthetic/Style: ${brandDetails.style}. Create the following: ${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: fullPrompt,
        config: {
          responseModalities: ["IMAGE"],
          responseFormat: {
            image: {
              aspectRatio: aspectRatio,
              imageSize: resolution,
            }
          }
        }
      });

      const parts = response.candidates[0].content.parts;
      const imagePart = parts.find(part => part.inlineData);
      
      if (imagePart) {
        const base64Data = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
        setGeneratedImage(`data:${mimeType};base64,${base64Data}`);
      } else {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black pl-[80px] text-white">
      <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              size="icon"
              onClick={onBack}
              className="rounded-full bg-transparent border-none hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                Creative Studio
              </h1>
              <p className="text-white/40 text-sm mt-1">Powered by Gemini 3.1 Flash</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-white/5 border-none rounded-full text-[10px] uppercase tracking-widest text-white/40">
              Experimental
            </div>
          </div>
        </div>

        <BentoGrid>
          {/* Input Section */}
          <BentoItem className="span-2" title="Generation Prompt">
            <div className="flex flex-col space-y-6 h-full">
              <div className="flex-1 bg-[#050505] rounded-xl p-5 shadow-inner min-h-[260px]">
                <Label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 px-1">
                  What are you imagining?
                </Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create in detail..."
                className="w-full bg-transparent border-none outline-none text-lg resize-none min-h-[180px] placeholder:text-[#333] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-white"
              />
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
                  {['1:1', '16:9', '9:16', '4:3', '3:2'].map((ratio) => (
                    <Button
                      key={ratio}
                      variant="outline"
                      size="sm"
                      onClick={() => setAspectRatio(ratio)}
                      className={`rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all h-8 border-none ${
                        aspectRatio === ratio
                          ? 'bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10'
                          : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {ratio}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2 px-1">
                    {['1K', '2K', '4K'].map((res) => (
                      <Button
                        key={res}
                        variant="ghost"
                        size="sm"
                        onClick={() => setResolution(res)}
                        className={`rounded-lg text-[9px] font-black h-6 transition-all ${
                          resolution === res
                            ? 'text-white hover:text-white'
                            : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                        {res}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={generateImage}
                    disabled={isGenerating || !prompt.trim()}
                    className={`rounded-xl font-medium transition-all duration-500 h-12 px-6 ${
                      isGenerating || !prompt.trim()
                        ? 'bg-white/5 text-white/20 cursor-not-allowed hover:bg-white/5'
                        : 'bg-white text-black hover:scale-105 active:scale-95 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>

            {error && (
              <div className="p-4 bg-red-500/10 border-none rounded-xl text-red-400 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="bg-[#050505] rounded-xl p-5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-white/40" />
                Tips for better results
              </h3>
              <ul className="space-y-3 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                <li className="flex gap-3 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  Describe the scene, lighting, and mood in detail.
                </li>
                <li className="flex gap-3 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  Specify the style (e.g., "3D render", "oil painting", "minimalist").
                </li>
                <li className="flex gap-3 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  Mention photography terms like "macro", "wide angle", or "bokeh".
                </li>
              </ul>
            </div>
            </div>
          </BentoItem>

          {/* Preview Section */}
          <BentoItem className="span-2" title="Studio Output">
            <div className="aspect-square bg-[#050505] rounded-xl overflow-hidden relative group">
              {generatedImage ? (
                <>
                  <img 
                    src={generatedImage} 
                    alt="Generated content" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <Button 
                      onClick={() => onSelectImage(generatedImage)}
                      className="bg-white text-black hover:bg-white rounded-xl font-medium flex items-center gap-2 hover:scale-105 transition-transform h-12 px-6"
                    >
                      <Send size={18} />
                      Use in Post
                    </Button>
                    <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 rounded-xl transition-colors border-none hover:text-white h-12 w-12 text-white">
                      <Download size={20} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 border-2 border-white/5 rounded-full" />
                        <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
                      </div>
                      <p className="text-white/40 animate-pulse uppercase tracking-[0.2em] text-[10px]">Processing Vision...</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={64} strokeWidth={1} />
                      <p className="text-sm font-light tracking-wide">Enter a prompt to start creating</p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {generatedImage && (
              <div className="mt-8 flex justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  SynthID watermarked • Generated with Gemini 3.1 Flash
                </p>
              </div>
            )}
          </BentoItem>
        </BentoGrid>
      </main>
    </div>
  );
};
