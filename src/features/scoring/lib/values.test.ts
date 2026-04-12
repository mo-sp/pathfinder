import { describe, it, expect } from 'vitest'
import { computeValuesProfile, VALUES_DIMENSIONS } from './values'
import type { Answer } from '@entities/assessment/model/types'
import type { Question } from '@entities/question/model/types'

function makeQuestion(dim: string, id = `val-${dim}-01`): Question {
  return {
    id,
    layer: 'values',
    dimension: dim,
    text: { en: dim, de: null },
    scale: 'likert5',
  }
}

function makeAnswer(questionId: string, value: number): Answer {
  return { questionId, value, answeredAt: Date.now() }
}

describe('computeValuesProfile', () => {
  it('returns neutral (3) for all dimensions when no answers', () => {
    const profile = computeValuesProfile([], [])
    for (const dim of VALUES_DIMENSIONS) {
      expect(profile[dim]).toBe(3)
    }
  })

  it('maps each answer to the correct dimension', () => {
    const questions = [
      makeQuestion('education'),
      makeQuestion('environment'),
      makeQuestion('teamwork'),
    ]
    const answers = [
      makeAnswer('val-education-01', 5),
      makeAnswer('val-environment-01', 1),
      makeAnswer('val-teamwork-01', 4),
    ]
    const profile = computeValuesProfile(answers, questions)
    expect(profile.education).toBe(5)
    expect(profile.environment).toBe(1)
    expect(profile.teamwork).toBe(4)
    // Unanswered dimensions default to 3
    expect(profile.socialInteraction).toBe(3)
    expect(profile.physicalDemands).toBe(3)
  })

  it('ignores non-values layer questions', () => {
    const questions: Question[] = [
      { id: 'ip-r-01', layer: 'riasec', dimension: 'R', text: { en: 'x', de: null }, scale: 'likert5' },
    ]
    const answers = [makeAnswer('ip-r-01', 5)]
    const profile = computeValuesProfile(answers, questions)
    // All dimensions stay at neutral
    for (const dim of VALUES_DIMENSIONS) {
      expect(profile[dim]).toBe(3)
    }
  })

  it('uses latest answer when duplicate question ids exist', () => {
    const questions = [makeQuestion('autonomy')]
    const answers = [
      makeAnswer('val-autonomy-01', 2),
      makeAnswer('val-autonomy-01', 5),
    ]
    // Map uses last entry for duplicate keys
    const profile = computeValuesProfile(answers, questions)
    expect(profile.autonomy).toBe(5)
  })

  it('contains exactly all 8 dimensions', () => {
    const profile = computeValuesProfile([], [])
    const keys = Object.keys(profile)
    expect(keys).toHaveLength(8)
    for (const dim of VALUES_DIMENSIONS) {
      expect(keys).toContain(dim)
    }
  })
})
