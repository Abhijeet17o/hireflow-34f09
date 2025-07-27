# 🔧 Google OAuth Setup & Troubleshooting

## ❌ Common Error: "Access blocked: Authorization Error 401"

This error happens when Google OAuth isn't properly configured. Here's how to fix it:

## ✅ **Step-by-Step Fix:**

### Step 1: Get Your Netlify URL
After deploying to Netlify, you'll get a URL like:
- `https://amazing-name-123456.netlify.app` (random name)
- `https://your-custom-name.netlify.app` (if you changed it)

**📝 Write down your exact Netlify URL** - you'll need it for the next steps.

### Step 2: Google Cloud Console Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**

2. **Create/Select Project**
   - Click the project dropdown (top left)
   - "New Project" or select existing
   - Name: `HireFlow` or any name you prefer

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and press "ENABLE"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"

5. **Configure OAuth Client**
   - **Name**: `HireFlow Frontend`
   - **Authorized JavaScript origins**: 
     ```
     https://your-actual-netlify-url.netlify.app
     ```
   - **Authorized redirect URIs**: 
     ```
     https://your-actual-netlify-url.netlify.app
     https://your-actual-netlify-url.netlify.app/callback
     ```

6. **Copy Client ID**
   - After creating, copy the "Client ID" (starts with numbers)
   - **Don't copy the Client Secret** - we only need the Client ID

### Step 3: Add Client ID to Netlify

1. **Go to Netlify Dashboard**
   - Find your site
   - Go to "Site settings" → "Environment variables"

2. **Add Environment Variable**
   - **Key**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your copied Client ID (paste exactly)

3. **Trigger Redeploy**
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for deployment to complete

### Step 4: Test the Fix

1. **Visit your Netlify site**
2. **Try signing in with Google**
3. **Should work now!** ✅

## 🔍 **Still Getting Errors?**

### Error: "This app isn't verified"
- This is normal for new apps
- Click "Advanced" → "Go to [Your App] (unsafe)"
- This warning will disappear once you verify your app later

### Error: "redirect_uri_mismatch"
- Your Netlify URL doesn't match what's in Google Console
- Double-check the URLs are **exactly** the same
- Make sure you're using `https://` not `http://`

### Error: "Invalid Client ID"
- The Client ID in Netlify doesn't match Google Console
- Copy the Client ID again from Google Console
- Make sure there are no extra spaces when pasting

## 📋 **Quick Checklist:**

- ✅ Google project created
- ✅ Google+ API enabled
- ✅ OAuth 2.0 Client ID created
- ✅ Correct Netlify URL added to authorized origins
- ✅ Client ID copied to Netlify environment variables
- ✅ Site redeployed after adding environment variable

## 🎯 **Example Configuration:**

If your Netlify URL is `https://hireflow-demo.netlify.app`:

**Google Console Authorized Origins:**
```
https://hireflow-demo.netlify.app
```

**Google Console Authorized Redirect URIs:**
```
https://hireflow-demo.netlify.app
https://hireflow-demo.netlify.app/callback
```

**Netlify Environment Variable:**
```
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
```

## 🆘 **Need Help?**

If you're still getting errors:
1. Share your exact Netlify URL
2. Share the exact error message
3. Confirm you've followed all steps above

The most common issue is URL mismatch - make sure your Netlify URL is **exactly** the same in Google Console and that you redeployed after adding the Client ID!
