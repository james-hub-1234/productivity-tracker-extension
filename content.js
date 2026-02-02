// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showRatingPopup') {
    showRatingPopup(request.url, request.hostname);
  }
});

function showRatingPopup(url, hostname) {
  // Remove any existing popup
  const existing = document.getElementById('productivity-tracker-popup');
  if (existing) {
    existing.remove();
  }

  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'productivity-tracker-popup';
  overlay.innerHTML = `
    <div class="pt-overlay">
      <div class="pt-popup">
        <div class="pt-header">
          <h2>🤔 Hold up!</h2>
          <button class="pt-close" id="pt-close-btn">×</button>
        </div>
        <p class="pt-site">You're visiting: <strong>${hostname}</strong></p>
        
        <div class="pt-rating-section">
          <label>How productive is this visit? (1 = waste of time, 5 = very productive)</label>
          <div class="pt-rating-buttons">
            <button class="pt-rating-btn" data-rating="1">1</button>
            <button class="pt-rating-btn" data-rating="2">2</button>
            <button class="pt-rating-btn" data-rating="3">3</button>
            <button class="pt-rating-btn" data-rating="4">4</button>
            <button class="pt-rating-btn" data-rating="5">5</button>
          </div>
        </div>

        <div class="pt-categories-section" id="pt-categories-section" style="display: none;">
          <label>Why are you here? (select all that apply)</label>
          <div class="pt-categories-container" id="pt-categories-container">
            <div class="pt-loading">Loading categories...</div>
          </div>
        </div>

        <div class="pt-excuse-section" id="pt-excuse-section" style="display: none;">
          <label id="pt-excuse-label">Additional notes (optional)</label>
          <textarea id="pt-excuse" placeholder="e.g., 'avoiding that big presentation', 'looking for weekend plans'"></textarea>
          <button class="pt-submit" id="pt-submit-btn">Submit & Continue</button>
        </div>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .pt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .pt-popup {
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .pt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .pt-header h2 {
      margin: 0;
      font-size: 24px;
      color: #1a1a1a;
    }
    
    .pt-close {
      background: none;
      border: none;
      font-size: 32px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
    
    .pt-close:hover {
      color: #000;
    }
    
    .pt-site {
      color: #666;
      margin-bottom: 24px;
      font-size: 14px;
    }
    
    .pt-site strong {
      color: #1a1a1a;
    }
    
    .pt-rating-section label,
    .pt-categories-section label,
    .pt-excuse-section label {
      display: block;
      margin-bottom: 12px;
      font-weight: 500;
      color: #1a1a1a;
      font-size: 14px;
    }
    
    .pt-rating-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }
    
    .pt-rating-btn {
      flex: 1;
      padding: 12px 4px;
      font-size: 20px;
      font-weight: 600;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .pt-rating-btn:hover {
      border-color: #4CAF50;
      background: #f0f9f0;
    }
    
    .pt-rating-btn.selected {
      border-color: #4CAF50;
      background: #4CAF50;
      color: white;
    }

    .pt-categories-section {
      margin-bottom: 20px;
    }

    .pt-categories-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .pt-loading {
      color: #999;
      font-size: 14px;
      padding: 8px 0;
    }

    .pt-category-checkbox {
      display: none;
    }

    .pt-category-label {
      display: inline-block;
      padding: 10px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
      user-select: none;
    }

    .pt-category-label:hover {
      border-color: #4CAF50;
      background: #f0f9f0;
    }

    .pt-category-checkbox:checked + .pt-category-label {
      border-color: #4CAF50;
      background: #4CAF50;
      color: white;
    }
    
    .pt-excuse-section textarea {
      width: 100%;
      min-height: 80px;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 16px;
      box-sizing: border-box;
    }
    
    .pt-excuse-section textarea:focus {
      outline: none;
      border-color: #4CAF50;
    }
    
    .pt-submit {
      width: 100%;
      padding: 14px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .pt-submit:hover {
      background: #45a049;
    }
    
  `;
  overlay.appendChild(style);
  document.body.appendChild(overlay);

  // Show average rating for this site if prior visits exist
  chrome.storage.local.get(['visits'], (result) => {
    const visits = result.visits || [];
    const siteVisits = visits.filter(v => v.hostname === hostname && v.rating !== null);
    if (siteVisits.length > 0) {
      const avg = siteVisits.reduce((sum, v) => sum + v.rating, 0) / siteVisits.length;
      const avgDiv = document.createElement('p');
      avgDiv.style.cssText = 'color: #888; font-size: 13px; margin-bottom: 16px;';
      avgDiv.textContent = `Your avg rating for this site: ${avg.toFixed(1)}/5`;
      const siteEl = overlay.querySelector('.pt-site');
      if (siteEl) siteEl.insertAdjacentElement('afterend', avgDiv);
    }
  });

  // Add event listeners
  let selectedRating = null;
  let selectedCategories = [];

  // Close button - save as unrated visit before closing
  document.getElementById('pt-close-btn').addEventListener('click', () => {
    saveRating(url, hostname, null, [], null);
    overlay.remove();
  });

  // Rating buttons
  document.querySelectorAll('.pt-rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove selected class from all buttons
      document.querySelectorAll('.pt-rating-btn').forEach(b => b.classList.remove('selected'));
      
      // Add selected class to clicked button
      btn.classList.add('selected');
      selectedRating = parseInt(btn.dataset.rating);
      
      // Show categories for ratings 1-3, notes textarea for all ratings
      if (selectedRating <= 3) {
        loadCategories();
        document.getElementById('pt-categories-section').style.display = 'block';
        document.getElementById('pt-excuse-label').textContent = 'Additional notes (optional)';
        document.getElementById('pt-excuse').placeholder = "e.g., 'avoiding that big presentation', 'looking for weekend plans'";
      } else {
        document.getElementById('pt-categories-section').style.display = 'none';
        document.getElementById('pt-excuse-label').textContent = 'Notes (optional)';
        document.getElementById('pt-excuse').placeholder = "e.g., 'productive research session', 'found what I needed'";
      }
      document.getElementById('pt-excuse-section').style.display = 'block';
    });
  });

  // Load categories from background
  function loadCategories() {
    chrome.runtime.sendMessage({ action: 'getCategories' }, (response) => {
      const container = document.getElementById('pt-categories-container');
      
      if (!response.categories || response.categories.length === 0) {
        container.innerHTML = '<div class="pt-loading">No categories yet - we\'ll learn from your excuses!</div>';
        return;
      }

      container.innerHTML = '';
      
      response.categories.forEach((category, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `category-${index}`;
        checkbox.className = 'pt-category-checkbox';
        checkbox.value = category;
        
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            selectedCategories.push(category);
          } else {
            selectedCategories = selectedCategories.filter(c => c !== category);
          }
        });
        
        const label = document.createElement('label');
        label.htmlFor = `category-${index}`;
        label.className = 'pt-category-label';
        label.textContent = category;
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
      });
    });
  }

  // Submit button (for all ratings)
  document.getElementById('pt-submit-btn').addEventListener('click', () => {
    const excuse = document.getElementById('pt-excuse').value || 'No additional notes';

    saveRating(url, hostname, selectedRating, selectedCategories, excuse);
    overlay.remove();
  });

  // Enter key handler for excuse textarea
  document.getElementById('pt-excuse').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('pt-submit-btn').click();
    }
  });
}

function saveRating(url, hostname, rating, categories, excuse) {
  chrome.runtime.sendMessage({
    action: 'saveRating',
    data: {
      url: url,
      hostname: hostname,
      rating: rating,
      categories: categories,
      excuse: excuse
    }
  });
}
