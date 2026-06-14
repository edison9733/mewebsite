import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Award,
  Clock,
  Menu,
  X,
  Upload,
  Code,
  Cpu,
  Globe,
  Database,
  Terminal,
  GitBranch,
  Hexagon,
  Blocks,
  Bot,
  Dumbbell,
  BookOpen,
  Lock,
  ExternalLink,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

function GithubIcon({ className, strokeWidth = 2 }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

const PROJECTS = [
  {
    icon: Globe,
    title: 'Superteam Malaysia',
    text: 'Official Superteam Malaysia website built with Next.js 14, Supabase CMS, and Solana design system.',
    tech: 'Next.js · Supabase · Solana',
    url: 'https://github.com/edison9733/superteam-malaysia',
  },
  {
    icon: Bot,
    title: 'Telegram Receipt Bot',
    text: 'Automated receipt processing bot for Telegram that parses and organizes financial documents.',
    tech: 'JavaScript · Telegram API · Node.js',
    url: 'https://github.com/edison9733/telegram_receipt_bot',
  },
  {
    icon: Blocks,
    title: 'Sol Bootcamp',
    text: 'Solana blockchain development projects covering smart contracts, tokens, and on-chain programs.',
    tech: 'TypeScript · Solana · Anchor',
    url: 'https://github.com/edison9733/sol_bootcamp',
  },
  {
    icon: BookOpen,
    title: 'CS50x 2025',
    text: 'Harvard CS50 coursework — problem sets spanning C, Python, SQL, HTML/CSS, and JavaScript.',
    tech: 'C · Python · SQL · HTML',
    url: 'https://github.com/edison9733/cs50x-2025',
  },
  {
    icon: Dumbbell,
    title: 'Gym App',
    text: 'Fitness tracking application for logging workouts, tracking progress, and planning routines.',
    tech: 'JavaScript · React · CSS',
    url: 'https://github.com/edison9733/gym',
  },
  {
    icon: Lock,
    title: 'Vault Vault',
    text: 'Security and DevOps tooling for managing secrets, credentials, and infrastructure configuration.',
    tech: 'Shell · Bash · DevOps',
    url: 'https://github.com/edison9733/vault-vault',
  },
]

/* ----------------------------------------------------------------
   Navbar
---------------------------------------------------------------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-primary/10'
            : 'bg-transparent'
        } rounded-full px-4 sm:px-6 py-2.5 w-[calc(100%-2rem)] max-w-5xl`}
      >
        <div className="flex items-center justify-between gap-6">
          <a href="#home" className="flex items-center gap-2 group">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <Hexagon className="h-5 w-5 text-white" strokeWidth={2.4} />
              <span className="absolute inset-0 rounded-full ring-2 ring-primary/30 group-hover:ring-primary/50 transition" />
            </span>
            <span
              className={`font-display font-bold tracking-tight text-lg ${
                scrolled ? 'text-ink' : 'text-white'
              } transition-colors`}
            >
              Edison Liu
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-tight lift-on-hover ${
                  scrolled ? 'text-ink/70 hover:text-primary' : 'text-white/90 hover:text-white'
                } transition-colors`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="hidden lg:inline-flex magnetic-btn items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/30"
          >
            Get in Touch
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </a>

          <button
            onClick={() => setOpen(true)}
            className={`lg:hidden p-2 rounded-full ${
              scrolled ? 'text-ink' : 'text-white'
            }`}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[60] transition-all duration-500 lg:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-deep/90 backdrop-blur-2xl"
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute top-0 left-0 right-0 bg-background rounded-b-5xl px-6 pt-8 pb-12 transition-transform duration-500 ${
            open ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between mb-10">
            <span className="font-display font-bold text-xl text-ink">Edison Liu</span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full bg-divider/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl font-semibold text-ink py-3 border-b border-divider"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-8 magnetic-btn flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-full font-semibold w-full"
          >
            Get in Touch
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  )
}

/* ----------------------------------------------------------------
   Hero
---------------------------------------------------------------- */
function Hero() {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-line-1', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      })
      gsap.from('.hero-line-2', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.5,
      })
      gsap.from('.hero-cta, .hero-meta', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.8,
        stagger: 0.12,
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-[100dvh] w-full overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=2400&q=80"
          alt="Code on screen"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-deep/85 via-deep/50 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/30 to-transparent" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-[18%] h-2 w-2 rounded-full bg-primary/60 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[55%] right-[10%] h-1.5 w-1.5 rounded-full bg-white/40 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] right-[26%] h-1 w-1 rounded-full bg-primary-light/70 animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[30%] right-[8%] h-1.5 w-1.5 rounded-full bg-accent/50 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[65%] right-[22%] h-1 w-1 rounded-full bg-white/30 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center text-center">
        <div className="px-6 sm:px-10 lg:px-16 max-w-4xl">
          <p className="hero-meta font-mono text-xs uppercase tracking-[0.25em] text-white/70 mb-6">
            Software Engineer · Full-Stack Developer
          </p>
          <h1 className="font-display font-extrabold text-white leading-[0.95] tracking-tight">
            <span className="hero-line-1 block text-4xl sm:text-5xl md:text-6xl">
              Building the future,
            </span>
            <span
              className="hero-line-2 block font-serif italic font-medium text-primary text-6xl sm:text-7xl md:text-8xl lg:text-9xl mt-2"
              style={{ lineHeight: '0.92' }}
            >
              one commit at a time.
            </span>
          </h1>

          <p className="hero-meta mx-auto max-w-xl text-white/75 text-base sm:text-lg mt-8 leading-relaxed">
            Full-stack developer crafting web apps, blockchain tools, and intelligent bots.
            <span className="text-white"> Clean code. Real impact.</span>
          </p>

          <div className="hero-cta mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#projects"
              className="magnetic-btn group inline-flex items-center justify-center gap-2 bg-primary text-deep font-semibold px-7 py-4 rounded-full shadow-2xl shadow-primary/40"
            >
              View Projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://github.com/edison9733"
              target="_blank"
              rel="noopener noreferrer"
              className="lift-on-hover inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 font-medium px-7 py-4 rounded-full"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 sm:right-12 hidden md:flex flex-col items-center gap-2 text-white/50">
          <span className="font-mono uppercase text-[10px] tracking-[0.3em]">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------
   Feature Card 1 — Tech Stack Shuffler
---------------------------------------------------------------- */
function TechShuffler() {
  const items = [
    { tag: 'Frontend', label: 'React · Next.js · Tailwind CSS', level: '90%' },
    { tag: 'Blockchain', label: 'Solana · Anchor · Web3.js', level: '75%' },
    { tag: 'Backend', label: 'Node.js · Python · Express', level: '85%' },
  ]
  const [stack, setStack] = useState(items)

  useEffect(() => {
    const interval = setInterval(() => {
      setStack((prev) => {
        const next = [...prev]
        next.unshift(next.pop())
        return next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-44 w-full">
      {stack.map((item, i) => {
        const offset = i
        const total = stack.length
        return (
          <div
            key={item.tag}
            style={{
              transform: `translate(${offset * 14}px, ${offset * 14}px) scale(${1 - offset * 0.05})`,
              zIndex: total - offset,
              opacity: 1 - offset * 0.25,
              transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease',
            }}
            className="absolute inset-0 bg-white border border-divider rounded-3xl p-5 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary-dark bg-primary/10 px-2 py-1 rounded-full">
                {item.tag}
              </span>
              <span className="font-mono text-xs text-muted">{item.level}</span>
            </div>
            <div className="mt-4 font-display text-lg font-semibold text-ink leading-tight">
              {item.label}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: 24 }).map((_, idx) => (
                <span
                  key={idx}
                  className="h-1 w-1 rounded-full"
                  style={{
                    background: idx < 24 - offset * 6 ? '#FF6B35' : '#E0E0E0',
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------------
   Feature Card 2 — Deploy Pipeline (Signature Animation)
---------------------------------------------------------------- */
function DeployPipeline() {
  const [statusIdx, setStatusIdx] = useState(0)
  const [count, setCount] = useState(42)

  const statuses = [
    { text: 'All systems nominal · monitoring', label: 'Stable', tone: 'emerald' },
    { text: 'New commit pushed · building', label: 'Deploy', tone: 'accent' },
    { text: 'Tests passing · 14 suites', label: 'Testing', tone: 'primary' },
    { text: 'Deployed to production', label: 'Shipped', tone: 'emerald' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((idx) => {
        const next = (idx + 1) % statuses.length
        if (statuses[next].label === 'Shipped') {
          setCount((c) => c + 1)
        }
        return next
      })
    }, 2300)
    return () => clearInterval(interval)
  }, [])

  const brackets = [
    { left: '12%', delay: '0.0s', dur: '2.6s', size: 14 },
    { left: '24%', delay: '1.3s', dur: '3.0s', size: 11 },
    { left: '36%', delay: '0.6s', dur: '2.8s', size: 16 },
    { left: '50%', delay: '1.8s', dur: '2.4s', size: 12 },
    { left: '64%', delay: '0.9s', dur: '3.1s', size: 15 },
    { left: '76%', delay: '2.0s', dur: '2.7s', size: 11 },
    { left: '88%', delay: '0.4s', dur: '2.9s', size: 14 },
  ]

  const ripples = [
    { left: '22%', delay: '0.2s' },
    { left: '50%', delay: '1.0s' },
    { left: '78%', delay: '1.8s' },
  ]

  const status = statuses[statusIdx]
  const toneText =
    status.tone === 'emerald' ? 'text-emerald-600' :
    status.tone === 'accent' ? 'text-accent-dark' :
    'text-primary-dark'
  const toneDot =
    status.tone === 'emerald' ? 'bg-emerald-500' :
    status.tone === 'accent' ? 'bg-accent' :
    'bg-primary'

  return (
    <div
      className="relative h-44 w-full rounded-3xl overflow-hidden border border-primary/15"
      style={{
        background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 70%, #0F3460 100%)',
      }}
    >
      <div className="absolute -top-8 -left-6 h-20 w-32 rounded-full bg-primary/20 blur-2xl" />
      <div className="absolute top-2 right-10 h-14 w-24 rounded-full bg-accent/15 blur-xl" />

      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            CI/CD Pipeline
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display font-bold text-sm text-white tabular-nums">
            {String(count).padStart(2, '0')}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">
            deploys
          </span>
        </div>
      </div>

      <svg
        className="absolute left-3 right-3 top-9 h-5"
        viewBox="0 0 400 20"
        preserveAspectRatio="none"
      >
        <rect x="0" y="6" width="400" height="8" rx="4" fill="#FF6B35" fillOpacity="0.2" />
        <rect x="0" y="7" width="400" height="2" fill="#FF6B35" fillOpacity="0.4" />
        <rect x="0" y="4" width="6" height="12" rx="1.5" fill="#FF6B35" fillOpacity="0.5" />
        <rect x="394" y="4" width="6" height="12" rx="1.5" fill="#FF6B35" fillOpacity="0.5" />
        {[60, 152, 248, 340].map((x) => (
          <g key={x}>
            <rect x={x - 3} y="2" width="6" height="6" rx="1" fill="#FF6B35" />
            <rect x={x - 4} y="13" width="8" height="3" rx="1" fill="#FF6B35" fillOpacity="0.7" />
          </g>
        ))}
      </svg>

      <div className="absolute inset-x-0 top-14 bottom-11 overflow-hidden">
        {brackets.map((d, i) => (
          <svg
            key={i}
            className="absolute top-0"
            style={{
              left: d.left,
              width: `${d.size}px`,
              height: `${Math.round(d.size * 1.4)}px`,
              animation: `rain-fall ${d.dur} cubic-bezier(0.55,0.05,0.7,0.45) ${d.delay} infinite`,
              filter: 'drop-shadow(0 1px 3px rgba(255,107,53,0.4))',
              transform: 'translateX(-50%)',
            }}
            viewBox="0 0 24 32"
          >
            <defs>
              <linearGradient id={`br-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF9966" />
                <stop offset="50%" stopColor="#FF6B35" />
                <stop offset="100%" stopColor="#E05A2B" />
              </linearGradient>
            </defs>
            <text
              x="12"
              y="22"
              textAnchor="middle"
              fill={`url(#br-${i})`}
              fontSize="18"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {i % 3 === 0 ? '</>' : i % 3 === 1 ? '{ }' : '[ ]'}
            </text>
          </svg>
        ))}
      </div>

      <svg
        className="absolute bottom-9 left-3 right-3 h-3"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
      >
        <path
          d="M 0,6 L 10,6 L 12,2 L 14,10 L 16,6 L 26,6 L 28,2 L 30,10 L 32,6 L 200,6"
          fill="none"
          stroke="#FF6B35"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
        <path
          d="M 0,8 L 200,8"
          fill="none"
          stroke="#FF6B35"
          strokeOpacity="0.15"
          strokeWidth="0.8"
        />
      </svg>

      <div className="absolute bottom-[34px] left-3 right-3 h-2">
        {ripples.map((r, i) => (
          <span
            key={i}
            className="absolute top-0 -translate-x-1/2 rounded-full border border-primary/40"
            style={{
              left: r.left,
              width: '4px',
              height: '4px',
              animation: `rain-ripple 2.4s ease-out ${r.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`relative h-2 w-2 rounded-full ${toneDot}`}>
            {status.tone === 'accent' && (
              <span className={`absolute inset-0 rounded-full ${toneDot} animate-ping`} />
            )}
          </span>
          <span
            key={status.text}
            className={`font-mono text-[10px] truncate ${toneText}`}
            style={{ animation: 'rain-fadein 0.35s ease-out' }}
          >
            {status.text}
          </span>
        </div>
        <span
          className={`font-mono text-[9px] uppercase tracking-[0.2em] whitespace-nowrap pl-2 ${toneText}`}
        >
          {status.label}
        </span>
      </div>

      <style>{`
        @keyframes rain-fall {
          0%   { transform: translate(-50%, -10px); opacity: 0; }
          12%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { transform: translate(-50%, 95px); opacity: 0; }
        }
        @keyframes rain-ripple {
          0%   { transform: translateX(-50%) scale(0.4); opacity: 0.9; }
          80%  { transform: translateX(-50%) scale(3.5); opacity: 0; }
          100% { transform: translateX(-50%) scale(3.5); opacity: 0; }
        }
        @keyframes rain-fadein {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ----------------------------------------------------------------
   Feature Card 3 — Commit Scheduler
---------------------------------------------------------------- */
function CommitScheduler() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const [step, setStep] = useState(0)
  const activeDay = 2

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 5)
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  const cursorPos = (() => {
    switch (step) {
      case 0: return { x: 8, y: 110, opacity: 0 }
      case 1: return { x: 60, y: 60, opacity: 1 }
      case 2: return { x: 60 + activeDay * 36, y: 60, opacity: 1 }
      case 3: return { x: 60 + activeDay * 36, y: 60, opacity: 1 }
      case 4: return { x: 130, y: 130, opacity: 1 }
      default: return { x: 8, y: 110, opacity: 0 }
    }
  })()

  return (
    <div className="relative h-44 w-full bg-white border border-divider rounded-3xl p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Week 24 · June
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-primary-dark bg-primary/10 px-2 py-0.5 rounded-full">
          Commit
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((d, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-center h-9 rounded-xl text-xs font-medium transition-all duration-300 ${
              step >= 3 && idx === activeDay
                ? 'bg-primary text-deep scale-110 shadow-lg shadow-primary/30'
                : 'bg-background text-ink'
            }`}
          >
            <span className="font-mono text-[9px] text-muted">{d}</span>
            <span className="font-display font-semibold text-sm">{idx + 9}</span>
          </div>
        ))}
      </div>

      <button
        className={`w-full py-2.5 rounded-2xl font-medium text-xs transition-all duration-300 ${
          step === 4
            ? 'bg-primary text-white scale-[1.02] shadow-md shadow-primary/30'
            : 'bg-divider/40 text-muted'
        }`}
      >
        {step >= 3 ? '✓ Pushed to main' : 'Select a day'}
      </button>

      <div
        className="absolute pointer-events-none transition-all duration-500 ease-out"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          opacity: cursorPos.opacity,
          transform: step === 3 ? 'scale(0.85)' : 'scale(1)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 3L19 12L12 13L9 20L5 3Z"
            fill="#1A1A1A"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------
   Features Section
---------------------------------------------------------------- */
function Features() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          once: true,
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
      })
      gsap.from('.feature-heading > *', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 95%',
          once: true,
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const cards = [
    {
      eyebrow: '01 / Stack',
      heading: 'Tech Arsenal',
      sub: 'Full-stack proficiency',
      text: 'From React frontends to Solana smart contracts — comfortable across the entire stack with modern tooling and best practices.',
      Component: TechShuffler,
    },
    {
      eyebrow: '02 / Ship',
      heading: 'CI/CD Pipeline',
      sub: 'Build · Test · Deploy',
      text: 'Clean commits, automated tests, continuous deployment. Every project follows engineering discipline from day one.',
      Component: DeployPipeline,
    },
    {
      eyebrow: '03 / Plan',
      heading: 'Project Cadence',
      sub: 'Consistent output',
      text: 'Regular commits, steady progress, and reliable delivery. Projects move forward every week with clear milestones.',
      Component: CommitScheduler,
    },
  ]

  return (
    <section id="about" ref={sectionRef} className="relative py-28 sm:py-40 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="feature-heading max-w-3xl mb-16 sm:mb-24">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary-dark">
            / What I bring
          </span>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-ink mt-4 leading-[1.05] tracking-tight">
            Three pillars.
            <span className="block font-serif italic font-medium text-primary-dark mt-1">
              One standard.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <article
              key={idx}
              className="feature-card group relative bg-surface border border-divider rounded-5xl p-7 hover:border-primary/40 transition-colors duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {card.eyebrow}
                </span>
                <ArrowUpRight
                  className="h-5 w-5 text-ink/30 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                  strokeWidth={1.8}
                />
              </div>

              <card.Component />

              <div className="mt-6">
                <h3 className="font-display font-bold text-2xl text-ink leading-tight">
                  {card.heading}
                </h3>
                <p className="font-serif italic text-primary-dark text-sm mt-1">
                  {card.sub}
                </p>
                <p className="text-muted text-[15px] mt-4 leading-relaxed">{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------
   CountUp
---------------------------------------------------------------- */
function CountUp({ target, duration = 1800 }) {
  const [count, setCount] = useState(0)
  const elemRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = elemRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true
            const startTime = performance.now()
            const animate = (now) => {
              const elapsed = now - startTime
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setCount(Math.floor(target * eased))
              if (progress < 1) {
                requestAnimationFrame(animate)
              } else {
                setCount(target)
              }
            }
            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.35 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={elemRef}>{count}</span>
}

/* ----------------------------------------------------------------
   Pillars
---------------------------------------------------------------- */
function Pillars() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const pillars = [
    {
      n: '01',
      title: 'Projects',
      target: 13,
      suffix: '+',
      label: 'repositories',
      desc: 'From blockchain dApps to full-stack web apps — each project solves a real problem with production-grade code.',
    },
    {
      n: '02',
      title: 'Languages',
      target: 7,
      suffix: '+',
      label: 'languages & frameworks',
      desc: 'Python, JavaScript, TypeScript, Rust, C, Solidity, Shell — the right tool for every job.',
    },
    {
      n: '03',
      title: 'Range',
      target: 100,
      suffix: '%',
      label: 'full-stack',
      desc: 'Frontend to backend, smart contracts to DevOps. End-to-end ownership of every layer in the stack.',
    },
  ]

  return (
    <section id="skills" ref={ref} className="relative py-28 sm:py-40 px-6 sm:px-10 lg:px-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[44rem] rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/8 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div
          className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 sm:mb-24 transition-all duration-1000 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="max-w-2xl">
            <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-primary-dark mb-5">
              / By the numbers
            </span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight">
              The metrics behind
              <span className="block font-serif italic font-medium text-primary-dark">the craft.</span>
            </h2>
          </div>
          <p className="text-muted text-lg leading-relaxed max-w-md lg:text-right">
            Numbers that reflect consistent output, diverse skills, and a commitment to building things that work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-divider rounded-5xl overflow-hidden border border-divider shadow-xl shadow-primary/5">
          {pillars.map((p, i) => (
            <article
              key={i}
              style={{ transitionDelay: visible ? `${i * 150}ms` : '0ms' }}
              className={`pillar-card relative bg-surface p-9 sm:p-12 group overflow-hidden transition-all duration-1000 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                  {p.n} / {p.title}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-150 transition-all duration-500" />
              </div>

              <div className="flex items-end gap-1 leading-none">
                <span className="font-display font-extrabold text-[6rem] sm:text-[8rem] md:text-[9rem] leading-[0.85] text-ink tabular-nums tracking-tight">
                  <CountUp target={p.target} duration={1800 + i * 200} />
                </span>
                <span className="font-serif italic font-medium text-4xl sm:text-5xl md:text-6xl text-primary-dark mb-3 sm:mb-4">
                  {p.suffix}
                </span>
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary-dark mt-5">
                {p.label}
              </p>

              <p className="text-muted text-[15px] mt-6 leading-relaxed max-w-xs">
                {p.desc}
              </p>

              <div className="absolute bottom-0 left-9 right-9 sm:left-12 sm:right-12 h-px bg-divider overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-transparent via-primary to-transparent"
                  style={{
                    animation: `pillar-sweep 4s ease-in-out ${i * 0.4}s infinite`,
                  }}
                />
              </div>

              <span className="absolute top-9 right-9 sm:top-12 sm:right-12 font-mono text-[9px] uppercase tracking-widest text-primary/30">
                {p.n}
              </span>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pillar-sweep {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  )
}

/* ----------------------------------------------------------------
   Protocol — Sticky Stacking Cards
---------------------------------------------------------------- */
function Protocol() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card')
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top top+=100',
            endTrigger: cards[cards.length - 1],
            end: 'top top+=120',
            scrub: 1,
          },
          scale: 0.92,
          filter: 'blur(6px) saturate(0.7)',
          opacity: 0.5,
          ease: 'none',
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const steps = [
    {
      num: '01',
      title: 'Learn & Research',
      tagline: 'Understand first.',
      text: 'Every project starts with deep research. I study the problem space, explore existing solutions, and identify the best tools before writing a single line of code.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      alt: 'Code research',
      meta: 'Step 1 / Learn',
    },
    {
      num: '02',
      title: 'Build & Iterate',
      tagline: 'Ship early, ship often.',
      text: 'I build incrementally with clean architecture, writing tests alongside features. Each commit moves the project forward with measurable progress.',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
      alt: 'Building code',
      meta: 'Step 2 / Build',
    },
    {
      num: '03',
      title: 'Deploy & Maintain',
      tagline: 'It never stops.',
      text: 'Deployment is the beginning, not the end. I set up CI/CD pipelines, monitor performance, and continuously improve based on real-world feedback.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      alt: 'Server deployment',
      meta: 'Step 3 / Ship',
    },
  ]

  return (
    <section ref={containerRef} className="relative px-4 sm:px-6 py-20">
      <div className="max-w-7xl mx-auto mb-16 px-2 sm:px-10">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary-dark">
          / How I work
        </span>
        <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-ink mt-4 leading-[1.05] tracking-tight max-w-3xl">
          Three phases.
          <span className="block font-serif italic font-medium text-primary-dark">
            No shortcuts.
          </span>
        </h2>
      </div>

      <div className="space-y-8">
        {steps.map((step, idx) => (
          <article
            key={idx}
            className="protocol-card sticky top-24 sm:top-28 mx-auto max-w-6xl bg-gradient-to-br from-surface to-background border border-divider rounded-6xl overflow-hidden shadow-2xl shadow-primary/5"
          >
            <div className="grid lg:grid-cols-5 gap-0 min-h-[60vh] lg:min-h-[70vh]">
              <div className="lg:col-span-3 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
                    {step.meta}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary-dark bg-primary/10 px-2.5 py-1 rounded-full">
                    Edison Protocol
                  </span>
                </div>

                <div className="my-12">
                  <span className="font-display font-extrabold text-[7rem] sm:text-[10rem] leading-none text-primary/15 -mb-4 block">
                    {step.num}
                  </span>
                  <h3 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.02] tracking-tight">
                    {step.title}
                  </h3>
                  <p className="font-serif italic text-primary-dark text-2xl sm:text-3xl mt-3">
                    {step.tagline}
                  </p>
                </div>

                <p className="text-muted text-base sm:text-lg leading-relaxed max-w-lg">
                  {step.text}
                </p>
              </div>

              <div className="lg:col-span-2 relative overflow-hidden min-h-[300px] lg:min-h-full bg-deep">
                <img
                  src={step.image}
                  alt={step.alt}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent to-deep/15" />
                <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full pl-3 pr-4 py-1.5 shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
                    Step {step.num}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-widest text-white/70">
                  {step.num} / Edison Liu
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------
   Projects Grid
---------------------------------------------------------------- */
function ProjectsGrid() {
  const ref = useRef(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.svc-tile', {
        scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.06,
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="projects" ref={ref} className="relative py-24 px-6 sm:px-10 lg:px-16 bg-deep text-white overflow-hidden rounded-t-6xl">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-14">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">/ Featured work</span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl mt-4 leading-[1.05] tracking-tight">
              Projects that
              <span className="block font-serif italic font-medium text-primary">
                ship.
              </span>
            </h2>
          </div>
          <p className="text-white/60 max-w-md text-base leading-relaxed">
            Open-source work spanning web development, blockchain, automation, and beyond.
          </p>
        </div>

        {/* ── Featured showcase: Telegram Receipt Bot ── */}
        <div className="mb-6 rounded-4xl overflow-hidden border border-primary/25 bg-gradient-to-br from-white/[0.06] via-primary/[0.04] to-white/[0.02] relative">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-2xl pointer-events-none" />
          <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-center">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Featured
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Live on Telegram</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary/20 border border-primary/35 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                  Telegram Receipt Bot
                </h3>
              </div>
              <p className="text-white/65 text-base leading-relaxed max-w-xl mb-5">
                Snap a photo of any receipt — the bot reads it instantly, files it as a personal LHDN tax relief or a Form B business expense, and tracks your running totals. No sign-up. No forms. Just send a photo.
              </p>
              <span className="font-mono text-[10px] text-primary/70 uppercase tracking-widest">
                JavaScript · Telegram API · Node.js · Supabase · Vercel
              </span>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-52 shrink-0">
              <a
                href="https://t.me/lhdn_receipt_tracker_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic-btn inline-flex items-center justify-center gap-2 bg-primary text-deep font-semibold px-6 py-3.5 rounded-full shadow-lg shadow-primary/30 text-sm whitespace-nowrap"
              >
                <Bot className="h-4 w-4" strokeWidth={2.2} />
                Try the bot on Telegram
              </a>
              <a
                href="https://github.com/edison9733/telegram_receipt_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="lift-on-hover inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 text-white/80 font-medium px-6 py-3.5 rounded-full text-sm whitespace-nowrap"
              >
                <GithubIcon className="h-4 w-4" />
                View source
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-4xl overflow-hidden">
          {PROJECTS.map((proj, i) => {
            const Icon = proj.icon
            return (
              <a
                key={i}
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="svc-tile group bg-deep p-7 sm:p-9 hover:bg-white/[0.02] transition-colors duration-500 relative block"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                    <Icon className="h-5 w-5 text-primary group-hover:text-deep" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl mb-2">{proj.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-4">{proj.text}</p>
                <span className="font-mono text-[10px] text-primary/70 uppercase tracking-widest">
                  {proj.tech}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------
   Trust Signals
---------------------------------------------------------------- */
function TrustSignals() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const badges = [
    {
      Icon: ShieldCheck,
      title: 'CS50x Certified',
      text: 'Completed Harvard\'s CS50 — a rigorous introduction to computer science covering algorithms, data structures, and software engineering.',
    },
    {
      Icon: Award,
      title: 'Superteam Contributor',
      text: 'Active contributor to the Solana ecosystem through Superteam Malaysia — building community-driven Web3 infrastructure.',
    },
    {
      Icon: Clock,
      title: 'Always Shipping',
      text: 'Consistent commit history across multiple repositories. Every week brings new code, new features, and new solutions.',
    },
  ]

  return (
    <section ref={ref} className="relative py-14 sm:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary-dark">
            / Credentials
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-ink mt-3 tracking-tight">
            More than a resume.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {badges.map(({ Icon, title, text }, i) => (
            <div
              key={i}
              style={{ transitionDelay: visible ? `${i * 120}ms` : '0ms' }}
              className={`bg-white border border-divider rounded-4xl p-6 hover:border-primary/40 transition-all duration-700 ease-out shadow-sm ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <Icon className="h-6 w-6 text-primary mb-3" strokeWidth={1.8} />
              <h3 className="font-display font-bold text-lg text-ink mb-1.5">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#contact"
            className="magnetic-btn inline-flex items-center gap-2 bg-primary text-deep font-semibold px-7 py-3.5 rounded-full shadow-xl shadow-primary/30"
          >
            Get in Touch
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------------
   Contact Form
---------------------------------------------------------------- */
function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    setTimeout(() => setStatus('sent'), 1200)
  }

  return (
    <section id="contact" className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary-dark">
              / Contact
            </span>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-ink mt-4 leading-[1.05] tracking-tight">
              Let's build
              <span className="block font-serif italic font-medium text-primary-dark">
                something great.
              </span>
            </h2>
            <p className="text-muted text-lg mt-6 leading-relaxed max-w-md">
              Whether you have a project in mind, a job opportunity, or just want to chat about tech — I'd love to hear from you.
            </p>

            <div className="mt-10 space-y-4">
              <a
                href="mailto:ediedi9733@gmail.com"
                className="lift-on-hover flex items-center gap-4 group"
              >
                <span className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary transition">
                  <Mail className="h-5 w-5 text-primary group-hover:text-white" />
                </span>
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">
                    Email me
                  </span>
                  <span className="font-display font-semibold text-ink text-lg">
                    ediedi9733@gmail.com
                  </span>
                </span>
              </a>

              <a
                href="https://github.com/edison9733"
                target="_blank"
                rel="noopener noreferrer"
                className="lift-on-hover flex items-center gap-4 group"
              >
                <span className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary transition">
                  <GithubIcon className="h-5 w-5 text-primary group-hover:text-white" />
                </span>
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">
                    GitHub
                  </span>
                  <span className="font-display font-semibold text-ink text-lg">
                    edison9733
                  </span>
                </span>
              </a>

              <div className="flex items-center gap-4">
                <span className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </span>
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">
                    Based in
                  </span>
                  <span className="font-display font-semibold text-ink text-lg">
                    Malaysia
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-surface border border-divider rounded-5xl p-7 sm:p-10 shadow-xl shadow-primary/5"
            >
              {status !== 'sent' ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field
                      label="Name"
                      required
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                    />
                    <Field
                      label="Email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                    />
                  </div>

                  <div className="mt-5">
                    <Field
                      label="Subject"
                      value={form.subject}
                      onChange={(v) => setForm({ ...form, subject: v })}
                    />
                  </div>

                  <div className="mt-5">
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2 block">
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={5}
                      placeholder="Tell me about your project or idea..."
                      className="w-full bg-background border border-divider rounded-2xl px-4 py-3.5 text-ink placeholder-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition resize-none font-body"
                    />
                  </div>

                  <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs text-muted">
                      Fields marked with * are required.
                    </p>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="magnetic-btn inline-flex items-center gap-2 bg-primary text-deep font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-primary/30 disabled:opacity-50"
                    >
                      {status === 'sending' ? 'Sending...' : 'Send Message'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-8 w-8 text-primary-dark" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-ink mb-3">
                    Thanks for reaching out
                  </h3>
                  <p className="text-muted max-w-md mx-auto">
                    I'll get back to you as soon as possible. Looking forward to connecting.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({ label, type = 'text', required, value, onChange }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2 block">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-divider rounded-2xl px-4 py-3.5 text-ink placeholder-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition font-body"
      />
    </div>
  )
}

/* ----------------------------------------------------------------
   Footer
---------------------------------------------------------------- */
function Footer() {
  return (
    <footer className="relative bg-deep text-white rounded-t-6xl mt-12 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[40rem] rounded-full bg-primary/20 blur-3xl" />

      <div className="relative px-6 sm:px-10 lg:px-16 pt-20 pb-10 max-w-7xl mx-auto">
        <div className="border-b border-white/10 pb-12 mb-12">
          <h2 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl leading-[0.92] tracking-tight">
            Let's build
            <span className="font-serif italic font-medium text-primary block">
              the future.
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-8 gap-6">
            <p className="text-white/50 max-w-md">
              Edison Liu — Software engineer, full-stack developer, and blockchain enthusiast.
            </p>
            <a
              href="#contact"
              className="magnetic-btn inline-flex items-center gap-2 bg-primary text-deep font-semibold px-7 py-3.5 rounded-full self-start sm:self-auto"
            >
              Get in Touch
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <Hexagon className="h-5 w-5 text-deep" strokeWidth={2.4} />
              </span>
              <span className="font-display font-bold text-lg">Edison Liu</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Full-stack software engineer with a passion for building tools that solve real problems — from web apps to blockchain infrastructure.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                Available for work
              </span>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-4">
              Projects
            </p>
            <ul className="space-y-2.5">
              {PROJECTS.slice(0, 4).map((p, i) => (
                <li key={i}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/65 hover:text-primary transition text-sm"
                  >
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-4">
              Navigate
            </p>
            <ul className="space-y-2.5">
              <li><a href="#home" className="text-white/65 hover:text-primary transition text-sm">Home</a></li>
              <li><a href="#projects" className="text-white/65 hover:text-primary transition text-sm">Projects</a></li>
              <li><a href="#about" className="text-white/65 hover:text-primary transition text-sm">About</a></li>
              <li><a href="#contact" className="text-white/65 hover:text-primary transition text-sm">Contact</a></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary mb-4">
              Connect
            </p>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:ediedi9733@gmail.com" className="text-white/65 hover:text-primary transition text-sm">
                  ediedi9733@gmail.com
                </a>
              </li>
              <li>
                <a href="https://github.com/edison9733" target="_blank" rel="noopener noreferrer" className="text-white/65 hover:text-primary transition text-sm">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
              Open to Opportunities
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/50 text-xs font-mono">
            <span>&copy; 2026 Edison Liu</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ----------------------------------------------------------------
   App
---------------------------------------------------------------- */
export default function App() {
  useEffect(() => {
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 200)
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="relative">
      <div className="noise-overlay" />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pillars />
        <Protocol />
        <ProjectsGrid />
        <TrustSignals />
        <ContactForm />
      </main>
      <Footer />
    </div>
  )
}
