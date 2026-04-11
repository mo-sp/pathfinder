import type { RIASECProfile, MatchResult } from '@entities/occupation/model/types'

export interface Answer {
  questionId: string
  /** Likert response 1-5 (or 1-7 for future layers). */
  value: number
  answeredAt: number
}

export interface AssessmentSession {
  id: string
  startedAt: number
  completedAt?: number
  answers: Answer[]
  riasecProfile?: RIASECProfile
  results?: MatchResult[]
}
