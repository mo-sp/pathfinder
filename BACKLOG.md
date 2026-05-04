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

- **BigFive coverage gap — 19 / 923 occupations remain without profile.**
  Down from 169 after the ISCO-3d/2d sibling cascade shipped via
  `feat/bigfive-isco-cascade` (corpus coverage 754/923 → 904/923 = 98 %).
  The remaining 19 are Bucket A: O*NET codes with no ESCO-crosswalk row
  at all, so the cascade can't reach them. Recovery options: (a) SOC-
  sibling fallback in `build-bigfive-profiles.mjs` for the 4 codes that
  have a mapped same-SOC sibling (e.g. 11-9199.11 Brownfield Redev,
  17-1022.01 Geodetic Surveyors, 29-2099.08 Patient Reps, 31-9099.02
  Endoscopy Technicians), (b) hand-curate the 15 codes without SOC
  siblings via a new BigFive-curated input file (Postmasters,
  Mediators, Tapers, Conveyor Operators, Biofuels Tech, Traffic Tech,
  Loss Prevention etc.). Run `node scripts/audit/bigfive-coverage-gap.mjs`
  to see the current list with recovery flags.

## Data quality

- **KldB subtitle for medical specialties — systemic build-time fallback.**
  KldB 2010 has only a handful of 5d physician classes (81404 Ärzte ohne
  Spez., 81414 Kinder- und Jugendmedizin, 81454 Anästhesiologie, 81464
  Neurologie/Psychiatrie, 81814 Pharmakologie). Specialties without a
  matching 5d class get routed via stem-overlap tie-breaker to arbitrary
  far-off classes (Session 19 sent Sportmedizin to "Führungskräfte
  Pferdewirtschaft" and Radiologe to "Ergotherapie"). Sessions 19/31
  manually pinned the surfaced cases (Pathologie, Allergologie,
  Notfallmedizin, Gynäkologie, Urologie, Orthopädie → 81404; Neurologie,
  Psychiatrie → 81464). Specialties not yet flagged (Kardiologie,
  Dermatologie, Radiologie, Sportmedizin, …) still misroute by default.
  Systemic fix idea: per-ISCO fallback in `build-kldb-mapping.mjs` — if
  the best KldB candidate has stemOverlap 0 with `title.de`, prefer the
  "ohne Spezialisierung" class for that ISCO group rather than inventing
  a match. Would retire the manual-override approach for this domain.
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
- **KldB physician-specialty fallback — opportunistic cleanup remaining.**
  Session 31 cleaned up 6 entries that had been routed to 81414 Kinder-
  und Jugendmedizin via stem-overlap (Notfallmediziner, Frauenarzt,
  Urologe, Orthopäde → 81404 Ärzte ohne Spez.; Neurologie + Psychiater
  → 81464). The same root cause from the medical-subtitle BACKLOG entry
  above still applies to other physician specialties not yet flagged
  (Kardiologie, Dermatologie, Radiologie, Pathologie-adjacent, Sportmedizin,
  …). The "ohne 5d-Klasse → 81404 ohne Spez." fallback pattern works;
  fix candidates can come opportunistically from browser tests rather
  than as a dedicated pass.
- **85 broadMatch KldB mappings** — residual noise tier. Options: (a) hide
  `broadMatch` from display and fall back to jobZone-only category, (b)
  accept. Build-script stat: `match tier of mapped codes: broadMatch`.
- **22 unmapped O\*NET codes** — no ESCO crosswalk partner, fall back on
  jobZone-derived category only. Listed in build-script output. Mostly
  US-specific (Brownfield Redevelopment, Farm Labor Contractors, …). Options:
  hand-map, hide from corpus, accept.
- **17 codes with Anforderungsniveau 2 steps away from jobZone** — biggest
  semantic drift. Build-script stat: `Anf distance: { '2': 17 }`.
- **DE-title quality pass 2 — residual tail after Session 30.** Session 30
  shipped the cluster-C batch 1: all 27 primary-null fills (13-1074.00
  Farm Labor Contractors got an ad-hoc nearest-DE label in Session 34
  rather than the previously-planned filter mechanism) + 23 ESCO-raw
  corrections covering most of the
  Session 26-28 browser-test flags plus 9 filter-surfaced new ones
  (Financial Risk Analyst/Investment Analyst → Risiko-/Quant-Analyst;
  CAD-Bediener → Bauzeichner; Kameraschwenker → Kameramann; Orthopädist
  → Orthopädietechniker; Berg- und Maschinenmann → Land- und
  Baumaschinenmechatroniker; Zerspanungsmechaniker im Getriebebau →
  generic; Maschinenbediener für Ständerbohrmaschine → Maschinen- und
  Anlagenführer Metall-/Kunststofftechnik; Futtermittelwissenschaftler
  → Ernährungsberater; Fom→Form typo; Pharma-Assistent grammar;
  Schnitt-…-Direktrice → Modellmacher Bekleidung; Power Plant Operators
  51-8013.00 generalisation). Also settled: the Session 26-28 BERUFENET-
  legitimate-but-nischig terms (Anschläger, Bügler, Zwirner, Zwicker,
  Pfahlrammer) explicitly kept as-is, and Pflegeexperte 29-1171.00 stays
  as intentional APN gloss. Heuristic filter (anglicism / long / -arbeiter
  / -bediensteter / für-X-bediener) identified 108 candidates out of the
  637 un-reviewed titles; of those, ~23 became fixes, the rest are
  legitimate long DE compound nouns or etablierte Anglizismen (Controller,
  Web-Designer, Game-Designer). Still open: (i) a finer sampling pass
  through the ~530+ titles below the filter threshold — lower-yield, do
  opportunistically during future browser tests rather than as a
  dedicated pass, (ii) the -arbeiter/-bediensteter cluster-decisions
  where we kept BERUFENET-legit terms but didn't revisit the less-legit
  ones (Transportarbeiter, Lagerarbeiter, Sägewerksfacharbeiter,
  Vermietungsdienstmitarbeiter, Drainagearbeiter, Straßenunterhaltungs-
  arbeiter, Deckarbeiter, Oberflächenbearbeiter, Gartenhilfsarbeiter,
  Fabrikhilfsarbeiter, Bankbediensteter, Küchenbediensteter) — all
  borderline, defer until a browser test surfaces a concrete complaint.
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

- **Startseite content + design refresh.** Two-part:
  (a) Content overhaul to current state — wording, value-prop, what the
  test actually measures (RIASEC + Big Five + Skills + Values, 4-layer
  stack), privacy claim, what changed since the early version. Pre-
  friends-release: the landing copy should reflect what shippers actually
  see when they take the test. (b) Design refresh, ideally with claude-
  design help. Independent of friends release — can ship as its own PR
  any time.

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
- **C-dimension items still under-represent dev-flavoured Conventional.**
  Session 33's modernization sweep already broadened c-02 (proofreading
  contracts), c-08 (data-protection checklists) and c-10 (accounting
  software) along the lines this entry originally proposed, so the
  pure-clerical density dropped from 8/10 to ≈5/10. Still under-covered
  in the remaining 5 items: rule-bound work like quality control,
  structured documentation, syntax/test discipline. Decide after the
  archetype-persona test whether the current breadth is enough or
  whether further swaps are warranted. Same family as the RIASEC
  long-form note above.

## Ideas

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

- **Hobbies/interests as bonus signal.** Currently the matcher captures
  what users *can* do (Skills) and *value* (Values/Workcontext) but not
  what they *enjoy doing in their spare time*. A hobby-to-occupation
  bonus layer would catch real signal: "schwimmen" → bonus on
  Rettungsschwimmer / Schwimmtrainer / Bademeister; "Heimwerken" →
  bonus on handwerkliche Berufe; "Brettspiele" → bonus on Game-Designer
  / Mathematik. Could be parallel to RIASEC or integrated with the
  "Modern interests" idea below. Open: how many hobbies in the picker
  (30-50?), how strong the bonus (±0.05? ±0.10?), whether to surface
  as a separate flow step or bundle with Values. Discuss before
  building. Shipped 2026-04-25 by @mo-sp idea.
- **MBTI / 16personalities as Big-Five onboarding shortcut.** Many users
  know their MBTI type (INFJ, ENTP, …) but not their Big-Five profile.
  Don't add MBTI as a scoring layer — its dimensions overlap heavily
  with Big Five (E/I = Extraversion, S/N ~ Openness, T/F ~ Agreeableness,
  J/P ~ Conscientiousness) and it's psychometrically weaker (Test-
  Retest reliability ~50 %). But: a UX shortcut where the user types
  "INFJ" and we generate an approximated Big-Five profile would let
  people skip the 50-item Big-Five test for a quick first run. Could
  show a disclaimer "approximated from MBTI — answer the full Big-Five
  test for higher accuracy." Open: which MBTI → Big-Five mapping
  (research-backed averages exist, e.g. McCrae/Costa 1989), how to
  surface in the assessment flow (skip-link on Big-Five intro?), and
  whether to retain/discard the approximated profile if the user later
  does the full test. Shipped 2026-04-25 by @mo-sp idea.
- **"Modern interests" layer parallel to RIASEC.** Surfaced in Session 33
  modernization triage as "Option 2". Re-wording items within the existing
  60-item Holland structure hits a ceiling: the 1959 typology can't elegantly
  host contemporary niches like sustainability focus, creator economy,
  remote-first preference, or AI-native work styles. A parallel interests
  block — independent of RIASEC score, feeding occupation matching only —
  would let us add contemporary interests without distorting the validated
  core. Open: how many items, how they plug into the matching weight, Likert
  vs. single-choice tags, whether to surface as a separate step in the
  assessment flow or bundle with RIASEC.

## Tech debt

- **Bundle size** — `onet-occupations-*.js` is 3.8 MB raw / 658 KB gzip. Code
  chunking is lazy-loaded so initial TTI isn't hit, but reducing the payload
  by dropping unused O\*NET fields (descriptions we don't render, etc.) would
  be tidy.
