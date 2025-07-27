# 🚀 HireFlow GitHub Setup Script (PowerShell)
# This script helps you push your HireFlow project to GitHub

Write-Host "🚀 HireFlow GitHub Setup" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git not initialized. Run: git init" -ForegroundColor Red
    exit 1
}

# Check for existing remote
try {
    $remote = git remote get-url origin 2>$null
    Write-Host "✅ Git remote already exists: $remote" -ForegroundColor Green
} catch {
    Write-Host "📝 Please create a GitHub repository first:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "   2. Repository name: hireflow" -ForegroundColor White
    Write-Host "   3. Make it public (for free Netlify)" -ForegroundColor White
    Write-Host "   4. Don't initialize with README" -ForegroundColor White
    Write-Host ""
    
    $repo_url = Read-Host "Enter your GitHub repository URL"
    
    # Add remote
    git remote add origin $repo_url
    Write-Host "✅ Added remote: $repo_url" -ForegroundColor Green
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Uncommitted changes found. Committing..." -ForegroundColor Yellow
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
    Write-Host "✅ Changes committed!" -ForegroundColor Green
}

# Push to GitHub
Write-Host "🔄 Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "🎉 Success! Your code is now on GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Go to https://netlify.com" -ForegroundColor White
Write-Host "   2. Click 'New site from Git'" -ForegroundColor White
Write-Host "   3. Connect your GitHub repository" -ForegroundColor White
Write-Host "   4. Add environment variables" -ForegroundColor White
Write-Host "   5. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full deployment guide: ./NETLIFY_DEPLOYMENT.md" -ForegroundColor Yellow
