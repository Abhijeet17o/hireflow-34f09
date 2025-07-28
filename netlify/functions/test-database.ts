// Test function to verify Neon database connection
export default async (req: Request) => {
  try {
    console.log('🧪 Testing database connection...');
    console.log('Environment variables check:');
    console.log('- NEON_DATABASE_URL exists:', !!process.env.NEON_DATABASE_URL);
    console.log('- NEON_DATABASE_URL length:', process.env.NEON_DATABASE_URL?.length || 0);

    if (!process.env.NEON_DATABASE_URL) {
      return new Response(JSON.stringify({
        error: 'NEON_DATABASE_URL environment variable not found',
        suggestion: 'Add NEON_DATABASE_URL to your Netlify environment variables',
        format: 'postgresql://username:password@host:port/database'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.NEON_DATABASE_URL);

    // Test basic connection
    const testResult = await sql`SELECT NOW() as current_time, 'Hello from Neon!' as message`;
    console.log('✅ Database connection successful:', testResult[0]);

    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('analytics_events', 'user_feedback')
    `;
    
    const existingTables = tablesResult.map(row => row.table_name);
    console.log('📋 Existing tables:', existingTables);

    // Check analytics_events table structure if it exists
    let tableStructure: any = null;
    if (existingTables.includes('analytics_events')) {
      const columnsResult = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'analytics_events' 
        ORDER BY ordinal_position
      `;
      tableStructure = columnsResult;
    }

    // Test insert (and rollback)
    let testInsertResult: any = null;
    if (existingTables.includes('analytics_events')) {
      try {
        testInsertResult = await sql`
          INSERT INTO analytics_events (event_type, event_data, timestamp) 
          VALUES ('test_connection', '{"test": true}', NOW()) 
          RETURNING id, event_type, timestamp
        `;
        console.log('✅ Test insert successful:', testInsertResult?.[0]);
        
        // Clean up test record
        await sql`DELETE FROM analytics_events WHERE event_type = 'test_connection'`;
        console.log('🧹 Test record cleaned up');
      } catch (insertError: any) {
        console.error('❌ Test insert failed:', insertError);
        testInsertResult = { error: insertError.message };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Database connection test completed',
      results: {
        connectionTest: testResult[0],
        existingTables,
        tableStructure,
        testInsert: testInsertResult
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Database connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Verify NEON_DATABASE_URL is correctly set in Netlify environment variables',
        'Check if database tables exist (run analytics_schema.sql)',
        'Verify database credentials and permissions',
        'Check Neon database status and connectivity'
      ]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
