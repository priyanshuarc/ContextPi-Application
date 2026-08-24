import React from 'react';

export type WorkflowStage =
  | 'CONTEXT'
  | 'ANALYZE'
  | 'CATALOGUE'
  | 'GENERATE'
  | 'EXECUTE'
  | 'REPORT';

interface PipelineStepProps {
  currentStage: WorkflowStage;
}

const STAGES: { key: WorkflowStage; label: string }[] = [
  { key: 'CONTEXT', label: '1 Context' },
  { key: 'ANALYZE', label: '2 Analyze' },
  { key: 'CATALOGUE', label: '3 Catalogue' },
  { key: 'GENERATE', label: '4 Generate' },
  { key: 'EXECUTE', label: '5 Execute' },
  { key: 'REPORT', label: '6 Report' }
];

export const PipelineStep: React.FC<PipelineStepProps> = ({ currentStage }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="pipeline-bar">
      {STAGES.map((stage, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <React.Fragment key={stage.key}>
            <div
              className={`pipeline-step ${isCompleted ? 'completed' : ''} ${
                isActive ? 'active' : ''
              }`}
            >
              <span className="step-num">{idx + 1}</span>
              <span>{stage.label.split(' ')[1]}</span>
            </div>
            {idx < STAGES.length - 1 && <div className="pipeline-connector" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
