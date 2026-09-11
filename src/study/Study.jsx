/* ============================================================
   Revision — the study division of the site, at "/study".

   The whole thing is built around one claim: the friction between
   "I just learnt this" and "it is scheduled" has to be near zero,
   or it will not get used. So logging a topic takes a title and a
   tap, the first repetition is booked before the sheet closes, and
   a review is answered with a single key.
   ============================================================ */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GRADES, SOURCES, SOURCE_IDS, STATUS, PREVIEW_LEAD_DAYS, FORECAST_DAYS, HEATMAP_WEEKS,
  PORTFOLIO_PATH, LEDGER_PATH, SERIES, seriesColor, subjectById, MATURITY,
} from './config'
import { StudyProvider, useStudy } from './store'
import {
  todayISO, relativeDay, fmtDay, fmtInterval, daysBetween, preview as previewIntervals,
  dueTopics, isOverdue, maturityOf, isLeech, goalProgress, maturityCounts, forecast,
  reviewHeatmap, streak, retention, reviewsOn, subjectProgress, examReadiness, cramList,
  upcomingExams, previewQueue, nextClass, toCSV,
} from './srs'
import { S } from './icons'
import {
  IconBtn, Segmented, Field, inputCls, Sheet, SuccessBurst, SubjectTag, Empty,
  MaturityBar, ForecastBars, Heatmap, RankedBars, Ring, Stat, DragList,
} from './ui'

const THEME_KEY = 'stu_theme_v1'
const TAB_KEY = 'stu_tab_v1'

const TABS = [
  { value: 'today', label: 'Today' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'exams', label: 'Exams' },
  { value: 'progress', label: 'Progress' },
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ============================================================
   Shell
   ============================================================ */
export default function Study() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') }
    catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-stu-theme', theme)
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
    return () => document.documentElement.removeAttribute('data-stu-theme')
  }, [theme])

  useEffect(() => {
    const prev = document.title
    document.title = 'Revision'
    return () => { document.title = prev }
  }, [])

  return (
    <div className="stu min-h-screen bg-[var(--stu-bg)] text-[var(--stu-text)] font-body">
      <StudyProvider>
        <App theme={theme} setTheme={setTheme} />
      </StudyProvider>
    </div>
  )
}

function App({ theme, setTheme }) {
  const st = useStudy()
  const [tab, setTab] = useState(() => { try { return localStorage.getItem(TAB_KEY) || 'today' } catch { return 'today' } })
  const [addOpen, setAddOpen] = useState(false)
  const [setOpen, setSetOpen] = useState(false)
  const [burst, setBurst] = useState(null)
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => { try { localStorage.setItem(TAB_KEY, tab) } catch { /* ignore */ } }, [tab])

  const today = todayISO()
  const due = useMemo(() => dueTopics(st.topics, today), [st.topics, today])
  const colorOf = useCallback((subjectId) => {
    const s = subjectById(st.subjects, subjectId)
    return s ? seriesColor(s.slot, theme) : 'var(--stu-muted)'
  }, [st.subjects, theme])

  const flash = useCallback((label) => {
    setBurst(label)
    setTimeout(() => setBurst(null), 1700)
  }, [])

  function handleAdd(draft) {
    setAddOpen(false)
    const t = st.addTopic(draft)
    flash(draft.source === 'preview' ? 'Previewed' : `Next review ${relativeDay(t.srs.due, today).toLowerCase()}`)
  }

  function exportCSV() {
    const blob = new Blob([toCSV(st.topics, st.subjects)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `revision-${today}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const tabsWithBadge = TABS.map((t) => (t.value === 'today' && due.length ? { ...t, badge: due.length } : t))

  return (
    <>
      <TopBar theme={theme} setTheme={setTheme} onSettings={() => setSetOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <Segmented options={tabsWithBadge} value={tab} onChange={setTab} ariaLabel="Section" />
        </div>

        <div className="mt-6">
          {tab === 'today' && (
            <TodayTab st={st} due={due} today={today} colorOf={colorOf}
                      reviewing={reviewing} setReviewing={setReviewing} flash={flash}
                      onAdd={() => setAddOpen(true)} />
          )}
          {tab === 'schedule' && <ScheduleTab st={st} today={today} colorOf={colorOf} flash={flash} />}
          {tab === 'exams' && <ExamsTab st={st} today={today} colorOf={colorOf} />}
          {tab === 'progress' && <ProgressTab st={st} today={today} theme={theme} onExport={exportCSV} />}
        </div>

        <footer className="mt-12 flex items-center justify-center gap-5 text-[13px] text-[var(--stu-muted)]">
          <Link to={LEDGER_PATH} className="inline-flex items-center gap-1.5 hover:text-[var(--stu-text)] transition-colors">Ledger <S.arrowUR className="w-3.5 h-3.5" /></Link>
          <Link to={PORTFOLIO_PATH} className="inline-flex items-center gap-1.5 hover:text-[var(--stu-text)] transition-colors">Portfolio <S.arrowUR className="w-3.5 h-3.5" /></Link>
        </footer>
      </main>

      {/* The capture button. Everything about this app starts here. */}
      {!reviewing && (
        <button type="button" onClick={() => setAddOpen(true)} aria-label="Log what I learnt"
          className="fixed z-[90] bottom-6 right-5 sm:bottom-8 sm:right-8 rounded-full grid place-items-center
                     bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] shadow-[0_10px_30px_-8px_rgba(182,240,60,0.75)]
                     transition-transform duration-200 hover:scale-105 active:scale-95"
          style={{ width: 60, height: 60 }}>
          <S.plus className="w-7 h-7" />
        </button>
      )}

      <AddSheet key={`add-${addOpen}`} open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd}
                subjects={st.subjects} theme={theme} />
      <SettingsSheet key={`set-${setOpen}`} open={setOpen} onClose={() => setSetOpen(false)} st={st}
                     theme={theme} onExport={exportCSV} />
      <SuccessBurst show={Boolean(burst)} label={burst || ''} />
    </>
  )
}

function TopBar({ theme, setTheme, onSettings }) {
  return (
    <header className="fixed top-0 inset-x-0 z-[80] stu-topbar backdrop-blur-md border-b border-[var(--stu-line)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] grid place-items-center">
            <S.brain className="w-4 h-4" />
          </span>
          <span className="font-display font-extrabold tracking-tight truncate">Revision</span>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <S.sun className="w-[18px] h-[18px]" /> : <S.moon className="w-[18px] h-[18px]" />}
          </IconBtn>
          <IconBtn label="Settings" onClick={onSettings}><S.gear className="w-[18px] h-[18px]" /></IconBtn>
          <Link to={LEDGER_PATH}
            className="ml-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--stu-text)] text-[var(--stu-bg)]
                       font-display font-semibold text-[13px] transition-transform duration-200 hover:scale-[1.03] active:scale-95">
            Ledger <S.arrowUR className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ============================================================
   TODAY — the zero-friction loop
   ============================================================ */
function TodayTab({ st, due, today, colorOf, reviewing, setReviewing, flash, onAdd }) {
  const doneToday = reviewsOn(st.topics, today)
  const learntToday = st.topics.filter((t) => t.date === today)
  const toPreview = useMemo(() => previewQueue(st.schedule, PREVIEW_LEAD_DAYS, today), [st.schedule, today])
  const next = nextClass(st.schedule, today)

  const openGoals = useMemo(
    () => st.topics
      .filter((t) => !t.archived && (t.goals || []).some((g) => !g.done))
      .slice(0, 6),
    [st.topics],
  )

  if (reviewing) {
    return <ReviewSession st={st} today={today} colorOf={colorOf} onExit={() => setReviewing(false)} flash={flash} />
  }

  return (
    <div className="space-y-4">
      {/* ---------- The one thing to do now ---------- */}
      <section className="stu-card p-5 sm:p-7 stu-reveal" aria-labelledby="due-h">
        <h1 id="due-h" className="text-[12px] font-mono uppercase tracking-[0.14em] text-[var(--stu-muted)]">Due now</h1>
        <p className="mt-1.5 font-display font-extrabold tracking-tight text-[clamp(2.1rem,9vw,3.2rem)] tabular-nums leading-none">
          {due.length}
        </p>
        <p className="mt-2 text-[13px] text-[var(--stu-muted)]">
          {due.length === 0
            ? doneToday > 0
              ? `Nothing left. ${doneToday} ${doneToday === 1 ? 'review' : 'reviews'} done today.`
              : 'Nothing is due. Log something you learnt and it schedules itself.'
            : <>
                {due.filter((t) => isOverdue(t, today)).length > 0
                  ? `${due.filter((t) => isOverdue(t, today)).length} of them are overdue. `
                  : ''}
                About {Math.max(1, Math.round(due.length * 0.4))} minutes.
              </>}
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button type="button" onClick={() => setReviewing(true)} disabled={due.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold text-[15px]
                       bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] disabled:opacity-40 disabled:cursor-not-allowed
                       transition-transform duration-200 active:scale-[0.98]">
            <S.play className="w-4 h-4" /> {due.length ? 'Start review' : 'All caught up'}
          </button>
          <button type="button" onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-display font-semibold text-[15px]
                       border border-[var(--stu-line)] hover:border-[var(--stu-text-2)] transition-colors">
            <S.plus className="w-4 h-4" /> I learnt something
          </button>
        </div>
        {doneToday > 0 && due.length > 0 && (
          <p className="mt-3 text-[12.5px] text-[var(--stu-muted)]">{doneToday} already done today.</p>
        )}
      </section>

      {/* ---------- Preview before class ---------- */}
      {(toPreview.length > 0 || next) && (
        <section className="stu-card p-5 sm:p-6 stu-reveal" aria-labelledby="prev-h">
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 id="prev-h" className="font-display font-bold text-base">Preview before class</h2>
            {next && (
              <span className="text-[12px] font-mono text-[var(--stu-muted)]">
                Next class {relativeDay(next.date, today).toLowerCase()}
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">
            Walking in having already seen the material is what makes the lecture a second pass instead of a first.
          </p>
          {toPreview.length === 0
            ? <p className="text-[13px] text-[var(--stu-muted)] py-3">Nothing to preview in the next {PREVIEW_LEAD_DAYS} days.</p>
            : (
              <ul className="space-y-2">
                {toPreview.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--stu-surface-2)] stu-row">
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-semibold text-[14px] truncate">{it.title}</span>
                      <span className="flex items-center gap-2 mt-0.5">
                        <SubjectTag subject={subjectById(st.subjects, it.subject)} color={colorOf(it.subject)} />
                        <span className="text-[11.5px] text-[var(--stu-muted)]">{relativeDay(it.date, today)}</span>
                      </span>
                    </span>
                    <button type="button"
                      onClick={() => {
                        st.updateScheduleItem(it.id, { previewed: true })
                        st.addTopic({ title: it.title, subject: it.subject, source: 'preview', scheduleId: it.id, note: it.note })
                        flash('Previewed')
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-xl text-[12.5px] font-display font-semibold
                                 bg-[var(--stu-text)] text-[var(--stu-bg)] transition-transform active:scale-95">
                      Previewed
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </section>
      )}

      {/* ---------- Core concepts to understand ---------- */}
      {openGoals.length > 0 && (
        <section className="stu-card p-5 sm:p-6 stu-reveal" aria-labelledby="goal-h">
          <h2 id="goal-h" className="font-display font-bold text-base mb-1">Core concepts to nail</h2>
          <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">The specific things you said you needed to understand. Tick one when it clicks.</p>
          <ul className="space-y-4">
            {openGoals.map((t) => (
              <li key={t.id}>
                <div className="flex items-center gap-2 mb-2">
                  <SubjectTag subject={subjectById(st.subjects, t.subject)} color={colorOf(t.subject)} />
                  <span className="text-[13px] font-display font-semibold truncate">{t.title}</span>
                  <span className="text-[11.5px] font-mono text-[var(--stu-muted)] shrink-0 ml-auto">
                    {goalProgress(t).done}/{goalProgress(t).total}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {(t.goals || []).map((g) => (
                    <li key={g.id}>
                      <button type="button" onClick={() => st.toggleGoal(t.id, g.id)}
                        className="flex items-start gap-2.5 text-left w-full group">
                        <span className={`mt-[2px] w-[18px] h-[18px] rounded-md border grid place-items-center shrink-0 transition-colors
                          ${g.done ? 'bg-[var(--stu-accent)] border-[var(--stu-accent)] text-[var(--stu-accent-ink)]' : 'border-[var(--stu-line)] group-hover:border-[var(--stu-text-2)]'}`}>
                          {g.done && <S.check className="w-3 h-3" />}
                        </span>
                        <span className={`text-[13.5px] leading-snug ${g.done ? 'line-through text-[var(--stu-muted)]' : 'text-[var(--stu-text-2)]'}`}>{g.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Logged today ---------- */}
      <section className="stu-card p-5 sm:p-6 stu-reveal" aria-labelledby="learnt-h">
        <h2 id="learnt-h" className="font-display font-bold text-base mb-1">Learnt today</h2>
        <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">Each one already has its next repetition booked.</p>
        {learntToday.length === 0
          ? <Empty icon={S.spark} title="Nothing logged yet today">Tap the + button the moment something lands. A title is enough — you can fill in the rest later.</Empty>
          : (
            <ul className="divide-y divide-[var(--stu-line)]">
              {learntToday.map((t) => (
                <TopicRow key={t.id} t={t} subject={subjectById(st.subjects, t.subject)} color={colorOf(t.subject)}
                          today={today} onDelete={() => st.removeTopic(t.id)} />
              ))}
            </ul>
          )}
      </section>
    </div>
  )
}

function TopicRow({ t, subject, color, today, onDelete }) {
  const m = maturityOf(t)
  return (
    <li className="flex items-center gap-3 py-3 stu-row group">
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium truncate">{t.title}</span>
        <span className="flex items-center gap-2 mt-0.5 flex-wrap">
          <SubjectTag subject={subject} color={color} />
          <span className="text-[11.5px] text-[var(--stu-muted)]">
            {t.status === 'preview' ? 'Previewed — not yet reviewed' : `Next ${relativeDay(t.srs.due, today).toLowerCase()}`}
          </span>
          {isLeech(t) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider" style={{ color: STATUS.critical }}>
              <S.undo className="w-3 h-3" /> rewrite this
            </span>
          )}
        </span>
      </span>
      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)] shrink-0 hidden sm:inline">{MATURITY[m].label}</span>
      <button type="button" onClick={onDelete} aria-label={`Delete ${t.title}`}
        className="p-1.5 rounded-lg text-[var(--stu-muted)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-[#d03b3b] transition-all">
        <S.trash className="w-4 h-4" />
      </button>
    </li>
  )
}

/* ============================================================
   The review session
   Show the prompt, reveal, grade with one key. "Again" sends the
   topic to the back of this session's queue rather than ending
   it — a blank is exactly the thing you should see twice today.
   ============================================================ */
function ReviewSession({ st, today, colorOf, onExit, flash }) {
  // The queue is snapshotted when the session opens, so topics that fall due
  // while you are mid-session wait for the next one instead of growing the
  // pile under you. `initial` is kept only to size the progress bar.
  const [initial] = useState(() => dueTopics(st.topics, today).map((t) => t.id))
  const [queue, setQueue] = useState(initial)
  const [shown, setShown] = useState(false)
  const [done, setDone] = useState(0)

  const topic = st.topics.find((t) => t.id === queue[0]) || null
  const intervals = topic ? previewIntervals(topic.srs, today) : null

  function answer(gradeId) {
    if (!topic) return
    st.reviewTopic(topic.id, gradeId)
    setDone((n) => n + 1)
    setShown(false)
    setQueue((q) => (gradeId === 'again' ? [...q.slice(1), q[0]] : q.slice(1)))
  }

  /* Keyboard is the whole point of "zero friction": space to reveal,
     1-4 to answer, without ever reaching for the mouse.
     The handler is reached through a ref so the listener is bound once per
     card rather than re-bound on every render. */
  const answerRef = useRef(answer)
  useEffect(() => { answerRef.current = answer })

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') { onExit(); return }
      if (!shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); setShown(true); return }
      if (shown) {
        const g = GRADES.find((x) => x.key === e.key)
        if (g) { e.preventDefault(); answerRef.current(g.id) }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); answerRef.current('good') }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, onExit])

  if (!topic) {
    return (
      <section className="stu-card p-6 sm:p-10 text-center stu-reveal">
        <span className="w-14 h-14 rounded-2xl mx-auto grid place-items-center bg-[var(--stu-accent-soft)] text-[var(--stu-accent-ink)]">
          <S.check className="w-7 h-7" style={{ color: STATUS.good }} />
        </span>
        <h2 className="mt-4 font-display font-extrabold text-2xl">Session done</h2>
        <p className="mt-2 text-[14px] text-[var(--stu-muted)]">
          {done} {done === 1 ? 'review' : 'reviews'} answered. Everything is rescheduled.
        </p>
        <button type="button" onClick={onExit}
          className="mt-6 px-6 py-3.5 rounded-2xl font-display font-bold text-[15px] bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] transition-transform active:scale-[0.98]">
          Back to today
        </button>
      </section>
    )
  }

  const subject = subjectById(st.subjects, topic.subject)
  const total = Math.max(initial.length, done + queue.length)
  const pct = total ? (done / total) * 100 : 0

  return (
    <section className="stu-reveal" aria-labelledby="rev-h">
      {/* Progress + exit */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--stu-surface-2)] overflow-hidden">
          <span className="block h-full rounded-full bg-[var(--stu-accent)]" style={{ width: `${pct}%`, transition: 'width 0.3s ease' }} />
        </div>
        <span className="text-[12px] font-mono tabular-nums text-[var(--stu-muted)] shrink-0">{done}/{total}</span>
        <IconBtn label="End session" onClick={onExit}><S.close className="w-[18px] h-[18px]" /></IconBtn>
      </div>

      <div className="stu-card p-6 sm:p-8 min-h-[19rem] flex flex-col">
        <div className="flex items-center gap-2 flex-wrap">
          <SubjectTag subject={subject} color={colorOf(topic.subject)} />
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)]">
            {MATURITY[maturityOf(topic)].label}
          </span>
          {isOverdue(topic, today) && (
            <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: STATUS.serious }}>
              {daysBetween(topic.srs.due, today)}d late
            </span>
          )}
        </div>

        <h2 id="rev-h" className="mt-4 font-display font-extrabold text-[clamp(1.4rem,5vw,2rem)] leading-tight text-balance">
          {topic.title}
        </h2>

        {!shown ? (
          <div className="mt-auto pt-8">
            <p className="text-[13px] text-[var(--stu-muted)] mb-4">
              Say it out loud first, then check. Retrieving it is what moves it — recognising it does not.
            </p>
            <button type="button" onClick={() => setShown(true)}
              className="w-full py-4 rounded-2xl font-display font-bold text-[15px] bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] transition-transform active:scale-[0.99]">
              Show it <span className="font-mono text-[12px] opacity-70 ml-1">space</span>
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex-1">
              {topic.note
                ? <p className="text-[14.5px] leading-relaxed text-[var(--stu-text-2)] whitespace-pre-wrap">{topic.note}</p>
                : <p className="text-[13.5px] text-[var(--stu-muted)] italic">No note on this one — grade yourself on what you could recall.</p>}
              {(topic.goals || []).length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {topic.goals.map((g) => (
                    <li key={g.id} className="flex items-start gap-2 text-[13.5px] text-[var(--stu-text-2)]">
                      <S.target className="w-3.5 h-3.5 mt-1 shrink-0 text-[var(--stu-muted)]" />
                      <span className={g.done ? 'line-through text-[var(--stu-muted)]' : ''}>{g.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button key={g.id} type="button" onClick={() => answer(g.id)}
                  className="py-3 px-2 rounded-2xl border border-[var(--stu-line)] hover:border-transparent transition-all duration-150
                             flex flex-col items-center gap-0.5 group"
                  style={{ borderColor: undefined }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${g.tint}1a`; e.currentTarget.style.borderColor = g.tint }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '' }}>
                  <span className="font-display font-bold text-[14px]" style={{ color: g.tint }}>{g.label}</span>
                  <span className="text-[11.5px] font-mono tabular-nums text-[var(--stu-text-2)]">
                    {g.id === 'again' ? 'again today' : fmtInterval(intervals[g.id])}
                  </span>
                  <span className="text-[10.5px] font-mono text-[var(--stu-muted)]">{g.key}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[12px] text-[var(--stu-muted)]">
          <span className="font-mono">1</span>–<span className="font-mono">4</span> to answer · <span className="font-mono">esc</span> to stop
        </p>
        <button type="button"
          onClick={() => { st.removeTopic(topic.id); setQueue((q) => q.slice(1)); setShown(false); flash('Removed') }}
          className="text-[12px] text-[var(--stu-muted)] hover:text-[#d03b3b] transition-colors">
          Delete this topic
        </button>
      </div>
    </section>
  )
}

/* ============================================================
   SCHEDULE — drag the teaching plan, dates follow
   ============================================================ */
function ScheduleTab({ st, today, colorOf, flash }) {
  const [addOpen, setAddOpen] = useState(false)
  const { classDays, termStart } = st.settings
  const next = nextClass(st.schedule, today)

  function toggleDay(d) {
    const set = new Set(classDays)
    if (set.has(d)) set.delete(d); else set.add(d)
    st.saveSettings({ classDays: [...set].sort((a, b) => a - b) })
  }

  return (
    <div className="space-y-4">
      <section className="stu-card p-5 sm:p-6 stu-reveal" aria-labelledby="term-h">
        <h2 id="term-h" className="font-display font-bold text-base mb-1">Your class week</h2>
        <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">
          Set the days you have this class and when term starts. Every topic below is then dated onto the next free
          slot — so when you drag one, everything under it re-dates itself.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Class days" group>
            <div className="flex flex-wrap gap-1.5">
              {DAY_NAMES.map((n, d) => (
                <button key={d} type="button" onClick={() => toggleDay(d)} aria-pressed={classDays.includes(d)}
                  className={`w-11 py-2 rounded-xl text-[12.5px] font-display font-semibold border transition-all
                    ${classDays.includes(d)
                      ? 'bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] border-transparent'
                      : 'bg-[var(--stu-surface-2)] border-[var(--stu-line)] text-[var(--stu-text-2)] hover:border-[var(--stu-text-2)]'}`}>
                  {n}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Term starts">
            <input type="date" value={termStart} onChange={(e) => st.saveSettings({ termStart: e.target.value })} className={inputCls} />
          </Field>
        </div>
        {next && (
          <p className="mt-4 flex items-center gap-2 text-[13px] text-[var(--stu-text-2)]">
            <S.cal className="w-4 h-4 text-[var(--stu-muted)]" />
            Next up: <strong className="font-display font-semibold">{next.title}</strong>
            <span className="text-[var(--stu-muted)]">· {relativeDay(next.date, today)}</span>
          </p>
        )}
      </section>

      <section className="stu-card p-5 sm:p-6 stu-reveal" aria-labelledby="plan-h">
        <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
          <h2 id="plan-h" className="font-display font-bold text-base">Teaching plan</h2>
          <button type="button" onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-display font-semibold
                       border border-[var(--stu-line)] hover:border-[var(--stu-text-2)] transition-colors">
            <S.plus className="w-3.5 h-3.5" /> Add topic
          </button>
        </div>
        <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">
          Drag a row to move it — on a phone too. Use the arrows if you would rather not drag.
        </p>

        {st.schedule.length === 0
          ? <Empty icon={S.cal} title="No teaching plan yet">Paste in the topics your lecturer is covering, in order. The dates take care of themselves.</Empty>
          : (
            <DragList items={st.schedule} onReorder={st.reorderSchedule} renderItem={(it, i, { moveUp, moveDown }) => (
              <div className="flex items-center gap-2.5 p-3">
                <span data-drag-handle className="p-1 -ml-1 text-[var(--stu-muted)] cursor-grab active:cursor-grabbing shrink-0" aria-hidden="true">
                  <S.grip className="w-4 h-4" />
                </span>
                <span className="w-6 shrink-0 text-[12px] font-mono tabular-nums text-[var(--stu-muted)]">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-display font-semibold text-[14px] truncate ${it.taught ? 'text-[var(--stu-muted)] line-through' : ''}`}>
                    {it.title}
                  </span>
                  <span className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <SubjectTag subject={subjectById(st.subjects, it.subject)} color={colorOf(it.subject)} />
                    <span className="text-[11.5px] font-mono text-[var(--stu-muted)]">
                      {it.date ? `${fmtDay(it.date, { weekday: 'short', day: 'numeric', month: 'short' })}` : 'unscheduled'}
                    </span>
                    {it.previewed && (
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)]">previewed</span>
                    )}
                  </span>
                </span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <IconBtn label="Move up" onClick={moveUp} disabled={!moveUp}><S.up className="w-4 h-4" /></IconBtn>
                  <IconBtn label="Move down" onClick={moveDown} disabled={!moveDown}><S.down className="w-4 h-4" /></IconBtn>
                  {!it.taught && (
                    <button type="button"
                      onClick={() => {
                        st.updateScheduleItem(it.id, { taught: true })
                        st.addTopic({ title: it.title, subject: it.subject, source: 'class', scheduleId: it.id, note: it.note })
                        flash('Added to revision')
                      }}
                      className="ml-1 px-3 py-1.5 rounded-lg text-[12px] font-display font-semibold bg-[var(--stu-text)] text-[var(--stu-bg)] transition-transform active:scale-95">
                      Taught
                    </button>
                  )}
                  <IconBtn label={`Remove ${it.title}`} onClick={() => st.removeScheduleItem(it.id)}><S.trash className="w-4 h-4" /></IconBtn>
                </span>
              </div>
            )} />
          )}
      </section>

      <ScheduleAddSheet key={`sa-${addOpen}`} open={addOpen} onClose={() => setAddOpen(false)} subjects={st.subjects}
        onSubmit={(rows) => {
          setAddOpen(false)
          rows.forEach((r) => st.addScheduleItem(r))
          flash(`${rows.length} added`)
        }} />
    </div>
  )
}

/* ============================================================
   EXAMS
   ============================================================ */
function ExamsTab({ st, today, colorOf }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const list = upcomingExams(st.exams, today)
  const past = st.exams.filter((e) => e.date < today).sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="space-y-4">
      <section className="stu-card p-5 sm:p-6 stu-reveal">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display font-bold text-base">Exams</h2>
            <p className="text-[12.5px] text-[var(--stu-muted)] mt-0.5">
              Readiness counts a topic only once you hold it and it is not falling due before the paper.
            </p>
          </div>
          <button type="button" onClick={() => { setEditing(null); setOpen(true) }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-display font-semibold
                       border border-[var(--stu-line)] hover:border-[var(--stu-text-2)] transition-colors">
            <S.plus className="w-3.5 h-3.5" /> Add exam
          </button>
        </div>
      </section>

      {list.length === 0 && past.length === 0 && (
        <section className="stu-card p-5 sm:p-6 stu-reveal">
          <Empty icon={S.cap} title="No exams yet">Add one with its date and the topics it covers, and you get a countdown, a readiness score and a worst-first cram list.</Empty>
        </section>
      )}

      {list.map((e) => (
        <ExamCard key={e.id} exam={e} st={st} today={today} colorOf={colorOf}
                  onEdit={() => { setEditing(e); setOpen(true) }} />
      ))}

      {past.length > 0 && (
        <section className="stu-card p-5 sm:p-6 stu-reveal">
          <h2 className="font-display font-bold text-base mb-3">Sat already</h2>
          <ul className="divide-y divide-[var(--stu-line)]">
            {past.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5 group">
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium truncate">{e.title}</span>
                  <SubjectTag subject={subjectById(st.subjects, e.subject)} color={colorOf(e.subject)} />
                </span>
                <span className="text-[12px] font-mono text-[var(--stu-muted)] shrink-0">{fmtDay(e.date)}</span>
                <button type="button" onClick={() => st.removeExam(e.id)} aria-label={`Delete ${e.title}`}
                  className="p-1.5 rounded-lg text-[var(--stu-muted)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-[#d03b3b] transition-all">
                  <S.trash className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ExamSheet key={`ex-${open}-${editing?.id || 'new'}`} open={open} onClose={() => setOpen(false)}
        exam={editing} subjects={st.subjects} topics={st.topics} colorOf={colorOf}
        onSubmit={(draft) => {
          setOpen(false)
          if (editing) st.updateExam(editing.id, draft); else st.addExam(draft)
        }}
        onDelete={editing ? () => { setOpen(false); st.removeExam(editing.id) } : null} />
    </div>
  )
}

function ExamCard({ exam, st, today, colorOf, onEdit }) {
  const r = examReadiness(exam, st.topics, today)
  const cram = cramList(exam, st.topics)
  // Status, not a series colour — and it always ships with the word beside it.
  const tone = r.pct >= 80 ? STATUS.good : r.pct >= 50 ? STATUS.warning : r.days <= 7 ? STATUS.critical : STATUS.serious
  const word = r.pct >= 80 ? 'Ready' : r.pct >= 50 ? 'Getting there' : 'Behind'

  return (
    <section className="stu-card p-5 sm:p-6 stu-reveal">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg truncate">{exam.title}</h3>
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            <SubjectTag subject={subjectById(st.subjects, exam.subject)} color={colorOf(exam.subject)} />
            <span className="text-[12.5px] text-[var(--stu-muted)]">
              {fmtDay(exam.date, { weekday: 'short', day: 'numeric', month: 'long' })}
            </span>
            <span className="text-[12.5px] font-display font-semibold" style={{ color: r.days <= 7 ? STATUS.critical : 'var(--stu-text-2)' }}>
              {r.days === 0 ? 'Today' : r.days === 1 ? 'Tomorrow' : `${r.days} days`}
            </span>
          </div>
        </div>
        <IconBtn label={`Edit ${exam.title}`} onClick={onEdit}><S.pencil className="w-[18px] h-[18px]" /></IconBtn>
      </div>

      {r.total === 0 ? (
        <p className="text-[13px] text-[var(--stu-muted)] py-4">No topics linked yet. Edit the exam and tick what it covers.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Ring pct={r.pct} tone={tone} label={word} sub={`${r.solid} of ${r.total} topics held`} />
            <ul className="grid grid-cols-3 gap-x-6 gap-y-1">
              <Stat label="Held" value={r.solid} />
              <Stat label="Shaky" value={r.shaky} />
              <Stat label="Weak" value={r.weak} tone={r.weak ? STATUS.critical : undefined} />
            </ul>
          </div>

          {cram.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[var(--stu-line)]">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)] mb-2.5">
                Revise in this order
              </h4>
              <ul className="space-y-1.5">
                {cram.slice(0, 8).map(({ topic, maturity }) => (
                  <li key={topic.id} className="flex items-center gap-2.5 text-[13.5px]">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tone }} aria-hidden="true" />
                    <span className="truncate flex-1">{topic.title}</span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)] shrink-0">
                      {/* A topic you already hold only earns a place here by
                          falling due before the paper — say so, or "known"
                          beside "revise this" reads as a contradiction. */}
                      {maturity === 'mature' ? 'review due' : MATURITY[maturity].label}
                    </span>
                  </li>
                ))}
              </ul>
              {cram.length > 8 && <p className="mt-2 text-[12px] text-[var(--stu-muted)]">and {cram.length - 8} more.</p>}
            </div>
          )}
        </>
      )}
    </section>
  )
}

/* ============================================================
   PROGRESS — the dashboard
   ============================================================ */
function ProgressTab({ st, today, theme, onExport }) {
  const active = st.topics.filter((t) => !t.archived)
  const counts = useMemo(() => maturityCounts(st.topics), [st.topics])
  const days = useMemo(() => forecast(st.topics, FORECAST_DAYS, today), [st.topics, today])
  const heat = useMemo(() => reviewHeatmap(st.topics, HEATMAP_WEEKS, today), [st.topics, today])
  const run = useMemo(() => streak(st.topics, today), [st.topics, today])
  const ret = useMemo(() => retention(st.topics, 30, today), [st.topics, today])
  const subjects = useMemo(
    () => subjectProgress(st.topics, st.subjects.map((s) => ({ ...s, color: seriesColor(s.slot, theme) }))),
    [st.topics, st.subjects, theme],
  )
  const doneToday = reviewsOn(st.topics, today)

  if (!active.length) {
    return (
      <section className="stu-card p-5 sm:p-6 stu-reveal">
        <Empty icon={S.layers} title="Nothing to measure yet">Log a few topics and this fills in: what you hold, what is slipping, and how much is coming at you this fortnight.</Empty>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <section className="stu-card p-5 sm:p-6 stu-reveal">
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Topics" value={active.length} sub="being tracked" />
          <Stat label="Known" value={counts.mature} sub={`${active.length ? Math.round((counts.mature / active.length) * 100) : 0}% of them`} />
          <Stat label="Streak" value={run} sub={run === 1 ? 'day' : 'days'} tone={run >= 3 ? STATUS.good : undefined} />
          <Stat label="Recall" value={ret.pct === null ? '—' : `${ret.pct.toFixed(0)}%`} sub="last 30 days" />
        </ul>
        {doneToday > 0 && (
          <p className="mt-4 pt-4 border-t border-[var(--stu-line)] text-[13px] text-[var(--stu-text-2)]">
            <strong className="font-display font-semibold">{doneToday}</strong> {doneToday === 1 ? 'review' : 'reviews'} done today.
          </p>
        )}
      </section>

      <section className="stu-card p-5 sm:p-6 stu-reveal" aria-labelledby="mat-h">
        <h2 id="mat-h" className="font-display font-bold text-base mb-1">How well it is holding</h2>
        <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">
          A topic moves up a band by surviving a longer and longer gap. "Known" means you last recalled it after three
          weeks or more.
        </p>
        <MaturityBar counts={counts} theme={theme} />
      </section>

      <section className="stu-card p-5 sm:p-6 stu-reveal" aria-labelledby="fore-h">
        <h2 id="fore-h" className="font-display font-bold text-base mb-1">Coming at you</h2>
        <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">Reviews falling due over the next {FORECAST_DAYS} days. Today's bar is ringed.</p>
        <ForecastBars days={days} theme={theme} />
      </section>

      {/* Paired from the tablet up: the heatmap wants a narrower column than
          a full-width card gives it, or the squares float in empty space. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start stu-reveal">
        <section className="stu-card p-5 sm:p-6" aria-labelledby="heat-h">
          <h2 id="heat-h" className="font-display font-bold text-base mb-1">Every day you turned up</h2>
          <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">One square per day, darker where you did more.</p>
          <Heatmap cells={heat.cells} max={heat.max} theme={theme} weeks={HEATMAP_WEEKS} />
        </section>

        <section className="stu-card p-5 sm:p-6" aria-labelledby="subj-h">
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <h2 id="subj-h" className="font-display font-bold text-base">By subject</h2>
            <button type="button" onClick={onExport}
              className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase tracking-wider text-[var(--stu-muted)] hover:text-[var(--stu-text)] transition-colors">
              <S.download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          <p className="text-[12.5px] text-[var(--stu-muted)] mb-4">The bar is the share of that subject you now hold.</p>
          <RankedBars rows={subjects.filter((s) => s.total > 0)} emptyText="No topics logged against a subject yet." />
        </section>
      </div>
    </div>
  )
}

/* ============================================================
   Sheets
   ============================================================ */

/* The capture sheet. Title is the only required field, and it is
   focused the moment the sheet opens — everything else has a
   sensible default so "save" is always one tap away. */
function AddSheet({ open, onClose, onSubmit, subjects, theme }) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState(subjects[0]?.id || '')
  const [source, setSource] = useState('class')
  const [note, setNote] = useState('')
  const [goals, setGoals] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Give it a title — even a rough one.'); return }
    onSubmit({
      title: title.trim(),
      subject, source, date,
      note: note.trim(),
      goals: goals.split('\n').map((g) => g.trim()).filter(Boolean)
        .map((text, i) => ({ id: `g${i}_${Math.random().toString(36).slice(2, 7)}`, text, done: false })),
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title="What did you learn?" labelledBy="add-title">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Topic">
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus maxLength={140}
            placeholder="e.g. LC-3 interrupt handling" aria-label="Topic"
            className="w-full px-4 py-3.5 rounded-2xl bg-[var(--stu-surface-2)] border border-[var(--stu-line)]
                       font-display font-bold text-lg outline-none focus:border-[var(--stu-accent)] focus:ring-2 focus:ring-[var(--stu-ring)] transition" />
        </Field>

        <Field label="Subject" group>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button key={s.id} type="button" onClick={() => setSubject(s.id)} aria-pressed={subject === s.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] border transition-all duration-200
                  ${subject === s.id ? 'bg-[var(--stu-text)] text-[var(--stu-bg)] border-transparent' : 'border-[var(--stu-line)] text-[var(--stu-text-2)] hover:border-[var(--stu-text-2)]'}`}>
                <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: seriesColor(s.slot, theme) }} aria-hidden="true" />
                {s.code}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Where from" group>
          <div className="grid grid-cols-3 gap-2">
            {SOURCE_IDS.map((id) => (
              <button key={id} type="button" onClick={() => setSource(id)} aria-pressed={source === id}
                className={`py-2.5 rounded-xl font-display font-semibold text-[13px] border transition-all duration-200
                  ${source === id ? 'bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] border-transparent' : 'bg-[var(--stu-surface-2)] border-[var(--stu-line)] text-[var(--stu-text-2)] hover:text-[var(--stu-text)]'}`}>
                {SOURCES[id].short}
              </button>
            ))}
          </div>
        </Field>

        <Field label="The bit you want to recall (optional)"
               hint="This is what you see when the card comes back. A worked line or the sentence you would say out loud beats a paragraph.">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1200}
            placeholder="e.g. Push PSR then PC, set priority, vector table at x0100…"
            className={`${inputCls} resize-y leading-relaxed`} />
        </Field>

        <Field label="Core concepts to understand (optional)" hint="One per line. They become tick-boxes on the Today screen.">
          <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} maxLength={800}
            placeholder={'Why the PSR must be saved first\nWhat happens on a nested interrupt'}
            className={`${inputCls} resize-y leading-relaxed`} />
        </Field>

        <Field label="Learnt on">
          <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>

        {error && <p role="alert" className="text-sm" style={{ color: STATUS.critical }}>{error}</p>}

        <button type="submit"
          className="w-full py-4 rounded-2xl font-display font-bold text-[15px] bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] transition-transform duration-200 active:scale-[0.99]">
          Save and schedule it
        </button>
      </form>
    </Sheet>
  )
}

/* Bulk entry, because a syllabus arrives as a list, not one at a time. */
function ScheduleAddSheet({ open, onClose, onSubmit, subjects }) {
  const [text, setText] = useState('')
  const [subject, setSubject] = useState(subjects[0]?.id || '')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const rows = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!rows.length) { setError('Add at least one topic.'); return }
    onSubmit(rows.map((title) => ({ title, subject })))
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add to the teaching plan" labelledBy="sa-title">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Subject">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
          </select>
        </Field>
        <Field label="Topics, in teaching order" hint="One per line. Paste the syllabus straight in — each line lands on the next class date.">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} autoFocus
            placeholder={'Number representation\nCombinational logic\nSequential logic\nState machines'}
            className={`${inputCls} resize-y leading-relaxed font-mono text-[13px]`} />
        </Field>
        {error && <p role="alert" className="text-sm" style={{ color: STATUS.critical }}>{error}</p>}
        <button type="submit"
          className="w-full py-4 rounded-2xl font-display font-bold text-[15px] bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] transition-transform active:scale-[0.99]">
          Add to plan
        </button>
      </form>
    </Sheet>
  )
}

function ExamSheet({ open, onClose, onSubmit, onDelete, exam, subjects, topics, colorOf }) {
  const [title, setTitle] = useState(exam?.title || '')
  const [subject, setSubject] = useState(exam?.subject || subjects[0]?.id || '')
  const [date, setDate] = useState(exam?.date || todayISO())
  const [picked, setPicked] = useState(() => new Set(exam?.topics || []))
  const [error, setError] = useState('')

  // Default to the topics of the subject being examined — usually right,
  // and always faster than ticking twenty boxes.
  const candidates = topics.filter((t) => !t.archived && (!subject || t.subject === subject))

  function toggle(id) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Give the exam a name.'); return }
    onSubmit({ title: title.trim(), subject, date, topics: [...picked] })
  }

  return (
    <Sheet open={open} onClose={onClose} title={exam ? 'Edit exam' : 'Add an exam'} labelledBy="ex-title">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Name">
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus maxLength={100}
            placeholder="e.g. ECE 220 Midterm 2" className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Subject">
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label={`Topics it covers (${picked.size} picked)`} group>
          {candidates.length === 0
            ? <p className="text-[13px] text-[var(--stu-muted)] py-2">No topics logged for this subject yet.</p>
            : (
              <>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setPicked(new Set(candidates.map((t) => t.id)))}
                    className="text-[12px] font-mono uppercase tracking-wider text-[var(--stu-muted)] hover:text-[var(--stu-text)] underline underline-offset-4">All</button>
                  <button type="button" onClick={() => setPicked(new Set())}
                    className="text-[12px] font-mono uppercase tracking-wider text-[var(--stu-muted)] hover:text-[var(--stu-text)] underline underline-offset-4">None</button>
                </div>
                <ul className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {candidates.map((t) => (
                    <li key={t.id}>
                      <button type="button" onClick={() => toggle(t.id)}
                        className="flex items-start gap-2.5 text-left w-full p-2 rounded-xl hover:bg-[var(--stu-surface-2)] transition-colors group">
                        <span className={`mt-[2px] w-[18px] h-[18px] rounded-md border grid place-items-center shrink-0 transition-colors
                          ${picked.has(t.id) ? 'bg-[var(--stu-accent)] border-[var(--stu-accent)] text-[var(--stu-accent-ink)]' : 'border-[var(--stu-line)] group-hover:border-[var(--stu-text-2)]'}`}>
                          {picked.has(t.id) && <S.check className="w-3 h-3" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13.5px] truncate">{t.title}</span>
                          <span className="flex items-center gap-2">
                            <SubjectTag subject={subjects.find((s) => s.id === t.subject)} color={colorOf(t.subject)} />
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--stu-muted)]">{MATURITY[maturityOf(t)].label}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
        </Field>

        {error && <p role="alert" className="text-sm" style={{ color: STATUS.critical }}>{error}</p>}

        <div className="flex gap-2">
          {onDelete && (
            <button type="button" onClick={onDelete}
              className="px-5 py-4 rounded-2xl font-display font-semibold text-[15px] border border-[var(--stu-line)] hover:border-[#d03b3b] hover:text-[#d03b3b] transition-colors">
              Delete
            </button>
          )}
          <button type="submit"
            className="flex-1 py-4 rounded-2xl font-display font-bold text-[15px] bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] transition-transform active:scale-[0.99]">
            {exam ? 'Save changes' : 'Add exam'}
          </button>
        </div>
      </form>
    </Sheet>
  )
}

function SettingsSheet({ open, onClose, st, theme, onExport }) {
  const [rows, setRows] = useState(st.subjects)
  const [goal, setGoal] = useState(st.settings.dailyGoal)

  function addSubject() {
    setRows((r) => [...r, { id: `s_${Date.now().toString(36)}`, code: '', name: '', slot: r.length % SERIES.length }])
  }
  function save() {
    st.setSubjects(rows.filter((r) => r.code.trim()).map((r) => ({ ...r, code: r.code.trim(), name: r.name.trim() })))
    st.saveSettings({ dailyGoal: Number(goal) || 10 })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Settings" labelledBy="set-title">
      <div className="space-y-7">
        <section>
          <h3 className="font-display font-bold text-[15px] mb-1">Subjects</h3>
          <p className="text-[12.5px] text-[var(--stu-muted)] mb-3">
            Colours come from a fixed, colour-blind-checked order — the swatch is picked for you, and the code is
            always printed beside it, so two subjects never rely on hue alone to be told apart.
          </p>
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li key={r.id} className="flex items-center gap-2">
                <button type="button"
                  onClick={() => setRows((prev) => prev.map((x, j) => (j === i ? { ...x, slot: (x.slot + 1) % SERIES.length } : x)))}
                  aria-label={`Change colour for ${r.code || 'new subject'} (currently ${SERIES[r.slot % SERIES.length].name})`}
                  className="w-8 h-8 rounded-lg shrink-0 border border-[var(--stu-line)]"
                  style={{ background: seriesColor(r.slot, theme) }} />
                <input value={r.code} placeholder="ECE 220" maxLength={12}
                  onChange={(e) => setRows((prev) => prev.map((x, j) => (j === i ? { ...x, code: e.target.value } : x)))}
                  className="w-28 px-3 py-2.5 rounded-xl bg-[var(--stu-surface-2)] border border-[var(--stu-line)] text-[13px] font-display font-semibold outline-none focus:border-[var(--stu-accent)] transition" />
                <input value={r.name} placeholder="Computer Systems" maxLength={60}
                  onChange={(e) => setRows((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[var(--stu-surface-2)] border border-[var(--stu-line)] text-[13px] outline-none focus:border-[var(--stu-accent)] transition" />
                <IconBtn label={`Remove ${r.code || 'subject'}`} onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}>
                  <S.trash className="w-4 h-4" />
                </IconBtn>
              </li>
            ))}
          </ul>
          <button type="button" onClick={addSubject}
            className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-display font-semibold text-[var(--stu-text-2)] hover:text-[var(--stu-text)] transition-colors">
            <S.plus className="w-3.5 h-3.5" /> Add subject
          </button>
        </section>

        <section>
          <h3 className="font-display font-bold text-[15px] mb-1">Daily target</h3>
          <p className="text-[12.5px] text-[var(--stu-muted)] mb-3">Only a nudge — the schedule decides what is actually due.</p>
          <input type="number" min="1" max="200" value={goal} onChange={(e) => setGoal(e.target.value)}
            className="w-28 px-3.5 py-2.5 rounded-xl bg-[var(--stu-surface-2)] border border-[var(--stu-line)] text-sm tabular-nums outline-none focus:border-[var(--stu-accent)] transition" />
        </section>

        <section>
          <h3 className="font-display font-bold text-[15px] mb-1">Your data</h3>
          <p className="text-[12.5px] text-[var(--stu-muted)] mb-3">
            Everything lives in this browser only — no account, no server, and it works with the connection off.
            Export a copy if the device matters to you.
          </p>
          <button type="button" onClick={onExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-display font-semibold border border-[var(--stu-line)] hover:border-[var(--stu-text-2)] transition-colors">
            <S.download className="w-4 h-4" /> Export CSV
          </button>
        </section>

        <button type="button" onClick={save}
          className="w-full py-4 rounded-2xl font-display font-bold text-[15px] bg-[var(--stu-accent)] text-[var(--stu-accent-ink)] transition-transform active:scale-[0.99]">
          Save settings
        </button>
      </div>
    </Sheet>
  )
}
