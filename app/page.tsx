'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Task, compareAllAlgorithms } from '@/lib/scheduling';
import Header from '@/components/Header';
import TaskEditor, { DEFAULT_AI_WORKLOAD } from '@/components/TaskEditor';
import GanttChart from '@/components/GanttChart';
import MetricsDisplay from '@/components/MetricsDisplay';
import ComparisonTable from '@/components/ComparisonTable';
import AiAnalysis from '@/components/AiAnalysis';
import Footer from '@/components/Footer';
import { Terminal, Cpu, ArrowDownRight, Activity } from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_AI_WORKLOAD);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<
    'FCFS' | 'SJF' | 'Round Robin' | 'Priority'
  >('SJF');
  const [quantum, setQuantum] = useState<number>(3);

  // Parallax container and transforms
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 50-90px clearly visible scroll parallax with spring smoothing
  const rawParallaxY1 = useTransform(scrollYProgress, [0, 1], [0, -75]);
  const rawParallaxY2 = useTransform(scrollYProgress, [0, 1], [0, 65]);
  const parallaxY1 = useSpring(rawParallaxY1, { stiffness: 120, damping: 20 });
  const parallaxY2 = useSpring(rawParallaxY2, { stiffness: 120, damping: 20 });

  // Pure mathematical simulation evaluation
  const comparisonResult = useMemo(() => {
    return compareAllAlgorithms(tasks, quantum);
  }, [tasks, quantum]);

  const activeAlgorithmResult = comparisonResult.results[selectedAlgorithm];

  return (
    <div ref={containerRef} className="page-shell">
      <Header />

      <main className="main-content">
        {/* Hero Section with Parallax Background Elements */}
        <section className="hero-section">
          <motion.div style={{ y: parallaxY1 }} className="parallax-backdrop-pill">
            <span className="mono-code">CPU_DISPATCH_CORE // UNIT_02_OS</span>
          </motion.div>

          <div className="hero-inner">
            <div className="hero-badge">
              <Terminal size={13} />
              <span>ACADEMIC OS SIMULATOR · CO2 BENCHMARK</span>
            </div>

            <h1 className="hero-headline">
              The order you run them in <br />
              <span className="accent-text">is the performance.</span>
            </h1>

            <p className="hero-subtext">
              High-concurrency AI/ML server scheduling simulation. Rigorously analyzing the convoy effect,
              burst-time minimization, preemption overhead, and priority inversion across FCFS, SJF, Round Robin,
              and Priority algorithms with automated Gemini telemetry.
            </p>

            <div className="hero-specs-strip">
              <div className="spec-card">
                <span className="spec-label">ACTIVE WORKLOAD</span>
                <span className="spec-value">{tasks.length} Tasks</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">QUANTUM (q)</span>
                <span className="spec-value">{quantum}s</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">BENCHMARK WINNER</span>
                <span className="spec-value accent">{comparisonResult.winner}</span>
              </div>
              <div className="spec-card">
                <span className="spec-label">MIN AVG WAITING</span>
                <span className="spec-value">
                  {comparisonResult.results[comparisonResult.winner].avgWaitingTime.toFixed(2)}s
                </span>
              </div>
            </div>
          </div>

          <motion.div style={{ y: parallaxY2 }} className="parallax-watermark">
            <span>SCHED_V1</span>
          </motion.div>
        </section>

        {/* Core Interactive Sections */}
        <div className="content-grid">
          {/* 1. Input Task Specification */}
          <TaskEditor tasks={tasks} onTasksChange={setTasks} />

          {/* 2. Visual Gantt Chart & Timeline */}
          <GanttChart
            algorithmResult={activeAlgorithmResult}
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
            quantum={quantum}
            onQuantumChange={setQuantum}
          />

          {/* 3. Detailed Telemetry & Metrics Display */}
          <MetricsDisplay algorithmResult={activeAlgorithmResult} />

          {/* 4. Comparative 4-Way Algorithm Matrix */}
          <ComparisonTable
            winnerResult={comparisonResult}
            onSelectAlgorithm={setSelectedAlgorithm}
          />

          {/* 5. Server-Side Gemini AI Architectural Analysis */}
          <AiAnalysis tasks={tasks} quantum={quantum} />
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .page-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          position: relative;
          overflow-x: hidden;
        }

        .main-content {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }

        .hero-section {
          position: relative;
          padding: 64px 0 48px;
          overflow: visible;
        }

        .parallax-backdrop-pill {
          position: absolute;
          top: 20px;
          right: 0;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--border-strong);
          letter-spacing: 0.12em;
          pointer-events: none;
          user-select: none;
        }

        .parallax-watermark {
          position: absolute;
          bottom: -10px;
          right: -20px;
          font-family: var(--font-display);
          font-size: 5rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.015);
          letter-spacing: -0.05em;
          pointer-events: none;
          user-select: none;
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 860px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent);
          background-color: var(--accent-subtle);
          border: 1px solid var(--accent-glow);
          padding: 4px 10px;
          border-radius: var(--radius-xs);
          margin-bottom: 18px;
        }

        .hero-headline {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .accent-text {
          color: var(--accent);
        }

        .hero-subtext {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 720px;
          margin-bottom: 28px;
        }

        .hero-specs-strip {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .spec-card {
          display: flex;
          flex-direction: column;
          padding: 10px 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          min-width: 140px;
        }

        .spec-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .spec-value {
          font-family: var(--font-mono);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .spec-value.accent {
          color: var(--accent);
        }

        .content-grid {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-top: 24px;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 0 16px;
          }
          .hero-section {
            padding: 40px 0 32px;
          }
          .hero-specs-strip {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .spec-card {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}
