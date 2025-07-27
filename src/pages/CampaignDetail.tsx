import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Upload,
  UserPlus,
  Mail
} from 'lucide-react';
import { 
  DndContext, 
  type DragEndEvent, 
  DragOverlay, 
  type DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from '../components/KanbanColumn';
import { CandidateCard } from '../components/CandidateCard';
import { CandidateUploadModal } from '../components/CandidateUploadModal';
import { ManualCandidateModal } from '../components/ManualCandidateModal';
import { CommunicationModal } from '../components/CommunicationModal';
import { StageChangeConfirmModal } from '../components/StageChangeConfirmModal';
import { BulkStageChangeModal } from '../components/BulkStageChangeModal';
import { BulkDeleteConfirmModal } from '../components/BulkDeleteConfirmModal';
import { BulkEmailModal } from '../components/BulkEmailModal';
import { CampaignSettingsModal } from '../components/CampaignSettingsModal';
import { CandidateDetailModal } from '../components/CandidateDetailModal';
import { type JobCampaign, type Candidate, type CandidateUpload } from '../types';
import { storageAPI } from '../utils/storage';

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<JobCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [manualAddModalOpen, setManualAddModalOpen] = useState(false);
  const [communicationModalOpen, setCommunicationModalOpen] = useState(false);
  const [stageChangeModalOpen, setStageChangeModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [candidateDetailModalOpen, setCandidateDetailModalOpen] = useState(false);
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<Candidate | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState<boolean>(false);
  const [bulkStageChangeModalOpen, setBulkStageChangeModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkEmailModalOpen, setBulkEmailModalOpen] = useState(false);
  const [pendingBulkStageChange, setPendingBulkStageChange] = useState<{
    targetStageId: string;
    targetStageName: string;
  } | null>(null);
  const [pendingStageChange, setPendingStageChange] = useState<{
    candidateId: string;
    newStage: string;
    fromStage: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Load campaign data from storage
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
        } else {
          console.error(`Campaign not found with ID: ${id}`);
          // Redirect to dashboard if campaign not found
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
  }, [id]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !campaign) {
      setActiveId(null);
      return;
    }

    const candidateId = active.id as string;
    const newStage = over.id as string;

    // Find the candidate and update their stage
    const candidateIndex = campaign.candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      setActiveId(null);
      return;
    }

    const candidate = campaign.candidates[candidateIndex];
    
    // If dropping in the same stage, just reset activeId
    if (candidate.currentStage === newStage) {
      setActiveId(null);
      return;
    }

    // Store the pending change and show confirmation modal
    setPendingStageChange({
      candidateId,
      newStage,
      fromStage: candidate.currentStage,
    });
    setStageChangeModalOpen(true);
    setActiveId(null);
  };

  const handleStageChangeConfirm = async (reason: string) => {
    if (!campaign || !pendingStageChange) return;

    const { candidateId, newStage, fromStage } = pendingStageChange;
    const candidateIndex = campaign.candidates.findIndex(c => c.id === candidateId);
    
    if (candidateIndex === -1) return;

    const candidate = campaign.candidates[candidateIndex];
    const fromStageName = campaign.stages.find(s => s.id === fromStage)?.name || fromStage;
    const toStageName = campaign.stages.find(s => s.id === newStage)?.name || newStage;

    // Update candidate stage with reason
    const updatedCandidates = [...campaign.candidates];
    updatedCandidates[candidateIndex] = {
      ...candidate,
      currentStage: newStage,
      lastUpdated: new Date().toISOString(),
      communicationLog: [
        ...candidate.communicationLog,
        {
          id: `stage-change-${Date.now()}`,
          direction: 'outgoing' as const,
          subject: 'Stage Change Notification',
          body: `Stage changed from ${fromStageName} to ${toStageName}. Reason: ${reason}`,
          timestamp: new Date().toISOString(),
          isAiGenerated: false,
        },
      ],
    };

    const updatedCampaign = {
      ...campaign,
      candidates: updatedCandidates,
    };

    setCampaign(updatedCampaign);
    
    // Save to storage
    try {
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);
      setUploadSuccess(`Successfully moved ${candidate.name} to ${toStageName}`);
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating campaign:', error);
    }

    // Reset pending change
    setPendingStageChange(null);
    setStageChangeModalOpen(false);
  };

  const handleStageChangeCancel = () => {
    setPendingStageChange(null);
    setStageChangeModalOpen(false);
  };

  // Handle individual candidate selection
  const handleCandidateSelect = (candidateId: string, isSelected: boolean) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(candidateId);
      } else {
        newSet.delete(candidateId);
      }
      return newSet;
    });
  };

  // Handle select all candidates in a stage
  const handleSelectAllInStage = (candidates: Candidate[], isSelected: boolean) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      candidates.forEach(candidate => {
        if (isSelected) {
          newSet.add(candidate.id);
        } else {
          newSet.delete(candidate.id);
        }
      });
      return newSet;
    });
  };

  // Handle bulk stage change
  const handleBulkStageChange = (targetStageId: string) => {
    if (selectedCandidates.size === 0 || !campaign) return;

    const targetStage = campaign.stages.find(s => s.id === targetStageId);
    if (!targetStage) return;

    // Store the pending bulk change and show confirmation modal
    setPendingBulkStageChange({
      targetStageId,
      targetStageName: targetStage.name,
    });
    setBulkStageChangeModalOpen(true);
  };

  // Handle bulk stage change confirmation
  const handleBulkStageChangeConfirm = async (reason: string) => {
    if (selectedCandidates.size === 0 || !campaign || !pendingBulkStageChange) return;

    const { targetStageId, targetStageName } = pendingBulkStageChange;
    const candidatesToMove = Array.from(selectedCandidates);
    
    const updatedCandidates = campaign.candidates.map(candidate => {
      if (candidatesToMove.includes(candidate.id)) {
        return {
          ...candidate,
          currentStage: targetStageId,
          lastUpdated: new Date().toISOString(),
          communicationLog: [
            ...candidate.communicationLog,
            {
              id: `bulk-move-${Date.now()}-${candidate.id}`,
              direction: 'outgoing' as const,
              subject: 'Bulk Stage Change',
              body: `Moved to ${targetStageName} via bulk action. Reason: ${reason}`,
              timestamp: new Date().toISOString(),
              isAiGenerated: false,
            },
          ],
        };
      }
      return candidate;
    });

    const updatedCampaign = {
      ...campaign,
      candidates: updatedCandidates,
    };

    setCampaign(updatedCampaign);
    storageAPI.updateCampaign(campaign.id, updatedCampaign);
    setUploadSuccess(`Successfully moved ${candidatesToMove.length} candidates to ${targetStageName}`);
    setTimeout(() => setUploadSuccess(null), 3000);
    
    // Clear selections and close modal
    setSelectedCandidates(new Set());
    setBulkActionMode(false);
    setBulkStageChangeModalOpen(false);
    setPendingBulkStageChange(null);
  };

  // Clear all selections
  const handleClearSelections = () => {
    setSelectedCandidates(new Set());
    setBulkActionMode(false);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedCandidates.size === 0 || !campaign) return;
    setBulkDeleteModalOpen(true);
  };

  // Handle bulk delete confirmation
  const handleBulkDeleteConfirm = async () => {
    if (selectedCandidates.size === 0 || !campaign) return;

    const candidatesToDelete = Array.from(selectedCandidates);
    
    // Remove candidates from the campaign
    const updatedCandidates = campaign.candidates.filter(
      candidate => !candidatesToDelete.includes(candidate.id)
    );

    const updatedCampaign = {
      ...campaign,
      candidates: updatedCandidates,
    };

    setCampaign(updatedCampaign);
    
    try {
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);
      setUploadSuccess(`Successfully deleted ${candidatesToDelete.length} candidate${candidatesToDelete.length > 1 ? 's' : ''}`);
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting candidates:', error);
    }
    
    // Clear selections and close modals
    setSelectedCandidates(new Set());
    setBulkDeleteModalOpen(false);
    setBulkActionMode(false);
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
      // In a real app, this would send emails via API
      // For now, we'll simulate by adding to communication logs
      
      const timestamp = new Date().toISOString();
      const updatedCandidates = campaign.candidates.map(candidate => {
        if (emailData.candidateIds.includes(candidate.id)) {
          const newMessage = {
            id: `bulk-${Date.now()}-${candidate.id}`,
            subject: emailData.subject.replace('{{candidate.name}}', candidate.name),
            body: emailData.body.replace(/\{\{candidate\.name\}\}/g, candidate.name),
            timestamp,
            direction: 'outgoing' as const,
            isAiGenerated: false,
            templateId: emailData.templateId
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
      
      setUploadSuccess(`Successfully sent emails to ${emailData.candidateIds.length} candidate${emailData.candidateIds.length > 1 ? 's' : ''}`);
      setTimeout(() => setUploadSuccess(null), 5000);
      
      // Clear selections and exit bulk mode
      setSelectedCandidates(new Set());
      setBulkActionMode(false);
    } catch (error) {
      console.error('Error sending bulk email:', error);
    }
  };

  // Filter candidates based on search query
  const filterCandidates = (candidates: Candidate[]) => {
    if (!searchQuery.trim()) return candidates;
    
    const query = searchQuery.toLowerCase().trim();
    return candidates.filter(candidate => {
      // Get stage name for current candidate
      const stageName = campaign?.stages.find(s => s.id === candidate.currentStage)?.name || '';
      
      return (
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        (candidate.phone && candidate.phone.toLowerCase().includes(query)) ||
        (candidate.notes && candidate.notes.toLowerCase().includes(query)) ||
        stageName.toLowerCase().includes(query)
      );
    });
  };

  const handleCandidateUpload = async (candidates: CandidateUpload[]) => {
    if (!campaign) return;

    // Helper function to map stage names to stage IDs
    const getStageId = (stageName: string) => {
      const stage = campaign.stages.find(s => s.name.toLowerCase() === stageName.toLowerCase());
      return stage ? stage.id : 'sourced'; // default to 'sourced' if not found
    };

    const newCandidates: Candidate[] = candidates.map((candidate, index) => ({
      id: `${Date.now()}-${index}`,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      resumeUrl: candidate.resumeUrl,
      currentStage: getStageId(candidate.stage || 'Sourced'),
      threadId: `thread-${Date.now()}-${index}`,
      lastUpdated: new Date().toISOString(),
      communicationLog: [],
    }));

    const updatedCampaign = {
      ...campaign,
      candidates: [...campaign.candidates, ...newCandidates],
    };

    setCampaign(updatedCampaign);
    
    // Save to storage
    try {
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);
      setUploadSuccess(`Successfully uploaded ${candidates.length} candidates!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating campaign:', error);
    }

    setUploadModalOpen(false);
  };

  const handleManualCandidateAdd = async (candidateData: {
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    stage: string;
  }) => {
    if (!campaign) return;

    // Helper function to map stage names to stage IDs
    const getStageId = (stageName: string) => {
      const stage = campaign.stages.find(s => s.name.toLowerCase() === stageName.toLowerCase());
      return stage ? stage.id : 'sourced'; // default to 'sourced' if not found
    };

    const newCandidate: Candidate = {
      id: `manual-${Date.now()}`,
      name: candidateData.name,
      email: candidateData.email,
      phone: candidateData.phone || '',
      resumeUrl: candidateData.resumeUrl,
      currentStage: getStageId(candidateData.stage),
      threadId: `thread-manual-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      communicationLog: [],
    };

    const updatedCampaign = {
      ...campaign,
      candidates: [...campaign.candidates, newCandidate],
    };

    setCampaign(updatedCampaign);
    
    // Save to storage
    try {
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);
      setUploadSuccess(`Successfully added candidate ${candidateData.name}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(null), 3000);
      setManualAddModalOpen(false);
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  const handleSendMessage = async (message: { subject: string; body: string }) => {
    if (!selectedCandidate || !campaign) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      direction: 'outgoing' as const,
      subject: message.subject,
      body: message.body,
      timestamp: new Date().toISOString(),
      isAiGenerated: false,
    };

    // Update candidate's communication log
    const updatedCandidates = campaign.candidates.map(candidate => {
      if (candidate.id === selectedCandidate.id) {
        return {
          ...candidate,
          communicationLog: [...candidate.communicationLog, newMessage],
          lastUpdated: new Date().toISOString(),
        };
      }
      return candidate;
    });

    const updatedCampaign = {
      ...campaign,
      candidates: updatedCandidates,
    };

    setCampaign(updatedCampaign);
    
    // Update selected candidate for modal
    const updatedCandidate = updatedCandidates.find(c => c.id === selectedCandidate.id);
    if (updatedCandidate) {
      setSelectedCandidate(updatedCandidate);
    }

    // Save to storage
    try {
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const openCommunicationModal = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCommunicationModalOpen(true);
  };

  const handleUpdateNotes = async (candidateId: string, notes: string) => {
    if (!campaign) return;

    try {
      // Update candidate notes
      const updatedCandidates = campaign.candidates.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, notes, lastUpdated: new Date().toISOString() }
          : candidate
      );

      const updatedCampaign = {
        ...campaign,
        candidates: updatedCandidates,
      };

      setCampaign(updatedCampaign);
      await storageAPI.updateCampaign(campaign.id, updatedCampaign);

      // Update the selected candidate if it's the one being edited
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate({ ...selectedCandidate, notes });
      }

      // Update the selected candidate for detail modal if it's the one being edited
      if (selectedCandidateForDetail && selectedCandidateForDetail.id === candidateId) {
        setSelectedCandidateForDetail({ ...selectedCandidateForDetail, notes });
      }
    } catch (error) {
      console.error('Error updating candidate notes:', error);
    }
  };

  const openCandidateDetailModal = (candidate: Candidate) => {
    setSelectedCandidateForDetail(candidate);
    setCandidateDetailModalOpen(true);
  };

  const handleStageChangeFromDetail = async (candidateId: string, newStage: string) => {
    if (!campaign) return;
    
    const candidate = campaign.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Update candidate stage and lastUpdated timestamp
    const updatedCandidate = {
      ...candidate,
      currentStage: newStage,
      lastUpdated: new Date().toISOString(),
    };

    const updatedCandidates = campaign.candidates.map(c => 
      c.id === candidateId ? updatedCandidate : c
    );

    const updatedCampaign = {
      ...campaign,
      candidates: updatedCandidates,
    };

    setCampaign(updatedCampaign);
    await storageAPI.updateCampaign(campaign.id, { candidates: updatedCandidates });
    
    // Update the detail modal candidate
    setSelectedCandidateForDetail(updatedCandidate);
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

  const activeCandidate = campaign.candidates.find(c => c.id === activeId);

  return (
    <div>
      {/* Success Notification */}
      {uploadSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {uploadSuccess}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <p className="text-gray-600 mt-1">{campaign.description}</p>
            <div className="flex items-center space-x-4 mt-4">
              <span className="text-sm text-gray-500">
                📍 {campaign.location}
              </span>
              <span className="text-sm text-gray-500">
                🏢 {campaign.department}
              </span>
              <span className="text-sm text-gray-500">
                👥 {campaign.openings} opening{campaign.openings !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn-secondary flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Candidates
            </button>
            <button
              onClick={() => setManualAddModalOpen(true)}
              className="btn-secondary flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Candidate
            </button>
            <button
              onClick={() => setBulkEmailModalOpen(true)}
              className="btn-primary flex items-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Bulk Email
            </button>
            <button 
              onClick={() => setSettingsModalOpen(true)}
              className="btn-secondary flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search candidates by name, email, phone, stage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
              }
            }}
            className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            {campaign ? (() => {
              const filteredCount = filterCandidates(campaign.candidates).length;
              const totalCount = campaign.candidates.length;
              return `Showing ${filteredCount} of ${totalCount} candidates matching "${searchQuery}"`;
            })() : ''}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {!bulkActionMode ? (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1"></div>
          <button
            onClick={() => setBulkActionMode(true)}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200 hover:border-blue-300 transition-all duration-200 flex items-center shadow-sm"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Multi-Select
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">Selection mode</span>
              </div>
              
              {selectedCandidates.size > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{selectedCandidates.size}</span> selected
                  </div>
                  <button
                    onClick={handleClearSelections}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {selectedCandidates.size > 0 && campaign && (
                <>
                  <span className="text-xs text-gray-500 mr-2">Move to:</span>
                  {campaign.stages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => handleBulkStageChange(stage.id)}
                      className="px-3 py-1 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                      {stage.name}
                    </button>
                  ))}
                  <div className="w-px h-4 bg-gray-300 mx-2"></div>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 text-xs font-medium rounded border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all flex items-center"
                  >
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete ({selectedCandidates.size})
                  </button>
                  <button
                    onClick={() => setBulkEmailModalOpen(true)}
                    className="px-3 py-1 text-xs font-medium rounded border border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400 transition-all flex items-center"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email ({selectedCandidates.size})
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-2"></div>
                </>
              )}
              <button
                onClick={() => {
                  setBulkActionMode(false);
                  setSelectedCandidates(new Set());
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {campaign.stages.map((stage) => {
            const allStageCandidates = campaign.candidates.filter(c => c.currentStage === stage.id);
            const filteredStageCandidates = filterCandidates(allStageCandidates);
            
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                candidates={filteredStageCandidates}
                onCandidateClick={openCandidateDetailModal}
                onMessageClick={openCommunicationModal}
                showCheckboxes={bulkActionMode}
                selectedCandidates={selectedCandidates}
                onCandidateSelect={handleCandidateSelect}
                onSelectAll={handleSelectAllInStage}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <CandidateCard candidate={activeCandidate} onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <CandidateUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleCandidateUpload}
        stages={campaign.stages}
      />

      <ManualCandidateModal
        isOpen={manualAddModalOpen}
        onClose={() => setManualAddModalOpen(false)}
        onAdd={handleManualCandidateAdd}
        stages={campaign.stages}
      />

      <CommunicationModal
        isOpen={communicationModalOpen}
        onClose={() => setCommunicationModalOpen(false)}
        candidate={selectedCandidate}
        onSendMessage={handleSendMessage}
        onUpdateNotes={handleUpdateNotes}
      />

      <StageChangeConfirmModal
        isOpen={stageChangeModalOpen}
        onClose={handleStageChangeCancel}
        onConfirm={handleStageChangeConfirm}
        candidate={
          pendingStageChange && campaign
            ? campaign.candidates.find(c => c.id === pendingStageChange.candidateId) || null
            : null
        }
        fromStage={
          pendingStageChange && campaign
            ? campaign.stages.find(s => s.id === pendingStageChange.fromStage) || null
            : null
        }
        toStage={
          pendingStageChange && campaign
            ? campaign.stages.find(s => s.id === pendingStageChange.newStage) || null
            : null
        }
      />

      <BulkStageChangeModal
        isOpen={bulkStageChangeModalOpen}
        onClose={() => {
          setBulkStageChangeModalOpen(false);
          setPendingBulkStageChange(null);
        }}
        onConfirm={handleBulkStageChangeConfirm}
        candidateCount={selectedCandidates.size}
        fromStages={
          campaign && selectedCandidates.size > 0
            ? Array.from(new Set(
                Array.from(selectedCandidates)
                  .map(candidateId => {
                    const candidate = campaign.candidates.find(c => c.id === candidateId);
                    return candidate
                      ? campaign.stages.find(s => s.id === candidate.currentStage)?.name || candidate.currentStage
                      : '';
                  })
                  .filter(Boolean)
              ))
            : []
        }
        toStage={pendingBulkStageChange?.targetStageName || ''}
      />

      <BulkDeleteConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        candidates={
          campaign && selectedCandidates.size > 0
            ? Array.from(selectedCandidates)
                .map(candidateId => campaign.candidates.find(c => c.id === candidateId))
                .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== undefined)
            : []
        }
      />

      <CampaignSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        campaignId={campaign?.id || ''}
        campaignTitle={campaign?.title || ''}
      />

      <CandidateDetailModal
        isOpen={candidateDetailModalOpen}
        onClose={() => {
          setCandidateDetailModalOpen(false);
          setSelectedCandidateForDetail(null);
        }}
        candidate={selectedCandidateForDetail}
        currentStage={selectedCandidateForDetail?.currentStage || ''}
        onStageChange={handleStageChangeFromDetail}
        availableStages={campaign?.stages || []}
        onSendMessage={openCommunicationModal}
      />

      <BulkEmailModal
        isOpen={bulkEmailModalOpen}
        onClose={() => setBulkEmailModalOpen(false)}
        candidates={campaign?.candidates || []}
        stages={campaign?.stages || []}
        selectedCandidateIds={selectedCandidates}
        onSendBulkEmail={handleBulkEmail}
      />
    </div>
  );
}
