// @vitest-environment jsdom
/**
 * Component-level tests for AssessmentPage.
 *
 * Highest-value test in this file: the setup-time fresh-start guard from
 * PR #17 (`if (store.isComplete) store.reset()` at the top of script
 * setup). It runs before the first render so a user navigating to /test
 * after a completed run never sees a flash of the old "last question"
 * state. The other tests cover Likert interaction, the Zurück disabled
 * boundary, the "Schicht neu starten" layer-scoped reset path, the
 * progress display, and the completion → router.push('/ergebnis') flow.
 */
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import AssessmentPage from './AssessmentPage.vue'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import { db } from '@shared/config/db'
import { i18n } from '@shared/lib/i18n'

function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/test', component: AssessmentPage },
      { path: '/ergebnis', component: { template: '<div />' } },
    ],
  })
}

function mountWith(router: Router) {
  return mount(AssessmentPage, {
    global: {
      plugins: [router, i18n],
    },
  })
}

describe('AssessmentPage', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.sessions.clear()
  })

  describe('setup-time fresh-start guard (PR #17 regression check)', () => {
    it('mounting with a complete session calls store.reset() before the first render', () => {
      const store = useQuestionnaireStore()
      // Seed a fully-complete run via the public answer() API — same code
      // path the user goes through, no internal state hacks.
      for (let i = 0; i < store.total; i += 1) store.answer(4)
      expect(store.isComplete).toBe(true)
      const completedId = store.sessionId

      const wrapper = mountWith(makeRouter())

      // The check `if (store.isComplete) store.reset()` runs in script
      // setup, before render. By the time mount() returns, answers must
      // be empty, currentIndex back to 0, sessionId re-rolled, and
      // "Frage 1 von 60" must be in the DOM — no flash of the stale
      // "last question" state. This is the entire point of doing the
      // check at setup time instead of in onMounted.
      expect(store.isComplete).toBe(false)
      expect(store.answers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.sessionId).not.toBe(completedId)
      expect(wrapper.text()).toContain('Frage 1 von 60')
    })

    it('mounting with an in-progress session preserves state and does NOT reset', () => {
      const store = useQuestionnaireStore()
      store.answer(3)
      store.answer(4)
      store.answer(5)
      expect(store.isComplete).toBe(false)
      const beforeId = store.sessionId

      const wrapper = mountWith(makeRouter())

      // The setup-time guard is scoped to `isComplete` only. In-progress
      // sessions sail through untouched: state, sessionId, and the
      // resume index all stay intact.
      expect(store.answers).toHaveLength(3)
      expect(store.currentIndex).toBe(3)
      expect(store.sessionId).toBe(beforeId)
      expect(wrapper.text()).toContain('Frage 4 von 60')
    })

    it('mounting with an empty store leaves the fresh state untouched', () => {
      const store = useQuestionnaireStore()
      const beforeId = store.sessionId

      const wrapper = mountWith(makeRouter())

      // No state to clear and no sessionId re-roll — the guard correctly
      // no-ops on a fresh store. (Same observable behavior as the
      // in-progress case, but documents the boundary explicitly.)
      expect(store.answers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.sessionId).toBe(beforeId)
      expect(wrapper.text()).toContain('Frage 1 von 60')
    })
  })

  describe('Likert interaction', () => {
    it('clicking a Likert button records the answer and advances to the next question', async () => {
      const store = useQuestionnaireStore()
      const wrapper = mountWith(makeRouter())
      expect(store.currentIndex).toBe(0)

      // The 5 Likert buttons render in document order before Zurück and
      // "Schicht neu starten", so findAll('button')[0..4] are values 1..5.
      const likertButtons = wrapper.findAll('button').slice(0, 5)
      expect(likertButtons).toHaveLength(5)

      await likertButtons[2]!.trigger('click') // value 3

      expect(store.answers).toHaveLength(1)
      expect(store.answers[0]?.value).toBe(3)
      expect(store.currentIndex).toBe(1)
      expect(wrapper.text()).toContain('Frage 2 von 60')
    })

    it('Zurück button is disabled at currentIndex 0', () => {
      const wrapper = mountWith(makeRouter())
      // Index 5 (after the 5 Likert buttons) is Zurück.
      const zurueck = wrapper.findAll('button')[5]!
      expect(zurueck.text()).toContain('Zurück')
      expect(zurueck.attributes('disabled')).toBeDefined()
    })

    it('"Schicht neu starten" clears the current layer and keeps sessionId (within-session re-run)', async () => {
      const store = useQuestionnaireStore()
      store.answer(4)
      store.answer(3)
      const beforeId = store.sessionId

      const wrapper = mountWith(makeRouter())
      const schichtNeu = wrapper.findAll('button')[6]!
      expect(schichtNeu.text()).toContain('Schicht neu starten')
      await schichtNeu.trigger('click')

      // Layer-scoped reset: RIASEC answers cleared, but sessionId stays
      // put — this is deliberately a within-session re-run, not a new
      // session. Contrast with HomePage "Test starten" which re-rolls
      // sessionId via the full store.reset() call.
      expect(store.riasecAnswers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.sessionId).toBe(beforeId)
    })

    it('"Schicht neu starten" in the Big Five layer preserves the completed RIASEC results', async () => {
      const store = useQuestionnaireStore()
      // Full RIASEC run, then promote to Big Five and answer a few.
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      store.startBigFiveLayer()
      store.answer(5)
      store.answer(4)
      store.answer(2)
      expect(store.bigfiveAnswers).toHaveLength(3)
      expect(store.riasecIsComplete).toBe(true)

      const wrapper = mountWith(makeRouter())
      const schichtNeu = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Schicht neu starten'))
      expect(schichtNeu).toBeDefined()
      await schichtNeu!.trigger('click')

      // Big Five layer is wiped …
      expect(store.bigfiveAnswers).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.currentLayer).toBe('bigfive')
      // … but RIASEC results are untouched. The user can back out to
      // /ergebnis, keep their original top-20, and re-answer Big Five
      // more deliberately this time.
      expect(store.riasecAnswers).toHaveLength(60)
      expect(store.riasecIsComplete).toBe(true)
    })

    it('progress display reflects answers / total', () => {
      const store = useQuestionnaireStore()
      store.answer(3)
      store.answer(4) // 2 of 60 answered, currentIndex == 2

      const wrapper = mountWith(makeRouter())

      // 1-based "Frage X von Y" display + percent rounded.
      expect(wrapper.text()).toContain('Frage 3 von 60')
      // Math.round((2/60) * 100) = 3
      expect(wrapper.text()).toContain('3 %')
    })
  })

  describe('Big Five layer rendering', () => {
    it('shows the Big Five prompt, 50-item total and agreement-scale Likert labels after startBigFiveLayer', () => {
      const store = useQuestionnaireStore()
      // Complete RIASEC so the setup-time guard doesn't reset the store
      // when it sees an "is-complete" layer. Then promote to Big Five.
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      store.startBigFiveLayer()
      expect(store.currentLayer).toBe('bigfive')

      const wrapper = mountWith(makeRouter())

      // Layer 2 label, agreement-scale prompt, and 1/50 counter all flow
      // from the layer-aware computeds — this is the one place that
      // verifies AssessmentPage stays layer-agnostic.
      expect(wrapper.text()).toContain('Schicht 2 · Persönlichkeit')
      expect(wrapper.text()).toContain('Wie sehr trifft diese Aussage auf dich zu?')
      expect(wrapper.text()).toContain('Frage 1 von 50')
      // Agreement-scale bottom label from `likert.bigfive.1`.
      expect(wrapper.text()).toContain('Trifft nicht zu')
      // The old interest-scale bottom label must NOT bleed through when
      // the Big Five layer is active — this is the regression guard for
      // the i18n key restructure (`likert.${currentLayer}.${value}`).
      expect(wrapper.text()).not.toContain('Sehr gerne')
    })

    it('clicking a Likert button in the Big Five layer records a Big Five answer and advances', async () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      store.startBigFiveLayer()

      const wrapper = mountWith(makeRouter())
      const likertButtons = wrapper.findAll('button').slice(0, 5)
      await likertButtons[3]!.trigger('click') // value 4

      expect(store.bigfiveAnswers).toHaveLength(1)
      expect(store.bigfiveAnswers[0]?.value).toBe(4)
      expect(store.currentIndex).toBe(1)
      expect(wrapper.text()).toContain('Frage 2 von 50')
      // RIASEC answers untouched by Big Five interactions — the layer
      // isolation the store promises must hold end-to-end through the
      // component.
      expect(store.riasecAnswers).toHaveLength(60)
    })
  })

  describe('"Ergebnisansicht" shortcut button', () => {
    it('is hidden while the user is still mid-RIASEC (no result to go back to yet)', () => {
      const store = useQuestionnaireStore()
      store.answer(3)
      store.answer(4)
      expect(store.riasecIsComplete).toBe(false)

      const wrapper = mountWith(makeRouter())
      const ergebnisButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Ergebnisansicht'))
      expect(ergebnisButton).toBeUndefined()
    })

    it('is visible during the Big Five layer once RIASEC is complete', () => {
      const store = useQuestionnaireStore()
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      store.startBigFiveLayer()
      store.answer(4) // partial Big Five

      const wrapper = mountWith(makeRouter())
      const ergebnisButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Ergebnisansicht'))
      expect(ergebnisButton).toBeDefined()
    })

    it('clicking it navigates to /ergebnis without mutating store state', async () => {
      const router = makeRouter()
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      const store = useQuestionnaireStore()
      for (let i = 0; i < store.riasecTotal; i += 1) store.answer(3)
      store.startBigFiveLayer()
      store.answer(5)
      store.answer(4)
      store.answer(3)

      const wrapper = mountWith(router)
      const ergebnisButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Ergebnisansicht'))!
      await ergebnisButton.trigger('click')

      await vi.waitFor(() => {
        expect(pushSpy).toHaveBeenCalledWith('/ergebnis')
      })

      // The whole point: partial Big Five answers must survive the
      // side trip to /ergebnis, so when the user comes back via the
      // Verfeinern CTA they land exactly where they left off.
      expect(store.bigfiveAnswers).toHaveLength(3)
      expect(store.riasecAnswers).toHaveLength(60)
      expect(store.currentLayer).toBe('bigfive')
    })
  })

  describe('completion → router push', () => {
    it('answering the final question triggers router.push("/ergebnis")', async () => {
      const router = makeRouter()
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      const store = useQuestionnaireStore()
      // Pre-answer all but the last question so the next click is the
      // final answer that triggers the navigation.
      for (let i = 0; i < store.total - 1; i += 1) store.answer(3)
      expect(store.isComplete).toBe(false)
      expect(store.currentIndex).toBe(store.total - 1)

      // Pre-warm the occupations dataset so the click's persist() call
      // doesn't have to wait on the 500 KB dynamic import. Without this,
      // selectAnswer's `await store.persist()` chain stretches past the
      // default flushAsync window and pushSpy hasn't fired yet by the
      // time we assert.
      await store.loadOccupations()

      const wrapper = mount(AssessmentPage, {
        global: { plugins: [router, i18n] },
      })

      const likertButtons = wrapper.findAll('button').slice(0, 5)
      await likertButtons[2]!.trigger('click') // any value, just complete

      // selectAnswer is async (store.answer → persist → router.push).
      // vi.waitFor polls until the spy fires or the default timeout
      // elapses, which is more robust than a fixed-tick flush against
      // the mock router resolution timing.
      await vi.waitFor(() => {
        expect(pushSpy).toHaveBeenCalledWith('/ergebnis')
      })

      expect(store.isComplete).toBe(true)
    })
  })
})
