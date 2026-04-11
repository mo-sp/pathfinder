import type { RIASECProfile, Occupation, MatchResult } from '@entities/occupation/model/types'
import { pearsonCorrelation } from '@features/scoring/lib/pearson'
import { RIASEC_DIMENSIONS } from '@features/scoring/lib/riasec'

/**
 * Rank occupations by Pearson correlation between the user's RIASEC profile
 * and each occupation's RIASEC profile. Pearson is scale-invariant so the
 * user's raw Likert sums and O*NET's 1-7 OI values can be compared directly.
 */
export function matchOccupations(
  userProfile: RIASECProfile,
  occupations: Occupation[],
  topN = 20,
): MatchResult[] {
  const userVector = RIASEC_DIMENSIONS.map((d) => userProfile[d])

  const scored = occupations.map<MatchResult>((occupation) => {
    const occVector = RIASEC_DIMENSIONS.map((d) => occupation.riasecProfile[d])
    const fitScore = pearsonCorrelation(userVector, occVector)
    return { occupation, fitScore, rank: 0 }
  })

  scored.sort((a, b) => b.fitScore - a.fitScore)
  return scored.slice(0, topN).map((m, i) => ({ ...m, rank: i + 1 }))
}
