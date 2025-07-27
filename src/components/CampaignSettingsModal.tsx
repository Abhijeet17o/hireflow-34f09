import { useState } from 'react';
import { X, Settings, Bot, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CampaignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
}

interface CampaignSettingsForm {
  // AI Communication Settings
  aiAutoResponse: boolean;
  aiResponseStyle: 'professional' | 'friendly' | 'casual';
  aiEscalationThreshold: 'low' | 'medium' | 'high';
  aiHandleQueries: string[];
  
  // Pipeline Settings
  reminderFrequency: 'daily' | 'weekly' | 'biweekly';
  
  // Advanced Settings
  bulkOperationsEnabled: boolean;
  advancedFiltering: boolean;
}

export function CampaignSettingsModal({ isOpen, onClose, campaignId, campaignTitle }: CampaignSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'pipeline'>('ai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<CampaignSettingsForm>({
    defaultValues: {
      // AI Communication defaults
      aiAutoResponse: true,
      aiResponseStyle: 'professional',
      aiEscalationThreshold: 'medium',
      aiHandleQueries: ['application_status', 'job_details'],
      
      // Pipeline defaults
      reminderFrequency: 'weekly',
      
      // Advanced defaults
      bulkOperationsEnabled: true,
      advancedFiltering: true,
    }
  });

  const aiAutoResponse = watch('aiAutoResponse');

  if (!isOpen) return null;

  const onSubmit = async (data: CampaignSettingsForm) => {
    setIsSubmitting(true);
    try {
      // Save campaign settings to localStorage for now
      const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const updatedCampaigns = existingCampaigns.map((campaign: any) => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            settings: data,
            updatedAt: new Date().toISOString(),
          };
        }
        return campaign;
      });
      
      localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
      
      alert('Campaign settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'pipeline', label: 'Pipeline & Settings', icon: Users },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Settings className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Campaign Settings</h2>
              <p className="text-sm text-gray-600">{campaignTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">AI Communication Assistant</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Configure how AI handles candidate communications. When enabled, AI will automatically respond to common queries and escalate complex issues to you for personal attention.
                    </p>
                    
                    {/* AI Auto Response */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Bot className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div className="flex-1">
                          <label className="flex items-center">
                            <input
                              {...register('aiAutoResponse')}
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 font-medium text-gray-900">Enable AI Auto-Response</span>
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            AI will automatically respond to candidate inquiries. If unable to handle a query, it will escalate to you.
                          </p>
                        </div>
                      </div>
                    </div>

                    {aiAutoResponse && (
                      <>
                        {/* AI Response Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Response Style
                            </label>
                            <select
                              {...register('aiResponseStyle')}
                              className="input-field"
                            >
                              <option value="professional">Professional</option>
                              <option value="friendly">Friendly</option>
                              <option value="casual">Casual</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Choose the tone for AI responses</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Escalation Threshold
                            </label>
                            <select
                              {...register('aiEscalationThreshold')}
                              className="input-field"
                            >
                              <option value="low">Low - Escalate complex queries quickly</option>
                              <option value="medium">Medium - Balanced approach</option>
                              <option value="high">High - AI handles most queries</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">When should AI escalate to you</p>
                          </div>
                        </div>

                        {/* AI Query Types */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            AI Can Handle These Query Types:
                          </label>
                          <div className="space-y-2">
                            {[
                              { value: 'application_status', label: 'Application Status Updates' },
                              { value: 'job_details', label: 'Job Details & Requirements' },
                              { value: 'company_info', label: 'Company Information' },
                              { value: 'next_steps', label: 'Next Steps in Process' },
                              { value: 'feedback_request', label: 'Feedback Requests' },
                            ].map((query) => (
                              <label key={query.value} className="flex items-center">
                                <input
                                  {...register('aiHandleQueries')}
                                  type="checkbox"
                                  value={query.value}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">{query.label}</span>
                              </label>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Select which types of candidate queries AI should handle automatically</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'pipeline' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pipeline & Advanced Settings</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Configure pipeline management settings and advanced features to streamline your recruitment workflow.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Follow-up Reminders</h4>
                      <p className="text-sm text-gray-600 mb-3">Set how often you want to be reminded about candidates requiring follow-up</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reminder Frequency
                        </label>
                        <select
                          {...register('reminderFrequency')}
                          className="input-field max-w-xs"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Advanced Features</h4>
                      <p className="text-sm text-gray-600 mb-4">Enable advanced functionality for power users</p>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <input
                            {...register('bulkOperationsEnabled')}
                            type="checkbox"
                            className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <label className="font-medium text-gray-900">Bulk Operations</label>
                            <p className="text-sm text-gray-600">Enable bulk candidate operations like mass stage changes and deletions</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                          <input
                            {...register('advancedFiltering')}
                            type="checkbox"
                            className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <label className="font-medium text-gray-900">Advanced Filtering</label>
                            <p className="text-sm text-gray-600">Enable complex search filters and saved filter presets</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
