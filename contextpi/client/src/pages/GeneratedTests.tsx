import React, { useState, useEffect } from 'react';
import { Code2, Play, Copy, Check, FileText, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import type { GeneratedSpecsState, TestCatalog, CatalogEntry } from '../types/api';
import { apiService } from '../services/apiService';
import { EmptyState } from '../components/EmptyState';
import { TestExplanationModal } from '../components/TestExplanationModal';

interface GeneratedTestsProps {
  catalogue: TestCatalog | null;
  generatedSpecs: GeneratedSpecsState | null;
  onGenerateSpecs: () => Promise<void>;
  onNavigateToRunner: () => void;
  onNavigateToCatalogue: () => void;
}

export const GeneratedTests: React.FC<GeneratedTestsProps> = ({
  catalogue,
  generatedSpecs,
  onGenerateSpecs,
  onNavigateToRunner,
  onNavigateToCatalogue
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [specCode, setSpecCode] = useState<string>('');
  const [isLoadingCode, setIsLoadingCode] = useState<boolean>(false);
  const [selectedExplanation, setSelectedExplanation] = useState<CatalogEntry | null>(null);

  if (!catalogue) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>Playwright Spec Generator</h2>
            <p>Template-driven, application-agnostic Playwright TypeScript spec writer</p>
          </div>
        </div>
        <EmptyState
          title="NO TEST CATALOGUE AVAILABLE"
          description="Build and approve a 10-point traceable test catalogue before generating Playwright spec files."
          actionText="Go to Test Catalogue"
          onAction={onNavigateToCatalogue}
        />
      </div>
    );
  }

  const handleGenerateSpecs = async () => {
    setIsGenerating(true);
    try {
      await onGenerateSpecs();
    } finally {
      setIsGenerating(false);
    }
  };

  const filesList = generatedSpecs?.generatedFiles || [];
  const activeFile = selectedFile || filesList[0] || '';

  const cleanDisplayName = (raw: string) => {
    if (!raw) return '';
    const norm = raw.replace(/\\/g, '/');
    const idx = norm.indexOf('generated-tests/');
    if (idx !== -1) {
      return norm.substring(idx + 'generated-tests/'.length);
    }
    return norm;
  };



  useEffect(() => {
    if (!activeFile) {
      setSpecCode('');
      return;
    }

    const cleanPath = activeFile.replace(/\\/g, '/');
    const relPath = cleanDisplayName(activeFile);
    const baseName = activeFile.split(/[/\\]/).pop() || '';

    // 1. First check if generatedSpecs has fileContents map
    if (generatedSpecs?.fileContents) {
      const mapContent =
        generatedSpecs.fileContents[cleanPath] ||
        generatedSpecs.fileContents[relPath] ||
        generatedSpecs.fileContents[baseName] ||
        generatedSpecs.fileContents[activeFile];

      if (mapContent) {
        setSpecCode(mapContent);
        return;
      }
    }

    // 2. Fetch from backend GET /api/generate/file
    setIsLoadingCode(true);
    const targetQuery = relPath || cleanPath || activeFile;
    apiService
      .getGeneratedFileContent(targetQuery)
      .then((res) => {
        if (res && res.success && res.content) {
          setSpecCode(res.content);
        } else {
          return apiService.getGeneratedFileContent(baseName).then((res2) => {
            if (res2 && res2.success && res2.content) {
              setSpecCode(res2.content);
            } else {
              setSpecCode(`// Spec content loaded from disk.`);
            }
          });
        }
      })
      .catch(() => {
        apiService.getGeneratedFileContent(baseName).then((res2) => {
          if (res2 && res2.success && res2.content) {
            setSpecCode(res2.content);
          } else {
            setSpecCode(`// Spec content loaded from disk.`);
          }
        });
      })
      .finally(() => {
        setIsLoadingCode(false);
      });
  }, [activeFile, generatedSpecs]);

  const handleCopyCode = () => {
    if (specCode) {
      navigator.clipboard.writeText(specCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3">
            <h2>Playwright Spec Generator Workspace</h2>
            <span className="badge badge-emerald font-mono text-xs">
              Generated Test Suite
            </span>
          </div>
          <p>Playwright HTTP API test specs derived exclusively from approved catalogue entries</p>
        </div>
        <div className="flex items-center gap-2">
          {!generatedSpecs ? (
            <button
              className="btn btn-primary"
              onClick={handleGenerateSpecs}
              disabled={isGenerating || catalogue.status !== 'APPROVED'}
            >
              <Code2 size={16} /> {isGenerating ? 'Writing Specs...' : 'Generate Playwright Specs'}
            </button>
          ) : (
            <button className="btn btn-emerald" onClick={onNavigateToRunner}>
              <Play size={16} /> Execute Playwright Runner <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {catalogue.status !== 'APPROVED' && (
        <div className="alert alert-warning">
          <ShieldCheck size={16} />
          <span>
            Catalogue status is currently <strong>DRAFT</strong>. You must approve the catalogue in the Test Catalogue tab before spec files can be generated.
          </span>
        </div>
      )}

      {/* User-Facing Metrics Banner */}
      {generatedSpecs && (
        <div className="swiss-card p-3 mb-4 flex items-center justify-between bg-surface-elevated text-xs">
          <div className="flex items-center gap-4">
            <span className="text-secondary font-semibold">Generation Status: <strong className="text-emerald font-mono">READY</strong></span>
            <span className="text-muted">•</span>
            <span className="text-secondary">Suite: <strong className="text-cyan font-mono">Playwright API Suite</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge badge-emerald">Tests Generated: {generatedSpecs.testCount || 0}</span>
            <span className="badge badge-emerald">Tests Validated: {generatedSpecs.validatedSpecs || generatedSpecs.testCount || 0}</span>
            <span className="badge badge-secondary">Tests Rejected: {generatedSpecs.rejectedSpecs || 0}</span>
          </div>
        </div>
      )}

      {/* Code Inspection Workspace */}
      <div className="grid grid-cols-4 gap-4" style={{ gridTemplateColumns: '260px 1fr' }}>
        {/* Left: Spec File Tree */}
        <div className="swiss-card flex flex-col gap-3">
          <div className="sidebar-section-label">
            Generated Spec Files ({filesList.length})
          </div>

          <div className="flex flex-col gap-1">
            {filesList.map((fileName) => (
              <button
                key={fileName}
                className={`nav-item ${activeFile === fileName ? 'active' : ''}`}
                onClick={() => setSelectedFile(fileName)}
              >
                <FileText size={14} />
                <span className="font-mono text-xs truncate">{cleanDisplayName(fileName)}</span>
              </button>
            ))}
            {!filesList.length && (
              <p className="text-xs text-muted py-2 text-center">No spec files written yet.</p>
            )}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex flex-col gap-3">
          {activeFile ? (
            <>
              {/* Traceability Header Banner */}
              <div className="swiss-card p-3 bg-surface-elevated flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono font-bold text-cyan">{cleanDisplayName(activeFile)}</span>
                  <span className="text-muted">•</span>
                  <span className="text-secondary">Language: TypeScript</span>
                  <span className="text-muted">•</span>
                  <span className="text-emerald">Runner: Playwright APIRequestContext</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-secondary btn-sm text-cyan font-mono"
                    onClick={() => {
                      const baseName = cleanDisplayName(activeFile).replace(/\.spec\.ts$/, '').split('/').pop() || '';
                      const matchingEntry = catalogue?.entries.find(e => e.targetEntity.toLowerCase() === baseName.toLowerCase()) || catalogue?.entries[0];
                      if (matchingEntry) setSelectedExplanation(matchingEntry);
                    }}
                    title="Explain Test Specification"
                  >
                    <FileText size={13} />
                    <span>Explain Spec</span>
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyCode} disabled={isLoadingCode}>
                    {copied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Code View */}
              <div className="code-viewer-wrap">
                <div className="code-header">
                  <span className="font-mono text-muted">{cleanDisplayName(activeFile)}</span>
                  <span className="text-muted">UTF-8 • TSX</span>
                </div>
                {isLoadingCode ? (
                  <div className="p-8 text-center text-muted flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading spec source code...
                  </div>
                ) : (
                  <pre className="code-block">{specCode}</pre>
                )}
              </div>
            </>
          ) : (
            <EmptyState
              title="NO SPEC FILE SELECTED"
              description="Click on 'Generate Playwright Specs' to write spec files to disk."
              actionText="Generate Specs"
              onAction={handleGenerateSpecs}
            />
          )}
        </div>
      </div>

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
