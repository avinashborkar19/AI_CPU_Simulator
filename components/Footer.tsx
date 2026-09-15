'use client';

import React from 'react';
import { Github, Code2, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="student-metadata">
          <div className="meta-primary">
            <GraduationCap size={15} className="footer-icon" />
            <span className="student-name">Avinash Borkar</span>
            <span className="divider">·</span>
            <span className="prn">PRN: 202501110202</span>
            <span className="divider">·</span>
            <span className="division">Div C (C3)</span>
          </div>
          <div className="course-mapping">
            <span>Operating Systems · Assignment 1 · Unit 2 Process and Thread Management · CO2</span>
          </div>
        </div>

        <div className="repo-link-wrap">
          <a
            href="https://github.com/avinashborkar19/AI_CPU_Simulator.git"
            target="_blank"
            rel="noopener noreferrer"
            className="repo-link"
          >
            <Github size={14} />
            <span>avinashborkar19/AI_CPU_Simulator</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          border-top: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          padding: 24px;
          margin-top: 64px;
          width: 100%;
        }

        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .student-metadata {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: var(--text-primary);
          flex-wrap: wrap;
        }

        .footer-icon {
          color: var(--accent);
        }

        .student-name {
          font-weight: 700;
          color: var(--text-primary);
        }

        .divider {
          color: var(--text-muted);
        }

        .prn, .division {
          color: var(--text-secondary);
        }

        .course-mapping {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .repo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.76rem;
          color: var(--text-secondary);
          padding: 6px 12px;
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
          transition: all var(--transition-fast);
        }

        .repo-link:hover {
          color: var(--accent);
          border-color: var(--border-accent);
        }

        @media (max-width: 768px) {
          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
