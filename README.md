# Engineering Manager Command Center (Desktop Dashboard)

A desktop dashboard application built with **Electron**, **React 18**, **TypeScript**, and **Tailwind CSS**, designed for engineering leadership to monitor and interact with organizational systems, DORA metrics, sprint boards, infrastructure logs, and MCP (Model Context Protocol) agents.

---

## Key Features

### 1. Multi-Dashboard & Jira Cloud-Style Grid Layout
- **Multi-Tab Dashboard Manager:** Switch between "Engineering Metrics", "Jira & Linear Sprint Tracker", "Infrastructure Health & MCP", or create custom named dashboards.
- **Jira Cloud-Style Widget Grid:** Configurable 12-column responsive layout with customizable width (`-W / +W`) and height (`-H / +H`).
- **Layout Locking & Customization Mode:** One-click toggle between locked viewing mode and layout editing mode.
- **Extensive Widget Catalog:**
  - **DORA & KPI Metric Cards:** Cycle time, deployment frequency, MTTR, change failure rate, sparklines, trend comparisons, and status indicators.
  - **Analytics Charts:** Multi-mode charts (Cycle Time vs Merge Rate Area Chart, Sprint Velocity Bar Chart, Work Distribution Donut Chart).
  - **Jira & Linear Sprint Board:** Interactive ticket list with real-time status transitions, priority tags, assignees, and story points.
  - **Streaming Infrastructure Logs:** Live-streaming terminal viewer with severity levels (`INFO`, `WARN`, `ERROR`, `CRITICAL`), service filtering, regex search, and auto-scroll.
  - **MCP Command Console:** Interactive tool runner allowing engineering managers to trigger automated rollbacks, list PRs, or query cluster health directly from connected MCP servers.
  - **SQL Database Table Runner:** Query PostgreSQL or SQLite databases with live tabular results and latency timing.
  - **Engineering Health Radar:** Metric scorecard tracking review turnaround, scope creep stability, workload balance, and pipeline flakiness.

### 2. Extensible Plugin-Style Architecture
- Located in `src/plugins/`:
  - `types.ts`: Formal interface definitions (`WidgetPlugin`, `WidgetProps`, `WidgetConfigProps`).
  - `registry.ts`: Plugin Registry singleton supporting dynamic widget loading and custom plugin extensions.

### 3. Data Integration Hub
- **Model Context Protocol (MCP) Servers:**
  - Supports both `stdio` (command + arguments + environment variables) and `sse` (Server-Sent Events HTTP endpoints).
  - Built-in JSON-RPC 2.0 communication engine with automatic tool discovery and JSON Schema parameter inspection.
- **REST & GraphQL API Endpoints:**
  - Configure Base URLs, timeouts, Bearer tokens, custom API key headers, and Basic auth.
  - One-click "Test Ping" with round-trip latency measurements.
- **Database Connection Pools:**
  - PostgreSQL, SQLite (embedded local cache / in-memory), and MySQL.
  - Connection pooling options, test ping, and interactive SQL query runner.

### 4. Enterprise Settings & System Health
- **Theme Engine:** Pro Dark (default), Midnight Blue, Cyber Slate, and Clean Light.
- **Mock Simulation Engine:** Instant rich demonstration mode for offline presentations.
- **Alert Thresholds:** Configurable warning levels for PR review latency, API P99 SLA, error rates, and sprint blockers.
- **Configuration Backup & Restore:** Export and import full dashboard layouts and data source connections as JSON.
- **Host Diagnostics:** Live monitoring of Electron, Node.js, Chromium versions, and application heap memory.

---

## Project Structure

```text
my-engineering-dashboard/
├── .git/
├── electron/
│   ├── main.ts              # Electron main process, IPC handlers, MCP bridge, store
│   └── preload.ts           # Secure context bridge API
├── src/
│   ├── components/          # Sidebar, Header, WidgetContainer, AddWidgetModal, WidgetConfigModal
│   ├── pages/               # DashboardPage, DataConfigPage, SettingsPage
│   ├── widgets/             # Built-in widget plugins (MetricCard, Chart, IssueTracker, Logs, MCP, DB, Health)
│   ├── plugins/             # Plugin loader, interface definitions, and registry
│   ├── store/               # Zustand stores for dashboards, data sources, and settings
│   ├── services/            # Electron bridge & unified data fetcher
│   ├── types/               # TypeScript interfaces & declarations
│   ├── App.tsx              # Root app component with navigation
│   ├── main.tsx             # React 18 DOM mount
│   └── index.css            # Tailwind CSS & design tokens
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.electron.json
└── vite.config.ts
```

---

## Development & Build Commands

```bash
# Install dependencies
npm install

# Start development mode (Vite Dev Server + Electron)
npm run dev

# Run Vite dev server only (in-browser preview with graceful bridge fallback)
npm run dev:vite

# Run Electron desktop window only
npm run dev:electron

# Build production bundle (Renderer + Electron Main/Preload)
npm run build

# Start packaged Electron application
npm run start
```

---

## Security & Context Isolation
- **Context Isolation:** `contextIsolation: true` is strictly enforced.
- **Node Integration Disabled:** `nodeIntegration: false` prevents unauthorized renderer access.
- **IPC Whitelisting:** All file operations, external network requests, and child processes are routed securely through typed IPC handlers in `electron/main.ts` and exposed via `electron/preload.ts`.
