import { useState, useEffect } from 'react'
import { Navbar, Footer, Head, Ico, useReveal } from '../App.jsx'

/* ============================================================
   PulseFit — live gym-booking demo (React route at /demos/pulsefit)
   Styled to match the studio site. Backend config below is the
   ONLY thing you edit. The DeepSeek key lives in n8n, never here.
   ============================================================ */
const CFG = {
  N8N_WEBHOOK_URL: 'https://ediedi9733.app.n8n.cloud/webhook/gym-demo',
  REGISTER_URL: 'https://script.google.com/macros/s/AKfycbxmXbKKJ9HSJ61yuRc4BkdDatHcOoD5HxeyE9MdBdPcEmE1MypWI4U0D36_4cJ2-1VntQ/exec',
  DEMO_EMAIL: 'ediedi9733@gmail.com',
  TELEGRAM_BOT_URL: 'https://t.me/PulseFit_Demo_bot',
  SHEET_EMBED_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJQavVhCmBDcSpdtNi400un6nBeb45li3Tu6SZP8tieRE-CW2yQz_iS8m76ohJuS4cjPigfUAasv-g/pubhtml?gid=1055592511&single=true',
}

const REG_KEY = 'pulsefit_registered'
const SEED_MEMBERS = [
  { id: 'M001', label: 'M001 — Alice (5 sessions left)' },
  { id: 'M002', label: 'M002 — Ben (1 session left)' },
  { id: 'M003', label: 'M003 — Cara (0 sessions left)' },
]
const TRY = [
  ['ACCEPT', 'Book a 1-to-1 with Coach Mike on Wednesday at 10am. My member ID is M001.'],
  ['REJECT', 'Book a 1-to-1 with Coach Mike on Saturday at 6pm. My member ID is M001.'],
  ['NO SESSIONS', 'I’d like to book any coach tomorrow. My member ID is M003.'],
  ['PENDING', 'Book a 1-to-1 with Coach Sara on Thursday at 9am. My member ID is M001.'],
  ['INFO', 'How many private sessions do I have left? My member ID is M002.'],
]

function getRec() { try { return JSON.parse(localStorage.getItem(REG_KEY) || 'null') } catch { return null } }
function setRec(v) { try { v === null ? localStorage.removeItem(REG_KEY) : localStorage.setItem(REG_KEY, JSON.stringify(v)) } catch { /* storage blocked */ } }

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

export default function PulseFitDemo() {
  useReveal()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // --- web form state ---
  const [members, setMembers] = useState(SEED_MEMBERS)
  const [member, setMember] = useState('M001')
  const [msg, setMsg] = useState('Book a 1-to-1 with Coach Mike on Wednesday at 10am')
  const [reply, setReply] = useState(null) // { text, status, error }
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(-1)

  // --- registration state ---
  const [reg, setReg] = useState({ name: '', email: '', sessions: '5' })
  const [regStatus, setRegStatus] = useState('idle') // idle | sending | done | error
  const [regMsg, setRegMsg] = useState('')
  const [locked, setLocked] = useState(null)

  useEffect(() => {
    const rec = getRec()
    if (rec) {
      setLocked(rec)
      if (rec.member_id) {
        setMembers((m) => m.some((x) => x.id === rec.member_id) ? m : [...m, { id: rec.member_id, label: `${rec.member_id} — ${rec.name || 'you'} (${rec.sessions} session${rec.sessions == 1 ? '' : 's'} left)` }])
        setMember(rec.member_id)
      }
    }
  }, [])

  const copy = (text, i) => { try { navigator.clipboard?.writeText(text) } catch { /* */ } setCopied(i); setTimeout(() => setCopied(-1), 1200) }

  async function send() {
    const message = msg.trim()
    if (!message) { setReply({ text: 'Please type a message first.', error: true }); return }
    setSending(true); setReply({ text: 'The assistant is thinking…' })
    try {
      const res = await fetch(CFG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'form', member_id: member, message }),
      })
      const data = await res.json().catch(() => ({ reply: '(the workflow did not return JSON — check the Respond to Webhook node)' }))
      setReply({ text: data.reply || JSON.stringify(data, null, 2), status: (data.status || '').toLowerCase() })
    } catch {
      setReply({ text: 'Could not reach the assistant. If the workflow is active, set the n8n Webhook node’s "Allowed Origins (CORS)" to this site.', error: true })
    } finally { setSending(false) }
  }

  async function register() {
    const name = reg.name.trim()
    const email = reg.email.trim()
    const sessions = parseInt(reg.sessions, 10)
    if (!name) { setRegStatus('error'); setRegMsg('Please enter a name.'); return }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setRegStatus('error'); setRegMsg('Please enter a valid email address.'); return }
    if (getRec()) { setLocked(getRec()); return }
    setRegStatus('sending'); setRegMsg('Creating your member record…')
    try {
      const res = await fetch(CFG.REGISTER_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain avoids a CORS preflight to Apps Script
        body: JSON.stringify({ action: 'register', name, email, sessions }),
      })
      let data = null; try { data = await res.json() } catch { data = null }
      const rec = { member_id: data && data.ok ? data.member_id : null, name, sessions, email }
      setRec(rec); setLocked(rec); setRegStatus('done')
      if (rec.member_id) {
        setMembers((m) => m.some((x) => x.id === rec.member_id) ? m : [...m, { id: rec.member_id, label: `${rec.member_id} — ${name} (${sessions} session${sessions == 1 ? '' : 's'} left)` }])
        setMember(rec.member_id)
        setRegMsg(data.duplicate
          ? `That email is already registered as ${rec.member_id}. Using your existing member ID.`
          : `Done! You are member ${rec.member_id} with ${sessions} session${sessions == 1 ? '' : 's'}. Watch your row appear below.`)
      } else {
        setRegMsg('Registered! Your row should appear in the live sheet below in a moment.')
      }
    } catch (e) {
      setRegStatus('error'); setRegMsg('Could not reach the registration backend. Check REGISTER_URL. ' + (e?.message || ''))
    }
  }

  function resetReg() { setRec(null); setLocked(null); setRegStatus('idle'); setRegMsg('') }

  const inputCls = 'w-full bg-paper border border-line rounded-xl px-4 py-3 text-ink placeholder-muted/60 focus:outline-none focus:border-ink transition-colors'

  return (
    <div className="bg-paper">
      <Navbar />
      <main>
        {/* ---------- header ---------- */}
        <section className="relative pt-32 sm:pt-40 pb-16 px-6 sm:px-10 lg:px-16 grid-faint">
          <div className="max-w-7xl mx-auto">
            <a href="/#demos" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors mb-8">
              <span className="rotate-180"><Ico.arrow className="w-4 h-4" /></span> All demos
            </a>
            <p className="eyebrow reveal"><span className="opacity-60">Live demo</span> PulseFit</p>
            <h1 className="reveal font-display font-extrabold text-4xl sm:text-5xl md:text-6xl mt-4 leading-[1.04] tracking-tight text-ink text-balance">
              An AI front desk that <span className="text-accent-ink bg-accent px-2 rounded-lg">books sessions</span>
            </h1>
            <p className="reveal text-lg text-muted mt-5 max-w-2xl leading-relaxed">
              A gym booking assistant reachable three ways — web form, email, and Telegram. It checks each coach’s
              schedule and member credits, then <strong className="text-ink">accepts or rejects</strong> the booking. Every
              message lands in a live Google Sheet you can watch below.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 reveal">
              {['n8n', 'DeepSeek', 'Google Sheets', 'Telegram', 'accept / reject logic'].map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        </section>

        {/* ---------- register ---------- */}
        <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <Head index="01" kicker="Register & test" title="Create a test member" sub="Add yourself in one tap. Pick how many sessions to start with — choose 0 to watch a booking get rejected. Your record appears in the live sheet, and your member ID is added to the form. One registration per visitor." />
            <div className="card p-7 sm:p-8 mt-10 reveal">
              {locked ? (
                <div>
                  <p className="text-ink">
                    <span className="inline-flex items-center gap-2 mr-2 text-accent-ink bg-accent rounded-md px-2 py-0.5 font-mono text-sm">
                      <Ico.check className="w-4 h-4" /> {locked.member_id || 'registered'}
                    </span>
                    {locked.member_id
                      ? 'is now selected in the form below — ask the assistant to book a session with it.'
                      : 'Registered — scroll to the live sheet below to find your new row.'}
                  </p>
                  <button onClick={resetReg} className="mt-4 font-mono text-[12px] text-muted underline hover:text-ink">register a different test member</button>
                </div>
              ) : (
                <div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="eyebrow !text-[11px] mb-2 block">Your name</label>
                      <input className={inputCls} placeholder="e.g. Jordan" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="eyebrow !text-[11px] mb-2 block">Your email</label>
                      <input className={inputCls} type="email" placeholder="you@example.com" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="eyebrow !text-[11px] mb-2 block">Starting sessions</label>
                      <select className={inputCls} value={reg.sessions} onChange={(e) => setReg({ ...reg, sessions: e.target.value })}>
                        <option value="0">0 — test a rejection</option>
                        <option value="1">1 session</option>
                        <option value="3">3 sessions</option>
                        <option value="5">5 sessions</option>
                        <option value="10">10 sessions</option>
                      </select>
                    </div>
                    <button onClick={register} disabled={regStatus === 'sending'} className="btn btn-accent w-full">
                      {regStatus === 'sending' ? 'Registering…' : <>Register me <Ico.arrow className="w-4 h-4" /></>}
                    </button>
                  </div>
                  {regMsg && <p className={`text-sm mt-4 ${regStatus === 'error' ? 'text-red-600' : 'text-muted'}`}>{regMsg}</p>}
                  <p className="font-mono text-[11px] text-muted/70 mt-3">Demo only — a sample name, email and session count. No password, no real data.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---------- channels ---------- */}
        <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16 bg-surface border-y border-line">
          <div className="max-w-7xl mx-auto">
            <Head index="02" kicker="Message the assistant" title="Three doors, one AI brain" sub="Pick whichever you like — the same logic runs behind all three." />
            <div className="grid lg:grid-cols-3 gap-6 mt-10">

              {/* web form */}
              <div className="card p-7 reveal flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-accent/15 grid place-items-center text-accent-ink"><Ico.flow className="w-5 h-5" /></span>
                  <div><h3 className="font-display font-bold text-ink">Web form</h3><p className="font-mono text-[11px] text-muted">instant · easiest</p></div>
                </div>
                <div className="mt-5">
                  <label className="eyebrow !text-[11px] mb-2 block">Member ID</label>
                  <select className={inputCls} value={member} onChange={(e) => setMember(e.target.value)}>
                    {members.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="mt-4">
                  <label className="eyebrow !text-[11px] mb-2 block">Your message</label>
                  <textarea className={`${inputCls} min-h-[88px] resize-y`} value={msg} onChange={(e) => setMsg(e.target.value)} />
                </div>
                <button onClick={send} disabled={sending} className="btn btn-ink w-full mt-4">
                  {sending ? 'Sending…' : <>Send to assistant <Ico.arrow className="w-4 h-4" /></>}
                </button>
                <div className={`mt-4 rounded-xl border p-4 text-sm whitespace-pre-wrap ${reply?.error ? 'border-red-300 bg-red-50 text-red-700' : reply?.status ? 'border-line bg-paper text-ink' : 'border-dashed border-line bg-paper text-muted'}`}>
                  {reply ? (
                    <>
                      {reply.status && <div className="mb-2"><StatusPill status={reply.status} /></div>}
                      {reply.text}
                    </>
                  ) : 'The assistant’s reply will appear here.'}
                </div>
              </div>

              {/* email */}
              <div className="card p-7 reveal flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-accent/15 grid place-items-center text-accent-ink"><Ico.mail className="w-5 h-5" /></span>
                  <div><h3 className="font-display font-bold text-ink">Email</h3><p className="font-mono text-[11px] text-muted">reply in your inbox</p></div>
                </div>
                <p className="text-muted text-[15px] mt-5 leading-relaxed flex-1">Email the gym’s address. The assistant reads it, checks the schedule, replies, and logs it. Put your member ID in the message.</p>
                <a className="btn btn-ghost w-full mt-5" href={`mailto:${CFG.DEMO_EMAIL}?subject=${encodeURIComponent('Booking request — PulseFit')}&body=${encodeURIComponent('Hi! My member ID is M001.\n\nI’d like to book a 1-to-1 with Coach Mike on Wednesday at 10am.\n\nThanks!')}`}>
                  Open email draft <Ico.mail className="w-4 h-4" />
                </a>
                <p className="font-mono text-[11px] text-muted/70 mt-3">Keep the subject line — the assistant uses it. Replies run on a schedule.</p>
              </div>

              {/* telegram */}
              <div className="card p-7 reveal flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-accent/15 grid place-items-center text-accent-ink"><Ico.bot className="w-5 h-5" /></span>
                  <div><h3 className="font-display font-bold text-ink">Telegram chat</h3><p className="font-mono text-[11px] text-muted">real back-and-forth</p></div>
                </div>
                <p className="text-muted text-[15px] mt-5 leading-relaxed flex-1">Chat with the bot like a person — it remembers the conversation. Tap below, press Start, and try booking a session.</p>
                <a className="btn btn-ink w-full mt-5" href={CFG.TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                  Open Telegram bot <Ico.arrowUR className="w-4 h-4" />
                </a>
                <p className="font-mono text-[11px] text-muted/70 mt-3">WhatsApp version on request — Telegram is used here for instant, no-setup testing.</p>
              </div>

            </div>

            {/* things to try */}
            <div className="card p-7 sm:p-8 mt-6 reveal">
              <h3 className="font-display font-bold text-lg text-ink">Things to try</h3>
              <p className="text-muted text-[15px] mt-1">Each one exercises a different outcome — copy it into the form.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                {TRY.map(([label, text], i) => (
                  <div key={i} className="flex items-start gap-3 bg-paper border border-line rounded-xl p-3.5">
                    <span className="mt-0.5"><StatusPill status={label.toLowerCase().includes('accept') ? 'accepted' : label.toLowerCase().includes('reject') || label.includes('NO') ? 'rejected' : label.toLowerCase().includes('pend') ? 'pending' : 'info'} /></span>
                    <p className="text-[13.5px] text-ink flex-1 leading-snug">{text}</p>
                    <button onClick={() => copy(text, i)} className="font-mono text-[10.5px] text-muted hover:text-ink border border-line rounded-md px-2 py-1 shrink-0">{copied === i ? 'copied' : 'copy'}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- live sheet ---------- */}
        <section className="py-14 sm:py-20 px-6 sm:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <Head index="03" kicker="The database, live" title="Watch it land in Google Sheets" sub="Every message and booking from every channel is written here in real time — the same sheet gym staff would use." />
            <div className="card overflow-hidden mt-10 reveal">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-line font-mono text-[12px] text-muted">
                <span className="w-2 h-2 rounded-full bg-accent pulse-dot" /> live · Bookings &amp; Messages · auto-updates
              </div>
              <iframe title="PulseFit live Google Sheet" src={CFG.SHEET_EMBED_URL} className="w-full bg-white block" style={{ height: 460, border: 0 }} />
            </div>
          </div>
        </section>

        {/* ---------- how it works (dark band) ---------- */}
        <section className="bg-dark text-white py-20 sm:py-28 px-6 sm:px-10 lg:px-16 rounded-t-[2.5rem] grid-faint-dark">
          <div className="max-w-7xl mx-auto">
            <Head index="04" kicker="Under the hood" title="How the pipeline runs" dark sub="No-code where it helps, code where it counts." />
            <div className="grid md:grid-cols-4 gap-4 mt-10">
              {[
                ['Channels in', 'Web form, email, and a Telegram bot all feed the same workflow.'],
                ['n8n brain', 'Reads the message, calls DeepSeek for intent, checks coach schedule + member credits.'],
                ['Decide', 'Accept, reject (with alternative slots), or mark pending for manual-approval coaches.'],
                ['Log + reply', 'Writes the result to Google Sheets and replies on the same channel.'],
              ].map(([t, d], i) => (
                <div key={i} className="card-dark p-6 reveal">
                  <span className="font-mono text-accent text-sm">0{i + 1}</span>
                  <h4 className="font-display font-bold text-white mt-2">{t}</h4>
                  <p className="text-white/55 text-sm mt-2 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-8 font-mono">Sample data only · no real members or coaches · reminders scheduled in trigger.dev</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
