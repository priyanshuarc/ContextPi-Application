import React from 'react';
import {
  Database,
  Code2,
  FileCheck,
  CheckCircle2,
  Play,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import type {
  ProjectContext,
  TestCatalog,
  ExecutionSummary,
  GeneratedSpecsState
} from '../types/api';
import { MetricCard } from '../components/MetricCard';
import { PipelineStep } from '../components/PipelineStep';
import type { WorkflowStage } from '../components/PipelineStep';
import { EnvironmentBadge } from '../components/EnvironmentBadge';

interface DashboardProps {
  context: ProjectContext | null;
  catalogue: TestCatalog | null;
  latestRun: ExecutionSummary | null;
  generatedSpecs: GeneratedSpecsState | null;
  onNavigate: (tab: any) => void;
  onLoadMockContext: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  context,
  catalogue,
  latestRun,
  generatedSpecs,
  onNavigate,
  onLoadMockContext
}) => {
  const schemaCount = context?.schemas?.length || 0;
  const functionCount = (context?.functions || context?.customFunctions || []).length;
  const testCount = catalogue?.entries?.length || 0;

  let currentStage: WorkflowStage = 'CONTEXT';
  if (latestRun) currentStage = 'REPORT';
  else if (generatedSpecs) currentStage = 'EXECUTE';
  else if (catalogue?.status === 'APPROVED') currentStage = 'GENERATE';
  else if (catalogue) currentStage = 'CATALOGUE';
  else if (context) currentStage = 'ANALYZE';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Context-Driven Engine Dashboard</h2>
          <p>Deterministic Playwright API Test Generation Pipeline (PS10)</p>
        </div>
        <div className="flex items-center gap-2">
          {!context ? (
            <button className="btn btn-primary" onClick={onLoadMockContext}>
              <Database size={16} /> Load Target Application Context
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => onNavigate('generator')}>
              <Play size={16} /> Run Test Generator <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <PipelineStep currentStage={currentStage} />

      {/* 4-Column KPI Grid */}
      <div className="kpi-grid">
        <MetricCard
          label="Active Schemas"
          value={schemaCount}
          subtitle={context ? `${context.projectName} MongoDB` : 'No context loaded'}
          icon={Database}
          accentColor="var(--accent-cyan)"
        />
        <MetricCard
          label="Custom Functions"
          value={functionCount}
          subtitle="Registered in Mongo metadata"
          icon={Code2}
          accentColor="var(--status-emerald)"
        />
        <MetricCard
          label="Catalogue Tests"
          value={testCount}
          subtitle={catalogue ? `Status: ${catalogue.status}` : 'Pending generation'}
          icon={FileCheck}
          accentColor="var(--status-amber)"
        />
        <MetricCard
          label="Latest Pass Rate"
          value={latestRun && latestRun.totalExecuted > 0 ? `${latestRun.passRatePercentage.toFixed(1)}%` : 'NO TEST RUN YET'}
          subtitle={latestRun && latestRun.totalExecuted > 0 ? `${latestRun.passed}/${latestRun.totalExecuted} Passed` : 'No test run yet'}
          icon={CheckCircle2}
          accentColor={latestRun && latestRun.totalExecuted > 0 && latestRun.passRatePercentage >= 90 ? 'var(--status-emerald)' : 'var(--status-rose)'}
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Active Project Overview */}
        <div className="swiss-card flex flex-col justify-between">
          <div>
            <div className="swiss-card-header">
              <span className="swiss-card-title flex items-center gap-2">
                <Database size={16} className="text-cyan" /> Target Application Context
              </span>
              <EnvironmentBadge
                isLiveMongo={!context?.useMock && !context?.isAdapterMode}
                isAdapterMode={context?.useMock || context?.isAdapterMode}
                projectName={context?.projectName || 'NexaSupply'}
              />
            </div>

            {context ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between py-1 border-b border-subtle">
                  <span className="text-muted">Target Project</span>
                  <span className="font-mono font-bold text-primary">{context.projectName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-subtle">
                  <span className="text-muted">Discovered Schemas</span>
                  <span className="font-mono">{context.schemas.map((s) => s.schemaName).join(', ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-subtle">
                  <span className="text-muted">Registered Custom Functions</span>
                  <span className="font-mono">
                    {(context.functions || context.customFunctions || [])
                      .map((f) => f.name || f.functionName)
                      .join(', ') || 'None'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Business Requirement context</span>
                  <span className="font-mono text-cyan truncate max-w-xs">
                    {context.requirement || 'PS10 Generic Standard Context'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted py-4">
                No target application context is currently loaded. Click "Load Target Application Context" to begin.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-subtle flex justify-between items-center">
            <span className="text-xs text-muted">Explore MongoDB Schemas & Functions</span>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('explorer')}>
              Inspect Context <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Right: Latest Test Run Execution */}
        <div className="swiss-card flex flex-col justify-between">
          <div>
            <div className="swiss-card-header">
              <span className="swiss-card-title flex items-center gap-2">
                <Activity size={16} className="text-emerald" /> Latest Authentic Execution
              </span>
              {latestRun && (
                <span className="font-mono text-xs text-emerald">
                  {new Date(latestRun.executedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            {latestRun ? (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between py-1 border-b border-subtle">
                  <span className="text-muted">Target API Endpoint</span>
                  <span className="font-mono text-cyan truncate max-w-xs">{latestRun.targetApiBaseUrl}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-subtle">
                  <span className="text-muted">Total Executed</span>
                  <span className="font-mono font-bold">{latestRun.totalExecuted} Playwright API Specs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-subtle">
                  <span className="text-muted">Execution Metrics</span>
                  <span className="font-mono text-emerald font-bold">
                    {latestRun.passed} PASS <span className="text-rose font-normal">/ {latestRun.failed} FAIL</span>
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Total Execution Time</span>
                  <span className="font-mono">{(latestRun.totalDurationMs / 1000).toFixed(2)} seconds</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted py-4">
                No authentic Playwright executions have been recorded yet. Generate specs and execute tests in the Test Runs console.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-subtle flex justify-between items-center">
            <span className="text-xs text-muted">View authentic execution reports</span>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('reports')}>
              Open Reports <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* PS10 Technical Traceability Footer Card */}
      <div className="swiss-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-cyan" />
          <div>
            <h4 className="font-bold text-xs">PS10 Technical Compliance Guarantee</h4>
            <p className="text-xs text-muted">
              Zero LLM code generation • Dynamic MongoDB schema loading • 10-point traceability matrix • Genuine Playwright HTTP execution
            </p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('settings')}>
          Governance Settings
        </button>
      </div>
    </div>
  );
};
