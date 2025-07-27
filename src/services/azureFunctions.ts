// Azure Functions API Service
const AZURE_FUNCTIONS_BASE_URL = 'https://hireflow-functions-app.azurewebsites.net/api';

export interface KnowledgeProcessorRequest {
  campaignId: string;
  jobDescription: string;
  requirements: string;
  benefits: string;
  companyInfo: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface EmailRagRequest {
  from: {
    address: string;
    name: string;
  };
  subject: string;
  body: string;
}

class AzureFunctionsService {
  private async callFunction<T>(functionName: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${AZURE_FUNCTIONS_BASE_URL}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Azure Function ${functionName} failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling Azure Function ${functionName}:`, error);
      throw error;
    }
  }

  async processKnowledge(data: KnowledgeProcessorRequest) {
    return this.callFunction('knowledge-processor', data);
  }

  async processEmail(data: EmailRagRequest) {
    return this.callFunction('email-rag', data);
  }

  // Helper to extract knowledge data from campaign
  static extractKnowledgeFromCampaign(campaign: any): KnowledgeProcessorRequest {
    // Extract skills as requirements
    const skillsText = campaign.skills?.length > 0 
      ? `Required skills: ${campaign.skills.join(', ')}`
      : '';

    // Extract basic info as company info
    const companyInfo = [
      `Department: ${campaign.department}`,
      `Location: ${campaign.location}`,
      `Openings: ${campaign.openings}`,
      campaign.title ? `Position: ${campaign.title}` : ''
    ].filter(Boolean).join('. ');

    // Common FAQs based on campaign data
    const faqs = [
      {
        question: "What are the required skills for this position?",
        answer: campaign.skills?.length > 0 
          ? `The required skills include: ${campaign.skills.join(', ')}`
          : "Please refer to the job description for specific skill requirements."
      },
      {
        question: "Where is this position located?",
        answer: `This position is located in ${campaign.location}`
      },
      {
        question: "How many openings are available?",
        answer: `We have ${campaign.openings} opening${campaign.openings > 1 ? 's' : ''} for this position`
      },
      {
        question: "What department is this for?",
        answer: `This position is in the ${campaign.department} department`
      }
    ];

    return {
      campaignId: campaign.id,
      jobDescription: campaign.description || '',
      requirements: skillsText,
      benefits: '', // This could be extracted from description in the future
      companyInfo,
      faqs
    };
  }
}

export const azureFunctionsService = new AzureFunctionsService();
export { AzureFunctionsService };
