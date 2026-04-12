import type { Answer } from '@entities/assessment/model/types'
import type { Question, ValuesDimension } from '@entities/question/model/types'
import type { ValuesProfile } from '@entities/occupation/model/types'

export const VALUES_DIMENSIONS: readonly ValuesDimension[] = [
  'education',
  'environment',
  'socialInteraction',
  'teamwork',
  'physicalDemands',
  'autonomy',
  'publicContact',
  'routine',
] as const

/** Default value (neutral / no preference) for missing dimensions. */
const NEUTRAL = 3

/**
 * Compute a values profile from the user's answers. Unlike RIASEC/Big Five
 * where multiple items per dimension are summed, each values dimension has
 * exactly one question — so the profile is the raw 1-5 answer per dimension.
 * Missing dimensions default to 3 (neutral).
 */
export function computeValuesProfile(
  answers: Answer[],
  questions: Question[],
): ValuesProfile {
  const answerById = new Map(answers.map((a) => [a.questionId, a.value]))
  const profile = Object.fromEntries(
    VALUES_DIMENSIONS.map((d) => [d, NEUTRAL]),
  ) as ValuesProfile

  for (const q of questions) {
    if (q.layer !== 'values') continue
    const value = answerById.get(q.id)
    if (value != null && VALUES_DIMENSIONS.includes(q.dimension as ValuesDimension)) {
      profile[q.dimension as ValuesDimension] = value
    }
  }

  return profile
}
