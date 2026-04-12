// @vitest-environment jsdom
/**
 * Component-level tests for ResultsPage.
 *
 * Covers the two product-depth fixes that have only been verified in the
 * browser so far:
 *   - PR #15 uniform-answer banner: a flat profile shows the German
 *     explanation banner instead of a top-N list of zeros, the hexagon
 *     stays visible, and the "Mehr anzeigen" button is hidden.
 *   - PR #16 pagination: 20 results render initially, "Mehr anzeigen"
 *     reveals 20 more per click, the button disappears once every visible
 *     entry has fitScore > 0 (the natural cap that replaced the old hard
 *     20-result limit), and entries with fitScore ≤ 0 never appear.
 *
 * Plus the boundary cases: incomplete-session interstitial, the
 * "Test neu starten" path that resets the store AND navigates to /test
 * (the bug from Session 4 that left the user on the interstitial).
 */
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import ResultsPage from './ResultsPage.vue'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import { db } from '@shared/config/db'
import { i18n } from '@shared/lib/i18n'

function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/test', component: { template: '<div />' } },
      { path: '/ergebnis', component: ResultsPage },
    ],
  })
}

function mountWith(router: Router) {
  return mount(ResultsPage, {
    global: { plugins: [router, i18n] },
  })
}

/**
 * Seed the active store with a directional completed session: 60
 * answers cycling through values 1-5 produce per-dimension sums that are
 * (almost surely) not all equal once the per-session shuffle assigns
 * values to dimensions, so hasProfileDirection() is true and the matcher
 * yields a mix of positive and negative fitScores against the 923-entry
 * O*NET dataset. Awaits loadOccupations() so the results computed has
 * populated by the time the component mounts.
 */
async function seedDirectionalSession(): Promise<void> {
  const store = useQuestionnaireStore()
  for (let i = 0; i < store.total; i += 1) store.answer((i % 5) + 1)
  await store.loadOccupations()
}

/**
 * Seed an all-equal answer pattern so the user's RIASEC profile is
 * perfectly flat — Pearson's zero-variance guard then collapses every
 * occupation's fitScore to 0 and the uniform-answer banner takes over
 * the top-N slot.
 */
async function seedUniformSession(value: number): Promise<void> {
  const store = useQuestionnaireStore()
  for (let i = 0; i < store.total; i += 1) store.answer(value)
  await store.loadOccupations()
}

describe('ResultsPage', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await db.sessions.clear()
  })

  describe('incomplete session', () => {
    it('renders the "noch nicht abgeschlossen" interstitial when isComplete is false', () => {
      const wrapper = mountWith(makeRouter())
      expect(wrapper.text()).toContain('Du hast den Test noch nicht abgeschlossen')
      // Hexagon and top-N must NOT render in this state — the v-else
      // template branch is gated on isComplete.
      expect(wrapper.text()).not.toContain('Dein RIASEC-Profil')
      expect(wrapper.text()).not.toContain('Top-Berufsempfehlungen')
    })

    it('the interstitial links back to /test', () => {
      const wrapper = mountWith(makeRouter())
      const link = wrapper.find('a[href="/test"]')
      expect(link.exists()).toBe(true)
      expect(link.text()).toContain('Zum Test')
    })
  })

  describe('completed session with directional profile', () => {
    it('renders the title, hexagon SVG, and at least two RIASEC dimension labels from i18n', async () => {
      await seedDirectionalSession()
      const wrapper = mountWith(makeRouter())

      expect(wrapper.text()).toContain('Dein RIASEC-Profil')
      expect(wrapper.text()).toContain('Top-Berufsempfehlungen')
      // Two anchor labels from the i18n messages are enough to confirm
      // the legend is wired up; the hexagon component renders an SVG.
      expect(wrapper.text()).toContain('Realistisch')
      expect(wrapper.text()).toContain('Konventionell')
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('renders 20 result rows initially (PR #16 PAGE_SIZE)', async () => {
      await seedDirectionalSession()
      const wrapper = mountWith(makeRouter())
      const items = wrapper.findAll('ol > li')
      expect(items).toHaveLength(20)
    })

    it('"Mehr anzeigen" reveals another 20 rows on click', async () => {
      await seedDirectionalSession()
      const wrapper = mountWith(makeRouter())

      const moreButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Mehr anzeigen'))
      expect(moreButton).toBeDefined()
      await moreButton!.trigger('click')

      const items = wrapper.findAll('ol > li')
      expect(items).toHaveLength(40)
    })

    it('"Mehr anzeigen" disappears once every positive-fitScore match is visible, and zero/negative entries never render', async () => {
      await seedDirectionalSession()
      const store = useQuestionnaireStore()
      // Total positive matches in the store = the natural cap point.
      // Anything past this should never appear in the rendered list.
      const positiveCount = store.results.filter((r) => r.fitScore > 0).length
      expect(positiveCount).toBeGreaterThan(20) // sanity: pagination is meaningful

      const wrapper = mountWith(makeRouter())

      // Click "Mehr anzeigen" until it goes away. 100-click safety bound
      // so a regression to "always visible" doesn't infinite-loop.
      for (let i = 0; i < 100; i += 1) {
        const btn = wrapper
          .findAll('button')
          .find((b) => b.text().includes('Mehr anzeigen'))
        if (!btn) break
        await btn.trigger('click')
      }

      const moreButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Mehr anzeigen'))
      expect(moreButton).toBeUndefined()

      // Visible row count must equal the positive-fitScore count exactly:
      // every positive match is shown, no zero/negative ones leak in.
      const items = wrapper.findAll('ol > li')
      expect(items).toHaveLength(positiveCount)
    })
  })

  describe('uniform-answer banner (PR #15 regression check)', () => {
    it('shows the banner, hides the top-N list and "Mehr anzeigen", but keeps the hexagon visible', async () => {
      await seedUniformSession(3)
      const wrapper = mountWith(makeRouter())

      // Banner copy from the v-if="!hasDirection" branch in the template.
      expect(wrapper.text()).toContain(
        'Dein Profil ist auf allen sechs Dimensionen gleich gewichtet',
      )

      // Hexagon stays — a flat hexagon is itself useful visual feedback.
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.text()).toContain('Dein RIASEC-Profil')

      // No result list and no "Mehr anzeigen" button: the entire <template
      // v-else> branch of the v-if="!hasDirection" gate is suppressed.
      expect(wrapper.findAll('ol > li')).toHaveLength(0)
      const moreButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Mehr anzeigen'))
      expect(moreButton).toBeUndefined()
    })

    it.each([1, 5])(
      'catches the boundary uniform values too — value %i (not just the midpoint)',
      async (value) => {
        // The hasProfileDirection helper must catch all-low and all-high
        // uniform profiles, not just all-3. Otherwise a "min Likert"
        // user would slip past the banner and see the meaningless
        // top-N list of zeros.
        await seedUniformSession(value)
        const wrapper = mountWith(makeRouter())
        expect(wrapper.text()).toContain(
          'Dein Profil ist auf allen sechs Dimensionen gleich gewichtet',
        )
        expect(wrapper.findAll('ol > li')).toHaveLength(0)
      },
    )
  })

  describe('Big Five refinement block (Phase 2 / Layer 2)', () => {
    it('shows the "Persönlichkeitsprofil starten" CTA when RIASEC is complete but Big Five is not', async () => {
      await seedDirectionalSession()
      const wrapper = mountWith(makeRouter())

      // Heading from the v-else branch of the bigfiveIsComplete gate.
      expect(wrapper.text()).toContain('Ergebnis verfeinern')
      expect(wrapper.text()).toContain('50 zusätzliche Fragen')
      // BigFiveBars must NOT render yet — it's on the other side of the gate.
      expect(wrapper.text()).not.toContain('Dein Persönlichkeitsprofil')
    })

    it('clicking the CTA calls store.startBigFiveLayer() AND pushes /test', async () => {
      const router = makeRouter()
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      await seedDirectionalSession()
      const store = useQuestionnaireStore()

      const wrapper = mountWith(router)
      const ctaButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Persönlichkeitsprofil starten'))
      expect(ctaButton).toBeDefined()
      await ctaButton!.trigger('click')

      // Layer switch happens in-place — the store mutates synchronously
      // before the router push resolves.
      expect(store.currentLayer).toBe('bigfive')
      await vi.waitFor(() => {
        expect(pushSpy).toHaveBeenCalledWith('/test')
      })
    })

    it('renders BigFiveBars and the five dimension legend when both layers are complete', async () => {
      await seedDirectionalSession()
      const store = useQuestionnaireStore()
      store.startBigFiveLayer()
      // Answer all 50 Big Five items with the neutral value; it flips
      // fixed-point through the reverse-score gate so every dimension
      // sums to 30 — good enough to prove the block renders.
      for (let i = 0; i < store.bigfiveTotal; i += 1) store.answer(3)
      expect(store.bigfiveIsComplete).toBe(true)

      const wrapper = mountWith(makeRouter())

      expect(wrapper.text()).toContain('Dein Persönlichkeitsprofil')
      // All five dimension labels from the Big Five i18n messages appear
      // in the legend — one assertion per dimension catches a regression
      // where the legend renders partially.
      expect(wrapper.text()).toContain('Offenheit')
      expect(wrapper.text()).toContain('Gewissenhaftigkeit')
      expect(wrapper.text()).toContain('Extraversion')
      expect(wrapper.text()).toContain('Verträglichkeit')
      expect(wrapper.text()).toContain('Neurotizismus')
      // Verfeinern CTA disappears now that the refinement has been
      // completed — the gate flipped the other way.
      expect(wrapper.text()).not.toContain('Ergebnis verfeinern')
    })
  })

  describe('Big Five re-ranking UI (PR B)', () => {
    it('shows RIASEC-only subtitle text when Big Five is not complete', async () => {
      await seedDirectionalSession()
      const wrapper = mountWith(makeRouter())
      expect(wrapper.text()).toContain('Pearson-Korrelation')
      // The combined subtitle should NOT appear yet
      expect(wrapper.text()).not.toContain('Gewichtet nach RIASEC-Korrelation und')
    })

    it('switches subtitle to combined text and shows toggle when Big Five is complete', async () => {
      await seedDirectionalSession()
      const store = useQuestionnaireStore()
      await store.loadBigFiveProfiles()

      store.startBigFiveLayer()
      for (let i = 0; i < store.bigfiveTotal; i += 1) store.answer((i % 5) + 1)
      expect(store.bigfiveIsComplete).toBe(true)

      const wrapper = mountWith(makeRouter())
      // Combined subtitle
      expect(wrapper.text()).toContain('Gewichtet nach RIASEC-Korrelation und')
      // Toggle buttons visible
      expect(wrapper.text()).toContain('Nur Interessen')
      expect(wrapper.text()).toContain('+ Persönlichkeit')
    })
  })

  describe('restart from results page', () => {
    it('"Test neu starten" calls store.reset() AND navigates to /test', async () => {
      const router = makeRouter()
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      await seedDirectionalSession()
      const store = useQuestionnaireStore()
      const beforeId = store.sessionId

      const wrapper = mountWith(router)

      const restartButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Test neu starten'))
      expect(restartButton).toBeDefined()
      await restartButton!.trigger('click')

      // Both halves of the restart() handler must run: the reset clears
      // state and re-rolls the sessionId, AND the navigation kicks in.
      // Without the navigate, the user would land back on the
      // "noch nicht abgeschlossen" interstitial because isComplete just
      // flipped to false in place — that was the bug from Session 4
      // that the explicit router.push fixed.
      expect(store.answers).toEqual([])
      expect(store.sessionId).not.toBe(beforeId)

      await vi.waitFor(() => {
        expect(pushSpy).toHaveBeenCalledWith('/test')
      })
    })
  })
})
