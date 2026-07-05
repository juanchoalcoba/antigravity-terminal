import { describe, expect, it } from 'vitest';
import { buildSessionContext } from './sessionContext';

describe('session context helpers', () => {
  it('builds git-oriented suggestions from session history', () => {
    const context = buildSessionContext({
      history: ['git log', 'git status'],
    });

    expect(context.insights.some((insight) => insight.title === 'Git context')).toBe(true);
    expect(context.suggestions.some((suggestion) => suggestion.command === 'git status')).toBe(true);
  });

  it('builds docker-oriented suggestions from session history', () => {
    const context = buildSessionContext({
      history: ['docker ps'],
    });

    expect(context.insights.some((insight) => insight.title === 'Docker context')).toBe(true);
    expect(context.suggestions.some((suggestion) => suggestion.command === 'docker compose ps')).toBe(true);
  });

  it('returns general suggestions when there is no meaningful context', () => {
    const context = buildSessionContext({
      history: [],
    });

    expect(context.suggestions.length).toBeGreaterThan(0);
    expect(context.suggestions[0].command).toBe('pwd');
  });
});
