# PROJECT.md – PathFinder

## Vision

Everyone deserves to find their calling – regardless of income, background, or education level. PathFinder is a free, deep career aptitude assessment that helps people discover careers aligned with their interests, personality, values, and abilities.

Inspired by the creator's own experience: decades of searching before finding his calling as a software developer. The existing career tests (from employment agencies and online) are either too superficial (5-minute quizzes) or locked behind paywalls.

## How It Works

### Assessment Layers

The assessment is a **progressive funnel**, not three separate tests. Each layer narrows and sharpens the results from the previous one. Users see their results update live as they complete each layer — the experience is one continuous journey that gets more precise the deeper you go.

1. **RIASEC Interests (Layer 1 – MVP):** 60 items from the O*NET Interest Profiler Short Form. Measures six interest dimensions: Realistic, Investigative, Artistic, Social, Enterprising, Conventional. This is the broadest filter — it reduces 923 occupations to ~80-100 realistic candidates (correlation > 0.5). Users see a first result ("Your profile is strongly Investigative-Artistic") but the occupation list is explicitly framed as a draft.

2. **Personality / Big Five (Layer 2 – Phase 2):** 50 IPIP-50 Big Five Factor Markers items (Goldberg 1992, Public Domain). Measures Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism with 10 items per dimension. Big Five **re-ranks within the RIASEC funnel** — it does not filter occupations out. Example: within a high-I/A candidate pool, an introverted + conscientious profile pushes Archivist and Data Analyst up, while an extraverted + open profile pushes Science Journalist and Museum Curator up.

3. **Values & Preferences (Layer 3 – Phase 2):** Custom items. Education willingness, indoor/outdoor, team/solo, security vs. freedom, income vs. meaning, mobility, physical demands. These act as **hard filters and weight adjustments**: "max 3 years training" eliminates Surgeon; "outdoor work preferred" eliminates lab-based roles; "income over meaning" shifts rankings.

4. **Skills Self-Assessment (Layer 4 – Phase 2):** Self-rated abilities matched against O*NET ability data per occupation. Provides a final reality-check layer — high interest + low self-assessed ability triggers a "you'd need to develop these skills" note rather than elimination.

### Progressive Scoring Architecture

The core principle: **each layer refines, not replaces**. A user who completes only Layer 1 gets useful results. A user who completes all layers gets highly differentiated results.

```
Score_final(occupation) =
    w1 × RIASEC_correlation          // Layer 1: base fit (Pearson, -1 to 1)
  + w2 × BigFive_modifier            // Layer 2: personality re-ranking multiplier
  + w3 × Skills_match                // Layer 4: ability alignment bonus
  − penalties(Values_conflicts)      // Layer 3: hard/soft constraint violations
```

**Layer interactions:**
- `RIASEC_correlation` is always the foundation. Without it, no scoring happens.
- `BigFive_modifier` is a multiplier, not an independent score. If an occupation typically requires high Extraversion and the user scores low, the fit score is dampened — but never zeroed out. This ensures Big Five refines rather than overrides RIASEC.
- `Values_conflicts` are the only source of hard eliminations (e.g. education duration exceeds willingness). Soft conflicts (e.g. "prefers outdoor" but occupation is mixed) apply a smaller penalty.
- `Skills_match` is additive — high skill alignment boosts a candidate, but low alignment doesn't eliminate it (instead triggers a "development needed" annotation).

**UX implication:** After each completed layer, the results page updates live. The user sees their top-20 shift and can understand why — "After your personality profile, Research Scientist moved up because your high Openness and low Extraversion match well."

### Optional: Adaptive Deepening

For users with ambiguous RIASEC profiles (e.g. three dimensions within 5 points of each other), the system can offer targeted follow-up questions from the O*NET Interest Profiler Long Form (180 items total, 30 per dimension) — but only for the ambiguous dimensions. This avoids forcing all users through 180 questions while giving unclear profiles more resolution.

### Data Flow

```
User answers questions (browser)
    → Responses stored in IndexedDB (Dexie.js)
    → Scoring engine computes RIASEC + Big5 profiles (Pinia store)
    → Matching engine correlates against occupation database (static JSON)
    → Results displayed with visualizations, updating after each layer
    → Optional: anonymous statistics sent to Supabase (opt-in, Phase 3)
```

## Data Model

### Core Types

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
  fitScore: number           // combined score
  riasecCorrelation: number  // Layer 1 component (Pearson, -1 to 1)
  bigFiveModifier?: number   // Layer 2 component (multiplier)
  skillsMatch?: number       // Layer 4 component
  valuesPenalty?: number     // Layer 3 component (subtracted)
  rank: number
  explanation?: string       // "Why this career fits you" (algorithmic, not AI)
}
```

## Roadmap Summary

| Phase | Focus | Timeline |
|-------|-------|----------|
| 1 | MVP: German RIASEC test + occupation matching | Months 1-3 |
| 2 | Depth: Big Five, values, skills, progressive scoring | Months 4-8 |
| 3 | Feedback: anonymous backend, data-driven improvements | Months 9-14 |
| 4 | International: English, more languages, SEO | Year 2+ |
| 5 | Professional: native apps, partnerships, research collaboration | Year 3+ |

See `docs/PROJECT_PLAN.md` for the full roadmap with detailed tasks.

## Licenses & Attribution

- **O*NET Interest Profiler:** O*NET Tools Developer License (modification allowed, attribution required)
- **O*NET Database:** CC BY 4.0 (attribution required)
- **ESCO:** EU Open Data (free to use)
- **IPIP Big Five:** Public Domain (no restrictions)

Attribution text (must appear somewhere accessible in the app):
> This site includes information from the O*NET Career Exploration Tools and O*NET Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Tools Developer License and CC BY 4.0. O*NET® is a trademark of USDOL/ETA.