import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Search,
  Cpu,
  FileCheck,
  Code2,
  PlaySquare,
  BarChart3,
  Settings as SettingsIcon
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'projects'
  | 'explorer'
  | 'generator'
  | 'catalogue'
  | 'generated'
  | 'runner'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  catalogueStatus?: 'DRAFT' | 'APPROVED';
  hasContext?: boolean;
  hasCatalogue?: boolean;
  hasSpecs?: boolean;
  hasRun?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  catalogueStatus,
  hasContext = true,
  hasCatalogue = true,
  hasSpecs = true,
  hasRun = true
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box">π</div>
        <div className="brand-title-group">
          <h2>Contextπ</h2>
          <div className="brand-subtitle">T31 · PS10 GOVERNANCE</div>
        </div>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-section-group">
          <div className="sidebar-section-label">Core Pipeline</div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              <LayoutDashboard className="nav-icon" />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => onTabChange('projects')}
            >
              <FolderKanban className="nav-icon" />
              <span>Projects</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'explorer' ? 'active' : ''} ${!hasContext ? 'disabled' : ''}`}
              onClick={() => hasContext && onTabChange('explorer')}
              title={!hasContext ? 'Load project context first' : ''}
            >
              <Search className="nav-icon" />
              <span>Context Explorer</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'generator' ? 'active' : ''} ${!hasContext ? 'disabled' : ''}`}
              onClick={() => hasContext && onTabChange('generator')}
              title={!hasContext ? 'Load project context first' : ''}
            >
              <Cpu className="nav-icon" />
              <span>Test Generator</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'catalogue' ? 'active' : ''} ${!hasCatalogue ? 'disabled' : ''}`}
              onClick={() => hasCatalogue && onTabChange('catalogue')}
              title={!hasCatalogue ? 'Generate catalogue first' : ''}
            >
              <FileCheck className="nav-icon" />
              <span>Test Catalogue</span>
              {catalogueStatus && (
                <span
                  className={`nav-badge-pill ${
                    catalogueStatus === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {catalogueStatus}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="sidebar-section-group">
          <div className="sidebar-section-label">Execution & Audit</div>
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'generated' ? 'active' : ''} ${!hasSpecs ? 'disabled' : ''}`}
              onClick={() => hasSpecs && onTabChange('generated')}
              title={!hasSpecs ? 'Generate Playwright specs first' : ''}
            >
              <Code2 className="nav-icon" />
              <span>Generated Tests</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'runner' ? 'active' : ''} ${!hasSpecs ? 'disabled' : ''}`}
              onClick={() => hasSpecs && onTabChange('runner')}
              title={!hasSpecs ? 'Generate specs first' : ''}
            >
              <PlaySquare className="nav-icon" />
              <span>Test Runs</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''} ${!hasRun ? 'disabled' : ''}`}
              onClick={() => hasRun && onTabChange('reports')}
              title={!hasRun ? 'Execute test suite first' : ''}
            >
              <BarChart3 className="nav-icon" />
              <span>Reports</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => onTabChange('settings')}
            >
              <SettingsIcon className="nav-icon" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <div>Contextπ Engine v1.0.0</div>
        <div className="font-mono text-xs">Deterministic • Dynamic MongoDB</div>
      </div>
    </aside>
  );
};
