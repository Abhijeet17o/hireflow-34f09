import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function DatabaseDebugger() {
  const { user, saveCampaignData, getUserCampaignsData } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testDatabaseConnection = async () => {
    setTestResult('Testing...');
    
    console.log('🧪 DATABASE TEST STARTING...');
    console.log('🧪 Current user:', user);
    
    if (!user) {
      setTestResult('❌ No user authenticated');
      return;
    }

    console.log('🧪 User ID:', user.id);
    console.log('🧪 User Email:', user.email);

    // Test saving a campaign
    try {
      const testCampaign = {
        title: 'Test Campaign ' + Date.now(),
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: 'Mid-level',
        jobDescription: 'Test job description',
        requirements: 'Test requirements',
        openings: 1
      };

      console.log('🧪 Attempting to save test campaign...');
      const saveResult = await saveCampaignData(testCampaign);
      console.log('🧪 Save result:', saveResult);

      if (saveResult) {
        console.log('🧪 Attempting to retrieve campaigns...');
        const campaigns = await getUserCampaignsData();
        console.log('🧪 Retrieved campaigns:', campaigns);
        
        setTestResult(`✅ Success! Saved campaign and retrieved ${campaigns.length} campaigns`);
      } else {
        setTestResult('❌ Failed to save campaign');
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
      setTestResult(`❌ Error: ${error}`);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold">Database Debugger</h3>
        <p>❌ No user authenticated - please login first</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded">
      <h3 className="font-bold">Database Debugger</h3>
      <p><strong>User ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Name:</strong> {user.name}</p>
      
      <button 
        onClick={testDatabaseConnection}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Database Connection
      </button>
      
      {testResult && (
        <div className="mt-2 p-2 bg-white border rounded">
          {testResult}
        </div>
      )}
    </div>
  );
}
