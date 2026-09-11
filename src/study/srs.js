/* ============================================================
   Spaced repetition, date maths and the dashboard statistics.
   Pure functions only — no React in this file, so every rule
   here can be reasoned about (and tested) on its own.
   ============================================================ */
import {
  FIRST_STEPS, START_EASE, MIN_EASE, MAX_EASE, MAX_INTERVAL, LEECH_LAPSES,
  YOUNG_DAYS, MATURE_DAYS, FORECAST_DAYS, HEATMAP_WEEKS,
} from './config'

/* ---------------- Dates ----------------
   Everything is a local 'YYYY-MM-DD' string. Dates are compared as
   strings wherever possible, which sidesteps every timezone trap:
   a day is the day you lived, not a UTC instant. */
export const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const todayISO = () => isoOf(new Date())
export const parseISO = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
export const addDays = (iso, n) => {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return isoOf(d)
}
/* Whole days from a to b. Built on local midnights so daylight saving
   cannot turn a day into 0.96 of one. */
export const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000)

export const fmtDay = (iso, opts = { day: 'numeric', month: 'short' }) =>
  parseISO(iso).toLocaleDateString(undefined, opts)

/* "Today", "Tomorrow", "in 5 days", "3 days ago" — the phrasing that makes
   a due date readable at a glance instead of needing arithmetic. */
export function relativeDay(iso, today = todayISO()) {
  const n = daysBetween(today, iso)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  if (n === -1) return 'Yesterday'
  if (n > 1 && n < 7) return `in ${n} days`
  if (n < -1 && n > -7) return `${-n} days ago`
  return fmtDay(iso)
}

/* Compact interval label: 4d, 3w, 5mo. Used on the grade buttons so you
   can see what each answer costs you before you press it. */
export function fmtInterval(days) {
  if (days <= 0) return 'now'
  if (days === 1) return '1d'
  if (days < 21) return `${Math.round(days)}d`
  if (days < 60) return `${Math.round(days / 7)}w`
  if (days < 365) return `${Math.round(days / 30)}mo`
  return `${(days / 365).toFixed(1)}y`
}

/* ============================================================
   The scheduler
   ============================================================ */

/* A brand new topic: due today, never reviewed. */
export const newCard = (due = todayISO()) => ({
  ease: START_EASE, interval: 0, reps: 0, lapses: 0, due, last: '',
})

const clampEase = (e) => Math.min(MAX_EASE, Math.max(MIN_EASE, Number(e) || START_EASE))

/* What the next interval WOULD be for each grade, without committing.
   The review screen prints these on the buttons, so nothing about the
   schedule is hidden from you. */
export function preview(card, today = todayISO()) {
  return Object.fromEntries(['again', 'hard', 'good', 'easy'].map((g) => [g, nextInterval(card, g, today)]))
}

/* The ladder itself. Deliberately close to SM-2, with two changes that
   matter in practice:
   • "Again" does not wipe the interval to zero — it keeps a fifth of it,
     so re-learning a topic you have held for months is not the same job
     as learning it for the first time.
   • Every step is capped by how long you ACTUALLY waited. Reviewing a
     card early must not inflate its interval, or the schedule drifts. */
export function nextInterval(card, gradeId, today = todayISO()) {
  const ease = clampEase(card.ease)
  const reps = Number(card.reps) || 0
  const interval = Number(card.interval) || 0
  // Waiting longer than asked is evidence the memory is stronger, so the
  // elapsed time — not the planned interval — is what grows.
  const elapsed = card.last ? Math.max(interval, daysBetween(card.last, today)) : interval

  let next
  if (gradeId === 'again') next = Math.max(1, Math.round(elapsed * 0.2))
  else if (reps < FIRST_STEPS.length && gradeId !== 'easy') next = FIRST_STEPS[reps]
  else if (reps === 0 && gradeId === 'easy') next = FIRST_STEPS[FIRST_STEPS.length - 1] + 1
  else if (gradeId === 'hard') next = Math.max(interval + 1, elapsed * 1.2)
  else if (gradeId === 'good') next = Math.max(interval + 1, elapsed * ease)
  else next = Math.max(interval + 2, elapsed * ease * 1.3)

  return Math.min(MAX_INTERVAL, Math.max(1, Math.round(next)))
}

/* Grade a card. Returns a NEW card — the old one is never mutated, which
   is what lets the reducer treat state as immutable. */
export function gradeCard(card, gradeId, today = todayISO()) {
  const interval = nextInterval(card, gradeId, today)
  const delta = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 }[gradeId] ?? 0
  return {
    ease: clampEase(clampEase(card.ease) + delta),
    interval,
    reps: gradeId === 'again' ? 0 : (Number(card.reps) || 0) + 1,
    lapses: (Number(card.lapses) || 0) + (gradeId === 'again' ? 1 : 0),
    due: addDays(today, interval),
    last: today,
  }
}

/* ---------------- Topic-level helpers ---------------- */
export const isDue = (t, today = todayISO()) => !t.archived && t.status !== 'preview' && t.srs.due <= today
export const dueTopics = (topics, today = todayISO()) =>
  topics.filter((t) => isDue(t, today))
    .sort((a, b) => (a.srs.due === b.srs.due ? (a.srs.interval - b.srs.interval) : (a.srs.due < b.srs.due ? -1 : 1)))

/* Overdue by enough that it is worth flagging separately. */
export const isOverdue = (t, today = todayISO()) => isDue(t, today) && daysBetween(t.srs.due, today) >= 1

export function maturityOf(t) {
  if (t.status === 'preview') return 'new'
  const i = Number(t.srs.interval) || 0
  if (!t.srs.last || i === 0) return 'new'
  if (i < YOUNG_DAYS) return 'learning'
  if (i < MATURE_DAYS) return 'young'
  return 'mature'
}

export const isLeech = (t) => (Number(t.srs.lapses) || 0) >= LEECH_LAPSES

/* A topic's own progress: how many of its goals you have ticked. */
export const goalProgress = (t) => {
  const goals = t.goals || []
  return { done: goals.filter((g) => g.done).length, total: goals.length }
}

/* ============================================================
   Dashboard statistics
   ============================================================ */

/* Counts per maturity band, for the composition bar. */
export function maturityCounts(topics) {
  const out = { new: 0, learning: 0, young: 0, mature: 0 }
  topics.filter((t) => !t.archived).forEach((t) => { out[maturityOf(t)] += 1 })
  return out
}

/* How many reviews land on each of the next N days. Day 0 includes
   everything already overdue, because that is when you will actually
   face it. */
export function forecast(topics, days = FORECAST_DAYS, today = todayISO()) {
  const out = []
  for (let i = 0; i < days; i++) {
    const date = addDays(today, i)
    const count = topics.filter((t) => {
      if (t.archived || t.status === 'preview') return false
      return i === 0 ? t.srs.due <= date : t.srs.due === date
    }).length
    out.push({ date, count, label: i === 0 ? 'Today' : fmtDay(date, { day: 'numeric' }) })
  }
  return out
}

/* Reviews done per day, from every topic's own log — the heatmap grid.
   Returns whole Monday-start weeks so the columns line up. */
export function reviewHeatmap(topics, weeks = HEATMAP_WEEKS, today = todayISO()) {
  const counts = new Map()
  topics.forEach((t) => (t.history || []).forEach((h) => {
    counts.set(h.date, (counts.get(h.date) || 0) + 1)
  }))
  // Walk back to the Monday of the first week shown.
  const end = parseISO(today)
  const endMonday = new Date(end)
  endMonday.setDate(endMonday.getDate() - ((end.getDay() + 6) % 7))
  const start = new Date(endMonday)
  start.setDate(start.getDate() - (weeks - 1) * 7)

  const cells = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const iso = isoOf(cursor)
    cells.push({ date: iso, count: counts.get(iso) || 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  const max = Math.max(1, ...cells.map((c) => c.count))
  return { cells, max, start: isoOf(start) }
}

/* Consecutive days with at least one review, counting back from today.
   Today not being done yet does not break the streak — only a missed
   yesterday does. */
export function streak(topics, today = todayISO()) {
  const days = new Set()
  topics.forEach((t) => (t.history || []).forEach((h) => days.add(h.date)))
  if (!days.size) return 0
  let n = 0
  let cursor = days.has(today) ? today : addDays(today, -1)
  while (days.has(cursor)) { n += 1; cursor = addDays(cursor, -1) }
  return n
}

/* Share of reviews you did NOT press "Again" on — your true recall rate. */
export function retention(topics, sinceDays = 30, today = todayISO()) {
  const from = addDays(today, -sinceDays)
  let ok = 0, total = 0
  topics.forEach((t) => (t.history || []).forEach((h) => {
    if (h.date < from) return
    total += 1
    if (h.grade !== 'again') ok += 1
  }))
  return { pct: total ? (ok / total) * 100 : null, total }
}

/* Reviews logged today, for the "done today" counter. */
export const reviewsOn = (topics, date) =>
  topics.reduce((n, t) => n + (t.history || []).filter((h) => h.date === date).length, 0)

/* Per-subject roll-up, strongest first — the ranked bars. */
export function subjectProgress(topics, subjects) {
  return subjects.map((s) => {
    const mine = topics.filter((t) => t.subject === s.id && !t.archived)
    const known = mine.filter((t) => maturityOf(t) === 'mature').length
    const due = mine.filter((t) => isDue(t)).length
    return {
      id: s.id, label: s.code, name: s.name, color: s.color,
      total: mine.length, known, due,
      value: mine.length ? (known / mine.length) * 100 : 0,
    }
  }).sort((a, b) => b.total - a.total || b.value - a.value)
}

/* ============================================================
   Exams
   ============================================================ */

/* Readiness = the share of an exam's topics that are actually held, where
   a topic counts fully only if it is "known" AND not due for review before
   the exam. Anything that will fall due first is only half-counted, because
   you still owe it a review. */
export function examReadiness(exam, topics, today = todayISO()) {
  const mine = topics.filter((t) => (exam.topics || []).includes(t.id) && !t.archived)
  if (!mine.length) return { pct: 0, total: 0, solid: 0, shaky: 0, weak: 0, days: daysBetween(today, exam.date) }
  let solid = 0, shaky = 0, weak = 0
  mine.forEach((t) => {
    const m = maturityOf(t)
    const fallsDue = t.srs.due <= exam.date
    if (m === 'mature' && !fallsDue) solid += 1
    else if (m === 'mature' || m === 'young') shaky += 1
    else weak += 1
  })
  return {
    pct: ((solid + shaky * 0.5) / mine.length) * 100,
    total: mine.length, solid, shaky, weak,
    days: daysBetween(today, exam.date),
  }
}

/* What to revise for an exam, worst first — the cram list. Topics you
   already hold are dropped unless they fall due before the exam anyway. */
export function cramList(exam, topics, limit = 30) {
  const order = { new: 0, learning: 1, young: 2, mature: 3 }
  return topics
    .filter((t) => (exam.topics || []).includes(t.id) && !t.archived)
    .map((t) => ({ topic: t, maturity: maturityOf(t), fallsDue: t.srs.due <= exam.date }))
    .filter((r) => r.maturity !== 'mature' || r.fallsDue)
    .sort((a, b) => order[a.maturity] - order[b.maturity] || (a.topic.srs.due < b.topic.srs.due ? -1 : 1))
    .slice(0, limit)
}

export const upcomingExams = (exams, today = todayISO()) =>
  exams.filter((e) => e.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1))

/* ============================================================
   Class schedule
   ============================================================ */

/* The real calendar dates your classes fall on, starting from `from`.
   `classDays` is [0-6], Sunday-indexed, matching Date.getDay(). */
export function classDates(from, classDays, count) {
  if (!classDays?.length) return []
  const out = []
  const cursor = parseISO(from)
  let guard = 0
  while (out.length < count && guard < count * 14 + 400) {
    if (classDays.includes(cursor.getDay())) out.push(isoOf(cursor))
    cursor.setDate(cursor.getDate() + 1)
    guard += 1
  }
  return out
}

/* THE point of the drag-and-drop schedule: whatever order the topics are
   in, they are re-dated onto consecutive class slots. Drag one topic up
   and every date below it shifts by itself — nothing to re-type. */
export function alignSchedule(items, termStart, classDays) {
  const dates = classDates(termStart, classDays, items.length)
  return items.map((it, i) => ({ ...it, date: dates[i] || it.date || '' }))
}

/* Class items that are coming up and have not been previewed yet. */
export function previewQueue(items, leadDays, today = todayISO()) {
  const until = addDays(today, leadDays)
  return items
    .filter((it) => !it.previewed && it.date && it.date >= today && it.date <= until)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
}

export const nextClass = (items, today = todayISO()) =>
  items.filter((it) => it.date && it.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1))[0] || null

/* ---------------- Export ---------------- */
export function toCSV(topics, subjects) {
  const head = ['title', 'subject', 'source', 'learnt_on', 'due', 'interval_days', 'reps', 'lapses', 'ease', 'maturity', 'note']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const code = (id) => subjects.find((s) => s.id === id)?.code || id
  const rows = topics.map((t) => [
    t.title, code(t.subject), t.source, t.date, t.srs.due, t.srs.interval,
    t.srs.reps, t.srs.lapses, Number(t.srs.ease).toFixed(2), maturityOf(t), t.note,
  ].map(esc).join(','))
  return [head.join(','), ...rows].join('\n')
}
