# GitHub Repository Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository details:
   - **Repository name**: `hireflow`
   - **Description**: `Modern recruitment dashboard with React, TypeScript, and Neon database`
   - **Visibility**: Public (so you can share the link)
   - **Initialize**: DON'T check any boxes (we already have files)
4. Click "Create repository"

## Step 2: Connect Your Local Repository

Copy these commands and run them in your terminal:

```bash
cd "f:\ALL CODE\HireFlow Project"
git remote add origin https://github.com/Abhijeet17o/hireflow.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

### Method A: Direct from GitHub (Recommended)
1. Go to [netlify.com](https://netlify.com) and sign up/sign in
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your `hireflow` repository
5. Build settings (should auto-detect):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

### Method B: Manual Upload
1. In your terminal, run: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `dist` folder to deploy

## Step 4: Configure Environment Variables

After deployment, in Netlify dashboard:

1. Go to Site settings → Environment variables
2. Add these variables:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_DATABASE_URL=your-neon-database-url
   VITE_APP_NAME=HireFlow
   VITE_APP_URL=https://your-site-name.netlify.app
   ```

## Step 5: Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add your Netlify domain to authorized origins:
   - `https://your-site-name.netlify.app`

## Step 6: Set up Neon Database

1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy the connection string
4. Add to Netlify environment variables

## Done!

Your site will be live at: `https://your-site-name.netlify.app`

You can share this link with people to review your recruitment dashboard!
