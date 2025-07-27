import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { analytics, ANALYTICS_EVENTS } from '../utils/analytics';
import { userFeedback } from '../utils/userFeedback';
import { useAuth } from '../contexts/AuthContext';

export function ComingSoonPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    mostImportantFeatures: '',
    biggestChallenge: '',
    willingToPay: '',
    additionalFeatures: '',
    contactForUpdates: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Track that user reached the coming soon page
    analytics.track(
      'coming_soon_page_viewed',
      { 
        source: 'buy_now_click',
        referrer: document.referrer
      },
      user ? { id: user.id, email: user.email } : undefined
    );
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit feedback
      userFeedback.submitFeedback(
        formData,
        user ? { id: user.id, email: user.email, name: user.name } : undefined,
        'pricing_page'
      );

      // Track analytics
      analytics.track(
        ANALYTICS_EVENTS.FEEDBACK_SUBMITTED,
        { 
          hasFeatures: !!formData.mostImportantFeatures,
          hasChallenge: !!formData.biggestChallenge,
          hasPricing: !!formData.willingToPay,
          wantsUpdates: formData.contactForUpdates,
          responseLength: formData.mostImportantFeatures.length + formData.biggestChallenge.length + formData.additionalFeatures.length
        },
        user ? { id: user.id, email: user.email } : undefined
      );

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been recorded. We'll use your insights to build exactly what you need!
            </p>
            
            {formData.contactForUpdates && (
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg mb-6">
                We'll notify you as soon as HireFlow Pro is ready for launch.
              </p>
            )}
            
            <Link
              to="/dashboard"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/pricing" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Pricing</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Almost There!
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-lg text-gray-800 mb-2">
              <strong>HireFlow Pro is still under development</strong>
            </p>
            <p className="text-gray-600">
              But we're excited about your interest! Your feedback will help us build exactly what you need.
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Help Us Build Better</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="mostImportantFeatures" className="block text-sm font-medium text-gray-700 mb-2">
                What features are most important to you? *
              </label>
              <textarea
                id="mostImportantFeatures"
                name="mostImportantFeatures"
                value={formData.mostImportantFeatures}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., AI candidate screening, automated scheduling, team collaboration..."
              />
            </div>

            <div>
              <label htmlFor="biggestChallenge" className="block text-sm font-medium text-gray-700 mb-2">
                What's your biggest hiring challenge right now?
              </label>
              <textarea
                id="biggestChallenge"
                name="biggestChallenge"
                value={formData.biggestChallenge}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., finding qualified candidates, managing multiple campaigns, time-consuming screening..."
              />
            </div>

            <div>
              <label htmlFor="willingToPay" className="block text-sm font-medium text-gray-700 mb-2">
                What would you be willing to pay for the perfect hiring tool?
              </label>
              <select
                id="willingToPay"
                name="willingToPay"
                value={formData.willingToPay}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a range...</option>
                <option value="$0-15/month">$0-15 per month</option>
                <option value="$15-30/month">$15-30 per month</option>
                <option value="$30-50/month">$30-50 per month</option>
                <option value="$50-100/month">$50-100 per month</option>
                <option value="$100+/month">$100+ per month</option>
                <option value="one-time">Prefer one-time payment</option>
                <option value="free">Only if free</option>
              </select>
            </div>

            <div>
              <label htmlFor="additionalFeatures" className="block text-sm font-medium text-gray-700 mb-2">
                Any other features or integrations you'd love to see?
              </label>
              <textarea
                id="additionalFeatures"
                name="additionalFeatures"
                value={formData.additionalFeatures}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Slack integration, mobile app, custom branding..."
              />
            </div>

            <div className="flex items-center">
              <input
                id="contactForUpdates"
                name="contactForUpdates"
                type="checkbox"
                checked={formData.contactForUpdates}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="contactForUpdates" className="ml-2 block text-sm text-gray-700">
                Yes, notify me when HireFlow Pro is ready to launch!
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.mostImportantFeatures.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your feedback helps us prioritize features and build something you'll love.
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            In the meantime, continue using HireFlow's current features for free!
          </p>
          <Link
            to="/dashboard"
            className="text-purple-600 hover:text-purple-700 font-medium mt-2 inline-block"
          >
            Return to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
