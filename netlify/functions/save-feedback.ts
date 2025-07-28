interface UserFeedback {
  userName?: string;
  userEmail?: string;
  responses: Record<string, any>;
  timestamp: string;
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
    const feedback: UserFeedback = await req.json();
    
    // Validate required fields
    if (!feedback.responses || !feedback.timestamp) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For production, use Neon database
    if (process.env.NEON_DATABASE_URL) {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.NEON_DATABASE_URL);
      
      await sql`
        INSERT INTO user_feedback (
          user_name, 
          user_email, 
          responses, 
          timestamp, 
          ip_address, 
          user_agent
        ) VALUES (
          ${feedback.userName || null},
          ${feedback.userEmail || null},
          ${JSON.stringify(feedback.responses)},
          ${feedback.timestamp},
          ${req.headers.get('x-forwarded-for') || null},
          ${req.headers.get('user-agent') || null}
        )
      `;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Feedback saved to database',
        feedbackId: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Fallback for development - just log the feedback
      console.log('User Feedback (Dev Mode):', {
        userName: feedback.userName,
        userEmail: feedback.userEmail,
        responses: feedback.responses,
        timestamp: feedback.timestamp,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Feedback logged (dev mode)',
        feedbackId: `dev_fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Feedback error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to save feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
