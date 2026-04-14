# BACKLOG

Forward-looking work: ideas, follow-ups, and parked tasks that don't fit in a
current PR. For what shipped when, see `SUMMARY.md`.

## How to use this

- **Add**: when parking work mid-session or noticing something out of scope,
  drop a bullet here with enough context to pick up cold.
- **Prioritise**: at session start, scan `## Up next` first; promote items up
  the file as they become the most valuable next thing.
- **Retire**: once it ships, delete the entry. `git log -- BACKLOG.md`
  preserves the history if you need to see what was planned and when.

---

## Up next

Likely next 1–2 sessions.

- **End-to-end scoring validation with archetype-personas** — viable now that
  all four layers have real data. Use the search feature added in Session 18
  as the spot-check tool; tune `SKILLS_ALPHA` (0.5), `BIG_FIVE_ALPHA` (0.3),
  `VALUES_DIMENSION_WEIGHT` (0.05) against consistent signals.
- **Homepage → Ergebnis-Shortcut** — when `store.results` is hydrated, show a
  "Zu deinem Ergebnis"-Button on `/`. Tracked since Session 16, parked
  Session 18.

## Data quality

- **KldB subtitle for medical specialties is wrong.** KldB 2010 has only a
  handful of 5d physician classes (81404 Ärzte ohne Spez., 81414 Kinder- und
  Jugendmedizin, 81454 Anästhesiologie, 81464 Neurologie/Psychiatrie,
  81814 Pharmakologie). Specialties without a matching class (Kardiologie,
  Dermatologie, Urologie, Radiologie, Orthopädie, Allergologie, Pathologie,
  Sportmedizin, …) currently get routed to arbitrary far-off classes via the
  stem-overlap tie-breaker — a rebuild attempt in Session 19 sent Sportmedizin
  to "Führungskräfte Pferdewirtschaft" and Radiologe to "Ergotherapie".
  Fix idea: per-ISCO fallback in `build-kldb-mapping.mjs` — if the best KldB
  candidate has stemOverlap 0 with `title.de`, prefer the "ohne
  Spezialisierung" class for that ISCO group rather than inventing a match.
- **Similar subtitle mismatches outside medicine.** Moritz spotted 47-2061
  Construction Laborers → "Sprengtechnik", 33-9094 School Bus Monitors →
  "Kinderbetreuung und -erziehung". Likely the same stem-overlap-picks-weird-
  thing pattern.
- **85 broadMatch KldB mappings** — residual noise tier. Options: (a) hide
  `broadMatch` from display and fall back to jobZone-only category, (b)
  accept. Build-script stat: `match tier of mapped codes: broadMatch`.
- **22 unmapped O\*NET codes** — no ESCO crosswalk partner, fall back on
  jobZone-derived category only. Listed in build-script output. Mostly
  US-specific (Brownfield Redevelopment, Farm Labor Contractors, …). Options:
  hand-map, hide from corpus, accept.
- **17 codes with Anforderungsniveau 2 steps away from jobZone** — biggest
  semantic drift. Build-script stat: `Anf distance: { '2': 17 }`.
- **DE-Occupation filter** — the 923 O\*NET codes include many US-specific
  roles that aren't relevant for the DE labour market. Coverage check +
  filter/relabel irrelevant ones.
- **Skills-Items DE-polish** — `translator: "v1 — polish pass pending"` in
  `src/data/skills-items.json` still open.
- **Anwendungsprogrammierer vs. Softwareentwickler vs. Anwendungsentwickler
  (IHK)** — O\*NET splits 15-1251 (Computer Programmers) and 15-1252 (Software
  Developers), but the German IHK-Ausbildungsberuf "Anwendungsentwickler" sits
  between both. Not a bug, but worth noting when users ask: none of the three
  cards perfectly matches the Ausbildung. Idea: add an editorial "Hinweis"
  line for 15-1251/15-1252 that cross-references the Ausbildungsberuf.

## UX polish

- **Prozent-Anzeige in Skills-Sub-Kategorien** — raw percent (e.g. "Fähigkeiten
  47%") is meaningless for a non-test audience. Replace with label bands like
  "Eher grundlegend / Solide / Stark ausgeprägt". Non-blocking, useful for
  debugging now; revisit before friends-test push.
- **Score-delta baseline labelling** — delta shown per view is currently vs
  raw RIASEC, not vs the previously-active view. Either label it ("vs. Nur
  Interessen") or switch to incremental deltas.
- **Education 2-year vs 3-year split** — v1 uses the 4 KldB Anforderungsniveaus.
  Upgrade to true Ausbildungsdauer granularity would need BERUFENET-API per
  Ausbildungsberuf (~800 calls at build time). Only pursue if users ask.

## Scoring

- **Anti-match "Was passt definitiv NICHT"** view — currently the "Alle Berufe
  zeigen" toggle reveals them; a dedicated inverse-sorted view would be
  clearer framing if users want it.
- **Baseline-shift for skills bonus** at occupation-level — all-zero users
  currently still get small positive bonuses on avg-complexity occupations;
  Session 15/16 calibration sorted most of this, edge cases may remain.

## Ideas

- **AI-at-risk flag per occupation** — show whether a role is likely to be
  heavily affected by current AI capability (automation/augmentation). Source
  options: Frey & Osborne 2013, Brynjolfsson/Mitchell 2023, WEF Future of
  Jobs, or an opinionated curated flag. Open design questions: binary vs.
  multi-level, what timeframe, how to frame without fatalism. Discuss scope
  before building.

## Tech debt

- **Bundle size** — `onet-occupations-*.js` is 3.8 MB raw / 658 KB gzip. Code
  chunking is lazy-loaded so initial TTI isn't hit, but reducing the payload
  by dropping unused O\*NET fields (descriptions we don't render, etc.) would
  be tidy.
