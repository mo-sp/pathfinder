import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Answer, AssessmentSession } from '@entities/assessment/model/types'
import type { Question } from '@entities/question/model/types'
import type { MatchResult, Occupation, RIASECProfile } from '@entities/occupation/model/types'
import { computeRiasecProfile, normalizeRiasecToPercent } from '@features/scoring/lib/riasec'
import { matchOccupations } from '@features/matching/lib/matcher'
import { db } from '@shared/config/db'
import { uuid } from '@shared/lib/uuid'
import itemsData from '@data/onet-items.json'

interface ItemsFile {
  items: Question[]
}

// All 60 items from the O*NET Interest Profiler Short Form, evenly
// distributed 10 per RIASEC dimension. Filtered defensively in case a
// future layer (Big Five, values) gets mixed into the same JSON file.
const allRiasecItems = (itemsData as ItemsFile).items.filter(
  (q) => q.layer === 'riasec',
)

/** Source order of riasec item IDs (JSON authored order, R→I→A→S→E→C). */
const sourceOrder: readonly string[] = allRiasecItems.map((q) => q.id)

/** O(1) id→Question lookup so `questions` computed doesn't do find() per slot. */
const itemsById = new Map<string, Question>(
  allRiasecItems.map((q) => [q.id, q]),
)

/**
 * Fisher-Yates shuffle producing a fresh array — does not mutate the
 * source. Used to randomise the presentation order of the 60 items per
 * session, which breaks the R→I→A→S→E→C clustering in the source data
 * and mitigates dimension-block fatigue where a tired user's lower-energy
 * answers all fall in the same RIASEC letter.
 */
function shuffleOrder(): string[] {
  const out = [...sourceOrder]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * True iff `order` is a valid permutation of the full source id list —
 * same length, no duplicates, no stray ids. Used to decide whether to
 * trust a hydrated questionOrder or fall back to source order for a
 * pre-shuffle (legacy) session or a tampered Dexie row.
 */
function isValidOrder(order: readonly string[]): boolean {
  if (order.length !== sourceOrder.length) return false
  const seen = new Set<string>()
  for (const id of order) {
    if (!itemsById.has(id)) return false
    if (seen.has(id)) return false
    seen.add(id)
  }
  return true
}

/**
 * Lazy-load the ~600 KB O*NET occupations JSON. Keeping this out of the
 * store chunk means the landing page ("/") downloads only the store logic
 * (~100 KB) instead of the full dataset, and the assessment page can
 * prefetch occupations in parallel with the user answering the 60
 * questions so results still render instantly on completion. The cached
 * promise doubles as both a "loaded" marker and a deduper for concurrent
 * callers (AssessmentPage onMount + ResultsPage onMount + the persist
 * watcher all race to trigger it).
 */
let occupationsPromise: Promise<Occupation[]> | null = null
async function fetchOccupations(): Promise<Occupation[]> {
  if (!occupationsPromise) {
    occupationsPromise = import('@data/onet-occupations.json').then(
      (mod) => (mod.default ?? mod) as unknown as Occupation[],
    )
  }
  return occupationsPromise
}

export const useQuestionnaireStore = defineStore('questionnaire', () => {
  const sessionId = ref<string>(uuid())
  const startedAt = ref<number>(Date.now())
  const answers = ref<Answer[]>([])
  const currentIndex = ref(0)
  const occupations = ref<Occupation[] | null>(null)
  // Per-session randomised order of question IDs — shuffled on store
  // creation, regenerated on reset(), persisted + hydrated so a reload
  // preserves the exact sequence the user started with.
  const questionOrder = ref<string[]>(shuffleOrder())

  // Full 60-item O*NET Interest Profiler Short Form, mapped through the
  // current per-session question order. `questions` therefore reflects
  // the exact sequence the user sees and `currentIndex` stays consistent
  // across answer()/previous()/hydrate() calls.
  const questions = computed<Question[]>(() =>
    questionOrder.value
      .map((id) => itemsById.get(id))
      .filter((q): q is Question => q != null),
  )

  const total = computed(() => questions.value.length)
  const currentQuestion = computed<Question | null>(
    () => questions.value[currentIndex.value] ?? null,
  )
  const isComplete = computed(() => answers.value.length >= total.value)
  const progress = computed(() =>
    total.value === 0 ? 0 : answers.value.length / total.value,
  )

  function answer(value: number): void {
    const q = currentQuestion.value
    if (!q) return
    const existing = answers.value.findIndex((a) => a.questionId === q.id)
    const record: Answer = { questionId: q.id, value, answeredAt: Date.now() }
    if (existing >= 0) {
      answers.value[existing] = record
    } else {
      answers.value.push(record)
    }
    if (currentIndex.value < total.value - 1) {
      currentIndex.value += 1
    }
  }

  function previous(): void {
    if (currentIndex.value > 0) currentIndex.value -= 1
  }

  function reset(): void {
    sessionId.value = uuid()
    startedAt.value = Date.now()
    answers.value = []
    currentIndex.value = 0
    // Re-roll the order on every reset so "Test neu starten" gives the
    // user a meaningfully different experience from their previous run.
    questionOrder.value = shuffleOrder()
  }

  /**
   * Kick off (or await an already-in-flight) dynamic import of the
   * occupations dataset and assign it to the reactive `occupations` ref so
   * `results` re-computes. Safe to call repeatedly: the module-scoped
   * `occupationsPromise` cache means the browser fetches the chunk at most
   * once per page load. Call from route entry (`/test` preload, `/ergebnis`
   * safety net) and from `persist()` so the completed session written to
   * Dexie always contains the full `results` snapshot.
   */
  async function loadOccupations(): Promise<Occupation[]> {
    const data = await fetchOccupations()
    if (occupations.value !== data) occupations.value = data
    return data
  }

  const riasecProfile = computed<RIASECProfile>(() =>
    computeRiasecProfile(answers.value, questions.value),
  )

  const riasecPercent = computed<RIASECProfile>(() =>
    normalizeRiasecToPercent(riasecProfile.value, questions.value),
  )

  const results = computed<MatchResult[]>(() => {
    if (!isComplete.value || !occupations.value) return []
    return matchOccupations(riasecProfile.value, occupations.value, 20)
  })

  async function persist(): Promise<void> {
    // Writing a completed session: make sure the occupations dataset is
    // loaded so `results` is populated before we snapshot. Otherwise a
    // persist triggered by the 10th answer would race the dynamic import
    // and write an empty `results` array to Dexie. In-progress sessions
    // don't touch occupations so they skip the wait.
    if (isComplete.value) await loadOccupations()
    // JSON-roundtrip strips Vue reactive proxies so Dexie's structured-clone
    // serialization always sees plain objects. Cheap because the session is
    // tiny (≤60 answers + 6 floats + ≤20 match summaries).
    const session: AssessmentSession = JSON.parse(
      JSON.stringify({
        id: sessionId.value,
        startedAt: startedAt.value,
        completedAt: isComplete.value ? Date.now() : undefined,
        answers: answers.value,
        riasecProfile: isComplete.value ? riasecProfile.value : undefined,
        results: isComplete.value ? results.value : undefined,
        questionOrder: questionOrder.value,
      }),
    )
    await db.sessions.put(session)
  }

  /**
   * Restore the most recent session from IndexedDB so reloading /test or
   * /ergebnis mid-assessment resumes where the user left off instead of
   * starting fresh. Only called once, from main.ts before mount, and only
   * when the entry URL is on the assessment or results route – landing on
   * "/" always starts with a clean slate. Failures are swallowed because
   * IndexedDB may be unavailable (private mode, quota, etc.), and in that
   * case the store simply stays in its pristine in-memory state.
   */
  let hydrated = false
  async function hydrate(): Promise<void> {
    if (hydrated) return
    hydrated = true
    try {
      const latest = await db.sessions
        .orderBy('startedAt')
        .reverse()
        .first()
      if (!latest) return
      sessionId.value = latest.id
      startedAt.value = latest.startedAt
      answers.value = [...latest.answers]
      // Restore the exact order the user was shown when they created the
      // session, so currentIndex still maps to the same question. Legacy
      // sessions written before shuffling existed (or rows tampered with
      // externally) fall back to source order — that's what they were
      // implicitly authored against, so their currentIndex lines up.
      if (latest.questionOrder && isValidOrder(latest.questionOrder)) {
        questionOrder.value = [...latest.questionOrder]
      } else {
        questionOrder.value = [...sourceOrder]
      }
      // Resume at the next unanswered question; clamp so a complete session
      // sits on the last question instead of stepping past the end of the
      // questions array.
      const nextIndex = answers.value.length
      const lastIndex = Math.max(0, total.value - 1)
      currentIndex.value = Math.min(nextIndex, lastIndex)
    } catch (err) {
      console.error('Failed to hydrate assessment session', err)
    }
  }

  // Persist on every answer, navigation, or reset so a reload always finds
  // the latest state. The session is tiny and Likert clicks happen at
  // human pace, so no debouncing is needed. We intentionally persist empty
  // resets too: without it, reloading /test immediately after clicking
  // "Test starten" would hydrate the previous completed session, because
  // the empty fresh session wouldn't yet be in Dexie. The initial store
  // instantiation does *not* fire this watcher (Vue 3 watch defaults to
  // non-immediate), so the landing page ("/") never writes a stray row.
  watch(
    [answers, currentIndex],
    () => {
      void persist().catch((err) => {
        console.error('Failed to persist assessment session', err)
      })
    },
    { deep: true },
  )

  return {
    sessionId,
    answers,
    currentIndex,
    questions,
    total,
    currentQuestion,
    isComplete,
    progress,
    riasecProfile,
    riasecPercent,
    results,
    answer,
    previous,
    reset,
    persist,
    hydrate,
    loadOccupations,
  }
})
