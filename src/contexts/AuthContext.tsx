import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { saveUser, updateUserOnboarding, initializeDatabase } from '../services/database';

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
  completeOnboarding: () => Promise<void>;
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
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        userData.onboardingCompleted = true; // Always set to true for existing users
        setUser(userData);
        localStorage.setItem('onboardingCompleted', 'true'); // Ensure it's marked as completed
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
      
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      // No need to check existing user - always proceed with login
      
      const userData: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        verified_email: payload.email_verified,
        onboardingCompleted: true, // Always set to true to skip onboarding
      };

      // Save user to database with onboarding completed
      await saveUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        verified_email: userData.verified_email,
        onboarding_completed: true, // Always save as completed
      });

      // Always set onboarding as completed
      userData.onboardingCompleted = true;

      setUser(userData);
      localStorage.setItem('hireflow_user', JSON.stringify(userData));
      localStorage.setItem('hireflow_token', credential);
      localStorage.setItem('onboardingCompleted', 'true'); // Always mark as completed
      
    } catch (error) {
      console.error('Login error:', error);
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

  const completeOnboarding = async () => {
    if (user) {
      try {
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

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    needsOnboarding: false, // Always false - no onboarding needed
    completeOnboarding,
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
