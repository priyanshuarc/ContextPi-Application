import React from 'react';

interface EnvironmentBadgeProps {
  isLiveMongo?: boolean;
  isAdapterMode?: boolean;
  isApiConnected?: boolean;
  projectName?: string | null;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({
  isLiveMongo,
  isAdapterMode,
  isApiConnected = true,
  projectName
}) => {
  if (!projectName) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div className="mode-badge disconnected" title="No Target Project Loaded">
          <span className="mode-dot" />
          <span>NOT CONNECTED</span>
        </div>
        <div className="mode-badge disconnected" title="Target API Unconfigured">
          <span className="mode-dot" />
          <span>API UNCONFIGURED</span>
        </div>
      </div>
    );
  }

  let mongoStatusClass = 'adapter';
  let mongoText = 'ADAPTER / SYNTHETIC';

  if (isLiveMongo) {
    mongoStatusClass = 'live';
    mongoText = 'LIVE MONGODB';
  } else if (isAdapterMode) {
    mongoStatusClass = 'adapter';
    mongoText = 'ADAPTER MODE';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div className={`mode-badge ${mongoStatusClass}`} title={`Active Context Mode for ${projectName}`}>
        <span className="mode-dot" />
        <span>{mongoText}</span>
      </div>

      <div className={`mode-badge ${isApiConnected ? 'live' : 'disconnected'}`} title="Target API Connection Status">
        <span className="mode-dot" />
        <span>{isApiConnected ? 'API CONNECTED' : 'API DISCONNECTED'}</span>
      </div>
    </div>
  );
};
