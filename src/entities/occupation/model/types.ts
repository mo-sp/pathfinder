import type {
  BigFiveDimension,
  RiasecDimension,
} from '@entities/question/model/types'

export type RIASECProfile = Record<RiasecDimension, number>

export type BigFiveProfile = Record<BigFiveDimension, number>

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
  brightOutlook?: boolean
}

export interface MatchResult {
  occupation: Occupation
  /** Combined score: riasecCorrelation × bigFiveModifier (or just riasecCorrelation when no Big Five data). */
  fitScore: number
  /** Raw Pearson correlation between user and occupation RIASEC profiles, -1 to 1. */
  riasecCorrelation: number
  /** Big Five personality modifier, typically 0.7–1.3. null when occupation has no Big Five profile. */
  bigFiveModifier: number | null
  rank: number
}
