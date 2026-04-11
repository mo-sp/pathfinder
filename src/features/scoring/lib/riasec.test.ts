import { describe, it, expect } from 'vitest'
import {
  computeRiasecProfile,
  hasProfileDirection,
  normalizeRiasecToPercent,
  RIASEC_DIMENSIONS,
} from './riasec'
import type { Question } from '@entities/question/model/types'
import type { Answer } from '@entities/assessment/model/types'

function riasecQuestion(id: string, dimension: string): Question {
  return {
    id,
    layer: 'riasec',
    dimension,
    text: { en: `question ${id}`, de: `Frage ${id}` },
    scale: 'likert5',
  }
}

function answer(questionId: string, value: number): Answer {
  return { questionId, value, answeredAt: 0 }
}

describe('computeRiasecProfile', () => {
  it('sums Likert values per RIASEC dimension', () => {
    const questions: Question[] = [
      riasecQuestion('r1', 'R'),
      riasecQuestion('r2', 'R'),
      riasecQuestion('i1', 'I'),
      riasecQuestion('s1', 'S'),
    ]
    const answers: Answer[] = [
      answer('r1', 3),
      answer('r2', 4),
      answer('i1', 5),
      answer('s1', 2),
    ]
    expect(computeRiasecProfile(answers, questions)).toEqual({
      R: 7,
      I: 5,
      A: 0,
      S: 2,
      E: 0,
      C: 0,
    })
  })

  it('returns a zero profile when there are no answers', () => {
    expect(computeRiasecProfile([], [])).toEqual({
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    })
  })

  it('ignores answers whose questionId is not in the questions list', () => {
    const questions: Question[] = [riasecQuestion('r1', 'R')]
    const answers: Answer[] = [answer('r1', 3), answer('ghost', 5)]
    const profile = computeRiasecProfile(answers, questions)
    expect(profile.R).toBe(3)
  })

  it('ignores questions from non-riasec layers', () => {
    const questions: Question[] = [
      riasecQuestion('r1', 'R'),
      {
        id: 'bf1',
        layer: 'bigfive',
        dimension: 'openness',
        text: { en: 'bf item', de: 'bf Item' },
        scale: 'likert5',
      },
    ]
    const answers: Answer[] = [answer('r1', 4), answer('bf1', 5)]
    const profile = computeRiasecProfile(answers, questions)
    expect(profile.R).toBe(4)
    // Big Five answer must not land in any RIASEC dimension slot
    const total = RIASEC_DIMENSIONS.reduce((sum, d) => sum + profile[d], 0)
    expect(total).toBe(4)
  })

  it('ignores riasec questions with an invalid dimension letter', () => {
    const questions: Question[] = [
      riasecQuestion('r1', 'R'),
      riasecQuestion('x1', 'X'), // not a valid RIASEC letter
    ]
    const answers: Answer[] = [answer('r1', 2), answer('x1', 5)]
    const profile = computeRiasecProfile(answers, questions)
    expect(profile.R).toBe(2)
    const total = RIASEC_DIMENSIONS.reduce((sum, d) => sum + profile[d], 0)
    expect(total).toBe(2)
  })
})

describe('normalizeRiasecToPercent', () => {
  it('scales each dimension by the number of items present', () => {
    // 2 R items (max 10), profile.R=6 → 60%
    // 1 I item  (max 5),  profile.I=4 → 80%
    const questions: Question[] = [
      riasecQuestion('r1', 'R'),
      riasecQuestion('r2', 'R'),
      riasecQuestion('i1', 'I'),
    ]
    const result = normalizeRiasecToPercent(
      { R: 6, I: 4, A: 0, S: 0, E: 0, C: 0 },
      questions,
    )
    expect(result.R).toBe(60)
    expect(result.I).toBe(80)
  })

  it('returns 0 for dimensions that have no items (no divide-by-zero)', () => {
    const questions: Question[] = [riasecQuestion('r1', 'R')]
    const result = normalizeRiasecToPercent(
      { R: 5, I: 0, A: 0, S: 0, E: 0, C: 0 },
      questions,
    )
    expect(result.R).toBe(100)
    expect(result.I).toBe(0)
    expect(result.A).toBe(0)
  })

  it('rounds to the nearest integer', () => {
    // 3 R items, max=15, profile.R=10 → 66.67 → rounds to 67
    const questions: Question[] = [
      riasecQuestion('r1', 'R'),
      riasecQuestion('r2', 'R'),
      riasecQuestion('r3', 'R'),
    ]
    const result = normalizeRiasecToPercent(
      { R: 10, I: 0, A: 0, S: 0, E: 0, C: 0 },
      questions,
    )
    expect(result.R).toBe(67)
  })

  it('returns all zeros for an empty questions list', () => {
    const result = normalizeRiasecToPercent(
      { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
      [],
    )
    expect(result).toEqual({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
  })
})

describe('hasProfileDirection', () => {
  it('returns true when at least one dimension differs from the others', () => {
    expect(
      hasProfileDirection({ R: 5, I: 3, A: 3, S: 3, E: 3, C: 3 }),
    ).toBe(true)
  })

  it('returns false when every dimension is equal (all-low uniform answers)', () => {
    // A user answering every item with "1" ends up with sum counts that
    // are equal across dims (10 items × 1 each = 10 per dim for the full
    // Interest Profiler). The matching step would produce fitScore 0 for
    // every occupation via pearson.ts's zero-variance guard.
    expect(
      hasProfileDirection({ R: 10, I: 10, A: 10, S: 10, E: 10, C: 10 }),
    ).toBe(false)
  })

  it('returns false when every dimension is equal (all-high uniform answers)', () => {
    expect(
      hasProfileDirection({ R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 }),
    ).toBe(false)
  })

  it('returns false for the all-zero profile (no answers yet)', () => {
    expect(
      hasProfileDirection({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }),
    ).toBe(false)
  })

  it('returns true even when only one dimension differs', () => {
    expect(
      hasProfileDirection({ R: 10, I: 10, A: 10, S: 10, E: 10, C: 11 }),
    ).toBe(true)
  })
})
