# PROJECT.md – PathFinder

## Vision

Everyone deserves to find their calling – regardless of income, background, or education level. PathFinder is a free, deep career aptitude assessment that helps people discover careers aligned with their interests, personality, values, and abilities.

Inspired by the creator's own experience: decades of searching before finding his calling as a software developer. The existing career tests (from employment agencies and online) are either too superficial (5-minute quizzes) or locked behind paywalls.

## How It Works

### Assessment Layers

1. **RIASEC Interests (Layer 1 – MVP):** 60 items from the O*NET Interest Profiler Short Form. Measures six interest dimensions: Realistic, Investigative, Artistic, Social, Enterprising, Conventional.

2. **Personality / Big Five (Layer 2 – Phase 2):** 30 IPIP items. Measures Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism. Used as secondary filter for matching.

3. **Values & Preferences (Layer 3 – Phase 2):** Custom items. Education willingness, indoor/outdoor, team/solo, security vs. freedom, income vs. meaning, mobility, physical demands.

4. **Skills Self-Assessment (Layer 4 – Phase 2):** Self-rated abilities matched against O*NET ability data per occupation.

### Scoring Algorithm

```
1. Sum responses per RIASEC dimension (Likert 1-5, 10 items each → score 10-50)
2. Compute Pearson correlation between user RIASEC profile and each occupation's RIASEC profile
3. Filter by user preferences (Layer 3)
4. Weight with personality overlay (Layer 2) and skills match (Layer 4)
5. Return top-20 ranked occupations with fit scores and explanations
```

### Data Flow

```
User answers questions (browser)
    → Responses stored in IndexedDB (Dexie.js)
    → Scoring engine computes RIASEC + Big5 profiles (Pinia store)
    → Matching engine correlates against occupation database (static JSON)
    → Results displayed with visualizations
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
  answers: Answer[]
  riasecProfile?: RIASECProfile
  bigFiveProfile?: BigFiveProfile
  results?: MatchResult[]
}

interface Answer {
  questionId: string
  value: number
  answeredAt: Date
}

interface MatchResult {
  occupation: Occupation
  fitScore: number           // Pearson correlation (-1 to 1)
  rank: number
}
```

## Roadmap Summary

| Phase | Focus | Timeline |
|-------|-------|----------|
| 1 | MVP: German RIASEC test + occupation matching | Months 1-3 |
| 2 | Depth: Big Five, values, skills, better matching | Months 4-8 |
| 3 | Feedback: anonymous backend, data-driven improvements | Months 9-14 |
| 4 | International: English, more languages, SEO | Year 2+ |
| 5 | Professional: native apps, partnerships, optional monetization | Year 3+ |

See `docs/PROJECT_PLAN.md` for the full roadmap with detailed tasks.

## Licenses & Attribution

- **O*NET Interest Profiler:** O*NET Tools Developer License (modification allowed, attribution required)
- **O*NET Database:** CC BY 4.0 (attribution required)
- **ESCO:** EU Open Data (free to use)
- **IPIP Big Five:** Public Domain (no restrictions)

Attribution text (must appear somewhere accessible in the app):
> This site includes information from the O*NET Career Exploration Tools and O*NET Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Tools Developer License and CC BY 4.0. O*NET® is a trademark of USDOL/ETA.
