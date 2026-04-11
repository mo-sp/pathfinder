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
import occupationsData from '@data/onet-occupations.json'

const POC_ITEM_IDS = [
  'ip-r-01', // Build kitchen cabinets
  'ip-r-03', // Repair household appliances
  'ip-i-01', // Develop a new medicine
  'ip-i-08', // Work in a biology lab
  'ip-a-01', // Write books or plays
  'ip-a-04', // Draw pictures
  'ip-s-02', // Help people with personal/emotional problems
  'ip-s-10', // Teach a high-school class
  'ip-e-05', // Start your own business
  'ip-c-01', // Develop a spreadsheet using computer software
] as const

interface ItemsFile {
  items: Question[]
}

const allItems = (itemsData as ItemsFile).items
const occupations = occupationsData as Occupation[]

export const useQuestionnaireStore = defineStore('questionnaire', () => {
  const sessionId = ref<string>(uuid())
  const startedAt = ref<number>(Date.now())
  const answers = ref<Answer[]>([])
  const currentIndex = ref(0)

  // PoC: 10 hand-picked items in German.
  const questions = computed<Question[]>(() =>
    POC_ITEM_IDS.map((id) => allItems.find((q) => q.id === id)).filter(
      (q): q is Question => q != null,
    ),
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
  }

  const riasecProfile = computed<RIASECProfile>(() =>
    computeRiasecProfile(answers.value, questions.value),
  )

  const riasecPercent = computed<RIASECProfile>(() =>
    normalizeRiasecToPercent(riasecProfile.value, questions.value),
  )

  const results = computed<MatchResult[]>(() =>
    isComplete.value ? matchOccupations(riasecProfile.value, occupations, 20) : [],
  )

  async function persist(): Promise<void> {
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
  }
})
