# 🚀 HireFlow Frontend Deployment Guide

## 📋 Quick Setup for Netlify + Neon

This guide will help you deploy your HireFlow frontend to Netlify with Neon database in under 15 minutes.

---

## 🗄️ Step 1: Neon Database Setup (5 minutes)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub (recommended)
   - Verify your email

2. **Create Database Project**
   - Click "Create Project"
   - Name: `hireflow-production`
   - Region: Choose closest to your users
   - PostgreSQL version: Latest

3. **Get Connection String**
   - Copy the connection string from dashboard
   - Format: `postgresql://user:pass@host/db?sslmode=require`
   - Save this for environment variables

---

## 🔐 Step 2: Google OAuth Setup (5 minutes)

1. **Google Cloud Console**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project: `hireflow-prod`

2. **Enable API**
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable

3. **Create Credentials**
   - "APIs & Services" → "Credentials"
   - "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized origins: `https://your-site.netlify.app`
   - Copy the Client ID

---

## 🌐 Step 3: GitHub & Netlify Deployment (5 minutes)

### Push to GitHub

1. **Create GitHub Repository**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name: `hireflow`
   - Public repository (for free Netlify)

2. **Push Your Code**
   ```bash
   git remote add origin https://github.com/Abhijeet17o/hireflow.git
   git branch -M main
   git push -u origin main
   ```

### Deploy to Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - "New site from Git" → GitHub
   - Select your repository

2. **Build Settings** (Auto-detected)
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   Site settings → Environment variables:
   ```
   VITE_DATABASE_URL=your-neon-connection-string
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_APP_NAME=HireFlow
   VITE_APP_URL=https://your-site.netlify.app
   ```

4. **Deploy**
   - Click "Deploy site"
   - Build will complete in 2-3 minutes
   - Your site is live! 🎉

---

## ✅ Step 4: Update Google OAuth

1. **Add Production Domain**
   - Go back to Google Cloud Console
   - Update OAuth credentials
   - Add your Netlify URL to authorized origins

2. **Test Authentication**
   - Visit your live site
   - Try Google Sign-In
   - Verify user data saves to database

---

## 🎯 That's It!

Your HireFlow recruitment dashboard is now live at:
**`https://your-site.netlify.app`**

### What You Get:
- ✅ Modern recruitment dashboard
- ✅ Google OAuth authentication  
- ✅ PostgreSQL database (Neon)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Continuous deployment

### Costs:
- **Neon Database**: FREE tier (enough for 1000+ users)
- **Netlify Hosting**: FREE tier (100GB bandwidth)
- **Google OAuth**: FREE
- **Total**: $0/month 💰

---

## 🔧 Troubleshooting

**Build Fails?**
- Check build logs in Netlify
- Verify all environment variables set

**Google Sign-In Not Working?**
- Check authorized origins in Google Console
- Verify Client ID is correct

**Database Connection Issues?**
- Confirm Neon project is active
- Check connection string format

---

## 🚀 Next Steps

1. **Custom Domain** (Optional)
   - Buy domain → Point to Netlify
   - Update Google OAuth settings

2. **Share Your Site**
   - Add to email signature
   - Share with HR team
   - Post on LinkedIn

3. **Monitor Usage**
   - Netlify Analytics
   - Neon Dashboard
   - Google Cloud Console

**Happy recruiting! 🎉**
