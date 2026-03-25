import { useState, useRef, useEffect, type FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  ticker: string
  company: string
  brief: string
  rawData: Record<string, unknown>
}

export default function ChatPanel({ ticker, company, brief, rawData }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          company,
          brief,
          raw_data: rawData,
          messages: updated,
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>✦</span>
        <span style={styles.headerLabel}>Ask a follow-up question</span>
        <span style={styles.headerSub}>FinSight AI has full context of this research</span>
      </div>

      {messages.length === 0 && (
        <div style={styles.suggestions}>
          {SUGGESTIONS.map(s => (
            <button key={s} style={styles.suggestion} onClick={() => setInput(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.msg, ...(msg.role === 'user' ? styles.userMsg : styles.aiMsg) }}>
              <span style={styles.roleLabel}>{msg.role === 'user' ? 'You' : 'FinSight AI'}</span>
              <div style={styles.msgContent}>
                {msg.role === 'assistant'
                  ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                  : msg.content
                }
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.msg, ...styles.aiMsg }}>
              <span style={styles.roleLabel}>FinSight AI</span>
              <div style={styles.typing}>
                <span style={styles.dot} />
                <span style={styles.dot} />
                <span style={styles.dot} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={send} style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask anything about ${ticker}…`}
          disabled={loading}
        />
        <button style={{ ...styles.sendBtn, opacity: input.trim() && !loading ? 1 : 0.4 }} type="submit" disabled={!input.trim() || loading}>
          ↑
        </button>
      </form>
    </div>
  )
}

const SUGGESTIONS = [
  'What are the biggest risks?',
  'How does valuation compare to peers?',
  'What could drive the stock higher?',
  'Explain the P/E ratio in simple terms',
]

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '1.25rem',
    borderRadius: '14px',
    border: '1px solid rgba(139,92,246,0.2)',
    background: 'rgba(139,92,246,0.03)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(139,92,246,0.1)',
  },
  headerIcon: { color: '#a78bfa', fontSize: '0.9rem' },
  headerLabel: {
    fontWeight: 700,
    fontSize: '0.82rem',
    color: '#a78bfa',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  headerSub: { fontSize: '0.78rem', color: '#475569', marginLeft: '0.25rem' },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  suggestion: {
    padding: '0.4rem 0.9rem',
    borderRadius: '999px',
    border: '1px solid rgba(139,92,246,0.25)',
    background: 'rgba(139,92,246,0.07)',
    color: '#c4b5fd',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  messages: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    maxHeight: '420px',
    overflowY: 'auto' as const,
  },
  msg: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  userMsg: { alignItems: 'flex-end' },
  aiMsg: { alignItems: 'flex-start' },
  roleLabel: {
    fontSize: '0.7rem',
    color: '#475569',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  msgContent: {
    maxWidth: '85%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    background: 'rgba(255,255,255,0.05)',
    color: '#cbd5e1',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  typing: {
    display: 'flex',
    gap: '4px',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#64748b',
    animation: 'pulse 1.2s infinite',
  },
  inputRow: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: 700,
    flexShrink: 0,
  },
}
