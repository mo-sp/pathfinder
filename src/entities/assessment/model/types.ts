import type {
  BigFiveProfile,
  MatchResult,
  RIASECProfile,
  ValuesProfile,
} from '@entities/occupation/model/types'

export interface Answer {
  questionId: string
  /** Likert response 1-5 (or 1-7 for future layers). */
  value: number
  answeredAt: number
}

/**
 * Which layer of the progressive funnel the user is currently answering.
 * Persisted so a reload lands the user back on the correct questionnaire
 * screen.
 */
export type AssessmentLayer = 'riasec' | 'bigfive' | 'values' | 'skills'

export interface AssessmentSession {
  id: string
  startedAt: number
  /**
   * Set when the user has finished the RIASEC layer. Big Five is optional
   * refinement — completing it does not push the timestamp again.
   */
  completedAt?: number
  /** RIASEC layer answers. Field name kept as `answers` for backwards compat with sessions written before the Big Five layer existed. */
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
  /**
   * Big Five layer state. All fields optional so that a session that only
   * completed RIASEC hydrates cleanly, and so legacy sessions written
   * before Phase 2 are still readable without migration.
   */
  bigfiveAnswers?: Answer[]
  bigfiveOrder?: string[]
  bigfiveProfile?: BigFiveProfile
  /** Values layer state (Layer 3). Optional for backward compat. */
  valuesAnswers?: Answer[]
  valuesOrder?: string[]
  valuesProfile?: ValuesProfile
  /**
   * Skills layer state (Layer 4). Optional for backward compat.
   * `skillsOrder` is a flat list of 120 question IDs ordered by
   * sub-category (skills first, then abilities, then knowledge) and
   * shuffled within each sub-category.
   * `skillsInterstitialPending` is true iff the user just answered the
   * last question of a sub-category and should see the Zwischenscreen
   * before the next sub-category begins.
   */
  skillsAnswers?: Answer[]
  skillsOrder?: string[]
  skillsInterstitialPending?: boolean
  /**
   * Layer the user was last on. Missing on legacy sessions → defaults to
   * `'riasec'` during hydrate so reload behaviour is unchanged for anyone
   * who hasn't started Big Five yet.
   */
  currentLayer?: AssessmentLayer
}
