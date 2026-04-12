<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { AssessmentLayer } from '@entities/assessment/model/types'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import {
  hasProfileDirection,
  RIASEC_DIMENSIONS,
} from '@features/scoring/lib/riasec'
import { BIG_FIVE_DIMENSIONS } from '@features/scoring/lib/bigfive'
import { VALUES_DIMENSIONS } from '@features/scoring/lib/values'
import {
  SKILLS_SUB_CATEGORIES,
  averageToPercent,
  subCategoryAverages,
} from '@features/scoring/lib/skills'
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

// Four-position view toggle — one per completed layer:
//   'riasec'  → RIASEC-only (baseline)
//   'bigfive' → RIASEC + Big Five (personality modifier, no values filter)
//   'values'  → RIASEC + Big Five + Values (full combined, with hard filter)
//   'skills'  → RIASEC + Big Five + Values + Skills (full combined plus skills bonus)
type ViewMode = 'riasec' | 'bigfive' | 'values' | 'skills'

// Default to the highest completed layer so the most refined view shows first.
const defaultMode = computed<ViewMode>(() => {
  if (store.skillsIsComplete) return 'skills'
  if (store.valuesIsComplete) return 'values'
  if (store.bigfiveIsComplete) return 'bigfive'
  return 'riasec'
})
const viewMode = ref<ViewMode>(defaultMode.value)

// Available toggle positions depend on which layers are complete.
const toggleOptions = computed(() => {
  const opts: { mode: ViewMode; label: string }[] = [
    { mode: 'riasec', label: 'Nur Interessen' },
  ]
  if (store.bigfiveIsComplete) {
    opts.push({ mode: 'bigfive', label: '+ Persönlichkeit' })
  }
  if (store.valuesIsComplete) {
    opts.push({ mode: 'values', label: '+ Werte' })
  }
  if (store.skillsIsComplete) {
    opts.push({ mode: 'skills', label: '+ Fähigkeiten' })
  }
  return opts
})

const showToggle = computed(() => toggleOptions.value.length > 1)

// Layer ordering for progressive toggle highlighting: all layers up to
// and including the active viewMode are highlighted blue.
const MODE_ORDER: ViewMode[] = ['riasec', 'bigfive', 'values', 'skills']

function isActiveToggle(mode: ViewMode): boolean {
  return MODE_ORDER.indexOf(mode) <= MODE_ORDER.indexOf(viewMode.value)
}

// RIASEC-only: sort by riasecCorrelation, no filters.
const riasecOnlyRanked = computed(() =>
  [...store.results]
    .sort((a, b) => b.riasecCorrelation - a.riasecCorrelation)
    .map((r, i) => ({ ...r, rank: i + 1 })),
)

// RIASEC + Big Five: sort by riasec × bigFiveModifier, no values penalty/filter.
// For occupations without Big Five data, falls back to riasecCorrelation.
const bigfiveRanked = computed(() =>
  [...store.results]
    .map((r) => {
      const score = r.bigFiveModifier != null
        ? Math.min(r.riasecCorrelation * r.bigFiveModifier, 1)
        : r.riasecCorrelation
      return { ...r, fitScore: score }
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .map((r, i) => ({ ...r, rank: i + 1 })),
)

// RIASEC + Big Five + Values: same as store.results when skills is NOT
// complete, but strips skills bonus when it IS. Lets the user toggle
// back to "just up to values" after Layer 4 finishes.
const valuesRanked = computed(() =>
  [...store.results]
    .map((r) => {
      let fit = r.riasecCorrelation
      if (r.bigFiveModifier != null) fit = Math.min(fit * r.bigFiveModifier, 1)
      if (r.valuesPenalty != null) fit -= r.valuesPenalty
      return { ...r, fitScore: fit }
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .map((r, i) => ({ ...r, rank: i + 1 })),
)

// Active result set based on toggle position. `store.results` is the
// fully-combined ranking (all completed layers applied), used for 'skills'
// mode. For lower modes we re-derive with fewer layers.
const activeResults = computed(() => {
  if (viewMode.value === 'skills' && store.skillsIsComplete) return store.results
  if (viewMode.value === 'values' && store.valuesIsComplete) return valuesRanked.value
  if (viewMode.value === 'bigfive' && store.bigfiveIsComplete) return bigfiveRanked.value
  return riasecOnlyRanked.value
})

// Results pagination: show 20 initially, reveal 20 more per click.
const PAGE_SIZE = 20
const visibleCount = ref(PAGE_SIZE)
const rankedResults = computed(() =>
  activeResults.value.filter((r) =>
    viewMode.value === 'riasec' ? r.riasecCorrelation > 0 : r.fitScore > 0,
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

/** Score delta: difference between the current view's fitScore and the RIASEC baseline. */
function scoreDelta(result: { riasecCorrelation: number; fitScore: number; bigFiveModifier: number | null; valuesPenalty: number | null; skillsBonus: number | null }): number | null {
  if (viewMode.value === 'riasec') return null
  if (viewMode.value === 'bigfive') {
    if (result.bigFiveModifier == null) return null
    const bfScore = Math.min(result.riasecCorrelation * result.bigFiveModifier, 1)
    return Math.round(bfScore * 100) - Math.round(result.riasecCorrelation * 100)
  }
  // values / skills view: total delta from RIASEC baseline
  if (
    result.bigFiveModifier == null &&
    result.valuesPenalty == null &&
    result.skillsBonus == null
  ) {
    return null
  }
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

// Values legend: each dimension's label, current choice, question ID,
// current value (1-5), and all 5 option labels for the interactive picker.
const valuesLegend = computed(() => {
  if (!store.valuesIsComplete) return []
  const profile = store.valuesProfile
  return VALUES_DIMENSIONS.map((dim) => {
    const q = store.valuesQuestions.find((q) => q.dimension === dim)
    const value = profile[dim]
    const options = q?.labels?.de ?? []
    return {
      dim,
      label: t(`values.${dim}`),
      choice: options[value - 1] ?? `${value}/5`,
      questionId: q?.id ?? '',
      value,
      options,
    }
  })
})

// Count of hard-filtered occupations (education). Compare total loaded
// occupations vs results after hard filter. Shown in any mode at-or-above
// 'values' once the values layer is complete (the hard-filter is part of
// the pipeline from values onwards, not exclusive to the 'values' toggle).
const hardFilteredCount = computed(() => {
  if (!store.valuesIsComplete) return 0
  if (viewMode.value !== 'values' && viewMode.value !== 'skills') return 0
  return store.totalOccupations - store.results.length
})

// Skills sub-category averages (1-5 Likert) and percentages (0-100) for
// the three aggregate bars on the skills block.
const skillsSummary = computed(() => {
  if (!store.skillsIsComplete) return []
  const avgs = subCategoryAverages(store.skillsProfile)
  return SKILLS_SUB_CATEGORIES.map((sub) => ({
    sub,
    label: t(`skillsSubCategory.${sub}`),
    description: t(`skillsSubCategoryDescription.${sub}`),
    average: avgs[sub],
    percent: averageToPercent(avgs[sub]),
  }))
})

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

async function refineWithValues(): Promise<void> {
  store.startValuesLayer()
  await router.push('/test')
}

async function refineWithSkills(): Promise<void> {
  store.startSkillsLayer()
  await router.push('/test')
}

async function repeatLayer(layer: AssessmentLayer): Promise<void> {
  store.repeatLayer(layer)
  await router.push('/test')
}

// Track which values dimension dropdown is open (null = all closed).
const openValuesDim = ref<string | null>(null)
const valuesGridRef = ref<HTMLElement | null>(null)

function toggleValuesDim(dim: string): void {
  openValuesDim.value = openValuesDim.value === dim ? null : dim
}

function selectValuesOption(questionId: string, value: number): void {
  store.updateValuesAnswer(questionId, value)
  openValuesDim.value = null
}

// Close any open values dropdown when the user clicks outside the grid.
function handleDocumentClick(event: MouseEvent): void {
  if (openValuesDim.value === null) return
  const grid = valuesGridRef.value
  if (grid && !grid.contains(event.target as Node)) {
    openValuesDim.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
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
      <div class="rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
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
        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="text-sm text-slate-400 underline hover:text-slate-100"
            @click="repeatLayer('riasec')"
          >
            Interessen-Test wiederholen
          </button>
        </div>
      </div>

      <!-- Big Five block: either the completed profile + legend, or an
           invitation to start the refinement layer. -->
      <div v-if="store.bigfiveIsComplete" class="mt-12 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
        <h2 class="text-2xl font-semibold text-slate-100">
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
        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="text-sm text-slate-400 underline hover:text-slate-100"
            @click="repeatLayer('bigfive')"
          >
            Persönlichkeitstest wiederholen
          </button>
        </div>
      </div>
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

      <!-- Values block: either the completed preferences summary, or an
           invitation to start the values layer. Only shown after Big Five
           is complete (values is the next step in the progressive funnel). -->
      <template v-if="store.bigfiveIsComplete">
        <div v-if="store.valuesIsComplete" class="mt-12 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
          <h2 class="text-2xl font-semibold text-slate-100">
            Deine Werte & Rahmenbedingungen
          </h2>
          <p class="mt-2 text-sm text-slate-400">
            Deine Präferenzen zu Ausbildung, Arbeitsumfeld und Arbeitsweise.
          </p>
          <dl ref="valuesGridRef" class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="entry in valuesLegend"
              :key="entry.dim"
              class="relative rounded-md border border-slate-800 bg-slate-900 p-3"
            >
              <dt class="text-xs font-medium text-slate-400">
                {{ entry.label }}
              </dt>
              <dd>
                <button
                  type="button"
                  class="mt-1 w-full text-left text-sm font-semibold text-slate-100 hover:text-indigo-300"
                  @click="toggleValuesDim(entry.dim)"
                >
                  {{ entry.choice }}
                  <span class="ml-1 text-xs text-slate-500">▾</span>
                </button>
                <ul
                  v-if="openValuesDim === entry.dim"
                  class="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
                >
                  <li v-for="(optLabel, optIdx) in entry.options" :key="optIdx">
                    <button
                      type="button"
                      class="w-full px-3 py-1.5 text-left text-sm transition-colors"
                      :class="optIdx + 1 === entry.value
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-slate-300 hover:bg-slate-700'"
                      @click="selectValuesOption(entry.questionId, optIdx + 1)"
                    >
                      {{ optLabel }}
                    </button>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="text-sm text-slate-400 underline hover:text-slate-100"
              @click="repeatLayer('values')"
            >
              Werte-Test wiederholen
            </button>
          </div>
        </div>
        <div
          v-else
          class="mt-12 rounded-lg border border-indigo-800/60 bg-indigo-950/40 p-6"
        >
          <p class="text-base font-semibold text-indigo-100">
            Weiter verfeinern
          </p>
          <p class="mt-2 text-sm text-indigo-200">
            Mit deinen Werten und Rahmenbedingungen werden Berufe gefiltert und
            neu gewichtet. Berufe, die nicht zu deiner Ausbildungsbereitschaft
            passen, werden ausgeblendet.
          </p>
          <p class="mt-1 text-sm text-indigo-200">
            {{ store.valuesTotal }} kurze Fragen, etwa 1 Minute.
          </p>
          <button
            type="button"
            class="mt-4 inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400"
            @click="refineWithValues"
          >
            Werte & Rahmenbedingungen starten
          </button>
        </div>
      </template>

      <!-- Skills block: either the completed self-assessment summary (3
           aggregate bars for Fähigkeiten / Talente / Wissen) or the CTA
           to start Layer 4. Only shown after Values is complete. -->
      <template v-if="store.valuesIsComplete">
        <div v-if="store.skillsIsComplete" class="mt-12 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
          <h2 class="text-2xl font-semibold text-slate-100">
            Deine Fähigkeiten, Talente & Wissen
          </h2>
          <p class="mt-2 text-sm text-slate-400">
            Deine Selbsteinschätzung zu 120 Kompetenzen aus der O*NET-Taxonomie.
          </p>
          <dl class="mt-6 space-y-3">
            <div
              v-for="entry in skillsSummary"
              :key="entry.sub"
              class="rounded-md border border-slate-800 bg-slate-900 p-4"
            >
              <dt class="flex items-baseline justify-between gap-3">
                <span class="text-sm font-semibold text-slate-100">{{ entry.label }}</span>
                <span class="font-mono text-sm text-indigo-400">{{ entry.percent }} %</span>
              </dt>
              <dd class="mt-2">
                <div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    class="h-full bg-indigo-500 transition-all duration-300"
                    :style="{ width: `${entry.percent}%` }"
                  />
                </div>
                <p class="mt-2 text-xs text-slate-400">{{ entry.description }}</p>
              </dd>
            </div>
          </dl>
          <div class="mt-4 flex justify-end">
            <button
              type="button"
              class="text-sm text-slate-400 underline hover:text-slate-100"
              @click="repeatLayer('skills')"
            >
              Fähigkeiten-Test wiederholen
            </button>
          </div>
        </div>
        <div
          v-else
          class="mt-12 rounded-lg border border-indigo-800/60 bg-indigo-950/40 p-6"
        >
          <p class="text-base font-semibold text-indigo-100">
            Fähigkeiten ergänzen
          </p>
          <p class="mt-2 text-sm text-indigo-200">
            Mit einer Selbsteinschätzung deiner Fähigkeiten, Talente und
            Wissensgebiete wird die Berufsliste nochmal nachgeschärft. Berufe,
            deren Kompetenzanforderungen zu deinem Profil passen, rücken nach
            oben; weniger passende werden zurückgesetzt.
          </p>
          <p class="mt-1 text-sm text-indigo-200">
            {{ store.skillsTotal }} Fragen in drei Abschnitten, etwa 15 Minuten.
          </p>
          <button
            type="button"
            class="mt-4 inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400"
            @click="refineWithSkills"
          >
            Fähigkeiten-Test starten
          </button>
        </div>
      </template>

      <div class="mt-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-slate-100">
            Top-Berufsempfehlungen
          </h2>
          <p v-if="viewMode === 'skills'" class="mt-1 text-sm text-slate-400">
            Gewichtet nach RIASEC, Persönlichkeit, Werten und deinen Fähigkeiten.
          </p>
          <p v-else-if="viewMode === 'values'" class="mt-1 text-sm text-slate-400">
            Gewichtet nach RIASEC-Korrelation, Persönlichkeitsprofil und deinen Werten.
          </p>
          <p v-else-if="viewMode === 'bigfive'" class="mt-1 text-sm text-slate-400">
            Gewichtet nach RIASEC-Korrelation und Persönlichkeitsprofil.
          </p>
          <p v-else class="mt-1 text-sm text-slate-400">
            Berechnet via Pearson-Korrelation zwischen deinem Profil und den
            RIASEC-Profilen aus der O*NET-Datenbank.
          </p>
        </div>
        <div
          v-if="showToggle"
          class="flex shrink-0 overflow-hidden rounded-md border border-slate-700"
        >
          <button
            v-for="opt in toggleOptions"
            :key="opt.mode"
            type="button"
            class="px-3 py-1.5 text-xs font-medium transition-colors"
            :class="isActiveToggle(opt.mode)
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'"
            @click="viewMode = opt.mode"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <p
        v-if="hardFilteredCount > 0"
        class="mt-2 text-xs text-slate-500"
      >
        {{ hardFilteredCount }} Berufe aufgrund deiner Ausbildungspräferenz ausgeblendet.
      </p>

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
