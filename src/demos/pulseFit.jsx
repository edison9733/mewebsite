import { useState } from 'react'
import { Link } from 'react-router-dom'

// Live PulseFit chat widget, embedded inline in the Demos section.
// The full standalone demo (registration + live sheet) lives at /demos/pulsefit.
const N8N_WEBHOOK_URL = 'https://ediedi9733.app.n8n.cloud/webhook/gym-demo'

const MEMBERS = [
  { id: 'M001', label: 'M001 — Alice · 5 sessions left' },
  { id: 'M002', label: 'M002 — Ben · 1 session left' },
  { id: 'M003', label: 'M003 — Cara · 0 sessions left' },
]

const TRY = [
  ['Accept', 'Book a 1-to-1 with Coach Mike on Wednesday at 10am. My member ID is M001.'],
  ['Reject', 'Book a 1-to-1 with Coach Mike on Saturday at 6pm. My member ID is M001.'],
  ['No sessions', 'I would like to book any coach tomorrow. My member ID is M003.'],
  ['Info', 'How many private sessions do I have left? My member ID is M002.'],
]

export const meta = {
  id: 'pulsefit',
  title: 'PulseFit — AI gym-booking assistant',
  blurb: 'Chat with an AI front desk that books sessions, checks coach availability, and tracks member credits — live, powered by DeepSeek via an n8n workflow.',
  tags: ['n8n', 'DeepSeek', 'Google Sheets', 'Telegram'],
}

function StatusPill({ status }) {
  if (!status) return null
  const map = {
    accepted: 'bg-accent/15 text-accent-ink',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    info: 'bg-line text-muted',
  }
  return <span className={`font-mono text-[10.5px] tracking-wide px-2 py-0.5 rounded-md ${map[status] || map.info}`}>{status.toUpperCase()}</span>
}

export default function PulseFit() {
  const [member, setMember] = useState('M001')
  const [msg, setMsg] = useState('Book a 1-to-1 with Coach Mike on Wednesday at 10am. My member ID is M001.')
  const [reply, setReply] = useState(null)
  const [sending, setSending] = useState(false)

  async function send() {
    const message = msg.trim()
    if (!message) { setReply({ text: 'Type a message first.', error: true }); return }
    setSending(true); setReply({ text: 'The assistant is thinking…' })
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'form', member_id: member, message }),
      })
      const data = await res.json().catch(() => ({ reply: '(the workflow did not return JSON)' }))
      setReply({ text: data.reply || JSON.stringify(data, null, 2), status: (data.status || '').toLowerCase() })
    } catch {
      setReply({ text: 'Could not reach the assistant right now — open the full demo or check back shortly.', error: true })
    } finally { setSending(false) }
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-[210px_1fr] gap-3">
        <select
          value={member}
          onChange={e => setMember(e.target.value)}
          aria-label="Select a demo member"
          className="bg-paper border border-line rounded-xl px-3 py-3 text-ink text-sm focus:outline-none focus:border-ink transition-colors"
        >
          {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <textarea
          rows={2}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          aria-label="Message to the booking assistant"
          className="bg-paper border border-line rounded-xl px-4 py-3 text-ink text-sm resize-none focus:outline-none focus:border-ink transition-colors"
          placeholder="Ask the front desk to book a session…"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {TRY.map(([label, text]) => (
          <button
            key={label}
            onClick={() => setMsg(text)}
            className="text-[12px] px-2.5 py-1 rounded-md border border-line text-muted hover:border-ink hover:text-ink transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={send} disabled={sending} className="btn btn-ink btn-sm">
          {sending ? 'Sending…' : 'Send to assistant'}
        </button>
        <Link to="/demos/pulsefit" className="btn btn-accent btn-sm btn-glow">Open the full demo →</Link>
      </div>
      {reply && (
        <div className={`rounded-xl border p-4 text-sm leading-relaxed ${reply.error ? 'border-red-200 bg-red-50 text-red-700' : 'border-line bg-surface text-ink'}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted">Assistant</span>
            <StatusPill status={reply.status} />
          </div>
          <p className="whitespace-pre-wrap">{reply.text}</p>
        </div>
      )}
    </div>
  )
}
