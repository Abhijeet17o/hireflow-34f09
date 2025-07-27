import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Authentication flow logic
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - redirect directly to dashboard
  return <Navigate to="/dashboard" replace />;
}
