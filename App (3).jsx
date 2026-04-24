import { useState, useEffect } from "react";

const ISSUE_TYPES = ["Pricing Mismatch", "Availability Issue", "Content Inconsistency"];
const SOURCES = ["Partner API", "Internal System", "Distribution Channel"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["All", "Pending", "In Progress", "Resolved"];

const TEAM_MAP = {
  "Pricing Mismatch": "Partner Ops Team",
  "Availability Issue": "Inventory Team",
  "Content Inconsistency": "Content Team",
};

const SLA_MAP = { High: "2h", Medium: "6h", Low: "24h" };

const SYNC_LOGS = [
  "✔ Update sent to Channel Manager",
  "✔ PMS updated",
  "✔ Partner notified",
];

const PRIORITY_BADGE = {
  Low: "bg-gray-200 text-gray-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-blue-600 text-white",
};

const STATUS_BADGE = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
};

const SUGGESTED_ACTION = {
  "Pricing Mismatch": "Sync pricing across channel manager and notify partner",
  "Availability Issue": "Reconcile inventory and trigger availability update",
  "Content Inconsistency": "Validate content and push update to distribution channels",
};

const CONFIDENCE_MAP = {
  "Pricing Mismatch": { label: "High", color: "text-green-600" },
  "Availability Issue": { label: "Medium", color: "text-yellow-600" },
  "Content Inconsistency": { label: "Medium", color: "text-yellow-600" },
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
}

let nextId = 7;

function createIssue(type, source, priority) {
  return {
    id: nextId++,
    type,
    source,
    priority,
    status: "Pending",
    createdAt: new Date(),
    isNew: true,
  };
}

const DUMMY_ISSUES = [
  { id: 1, type: "Pricing Mismatch", source: "Partner API", priority: "High", status: "Pending", createdAt: new Date() },
  { id: 2, type: "Availability Issue", source: "Internal System", priority: "Medium", status: "In Progress", createdAt: new Date() },
  { id: 3, type: "Content Inconsistency", source: "Distribution Channel", priority: "Low", status: "Resolved", createdAt: new Date() },
  { id: 4, type: "Pricing Mismatch", source: "Distribution Channel", priority: "Medium", status: "In Progress", createdAt: new Date() },
  { id: 5, type: "Availability Issue", source: "Partner API", priority: "High", status: "Pending", createdAt: new Date() },
  { id: 6, type: "Content Inconsistency", source: "Internal System", priority: "Low", status: "Resolved", createdAt: new Date() },
];

function ActivityTimeline({ issue }) {
  const team = TEAM_MAP[issue.type];
  const steps = [];

  steps.push({ icon: "📡", text: `Issue detected from ${issue.source}` });
  if (issue.status === "In Progress" || issue.status === "Resolved") {
    steps.push({ icon: "🔧", text: `Work started by ${team}` });
  }
  if (issue.status === "Resolved") {
    steps.push({ icon: "✅", text: "Marked resolved successfully" });
  }

  return (
    <div className="mt-1">
      <p className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-2">Activity</p>
      <div className="flex flex-col gap-1.5 pl-1 border-l-2 border-blue-100">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2 pl-2">
            <span className="text-xs leading-4">{step.icon}</span>
            <span className="text-xs text-gray-500 leading-4">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueCard({ issue, onStart, onResolve }) {
  const team = TEAM_MAP[issue.type];
  const sla = SLA_MAP[issue.priority];
  const isHighRisk = issue.priority === "High" && issue.status !== "Resolved";

  return (
    <div
      className={`bg-white shadow-md rounded-xl p-4 flex flex-col gap-3 border border-gray-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        issue.isNew ? "animate-pulse-once ring-2 ring-blue-200" : ""
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-800 text-base leading-tight">{issue.type}</p>
          <p className="text-gray-500 text-sm mt-0.5">{issue.source}</p>
          <span className="inline-block mt-1.5 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">
            Channel Sync
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_BADGE[issue.priority]}`}>
            {issue.priority}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[issue.status]}`}>
            {issue.status}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="text-gray-600">
          <span className="font-medium text-gray-700">Team:</span> {team}
        </span>
        <span className={`font-medium ${isHighRisk ? "text-red-500" : "text-blue-600"}`}>
          ⏱ SLA: {sla} remaining{isHighRisk ? " • Escalation risk" : ""}
        </span>
      </div>

      {/* Sync Log */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-2">System Sync Log</p>
        <ul className="flex flex-col gap-1">
          {SYNC_LOGS.map((log, i) => (
            <li key={i} className="text-sm text-gray-600">{log}</li>
          ))}
        </ul>
      </div>

      {/* Suggested Action */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-1">
        <p className="text-blue-700 text-xs font-bold uppercase tracking-wide mb-1">💡 Suggested Next Action</p>
        <p className="text-blue-700 text-sm">{SUGGESTED_ACTION[issue.type]}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs text-gray-400">Auto-generated recommendation</p>
          <span className={`text-xs font-medium ${CONFIDENCE_MAP[issue.type].color}`}>
            Confidence: {CONFIDENCE_MAP[issue.type].label}
          </span>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <ActivityTimeline issue={issue} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {issue.status === "Pending" && (
          <button
            onClick={() => onStart(issue.id)}
            className="bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Start Work
          </button>
        )}
        {issue.status === "In Progress" && (
          <button
            onClick={() => onResolve(issue.id)}
            className="bg-green-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Mark Resolved
          </button>
        )}
        {issue.status === "Resolved" && (
          <span className="text-sm text-green-600 font-medium py-1.5">✅ Resolved</span>
        )}
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-400 pt-0.5">
        Last updated: {timeAgo(issue.updatedAt || issue.createdAt)}
      </p>
    </div>
  );
}

function DetectionLog({ logs }) {
  if (logs.length === 0) return null;
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col gap-1.5 transition-all duration-300">
      {logs.map((log, i) => (
        <p key={i} className="text-sm text-blue-700 font-mono">{log}</p>
      ))}
    </div>
  );
}

export default function App() {
  const [issues, setIssues] = useState(DUMMY_ISSUES);
  const [form, setForm] = useState({ type: ISSUE_TYPES[0], source: SOURCES[0], priority: PRIORITIES[1] });
  const [activeTab, setActiveTab] = useState("All");
  const [detectionLogs, setDetectionLogs] = useState([]);

  const clearNewFlag = (id) => {
    setTimeout(() => {
      setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, isNew: false } : i)));
    }, 2000);
  };

  const handleCreate = () => {
    const issue = createIssue(form.type, form.source, form.priority);
    setIssues((prev) => [issue, ...prev]);
    clearNewFlag(issue.id);
  };

  const handleStart = (id) =>
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: "In Progress", updatedAt: new Date() } : i)));

  const handleResolve = (id) =>
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Resolved", updatedAt: new Date() } : i)));

  const handleSimulate = () => {
    const type = ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];

    setDetectionLogs([]);

    // Step 1 — signal received
    setTimeout(() => {
      setDetectionLogs([`📡 Signal received from ${source}`]);
    }, 0);

    // Step 2 — anomaly detected + issue created
    setTimeout(() => {
      setDetectionLogs((prev) => [...prev, `⚠ Anomaly detected in ${type}`]);
      const issue = createIssue(type, source, priority);
      setIssues((prev) => [issue, ...prev]);
      clearNewFlag(issue.id);
    }, 700);

    // Step 3 — confirmation log
    setTimeout(() => {
      setDetectionLogs((prev) => [...prev, `✔ Issue auto-created and assigned to ${TEAM_MAP[type]}`]);
      setTimeout(() => setDetectionLogs([]), 4000);
    }, 1400);
  };

  const filtered = activeTab === "All" ? issues : issues.filter((i) => i.status === activeTab);

  const counts = {
    All: issues.length,
    Pending: issues.filter((i) => i.status === "Pending").length,
    "In Progress": issues.filter((i) => i.status === "In Progress").length,
    Resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  const highPriorityUnresolved = issues.filter(
    (i) => i.priority === "High" && i.status !== "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <style>{`
        @keyframes pulse-once {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s ease-out;
        }
      `}</style>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-blue-600 tracking-tight">OpsFlow Dashboard</h1>
            <p className="text-gray-500 text-sm">Issue → Action → Resolution Tracking</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Active
            </span>
            <button
              onClick={handleSimulate}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              ⚡ Simulate Incoming Signal
            </button>
          </div>
        </div>

        {/* Insight Banner */}
        {highPriorityUnresolved > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-700 text-sm font-medium">
            ⚡ {highPriorityUnresolved} high-priority issue{highPriorityUnresolved !== 1 ? "s" : ""} require immediate attention across systems
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: counts.All, color: "text-blue-600" },
            { label: "Pending", value: counts.Pending, color: "text-yellow-600" },
            { label: "In Progress", value: counts["In Progress"], color: "text-blue-500" },
            { label: "Resolved", value: counts.Resolved, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col gap-1 transition-all duration-200 hover:shadow-lg">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Issue Creation Form */}
        <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6">
          <h2 className="text-gray-800 font-semibold text-base mb-4">Manual Input <span className="text-gray-400 font-normal">(Fallback)</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Issue Type</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Source</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              >
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Priority</label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white font-medium rounded-lg px-5 py-2 text-sm hover:bg-blue-700 transition-colors duration-200"
          >
            + Log Operational Issue
          </button>
        </div>

        {/* Detection Log Panel */}
        <DetectionLog logs={detectionLogs} />

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-xs font-bold ${activeTab === tab ? "opacity-80" : "text-gray-400"}`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Issue Cards Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No issues found. Create one above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onStart={handleStart}
                onResolve={handleResolve}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs pb-2">OpsFlow Dashboard · Internal Operations · 2026</p>
      </div>
    </div>
  );
}
