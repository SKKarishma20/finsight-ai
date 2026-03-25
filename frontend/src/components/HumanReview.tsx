import { useState } from 'react'

interface Props {
  onApprove: () => void
  onRegenerate: (feedback: string) => void
  loading: boolean
}

export default function HumanReview({ onApprove, onRegenerate, loading }: Props) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')

  const handleRegenerate = () => {
    if (feedback.trim()) {
      onRegenerate(feedback.trim())
      setFeedback('')
      setShowFeedback(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.icon}>👤</span>
        <span style={styles.label}>Human Review</span>
        <span style={styles.sublabel}>Does this brief look accurate?</span>
      </div>

      {!showFeedback ? (
        <div style={styles.buttons}>
          <button style={styles.approveBtn} onClick={onApprove} disabled={loading}>
            ✓ Approve
          </button>
          <button style={styles.feedbackBtn} onClick={() => setShowFeedback(true)} disabled={loading}>
            ↺ Regenerate with feedback
          </button>
        </div>
      ) : (
        <div style={styles.feedbackArea}>
          <textarea
            style={styles.textarea}
            placeholder="What should be improved? e.g. 'Focus more on downside risks' or 'The sentiment section seems outdated'"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={3}
            autoFocus
          />
          <div style={styles.feedbackButtons}>
            <button style={styles.cancelBtn} onClick={() => setShowFeedback(false)}>
              Cancel
            </button>
            <button
              style={{ ...styles.submitBtn, opacity: feedback.trim() ? 1 : 0.4 }}
              onClick={handleRegenerate}
              disabled={!feedback.trim() || loading}
            >
              {loading ? 'Regenerating…' : '↺ Regenerate'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '1.25rem',
    padding: '1.25rem 1.5rem',
    borderRadius: '14px',
    border: '1px solid rgba(251,191,36,0.2)',
    background: 'rgba(251,191,36,0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  icon: { fontSize: '1rem' },
  label: {
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#fbbf24',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  },
  sublabel: {
    fontSize: '0.82rem',
    color: '#64748b',
    marginLeft: '0.25rem',
  },
  buttons: {
    display: 'flex',
    gap: '0.75rem',
  },
  approveBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    border: '1px solid rgba(34,197,94,0.3)',
    background: 'rgba(34,197,94,0.1)',
    color: '#4ade80',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  feedbackBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    border: '1px solid rgba(251,191,36,0.3)',
    background: 'rgba(251,191,36,0.08)',
    color: '#fbbf24',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  feedbackArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    resize: 'vertical' as const,
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.6,
  },
  feedbackButtons: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#64748b',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
}
