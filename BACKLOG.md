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

- **Agreed pre-friends-beta sequence (2026-06-22, status 2026-08-14).**
  Open-beta (public / indexed launch) is **deferred** — Impressum, a full
  public Datenschutzerklärung, and the `noindex` flip stay parked (see Tech
  debt). Order before the friends-beta: (1) work the important non-open-beta
  BACKLOG items; (2) a **final review of ALL assessment questions, discussed
  one by one** (RIASEC 60 + Big Five 50 + Werte 8 + Skills 120) — this is the
  gate; (3) a **short, plain Datenschutz-Hinweis** on the site (transparency
  that voluntary feedback is sent anonymously to our server — not a full
  legal text) before collecting from real friends; (4) then open the
  friends-beta with the feedback feature switched on. Agreed with @mo-sp.

  **Where step (2) stands:** RIASEC 60 (Session 54, 33 items changed) and
  Werte 8 (Session 54, 2 items changed) are **done**. Still open, and the
  scope is **undecided**: Big Five 50 and Skills 120. Session 54's
  assessment was that neither warrants the full one-by-one tribunal — Big
  Five is the IPIP scale, so a **translation** review is the useful pass
  (its reverse-scored items are a known comprehension risk for younger
  readers), and the Skills items are O\*NET taxonomy labels rather than
  sentences, where a **sampling pass for systematic translation errors** is
  proportionate and the real gap is the missing-examples entry under UX
  polish. @mo-sp has not ruled on this yet.

  Also still open from the sequence: step (3), and the **production
  redeploy** that makes the merged feedback card live (the endpoint already
  runs; the frontend deploy was deliberately held for the beta launch).
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

  **GATED (decided 2026-08-14): ship this only with the public beta or the
  release, never during the friends-beta.** A donation link turns a private
  project into an offering with an income intent, which triggers the German
  Impressumspflicht (§5 DDG) plus a full Datenschutzerklärung — regardless of
  how few people have the link. The friends-beta gets away without an
  Impressum precisely because it is `noindex`, link-only, free and earns
  nothing. So the ordering is not a free choice: donation link and Impressum
  ship together, both after the friends-beta. (Not legal advice; @mo-sp's call
  on the risk.)
- **Feedback channel for beta testers — contact email (in-app form shipped).**
  The **self-hosted anonymous feedback form shipped** 2026-06-22 (a dependency-
  free `/api/feedback` endpoint on the Coolify box + an opt-in card on
  `/ergebnis`; see SUMMARY Session 53). Still open: a **contact email on the
  domain** — `kontakt@pathfinder-berufetest.de` (mail forwarder → @mo-sp's
  personal inbox), surfaced as a plain `mailto:` link next to the GitHub link,
  for qualitative reports the structured form doesn't capture. Surfaced
  2026-05-31 by @mo-sp.

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

- **Software development does not surface for a developer — first real
  beta run, 2026-08-14.** @mo-sp completed all 239 questions on production
  and submitted feedback: self-rating **3 of 5**, comment "Aber wo ist mein
  Beruf, Anwendungsentwickler?". His top 5 came back A-dominated (Tänzer,
  Konzeptkünstler, Choreograf, Landschaftsarchitekt, Industriedesigner)
  against a profile of RIASEC **A 74**, R 68, I 68, S 60, E 58, **C 48**
  and Big Five openness 76 / extraversion 30. Software development is I/C
  coded in O\*NET, and C is his lowest dimension — which is exactly the
  suspicion already filed under "C-dimension items still under-represent
  dev-flavoured Conventional" above. **Not yet investigated**: at what rank
  Anwendungsentwickler / Softwareentwickler actually land with these
  answers, and which stage loses them — the RIASEC correlation, the values
  hard filter, or the skills weighting. Worth its own session; the stored
  submission is the input data.
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
  Coolify Domains list so Traefik issues a cert + the www→apex redirect
  works (apex is fine; www still serves Traefik's self-signed cert);
  (b) **nginx access logs capture client IPs** — privacy-aligned decision
  (anonymize/disable) given the privacy-first stance; (c) Coolify
  housekeeping: instance-domain HTTPS dashboard, `.env` backup; (d) an
  auto-deploy webhook if the manual deploy flow gets tedious; (e) later:
  Immich + Volume + Storage Box on the same box.
- **Impressum + Datenschutzerklärung before a public/indexed launch.**
  **Deferred — open-beta postponed (see the pre-friends-beta sequence in Up
  next).** As soon as the site comes off `noindex` and is publicly reachable
  under the `.de` domain, DE law requires an Impressum (§5 DDG/TMG) and a
  DSGVO-compliant Datenschutzerklärung. Hard gate before flipping the
  robots meta. Note: a *short* plain Datenschutz-Hinweis (covering the
  voluntary feedback submission) is a separate, lighter friends-beta gate —
  tracked in Up next, not this full public obligation. Surfaced 2026-06-10
  during the go-live.

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
- **Backup freshness now that real data exists.** Both off-box backups
  (`feedback.jsonl` and, since 2026-08-14, `coolify-db` + its `.env`) are
  cron pulls onto the **dev-sandbox**, a VM @mo-sp starts by hand. The
  backup is therefore never fresher than that VM's last uptime: if the VPS
  died during a long VM-off stretch, everything submitted in that window
  would be gone. Hetzner's automatic backups (+20 %) are the only option
  that does not depend on the VM; @mo-sp declined them while there was no
  data to lose. **That premise expired on 2026-08-14** with the first real
  feedback submission, and it expires harder once friends start sending
  runs. Decide again, with the data now on the table.
