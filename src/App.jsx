import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Demos } from './demos'
// About photo — real headshot. (The alpaca lives on as the browser-tab favicon.)
import profilePic from './assets/profile-edison.jpg'

/* ============================================================
   edison9733 — personal site
   Stack: React + Vite + Tailwind. No icon/animation deps.
   ============================================================ */

const EMAIL = 'ediedi9733@gmail.com'
const BOT_LINK = 'https://t.me/lhdn_receipt_tracker_bot'

/* ---------------- Inline icons (currentColor) ---------------- */
export const Ico = {
  arrow: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  arrowUR: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>),
  mail: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>),
  menu: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>),
  close: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>),
  bot: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="13" r="1.2"/><circle cx="15" cy="13" r="1.2"/><path d="M2 13v2M22 13v2"/></svg>),
  flow: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M9 6h6a3 3 0 0 1 3 3v6"/></svg>),
  brain: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5a3 3 0 0 0-5.9.7A3 3 0 0 0 4 11a3 3 0 0 0 2 4 3 3 0 0 0 6 .5V5Z"/><path d="M12 5a3 3 0 0 1 5.9.7A3 3 0 0 1 20 11a3 3 0 0 1-2 4 3 3 0 0 1-6 .5"/></svg>),
  plug: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v6"/></svg>),
  eye: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>),
  shield: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg>),
  workflow: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="5" cy="6" r="2.2"/><circle cx="5" cy="18" r="2.2"/><circle cx="19" cy="12" r="2.2"/><path d="M7.2 6h4.3a3 3 0 0 1 3 3v.6M7.2 18h4.3a3 3 0 0 0 3-3v-.6"/></svg>),
  layers: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>),
}

/* ---------------- Scroll reveal ---------------- */
export function useReveal() {
  useEffect(() => {
    document.documentElement.classList.add('reveal-ready')
    const els = Array.from(document.querySelectorAll('.reveal'))
    // Stagger: each .reveal gets a small delay based on its order among
    // .reveal siblings sharing a parent (capped so it never drags). Single
    // elements get 0ms; grids and the hero cascade in cleanly.
    const seen = new Map()
    els.forEach((el) => {
      const parent = el.parentElement
      const i = seen.get(parent) || 0
      seen.set(parent, i + 1)
      el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 70}ms`)
    })
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ---------------- Data ---------------- */
const SERVICES = [
  { icon: Ico.bot, title: 'AI Agents & Assistants', text: 'Tool-calling agents that take real actions — not just chat. Function calling, multi-step reasoning, and MCP tools wired into your systems.', tags: ['Function calling', 'MCP', 'Telegram', 'Webhooks'] },
  { icon: Ico.flow, title: 'Web Scraping & Data Automation', text: 'Log in, scrape JS-heavy pages, extract the fields that matter, and pipe results straight into your workflow. Built to keep running, not just run once.', tags: ['Python', 'Selenium', 'Parsing', 'Serverless'] },
  { icon: Ico.brain, title: 'RAG & Knowledge Systems', text: 'Chat over your own documents with grounded, cited answers. Embeddings, vector search, and retrieval you can trace back to the source.', tags: ['Embeddings', 'Vector DB', 'LlamaIndex', 'RAG'] },
  { icon: Ico.workflow, title: 'AI Workflow Automation', text: 'Chain models, APIs, and triggers into automations that fire on a schedule or an event — so the work happens with no one watching the dashboard.', tags: ['n8n', 'trigger.dev', 'Webhooks', 'Cron'] },
  { icon: Ico.plug, title: 'LLM Pipelines & Integrations', text: 'Wire vision and language models into your tools as serverless endpoints and webhooks — production-shaped, not notebook demos.', tags: ['FastAPI', 'Vercel', 'Groq', 'Supabase'] },
  { icon: Ico.layers, title: 'End-to-End AI Systems', text: 'The whole stack as one system — ingestion, model, storage, and interface — taken from raw input to a deployed product you can actually use.', tags: ['Vision', 'Supabase', 'Vercel', 'APIs'] },
]

const SKILL_GROUPS = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'C / C++', 'SQL'] },
  { label: 'AI & LLMs', items: ['LLM agents & function calling', 'RAG & embeddings', 'Vision models (Llama 4 Vision)', 'Prompt & eval design', 'MCP tooling'] },
  { label: 'Backend & Infra', items: ['Node.js', 'FastAPI', 'Serverless (Vercel)', 'Supabase / Postgres', 'REST & webhooks'] },
  { label: 'Automation & Workflow', items: ['n8n', 'trigger.dev', 'Webhooks & cron', 'Event-driven pipelines', 'Telegram Bot API'] },
]

const APPROACH = [
  { n: '01', title: 'Make the requirements less dumb', text: 'Every requirement is a hypothesis, not a law — even the ones from smart people. I question each one and tie it to a name that can defend it.' },
  { n: '02', title: 'Delete the part or step', text: "Cut parts, steps, and code aggressively. If I'm not adding about 10% back later, I didn't cut hard enough." },
  { n: '03', title: 'Simplify what survives', text: "Only now do I optimise — and only what's left. Polishing something that should have been deleted is wasted work in disguise." },
  { n: '04', title: 'Accelerate the cycle', text: 'Shorten the loop from change to result. Never before the steps above — speeding up a broken process just produces errors faster.' },
  { n: '05', title: 'Automate — last', text: 'Hand it to scripts and schedules only once it is simple and fast. Automating a mess just gives you an automated mess.' },
]

const TECH = ['n8n', 'trigger.dev', 'OpenAI', 'Anthropic', 'Groq', 'LangChain', 'LlamaIndex', 'MCP', 'RAG', 'FastAPI', 'Supabase', 'Vercel', 'Python', 'TypeScript', 'Selenium']

const EDGE = [
  { icon: Ico.shield, title: 'Self-monitoring workflows', text: "Every step checks its own output. On failure it retries with a fallback, and when something genuinely can't be resolved it logs the exact error and pings a human — instead of writing garbage downstream and carrying on as if nothing broke." },
  { icon: Ico.brain, title: 'Agents that remember', text: "Every run is written to a log the agent reads back, so the system isn't stateless. It builds up context on how you work — and the more you use it, the sharper it gets at turning a loose request into exactly what you meant." },
]

/* ---------------- Navbar ---------------- */
const NAV_LINKS = [['What I build', '#services'], ['Work', '#work'], ['Approach', '#approach'], ['Edge', '#edge'], ['About', '#about'], ['Demos', '#demos']]

function Wordmark({ dark = false }) {
  return (
    <a href="/portfolio" className="inline-flex items-center gap-2 group">
      <span className={`font-display font-extrabold text-[19px] tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>edison9733</span>
      <span className="w-2 h-2 rounded-full bg-accent group-hover:scale-125 transition-transform" />
    </a>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { pathname } = useLocation()
  const base = pathname === '/portfolio' ? '' : '/portfolio'
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll(); window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${solid ? 'bg-paper/85 backdrop-blur-md border-line' : 'bg-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="hidden md:inline eyebrow !text-[11px] border-l border-line pl-3 ml-1">AI & Automation Engineer</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={base + href} className="text-[15px] text-muted hover:text-ink transition-colors">{label}</a>
          ))}
          <a href={base + "#contact"} className="btn btn-ink btn-sm">Get in touch</a>
        </nav>
        <button className="md:hidden text-ink p-2 -mr-2" aria-label="Menu" onClick={() => setOpen(v => !v)}>
          {open ? <Ico.close className="w-6 h-6" /> : <Ico.menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-paper border-t border-line px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={base + href} onClick={() => setOpen(false)} className="text-base text-ink">{label}</a>
          ))}
          <a href={base + "#contact"} onClick={() => setOpen(false)} className="btn btn-ink mt-1">Get in touch</a>
        </div>
      )}
    </header>
  )
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section id="home" className="relative pt-36 sm:pt-44 pb-20 sm:pb-28 px-6 sm:px-10 lg:px-16 grid-faint">
      <div className="max-w-7xl mx-auto">
        <p className="eyebrow reveal">
          <span className="w-2 h-2 rounded-full bg-accent pulse-dot inline-block" /> ZJU-UIUC · Electronic & Computer Engineering
        </p>
        <h1 className="reveal font-display font-extrabold text-ink mt-6 leading-[0.98] tracking-tight text-balance text-[2.6rem] sm:text-6xl md:text-7xl max-w-5xl">
          I build AI automation that ships to production —{' '}
          <span className="relative inline-block">
            <span className="absolute inset-x-0 bottom-1 h-3 sm:h-4 bg-accent/60" aria-hidden="true" />
            <span className="relative">and keeps running</span>
          </span>.
        </h1>
        <p className="reveal text-muted text-lg sm:text-xl mt-7 max-w-2xl leading-relaxed">
          I'm <span className="font-semibold text-ink">Edison Liu</span> — an electronic &amp; computer engineering student
          who ships AI systems end to end. I build LLM agents, vision pipelines, and web automations that run on serverless
          infrastructure — and because I came up through hardware, I understand the stack all the way down to the logic gates.
        </p>
        <div className="reveal flex flex-wrap items-center gap-3 mt-9">
          <a href="#work" className="btn btn-ink">See the work <Ico.arrow className="w-4 h-4" /></a>
          <a href="#contact" className="btn btn-ghost">Get in touch</a>
        </div>
        <dl className="reveal grid grid-cols-2 sm:grid-cols-3 gap-px mt-14 border border-line rounded-2xl overflow-hidden bg-line max-w-3xl">
          {[['Focus', 'AI agents · Automation · RAG'], ['Stack', 'Python · TS · React · MCP'], ['Status', 'Open to internships & roles']].map(([k, v]) => (
            <div key={k} className="bg-surface px-5 py-4">
              <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">{k}</dt>
              <dd className="text-ink text-sm font-medium mt-1">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------------- Tech marquee ---------------- */
function TechStrip() {
  const row = [...TECH, ...TECH]
  return (
    <section className="py-8 border-y border-line bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <p className="eyebrow mb-5">Working across the modern AI stack</p>
      </div>
      <div className="marquee-mask" aria-hidden="true">
        <div className="flex gap-10 w-max animate-marquee whitespace-nowrap">
          {row.map((t, i) => (
            <span key={i} className="font-display font-semibold text-xl text-ink/35">{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Section header ---------------- */
export function Head({ index, kicker, title, sub, dark = false }) {
  return (
    <div className="max-w-3xl">
      <p className={`eyebrow reveal ${dark ? 'eyebrow-dark' : ''}`}><span className="opacity-60">{index}</span> {kicker}</p>
      <h2 className={`reveal font-display font-extrabold text-4xl sm:text-5xl md:text-6xl mt-4 leading-[1.04] tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>{title}</h2>
      {sub && <p className={`reveal text-lg mt-5 leading-relaxed ${dark ? 'text-white/60' : 'text-muted'}`}>{sub}</p>}
    </div>
  )
}

/* ---------------- Services ---------------- */
function Services() {
  return (
    <section id="services" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <Head index="01" kicker="Capabilities" title="What I build" sub="The kinds of AI systems I build — from a single tool-calling agent to a full pipeline that runs itself." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
          {SERVICES.map((s) => {
            const Icon = s.icon
            return (
              <article key={s.title} className="reveal card p-7 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent-ink flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-ink mt-5">{s.title}</h3>
                <p className="text-muted text-[15px] mt-3 leading-relaxed flex-grow">{s.text}</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {s.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Work / case studies (dark) ---------------- */
function Work() {
  return (
    <section id="work" className="bg-dark text-white py-24 sm:py-32 px-6 sm:px-10 lg:px-16 rounded-t-[2.5rem] grid-faint-dark">
      <div className="max-w-7xl mx-auto">
        <Head index="02" kicker="Selected work" title="Things I've shipped" sub="One live product, built and deployed end to end — plus the stack I build on." dark />

        {/* Featured — the live bot */}
        <article className="reveal card-dark mt-14 p-7 sm:p-10 grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 tag tag-dark">
                <span className="w-2 h-2 rounded-full bg-accent pulse-dot" /> Live · Telegram
              </span>
              <span className="tag tag-dark">Flagship</span>
            </div>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight">LHDN Receipt Tracker</h3>
            <p className="text-white/65 mt-4 leading-relaxed max-w-xl">
              A zero-setup Telegram bot that turns your receipts into filed Malaysian LHDN tax reliefs — the
              deductions most people forget to claim. Snap a photo and Groq's Llama 4 Scout vision model reads the
              shop, date, amount, and currency in a single call, then a structured prompt files it under one of 22
              LHDN relief types or a Form B business expense. Reliefs come off your chargeable income, not your
              refund — claim a full year of them and a higher-rate filer can owe up to roughly RM5,000 less tax
              (≈ US$1,200). Every user gets a private, row-isolated Supabase store, and the whole thing went from
              idea to live in a single day.
            </p>
            {/* Architecture pipeline */}
            <div className="mt-5 border border-white/10 rounded-xl p-4 bg-white/[0.03]">
              <p className="text-white/40 text-[11px] font-mono uppercase tracking-wide mb-2">Pipeline</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                {[['📷 Photo', false], ['→', true], ['Vercel webhook', false], ['→', true], ['Groq Vision OCR', false], ['→', true], ['LHDN mapper', false], ['→', true], ['Supabase', false]].map(([s, isArrow], i) => (
                  <span key={i} className={isArrow ? 'text-accent/50' : 'text-white/75 font-medium'}>{s}</span>
                ))}
              </div>
              <p className="text-white/40 text-[12px] mt-2.5 leading-relaxed">
                Serverless + Groq free tier keeps cost near-zero. Hardest problem: reliable extraction across mixed-language receipts — faded ink, varied date formats, Malay/Chinese shop names — solved with a structured prompt and graceful fallback categories.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {['Telegram Bot API', 'Node.js', 'Vercel', 'Supabase', 'Groq Llama 4 Vision'].map((t) => <span key={t} className="tag tag-dark">{t}</span>)}
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-7">
              <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">Try the bot <Ico.arrowUR className="w-4 h-4" /></a>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[['1 day', 'Idea to live'], ['0', 'Steps to set up'], ['0', 'Sign-up needed']].map(([n, l]) => (
              <div key={l} className="bg-dark-soft px-3 py-6 text-center">
                <div className="font-display font-extrabold text-2xl sm:text-3xl text-accent">{n}</div>
                <div className="text-white/55 text-[11px] mt-1 leading-tight">{l}</div>
              </div>
            ))}
          </div>
        </article>

        {/* Skills / tech stack showcase */}
        <div className="reveal mt-12">
          <p className="eyebrow eyebrow-dark">The toolkit behind it</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {SKILL_GROUPS.map((g) => (
              <div key={g.label} className="card-dark p-6">
                <h3 className="font-display font-bold text-base text-white">{g.label}</h3>
                <ul className="mt-4 space-y-2">
                  {g.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-white/65 text-[14px] leading-snug">
                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Approach ---------------- */
function Approach() {
  return (
    <section id="approach" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <Head index="03" kicker="Approach" title="How I work" sub="I run every build through Elon Musk's five-step engineering algorithm — in this exact order. As he puts it: the most common error of a smart engineer is to optimise a thing that should not exist." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-14">
          {APPROACH.map((step) => (
            <div key={step.n} className="reveal border-t-2 border-ink pt-5">
              <span className="font-mono text-accent-ink bg-accent/20 px-2 py-0.5 rounded text-sm">{step.n}</span>
              <h3 className="font-display font-bold text-lg text-ink mt-4 leading-snug">{step.title}</h3>
              <p className="text-muted text-[14px] mt-3 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Edge / differentiator (dark) ---------------- */
function Edge() {
  return (
    <section id="edge" className="bg-dark text-white py-24 sm:py-32 px-6 sm:px-10 lg:px-16 rounded-t-[2.5rem] grid-faint-dark">
      <div className="max-w-7xl mx-auto">
        <Head index="04" kicker="The difference" title="What sets my builds apart" sub="Anyone can wire an API to a model. The difference shows up on run #500, at 3am, when the input is malformed — does the automation fail silently, or catch itself?" dark />
        <div className="grid md:grid-cols-2 gap-5 mt-14">
          {EDGE.map((e) => {
            const Icon = e.icon
            return (
              <article key={e.title} className="reveal card-dark p-7 sm:p-8 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl mt-5">{e.title}</h3>
                <p className="text-white/65 text-[15px] mt-3 leading-relaxed">{e.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------- About ---------------- */
function About() {
  return (
    <section id="about" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-surface border-y border-line">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-14 items-start">
        <div>
          <img
            src={profilePic}
            alt="Edison Liu"
            className="reveal w-24 h-24 rounded-full object-cover mb-6 border-2 border-line shadow-sm"
          />
          <Head index="05" kicker="About" title="One engineer, built from the hardware up" />
          <div className="reveal text-muted text-lg leading-relaxed mt-6 space-y-5 max-w-2xl">
            <p>
              I'm <span className="text-ink font-semibold">Edison Liu</span>, an Electronic &amp; Computer Engineering
              student at the ZJU-UIUC Institute — a joint programme between Zhejiang University and the University of
              Illinois Urbana-Champaign.
            </p>
            <p>
              I learned computing from the bottom up — starting at the logic level and LC-3 assembly, then working up
              through C, C++, and how a system actually runs end to end. I built a motorised car from a bare breadboard
              and a working vending machine from nothing but NAND gates, so I understand the stack all the way down to
              the gates.
            </p>
            <p>
              What I optimise for is waste — the energy a system burns, the attention it steals, and the money it quietly
              costs. The best automation removes work rather than just speeding it up; I would sooner delete a step than
              automate a bad one.
            </p>
          </div>
          <div className="reveal inline-flex items-center gap-2 mt-8 text-sm font-medium text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-accent pulse-dot" /> Open to internships &amp; full-time roles
          </div>
        </div>
        <div className="space-y-4">
          <div className="reveal card p-6">
            <h3 className="eyebrow !text-[11px]">Education</h3>
            <div className="mt-4 space-y-4">
              <div className="pb-4 border-b border-line">
                <p className="font-semibold text-ink">ZJU-UIUC Institute</p>
                <p className="text-sm text-muted">B.Eng. Electronic &amp; Computer Engineering</p>
                <p className="font-mono text-xs text-muted mt-1">2025 – Present</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Cambridge International A-Levels</p>
                <p className="text-sm text-muted">Further Maths, Maths, Physics, Chemistry — A in all four</p>
                <p className="font-mono text-xs text-muted mt-1">2022 – 2024</p>
              </div>
            </div>
          </div>
          <div className="reveal card p-6">
            <h3 className="eyebrow !text-[11px]">Certifications</h3>
            <div className="mt-4 space-y-4">
              <div className="pb-4 border-b border-line">
                <p className="font-semibold text-ink">CS50x — Harvard</p>
                <p className="text-sm text-muted">Computer Science foundation</p>
              </div>
              <div>
                <p className="font-semibold text-ink">Machine Learning Specialization</p>
                <p className="text-sm text-muted">Stanford Online / Coursera (Andrew Ng)</p>
              </div>
            </div>
          </div>
          <div className="reveal card p-6">
            <h3 className="eyebrow !text-[11px]">Foundations</h3>
            <div className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
              <p><span className="text-ink font-medium">Learned computing from the metal up</span> — LC-3 assembly → C → C++ (OOP).</p>
              <ul className="space-y-2">
                <li>Built a motorised car from a bare breadboard.</li>
                <li>Designed a working vending machine from only NAND gates.</li>
                <li>Led a summer research team in ultracold atomic physics.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Contact ---------------- */
function Field({ label, type = 'text', value, onChange, textarea }) {
  const cls = "w-full bg-paper border border-line rounded-xl px-4 py-3 text-ink placeholder-muted/60 focus:outline-none focus:border-ink transition-colors"
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</span>
      {textarea
        ? <textarea rows={5} value={value} onChange={onChange} className={`${cls} mt-2 resize-none`} />
        : <input type={type} value={value} onChange={onChange} className={`${cls} mt-2`} />}
    </label>
  )
}

function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '', company: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name, email: f.email, message: f.message, company: f.company }),
      })
      const data = await res.json()
      if (data.ok) setStatus('sent')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-start">
        <div>
          <Head index="07" kicker="Contact" title="Want to build something together?" sub="Whether it's a role, a project, or a technical question — reach out. I respond to everything." />
          <ul className="reveal mt-8 space-y-px border border-line rounded-2xl overflow-hidden bg-line">
            <li className="bg-surface px-5 py-4 flex items-center gap-3">
              <Ico.mail className="w-5 h-5 text-muted" />
              <a href={`mailto:${EMAIL}`} className="text-ink hover:text-accent-ink transition-colors">{EMAIL}</a>
            </li>
          </ul>
        </div>

        {status === 'sent' ? (
          <div className="reveal card p-7 sm:p-8 flex flex-col items-center text-center gap-5">
            <div className="w-14 h-14 rounded-full bg-accent/15 text-accent-ink flex items-center justify-center">
              <Ico.check className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-ink">Message sent!</h3>
              <p className="text-muted text-[15px] mt-2">I'll get back to you as soon as I can.</p>
            </div>
            <button
              onClick={() => { setStatus('idle'); setF({ name: '', email: '', message: '', company: '' }) }}
              className="btn btn-ghost btn-sm"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="reveal card p-7 sm:p-8 space-y-5">
            {/* honeypot — hidden from real users, trips up bots */}
            <input
              type="text"
              name="company"
              tabIndex="-1"
              autoComplete="off"
              value={f.company}
              onChange={set('company')}
              aria-hidden="true"
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }}
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Name" value={f.name} onChange={set('name')} />
              <Field label="Email" type="email" value={f.email} onChange={set('email')} />
            </div>
            <Field label="What's on your mind?" textarea value={f.message} onChange={set('message')} />
            {status === 'error' && (
              <p className="text-red-600 text-sm">
                Something went wrong.{' '}
                <a href={`mailto:${EMAIL}`} className="underline hover:text-red-800">Email me directly</a> instead.
              </p>
            )}
            <button type="submit" disabled={status === 'sending'} className="btn btn-ink w-full">
              {status === 'sending' ? 'Sending…' : <><span>Send message</span><Ico.arrow className="w-4 h-4" /></>}
            </button>
            <p className="text-xs text-muted text-center">Goes straight to my private inbox. No third-party form service.</p>
          </form>
        )}
      </div>
    </section>
  )
}

/* ---------------- Footer ---------------- */
export function Footer() {
  const { pathname } = useLocation()
  const base = pathname === '/portfolio' ? '' : '/portfolio'
  return (
    <footer className="bg-dark text-white pt-20 pb-10 px-6 sm:px-10 lg:px-16 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-end pb-14 border-b border-white/10">
          <div>
            <h2 className="font-display font-extrabold text-5xl sm:text-7xl leading-[0.92] tracking-tight">
              Let's build<br />something that runs<span className="text-accent">.</span>
            </h2>
            <p className="text-white/55 text-base sm:text-lg mt-5 max-w-md leading-relaxed">From zero to a shipped product — automating the work that eats your week.</p>
          </div>
          <div className="lg:text-right">
            <a href={base + "#contact"} className="btn btn-accent">Get in touch <Ico.arrow className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-12">
          <div>
            <Wordmark dark />
            <p className="text-white/45 text-sm mt-4 max-w-xs leading-relaxed">ECE student at ZJU-UIUC — shipping AI agents, pipelines, and automations end to end, from logic gates up.</p>
          </div>
          <div>
            <h3 className="eyebrow eyebrow-dark !text-[11px]">Navigate</h3>
            <ul className="mt-4 space-y-2">
              {NAV_LINKS.map(([l, h]) => (
                <li key={h}><a href={base + h} className="text-white/60 hover:text-accent text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow eyebrow-dark !text-[11px]">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li><a href={`mailto:${EMAIL}`} className="text-white/60 hover:text-accent text-sm transition-colors">{EMAIL}</a></li>
              <li><a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent text-sm transition-colors">LHDN Receipt Bot</a></li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow eyebrow-dark !text-[11px]">Status</h3>
            <p className="inline-flex items-center gap-2 mt-4 text-white/70 text-sm">
              <span className="w-2 h-2 rounded-full bg-accent pulse-dot" /> Open to roles
            </p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-white/40 text-xs">
          <span>© {new Date().getFullYear()} edison9733</span>
          <span>Built with React · Hosted on edison9733.xyz</span>
        </div>
      </div>
    </footer>
  )
}

/* ---------------- App ---------------- */
export default function App() {
  useReveal()
  return (
    <div className="bg-paper">
      <Navbar />
      <main>
        <Hero />
        <TechStrip />
        <Services />
        <Work />
        <Approach />
        <Edge />
        <About />
        <Demos Head={Head} />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
