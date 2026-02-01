// Import the site configuration
importScripts('config.js');

// Track the last URL we prompted about to avoid duplicate popups
let lastPromptedUrl = '';
let lastPromptTime = 0;

// Track time spent on sites
let siteTimers = {}; // { tabId: { url, startTime } }

// Combined list of sites (default + custom)
let allSites = [...UNPRODUCTIVE_SITES];

// Load custom sites on startup
chrome.storage.local.get(['customSites'], (result) => {
  const customSites = result.customSites || [];
  allSites = [...new Set([...UNPRODUCTIVE_SITES, ...customSites])];
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    startTimer(tabId, tab.url);
    checkIfUnproductive(tab.url, tabId);
  }
});

// Listen for tab activation (switching tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      startTimer(activeInfo.tabId, tab.url);
      checkIfUnproductive(tab.url, activeInfo.tabId);
    }
  });
});

// Listen for tab removal (closing tabs)
chrome.tabs.onRemoved.addListener((tabId) => {
  stopTimer(tabId);
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User left Chrome, stop all timers
    Object.keys(siteTimers).forEach(tabId => stopTimer(parseInt(tabId)));
  }
});

function startTimer(tabId, url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Only track timers for unproductive sites
    const isUnproductive = allSites.some(site => hostname.includes(site));
    
    if (isUnproductive) {
      // Stop any existing timer for this tab
      stopTimer(tabId);
      
      // Start new timer
      siteTimers[tabId] = {
        url: url,
        hostname: hostname,
        startTime: Date.now()
      };
    }
  } catch (e) {
    // Invalid URL, ignore
  }
}

function stopTimer(tabId) {
  if (siteTimers[tabId]) {
    const timer = siteTimers[tabId];
    const timeSpent = Math.round((Date.now() - timer.startTime) / 1000); // seconds
    
    // Only save if they spent more than 5 seconds (avoids accidental clicks)
    if (timeSpent > 5) {
      saveTimeSpent(timer.hostname, timeSpent);
    }
    
    delete siteTimers[tabId];
  }
}

function saveTimeSpent(hostname, seconds) {
  chrome.storage.local.get(['timeSpent'], (result) => {
    const timeSpent = result.timeSpent || {};
    
    if (!timeSpent[hostname]) {
      timeSpent[hostname] = 0;
    }
    
    timeSpent[hostname] += seconds;
    
    chrome.storage.local.set({ timeSpent: timeSpent });
  });
}

function checkIfUnproductive(url, tabId) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Check if this is an unproductive site
    const isUnproductive = allSites.some(site => hostname.includes(site));
    
    if (isUnproductive) {
      const now = Date.now();
      // Only prompt once per URL per cooldown period to avoid spam
      if (lastPromptedUrl !== url || (now - lastPromptTime) > PROMPT_COOLDOWN) {
        lastPromptedUrl = url;
        lastPromptTime = now;
        
        // Send message to content script to show the rating popup
        chrome.tabs.sendMessage(tabId, {
          action: 'showRatingPopup',
          url: url,
          hostname: hostname
        });
      }
    }
  } catch (e) {
    // Invalid URL, ignore
  }
}

// Listen for messages from content script (when user submits rating)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveRating') {
    saveVisit(request.data);
    sendResponse({ success: true });
  } else if (request.action === 'getCategories') {
    getCategories().then(categories => {
      sendResponse({ categories: categories });
    });
    return true; // Keep channel open for async response
  } else if (request.action === 'getInsights') {
    getInsights().then(insights => {
      sendResponse({ insights: insights });
    });
    return true;
  } else if (request.action === 'getDefaultSites') {
    sendResponse({ sites: UNPRODUCTIVE_SITES });
  } else if (request.action === 'reloadSites') {
    // Reload custom sites from storage
    chrome.storage.local.get(['customSites'], (result) => {
      const customSites = result.customSites || [];
      allSites = [...new Set([...UNPRODUCTIVE_SITES, ...customSites])];
    });
    sendResponse({ success: true });
  }
});

async function getCategories() {
  // Get all past excuses
  return new Promise((resolve) => {
    chrome.storage.local.get(['visits', 'categories'], (result) => {
      const visits = result.visits || [];
      let categories = result.categories || [];
      
      // If we have enough excuses and haven't generated categories yet, generate them
      if (visits.length >= 5 && categories.length === 0) {
        const excuses = visits.map(v => v.excuse).filter(e => e && e !== 'Productive visit');
        
        // Use simple keyword extraction to create categories
        // (We'll enhance this with actual AI in a moment)
        categories = extractCategories(excuses);
        
        // Save categories for future use
        chrome.storage.local.set({ categories: categories });
      }
      
      resolve(categories);
    });
  });
}

function extractCategories(excuses) {
  // Common patterns in excuses
  const categoryKeywords = {
    'Mental break / Relaxing': ['break', 'relax', 'decompress', 'destress', 'rest', 'chill'],
    'Procrastinating': ['procrastinating', 'avoiding', 'putting off', 'dont want to', "don't want"],
    'Work research': ['research', 'work', 'learning', 'looking up', 'finding info', 'checking'],
    'Bored / Killing time': ['bored', 'killing time', 'nothing to do', 'waiting'],
    'Social / Keeping up': ['friends', 'social', 'checking in', 'keeping up', 'see what'],
    'Entertainment / Fun': ['fun', 'entertainment', 'watching', 'enjoying', 'laugh'],
    'News / Current events': ['news', 'current', 'events', 'happening', 'updates'],
  };
  
  // Count how many excuses match each category
  const categoryCounts = {};
  
  Object.keys(categoryKeywords).forEach(category => {
    const keywords = categoryKeywords[category];
    const count = excuses.filter(excuse => {
      const lowerExcuse = excuse.toLowerCase();
      return keywords.some(keyword => lowerExcuse.includes(keyword));
    }).length;
    
    if (count > 0) {
      categoryCounts[category] = count;
    }
  });
  
  // Return categories sorted by frequency
  return Object.keys(categoryCounts)
    .sort((a, b) => categoryCounts[b] - categoryCounts[a])
    .slice(0, 6); // Top 6 categories
}

async function getInsights() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['visits', 'timeSpent'], (result) => {
      const visits = result.visits || [];
      const timeSpent = result.timeSpent || {};
      
      if (visits.length < 5) {
        resolve([]);
        return;
      }
      
      const insights = [];
      
      // Insight 1: Most visited site
      const siteCounts = {};
      visits.forEach(v => {
        siteCounts[v.hostname] = (siteCounts[v.hostname] || 0) + 1;
      });
      const mostVisited = Object.keys(siteCounts).sort((a, b) => siteCounts[b] - siteCounts[a])[0];
      insights.push(`🔥 You visit **${mostVisited}** the most (${siteCounts[mostVisited]} times)`);
      
      // Insight 2: Time wasted
      const totalSeconds = Object.values(timeSpent).reduce((a, b) => a + b, 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) {
        insights.push(`⏰ You've spent **${hours}h ${minutes}m** on unproductive sites`);
      } else if (minutes > 0) {
        insights.push(`⏰ You've spent **${minutes} minutes** on unproductive sites`);
      }
      
      // Insight 3: Most common excuse
      const excuses = visits.map(v => v.excuse).filter(e => e && e !== 'Productive visit');
      const excuseCounts = {};
      excuses.forEach(e => {
        const lower = e.toLowerCase();
        if (lower.includes('break') || lower.includes('relax')) excuseCounts['break'] = (excuseCounts['break'] || 0) + 1;
        if (lower.includes('procrastinating') || lower.includes('avoiding')) excuseCounts['procrastinating'] = (excuseCounts['procrastinating'] || 0) + 1;
        if (lower.includes('bored')) excuseCounts['bored'] = (excuseCounts['bored'] || 0) + 1;
        if (lower.includes('stress')) excuseCounts['stressed'] = (excuseCounts['stressed'] || 0) + 1;
      });
      
      const topExcuse = Object.keys(excuseCounts).sort((a, b) => excuseCounts[b] - excuseCounts[a])[0];
      if (topExcuse) {
        const excuseText = {
          'break': 'taking breaks',
          'procrastinating': 'procrastinating',
          'bored': 'being bored',
          'stressed': 'dealing with stress'
        };
        insights.push(`🧠 Your most common excuse is **${excuseText[topExcuse]}**`);
      }
      
      // Insight 4: Time of day pattern
      const hourCounts = {};
      visits.forEach(v => {
        const hour = new Date(v.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const peakHour = Object.keys(hourCounts).sort((a, b) => hourCounts[b] - hourCounts[a])[0];
      if (peakHour) {
        const timeOfDay = parseInt(peakHour) < 12 ? 'morning' : parseInt(peakHour) < 17 ? 'afternoon' : 'evening';
        insights.push(`📅 You're most distracted in the **${timeOfDay}** (${peakHour}:00)`);
      }
      
      // Insight 5: Productivity trend
      const avgRating = visits.reduce((sum, v) => sum + v.rating, 0) / visits.length;
      if (avgRating < 2.5) {
        insights.push(`📉 Your average productivity rating is **${avgRating.toFixed(1)}/5** - time to make a change?`);
      } else if (avgRating > 3.5) {
        insights.push(`📈 Your average productivity rating is **${avgRating.toFixed(1)}/5** - nice work!`);
      }
      
      resolve(insights.slice(0, 5)); // Return top 5 insights
    });
  });
}

function saveVisit(data) {
  // Get existing visits from storage
  chrome.storage.local.get(['visits'], (result) => {
    const visits = result.visits || [];
    
    // Add new visit
    visits.push({
      url: data.url,
      hostname: data.hostname,
      timestamp: new Date().toISOString(),
      rating: data.rating,
      categories: data.categories || [],
      excuse: data.excuse
    });
    
    // Save back to storage
    chrome.storage.local.set({ visits: visits });
  });
}
