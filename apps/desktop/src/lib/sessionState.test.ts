import { describe, expect, it } from 'vitest';
import { addCommandToSession, createInitialSessions, createNewSession, activateSession, deleteSession, renameSession, updateSessionContext } from './sessionState';

describe('session state helpers', () => {
  it('adds commands to the active session history', () => {
    const state = createInitialSessions();
    const updated = addCommandToSession(state, 'npm run dev');

    const active = updated.sessions.find((session) => session.id === updated.activeSessionId);
    expect(active?.history).toContain('npm run dev');
  });

  it('creates a new active session', () => {
    const state = createInitialSessions();
    const updated = createNewSession(state, 'Docker Host');

    expect(updated.sessions).toHaveLength(3);
    expect(updated.activeSessionId).toBe(updated.sessions[2].id);
    expect(updated.sessions[2].name).toBe('Docker Host');
  });

  it('activates a selected session', () => {
    const state = createInitialSessions();
    const updated = activateSession(state, state.sessions[1].id);

    expect(updated.sessions[1].active).toBe(true);
    expect(updated.sessions[0].active).toBe(false);
    expect(updated.activeSessionId).toBe(state.sessions[1].id);
  });

  it('renames and deletes sessions', () => {
    const state = createInitialSessions();
    const renamed = renameSession(state, state.sessions[0].id, 'API Workspace');
    const deleted = deleteSession(renamed, renamed.sessions[0].id);

    expect(deleted.sessions[0].name).toBe('Proyecto API');
    expect(deleted.sessions.some((session) => session.id === state.sessions[0].id)).toBe(false);
  });

  it('updates git context from command results', () => {
    const state = createInitialSessions();
    const updated = updateSessionContext(state, 'git status', {
      stdout: 'On branch main\nChanges not staged for commit:',
      stderr: '',
      success: true,
      exit_code: 0,
    });

    const active = updated.sessions.find((session) => session.id === updated.activeSessionId);
    expect(active?.gitRepo).toBe(true);
    expect(active?.gitBranch).toBe('main');
    expect(active?.gitStatus).toContain('Changes not staged');
  });
});
