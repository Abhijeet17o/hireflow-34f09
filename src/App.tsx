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
import { DatabaseTest } from './components/DatabaseTest';
import { EnvironmentDebug } from './components/EnvironmentDebug';
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
          
          {/* Protected routes - require authentication only */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-campaign" element={<CreateCampaign />} />
                  <Route path="/campaign/:id" element={<CampaignDetail />} />
                  <Route path="/campaign/:id/communication" element={<CampaignCommunication />} />
                  <Route path="/settings" element={<AccountSettings />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      {/* Temporary debug components */}
      <EnvironmentDebug />
      <DatabaseTest />
    </AuthProvider>
  );
}

export default App;
