import { useState } from 'react';
import { X, Bot, User, Mail, Phone, ExternalLink, Clock, MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Candidate } from '../types';
import { EmailComposer } from './EmailComposer';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onSendMessage: (message: { subject: string; body: string }) => void;
  onUpdateNotes?: (candidateId: string, notes: string) => void;
}

export function CommunicationModal({ isOpen, onClose, candidate, onSendMessage, onUpdateNotes }: CommunicationModalProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'details' | 'notes'>('compose');

  if (!isOpen || !candidate) return null;

  const sortedMessages = [...candidate.communicationLog].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{candidate.name}</h2>
              <p className="text-sm text-gray-600">{candidate.email}</p>
            </div>
            {candidate.communicationLog.some(msg => msg.isAiGenerated) && (
              <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                <Bot className="h-4 w-4 mr-1" />
                AI Auto-Reply Active
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'compose', label: 'Compose Email', icon: Mail },
            { id: 'history', label: 'Message History', count: candidate.communicationLog.length, icon: MessageSquare },
            { id: 'details', label: 'Contact Details', icon: User },
            { id: 'notes', label: 'Notes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1 px-2 py-1 text-xs bg-gray-100 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'compose' && (
            <div className="p-6 h-full overflow-y-auto">
              <EmailComposer
                candidate={candidate}
                onSend={async (email) => {
                  await onSendMessage(email);
                }}
                onSaveDraft={(draft) => {
                  // Save draft to localStorage or send to backend
                  console.log('Draft saved:', draft);
                }}
                onClose={onClose}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="h-full flex flex-col">
              {/* Messages History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {sortedMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No messages yet</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      No communication history found. Use the Compose tab to send your first message.
                    </p>
                  </div>
                ) : (
                  sortedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-2xl px-4 py-3 rounded-lg ${
                          message.direction === 'outgoing'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {message.direction === 'outgoing' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{message.subject}</span>
                          {message.isAiGenerated && (
                            <Bot className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{message.body}</div>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.direction === 'outgoing' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          <span>
                            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                          </span>
                          {message.isAiGenerated && (
                            <span className="flex items-center">
                              <Bot className="h-3 w-3 mr-1" />
                              AI Generated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{candidate.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <a
                        href={`mailto:${candidate.email}`}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        {candidate.email}
                      </a>
                    </div>
                  </div>

                  {candidate.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <a
                          href={`tel:${candidate.phone}`}
                          className="text-sm text-primary-600 hover:text-primary-800"
                        >
                          {candidate.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Stage</label>
                    <p className="mt-1 text-sm text-gray-900">{candidate.currentStage}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <div className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDistanceToNow(new Date(candidate.lastUpdated), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {candidate.resumeUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Resume</label>
                      <div className="mt-1">
                        <a
                          href={candidate.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Resume
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Notes
                </label>
                <textarea
                  id="notes"
                  rows={8}
                  className="input-field resize-none"
                  value={candidate.notes || ''}
                  placeholder="Add notes about this candidate..."
                  onChange={(e) => {
                    if (onUpdateNotes && candidate) {
                      onUpdateNotes(candidate.id, e.target.value);
                    }
                  }}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Notes are private and visible only to your team
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
