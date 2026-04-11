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
  /**
   * Question IDs in the order the user was shown them for this session.
   * Persisted so a reload preserves the exact sequence, and so future
   * sessions don't accidentally restore a stale order. Optional to keep
   * backwards compatibility with pre-shuffle sessions that may still
   * live in a returning user's IndexedDB.
   */
  questionOrder?: string[]
}
