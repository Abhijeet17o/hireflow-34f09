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
    // Parse request body
    let event: AnalyticsEvent;
    try {
      event = await req.json();
    } catch (parseError) {
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
      return new Response(JSON.stringify({ error: 'Missing required fields: eventType and timestamp' }), {
        status: 400,
        headers,
      });
    }

    // For production, use Neon database
    if (process.env.NEON_DATABASE_URL) {
      const sql = neon(process.env.NEON_DATABASE_URL);
      
      // Test database connection first
      try {
        await sql`SELECT 1 as test`;
      } catch (dbError) {
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
        return new Response(JSON.stringify({ 
          error: 'Failed to insert analytics event',
          details: insertError instanceof Error ? insertError.message : 'Unknown insert error'
        }), {
          status: 500,
          headers,
        });
      }
    } else {
      // Fallback for development - just log the event
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
