import type { Answer } from '@entities/assessment/model/types'
import type { Question, RiasecDimension } from '@entities/question/model/types'
import type { RIASECProfile } from '@entities/occupation/model/types'

const DIMENSIONS: RiasecDimension[] = ['R', 'I', 'A', 'S', 'E', 'C']

/**
 * Compute a RIASEC profile from raw Likert answers.
 *
 * Each item belongs to exactly one of the six RIASEC dimensions. We sum the
 * Likert responses (1-5) for the items in each dimension. The full O*NET
 * Interest Profiler uses 10 items per dimension, but for the PoC the item
 * counts may be uneven – the Pearson correlation in the matching step is
 * scale-invariant so this still produces meaningful rankings.
 */
export function computeRiasecProfile(
  answers: Answer[],
  questions: Question[],
): RIASECProfile {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const profile: RIASECProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const answer of answers) {
    const q = byId.get(answer.questionId)
    if (!q || q.layer !== 'riasec') continue
    if (!isRiasecDimension(q.dimension)) continue
    profile[q.dimension] += answer.value
  }

  return profile
}

/**
 * Normalize each dimension to 0-100 based on the actual item counts present.
 * Useful for display – not used in matching.
 */
export function normalizeRiasecToPercent(
  profile: RIASECProfile,
  questions: Question[],
): RIASECProfile {
  const counts: RIASECProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  for (const q of questions) {
    if (q.layer !== 'riasec') continue
    if (!isRiasecDimension(q.dimension)) continue
    counts[q.dimension] += 1
  }

  const out: RIASECProfile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  for (const dim of DIMENSIONS) {
    const max = counts[dim] * 5 // likert5
    out[dim] = max > 0 ? Math.round((profile[dim] / max) * 100) : 0
  }
  return out
}

function isRiasecDimension(value: string): value is RiasecDimension {
  return (DIMENSIONS as string[]).includes(value)
}

export const RIASEC_DIMENSIONS = DIMENSIONS
