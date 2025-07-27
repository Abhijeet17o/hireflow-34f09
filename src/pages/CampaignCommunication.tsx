import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Mail, 
  Users, 
  Plus,
  MoreVertical,
  Bot,
  User,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type JobCampaign, type Candidate, type EmailMessage } from '../types';
import { storageAPI } from '../utils/storage';
import { EmailComposer } from '../components/EmailComposer';
import { BulkEmailModal } from '../components/BulkEmailModal';

export function CampaignCommunication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<JobCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [unhandledEmails] = useState<Array<{
    candidateId: string;
    candidateName: string;
    messageId: string;
    subject: string;
    timestamp: string;
    isRead: boolean;
  }>>([]);

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      if (!id) {
        console.error('No campaign ID provided');
        setLoading(false);
        return;
      }
      
      try {
        console.log(`Loading campaign with ID: ${id}`);
        const campaignData = await storageAPI.getCampaignById(id);
        if (campaignData) {
          console.log(`Successfully loaded campaign: ${campaignData.title}`);
          setCampaign(campaignData);
          // Auto-select first candidate if available
          if (campaignData.candidates.length > 0) {
            setSelectedCandidate(campaignData.candidates[0]);
          }
        } else {
          console.error(`Campaign not found with ID: ${id}`);
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [id, navigate]);

  // Filter candidates based on search
  const filteredCandidates = campaign?.candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle sending message
  const handleSendMessage = async (message: { subject: string; body: string }) => {
    if (!selectedCandidate || !campaign) return;

    const newMessage: EmailMessage = {
      id: `msg-${Date.now()}`,
      direction: 'outgoing',
      subject: message.subject,
      body: message.body,
      timestamp: new Date().toISOString(),
      isAiGenerated: false,
    };

    // Update candidate's communication log
    const updatedCandidates = campaign.candidates.map(candidate => 
      candidate.id === selectedCandidate.id 
        ? { 
            ...candidate, 
            communicationLog: [...candidate.communicationLog, newMessage],
            lastUpdated: new Date().toISOString()
          }
        : candidate
    );

    const updatedCampaign = {
      ...campaign,
      candidates: updatedCandidates,
    };

    setCampaign(updatedCampaign);
    
    // Update selected candidate
    const updatedSelectedCandidate = updatedCandidates.find(c => c.id === selectedCandidate.id);
    if (updatedSelectedCandidate) {
      setSelectedCandidate(updatedSelectedCandidate);
    }

    try {
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);
      setShowComposer(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle bulk email
  const handleBulkEmail = async (emailData: {
    subject: string;
    body: string;
    candidateIds: string[];
    templateId?: string;
  }) => {
    if (!campaign) return;

    try {
      const timestamp = new Date().toISOString();
      const updatedCandidates = campaign.candidates.map(candidate => {
        if (emailData.candidateIds.includes(candidate.id)) {
          const newMessage: EmailMessage = {
            id: `bulk-${Date.now()}-${candidate.id}`,
            subject: emailData.subject.replace(/\{\{candidate\.name\}\}/g, candidate.name),
            body: emailData.body.replace(/\{\{candidate\.name\}\}/g, candidate.name),
            timestamp,
            direction: 'outgoing' as const,
            isAiGenerated: false,
          };

          return {
            ...candidate,
            communicationLog: [...candidate.communicationLog, newMessage],
            lastUpdated: timestamp
          };
        }
        return candidate;
      });

      const updatedCampaign = {
        ...campaign,
        candidates: updatedCandidates,
      };

      setCampaign(updatedCampaign);
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);
      
      // Update selected candidate if they were in the bulk email
      if (selectedCandidate && emailData.candidateIds.includes(selectedCandidate.id)) {
        const updatedSelectedCandidate = updatedCandidates.find(c => c.id === selectedCandidate.id);
        if (updatedSelectedCandidate) {
          setSelectedCandidate(updatedSelectedCandidate);
        }
      }

      setShowBulkEmail(false);
      setSelectedCandidates(new Set());
    } catch (error) {
      console.error('Error sending bulk email:', error);
    }
  };

  // Toggle candidate selection for bulk actions
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">Campaign not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{campaign.title}</h1>
              <p className="text-xs lg:text-sm text-gray-600">Communication Hub • {campaign.candidates.length} candidates</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <Link
              to={`/campaign/${campaign.id}`}
              className="hidden lg:inline-flex btn-secondary"
            >
              Manage Pipeline
            </Link>
            <button
              onClick={() => setShowBulkEmail(true)}
              className="btn-primary inline-flex items-center text-sm lg:text-base"
            >
              <Users className="mr-1 lg:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Bulk Email</span>
              <span className="sm:hidden">Bulk</span>
              <span className="ml-1">({selectedCandidates.size})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - WhatsApp Style Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Candidates List */}
        <div className="w-full sm:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-3 lg:p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Selection Controls */}
          {selectedCandidates.size > 0 && (
            <div className="px-4 py-2 bg-primary-50 border-b border-primary-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-700">
                  {selectedCandidates.size} selected
                </span>
                <button
                  onClick={() => setSelectedCandidates(new Set())}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Candidates List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCandidates.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No candidates found</p>
              </div>
            ) : (
              filteredCandidates.map((candidate) => {
                const lastMessage = candidate.communicationLog[candidate.communicationLog.length - 1];
                const isSelected = selectedCandidate?.id === candidate.id;
                const isChecked = selectedCandidates.has(candidate.id);
                const unreadCount = candidate.communicationLog.filter(msg => 
                  msg.direction === 'incoming' && 
                  new Date(msg.timestamp) > new Date(candidate.lastUpdated || 0)
                ).length;
                const hasUnhandledEmail = unhandledEmails.some(email => email.candidateId === candidate.id);
                
                return (
                  <div
                    key={candidate.id}
                    className={`p-3 lg:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-primary-50 border-r-2 border-r-primary-500' : ''
                    }`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 relative">
                        <span className="text-sm font-medium text-primary-700">
                          {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                        {/* Activity Indicator - Red if AI needs attention, Green if normal */}
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                          hasUnhandledEmail ? 'bg-red-500' : 'bg-green-400'
                        }`}></div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {candidate.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <div className="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                <span className="text-xs font-medium">{unreadCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{candidate.email}</p>
                        {lastMessage ? (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {lastMessage.direction === 'outgoing' ? 'You: ' : ''}
                            {lastMessage.subject}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">No messages yet</p>
                        )}
                        
                        {/* Message count and status */}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {candidate.communicationLog.length} message{candidate.communicationLog.length !== 1 ? 's' : ''}
                          </span>
                          {candidate.communicationLog.some(msg => msg.isAiGenerated) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="AI responses enabled"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Conversation View */}
        <div className="flex-1 flex flex-col">
          {selectedCandidate ? (
            <>
              {/* Conversation Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-700">
                        {selectedCandidate.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{selectedCandidate.name}</h2>
                      <p className="text-sm text-gray-600">{selectedCandidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowComposer(true)}
                      className="btn-primary inline-flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Message
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedCandidate.communicationLog.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 mb-4">Start a conversation with {selectedCandidate.name}</p>
                    <button
                      onClick={() => setShowComposer(true)}
                      className="btn-primary"
                    >
                      Send First Message
                    </button>
                  </div>
                ) : (
                  selectedCandidate.communicationLog
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            message.direction === 'outgoing'
                              ? 'bg-primary-500 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {message.direction === 'outgoing' ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Bot className="h-3 w-3" />
                            )}
                            <span className="text-xs font-medium">
                              {message.direction === 'outgoing' ? 'You' : selectedCandidate.name}
                            </span>
                            {message.isAiGenerated && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">AI</span>
                            )}
                          </div>
                          <h4 className="font-medium text-sm mb-1">{message.subject}</h4>
                          <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-75">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                            {message.direction === 'outgoing' && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </>
          ) : (
            /* No candidate selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Select a candidate</h3>
                <p className="text-gray-600">Choose a candidate from the list to view their conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Composer Modal */}
      {showComposer && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <EmailComposer
              candidate={selectedCandidate}
              onSend={handleSendMessage}
              onSaveDraft={() => {}} // TODO: Implement draft saving
              onClose={() => setShowComposer(false)}
            />
          </div>
        </div>
      )}

      {/* Bulk Email Modal */}
      {showBulkEmail && (
        <BulkEmailModal
          isOpen={showBulkEmail}
          onClose={() => setShowBulkEmail(false)}
          candidates={campaign.candidates}
          stages={campaign.stages}
          selectedCandidateIds={selectedCandidates}
          onSendBulkEmail={handleBulkEmail}
        />
      )}
    </div>
  );
}
