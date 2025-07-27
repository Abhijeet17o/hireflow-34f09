#!/bin/bash

# 🚀 HireFlow GitHub Setup Script
# This script helps you push your HireFlow project to GitHub

echo "🚀 HireFlow GitHub Setup"
echo "======================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check for existing remote
if git remote get-url origin 2>/dev/null; then
    echo "✅ Git remote already exists:"
    git remote get-url origin
else
    echo "📝 Please create a GitHub repository first:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Repository name: hireflow"
    echo "   3. Make it public (for free Netlify)"
    echo "   4. Don't initialize with README"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    
    # Add remote
    git remote add origin "$repo_url"
    echo "✅ Added remote: $repo_url"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes found. Committing..."
    git add .
    git commit -m "🚀 Frontend ready for Netlify deployment

✨ Features:
- React 19 + TypeScript + Vite
- Google OAuth authentication
- Neon PostgreSQL integration
- Modern TailwindCSS UI
- Campaign & candidate management
- Kanban pipeline with drag-and-drop
- WhatsApp-style communication hub
- CSV bulk import
- Netlify deployment ready

🛠️ Tech Stack:
- Frontend: React, TypeScript, Vite
- Database: Neon (Serverless PostgreSQL)
- Authentication: Google OAuth 2.0
- Styling: TailwindCSS
- Hosting: Netlify ready

🚀 Ready for deployment!"
    echo "✅ Changes committed!"
fi

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "🎉 Success! Your code is now on GitHub!"
echo ""
echo "🌐 Next Steps:"
echo "   1. Go to https://netlify.com"
echo "   2. Click 'New site from Git'"
echo "   3. Connect your GitHub repository"
echo "   4. Add environment variables"
echo "   5. Deploy!"
echo ""
echo "📖 Full deployment guide: ./NETLIFY_DEPLOYMENT.md"
