<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { AssessmentLayer } from '@entities/assessment/model/types'
import type { Occupation } from '@entities/occupation/model/types'
import type { SkillsSubCategory } from '@entities/question/model/types'
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
  percentToBand,
  subCategoryAverages,
} from '@features/scoring/lib/skills'
import { RiasecHexagon } from '@widgets/riasec-chart'
import { BigFiveBars } from '@widgets/bigfive-chart'
import { stripKldbSuffix } from './stripKldbSuffix'

const store = useQuestionnaireStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// Layer-completion navigation from AssessmentPage sets ?focus=<layer>; on
// direct /ergebnis loads the query is absent and the page stays at top.
const FOCUSABLE_LAYERS: readonly AssessmentLayer[] = ['riasec', 'bigfive', 'values', 'skills']
function focusTargetFromQuery(): AssessmentLayer | null {
  const raw = route.query.focus
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return null
  return (FOCUSABLE_LAYERS as readonly string[]).includes(value)
    ? (value as AssessmentLayer)
    : null
}

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

// RIASEC-only: sort by riasecCorrelation, and override fitScore so the
// top-row indigo number honors the selected view (previously it kept the
// full-combined fitScore from store.results even in the riasec view,
// which made the displayed score disagree with the view label).
const riasecOnlyRanked = computed(() =>
  [...store.results]
    .map((r) => ({ ...r, fitScore: r.riasecCorrelation }))
    .sort((a, b) => b.fitScore - a.fitScore)
    .map((r, i) => ({ ...r, rank: i + 1 })),
)

// RIASEC + Big Five: sort by riasec + bigFiveModifier, no values penalty/filter.
// For occupations without Big Five data, falls back to riasecCorrelation.
const bigfiveRanked = computed(() =>
  [...store.results]
    .map((r) => {
      const score = r.bigFiveModifier != null
        ? r.riasecCorrelation + r.bigFiveModifier
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
      if (r.bigFiveModifier != null) fit += r.bigFiveModifier
      if (r.valuesContribution != null) fit += r.valuesContribution
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

// Hide occupations with a non-positive fit score by default — they just add
// noise to the recommendation view. Toggle-on to reveal everything that
// passed the hard filter (useful when the user wants to see e.g. the full
// set of Helfer-Berufe to validate corpus coverage).
const showWeakMatches = ref(false)

// Free-text search — when non-empty, bypasses the weak-match filter and
// pagination cap, so every occupation that matches the query is listed with
// its true rank. Handy for "where does X rank?" checks during scoring
// validation, and for archetype-persona spot-tests.
const searchQuery = ref('')
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}
const searchTokens = computed(() => {
  const q = normalize(searchQuery.value.trim())
  return q ? q.split(/\s+/).filter(Boolean) : []
})
const isSearching = computed(() => searchTokens.value.length > 0)
function searchMatches(occ: Occupation): boolean {
  if (!isSearching.value) return true
  const haystack = normalize(
    [occ.title.de ?? '', occ.title.en, occ.kldbName ?? '', occ.onetCode].join(' '),
  )
  return searchTokens.value.every((token) => haystack.includes(token))
}
function clearSearch(): void {
  searchQuery.value = ''
}

const rankedResults = computed(() => {
  if (isSearching.value) {
    // Search bypasses the weak-match filter — show every match with its
    // original rank regardless of score sign. Ranks come from activeResults
    // directly (already sorted by fitScore desc).
    return activeResults.value.filter((r) => searchMatches(r.occupation))
  }
  if (showWeakMatches.value) return activeResults.value
  return activeResults.value.filter((r) =>
    viewMode.value === 'riasec' ? r.riasecCorrelation > 0 : r.fitScore > 0,
  )
})
const weakMatchCount = computed(() => activeResults.value.length - activeResults.value.filter((r) =>
  viewMode.value === 'riasec' ? r.riasecCorrelation > 0 : r.fitScore > 0,
).length)
const visibleResults = computed(() => {
  // Search mode shows every match; otherwise apply the pagination cap.
  if (isSearching.value) return rankedResults.value
  return rankedResults.value.slice(0, visibleCount.value)
})
const canShowMore = computed(
  () => !isSearching.value && visibleCount.value < rankedResults.value.length,
)
function showMore(): void {
  visibleCount.value += PAGE_SIZE
}

// Display cap: the top-row score is rendered as fitScore × 100 and should
// stay in the 0–100 range for visual consistency across views. Raw
// fitScore can exceed 1.0 once the +skillsBonus term is added (the
// min(·, 1) cap is only on riasec × bigfive, not on the final sum).
// Internal value stays raw for sorting + the debug formula line.
function displayFitScore(v: number): number {
  return Math.min(v, 1)
}

// Primary display name: prefer the ESCO/O*NET German title (concrete names like
// "Zimmerer/Zimmerin"), fall back to the KldB class name, finally to English.
function displayTitle(o: Occupation): string {
  return o.title.de || stripKldbSuffix(o.kldbName) || o.title.en
}

// Subtitle: show the KldB classification when we have one and it's meaningfully
// different from the display title — lets the user see both the concrete job
// ("Zimmerer") and the official classification ("Berufe in der Zimmerei").
function occupationSubtitle(o: Occupation): string | null {
  const cleaned = stripKldbSuffix(o.kldbName)
  if (!cleaned) return null
  if (cleaned === displayTitle(o)) return null
  return cleaned
}

const SHARE_TOP_N = 20
const SHARE_LANDING_URL = 'https://pathfinder-liard-phi.vercel.app'

// Tri-state so the button label can flicker "Kopiert!" briefly without
// inventing a toast layer for one feature.
const shareState = ref<'idle' | 'copied' | 'failed'>('idle')

function formatShareMarkdown(): string {
  const top = rankedResults.value.slice(0, SHARE_TOP_N)
  const lines: string[] = ['PathFinder · meine Top-' + top.length, '']
  for (const r of top) {
    const score = (displayFitScore(r.fitScore) * 100).toFixed(0)
    lines.push(`${r.rank}. ${displayTitle(r.occupation)} · ${score}%`)
  }
  lines.push('', `Eigene Top-20: ${SHARE_LANDING_URL}`)
  return lines.join('\n')
}

// `navigator.clipboard` requires a secure context — fails on the LAN HTTP
// dev sandbox. Fall back to the legacy textarea+execCommand path so the
// feature works there too.
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  ta.setAttribute('readonly', '')
  document.body.appendChild(ta)
  ta.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(ta)
  return ok
}

async function shareTop20(): Promise<void> {
  const ok = await writeToClipboard(formatShareMarkdown())
  shareState.value = ok ? 'copied' : 'failed'
  window.setTimeout(() => {
    shareState.value = 'idle'
  }, 2000)
}

/** Score delta: difference between the current view's fitScore and the RIASEC baseline. */
function scoreDelta(result: { riasecCorrelation: number; fitScore: number; bigFiveModifier: number | null; valuesContribution: number | null; skillsBonus: number | null }): number | null {
  if (viewMode.value === 'riasec') return null
  if (viewMode.value === 'bigfive') {
    if (result.bigFiveModifier == null) return null
    const bfScore = result.riasecCorrelation + result.bigFiveModifier
    return Math.round(bfScore * 100) - Math.round(result.riasecCorrelation * 100)
  }
  // values / skills view: total delta from RIASEC baseline
  if (
    result.bigFiveModifier == null &&
    result.valuesContribution == null &&
    result.skillsBonus == null
  ) {
    return null
  }
  return Math.round(displayFitScore(result.fitScore) * 100) - Math.round(result.riasecCorrelation * 100)
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

  // Scroll to the just-finished layer when AssessmentPage forwards us with
  // ?focus=<layer>. `nextTick` waits for the v-if-gated layer blocks to
  // render; `getElementById` returns null in jsdom tests (no layout), so
  // the optional-chain silently no-ops there.
  const focus = focusTargetFromQuery()
  if (focus) {
    nextTick(() => {
      document.getElementById(`layer-${focus}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }
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
  return SKILLS_SUB_CATEGORIES.map((sub) => {
    const percent = averageToPercent(avgs[sub])
    return {
      sub,
      label: t(`skillsSubCategory.${sub}`),
      description: t(`skillsSubCategoryDescription.${sub}`),
      average: avgs[sub],
      percent,
      bandLabel: t(`skillsBand.${percentToBand(percent)}`),
    }
  })
})

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

async function repeatSkillsSub(sub: SkillsSubCategory): Promise<void> {
  store.repeatSkillsSubCategory(sub)
  await router.push('/test')
}

// Track which values dimension dropdown is open (null = all closed).
const openValuesDim = ref<string | null>(null)
const valuesGridRef = ref<HTMLElement | null>(null)

// Expanded explain panels: Set of onetCodes. Multiple panels may be open
// concurrently so users can compare two occupations side-by-side.
const openExplanations = ref<Set<string>>(new Set())

function toggleExplanation(onetCode: string): void {
  const next = new Set(openExplanations.value)
  if (next.has(onetCode)) next.delete(onetCode)
  else next.add(onetCode)
  openExplanations.value = next
}

type FactorTone = 'positive' | 'negative' | 'neutral'
type FactorKey = 'riasec' | 'bigfive' | 'values' | 'skills'
type Stage = 'strong' | 'moderate' | 'neutral' | 'weak' | 'poor'
type FactorState = 'active' | 'inactive' | 'notScored' | 'noData'

type FactorRow = {
  key: FactorKey
  state: FactorState
  label: string
  value: string
  tone: FactorTone
  text: string
  inactiveTag: string | null
}

function stageForRiasec(v: number): Stage {
  if (v > 0.7) return 'strong'
  if (v > 0.3) return 'moderate'
  if (v > 0) return 'weak'
  return 'poor'
}
function stageForBigFive(v: number): Stage {
  // Additive adjustment in [−0.3, +0.3]. Mirrors the prior multiplicative
  // thresholds shifted to the additive scale (×1.1 → +0.1, ×0.95 → −0.05,
  // ×0.9 → −0.1). Sign of the adjustment drives the tone.
  if (v > 0.1) return 'strong'
  if (v >= -0.05) return 'moderate'
  if (v >= -0.1) return 'weak'
  return 'poor'
}
// Values staged on the signed contribution in [−0.25, +0.10]. Asymmetric
// (penalty side is wider than bonus side because the centre sits at the
// empirical median penalty, not the mathematical midpoint). Neutral band
// for effectively-zero contributions.
function stageForValues(contribution: number): Stage {
  if (Math.abs(contribution) < 0.005) return 'neutral'
  if (contribution >= 0.07) return 'strong'
  if (contribution > 0) return 'moderate'
  if (contribution > -0.10) return 'weak'
  return 'poor'
}
// Skills staged by the signed skillsBonus in [−0.25, +0.25]. Effectively-
// zero bonuses get their own 'neutral' band so a median user (piecewise
// bonus anchored at 0) isn't told "Solide Überschneidung" on a 0.00 value.
function stageForSkills(bonus: number): Stage {
  if (Math.abs(bonus) < 0.005) return 'neutral'
  if (bonus >= 0.10) return 'strong'
  if (bonus >= 0) return 'moderate'
  if (bonus >= -0.10) return 'weak'
  return 'poor'
}

// Tone is sign-based, not stage-based: any positive contribution renders
// green, any negative red. Only an effectively-zero contribution (rounds
// to ±0.00 at toFixed(2)) stays neutral grey. Missing-data rows fall back
// to neutral via the state branch in mkRow.
function toneForSignedValue(v: number): FactorTone {
  if (Math.abs(v) < 0.005) return 'neutral'
  return v > 0 ? 'positive' : 'negative'
}

function formatSigned(n: number, digits = 2): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}`
}

/**
 * Which factors contribute to the fitScore in the active view.
 * Must match the activeResults computed's fitScore derivation exactly —
 * otherwise the formula line's RHS won't line up with the top-row score.
 */
function factorInActiveView(key: FactorKey, mode: ViewMode): boolean {
  return MODE_ORDER.indexOf(key) <= MODE_ORDER.indexOf(mode)
}

function factorLayerComplete(key: FactorKey): boolean {
  if (key === 'riasec') return store.riasecIsComplete
  if (key === 'bigfive') return store.bigfiveIsComplete
  if (key === 'values') return store.valuesIsComplete
  return store.skillsIsComplete
}

function scoreBreakdown(result: {
  riasecCorrelation: number
  bigFiveModifier: number | null
  valuesContribution: number | null
  skillsMatch: number | null
  skillsBonus: number | null
}, mode: ViewMode): FactorRow[] {
  const mkRow = (
    key: FactorKey,
    hasValue: boolean,
    stage: Stage | null,
    signedValue: number | null,
    valueText: string,
  ): FactorRow => {
    const complete = factorLayerComplete(key)
    let state: FactorState
    if (!complete) state = 'notScored'
    else if (!hasValue) state = 'noData'
    else if (!factorInActiveView(key, mode)) state = 'inactive'
    else state = 'active'

    const tone = (state === 'active' || state === 'inactive') && signedValue != null
      ? toneForSignedValue(signedValue)
      : 'neutral'

    let text: string
    if (state === 'notScored') text = t('explainPanel.notScored')
    else if (state === 'noData') text = t('explainPanel.noData')
    else text = t(`explainPanel.thresholds.${key}.${stage!}`)

    const inactiveTag = state === 'inactive' ? t('explainPanel.inactiveTag') : null

    return {
      key,
      state,
      label: t(`explainPanel.factors.${key}`),
      value: state === 'active' || state === 'inactive' ? valueText : '–',
      tone,
      text,
      inactiveTag,
    }
  }

  const rows: FactorRow[] = []
  rows.push(
    mkRow(
      'riasec',
      true,
      stageForRiasec(result.riasecCorrelation),
      result.riasecCorrelation,
      formatSigned(result.riasecCorrelation),
    ),
  )
  rows.push(
    mkRow(
      'bigfive',
      result.bigFiveModifier != null,
      result.bigFiveModifier != null ? stageForBigFive(result.bigFiveModifier) : null,
      result.bigFiveModifier,
      result.bigFiveModifier != null ? formatSigned(result.bigFiveModifier) : '',
    ),
  )
  rows.push(
    mkRow(
      'values',
      result.valuesContribution != null,
      result.valuesContribution != null ? stageForValues(result.valuesContribution) : null,
      result.valuesContribution,
      result.valuesContribution != null ? formatSigned(result.valuesContribution) : '',
    ),
  )
  rows.push(
    mkRow(
      'skills',
      result.skillsMatch != null && result.skillsBonus != null,
      result.skillsBonus != null ? stageForSkills(result.skillsBonus) : null,
      result.skillsBonus,
      result.skillsBonus != null ? formatSigned(result.skillsBonus) : '',
    ),
  )
  return rows
}

/**
 * Formula with ONLY the terms that contribute to the active view. RHS
 * is computed from those same terms, so it matches the top-row score.
 * If RHS and top-row disagree at runtime, the rendering is a bug signal.
 */
function scoreFormula(result: {
  riasecCorrelation: number
  bigFiveModifier: number | null
  valuesContribution: number | null
  skillsBonus: number | null
}, mode: ViewMode): string {
  const r = result.riasecCorrelation
  const parts: string[] = []
  let rhs: number

  if (factorInActiveView('bigfive', mode) && result.bigFiveModifier != null) {
    const bf = result.bigFiveModifier
    parts.push(`${r.toFixed(2)} ${bf >= 0 ? '+' : '−'} ${Math.abs(bf).toFixed(2)}`)
    rhs = r + bf
  } else {
    parts.push(r.toFixed(2))
    rhs = r
  }
  if (factorInActiveView('values', mode) && result.valuesContribution != null) {
    const vc = result.valuesContribution
    parts.push(`${vc >= 0 ? '+' : '−'} ${Math.abs(vc).toFixed(2)}`)
    rhs += vc
  }
  if (factorInActiveView('skills', mode) && result.skillsBonus != null) {
    parts.push(`${result.skillsBonus >= 0 ? '+' : '−'} ${Math.abs(result.skillsBonus).toFixed(2)}`)
    rhs += result.skillsBonus
  }
  return `${parts.join('  ')}  =  ${rhs.toFixed(2)}`
}

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
      <div id="layer-riasec" class="scroll-mt-6 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
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
      <div v-if="store.bigfiveIsComplete" id="layer-bigfive" class="mt-12 scroll-mt-6 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
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
        <div v-if="store.valuesIsComplete" id="layer-values" class="mt-12 scroll-mt-6 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
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
        <div v-if="store.skillsIsComplete" id="layer-skills" class="mt-12 scroll-mt-6 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
          <h2 class="text-2xl font-semibold text-slate-100">
            Deine Fähigkeiten, Talente & Wissen
          </h2>
          <p class="mt-2 text-sm text-slate-400">
            Deine Selbsteinschätzung zu 121 Kompetenzen aus der O*NET-Taxonomie.
          </p>
          <dl class="mt-6 space-y-3">
            <div
              v-for="entry in skillsSummary"
              :key="entry.sub"
              class="rounded-md border border-slate-800 bg-slate-900 p-4"
            >
              <dt class="flex items-baseline justify-between gap-3">
                <span class="text-sm font-semibold text-slate-100">{{ entry.label }}</span>
                <span class="flex items-baseline gap-2">
                  <span class="text-sm font-medium text-indigo-400">{{ entry.bandLabel }}</span>
                  <span class="font-mono text-xs text-slate-500">{{ entry.percent }} %</span>
                </span>
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
          <div class="mt-4 flex flex-wrap justify-end gap-x-4 gap-y-2">
            <button
              v-for="entry in skillsSummary"
              :key="entry.sub"
              type="button"
              class="text-sm text-slate-400 underline hover:text-slate-100"
              @click="repeatSkillsSub(entry.sub)"
            >
              {{ entry.label }} wiederholen
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

      <p
        v-if="showToggle && viewMode !== 'riasec'"
        class="mt-2 text-xs text-slate-500"
      >
        <span class="font-mono">±</span>
        zeigt die Veränderung gegenüber „Nur Interessen".
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
        <template v-else>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <div class="relative min-w-[16rem] flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Beruf suchen (z.B. Softwareentwickler, Zimmerer, Arzt)"
                class="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 pr-8 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              >
              <button
                v-if="searchQuery"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                aria-label="Suche zurücksetzen"
                @click="clearSearch"
              >
                ×
              </button>
            </div>
            <span
              v-if="isSearching"
              class="text-xs text-slate-400"
            >
              {{ rankedResults.length }} Treffer
            </span>
          </div>
          <div
            v-if="!isSearching && (weakMatchCount > 0 || showWeakMatches)"
            class="mt-3 flex items-center gap-2 text-xs text-slate-400"
          >
            <label class="inline-flex cursor-pointer items-center gap-2">
              <input
                v-model="showWeakMatches"
                type="checkbox"
                class="h-3.5 w-3.5 cursor-pointer accent-indigo-500"
              >
              <span>
                Alle Berufe zeigen – auch die, die nicht zu dir passen
                <span class="text-slate-500">
                  ({{ showWeakMatches ? activeResults.length : weakMatchCount }}
                  {{ showWeakMatches ? 'Berufe gesamt' : 'zusätzlich' }})
                </span>
              </span>
            </label>
          </div>

          <div
            v-if="!isSearching && rankedResults.length > 0"
            class="mt-4 flex justify-end"
          >
            <button
              type="button"
              class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700"
              @click="shareTop20"
            >
              {{ shareState === 'copied' ? 'In die Zwischenablage kopiert!' : shareState === 'failed' ? 'Kopieren fehlgeschlagen' : 'Top-20 zum Teilen kopieren' }}
            </button>
          </div>

          <ol class="mt-6 space-y-3">
            <li
              v-for="result in visibleResults"
              :key="result.occupation.onetCode"
              class="rounded-md border border-slate-800 bg-slate-900"
            >
              <div class="flex items-center justify-between gap-3 px-4 py-3">
                <div class="min-w-0 flex-1">
                  <div class="font-medium break-words text-slate-100">
                    {{ result.rank }}. {{ displayTitle(result.occupation) }}
                  </div>
                  <div class="text-xs break-words text-slate-400">
                    <span v-if="occupationSubtitle(result.occupation)">
                      {{ occupationSubtitle(result.occupation) }} ·
                    </span>
                    O*NET {{ result.occupation.onetCode }}
                    <span v-if="result.occupation.anforderungsniveau != null"> · Anforderungsniveau: {{ result.occupation.anforderungsniveau }}</span>
                    <span v-if="!result.occupation.title.de && !result.occupation.kldbName"> · (Übersetzung folgt)</span>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <span
                    v-if="scoreDelta(result) != null && scoreDelta(result) !== 0"
                    class="rounded px-1.5 py-0.5 font-mono text-xs"
                    :class="scoreDelta(result)! > 0
                      ? 'bg-emerald-950/60 text-emerald-400'
                      : 'bg-red-950/60 text-red-400'"
                    :title="`Veränderung gegenüber „Nur Interessen“: ${scoreDelta(result)! > 0 ? '+' : ''}${scoreDelta(result)}`"
                  >
                    {{ scoreDelta(result)! > 0 ? '+' : '' }}{{ scoreDelta(result) }}
                  </span>
                  <span class="font-mono text-sm text-indigo-400">
                    {{ (displayFitScore(result.fitScore) * 100).toFixed(0) }}
                  </span>
                  <button
                    type="button"
                    class="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    :aria-label="openExplanations.has(result.occupation.onetCode)
                      ? t('explainPanel.toggle.close')
                      : t('explainPanel.toggle.open')"
                    :aria-expanded="openExplanations.has(result.occupation.onetCode)"
                    :data-testid="`explain-toggle-${result.occupation.onetCode}`"
                    @click="toggleExplanation(result.occupation.onetCode)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="h-4 w-4 transition-transform"
                      :class="{ 'rotate-180': openExplanations.has(result.occupation.onetCode) }"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div
                v-if="openExplanations.has(result.occupation.onetCode)"
                class="border-t border-slate-800 px-4 py-3"
                :data-testid="`explain-panel-${result.occupation.onetCode}`"
              >
                <div class="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  {{ t('explainPanel.title') }}
                </div>
                <dl class="space-y-2">
                  <div
                    v-for="row in scoreBreakdown(result, viewMode)"
                    :key="row.key"
                    class="grid grid-cols-[auto_1fr_auto] items-baseline gap-3"
                    :class="{ 'opacity-60': row.state === 'inactive' }"
                  >
                    <dt class="text-sm text-slate-200">{{ row.label }}</dt>
                    <dd class="text-xs text-slate-400">
                      {{ row.text }}<span v-if="row.inactiveTag" class="ml-1 text-slate-500 italic">· {{ row.inactiveTag }}</span>
                    </dd>
                    <dd
                      class="rounded px-1.5 py-0.5 font-mono text-xs"
                      :class="{
                        'bg-emerald-950/60 text-emerald-400': row.tone === 'positive' && (row.state === 'active' || row.state === 'inactive'),
                        'bg-red-950/60 text-red-400': row.tone === 'negative' && (row.state === 'active' || row.state === 'inactive'),
                        'bg-slate-800 text-slate-400': row.tone === 'neutral' || row.state === 'notScored' || row.state === 'noData',
                      }"
                    >
                      {{ row.value }}
                    </dd>
                  </div>
                </dl>
                <p class="mt-3 border-t border-slate-800 pt-3 font-mono text-xs text-slate-400">
                  {{ scoreFormula(result, viewMode) }}
                </p>
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
      </template>
    </template>
  </section>
</template>
