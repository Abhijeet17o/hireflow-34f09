import { useState } from 'react';
import { X, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type Stage } from '../types';

interface ManualCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (candidate: {
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    stage: string;
  }) => void;
  stages: Stage[];
}

interface CandidateForm {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  stage: string;
}

export function ManualCandidateModal({ isOpen, onClose, onAdd, stages }: ManualCandidateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CandidateForm>({
    defaultValues: {
      stage: stages[0]?.name || 'Sourced'
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CandidateForm) => {
    setIsSubmitting(true);
    try {
      await onAdd(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add New Candidate</h2>
              <p className="text-sm text-gray-600">Manually add a candidate to this campaign</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              {...register('name', { 
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              type="text"
              id="name"
              className="input-field"
              placeholder="Enter candidate's full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              type="email"
              id="email"
              className="input-field"
              placeholder="candidate@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="input-field"
              placeholder="+91 9876543210"
            />
          </div>

          {/* Resume URL Field */}
          <div>
            <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Resume URL
            </label>
            <input
              {...register('resumeUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Please enter a valid URL (starting with http:// or https://)'
                }
              })}
              type="url"
              id="resumeUrl"
              className="input-field"
              placeholder="https://example.com/resume.pdf"
            />
            {errors.resumeUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.resumeUrl.message}</p>
            )}
          </div>

          {/* Stage Field */}
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
              Initial Stage *
            </label>
            <select
              {...register('stage', { required: 'Stage is required' })}
              id="stage"
              className="input-field"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.name}>
                  {stage.name}
                </option>
              ))}
            </select>
            {errors.stage && (
              <p className="mt-1 text-sm text-red-600">{errors.stage.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </span>
              ) : (
                'Add Candidate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
