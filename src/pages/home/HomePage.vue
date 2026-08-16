<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'

const store = useQuestionnaireStore()

// The three optional layers combined. The CTA leads with the RIASEC count
// alone, because that is the real entry cost — a result exists once layer 1
// is done. This number keeps the remaining scope visible next to "Optional
// vertiefen" so leading with 60 stays honest rather than a bait.
// Derived per layer so item-count changes in the underlying JSON flow
// through without a hand-edit here; `store.total` alone would show only the
// *current* layer's count (e.g. 120 in a post-Layer-4 hydrate state).
const optionalQuestions = computed(
  () => store.bigfiveTotal + store.valuesTotal + store.skillsTotal,
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
      Ein fundierter Berufstest, kostenlos und ohne Login. Deine Antworten
      verlassen dein Gerät nicht. Am Ende steht eine Liste passender Berufe,
      mit der du wirklich etwas anfangen kannst.
    </p>

    <div class="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
      <RouterLink
        to="/test"
        class="inline-flex items-center rounded-md bg-indigo-500 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-400"
        @click="start"
      >
        Test starten · {{ store.riasecTotal }} Fragen
      </RouterLink>
      <p class="text-base font-medium text-slate-200">
        In 6 bis 12 Minuten steht dein Ergebnis.
        Danach kannst du freiwillig vertiefen.
      </p>
    </div>

    <h2 class="mt-16 text-2xl font-semibold text-slate-100">
      Was dich erwartet:
    </h2>
    <ul class="mt-4 space-y-3 text-slate-300 marker:text-indigo-400 list-disc pl-5">
      <li>
        <strong class="font-semibold text-slate-100">Eine sortierte Liste aus 923 Berufen</strong>,
        gewichtet aus deinen Antworten.
      </li>
      <li>
        <strong class="font-semibold text-slate-100">Eine Profil-Übersicht je Schicht</strong>,
        die du bearbeitet hast: Interessen-Hexagon (RIASEC),
        Persönlichkeits-Diagramm (Big Five), Rahmenbedingungen und deine
        Selbsteinschätzung in Fähigkeiten, Talenten und Wissen.
      </li>
      <li>
        <strong class="font-semibold text-slate-100">Suche</strong> über
        alle Berufe und
        <strong class="font-semibold text-slate-100">Top 20 zum Kopieren</strong>
        für Notizen oder zum Teilen.
      </li>
      <li>
        <strong class="font-semibold text-slate-100">Die Freiheit, jederzeit aufzuhören</strong>:
        Dein Stand bleibt in deinem Browser gespeichert, du kannst später
        weitermachen, wo du aufgehört hast.
      </li>
    </ul>

    <h2 class="mt-16 text-2xl font-semibold text-slate-100">
      Was wir messen:
    </h2>
    <p class="mt-3 text-slate-400">
      Schicht 1 reicht für ein vollständiges Ergebnis. Die drei danach sind
      freiwillig und schärfen die Liste weiter. Du entscheidest nach jeder
      Schicht neu.
    </p>

    <div class="mt-6 rounded-lg border border-indigo-500/50 bg-indigo-950/20 p-4">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <div class="text-sm font-medium text-slate-100">Schicht 1: RIASEC</div>
        <span class="rounded bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">
          Basis
        </span>
      </div>
      <p class="mt-1 text-xs text-slate-400">
        Berufsinteressen nach Holland, erhoben mit dem O*NET Interest Profiler.
        Reicht allein schon für ein vollständiges Ergebnis.
      </p>
      <p class="mt-2 text-xs text-slate-500">{{ store.riasecTotal }} Fragen · 6-12 Min</p>
    </div>

    <div class="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 class="text-sm font-medium text-slate-300">Optional vertiefen</h3>
      <span class="text-xs text-slate-500">
        {{ optionalQuestions }} weitere Fragen, jederzeit abbrechbar
      </span>
    </div>
    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <div class="text-sm font-medium text-slate-300">Schicht 2: Big Five</div>
        <p class="mt-1 text-xs text-slate-400">
          Persönlichkeit, erhoben mit den IPIP Big Five Factor Markers.
        </p>
        <p class="mt-2 text-xs text-slate-500">{{ store.bigfiveTotal }} Fragen · 5-10 Min</p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <div class="text-sm font-medium text-slate-300">Schicht 3: Rahmenbedingungen</div>
        <p class="mt-1 text-xs text-slate-400">
          Ausbildung, Umfeld, Arbeitsweise
        </p>
        <p class="mt-2 text-xs text-slate-500">{{ store.valuesTotal }} Fragen · 1-2 Min</p>
      </div>
      <div class="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <div class="text-sm font-medium text-slate-300">Schicht 4: Fähigkeiten</div>
        <p class="mt-1 text-xs text-slate-400">
          Selbsteinschätzung in Fähigkeiten, Talenten und Wissen (O*NET).
        </p>
        <p class="mt-2 text-xs text-slate-500">{{ store.skillsTotal }} Fragen · 12-20 Min</p>
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
