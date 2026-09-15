// app/api/analyze/route.ts
// Server-side Gemini API integration for AI CPU Scheduling Simulator.
// Re-runs schedulers server-side, discovers active flash model, returns structured markdown analysis.

import { NextRequest, NextResponse } from 'next/server';
import { Task, compareAllAlgorithms } from '@/lib/scheduling';

interface AnalyzeRequestBody {
  tasks: Task[];
  quantum: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRequestBody = await req.json();
    const { tasks, quantum } = body;

    // 1. Rigorous server-side input validation
    if (!Array.isArray(tasks) || tasks.length < 1 || tasks.length > 20) {
      return NextResponse.json(
        { error: 'Invalid workload: Workload must contain between 1 and 20 tasks.' },
        { status: 400 }
      );
    }

    const q = Number(quantum);
    if (isNaN(q) || q < 1 || q > 100) {
      return NextResponse.json(
        { error: 'Invalid time quantum: Quantum must be an integer between 1 and 100.' },
        { status: 400 }
      );
    }

    for (const t of tasks) {
      if (
        !t.id ||
        typeof t.arrivalTime !== 'number' ||
        typeof t.burstTime !== 'number' ||
        typeof t.priority !== 'number' ||
        t.arrivalTime < 0 ||
        t.burstTime <= 0 ||
        t.priority < 1
      ) {
        return NextResponse.json(
          { error: `Invalid task specifications for PID ${t.id || 'unknown'}.` },
          { status: 400 }
        );
      }
    }

    // 2. Re-run scheduling algorithms server-side to guarantee integrity
    const comparison = compareAllAlgorithms(tasks, q);
    const { winner, results, margin } = comparison;

    // 3. Verify Gemini API Key exists on server
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured in server environment. Please ensure it is present in .env.local or Vercel Environment Variables.'
        },
        { status: 503 }
      );
    }

    // 4. Dynamic model discovery via GET /v1beta/models
    let selectedModel = 'models/gemini-2.0-flash';
    try {
      const modelsRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models',
        {
          headers: {
            'x-goog-api-key': apiKey
          }
        }
      );

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        const available: Array<{ name: string; supportedGenerationMethods?: string[] }> =
          modelsData.models || [];

        // Pick an active flash model supporting generateContent
        const flashCandidate = available.find(
          (m) =>
            m.supportedGenerationMethods?.includes('generateContent') &&
            m.name.toLowerCase().includes('flash') &&
            !m.name.toLowerCase().includes('preview')
        ) || available.find(
          (m) =>
            m.supportedGenerationMethods?.includes('generateContent') &&
            m.name.toLowerCase().includes('flash')
        ) || available.find(
          (m) => m.supportedGenerationMethods?.includes('generateContent')
        );

        if (flashCandidate) {
          selectedModel = flashCandidate.name;
        }
      }
    } catch {
      // Fallback cleanly to default flash model name
    }

    // 5. Construct sanitized prompt containing only measured mathematical metrics
    const prompt = `You are a Principal Operating Systems Architect and AI Infrastructure Specialist analyzing a CPU scheduling simulation for an AI/ML server workload.

WORKLOAD PROFILE:
${tasks
  .map(
    (t) =>
      `- Task ${t.id} ("${t.name}"): Arrival Time = ${t.arrivalTime}, Burst Time = ${t.burstTime}s, Priority = ${t.priority} (1 = most urgent)`
  )
  .join('\n')}
Time Quantum for Round Robin = ${q}s

MEASURED PERFORMANCE METRICS:
1. FCFS:
   - Execution Order: ${results.FCFS.slices.filter((s) => !s.isIdle).map((s) => s.taskId).join(' -> ')}
   - Avg Waiting Time: ${results.FCFS.avgWaitingTime}s
   - Avg Turnaround Time: ${results.FCFS.avgTurnaroundTime}s
   - CPU Utilization: ${results.FCFS.cpuUtilization}% | Idle Time: ${results.FCFS.idleTime}s
   - Context Switches: ${results.FCFS.contextSwitches}

2. Shortest Job First (SJF - Non-Preemptive):
   - Execution Order: ${results.SJF.slices.filter((s) => !s.isIdle).map((s) => s.taskId).join(' -> ')}
   - Avg Waiting Time: ${results.SJF.avgWaitingTime}s
   - Avg Turnaround Time: ${results.SJF.avgTurnaroundTime}s
   - CPU Utilization: ${results.SJF.cpuUtilization}% | Idle Time: ${results.SJF.idleTime}s
   - Context Switches: ${results.SJF.contextSwitches}

3. Round Robin (RR - Quantum = ${q}s):
   - Execution Slices: ${results['Round Robin'].slices.filter((s) => !s.isIdle).map((s) => s.taskId).join(' -> ')}
   - Avg Waiting Time: ${results['Round Robin'].avgWaitingTime}s
   - Avg Turnaround Time: ${results['Round Robin'].avgTurnaroundTime}s
   - Avg Response Time: ${results['Round Robin'].avgResponseTime}s
   - Context Switches: ${results['Round Robin'].contextSwitches}

4. Priority Scheduling (Non-Preemptive):
   - Execution Order: ${results.Priority.slices.filter((s) => !s.isIdle).map((s) => s.taskId).join(' -> ')}
   - Avg Waiting Time: ${results.Priority.avgWaitingTime}s
   - Avg Turnaround Time: ${results.Priority.avgTurnaroundTime}s
   - CPU Utilization: ${results.Priority.cpuUtilization}% | Idle Time: ${results.Priority.idleTime}s
   - Context Switches: ${results.Priority.contextSwitches}

DETERMINED WINNER: ${winner} (${margin})

Provide a rigorous, concise, publication-grade academic analysis strictly formatted with the following 4 headers:
### 1. Verdict
State the decisive winner clearly, quantifying the exact performance margin in average waiting time and turnaround time compared to the alternatives.

### 2. Why the Numbers Came Out This Way
Explain the exact causal OS mechanisms (e.g., convoy effect in FCFS, greedy burst minimization in SJF, preemption overhead and queue cycle latency in Round Robin, priority inversion/delay in Priority).

### 3. Trade-offs
Critique starvation risk, context-switch penalties, and predictability across all four algorithms for this specific task distribution.

### 4. On a Real AI Server
Explain how this maps to production AI systems (e.g., vLLM batching, training cluster dispatchers, inference low-latency priority queues, pre-processing pipelines vs large model forward passes). Recommend the ideal scheduling paradigm for this workload in production.`;

    // 6. Call Gemini generateContent API
    const modelEndpoint = selectedModel.startsWith('models/')
      ? selectedModel
      : `models/${selectedModel}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelEndpoint}:generateContent`;

    const apiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.25
        }
      })
    });

    if (!apiRes.ok) {
      return NextResponse.json(
        {
          error:
            'Upstream AI service temporarily unavailable. Please verify API quota or network connection.'
        },
        { status: 502 }
      );
    }

    const data = await apiRes.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No analysis text returned from the AI model.';

    return NextResponse.json({
      modelUsed: selectedModel.replace('models/', ''),
      winner,
      margin,
      analysis: candidateText
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating workload analysis.' },
      { status: 500 }
    );
  }
}
