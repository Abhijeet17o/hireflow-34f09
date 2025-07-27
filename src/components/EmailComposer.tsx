import { useState, useEffect } from 'react';
import { Send, Bot, File, Save, Sparkles, Mail, Clock } from 'lucide-react';
import { type Candidate } from '../types';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  stage: string;
  category: 'screening' | 'interview' | 'offer' | 'rejection' | 'follow-up' | 'custom';
}

interface EmailComposerProps {
  candidate: Candidate;
  onSend: (email: { subject: string; body: string; templateId?: string }) => Promise<void>;
  onSaveDraft: (draft: { subject: string; body: string }) => void;
  onClose: () => void;
}

// Pre-built email templates for different stages
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'screening-initial',
    name: 'Initial Screening',
    subject: 'Application Received - {{candidate.name}} | {{campaign.title}}',
    body: `Dear {{candidate.name}},

Thank you for your interest in the {{campaign.title}} position at {{company.name}}. We have received your application and are currently reviewing it.

Our recruitment team will carefully assess your qualifications and experience. If your profile matches our requirements, we will contact you within 3-5 business days to discuss the next steps.

In the meantime, feel free to explore more about our company and culture on our website.

Best regards,
{{user.name}}
{{user.title}}
{{company.name}}`,
    stage: 'Applied',
    category: 'screening'
  },
  {
    id: 'interview-invitation',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {{candidate.name}} | {{campaign.title}}',
    body: `Dear {{candidate.name}},

Congratulations! We were impressed with your application for the {{campaign.title}} position and would like to invite you for an interview.

Interview Details:
- Date: [Please specify date]
- Time: [Please specify time]
- Duration: Approximately 45 minutes
- Format: [Video call/In-person]
- Location/Link: [To be shared separately]

Please confirm your availability by replying to this email. If the proposed time doesn't work for you, please suggest alternative times that suit your schedule.

We look forward to meeting you and discussing how you can contribute to our team.

Best regards,
{{user.name}}
{{user.title}}
{{company.name}}`,
    stage: 'Interview',
    category: 'interview'
  },
  {
    id: 'offer-congratulations',
    name: 'Job Offer',
    subject: 'Job Offer - {{candidate.name}} | {{campaign.title}}',
    body: `Dear {{candidate.name}},

We are delighted to extend an offer for the {{campaign.title}} position at {{company.name}}!

After careful consideration of your qualifications, experience, and interview performance, we believe you would be a valuable addition to our team.

The formal offer letter with detailed terms and conditions will be sent separately. Please review it carefully and let us know if you have any questions.

We are excited about the possibility of you joining our team and look forward to your response.

Congratulations once again!

Best regards,
{{user.name}}
{{user.title}}
{{company.name}}`,
    stage: 'Offer',
    category: 'offer'
  },
  {
    id: 'rejection-respectful',
    name: 'Respectful Rejection',
    subject: 'Update on Your Application - {{candidate.name}} | {{campaign.title}}',
    body: `Dear {{candidate.name}},

Thank you for your interest in the {{campaign.title}} position at {{company.name}} and for taking the time to go through our selection process.

After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current requirements.

This decision was not easy, as we were impressed with your qualifications and enthusiasm. We encourage you to apply for future opportunities that match your skills and interests.

We wish you all the best in your career endeavors.

Best regards,
{{user.name}}
{{user.title}}
{{company.name}}`,
    stage: 'Rejected',
    category: 'rejection'
  }
];

export function EmailComposer({ candidate, onSend, onSaveDraft, onClose }: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Filter templates based on candidate's current stage
  const relevantTemplates = DEFAULT_TEMPLATES.filter(
    template => template.stage === candidate.currentStage || template.category === 'custom'
  );

  const allTemplates = DEFAULT_TEMPLATES;

  // Template variable substitution
  const substituteVariables = (text: string): string => {
    return text
      .replace(/\{\{candidate\.name\}\}/g, candidate.name)
      .replace(/\{\{candidate\.email\}\}/g, candidate.email)
      .replace(/\{\{campaign\.title\}\}/g, 'Software Developer') // Would come from context
      .replace(/\{\{company\.name\}\}/g, 'TechCorp Inc.') // Would come from user settings
      .replace(/\{\{user\.name\}\}/g, 'HR Manager') // Would come from user context
      .replace(/\{\{user\.title\}\}/g, 'Senior HR Manager'); // Would come from user context
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    const processedSubject = substituteVariables(template.subject);
    const processedBody = substituteVariables(template.body);
    
    setSubject(processedSubject);
    setBody(processedBody);
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleAiEnhance = async () => {
    if (!body.trim()) return;
    
    setIsAiEnhancing(true);
    try {
      // Simulate AI enhancement (would connect to actual AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const enhancedBody = body + '\n\n[AI Enhancement: Added personalized touches and improved tone]';
      setBody(enhancedBody);
      
      // Simulate AI suggestions
      setAiSuggestions([
        'Consider mentioning their specific skills from their resume',
        'Add a timeline for next steps',
        'Include company culture highlights'
      ]);
    } finally {
      setIsAiEnhancing(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    
    setIsSending(true);
    try {
      await onSend({
        subject: subject.trim(),
        body: body.trim(),
        templateId: selectedTemplate?.id
      });
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = () => {
    if (subject.trim() || body.trim()) {
      onSaveDraft({
        subject: subject.trim(),
        body: body.trim()
      });
    }
  };

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (subject.trim() || body.trim()) {
        handleSaveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [subject, body]);

  return (
    <div className="space-y-6">
      {/* Email Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">Compose Email</p>
            <p className="text-sm text-gray-600">To: {candidate.name} ({candidate.email})</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <File className="h-4 w-4 mr-1.5" />
            Templates
          </button>
          
          <button
            onClick={handleAiEnhance}
            disabled={!body.trim() || isAiEnhancing}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
          >
            {isAiEnhancing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-1.5"></div>
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                AI Enhance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Selection */}
      {showTemplates && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Email Templates</h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Relevant for {candidate.currentStage} stage:
            </div>
            {relevantTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-white hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{template.name}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">{template.category}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {substituteVariables(template.subject)}
                </p>
              </button>
            ))}
            
            <div className="text-sm font-medium text-gray-700 mt-4 mb-2">
              All Templates:
            </div>
            {allTemplates.filter(t => !relevantTemplates.includes(t)).map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-white hover:border-primary-300 transition-colors opacity-75"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{template.name}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">{template.category}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {substituteVariables(template.subject)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
          <h4 className="font-medium text-purple-900 mb-2 flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            AI Suggestions
          </h4>
          <ul className="space-y-1">
            {aiSuggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-purple-700 flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Email Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-field"
            placeholder="Enter email subject..."
            required
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="body"
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input-field resize-none"
            placeholder="Type your message here..."
            required
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {body.length} characters
            </p>
            {selectedTemplate && (
              <p className="text-xs text-gray-500 flex items-center">
                <File className="h-3 w-3 mr-1" />
                Using template: {selectedTemplate.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>
          
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Auto-saves every 30s
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim() || isSending}
            className="btn-primary inline-flex items-center disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
