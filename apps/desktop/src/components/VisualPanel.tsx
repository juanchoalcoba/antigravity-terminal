import React, { useState, useEffect } from 'react';
import { GitTimeline } from './GitTimeline';
import type { GitCommit } from './GitTimeline';

const TABS = [
  { id: 'git',    label: 'Git Timeline',       icon: '◈', color: '#a855f7' },
  { id: 'docker', label: 'Docker Containers',  icon: '⬡', color: '#3b82f6' },
  { id: 'files',  label: 'File Explorer',      icon: '◫', color: '#22c55e' },
  { id: 'system', label: 'System Monitor',     icon: '◉', color: '#ef4444' },
];

// ─── Placeholder Panels ───────────────────────────────────────────────────────
function EmptyState({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      color: 'var(--text-muted)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-md)',
        background: `${color}18`, border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color,
      }}>⬡</div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          No data yet
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Run <span style={{ fontFamily: "'JetBrains Mono', monospace", color }}>{label.toLowerCase()}</span> in the terminal
        </p>
      </div>
    </div>
  );
}

// ─── Visual Panel ─────────────────────────────────────────────────────────────
interface VisualPanelProps {
  visible: boolean;
  onToggle: () => void;
}

export function VisualPanel({ visible, onToggle }: VisualPanelProps) {
  const [activeTab, setActiveTab] = useState('git');
  const [hasData, setHasData] = useState<Record<string, boolean>>({});
  const [gitCommits, setGitCommits] = useState<GitCommit[] | null>(null);

  useEffect(() => {
    const handleOutputReady = (e: Event) => {
      const customEvent = e as CustomEvent;
      const cmd: string = customEvent.detail?.command ?? '';
      const data = customEvent.detail?.data;

      if (cmd.startsWith('git')) {
        setHasData(d => ({ ...d, git: true }));
        setGitCommits(Array.isArray(data) ? data as GitCommit[] : []);
        setActiveTab('git'); // auto-switch to git tab when data arrives
      }
      if (cmd.startsWith('docker')) setHasData(d => ({ ...d, docker: true }));
      if (cmd.startsWith('ls'))     setHasData(d => ({ ...d, files: true }));
      if (cmd === 'top')            setHasData(d => ({ ...d, system: true }));
    };
    window.addEventListener('visual-output-ready', handleOutputReady);
    return () => window.removeEventListener('visual-output-ready', handleOutputReady);
  }, []);

  const activeColor = TABS.find(t => t.id === activeTab)?.color ?? '#7c3aed';

  return (
    <aside style={{
      width: visible ? 'var(--vpanel-w)' : '0px',
      minWidth: visible ? 'var(--vpanel-w)' : '0px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '0 12px',
        height: 'var(--topbar-h)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
          VISUAL OUTPUT
        </span>
        <div style={{ flex: 1 }} />
        {/* Overlay toggle */}
        <button onClick={onToggle} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)',
          color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: visible ? 'var(--green)' : 'var(--text-muted)',
            display: 'inline-block',
            boxShadow: visible ? '0 0 6px var(--green)' : 'none',
            transition: 'all 0.2s',
          }} />
          OVERLAY
        </button>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 14px', flexShrink: 0,
              border: 'none', borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
              background: 'transparent',
              color: isActive ? tab.color : 'var(--text-muted)',
              fontSize: 12, cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              fontWeight: isActive ? 600 : 400,
            }}>
              <span style={{ fontSize: 10 }}>{tab.icon}</span>
              {tab.label}
              {hasData[tab.id] && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: tab.color, marginLeft: 2,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
        {activeTab === 'git' ? (
          <GitTimeline commits={gitCommits} />
        ) : (
          <EmptyState
            label={TABS.find(t => t.id === activeTab)?.label ?? ''}
            color={activeColor}
          />
        )}
      </div>

      {/* Stats footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {[
          { label: 'Commits',  val: gitCommits ? String(gitCommits.length)  : '—', color: '#a855f7' },
          { label: 'Containers',val: hasData.docker ? '—'  : '—', color: '#3b82f6' },
          { label: 'Files',    val: hasData.files   ? '—' : '—', color: '#22c55e' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: stat.val === '—' ? 'var(--text-muted)' : stat.color }}>
              {stat.val}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
