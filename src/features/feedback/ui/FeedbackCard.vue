<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import { buildFeedbackPayload, postFeedback } from '../lib/submitFeedback'

const store = useQuestionnaireStore()

// 1 = "passt gar nicht" … 5 = "passt perfekt". null until the user picks one;
// submitting is blocked until then, so the rating is a deliberate choice.
const rating = ref<number | null>(null)
const comment = ref('')
const COMMENT_MAX = 2000

type State = 'idle' | 'sending' | 'done' | 'error'
const state = ref<State>('idle')

const ratingScale = [
  { value: 1, label: 'passt gar nicht' },
  { value: 2, label: 'eher nicht' },
  { value: 3, label: 'teils, teils' },
  { value: 4, label: 'ganz gut' },
  { value: 5, label: 'passt perfekt' },
]

async function submit(): Promise<void> {
  if (rating.value === null || state.value === 'sending') return
  state.value = 'sending'
  const payload = buildFeedbackPayload(store, rating.value, comment.value)
  const ok = await postFeedback(payload)
  state.value = ok ? 'done' : 'error'
}
</script>

<template>
  <div class="mt-12 rounded-xl border border-slate-700/60 bg-slate-900/50 p-6">
    <div class="flex items-center gap-2">
      <h2 class="text-2xl font-semibold text-slate-100">
        Hilf uns, PathFinder zu verbessern
      </h2>
      <span class="rounded bg-indigo-500/20 px-1.5 py-0.5 text-xs font-medium text-indigo-300">
        Beta
      </span>
    </div>

    <template v-if="state !== 'done'">
      <p class="mt-2 text-sm text-slate-400">
        PathFinder ist in einer geschlossenen Testphase. Damit wir prüfen können,
        ob die Berufsempfehlungen wirklich passen, kannst du deine Antworten und
        dein Ergebnis freiwillig und anonym an uns übermitteln. Kein Login, keine
        IP-Adresse, keine persönlichen Daten. Übertragen werden nur deine
        Test-Antworten und die berechnete Berufsliste.
      </p>

      <p class="mt-5 text-sm font-medium text-slate-200">
        Wie gut passt dein Ergebnis zu dir?
      </p>
      <div class="mt-2 grid grid-cols-5 gap-2">
        <button
          v-for="step in ratingScale"
          :key="step.value"
          type="button"
          class="flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-center transition-colors"
          :class="rating === step.value
            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
            : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'"
          @click="rating = step.value"
        >
          <span class="font-mono text-sm">{{ step.value }}</span>
          <span class="text-[0.65rem] leading-tight">{{ step.label }}</span>
        </button>
      </div>

      <label class="mt-5 block text-sm font-medium text-slate-200" for="feedback-comment">
        Magst du uns noch etwas mitgeben? (optional)
      </label>
      <textarea
        id="feedback-comment"
        v-model="comment"
        :maxlength="COMMENT_MAX"
        rows="3"
        placeholder="Was hat gut gepasst, was nicht? Was war unklar?"
        class="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
      />

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-slate-500">
          Mit dem Absenden überträgst du deine Antworten anonym. Die Übermittlung
          ist freiwillig und gilt nur für die Testphase. Was genau übertragen
          wird, steht im
          <RouterLink
            to="/datenschutz"
            class="underline underline-offset-2 hover:text-slate-300"
          >
            Datenschutz-Hinweis
          </RouterLink>.
        </p>
        <button
          type="button"
          :disabled="rating === null || state === 'sending'"
          class="inline-flex shrink-0 items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          @click="submit"
        >
          {{ state === 'sending' ? 'Wird gesendet …' : 'Anonym absenden' }}
        </button>
      </div>

      <p v-if="state === 'error'" class="mt-3 text-sm text-red-400">
        Das hat leider nicht geklappt. Bitte versuch es später noch einmal.
      </p>
    </template>

    <p v-else class="mt-2 text-sm text-emerald-300">
      Danke! Dein anonymes Feedback hilft uns, den Test besser zu machen.
    </p>
  </div>
</template>
