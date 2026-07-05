import { useState, type KeyboardEvent } from 'react';

interface Props {
  onExecute: (command: string) => void;
}

export function CommandInput({ onExecute }: Props) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onExecute(input);
      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', marginTop: '10px', alignItems: 'center' }}>
      <span style={{ color: '#00ff00', marginRight: '10px' }}>$</span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#d4d4d4',
          fontFamily: 'monospace',
          outline: 'none',
          fontSize: '14px',
        }}
        autoFocus
      />
    </div>
  );
}
