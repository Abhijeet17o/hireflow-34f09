import { useState, useEffect } from 'react';
import { BarChart, Eye, MessageSquare, DollarSign, TrendingUp } from 'lucide-react';
import { analytics } from '../utils/analytics';
import { userFeedback } from '../utils/userFeedback';

export function AnalyticsDashboard() {
  const [funnelData, setFunnelData] = useState({
    upgradeClicks: 0,
    pricingViews: 0,
    buyNowClicks: 0,
    feedbackSubmissions: 0,
  });
  const [feedbackStats, setFeedbackStats] = useState({
    totalSubmissions: 0,
    sources: {},
    willingToPayBreakdown: {},
    topFeatures: {},
  });
  const [allFeedback, setAllFeedback] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    const funnel = analytics.getConversionFunnel();
    const feedback = userFeedback.getFeedbackStats();
    const allFeedbackData = userFeedback.getAllFeedback();
    
    setFunnelData(funnel);
    setFeedbackStats(feedback);
    setAllFeedback(allFeedbackData);
  };

  const conversionRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return '0%';
    return `${((numerator / denominator) * 100).toFixed(1)}%`;
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL analytics and feedback data? This cannot be undone.')) {
      analytics.clearAllEvents();
      userFeedback.clearAllFeedback();
      loadAnalyticsData();
      alert('All data cleared successfully.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fake Door Analytics</h1>
          <p className="text-gray-600">Market validation and user interest tracking</p>
        </div>
        <button
          onClick={clearAllData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear All Data
        </button>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Conversion Funnel</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Upgrade Clicks</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{funnelData.upgradeClicks}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Pricing Views</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{funnelData.pricingViews}</div>
            <div className="text-sm text-green-700">
              {conversionRate(funnelData.pricingViews, funnelData.upgradeClicks)} from clicks
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Buy Now Clicks</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{funnelData.buyNowClicks}</div>
            <div className="text-sm text-purple-700">
              {conversionRate(funnelData.buyNowClicks, funnelData.pricingViews)} from views
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">Feedback Submitted</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{funnelData.feedbackSubmissions}</div>
            <div className="text-sm text-orange-700">
              {conversionRate(funnelData.feedbackSubmissions, funnelData.buyNowClicks)} completion
            </div>
          </div>
        </div>
      </div>

      {/* User Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pricing Willingness</h3>
          <div className="space-y-2">
            {Object.entries(feedbackStats.willingToPayBreakdown).map(([price, count]) => (
              <div key={price} className="flex justify-between items-center">
                <span className="text-gray-700">{price}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Requested Features</h3>
          <div className="space-y-2">
            {Object.entries(feedbackStats.topFeatures)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 8)
              .map(([feature, count]) => (
                <div key={feature} className="flex justify-between items-center">
                  <span className="text-gray-700 capitalize">{feature}</span>
                  <span className="font-semibold">{count as number}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Feedback ({feedbackStats.totalSubmissions} total)</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {allFeedback.slice(-10).reverse().map((feedback: any) => (
            <div key={feedback.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">
                  {feedback.userName || feedback.userEmail || 'Anonymous'}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(feedback.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              {feedback.responses.mostImportantFeatures && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Important Features: </span>
                  <span className="text-sm text-gray-600">{feedback.responses.mostImportantFeatures}</span>
                </div>
              )}
              
              {feedback.responses.willingToPay && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Willing to Pay: </span>
                  <span className="text-sm text-gray-600">{feedback.responses.willingToPay}</span>
                </div>
              )}
              
              {feedback.responses.biggestChallenge && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Challenge: </span>
                  <span className="text-sm text-gray-600">{feedback.responses.biggestChallenge}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
