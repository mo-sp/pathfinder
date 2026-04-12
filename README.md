# PathFinder (working title)

> *Everyone deserves to find their calling – regardless of income, background, or education level.*

PathFinder is a free, privacy-first career aptitude assessment that helps people discover careers aligned with their interests, personality, values, and abilities.

**🚧 Early development — not yet publicly released.**

## Why?

Existing career tests are either five-minute quizzes that tell you nothing meaningful, or locked behind paywalls. PathFinder aims to be different: a deep, multi-layered assessment based on validated psychometric research — completely free, no login, no tracking, no ads. Ever.

## How It Works

The assessment is a **progressive funnel** — each layer refines the results from the previous one:

1. **RIASEC Interests** — 60 items from the O\*NET Interest Profiler. Identifies your core interest dimensions and produces a first set of career matches.
2. **Big Five Personality** *(Phase 2)* — 50 IPIP items. Re-ranks careers based on personality fit (e.g. introversion favors research roles over sales).
3. **Values & Preferences** *(Phase 2)* — Custom items. Filters by hard constraints (max education duration, indoor/outdoor, team/solo) and soft preferences.
4. **Skills Self-Assessment** *(Phase 2)* — Matches self-rated abilities against occupation requirements.

All scoring is **deterministic and algorithmic** — no AI-generated results. Your data **never leaves your browser** (stored in IndexedDB via Dexie.js).

## Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite
- **State:** Pinia
- **Persistence:** Dexie.js (IndexedDB)
- **Styling:** Tailwind CSS
- **Architecture:** Feature-Sliced Design
- **i18n:** vue-i18n (German first, infrastructure ready for more languages)

## Data Sources & Licenses

| Source | License | Usage |
|--------|---------|-------|
| [O\*NET Interest Profiler](https://www.onetcenter.org/IP.html) (Short Form, 60 items) | O\*NET Developer License | RIASEC questionnaire |
| [O\*NET Database](https://www.onetcenter.org/database.html) (900+ occupations) | CC BY 4.0 | Occupation RIASEC profiles, job zones |
| [ESCO](https://esco.ec.europa.eu/) (EU occupation taxonomy) | EU Open Data | German occupation names, O\*NET mapping |
| [IPIP-50 Big Five Factor Markers](https://ipip.ori.org/) | Public Domain | Personality assessment (Phase 2) |

> This site includes information from the O\*NET Career Exploration Tools and O\*NET Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O\*NET Tools Developer License and CC BY 4.0. O\*NET® is a trademark of USDOL/ETA.

## Development

```bash
npm install          # Install dependencies
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
npm test             # Vitest (32 tests)
```

## Project Status

**Phase 1 (MVP):** German RIASEC test with occupation matching — in progress.

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the full roadmap.

## Financing

PathFinder is and will remain **completely free** — no paywall, no ads, no tracking, no commercial monetization, funded by donations only.

## License

MIT
