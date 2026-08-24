import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = FileX
}) => {
  return (
    <div className="swiss-card flex flex-col items-center justify-center p-8 text-center gap-3">
      <div className="brand-icon-box" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)' }}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-base font-bold mb-1">{title}</h3>
        <p className="text-xs text-muted max-w-md">{description}</p>
      </div>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm mt-2" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
