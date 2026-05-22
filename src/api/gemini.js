import { GoogleGenAI } from "@google/genai";
import { useStore } from '../store/useStore';

export const generateImage = async (prompt, options = {}) => {
  const { aspectRatio = '1:1', style = 'Photorealistic' } = options;
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Use default fallback if store is not accessible directly in api (it shouldn't be generally, but we'll try)
  const basePrompt = "You are a professional image generation assistant.";
  const fullPrompt = `${basePrompt} Required Aesthetic/Style: ${style}. Create the following: ${prompt}`;

  // Process aspect ratio to match Gemini API expected values
  // e.g. "1:1 (Square)" -> "1:1"
  const ratioStr = aspectRatio.split(' ')[0] || '1:1';

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: fullPrompt,
      config: {
        responseModalities: ["IMAGE"],
        responseFormat: {
          image: {
            aspectRatio: ratioStr,
            imageSize: "1K", // Default resolution for compose preview
          }
        }
      }
    });

    const parts = response.candidates[0].content.parts;
    const imagePart = parts.find(part => part.inlineData);
    
    if (imagePart) {
      return imagePart.inlineData.data; // Return base64 string
    } else {
      throw new Error('No image was generated. Please try a different prompt.');
    }
  } catch (err) {
    console.error('Generation error:', err);
    throw new Error(err.message || 'Failed to generate image. Please try again.');
  }
};
