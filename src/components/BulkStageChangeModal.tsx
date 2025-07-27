import { useState } from 'react';
import { X } from 'lucide-react';

interface BulkStageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  candidateCount: number;
  fromStages: string[];
  toStage: string;
}

export function BulkStageChangeModal({
  isOpen,
  onClose,
  onConfirm,
  candidateCount,
  fromStages,
  toStage,
}: BulkStageChangeModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Bulk Stage Change
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-amber-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-amber-800">
                      Moving {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
                    </h4>
                    <div className="text-sm text-amber-700 mt-1">
                      <p>
                        From: <span className="font-medium">{fromStages.join(', ')}</span>
                      </p>
                      <p>
                        To: <span className="font-medium">{toStage}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for stage change <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Please provide a reason for moving these candidates..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              <div className="mt-1 text-xs text-gray-500">
                This reason will be logged in each candidate's communication history.
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Moving...' : `Move ${candidateCount} Candidate${candidateCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
