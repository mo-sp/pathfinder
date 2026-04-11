<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import {
  hasProfileDirection,
  RIASEC_DIMENSIONS,
} from '@features/scoring/lib/riasec'
import { RiasecHexagon } from '@widgets/riasec-chart'

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

// Safety net for direct navigation / reload on /ergebnis: AssessmentPage
// prefetches the occupations chunk on mount, so the common flow lands here
// with results already populated, but a user who jumps straight to
// /ergebnis (bookmark, reload after hydrate) still needs the chunk. The
// store caches the promise so this is a no-op when it's already resolved.
onMounted(() => {
  store.loadOccupations().catch((err) => {
    console.error('Failed to load occupations for results', err)
  })
})

const legend = computed(() =>
  RIASEC_DIMENSIONS.map((dim) => ({
    dim,
    label: t(`riasec.${dim}`),
    description: t(`riasecDescription.${dim}`),
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
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-12">
    <div v-if="!store.isComplete" class="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <p class="text-sm text-amber-900">
        Du hast den Test noch nicht abgeschlossen.
      </p>
      <RouterLink
        to="/test"
        class="mt-4 inline-block text-sm font-medium text-amber-900 underline hover:text-amber-950"
      >
        → Zum Test
      </RouterLink>
    </div>

    <template v-else>
      <h1 class="text-3xl font-bold text-slate-900">Dein RIASEC-Profil</h1>
      <p class="mt-2 text-sm text-slate-500">
        Basierend auf {{ store.total }} Items aus dem O*NET Interest Profiler
        Short Form.
      </p>

      <div class="mt-10 rounded-lg border border-slate-200 bg-white p-6">
        <RiasecHexagon :profile="store.riasecPercent" />
      </div>

      <dl class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="entry in legend"
          :key="entry.dim"
          class="rounded-md border border-slate-200 bg-white p-3"
        >
          <dt class="text-sm font-semibold text-slate-900">
            {{ entry.dim }} – {{ entry.label }}
          </dt>
          <dd class="mt-1 text-xs text-slate-500">
            {{ entry.description }}
          </dd>
        </div>
      </dl>

      <h2 class="mt-12 text-2xl font-semibold text-slate-900">
        Top-Berufsempfehlungen
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        Berechnet via Pearson-Korrelation zwischen deinem Profil und den
        RIASEC-Profilen aus der O*NET-Datenbank.
      </p>

      <div
        v-if="!hasDirection"
        class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6"
      >
        <p class="text-sm text-amber-900">
          Dein Profil ist auf allen sechs Dimensionen gleich gewichtet. Ohne
          Präferenzunterschiede kann das Matching keine aussagekräftigen
          Berufsempfehlungen berechnen.
        </p>
        <p class="mt-2 text-sm text-amber-900">
          Der Test wird hilfreicher, wenn du bei den Antworten klarer
          differenzierst – zwischen Aktivitäten, die du wirklich gerne
          machen würdest, und solchen, die dich weniger reizen.
        </p>
      </div>
      <template v-else>
        <p
          v-if="store.results.length === 0"
          class="mt-6 rounded-md border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500"
        >
          Berufsempfehlungen werden geladen …
        </p>
        <ol v-else class="mt-6 space-y-3">
          <li
            v-for="result in store.results.slice(0, 10)"
            :key="result.occupation.onetCode"
            class="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-4 py-3"
          >
            <div class="min-w-0 flex-1">
              <div class="font-medium break-words text-slate-900">
                {{ result.rank }}. {{ result.occupation.title.de || result.occupation.title.en }}
              </div>
              <div class="text-xs break-words text-slate-500">
                O*NET {{ result.occupation.onetCode }}
                <span v-if="!result.occupation.title.de"> · (Übersetzung folgt)</span>
              </div>
            </div>
            <div class="shrink-0 font-mono text-sm text-indigo-600">
              {{ (result.fitScore * 100).toFixed(0) }}
            </div>
          </li>
        </ol>
      </template>

      <div class="mt-10">
        <button
          type="button"
          class="text-sm text-slate-500 underline hover:text-slate-900"
          @click="restart"
        >
          Test neu starten
        </button>
      </div>
    </template>
  </section>
</template>
