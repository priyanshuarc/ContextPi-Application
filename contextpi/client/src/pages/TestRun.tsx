import React, { useState } from 'react';
import { Play, Globe, CheckCircle2, AlertTriangle, ArrowRight, Wrench, ShieldCheck, FileText } from 'lucide-react';
import type { ExecutionSummary, TestExecutionResult, GeneratedSpecsState } from '../types/api';
import { EmptyState } from '../components/EmptyState';
import { CategoryBadge } from '../components/CategoryBadge';
import { FailureTraceModal } from '../components/FailureTraceModal';
import { TestExplanationModal } from '../components/TestExplanationModal';

interface TestRunProps {
  generatedSpecs: GeneratedSpecsState | null;
  latestRun: ExecutionSummary | null;
  onExecuteRun: (targetApiBaseUrl: string) => Promise<void>;
  onNavigateToSpecs: () => void;
  onNavigateToReports: () => void;
}

export const TestRun: React.FC<TestRunProps> = ({
  generatedSpecs,
  latestRun,
  onExecuteRun,
  onNavigateToSpecs,
  onNavigateToReports
}) => {
  const [targetApiBaseUrl, setTargetApiBaseUrl] = useState('http://localhost:3000');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFailure, setSelectedFailure] = useState<TestExecutionResult | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);

  if (!generatedSpecs || !generatedSpecs.generatedFiles.length) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>Playwright HTTP API Execution Console</h2>
            <p>Execute generated test suites against target application API endpoints</p>
          </div>
        </div>
        <EmptyState
          title="NO GENERATED SPECS AVAILABLE TO RUN"
          description="Generate Playwright TypeScript spec files in the Generated Tests tab prior to triggering the test runner."
          actionText="Go to Generated Specs"
          onAction={onNavigateToSpecs}
        />
      </div>
    );
  }

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      await onExecuteRun(targetApiBaseUrl);
    } catch (err: any) {
      setError(err.message || 'Test suite could not be executed because no generated Playwright tests were discovered.');
    } finally {
      setIsRunning(false);
    }
  };

  const [selectedExplanation, setSelectedExplanation] = useState<TestExecutionResult | null>(null);

  const handleOpenExplanation = (res: TestExecutionResult) => {
    setSelectedExplanation(res);
  };

  const results = latestRun?.results || [];
  const hasExecutedRuns = Boolean(latestRun && latestRun.totalExecuted > 0);
  const repairSummary = latestRun?.repairSummary;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Playwright HTTP API Execution Console</h2>
          <p>Genuine test execution runner powered by Playwright APIRequestContext</p>
        </div>
        {hasExecutedRuns && (
          <button className="btn btn-emerald" onClick={onNavigateToReports}>
            <CheckCircle2 size={16} /> View Authentic Execution Reports <ArrowRight size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Test suite could not be executed. The generated Playwright test suite could not be discovered.</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowTechDetails(!showTechDetails)}>
            {showTechDetails ? 'Hide Technical Details' : 'View Technical Details'}
          </button>
          {showTechDetails && (
            <pre className="text-xs font-mono bg-surface p-2 rounded mt-2 w-full overflow-auto max-h-40">{error}</pre>
          )}
        </div>
      )}

      {/* Target Config & Trigger */}
      <div className="swiss-card flex flex-col gap-3 mb-4">
        <div className="swiss-card-header">
          <span className="swiss-card-title flex items-center gap-2">
            <Globe size={16} className="text-cyan" /> Target API Configuration
          </span>
          <span className="font-mono text-xs text-muted">
            Tests Ready: {generatedSpecs.testCount} • Status: READY
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="form-group mb-0 flex-1">
            <input
              type="url"
              className="form-input font-mono text-xs"
              value={targetApiBaseUrl}
              onChange={(e) => setTargetApiBaseUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleRun}
            disabled={isRunning}
          >
            <Play size={16} /> {isRunning ? 'EXECUTING TEST SUITE & AI REPAIR...' : 'Run Playwright API Suite'}
          </button>
        </div>
      </div>

      {/* Neutral Execution State Banner (Initial Run -> AI Repair -> Final Run) */}
      {hasExecutedRuns && repairSummary && (
        <div className="swiss-card mb-4 bg-slate-900/60 border-cyan/30">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan">
              <ShieldCheck size={16} /> Authoritative Execution Pipeline Summary
              {(latestRun as any)?.isAdapterMode && (
                <span className="mode-badge adapter text-xs ml-2">ADAPTER MODE — Synthetic deterministic execution environment</span>
              )}
            </div>
            <span className="text-xs text-muted font-mono">
              Self-Healing Loop: {repairSummary.aiRepairEnabled ? 'ACTIVE' : 'DISABLED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-surface rounded border border-border">
              <span className="text-muted block font-semibold mb-1">1. INITIAL RUN</span>
              <div className="text-sm font-bold text-primary">
                {repairSummary.initialStats.passed} / {repairSummary.initialStats.totalExecuted} Passed ({repairSummary.initialStats.passRatePercentage}%)
              </div>
              <div className="text-muted text-xs mt-1">
                Failed: {repairSummary.initialStats.failed} initial test(s)
              </div>
            </div>

            <div className="p-3 bg-surface rounded border border-border">
              <span className="text-muted block font-semibold mb-1 flex items-center gap-1">
                <Wrench size={12} className="text-cyan" /> 2. AI SELF-HEALING REPAIR
              </span>
              <div className="text-sm font-bold text-cyan">
                {repairSummary.repairStats.successCount} Repaired / {repairSummary.repairStats.attemptedCount} Attempted
              </div>
              <div className="text-muted text-xs mt-1">
                Failed Attempts: {repairSummary.repairStats.failedCount}
              </div>
            </div>

            <div className="p-3 bg-surface rounded border border-border">
              <span className="text-muted block font-semibold mb-1">3. FINAL RUN (AUTHORITATIVE)</span>
              <div className="text-sm font-bold text-emerald">
                {repairSummary.finalStats.passed} / {repairSummary.finalStats.totalExecuted} Passed ({repairSummary.finalStats.passRatePercentage}%)
              </div>
              <div className="text-muted text-xs mt-1">
                Failed: {repairSummary.finalStats.failed} final test(s)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execution Summary KPI Strip (Reads Authoritative finalRun State) */}
      {hasExecutedRuns ? (
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Executed Tests</span>
            <div className="kpi-value">{latestRun!.totalExecuted}</div>
            <div className="kpi-footer">Genuine Playwright runs</div>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Passed Tests</span>
            <div className="kpi-value text-emerald">{latestRun!.passed}</div>
            <div className="kpi-footer">Status 200/201 assertions OK</div>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Failed Tests</span>
            <div className="kpi-value text-rose">{latestRun!.failed}</div>
            <div className="kpi-footer">Validation & server errors</div>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Pass Rate</span>
            <div className="kpi-value text-cyan">{latestRun!.passRatePercentage.toFixed(1)}%</div>
            <div className="kpi-footer">Authentic Playwright pass rate</div>
          </div>
        </div>
      ) : (
        <div className="swiss-card p-4 text-center text-muted">
          <span className="font-mono text-sm font-semibold">NO TEST RUN YET</span>
          <p className="text-xs text-secondary mt-1">Click 'Run Playwright API Suite' to execute genuine test suite.</p>
        </div>
      )}

      {/* Execution Results Table */}
      {results.length > 0 && (
        <div className="swiss-card p-0">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Status</th>
                  <th style={{ width: '160px' }}>Test ID</th>
                  <th style={{ width: '130px' }}>Category</th>
                  <th style={{ width: '110px' }}>Target Entity</th>
                  <th>Source Reference</th>
                  <th style={{ width: '90px' }}>HTTP Code</th>
                  <th style={{ width: '90px' }}>Duration</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.testId} className={!res.passed ? 'bg-rose-500/10' : ''}>
                    <td>
                      {res.passed ? (
                        res.isRepaired ? (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded font-mono" title={`Repaired via AI (${res.repairType || 'PAYLOAD'})`}>
                            AI REPAIRED
                          </span>
                        ) : (
                          <span className="mode-badge live text-xs font-mono">PASS</span>
                        )
                      ) : (
                        <span className="mode-badge disconnected text-xs font-mono">FAIL</span>
                      )}
                    </td>
                    <td 
                      className="font-mono font-bold text-cyan text-xs cursor-pointer hover:underline"
                      onClick={() => handleOpenExplanation(res)}
                      title="Click to view test explanation"
                    >
                      {res.testId}
                    </td>
                    <td>
                      <CategoryBadge category={res.category} />
                    </td>
                    <td className="font-mono text-xs">{res.targetEntity}</td>
                    <td className="font-mono text-xs text-muted truncate max-w-xs">{res.sourceRef}</td>
                    <td className="font-mono text-xs">
                      {res.statusCodeReceived || res.statusCode ? (
                        <span className={res.passed ? 'text-emerald' : 'text-rose'}>
                          {res.statusCodeReceived || res.statusCode}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="font-mono text-xs text-muted">{res.durationMs}ms</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="btn btn-secondary btn-sm text-cyan font-mono"
                          onClick={() => handleOpenExplanation(res)}
                          title="Explain Test Specification"
                        >
                          <FileText size={12} />
                          <span>Explain</span>
                        </button>
                        {!res.passed && (
                          <button
                            className="btn btn-secondary btn-sm text-rose font-mono"
                            onClick={() => setSelectedFailure(res)}
                            title="View Failure Trace & Diagnostics"
                          >
                            <AlertTriangle size={12} />
                            <span>Trace</span>
                          </button>
                        )}
                        {res.passed && res.isRepaired && (
                          <button
                            className="btn btn-secondary btn-sm text-cyan font-mono"
                            onClick={() => setSelectedFailure(res)}
                            title="View AI Repair Diagnostics"
                          >
                            <Wrench size={12} />
                            <span>AI REPAIRED</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <FailureTraceModal
        result={selectedFailure}
        onClose={() => setSelectedFailure(null)}
        onViewGeneratedTest={() => onNavigateToSpecs()}
      />

      {selectedExplanation && (
        <TestExplanationModal
          isOpen={Boolean(selectedExplanation)}
          onClose={() => setSelectedExplanation(null)}
          entry={selectedExplanation.traceability || (selectedExplanation as any)}
        />
      )}
    </div>
  );
};
