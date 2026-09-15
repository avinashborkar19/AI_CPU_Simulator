'use client';

import React from 'react';
import { Cpu, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-group">
          <div className="brand-icon">
            <Cpu size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-title">aisched<span className="accent-dot">.</span>os</span>
            <span className="brand-subtitle">AI Workload CPU Dispatcher</span>
          </div>
        </div>

        <nav className="header-nav">
          <a href="#workload" className="nav-link">Workload</a>
          <a href="#timeline" className="nav-link">Timeline</a>
          <a href="#metrics" className="nav-link">Metrics</a>
          <a href="#comparison" className="nav-link">Comparison</a>
          <a href="#analysis" className="nav-link">AI Analysis</a>
        </nav>

        <div className="header-status">
          <span className="status-ping">
            <span className="ping-dot"></span>
            <span className="ping-ring"></span>
          </span>
          <span className="status-label">SYS_READY</span>
        </div>
      </div>

      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background-color: rgba(7, 8, 9, 0.88);
          border-bottom: 1px solid var(--border-subtle);
          width: 100%;
        }

        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .accent-dot {
          color: var(--accent);
        }

        .brand-subtitle {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
          letter-spacing: 0.02em;
        }

        .nav-link:hover {
          color: var(--accent);
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          background-color: var(--bg-surface-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xs);
        }

        .status-ping {
          position: relative;
          width: 8px;
          height: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ping-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--accent);
        }

        .ping-ring {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 1px solid var(--accent);
          opacity: 0.6;
          animation: pulse 2s infinite ease-out;
        }

        .status-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }
          .header-inner {
            padding: 12px 16px;
          }
        }
      `}</style>
    </header>
  );
}
