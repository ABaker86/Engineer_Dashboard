import React, { useState } from 'react';
import { WidgetProps } from '../plugins/types';
import { useDataSourceStore } from '../store/useDataSourceStore';
import { getElectronBridge } from '../services/electronBridge';
import { Play, Terminal, CheckCircle2, AlertCircle, Copy, Check, RefreshCw } from 'lucide-react';

const bridge = getElectronBridge();

export const McpRunnerWidget: React.FC<WidgetProps> = () => {
  const { mcpServers } = useDataSourceStore();
  const [selectedServerId, setSelectedServerId] = useState<string>(mcpServers[0]?.id || 'mcp-infra');
  const [selectedToolName, setSelectedToolName] = useState<string>('');
  const [paramInputs, setParamInputs] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedServer = mcpServers.find((s) => s.id === selectedServerId) || mcpServers[0];
  const tools = selectedServer?.discoveredTools || [];
  const currentTool = tools.find((t) => t.name === selectedToolName) || tools[0];

  // Set default tool if not selected
  React.useEffect(() => {
    if (tools.length > 0 && (!selectedToolName || !tools.some((t) => t.name === selectedToolName))) {
      setSelectedToolName(tools[0].name);
    }
  }, [selectedServerId, tools]);

  const handleParamChange = (key: string, value: any) => {
    setParamInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
    if (!selectedServer || !currentTool) return;
    setIsRunning(true);
    setError(null);
    const start = Date.now();

    try {
      const res = await bridge.mcp.callTool(selectedServer, currentTool.name, paramInputs);
      setLatency(Date.now() - start);
      if (res.success) {
        setResponse(res.result);
      } else {
        setError(res.error || 'Execution failed');
      }
    } catch (err: any) {
      setError(err.message);
      setLatency(Date.now() - start);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const schemaProps = currentTool?.inputSchema?.properties || {};

  return (
    <div className="flex flex-col h-full p-4 select-text">
      {/* Top selector row */}
      <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-slate-800">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">MCP Server</label>
          <select
            value={selectedServerId}
            onChange={(e) => {
              setSelectedServerId(e.target.value);
              setResponse(null);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {mcpServers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.transport})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Select Tool</label>
          <select
            value={selectedToolName}
            onChange={(e) => {
              setSelectedToolName(e.target.value);
              setResponse(null);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {tools.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool description & parameters */}
      {currentTool && (
        <div className="mb-3 space-y-2">
          <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800/80">
            {currentTool.description}
          </p>

          {Object.keys(schemaProps).length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300">Tool Parameters:</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(schemaProps).map(([key, prop]: [string, any]) => (
                  <div key={key}>
                    <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                      {key} {prop.enum ? `(${prop.enum.join('/')})` : ''}
                    </label>
                    {prop.enum ? (
                      <select
                        value={paramInputs[key] || prop.default || prop.enum[0]}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      >
                        {prop.enum.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={prop.description || key}
                        value={paramInputs[key] || ''}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Execute button */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleExecute}
          disabled={isRunning || !currentTool}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-brand transition-all"
        >
          {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? 'Invoking MCP...' : 'Execute Tool'}
        </button>

        {latency !== null && (
          <span className="text-[11px] font-mono text-slate-400">
            Latency: <strong className="text-emerald-400">{latency}ms</strong>
          </span>
        )}
      </div>

      {/* Output Console */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950/90 rounded-lg border border-slate-800/90 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[11px]">
          <span className="font-mono text-slate-400">Result Console</span>
          {response && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
          {error && <div className="text-rose-400">Error: {error}</div>}
          {!error && !response && !isRunning && (
            <div className="text-slate-500 italic">Select an MCP server tool and click Execute Tool to view live output.</div>
          )}
          {isRunning && <div className="text-indigo-400 animate-pulse">Running JSON-RPC request to MCP agent...</div>}
          {response && (
            <pre className="text-emerald-300 whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
