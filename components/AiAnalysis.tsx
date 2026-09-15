'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/scheduling';
import { Sparkles, Loader2, AlertCircle, CheckCircle, BrainCircuit } from 'lucide-react';

interface AiAnalysisProps {
  tasks: Task[];
  quantum: number;
}

interface AnalysisResponse {
  modelUsed: string;
  winner: string;
  margin: string;
  analysis: string;
}

export default function AiAnalysis({ tasks, quantum }: AiAnalysisProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks, quantum }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI analysis.');
      }

      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unknown network error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Function to parse the markdown into the 4 structured sections
  const parseSections = (text: string) => {
    const sections: { title: string; content: string }[] = [];
    const parts = text.split(/(?=###\s+\d+\.\s+)/);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const match = trimmed.match(/^###\s+\d+\.\s+([^\n]+)\n([\s\S]*)$/);
      if (match) {
        sections.push({
          title: match[1].trim(),
          content: match[2].trim(),
        });
      } else {
        sections.push({
          title: 'Detailed Evaluation',
          content: trimmed,
        });
      }
    }

    return sections;
  };

  const parsedSections = result?.analysis ? parseSections(result.analysis) : [];

  return (
    <section id="analysis" className="analysis-card">
      <div className="card-header">
        <div className="header-meta">
          <div className="badge">AI-DRIVEN WORKLOAD EVALUATION</div>
          <h2 className="section-title">Principal OS Architecture Telemetry</h2>
          <p className="section-desc">
            Dispatches actual workload metrics to Google Gemini for deep architectural critique, causal analysis, and production mapping.
          </p>
        </div>

        <div className="header-action">
          <button onClick={runAnalysis} disabled={loading} className="btn-analyze">
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Generating Telemetry...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Analyse this workload</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} className="error-icon" />
          <div className="error-content">
            <span className="error-title">AI Analysis Notice</span>
            <span className="error-msg">{error}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <BrainCircuit size={32} className="pulse-icon" />
          <p className="loading-title">Querying Gemini Flash Architecture Engine</p>
          <p className="loading-sub">Synthesizing mathematical metrics, convoy effects, and AI cluster trade-offs...</p>
        </div>
      )}

      {!loading && result && (
        <div className="analysis-results">
          <div className="meta-strip">
            <div className="meta-item">
              <span className="meta-label">DISPATCHED MODEL:</span>
              <span className="meta-val">{result.modelUsed}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">BENCHMARK WINNER:</span>
              <span className="meta-val accent">{result.winner}</span>
            </div>
          </div>

          <div className="sections-grid">
            {parsedSections.map((sec, idx) => (
              <div key={idx} className="analysis-section-card">
                <div className="sec-header">
                  <span className="sec-number">{idx + 1}</span>
                  <h3 className="sec-title">{sec.title}</h3>
                </div>
                <div className="sec-content">
                  {sec.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="sec-p">
                      {paragraph.replace(/^[-*]\s+/gm, '• ')}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="idle-state">
          <BrainCircuit size={28} className="idle-icon" />
          <p className="idle-text">
            Click <strong>&quot;Analyse this workload&quot;</strong> above to invoke Gemini&apos;s OS evaluation module on your current task distribution and quantum parameters.
          </p>
        </div>
      )}

      <style jsx>{`
        .analysis-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 24px;
          transition: transform var(--transition-fast), border-color var(--transition-fast);
          position: relative;
        }

        .analysis-card:hover {
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

        .btn-analyze {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background-color: var(--accent);
          color: var(--text-inverse);
          font-family: var(--font-mono);
          font-size: 0.84rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          transition: background-color var(--transition-fast), transform var(--transition-fast);
          box-shadow: 0 2px 10px var(--accent-glow);
        }

        .btn-analyze:hover:not(:disabled) {
          background-color: var(--accent-hover);
          transform: translateY(-1px);
        }

        .btn-analyze:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background-color: rgba(225, 29, 72, 0.08);
          border: 1px solid rgba(225, 29, 72, 0.3);
          border-radius: var(--radius-sm);
          margin-bottom: 20px;
        }

        .error-icon {
          color: #E11D48;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .error-content {
          display: flex;
          flex-direction: column;
        }

        .error-title {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 700;
          color: #E11D48;
          margin-bottom: 2px;
        }

        .error-msg {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .loading-state {
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .pulse-icon {
          color: var(--accent);
          animation: pulse 1.5s ease-in-out infinite;
          margin-bottom: 16px;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        .loading-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }

        .loading-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          max-width: 480px;
        }

        .idle-state {
          padding: 36px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .idle-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .idle-text {
          font-size: 0.84rem;
          color: var(--text-muted);
          max-width: 600px;
        }

        .idle-text strong {
          color: var(--text-secondary);
        }

        .analysis-results {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meta-strip {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 10px 16px;
          background-color: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.76rem;
        }

        .meta-label {
          color: var(--text-muted);
        }

        .meta-val {
          color: var(--text-primary);
          font-weight: 700;
        }

        .meta-val.accent {
          color: var(--accent);
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .analysis-section-card {
          padding: 18px;
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
        }

        .sec-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .sec-number {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: var(--accent-subtle);
          border: 1px solid var(--border-accent);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sec-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .sec-content {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.65;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sec-p {
          margin: 0;
        }

        @media (max-width: 900px) {
          .sections-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .analysis-card {
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
}
