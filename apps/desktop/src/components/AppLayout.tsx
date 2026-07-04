import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Terminal } from './Terminal';
import { VisualPanel } from './VisualPanel';

export function AppLayout() {
  const [visualPanelVisible, setVisualPanelVisible] = useState(true);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-base)',
    }}>
      {/* ── Top Bar ────────────────────────────────────────── */}
      <TopBar />

      {/* ── Body: 3 columns ────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Column 1: Sidebar ──────────────────────────────── */}
        <Sidebar />

        {/* ── Column 2: Terminal Viewport ────────────────────── */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-base)',
          position: 'relative',
        }}>
          {/* Terminal mode indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: 32,
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--green)', fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                bash — antigravity
              </span>
            </div>
            {/* Visual panel toggle button */}
            <button
              onClick={() => setVisualPanelVisible(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 10px',
                border: `1px solid ${visualPanelVisible ? 'var(--accent-from)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-sm)',
                background: visualPanelVisible ? 'var(--accent-glow)' : 'transparent',
                color: visualPanelVisible ? 'var(--accent-from)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.05em',
              }}>
              <span style={{ fontSize: 8 }}>◈</span>
              {visualPanelVisible ? 'VISUAL' : 'TERMINAL'}
            </button>
          </div>

          {/* xterm.js terminal */}
          <div style={{ flex: 1, overflow: 'hidden', padding: '8px' }}>
            <Terminal />
          </div>

          {/* Visual suggestions strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: 4 }}>
              VISUAL SUGGESTIONS
            </span>
            {[
              { cmd: 'git log',   icon: '◈', color: '#a855f7', label: 'Ver commits'      },
              { cmd: 'docker ps', icon: '⬡', color: '#3b82f6', label: 'Ver contenedores' },
              { cmd: 'ls -la',    icon: '◫', color: '#22c55e', label: 'Explorar archivos' },
              { cmd: 'npm list',  icon: '◉', color: '#f59e0b', label: 'Dependencias'      },
              { cmd: 'top',       icon: '◈', color: '#ef4444', label: 'System Monitor'   },
            ].map(s => (
              <button key={s.cmd} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', flexShrink: 0,
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                fontSize: 11, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = s.color;
                  el.style.color = s.color;
                  el.style.background = `${s.color}15`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--border-default)';
                  el.style.color = 'var(--text-secondary)';
                  el.style.background = 'var(--bg-elevated)';
                }}
              >
                <span style={{ color: s.color }}>{s.icon}</span>
                <strong style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{s.cmd}</strong>
                <span style={{ color: 'var(--text-muted)' }}>— {s.label}</span>
              </button>
            ))}
          </div>
        </main>

        {/* ── Column 3: Visual Panel ─────────────────────────── */}
        <VisualPanel
          visible={visualPanelVisible}
          onToggle={() => setVisualPanelVisible(v => !v)}
        />
      </div>
    </div>
  );
}
