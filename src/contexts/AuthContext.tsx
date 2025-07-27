import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  saveUser, 
  getUser, 
  updateUserOnboarding, 
  saveUserProfile,
  getUserProfile,
  saveCampaign,
  getUserCampaigns,
  saveCandidate,
  getCampaignCandidates,
  initializeDatabase,
  type UserProfile,
  type Campaign,
  type Candidate
} from '../services/database';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  completeOnboarding: (profileData?: any) => Promise<void>;
  
  // Data management methods
  saveCampaignData: (campaignData: any) => Promise<boolean>;
  getUserCampaignsData: () => Promise<Campaign[]>;
  saveCandidateData: (candidateData: any) => Promise<boolean>;
  getCampaignCandidatesData: (campaignId: string) => Promise<Candidate[]>;
  getUserProfileData: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize database on app start
    initializeDatabase().catch(console.error);
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('hireflow_user');
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        userData.onboardingCompleted = onboardingCompleted === 'true';
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('hireflow_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credential: string) => {
    try {
      setIsLoading(true);
      
      console.log('Starting login process...');
      
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(credential.split('.')[1]));
      console.log('Decoded JWT payload:', { email: payload.email, name: payload.name });
      
      // Check if user exists in database
      console.log('Checking if user exists in database...');
      let dbUser = await getUser(payload.email);
      console.log('Database user:', dbUser ? 'Found' : 'Not found');
      
      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified_email: payload.email_verified,
        onboardingCompleted: dbUser?.onboarding_completed || false,
      };

      // Save user to database
      console.log('Saving user to database...');
      const savedUser = await saveUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        verified_email: userData.verified_email,
        onboarding_completed: userData.onboardingCompleted,
      });

      if (savedUser) {
        userData.onboardingCompleted = savedUser.onboarding_completed || false;
      }

      console.log('Login successful, setting user state');
      setUser(userData);
      localStorage.setItem('hireflow_user', JSON.stringify(userData));
      localStorage.setItem('hireflow_token', credential);
      
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hireflow_user');
    localStorage.removeItem('hireflow_token');
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('accountSettings');
    
    // Sign out from Google (optional, may not be available)
    try {
      if (window.google?.accounts?.id) {
        // Google logout if available
        console.log('Signed out from Google');
      }
    } catch (error) {
      console.log('Google logout not available');
    }
  };

  const completeOnboarding = async (profileData?: any) => {
    if (user) {
      try {
        // If profile data is provided, save it first
        if (profileData) {
          const userProfile: UserProfile = {
            user_id: user.id,
            full_name: profileData.fullName,
            job_title: profileData.jobTitle,
            company: profileData.company,
            company_size: profileData.companySize,
            industry: profileData.industry,
            phone: profileData.phone,
            profile_completed: true
          };

          const profileSaved = await saveUserProfile(userProfile);
          console.log('Profile save result:', profileSaved);
        }

        // Update in database
        await updateUserOnboarding(user.email, true);
        
        // Update local state
        const updatedUser = { ...user, onboardingCompleted: true };
        setUser(updatedUser);
        localStorage.setItem('hireflow_user', JSON.stringify(updatedUser));
        localStorage.setItem('onboardingCompleted', 'true');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // Fallback to local update
        const updatedUser = { ...user, onboardingCompleted: true };
        setUser(updatedUser);
        localStorage.setItem('hireflow_user', JSON.stringify(updatedUser));
        localStorage.setItem('onboardingCompleted', 'true');
      }
    }
  };

  // Data management methods
  const saveCampaignData = async (campaignData: any): Promise<boolean> => {
    if (!user) return false;

    try {
      const campaign: Campaign = {
        id: campaignData.id || `campaign_${Date.now()}`,
        user_id: user.id,
        title: campaignData.title,
        department: campaignData.department,
        location: campaignData.location,
        employment_type: campaignData.employmentType,
        experience_level: campaignData.experienceLevel,
        salary_range: campaignData.salaryRange,
        job_description: campaignData.jobDescription,
        requirements: campaignData.requirements,
        openings: campaignData.openings || 1
      };

      const result = await saveCampaign(campaign);
      console.log('Campaign saved:', result);
      return result;
    } catch (error) {
      console.error('Error saving campaign:', error);
      return false;
    }
  };

  const getUserCampaignsData = async (): Promise<Campaign[]> => {
    if (!user) return [];

    try {
      const campaigns = await getUserCampaigns(user.id);
      console.log('Retrieved user campaigns:', campaigns);
      return campaigns;
    } catch (error) {
      console.error('Error getting user campaigns:', error);
      return [];
    }
  };

  const saveCandidateData = async (candidateData: any): Promise<boolean> => {
    if (!user) return false;

    try {
      const candidate: Candidate = {
        id: candidateData.id || `candidate_${Date.now()}`,
        campaign_id: candidateData.campaignId,
        user_id: user.id,
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        resume_url: candidateData.resumeUrl,
        stage: candidateData.stage || 'applied',
        notes: candidateData.notes,
        added_date: candidateData.addedDate || new Date().toISOString().split('T')[0]
      };

      const result = await saveCandidate(candidate);
      console.log('Candidate saved:', result);
      return result;
    } catch (error) {
      console.error('Error saving candidate:', error);
      return false;
    }
  };

  const getCampaignCandidatesData = async (campaignId: string): Promise<Candidate[]> => {
    try {
      const candidates = await getCampaignCandidates(campaignId);
      console.log('Retrieved campaign candidates:', candidates);
      return candidates;
    } catch (error) {
      console.error('Error getting campaign candidates:', error);
      return [];
    }
  };

  const getUserProfileData = async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      const profile = await getUserProfile(user.id);
      console.log('Retrieved user profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    needsOnboarding: !!user && !user.onboardingCompleted,
    completeOnboarding,
    saveCampaignData,
    getUserCampaignsData,
    saveCandidateData,
    getCampaignCandidatesData,
    getUserProfileData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
