import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { type Candidate } from '../types';

interface BulkDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  candidates: Candidate[];
}

export function BulkDeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  candidates 
}: BulkDeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() !== 'confirm') return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmText('');
      onClose();
    } catch (error) {
      console.error('Error deleting candidates:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Delete Candidates</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-red-800 mb-1">
                  This action cannot be undone
                </h3>
                <p className="text-sm text-red-700">
                  You are about to permanently delete <strong>{candidates.length}</strong> candidate{candidates.length > 1 ? 's' : ''} 
                  from this campaign. This will remove all their data, communication history, and progress.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Candidates to be deleted:</h4>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{candidate.name}</div>
                    <div className="text-xs text-gray-500">{candidate.email}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {candidate.currentStage}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-input" className="block text-sm font-medium text-gray-700">
              Type <span className="font-mono font-bold">confirm</span> to proceed:
            </label>
            <input
              id="confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'confirm' here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={handleClose} 
            className="btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText.toLowerCase() !== 'confirm' || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium transition-colors"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {candidates.length} Candidate{candidates.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
