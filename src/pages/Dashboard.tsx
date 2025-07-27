import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, Calendar, TrendingUp, MoreVertical, RefreshCw, Database } from 'lucide-react';
import { type JobCampaign } from '../types';
import { storageAPI, initializeMockData, resetStorageData, addDemoData } from '../utils/storage';

export function Dashboard() {
  const [campaigns, setCampaigns] = useState<JobCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load campaigns from storage
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        await initializeMockData();
        const storedCampaigns = await storageAPI.getCampaigns();
        setCampaigns(storedCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // Debug function to reset data
  const handleResetData = async () => {
    const confirmation = prompt(
      'WARNING: This will permanently delete ALL campaigns and candidates!\n\n' +
      'Type "CONFIRM" (in capital letters) to proceed:'
    );
    
    if (confirmation === 'CONFIRM') {
      setLoading(true);
      try {
        await resetStorageData();
        const storedCampaigns = await storageAPI.getCampaigns();
        setCampaigns(storedCampaigns);
        alert('All data has been reset successfully.');
      } catch (error) {
        console.error('Error resetting data:', error);
        setError('Failed to reset data');
      } finally {
        setLoading(false);
      }
    } else if (confirmation !== null) {
      alert('Reset cancelled. You must type "CONFIRM" exactly to proceed.');
    }
  };

  // Function to add demo data for development/testing
  const handleAddDemoData = async () => {
    const confirmation = prompt(
      'Add demo campaigns and candidates for testing?\n\n' +
      'Type "DEMO" to proceed:'
    );
    
    if (confirmation === 'DEMO') {
      setLoading(true);
      try {
        await addDemoData();
        const storedCampaigns = await storageAPI.getCampaigns();
        setCampaigns(storedCampaigns);
        alert('Demo data added successfully!');
      } catch (error) {
        console.error('Error adding demo data:', error);
        setError('Failed to add demo data');
      } finally {
        setLoading(false);
      }
    } else if (confirmation !== null) {
      alert('Demo data cancelled. You must type "DEMO" exactly to proceed.');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
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

  // Calculate dynamic statistics based on actual stage data
  const getGlobalStats = () => {
    const totalCandidates = campaigns.reduce((total, campaign) => total + campaign.candidates.length, 0);
    
    // Get candidates in interview stages (any stage with "interview" in the name)
    const inInterview = campaigns.reduce((total, campaign) => {
      return total + campaign.candidates.filter(candidate => {
        const stage = campaign.stages.find(s => s.id === candidate.currentStage || s.name === candidate.currentStage);
        return stage && (
          stage.name.toLowerCase().includes('interview') || 
          stage.id.toLowerCase().includes('interview') ||
          stage.name.toLowerCase().includes('technical') ||
          stage.name.toLowerCase().includes('screening')
        );
      }).length;
    }, 0);
    
    // Get hired candidates (any stage with "hired", "offer", or "selected" in the name)
    const hired = campaigns.reduce((total, campaign) => {
      return total + campaign.candidates.filter(candidate => {
        const stage = campaign.stages.find(s => s.id === candidate.currentStage || s.name === candidate.currentStage);
        return stage && (
          stage.name.toLowerCase().includes('hired') ||
          stage.name.toLowerCase().includes('offer') ||
          stage.name.toLowerCase().includes('selected') ||
          stage.id.toLowerCase().includes('hired')
        );
      }).length;
    }, 0);

    return {
      activeCampaigns: campaigns.length,
      totalCandidates,
      inInterview,
      hired
    };
  };

  const globalStats = getGlobalStats();

  // Filter campaigns based on search only
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-primary-200"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading your campaigns...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Campaigns</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your recruitment campaigns and track candidate progress
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              to="/create-campaign"
              className="btn-primary inline-flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
            <button
              onClick={handleAddDemoData}
              className="btn-secondary inline-flex items-center"
            >
              <Database className="mr-2 h-4 w-4" />
              Add Demo Data
            </button>
            <button
              onClick={handleResetData}
              className="btn-secondary inline-flex items-center text-red-600 border-red-300 hover:bg-red-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-100">Active Campaigns</p>
              <p className="text-2xl font-bold">{globalStats.activeCampaigns}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-100">Total Candidates</p>
              <p className="text-2xl font-bold">{globalStats.totalCandidates}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-100">In Interview</p>
              <p className="text-2xl font-bold">{globalStats.inInterview}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-100">Hired</p>
              <p className="text-2xl font-bold">{globalStats.hired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search campaigns by title, department, location, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No campaigns match your search criteria.' : 'No campaigns found.'}
            </p>
            {!searchTerm && (
              <Link to="/create-campaign" className="btn-primary mt-4 inline-flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Campaign
              </Link>
            )}
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {campaign.description}
                  </p>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{campaign.department}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{campaign.location}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Openings:</span>
                  <span className="font-medium">{campaign.openings}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Candidates:</span>
                  <span className="font-medium">{campaign.candidates.length}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {campaign.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {campaign.skills.length > 3 && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      +{campaign.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-between text-xs text-gray-500">
                <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                <span>{campaign.candidates.length} total candidates</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <Link
                  to={`/campaign/${campaign.id}`}
                  className="flex-1 btn-primary text-center py-2 text-sm"
                  onClick={() => console.log(`Navigating to campaign: ${campaign.title} (ID: ${campaign.id})`)}
                >
                  Manage Pipeline
                </Link>
                <Link
                  to={`/campaign/${campaign.id}/communication`}
                  className="flex-1 btn-secondary text-center py-2 text-sm border-primary-300 text-primary-700 hover:bg-primary-50"
                >
                  Communication
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started by creating your first job campaign and begin attracting top talent to your organization.
          </p>
          <Link 
            to="/create-campaign" 
            className="btn-primary inline-flex items-center text-lg px-8 py-3"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Your First Campaign
          </Link>
        </div>
      )}
    </div>
  );
}
