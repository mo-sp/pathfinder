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
if (store.isComplete) store.reset()

// Prefetch the lazy occupations chunk while the user answers so results
// can render instantly on completion. Fire-and-forget: a failure here just
// means /ergebnis will trigger its own load with a short delay, and the
// user won't be blocked from answering questions either way.
onMounted(() => {
  store.loadOccupations().catch((err) => {
    console.error('Failed to prefetch occupations', err)
  })
})

const likertOptions = [1, 2, 3, 4, 5] as const

const text = computed(() => {
  const q = store.currentQuestion
  if (!q) return ''
  return q.text.de ?? q.text.en
})

// "Schicht 1 · Interessen" vs "Schicht 2 · Persönlichkeit" — gives the
// user an anchor to know which stage of the progressive funnel they're
// currently on. Layer number is hardcoded here (riasec=1, bigfive=2) to
// match PROJECT.md's numbering.
const layerLabel = computed(() => {
  if (store.currentLayer === 'bigfive') return 'Schicht 2 · Persönlichkeit'
  return 'Schicht 1 · Interessen'
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
        <span>Frage {{ store.currentIndex + 1 }} von {{ store.total }}</span>
      </div>
      <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          class="h-full bg-indigo-500 transition-all duration-300"
          :style="{ width: `${store.progress * 100}%` }"
        />
      </div>
    </div>

    <div
      v-if="store.currentQuestion"
      class="rounded-lg border border-slate-800 bg-slate-900 p-8"
    >
      <p class="text-xs uppercase tracking-wide text-slate-500">
        {{ t(`questionPrompt.${store.currentLayer}`) }}
      </p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-100">
        {{ text }}
      </h2>

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
          <span class="text-xs text-slate-400">{{ t(`likert.${store.currentLayer}.${value}`) }}</span>
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
