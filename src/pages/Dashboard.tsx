import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, Calendar, TrendingUp, MoreVertical, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Campaign } from '../services/database';

export function Dashboard() {
  const { getUserCampaignsData } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load campaigns from database
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        console.log('📊 Loading campaigns from database...');
        const storedCampaigns = await getUserCampaignsData();
        console.log('📊 Loaded campaigns:', storedCampaigns.length);
        setCampaigns(storedCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setError('Failed to load campaigns from database');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [getUserCampaignsData]);

  // Refresh campaigns
  const handleRefreshData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Refreshing campaigns from database...');
      const storedCampaigns = await getUserCampaignsData();
      setCampaigns(storedCampaigns);
      console.log('✅ Campaigns refreshed successfully');
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
      setError('Failed to refresh campaigns');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
          <button 
            onClick={handleRefreshData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalCampaigns = campaigns.length;
  const totalOpenings = campaigns.reduce((sum, campaign) => sum + (campaign.openings || 1), 0);

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's an overview of your recruitment campaigns.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefreshData}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/create-campaign"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Openings</p>
              <p className="text-2xl font-bold text-gray-900">{totalOpenings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">--</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {campaigns.length === 0 ? 'No campaigns yet' : 'No matching campaigns'}
              </h3>
              <p className="mt-2 text-gray-500">
                {campaigns.length === 0 
                  ? 'Get started by creating your first campaign'
                  : 'Try adjusting your search terms'
                }
              </p>
              {campaigns.length === 0 && (
                <Link
                  to="/create-campaign"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Campaign
                </Link>
              )}
            </div>
          ) : (
            filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{campaign.title}</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                    <span>{campaign.department}</span>
                    <span>•</span>
                    <span>{campaign.location}</span>
                    <span>•</span>
                    <span>{campaign.openings || 1} opening{(campaign.openings || 1) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Link
                    to={`/campaign/${campaign.id}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
