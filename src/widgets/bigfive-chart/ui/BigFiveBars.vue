<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BigFiveProfile } from '@entities/occupation/model/types'
import type { BigFiveDimension } from '@entities/question/model/types'
import { BIG_FIVE_DIMENSIONS } from '@features/scoring/lib/bigfive'

const props = defineProps<{
  /** Percent-normalized Big Five profile – each value in [0, 100]. */
  profile: BigFiveProfile
}>()

const { t } = useI18n()

// Short axis labels — single letter from the OCEAN acronym. Using the
// letter as the on-bar symbol keeps the row compact while the full name
// sits to its right in a regular-weight span.
const LETTERS: Record<BigFiveDimension, string> = {
  openness: 'O',
  conscientiousness: 'C',
  extraversion: 'E',
  agreeableness: 'A',
  neuroticism: 'N',
}

function clampPercent(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

const rows = computed(() =>
  BIG_FIVE_DIMENSIONS.map((dim) => ({
    dim,
    letter: LETTERS[dim],
    label: t(`bigfive.${dim}`),
    percent: Math.round(clampPercent(props.profile[dim])),
  })),
)
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="row in rows"
      :key="row.dim"
      class="grid grid-cols-[auto_1fr_auto] items-center gap-3"
    >
      <div class="flex items-baseline gap-2 text-sm">
        <span class="font-semibold text-slate-100">{{ row.letter }}</span>
        <span class="text-slate-300">{{ row.label }}</span>
      </div>
      <div
        class="h-2 w-full overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        :aria-valuenow="row.percent"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-label="`${row.label}: ${row.percent} Prozent`"
      >
        <div
          class="h-full bg-indigo-500 transition-all duration-300"
          :style="{ width: `${row.percent}%` }"
        />
      </div>
      <span class="font-mono text-xs text-slate-400">{{ row.percent }}%</span>
    </div>
  </div>
</template>
