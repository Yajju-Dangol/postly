import { create } from 'zustand';
import { generateImage as geminiGenerateImage } from '../api/gemini';
import { renderBrandingGraphic } from '../api/nanobanana';
import { useAuthStore } from './useAuthStore';

export const useStudioStore = create((set, get) => ({
  prompt: '',
  stylePreset: 'Photorealistic',
  aspectRatio: '1:1',
  brandingEnabled: false,
  credits: 2450,
  generating: false,
  renderingBrand: false,
  selectedImageId: 0,
  gallery: [],

  setPrompt: (prompt) => set({ prompt }),
  setStylePreset: (stylePreset) => set({ stylePreset }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setBrandingEnabled: (brandingEnabled) => set({ brandingEnabled }),
  setSelectedImageId: (selectedImageId) => set({ selectedImageId }),

  deductCredits: (amount = 10) => {
    set((state) => ({ credits: Math.max(0, state.credits - amount) }));
  },

  generateGeminiImage: async () => {
    const { prompt, stylePreset, aspectRatio, credits, brandingEnabled } = get();
    if (!prompt.trim()) throw new Error('Prompt description is empty');
    if (credits < 10) throw new Error('Insufficient AI generation credits');

    set({ generating: true });
    try {
      const base64 = await geminiGenerateImage(prompt, {
        aspectRatio,
        style: stylePreset,
        brandDetails: brandingEnabled ? useAuthStore.getState().brandDetails : null
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
