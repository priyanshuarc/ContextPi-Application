import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { TabId } from './components/Sidebar';
import { Header } from './components/Header';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ContextExplorer } from './pages/ContextExplorer';
import { TestGenerator } from './pages/TestGenerator';
import { TestCatalogue } from './pages/TestCatalogue';
import { GeneratedTests } from './pages/GeneratedTests';
import { TestRun } from './pages/TestRun';
import { Reports } from './pages/Reports';

import type {
  ProjectContext,
  TestCatalog,
  GeneratedSpecsState,
  ExecutionSummary,
  TestRunState
} from './types/api';

import { apiService } from './services/apiService';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const [context, setContext] = useState<ProjectContext | null>(null);
  const [catalogue, setCatalogue] = useState<TestCatalog | null>(null);
  const [generatedSpecs, setGeneratedSpecs] = useState<GeneratedSpecsState | null>(null);
  const [latestRun, setLatestRun] = useState<ExecutionSummary | null>(null);
  const [runState, setRunState] = useState<TestRunState | null>(null);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Initial Context & State Sync
  const syncState = async () => {
    try {
      const curContextRes = await apiService.getCurrentContext();
      if (curContextRes?.projectContext) setContext(curContextRes.projectContext);
      else setContext(null);

      const curCatalogueRes = await apiService.getLatestCatalogue();
      if (curCatalogueRes?.catalogue) setCatalogue(curCatalogueRes.catalogue);
      else setCatalogue(null);

      const curSpecsRes = await apiService.getLatestGeneratedSpecs();
      if (curSpecsRes?.specs) setGeneratedSpecs(curSpecsRes.specs);
      else setGeneratedSpecs(null);

      const curRunRes = await apiService.getLatestRun();
      if (curRunRes?.execution) {
        // Authoritative: latestRun is derived from execution summary (which is finalRun)
        const summary = curRunRes.execution.summary;
        setLatestRun(summary);
        setRunState(curRunRes.execution);
      } else {
        setLatestRun(null);
        setRunState(null);
      }
    } catch (e) {
      // Ignored if initial server state is empty
    }
  };

  useEffect(() => {
    syncState();
  }, []);

  // Handler: Fresh Start / Reset Session
  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await apiService.resetSession();
      setContext(null);
      setCatalogue(null);
      setGeneratedSpecs(null);
      setLatestRun(null);
      setRunState(null);
      setIsResetModalOpen(false);
      setActiveTab('dashboard');
    } catch (e) {
      console.error('Failed to reset session:', e);
    } finally {
      setIsResetting(false);
    }
  };

  // Handler: Load Context
  const handleLoadContext = async (config: {
    projectName: string;
    mongoUri?: string;
    databaseName?: string;
    targetApiBaseUrl?: string;
    requirement?: string;
    useMock?: boolean;
  }) => {
    const res = await apiService.loadContext({
      projectName: config.projectName,
      mongoUri: config.mongoUri,
      database: config.databaseName,
      targetApiBaseUrl: config.targetApiBaseUrl,
      requirement: config.requirement,
      useMock: config.useMock
    });
    setContext(res.projectContext);
    setCatalogue(null);
    setGeneratedSpecs(null);
    setLatestRun(null);
    return res;
  };

  // Handler: Build Catalogue
  const handleBuildCatalogue = async (requirement?: string) => {
    const res = await apiService.buildCatalogue({
      projectContext: context ? { ...context, requirement } : undefined
    });
    setCatalogue(res.catalogue);
  };

  // Handlers: Selection Toggles
  const handleToggleSelect = async (testId: string, selected: boolean) => {
    if (!catalogue) return;
    try {
      const res = selected
        ? await apiService.selectTest(catalogue.projectName || 'latest', testId)
        : await apiService.deselectTest(catalogue.projectName || 'latest', testId);
      setCatalogue(res.catalogue);
    } catch (e) {
      const entries = catalogue.entries.map((item) =>
        item.testId === testId ? { ...item, selected } : item
      );
      setCatalogue({ ...catalogue, entries });
    }
  };

  const handleSelectAll = async () => {
    if (!catalogue) return;
    try {
      const res = await apiService.selectAll(catalogue.projectName || 'latest');
      setCatalogue(res.catalogue);
    } catch (e) {
      const entries = catalogue.entries.map((item) => ({ ...item, selected: true }));
      setCatalogue({ ...catalogue, entries });
    }
  };

  const handleDeselectAll = async () => {
    if (!catalogue) return;
    try {
      const res = await apiService.deselectAll(catalogue.projectName || 'latest');
      setCatalogue(res.catalogue);
    } catch (e) {
      const entries = catalogue.entries.map((item) => ({ ...item, selected: false }));
      setCatalogue({ ...catalogue, entries });
    }
  };

  // Handler: Approve Catalogue
  const handleApproveCatalogue = async () => {
    if (!catalogue) return;
    const res = await apiService.approveCatalogue('latest');
    setCatalogue(res.catalogue);
  };

  // Handler: Generate Specs
  const handleGenerateSpecs = async () => {
    if (!catalogue) return;
    const res = await apiService.generateSpecs({
      catalogueId: 'latest'
    });
    setGeneratedSpecs({
      generationId: res.generationId,
      generatedFiles: res.generatedFiles,
      testCount: res.testCount,
      outputDir: res.outputDir,
      generatedAt: new Date().toISOString(),
      traceabilitySummary: res.traceabilitySummary,
      fileContents: (res as any).fileContents
    });
    setActiveTab('generated');
  };

  // Handler: Execute Playwright Runner (Receives Authoritative POST /api/run Response)
  const handleExecuteRun = async (targetApiBaseUrl: string) => {
    const res = await apiService.runTests({
      catalogueId: 'latest',
      targetApiBaseUrl,
      enableAiRepair: true
    });

    // Authoritative Bind: res.finalRun || res.summary is the FINAL post-repair execution result
    const authoritativeFinalRun = (res as any).finalRun || res.summary;
    setLatestRun(authoritativeFinalRun);
    setRunState({
      executionId: res.executionId,
      summary: authoritativeFinalRun,
      results: authoritativeFinalRun.results || res.results,
      reportLocation: res.reportLocation,
      executedAt: new Date().toISOString()
    });

    // Refetch session state to guarantee 100% synchronization across all components
    await syncState();
    setActiveTab('runner');
  };

  const selectedCount = catalogue?.entries?.filter((e) => e.selected !== false).length || 0;
  const totalCount = catalogue?.entries?.length || 0;

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        catalogueStatus={catalogue?.status}
        hasContext={!!context}
        hasCatalogue={!!catalogue}
        hasSpecs={!!generatedSpecs}
        hasRun={!!latestRun}
      />

      <div className="main-viewport">
        <Header
          projectName={context?.projectName || null}
          isLiveMongo={!context?.useMock && !context?.isAdapterMode}
          isAdapterMode={context?.useMock || context?.isAdapterMode}
          catalogueStatus={catalogue?.status || 'DRAFT'}
          selectedCount={selectedCount}
          totalCount={totalCount}
          passRatePercentage={latestRun?.passRatePercentage}
          onRefresh={syncState}
          onRequestReset={() => setIsResetModalOpen(true)}
        />

        <main className="content-area">
          {activeTab === 'dashboard' && (
            <Dashboard
              context={context}
              catalogue={catalogue}
              latestRun={latestRun}
              generatedSpecs={generatedSpecs}
              onNavigate={setActiveTab}
              onLoadMockContext={() =>
                handleLoadContext({
                  projectName: 'NexaSupply',
                  useMock: true,
                  targetApiBaseUrl: 'http://localhost:3000'
                })
              }
            />
          )}

          {activeTab === 'projects' && (
            <Projects
              currentContext={context}
              onLoadContext={handleLoadContext}
            />
          )}

          {activeTab === 'explorer' && (
            <ContextExplorer
              context={context}
              onNavigateToProjects={() => setActiveTab('projects')}
            />
          )}

          {activeTab === 'generator' && (
            <TestGenerator
              context={context}
              catalogue={catalogue}
              onBuildCatalogue={handleBuildCatalogue}
              onNavigateToCatalogue={() => setActiveTab('catalogue')}
              onNavigateToProjects={() => setActiveTab('projects')}
            />
          )}

          {activeTab === 'catalogue' && (
            <TestCatalogue
              catalogue={catalogue}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onApprove={() => handleApproveCatalogue()}
              onNavigateToGenerator={() => setActiveTab('generator')}
              onNavigateToGeneratedSpecs={() => setActiveTab('generated')}
            />
          )}

          {activeTab === 'generated' && (
            <GeneratedTests
              catalogue={catalogue}
              generatedSpecs={generatedSpecs}
              onGenerateSpecs={handleGenerateSpecs}
              onNavigateToRunner={() => setActiveTab('runner')}
              onNavigateToCatalogue={() => setActiveTab('catalogue')}
            />
          )}

          {activeTab === 'runner' && (
            <TestRun
              generatedSpecs={generatedSpecs}
              latestRun={latestRun}
              onExecuteRun={handleExecuteRun}
              onNavigateToSpecs={() => setActiveTab('generated')}
              onNavigateToReports={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              latestRun={latestRun}
              runState={runState}
              onNavigateToRunner={() => setActiveTab('runner')}
            />
          )}
        </main>
      </div>

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        isResetting={isResetting}
        onConfirmReset={handleConfirmReset}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
