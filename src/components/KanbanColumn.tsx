import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { CandidateCard } from './CandidateCard';
import { type Stage, type Candidate } from '../types';

interface KanbanColumnProps {
  stage: Stage;
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onMessageClick?: (candidate: Candidate) => void;
  showCheckboxes?: boolean;
  selectedCandidates?: Set<string>;
  onCandidateSelect?: (candidateId: string, isSelected: boolean) => void;
  onSelectAll?: (candidates: Candidate[], isSelected: boolean) => void;
}

const stageColors = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  red: 'bg-red-100 text-red-800 border-red-200',
} as const;

export function KanbanColumn({ 
  stage, 
  candidates, 
  onCandidateClick, 
  onMessageClick,
  showCheckboxes = false, 
  selectedCandidates = new Set(), 
  onCandidateSelect, 
  onSelectAll 
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
  });

  const colorClass = stageColors[stage.color as keyof typeof stageColors] || stageColors.blue;

  // Calculate selection state for this column
  const allSelected = candidates.length > 0 && candidates.every(c => selectedCandidates.has(c.id));
  const someSelected = candidates.some(c => selectedCandidates.has(c.id));

  return (
    <div className="flex flex-col w-72 bg-gray-50 rounded-lg">{/* Reduced from w-80 to w-72 */}
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showCheckboxes && candidates.length > 0 && (
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected && !allSelected;
                }}
                onChange={(e) => onSelectAll?.(candidates, e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-3"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{stage.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{candidates.length} candidates</p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
            {candidates.length}
          </span>
        </div>
        {stage.instructions && (
          <p className="text-xs text-gray-500 mt-2">{stage.instructions}</p>
        )}
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`relative flex-1 p-3 min-h-80 transition-colors ${
          isOver ? 'bg-primary-50 border-2 border-dashed border-primary-300' : ''
        }`}
      >
        <div className="space-y-2">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onCandidateClick(candidate)}
              onMessageClick={onMessageClick}
              showCheckbox={showCheckboxes}
              isSelected={selectedCandidates.has(candidate.id)}
              onSelect={onCandidateSelect}
            />
          ))}
        </div>

        {candidates.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Plus className="h-8 w-8 mb-2" />
            <p className="text-sm">Drop candidates here</p>
          </div>
        )}

        {isOver && (
          <div className="absolute inset-0 bg-primary-100 bg-opacity-75 border-2 border-dashed border-primary-400 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Plus className="h-12 w-12 mx-auto text-primary-600 mb-2" />
              <p className="text-lg font-medium text-primary-700">Drop candidate to {stage.name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
