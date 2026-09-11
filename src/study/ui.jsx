/* ============================================================
   Reusable pieces for the revision app: shell chrome, the charts,
   and the drag-to-reorder list. Charts are hand-drawn SVG/HTML —
   no chart library, so nothing here fights the design tokens.

   Every chart follows the same rules: thin marks, a 2px surface gap
   between stacked fills, direct labels rather than a colour-only
   legend, a hover layer, and a table view where the numbers matter.
   ============================================================ */
import { useEffect, useId, useRef, useState } from 'react'
import { S } from './icons'
import { MATURITY, MATURITY_IDS, maturityColor, HEAT_RAMP, BAR_HUE } from './config'
import { fmtDay, relativeDay } from './srs'

/* ---------------- Chrome ---------------- */

export function IconBtn({ children, label, onClick, disabled, tone }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} disabled={disabled}
      className="p-2 rounded-full text-[var(--stu-text-2)] hover:text-[var(--stu-text)] hover:bg-[var(--stu-surface-2)]
                 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
      style={tone ? { color: tone } : undefined}>
      {children}
    </button>
  )
}

export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="inline-flex p-1 rounded-full bg-[var(--stu-surface-2)] border border-[var(--stu-line)]">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button key={o.value} role="tab" aria-selected={active} type="button" onClick={() => onChange(o.value)}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[13px] font-display font-semibold transition-all duration-200 whitespace-nowrap
              ${active ? 'bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] shadow-sm' : 'text-[var(--stu-text-2)] hover:text-[var(--stu-text)]'}`}>
            {o.label}{o.badge ? <span className="ml-1.5 tabular-nums opacity-70">{o.badge}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

/* A labelled field.
   `group` matters more than it looks: <button> is a labelable element, so a
   <label> wrapping a row of chips hands its ENTIRE text to the first chip as
   that chip's accessible name — "Subject MATH 231 PHYS 211 ECE 120 CS 101"
   instead of "ECE 220". Anything holding more than one control therefore gets
   role="group" + aria-labelledby instead of a <label>.
   The hint sits outside the label for the same reason: inside, it is glued
   onto the input's name rather than read as the aside it is. */
export function Field({ label, hint, children, group = false }) {
  const uid = useId()
  const Tag = group ? 'div' : 'label'
  return (
    <div>
      <Tag className="block" {...(group ? { role: 'group', 'aria-labelledby': `${uid}-l` } : {})}>
        <span id={`${uid}-l`} className="block text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)] mb-2">{label}</span>
        {children}
      </Tag>
      {hint && <span className="block mt-1.5 text-[12px] text-[var(--stu-muted)]">{hint}</span>}
    </div>
  )
}

export const inputCls =
  'w-full px-4 py-3 rounded-2xl bg-[var(--stu-surface-2)] border border-[var(--stu-line)] text-sm text-[var(--stu-text)] outline-none focus:border-[var(--stu-accent)] focus:ring-2 focus:ring-[var(--stu-ring)] transition'

export function Sheet({ open, onClose, title, children, labelledBy }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] stu-fade" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby={labelledBy}
           className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[var(--stu-surface)] border border-[var(--stu-line)]
                      rounded-t-3xl sm:rounded-3xl shadow-2xl stu-sheet">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-[var(--stu-surface)] border-b border-[var(--stu-line)] rounded-t-3xl">
          <h2 id={labelledBy} className="font-display font-bold text-lg">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close"
                  className="p-2 -mr-2 rounded-full text-[var(--stu-text-2)] hover:bg-[var(--stu-surface-2)] transition-colors">
            <S.close className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* The same vector success mark the ledger uses, on the study tokens. */
export function SuccessBurst({ show, label = 'Saved' }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center pointer-events-none" role="status" aria-live="polite">
      <div className="stu-burst-card flex flex-col items-center gap-3 px-8 py-7 rounded-3xl">
        <svg viewBox="0 0 150 150" className="w-20 h-20 fin-burst-mark" aria-hidden="true"
             fill="none" stroke="#369A5C" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round">
          <circle className="fin-burst-ring" cx="74.5" cy="74.5" r="55.5" pathLength="100" transform="rotate(-90 74.5 74.5)" />
          <path className="fin-burst-tick" d="M55.1 78 L65.5 88.9 L93.9 60.1" pathLength="100" />
        </svg>
        <p className="font-display font-semibold text-[15px]">{label}</p>
      </div>
    </div>
  )
}

/* A subject swatch is never alone — the code always rides beside it. */
export function SubjectTag({ subject, color, className = '' }) {
  if (!subject) return <span className={`text-[11px] font-mono text-[var(--stu-muted)] ${className}`}>No subject</span>
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--stu-text-2)] ${className}`}>
      <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: color }} aria-hidden="true" />
      {subject.code}
    </span>
  )
}

export function Empty({ icon: Icon = S.book, title, children }) {
  return (
    <div className="py-10 text-center">
      <Icon className="w-7 h-7 mx-auto mb-3 text-[var(--stu-muted)]" />
      <p className="font-display font-semibold text-[15px]">{title}</p>
      {children && <p className="mt-1.5 text-[13px] text-[var(--stu-muted)] max-w-sm mx-auto">{children}</p>}
    </div>
  )
}

function TableToggle({ on, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)] hover:text-[var(--stu-text)] underline underline-offset-4 transition-colors">
      {on ? 'Chart view' : 'Table view'}
    </button>
  )
}

/* ============================================================
   CHART 1 — Maturity composition (ordinal, part-to-whole)
   One stacked row, one hue stepped by tier, 2px surface gaps,
   every segment directly labelled underneath.
   ============================================================ */
export function MaturityBar({ counts, theme }) {
  const total = MATURITY_IDS.reduce((s, k) => s + counts[k], 0)
  return (
    <div>
      <div className="flex w-full h-3 rounded-full overflow-hidden bg-[var(--stu-surface-2)]" role="img"
           aria-label={MATURITY_IDS.map((k) => `${MATURITY[k].label} ${counts[k]}`).join(', ')}>
        {total > 0 && MATURITY_IDS.map((k, i) => {
          const pct = (counts[k] / total) * 100
          if (pct <= 0) return null
          return (
            <span key={k} title={`${MATURITY[k].label} · ${counts[k]}`}
              style={{ width: `${pct}%`, background: maturityColor(k, theme), marginLeft: i ? 2 : 0 }}
              className="h-full first:rounded-l-full last:rounded-r-full" />
          )
        })}
      </div>
      <ul className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MATURITY_IDS.map((k) => (
          <li key={k} className="min-w-0">
            <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--stu-text-2)]">
              <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: maturityColor(k, theme) }} />
              <span className="truncate">{MATURITY[k].label}</span>
            </span>
            <span className="block mt-0.5 font-display font-bold text-[17px] tabular-nums">{counts[k]}</span>
            <span className="block text-[11px] text-[var(--stu-muted)]">{MATURITY[k].blurb}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ============================================================
   CHART 2 — Forecast (magnitude over the next N days)
   One hue: this is "how much", not "which". Today is ringed
   rather than recoloured, so the highlight is not a second series.
   ============================================================ */
export function ForecastBars({ days, theme, height = 128 }) {
  const [hover, setHover] = useState(null)
  const [table, setTable] = useState(false)
  const max = Math.max(1, ...days.map((d) => d.count))
  const hue = BAR_HUE[theme === 'dark' ? 'dark' : 'light']
  const shown = hover != null ? days[hover] : null

  if (table) {
    return (
      <div>
        <div className="flex justify-end"><TableToggle on onClick={() => setTable(false)} /></div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[13px]">
            <caption className="sr-only">Reviews falling due per day</caption>
            <thead><tr className="text-left text-[var(--stu-muted)]">
              <th scope="col" className="py-1.5 pr-3 font-medium">Day</th>
              <th scope="col" className="py-1.5 pl-3 font-medium text-right">Due</th>
            </tr></thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date} className="border-t border-[var(--stu-line)]">
                  <th scope="row" className="py-1.5 pr-3 font-normal">{fmtDay(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</th>
                  <td className="py-1.5 pl-3 text-right tabular-nums font-mono text-[var(--stu-text-2)]">{d.count}</td>
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
      <div className="flex items-baseline justify-between gap-3 min-h-[22px]">
        <span className="text-[12.5px] text-[var(--stu-text-2)]">
          {shown
            ? <><span className="font-display font-semibold">{shown.count}</span> due {relativeDay(shown.date).toLowerCase()}</>
            : <>Peak day: <span className="font-display font-semibold tabular-nums">{max}</span></>}
        </span>
        <TableToggle on={false} onClick={() => setTable(true)} />
      </div>
      <div className="flex items-end gap-1 sm:gap-1.5 mt-3" style={{ height }} onMouseLeave={() => setHover(null)}>
        {days.map((d, i) => (
          <button key={d.date} type="button"
            className="flex-1 min-w-0 h-full flex flex-col justify-end rounded-md transition-colors hover:bg-[var(--stu-surface-2)]"
            onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)}
            aria-label={`${fmtDay(d.date, { weekday: 'long', day: 'numeric', month: 'long' })}: ${d.count} due`}>
            <span className="block w-full rounded-t-[4px] stu-rise"
              style={{
                height: `${Math.max(d.count ? 4 : 2, (d.count / max) * 100)}%`,
                background: d.count ? hue : 'var(--stu-line)',
                boxShadow: i === 0 ? `0 0 0 2px var(--stu-surface), 0 0 0 3.5px ${hue}` : undefined,
              }} />
          </button>
        ))}
      </div>
      <div className="flex gap-1 sm:gap-1.5 mt-2">
        {days.map((d, i) => (
          // "Today" is wider than one column on a phone, so the first label
          // is allowed to spill into its blank neighbour instead of
          // truncating to "To…".
          <span key={d.date}
            className={`flex-1 min-w-0 text-[10px] font-mono text-[var(--stu-muted)] whitespace-nowrap
              ${i === 0 ? 'text-left overflow-visible' : 'text-center truncate'}`}>
            {i === 0 || i === days.length - 1 || i % 3 === 0 ? d.label : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   CHART 3 — Review heatmap (sequential, calendar grid)
   Magnitude by one hue, light to dark. Empty days recede into
   the surface; every cell carries its date and count on hover
   and in its accessible name.
   ============================================================ */
export function Heatmap({ cells, max, theme, weeks }) {
  const [hover, setHover] = useState(null)
  const ramp = HEAT_RAMP[theme === 'dark' ? 'dark' : 'light']
  // Bucket into the ramp's steps. Zero is not a step — it is the surface,
  // and the busiest day always lands on the darkest step.
  const stepOf = (n) => (n <= 0 ? null : Math.min(ramp.length - 1, Math.ceil((n / max) * ramp.length) - 1))
  const cols = []
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7))
  const shown = hover != null ? cells[hover] : null
  const total = cells.reduce((s, c) => s + c.count, 0)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 min-h-[22px] mb-3">
        <span className="text-[12.5px] text-[var(--stu-text-2)]">
          {shown
            ? <><span className="font-display font-semibold tabular-nums">{shown.count}</span> {shown.count === 1 ? 'review' : 'reviews'} on {fmtDay(shown.date, { weekday: 'short', day: 'numeric', month: 'short' })}</>
            : <><span className="font-display font-semibold tabular-nums">{total}</span> reviews in {weeks} weeks</>}
        </span>
      </div>
      {/* Columns flex to fill whatever width the card gives them and the
          cells stay square, so the grid reads the same in a half-width
          card on a laptop and full-width on a phone. */}
      <div className="flex gap-[3px]" onMouseLeave={() => setHover(null)}>
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px] flex-1 min-w-[8px] max-w-[15px]">
            {col.map((c, ri) => {
              const step = stepOf(c.count)
              const idx = ci * 7 + ri
              return (
                <button key={c.date} type="button"
                  onMouseEnter={() => setHover(idx)} onFocus={() => setHover(idx)}
                  title={`${fmtDay(c.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${c.count}`}
                  aria-label={`${fmtDay(c.date, { weekday: 'long', day: 'numeric', month: 'long' })}: ${c.count} reviews`}
                  className="w-full rounded-[3px] transition-transform hover:scale-125"
                  style={{ aspectRatio: '1', background: step === null ? 'var(--stu-surface-2)' : ramp[step] }} />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[10.5px] font-mono text-[var(--stu-muted)]">
        <span>Less</span>
        <span className="w-[11px] h-[11px] rounded-[3px]" style={{ background: 'var(--stu-surface-2)' }} />
        {ramp.map((c) => <span key={c} className="w-[11px] h-[11px] rounded-[3px]" style={{ background: c }} />)}
        <span>More</span>
      </div>
    </div>
  )
}

/* ============================================================
   CHART 4 — Ranked bars (per-subject progress)
   The bar is magnitude; the subject's own colour rides on the
   swatch beside its code, which is always spelled out.
   ============================================================ */
export function RankedBars({ rows, emptyText = 'Nothing here yet.' }) {
  if (!rows.length) return <p className="text-sm text-[var(--stu-muted)] py-6 text-center">{emptyText}</p>
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="stu-row">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: r.color }} aria-hidden="true" />
              <span className="text-[13.5px] font-display font-semibold truncate">{r.label}</span>
              <span className="text-[12px] text-[var(--stu-muted)] truncate hidden sm:inline">{r.name}</span>
            </span>
            <span className="text-[12.5px] font-mono tabular-nums text-[var(--stu-text-2)] shrink-0">
              {r.known}/{r.total} known
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--stu-surface-2)] overflow-hidden">
            <span className="block h-full rounded-full stu-grow" style={{ width: `${r.value}%`, background: r.color }} />
          </div>
          {r.due > 0 && <span className="block mt-1 text-[11.5px] text-[var(--stu-muted)]">{r.due} due now</span>}
        </li>
      ))}
    </ul>
  )
}

/* ============================================================
   Readiness ring — one ratio, with the number in the middle.
   The arc is a status colour, so it always ships with the
   percentage and a word; colour is never the only signal.
   ============================================================ */
export function Ring({ pct, tone, label, sub, size = 104 }) {
  const uid = useId()
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, pct || 0))
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" role="img"
           aria-labelledby={`${uid}-t`}>
        <title id={`${uid}-t`}>{label}: {v.toFixed(0)} percent</title>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--stu-surface-2)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,0.61,0.36,1)' }} />
      </svg>
      <div className="min-w-0">
        <p className="font-display font-extrabold text-[26px] tabular-nums leading-none">{v.toFixed(0)}%</p>
        <p className="mt-1 font-display font-semibold text-[13.5px]" style={{ color: tone }}>{label}</p>
        {sub && <p className="mt-0.5 text-[12px] text-[var(--stu-muted)]">{sub}</p>}
      </div>
    </div>
  )
}

export function Stat({ label, value, sub, tone }) {
  return (
    <li className="min-w-0">
      <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)] truncate">{label}</span>
      <span className="block mt-0.5 font-display font-extrabold text-[22px] tabular-nums leading-tight" style={tone ? { color: tone } : undefined}>{value}</span>
      {sub && <span className="block text-[11.5px] text-[var(--stu-muted)] truncate">{sub}</span>}
    </li>
  )
}

/* ============================================================
   Drag-to-reorder list
   Pointer events rather than HTML5 drag-and-drop, because the
   HTML5 API does not fire on touch — and this list has to work
   on a phone. Keyboard users get the same job done with the
   arrow buttons, which is why they are not hover-only.
   ============================================================ */
export function DragList({ items, onReorder, renderItem, getKey = (x) => x.id }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)
  const rowRefs = useRef([])

  function indexFromPoint(clientY) {
    for (let i = 0; i < rowRefs.current.length; i++) {
      const el = rowRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (clientY < r.top + r.height / 2) return i
    }
    return items.length - 1
  }

  function startDrag(i, e) {
    // Let clicks on real controls inside the row behave normally.
    if (e.target.closest('button:not([data-drag-handle]), a, input, select, textarea')) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragIndex(i)
    setOverIndex(i)
  }
  function moveDrag(e) {
    if (dragIndex == null) return
    setOverIndex(indexFromPoint(e.clientY))
  }
  function endDrag() {
    if (dragIndex != null && overIndex != null && dragIndex !== overIndex) onReorder(dragIndex, overIndex)
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <ul className="space-y-2" role="list">
      {items.map((item, i) => {
        const dragging = dragIndex === i
        const target = dragIndex != null && overIndex === i && !dragging
        return (
          <li
            key={getKey(item)}
            ref={(el) => { rowRefs.current[i] = el }}
            onPointerDown={(e) => startDrag(i, e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`select-none touch-none rounded-2xl border transition-all duration-150
              ${dragging ? 'border-[var(--stu-accent)] shadow-lg scale-[1.01] opacity-90' : 'border-[var(--stu-line)]'}
              ${target ? 'border-t-2 border-t-[var(--stu-accent)]' : ''}
              bg-[var(--stu-surface-2)]`}
          >
            {renderItem(item, i, {
              dragging,
              moveUp: i > 0 ? () => onReorder(i, i - 1) : null,
              moveDown: i < items.length - 1 ? () => onReorder(i, i + 1) : null,
            })}
          </li>
        )
      })}
    </ul>
  )
}
