import type { Answer } from '@entities/assessment/model/types'
import type {
  Question,
  SkillsSubCategory,
} from '@entities/question/model/types'

export const SKILLS_SUB_CATEGORIES: readonly SkillsSubCategory[] = [
  'skills',
  'abilities',
  'knowledge',
] as const

/**
 * Expected item count per sub-category from O*NET 29.2. Used to size the
 * UI progress indicator and sanity-check the items JSON on load.
 */
export const SKILLS_SUB_CATEGORY_COUNTS: Readonly<Record<SkillsSubCategory, number>> = {
  skills: 35,
  abilities: 52,
  knowledge: 33,
}

/**
 * User's skill ratings grouped by sub-category, keyed by O*NET Element ID.
 * Keys match the occupation skills/abilities/knowledge maps so the matcher
 * can join user answers to occupation targets with a direct lookup.
 */
export interface SkillsProfile {
  skills: Record<string, number>
  abilities: Record<string, number>
  knowledge: Record<string, number>
}

export function emptySkillsProfile(): SkillsProfile {
  return { skills: {}, abilities: {}, knowledge: {} }
}

/**
 * Build a SkillsProfile from raw Likert answers. Items are grouped by
 * sub-category and keyed by O*NET Element ID. Items without a valid
 * subCategory or onetElementId are skipped (defensive — shouldn't happen
 * if the items JSON is well-formed).
 */
export function computeSkillsProfile(
  answers: Answer[],
  questions: Question[],
): SkillsProfile {
  const qById = new Map(questions.map((q) => [q.id, q]))
  const profile = emptySkillsProfile()
  for (const answer of answers) {
    const q = qById.get(answer.questionId)
    if (!q || q.layer !== 'skills') continue
    const sub = q.subCategory
    const elId = q.onetElementId
    if (!sub || !elId) continue
    if (!SKILLS_SUB_CATEGORIES.includes(sub)) continue
    profile[sub][elId] = answer.value
  }
  return profile
}

/**
 * Mean user rating per sub-category on a 1-5 Likert scale. Sub-categories
 * with zero answers return 0, which normalizeAverageToPercent maps to 0%.
 * Used for the three aggregate bars on ResultsPage.
 */
export function subCategoryAverages(
  profile: SkillsProfile,
): Record<SkillsSubCategory, number> {
  const avg = (obj: Record<string, number>): number => {
    const values = Object.values(obj)
    if (values.length === 0) return 0
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }
  return {
    skills: avg(profile.skills),
    abilities: avg(profile.abilities),
    knowledge: avg(profile.knowledge),
  }
}

/**
 * Convert a 1-5 Likert average to a 0-100 percent. `0` (sub-cat empty)
 * stays 0%. `1` → 0%, `3` → 50%, `5` → 100%.
 */
export function averageToPercent(avg: number): number {
  if (avg <= 0) return 0
  return Math.round(((avg - 1) / 4) * 100)
}

export type SkillsBand = 'none' | 'basics' | 'average' | 'advanced' | 'expert'

/**
 * Map a 0-100 percent onto one of five qualitative bands used as the
 * human-readable label next to the sub-category bar. Fifths on the percent
 * axis (0-20 / 20-40 / 40-60 / 60-80 / 80-100) align with the 5-point
 * Likert anchors so a user who answered "3" consistently lands in the
 * middle band.
 */
export function percentToBand(percent: number): SkillsBand {
  if (percent < 20) return 'none'
  if (percent < 40) return 'basics'
  if (percent < 60) return 'average'
  if (percent < 80) return 'advanced'
  return 'expert'
}

/**
 * Total number of answers across all three sub-categories. Used for
 * completion / progress computations in the store.
 */
export function totalAnswers(profile: SkillsProfile): number {
  return (
    Object.keys(profile.skills).length +
    Object.keys(profile.abilities).length +
    Object.keys(profile.knowledge).length
  )
}
