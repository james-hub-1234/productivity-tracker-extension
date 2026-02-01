// Load sites from config and storage
document.addEventListener('DOMContentLoaded', () => {
  loadSites();
  
  // Add site button
  document.getElementById('add-site-btn').addEventListener('click', addSite);
  
  // Enter key in input
  document.getElementById('new-site-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  });
});

function loadSites() {
  chrome.storage.local.get(['customSites'], (result) => {
    const customSites = result.customSites || [];
    
    // Get default sites from background script
    chrome.runtime.sendMessage({ action: 'getDefaultSites' }, (response) => {
      const defaultSites = response.sites || [];
      const allSites = [...new Set([...defaultSites, ...customSites])].sort();
      
      displaySites(allSites, defaultSites);
    });
  });
}

function displaySites(sites, defaultSites) {
  const container = document.getElementById('sites-list');
  container.innerHTML = '';
  
  sites.forEach(site => {
    const item = document.createElement('div');
    item.className = 'site-item';
    
    const name = document.createElement('span');
    name.className = 'site-name';
    name.textContent = site;
    
    const isDefault = defaultSites.includes(site);
    
    if (!isDefault) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => removeSite(site));
      
      item.appendChild(name);
      item.appendChild(removeBtn);
    } else {
      const defaultLabel = document.createElement('span');
      defaultLabel.style.color = '#999';
      defaultLabel.style.fontSize = '12px';
      defaultLabel.textContent = '(default)';
      
      item.appendChild(name);
      item.appendChild(defaultLabel);
    }
    
    container.appendChild(item);
  });
}

function addSite() {
  const input = document.getElementById('new-site-input');
  const site = input.value.trim().toLowerCase().replace(/^www\./, '');
  
  if (!site) {
    alert('Please enter a site name');
    return;
  }
  
  // Basic validation
  if (!site.includes('.')) {
    alert('Please enter a valid domain (e.g., twitter.com)');
    return;
  }
  
  chrome.storage.local.get(['customSites'], (result) => {
    const customSites = result.customSites || [];
    
    if (customSites.includes(site)) {
      alert('This site is already in the list');
      return;
    }
    
    customSites.push(site);
    chrome.storage.local.set({ customSites: customSites }, () => {
      input.value = '';
      loadSites();
      
      // Notify background script to reload sites
      chrome.runtime.sendMessage({ action: 'reloadSites' });
    });
  });
}

function removeSite(site) {
  if (!confirm(`Remove ${site} from tracking?`)) {
    return;
  }
  
  chrome.storage.local.get(['customSites'], (result) => {
    const customSites = result.customSites || [];
    const updated = customSites.filter(s => s !== site);
    
    chrome.storage.local.set({ customSites: updated }, () => {
      loadSites();
      
      // Notify background script to reload sites
      chrome.runtime.sendMessage({ action: 'reloadSites' });
    });
  });
}
