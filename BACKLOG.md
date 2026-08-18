# BACKLOG

Forward-looking work: ideas, follow-ups, and parked tasks that don't fit in a
current PR. For what shipped when, see `SUMMARY.md`.

## How to use this

- **Add**: when parking work mid-session or noticing something out of scope,
  drop a bullet into its topical section with enough context to pick up cold.
- **Prioritise**: at session start, scan `## Up next` first. Only promote an
  item into `## Up next` after explicit agreement with @mo-sp — never move
  things there unprompted.
- **Retire**: once it ships, delete the entry. `git log -- BACKLOG.md`
  preserves the history if you need to see what was planned and when.

---

## Up next

Likely next 1–2 sessions. Only add items here after explicit agreement
with @mo-sp — otherwise park them in their topical section below.

- **Launch sequence, closed 2026-08-18.** The friends-beta ran (2026-08-15),
  the security audit followed (2026-08-17), and the legal pass plus the
  `noindex` flip shipped as `feat/open-beta-legal-pass`. PathFinder is a
  publicly reachable open beta with a full Datenschutzerklärung and, by
  @mo-sp's decision, no Impressum. What the old sequence still had open:
  step (2), the one-by-one review of **Big Five 50 and Skills 120**, never got
  a scope ruling and is now explicitly cuttable, since the beta it was gating
  already happened. RIASEC 60 and Werte 8 were done in Session 54.

  Three operational questions were raised before launch and are **still
  undecided**: whether the feedback endpoint stays on when nobody is reading
  it (`FEEDBACK_ENABLED=false` is the switch), whether the backups stay
  dependent on a VM started by hand, and whether anything should watch the
  site's uptime, given that today nothing does. None of them blocked the
  launch; all three get more awkward the longer the site runs unattended.

  Also worth stating plainly: **there is no traffic source in the plan.**
  Coming off `noindex` is permission to be found, not distribution. A fresh
  `.de` with no backlinks will not rank for "Berufstest" against the
  Arbeitsagentur for a long time, so a null result after launch says nothing
  about the product. A distribution session (forums, subreddits,
  Ausbildungs- and Studienberatung communities) is what would produce a real
  answer. Offered, not agreed.
- **Donation / "support the server costs" link on the landing page.** A
  voluntary support link to offset the self-hosting cost (~€10–40/mo after
  the Vercel → Hetzner migration, now live). **Provider chosen: BuyMeACoffee**
  (@mo-sp created the account). Implement as a **plain external link, not an
  embedded JS widget** — embeds load third-party trackers and would violate
  the privacy-first / no-tracker principle. Tax (DE): practically negligible
  at pocket-money / cost-coverage scale, but if income becomes regular, check
  with Finanzamt / Steuerberater; a paid link also nudges the project slightly
  toward commercial use (cf. the PathFinder trademark note). Surfaced
  2026-05-31 by @mo-sp during the infra setup; provider locked in 2026-06-10.

  **GATED, and the gate moved (restated 2026-08-18).** The original wording
  tied this to "the public beta or the release". The public beta has now
  shipped *without* an Impressum, so the beta was never the real condition:
  the condition is the **Impressum**, which @mo-sp declined on 2026-08-17
  (a ladungsfähige Anschrift means his home address published permanently, a
  Postfach does not satisfy §5 DDG, and an Impressumsservice is a recurring
  cost on a project he wants to leave). A donation link turns a free project
  into an offering with an income intent, which triggers §5 DDG regardless of
  how few people have the link. So this stays blocked on that decision, not on
  a phase, and reopening it means reopening the Impressum. (Not legal advice;
  @mo-sp's call on the risk.)
- **Feedback channel for beta testers — contact email (in-app form shipped).**
  The **self-hosted anonymous feedback form shipped** 2026-06-22 (a dependency-
  free `/api/feedback` endpoint on the Coolify box + an opt-in card on
  `/ergebnis`; see SUMMARY Session 53). Still open: a **contact email on the
  domain** — `kontakt@pathfinder-berufetest.de` (mail forwarder → @mo-sp's
  personal inbox), surfaced as a plain `mailto:` link next to the GitHub link,
  for qualitative reports the structured form doesn't capture. Surfaced
  2026-05-31 by @mo-sp.

## Docs

- **Screenshots for the README — deferred to the open beta** (@mo-sp,
  2026-08-15). The README front page carries badges, a status callout and a
  layer table, but no image, and a screenshot of the results page under the
  badges is the single biggest visual improvement left. Parked deliberately:
  the closed beta does not need to sell itself, the open beta does. There is
  an HTML comment marking the insertion point in `README.md`; drop the file
  into `docs/screenshots/` and reference it there. Desktop width, results
  page with the hexagon and the top list.
- **Real CI, so the test badge stops lying.** The README's "280 tests
  passing" badge is hardcoded and goes stale on the next test added. There
  are no GitHub Actions in the repo at all, so a `type-check` + `lint` +
  `test` workflow on push would both fix the badge and give the repo a
  visible green check before strangers look at it. Offered 2026-08-15, not
  decided.
- **Retire `WEBCLAUDE_SUMMARY.md`?** Open decision for @mo-sp. The file logs
  exactly one webchat session, at project inception 2026-04-10, and the
  parallel-log workflow it assumed never materialised. It now carries a
  "historical" header, so it misleads nobody — the question is only whether
  a record of the founding decisions is worth a file of its own or belongs
  as an appendix in `docs/PROJECT_PLAN.md`.

  The docs pass itself is **done** (2026-08-15, `docs/refresh-project-docs`):
  README, PROJECT.md, CLAUDE.md's data-source list, and historical headers on
  `docs/PROJECT_PLAN.md` and `WEBCLAUDE_SUMMARY.md`.

## Data quality

- **KldB subtitle for medical specialties — systemic build-time fallback
  (idea only, symptom already resolved).** Historically, physician
  specialties without a matching 5d KldB class got routed via the
  stem-overlap tie-breaker to arbitrary far-off classes (Session 19 sent
  Sportmedizin to "Führungskräfte Pferdewirtschaft" and Radiologe to
  "Ergotherapie"). All surfaced cases are now pinned via
  `scripts/input/kldb-overrides.mjs` and route correctly (verified
  2026-05-31: Kardiologe → 81424 Innere Medizin, Dermatologe → 81444
  Hautkrankheiten, Radiologe → 81484, Pathologe/Sportmediziner → 81404
  ohne Spez.). So the user-visible pain is gone. What remains is purely a
  hygiene idea: replace the per-code overrides with a systemic per-ISCO
  fallback in `build-kldb-mapping.mjs` — if the best KldB candidate has
  stemOverlap 0 with `title.de`, prefer the "ohne Spezialisierung" class
  for that ISCO group rather than inventing a match. Low priority; only
  worth it if a new untracked specialty surfaces a fresh misroute.
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
- **Reconcile occupation list with official German Ausbildungsberufe.**
  **Shipped** via `feat/ausbildungsberufe-on-card` (2026-05-31): each result
  card surfaces the matching anerkannter Ausbildungsberuf as a grey note
  ("auch als Ausbildungsberuf: …"), shown only when the BIBB name
  meaningfully differs from our job title (268 visible notes). Data:
  `scripts/input/bibb-ausbildungsberufe.json` (BIBB Erhebungsberufe + KldB
  2010). Match: hybrid KldB-gate + title similarity (58 auto) plus a
  254-entry override file seeded from a 12-Sonnet majority-vote panel.
  Still open (independent follow-ups, not a planned sequence): (i) no
  `isAusbildungsberuf` flag on the corpus and no audit for *missing*
  canonical Ausbildungen (only the existing 923 O\*NET codes were matched);
  (ii) school-based Schulberufe (Erzieher, Pflege, Logopäde) aren't in the
  dual-system BIBB Tabelle 1; (iii) Schiffsmechaniker is absent from our
  vendored BIBB extract; (iv) the ~68 below-threshold and 24 panel-blanked
  candidates could be revisited opportunistically. Confirm BIBB licensing
  (attribution) before any wider reuse.
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
- **SOC "X and Y" combined codes — split into separate occupations.**
  Some O\*NET SOC codes lump two distinct occupations under one record
  (e.g. 19-3091.00 "Anthropologists and Archeologists"). O\*NET's
  workContext averages over both populations, producing distorted
  signals: 19-3091 has `indoor 3.74 / outdoor 2.42`, matcher computes
  `occEnv ≈ 1.84` ("mostly indoor"), penalising users with an outdoor
  preference even though archeologists clearly belong to the outdoor
  cluster. Anthropologists (office / teaching) drag the average down.
  Likely affects more codes than this one. Treat as its own session:
  (i) scan onet-occupations.json for SOC titles matching "X and Y" /
  "X / Y" patterns, (ii) for each, judge whether the two halves have
  meaningfully different workContext / interest profiles, (iii) split
  into two records with synthesised per-half workContext (manual or
  half-O\*NET / half-from-related-code). Surfaced 2026-05-30 by @mo-sp
  via Archäologe "draußen"-Malus complaint.
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

- **Startseite design refresh.** Content overhaul shipped via
  `feat/landing-content-overhaul` (2026-05-04). Remaining work: design
  refresh, ideally with claude-design help — independent of friends
  release, can ship as its own PR any time.

- **Concrete examples on every question** — many items (especially
  Skills / Abilities / Knowledge and Values) are abstract enough that
  users may not be sure what's meant. Add a short example per item.
  Scope: ≈ 238 examples across 60 RIASEC + 50 Big Five + 120 Skills + 8
  Values. Important before friends-test push but non-blocking.

  **Parked branch**: `feat/skills-examples-infra` already carries the
  infra (optional `example?: LocalizedText` field on `Question`,
  AssessmentPage renders it under the description with "z. B." prefix)
  + 6 seed skills examples (Active Listening, Mathematics, Oral
  Expression, Fluency of Ideas, Economics, Customer Service). @mo-sp
  wasn't happy with the prior curation pass and wants to restart fresh
  in a later session — pull the branch as a reference for the render
  shape, decide whether to keep / rewrite the seed 6, then continue the
  pass.

- **RIASEC content gaps the Session 54 review surfaced but did not fill.**
  Two holes in the 60-item set, both noted during the one-by-one pass and
  deliberately left for a future wording round: (i) **selecting or hiring
  people appears in no item at all**, although it is a core Enterprising
  activity; (ii) **Metallbau / Schweißen** is still missing from the
  Realistic block — "Zwei Metallteile miteinander verschweißen" was the
  undisputed runner-up with 9 second votes, so it is the obvious candidate
  if an R slot ever frees up. Filling either means displacing an existing
  item, so it needs a deliberate trade, not a drive-by addition.

- **Education 2-year vs 3-year split** — v1 uses the 4 KldB Anforderungsniveaus.
  Upgrade to true Ausbildungsdauer granularity would need BERUFENET-API per
  Ausbildungsberuf (~800 calls at build time). Only pursue if users ask.
- **Phase order — should Rahmenbedingungen come first?** Open design
  question. Pro current order (RIASEC first): higher-energy opening,
  "tell me about your interests" feels more engaging than "what's your
  desired education level". Pro Rahmenbedingungen first: hard filters
  (Anforderungsniveau, drinnen/draußen) take effect earlier, the
  RIASEC funnel then runs against a smaller, more relevant pool; also
  a "wer bist du, was sind deine Ziele" opening can be its own hook.
  Decision deferred — run both orderings against friends-test users
  before committing.
## Scoring

- **Should the education filter have a lower bound? Open question, not a
  decided change.** Surfaced by the second beta submission (2026-08-16, a
  friend of @mo-sp; analysis in the private repo). `EDUCATION_TO_MAX_ANF` in
  `matcher.ts` maps the layer-3 education answer to a **maximum** allowed KldB
  Anforderungsniveau, so the filter only ever removes occupations demanding
  *more* than the user wants. There is no floor: stating the highest
  willingness still leaves Anf-1 occupations at the top. Measured on that
  submission — Datentypist (Anf 1) sits at rank 1 unfiltered and rank 2 at
  every education level, for a user who rated "Benutzerkonten und
  Zugriffsrechte in einem IT-System verwalten" a 5. Survivors of the original
  top 20 *rise* with willingness (2 / 11 / 17 / 17 at levels 1 to 4), which is
  the opposite of what one would expect from the name.

  @mo-sp's position (2026-08-16): not convinced a floor is actually needed,
  but worth settling rather than leaving implicit. Arguments both ways before
  building anything — a hard floor would hide legitimate lower-tier matches
  from someone qualified but open, whereas a soft down-weight proportional to
  the distance below the stated level would not. Note it interacts with the
  layer-order question below, and with the flat-profile issue: this user
  answered 41 of 60 items at the minimum, and a flat low profile structurally
  favours low-complexity occupations because that is what a flat profile looks
  like. Not launch-blocking.

- **A low-C profile pushes software development out of reach, and the
  RIASEC layer alone decides it.** Surfaced by the first real beta
  submission (2026-08-14) and investigated the next day; the analysis quotes
  a real submission, so the numbers-with-profile version lives in the
  private `mo-sp/pathfinder-analysis` repo
  (`analyses/2026-08-15-dev-gap.md`). What is safe to record here is the
  mechanism, because it is a property of the corpus rather than of any one
  person:
  - For a **flat interest profile whose weakest dimension is C**, the dev
    occupations land around **#380 to #470 of 923** despite nothing being
    hard-filtered.
  - The layers do not agree: RIASEC contributes about **−37** percentage
    points where Big Five contributes **+25**. The personality layer votes
    for the occupation and is overruled by the interest layer, whose spread
    is roughly three times larger.
  - Cause is a single dimension. C is that user's lowest and the dev
    occupations' **second highest** (5.6–6.1 of 7), and Pearson compares the
    shape of the profile, not its height. Raising C alone, everything else
    held constant, moves Anwendungsprogrammierer to **#29** and then **#8**.
  - The same axis sorts the creative occupations across unrelated fields —
    Digitalkünstler (C 3.13) #9, Game-Designer (C 3.85) #39, Web-Entwickler
    (C 5.03) #461 — so this is not a quirk of the IT cluster.

  Two readings remain open and one run cannot separate them: either the C
  items measure the wrong thing (see the C-dimension entry above), or the
  low C is correct and this is the AI-uplift case (see Ideas). Decidable
  once more developers submit runs.
- **The skills layer barely moves the ranking — watch this.** Measured on
  the same run: spread across all 923 occupations was RIASEC **173.5**
  percentage points, Big Five **59.4**, Werte **17.7**, Skills **9.5**. The
  skills layer is **121 of the 239 questions**, roughly half the time a user
  spends in the test, for the smallest lever in the stack. Two causes, one
  structural (the bonus is capped at ±0.25 by design) and one behavioural
  (self-ratings cluster on the middle of the scale, so the user resembles
  every occupation about equally — the modesty effect the hobbies entry
  describes). Not an action item yet: check whether later submissions also
  cluster before deciding whether to recalibrate the cap, spread the
  ratings, or shorten the layer. @mo-sp: "sollten wir definitiv beobachten".
- **Anti-match "Was passt definitiv NICHT"** view — currently the "Alle Berufe
  zeigen" toggle reveals them; a dedicated inverse-sorted view would be
  clearer framing if users want it.
- **Baseline-shift for skills bonus** at occupation-level — all-zero users
  currently still get small positive bonuses on avg-complexity occupations;
  Session 15/16 calibration sorted most of this, edge cases may remain.
- **RIASEC short vs. long form / item redesign.** Session 22 observation: a
  single low outlier in one dimension, seen on a real test run, can
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
  long-form note above. **Update:** Session 54's one-by-one review
  reworked 6 of the 10 C items, but it optimised each item on its own
  merits, not for block coverage — the breadth question above is
  untouched and still open.
- **Neurodivergence — verify Big Five + Werte already discriminate.**
  Question raised 2026-05-30: should ADHD / autism / similar lifelong
  neurodivergent patterns feed a scoring bonus/malus? Hypothesis: Big
  Five already captures the underlying traits (Conscientiousness ↔
  structure need, Openness ↔ novelty tolerance, Extraversion ↔ social
  load) and Werte covers routine + sensory environment. Action: pick
  2-3 archetypal ND profiles (high-energy low-structure; sensory-
  cautious detail-focused; …), run them through the matcher with
  realistic Big-Five + Values inputs, see whether the top-10 already
  differentiates meaningfully. If yes: no new items, just communicate
  it. If no: sharpen Big-Five items in the under-discriminating
  dimensions rather than adding diagnosis labels — diagnoses as a
  scoring signal would be stigmatising and the empirical basis for
  "ADHD = bonus on creative roles" is pop-psychology, not job-
  suitability research. Same direction for other lifelong conditions
  if a real coverage gap surfaces.

## Ideas

- **Email the result to yourself.** Today the only way to take the top-20
  out of the app is copy-to-clipboard. Add "send my result to my email".
  Tension with the privacy principle (everything client-side, nothing
  leaves the browser without opt-in) — two routes: (a) a `mailto:` link
  with a pre-filled body; stays fully client-side, no backend, opens the
  user's mail client with ready text; limited formatting (plaintext,
  length cap). (b) real mail dispatch via a backend / mail service
  (opt-in); allows nicely formatted HTML/PDF but needs server infra + a
  GDPR review. Stage 1 = `mailto:` (fits the no-backend stance, free,
  immediately buildable); consider (b) only once the self-hosting infra
  exists anyway (see the Tech-debt entry). Surfaced 2026-05-31 by @mo-sp.

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

- **Hobbies as an optional Skills-layer enrichment (post-beta, redesigned).**
  Idea: capture what users *enjoy doing in their spare time* as extra
  signal — hobbies are less distorted by the modesty / status anxiety
  that skews the abstract Skills self-rating.

  **DEFERRED to post-beta + redesigned 2026-05-31.** The earlier
  "standalone layer at position 2 feeding a RIASEC nudge" spec was
  evaluated by 5 independent Sonnet reviewers (psychometric, redundancy,
  UX, data/maintenance, product). Verdict was near-unanimous: do NOT
  build the RIASEC-nudge version, and not before open-beta. Key findings,
  worth keeping:
  - **Psychometric (don't build as specced):** hobbies *are* RIASEC
    interests — Holland's own theory counts leisure among the expression
    modes of interest types, and Armstrong & Rounds (2008) show leisure
    interests map cleanly onto the RIASEC hexagon. Nudging RIASEC with
    hobbies re-measures the same construct with a noisier instrument; no
    new latent variable.
  - **Redundancy (don't build as specced):** the nudge is arithmetically
    tiny against the 60-item RIASEC anchor (<0.01 correlation shift), and
    the `max(skills, hobby)` rule means the layer contributes exactly 0
    for the ~80 % of users who don't simultaneously under-rate skills and
    have a strong overlapping hobby.
  - **Convergent fix (two reviewers independently):** if built, hobbies
    should feed the **Skills / Abilities** layer, NOT RIASEC. That is the
    one place hobbies add genuinely new signal — demonstrated, practiced
    ability the user under-reports in the abstract Skills self-rating
    (e.g. bushcraft → manual dexterity / naturalistic knowledge).
  - **Data/maintenance:** prefer per-domain RIASEC/ability vectors (8
    domains × 6 ≈ 48 values) over per-hobby (~480 hand-tuned values, no
    validated ground truth), with documented per-hobby overrides only
    where a hobby clearly diverges from its domain.

  **Revised design direction (agreed 2026-05-31 with @mo-sp):** not a
  standalone layer — an **optional enrichment step at the END of the
  Skills layer**. After the skills questions, ask "want to refine by
  adding your own hobbies/skills?". If yes: pick max 5 from a dropdown,
  each with its own scale; the picks feed the Skills/Abilities signal
  (not RIASEC). Optional + at the end = no early-funnel drop-off risk,
  and it lands as a "make my result more accurate" reward once the user
  is already invested.

  **Trigger to actually build:** post-beta, after ~20 friends-test
  completions, if (a) users spontaneously mention their hobbies weren't
  reflected, or (b) real data shows the Skills signal is weak enough to
  warrant an extra source. Otherwise stays parked here.

  **Taxonomy (research done 2026-05-30, no open data exists):**
  Curate ~80 items in 8 domains (Sport, Musik, Handwerk, Natur,
  Digital/Gaming, Soziales, Sammeln, Kreatives). Seed sources: SOEP
  Welle P Freizeit-Items (soep.de — ~18 items, validated for DE but
  coarse), DOSB Sportartenliste (dosb.de/sportarten — ~60 sports,
  structured), Wikipedia DE Kategorie:Hobby (~70 entries, flat).
  Explicitly add modern items missing from SOEP: gaming genres,
  streaming/content creation, social-media-natives — target group
  15–35.

  Surfaced 2026-04-25, re-scoped 2026-05-30, deferred + redesigned
  2026-05-31 by @mo-sp.
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

- **Handedness as scoring signal — REJECTED 2026-05-30.** Researched
  via general-purpose agent (Sonnet) before deciding. Effect sizes
  consistently d < 0.3 across all examined domains: Faurie & Raymond
  2005 (reactive-combat sports), Benbow 1986 / O'Boyle & Benbow 1990
  (STEM giftedness — OR ≈ 1.2-1.5, not replicated), Tate et al. 2011
  (no laparoscopic-surgery disadvantage). Heavy selection-bias confound:
  left-handers adapt lifelong to right-handed tools, so measured
  differences reflect adaptation, not inherent aptitude. No major
  vocational guidance institution (BIBB, IAB, O\*NET, BERUFENET) uses
  handedness as a matching criterion. Conclusion: not worth the
  measurement-noise cost; risk of producing a stigmatising signal on
  thin evidence. Logged here so the idea doesn't keep resurfacing —
  reopen only with a meta-analysis showing d ≥ 0.5 in a specific
  occupation cluster.

## Tech debt

- **Self-hosting follow-ups (migration shipped 2026-06-10).** The Vercel →
  Hetzner + Coolify migration is **done**: PathFinder is live at
  `https://pathfinder-berufetest.de` (Dockerfile build, Let's-Encrypt TLS,
  deployed from `main`, still `noindex`). Full detail in the
  `project_infra_decision` memory + SUMMARY Session 52. Remaining bits:
  (a) **`www` cert** — add `https://www.pathfinder-berufetest.de` to the
  Coolify Domains list so the certificate covers it (DNS already resolves);
  (b) an auto-deploy webhook if the manual deploy flow gets tedious;
  (c) later: Immich + Volume + Storage Box on the same box.

  Access-log IP anonymisation, once listed here as open, **shipped** — nginx
  logs the /24 (IPv4) or /48 (IPv6) network only. Remaining infrastructure
  posture, including anything not yet fixed, is tracked in the private ops
  notes rather than in this file.
- **Impressum: declined, revisit only if money is involved (2026-08-17).**
  The full **Datenschutzerklärung shipped** 2026-08-18 together with the
  `noindex` flip, written for indefinite operation: purposes and retention are
  phrased as criteria plus a backstop period (twelve months for submissions,
  90 days for server logs), so no future release date invalidates the text.
  The retention is enforced in `server/feedback/server.mjs` rather than left
  as a task someone remembers. The Art. 28 DSGVO
  Auftragsverarbeitungsvertrag with Hetzner, which renting a VPS does not
  include, was concluded by @mo-sp on 2026-08-18 (free, via
  `accounts.hetzner.com/account/dpa`, declared as Kommunikations- and
  Protokolldaten plus voluntary free-text feedback, affected group "Besucher
  der Website"). The privacy text names it. Nothing left open here.

- **Old Vercel deployment — paused, not deleted (2026-08-14).**
  `pathfinder-liard-phi.vercel.app` had still been answering 200 months
  after the move to the own domain: an unmaintained copy of the app with no
  Datenschutz-Hinweis, no log anonymisation, US-hosted — the opposite of
  what the current privacy notice claims. It surfaced because the
  share-clipboard text still linked to it, so every result copied out until
  then pointed there. Both halves are handled: the link now points at the
  own domain, and @mo-sp paused the Vercel project (verified from outside:
  `503 DEPLOYMENT_PAUSED`). Residual, low priority: the project still
  exists and could be deleted outright, and the leftover `vercel.json` is
  still in the repo.
- **Bundle size** — `onet-occupations-*.js` is 3.8 MB raw / 658 KB gzip. Code
  chunking is lazy-loaded so initial TTI isn't hit, but reducing the payload
  by dropping unused O\*NET fields (descriptions we don't render, etc.) would
  be tidy.
