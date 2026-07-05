import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildSessionContext } from '../lib/sessionContext';
import { activateSession, createInitialSessions, createNewSession, deleteSession, renameSession, updateSessionCwd, type SessionState, type TerminalSession } from '../lib/sessionState';
import { loadStoredSessions, saveStoredSessions } from '../lib/storage';

const VISUAL_COMMANDS = [
  { cmd: 'git log',    label: 'Timeline',       icon: '◈', color: '#a855f7' },
  { cmd: 'docker ps',  label: 'Containers',     icon: '⬡', color: '#3b82f6' },
  { cmd: 'ls -la',     label: 'Files',          icon: '◫', color: '#22c55e' },
  { cmd: 'npm list',   label: 'Dependencies',   icon: '◉', color: '#f59e0b' },
  { cmd: 'top',        label: 'System Monitor', icon: '◈', color: '#ef4444' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: ReactNode }) {
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

function SessionItem({ session, onClick, onDelete, onRename }: { session: TerminalSession, onClick: () => void, onDelete: () => void, onRename: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
      <button onClick={onClick} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
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
      <button onClick={onRename} title="Rename session" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>✎</button>
      <button onClick={onDelete} title="Delete session" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
    </div>
  );
}

function VisualCommandItem({ item }: { item: (typeof VISUAL_COMMANDS)[number] }) {
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
  const [state, setState] = useState<SessionState>(() => loadStoredSessions<SessionState | null>(null) ?? createInitialSessions());

  useEffect(() => {
    const stored = loadStoredSessions<SessionState | null>(null);
    if (stored?.sessions?.length) {
      setState(stored);
    }

    const handleSessionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<SessionState>;
      if (customEvent.detail?.sessions?.length) {
        setState(customEvent.detail);
      }
    };

    const handleSessionCwdUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ sessionId: string; cwd: string }>;
      if (customEvent.detail?.sessionId && customEvent.detail.cwd) {
        setState((current) => updateSessionCwd(current, customEvent.detail.sessionId, customEvent.detail.cwd));
      }
    };

    window.addEventListener('session-state-updated', handleSessionUpdate);
    window.addEventListener('session-cwd-updated', handleSessionCwdUpdate);
    return () => {
      window.removeEventListener('session-state-updated', handleSessionUpdate);
      window.removeEventListener('session-cwd-updated', handleSessionCwdUpdate);
    };
  }, []);

  useEffect(() => {
    saveStoredSessions(state);
  }, [state]);

  const activeSession = useMemo(
    () => state.sessions.find((session) => session.id === state.activeSessionId) ?? state.sessions[0],
    [state.sessions, state.activeSessionId]
  );

  const context = useMemo(() => buildSessionContext(activeSession ?? { history: [] }), [activeSession]);

  const activate = (id: string) => setState((current) => activateSession(current, id));
  const addSession = () => setState((current) => createNewSession(current));
  const removeSession = (id: string) => setState((current) => deleteSession(current, id));
  const renameSessionName = (id: string) => {
    const nextName = window.prompt('New session name', activeSession?.name ?? 'New Session');
    if (nextName) {
      setState((current) => renameSession(current, id, nextName));
    }
  };

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
        {state.sessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            onClick={() => activate(s.id)}
            onDelete={() => removeSession(s.id)}
            onRename={() => renameSessionName(s.id)}
          />
        ))}

        {/* New session */}
        <button onClick={addSession} style={{
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

        <SectionLabel>Context</SectionLabel>
        <div style={{ padding: '5px 12px', color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeSession?.name ?? 'Session'}</div>
          <div style={{ color: 'var(--text-muted)' }}>{activeSession?.cwd ?? '~'}</div>
          {activeSession?.gitRepo ? (
            <div style={{ color: 'var(--text-muted)' }}>Git: {activeSession.gitBranch ?? 'branch unknown'}</div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Git: not detected</div>
          )}
          {activeSession?.gitStatus ? (
            <div style={{ color: 'var(--text-muted)' }}>{activeSession.gitStatus}</div>
          ) : null}
          {activeSession?.dockerActive ? (
            <div style={{ color: 'var(--text-muted)' }}>Docker: active</div>
          ) : null}
        </div>
        {context.insights.map((insight) => (
          <div key={insight.title} style={{ padding: '5px 12px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{insight.title}</div>
            <div style={{ color: 'var(--text-muted)' }}>{insight.detail}</div>
          </div>
        ))}

        <SectionLabel>Suggested Commands</SectionLabel>
        {context.suggestions.map((suggestion) => (
          <button key={suggestion.command} style={{
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
          >{suggestion.command}</button>
        ))}

        <SectionLabel>Visual Commands</SectionLabel>
        {VISUAL_COMMANDS.map(item => <VisualCommandItem key={item.cmd} item={item} />)}

        <SectionLabel>History</SectionLabel>
        {activeSession?.history.length ? activeSession.history.slice().reverse().map((cmd, i) => (
          <button key={`${cmd}-${i}`} style={{
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
        )) : (
          <div style={{ padding: '5px 12px', color: 'var(--text-muted)', fontSize: '12px' }}>
            No commands yet.
          </div>
        )}
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
