import { useState, useEffect } from 'react';
import { X, Clock, Mail, Phone, ExternalLink, User, MessageSquare, FileText, AlertCircle } from 'lucide-react';
import { type Candidate } from '../types';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  currentStage: string;
  onStageChange?: (candidateId: string, newStage: string) => void;
  availableStages: Array<{ id: string; name: string; color: string }>;
  onSendMessage?: (candidate: Candidate) => void;
}

export function CandidateDetailModal({ 
  isOpen, 
  onClose, 
  candidate, 
  currentStage,
  onStageChange,
  availableStages,
  onSendMessage
}: CandidateDetailModalProps) {
  const [timeInStage, setTimeInStage] = useState<string>('');
  const [reminderStatus, setReminderStatus] = useState<'none' | 'due' | 'overdue'>('none');

  useEffect(() => {
    if (!candidate) return;

    const calculateTimeInStage = () => {
      const lastUpdated = new Date(candidate.lastUpdated);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      let timeString = '';
      let status: 'none' | 'due' | 'overdue' = 'none';

      if (diffInHours < 1) {
        timeString = 'Less than 1 hour';
      } else if (diffInHours < 24) {
        timeString = `${diffInHours} hour${diffInHours === 1 ? '' : 's'}`;
      } else if (diffInDays < 7) {
        timeString = `${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
        if (diffInDays >= 3) status = 'due';
        if (diffInDays >= 7) status = 'overdue';
      } else {
        const weeks = Math.floor(diffInDays / 7);
        timeString = `${weeks} week${weeks === 1 ? '' : 's'}`;
        status = 'overdue';
      }

      setTimeInStage(timeString);
      setReminderStatus(status);
    };

    calculateTimeInStage();
    // Update every minute
    const interval = setInterval(calculateTimeInStage, 60000);
    return () => clearInterval(interval);
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const getStageColor = (stageName: string) => {
    const stage = availableStages.find(s => s.name === stageName);
    return stage?.color || '#6B7280';
  };

  const getReminderMessage = () => {
    switch (reminderStatus) {
      case 'due':
        return {
          message: 'This candidate has been in this stage for a while. Consider taking action.',
          color: 'yellow',
          icon: Clock
        };
      case 'overdue':
        return {
          message: 'This candidate has been in this stage for too long. Immediate attention recommended.',
          color: 'red',
          icon: AlertCircle
        };
      default:
        return null;
    }
  };

  const reminderInfo = getReminderMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{candidate.name}</h2>
              <p className="text-sm text-gray-600">Candidate Details</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Reminder Alert */}
          {reminderInfo && (
            <div className={`mb-6 p-4 rounded-lg border-l-4 ${
              reminderInfo.color === 'yellow' 
                ? 'bg-yellow-50 border-yellow-400' 
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="flex items-start">
                <reminderInfo.icon className={`h-5 w-5 mt-0.5 mr-3 ${
                  reminderInfo.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                }`} />
                <div>
                  <p className={`font-medium ${
                    reminderInfo.color === 'yellow' ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    Action Required
                  </p>
                  <p className={`text-sm mt-1 ${
                    reminderInfo.color === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {reminderInfo.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <a 
                    href={`mailto:${candidate.email}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {candidate.email}
                  </a>
                </div>
              </div>

              {candidate.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <a 
                      href={`tel:${candidate.phone}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {candidate.phone}
                    </a>
                  </div>
                </div>
              )}

              {candidate.resumeUrl && (
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Resume</p>
                    <a 
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      View Resume
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 mb-3">Pipeline Status</h3>
              
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getStageColor(currentStage) }}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Stage</p>
                  <p className="text-sm text-gray-900">{currentStage}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Time in Current Stage</p>
                  <p className={`text-sm font-medium ${
                    reminderStatus === 'overdue' ? 'text-red-600' :
                    reminderStatus === 'due' ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {timeInStage}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Communications</p>
                  <p className="text-sm text-gray-900">
                    {candidate.communicationLog.length} message{candidate.communicationLog.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {candidate.notes && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.notes}</p>
              </div>
            </div>
          )}

          {/* Recent Communications */}
          {candidate.communicationLog.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Recent Communications</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {candidate.communicationLog.slice(-3).reverse().map((message) => (
                  <div key={message.id} className="bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          message.direction === 'incoming' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {message.direction === 'incoming' ? 'From Candidate' : 'To Candidate'}
                        </span>
                        {message.isAiGenerated && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{message.subject}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage Change Section */}
          {onStageChange && (
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-3">Change Stage</h3>
              <div className="flex flex-wrap gap-2">
                {availableStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => onStageChange(candidate.id, stage.name)}
                    disabled={stage.name === currentStage}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      stage.name === currentStage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                    style={{
                      borderLeftColor: stage.color,
                      borderLeftWidth: '4px',
                    }}
                  >
                    {stage.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (onSendMessage && candidate) {
                onSendMessage(candidate);
              }
            }}
            className="btn-primary flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
