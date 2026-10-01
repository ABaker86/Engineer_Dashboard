import React, { useState } from 'react';
import { useDataSourceStore } from '../store/useDataSourceStore';
import { McpServerConfig, RestApiConfig, DatabaseConfig } from '../types/dashboard';
import {
  Cpu,
  Globe,
  Database,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Shield,
  Key,
} from 'lucide-react';

export const DataConfigPage: React.FC = () => {
  const {
    mcpServers,
    restApis,
    databases,
    addMcpServer,
    deleteMcpServer,
    testMcpConnection,
    addRestApi,
    deleteRestApi,
    testRestPing,
    addDatabase,
    deleteDatabase,
    testDbConnection,
  } = useDataSourceStore();

  const [activeTab, setActiveTab] = useState<'mcp' | 'rest' | 'db'>('mcp');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [expandedMcpId, setExpandedMcpId] = useState<string | null>(mcpServers[0]?.id || null);

  const [showAddMcp, setShowAddMcp] = useState(false);
  const [newMcp, setNewMcp] = useState({
    name: '',
    description: '',
    transport: 'stdio' as 'stdio' | 'sse',
    command: 'npx -y @modelcontextprotocol/server-',
    args: '',
    url: 'https://',
  });

  const [showAddRest, setShowAddRest] = useState(false);
  const [newRest, setNewRest] = useState({
    name: '',
    description: '',
    baseUrl: 'https://api.',
    authType: 'bearer' as 'none' | 'bearer' | 'apiKey',
    bearerToken: '',
    apiKeyHeader: 'X-API-Key',
    apiKeyValue: '',
  });

  const [showAddDb, setShowAddDb] = useState(false);
  const [newDb, setNewDb] = useState({
    name: '',
    description: '',
    dbType: 'postgres' as 'postgres' | 'sqlite' | 'mysql',
    connectionString: 'postgresql://user:pass@localhost:5432/dbname',
    filePath: ':memory:',
  });

  const handleTestMcp = async (id: string) => {
    setTestingId(id);
    await testMcpConnection(id);
    setTestingId(null);
  };

  const handleTestRest = async (id: string) => {
    setTestingId(id);
    await testRestPing(id);
    setTestingId(null);
  };

  const handleTestDb = async (id: string) => {
    setTestingId(id);
    await testDbConnection(id);
    setTestingId(null);
  };

  const handleCreateMcp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMcp.name) return;
    addMcpServer({
      name: newMcp.name,
      description: newMcp.description,
      transport: newMcp.transport,
      command: newMcp.transport === 'stdio' ? newMcp.command : undefined,
      args: newMcp.transport === 'stdio' && newMcp.args ? newMcp.args.split(' ') : undefined,
      url: newMcp.transport === 'sse' ? newMcp.url : undefined,
    });
    setShowAddMcp(false);
    setNewMcp({ name: '', description: '', transport: 'stdio', command: '', args: '', url: 'https://' });
  };

  const handleCreateRest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRest.name || !newRest.baseUrl) return;
    addRestApi({
      name: newRest.name,
      description: newRest.description,
      baseUrl: newRest.baseUrl,
      authType: newRest.authType,
      bearerToken: newRest.bearerToken || undefined,
      apiKeyHeader: newRest.apiKeyHeader || undefined,
      apiKeyValue: newRest.apiKeyValue || undefined,
    });
    setShowAddRest(false);
    setNewRest({ name: '', description: '', baseUrl: 'https://api.', authType: 'bearer', bearerToken: '', apiKeyHeader: 'X-API-Key', apiKeyValue: '' });
  };

  const handleCreateDb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDb.name) return;
    addDatabase({
      name: newDb.name,
      description: newDb.description,
      dbType: newDb.dbType,
      connectionString: newDb.dbType !== 'sqlite' ? newDb.connectionString : undefined,
      filePath: newDb.dbType === 'sqlite' ? newDb.filePath : undefined,
    });
    setShowAddDb(false);
    setNewDb({ name: '', description: '', dbType: 'postgres', connectionString: '', filePath: ':memory:' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Data Sources & Integration Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect to external Model Context Protocol (MCP) servers, REST microservices, and databases.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'mcp' ? 'bg-indigo-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>MCP Servers ({mcpServers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rest')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rest' ? 'bg-indigo-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>REST APIs ({restApis.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('db')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'db' ? 'bg-indigo-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Databases ({databases.length})</span>
          </button>
        </div>
      </div>

      {/* MCP Tab */}
      {activeTab === 'mcp' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Model Context Protocol Servers
            </span>
            <button
              onClick={() => setShowAddMcp(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add MCP Server
            </button>
          </div>

          <div className="space-y-3">
            {mcpServers.map((server) => {
              const isExpanded = expandedMcpId === server.id;
              const isTesting = testingId === server.id;
              const isConnected = server.status === 'connected';

              return (
                <div key={server.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shrink-0">
                        <Cpu className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-bold text-white truncate">{server.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold flex items-center gap-1 ${
                              isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {server.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {server.transport.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">{server.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTestMcp(server.id)}
                        disabled={isTesting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-indigo-400' : ''}`} />
                        {isTesting ? 'Testing...' : 'Test Ping'}
                      </button>

                      <button
                        onClick={() => setExpandedMcpId(isExpanded ? null : server.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                        title="Inspect tools"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => deleteMcpServer(server.id)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">
                          Discovered Tools ({server.discoveredTools?.length || 0})
                        </span>
                        {server.command && (
                          <span className="font-mono text-[11px] text-slate-500">
                            Command: {server.command} {(server.args || []).join(' ')}
                          </span>
                        )}
                        {server.url && (
                          <span className="font-mono text-[11px] text-slate-500">
                            SSE: {server.url}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {(server.discoveredTools || []).map((tool) => (
                          <div key={tool.name} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-indigo-300">{tool.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">JSON-RPC</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">{tool.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REST Tab */}
      {activeTab === 'rest' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Configured REST & GraphQL API Endpoints
            </span>
            <button
              onClick={() => setShowAddRest(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add REST Connection
            </button>
          </div>

          <div className="space-y-3">
            {restApis.map((api) => {
              const isTesting = testingId === api.id;
              const isHealthy = api.status === 'healthy';

              return (
                <div key={api.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shrink-0">
                      <Globe className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-white truncate">{api.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold flex items-center gap-1 ${
                            isHealthy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {api.status.toUpperCase()}
                        </span>
                        {api.lastPingMs !== undefined && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            {api.lastPingMs}ms
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-cyan-300 mt-1 truncate">{api.baseUrl}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTestRest(api.id)}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-indigo-400' : ''}`} />
                      {isTesting ? 'Pinging...' : 'Test Ping'}
                    </button>

                    <button
                      onClick={() => deleteRestApi(api.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'db' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Database Connection Pools & Local Storage
            </span>
            <button
              onClick={() => setShowAddDb(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Database Connection
            </button>
          </div>

          <div className="space-y-3">
            {databases.map((db) => {
              const isTesting = testingId === db.id;
              const isConnected = db.status === 'connected';

              return (
                <div key={db.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shrink-0">
                      <Database className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-white truncate">{db.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold flex items-center gap-1 ${
                            isConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {db.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {db.dbType.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">{db.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTestDb(db.id)}
                      disabled={isTesting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-indigo-400' : ''}`} />
                      {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                      onClick={() => deleteDatabase(db.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Modals */}
      {showAddMcp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateMcp} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add New MCP Server</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Server Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sentry Error MCP"
                value={newMcp.name}
                onChange={(e) => setNewMcp({ ...newMcp, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Transport Protocol</label>
              <select
                value={newMcp.transport}
                onChange={(e) => setNewMcp({ ...newMcp, transport: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="stdio">stdio (Local Executable / Command)</option>
                <option value="sse">sse (Server-Sent Events HTTP Endpoint)</option>
              </select>
            </div>
            {newMcp.transport === 'stdio' ? (
              <>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Executable Command</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. npx -y @modelcontextprotocol/server-postgres"
                    value={newMcp.command}
                    onChange={(e) => setNewMcp({ ...newMcp, command: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Arguments</label>
                  <input
                    type="text"
                    placeholder="e.g. --conn postgresql://localhost/db"
                    value={newMcp.args}
                    onChange={(e) => setNewMcp({ ...newMcp, args: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs text-slate-300 block mb-1">SSE URL Endpoint</label>
                <input
                  type="url"
                  required
                  placeholder="https://mcp.internal.corp/events"
                  value={newMcp.url}
                  onChange={(e) => setNewMcp({ ...newMcp, url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMcp(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add MCP Server
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddRest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateRest} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add REST API Connection</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. GitLab Enterprise API"
                value={newRest.name}
                onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Base URL</label>
              <input
                type="url"
                required
                placeholder="https://gitlab.example.com/api/v4"
                value={newRest.baseUrl}
                onChange={(e) => setNewRest({ ...newRest, baseUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Authentication Method</label>
              <select
                value={newRest.authType}
                onChange={(e) => setNewRest({ ...newRest, authType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="none">No Authentication</option>
                <option value="bearer">Bearer Token</option>
                <option value="apiKey">API Key (Custom Header)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRest(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Connection
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddDb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateDb} className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add Database Connection</h3>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Connection Label</label>
              <input
                type="text"
                required
                placeholder="e.g. Analytics Read Replica"
                value={newDb.name}
                onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Database Engine</label>
              <select
                value={newDb.dbType}
                onChange={(e) => setNewDb({ ...newDb, dbType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="sqlite">SQLite</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Connection String / File</label>
              <input
                type="text"
                required
                placeholder={newDb.dbType === 'sqlite' ? ':memory:' : 'postgresql://user:pass@host/db'}
                value={newDb.dbType === 'sqlite' ? newDb.filePath : newDb.connectionString}
                onChange={(e) =>
                  newDb.dbType === 'sqlite'
                    ? setNewDb({ ...newDb, filePath: e.target.value })
                    : setNewDb({ ...newDb, connectionString: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDb(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Database
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
