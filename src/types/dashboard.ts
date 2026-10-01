export type DataSourceType = 'mcp' | 'rest' | 'database';

export interface McpToolParameter {
  type: string;
  description?: string;
  enum?: string[];
  default?: any;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, McpToolParameter>;
    required?: string[];
  };
}

export interface McpServerConfig {
  id: string;
  name: string;
  description?: string;
  transport: 'stdio' | 'sse';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastPing?: string;
  discoveredTools?: McpTool[];
  errorMessage?: string;
}

export interface RestApiConfig {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  authType: 'none' | 'bearer' | 'apiKey' | 'basic';
  apiKeyHeader?: string;
  apiKeyValue?: string;
  bearerToken?: string;
  basicUser?: string;
  basicPass?: string;
  customHeaders?: Record<string, string>;
  timeoutMs?: number;
  status: 'healthy' | 'unhealthy' | 'untested';
  lastPingMs?: number;
  lastChecked?: string;
  errorMessage?: string;
}

export interface DatabaseConfig {
  id: string;
  name: string;
  description?: string;
  dbType: 'postgres' | 'sqlite' | 'mysql';
  connectionString?: string;
  filePath?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTested?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface WidgetInstance {
  id: string;
  pluginId: string;
  title: string;
  layout: WidgetLayout;
  config: Record<string, any>;
  dataSourceId?: string;
  refreshInterval?: number; // in seconds
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isDefault?: boolean;
  widgets: WidgetInstance[];
  createdAt: string;
  updatedAt: string;
}

export type IssuePriority = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'backlog' | 'in_progress' | 'in_review' | 'done';
export type IssueType = 'story' | 'bug' | 'task' | 'epic';

export interface JiraIssue {
  id: string;
  key: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assignee: {
    name: string;
    avatarUrl?: string;
    initials: string;
  };
  points: number;
  sprint: string;
  updatedAt: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface MetricKpi {
  id: string;
  label: string;
  value: string | number;
  target?: string | number;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  changePct: number;
  comparisonLabel: string;
  sparkline: number[];
  status: 'good' | 'warning' | 'critical' | 'neutral';
}
