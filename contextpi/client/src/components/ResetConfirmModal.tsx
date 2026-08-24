import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
  isResetting?: boolean;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  isResetting
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottomColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div className="flex items-center gap-2 text-amber font-mono font-bold">
            <AlertTriangle size={18} />
            <span>START FRESH?</span>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={isResetting}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body flex flex-col gap-4">
          <p className="text-sm text-secondary leading-relaxed">
            This will clear the current working session including loaded project context, test catalogue, generated spec files, Playwright execution metrics, and report references.
          </p>

          <div className="alert alert-warning">
            <span>After reset, Contextπ will return to a clean initial state (NOT CONNECTED).</span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-subtle">
            <button className="btn btn-secondary" onClick={onClose} disabled={isResetting}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={onConfirmReset}
              disabled={isResetting}
            >
              <RotateCcw size={14} /> {isResetting ? 'Clearing Session...' : 'Start Fresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
