import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, ElectronApiRequestOptions } from '../src/types/electron';
import { McpServerConfig, RestApiConfig, DatabaseConfig } from '../src/types/dashboard';

const electronAPI: ElectronAPI = {
  isElectron: true,
  store: {
    get: (key: string, defaultValue?: any) => ipcRenderer.invoke('store:get', key, defaultValue),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
    clear: () => ipcRenderer.invoke('store:clear'),
    getAll: () => ipcRenderer.invoke('store:getAll'),
  },
  mcp: {
    testConnection: (server: McpServerConfig) => ipcRenderer.invoke('mcp:testConnection', server),
    listTools: (server: McpServerConfig) => ipcRenderer.invoke('mcp:listTools', server),
    callTool: (server: McpServerConfig, toolName: string, args: Record<string, any>) =>
      ipcRenderer.invoke('mcp:callTool', server, toolName, args),
    disconnect: (serverId: string) => ipcRenderer.invoke('mcp:disconnect', serverId),
  },
  api: {
    request: (options: ElectronApiRequestOptions) => ipcRenderer.invoke('api:request', options),
    testPing: (config: RestApiConfig) => ipcRenderer.invoke('api:testPing', config),
  },
  db: {
    testConnection: (config: DatabaseConfig) => ipcRenderer.invoke('db:testConnection', config),
    runQuery: (config: DatabaseConfig, query: string) => ipcRenderer.invoke('db:runQuery', config, query),
  },
  system: {
    getInfo: () => ipcRenderer.invoke('system:getInfo'),
    exportConfig: (jsonData: string) => ipcRenderer.invoke('system:exportConfig', jsonData),
    importConfig: () => ipcRenderer.invoke('system:importConfig'),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
