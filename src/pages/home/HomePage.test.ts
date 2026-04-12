// @vitest-environment jsdom
/**
 * Component-level tests for HomePage.
 *
 * Mounts the page against a fresh Pinia + a stub router and asserts that
 * (a) the title and CTA render with the live question count from the
 * store, (b) clicking the CTA calls store.reset() — the homepage's
 * fresh-start guarantee that AssessmentPage's mount-time check relies on
 * for the in-flow case, and (c) the CTA links to /test.
 */
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import HomePage from './HomePage.vue'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import { db } from '@shared/config/db'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomePage },
      // Stub /test target so the click navigation has somewhere to land.
      { path: '/test', component: { template: '<div />' } },
    ],
  })
}

function mountHomePage() {
  return mount(HomePage, {
    global: {
      plugins: [makeRouter()],
    },
  })
}

describe('HomePage', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.sessions.clear()
  })

  it('renders the title and the CTA with the live total question count', () => {
    const wrapper = mountHomePage()
    expect(wrapper.text()).toContain('Finde deinen Weg.')
    // 60 + 50 + 8 + 120 = 238 items across all 4 layers. Asserting the
    // full-scope total guards against a regression to the old PoC subsets
    // of any individual layer.
    expect(wrapper.text()).toContain('Test starten (238 Fragen gesamt)')
  })

  it('clicking "Test starten" calls store.reset() — the homepage fresh-start path', async () => {
    const store = useQuestionnaireStore()
    // Seed the store with some "previous run" state. After the click,
    // every field should be back to its initial state and the sessionId
    // should have been re-rolled. This is the same fresh-start guarantee
    // that AssessmentPage's setup-time check (PR #17) relies on for the
    // in-flow /test entries — exercised here from the homepage CTA path.
    store.answer(4)
    store.answer(5)
    const beforeId = store.sessionId
    expect(store.answers).toHaveLength(2)

    const wrapper = mountHomePage()
    await wrapper.find('a[href="/test"]').trigger('click')

    expect(store.answers).toEqual([])
    expect(store.currentIndex).toBe(0)
    expect(store.sessionId).not.toBe(beforeId)
  })

  it('the CTA links to /test', () => {
    const wrapper = mountHomePage()
    const cta = wrapper.find('a[href="/test"]')
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toContain('Test starten')
  })

  it('shows all four progressive-funnel layer cards (PROJECT.md §5 Layer 1-4)', () => {
    // Every planned layer must be visible upfront so users see the full
    // depth of the assessment from day one — Big Five and Values/Skills
    // land as refinement steps, not surprises. Active layers stay at
    // normal opacity, not-yet-implemented layers render muted via the
    // `opacity-60` class.
    const wrapper = mountHomePage()
    expect(wrapper.text()).toContain('Schicht 1: RIASEC')
    expect(wrapper.text()).toContain('Schicht 2: Big Five')
    expect(wrapper.text()).toContain('Schicht 3: Werte')
    expect(wrapper.text()).toContain('Schicht 4: Fähigkeiten')
  })
})
