/* ============================================================
   State and persistence for the revision app.
   React Context + useReducer, saved to localStorage. No account,
   no server, no network — the whole thing works offline and the
   data never leaves the device.
   ============================================================ */
import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react'
import { SEED_SUBJECTS, DEFAULT_CLASS_DAYS } from './config'
import { newCard, gradeCard, todayISO, alignSchedule } from './srs'

const KEY = 'stu_state_v1'

const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

const load = () => {
  try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null } catch { return null }
}
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* private mode */ } }

/* Term start defaults to the Monday of the current week, so a brand new
   schedule lands on real dates straight away instead of on 1970. */
function thisMonday() {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const emptyState = () => ({
  topics: [],
  schedule: [],
  exams: [],
  subjects: SEED_SUBJECTS,
  settings: { classDays: DEFAULT_CLASS_DAYS, termStart: thisMonday(), dailyGoal: 10 },
})

/* Merged rather than replaced, so a state saved by an older version of the
   app still opens once new fields are added. */
function initState() {
  const base = emptyState()
  const stored = load()
  if (!stored) return base
  const settings = { ...base.settings, ...(stored.settings || {}) }
  const schedule = stored.schedule || []
  return {
    ...base,
    ...stored,
    subjects: stored.subjects?.length ? stored.subjects : base.subjects,
    settings,
    // "Every plan row has a date" is an invariant the reducer maintains on
    // every write, so it is enforced on the way in too. Without this a row
    // that arrived undated — restored data, or a state written before the
    // class days were set — would read "unscheduled" forever.
    schedule: schedule.some((s) => !s.date)
      ? alignSchedule(schedule, settings.termStart, settings.classDays)
      : schedule,
  }
}

function reducer(state, a) {
  switch (a.type) {
    /* ---------------- Topics ---------------- */
    case 'topic/add':
      return { ...state, topics: [a.topic, ...state.topics] }

    case 'topic/update':
      return { ...state, topics: state.topics.map((t) => (t.id === a.id ? { ...t, ...a.patch } : t)) }

    case 'topic/remove':
      return {
        ...state,
        topics: state.topics.filter((t) => t.id !== a.id),
        // An exam must not keep pointing at a topic that no longer exists.
        exams: state.exams.map((e) => ({ ...e, topics: (e.topics || []).filter((id) => id !== a.id) })),
      }

    /* Grading writes both the new schedule and a line in the topic's own
       log — the log is what the heatmap, streak and retention read from. */
    case 'topic/review': {
      const today = a.today || todayISO()
      return {
        ...state,
        topics: state.topics.map((t) => {
          if (t.id !== a.id) return t
          return {
            ...t,
            status: 'active',
            srs: gradeCard(t.srs, a.grade, today),
            history: [...(t.history || []), { date: today, grade: a.grade }],
          }
        }),
      }
    }

    case 'topic/goal': {
      return {
        ...state,
        topics: state.topics.map((t) => (t.id !== a.id ? t : {
          ...t,
          goals: (t.goals || []).map((g) => (g.id === a.goalId ? { ...g, done: !g.done } : g)),
        })),
      }
    }

    /* ---------------- Class schedule ---------------- */
    case 'schedule/add':
      return {
        ...state,
        schedule: alignSchedule([...state.schedule, a.item], state.settings.termStart, state.settings.classDays),
      }

    case 'schedule/update':
      return { ...state, schedule: state.schedule.map((s) => (s.id === a.id ? { ...s, ...a.patch } : s)) }

    case 'schedule/remove':
      return {
        ...state,
        schedule: alignSchedule(state.schedule.filter((s) => s.id !== a.id), state.settings.termStart, state.settings.classDays),
      }

    /* Reordering is the whole feature: the list is re-dated onto class
       slots every time, so dragging one row fixes every date below it. */
    case 'schedule/reorder': {
      const next = [...state.schedule]
      const [moved] = next.splice(a.from, 1)
      if (!moved) return state
      next.splice(a.to, 0, moved)
      return { ...state, schedule: alignSchedule(next, state.settings.termStart, state.settings.classDays) }
    }

    case 'schedule/realign':
      return { ...state, schedule: alignSchedule(state.schedule, state.settings.termStart, state.settings.classDays) }

    /* ---------------- Exams ---------------- */
    case 'exam/add':    return { ...state, exams: [...state.exams, a.exam] }
    case 'exam/update': return { ...state, exams: state.exams.map((e) => (e.id === a.id ? { ...e, ...a.patch } : e)) }
    case 'exam/remove': return { ...state, exams: state.exams.filter((e) => e.id !== a.id) }

    /* ---------------- Subjects and settings ---------------- */
    case 'subjects': return { ...state, subjects: a.subjects }

    case 'settings': {
      const settings = { ...state.settings, ...a.settings }
      return { ...state, settings, schedule: alignSchedule(state.schedule, settings.termStart, settings.classDays) }
    }

    case 'replaceAll': return a.state

    default: return state
  }
}

const Ctx = createContext(null)

export function StudyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState)

  useEffect(() => { save(state) }, [state])

  /* A topic starts due today when you log it as learnt — the point of
     "what I learnt today" is that the first repetition is already booked
     before you close the sheet. */
  const addTopic = useCallback((draft) => {
    const today = todayISO()
    const topic = {
      id: uid('t'),
      created_at: new Date().toISOString(),
      date: today,
      title: '', subject: '', note: '', source: 'class',
      goals: [], history: [], archived: false,
      status: draft.source === 'preview' ? 'preview' : 'active',
      scheduleId: '',
      ...draft,
      // Previewing is not learning, so a preview is not scheduled until
      // you have actually sat the class and reviewed it once.
      srs: newCard(draft.source === 'preview' ? today : today),
    }
    dispatch({ type: 'topic/add', topic })
    return topic
  }, [])

  const updateTopic = useCallback((id, patch) => dispatch({ type: 'topic/update', id, patch }), [])
  const removeTopic = useCallback((id) => dispatch({ type: 'topic/remove', id }), [])
  const reviewTopic = useCallback((id, grade) => dispatch({ type: 'topic/review', id, grade }), [])
  const toggleGoal = useCallback((id, goalId) => dispatch({ type: 'topic/goal', id, goalId }), [])

  const addScheduleItem = useCallback((draft) => {
    const item = { id: uid('s'), title: '', subject: '', note: '', date: '', previewed: false, taught: false, ...draft }
    dispatch({ type: 'schedule/add', item })
    return item
  }, [])
  const updateScheduleItem = useCallback((id, patch) => dispatch({ type: 'schedule/update', id, patch }), [])
  const removeScheduleItem = useCallback((id) => dispatch({ type: 'schedule/remove', id }), [])
  const reorderSchedule = useCallback((from, to) => dispatch({ type: 'schedule/reorder', from, to }), [])

  const addExam = useCallback((draft) => {
    const exam = { id: uid('e'), title: '', subject: '', date: todayISO(), topics: [], note: '', ...draft }
    dispatch({ type: 'exam/add', exam })
    return exam
  }, [])
  const updateExam = useCallback((id, patch) => dispatch({ type: 'exam/update', id, patch }), [])
  const removeExam = useCallback((id) => dispatch({ type: 'exam/remove', id }), [])

  const setSubjects = useCallback((subjects) => dispatch({ type: 'subjects', subjects }), [])
  const saveSettings = useCallback((settings) => dispatch({ type: 'settings', settings }), [])
  const replaceAll = useCallback((next) => dispatch({ type: 'replaceAll', state: next }), [])

  const value = useMemo(() => ({
    ...state,
    addTopic, updateTopic, removeTopic, reviewTopic, toggleGoal,
    addScheduleItem, updateScheduleItem, removeScheduleItem, reorderSchedule,
    addExam, updateExam, removeExam,
    setSubjects, saveSettings, replaceAll,
  }), [state, addTopic, updateTopic, removeTopic, reviewTopic, toggleGoal,
    addScheduleItem, updateScheduleItem, removeScheduleItem, reorderSchedule,
    addExam, updateExam, removeExam, setSubjects, saveSettings, replaceAll])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- a hook, not a component
export function useStudy() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStudy must be used inside <StudyProvider>')
  return v
}
