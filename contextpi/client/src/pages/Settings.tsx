import React from 'react';
import { ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>System Governance & Runtime Environment</h2>
          <p>PS10 Architectural Rules, Engine Configuration, and Operating Boundaries</p>
        </div>
      </div>

      {/* PS10 Rules Matrix */}
      <div className="swiss-card flex flex-col gap-3">
        <div className="swiss-card-header">
          <span className="swiss-card-title flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan" /> Permanent Governance Principles (PS10)
          </span>
          <span className="mode-badge live font-mono text-xs">STRICT ENFORCEMENT</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2 bg-surface-elevated p-3 rounded border border-subtle">
            <CheckCircle2 size={16} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-primary font-bold">1. PS10 Requirements are Truth</strong>
              <span className="text-muted">Target application schemas and rule engines drive test generation.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-surface-elevated p-3 rounded border border-subtle">
            <CheckCircle2 size={16} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-primary font-bold">2. Never Hand-Write Test Specs</strong>
              <span className="text-muted">All Playwright API test files are generated dynamically from context.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-surface-elevated p-3 rounded border border-subtle">
            <CheckCircle2 size={16} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-primary font-bold">3. No Hardcoded Entity Schemas</strong>
              <span className="text-muted">Engine is completely application-agnostic for any MongoDB schema.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-surface-elevated p-3 rounded border border-subtle">
            <CheckCircle2 size={16} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-primary font-bold">4. Never Fake Test Results</strong>
              <span className="text-muted">Metrics derive 100% from genuine Playwright HTTP API executions.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-surface-elevated p-3 rounded border border-subtle">
            <CheckCircle2 size={16} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-primary font-bold">5. Playwright HTTP API Only</strong>
              <span className="text-muted">Exclusively uses APIRequestContext / request.newContext.</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-surface-elevated p-3 rounded border border-subtle">
            <CheckCircle2 size={16} className="text-emerald flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-primary font-bold">6. TypeScript Strict Mode</strong>
              <span className="text-muted">Strict mode enabled with zero unreviewed any escape types.</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Environment Info */}
      <div className="swiss-card">
        <div className="swiss-card-header">
          <span className="swiss-card-title flex items-center gap-2">
            <Cpu size={16} className="text-emerald" /> Engine System Environment
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between py-1 border-b border-subtle">
              <span className="text-muted">Contextπ Version</span>
              <span className="text-cyan font-bold">v1.0.0</span>
            </div>
            <div className="flex justify-between py-1 border-b border-subtle">
              <span className="text-muted">Execution Mode</span>
              <span className="text-emerald font-bold">Node.js ES Modules</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">TypeScript Strict</span>
              <span className="text-emerald font-bold">ENABLED</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between py-1 border-b border-subtle">
              <span className="text-muted">Storage Specs Directory</span>
              <span className="text-primary truncate">test-output/generated-specs</span>
            </div>
            <div className="flex justify-between py-1 border-b border-subtle">
              <span className="text-muted">Storage Reports Directory</span>
              <span className="text-primary truncate">test-output/reports</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Default API Contract</span>
              <span className="text-cyan">PS10 Configurable Strategy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
