# 🗄️ Neon Database Setup & Troubleshooting Guide

## 📋 Step-by-Step Setup

### 1. **Verify Database Schema**
Run this SQL in your Neon console to create the tables:

```sql
-- Analytics Events Table for HireFlow
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_id VARCHAR(100),
  user_email VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  currency VARCHAR(10),
  session_id VARCHAR(100)
);

-- User Feedback Table
CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  responses JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON user_feedback(timestamp);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON user_feedback(user_email);
```

### 2. **Get Your Connection String**
1. Go to your Neon project dashboard
2. Click "Connection Details"
3. Copy the connection string (it should look like):
   ```
   postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

### 3. **Set Environment Variable in Netlify**
1. Go to your Netlify site dashboard
2. Click "Site Settings" → "Environment Variables"
3. Add new variable:
   - **Key:** `NEON_DATABASE_URL`
   - **Value:** Your connection string from step 2

### 4. **Test Database Connection**
After deployment, visit: `https://yoursite.netlify.app/.netlify/functions/test-database`

This will show you:
- ✅ Database connection status
- 📋 Existing tables
- 🧪 Test insert/delete operation
- 🔍 Detailed error messages if something fails

## 🔧 Troubleshooting Common Issues

### Issue 1: "NEON_DATABASE_URL not found"
**Solution:** Environment variable not set in Netlify
1. Check Netlify dashboard → Site Settings → Environment Variables
2. Make sure `NEON_DATABASE_URL` exists and is correct
3. Redeploy your site after adding the variable

### Issue 2: "Database connection failed"
**Possible causes:**
- Wrong connection string format
- Database credentials expired
- Neon database suspended/deleted
- Network/firewall issues

**Solution:**
1. Verify connection string in Neon dashboard
2. Test connection directly in Neon SQL editor
3. Check if database is active (not suspended)

### Issue 3: "Table does not exist"
**Solution:** Run the schema SQL from step 1 above

### Issue 4: "Permission denied"
**Solution:** 
- Make sure you're using the correct database owner credentials
- Check if your Neon user has INSERT/SELECT permissions

### Issue 5: "Functions not deploying"
**Solution:**
1. Check Netlify build logs for errors
2. Verify all TypeScript files compile correctly
3. Ensure `@neondatabase/serverless` package is installed

## 🧪 Testing Your Setup

### Manual Test in Browser Console:
```javascript
// Test analytics tracking
fetch('/.netlify/functions/save-analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'manual_test',
    eventData: { test: true },
    timestamp: new Date().toISOString(),
    currency: 'USD',
    sessionId: 'test_session'
  })
}).then(r => r.json()).then(console.log);
```

### Check Database Directly:
```sql
-- View all analytics events
SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT 10;

-- Count events by type
SELECT event_type, COUNT(*) as count 
FROM analytics_events 
GROUP BY event_type 
ORDER BY count DESC;

-- View recent events with details
SELECT id, event_type, event_data, timestamp, currency
FROM analytics_events 
WHERE timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

## 📊 What Should Happen When Working

### 1. **User Interactions Trigger Events:**
- Click upgrade button → `upgrade_button_clicked` event
- Visit pricing page → `pricing_page_viewed` event
- Change currency → `currency_changed` event
- Submit feedback → `feedback_submitted` event

### 2. **Console Logs Show Success:**
```
📊 Received analytics event: upgrade_button_clicked
🌍 Environment check - NEON_DATABASE_URL exists: true
🔌 Attempting database connection...
✅ Database connection successful
✅ Analytics saved to database with ID: 123
```

### 3. **Database Gets New Records:**
- New rows appear in `analytics_events` table
- Each event has proper timestamp, event_type, and event_data
- User info included if user is logged in

## 🚨 Current Status Indicators

### ✅ Everything Working:
- Console shows database connection success
- New records appear in Neon database
- Test function returns success response

### ⚠️ Fallback Mode (Development):
- Console shows "No NEON_DATABASE_URL found"
- Events logged to console only
- No database records created

### ❌ Error Mode:
- Console shows connection errors
- 500 error responses from functions
- No data being saved

## 🔍 Debugging Steps

1. **Visit test endpoint:** `/.netlify/functions/test-database`
2. **Check browser console** for error messages
3. **Check Netlify function logs** in dashboard
4. **Verify environment variables** in Netlify settings
5. **Test connection string** directly in Neon SQL editor
6. **Ensure schema is created** by running the SQL above

## 📱 Updated Pricing Info

With the latest changes:
- **USD:** $2.00/month (reduced from $3.00)
- **INR:** ₹150/month (reduced from ₹249)
- **EUR:** €1.84/month
- **GBP:** £1.58/month

The system automatically detects user location and shows appropriate pricing!
