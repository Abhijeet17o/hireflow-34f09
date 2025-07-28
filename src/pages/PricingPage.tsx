import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, ArrowLeft, Users, Brain, Shield, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { analytics, ANALYTICS_EVENTS } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import { CurrencySelector } from '../components/CurrencySelector';
import { currencyConverter } from '../utils/currency';
import type { Currency } from '../utils/currency';

export function PricingPage() {
  const { user } = useAuth();
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencyConverter.getCurrentCurrency());
  const [priceData, setPriceData] = useState(currencyConverter.getFormattedPriceWithSavings());

  useEffect(() => {
    // Track pricing page view
    analytics.track(
      ANALYTICS_EVENTS.PRICING_VIEWED,
      { 
        source: 'direct_navigation',
        referrer: document.referrer,
        currency: currentCurrency.code
      },
      user ? { id: user.id, email: user.email } : undefined
    );
  }, [user, currentCurrency]);

  const handleCurrencyChange = (currency: Currency) => {
    setCurrentCurrency(currency);
    const newPriceData = currencyConverter.getFormattedPriceWithSavings();
    setPriceData(newPriceData);
    
    analytics.track(ANALYTICS_EVENTS.PRICING_CALCULATED, {
      currency: currency.code,
      price: newPriceData.price,
      savings: newPriceData.savings
    });
  };

  const handleBuyNowClick = () => {
    analytics.track(
      ANALYTICS_EVENTS.BUY_NOW_CLICKED,
      { 
        plan: 'starter_pro',
        price: currencyConverter.convertPrice(),
        currency: currentCurrency.code,
        originalUSD: 3
      },
      user ? { id: user.id, email: user.email } : undefined
    );
  };

  const features = [
    'AI-powered follow-up messages',
    'Automated candidate check-ins',
    'Smart response scheduling',
    'Candidate engagement tracking',
    'Professional email templates',
    'Interview reminder automation',
    'Status update notifications',
    'Bulk communication tools',
    'Response analytics dashboard',
    'Integration with existing workflows'
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
            
            <div className="flex items-center space-x-4">
              <CurrencySelector onCurrencyChange={handleCurrencyChange} />
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">HireFlow Pro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>🚀 End HR Ghosting Forever!</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Candidate
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Follow-Up Assistant
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Never ghost candidates again. Our AI handles all follow-up communications, 
            keeps candidates engaged, and saves HRs hours of manual work for just <strong>{priceData.price}/month</strong>.
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-8 max-w-lg mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">The HR Workload Solution</span>
            </div>
            <p className="text-sm text-purple-700">
              Stop losing great candidates to poor communication. Our AI ensures every candidate 
              gets timely, professional responses without any manual effort from your HR team.
            </p>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden relative">
            {/* Popular Badge - Fixed positioning */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full text-sm font-semibold shadow-lg">
                ⚡ Best Value Ever!
              </div>
            </div>

            <div className="p-8 pt-16">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Crown className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">HireFlow AI</h3>
                </div>
                <p className="text-gray-600">End candidate ghosting forever</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="mb-3">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-5xl font-bold text-gray-900">{priceData.price.split('.')[0]}</span>
                    {priceData.price.includes('.') && (
                      <span className="text-2xl font-bold text-gray-900">.{priceData.price.split('.')[1]}</span>
                    )}
                    <span className="text-lg text-gray-600">/month</span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-purple-600 font-medium">
                      💰 Simple, transparent pricing
                    </p>
                    <p className="text-xs text-gray-500">
                      Just {priceData.originalUSD} • Cancel anytime • No hidden fees
                    </p>
                  </div>
                </div>
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
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DollarSign className="h-5 w-5" />
                <span>Start Solving HR Ghosting - {priceData.price}/mo</span>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  🔒 30-day money-back guarantee • No setup fees • No contracts
                </p>
                <p className="text-xs text-purple-600 font-medium">
                  ⏰ Join HR teams already saving hours daily!
                </p>
              </div>
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
            <p className="text-sm text-gray-600">Perfect for HR teams of all sizes</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
            <p className="text-sm text-gray-600">Smart automation that learns your communication style</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">How does HireFlow solve HR ghosting?</h4>
              <p className="text-gray-600">Our AI automatically sends follow-up messages, status updates, and check-ins to candidates based on your hiring timeline. No more manual tracking or forgotten follow-ups!</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Is this an ATS replacement?</h4>
              <p className="text-gray-600">No, HireFlow integrates with your existing ATS and workflows. We focus specifically on candidate communication and follow-up automation, not applicant tracking.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">How much time will this save my HR team?</h4>
              <p className="text-gray-600">Most HR teams save 10-15 hours per week on manual follow-ups and candidate communication. The AI handles routine updates so your team can focus on strategic hiring decisions.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Absolutely! No contracts, no cancellation fees. Cancel with one click if you're not happy. We also offer a 30-day money-back guarantee.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">How do you handle different currencies?</h4>
              <p className="text-gray-600">We automatically convert {priceData.originalUSD} to your local currency using real-time exchange rates. Use the currency selector above to see pricing in your preferred currency.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
