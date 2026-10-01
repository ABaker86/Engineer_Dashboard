import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AddWidgetModal } from './components/AddWidgetModal';
import { DashboardPage } from './pages/DashboardPage';
import { DataConfigPage } from './pages/DataConfigPage';
import { SettingsPage } from './pages/SettingsPage';
import { useDashboardStore } from './store/useDashboardStore';
import { useDataSourceStore } from './store/useDataSourceStore';
import { useSettingsStore } from './store/useSettingsStore';
import { WidgetPlugin } from './plugins/types';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboards' | 'data-config' | 'settings'>('dashboards');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const { loadDashboards, addWidget, activeDashboardId } = useDashboardStore();
  const { loadDataSources } = useDataSourceStore();
  const { loadSettings, globalRefreshInterval } = useSettingsStore();

  // Initial load from storage / IPC
  useEffect(() => {
    loadDashboards();
    loadDataSources();
    loadSettings();
  }, []);

  // Global auto-refresh interval
  useEffect(() => {
    if (globalRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      handleRefreshAll();
    }, globalRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [globalRefreshInterval]);

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handleAddWidget = (plugin: WidgetPlugin) => {
    addWidget(activeDashboardId, {
      pluginId: plugin.id,
      title: plugin.defaultTitle,
      layout: {
        x: 0,
        y: 99, // Append to bottom
        w: plugin.defaultSize.w,
        h: plugin.defaultSize.h,
        minW: plugin.defaultSize.minW,
        minH: plugin.defaultSize.minH,
      },
      config: { ...plugin.defaultConfig },
      refreshInterval: 60,
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Left Navigation Sidebar */}
      <Sidebar activeView={activeView} onSelectView={setActiveView} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeView={activeView}
          onAddWidget={() => setIsAddModalOpen(true)}
          onRefreshAll={handleRefreshAll}
          isRefreshing={isRefreshing}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeView === 'dashboards' && <DashboardPage onAddWidget={() => setIsAddModalOpen(true)} />}
          {activeView === 'data-config' && <DataConfigPage />}
          {activeView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Widget Catalog Modal */}
      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWidget}
      />
    </div>
  );
};
