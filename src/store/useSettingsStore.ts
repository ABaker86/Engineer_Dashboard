import { create } from 'zustand';
import { getElectronBridge } from '../services/electronBridge';
import { useDashboardStore } from './useDashboardStore';
import { useDataSourceStore } from './useDataSourceStore';

const bridge = getElectronBridge();

export interface AlertThresholds {
  prReviewHours: number;
  p99LatencyMs: number;
  errorRatePct: number;
  sprintBlockerCount: number;
}

interface SettingsState {
  theme: 'dark' | 'midnight' | 'cyber' | 'light';
  globalRefreshInterval: number; // in seconds, 0 = off
  mockDataMode: boolean;
  notificationsEnabled: boolean;
  alertThresholds: AlertThresholds;
  systemInfo: {
    platform: string;
    arch: string;
    nodeVersion: string;
    electronVersion: string;
    uptime: number;
    memory?: { total: number; free: number; appUsed: number };
  } | null;

  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  setTheme: (theme: 'dark' | 'midnight' | 'cyber' | 'light') => void;
  setRefreshInterval: (interval: number) => void;
  setMockDataMode: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  updateAlertThresholds: (thresholds: Partial<AlertThresholds>) => void;
  fetchSystemInfo: () => Promise<void>;
  exportFullBackup: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importFullBackup: () => Promise<{ success: boolean; error?: string }>;
  resetToFactoryDefaults: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  globalRefreshInterval: 60,
  mockDataMode: true,
  notificationsEnabled: true,
  alertThresholds: {
    prReviewHours: 24,
    p99LatencyMs: 80,
    errorRatePct: 2.0,
    sprintBlockerCount: 2,
  },
  systemInfo: null,

  loadSettings: async () => {
    try {
      const stored = await bridge.store.get<any>('app_settings', null);
      if (stored) {
        set({
          theme: stored.theme || 'dark',
          globalRefreshInterval: stored.globalRefreshInterval ?? 60,
          mockDataMode: stored.mockDataMode ?? true,
          notificationsEnabled: stored.notificationsEnabled ?? true,
          alertThresholds: stored.alertThresholds || get().alertThresholds,
        });
      }
      get().fetchSystemInfo();
    } catch {}
  },

  saveSettings: async () => {
    const { theme, globalRefreshInterval, mockDataMode, notificationsEnabled, alertThresholds } = get();
    await bridge.store.set('app_settings', {
      theme,
      globalRefreshInterval,
      mockDataMode,
      notificationsEnabled,
      alertThresholds,
    });
  },

  setTheme: (theme) => {
    set({ theme });
    // Update HTML root class
    const root = document.documentElement;
    root.classList.remove('dark', 'midnight', 'cyber', 'light');
    root.classList.add(theme === 'light' ? 'light' : 'dark');
    if (theme === 'midnight') root.classList.add('theme-midnight');
    if (theme === 'cyber') root.classList.add('theme-cyber');
    get().saveSettings();
  },

  setRefreshInterval: (interval) => {
    set({ globalRefreshInterval: interval });
    get().saveSettings();
  },

  setMockDataMode: (enabled) => {
    set({ mockDataMode: enabled });
    get().saveSettings();
  },

  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    get().saveSettings();
  },

  updateAlertThresholds: (thresholds) => {
    set((state) => ({
      alertThresholds: { ...state.alertThresholds, ...thresholds },
    }));
    get().saveSettings();
  },

  fetchSystemInfo: async () => {
    try {
      const info = await bridge.system.getInfo();
      set({ systemInfo: info });
    } catch {}
  },

  exportFullBackup: async () => {
    try {
      const backupData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        dashboards: useDashboardStore.getState().dashboards,
        mcpServers: useDataSourceStore.getState().mcpServers,
        restApis: useDataSourceStore.getState().restApis,
        databases: useDataSourceStore.getState().databases,
        settings: {
          theme: get().theme,
          globalRefreshInterval: get().globalRefreshInterval,
          mockDataMode: get().mockDataMode,
          alertThresholds: get().alertThresholds,
        },
      };
      const json = JSON.stringify(backupData, null, 2);
      return await bridge.system.exportConfig(json);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  importFullBackup: async () => {
    try {
      const res = await bridge.system.importConfig();
      if (!res.success || !res.data) {
        return { success: false, error: res.error || 'Import cancelled' };
      }
      const parsed = JSON.parse(res.data);
      if (parsed.dashboards) {
        useDashboardStore.setState({ dashboards: parsed.dashboards, activeDashboardId: parsed.dashboards[0]?.id });
        await useDashboardStore.getState().saveDashboards();
      }
      if (parsed.mcpServers || parsed.restApis || parsed.databases) {
        useDataSourceStore.setState({
          mcpServers: parsed.mcpServers || [],
          restApis: parsed.restApis || [],
          databases: parsed.databases || [],
        });
        await useDataSourceStore.getState().saveDataSources();
      }
      if (parsed.settings) {
        get().setTheme(parsed.settings.theme || 'dark');
        set({
          globalRefreshInterval: parsed.settings.globalRefreshInterval ?? 60,
          mockDataMode: parsed.settings.mockDataMode ?? true,
          alertThresholds: parsed.settings.alertThresholds || get().alertThresholds,
        });
        await get().saveSettings();
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Invalid configuration file format: ' + err.message };
    }
  },

  resetToFactoryDefaults: async () => {
    await bridge.store.clear();
    window.location.reload();
  },
}));

