/**
 * Store-layer tests for the questionnaire Pinia store.
 *
 * Uses `fake-indexeddb/auto` (scoped to this file via the import below, so
 * sibling tests stay in a plain node environment) to give Dexie a real
 * IndexedDB implementation. That lets us exercise the persist-on-change
 * watcher and the hydrate() flow end-to-end against real data imports,
 * the same way the app wires them up at runtime.
 */
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useQuestionnaireStore } from './store'
import { db } from '@shared/config/db'
import type { AssessmentSession } from '@entities/assessment/model/types'

/**
 * Let the reactive watcher fire and the async persist() call (including
 * the dynamic occupations import on completion and the fake-IDB
 * transaction commit) settle before the next assertion. Four
 * microtasks + four macrotasks is overkill for fake-IDB writes of a tiny
 * row, but `persist()` now awaits `loadOccupations()` when isComplete,
 * which adds a chain of dynamic-import + ref-assignment microtasks
 * between the watcher firing and the Dexie write. Keeps the tests stable
 * without having to poll for state.
 */
async function flushPersist(): Promise<void> {
  for (let i = 0; i < 6; i += 1) await nextTick()
  for (let i = 0; i < 6; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

describe('questionnaire store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.sessions.clear()
  })

  describe('actions: answer / previous / reset', () => {
    it('starts at question 0 with no answers and isComplete=false', () => {
      const store = useQuestionnaireStore()
      expect(store.answers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.isComplete).toBe(false)
      expect(store.progress).toBe(0)
      // Full O*NET Interest Profiler Short Form: 60 items, 10 per RIASEC
      // dimension. This guards against a regression that silently shrinks
      // the questionnaire back to the PoC subset and invalidates the
      // downstream scoring assertions.
      expect(store.total).toBe(60)
    })

    it('answer() records the response and advances currentIndex', () => {
      const store = useQuestionnaireStore()
      store.answer(3)
      expect(store.answers).toHaveLength(1)
      expect(store.answers[0]?.value).toBe(3)
      expect(store.currentIndex).toBe(1)
      expect(store.progress).toBeCloseTo(1 / 60)
    })

    it('answer() overwrites a re-answered question instead of duplicating', () => {
      const store = useQuestionnaireStore()
      store.answer(2)
      const firstQid = store.answers[0]?.questionId
      store.previous()
      expect(store.currentIndex).toBe(0)
      store.answer(5)
      expect(store.answers).toHaveLength(1)
      expect(store.answers[0]?.questionId).toBe(firstQid)
      expect(store.answers[0]?.value).toBe(5)
    })

    it('answer() on the last question does not step past the end', () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.total; i += 1) store.answer(3)
      expect(store.answers).toHaveLength(store.total)
      expect(store.currentIndex).toBe(store.total - 1) // clamped, not total
      expect(store.isComplete).toBe(true)
    })

    it('previous() decrements currentIndex and clamps at 0', () => {
      const store = useQuestionnaireStore()
      store.answer(3)
      store.answer(3)
      expect(store.currentIndex).toBe(2)
      store.previous()
      store.previous()
      store.previous() // one too many
      expect(store.currentIndex).toBe(0)
    })

    it('progress tracks currentIndex, so previous() lowers the displayed percent', () => {
      // Regression guard: progress used to be `answers.length / total`
      // which stayed frozen at the high-water mark when the user
      // stepped back. Binding progress to currentIndex instead makes
      // the bar follow the user's actual position in the layer.
      const store = useQuestionnaireStore()
      for (let i = 0; i < 15; i += 1) store.answer(3)
      expect(store.currentIndex).toBe(15)
      expect(store.progress).toBeCloseTo(15 / 60)

      store.previous()
      expect(store.currentIndex).toBe(14)
      // Before the fix this would still read 15/60 because
      // answers.length is still 15 — the whole point of the bug.
      expect(store.progress).toBeCloseTo(14 / 60)

      store.previous()
      store.previous()
      expect(store.currentIndex).toBe(12)
      expect(store.progress).toBeCloseTo(12 / 60)
    })

    it('progress jumps to 100% once the layer is complete (handles the currentIndex clamp edge)', () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.total; i += 1) store.answer(3)
      // `answerLayer` clamps the last advance so currentIndex stays at
      // total-1 after the final click. Without the isComplete
      // short-circuit, progress would read 59/60 ≈ 98% for the brief
      // moment before navigation instead of hitting 100%.
      expect(store.currentIndex).toBe(store.total - 1)
      expect(store.isComplete).toBe(true)
      expect(store.progress).toBe(1)
    })

    it('reset() clears answers, currentIndex, and assigns a new sessionId', () => {
      const store = useQuestionnaireStore()
      const originalId = store.sessionId
      store.answer(4)
      store.answer(4)
      store.reset()
      expect(store.answers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.sessionId).not.toBe(originalId)
    })
  })

  describe('computed: scoring & results', () => {
    it('riasecProfile sums Likert responses per dimension', () => {
      const store = useQuestionnaireStore()
      // Full Interest Profiler Short Form is evenly distributed 10 items
      // per RIASEC dimension, so answering all 60 with value 3 must land
      // exactly on 30 per dim (10 × 3).
      for (let i = 0; i < store.total; i += 1) store.answer(3)
      const p = store.riasecProfile
      expect(p.R).toBe(30)
      expect(p.I).toBe(30)
      expect(p.A).toBe(30)
      expect(p.S).toBe(30)
      expect(p.E).toBe(30)
      expect(p.C).toBe(30)
    })

    it('riasecPercent normalizes each dimension to 100 when maxed out', () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.total; i += 1) store.answer(5)
      const p = store.riasecPercent
      expect(p.R).toBe(100)
      expect(p.I).toBe(100)
      expect(p.A).toBe(100)
      expect(p.S).toBe(100)
      expect(p.E).toBe(100)
      expect(p.C).toBe(100)
    })

    it('results populates once the session is complete and occupations are loaded', async () => {
      const store = useQuestionnaireStore()
      expect(store.results).toEqual([])
      for (let i = 0; i < store.total - 1; i += 1) store.answer(4)
      expect(store.isComplete).toBe(false)
      expect(store.results).toEqual([])
      store.answer(4)
      expect(store.isComplete).toBe(true)
      // Occupations are lazy-loaded from a separate chunk: results stays
      // empty after completion until loadOccupations() resolves. This is
      // the intentional trade-off for keeping the ~500 KB dataset out of
      // the landing-page bundle.
      expect(store.results).toEqual([])
      await store.loadOccupations()
      // The store returns the full ranked list (pagination happens in the
      // UI). With the 923-entry O*NET dataset that's comfortably > 20 — a
      // loose bound is enough to guard against a regression to the old
      // hardcoded topN = 20 cap.
      expect(store.results.length).toBeGreaterThan(20)
    })

    it('loadOccupations is idempotent and returns the same dataset on repeat calls', async () => {
      const store = useQuestionnaireStore()
      const first = await store.loadOccupations()
      const second = await store.loadOccupations()
      // Module-scoped promise cache means both calls resolve to the exact
      // same array reference — not just structurally equal. Guards against
      // a regression where a second caller kicks off a duplicate fetch.
      expect(second).toBe(first)
      expect(first.length).toBeGreaterThan(0)
    })
  })

  describe('persistence: watcher → Dexie', () => {
    it('watcher writes the in-progress session after an answer', async () => {
      const store = useQuestionnaireStore()
      store.answer(4)
      await flushPersist()

      const rows = await db.sessions.toArray()
      expect(rows).toHaveLength(1)
      expect(rows[0]?.id).toBe(store.sessionId)
      expect(rows[0]?.answers).toHaveLength(1)
      expect(rows[0]?.answers[0]?.value).toBe(4)
      expect(rows[0]?.completedAt).toBeUndefined()
    })

    it('watcher writes completedAt + results once the session is complete', async () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.total; i += 1) store.answer(4)
      await flushPersist()

      const row = await db.sessions.get(store.sessionId)
      expect(row).toBeDefined()
      expect(row?.answers).toHaveLength(store.total)
      expect(typeof row?.completedAt).toBe('number')
      expect(row?.riasecProfile).toBeDefined()
      expect(row?.results?.length ?? 0).toBeGreaterThan(0)
    })

    it('watcher persists empty resets so hydrate finds the fresh session', async () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.total; i += 1) store.answer(4)
      await flushPersist()
      const completedId = store.sessionId

      store.reset()
      await flushPersist()

      const latest = await db.sessions
        .orderBy('startedAt')
        .reverse()
        .first()
      // The reset overwrote the "latest" session in the hydration query —
      // without this behavior, reloading /test right after clicking "Test
      // starten" would rehydrate the previous completed run.
      expect(latest?.id).not.toBe(completedId)
      expect(latest?.answers).toEqual([])
      expect(latest?.completedAt).toBeUndefined()
    })
  })

  describe('hydration: Dexie → store', () => {
    it('restores an in-progress session and resumes at the next unanswered question', async () => {
      const seed: AssessmentSession = {
        id: 'seed-in-progress',
        startedAt: Date.now() - 1000,
        answers: [
          { questionId: 'ip-r-01', value: 5, answeredAt: Date.now() - 900 },
          { questionId: 'ip-r-03', value: 4, answeredAt: Date.now() - 800 },
          { questionId: 'ip-i-01', value: 3, answeredAt: Date.now() - 700 },
        ],
      }
      await db.sessions.put(seed)

      const store = useQuestionnaireStore()
      await store.hydrate()

      expect(store.sessionId).toBe('seed-in-progress')
      expect(store.answers).toHaveLength(3)
      expect(store.currentIndex).toBe(3) // next unanswered
      expect(store.isComplete).toBe(false)
    })

    it('restores a completed session and clamps currentIndex to total-1', async () => {
      // Seed 60 answers to simulate a fully completed Interest Profiler
      // session. The fake questionIds don't need to match real items —
      // hydrate() just restores the array verbatim; the clamp logic reads
      // answers.length against total.
      const seedAnswers = Array.from({ length: 60 }, (_, i) => ({
        questionId: `seed-q-${i}`,
        value: 3,
        answeredAt: Date.now(),
      }))
      await db.sessions.put({
        id: 'seed-complete',
        startedAt: Date.now() - 1000,
        completedAt: Date.now() - 500,
        answers: seedAnswers,
        riasecProfile: { R: 30, I: 30, A: 30, S: 30, E: 30, C: 30 },
        results: [],
      })

      const store = useQuestionnaireStore()
      await store.hydrate()

      expect(store.answers).toHaveLength(60)
      // Without the clamp, currentIndex would land on 60 and currentQuestion
      // would fall off the end of the questions array.
      expect(store.currentIndex).toBe(store.total - 1)
      expect(store.isComplete).toBe(true)
    })

    it('is a no-op when Dexie is empty', async () => {
      const store = useQuestionnaireStore()
      const originalId = store.sessionId
      await store.hydrate()
      expect(store.sessionId).toBe(originalId)
      expect(store.answers).toEqual([])
      expect(store.currentIndex).toBe(0)
    })

    it('picks the most recent session by startedAt, not arbitrary insertion order', async () => {
      // Inserted in "old first, newer second" order; the hydrate query must
      // still pick `newer` because of the reverse-by-startedAt sort.
      await db.sessions.bulkPut([
        {
          id: 'old',
          startedAt: 100,
          completedAt: 200,
          answers: Array.from({ length: 10 }, (_, i) => ({
            questionId: `old-${i}`,
            value: 3,
            answeredAt: 150,
          })),
        },
        {
          id: 'newer',
          startedAt: 500,
          answers: [
            { questionId: 'ip-r-01', value: 5, answeredAt: 550 },
          ],
        },
      ])

      const store = useQuestionnaireStore()
      await store.hydrate()

      expect(store.sessionId).toBe('newer')
      expect(store.answers).toHaveLength(1)
    })

    it('second hydrate() call is a no-op so intervening user input is not clobbered', async () => {
      await db.sessions.put({
        id: 'seed-1',
        startedAt: Date.now(),
        answers: [{ questionId: 'ip-r-01', value: 5, answeredAt: Date.now() }],
      })

      const store = useQuestionnaireStore()
      await store.hydrate()
      expect(store.answers).toHaveLength(1)

      // Mutate the in-memory state, then call hydrate() again. The second
      // call must NOT rewind the user's progress to the seeded state.
      store.answer(2)
      const beforeSecondHydrate = store.answers.length
      await store.hydrate()
      expect(store.answers).toHaveLength(beforeSecondHydrate)
    })
  })

  describe('question order: per-session shuffle', () => {
    // The literal source order from onet-items.json (R-block, I-block, ...)
    // used to assert shuffled orders are not accidentally the identity.
    const sourceOrderIds = [
      'ip-r-01', 'ip-r-02', 'ip-r-03', 'ip-r-04', 'ip-r-05',
      'ip-r-06', 'ip-r-07', 'ip-r-08', 'ip-r-09', 'ip-r-10',
      'ip-i-01', 'ip-i-02', 'ip-i-03', 'ip-i-04', 'ip-i-05',
      'ip-i-06', 'ip-i-07', 'ip-i-08', 'ip-i-09', 'ip-i-10',
      'ip-a-01', 'ip-a-02', 'ip-a-03', 'ip-a-04', 'ip-a-05',
      'ip-a-06', 'ip-a-07', 'ip-a-08', 'ip-a-09', 'ip-a-10',
      'ip-s-01', 'ip-s-02', 'ip-s-03', 'ip-s-04', 'ip-s-05',
      'ip-s-06', 'ip-s-07', 'ip-s-08', 'ip-s-09', 'ip-s-10',
      'ip-e-01', 'ip-e-02', 'ip-e-03', 'ip-e-04', 'ip-e-05',
      'ip-e-06', 'ip-e-07', 'ip-e-08', 'ip-e-09', 'ip-e-10',
      'ip-c-01', 'ip-c-02', 'ip-c-03', 'ip-c-04', 'ip-c-05',
      'ip-c-06', 'ip-c-07', 'ip-c-08', 'ip-c-09', 'ip-c-10',
    ]

    it('a fresh store produces a valid permutation of all 60 source items', () => {
      const store = useQuestionnaireStore()
      const ids = store.questions.map((q) => q.id)
      expect(ids).toHaveLength(60)
      // Same set of IDs as the source, just (almost certainly) reordered.
      expect(new Set(ids)).toEqual(new Set(sourceOrderIds))
      // No duplicates — asserted implicitly by the set equality above, but
      // a direct check documents the invariant.
      expect(new Set(ids).size).toBe(60)
    })

    it('shuffled order is not the source order (probabilistic; 1/60! failure rate)', () => {
      // A random permutation of 60 elements has a vanishing probability
      // (1/60! ≈ 10⁻⁸²) of being identical to the identity permutation.
      // Treat a failure here as "Fisher-Yates regressed to identity"
      // rather than "cosmic ray" — the odds of coincidence are nil.
      const store = useQuestionnaireStore()
      const ids = store.questions.map((q) => q.id)
      expect(ids).not.toEqual(sourceOrderIds)
    })

    it('reset() generates a new order different from the previous run', () => {
      const store = useQuestionnaireStore()
      const before = store.questions.map((q) => q.id)
      store.reset()
      const after = store.questions.map((q) => q.id)
      // Same guarantee: two random permutations of 60 elements collide
      // with probability 1/60!. If this flakes, Fisher-Yates is broken,
      // not unlucky.
      expect(after).not.toEqual(before)
      // Still a valid permutation of the full set.
      expect(new Set(after)).toEqual(new Set(sourceOrderIds))
    })

    it('persists questionOrder with each session write', async () => {
      const store = useQuestionnaireStore()
      const expected = store.questions.map((q) => q.id)
      store.answer(4)
      await flushPersist()

      const row = await db.sessions.get(store.sessionId)
      expect(row?.questionOrder).toEqual(expected)
    })

    it('hydrate restores the exact order that was persisted', async () => {
      // Authored custom order (reverse of source) to prove hydrate uses
      // the persisted value verbatim, not the module-level shuffle that
      // runs on store creation.
      const customOrder = [...sourceOrderIds].reverse()
      await db.sessions.put({
        id: 'seed-order',
        startedAt: Date.now(),
        answers: [],
        questionOrder: customOrder,
      })

      const store = useQuestionnaireStore()
      await store.hydrate()

      expect(store.questions.map((q) => q.id)).toEqual(customOrder)
      // First question the user will see matches the restored order, not
      // whatever random shuffle the store initialized with.
      expect(store.currentQuestion?.id).toBe(customOrder[0])
    })

    it('hydrate falls back to source order for legacy sessions with no questionOrder', async () => {
      // Pre-shuffle session (as written by the app before this PR) has no
      // questionOrder field. Its currentIndex is implicitly authored
      // against source order, so fallback must be source order — not the
      // module-level shuffle that the store happened to create on init.
      await db.sessions.put({
        id: 'legacy-session',
        startedAt: Date.now(),
        answers: [
          { questionId: 'ip-r-01', value: 5, answeredAt: Date.now() },
          { questionId: 'ip-r-02', value: 4, answeredAt: Date.now() },
          { questionId: 'ip-r-03', value: 3, answeredAt: Date.now() },
        ],
      })

      const store = useQuestionnaireStore()
      await store.hydrate()

      expect(store.questions.map((q) => q.id)).toEqual(sourceOrderIds)
      expect(store.currentIndex).toBe(3) // next unanswered, lines up with source order
    })

    it('hydrate rejects a tampered questionOrder (wrong length) and falls back to source', async () => {
      await db.sessions.put({
        id: 'tampered-order',
        startedAt: Date.now(),
        answers: [],
        questionOrder: ['ip-r-01', 'ip-r-02'], // only 2 entries
      })

      const store = useQuestionnaireStore()
      await store.hydrate()

      // Fell back to the 60-item source order instead of trusting the
      // short list — otherwise `total` would drop to 2 and the rest of
      // the questionnaire would be unreachable.
      expect(store.total).toBe(60)
      expect(store.questions.map((q) => q.id)).toEqual(sourceOrderIds)
    })
  })

  describe('Big Five layer (Phase 2 / Layer 2)', () => {
    it('starts with a bigfive pool of 50 items that defaults to NOT active', () => {
      const store = useQuestionnaireStore()
      expect(store.currentLayer).toBe('riasec')
      // Full IPIP Big Five Factor Markers set: 10 items per dimension × 5
      // dimensions = 50. Same "shrink guard" as the RIASEC total assertion.
      expect(store.bigfiveTotal).toBe(50)
      expect(store.bigfiveAnswers).toEqual([])
      expect(store.bigfiveIsComplete).toBe(false)
      // Layer-aware alias stays on RIASEC because currentLayer is still
      // 'riasec' — AssessmentPage must not accidentally render Big Five
      // items for a fresh store.
      expect(store.total).toBe(60)
    })

    it('startBigFiveLayer() flips currentLayer and makes the layer-aware aliases point at Big Five state', () => {
      const store = useQuestionnaireStore()
      store.startBigFiveLayer()
      expect(store.currentLayer).toBe('bigfive')
      // Aliases now reflect Big Five — existing UI (AssessmentPage) reads
      // these without knowing which layer it's on.
      expect(store.total).toBe(50)
      expect(store.answers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.isComplete).toBe(false)
    })

    it('answer() writes to the Big Five layer when currentLayer=bigfive without touching RIASEC state', () => {
      const store = useQuestionnaireStore()
      // Seed one RIASEC answer to prove it survives the layer switch.
      store.answer(4)
      expect(store.riasecAnswers).toHaveLength(1)

      store.startBigFiveLayer()
      store.answer(5)
      store.answer(2)

      expect(store.bigfiveAnswers).toHaveLength(2)
      expect(store.bigfiveAnswers[0]?.value).toBe(5)
      // RIASEC layer is frozen during Big Five answering — switching
      // back must find the seeded answer untouched.
      expect(store.riasecAnswers).toHaveLength(1)
      expect(store.riasecAnswers[0]?.value).toBe(4)
    })

    it('answering all 50 Big Five items flips bigfiveIsComplete and populates bigfiveProfile', () => {
      const store = useQuestionnaireStore()
      // Complete RIASEC first so the layer transition lands on Big Five.
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      store.startBigFiveLayer()
      for (let i = 0; i < store.bigfiveTotal; i += 1) store.answer(3)

      expect(store.bigfiveIsComplete).toBe(true)
      // Value 3 on every Big Five item: reverse-keyed items flip 3 → 3
      // too, so every dimension sums to 10 × 3 = 30 — the same
      // fixed-point reasoning as the RIASEC neutral-answer test.
      const p = store.bigfiveProfile
      expect(p.openness).toBe(30)
      expect(p.conscientiousness).toBe(30)
      expect(p.extraversion).toBe(30)
      expect(p.agreeableness).toBe(30)
      expect(p.neuroticism).toBe(30)
    })

    it('persist() writes the Big Five layer state to Dexie', async () => {
      const store = useQuestionnaireStore()
      // Complete RIASEC (persist triggers on each answer so no manual call
      // needed) and partial Big Five.
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      store.startBigFiveLayer()
      store.answer(4)
      store.answer(5)
      await flushPersist()

      const row = await db.sessions.get(store.sessionId)
      expect(row).toBeDefined()
      expect(row?.bigfiveAnswers).toHaveLength(2)
      expect(row?.bigfiveAnswers?.[0]?.value).toBe(4)
      expect(row?.currentLayer).toBe('bigfive')
      // Big Five profile is undefined until the layer is complete — we
      // only snapshot computed profiles when they're meaningful.
      expect(row?.bigfiveProfile).toBeUndefined()
      expect(row?.bigfiveOrder).toBeDefined()
      expect(row?.bigfiveOrder?.length).toBe(50)
    })

    it('hydrate restores Big Five state including the active layer and partial answers', async () => {
      await db.sessions.put({
        id: 'seed-bigfive',
        startedAt: Date.now(),
        answers: Array.from({ length: 60 }, (_, i) => ({
          questionId: `seed-r-${i}`,
          value: 3,
          answeredAt: 0,
        })),
        currentLayer: 'bigfive',
        bigfiveAnswers: [
          { questionId: 'bf-o-01', value: 5, answeredAt: 100 },
          { questionId: 'bf-o-02', value: 4, answeredAt: 200 },
          { questionId: 'bf-o-03', value: 3, answeredAt: 300 },
        ],
      })

      const store = useQuestionnaireStore()
      await store.hydrate()

      expect(store.currentLayer).toBe('bigfive')
      expect(store.bigfiveAnswers).toHaveLength(3)
      // Layer-aware currentIndex resumes at the next unanswered Big Five
      // slot, not at the RIASEC end-position.
      expect(store.currentIndex).toBe(3)
      expect(store.total).toBe(50)
      expect(store.isComplete).toBe(false)
    })

    it('hydrate of a pre-Phase-2 (legacy) session defaults currentLayer to riasec with empty Big Five state', async () => {
      await db.sessions.put({
        id: 'legacy',
        startedAt: Date.now(),
        answers: [
          { questionId: 'ip-r-01', value: 5, answeredAt: Date.now() },
        ],
        // No currentLayer, no bigfiveAnswers, no bigfiveOrder — this is
        // what Dexie rows written before Phase 2 look like.
      })

      const store = useQuestionnaireStore()
      await store.hydrate()

      expect(store.currentLayer).toBe('riasec')
      expect(store.bigfiveAnswers).toEqual([])
      expect(store.bigfiveIsComplete).toBe(false)
      // RIASEC side still restores correctly — the legacy path must not
      // regress the existing behaviour.
      expect(store.riasecAnswers).toHaveLength(1)
    })

    it('reset() clears both layers and returns currentLayer to riasec', () => {
      const store = useQuestionnaireStore()
      store.answer(4)
      store.startBigFiveLayer()
      store.answer(5)
      expect(store.bigfiveAnswers).toHaveLength(1)

      store.reset()

      expect(store.currentLayer).toBe('riasec')
      expect(store.riasecAnswers).toEqual([])
      expect(store.bigfiveAnswers).toEqual([])
      // currentIndex is the layer-aware alias; with currentLayer='riasec'
      // after reset it reads riasecCurrentIndex.
      expect(store.currentIndex).toBe(0)
    })

    it('resetCurrentLayer() in the RIASEC layer clears only RIASEC and preserves sessionId', () => {
      const store = useQuestionnaireStore()
      const originalId = store.sessionId
      store.answer(4)
      store.answer(3)
      expect(store.riasecAnswers).toHaveLength(2)

      store.resetCurrentLayer()

      expect(store.riasecAnswers).toEqual([])
      expect(store.currentIndex).toBe(0)
      // sessionId must stay — this is a within-session re-run, not a new
      // session. The AssessmentPage button ("Schicht neu starten") relies
      // on this so the Dexie row stays linked and hydrate still finds
      // the same run.
      expect(store.sessionId).toBe(originalId)
    })

    it('resetCurrentLayer() in the Big Five layer wipes Big Five but leaves RIASEC completion intact', () => {
      const store = useQuestionnaireStore()
      // Full RIASEC run …
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(4)
      expect(store.riasecIsComplete).toBe(true)
      const riasecProfileSnapshot = { ...store.riasecProfile }

      // … then a partial Big Five run …
      store.startBigFiveLayer()
      store.answer(5)
      store.answer(5)
      store.answer(5)
      expect(store.bigfiveAnswers).toHaveLength(3)

      // … and a "Schicht neu starten" click while still in Big Five.
      store.resetCurrentLayer()

      // Big Five side wiped clean.
      expect(store.bigfiveAnswers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.currentLayer).toBe('bigfive')
      // RIASEC side completely untouched — the whole point of the
      // layer-scoped reset vs. the full reset(). Asserting on both the
      // answer length and the computed profile guards against a silent
      // cross-layer mutation.
      expect(store.riasecAnswers).toHaveLength(store.riasecTotal)
      expect(store.riasecIsComplete).toBe(true)
      expect(store.riasecProfile).toEqual(riasecProfileSnapshot)
    })

    it('resetCurrentLayer() re-shuffles the active layer order so a retry is not the same sequence', () => {
      const store = useQuestionnaireStore()
      store.startBigFiveLayer()
      const orderBefore = store.bigfiveQuestions.map((q) => q.id)
      store.resetCurrentLayer()
      const orderAfter = store.bigfiveQuestions.map((q) => q.id)
      // Two 50-item Fisher-Yates shuffles colliding by chance is 1/50!
      // — the same probabilistic guarantee the RIASEC shuffle tests
      // rely on. Any real collision is a Fisher-Yates regression.
      expect(orderAfter).not.toEqual(orderBefore)
      expect(new Set(orderAfter)).toEqual(new Set(orderBefore))
    })
  })

  describe('Big Five re-ranking (PR B)', () => {
    it('results include riasecCorrelation and null bigFiveModifier when only RIASEC is done', async () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(4)
      await flushPersist()
      await store.loadOccupations()

      expect(store.results.length).toBeGreaterThan(0)
      const first = store.results[0]
      expect(first.riasecCorrelation).toBeDefined()
      expect(first.riasecCorrelation).toBe(first.fitScore)
      expect(first.bigFiveModifier).toBeNull()
    })

    it('results re-rank when Big Five is completed and profiles are loaded', async () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(4)
      await flushPersist()
      await store.loadOccupations()
      await store.loadBigFiveProfiles()

      store.startBigFiveLayer()
      for (let i = 0; i < store.bigfiveTotal; i += 1) store.answer((i % 5) + 1)
      await flushPersist()

      const withBigFive = store.results
      const hasModifiers = withBigFive.some((r) => r.bigFiveModifier !== null)
      expect(hasModifiers).toBe(true)

      const mapped = withBigFive.filter((r) => r.bigFiveModifier !== null)
      expect(mapped.length).toBeGreaterThan(0)
      const withShift = mapped.filter((r) => Math.abs(r.bigFiveModifier! - 1.0) > 0.001)
      expect(withShift.length).toBeGreaterThan(0)

      const unmapped = withBigFive.filter((r) => r.bigFiveModifier === null)
      for (const r of unmapped) {
        expect(r.fitScore).toBe(r.riasecCorrelation)
      }
    })
  })

  describe('values layer (Layer 3)', () => {
    it('starts with empty values state', () => {
      const store = useQuestionnaireStore()
      expect(store.valuesAnswers).toEqual([])
      expect(store.valuesIsComplete).toBe(false)
      expect(store.valuesTotal).toBe(8)
    })

    it('startValuesLayer switches currentLayer to values', () => {
      const store = useQuestionnaireStore()
      store.startValuesLayer()
      expect(store.currentLayer).toBe('values')
    })

    it('answer() records values answers when in values layer', () => {
      const store = useQuestionnaireStore()
      store.startValuesLayer()
      store.answer(4)
      expect(store.valuesAnswers).toHaveLength(1)
      expect(store.valuesAnswers[0].value).toBe(4)
      // RIASEC answers untouched
      expect(store.riasecAnswers).toHaveLength(0)
    })

    it('valuesIsComplete after answering all 8 questions', () => {
      const store = useQuestionnaireStore()
      store.startValuesLayer()
      for (let i = 0; i < store.valuesTotal; i += 1) store.answer(3)
      expect(store.valuesIsComplete).toBe(true)
    })

    it('resetCurrentLayer clears only values state', () => {
      const store = useQuestionnaireStore()
      // Complete RIASEC first
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      const riasecCount = store.riasecAnswers.length
      // Start and partially answer values
      store.startValuesLayer()
      store.answer(2)
      store.answer(4)
      expect(store.valuesAnswers).toHaveLength(2)
      // Reset only values
      store.resetCurrentLayer()
      expect(store.valuesAnswers).toHaveLength(0)
      expect(store.riasecAnswers).toHaveLength(riasecCount)
    })

    it('reset clears all layers including values', () => {
      const store = useQuestionnaireStore()
      store.startValuesLayer()
      store.answer(1)
      store.reset()
      expect(store.valuesAnswers).toHaveLength(0)
      expect(store.currentLayer).toBe('riasec')
    })

    it('persist and hydrate round-trip values state', async () => {
      const store = useQuestionnaireStore()
      // Complete RIASEC
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      // Start values and answer some
      store.startValuesLayer()
      store.answer(5)
      store.answer(2)
      await flushPersist()

      // New store, hydrate
      setActivePinia(createPinia())
      const store2 = useQuestionnaireStore()
      await store2.hydrate()
      expect(store2.currentLayer).toBe('values')
      expect(store2.valuesAnswers).toHaveLength(2)
      expect(store2.valuesAnswers[0].value).toBe(5)
      expect(store2.valuesAnswers[1].value).toBe(2)
    })

    it('results include valuesPenalty when values complete', async () => {
      const store = useQuestionnaireStore()
      // Complete RIASEC
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer((i % 5) + 1)
      await store.loadOccupations()
      // Complete values (all extreme answers to create penalties)
      store.startValuesLayer()
      for (let i = 0; i < store.valuesTotal; i += 1) store.answer(5)
      expect(store.valuesIsComplete).toBe(true)

      // Results should have valuesPenalty populated
      const withPenalty = store.results.filter((r) => r.valuesPenalty !== null)
      expect(withPenalty.length).toBeGreaterThan(0)
    })
  })
})
