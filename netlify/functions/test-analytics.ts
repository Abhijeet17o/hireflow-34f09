export default async (req: Request) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    console.log('🧪 Testing save-analytics function...');
    
    // Test data to send to save-analytics
    const testAnalyticsData = {
      eventType: 'test_from_diagnostic',
      eventData: {
        source: 'diagnostic_function',
        test: true,
        timestamp_created: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      currency: 'USD',
      sessionId: `test_session_${Date.now()}`
    };

    console.log('📤 Sending test data to save-analytics:', testAnalyticsData);

    // Make request to save-analytics function
    const response = await fetch('https://hireflow-production.netlify.app/.netlify/functions/save-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAnalyticsData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    let responseData;
    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);

    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = { 
        error: 'Failed to parse response as JSON', 
        rawResponse: responseText,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      };
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      testData: testAnalyticsData,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      },
      message: 'Save-analytics test completed'
    };

    console.log('✅ Test completed:', result);

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('❌ Test function error:', error);
    
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
