<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { AssessmentLayer } from '@entities/assessment/model/types'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'

const store = useQuestionnaireStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// Navigating to /test after the user has finished the current layer
// (e.g. via the header's "Zum Test" link, or a direct reload of /test
// with both layers complete in Dexie) would otherwise drop the user on
// the last question of the finished layer — `hydrate()` clamps the
// per-layer index to total-1 for complete layers. If there is a later
// layer that is still incomplete, switch into it so the user continues
// the progressive funnel instead of redoing finished work. Only when
// every layer is already done do we fall back to resetting the current
// layer (the user is asking for a re-run). Runs in setup() — before the
// first render — so there is no flash of stale "complete" state.
//
// `?edit=true` opts out: it means the user clicked "Antworten bearbeiten"
// on /ergebnis, where the store already switched to the chosen layer and
// parked the index on its last answered question. Bouncing or resetting
// here would defeat that intent, so we leave the deep-linked state alone.
if (store.isComplete && route.query.edit !== 'true') {
  const layerOrder: AssessmentLayer[] = ['riasec', 'bigfive', 'values', 'skills']
  const isLayerComplete: Record<AssessmentLayer, boolean> = {
    riasec: store.riasecIsComplete,
    bigfive: store.bigfiveIsComplete,
    values: store.valuesIsComplete,
    skills: store.skillsIsComplete,
  }
  const nextIncomplete = layerOrder.find((l) => !isLayerComplete[l]) ?? null
  if (nextIncomplete) {
    store.currentLayer = nextIncomplete
  } else {
    store.resetCurrentLayer()
  }
}

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
  // Landing → "Test starten" lands here with the page still scrolled to
  // whatever Y the landing-page CTA sat at. Anchor the first question to
  // the viewport top for the same reason as the in-flow nav.
  void scrollToQuestion()
})

// Both restarts destroy answers and persist immediately, so both are guarded
// by the same dialog. It names the actual cost, because a bare "Wirklich?"
// gets dismissed reflexively by the third time.
type RestartScope = 'layer' | 'subCategory'
const pendingRestart = ref<RestartScope | null>(null)

function askRestartLayer(): void {
  pendingRestart.value = 'layer'
}

function askRestartSubCategory(): void {
  pendingRestart.value = 'subCategory'
}

async function confirmRestart(): Promise<void> {
  const scope = pendingRestart.value
  pendingRestart.value = null
  if (scope === 'layer') {
    store.resetCurrentLayer()
  } else if (scope === 'subCategory') {
    store.repeatSkillsSubCategory(store.skillsCurrentSubCategory)
  }
  await scrollToQuestion()
}

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
  if (store.currentLayer === 'values') return 'Schicht 3 · Rahmenbedingungen'
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

// Refs on whichever card is currently rendered — question card during the
// normal flow, interstitial card between skills sub-categories. Used by
// scrollToQuestion() to bring the active card to the top of the viewport
// after an in-layer navigation.
const questionCardRef = ref<HTMLElement | null>(null)
const interstitialCardRef = ref<HTMLElement | null>(null)

// On mobile the Likert buttons sit near the fold, so without this the user
// lands on the answer area of the next question and has to scroll up to
// read the prompt. Scrolling the question CARD to the top (instead of the
// whole page) keeps the user inside the question UI — progress bar and
// layer label scroll off, focus stays on the question itself. nextTick
// waits for Vue to swap question/interstitial DOM before measuring.
async function scrollToQuestion(): Promise<void> {
  await nextTick()
  const target = interstitialCardRef.value ?? questionCardRef.value
  target?.scrollIntoView({ block: 'start' })
}

async function selectAnswer(value: number): Promise<void> {
  // The Likert click never auto-navigates anymore — even when this answer
  // completes the layer, the user lands on the now-locked question card
  // with a "Zum Ergebnis →" button. That gives them an explicit edit
  // window for the final answer instead of the previous "answer → flash
  // to /ergebnis → no way back without wiping the layer" trap.
  store.answer(value)
  await scrollToQuestion()
}

// True when goForward would dead-end (last layer index, or a finished skills
// partial-retake at a sub-category boundary). The Weiter button then simply
// greys out — it no longer relabels itself and navigates; leaving the layer
// is "Zum Ergebnis →" instead. Also arms the one-shot nudge below.
const isFinalForward = computed(() => store.isComplete && !store.canAdvance)

// The "Zum Ergebnis" nudge fires exactly once per layer, on the first time
// that layer is completed. Going back to revise an answer and coming forward
// again must NOT re-trigger it: the user is editing on purpose at that point,
// and a button pulsing at them reads as being pushed towards the exit.
const pulsedLayers = new Set<AssessmentLayer>()
const pulseResultsButton = ref(false)

watch(isFinalForward, (finished) => {
  if (!finished || !store.riasecIsComplete) return
  if (pulsedLayers.has(store.currentLayer)) return
  pulsedLayers.add(store.currentLayer)
  pulseResultsButton.value = true
})

// Answers already recorded in the layer the user is currently in — used to
// name the cost in the restart confirm.
const answeredInCurrentLayer = computed(() => {
  const counts: Record<AssessmentLayer, number> = {
    riasec: store.riasecAnswers.length,
    bigfive: store.bigfiveAnswers.length,
    values: store.valuesAnswers.length,
    skills: store.skillsAnswers.length,
  }
  return counts[store.currentLayer]
})

const restartDialogTitle = computed(() =>
  pendingRestart.value === 'subCategory' ? 'Diesen Teil neu starten?' : 'Schicht neu starten?',
)

const restartDialogBody = computed(() => {
  if (pendingRestart.value === 'subCategory') {
    const name = t(`skillsSubCategory.${store.skillsCurrentSubCategory}`)
    return `Deine Antworten zum Teil „${name}“ werden gelöscht. Das lässt sich nicht rückgängig machen.`
  }
  const n = answeredInCurrentLayer.value
  if (n === 0) return 'Du fängst diese Schicht von vorne an.'
  const noun = n === 1 ? 'bereits gegebene Antwort' : 'bereits gegebene Antworten'
  const verb = n === 1 ? 'wird' : 'werden'
  return `${n} ${noun} dieser Schicht ${verb} gelöscht. Das lässt sich nicht rückgängig machen.`
})

async function goBack(): Promise<void> {
  store.previous()
  await scrollToQuestion()
}

async function dismissInterstitial(): Promise<void> {
  store.dismissSkillsInterstitial()
  await scrollToQuestion()
}

async function goForward(): Promise<void> {
  if (isFinalForward.value) {
    // Persistence is best-effort – never block the user from seeing their
    // result because IndexedDB hiccupped (private mode, quota, etc.).
    try {
      await store.persist()
    } catch (err) {
      console.error('Failed to persist assessment session', err)
    }
    // Layer-completion navigation carries `focus=<layer>` so /ergebnis can
    // scroll to the just-finished section instead of landing at top of
    // page (which sits past the RIASEC hexagon every time).
    await router.push({ path: '/ergebnis', query: { focus: store.currentLayer } })
    return
  }
  store.goForward()
  await scrollToQuestion()
}

// Which results section the "Ergebnisansicht" shortcut should scroll to:
// the current layer if it's already complete (edit flow), otherwise the
// most recently completed layer in the funnel. The button only renders
// once RIASEC is complete, so this always resolves to a rendered
// `#layer-<x>` section rather than dumping the user at page top.
const ergebnisFocus = computed<AssessmentLayer>(() => {
  const complete: Record<AssessmentLayer, boolean> = {
    riasec: store.riasecIsComplete,
    bigfive: store.bigfiveIsComplete,
    values: store.valuesIsComplete,
    skills: store.skillsIsComplete,
  }
  if (complete[store.currentLayer]) return store.currentLayer
  const order: AssessmentLayer[] = ['skills', 'values', 'bigfive', 'riasec']
  return order.find((l) => complete[l]) ?? 'riasec'
})

async function goToResults(): Promise<void> {
  // This is now the ONLY way out of a finished layer (the forward button no
  // longer doubles as "Zum Ergebnis"), so flush the session on the way out.
  // Deliberately NOT awaited: the store already persists on every answer, so
  // this is a belt-and-braces flush, and making the user wait on IndexedDB
  // before the page turns would be a worse trade than a rare lost write.
  void store.persist().catch((err) => {
    console.error('Failed to persist assessment session', err)
  })
  await router.push({ path: '/ergebnis', query: { focus: ergebnisFocus.value } })
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
      ref="interstitialCardRef"
      class="scroll-mt-24 rounded-lg border border-indigo-500/40 bg-slate-900 p-8"
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
          @click="goBack"
        >
          ← Zurück
        </button>
        <button
          type="button"
          class="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
          @click="dismissInterstitial"
        >
          {{ t('skillsInterstitial.continue') }} →
        </button>
      </div>
    </div>

    <div
      v-else-if="store.currentQuestion"
      ref="questionCardRef"
      class="scroll-mt-24 rounded-lg border border-slate-800 bg-slate-900 p-8"
    >
      <!-- Reserve a consistent height for the prompt + question (+ optional
           skills description) so the Likert grid and the bottom button row
           start at the same vertical position whether the question is one
           line or three. Without this the buttons jump between questions,
           which is jarring now that the lock/edit flow has users stepping
           back and forth a lot. Longer questions still grow past the
           reserve; this only stabilises the common 1–3 line case. -->
      <div class="min-h-[8.5rem] sm:min-h-[7rem]">
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
      </div>

      <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <button
          v-for="value in likertOptions"
          :key="value"
          type="button"
          :class="[
            'group flex flex-col items-center gap-2 rounded-md border px-3 py-3 text-sm transition',
            value === store.currentAnswer?.value
              ? 'border-indigo-400 bg-indigo-950/70 text-slate-200'
              : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-950/25',
          ]"
          @click="selectAnswer(value)"
        >
          <span
            :class="[
              'text-lg font-bold',
              value === store.currentAnswer?.value
                ? 'text-indigo-300'
                : 'text-slate-100 group-hover:text-indigo-300',
            ]"
          >
            {{ value }}
          </span>
          <span class="text-xs text-slate-400">{{ likertLabels[value - 1] }}</span>
        </button>
      </div>

      <!-- Controls, in two groups. LEFT: everything that acts inside the
           current layer — Zurück, Weiter, Schicht neu starten, and (skills
           only) Nur diesen Teil neu. RIGHT: "Zum Ergebnis →" on its own, so
           the way out is never mistaken for an in-layer control.
           Mobile (flex-col): the left group is a 2-column grid, so it reads
           as one or two tidy rows and every button shares a width; the exit
           stacks full-width below. Desktop (sm:flex-row): one row, left group
           compact, exit pushed right via sm:ms-auto.
           Every button is ALWAYS rendered and only greys out when unusable
           (Zurück at the first question, Weiter once the layer is finished,
           Zum Ergebnis until there is a result), so the row never reshuffles
           and nothing lands where something else just was. Buttons are larger
           on mobile (px-4 py-2.5 text-sm) and compact on desktop (sm:*). -->
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="grid grid-cols-2 gap-3 sm:flex sm:flex-initial">
          <button
            type="button"
            class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:bg-slate-800 sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs"
            :disabled="store.currentIndex === 0"
            @click="goBack"
          >
            ← Zurück
          </button>
          <!-- Forward affordance: advances without re-recording on revisit.
               It NEVER relabels itself — on the last question it simply greys
               out, and leaving the layer happens through "Zum Ergebnis →",
               which sits alone on the right. A button that changes its meaning under a cursor
               trained by dozens of clicks is how users hit the wrong one. -->
          <button
            type="button"
            class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:bg-slate-800 sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs"
            :disabled="!store.currentAnswer || isFinalForward"
            @click="goForward"
          >
            Weiter →
          </button>
          <button
            type="button"
            class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs"
            @click="askRestartLayer"
          >
            Schicht neu starten
          </button>
          <button
            v-if="store.currentLayer === 'skills'"
            type="button"
            class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs"
            @click="askRestartSubCategory"
          >
            Nur diesen Teil neu
          </button>
        </div>
        <!-- The way out, alone on the right (sm:ms-auto) so it is never
             confused with the in-layer controls. Previously it was v-if'd away
             on the final question and the restart slid into the freed slot —
             the destructive button landing exactly where the harmless one had
             just been. Every button is now rendered unconditionally and only
             greys out, so nothing ever moves under the cursor. -->
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:ms-auto">
          <!-- The way out. Always rendered so its slot is stable, greyed until
               there is actually something to look at (RIASEC finished). On the
               FIRST completion of a layer it pulses twice: the forward button
               the user has been clicking for dozens of questions just went
               grey, and this says where to go instead — without taking the
               click away from them, which an automatic redirect would. On a
               revisit it stays still; see pulsedLayers. -->
          <button
            type="button"
            class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:bg-slate-800 sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs"
            :class="{ 'pulse-attention': pulseResultsButton }"
            :disabled="!store.riasecIsComplete"
            @animationend="pulseResultsButton = false"
            @click="goToResults"
          >
            Zum Ergebnis →
          </button>
        </div>
      </div>
    </div>

    <!-- Restart guard. Deliberately not a native confirm(): this is the only
         action in the app that destroys user data, and it deserves to look
         like the rest of the product rather than like a browser error. -->
    <div
      v-if="pendingRestart"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restart-confirm-title"
      @click.self="pendingRestart = null"
      @keydown.esc="pendingRestart = null"
    >
      <div class="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
        <h2 id="restart-confirm-title" class="text-base font-semibold text-slate-100">
          {{ restartDialogTitle }}
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          {{ restartDialogBody }}
        </p>
        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 sm:w-auto"
            @click="pendingRestart = null"
          >
            Abbrechen
          </button>
          <button
            type="button"
            class="w-full rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 hover:border-rose-500/60 hover:bg-rose-500/20 sm:w-auto"
            @click="confirmRestart"
          >
            Neu starten
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Two beats, then still — enough to catch the eye when the forward button
   greys out, not enough to become decoration the user learns to ignore. */
@keyframes pulse-attention {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgb(129 140 248 / 0); }
  50% { transform: scale(1.04); box-shadow: 0 0 0 4px rgb(129 140 248 / 0.25); }
}

.pulse-attention {
  animation: pulse-attention 0.7s ease-in-out 2;
}

@media (prefers-reduced-motion: reduce) {
  .pulse-attention {
    animation: none;
    box-shadow: 0 0 0 2px rgb(129 140 248 / 0.35);
  }
}
</style>
