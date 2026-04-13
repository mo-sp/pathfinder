import type { RIASECProfile, BigFiveProfile, ValuesProfile, Occupation, MatchResult } from '@entities/occupation/model/types'
import { pearsonCorrelation } from '@features/scoring/lib/pearson'
import { RIASEC_DIMENSIONS } from '@features/scoring/lib/riasec'
import { BIG_FIVE_DIMENSIONS } from '@features/scoring/lib/bigfive'
import {
  SKILLS_SUB_CATEGORIES,
  type SkillsProfile,
} from '@features/scoring/lib/skills'

/** Strength of the Big Five modifier. 0.3 → modifier range [0.7, 1.3]. */
const BIG_FIVE_ALPHA = 0.3

/** Weight per soft values dimension. 7 dims × 0.05 = max 0.35 total penalty. */
const VALUES_DIMENSION_WEIGHT = 0.05

/**
 * Skills bonus magnitude. The normalized gap (match − floor)/(1 − floor)
 * ∈ [0, 1] maps to bonus ∈ [-SKILLS_ALPHA/2, +SKILLS_ALPHA/2]. With
 * SKILLS_ALPHA = 0.5 the bonus swings ±0.25. A perfectly matched skills
 * profile beats a perfectly mismatched one by 0.5 in the final fitScore,
 * enough to move an occupation ±10 ranks in a typical top-20 on a
 * mid-density RIASEC correlation (~0.6).
 */
const SKILLS_ALPHA = 0.5

/** Normalize a 1-5 value to 0-1 range. */
function norm(value: number): number {
  return (value - 1) / 4
}

/**
 * Compute the soft values penalty for one occupation. Each dimension
 * contributes abs(userNorm - occNorm) × WEIGHT. Missing occupation
 * data skips that dimension (no penalty for unknowns).
 */
function computeValuesPenalty(
  userValues: ValuesProfile,
  occupation: Occupation,
): number {
  const wc = occupation.workContext
  if (!wc) return 0

  let penalty = 0

  // Environment: composite indoor/outdoor → 1 (very indoor) to 5 (very outdoor)
  const occEnv = Math.max(1, Math.min(5, (wc.outdoor - wc.indoor + 5) / 2))
  penalty += Math.abs(norm(userValues.environment) - norm(occEnv)) * VALUES_DIMENSION_WEIGHT

  // Social interaction → Contact With Others (1-5)
  penalty += Math.abs(norm(userValues.socialInteraction) - norm(wc.contactWithOthers)) * VALUES_DIMENSION_WEIGHT

  // Teamwork → Work With Team (1-5)
  penalty += Math.abs(norm(userValues.teamwork) - norm(wc.teamwork)) * VALUES_DIMENSION_WEIGHT

  // Physical demands → avg(standing, walking) (1-5)
  const occPhysical = (wc.standing + wc.walking) / 2
  penalty += Math.abs(norm(userValues.physicalDemands) - norm(occPhysical)) * VALUES_DIMENSION_WEIGHT

  // Autonomy → Freedom to Make Decisions (1-5)
  penalty += Math.abs(norm(userValues.autonomy) - norm(wc.autonomy)) * VALUES_DIMENSION_WEIGHT

  // Public contact → Deal With Public (1-5)
  penalty += Math.abs(norm(userValues.publicContact) - norm(wc.publicContact)) * VALUES_DIMENSION_WEIGHT

  // Routine: INVERTED — user 5 (variety) matches occupation LOW routine.
  // User 1 (routine) matches occupation HIGH routine.
  penalty += Math.abs(norm(userValues.routine) - (1 - norm(wc.routine))) * VALUES_DIMENSION_WEIGHT

  return Math.round(penalty * 1000) / 1000
}

/**
 * Compute the skills match score for one occupation, along with the
 * occupation's zero-skill floor used to calibrate the bonus.
 *
 *   userNorm   = (userValue - 1) / 4                      ∈ [0, 1]
 *   occNorm    = occ.l / 7                                ∈ [0, 1]
 *   sim_i      = 1 − max(0, occNorm − userNorm)           ∈ [0, 1]
 *   weight_i   = occ.i                                    ∈ [1, 5]
 *   match      = Σ sim_i × weight_i / Σ weight_i          ∈ [0, 1]
 *   floor      = 1 − Σ occNorm_i × weight_i / Σ weight_i  ∈ [0, 1]
 *
 * Asymmetric sim: the penalty only fires when the user falls *below*
 * the occupation's required level; meeting or exceeding gives sim=1
 * ("you qualify"). This means match ∈ [floor, 1] always, where floor
 * is what an all-1s user would score on this occupation (= 1 minus the
 * weighted-average required level). The caller uses floor to re-center
 * the bonus so that a zero-skill user always hits −SKILLS_ALPHA/2 and a
 * maxed user always hits +SKILLS_ALPHA/2, independent of how demanding
 * the occupation is.
 *
 * Returns null when the occupation has no skills data at all, or when
 * the user has not rated any elements the occupation lists.
 */
function computeSkillsMatch(
  userSkills: SkillsProfile,
  occupation: Occupation,
): { match: number; floor: number } | null {
  let totalSim = 0
  let totalOccNorm = 0
  let totalWeight = 0
  for (const sub of SKILLS_SUB_CATEGORIES) {
    const occSub = occupation[sub]
    if (!occSub) continue
    const userSub = userSkills[sub]
    for (const elementId in occSub) {
      const userValue = userSub[elementId]
      if (userValue == null) continue
      const occEntry = occSub[elementId]
      const userNorm = (userValue - 1) / 4
      const occNorm = occEntry.l / 7
      const sim = 1 - Math.max(0, occNorm - userNorm)
      const weight = occEntry.i
      totalSim += sim * weight
      totalOccNorm += occNorm * weight
      totalWeight += weight
    }
  }
  if (totalWeight === 0) return null
  return {
    match: totalSim / totalWeight,
    floor: 1 - totalOccNorm / totalWeight,
  }
}

/**
 * Rank occupations by RIASEC fit, optionally re-ranked by Big Five
 * personality similarity, filtered/penalized by values preferences, and
 * nudged by skills-match bonuses.
 *
 * Base fit is Pearson correlation between the user's RIASEC profile and
 * each occupation's RIASEC profile (scale-invariant, so raw Likert sums
 * and O*NET's 1-7 OI values compare directly).
 *
 * When a user Big Five profile and occupation Big Five lookup are
 * provided, each occupation that has a Big Five target profile gets a
 * modifier: `1 + α × pearson(userBigFive, occBigFive)`. The fitScore
 * becomes `riasecCorrelation × modifier`, shifting matched personalities
 * up and mismatched ones down without ever zeroing out RIASEC fit.
 *
 * When a values profile is provided, occupations whose jobZone exceeds
 * the user's education willingness are hard-filtered. Remaining
 * occupations receive soft penalties for mismatched work-context
 * preferences, subtracted from fitScore.
 *
 * When a skills profile is provided, each occupation with skills data
 * gets a weighted similarity score in [floor, 1] (where floor = what an
 * all-1s user would score on this occupation), mapped via per-occupation
 * floor calibration to a bonus in [−0.25, +0.25] and added to the final
 * fitScore. See `computeSkillsMatch` for the match/floor derivation.
 */
export function matchOccupations(
  userProfile: RIASECProfile,
  occupations: Occupation[],
  topN = 20,
  userBigFive?: BigFiveProfile | null,
  occBigFiveProfiles?: Record<string, BigFiveProfile> | null,
  userValues?: ValuesProfile | null,
  userSkills?: SkillsProfile | null,
): MatchResult[] {
  const userVector = RIASEC_DIMENSIONS.map((d) => userProfile[d])
  const useBigFive = !!userBigFive && !!occBigFiveProfiles
  const useValues = !!userValues
  const useSkills = !!userSkills

  // Hard filter: eliminate occupations that exceed education willingness
  const eligible = useValues
    ? occupations.filter((occ) => {
        if (occ.jobZone == null) return true
        return occ.jobZone <= userValues.education
      })
    : occupations

  const scored = eligible.map<MatchResult>((occupation) => {
    const occVector = RIASEC_DIMENSIONS.map((d) => occupation.riasecProfile[d])
    const riasecCorrelation = pearsonCorrelation(userVector, occVector)

    let bigFiveModifier: number | null = null
    let fitScore = riasecCorrelation

    if (useBigFive) {
      const occBigFive = occBigFiveProfiles[occupation.onetCode]
      if (occBigFive) {
        const userBfVector = BIG_FIVE_DIMENSIONS.map((d) => userBigFive[d])
        const occBfVector = BIG_FIVE_DIMENSIONS.map((d) => occBigFive[d])
        const similarity = pearsonCorrelation(userBfVector, occBfVector)
        bigFiveModifier = 1 + BIG_FIVE_ALPHA * similarity
        fitScore = Math.min(riasecCorrelation * bigFiveModifier, 1)
      }
    }

    let valuesPenalty: number | null = null
    if (useValues) {
      valuesPenalty = computeValuesPenalty(userValues, occupation)
      fitScore -= valuesPenalty
    }

    let skillsMatch: number | null = null
    let skillsBonus: number | null = null
    if (useSkills) {
      const s = computeSkillsMatch(userSkills, occupation)
      if (s != null) {
        skillsMatch = s.match
        const span = 1 - s.floor
        // span ≈ 0 means occupation has no real requirements (all occNorm
        // ≈ 0, floor ≈ 1). No skills signal to read either way → neutral.
        const normalized = span > 1e-6 ? (s.match - s.floor) / span : 0.5
        skillsBonus = Math.round(((normalized - 0.5) * SKILLS_ALPHA) * 1000) / 1000
        fitScore += skillsBonus
      }
    }

    return {
      occupation,
      fitScore,
      riasecCorrelation,
      bigFiveModifier,
      valuesPenalty,
      skillsMatch,
      skillsBonus,
      rank: 0,
    }
  })

  scored.sort((a, b) => b.fitScore - a.fitScore)
  return scored.slice(0, topN).map((m, i) => ({ ...m, rank: i + 1 }))
}
