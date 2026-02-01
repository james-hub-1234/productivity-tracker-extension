// ============================================
// PRODUCTIVITY TRACKER - SITE CONFIGURATION
// ============================================
// 
// Edit this list to customize which sites trigger the rating popup.
// Just add or remove sites from the array below.
// 
// NOTE: Don't include "www." - the extension handles that automatically
//
// After editing, reload the extension in chrome://extensions/

const UNPRODUCTIVE_SITES = [
  // Social Media
  'reddit.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'linkedin.com',
  'snapchat.com',
  
  // Video Streaming
  'youtube.com',
  'netflix.com',
  'hulu.com',
  'twitch.tv',
  'disneyplus.com',
  'primevideo.com',
  
  // News & Entertainment
  'cnn.com',
  'espn.com',
  'buzzfeed.com',
  'tmz.com',
  
  // Add your own sites below:
  // 'example.com',
  // 'another-site.com',
];

// How long to wait before prompting again for the same URL (in milliseconds)
// Default: 300000 (5 minutes)
const PROMPT_COOLDOWN = 300000;
