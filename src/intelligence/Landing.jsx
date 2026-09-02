/* ============================================================
   "Intelligence Designed To Evolve" — single-viewport,
   video-background landing page. A standalone route, unrelated
   to the Ledger/Portfolio interfaces.
   ============================================================ */
import { useEffect, useRef, useState } from 'react'
import './landing.css'

const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4'
const LOGO_SRC = '/favicon.svg'

const NAV_LINKS = ['Home', 'Product', 'Case Studies', 'Contact']

const STATS = [
  { icon: '<', target: 120, decimals: 0, suffix: 'ms', label: 'Inference Time' },
  { icon: '%', target: 99.99, decimals: 2, suffix: '%', label: 'Platform Uptime' },
  { icon: '*', target: 24, decimals: 0, suffix: '/7', label: 'Autonomous Runtime' },
  { icon: '#', target: 2.4, decimals: 1, suffix: 'M', label: 'Context Windows' },
]

const FONT_LINKS = [
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' },
  { rel: 'stylesheet', href: 'https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos' },
  {
    rel: 'stylesheet',
    href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    integrity: 'sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==',
    crossOrigin: 'anonymous',
    referrerPolicy: 'no-referrer',
  },
]

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }

function fmtStat(value, decimals) {
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
}

/* Counts a stat up once, the first time its footer scrolls into view. */
function StatValue({ target, decimals, suffix, index }) {
  const [display, setDisplay] = useState(fmtStat(0, decimals))
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return
      done.current = true
      const duration = 1500 + index * 80
      const startDelay = 480 + index * 90
      const start = performance.now() + startDelay
      let raf
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / duration))
        if (now >= start) setDisplay(fmtStat(target * easeOutCubic(t), decimals))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, decimals, index])

  return <p ref={ref} className="stat-value">{display}{suffix}</p>
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Intelligence Designed To Evolve'
    const nodes = FONT_LINKS.map((attrs) => {
      const link = document.createElement('link')
      Object.entries(attrs).forEach(([k, v]) => { link[k] = v })
      document.head.appendChild(link)
      return link
    })
    return () => {
      document.title = prevTitle
      nodes.forEach((n) => n.remove())
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    const onResize = () => { if (window.innerWidth > 720) setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  return (
    <div className="intel">
      <div className="bg">
        <video className="bg-video" autoPlay muted loop playsInline>
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>

      <div className="page">
        <header className="header">
          <button type="button" className="logo-btn" aria-label="Home">
            <img src={LOGO_SRC} alt="" width="52" height="52" />
          </button>

          <nav className="nav-pill" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link} href="#" className={`nav-link${link === 'Home' ? ' active' : ''}`}
                 onClick={(e) => e.preventDefault()}>{link}</a>
            ))}
          </nav>

          <button type="button" className="sign-in">Sign in</button>

          <button type="button" className={`burger${menuOpen ? ' open' : ''}`}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}>
            <span className="bars">
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </span>
          </button>
        </header>

        <main className="hero">
          <div className="trust anim" style={{ '--d': '0.05s' }}>
            <span className="trust-avatar">
              <span className="trust-avatar-inner"><i className="fa-brands fa-microsoft" aria-hidden="true" /></span>
            </span>
            <span className="trust-avatar">
              <span className="trust-avatar-inner"><i className="fa-brands fa-amazon" aria-hidden="true" /></span>
            </span>
            <span className="trust-avatar">
              <span className="trust-avatar-inner"><i className="fa-brands fa-google" aria-hidden="true" /></span>
            </span>
            <span className="trust-pill">Trusted by 2000+ Enterprises</span>
          </div>

          <h1 className="headline">
            <span>Intelligence</span>
            <span>Designed To Evolve</span>
          </h1>

          <p className="subhead anim" style={{ '--d': '0.28s' }}>
            Build applications that reason, adapt and collaborate using a modular
            AI platform designed for production.
          </p>

          <button type="button" className="cta anim anim-pulse" style={{ '--d': '0.4s' }}>Get Started</button>
        </main>

        <footer className="stats">
          {STATS.map((s, i) => (
            <div key={s.label} className="stat anim" style={{ '--d': `${0.5 + i * 0.08}s` }}>
              <p className="stat-icon" aria-hidden="true">{s.icon}</p>
              <StatValue target={s.target} decimals={s.decimals} suffix={s.suffix} index={i} />
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </footer>
      </div>

      {menuOpen && (
        <>
          <div className="overlay" onClick={() => setMenuOpen(false)} />
          <div className="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
            {NAV_LINKS.map((link, i) => (
              <a key={link} href="#" className={`menu-link${link === 'Home' ? ' active' : ''}`}
                 style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                 onClick={(e) => { e.preventDefault(); setMenuOpen(false) }}>{link}</a>
            ))}
            <button type="button" className="menu-signin" onClick={() => setMenuOpen(false)}>Sign in</button>
          </div>
        </>
      )}
    </div>
  )
}
