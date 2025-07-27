import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Campaign, Candidate, UserProfile } from '../services/database';

/**
 * Hook for managing campaign data
 */
export function useCampaigns() {
  const { getUserCampaignsData, saveCampaignData } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserCampaignsData();
      setCampaigns(data);
    } catch (err) {
      setError('Failed to load campaigns');
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: any) => {
    try {
      const success = await saveCampaignData(campaignData);
      if (success) {
        await loadCampaigns(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating campaign:', err);
      return false;
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    loadCampaigns,
    createCampaign,
  };
}

/**
 * Hook for managing candidate data for a specific campaign
 */
export function useCandidates(campaignId: string | null) {
  const { getCampaignCandidatesData, saveCandidateData } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = async () => {
    if (!campaignId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCampaignCandidatesData(campaignId);
      setCandidates(data);
    } catch (err) {
      setError('Failed to load candidates');
      console.error('Error loading candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCandidate = async (candidateData: any) => {
    try {
      const success = await saveCandidateData({
        ...candidateData,
        campaignId,
      });
      if (success) {
        await loadCandidates(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding candidate:', err);
      return false;
    }
  };

  const updateCandidateStage = async (candidateId: string, newStage: string) => {
    try {
      // Find the candidate to update
      const candidate = candidates.find(c => c.id === candidateId);
      if (!candidate) return false;

      const success = await saveCandidateData({
        ...candidate,
        stage: newStage,
      });

      if (success) {
        await loadCandidates(); // Refresh the list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating candidate stage:', err);
      return false;
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [campaignId]);

  return {
    candidates,
    loading,
    error,
    loadCandidates,
    addCandidate,
    updateCandidateStage,
  };
}

/**
 * Hook for managing user profile data
 */
export function useUserProfile() {
  const { getUserProfileData } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfileData();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    loadProfile,
  };
}

/**
 * Hook for local storage fallback when database is not available
 */
export function useLocalStorageData() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<{ [campaignId: string]: any[] }>({});

  const getUserStorageKey = (type: 'campaigns' | 'candidates') => {
    if (!user?.id) return null;
    return `hireflow_${type}_${user.id}`;
  };

  const loadLocalData = () => {
    if (!user?.id) return;
    
    try {
      // Load campaigns from localStorage (user-specific)
      const campaignsKey = getUserStorageKey('campaigns');
      if (campaignsKey) {
        const storedCampaigns = localStorage.getItem(campaignsKey);
        if (storedCampaigns) {
          setCampaigns(JSON.parse(storedCampaigns));
        }
      }

      // Load candidates from localStorage (user-specific)
      const candidatesKey = getUserStorageKey('candidates');
      if (candidatesKey) {
        const storedCandidates = localStorage.getItem(candidatesKey);
        if (storedCandidates) {
          setCandidates(JSON.parse(storedCandidates));
        }
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  const saveLocalCampaign = (campaign: any) => {
    if (!user?.id) return false;
    
    try {
      const updatedCampaigns = [...campaigns, campaign];
      setCampaigns(updatedCampaigns);
      
      const campaignsKey = getUserStorageKey('campaigns');
      if (campaignsKey) {
        localStorage.setItem(campaignsKey, JSON.stringify(updatedCampaigns));
      }
      return true;
    } catch (error) {
      console.error('Error saving local campaign:', error);
      return false;
    }
  };

  const saveLocalCandidate = (candidate: any) => {
    if (!user?.id) return false;
    
    try {
      const campaignId = candidate.campaignId;
      const updatedCandidates = {
        ...candidates,
        [campaignId]: [...(candidates[campaignId] || []), candidate],
      };
      setCandidates(updatedCandidates);
      
      const candidatesKey = getUserStorageKey('candidates');
      if (candidatesKey) {
        localStorage.setItem(candidatesKey, JSON.stringify(updatedCandidates));
      }
      return true;
    } catch (error) {
      console.error('Error saving local candidate:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadLocalData();
    }
  }, [user?.id]);

  return {
    campaigns,
    candidates,
    saveLocalCampaign,
    saveLocalCandidate,
    loadLocalData,
  };
}
