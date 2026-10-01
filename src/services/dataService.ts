import { WidgetInstance } from '../types/dashboard';
import { useDataSourceStore } from '../store/useDataSourceStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getElectronBridge } from './electronBridge';
import { getPlugin } from '../plugins/registry';

const bridge = getElectronBridge();

export async function fetchWidgetData(widget: WidgetInstance): Promise<any> {
  const { mockDataMode } = useSettingsStore.getState();
  const plugin = getPlugin(widget.pluginId);

  // If mock mode is explicitly active or plugin has a mock generator and no data source is configured
  if (mockDataMode || !widget.dataSourceId) {
    if (plugin?.mockDataGenerator) {
      return plugin.mockDataGenerator(widget.config);
    }
  }

  // Attempt live data fetching through bound data source
  const { mcpServers, restApis, databases } = useDataSourceStore.getState();

  // 1. MCP Data Source
  const mcpServer = mcpServers.find((s) => s.id === widget.dataSourceId);
  if (mcpServer) {
    try {
      const toolName = widget.config.mcpToolName || (mcpServer.discoveredTools?.[0]?.name);
      if (toolName) {
        const res = await bridge.mcp.callTool(mcpServer, toolName, widget.config.mcpToolArgs || {});
        if (res.success && res.result) {
          return res.result;
        }
      }
    } catch (err) {
      console.warn(`Live MCP fetch failed for widget ${widget.id}, falling back to mock:`, err);
    }
  }

  // 2. REST API Data Source
  const restApi = restApis.find((a) => a.id === widget.dataSourceId);
  if (restApi) {
    try {
      const endpoint = widget.config.apiEndpoint || '';
      const url = `${restApi.baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
      const headers: Record<string, string> = { ...(restApi.customHeaders || {}) };
      if (restApi.authType === 'bearer' && restApi.bearerToken) {
        headers['Authorization'] = `Bearer ${restApi.bearerToken}`;
      } else if (restApi.authType === 'apiKey' && restApi.apiKeyHeader && restApi.apiKeyValue) {
        headers[restApi.apiKeyHeader] = restApi.apiKeyValue;
      }

      const res = await bridge.api.request({
        url,
        method: widget.config.httpMethod || 'GET',
        headers,
      });

      if (res.status >= 200 && res.status < 300) {
        return res.data;
      }
    } catch (err) {
      console.warn(`Live REST fetch failed for widget ${widget.id}, falling back to mock:`, err);
    }
  }

  // 3. Database Data Source
  const db = databases.find((d) => d.id === widget.dataSourceId);
  if (db && widget.config.sqlQuery) {
    try {
      const res = await bridge.db.runQuery(db, widget.config.sqlQuery);
      if (res.success) {
        return res;
      }
    } catch (err) {
      console.warn(`Live DB query failed for widget ${widget.id}, falling back to mock:`, err);
    }
  }

  // Fallback to plugin mock data generator if live query failed
  if (plugin?.mockDataGenerator) {
    return plugin.mockDataGenerator(widget.config);
  }

  return null;
}
