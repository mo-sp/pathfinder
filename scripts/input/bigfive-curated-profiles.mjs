/**
 * Hand-curated Big Five profiles for the 14 corpus O*NET codes that have no
 * ESCO-crosswalk row at all (Bucket A in scripts/audit/bigfive-coverage-gap.mjs).
 * Without this file these codes show no Big-Five score-delta at runtime —
 * the ISCO-3d/2d cascade and the SOC-detail-sibling fallback both require
 * at least one mapped sibling and can't reach Bucket A.
 *
 * Authoring methodology (anchor + tweak):
 *   1. Pick the closest 4d-direct Anni-mapped O*NET code as anchor — same
 *      role family, comparable training tier and work context.
 *   2. Optionally tweak ±1-2 T-score points on individual dimensions where
 *      the target role differs from the anchor in a documented way.
 *   3. Document the anchor + reasoning in `_notes`. T-scores follow the Anni
 *      scale (mean = 50, SD = 10).
 *
 * Future-proofing — the override is conditional:
 *   build-bigfive-profiles.mjs applies a curated entry ONLY when no profile
 *   was produced via 4d-direct, 3d-imputed, 2d-imputed, or soc-sibling
 *   tiers. The moment a future O*NET / ESCO crosswalk update gives one of
 *   these codes a real ISCO-4d partner with Anni data, the curated override
 *   is skipped silently.
 */

const SRC = 'pathfinder-curated-2026-05'

export default {
  '11-9131.00': {
    _source: SRC,
    _notes: 'Postmasters: anchor 11-3071 Logistics/Distribution Manager — same operations-management role, applied to mail rather than cargo.',
    openness: 48.30, conscientiousness: 51.36, extraversion: 48.63, agreeableness: 48.41, neuroticism: 49.46,
  },

  '13-1022.00': {
    _source: SRC,
    _notes: 'Wholesale/Retail Buyers: anchor 13-1023 Purchasing Agents — adjacent SOC, near-identical role split only by B2C-vs-B2B distinction.',
    openness: 49.25, conscientiousness: 51.00, extraversion: 50.97, agreeableness: 49.50, neuroticism: 51.05,
  },

  '13-1074.00': {
    _source: SRC,
    _notes: 'Farm Labor Contractors: anchor 13-1071 HR Specialists — labor-brokerage as core task. Tweak: O −1 (less office-bound, more field coordination than typical HR).',
    openness: 48.43, conscientiousness: 51.34, extraversion: 53.53, agreeableness: 50.97, neuroticism: 50.75,
  },

  '23-1022.00': {
    _source: SRC,
    _notes: 'Arbitrators/Mediators: anchor 21-1014 Mental Health Social Workers — active listening, empathic conflict-handling, neutrality. Tweak: C +2 (procedural rigor of arbitration), N −1 (emotional regulation under acute conflict is more central than for general counseling).',
    openness: 51.18, conscientiousness: 51.28, extraversion: 53.49, agreeableness: 52.75, neuroticism: 50.51,
  },

  '25-9021.00': {
    _source: SRC,
    _notes: 'Farm/Home Management Educators: anchor 21-1091 Health Educators — extension-style community education, applied to household and agricultural management instead of health.',
    openness: 50.41, conscientiousness: 50.13, extraversion: 52.87, agreeableness: 49.14, neuroticism: 51.97,
  },

  '33-9099.02': {
    _source: SRC,
    _notes: 'Retail Loss Prevention: anchor 33-9032 Security Guards — surveillance and detection in retail context. Tweak: A −1 (theft-detection mindset is more skeptical than generic guard duty).',
    openness: 50.00, conscientiousness: 50.18, extraversion: 47.85, agreeableness: 46.63, neuroticism: 49.08,
  },

  '35-9011.00': {
    _source: SRC,
    _notes: 'Cafeteria Attendants/Bartender Helpers: anchor 35-9021 Dishwashers — same helper-tier kitchen/dining-room role, comparable training-required level.',
    openness: 45.30, conscientiousness: 49.69, extraversion: 48.79, agreeableness: 52.04, neuroticism: 52.68,
  },

  '39-1022.00': {
    _source: SRC,
    _notes: 'First-Line Supervisors of Personal Service Workers: anchor 39-1014 Entertainment/Recreation Supervisors — sibling First-Line-Supervisor SOC in the same Personal-Service major group.',
    openness: 50.67, conscientiousness: 50.01, extraversion: 53.62, agreeableness: 49.86, neuroticism: 49.48,
  },

  '47-2082.00': {
    _source: SRC,
    _notes: 'Tapers (drywall finishers): anchor 47-2141 Painters Construction — adjacent finishing trade, same training tier and physical work pattern.',
    openness: 46.77, conscientiousness: 48.98, extraversion: 49.30, agreeableness: 48.31, neuroticism: 49.95,
  },

  '49-2097.00': {
    _source: SRC,
    _notes: 'AV Equipment Installers: anchor 49-2098 Security/Fire-Alarm Installers — both install and wire low-voltage signal/electronic systems on customer premises.',
    openness: 48.74, conscientiousness: 49.14, extraversion: 46.38, agreeableness: 47.44, neuroticism: 47.62,
  },

  '49-9098.00': {
    _source: SRC,
    _notes: 'Helpers — Installation/Maintenance/Repair: anchor 49-9071 General Maintenance Workers — same task family one tier down (helper-tier vs. journeyman). Tweak: C −1, O −1 (helper-tier work is narrower in scope and decision latitude).',
    openness: 45.98, conscientiousness: 49.95, extraversion: 48.93, agreeableness: 50.57, neuroticism: 50.30,
  },

  '51-4192.00': {
    _source: SRC,
    _notes: 'Layout Workers Metal/Plastic: anchor 51-4041 Machinists — same precision-metalworking domain, similar training tier and tolerance for repetitive precision work.',
    openness: 48.71, conscientiousness: 47.44, extraversion: 43.78, agreeableness: 48.34, neuroticism: 45.91,
  },

  '53-6041.00': {
    _source: SRC,
    _notes: 'Traffic Technicians: anchor 17-3023 Electrical/Electronics Engineering Technicians — traffic-signal and ITS work is core automation/electronics-tech territory in DE practice (Verkehrstechnik = Automatisierungstechnik).',
    openness: 50.99, conscientiousness: 47.59, extraversion: 46.04, agreeableness: 48.01, neuroticism: 45.14,
  },

  '53-7011.00': {
    _source: SRC,
    _notes: 'Conveyor Operators: anchor 53-7065 Stockers — closest 4d-direct warehouse-tier operator profile. Tweak: C +1 (safety-critical machinery monitoring), O −1 (more routine than general warehouse stocking).',
    openness: 45.88, conscientiousness: 51.60, extraversion: 48.23, agreeableness: 49.23, neuroticism: 51.27,
  },
}
