import { describe, expect, it } from 'vitest'
import { buildFeedbackPayload, type FeedbackSource } from './submitFeedback'
import type { MatchResult, Occupation } from '@entities/occupation/model/types'

function occ(onetCode: string, de: string | null, en: string): Occupation {
  return {
    onetCode,
    title: { de, en },
    riasecProfile: { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 },
  }
}

function result(onetCode: string, de: string | null, fitScore: number, rank: number): MatchResult {
  return {
    occupation: occ(onetCode, de, `EN ${onetCode}`),
    fitScore,
    riasecCorrelation: fitScore,
    bigFiveModifier: null,
    valuesContribution: null,
    skillsMatch: null,
    skillsBonus: null,
    rank,
  }
}

function source(overrides: Partial<FeedbackSource> = {}): FeedbackSource {
  return {
    riasecAnswers: [{ questionId: 'ip-r-01', value: 4, answeredAt: 123 }],
    bigfiveAnswers: [],
    valuesAnswers: [],
    skillsAnswers: [],
    bigfiveIsComplete: false,
    valuesIsComplete: false,
    skillsIsComplete: false,
    riasecPercent: { R: 80, I: 20, A: 10, S: 5, E: 5, C: 0 },
    bigfivePercent: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    valuesProfile: {} as FeedbackSource['valuesProfile'],
    skillsProfile: {} as FeedbackSource['skillsProfile'],
    results: [result('15-1252.00', 'Softwareentwickler', 0.812345, 1)],
    ...overrides,
  }
}

describe('buildFeedbackPayload', () => {
  it('drops answeredAt, keeping only questionId + value', () => {
    const p = buildFeedbackPayload(source(), 4, '')
    expect(p.answers.riasec).toEqual([{ questionId: 'ip-r-01', value: 4 }])
    expect(p.answers.riasec[0]).not.toHaveProperty('answeredAt')
  })

  it('sets v=1, a non-empty sid, and the self-rating', () => {
    const p = buildFeedbackPayload(source(), 3, '')
    expect(p.v).toBe(1)
    expect(typeof p.sid).toBe('string')
    expect(p.sid.length).toBeGreaterThan(0)
    expect(p.selfRating).toBe(3)
  })

  it('omits an empty/whitespace comment and trims a real one', () => {
    expect(buildFeedbackPayload(source(), 4, '   ')).not.toHaveProperty('comment')
    expect(buildFeedbackPayload(source(), 4, '  passt gut  ').comment).toBe('passt gut')
  })

  it('nulls incomplete-layer profiles and reports completed layers', () => {
    const p = buildFeedbackPayload(source(), 4, '')
    expect(p.result.completedLayers).toEqual({
      riasec: true,
      bigfive: false,
      values: false,
      skills: false,
    })
    expect(p.result.profiles.riasec).toEqual({ R: 80, I: 20, A: 10, S: 5, E: 5, C: 0 })
    expect(p.result.profiles.bigfive).toBeNull()
    expect(p.result.profiles.values).toBeNull()
    expect(p.result.profiles.skills).toBeNull()
  })

  it('maps top results (code/title/fitScore/rank) and caps at 20', () => {
    const many = Array.from({ length: 25 }, (_, i) => result(`code-${i}`, `Beruf ${i}`, 0.5 - i * 0.01, i + 1))
    const p = buildFeedbackPayload(source({ results: many }), 5, '')
    expect(p.result.top).toHaveLength(20)
    expect(p.result.top[0]).toEqual({ code: 'code-0', title: 'Beruf 0', fitScore: 0.5, rank: 1 })
  })

  it('falls back to kldbName then EN title when title.de is null', () => {
    const r = result('11-0000.00', null, 0.4, 1)
    r.occupation.kldbName = 'KldB-Klasse'
    const p = buildFeedbackPayload(source({ results: [r] }), 4, '')
    expect(p.result.top[0].title).toBe('KldB-Klasse')
  })
})
