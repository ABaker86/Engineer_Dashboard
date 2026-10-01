import React, { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { WidgetContainer } from '../components/WidgetContainer';
import { WidgetConfigModal } from '../components/WidgetConfigModal';
import { WidgetInstance } from '../types/dashboard';
import { Plus, LayoutGrid, Info } from 'lucide-react';

interface DashboardPageProps {
  onAddWidget: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onAddWidget }) => {
  const { dashboards, activeDashboardId, isEditMode } = useDashboardStore();
  const [selectedWidgetForConfig, setSelectedWidgetForConfig] = useState<WidgetInstance | null>(null);
  const [refreshingWidgetIds, setRefreshingWidgetIds] = useState<Record<string, boolean>>({});

  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId) || dashboards[0];

  const handleRefreshWidget = (widgetId: string) => {
    setRefreshingWidgetIds((prev) => ({ ...prev, [widgetId]: true }));
    setTimeout(() => {
      setRefreshingWidgetIds((prev) => ({ ...prev, [widgetId]: false }));
    }, 600);
  };

  if (!activeDashboard) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
        No active dashboard found.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Dashboard description / banner if in edit mode */}
      {isEditMode && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              <strong>Layout Editing Active:</strong> Use the <strong>-W / +W</strong> and <strong>-H / +H</strong> buttons on cards to adjust grid sizing. Drag cards to reorder.
            </span>
          </div>
        </div>
      )}

      {/* Grid Canvas */}
      {activeDashboard.widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Your dashboard is empty</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Add modular widgets to monitor DORA delivery metrics, sprint tickets, infrastructure logs, or MCP tool agents.
          </p>
          <button
            onClick={onAddWidget}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-brand transition-all"
          >
            <Plus className="w-4 h-4" />
            Add First Widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 pb-12">
          {activeDashboard.widgets.map((widget) => (
            <WidgetContainer
              key={widget.id}
              widget={widget}
              onRefresh={handleRefreshWidget}
              onConfigure={(w) => setSelectedWidgetForConfig(w)}
              loading={refreshingWidgetIds[widget.id] || false}
            />
          ))}
        </div>
      )}

      {/* Widget Settings Modal */}
      <WidgetConfigModal
        widget={selectedWidgetForConfig}
        isOpen={!!selectedWidgetForConfig}
        onClose={() => setSelectedWidgetForConfig(null)}
      />
    </div>
  );
};
