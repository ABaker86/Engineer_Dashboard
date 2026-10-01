import React, { useState } from 'react';
import { WidgetProps } from '../plugins/types';

export const ChartAnalyticsWidget: React.FC<WidgetProps> = ({ config, data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const chartType = config.chartType || 'area';
  const preset = config.preset || 'cycle_time';

  // Area Chart Preset: PR Cycle Time vs Merged PRs
  if (chartType === 'area') {
    const cycleData = data?.points || [
      { label: 'Day 1', hours: 26, merged: 8 },
      { label: 'Day 3', hours: 24, merged: 11 },
      { label: 'Day 5', hours: 22, merged: 14 },
      { label: 'Day 7', hours: 25, merged: 9 },
      { label: 'Day 9', hours: 20, merged: 16 },
      { label: 'Day 11', hours: 19, merged: 18 },
      { label: 'Day 13', hours: 17, merged: 21 },
      { label: 'Day 14', hours: 16.5, merged: 24 },
    ];

    const maxHours = 30;
    const width = 500;
    const height = 180;
    const padX = 40;
    const padY = 25;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const step = plotW / (cycleData.length - 1);
    const coords = cycleData.map((d: any, i: number) => ({
      x: padX + i * step,
      y: padY + plotH - (d.hours / maxHours) * plotH,
      label: d.label,
      hours: d.hours,
      merged: d.merged,
    }));

    const pathD = `M ${coords.map((c: any) => `${c.x},${c.y}`).join(' L ')}`;
    const areaD = `${pathD} L ${coords[coords.length - 1].x},${padY + plotH} L ${coords[0].x},${padY + plotH} Z`;

    return (
      <div className="flex flex-col h-full p-4 select-text">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300 font-medium">Avg Cycle Time (Hours)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-medium">Merged PRs (Volume)</span>
            </div>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">14-Day Trajectory</span>
        </div>

        <div className="relative flex-1 w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padY + plotH * pct;
              const val = Math.round(maxHours * (1 - pct));
              return (
                <g key={i}>
                  <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x={padX - 8} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                    {val}h
                  </text>
                </g>
              );
            })}

            {/* Area Fill & Stroke */}
            <path d={areaD} fill="url(#areaGradient)" />
            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Bar indicators for Merged PRs on secondary axis */}
            {coords.map((c: any, i: number) => {
              const barH = (c.merged / 25) * 45;
              const isHovered = hoveredIdx === i;
              return (
                <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
                  <rect
                    x={c.x - 7}
                    y={padY + plotH - barH}
                    width={14}
                    height={barH}
                    rx={3}
                    fill={isHovered ? '#34d399' : '#10b981'}
                    opacity={isHovered ? 0.9 : 0.6}
                  />
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 5.5 : 3.5}
                    fill={isHovered ? '#ffffff' : '#818cf8'}
                    stroke="#4338ca"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                  />
                  <text x={c.x} y={height - 6} fill="#64748b" fontSize="9" textAnchor="middle">
                    {c.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredIdx !== null && coords[hoveredIdx] && (
            <div
              className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-slate-700 shadow-xl text-xs space-y-0.5"
              style={{
                left: `${(coords[hoveredIdx].x / width) * 100}%`,
                top: `${(coords[hoveredIdx].y / height) * 100 - 20}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-semibold text-white">{coords[hoveredIdx].label}</div>
              <div className="text-indigo-400 font-mono">Cycle Time: {coords[hoveredIdx].hours} hrs</div>
              <div className="text-emerald-400 font-mono">Merged PRs: {coords[hoveredIdx].merged}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Donut Chart Preset: Work Distribution Breakdown
  if (chartType === 'donut') {
    const segments = data?.segments || [
      { label: 'Feature Development', value: 52, color: '#6366f1' },
      { label: 'Technical Debt / Refactor', value: 24, color: '#06b6d4' },
      { label: 'Bug Fixes & Hotfixes', value: 16, color: '#f59e0b' },
      { label: 'Security & Compliance', value: 8, color: '#10b981' },
    ];

    const size = 150;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return (
      <div className="flex flex-col h-full p-4 select-text">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-slate-400 font-medium">Sprint Work Categorization</span>
          <span className="text-indigo-400 font-mono text-[11px]">82 Story Points</span>
        </div>

        <div className="flex items-center justify-center gap-6 flex-1">
          <div className="relative w-[150px] h-[150px] shrink-0">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
              {segments.map((seg: any, i: number) => {
                const strokeDasharray = `${(seg.value / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += (seg.value / 100) * circumference;

                return (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 hover:opacity-80"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-mono text-white">52%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Features</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {segments.map((seg: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-300 text-[11px] truncate max-w-[130px]">{seg.label}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] font-semibold">{seg.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default Bar Chart Preset: Sprint Velocity History
  const barData = data?.sprints || [
    { sprint: 'S-30', committed: 65, delivered: 62 },
    { sprint: 'S-31', committed: 70, delivered: 68 },
    { sprint: 'S-32', committed: 75, delivered: 74 },
    { sprint: 'S-33', committed: 80, delivered: 79 },
    { sprint: 'S-34', committed: 82, delivered: 68 }, // in progress
  ];

  return (
    <div className="flex flex-col h-full p-4 select-text">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
            <span className="text-slate-300 font-medium">Delivered Points</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 border border-slate-600" />
            <span className="text-slate-300 font-medium">Committed Target</span>
          </div>
        </div>
        <span className="text-emerald-400 text-[11px] font-mono font-semibold">+6.2% Velocity</span>
      </div>

      <div className="flex items-end justify-between gap-3 flex-1 pb-2">
        {barData.map((d: any, i: number) => {
          const maxVal = 90;
          const delH = (d.delivered / maxVal) * 100;
          const comH = (d.committed / maxVal) * 100;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="relative w-full max-w-[42px] h-[120px] flex items-end justify-center gap-1 bg-slate-900/40 rounded p-1 border border-slate-800/40">
                <div
                  className="w-1/2 bg-slate-700/80 rounded-t group-hover:bg-slate-600 transition-colors"
                  style={{ height: `${comH}%` }}
                  title={`Committed: ${d.committed} pts`}
                />
                <div
                  className="w-1/2 bg-indigo-500 rounded-t shadow-glow-brand group-hover:bg-indigo-400 transition-colors"
                  style={{ height: `${delH}%` }}
                  title={`Delivered: ${d.delivered} pts`}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
                {d.sprint}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
