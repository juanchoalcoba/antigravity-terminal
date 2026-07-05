import { useMemo } from 'react';

interface DockerContainer {
  containerId: string;
  image: string;
  command: string;
  status: string;
  names: string;
}

interface ProcessRow {
  user: string;
  pid: string;
  cpu: string;
  mem: string;
  command: string;
}

interface VisualPanelsProps {
  gitCommits: Array<{ id: string; author: string; date: string; message: string }> | null;
  dockerData: DockerContainer[] | null;
  systemData: { processes: ProcessRow[] } | null;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ color: 'var(--text-muted)', fontSize: 12, paddingTop: 8 }}>{label}</div>
  );
}

export function VisualPanels({ gitCommits, dockerData, systemData }: VisualPanelsProps) {
  const gitSummary = useMemo(() => gitCommits?.slice(0, 3) ?? [], [gitCommits]);
  const dockerSummary = useMemo(() => dockerData?.slice(0, 4) ?? [], [dockerData]);
  const systemSummary = useMemo(() => systemData?.processes?.slice(0, 6) ?? [], [systemData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
      <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-from)', marginBottom: 8 }}>Git</div>
        {gitSummary.length ? gitSummary.map(commit => (
          <div key={commit.id} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <strong>{commit.message}</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{commit.author}</div>
          </div>
        )) : <EmptyState label="No git data yet" />}
      </section>

      <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>Docker</div>
        {dockerSummary.length ? dockerSummary.map(container => (
          <div key={container.containerId} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <strong>{container.names}</strong> · {container.status}
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{container.image}</div>
          </div>
        )) : <EmptyState label="No docker data yet" />}
      </section>

      <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Processes</div>
        {systemSummary.length ? systemSummary.map(process => (
          <div key={`${process.pid}-${process.command}`} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
            <strong>{process.command}</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{process.pid} · CPU {process.cpu} · MEM {process.mem}</div>
          </div>
        )) : <EmptyState label="No process data yet" />}
      </section>
    </div>
  );
}
