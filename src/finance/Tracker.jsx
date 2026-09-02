/* ============================================================
   The financial tracker — the site's primary interface at "/".
   ============================================================ */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CURRENCIES, CURRENCY_ORDER, BASE_CURRENCY, CATEGORIES, TYPES, TYPE_META,
  PORTFOLIO_PATH, walletById, walletsFor,
} from './config'
import * as api from './api'
import { FinanceProvider, useFinance } from './store'
import {
  walletBalances, currencyTotals, grandTotal, periodTotals, periodLabel,
  categoryBreakdown, walletBreakdown, series, pctChange, fmtMoney, toCSV,
  todayISO, periodRange, parseISO,
} from './math'
import { I } from './icons'
import {
  WalletLogo, SuccessBurst, Segmented, CompositionBar, RankedBars,
  ComparisonBars, Meter, Sheet,
} from './ui'

/* Validated categorical slots (see the dataviz palette): aqua / blue / red,
   in an order whose adjacent pairs clear the colour-blind separation gate. */
const SERIES_LIGHT = { income: '#1baf7a', savings: '#2a78d6', spending: '#e34948' }
const SERIES_DARK  = { income: '#199e70', savings: '#3987e5', spending: '#e66767' }

const THEME_KEY = 'fin_theme_v1'
const PERIODS = [{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]

/* ============================================================
   Shell — theme, lock screen, provider
   ============================================================ */
export default function Tracker() {
  // Saved choice first, then the phone's own light/dark setting.
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') }
    catch { return 'light' }
  })
  const [unlocked, setUnlocked] = useState(!api.isConfigured() || Boolean(api.getPin()))

  useEffect(() => {
    document.documentElement.setAttribute('data-fin-theme', theme)
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
    return () => document.documentElement.removeAttribute('data-fin-theme')
  }, [theme])

  useEffect(() => {
    const prev = document.title
    document.title = 'Ledger — private'
    // Keep this page out of search results; the portfolio stays indexable.
    const m = document.createElement('meta')
    m.name = 'robots'; m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => { document.title = prev; m.remove() }
  }, [])

  if (!unlocked) return <div className="fin"><LockScreen onUnlock={() => setUnlocked(true)} /></div>

  return (
    <div className="fin min-h-screen bg-[var(--fin-bg)] text-[var(--fin-text)] font-body">
      <FinanceProvider>
        <Dashboard theme={theme} setTheme={setTheme} onLock={() => { api.setPin(''); setUnlocked(false) }} />
      </FinanceProvider>
    </div>
  )
}

/* ============================================================
   Lock screen — the passcode is checked by the Apps Script, so
   nothing secret ships in the JavaScript bundle.
   ============================================================ */
function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [state, setState] = useState('idle')
  const [msg, setMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!pin.trim()) return
    setState('checking'); setMsg('')
    try {
      await api.call('bootstrap', {}, pin.trim())
      api.setPin(pin.trim())
      onUnlock()
    } catch (err) {
      setState('idle')
      setMsg(err?.message === 'bad-pin'
        ? 'That passcode does not match.'
        : 'Could not reach the sheet. Check your connection, then try again.')
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[var(--fin-bg)] text-[var(--fin-text)] font-body px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <span className="w-9 h-9 rounded-xl bg-[var(--fin-accent)] text-[var(--fin-accent-ink)] grid place-items-center"><I.lock className="w-[18px] h-[18px]" /></span>
          <span className="font-display font-extrabold text-lg tracking-tight">Ledger</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-2">Enter passcode</h1>
        <p className="text-sm text-[var(--fin-muted)] mb-6">This page is a private money tracker. Everything behind it is personal.</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password" value={pin} onChange={(e) => setPin(e.target.value)}
            autoComplete="current-password" autoFocus placeholder="Passcode"
            aria-label="Passcode"
            className="w-full px-4 py-3.5 rounded-2xl bg-[var(--fin-surface)] border border-[var(--fin-line)] text-[var(--fin-text)]
                       outline-none focus:border-[var(--fin-accent)] focus:ring-2 focus:ring-[var(--fin-ring)] transition"
          />
          <button type="submit" disabled={state === 'checking'}
            className="w-full py-3.5 rounded-2xl font-display font-semibold bg-[var(--fin-accent)] text-[var(--fin-accent-ink)]
                       disabled:opacity-60 transition-transform active:scale-[0.99]">
            {state === 'checking' ? 'Checking…' : 'Unlock'}
          </button>
        </form>
        {msg && <p role="alert" className="mt-3 text-sm text-[#e11d48]">{msg}</p>}
        <Link to={PORTFOLIO_PATH} className="mt-8 inline-flex items-center gap-1.5 text-sm text-[var(--fin-muted)] hover:text-[var(--fin-text)] transition-colors">
          View portfolio instead <I.arrowUR className="w-3.5 h-3.5" />
        </Link>
      </div>
    </main>
  )
}

/* ============================================================
   Dashboard
   ============================================================ */
function Dashboard({ theme, setTheme, onLock }) {
  const { txns, settings, openings, sync, queued, pull, addTxn, removeTxn, saveSettings } = useFinance()
  const [kind, setKind] = useState('month')
  const [offset, setOffset] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [setOpen, setSetOpen] = useState(false)
  const [burst, setBurst] = useState(false)
  const [breakType, setBreakType] = useState('spending')

  const rates = settings.rates
  const colors = theme === 'dark' ? SERIES_DARK : SERIES_LIGHT
  const fmtBase = useCallback((n) => fmtMoney(n, BASE_CURRENCY), [])

  const balances   = useMemo(() => walletBalances(txns, openings), [txns, openings])
  const totals     = useMemo(() => currencyTotals(txns, openings), [txns, openings])
  const grand      = useMemo(() => grandTotal(txns, rates, openings), [txns, rates, openings])
  const cur        = useMemo(() => periodTotals(txns, kind, offset, rates), [txns, kind, offset, rates])
  const prev       = useMemo(() => periodTotals(txns, kind, offset - 1, rates), [txns, kind, offset, rates])
  const cats       = useMemo(() => categoryBreakdown(txns, kind, offset, rates, breakType), [txns, kind, offset, rates, breakType])
  const byWallet   = useMemo(() => walletBreakdown(txns, kind, offset, rates, breakType), [txns, kind, offset, rates, breakType])
  const bars       = useMemo(() => series(txns, kind, kind === 'year' ? 4 : 6, rates), [txns, kind, rates])

  const range = periodRange(kind, offset)
  const periodTxns = useMemo(
    () => txns.filter((t) => { const d = parseISO(t.date); return d >= range.start && d < range.end })
              .sort((a, b) => (a.date === b.date ? String(b.created_at).localeCompare(String(a.created_at)) : (a.date < b.date ? 1 : -1))),
    [txns, kind, offset], // eslint-disable-line react-hooks/exhaustive-deps
  )

  async function handleAdd(draft) {
    setAddOpen(false)
    await addTxn(draft)
    setBurst(true)
    setTimeout(() => setBurst(false), 950)
  }

  function exportCSV() {
    const blob = new Blob([toCSV(txns)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `ledger-${todayISO()}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <TopBar theme={theme} setTheme={setTheme} sync={sync} queued={queued} onRefresh={pull} onSettings={() => setSetOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        {/* ---------- Total balance ---------- */}
        <section className="fin-reveal" aria-labelledby="bal-h">
          <h1 id="bal-h" className="text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--fin-muted)]">Total balance</h1>
          <p className="mt-1.5 font-display font-extrabold tracking-tight text-[clamp(2.1rem,9vw,3.4rem)] tabular-nums leading-none">
            {fmtBase(grand)}
          </p>
          <p className="mt-2 text-[12.5px] text-[var(--fin-muted)]">
            Everything converted to {BASE_CURRENCY} at the rates you set — not a live market rate.
          </p>

          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CURRENCY_ORDER.map((c) => (
              <li key={c} className="fin-card p-4">
                <span className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--fin-muted)]">{c}</span>
                  <span className="text-[11px] font-mono text-[var(--fin-muted)]">{c === BASE_CURRENCY ? 'base' : `1 = ${Number(rates[c] || 0).toFixed(3)} ${BASE_CURRENCY}`}</span>
                </span>
                <span className="block mt-1.5 font-display font-bold text-2xl tabular-nums">{fmtMoney(totals[c], c)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Period picker ---------- */}
        <section className="mt-9 flex items-center justify-between gap-3 flex-wrap fin-reveal">
          <Segmented options={PERIODS} value={kind} onChange={(v) => { setKind(v); setOffset(0) }} ariaLabel="Summary period" />
          <div className="flex items-center gap-1">
            <IconBtn label="Previous period" onClick={() => setOffset((o) => o - 1)}><I.chevL className="w-[18px] h-[18px]" /></IconBtn>
            <span className="min-w-[9.5rem] text-center text-[13.5px] font-display font-semibold">{periodLabel(kind, offset)}</span>
            <IconBtn label="Next period" onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset >= 0}><I.chevR className="w-[18px] h-[18px]" /></IconBtn>
          </div>
        </section>

        {/* ---------- Flow for the period ---------- */}
        <section className="mt-4 fin-card p-5 sm:p-6 fin-reveal" aria-labelledby="flow-h">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 id="flow-h" className="font-display font-bold text-base">This {kind}</h2>
            <span className="text-[12px] text-[var(--fin-muted)]">{cur.count} {cur.count === 1 ? 'entry' : 'entries'}</span>
          </div>
          <CompositionBar
            parts={[
              { label: 'Income', value: cur.income, color: colors.income },
              { label: 'Savings', value: cur.savings, color: colors.savings },
              { label: 'Spending', value: cur.spending, color: colors.spending },
            ]}
            format={fmtBase}
          />
          <ul className="mt-5 pt-4 border-t border-[var(--fin-line)] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Net this period" value={fmtBase(cur.income - cur.spending)} />
            <Delta label="Income" now={cur.income} before={prev.income} good="up" />
            <Delta label="Spending" now={cur.spending} before={prev.spending} good="down" />
            <Delta label="Savings" now={cur.savings} before={prev.savings} good="up" />
          </ul>
          <p className="mt-4 text-[12.5px] text-[var(--fin-muted)]">
            {cur.income > 0
              ? `You saved ${((cur.savings / cur.income) * 100).toFixed(0)}% and spent ${((cur.spending / cur.income) * 100).toFixed(0)}% of what came in.`
              : 'No income logged in this period yet, so the savings rate has no base to work from.'}
          </p>
        </section>

        {/* ---------- Budget meters (monthly only) ---------- */}
        {kind === 'month' && CURRENCY_ORDER.some((c) => Number(settings.budgets?.[c]) > 0) && (
          <section className="mt-4 fin-card p-5 sm:p-6 fin-reveal" aria-labelledby="bud-h">
            <h2 id="bud-h" className="font-display font-bold text-base mb-4">Budget</h2>
            <div className="space-y-4">
              {CURRENCY_ORDER.filter((c) => Number(settings.budgets?.[c]) > 0).map((c) => (
                <Meter key={c} label={`${CURRENCIES[c].name} spending`}
                       used={cur.byCurrency[c].spending} limit={Number(settings.budgets[c])}
                       format={(n) => fmtMoney(n, c)} />
              ))}
            </div>
          </section>
        )}

        {/* ---------- Comparison ---------- */}
        <section className="mt-4 fin-card p-5 sm:p-6 fin-reveal" aria-labelledby="cmp-h">
          <h2 id="cmp-h" className="font-display font-bold text-base mb-1">Last {bars.length} {kind}s</h2>
          <p className="text-[12.5px] text-[var(--fin-muted)] mb-3">All figures in {BASE_CURRENCY}.</p>
          <ComparisonBars data={bars} colors={colors} format={fmtBase} />
        </section>

        {/* ---------- Breakdown ---------- */}
        <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 fin-reveal">
          <div className="fin-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="font-display font-bold text-base">By category</h2>
              <Segmented ariaLabel="Breakdown type"
                options={TYPES.map((t) => ({ value: t, label: TYPE_META[t].label }))}
                value={breakType} onChange={setBreakType} />
            </div>
            <p className="text-[12.5px] text-[var(--fin-muted)] -mt-2 mb-4">{TYPE_META[breakType].label} in {periodLabel(kind, offset)}, in {BASE_CURRENCY}.</p>
            <RankedBars rows={cats} format={fmtBase} emptyText={`No ${breakType} logged in this ${kind}.`} />
          </div>
          <div className="fin-card p-5 sm:p-6">
            <h2 className="font-display font-bold text-base mb-1">By wallet</h2>
            <p className="text-[12.5px] text-[var(--fin-muted)] mb-4">{TYPE_META[breakType].label} in {periodLabel(kind, offset)}, in {BASE_CURRENCY}.</p>
            <RankedBars rows={byWallet} format={fmtBase} emptyText={`No ${breakType} logged in this ${kind}.`} />
          </div>
        </section>

        {/* ---------- Wallets ---------- */}
        <section className="mt-4 fin-card p-5 sm:p-6 fin-reveal" aria-labelledby="wal-h">
          <h2 id="wal-h" className="font-display font-bold text-base mb-4">Wallets</h2>
          {CURRENCY_ORDER.map((c) => {
            const list = walletsFor(c)
            const sum = list.reduce((s, w) => s + Math.max(0, balances[w.id]), 0)
            return (
              <div key={c} className="mb-6 last:mb-0">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--fin-muted)]">{c} · {CURRENCIES[c].name}</h3>
                  <span className="text-[13px] font-mono tabular-nums text-[var(--fin-text-2)]">{fmtMoney(totals[c], c)}</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {list.map((w) => (
                    <li key={w.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--fin-surface-2)] fin-row">
                      <WalletLogo wallet={w} size={38} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-display font-semibold text-[14px] truncate">{w.name}</span>
                        <span className="block h-1.5 mt-1.5 rounded-full bg-[var(--fin-line)] overflow-hidden">
                          <span className="block h-full rounded-full fin-grow"
                                style={{ width: `${sum > 0 ? (Math.max(0, balances[w.id]) / sum) * 100 : 0}%`, background: w.color }} />
                        </span>
                      </span>
                      <span className="font-mono text-[13.5px] tabular-nums shrink-0">{fmtMoney(balances[w.id], c)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>

        {/* ---------- Transactions ---------- */}
        <section className="mt-4 fin-card p-5 sm:p-6 fin-reveal" aria-labelledby="txn-h">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 id="txn-h" className="font-display font-bold text-base">Entries · {periodLabel(kind, offset)}</h2>
            <button type="button" onClick={exportCSV}
              className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-[var(--fin-muted)] hover:text-[var(--fin-text)] transition-colors">
              <I.download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          {periodTxns.length === 0
            ? <p className="text-sm text-[var(--fin-muted)] py-8 text-center">Nothing logged in this {kind}. Tap the + button to add the first entry.</p>
            : (
              <ul className="divide-y divide-[var(--fin-line)]">
                {periodTxns.map((t) => <TxnRow key={t.id} t={t} colors={colors} onDelete={() => removeTxn(t.id)} />)}
              </ul>
            )}
        </section>

        <footer className="mt-10 text-center">
          <Link to={PORTFOLIO_PATH} className="inline-flex items-center gap-1.5 text-[13px] text-[var(--fin-muted)] hover:text-[var(--fin-text)] transition-colors">
            edison9733 portfolio <I.arrowUR className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </main>

      {/* ---------- Add button ---------- */}
      <button type="button" onClick={() => setAddOpen(true)} aria-label="Add a transaction"
        className="fixed z-[90] bottom-6 right-5 sm:bottom-8 sm:right-8 rounded-full grid place-items-center
                   bg-[var(--fin-accent)] text-[var(--fin-accent-ink)] shadow-[0_10px_30px_-8px_rgba(182,240,60,0.75)]
                   transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{ width: 60, height: 60 }}>
        <I.plus className="w-7 h-7" />
      </button>

      <AddSheet key={`add-${addOpen}`} open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />
      <SettingsSheet key={`set-${setOpen}`} open={setOpen} onClose={() => setSetOpen(false)} settings={settings} onSave={saveSettings}
                     onExport={exportCSV} onLock={onLock} sync={sync} queued={queued} onRefresh={pull} />
      <SuccessBurst show={burst} label="Logged" />
    </>
  )
}

/* ============================================================
   Top bar
   ============================================================ */
function TopBar({ theme, setTheme, sync, queued, onRefresh, onSettings }) {
  const tone = { ok: '#16A34A', syncing: '#B45309', error: '#E11D48', locked: '#E11D48', off: '#6B6F76' }[sync] || '#6B6F76'
  const text = { ok: 'Synced', syncing: 'Syncing…', error: queued ? `${queued} queued` : 'Offline', locked: 'Locked', off: 'Local only' }[sync] || ''
  return (
    <header className="fixed top-0 inset-x-0 z-[80] fin-topbar backdrop-blur-md border-b border-[var(--fin-line)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[var(--fin-accent)] text-[var(--fin-accent-ink)] grid place-items-center font-display font-extrabold text-[13px]">L</span>
          <span className="font-display font-extrabold tracking-tight">Ledger</span>
          <button type="button" onClick={onRefresh} title="Refresh from Google Sheets"
            className="ml-1 hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-[var(--fin-line)] text-[11px] font-mono text-[var(--fin-text-2)] hover:border-[var(--fin-text-2)] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone }} />{text}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <I.sun className="w-[18px] h-[18px]" /> : <I.moon className="w-[18px] h-[18px]" />}
          </IconBtn>
          <IconBtn label="Settings" onClick={onSettings}><I.gear className="w-[18px] h-[18px]" /></IconBtn>
          <Link to={PORTFOLIO_PATH}
            className="ml-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--fin-text)] text-[var(--fin-bg)]
                       font-display font-semibold text-[13px] transition-transform duration-200 hover:scale-[1.03] active:scale-95">
            Portfolio <I.arrowUR className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

function IconBtn({ children, label, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} disabled={disabled}
      className="p-2 rounded-full text-[var(--fin-text-2)] hover:text-[var(--fin-text)] hover:bg-[var(--fin-surface-2)]
                 disabled:opacity-35 disabled:hover:bg-transparent transition-colors">
      {children}
    </button>
  )
}

function Stat({ label, value }) {
  return (
    <li>
      <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--fin-muted)]">{label}</span>
      <span className="block mt-0.5 font-display font-bold text-[15px] tabular-nums">{value}</span>
    </li>
  )
}

/* Percentage change vs the previous period, with the arrow pointing the way
   the number moved and the colour saying whether that is good news. */
function Delta({ label, now, before, good }) {
  const pct = pctChange(now, before)
  const up = now > before
  const positive = good === 'up' ? up : !up
  const tone = pct === null || now === before ? 'var(--fin-muted)' : positive ? '#16A34A' : '#E11D48'
  return (
    <li>
      <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--fin-muted)]">{label} vs last</span>
      <span className="mt-0.5 flex items-center gap-1 font-display font-bold text-[15px] tabular-nums" style={{ color: tone }}>
        {pct === null ? '—' : (
          <>
            {up ? <I.up className="w-3.5 h-3.5" /> : <I.down className="w-3.5 h-3.5" />}
            {Math.abs(pct).toFixed(0)}%
          </>
        )}
      </span>
    </li>
  )
}

function TxnRow({ t, colors, onDelete }) {
  const w = walletById(t.wallet)
  const to = t.toWallet ? walletById(t.toWallet) : null
  const meta = TYPE_META[t.type] || TYPE_META.spending
  return (
    <li className="flex items-center gap-3 py-3 fin-row group">
      {w ? <WalletLogo wallet={w} size={34} rounded={10} /> : <span className="w-[34px] h-[34px] rounded-[10px] bg-[var(--fin-surface-2)]" />}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium truncate">
          {t.category || meta.label}{to ? ` → ${to.name}` : ''}
        </span>
        <span className="block text-[12px] text-[var(--fin-muted)] truncate">
          {t.date} · {w ? w.name : t.wallet}{t.note ? ` · ${t.note}` : ''}
        </span>
      </span>
      <span className="font-mono text-[13.5px] tabular-nums shrink-0" style={{ color: colors[t.type] }}>
        {meta.sign}{fmtMoney(t.amount, t.currency)}
      </span>
      <button type="button" onClick={onDelete} aria-label={`Delete ${t.category || meta.label} of ${fmtMoney(t.amount, t.currency)}`}
        className="p-1.5 rounded-lg text-[var(--fin-muted)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-[#e11d48] transition-all">
        <I.trash className="w-4 h-4" />
      </button>
    </li>
  )
}

/* ============================================================
   Add transaction
   ============================================================ */
function AddSheet({ open, onClose, onSubmit }) {
  const [type, setType] = useState('spending')
  const [currency, setCurrency] = useState(BASE_CURRENCY)
  const [wallet, setWallet] = useState(walletsFor(BASE_CURRENCY)[0]?.id || '')
  const [toWallet, setToWallet] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.spending[0])
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  /* Switching currency or type can leave the wallet or category pointing at
     something that no longer exists, so fix them up in the handler. The whole
     sheet is remounted each time it opens, which is what clears the form. */
  function changeCurrency(c) {
    setCurrency(c)
    const list = walletsFor(c)
    if (!list.some((w) => w.id === wallet)) setWallet(list[0]?.id || '')
    if (toWallet && !list.some((w) => w.id === toWallet)) setToWallet('')
  }
  function changeType(t) {
    setType(t)
    if (!CATEGORIES[t].includes(category)) setCategory(CATEGORIES[t][0])
    if (t !== 'savings') setToWallet('')
  }

  function submit(e) {
    e.preventDefault()
    const value = Number(String(amount).replace(/,/g, ''))
    if (!Number.isFinite(value) || value <= 0) { setError('Enter an amount greater than zero.'); return }
    if (!wallet) { setError('Pick a wallet.'); return }
    if (toWallet && toWallet === wallet) { setError('The destination wallet must be a different wallet.'); return }
    onSubmit({ date, type, amount: value, currency, wallet, toWallet, category, note: note.trim() })
  }

  const list = walletsFor(currency)

  return (
    <Sheet open={open} onClose={onClose} title="Add entry" labelledBy="add-title">
      <form onSubmit={submit} className="space-y-5">
        {/* Type */}
        <Field label="Type">
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => changeType(t)}
                aria-pressed={type === t}
                className={`py-2.5 rounded-xl font-display font-semibold text-[13.5px] border transition-all duration-200
                  ${type === t ? 'text-white border-transparent' : 'bg-[var(--fin-surface-2)] border-[var(--fin-line)] text-[var(--fin-text-2)] hover:text-[var(--fin-text)]'}`}
                style={type === t ? { background: TYPE_META[t].tint } : undefined}>
                {TYPE_META[t].label}
              </button>
            ))}
          </div>
        </Field>

        {/* Amount + currency */}
        <Field label="Amount">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fin-muted)] font-mono text-sm">{CURRENCIES[currency].symbol}</span>
              <input
                value={amount} onChange={(e) => setAmount(e.target.value)}
                type="text" inputMode="decimal" placeholder="0.00" autoFocus
                aria-label={`Amount in ${currency}`}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)]
                           font-display font-bold text-xl tabular-nums outline-none
                           focus:border-[var(--fin-accent)] focus:ring-2 focus:ring-[var(--fin-ring)] transition"
              />
            </div>
            <select value={currency} onChange={(e) => changeCurrency(e.target.value)} aria-label="Currency"
              className="px-3 rounded-2xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)] font-display font-semibold text-sm outline-none
                         focus:border-[var(--fin-accent)] transition">
              {CURRENCY_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Field>

        {/* Wallet */}
        <Field label={type === 'savings' ? 'Set aside from' : type === 'income' ? 'Received into' : 'Paid from'}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {list.map((w) => (
              <button key={w.id} type="button" onClick={() => setWallet(w.id)} aria-pressed={wallet === w.id}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200
                  ${wallet === w.id ? 'border-[var(--fin-accent)] bg-[var(--fin-accent-soft)]' : 'border-[var(--fin-line)] bg-[var(--fin-surface-2)] hover:border-[var(--fin-text-2)]'}`}>
                <WalletLogo wallet={w} size={30} rounded={9} />
                <span className="text-[11.5px] font-medium truncate max-w-full">{w.name}</span>
              </button>
            ))}
          </div>
        </Field>

        {/* Savings destination */}
        {type === 'savings' && (
          <Field label="Move into (optional)" hint="Leave as “Just earmark it” and no money moves — the amount is only tagged as saved.">
            <select value={toWallet} onChange={(e) => setToWallet(e.target.value)} aria-label="Destination wallet"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)] text-sm outline-none focus:border-[var(--fin-accent)] transition">
              <option value="">Just earmark it (no transfer)</option>
              {list.filter((w) => w.id !== wallet).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Field>
        )}

        {/* Category */}
        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES[type].map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
                className={`px-3 py-1.5 rounded-full text-[12.5px] border transition-all duration-200
                  ${category === c ? 'bg-[var(--fin-text)] text-[var(--fin-bg)] border-transparent' : 'border-[var(--fin-line)] text-[var(--fin-text-2)] hover:border-[var(--fin-text-2)]'}`}>
                {c}
              </button>
            ))}
          </div>
        </Field>

        {/* Date + note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)] text-sm outline-none focus:border-[var(--fin-accent)] transition" />
          </Field>
          <Field label="Note (optional)">
            <input type="text" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder="e.g. lunch with Wei"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)] text-sm outline-none focus:border-[var(--fin-accent)] transition" />
          </Field>
        </div>

        {error && <p role="alert" className="text-sm text-[#e11d48]">{error}</p>}

        <button type="submit"
          className="w-full py-4 rounded-2xl font-display font-bold text-[15px] bg-[var(--fin-accent)] text-[var(--fin-accent-ink)]
                     transition-transform duration-200 active:scale-[0.99]">
          Save entry
        </button>
      </form>
    </Sheet>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--fin-muted)] mb-2">{label}</span>
      {children}
      {hint && <span className="block mt-1.5 text-[12px] text-[var(--fin-muted)]">{hint}</span>}
    </label>
  )
}

/* ============================================================
   Settings
   ============================================================ */
function SettingsSheet({ open, onClose, settings, onSave, onExport, onLock, sync, queued, onRefresh }) {
  // Remounted every time it opens (see the key on <SettingsSheet>), so these
  // start from whatever the sheet last told us.
  const [rates, setRates] = useState(settings.rates)
  const [budgets, setBudgets] = useState(settings.budgets)

  function save() {
    const clean = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Number(v) || 0]))
    onSave({ rates: { ...clean(rates), [BASE_CURRENCY]: 1 }, budgets: clean(budgets) })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Settings" labelledBy="set-title">
      <div className="space-y-7">
        <section>
          <h3 className="font-display font-bold text-[15px] mb-1">Exchange rates</h3>
          <p className="text-[12.5px] text-[var(--fin-muted)] mb-3">
            How much 1 unit is worth in {BASE_CURRENCY}. These are your numbers — the app never fetches a live rate.
          </p>
          <div className="space-y-2">
            {CURRENCY_ORDER.filter((c) => c !== BASE_CURRENCY).map((c) => (
              <label key={c} className="flex items-center gap-3">
                <span className="w-20 text-[13px] font-mono">1 {c} =</span>
                <input type="text" inputMode="decimal" value={rates[c] ?? ''} onChange={(e) => setRates({ ...rates, [c]: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)] text-sm tabular-nums outline-none focus:border-[var(--fin-accent)] transition" />
                <span className="text-[13px] font-mono text-[var(--fin-muted)]">{BASE_CURRENCY}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-display font-bold text-[15px] mb-1">Monthly spending budget</h3>
          <p className="text-[12.5px] text-[var(--fin-muted)] mb-3">Set 0 to turn a budget off. You get a warning at 80%.</p>
          <div className="space-y-2">
            {CURRENCY_ORDER.map((c) => (
              <label key={c} className="flex items-center gap-3">
                <span className="w-20 text-[13px] font-mono">{c}</span>
                <input type="text" inputMode="decimal" value={budgets[c] ?? 0} onChange={(e) => setBudgets({ ...budgets, [c]: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)] text-sm tabular-nums outline-none focus:border-[var(--fin-accent)] transition" />
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-display font-bold text-[15px] mb-3">Sync</h3>
          <div className="space-y-2">
            <RowBtn onClick={onRefresh} icon={<I.refresh className="w-4 h-4" />}
              label="Refresh from Google Sheets"
              sub={sync === 'off' ? 'No Sheets URL set — the tracker is local to this browser.' : queued ? `${queued} change(s) waiting to upload.` : 'Everything is up to date.'} />
            <RowBtn onClick={onExport} icon={<I.download className="w-4 h-4" />} label="Export all entries as CSV" sub="Downloads a file you can open in Excel or Sheets." />
            {api.isConfigured() && (
              <RowBtn onClick={onLock} icon={<I.lock className="w-4 h-4" />} label="Lock this device" sub="Forgets the passcode on this browser." />
            )}
          </div>
        </section>

        <button type="button" onClick={save}
          className="w-full py-3.5 rounded-2xl font-display font-bold text-[15px] bg-[var(--fin-accent)] text-[var(--fin-accent-ink)] transition-transform active:scale-[0.99]">
          Save settings
        </button>
      </div>
    </Sheet>
  )
}

function RowBtn({ onClick, icon, label, sub }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--fin-surface-2)] border border-[var(--fin-line)] text-left hover:border-[var(--fin-text-2)] transition-colors">
      <span className="mt-0.5 text-[var(--fin-text-2)]">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-medium">{label}</span>
        <span className="block text-[12px] text-[var(--fin-muted)]">{sub}</span>
      </span>
    </button>
  )
}
