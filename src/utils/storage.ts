// Simple local storage API for demo purposes
// In production, replace with actual backend API calls

export interface StorageAPI {
  getCampaigns: () => Promise<any[]>;
  saveCampaign: (campaign: any) => Promise<any>;
  updateCampaign: (id: string, updates: any) => Promise<any>;
  deleteCampaign: (id: string) => Promise<void>;
  getCampaignById: (id: string) => Promise<any | null>;
}

class LocalStorageAPI implements StorageAPI {
  private readonly CAMPAIGNS_KEY = 'hireflow_campaigns';

  async getCampaigns(): Promise<any[]> {
    const data = localStorage.getItem(this.CAMPAIGNS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async saveCampaign(campaign: any): Promise<any> {
    const campaigns = await this.getCampaigns();
    
    // Generate a truly unique ID with timestamp and random elements
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);
    const uniqueId = `campaign-${timestamp}-${randomPart}`;
    
    // Ensure ID is unique (though it should be with timestamp + random)
    let finalId = uniqueId;
    let counter = 1;
    while (campaigns.some(c => c.id === finalId)) {
      finalId = `${uniqueId}-${counter}`;
      counter++;
    }
    
    const newCampaign = {
      ...campaign,
      id: finalId,
      createdAt: new Date().toISOString(),
      candidates: campaign.candidates || [],
    };
    
    console.log(`Saving campaign with ID: ${finalId}, Title: ${campaign.title}`);
    campaigns.push(newCampaign);
    localStorage.setItem(this.CAMPAIGNS_KEY, JSON.stringify(campaigns));
    return newCampaign;
  }

  async updateCampaign(id: string, updates: any): Promise<any> {
    const campaigns = await this.getCampaigns();
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    
    campaigns[index] = { ...campaigns[index], ...updates };
    localStorage.setItem(this.CAMPAIGNS_KEY, JSON.stringify(campaigns));
    return campaigns[index];
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaigns = await this.getCampaigns();
    const filtered = campaigns.filter(c => c.id !== id);
    localStorage.setItem(this.CAMPAIGNS_KEY, JSON.stringify(filtered));
  }

  async getCampaignById(id: string): Promise<any | null> {
    const campaigns = await this.getCampaigns();
    console.log(`Looking for campaign with ID: ${id}`);
    console.log(`Available campaign IDs:`, campaigns.map(c => ({ id: c.id, title: c.title })));
    
    const found = campaigns.find(c => c.id === id);
    if (found) {
      console.log(`Found campaign: ${found.title} (ID: ${found.id})`);
    } else {
      console.log(`Campaign not found with ID: ${id}`);
    }
    
    return found || null;
  }
}

// Mock data initialization (only for development)
const initializeMockData = async () => {
  const api = new LocalStorageAPI();
  const campaigns = await api.getCampaigns();
  
  // Only initialize empty array for production
  // No mock data will be created for users
  if (campaigns.length === 0) {
    console.log('Initializing empty campaigns array...');
    localStorage.setItem('hireflow_campaigns', JSON.stringify([]));
    console.log('Clean initialization complete - no mock data added');
  } else {
    console.log(`Found ${campaigns.length} existing campaigns, skipping initialization`);
  }
};

// Separate function to add demo data (only for development/testing)
export const addDemoData = async () => {
  console.log('Adding demo data for development...');
  const api = new LocalStorageAPI();
  
  const demoCampaigns = [
    {
      title: 'Senior React Developer',
      description: 'Looking for an experienced React developer to join our team and build amazing user interfaces.',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      location: 'Bangalore',
      department: 'Engineering',
      openings: 2,
      stages: [
        { id: 'sourced', name: 'Sourced', instructions: 'Initial candidate sourcing', order: 1, color: 'blue' },
        { id: 'screening', name: 'Screening', instructions: 'Phone/video screening call', order: 2, color: 'yellow' },
        { id: 'interview', name: 'Interview', instructions: 'Technical interview', order: 3, color: 'purple' },
        { id: 'hired', name: 'Hired', instructions: 'Successfully hired', order: 4, color: 'green' },
        { id: 'rejected', name: 'Rejected', instructions: 'Not selected', order: 5, color: 'red' },
      ],
      candidates: [
        {
          id: 'candidate-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+91 9876543210',
          currentStage: 'screening',
          threadId: 'thread-1',
          lastUpdated: new Date().toISOString(),
          communicationLog: [
            {
              id: 'msg-1',
              direction: 'outgoing',
              subject: 'Interview Invitation - Senior React Developer',
              body: 'Hi John, Thank you for your interest in our Senior React Developer position...',
              timestamp: new Date().toISOString(),
              isAiGenerated: true,
            },
          ],
        },
        {
          id: 'candidate-2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+91 9876543211',
          currentStage: 'sourced',
          threadId: 'thread-2',
          lastUpdated: new Date().toISOString(),
          communicationLog: [],
        },
        {
          id: 'candidate-3',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '+91 9876543212',
          currentStage: 'interview',
          threadId: 'thread-3',
          lastUpdated: new Date().toISOString(),
          communicationLog: [],
        },
        {
          id: 'candidate-4',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@example.com',
          phone: '+91 9876543213',
          currentStage: 'hired',
          threadId: 'thread-4',
          lastUpdated: new Date().toISOString(),
          communicationLog: [],
        },
        {
          id: 'candidate-5',
          name: 'Alex Brown',
          email: 'alex.brown@example.com',
          phone: '+91 9876543214',
          currentStage: 'rejected',
          threadId: 'thread-5',
          lastUpdated: new Date().toISOString(),
          communicationLog: [],
        },
      ],
    },
    {
      title: 'Product Manager',
      description: 'Seeking a strategic product manager to drive our product roadmap and work with cross-functional teams.',
      skills: ['Product Strategy', 'Analytics', 'Stakeholder Management', 'Agile'],
      location: 'Mumbai',
      department: 'Product',
      openings: 1,
      stages: [
        { id: 'sourced', name: 'Sourced', instructions: 'Initial candidate sourcing', order: 1, color: 'blue' },
        { id: 'screening', name: 'Screening', instructions: 'Phone/video screening call', order: 2, color: 'yellow' },
        { id: 'interview', name: 'Interview', instructions: 'Product case study interview', order: 3, color: 'purple' },
        { id: 'hired', name: 'Hired', instructions: 'Successfully hired', order: 4, color: 'green' },
        { id: 'rejected', name: 'Rejected', instructions: 'Not selected', order: 5, color: 'red' },
      ],
      candidates: [],
    },
  ];

  for (const campaign of demoCampaigns) {
    await api.saveCampaign(campaign);
  }
  console.log('Demo data added successfully');
};

export const storageAPI = new LocalStorageAPI();

// Utility function to reset all data (for debugging)
export const resetStorageData = async () => {
  console.log('Resetting all storage data...');
  localStorage.removeItem('hireflow_campaigns');
  // Initialize with empty array - no mock data
  localStorage.setItem('hireflow_campaigns', JSON.stringify([]));
  console.log('Storage data reset complete - clean slate');
};

export { initializeMockData };
