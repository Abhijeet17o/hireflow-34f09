import { Crown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analytics, ANALYTICS_EVENTS } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeButtonProps {
  variant?: 'banner' | 'button' | 'card';
  className?: string;
}

export function UpgradeButton({ variant = 'button', className = '' }: UpgradeButtonProps) {
  const { user } = useAuth();

  const handleUpgradeClick = () => {
    analytics.track(
      ANALYTICS_EVENTS.UPGRADE_CLICKED,
      { 
        variant,
        location: 'dashboard'
      },
      user ? { id: user.id, email: user.email } : undefined
    );
  };

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white shadow-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Upgrade to HireFlow Pro</h3>
              <p className="text-purple-100 text-sm">Unlock advanced AI features and unlimited campaigns</p>
            </div>
          </div>
          <Link
            to="/pricing"
            onClick={handleUpgradeClick}
            className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Upgrade Now</span>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors duration-200 ${className}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for More Power?</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Upgrade to Pro for unlimited campaigns, advanced AI features, and priority support.
        </p>
        <Link
          to="/pricing"
          onClick={handleUpgradeClick}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Crown className="h-4 w-4" />
          <span>View Pricing</span>
        </Link>
      </div>
    );
  }

  // Default button variant
  return (
    <Link
      to="/pricing"
      onClick={handleUpgradeClick}
      className={className.includes('bg-gray') 
        ? `inline-flex items-center space-x-2 ${className}`
        : `btn-primary inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${className}`
      }
    >
      <Crown className="h-4 w-4" />
      <span>Upgrade to Pro</span>
    </Link>
  );
}
