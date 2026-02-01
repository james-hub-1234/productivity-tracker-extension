// Load and display visits when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadVisits();
  
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
    
    // Display visits (newest first)
    const container = document.getElementById('visits-container');
    container.innerHTML = '';
    
    const sortedVisits = visits.slice().reverse();
    
    sortedVisits.forEach(visit => {
      const visitEl = createVisitElement(visit);
      container.appendChild(visitEl);
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
  
  // Average rating
  if (visits.length > 0) {
    const avgRating = visits.reduce((sum, v) => sum + v.rating, 0) / visits.length;
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

function createVisitElement(visit) {
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
  
  div.innerHTML = `
    <div class="visit-header">
      <div>
        <span class="visit-site">${visit.hostname}</span>
        <span class="visit-rating rating-${visit.rating}">${visit.rating}/5</span>
      </div>
      <span class="visit-time">${timeString}</span>
    </div>
    ${categoriesHtml}
    <div class="visit-excuse">"${visit.excuse}"</div>
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
