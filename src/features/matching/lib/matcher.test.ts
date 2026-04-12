import { describe, it, expect } from 'vitest'
import { matchOccupations } from './matcher'
import type { BigFiveProfile, Occupation, RIASECProfile } from '@entities/occupation/model/types'

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
    const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
    const [top] = matchOccupations(userProfile, [artist, carpenter, softwareDev])
    expect(top.occupation.onetCode).toBe(softwareDev.onetCode)
    expect(top.fitScore).toBeCloseTo(1, 10)
    expect(top.riasecCorrelation).toBeCloseTo(1, 10)
    expect(top.bigFiveModifier).toBeNull()
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

  it('populates riasecCorrelation equal to fitScore when no Big Five data', () => {
    const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
    const results = matchOccupations(userProfile, [softwareDev, artist])
    for (const r of results) {
      expect(r.riasecCorrelation).toBe(r.fitScore)
      expect(r.bigFiveModifier).toBeNull()
    }
  })

  describe('Big Five re-ranking', () => {
    // Occupation Big Five target profiles for testing:
    // softwareDev → high O, high C, low E (introverted analytical)
    // artist → high O, low C (creative, unstructured)
    const occProfiles: Record<string, BigFiveProfile> = {
      '15-1252.00': { openness: 58, conscientiousness: 55, extraversion: 42, agreeableness: 48, neuroticism: 46 },
      '27-1013.00': { openness: 62, conscientiousness: 40, extraversion: 54, agreeableness: 50, neuroticism: 52 },
    }

    // User who is introverted + conscientious + open (matches dev, not artist)
    const introvertedAnalytical: BigFiveProfile = {
      openness: 45, conscientiousness: 48, extraversion: 15, agreeableness: 30, neuroticism: 25,
    }

    // User who is extraverted + open + low-C (matches artist, not dev)
    const creativeExtrovert: BigFiveProfile = {
      openness: 48, conscientiousness: 15, extraversion: 40, agreeableness: 30, neuroticism: 35,
    }

    it('boosts fitScore for matching personality', () => {
      // Use a profile that's similar but not identical to softwareDev's RIASEC,
      // so riasecCorrelation < 1.0 and the cap at 1.0 doesn't hide the boost.
      const userProfile: RIASECProfile = { R: 2, I: 5, A: 4, S: 2, E: 3, C: 4 }
      const results = matchOccupations(userProfile, [softwareDev], 20, introvertedAnalytical, occProfiles)
      const dev = results.find(r => r.occupation.onetCode === '15-1252.00')!
      expect(dev.bigFiveModifier).not.toBeNull()
      expect(dev.bigFiveModifier!).toBeGreaterThan(1)
      expect(dev.fitScore).toBeGreaterThan(dev.riasecCorrelation)
    })

    it('dampens fitScore for mismatching personality', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [softwareDev], 20, creativeExtrovert, occProfiles)
      const dev = results.find(r => r.occupation.onetCode === '15-1252.00')!
      expect(dev.bigFiveModifier!).toBeLessThan(1)
      expect(dev.fitScore).toBeLessThan(dev.riasecCorrelation)
    })

    it('returns null modifier for occupations not in the Big Five lookup', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [carpenter], 20, introvertedAnalytical, occProfiles)
      const carp = results[0]
      expect(carp.bigFiveModifier).toBeNull()
      expect(carp.fitScore).toBe(carp.riasecCorrelation)
    })

    it('modifier stays within [0.7, 1.3] range (α = 0.3)', () => {
      // Perfect match: user profile identical shape to occupation profile
      const perfectMatch: BigFiveProfile = { openness: 58, conscientiousness: 55, extraversion: 42, agreeableness: 48, neuroticism: 46 }
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [softwareDev], 20, perfectMatch, occProfiles)
      const dev = results[0]
      expect(dev.bigFiveModifier!).toBeCloseTo(1.3, 1)

      // Anti-match: flip the occupation profile (high→low, low→high)
      const antiMatch: BigFiveProfile = { openness: 42, conscientiousness: 45, extraversion: 58, agreeableness: 52, neuroticism: 54 }
      const results2 = matchOccupations(userProfile, [softwareDev], 20, antiMatch, occProfiles)
      const dev2 = results2[0]
      expect(dev2.bigFiveModifier!).toBeCloseTo(0.7, 1)
    })

    it('re-ranks occupations with equal RIASEC fit based on personality match', () => {
      // Two occupations with identical RIASEC profiles but different Big Five targets
      const occA = occupation('AA-0001.00', { R: 3, I: 5, A: 4, S: 2, E: 3, C: 4 }, 'Job A')
      const occB = occupation('BB-0002.00', { R: 3, I: 5, A: 4, S: 2, E: 3, C: 4 }, 'Job B')
      const profiles: Record<string, BigFiveProfile> = {
        'AA-0001.00': { openness: 58, conscientiousness: 55, extraversion: 42, agreeableness: 48, neuroticism: 46 },
        'BB-0002.00': { openness: 42, conscientiousness: 45, extraversion: 58, agreeableness: 52, neuroticism: 54 },
      }
      const userProfile: RIASECProfile = { R: 3, I: 5, A: 4, S: 2, E: 3, C: 4 }

      // Without Big Five: same RIASEC → same fit
      const withoutBf = matchOccupations(userProfile, [occA, occB])
      expect(withoutBf[0].fitScore).toBeCloseTo(withoutBf[1].fitScore, 10)

      // With Big Five matching A: A should rank above B
      const results = matchOccupations(userProfile, [occA, occB], 20, introvertedAnalytical, profiles)
      expect(results[0].occupation.onetCode).toBe('AA-0001.00')
      expect(results[0].fitScore).toBeGreaterThan(results[1].fitScore)
    })

    it('preserves RIASEC-only behavior when Big Five args are null', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const withoutBf = matchOccupations(userProfile, [softwareDev, artist, carpenter])
      const withNull = matchOccupations(userProfile, [softwareDev, artist, carpenter], 20, null, null)
      expect(withoutBf.map(r => r.fitScore)).toEqual(withNull.map(r => r.fitScore))
    })
  })
})
