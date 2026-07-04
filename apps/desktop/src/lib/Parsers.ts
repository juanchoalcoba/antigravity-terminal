export interface VisualParser {
  canParse: (commandContext: string) => boolean;
  parse: (rawOutput: string) => any;
}

// Basic ANSI stripper
export function stripAnsi(text: string): string {
  return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ''
  );
}

export const gitLogParser: VisualParser = {
  canParse: (cmd) => cmd.startsWith('git log'),
  parse: (output) => {
    const clean = stripAnsi(output);
    const blocks = clean.split(/^commit /m).slice(1);
    return blocks.map(block => {
      const lines = block.split('\n');
      const hash = lines[0].trim();
      const authorLine = lines.find(l => l.startsWith('Author:'));
      const dateLine = lines.find(l => l.startsWith('Date:'));
      
      const messageStartIndex = lines.findIndex(l => l.trim() === '') + 1;
      const message = lines.slice(messageStartIndex).join('\n').trim();

      return { 
        id: hash, 
        author: authorLine ? authorLine.replace('Author:', '').trim() : 'Unknown',
        date: dateLine ? dateLine.replace('Date:', '').trim() : '',
        message
      };
    });
  }
};

export const dockerPsParser: VisualParser = {
  canParse: (cmd) => cmd.startsWith('docker ps'),
  parse: (output) => {
    const clean = stripAnsi(output);
    const lines = clean.trim().split('\n').filter(l => l.trim() !== '');
    if (lines.length <= 1) return [];
    
    // We assume standard docker ps columns separated by 2+ spaces
    return lines.slice(1).map(line => {
      const cols = line.split(/\s{2,}/);
      return {
        containerId: cols[0] || '',
        image: cols[1] || '',
        command: cols[2] || '',
        created: cols[3] || '',
        status: cols[4] || '',
        ports: cols.length > 6 ? cols[5] : '',
        names: cols[cols.length - 1] || ''
      };
    });
  }
};

export const parsers: VisualParser[] = [gitLogParser, dockerPsParser];

export function getParserFor(cmd: string): VisualParser | undefined {
  return parsers.find(p => p.canParse(cmd));
}

declare global {
  interface WindowEventMap {
    'visual-output-ready': CustomEvent<{ command: string, data: any }>;
    'terminal-overlay-toggle': CustomEvent<{ visible: boolean }>;
  }
}
