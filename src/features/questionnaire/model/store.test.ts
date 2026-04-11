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
  for (let i = 0; i < 4; i += 1) await nextTick()
  for (let i = 0; i < 4; i += 1) {
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
      expect(store.results.length).toBeGreaterThan(0)
      expect(store.results.length).toBeLessThanOrEqual(20)
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
})
