// Load and display visits when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadVisits();
  initFlagSiteButton();

  // Set up button handlers
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });
  document.getElementById('import-file-input').addEventListener('change', importData);
  document.getElementById('clear-btn').addEventListener('click', clearAllData);
});

function initFlagSiteButton() {
  const btn = document.getElementById('flag-site-btn');

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;

    let hostname;
    try {
      const urlObj = new URL(tab.url);
      // Disable for non-http pages (chrome://, about:, etc.)
      if (!urlObj.protocol.startsWith('http')) {
        btn.textContent = 'Flag Site';
        btn.disabled = true;
        return;
      }
      hostname = urlObj.hostname.replace('www.', '');
    } catch (e) {
      btn.disabled = true;
      return;
    }

    // Check if already tracked (default or custom sites)
    chrome.runtime.sendMessage({ action: 'getDefaultSites' }, (response) => {
      const defaultSites = response.sites || [];
      chrome.storage.local.get(['customSites'], (result) => {
        const customSites = result.customSites || [];
        const allSites = [...defaultSites, ...customSites];
        const isTracked = allSites.some(site => hostname.includes(site));

        if (isTracked) {
          btn.textContent = 'Already Tracked';
          btn.disabled = true;
        } else {
          btn.textContent = 'Flag Site';
          btn.disabled = false;
          btn.addEventListener('click', () => {
            // Add to custom sites
            chrome.storage.local.get(['customSites'], (res) => {
              const sites = res.customSites || [];
              sites.push(hostname);
              chrome.storage.local.set({ customSites: sites }, () => {
                // Tell background to reload site list
                chrome.runtime.sendMessage({ action: 'reloadSites' });
                btn.textContent = 'Flagged!';
                btn.disabled = true;
              });
            });
          });
        }
      });
    });
  });
}

function loadVisits() {
  chrome.storage.local.get(['visits', 'timeSpent'], (result) => {
    const visits = result.visits || [];
    const timeSpent = result.timeSpent || {};

    if (visits.length === 0) {
      return; // Empty state already shown in HTML
    }

    // Calculate stats
    updateStats(visits, timeSpent);

    // Load insights
    loadInsights();

    // Compute per-site averages (only rated visits)
    const siteRatings = {};
    visits.forEach(v => {
      if (v.rating !== null) {
        if (!siteRatings[v.hostname]) siteRatings[v.hostname] = [];
        siteRatings[v.hostname].push(v.rating);
      }
    });
    const siteAverages = {};
    const siteTotalVisits = {};
    visits.forEach(v => {
      siteTotalVisits[v.hostname] = (siteTotalVisits[v.hostname] || 0) + 1;
    });
    Object.keys(siteRatings).forEach(host => {
      const ratings = siteRatings[host];
      siteAverages[host] = {
        avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        totalVisits: siteTotalVisits[host]
      };
    });

    // Show current site banner
    showCurrentSiteBanner(siteAverages, siteTotalVisits);

    // Display visits (newest first)
    const container = document.getElementById('visits-container');
    container.innerHTML = '';

    const sortedVisits = visits.slice().reverse();

    sortedVisits.forEach(visit => {
      const visitEl = createVisitElement(visit, siteAverages);
      container.appendChild(visitEl);
    });
  });
}

function showCurrentSiteBanner(siteAverages, siteTotalVisits) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url) return;

    let hostname;
    try {
      const urlObj = new URL(tab.url);
      if (!urlObj.protocol.startsWith('http')) return;
      hostname = urlObj.hostname.replace('www.', '');
    } catch (e) {
      return;
    }

    // Check if this is a tracked site
    chrome.runtime.sendMessage({ action: 'getDefaultSites' }, (response) => {
      const defaultSites = response.sites || [];
      chrome.storage.local.get(['customSites'], (result) => {
        const customSites = result.customSites || [];
        const allSites = [...defaultSites, ...customSites];
        const isTracked = allSites.some(site => hostname.includes(site));

        if (!isTracked) return;

        const banner = document.getElementById('current-site-banner');
        const totalVisits = siteTotalVisits[hostname] || 0;
        const siteData = siteAverages[hostname];

        if (siteData) {
          banner.innerHTML = `Currently on: <strong>${hostname}</strong> | Avg rating: <strong>${siteData.avg.toFixed(1)}/5</strong> (${totalVisits} visit${totalVisits !== 1 ? 's' : ''})`;
        } else if (totalVisits > 0) {
          banner.innerHTML = `Currently on: <strong>${hostname}</strong> | <strong>${totalVisits}</strong> visit${totalVisits !== 1 ? 's' : ''} (no ratings yet)`;
        } else {
          banner.innerHTML = `Currently on: <strong>${hostname}</strong> | No visits recorded yet`;
        }
        banner.style.display = 'block';
      });
    });
  });
}

function loadInsights() {
  chrome.runtime.sendMessage({ action: 'getInsights' }, (response) => {
    if (response.insights && response.insights.length > 0) {
      const section = document.getElementById('insights-section');
      const container = document.getElementById('insights-container');
      
      container.innerHTML = '';
      response.insights.forEach(insight => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        // Convert markdown-style bold to HTML
        item.innerHTML = insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        container.appendChild(item);
      });
      
      section.style.display = 'block';
    }
  });
}

function updateStats(visits, timeSpent) {
  // Total visits
  document.getElementById('total-visits').textContent = visits.length;
  
  // Average rating (filter out unrated/dismissed visits)
  const ratedVisits = visits.filter(v => v.rating !== null);
  if (ratedVisits.length > 0) {
    const avgRating = ratedVisits.reduce((sum, v) => sum + v.rating, 0) / ratedVisits.length;
    document.getElementById('avg-rating').textContent = avgRating.toFixed(1);
  }
  
  // Time wasted
  const totalSeconds = Object.values(timeSpent).reduce((a, b) => a + b, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    document.getElementById('time-wasted').textContent = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    document.getElementById('time-wasted').textContent = `${minutes}m`;
  } else {
    document.getElementById('time-wasted').textContent = '-';
  }
}

function createVisitElement(visit, siteAverages) {
  const div = document.createElement('div');
  div.className = 'visit';
  
  const timestamp = new Date(visit.timestamp);
  const timeString = timestamp.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Build categories display
  let categoriesHtml = '';
  if (visit.categories && visit.categories.length > 0) {
    categoriesHtml = '<div class="visit-categories">' +
      visit.categories.map(cat => `<span class="visit-category-tag">${cat}</span>`).join('') +
      '</div>';
  }
  
  // Handle null rating (dismissed without rating)
  const ratingBadge = visit.rating !== null
    ? `<span class="visit-rating rating-${visit.rating}">${visit.rating}/5</span>`
    : `<span class="visit-rating rating-unrated">Not rated</span>`;

  // Show site average if more than 1 visit for this site
  const siteData = siteAverages && siteAverages[visit.hostname];
  const siteAvgHtml = siteData && siteData.totalVisits > 1
    ? `<span class="site-avg">site avg: ${siteData.avg.toFixed(1)}</span>`
    : '';

  // Handle null excuse (dismissed without notes)
  const excuseHtml = visit.excuse !== null
    ? `<div class="visit-excuse">"${visit.excuse}"</div>`
    : `<div class="visit-excuse" style="color: #999;">Dismissed without notes</div>`;

  div.innerHTML = `
    <div class="visit-header">
      <div>
        <span class="visit-site">${visit.hostname}</span>
        ${ratingBadge}
        ${siteAvgHtml}
      </div>
      <span class="visit-time">${timeString}</span>
    </div>
    ${categoriesHtml}
    ${excuseHtml}
  `;
  
  return div;
}

function exportData() {
  chrome.storage.local.get(null, (data) => {
    // Export all data as JSON
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Confirm before overwriting
      if (confirm('This will replace all your current data. Continue?')) {
        chrome.storage.local.set(data, () => {
          alert('Data imported successfully!');
          location.reload();
        });
      }
    } catch (error) {
      alert('Error importing data: Invalid file format');
    }
  };
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

function clearAllData() {
  if (confirm('Are you sure you want to delete all tracked data? This cannot be undone.')) {
    chrome.storage.local.set({ visits: [], categories: [], timeSpent: {} }, () => {
      location.reload();
    });
  }
}
