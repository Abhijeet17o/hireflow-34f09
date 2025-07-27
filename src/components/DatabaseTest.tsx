import { useEffect, useState } from 'react';
import { initializeDatabase, saveUser, getUser } from '../services/database';

export function DatabaseTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    try {
      setStatus('testing');
      setMessage('Initializing database...');
      
      // Initialize database
      await initializeDatabase();
      setMessage('Database initialized. Testing user operations...');
      
      // Test saving a user
      const testUser = {
        id: 'test-123',
        email: 'test@example.com',
        name: 'Test User',
        verified_email: true,
        onboarding_completed: false
      };
      
      await saveUser(testUser);
      setMessage('Test user saved. Retrieving user...');
      
      // Test getting a user
      const retrievedUser = await getUser('test@example.com');
      
      if (retrievedUser) {
        setStatus('success');
        setMessage(`Database working! User: ${retrievedUser.name}`);
      } else {
        setStatus('error');
        setMessage('Database test failed - could not retrieve user');
      }
      
    } catch (error) {
      setStatus('error');
      setMessage(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (status === 'testing') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span>✅</span>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <span>❌</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
