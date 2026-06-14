import { useState, useEffect } from 'react'

/* ============================================================
   edison9733 — solo AI automation studio
   Tryolabs-inspired structure & tone, original code.
   Stack: React + Vite + Tailwind. No icon/animation deps.
   ============================================================ */

const EMAIL = 'ediedi9733@gmail.com'
const GITHUB = 'https://github.com/edison9733'
const BOT_LINK = 'https://t.me/lhdn_receipt_tracker_bot'
const BOT_REPO = 'https://github.com/edison9733/telegram_receipt_bot'

/* ---------------- Inline icons (currentColor) ---------------- */
const Ico = {
  arrow: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  arrowUR: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>),
  github: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg>),
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
}

/* ---------------- Scroll reveal ---------------- */
function useReveal() {
  useEffect(() => {
    document.documentElement.classList.add('reveal-ready')
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ---------------- Data ---------------- */
const SERVICES = [
  { icon: Ico.bot, title: 'AI Agents & Assistants', text: 'Tool-calling agents that take real actions — not just chat. Function calling, multi-step reasoning, and MCP tools wired into your systems.', tags: ['Function calling', 'MCP', 'OpenAI'] },
  { icon: Ico.flow, title: 'Web & Data Automation', text: 'Scrape, log in, extract, and pipe results straight into an LLM. The manual web work you keep redoing — handed to a script.', tags: ['Selenium', 'Requests', 'Parsel'] },
  { icon: Ico.brain, title: 'RAG & Knowledge Systems', text: 'Chat over your own docs and data with grounded, cited answers. Embeddings, vector search, and retrieval that stays honest.', tags: ['Embeddings', 'Vector DB', 'LlamaIndex'] },
  { icon: Ico.plug, title: 'LLM Pipelines & Integrations', text: 'Wire models into your tools and APIs as serverless endpoints and webhooks — production-shaped, not notebook demos.', tags: ['FastAPI', 'Vercel', 'Webhooks'] },
  { icon: Ico.eye, title: 'Computer-Vision Automation', text: 'Turn video and images into metrics: detect, track, and count automatically. From a manual tally to a live number.', tags: ['YOLO', 'Norfair', 'OpenCV'] },
  { icon: Ico.shield, title: 'LLMOps & Guardrails', text: 'Make agents safe and observable — input/output validation, tracing, and evals so you can trust what ships.', tags: ['Guardrails', 'Langfuse', 'Evals'] },
]

const WORK = [
  { tag: 'Build in progress', title: 'Scrape → Summarize automation', text: 'A session-aware scraper that logs in, pulls data from JS-heavy pages, and pipes it to an LLM for clean structured output. Built on the Requests + Selenium pattern.', stack: ['Python', 'Selenium', 'LLM'], refLabel: 'Reference: tryolabs/requestium', refUrl: 'https://github.com/tryolabs/requestium' },
  { tag: 'Planned', title: 'Multi-tool agent + MCP', text: 'A FastAPI agent orchestrating MCP servers — one doing RAG over private docs, one calling a public API — with model-agnostic routing and request tracing.', stack: ['FastAPI', 'LlamaIndex', 'MCP'], refLabel: 'Reference: tryolabs/unicef-agent', refUrl: 'https://github.com/tryolabs/unicef-agent' },
  { tag: 'Planned', title: 'Topic guardrail validator', text: 'A reusable validator that keeps an LLM on-topic with a zero-shot classifier and an LLM fallback — publishable to the Guardrails Hub.', stack: ['Python', 'Guardrails', 'Transformers'], refLabel: 'Reference: tryolabs/restricttotopic', refUrl: 'https://github.com/tryolabs/restricttotopic' },
]

const APPROACH = [
  { n: '01', title: 'Scope', text: 'Find the single highest-leverage process worth automating — the one that quietly eats hours every week.' },
  { n: '02', title: 'Prototype', text: 'A working demo in days, not months. You see the automation run on real inputs before we commit to building it out.' },
  { n: '03', title: 'Ship with guardrails', text: 'Deploy with input/output validation, tracing, and human approval gates before anything touches a live system.' },
  { n: '04', title: 'Iterate', text: 'Measure the impact, harden the edges, and hand it off documented — so it keeps working without me in the loop.' },
]

const TECH = ['OpenAI', 'Anthropic', 'LangChain', 'LlamaIndex', 'MCP', 'RAG', 'FastAPI', 'Supabase', 'Vercel', 'Python', 'TypeScript', 'Selenium']

/* ---------------- Navbar ---------------- */
const NAV_LINKS = [['Services', '#services'], ['Work', '#work'], ['Approach', '#approach'], ['About', '#about']]

function Wordmark({ dark = false }) {
  return (
    <a href="#home" className="inline-flex items-center gap-2 group">
      <span className={`font-display font-extrabold text-[19px] tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>edison9733</span>
      <span className="w-2 h-2 rounded-full bg-accent group-hover:scale-125 transition-transform" />
    </a>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
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
          <span className="hidden md:inline eyebrow !text-[11px] border-l border-line pl-3 ml-1">AI Automation Studio</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-[15px] text-muted hover:text-ink transition-colors">{label}</a>
          ))}
          <a href="#contact" className="btn btn-ink btn-sm">Start a project</a>
        </nav>
        <button className="md:hidden text-ink p-2 -mr-2" aria-label="Menu" onClick={() => setOpen(v => !v)}>
          {open ? <Ico.close className="w-6 h-6" /> : <Ico.menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-paper border-t border-line px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="text-base text-ink">{label}</a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="btn btn-ink mt-1">Start a project</a>
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
          <span className="w-2 h-2 rounded-full bg-accent pulse-dot inline-block" /> AI Automation Studio · Available for work
        </p>
        <h1 className="reveal font-display font-extrabold text-ink mt-6 leading-[0.98] tracking-tight text-balance text-[2.6rem] sm:text-6xl md:text-7xl max-w-5xl">
          I build AI automation that does the work —{' '}
          <span className="relative inline-block">
            <span className="absolute inset-x-0 bottom-1 h-3 sm:h-4 bg-accent/60" aria-hidden="true" />
            <span className="relative">so you don't have to</span>
          </span>.
        </h1>
        <p className="reveal text-muted text-lg sm:text-xl mt-7 max-w-2xl leading-relaxed">
          <span className="font-semibold text-ink">edison9733</span> is a solo AI-automation studio run by Edison Liu. I design and ship
          LLM agents, web &amp; data automations, and RAG systems that cut manual work and move real
          metrics — built end to end, from the hardware up.
        </p>
        <div className="reveal flex flex-wrap items-center gap-3 mt-9">
          <a href="#work" className="btn btn-ink">See the work <Ico.arrow className="w-4 h-4" /></a>
          <a href="#contact" className="btn btn-ghost">Start a project</a>
        </div>
        <dl className="reveal grid grid-cols-2 sm:grid-cols-3 gap-px mt-14 border border-line rounded-2xl overflow-hidden bg-line max-w-3xl">
          {[['Focus', 'AI agents · Automation · RAG'], ['Stack', 'Python · TS · React · MCP'], ['Status', 'Open to projects']].map(([k, v]) => (
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
function Head({ index, kicker, title, sub, dark = false }) {
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
        <Head index="01" kicker="Services" title="What I build" sub="Six ways I turn repetitive, manual work into systems that run themselves." />
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
        <Head index="02" kicker="Selected work" title="Things I've shipped — and what's next" sub="One live product, plus the automations I'm building from proven open-source patterns." dark />

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
              A zero-setup Telegram bot that turns a photo of any receipt into filed, categorised tax data.
              Snap a receipt and an AI vision model reads the shop, date, and amount, then files it as a Malaysian
              LHDN personal relief or a Form B business expense — tracking totals so filing is effortless. Private
              per user, serverless, with a free-tier scan cap to keep costs in check.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {['Telegram Bot API', 'Node.js', 'Vercel', 'Supabase', 'Groq Llama 4 Vision'].map((t) => <span key={t} className="tag tag-dark">{t}</span>)}
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-7">
              <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">Try the bot <Ico.arrowUR className="w-4 h-4" /></a>
              <a href={BOT_REPO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-accent transition-colors">
                <Ico.github className="w-4 h-4" /> Source
              </a>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[['22', 'LHDN relief types'], ['0', 'Setup steps'], ['1', 'Photo to filed']].map(([n, l]) => (
              <div key={l} className="bg-dark-soft px-3 py-6 text-center">
                <div className="font-display font-extrabold text-2xl sm:text-3xl text-accent">{n}</div>
                <div className="text-white/55 text-[11px] mt-1 leading-tight">{l}</div>
              </div>
            ))}
          </div>
        </article>

        {/* Build pipeline */}
        <div className="grid md:grid-cols-3 gap-5 mt-5">
          {WORK.map((w) => (
            <article key={w.title} className="reveal card-dark p-7 flex flex-col">
              <span className="tag tag-accent self-start">{w.tag}</span>
              <h3 className="font-display font-bold text-xl mt-4">{w.title}</h3>
              <p className="text-white/60 text-[15px] mt-3 leading-relaxed flex-grow">{w.text}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {w.stack.map((t) => <span key={t} className="tag tag-dark">{t}</span>)}
              </div>
              <a href={w.refUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] text-white/55 hover:text-accent transition-colors mt-5">
                <Ico.github className="w-4 h-4" /> {w.refLabel}
              </a>
            </article>
          ))}
        </div>

        <p className="reveal text-white/45 text-sm mt-10">
          More on GitHub — <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">github.com/edison9733</a>
        </p>
      </div>
    </section>
  )
}

/* ---------------- Approach ---------------- */
function Approach() {
  return (
    <section id="approach" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <Head index="03" kicker="Approach" title="How I work" sub="Small, fast, and accountable. From first call to a system you can hand off." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {APPROACH.map((step) => (
            <div key={step.n} className="reveal border-t-2 border-ink pt-5">
              <span className="font-mono text-accent-ink bg-accent/20 px-2 py-0.5 rounded text-sm">{step.n}</span>
              <h3 className="font-display font-bold text-xl text-ink mt-4">{step.title}</h3>
              <p className="text-muted text-[15px] mt-3 leading-relaxed">{step.text}</p>
            </div>
          ))}
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
          <Head index="04" kicker="About" title="One engineer, built from the hardware up" />
          <div className="reveal text-muted text-lg leading-relaxed mt-6 space-y-5 max-w-2xl">
            <p>
              I'm <span className="text-ink font-semibold">Edison Liu</span>, an Electronic &amp; Computer Engineering
              student at the ZJU-UIUC Institute — a joint programme between Zhejiang University and the University of
              Illinois Urbana-Champaign.
            </p>
            <p>
              My background is unusual for someone shipping AI: I came up through hardware. I've built a motorised car
              from a bare breadboard, designed a working vending machine out of nothing but NAND gates, and led a summer
              research team on ultracold atomic physics. So when I build software, I understand what's happening all the
              way down.
            </p>
            <p>
              edison9733 runs AI-native. My build environment is Claude Code with MCP connectors, version-controlled to
              GitHub, with human approval gates before anything touches a live system — letting me design, generate, and
              review code end to end while owning the requirements, integration, and verification myself.
            </p>
          </div>
          <div className="reveal inline-flex items-center gap-2 mt-8 text-sm font-medium text-ink">
            <span className="w-2.5 h-2.5 rounded-full bg-accent pulse-dot" /> Available for freelance &amp; project work
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
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Project enquiry from ${f.name || 'website'}`)
    const body = encodeURIComponent(`${f.message}\n\n— ${f.name}\n${f.email}`)
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
  }
  return (
    <section id="contact" className="py-24 sm:py-32 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-start">
        <div>
          <Head index="05" kicker="Contact" title="Have a process worth automating?" sub="Tell me the task you keep doing by hand. I'll tell you honestly whether AI can take it off your plate — and how I'd build it." />
          <ul className="reveal mt-8 space-y-px border border-line rounded-2xl overflow-hidden bg-line">
            <li className="bg-surface px-5 py-4 flex items-center gap-3">
              <Ico.mail className="w-5 h-5 text-muted" />
              <a href={`mailto:${EMAIL}`} className="text-ink hover:text-accent-ink transition-colors">{EMAIL}</a>
            </li>
            <li className="bg-surface px-5 py-4 flex items-center gap-3">
              <Ico.github className="w-5 h-5 text-muted" />
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-accent-ink transition-colors">github.com/edison9733</a>
            </li>
          </ul>
        </div>
        <form onSubmit={submit} className="reveal card p-7 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" value={f.name} onChange={set('name')} />
            <Field label="Email" type="email" value={f.email} onChange={set('email')} />
          </div>
          <Field label="What do you want to automate?" textarea value={f.message} onChange={set('message')} />
          <button type="submit" className="btn btn-ink w-full">Send message <Ico.arrow className="w-4 h-4" /></button>
          <p className="text-xs text-muted text-center">Opens your email app, pre-filled. No backend, no tracking.</p>
        </form>
      </div>
    </section>
  )
}

/* ---------------- Footer ---------------- */
function Footer() {
  return (
    <footer className="bg-dark text-white pt-20 pb-10 px-6 sm:px-10 lg:px-16 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 items-end pb-14 border-b border-white/10">
          <h2 className="font-display font-extrabold text-5xl sm:text-7xl leading-[0.92] tracking-tight">
            Let's build<br />something that runs<span className="text-accent">.</span>
          </h2>
          <div className="lg:text-right">
            <a href="#contact" className="btn btn-accent">Start a project <Ico.arrow className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-12">
          <div>
            <Wordmark dark />
            <p className="text-white/45 text-sm mt-4 max-w-xs leading-relaxed">A solo AI-automation studio. Agents, automations, and RAG systems — designed, built, and shipped.</p>
          </div>
          <div>
            <h3 className="eyebrow eyebrow-dark !text-[11px]">Studio</h3>
            <ul className="mt-4 space-y-2">
              {NAV_LINKS.map(([l, h]) => (
                <li key={h}><a href={h} className="text-white/60 hover:text-accent text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow eyebrow-dark !text-[11px]">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li><a href={`mailto:${EMAIL}`} className="text-white/60 hover:text-accent text-sm transition-colors">{EMAIL}</a></li>
              <li><a href={GITHUB} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent text-sm transition-colors">GitHub</a></li>
              <li><a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent text-sm transition-colors">LHDN Receipt Bot</a></li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow eyebrow-dark !text-[11px]">Status</h3>
            <p className="inline-flex items-center gap-2 mt-4 text-white/70 text-sm">
              <span className="w-2 h-2 rounded-full bg-accent pulse-dot" /> Available for work
            </p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-white/40 text-xs">
          <span>© {new Date().getFullYear()} edison9733 · AI Automation Studio</span>
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
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
