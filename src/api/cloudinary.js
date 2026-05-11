/**
 * CLOUDINARY UPLOAD SERVICE
 * 
 * NOTE: For production, signatures should be generated on the backend
 * to keep the API_SECRET secure. This implementation is for local development.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

export const uploadToCloudinary = async (fileData) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create the signature string
    // Format: timestamp=...<API_SECRET>
    const signatureStr = `timestamp=${timestamp}${API_SECRET}`;
    
    // Generate SHA-1 hash of the signature string
    // We use the browser's SubtleCrypto API for this
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureStr);
    const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append('file', fileData);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log('[Cloudinary Success]:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.error('[Cloudinary Upload Error]:', err);
    throw err;
  }
};
