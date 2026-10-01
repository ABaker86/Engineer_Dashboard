import React from 'react';
import { LayoutDashboard, Database, Settings, ShieldCheck, Activity, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDataSourceStore } from '../store/useDataSourceStore';
import { useDashboardStore } from '../store/useDashboardStore';
import { useSettingsStore } from '../store/useSettingsStore';

interface SidebarProps {
  activeView: 'dashboards' | 'data-config' | 'settings';
  onSelectView: (view: 'dashboards' | 'data-config' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onSelectView }) => {
  const { mcpServers, restApis, databases } = useDataSourceStore();
  const { dashboards } = useDashboardStore();
  const { mockDataMode, setMockDataMode } = useSettingsStore();

  const totalConnected =
    mcpServers.filter((s) => s.status === 'connected').length +
    restApis.filter((a) => a.status === 'healthy').length +
    databases.filter((d) => d.status === 'connected').length;

  const navItems = [
    {
      id: 'dashboards' as const,
      label: 'Dashboards',
      icon: LayoutDashboard,
      badge: dashboards.length,
    },
    {
      id: 'data-config' as const,
      label: 'Data Sources',
      icon: Database,
      badge: mcpServers.length + restApis.length + databases.length,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Brand & Logo Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-glow-brand shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight truncate">
                Command Center
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Engineering Manager</p>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status & Quick Controls */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {/* Mock Mode Quick Switch */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="text-[11px]">
            <span className="text-slate-300 font-medium block">Demo Mock Engine</span>
            <span className="text-[10px] text-slate-500">
              {mockDataMode ? 'Simulating live streams' : 'Live network queries'}
            </span>
          </div>
          <button
            onClick={() => setMockDataMode(!mockDataMode)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
              mockDataMode ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                mockDataMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Connectivity status pill */}
        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-emerald" />
            <span className="text-slate-300 font-medium">{totalConnected} Integrations Active</span>
          </div>
          <span className="font-mono text-emerald-400 text-[10px]">MCP & REST</span>
        </div>

        {/* Footer info */}
        <div className="px-1 text-[10px] text-slate-500 flex items-center justify-between font-mono">
          <span>Anti-Gravity v1.0</span>
          <span>Electron 33 • Node 24</span>
        </div>
      </div>
    </aside>
  );
};
