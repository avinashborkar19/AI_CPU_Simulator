// lib/scheduling.ts
// Pure CPU scheduling algorithms & metrics with zero UI/framework imports.

export interface Task {
  id: string;          // e.g. "P1"
  name: string;        // e.g. "Data preprocessing"
  arrivalTime: number; // e.g. 0
  burstTime: number;   // e.g. 7
  priority: number;    // 1 = most urgent
}

export interface ScheduleSlice {
  taskId: string;      // "P1", "P2", ... or "IDLE"
  taskName: string;    // "Data preprocessing" or "CPU Idle"
  startTime: number;
  endTime: number;
  duration: number;
  isIdle: boolean;
}

export interface ProcessMetrics {
  taskId: string;
  taskName: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime: number;
  turnaroundTime: number; // CT - AT
  waitingTime: number;    // TAT - BT
  responseTime: number;   // first execution start - AT
}

export interface AlgorithmResult {
  algorithm: 'FCFS' | 'SJF' | 'Round Robin' | 'Priority';
  slices: ScheduleSlice[];
  processMetrics: ProcessMetrics[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  cpuUtilization: number;
  idleTime: number;
  contextSwitches: number;
}

export interface WinnerResult {
  winner: 'FCFS' | 'SJF' | 'Round Robin' | 'Priority';
  results: Record<'FCFS' | 'SJF' | 'Round Robin' | 'Priority', AlgorithmResult>;
  margin: string; // concise verdict on winner and margin over runner-up
}

/**
 * Merge contiguous slices that belong to the same task (or contiguous IDLE blocks).
 */
export function mergeSlices(slices: ScheduleSlice[]): ScheduleSlice[] {
  if (slices.length <= 1) return slices;
  const merged: ScheduleSlice[] = [];

  for (const current of slices) {
    if (merged.length === 0) {
      merged.push({ ...current });
      continue;
    }
    const prev = merged[merged.length - 1];
    if (prev.taskId === current.taskId && prev.isIdle === current.isIdle) {
      prev.endTime = current.endTime;
      prev.duration += current.duration;
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

/**
 * Count context switches across the schedule.
 * A context switch occurs each time CPU transfers execution between two distinct active processes.
 */
export function countContextSwitches(slices: ScheduleSlice[]): number {
  const merged = mergeSlices(slices);
  const processSlices = merged.filter((s) => !s.isIdle);
  if (processSlices.length <= 1) return 0;
  return processSlices.length - 1;
}

/**
 * Helper to compute final per-process and aggregate metrics from executed slices and original tasks.
 */
function computeMetrics(
  tasks: Task[],
  rawSlices: ScheduleSlice[],
  algorithm: AlgorithmResult['algorithm']
): AlgorithmResult {
  const slices = mergeSlices(rawSlices);
  if (tasks.length === 0) {
    return {
      algorithm,
      slices: [],
      processMetrics: [],
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      cpuUtilization: 0,
      idleTime: 0,
      contextSwitches: 0
    };
  }

  const completionMap = new Map<string, number>();
  const firstStartMap = new Map<string, number>();

  for (const slice of slices) {
    if (slice.isIdle) continue;
    if (!firstStartMap.has(slice.taskId)) {
      firstStartMap.set(slice.taskId, slice.startTime);
    }
    completionMap.set(slice.taskId, slice.endTime);
  }

  let totalWT = 0;
  let totalTAT = 0;
  let totalRT = 0;
  let totalBurst = 0;

  const processMetrics: ProcessMetrics[] = tasks.map((task) => {
    const ct = completionMap.get(task.id) ?? task.arrivalTime;
    const tat = ct - task.arrivalTime;
    const wt = tat - task.burstTime;
    const firstStart = firstStartMap.get(task.id) ?? task.arrivalTime;
    const rt = firstStart - task.arrivalTime;

    totalWT += wt;
    totalTAT += tat;
    totalRT += rt;
    totalBurst += task.burstTime;

    return {
      taskId: task.id,
      taskName: task.name,
      arrivalTime: task.arrivalTime,
      burstTime: task.burstTime,
      priority: task.priority,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt
    };
  });

  const idleTime = slices.reduce((acc, s) => (s.isIdle ? acc + s.duration : acc), 0);
  const totalSpan = slices.length > 0 ? slices[slices.length - 1].endTime : 0;
  const cpuUtilization = totalSpan > 0 ? Number(((totalBurst / totalSpan) * 100).toFixed(2)) : 0;
  const contextSwitches = countContextSwitches(slices);

  const n = tasks.length;
  const avgWaitingTime = Number((totalWT / n).toFixed(2));
  const avgTurnaroundTime = Number((totalTAT / n).toFixed(2));
  const avgResponseTime = Number((totalRT / n).toFixed(2));

  return {
    algorithm,
    slices,
    processMetrics,
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    cpuUtilization,
    idleTime,
    contextSwitches
  };
}

/**
 * Shared Non-Preemptive Scheduling Driver for FCFS, SJF, and Priority.
 * Uses a comparator function to select among currently available arrived tasks.
 */
export function runNonPreemptive(
  tasks: Task[],
  algorithm: 'FCFS' | 'SJF' | 'Priority',
  comparator: (a: Task, b: Task) => number
): AlgorithmResult {
  if (tasks.length === 0) {
    return computeMetrics([], [], algorithm);
  }

  // Clone tasks so we don't mutate input
  const remaining = tasks.map((t) => ({ ...t }));
  const slices: ScheduleSlice[] = [];
  let currentTime = 0;

  while (remaining.length > 0) {
    // Tasks that have arrived by currentTime
    const available = remaining.filter((t) => t.arrivalTime <= currentTime);

    if (available.length === 0) {
      // CPU is idle: jump to next task arrival
      const nextArrival = Math.min(...remaining.map((t) => t.arrivalTime));
      slices.push({
        taskId: 'IDLE',
        taskName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        duration: nextArrival - currentTime,
        isIdle: true
      });
      currentTime = nextArrival;
      continue;
    }

    // Select task using comparator
    available.sort(comparator);
    const selected = available[0];

    const startTime = currentTime;
    const endTime = currentTime + selected.burstTime;

    slices.push({
      taskId: selected.id,
      taskName: selected.name,
      startTime,
      endTime,
      duration: selected.burstTime,
      isIdle: false
    });

    currentTime = endTime;
    const index = remaining.findIndex((t) => t.id === selected.id);
    if (index !== -1) {
      remaining.splice(index, 1);
    }
  }

  return computeMetrics(tasks, slices, algorithm);
}

/**
 * FCFS (First-Come, First-Served) - Non-preemptive
 */
export function runFCFS(tasks: Task[]): AlgorithmResult {
  return runNonPreemptive(tasks, 'FCFS', (a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });
}

/**
 * SJF (Shortest Job First) - Non-preemptive
 */
export function runSJF(tasks: Task[]): AlgorithmResult {
  return runNonPreemptive(tasks, 'SJF', (a, b) => {
    if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Priority Scheduling - Non-preemptive (1 = most urgent)
 */
export function runPriority(tasks: Task[]): AlgorithmResult {
  return runNonPreemptive(tasks, 'Priority', (a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Round Robin (RR) - Preemptive with user-defined Time Quantum.
 *
 * Admittance Rule:
 * Processes that arrive during a running quantum are admitted to the ready queue
 * BEFORE the preempted process is re-queued.
 * Back-to-back slices of the same process are merged.
 */
export function runRoundRobin(tasks: Task[], quantum: number): AlgorithmResult {
  const q = Math.max(1, Math.floor(quantum));
  if (tasks.length === 0) {
    return computeMetrics([], [], 'Round Robin');
  }

  // Sort tasks initially by arrival time and PID
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.id.localeCompare(b.id);
  });

  const remainingBurst = new Map<string, number>();
  const taskMap = new Map<string, Task>();
  for (const t of sortedTasks) {
    remainingBurst.set(t.id, t.burstTime);
    taskMap.set(t.id, t);
  }

  const readyQueue: string[] = [];
  const slices: ScheduleSlice[] = [];
  let unadmitted = [...sortedTasks];
  let currentTime = 0;

  // Helper to admit newly arrived tasks up to time limit
  const admitNewTasks = (upToTime: number) => {
    const newlyArrived = unadmitted.filter((t) => t.arrivalTime <= upToTime);
    if (newlyArrived.length > 0) {
      // Sort newly arrived by arrival time and ID for stability
      newlyArrived.sort((a, b) => {
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.id.localeCompare(b.id);
      });
      for (const t of newlyArrived) {
        readyQueue.push(t.id);
      }
      unadmitted = unadmitted.filter((t) => t.arrivalTime > upToTime);
    }
  };

  // Initial admittance at time 0
  admitNewTasks(currentTime);

  while (readyQueue.length > 0 || unadmitted.length > 0) {
    if (readyQueue.length === 0) {
      // CPU Idle until next task arrives
      const nextArrival = Math.min(...unadmitted.map((t) => t.arrivalTime));
      slices.push({
        taskId: 'IDLE',
        taskName: 'CPU Idle',
        startTime: currentTime,
        endTime: nextArrival,
        duration: nextArrival - currentTime,
        isIdle: true
      });
      currentTime = nextArrival;
      admitNewTasks(currentTime);
      continue;
    }

    const currentTaskId = readyQueue.shift()!;
    const task = taskMap.get(currentTaskId)!;
    const rem = remainingBurst.get(currentTaskId)!;

    const executeTime = Math.min(q, rem);
    const startTime = currentTime;
    const endTime = currentTime + executeTime;

    slices.push({
      taskId: task.id,
      taskName: task.name,
      startTime,
      endTime,
      duration: executeTime,
      isIdle: false
    });

    const newRem = rem - executeTime;
    remainingBurst.set(currentTaskId, newRem);
    currentTime = endTime;

    // CRITICAL RULE: Admit processes that arrived DURING this slice (t <= endTime)
    // BEFORE re-queuing the current preempted process.
    admitNewTasks(currentTime);

    // If current task still has remaining burst, re-queue it at tail
    if (newRem > 0) {
      readyQueue.push(currentTaskId);
    }
  }

  return computeMetrics(tasks, slices, 'Round Robin');
}

/**
 * Run all four scheduling algorithms and determine the winning strategy.
 * Lowest average waiting time wins; average turnaround time acts as tie-breaker.
 */
export function compareAllAlgorithms(tasks: Task[], quantum: number): WinnerResult {
  const fcfs = runFCFS(tasks);
  const sjf = runSJF(tasks);
  const rr = runRoundRobin(tasks, quantum);
  const priority = runPriority(tasks);

  const results: Record<'FCFS' | 'SJF' | 'Round Robin' | 'Priority', AlgorithmResult> = {
    FCFS: fcfs,
    SJF: sjf,
    'Round Robin': rr,
    Priority: priority
  };

  const algos: Array<'FCFS' | 'SJF' | 'Round Robin' | 'Priority'> = [
    'FCFS',
    'SJF',
    'Round Robin',
    'Priority'
  ];

  algos.sort((a, b) => {
    const resA = results[a];
    const resB = results[b];
    if (resA.avgWaitingTime !== resB.avgWaitingTime) {
      return resA.avgWaitingTime - resB.avgWaitingTime;
    }
    if (resA.avgTurnaroundTime !== resB.avgTurnaroundTime) {
      return resA.avgTurnaroundTime - resB.avgTurnaroundTime;
    }
    return resA.contextSwitches - resB.contextSwitches;
  });

  const winner = algos[0];
  const runnerUp = algos[1];
  const winnerWT = results[winner].avgWaitingTime;
  const runnerUpWT = results[runnerUp].avgWaitingTime;
  const diff = Number((runnerUpWT - winnerWT).toFixed(2));

  let margin = '';
  if (diff === 0) {
    margin = `${winner} ties on Avg Waiting Time (${winnerWT.toFixed(2)}s) and wins on Turnaround Time (${results[winner].avgTurnaroundTime.toFixed(2)}s vs ${results[runnerUp].avgTurnaroundTime.toFixed(2)}s).`;
  } else {
    margin = `${winner} wins with an Average Waiting Time of ${winnerWT.toFixed(2)}s (${diff.toFixed(2)}s faster than ${runnerUp}).`;
  }

  return { winner, results, margin };
}
