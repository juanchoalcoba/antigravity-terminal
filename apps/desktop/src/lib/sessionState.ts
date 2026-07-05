export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  createdAt: string;
  active: boolean;
  history: string[];
  icon: string;
  color: string;
  gitRepo: boolean;
  gitBranch: string | null;
  gitStatus: string | null;
  dockerActive: boolean;
  systemSummary: string | null;
}

export interface SessionState {
  sessions: TerminalSession[];
  activeSessionId: string;
}

const createSession = (id: string, name: string, cwd: string, color = '#22c55e', icon = '⬡'): TerminalSession => ({
  id,
  name,
  cwd,
  createdAt: new Date().toISOString(),
  active: false,
  history: [],
  icon,
  color,
  gitRepo: false,
  gitBranch: null,
  gitStatus: null,
  dockerActive: false,
  systemSummary: null,
});

export function createInitialSessions(): SessionState {
  const initial = [
    createSession('session-1', 'Local Terminal', '~', '#22c55e', '⬡'),
    createSession('session-2', 'Proyecto API', '~/projects/api', '#3b82f6', '⬡'),
  ];
  initial[0].active = true;
  return { sessions: initial, activeSessionId: initial[0].id };
}

export function addCommandToSession(state: SessionState, command: string): SessionState {
  if (!command.trim()) return state;

  return {
    ...state,
    sessions: state.sessions.map((session) => {
      if (session.id !== state.activeSessionId) return session;
      return {
        ...session,
        history: [...session.history, command].slice(-20),
      };
    }),
  };
}

export function createNewSession(state: SessionState, name?: string): SessionState {
  const newSession = createSession(`session-${Date.now()}`, name ?? 'New Session', '~', '#a855f7', '⬡');
  return {
    sessions: [...state.sessions, newSession],
    activeSessionId: newSession.id,
  };
}

export function activateSession(state: SessionState, sessionId: string): SessionState {
  return {
    ...state,
    activeSessionId: sessionId,
    sessions: state.sessions.map((session) => ({
      ...session,
      active: session.id === sessionId,
    })),
  };
}

export function updateSessionCwd(state: SessionState, sessionId: string, cwd: string): SessionState {
  return {
    ...state,
    sessions: state.sessions.map((session) => (
      session.id === sessionId ? { ...session, cwd } : session
    )),
  };
}

export function renameSession(state: SessionState, sessionId: string, name: string): SessionState {
  return {
    ...state,
    sessions: state.sessions.map((session) => (
      session.id === sessionId ? { ...session, name: name.trim() || session.name } : session
    )),
  };
}

export function deleteSession(state: SessionState, sessionId: string): SessionState {
  const remaining = state.sessions.filter((session) => session.id !== sessionId);
  const wasActive = state.sessions.find((session) => session.id === sessionId)?.active ?? false;
  const nextActiveId = wasActive && remaining.length ? remaining[0].id : state.activeSessionId;

  return {
    ...state,
    sessions: remaining.map((session) => ({
      ...session,
      active: session.id === nextActiveId,
    })),
    activeSessionId: nextActiveId,
  };
}

export function updateSessionContext(
  state: SessionState,
  command: string,
  result: { stdout?: string; stderr?: string; success?: boolean; exit_code?: number },
): SessionState {
  if (!command.trim()) return state;

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim();
  const gitRepo = /git/.test(command) || /On branch/.test(output) || /Changes not staged/.test(output);
  const gitBranch = output.match(/On branch ([^\s]+)/)?.[1] ?? null;
  const gitStatus = output.includes('Changes not staged') || output.includes('nothing to commit')
    ? output.split('\n').filter(Boolean).slice(0, 3).join(' • ')
    : null;
  const dockerActive = /docker/.test(command) && /up/.test(output);
  const systemSummary = /top/.test(command) || /ps/.test(command) ? output.slice(0, 80) : null;

  return {
    ...state,
    sessions: state.sessions.map((session) => {
      if (session.id !== state.activeSessionId) return session;
      return {
        ...session,
        gitRepo,
        gitBranch,
        gitStatus,
        dockerActive,
        systemSummary,
      };
    }),
  };
}
