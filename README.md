<h1 align="center">PathFinder</h1>

<p align="center">
  <strong>Ein tiefer, kostenloser Berufstest – ohne Login, ohne Tracker, ohne Paywall.</strong><br>
  A deep, free career aptitude assessment built on validated psychometric models.
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-open%20beta-blueviolet">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green">
  <img alt="Tests" src="https://img.shields.io/badge/tests-280%20passing-brightgreen">
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3%20%2B%20TypeScript-42b883">
  <img alt="Language" src="https://img.shields.io/badge/UI-Deutsch-lightgrey">
</p>

<!-- SCREENSHOT: results page. Put the file in docs/screenshots/ and reference it here. -->

> *Everyone deserves to find their calling – regardless of income, background, or education level.*

Existing career tests are either five-minute quizzes that tell you nothing meaningful, or locked behind paywalls. PathFinder is the opposite: 239 items across four psychometric layers, a corpus of 923 occupations, deterministic scoring, and an answer that never leaves your browser.

> [!NOTE]
> **Open beta.** The app is complete, running and publicly reachable. It carries a full Datenschutzerklärung and no Impressum: the project is private, free and earns nothing, so §5 DDG is read as not applying. That call gets revisited if the site ever takes money in any form.

## The assessment

A **progressive funnel**: each layer refines the previous one, and stopping after layer 1 still gives a usable result.

| # | Layer | Items | What it does |
|---|-------|-------|--------------|
| 1 | **RIASEC Interests** | 60 | Pearson correlation against each occupation's interest profile. The base fit. |
| 2 | **Big Five Personality** | 50 | Signed adjustment of up to ±0.3. Re-ranks, never eliminates. |
| 3 | **Rahmenbedingungen** | 8 | Education level is the app's only hard filter; seven soft preferences adjust the score. |
| 4 | **Skills, Abilities & Knowledge** | 121 | Self-ratings matched against O\*NET requirements, ±0.25. Never eliminates. |

Sources: O\*NET Interest Profiler Short Form, IPIP-50 Big Five Factor Markers, custom items, O\*NET skills taxonomy. Every one of the 60 RIASEC items was reviewed individually in 2026 and 33 were rewritten.

**Scoring is deterministic** — no LLM anywhere in the pipeline, and the same answers always produce the same ranking.

## Privacy

This is the part the project is actually built around.

- No login, no accounts, no cookies, no analytics.
- **No external resources at all** — no fonts, no CDN, no trackers. The page loads from one origin and nothing else.
- Answers and results are computed and stored **in your browser** (IndexedDB via Dexie.js).
- The only thing that can leave the browser is a **voluntary beta-feedback submission** from the results page: answers, computed profiles and top 20 — no name, no email, no IP, no per-answer timestamps.
- The web server truncates client IPs to /24 (IPv4) or /48 (IPv6) before writing a log line.

## Tech

Vue 3 · TypeScript · Vite · Pinia · Dexie.js · Tailwind CSS · vue-i18n · Feature-Sliced Design

Self-hosted on Hetzner Cloud via Coolify: Docker build, nginx serving the static bundle, Let's Encrypt TLS. The feedback endpoint in `server/feedback/` is a small dependency-free Node service on the same box.

```bash
npm install          # Install dependencies
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
npm test             # Vitest (280 tests)
```

The occupation corpus is **generated, not hand-maintained**: `scripts/` builds `src/data/*.json` from raw O\*NET, ESCO, KldB and BIBB sources, with curated override files for the cases automatic mapping gets wrong.

## Data sources & licenses

| Source | License | Usage |
|--------|---------|-------|
| [O\*NET Interest Profiler](https://www.onetcenter.org/IP.html) (Short Form, 60 items) | O\*NET Developer License | RIASEC questionnaire |
| [O\*NET Database](https://www.onetcenter.org/database.html) (923 occupations) | CC BY 4.0 | RIASEC profiles, skills/abilities/knowledge, work context, job zones |
| [ESCO](https://esco.ec.europa.eu/) | EU Open Data | German occupation names, O\*NET mapping |
| [IPIP-50 Big Five Factor Markers](https://ipip.ori.org/) | Public Domain | Personality assessment |
| [KldB 2010](https://statistik.arbeitsagentur.de/) (Bundesagentur für Arbeit) | Official statistics | German occupation classification, Anforderungsniveau |
| [BIBB Ausbildungsberufe](https://www.bibb.de/) | BIBB | Recognised German apprenticeships per occupation |

> This site includes information from the O\*NET Career Exploration Tools and O\*NET Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O\*NET Tools Developer License and CC BY 4.0. O\*NET® is a trademark of USDOL/ETA.

## Project status & docs

All four layers, the results page, the export and the beta-feedback channel are live. Current work is calibration and content quality rather than new features.

- `BACKLOG.md` — what is queued, and why
- `SUMMARY.md` — what was built when, session by session
- `PROJECT.md` — architecture and scoring model
- `docs/PROJECT_PLAN.md` — the original April 2026 plan, kept for history

## Financing

PathFinder is and will remain **completely free** — no paywall, no ads, no tracking, no commercial monetization, funded by donations only.

## License

MIT
