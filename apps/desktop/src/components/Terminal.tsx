import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { classifyCommand, CommandType } from '../lib/CommandRouter';
import { getParserFor, stripAnsi } from '../lib/Parsers';
import '@xterm/xterm/css/xterm.css';

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
      fontFamily: 'monospace',
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    term.focus();

    // --- Output interception state ---
    let isCapturingVisualOutput = false;
    let currentVisualCommand = '';
    let visualOutputBuffer = '';
    let outputIdleTimer: ReturnType<typeof setTimeout> | null = null;

    const fireVisualOutput = () => {
      if (!isCapturingVisualOutput) return;
      isCapturingVisualOutput = false;
      outputIdleTimer = null;

      console.log('[Interceptor] Idle timeout fired for:', currentVisualCommand);
      invoke('mark_process_ended', { sessionId: sessionIdRef.current ?? '' }).catch(console.error);

      const parser = getParserFor(currentVisualCommand);
      if (parser) {
        const parsedData = parser.parse(visualOutputBuffer);
        console.log('[Interceptor] Parsed data:', parsedData);
        window.dispatchEvent(new CustomEvent('visual-output-ready', {
          detail: { command: currentVisualCommand, data: parsedData }
        }));
      }
      visualOutputBuffer = '';
    };

    // Defined here so cleanup can reference it
    const handleVisualStart = (e: Event) => {
      const customEvent = e as CustomEvent;
      isCapturingVisualOutput = true;
      currentVisualCommand = customEvent.detail.command;
      visualOutputBuffer = '';
      if (outputIdleTimer) clearTimeout(outputIdleTimer);
    };
    window.addEventListener('visual-command-start', handleVisualStart);

    let unlistenData: (() => void) | null = null;
    let unlistenExit: (() => void) | null = null;

    const initPty = async () => {
      // Guard: only run inside Tauri — not in a regular browser
      const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
      if (!isTauri) {
        term.write('\r\n\x1b[33m[Dev Mode] Running outside Tauri — PTY not available.\x1b[0m\r\n');
        term.write('\x1b[33mOpen the app via "pnpm tauri dev" to enable the full terminal.\x1b[0m\r\n');
        return;
      }

      try {
        const sessionId = await invoke<string>('create_pty_session', {
          rows: term.rows,
          cols: term.cols,
        });
        sessionIdRef.current = sessionId;

        // --- PTY output stream ---
        unlistenData = await listen<{ data: string }>(`pty-data-${sessionId}`, (event) => {
          const data = event.payload.data;
          term.write(data);

          if (isCapturingVisualOutput) {
            visualOutputBuffer += data;

            // Reset the idle timer on every incoming chunk.
            // When 800ms pass with no new data = command is done, parse.
            if (outputIdleTimer) clearTimeout(outputIdleTimer);
            outputIdleTimer = setTimeout(fireVisualOutput, 800);
          }

        });

        unlistenExit = await listen(`pty-exit-${sessionId}`, () => {
          term.write('\r\n\x1b[31m[Process Exited]\x1b[0m\r\n');
        });

        // --- Input snooping buffer ---
        let currentLineBuffer = '';

        term.onData((data) => {
          if (data === '\r') {
            const cmdType = classifyCommand(currentLineBuffer);

            if (cmdType === CommandType.VISUAL) {
              window.dispatchEvent(new CustomEvent('visual-command-start', { detail: { command: currentLineBuffer } }));
              console.log(`[Router] VISUAL: ${currentLineBuffer}`);
            } else if (cmdType === CommandType.NAVIGATION) {
              console.log(`[Router] NAVIGATION: ${currentLineBuffer}`);
            } else if (cmdType === CommandType.SYSTEM) {
              console.log(`[Router] SYSTEM: ${currentLineBuffer}`);
            }

            // Notify backend to register and classify the process
            if (currentLineBuffer.trim()) {
              invoke('register_process', { sessionId, command: currentLineBuffer.trim() }).catch(console.error);
            }

            currentLineBuffer = '';
            invoke('write_to_pty', { sessionId, data }).catch(console.error);
          } else if (data === '\x7f' || data === '\b') {
            currentLineBuffer = currentLineBuffer.slice(0, -1);
            invoke('write_to_pty', { sessionId, data }).catch(console.error);
          } else {
            // Accumulate printable chars, skip ANSI escape sequences
            if (!data.startsWith('\x1b')) {
              currentLineBuffer += data;
            }
            invoke('write_to_pty', { sessionId, data }).catch(console.error);
          }
        });

        term.onResize((size) => {
          invoke('resize_pty', { sessionId, rows: size.rows, cols: size.cols }).catch(console.error);
        });

      } catch (error) {
        term.write(`\r\n\x1b[31mFailed to start PTY: ${String(error)}\x1b[0m\r\n`);
      }
    };

    initPty();

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('visual-command-start', handleVisualStart);
      if (sessionIdRef.current) {
        invoke('destroy_pty_session', { sessionId: sessionIdRef.current }).catch(console.error);
      }
      if (unlistenData) unlistenData();
      if (unlistenExit) unlistenExit();
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />;
}
