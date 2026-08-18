<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import ScrollToTop from '@shared/ui/ScrollToTop.vue'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'

const store = useQuestionnaireStore()

// Hydrate on app mount so the header shortcut below also appears on `/`
// after a full-page reload. hydrate() is idempotent; main.ts already
// triggers it for /test and /ergebnis, and this extra call short-circuits
// via its own `hydrated` guard.
onMounted(() => {
  void store.hydrate()
})
</script>

<template>
  <div class="min-h-full flex flex-col">
    <header class="border-b border-slate-800 bg-slate-900">
      <div class="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <RouterLink
            to="/"
            class="text-xl font-bold text-slate-100 hover:text-indigo-400 transition-colors"
          >
            PathFinder
          </RouterLink>
          <!-- Sits on the wordmark rather than on a section, so the caveat is
               visible on every route and before the 60 questions rather than
               only on the results page. Deliberately the only Beta marker in
               the UI: FeedbackCard used to carry a second one, and its own
               first sentence already says the same thing. -->
          <span
            class="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[0.65rem] font-medium text-indigo-300"
          >
            Beta
          </span>
        </div>
        <nav class="flex gap-4 text-sm text-slate-400">
          <RouterLink to="/" class="hover:text-indigo-400">Startseite</RouterLink>
          <RouterLink to="/test" class="hover:text-indigo-400">Zum Test</RouterLink>
          <RouterLink
            v-if="store.riasecIsComplete"
            to="/ergebnis"
            class="hover:text-indigo-400"
          >
            Zum Ergebnis
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <!-- The bottom padding keeps the last line clear of the fixed ScrollToTop
         button, which sits in the bottom-right corner of the viewport and would
         otherwise cover whatever the footer ends with once the page is scrolled
         down. That button occupies the lowest 68px (44px tall, 24px offset), so
         pb-20 (80px) is about as tight as this gets — a step further and the
         arrow sits on the text again. Desktop has no such constraint: the
         footer text clears the corner there anyway. -->
    <footer class="border-t border-slate-800 bg-slate-900 text-xs text-slate-400">
      <div class="mx-auto max-w-4xl px-4 pt-5 pb-20 space-y-2 sm:pt-6 sm:pb-8">
        <p>
          Diese Seite verwendet Material aus den O*NET® Career Exploration Tools
          und der O*NET-Datenbank des U.S. Department of Labor, Employment and
          Training Administration (USDOL/ETA). Verwendung unter der O*NET Tools
          Developer License und CC BY 4.0. O*NET® ist eine Marke der USDOL/ETA.
        </p>
        <p>
          PathFinder ist Open Source. Keine Logins, keine Tracker.
          <RouterLink
            to="/datenschutz"
            class="ms-1 underline underline-offset-2 hover:text-indigo-400"
          >
            Datenschutz
          </RouterLink>
        </p>
      </div>
    </footer>

    <ScrollToTop />
  </div>
</template>
