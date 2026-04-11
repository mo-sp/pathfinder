import { describe, it, expect } from 'vitest'
import { matchOccupations } from './matcher'
import type { Occupation, RIASECProfile } from '@entities/occupation/model/types'

function occupation(
  onetCode: string,
  riasecProfile: RIASECProfile,
  titleEn = onetCode,
): Occupation {
  return {
    onetCode,
    title: { en: titleEn, de: null },
    riasecProfile,
  }
}

describe('matchOccupations', () => {
  const softwareDev: Occupation = occupation('15-1252.00', {
    R: 2,
    I: 6,
    A: 3,
    S: 2,
    E: 3,
    C: 5,
  }, 'Software Developer')
  const artist: Occupation = occupation('27-1013.00', {
    R: 2,
    I: 3,
    A: 7,
    S: 3,
    E: 3,
    C: 2,
  }, 'Fine Artist')
  const carpenter: Occupation = occupation('47-2031.00', {
    R: 7,
    I: 2,
    A: 2,
    S: 2,
    E: 2,
    C: 3,
  }, 'Carpenter')

  it('ranks an occupation with an identical profile highest', () => {
    // Same shape as softwareDev → Pearson ≈ 1 → should come first
    const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
    const [top] = matchOccupations(userProfile, [artist, carpenter, softwareDev])
    expect(top.occupation.onetCode).toBe(softwareDev.onetCode)
    expect(top.fitScore).toBeCloseTo(1, 10)
    expect(top.rank).toBe(1)
  })

  it('ranks results in descending fitScore order', () => {
    const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
    const results = matchOccupations(userProfile, [carpenter, artist, softwareDev])
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].fitScore).toBeGreaterThanOrEqual(results[i].fitScore)
    }
  })

  it('assigns rank 1..N in order', () => {
    const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
    const results = matchOccupations(userProfile, [softwareDev, artist, carpenter])
    expect(results.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it('respects the topN parameter', () => {
    const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
    const results = matchOccupations(
      userProfile,
      [softwareDev, artist, carpenter],
      2,
    )
    expect(results).toHaveLength(2)
    expect(results[0].rank).toBe(1)
    expect(results[1].rank).toBe(2)
  })

  it('returns an empty array when there are no occupations', () => {
    const userProfile: RIASECProfile = { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 }
    expect(matchOccupations(userProfile, [])).toEqual([])
  })

  it('preserves the original occupation reference in each result', () => {
    const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
    const results = matchOccupations(userProfile, [softwareDev])
    expect(results[0].occupation).toBe(softwareDev)
  })
})
