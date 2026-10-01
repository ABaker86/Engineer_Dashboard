import React, { useState } from 'react';
import { WidgetInstance } from '../types/dashboard';
import { getPlugin } from '../plugins/registry';
import { useDataSourceStore } from '../store/useDataSourceStore';
import { useDashboardStore } from '../store/useDashboardStore';
import { RefreshCw, Settings, Trash2, GripVertical, Maximize2, Minimize2, AlertCircle } from 'lucide-react';

interface WidgetContainerProps {
  widget: WidgetInstance;
  onRefresh: (widgetId: string) => void;
  onConfigure: (widget: WidgetInstance) => void;
  loading?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ widget, onRefresh, onConfigure, loading = false }) => {
  const { isEditMode, removeWidget, updateWidgetLayout, activeDashboardId } = useDashboardStore();
  const { mcpServers, restApis, databases } = useDataSourceStore();

  const plugin = getPlugin(widget.pluginId);

  // Identify connected data source label
  let sourceLabel = '';
  let sourceBadgeColor = 'bg-slate-800 text-slate-400 border-slate-700';

  if (widget.dataSourceId) {
    const mcp = mcpServers.find((s) => s.id === widget.dataSourceId);
    const rest = restApis.find((a) => a.id === widget.dataSourceId);
    const db = databases.find((d) => d.id === widget.dataSourceId);

    if (mcp) {
      sourceLabel = `MCP: ${mcp.name}`;
      sourceBadgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
    } else if (rest) {
      sourceLabel = `REST: ${rest.name}`;
      sourceBadgeColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
    } else if (db) {
      sourceLabel = `DB: ${db.name}`;
      sourceBadgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
    }
  }

  // Layout resize adjustments in Edit Mode
  const handleResize = (dw: number, dh: number) => {
    const current = widget.layout;
    const newW = Math.max(2, Math.min(12, current.w + dw));
    const newH = Math.max(2, Math.min(8, current.h + dh));
    updateWidgetLayout(activeDashboardId, widget.id, { ...current, w: newW, h: newH });
  };

  const Component = plugin?.component;

  // Calculate grid span classes for standard 12-column responsive layout
  const colSpanClass = {
    2: 'col-span-12 sm:col-span-6 lg:col-span-2',
    3: 'col-span-12 sm:col-span-6 lg:col-span-3',
    4: 'col-span-12 sm:col-span-6 lg:col-span-4',
    5: 'col-span-12 lg:col-span-5',
    6: 'col-span-12 lg:col-span-6',
    7: 'col-span-12 lg:col-span-7',
    8: 'col-span-12 lg:col-span-8',
    9: 'col-span-12 lg:col-span-9',
    10: 'col-span-12 lg:col-span-10',
    11: 'col-span-12 lg:col-span-11',
    12: 'col-span-12',
  }[widget.layout.w] || 'col-span-12 lg:col-span-6';

  const rowHeightPx = widget.layout.h * 90;

  return (
    <div
      className={`${colSpanClass} flex flex-col rounded-2xl glass-card glass-card-hover transition-all duration-200 overflow-hidden group/card relative ${
        isEditMode ? 'ring-1 ring-amber-500/40 border-amber-500/30' : ''
      }`}
      style={{ minHeight: `${rowHeightPx}px` }}
    >
      {/* Widget Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/70 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {isEditMode && (
            <div className="drag-handle text-slate-500 hover:text-amber-400 p-0.5" title="Drag to reorder">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <h3 className="text-xs font-bold text-white truncate tracking-tight">{widget.title}</h3>
          {sourceLabel && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border truncate max-w-[140px] ${sourceBadgeColor}`}>
              {sourceLabel}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-60 group-hover/card:opacity-100 transition-opacity">
          {isEditMode && (
            <div className="flex items-center gap-0.5 mr-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
              <button
                onClick={() => handleResize(-1, 0)}
                className="px-1 py-0.5 text-[10px] text-slate-400 hover:text-white"
                title="Decrease width"
              >
                -W
              </button>
              <button
                onClick={() => handleResize(1, 0)}
                className="px-1 py-0.5 text-[10px] text-slate-400 hover:text-white"
                title="Increase width"
              >
                +W
              </button>
              <span className="w-px h-3 bg-slate-700" />
              <button
                onClick={() => handleResize(0, -1)}
                className="px-1 py-0.5 text-[10px] text-slate-400 hover:text-white"
                title="Decrease height"
              >
                -H
              </button>
              <button
                onClick={() => handleResize(0, 1)}
                className="px-1 py-0.5 text-[10px] text-slate-400 hover:text-white"
                title="Increase height"
              >
                +H
              </button>
            </div>
          )}

          <button
            onClick={() => onRefresh(widget.id)}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh widget"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={() => onConfigure(widget)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Configure widget settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {isEditMode && (
            <button
              onClick={() => removeWidget(activeDashboardId, widget.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Remove widget from dashboard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Content Body */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {Component ? (
          <Component
            widget={widget}
            config={widget.config}
            data={null}
            loading={loading}
            error={null}
            onRefresh={() => onRefresh(widget.id)}
            onUpdateConfig={() => {}}
            isEditMode={isEditMode}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-slate-500 text-xs">
            <AlertCircle className="w-5 h-5 mb-1 text-amber-400" />
            Plugin '{widget.pluginId}' not found
          </div>
        )}
      </div>
    </div>
  );
};
