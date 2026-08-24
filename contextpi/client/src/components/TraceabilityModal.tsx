import React from 'react';
import { X, ShieldCheck, Database, Layers, GitCommit, FileText, CheckCircle2, Server } from 'lucide-react';
import type { CatalogEntry } from '../types/api';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';

interface TraceabilityModalProps {
  entry: CatalogEntry | null;
  onClose: () => void;
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="explain-modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="explain-header">
          <div className="flex items-center gap-3">
            <div className="brand-icon-box">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-cyan text-base">{entry.testId}</h3>
                <CategoryBadge category={entry.category as any} />
                <PriorityBadge priority={entry.priority as any} />
              </div>
              <p className="text-xs text-secondary mt-1">10-Point PS10 Traceability Matrix Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" title="Close Traceability">
            <X size={16} />
          </button>
        </div>

        {/* Content Body with Vanilla CSS Cards */}
        <div className="modal-body flex-1 flex flex-col gap-4">
          
          {/* Card 1: Functional Overview Banner */}
          <div className="explain-card">
            <div className="explain-card-title text-indigo">
              <FileText size={14} />
              <span>Specification Description</span>
            </div>
            <p className="explain-card-body font-semibold">{entry.description}</p>
          </div>

          {/* Card 2: 10-Point Matrix Grid Card */}
          <div className="swiss-card flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Discovered Metadata & Source Provenance</span>
              <span className="mode-badge live font-mono font-bold">PS10 COMPLIANT</span>
            </div>

            <div className="explain-grid-3 text-xs font-mono">
              <div className="bg-surface-elevated p-2.5 rounded border border-subtle flex flex-col gap-1">
                <span className="text-muted flex items-center gap-1">
                  <Database size={12} className="text-cyan" /> Target Entity
                </span>
                <span className="font-bold text-cyan truncate">{entry.targetEntity}</span>
              </div>

              <div className="bg-surface-elevated p-2.5 rounded border border-subtle flex flex-col gap-1">
                <span className="text-muted flex items-center gap-1">
                  <Layers size={12} className="text-indigo" /> Source Origin
                </span>
                <span className="font-bold text-primary truncate">{entry.source}</span>
              </div>

              <div className="bg-surface-elevated p-2.5 rounded border border-subtle flex flex-col gap-1">
                <span className="text-muted flex items-center gap-1">
                  <GitCommit size={12} className="text-amber" /> Source Reference
                </span>
                <span className="font-bold text-primary truncate">{entry.sourceRef}</span>
              </div>
            </div>

            {/* Reasoning Card Section */}
            <div className="bg-surface-elevated p-3 rounded border border-subtle text-xs flex flex-col gap-1">
              <span className="text-muted font-bold uppercase tracking-wider text-[11px]">Deterministic Rule Engine Rationale</span>
              <p className="text-secondary leading-relaxed font-sans">{entry.reasoning}</p>
            </div>
          </div>

          {/* Card 3: Route & Assertion Specification Card */}
          <div className="explain-grid-2 text-xs font-mono">
            {/* Route Card */}
            <div className="swiss-card flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <Server size={14} className="text-emerald" /> Endpoint Route
                </span>
                <span className="mode-badge live font-bold">
                  {entry.httpMethod}
                </span>
              </div>
              <code className="code-block text-xs text-cyan block truncate">
                {entry.customUrlPath || entry.targetRouteKey}
              </code>
            </div>

            {/* Expected Result Card */}
            <div className="swiss-card flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted font-bold uppercase text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-cyan" /> Expected Response
                </span>
                <span className="mode-badge live font-bold">
                  HTTP {entry.expectedResult?.statusCode || 200}
                </span>
              </div>
              <pre className="code-block text-xs text-emerald max-h-24 overflow-y-auto">
                {JSON.stringify(entry.expectedResult, null, 2)}
              </pre>
            </div>
          </div>

          {/* Audit Bar */}
          <div className="alert alert-info flex justify-between items-center text-xs font-mono">
            <span className="text-muted">Dependencies:</span>
            <span className="text-cyan font-semibold">
              {entry.dependencies && entry.dependencies.length > 0 ? entry.dependencies.join(', ') : 'None (Root Node)'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-header border-t border-subtle justify-end">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Traceability
          </button>
        </div>

      </div>
    </div>
  );
};
