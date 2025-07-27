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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>🎉 Unbeatable Pricing - 90% Off Market Rate!</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Professional AI Recruiting
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              at the Cheapest Price Ever
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get enterprise-level AI recruiting tools for just <strong>{priceData.price}/month</strong> - 
            that's <strong>{priceData.savings} less</strong> than competitors charge!
          </p>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8 max-w-lg mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="font-semibold text-orange-800">Limited Time Offer</span>
            </div>
            <p className="text-sm text-orange-700">
              While others charge <strong>$29-99/month</strong>, we're offering full access for just 
              <strong className="text-lg"> {priceData.price}</strong> to help small teams compete with big companies.
            </p>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden relative">
            {/* Popular Badge */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                ⚡ Best Value Ever!
              </div>
            </div>

            <div className="p-8 pt-12">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Crown className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Starter Pro</h3>
                </div>
                <p className="text-gray-600">Enterprise features at startup prices</p>
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
                    <p className="text-sm text-green-600 font-medium">
                      💰 Save {priceData.savings}/month vs competitors!
                    </p>
                    <p className="text-xs text-gray-500">
                      That's just {priceData.originalUSD} • Cancel anytime
                    </p>
                  </div>
                </div>

                {/* Comparison */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Other platforms:</span>
                    <span className="line-through text-gray-400">{currentCurrency.symbol}29-99/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-green-600">HireFlow Pro:</span>
                    <span className="text-green-600">{priceData.price}/mo</span>
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
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DollarSign className="h-5 w-5" />
                <span>Claim Your {priceData.price}/mo Deal!</span>
              </Link>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">
                  🔒 30-day money-back guarantee • No setup fees • No contracts
                </p>
                <p className="text-xs text-green-600 font-medium">
                  ⏰ Price locks in forever - no future increases!
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
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Why is HireFlow Pro so much cheaper?</h4>
              <p className="text-gray-600">We believe great recruiting tools shouldn't cost a fortune. By keeping our overhead low and focusing on what matters, we can offer enterprise features at startup-friendly prices. No fancy offices, just great software!</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Will the price increase later?</h4>
              <p className="text-gray-600">Never! Once you're locked in at {priceData.price}/month, that's your price forever. We'll never raise your rate, even if we increase prices for new customers.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600">Absolutely! No contracts, no cancellation fees. Cancel with one click if you're not happy. We also offer a 30-day money-back guarantee.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">How do you handle different currencies?</h4>
              <p className="text-gray-600">We automatically convert {priceData.originalUSD} to your local currency using real-time exchange rates. Use the currency selector above to see pricing in your preferred currency.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">What's included in the Pro plan?</h4>
              <p className="text-gray-600">Everything you see listed above - unlimited campaigns, AI-powered features, analytics, and priority support. No hidden fees or feature restrictions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
