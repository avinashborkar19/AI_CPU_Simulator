'use client';

import React, { useState } from 'react';
import { ScheduleSlice, AlgorithmResult } from '@/lib/scheduling';
import { Clock, Sliders, Info } from 'lucide-react';

interface GanttChartProps {
  algorithmResult: AlgorithmResult;
  selectedAlgorithm: 'FCFS' | 'SJF' | 'Round Robin' | 'Priority';
  onSelectAlgorithm: (algo: 'FCFS' | 'SJF' | 'Round Robin' | 'Priority') => void;
  quantum: number;
  onQuantumChange: (q: number) => void;
}

// Map task PID to CSS color tokens (strictly non-blue/purple hues)
function getTaskColor(taskId: string, isIdle: boolean): { bg: string; text: string; border: string } {
  if (isIdle) {
    return {
      bg: 'var(--task-idle-bg)',
      text: 'var(--text-muted)',
      border: 'var(--border-medium)',
    };
  }

  switch (taskId) {
    case 'P1':
      return { bg: 'rgba(245, 158, 11, 0.18)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.45)' };
    case 'P2':
      return { bg: 'rgba(16, 185, 129, 0.18)', text: '#10B981', border: 'rgba(16, 185, 129, 0.45)' };
    case 'P3':
      return { bg: 'rgba(225, 29, 72, 0.18)', text: '#E11D48', border: 'rgba(225, 29, 72, 0.45)' };
    case 'P4':
      return { bg: 'rgba(132, 204, 22, 0.18)', text: '#84CC16', border: 'rgba(132, 204, 22, 0.45)' };
    case 'P5':
      return { bg: 'rgba(217, 119, 6, 0.18)', text: '#D97706', border: 'rgba(217, 119, 6, 0.45)' };
    default:
      return { bg: 'rgba(255, 92, 0, 0.18)', text: '#FF5C00', border: 'rgba(255, 92, 0, 0.45)' };
  }
}

export default function GanttChart({
  algorithmResult,
  selectedAlgorithm,
  onSelectAlgorithm,
  quantum,
  onQuantumChange,
}: GanttChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<ScheduleSlice | null>(null);

  const algorithms: Array<'FCFS' | 'SJF' | 'Round Robin' | 'Priority'> = [
    'FCFS',
    'SJF',
    'Round Robin',
    'Priority',
  ];

  const { slices } = algorithmResult;
  const totalDuration = slices.length > 0 ? slices[slices.length - 1].endTime : 0;

  return (
    <section id="timeline" className="gantt-card">
      <div className="card-header">
        <div className="header-meta">
          <div className="badge">EXECUTION TIMELINE</div>
          <h2 className="section-title">Visual Gantt Chart & Dispatch Sequence</h2>
          <p className="section-desc">
            To-scale proportional timeline displaying CPU execution slices. Slices scale by duration, and idle blocks are explicitly hatched.
          </p>
        </div>

        {/* Algorithm Switcher & Quantum Input */}
        <div className="controls-group">
          {selectedAlgorithm === 'Round Robin' && (
            <div className="quantum-control">
              <label htmlFor="quantum-input" className="quantum-label">
                <Clock size={13} />
                <span>Quantum (q):</span>
              </label>
              <div className="quantum-input-wrap">
                <input
                  id="quantum-input"
                  type="number"
                  min="1"
                  max="50"
                  value={quantum}
                  onChange={(e) => onQuantumChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantum-input"
                />
                <span className="quantum-unit">s</span>
              </div>
            </div>
          )}

          <div className="algo-selector" role="tablist">
            {algorithms.map((algo) => (
              <button
                key={algo}
                role="tab"
                aria-selected={selectedAlgorithm === algo}
                onClick={() => onSelectAlgorithm(algo)}
                className={`algo-btn ${selectedAlgorithm === algo ? 'active' : ''}`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Timeline Container */}
      <div className="gantt-viewport">
        {slices.length === 0 ? (
          <div className="empty-gantt">No tasks to schedule. Add tasks above.</div>
        ) : (
          <div className="gantt-strip">
            {slices.map((slice, index) => {
              const colors = getTaskColor(slice.taskId, slice.isIdle);
              return (
                <div
                  key={`${slice.taskId}-${slice.startTime}-${index}`}
                  className={`gantt-slice ${slice.isIdle ? 'slice-idle' : ''}`}
                  style={{
                    flexGrow: slice.duration,
                    flexShrink: 0,
                    flexBasis: `${Math.max(40, slice.duration * 24)}px`,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <span className="slice-pid">{slice.taskId}</span>
                  <span className="slice-duration">{slice.duration}s</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Time Axis Markers */}
        {slices.length > 0 && (
          <div className="time-axis">
            {slices.map((slice, index) => (
              <div
                key={`tick-${slice.startTime}-${index}`}
                className="axis-tick-wrap"
                style={{
                  flexGrow: slice.duration,
                  flexShrink: 0,
                  flexBasis: `${Math.max(40, slice.duration * 24)}px`,
                }}
              >
                <span className="tick-val tick-start">{slice.startTime}</span>
                {index === slices.length - 1 && (
                  <span className="tick-val tick-end">{slice.endTime}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Information Banner */}
      <div className="slice-inspector">
        <Info size={14} className="info-icon" />
        {hoveredSlice ? (
          <span className="inspector-text">
            <strong>{hoveredSlice.taskId}</strong>: {hoveredSlice.taskName} · Start: <code>{hoveredSlice.startTime}s</code> · End: <code>{hoveredSlice.endTime}s</code> · Duration: <code>{hoveredSlice.duration}s</code> {hoveredSlice.isIdle ? '(CPU Unallocated)' : ''}
          </span>
        ) : (
          <span className="inspector-text muted">
            Hover over any Gantt block to inspect dispatch intervals, duration, and process state. Total Span: <code>{totalDuration}s</code> across <code>{slices.length}</code> slices.
          </span>
        )}
      </div>

      <style jsx>{`
        .gantt-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 24px;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
          position: relative;
        }

        .gantt-card:hover {
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

        .controls-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .quantum-control {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .quantum-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .quantum-input-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .quantum-input {
          width: 44px;
          font-family: var(--font-mono);
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--accent);
          text-align: center;
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xs);
          padding: 2px 4px;
        }

        .quantum-unit {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .algo-selector {
          display: flex;
          align-items: center;
          padding: 3px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          gap: 2px;
        }

        /* Reliable CSS background transitions for algorithm toggle button */
        .algo-btn {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          padding: 6px 12px;
          border-radius: var(--radius-xs);
          color: var(--text-secondary);
          background-color: transparent;
          transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
          border: 1px solid transparent;
        }

        .algo-btn:hover {
          color: var(--text-primary);
        }

        .algo-btn.active {
          background-color: var(--accent);
          color: var(--text-inverse);
          font-weight: 700;
          border-color: var(--accent-hover);
        }

        .gantt-viewport {
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 20px 16px;
          overflow-x: auto;
          margin-bottom: 14px;
        }

        .empty-gantt {
          padding: 32px;
          text-align: center;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .gantt-strip {
          display: flex;
          align-items: stretch;
          height: 60px;
          border-radius: var(--radius-xs);
          overflow: hidden;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          min-width: 600px;
        }

        .gantt-slice {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-right: 1px solid var(--border-medium);
          padding: 4px;
          cursor: pointer;
          transition: transform var(--transition-fast), filter var(--transition-fast);
          position: relative;
        }

        .gantt-slice:last-child {
          border-right: none;
        }

        .gantt-slice:hover {
          filter: brightness(1.25);
          z-index: 2;
        }

        .slice-idle {
          background: repeating-linear-gradient(
            -45deg,
            var(--task-idle-bg),
            var(--task-idle-bg) 6px,
            var(--task-idle-hatch) 6px,
            var(--task-idle-hatch) 12px
          ) !important;
        }

        .slice-pid {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .slice-duration {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          opacity: 0.85;
        }

        .time-axis {
          display: flex;
          align-items: center;
          margin-top: 8px;
          min-width: 600px;
          position: relative;
        }

        .axis-tick-wrap {
          position: relative;
          height: 16px;
        }

        .tick-val {
          position: absolute;
          top: 0;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .tick-start {
          left: 0;
          transform: translateX(-50%);
        }

        .tick-end {
          right: 0;
          transform: translateX(50%);
        }

        .slice-inspector {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          font-size: 0.8rem;
        }

        .info-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .inspector-text {
          font-family: var(--font-mono);
          color: var(--text-secondary);
        }

        .inspector-text.muted {
          color: var(--text-muted);
        }

        .inspector-text strong {
          color: var(--text-primary);
        }

        .inspector-text code {
          color: var(--accent);
        }

        @media (max-width: 768px) {
          .gantt-card {
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
}
