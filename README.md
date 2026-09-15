# AI Task Scheduler · CPU Scheduling Simulator
**Operating Systems — Assignment 1 · Unit 2: Process and Thread Management (CO2)**

---

### Academic & Student Details
- **Student Name:** Avinash Borkar
- **PRN:** `202501110202`
- **Division:** `C` · **Batch:** `C3`
- **Course:** Operating Systems (Unit 2: Process & Thread Management · Course Outcome 2)
- **GitHub Repository:** [avinashborkar19/AI_CPU_Simulator](https://github.com/avinashborkar19/AI_CPU_Simulator.git)

---

## 1. Problem Statement
Modern AI clusters execute heterogeneous concurrent workloads—ranging from fast inference requests ($P_4$) to multi-hour distributed training epochs ($P_2$) and data preprocessing pipelines ($P_1$). Unregulated FIFO dispatching causes severe **convoy effects**, where long training bursts monopolize the compute core and stall latency-sensitive inference queries. 

This project implements an industrial-grade CPU scheduling simulator engineered in **Next.js (TypeScript, React, App Router)** to simulate, evaluate, and benchmark CPU dispatch strategies across:
1. **FCFS** (First-Come, First-Served — Non-Preemptive)
2. **SJF** (Shortest Job First — Non-Preemptive)
3. **Round Robin** (Preemptive with user-defined Time Quantum $q$)
4. **Priority Scheduling** (Non-Preemptive, $1 = \text{Most Urgent}$)

---

## 2. Operating System Concepts
- **Process Control Block (PCB):** State modeling including PID, Arrival Time ($AT$), Burst Time ($BT$), Priority, and dynamic state tracking (Remaining Burst, First Response Timestamp).
- **Ready Queue & Context Switching:** Queue admittance ordering rules where newly arriving processes are admitted before preempted processes are re-queued. Merged back-to-back execution slices to prevent synthetic switch inflation.
- **Preemptive vs. Non-Preemptive Execution:** Analyzing starvation risk in non-preemptive SJF versus time-sharing fairness and context-switch latency in Round Robin.
- **CPU Idle Periods:** Explicit identification and visual hatching of unallocated CPU gaps between sparse arrival intervals.

---

## 3. Algorithmic Approach & Architecture
- **Pure Core Engine (`lib/scheduling.ts`):** Zero UI/framework imports. FCFS, SJF, and Priority share a single unified non-preemptive comparator driver. Round Robin implements a live queue with a remaining-burst map.
- **Zero Hardcoding:** All completion times ($CT$), turnaround times ($TAT = CT - AT$), waiting times ($WT = TAT - BT$), response times ($RT$), averages, and winner determinations are dynamically computed.
- **Gemini Architectural Analysis (`app/api/analyze/route.ts`):** Server-side route discovering active Gemini Flash models via `GET /v1beta/models`, generating academic critique across Verdict, Causal Mechanisms, Trade-offs, and Real AI Server application.

---

## 4. Default Workload & Benchmark Results ($q = 3$)

### Benchmark Tasks
| PID | Task Name | Arrival Time ($AT$) | Burst Time ($BT$) | Priority ($1=\text{Urgent}$) |
| :--- | :--- | :---: | :---: | :---: |
| **P1** | Data preprocessing | 0s | 7s | 2 |
| **P2** | Model training | 2s | 12s | 3 |
| **P3** | Model validation | 4s | 4s | 2 |
| **P4** | Model inference | 5s | 2s | 1 |
| **P5** | Report generation | 9s | 5s | 4 |

### Mathematical Results
| Strategy | Execution Sequence / Slices | Avg WT | Avg TAT | Avg Response | Context Switches | CPU Utilization |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **FCFS** | $P_1 \to P_2 \to P_3 \to P_4 \to P_5$ | `10.80s` | `16.80s` | `10.80s` | 4 | 100.0% |
| **SJF** | $P_1 \to P_4 \to P_3 \to P_5 \to P_2$ | **`5.40s`** | **`11.40s`** | `5.40s` | 4 | 100.0% |
| **Round Robin ($q=3$)** | $P_1 \to P_2 \to P_1 \to P_3 \to P_4 \to P_2 \to P_5 \to P_1 \to P_3 \to P_2 \to P_5 \to P_2$ | `12.80s` | `18.80s` | `4.20s` | 11 | 100.0% |
| **Priority** | $P_1 \to P_4 \to P_3 \to P_2 \to P_5$ | `6.80s` | `12.80s` | `6.80s` | 4 | 100.0% |

- **Decisive Winner:** **SJF** (Average Waiting Time of $5.40\text{s}$, beating Priority by $1.40\text{s}$ and FCFS by $5.40\text{s}$).

---

## 5. Local Reproduction & Testing

### Prerequisites
- Node.js `v20+` or `v24+`
- `npm`

### Installation
```bash
npm install
```

### Automated Verification Test Suite
Runs the built-in Node.js native test suite (`node --test`) with zero testing framework overhead:
```bash
npm test
```
*Asserts all hand-verified values across all 4 algorithms, Round Robin queue admittance, idle CPU cases, and tiebreak logic.*

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Vulnerability Audit
```bash
npm run build
npm audit
```

---

## 6. Deployment on Vercel
1. Import repository at [vercel.com/new](https://vercel.com/new).
2. Under **Project Settings → Environment Variables**, add `GEMINI_API_KEY` for Production, Preview, and Development.
3. Deploy!
