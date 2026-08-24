import React from 'react';
import { RefreshCw, Database, RotateCcw } from 'lucide-react';
import { EnvironmentBadge } from './EnvironmentBadge';

interface HeaderProps {
  projectName?: string | null;
  isLiveMongo?: boolean;
  isAdapterMode?: boolean;
  catalogueStatus?: string;
  selectedCount?: number;
  totalCount?: number;
  passRatePercentage?: number;
  onRefresh?: () => void;
  onRequestReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectName,
  isLiveMongo = false,
  isAdapterMode = true,
  catalogueStatus = 'DRAFT',
  selectedCount = 0,
  totalCount = 0,
  passRatePercentage,
  onRefresh,
  onRequestReset
}) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="flex items-center gap-2">
          <Database size={16} className={projectName ? 'text-cyan' : 'text-muted'} />
          <span className="font-bold text-sm font-mono text-primary">
            {projectName || 'No Project Connected'}
          </span>
        </div>

        <EnvironmentBadge
          isLiveMongo={isLiveMongo}
          isAdapterMode={isAdapterMode}
          projectName={projectName}
        />
      </div>

      <div className="header-right">
        {totalCount > 0 && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <span
              className={`mode-badge ${
                catalogueStatus === 'APPROVED' ? 'live' : 'adapter'
              }`}
            >
              Catalogue: {catalogueStatus}
            </span>
            <span className="text-secondary">
              Selected Specs: <strong className="text-primary">{selectedCount}</strong> / {totalCount}
            </span>
            {passRatePercentage !== undefined && (
              <span className="mode-badge live">
                Pass Rate: {passRatePercentage.toFixed(1)}%
              </span>
            )}
          </div>
        )}

        {onRequestReset && (
          <button
            className="btn btn-secondary btn-sm text-xs text-amber"
            onClick={onRequestReset}
            title="Clear current working session state"
          >
            <RotateCcw size={12} /> Fresh Start
          </button>
        )}

        {onRefresh && (
          <button className="icon-btn" onClick={onRefresh} title="Refresh Context & System State">
            <RefreshCw size={14} />
          </button>
        )}
      </div>
    </header>
  );
};
