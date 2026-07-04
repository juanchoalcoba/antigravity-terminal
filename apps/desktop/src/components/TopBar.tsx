import React from 'react';

interface TopBarProps {
  activeSession?: string;
}

export function TopBar({ activeSession = 'juancho@antigravity' }: TopBarProps) {
  return (
    <header style={{
      height: 'var(--topbar-h)',
      minHeight: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0 16px',
      gap: '12px',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
        <div style={{
          width: 26,
          height: 26,
          borderRadius: '7px',
          background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}>AG</div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
          ANTIGRAVITY
        </span>
      </div>

      {/* Active tab */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '12px',
        color: 'var(--text-primary)',
        fontFamily: "'JetBrains Mono', monospace",
        cursor: 'pointer',
      }}>
        <span style={{ color: 'var(--green)', fontSize: '8px' }}>●</span>
        {activeSession}
        <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>▾</span>
      </div>

      {/* New tab button */}
      <button style={{
        width: 24,
        height: 24,
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
      }}>+</button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Window controls (mock for Tauri) */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {['#ef4444', '#f59e0b', '#22c55e'].map((color, i) => (
          <div key={i} style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: 0.7,
            cursor: 'pointer',
          }} />
        ))}
      </div>
    </header>
  );
}
