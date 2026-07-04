import React, { useState } from 'react';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const SESSIONS = [
  { id: '1', name: 'Local Terminal',  icon: '⬡', color: '#22c55e', active: true  },
  { id: '2', name: 'Proyecto API',    icon: '⬡', color: '#3b82f6', active: false },
  { id: '3', name: 'Docker Host',     icon: '⬡', color: '#f59e0b', active: false },
  { id: '4', name: 'GitHub Actions',  icon: '⬡', color: '#a855f7', active: false },
];

const VISUAL_COMMANDS = [
  { cmd: 'git log',    label: 'Timeline',       icon: '◈', color: '#a855f7' },
  { cmd: 'docker ps',  label: 'Containers',     icon: '⬡', color: '#3b82f6' },
  { cmd: 'ls -la',     label: 'Files',          icon: '◫', color: '#22c55e' },
  { cmd: 'npm list',   label: 'Dependencies',   icon: '◉', color: '#f59e0b' },
  { cmd: 'top',        label: 'System Monitor', icon: '◈', color: '#ef4444' },
];

const HISTORY = ['git status', 'git log --oneline', 'docker ps -a', 'ls -la src/', 'npm install', 'top'];

// ─── Sub-components ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.1em',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      padding: '0 12px',
      marginBottom: '4px',
      marginTop: '16px',
    }}>{children}</div>
  );
}

function SessionItem({ session, onClick }: { session: typeof SESSIONS[0], onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      padding: '6px 12px',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: session.active ? 'var(--bg-active)' : 'transparent',
      color: session.active ? 'var(--text-primary)' : 'var(--text-secondary)',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: '13px',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => { if (!session.active) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!session.active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
    >
      <span style={{ color: session.color, fontSize: '8px' }}>●</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.name}
      </span>
      {session.active && (
        <span style={{
          fontSize: '10px', padding: '1px 6px',
          background: 'var(--accent-glow)', color: 'var(--accent-from)',
          borderRadius: '999px', border: '1px solid var(--accent-from)',
        }}>active</span>
      )}
    </button>
  );
}

function VisualCommandItem({ item }: { item: typeof VISUAL_COMMANDS[0] }) {
  return (
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      padding: '7px 12px',
      border: 'none',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
    >
      <span style={{
        width: 26, height: 26, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: `${item.color}20`,
        borderRadius: 'var(--radius-sm)',
        color: item.color, fontSize: '14px',
      }}>{item.icon}</span>
      <div>
        <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
          {item.cmd}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</div>
      </div>
    </button>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export function Sidebar() {
  const [sessions, setSessions] = useState(SESSIONS);

  const activate = (id: string) =>
    setSessions(s => s.map(sess => ({ ...sess, active: sess.id === id })));

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      minWidth: 'var(--sidebar-w)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      overflow: 'hidden',
    }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

        <SectionLabel>Sessions</SectionLabel>
        {sessions.map(s => <SessionItem key={s.id} session={s} onClick={() => activate(s.id)} />)}

        {/* New session */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          margin: '4px 12px 0', padding: '6px 8px',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          background: 'transparent',
          color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer',
          width: 'calc(100% - 24px)',
        }}>
          <span>+</span> New Session
        </button>

        <SectionLabel>Visual Commands</SectionLabel>
        {VISUAL_COMMANDS.map(item => <VisualCommandItem key={item.cmd} item={item} />)}

        <SectionLabel>History</SectionLabel>
        {HISTORY.map((cmd, i) => (
          <button key={i} style={{
            display: 'block', width: '100%', padding: '5px 12px',
            border: 'none', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--text-muted)',
            fontSize: '12px', fontFamily: "'JetBrains Mono', monospace",
            textAlign: 'left', cursor: 'pointer', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
          >{cmd}</button>
        ))}
      </div>

      {/* User footer */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>J</div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>juancho</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>~/proyectos/antigravity</div>
        </div>
      </div>
    </aside>
  );
}
