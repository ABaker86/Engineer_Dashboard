import { create } from 'zustand';
import { McpServerConfig, RestApiConfig, DatabaseConfig, McpTool } from '../types/dashboard';
import { getElectronBridge } from '../services/electronBridge';

const bridge = getElectronBridge();

const DEFAULT_MCP_SERVERS: McpServerConfig[] = [
  {
    id: 'mcp-github',
    name: 'GitHub Engineering MCP',
    description: 'Model Context Protocol server for querying PRs, code reviews, and commit velocity',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-github',
    args: ['--repo', 'acme-corp/core-platform'],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_sampleTokenSecurelyVaulted' },
    status: 'connected',
    lastPing: new Date().toISOString(),
    discoveredTools: [
      {
        name: 'github_list_pull_requests',
        description: 'List active pull requests, cycle times, review status, and assignees',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string', description: 'Repository name e.g. org/repo' },
            state: { type: 'string', enum: ['open', 'closed', 'all'], default: 'open' },
          },
        },
      },
      {
        name: 'github_get_deployment_status',
        description: 'Retrieve latest production deployment status and commit hash',
        inputSchema: {
          type: 'object',
          properties: {
            environment: { type: 'string', enum: ['production', 'staging', 'preview'], default: 'production' },
          },
        },
      },
    ],
  },
  {
    id: 'mcp-infra',
    name: 'Kubernetes & AWS Infra MCP',
    description: 'MCP server for inspecting pod health, cluster logs, and executing automated rollbacks',
    transport: 'stdio',
    command: 'npx -y @modelcontextprotocol/server-kubernetes',
    args: ['--namespace', 'production'],
    status: 'connected',
    lastPing: new Date().toISOString(),
    discoveredTools: [
      {
        name: 'infra_restart_service',
        description: 'Trigger rolling restart of a Kubernetes pod or service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceName: { type: 'string', description: 'Name of the service (e.g. auth-service, billing-api)' },
          },
          required: ['serviceName'],
        },
      },
      {
        name: 'infra_query_logs',
        description: 'Query streaming container logs with severity filter',
        inputSchema: {
          type: 'object',
          properties: {
            severity: { type: 'string', enum: ['ALL', 'WARN', 'ERROR', 'CRITICAL'] },
            limit: { type: 'number', default: 50 },
          },
        },
      },
    ],
  },
  {
    id: 'mcp-linear',
    name: 'Linear Sprint Sync MCP',
    description: 'Remote SSE MCP server streaming real-time issue updates, cycle time, and blockers',
    transport: 'sse',
    url: 'https://mcp.internal.acme.corp/linear/events',
    status: 'connected',
    lastPing: new Date().toISOString(),
    discoveredTools: [
      {
        name: 'linear_get_cycle_metrics',
        description: 'Fetch current cycle completion percentage, estimate vs actual, and blocker count',
        inputSchema: {
          type: 'object',
          properties: {
            cycleId: { type: 'string', description: 'Cycle ID or "current"' },
          },
        },
      },
    ],
  },
];

const DEFAULT_REST_APIS: RestApiConfig[] = [
  {
    id: 'rest-github',
    name: 'GitHub REST API v3',
    description: 'Repository metrics, workflows, and pull request reviews',
    baseUrl: 'https://api.github.com',
    authType: 'bearer',
    bearerToken: 'ghp_demoToken_engineering_dashboard',
    status: 'healthy',
    lastPingMs: 42,
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'rest-linear',
    name: 'Linear GraphQL & REST Gateway',
    description: 'Sprint issues, team velocity, and project milestones',
    baseUrl: 'https://api.linear.app/graphql',
    authType: 'apiKey',
    apiKeyHeader: 'Authorization',
    apiKeyValue: 'lin_api_demoKey_73919482',
    status: 'healthy',
    lastPingMs: 38,
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'rest-datadog',
    name: 'Datadog / APM Metrics API',
    description: 'P99 latency, error rates, and infrastructure health status',
    baseUrl: 'https://api.datadoghq.com/api/v1/query',
    authType: 'apiKey',
    apiKeyHeader: 'DD-API-KEY',
    apiKeyValue: 'dd_sample_api_key_4401',
    status: 'healthy',
    lastPingMs: 56,
    lastChecked: new Date().toISOString(),
  },
];

const DEFAULT_DATABASES: DatabaseConfig[] = [
  {
    id: 'db-postgres',
    name: 'Production Engineering Postgres',
    description: 'Read replica containing sprint history, deployments, and Jira issue mirrors',
    dbType: 'postgres',
    connectionString: 'postgresql://analyst_ro:P@ssword123@db-ro.internal.acme.corp:5432/eng_metrics',
    host: 'db-ro.internal.acme.corp',
    port: 5432,
    database: 'eng_metrics',
    username: 'analyst_ro',
    status: 'connected',
    latencyMs: 14,
    lastTested: new Date().toISOString(),
  },
  {
    id: 'db-sqlite',
    name: 'Local Sprint SQLite Cache',
    description: 'Embedded fast cache for offline sprint tracking and ticket velocity analytics',
    dbType: 'sqlite',
    filePath: ':memory:',
    status: 'connected',
    latencyMs: 3,
    lastTested: new Date().toISOString(),
  },
];

interface DataSourceState {
  mcpServers: McpServerConfig[];
  restApis: RestApiConfig[];
  databases: DatabaseConfig[];
  isLoading: boolean;
  loadDataSources: () => Promise<void>;
  saveDataSources: () => Promise<void>;

  // MCP Actions
  addMcpServer: (server: Omit<McpServerConfig, 'id' | 'status'>) => Promise<McpServerConfig>;
  updateMcpServer: (id: string, updates: Partial<McpServerConfig>) => Promise<void>;
  deleteMcpServer: (id: string) => Promise<void>;
  testMcpConnection: (id: string) => Promise<{ success: boolean; latencyMs?: number; error?: string; tools?: McpTool[] }>;

  // REST API Actions
  addRestApi: (api: Omit<RestApiConfig, 'id' | 'status'>) => Promise<RestApiConfig>;
  updateRestApi: (id: string, updates: Partial<RestApiConfig>) => Promise<void>;
  deleteRestApi: (id: string) => Promise<void>;
  testRestPing: (id: string) => Promise<{ success: boolean; status?: number; latencyMs?: number; error?: string }>;

  // Database Actions
  addDatabase: (db: Omit<DatabaseConfig, 'id' | 'status'>) => Promise<DatabaseConfig>;
  updateDatabase: (id: string, updates: Partial<DatabaseConfig>) => Promise<void>;
  deleteDatabase: (id: string) => Promise<void>;
  testDbConnection: (id: string) => Promise<{ success: boolean; latencyMs?: number; error?: string }>;
  runDbQuery: (id: string, query: string) => Promise<any>;
}

export const useDataSourceStore = create<DataSourceState>((set, get) => ({
  mcpServers: DEFAULT_MCP_SERVERS,
  restApis: DEFAULT_REST_APIS,
  databases: DEFAULT_DATABASES,
  isLoading: false,

  loadDataSources: async () => {
    set({ isLoading: true });
    try {
      const storedMcp = await bridge.store.get('mcp_servers', DEFAULT_MCP_SERVERS);
      const storedRest = await bridge.store.get('rest_apis', DEFAULT_REST_APIS);
      const storedDb = await bridge.store.get('databases', DEFAULT_DATABASES);
      set({
        mcpServers: storedMcp || DEFAULT_MCP_SERVERS,
        restApis: storedRest || DEFAULT_REST_APIS,
        databases: storedDb || DEFAULT_DATABASES,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  saveDataSources: async () => {
    const { mcpServers, restApis, databases } = get();
    await bridge.store.set('mcp_servers', mcpServers);
    await bridge.store.set('rest_apis', restApis);
    await bridge.store.set('databases', databases);
  },

  addMcpServer: async (serverData) => {
    const newServer: McpServerConfig = {
      ...serverData,
      id: `mcp-${Date.now()}`,
      status: 'connecting',
    };
    const updated = [...get().mcpServers, newServer];
    set({ mcpServers: updated });
    await get().saveDataSources();
    get().testMcpConnection(newServer.id);
    return newServer;
  },

  updateMcpServer: async (id, updates) => {
    const updated = get().mcpServers.map((s) => (s.id === id ? { ...s, ...updates } : s));
    set({ mcpServers: updated });
    await get().saveDataSources();
  },

  deleteMcpServer: async (id) => {
    bridge.mcp.disconnect(id).catch(() => {});
    const updated = get().mcpServers.filter((s) => s.id !== id);
    set({ mcpServers: updated });
    await get().saveDataSources();
  },

  testMcpConnection: async (id) => {
    const server = get().mcpServers.find((s) => s.id === id);
    if (!server) return { success: false, error: 'Server not found' };

    set((state) => ({
      mcpServers: state.mcpServers.map((s) => (s.id === id ? { ...s, status: 'connecting' } : s)),
    }));

    const res = await bridge.mcp.testConnection(server);
    const status = res.success ? 'connected' : 'error';
    const tools = res.tools || server.discoveredTools || [];

    set((state) => ({
      mcpServers: state.mcpServers.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              lastPing: new Date().toISOString(),
              errorMessage: res.error,
              discoveredTools: tools,
            }
          : s
      ),
    }));

    await get().saveDataSources();
    return res;
  },

  addRestApi: async (apiData) => {
    const newApi: RestApiConfig = {
      ...apiData,
      id: `rest-${Date.now()}`,
      status: 'untested',
    };
    const updated = [...get().restApis, newApi];
    set({ restApis: updated });
    await get().saveDataSources();
    get().testRestPing(newApi.id);
    return newApi;
  },

  updateRestApi: async (id, updates) => {
    const updated = get().restApis.map((a) => (a.id === id ? { ...a, ...updates } : a));
    set({ restApis: updated });
    await get().saveDataSources();
  },

  deleteRestApi: async (id) => {
    const updated = get().restApis.filter((a) => a.id !== id);
    set({ restApis: updated });
    await get().saveDataSources();
  },

  testRestPing: async (id) => {
    const api = get().restApis.find((a) => a.id === id);
    if (!api) return { success: false, error: 'API connection not found' };

    const res = await bridge.api.testPing(api);
    set((state) => ({
      restApis: state.restApis.map((a) =>
        a.id === id
          ? {
              ...a,
              status: res.success ? 'healthy' : 'unhealthy',
              lastPingMs: res.latencyMs,
              lastChecked: new Date().toISOString(),
              errorMessage: res.error,
            }
          : a
      ),
    }));

    await get().saveDataSources();
    return res;
  },

  addDatabase: async (dbData) => {
    const newDb: DatabaseConfig = {
      ...dbData,
      id: `db-${Date.now()}`,
      status: 'disconnected',
    };
    const updated = [...get().databases, newDb];
    set({ databases: updated });
    await get().saveDataSources();
    get().testDbConnection(newDb.id);
    return newDb;
  },

  updateDatabase: async (id, updates) => {
    const updated = get().databases.map((d) => (d.id === id ? { ...d, ...updates } : d));
    set({ databases: updated });
    await get().saveDataSources();
  },

  deleteDatabase: async (id) => {
    const updated = get().databases.filter((d) => d.id !== id);
    set({ databases: updated });
    await get().saveDataSources();
  },

  testDbConnection: async (id) => {
    const db = get().databases.find((d) => d.id === id);
    if (!db) return { success: false, error: 'Database not found' };

    const res = await bridge.db.testConnection(db);
    set((state) => ({
      databases: state.databases.map((d) =>
        d.id === id
          ? {
              ...d,
              status: res.success ? 'connected' : 'error',
              latencyMs: res.latencyMs,
              lastTested: new Date().toISOString(),
              errorMessage: res.error,
            }
          : d
      ),
    }));

    await get().saveDataSources();
    return res;
  },

  runDbQuery: async (id, query) => {
    const db = get().databases.find((d) => d.id === id);
    if (!db) throw new Error('Database not found');
    return bridge.db.runQuery(db, query);
  },
}));
