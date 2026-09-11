/* ============================================================
   Revision — configuration
   The only file you normally need to edit to make the app yours.
   Everything here is a seed: subjects, class days and the review
   ladder can all be changed from inside the app, and your edits
   are what get saved.
   ============================================================ */

/* 1) Where the "back to the rest of the site" links go. */
export const PORTFOLIO_PATH = '/portfolio'
export const LEDGER_PATH = '/'

/* 2) Colour.
      ------------------------------------------------------------
      CATEGORICAL — subject identity. These are the validated slots in
      their documented order; the order IS the colour-blind safety
      mechanism, so add subjects by taking the next free slot rather
      than inventing a hue. Dark is a selected set of steps for the
      dark surface, not an automatic flip of the light one.
      A subject's code is printed beside its swatch everywhere it
      appears, so identity never rests on colour alone. */
export const SERIES = [
  { name: 'blue',    light: '#2a78d6', dark: '#3987e5' },
  { name: 'orange',  light: '#eb6834', dark: '#d95926' },
  { name: 'aqua',    light: '#1baf7a', dark: '#199e70' },
  { name: 'yellow',  light: '#eda100', dark: '#c98500' },
  { name: 'magenta', light: '#e87ba4', dark: '#d55181' },
  { name: 'green',   light: '#008300', dark: '#008300' },
  { name: 'violet',  light: '#4a3aa7', dark: '#9085e9' },
  { name: 'red',     light: '#e34948', dark: '#e66767' },
]
export const seriesColor = (slot, theme) =>
  SERIES[((Number(slot) || 0) % SERIES.length + SERIES.length) % SERIES.length][theme === 'dark' ? 'dark' : 'light']

/* SEQUENTIAL — how many reviews happened on a day (the heatmap) and how
   many fall due (the forecast). One hue, light to dark, the nearest-zero
   step allowed to recede into the surface. */
export const HEAT_RAMP = {
  light: ['#cde2fb', '#9ec5f4', '#5598e7', '#2a78d6', '#184f95'],
  dark:  ['#0d366b', '#184f95', '#256abf', '#3987e5', '#86b6ef'],
}
export const BAR_HUE = { light: '#2a78d6', dark: '#3987e5' }

/* ORDINAL — the four maturity tiers, which are an ordered progression
   rather than four identities, so they get one hue stepped by tier.
   Both directions were validated with the ordinal gate: monotone
   lightness, visible steps, and the step nearest the surface clearing
   2:1 against it. */
export const MATURITY_RAMP = {
  light: { new: '#d4d2cb', learning: '#55c49c', young: '#1f9e72', mature: '#0b6047' },
  dark:  { new: '#3a3a38', learning: '#14614a', young: '#2bb583', mature: '#7fd6b4' },
}

/* STATUS — reserved, never themed, never reused as a series colour, and
   always shipped with an icon or a word so the colour is not the
   message on its own. */
export const STATUS = { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' }

/* 2b) Subjects. `code` is what you see everywhere; `name` is the long
      form shown in pickers; `slot` indexes SERIES above. */
export const SEED_SUBJECTS = [
  { id: 'ece220',  code: 'ECE 220',  name: 'Computer Systems & Programming', slot: 0 },
  { id: 'math231', code: 'MATH 231', name: 'Calculus II',                    slot: 1 },
  { id: 'phys211', code: 'PHYS 211', name: 'University Physics: Mechanics',  slot: 2 },
  { id: 'ece120',  code: 'ECE 120',  name: 'Introduction to Computing',      slot: 3 },
  { id: 'cs101',   code: 'CS 101',   name: 'Intro to Computing (MATLAB)',    slot: 4 },
]

/* 3) The four grades. `key` is the keyboard shortcut on the review screen;
      the interval each one buys you is worked out in srs.js and printed on
      the button, so nothing about the schedule is hidden. */
export const GRADES = [
  { id: 'again', label: 'Again', hint: 'Blank',     key: '1', tint: '#d03b3b' },
  { id: 'hard',  label: 'Hard',  hint: 'Struggled', key: '2', tint: '#ec835a' },
  { id: 'good',  label: 'Good',  hint: 'Got it',    key: '3', tint: '#2a78d6' },
  { id: 'easy',  label: 'Easy',  hint: 'Instant',   key: '4', tint: '#0ca30c' },
]
export const GRADE_IDS = GRADES.map((g) => g.id)
export const gradeMeta = (id) => GRADES.find((g) => g.id === id) || GRADES[2]

/* 4) How a topic got into your head. Preview = you read it before the
      lecture, which is the habit this app is built to protect. */
export const SOURCES = {
  preview: { label: 'Previewed', short: 'Preview' },
  class:   { label: 'From class', short: 'Class' },
  self:    { label: 'Self-study', short: 'Self' },
}
export const SOURCE_IDS = Object.keys(SOURCES)

/* 5) Maturity bands, in days of current interval. A topic only counts as
      "known" once it has survived a gap of MATURE_DAYS or more. */
export const YOUNG_DAYS = 7
export const MATURE_DAYS = 21

export const MATURITY = {
  new:      { label: 'Not started', blurb: 'never reviewed' },
  learning: { label: 'Learning',    blurb: `under ${YOUNG_DAYS} days apart` },
  young:    { label: 'Holding',     blurb: `${YOUNG_DAYS}–${MATURE_DAYS} days apart` },
  mature:   { label: 'Known',       blurb: `${MATURE_DAYS}+ days apart` },
}
export const MATURITY_IDS = ['new', 'learning', 'young', 'mature']
export const maturityColor = (id, theme) => MATURITY_RAMP[theme === 'dark' ? 'dark' : 'light'][id]

/* 6) Review ladder. The first two steps are fixed days; after that the
      interval multiplies by the topic's own ease factor. */
export const FIRST_STEPS = [1, 3]        // days, for reps 0 and 1 graded "good"
export const START_EASE = 2.5
export const MIN_EASE = 1.3
export const MAX_EASE = 3.0
export const MAX_INTERVAL = 365          // days — no point scheduling beyond a year
export const LEECH_LAPSES = 5            // forgotten this often ⇒ flagged to rewrite

/* 7) Your class week. 0 = Sunday … 6 = Saturday. Used to line topics up
      with real dates when you drag the teaching schedule around. */
export const DEFAULT_CLASS_DAYS = [1, 3] // Monday and Wednesday

/* 8) How many days before a class the preview nudge appears. */
export const PREVIEW_LEAD_DAYS = 2

/* 9) Forecast and heatmap sizes. */
export const FORECAST_DAYS = 14
export const HEATMAP_WEEKS = 26   // about six months, a whole semester

export const subjectById = (subjects, id) => subjects.find((s) => s.id === id) || null
