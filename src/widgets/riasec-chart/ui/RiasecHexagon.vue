<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RIASECProfile } from '@entities/occupation/model/types'
import type { RiasecDimension } from '@entities/question/model/types'
import { RIASEC_DIMENSIONS } from '@features/scoring/lib/riasec'

const props = defineProps<{
  /** Percent-normalized RIASEC profile – each value in [0, 100]. */
  profile: RIASECProfile
}>()

const { t } = useI18n()

// SVG layout. The viewBox gives room around the hexagon for axis labels
// without clipping. Coordinates use the standard SVG convention (+y down).
const VIEW = 360
const CENTER = VIEW / 2
const R_MAX = 120
const LABEL_OFFSET = 22
const RING_RATIOS = [0.25, 0.5, 0.75, 1] as const

// Standard Holland hexagon – R at top, then I A S E C clockwise at 60°
// intervals. Adjacent RIASEC types are conceptually related, which is
// exactly what the hexagon is supposed to visualise.
const ANGLES: Record<RiasecDimension, number> = {
  R: -Math.PI / 2,
  I: -Math.PI / 6,
  A: Math.PI / 6,
  S: Math.PI / 2,
  E: (5 * Math.PI) / 6,
  C: (7 * Math.PI) / 6,
}

function project(dim: RiasecDimension, radius: number): { x: number; y: number } {
  const theta = ANGLES[dim]
  return {
    x: CENTER + radius * Math.cos(theta),
    y: CENTER + radius * Math.sin(theta),
  }
}

function polygonPoints(radius: number): string {
  return RIASEC_DIMENSIONS.map((dim) => {
    const { x, y } = project(dim, radius)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}

const gridRings = computed(() =>
  RING_RATIOS.map((ratio) => polygonPoints(R_MAX * ratio)),
)

const axisLines = computed(() =>
  RIASEC_DIMENSIONS.map((dim) => {
    const { x, y } = project(dim, R_MAX)
    return { dim, x, y }
  }),
)

function clampPercent(value: number | undefined): number {
  if (value == null || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

const profilePolygon = computed(() =>
  RIASEC_DIMENSIONS.map((dim) => {
    const percent = clampPercent(props.profile[dim])
    const { x, y } = project(dim, (percent / 100) * R_MAX)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' '),
)

const profileVertices = computed(() =>
  RIASEC_DIMENSIONS.map((dim) => {
    const percent = clampPercent(props.profile[dim])
    const { x, y } = project(dim, (percent / 100) * R_MAX)
    return { dim, x, y }
  }),
)

const labels = computed(() =>
  RIASEC_DIMENSIONS.map((dim) => {
    const theta = ANGLES[dim]
    const x = CENTER + (R_MAX + LABEL_OFFSET) * Math.cos(theta)
    const y = CENTER + (R_MAX + LABEL_OFFSET) * Math.sin(theta)
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    // Anchor horizontally based on which side of center the label sits on.
    const anchor: 'start' | 'middle' | 'end' =
      c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle'
    // Nudge vertically so the label text doesn't overlap the axis endpoint.
    const dy = s > 0.3 ? '1em' : s < -0.3 ? '-0.2em' : '0.35em'
    return {
      dim,
      x,
      y,
      anchor,
      dy,
      letter: dim,
      label: t(`riasec.${dim}`),
      percent: Math.round(clampPercent(props.profile[dim])),
    }
  }),
)
</script>

<template>
  <figure class="mx-auto w-full max-w-md">
    <svg
      :viewBox="`0 0 ${VIEW} ${VIEW}`"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="RIASEC-Hexagon mit deinen sechs Dimensionswerten"
      class="h-auto w-full"
    >
      <!-- grid rings at 25 / 50 / 75 / 100 % -->
      <polygon
        v-for="(points, i) in gridRings"
        :key="`ring-${i}`"
        :points="points"
        fill="none"
        stroke="#e2e8f0"
        stroke-width="1"
      />

      <!-- radial axes -->
      <line
        v-for="axis in axisLines"
        :key="`axis-${axis.dim}`"
        :x1="CENTER"
        :y1="CENTER"
        :x2="axis.x"
        :y2="axis.y"
        stroke="#e2e8f0"
        stroke-width="1"
      />

      <!-- user profile polygon -->
      <polygon
        :points="profilePolygon"
        fill="#4f46e5"
        fill-opacity="0.2"
        stroke="#4f46e5"
        stroke-width="2"
        stroke-linejoin="round"
      />

      <!-- vertex dots -->
      <circle
        v-for="v in profileVertices"
        :key="`vertex-${v.dim}`"
        :cx="v.x"
        :cy="v.y"
        r="3.5"
        fill="#4f46e5"
      />

      <!-- axis labels: "R 73%" -->
      <text
        v-for="lab in labels"
        :key="`label-${lab.dim}`"
        :x="lab.x"
        :y="lab.y"
        :text-anchor="lab.anchor"
        :dy="lab.dy"
        fill="#0f172a"
        font-size="14"
        font-weight="600"
      >{{ lab.letter }} <tspan
        fill="#64748b"
        font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-weight="400"
      >{{ lab.percent }}%</tspan></text>
    </svg>
    <figcaption class="sr-only">
      RIASEC-Hexagon: Dein Interessensprofil auf sechs Dimensionen
      (Realistisch, Forschend, Künstlerisch, Sozial, Unternehmerisch,
      Konventionell).
    </figcaption>
  </figure>
</template>
