'use client';

import React, { useEffect, useState } from 'react';
import { AlgorithmResult } from '@/lib/scheduling';
import { Timer, RefreshCw, Cpu, Zap, PauseCircle, Clock } from 'lucide-react';

interface MetricsDisplayProps {
  algorithmResult: AlgorithmResult;
}

// Micro-hook for animated number counter
function AnimatedCounter({ value, decimals = 2, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const [displayVal, setDisplayVal] = useState<number>(value);

  useEffect(() => {
    let startTime: number | null = null;
    const startVal = displayVal;
    const duration = 400; // ms

    function animate(time: number) {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const current = startVal + (value - startVal) * progress;
      setDisplayVal(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayVal(value);
      }
    }
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {displayVal.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function MetricsDisplay({ algorithmResult }: MetricsDisplayProps) {
  const {
    algorithm,
    processMetrics,
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    cpuUtilization,
    idleTime,
    contextSwitches,
  } = algorithmResult;

  return (
    <section id="metrics" className="metrics-card">
      <div className="card-header">
        <div className="header-meta">
          <div className="badge">TELEMETRY & METRICS</div>
          <h2 className="section-title">{algorithm} Performance Analytics</h2>
          <p className="section-desc">
            Exact mathematical telemetry computed per process and aggregated across the workload.
          </p>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="kpi-grid">
        <div className="kpi-box">
          <div className="kpi-icon-wrap">
            <Timer size={16} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Waiting Time (WT)</span>
            <span className="kpi-number">
              <AnimatedCounter value={avgWaitingTime} decimals={2} suffix="s" />
            </span>
            <span className="kpi-sub">Total queue delay</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon-wrap">
            <Clock size={16} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Turnaround (TAT)</span>
            <span className="kpi-number">
              <AnimatedCounter value={avgTurnaroundTime} decimals={2} suffix="s" />
            </span>
            <span className="kpi-sub">Arrival to completion</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon-wrap">
            <Zap size={16} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Response Time</span>
            <span className="kpi-number">
              <AnimatedCounter value={avgResponseTime} decimals={2} suffix="s" />
            </span>
            <span className="kpi-sub">Initial dispatch latency</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon-wrap">
            <Cpu size={16} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">CPU Utilization</span>
            <span className="kpi-number">
              <AnimatedCounter value={cpuUtilization} decimals={1} suffix="%" />
            </span>
            <span className="kpi-sub">Active compute ratio</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon-wrap">
            <RefreshCw size={16} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Context Switches</span>
            <span className="kpi-number">
              <AnimatedCounter value={contextSwitches} decimals={0} />
            </span>
            <span className="kpi-sub">Process swap events</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-icon-wrap">
            <PauseCircle size={16} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">CPU Idle Time</span>
            <span className="kpi-number">
              <AnimatedCounter value={idleTime} decimals={1} suffix="s" />
            </span>
            <span className="kpi-sub">Unscheduled gaps</span>
          </div>
        </div>
      </div>

      {/* Per Process Calculation Table */}
      <div className="table-wrapper">
        <table className="metrics-table">
          <thead>
            <tr>
              <th>PID</th>
              <th>Task Name</th>
              <th>Arrival (AT)</th>
              <th>Burst (BT)</th>
              <th>Priority</th>
              <th>Completion (CT)</th>
              <th>Turnaround (TAT)</th>
              <th>Waiting (WT)</th>
              <th>Response (RT)</th>
            </tr>
          </thead>
          <tbody>
            {processMetrics.map((p) => (
              <tr key={p.taskId}>
                <td className="pid-cell">{p.taskId}</td>
                <td className="name-cell">{p.taskName}</td>
                <td className="num-cell">{p.arrivalTime}s</td>
                <td className="num-cell">{p.burstTime}s</td>
                <td className="num-cell priority-cell">P{p.priority}</td>
                <td className="num-cell highlight-cell">{p.completionTime}s</td>
                <td className="num-cell">{p.turnaroundTime}s</td>
                <td className="num-cell">{p.waitingTime}s</td>
                <td className="num-cell">{p.responseTime}s</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="summary-row">
              <td colSpan={2} className="summary-title">WORKLOAD AVERAGES</td>
              <td colSpan={4}></td>
              <td className="num-cell summary-stat">
                <AnimatedCounter value={avgTurnaroundTime} decimals={2} suffix="s" />
              </td>
              <td className="num-cell summary-stat highlight">
                <AnimatedCounter value={avgWaitingTime} decimals={2} suffix="s" />
              </td>
              <td className="num-cell summary-stat">
                <AnimatedCounter value={avgResponseTime} decimals={2} suffix="s" />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="formula-footer">
        <div className="formula-item">
          <code>TAT = CT − AT</code>
          <span>Turnaround Time = Completion Time minus Arrival Time</span>
        </div>
        <div className="formula-item">
          <code>WT = TAT − BT</code>
          <span>Waiting Time = Turnaround Time minus Burst Time</span>
        </div>
        <div className="formula-item">
          <code>RT = First Start − AT</code>
          <span>Response Time = Time when first dispatched minus Arrival Time</span>
        </div>
      </div>

      <style jsx>{`
        .metrics-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 24px;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
          position: relative;
        }

        .metrics-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-medium);
        }

        .card-header {
          margin-bottom: 20px;
        }

        .badge {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent);
          background-color: var(--accent-subtle);
          border: 1px solid var(--accent-glow);
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          margin-bottom: 8px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .section-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }

        .kpi-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          transition: border-color var(--transition-fast);
        }

        .kpi-box:hover {
          border-color: var(--border-medium);
        }

        .kpi-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .kpi-content {
          display: flex;
          flex-direction: column;
        }

        .kpi-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 2px;
        }

        .kpi-number {
          font-family: var(--font-mono);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .kpi-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }

        .metrics-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.86rem;
        }

        .metrics-table th {
          background-color: var(--bg-surface-elevated);
          padding: 10px 14px;
          font-family: var(--font-mono);
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .metrics-table td {
          padding: 10px 14px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
        }

        .metrics-table tr:hover td {
          background-color: var(--bg-surface-elevated);
        }

        .pid-cell {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--accent);
        }

        .name-cell {
          font-family: var(--font-body);
          color: var(--text-primary);
        }

        .num-cell {
          font-family: var(--font-mono);
          color: var(--text-secondary);
        }

        .priority-cell {
          font-weight: 600;
        }

        .highlight-cell {
          color: var(--text-primary);
          font-weight: 600;
        }

        .summary-row td {
          background-color: var(--bg-surface-elevated);
          border-top: 2px solid var(--border-medium);
          border-bottom: none;
          font-family: var(--font-mono);
        }

        .summary-title {
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-primary);
          font-size: 0.78rem;
        }

        .summary-stat {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .summary-stat.highlight {
          color: var(--accent);
        }

        .formula-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          flex-wrap: wrap;
        }

        .formula-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .formula-item code {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--text-secondary);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          padding: 2px 6px;
          border-radius: var(--radius-xs);
        }

        @media (max-width: 768px) {
          .metrics-card {
            padding: 16px;
          }
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
