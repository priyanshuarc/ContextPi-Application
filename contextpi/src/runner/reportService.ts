/**
 * Authentic Reporting Engine Service
 * Generates machine-readable `summary.json` and standalone HTML dashboard `report.html`.
 * 100% Genuine Metrics Guarantee: Every number is computed directly from actual Playwright test execution results.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { ExecutionSummary, TestExecutionResult } from '../types/execution.js';

export class ReportServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportServiceError';
  }
}

export interface ReportGenerationResult {
  htmlPath: string;
  jsonPath: string;
  summary: ExecutionSummary;
}

/**
 * Renders JSON string for machine-readable summary.json
 */
export function renderJsonReport(summary: ExecutionSummary): string {
  return JSON.stringify(summary, null, 2);
}

/**
 * Renders rich standalone HTML report dashboard from actual execution summary
 */
export function renderHtmlReport(summary: ExecutionSummary): string {
  const badgeColor = summary.passRatePercentage === 100 ? '#10b981' : summary.passRatePercentage >= 80 ? '#f59e0b' : '#ef4444';

  const categoryRows = Object.entries(summary.categoryBreakdown)
    .map(
      ([cat, data]) => `
      <tr>
        <td style="font-weight:600; color:#38bdf8;">${cat}</td>
        <td>${data.total}</td>
        <td style="color:#34d399;">${data.passed}</td>
        <td style="color:#f87171;">${data.failed}</td>
        <td>${data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0}%</td>
      </tr>`
    )
    .join('');

  const priorityRows = Object.entries(summary.priorityBreakdown)
    .map(
      ([prio, data]) => `
      <tr>
        <td style="font-weight:600;">${prio}</td>
        <td>${data.total}</td>
        <td style="color:#34d399;">${data.passed}</td>
        <td style="color:#f87171;">${data.failed}</td>
        <td>${data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0}%</td>
      </tr>`
    )
    .join('');

  const testRows = summary.results
    .map((r: TestExecutionResult) => {
      const statusBg = r.status === 'PASS' ? '#064e3b' : r.status === 'FAIL' ? '#7f1d1d' : '#78350f';
      const statusFg = r.status === 'PASS' ? '#34d399' : r.status === 'FAIL' ? '#f87171' : '#fbbf24';

      let failureHtml = '';
      if (r.error) {
        failureHtml = `
        <div style="margin-top:8px; padding:10px; background:#1e1e1e; border-left:3px solid #ef4444; border-radius:4px; font-family:monospace; font-size:12px;">
          <div style="color:#f87171; font-weight:bold;">${escapeHtml(r.error.message)}</div>
          ${r.error.location ? `<div style="color:#9ca3af; margin-top:4px;">Location: ${escapeHtml(r.error.location)}</div>` : ''}
          ${r.error.stack ? `<details><summary style="cursor:pointer; color:#60a5fa; margin-top:4px;">Stack Trace</summary><pre style="color:#d1d5db; font-size:11px; white-space:pre-wrap; overflow-x:auto;">${escapeHtml(r.error.stack)}</pre></details>` : ''}
        </div>`;
      }

      return `
      <tr>
        <td><code style="background:#334155; padding:2px 6px; border-radius:4px; color:#f1f5f9;">${r.testId}</code></td>
        <td><span style="background:${statusBg}; color:${statusFg}; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:11px;">${r.status}</span></td>
        <td>${r.category}</td>
        <td>${r.targetEntity}</td>
        <td>${r.priority}</td>
        <td>${r.durationMs} ms</td>
        <td>
          <div>${escapeHtml(r.reasoning)}</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Source: ${r.source} (${r.sourceRef})</div>
          ${failureHtml}
        </td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contextπ Test Execution Report - ${escapeHtml(summary.projectName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; background: #1e293b; padding: 24px; border-radius: 12px; border: 1px solid #334155; }
    .title { font-size: 24px; font-weight: bold; color: #38bdf8; margin: 0; }
    .subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; }
    .badge { padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 16px; color: white; background: ${badgeColor}; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; }
    .card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; text-align: center; }
    .card-num { font-size: 28px; font-weight: bold; margin-top: 4px; }
    .card-label { font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
    .tables-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; background: #1e293b; border-radius: 8px; overflow: hidden; }
    th { background: #334155; text-align: left; padding: 10px 14px; color: #cbd5e1; font-weight: 600; }
    td { padding: 10px 14px; border-top: 1px solid #334155; vertical-align: top; }
    .section-title { font-size: 18px; font-weight: bold; color: #f8fafc; margin-top: 32px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">Contextπ Test Execution Report</h1>
        <div class="subtitle">Project: <strong>${escapeHtml(summary.projectName)}</strong> | Target API: <strong>${escapeHtml(summary.targetApiBaseUrl)}</strong></div>
        <div class="subtitle">Executed At: ${escapeHtml(summary.executedAt)}</div>
      </div>
      <div class="badge">${summary.passRatePercentage}% PASS RATE</div>
    </div>

    <div class="cards">
      <div class="card"><div class="card-label">Total Executed</div><div class="card-num" style="color:#f8fafc;">${summary.totalExecuted}</div></div>
      <div class="card"><div class="card-label">Passed</div><div class="card-num" style="color:#34d399;">${summary.passed}</div></div>
      <div class="card"><div class="card-label">Failed</div><div class="card-num" style="color:#f87171;">${summary.failed}</div></div>
      <div class="card"><div class="card-label">Skipped</div><div class="card-num" style="color:#fbbf24;">${summary.skipped}</div></div>
      <div class="card"><div class="card-label">Total Duration</div><div class="card-num" style="color:#38bdf8;">${summary.totalDurationMs} ms</div></div>
    </div>

    <div class="tables-grid">
      <div>
        <div class="section-title">Category Breakdown</div>
        <table>
          <thead><tr><th>Category</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass %</th></tr></thead>
          <tbody>${categoryRows}</tbody>
        </table>
      </div>
      <div>
        <div class="section-title">Priority Breakdown</div>
        <table>
          <thead><tr><th>Priority</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass %</th></tr></thead>
          <tbody>${priorityRows}</tbody>
        </table>
      </div>
    </div>

    <div class="section-title">Detailed Test Execution Results</div>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Status</th>
          <th>Category</th>
          <th>Target Entity</th>
          <th>Priority</th>
          <th>Duration</th>
          <th>Reasoning & Diagnostics</th>
        </tr>
      </thead>
      <tbody>
        ${testRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Main Report Service Function
 * Writes `summary.json` and `report.html` to target directory
 */
export async function generateReportFiles(
  summary: ExecutionSummary,
  outputDir: string = 'reports'
): Promise<ReportGenerationResult> {
  if (!summary || summary.totalExecuted === undefined || !Array.isArray(summary.results)) {
    throw new ReportServiceError('Invalid ExecutionSummary object passed to ReportService');
  }

  const resolvedDir = path.resolve(outputDir);
  await fs.mkdir(resolvedDir, { recursive: true });

  const htmlPath = path.join(resolvedDir, 'report.html');
  const jsonPath = path.join(resolvedDir, 'summary.json');

  const htmlContent = renderHtmlReport(summary);
  const jsonContent = renderJsonReport(summary);

  await fs.writeFile(htmlPath, htmlContent, 'utf-8');
  await fs.writeFile(jsonPath, jsonContent, 'utf-8');

  return {
    htmlPath,
    jsonPath,
    summary
  };
}
