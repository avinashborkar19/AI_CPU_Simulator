'use client';

import React from 'react';
import { WinnerResult } from '@/lib/scheduling';
import { Trophy, CheckCircle2, ArrowRight } from 'lucide-react';

interface ComparisonTableProps {
  winnerResult: WinnerResult;
  onSelectAlgorithm: (algo: 'FCFS' | 'SJF' | 'Round Robin' | 'Priority') => void;
}

export default function ComparisonTable({ winnerResult, onSelectAlgorithm }: ComparisonTableProps) {
  const { winner, results, margin } = winnerResult;

  const algos: Array<'FCFS' | 'SJF' | 'Round Robin' | 'Priority'> = [
    'FCFS',
    'SJF',
    'Round Robin',
    'Priority',
  ];

  // Maximum average waiting time for scaling comparison bars
  const maxWT = Math.max(...algos.map((a) => results[a].avgWaitingTime), 1);
  const maxTAT = Math.max(...algos.map((a) => results[a].avgTurnaroundTime), 1);

  return (
    <section id="comparison" className="comparison-card">
      <div className="card-header">
        <div className="header-meta">
          <div className="badge">BENCHMARK MATRIX</div>
          <h2 className="section-title">Four-Way Scheduling Strategy Comparison</h2>
          <p className="section-desc">
            Direct comparison of all four algorithms evaluated on the identical workload and quantum setting.
          </p>
        </div>

        <div className="winner-banner">
          <Trophy size={16} className="trophy-icon" />
          <div className="banner-content">
            <span className="banner-title">WINNER: {winner}</span>
            <span className="banner-sub">{margin}</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Avg Waiting (WT)</th>
              <th>Avg Turnaround (TAT)</th>
              <th>Avg Response</th>
              <th>CPU Utilization</th>
              <th>Context Switches</th>
              <th>Visual WT Ratio</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {algos.map((algo) => {
              const res = results[algo];
              const isWinner = algo === winner;
              const wtPercent = Math.min(100, Math.max(12, (res.avgWaitingTime / maxWT) * 100));

              return (
                <tr key={algo} className={isWinner ? 'winner-row' : ''}>
                  <td className="algo-name-cell">
                    <div className="algo-label-group">
                      {isWinner && <CheckCircle2 size={15} className="winner-check" />}
                      <span className="algo-text">{algo}</span>
                      {isWinner && <span className="winner-tag">BEST</span>}
                    </div>
                  </td>
                  <td className="num-cell">
                    <span className={`stat-val ${isWinner ? 'stat-winner' : ''}`}>
                      {res.avgWaitingTime.toFixed(2)}s
                    </span>
                  </td>
                  <td className="num-cell">{res.avgTurnaroundTime.toFixed(2)}s</td>
                  <td className="num-cell">{res.avgResponseTime.toFixed(2)}s</td>
                  <td className="num-cell">{res.cpuUtilization.toFixed(1)}%</td>
                  <td className="num-cell">{res.contextSwitches}</td>
                  <td className="bar-cell">
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${isWinner ? 'bar-winner' : ''}`}
                        style={{ width: `${wtPercent}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="action-cell">
                    <button
                      onClick={() => onSelectAlgorithm(algo)}
                      className="view-btn"
                      title={`Inspect ${algo} timeline and metrics`}
                    >
                      <span>View</span>
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Decision Logic Annotation */}
      <div className="verdict-bar">
        <span className="verdict-label">EVALUATION LOGIC:</span>
        <span className="verdict-text">
          Primary ranking metric is <strong>Lowest Average Waiting Time</strong>. Ties are strictly broken by <strong>Lowest Average Turnaround Time</strong>, followed by minimal context switches.
        </span>
      </div>

      <style jsx>{`
        .comparison-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 24px;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
          position: relative;
        }

        .comparison-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-medium);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
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
          max-width: 650px;
        }

        .winner-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background-color: var(--accent-subtle);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-sm);
        }

        .trophy-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .banner-content {
          display: flex;
          flex-direction: column;
        }

        .banner-title {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.04em;
        }

        .banner-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .comparison-table th {
          background-color: var(--bg-surface-elevated);
          padding: 12px 14px;
          font-family: var(--font-mono);
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .comparison-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
        }

        .comparison-table tr:last-child td {
          border-bottom: none;
        }

        .winner-row td {
          background-color: rgba(255, 92, 0, 0.04);
        }

        .winner-row:hover td {
          background-color: rgba(255, 92, 0, 0.08);
        }

        .algo-name-cell {
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .algo-label-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .winner-check {
          color: var(--accent);
        }

        .algo-text {
          color: var(--text-primary);
        }

        .winner-tag {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          background-color: var(--accent);
          color: var(--text-inverse);
          letter-spacing: 0.05em;
        }

        .num-cell {
          font-family: var(--font-mono);
          color: var(--text-secondary);
        }

        .stat-val {
          font-weight: 600;
        }

        .stat-winner {
          color: var(--accent);
          font-weight: 700;
        }

        .bar-cell {
          min-width: 140px;
        }

        .bar-track {
          width: 100%;
          height: 8px;
          background-color: var(--bg-input);
          border-radius: var(--radius-xs);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
        }

        .bar-fill {
          height: 100%;
          background-color: var(--text-muted);
          border-radius: var(--radius-xs);
          transition: width var(--transition-normal);
        }

        .bar-winner {
          background-color: var(--accent);
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          transition: all var(--transition-fast);
        }

        .view-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-medium);
        }

        .verdict-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          font-size: 0.78rem;
        }

        .verdict-label {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.05em;
        }

        .verdict-text {
          color: var(--text-secondary);
        }

        .verdict-text strong {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .comparison-card {
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
}
