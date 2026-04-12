import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
  Answer,
  AssessmentLayer,
  AssessmentSession,
} from '@entities/assessment/model/types'
import type { Question } from '@entities/question/model/types'
import type {
  BigFiveProfile,
  MatchResult,
  Occupation,
  RIASECProfile,
  ValuesProfile,
} from '@entities/occupation/model/types'
import { computeRiasecProfile, normalizeRiasecToPercent } from '@features/scoring/lib/riasec'
import {
  computeBigFiveProfile,
  normalizeBigFiveToPercent,
} from '@features/scoring/lib/bigfive'
import { computeValuesProfile } from '@features/scoring/lib/values'
import { matchOccupations } from '@features/matching/lib/matcher'
import { db } from '@shared/config/db'
import { uuid } from '@shared/lib/uuid'
import itemsData from '@data/onet-items.json'
import bigfiveItemsData from '@data/ipip-bigfive-items.json'
import valuesItemsData from '@data/values-items.json'

interface ItemsFile {
  items: Question[]
}

// RIASEC layer (Layer 1). 60 items from the O*NET Interest Profiler Short
// Form, evenly distributed 10 per RIASEC dimension. Filtered defensively
// in case a future layer gets mixed into the same JSON file.
const allRiasecItems = (itemsData as ItemsFile).items.filter(
  (q) => q.layer === 'riasec',
)

// Big Five layer (Layer 2). 50 items from the IPIP Big-Five Factor
// Markers lexical scale (Goldberg 1992), 10 per dimension, German
// translation by Fritz Ostendorf. See `src/data/ipip-bigfive-items.json`
// for attribution.
const allBigFiveItems = (bigfiveItemsData as ItemsFile).items.filter(
  (q) => q.layer === 'bigfive',
)

// Values layer (Layer 3). 8 custom items backed by O*NET Work Context
// and Job Zones. Each question maps 1:1 to an occupation attribute.
const allValuesItems = (valuesItemsData as ItemsFile).items.filter(
  (q) => q.layer === 'values',
)

/** Source order of riasec item IDs (JSON authored order, R→I→A→S→E→C). */
const riasecSourceOrder: readonly string[] = allRiasecItems.map((q) => q.id)

/** Source order of Big Five item IDs (JSON authored order, O→C→E→A→N). */
const bigfiveSourceOrder: readonly string[] = allBigFiveItems.map((q) => q.id)

/** Source order of values item IDs (JSON authored order). */
const valuesSourceOrder: readonly string[] = allValuesItems.map((q) => q.id)

/** O(1) id→Question lookup so `questions` computed doesn't do find() per slot. */
const riasecItemsById = new Map<string, Question>(
  allRiasecItems.map((q) => [q.id, q]),
)

const bigfiveItemsById = new Map<string, Question>(
  allBigFiveItems.map((q) => [q.id, q]),
)

const valuesItemsById = new Map<string, Question>(
  allValuesItems.map((q) => [q.id, q]),
)

/**
 * Fisher-Yates shuffle producing a fresh array — does not mutate the
 * source. Used to randomise the presentation order of the items per
 * session, which breaks dimension-block clustering in the source data
 * and mitigates fatigue where a tired user's lower-energy answers all
 * fall in the same dimension.
 */
function shuffleOrder(source: readonly string[]): string[] {
  const out = [...source]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * True iff `order` is a valid permutation of `source` — same length, no
 * duplicates, no stray ids. Used to decide whether to trust a hydrated
 * questionOrder or fall back to source order for a pre-shuffle (legacy)
 * session or a tampered Dexie row.
 */
function isValidOrder(
  order: readonly string[],
  source: readonly string[],
  itemsById: Map<string, Question>,
): boolean {
  if (order.length !== source.length) return false
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
 * prefetch occupations in parallel with the user answering questions so
 * results still render instantly on completion. The cached promise
 * doubles as both a "loaded" marker and a deduper for concurrent callers
 * (AssessmentPage onMount + ResultsPage onMount + the persist watcher all
 * race to trigger it).
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

let bigfiveProfilesPromise: Promise<Record<string, BigFiveProfile>> | null = null
async function fetchBigFiveProfiles(): Promise<Record<string, BigFiveProfile>> {
  if (!bigfiveProfilesPromise) {
    bigfiveProfilesPromise = import('@data/bigfive-occupation-profiles.json').then(
      (mod) => {
        const data = (mod.default ?? mod) as { profiles: Record<string, BigFiveProfile> }
        return data.profiles
      },
    )
  }
  return bigfiveProfilesPromise
}

export const useQuestionnaireStore = defineStore('questionnaire', () => {
  const sessionId = ref<string>(uuid())
  const startedAt = ref<number>(Date.now())

  /**
   * Which layer of the progressive funnel the user is currently on. Drives
   * all the layer-aware computed aliases below (`answers`, `questions`,
   * `total`, `currentIndex`, `currentQuestion`, `isComplete`, `progress`).
   * AssessmentPage reads the aliases and so is layer-agnostic.
   */
  const currentLayer = ref<AssessmentLayer>('riasec')

  // RIASEC layer state -----------------------------------------------------
  const riasecAnswers = ref<Answer[]>([])
  const riasecCurrentIndex = ref(0)
  // Per-session randomised order of riasec question IDs — shuffled on
  // store creation, regenerated on reset(), persisted + hydrated so a
  // reload preserves the exact sequence the user started with.
  const riasecOrder = ref<string[]>(shuffleOrder(riasecSourceOrder))

  // Big Five layer state ---------------------------------------------------
  const bigfiveAnswers = ref<Answer[]>([])
  const bigfiveCurrentIndex = ref(0)
  const bigfiveOrder = ref<string[]>(shuffleOrder(bigfiveSourceOrder))

  // Values layer state ----------------------------------------------------
  const valuesAnswers = ref<Answer[]>([])
  const valuesCurrentIndex = ref(0)
  const valuesOrder = ref<string[]>(shuffleOrder(valuesSourceOrder))

  const occupations = ref<Occupation[] | null>(null)
  const bigfiveOccupationProfiles = ref<Record<string, BigFiveProfile> | null>(null)

  // Per-layer questions (ordered for this session) -------------------------
  const riasecQuestions = computed<Question[]>(() =>
    riasecOrder.value
      .map((id) => riasecItemsById.get(id))
      .filter((q): q is Question => q != null),
  )
  const bigfiveQuestions = computed<Question[]>(() =>
    bigfiveOrder.value
      .map((id) => bigfiveItemsById.get(id))
      .filter((q): q is Question => q != null),
  )
  const valuesQuestions = computed<Question[]>(() =>
    valuesOrder.value
      .map((id) => valuesItemsById.get(id))
      .filter((q): q is Question => q != null),
  )

  const riasecTotal = computed(() => riasecQuestions.value.length)
  const bigfiveTotal = computed(() => bigfiveQuestions.value.length)
  const valuesTotal = computed(() => valuesQuestions.value.length)

  const riasecIsComplete = computed(
    () => riasecAnswers.value.length >= riasecTotal.value,
  )
  const bigfiveIsComplete = computed(
    () => bigfiveAnswers.value.length >= bigfiveTotal.value,
  )
  const valuesIsComplete = computed(
    () => valuesAnswers.value.length >= valuesTotal.value,
  )

  // Progress tracks the user's *current position* in the layer, not the
  // number of answers on file. That matters for the "Zurück" button: when
  // the user steps back from question 15 to 14, `currentIndex` drops but
  // `riasecAnswers.length` still holds 15 (the already-stored response to
  // question 15). Binding the progress bar to currentIndex makes the
  // visual match the user's mental model ("I just moved backwards, the
  // bar should follow"). The isComplete short-circuit handles the very
  // last question: answering it leaves `currentIndex` clamped at
  // total-1 (see `answerLayer`), but the layer IS done so the bar
  // should read 100% for the brief moment before navigation fires.
  const riasecProgress = computed(() => {
    if (riasecTotal.value === 0) return 0
    if (riasecIsComplete.value) return 1
    return riasecCurrentIndex.value / riasecTotal.value
  })
  const bigfiveProgress = computed(() => {
    if (bigfiveTotal.value === 0) return 0
    if (bigfiveIsComplete.value) return 1
    return bigfiveCurrentIndex.value / bigfiveTotal.value
  })
  const valuesProgress = computed(() => {
    if (valuesTotal.value === 0) return 0
    if (valuesIsComplete.value) return 1
    return valuesCurrentIndex.value / valuesTotal.value
  })

  const riasecProfile = computed<RIASECProfile>(() =>
    computeRiasecProfile(riasecAnswers.value, riasecQuestions.value),
  )
  const riasecPercent = computed<RIASECProfile>(() =>
    normalizeRiasecToPercent(riasecProfile.value, riasecQuestions.value),
  )

  const bigfiveProfile = computed<BigFiveProfile>(() =>
    computeBigFiveProfile(bigfiveAnswers.value, bigfiveQuestions.value),
  )
  const bigfivePercent = computed<BigFiveProfile>(() =>
    normalizeBigFiveToPercent(bigfiveProfile.value, bigfiveQuestions.value),
  )

  const valuesProfile = computed<ValuesProfile>(() =>
    computeValuesProfile(valuesAnswers.value, valuesQuestions.value),
  )

  // Layer-aware aliases ----------------------------------------------------
  // AssessmentPage and existing call sites read these and stay unaware of
  // which layer is active. Keeping the flat names (`answers`, `total`,
  // `isComplete`, ...) preserves the existing Vue + test contract.
  const answers = computed<Answer[]>(() => {
    if (currentLayer.value === 'values') return valuesAnswers.value
    if (currentLayer.value === 'bigfive') return bigfiveAnswers.value
    return riasecAnswers.value
  })
  const questions = computed<Question[]>(() => {
    if (currentLayer.value === 'values') return valuesQuestions.value
    if (currentLayer.value === 'bigfive') return bigfiveQuestions.value
    return riasecQuestions.value
  })
  const total = computed(() => {
    if (currentLayer.value === 'values') return valuesTotal.value
    if (currentLayer.value === 'bigfive') return bigfiveTotal.value
    return riasecTotal.value
  })
  const currentIndex = computed(() => {
    if (currentLayer.value === 'values') return valuesCurrentIndex.value
    if (currentLayer.value === 'bigfive') return bigfiveCurrentIndex.value
    return riasecCurrentIndex.value
  })
  const currentQuestion = computed<Question | null>(
    () => questions.value[currentIndex.value] ?? null,
  )
  const isComplete = computed(() => {
    if (currentLayer.value === 'values') return valuesIsComplete.value
    if (currentLayer.value === 'bigfive') return bigfiveIsComplete.value
    return riasecIsComplete.value
  })
  const progress = computed(() => {
    if (currentLayer.value === 'values') return valuesProgress.value
    if (currentLayer.value === 'bigfive') return bigfiveProgress.value
    return riasecProgress.value
  })

  function answer(value: number): void {
    if (currentLayer.value === 'values') {
      answerLayer(value, valuesAnswers, valuesCurrentIndex, valuesQuestions, valuesTotal)
    } else if (currentLayer.value === 'bigfive') {
      answerLayer(value, bigfiveAnswers, bigfiveCurrentIndex, bigfiveQuestions, bigfiveTotal)
    } else {
      answerLayer(value, riasecAnswers, riasecCurrentIndex, riasecQuestions, riasecTotal)
    }
  }

  function answerLayer(
    value: number,
    layerAnswers: typeof riasecAnswers,
    layerIndex: typeof riasecCurrentIndex,
    layerQuestions: typeof riasecQuestions,
    layerTotal: typeof riasecTotal,
  ): void {
    const q = layerQuestions.value[layerIndex.value]
    if (!q) return
    const existing = layerAnswers.value.findIndex((a) => a.questionId === q.id)
    const record: Answer = { questionId: q.id, value, answeredAt: Date.now() }
    if (existing >= 0) {
      layerAnswers.value[existing] = record
    } else {
      layerAnswers.value.push(record)
    }
    if (layerIndex.value < layerTotal.value - 1) {
      layerIndex.value += 1
    }
  }

  function previous(): void {
    if (currentLayer.value === 'values') {
      if (valuesCurrentIndex.value > 0) valuesCurrentIndex.value -= 1
    } else if (currentLayer.value === 'bigfive') {
      if (bigfiveCurrentIndex.value > 0) bigfiveCurrentIndex.value -= 1
    } else {
      if (riasecCurrentIndex.value > 0) riasecCurrentIndex.value -= 1
    }
  }

  function reset(): void {
    sessionId.value = uuid()
    startedAt.value = Date.now()
    currentLayer.value = 'riasec'
    riasecAnswers.value = []
    riasecCurrentIndex.value = 0
    riasecOrder.value = shuffleOrder(riasecSourceOrder)
    bigfiveAnswers.value = []
    bigfiveCurrentIndex.value = 0
    bigfiveOrder.value = shuffleOrder(bigfiveSourceOrder)
    valuesAnswers.value = []
    valuesCurrentIndex.value = 0
    valuesOrder.value = shuffleOrder(valuesSourceOrder)
  }

  /**
   * Promote the user into the Big Five layer. Called from the ResultsPage
   * "Verfeinern" CTA after a completed RIASEC run. Idempotent: if Big Five
   * is already in progress it preserves the partial state so a user who
   * navigates back and forth doesn't lose answers.
   */
  function startBigFiveLayer(): void {
    currentLayer.value = 'bigfive'
  }

  /**
   * Clear *only* the current layer's state and re-shuffle its order.
   * Used from AssessmentPage's "Schicht neu starten" button so a user in
   * Big Five can restart their personality answers without losing the
   * completed RIASEC results, and vice versa. sessionId and startedAt
   * stay put — this is a within-session re-run, not a new session.
   */
  function resetCurrentLayer(): void {
    if (currentLayer.value === 'values') {
      valuesAnswers.value = []
      valuesCurrentIndex.value = 0
      valuesOrder.value = shuffleOrder(valuesSourceOrder)
    } else if (currentLayer.value === 'bigfive') {
      bigfiveAnswers.value = []
      bigfiveCurrentIndex.value = 0
      bigfiveOrder.value = shuffleOrder(bigfiveSourceOrder)
    } else {
      riasecAnswers.value = []
      riasecCurrentIndex.value = 0
      riasecOrder.value = shuffleOrder(riasecSourceOrder)
    }
  }

  /** Promote the user into the values layer. Called from the ResultsPage CTA. */
  function startValuesLayer(): void {
    currentLayer.value = 'values'
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

  async function loadBigFiveProfiles(): Promise<Record<string, BigFiveProfile>> {
    const data = await fetchBigFiveProfiles()
    if (bigfiveOccupationProfiles.value !== data) bigfiveOccupationProfiles.value = data
    return data
  }

  const results = computed<MatchResult[]>(() => {
    if (!riasecIsComplete.value || !occupations.value) return []
    return matchOccupations(
      riasecProfile.value,
      occupations.value,
      occupations.value.length,
      bigfiveIsComplete.value ? bigfiveProfile.value : null,
      bigfiveIsComplete.value ? bigfiveOccupationProfiles.value : null,
      valuesIsComplete.value ? valuesProfile.value : null,
    )
  })

  async function persist(): Promise<void> {
    // Writing a completed session: make sure the occupations dataset is
    // loaded so `results` is populated before we snapshot. Otherwise a
    // persist triggered by the final RIASEC answer would race the dynamic
    // import and write an empty `results` array to Dexie. In-progress
    // sessions don't touch occupations so they skip the wait.
    if (riasecIsComplete.value) await loadOccupations()
    // JSON-roundtrip strips Vue reactive proxies so Dexie's structured-clone
    // serialization always sees plain objects. Cheap because the session is
    // tiny (≤110 answers + 11 floats + ≤20 match summaries).
    const session: AssessmentSession = JSON.parse(
      JSON.stringify({
        id: sessionId.value,
        startedAt: startedAt.value,
        completedAt: riasecIsComplete.value ? Date.now() : undefined,
        answers: riasecAnswers.value,
        riasecProfile: riasecIsComplete.value ? riasecProfile.value : undefined,
        results: riasecIsComplete.value ? results.value : undefined,
        questionOrder: riasecOrder.value,
        bigfiveAnswers: bigfiveAnswers.value,
        bigfiveOrder: bigfiveOrder.value,
        bigfiveProfile: bigfiveIsComplete.value
          ? bigfiveProfile.value
          : undefined,
        valuesAnswers: valuesAnswers.value,
        valuesOrder: valuesOrder.value,
        valuesProfile: valuesIsComplete.value
          ? valuesProfile.value
          : undefined,
        currentLayer: currentLayer.value,
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
      riasecAnswers.value = [...latest.answers]
      // Restore the exact RIASEC order the user was shown so currentIndex
      // still maps to the same question. Legacy sessions written before
      // shuffling existed (or rows tampered with externally) fall back to
      // source order — that's what they were implicitly authored against.
      if (
        latest.questionOrder &&
        isValidOrder(latest.questionOrder, riasecSourceOrder, riasecItemsById)
      ) {
        riasecOrder.value = [...latest.questionOrder]
      } else {
        riasecOrder.value = [...riasecSourceOrder]
      }
      // Big Five restoration: optional across the board because sessions
      // written before Phase 2 have none of these fields.
      bigfiveAnswers.value = latest.bigfiveAnswers
        ? [...latest.bigfiveAnswers]
        : []
      if (
        latest.bigfiveOrder &&
        isValidOrder(latest.bigfiveOrder, bigfiveSourceOrder, bigfiveItemsById)
      ) {
        bigfiveOrder.value = [...latest.bigfiveOrder]
      } else {
        bigfiveOrder.value = [...bigfiveSourceOrder]
      }
      // Values restoration: optional, same pattern as Big Five.
      valuesAnswers.value = latest.valuesAnswers
        ? [...latest.valuesAnswers]
        : []
      if (
        latest.valuesOrder &&
        isValidOrder(latest.valuesOrder, valuesSourceOrder, valuesItemsById)
      ) {
        valuesOrder.value = [...latest.valuesOrder]
      } else {
        valuesOrder.value = [...valuesSourceOrder]
      }
      currentLayer.value = latest.currentLayer ?? 'riasec'
      // Resume at the next unanswered question in *each* layer; clamp so a
      // complete layer sits on its last question instead of stepping past
      // the end of the questions array.
      const nextRiasec = riasecAnswers.value.length
      const lastRiasec = Math.max(0, riasecTotal.value - 1)
      riasecCurrentIndex.value = Math.min(nextRiasec, lastRiasec)
      const nextBigFive = bigfiveAnswers.value.length
      const lastBigFive = Math.max(0, bigfiveTotal.value - 1)
      bigfiveCurrentIndex.value = Math.min(nextBigFive, lastBigFive)
      const nextValues = valuesAnswers.value.length
      const lastValues = Math.max(0, valuesTotal.value - 1)
      valuesCurrentIndex.value = Math.min(nextValues, lastValues)
    } catch (err) {
      console.error('Failed to hydrate assessment session', err)
    }
  }

  // Persist on every answer, navigation, reset, or layer switch so a
  // reload always finds the latest state. The session is tiny and Likert
  // clicks happen at human pace, so no debouncing is needed. We
  // intentionally persist empty resets too: without it, reloading /test
  // immediately after clicking "Test starten" would hydrate the previous
  // completed session, because the empty fresh session wouldn't yet be in
  // Dexie. The initial store instantiation does *not* fire this watcher
  // (Vue 3 watch defaults to non-immediate), so the landing page ("/")
  // never writes a stray row.
  watch(
    [
      riasecAnswers,
      riasecCurrentIndex,
      bigfiveAnswers,
      bigfiveCurrentIndex,
      valuesAnswers,
      valuesCurrentIndex,
      currentLayer,
    ],
    () => {
      void persist().catch((err) => {
        console.error('Failed to persist assessment session', err)
      })
    },
    { deep: true },
  )

  return {
    sessionId,
    currentLayer,
    // Layer-aware aliases (current layer state)
    answers,
    currentIndex,
    questions,
    total,
    currentQuestion,
    isComplete,
    progress,
    // RIASEC-specific
    riasecAnswers,
    riasecQuestions,
    riasecTotal,
    riasecIsComplete,
    riasecProgress,
    riasecProfile,
    riasecPercent,
    // Big Five-specific
    bigfiveAnswers,
    bigfiveQuestions,
    bigfiveTotal,
    bigfiveIsComplete,
    bigfiveProgress,
    bigfiveProfile,
    bigfivePercent,
    // Values-specific
    valuesAnswers,
    valuesQuestions,
    valuesTotal,
    valuesIsComplete,
    valuesProgress,
    valuesProfile,
    // Occupation count (for hard-filter display on ResultsPage)
    totalOccupations: computed(() => occupations.value?.length ?? 0),
    // Results & actions
    results,
    answer,
    previous,
    reset,
    resetCurrentLayer,
    startBigFiveLayer,
    startValuesLayer,
    persist,
    hydrate,
    loadOccupations,
    loadBigFiveProfiles,
  }
})
