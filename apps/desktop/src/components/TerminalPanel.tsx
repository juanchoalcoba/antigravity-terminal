import { useEffect, useState } from 'react';
import { executeShellCommand, type CommandResult } from '../lib/api';
import { addCommandToSession, createInitialSessions } from '../lib/sessionState';
import { CommandInput } from './CommandInput';
import { OutputPanel } from './OutputPanel';

export interface OutputEntry {
  id: number;
  command: string;
  result?: CommandResult;
}

export function TerminalPanel() {
  const [history, setHistory] = useState<OutputEntry[]>([]);
  const [nextId, setNextId] = useState(1);
  const [sessionState, setSessionState] = useState(createInitialSessions);

  useEffect(() => {
    window.localStorage.setItem('antigravity-sessions', JSON.stringify(sessionState));
    window.dispatchEvent(new CustomEvent('session-state-updated', { detail: sessionState }));
  }, [sessionState]);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    const id = nextId;
    setNextId(id + 1);

    setSessionState((current) => addCommandToSession(current, command));

    const entry: OutputEntry = { id, command };
    setHistory((prev) => [...prev, entry]);

    try {
      const result = await executeShellCommand(command);
      setHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, result } : item))
      );
    } catch (error) {
      setHistory((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                result: {
                  stdout: '',
                  stderr: String(error),
                  success: false,
                  exit_code: -1,
                },
              }
            : item
        )
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px', overflowY: 'auto' }}>
      <OutputPanel history={history} />
      <CommandInput onExecute={handleCommand} />
    </div>
  );
}
