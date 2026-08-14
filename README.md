# PathFinder

> *Everyone deserves to find their calling – regardless of income, background, or education level.*

PathFinder is a free, privacy-first career aptitude assessment that helps people discover careers aligned with their interests, personality, values, and abilities.

**Status: closed friends-beta.** The app is live at `pathfinder-berufetest.de`, but `noindex` and shared by link only. All four assessment layers are implemented and the scoring pipeline is complete; what is deliberately still missing for a public launch is an Impressum and a full Datenschutzerklärung.

## Why?

Existing career tests are either five-minute quizzes that tell you nothing meaningful, or locked behind paywalls. PathFinder aims to be different: a deep, multi-layered assessment based on validated psychometric research — completely free, no login, no tracking, no ads. Ever.

## How It Works

The assessment is a **progressive funnel** — each layer refines the results from the previous one, and a user who stops after layer 1 still gets a usable result. 239 items in total, about 25 to 45 minutes:

1. **RIASEC Interests** — 60 items from the O\*NET Interest Profiler Short Form. Pearson correlation between your profile and each occupation's establishes the base fit. Every one of these 60 items was reviewed individually in 2026 and 33 were rewritten.
2. **Big Five Personality** — 50 IPIP items. Adds a signed adjustment of at most ±0.3 based on how closely your personality matches the occupation's profile. It re-ranks; it never eliminates.
3. **Rahmenbedingungen (Values & Preferences)** — 8 items covering education level, indoor/outdoor, contact with people, teamwork, physical demands, autonomy, public contact and routine. The education answer is the app's **only hard filter**: occupations demanding more training than you are willing to invest drop out. The other seven apply soft, signed adjustments.
4. **Skills, Abilities & Knowledge** — 121 self-rated O\*NET elements (35 skills, 52 abilities, 34 knowledge areas), matched against each occupation's requirements as a bonus in ±0.25. Low self-ratings never eliminate an occupation.

All scoring is **deterministic and algorithmic** — no AI-generated results, and the same answers always produce the same ranking. Your answers stay in your browser (IndexedDB via Dexie.js); nothing is transmitted unless you explicitly submit the optional beta feedback.

## Privacy

- No login, no accounts, no cookies, no analytics, no external resources — no fonts, CDNs or trackers are loaded.
- Answers and results are computed and stored locally in your browser.
- The only data that can leave the browser is a **voluntary beta-feedback submission** from the results page: your answers, your computed profiles and your top 20, with no name, no email, no IP and no per-answer timestamps.
- The web server's access log truncates client IPs to /24 (IPv4) or /48 (IPv6) before writing a line.
- Details in the app under `/datenschutz`.

## Tech Stack

- **Frontend:** Vue 3 + TypeScript + Vite
- **State:** Pinia
- **Persistence:** Dexie.js (IndexedDB)
- **Styling:** Tailwind CSS
- **Architecture:** Feature-Sliced Design
- **i18n:** vue-i18n (German first, infrastructure ready for more languages)
- **Feedback endpoint:** a small dependency-free Node service in `server/feedback/`
- **Hosting:** self-hosted on Hetzner Cloud via Coolify — Docker build, nginx serving the static bundle, Let's Encrypt TLS

## Data Sources & Licenses

| Source | License | Usage |
|--------|---------|-------|
| [O\*NET Interest Profiler](https://www.onetcenter.org/IP.html) (Short Form, 60 items) | O\*NET Developer License | RIASEC questionnaire |
| [O\*NET Database](https://www.onetcenter.org/database.html) (923 occupations) | CC BY 4.0 | Occupation RIASEC profiles, skills/abilities/knowledge, work context, job zones |
| [ESCO](https://esco.ec.europa.eu/) (EU occupation taxonomy) | EU Open Data | German occupation names, O\*NET mapping |
| [IPIP-50 Big Five Factor Markers](https://ipip.ori.org/) | Public Domain | Personality assessment |
| [KldB 2010](https://statistik.arbeitsagentur.de/) (Bundesagentur für Arbeit) | Official statistics | German occupation classification, Anforderungsniveau |
| [BIBB Ausbildungsberufe](https://www.bibb.de/) | BIBB | Matching recognised German apprenticeships to occupations |

> This site includes information from the O\*NET Career Exploration Tools and O\*NET Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O\*NET Tools Developer License and CC BY 4.0. O\*NET® is a trademark of USDOL/ETA.

## Development

```bash
npm install          # Install dependencies
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
npm test             # Vitest (258 tests)
```

The occupation corpus is generated, not hand-maintained: `scripts/` builds `src/data/*.json` from the raw O\*NET, ESCO, KldB and BIBB sources, with curated override files for the cases the automatic mapping gets wrong.

## Project Status

All four layers, the results page, the export and the beta-feedback channel are live. Current work is calibration and content quality rather than new features — see `BACKLOG.md` for what is queued and `SUMMARY.md` for what was built when.

`docs/PROJECT_PLAN.md` is the original planning document from April 2026 and is kept for historical reference only.

## Financing

PathFinder is and will remain **completely free** — no paywall, no ads, no tracking, no commercial monetization, funded by donations only.

## License

MIT
