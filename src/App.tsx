import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateCampaign } from './pages/CreateCampaign';
import { CampaignDetail } from './pages/CampaignDetail';
import { CampaignCommunication } from './pages/CampaignCommunication';
import { AccountSettings } from './pages/AccountSettings';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
// Removed AnalyticsDashboard - admin analytics completely removed
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Landing page - handles authentication flow */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Pricing and coming soon - accessible to all users */}
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          
          {/* Protected routes - require authentication only */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-campaign" element={<CreateCampaign />} />
                  <Route path="/campaign/:id" element={<CampaignDetail />} />
                  <Route path="/campaign/:id/communication" element={<CampaignCommunication />} />
                  <Route path="/settings" element={<AccountSettings />} />
                  {/* Admin analytics route removed completely */}
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
