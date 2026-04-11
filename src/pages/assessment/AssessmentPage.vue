<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'

const store = useQuestionnaireStore()
const router = useRouter()
const { t } = useI18n()

// Navigating to /test after a completed run (e.g. via the header's "Zum
// Test" link, or a direct reload of /test with a completed session still
// in Dexie) would otherwise drop the user on the last question of the
// finished test — `hydrate()` clamps currentIndex to total-1 for complete
// sessions. Reset here so the fresh-start rule matches the HomePage CTA.
// In-progress sessions keep their state and resume at the next unanswered
// question as before. Runs in setup() — before the first render — so
// there is no flash of the stale "complete" state.
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
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>Frage {{ store.currentIndex + 1 }} von {{ store.total }}</span>
        <span>{{ Math.round(store.progress * 100) }} %</span>
      </div>
      <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full bg-indigo-600 transition-all duration-300"
          :style="{ width: `${store.progress * 100}%` }"
        />
      </div>
    </div>

    <div
      v-if="store.currentQuestion"
      class="rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
    >
      <p class="text-xs uppercase tracking-wide text-slate-400">
        Wie sehr würdest du das gerne tun?
      </p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">
        {{ text }}
      </h2>

      <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <button
          v-for="value in likertOptions"
          :key="value"
          type="button"
          class="group flex flex-col items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 transition hover:border-indigo-500 hover:bg-indigo-50"
          @click="selectAnswer(value)"
        >
          <span class="text-lg font-bold text-slate-900 group-hover:text-indigo-700">
            {{ value }}
          </span>
          <span class="text-xs text-slate-500">{{ t(`likert.${value}`) }}</span>
        </button>
      </div>

      <div class="mt-6 flex justify-between text-xs">
        <button
          type="button"
          class="text-slate-500 hover:text-slate-900 disabled:opacity-30"
          :disabled="store.currentIndex === 0"
          @click="store.previous"
        >
          ← Zurück
        </button>
        <button
          type="button"
          class="text-slate-500 hover:text-slate-900"
          @click="store.reset"
        >
          Neu starten
        </button>
      </div>
    </div>
  </section>
</template>
