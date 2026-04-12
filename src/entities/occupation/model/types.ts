import type {
  BigFiveDimension,
  RiasecDimension,
  ValuesDimension,
} from '@entities/question/model/types'

export type RIASECProfile = Record<RiasecDimension, number>

export type BigFiveProfile = Record<BigFiveDimension, number>

export type ValuesProfile = Record<ValuesDimension, number>

/**
 * Per-skill data point on an occupation. Short keys to keep the JSON
 * payload compact (~120 items × 923 occupations = 110k entries):
 *   l = Level (0-7, O*NET LV scale, how advanced the skill is required)
 *   i = Importance (1-5, O*NET IM scale, how central the skill is)
 */
export interface OccupationSkillEntry {
  l: number
  i: number
}

/** O*NET Element ID → skill entry. Used for skills, abilities, knowledge. */
export type OccupationSkillMap = Record<string, OccupationSkillEntry>

export interface WorkContext {
  indoor: number
  outdoor: number
  contactWithOthers: number
  teamwork: number
  standing: number
  walking: number
  autonomy: number
  publicContact: number
  routine: number
}

export interface Occupation {
  /** O*NET-SOC code, e.g. "15-1252.00". */
  onetCode: string
  /** ESCO URI for EU mapping (added in Phase 2). */
  escoUri?: string
  title: {
    de: string | null
    en: string
  }
  description?: {
    de: string | null
    en: string
  }
  /** RIASEC profile from O*NET on the OI scale (1-7 per dimension). */
  riasecProfile: RIASECProfile
  /** O*NET Job Zone 1-5 (education/training level). */
  jobZone?: number
  /** O*NET Work Context values on the CX scale (1-5). */
  workContext?: WorkContext
  /** O*NET Skills map (35 items), keyed by Element ID. */
  skills?: OccupationSkillMap
  /** O*NET Abilities map (52 items), keyed by Element ID. */
  abilities?: OccupationSkillMap
  /** O*NET Knowledge map (33 items), keyed by Element ID. */
  knowledge?: OccupationSkillMap
  brightOutlook?: boolean
}

export interface MatchResult {
  occupation: Occupation
  /** Combined score: min(riasecCorrelation × bigFiveModifier, 1) − valuesPenalty + skillsBonus. */
  fitScore: number
  /** Raw Pearson correlation between user and occupation RIASEC profiles, -1 to 1. */
  riasecCorrelation: number
  /** Big Five personality modifier, typically 0.7–1.3. null when occupation has no Big Five profile. */
  bigFiveModifier: number | null
  /** Values penalty subtracted from fitScore, 0–0.35. null when values not provided. */
  valuesPenalty: number | null
  /** Weighted similarity between user skills profile and occupation, 0-1. null when occupation has no skills data or user has no skills profile. */
  skillsMatch: number | null
  /** Skills bonus added to fitScore, range [-0.25, +0.25]. null when skillsMatch is null. */
  skillsBonus: number | null
  rank: number
}
