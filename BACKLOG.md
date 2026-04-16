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
- **KldB subtitle drift — non-medical edition.** Session 21 real-user test
  surfaced the same stem-overlap-picks-weird-thing pattern outside medicine:
  Agraringenieur → "Papierverarbeitung und Verpackungstechnik", Bioingenieur
  → "Sprengtechnik", Naturschutz-Wissenschaftler → "Reiseleiter/Fremdenführer".
  Same fix family as the medical subtitle bug — enumerate ISCO groups where
  the tie-breaker produces semantically distant classes, add per-group
  fallback to "ohne Spezialisierung" or suppress the subtitle.
- **Rank-15 occupation without DE title** surfaced in Session 21 live test:
  only `O*NET 19-1023.00` (Life Scientists, All Other) rendered. Either the
  ESCO label or the override is missing for that code — fix in the Session-19
  override file.
- **DE-title quality pass 2 — non-duplicate codes.** Session 19 curated 249
  overrides but only for codes that sat in a duplicate cluster. The
  remaining ~640 ESCO-raw labels haven't been line-reviewed. During PR
  review @mo-sp spotted `43-5071 Shipping/Receiving/Inventory Clerks` →
  "Warenlagerverwalter" (stale/ungebräuchlich; `Fachkraft für Lagerlogistik`
  would be the current IHK-Ausbildungsberuf name). Likely more of the same
  kind across logistics, trade, and technical roles. Fix: enumerate the
  non-override codes, eyeball each `title.de` against BERUFENET, patch via
  the same override file.

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
- **"Test neu starten"-Button unten im Ergebnis entfernen.** Session-21
  live test: verwechselt sich im Lazy-Loading-Kontext leicht mit einem
  "Nach oben"-Scroll-Button und ist redundant mit dem selben Button oben.
  Entfernen; optional durch einen Scroll-to-Top-Button ersetzen.

## Scoring

- **Anti-match "Was passt definitiv NICHT"** view — currently the "Alle Berufe
  zeigen" toggle reveals them; a dedicated inverse-sorted view would be
  clearer framing if users want it.
- **Baseline-shift for skills bonus** at occupation-level — all-zero users
  currently still get small positive bonuses on avg-complexity occupations;
  Session 15/16 calibration sorted most of this, edge cases may remain.
- **RIASEC short vs. long form / item redesign.** Session 22 observation: a
  single outlier in one dimension (e.g. C=38 % on @mo-sp's real test) can
  swing the Pearson correlation almost single-handedly, because the 60-item
  short form only has 10 items per dimension. Options: (a) O\*NET long form
  (180 items) for thicker per-dim signals, (b) sharpen individual dimensions
  with dimension-specific items (e.g. C-items beyond the clerical stereotype),
  (c) robustify the aggregation (Spearman instead of Pearson, or per-dim
  winsorisation against outliers). Do not pursue before the archetype test —
  first see whether the combined 4-layer stack compensates.
- **C-dimension items are clerical-heavy.** 8 of 10 Phase-1 C-items measure
  office / admin / bookkeeping activity (spreadsheets, invoices, mail,
  payroll, rent collection, front-desk work, inventory, customer databases).
  Dev-flavoured Conventional (working to strict rules, structured
  documentation, quality control, syntax discipline) is absent. The O\*NET
  occupation-level C score (Dev: 5.5/7) draws on a broader construct, but
  our 10 items only cover the clerical cluster. Fix ideas (content swaps):
  c-08 rent payments → "work strictly to fixed procedures", c-10 sorting
  mail → "check work against quality standards", c-02 proofreading forms →
  "systematically check texts or documents for errors" (broader). Decide
  after the archetype test whether this is actually needed. Same family as
  the RIASEC long-form note above.

- **Values penalty masquerades as "perfect match" when occupation has no
  workContext data.** `computeValuesPenalty` returns 0 (not null) when
  `workContext` is missing — the UI then stages this as "Rahmenbedingungen
  passen fast perfekt" with a "−0.00" value, which reads as a perfect
  match instead of "no data". Spotted on 15-2051 Datenwissenschaftler
  (one of the 29 codes still without O\*NET survey data after the 30.2
  upgrade). Skills layer gets this right ("Keine Daten für diesen Beruf"),
  values layer should do the same. Fix: return null from the penalty
  function when `workContext` is missing, mirror skills staging for the
  "noData" branch.
- **Skills stage vs value inconsistency for the median user.** An all-3s
  user has a skillsBonus of exactly +0.00 by design (the piecewise bonus
  is anchored to 0 at the median), but the stage text reads "Solide
  Überschneidung bei den Fähigkeiten" — a "moderate match" label on a
  zero value. Either the staging should recognise "effectively zero" as
  its own neutral band, or the copy should acknowledge "median answers
  → no bonus either way". Spotted during PR 2a browser test.
- **Values layer is penalty-only, can never award a bonus.** Current
  design: `valuesPenalty ∈ [0, 0.35]`, subtracted from fitScore. Users
  who match an occupation's workContext perfectly get 0 penalty (the
  best outcome) but never a positive boost. Feels asymmetric next to
  Big Five (±0.3) and Skills (±0.25). Option: centre values at 0 with
  a signed contribution, e.g. bonus = (0.175 − penalty) so a perfect
  match gives +0.175 and a max-mismatch gives −0.175. Revisit during
  archetype-persona calibration.

## Ideas

- **Top-20-Ergebnis teilen.** Copy-Button für die Top-20-Berufsliste als Text
  und/oder Download als Bild, damit @mo-sp und Test-User das Ergebnis an
  Freunde schicken können. Offene Fragen: welches Format (Markdown, plain,
  JSON, Image), ob Score-Werte mitgeschickt werden, Branding/Link zurück
  zur App.
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
