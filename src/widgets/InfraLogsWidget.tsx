import React, { useState, useEffect, useRef } from 'react';
import { WidgetProps } from '../plugins/types';
import { LogEntry, LogLevel } from '../types/dashboard';
import { Terminal, Search, Trash2, ArrowDownCircle, Play, Pause } from 'lucide-react';

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: '19:14:02.104', level: 'INFO', service: 'k8s-ingress', message: 'HTTP 200 GET /api/v1/health (latency 2.4ms, routed to node-pool-prod-a)' },
  { id: '2', timestamp: '19:14:03.220', level: 'INFO', service: 'auth-service', message: 'Issued RS256 JWT token for engineering-manager-role (tenant: corp-global)' },
  { id: '3', timestamp: '19:14:05.811', level: 'WARN', service: 'billing-api', message: 'Connection pool near threshold: 82/100 active connections in pool-db-ro' },
  { id: '4', timestamp: '19:14:08.419', level: 'INFO', service: 'worker-queue', message: 'Processed job queue batch: 450 webhook events flushed to Datadog' },
  { id: '5', timestamp: '19:14:11.902', level: 'ERROR', service: 'payment-gateway', message: 'Idempotency key collision on checkout_session_91823. Request queued for retry' },
  { id: '6', timestamp: '19:14:14.004', level: 'INFO', service: 'redis-cluster', message: 'Memory defragmentation completed successfully in 12ms. Zero eviction events.' },
  { id: '7', timestamp: '19:14:18.631', level: 'INFO', service: 'k8s-ingress', message: 'Auto-scaled pod replica group: auth-service scaled 4 -> 6 instances' },
];

export const InfraLogsWidget: React.FC<WidgetProps> = () => {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Live streaming log simulation
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      const services = ['auth-service', 'k8s-ingress', 'billing-api', 'worker-queue', 'redis-cluster'];
      const levels: LogLevel[] = ['INFO', 'INFO', 'INFO', 'WARN', 'INFO'];
      const messages = [
        'TLS handshake verified with edge gateway (cipher: TLS_AES_256_GCM_SHA384)',
        'Redis cache hit ratio 99.4% for tenant session tokens',
        'Database query executed in 4.1ms [SELECT * FROM sprint_metrics WHERE status = ?]',
        'Kubernetes pod healthcheck probe returned 200 OK on /readyz',
        'Garbage collection cycle completed in 3.2ms. Heap usage 42%',
      ];

      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      const randomIdx = Math.floor(Math.random() * messages.length);

      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        level: levels[randomIdx],
        service: services[randomIdx],
        message: messages[randomIdx],
      };

      setLogs((prev) => [...prev.slice(-100), newLog]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchesService = selectedService === 'all' || log.service === selectedService;
    const matchesSearch =
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesService && matchesSearch;
  });

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white font-mono">CRIT</span>;
      case 'ERROR':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono">ERR</span>;
      case 'WARN':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">WARN</span>;
      case 'INFO':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono">INFO</span>;
    }
  };

  return (
    <div className="flex flex-col h-full p-4 select-text">
      {/* Controls toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search container logs / regex..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Services</option>
            <option value="auth-service">auth-service</option>
            <option value="billing-api">billing-api</option>
            <option value="k8s-ingress">k8s-ingress</option>
            <option value="worker-queue">worker-queue</option>
            <option value="redis-cluster">redis-cluster</option>
          </select>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`p-1.5 rounded border transition-colors ${
              isStreaming
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={isStreaming ? 'Pause log stream' : 'Resume log stream'}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded border transition-colors ${
              autoScroll
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Auto-scroll lock"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setLogs([])}
            className="p-1.5 rounded border border-slate-700 bg-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal log output */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto bg-slate-950/90 rounded-lg p-3 font-mono text-[11px] leading-relaxed space-y-1 border border-slate-800/90 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic py-4 text-center">No log messages found for selected filter</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/60 rounded px-1.5 py-0.5 group">
              <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
              <span className="shrink-0">{getLevelBadge(log.level)}</span>
              <span className="text-cyan-400 shrink-0 font-medium">[{log.service}]</span>
              <span className="text-slate-200 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
