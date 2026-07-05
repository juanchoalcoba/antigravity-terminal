export interface SessionInsight {
  title: string;
  detail: string;
  tone: 'neutral' | 'positive' | 'warning';
}

export interface SessionSuggestion {
  command: string;
  reason: string;
}

export interface SessionContext {
  insights: SessionInsight[];
  suggestions: SessionSuggestion[];
}

export function buildSessionContext(session: { history: string[] }): SessionContext {
  const commands = session.history.map((command) => command.trim().toLowerCase());
  const hasGit = commands.some((command) => command.startsWith('git'));
  const hasDocker = commands.some((command) => command.startsWith('docker'));
  const hasSystem = commands.some((command) => command.startsWith('ps') || command.startsWith('top'));

  const insights: SessionInsight[] = [];
  const suggestions: SessionSuggestion[] = [];

  if (hasGit) {
    insights.push({
      title: 'Git context',
      detail: 'Your recent commands suggest you are working with repository state.',
      tone: 'positive',
    });
    suggestions.push({ command: 'git status', reason: 'Check the current repository state.' });
    suggestions.push({ command: 'git log --oneline -5', reason: 'Review the latest commits.' });
  }

  if (hasDocker) {
    insights.push({
      title: 'Docker context',
      detail: 'Your recent commands suggest container workflows.',
      tone: 'positive',
    });
    suggestions.push({ command: 'docker compose ps', reason: 'Inspect active container services.' });
    suggestions.push({ command: 'docker ps -a', reason: 'Review all containers.' });
  }

  if (hasSystem) {
    insights.push({
      title: 'System context',
      detail: 'You are inspecting runtime or process information.',
      tone: 'neutral',
    });
    suggestions.push({ command: 'top', reason: 'Monitor process activity.' });
  }

  if (!insights.length) {
    insights.push({
      title: 'General context',
      detail: 'No specialized workflow detected yet.',
      tone: 'neutral',
    });
    suggestions.push({ command: 'pwd', reason: 'Verify your current working directory.' });
    suggestions.push({ command: 'ls -la', reason: 'Inspect the current folder contents.' });
  }

  return { insights, suggestions: suggestions.slice(0, 4) };
}
