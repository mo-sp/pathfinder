# SUMMARY.md – Claude Code Session Protocol

## Project: PathFinder
## Environment: dev-sandbox (192.168.178.33)

---

### Session 2 – 2026-04-11
**Focus:** ESCO mapping → German occupation titles in `ResultsPage`

**What was done:**
- Researched the ESCO data ecosystem and located the official ESCO ↔ O*NET-SOC crosswalk CSV (`https://esco.ec.europa.eu/system/files/2023-08/ONET_(Occupations)_0_updated.csv`, ~3 MB, CC BY 4.0). 4 253 mappings, 4 210 to ESCO occupations + 43 to ISCO groups.
- Confirmed the public ESCO REST API (`https://ec.europa.eu/esco/api/resource/occupation?uri=…&language=de`) returns `preferredLabel.de` per occupation URI – the cleanest path to German labels without going through the email-gated ESCO classification CSV download.
- Added `csv-parse` as a dev dependency for robust CSV parsing (the crosswalk has many quoted descriptions with embedded commas/newlines).
- Wrote `scripts/build-esco-german.mjs` (`npm run build:esco`):
  - Auto-downloads the crosswalk into `data-raw/esco/` (gitignored)
  - Skips ISCO-namespace URIs (different API behavior)
  - Groups crosswalk rows by O*NET-SOC code, then picks the best ESCO match per code:
    1. highest match-type priority (`exactMatch > closeMatch > broadMatch > narrowMatch`)
    2. highest Jaccard token similarity to the O*NET English title (with a small English plural stemmer so `developer` matches `developers`)
    3. alphabetical tiebreak
  - Concurrently fetches German labels from the ESCO API in batches of 15
  - On-disk cache at `data-raw/esco/esco-de-cache.json` so re-runs are instant and offline-friendly
  - Patches `src/data/onet-occupations.json` in place, setting `escoUri` and `title.de`; occupations without a crosswalk match keep `de: null` and the UI keeps falling back to the English title
- First pass put "Software Developers" → "Datenbankentwickler" (alphabetical tiebreak picked the wrong sibling). Fixed by switching to Jaccard-with-stemming. Second pass put it on "Softwareentwickler für Embedded Systems" (overlap count couldn't distinguish parent from child). Final fix: Jaccard normalises by union size, so the shorter, more specific "Softwareentwickler/Softwareentwicklerin" wins.
- Final coverage: **890 / 923 occupations (96.4 %) now have a German title**. The remaining 33 are O*NET codes with no ESCO match in the official crosswalk (mostly very US-specific roles like Postmasters, Brownfield Redevelopment Specialists, Geothermal Production Managers).
- `ResultsPage` already had a `title.de || title.en` fallback with a "(Übersetzung folgt)" hint for the missing cases, so it picks up the new data automatically – no UI changes needed.
- Verified: `npm run type-check` ✅, `npm run lint` ✅, `npm run build` ✅ (store chunk grew from 484 KB → 600 KB raw / 130 KB → 169 KB gzipped due to the added German labels and `escoUri` fields), `npm run dev` boots and serves HTTP 200.

**Spot checks (ESCO crosswalk quality):**
- `15-1252.00 Software Developers` → Softwareentwickler/Softwareentwicklerin ✅
- `11-1011.00 Chief Executives` → Geschäftsführer/Geschäftsführerin ✅
- `47-2031.00 Carpenters` → Zimmerer/Zimmerin ✅
- `25-2021.00 Elementary School Teachers` → Lehrkraft im Primarbereich ✅
- `29-1141.00 Registered Nurses` → Krankenpfleger Allgemeine Krankenpflege/Krankenschwester Allgemeine Krankenpflege ✅
- `27-2042.00 Musicians and Singers` → Musiker/Musikerin ✅
- `13-2011.00 Accountants and Auditors` → Controller/Controllerin ⚠ (taxonomy mismatch in the source crosswalk – not a bug in the joiner)

**Commits / PRs:**
- Branch: `feat/esco-german-titles` (stacked on `feat/poc-scaffold`)
- `f13f6de` feat(scripts): add ESCO German title joiner
- `36df613` data(occupations): patch 890/923 occupations with German titles via ESCO
- `38c67fa` docs(claude.md): add Testing & Review Workflow section
- **PR mo-sp/pathfinder#2** → https://github.com/mo-sp/pathfinder/pull/2
  Stacked on #1; will auto-retarget to `main` once #1 merges. Manually browser-tested by @mo-sp before opening (German titles confirmed in ResultsPage).

**Known issues / TODOs:**
- Crosswalk-induced taxonomy mismatches: ~10–20 % of selected matches are conceptually adjacent rather than exact (e.g. "Accountants" → "Controller"). Improving this needs either (a) human curation, (b) running a similarity model on full descriptions instead of just titles, or (c) using the ESCO classification CSV bundle to score against alternate labels too.
- 33 O*NET codes still have no German title – worth a manual override list if/when they show up in user results.
- Bundle is now ~600 KB raw – the lazy-loading TODO from Session 1 is more urgent.
- Still no tests for `pearson.ts` / `riasec.ts` / `matcher.ts` – next on the list.

**Next steps:**
- PR review + merge for #1 and #2
- **Next session: add `vitest` + unit tests for `pearson.ts`, `riasec.ts`, `matcher.ts` plus a small integration test against the real `onet-occupations.json`** (user-chosen next step at the end of this session; branches off `main` so it doesn't depend on #1/#2)
- Lazy-load the occupations JSON out of the main store chunk
- Translate the remaining 50 O*NET items into German
- Replace bar chart with RIASEC hexagon widget under `widgets/riasec-chart/`
- Domain decision (per PROJECT_PLAN section 9) and pick a hosting target for first deploy

---

### Session 1 – 2026-04-11
**Focus:** Project scaffolding & Proof of Concept

**What was done:**
- Scaffolded Vue 3 + TypeScript + Vite 8 project (npm create vite, then customised)
- Installed and wired up Pinia, Vue Router, Dexie, vue-i18n, Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- Configured ESLint 9 flat config with `eslint-plugin-vue` + `typescript-eslint`
- Set up Feature-Sliced Design directory layout under `src/` (app, pages, widgets, features, entities, shared, data) plus path aliases in `tsconfig.app.json` and `vite.config.ts`
- Downloaded the O*NET Interest Profiler Short Form PDF (60 items, v1) and extracted all 60 items into `src/data/onet-items.json`
- Translated 10 PoC items to German (R=2, I=2, A=2, S=2, E=1, C=1) – flagged as draft, remaining 50 carry `de: null` until proper translation in MVP phase
- Downloaded O*NET DB 29.2 (text release) and wrote `scripts/build-onet-data.mjs` which extracts 923 occupations with their RIASEC OI profiles into `src/data/onet-occupations.json` (auto-downloads + unzips raw data into `data-raw/` if missing; raw dir is gitignored)
- Implemented core types in `entities/` (Question, Occupation, MatchResult, AssessmentSession)
- Implemented scoring (`features/scoring/lib/riasec.ts` – sum + percent normalisation), Pearson correlation (`features/scoring/lib/pearson.ts`), and matcher (`features/matching/lib/matcher.ts`)
- Implemented `features/questionnaire/model/store.ts` Pinia store using setup syntax – holds answers, current index, computed RIASEC profile, computed top-20 matches, and `persist()` to Dexie
- Built three pages with Tailwind: `HomePage`, `AssessmentPage` (10-item Likert flow with German labels via vue-i18n, progress bar, prev/restart), `ResultsPage` (RIASEC bar chart + top-10 occupation list with fit scores)
- Added O*NET attribution footer in `App.vue` per licence requirement
- Verified everything works: `npm run type-check` ✅, `npm run build` ✅ (Vite 8.0.8, ~700 KB total, ~135 KB gzipped), `npm run lint` ✅ (0 errors, 0 warnings), `npm run dev` boots and serves HTTP 200 on :5173

**Commits / PRs:**
- Branch: `feat/poc-scaffold`
- `c8a5828` docs: add project inception artifacts from planning session
- `705c93c` feat: scaffold Vue 3 PoC with 10-item RIASEC questionnaire
- **PR mo-sp/pathfinder#1** → https://github.com/mo-sp/pathfinder/pull/1

**Known issues / TODOs:**
- 50 of 60 O*NET items still need German translations (PoC ships only 10)
- 923 occupation titles are still English-only – need to wire up ESCO crosswalk for German titles (`esco-occupations-de.json`, `esco-onet-mapping.json` per CLAUDE.md / PROJECT_PLAN)
- `onet-occupations.json` (~495 KB raw, ~130 KB gzipped) is bundled into the main JS chunk via the Pinia store. Acceptable for PoC but should be lazy-loaded (e.g. `import('@data/onet-occupations.json')` inside the matcher) before MVP launch.
- PoC uses 10 items unevenly distributed across dimensions (E and C have only 1 item each). Pearson is scale-invariant so the ranking still works, but per-dimension percent on the ResultsPage is noisier than the full 60-item version will be.
- No tests yet – `vitest` should be added in next session before the scoring/matcher logic grows further.
- No widgets/ entries yet (e.g. RIASEC hexagon chart) – currently using simple bar visualisation.
- Tailwind v4 is used; CLAUDE.md mentions Vite 7 but `npm create vite@latest` installed Vite 8 – CLAUDE.md should be updated.

**Next steps:**
- Decide on branching/PR for this scaffold work and merge it
- Translate the remaining 50 O*NET items (reference: OPEN RIASEC opentest.ch, plus native review)
- Build out the ESCO mapping pipeline so German occupation titles render in `ResultsPage`
- Replace the bar chart with a proper RIASEC hexagon/radar widget under `widgets/riasec-chart/`
- Add `vitest` and unit tests for `pearson.ts`, `riasec.ts`, `matcher.ts`
- Lazy-load the occupations JSON to reduce initial bundle size
- Domain decision (per PROJECT_PLAN section 9) and choose hosting target for first deploy

---

<!-- Template for new sessions:

### Session N – [DATE]
**Focus:** [topic]

**What was done:**
-

**Commits / PRs:**
-

**Known issues / TODOs:**
-

**Next steps:**
-

-->
