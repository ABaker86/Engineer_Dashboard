import { McpServerConfig, McpTool, RestApiConfig, DatabaseConfig } from './dashboard';

export interface ElectronStoreAPI {
  get: <T = any>(key: string, defaultValue?: T) => Promise<T>;
  set: <T = any>(key: string, value: T) => Promise<boolean>;
  delete: (key: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
  getAll: () => Promise<Record<string, any>>;
}

export interface ElectronMcpAPI {
  testConnection: (server: McpServerConfig) => Promise<{ success: boolean; tools?: McpTool[]; error?: string; latencyMs?: number }>;
  listTools: (server: McpServerConfig) => Promise<{ success: boolean; tools: McpTool[]; error?: string }>;
  callTool: (server: McpServerConfig, toolName: string, args: Record<string, any>) => Promise<{ success: boolean; result?: any; error?: string }>;
  disconnect: (serverId: string) => Promise<boolean>;
}

export interface ElectronApiRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}

export interface ElectronApiProxyAPI {
  request: (options: ElectronApiRequestOptions) => Promise<{
    status: number;
    statusText: string;
    data: any;
    headers: Record<string, string>;
    latencyMs: number;
  }>;
  testPing: (config: RestApiConfig) => Promise<{ success: boolean; status?: number; latencyMs?: number; error?: string; sampleData?: any }>;
}

export interface ElectronDbAPI {
  testConnection: (config: DatabaseConfig) => Promise<{ success: boolean; latencyMs?: number; error?: string; serverVersion?: string }>;
  runQuery: (config: DatabaseConfig, query: string) => Promise<{
    success: boolean;
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTimeMs: number;
    error?: string;
  }>;
}

export interface ElectronSystemAPI {
  getInfo: () => Promise<{
    platform: string;
    arch: string;
    nodeVersion: string;
    electronVersion: string;
    chromeVersion: string;
    uptime: number;
    memory: { total: number; free: number; appUsed: number };
  }>;
  exportConfig: (jsonData: string) => Promise<{ success: boolean; filePath?: string; cancelled?: boolean; error?: string }>;
  importConfig: () => Promise<{ success: boolean; data?: string; cancelled?: boolean; error?: string }>;
}

export interface ElectronAPI {
  store: ElectronStoreAPI;
  mcp: ElectronMcpAPI;
  api: ElectronApiProxyAPI;
  db: ElectronDbAPI;
  system: ElectronSystemAPI;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
