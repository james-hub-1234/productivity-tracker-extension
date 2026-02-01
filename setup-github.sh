#!/bin/bash

# Productivity Tracker - GitHub Setup Script
# This script will help you push the extension to GitHub

echo "🚀 Productivity Tracker - GitHub Setup"
echo "======================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Get GitHub username
echo "Enter your GitHub username (default: jamesfurnary):"
read GITHUB_USERNAME
GITHUB_USERNAME=${GITHUB_USERNAME:-jamesfurnary}

# Get repo name
echo ""
echo "Enter repository name (default: productivity-tracker-extension):"
read REPO_NAME
REPO_NAME=${REPO_NAME:-productivity-tracker-extension}

echo ""
echo "📋 Setup Summary:"
echo "   GitHub User: $GITHUB_USERNAME"
echo "   Repo Name: $REPO_NAME"
echo ""
echo "⚠️  Make sure you've created this repo on GitHub first!"
echo "   Go to: https://github.com/new"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo ""
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Productivity Tracker Chrome Extension v4.0

Features:
- Time tracking
- AI insights
- Category checkboxes
- Settings page
- Data export/import
- Customizable site list"

# Add remote
echo "🔗 Adding GitHub remote..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Create main branch
git branch -M main

# Push
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your extension is now on GitHub:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "📖 Next steps:"
echo "   1. Go to your repo on GitHub"
echo "   2. Add a description and topics"
echo "   3. Create a release (optional)"
echo ""
