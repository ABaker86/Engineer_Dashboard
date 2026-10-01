import React, { useState } from 'react';
import { WidgetProps } from '../plugins/types';
import { useDataSourceStore } from '../store/useDataSourceStore';
import { Database, Play, RefreshCw, Table } from 'lucide-react';

export const DatabaseQueryWidget: React.FC<WidgetProps> = ({ config }) => {
  const { databases, runDbQuery } = useDataSourceStore();
  const [selectedDbId, setSelectedDbId] = useState<string>(databases[0]?.id || 'db-postgres');
  const [query, setQuery] = useState<string>(
    config.sqlQuery || 'SELECT id, key, title, assignee, status, points FROM sprint_tickets LIMIT 5;'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runDbQuery(selectedDbId, query);
      if (res.success) {
        setResult(res);
      } else {
        setError(res.error || 'Query failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleRun();
  }, [selectedDbId]);

  return (
    <div className="flex flex-col h-full p-4 select-text">
      {/* DB Selector and Query Input */}
      <div className="flex items-center gap-2 mb-2">
        <select
          value={selectedDbId}
          onChange={(e) => setSelectedDbId(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
        >
          {databases.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.dbType})
            </option>
          ))}
        </select>

        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition-colors"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Run Query
        </button>

        {result && (
          <span className="text-[11px] font-mono text-slate-400 ml-auto">
            {result.rowCount} rows in <strong className="text-emerald-400">{result.executionTimeMs}ms</strong>
          </span>
        )}
      </div>

      <div className="mb-2">
        <textarea
          rows={2}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded p-2 font-mono text-[11px] text-cyan-300 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto rounded border border-slate-800 bg-slate-950/60">
        {error && <div className="p-3 text-rose-400 text-xs font-mono">Error: {error}</div>}
        {result && result.columns && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[10px] uppercase tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                {result.columns.map((col: string) => (
                  <th key={col} className="px-3 py-2">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {result.rows.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  {result.columns.map((col: string) => (
                    <td key={col} className="px-3 py-2 text-slate-300">
                      {row[col] !== undefined ? String(row[col]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
