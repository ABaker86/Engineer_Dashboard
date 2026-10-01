import React from 'react';
import { WidgetProps } from '../plugins/types';
import { MetricKpi } from '../types/dashboard';
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export const MetricCardWidget: React.FC<WidgetProps> = ({ config, data }) => {
  // Use data if provided by fetcher, else fallback to config
  const metric: MetricKpi = data || {
    id: 'sample',
    label: config.label || 'Metric',
    value: config.value || '0',
    unit: config.unit || '',
    trend: config.trend || 'neutral',
    changePct: config.changePct ?? 0,
    target: config.target,
    status: config.status || 'good',
    comparisonLabel: config.comparisonLabel || 'vs previous period',
    sparkline: config.sparkline || [10, 15, 12, 18, 16, 22, 25],
  };

  const isPositiveTrend = metric.trend === 'up';
  const isNeutral = metric.trend === 'neutral';

  // Status colors
  const statusStyles = {
    good: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    neutral: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  }[metric.status || 'good'];

  // Generate SVG sparkline path
  const points = metric.sparkline && metric.sparkline.length > 1 ? metric.sparkline : [10, 20];
  const min = Math.min(...points);
  const max = Math.max(...points) || 1;
  const range = max - min === 0 ? 1 : max - min;
  const width = 120;
  const height = 36;
  const step = width / (points.length - 1);

  const pathPoints = points.map((p, idx) => {
    const x = idx * step;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const pathD = `M ${pathPoints.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="flex flex-col justify-between h-full p-4 select-text">
      {/* Top row: Label & Target */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
          {metric.label}
        </span>
        {metric.target && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 shrink-0">
            Target: {metric.target}
          </span>
        )}
      </div>

      {/* Middle row: Large Value & Sparkline */}
      <div className="flex items-baseline justify-between my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {metric.value}
          </span>
        </div>

        {/* Sparkline chart */}
        <div className="w-[120px] h-[36px] overflow-hidden opacity-85 hover:opacity-100 transition-opacity">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${config.metricKey || 'card'}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad-${config.metricKey || 'card'})`} />
            <path
              d={pathD}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom row: Trend badge & context description */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold border ${statusStyles}`}>
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositiveTrend ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {metric.changePct > 0 ? `+${metric.changePct}%` : `${metric.changePct}%`}
          </span>
          <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
            {metric.comparisonLabel}
          </span>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${
              metric.status === 'good'
                ? 'bg-emerald-400 shadow-glow-emerald'
                : metric.status === 'warning'
                ? 'bg-amber-400 shadow-amber-500/50'
                : 'bg-rose-400 shadow-glow-rose'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
