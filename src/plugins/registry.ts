import { WidgetPlugin } from './types';
import { MetricCardWidget } from '../widgets/MetricCardWidget';
import { ChartAnalyticsWidget } from '../widgets/ChartAnalyticsWidget';
import { IssueTrackerWidget } from '../widgets/IssueTrackerWidget';
import { InfraLogsWidget } from '../widgets/InfraLogsWidget';
import { McpRunnerWidget } from '../widgets/McpRunnerWidget';
import { DatabaseQueryWidget } from '../widgets/DatabaseQueryWidget';
import { SprintHealthWidget } from '../widgets/SprintHealthWidget';

const pluginRegistry: Map<string, WidgetPlugin> = new Map();

// Built-in Plugins Registration
const BUILT_IN_PLUGINS: WidgetPlugin[] = [
  {
    id: 'metric-card',
    name: 'DORA & KPI Metric Card',
    description: 'Displays a single key engineering metric with trend percentages, target threshold, and sparkline.',
    category: 'metrics',
    icon: 'TrendingUp',
    defaultTitle: 'Metric Card',
    defaultSize: { w: 3, h: 2, minW: 2, minH: 2 },
    defaultConfig: {
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
    component: MetricCardWidget,
    mockDataGenerator: (cfg) => ({
      id: 'kpi-mock',
      label: cfg.label || 'PR Turnaround',
      value: cfg.value || '18.4 hrs',
      unit: cfg.unit || '',
      changePct: cfg.changePct ?? -12,
      trend: cfg.trend || 'down',
      target: cfg.target || '< 24 hrs',
      status: cfg.status || 'good',
      comparisonLabel: cfg.comparisonLabel || 'vs previous period',
      sparkline: cfg.sparkline || [22, 21, 24, 19, 18.4],
    }),
  },
  {
    id: 'chart-analytics',
    name: 'Velocity & Cycle Analytics Chart',
    description: 'Multi-mode data visualization supporting Area (Cycle time), Bar (Velocity), and Donut charts.',
    category: 'metrics',
    icon: 'BarChart2',
    defaultTitle: 'Cycle Time & Analytics',
    defaultSize: { w: 6, h: 4, minW: 4, minH: 3 },
    defaultConfig: {
      chartType: 'area',
      preset: 'cycle_time',
    },
    component: ChartAnalyticsWidget,
    mockDataGenerator: (cfg) => {
      if (cfg.chartType === 'donut') {
        return {
          segments: [
            { label: 'Feature Development', value: 52, color: '#6366f1' },
            { label: 'Technical Debt / Refactor', value: 24, color: '#06b6d4' },
            { label: 'Bug Fixes & Hotfixes', value: 16, color: '#f59e0b' },
            { label: 'Security & Compliance', value: 8, color: '#10b981' },
          ],
        };
      }
      return {
        points: [
          { label: 'Day 1', hours: 26, merged: 8 },
          { label: 'Day 3', hours: 24, merged: 11 },
          { label: 'Day 5', hours: 22, merged: 14 },
          { label: 'Day 7', hours: 25, merged: 9 },
          { label: 'Day 9', hours: 20, merged: 16 },
          { label: 'Day 11', hours: 19, merged: 18 },
          { label: 'Day 13', hours: 17, merged: 21 },
          { label: 'Day 14', hours: 16.5, merged: 24 },
        ],
      };
    },
  },
  {
    id: 'issue-tracker',
    name: 'Jira & Linear Sprint Issue Board',
    description: 'Interactive sprint ticket tracker with status changing, priority tags, assignees, and story points.',
    category: 'tracking',
    icon: 'CheckSquare',
    defaultTitle: 'Sprint Issues',
    defaultSize: { w: 8, h: 5, minW: 6, minH: 4 },
    defaultConfig: {
      sprintFilter: 'current',
      statusFilter: 'all',
      priorityFilter: 'all',
    },
    component: IssueTrackerWidget,
  },
  {
    id: 'infra-logs',
    name: 'Streaming Infrastructure Logs',
    description: 'Live log monitor with severity filters, service selection, search, and real-time streaming.',
    category: 'infra',
    icon: 'Terminal',
    defaultTitle: 'Cluster Logs',
    defaultSize: { w: 7, h: 5, minW: 5, minH: 4 },
    defaultConfig: {
      defaultLevel: 'ALL',
      service: 'all',
    },
    component: InfraLogsWidget,
  },
  {
    id: 'mcp-runner',
    name: 'Model Context Protocol (MCP) Runner',
    description: 'Interactive command console to discover and execute tools on connected MCP servers.',
    category: 'mcp',
    icon: 'Cpu',
    defaultTitle: 'MCP Tool Console',
    defaultSize: { w: 5, h: 5, minW: 4, minH: 4 },
    defaultConfig: {
      defaultServerId: 'mcp-infra',
    },
    component: McpRunnerWidget,
  },
  {
    id: 'db-table',
    name: 'SQL Database Query Runner',
    description: 'Execute custom SQL queries against Postgres or SQLite and view tabular metrics.',
    category: 'database',
    icon: 'Database',
    defaultTitle: 'Database Metrics',
    defaultSize: { w: 6, h: 4, minW: 4, minH: 3 },
    defaultConfig: {
      sqlQuery: 'SELECT id, key, title, assignee, status, points FROM sprint_tickets LIMIT 5;',
    },
    component: DatabaseQueryWidget,
  },
  {
    id: 'sprint-health',
    name: 'Engineering Health Radar',
    description: 'Comprehensive health score covering code review turnaround, scope creep, and pipeline flakiness.',
    category: 'metrics',
    icon: 'Activity',
    defaultTitle: 'Sprint Health Radar',
    defaultSize: { w: 5, h: 4, minW: 4, minH: 3 },
    defaultConfig: {},
    component: SprintHealthWidget,
  },
];

// Initialize registry
BUILT_IN_PLUGINS.forEach((p) => pluginRegistry.set(p.id, p));

export function registerPlugin(plugin: WidgetPlugin) {
  pluginRegistry.set(plugin.id, plugin);
}

export function getPlugin(id: string): WidgetPlugin | undefined {
  return pluginRegistry.get(id);
}

export function getAllPlugins(): WidgetPlugin[] {
  return Array.from(pluginRegistry.values());
}

export function getPluginsByCategory(category: string): WidgetPlugin[] {
  return getAllPlugins().filter((p) => p.category === category);
}
