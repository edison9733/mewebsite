/* ============================================================
   State, persistence, and all the money maths.
   React Context + useReducer — no extra state library.
   ============================================================ */
import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react'
import { DEFAULT_RATES, DEFAULT_BUDGETS } from './config'
import { configOpenings } from './math'
import * as api from './api'

const TXN_KEY = 'fin_txns_v1'
const SET_KEY = 'fin_settings_v1'
const OPEN_KEY = 'fin_openings_v1'

/* ---------------- localStorage helpers (never throw) ---------------- */
const load = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }

/* ---------------- Reducer ---------------- */
/* Built once, lazily, on first render — so the very first paint already
   shows last session's data instead of an empty screen. */
function initState() {
  const stored = load(SET_KEY, {})
  return {
    txns: load(TXN_KEY, []),
    openings: { ...configOpenings(), ...load(OPEN_KEY, {}) },
    settings: {
      rates: { ...DEFAULT_RATES, ...(stored.rates || {}) },
      budgets: { ...DEFAULT_BUDGETS, ...(stored.budgets || {}) },
    },
  }
}

function reducer(state, a) {
  switch (a.type) {
    case 'add':        return { ...state, txns: [a.txn, ...state.txns] }
    case 'remove':     return { ...state, txns: state.txns.filter((t) => t.id !== a.id) }
    case 'replaceAll': return { ...state, txns: a.txns }
    case 'openings':   return { ...state, openings: { ...state.openings, ...a.openings } }
    case 'settings':   return { ...state, settings: { ...state.settings, ...a.settings } }
    default:           return state
  }
}

/* ---------------- Provider ---------------- */
const Ctx = createContext(null)

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)
  // 'off' = no Sheets URL set, 'syncing', 'ok', 'error', 'locked' = wrong PIN
  const [sync, setSync] = useState(api.isConfigured() ? 'syncing' : 'off')
  const [queued, setQueued] = useState(() => api.readQueue().length)

  /* Persist every change, so a refresh (or a dead connection) loses nothing. */
  useEffect(() => { save(TXN_KEY, state.txns) }, [state.txns])
  useEffect(() => { save(SET_KEY, state.settings) }, [state.settings])
  useEffect(() => { save(OPEN_KEY, state.openings) }, [state.openings])

  /* 3. Pull the sheet: replay any queued writes first, then take the sheet
        as the source of truth. */
  const pull = useCallback(async () => {
    if (!api.isConfigured()) { setSync('off'); return }
    setSync('syncing')
    try {
      const res = await api.flushQueue()
      setQueued(res.left)
      const data = await api.call('bootstrap')
      if (Array.isArray(data.transactions)) dispatch({ type: 'replaceAll', txns: data.transactions })
      if (Array.isArray(data.wallets) && data.wallets.length) {
        dispatch({ type: 'openings', openings: Object.fromEntries(data.wallets.map((w) => [w.id, Number(w.opening) || 0])) })
      }
      if (data.settings) dispatch({ type: 'settings', settings: data.settings })
      setSync('ok')
    } catch (e) {
      setSync(e?.message === 'bad-pin' ? 'locked' : 'error')
      setQueued(api.readQueue().length)
    }
  }, [])

  /* 4. First pull, then a quiet refresh every 60s and whenever the tab
        regains focus or the network comes back. No page reload needed. */
  useEffect(() => {
    if (!api.isConfigured()) return
    // Kicking off the first sync IS the point of this effect — Google Sheets is
    // the external system being subscribed to here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pull()
    const id = setInterval(pull, 60000)
    const onFocus = () => { if (document.visibilityState === 'visible') pull() }
    window.addEventListener('visibilitychange', onFocus)
    window.addEventListener('online', pull)
    return () => { clearInterval(id); window.removeEventListener('visibilitychange', onFocus); window.removeEventListener('online', pull) }
  }, [pull])

  /* Add — optimistic. The row appears instantly; the sheet catches up. */
  const addTxn = useCallback(async (draft) => {
    const txn = {
      id: (crypto?.randomUUID?.() || `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
      created_at: new Date().toISOString(),
      note: '', toWallet: '',
      ...draft,
      amount: Number(draft.amount),
    }
    dispatch({ type: 'add', txn })
    if (!api.isConfigured()) return txn
    try {
      await api.call('add', { txn })
      setSync('ok')
    } catch {
      api.enqueue('add', { txn })
      setQueued(api.readQueue().length)
      setSync('error')
    }
    return txn
  }, [])

  const removeTxn = useCallback(async (id) => {
    dispatch({ type: 'remove', id })
    if (!api.isConfigured()) return
    try { await api.call('remove', { id }); setSync('ok') }
    catch { api.enqueue('remove', { id }); setQueued(api.readQueue().length); setSync('error') }
  }, [])

  const saveSettings = useCallback(async (settings) => {
    dispatch({ type: 'settings', settings })
    if (!api.isConfigured()) return
    try { await api.call('settings', { settings }); setSync('ok') }
    catch { api.enqueue('settings', { settings }); setQueued(api.readQueue().length); setSync('error') }
  }, [])

  const value = useMemo(() => ({
    txns: state.txns, settings: state.settings, openings: state.openings,
    sync, queued, pull, addTxn, removeTxn, saveSettings,
  }), [state.txns, state.settings, state.openings, sync, queued, pull, addTxn, removeTxn, saveSettings])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- a hook, not a component
export function useFinance() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFinance must be used inside <FinanceProvider>')
  return v
}

