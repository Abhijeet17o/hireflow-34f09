import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { type CreateCampaignForm } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { azureFunctionsService, AzureFunctionsService } from '../services/azureFunctions';

export function CreateCampaign() {
  const navigate = useNavigate();
  const { saveCampaignData } = useAuth();
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [processingKnowledge, setProcessingKnowledge] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateCampaignForm>();

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      const newSkills = [...skills, skillInput.trim()];
      setSkills(newSkills);
      setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setValue('skills', newSkills);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setJdFile(file);
      setValue('jdFile', file);
    }
  };

  const onSubmit = async (data: CreateCampaignForm) => {
    try {
      // Create campaign with default stages
      const defaultStages = [
        { id: 'sourced', name: 'Sourced', instructions: 'Initial candidate sourcing', order: 1, color: 'blue' },
        { id: 'screening', name: 'Screening', instructions: 'Phone/video screening call', order: 2, color: 'yellow' },
        { id: 'interview', name: 'Interview', instructions: 'Technical interview', order: 3, color: 'purple' },
        { id: 'hired', name: 'Hired', instructions: 'Successfully hired', order: 4, color: 'green' },
        { id: 'rejected', name: 'Rejected', instructions: 'Not selected', order: 5, color: 'red' },
      ];

      const campaignData = {
        ...data,
        skills,
        stages: defaultStages,
      };

      // Save campaign to database
      const savedCampaign = await saveCampaignData(campaignData);
      
      if (!savedCampaign) {
        console.error('❌ Failed to save campaign to database');
        alert('Error creating campaign. Please try again.');
        return;
      }
      
      console.log('💾 Campaign saved to database:', savedCampaign);
      
      // Process knowledge for RAG system
      try {
        setProcessingKnowledge(true);
        console.log('🤖 Processing campaign knowledge for AI system...');
        const knowledgeData = AzureFunctionsService.extractKnowledgeFromCampaign(savedCampaign);
        const result = await azureFunctionsService.processKnowledge(knowledgeData);
        console.log('✅ Knowledge processing successful:', result);
      } catch (knowledgeError) {
        console.warn('⚠️ Knowledge processing failed (campaign still created):', knowledgeError);
        // Don't fail the entire campaign creation if knowledge processing fails
      } finally {
        setProcessingKnowledge(false);
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Create New Job Campaign</h1>
          <p className="text-primary-100">
            Set up a new recruitment campaign to start sourcing top talent
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    AI-Powered Recruitment Assistant
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This information will be used by our AI to automatically answer candidate questions and provide personalized responses. 
                    When you create this campaign, we'll automatically process this data for the AI knowledge base.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                {...register('title', { required: 'Job title is required' })}
                type="text"
                id="title"
                className="input-field"
                placeholder="e.g., Senior React Developer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                {...register('department', { required: 'Department is required' })}
                type="text"
                id="department"
                className="input-field"
                placeholder="e.g., Engineering, Product, Design, Marketing, Sales..."
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                {...register('location', { required: 'Location is required' })}
                type="text"
                id="location"
                className="input-field"
                placeholder="e.g., Bangalore, Remote"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="openings" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Openings *
              </label>
              <input
                {...register('openings', { 
                  required: 'Number of openings is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  valueAsNumber: true
                })}
                type="number"
                id="openings"
                min="1"
                className="input-field"
                placeholder="1"
              />
              {errors.openings && (
                <p className="mt-1 text-sm text-red-600">{errors.openings.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <div className="mb-2 text-xs text-gray-600">
              💡 <span className="font-medium">AI Tip:</span> Include detailed responsibilities, requirements, company culture, and benefits. 
              This helps our AI provide accurate responses to candidate questions.
            </div>
            <textarea
              {...register('description', { required: 'Job description is required' })}
              id="description"
              rows={6}
              className="input-field resize-none"
              placeholder="Describe the role, responsibilities, requirements, company culture, benefits, and any other relevant details that candidates might ask about..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h2>
          <p className="text-sm text-gray-600 mb-4">
            Add technical and soft skills required for this role. Our AI will use these to better match candidates and answer skill-related questions.
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input-field flex-1"
                placeholder="Add a required skill (e.g., React, Node.js)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Job Description File</h2>
          
          <div className="border-2 border-dashed border-primary-300 rounded-xl p-8 text-center bg-primary-50 hover:bg-primary-100 transition-colors">
            <input
              type="file"
              id="jd-file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="jd-file" className="cursor-pointer">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Upload detailed job description
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  PDF, DOC, or DOCX up to 10MB
                </p>
              </div>
            </label>
            
            {jdFile && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {jdFile.name} uploaded successfully
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || processingKnowledge}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingKnowledge ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up AI Assistant...
              </div>
            ) : isSubmitting ? (
              'Creating...'
            ) : (
              'Create Campaign'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
