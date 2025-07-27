export interface JobCampaign {
  id: string;
  title: string;
  description: string;
  skills: string[];
  location: string;
  department: string;
  openings: number;
  stages: Stage[];
  createdAt: string;
  candidates: Candidate[];
  jdFileUrl?: string;
}

export interface Stage {
  id: string;
  name: string;
  instructions: string;
  order: number;
  color: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  currentStage: string;
  threadId: string;
  communicationLog: EmailMessage[];
  lastUpdated: string;
  notes?: string;
}

export interface EmailMessage {
  id: string;
  direction: "incoming" | "outgoing";
  subject: string;
  body: string;
  timestamp: string;
  isAiGenerated?: boolean;
}

export interface CreateCampaignForm {
  title: string;
  description: string;
  skills: string[];
  location: string;
  department: string;
  employmentType: string;
  experienceLevel: string;
  openings: number;
  jdFile?: File;
}

export interface CandidateUpload {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  stage?: string;
}
