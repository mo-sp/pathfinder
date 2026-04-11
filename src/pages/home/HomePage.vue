<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'

const store = useQuestionnaireStore()

function start(): void {
  store.reset()
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-16">
    <h1 class="text-4xl font-bold tracking-tight text-slate-100">
      Finde deinen Weg.
    </h1>
    <p class="mt-4 text-lg text-slate-400">
      PathFinder ist ein freier, datenschutzfreundlicher Berufstest auf Basis
      validierter psychometrischer Modelle. Kein Login. Keine Tracker. Alle
      Daten bleiben in deinem Browser.
    </p>

    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-medium text-slate-100">Schicht 1: RIASEC</div>
        <p class="mt-1 text-xs text-slate-400">
          O*NET Interest Profiler – Berufsinteressen nach Holland
        </p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-medium text-slate-100">Schicht 2: Big Five</div>
        <p class="mt-1 text-xs text-slate-400">
          IPIP Big Five Factor Markers – Persönlichkeit
        </p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4 opacity-60">
        <div class="text-sm font-medium text-slate-100">Schicht 3: Werte</div>
        <p class="mt-1 text-xs text-slate-400">
          Rahmenbedingungen – folgt in Phase 2
        </p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4 opacity-60">
        <div class="text-sm font-medium text-slate-100">Schicht 4: Fähigkeiten</div>
        <p class="mt-1 text-xs text-slate-400">
          Selbsteinschätzung – folgt in Phase 2
        </p>
      </div>
    </div>

    <div class="mt-10 flex items-center gap-4">
      <RouterLink
        to="/test"
        class="inline-flex items-center rounded-md bg-indigo-500 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-400"
        @click="start"
      >
        Test starten ({{ store.total }} Fragen)
      </RouterLink>
      <span class="text-sm text-slate-400">~5 Minuten</span>
    </div>

    <div class="mt-12 rounded-lg border border-amber-800/60 bg-amber-950/40 p-5 text-amber-200">
      <p class="text-base font-semibold">Früher Prototyp</p>
      <p class="mt-1 text-sm">
        Diese Version ist ein frühes Entwicklungsstadium zum Testen mit
        Freunden. Fehler, Anmerkungen und Verbesserungsvorschläge sind
        ausdrücklich willkommen.
      </p>
      <p class="mt-3 text-sm">
        Aktueller Stand: vollständiger RIASEC-Test mit 60 Items aus dem O*NET
        Interest Profiler Short Form, optional verfeinert durch ein Big-Five-
        Persönlichkeitsprofil mit 50 Items aus dem IPIP Factor Markers Set.
        Werte und Fähigkeiten folgen in späteren Phasen.
      </p>
    </div>
  </section>
</template>
