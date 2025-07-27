import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateCampaign } from './pages/CreateCampaign';
import { CampaignDetail } from './pages/CampaignDetail';
import { AccountSettings } from './pages/AccountSettings';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/settings" element={<AccountSettings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
