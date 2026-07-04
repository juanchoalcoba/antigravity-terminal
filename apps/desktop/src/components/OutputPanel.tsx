import React from 'react';
import { OutputEntry } from './TerminalPanel';

interface Props {
  history: OutputEntry[];
}

export function OutputPanel({ history }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {history.map((entry) => (
        <div key={entry.id}>
          <div style={{ color: '#00ff00' }}>$ {entry.command}</div>
          {entry.result ? (
            <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
              {entry.result.stdout && <div>{entry.result.stdout}</div>}
              {entry.result.stderr && <div style={{ color: '#ff5555' }}>{entry.result.stderr}</div>}
              {entry.result.exit_code !== 0 && (
                <div style={{ color: '#ff5555', fontSize: '12px' }}>
                  [Exit code: {entry.result.exit_code}]
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic' }}>Running...</div>
          )}
        </div>
      ))}
    </div>
  );
}
