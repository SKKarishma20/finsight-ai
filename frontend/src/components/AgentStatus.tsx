const AGENTS = [
  { id: 'market', label: 'Market Data', icon: '📈' },
  { id: 'fundamentals', label: 'Fundamentals', icon: '📊' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'sentiment', label: 'Analyst Sentiment', icon: '🎯' },
  { id: 'synthesis', label: 'AI Synthesis', icon: '✦' },
]

interface Props {
  active: boolean
  completedAgents: string[]
}

export default function AgentStatus({ active, completedAgents }: Props) {
  if (!active && completedAgents.length === 0) return null

  return (
    <div style={styles.container}>
      <p style={styles.label}>
        {active ? '⟳ Agents working in parallel…' : '✓ All agents complete'}
      </p>
      <div style={styles.grid}>
        {AGENTS.map(agent => {
          const done = completedAgents.includes(agent.id)
          const running = active && !done
          return (
            <div
              key={agent.id}
              style={{
                ...styles.chip,
                ...(done ? styles.done : running ? styles.running : styles.idle),
              }}
            >
              <span style={{ fontSize: agent.id === 'synthesis' ? '0.8rem' : '0.9rem' }}>
                {agent.icon}
              </span>
              <span>{agent.label}</span>
              {running && <span style={styles.dot} />}
              {done && <span style={styles.check}>✓</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '1.25rem',
    padding: '1rem 1.25rem',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(10px)',
  },
  label: {
    fontSize: '0.72rem',
    color: '#475569',
    marginBottom: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    fontWeight: 600,
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.82rem',
    fontWeight: 500,
    border: '1px solid transparent',
    transition: 'all 0.3s ease',
  },
  idle: {
    background: 'rgba(255,255,255,0.03)',
    color: '#334155',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  running: {
    background: 'rgba(59,130,246,0.1)',
    color: '#93c5fd',
    borderColor: 'rgba(59,130,246,0.3)',
    boxShadow: '0 0 12px rgba(59,130,246,0.15)',
  },
  done: {
    background: 'rgba(34,197,94,0.08)',
    color: '#86efac',
    borderColor: 'rgba(34,197,94,0.25)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#3b82f6',
    animation: 'pulse 1s infinite',
  },
  check: {
    fontSize: '0.7rem',
    color: '#22c55e',
  },
}
