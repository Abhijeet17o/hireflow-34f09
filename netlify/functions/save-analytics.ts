interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, any>;
  userInfo?: { id: string; email: string };
  timestamp: string;
  currency?: string;
  sessionId?: string;
}

export default async (req: Request) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const event: AnalyticsEvent = await req.json();
    
    // Validate required fields
    if (!event.eventType || !event.timestamp) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('📊 Received analytics event:', event.eventType);
    console.log('🌍 Environment check - NEON_DATABASE_URL exists:', !!process.env.NEON_DATABASE_URL);

    // For production, use Neon database
    if (process.env.NEON_DATABASE_URL) {
      console.log('🔌 Attempting database connection...');
      
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.NEON_DATABASE_URL);
      
      // Test database connection first
      try {
        await sql`SELECT 1 as test`;
        console.log('✅ Database connection successful');
      } catch (dbError) {
        console.error('❌ Database connection failed:', dbError);
        throw new Error(`Database connection failed: ${dbError}`);
      }
      
      const result = await sql`
        INSERT INTO analytics_events (
          event_type, 
          event_data, 
          user_id, 
          user_email, 
          timestamp, 
          ip_address, 
          user_agent,
          currency,
          session_id
        ) VALUES (
          ${event.eventType},
          ${JSON.stringify(event.eventData)},
          ${event.userInfo?.id || null},
          ${event.userInfo?.email || null},
          ${event.timestamp},
          ${req.headers.get('x-forwarded-for') || null},
          ${req.headers.get('user-agent') || null},
          ${event.currency || null},
          ${event.sessionId || null}
        ) RETURNING id
      `;

      console.log('✅ Analytics saved to database with ID:', result[0]?.id);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Analytics event saved to database',
        eventId: `evt_${result[0]?.id}`,
        databaseId: result[0]?.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.log('⚠️  No NEON_DATABASE_URL found - running in dev mode');
      
      // Fallback for development - just log the event
      console.log('Analytics Event (Dev Mode):', {
        eventType: event.eventType,
        eventData: event.eventData,
        userInfo: event.userInfo,
        timestamp: event.timestamp,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        currency: event.currency,
        sessionId: event.sessionId,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Analytics event logged (dev mode)',
        eventId: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        note: 'Add NEON_DATABASE_URL environment variable for database storage'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Analytics error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to save analytics event',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: 'Check NEON_DATABASE_URL environment variable and database schema'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
