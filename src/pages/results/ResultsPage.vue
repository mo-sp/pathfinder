<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import {
  hasProfileDirection,
  RIASEC_DIMENSIONS,
} from '@features/scoring/lib/riasec'
import { BIG_FIVE_DIMENSIONS } from '@features/scoring/lib/bigfive'
import { RiasecHexagon } from '@widgets/riasec-chart'
import { BigFiveBars } from '@widgets/bigfive-chart'

const store = useQuestionnaireStore()
const router = useRouter()
const { t } = useI18n()

// A user who answers uniformly (all 1s, all 3s, all 5s) ends up with a
// flat profile. Pearson correlation's zero-variance guard then collapses
// every occupation's fitScore to 0, so the top-10 would render as a
// confusing list of zeros in whatever arbitrary order the matcher
// returned. Swap the list for an explanatory German message in that
// case. The hexagon stays visible — a flat hexagon is itself informative
// feedback about what happened.
const hasDirection = computed(() => hasProfileDirection(store.riasecProfile))

// Toggle between RIASEC-only and combined (RIASEC + Big Five) ranking.
// Only meaningful after Big Five is complete; defaults to combined.
const showCombined = ref(true)

// RIASEC-only ranking: same results, sorted by riasecCorrelation instead
// of fitScore. Computed once so the toggle is instant.
const riasecOnlyRanked = computed(() =>
  [...store.results]
    .sort((a, b) => b.riasecCorrelation - a.riasecCorrelation)
    .map((r, i) => ({ ...r, rank: i + 1 })),
)

// Active result set: combined or RIASEC-only based on toggle.
const activeResults = computed(() =>
  store.bigfiveIsComplete && showCombined.value
    ? store.results
    : riasecOnlyRanked.value,
)

// Results pagination: show 20 initially, reveal 20 more per click.
const PAGE_SIZE = 20
const visibleCount = ref(PAGE_SIZE)
const rankedResults = computed(() =>
  activeResults.value.filter((r) =>
    showCombined.value ? r.fitScore > 0 : r.riasecCorrelation > 0,
  ),
)
const visibleResults = computed(() =>
  rankedResults.value.slice(0, visibleCount.value),
)
const canShowMore = computed(
  () => visibleCount.value < rankedResults.value.length,
)
function showMore(): void {
  visibleCount.value += PAGE_SIZE
}

/** Score delta for a result: combined fitScore minus RIASEC-only score, as display points. */
function scoreDelta(result: { riasecCorrelation: number; fitScore: number; bigFiveModifier: number | null }): number | null {
  if (!store.bigfiveIsComplete || !showCombined.value) return null
  if (result.bigFiveModifier == null) return null
  return Math.round(result.fitScore * 100) - Math.round(result.riasecCorrelation * 100)
}

// Safety net for direct navigation / reload on /ergebnis: AssessmentPage
// prefetches the occupations chunk on mount, so the common flow lands here
// with results already populated, but a user who jumps straight to
// /ergebnis (bookmark, reload after hydrate) still needs the chunk. The
// store caches the promise so this is a no-op when it's already resolved.
onMounted(() => {
  store.loadOccupations().catch((err) => {
    console.error('Failed to load occupations for results', err)
  })
  store.loadBigFiveProfiles().catch((err) => {
    console.error('Failed to load Big Five occupation profiles', err)
  })
})

const riasecLegend = computed(() =>
  RIASEC_DIMENSIONS.map((dim) => ({
    dim,
    label: t(`riasec.${dim}`),
    description: t(`riasecDescription.${dim}`),
  })),
)

const bigfiveLegend = computed(() =>
  BIG_FIVE_DIMENSIONS.map((dim) => ({
    dim,
    label: t(`bigfive.${dim}`),
    description: t(`bigfiveDescription.${dim}`),
  })),
)

// Restart from the Results page must also navigate back to /test. Otherwise
// store.reset() clears the answers but leaves the user on /ergebnis, where
// the "noch nicht abgeschlossen" interstitial immediately renders because
// isComplete flips to false.
async function restart(): Promise<void> {
  store.reset()
  await router.push('/test')
}

/**
 * Promote the user into the Big Five layer and send them back to /test.
 * Kept as a separate action from `startBigFiveLayer` alone so the page is
 * the only call site that knows about the navigation pairing — the store
 * stays router-agnostic.
 */
async function refineWithBigFive(): Promise<void> {
  store.startBigFiveLayer()
  await router.push('/test')
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-12">
    <div v-if="!store.riasecIsComplete" class="rounded-lg border border-amber-800/60 bg-amber-950/40 p-6">
      <p class="text-sm text-amber-200">
        Du hast den Test noch nicht abgeschlossen.
      </p>
      <RouterLink
        to="/test"
        class="mt-4 inline-block text-sm font-medium text-amber-200 underline hover:text-amber-100"
      >
        → Zum Test
      </RouterLink>
    </div>

    <template v-else>
      <h1 class="text-3xl font-bold text-slate-100">Dein RIASEC-Profil</h1>
      <p class="mt-2 text-sm text-slate-400">
        Basierend auf {{ store.riasecTotal }} Items aus dem O*NET Interest Profiler
        Short Form.
      </p>

      <div class="mt-10 rounded-lg border border-slate-800 bg-slate-900 p-6">
        <RiasecHexagon :profile="store.riasecPercent" />
      </div>

      <dl class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="entry in riasecLegend"
          :key="entry.dim"
          class="rounded-md border border-slate-800 bg-slate-900 p-3"
        >
          <dt class="text-sm font-semibold text-slate-100">
            {{ entry.dim }} – {{ entry.label }}
          </dt>
          <dd class="mt-1 text-xs text-slate-400">
            {{ entry.description }}
          </dd>
        </div>
      </dl>

      <!-- Big Five block: either the completed profile + legend, or an
           invitation to start the refinement layer. -->
      <template v-if="store.bigfiveIsComplete">
        <h2 class="mt-12 text-2xl font-semibold text-slate-100">
          Dein Persönlichkeitsprofil
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Basierend auf {{ store.bigfiveTotal }} Items aus dem IPIP Big Five
          Factor Markers Set.
        </p>
        <div class="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-6">
          <BigFiveBars :profile="store.bigfivePercent" />
        </div>
        <dl class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="entry in bigfiveLegend"
            :key="entry.dim"
            class="rounded-md border border-slate-800 bg-slate-900 p-3"
          >
            <dt class="text-sm font-semibold text-slate-100">
              {{ entry.label }}
            </dt>
            <dd class="mt-1 text-xs text-slate-400">
              {{ entry.description }}
            </dd>
          </div>
        </dl>
      </template>
      <div
        v-else
        class="mt-12 rounded-lg border border-indigo-800/60 bg-indigo-950/40 p-6"
      >
        <p class="text-base font-semibold text-indigo-100">
          Ergebnis verfeinern
        </p>
        <p class="mt-2 text-sm text-indigo-200">
          Mit einem Persönlichkeitsprofil nach dem Big-Five-Modell wird deine
          Berufsliste präziser neu gewichtet. Die weiteren Ebenen filtern
          nicht, sie verfeinern die bestehende Reihenfolge.
        </p>
        <p class="mt-1 text-sm text-indigo-200">
          {{ store.bigfiveTotal }} zusätzliche Fragen, etwa 5 Minuten.
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400"
          @click="refineWithBigFive"
        >
          Persönlichkeitsprofil starten
        </button>
      </div>

      <div class="mt-12 flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold text-slate-100">
            Top-Berufsempfehlungen
          </h2>
          <p v-if="store.bigfiveIsComplete && showCombined" class="mt-1 text-sm text-slate-400">
            Gewichtet nach RIASEC-Korrelation und Persönlichkeitsprofil.
          </p>
          <p v-else class="mt-1 text-sm text-slate-400">
            Berechnet via Pearson-Korrelation zwischen deinem Profil und den
            RIASEC-Profilen aus der O*NET-Datenbank.
          </p>
        </div>
        <div
          v-if="store.bigfiveIsComplete"
          class="flex shrink-0 overflow-hidden rounded-md border border-slate-700"
        >
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-medium transition-colors"
            :class="!showCombined ? 'bg-slate-700 text-slate-100' : 'bg-slate-900 text-slate-400 hover:text-slate-200'"
            @click="showCombined = false"
          >
            Nur Interessen
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-medium transition-colors"
            :class="showCombined ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'"
            @click="showCombined = true"
          >
            + Persönlichkeit
          </button>
        </div>
      </div>

      <div
        v-if="!hasDirection"
        class="mt-6 rounded-lg border border-amber-800/60 bg-amber-950/40 p-6"
      >
        <p class="text-sm text-amber-200">
          Dein Profil ist auf allen sechs Dimensionen gleich gewichtet. Ohne
          Präferenzunterschiede kann das Matching keine aussagekräftigen
          Berufsempfehlungen berechnen.
        </p>
        <p class="mt-2 text-sm text-amber-200">
          Der Test wird hilfreicher, wenn du bei den Antworten klarer
          differenzierst – zwischen Aktivitäten, die du wirklich gerne
          machen würdest, und solchen, die dich weniger reizen.
        </p>
      </div>
      <template v-else>
        <p
          v-if="store.results.length === 0"
          class="mt-6 rounded-md border border-dashed border-slate-700 bg-slate-900 px-4 py-6 text-center text-sm text-slate-400"
        >
          Berufsempfehlungen werden geladen …
        </p>
        <ol v-else class="mt-6 space-y-3">
          <li
            v-for="result in visibleResults"
            :key="result.occupation.onetCode"
            class="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <div class="min-w-0 flex-1">
              <div class="font-medium break-words text-slate-100">
                {{ result.rank }}. {{ result.occupation.title.de || result.occupation.title.en }}
              </div>
              <div class="text-xs break-words text-slate-400">
                O*NET {{ result.occupation.onetCode }}
                <span v-if="!result.occupation.title.de"> · (Übersetzung folgt)</span>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <span
                v-if="scoreDelta(result) != null && scoreDelta(result) !== 0"
                class="rounded px-1.5 py-0.5 font-mono text-xs"
                :class="scoreDelta(result)! > 0
                  ? 'bg-emerald-950/60 text-emerald-400'
                  : 'bg-red-950/60 text-red-400'"
              >
                {{ scoreDelta(result)! > 0 ? '+' : '' }}{{ scoreDelta(result) }}
              </span>
              <span class="font-mono text-sm text-indigo-400">
                {{ (result.fitScore * 100).toFixed(0) }}
              </span>
            </div>
          </li>
        </ol>
        <div v-if="canShowMore" class="mt-4 flex justify-center">
          <button
            type="button"
            class="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            @click="showMore"
          >
            Mehr anzeigen
          </button>
        </div>
      </template>

      <div class="mt-10 flex justify-center">
        <button
          type="button"
          class="text-sm text-slate-400 underline hover:text-slate-100"
          @click="restart"
        >
          Test neu starten
        </button>
      </div>
    </template>
  </section>
</template>
