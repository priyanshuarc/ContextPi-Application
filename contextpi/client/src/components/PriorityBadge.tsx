import React from 'react';
import type { TestPriority } from '../types/api';

interface PriorityBadgeProps {
  priority: TestPriority | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const normPriority = (priority || 'MEDIUM').toLowerCase();
  return (
    <span className={`priority-badge ${normPriority}`}>
      {priority}
    </span>
  );
};
