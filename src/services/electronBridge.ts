import { ElectronAPI } from '../types/electron';

const mockStore: Record<string, any> = {};

export function getElectronBridge(): ElectronAPI {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }

  // Graceful browser fallback for Vite browser preview & testability
  return {
    isElectron: false,
    store: {
      get: async (key: string, defaultValue?: any) => {
        try {
          const item = localStorage.getItem(`eng_dash_${key}`);
          return item !== null ? JSON.parse(item) : defaultValue;
        } catch {
          return mockStore[key] !== undefined ? mockStore[key] : defaultValue;
        }
      },
      set: async (key: string, value: any) => {
        try {
          localStorage.setItem(`eng_dash_${key}`, JSON.stringify(value));
          mockStore[key] = value;
          return true;
        } catch {
          return false;
        }
      },
      delete: async (key: string) => {
        try {
          localStorage.removeItem(`eng_dash_${key}`);
          delete mockStore[key];
          return true;
        } catch {
          return false;
        }
      },
      clear: async () => {
        try {
          Object.keys(localStorage)
            .filter((k) => k.startsWith('eng_dash_'))
            .forEach((k) => localStorage.removeItem(k));
          return true;
        } catch {
          return false;
        }
      },
      getAll: async () => {
        const result: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('eng_dash_')) {
            try {
              result[k.replace('eng_dash_', '')] = JSON.parse(localStorage.getItem(k) || '');
            } catch {}
          }
        }
        return result;
      },
    },
    mcp: {
      testConnection: async (server) => {
        return {
          success: true,
          latencyMs: 19,
          tools: server.discoveredTools || [
            {
              name: 'github_list_pull_requests',
              description: 'List active pull requests, cycle times, review status, and assignees',
              inputSchema: { type: 'object', properties: {} },
            },
            {
              name: 'github_get_deployment_status',
              description: 'Retrieve latest production deployment status',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        };
      },
      listTools: async (server) => {
        return {
          success: true,
          tools: server.discoveredTools || [
            {
              name: 'query_service_metrics',
              description: 'Fetch throughput, memory, and CPU metrics for services',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        };
      },
      callTool: async (server, toolName, args) => {
        return {
          success: true,
          result: {
            tool: toolName,
            status: 'completed',
            args,
            timestamp: new Date().toISOString(),
          },
        };
      },
      disconnect: async () => true,
    },
    api: {
      request: async (options) => {
        const startTime = Date.now();
        try {
          const res = await fetch(options.url, {
            method: options.method || 'GET',
            headers: options.headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
          });
          const data = await res.json().catch(() => ({}));
          return {
            status: res.status,
            statusText: res.statusText,
            data,
            headers: {},
            latencyMs: Date.now() - startTime,
          };
        } catch (err: any) {
          return {
            status: 500,
            statusText: err.message,
            data: { error: err.message },
            headers: {},
            latencyMs: Date.now() - startTime,
          };
        }
      },
      testPing: async (config) => {
        return {
          success: true,
          status: 200,
          latencyMs: 38,
          sampleData: { ping: 'pong', provider: config.name, status: 'operational' },
        };
      },
    },
    db: {
      testConnection: async (config) => {
        return {
          success: true,
          latencyMs: 12,
          serverVersion: `${config.dbType.toUpperCase()} (Simulated Local Engine)`,
        };
      },
      runQuery: async (config, query) => {
        return {
          success: true,
          columns: ['id', 'metric', 'value', 'status'],
          rows: [
            { id: 1, metric: 'Deployment Frequency', value: '4.8 / day', status: 'ELITE' },
            { id: 2, metric: 'Change Failure Rate', value: '1.2%', status: 'ELITE' },
            { id: 3, metric: 'Mean Time to Recovery', value: '24m', status: 'OPTIMAL' },
          ],
          rowCount: 3,
          executionTimeMs: 16,
        };
      },
    },
    system: {
      getInfo: async () => ({
        platform: 'win32',
        arch: 'x64',
        nodeVersion: '24.19.0',
        electronVersion: '33.2.0',
        chromeVersion: '130.0.0.0',
        uptime: 3600,
        memory: { total: 16384, free: 8192, appUsed: 142 },
      }),
      exportConfig: async (jsonData: string) => {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `engineering-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };
      },
      importConfig: async () => {
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (!file) {
              resolve({ success: false, cancelled: true });
              return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({ success: true, data: event.target?.result as string });
            };
            reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
            reader.readAsText(file);
          };
          input.click();
        });
      },
    },
  };
}
