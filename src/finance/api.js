/* ============================================================
   Google Sheets client (via Apps Script Web App)

   Every call is a POST with Content-Type: text/plain. That is
   deliberate — text/plain is a "simple request", so the browser
   does NOT send a CORS preflight, which Apps Script cannot answer.
   (Same trick already used by the PulseFit demo on this site.)
   ============================================================ */
import { SHEETS_URL } from './config'

export const PIN_KEY = 'fin_pin_v1'
const QUEUE_KEY = 'fin_queue_v1'

export const isConfigured = () => Boolean(SHEETS_URL)

export function getPin() {
  try { return localStorage.getItem(PIN_KEY) || '' } catch { return '' }
}
export function setPin(pin) {
  try { pin ? localStorage.setItem(PIN_KEY, pin) : localStorage.removeItem(PIN_KEY) } catch { /* private mode */ }
}

/* One request. Throws on network failure or on { ok:false } from the script. */
export async function call(action, payload = {}, pin = getPin()) {
  if (!SHEETS_URL) throw new Error('not-configured')
  const res = await fetch(SHEETS_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, pin, ...payload }),
  })
  let data
  try { data = await res.json() } catch { throw new Error('bad-response') }
  if (!data || data.ok !== true) throw new Error((data && data.error) || 'request-failed')
  return data
}

/* ---------- Offline queue ----------
   Writes that fail (no signal, laptop asleep, script quota) are parked
   here and replayed on the next successful contact. Nothing is lost. */
export function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}
export function writeQueue(items) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}
export function enqueue(action, payload) {
  const q = readQueue()
  q.push({ action, payload, at: Date.now() })
  writeQueue(q)
}

/* Replay the queue oldest-first. Stops at the first failure so order holds. */
export async function flushQueue() {
  let q = readQueue()
  if (!q.length) return { sent: 0, left: 0 }
  let sent = 0
  while (q.length) {
    try {
      await call(q[0].action, q[0].payload)
      q = q.slice(1)
      writeQueue(q)
      sent++
    } catch {
      break
    }
  }
  return { sent, left: q.length }
}
