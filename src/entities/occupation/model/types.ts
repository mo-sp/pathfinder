import type {
  BigFiveDimension,
  RiasecDimension,
  ValuesDimension,
} from '@entities/question/model/types'

export type RIASECProfile = Record<RiasecDimension, number>

export type BigFiveProfile = Record<BigFiveDimension, number>

export type ValuesProfile = Record<ValuesDimension, number>

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
  brightOutlook?: boolean
}

export interface MatchResult {
  occupation: Occupation
  /** Combined score: riasecCorrelation × bigFiveModifier − valuesPenalty. */
  fitScore: number
  /** Raw Pearson correlation between user and occupation RIASEC profiles, -1 to 1. */
  riasecCorrelation: number
  /** Big Five personality modifier, typically 0.7–1.3. null when occupation has no Big Five profile. */
  bigFiveModifier: number | null
  /** Values penalty subtracted from fitScore, 0–0.35. null when values not provided. */
  valuesPenalty: number | null
  rank: number
}
