// lib/scheduling.test.ts
// Node.js native test runner (node --test) asserting hand-verified values

import test from 'node:test';
import assert from 'node:assert/strict';
import type { Task } from './scheduling.ts';
import {
  runFCFS,
  runSJF,
  runRoundRobin,
  runPriority,
  compareAllAlgorithms
} from './scheduling.ts';

// Default AI/ML workload from assignment specification
const defaultTasks: Task[] = [
  { id: 'P1', name: 'Data preprocessing', arrivalTime: 0, burstTime: 7, priority: 2 },
  { id: 'P2', name: 'Model training', arrivalTime: 2, burstTime: 12, priority: 3 },
  { id: 'P3', name: 'Model validation', arrivalTime: 4, burstTime: 4, priority: 2 },
  { id: 'P4', name: 'Model inference', arrivalTime: 5, burstTime: 2, priority: 1 },
  { id: 'P5', name: 'Report generation', arrivalTime: 9, burstTime: 5, priority: 4 }
];

test('FCFS produces expected hand-verified metrics and execution order', () => {
  const result = runFCFS(defaultTasks);
  const order = result.slices.map((s) => s.taskId);

  assert.deepEqual(order, ['P1', 'P2', 'P3', 'P4', 'P5']);
  assert.equal(result.avgWaitingTime, 10.80);
  assert.equal(result.avgTurnaroundTime, 16.80);
  assert.equal(result.slices.length, 5);
  assert.equal(result.cpuUtilization, 100);
});

test('SJF produces expected hand-verified metrics and execution order', () => {
  const result = runSJF(defaultTasks);
  const order = result.slices.map((s) => s.taskId);

  assert.deepEqual(order, ['P1', 'P4', 'P3', 'P5', 'P2']);
  assert.equal(result.avgWaitingTime, 5.40);
  assert.equal(result.avgTurnaroundTime, 11.40);
  assert.equal(result.slices.length, 5);
  assert.equal(result.cpuUtilization, 100);
});

test('Round Robin (q=3) produces expected slice sequence, switches, and averages', () => {
  const result = runRoundRobin(defaultTasks, 3);
  const order = result.slices.map((s) => s.taskId);

  assert.deepEqual(order, [
    'P1', 'P2', 'P1', 'P3', 'P4', 'P2', 'P5', 'P1', 'P3', 'P2', 'P5', 'P2'
  ]);
  assert.equal(result.avgWaitingTime, 12.80);
  assert.equal(result.avgTurnaroundTime, 18.80);
  assert.equal(result.avgResponseTime, 4.20);
  assert.equal(result.contextSwitches, 11);
  assert.equal(result.cpuUtilization, 100);
});

test('Priority produces expected hand-verified metrics and execution order', () => {
  const result = runPriority(defaultTasks);
  const order = result.slices.map((s) => s.taskId);

  assert.deepEqual(order, ['P1', 'P4', 'P3', 'P2', 'P5']);
  assert.equal(result.avgWaitingTime, 6.80);
  assert.equal(result.avgTurnaroundTime, 12.80);
  assert.equal(result.slices.length, 5);
  assert.equal(result.cpuUtilization, 100);
});

test('Idle case produces explicit idle block and 40% CPU utilization', () => {
  const idleTasks: Task[] = [
    { id: 'A', name: 'Task A', arrivalTime: 0, burstTime: 2, priority: 1 },
    { id: 'B', name: 'Task B', arrivalTime: 8, burstTime: 2, priority: 1 }
  ];

  const result = runFCFS(idleTasks);

  assert.equal(result.slices.length, 3);
  assert.equal(result.slices[0].taskId, 'A');
  assert.equal(result.slices[0].startTime, 0);
  assert.equal(result.slices[0].endTime, 2);

  assert.equal(result.slices[1].isIdle, true);
  assert.equal(result.slices[1].taskId, 'IDLE');
  assert.equal(result.slices[1].startTime, 2);
  assert.equal(result.slices[1].endTime, 8);
  assert.equal(result.slices[1].duration, 6);

  assert.equal(result.slices[2].taskId, 'B');
  assert.equal(result.slices[2].startTime, 8);
  assert.equal(result.slices[2].endTime, 10);

  assert.equal(result.cpuUtilization, 40.0);
  assert.equal(result.idleTime, 6);
});

test('compareAllAlgorithms correctly identifies SJF as the benchmark winner', () => {
  const comparison = compareAllAlgorithms(defaultTasks, 3);
  assert.equal(comparison.winner, 'SJF');
  assert.match(comparison.margin, /SJF/);
});
