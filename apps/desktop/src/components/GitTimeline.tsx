import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GitCommit {
  id: string;       // full hash
  author: string;   // "Name <email>"
  date: string;
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shortHash(hash: string): string {
  return hash.slice(0, 7);
}

function parseAuthorName(author: string): string {
  // "Juan Alcoba <juan@mail.com>" → "Juan Alcoba"
  return author.split('<')[0].trim();
}

function parseAuthorInitials(author: string): string {
  return parseAuthorName(author)
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(raw: string): string {
  // Raw date from git: "Thu Jun 28 18:06:12 2026 -0300"
  try {
    const d = new Date(raw);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return raw.trim().split(' ').slice(0, 4).join(' ');
  }
}

// ─── Commit Card ─────────────────────────────────────────────────────────────
function CommitCard({ commit, isLast }: { commit: GitCommit; isLast: boolean }) {
  const initials = parseAuthorInitials(commit.author);
  const name     = parseAuthorName(commit.author);
  const hash     = shortHash(commit.id);
  const date     = formatDate(commit.date);

  // Tag first line of message as subject, rest as body
  const [subject, ...bodyLines] = commit.message.split('\n');
  const body = bodyLines.join('\n').trim();

  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* Timeline connector */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        {/* Dot */}
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
          boxShadow: '0 0 8px var(--accent-glow)',
          flexShrink: 0,
          marginTop: 14,
          zIndex: 1,
        }} />
        {/* Line */}
        {!isLast && (
          <div style={{
            width: 1,
            flex: 1,
            minHeight: 24,
            background: 'linear-gradient(to bottom, var(--border-strong), transparent)',
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Card */}
      <div style={{
        flex: 1,
        marginBottom: isLast ? 0 : 12,
        padding: '10px 12px',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: 'default',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--border-strong)';
          el.style.boxShadow = '0 0 0 1px var(--accent-glow)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = 'var(--border-subtle)';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {/* Avatar */}
          <div style={{
            width: 22, height: 22,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-from), var(--accent-to))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff',
            flexShrink: 0,
          }}>{initials}</div>

          {/* Author */}
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
            {name}
          </span>

          {/* Hash pill */}
          <span style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--accent-from)',
            padding: '1px 6px',
            background: 'var(--accent-glow)',
            borderRadius: '999px',
            border: '1px solid var(--accent-from)40',
          }}>{hash}</span>
        </div>

        {/* Commit message */}
        <p style={{
          fontSize: 12,
          color: 'var(--text-primary)',
          lineHeight: 1.5,
          marginBottom: body ? 6 : 0,
        }}>{subject}</p>

        {/* Body (if any) */}
        {body && (
          <p style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>{body}</p>
        )}

        {/* Footer */}
        <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)' }}>
          {date}
        </div>
      </div>
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[80, 60, 90].map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 10, marginTop: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--border-strong)' }} />
          </div>
          <div style={{
            flex: 1, padding: '10px 12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--border-strong)' }} />
              <div style={{ height: 12, width: `${w}%`, background: 'var(--border-strong)', borderRadius: 4 }} />
            </div>
            <div style={{ height: 11, width: '100%', background: 'var(--border-subtle)', borderRadius: 4, marginBottom: 6 }} />
            <div style={{ height: 10, width: '40%', background: 'var(--border-subtle)', borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <div style={{
        width: 56, height: 56,
        borderRadius: 'var(--radius-md)',
        background: 'rgba(168,85,247,0.1)',
        border: '1px solid rgba(168,85,247,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: 'var(--purple)',
      }}>◈</div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>No commits yet</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Run <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--purple)' }}>git log</span> in the terminal
        </p>
      </div>
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ commits }: { commits: GitCommit[] }) {
  const authors = new Set(commits.map(c => parseAuthorName(c.author))).size;

  return (
    <div style={{
      display: 'flex', gap: 16, flexWrap: 'wrap',
      padding: '8px 0',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 8,
      flexShrink: 0,
    }}>
      {[
        { label: 'Total Commits', value: commits.length, color: 'var(--purple)' },
        { label: 'Authors',       value: authors,        color: 'var(--blue)'   },
      ].map(stat => (
        <div key={stat.label}>
          <div style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main GitTimeline ─────────────────────────────────────────────────────────
interface GitTimelineProps {
  commits: GitCommit[] | null;  // null = loading, [] = empty, [...] = data
}

export function GitTimeline({ commits }: GitTimelineProps) {
  if (commits === null) {
    return (
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <LoadingState />
      </div>
    );
  }

  if (commits.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Scrollable commit list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {commits.map((commit, i) => (
          <CommitCard
            key={commit.id}
            commit={commit}
            isLast={i === commits.length - 1}
          />
        ))}
      </div>

      <StatsBar commits={commits} />
    </div>
  );
}
