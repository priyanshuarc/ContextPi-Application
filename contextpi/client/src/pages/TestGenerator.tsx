import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, FileCheck, ArrowRight, ShieldAlert } from 'lucide-react';
import type { ProjectContext, TestCatalog } from '../types/api';
import { EmptyState } from '../components/EmptyState';
import { CategoryBadge } from '../components/CategoryBadge';

interface TestGeneratorProps {
  context: ProjectContext | null;
  catalogue: TestCatalog | null;
  onBuildCatalogue: (requirement?: string) => Promise<void>;
  onNavigateToCatalogue: () => void;
  onNavigateToProjects: () => void;
}

export const TestGenerator: React.FC<TestGeneratorProps> = ({
  context,
  catalogue,
  onBuildCatalogue,
  onNavigateToCatalogue,
  onNavigateToProjects
}) => {
  const [requirement, setRequirement] = useState(
    context?.requirement || 'PS10 Standard Business Requirement Rules for API Validation'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!context) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>Deterministic Test Intent Generator</h2>
            <p>Runs Contextπ rule engines over MongoDB metadata and requirements</p>
          </div>
        </div>
        <EmptyState
          title="NO CONTEXT LOADED FOR GENERATION"
          description="Load target application context to analyze schemas, field constraints, relationships, custom functions, and business rules."
          actionText="Connect Target Project"
          onAction={onNavigateToProjects}
        />
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await onBuildCatalogue(requirement);
    } catch (err: any) {
      setError(err.message || 'Failed to execute rule engine pipeline.');
    } finally {
      setIsGenerating(false);
    }
  };

  const categoryCounts: Record<string, number> = {};
  if (catalogue) {
    for (const entry of catalogue.entries) {
      categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Deterministic Test Intent Generator</h2>
          <p>Evaluating CRUD, Field Validation, Relationship, Custom Function, and Business Requirement Rule Engines</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Workflow Input Form */}
      <div className="swiss-card flex flex-col gap-4">
        <div className="swiss-card-header">
          <span className="swiss-card-title flex items-center gap-2">
            <Cpu size={16} className="text-cyan" /> Target Application Metadata Summary
          </span>
          <span className="font-mono text-xs text-muted">Project: {context.projectName}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="bg-surface-elevated p-3 rounded border border-subtle">
            <span className="text-muted block mb-1">Active Schemas</span>
            <span className="font-mono font-bold text-base text-primary">
              {context.schemas.length} Schemas
            </span>
          </div>
          <div className="bg-surface-elevated p-3 rounded border border-subtle">
            <span className="text-muted block mb-1">Custom Functions</span>
            <span className="font-mono font-bold text-base text-cyan">
              {(context.functions || context.customFunctions || []).length} Functions
            </span>
          </div>
          <div className="bg-surface-elevated p-3 rounded border border-subtle">
            <span className="text-muted block mb-1">Rule Engines Enabled</span>
            <span className="font-mono font-bold text-base text-emerald">5 Engines Active</span>
          </div>
        </div>

        <div className="form-group mt-2">
          <label className="form-label">
            Business Requirement Input Rules (Optional Specification)
          </label>
          <textarea
            className="form-textarea font-mono text-xs"
            rows={4}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Enter additional business rule constraints..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-subtle">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              'Evaluating Rule Engines...'
            ) : (
              <>
                <Play size={16} /> Start Deterministic Test Generation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Result Summary Card */}
      {catalogue && (
        <div className="swiss-card flex flex-col gap-4" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div className="swiss-card-header">
            <span className="swiss-card-title text-emerald flex items-center gap-2">
              <CheckCircle2 size={18} /> DETERMINISTIC INTENTS GENERATED ({catalogue.entries.length} TESTS IDENTIFIED)
            </span>
            <span className="mode-badge adapter font-mono text-xs">Catalogue Status: {catalogue.status}</span>
          </div>

          <div className="grid grid-cols-6 gap-3 text-center">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <div key={cat} className="bg-surface-elevated p-3 rounded border border-subtle flex flex-col gap-1">
                <CategoryBadge category={cat as any} />
                <span className="font-mono font-bold text-lg text-primary mt-1">{count}</span>
                <span className="text-muted text-xs">Test Cases</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-subtle">
            <button className="btn btn-emerald btn-lg" onClick={onNavigateToCatalogue}>
              <FileCheck size={16} /> View & Approve Test Catalogue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
