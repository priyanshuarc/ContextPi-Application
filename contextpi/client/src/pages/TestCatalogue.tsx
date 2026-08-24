import React, { useState } from 'react';
import {
  FileCheck,
  CheckSquare,
  Square,
  Lock,
  ArrowRight,
  Info,
  FileText
} from 'lucide-react';
import type { TestCatalog, CatalogEntry } from '../types/api';
import { EmptyState } from '../components/EmptyState';
import { CategoryBadge } from '../components/CategoryBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TraceabilityModal } from '../components/TraceabilityModal';
import { TestExplanationModal } from '../components/TestExplanationModal';

interface TestCatalogueProps {
  catalogue: TestCatalog | null;
  onToggleSelect: (testId: string, selected: boolean) => Promise<void>;
  onSelectAll: () => Promise<void>;
  onDeselectAll: () => Promise<void>;
  onApprove: () => Promise<void>;
  onNavigateToGenerator: () => void;
  onNavigateToGeneratedSpecs: () => void;
}

export const TestCatalogue: React.FC<TestCatalogueProps> = ({
  catalogue,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onApprove,
  onNavigateToGenerator,
  onNavigateToGeneratedSpecs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedTraceEntry, setSelectedTraceEntry] = useState<CatalogEntry | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedExplanation, setSelectedExplanation] = useState<CatalogEntry | null>(null);

  if (!catalogue || !catalogue.entries.length) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>10-Point Traceable Test Catalogue</h2>
            <p>PS10 Traceable API Test Specification Matrix</p>
          </div>
        </div>
        <EmptyState
          title="NO TEST CATALOGUE GENERATED YET"
          description="Run the deterministic rule engines in the Test Generator tab to convert application context into a 10-point traceable test catalogue."
          actionText="Go to Test Generator"
          onAction={onNavigateToGenerator}
        />
      </div>
    );
  }

  const filteredEntries = catalogue.entries.filter((entry) => {
    const matchesSearch =
      entry.testId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
    const matchesPriority = selectedPriority === 'ALL' || entry.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const selectedCount = catalogue.entries.filter((e) => e.selected !== false).length;
  const criticalCount = catalogue.entries.filter((e) => e.priority === 'CRITICAL').length;
  const highCount = catalogue.entries.filter((e) => e.priority === 'HIGH').length;

  const handleApproveClick = async () => {
    setIsApproving(true);
    setError(null);
    try {
      await onApprove();
    } catch (err: any) {
      setError(err.message || 'Failed to approve catalogue');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>10-Point Traceable Test Catalogue</h2>
          <p>PS10 Rule-driven test specification catalogue with strict 5-step approval gate</p>
        </div>
        <div className="flex items-center gap-2">
          {catalogue.status === 'APPROVED' ? (
            <button className="btn btn-emerald" onClick={onNavigateToGeneratedSpecs}>
              <FileCheck size={16} /> View Generated Specs (.spec.ts) <ArrowRight size={14} />
            </button>
          ) : (
            <button
              className="btn btn-emerald"
              onClick={handleApproveClick}
              disabled={isApproving || selectedCount === 0}
            >
              <Lock size={16} /> {isApproving ? 'Executing Gate...' : 'Approve Test Suite & Lock Status'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Info size={16} />
            <span>{error}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Summary & Control Bar */}
      <div className="swiss-card flex flex-col gap-3">
        <div className="flex justify-between items-center pb-2 border-b border-subtle">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-secondary">
              Total Specs: <strong className="text-primary">{catalogue.entries.length}</strong>
            </span>
            <span className="text-secondary">
              Selected: <strong className="text-cyan">{selectedCount}</strong>
            </span>
            <span className="text-secondary">
              Critical: <strong className="text-rose">{criticalCount}</strong>
            </span>
            <span className="text-secondary">
              High: <strong className="text-amber">{highCount}</strong>
            </span>
            <span
              className={`mode-badge ${
                catalogue.status === 'APPROVED' ? 'live' : 'adapter'
              }`}
            >
              Status: {catalogue.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={onSelectAll}>
              <CheckSquare size={14} /> Select All
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onDeselectAll}>
              <Square size={14} /> Deselect All
            </button>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex items-center gap-3">
          <div className="form-group mb-0 flex-1">
            <input
              type="text"
              className="form-input text-xs"
              placeholder="Search by Test ID, entity, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="form-group mb-0" style={{ width: '160px' }}>
            <select
              className="select-input text-xs"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="CRUD">CRUD</option>
              <option value="FIELD_VALIDATION">FIELD_VALIDATION</option>
              <option value="RELATIONSHIP">RELATIONSHIP</option>
              <option value="CUSTOM_FUNCTION">CUSTOM_FUNCTION</option>
              <option value="BUSINESS_RULE">BUSINESS_RULE</option>
              <option value="REGISTRY">REGISTRY</option>
            </select>
          </div>

          <div className="form-group mb-0" style={{ width: '140px' }}>
            <select
              className="select-input text-xs"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* High Density Catalogue Table */}
      <div className="swiss-card p-0">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Select</th>
                <th style={{ width: '160px' }}>Test ID</th>
                <th style={{ width: '140px' }}>Category</th>
                <th style={{ width: '110px' }}>Target Entity</th>
                <th>Description</th>
                <th style={{ width: '100px' }}>Priority</th>
                <th style={{ width: '100px' }}>Dependencies</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => {
                const isSelected = entry.selected !== false;
                return (
                  <tr key={entry.testId} className={isSelected ? 'row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onToggleSelect(entry.testId, e.target.checked)}
                      />
                    </td>
                    <td 
                      className="font-mono font-bold text-cyan text-xs cursor-pointer hover:underline"
                      onClick={() => setSelectedExplanation(entry)}
                      title="Click to view test explanation"
                    >
                      {entry.testId}
                    </td>
                    <td>
                      <CategoryBadge category={entry.category} />
                    </td>
                    <td className="font-mono text-xs text-primary">{entry.targetEntity}</td>
                    <td className="text-xs text-secondary">{entry.description}</td>
                    <td>
                      <PriorityBadge priority={entry.priority} />
                    </td>
                    <td className="font-mono text-xs text-muted">
                      {entry.dependencies?.length || 0} dep
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="btn btn-secondary btn-sm text-cyan font-mono"
                          onClick={() => setSelectedExplanation(entry)}
                          title="Explain Test Specification"
                        >
                          <FileText size={12} />
                          <span>Explain</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm text-secondary font-mono"
                          onClick={() => setSelectedTraceEntry(entry)}
                          title="Inspect 10-point traceability analysis"
                        >
                          <Info size={12} />
                          <span>Trace</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Traceability Drawer / Modal */}
      <TraceabilityModal
        entry={selectedTraceEntry}
        onClose={() => setSelectedTraceEntry(null)}
      />

      {selectedExplanation && (
        <TestExplanationModal
          isOpen={Boolean(selectedExplanation)}
          onClose={() => setSelectedExplanation(null)}
          entry={selectedExplanation}
        />
      )}
    </div>
  );
};
