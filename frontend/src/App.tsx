import { useState } from 'react'
import SearchBar from './components/SearchBar'
import AgentStatus from './components/AgentStatus'
import ResearchBrief from './components/ResearchBrief'
import HumanReview from './components/HumanReview'
import ChatPanel from './components/ChatPanel'

interface ResearchResult {
  ticker: string
  company: string
  brief: string
  raw_data: {
    market: Record<string, unknown>
    fundamentals: Record<string, unknown>
    sentiment: Record<string, unknown>
  }
}

const AGENT_SEQUENCE = ['market', 'fundamentals', 'news', 'sentiment', 'synthesis']

export default function App() {
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completedAgents, setCompletedAgents] = useState<string[]>([])
  const [approved, setApproved] = useState(false)

  const handleSearch = async (ticker: string) => {
    setLoading(true)
    setResult(null)
    setError(null)
    setCompletedAgents([])
    setApproved(false)

    let i = 0
    const interval = setInterval(() => {
      if (i < AGENT_SEQUENCE.length - 1) {
        setCompletedAgents(prev => [...prev, AGENT_SEQUENCE[i]])
        i++
      }
    }, 1200)

    try {
      const res = await fetch('http://127.0.0.1:8000/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Request failed')
      }
      const data: ResearchResult = await res.json()
      clearInterval(interval)
      setCompletedAgents(AGENT_SEQUENCE)
      setResult(data)
    } catch (e) {
      clearInterval(interval)
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async (feedback: string) => {
    if (!result) return
    setRegenerating(true)
    setError(null)
    try {
      const res = await fetch('http://127.0.0.1:8000/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: result.ticker,
          company: result.company,
          original_brief: result.brief,
          feedback,
          raw_data: result.raw_data,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Regeneration failed')
      }
      const data: ResearchResult = await res.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginTop: '3.5rem', marginBottom: '0.5rem' }}>
        <div style={styles.badge}>AI-Powered · Multi-Agent · Real-Time</div>
        <h1 style={styles.title}>
          Fin<span style={styles.titleAccent}>Sight</span> <span style={styles.titleAI}>AI</span>
        </h1>
        <p style={styles.subtitle}>
          A team of specialized agents researches any stock in seconds
        </p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} />
      <AgentStatus active={loading} completedAgents={completedAgents} />

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <ResearchBrief
            ticker={result.ticker}
            company={result.company}
            brief={result.brief}
            rawData={result.raw_data}
          />
          {!approved ? (
            <HumanReview
              onApprove={() => setApproved(true)}
              onRegenerate={handleRegenerate}
              loading={regenerating}
            />
          ) : (
            <div style={styles.approvedBanner}>
              ✓ Brief approved
            </div>
          )}
          <ChatPanel
            ticker={result.ticker}
            company={result.company}
            brief={result.brief}
            rawData={result.raw_data as Record<string, unknown>}
          />
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'inline-block',
    padding: '0.3rem 0.9rem',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'rgba(59,130,246,0.12)',
    border: '1px solid rgba(59,130,246,0.3)',
    color: '#93c5fd',
    marginBottom: '1.25rem',
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#f1f5f9',
    marginBottom: '0.75rem',
  },
  titleAccent: { color: '#f1f5f9' },
  titleAI: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.05rem',
    marginBottom: '0.5rem',
  },
  error: {
    marginTop: '1.5rem',
    padding: '1rem 1.25rem',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
    color: '#fca5a5',
    fontSize: '0.9rem',
  },
  approvedBanner: {
    marginTop: '1.25rem',
    padding: '0.85rem 1.25rem',
    borderRadius: '10px',
    border: '1px solid rgba(34,197,94,0.25)',
    background: 'rgba(34,197,94,0.06)',
    color: '#4ade80',
    fontWeight: 600,
    fontSize: '0.9rem',
    textAlign: 'center' as const,
  },
}
