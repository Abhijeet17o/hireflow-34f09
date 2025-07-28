import { neon } from '@neondatabase/serverless';

interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, any>;
  userInfo?: { id: string; email: string };
  timestamp: string;
  currency?: string;
  sessionId?: string;
}

export default async (req: Request) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    });
  }

  try {
    console.log('🚀 Starting analytics save function...');
    
    // Parse request body
    let event: AnalyticsEvent;
    try {
      event = await req.json();
      console.log('📊 Parsed analytics event:', {
        eventType: event.eventType,
        hasEventData: !!event.eventData,
        timestamp: event.timestamp,
        currency: event.currency
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }), {
        status: 400,
        headers,
      });
    }
    
    // Validate required fields
    if (!event.eventType || !event.timestamp) {
      console.error('❌ Missing required fields:', { eventType: event.eventType, timestamp: event.timestamp });
      return new Response(JSON.stringify({ error: 'Missing required fields: eventType and timestamp' }), {
        status: 400,
        headers,
      });
    }

    console.log('🌍 Environment check - NEON_DATABASE_URL exists:', !!process.env.NEON_DATABASE_URL);

    // For production, use Neon database
    if (process.env.NEON_DATABASE_URL) {
      console.log('🔌 Connecting to Neon database...');
      
      const sql = neon(process.env.NEON_DATABASE_URL);
      
      // Test database connection first
      try {
        const connectionTest = await sql`SELECT 1 as test, NOW() as current_time`;
        console.log('✅ Database connection successful:', connectionTest[0]);
      } catch (dbError) {
        console.error('❌ Database connection failed:', dbError);
        return new Response(JSON.stringify({ 
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        }), {
          status: 500,
          headers,
        });
      }
      
      // Insert analytics event
      try {
        console.log('💾 Inserting analytics event...');
        
        // Extract the first IP address from x-forwarded-for header
        const forwardedFor = req.headers.get('x-forwarded-for');
        const connectingIp = req.headers.get('cf-connecting-ip');
        let clientIp: string | null = null;
        
        if (forwardedFor) {
          // Extract first IP from comma-separated list
          clientIp = forwardedFor.split(',')[0].trim();
        } else if (connectingIp) {
          clientIp = connectingIp.trim();
        }
        
        console.log('🌐 Client IP extracted:', clientIp);
        
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
            ${clientIp},
            ${req.headers.get('user-agent') || null},
            ${event.currency || null},
            ${event.sessionId || null}
          ) RETURNING id, timestamp
        `;

        console.log('✅ Analytics saved to database:', result[0]);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Analytics event saved to database',
          eventId: `evt_${result[0]?.id}`,
          databaseId: result[0]?.id,
          timestamp: result[0]?.timestamp
        }), {
          status: 200,
          headers,
        });
      } catch (insertError) {
        console.error('❌ Failed to insert analytics event:', insertError);
        return new Response(JSON.stringify({ 
          error: 'Failed to insert analytics event',
          details: insertError instanceof Error ? insertError.message : 'Unknown insert error'
        }), {
          status: 500,
          headers,
        });
      }
    } else {
      console.log('⚠️  No NEON_DATABASE_URL found - running in dev mode');
      
      // Fallback for development - just log the event
      console.log('Analytics Event (Dev Mode):', {
        eventType: event.eventType,
        eventData: event.eventData,
        userInfo: event.userInfo,
        timestamp: event.timestamp,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
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
        headers,
      });
    }

  } catch (error) {
    console.error('❌ Unexpected analytics error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(JSON.stringify({ 
      error: 'Failed to save analytics event',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown error type',
      troubleshooting: 'Check Netlify function logs for more details'
    }), {
      status: 500,
      headers,
    });
  }
};
