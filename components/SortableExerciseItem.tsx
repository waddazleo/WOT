import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ExerciseCard from './ExerciseCard';
import { Exercise, LogEntry } from '../types';

interface Props {
  exercise: Exercise;
  lastLog?: LogEntry;
  onSave: (log: LogEntry) => void;
}

export const SortableExerciseItem: React.FC<Props> = ({ exercise, lastLog, onSave }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // When dragging, hide this item in the list so only the Overlay is visible.
    // We keep it in the DOM to maintain the space layout.
    opacity: isDragging ? 0 : 1,
    height: isDragging ? 'auto' : undefined, // Keep height to preserve layout flow
    position: 'relative',
    // touchAction: 'none' removed to allow scrolling
  };

  return (
    <div ref={setNodeRef} style={style}> 
      <ExerciseCard
        exercise={exercise}
        lastLog={lastLog}
        onSave={onSave}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={false} // The SortableItem is NOT the one visually floating (that's the Overlay)
      />
    </div>
  );
};