import React, { useState } from 'react';
import { WidgetProps } from '../plugins/types';
import { JiraIssue, IssueStatus, IssuePriority } from '../types/dashboard';
import { Search, Filter, CheckCircle2, Clock, Eye, AlertCircle, Bookmark, Bug, Layers, CheckSquare } from 'lucide-react';

const INITIAL_ISSUES: JiraIssue[] = [
  {
    id: 'issue-1',
    key: 'ENG-402',
    title: 'Implement Redis distributed lock for checkout worker queue',
    status: 'in_progress',
    priority: 'critical',
    type: 'story',
    assignee: { name: 'Alex Rivera', initials: 'AR' },
    points: 5,
    sprint: 'Sprint 34',
    updatedAt: '12m ago',
  },
  {
    id: 'issue-2',
    key: 'ENG-408',
    title: 'Resolve latency spike in Stripe webhook ingestion handler',
    status: 'in_review',
    priority: 'high',
    type: 'bug',
    assignee: { name: 'Sophia Patel', initials: 'SP' },
    points: 8,
    sprint: 'Sprint 34',
    updatedAt: '35m ago',
  },
  {
    id: 'issue-3',
    key: 'ENG-411',
    title: 'Configure automated SLO burn alerts in Datadog via Terraform',
    status: 'done',
    priority: 'medium',
    type: 'task',
    assignee: { name: 'James Wilson', initials: 'JW' },
    points: 3,
    sprint: 'Sprint 34',
    updatedAt: '2h ago',
  },
  {
    id: 'issue-4',
    key: 'ENG-419',
    title: 'Migrate legacy GraphQL Gateway to Apollo Router v2',
    status: 'in_progress',
    priority: 'high',
    type: 'story',
    assignee: { name: 'Elena Rostova', initials: 'ER' },
    points: 13,
    sprint: 'Sprint 34',
    updatedAt: '4h ago',
  },
  {
    id: 'issue-5',
    key: 'ENG-422',
    title: 'Upgrade RDS Postgres read replicas to Aurora Serverless v2',
    status: 'done',
    priority: 'medium',
    type: 'epic',
    assignee: { name: 'Marcus Chen', initials: 'MC' },
    points: 5,
    sprint: 'Sprint 34',
    updatedAt: '1d ago',
  },
  {
    id: 'issue-6',
    key: 'ENG-428',
    title: 'Audit and remediate third-party npm package vulnerabilities',
    status: 'backlog',
    priority: 'low',
    type: 'task',
    assignee: { name: 'David Kim', initials: 'DK' },
    points: 2,
    sprint: 'Sprint 34',
    updatedAt: '1d ago',
  },
];

export const IssueTrackerWidget: React.FC<WidgetProps> = ({ config }) => {
  const [issues, setIssues] = useState<JiraIssue[]>(INITIAL_ISSUES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.key.toLowerCase().includes(search.toLowerCase()) ||
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.assignee.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = (id: string, newStatus: IssueStatus) => {
    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus, updatedAt: 'Just now' } : item))
    );
  };

  const getPriorityBadge = (priority: IssuePriority) => {
    switch (priority) {
      case 'critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">CRITICAL</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">MED</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/60 text-slate-300 border border-slate-600/40">LOW</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case 'story': return <Bookmark className="w-3.5 h-3.5 text-emerald-400" />;
      case 'epic': return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      default: return <CheckSquare className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const statusOptions: { value: IssueStatus; label: string; color: string }[] = [
    { value: 'backlog', label: 'Backlog', color: 'text-slate-400' },
    { value: 'in_progress', label: 'In Progress', color: 'text-indigo-400' },
    { value: 'in_review', label: 'In Review', color: 'text-amber-400' },
    { value: 'done', label: 'Done', color: 'text-emerald-400' },
  ];

  const totalPoints = issues.reduce((acc, i) => acc + i.points, 0);
  const donePoints = issues.filter((i) => i.status === 'done').reduce((acc, i) => acc + i.points, 0);

  return (
    <div className="flex flex-col h-full p-4 select-text">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sprint tickets..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Sprint progress meter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            {donePoints}/{totalPoints} pts ({Math.round((donePoints / (totalPoints || 1)) * 100)}%)
          </span>
          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(donePoints / (totalPoints || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs">
            No sprint tickets match current filters
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all duration-150 group"
            >
              {/* Left: Type, Key, Title */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span title={issue.type}>{getTypeIcon(issue.type)}</span>
                <span className="font-mono text-xs font-semibold text-indigo-400 hover:underline cursor-pointer shrink-0">
                  {issue.key}
                </span>
                <span className="text-xs text-slate-200 truncate font-medium group-hover:text-white transition-colors">
                  {issue.title}
                </span>
              </div>

              {/* Right: Priority, Story Points, Interactive Status, Assignee */}
              <div className="flex items-center gap-2 shrink-0">
                {getPriorityBadge(issue.priority)}

                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700" title="Story Points">
                  {issue.points} pt
                </span>

                {/* Status selector */}
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                  className="bg-slate-950/80 border border-slate-700 rounded px-2 py-0.5 text-[11px] font-medium text-slate-300 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Assignee Avatar */}
                <div
                  className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-[10px] font-bold shadow"
                  title={issue.assignee.name}
                >
                  {issue.assignee.initials}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
