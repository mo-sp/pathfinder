import type { Answer } from '@entities/assessment/model/types'
import type {
  BigFiveDimension,
  Question,
} from '@entities/question/model/types'
import type { BigFiveProfile } from '@entities/occupation/model/types'

const DIMENSIONS: BigFiveDimension[] = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
]

/**
 * Flip a reverse-scored Likert value to its effective value. On a 1-5
 * scale a raw 5 becomes 1 and vice versa. Required because roughly half
 * of the IPIP Big Five items are negatively keyed for their dimension
 * (e.g. "Don't talk a lot." → high agreement lowers Extraversion), and
 * summing raw values without flipping them would zero out the variance
 * within each dimension.
 */
function applyReverse(value: number, q: Question): number {
  if (!q.reverse) return value
  if (q.scale === 'likert5') return 6 - value
  if (q.scale === 'likert7') return 8 - value
  return value
}

/**
 * Compute a Big Five profile from raw Likert answers.
 *
 * Each IPIP item belongs to exactly one of the five Big Five dimensions.
 * We sum the (reverse-adjusted) Likert responses for the items in each
 * dimension. With 10 items per dimension and likert5, each dimension
 * sum lands in [10, 50], matching the same 10-50 range as RIASEC so the
 * normalize helper can use the same arithmetic.
 */
export function computeBigFiveProfile(
  answers: Answer[],
  questions: Question[],
): BigFiveProfile {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const profile: BigFiveProfile = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  }

  for (const answer of answers) {
    const q = byId.get(answer.questionId)
    if (!q || q.layer !== 'bigfive') continue
    if (!isBigFiveDimension(q.dimension)) continue
    profile[q.dimension] += applyReverse(answer.value, q)
  }

  return profile
}

/**
 * Normalize each dimension to 0-100 based on the actual item counts
 * present. Mirrors the RIASEC helper so the two charts share the same
 * display scale. Not used in matching.
 */
export function normalizeBigFiveToPercent(
  profile: BigFiveProfile,
  questions: Question[],
): BigFiveProfile {
  const counts: BigFiveProfile = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  }
  for (const q of questions) {
    if (q.layer !== 'bigfive') continue
    if (!isBigFiveDimension(q.dimension)) continue
    counts[q.dimension] += 1
  }

  const out: BigFiveProfile = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  }
  for (const dim of DIMENSIONS) {
    const max = counts[dim] * 5 // likert5
    out[dim] = max > 0 ? Math.round((profile[dim] / max) * 100) : 0
  }
  return out
}

function isBigFiveDimension(value: string): value is BigFiveDimension {
  return (DIMENSIONS as string[]).includes(value)
}

export const BIG_FIVE_DIMENSIONS = DIMENSIONS
