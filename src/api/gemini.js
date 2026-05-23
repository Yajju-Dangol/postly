import { GoogleGenAI } from "@google/genai";

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const loadLogoPart = async (logoUrl) => {
  if (!logoUrl) return null;

  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    const data = await fileToBase64(blob);

    return {
      inlineData: {
        data,
        mimeType: blob.type || 'image/png'
      }
    };
  } catch (err) {
    console.warn('[Gemini Branding] Logo could not be attached:', err);
    return null;
  }
};

const buildBrandContext = (brandDetails) => {
  if (!brandDetails) return '';

  const colors = Array.isArray(brandDetails.colors)
    ? brandDetails.colors.filter(Boolean).join(', ')
    : '';

  return `
Branding is enabled. Add a tasteful, premium brand touch using this business profile:
- Business name: ${brandDetails.name || 'Not specified'}
- Tagline: ${brandDetails.tagline || 'Not specified'}
- Industry: ${brandDetails.industry || 'Not specified'}
- Tone of voice: ${brandDetails.tone || 'Professional and modern'}
- Visual colors: ${colors || 'Not specified'}
- Brand guidelines: ${brandDetails.description || 'Not specified'}
- Base visual instruction: ${brandDetails.basePrompt || 'A highly professional, premium image.'}
${brandDetails.logoUrl ? '- A logo reference image is attached. Preserve its identity and integrate it subtly where appropriate.' : ''}
Keep the branding polished and natural. Do not overcrowd the image with text unless the prompt asks for text.`;
};

export const generateImage = async (prompt, options = {}) => {
  const { aspectRatio = '1:1', style = 'Photorealistic', brandDetails = null } = options;
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key not found. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Use default fallback if store is not accessible directly in api (it shouldn't be generally, but we'll try)
  const basePrompt = "You are a professional image generation assistant.";
  const fullPrompt = `${basePrompt}
Required Aesthetic/Style: ${style}.
Create the following as a ${aspectRatio} aspect ratio image: ${prompt}
${buildBrandContext(brandDetails)}`;

  // Process aspect ratio to match Gemini API expected values
  // e.g. "1:1 (Square)" -> "1:1"
  const ratioStr = aspectRatio.split(' ')[0] || '1:1';

  try {
    const logoPart = await loadLogoPart(brandDetails?.logoUrl);
    const contents = logoPart
      ? [{ text: fullPrompt }, logoPart]
      : fullPrompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents,
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: ratioStr,
          imageSize: "1K",
        }
      }
    });

    const parts = response.candidates[0].content.parts;
    const imagePart = [...parts].reverse().find(part => part.inlineData && !part.thought)
      || [...parts].reverse().find(part => part.inlineData);
    
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
