# Updating the Extension from GitHub

## ⚠️ Important: Chrome Extensions Don't Auto-Update from GitHub

Chrome extensions can only auto-update if they're published on the Chrome Web Store. Since this is a private/development extension, you'll need to manually update.

## Method 1: Manual Update (Recommended for Development)

### When a New Version is Released on GitHub:

1. **Export your data** (in case something goes wrong):
   - Open the extension popup
   - Click "💾 Export"
   - Save the JSON file

2. **Download the latest version**:
   - Go to: https://github.com/jamesfurnary/productivity-tracker-extension
   - Click "Code" → "Download ZIP"
   - Or use git: `git pull origin main`

3. **Update in Chrome**:
   - Go to `chrome://extensions/`
   - Find "Productivity Tracker"
   - Click the refresh icon (🔄)
   - Or remove and re-add the extension

4. **Import your data** (if needed):
   - Click "📂 Import"
   - Select your exported JSON file

## Method 2: Using Git (For Developers)

If you cloned the repo with git:

```bash
cd productivity-tracker-extension
git pull origin main
```

Then in Chrome:
- Go to `chrome://extensions/`
- Click refresh icon on the extension

## Method 3: Publishing to Chrome Web Store (Auto-Updates)

If you want true auto-updates, you need to publish to Chrome Web Store:

1. **Create a developer account**:
   - Go to: https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time fee

2. **Package the extension**:
   ```bash
   zip -r productivity-tracker.zip productivity-tracker/
   ```

3. **Upload to Chrome Web Store**:
   - Upload the ZIP
   - Fill out listing details
   - Submit for review

4. **Users get auto-updates**:
   - Chrome checks for updates every few hours
   - Users automatically get new versions

### Pros of Chrome Web Store:
- ✅ Automatic updates for all users
- ✅ Wider distribution
- ✅ Verified by Google

### Cons:
- ❌ $5 fee
- ❌ Review process (can take days)
- ❌ Public listing (unless unlisted)

## Method 4: Self-Hosted Auto-Updates (Advanced)

You can set up auto-updates without the Chrome Web Store:

1. Host an `update.xml` file on a public server
2. Add `update_url` to manifest.json
3. Chrome will check this URL for updates

**This is complex and not recommended for personal use.**

## Recommended Workflow

**For personal use:**
- Keep it as a local extension
- Update manually when needed (takes 30 seconds)
- Use git to pull latest changes

**To share with others:**
- Publish to Chrome Web Store
- Everyone gets auto-updates
- Worth the $5 if you have 5+ users

## Checking for Updates

Currently, you need to manually check GitHub for new releases:
- Watch the repo to get notifications
- Check the [Releases](https://github.com/jamesfurnary/productivity-tracker-extension/releases) page
- Look for version number changes in `manifest.json`

## Future: Adding Update Notifications

We could add a feature that checks GitHub API for new releases and notifies you in the extension. Want me to build that?
