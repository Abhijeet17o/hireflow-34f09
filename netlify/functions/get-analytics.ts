interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  userId?: string;
  currency?: string;
}

export default async (req: Request) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const query: AnalyticsQuery = {
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      eventType: url.searchParams.get('eventType') || undefined,
      userId: url.searchParams.get('userId') || undefined,
      currency: url.searchParams.get('currency') || undefined,
    };

    // For production, use Neon database
    if (process.env.NEON_DATABASE_URL) {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.NEON_DATABASE_URL);
      
      // Build dynamic WHERE conditions
      let whereConditions = ['1=1'];
      
      if (query.startDate) {
        whereConditions.push(`timestamp >= '${query.startDate}'`);
      }
      
      if (query.endDate) {
        whereConditions.push(`timestamp <= '${query.endDate}'`);
      }
      
      if (query.eventType) {
        whereConditions.push(`event_type = '${query.eventType}'`);
      }
      
      if (query.userId) {
        whereConditions.push(`user_id = '${query.userId}'`);
      }
      
      if (query.currency) {
        whereConditions.push(`currency = '${query.currency}'`);
      }

      // Get conversion funnel data
      const conversionFunnel = await sql`
        SELECT 
          event_type,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT session_id) as unique_sessions
        FROM analytics_events 
        WHERE ${sql.unsafe(whereConditions.join(' AND '))}
        GROUP BY event_type
        ORDER BY count DESC
      `;

      // Get currency breakdown
      const currencyStats = await sql`
        SELECT 
          currency,
          COUNT(*) as count
        FROM analytics_events 
        WHERE event_type = 'pricing_page_viewed' 
        AND currency IS NOT NULL
        AND ${sql.unsafe(whereConditions.join(' AND '))}
        GROUP BY currency
        ORDER BY count DESC
      `;

      // Get recent events
      const recentEvents = await sql`
        SELECT 
          id,
          event_type,
          event_data,
          user_email,
          timestamp,
          currency
        FROM analytics_events 
        WHERE ${sql.unsafe(whereConditions.join(' AND '))}
        ORDER BY timestamp DESC
        LIMIT 50
      `;

      // Calculate summary stats
      const totalEvents = conversionFunnel.reduce((sum: number, row: any) => sum + parseInt(row.count), 0);
      const uniqueUsers = Math.max(...conversionFunnel.map((row: any) => parseInt(row.unique_users) || 0));

      return new Response(JSON.stringify({ 
        success: true, 
        data: {
          conversionFunnel,
          currencyStats,
          recentEvents,
          summary: {
            totalEvents,
            uniqueUsers,
            topEvent: conversionFunnel[0]?.event_type || 'none',
            topCurrency: currencyStats[0]?.currency || 'USD'
          }
        },
        query,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } else {
      // Fallback mock data for development
      const mockData = {
        conversionFunnel: [
          { event_type: 'dashboard_viewed', count: 25, unique_users: 15, unique_sessions: 18 },
          { event_type: 'upgrade_button_clicked', count: 18, unique_users: 12, unique_sessions: 14 },
          { event_type: 'pricing_page_viewed', count: 15, unique_users: 10, unique_sessions: 12 },
          { event_type: 'buy_now_clicked', count: 8, unique_users: 6, unique_sessions: 7 },
          { event_type: 'feedback_submitted', count: 3, unique_users: 3, unique_sessions: 3 },
        ],
        currencyStats: [
          { currency: 'USD', count: 8 },
          { currency: 'INR', count: 4 },
          { currency: 'EUR', count: 2 },
          { currency: 'GBP', count: 1 },
        ],
        recentEvents: [
          {
            id: 1,
            event_type: 'pricing_page_viewed',
            event_data: { source: 'dashboard', currency: 'USD' },
            timestamp: new Date().toISOString(),
            user_email: null,
            currency: 'USD'
          },
        ],
        summary: {
          totalEvents: 69,
          uniqueUsers: 15,
          topEvent: 'dashboard_viewed',
          topCurrency: 'USD'
        }
      };

      return new Response(JSON.stringify({ 
        success: true, 
        data: mockData,
        query,
        mode: 'development',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Analytics query error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
