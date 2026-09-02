/* ============================================================
   Pure money maths, date maths and formatting.
   No React in this file — everything here is a plain function,
   which makes it easy to reason about and easy to test.
   ============================================================ */
import { WALLETS, walletById, BASE_CURRENCY, CURRENCY_ORDER } from './config'

/* Opening balances start from config.js and are replaced by the sheet's
   Wallets tab as soon as the first sync lands. The sheet wins. */
export const configOpenings = () => Object.fromEntries(WALLETS.map((w) => [w.id, Number(w.opening) || 0]))

/* ---------------- Date helpers ---------------- */
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
/* Monday-start week. */
const startOfWeek = (d) => {
  const s = startOfDay(d)
  const dow = (s.getDay() + 6) % 7 // 0 = Monday
  s.setDate(s.getDate() - dow)
  return s
}

/* Range for a period. offset 0 = current, -1 = previous, and so on. */
export function periodRange(kind, offset = 0, now = new Date()) {
  if (kind === 'week') {
    const start = startOfWeek(now)
    start.setDate(start.getDate() + offset * 7)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    return { start, end }
  }
  if (kind === 'year') {
    const start = new Date(now.getFullYear() + offset, 0, 1)
    const end = new Date(now.getFullYear() + offset + 1, 0, 1)
    return { start, end }
  }
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1)
  return { start, end }
}

export function periodLabel(kind, offset = 0, now = new Date()) {
  const { start, end } = periodRange(kind, offset, now)
  if (kind === 'week') {
    const last = new Date(end); last.setDate(last.getDate() - 1)
    const f = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    return `${f(start)} – ${f(last)}`
  }
  if (kind === 'year') return String(start.getFullYear())
  return start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

/* 'YYYY-MM-DD' -> Date at local midnight (avoids UTC off-by-one). */
export const parseISO = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
const inRange = (iso, { start, end }) => { const t = parseISO(iso); return t >= start && t < end }

/* ============================================================
   Pure maths — exported so they can be unit-tested on their own.
   ============================================================ */

/* Wallet balance = opening + income − spending − transfers out + transfers in.
   A "savings" row with no destination wallet is an earmark: it is counted as
   savings but does NOT move money, so it leaves balances untouched. */
export function walletBalances(txns, openings = configOpenings()) {
  const bal = {}
  WALLETS.forEach((w) => { bal[w.id] = Number(openings[w.id] ?? w.opening) || 0 })
  txns.forEach((t) => {
    const amt = Number(t.amount) || 0
    if (t.type === 'income' && t.wallet in bal) bal[t.wallet] += amt
    else if (t.type === 'spending' && t.wallet in bal) bal[t.wallet] -= amt
    else if (t.type === 'savings' && t.toWallet) {
      if (t.wallet in bal) bal[t.wallet] -= amt
      if (t.toWallet in bal) bal[t.toWallet] += amt
    }
  })
  return bal
}

export function currencyTotals(txns, openings) {
  const bal = walletBalances(txns, openings)
  const out = {}
  CURRENCY_ORDER.forEach((c) => { out[c] = 0 })
  WALLETS.forEach((w) => { out[w.currency] += bal[w.id] })
  return out
}

export const toBase = (amount, currency, rates) => (Number(amount) || 0) * (Number(rates?.[currency]) || (currency === BASE_CURRENCY ? 1 : 0))

export const grandTotal = (txns, rates, openings) => {
  const totals = currencyTotals(txns, openings)
  return CURRENCY_ORDER.reduce((s, c) => s + toBase(totals[c], c, rates), 0)
}

/* Income / spending / savings inside one period, in base currency,
   plus the same figures per currency. */
export function periodTotals(txns, kind, offset, rates, now = new Date()) {
  const range = periodRange(kind, offset, now)
  const base = { income: 0, spending: 0, savings: 0 }
  const byCurrency = {}
  CURRENCY_ORDER.forEach((c) => { byCurrency[c] = { income: 0, spending: 0, savings: 0 } })
  txns.forEach((t) => {
    if (!inRange(t.date, range)) return
    const amt = Number(t.amount) || 0
    if (!(t.type in base)) return
    base[t.type] += toBase(amt, t.currency, rates)
    if (byCurrency[t.currency]) byCurrency[t.currency][t.type] += amt
  })
  return { ...base, byCurrency, count: txns.filter((t) => inRange(t.date, range)).length }
}

/* Spending grouped by category (base currency), biggest first. */
export function categoryBreakdown(txns, kind, offset, rates, type = 'spending', now = new Date()) {
  const range = periodRange(kind, offset, now)
  const map = new Map()
  txns.forEach((t) => {
    if (t.type !== type || !inRange(t.date, range)) return
    const key = t.category || 'Uncategorised'
    map.set(key, (map.get(key) || 0) + toBase(t.amount, t.currency, rates))
  })
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

/* Spending grouped by wallet (native currency), biggest first. */
export function walletBreakdown(txns, kind, offset, rates, type = 'spending', now = new Date()) {
  const range = periodRange(kind, offset, now)
  const map = new Map()
  txns.forEach((t) => {
    if (t.type !== type || !inRange(t.date, range)) return
    map.set(t.wallet, (map.get(t.wallet) || 0) + toBase(t.amount, t.currency, rates))
  })
  return [...map.entries()]
    .map(([id, value]) => ({ id, label: walletById(id)?.name || id, value, color: walletById(id)?.color }))
    .sort((a, b) => b.value - a.value)
}

/* Last N periods, oldest first — for the comparison bars. */
export function series(txns, kind, count, rates, now = new Date()) {
  const out = []
  for (let i = count - 1; i >= 0; i--) {
    const t = periodTotals(txns, kind, -i, rates, now)
    out.push({ label: shortLabel(kind, -i, now), income: t.income, spending: t.spending, savings: t.savings })
  }
  return out
}

function shortLabel(kind, offset, now) {
  const { start } = periodRange(kind, offset, now)
  if (kind === 'year') return String(start.getFullYear())
  if (kind === 'week') return start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  return start.toLocaleDateString(undefined, { month: 'short' })
}

/* Percentage change vs the previous period. null when there is no baseline. */
export const pctChange = (now, before) => {
  if (!before) return now ? null : 0
  return ((now - before) / before) * 100
}

/* ---------------- Formatting ---------------- */
export function fmtMoney(amount, currency, { compact = false, sign = false } = {}) {
  const n = Number(amount) || 0
  try {
    const f = new Intl.NumberFormat(undefined, {
      style: 'currency', currency,
      minimumFractionDigits: compact ? 0 : 2,
      maximumFractionDigits: compact ? 0 : 2,
      notation: compact && Math.abs(n) >= 100000 ? 'compact' : 'standard',
    })
    const s = f.format(Math.abs(n))
    if (sign) return `${n < 0 ? '−' : '+'}${s}`
    return n < 0 ? `−${s}` : s
  } catch {
    return `${currency} ${n.toFixed(2)}`
  }
}
export const fmtPct = (n, digits = 0) => `${(Number(n) || 0).toFixed(digits)}%`

/* ---------------- CSV export ---------------- */
export function toCSV(txns) {
  const head = ['id', 'date', 'type', 'amount', 'currency', 'wallet', 'to_wallet', 'category', 'note', 'created_at']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [...txns]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((t) => head.map((h) => esc(t[h === 'to_wallet' ? 'toWallet' : h])).join(','))
  return [head.join(','), ...rows].join('\n')
}
