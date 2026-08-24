import React from 'react';
import { BarChart3, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import type { ExecutionSummary } from '../types/api';
import { EmptyState } from '../components/EmptyState';
import { CategoryBadge } from '../components/CategoryBadge';
import { PriorityBadge } from '../components/PriorityBadge';

interface ReportsProps {
  latestRun: ExecutionSummary | null;
  runState: any;
  onNavigateToRunner: () => void;
}

export const Reports: React.FC<ReportsProps> = ({
  latestRun,
  onNavigateToRunner
}) => {
  if (!latestRun || !latestRun.totalExecuted) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>Authentic Execution Reporting Engine</h2>
            <p>Traceable metrics and reports generated from live Playwright HTTP API runs</p>
          </div>
        </div>
        <EmptyState
          title="NO TEST RUN YET"
          description="Execute the Playwright API test runner in the Test Runs tab to produce authentic summary metrics and HTML report artifacts."
          actionText="Go to Test Runs"
          onAction={onNavigateToRunner}
        />
      </div>
    );
  }

  const handleOpenHtmlReport = () => {
    window.open('/api/reports/latest?format=raw', '_blank');
  };

  const handleOpenJsonSummary = () => {
    window.open('/api/runs/latest', '_blank');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Authentic Execution Reporting Engine</h2>
          <p>Metrics and HTML/JSON report artifacts generated strictly from Playwright HTTP executions</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={handleOpenJsonSummary}>
            <FileText size={14} /> View JSON Summary
          </button>
          <button className="btn btn-primary" onClick={handleOpenHtmlReport}>
            <ExternalLink size={14} /> Open HTML Report
          </button>
        </div>
      </div>

      {/* Verification Integrity Banner */}
      <div className="swiss-card p-3 bg-surface-elevated flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck size={16} className="text-emerald" />
          <span className="font-semibold text-primary">AUTHENTIC METRIC GUARANTEE</span>
          <span className="text-muted">•</span>
          <span className="text-secondary">
            Metrics generated from actual Playwright execution against {latestRun.targetApiBaseUrl}
          </span>
        </div>
        <span className="font-mono text-xs text-muted">
          Executed: {new Date(latestRun.executedAt).toLocaleString()}
        </span>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Pass Rate</span>
          <div
            className="kpi-value"
            style={{
              color: latestRun.passRatePercentage >= 90 ? 'var(--status-emerald)' : 'var(--status-rose)'
            }}
          >
            {latestRun.passRatePercentage.toFixed(2)}%
          </div>
          <div className="kpi-footer">Overall Execution Score</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Passed Tests</span>
          <div className="kpi-value text-emerald">{latestRun.passed}</div>
          <div className="kpi-footer">HTTP 200/201 assertions passed</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Failed Tests</span>
          <div className="kpi-value text-rose">{latestRun.failed}</div>
          <div className="kpi-footer">HTTP assertion failures</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Total Executed</span>
          <div className="kpi-value">{latestRun.totalExecuted}</div>
          <div className="kpi-footer">{(latestRun.totalDurationMs / 1000).toFixed(2)}s duration</div>
        </div>
      </div>

      {/* Results by Category Table */}
      <div className="swiss-card">
        <div className="swiss-card-header">
          <span className="swiss-card-title flex items-center gap-2">
            <BarChart3 size={16} className="text-cyan" /> Execution Results by Category
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Passed</th>
                <th style={{ textAlign: 'center' }}>Failed</th>
                <th style={{ textAlign: 'center' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(latestRun.categoryBreakdown || latestRun.byCategory || {}) as [string, { total: number; passed: number; failed: number }][]).map(([cat, stats]) => {
                const total = stats.total || stats.passed + stats.failed;
                const catPassRate = total > 0 ? (stats.passed / total) * 100 : 0;
                return (
                  <tr key={cat}>
                    <td>
                      <CategoryBadge category={cat as any} />
                    </td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-emerald font-bold">
                      {stats.passed}
                    </td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-rose font-bold">
                      {stats.failed}
                    </td>
                    <td style={{ textAlign: 'center' }} className="font-mono font-bold">
                      {total}
                    </td>
                    <td style={{ textAlign: 'right' }} className="font-mono font-bold text-cyan">
                      {catPassRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results by Priority Table */}
      <div className="swiss-card">
        <div className="swiss-card-header">
          <span className="swiss-card-title flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald" /> Execution Results by Priority
          </span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority Level</th>
                <th style={{ textAlign: 'center' }}>Passed</th>
                <th style={{ textAlign: 'center' }}>Failed</th>
                <th style={{ textAlign: 'center' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(latestRun.priorityBreakdown || latestRun.byPriority || {}) as [string, { total: number; passed: number; failed: number }][]).map(([prio, stats]) => {
                const total = stats.total || stats.passed + stats.failed;
                const prioPassRate = total > 0 ? (stats.passed / total) * 100 : 0;
                return (
                  <tr key={prio}>
                    <td>
                      <PriorityBadge priority={prio as any} />
                    </td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-emerald font-bold">
                      {stats.passed}
                    </td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-rose font-bold">
                      {stats.failed}
                    </td>
                    <td style={{ textAlign: 'center' }} className="font-mono font-bold">
                      {total}
                    </td>
                    <td style={{ textAlign: 'right' }} className="font-mono font-bold text-cyan">
                      {prioPassRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
