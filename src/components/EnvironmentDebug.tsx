import { useEffect, useState } from 'react';

export function EnvironmentDebug() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check all VITE_ environment variables
    const viteVars = {
      VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'NOT SET',
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'NOT SET',
      VITE_APP_URL: import.meta.env.VITE_APP_URL || 'NOT SET',
      VITE_DATABASE_URL: import.meta.env.VITE_DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
    };
    setEnvVars(viteVars);
  }, []);

  return (
    <div className="fixed top-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="font-bold mb-2">Environment Variables Debug</h3>
      <div className="space-y-1 text-sm">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-mono">{key}:</span>
            <span className={value === 'NOT SET' ? 'text-red-400' : 'text-green-400'}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Current URL: {window.location.href}
      </div>
    </div>
  );
}
