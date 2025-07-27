import { useDraggable } from '@dnd-kit/core';
import { Mail, Phone, ExternalLink, MessageSquare } from 'lucide-react';
import { type Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onClick: (candidate: Candidate) => void;
  onMessageClick?: (candidate: Candidate) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (candidateId: string, isSelected: boolean) => void;
  showCheckbox?: boolean;
}

export function CandidateCard({ 
  candidate, 
  onClick, 
  onMessageClick,
  isDragging = false, 
  isSelected = false, 
  onSelect, 
  showCheckbox = false 
}: CandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingFromHook,
  } = useDraggable({
    id: candidate.id,
    disabled: showCheckbox, // Disable dragging when in selection mode
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const isBeingDragged = isDragging || isDraggingFromHook;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(_e) => {
        if (!showCheckbox && !isBeingDragged) {
          onClick(candidate);
        }
      }}
      className={`
        bg-white rounded-md border p-3 cursor-pointer transition-all relative
        hover:shadow-md hover:border-gray-300
        ${isBeingDragged ? 'opacity-50 shadow-lg rotate-3' : ''}
        ${isSelected ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200'}
      `}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(candidate.id, e.target.checked);
            }}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
        </div>
      )}

      {/* Compact Header */}
      <div className={`flex items-center justify-between mb-2 ${showCheckbox ? 'ml-6' : ''}`}>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate">{candidate.name}</h4>
          <p className="text-xs text-gray-600 truncate">{candidate.email}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onMessageClick) {
              onMessageClick(candidate);
            }
          }}
          className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors flex-shrink-0 rounded-md border border-primary-200"
          title="Send email to candidate"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>

      {/* Compact Info Row */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {candidate.phone && (
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span className="truncate max-w-20">{candidate.phone}</span>
            </div>
          )}
          
          {candidate.communicationLog.length > 0 && (
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span>{candidate.communicationLog.length}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {candidate.resumeUrl && (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          
          {candidate.communicationLog.some(msg => msg.isAiGenerated) && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="AI Auto-Reply Active"></div>
          )}
        </div>
      </div>

      {/* Notes - Only show if present and compact */}
      {candidate.notes && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-primary-200 overflow-hidden">
          <div className="line-clamp-2">
            {candidate.notes}
          </div>
        </div>
      )}
    </div>
  );
}
