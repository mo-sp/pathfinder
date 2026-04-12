<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'

const store = useQuestionnaireStore()
const router = useRouter()
const { t } = useI18n()

// Navigating to /test after the user has finished the current layer
// (e.g. via the header's "Zum Test" link, or a direct reload of /test
// with both layers complete in Dexie) would otherwise drop the user on
// the last question of the finished layer — `hydrate()` clamps the
// per-layer index to total-1 for complete layers. Reset here so the
// fresh-start rule matches the HomePage CTA. In-progress layers keep
// their state and resume at the next unanswered question. Runs in
// setup() — before the first render — so there is no flash of the stale
// "complete" state. This relies on the layer-aware `isComplete` alias:
// when the user is mid-Big Five it returns false and the reset is
// skipped, so the Verfeinern-CTA path from /ergebnis continues cleanly.
if (store.isComplete) store.resetCurrentLayer()

// Prefetch the lazy occupations chunk while the user answers so results
// can render instantly on completion. Fire-and-forget: a failure here just
// means /ergebnis will trigger its own load with a short delay, and the
// user won't be blocked from answering questions either way.
onMounted(() => {
  store.loadOccupations().catch((err) => {
    console.error('Failed to prefetch occupations', err)
  })
  store.loadBigFiveProfiles().catch((err) => {
    console.error('Failed to prefetch Big Five profiles', err)
  })
})

const likertOptions = [1, 2, 3, 4, 5] as const

const text = computed(() => {
  const q = store.currentQuestion
  if (!q) return ''
  return q.text.de ?? q.text.en
})

// Skills items carry an optional short concept description (e.g., the
// O*NET definition of "Active Listening"). Rendered below the label so
// users who don't know the term can disambiguate without leaving the
// question. RIASEC/BigFive/Values items don't have this field.
const description = computed(() => {
  const q = store.currentQuestion
  if (!q?.description) return null
  return q.description.de ?? q.description.en
})

// "Schicht 1 · Interessen" vs "Schicht 2 · Persönlichkeit" — gives the
// user an anchor to know which stage of the progressive funnel they're
// currently on. Layer number is hardcoded here (riasec=1, bigfive=2) to
// match PROJECT.md's numbering.
const layerLabel = computed(() => {
  if (store.currentLayer === 'skills') return 'Schicht 4 · Fähigkeiten, Talente & Wissen'
  if (store.currentLayer === 'values') return 'Schicht 3 · Werte & Rahmenbedingungen'
  if (store.currentLayer === 'bigfive') return 'Schicht 2 · Persönlichkeit'
  return 'Schicht 1 · Interessen'
})

// Skills layer shows a sub-category indicator ("Fähigkeiten (12/35)")
// in place of the generic "Frage X von Y" count so users know where they
// are inside the 3-part sub-sequence.
const isSkillsLayer = computed(() => store.currentLayer === 'skills')
const subCategoryLabel = computed(() => {
  if (!isSkillsLayer.value) return ''
  const name = t(`skillsSubCategory.${store.skillsCurrentSubCategory}`)
  return `${name} (${store.skillsSubCategoryIndex + 1}/${store.skillsSubCategoryTotal})`
})

// Values questions carry per-question labels; RIASEC/BigFive use layer-
// level i18n labels; skills uses per-sub-category labels (different
// semantics: "beherrschen" vs. "ausgeprägt" vs. "Wissen").
const likertLabels = computed(() => {
  const q = store.currentQuestion
  if (q?.labels) return q.labels.de ?? q.labels.en
  if (store.currentLayer === 'skills') {
    return likertOptions.map((n) =>
      t(`likert.skills.${store.skillsCurrentSubCategory}.${n}`),
    )
  }
  return likertOptions.map((n) => t(`likert.${store.currentLayer}.${n}`))
})

// Values questions are self-contained (the question text IS the prompt).
// RIASEC/BigFive/Skills show a separate prompt above the question text.
const showQuestionPrompt = computed(
  () => store.currentLayer !== 'values',
)
const questionPromptText = computed(() => {
  if (store.currentLayer === 'skills') {
    return t(`questionPrompt.skills.${store.skillsCurrentSubCategory}`)
  }
  return t(`questionPrompt.${store.currentLayer}`)
})

// Interstitial / Zwischenscreen computeds — only used when the skills
// layer is active AND `skillsInterstitialPending` is true. Layered so the
// template stays free of nested ternaries.
const interstitialFromSub = computed(() => store.skillsCurrentSubCategory)
const interstitialToSub = computed(() => store.skillsPendingNextSubCategory)
const interstitialDoneText = computed(() => {
  const sub = interstitialFromSub.value
  if (sub === 'skills') {
    return 'Du hast alle 35 Fragen zu deinen Fähigkeiten beantwortet.'
  }
  if (sub === 'abilities') {
    return 'Du hast alle 52 Fragen zu deinen Talenten beantwortet.'
  }
  return ''
})
const interstitialNextText = computed(() => {
  const sub = interstitialToSub.value
  if (!sub) return ''
  return t(`skillsSubCategoryCountText.${sub}`)
})
const interstitialNextDescription = computed(() => {
  const sub = interstitialToSub.value
  if (!sub) return ''
  return t(`skillsSubCategoryDescription.${sub}`)
})

async function selectAnswer(value: number): Promise<void> {
  store.answer(value)
  if (!store.isComplete) return

  // Persistence is best-effort – never block the user from seeing their result
  // because IndexedDB hiccupped (private mode, quota, etc.).
  try {
    await store.persist()
  } catch (err) {
    console.error('Failed to persist assessment session', err)
  }
  await router.push('/ergebnis')
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-12">
    <div class="mb-6">
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>{{ layerLabel }}</span>
        <span>{{ Math.round(store.progress * 100) }} %</span>
      </div>
      <div class="mt-1 flex items-center justify-between text-xs text-slate-500">
        <span v-if="isSkillsLayer">{{ subCategoryLabel }}</span>
        <span v-else>Frage {{ store.currentIndex + 1 }} von {{ store.total }}</span>
      </div>
      <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          class="h-full bg-indigo-500 transition-all duration-300"
          :style="{ width: `${store.progress * 100}%` }"
        />
      </div>
    </div>

    <!-- Zwischenscreen: shown between skills sub-categories so the user
         gets a clear checkpoint / intro to the next sub-sequence instead
         of silently crossing from "skill 35" to "ability 1". -->
    <div
      v-if="store.skillsInterstitialPending"
      class="rounded-lg border border-indigo-500/40 bg-slate-900 p-8"
    >
      <p class="text-xs uppercase tracking-wide text-indigo-300">Sehr gut!</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-100">
        {{ t(`skillsInterstitial.done.${interstitialFromSub}`) }}
      </h2>
      <p class="mt-3 text-sm text-slate-300">{{ interstitialDoneText }}</p>

      <div class="mt-6 border-t border-slate-800 pt-6">
        <p class="text-xs uppercase tracking-wide text-slate-500">
          {{ t('skillsInterstitial.nextHeader') }}
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-100">
          {{ interstitialNextText }}
        </p>
        <p class="mt-1 text-sm text-slate-400">{{ interstitialNextDescription }}</p>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700"
          @click="store.previous"
        >
          ← Zurück
        </button>
        <button
          type="button"
          class="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
          @click="store.dismissSkillsInterstitial"
        >
          {{ t('skillsInterstitial.continue') }} →
        </button>
      </div>
    </div>

    <div
      v-else-if="store.currentQuestion"
      class="rounded-lg border border-slate-800 bg-slate-900 p-8"
    >
      <p
        v-if="showQuestionPrompt"
        class="text-xs uppercase tracking-wide text-slate-500"
      >
        {{ questionPromptText }}
      </p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-100">
        {{ text }}
      </h2>
      <p
        v-if="description"
        class="mt-2 text-sm text-slate-400"
      >
        {{ description }}
      </p>

      <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <button
          v-for="value in likertOptions"
          :key="value"
          type="button"
          class="group flex flex-col items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-slate-200 transition hover:border-indigo-400 hover:bg-indigo-950/50"
          @click="selectAnswer(value)"
        >
          <span class="text-lg font-bold text-slate-100 group-hover:text-indigo-300">
            {{ value }}
          </span>
          <span class="text-xs text-slate-400">{{ likertLabels[value - 1] }}</span>
        </button>
      </div>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="store.currentIndex === 0"
          @click="store.previous"
        >
          ← Zurück
        </button>
        <!-- Shortcut back to /ergebnis during the Big Five layer: gives
             the user a way to peek at their RIASEC result without losing
             their partial Big Five answers. Hidden while RIASEC is
             in-progress because there's nothing to go back TO yet. -->
        <button
          v-if="store.riasecIsComplete"
          type="button"
          class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700"
          @click="router.push('/ergebnis')"
        >
          Ergebnisansicht
        </button>
        <button
          type="button"
          class="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700"
          @click="store.resetCurrentLayer"
        >
          Schicht neu starten
        </button>
      </div>
    </div>
  </section>
</template>
