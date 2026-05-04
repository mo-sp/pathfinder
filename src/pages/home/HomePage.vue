<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'

const store = useQuestionnaireStore()

// Total across all 4 layers — derived so item-count changes in the
// underlying JSON flow through without a hand-edit here. `store.total`
// alone would show only the *current* layer's count (e.g. 120 when the
// store is still in a post-Layer-4 hydrate state), which is misleading
// on a landing page that advertises the full scope.
const totalQuestions = computed(
  () =>
    store.riasecTotal +
    store.bigfiveTotal +
    store.valuesTotal +
    store.skillsTotal,
)

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
      Ein ausführlicher Berufstest – kostenlos, ohne Login, deine Antworten
      verlassen dein Gerät nicht. Ziel ist am Ende eine Liste passender
      Berufe, mit der du wirklich etwas anfangen kannst.
    </p>

    <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
      <RouterLink
        to="/test"
        class="inline-flex items-center rounded-md bg-indigo-500 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-400"
        @click="start"
      >
        Test starten · {{ totalQuestions }} Fragen
      </RouterLink>
      <p class="text-sm text-slate-500">
        Insgesamt etwa 25–45 Minuten, je nach Bearbeitungstempo.
      </p>
    </div>

    <h2 class="mt-16 text-2xl font-semibold text-slate-100">
      Was du am Ende bekommst:
    </h2>
    <ul class="mt-4 space-y-3 text-slate-300 marker:text-indigo-400 list-disc pl-5">
      <li>
        <strong class="font-semibold text-slate-100">Eine sortierte Liste aus 923 Berufen</strong>,
        gewichtet aus deinen Antworten auf allen vier Ebenen.
      </li>
      <li>
        <strong class="font-semibold text-slate-100">Vier Profil-Übersichten</strong>:
        Interessen-Hexagon (RIASEC), Persönlichkeits-Diagramm (Big Five),
        Werte-Karten und deine Selbsteinschätzung in Fähigkeiten, Talenten
        und Wissen.
      </li>
      <li>
        <strong class="font-semibold text-slate-100">Suche</strong> über
        alle Berufe und
        <strong class="font-semibold text-slate-100">Top-20 zum Kopieren</strong>
        für Notizen oder zum Teilen.
      </li>
    </ul>

    <h2 class="mt-16 text-2xl font-semibold text-slate-100">
      Was wir messen:
    </h2>
    <p class="mt-3 text-slate-400">
      Vier Ebenen, die nacheinander abgefragt werden. Jede schärft die
      Berufsliste weiter, keine ersetzt eine andere.
    </p>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-medium text-slate-100">Schicht 1: RIASEC</div>
        <p class="mt-1 text-xs text-slate-400">
          O*NET Interest Profiler – Berufsinteressen nach Holland
        </p>
        <p class="mt-2 text-xs text-slate-500">60 Fragen · 6–12 Min</p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-medium text-slate-100">Schicht 2: Big Five</div>
        <p class="mt-1 text-xs text-slate-400">
          IPIP Big Five Factor Markers – Persönlichkeit
        </p>
        <p class="mt-2 text-xs text-slate-500">50 Fragen · 5–10 Min</p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-medium text-slate-100">Schicht 3: Werte</div>
        <p class="mt-1 text-xs text-slate-400">
          Rahmenbedingungen – Ausbildung, Umfeld, Arbeitsweise
        </p>
        <p class="mt-2 text-xs text-slate-500">8 Fragen · 1–2 Min</p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div class="text-sm font-medium text-slate-100">Schicht 4: Fähigkeiten</div>
        <p class="mt-1 text-xs text-slate-400">
          Selbsteinschätzung – Fähigkeiten, Talente &amp; Wissen (O*NET)
        </p>
        <p class="mt-2 text-xs text-slate-500">121 Fragen · 12–20 Min</p>
      </div>
    </div>

    <h2 class="mt-16 text-2xl font-semibold text-slate-100">
      Wie deine Daten geschützt sind:
    </h2>
    <ul class="mt-4 space-y-2 text-slate-300 marker:text-indigo-400 list-disc pl-5">
      <li>Kein Login, kein Tracking, keine Drittanbieter-Cookies.</li>
      <li>
        Deine Antworten leben ausschließlich in deinem Browser (IndexedDB)
        und verlassen dein Gerät nicht.
      </li>
      <li>
        Der Code ist Open Source:
        <a
          href="https://github.com/mo-sp/pathfinder"
          target="_blank"
          rel="noopener noreferrer"
          class="text-indigo-400 underline hover:text-indigo-300"
        >github.com/mo-sp/pathfinder</a>.
      </li>
    </ul>

    <div class="mt-16 rounded-lg border border-slate-700/60 bg-slate-900/50 p-5">
      <p class="text-base font-semibold text-slate-100">Stand der Entwicklung</p>
      <p class="mt-2 text-sm text-slate-300">
        PathFinder ist in aktiver Entwicklung. Wir kombinieren etablierte
        Berufstest-Modelle (Holland RIASEC, IPIP Big Five, O*NET-Skills)
        mit einer Datenbank von 923 Berufen aus O*NET und ESCO. Wenn dir
        ein Ergebnis nicht stimmig vorkommt oder dir etwas auffällt:
        Feedback ist sehr willkommen.
      </p>
    </div>
  </section>
</template>
