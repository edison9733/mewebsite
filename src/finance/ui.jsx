/* ============================================================
   Small reusable pieces: logos, icons, the success animation,
   and the charts. Charts are hand-drawn SVG — no chart library.
   ============================================================ */
import { useEffect, useRef, useState, useId } from 'react'
import { I } from './icons'

/* ---------------- Wallet logo ----------------
   Tries /wallets/<logo>.svg and falls back to a coloured monogram, so a new
   SVG dropped into public/wallets/ needs no code change.

   Two traps here, both of which used to keep every tile on the monogram:
   • The <img> must never be display:none while it is loading. A hidden image
     has no layout box, so `loading="lazy"` never starts the fetch, so `load`
     never fires, so it never becomes visible. The image is therefore always
     laid out and only faded in with opacity, and it is not lazy.
   • naturalWidth is not a usable "did it work?" test for SVG. A file with a
     viewBox but no width/height attributes has no intrinsic size and reports
     0 even though it renders perfectly. img.decode() answers the real
     question, and unlike onLoad it also settles for already-cached images. */
export function WalletLogo({ wallet, size = 36, rounded = 12 }) {
  const [shown, setShown] = useState(false)
  const [failed, setFailed] = useState(false)
  const imgRef = useRef(null)
  const src = wallet?.logo ? `/wallets/${wallet.logo}.svg` : ''

  useEffect(() => {
    const el = imgRef.current
    if (!el || !src) return undefined
    let live = true
    const ok = () => { if (live) { setShown(true); setFailed(false) } }
    const bad = () => { if (live) { setShown(false); setFailed(true) } }
    if (typeof el.decode === 'function') el.decode().then(ok, bad)
    else if (el.complete) ok()
    return () => { live = false }
  }, [src])

  const label = wallet?.name || '?'
  const mono = label.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || '?'

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden shrink-0 font-display font-bold"
      style={{
        width: size, height: size, borderRadius: rounded,
        background: shown ? '#fff' : wallet.color,
        color: wallet.ink ? '#0E0F11' : '#fff',
        fontSize: size * 0.36, letterSpacing: '-0.02em',
        boxShadow: shown ? 'inset 0 0 0 1px rgba(0,0,0,0.06)' : 'none',
        transition: 'background-color 0.2s ease',
      }}
    >
      {!shown && <span aria-hidden="true" className="relative z-[1]">{mono}</span>}
      {src && !failed && (
        <img
          ref={imgRef}
          src={src}
          alt=""
          decoding="async"
          onLoad={() => setShown(true)}
          onError={() => { setShown(false); setFailed(true) }}
          className="absolute inset-0 w-full h-full object-contain p-1 transition-opacity duration-200"
          style={{ opacity: shown ? 1 : 0 }}
        />
      )}
    </span>
  )
}

/* ---------------- Success animation ----------------
   The supplied success_checkmark clip, rebuilt as vector. Every number here
   was measured off the clip's own frames (see the keyframes in index.css),
   so it is the same mark and the same timing — it just draws instead of
   decoding, which is what lets it look right on WebKit too. */
export function SuccessBurst({ show, label = 'Saved' }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center pointer-events-none" role="status" aria-live="polite">
      <div className="fin-burst-card flex flex-col items-center gap-3 px-8 py-7 rounded-3xl">
        <svg viewBox="0 0 150 150" className="w-20 h-20 fin-burst-mark" aria-hidden="true"
             fill="none" stroke="#369A5C" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
          <circle className="fin-burst-ring" cx="74.5" cy="74.5" r="55.5"
                  pathLength="100" transform="rotate(-90 74.5 74.5)" />
          <path className="fin-burst-tick" d="M55.1 78 L65.5 88.9 L93.9 60.1" pathLength="100" />
        </svg>
        <p className="font-display font-semibold text-[15px] text-[var(--fin-text)]">{label}</p>
      </div>
    </div>
  )
}

/* ---------------- Segmented control ---------------- */
export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex p-1 rounded-full bg-[var(--fin-surface-2)] border border-[var(--fin-line)]">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value} role="tab" aria-selected={active} type="button"
            onClick={() => onChange(o.value)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[13px] font-display font-semibold transition-all duration-200
              ${active ? 'bg-[var(--fin-accent)] text-[var(--fin-accent-ink)] shadow-sm' : 'text-[var(--fin-text-2)] hover:text-[var(--fin-text)]'}`}
          >{o.label}</button>
        )
      })}
    </div>
  )
}

/* ============================================================
   CHART 1 — Composition bar (part-to-whole, one row)
   A stacked horizontal bar: income / savings / spending for the
   period, with a 2px surface gap between segments and a direct
   label under each. Colours: validated categorical slots 3,1,8.
   ============================================================ */
export function CompositionBar({ parts, format }) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0)
  return (
    <div>
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-[var(--fin-surface-2)]" role="img"
           aria-label={parts.map((p) => `${p.label} ${format(p.value)}`).join(', ')}>
        {total > 0 && parts.map((p, i) => {
          const pct = (Math.max(0, p.value) / total) * 100
          if (pct <= 0) return null
          return (
            <span key={p.label} title={`${p.label} · ${format(p.value)}`}
              style={{ width: `${pct}%`, background: p.color, marginLeft: i ? 2 : 0 }}
              className="h-full first:rounded-l-full last:rounded-r-full" />
          )
        })}
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {parts.map((p) => (
          <li key={p.label} className="min-w-0">
            <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--fin-text-2)]">
              <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: p.color }} />
              <span className="truncate">{p.label}</span>
            </span>
            <span className="block mt-0.5 font-display font-bold text-[15px] sm:text-base text-[var(--fin-text)] tabular-nums truncate">{format(p.value)}</span>
            <span className="block text-[11px] text-[var(--fin-muted)] tabular-nums">
              {total > 0 ? `${((Math.max(0, p.value) / total) * 100).toFixed(0)}% of flow` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ============================================================
   CHART 2 — Ranked horizontal bars (magnitude by category)
   One hue: this is magnitude, not identity. Every bar is directly
   labelled with its name and value, so no legend is needed.
   ============================================================ */
export function RankedBars({ rows, format, max: maxIn, emptyText = 'Nothing here yet.' }) {
  if (!rows.length) return <p className="text-sm text-[var(--fin-muted)] py-6 text-center">{emptyText}</p>
  const max = maxIn || Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="fin-row">
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-[13.5px] text-[var(--fin-text)] truncate">{r.label}</span>
            <span className="text-[13px] font-mono tabular-nums text-[var(--fin-text-2)] shrink-0">{format(r.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--fin-surface-2)] overflow-hidden">
            <span className="block h-full rounded-full fin-grow" style={{ width: `${(r.value / max) * 100}%`, background: r.color || 'var(--fin-bar)' }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ============================================================
   CHART 3 — Period comparison, grouped bars
   Three series (income / savings / spending) across the last N
   periods. Legend always shown; hovering a period reveals the
   exact numbers; a table view is available for screen readers
   and for anyone who cannot separate the colours.
   ============================================================ */
export function ComparisonBars({ data, colors, format }) {
  const [hover, setHover] = useState(null)
  const [table, setTable] = useState(false)
  const uid = useId()
  const keys = ['income', 'savings', 'spending']
  const max = Math.max(1, ...data.flatMap((d) => keys.map((k) => d[k])))
  const shown = hover != null ? data[hover] : data[data.length - 1]

  if (table) {
    return (
      <div>
        <TableToggle on={table} onClick={() => setTable(false)} />
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[13px]">
            <caption className="sr-only">Income, savings and spending per period</caption>
            <thead><tr className="text-left text-[var(--fin-muted)]">
              <th scope="col" className="py-1.5 pr-3 font-medium">Period</th>
              {keys.map((k) => <th key={k} scope="col" className="py-1.5 px-3 font-medium capitalize text-right">{k}</th>)}
            </tr></thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.label} className="border-t border-[var(--fin-line)]">
                  <th scope="row" className="py-1.5 pr-3 font-normal text-[var(--fin-text)]">{d.label}</th>
                  {keys.map((k) => <td key={k} className="py-1.5 px-3 text-right tabular-nums font-mono text-[var(--fin-text-2)]">{format(d[k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ul className="flex items-center gap-3.5">
          {keys.map((k) => (
            <li key={k} className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--fin-text-2)]">
              <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: colors[k] }} />{k}
            </li>
          ))}
        </ul>
        <TableToggle on={table} onClick={() => setTable(true)} />
      </div>

      {/* Readout for the hovered (or latest) period — the hover layer. */}
      <div className="mt-3 mb-1 flex items-baseline gap-3 flex-wrap min-h-[24px]">
        <span className="text-[13px] font-display font-semibold text-[var(--fin-text)]">{shown?.label}</span>
        {keys.map((k) => (
          <span key={k} className="text-[12px] font-mono tabular-nums text-[var(--fin-text-2)]">
            <span className="inline-block w-2 h-2 rounded-[2px] mr-1 align-middle" style={{ background: colors[k] }} />
            {format(shown?.[k] || 0)}
          </span>
        ))}
      </div>

      <div className="flex items-end gap-1.5 sm:gap-3 h-40" onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <button
            key={d.label} type="button"
            className={`flex-1 min-w-0 h-full flex flex-col justify-end rounded-lg px-0.5 pt-1 transition-colors
                        ${hover === i ? 'bg-[var(--fin-surface-2)]' : 'hover:bg-[var(--fin-surface-2)]'}`}
            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)}
            aria-label={`${d.label}: ${keys.map((k) => `${k} ${format(d[k])}`).join(', ')}`}
            aria-describedby={`${uid}-legend`}
          >
            <span className="flex items-end justify-center gap-[3px] h-full">
              {keys.map((k) => (
                <span key={k} className="w-1/4 max-w-[14px] min-w-[5px] rounded-t-[4px] fin-bar-rise"
                      style={{ height: `${Math.max(2, (d[k] / max) * 100)}%`, background: colors[k] }} />
              ))}
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 sm:gap-3 mt-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 min-w-0 text-center text-[10.5px] font-mono text-[var(--fin-muted)] truncate">{d.label}</span>
        ))}
      </div>
      <span id={`${uid}-legend`} className="sr-only">Bars in each group, left to right: income, savings, spending.</span>
    </div>
  )
}

function TableToggle({ on, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="text-[11px] font-mono uppercase tracking-wider text-[var(--fin-muted)] hover:text-[var(--fin-text)] underline underline-offset-4 transition-colors">
      {on ? 'Chart view' : 'Table view'}
    </button>
  )
}

/* ============================================================
   Meter — one ratio against a limit (budget used).
   Same-hue track, not a two-slice pie.
   ============================================================ */
export function Meter({ used, limit, format, label }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const over = limit > 0 && used > limit
  const near = limit > 0 && !over && pct >= 80
  const tone = over ? '#E11D48' : near ? '#B45309' : 'var(--fin-bar)'
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-[13px] text-[var(--fin-text)]">{label}</span>
        <span className="text-[12.5px] font-mono tabular-nums text-[var(--fin-text-2)]">{format(used)} / {format(limit)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[var(--fin-surface-2)] overflow-hidden">
        <span className="block h-full rounded-full fin-grow" style={{ width: `${Math.max(2, pct)}%`, background: tone }} />
      </div>
      {(over || near) && (
        <p className="mt-1.5 text-[12px] font-medium" style={{ color: tone }}>
          {over ? `Over budget by ${format(used - limit)}.` : `${pct.toFixed(0)}% of this month's budget used.`}
        </p>
      )}
    </div>
  )
}

/* ---------------- Bottom sheet / modal ----------------
   Slides up from the bottom on phones, centres on desktop.
   Closes on Escape, traps nothing fancy — just returns focus. */
export function Sheet({ open, onClose, title, children, labelledBy }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] fin-fade" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby={labelledBy}
           className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[var(--fin-surface)] border border-[var(--fin-line)]
                      rounded-t-3xl sm:rounded-3xl shadow-2xl fin-sheet">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-[var(--fin-surface)] border-b border-[var(--fin-line)] rounded-t-3xl">
          <h2 id={labelledBy} className="font-display font-bold text-lg text-[var(--fin-text)]">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close"
                  className="p-2 -mr-2 rounded-full text-[var(--fin-text-2)] hover:bg-[var(--fin-surface-2)] transition-colors">
            <I.close className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
