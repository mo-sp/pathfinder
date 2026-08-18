# PROJECT.md – PathFinder

## Vision

Everyone deserves to find their calling – regardless of income, background, or education level. PathFinder is a free, deep career aptitude assessment that helps people discover careers aligned with their interests, personality, values, and abilities.

Inspired by the creator's own experience: decades of searching before finding his calling as a software developer. The existing career tests (from employment agencies and online) are either too superficial (5-minute quizzes) or locked behind paywalls.

## How It Works

### Assessment Layers

The assessment is a **progressive funnel**, not four separate tests. Each layer narrows and sharpens the results from the previous one. Users see their results update live as they complete each layer — the experience is one continuous journey that gets more precise the deeper you go.

All four layers are implemented. 239 items in total.

1. **RIASEC Interests (Layer 1):** 60 items from the O*NET Interest Profiler Short Form. Measures six interest dimensions: Realistic, Investigative, Artistic, Social, Enterprising, Conventional. This is the base fit for every occupation — Pearson correlation between the user's profile and the occupation's. Users see a first result after this layer alone.

2. **Personality / Big Five (Layer 2):** 50 IPIP-50 Big Five Factor Markers items (Goldberg 1992, Public Domain). Measures Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism with 10 items per dimension. Big Five **re-ranks within the RIASEC funnel** — it does not filter occupations out.

3. **Rahmenbedingungen / Values (Layer 3):** 8 custom items — education level, indoor/outdoor, contact with people, team/solo, physical demands, autonomy, public contact, routine. The education answer is the **only hard filter in the app**: occupations whose KldB Anforderungsniveau exceeds the user's willingness are removed. The other seven produce a signed soft adjustment.

4. **Skills, Abilities & Knowledge (Layer 4):** 121 self-rated O*NET elements (35 skills, 52 abilities, 34 knowledge areas) matched against each occupation's requirements. Additive bonus only — a low self-rating never eliminates an occupation.

### Progressive Scoring Architecture

The core principle: **each layer refines, not replaces**. A user who completes only Layer 1 gets useful results. A user who completes all layers gets highly differentiated results.

Every contribution is **additive** — see `features/matching/lib/matcher.ts`, which is the authoritative version of this:

```
fitScore(occupation) =
    riasecCorrelation                // Layer 1: Pearson, -1 … +1
  + bigFiveModifier                  // Layer 2: 0.3 × pearson(userBF, occBF), ±0.3
  + valuesContribution               // Layer 3: 0.10 − penalty, +0.10 … −0.25
  + skillsBonus                      // Layer 4: piecewise-linear, ±0.25
```

**Layer interactions:**
- `riasecCorrelation` is always the foundation. Without it, no scoring happens. Because Pearson compares the *shape* of a profile rather than its height, a flat user profile makes single dimensions decisive — a known fragility, see BACKLOG.
- `bigFiveModifier` is **additive, not a multiplier**. A multiplier would let a matching personality amplify a negative RIASEC base and a mismatched one rescue it by dampening magnitude; additive keeps the signs intuitive across the full range. Null when the occupation has no Big Five target profile.
- Values are the only source of **hard elimination**, and only through the education answer against the occupation's KldB Anforderungsniveau. The other seven dimensions produce a signed contribution centred at +0.10, so a perfect match is rewarded and a mismatch goes negative — deliberately asymmetric and penalty-heavier.
- `skillsBonus` is derived from a weighted similarity between the user's self-ratings and the occupation's O*NET requirements, mapped through three per-occupation anchors. Additive; low alignment lowers rank but never removes.

**UX implication:** Results are recomputed after each completed layer, so the user watches their top-20 shift as the funnel deepens.

### Optional: Adaptive Deepening (idea, not implemented)

For users with ambiguous RIASEC profiles (e.g. three dimensions within 5 points of each other), the system can offer targeted follow-up questions from the O*NET Interest Profiler Long Form (180 items total, 30 per dimension) — but only for the ambiguous dimensions. This avoids forcing all users through 180 questions while giving unclear profiles more resolution.

### Data Flow

```
User answers questions (browser)
    → Responses stored in IndexedDB (Dexie.js)
    → Scoring engine computes RIASEC / Big Five / values / skills profiles (Pinia store)
    → Matching engine correlates against the occupation corpus (static JSON, lazily loaded)
    → Results displayed with visualizations, updating after each layer
    → Optional, explicit opt-in: anonymous feedback POSTed to our own
      /api/feedback endpoint (server/feedback/, self-hosted alongside the app)
```

Supabase was the original plan for the last step; the project ended up self-hosting a small dependency-free Node service instead, which keeps the data on the same box as the app and avoids a third-party processor.

## Data Model

### Core Types

The authoritative definitions live in `src/entities/occupation/model/types.ts` and
`src/entities/assessment/model/types.ts`. The sketch below shows the shape; where
the two disagree, the code is right.

```typescript
interface RIASECProfile {
  R: number  // Realistic     (10-50)
  I: number  // Investigative  (10-50)
  A: number  // Artistic       (10-50)
  S: number  // Social         (10-50)
  E: number  // Enterprising   (10-50)
  C: number  // Conventional   (10-50)
}

interface BigFiveProfile {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

interface Question {
  id: string
  layer: 'riasec' | 'bigfive' | 'values' | 'skills'
  dimension: string          // e.g. 'R', 'openness', 'teamwork'
  text: {
    de: string
    en?: string
  }
  scale: 'likert5' | 'likert7' | 'boolean'
  reverse?: boolean          // reverse-scored item
}

interface Occupation {
  onetCode: string           // e.g. "15-1252.00"
  escoUri?: string           // ESCO URI for EU mapping
  title: {
    de: string
    en: string
  }
  description?: {
    de: string
    en: string
  }
  riasecProfile: RIASECProfile
  jobZone: number            // 1-4 (education/training level)
  brightOutlook?: boolean    // growing field
}

interface AssessmentSession {
  id: string
  startedAt: Date
  completedAt?: Date
  currentLayer: 'riasec' | 'bigfive' | 'values' | 'skills'
  answers: Answer[]
  riasecProfile?: RIASECProfile
  bigFiveProfile?: BigFiveProfile
  valuesProfile?: ValuesProfile
  results?: MatchResult[]
}

interface Answer {
  questionId: string
  value: number
  answeredAt: Date
}

interface MatchResult {
  occupation: Occupation
  fitScore: number                  // sum of the four components below
  riasecCorrelation: number         // Layer 1: Pearson, -1 to 1
  bigFiveModifier: number | null    // Layer 2: additive, ±0.3; null without a target profile
  valuesContribution: number | null // Layer 3: signed, +0.10 … −0.25
  skillsMatch: number | null        // Layer 4: raw similarity, 0-1
  skillsBonus: number | null        // Layer 4: the additive part, ±0.25
  rank: number
}
```

## Roadmap Summary

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | MVP: German RIASEC test + occupation matching | **done** |
| 2 | Depth: Big Five, values, skills, progressive scoring | **done** — all four layers live |
| 3 | Feedback: anonymous backend, data-driven improvements | **in progress** — endpoint and opt-in card live, closed friends-beta running, first submissions arriving |
| 4 | International: English, more languages, SEO | not started; no longer blocked, the public launch shipped 2026-08-18 |
| 5 | Professional: native apps, partnerships, research collaboration | not started |

The phase timeline from the original plan is dropped — it was written in month 1 and the project has not tracked it. `BACKLOG.md` holds what is queued, `SUMMARY.md` what was built when, and `docs/PROJECT_PLAN.md` is kept as the historical April 2026 plan.

## Licenses & Attribution

- **O*NET Interest Profiler:** O*NET Tools Developer License (modification allowed, attribution required)
- **O*NET Database:** CC BY 4.0 (attribution required)
- **ESCO:** EU Open Data (free to use)
- **IPIP Big Five:** Public Domain (no restrictions)

Attribution text (must appear somewhere accessible in the app):
> This site includes information from the O*NET Career Exploration Tools and O*NET Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Tools Developer License and CC BY 4.0. O*NET® is a trademark of USDOL/ETA.