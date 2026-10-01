import React, { useState } from 'react';
import { Plus, RefreshCw, Lock, Unlock, Calendar, MoreVertical, Edit2, Trash2, Copy } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';

interface HeaderProps {
  activeView: 'dashboards' | 'data-config' | 'settings';
  onAddWidget: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onAddWidget, onRefreshAll, isRefreshing }) => {
  const {
    dashboards,
    activeDashboardId,
    setActiveDashboard,
    createDashboard,
    renameDashboard,
    deleteDashboard,
    duplicateDashboard,
    isEditMode,
    toggleEditMode,
    selectedDateRange,
    setSelectedDateRange,
  } = useDashboardStore();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [editingDashId, setEditingDashId] = useState<string | null>(null);
  const [editDashName, setEditDashName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId) || dashboards[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDashName.trim()) return;
    createDashboard(newDashName.trim());
    setNewDashName('');
    setIsCreatingNew(false);
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editDashName.trim()) return;
    renameDashboard(id, editDashName.trim());
    setEditingDashId(null);
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shrink-0 select-none">
      {/* Left side: View title or Dashboard tabs */}
      <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-[65%]">
        {activeView === 'dashboards' ? (
          <div className="flex items-center gap-1.5">
            {dashboards.map((dash) => {
              const isActive = dash.id === activeDashboardId;
              const isRenaming = editingDashId === dash.id;

              return (
                <div key={dash.id} className="relative group">
                  {isRenaming ? (
                    <form onSubmit={(e) => handleRenameSubmit(e, dash.id)} className="flex items-center">
                      <input
                        type="text"
                        autoFocus
                        value={editDashName}
                        onChange={(e) => setEditDashName(e.target.value)}
                        onBlur={() => setEditingDashId(null)}
                        className="bg-slate-800 text-xs px-3 py-1.5 rounded-xl border border-indigo-500 text-white focus:outline-none"
                      />
                    </form>
                  ) : (
                    <div
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                      onClick={() => setActiveDashboard(dash.id)}
                    >
                      <span>{dash.name}</span>

                      {/* Dropdown context options for this tab */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === dash.id ? null : dash.id);
                        }}
                        className="text-slate-500 hover:text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Context menu popup */}
                  {menuOpenId === dash.id && (
                    <div
                      className="absolute left-0 top-full mt-1.5 w-36 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 z-50 text-xs text-slate-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingDashId(dash.id);
                          setEditDashName(dash.name);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-white text-left"
                      >
                        <Edit2 className="w-3 h-3" /> Rename
                      </button>
                      <button
                        onClick={() => {
                          duplicateDashboard(dash.id);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 hover:text-white text-left"
                      >
                        <Copy className="w-3 h-3" /> Duplicate
                      </button>
                      {dashboards.length > 1 && (
                        <button
                          onClick={() => {
                            deleteDashboard(dash.id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-rose-500/20 text-rose-400 text-left"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* + Add New Dashboard Tab */}
            {isCreatingNew ? (
              <form onSubmit={handleCreateSubmit} className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  placeholder="Dashboard name..."
                  value={newDashName}
                  onChange={(e) => setNewDashName(e.target.value)}
                  onBlur={() => setIsCreatingNew(false)}
                  className="bg-slate-800 text-xs px-3 py-1.5 rounded-xl border border-indigo-500 text-white focus:outline-none w-36"
                />
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Create New Custom Dashboard"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <h2 className="text-sm font-bold text-white tracking-tight">
            {activeView === 'data-config' ? 'Data Sources & Integration Hub' : 'System & Application Settings'}
          </h2>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5">
        {activeView === 'dashboards' && (
          <>
            {/* Global Date Range selector */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="current_sprint" className="bg-slate-900">Current Sprint (Sprint 34)</option>
                <option value="last_7_days" className="bg-slate-900">Last 7 Days</option>
                <option value="last_14_days" className="bg-slate-900">Last 14 Days</option>
                <option value="last_30_days" className="bg-slate-900">Last 30 Days</option>
              </select>
            </div>

            {/* Layout Edit Mode toggle */}
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isEditMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
              title={isEditMode ? 'Finish arranging layout' : 'Customize widget grid & layout'}
            >
              {isEditMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isEditMode ? 'Layout Active' : 'Lock Layout'}</span>
            </button>

            {/* Add Widget button */}
            <button
              onClick={onAddWidget}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-brand transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Widget</span>
            </button>

            {/* Refresh All button */}
            <button
              onClick={onRefreshAll}
              disabled={isRefreshing}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
              title="Refresh all widgets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
