import React, { useState } from 'react';
import { Code2, Layers, Table, ChevronDown, ChevronRight } from 'lucide-react';
import type { ProjectContext, SchemaContext, FunctionContext } from '../types/api';
import { EmptyState } from '../components/EmptyState';

interface ContextExplorerProps {
  context: ProjectContext | null;
  onNavigateToProjects: () => void;
}

export const ContextExplorer: React.FC<ContextExplorerProps> = ({
  context,
  onNavigateToProjects
}) => {
  if (!context || (!context.schemas.length && !(context.functions || context.customFunctions || []).length)) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h2>Context Metadata Explorer</h2>
            <p>Developer inspection tool for target application MongoDB schemas and custom function definitions</p>
          </div>
        </div>
        <EmptyState
          title="NO TARGET APPLICATION CONTEXT CONNECTED"
          description="Connect a target project context or load synthetic adapter context to inspect schemas, field rules, and custom function parameters."
          actionText="Connect Target Project"
          onAction={onNavigateToProjects}
        />
      </div>
    );
  }

  const functionsList = context.functions || context.customFunctions || [];
  const [selectedType, setSelectedType] = useState<'schema' | 'function'>('schema');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSeedRecords, setShowSeedRecords] = useState(false);

  const activeSchema: SchemaContext | undefined =
    selectedType === 'schema' ? context.schemas[selectedIndex] : undefined;

  const activeFunction: FunctionContext | undefined =
    selectedType === 'function' ? functionsList[selectedIndex] : undefined;

  const filteredFields = activeSchema?.fields.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.dataType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Context Metadata Explorer</h2>
          <p>Inspecting dynamic application metadata for {context.projectName}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ gridTemplateColumns: '260px 1fr' }}>
        {/* Left Navigator Panel */}
        <div className="swiss-card flex flex-col gap-3">
          <div className="sidebar-section-label">Form Schemas ({context.schemas.length})</div>
          <div className="flex flex-col gap-1">
            {context.schemas.map((schema, idx) => (
              <button
                key={schema.schemaName}
                className={`nav-item ${
                  selectedType === 'schema' && selectedIndex === idx ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedType('schema');
                  setSelectedIndex(idx);
                }}
              >
                <Table size={14} />
                <span className="font-mono">{schema.schemaName}</span>
                <span className="nav-badge-pill bg-surface-elevated text-muted ml-auto">
                  {schema.fields.length}f
                </span>
              </button>
            ))}
          </div>

          {functionsList.length > 0 && (
            <>
              <div className="sidebar-section-label mt-2">Custom Functions ({functionsList.length})</div>
              <div className="flex flex-col gap-1">
                {functionsList.map((fn, idx) => (
                  <button
                    key={fn.name || fn.functionName || idx}
                    className={`nav-item ${
                      selectedType === 'function' && selectedIndex === idx ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedType('function');
                      setSelectedIndex(idx);
                    }}
                  >
                    <Code2 size={14} />
                    <span className="font-mono">{fn.name || fn.functionName}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Details Panel */}
        <div className="flex flex-col gap-4">
          {selectedType === 'schema' && activeSchema ? (
            <>
              <div className="swiss-card">
                <div className="swiss-card-header">
                  <div>
                    <span className="swiss-card-title font-mono text-cyan text-base">
                      {activeSchema.schemaName}
                    </span>
                    <span className="text-xs text-muted block mt-0.5">
                      Collection: {activeSchema.collectionName || activeSchema.schemaName} • {activeSchema.fields.length} Defined Fields
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="form-group mb-0" style={{ width: '220px' }}>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          className="form-input text-xs pl-7"
                          placeholder="Filter fields..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Density Field Table */}
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Field Name</th>
                        <th>Data Type</th>
                        <th>Required</th>
                        <th>Input Control</th>
                        <th>Default</th>
                        <th>Enum Options</th>
                        <th>Relationship / Foreign Key</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFields && filteredFields.length > 0 ? (
                        filteredFields.map((field) => (
                          <tr key={field.name}>
                            <td className="font-mono font-bold text-primary">{field.name}</td>
                            <td>
                              <span className="font-mono text-cyan text-xs">{field.dataType}</span>
                            </td>
                            <td>
                              {field.mandatoryField || field.required ? (
                                <span className="mode-badge disconnected text-xs">REQUIRED</span>
                              ) : (
                                <span className="text-muted text-xs">OPTIONAL</span>
                              )}
                            </td>
                            <td className="font-mono text-xs">{field.inputType}</td>
                            <td className="font-mono text-xs text-muted">
                              {field.defaultValue !== undefined ? String(field.defaultValue) : '—'}
                            </td>
                            <td className="font-mono text-xs text-secondary">
                              {(field.enum || field.enumOptions)?.join(', ') || '—'}
                            </td>
                            <td className="font-mono text-xs text-indigo">
                              {field.foreignKey
                                ? `${field.foreignKey.targetEntity}.${field.foreignKey.targetField}`
                                : '—'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center text-muted py-4">
                            No matching fields found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Collapsible Sample Records Panel */}
              {activeSchema.sampleRecords && activeSchema.sampleRecords.length > 0 && (
                <div className="swiss-card">
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => setShowSeedRecords(!showSeedRecords)}
                  >
                    <span className="swiss-card-title text-xs uppercase text-muted flex items-center gap-2">
                      <Layers size={14} /> Sample Seed Data Records ({activeSchema.sampleRecords.length} Items)
                    </span>
                    {showSeedRecords ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {showSeedRecords && (
                    <div className="mt-3 pt-3 border-t border-subtle">
                      <pre className="code-block text-xs">
                        {JSON.stringify(activeSchema.sampleRecords, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : selectedType === 'function' && activeFunction ? (
            <div className="swiss-card flex flex-col gap-4">
              <div className="swiss-card-header">
                <div>
                  <span className="swiss-card-title font-mono text-emerald text-base">
                    fn: {activeFunction.name || activeFunction.functionName}
                  </span>
                  <p className="text-xs text-muted mt-1">
                    {activeFunction.description || 'Custom business logic function definition'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Parameters */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted mb-2">Structured Input Parameters</h4>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Type</th>
                          <th>Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeFunction.parameters.map((param) => (
                          <tr key={param.name}>
                            <td className="font-mono font-bold text-primary">{param.name}</td>
                            <td className="font-mono text-cyan">{param.type}</td>
                            <td>
                              {param.required ? (
                                <span className="mode-badge disconnected text-xs">YES</span>
                              ) : (
                                <span className="text-muted text-xs">NO</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Expected Response Fields */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted mb-2">Expected Response Schema</h4>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Field Name</th>
                          <th>Expected Type</th>
                          <th>Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeFunction.expectedResponseFields.map((rf) => (
                          <tr key={rf.name}>
                            <td className="font-mono font-bold text-emerald">{rf.name}</td>
                            <td className="font-mono text-cyan">{rf.type}</td>
                            <td>
                              {rf.required ? (
                                <span className="mode-badge live text-xs">YES</span>
                              ) : (
                                <span className="text-muted text-xs">NO</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
