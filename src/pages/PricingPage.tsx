import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, ArrowLeft, Zap, Users, Brain, Shield } from 'lucide-react';
import { analytics, ANALYTICS_EVENTS } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';

export function PricingPage() {
  const { user } = useAuth();

  useEffect(() => {
    // Track pricing page view
    analytics.track(
      ANALYTICS_EVENTS.PRICING_VIEWED,
      { 
        source: 'direct_navigation',
        referrer: document.referrer
      },
      user ? { id: user.id, email: user.email } : undefined
    );
  }, [user]);

  const handleBuyNowClick = () => {
    analytics.track(
      ANALYTICS_EVENTS.BUY_NOW_CLICKED,
      { 
        plan: 'starter_pro',
        price: 29
      },
      user ? { id: user.id, email: user.email } : undefined
    );
  };

  const features = [
    'Unlimited job campaigns',
    'Advanced AI-powered screening',
    'Smart candidate matching',
    'Automated interview scheduling',
    'Custom email templates',
    'Analytics and reporting',
    'Priority customer support',
    'API access',
    'Team collaboration tools',
    'White-label options'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">HireFlow Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            <span>Limited Time - Early Bird Pricing</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Supercharge Your Hiring
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              with AI-Powered Recruiting
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform your recruitment process with advanced AI features, unlimited campaigns, 
            and tools that help you find the perfect candidates faster than ever.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative">
            {/* Popular Badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>

            <div className="p-8 pt-12">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Crown className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Starter Pro</h3>
                </div>
                <p className="text-gray-600">Perfect for growing teams</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-5xl font-bold text-gray-900">$29</span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Billed monthly • Cancel anytime</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                to="/coming-soon"
                onClick={handleBuyNowClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Crown className="h-5 w-5" />
                <span>Get Started with Pro</span>
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                30-day money-back guarantee • No setup fees
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Secure & Compliant</h4>
            <p className="text-sm text-gray-600">Enterprise-grade security with GDPR compliance</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Team Collaboration</h4>
            <p className="text-sm text-gray-600">Built for teams of all sizes to work together</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
            <p className="text-sm text-gray-600">Latest AI technology for smarter recruiting</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">What's included in the Pro plan?</h4>
              <p className="text-gray-600">Everything you see listed above, plus priority support and early access to new features.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600">We offer a 30-day money-back guarantee, so you can try all Pro features risk-free.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
