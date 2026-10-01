import React, { useState } from 'react';
import { getAllPlugins } from '../plugins/registry';
import { WidgetPlugin } from '../plugins/types';
import { X, Search, Plus, TrendingUp, BarChart2, CheckSquare, Terminal, Cpu, Database, Activity } from 'lucide-react';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (plugin: WidgetPlugin) => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const plugins = getAllPlugins();
  const categories = [
    { id: 'all', label: 'All Widgets' },
    { id: 'metrics', label: 'DORA & KPI Metrics' },
    { id: 'tracking', label: 'Sprint & Issues' },
    { id: 'infra', label: 'Infrastructure' },
    { id: 'mcp', label: 'MCP Agents' },
    { id: 'database', label: 'Database' },
  ];

  const filtered = plugins.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getPluginIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-indigo-400" />;
      case 'BarChart2': return <BarChart2 className="w-5 h-5 text-cyan-400" />;
      case 'CheckSquare': return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Database': return <Database className="w-5 h-5 text-blue-400" />;
      default: return <Activity className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Widget Catalog</h2>
            <p className="text-xs text-slate-400">Select a widget to add to your engineering dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category filter */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              autoFocus
              placeholder="Search available widgets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-glow-brand'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plugin Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.map((plugin) => (
            <div
              key={plugin.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {getPluginIcon(plugin.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {plugin.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {plugin.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{plugin.description}</p>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Default size: {plugin.defaultSize.w} cols × {plugin.defaultSize.h} rows
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAdd(plugin);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 shadow transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
