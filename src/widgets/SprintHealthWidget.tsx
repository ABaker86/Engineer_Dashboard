import React from 'react';
import { WidgetProps } from '../plugins/types';
import { ShieldCheck, Zap, Users, GitPullRequest, AlertCircle } from 'lucide-react';

export const SprintHealthWidget: React.FC<WidgetProps> = () => {
  const healthFactors = [
    { label: 'PR Review Bottleneck', score: 92, status: 'Optimal', icon: GitPullRequest, note: 'Median review latency 2.8h' },
    { label: 'Scope Creep Stability', score: 88, status: 'Low Risk', icon: ShieldCheck, note: '3 unplanned points added' },
    { label: 'Team Workload Balance', score: 85, status: 'Healthy', icon: Users, note: 'No single engineer > 13 pts' },
    { label: 'CI/CD Pipeline Flakiness', score: 96, status: 'Elite', icon: Zap, note: '99.2% build reliability' },
  ];

  const overallScore = Math.round(
    healthFactors.reduce((acc, f) => acc + f.score, 0) / healthFactors.length
  );

  return (
    <div className="flex flex-col h-full p-4 select-text">
      {/* Overall Score Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Health Score</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono text-emerald-400">{overallScore} / 100</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OPTIMAL
            </span>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <span>Sprint 34 Health</span>
          <div className="font-mono text-slate-300">Target: &gt; 80</div>
        </div>
      </div>

      {/* Factor Bars */}
      <div className="flex-1 space-y-3 justify-center flex flex-col">
        {healthFactors.map((factor, i) => {
          const Icon = factor.icon;
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-300 font-medium">{factor.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">{factor.note}</span>
                  <span className="font-mono font-bold text-white text-[11px]">{factor.score}%</span>
                </div>
              </div>

              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${factor.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
