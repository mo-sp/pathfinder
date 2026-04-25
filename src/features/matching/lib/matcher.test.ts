import { describe, it, expect } from 'vitest'
import { matchOccupations } from './matcher'
import type { BigFiveProfile, Occupation, OccupationSkillMap, RIASECProfile, ValuesProfile } from '@entities/occupation/model/types'
import type { SkillsProfile } from '@features/scoring/lib/skills'

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
      // so the adjustment doesn't get swallowed by ranking ties.
      const userProfile: RIASECProfile = { R: 2, I: 5, A: 4, S: 2, E: 3, C: 4 }
      const results = matchOccupations(userProfile, [softwareDev], 20, introvertedAnalytical, occProfiles)
      const dev = results.find(r => r.occupation.onetCode === '15-1252.00')!
      expect(dev.bigFiveModifier).not.toBeNull()
      expect(dev.bigFiveModifier!).toBeGreaterThan(0)
      expect(dev.fitScore).toBeGreaterThan(dev.riasecCorrelation)
    })

    it('dampens fitScore for mismatching personality', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [softwareDev], 20, creativeExtrovert, occProfiles)
      const dev = results.find(r => r.occupation.onetCode === '15-1252.00')!
      expect(dev.bigFiveModifier!).toBeLessThan(0)
      expect(dev.fitScore).toBeLessThan(dev.riasecCorrelation)
    })

    it('returns null modifier for occupations not in the Big Five lookup', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [carpenter], 20, introvertedAnalytical, occProfiles)
      const carp = results[0]
      expect(carp.bigFiveModifier).toBeNull()
      expect(carp.fitScore).toBe(carp.riasecCorrelation)
    })

    it('adjustment stays within [−0.3, +0.3] range (α = 0.3)', () => {
      // Perfect match: user profile identical shape to occupation profile
      const perfectMatch: BigFiveProfile = { openness: 58, conscientiousness: 55, extraversion: 42, agreeableness: 48, neuroticism: 46 }
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [softwareDev], 20, perfectMatch, occProfiles)
      const dev = results[0]
      expect(dev.bigFiveModifier!).toBeCloseTo(0.3, 1)

      // Anti-match: flip the occupation profile (high→low, low→high)
      const antiMatch: BigFiveProfile = { openness: 42, conscientiousness: 45, extraversion: 58, agreeableness: 52, neuroticism: 54 }
      const results2 = matchOccupations(userProfile, [softwareDev], 20, antiMatch, occProfiles)
      const dev2 = results2[0]
      expect(dev2.bigFiveModifier!).toBeCloseTo(-0.3, 1)
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

  describe('Values filtering and penalties', () => {
    // Occupations with anforderungsniveau (KldB training level) and workContext
    // for values testing. Anf 2=Ausbildung, 3=Meister/Bachelor, 4=Master+.
    const deskJob: Occupation = {
      ...softwareDev,
      anforderungsniveau: 3,
      workContext: {
        indoor: 4.9, outdoor: 1.2, contactWithOthers: 3.5, teamwork: 3.8,
        standing: 1.2, walking: 1.1, autonomy: 4.5, publicContact: 2.0, routine: 2.5,
      },
    }
    const outdoorJob: Occupation = {
      ...carpenter,
      anforderungsniveau: 2,
      workContext: {
        indoor: 1.5, outdoor: 4.8, contactWithOthers: 3.0, teamwork: 3.2,
        standing: 4.5, walking: 4.0, autonomy: 3.0, publicContact: 2.5, routine: 3.5,
      },
    }
    const surgeonJob: Occupation = {
      ...occupation('29-1241.00', { R: 4, I: 6, A: 2, S: 5, E: 3, C: 3 }, 'Surgeon'),
      anforderungsniveau: 4,
      workContext: {
        indoor: 4.8, outdoor: 1.1, contactWithOthers: 4.5, teamwork: 4.2,
        standing: 4.2, walking: 2.8, autonomy: 4.8, publicContact: 3.5, routine: 1.5,
      },
    }

    const neutralValues: ValuesProfile = {
      education: 3, environment: 3, socialInteraction: 3, teamwork: 3,
      physicalDemands: 3, autonomy: 3, publicContact: 3, routine: 3,
    }

    it('hard-filters occupations whose Anforderungsniveau exceeds education willingness', () => {
      const userProfile: RIASECProfile = { R: 3, I: 5, A: 3, S: 3, E: 3, C: 4 }
      // education=2 → max Anf 2: keep Anf 2, drop Anf 3 and Anf 4
      const values: ValuesProfile = { ...neutralValues, education: 2 }
      const results = matchOccupations(userProfile, [deskJob, outdoorJob, surgeonJob], 20, null, null, values)
      const codes = results.map(r => r.occupation.onetCode)
      expect(codes).not.toContain(deskJob.onetCode) // Anf 3 > 2
      expect(codes).not.toContain(surgeonJob.onetCode) // Anf 4 > 2
      expect(codes).toContain(outdoorJob.onetCode) // Anf 2 ≤ 2
    })

    it('keeps occupations without Anforderungsniveau when filtering', () => {
      const noAnf: Occupation = occupation('99-0000.00', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 })
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const values: ValuesProfile = { ...neutralValues, education: 1 }
      const results = matchOccupations(userProfile, [noAnf], 20, null, null, values)
      expect(results).toHaveLength(1)
    })

    it('education=5 (egal) lets every Anforderungsniveau through', () => {
      const userProfile: RIASECProfile = { R: 3, I: 5, A: 3, S: 3, E: 3, C: 4 }
      const values: ValuesProfile = { ...neutralValues, education: 5 }
      const results = matchOccupations(userProfile, [deskJob, outdoorJob, surgeonJob], 20, null, null, values)
      expect(results).toHaveLength(3)
    })

    it('applies a negative contribution that reduces fitScore on strong mismatch', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      // Maximally mismatched against deskJob (indoor team desk work)
      const maxMismatch: ValuesProfile = {
        education: 5, environment: 5, socialInteraction: 1, teamwork: 1,
        physicalDemands: 5, autonomy: 1, publicContact: 1, routine: 5,
      }
      const results = matchOccupations(userProfile, [deskJob], 20, null, null, maxMismatch)
      const desk = results[0]
      expect(desk.valuesContribution).not.toBeNull()
      expect(desk.valuesContribution!).toBeLessThan(0)
      expect(desk.fitScore).toBeLessThan(desk.riasecCorrelation)
    })

    it('returns valuesContribution: null when values not provided', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [deskJob])
      expect(results[0].valuesContribution).toBeNull()
    })

    it('returns valuesContribution: null when occupation has no workContext', () => {
      // Regression for a display bug: occupations without workContext used to
      // get penalty = 0, which the UI rendered as "perfect match". Values
      // layer should abstain (null) instead, matching the skills-layer
      // convention for missing occupation data.
      const noWc: Occupation = occupation('88-0000.00', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 })
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const values: ValuesProfile = { ...neutralValues, education: 5 }
      const results = matchOccupations(userProfile, [noWc], 20, null, null, values)
      expect(results[0].valuesContribution).toBeNull()
      expect(results[0].fitScore).toBe(results[0].riasecCorrelation)
    })

    it('contribution tops out near +0.10 for perfectly matching preferences', () => {
      const userProfile: RIASECProfile = { R: 7, I: 2, A: 2, S: 2, E: 2, C: 3 }
      // Preferences that match outdoorJob: outdoor, physical, low contact, moderate autonomy
      const perfectMatch: ValuesProfile = {
        education: 5, environment: 5, socialInteraction: 3, teamwork: 3,
        physicalDemands: 5, autonomy: 3, publicContact: 2, routine: 3,
      }
      const results = matchOccupations(userProfile, [outdoorJob], 20, null, null, perfectMatch)
      // contribution = 0.10 − penalty; perfect → penalty ≈ 0 → contribution ≈ +0.10
      expect(results[0].valuesContribution!).toBeGreaterThan(0.05)
      expect(results[0].valuesContribution!).toBeLessThanOrEqual(0.10)
    })

    it('contribution bottoms out around −0.25 on maximum mismatch', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      // Maximally mismatched: want outdoor+physical+solo vs indoor desk team job
      const maxMismatch: ValuesProfile = {
        education: 5, environment: 5, socialInteraction: 1, teamwork: 1,
        physicalDemands: 5, autonomy: 1, publicContact: 1, routine: 5,
      }
      const results = matchOccupations(userProfile, [deskJob], 20, null, null, maxMismatch)
      // contribution = 0.10 − penalty; max penalty ≈ 0.35 → contribution ≈ −0.25.
      // Allow small slack (penalty can edge past 0.35 in composite math).
      expect(results[0].valuesContribution!).toBeLessThan(-0.10)
      expect(results[0].valuesContribution!).toBeGreaterThanOrEqual(-0.30)
    })

    it('values re-rank occupations with similar RIASEC fit', () => {
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      // Both have similar RIASEC fit (flat profile) but different work contexts
      // User prefers outdoor + physical → outdoorJob should rank higher
      const outdoorPref: ValuesProfile = {
        education: 5, environment: 5, socialInteraction: 3, teamwork: 3,
        physicalDemands: 5, autonomy: 3, publicContact: 3, routine: 3,
      }
      const results = matchOccupations(userProfile, [deskJob, outdoorJob], 20, null, null, outdoorPref)
      expect(results[0].occupation.onetCode).toBe(outdoorJob.onetCode)
    })

    it('combines Big Five modifier and values penalty', () => {
      const userProfile: RIASECProfile = { R: 2, I: 5, A: 4, S: 2, E: 3, C: 4 }
      const userBf: BigFiveProfile = { openness: 58, conscientiousness: 55, extraversion: 42, agreeableness: 48, neuroticism: 46 }
      const occBfProfiles: Record<string, BigFiveProfile> = {
        [deskJob.onetCode]: { openness: 58, conscientiousness: 55, extraversion: 42, agreeableness: 48, neuroticism: 46 },
      }
      const values: ValuesProfile = { ...neutralValues, education: 5, environment: 1 }
      const results = matchOccupations(userProfile, [deskJob], 20, userBf, occBfProfiles, values)
      const r = results[0]
      // Has both modifier and contribution
      expect(r.bigFiveModifier).not.toBeNull()
      expect(r.valuesContribution).not.toBeNull()
      // fitScore = riasec + bfAdj + valuesContribution (contribution is signed)
      expect(r.fitScore).toBeCloseTo(r.riasecCorrelation + r.bigFiveModifier! + r.valuesContribution!, 6)
    })
  })

  describe('Skills bonus', () => {
    // Per-element entry: l = Level (0-7), i = Importance (1-5).
    // techJob requires high skills in programming + critical thinking + mathematics.
    const techSkills: OccupationSkillMap = {
      '2.A.1.a': { l: 5.0, i: 4.5 }, // Reading Comprehension
      '2.B.3.e': { l: 6.5, i: 4.8 }, // Programming
      '2.A.2.a': { l: 5.5, i: 4.6 }, // Critical Thinking
    }
    const techAbilities: OccupationSkillMap = {
      '1.A.1.b.4': { l: 5.8, i: 4.5 }, // Deductive Reasoning
    }
    const techKnowledge: OccupationSkillMap = {
      '2.C.3.a': { l: 6.0, i: 4.8 }, // Computers and Electronics
      '2.C.4.a': { l: 5.0, i: 4.2 }, // Mathematics
    }
    const techJob: Occupation = {
      ...occupation('15-1252.01', { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }, 'Software Dev'),
      skills: techSkills,
      abilities: techAbilities,
      knowledge: techKnowledge,
    }

    const craftJob: Occupation = {
      ...occupation('47-2031.01', { R: 7, I: 2, A: 2, S: 2, E: 2, C: 3 }, 'Carpenter'),
      skills: {
        '2.B.3.l': { l: 5.5, i: 4.7 }, // Repairing
        '2.B.3.h': { l: 5.8, i: 4.8 }, // Operation and Control
      },
      abilities: {
        '1.A.2.a.3': { l: 5.5, i: 4.6 }, // Finger Dexterity
        '1.A.3.a.1': { l: 5.0, i: 4.2 }, // Static Strength
      },
    }

    // A user who rates themselves high on all tech-related skills
    const techUser: SkillsProfile = {
      skills: { '2.A.1.a': 5, '2.B.3.e': 5, '2.A.2.a': 5 },
      abilities: { '1.A.1.b.4': 5 },
      knowledge: { '2.C.3.a': 5, '2.C.4.a': 5 },
    }

    // A user who rates themselves low on all tech skills
    const noTechUser: SkillsProfile = {
      skills: { '2.A.1.a': 1, '2.B.3.e': 1, '2.A.2.a': 1 },
      abilities: { '1.A.1.b.4': 1 },
      knowledge: { '2.C.3.a': 1, '2.C.4.a': 1 },
    }

    it('returns skillsMatch and skillsBonus null when skills not provided', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [techJob])
      expect(results[0].skillsMatch).toBeNull()
      expect(results[0].skillsBonus).toBeNull()
    })

    it('returns skillsMatch and skillsBonus null when occupation has no skills data', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const bare: Occupation = occupation('99-0000.01', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 })
      const results = matchOccupations(userProfile, [bare], 20, null, null, null, techUser)
      expect(results[0].skillsMatch).toBeNull()
      expect(results[0].skillsBonus).toBeNull()
    })

    it('gives a positive skills bonus for a strongly matching profile', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [techJob], 20, null, null, null, techUser)
      const r = results[0]
      expect(r.skillsMatch).not.toBeNull()
      expect(r.skillsMatch!).toBeGreaterThan(0.6)
      expect(r.skillsBonus!).toBeGreaterThan(0)
      expect(r.skillsBonus!).toBeLessThanOrEqual(0.25)
    })

    it('gives a negative skills bonus (dampening) for a strongly mismatching profile', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [techJob], 20, null, null, null, noTechUser)
      const r = results[0]
      expect(r.skillsMatch!).toBeLessThan(0.4)
      expect(r.skillsBonus!).toBeLessThan(0)
      expect(r.skillsBonus!).toBeGreaterThanOrEqual(-0.25)
    })

    it('skills bonus is applied to fitScore', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      const results = matchOccupations(userProfile, [techJob], 20, null, null, null, techUser)
      const r = results[0]
      // fitScore = riasecCorrelation (no BF, no values) + skillsBonus
      expect(r.fitScore).toBeCloseTo(r.riasecCorrelation + r.skillsBonus!, 6)
    })

    it('skills re-rank occupations with similar RIASEC fit', () => {
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      // Both occupations have flat RIASEC correlation against flat user → tie
      // Tech skills user should push techJob above craftJob
      const results = matchOccupations(userProfile, [techJob, craftJob], 20, null, null, null, techUser)
      expect(results[0].occupation.onetCode).toBe(techJob.onetCode)
    })

    it('ignores user answers for elements the occupation does not list', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      // User answers tons of skills that techJob does not list — should not
      // dilute the match for the ones that do match.
      const userWithExtras: SkillsProfile = {
        skills: { ...techUser.skills, 'X.Y.Z': 1, 'A.B.C': 1 },
        abilities: techUser.abilities,
        knowledge: techUser.knowledge,
      }
      const results = matchOccupations(userProfile, [techJob], 20, null, null, null, userWithExtras)
      // Still a strong match since all the occupation's listed elements align
      expect(results[0].skillsMatch!).toBeGreaterThan(0.6)
    })

    it('does NOT penalize overqualification (asymmetric match)', () => {
      // Low-requirement job: occ level 2/7 ≈ 0.29. Maxed-out user (1.0)
      // used to be penalized as "overqualified" (sim ≈ 1 − |1 − 0.29| = 0.29).
      // With asymmetric match, user above occ level → sim = 1 → match = 1.
      const easyJob: Occupation = {
        ...occupation('99-0000.02', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Easy Job'),
        skills: {
          '2.A.1.a': { l: 2.0, i: 4.0 }, // low level, high importance
          '2.B.3.e': { l: 1.5, i: 3.5 },
        },
      }
      const maxedUser: SkillsProfile = {
        skills: { '2.A.1.a': 5, '2.B.3.e': 5 },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const results = matchOccupations(userProfile, [easyJob], 20, null, null, null, maxedUser)
      const r = results[0]
      // Overqualified user = perfect match, not ~0.3 match.
      expect(r.skillsMatch).toBe(1)
      expect(r.skillsBonus).toBe(0.25)
    })

    it('matches perfectly when user is exactly at occupation level', () => {
      // occ level 4/7 ≈ 0.57. userValue 3 → userNorm (3-1)/4 = 0.5.
      // Close but not equal; ok user at level 3/7 ≈ 0.43 with user value 2.
      // Easiest: occ level 4 with user value 3 (userNorm 0.5 vs occNorm 0.571).
      // To hit exact equality: occ l = 5 (norm 0.714), user value ≈ 3.86 — not
      // a valid likert value. Skip exact-equality and assert "user meets or
      // exceeds → sim = 1" via user value 5 (norm 1.0) vs occ l = 7 (norm 1.0).
      const exactJob: Occupation = {
        ...occupation('99-0000.03', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Exact Job'),
        skills: { '2.A.1.a': { l: 7.0, i: 4.0 } },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const atLevelUser: SkillsProfile = {
        skills: { '2.A.1.a': 5 },
        abilities: {},
        knowledge: {},
      }
      const results = matchOccupations(userProfile, [exactJob], 20, null, null, null, atLevelUser)
      expect(results[0].skillsMatch).toBe(1)
    })

    it('penalizes shortfall proportionally when user is below occupation level', () => {
      // Shortfall semantics: sim = 1 − (occNorm − userNorm) for user < occ.
      // occ l=7 (norm=1), user value=1 (norm=0) → sim = 1 − 1 = 0.
      const hardJob: Occupation = {
        ...occupation('99-0000.04', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Hard Job'),
        skills: { '2.A.1.a': { l: 7.0, i: 4.0 } },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const underUser: SkillsProfile = {
        skills: { '2.A.1.a': 1 },
        abilities: {},
        knowledge: {},
      }
      const results = matchOccupations(userProfile, [hardJob], 20, null, null, null, underUser)
      expect(results[0].skillsMatch).toBe(0)
      expect(results[0].skillsBonus).toBe(-0.25)
    })

    it('skills bonus magnitude stays within ±0.25', () => {
      const userProfile: RIASECProfile = { R: 2, I: 6, A: 3, S: 2, E: 3, C: 5 }
      // Extreme cases: perfect high match and perfect low match
      const extremeHigh = matchOccupations(userProfile, [techJob], 20, null, null, null, techUser)
      const extremeLow = matchOccupations(userProfile, [techJob], 20, null, null, null, noTechUser)
      expect(extremeHigh[0].skillsBonus!).toBeLessThanOrEqual(0.25)
      expect(extremeLow[0].skillsBonus!).toBeGreaterThanOrEqual(-0.25)
    })

    it('all-1s user hits exactly −0.25 regardless of occupation complexity', () => {
      // Regression for the floor-calibration bug: before per-occupation
      // floor, an all-1s user on a low-requirement occupation scored a
      // POSITIVE bonus because the raw match (≈ 1 − avgOccNorm ≈ 0.75)
      // landed above the fixed 0.5 center. Floor calibration fixes that:
      // every zero-skill user is anchored to −SKILLS_ALPHA/2.
      const easyJob: Occupation = {
        ...occupation('99-0000.05', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Easy Job'),
        skills: {
          '2.A.1.a': { l: 2.0, i: 4.0 },
          '2.B.3.e': { l: 1.5, i: 3.5 },
        },
      }
      const hardJob: Occupation = {
        ...occupation('99-0000.06', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Hard Job'),
        skills: {
          '2.A.1.a': { l: 6.5, i: 4.0 },
          '2.B.3.e': { l: 6.0, i: 3.5 },
        },
      }
      const zeroSkillUser: SkillsProfile = {
        skills: { '2.A.1.a': 1, '2.B.3.e': 1 },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const easy = matchOccupations(userProfile, [easyJob], 20, null, null, null, zeroSkillUser)
      const hard = matchOccupations(userProfile, [hardJob], 20, null, null, null, zeroSkillUser)
      expect(easy[0].skillsBonus).toBe(-0.25)
      expect(hard[0].skillsBonus).toBe(-0.25)
    })

    it('maxed user hits exactly +0.25 regardless of occupation complexity', () => {
      // Counterpart: the superhero always qualifies fully, regardless of
      // how demanding the job is.
      const easyJob: Occupation = {
        ...occupation('99-0000.07', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Easy Job'),
        skills: {
          '2.A.1.a': { l: 2.0, i: 4.0 },
          '2.B.3.e': { l: 1.5, i: 3.5 },
        },
      }
      const hardJob: Occupation = {
        ...occupation('99-0000.08', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Hard Job'),
        skills: {
          '2.A.1.a': { l: 6.5, i: 4.0 },
          '2.B.3.e': { l: 6.0, i: 3.5 },
        },
      }
      const maxedUser: SkillsProfile = {
        skills: { '2.A.1.a': 5, '2.B.3.e': 5 },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const easy = matchOccupations(userProfile, [easyJob], 20, null, null, null, maxedUser)
      const hard = matchOccupations(userProfile, [hardJob], 20, null, null, null, maxedUser)
      expect(easy[0].skillsBonus).toBe(0.25)
      expect(hard[0].skillsBonus).toBe(0.25)
    })

    it('median user (all 3s) hits exactly 0 bonus when the occupation has real requirements', () => {
      // Neutral anchor: a user who self-rates themselves at the scale
      // midpoint sits at bonus = 0. This only holds when the job has at
      // least one occNorm > 0.5, otherwise the median user has already
      // fully qualified (like the maxed user) and collapses to +0.25.
      const mixedJob: Occupation = {
        ...occupation('99-0000.10', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Mixed Job'),
        skills: { '2.A.1.a': { l: 5.0, i: 4.0 }, '2.B.3.e': { l: 4.0, i: 3.5 } },
      }
      const hardJob: Occupation = {
        ...occupation('99-0000.11', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Hard Job'),
        skills: { '2.A.1.a': { l: 6.5, i: 4.0 }, '2.B.3.e': { l: 6.0, i: 3.5 } },
      }
      const medianUser: SkillsProfile = {
        skills: { '2.A.1.a': 3, '2.B.3.e': 3 },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const mixed = matchOccupations(userProfile, [mixedJob], 20, null, null, null, medianUser)
      const hard = matchOccupations(userProfile, [hardJob], 20, null, null, null, medianUser)
      expect(mixed[0].skillsBonus).toBe(0)
      expect(hard[0].skillsBonus).toBe(0)
    })

    it('weak-mixed user (all 2s) lands in the negative half of the bonus range', () => {
      // Below-median but above-floor user: must land in (-0.25, 0). The
      // prior floor-only formula gave this user small positive bonuses
      // on average-complexity jobs because 0.25 userNorm already beat
      // the zero-skill floor.
      const avgJob: Occupation = {
        ...occupation('99-0000.12', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Avg Job'),
        skills: {
          '2.A.1.a': { l: 4.0, i: 4.0 },
          '2.B.3.e': { l: 3.5, i: 3.5 },
          '2.A.2.a': { l: 4.5, i: 4.2 },
        },
      }
      const weakUser: SkillsProfile = {
        skills: { '2.A.1.a': 2, '2.B.3.e': 2, '2.A.2.a': 2 },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const results = matchOccupations(userProfile, [avgJob], 20, null, null, null, weakUser)
      expect(results[0].skillsBonus!).toBeLessThan(0)
      expect(results[0].skillsBonus!).toBeGreaterThan(-0.25)
    })

    it('floor-calibration rewards importance-weighted matching in mixed profiles', () => {
      // A user who nails the high-importance elements and flunks the
      // low-importance ones should land close to +0.25 — the bonus follows
      // the importance-weighted gap, not the raw count of matched items.
      const weightedJob: Occupation = {
        ...occupation('99-0000.09', { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }, 'Weighted Job'),
        skills: {
          'imp-1': { l: 6.0, i: 5.0 }, // critical
          'imp-2': { l: 6.0, i: 5.0 }, // critical
          'low-1': { l: 2.0, i: 1.0 }, // peripheral
          'low-2': { l: 2.0, i: 1.0 }, // peripheral
        },
      }
      const focusedUser: SkillsProfile = {
        skills: { 'imp-1': 5, 'imp-2': 5, 'low-1': 1, 'low-2': 1 },
        abilities: {},
        knowledge: {},
      }
      const userProfile: RIASECProfile = { R: 3, I: 3, A: 3, S: 3, E: 3, C: 3 }
      const results = matchOccupations(userProfile, [weightedJob], 20, null, null, null, focusedUser)
      // Max-weight items at sim=1, low-weight items at sim=1 too (user
      // meets occ level 2 with value 1 via asymmetric: userNorm=0 < occNorm
      // =0.286 → sim=0.714). Floor = 1 − (0.857×10 + 0.286×2)/12 = 0.239.
      // match = (1×10 + 0.714×2)/12 = 0.952. Normalized = (0.952−0.239)/
      // 0.761 = 0.937. bonus = (0.937 − 0.5)×0.5 = 0.219.
      expect(results[0].skillsBonus!).toBeGreaterThan(0.2)
      expect(results[0].skillsBonus!).toBeLessThanOrEqual(0.25)
    })
  })
})
