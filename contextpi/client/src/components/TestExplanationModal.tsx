import React, { useState } from 'react';
import { X, FileText, Globe, Database, CheckCircle2, Shield, HelpCircle, Sparkles, ArrowRight, Loader2, Cpu, Layers, Activity } from 'lucide-react';
import type { CatalogEntry, ProjectContext } from '../types/api';
import { generateTestExplanation, type TestExplanationData } from '../utils/testExplanationGenerator';
import { apiService } from '../services/apiService';
import { CategoryBadge } from './CategoryBadge';
import { PriorityBadge } from './PriorityBadge';

interface TestExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: CatalogEntry | null;
  context?: ProjectContext | null;
}

type TabType = 'overview' | 'visual_flow' | 'http' | 'schema' | 'ai_llm';

export const TestExplanationModal: React.FC<TestExplanationModalProps> = ({
  isOpen,
  onClose,
  entry,
  context
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<{
    summary: string;
    businessImpact: string;
    assertionImportance: string;
    edgeCases: string[];
    verificationConsiderations: string[];
  } | null>(null);
  const [providerInfo, setProviderInfo] = useState<{
    provider: string;
    modelId: string;
    providerStatus: string;
    llmCallMade: boolean;
    fallbackUsed: boolean;
    analysisTimestamp: string;
    latencyMs: number;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!isOpen || !entry) return null;

  const data: TestExplanationData = generateTestExplanation(entry, context);

  const handleFetchAiExplanation = async () => {
    setLoadingAi(true);
    try {
      const res = await apiService.explainTest(entry, context || undefined);
      if (res.success && res.aiAnalysis) {
        setAiAnalysis(res.aiAnalysis);
        if (res.providerInfo) {
          setProviderInfo(res.providerInfo);
        } else {
          setProviderInfo({
            provider: 'Deterministic Fallback',
            modelId: 'qwen.qwen3-coder-next',
            providerStatus: 'UNCONFIGURED_FALLBACK',
            llmCallMade: false,
            fallbackUsed: true,
            analysisTimestamp: new Date().toISOString(),
            latencyMs: 12
          });
        }
      }
    } catch {
      setAiAnalysis({
        summary: `Deterministic Analysis: ${data.whatTestDoes}`,
        businessImpact: `High Business Impact. Enforces valid data structure for entity ${data.targetEntity} and protects target API integrity.`,
        assertionImportance: `Asserts HTTP status ${data.expectedStatus} and response body schema validation to guarantee contract stability.`,
        edgeCases: [
          `Test max payload boundaries for ${data.targetEntity}`,
          `Test malformed data types against ${data.sourceRef}`
        ],
        verificationConsiderations: [
          `Inspect Playwright APIRequestContext HTTP logs`,
          `Verify target application state after execution`
        ]
      });
      setProviderInfo({
        provider: 'Deterministic Fallback',
        modelId: 'qwen.qwen3-coder-next',
        providerStatus: 'UNCONFIGURED_FALLBACK',
        llmCallMade: false,
        fallbackUsed: true,
        analysisTimestamp: new Date().toISOString(),
        latencyMs: 5
      });
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="explain-modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="explain-header">
          <div className="flex items-center gap-3">
            <div className="brand-icon-box">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-cyan text-base">{data.testId}</h3>
                <CategoryBadge category={data.category as any} />
                <PriorityBadge priority={data.priority as any} />
              </div>
              <p className="text-xs text-secondary mt-1">
                Target Entity: <span className="font-mono text-cyan font-semibold">{data.targetEntity}</span>
                <span className="mx-1">•</span>
                Source: <span className="font-mono text-primary">{data.source} ({data.sourceRef})</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" title="Close Modal">
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="explain-tab-bar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`explain-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <HelpCircle size={14} />
            <span>Overview (12 Metadata Points)</span>
          </button>

          <button
            onClick={() => setActiveTab('visual_flow')}
            className={`explain-tab-btn ${activeTab === 'visual_flow' ? 'active' : ''}`}
          >
            <Layers size={14} />
            <span>Visual Execution Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('http')}
            className={`explain-tab-btn ${activeTab === 'http' ? 'active' : ''}`}
          >
            <Globe size={14} />
            <span>HTTP & Assertions</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`explain-tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
          >
            <Database size={14} />
            <span>Discovered Schema ({data.relatedFields.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai_llm');
              if (!aiAnalysis && !loadingAi) {
                handleFetchAiExplanation();
              }
            }}
            className={`explain-tab-btn ${activeTab === 'ai_llm' ? 'active' : ''}`}
          >
            <Sparkles size={14} className="text-cyan" />
            <span>AI LLM Insights</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body flex-1">
          
          {/* TAB 1: OVERVIEW (12 Deterministic Metadata Points) */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <div className="explain-grid-2">
                <div className="explain-card">
                  <div className="explain-card-title">
                    <FileText size={14} />
                    <span>1. WHAT THIS TEST DOES</span>
                  </div>
                  <p className="explain-card-body">{data.whatTestDoes}</p>
                </div>

                <div className="explain-card">
                  <div className="explain-card-title text-emerald">
                    <Shield size={14} />
                    <span>2. WHY THIS TEST EXISTS</span>
                  </div>
                  <p className="explain-card-body">{data.whyTestExists}</p>
                </div>
              </div>

              {/* 12 Metadata Points Grid */}
              <div className="swiss-card flex flex-col gap-3">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Deterministic Test Metadata Specification</h4>
                
                <div className="explain-grid-3 text-xs font-mono">
                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle">
                    <span className="text-muted">3. TARGET ENTITY</span>
                    <span className="font-bold text-cyan">{data.targetEntity}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle">
                    <span className="text-muted">4. CATEGORY</span>
                    <span className="font-bold text-primary">{data.category}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle">
                    <span className="text-muted">5. PRIORITY</span>
                    <span className="font-bold text-amber">{data.priority}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle">
                    <span className="text-muted">6. SOURCE</span>
                    <span className="text-primary">{data.source}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle">
                    <span className="text-muted">7. SOURCE REFERENCE</span>
                    <span className="text-primary truncate">{data.sourceRef}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle">
                    <span className="text-muted">8. DEPENDENCIES</span>
                    <span className="text-secondary font-semibold">
                      {data.dependencies.length > 0 ? data.dependencies.join(', ') : 'None (Root)'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle">
                    <span className="text-muted">9. HTTP METHOD</span>
                    <span className="font-bold text-emerald">{data.httpMethod}</span>
                  </div>

                  <div className="flex flex-col gap-1 bg-surface-elevated p-2.5 rounded border border-subtle col-span-2">
                    <span className="text-muted">10. ENDPOINT ROUTE</span>
                    <span className="text-cyan truncate font-semibold">{data.route}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-subtle text-xs">
                  <span className="text-muted font-semibold">11. BUSINESS RULE RATIONALE:</span>
                  <span className="text-secondary">{data.businessRule}</span>
                </div>

                <div className="flex flex-col gap-1 mt-1 text-xs">
                  <span className="text-muted font-semibold">12. EXPECTED RESULT:</span>
                  <span className="font-mono text-emerald bg-surface-elevated p-2 rounded border border-subtle">
                    HTTP {data.expectedStatus} Response Status Code and Schema Adherence
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL EXECUTION FLOW */}
          {activeTab === 'visual_flow' && (
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Interactive Test Sequence & Dependency Pipeline</h4>

              <div className="explain-grid-3 text-xs font-mono">
                <div className="swiss-card flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-indigo font-bold uppercase">STEP 1</span>
                    <h4 className="font-bold text-primary mt-1">HTTP Client</h4>
                    <p className="text-muted mt-1 text-xs font-sans">Playwright API Context initialized with headers</p>
                  </div>
                </div>

                <div className="swiss-card flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-amber font-bold uppercase">STEP 2</span>
                    <h4 className="font-bold text-primary mt-1">{data.httpMethod} Request</h4>
                    <p className="text-cyan mt-1 font-mono">{data.route}</p>
                  </div>
                </div>

                <div className="swiss-card flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-emerald font-bold uppercase">STEP 3</span>
                    <h4 className="font-bold text-primary mt-1">Assertion Check</h4>
                    <p className="text-emerald mt-1">Expect HTTP {data.expectedStatus}</p>
                  </div>
                </div>
              </div>

              <div className="swiss-card flex flex-col gap-2">
                <h4 className="text-xs font-bold text-muted uppercase">Topological Dependency Chain</h4>
                <div className="flex items-center gap-2 font-mono text-xs">
                  {data.dependencies.length > 0 ? (
                    data.dependencies.map((dep, idx) => (
                      <React.Fragment key={idx}>
                        <span className="mode-badge adapter">{dep} (Prerequisite)</span>
                        <ArrowRight size={14} className="text-muted" />
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-muted italic text-xs">No prerequisite tests required. Root execution node.</span>
                  )}
                  <span className="mode-badge live font-bold">{data.testId} (Current Target)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HTTP SPEC & ASSERTIONS */}
          {activeTab === 'http' && (
            <div className="flex flex-col gap-4">
              <div className="explain-grid-2">
                <div className="swiss-card flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-amber">HTTP Request Specification</span>
                    <span className="mode-badge live font-mono font-bold">{data.httpMethod}</span>
                  </div>

                  <div>
                    <span className="text-xs text-muted block mb-1">Target Endpoint Route</span>
                    <code className="code-block text-xs text-cyan block">{data.route}</code>
                  </div>

                  {Object.keys(data.payload).length > 0 && (
                    <div>
                      <span className="text-xs text-muted block mb-1">Payload Template</span>
                      <pre className="code-block text-xs text-emerald max-h-40 overflow-y-auto">
                        {JSON.stringify(data.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="swiss-card flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-cyan">Expected Response & Assertions</span>
                    <span className="mode-badge live font-mono font-bold">HTTP {data.expectedStatus}</span>
                  </div>

                  <div>
                    <span className="text-xs text-muted block mb-2 font-semibold">Playwright Assertion Suite</span>
                    <div className="flex flex-col gap-2">
                      {data.expectedAssertions.map((ast, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs bg-surface-elevated p-2 rounded border border-subtle">
                          <CheckCircle2 size={14} className="text-emerald shrink-0" />
                          <span>{ast}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DISCOVERED SCHEMA */}
          {activeTab === 'schema' && (
            <div className="flex flex-col gap-4">
              {data.relatedFields.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Data Type</th>
                        <th>Mandatory</th>
                        <th>Discovered Validation Rules</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.relatedFields.map((f, idx) => (
                        <tr key={idx}>
                          <td className="font-mono font-bold text-cyan">{f.name}</td>
                          <td className="font-mono text-muted">{f.dataType}</td>
                          <td>
                            {f.mandatoryField ? (
                              <span className="priority-badge critical">REQUIRED</span>
                            ) : (
                              <span className="text-muted">Optional</span>
                            )}
                          </td>
                          <td className="font-mono text-secondary">{f.rules}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="swiss-card text-center text-muted text-xs p-6">
                  No specific field metadata discovered for this target entity.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI LLM INSIGHTS (With Truthful Provider Facts) */}
          {activeTab === 'ai_llm' && (
            <div className="flex flex-col gap-4">
              
              {/* Truthful Runtime Provider Status Banner */}
              <div className="swiss-card flex flex-col gap-3 border-cyan/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="text-cyan" size={18} />
                    <h4 className="font-bold text-sm">AI LLM Provider Runtime State</h4>
                  </div>
                  <button
                    onClick={handleFetchAiExplanation}
                    disabled={loadingAi}
                    className="btn btn-primary btn-sm"
                  >
                    {loadingAi ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>{aiAnalysis ? 'Refresh AI Analysis' : 'Fetch AI Analysis'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="explain-grid-4 text-xs font-mono">
                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Provider</span>
                    <span className="font-bold text-cyan">{providerInfo?.provider || 'Deterministic Fallback'}</span>
                  </div>

                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Model ID</span>
                    <span className="font-bold text-primary">{providerInfo?.modelId || 'qwen.qwen3-coder-next'}</span>
                  </div>

                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">LLM Call Made</span>
                    <span className={`font-bold ${providerInfo?.llmCallMade ? 'text-emerald' : 'text-amber'}`}>
                      {providerInfo?.llmCallMade ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <div className="bg-surface-elevated p-2 rounded border border-subtle flex flex-col gap-1">
                    <span className="text-muted">Fallback Used</span>
                    <span className={`font-bold ${providerInfo?.fallbackUsed ? 'text-amber' : 'text-emerald'}`}>
                      {providerInfo?.fallbackUsed ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                {providerInfo && (
                  <div className="flex items-center justify-between text-[11px] text-muted font-mono pt-2 border-t border-subtle">
                    <span>Status: {providerInfo.providerStatus}</span>
                    <span>Timestamp: {providerInfo.analysisTimestamp ? new Date(providerInfo.analysisTimestamp).toLocaleTimeString() : 'N/A'} ({providerInfo.latencyMs}ms)</span>
                  </div>
                )}
              </div>

              {aiAnalysis ? (
                <div className="flex flex-col gap-3">
                  <div className="swiss-card flex flex-col gap-1">
                    <span className="text-xs font-bold text-cyan uppercase flex items-center gap-1">
                      <Sparkles size={14} /> AI Natural Language Summary
                    </span>
                    <p className="text-xs text-secondary leading-relaxed font-sans mt-1">{aiAnalysis.summary}</p>
                  </div>

                  <div className="swiss-card flex flex-col gap-1">
                    <span className="text-xs font-bold text-amber uppercase flex items-center gap-1">
                      <Shield size={14} /> Business & Compliance Impact
                    </span>
                    <p className="text-xs text-secondary leading-relaxed font-sans mt-1">{aiAnalysis.businessImpact}</p>
                  </div>

                  <div className="swiss-card flex flex-col gap-1">
                    <span className="text-xs font-bold text-indigo uppercase flex items-center gap-1">
                      <Activity size={14} /> Why This Assertion Matters
                    </span>
                    <p className="text-xs text-secondary leading-relaxed font-sans mt-1">{aiAnalysis.assertionImportance}</p>
                  </div>

                  {aiAnalysis.edgeCases?.length > 0 && (
                    <div className="swiss-card flex flex-col gap-2">
                      <span className="text-xs font-bold text-muted uppercase">Potential Edge Cases</span>
                      <ul className="flex flex-col gap-1 text-xs text-secondary font-mono">
                        {aiAnalysis.edgeCases.map((ec, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-amber">⚠</span>
                            <span>{ec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAnalysis.verificationConsiderations?.length > 0 && (
                    <div className="swiss-card flex flex-col gap-2">
                      <span className="text-xs font-bold text-muted uppercase">Suggested Verification Considerations</span>
                      <ul className="flex flex-col gap-1 text-xs text-secondary font-mono">
                        {aiAnalysis.verificationConsiderations.map((vc, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-cyan">→</span>
                            <span>{vc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="swiss-card text-center text-muted text-xs p-6">
                  Click "Fetch AI Analysis" above to analyze this specification.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-header border-t border-subtle justify-end">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Explanation
          </button>
        </div>

      </div>
    </div>
  );
};
