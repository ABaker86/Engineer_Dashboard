import React, { useState } from 'react';
import { WidgetInstance } from '../types/dashboard';
import { useDataSourceStore } from '../store/useDataSourceStore';
import { useDashboardStore } from '../store/useDashboardStore';
import { X, Check } from 'lucide-react';

interface WidgetConfigModalProps {
  widget: WidgetInstance | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({ widget, isOpen, onClose }) => {
  const { updateWidget, activeDashboardId } = useDashboardStore();
  const { mcpServers, restApis, databases } = useDataSourceStore();

  const [title, setTitle] = useState(widget?.title || '');
  const [dataSourceId, setDataSourceId] = useState(widget?.dataSourceId || '');
  const [refreshInterval, setRefreshInterval] = useState(widget?.refreshInterval || 60);

  React.useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setDataSourceId(widget.dataSourceId || '');
      setRefreshInterval(widget.refreshInterval || 60);
    }
  }, [widget]);

  if (!isOpen || !widget) return null;

  const handleSave = () => {
    updateWidget(activeDashboardId, widget.id, {
      title,
      dataSourceId: dataSourceId || undefined,
      refreshInterval,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Configure Widget</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Widget Display Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Connected Data Source</label>
            <select
              value={dataSourceId}
              onChange={(e) => setDataSourceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">None (Use Built-in Engine)</option>
              <optgroup label="MCP Servers">
                {mcpServers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </optgroup>
              <optgroup label="REST APIs">
                {restApis.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.status})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Databases">
                {databases.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.dbType})
                  </option>
                ))}
              </optgroup>
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Configure or test data sources in the Data Configuration view.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Auto Refresh Rate</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>Manual Only (Off)</option>
              <option value={15}>Every 15 seconds</option>
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3 bg-slate-950/60 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-brand transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
