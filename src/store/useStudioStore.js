import { create } from 'zustand';
import { generateImage as geminiGenerateImage } from '../api/gemini';
import { renderBrandingGraphic } from '../api/nanobanana';
import { useAuthStore } from './useAuthStore';

export const useStudioStore = create((set, get) => ({
  prompt: '',
  stylePreset: 'Photorealistic',
  aspectRatio: '1:1',
  credits: 2450,
  generating: false,
  renderingBrand: false,
  selectedImageId: 0,
  gallery: [
    {
      id: 0,
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      prompt: 'Modern coffee shop aesthetic with cinematic lighting and minimalist branding.',
      aspectRatio: '1:1',
      style: 'Photorealistic'
    },
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
      prompt: 'Abstract liquid neon metal flows, violet and royal purple light hues.',
      aspectRatio: '1:1',
      style: 'Minimalist'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
      prompt: 'Sleek dark fitness center, neon green highlights, motivating typography.',
      aspectRatio: '1:1',
      style: 'Modern Brand Style'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      prompt: 'Cyberpunk street view, glowing holograms, cinematic light, watercolor style.',
      aspectRatio: '1:1',
      style: 'Watercolor'
    }
  ],

  setPrompt: (prompt) => set({ prompt }),
  setStylePreset: (stylePreset) => set({ stylePreset }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setSelectedImageId: (selectedImageId) => set({ selectedImageId }),

  deductCredits: (amount = 10) => {
    set((state) => ({ credits: Math.max(0, state.credits - amount) }));
  },

  generateGeminiImage: async () => {
    const { prompt, stylePreset, aspectRatio, credits } = get();
    if (!prompt.trim()) throw new Error('Prompt description is empty');
    if (credits < 10) throw new Error('Insufficient AI generation credits');

    set({ generating: true });
    try {
      const base64 = await geminiGenerateImage(prompt, {
        aspectRatio,
        style: stylePreset
      });

      const newImage = {
        id: Date.now(),
        url: `data:image/png;base64,${base64}`,
        prompt,
        aspectRatio,
        style: stylePreset
      };

      set((state) => ({
        gallery: [newImage, ...state.gallery],
        selectedImageId: newImage.id,
        credits: state.credits - 10
      }));
      return newImage.url;
    } catch (err) {
      console.error('Gemini image generation store error:', err);
      throw err;
    } finally {
      set({ generating: false });
    }
  },

  generateNanobananaBrandAsset: async (title, customSlogan) => {
    const { credits } = get();
    if (credits < 15) throw new Error('Insufficient credits for branding template render');

    set({ renderingBrand: true });
    try {
      const brandDetails = useAuthStore.getState().brandDetails;
      
      const dataUrl = await renderBrandingGraphic({
        title: title || brandDetails.name,
        slogan: customSlogan || brandDetails.tagline,
        colors: brandDetails.colors,
        industry: brandDetails.industry,
        tone: brandDetails.tone
      });

      const newImage = {
        id: Date.now(),
        url: dataUrl,
        prompt: `Nanobanana Pro Template: ${title || brandDetails.name} | Slogan: ${customSlogan || brandDetails.tagline}`,
        aspectRatio: '16:9',
        style: 'Modern Brand Style'
      };

      set((state) => ({
        gallery: [newImage, ...state.gallery],
        selectedImageId: newImage.id,
        credits: state.credits - 15
      }));
      
      return dataUrl;
    } catch (err) {
      console.error('Nanobanana branding render store error:', err);
      throw err;
    } finally {
      set({ renderingBrand: false });
    }
  }
}));
