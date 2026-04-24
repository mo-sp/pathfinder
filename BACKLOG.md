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
- **Further semantic subtitle mismatches beyond the three Session-24
  containers.** Session 24's scan flagged 155+ KldB container classes with
  ≥ 2 suspicious codes each; only 21124 Sprengtechnik (13 codes), 61394
  Immo/Facility (6), and 41204 Biologie (5 non-biologists) were cleaned
  up via remap. Session 26 top-list browser test added ~50 fresh specifics
  and Sessions 27 + 28 + 29 addressed 32 of them as explicit overrides
  (batch 1: 15 codes; batch 2: 11 codes; batch 3: 6 codes surfaced by the
  Cluster-B primary-null investigation — Geothermal Production Managers,
  Civil + Transportation Engineers, Fuel Cell Engineers, Medical
  Dosimetrists, Interviewers). Still open: various Lehrkräfte-Tier-
  Verwechslungen (probably mixed A/C — some are seed-pin target errors on
  pinned Lehrkraft codes, some are awkward title.de phrasing that belong
  in DE-title pass 2); the older scan findings still need a SOC-aware
  companion filter before another pass so false positives like "Bankkaufleute
  → Kreditprüfer" don't dominate the review list.
- **Dietitians title.de is wrong at the ESCO level.** 29-1031.00 Dietitians
  and Nutritionists is currently titled "Futtermittelwissenschaftler/
  Futtermittelwissenschaftlerin" (animal-feed scientist), an ESCO-side
  bug. Session 24 nulled the kldbName for this code to suppress the
  further-compounded "Biologie" subtitle, but the primary title still reads
  as animal-feed scientist. Fix during the broader DE-title quality pass.
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
- **DE-title quality pass 2 — non-duplicate codes.** Session 19 curated 249
  overrides but only for codes that sat in a duplicate cluster. The
  remaining ~640 ESCO-raw labels haven't been line-reviewed. During PR
  review @mo-sp spotted `43-5071 Shipping/Receiving/Inventory Clerks` →
  "Warenlagerverwalter" (stale/ungebräuchlich; `Fachkraft für Lagerlogistik`
  would be the current IHK-Ausbildungsberuf name). Likely more of the same
  kind across logistics, trade, and technical roles. Fix: enumerate the
  non-override codes, eyeball each `title.de` against BERUFENET, patch via
  the same override file. Session 26 browser test added ~12 more hits to
  the pile: Anschläger, Bügler, Gelegenheitsarbeiter, Zwirner, Zwicker,
  Pfahlrammer, Blutabnehmer, Postschalterbediensteter, Kameraschwenker,
  Underwriter, Warenmakler, Pflegeexperte, CAD-Bediener (= Technischer
  Zeichner?), Instruktionsdesigner, "Lehrkraft Gymnasium und Realschule"
  (awkward phrasing). Session 27 adds: 19-3091.00 Anthropologists and
  Archeologists — title.de currently drops the Archäologe half of the
  bundled SOC label, should become "Anthropologe/Archäologe" or similar.
  Session 28 adds: 51-4031.00 "Maschinenbediener für Ständerbohrmaschine"
  (awkward/ungebräuchliche Bezeichnung — cluster-C concern while the KldB
  is defensible); 51-4072.00 "Fomgießmaschinenführer/Formgießmaschinen-
  führerin" — masc form has a typo ("Fom" missing r), fem form spelled
  correctly, one-char fix. Session 29 partially reduces the pile: 5
  primary-null fills landed coupled with batch-3 KldB remaps (11-3051.02
  Geothermal Production Managers, 17-2051.00 Civil Engineers, 17-2141.01
  Fuel Cell Engineers, 29-2036.00 Medical Dosimetrists, 43-4111.00
  Interviewers). Four primary-null remainders still pending — KldB was
  already correct, only the title needs filling: 29-1124.00 Radiation
  Therapists → "Strahlentherapeut/Strahlentherapeutin", 47-4099.03
  Weatherization Installers → "Dämm-Monteur/Dämm-Monteurin" (or similar),
  49-9081.00 Power Plant Operators (non-specific) → "Kraftwerker/
  Kraftwerkerin", 49-9099.01 Geothermal Technicians → "Geothermie-
  Techniker/Geothermie-Technikerin".

- **Audit the 131 seed entries in `scripts/input/kldb-overrides.mjs`.**
  The file was populated retrospectively in Session 26 to pin the existing
  `kldb-occupation-mapping.json` state against a silent revert on rebuild.
  Each seed entry is either (i) an intentional Session-19 / Session-24
  manual fix worth keeping, or (ii) accumulated drift from title.de updates
  feeding into the stem-overlap tiebreaker that could be replaced by a
  build-time improvement. Session 27 already found one seed that belonged
  in category (ii) (27-4015.00 Beleuchtungstechniker was pinned to Tätowierer
  — corrected and moved to the batch-1 block). The 7 "tiebreaker regressions"
  block and the 15 "container-abuse batch-1" block at the tail are explicitly
  tagged; the other 131 need walking. Low priority — the file is stable
  as-is, this is hygiene.

## UX polish

- **Concrete examples on every question** — many items (especially Skills /
  Abilities / Knowledge and Values) are abstract enough that users,
  particularly students or first-time career-assessment takers, may not be
  sure what's meant. Add a short example per item that clarifies the intended
  construct without over-narrowing it (e.g. "Mündliches Verständnis —
  Beispiel: einem Kollegen in einer Besprechung zuhören und den Auftrag
  korrekt umsetzen"). Scope: all 60 RIASEC + 50 Big Five + 120 Skills + 8
  Values items (≈ 238 examples). Keep examples neutral and broad enough that
  they don't steer the answer. Non-blocking but important before friends-test
  push.
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

- **Skills stage vs value inconsistency for the median user.** An all-3s
  user has a skillsBonus of exactly +0.00 by design (the piecewise bonus
  is anchored to 0 at the median), but the stage text reads "Solide
  Überschneidung bei den Fähigkeiten" — a "moderate match" label on a
  zero value. Either the staging should recognise "effectively zero" as
  its own neutral band, or the copy should acknowledge "median answers
  → no bonus either way". Spotted during PR 2a browser test.
- **Contribution badge colour thresholds ignore sign on Big Five and
  Values.** Results page shows Big-Five +0.08 and Values −0.09 both in
  grey. Per `stageForBigFive` at ResultsPage.vue:396 a +0.08 is 'moderate'
  (grey) and per `stageForValues` a penalty of 0.09 is 'weak' (should
  render red). Either `stageForValues` threshold is off, or the
  stage → colour-class mapping doesn't colour 'weak' red for values.
  Fix: align the Big Five / Values badge thresholds with the Skills
  delta-label logic (any positive = green, any negative = red, with
  magnitude bands for intensity). Spotted during Englisch-split smoke
  test.
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
- **AI-impact per occupation — two-sided: automation risk + augmentation
  uplift.** Not just "likely to be replaced" but also "AI lifts the
  practical fit of this role for users whose weak dimensions it
  complements". The two-sided frame also resolves the earlier "how to
  avoid fatalism" open question — risk and uplift co-exist per
  occupation. Source options for the risk side: Frey & Osborne 2013,
  Brynjolfsson/Mitchell 2023, WEF Future of Jobs, or an opinionated
  curated flag. Uplift side is new design: per-occupation tags for which
  dimensions AI currently offloads (e.g. SwDev → AI covers much of the
  C/detail-discipline load, so a low-C user's realistic fit exceeds their
  raw profile). Could surface as a signed fit modifier, or just as a
  displayed hint next to the score. Real case behind the uplift idea:
  @mo-sp is low-C and AI tooling has massively expanded what he can
  produce as a developer — pattern, not just hypothesis. Open questions:
  binary vs. multi-level on each side, timeframe, per-dimension vs.
  per-skill granularity for the uplift, whether to combine into a single
  signed "AI delta" or show both dimensions separately. Discuss scope
  before building.

## Tech debt

- **Bundle size** — `onet-occupations-*.js` is 3.8 MB raw / 658 KB gzip. Code
  chunking is lazy-loaded so initial TTI isn't hit, but reducing the payload
  by dropping unused O\*NET fields (descriptions we don't render, etc.) would
  be tidy.
