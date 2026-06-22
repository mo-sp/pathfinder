// Builds and submits the voluntary, anonymous beta-feedback payload.
//
// The payload is assembled here (pure `buildFeedbackPayload`, unit-tested)
// and POSTed by `postFeedback`. Data minimisation on purpose:
//   - raw answers are reduced to { questionId, value } — the `answeredAt`
//     timestamps are dropped, they add nothing to a scoring review and would
//     be needless behavioural data;
//   - the submission id is freshly random, linked to nothing;
//   - nothing identifying is collected here, and the endpoint never logs an IP.

import type { Answer } from '@entities/assessment/model/types'
import type {
  BigFiveProfile,
  MatchResult,
  RIASECProfile,
  ValuesProfile,
} from '@entities/occupation/model/types'
import type { SkillsProfile } from '@features/scoring/lib/skills'
import { uuid } from '@shared/lib/uuid'

/** Same-origin path; Traefik routes it to the feedback container. */
const FEEDBACK_URL = '/api/feedback'

/** Top-N results included in a submission (matches the share/export cap). */
const TOP_N = 20

/**
 * The slice of the questionnaire store the payload is built from. Declared
 * structurally so the store instance satisfies it and the unit test can pass
 * a small literal.
 */
export interface FeedbackSource {
  riasecAnswers: Answer[]
  bigfiveAnswers: Answer[]
  valuesAnswers: Answer[]
  skillsAnswers: Answer[]
  bigfiveIsComplete: boolean
  valuesIsComplete: boolean
  skillsIsComplete: boolean
  riasecPercent: RIASECProfile
  bigfivePercent: BigFiveProfile
  valuesProfile: ValuesProfile
  skillsProfile: SkillsProfile
  results: MatchResult[]
}

interface AnswerLite {
  questionId: string
  value: number
}

export interface FeedbackPayload {
  v: 1
  sid: string
  selfRating: number
  comment?: string
  answers: {
    riasec: AnswerLite[]
    bigfive: AnswerLite[]
    values: AnswerLite[]
    skills: AnswerLite[]
  }
  result: {
    completedLayers: {
      riasec: boolean
      bigfive: boolean
      values: boolean
      skills: boolean
    }
    profiles: {
      riasec: RIASECProfile
      bigfive: BigFiveProfile | null
      values: ValuesProfile | null
      skills: SkillsProfile | null
    }
    top: Array<{ code: string; title: string; fitScore: number; rank: number }>
  }
}

function lite(answers: Answer[]): AnswerLite[] {
  return answers.map((a) => ({ questionId: a.questionId, value: a.value }))
}

export function buildFeedbackPayload(
  source: FeedbackSource,
  selfRating: number,
  comment: string,
): FeedbackPayload {
  const payload: FeedbackPayload = {
    v: 1,
    sid: uuid(),
    selfRating,
    answers: {
      riasec: lite(source.riasecAnswers),
      bigfive: lite(source.bigfiveAnswers),
      values: lite(source.valuesAnswers),
      skills: lite(source.skillsAnswers),
    },
    result: {
      completedLayers: {
        riasec: true,
        bigfive: source.bigfiveIsComplete,
        values: source.valuesIsComplete,
        skills: source.skillsIsComplete,
      },
      profiles: {
        riasec: { ...source.riasecPercent },
        bigfive: source.bigfiveIsComplete ? { ...source.bigfivePercent } : null,
        values: source.valuesIsComplete ? { ...source.valuesProfile } : null,
        skills: source.skillsIsComplete ? { ...source.skillsProfile } : null,
      },
      top: source.results.slice(0, TOP_N).map((r) => ({
        code: r.occupation.onetCode,
        title: r.occupation.title.de || r.occupation.kldbName || r.occupation.title.en,
        fitScore: Number(r.fitScore.toFixed(4)),
        rank: r.rank,
      })),
    },
  }
  const trimmed = comment.trim()
  if (trimmed !== '') payload.comment = trimmed
  return payload
}

/** POST the payload. Returns true on a 2xx (the endpoint replies 204). */
export async function postFeedback(payload: FeedbackPayload): Promise<boolean> {
  try {
    const res = await fetch(FEEDBACK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}
