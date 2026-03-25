import ReactMarkdown from 'react-markdown'

interface RawData {
  market: Record<string, unknown>
  fundamentals: Record<string, unknown>
  sentiment: Record<string, unknown>
}

interface Props {
  ticker: string
  company: string
  brief: string
  rawData: RawData
}

export default function ResearchBrief({ ticker, company, brief, rawData }: Props) {
  const m = rawData.market as Record<string, unknown>
  const s = rawData.sentiment as Record<string, unknown>
  const f = rawData.fundamentals as Record<string, unknown>

  const changePos = m.change_pct != null ? Number(m.change_pct) >= 0 : null

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.tickerBadge}>{ticker}</div>
          <div>
            <div style={styles.companyName}>{company}</div>
            {f.sector != null && <div style={styles.sector}>{String(f.sector)} · {String(f.industry ?? '')}</div>}
          </div>
        </div>
        {m.price != null && (
          <div style={styles.priceBlock}>
            <div style={styles.price}>${Number(m.price).toFixed(2)}</div>
            {m.change_pct != null && (
              <div style={{ ...styles.change, color: changePos ? '#4ade80' : '#f87171', background: changePos ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)' }}>
                {changePos ? '▲' : '▼'} {Math.abs(Number(m.change_pct))}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        {m.market_cap != null && <StatCard label="Market Cap" value={formatLarge(Number(m.market_cap))} />}
        {m['52w_high'] != null && <StatCard label="52W High" value={`$${String(m['52w_high'])}`} />}
        {m['52w_low'] != null && <StatCard label="52W Low" value={`$${String(m['52w_low'])}`} />}
        {f.pe_ratio != null && <StatCard label="P/E Ratio" value={String(Number(f.pe_ratio).toFixed(1))} />}
        {s.recommendation != null && <StatCard label="Consensus" value={String(s.recommendation).toUpperCase()} highlight />}
        {s.target_mean_price != null && <StatCard label="Price Target" value={`$${String(s.target_mean_price)}`} />}
      </div>

      {/* Brief */}
      <div style={styles.briefWrap}>
        <div style={styles.briefInner}>
          <ReactMarkdown>{brief}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ ...cardStyle, ...(highlight ? highlightCard : {}) }}>
      <span style={cardLabel}>{label}</span>
      <span style={{ ...cardValue, ...(highlight ? { color: '#a78bfa' } : {}) }}>{value}</span>
    </div>
  )
}

function formatLarge(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n}`
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '2rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 1.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  tickerBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.1rem',
    letterSpacing: '0.05em',
    boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
  },
  companyName: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#f1f5f9',
  },
  sector: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  priceBlock: {
    textAlign: 'right' as const,
  },
  price: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  change: {
    display: 'inline-block',
    marginTop: '0.25rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  statsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
    padding: '1.25rem 1.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  briefWrap: {
    padding: '1.75rem',
  },
  briefInner: {
    lineHeight: 1.8,
    fontSize: '0.95rem',
    color: '#94a3b8',
  },
}

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.2rem',
  padding: '0.6rem 1rem',
  background: 'rgba(255,255,255,0.04)',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.06)',
  minWidth: '90px',
}

const highlightCard: React.CSSProperties = {
  background: 'rgba(139,92,246,0.08)',
  borderColor: 'rgba(139,92,246,0.25)',
}

const cardLabel: React.CSSProperties = {
  fontSize: '0.68rem',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 600,
}

const cardValue: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: 700,
  color: '#e2e8f0',
}
