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

-- Example queries for analytics dashboard:
-- SELECT event_type, COUNT(*) as count, COUNT(DISTINCT user_id) as unique_users 
-- FROM analytics_events 
-- WHERE timestamp >= NOW() - INTERVAL '30 days' 
-- GROUP BY event_type;

-- SELECT currency, COUNT(*) as currency_views 
-- FROM analytics_events 
-- WHERE event_type = 'pricing_page_viewed' 
-- GROUP BY currency;
