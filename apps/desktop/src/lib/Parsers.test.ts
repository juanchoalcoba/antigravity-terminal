import { describe, expect, it } from 'vitest';
import { getParserFor } from './Parsers';

describe('visual parsers', () => {
  it('parses git log output into commits', () => {
    const parser = getParserFor('git log');
    const result = parser?.parse(`commit 1234567
Author: Jane Doe <jane@example.com>
Date:   Tue Jul 2 10:00:00 2026 -0300

Add feature`);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: '1234567', author: 'Jane Doe <jane@example.com>' });
  });

  it('parses docker ps output into containers', () => {
    const parser = getParserFor('docker ps');
    const result = parser?.parse(`CONTAINER ID   IMAGE        COMMAND   CREATED         STATUS      PORTS     NAMES
abc123         nginx        \"/docker-entrypoint.sh\"   2 hours ago   Up 2 hours  80/tcp   web`);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ names: 'web' });
  });

  it('parses ps output into system processes', () => {
    const parser = getParserFor('ps aux');
    const result = parser?.parse(`USER       PID %CPU %MEM COMMAND
root         1  0.0  0.1 /sbin/init
node       20  0.5  0.3 node server.js`);

    expect(result.processes).toHaveLength(2);
    expect(result.processes[1]).toMatchObject({ command: 'node server.js' });
  });
});
