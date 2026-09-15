'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/scheduling';
import { Plus, Trash2, RotateCcw, Sparkles, Layers } from 'lucide-react';

interface TaskEditorProps {
  tasks: Task[];
  onTasksChange: (newTasks: Task[]) => void;
}

export const DEFAULT_AI_WORKLOAD: Task[] = [
  { id: 'P1', name: 'Data preprocessing', arrivalTime: 0, burstTime: 7, priority: 2 },
  { id: 'P2', name: 'Model training', arrivalTime: 2, burstTime: 12, priority: 3 },
  { id: 'P3', name: 'Model validation', arrivalTime: 4, burstTime: 4, priority: 2 },
  { id: 'P4', name: 'Model inference', arrivalTime: 5, burstTime: 2, priority: 1 },
  { id: 'P5', name: 'Report generation', arrivalTime: 9, burstTime: 5, priority: 4 },
];

const PRESETS = [
  {
    name: 'Default AI Workload',
    description: 'Demonstrates convoy effect & separates SJF from Priority',
    tasks: DEFAULT_AI_WORKLOAD,
  },
  {
    name: 'Concurrent (All at t=0)',
    description: 'Eliminates arrival delays; pure burst vs priority competition',
    tasks: [
      { id: 'P1', name: 'Data preprocessing', arrivalTime: 0, burstTime: 6, priority: 2 },
      { id: 'P2', name: 'Model training', arrivalTime: 0, burstTime: 10, priority: 3 },
      { id: 'P3', name: 'Model validation', arrivalTime: 0, burstTime: 4, priority: 2 },
      { id: 'P4', name: 'Model inference', arrivalTime: 0, burstTime: 2, priority: 1 },
      { id: 'P5', name: 'Report generation', arrivalTime: 0, burstTime: 5, priority: 4 },
    ],
  },
  {
    name: 'CPU Idle Gaps',
    description: 'Demonstrates explicit CPU idle blocks between sparse arrivals',
    tasks: [
      { id: 'P1', name: 'Early inference', arrivalTime: 0, burstTime: 2, priority: 1 },
      { id: 'P2', name: 'Batch checkpoint', arrivalTime: 8, burstTime: 3, priority: 2 },
      { id: 'P3', name: 'Late evaluation', arrivalTime: 16, burstTime: 4, priority: 1 },
    ],
  },
  {
    name: 'Convoy Stress Test',
    description: 'Massive training run blocks subsequent sub-second micro-inferences',
    tasks: [
      { id: 'P1', name: 'Deep LLM epoch training', arrivalTime: 0, burstTime: 20, priority: 4 },
      { id: 'P2', name: 'Realtime query inference A', arrivalTime: 1, burstTime: 2, priority: 1 },
      { id: 'P3', name: 'Realtime query inference B', arrivalTime: 2, burstTime: 1, priority: 1 },
      { id: 'P4', name: 'Cache invalidate broadcast', arrivalTime: 3, burstTime: 2, priority: 2 },
    ],
  },
];

export default function TaskEditor({ tasks, onTasksChange }: TaskEditorProps) {
  const [activePreset, setActivePreset] = useState<string>('Default AI Workload');

  const updateField = (index: number, field: keyof Task, val: string) => {
    const updated = [...tasks];
    const task = { ...updated[index] };

    if (field === 'name' || field === 'id') {
      task[field] = val;
    } else {
      const num = parseInt(val, 10);
      task[field] = isNaN(num) ? 0 : Math.max(0, num);
    }
    updated[index] = task;
    onTasksChange(updated);
  };

  const addTask = () => {
    if (tasks.length >= 15) return;
    const nextId = `P${tasks.length + 1}`;
    const newTask: Task = {
      id: nextId,
      name: `AI Subtask ${tasks.length + 1}`,
      arrivalTime: tasks.length > 0 ? tasks[tasks.length - 1].arrivalTime + 2 : 0,
      burstTime: 4,
      priority: 2,
    };
    onTasksChange([...tasks, newTask]);
  };

  const removeTask = (index: number) => {
    if (tasks.length <= 1) return;
    const updated = tasks.filter((_, i) => i !== index);
    onTasksChange(updated);
  };

  const loadPreset = (presetName: string) => {
    const found = PRESETS.find((p) => p.name === presetName);
    if (found) {
      setActivePreset(found.name);
      onTasksChange(JSON.parse(JSON.stringify(found.tasks)));
    }
  };

  const resetDefault = () => {
    loadPreset('Default AI Workload');
  };

  return (
    <section id="workload" className="task-editor-card">
      <div className="card-header">
        <div className="header-meta">
          <div className="badge">INPUT SPECIFICATION</div>
          <h2 className="section-title">AI Workload & Process Parameters</h2>
          <p className="section-desc">
            Define computational processes scheduled on the AI server. Lower priority number denotes higher urgency (1 = Urgent Real-time).
          </p>
        </div>

        <div className="header-actions">
          <button onClick={resetDefault} className="btn-secondary" title="Reset to Default AI Workload">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
          <button onClick={addTask} className="btn-primary" disabled={tasks.length >= 15}>
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="presets-bar">
        <span className="presets-label">
          <Layers size={13} />
          <span>Presets:</span>
        </span>
        <div className="preset-buttons">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p.name)}
              className={`preset-btn ${activePreset === p.name ? 'active' : ''}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Task Table */}
      <div className="table-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>PID</th>
              <th>Task / Process Name</th>
              <th style={{ width: '130px' }}>Arrival Time</th>
              <th style={{ width: '130px' }}>Burst Time</th>
              <th style={{ width: '130px' }}>Priority (1=High)</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, idx) => (
              <tr key={task.id || idx}>
                <td>
                  <input
                    type="text"
                    value={task.id}
                    onChange={(e) => updateField(idx, 'id', e.target.value)}
                    className="input-cell pid-input"
                    maxLength={5}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => updateField(idx, 'name', e.target.value)}
                    className="input-cell name-input"
                    placeholder="e.g. Model inference"
                  />
                </td>
                <td>
                  <div className="number-cell">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={task.arrivalTime}
                      onChange={(e) => updateField(idx, 'arrivalTime', e.target.value)}
                      className="input-cell"
                    />
                    <span className="unit-label">s</span>
                  </div>
                </td>
                <td>
                  <div className="number-cell">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={task.burstTime}
                      onChange={(e) => updateField(idx, 'burstTime', e.target.value)}
                      className="input-cell"
                    />
                    <span className="unit-label">s</span>
                  </div>
                </td>
                <td>
                  <div className="priority-cell">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={task.priority}
                      onChange={(e) => updateField(idx, 'priority', e.target.value)}
                      className="input-cell"
                    />
                    <span className={`priority-tag p-${task.priority <= 2 ? 'high' : task.priority === 3 ? 'med' : 'low'}`}>
                      {task.priority === 1 ? 'URGENT' : task.priority <= 2 ? 'HIGH' : task.priority === 3 ? 'MED' : 'LOW'}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => removeTask(idx)}
                    disabled={tasks.length <= 1}
                    className="delete-btn"
                    title="Remove task"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .task-editor-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 24px;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
          position: relative;
        }

        .task-editor-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-medium);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
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
          max-width: 680px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--accent);
          color: var(--text-inverse);
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          transition: background-color var(--transition-fast), transform var(--transition-fast);
        }

        .btn-primary:hover:not(:disabled) {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--bg-surface-elevated);
          color: var(--text-secondary);
          border: 1px solid var(--border-medium);
          font-family: var(--font-mono);
          font-size: 0.82rem;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          transition: border-color var(--transition-fast), color var(--transition-fast);
        }

        .btn-secondary:hover {
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .presets-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .presets-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .preset-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .preset-btn {
          font-family: var(--font-mono);
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .preset-btn:hover {
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .preset-btn.active {
          border-color: var(--border-accent);
          background-color: var(--accent-subtle);
          color: var(--accent);
          font-weight: 600;
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .task-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .task-table th {
          background-color: var(--bg-surface-elevated);
          padding: 10px 14px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-subtle);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .task-table td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
        }

        .task-table tr:last-child td {
          border-bottom: none;
        }

        .task-table tr:hover td {
          background-color: var(--bg-surface-elevated);
        }

        .input-cell {
          width: 100%;
          padding: 6px 10px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          transition: border-color var(--transition-fast);
        }

        .input-cell:focus {
          border-color: var(--border-accent);
        }

        .pid-input {
          font-weight: 700;
          color: var(--accent);
          text-align: center;
        }

        .name-input {
          font-family: var(--font-body);
        }

        .number-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .unit-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .priority-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .priority-tag {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          letter-spacing: 0.05em;
        }

        .priority-tag.p-high {
          background-color: rgba(225, 29, 72, 0.15);
          color: #E11D48;
          border: 1px solid rgba(225, 29, 72, 0.3);
        }

        .priority-tag.p-med {
          background-color: rgba(245, 158, 11, 0.15);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .priority-tag.p-low {
          background-color: rgba(132, 204, 22, 0.15);
          color: #84CC16;
          border: 1px solid rgba(132, 204, 22, 0.3);
        }

        .delete-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: var(--radius-xs);
          transition: color var(--transition-fast), background-color var(--transition-fast);
        }

        .delete-btn:hover:not(:disabled) {
          color: #E11D48;
          background-color: rgba(225, 29, 72, 0.1);
        }

        .delete-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .task-editor-card {
            padding: 16px;
          }
          .table-wrapper {
            margin-top: 10px;
          }
        }
      `}</style>
    </section>
  );
}
