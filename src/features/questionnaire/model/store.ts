import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
  Answer,
  AssessmentLayer,
  AssessmentSession,
} from '@entities/assessment/model/types'
import type {
  Question,
  SkillsSubCategory,
} from '@entities/question/model/types'
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
import {
  SKILLS_SUB_CATEGORY_COUNTS,
  computeSkillsProfile,
  type SkillsProfile,
} from '@features/scoring/lib/skills'
import { matchOccupations } from '@features/matching/lib/matcher'
import { db } from '@shared/config/db'
import { uuid } from '@shared/lib/uuid'
import itemsData from '@data/onet-items.json'
import bigfiveItemsData from '@data/ipip-bigfive-items.json'
import valuesItemsData from '@data/values-items.json'
import skillsItemsData from '@data/skills-items.json'

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

// Skills layer (Layer 4). 120 items across 3 sub-categories: Fähigkeiten
// (Skills, 35) → Talente (Abilities, 52) → Wissen (Knowledge, 33). Items
// come from O*NET Skills/Abilities/Knowledge taxonomies with manual DE
// translations (v1). The JSON stores `subCategory` + `onetElementId` but
// omits `dimension`/`scale`; we synthesize both here so Question retains
// a uniform shape across all layers (dimension = subCategory, scale = likert5).
interface SkillsItemsFile {
  items: Array<Omit<Question, 'dimension' | 'scale'> & Partial<Pick<Question, 'dimension' | 'scale'>>>
}
const allSkillsItems: Question[] = (skillsItemsData as SkillsItemsFile).items
  .filter((q) => q.layer === 'skills')
  .map((q) => ({
    ...q,
    dimension: q.dimension ?? q.subCategory ?? 'skills',
    scale: q.scale ?? 'likert5',
  }))

/** Source order of riasec item IDs (JSON authored order, R→I→A→S→E→C). */
const riasecSourceOrder: readonly string[] = allRiasecItems.map((q) => q.id)

/** Source order of Big Five item IDs (JSON authored order, O→C→E→A→N). */
const bigfiveSourceOrder: readonly string[] = allBigFiveItems.map((q) => q.id)

/** Source order of values item IDs (JSON authored order). */
const valuesSourceOrder: readonly string[] = allValuesItems.map((q) => q.id)

/**
 * Skills source IDs bucketed by sub-category, preserving JSON authored
 * order within each bucket. Concatenating these gives the full
 * non-shuffled order (skills → abilities → knowledge). Shuffling happens
 * per-bucket so the three sub-categories stay sequential in the UI.
 */
const skillsBySubCategory: Readonly<Record<SkillsSubCategory, readonly string[]>> = {
  skills: allSkillsItems.filter((q) => q.subCategory === 'skills').map((q) => q.id),
  abilities: allSkillsItems.filter((q) => q.subCategory === 'abilities').map((q) => q.id),
  knowledge: allSkillsItems.filter((q) => q.subCategory === 'knowledge').map((q) => q.id),
}
const skillsSourceOrder: readonly string[] = [
  ...skillsBySubCategory.skills,
  ...skillsBySubCategory.abilities,
  ...skillsBySubCategory.knowledge,
]

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

const skillsItemsById = new Map<string, Question>(
  allSkillsItems.map((q) => [q.id, q]),
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
 * Build a skills layer order by shuffling each sub-category independently
 * and concatenating in canonical order (skills → abilities → knowledge).
 * Keeping sub-categories sequential is what lets the AssessmentPage show
 * a Zwischenscreen at each boundary.
 */
function buildSkillsOrder(): string[] {
  return [
    ...shuffleOrder(skillsBySubCategory.skills),
    ...shuffleOrder(skillsBySubCategory.abilities),
    ...shuffleOrder(skillsBySubCategory.knowledge),
  ]
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

  // Skills layer state (Layer 4, 3 sub-categories flattened to 120 slots)
  const skillsAnswers = ref<Answer[]>([])
  const skillsCurrentIndex = ref(0)
  const skillsOrder = ref<string[]>(buildSkillsOrder())
  // True when the user just answered the last question of a sub-category
  // and should see the Zwischenscreen before continuing. Persisted so a
  // reload on the interstitial screen keeps the interstitial visible.
  const skillsInterstitialPending = ref(false)

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
  const skillsQuestions = computed<Question[]>(() =>
    skillsOrder.value
      .map((id) => skillsItemsById.get(id))
      .filter((q): q is Question => q != null),
  )

  const riasecTotal = computed(() => riasecQuestions.value.length)
  const bigfiveTotal = computed(() => bigfiveQuestions.value.length)
  const valuesTotal = computed(() => valuesQuestions.value.length)
  const skillsTotal = computed(() => skillsQuestions.value.length)

  const riasecIsComplete = computed(
    () => riasecAnswers.value.length >= riasecTotal.value,
  )
  const bigfiveIsComplete = computed(
    () => bigfiveAnswers.value.length >= bigfiveTotal.value,
  )
  const valuesIsComplete = computed(
    () => valuesAnswers.value.length >= valuesTotal.value,
  )
  const skillsIsComplete = computed(
    () => skillsAnswers.value.length >= skillsTotal.value,
  )

  /**
   * Boundary indices inside the skills order where a sub-category ends:
   *   boundary[0] = last skill slot (currentIndex === 34 means we just
   *   answered the 35th and final skill item).
   *   boundary[1] = last ability slot (index 86, = 35 + 52 - 1).
   * Computed, not hardcoded, so changes to the items JSON counts flow
   * through without source-level edits.
   */
  const skillsBoundaries = computed(() => [
    SKILLS_SUB_CATEGORY_COUNTS.skills - 1,
    SKILLS_SUB_CATEGORY_COUNTS.skills + SKILLS_SUB_CATEGORY_COUNTS.abilities - 1,
  ])

  /** Which sub-category the user is currently on, derived from the flat index. */
  const skillsCurrentSubCategory = computed<SkillsSubCategory>(() => {
    const idx = skillsCurrentIndex.value
    if (idx < SKILLS_SUB_CATEGORY_COUNTS.skills) return 'skills'
    if (idx < SKILLS_SUB_CATEGORY_COUNTS.skills + SKILLS_SUB_CATEGORY_COUNTS.abilities) {
      return 'abilities'
    }
    return 'knowledge'
  })

  /** Local index inside the current sub-category (0-based, for "X/35" display). */
  const skillsSubCategoryIndex = computed(() => {
    const idx = skillsCurrentIndex.value
    if (idx < SKILLS_SUB_CATEGORY_COUNTS.skills) return idx
    if (idx < SKILLS_SUB_CATEGORY_COUNTS.skills + SKILLS_SUB_CATEGORY_COUNTS.abilities) {
      return idx - SKILLS_SUB_CATEGORY_COUNTS.skills
    }
    return idx - SKILLS_SUB_CATEGORY_COUNTS.skills - SKILLS_SUB_CATEGORY_COUNTS.abilities
  })

  /** Item count of the current sub-category (35, 52, or 33). */
  const skillsSubCategoryTotal = computed(
    () => SKILLS_SUB_CATEGORY_COUNTS[skillsCurrentSubCategory.value],
  )

  /**
   * Sub-category the Zwischenscreen is transitioning *to*. null when no
   * interstitial is pending. Derived from skillsCurrentIndex because the
   * answer() handler only sets `pending = true` when we just answered a
   * boundary question — index at that moment is 34 (→ abilities) or 86
   * (→ knowledge).
   */
  const skillsPendingNextSubCategory = computed<SkillsSubCategory | null>(() => {
    if (!skillsInterstitialPending.value) return null
    const idx = skillsCurrentIndex.value
    if (idx === SKILLS_SUB_CATEGORY_COUNTS.skills - 1) return 'abilities'
    if (idx === SKILLS_SUB_CATEGORY_COUNTS.skills + SKILLS_SUB_CATEGORY_COUNTS.abilities - 1) {
      return 'knowledge'
    }
    return null
  })

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
  const skillsProgress = computed(() => {
    if (skillsTotal.value === 0) return 0
    if (skillsIsComplete.value) return 1
    return skillsCurrentIndex.value / skillsTotal.value
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

  const skillsProfile = computed<SkillsProfile>(() =>
    computeSkillsProfile(skillsAnswers.value, skillsQuestions.value),
  )

  // Layer-aware aliases ----------------------------------------------------
  // AssessmentPage and existing call sites read these and stay unaware of
  // which layer is active. Keeping the flat names (`answers`, `total`,
  // `isComplete`, ...) preserves the existing Vue + test contract.
  const answers = computed<Answer[]>(() => {
    if (currentLayer.value === 'skills') return skillsAnswers.value
    if (currentLayer.value === 'values') return valuesAnswers.value
    if (currentLayer.value === 'bigfive') return bigfiveAnswers.value
    return riasecAnswers.value
  })
  const questions = computed<Question[]>(() => {
    if (currentLayer.value === 'skills') return skillsQuestions.value
    if (currentLayer.value === 'values') return valuesQuestions.value
    if (currentLayer.value === 'bigfive') return bigfiveQuestions.value
    return riasecQuestions.value
  })
  const total = computed(() => {
    if (currentLayer.value === 'skills') return skillsTotal.value
    if (currentLayer.value === 'values') return valuesTotal.value
    if (currentLayer.value === 'bigfive') return bigfiveTotal.value
    return riasecTotal.value
  })
  const currentIndex = computed(() => {
    if (currentLayer.value === 'skills') return skillsCurrentIndex.value
    if (currentLayer.value === 'values') return valuesCurrentIndex.value
    if (currentLayer.value === 'bigfive') return bigfiveCurrentIndex.value
    return riasecCurrentIndex.value
  })
  const currentQuestion = computed<Question | null>(
    () => questions.value[currentIndex.value] ?? null,
  )
  const isComplete = computed(() => {
    if (currentLayer.value === 'skills') return skillsIsComplete.value
    if (currentLayer.value === 'values') return valuesIsComplete.value
    if (currentLayer.value === 'bigfive') return bigfiveIsComplete.value
    return riasecIsComplete.value
  })
  const progress = computed(() => {
    if (currentLayer.value === 'skills') return skillsProgress.value
    if (currentLayer.value === 'values') return valuesProgress.value
    if (currentLayer.value === 'bigfive') return bigfiveProgress.value
    return riasecProgress.value
  })

  function answer(value: number): void {
    if (currentLayer.value === 'skills') {
      answerSkillsQuestion(value)
    } else if (currentLayer.value === 'values') {
      answerLayer(value, valuesAnswers, valuesCurrentIndex, valuesQuestions, valuesTotal)
    } else if (currentLayer.value === 'bigfive') {
      answerLayer(value, bigfiveAnswers, bigfiveCurrentIndex, bigfiveQuestions, bigfiveTotal)
    } else {
      answerLayer(value, riasecAnswers, riasecCurrentIndex, riasecQuestions, riasecTotal)
    }
  }

  /**
   * Skills-layer answer handler. Records the answer just like other layers
   * but stops at sub-category boundaries: after answering the 35th skill
   * (index 34) or 52nd ability (index 86), index stays put and
   * `skillsInterstitialPending` flips on. AssessmentPage renders the
   * Zwischenscreen until the user clicks "Weiter" (→ dismissSkillsInterstitial).
   */
  function answerSkillsQuestion(value: number): void {
    const q = skillsQuestions.value[skillsCurrentIndex.value]
    if (!q) return
    const existing = skillsAnswers.value.findIndex((a) => a.questionId === q.id)
    const record: Answer = { questionId: q.id, value, answeredAt: Date.now() }
    if (existing >= 0) {
      skillsAnswers.value[existing] = record
    } else {
      skillsAnswers.value.push(record)
    }
    const boundaries = skillsBoundaries.value
    if (boundaries.includes(skillsCurrentIndex.value)) {
      skillsInterstitialPending.value = true
      return
    }
    if (skillsCurrentIndex.value < skillsTotal.value - 1) {
      skillsCurrentIndex.value += 1
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
    if (currentLayer.value === 'skills') {
      // On an interstitial screen Back clears the pending flag — user
      // returns to the just-answered boundary question (index unchanged)
      // so they can revise their last answer if desired.
      if (skillsInterstitialPending.value) {
        skillsInterstitialPending.value = false
        return
      }
      if (skillsCurrentIndex.value > 0) skillsCurrentIndex.value -= 1
    } else if (currentLayer.value === 'values') {
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
    skillsAnswers.value = []
    skillsCurrentIndex.value = 0
    skillsOrder.value = buildSkillsOrder()
    skillsInterstitialPending.value = false
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
    if (currentLayer.value === 'skills') {
      skillsAnswers.value = []
      skillsCurrentIndex.value = 0
      skillsOrder.value = buildSkillsOrder()
      skillsInterstitialPending.value = false
    } else if (currentLayer.value === 'values') {
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

  /**
   * Reset a specific layer and switch to it so the user can re-answer its
   * questions without losing other layers' data. Called from ResultsPage
   * "wiederholen" links.
   */
  function repeatLayer(layer: AssessmentLayer): void {
    currentLayer.value = layer
    resetCurrentLayer()
  }

  /**
   * Update a single values answer in-place. Used by the interactive cards
   * on ResultsPage so users can tweak preferences without re-taking the
   * whole values layer.
   */
  function updateValuesAnswer(questionId: string, value: number): void {
    const idx = valuesAnswers.value.findIndex((a) => a.questionId === questionId)
    if (idx >= 0) {
      valuesAnswers.value[idx] = { questionId, value, answeredAt: Date.now() }
    }
  }

  /** Promote the user into the values layer. Called from the ResultsPage CTA. */
  function startValuesLayer(): void {
    currentLayer.value = 'values'
  }

  /** Promote the user into the skills layer. Called from the ResultsPage CTA. */
  function startSkillsLayer(): void {
    currentLayer.value = 'skills'
  }

  /**
   * Dismiss the Zwischenscreen and advance past the sub-category boundary.
   * Called from the AssessmentPage interstitial "Weiter" button.
   */
  function dismissSkillsInterstitial(): void {
    if (!skillsInterstitialPending.value) return
    skillsInterstitialPending.value = false
    if (skillsCurrentIndex.value < skillsTotal.value - 1) {
      skillsCurrentIndex.value += 1
    }
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
      skillsIsComplete.value ? skillsProfile.value : null,
    )
  })

  /**
   * Strip the bulky per-occupation skills/abilities/knowledge maps (each
   * ~120 entries) and workContext from MatchResult.occupation so the
   * persisted session stays small. Those fields are only needed by the
   * matcher, which reads them from the live in-memory `occupations`
   * dataset — never from the persisted session. Keeps the Dexie row
   * under ~30 KB instead of several MB with layer-4 data attached.
   * Also caps to top 20; the live `results` computed always recomputes
   * the full list on demand, so hydrate() never reads this back.
   */
  function trimResultsForPersist(rs: MatchResult[]): MatchResult[] {
    const top = rs.slice(0, 20)
    return top.map((r) => ({
      ...r,
      occupation: {
        ...r.occupation,
        skills: undefined,
        abilities: undefined,
        knowledge: undefined,
        workContext: undefined,
      },
    }))
  }

  async function persist(): Promise<void> {
    // Writing a completed session: make sure the occupations dataset is
    // loaded so `results` is populated before we snapshot. Otherwise a
    // persist triggered by the final RIASEC answer would race the dynamic
    // import and write an empty `results` array to Dexie. In-progress
    // sessions don't touch occupations so they skip the wait.
    if (riasecIsComplete.value) await loadOccupations()
    // JSON-roundtrip strips Vue reactive proxies so Dexie's structured-clone
    // serialization always sees plain objects.
    const session: AssessmentSession = JSON.parse(
      JSON.stringify({
        id: sessionId.value,
        startedAt: startedAt.value,
        completedAt: riasecIsComplete.value ? Date.now() : undefined,
        answers: riasecAnswers.value,
        riasecProfile: riasecIsComplete.value ? riasecProfile.value : undefined,
        results: riasecIsComplete.value ? trimResultsForPersist(results.value) : undefined,
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
        skillsAnswers: skillsAnswers.value,
        skillsOrder: skillsOrder.value,
        skillsInterstitialPending: skillsInterstitialPending.value,
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
      // Skills restoration: same backward-compat pattern.
      skillsAnswers.value = latest.skillsAnswers
        ? [...latest.skillsAnswers]
        : []
      if (
        latest.skillsOrder &&
        isValidOrder(latest.skillsOrder, skillsSourceOrder, skillsItemsById)
      ) {
        skillsOrder.value = [...latest.skillsOrder]
      } else {
        skillsOrder.value = buildSkillsOrder()
      }
      skillsInterstitialPending.value = latest.skillsInterstitialPending ?? false
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
      // Skills: interstitial-aware resume. When the user saved mid-
      // Zwischenscreen we want them to land back ON the boundary question
      // (skillsInterstitialPending=true) rather than one past it. All
      // other cases behave like the simpler layers (resume at next
      // unanswered, clamp at last index for completed layers).
      const lastSkills = Math.max(0, skillsTotal.value - 1)
      const nextSkills = skillsInterstitialPending.value && skillsAnswers.value.length > 0
        ? skillsAnswers.value.length - 1
        : skillsAnswers.value.length
      skillsCurrentIndex.value = Math.min(nextSkills, lastSkills)
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
      skillsAnswers,
      skillsCurrentIndex,
      skillsInterstitialPending,
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
    // Skills-specific
    skillsAnswers,
    skillsQuestions,
    skillsTotal,
    skillsIsComplete,
    skillsProgress,
    skillsProfile,
    skillsCurrentSubCategory,
    skillsSubCategoryIndex,
    skillsSubCategoryTotal,
    skillsInterstitialPending,
    skillsPendingNextSubCategory,
    // Occupation count (for hard-filter display on ResultsPage)
    totalOccupations: computed(() => occupations.value?.length ?? 0),
    // Results & actions
    results,
    answer,
    previous,
    reset,
    resetCurrentLayer,
    repeatLayer,
    updateValuesAnswer,
    startBigFiveLayer,
    startValuesLayer,
    startSkillsLayer,
    dismissSkillsInterstitial,
    persist,
    hydrate,
    loadOccupations,
    loadBigFiveProfiles,
  }
})
