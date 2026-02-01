# 📊 Productivity Tracker Chrome Extension

A Chrome extension that helps you track and reduce time wasted on unproductive websites through ratings, excuses, and AI-powered insights.

## Features

- ⏱️ **Time Tracking**: Automatically tracks how long you spend on each site
- 🎯 **Productivity Ratings**: Rate each visit from 1-5
- 📝 **Category Checkboxes**: Smart categories generated from your excuse patterns
- 💡 **AI Insights**: Get personalized patterns and suggestions
- ⚙️ **Customizable Sites**: Add/remove sites to track
- 💾 **Data Export/Import**: Backup and restore your data
- 📊 **Dashboard**: View stats, insights, and full history

## Installation

### From Source (Latest Version)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `productivity-tracker` folder
6. Done! The extension is now installed

### Quick Download

Download the latest release from the [Releases](../../releases) page.

## Usage

### First Time Setup

1. Click the extension icon in your toolbar
2. Click "⚙️ Settings" to customize which sites to track
3. Visit any tracked site (e.g., reddit.com, youtube.com)
4. You'll see a popup asking you to rate your visit

### Rating a Visit

When you visit a tracked site:
1. **Rate 1-5**: How productive was this visit?
2. **Select categories** (if rating 1-3): Why are you here?
3. **Add notes** (optional): Additional context
4. **Submit**: Your visit is logged

### Viewing Your Data

Click the extension icon to see:
- **Total visits** tracked
- **Average rating** across all visits
- **Time wasted** on unproductive sites
- **AI Insights** about your patterns
- **Full history** of all visits with ratings, categories, and excuses

### Managing Sites

1. Click "⚙️ Settings" in the dashboard
2. **Add sites**: Type domain (e.g., `twitter.com`) and click Add
3. **Remove sites**: Click Remove next to custom sites
4. Default sites are built-in but can be edited in `config.js`

### Backing Up Data

**Before updating the extension:**
1. Click "💾 Export" to download your data as JSON
2. Update the extension
3. Click "📂 Import" to restore your data

## Default Tracked Sites

- reddit.com
- twitter.com / x.com
- youtube.com
- facebook.com
- instagram.com
- tiktok.com
- linkedin.com
- netflix.com
- hulu.com
- And more... (see `config.js`)

## Customization

### Adding More Sites

**Option 1: Use Settings UI**
- Click "⚙️ Settings" → Add site

**Option 2: Edit config.js**
```javascript
const UNPRODUCTIVE_SITES = [
  'reddit.com',
  'twitter.com',
  'your-site-here.com',  // Add your own
];
```

### Adjusting Cooldown Period

Edit `config.js`:
```javascript
// How long to wait before prompting again (default: 5 minutes)
const PROMPT_COOLDOWN = 300000; // milliseconds
```

## AI Insights Examples

After 5+ visits, you'll see insights like:
- 🔥 "You visit **reddit.com** the most (47 times)"
- ⏰ "You've spent **5h 23m** on unproductive sites"
- 🧠 "Your most common excuse is **procrastinating**"
- 📅 "You're most distracted in the **afternoon** (14:00)"
- 📉 "Your average productivity rating is **2.1/5** - time to make a change?"

## File Structure

```
productivity-tracker/
├── manifest.json          # Extension configuration
├── config.js             # Site list and settings
├── background.js         # Background service worker
├── content.js           # Popup overlay on websites
├── popup.html           # Dashboard UI
├── popup.js            # Dashboard logic
├── settings.html       # Settings page UI
├── settings.js        # Settings page logic
└── icons/            # Extension icons
```

## Privacy

- **All data stays local**: Nothing is sent to external servers
- **Your data, your control**: Export and delete anytime
- **No tracking**: Extension only monitors sites you configure

## Development

### Building from Source

1. Clone the repo:
```bash
git clone https://github.com/yourusername/productivity-tracker-extension.git
cd productivity-tracker-extension
```

2. Make your changes

3. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the folder

### Testing

Test the extension by:
1. Visiting tracked sites
2. Checking popup appears
3. Verifying data in dashboard
4. Testing export/import

## Future Ideas

- [ ] Weekly email summaries
- [ ] Browser time limits
- [ ] Gamification (compete with friends)
- [ ] Mobile app sync
- [ ] Pomodoro timer integration
- [ ] Block sites after X minutes
- [ ] Shame mode (share stats publicly)

## Changelog

### v4.0 (Latest)
- ✨ Added AI insights
- ✨ Time tracking
- ✨ Category checkboxes
- ✨ Settings page for site management
- ✨ Data export/import
- 🐛 Fixed button text overflow
- 🐛 Enter key now submits

### v3.0
- ✨ Category detection from excuses
- ✨ Better dashboard stats

### v2.0
- ✨ Rating system
- ✨ Excuse tracking

### v1.0
- ✨ Initial release

## Contributing

Pull requests welcome! For major changes, please open an issue first.

## License

MIT License - feel free to use and modify!

## Author

Built by James Furnary

## Support

Found a bug? Have a feature request? Open an issue!

---

**If this extension helps you, star the repo! ⭐**
