import type { RIASECProfile, BigFiveProfile, ValuesProfile, Occupation, MatchResult } from '@entities/occupation/model/types'
import { pearsonCorrelation } from '@features/scoring/lib/pearson'
import { RIASEC_DIMENSIONS } from '@features/scoring/lib/riasec'
import { BIG_FIVE_DIMENSIONS } from '@features/scoring/lib/bigfive'
import {
  SKILLS_SUB_CATEGORIES,
  type SkillsProfile,
} from '@features/scoring/lib/skills'

/** Strength of the Big Five adjustment. 0.3 → additive adjustment in [−0.3, +0.3]. */
const BIG_FIVE_ALPHA = 0.3

/** Weight per soft values dimension. 7 dims × 0.05 = max 0.35 total penalty. */
const VALUES_DIMENSION_WEIGHT = 0.05

/**
 * Quadratic extremity-strength multiplier on the per-dimension penalty.
 * `strength = 1 + ((userValue − 3) / 2)² × β` produces:
 *   v=3 (egal)        → ×1.0  (no amplification — neutral users behave like before)
 *   v=2 or 4 (eher)   → ×1.375
 *   v=1 or 5 (ganz)   → ×2.5  (extreme answers act as Mitbestimmer alongside RIASEC/Skills)
 *
 * Rationale: a user choosing "always outdoor" expresses a much stronger
 * preference than one choosing "rather outdoor", and a user choosing 3
 * (egal) explicitly opts out — so penalties should grow non-linearly with
 * how committed the user is, not just with the raw distance to occupation
 * data. Archetype-persona session 2026-04-25 confirmed the asymmetry: P10
 * outdoor extreme now correctly pulls 45-Agrar codes into top-10 and pushes
 * indoor factory roles (Handziegelmacher) down; P12 median user is byte-
 * identically unchanged because all 3s ⇒ multiplier ≡ 1.
 */
const VALUES_STRENGTH_BETA = 1.5

function valuesStrength(userValue: number): number {
  return 1 + ((userValue - 3) / 2) ** 2 * VALUES_STRENGTH_BETA
}

/**
 * Centre point for the signed values contribution. Browser-test calibrated:
 * a mid-mid user (all values = 3) typically lands around 0.05–0.10 penalty
 * for a real occupation, so a 0.175 mathematical-midpoint had everyone
 * collecting positive contributions. 0.10 is closer to the empirical
 * median, so a one-dimension mismatch (e.g. outdoor want vs indoor job)
 * already drags the contribution slightly negative. With the strength
 * multiplier applied, range is [≈ −0.55, +0.10] for an extreme-opinion
 * user with full mismatch; a typical extreme-opinion user lands around
 * [−0.15, +0.05]. Penalty bites harder than bonus rewards, which fits the
 * asymmetry of workContext-mismatch in real life.
 */
const VALUES_CONTRIBUTION_CENTRE = 0.10

/**
 * User's education willingness (1-5 Likert) → max allowed KldB
 * Anforderungsniveau (1-4). Level 4 and 5 collapse to Anf 4 — Level 5 is the
 * "egal, alles" option where the filter disengages. Occupations whose
 * anforderungsniveau exceeds this cap are hard-filtered before scoring.
 */
const EDUCATION_TO_MAX_ANF: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 4 }

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
 * data skips that dimension (no penalty for unknowns). Returns null
 * when the occupation has no workContext at all — callers then abstain
 * from the values layer for that occupation (same pattern as skills)
 * rather than displaying a misleading "perfect match" / 0 penalty.
 */
function computeValuesPenalty(
  userValues: ValuesProfile,
  occupation: Occupation,
): number | null {
  const wc = occupation.workContext
  if (!wc) return null

  let penalty = 0

  // Environment: composite indoor/outdoor → 1 (very indoor) to 5 (very outdoor)
  const occEnv = Math.max(1, Math.min(5, (wc.outdoor - wc.indoor + 5) / 2))
  penalty += Math.abs(norm(userValues.environment) - norm(occEnv)) * VALUES_DIMENSION_WEIGHT * valuesStrength(userValues.environment)

  // Social interaction → Contact With Others (1-5)
  penalty += Math.abs(norm(userValues.socialInteraction) - norm(wc.contactWithOthers)) * VALUES_DIMENSION_WEIGHT * valuesStrength(userValues.socialInteraction)

  // Teamwork → Work With Team (1-5)
  penalty += Math.abs(norm(userValues.teamwork) - norm(wc.teamwork)) * VALUES_DIMENSION_WEIGHT * valuesStrength(userValues.teamwork)

  // Physical demands → avg(standing, walking) (1-5)
  const occPhysical = (wc.standing + wc.walking) / 2
  penalty += Math.abs(norm(userValues.physicalDemands) - norm(occPhysical)) * VALUES_DIMENSION_WEIGHT * valuesStrength(userValues.physicalDemands)

  // Autonomy → Freedom to Make Decisions (1-5)
  penalty += Math.abs(norm(userValues.autonomy) - norm(wc.autonomy)) * VALUES_DIMENSION_WEIGHT * valuesStrength(userValues.autonomy)

  // Public contact → Deal With Public (1-5)
  penalty += Math.abs(norm(userValues.publicContact) - norm(wc.publicContact)) * VALUES_DIMENSION_WEIGHT * valuesStrength(userValues.publicContact)

  // Routine: INVERTED — user 5 (variety) matches occupation LOW routine.
  // User 1 (routine) matches occupation HIGH routine.
  penalty += Math.abs(norm(userValues.routine) - (1 - norm(wc.routine))) * VALUES_DIMENSION_WEIGHT * valuesStrength(userValues.routine)

  return Math.round(penalty * 1000) / 1000
}

/**
 * Compute the skills match score for one occupation, along with two
 * reference points used to calibrate the bonus piecewise.
 *
 *   userNorm    = (userValue - 1) / 4                       ∈ [0, 1]
 *   occNorm     = occ.l / 7                                 ∈ [0, 1]
 *   sim_i(u)    = 1 − max(0, occNorm − u)                   ∈ [0, 1]
 *   weight_i    = occ.i                                     ∈ [1, 5]
 *   match       = Σ sim_i(userNorm) × w_i / Σ w_i           ∈ [floor, 1]
 *   floor       = match for userNorm=0 (= 1 − avg occNorm)  ∈ [0, 1]
 *   neutral     = match for userNorm=0.5 (all-3s user)      ∈ [floor, 1]
 *
 * Asymmetric sim: the penalty only fires when the user falls *below*
 * the occupation's required level; meeting or exceeding gives sim=1
 * ("you qualify"). So match saturates at 1 from above.
 *
 * The caller uses these three anchors for a piecewise bonus: floor →
 * −α/2, neutral → 0, 1 → +α/2. Linear between them. This makes a
 * zero-skill user (all 1s) always hit the full malus, a median user
 * (all 3s) always sit at zero bonus, and a maxed user always hit the
 * full plus, regardless of how demanding the occupation is.
 *
 * Returns null when the occupation has no skills data at all, or when
 * the user has not rated any elements the occupation lists.
 */
function computeSkillsMatch(
  userSkills: SkillsProfile,
  occupation: Occupation,
): { match: number; floor: number; neutral: number } | null {
  let totalSim = 0
  let totalNeutralSim = 0
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
      const neutralSim = 1 - Math.max(0, occNorm - 0.5)
      const weight = occEntry.i
      totalSim += sim * weight
      totalNeutralSim += neutralSim * weight
      totalOccNorm += occNorm * weight
      totalWeight += weight
    }
  }
  if (totalWeight === 0) return null
  return {
    match: totalSim / totalWeight,
    floor: 1 - totalOccNorm / totalWeight,
    neutral: totalNeutralSim / totalWeight,
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
 * provided, each occupation that has a Big Five target profile gets an
 * additive adjustment: `α × pearson(userBigFive, occBigFive)` ∈ [−α, +α].
 * The fitScore becomes `riasecCorrelation + adjustment`, shifting matched
 * personalities up and mismatched ones down. Additive (not multiplicative)
 * so a matching personality never amplifies a negative RIASEC base, and a
 * mismatched one never rescues it by dampening magnitude — the signs
 * behave intuitively across the full RIASEC range [−1, +1].
 *
 * When a values profile is provided, occupations whose KldB
 * Anforderungsniveau exceeds the user's education willingness are
 * hard-filtered. Remaining occupations receive soft penalties for mismatched
 * work-context preferences, subtracted from fitScore.
 *
 * When a skills profile is provided, each occupation with skills data
 * gets a weighted similarity score `match`. Piecewise-linear bonus with
 * three per-occupation anchors (floor → −α/2, neutral → 0, 1 → +α/2)
 * maps it to the fitScore range [−0.25, +0.25]. See `computeSkillsMatch`
 * for the anchor derivation.
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

  // Hard filter: eliminate occupations whose training requirement exceeds
  // the user's willingness. Driven by KldB Anforderungsniveau (Layer 3 data
  // source); occupations without an Anforderungsniveau pass through.
  const eligible = useValues
    ? occupations.filter((occ) => {
        if (occ.anforderungsniveau == null) return true
        const maxAnf = EDUCATION_TO_MAX_ANF[userValues.education] ?? 4
        return occ.anforderungsniveau <= maxAnf
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
        bigFiveModifier = BIG_FIVE_ALPHA * similarity
        fitScore = riasecCorrelation + bigFiveModifier
      }
    }

    let valuesContribution: number | null = null
    if (useValues) {
      const penalty = computeValuesPenalty(userValues, occupation)
      if (penalty != null) {
        // Map penalty [0, ~0.35] to a signed contribution centred at the
        // empirical median penalty (see CENTRE doc). Perfect match awards
        // +CENTRE; mismatch goes negative.
        valuesContribution = VALUES_CONTRIBUTION_CENTRE - penalty
        fitScore += valuesContribution
      }
    }

    let skillsMatch: number | null = null
    let skillsBonus: number | null = null
    if (useSkills) {
      const s = computeSkillsMatch(userSkills, occupation)
      if (s != null) {
        skillsMatch = s.match
        const half = SKILLS_ALPHA / 2
        let raw: number
        if (s.match >= s.neutral) {
          const upSpan = 1 - s.neutral
          // upSpan ≈ 0: occupation is so low-req that the median user
          // already maxes out. Anyone who reached this branch has fully
          // qualified (by the asymmetric match) → award full +α/2.
          raw = upSpan > 1e-6 ? ((s.match - s.neutral) / upSpan) * half : half
        } else {
          const downSpan = s.neutral - s.floor
          raw = downSpan > 1e-6 ? -((s.neutral - s.match) / downSpan) * half : 0
        }
        skillsBonus = Math.round(raw * 1000) / 1000
        fitScore += skillsBonus
      }
    }

    return {
      occupation,
      fitScore,
      riasecCorrelation,
      bigFiveModifier,
      valuesContribution,
      skillsMatch,
      skillsBonus,
      rank: 0,
    }
  })

  scored.sort((a, b) => b.fitScore - a.fitScore)
  return scored.slice(0, topN).map((m, i) => ({ ...m, rank: i + 1 }))
}
