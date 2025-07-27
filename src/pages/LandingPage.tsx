import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
  const { isAuthenticated, needsOnboarding, isLoading } = useAuth();

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

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // User is authenticated and onboarded - redirect to dashboard
  return <Navigate to="/dashboard" replace />;
}
