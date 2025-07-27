import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type Candidate, type Stage } from '../types';

interface StageChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  candidate: Candidate | null;
  fromStage: Stage | null;
  toStage: Stage | null;
}

interface ReasonForm {
  reason: string;
}

export function StageChangeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  candidate,
  fromStage,
  toStage,
}: StageChangeConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReasonForm>();

  if (!isOpen || !candidate || !fromStage || !toStage) return null;

  const onSubmit = async (data: ReasonForm) => {
    setIsSubmitting(true);
    try {
      await onConfirm(data.reason);
      reset();
      onClose();
    } catch (error) {
      console.error('Error confirming stage change:', error);
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Confirm Stage Change</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">{candidate.name}</p>
              <p className="text-gray-600">{candidate.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {fromStage.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">Current Stage</p>
            </div>
            <div className="text-gray-400">→</div>
            <div className="text-center">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {toStage.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">New Stage</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center mb-4">
            Please provide a reason for moving this candidate to a different stage.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for stage change <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : ''
              }`}
              placeholder="e.g., Candidate performed well in technical interview, Moving to next round based on assessment results..."
              {...register('reason', {
                required: 'Please provide a reason for the stage change',
                minLength: {
                  value: 10,
                  message: 'Reason must be at least 10 characters long',
                },
              })}
            />
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Moving...' : 'Confirm Move'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
