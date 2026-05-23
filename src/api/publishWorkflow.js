import { createPost } from './buffer';
import { uploadToCloudinary } from './cloudinary';

/**
 * Consolidated working logic for publishing a post to Buffer.
 * This abstracts the media upload and the sequential posting to protect rate limits.
 * 
 * @param {Object} params - The post parameters
 * @param {string} params.text - The caption/text content
 * @param {Array<string>} params.selectedChannels - Array of channel IDs to post to
 * @param {Array<Object>} params.channels - The full channels array from the store (to check service type)
 * @param {string} params.scheduleMode - 'later' or 'queue'
 * @param {Date} params.startDate - Custom date if scheduleMode is 'later'
 * @param {string|File} params.imageUrl - Data URL or File for upload
 * @param {File} params.rawFile - The raw File object if available
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const publishPostWorkflow = async ({
  text,
  selectedChannels,
  channels,
  scheduleMode,
  startDate,
  imageUrl,
  rawFile
}) => {
  if (!text || selectedChannels.length === 0) {
    return { success: false, message: 'Missing text or channels' };
  }

  const mode = scheduleMode === 'later' ? 'customScheduled' : 'addToQueue';
  const dueAt = mode === 'customScheduled' ? startDate.toISOString() : null;
  
  let apiImageUrl = imageUrl;

  // 1. Media Pipeline (Upload to Cloudinary first)
  if (imageUrl?.startsWith('data:')) {
    try {
      apiImageUrl = await uploadToCloudinary(rawFile || imageUrl);
    } catch (err) {
      return { success: false, message: 'Image upload failed: ' + err.message };
    }
  }

  const assets = apiImageUrl ? [{ url: apiImageUrl }] : [];

  // 2. Sequential Requests (Buffer rate limit protection)
  const bufferPostIds = [];
  try {
    for (const channelId of selectedChannels) {
      const channel = channels.find(c => String(c.id) === String(channelId));
      
      const result = await createPost({ 
        text, 
        channelId, 
        mode, 
        dueAt,
        assets,
        service: channel?.service || null
      });
      
      if (result?.error) {
        return { success: false, message: result.message };
      }
      
      if (result?.post?.id) {
        bufferPostIds.push(result.post.id);
      }
    }
    
    return { 
      success: true, 
      message: 'Successfully scheduled to all channels',
      bufferPostId: bufferPostIds[0] || null,
      mediaUrl: apiImageUrl
    };
  } catch (err) {
    return { success: false, message: 'An unexpected error occurred: ' + err.message };
  }
};
