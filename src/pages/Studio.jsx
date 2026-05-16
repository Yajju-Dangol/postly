import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Send, Loader2, ArrowLeft, Download, Share2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const Studio = ({ onBack, onSelectImage }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

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
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: prompt,
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
    <div className="pl-[80px] min-h-screen bg-black text-white p-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white/80 to-white/40 bg-clip-text text-transparent">
                Creative Studio
              </h1>
              <p className="text-white/40 text-sm mt-1">Powered by Gemini 3.1 Flash</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-white/40">
              Experimental
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
                What are you imagining?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create in detail..."
                className="w-full bg-transparent border-none outline-none text-lg resize-none min-h-[200px] placeholder:text-white/10"
              />
              
              <div className="mt-6 space-y-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {['1:1', '16:9', '9:16', '4:3', '3:2'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        aspectRatio === ratio
                          ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                          : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {['1K', '2K', '4K'].map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${
                          resolution === res
                            ? 'text-white'
                            : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={generateImage}
                    disabled={isGenerating || !prompt.trim()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-500 ${
                      isGenerating || !prompt.trim()
                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                        : 'bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ImageIcon size={16} className="text-white/40" />
                Tips for better results
              </h3>
              <ul className="space-y-3 text-sm text-white/40">
                <li className="flex gap-2">
                  <span className="text-white/20">•</span>
                  Describe the scene, lighting, and mood in detail.
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20">•</span>
                  Specify the style (e.g., "3D render", "oil painting", "minimalist").
                </li>
                <li className="flex gap-2">
                  <span className="text-white/20">•</span>
                  Mention photography terms like "macro", "wide angle", or "bokeh".
                </li>
              </ul>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7">
            <div className="aspect-square bg-white/5 border border-white/10 rounded-[40px] overflow-hidden relative group">
              {generatedImage ? (
                <>
                  <img 
                    src={generatedImage} 
                    alt="Generated content" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <button 
                      onClick={() => onSelectImage(generatedImage)}
                      className="px-6 py-3 bg-white text-black rounded-2xl font-medium flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                      <Send size={18} />
                      Use in Post
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors border border-white/10">
                      <Download size={20} />
                    </button>
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
              <div className="mt-6 flex justify-center">
                <p className="text-white/20 text-xs italic">
                  SynthID watermarked • Generated with Gemini 3.1 Flash
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
