// Video URL utilities for Railway backend

const RAILWAY_BASE_URL = 'https://backend-production-7e4df.up.railway.app';

/**
 * Handles video URLs - returns YouTube URLs as-is, converts relative paths to Railway URLs
 * @param videoPath - Video path (YouTube URL or relative path)
 * @returns Full URL for the video
 */
export const getVideoUrl = (videoPath: string): string => {
  // If it's already a full URL (starts with http), return as is
  if (videoPath.startsWith('http')) {
    return videoPath;
  }
  
  // If it's a relative path, prepend the Railway base URL
  if (videoPath.startsWith('/')) {
    return `${RAILWAY_BASE_URL}${videoPath}`;
  }
  
  // If it doesn't start with /, add it
  return `${RAILWAY_BASE_URL}/${videoPath}`;
};

/**
 * Converts a relative video path to a full Railway backend URL for thumbnails
 * @param thumbnailPath - Relative path like "/videos/milestone-1/thumbnail.jpg"
 * @returns Full URL for the Railway backend
 */
export const getThumbnailUrl = (thumbnailPath: string): string => {
  return getVideoUrl(thumbnailPath);
};

/**
 * Converts a relative audio path to a full Railway backend URL
 * @param audioPath - Relative path like "/videos/milestone-1/sample-audio.mp3"
 * @returns Full URL for the Railway backend
 */
export const getAudioUrl = (audioPath: string): string => {
  return getVideoUrl(audioPath);
};

/**
 * Checks if a URL is a YouTube URL
 * @param url - The URL to check
 * @returns True if it's a YouTube URL
 */
export const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

/**
 * Extracts YouTube video ID from a YouTube URL
 * @param url - YouTube URL
 * @returns YouTube video ID or null
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!isYouTubeUrl(url)) return null;
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
