<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuestionnaireStore } from '@features/questionnaire/model/store'
import { RIASEC_DIMENSIONS } from '@features/scoring/lib/riasec'

const store = useQuestionnaireStore()
const { t } = useI18n()

const bars = computed(() =>
  RIASEC_DIMENSIONS.map((dim) => ({
    dim,
    label: t(`riasec.${dim}`),
    description: t(`riasecDescription.${dim}`),
    percent: store.riasecPercent[dim],
  })),
)
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-12">
    <div v-if="!store.isComplete" class="rounded-lg border border-amber-200 bg-amber-50 p-6">
      <p class="text-sm text-amber-900">
        Du hast den Test noch nicht abgeschlossen.
      </p>
      <RouterLink
        to="/test"
        class="mt-4 inline-block text-sm font-medium text-amber-900 underline hover:text-amber-950"
      >
        → Zum Test
      </RouterLink>
    </div>

    <template v-else>
      <h1 class="text-3xl font-bold text-slate-900">Dein RIASEC-Profil</h1>
      <p class="mt-2 text-sm text-slate-500">
        Basierend auf {{ store.total }} Items aus dem O*NET Interest Profiler
        Short Form.
      </p>

      <div class="mt-8 space-y-4">
        <div
          v-for="bar in bars"
          :key="bar.dim"
          class="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div class="flex items-baseline justify-between">
            <div>
              <div class="font-semibold text-slate-900">
                {{ bar.dim }} – {{ bar.label }}
              </div>
              <div class="text-xs text-slate-500">{{ bar.description }}</div>
            </div>
            <div class="text-sm font-mono text-slate-700">{{ bar.percent }} %</div>
          </div>
          <div class="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full bg-indigo-600 transition-all duration-500"
              :style="{ width: `${bar.percent}%` }"
            />
          </div>
        </div>
      </div>

      <h2 class="mt-12 text-2xl font-semibold text-slate-900">
        Top-Berufsempfehlungen
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        Berechnet via Pearson-Korrelation zwischen deinem Profil und den
        RIASEC-Profilen aus der O*NET-Datenbank.
      </p>

      <ol class="mt-6 space-y-3">
        <li
          v-for="result in store.results.slice(0, 10)"
          :key="result.occupation.onetCode"
          class="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3"
        >
          <div>
            <div class="font-medium text-slate-900">
              {{ result.rank }}. {{ result.occupation.title.de || result.occupation.title.en }}
            </div>
            <div class="text-xs text-slate-500">
              O*NET {{ result.occupation.onetCode }}
              <span v-if="!result.occupation.title.de"> · (Übersetzung folgt)</span>
            </div>
          </div>
          <div class="font-mono text-sm text-indigo-600">
            {{ (result.fitScore * 100).toFixed(0) }}
          </div>
        </li>
      </ol>

      <div class="mt-10">
        <button
          type="button"
          class="text-sm text-slate-500 underline hover:text-slate-900"
          @click="store.reset"
        >
          Test neu starten
        </button>
      </div>
    </template>
  </section>
</template>
