export default async (req: Request) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    console.log('🔍 Environment Debug Function Started');
    
    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      NEON_DATABASE_URL_EXISTS: !!process.env.NEON_DATABASE_URL,
      NEON_DATABASE_URL_LENGTH: process.env.NEON_DATABASE_URL?.length || 0,
      NEON_DATABASE_URL_PREFIX: process.env.NEON_DATABASE_URL?.substring(0, 20) + '...',
      NETLIFY_DATABASE_URL_UNPOOLED_EXISTS: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
      VITE_DATABASE_URL_EXISTS: !!process.env.VITE_DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      NETLIFY: !!process.env.NETLIFY,
    };

    console.log('Environment check:', envCheck);

    // Try to connect to database if NEON_DATABASE_URL exists
    let connectionResult: any = null;
    if (process.env.NEON_DATABASE_URL) {
      try {
        console.log('🔌 Attempting database connection...');
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.NEON_DATABASE_URL);
        
        const result = await sql`SELECT 1 as test, NOW() as current_time`;
        connectionResult = {
          success: true,
          result: result[0],
          message: 'Database connection successful'
        };
        console.log('✅ Database connection successful:', result[0]);
      } catch (dbError) {
        connectionResult = {
          success: false,
          error: dbError instanceof Error ? dbError.message : 'Unknown database error',
          errorType: dbError instanceof Error ? dbError.constructor.name : 'Unknown',
        };
        console.error('❌ Database connection failed:', dbError);
      }
    }

    // Test analytics table access
    let analyticsTableTest: any = null;
    if (process.env.NEON_DATABASE_URL && connectionResult?.success) {
      try {
        console.log('📊 Testing analytics table access...');
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(process.env.NEON_DATABASE_URL);
        
        const tableCheck = await sql`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'analytics_events'
          ORDER BY ordinal_position
        `;
        
        analyticsTableTest = {
          success: true,
          columnsFound: tableCheck.length,
          columns: tableCheck.map(col => ({ name: col.column_name, type: col.data_type }))
        };
        console.log('✅ Analytics table accessible:', analyticsTableTest);
      } catch (tableError) {
        analyticsTableTest = {
          success: false,
          error: tableError instanceof Error ? tableError.message : 'Unknown table error',
          errorType: tableError instanceof Error ? tableError.constructor.name : 'Unknown',
        };
        console.error('❌ Analytics table test failed:', tableError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      databaseConnection: connectionResult,
      analyticsTable: analyticsTableTest,
      message: 'Environment diagnostic completed'
    }, null, 2), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Debug function error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, null, 2), {
      status: 500,
      headers,
    });
  }
};
