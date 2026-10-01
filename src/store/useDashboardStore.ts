import { create } from 'zustand';
import { Dashboard, WidgetInstance, WidgetLayout } from '../types/dashboard';
import { getElectronBridge } from '../services/electronBridge';

const bridge = getElectronBridge();

const DEFAULT_DASHBOARDS: Dashboard[] = [
  {
    id: 'dashboard-engineering-metrics',
    name: 'Engineering Metrics',
    description: 'DORA delivery metrics, code review turnaround, deployment cadence, and reliability health',
    icon: 'Activity',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      {
        id: 'w-metric-cycle-time',
        pluginId: 'metric-card',
        title: 'PR Cycle Time',
        layout: { x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        config: {
          metricKey: 'pr_cycle_time',
          label: 'PR Turnaround',
          value: '18.4 hrs',
          unit: 'hours',
          changePct: -14.2,
          trend: 'down',
          target: '< 24 hrs',
          status: 'good',
          comparisonLabel: 'vs prior 14 days',
          sparkline: [26, 24, 25, 21, 22, 19, 18.4],
        },
        dataSourceId: 'mcp-github',
      },
      {
        id: 'w-metric-deploy-freq',
        pluginId: 'metric-card',
        title: 'Deployment Cadence',
        layout: { x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        config: {
          metricKey: 'deploy_frequency',
          label: 'Production Deploys',
          value: '4.6 / day',
          unit: 'deploys',
          changePct: 21.0,
          trend: 'up',
          target: '> 3.0 / day',
          status: 'good',
          comparisonLabel: 'vs last sprint',
          sparkline: [2.8, 3.2, 3.5, 4.0, 3.8, 4.4, 4.6],
        },
        dataSourceId: 'rest-github',
      },
      {
        id: 'w-metric-mttr',
        pluginId: 'metric-card',
        title: 'Mean Time to Recovery',
        layout: { x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        config: {
          metricKey: 'mttr',
          label: 'MTTR',
          value: '22 mins',
          unit: 'mins',
          changePct: -36.5,
          trend: 'down',
          target: '< 45 mins',
          status: 'good',
          comparisonLabel: 'vs 30d avg',
          sparkline: [58, 42, 36, 40, 30, 26, 22],
        },
        dataSourceId: 'rest-datadog',
      },
      {
        id: 'w-metric-cfr',
        pluginId: 'metric-card',
        title: 'Change Failure Rate',
        layout: { x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        config: {
          metricKey: 'cfr',
          label: 'Rollback / Defect Rate',
          value: '1.2%',
          unit: '%',
          changePct: -0.6,
          trend: 'down',
          target: '< 3.0%',
          status: 'good',
          comparisonLabel: '4 rollbacks in 328 deploys',
          sparkline: [2.4, 2.1, 1.9, 1.6, 1.4, 1.3, 1.2],
        },
        dataSourceId: 'db-postgres',
      },
      {
        id: 'w-chart-pr-cycle',
        pluginId: 'chart-analytics',
        title: 'PR Cycle Time & Review Velocity',
        layout: { x: 0, y: 2, w: 7, h: 4, minW: 4, minH: 3 },
        config: {
          chartType: 'area',
          preset: 'cycle_time',
          xAxisLabel: 'Sprint Days',
          yAxisLabel: 'Hours',
        },
        dataSourceId: 'mcp-github',
      },
      {
        id: 'w-sprint-health',
        pluginId: 'sprint-health',
        title: 'Engineering Health Radar',
        layout: { x: 7, y: 2, w: 5, h: 4, minW: 4, minH: 3 },
        config: {},
        dataSourceId: 'db-postgres',
      },
    ],
  },
  {
    id: 'dashboard-sprint-tracker',
    name: 'Jira & Linear Sprint Tracker',
    description: 'Real-time sprint progress, story point burnup, ticket blockers, and engineering capacity',
    icon: 'CheckSquare',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      {
        id: 'w-sprint-progress-kpi',
        pluginId: 'metric-card',
        title: 'Sprint 34 Completion',
        layout: { x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
        config: {
          metricKey: 'sprint_completion',
          label: 'Delivered vs Committed',
          value: '68 / 82 pts',
          unit: 'points',
          changePct: 82.9,
          trend: 'up',
          target: '82 pts committed',
          status: 'good',
          comparisonLabel: '4 days remaining in sprint',
          sparkline: [12, 24, 38, 46, 54, 62, 68],
        },
        dataSourceId: 'mcp-linear',
      },
      {
        id: 'w-sprint-blockers-kpi',
        pluginId: 'metric-card',
        title: 'Flagged Blockers',
        layout: { x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
        config: {
          metricKey: 'blockers',
          label: 'Impediments',
          value: '1 Active',
          unit: 'issue',
          changePct: -66.0,
          trend: 'down',
          target: '0 blockers',
          status: 'warning',
          comparisonLabel: 'ENG-408: Third-party Webhook rate limit',
          sparkline: [3, 4, 3, 2, 2, 1, 1],
        },
        dataSourceId: 'mcp-linear',
      },
      {
        id: 'w-sprint-velocity-kpi',
        pluginId: 'metric-card',
        title: 'Team Velocity (3-Sprint Avg)',
        layout: { x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
        config: {
          metricKey: 'avg_velocity',
          label: 'Story Points / Sprint',
          value: '78.5 pts',
          unit: 'pts',
          changePct: 6.2,
          trend: 'up',
          target: '75 pts baseline',
          status: 'good',
          comparisonLabel: 'Predictability index: 94%',
          sparkline: [68, 71, 74, 76, 75, 78, 78.5],
        },
        dataSourceId: 'db-postgres',
      },
      {
        id: 'w-issue-list-grid',
        pluginId: 'issue-tracker',
        title: 'Active Sprint Tickets (Jira & Linear Sync)',
        layout: { x: 0, y: 2, w: 8, h: 5, minW: 6, minH: 4 },
        config: {
          sprintFilter: 'current',
          statusFilter: 'all',
          priorityFilter: 'all',
        },
        dataSourceId: 'mcp-linear',
      },
      {
        id: 'w-work-distribution-chart',
        pluginId: 'chart-analytics',
        title: 'Work Distribution Breakdown',
        layout: { x: 8, y: 2, w: 4, h: 5, minW: 3, minH: 4 },
        config: {
          chartType: 'donut',
          preset: 'work_distribution',
        },
        dataSourceId: 'db-postgres',
      },
    ],
  },
  {
    id: 'dashboard-infra-health',
    name: 'Infrastructure & MCP Health',
    description: 'Container clusters, microservice logs, active alerts, and direct MCP tool executions',
    icon: 'Server',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      {
        id: 'w-infra-availability-kpi',
        pluginId: 'metric-card',
        title: 'Production Availability (30d)',
        layout: { x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
        config: {
          label: 'Multi-Region SLA',
          value: '99.98%',
          unit: '%',
          changePct: 0.04,
          trend: 'up',
          target: '99.95% target',
          status: 'good',
          comparisonLabel: 'Error budget remaining: 78%',
          sparkline: [99.91, 99.94, 99.95, 99.97, 99.98, 99.98, 99.98],
        },
        dataSourceId: 'rest-datadog',
      },
      {
        id: 'w-infra-p99-kpi',
        pluginId: 'metric-card',
        title: 'API P99 Latency',
        layout: { x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
        config: {
          label: 'Edge Gateway Latency',
          value: '38.4 ms',
          unit: 'ms',
          changePct: -18.2,
          trend: 'down',
          target: '< 60 ms',
          status: 'good',
          comparisonLabel: 'Peak: 52ms during 10k rps',
          sparkline: [62, 54, 48, 44, 41, 39, 38.4],
        },
        dataSourceId: 'rest-datadog',
      },
      {
        id: 'w-infra-incidents-kpi',
        pluginId: 'metric-card',
        title: 'Active Incidents',
        layout: { x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
        config: {
          label: 'P1 / P2 Sev Alerts',
          value: '0 Active',
          unit: 'alerts',
          changePct: 0,
          trend: 'neutral',
          target: '0 alerts',
          status: 'good',
          comparisonLabel: 'Last incident resolved 18 days ago',
          sparkline: [1, 0, 0, 1, 0, 0, 0],
        },
        dataSourceId: 'mcp-infra',
      },
      {
        id: 'w-infra-logs-stream',
        pluginId: 'infra-logs',
        title: 'Streaming Microservice Logs',
        layout: { x: 0, y: 2, w: 7, h: 5, minW: 5, minH: 4 },
        config: {
          defaultLevel: 'ALL',
          service: 'all',
          autoScroll: true,
        },
        dataSourceId: 'mcp-infra',
      },
      {
        id: 'w-mcp-tool-console',
        pluginId: 'mcp-runner',
        title: 'MCP Command & Tool Runner',
        layout: { x: 7, y: 2, w: 5, h: 5, minW: 4, minH: 4 },
        config: {
          defaultServerId: 'mcp-infra',
        },
        dataSourceId: 'mcp-infra',
      },
    ],
  },
];

interface DashboardState {
  dashboards: Dashboard[];
  activeDashboardId: string;
  isEditMode: boolean;
  selectedDateRange: string;
  isLoading: boolean;

  loadDashboards: () => Promise<void>;
  saveDashboards: () => Promise<void>;
  setActiveDashboard: (id: string) => void;
  toggleEditMode: () => void;
  setSelectedDateRange: (range: string) => void;

  createDashboard: (name: string, description?: string, icon?: string) => Promise<string>;
  renameDashboard: (id: string, name: string, description?: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  duplicateDashboard: (id: string) => Promise<string>;

  addWidget: (dashboardId: string, widget: Omit<WidgetInstance, 'id'>) => Promise<string>;
  updateWidget: (dashboardId: string, widgetId: string, updates: Partial<WidgetInstance>) => Promise<void>;
  updateWidgetLayout: (dashboardId: string, widgetId: string, layout: WidgetLayout) => Promise<void>;
  removeWidget: (dashboardId: string, widgetId: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: DEFAULT_DASHBOARDS,
  activeDashboardId: DEFAULT_DASHBOARDS[0].id,
  isEditMode: false,
  selectedDateRange: 'current_sprint',
  isLoading: false,

  loadDashboards: async () => {
    set({ isLoading: true });
    try {
      const stored = await bridge.store.get('user_dashboards', DEFAULT_DASHBOARDS);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        set({
          dashboards: stored,
          activeDashboardId: stored[0].id,
          isLoading: false,
        });
      } else {
        set({ dashboards: DEFAULT_DASHBOARDS, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  saveDashboards: async () => {
    const { dashboards } = get();
    await bridge.store.set('user_dashboards', dashboards);
  },

  setActiveDashboard: (id) => set({ activeDashboardId: id }),
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  setSelectedDateRange: (range) => set({ selectedDateRange: range }),

  createDashboard: async (name, description = '', icon = 'LayoutDashboard') => {
    const newId = `dash-${Date.now()}`;
    const newDash: Dashboard = {
      id: newId,
      name,
      description,
      icon,
      widgets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...get().dashboards, newDash];
    set({ dashboards: updated, activeDashboardId: newId });
    await get().saveDashboards();
    return newId;
  },

  renameDashboard: async (id, name, description) => {
    const updated = get().dashboards.map((d) =>
      d.id === id ? { ...d, name, description: description !== undefined ? description : d.description, updatedAt: new Date().toISOString() } : d
    );
    set({ dashboards: updated });
    await get().saveDashboards();
  },

  deleteDashboard: async (id) => {
    const remaining = get().dashboards.filter((d) => d.id !== id);
    if (remaining.length === 0) return; // Keep at least one dashboard
    const nextActive = get().activeDashboardId === id ? remaining[0].id : get().activeDashboardId;
    set({ dashboards: remaining, activeDashboardId: nextActive });
    await get().saveDashboards();
  },

  duplicateDashboard: async (id) => {
    const existing = get().dashboards.find((d) => d.id === id);
    if (!existing) return id;
    const newId = `dash-${Date.now()}`;
    const copy: Dashboard = {
      ...existing,
      id: newId,
      name: `${existing.name} (Copy)`,
      widgets: existing.widgets.map((w) => ({ ...w, id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...get().dashboards, copy];
    set({ dashboards: updated, activeDashboardId: newId });
    await get().saveDashboards();
    return newId;
  },

  addWidget: async (dashboardId, widgetData) => {
    const widgetId = `w-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newWidget: WidgetInstance = {
      ...widgetData,
      id: widgetId,
    };
    const updated = get().dashboards.map((d) =>
      d.id === dashboardId ? { ...d, widgets: [...d.widgets, newWidget], updatedAt: new Date().toISOString() } : d
    );
    set({ dashboards: updated });
    await get().saveDashboards();
    return widgetId;
  },

  updateWidget: async (dashboardId, widgetId, updates) => {
    const updated = get().dashboards.map((d) => {
      if (d.id !== dashboardId) return d;
      return {
        ...d,
        widgets: d.widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)),
        updatedAt: new Date().toISOString(),
      };
    });
    set({ dashboards: updated });
    await get().saveDashboards();
  },

  updateWidgetLayout: async (dashboardId, widgetId, layout) => {
    const updated = get().dashboards.map((d) => {
      if (d.id !== dashboardId) return d;
      return {
        ...d,
        widgets: d.widgets.map((w) => (w.id === widgetId ? { ...w, layout } : w)),
        updatedAt: new Date().toISOString(),
      };
    });
    set({ dashboards: updated });
    await get().saveDashboards();
  },

  removeWidget: async (dashboardId, widgetId) => {
    const updated = get().dashboards.map((d) => {
      if (d.id !== dashboardId) return d;
      return {
        ...d,
        widgets: d.widgets.filter((w) => w.id !== widgetId),
        updatedAt: new Date().toISOString(),
      };
    });
    set({ dashboards: updated });
    await get().saveDashboards();
  },
}));
