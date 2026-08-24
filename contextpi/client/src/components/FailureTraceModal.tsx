import React, { useState } from 'react';
import { X, AlertTriangle, Code, MapPin, Terminal, Wrench, Copy, Check, ChevronDown, ChevronRight, Server } from 'lucide-react';
import type { TestExecutionResult } from '../types/api';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatFailureTrace } from '../utils/failureTraceFormatter';

interface FailureTraceModalProps {
  result: TestExecutionResult | null;
  onClose: () => void;
  onViewGeneratedTest?: (testId: string) => void;
}

export const FailureTraceModal: React.FC<FailureTraceModalProps> = ({
  result,
  onClose,
  onViewGeneratedTest
}) => {
  const [showRawError, setShowRawError] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  // Extract raw error from result safely
  const rawError =
    (result as any).error ??
    (result as any).failureError ??
    (result as any).assertionFailureMessage ??
    (result as any).message;

  const trace = formatFailureTrace(rawError);

  const displayMessage = trace.message || 'Execution failure detected';
  const displayLocation = trace.location || (result as any).location;
  const displayStack = trace.stack || (result as any).stack;

  const repairTraceability = result.repairTraceability || (result as any).traceabilityRecord;

  const handleCopyRawError = () => {
    const textToCopy = `${displayMessage}\n${displayStack || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const httpMethod = result.httpMethod || (result.traceability as any)?.httpMethod || 'POST';
  const route = result.route || `/api/forms/${result.targetEntity.toLowerCase()}`;
  const requestPayload = result.requestPayload || (result.traceability as any)?.payloadTemplate;

  // Pretty API response body if available
  const responseBodyStr = (result as any).responseBody 
    ? (typeof (result as any).responseBody === 'object' 
        ? JSON.stringify((result as any).responseBody, null, 2) 
        : String((result as any).responseBody))
    : '(Empty / No Response Body)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="explain-modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header Section */}
        <div className="explain-header">
          <div className="flex items-center gap-3">
            <div className="brand-icon-box bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose text-sm">FAILURE TRACE</span>
                <span className="font-mono font-bold text-cyan text-base">{result.testId}</span>
                {result.passed ? (
                  result.isRepaired ? (
                    <span className="priority-badge critical bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">AI REPAIRED</span>
                  ) : (
                    <span className="mode-badge live">PASS</span>
                  )
                ) : (
                  <span className="priority-badge critical">FAIL</span>
                )}
                <CategoryBadge category={result.category as any} />
                {result.priority && <PriorityBadge priority={result.priority as any} />}
              </div>
              <p className="text-xs text-secondary mt-1">
                Target Entity: <span className="font-mono text-cyan font-semibold">{result.targetEntity}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" title="Close Trace">
            <X size={16} />
          </button>
        </div>

        {/* 13 Diagnostic Sections Body */}
        <div className="modal-body flex-1 flex flex-col gap-4">
          
          {/* SECTION 1: HUMAN SUMMARY */}
          <div className="alert alert-danger flex flex-col gap-1">
            <span className="text-xs font-bold text-rose uppercase flex items-center gap-1">
              <AlertTriangle size={14} /> 1. HUMAN SUMMARY
            </span>
            <p className="text-xs leading-relaxed font-sans">{trace.humanSummary}</p>
          </div>

          {/* SECTION 2 & 3 & 4: WHAT HAPPENED, EXPECTED, ACTUAL */}
          <div className="explain-grid-3 text-xs font-mono">
            <div className="swiss-card flex flex-col gap-1">
              <span className="text-muted text-[10px] uppercase font-bold">2. WHAT HAPPENED</span>
              <span className="text-primary font-semibold">{trace.whatHappened}</span>
            </div>

            <div className="swiss-card flex flex-col gap-1">
              <span className="text-muted text-[10px] uppercase font-bold">3. EXPECTED</span>
              <span className="text-emerald font-bold text-sm">{trace.expected || 'HTTP 200/201'}</span>
            </div>

            <div className="swiss-card flex flex-col gap-1">
              <span className="text-muted text-[10px] uppercase font-bold">4. ACTUAL</span>
              <span className="text-rose font-bold text-sm">
                HTTP {result.statusCodeReceived || result.statusCode || '400'}
              </span>
            </div>
          </div>

          {/* SECTION 5: API RESPONSE */}
          <div className="swiss-card flex flex-col gap-2">
            <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <Server size={14} className="text-cyan" /> 5. API RESPONSE BODY
            </span>
            <pre className="code-block text-xs text-cyan max-h-36 overflow-y-auto">
              {responseBodyStr}
            </pre>
          </div>

          {/* SECTION 6: REQUEST */}
          <div className="swiss-card flex flex-col gap-2 font-mono text-xs">
            <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <Code size={14} className="text-amber" /> 6. REQUEST DETAILS
            </span>
            <div className="explain-grid-2">
              <div>
                <span className="text-muted block mb-1">HTTP Method & Route</span>
                <code className="code-block text-xs text-emerald block">{httpMethod} {route}</code>
              </div>
              <div>
                <span className="text-muted block mb-1">Relevant Headers</span>
                <code className="code-block text-xs text-secondary block">
                  Content-Type: application/json | x-project-name: NexaSupply
                </code>
              </div>
            </div>
            {requestPayload && Object.keys(requestPayload).length > 0 && (
              <div>
                <span className="text-muted block mb-1">Payload JSON</span>
                <pre className="code-block text-xs text-amber max-h-36 overflow-y-auto">
                  {JSON.stringify(requestPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* SECTION 7 & 8: FAILED ASSERTION & LOCATION */}
          <div className="explain-grid-2 text-xs font-mono">
            <div className="swiss-card flex flex-col gap-1">
              <span className="text-muted text-[10px] uppercase font-bold">7. FAILED ASSERTION</span>
              <code className="code-block text-xs text-rose block font-semibold">{trace.failedAssertion}</code>
            </div>

            <div className="swiss-card flex flex-col gap-1">
              <span className="text-muted text-[10px] uppercase font-bold">8. SPEC LOCATION</span>
              <span className="text-cyan font-bold flex items-center gap-1 mt-1">
                <MapPin size={14} /> {displayLocation || 'Generated Spec Directory'}
              </span>
            </div>
          </div>

          {/* SECTION 9 & 10: ROOT CAUSE & SUGGESTED NEXT ACTION */}
          <div className="explain-grid-2 text-xs">
            <div className="swiss-card flex flex-col gap-1">
              <span className="text-xs font-bold text-muted uppercase">9. ROOT CAUSE</span>
              <p className="text-secondary leading-relaxed">{trace.likelyRootCause}</p>
            </div>

            <div className="swiss-card flex flex-col gap-1">
              <span className="text-xs font-bold text-muted uppercase">10. SUGGESTED NEXT ACTION</span>
              <p className="text-cyan leading-relaxed font-semibold">{trace.suggestedNextAction}</p>
            </div>
          </div>

          {/* SECTION 11: TRACEABILITY */}
          <div className="swiss-card flex flex-col gap-3 font-mono text-xs">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">11. TRACEABILITY MATRIX</h4>
            <div className="explain-grid-4">
              <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                <span className="text-muted">Test ID</span>
                <span className="text-cyan font-bold">{result.testId}</span>
              </div>

              <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                <span className="text-muted">Category</span>
                <span className="text-primary">{result.category}</span>
              </div>

              <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                <span className="text-muted">Source</span>
                <span className="text-primary">{result.source}</span>
              </div>

              <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                <span className="text-muted">Source Ref</span>
                <span className="text-primary truncate">{result.sourceRef}</span>
              </div>
            </div>
            <div className="text-xs text-secondary pt-2 border-t border-subtle font-sans">
              <span className="font-semibold text-muted">Reasoning: </span>{result.reasoning}
            </div>
          </div>

          {/* SECTION 12: AI REPAIR DIAGNOSTICS */}
          <div className="swiss-card flex flex-col gap-3 border-cyan/30 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan uppercase flex items-center gap-1">
                <Wrench size={16} /> 12. AI REPAIR DIAGNOSTICS
              </span>
              <span className={`mode-badge ${repairTraceability?.finalResult === 'PASS' ? 'live' : 'disconnected'}`}>
                {repairTraceability?.repairState || (result.isRepaired ? 'REPAIRED_PASS' : 'UNREPAIRED')}
              </span>
            </div>

            {repairTraceability ? (
              <div className="flex flex-col gap-2">
                <div className="explain-grid-4">
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Provider</span>
                    <span className="text-primary font-bold">{repairTraceability.provider || 'Qwen3 Coder'}</span>
                  </div>
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Model ID</span>
                    <span className="text-primary">{repairTraceability.modelId || 'qwen.qwen3-coder-next'}</span>
                  </div>
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Call Made</span>
                    <span className="text-emerald font-bold">YES</span>
                  </div>
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Repair Type</span>
                    <span className="text-cyan font-bold">{repairTraceability.repairType || 'PAYLOAD'}</span>
                  </div>
                </div>

                <div className="explain-grid-4">
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Confidence</span>
                    <span className="text-primary">{repairTraceability.confidence || 0.85}</span>
                  </div>
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Validation State</span>
                    <span className={repairTraceability.validationResult?.valid ? 'text-emerald font-bold' : 'text-rose font-bold'}>
                      {repairTraceability.validationResult?.valid ? 'PASS' : 'REJECTED'}
                    </span>
                  </div>
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Attempt Count</span>
                    <span className="text-primary">{repairTraceability.retryCount || 1} / 3</span>
                  </div>
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Final Outcome</span>
                    <span className={repairTraceability.finalResult === 'PASS' ? 'text-emerald font-bold' : 'text-rose font-bold'}>
                      {repairTraceability.finalResult}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-elevated p-2.5 rounded border border-subtle font-sans text-xs">
                  <span className="text-muted font-bold block mb-1">Diagnosis & Safety Rationale:</span>
                  <span className="text-secondary">{repairTraceability.repairReasoning || 'Repair proposal evaluated against 13-point safety policy.'}</span>
                </div>
              </div>
            ) : (
              <div className="text-muted text-xs italic">
                {result.isRepaired ? 'Test repaired successfully via AI Self-Healing Engine.' : 'No repair attempt or repair rejected by safety policy.'}
              </div>
            )}
          </div>

          {/* SECTION 13: RAW PLAYWRIGHT ERROR */}
          <div className="swiss-card flex flex-col gap-2">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowRawError(!showRawError)}
            >
              <span className="text-xs font-bold text-muted uppercase flex items-center gap-1">
                {showRawError ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Terminal size={14} /> 13. RAW PLAYWRIGHT ERROR (ANSI STRIPPED)
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyRawError();
                }}
                className="btn btn-secondary btn-sm"
              >
                {copied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Log'}</span>
              </button>
            </div>

            {showRawError && (
              <pre className="code-block text-xs text-rose max-h-48 overflow-y-auto font-mono mt-2">
                {trace.rawDecodedMessage || displayMessage}
                {displayStack ? `\n\n${displayStack}` : ''}
              </pre>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="modal-header border-t border-subtle justify-between">
          <div>
            {onViewGeneratedTest && (
              <button
                onClick={() => {
                  onClose();
                  onViewGeneratedTest(result.testId);
                }}
                className="btn btn-secondary btn-sm font-mono text-cyan"
              >
                <Code size={14} /> View Spec Code
              </button>
            )}
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Failure Trace
          </button>
        </div>

      </div>
    </div>
  );
};
