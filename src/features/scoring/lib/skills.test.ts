import { describe, it, expect } from 'vitest'
import type { Answer } from '@entities/assessment/model/types'
import type { Question } from '@entities/question/model/types'
import {
  SKILLS_SUB_CATEGORIES,
  averageToPercent,
  computeSkillsProfile,
  emptySkillsProfile,
  percentToBand,
  subCategoryAverages,
  totalAnswers,
} from './skills'

const makeQ = (
  id: string,
  subCategory: 'skills' | 'abilities' | 'knowledge',
  onetElementId: string,
): Question => ({
  id,
  layer: 'skills',
  dimension: subCategory,
  subCategory,
  onetElementId,
  text: { en: id, de: id },
  scale: 'likert5',
})

const makeAnswer = (questionId: string, value: number): Answer => ({
  questionId,
  value,
  answeredAt: 0,
})

describe('computeSkillsProfile', () => {
  it('returns empty profile for no answers', () => {
    expect(computeSkillsProfile([], [])).toEqual(emptySkillsProfile())
  })

  it('groups answers by sub-category keyed by onetElementId', () => {
    const qs = [
      makeQ('sk-skills-2.A.1.a', 'skills', '2.A.1.a'),
      makeQ('sk-abilities-1.A.1.a.1', 'abilities', '1.A.1.a.1'),
      makeQ('sk-knowledge-2.C.1.a', 'knowledge', '2.C.1.a'),
    ]
    const as = [
      makeAnswer('sk-skills-2.A.1.a', 5),
      makeAnswer('sk-abilities-1.A.1.a.1', 3),
      makeAnswer('sk-knowledge-2.C.1.a', 1),
    ]
    const profile = computeSkillsProfile(as, qs)
    expect(profile.skills['2.A.1.a']).toBe(5)
    expect(profile.abilities['1.A.1.a.1']).toBe(3)
    expect(profile.knowledge['2.C.1.a']).toBe(1)
  })

  it('ignores answers whose question is not skills-layer', () => {
    const qs: Question[] = [
      { id: 'rA-1', layer: 'riasec', dimension: 'R', text: { en: 'x', de: 'x' }, scale: 'likert5' },
    ]
    const profile = computeSkillsProfile([makeAnswer('rA-1', 5)], qs)
    expect(profile).toEqual(emptySkillsProfile())
  })

  it('skips items missing subCategory or onetElementId', () => {
    const broken: Question = {
      id: 'sk-x',
      layer: 'skills',
      dimension: 'skills',
      text: { en: 'x', de: 'x' },
      scale: 'likert5',
    }
    const profile = computeSkillsProfile([makeAnswer('sk-x', 5)], [broken])
    expect(profile).toEqual(emptySkillsProfile())
  })
})

describe('subCategoryAverages', () => {
  it('returns 0 for empty sub-categories', () => {
    expect(subCategoryAverages(emptySkillsProfile())).toEqual({
      skills: 0,
      abilities: 0,
      knowledge: 0,
    })
  })

  it('averages values per sub-category', () => {
    const profile = {
      skills: { a: 1, b: 5 },
      abilities: { c: 3 },
      knowledge: {},
    }
    expect(subCategoryAverages(profile)).toEqual({
      skills: 3,
      abilities: 3,
      knowledge: 0,
    })
  })
})

describe('averageToPercent', () => {
  it('maps 1-5 scale to 0-100%', () => {
    expect(averageToPercent(1)).toBe(0)
    expect(averageToPercent(3)).toBe(50)
    expect(averageToPercent(5)).toBe(100)
  })

  it('handles the empty-sub-category zero', () => {
    expect(averageToPercent(0)).toBe(0)
  })
})

describe('percentToBand', () => {
  it('maps fifths of the percent axis to the five bands', () => {
    expect(percentToBand(0)).toBe('none')
    expect(percentToBand(19)).toBe('none')
    expect(percentToBand(20)).toBe('basics')
    expect(percentToBand(39)).toBe('basics')
    expect(percentToBand(40)).toBe('average')
    expect(percentToBand(59)).toBe('average')
    expect(percentToBand(60)).toBe('advanced')
    expect(percentToBand(79)).toBe('advanced')
    expect(percentToBand(80)).toBe('expert')
    expect(percentToBand(100)).toBe('expert')
  })
})

describe('totalAnswers', () => {
  it('counts keys across all three sub-categories', () => {
    expect(totalAnswers(emptySkillsProfile())).toBe(0)
    const profile = {
      skills: { a: 1, b: 2 },
      abilities: { c: 3 },
      knowledge: { d: 4, e: 5, f: 1 },
    }
    expect(totalAnswers(profile)).toBe(6)
  })
})

describe('SKILLS_SUB_CATEGORIES', () => {
  it('lists the three sub-categories in canonical order', () => {
    expect([...SKILLS_SUB_CATEGORIES]).toEqual(['skills', 'abilities', 'knowledge'])
  })
})
