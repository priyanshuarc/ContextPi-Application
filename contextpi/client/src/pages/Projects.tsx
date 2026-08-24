import React, { useState } from 'react';
import { Database, Server, Globe, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ProjectContext } from '../types/api';
import { EnvironmentBadge } from '../components/EnvironmentBadge';

interface ProjectsProps {
  currentContext: ProjectContext | null;
  onLoadContext: (config: {
    projectName: string;
    mongoUri?: string;
    databaseName?: string;
    targetApiBaseUrl?: string;
    requirement?: string;
    useMock?: boolean;
  }) => Promise<any>;
}

export const Projects: React.FC<ProjectsProps> = ({ currentContext, onLoadContext }) => {
  const [projectName, setProjectName] = useState(currentContext?.projectName || '');
  const [mongoUri, setMongoUri] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [targetApiBaseUrl, setTargetApiBaseUrl] = useState('');
  const [requirement, setRequirement] = useState('');
  const [useMock, setUseMock] = useState(
    currentContext ? !!(currentContext.useMock || currentContext.isAdapterMode) : true
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const pName = projectName.trim() || 'NexaSupply';
      const res = await onLoadContext({
        projectName: pName,
        mongoUri: useMock ? undefined : (mongoUri.trim() || 'mongodb://localhost:27017'),
        databaseName: useMock ? undefined : (databaseName.trim() || 'nexasupply_db'),
        targetApiBaseUrl: targetApiBaseUrl.trim() || 'http://localhost:3000',
        requirement,
        useMock
      });

      const loadedContext = res?.projectContext;
      const isAdapter = loadedContext?.isAdapterMode || loadedContext?.useMock || useMock;

      let toastText = `Target context for '${pName}' loaded successfully in ${
        isAdapter ? 'ADAPTER MODE' : 'LIVE MONGODB MODE'
      }.`;

      if (!useMock && isAdapter) {
        toastText = `Live MongoDB connection failed; synthetic adapter context for '${pName}' was loaded in ADAPTER MODE.`;
      }

      setMessage({
        type: !useMock && isAdapter ? 'error' : 'success',
        text: toastText
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to load project context.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Target Project & Context Connection</h2>
          <p>Configure dynamic MongoDB context extraction and target application server endpoints</p>
        </div>
        {currentContext && (
          <EnvironmentBadge
            isLiveMongo={!currentContext.useMock && !currentContext.isAdapterMode}
            isAdapterMode={currentContext.useMock || currentContext.isAdapterMode}
            projectName={currentContext.projectName}
          />
        )}
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-info' : 'alert-danger'}`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="swiss-card flex flex-col gap-4">
        <div className="swiss-card-header">
          <span className="swiss-card-title flex items-center gap-2">
            <Database size={16} className="text-cyan" /> Metadata Connection Strategy
          </span>
          <div className="flex items-center gap-3 text-xs font-mono">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="contextMode"
                checked={useMock}
                onChange={() => setUseMock(true)}
              />
              <span className="text-amber">Adapter / Synthetic Mode</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="contextMode"
                checked={!useMock}
                onChange={() => setUseMock(false)}
              />
              <span className="text-emerald">Live MongoDB Connection</span>
            </label>
          </div>
        </div>

        <div className="form-grid">
          {/* Target Project */}
          <div className="form-group">
            <label className="form-label">
              <Server size={14} /> Target Project Name
            </label>
            <input
              type="text"
              className="form-input font-mono"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. NexaSupply"
            />
            <span className="form-help">Application entity identifier (e.g. NexaSupply, ECommerceApi)</span>
          </div>

          {/* Target API Base URL */}
          <div className="form-group">
            <label className="form-label">
              <Globe size={14} /> Target Application Server Base URL
            </label>
            <input
              type="url"
              className="form-input font-mono"
              value={targetApiBaseUrl}
              onChange={(e) => setTargetApiBaseUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
            <span className="form-help">Playwright HTTP API runner target address</span>
          </div>

          {/* Database Section */}
          {!useMock ? (
            <>
              <div className="form-group">
                <label className="form-label">
                  <Database size={14} /> MongoDB Connection URI
                </label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  placeholder="mongodb://localhost:27017"
                />
                <span className="form-help">Credentials are strictly secret and never logged</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Database size={14} /> MongoDB Database Name
                </label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  placeholder="nexasupply_db"
                />
                <span className="form-help">Database containing active collection schemas</span>
              </div>
            </>
          ) : (
            <div className="form-group col-span-2">
              <div className="p-3 bg-surface-elevated rounded border border-subtle text-xs text-secondary leading-relaxed">
                <strong className="text-amber font-mono">ADAPTER / SYNTHETIC MODE:</strong> Contextπ will dynamically extract schema metadata, custom fields, and function registry rules using built-in synthetic adapter structures.
              </div>
            </div>
          )}

          <div className="form-group col-span-2">
            <label className="form-label">
              <FileText size={14} /> Business Rule Constraints & Specifications (Optional)
            </label>
            <textarea
              className="form-textarea font-mono text-xs"
              rows={3}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Enter additional business rule constraints..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-subtle">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Connecting & Loading Metadata...' : 'Connect & Load Context'}
          </button>
        </div>
      </form>
    </div>
  );
};
