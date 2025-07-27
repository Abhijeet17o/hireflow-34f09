import { useState, useMemo } from 'react';
import { X, Send, Users, Mail, Sparkles } from 'lucide-react';
import { type Candidate, type Stage } from '../types';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  stages: Stage[];
  selectedCandidateIds?: Set<string>;
  onSendBulkEmail: (email: {
    subject: string;
    body: string;
    candidateIds: string[];
    templateId?: string;
  }) => Promise<void>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'announcement' | 'update' | 'reminder' | 'invitation' | 'custom';
  stages: string[];
}

const BULK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'status-update',
    name: 'Application Status Update',
    subject: 'Update on Your Application - {{campaign.title}}',
    body: `Dear {{candidate.name}},

We wanted to provide you with an update on your application for the {{campaign.title}} position at {{company.name}}.

Your application is currently being reviewed by our team. We appreciate your patience during this process and will keep you informed of any developments.

If you have any questions, please don't hesitate to reach out to us.

Best regards,
{{user.name}}
{{company.name}} Recruitment Team`,
    category: 'update',
    stages: ['Applied', 'Interview', 'Assessment']
  },
  {
    id: 'interview-batch',
    name: 'Batch Interview Invitation',
    subject: 'Interview Invitation - {{campaign.title}} | {{company.name}}',
    body: `Dear {{candidate.name}},

Congratulations! We are pleased to invite you for an interview for the {{campaign.title}} position at {{company.name}}.

Interview Details:
- Date: [To be scheduled individually]
- Format: [Video call/In-person]
- Duration: Approximately 45-60 minutes

Our team will reach out to you individually within the next 2 business days to schedule your specific interview time.

Please confirm your interest by replying to this email.

Best regards,
{{user.name}}
{{company.name}} Recruitment Team`,
    category: 'invitation',
    stages: ['Applied', 'Assessment']
  },
  {
    id: 'position-filled',
    name: 'Position Filled Notification',
    subject: 'Thank You for Your Interest - {{campaign.title}}',
    body: `Dear {{candidate.name}},

Thank you for your interest in the {{campaign.title}} position at {{company.name}} and for the time you invested in our selection process.

We have completed our recruitment for this position and have made our final selection. While we were impressed with your qualifications, we have decided to move forward with other candidates.

We encourage you to apply for future opportunities that match your skills and experience. We will keep your profile on file for consideration for upcoming positions.

Thank you again for considering {{company.name}} as a potential employer.

Best regards,
{{user.name}}
{{company.name}} Recruitment Team`,
    category: 'announcement',
    stages: ['Applied', 'Interview', 'Assessment']
  }
];

export function BulkEmailModal({ 
  isOpen, 
  onClose, 
  candidates, 
  stages,
  selectedCandidateIds = new Set(), 
  onSendBulkEmail 
}: BulkEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [filterByStage, setFilterByStage] = useState<string>('all');
  const [customSelection, setCustomSelection] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<'existing' | 'filtered' | 'custom'>(
    selectedCandidateIds.size > 0 ? 'existing' : 'filtered'
  );
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Helper function to get stage name by ID
  const getStageName = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : stageId;
  };

  // Calculate available stages with proper names
  const availableStages = useMemo(() => {
    const usedStageIds = new Set(candidates.map(c => c.currentStage));
    return stages
      .filter(stage => usedStageIds.has(stage.id))
      .sort((a, b) => a.order - b.order);
  }, [candidates, stages]);

  // Calculate target candidates based on selection mode
  const targetCandidates = useMemo(() => {
    switch (selectionMode) {
      case 'existing':
        return candidates.filter(c => selectedCandidateIds.has(c.id));
      case 'filtered':
        return filterByStage === 'all' 
          ? candidates 
          : candidates.filter(c => c.currentStage === filterByStage);
      case 'custom':
        return candidates.filter(c => customSelection.has(c.id));
      default:
        return [];
    }
  }, [selectionMode, candidates, selectedCandidateIds, filterByStage, customSelection]);

  // Template variable substitution
  const substituteVariables = (text: string, candidate: Candidate): string => {
    return text
      .replace(/\{\{candidate\.name\}\}/g, candidate.name)
      .replace(/\{\{candidate\.email\}\}/g, candidate.email)
      .replace(/\{\{campaign\.title\}\}/g, 'Software Developer') // Would come from context
      .replace(/\{\{company\.name\}\}/g, 'TechCorp Inc.') // Would come from user settings
      .replace(/\{\{user\.name\}\}/g, 'HR Manager'); // Would come from user context
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSubject(template.subject);
    setBody(template.body);
    setSelectedTemplate(template);
  };

  const handleCustomSelectionToggle = (candidateId: string) => {
    const newSelection = new Set(customSelection);
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId);
    } else {
      newSelection.add(candidateId);
    }
    setCustomSelection(newSelection);
  };

  const handleAiEnhance = async () => {
    if (!body.trim()) return;
    
    setIsAiEnhancing(true);
    try {
      // Simulate AI enhancement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const enhancedBody = body + '\n\n[AI Enhancement: Personalized for bulk communication with professional tone]';
      setBody(enhancedBody);
    } finally {
      setIsAiEnhancing(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim() || targetCandidates.length === 0) return;
    
    setIsSending(true);
    try {
      await onSendBulkEmail({
        subject: subject.trim(),
        body: body.trim(),
        candidateIds: targetCandidates.map(c => c.id),
        templateId: selectedTemplate?.id
      });
      onClose();
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bulk Email</h2>
              <p className="text-sm text-gray-600">
                Send emails to multiple candidates at once
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area - Always takes full width */}
          <div className="flex-1 flex flex-col">
            {/* Selection Mode */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3">Select Recipients</h3>
              <div className="space-y-3">
                {selectedCandidateIds.size > 0 && (
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="selectionMode"
                      value="existing"
                      checked={selectionMode === 'existing'}
                      onChange={(e) => setSelectionMode(e.target.value as any)}
                      className="mr-3"
                    />
                    <span className="text-sm">
                      Use existing selection ({selectedCandidateIds.size} candidates)
                    </span>
                  </label>
                )}

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="selectionMode"
                    value="filtered"
                    checked={selectionMode === 'filtered'}
                    onChange={(e) => setSelectionMode(e.target.value as any)}
                    className="mr-3"
                  />
                  <span className="text-sm">Filter by stage:</span>
                  <select
                    value={filterByStage}
                    onChange={(e) => setFilterByStage(e.target.value)}
                    disabled={selectionMode !== 'filtered'}
                    className="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">All stages</option>
                    {availableStages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="selectionMode"
                    value="custom"
                    checked={selectionMode === 'custom'}
                    onChange={(e) => setSelectionMode(e.target.value as any)}
                    className="mr-3"
                  />
                  <span className="text-sm">
                    Custom selection ({customSelection.size} candidates)
                  </span>
                </label>
              </div>

              <div className="mt-3 p-3 bg-white rounded border">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-700">
                    {targetCandidates.length} recipients selected
                  </span>
                </div>
              </div>
            </div>

            {/* Email Composition */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Templates */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Email Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BULK_EMAIL_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`text-left p-3 border rounded-lg hover:border-primary-300 transition-colors ${
                        selectedTemplate?.id === template.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{template.name}</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {template.subject}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject *
                  </label>
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
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                  placeholder="Enter email subject..."
                  required
                />

                <div>
                  <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="body"
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="input-field resize-none"
                    placeholder="Type your message here..."
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Variables: {`{{candidate.name}}, {{campaign.title}}, {{company.name}}`}
                    </p>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {showPreview && targetCandidates.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h5 className="font-medium text-gray-900 mb-2">Preview for {targetCandidates[0].name}:</h5>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium">Subject:</span> {substituteVariables(subject, targetCandidates[0])}
                      </div>
                      <div>
                        <span className="font-medium">Body:</span>
                        <div className="mt-1 p-2 bg-white rounded border text-xs whitespace-pre-wrap">
                          {substituteVariables(body, targetCandidates[0])}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Ready to send to {targetCandidates.length} candidates
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!subject.trim() || !body.trim() || targetCandidates.length === 0 || isSending}
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
                        Send to {targetCandidates.length} candidates
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Always Visible */}
          <div className="w-80 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">
                {selectionMode === 'custom' ? 'Select Candidates' : 'Recipients Preview'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {selectionMode === 'custom' 
                  ? 'Choose specific candidates to email'
                  : `${targetCandidates.length} candidates will receive this email`
                }
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectionMode === 'custom' ? (
                /* Custom Selection Mode */
                candidates.map((candidate) => (
                  <label key={candidate.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={customSelection.has(candidate.id)}
                      onChange={() => handleCustomSelectionToggle(candidate.id)}
                      className="mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {candidate.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {candidate.email} • {getStageName(candidate.currentStage)}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                /* Preview Mode */
                targetCandidates.length > 0 ? (
                  targetCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center p-2 bg-green-50 rounded border border-green-200">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-green-700">
                          {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {candidate.name}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {candidate.email} • {getStageName(candidate.currentStage)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No recipients selected</p>
                    <p className="text-xs mt-1">Choose a selection mode above</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
