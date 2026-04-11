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
    <h1 class="text-4xl font-bold tracking-tight text-slate-900">
      Finde deinen Weg.
    </h1>
    <p class="mt-4 text-lg text-slate-600">
      PathFinder ist ein freier, datenschutzfreundlicher Berufstest auf Basis
      validierter psychometrischer Modelle. Kein Login. Keine Tracker. Alle
      Daten bleiben in deinem Browser.
    </p>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm font-medium text-slate-900">Schicht 1: RIASEC</div>
        <p class="mt-1 text-xs text-slate-500">
          O*NET Interest Profiler – Berufsinteressen nach Holland
        </p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 opacity-60">
        <div class="text-sm font-medium text-slate-900">Schicht 2: Big Five</div>
        <p class="mt-1 text-xs text-slate-500">Persönlichkeit – folgt in Phase 2</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 opacity-60">
        <div class="text-sm font-medium text-slate-900">Schicht 3: Werte</div>
        <p class="mt-1 text-xs text-slate-500">
          Rahmenbedingungen – folgt in Phase 2
        </p>
      </div>
    </div>

    <div class="mt-10 flex items-center gap-4">
      <RouterLink
        to="/test"
        class="inline-flex items-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        @click="start"
      >
        Test starten ({{ store.total }} Fragen)
      </RouterLink>
      <span class="text-sm text-slate-500">~5 Minuten</span>
    </div>

    <p class="mt-12 text-xs text-slate-400">
      Aktueller Stand: vollständiger RIASEC-Test mit 60 Items aus dem O*NET
      Interest Profiler Short Form. Big Five und persönliche Werte folgen in
      Phase 2.
    </p>
  </section>
</template>
