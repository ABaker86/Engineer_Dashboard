import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  Settings,
  Palette,
  Bell,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Cpu,
  ShieldAlert,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    globalRefreshInterval,
    setRefreshInterval,
    mockDataMode,
    setMockDataMode,
    notificationsEnabled,
    setNotificationsEnabled,
    alertThresholds,
    updateAlertThresholds,
    systemInfo,
    fetchSystemInfo,
    exportFullBackup,
    importFullBackup,
    resetToFactoryDefaults,
  } = useSettingsStore();

  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = async () => {
    setExportStatus('Exporting...');
    const res = await exportFullBackup();
    if (res.success) {
      setExportStatus('Configuration exported successfully!');
    } else {
      setExportStatus(res.error || 'Export failed');
    }
    setTimeout(() => setExportStatus(null), 3000);
  };

  const handleImport = async () => {
    setImportStatus('Importing...');
    const res = await importFullBackup();
    if (res.success) {
      setImportStatus('Configuration imported successfully!');
    } else {
      setImportStatus(res.error || 'Import failed');
    }
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-8 select-none">
      {/* Title */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-xl font-extrabold text-white tracking-tight">System & Application Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage local desktop preferences, data persistence, alert thresholds, and host diagnostics.
        </p>
      </div>

      {/* 1. Appearance & Theme */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Appearance & Color Theme</h3>
            <p className="text-xs text-slate-400">Select interface styling tailored for engineering leadership</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { id: 'dark', label: 'Pro Dark', desc: 'Slate default', color: 'bg-slate-900 border-slate-700' },
            { id: 'midnight', label: 'Midnight Blue', desc: 'Deep indigo', color: 'bg-slate-950 border-indigo-900' },
            { id: 'cyber', label: 'Cyber Slate', desc: 'High contrast', color: 'bg-black border-cyan-800' },
            { id: 'light', label: 'Clean Light', desc: 'Daylight mode', color: 'bg-slate-100 border-slate-300' },
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                theme === th.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-800/80 shadow-glow-brand'
                  : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-5 h-5 rounded-full border ${th.color}`} />
                {theme === th.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <span className="text-xs font-bold text-white block">{th.label}</span>
              <span className="text-[11px] text-slate-500">{th.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Real-Time Refresh & Mock Data */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Data Engine & Auto-Refresh</h3>
            <p className="text-xs text-slate-400">Configure background polling frequency and simulation modes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Mock Simulation Engine</span>
              <span className="text-[11px] text-slate-400">
                Emulates rich DORA metrics & sprint tickets when offline
              </span>
            </div>
            <button
              onClick={() => setMockDataMode(!mockDataMode)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                mockDataMode ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  mockDataMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Global Auto-Refresh Cadence</span>
              <span className="text-[11px] text-slate-400">Automatic background dashboard reloads</span>
            </div>
            <select
              value={globalRefreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value={0}>Manual Only (Off)</option>
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Alerts & Thresholds */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Engineering Alert Thresholds</h3>
            <p className="text-xs text-slate-400">Define SLA limits for triggering warnings in widgets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs text-slate-300 block mb-1">PR Review Latency Warning</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={alertThresholds.prReviewHours}
                onChange={(e) => updateAlertThresholds({ prReviewHours: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-24 font-mono"
              />
              <span className="text-xs text-slate-400">hours before flagging bottleneck</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">API P99 Latency SLA</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={alertThresholds.p99LatencyMs}
                onChange={(e) => updateAlertThresholds({ p99LatencyMs: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-24 font-mono"
              />
              <span className="text-xs text-slate-400">ms before triggering warning</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Max Error / Failure Rate</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={alertThresholds.errorRatePct}
                onChange={(e) => updateAlertThresholds({ errorRatePct: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-24 font-mono"
              />
              <span className="text-xs text-slate-400">% failure rate allowance</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Sprint Blockers Tolerance</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={alertThresholds.sprintBlockerCount}
                onChange={(e) => updateAlertThresholds({ sprintBlockerCount: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-24 font-mono"
              />
              <span className="text-xs text-slate-400">flagged impediments limit</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Configuration Backup & Export/Import */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Configuration Backup & Restore</h3>
            <p className="text-xs text-slate-400">Export or import entire dashboards, layouts, and data source bindings</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Configuration (JSON)
          </button>

          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            Import Configuration Backup
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all dashboards, data sources, and settings to factory defaults?')) {
                resetToFactoryDefaults();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Factory Reset
          </button>
        </div>

        {exportStatus && <div className="text-xs font-mono text-emerald-400">{exportStatus}</div>}
        {importStatus && <div className="text-xs font-mono text-indigo-400">{importStatus}</div>}
      </div>

      {/* 5. System Diagnostics */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-sans font-bold text-slate-200">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Host Environment Diagnostics</span>
          </div>
          <button
            onClick={fetchSystemInfo}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-sans"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Diagnostics
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">OS PLATFORM</span>
            <span className="font-bold text-white">{systemInfo?.platform || 'win32'} ({systemInfo?.arch || 'x64'})</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">NODE RUNTIME</span>
            <span className="font-bold text-emerald-400">v{systemInfo?.nodeVersion || '24.19.0'}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">ELECTRON ENGINE</span>
            <span className="font-bold text-cyan-400">v{systemInfo?.electronVersion || '33.2.0'}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">APP HEAP MEMORY</span>
            <span className="font-bold text-indigo-400">{systemInfo?.memory?.appUsed || 142} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
