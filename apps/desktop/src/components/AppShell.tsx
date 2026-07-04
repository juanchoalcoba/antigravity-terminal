import React from 'react';
import { TerminalPanel } from './TerminalPanel';

export function AppShell() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace' }}>
      <header style={{ padding: '10px', backgroundColor: '#333', borderBottom: '1px solid #555' }}>
        Antigravity Terminal (Sprint 1)
      </header>
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <TerminalPanel />
      </main>
    </div>
  );
}
