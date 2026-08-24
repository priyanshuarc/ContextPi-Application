import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  accentColor
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        {Icon && <Icon className="kpi-icon" style={{ color: accentColor }} />}
      </div>
      <div className="kpi-value" style={{ color: accentColor || 'var(--text-primary)' }}>
        {value}
      </div>
      {subtitle && <div className="kpi-footer">{subtitle}</div>}
    </div>
  );
};
