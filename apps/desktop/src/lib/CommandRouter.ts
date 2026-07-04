export enum CommandType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
  NAVIGATION = 'NAVIGATION',
  VISUAL = 'VISUAL'
}

export function classifyCommand(input: string): CommandType {
  const trimmed = input.trim();
  if (!trimmed) return CommandType.TEXT;

  const cmd = trimmed.split(' ')[0].toLowerCase();
  
  const visualCommands = ['git', 'docker', 'npm', 'yarn', 'pnpm'];
  const navigationCommands = ['cd', 'ls', 'tree', 'dir'];
  const systemCommands = ['ipconfig', 'ps', 'env', 'top'];

  if (visualCommands.includes(cmd)) return CommandType.VISUAL;
  if (navigationCommands.includes(cmd)) return CommandType.NAVIGATION;
  if (systemCommands.includes(cmd)) return CommandType.SYSTEM;
  
  return CommandType.TEXT;
}

// Custom event payloads for type safety
export interface VisualCommandStartEvent {
  command: string;
}

// Augment the window event system for custom typing
declare global {
  interface WindowEventMap {
    'visual-command-start': CustomEvent<VisualCommandStartEvent>;
    'terminal-mode-switch': CustomEvent<{ mode: 'text' | 'hybrid' }>;
  }
}
