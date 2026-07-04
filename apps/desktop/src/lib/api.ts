import { invoke } from '@tauri-apps/api/core';

export interface CommandResult {
  stdout: string;
  stderr: string;
  success: boolean;
  exit_code: number;
}

export async function executeShellCommand(command: string): Promise<CommandResult> {
  return await invoke('execute_shell_command', { command });
}
