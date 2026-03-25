import { useState, FormEvent } from 'react'

interface Props {
  onSearch: (ticker: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} style={styles.wrapper}>
      <div style={styles.inputWrap}>
        <span style={styles.icon}>🔍</span>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter ticker or company name — e.g. AAPL, Tesla, NVDA"
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={loading}
          autoFocus
        />
      </div>
      <button style={{ ...styles.button, opacity: loading || !value.trim() ? 0.5 : 1 }} type="submit" disabled={loading || !value.trim()}>
        {loading ? (
          <span style={styles.loadingInner}>
            <span style={styles.spinner} />
            Researching
          </span>
        ) : 'Research →'}
      </button>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '2rem',
  },
  inputWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    transition: 'border-color 0.2s',
  },
  icon: { fontSize: '1rem', opacity: 0.5 },
  input: {
    flex: 1,
    padding: '0.85rem 0',
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0 1.75rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontWeight: 700,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  loadingInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
}
