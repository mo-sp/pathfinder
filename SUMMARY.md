# SUMMARY.md – Claude Code Session Protocol

## Project: PathFinder
## Environment: dev-sandbox (192.168.178.33)

---

### Session 45 – 2026-05-04
**Focus:** Closed the BigFive coverage gap end-to-end. Three PRs on `feat/bigfive-isco-cascade`, `feat/bigfive-soc-sibling-fallback`, and `feat/bigfive-hand-curated-14`. Coverage of the 923-code corpus went from 754/923 (82 %) to 923/923 (100 %).

**Meta / process notes:**
- **Diagnose-first paid off.** The first move wasn't to start coding — it was a `scripts/audit/bigfive-coverage-gap.mjs` diagnostic that classified the unmapped codes by failure mode (Bucket A = no crosswalk row, Bucket B = unresolvable ESCO URI, Bucket C = ISCO-4d resolved but no Anni data) and projected sibling-recovery potential. Surfaced two corrections to the BACKLOG framing: real gap is 169 not 141 (the 782/923 subtraction was wrong because BigFive output includes 28 non-corpus codes), and Bucket B is empty (the resolver has no gaps — better than the BACKLOG entry suggested). Without the diagnostic, the first PR would have been guessing at recovery rates.
- **Three-tier cascade matches three semantic levels.** PR 1 added ISCO-3d → 2d sibling-imputation inside the existing crosswalk-driven loop, recovering all 150 Bucket-C codes (3d covered 136, 2d the remaining 22 — every single Bucket-C code had at least one ISCO-2d sibling with Anni data). PR 2 added a SOC-detail-sibling fallback OUTSIDE the crosswalk loop, walking the corpus to catch the 19 Bucket-A codes that bypass crosswalk entirely; recovered 5/19 (one more than the diagnostic projected, because the SOC-sibling pool now includes already-imputed profiles from PR 1, which let 51-8099.01 Biofuels recover via its 51-8099.00 cascade-imputed sibling). PR 3 hand-curated the final 14 with no SOC-detail siblings via `scripts/input/bigfive-curated-profiles.mjs` (anchored on closest 4d-direct Anni-mapped codes with optional ±1-2 T-score tweaks).
- **Provenance via side-channel, not in-profile.** Rather than adding a `source` field per profile (which would change the runtime `BigFiveProfile = Record<BigFiveDimension, number>` type), provenance lives in `meta.profileSourceCounts` (aggregate counts) + top-level `profileSources: Record<onetCode, tier>` map. Runtime consumers see no schema change; if we ever want to surface "imputed" markers in the UI, the data is there.
- **Imputation-leans-toward-mean is honest behavior, not a bug.** Imputed profiles cluster nearer the population mean (T=50) because wider averaging dilutes per-dimension signal. Spot-checked 11-9199.11 Brownfield Redev (soc-sibling-imputed, O=51.14 etc.) against its 11-9199.00/.10 anchors — average was correct. Conveyed this to @mo-sp before browser test so close-to-50 values weren't read as a bug.
- **Anchor choice forced one swap from 4d-imputed to 4d-direct mid-planning.** First-cut anchor list had 49-2022 Telekommunikationstechniker for AV Installers, but it was 3d-imputed (not real Anni data). Swapped to 49-2098 Servicetechniker Sicherheits-/Alarmanlagen [4d-direct] — same install-and-wire-electronic-signal-systems work pattern. Same swap on Conveyor Operators: 51-9023 Mischanlagenbediener [2d-imputed, near-mean] → 53-7065 Lagerarbeiter [4d-direct, real warehouse-tier signal]. Lesson: when authoring curated values, anchor on 4d-direct when at all possible — anchoring on imputed values would mean curated profiles inherit population-mean drift.
- **Anni's white-collar bias surfaced naturally in the gap distribution.** 70 % of Anni's 237 ISCO-4d profiles are in ISCO 1-4 (Managers/Professionals/Technicians/Clerical), only ~20 % in ISCO 6-9 (Skilled Agriculture/Trades/Operators/Elementary). The 169 unmapped corpus codes were correspondingly concentrated in trades and plant operators (ISCO 81xx alone had 40 unmapped, ISCO 71xx and 72xx another 30 combined). The 3d-cascade still works in those clusters because Anni HAS some sparse data per blue-collar 1d-group; it's just thinner.
- **Pacing — three small PRs in one session worked well.** Diagnostic + plan up front, each PR a single-concept change (cascade / soc-sibling / hand-curation), browser test between each, no rework. SUMMARY rides on this last PR per `feedback_summary_timing.md`. The BigFive entry was the lead "Up next" item; with it closed, Startseite content + design refresh and Concrete examples on every question are now the lead pre-friends-release candidates.
- **Terminology check mid-session.** @mo-sp asked twice for plain-language explanations: "white-collar vs. blue-collar" (he had it inverted) and "what does imputed mean". Both are jargon I'd lapsed into without noticing. Worth flagging as a behavioral pattern: when introducing statistical or domain-jargon mid-flow, glossing it inline costs nothing and prevents the user from having to interrupt. Existing `feedback_code_style.md` covers writing artifact language but not in-conversation explanation depth — not memory-worthy on its own, but a calibration note.

**What shipped — `feat/bigfive-isco-cascade` (PR #93, merged):**

*`scripts/build-bigfive-profiles.mjs`*: cascade in `buildProfiles`. Tier 1 = direct ISCO-4d match (existing). Tier 2 = average over Anni profiles sharing the first 3 digits with any resolved 4d. Tier 3 = same with first 2 digits. Build output now logs `Profiles by source: 4d=782 3d-imputed=136 2d-imputed=22 no-recovery=0`.

*`src/data/bigfive-occupation-profiles.json`*: regenerated. 940 total profiles (was 782); per-profile shape unchanged. New `meta.profileSourceCounts` + top-level `profileSources` map.

*`scripts/audit/bigfive-coverage-gap.mjs`*: new diagnostic. Reports corpus unmapped codes by bucket and projects sibling-recovery potential. Bucket B is empty; Bucket C fully recovered.

**What shipped — `feat/bigfive-soc-sibling-fallback` (PR #94, merged):**

*`scripts/build-bigfive-profiles.mjs`*: new `applySocSiblingFallback` runs after the ISCO cascade. Walks the corpus, finds codes with no profile yet, averages the BigFive profiles of any other O*NET code sharing the same SOC-detail prefix (first 7 chars). Recovered 5: 11-9199.11 Brownfield Redev, 17-1022.01 Geodetic Surveyors, 29-2099.08 Patient Reps, 31-9099.02 Endoscopy Tech, 51-8099.01 Biofuels Tech.

*`src/data/bigfive-occupation-profiles.json`*: 945 total profiles.

**What shipped — `feat/bigfive-hand-curated-14` (PR #95, this PR):**

*`scripts/input/bigfive-curated-profiles.mjs`*: new file with 14 hand-authored entries. Each anchored on closest 4d-direct Anni-mapped O*NET code, with optional ±1-2 T-score tweaks documented in `_notes`. Anchors used: 11-3071 Logistik-/Vertriebsmanager (Postmasters), 13-1023 Einkäufer Industrie (Wholesale Buyers), 13-1071 Personalberater (Farm Labor Contractors), 21-1014 Sozialarbeiter Psych. Gesundheit (Mediators), 21-1091 Public Health Referent (Farm/Home Educators), 33-9032 Fachkraft Schutz/Sicherheit (Loss Prevention), 35-9021 Küchenbedienstete (Cafeteria), 39-1014 Teamleiter Freizeit (Personal Service Sup), 47-2141 Maler (Tapers), 49-2098 Servicetechniker Sicherheits/Alarm (AV Installers), 49-9071 Wartungsmonteur (IMR Helpers), 51-4041 Zerspanungsmechaniker (Layout Workers), 17-3023 Elektroniker Automatisierung (Traffic Tech), 53-7065 Lagerarbeiter (Conveyor Operators).

*`scripts/build-bigfive-profiles.mjs`*: new `applyCuratedFallback` runs as the final tier. Loads the curated file via dynamic import (`.mjs`), applies entries only when no other tier produced a profile (conditional fallback — if a future ESCO-crosswalk update gives one of these codes a real ISCO partner with Anni data, the curated override is skipped silently). `main()` is now async to await the dynamic import.

*`src/data/bigfive-occupation-profiles.json`*: 959 total profiles. `meta.profileSourceCounts` now includes `pathfinder-curated: 14`; `profileSources` tags each curated code with `pathfinder-curated-2026-05`.

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Corpus codes with BigFive profile | 754 / 923 | **923 / 923** = 100 % |
| Profile sources: 4d-direct | 782 | 782 |
| Profile sources: 3d-imputed | 0 | **136** |
| Profile sources: 2d-imputed | 0 | **22** |
| Profile sources: soc-sibling-imputed | 0 | **5** |
| Profile sources: pathfinder-curated | 0 | **14** |
| Tests passing | 243 | 243 (data-only changes) |

**Branches:** `feat/bigfive-isco-cascade` (PR #93, merged), `feat/bigfive-soc-sibling-fallback` (PR #94, merged), `feat/bigfive-hand-curated-14` (PR #95 with this docs commit, this PR).

**Open for next sessions (tracked in BACKLOG):**
- **Startseite content + design refresh.** Promoted to lead "Up next" — pre-friends-release content overhaul (current state, value-prop, 4-layer stack, privacy claim) + optional design refresh with claude-design help (latter ships independently).
- **Concrete examples on every question.** ≈ 238 examples across RIASEC/BigFive/Skills/Values items. Important pre-friends-release but explicitly non-blocking.
- **Various Data quality + Scoring + Tech debt items** unchanged from prior sessions.

---

### Session 44 – 2026-05-04
**Focus:** Closed the 10-agent Sonnet coherence audit pipeline that started Session 36, then a small follow-up bundle for the 7 pre-existing title duplicates + a residual KldB drift bug + one consistency polish. Two PRs on `fix/audit-batch-17-soc51-production` and `fix/title-dedupe-bundle`. With the audit closed, ~396/402 findings applied across 17 batches over 9 sessions; ~6 documented Rejects remain.

**Meta / process notes:**
- **Pipeline closed cleanly with one extra-large dedicated SOC group.** SOC 51 Production was the last big-three SOC remaining (43 findings), walked as a single bundle in PR #91 instead of split across two sections — @mo-sp explicitly chose "alles auf einmal" mid-session, breaking the 2-sections-per-PR pattern that held cleanly through batches 1-16 (~75 findings was the prior session ceiling). The plan-table format scaled to 43 rows without process drag; one Reject (51-4021 mixed-material Extruding/Drawing — agent sug=null, current 24122 Metallumformung is best-fit for Metall-Hauptlast, mixed metal+plastic SOCs unresolvable in single-domain KldB) plus 1 dedupe follow-up (51-2023 → "Elektromechanik-Monteur" instead of "Elektromechaniker" to differentiate from 49-2092 Repairers — caught by the post-build dedupe scan).
- **One follow-up dedupe-rename caught by `feedback_dedupe_renames.md` procedure.** The new memory from Session 43 paid off immediately: post-build scan flagged 51-2023 + 49-2092 collision, fixed in-place before browser-test handoff. Pattern is now stable (3 batches running with the procedure: batch-15 Hebamme, batch-16 Recyclingfachkraft, batch-17 Elektromechaniker). No more browser-test surprises from rename-induced duplicates.
- **Session-24 archaeology — 17-2199.10/11 Sprengtechnik "soft suppression" surfaced.** While walking the 7 BACKLOG title duplicates, looked up 17-2199.10 Wind + 17-2199.11 Solar and found both still pinned to KldB 21124 Sprengtechnik (😱 explosives, totally wrong domain). @mo-sp asked "did we already fix that?" — git archaeology revealed Session 24 (commit 888f2da, 2026-04-19) explicitly chose NOT to remap these because no clean target was identifiable at the time; instead set `kldbName: null` to suppress the wrong subtitle from rendering, but left `kldbCode: "21124"` in place. Session 26 (commit 4b6200d) then pinned that "soft-suppressed" state into the seed file. The bug was UI-invisible (null kldbName → no subtitle rendered, fallback to category-only) but the wrong code lived in the dataset for ~15 days. Today's fix (PR `fix/title-dedupe-bundle` commit 1) completes Session 24's intent retroactively: 26244 regenerative Energietechnik Anf 4, parallel to 17-2199.03 General Energy Engineers (already correctly pinned via batch 12). Lesson: "soft suppression" via null-name + wrong-code is a debt pattern worth grepping for periodically — git diff for `kldbName: null` instances flags candidates for revisit when the catalog catches up.
- **All 7 BACKLOG title duplicates resolved cleanly along SOC distinction.** Each pair has a real distinction that carries into the German label: 11-2033 Fundraising Managers (Director-tier) ↔ 13-1131 Fundraisers (Specialist-tier) → "Fundraising-Leiter" vs "Fundraiser"; 13-1022 Wholesale/Retail Buyers (B2C/Großhandel) ↔ 13-1023 Purchasing Agents (B2B procurement) → "Einkäufer Handel" vs "Einkäufer Industrie"; 17-2199.03 General Energy ↔ 17-2199.10 Wind Energy → "Energieingenieur" vs "Ingenieur Windenergie" (parallel to 17-2199.11 "Ingenieur Solartechnik"); 19-3033 Clinical/Counseling Psych ↔ 19-3039.03 Neuropsych → "Klinischer Psychologe" vs "Klinischer Neuropsychologe"; 27-2022 Sport Coaches ↔ 39-9031 Exercise Trainers → "Sporttrainer" vs "Fitnesstrainer"; 31-2021 PT Assistants ↔ 31-2022 PT Aides → "Physiotherapieassistent" vs "Physiotherapiehelfer"; 41-9021 RE Brokers ↔ 41-9022 RE Sales Agents → "Immobilienmakler" vs "Immobilienkaufmann" (IHK-Beruf for the employed-agent tier). Dedupe scan after build: 0 duplicate groups, down from 7 pre-existing. Discussion-bullet picks confirmed cleanly with @mo-sp ("industrie it is" picked option B "Einkäufer Industrie" over the other 3 alternatives).
- **45-3031 Fishing/Hunting Workers kept as-is per @mo-sp pushback.** Originally proposed a Fischer-only rename ("Fischwirt") because SOC 45-3041 Hunters/Trappers is not in our corpus — but @mo-sp pushed back wanting both fisher and hunter representation preserved in the combined SOC label. Item dropped from the bundle. The original BACKLOG entry stays (left for future opportunistic rephrasing if a cleaner non-compound title surfaces).
- **PR-body language slip caught.** First version of PR #91 body had German technical terms slipping into English prose ("...for Metall-Hauptlast", "anf-up von 26301...", "Steuerer/Steuerin Klassennamen-Stil", "gegen agent's Glas-Pin"). @mo-sp caught it; replaced with fully English version (KldB class names + DE occupation titles kept as proper nouns). Existing memory `feedback_git_docs_english.md` already covers the rule unambiguously — pure inattentiveness, no memory update needed.
- **BACKLOG retired the audit-pipeline + dedupe entries; BigFive coverage is now lead.** Two top "Up next" entries shipped this session, removed in PR `fix/title-dedupe-bundle` commit 3. BigFive coverage gap (169/923 occupations without profile) is now the lead candidate for next session.

**What shipped — `fix/audit-batch-17-soc51-production` (1 PR + 1 follow-up Elektromechanik-Monteur commit, merged):**

*`scripts/input/kldb-overrides.mjs`*: 24 batch-17 entries (16 Apply, 2 seed pull-outs, 6 Modify); 1 explicit Reject (51-4021); 5 codes title-only no-KldB-change. Heaviest cluster: Metallbearbeitung-Domain-Pivot across 5 codes (22302/24112/24122/24202/24222/24232/24302/24422 by exact spanend / umformend / giessend / schweissend / oberflächen-Domain): 51-4032 Drilling Metal+Plastic 22302 Holzbearbeitung (Stem-Drift "Bohrer") → 24232 spanende (Modify against agent's 24202 ohne-Spez.); 51-4033 Grinding 22302 → 24222 schleifend; 51-4035 Milling 24202 ohne-Spez. → 24232 spanend (Modify-beyond-flag, parallel to 51-4032); 51-4072 Casting 24122 Umformung → 24132 Gießerei; 51-4193 Plating 24222 schleifend → 24302 Metalloberflächenbehandlung (Modify against agent's null suggestion). Furnace-tier reconciliation: 51-4051 Metal-Refining Furnace 24113 Hüttentechnik komplex Anf 3 specialist → 24112 fachlich Anf 2 + Title "Schmelzofensteuerer" → "Schmelzer" (anf-down 3→2, Schmelzer is IHK-Geselle-tier not specialist). anf-up 26301→26302 across 4 codes: 51-2021 Coil Winders 22102 Kunststoff (Stem-Drift Glasfaser) → 26302 Elektrotechnik fachlich + Title → "Spulenwickler"; 51-2023 EMEA 26301 Helfer Anf 1 → 26302 Anf 2 + Title "Elektroanlageninstallateur" → "Elektromechanik-Monteur" (Mechatroniker-tier required by SOC's servo/gyro/tape-drive scope; follow-up rename for dedupe vs 49-2092 "Elektromechaniker"); 51-4122 Welding Machine 26301 Helfer (Domain-Drift Wellenlöten = Elektronikfertigung) → 24422 Schweiß-/Verbindungstechnik fachlich Anf 2; 51-9141 Semicon Tech 26301 Helfer → 26302 Anf 2 (Mikrotechnologe-IHK-tier). Steuerer/Steuerin → established titles for 4 codes (51-8011 → "Kraftwerksoperateur (Kerntechnik)"; 51-8012 → "Netzleitoperator"; 51-8091 / 51-9011 → "Anlagenfahrer Chemie" / "Anlagenfahrer Chemische Verfahrenstechnik" parallel to existing 51-8092/8093 cluster). Multi-material SOCs pivot to 25122 mat-agnostic across 2 codes (51-9021 Crushing/Grinding 21222 Baustoffe → 25122; 51-9041 Extruding/Forming 22102 Kunststoff → 25122 Modify against agent's 21312 Glas — SOC covers Glas+Lebensmittel+Gummi+Seife+Keramik). Catalog-only-Anf positive sibling-up at 51-6011 Laundry: 54101 Reinigung-Helfer Anf 1 (seed) → 54132 Textilreinigung Anf 2 (IHK-Beruf "Textilreiniger" exists as direct sibling, parallel to Session-43 53-2021 ATC catalog-positive resolution). Other notable Apply: 51-2031 Engine/Machine Assemblers 25232 Luft-/Raumfahrt → 25112 generic Maschinen-/Gerätezusammensetzer; 51-2092 Team Assemblers 27303 Produktionsplanung komplex → 25112 Anf 2 (anf-down 3→2); 51-3091 Food/Tobacco Roasting 22312 Holztrocknung (Stem-Drift) → 29282 Lebensmittel-sonstige (pull-out from seed); 51-6062 Textile Cutting 28332 Schuhherstellung (Domain-Drift Oberlederzurichter) → 28102 Textiltechnik; 51-6091 Synthetic Fibers 21312 Glas → 22102 Kunststoff; 51-8013.03 Biomass 41333 chem. Verfahren → 26243 regenerative Energietechnik; 51-9031 Cutters/Trimmers Hand 28332 Schuhherstellung → 28222 Bekleidung; 51-9162 CNC Tool Programmers 43412 Softwareentwicklung 😱 → 24232 spanend (IT-Programmierer-Drift fixed); 51-9192 Cleaning/Pickling 23112 Papier (Stem-Drift) → 29202 Lebensmittel; 51-9193 Cooling/Freezing 29102 Getränke → 29202 Lebensmittel; 51-9198 Production Helpers 21201 Naturstein-Helfer → 25101 generic Maschinenbau-/Betriebstechnik Helfer (Modify against agent's null).

*`scripts/input/title-overrides-de.mjs`*: 35 batch-17 entries (33 new + 1 in-place modify of 51-3092 "Lebensmittelproduktion Chargenherstellung" → "Fachkraft für Lebensmitteltechnik" + 1 follow-up rename of 51-2023). Title-only fixes for 9 codes where KldB stays correct: 51-2022 → "Elektrogerätemontierer"; 51-2051 → "Faserverbundkunststoff-Mechaniker"; 51-4121 → "Schweißer" (was "Löter" — too narrow, SOC covers all 4 weld/cut/solder/braze methods); 51-4191 → "Wärmebehandler" (was ungrammatical "Konvertermann/Konverterfrau"); 51-6041 → "Schuhmacher"; 51-6051 → "Handnäher"; 51-6061 → "Textilveredler" (was "Färbereitechniker" — Techniker implies Anf-3, SOC is Anf-2); 51-9012 → "Verfahrenstechniker Milchverarbeitung"; 51-9022 → "Schleif- und Polierarbeiter" (was "Flachglasschleifer" — too narrow, SOC is multi-material hand). Plus 14 title-only entries coupled with KldB changes from above.

**What shipped — `fix/title-dedupe-bundle` (3 commits + this docs commit, this PR):**

*Commit 1 — dedupe + 17-2199 KldB drift fix*: 8 title overrides (1 in-place modify of 13-1022 "Einkäufer" → "Einkäufer Handel"; 7 new entries for the other side of each duplicate pair); 3 KldB overrides (1 new for 13-1022 → 61212 Groß-/Außenhandel Anf 2 to fix the unmapped null state; 2 seed pull-outs for 17-2199.10 + 17-2199.11 from 21124 Sprengtechnik → 26244 regenerative Energietechnik Anf 4 — Session-24 archaeology fix). Dedupe scan after build: 0 groups (was 7).

*Commit 2 — 51-3093 polish*: 1 in-place title modify ("Lebensmittelmaschinenführer" → "Maschinen- und Anlagenführer Lebensmitteltechnik"); IHK-style consistency parallel to batch-17 51-9111 "Maschinen- und Anlagenführer Verpackungstechnik". KldB 29202 unchanged.

*Commit 3 — BACKLOG retire shipped items*: removed audit-batch-17 entry (shipped via `fix/audit-batch-17-soc51-production`) and pre-existing-title-duplicates entry (shipped via this PR's commit 1) from "Up next". BigFive coverage gap (169/923) is now the lead.

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 354 / 402 | **396 / 402** (+42 batch 17 incl. 1 Reject) |
| Audit findings remaining | ~48 | **~6** (= documented Rejects across 17 batches) |
| Codes in seed block | 60 | **56** (–2 batch 17: 51-3091, 51-6011; –2 cleanup: 17-2199.10, 17-2199.11) |
| Manual KldB overrides applied on build | 400 | **456** |
| Title overrides applied | 367 | **417** |
| Tests passing | 243 | 243 (data-only changes) |
| Title duplicate groups (dedupe scan) | 7 pre-existing | **0** |

**Branches:** `fix/audit-batch-17-soc51-production` (1 code commit + 1 follow-up Elektromechanik-Monteur commit → PR merged; merge commit `9d3184e`); `fix/title-dedupe-bundle` (3 commits + this docs commit → PR open).

**Open for next sessions (tracked in BACKLOG):**
- **BigFive coverage gap — 169/923 occupations have no BigFive profile.** Now the lead "Up next" item; foundation significantly cleaner after the audit pipeline closed. Fix options span sibling-imputation (per-ISCO-3d → 4d → 2d → SOC-sibling cascades, recovers ~155/169) plus hand-curation for the 19 no-crosswalk codes via `scripts/input/curated-occupation-profiles.mjs`.
- **5 documented audit Rejects across 17 batches** (~1 per session): 47-2011 Boilermakers, 17-2171 Petroleum, 17-2051 Civil, 53-4041 Subway/Streetcar, 29-1071 Physician Assistants, 51-4021 Mixed-Material Extruding. Not actionable without a richer KldB catalog or multi-domain SOC support.
- **45-3031 Fishing/Hunting awkward title.** Stays in BACKLOG — @mo-sp wants both fisher + hunter representation preserved, dropped from this bundle.

---

### Session 43 – 2026-05-04
**Focus:** Audit-pipeline batches 15 + 16 — two sections, 77 findings total from `scripts/audit/findings-2026-04-25.json` walked through the plan-table gate. Sektion 1 (SOC 29 Healthcare Practitioners and Technical = 43 findings) and Sektion 2 (SOC 53 Transportation and Material Moving = 34 findings). Two PRs on `fix/audit-batch-15-soc29-healthcare` and `fix/audit-batch-16-soc53-transport`. First session attacking two of the big-three remaining SOC groups (29, 51, 53 with 120 findings) — chose 29+53 as maximally domain-mixed pair (Healthcare Pflege/Medizin ↔ Transport Operators/Logistik) over 29+51 = 86 findings.

**Meta / process notes:**
- **Two browser-test title duplicates surfaced back-to-back, both via @mo-sp catch.** Batch 15 created 29-1161 Nurse Midwives + 29-9099.01 Midwives both rendering as "Hebamme/Entbindungspfleger" (after the 29-1161 title-fix and 29-9099.01's pre-existing ESCO-default collided). @mo-sp's mental model surfaced the SOC-distinction cleanly: "das eine ist die selbstständige hebamme und die anderen pflegespezialisierung?" — exactly right (29-1161 = US Certified Nurse Midwife via RN→Master, 29-9099.01 = Direct-Entry Midwife). Differentiated as 29-1161 = canonical clinical "Hebamme/Entbindungspfleger" + 29-9099.01 = "Freiberufliche Hebamme/Freiberuflicher Entbindungspfleger". Then batch 16 created 53-1042.01 Recycling Coordinators + 53-7062.04 Recycling and Reclamation Workers both at variants of "Recyclingfachkraft". Same fix pattern: differentiate by tier/role — 53-1042.01 (Anf 3 supervisor) → "Recyclingkoordinator", 53-7062.04 (Anf 2 hands-on) keeps "Recyclingfachkraft". @mo-sp explicitly asked "bitte immer nach möglichen duplikaten in den renames suchen" — codified as new memory `feedback_dedupe_renames.md` with one-liner normalized-scan command (lowercase + strip whitespace/hyphens/slashes catches "Recycling-Fachkraft" vs "Recyclingfachkraft"). Pre-existing duplicates not from this session (7 found: Fundraiser, Einkäufer, Energieingenieur, Klinischer Psychologe, Sporttrainer, Physiotherapieassistent, Immobilienmakler) flagged for BACKLOG.
- **Heaviest seed pull-out density of the audit pipeline so far — 18 across the session.** Batch 15: 6 (29-1031 + 29-2011.02 + 29-2036 + 29-2055 + 29-9092 + 29-9093) — and notably 4 of 6 surfaced only as `no-dupe-keys` lint errors AFTER the first build, not via pre-edit grep. Batch 16: 12 (53-1044 + 53-3031 + 53-3033 + 53-3053 + 53-4022 + 53-5011 + 53-6021 + 53-6032 + 53-7021 + 53-7041 + 53-7051 + 53-7065) — caught all via the pre-edit grep this time (per Session-42 lessons-learned). The procedure-memory's quote-agnostic grep pattern from `feedback_audit_batch_procedure.md` worked cleanly on the second batch but the first batch still showed the gap. Lesson: even with quote-agnostic grep on the SOC prefix, the seed-block is large enough (130+ entries) that a multi-line code-search isn't always exhaustive — running an early no-op build after writing the new block to surface lint duplicates fast is now part of the loop.
- **First catalog-only-Anf instance with a positive sibling-up resolution.** 53-2021 Air Traffic Controllers: agent flagged Anf 3→4 (DFS-Ausbildung is bachelor-grade in DE practice). Catalog-Lookup: 51534 (Überwachung Luftverkehrsbetrieb hoch komplex Anf 4) EXISTS as direct sibling-up from 51533 — first time in the audit pipeline a catalog-only-Anf-flag resolved positively into a real Anf-4 sibling rather than catalog-pivoting to a generic ohne-Spez. class. Sister codes 51522/51523 (Eisenbahn) and 51512/51513 (Straße) cap at Anf 3, so the Anf-4 sibling is unique to Luftverkehr — the bachelor-grade ATC training is canonical enough that KldB modeled it. Documented as a new variant of the catalog-only-Anf-Pattern: "if catalog HAS the higher-Anf sibling, sibling-up; only fall back to generic-ohne-Spez. when it doesn't".
- **Healthcare cluster-drift density reached its theoretical maximum.** Batch 15 had 7 codes drifting OUT of Ergotherapie-Cluster (81722/3/4) — into Diät-/Ernährungstherapie 81762/4, Heilkunde 81753, Podologie 81772, Funktionsdiagnostik 81222, Radiologie 81232, Physio 81712/3. Plus 7 Facharzt-Domain corrections out of 81414 Kinder/81814 Pharma/81784 nicht-ärztl./82524 Augenoptik/11394 Pferdewirtschaft into 81404/81424/81444/81484. Plus 4 Biologie 41203/41204 → 81213 Medtech Labor (parallel to batch-10 SOC 19 pattern). Plus 4 Pflege/OP-cluster realignments to 81302/81313/81332. SOC 29's stem-overlap-tiebreaker drifts were so concentrated in 81722/3/4 because "-therapeut" is a stem-magnet: any DE-rendered "Therapeut" caught the Ergotherapie cluster regardless of actual therapy domain. Once detected the fix is mechanical: domain-pivot to the right Therapie-Familie 4d-class, keep the Anf-tier.
- **Transport-Driver-Domain-Pivot pattern stabilized as a new family.** Batch 16 had 4 codes wandering between 52112/52122/52132/52182 (Driver-Sales = LKW, Light Truck = LKW, Shuttle/Chauffeur = PKW, Parking = sonstige). Pattern: SOC's "driver" plus a qualifier (sales / light truck / shuttle / parking) is at high risk of drifting to the wrong sub-class because the qualifier and the canonical class don't always align (Chauffeur drifts to Bus, Light Truck drifts to PKW). Rule for future SOC pivots in 5210-5218: read SOC's *primary* tätigkeit-noun (transport people vs goods vs park-only) over the qualifier. KldB drives are split tightly by purpose, not by vehicle.
- **One Reject this session — 53-4041 Subway/Streetcar Operators.** Agent suggested 51112 tech Eisenbahn but 51112 is Signalmen/Dispatcher (non-Operator); 52132 (current seed) Bus-/Straßenbahn covers Streetcar = Straßenbahn cleanly, and U-Bahn is commonly classified analogously in DE practice. Total Rejects through audit: 47-2011 Boilermakers + 17-2171 Petroleum + 17-2051 Civil + 53-4041 Subway/Streetcar + 29-1071 Physician Assistants (catalog-only — no Anf-4 sibling in 8110x for non-physician medical) — five so far across 16 batches. False-positive density holding at ~1 per session, no escalation pattern.
- **Modify-vs-agent count: 6 in batch 15 + 4 in batch 16 = 10 total.** Now ~5 per batch. Holding at the same density as Sessions 38-42; pattern is stable. Notable Modifies this session: 29-1141.02 APRN (agent's 81634 nicht-ärztl. Psychotherapie → 81313 Fachkrankenpflege Anf 3 + title "Fachkrankenpfleger Psychiatrie" — APRN sind in DE-Lesart Fachkrankenpfleger, keine Psychotherapeuten); 29-2055 OTA (agent's 81103 Anf 3 → 81332 Anf 2 — KldB-Konvention für 3-jährige Berufsausbildung); 29-2099.01 Neurodiagnostik (agent's 81212 Labor → 81222 Funktionsdiagnostik — EEG ist Funktionsdiagnostik in DE, nicht Labor); 29-2099.05 Ophthalmic Med Tech (agent's null → 81182 Med-FA sonstige); 53-1041 Aircraft Cargo Supervisors (agent's 51332 Anf 2 fachlich → 51393 Anf 3 Aufsichtskraft — First-Line Supervisor needs Aufsichtskraft-Tier, not fachlich).
- **Title-Konsistenz-Reject-Pattern revisited in batch 15.** Agent flagged 3 title-awkward issues for "MTA <X>"-pattern codes (29-2032 Sonografie, 29-2099.01 Neurodiagnostik, 29-1124 MTRA Strahlentherapie). All three rejected to preserve consistency with sister codes 29-2034 "MTA Radiologie" and 29-2035 "MTA MRT" that deliberately use the compact form. Rule: when an audit flags a title-awkward issue on a title that's part of an established cluster-pattern in title-overrides-de.mjs, check the cluster first — consistency usually wins over more-correct-but-isolated long form.
- **One title-only entry surprised: 53-3051 Bus Drivers School needed a NEW title-override, not in-place modify.** The batch-15 plan listed it as in-place modify (memory of post-batch-15 state) but on the fresh main-based branch the override didn't exist (came from ESCO default "Oberleitungsbusfahrer"). Caught at edit-time and switched to NEW entry. Pattern note: when planning a session that branches a second batch from main mid-session, the intermediate state of title-overrides-de.mjs reflects ONLY what's in main, not the previous batch's not-yet-merged additions. Pre-edit grep needs to anticipate this.

**What shipped — `fix/audit-batch-15-soc29-healthcare` (1 PR + 1 follow-up Hebamme commit, merged):**

*`scripts/input/kldb-overrides.mjs`*: 39 batch-15 entries (28 Apply, 6 seed pull-outs, 6 Modify reconciliations); 1 explicit Reject (29-1071 Physician Assistants — catalog has no Anf-4 sibling in 8110x branch; pivot to Ärzte-Klassen would overstate PA as Arzt); 2 title-only with no KldB change (29-1131 Veterinarians, 29-9021 Health Information Technologists). Heaviest cluster: Ergotherapie-drift (7 codes) — 29-1011 Chiropractors 81724 → 81753 Heilkunde Anf 3; 29-1081 Podiatrists 81724 → 81772 Podologen Anf 2; 29-1123 Physical Therapists 81714 → 81712 Anf 2 (sibling-down); 29-1126 Respiratory Therapists 81782 → 81783 Anf 3 (sibling-up + title "Atmungstherapeut"); 29-2032 Sonografie 81723 → 81222 Funktionsdiagnostik; 29-2033 Nuclear Medicine 81723 → 81232 Radiologie; 29-2099.01 Neurodiagnostik 81723 → 81222 Funktionsdiagnostik (Modify gegen agent's 81212 Labor); 29-2051 Dietetic Technicians 81722 → 81762 Diät-/Ernährungstherapie; 29-9091 Athletic Trainers 81714 → 81713 Anf 3 (sibling-down). Facharzt-Domain-corrections (7 codes): 29-1212 Cardiologists 81414 Kinder/Jugend → 81424 Innere Medizin; 29-1213 Dermatologists 81414 → 81444 Hautkrankh./Sinnesorg.; 29-1216 General Internal Medicine 81814 Pharmakol. → 81424 Innere + Title "Physiologe" → "Internist"; 29-1224 Radiologists 81784 → 81484 Ärzte sonstige; 29-1229.04 Phys. Med. & Rehab. 81714 → 81484 + Title "Fachphysiotherapeut" → "Facharzt für Physikalische und Rehabilitative Medizin"; 29-1229.06 Sports Medicine 11394 Pferdewirtschaft 😱 → 81404; 29-1241 Ophthalmologists 82524 Augenoptik → 81444. Zahnmedizin: 29-1023 Orthodontists + 29-1024 Prosthodontists 82513 Orthopädie/Reha-Tech → 81474 Zahnärzte (KldB+Anf 3→4). Pflege/Geburtshilfe/Psychiatrie: 29-1141 Registered Nurses 81393 Aufsichtskräfte → 81302 Pflege ohne-Spez. Anf 2; 29-1141.02 APRN 81614 → 81313 Fachkrankenpflege Anf 3 + Title "Fachkrankenpfleger Psychiatrie" (Modify gegen agent's 81634 nicht-ärztl. Psychotherapie); 29-1151 Nurse Anesthetists 81103 → 81313; 29-1161 Nurse Midwives 84214 Lehrkräfte 😱 → 81353 Geburtshilfe Anf 3 + Title "Hebamme/Entbindungspfleger"; 29-2061 LPN/LVN 83142 Haus-Familienpflege → 81302 + Title "Krankenpflegeassistent" → "Krankenpflegehelfer" (etablierter); 29-2053 Psychiatric Technicians 83122 Sozialarbeit → 81302 + Title → "Psychiatriepfleger". Biologie-Cluster: 29-2011 Lab Technologists 41203 → 81213 Medtech Labor; 29-2011.02 Cytotechnologists 41204 → 81213 (pull-out + KldB+Anf 4→3); 29-2011.04 Histotechnologists 41203 → 81213; 29-9092 Genetic Counselors 41204 → 41274 Humanbiologie. OP-Cluster: 29-1071.01 Anesthesiologist Assistants 81623 klin. Psychologie 😱 → 81333 OP-/medtech Assistenz; 29-2055 OTA 81102 → 81332 Anf 2 (Modify gegen agent's 81103 Anf 3, pull-out); 29-9093 OP-Assistant 81102 → 81332 (pull-out). Sonstige: 29-1031 Dietitians 41204 (seed Futtermittelwissenschaftler) → 81764 Diät-/Ernährungstherapie hoch (pull-out); 29-1122.01 Low Vision Therapists 83124 Sozialarbeit → 81784 Anf 4 (Modify gegen agent's 81783 Anf 3 — Reha-Lehrer ist Hochschulqualifikation); 29-1181 Audiologists 81734 Sprachtherapie → 81784; 29-1292 Dental Hygienists 81112 → 81113 Anf 3 (sibling-up); 29-2036 Medical Dosimetrists 81233 (seed) → 81234 Anf 4 (pull-out + sibling-up); 29-2043 Paramedics 81342 → 81343 Anf 3 (sibling-up); 29-2099.05 Ophthalmic Med Tech 81132 → 81182 Med-FA sonstige (Modify gegen agent's null).

*`scripts/input/title-overrides-de.mjs`*: 11 batch-15 entries (8 new + 2 in-place + 1 follow-up Hebamme-Differenzierung). Neue: 29-1126 → "Atmungstherapeut"; 29-1131 → "Tierarzt"; 29-1141.02 → "Fachkrankenpfleger Psychiatrie"; 29-1161 → "Hebamme/Entbindungspfleger"; 29-1216 → "Internist"; 29-1229.04 → "Facharzt für Physikalische und Rehabilitative Medizin"; 29-2053 → "Psychiatriepfleger"; 29-9021 → "Medizinischer Dokumentationsassistent". In-place: 29-2061 (war "Krankenpflegeassistent" → "Krankenpflegehelfer"); 29-2099.05 (war "Ophthalmologisch-technischer Assistent" → "MTA Ophthalmologie"). Follow-up commit: 29-9099.01 → "Freiberufliche Hebamme / Freiberuflicher Entbindungspfleger" (differenziert vs. 29-1161). 3 title-awkward agent-flags rejected (29-2032 MTA Sonografie, 29-2099.01 MTA Neurodiagnostik, 29-1124 MTRA Strahlentherapie — Konsistenz mit "MTA <X>"-Sister-Codes).

**What shipped — `fix/audit-batch-16-soc53-transport` (1 PR + 1 follow-up Recyclingkoordinator commit, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs`*: 29 batch-16 entries (16 Apply, 12 seed pull-outs, 1 sibling-up); 1 explicit Reject (53-4041 Subway/Streetcar — Straßenbahnfahrer-Lesart in 52132 konsistent; agent's 51112 ist Signalmen/Dispatcher, kein Operator); 4 title-only no-KldB-change (53-3051 Bus Drivers School, 53-4013 Rail Yard Engineers, 53-5022 Motorboat Operators, 53-7081 Refuse Collectors). First-Line Supervisor Aufsichtskraft-Tier-Anhebung (5 codes): 53-1041 Aircraft Cargo Handling 51532 fachlich → 51393 Aufsichtskräfte Lager/Güterumschlag Anf 3 (Modify gegen agent's 51332 Anf 2 fachlich); 53-1042 Helpers/Laborers Supervisors 31193 Bauplanung → 51393 + Title → "Vorarbeiter Lager und Logistik"; 53-1042.01 Recycling Coordinators 11724 Naturschutz → 34333 Abfallwirtschaft Anf 3 (KldB+Anf 4→3 + studies→specialist) + follow-up Title → "Recyclingkoordinator" (vs. 53-7062.04 hands-on Recyclingfachkraft); 53-1043 Material-Moving Supervisors 31193 → 52593 Bau-/Transportgeräteführung Anf 3 + Title → "Aufsichtskraft Bau- und Transportgeräteführung"; 53-1044 Purser 51422 (seed) → 51493 Personenverkehr Servicebereich Anf 3 (pull-out + KldB+Anf 2→3). Air Traffic Control catalog-positive sibling-up: 53-2021 Fluglotse 51533 → 51534 Anf 4 (DFS-Ausbildung bachelor-grade; KldB+Anf 3→4 + specialist→studies). Driver-Domain-Pivots: 53-3031 Driver/Sales 52112 PKW (seed) → 52122 LKW (pull-out); 53-3033 Light Truck 52112 (seed) → 52122 (pull-out); 53-3053 Shuttle/Chauffeurs 52132 (seed) → 52112 PKW + Title "Shuttle- und Chauffeurfahrer" → "Chauffeur" (pull-out). Eisenbahn: 53-4022 Brake/Signal/Switch 51632 (seed) → 51112 tech Eisenbahn (pull-out); 53-4031 Conductors/Yardmasters 51412 → 51112. Schifffahrt: 53-5011 Sailors/Marine Oilers 52422 (seed) → 51432 Service Schiffsverkehr (pull-out); 53-5021 Captains/Pilots 11402 Fischwirtschaft (Drift) → 52413 Nautische Schiffsoffiziere Anf 3 + Title "Kapitän Küstenfischerei" → "Kapitän/Kapitänin". Fahrzeug-Service: 53-6021 Parking Attendants 52112 (seed) → 52182 Fahrzeugführer-sonstige (pull-out); 53-6031 Auto/Watercraft Service 25212 → 25201 Anf 1 (KldB+Anf 2→1 + apprenticeship→none); 53-6032 Aircraft Service 52122 (seed) → 51122 tech Luftverkehrsbetrieb (pull-out). Verkehrs-Inspektoren: 53-6011 Bridge/Lock Tenders 51293 → 51243 Wasserstraßen-/Brückenwärter komplex (sibling-spec.); 53-6051 Transportation Inspectors 23123 Papierverarbeitung 😱 → 51503 Überwachung Verkehrsbetrieb komplex Anf 3; 53-6051.01 Aviation Inspectors 51533 (= Fluglotse-Klasse, falsch) → 25233 Luft-/Raumfahrttechnik komplex Anf 3 + Title "Flugverkehrskontrolleur" → "Luftfahrtprüfer". Hebezeug & Bagger: 53-7021 Crane Operators 51242 (seed) → 52532 Kranführer (pull-out); 53-7031 Dredge Operators 32222 Asphaltbau → 32262 Kultur-/Wasserbau; 53-7041 Hoist/Winch Operators 51242 (seed) → 52532 + Title → "Kranführer" (pull-out); 53-7051 Industrial Truck (Forklift) 52122 (seed) → 51312 Lagerwirtschaft fachlich + Title "Umzugsfahrer" → "Gabelstaplerfahrer" (pull-out). Lager/Recycling: 53-7062 Laborers/Freight Movers 51122 tech Luftverkehr 😱 → 51311 Lagerwirtschaft Helfer Anf 1 (KldB+Anf 2→1); 53-7062.04 Recycling Workers 24412 Metallbau → 34332 Abfallwirtschaft fachlich + Title → "Recyclingfachkraft" (ungendert); 53-7065 Stockers 51312 (seed) → 51311 (pull-out, sibling-down, KldB+Anf 2→1). Pumpen/Verladung: 53-7072 Pump Operators 32242 Brunnenbau (Drift) → 34322 Rohrleitungsbau; 53-7073 Wellhead Pumpers 41343 Erdölraffinerie → 21112 Berg-/Tagebau Anf 2 (parallel zu batch-14 47-5011 Cluster); 53-7121 Tank Loaders 41343 → 51332 Güter-/Warenumschlag Anf 2.

*`scripts/input/title-overrides-de.mjs`*: 13 batch-16 entries (11 new + 1 in-place + 1 follow-up Recyclingkoordinator-Differenzierung). Neue: 53-1042 → "Vorarbeiter Lager und Logistik"; 53-1043 → "Aufsichtskraft Bau- und Transportgeräteführung" (ungendert); 53-3051 → "Schulbusfahrer"; 53-4013 → "Lokrangierführer"; 53-5021 → "Kapitän"; 53-5022 → "Motorbootführer"; 53-6051.01 → "Luftfahrtprüfer"; 53-7041 → "Kranführer"; 53-7051 → "Gabelstaplerfahrer"; 53-7062.04 → "Recyclingfachkraft" (ungendert); 53-7081 → "Müllwerker". In-place: 53-3053 (war "Shuttle- und Chauffeurfahrer" → "Chauffeur"). Follow-up commit: 53-1042.01 → "Recyclingkoordinator/Recyclingkoordinatorin" (differenziert vs. 53-7062.04).

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 278 / 402 | **354 / 402** (+42 batch 15 inkl. 1 Reject, +33 batch 16 inkl. 1 Reject + 1 sibling-up) |
| Audit findings remaining | ~124 | **~48** (only SOC 51 Production = 43 + scattered tail) |
| Manual KldB overrides applied on build | 383 | **400** (+10 batch 15 net seed-aware, +13 batch 16 net seed-aware + 1 follow-up duplicate-fix) |
| Codes in seed block | 78 | **60** (–6 batch 15, –12 batch 16) |
| Title overrides applied | 355 | **367** (+10 batch 15 net inkl. 2 in-place + 1 follow-up, +12 batch 16 net inkl. 1 in-place + 1 follow-up) |
| Tests passing | 243 | 243 (data-only changes) |

**Branches:** `fix/audit-batch-15-soc29-healthcare` (1 code commit + 1 follow-up Hebamme-differentiation commit → PR merged), `fix/audit-batch-16-soc53-transport` (1 code commit + 1 follow-up Recyclingkoordinator-differentiation commit + this docs commit → PR opened).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batch 17 final — ~48 findings remaining.** Only the SOC 51 Production big-three remains (43 findings) plus scattered tail in already-walked SOCs. SOC 51 will be a single dedicated section per the big-four convention. Estimated 1 more session to complete the audit (vs. 2-3 estimated at end of Session 42 — this session caught up faster because batch 15 was extra-large at 43 findings).
- **Pre-existing title duplicates surfaced via the new dedupe-scan — 7 candidates for follow-up.** Not introduced by this session, but visible: 11-2033/13-1131 Fundraiser, 13-1022/13-1023 Einkäufer, 17-2199.03/17-2199.10 Energieingenieur, 19-3033/19-3039.03 Klinischer Psychologe, 27-2022/39-9031 Sporttrainer, 31-2021/31-2022 Physiotherapieassistent, 41-9021/41-9022 Immobilienmakler. Each is a SOC pair that splits along a real distinction (B2B/B2C, niche/specialty, Asylum/general) but the German label collapsed both. Differentiation along SOC distinction is the standard fix; can be tackled opportunistically (e.g. when SOC 51 walks through 51-XXXX entries) or as a small dedicated cleanup PR.
- **New memory `feedback_dedupe_renames.md`** — codifies the post-rename normalized-scan procedure with one-liner JS command. Linked from MEMORY.md.

---

### Session 42 – 2026-05-04
**Focus:** Audit-pipeline batches 13 + 14 — two sections, 45 findings total from `scripts/audit/findings-2026-04-25.json` walked through the plan-table gate. Sektion 1 (SOC 39 Personal Care and Service = 14 findings) and Sektion 2 (SOC 47 Construction and Extraction = 31 findings). Two PRs on `fix/audit-batch-13-soc39-personal-care` and `fix/audit-batch-14-soc47-construction`. First session after a 9-day pause since Session 41's eleven-session-day on 2026-04-25.

**Meta / process notes:**
- **Heaviest catalog-only-Anf-Density of the audit pipeline so far — 7 codes across the session.** Pattern documented in batches 11/12 (Casino Manager, Tänzer, Choreographer, Writer all hitting catalog-only-Anf-tier classes) recurred massively in SOC 39 + 47. Batch 13: 39-1013 Spielbetriebsleiter (94342 Glücksspiel — kein Anf-3-Sibling, sibling-domain-pivot zu 71393 generic Aufsichtskräfte), 39-1014 Entertainment & Recreation Supervisor (kein 63193 Aufsichtskraft-Tourismus/Sport, gleicher Pivot), 39-9031 Exercise Trainers (KldB hat keine Anf-2-Klasse für Trainer/Sportlehrer — 84553 Trainer Fitness/Gymnastik catalog-only Anf 3, accepted with @mo-sp's explicit pushback on the Anf-tier and reconciliation around Sport-/Fitnesskaufleute kaufmännisch-vs-Trainer distinction). Batch 14: 47-3012 Helpers-Carpenters (kein 33321 Anf-1-Sibling in Zimmerei), 47-3015 Helpers-Plumbers (kein 34211 Anf-1-Sibling in SHK), 47-3016 Helpers-Roofers (kein 32141 Anf-1-Sibling in Dachdeckerei) — all three pivot zu 32101 generic Hochbau Helfer; 4 of 5 Bauhelfer-SOC-Codes (47-3011/12/15/16) end up in 32101. Pattern is now stable enough to call out in `feedback_audit_batch_procedure.md` for future batches: "wenn Audit Anf-up/down auf eine Klasse ohne Sibling-Tier flaggt, sibling-domain-Pivot zur generic ohne-Spez.-Klasse derselben Familie".
- **First @mo-sp Anf-tier pushback caught the catalog-constraint explicitly.** On 39-9031 Exercise Trainers, @mo-sp asked "wirklich Anf 3? Kann man Fitnesskaufmann nicht mit einer Ausbildung werden?" — the question correctly identified that Sport-/Fitnesskaufleute (63122) IS Anf 2 with IHK-Ausbildung. The reconciliation: SOC role 39-9031 is *Trainer*-Tätigkeit, not Kaufmann-Tätigkeit; 63122 is the wrong domain (kaufmännisch); KldB's Trainer-Familie (84543/84553) and Sportlehrer-Familie (84503/84504) all exist only at Anf 3+, no Anf-2 sibling. The catalog-constraint is what forces Anf 3 here, not the agent's preference. After the catalog-explanation @mo-sp picked option (b) 84553 Trainer Fitness/Gymnastik. Pattern note: when @mo-sp pushes back on Anf-tier, present the sibling-tier catalog explicitly — the pushback may catch real bugs but may also surface the catalog-only constraint that the agent didn't expliciten.
- **Two agent-suggestion-Modifies on Tiefbau caught by @mo-sp's @ofdomain-knowledge.** Batch 14 had 47-2072 Pile-Driver Operators and 47-2151 Pipelayers both pinned to agent's 32102 Hochbau ohne-Spez. — but @mo-sp surfaced "Pfahlrammer ist Tiefbau oder? Eben 12 eher Tiefbau?". Catalog-Lookup confirmed 32202 Tiefbau ohne-Spez. Anf 2 exists; agent's own reasoning for 47-2072 explicitly said "Pile Driver Operators sind Spezialtiefbauer" but the agent then suggested the Hochbau-Klasse — internal inconsistency. Both pinned to 32202 Tiefbau. Same pattern (agent internal-inconsistency between reasoning and suggestion) seen previously on 17-3026.01 Nano-Tech in batch 12 (declared Anf 4 but suggested 26123-Anf-3-Klasse).
- **Hazmat workers reconciliation away from agent's Abfallwirtschaft to Umweltschutztechnik.** Agent suggested 34333 Abfallwirtschaft komplex Anf 3 for 47-4041 Hazardous Materials Removal Workers. @mo-sp's domain-knowledge: "Ein Techniker für gefährliche Abfälle, oft als Staatlich geprüfter Techniker der Umweltschutztechnik (Verfahrenstechnik) oder spezialisierte Fachkraft für Kreislauf- und Abfallwirtschaft tätig". Reconciliation to 42203 Umweltschutztechnik komplex Anf 3 — captures Asbest-/Bleisanierung, Bodensanierung, Dekontamination broader than Abfallwirtschaft (which is Disposal-narrow). Plus consistency with batch-10's 19-4042 Environmental Sci/Protection Tech and batch-12's 17-3025 Environmental Engineering Tech, both already in 42203. Pattern: reconciliations against agent KldB-picks are now ~3 per batch as audit reaches non-obvious cross-domain roles.
- **Roustabouts cluster-completion via Bohranlagen-Operator-Helfer-Pair.** 47-5011 Derrick Operators got "Bohranlagenoperator" (catalog-pivot from seed 94512 Veranstaltungstechnik via "Bühne"-Drift). For 47-5071 Roustabouts (Oil AND Gas), @mo-sp asked "alternativen für title? meint ja auch gas und nicht nur erdöl?" — three DE-options walked, picked "Bohranlagenhelfer" because it (a) parallels 47-5011 cleanly into a Operator-Helfer-Pair, (b) covers both Oil and Gas, (c) matches the BERUFENET-Helfer-Tier-Lesart the audit's title-suggestion implied. KldB+Anf coupled to 21111 Berg-/Tagebau Helfer Anf 1, parallel to 47-5081 Helpers-Mining (also 21111). Five-code Berg-/Tagebau-Cluster now coherent: 47-5011/12/13/41/43/44 in 21112, 47-5071/81 in 21111.
- **First single-finding Reject of the session — 47-2011 Boilermakers on agent-internal-inconsistency.** Agent flagged title-awkward but admitted in own reasoning "die Schreibweise ist korrekt", suggestion null. Documented in batch-14 block header. Total Rejects through audit: 47-2011, 17-2171 Petroleum, 17-2051 Civil — three so far across 14 batches. False-positive density holding at ~1-2 per session, no escalation pattern.
- **Floor-laying slot-swap and Pflasterer slot-vacate-and-fill across batch 14.** 47-2042 (Floor Layers Except Carpet/Wood/Hard Tiles) and 47-2043 (Floor Sanders) had inverted KldB pins — 47-2042 was at 33132 Parkett but SOC explicitly excludes wood; 47-2043 was at 33102 Bodenverlegung but Floor Sanding is Holzboden-spezifisch. Slot-swap: 47-2042 → 33102 (Bodenleger), 47-2043 → 33132 (Parkett). Same pattern with 32212 Pflasterer/Steinsetzer slot — 47-3011 Helpers-Brickmasons was wrongly pinned (Helper at Pflasterer-Geselle-Tier impossible), pulled out to 32101 Hochbau Helfer; 32212 slot now correctly filled by 47-4091 Segmental Pavers (the actual Pflasterer-Beruf). Pattern: when audit surfaces a wrong-tier seed pin, check whether a sibling SOC code in the same batch wants that slot.
- **Pre-edit-grep gap caught a third time in 14 batches — but only one duplicate this session.** Session 38 noted that pre-edit grep on `title-overrides-de.mjs` was missed (cluster-blocks have non-batch entries). Session 41 caught two duplicates (39-1014 and 39-3031 in batch 13). This session caught one more (47-2082 Drywall Tapers in batch 14, hidden in a non-batch cluster line ~543). Lint catches them but costs an extra commit in batch 14. Update to `feedback_audit_batch_procedure.md` would be useful: pre-edit grep needs to use BOTH `'"<SOC>-'` AND `"'<SOC>-"` quote styles — the two override files use different string-quote conventions (kldb-overrides.mjs uses double-quotes, title-overrides-de.mjs uses single-quotes), so a generic grep misses cross-file. **Action item for next session: tighten the procedure-memory.**
- **Session-pace shift: first multi-day-pause session since the 11-session-day blitz of 2026-04-25.** Sessions 31-41 were all on the same calendar day. Session 42 is 9 days later. The audit pipeline is now resumed at a sustainable cadence. No process changes from the pause; the 1-SOC-major-per-section + 2-PR-per-session pattern held cleanly. Memory files (3 audit-pipeline rules) were stable and the procedure picked up cold without re-orientation cost — the memory-encoding worked.

**What shipped — `fix/audit-batch-13-soc39-personal-care` (1 PR, merged):**

*`scripts/input/kldb-overrides.mjs`*: 12 batch-13 entries (5 Apply, 5 seed pull-outs, 2 Modify reconciliations). First-Line Supervisors generic-Aufsichtskraft-pivot: 39-1013 Spielbetriebsleiter 94342 Glücksspiel Anf 2 (catalog-only) → 71393 Aufsichtskräfte Unternehmensorg Anf 3 (parallel zu 11-9071 Casino → 71394 als Director-Tier eine Stufe höher); 39-1014 Entertainment/Recreation Supervisor 63122 Sport-/Fitnesskaufleute (seed) → 71393 (kein 63193 Aufsichtskraft-Tourismus/Sport; pull-out + KldB+Anf 2→3). Animal: 39-2011 Animal Trainers 11502 ohne-Spez. → 11582 sonstige; 39-2021 Animal Caretakers 11502 → 11522 Haus-/Zootierpflege + Title "Tiersitter" → "Tierpfleger". Entertainment/Theater: 39-3021 Filmvorführer 51182 (Drift) → 94532 Bild-/Tontechnik; 39-3031 Ushers 62112 Kassierer (seed) → 53111 Schutz-Helfer Anf 1 (Modify gegen agent's 53112 Anf 2 — Anf-down 2→1 erfordert Anf-1-sibling 53111; pull-out + Title → "Platzanweiser"); 39-3092 Costume Attendants 82332 Tätowierer (seed, völlig falsch) → 94612 Bühnen-/Kostümbildnerei (pull-out). Hair/Beauty: 39-5012 Hairdressers 28222 Bekleidung (Drift via "Perückenmacher") → 82312 Friseurgewerbe + Title → "Friseur" (39-5011 Barbers behält "Herrenfriseur" zur Differenzierung); 39-5093 Shampooers 82312 → 82311 Friseur-Helfer Anf 1 (sibling-down). Hotel: 39-6011 Baggage Porters 51122 Luftverkehr (Drift) → 63222 Hotelservice. Sport/Recreation catalog-only-Anf-Pattern: 39-9031 Exercise Trainers 63122 Sport-/Fitnesskaufleute (seed, kaufmännisch) → 84553 Trainer Fitness/Gymnastik Anf 3 (Modify gegen agent's 84503 Sportlehrer — 84553 trifft "Fitness und Gymnastik" wörtlich; KldB hat keine Anf-2-Klasse für Trainer; @mo-sp's Anf-pushback resolved via catalog-explanation; pull-out + KldB+Anf 2→3); 39-9032 Recreation Workers 84553 (seed, durch 39-9031 belegt) → 83123 Sozialpädagogik komplex Anf 3 (Modify-beyond-audit's-flag — Audit nur Title-flag; pull-out + Title → "Freizeitpädagoge", parallel zu 39-9041 Residential Advisors).

*`scripts/input/title-overrides-de.mjs`*: 7 batch-13 entries (5 new + 2 in-place modifications). Neue: 39-2021 → "Tierpfleger"; 39-4021 → "Bestattungshelfer" (Tippfehler-Fix + Modify gegen agent's "Bestattungsfachkraft", which is taken by 39-4031); 39-5012 → "Friseur"; 39-7011 → "Gästeführer" (modernisiert); 39-9032 → "Freizeitpädagoge". In-place: 39-1014 (war "Leiter Gastronomie und Freizeit" → "Teamleiter Freizeit und Unterhaltung"); 39-3031 (war "Einlasskontrolle und Saaldienst" → "Platzanweiser").

**What shipped — `fix/audit-batch-14-soc47-construction` (1 PR, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs`*: 28 batch-14 entries (15 Apply, 4 seed pull-outs, 9 Modify reconciliations); 1 explicit Reject (47-2011 Boilermakers — agent's eigenes Reasoning admittiert "die Schreibweise ist korrekt", null suggestion); 2 title-only no-KldB-change (47-2051 Concrete Finishers, 47-2082 Drywall Tapers). First-Line Supervisor: 47-1011 Construction Trades 51332 Güter-/Warenumschlag (komplett falsch) → 32193 Aufsichtskräfte Hochbau Anf 3. Renewable Energy: 47-1011.03 Solar Installation Mgr 26212 Bauelektrik → 26243 Regenerative komplex Anf 3 (KldB+Anf 2→3); 47-2152.04 Solar Thermal 26212 → 26242 Regenerative fachlich. Floor-laying slot-swap: 47-2042 Floor Layers Except Wood 33132 Parkett (Drift — SOC excludes wood) → 33102 Bodenverlegung ohne-Spez. (Modify gegen agent's null) + Title → "Bodenleger"; 47-2043 Floor Sanders 33102 → 33132 (Holz-spezifisch). Specialty trades: 47-2044 Tile Setters 32122 Maurer → 33112 Fliesen-/Platten-/Mosaik; 47-2072 Pile Drivers 32222 Asphaltbau → 32202 Tiefbau (Modify gegen agent's 32102 Hochbau — agent's eigenes Reasoning: "Spezialtiefbauer"; @mo-sp catch); 47-2142 Paperhangers 33212 Maler → 93232 Raumausstattung. Pipe/Drainage/Rebar: 47-2151 Pipelayers 32232 Gleisbau → 32202 Tiefbau (Modify gegen agent's 32102 Hochbau, parallel zu 47-2072); 47-2152 Plumbers 24422 Schweiß-/Verbindung → 34322 Rohrleitungsbau (differenziert von 47-3015 SHK in 34212); 47-2171 Rebar Workers 32122 Maurer → 32112 Beton-/Stahlbetonbau. Bauhelfer catalog-only-Anf-Fallback (5 codes, 4 zu 32101): 47-3011 Helpers-Brickmasons 32212 Pflasterer (seed) → 32101 (pull-out, Anf 2→1); 47-3012 Helpers-Carpenters 33322 Zimmerei → 32101 (Modify-beyond-audit, kein 33321 Anf-1-Sibling; Anf 2→1); 47-3014 Helpers-Painters 33212 → 33211 (sibling-down, einzige Domain mit dediziertem Anf-1-Sibling; Anf 2→1); 47-3015 Helpers-Plumbers 34212 SHK → 32101 (Modify gegen agent's null, kein 34211 Anf-1-Sibling; Anf 2→1; Title → "Helfer Sanitär-/Rohrinstallation"); 47-3016 Helpers-Roofers 32142 Dachdeckerei → 32101 (Modify-beyond-audit, kein 32141 Anf-1-Sibling; Anf 2→1). Inspection: 47-4011 Construction Inspectors 26102 Mechatronik → 31163 Bausachverständige Anf 3 (KldB+Anf 2→3). Maintenance/Specialty: 47-4021 Elevator Mechanics 25132 → 26112 Mechatronik; 47-4031 Fence Erectors 32152 Fassadenbau (Drift) → 24412 Metallbau + Title "Türenbauer" → "Zaunbauer"; 47-4041 Hazmat 22203 Farb-/Lacktechnik → 42203 Umweltschutztechnik komplex Anf 3 (Modify gegen agent's 34333 Abfallwirtschaft, konsistent zu 19-4042 + 17-3025; @mo-sp's domain-knowledge catch). Construction operators: 47-4061 Rail-Track 31102 Bauplanung → 32232 Gleisbau (Slot frei nach 47-2151 Move); 47-4071 Septic Servicers 32201 Tiefbau-Helfer (seed) → 34312 Wasser-/Abwassertechnik + Title "Kanalbauer" → "Kanal-/Rohrreiniger" (pull-out + KldB+Anf 1→2). Pflasterer slot-fill: 47-4091 Segmental Pavers 32222 Asphalt → 32212 Pflasterer/Steinsetzer (Slot frei nach 47-3011 Pull-out). Oil/Gas/Mining 21112-Cluster: 47-5011 Derrick Operators 94512 Veranstaltungstechnik (seed, "Bühne"-Drift) → 21112 Berg-/Tagebau + Title "Bühnenmann" → "Bohranlagenoperator" (pull-out); 47-5012 Rotary Drillers 32242 Brunnenbau → 21112; 47-5013 Service Unit Operators 41312 Chemie → 21112; 47-5044 Underground Mining 32222 Asphalt (seed) → 21112 (pull-out). Roustabouts: 47-5071 32242 Brunnenbau ("Deck"-Drift) → 21111 Berg-/Tagebau-Helfer Anf 1 + Title "Deckarbeiter" → "Bohranlagenhelfer" (Modify-beyond-audit's-flag — Audit nur Title-flag; KldB+Anf 2→1; parallel zu 47-5081 Helpers-Mining auch 21111).

*`scripts/input/title-overrides-de.mjs`*: 8 batch-14 entries (7 new + 1 in-place modification). Neue: 47-2042 → "Bodenleger"; 47-2051 → "Betonbauer"; 47-3015 → "Helfer Sanitär- und Rohrinstallation"; 47-4031 → "Zaunbauer"; 47-4071 → "Kanal- und Rohrreiniger"; 47-5011 → "Bohranlagenoperator"; 47-5071 → "Bohranlagenhelfer". In-place: 47-2082 (war "Trockenbauspachtler" → "Trockenbaumonteur"; cluster-block-Eintrag aus pre-existing-Block).

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 233 / 402 | **278 / 402** (+14 batch 13, +31 batch 14 inkl. 1 Reject) |
| Audit findings remaining | ~169 | **~124** |
| Manual KldB overrides applied on build | 352 | **383** (+7 batch 13 net, +24 batch 14 net) |
| Codes in seed block | 87 | **78** (–5 batch 13, –4 batch 14) |
| Title overrides applied | 343 | **355** (+5 batch 13 net inkl. 2 in-place, +7 batch 14 net inkl. 1 in-place) |
| Tests passing | 243 | 243 (data-only changes) |

**Branches:** `fix/audit-batch-13-soc39-personal-care` (1 code commit → PR merged), `fix/audit-batch-14-soc47-construction` (1 code commit + this docs commit → PR opened).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batches 15-N — ~124 findings remaining.** Three big-three SOCs left: 29 Healthcare (43), 51 Production (43), 53 Transport (34). Each likely needs a dedicated section. Estimated 2-3 more sessions to complete the audit (vs. 3-4 estimated at end of Session 41 — 1 session faster than projection due to the small SOC 39 batch). The catalog-only-Anf-Pattern is now stable and familiar; the SOC 47 Bauhelfer-Cluster suggests 51 Production helpers may also pivot to generic ohne-Spez-Helfer-classes en masse.
- **Pre-edit-grep procedure update — minor memory tightening.** `feedback_audit_batch_procedure.md` should be updated to require pre-edit grep on BOTH quote styles (`'"<SOC>-'` AND `"'<SOC>-"`) since kldb-overrides.mjs uses double-quotes and title-overrides-de.mjs uses single-quotes. Lint catches mismatches but costs an extra commit. Action item for next session.
- **BigFive coverage gap fix** — still on hold; foundation now ~69 % through the audit pipeline, materially cleaner than at the Session-36 BigFive-pause decision.

---

### Session 41 – 2026-04-25
**Focus:** Audit-pipeline batches 11 + 12 — two sections, 45 findings total from `scripts/audit/findings-2026-04-25.json` walked through the plan-table gate. Sektion 1 (SOC 11 Management = 24 findings) and Sektion 2 (SOC 17 Architecture/Engineering = 21 findings). Two PRs on `fix/audit-batch-11-soc11-management` and `fix/audit-batch-12-soc17-engineering`. Eleventh session this calendar day, immediate continuation of Session 40's audit pipeline.

**Meta / process notes:**
- **First Reject-pair on factual grounds — 17-2171 + 17-2051 in batch 12.** Two SOC 17 audit findings flagged with no actionable change: (1) `17-2171.00` Petroleum Engineers — agent suggested 21114 Berg-/Tagebau Anf 4, but current state already IS 21114 Anf 4 (audit-finding generated against an older build state); (2) `17-2051.00` Civil Engineers — anf-mismatch flagged but agent's own reasoning admits "current Anf 4 ist korrekt — keine Änderung erforderlich" with `suggestion: null`. Both Rejects documented inline in the batch-12 block header so future audit re-passes don't re-flag. Two Rejects in one section is the heaviest false-positive density of the audit pipeline so far — earlier batches had max 1-3 Rejects per session.
- **Sibling-domain pivot for catalog-only-Anf-2-domain at Director-tier — 11-9071 Casino Manager.** KldB has only `94342 Berufe im Bereich Glücks- und Wettspiel` Anf 2 (operative tier, where 33-9031 Surveillance was pinned in batch 2). No Anf 3/4 sibling exists. Casino Manager (Director-tier Anf 4) needed pivot. Agent suggested 63394 Gastronomie which @mo-sp rightly questioned ("glücksspiel soll gastro sein?"). Three options walked: (a) 63194 Tourismus/Sport (Entertainment-Tourism-Pivot), (b) 63404 Veranstaltungsservice (Vergnügungsstätte-Lesart), (c) 71394 Führungskräfte Unternehmensorganisation (generic Director-Tier when no domain class exists). Picked (c) — KldB has no generic "Führungskraft nicht näher spezifiziert" class, but 71394 is the closest domain-neutral Director-Klasse. Three SOC-11 codes now sit in the 713xx-Familie (RA Director 71394, Compliance 71384, Casino 71394) as Führungs-Klasse-ohne-Domain. New pattern documented: **sibling-domain-pivot bei Anf-up auf catalog-only-low-tier-Domain** (Session 40 had the same logic for Anf-down on missing sibling-tier — 19-4044 Hydrologic Tech Geotechnik-Pivot).
- **`-manager`-Title-Cluster für SOC-11 Marketing/Werbung/Einkauf-Reihe.** @mo-sp surfaced mid-plan ("marketingleiter alternativen?"). Walked four DE-options each (Marketingleiter/Marketingmanager/Leiter Marketing/Head of Marketing). Picked Marketingmanager. Same for Einkaufsleiter → Einkaufsmanager and Werbeleiter → Werbemanager (audit hadn't even flagged Werbe-Title; @mo-sp asked "ja gerne auch manager" to keep the SOC-11-Reihe konsistent). Three DE-titles unified in `-manager`-Familie parallel to existing Compliance-Manager. Pattern: when audit flags a title-change in a SOC-major-Reihe, walk the whole Reihe for konsistente Familie auch wo audit nicht geflagged hat.
- **Batch-12 reconciliation against agent's null suggestion — 17-3028 Calibration/Metrology Tech.** Agent flagged "current 41322 chem-Lab ist schlechter Treffer als physikalische Messtechnik" but provided `suggestion: null`. Catalog-Lookup zeigt: KldB hat keine dedizierte Mess-/Eichwesen-Klasse (kein Metrologie-spezifisches 5d-Code). Reconciliation zu 27312 Tech QS fachlich Anf 2 — Kalibrierung ist QS-Disziplin, konsistent zu sibling 17-3029.01 NDT in 27313 (gleiche QS-Familie eine Stufe höher). Pattern note: wenn audit nur kldb-mismatch ohne suggestion flaggt, catalog-walken statt im Drift-State stehen lassen.
- **Code-Anf-Widerspruch im Seed — 17-3026.01 Nano-Tech.** Seed declared Anf 4 mit KldB 26123 (welches Anf 3 ist) — gleicher Pattern wie Session 40's 19-2032 Materials Scientists (declared Anf 4 mit 41303 = Anf-3-Klasse). Pull-out + 41423 Werkstofftechnik komplex Anf 3 löst Inkonsistenz. Audit bemerkte den Widerspruch nicht direkt, flaggte aber kldb-mismatch + anf-mismatch separat — beide Flags traf zusammen die Wurzelursache. Pattern: bei doppelt-Flag sollte die Code-Anf-Konsistenz des Seeds geprüft werden.
- **Modify-beyond-audit's-flag — 17-2051.02 Water Engineers.** Audit flaggte nur title-awkward ("Wasserbautechniker" → "Wasserbauingenieur"), keinen anf-mismatch. Aber: Engineer-Title impliziert Anf 4, current ist 31143 Wasserwirtschaft komplex Anf 3. Sibling-up zu 31144 Wasserwirtschaft hoch komplex Anf 4 hergestellt — konsistent zu batch-11's 11-9121.02 Ingenieur Wasserwirtschaft (auch 31144). Pattern: Title-only-flags können Tier-Implikationen haben, die der audit-agent nicht expliziert.
- **Two in-place title-modifications für SOC-11 — 11-9131 + 11-9199.01.** Pre-existing title-overrides in non-batch clusters (`Postdirektor` and `Leiter Regulatory Affairs`) wurden in-place modifiziert (Postdirektor → Poststellenleiter; Leiter Regulatory Affairs → Zulassungsleiter). Lint hätte sonst no-dupe-keys gegen den batch-11-Block am Ende geworfen. Caught beim post-build grep — `feedback_audit_batch_procedure.md` rule "grep across BOTH override files" hat funktioniert.
- **Heaviest seed-Pull-out-Density der Pipeline — 13 Pull-outs in einer Session.** SOC 11 hatte 7 seed entries, SOC 17 hatte 5 — plus Code-Anf-Widerspruch-Pull-out. Cumulative pull-out-Effekt: Seed-Block 100 → 87 (-13 net). Steady-state seed-Schrumpfung deutet darauf hin, dass die Seed-Block-Audits aus Session 26 retrospektiv viel SOC-Mgmt + Engineering-Drift enthielten, die jetzt schrittweise herausläuft.

**What shipped — `fix/audit-batch-11-soc11-management` (1 PR, merged):**

*`scripts/input/kldb-overrides.mjs`*: 22 batch-11 entries (14 Apply, 7 seed pull-outs, 1 title-only). Marketing/Werbung/Vertrieb-Familie: 11-2011 Werbeleiter 43294 IT-Vertrieb (Drift) → 92194 Werbung/Marketing; 11-2021 Marketing 43294 → 92194; 11-2022 Sales 43294 → 61194 Einkauf/Vertrieb. PR/Öffentlichkeit: 11-2032 PR 23294 Mediengestaltung → 92294 Öffentlichkeitsarbeit; 11-2033 Fundraising 92203 → 92204 (sibling Anf 3→4). Admin/Office: 11-3012 Admin Services 71393 → 71394 (sibling Anf 3→4); 11-3061 Purchasing 51694 Verkehr/Logistik (Drift) → 61194 Einkauf/Vertrieb. Energy/Production: 11-3051.04 Biomass 41393 Chemie (seed-Drift) → 26234 Energie/Kraftwerk (pull-out); 11-9199.10 Wind Project 61394 Immo (seed-Drift) → 26244 regenerative Energie (pull-out). Education/Hospitality: 11-9033 Postsecondary 84194 Allgemeinbildende → 84394 Hochschule; 11-9051 Restaurant 63313 Systemgastronomie komplex Anf 3 → 63394 Führungskräfte Gastronomie Anf 4 (KldB+Anf 3→4); 11-9071 Casino 63124 Sport (seed-Drift) → 71394 generic Führungskräfte (Reconcile gegen agent's 63394 Gastronomie — sibling-domain-Pivot weil Glücksspiel-Domain catalog-only Anf 2; pull-out); 11-9072 Recreation 63124 Sport (seed) → 63194 Tourismus/Sport (Reconcile gegen agent's 63404 Veranstaltungsservice; pull-out). Engineering Director-tier: 11-9121.01 Clinical Research 27194 Führungskräfte → 27184 sonstige (Coordinator-Tier); 11-9121.02 Water Eng 71333 Wirtschaftsförderung (Drift) → 31144 Wasserwirtschaft Anf 4 (KldB+Anf 3→4). Public sector: 11-9131 Postmasters null Anf 2 (Lücke) → 51393 Aufsichtskräfte Lager/Post Anf 3; 11-9161 Emergency Mgmt 42334 Strahlenschutz (Drift) → 53184 Brandschutz/Sicherheit; 11-9171 Funeral 82402 fachlich Anf 2 → 82403 komplex Anf 3 (sibling-up); 11-9179.02 Spa 63124 Sport (seed) → 63194 Tourismus/Sport (pull-out). Compliance/Legal: 11-1011.03 CSO 71104 Vorstand (seed-Drift) → 71384 Unternehmensorg sonstige (pull-out); 11-9199.01 RA Director 73104 Recht (Drift) → 71394 Führungskräfte Unternehmensorg (Reconcile gegen agent's 27194; konsistent zu 13-1041.07 RA Specialist in 71384); 11-9199.02 Compliance 73104 Recht (Drift) → 71384 Unternehmensorg sonstige; 11-9199.08 Loss Prevention 53122 fachlich Anf 2 (seed) → 53123 komplex Anf 3 (sibling-up; pull-out).

*`scripts/input/title-overrides-de.mjs`*: 10 batch-11 entries (8 new + 2 in-place modifications). Neue: 11-1011.03 "Beauftragter f.d. soziale Verantwortung" → "CSR-Manager"; 11-2011 "Werbeleiter" → "Werbemanager"; 11-2021 "Führungskraft für Marketing" → "Marketingmanager"; 11-3012 "Bibliotheksleiter" → "Verwaltungsleiter"; 11-3061 "Einkaufsleiter" → "Einkaufsmanager"; 11-9033 "höhere Lehranstalt" → "Hochschulleiter"; 11-9151 "Manager soziale Dienste" → "Leiter sozialer Dienste"; 11-9179.02 "Heilbad" → "Spa-Manager". In-place: 11-9131 "Postdirektor" → "Poststellenleiter"; 11-9199.01 "Leiter Regulatory Affairs" → "Zulassungsleiter".

**What shipped — `fix/audit-batch-12-soc17-engineering` (1 PR, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs`*: 18 batch-12 entries (12 Apply, 5 seed pull-outs, 4 Modify reconciliations); 2 Rejects not represented (17-2171 Petroleum already-correct, 17-2051 Civil false-positive). Pull-outs: 17-2031 Bio-Eng 26324 Mikrosystem → 27104 Tech F&E ohne-Spez.; 17-2112.02 Validation 25194 Führungskräfte Maschinenbau → 27314 Tech QS; 17-2131 Materials 25194 → 41424 Werkstofftechnik; 17-2161 Nuclear 41404 Physik → 26234 Energie/Kraftwerk (konsistent zu 11-3051.04 Biomass + 11-3051.02 Geothermal); 17-3026.01 Nano-Tech 26123 Anf-4-Widerspruch → 41423 Werkstofftechnik komplex Anf 3. Hardware/Electronics: 17-2061 Hardware Eng 26124 Automatisierung (Drift) → 43124 Tech Informatik; 17-2072 Electronics 26334 Branchen-Elektronik → 26304 Elektrotechnik ohne-Spez. Industrial/Manufacturing: 17-2112 Industrial 25194 Führung → 25104 Maschinenbau ohne-Spez. + Title "Berechnungs-" → "Wirtschaftsing."; 17-2112.03 Manufacturing 25194 → 25104 (sibling-Apply zu 17-2112). Marine triple-fix: 17-2121 51133 Schiffsverkehr Anf 3 → 25244 Schiffbautechnik Anf 4 + Title "Zeichner Seefahrzeuge" → "Schiffbauingenieur" (KldB+title+Anf gleichzeitig). Energy/Mechatronics: 17-2199.03 Energy 21223 Baustoff Anf 3 (Drift) → 26244 regenerative Anf 4 + Title "Energieanalyst" → "Energieingenieur"; 17-2199.05 Mechatronik 23124 Papierverarbeitung (Drift) → 26114 Mechatronik. Civil-Water Modify-beyond-audit: 17-2051.02 Water 31143 Wasser komplex Anf 3 → 31144 hoch komplex Anf 4 + Title "Wasserbautechniker" → "Wasserbauingenieur" (Engineer-Title impliziert Anf 4; konsistent zu 11-9121.02 aus batch-11). Technician-tier: 17-3021 Aerospace 25133 Wartung (Drift) → 26123 Automatisierung komplex; 17-3022 Civil Tech 31102 fachlich Anf 2 → 31103 komplex Anf 3 (sibling-up); 17-3025 Environmental Tech 42314 Verwaltung Anf 4 → 42203 Umweltschutztechnik Anf 3 (KldB+Anf 4→3; konsistent zu batch-10's 19-4042); 17-3028 Calibration 41322 chem-Lab (Drift) → 27312 Tech QS fachlich (Modify gegen agent's null — KldB hat keine Mess-/Eichwesen-Klasse, QS ist nearest); 17-3029.01 NDT 27312 fachlich Anf 2 → 27313 komplex Anf 3 (sibling-up); 17-3029.08 Photonics 27182 Tech F&E sonstige Anf 2 → 21363 Feinoptik komplex Anf 3 (sibling-domain pivot + Anf-up).

*`scripts/input/title-overrides-de.mjs`*: 4 batch-12 entries. 17-2112 "Berechnungsingenieur" → "Wirtschaftsingenieur"; 17-2121 "Zeichner Seefahrzeuge" → "Schiffbauingenieur"; 17-2199.03 "Energieanalyst" → "Energieingenieur"; 17-2051.02 "Wasserbautechniker" → "Wasserbauingenieur".

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 190 / 402 | **233 / 402** (+22 batch 11 inkl. 1 title-only Reject; +21 batch 12 inkl. 2 Rejects) |
| Audit findings remaining | ~212 | **~169** |
| Manual KldB overrides applied on build | 322 | **352** (+16 batch 11 net, +14 batch 12 net) |
| Codes in seed block | 100 | **87** (–7 batch 11, –5 batch 12, –1 Code-Anf-Widerspruch) |
| Title overrides applied | 331 | **343** (+8 batch 11 net inkl. 2 in-place, +4 batch 12 net) |
| Tests passing | 243 | 243 (data-only changes) |

**Branches:** `fix/audit-batch-11-soc11-management` (1 code commit → PR merged at commit 009aff7), `fix/audit-batch-12-soc17-engineering` (1 code commit + this docs commit → PR opened).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batches 13-N — ~169 findings remaining.** Continuing 1-SOC-major-per-section pattern. Next pairings: 39 Personal Care (14 — small) possibly paired mit a big-four candidate to balance load. Big-four queue: 29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31 — each likely needs dedicated section. Estimated 3-4 more sessions to complete the audit.
- **BigFive coverage gap fix** — still on hold; foundation now ~58 % through the audit pipeline, materially cleaner than at the Session-36 BigFive-pause decision.

---

### Session 40 – 2026-04-25
**Focus:** Audit-pipeline batches 9 + 10 — two sections, 50 findings total from `scripts/audit/findings-2026-04-25.json` walked through the plan-table gate. Sektion 1 (SOC 43 Office and Administrative Support = 23 findings) and Sektion 2 (SOC 19 Life, Physical, and Social Science = 27 findings). Two PRs on `fix/audit-batch-9-soc43-office` and `fix/audit-batch-10-soc19-sciences`. Tenth session this calendar day, immediate continuation of Session 39's audit pipeline.

**Meta / process notes:**
- **1-SOC-per-section pattern from Session 39 held cleanly.** SOC 43 (23 findings) and SOC 19 (27 findings) handled as two independent sections rather than paired into one section. Workload comparable to Session 39 (23+23 = 46) at 23+27 = 50 — the per-section discipline scales without mid-session burnout. Pattern looks stable for the remaining medium/big SOC groups (29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31), which will each need a dedicated section.
- **Two BACKLOG entries retired through batch 10.** (1) `19-1032.00 Foresters` mapped to KldB 11713 Forstwirtschaft komplex Anf 3 with title "Förster/Försterin" — directly resolves the BACKLOG entry "Förster search hits nothing" surfaced in the 2026-04-25 friends-release browser test. Agent had suggested "Forstwirt" but that's the Geselle-Anf-2 tier; "Förster" is Anf-3 Forstinspektor-Tier and matches the search-resolution requirement. (2) `19-1031.02 Range Managers` re-titled from "Forstwirt" to "Landschaftsökologe" with KldB → 41234 Biologie Ökologie — the original BACKLOG note flagged Range Managers as drifted into a Forstwirt label that didn't fit Weide-/Grasland-Management. Both BACKLOG bullets can be deleted in this session's pass.
- **First non-seed batch-entry re-evaluation: 19-2099.01 Remote Sensing Scientists.** A prior batch entry had pinned 19-2099.01 to KldB 31213 Vermessungstechnik Anf 3 with reasoning "Geoinformatik 43144 only has Anf 4 tier, out of reach at current Anf 3" — i.e. the jobZone-Anf-3-cap was treated as binding. Audit's Anf-4 flag for this code over-rode that constraint: a Remote Sensing Scientist IS a research-tier role (Master+), so the Anf-4 cap-violation was the right call. Entry was *moved* (not just edited) to batch-10 with the Anf-4 reasoning, leaving a comment-replacement at the prior position. First time a non-seed batch entry got re-pinned in a later batch — extends the Session-39 pattern (re-evaluating earlier-batch entries) from seed-pull-outs to non-seed batches as well.
- **Materials Scientists code-Anf-Widerspruch caught + fixed.** `19-2032.00` was seeded at KldB 41303 with declared `anforderungsniveau: 4` — but 41303 is the Anf-3 sibling of the 4130x family (41304 is the Anf-4 class). The declared Anf and the code's Anf were inconsistent. Audit flagged the Anf as Anf 4 (correct for Materials Scientists). Pull-out from seed to batch-10 with KldB → 41304 (canonical Anf-4 sibling) restored consistency. Pattern note: when audit flags a sibling-up that lands on an Anf-tier the current code doesn't actually have, check whether the seed is internally inconsistent before applying.
- **Sibling-domain pivot for Anf-down where the current domain has no Anf-3 sibling.** `19-4044.00 Hydrologic Technicians` was at 42124 Geologie Anf 4. Audit flagged Anf-down 4 → 3, but 42124 has no Anf-3 sibling (42123 doesn't exist; the Geologie family in KldB jumps directly from no-fachlich to Anf-4-only). Pivot: 42113 Geotechnik komplex Anf 3 — sibling-domain that covers Hydrogeologie-Tech work at the right tier. Pattern note for similar future findings: when audit flags Anf-down but the domain doesn't have the lower-tier sibling, check sibling-domains rather than refusing the Anf-down.
- **Six reconciliations against agent suggestions across batch 10 — heaviest reconciliation density of the audit pipeline so far.** (1) `19-1031.02` Range Managers — agent's 11714 Forstwirtschaft Anf 4 → 41234 Biologie Ökologie Anf 4 (Range Mgmt = Weide/Grasland, nicht Forst); (2) `19-1032.00` Foresters title — agent's "Forstwirt" → "Förster" (Anf-3-Tier match); (3) `19-2041.01` Climate Change Policy Analysts — agent's 42144 Meteorologie Anf 4 → 42314 Umweltschutzverwaltung/-beratung Anf 4 (Policy = Verwaltung, nicht Forschung); (4) `19-2099.01` Remote Sensing — agent's 43144 over-rode prior batch-entry constraint (s.o.); (5) `19-3091.00` Anthropologists/Archeologists — agent's KldB-pick 91264 Anthropologie applied, but agent's title-suggestion "Anthropologe" rejected (would lose Archaeology-Hälfte; current dual title kept); (6) `19-4044.00` Hydrologic Tech — sibling-domain pivot 42124 → 42113 (s.o.). Reconciliation density rises as audit findings hit research-tier roles where the agent's KldB-class-knowledge is shallower than its Anf-tier intuition.
- **Title-only fixes pattern: KldB sometimes already correct, only DE label drifted.** Notable in SOC 19: `19-4092.00` Forensic Science Technicians had KldB 53222 Polizeivollzug fachlich Anf 2 (correct domain) but the title was "Polizeibeamter im Ermittlungsdienst" (Streifendienst-Bezeichnung, suggests patrol-cop). Title-only fix to "Kriminaltechniker" — KldB stays. Same in SOC 43: `43-4061.00` Eligibility Interviewers had KldB 73212 Sozialverwaltung (correct) but title "Grenzschutzbeamter" (komplett anderer Beruf). When audit flags only title without KldB-mismatch, the rule holds: trust the audit's flag-set, don't over-correct the KldB.

**What shipped — `fix/audit-batch-9-soc43-office` (1 PR, merged):**

*`scripts/input/kldb-overrides.mjs`*: 17 batch-9 entries (12 Apply, 2 seed pull-outs, 3 Modify reconciliations). 43-2011 Switchboard Operators 71401 Anf 1 → 71452 Auskunft Anf 2. 43-3021 Billing Clerks 61122 Vertrieb (Drift) → 72212 Buchhaltung. 43-3031 Bookkeeping Clerks 72122 Anlageberater (seed) → 72212 Buchhaltung. 43-3061 Procurement Clerks 63212 Hotelkaufleute (Drift) → 61112 Einkauf. 43-4021 Correspondence Clerks 42312 Umweltschutzverw. (Drift) → 71402 Büro/Sekretariat. 43-4031 Court Clerks 53232 Gerichtsvollzug (seed) → 73252 Justizverwaltung. 43-4081 Hotel Desk Clerks 71452 Auskunft → 63212 Hotelkaufleute (Modify gegen agent's null). 43-4121 Library Assistants 73312 Archivwesen → 73322 Bibliothekswesen. 43-4141 New Accounts Clerks 72113 → 72112 (sibling Anf 3 → 2). 43-5011 Cargo/Freight Agents 51623 → 51622 (sibling Anf 3 → 2). 43-5011.01 Freight Forwarders 51332 Hafenumschlag → 51623 Spedition komplex Anf 3 (Modify gegen agent's 61123 Vertrieb; .01 = Spezialist of 51622). 43-5032 Dispatchers 51122 Luftverkehr (Drift) → 51622 Spedition. 43-5051 Postal Service Clerks 72112 Bankkaufleute (Drift) → 51322 Post-/Zustelldienste. 43-6011 Executive Secretaries 63212 Hotelkaufleute → 71403 Büro/Sekretariat komplex Anf 3 (Anf-up). 43-9071 Office Machine Operators 42312 Umweltschutzverw. (Drift) → 71402 Büro. 43-9081 Proofreaders 23213 Mediengestaltung → 71442 Korrekturleser (sibling-domain + Anf 3 → 2). 43-9111 Statistical Assistants 91343 → 91342 (sibling-down Anf 3 → 2; Modify gegen agent's null).

*`scripts/input/title-overrides-de.mjs`*: 8 batch-9 entries (1 in-place modification + 7 new). 43-9071 "Bürogerätemitarbeiter" → "Reprografiekraft" (in-place). 43-3031 "Buchhalter/Buchhalterin" (NEW). 43-4011 "Wertpapiersachbearbeiter" (NEW; KldB-stays-correct case). 43-4061 "Sachbearbeiter Sozialleistungen" (NEW; war "Grenzschutzbeamter" — title-only-Drift). 43-4151 "Auftragsbearbeiter" (NEW; war "Warenkommissionierer"). 43-4181 "Reisebürokaufmann/-kauffrau" (NEW; war "Fahrkartenverkäufer"). 43-5032 "Disponent (Transport und Logistik)" (NEW). 43-5111 "Prüfer/Prüferin (Wiegen und Messen)" (NEW).

**What shipped — `fix/audit-batch-10-soc19-sciences` (1 PR, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs`*: 22 batch-10 entries (14 Apply, 2 seed pull-outs, 6 Modify reconciliations). Biology research scientists: 19-1012 Food Scientists 27103 → 41284 Biologie sonstige Anf 4. 19-1022 Microbiologists 41203 → 41264 Mikrobiologie Anf 4. 19-1023 Zoologists 41293 Aufsichtskräfte (seed) → 41254 Zoologie Anf 4. 19-1031.02 Range Managers 42314 → 41234 Biologie Ökologie Anf 4 (Modify gegen agent's 11714 Forst). 19-1032 Foresters 41213 biolog.-techn. Lab → 11713 Forstwirtschaft komplex Anf 3. Materials/Atmosphere/Policy/Remote-Sensing: 19-2032 Materials Scientists 41303 (seed-Widerspruch) → 41304 canonical Anf-4-sibling. 19-2041.01 Climate Policy Analysts 72184 → 42314 Umweltschutzverw. Anf 4 (Modify gegen agent's 42144 Meteorologie). 19-2099.01 Remote Sensing Scientists 31213 → 43144 Geoinformatik Anf 4 (Modify of prior batch-entry; Anf-4-cap-Reasoning superseded). Social/Policy sciences: 19-3011.01 Environmental Economists 72184 → 42314. 19-3032 I/O Psychologists 71524 Personaldienstl. → 81614 nicht-klin. Psychologie. 19-3033 Clinical Psychologists 81614 → 81624 (sibling-Drift correction). 19-3039.03 Neuropsychologists 81614 → 81624. 19-3051 Urban/Regional Planners 31114 Architektur → 31124 Stadt-/Raumplanung. 19-3091 Anthropologists/Archeologists 91234 Archäologie → 91264 Anthropologie/Ethnologie (KldB-only Modify; Title bleibt). Technicians: 19-4012.01 Precision Agriculture 11103 → 11113 Landtechnik. 19-4042 Environmental Sci/Protection Tech 42314 Verwaltung Anf 4 → 42203 Umweltschutztechnik Anf 3 (sibling-domain + Anf-down). 19-4043 Geological Tech 41323 chem-techn. Lab → 42113 Geotechnik. 19-4044 Hydrologic Tech 42124 Geologie Anf 4 → 42113 Geotechnik Anf 3 (sibling-domain pivot for Anf-down). 19-4051 Nuclear Tech 41322 → 26233 Energie-/Kraftwerkstechnik (Anf-up 2 → 3). 19-4051.02 Nuclear Monitoring 41322 → 42333 Strahlenschutzbeauftragte (Anf-up 2 → 3). 19-4061 Social Science Research Assts 91324 Anf 4 → 91343 Markt-/Meinungsforschung Anf 3 (Anf-down). 19-5012 OH&S Technicians 31102 Bauplanung (Drift) → 53122 Arbeitssicherheit.

*`scripts/input/title-overrides-de.mjs`*: 11 batch-10 entries (1 in-place hyphen-fix + 10 new). 19-2099.01 "Fernerkundungs-Wissenschaftler" → "Fernerkundungswissenschaftler" (closed compound, in-place). 19-1011 "Nutztierwissenschaftler" (NEW; war "Biologe Aquakultur"; @mo-sp-Pick gegen agent's "Tierzuchtforscher", da Nutztierwissenschaftler die ganze SOC-Domain — Zucht+Ernährung+Reproduktion+Wachstum — abdeckt). 19-1031.02 "Landschaftsökologe" (NEW; war "Forstwirt"). 19-1032 "Förster/Försterin" (NEW; statt agent's "Forstwirt"; BACKLOG-retire). 19-2021 "Meteorologe" (NEW; war "Klimatologe"). 19-2041.01 "Klimapolitik-Analyst" (NEW). 19-3051 "Stadt- und Raumplaner" (NEW). 19-4013 "Lebensmitteltechniker" (NEW; war "Lebensmittelchemiker" — Hochschulberuf-Überhöhung). 19-4044 "Hydrologische Fachkraft" (NEW; war "Hydrogeologe" — Hochschulberuf-Überhöhung). 19-4061 "Sozialwissenschaftlicher Assistent" (NEW; war "Sozialarbeitswissenschaftler" — Begriffs-Verwechslung). 19-4092 "Kriminaltechniker" (NEW; war "Polizeibeamter Ermittlungsdienst" — Streifendienst-Bezeichnung statt Lab-Tech).

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 142 / 402 | **190 / 402** (+22 batch 9, +26 batch 10) |
| Audit findings remaining | ~260 | **~212** |
| Manual KldB overrides applied on build | 288 | **322** (+15 batch 9 net, +19 batch 10 net) |
| Codes in seed block | 104 | 100 (–2 batch 9, –2 batch 10) |
| Title overrides applied | 315 | **331** (+6 batch 9 net, +10 batch 10 net) |
| Tests passing | 243 | 243 (data-only changes) |

**Branches:** `fix/audit-batch-9-soc43-office` (1 code commit → PR merged), `fix/audit-batch-10-soc19-sciences` (1 code commit + this docs commit → PR opened).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batches 11-N — ~212 findings remaining.** Continuing 1-SOC-major-per-section pattern. Next pairings: 11 Mgmt (24) + 17 Architecture/Engineering (21) for Session 41, then 39 Personal Care (14) — possibly paired with one of the big four (29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31). The big four each likely warrant a dedicated section. Estimated 4 more sessions to complete the audit.
- **BigFive coverage gap fix** — still on hold; foundation now ~47 % through the audit pipeline, materially cleaner than at the Session-36 BigFive-pause decision.
- **BACKLOG retirements done this session.** "Förster search hits nothing" and "Range Managers re-title to Landschaftsökologe" both resolved via batch 10 — BACKLOG entries removed in this docs commit.

---

### Session 39 – 2026-04-25
**Focus:** Audit-pipeline batches 7 + 8 — two sections, 46 findings total from `scripts/audit/findings-2026-04-25.json` walked through the plan-table gate. Sektion 1 (SOC 27 Arts/Design/Entertainment/Sports/Media = 23 findings) and Sektion 2 (SOC 13 Business and Financial Operations = 23 findings). Two PRs on `fix/audit-batch-7-soc27-arts` and `fix/audit-batch-8-soc13-business`. Ninth session this calendar day, immediate continuation of Session 38's audit pipeline.

**Meta / process notes:**
- **Section-form change: 1 SOC major per section instead of 2.** Sessions 36–38 had paired 2 SOC majors per section; with both SOC 27 and 13 sitting at 23 findings each, pairing them would have doubled the per-section workload. Decided up-front to split into 1-SOC sections, keeping volume comparable to Session 38 (33 total). Pattern likely sticks for the remaining medium/big SOC groups (43 Office 23, 19 Sciences 27, 29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31).
- **Catalog-only Anf-tier classes drove 6 mandatory tier-bumps in batch 7.** KldB has several specialty classes that exist only at Anf 4 with no lower-tier siblings: 94224 Tänzer/Choreografen, 94134 Dirigenten, 92434 Autoren/Schriftsteller, 83154 Sozial-/Suchtberatung. Audit-flagged Anf-bumps for 27-2031 Dancers, 27-2032 Choreographers, 27-2041 Music Directors, 27-3043 Writers, 27-3043.05 Poets, and (in batch 8) 13-2071 Credit Counselors all hit catalog-only Anf 4 — agent's pick was the only option. Pattern noted for future batches: agent's Anf-tier suggestions in classes with no sibling tiers are catalog-forced, not judgement calls.
- **Sibling-tier reconciliations in both directions across batch 8.** Two UP-shifts (13-2061 Financial Examiners 72243 Anf 3 → 72244 Anf 4 — Behördenprüfer = Studienberuf; 13-2081 Tax Examiners 73232 Anf 2 → 73233 Anf 3 — gehobener Dienst Bachelor); two DOWN-shifts (13-1081 Logisticians + 13-1081.02 Analysts 51624 Anf 4 → 51623 Anf 3 — Spezialist statt Hochschule); one rare DOWN-shift across both KldB and Anf (13-2082 Tax Preparers 72243 Anf 3 → 72302 Anf 2 — US Tax Preparers ≠ DE-Steuerberater-Kammerberuf, sind Steuerfachangestellte, geschützter Titel-Issue). DOWN-shifts were rare in earlier batches; appearing more frequently as the audit reaches O\*NET sub-codes that trigger ESCO mid-tier defaults that don't match the SOC scope.
- **Batch-4 re-evaluation: 13-1041.04 Government Property Inspectors moved.** Batch-4 had pinned 13-1041.04 to 31163 Bausachverständige based on a Title-Lesart "Property = Bauwerke". Audit re-read of the SOC description ("inspect government property to ensure compliance with **contract agreements** and **government regulations**") surfaced this as wrong — the role is regulations/contract compliance, not building inspection. Moved from batch-4 entry to batch-8 (KldB 53313 Gewerbeaufsicht, title "Inspekteur öffentliches Eigentum" → "Regierungsinspektor"). First time an earlier-batch entry got pulled out and re-pinned in a later batch; pattern documentation candidate for `feedback_audit_batch_procedure.md` if it recurs.
- **One agent-suggestion REJECT (13-2023 Real Estate Appraisers).** Agent suggested 61313 Immo-Vermarktung for 13-2023, but Vermarktung = Sales while Real Estate Appraisers do property valuation/Bewertung. Batch-4's existing 31163 Bausachverständige stayed (Bausachverständige covers property valuation gutachten). Rejection documented in batch-8 block header so future audit re-passes don't re-flag.
- **Title-cascade side-effect: 27-2012.05 Media Technical Directors KldB shifted via stem-overlap.** Title-only fix "Technischer Leiter für Bühne, Film und Fernsehen" → "Produktionsleiter Medientechnik" caused build-kldb-mapping's stem-overlap tiebreaker to shift KldB from 94513 Veranstaltungs-/Bühnentechnik (matched on "Bühne"-stem) to 94403 Theater-/Film-/Fernsehproduktion ohne-Spez (matched on "Produktion"-stem). Acceptable: SOC scope is production direction, the new KldB matches the new title. Same mechanism Session 37 saw on 37-3011 (Naturschutz → GaLaBau, also positive). Title-cascade caveat is now stable across sessions; documented in `feedback_audit_batch_procedure.md`.
- **Reconciliation accumulation: 4 in batch 7, 4 in batch 8.** Batch 7: (1) Fashion Designers — agent's 28212 Anf 2 + Anf-bump 3 → 28213 Anf-3-sibling direkt; (2) Craft Artists — agent left null, catalog-pick 93302 Kunsthandwerk ohne-Spez; (3) Coaches and Scouts — agent's 84543 Ballsport zu eng, kept 84503 ohne-Spez; (4) Broadcast Technicians — agent's 26302 Elektrotechnik zu generisch, → 94512 Veranstaltungstechnik (DE-Ausbildungsberuf-fit). Batch 8: (1) 13-1011 Künstler-/Sportler-Agent — agent's 63194 Tourismus/Sport-Führungskräfte zu eng, → 63124 Sportmanager (Career-Manager-Domain breiter); (2) 13-1041.07 Regulatory Affairs — agent's 73284 ÖV falsch (RA arbeitet in Industrie), → 71384 Unternehmensorganisation; (3) 13-2023 REJECT (s.o.); (4) 13-1041.04 Bausachverständige re-eval (s.o.).
- **Stable sub-pattern: re-evaluating prior-batch entries.** Three batch-1/4 entries touched in batch 8: 13-1031 (line 169 batch-1) — KldB 72133 Versicherungskaufleute kept, only title fixed in-place (line 190); 13-2023 (line 226 batch-4) — KldB 31163 kept, agent rejected; 13-1041.04 (line 225 batch-4) — moved to batch-8 with new KldB+title. Pattern: as audit findings accumulate, earlier batches' picks may need re-evaluation when later batches surface a sharper SOC reading. The override-file structure (seed → batch-1 → batch-2 → … → batch-8) holds up because each entry has a domain comment explaining the pick, so re-evaluations have a starting point.
- **Title-only count caveat.** Session 38 had 14 net-new title overrides total; this session has 16 net-new (10 batch-7 + 6 batch-8) plus 3 in-place modifications of earlier batch entries (13-1031, 13-1041.04, 13-1074). The build's "curated overrides applied" counter showed 297 → 307 → 315 across the two builds; the +10 / +8 cadence stays consistent with Session 38.

**What shipped — `fix/audit-batch-7-soc27-arts` (1 PR, merged):**

*`scripts/input/kldb-overrides.mjs`*: 20 batch-7 entries (3 seed pull-outs as comment-replacements: 27-2022 Coaches, 27-2023 Umpires, 27-4011 Audio/Video Technicians). 27-1011 Art Directors 94493 Aufsichtskräfte → 23224 Grafik-/Kommunikations-/Fotodesign hoch komplex Anf 4. 27-1012 Craft Artists 93422 Glas-/Keram-/Porzellanmalerei → 93302 Kunsthandwerk ohne-Spez (catalog-pick). 27-1022 Fashion Designers 93102 Industriedesign → 28213 Modedesign Anf 3 (sibling-direct). 27-1023 Floral Designers 61212 Großhandel → 12202 Floristik. 27-1025 Interior Designers 93233 Raumausstattung → 93213 Innenarchitektur. 27-1027 Set/Exhibit Designers 93213 Innenarchitektur → 94403 Theater/Film/TV ohne-Spez. 27-2012.04 Casting Directors 94493 Aufsichtskräfte → 94483 Theater/Film/TV sonstige. 27-2022 Coaches and Scouts: KldB unchanged at 84503 (reject agent), title only. 27-2023 Umpires 63122 Sport-/Fitnesskaufleute → 94243 Athleten/Berufssportler. 27-2031 + 27-2032 Dancers + Choreographers 94382 Moderation/Unterhaltung → 94224 Tänzer/Choreografen Anf 4 (catalog-only). 27-2041 Music Directors 94183 Musik sonstige → 94134 Dirigenten Anf 4. 27-2042 Musicians 94283 Schauspiel/Tanz sonstige → 94183 Musik sonstige. 27-3043 Writers + 27-3043.05 Poets 92413 Redakteure → 92434 Autoren/Schriftsteller Anf 4. 27-3092 Court Reporters 63212 Hotelkaufleute → 71432 Steno-/Phonotypisten. 27-4011 Audio/Video Tech 82332 Tätowierer → 94532 Bild-/Tontechnik. 27-4012 Broadcast Tech 51182 Eisenbahn-/Luft-/Schiffstechnik → 94512 Veranstaltungs-/Bühnentechnik (DE-Ausbildungsberuf "Rundfunk- und Veranstaltungstechniker"). 27-4014 Sound Engineering Tech 94402 Theater/Film/TV ohne-Spez → 94532 Bild-/Tontechnik. 27-4032 Film/Video Editors 94493 Aufsichtskräfte → 94483 Theater/Film/TV sonstige.

*`scripts/input/title-overrides-de.mjs`*: 10 batch-7 entries. 27-1012 → "Kunsthandwerker". 27-1023 → "Florist". 27-1025 → "Innenarchitekt". 27-1027 → "Szenenbildner". 27-2012 → "Regisseur". 27-2012.05 → "Produktionsleiter Medientechnik" (Title-cascade-Nebenwirkung: KldB 94513 → 94403). 27-2022 → "Sporttrainer". 27-3023 → "Journalist". 27-4012 → "Rundfunk- und Veranstaltungstechniker". 27-4014 → "Tontechniker".

**What shipped — `fix/audit-batch-8-soc13-business` (1 PR, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs`*: 17 batch-8 entries (3 seed pull-outs: 13-1081.01 Logistics Engineers, 13-1082 Project Management, 13-1131 Fundraisers; 1 batch-4 pull-out: 13-1041.04 Government Property Inspectors moved 31163 Bausachverständige → 53313 Gewerbeaufsicht). 13-1011 Künstler-/Sportler-Agent 72183 Versicherungs-/Finanzdienst → 63124 Sportmanager hoch komplex Anf 4 (reconcile gegen agent's 63194). 13-1041.06 Coroners 73104 Rechtsberatung → 81484 Ärzte sonstige. 13-1041.07 Regulatory Affairs 73104 Rechtsberatung → 71384 Unternehmensorg sonstige (reconcile gegen agent's 73284). 13-1051 Cost Estimators 72243 Wirtschaftsprüfung → 72223 Kostenrechnung/Kalkulation. 13-1081 Logisticians 51624 → 51623 (sibling Anf 4 → 3). 13-1081.02 Logistics Analysts 51624 → 51623 (sibling Anf 4 → 3). 13-1151 Training/Development 84483 außerschulische Bildung → 71513 Personalentwicklung. 13-1199.06 Online Merchants 92113 Werbung/Marketing → 61283 Handel sonstige. 13-1199.07 Security Mgmt Specialists 53122 Arbeitssicherheit → 53183 Sicherheit sonstige (kldb+anf-up). 13-2061 Financial Examiners 72243 → 72244 (sibling Anf 3 → 4). 13-2071 Credit Counselors 72113 Bankkaufleute → 83154 Sozial-/Suchtberatung Anf 4 (catalog-only Anf-bump). 13-2081 Tax Examiners 73232 → 73233 (sibling Anf 2 → 3). 13-2082 Tax Preparers 72243 Wirtschaftsprüfung → 72302 Steuerberatung Anf 2 (rare DOWN-shift; SOC ≠ Kammer-Steuerberater).

*`scripts/input/title-overrides-de.mjs`*: 6 net-new batch-8 entries (13-1011 → "Künstler- und Sportleragent"; 13-1021 → "Einkäufer Agrarprodukte"; 13-1131 → "Fundraiser"; 13-1199.05 → "Nachhaltigkeitsmanager"; 13-2031 → "Budgetanalyst"; 13-2082 → "Steuerfachangestellter") + 3 in-place modifications of earlier batch entries (13-1031 Schadensregulierer → Schadensachbearbeiter; 13-1041.04 Inspekteur öffentliches Eigentum → Regierungsinspektor; 13-1074 Saisonkräfte-Vermittler → Arbeitsvermittler Landwirtschaft).

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 96 / 402 | **142 / 402** (+23 batch 7, +23 batch 8) |
| Audit findings remaining | ~307 | **~260** |
| Manual KldB overrides applied on build | 258 | **288** (+17 batch 7, +13 batch 8 net) |
| Codes in seed block | 110 | 104 (–3 batch 7, –3 batch 8) |
| Title overrides total | ~88 | ~104 (+10 batch 7, +6 net new batch 8) |
| Tests passing | 243 | 243 (data-only changes) |

**Branches:** `fix/audit-batch-7-soc27-arts` (1 code commit → PR merged), `fix/audit-batch-8-soc13-business` (1 code commit + this docs commit → PR opened).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batches 9-N — ~260 findings remaining.** Continuing 1-SOC-major-per-section pattern. Next pairings: 43 Office (23) + 19 Sciences (27) for Session 40, then 39 Personal Care (14) — possibly paired with one of the big four to balance load. The big four (29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31) each likely need a dedicated section now that 1-SOC-per-section is the cadence. Estimated 4-5 more sessions to complete the audit.
- **BigFive coverage gap fix** — still on hold; foundation now ~35 % through the audit pipeline, materially cleaner than at the Session-36 BigFive-pause decision.

---

### Session 38 – 2026-04-25
**Focus:** Audit-pipeline batches 5 + 6 — two sections, 33 findings total from `scripts/audit/findings-2026-04-25.json` walked through the plan-table gate. Sektion 1 (SOC 25 Education = 16 findings) and Sektion 2 (SOC 49 Maintenance/Repair = 17 findings). Two PRs on `fix/audit-batch-5-soc25-edu` and `fix/audit-batch-6-soc49-maintenance`. Eighth session this calendar day, immediate continuation of Session 37's audit pipeline. Also rides the Anf-pill compact-list-view PR (`feat/results-anf-visibility`) that shipped between Session 37 and 38 without its own SUMMARY entry.

**Meta / process notes:**
- **Two new memory files codifying audit-batch procedure.** Mid-Sektion-1 browser test surfaced that `npm run build:esco` had not been run after editing `title-overrides-de.mjs` — only `build-kldb-mapping.mjs` had run, so KldB subtitles were correct but DE titles were stale. @mo-sp: "ich finde viele berufe garnicht dafür noch die alten zb lebensberater". Required a follow-up commit to regenerate `onet-occupations.json`. Saved as `feedback_override_build_pipeline.md` ("Override edits → run BOTH build scripts") so the rule persists across sessions. Also added `feedback_audit_batch_procedure.md` covering the end-to-end workflow (SOC grouping, per-section step sequence, seed pull-out pattern, batch-N block organization, plan-table vocabulary). Together with the existing `feedback_plan_table_format.md` from Session 37, the audit-pipeline procedure is now fully memory-encoded across 3 files.
- **Sektion 2 lint surfaced a second pre-edit-grep gap.** Pre-edit grep had checked `kldb-overrides.mjs` for existing 49-* entries (found 6 seed entries) but skipped the same check on `title-overrides-de.mjs` — which has its own non-batch cluster-blocks. Lint then caught two duplicate keys (49-2094 in "Kundendiensttechniker" cluster, 49-9011 in "Schloss- und Schlüsselmacher" cluster). Cost an extra commit; updated `feedback_audit_batch_procedure.md` to require the grep across **both** files.
- **Plan-table format codified rule held cleanly across both sections.** Sektion 1 had three discussion points pre-Apply (Adult Basic Ed Anf-tier choice, Vertretungslehrer Anf-bump judgement, Teaching Assistants Regelschule reject reasoning), all resolved in inline back-and-forth before any file edit. Sektion 2 had five (First-Line Supervisor coupled title, Med Equip Repairer Anf 3 vs 4, Watch Repairer Anf 2 vs 3 reconciliation, Oldtimer coupled-down to Anf 2, Rail Car agent-pick acceptance). All approved as-suggested ("passt alles wie du es vorschlägst") — the table format kept the choices explicit and the discussion focused.
- **Five reconciliations against agent suggestions across the session.** Sektion 1: 25-9042 Teaching Assistants Regelschule reject (KldB-841xx hat keine Anf-2-Klasse für allgemeinbildende Schulen; current 84183 Anf 3 stays as nearest-tier). Sektion 2: (1) 49-9062 Med Equip Repairers — agent's 82504 Anf 4 → 82503 Anf 3 (BMET ist Techniker-Tier, nicht Master), (2) 49-9064 Watch Repairers — agent's 24533 Anf 3 → 24532 Anf 2 (Geselle-Tier, kein Meister), (3) 49-9092 Commercial Divers — agent left null, catalog-pick 24432 Industrietaucher, (4) 49-3021 Automotive Body Repairers — coupled-down vom Seed-Bump 25213 Anf 3 zu 25212 Anf 2 (mit neuem generischen Title gehört der Tier zurück auf Geselle-Niveau).
- **Six seed pull-outs across the session, four First-Line-Supervisor pattern continuations.** Pulls: 25-1123, 25-1124, 25-2022, 25-3021 (batch-5); 49-3031, 49-3043, 49-9045, 49-9062, 49-3021 (batch-6). The First-Line-Supervisor → Aufsichtskraft Anf 3 pattern from batches 2-4 (33-1011/12/21, 37-1011/12, 35-1012, 41-1011/12) extended once more to 49-1011 (Mechanics/Installers/Repairers Supervisors). Five reconciliations away from agent KldBs and the seed-pull-out cadence are the steady-state of the audit pipeline now.
- **Anf-pill compact-list visibility shipped as a separate small PR before this session.** Surfaced in Session 37 batch-4 browser test as a UX-improvement candidate. Single-line edit to `ResultsPage.vue` adding "Anforderungsniveau: N" to the result-row metadata line; merged as PR #77 between Session 37 and 38. No SUMMARY entry of its own — captured here.

**What shipped — `feat/results-anf-visibility` (1 PR, merged before Session 38 work):**

*`src/pages/results/ResultsPage.vue`*: 1-line addition to compact list-view metadata showing "Anforderungsniveau: N" alongside KldB subtitle + O*NET code. Speeds up audit-batch browser-testing where Anf is one of the three flag dimensions to verify.

**What shipped — `fix/audit-batch-5-soc25-edu` (1 PR, merged):**

*`scripts/input/kldb-overrides.mjs`*: 13 batch-5 entries net (4 seed pull-outs as comment-replacements, 13 new entries in batch-5 block). Five Postsecondary SOC entries → 84304 Hochschullehre (Geography, Art/Drama/Music, English, Foreign Languages, Recreation/Fitness Studies). 25-2022 Middle School Teachers shifted Sprachenlehrer → 84124 Sekundarstufe. 25-3011 Adult Basic Ed → 84404 Erwachsenenbildung. 25-3021 Self-Enrichment → 84483 außerschulisch Anf 3 (Hobby/VHS-Kursleiter). 25-4012 Curators → 94704 Museumsberufe. 25-9043 Teaching Assistants Special Ed → 83132 Heilerziehungspflege Anf 2. 25-3031 Substitute Teachers re-tiered Anf 3 → 4 (Lehramts-Norm). 25-9031 Instructional Coordinators → 84404 Erwachsenenbildung. One reject (25-9042 Teaching Assistants Regelschule).

*`scripts/input/title-overrides-de.mjs`*: 8 batch-5 entries. 25-1062 → "Kultur- und Sozialwissenschaften" (was Anthropologie). 25-1064 → "Hochschullehrkraft für Geografie/Erdkunde". 25-1121 → "Hochschullehrkraft Kunst, Drama und Musik". 25-1193 → "Hochschullehrkraft für Sportwissenschaft". 25-1194 → "Lehrkraft für berufsbildende Fächer" (was "industriell gefertigte Kunst"). 25-2011 → "Erzieher" (was "Lehrkraft für Freinet-Schulen"). 25-3011 → "Lehrkraft für Grundbildung und Alphabetisierung". 25-3021 → "Kursleiter Freizeitbildung" (was "Lebensberater" — Eso-Konnotation).

**What shipped — `fix/audit-batch-6-soc49-maintenance` (1 PR, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs`*: 15 batch-6 entries (5 seed pull-outs as comment-replacements, 15 new entries in batch-6 block). 49-1011 First-Line Supervisors 25212 Anf 2 → 25193 Aufsichtskräfte Maschinenbau Anf 3. 49-3031 Bus/Truck Mechanics 25112 → 25212 Kfz-Tech (seed pull-out). 49-3043 Rail Car Repairers 25112 → 51112 Eisenbahnbetrieb (seed pull-out). 49-9045 Refractory Materials Repairers 32122 Maurerhandwerk → 21412 Industriekeramik (seed pull-out, SOC explizit "Except Brickmasons"). 49-9062 Med Equip Repairers 26122 Anf 4 → 82503 Medizintechnik Anf 3 (seed pull-out + Anf reconciliation). 49-3021 Auto Body Repairers 25213 Anf 3 → 25212 Anf 2 (seed pull-out + coupled-down). 49-9064 Watch Repairers 21352 Glasapparatejustierung → 24532 Uhrmacherhandwerk Anf 2 (Anf reconciliation). 49-9092 Commercial Divers 31193 Bauplanung → 24432 Industrietaucher (catalog-pick). Plus 49-3053 Outdoor Power → 25182, 49-9011 Doors → 26112 Mechatronik, 49-9061 Cameras → 23312 Fototechnik, 49-9097 Signal Repairers → 51222 Eisenbahninfrastruktur-Wartung, 49-2093 Transport Electronics → 26332, 49-3041 Farm Equipment → 25222, 49-9021 HVACR → 34212 SHK.

*`scripts/input/title-overrides-de.mjs`*: 11 batch-6 entries (2 of which displaced existing cluster-block entries for 49-2094 and 49-9011). 49-1011 → "Werkstattleiter Maschinenbau". 49-2093 → "Fahrzeugelektroniker (Mobile Systeme)". 49-2094 → "Elektroniker für Betriebstechnik" (was "Elektroniker Gewerbliche Geräte"). 49-2095 → "Elektrotechniker Energieanlagen" (was "Steuerer Stromversorgung"). 49-3021 → "Karosserie- und Fahrzeugbaumechaniker". 49-3031 → "Nutzfahrzeugmechatroniker". 49-3053 → "Motorgerätemechaniker". 49-9011 → "Monteur Tor- und Türtechnik". 49-9062 → "Medizintechniker". 49-9092 → "Berufstaucher". 49-9097 → "Signaltechniker Eisenbahn".

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 63 / 402 | **96 / 402** (+16 batch 5, +17 batch 6) |
| Audit findings remaining | ~340 | **~307** |
| Manual KldB overrides applied on build | 239 | **258** (+9 batch 5 net, +10 batch 6 net) |
| Codes in seed block | 119 | 110 (–4 batch 5, –5 batch 6) |
| Title overrides total | ~74 | ~88 net (288 → 297 effective due to 2 cluster-block displacements) |
| Tests passing | 243 | 243 (data-only changes) |
| Audit-pipeline memory files | 1 | **3** (added override-build-pipeline + audit-batch-procedure) |

**Branches:** `feat/results-anf-visibility` (1 PR merged precursor), `fix/audit-batch-5-soc25-edu` (2 commits → PR merged), `fix/audit-batch-6-soc49-maintenance` (1 code commit + this docs commit → PR opened).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batches 7-N — ~307 findings remaining.** Smaller-group queue exhausted; the next pairings hit medium groups: 27 Arts (23) + 13 Business (23), then 43 Office (23) + 19 Sciences (27). The big four (29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31) plus 39 Personal Care (14) want dedicated sections. Estimated 4-5 more sessions.
- **BigFive coverage gap fix** — still on hold, foundation continues to firm up (audit pipeline now ≈24 % through, base ist deutlich kohärenter als bei Session 36 als BigFive-Pause beschlossen wurde).

---

### Session 37 – 2026-04-25
**Focus:** Audit-pipeline batches 3 + 4 — two sections, 31 findings total from `scripts/audit/findings-2026-04-25.json` walked through the show-plan-then-apply gate. Sektion 1 (SOC 23+37+35 = 11 findings, smallest mini-cleanup) and Sektion 2 (SOC 41+15 = 20 findings, largest batch so far). Two PRs on `fix/audit-batch-3-soc23-37-35` and `fix/audit-batch-4-soc41-15`. Seventh session this calendar day, immediate continuation of Session 36's audit pipeline.

**Meta / process notes:**
- **Plan-table format codified as a persistent rule.** Mid-Sektion-1, @mo-sp re-asserted the plan-then-apply gate ("bevor du die geplanten änderungen umsetzt mir immer komplett vorlegen und absegnen lassen") and added the four required columns: EN-Original, DE-translation, current state, planned change. Saved as `feedback_plan_table_format.md` in memory so it persists beyond this session. The Session-36 SUMMARY had documented the workflow inline; the rule now sits as a standalone feedback memory across sessions.
- **Title-question round-tripping caught two bad picks.** Sektion 1: agent's "Schädlingsbekämpfer" for 37-3012 Pesticide Handlers Vegetation got rejected by @mo-sp ("damit sind ja keine leute gemeint die ratten zb jagen oder ähnliches.. das hört sich schon eher nach tieren an als nach pflanzenschutz") — chose "Mitarbeiter im Pflanzenschutz" (signals plants, not animals). Same section: my own initial "Koch in der Gemeinschaftsverpflegung" / agent-conflicting "Koch in der Systemgastronomie" both fell to @mo-sp's pick of "Großküchenkoch" (alltagstauglich, no Systemgastronomie-collision with 35-2015 Short Order Cooks already mapped to 63312 Systemgastronomie). Sektion 2: 41-1012 Non-Retail Supervisors title — agent's "Vertriebsleiter" was ambiguous between Anf 3 and 4; offered three explicit alternatives, @mo-sp picked "Teamleiter Vertrieb" (unambiguous Anf 3 mid-tier, parallel to "Filialleiter Einzelhandel" for 41-1011). 15-1299.03 title — @mo-sp pushed back asking *why* the change ("warum der title wechsel?"); the answer was that current FaMI is a 3-jähriger IHK-Ausbildungsberuf for libraries/archives (Anf 2), but SOC describes Enterprise-DMS implementers (Anf 3 IT-Spezialist) — completely different professions. After the explanation @mo-sp picked "Dokumentenmanagement-Spezialist". The pattern is consistent: present alternatives + reasoning, don't just pick.
- **Two seed-block pull-outs continuing the established cleanup.** 23-2093 Title Examiners (was 73112 Anf 2) → batch-3 block (73113 Anf 3, eigenständige Spezialistentätigkeit). 15-2031 Operations Research Analysts (was 51624 Speditions-/Logistikkaufleute Anf 4 — stem-drift "Logistik" in description) → batch-4 block (41104 Mathematik hoch komplex). Seed block now at 119 entries (was 121 after Session 36, –2 this session).
- **Five First-Line Supervisor reconciliations across both sections.** Pattern from batch 2 (33-1011/12/21) extended to batch 3 (37-1011 Housekeeping, 37-1012 Landscaping, 35-1012 Food Prep) and batch 4 (41-1011 Retail, 41-1012 Non-Retail). All five had been routed to fachlich-Anf-2 or Führungskräfte-Anf-4 classes; reconciliation moves them to Aufsichtskräfte-Anf-3 (or nearest tier where no Aufsichtskräfte class exists in KldB). For 41-1012 Non-Retail specifically, KldB lacks an Aufsichtskräfte-Vertrieb class, so 61123 Vertrieb komplex Anf 3 is the nearest-tier fallback (Spezialist statt Aufsicht). The agent flagged title-only or anf-only on most of these — extending to a structural KldB+Anf reconciliation is now a recurring micro-pattern, surfaced in plan-table comments.
- **One reconciliation against agent's broader class.** 15-1252 Software Developers — agent suggested 43104 Informatik (ohne Spez.) hoch komplex Anf 4. Counter-pick: 43413 Softwareentwicklung komplex Anf 3, the explicit Software-Developer KldB class, no unnecessary Anf-4 bump. The reconciliation came up because catalog-lookup against `kldb-data.json` revealed 43413 as a tighter match than the agent's broader "ohne Spez." class.
- **Side-effect cascade on 37-3011: title change moved KldB.** 37-3011 Landscaping Workers had agent flag title-only ("Rasenpfleger" → "Garten- und Landschaftspfleger"), no KldB change requested. After applying the title override, `build-kldb-mapping.mjs` re-computed the KldB based on the new title and shifted from 11722 Natur-/Landschaftspflege to 12142 Garten-/Landschafts-/Sportplatzbau — a positive side-effect (GaLaBau is semantically closer than reine Naturschutz-Pflege). Confirmed and documented in commit message; no rollback needed. Reminder: title-only changes can cascade through the build.

**What shipped — `fix/audit-batch-3-soc23-37-35` (1 PR, merged):**

*`scripts/input/kldb-overrides.mjs`*: 9 batch-3 entries, 1 seed pull-out. SOC 23 — 23-2093 Title Examiners 73112 Anf 2 → 73113 Anf 3 specialist (eigenständige Grundbuch-Recherche). SOC 37 — 37-1011 Housekeeping Supervisors 83212 Anf 2 → 83293 Aufsichtskräfte Anf 3; 37-1012 Landscaping Supervisors 12102 Anf 2 → 12193 Aufsichtskräfte Gartenbau Anf 3; 37-3012 Pesticide Handlers Vegetation 33242 Holz-/Bautenschutz → 53342 Desinfektion/Schädlingsbekämpfung. SOC 35 — 35-1012 Food Prep Supervisors 63312 Anf 2 → 63393 Aufsichtskräfte Gastronomie+Systemgastronomie Anf 3; 35-2011 Cooks Fast Food 63301 Gastronomieservice → 29301 Köche Helfer; 35-2013 Cooks Private Household 29393 Aufsichtskräfte Anf 3 → 29302 Köche fachlich Anf 2 (reconciliation against agent's 29301 Helfer); 35-2015 Cooks Short Order 63301 Gastronomieservice Anf 1 → 63312 Systemgastronomie Anf 2; 35-9031 Hosts/Hostesses 63112 Tourismuskaufleute → 63302 Gastronomieservice.

*`scripts/input/title-overrides-de.mjs`*: 5 batch-3 entries. 37-1012 "Produktionsleiter im Bereich Gartenbau" → "Vorarbeiter im Garten- und Landschaftsbau"; 37-3011 "Rasenpfleger" → "Garten- und Landschaftspfleger" (KldB cascade-shifted to 12142 GaLaBau as positive side-effect); 37-3012 "Mitarbeiter für die Pestizidausbringung" → "Mitarbeiter im Pflanzenschutz"; 35-1012 "Schnellrestaurantteamleiter" → "Schichtleiter Gastronomie"; 35-2012 "Diätkoch" → "Großküchenkoch". 35-9031 title "Oberkellner" kept on @mo-sp's call (KldB still moved out of Tourismuskaufleute drift).

**What shipped — `fix/audit-batch-4-soc41-15` (1 PR, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs`*: 17 batch-4 entries, 1 seed pull-out. SOC 15 (10 entries) — 15-1241 Network Architects 43103 Informatik → 43313 IT-Netzwerktechnik; 15-1252 SwDev 43123 tech. Informatik → 43413 Softwareentwicklung Anf 3 (reconciliation against agent's 43104 hoch komplex); 15-1254 Web Developers 43152 Medieninformatik → 43412 Softwareentwicklung-fachlich; 15-1255.01 Game Designers 23223 Grafikdesign → 43153 Medieninformatik; 15-1299.02 GIS 31214 Vermessungstechnik → 43144 Geoinformatik; 15-1299.03 Document Management Specialists 73394 Führungskräfte Mediendienste Anf 4 → 43333 IT-Organisation Anf 3; 15-1299.07 Blockchain 43103 Informatik → 43413 Softwareentwicklung; 15-2011 Aktuar 41103 Anf 3 → 41104 Anf 4 (DAV-Ausbildung); 15-2031 Operations Research seed 51624 Logistik → 41104 Mathematik (pulled out of seed); 15-2051.02 Clinical Data Manager 81294 Med-Lab Führungskräfte Anf 4 → 43413 Softwareentwicklung Anf 3. SOC 41 (7 entries) — 41-1011 Retail Supervisors 61294 Führungskräfte Handel Anf 4 → 62193 Aufsichtskräfte Verkauf Anf 3; 41-1012 Non-Retail Supervisors 61294 Führungskräfte Handel Anf 4 → 61123 Vertrieb komplex Anf 3 (nearest-tier — no Aufsichtskräfte-Vertrieb in KldB); 41-2031 Retail Salespersons 61212 Groß-/Außenhandel → 62102 Verkauf; 41-3011 Advertising Sales 72183 Versicherungen → 92113 Werbung/Marketing; 41-4011 Tech Sales Reps 81883 Pharmazie → 61122 Vertrieb fachlich; 41-4011.07 Solar Sales 81883 Pharmazie → 61122 Vertrieb fachlich; 41-9031 Sales Engineers 81883 Pharmazie → 61123 Vertrieb komplex.

*`scripts/input/title-overrides-de.mjs`*: 8 batch-4 entries, 1 reused key (15-1299.03 replaced FaMI). 15-1232 "IT-Helpdesk-Manager" → "IT-Support-Spezialist"; 15-1254 "Web-Designer" → "Web-Entwickler"; 15-1299.03 FaMI → "Dokumentenmanagement-Spezialist"; 41-1011 "Leiter eines Bekleidungsgeschäftes" → "Filialleiter Einzelhandel"; 41-1012 "Ladenmanager" → "Teamleiter Vertrieb"; 41-4011 "Fachkraft im Bereich Vertrieb" → "Technischer Vertriebsmitarbeiter"; 41-9012 "Modell für Künstler" → "Model/Fotomodell"; 41-9021 "Immobilienhändler" → "Immobilienmakler".

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings applied | 32 / 402 | **63 / 402** (+11 batch 3, +20 batch 4) |
| Audit findings remaining | ~370 | **~340** |
| Manual KldB overrides applied on build | 215 | **239** (+9 batch 3, +17 batch 4, –2 seed pull-outs) |
| Codes in seed block | 121 | 119 (–1 batch 3, –1 batch 4) |
| Title overrides total | ~66 | ~74 (+5 batch 3, +7 net new in batch 4) |
| Tests passing | 243 | 243 (data-only changes) |

**Branches:** `fix/audit-batch-3-soc23-37-35` (1 code commit → PR merged), `fix/audit-batch-4-soc41-15` (1 code commit + this docs commit → PR opened).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batches 5-N — ~340 findings remaining.** Continuing 2 SOC groups per section. After this session the small/medium-group queue is exhausted (only Education 25 = 16, Maintenance 49 = 17 remain at sub-20-finding sizes). Next sessions need to pair larger groups: candidates 25 Education (16) + 49 Maintenance (17) = 33 in one session, then move into 27 Arts (23) + 13 Business (23) and 43 Office (23) + 19 Sciences (27). The big four (29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31) will each likely need their own dedicated section. Estimated 4-6 more sessions to complete the audit at the current cadence.
- **Anf visibility on results list.** @mo-sp surfaced during Sektion 2 browser test that the Anforderungsniveau is hidden — the compact list view shows only title + O*NET code, the Anf-pill is buried in expanded/detail view. For audit debugging it would be easier if the Anf-pill (or the KldB subtitle's first-tier name) sat directly under the title in the list. UX tweak in `ResultsPage.vue`, no scoring impact. Could be a small dedicated PR or fold into the next batch session.
- **BigFive coverage gap fix** — still on hold, foundation continues to firm up.

---

### Session 36 – 2026-04-25
**Focus:** 10-agent Sonnet coherence audit over the full 923-occupation corpus surfacing 402 flagged occupations across three independent flag types (kldb-mismatch / title-awkward / anf-mismatch), followed by two validation batches walking the smallest SOC groups (21+45, then 31+33 = 32 findings, ~25 applied). Two PRs on `fix/audit-batch-1-soc21-45` and `fix/audit-batch-2-soc31-33`. Sixth session this calendar day.

**Meta / process notes:**
- **Pivot before BigFive imputation: stabilize the foundation first.** Session-start agenda was the BigFive coverage-gap fix from BACKLOG (169 missing profiles, originally framed as ~141). @mo-sp redirected mid-discussion: surfaced three concrete KldB drift cases off the cuff (Schuldnerberater → Bankkaufleute, Hochschullehrkraft Anglistik → Sekundarstufe, Oberkellner → Tourismuskaufleute), all verified as real. The argument: imputing BigFive on top of a schiefe KldB-Basis amplifies noise instead of signal. Better to fix the visible coherence problems first, then layer BigFive imputation on a stable base. The BigFive entry stays in BACKLOG, untouched.
- **Pilot-first scaling on the 10-agent run.** Pilot (every 10th occupation) hit 47/93 flagged with zero hallucinated KldB codes (catalog-lookup constraint held). Spot-verified four cited examples (Veterinarians titled "Alternativer Tiertherapeut", Bergbau-Untertage in Straßenbau, Recreation/Fitness-Hochschullehre as betriebliche Ausbildung, MTA-Neurodiagnostik in Ergotherapie) — all real bugs. Then 9 parallel Sonnet agents on stratified offsets 1-9, each with full `kldb-data.json` catalog inline. All 224 unique proposed KldB codes verified across all 10 agent outputs — zero hallucinations. Total: 402 flagged of 923 (43.6 %), 578 flags. Output persisted at `scripts/audit/findings-2026-04-25.json` (5882 lines), drives this and follow-up batches. Hochrechnung was conservative: medium-severity ratio came out higher than pilot suggested, with ~350 high-severity flags being clear fixes.
- **Workflow validation: 2 SOC groups per section, 2 sections per session.** Batch 1 (SOC 21 Community/Social Services + SOC 45 Farming/Forestry/Fishing = 11 findings) chosen as smallest manageable cross-domain pair. Batch 2 (SOC 31 Healthcare Support + SOC 33 Protective Services = 21 findings) scaled up slightly. Pattern emerging: 60-80 % of findings translate directly to overrides; 15-20 % get rejected (current state defensible); 5-10 % get modified mid-review.
- **Three reconciliations in batch 2 against the agent's suggestions.** (1) `31-2012` OT Aides — agent suggested Anf 1, but KldB 81721 Helfer-class doesn't exist; fall back to 81722 fachlich Anf 2 as nearest tier (shared with 31-2011 OT Assistants, kept distinguishable by title). (2) `33-1021` Firefighters — agent self-contradicted (kldb 53134 Anf 4, anf-suggestion Anf 3); resolved as 53133 komplex Anf 3 (Zugführer-Tier, gehobener Dienst). (3) `33-2022` Forest Fire Inspectors — agent's title suggestion "Forstaufseher" would have duplicated `19-4071` Forest and Conservation Technicians; kept current "Forstwirtschaftskontrolleur" (KldB-fix only).
- **Three explicit rejections in batch 2 review.** (1) `31-9096` Veterinary Assistants — current 81142 Tiermedizinische Fachangestellte fits the SOC's Klinik-/Praxis-Assistenz scope; agent's 11522 Haus-/Zootierpflege not clearly better. (2) `33-3041` Parking Enforcement (Politessen) — neither current 51512 Straßenverkehr nor agent's 53112 privater Schutz fits Politessen (kommunale Ordnungsamt). KldB lacks a clean class; left at 51512 until a better target emerges. (3) `33-9011` Animal Control — @mo-sp pushed back on agent's 53182 Schutz/Sicherheit ("Schutz/Sicherheit ist Security, nicht Tierkontrolle"); kept current 11732 Jagdwirtschaft as imperfect-but-defensible.
- **Title-quality call: formal Dienstbezeichnungen over operative Rollen, where one exists.** @mo-sp surfaced the issue at 33-1021 ("Feuerwehrkommandant"): in DE, "Kommandant" is the Wehrleiter of a Freiwillige Feuerwehr, not the operational title in the Berufsfeuerwehr. Walked the German hierarchy (mittlerer / gehobener / höherer Dienst) and landed on the Anf-3 entry-tier Dienstbezeichnung "Brandinspektor". Same pattern then applied to 33-1012 Police: "Vorgesetzter im Polizeivollzugsdienst" (generic) → "Polizeihauptkommissar" (Standard-Dienstbezeichnung am Dienstgruppenleiter-Tier). 33-1011 Justizvollzug stayed at "Dienstgruppenleiter Justizvollzug" — no clean formal Dienstbezeichnung at this Tier (varies per Bundesland), operational title is the better choice. T7 33-1091 Security similar: "Sicherheitsdienstleiter" rejected by @mo-sp ("Sicherheitsdienst sind Firmen, das wäre der Firmenchef") → "Einsatzleiter Sicherheitsdienst" (Schichtführungs-Tier).
- **Two process corrections mid-session.** (1) Mid-batch-2 I jumped to write before showing the plan table; @mo-sp called it: "wolltest du mir nicht erst die geplanten änderungen zeigen bevor du sie einbaust?" Pulled the plan back for inline review with all EN originals + DE class names side-by-side. (2) Then I started writing SUMMARY before the browser test; @mo-sp called that too: "nicht erst testen?" Reverted, gave explicit test instructions, waited for confirmation. Both corrections re-anchor the show-then-apply / test-then-write pattern that keeps me from drifting into autopilot.

**What shipped — `fix/audit-batch-1-soc21-45` (1 PR, merged):**

*`scripts/audit/findings-2026-04-25.json`* (NEW, 5882 lines): 10-agent audit output, sorted by severity then onetCode. 402 flagged occupations across three flag types, drives this and follow-up batches.

*`scripts/input/kldb-overrides.mjs` (+10 entries in batch-1 block, –1 from seed-block):* SOC 21 — three Stem-Drift cases on `"-berater"` corrected (21-1015 Reha-Berater, 21-1091 Public Health, 21-1092 Bewährungshelfer all moved out of Verbraucher-/Wirtschaftsförderung into Sozialarbeit/Gesundheitsberatung); 21-1012 Berufsberater Personaldienstleistung → 83154 Sozial-/Erziehungs-/Suchtberatung; 21-1093 Sozialassistent re-tiered Anf 3 → 2; 21-2021 Directors of Religious Activities Angehörige geistlicher Orden → 83323 Gemeindearbeit. SOC 45 — 45-1011 First-Line Supervisors re-tiered Anf 2 → 3; 45-2093 Pferdewirtschaft → 11212 Nutztierhaltung; 45-4021 Fallers + 45-4023 Log Graders both into 11712 Forstwirtschaft. 45-4021 pulled out of seed (52512 was drift); 45-2041 stays in seed (29152 confirmed nearest-class).

*`scripts/input/title-overrides-de.mjs` (+5):* 21-2021 Missionar → Gemeindereferent; 45-1011 "Führungskraft für die Ernte aquatischer Organismen" → "Aufsichtskraft Land- und Forstwirtschaft"; 45-2041 "Milchkontrolleur" → "Sortierer landwirtschaftlicher Produkte"; 45-2093 "Zuchtassistent Aquakultur" → "Tierwirt"; 45-4021 "Schrotsägenführer" → "Forstwirt". Helfer-Tier "Waldarbeiter" preserved at 45-4011 Forest and Conservation Workers (KldB 11711 Forstwirtschaft Helfer Anf 1).

**What shipped — `fix/audit-batch-2-soc31-33` (1 PR, this docs commit rides with it):**

*`scripts/input/kldb-overrides.mjs` (+16 entries in batch-2 block):* SOC 31 (8 entries) — 31-1122 Personal Care Aides Sozialarbeit → 83142 Haus-/Familienpflege; 31-1132 Orderlies Rettungsdienst-Helfer → 81301 Krankenpflege-Helfer; 31-2011 OT Assistants Anf 3 → 81722 Anf 2; 31-2012 OT Aides Anf 3 → 81722 Anf 2 (kein Anf-1-Helfer-Class verfügbar); 31-2021 PT Assistants Heilkunde/Homöopathie → 81712 Physiotherapie; 31-9093 Med Equipment Preparers (ZSVA) Rettungsdienst → 82502 Medizintechnik (Anf 1 → 2); 31-9097 Phlebotomists Rettungsdienst → 81332 medizintech. Assistenz (Anf 1 → 2); 31-9099.01 Speech-Lang Pathology Assistants 81733 Anf 3 → 81782 Anf 2 (catch-all für nicht-existente Anf-2-Sprachtherapie-Klasse). SOC 33 (8 entries) — 33-1011 Supervisors Correctional 27294 Tech-Konstr (Drift) → 53244 Justizvollzug Anf 4; 33-1012 Supervisors Police 73294 Verwaltung (Drift) → 53214 Polizeivollzug Anf 4; 33-1021 Supervisors Firefighters 27294 Tech-Konstr (Drift) → 53133 Brandschutz komplex Anf 3 (re-tiered Anf 4 → 3 per agent flag); 33-1091 Supervisors Security 53112 fachlich Anf 2 → 53193 Aufsichtskräfte Anf 3; 33-2021 Fire Inspectors Bauplanung → 53132 Brandschutz; 33-2022 Forest Fire Inspectors Gewerbeaufsicht → 11712 Forstwirtschaft; 33-9031 Gambling Surveillance Gewerbeaufsicht → 94342 Glücks-/Wettspiel; 33-9092 Lifeguards/Ski Patrol Jagdwirtschaft (Drift) → 53142 Badeaufsicht.

*`scripts/input/title-overrides-de.mjs` (+11):* 31-1122 "Sozialbetreuer häusliche Betreuung" → "Alltagsbegleiter"; 31-1131 "Gesundheits- und Krankenpfleger/Krankenschwester" → "Pflegeassistent" (war geschützter Titel der 3-jährigen Ausbildung); 31-1132 "Krankenträger" → "Patientenbegleiter"; 31-2021 "Therapeut Komplementärmedizin" → "Physiotherapieassistent"; 33-1011 "Gefängnisdirektor" → "Dienstgruppenleiter Justizvollzug"; 33-1012 "Polizeipräsident" → "Polizeihauptkommissar"; 33-1021 "Feuerwehrkommandant" → "Brandinspektor"; 33-1091 "Sicherheitspersonalmanager" → "Einsatzleiter Sicherheitsdienst"; 33-9092 "Beamter der Küstenwache" → "Rettungsschwimmer"; 33-9094 "Schulbusbegleiter" (nur maskulin) → "Schulbusbegleiter/Schulbusbegleiterin".

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Audit findings persisted | — | **402 flagged of 923 (43.6 %)** |
| Cluster-(A)-style overrides applied on build | 190 | **215** (+10 batch 1 net, +16 batch 2 net, –1 seed pull-out) |
| Codes in seed block | 122 | 121 (–1 batch 1, 0 batch 2) |
| Title overrides total | ~50 | ~66 (+5 batch 1, +11 batch 2) |
| Tests passing | 243 | 243 (data-only changes, no scoring touched) |

**Branches:** `fix/audit-batch-1-soc21-45` (2 commits → PR merged), `fix/audit-batch-2-soc31-33` (commits → PR opened, this docs commit rides with it).

**Open for next sessions (tracked in BACKLOG):**
- **Audit batches 3-N — ~370 findings remaining.** Continuing 2 SOC groups per section, 2 sections per session. Next pairs: 23 (1) + 37 (4) for trivial cleanup, then 35 (6) + 41 (9) or 39 (14) + 41 (9). Remaining big groups (29 Healthcare 43, 51 Production 43, 53 Transport 34, 47 Construction 31, 19 Sciences 27) want larger session-budgets each. Estimated 5-7 more sessions to complete the audit.
- **Anf-tier consistency for 33-1011 + 33-1012.** Batch 2 left both at Anf 4 (per agent's non-flag) while 33-1021 was re-tiered to Anf 3. Structurally all three First-Line Supervisor roles map to gehobener Dienst (Anf 3) in DE. Worth revisiting in a small follow-up if browser-test surfaces the inconsistency.
- **Politessen + Animal Control KldB classes.** Both deferred this session as KldB-class gaps. If a kommunale-Ordnungsamt or Tierschutz-Inspektion class surfaces in later audit batches, retrofit.
- **BigFive coverage gap fix** — still on hold, foundation now significantly more solid for sibling-imputation later.

---

### Session 35 – 2026-04-25
**Focus:** End-to-end scoring validation with 13 archetype personas across all 4 layers, surfacing one calibration finding (values layer too linear → quadratic extremity multiplier on per-dim penalty) and one data finding (BigFive coverage gap on ~141/923 occupations). Single PR on `feat/archetype-personas-and-values-strength`. Fifth session this calendar day.

**Meta / process notes:**
- **Persona design preceded test code, by request.** @mo-sp asked to see the persona profiles and expected outcomes *before* any test code was written, on the basis that a Vitest suite calibrated against bad personas only validates that the matcher behaves consistently — not that the personas themselves represent reasonable archetypes. Walked profiles + expected family bounds inline; @mo-sp redirected one parameter (negative-assertion ranks from >30 to >50, since 923 occupations make >30 too lenient) and approved. The pre-review caught an assumption gap that would have been a 16-test rewrite if surfaced post-hoc.
- **Five test failures on first run, all test-side, no weights touched.** Initial run had P7 SwDev rank 39 (persona R=4 too high — canonical SwDev sits at R=3), P10 outdoor 3/10 in expected families (values too weak), P11 1/10 in indoor families (persona I=4 too high — pulled Computer/Math instead of Library/Office), P12 skillsBonus null (data gap, not bug — some occupations lack skills entirely), P13 5/10 in engineering (BigFive coverage gap). All five fixed by persona-tuning or assertion-bound adjustment, no scoring weights changed yet.
- **The archetype-vs-tuning question got answered by the data.** With all five tests green @mo-sp asked: should `VALUES_CONTRIBUTION_CENTRE` be lowered to 0.08 for stronger values impact? Walked through the math: CENTRE shifts the bonus/penalty axis (lower CENTRE = harsher penalty + smaller reward, asymmetric strengthening but same total span); **`VALUES_DIMENSION_WEIGHT`** is the actual amplitude knob (currently 0.05 × 7 dims = 0.35 max swing). @mo-sp then proposed a non-linear shape: extreme answers (1 or 5) should be Mitbestimmer, mid-range (2/3/4) should stay soft. Implemented as quadratic strength multiplier `1 + ((v−3)/2)² × β` with β=1.5, gives ×1.0 / ×1.375 / ×2.5 for egal / eher / ganz answers — landed on β=1.5 as the balance point where extreme answers act as Mitbestimmer alongside Skills/BigFive (each ±0.25-0.30 swing) without becoming a Veto.
- **Median user invariance preserved by construction.** All-3s user has strength = 1.0 on every dim by definition, so P12's top-10 was byte-identically unchanged before and after the multiplier. Spot-checked in dump output and codified in the suite via `|skillsBonus| < 0.05` / `|valuesContribution| < 0.10` per-result assertions on P12.
- **Three test-side adjustments after the matcher change.** `matcher.test.ts` "max mismatch" range expanded from [≥−0.30] to [≥−0.60] (max penalty grows from ≈0.35 to ≈0.875 in worst case under quadratic strength). "Perfectly matching" test renamed to "closely matching" with bound `>0.02` instead of `>0.05` (residual mismatch on extreme dims now amplified ×2.5, so a near-perfect match no longer rounds to +0.08). `archetype-personas.test.ts` P13 spot-check expanded from top-5 to top-7 (engineering 17-2031 + 17-2112.01 sit at ranks 6/7 once quadratic shifts applied-quant 13-2099.01 and pure-math 15-2021 above them).
- **BigFive coverage gap surfaced as a real data finding, not a calibration miss.** P13 (low-O Investigator) top-3 came back as Astronom 19-2011, Quant Finanz 13-2099.01, Anthropologe 19-3091. Investigation: 141/923 occupations have no BigFive profile in `bigfive-occupation-profiles.json`, so they escape the BigFive modifier entirely (`bigFiveModifier = null`). For a low-O user that means undocumented research-flavoured roles get a free pass against the low-O penalty while their bf-present siblings get correctly penalised. Mostly affects specialty/sub-codes (.01-.99 suffixes). Logged to BACKLOG with three fix options.
- **Negative-assertion fortuitously already passes.** P10 (outdoor extreme) Bibliothekar test asserts not in top-50 — passes, but mostly because Bibliothekar's R is too low to compete on RIASEC alone, not because values penalises it. P11 same story for Naturschutz/Hochbauhelfer. Adding the "P10 vs indoor-twin reranks ≥5/30" differential test makes the values-layer-impact check explicit instead of incidental.

**What shipped — `feat/archetype-personas-and-values-strength` (1 PR, 4 commits):**

*`src/features/matching/lib/matcher.ts`*: new `VALUES_STRENGTH_BETA = 1.5` constant + `valuesStrength(v)` helper. `computeValuesPenalty` multiplies each dim's penalty by `valuesStrength(userValues[dim])`. CENTRE doc updated to reflect new range [≈−0.55, +0.10] for extreme users.

*`src/features/matching/lib/matcher.test.ts`*: two range-bound tests adjusted for the new max-penalty span ("perfectly matching" → "closely matching", "−0.25 max" → "−0.50 max").

*`src/features/matching/lib/archetype-personas.test.ts` (NEW)*: 409-line suite. 13 personas, 16 tests across 5 describe blocks (RIASEC dominants, mixed Holland codes, values-conflict + differential, median user, BigFive differentiator + differential). Direct profile injection (RIASEC / BigFive / Values) since Pearson is scale-invariant; Skills uses uniform base 3 + selective per-element overrides for archetype signature competencies. Occupations get the same `kldb-occupation-mapping.json` overlay the questionnaire store applies at runtime, so `anforderungsniveau` populates and the education hard-filter activates correctly.

*`BACKLOG.md`*: retired the "End-to-end scoring validation with archetype-personas" Up-next entry (shipped this session). Added new Up-next entry for the BigFive coverage gap (~141/923 occupations missing) with three concrete fix options.

**Coverage after the session:**

| | Before | After |
|---|---|---|
| Tests passing | 227 | **243** (+16 archetype tests) |
| Test files | 13 | 14 |
| Values layer max swing (extreme user) | ±0.25 / +0.10 | **±0.55 / +0.10** |
| Median user values impact | ±0.10 | unchanged (×1.0) |
| Documented BigFive coverage gap | implicit | explicit BACKLOG entry |

**Branch:** `feat/archetype-personas-and-values-strength` (3 code commits + 1 docs commit → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **BigFive coverage gap fix** — pick (a) per-ISCO mean imputation, (b) explicit small penalty for missing data, or (c) accept and document. Affects specialty/sub-codes mostly.
- **Concrete examples on every question** — own session, ~238 examples across all four layers.
- **45-3031.00 + Förster fixes** — small dedicated PR, single-file overrides.

---

### Session 34 – 2026-04-25
**Focus:** Friends-release prep — three independent UX/scoring fixes (skills neutral stage, restart granularity, values symmetrize), one viral hook (Top-20 copy-to-clipboard), one stray search-input bug, plus a BACKLOG-spring-cleaning. Two PRs on `feat/friends-release-ux-batch` and `feat/top-20-share-and-backlog-admin`. Fourth session this calendar day.

**Meta / process notes:**
- **BACKLOG read drove session scope; @mo-sp's Friends-test framing pruned aggressively.** Started by walking BACKLOG against "what's blocking the friends-release smoke test." Of ~25 entries surfaced, four made the cut: skills stage copy bug, top-20 share, values penalty-only asymmetry, and a new restart-granularity finding @mo-sp surfaced mid-session ("nur diesen teil neu" inside Skills sub-categories). Archetype-persona calibration + the 238-item concrete-examples pass got explicitly deferred to dedicated sessions; Farm-Labor-Contractors got a one-line title.de override instead of the planned filter mechanism (no other null-titled customer remained). Fewer entries shipped than considered; the framing kept us from drifting into "while we're here" cleanup.
- **Three iterative browser-test rounds for the values rebalancing.** Initial implementation used `centre = 0.175 = max_penalty/2` as the symmetric mathematical midpoint. Browser-test caught the calibration miss: with @mo-sp's "outdoor=5, others=3" profile, even Bibliothekar (indoor + high-routine job) showed +0.06 contribution. Math: 7-dim penalty for that mix is ≈0.115 — only environment + routine cleanly mismatch, the other 5 mid-mid dims contribute ~0; 0.175 minus 0.115 = +0.06 positive bonus on a clearly-wrong job. Root cause: real workContext-penalties cluster around 0.04–0.15, never the full [0, 0.35] range, so the mathematical midpoint sat above almost every empirical penalty. Lowered centre to 0.10 (closer to empirical median) — Bibliothekar now correctly reads −0.02; range becomes asymmetric [−0.25, +0.10] which fits the asymmetry of real-life workContext mismatch (penalty bites harder than match rewards). Provisional pending the archetype-persona session.
- **Restart redesign rolled back after one browser test cycle.** First-pass UX added two buttons across all layers: "Nur diesen Teil neu" + "Alles neu" (with confirm). @mo-sp pushed back: layer-wide reset is one click from /home, the second button is over-invasive. Scoped down — "Nur diesen Teil neu" is now Skills-layer-only and resets just the current sub-category (Skills / Talente / Wissen) via the existing `repeatSkillsSubCategory(skillsCurrentSubCategory)` action; the others keep their original single button labelled "Schicht neu starten". Pattern: "what does this button do that the existing path doesn't already" is the question that kept asking itself.
- **Values field rename `valuesPenalty` → `valuesContribution` was safe.** Concern was Dexie persistence — does an existing user's stored session still have the old field name? Verification: results are computed fresh on each load from raw answers, never persisted with field-named keys; Dexie holds questionnaire answers, not pre-computed match objects. So the rename touched matcher.ts, types.ts, ResultsPage.vue, three test files, and one test fixture — but not migration code. Saved an afternoon of "do we need a Dexie migration".
- **Two specific data findings parked for later, not silently absorbed.** During values verification @mo-sp surfaced "Berufsfischer und -jäger" (45-3031.00) as awkwardly compounded and "Förster" search returning zero matches. The Förster lookup turned up a likely Range-Managers-mis-mapping (Range Managers should not be labelled "Forstwirt"). Both got dedicated BACKLOG entries with reproduction context and proposed fix paths instead of getting bundled into this PR — they're real but not friends-release-blockers.

**What shipped — `feat/friends-release-ux-batch` (1 PR, 6 commits):**

*`src/pages/results/ResultsPage.vue` + `src/shared/lib/i18n.ts`*: skills stage gains a `'neutral'` band for `|bonus| < 0.005`; new copy "Fähigkeiten im Mittel – kein Einfluss auf den Score." Median user no longer reads "Solide Überschneidung" on a 0.00 value.

*`src/pages/assessment/AssessmentPage.vue`*: in Skills layer, adds "Nur diesen Teil neu" button (Sub-Cat reset) alongside the original "Schicht neu starten" (full-layer reset). Other layers keep their single button.

*`src/features/matching/lib/matcher.ts` + `src/entities/occupation/model/types.ts` + `src/pages/results/ResultsPage.vue` + `src/shared/lib/i18n.ts` + 3 test files*: values layer symmetrized. Field renamed `valuesPenalty` → `valuesContribution`. New constant `VALUES_CONTRIBUTION_CENTRE = 0.10` (browser-test calibrated, not the original 0.175). `fitScore += contribution` instead of `−= penalty`. `stageForValues` re-tuned for the new asymmetric range [−0.25, +0.10] with neutral band. i18n thresholds rewritten to match symmetric semantics.

**What shipped — `feat/top-20-share-and-backlog-admin` (1 PR, 5 commits):**

*`src/pages/results/ResultsPage.vue`*: results-search input switched from `type="search"` to `type="text"` — the native browser × clear-button was rendering alongside the page's custom × overlay. Side-by-side double clear-buttons.

*`src/pages/results/ResultsPage.vue`*: "Top-20 zum Teilen kopieren" button above the ranked list. Output is plain Markdown (title + score% + landing URL footer). Hidden during active search. `navigator.clipboard.writeText` with legacy `textarea + execCommand('copy')` fallback so the LAN HTTP dev sandbox works too. Brief inline "Kopiert!" feedback for 2 s, no toast layer. Image-download deliberately deferred — Markdown copy covers the messenger-share use case, the PNG variant adds a dependency for what is also browser-screenshottable.

*`scripts/input/title-overrides-de.mjs` + `src/data/onet-occupations.json`*: 13-1074.00 Farm Labor Contractors gets a one-line nearest-DE title ("Saisonkräfte-Vermittler Landwirtschaft / Saisonkräfte-Vermittlerin Landwirtschaft") instead of remaining null.

*`BACKLOG.md` housekeeping*: Five entries retired as shipped or verified-already-shipped (Skills stage vs value inconsistency, Contribution badge colour thresholds, Values layer penalty-only, Top-20-Ergebnis teilen, DE-Occupation filter mechanism). One entry (C-dimension clerical-heavy) rewritten to reflect Session 33's progress — c-02/c-08/c-10 already broadened the way that entry originally proposed; remaining gap is dev-flavoured C (rule-bound work, structured documentation, QC). DE-Title quality pass 2 entry edited to mention Farm-Labor-ad-hoc-fill. Two new entries added: 45-3031.00 Berufsfischer-und-Jäger DE-title rephrasing, and Förster-search-misses (with the Range-Managers-mis-mapping diagnostic).

**Branches:** `feat/friends-release-ux-batch` (4 commits → PR shipped), `feat/top-20-share-and-backlog-admin` (5 commits → PR + this docs commit).

**Open for next sessions (tracked in BACKLOG):**
- **Archetype-persona scoring validation** — the Up-next entry. After it: justify or re-tune `VALUES_CONTRIBUTION_CENTRE = 0.10`, decide whether C-dimension still needs more dev-flavoured items, validate the full 4-layer stack against archetype profiles.
- **Concrete examples on every question** — own session, ~238 examples across all four layers.
- **45-3031.00 + Förster fixes** — small dedicated PR, single-file overrides.

---

### Session 33 – 2026-04-25
**Focus:** O*NET Interest Profiler modernization sweep — 13 RIASEC items touched across three browser-test-driven rounds on the same branch. One PR on `feat/onet-items-modernization-2026` with 3 data commits (SUMMARY here rides as the 4th). Third session this calendar day; same-day chain after Sessions 31/32.

**Meta / process notes:**
- **"Just pull from the Long Form" turned out to be a dead end.** @mo-sp opened with the premise that the O*NET IP Long Form (180 items) might contain more modern content we could re-select the best 60 from. Web-search corrected upfront: the Long Form was retired September 2018, AND — more importantly — both forms were authored in 1999, so the 180 items are just three times as many 1999-era items, no modern content hiding there. Re-selecting would also break the Rounds-et-al-2010 psychometric validation of the Short Form (multidimensional scaling + content-coverage judging produced the current 60). Redirected to "keep the 60-item structure, swap the stalest items per dimension for contemporary ones."
- **Three-pass iterative refinement driven by browser test.** Commit 1 shipped 9 items from desk analysis. Browser-walk surfaced 3 more problematic items (R-03 "Waschmaschinen/Kühlschränke" datedness, C-02 "Dokumente Korrektur lesen" same, 2× "Geschäft leiten" duplication in E after the E-02 reword) → commit 2 with 4 more changes. Then @mo-sp reframed the E-02/E-05 trade: keep "gründen" somewhere in E, push it from E-05 to E-02 as e-commerce-flavored entrepreneurship, free up E-05 to carry Negotiation → commit 3 for the E-02 swap. Browser-test was the right gate: each pass surfaced things desk analysis missed, including the "leiten" count which only becomes visible when you see all E-items in a row.
- **Explicit dimension-drift audit on request before PR.** @mo-sp asked to double-check that every modified item still targets its intended RIASEC dimension. Walked all 47 modified items (EN original vs current DE) — no dimension drift identified, but three nuances surfaced for transparency: R-10 "rescue people" has mild S-tint but stays O*NET-consistent (firefighter = R), I-08 "Data Science" walks the I/C boundary — kept safely at I via "patterns **find**" wording (hypothesis formation = I; "manage data structured" would have been C), A-07 Podcast is the biggest sub-theme jump from EN "Write scripts" (both clearly A, deliberate audio-gap fill since A was 7/10 visual pre-sweep).
- **Attribution counts tracked through iterations.** Header started at "15 replaced / 19 reworded" from prior sessions. Each commit moved the counter (commit 1: 21/22; commit 2: 22/25; commit 3: 23/24 after E-02 reclassified from reword to replace). Final: 23 replaced + 24 reworded of 60 = 78% modified. Six-dimensional structure and 10-items-per-dimension balance unchanged — scoring pipeline untouched, no code changes needed.

**What shipped — `feat/onet-items-modernization-2026` (1 PR):**

*`src/data/onet-items.json`* — 13 items modified across 3 commits:

*Commit 1 — primary modernization sweep (9 items):* R-02 "Ziegel/Fliesen" → "Auf einer Baustelle arbeiten"; R-05 "Elektronische Bauteile montieren" → "Computer-Hardware zusammenbauen und reparieren"; I-08 "Biologielabor" → "Mit statistischen Methoden Muster in großen Datensätzen finden" (Data Science); A-04 "Mit Stift/Pinsel zeichnen" → "Eigene Bilder zeichnen" (generalize, covers digital + analog, removes overlap with A-07); A-07 "Tattoos/Illustrationen" → "Podcasts oder Hörspiele aufnehmen und produzieren" (audio-gap fill); A-10 "Filme schneiden" → "Videos für YouTube/Streaming-Plattformen schneiden und veröffentlichen"; E-02 "Einzelhandelsgeschäft leiten" → "Einzelhandelsgeschäft oder Online-Shop leiten" (reworded, later replaced in commit 3); C-08 "Mietzahlungen erfassen" → "Datenschutz-Vorgaben prüfen und in Checklisten dokumentieren" (GDPR/Compliance); C-10 "Post sortieren und weiterleiten" → "Rechnungen und Belege in Buchhaltungssoftware prüfen und verbuchen".

*Commit 2 — browser-test follow-ups (4 items):* R-03 "Waschmaschinen/Kühlschränke" → "Kaputte Alltagsgeräte reparieren und wieder in Gang bringen" (right-to-repair framing); C-02 "Dokumente/Formulare Korrektur lesen" → "Verträge und Dokumente sorgfältig auf Fehler prüfen"; E-04 "Abteilung leiten" → "Ein Team führen und bei schwierigen Entscheidungen vorangehen"; E-05 "Eigenes Unternehmen gründen" → "Verhandlungen mit Geschäftspartnern führen und Verträge abschließen" (reinstates Negotiation core that was displaced in an earlier session by E-06 Politik replacement).

*Commit 3 — E-Entrepreneurship shuffle (1 item):* E-02 reclassified from reword to replace: "Einzelhandelsgeschäft oder Online-Shop leiten" → "Einen Onlineshop gründen" (reinstates Entrepreneurship in E-02 while E-05 carries Negotiation; reduces "leiten" duplication count in E from 3 to 1).

*Attribution block updated each commit.* Final rationale list: e-commerce, data science, energy transition, audio/video content creation, negotiation, team leadership, data protection. English item text untouched throughout — only the DE text was modified.

**Branch:** `feat/onet-items-modernization-2026` (3 data commits + 1 docs commit → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **Option 2 from initial triage — parallel "Modern interests" layer** next to RIASEC feeding occupation matching without touching the validated score. Parked this session; worth revisiting once item-text modernization feels exhausted.

---

### Session 32 – 2026-04-25
**Focus:** Cluster-A batch 5 — what started as 2 codes from Session 21's BACKLOG entry grew via mid-session browser-test sweeps into a 16-code drift cleanup. One PR on `fix/cluster-a-batch-5-agrar-and-naturschutz` with 3 commits (data + expansion + docs). Second session this calendar day; same-day chain after Session 31.

**Meta / process notes:**
- **Batch grew through three browser-test sweeps mid-session.** Session start scope was 2 codes (17-2021.00 Agraringenieur + 19-1031.03 Naturschutz-Wissenschaftler from BACKLOG's "non-medical edition" entry). After commit 1, @mo-sp surfaced 2 more on review (19-4012.00 Agrartechniker title + 19-4099.01 Quality Control Analysts). After commit 2, three more browser-walks added 14 codes covering everything from Verdichter-Operator-Gas to Boilermakers. Total: 16 codes. The growth was driven by the user actively browsing the data with the new patterns now visible — once "Sachverständige" stopped pulling 4 codes into Landwirtschaft, the next-worst tiebreaker victims became more obvious. Pattern: when a fix removes one tiebreaker-pollution pattern, expect the next-worst pattern to surface in the same browse session.
- **All 14 round-3 targets verified against EN SOC descriptions before edit.** @mo-sp asked for explicit cross-check ("kannst du mit den englischen beschreibungen nochmal gegenprüfen dass wir überall korrekt sind?"). Walked each proposed KldB through the SOC description; surfaced two semantic compromises (94724 Kunstsachverständige doesn't perfectly cover "equipment" appraisal at 13-2022.00 but it's the best single class; 81342 Rettungsdienst captures the dominant DE Notruf-Disponent path even though SOC includes police/fire dispatch) and one decision point (29-1171.00 Pflegeexperte / Nurse Practitioners — APN's "graduate education" SOC-criterion conflicts with KldB's only Pflege studies-tier class being 81394 "Führungskräfte"). Cross-checking before edit would have caught a different bug than catalog-lookup-before-proposing — they're complementary checks.
- **kldbName: null pattern used for the first time as a deliberate suppression.** 29-1171.00 Pflegeexperte got `kldbCode: "81394", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies"` — the code anchors it semantically in Pflege studies-tier (Master Pflegewissenschaft), but the "Führungskräfte Pflege" subtitle would mislead since APN isn't primarily a leadership role. The Anf-Pill stays "Studium/Weiterbildung" (matches APN's graduate-education requirement), the wrong subtitle disappears. Same mechanism the seed block already uses for 11-9199.09/.10 Windpark-Leiter (kldbCode: 61394, kldbName: null) but newly applied as an active design choice rather than as legacy drift.
- **Two seed-block entries pulled out (continuing the Session-27 pattern).** 53-7071.00 (was Straßenverkehr — clearly Drift, gas compressor station has nothing to do with traffic) and 43-6014.00 (was Hotelkaufleute — same Hotel-as-default-bucket pattern that 43-4171.00 Receptionists also fell into). Seed block now at 122 entries (was originally 131; –1 in Session 27, –6 in Session 31, –2 here). The "Audit the seed entries" BACKLOG item is implicitly working off whenever browser-test surfaces drift candidates that turn out to live in the seed block.
- **Duplicate-key catch saved a regression.** The lint step caught a duplicate `'53-7071.00'` key in `title-overrides-de.mjs` — the existing override at line 495 (from a "Steuerer von Gasanlagen" cluster) was still intact when I added a new one in the batch-5 block. eslint-no-dupe-keys flagged it; consolidated into the existing entry (updated value, kept location). Without the lint check this would have shipped silently with whichever-was-last winning, depending on JS object-literal evaluation order.
- **Color/threshold BACKLOG item retired as already-shipped.** @mo-sp asked whether the Big-Five/Values badge color-threshold bug (signed values rendering grey instead of red/green) was still open. Verification by grep: ResultsPage.vue:442 `toneForSignedValue` (sign-based: positive→green, negative→red, near-zero→grey) is now used at line 489 with `signedValue` derived from `bigFiveModifier` (signed) and `-valuesPenalty` (negated for sign-consistency). Bug fixed via prior PR. Updated reading-from-memory: a recent BACKLOG bullet may still describe an old state — verify the code, not the bullet.

**What shipped — `fix/cluster-a-batch-5-agrar-and-naturschutz` (1 PR, 3 data commits + 1 docs):**

*Commit 1 — initial 2-code batch:* 17-2021.00 Agraringenieur → 11104 Landwirtschaft ohne Spez. hoch komplex (was Papierverarbeitung); 19-1031.03 Naturschutz-Wissenschaftler → 41234 Biologie (Ökologie) hoch komplex (was Reiseleiter, seed-pinned drift, Anf 3 → 4).

*Commit 2 — review-time follow-ups:* 19-4012.00 Agrartechniker title → "Landwirtschaftlich-technischer Assistent / -in" (KldB 11132 stays correct, just title was misleading); 19-4099.01 Quality Control Analysts → 27312 technische Qualitätssicherung fachlich (was technische F&E sonstige spezifische) + title "Schuhwarenqualitätskontrolle" → "Qualitätsprüfer".

*Commit 3 — batch-5 expansion (14 codes):* 11-3051.01 Quality Control Systems Managers → 27314 technische QS hoch komplex (was Landtechnik, Anf 3 → 4) + "Qualitätsmanager"; 15-1253.00 Software QA Analysts → 43413 Softwareentwicklung komplex (was IT-Koordination) + "Softwaretester"; 13-2022.00 Sachwertspezialist → 94724 Kunstsachverständige hoch komplex (was Landwirtschaft, Anf 3 → 4); 53-7071.00 Verdichter-Operator → 26232 Energie-/Kraftwerkstechnik fachlich (was Straßenverkehr seed) + "Anlagenfahrer Gasversorgung"; 31-9094.00 medizinische Schreibkraft title-only Capitalize-Fix (KldB 73222 stays); 43-5061.00 Einkaufsdisponent → 71302 kaufm./tech. Betriebswirtschaft fachlich (was Hotelkaufleute); 29-1171.00 Pflegeexperte → 81394 Pflege studies (kldbName: null, was 81404 Ärzte — APN ist Pflege-Domain, not medicine); 29-1141.03 Critical Care Nurses → 81313 Fachkrankenpflege komplex (was Aufsichtskräfte) + "Fachkrankenpfleger Intensivpflege / -in"; 19-3022.00 Survey Researchers → 91344 Markt-/Meinungsforschung hoch komplex (was Mathematik) + "Marktforscher"; 43-6014.00 Sekretär → 71402 Büro/Sekretariat fachlich (was Hotelkaufleute seed); 43-4171.00 Receptionists → 71452 Auskunft/Kundeninformation fachlich (was Hotelservice) + "Empfangsmitarbeiter"; 13-1199.04 Business Continuity → 71314 Unternehmensorganisation/-planung hoch komplex (was IT-Koordination, Anf 3 → 4) + "Business Continuity Manager"; 29-2035.00 MRT → 81233 Radiologie komplex (was Ergotherapie); 43-5031.00 Public Safety Telecommunicators → 81342 Rettungsdienst fachlich (was Büro-Helfer Anf 1 → 2) + "Disponent Notrufleitstelle"; 17-2141.02 Automobilingenieur → 25214 Kfz-Technik hoch komplex (was Papierverarbeitung); 47-2011.00 Boilermakers → 34342 Anlagen-, Behälter- und Apparatebau fachlich (was Klempnerei — KldB-Klassen-Name matched title.de 1:1).

*`src/data/onet-occupations.json`*: 11 parallel `title.de` patches for build idempotency.

*`src/data/kldb-occupation-mapping.json`*: regenerated. Build-script log: `manual overrides applied: 190` (= prior 175 − 2 from seed + 17 added). Idempotent on rebuild.

*`BACKLOG.md` housekeeping*: retired "KldB subtitle drift — non-medical edition" entry (all 3 listed cases handled — Bioingenieur in Session 24, Agraringenieur + Naturschutz in this session).

**Coverage after the session:**

| | Before session 32 | After |
|---|---|---|
| Cluster-(A) container-abuse overrides | 40 | 56 (+16 batch 5) |
| Codes in seed block | 124 | 122 (–2 pulled into batch 5) |
| Overrides applied on build | 175 | 190 |
| Tests passing | 227 | 227 |

**Branch:** `fix/cluster-a-batch-5-agrar-and-naturschutz` (3 data commits + 1 docs commit → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **Systemic per-ISCO fallback in `build-kldb-mapping.mjs`** — would retire the manual-override pattern for the medical-/non-medical-specialty cases. Carries more weight now: 56 cluster-A overrides + the 7 tiebreaker-regression pins represent recurring drift that a build-time mechanism could absorb.
- **DE-Occupation filter mechanism** — execute with 13-1074.00 Farm Labor Contractors as first customer.
- **Cluster-C tail** — opportunistic sampling below the filter threshold + the deferred -arbeiter/-bediensteter borderlines.
- **Seed overrides audit** (122 remaining, low priority hygiene).

---

### Session 31 – 2026-04-25
**Focus:** Cluster-A batch 4 — five tiebreaker victims surfaced by Session-30's browser test, bundled with six medical-specialty fallback corrections that share the same root cause. One PR on `fix/cluster-a-batch-4-and-medical-fallbacks` carrying 11 KldB remaps and one coupled `title.de` fix.

**Meta / process notes:**
- **Bundled cluster-A with the medical-specialty cleanup once the pattern surfaced.** @mo-sp's session-start dump was Cluster-A batch 4 (the 5 codes with Sachverständige/Detektive/Wirtschaftsförderung mismatches). Mid-research a second observation came in: 29-1242.00 Orthopäde was wrongly routed to 81414 Kinder- und Jugendmedizin — the textbook "specialty without a 5d class" case from the medical-subtitle BACKLOG entry. Catalog lookup against `kldb-data.json` showed five neighbouring entries in the seed block (29-1214 Notfallmediziner, 29-1217 Neurologie, 29-1218 Frauenarzt, 29-1223 Psychiater, 29-1229.03 Urologe) had the same wrong target. Same root cause as Pathologie/Allergologie which were already correctly seeded at 81404 — the remaining six were just untreated drift. @mo-sp green-lit the bundle ("ja mach gerne alles!") so all 11 entries shipped in one batch-4 block. Splitting cluster-A from medical-specialty into separate PRs would have been pure thematic taxonomy with no real downside avoided.
- **Two intersection-call decisions surfaced upfront for review.** BACKLOG entry pre-flagged 13-1032.00 Kfz-Schadensgutachter as "intersection call" (25213 Kfz-Technik vs. 72133 Versicherungskaufleute). Recommendation made before editing: 25213 because the German Kfz-Sachverständiger profile is technically anchored (Kfz-Meister + Sachverständige-Bestellung), not insurance-clerk; 13-1031.00 Schadensregulierer already sits at 72133 fachlich, so a different class for the technical-spike role is defensible. @mo-sp approved without redirect. The other two pre-flagged options (13-1041.04 Government Property Inspectors and 13-2023.00 Real Estate Appraisers) both went to 31163 Bausachverständige rather than the alternates (73203 öffentliche Verwaltung / 61313 Immobilienvermarktung) because Bausachverständige captures the actual *Tätigkeit* (Bewertung/Inspektion physischer Immobilien); öffentliche Verwaltung is administrative not domain-expert, and Immobilienvermarktung is sales not appraisal. Pattern: when BACKLOG flags an intersection call, surface the recommendation + reasoning *before* the edit, not after.
- **Anf-Bump 2 → 3 for 33-3021.00 Kommissar Kriminalpolizei.** Currently pinned to 53152 Privatdetektive at Anf 2 / `apprenticeship`. Kommissar = gehobener Polizeidienst, Bachelor-level entry — the right tier is Anf 3 / `specialist`. The override entry adjusts both `anforderungsniveau` and `trainingCategory`. SOC-sibling 33-3021.02 already sits in 53222 Kriminaldienst fachlich (Anf 2), so the Kriminaldienst-class hierarchy is wired and the .00 sliding into 53223 (Anf 3) follows that pattern.
- **Catalog-lookup pattern remained load-bearing.** Each of the 11 targets (25213, 31163, 53223, 81404, 81464) verified against `scripts/input/kldb-data.json` for existence + Anf-tier match before proposing. 31163 Bausachverständige + 53223 Kriminaldienst + 81464 Neurologie/Psychiatrie all exist at the expected tier with clean names. The compounding feedback memory ("look up the canonical catalog before proposing codes") earned its keep again — none of these target classes are visible by grepping the current mapping output (no O*NET code currently maps to 31163 or 53223), they only exist in the catalog.
- **Seed-block hygiene continued.** Six entries moved out of the seed block into the dedicated batch-4 block, following the Session-27 Beleuchtungstechniker pattern (entries that were not intentional manual fixes but accumulated drift get re-homed). Seed block is now 124 entries (was originally 131; –1 in Session 27, –6 here). The "Audit the 131 seed entries" BACKLOG item gets implicitly worked off whenever a batch like this surfaces drift candidates. 29-1222 Pathologie + 29-1229.01 Allergologie stayed in the seed block — they were already correct and represented intentional Session-19 fixes, not drift.
- **Coupled title fix for 33-3021.06 followed the established pattern.** ESCO-raw was "Mitarbeiter im Bereich Informationsgewinnung" — administrative euphemism that doesn't surface in DE search. New title "Kriminalanalyst/Kriminalanalystin" is the etablierter BKA-/LKA-Begriff and matches the new 53223 Kriminaldienst container. Override entry in `title-overrides-de.mjs` + parallel patch to `onet-occupations.json` for build idempotency (same coupling pattern as Session 27 Parking Enforcement Workers, Session 29 batch-3 primary-null fills, Session 30 cluster-C batch 1).

**What shipped — `fix/cluster-a-batch-4-and-medical-fallbacks` (1 PR):**

*`scripts/input/kldb-overrides.mjs`*:
- Removed 6 entries from the seed block: 29-1214.00, 29-1217.00, 29-1218.00, 29-1223.00, 29-1229.03, 29-1242.00 (all wrongly pinned to 81414 Kinder- und Jugendmedizin).
- Added new "Container-abuse overrides — batch 4" block at tail with 11 entries:
  - **Cluster-A tiebreaker victims (5):** 13-1032.00 Kfz-Schadensgutachter → 25213 Kfz-Technik komplex, 13-1041.04 Inspekteur öffentliches Eigentum → 31163 Bausachverständige komplex, 13-2023.00 Immobiliengutachter → 31163 Bausachverständige komplex, 33-3021.00 Kommissar Kriminalpolizei → 53223 Kriminaldienst komplex (Anf 2 → 3), 33-3021.06 Kriminalanalyst → 53223 Kriminaldienst komplex.
  - **Medical specialty fallbacks (6):** 29-1214.00 Notfallmediziner → 81404 Ärzte ohne Spez., 29-1217.00 Neurologie → 81464 Neurologie/Psychiatrie, 29-1218.00 Frauenarzt → 81404 Ärzte ohne Spez., 29-1223.00 Psychiater → 81464 Neurologie/Psychiatrie, 29-1229.03 Urologe → 81404 Ärzte ohne Spez., 29-1242.00 Orthopäde → 81404 Ärzte ohne Spez.

*`scripts/input/title-overrides-de.mjs`*:
- New "Cluster-A batch 4 — coupled title fix" block: 33-3021.06 → "Kriminalanalyst/Kriminalanalystin".

*`src/data/onet-occupations.json`*: 1 parallel `title.de` patch for 33-3021.06 (coupled for idempotency).

*`src/data/kldb-occupation-mapping.json`*: regenerated. 11 codes changed. Build-script log: `manual overrides applied: 175` (= prior 170 − 6 from seed + 11 in batch 4). Idempotent on rebuild (byte-identical second run).

*`BACKLOG.md` housekeeping*: retired the standalone Cluster-A "Kriminaldienst + 11123-Landwirtschaft tiebreaker victims" entry (shipped here); reframed the medical-subtitle entry to reflect the manual-override path Sessions 19/31 took (Pathologie, Allergologie, Notfallmedizin, Gynäkologie, Urologie, Orthopädie → 81404; Neurologie, Psychiatrie → 81464) and explicitly position the systematic per-ISCO fallback as the still-open systemic fix; added a small "physician-specialty fallback — opportunistic cleanup remaining" entry tracking the unflagged specialties (Kardiologie, Dermatologie, Radiologie, Sportmedizin, …).

**Coverage after the session:**

| | Before session 31 | After |
|---|---|---|
| Cluster-(A) container-abuse overrides | 35 (3 Session-24 families + 15 batch-1 + 11 batch-2 + 6 batch-3) | 40 (+ 5 batch-4 cluster-A) |
| Medical-specialty wrongly-routed-to-Kinder/Jugend | 6 | 0 |
| Seed-block entries pinned to wrong target | 6 | 0 (pulled out into batch 4) |
| Overrides applied on build | 170 | 175 |
| Tests passing | 227 | 227 |

**Branch:** `fix/cluster-a-batch-4-and-medical-fallbacks` (1 commit → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **DE-Occupation filter mechanism** — execute with 13-1074.00 Farm Labor Contractors as first customer.
- **Systemic per-ISCO fallback in `build-kldb-mapping.mjs`** — would retire the manual-override pattern for the medical-specialty case (and similar zero-stem-overlap families). Carries weight now that 8 medical specialties + ~15 non-medical drift cases are individually pinned.
- **Cluster-C tail** — opportunistic sampling below the filter threshold + the deferred -arbeiter/-bediensteter borderlines.
- **Seed overrides audit** (124 remaining, low priority hygiene).

---

### Session 30 – 2026-04-24
**Focus:** Cluster-C batch 1 — DE-title quality pass 2. One PR on `fix/cluster-c-title-pass-batch-1` bundling 26 primary-null fills and 24 ESCO-raw corrections into a single thematic unit. Fifth session this calendar day; same-day chain after Sessions 26/27/28/29.

**Meta / process notes:**
- **Heuristic filter concentrated 637 un-reviewed titles into 108 candidates.** Session 19's original DE-title pass only overrode codes sitting in a duplicate cluster; the remaining 637 ESCO-raw `title.de` values were never line-reviewed. @mo-sp had walked all of them manually across Sessions 26-28 and surfaced ~18 specifics, but a systematic filter made sense as a safety-net. Seven tests (anglicism leak, length >70, `-arbeiter` suffix, `-bediensteter` suffix, `Maschinenbediener für X`, `-schwenker`, `-abnehmer`) flagged 108 rows. ~41 of those became fixes this session (18 already-known + 23 newly-surfaced); the rest were legitimate long DE compound nouns (Ingenieur Luft- und Raumfahrttechnik, Medizinisch-technischer Laborassistent, …) or etablierte Anglizismen explicitly judged ok (Controller, Web-Designer, IT-Netzwerk-Administrator).
- **Several genuine data bugs surfaced only via the filter, not the browser.** Five real mapping errors that @mo-sp had missed during his manual walk: 49-3042.00 Mobile Heavy Equipment Mechanics titled "Berg- und Maschinenmann" (mining instead of construction equipment — wrong occupation entirely), 51-2031.00 Engine and Other Machine Assemblers titled "Fluggerätemechaniker für Gasturbinen-Triebwerke" (aircraft-specific instead of generic engine assembly — 49-3011.00 already holds aircraft mechanics), 51-4041.00 Machinists titled "Zerspanungsmechaniker im Getriebebau" (generic Machinists narrowed to gearbox specialty), 51-8013.00 Power Plant Operators titled "Steuerer von Geothermiekraftwerken" (generic operators narrowed to geothermal — 51-8013.03/.04 hold biomass and hydro, 11-3051.02 / 49-9099.01 hold geothermal specifics), 29-2052.00 Pharmacy Technicians grammar error (feminine adjective "-technische" on masc noun "Assistent"). Pattern: the filter's "long-title" signal plus catalog-lookup for domain check caught drift that eye-scrolling past 100+ titles had missed.
- **Collision-avoidance via catalog lookup on the proposed side too.** Two proposed replacements collided with existing overrides: "Diätassistent/Diätassistentin" for 29-1031.00 Dietitians was already held by 29-2051.00 Dietetic Technicians, and "Lehrkraft Sekundarstufe" for 25-2031.00 Secondary School Teachers collided with 25-2022.00 Middle School Teachers "Lehrkraft Sekundarstufe I". Remapped: 29-1031.00 → "Ernährungsberater/Ernährungsberaterin" (distinct from Diätassistent at the Assistenz tier), 25-2031.00 → "Lehrkraft Sekundarstufe II / Lehrerin Sekundarstufe II" (Grades 9-12 = Oberstufe, parallels 25-2022 Sek I cleanly). The "catalog-lookup before proposing" pattern from Session 27-29 now extends from "verify the target KldB exists" to "verify the proposed DE-title isn't already taken". Cheap — one node one-liner per candidate — avoided a duplicate-label regression.
- **APN / Pflegeexperte gloss survived a re-review.** @mo-sp asked what APN meant; the 29-1171.00 Nurse Practitioners override exists with an explicit rationale comment ("DE-Äquivalent ist Advanced Practice Nurse, aber der APN-Zusatz stiftet mehr Verwirrung als er nützt"). After explanation, kept as-is. A useful reminder that some earlier decisions were deliberate trade-offs, not drift to clean up.
- **Intentional null for Farm Labor Contractors.** 13-1074.00 was on the null-fill list but is genuinely US-taxonomy-specific (recruiting / housing / transporting migrant agricultural labor — no DE-market analog). Instead of inventing a label, left it null and added a BACKLOG entry for the planned DE-Occupation filter mechanism to pick it up. Concrete first customer for the filter moves that item from "idea" to "has a known first use".
- **Browser-test-surfaced Cluster-A findings deferred to follow-up.** @mo-sp's post-test browse found five additional codes routed into semantically-distant KldB classes by the stem-overlap tiebreaker: three codes with "Sachverständige" in their DE-title dumped into 11123 Landwirtschaftliche Sachverständige (13-1032.00 Auto Damage Appraisers, 13-1041.04 Government Property Inspectors, 13-2023.00 Real Estate Appraisers), plus 33-3021.00 Detectives in 53152 Privatdetektive (should be 53223 Kriminaldienst), plus 33-3021.06 Intelligence Analysts in 71333 Wirtschaftsförderung (should also be 53223 Kriminaldienst). Logged to BACKLOG as a concrete Cluster-A batch-4 candidate with target candidates pre-verified via catalog lookup. Deliberately out of scope for this PR — cluster-C and cluster-A shouldn't share a PR.

**What shipped — `fix/cluster-c-title-pass-batch-1` (1 PR):**

*`scripts/input/title-overrides-de.mjs`*:
- Modified 1 existing entry: 25-2031.00 "Lehrkraft Gymnasium und Realschule" → "Lehrkraft Sekundarstufe II / Lehrerin Sekundarstufe II".
- Added new "Cluster-C batch 1: primary-null fills" block with 26 entries (27 nulls minus Farm Labor Contractors): Postdirektor, Projektleiter Altlastensanierung, Einkäufer, Fachangestellter für Medien- und Informationsdienste (FaMI), Vermessungsingenieur Landesvermessung, Mediator, Haushalts- und Landwirtschaftsberater, Audio- und Videotechniker, MTRA Strahlentherapie, Patientenfürsprecher, Endoskopie-Fachassistent, Ladendetektiv, Servicekraft Gastronomie, Oberkellner, Teamleiter Dienstleistungsberufe, Sachbearbeiter Einkauf, Trockenbauspachtler, Energiesanierer, Installateur Audio- und Videotechnik, Servicetechniker Windenergie, Helfer Instandhaltung, Geothermie-Techniker, Anreißer Metall- und Kunststoffbearbeitung, Biokraftstoff-Verfahrenstechniker, Verkehrstechniker, Förderbandbediener.
- Added new "Cluster-C batch 1: ESCO-raw corrections" block with 23 entries: Risikoprüfer Versicherung (13-2053 was Underwriter), Risikoanalyst Finanzen (13-2054 was untranslated Anglicism), Quantitativer Finanzanalyst (13-2099.01 was "Investment Analyst" — wrong domain entirely), Bauzeichner (17-3011 was "CAD-Bediener"), Anthropologe und Archäologe (19-3091 added missing half), Bildungsreferent (25-9031 was "Instruktionsdesigner"), Casting Director w/ Fem-Form (27-2012.04), Kameramann/Kamerafrau (27-4031 was "Kameraschwenker"), Ernährungsberater (29-1031 was "Futtermittelwissenschaftler" — ESCO-side grossly wrong), PTA grammar fix (29-2052), Orthopädietechniker (29-2091 was veraltet "Orthopädist"), Fachkraft Blutentnahme (31-9097 was "Blutabnehmer"), Wertpapierhändler (41-3031 was "Warenmakler"), Postschalterangestellter (43-5051), Fachkraft für Lagerlogistik (43-5071), Land- und Baumaschinenmechatroniker (49-3042 was "Berg- und Maschinenmann"), Wartungsmonteur (49-9071 was "Gelegenheitsarbeiter"), Maschinen- und Motorenmonteur (51-2031), Maschinen- und Anlagenführer Metall-/Kunststofftechnik (51-4031), generic Zerspanungsmechaniker (51-4041), Formgießmaschinenführer typo-fix (51-4072), Modellmacher Bekleidung (51-6092 was Modelleur/Direktrice Stilbruch), Kraftwerker (51-8013).

*`src/data/onet-occupations.json`*: 50 parallel `title.de` patches (coupled for idempotency — same pattern as Sessions 27-29; future `build-esco-german.mjs` reads the override file and produces identical JSON state).

*`BACKLOG.md` housekeeping*: retired the standalone "Dietitians title.de is wrong" entry (fixed this session); consolidated the "DE-title quality pass 2" entry with Session-30 summary plus remaining tail (borderline -arbeiter/-bediensteter cluster, opportunistic sampling below the filter threshold); added concrete "DE-Occupation filter mechanism — execute" entry (with Farm Labor Contractors as first customer); added new Cluster-A entry for the Kriminaldienst + 11123-Landwirtschaft tiebreaker victims with pre-verified target candidates.

**Coverage after the session:**

| | Before session 30 | After |
|---|---|---|
| Codes with `title.de === null` | 27 | 1 (13-1074.00, intentionally — tagged for DE-Occupation filter) |
| Manual `title-overrides-de.mjs` entries | 259 | 308 |
| Session 26-28 browser flags handled | 18 / ~18 (with explicit stay-decisions for 5 BERUFENET-legit nischig terms) | all settled |
| ESCO-raw cluster-C fixes surfaced by filter | 0 | 9 newly added beyond Session 26-28 |
| Tests passing | 227 | 227 |

**Branch:** `fix/cluster-c-title-pass-batch-1` (1 commit → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **Cluster-A batch 4** — the 5 Kriminaldienst + 11123-Landwirtschaft tiebreaker victims surfaced this session (targets pre-verified; ~5-line override batch plus one coupled title fix).
- **DE-Occupation filter mechanism** — execute with 13-1074.00 Farm Labor Contractors as first customer. New `scripts/input/excluded-occupations.mjs` file + build-pipeline wiring.
- **Cluster-C tail** — opportunistic sampling below the filter threshold + the deferred -arbeiter/-bediensteter borderlines. Lower yield, handle when browser tests surface concrete complaints rather than as a dedicated pass.

---

### Session 29 – 2026-04-24
**Focus:** Two PRs, distinct work units bundled in one session. (1) UX polish from the BACKLOG: `/ergebnis` now scrolls to the just-finished layer instead of landing at top-of-page. (2) KldB overrides batch 3 — six container-abuse remaps paired with five `title.de` primary-null fills. Fourth session today; same-day chain after Sessions 26/27/28.

**Meta / process notes:**
- **Cluster-B turned out to be a misdiagnosis.** Session 26's browser test clustered ~8 classes as "category phrases that don't read as job titles" and flagged them as a render-time problem (strip prefix / rename / accept). A focused investigation this session (pull every occupation where `title.de` is null AND `kldbName` starts with a category prefix) surfaced only 9 actual cases — and of those 9, roughly half were Cluster-A (wrong KldB container) and the other half Cluster-C (missing DE title). **Zero of the 9 are true rendering problems.** Stripping the "Berufe in der X" prefix from subtitles was also briefly considered for the ~400 occupations where the subtitle (not the primary title) uses the phrase, but @mo-sp rejected it: the wrapper doesn't add information but also doesn't hurt, and stripping doesn't raise its value. BACKLOG Cluster-B entry retired with a note.
- **Bundled A+C for the 6 surfaced codes rather than splitting by cluster.** The Cluster-B investigation gave us 6 codes where both the KldB was wrong AND the `title.de` was null. Fixing only the KldB half (batch 3) without the title fills would have left the user seeing "Bauplanung und -überwachung (ohne Spezialisierung)" as the primary display for Civil Engineers — a less-wrong category phrase but still no actual job name. @mo-sp flagged this at the "soll ich KldB-Remap committen" review step: "sind die berufe auch schon auf deutsch hinzugefügt?" — correctly spotting that the KldB half alone is a half-measure on primary-null codes. Five `title.de` fills got coupled in; 17-2051.01 Transportation Engineers already had a title. Same coupling pattern as Session 27's Parking Enforcement Workers (`33-3041.00` KldB + `title.de` in one PR). Planned cluster-C sweep next session preserves its scope — the remaining ~13 Session-26/27/28 DE-title flags + the ~640 un-reviewed tail.
- **Catalog-lookup pattern stayed load-bearing.** Every batch-3 target verified against `scripts/input/kldb-data.json` before proposing. Surfaced 91342 Markt- und Meinungsforschung fachlich (Anf 2) for Interviewers (43-4111.00) — a 5d class the tiebreaker never reaches because "Markt- und Meinungsforschung" stems don't overlap with "Interviewers, Except Eligibility and Loan" on any dimension. 31104/31134 Bauplanung variants for Civil/Transportation Engineers surfaced the same way; both were invisible via the current stem-overlap output but present in the catalog at the expected Anf-4 tier. Session 28's note ("catalog lookup earned its keep") compounds.
- **Two small phrasing corrections at review time.** (a) Initial proposal for 43-4111.00 Interviewers was "Befrager/Befragerin" — @mo-sp swapped for "Interviewer/Interviewerin" (more colloquial in DE, "Befrager" reads behördlich). (b) For 29-2036.00 Medical Dosimetrists the pairing with "Medizinphysiker Dosimetrie / Medizinphysikerin Dosimetrie" at Anf-3 got a cross-check from @mo-sp — "medizinphysiker ist ok wenn es ein studienberuf ist." Verified: Medizinphysiker is a Studienberuf (typical path Master Physik/Medizinphysik + MPE-Anerkennung); Anf-3 specialist-tier covers Bachelor-level entrants and MTRA-mit-Zusatzausbildung, the label fits the tier.
- **Browser-test HMR quirk worth remembering.** The `onet-occupations.json` chunk is loaded once per session via dynamic import + promise cache (`occupationsPromise`). Vite HMR swaps the module graph but doesn't invalidate already-resolved promises, so the browser still matches against the old JSON. @mo-sp hit this first ("finde nur Interviewer") — the "Interviewer" substring match was against the English title of the old data, not against the new `title.de`. Hard-reload (Cmd+Shift+R) fixed it. Not a code bug — just a reload-discipline note for future data-edit sessions.
- **17-2051.01 Transportation Engineers pulled into batch-3 as a zero-cost bonus.** Not in the original 5 I'd surfaced, but became obvious via SOC-sibling lookup — same parent 17-2051 SOC-4 as Civil Engineers, same wrong Metallbau class. One-line addition to batch-3 with @mo-sp's blessing ("ja mitnehmen, aber zeige mir die konkreten änderungen vor dem commit"), target 31134 Bauplanung von Verkehrswegen und -anlagen hoch komplex. `title.de` already set, no title-fill needed.
- **Branch hygiene — fresh main for both PRs.** Per the stacked-PR hygiene rule, scroll-to-layer branched from pulled-fresh `main`, batch-3 also branched from pulled-fresh `main` (which by then contained the scroll-to-layer merge). Parallel independent trees; any merge conflicts would have been ResultsPage.vue import-deduplication at worst, none actually occurred.

**What shipped (2 PRs):**

*`feat/scroll-to-layer-on-ergebnis` (1 PR, 1 commit):*
- `src/pages/assessment/AssessmentPage.vue`: layer-completion push becomes `router.push({ path: '/ergebnis', query: { focus: store.currentLayer } })`. The "Ergebnisansicht" shortcut button + App.vue header link both omit the query (explicit-peek navigation stays at top-of-page, which is the user's mental model for those entry points).
- `src/pages/results/ResultsPage.vue`: new `focusTargetFromQuery()` helper reads `route.query.focus` + validates against the four layer keys. In `onMounted`, after the occupations-prefetch, a `nextTick`-wrapped `getElementById(``layer-${focus}``)?.scrollIntoView({ behavior: 'smooth', block: 'start' })` fires. Four anchor IDs (`layer-riasec`, `layer-bigfive`, `layer-values`, `layer-skills`) added to each completed-state block with a `scroll-mt-6` class for breathing room. Optional-chain means jsdom tests (no layout) silently no-op.
- Tests: 4 new cases in `ResultsPage.test.ts` (anchor IDs appear only after each layer is complete) and 1 updated + 1 new case in `AssessmentPage.test.ts` (completion push carries the focus query with the just-finished layer). Pre-existing test for the "Ergebnisansicht" peek shortcut stays unchanged — that button still pushes the bare string.
- Retires BACKLOG UX-polish item "Scroll to the just-finished layer on /ergebnis, not to the top" (@mo-sp request from 2026-04-23).

*`fix/kldb-subtitle-overrides-batch-3` (1 PR, 2 commits: data + docs):*
- `scripts/input/kldb-overrides.mjs` new "Container-abuse overrides — batch 3" block with 6 entries:
  - 11-3051.02 Geothermal Production Managers → 26234 Energie- und Kraftwerkstechnik hoch komplex (was Sprengtechnik). Matches the Anf-3 plant-operator siblings 51-8011/8012/8013 which already sit in the same domain at one tier lower.
  - 17-2051.00 Civil Engineers → 31104 Bauplanung und -überwachung (ohne Spezialisierung) hoch komplex (was Metallbau). Core Bauingenieur role.
  - 17-2051.01 Transportation Engineers → 31134 Bauplanung von Verkehrswegen und -anlagen hoch komplex (was Metallbau). Adjacent SOC-sibling caught via lookup.
  - 17-2141.01 Fuel Cell Engineers → 25104 Maschinenbau- und Betriebstechnik (ohne Spezialisierung) hoch komplex (was Sprengtechnik). Matches parent 17-2141.00 Mechanical Engineers.
  - 29-2036.00 Medical Dosimetrists → 81233 Medizinisch-technische Berufe in der Radiologie komplex (was Ergotherapie).
  - 43-4111.00 Interviewers, Except Eligibility and Loan → 91342 Berufe in der Markt- und Meinungsforschung fachlich (was Auskunft und Kundeninformation).
- `scripts/input/title-overrides-de.mjs` new "Primary-null fills paired with batch-3" block with 5 entries: Geothermal Production Managers → "Leiter Geothermiekraftwerk / Leiterin Geothermiekraftwerk", Civil Engineers → "Bauingenieur/Bauingenieurin", Fuel Cell Engineers → "Brennstoffzellen-Ingenieur / Brennstoffzellen-Ingenieurin", Medical Dosimetrists → "Medizinphysiker Dosimetrie / Medizinphysikerin Dosimetrie", Interviewers → "Interviewer/Interviewerin". 17-2051.01 already had "Verkehrsingenieur/Verkehrsingenieurin", no fill needed.
- `src/data/onet-occupations.json` directly patched with the same 5 `title.de` values for build idempotency — a future `build-esco-german.mjs` run will read the override file and produce the same JSON state (same pattern as Session-27's Parking Enforcement Workers coupling).
- `src/data/kldb-occupation-mapping.json` regenerated. Idempotent (`manual overrides applied: 170` = 131 seed + 7 tiebreaker-regression + 15 batch-1 + 11 batch-2 + 6 batch-3). Byte-identical on rebuild.
- BACKLOG housekeeping: Values-penalty "perfect match" entry retired (already fixed in commit 5acce33 — matcher.ts returns null on missing workContext, ResultsPage.vue:505-508 already handles null with the noData staging branch); Cluster-B "KldB class names read like category descriptions" entry retired as a misdiagnosis; DE-title pass-2 entry updated to note the 5 primary-null fills done here and the 4 still-pending primary-null codes where only `title.de` needs filling (29-1124.00 Radiation Therapists, 47-4099.03 Weatherization Installers, 49-9081.00 Power Plant Operators non-specific, 49-9099.01 Geothermal Technicians); subtitle-mismatch entry updated to reflect the 32 Session-26 findings now covered (15 batch-1 + 11 batch-2 + 6 batch-3).

**Coverage after the session:**

| | Before session 29 | After |
|---|---|---|
| Layer-completion navigation to /ergebnis | always top-of-page | scrolls to just-finished layer via `?focus=<layer>` |
| Session-26 browser findings handled | 28 / ~70 | 32 / ~70 (+ 5 coupled primary-null title fills) |
| Cluster-(A) container-abuse overrides | 29 | 35 |
| Primary-null codes (category phrase as display title) | 9 | 4 remaining (all pure cluster-C — KldB is correct, only the title needs filling) |
| Overrides applied on build | 164 | 170 |
| Tests passing | 223 | 227 |

**Branches:** `feat/scroll-to-layer-on-ergebnis` (1 commit → 1 PR), `fix/kldb-subtitle-overrides-batch-3` (2 commits → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **Full cluster-C pass.** Next session dedicated to the DE-title quality pass 2 — the 4 remaining primary-null fills from today's investigation, plus the ~18 specific flagged items (Anschläger, Bügler, Zwirner, Zwicker, Pfahlrammer, Blutabnehmer, Postschalterbediensteter, Kameraschwenker, Underwriter, Warenmakler, Pflegeexperte, CAD-Bediener, Instruktionsdesigner, Lehrkraft-Gymnasium-phrasing, Archäologe/Anthropologe split at 19-3091.00, Ständerbohrmaschinen-phrasing, Fomgießmaschinenführer typo, Dietitians at 29-1031.00), plus a sampling pass over the ~640 un-reviewed `title.de` tail.
- **Lehrkräfte-Tier-Verwechslungen + scan-based (A) batch 4.** Still gated on the SOC-aware companion filter to keep false-positive review volume manageable.
- **Seed overrides audit** (131 entries, low priority hygiene).

---

### Session 28 – 2026-04-24
**Focus:** Batch-2 of container-abuse subtitle overrides. Closes out the remaining Session-26 browser-test (A) findings and picks up the older scan-based BACKLOG entries for 25212 Kraftfahrzeugtechnik and 41312 Chemie-/Pharmatechnik. One PR, one commit on `fix/kldb-subtitle-overrides-batch-2`. Third session today; same-day chain after PRs #61 (Session 26 infra) and #62 (Session 27 batch-1).

**Meta / process notes:**
- **Catalog-lookup pattern earned its keep.** The feedback memory saved last session — "consult the canonical catalog before proposing codes" — shaped the whole research phase. Every target was verified against `scripts/input/kldb-data.json` before proposing, and it surfaced several specific tier codes (31213 Vermessungstechnik komplex for Fernerkundung/Katasteringenieur, 83123 Sozialarbeit komplex for Jugendarbeiter, 92413 Redakteure/Journalisten komplex for Technischer Redakteur) that a grep over the current mapping output would have missed — those classes exist in KldB but aren't yet mapped to any O\*NET. Same mechanism that unlocked Historiker → 91224 Geschichtswissenschaften last session.
- **Four BACKLOG candidates fell out after lookup** — worth logging so future-me doesn't re-flag them. (a) Pannendienstfahrer (49-3092.00) → 25212 Kfz-Technik fachlich is defensible; Pannendienstfahrer are driving-mechanic hybrids, the class fits. (b) Fomgießmaschinenführer (51-4072.00) is already correctly at 24132 industrielle Gießerei — the BACKLOG entry calling it a 24202 Metallbearbeitung mislabel was stale. (c) Ständerbohrmaschinen-Bediener (51-4031.00) sits in 24202 Metallbearbeitung ohne Spez. — the same bucket that Zerspanungsmechaniker is pinned to (both are spanende Bearbeitung); defensible, @mo-sp's concern was actually about the awkward title.de "Maschinenbediener für Ständerbohrmaschine", a cluster-C issue. (d) School Bus Monitor (33-9094.00) at 83111 Kinderbetreuung-Helfer is a reasonable fit for child-safety-on-bus supervision — @mo-sp flagged it as a naming concern, not a domain concern. (c) and (d) logged as cluster-(C) follow-ups; (b) required no action; (a) dropped entirely.
- **Anf tier-bump for one case, bewusst.** Oldtimerrestaurator (49-3021.00) moved from Kfz-Technik fachlich (Anf 2) to Kfz-Technik komplexe Spezialistentätigkeiten (Anf 3). Oldtimer-Restaurierung ist post-Ausbildung-Spezialisierung — der Pill-Wechsel von "Ausbildung" zu "Weiterbildung/Studium" spiegelt die tatsächliche Rolle besser wider. Every other batch-2 entry preserved the current Anf tier.
- **Semantic reversal on Sprengstoffarbeiter** — Session 24 emptied 21124 Sprengtechnik of *engineers* (Bio-/Nuklear-/Robotics etc. got dumped there by the tiebreaker and were remapped out). But the actual Sprengstoffarbeiter (47-5032.00 — explosives worker, mining/demolition) was incorrectly placed in 41312 Chemie-/Pharmatechnik and Session-24's cleanup was orthogonal to that error. Moved now to 21122 Sprengtechnik fachlich: that IS the correct place for the worker role which Session 24's cleanup had *distinguished* from the engineers that were wrongly routed there. Same container, different domain question.

**What shipped — `fix/kldb-subtitle-overrides-batch-2` (1 PR, 1 commit):**

*`scripts/input/kldb-overrides.mjs`* — new "Container-abuse overrides — batch 2" block at the tail with 11 entries:
- **Browser-test (A) remnants (8):** Biometriker (15-2041.01 → 41114 Statistik hoch komplex, same family as Statistiker 15-2041.00), Katasteringenieur (17-1021.00 → 31213), Fernerkundungs-Wissenschaftler + -Techniker (19-2099.01 / 19-4099.03 → 31213 Vermessungstechnik komplex), Technischer Redakteur (27-3042.00 → 92413 Redakteure/Journalisten), Jugendarbeiter (39-9041.00 → 83123 Sozialarbeit komplex), Bürokraft allgemein (43-9061.00 → 71402 Büro-/Sekretariatskräfte fachlich), Leitender Flugbegleiter (53-1044.00 → 51422 Luftverkehr-Service fachlich).
- **Scan-based BACKLOG picks (3):** Sprengstoffarbeiter (47-5032.00 → 21122 Sprengtechnik fachlich — the actual worker role, unlike Session-24's engineer evacuation), Oldtimerrestaurator (49-3021.00 → 25213 Kfz-Technik komplex, Anf bump 2→3), Koksofensteuerer (51-9051.00 → 24112 Hüttentechnik fachlich — coke ovens are metallurgy, not pharma).

Total overrides applied on build: 164 (= 131 seed + 7 tiebreaker-regression + 15 batch-1 + 11 batch-2).

*`src/data/kldb-occupation-mapping.json`* — regenerated. Idempotent on rebuild (byte-identical second run).

**Coverage after the session:**

| | Before session 28 | After |
|---|---|---|
| Session-26 browser findings handled | 17 / ~70 | 28 / ~70 |
| Cluster-(A) container-abuse overrides | 18 | 29 |
| Overrides applied on build | 153 | 164 |
| Tests passing | 223 | 223 |

**Branch:** `fix/kldb-subtitle-overrides-batch-2` (1 commit → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **Cluster-(B) class-name rendering decision** — the largest remaining chunk of Session-26 browser findings ("Berufe in der X" descriptive-sounding classes).
- **DE-title quality pass 2** — the longer-standing item. Session 28 adds two small entries (Ständerbohrmaschinen-Bediener awkward phrasing; Fom/Formgieß- masc/fem typo inconsistency at 51-4072.00) plus the existing Session 27 Archäologe and Session 26 ~14-name list.
- **Scan-based (A) cleanup batch 3** — the remaining 155+ container classes from Session 24's scan; needs the SOC-aware companion filter first so false positives don't dominate the review list.

---

### Session 27 – 2026-04-24
**Focus:** First follow-up PR on Session-26's browser-test findings. Batch-1 bundles the one-line (D) rendering fix (strip "(sonstige spezifische Tätigkeitsangabe)" from KldB subtitles) with 15 (A) container-abuse overrides, plus one coupled (C) title.de correction for Parking Enforcement Workers. One PR, one commit on `fix/kldb-subtitle-overrides-batch-1`.

**Meta / process notes:**
- **Carry-over after #61 merge, same calendar day.** Session 26 merged as PR #61 in the morning; this session picked up directly on the planned batch-1 follow-up. Session numbering follows work-unit, not calendar day.
- **Extracted `stripKldbSuffix` to its own testable module.** Session 24 regressed on `stripKldbSuffix` silently because the function was defined inline in `ResultsPage.vue` with no direct unit test — the de-gendering PR broke it and only the PR-55/56 browser test caught the damage. Moved the function + its suffix constants into `src/pages/results/stripKldbSuffix.ts` and added `stripKldbSuffix.test.ts` with 6 cases covering all four Anforderungsniveau suffixes, the new parenthetical, the combined case where both appear on one class, interior " - " preservation (Trainer - Fitness/Gymnastik), null/empty input, and idempotency. Net effect: future regressions on the suffix/parenthetical logic fail at the unit-test level instead of shipping.
- **Seed-block audit surfaced a wrongly-pinned entry.** Beleuchtungstechniker (27-4015.00) was in the Session-26 seed block pinned to `82332 Tätowierer und Piercer` — not a manual fix, just accumulated drift pinned by the Session-26 retroactive seed. Moved it out of the seed block and into the new batch-1 block with the correct target (94512 Veranstaltungs- und Bühnentechnik), with a trailing comment flagging the history. This is exactly the category-(ii) case that the BACKLOG "Audit the seed entries" item predicted.
- **Coupled a (C) title.de correction with an (A) KldB fix.** 33-3041.00 Parking Enforcement Workers was titled "Ordnungshüter/Ordnungshüterin" — a misleading colloquial gloss (in DE "Ordnungshüter" reads as a broad synonym for Polizist, but the O*NET description is narrowly parking enforcement). Fixing only the KldB class (→ Berufe in der Überwachung und Steuerung des Straßenverkehrsbetriebs) without also fixing the title would have left the user reading "Ordnungshüter" next to a Verkehrsüberwachung subtitle — inconsistent. Bundled a one-line entry in `title-overrides-de.mjs` (→ "Mitarbeiter Verkehrsüberwachung / Mitarbeiterin Verkehrsüberwachung") and patched `onet-occupations.json` directly so the build is idempotent both with and without re-running `build-esco-german.mjs`. Same spirit as Session-24 stripKldbSuffix riding with de-gendering: when two clusters land on one occupation, a split PR is worse than the merge.
- **Catalog lookup against `kldb-data.json` as a default research step.** For each (A) candidate I pulled the current wrong KldB via grep, looked at SOC-4/SOC-3 siblings for context, then checked the candidate target classes against `scripts/input/kldb-data.json` (full KldB-2010 catalog) to confirm the desired Anforderungsniveau tier actually exists. Three targets I'd initially proposed as `null` (Hochbauhelfer-Anf2, Avioniker-Anf2-fachlich, Bühnenmann-Anf2-fachlich) turned out to have clean tier-matched class codes in the catalog that just weren't being used by any O*NET mapping currently — so we pinned to real classes instead of suppressing. Catalog-lookup should become a default for all future override batches.
- **Historiker was the "+1" on @mo-sp's review.** Initial proposal kept Historiker on 91214 "Philosophie, Religion und Ethik" since both are humanities and the current subtitle isn't dramatically wrong. @mo-sp asked whether a better class existed — catalog lookup immediately surfaced 91224 "Berufe in Geschichtswissenschaften - hoch komplexe Tätigkeiten" (Anf 4, same tier as current). Exact match, zero trade-off, added to the batch.
- **Archäologe bundling noted but parked.** @mo-sp also asked why Archäologe isn't a distinct occupation in our corpus. Answer: O*NET's SOC taxonomy bundles it — 19-3091.00 is "Anthropologists and **Archeologists**" under a single code, and the German title drops the Archäologe half. Logged to BACKLOG under cluster (C) rather than fixing in this PR (title-only issue, belongs with the DE-title quality pass 2).

**What shipped — `fix/kldb-subtitle-overrides-batch-1` (1 PR, 1 commit):**

*`src/pages/results/stripKldbSuffix.ts` (new)* — extracted helper. `KLDB_ANFORDERUNG_SUFFIXES` (4 entries) + new `KLDB_SPECIFICATION_SUFFIX = ' (sonstige spezifische Tätigkeitsangabe)'`. Function strips the Anf suffix first (first-match wins), then the parenthetical if present, then trims.

*`src/pages/results/stripKldbSuffix.test.ts` (new)* — 6 Vitest cases covering the full contract including the previously-uncovered interior-separator preservation and idempotency.

*`src/pages/results/ResultsPage.vue`* — inline function and constant removed, import added. No other touchpoints.

*`scripts/input/kldb-overrides.mjs`* — 27-4015.00 moved out of the seed block. New "Container-abuse overrides — batch 1" comment block at the tail with 15 entries: Bühnenmann (94512), Justizwachtmeister (53242), Konstruktionsmechaniker Feinblechbau (24412), Lebensberater (83122), Mitarbeiter Freizeitpark (null — no clean class), Avioniker (26332), Lagerarbeiter (51312), Hochbauhelfer (32102), Parking Enforcement Workers (51512 + title.de coupling), Sportlehrer für Menschen mit Behinderung (84504), Schadensregulierer (72133), Notariatsmitarbeiter (73112), Rechtsanwaltsfachangestellte (73112), Beleuchtungstechniker (94512 — corrected from its wrong seed pin), Historiker (91224). Each entry carries a `// <Beruf>: was <prior target>` comment. Total overrides on build: 153 (= 131 seed + 7 tiebreaker-regression + 15 batch-1).

*`scripts/input/title-overrides-de.mjs`* — one entry for 33-3041.00 with a two-line header comment explaining the informal-gloss correction.

*`src/data/onet-occupations.json`* — one value patched: 33-3041.00 `title.de` set to "Mitarbeiter Verkehrsüberwachung / Mitarbeiterin Verkehrsüberwachung". Idempotent with the override entry — any future rebuild produces the same value.

*`src/data/kldb-occupation-mapping.json`* — regenerated with the 153 overrides applied. Idempotent on rebuild (byte-identical on `node scripts/build-kldb-mapping.mjs` twice).

**Coverage after the session:**

| | Before session 27 | After |
|---|---|---|
| `stripKldbSuffix` behaviour | 4 Anf suffixes, no parenthetical | 4 Anf suffixes + "(sonstige spezifische Tätigkeitsangabe)" |
| `stripKldbSuffix` dedicated tests | 0 (indirect coverage only) | 6 |
| Cluster-(A) container-abuse overrides | 3 class families (Session 24) + 0 (Session 26 browser-test candidates) | 3 + 15 (batch-1) |
| Session-26 browser findings handled | 0 / ~70 | 17 (15 A + 1 C + 1 D) / ~70 |
| Overrides applied on build | 139 | 153 |
| Tests passing | 217 | 223 |

**Branch:** `fix/kldb-subtitle-overrides-batch-1` (1 commit → 1 PR).

**Open for next sessions (tracked in BACKLOG):**
- **Batch-2 (A) overrides:** remaining browser findings (Leitender Flugbegleiter, Lehrkräfte-Kategorien-Tier-Verwechslungen) + the scan-based ~35 cases. Needs a SOC-aware companion filter for the scan.
- **Cluster-(B) class-name rendering decision:** "Berufe in der X" / "Lehrkräfte in der Y" categorical-sounding names.
- **DE-title quality pass 2:** ~14 pending browser-test hits plus the new Archäologe/Anthropologe bundling note for 19-3091.00.

---

### Session 26 – 2026-04-24
**Focus:** KldB-Subtitle build-pipeline hardening. Two coupled changes in `scripts/build-kldb-mapping.mjs` — a compound-noun fallback in the `stemsOverlap` tiebreaker so Session-24's Tiersitter regression gets fixed at the source, and a new `applyOverrides()` pass that loads per-O*NET-code pins from a fresh `scripts/input/kldb-overrides.mjs` so hand-curated KldB decisions from earlier sessions survive future rebuilds. One PR, one commit on `fix/kldb-subtitle-compound-noun-tiebreaker`.

**Meta / process notes:**
- **Carry-over session after Claude-account switch.** Session started in one account, @mo-sp's environment flipped mid-work, resumed in a new Claude session. All work lives on the sandbox host (git, `gh` authed as `mo-sp`) so the account swap is a no-op for the codebase — worth noting because the session-end handoff was the pasted chat tail, not a clean break. The pasted summary + a scan of the working-tree diff was enough to land cold; nothing was lost.
- **Two mechanisms, one PR — why together.** The compound-noun tiebreaker fix (`tiersitter`/`tierpflege` both contain `tier` but differ at position 5, so the 5-char-prefix match missed) is small and narrow; on its own it would regress a handful of other codes where the looser substring matcher now picks the wrong side of a German compound. The overrides file pins those regressions back. Shipping the tiebreaker without the overrides layer would be a net regression; shipping overrides without the tiebreaker fix would leave the Tiersitter class of bugs unfixed. They're a pair.
- **Overrides file is seeded retrospectively.** Before this PR, `kldb-occupation-mapping.json` was the only persistence layer for hand-curated decisions: Session 19's 249 DE-title overrides had downstream effects on stem-overlap rankings, Session 24's three container-class remaps (Sprengtechnik / Immo-Facility / Biologie) were hand-edited directly in the JSON, and title.de updates between those sessions had drifted the tiebreaker output. Any mechanical rebuild would have silently reverted all of it. The new `kldb-overrides.mjs` captures 132 such divergences plus 7 new tiebreaker-regression pins (139 overrides applied in the build log). File header flags the seed set as "behaviour-preserving, walk each entry in a follow-up audit to drop the ones that aren't intentional".
- **Idempotency verified.** `node scripts/build-kldb-mapping.mjs` twice in a row produces a byte-identical JSON (confirmed via stash + re-diff, 0 lines of drift). Important baseline for future CI.
- **Browser-test surfaced ~70 more findings — deliberately out of scope for this PR.** @mo-sp walked the top of the occupations list and flagged ~70 additional subtitle / title issues. Sorted into four clusters for three follow-up PRs: **(A)** ~50 container-class subtitle mismatches (Bühnenmann→Brunnenbau, Justizwachtmeister→Detektive, Beleuchtungstechniker→Tätowierer, Konstruktionsmechaniker Feinblechbau→Klempnerei, Leitender Flugbegleiter→Straßen/Schiene, Ordnungshüter→Jagdwirtschaft, Sportler-für-Menschen-mit-Behinderung→Pferdewirtschaft, Lebensberater→Kinderbetreuung, Fabrikhilfsarbeiter, Mitarbeiter Freizeitpark, Avioniker, Lagerarbeiter, Hochbauhelfer, Rechtsanwaltfachangestellt, Schadensregulierer, Historiker, Notariatsmitarbeiter, Lehrkräfte-Kategorien, usw.) — same family as Session-24 container-abuse; **(B)** ~8 KldB class names that read as category descriptions rather than job titles ("Berufe in der Sprengtechnik", "Berufe in der Isolierung", "Berufe in der Energie- und Kraftwerkstechnik", "Medizinisch-technische Berufe in der Radiologie", "Technische Servicekräfte in Wartung und Instandhaltung", "Lehrkräfte in der Sekundarstufe") — rendering concern, not an override question; **(C)** ~12 primary `title.de` values that are stale or foreign at the ESCO level (Anschläger, Bügler, Gelegenheitsarbeiter, Zwirner, Zwicker, Pfahlrammer, Blutabnehmer, Postschalterbediensteter, Ordnungshüter, Kameraschwenker, Underwriter, Warenmakler, Pflegeexperte, CAD-Bediener, Instruktionsdesigner, Lehrkraft-Gymnasium-und-Realschule) — same family as the existing "DE-title quality pass 2" BACKLOG item; **(D)** one rendering suffix the Session-24 `stripKldbSuffix` allowlist missed: "(sonstige spezifische Tätigkeitsangabe)" leaks into the rendered subtitle. All four clusters logged under Data quality in BACKLOG.
- **Verification done, PR ready.** The five target checks @mo-sp wanted confirmed pre-PR all passed: Tiersitter + Tiertrainer render correctly via the tiebreaker fix; Statistiker + Zerspanung stay correct via tiebreaker-regression pins; a re-browse of Session-24 stichprobe codes confirms the container-class cleanups survived the infrastructure migration. Type-check / lint / 217 tests / Vite build all green.

**What shipped — `fix/kldb-subtitle-compound-noun-tiebreaker` (1 PR, 1 commit):**

*`scripts/build-kldb-mapping.mjs`* — two mechanical edits. (1) `stemsOverlap` gains a compound-noun substring fallback: if the 5-char-prefix check doesn't hit, check whether one token (≥6 chars) contains the other's 4-char prefix as a substring. Cheap German-stemmer approximation; still only a tiebreaker signal. (2) New `applyOverrides()` pass after `buildMappings()` loads `scripts/input/kldb-overrides.mjs` and merges each pin over the computed entry. Codes listed in overrides but absent from the mapping are skipped with a warning count. Build log now reports `manual overrides applied: N`.

*`scripts/input/kldb-overrides.mjs` (new)* — 139 entries keyed by O*NET-SOC code, each shaped `{ kldbCode, kldbName, anforderungsniveau, trainingCategory }`. `kldbCode: null` + `kldbName: null` suppresses the subtitle row (UI falls back to the jobZone-derived training category only). File header documents the seed rationale. A trailing block of 7 entries is explicitly labelled as "tiebreaker regressions from the compound-noun substring fix (2026-04-23)": Statistiker (15-2041), Elektroniker Automatisierungstechnik (17-3023), Kraftfahrzeugbautechniker (17-3027.01), Weatherization Installers → Isolierung (47-4099.03), Bediener Holztrocknungsanlagen (51-3091), Zerspanungsmechaniker (51-4041), Glasbläser → industrielle Glasbläserei (51-9195.04).

*`src/data/kldb-occupation-mapping.json`* — regenerated. 94 lines changed in each direction; the delta tracks the new tiebreaker output plus override application. Net behaviour: Tiersitter class of bugs fixed, Session-19 and Session-24 hand-decisions preserved, seven substring-regression codes pinned back to their correct pre-fix values.

**Coverage after the session:**

| | Before session 26 | After |
|---|---|---|
| Hand-curated KldB decisions | implicit in JSON only; silently revertable on rebuild | explicit in `kldb-overrides.mjs`, survive rebuilds |
| Tiersitter / Tiertrainer subtitle | wrong container class | correct (fixed at the tiebreaker source) |
| Compound-noun tiebreaker regressions | would have shipped as unnoticed drift | 7 explicit pins |
| Build idempotency | unverified | byte-identical on rebuild |
| Tests passing | 217 | 217 |

**Branch:** `fix/kldb-subtitle-compound-noun-tiebreaker` (1 commit → 1 PR).

**Open for next sessions (three follow-up PRs planned from the browser-test cluster):**
- **(D) + ~15 (A) quick-wins:** add "(sonstige spezifische Tätigkeitsangabe)" to `stripKldbSuffix`' allowlist, bundled with a batch of the clearest container-abuse overrides (Bühnenmann, Justizwachtmeister, Konstruktionsmechaniker Feinblechbau, Lebensberater, Freizeitpark, Avioniker, Lagerarbeiter, Hochbauhelfer, Ordnungshüter, Sportler-mit-Behinderung, Schadensregulierer, Notariatsmitarbeiter, Rechtsanwaltfachangestellte, Historiker, Mitarbeiter-Freizeitpark).
- **(B) class-name rendering pass:** decide whether "Berufe in der X" descriptive classes should be stripped / reworded / suppressed at render time. Probably a presentation decision, not data.
- **(C) DE-title quality pass 2:** already logged in BACKLOG (Session 19 residue); this browser-test adds ~12 more hits to the pile.
- **Overrides-file audit:** each of the 132 seed entries should be walked to decide whether it's an intentional fix or just pinned drift that could be replaced by a build-time improvement. Out of scope for the first follow-up PR.

---

### Session 25 – 2026-04-23
**Focus:** Schicht-4-UX-Pack auf der Ergebnisseite: per-Unterkategorie-Retake und eine Likert-Skala-Rebalance, damit Position 3 in allen drei Sub-Categories als Mitte lesbar ist. One PR, three commits on `feat/skills-per-subcat-retake`.

**Meta / process notes:**
- **Bundle decision mid-session.** Started as a single-topic PR (per-sub-category retake). Halfway through, @mo-sp asked to fold in the Likert-label rebalance that had been sitting in BACKLOG — "passt thematisch". Agreed it's the same Phase-4-polish cluster, but kept them as separate commits on the same branch so the PR description stays legible. Added a third small docs commit for a scroll-to-layer follow-up idea that surfaced at the end.
- **Two process corrections taken on the chin.** (a) Jumped into implementing the label change before getting @mo-sp's label-text approval — should have proposed options first. (b) Tried to batch the label edit into commit #1 without having committed the approved retake work — @mo-sp correctly wanted the retake approval captured in its own commit first, then a separate discussion about labels, then a separate commit for labels. Both corrections are about preserving auditability between "approved change" and "next exploratory change".
- **Partial-retake boundary nuance.** The Zwischenscreen flag (`skillsInterstitialPending`) is set on the answer handler when `skillsCurrentIndex` hits index 34 (last skill) or 86 (last ability). Without guarding, a user who retakes only "Fähigkeiten" would briefly flash the Zwischenscreen and leave a stale pending flag in Dexie — next hydrate would resurrect the stale interstitial. Fix: when a boundary answer already takes `skillsAnswers.length` to `skillsTotal`, skip setting the flag entirely. `selectAnswer` sees `isComplete` and navigates to /ergebnis. Unit-tested.
- **Label-text brainstorm.** Original proposal was plain "Sehr schwach / Schwach / Durchschnittlich / Stark / Sehr stark" for all three sub-categories. @mo-sp: "klingt zutreffend, aber etwas langweilig". Offered two alternatives (B: Selbst-Perspektive "Kann ich… / Kenne ich…", C: Lernstufen "Anfänger → Profi"); @mo-sp picked B. Final scale keeps `abilities` unchanged (already symmetric), swaps `skills` to "Kann ich nicht / Eher schwach / Durchschnittlich / Eher stark / Kann ich richtig gut" and `knowledge` to "Kenne ich nicht / Oberflächlich / Durchschnittlich / Fundiert / Tiefes Fachwissen". Position 3 is "Durchschnittlich" across all three — that constraint is non-negotiable because any other midpoint word (Solide, Routiniert, Mittelmaß) either tips the baseline back toward "above average" (same bug we were fixing) or introduces a pejorative read.

**What shipped (single PR, 3 commits on `feat/skills-per-subcat-retake`):**

*commit 1 — per-sub-category skills retake:* replaces the single "Fähigkeiten-Test wiederholen" button under the Wissen card with three per-sub-category links. Each link's handler calls the new `store.repeatSkillsSubCategory(sub)` action that drops only that sub-category's answers, reshuffles that slice of `skillsOrder`, resets `skillsCurrentIndex` to the slice's first index (0 / 35 / 87), and switches `currentLayer` to skills. `answerSkillsQuestion` now skips setting `skillsInterstitialPending` when the answer completes the layer (partial retake — other sub-categories still hold their answers). Four new Vitest cases cover the three slice resets + the skip-interstitial-on-completion behavior. Retires the BACKLOG entry from the Englisch-split smoke test.

*commit 2 — Likert-label rebalance:* `src/shared/lib/i18n.ts`. Skills and knowledge moved to symmetric scales anchored on "Durchschnittlich" at 3. Abilities unchanged. Retires the matching BACKLOG entry ("Skills Likert labels are asymmetrically positive").

*commit 3 — docs:* this SUMMARY entry, plus a new BACKLOG note to scroll `/ergebnis` to the just-finished layer's section on layer-completion navigation (currently always lands at top of page).

**Coverage after the session:**

| | Before session 25 | After |
|---|---|---|
| Tests passing | 213 | 217 |
| Phase-4 retake granularity | full 121-item layer only | per-sub-category |
| Likert midpoint (skills + knowledge) | 2 reads as "baseline" | 3 reads as "Durchschnittlich" |

**Branch:** `feat/skills-per-subcat-retake` (3 commits → 1 PR).

**Open for next sessions:**
- **Scroll-to-completed-layer on /ergebnis** — logged to BACKLOG this session.
- **End-to-end scoring validation with archetype personas** — still parked, unchanged priority. Now that the three-sub-category retake exists it's cheaper to iterate on a single skill bar between archetype runs without re-answering the other 87 items.

---

### Session 24 – 2026-04-19
**Focus:** Small-PR UX/data-quality pack. @mo-sp was busy and asked for an "implement-everything-up-front, test-and-PR sequentially" batch mode. Shipped six PRs covering header navigation, scroll-to-top, skills label bands, score-delta labeling, a rank-15 DE-title gap, and a de-gendering pass on the KldB subtitles that also repaired `stripKldbSuffix`.

**Meta / process notes:**
- **Batch mode worked, with a switch mid-session.** Agreed plan up front: I push all five branches from fresh `main`, @mo-sp tests when free, I open PRs after approval. Halfway through ("kannst auch pr stellen eigentlich, dann machen wir es stück für stück") we flipped to per-branch checkout → test → approve → open-PR → next branch. The second rhythm was actually faster because each PR's testing surfaced its own follow-ups that couldn't always be batched.
- **Every browser test grew the PR it exercised.** (a) PR #51 (header shortcut) surfaced that `AssessmentPage`'s mount-time guard was calling `resetCurrentLayer()` on complete layers — clicking the header's "Zum Test" link after finishing RIASEC wiped those answers and made the new shortcut disappear. Fixed inline: advance to the next incomplete layer instead, only fall back to reset when every layer is done. (b) PR #53 (skills bands) started as 3 bands; @mo-sp asked for 5 to match the 5-point Likert anchors and picked the "Kaum vorhanden / Grundlagen / Durchschnittlich / Fortgeschritten / Expertise" vocabulary. (c) PR #56 (de-gender KldB) surfaced a pre-existing bug in `stripKldbSuffix`: it was cutting at the first `" - "` separator, which threw away meaningful specialization info — "Trainer - Fitness und Gymnastik - komplexe Spezialistentätigkeiten" rendered as just "Trainer". The de-gendering made the regression visible; fix bundled in the same PR (known-suffix allowlist instead of first-separator slice).
- **Gender-form preference clarified.** @mo-sp is fine with explicit written-out masc/fem pairs like "Schauspieler/Schauspielerin" or "Pharmazeuten/Pharmazeutinnen" — the annoyance is *only* the short gendered shortcuts (`/innen`, `:innen`, `*innen`). The PR 56 regex targets `/(innen|in)\b` as a strict suffix, so all 4 explicit pair patterns in the KldB data survive intact. Memory-worthy: "no short-form gendering, but written-out M/F is OK".
- **Merge-conflict scare on PR 52 was a false alarm.** PR 51 merged first and touched `App.vue`; PR 52 also touched `App.vue` to mount `ScrollToTop`. GitHub's web-UI "Accept both changes" initially felt risky, but the resulting merged file was semantically correct (both imports deduped, both template additions preserved). The pattern to remember: for Vue SFC merges where each side only *adds* to the imports/template, GitHub's accept-both is usually fine; the risk is duplicated import lines, which this specific pair didn't produce.
- **Systemic subtitle-mismatch surfaced, parked for PR 7.** PR 56 browser test: @mo-sp flagged "Leiter Sicherheit → Führungskräfte - Immobilienwirtschaft und Facility-Management" and "Leiter Biomassekraftwerk → Immo/Facility" as obviously wrong mappings. A quick audit showed KldB **61394 is used as a dumping ground** by `build-kldb-mapping.mjs` for any "Führungskraft/Leiter" code it can't match better: 6 of 7 codes mapped to it are wrong (Chief Sustainability Officers, Security Managers, Biomass/Wind Energy managers, Project Management Specialists). Only Facilities Managers (11-3013.00) legitimately belongs. This is the same stem-overlap family as the existing BACKLOG entries on medical and non-medical subtitle drift; added a PR-7 note pointing at the 61394 pattern specifically.
- **SUMMARY lands in its own docs PR this session.** Memory rule: SUMMARY rides with the session's final PR. But PRs 51–56 were all already approved and merged by the time I drafted this entry — per the "approved PRs are frozen" rule, I couldn't push a doc commit onto any of them. Opened `docs/session-24-log` as a standalone follow-up PR.

**What shipped (6 PRs, all merged to main):**

*`feat/header-results-shortcut` — merge 975be35:* header "Zum Ergebnis" link visible whenever `store.riasecIsComplete`; `App.vue` fires `store.hydrate()` on mount (idempotent vs. `main.ts`) so the link survives a reload on `/`. Bundled fix in `AssessmentPage.vue`: the mount-time guard now advances to the next incomplete layer instead of wiping the completed one. Adds one store-test case for the all-complete fallback.

*`feat/scroll-to-top-button` — merge 98fa9cd:* new `src/shared/ui/ScrollToTop.vue`, mounted globally from `App.vue`, fades in after 400 px of scroll, smooth-scrolls to top on click. Drops the bottom "Test neu starten" link on `/ergebnis` plus its orphaned `restart()` handler and test case (redundant with the top-of-page "Interessen-Test wiederholen" and HomePage "Test starten" buttons; @mo-sp reported in Session 21 that the bottom link kept getting mistaken for a scroll-to-top control).

*`feat/skills-label-bands` — merge ec02600:* qualitative label alongside each Skills sub-category bar. Replaced the raw percent display with a five-band label (Kaum vorhanden 0-20 / Grundlagen 20-40 / Durchschnittlich 40-60 / Fortgeschritten 60-80 / Expertise 80-100). Percent kept as a small grey monospace suffix for debug checks. New `percentToBand()` helper + test in `skills.ts` / `skills.test.ts`, new `skillsBand.*` i18n keys.

*`feat/score-delta-label` — merge 509d84f:* subtitle line under the view-mode toggle ("± zeigt die Veränderung gegenüber 'Nur Interessen'.") that appears whenever a non-baseline view is active, plus a matching `title` tooltip on each delta badge. Clarifies that the green/red deltas on the results list measure change from raw RIASEC, not from the previously-active toggle.

*`fix/de-title-19-1023` — merge 03e572e:* single-line JSON fix. `onet-occupations.json`: 19-1023.00 Zoologists and Wildlife Biologists `title.de` null → "Zoologen und Wildtierbiologen". Spotted as a rank-15 rendering gap in the Session-21 live test.

*`fix/de-gender-kldb-subtitles` — merge a3cd33c:* 72 `kldbName` entries in `kldb-occupation-mapping.json` de-gendered (`/innen`, `/in` stripped where they are pure suffixes, not full feminine words). Explicit "Pharmazeuten/Pharmazeutinnen", "Pflasterer/Pflasterinnen", "Piloten/Pilotinnen", "Athleten/Athletinnen" preserved. Bundled fix: `stripKldbSuffix` now uses a known-suffix allowlist (Helfer-/Anlerntätigkeiten, fachlich ausgerichtete, komplexe Spezialisten-, hoch komplexe Tätigkeiten) instead of `indexOf(' - ')`. Result: 65 "Führungskräfte/Aufsichtskräfte - X" classes get their specialization back in the rendered subtitle.

*`fix/subtitle-semantic-remap` (this PR, also carries the session log):* first-cut attack on the three worst "container-class abuse" groups surfaced by a reverse-lookup scan across the 923-row mapping. **KldB 21124 Sprengtechnik** was picking up 13 engineering codes (Logistics/Bio/Validation/Materials/Nuclear/Photonics/Robotics/Nanosystems/Wind/Solar/Nanotech-Tech/Materials-Sci/Medical-Equipment-Repair) — nothing to do with blasting. **KldB 61394 Immo/Facility** was catching 6 unrelated Führungskräfte codes (Chief Sustainability, Security Manager, Biomass, Wind Ops, Wind Dev, PM Specialists), only legitimate tenant is 11-3013.00 Facilities Managers. **KldB 41204 Biologie** had 5 clinical-medicine codes mixed in with real biologists (Pathologists, Allergists/Immunologists, Dietitians, Cytotechnologists, Genetic Counselors). Remapped 17 codes to better-fit KldB classes chosen via SOC-4/SOC-3 peer lookup (Mikrosystemtechnik, Maschinenbau/Betriebstechnik, Automatisierungstechnik, Physik, Chemie, Geschäftsführer, Aufsichtskräfte-Chemie, Aufsichtskräfte-Unternehmensorganisation, Arbeitssicherheit/Sicherheitstechnik hoch komplex (for Security Manager, per @mo-sp, same domain family as Fachkraft Schutz & Sicherheit), Ärzte ohne Spez., …). Nulled `kldbName` on 7 codes where no peer-based target was clean (Wind/Solar energy engineering, Wind Energy Mgrs operations and development, Dietitians, Cytotechnologists, Genetic Counselors) — the subtitle line just doesn't render, Anforderungsniveau-Pill stays. 155+ container groups remain flagged by the scan and carry a BACKLOG entry for a later pass.

**Coverage after the session:**

| | Before session 24 | After |
|---|---|---|
| Occupations | 923 | 923 |
| Title overrides (DE null) | 1 rank-15 gap | 0 for 19-1023.00; broader `title.de` pass still BACKLOG |
| Gendered KldB subtitles (`/in`, `/innen` shortcut) | 72 | 0 |
| Clearly-wrong container mappings (Sprengtechnik / Immo-Facility / Biologie) | 24 codes | 0 |
| Tests passing | 212 | 213 |

**Branches (merge order on main):** `feat/header-results-shortcut` → `feat/scroll-to-top-button` → `feat/skills-label-bands` → `feat/score-delta-label` → `fix/de-title-19-1023` → `fix/de-gender-kldb-subtitles` → `fix/subtitle-semantic-remap` (this PR, bundles the session log).

**Open for next sessions:**
- **Further semantic KldB subtitle mismatches.** The scan flagged 155+ container KldB classes with ≥ 2 suspicious codes each. Session 24 only addressed the three most obviously-abused containers (Sprengtechnik, Immo-Facility, Biologie). Next pass: walk the remaining list, group by domain (medical MT, metal-working, construction, banking, …) and decide per-group whether to re-map, null, or declare false-positive. The stem-match heuristic will also need a SOC-aware companion filter so "Bankkaufleute → Kreditprüfer" style false positives don't dominate the list.
- **Dietitians title.de is wrong at the ESCO level.** 29-1031.00 Dietitians and Nutritionists is currently titled "Futtermittelwissenschaftler/Futtermittelwissenschaftlerin" (animal-feed scientist). Spotted mid-session but out of scope for a kldb-subtitle PR. Fix in the broader title.de audit.
- **End-to-end scoring validation with archetype personas** — still parked since Session 22. Now that the four layers, five-band labels, delta labeling, and subtitle cleanup have all shipped, the top-N render surface is stable enough to run the validation without it being confounded by display issues.

---

### Session 23 – 2026-04-16
**Focus:** Starting PR 2c — Skills / Abilities / Knowledge curation for the 29 O\*NET-survey-less tier-A codes. Replanned the approach up front, then shipped four full 120-item profiles (Blockchain-Entwickler, Datenwissenschaftler, Rettungssanitäter, Notfallsanitäter) on a single branch with a checkpoint commit after each.

**Meta / process notes:**
- **Replanned the Top-20 × 10-codes approach before starting.** The session-22 "PR 2c" plan was "top-20 items per code for the ten highest-priority ones (~200 values)". Re-reading the matcher confirmed the idea was sloppy: the scoring iterates over exactly the items listed in the occupation's map, so curating only the top-20 means the other 100 items contribute nothing for that code (vs. all 120 for O\*NET-surveyed codes). That introduces asymmetry in the bonus math (lower `floor`, more volatile bonus range for curated codes) and bakes a subjective item-selection into the scoring. Replanned to three options — (A) scope-reduce to 10 codes but full 120 per code, (B) importance-floor curation across all 29 at ~40-50 items, (C) keep Top-20. Picked (A): full symmetry with surveyed codes, and the 19 long-tail codes (Taxi, Flugzeugtankwart, Kremationstechniker …) have near-zero probability of ever hitting a top-20 result, so abstaining on them is a non-loss.
- **First code choice was wrong — caught before drafting.** Initially proposed 15-1252 Software Developer as the warm-up. Only after pulling the anchor data did I notice SwDev is *not* in the 29-codes list — it was one of the 15 that O\*NET 30.2 filled in session 22. Switched to 15-1299.07 Blockchain-Entwickler as the dry-run candidate (directly anchored to the freshly-filled SwDev + InfoSec Analyst), then 15-2051 Datenwissenschaftler, then 29-2042/29-2043 RS+NotSan as a pair.
- **Review cadence: framing → Skills → Abilities → Knowledge, with Pass 1 / Pass 2 split per sub-category.** Each code starts with a short mental model and anchor-positioning paragraph ("DS applies methods, doesn't invent them; codes at SwDev level, signature skill is Inductive Reasoning"), then three markdown tables — one per sub-category — with my proposed `(l, i)`, all anchor columns side-by-side, and a delta/comment column. Items with proposed `i ≥ 3.0` go in Pass 1 (detailed per-row review); items with `i < 3.0` go in Pass 2 (skim, flag ausreißer). Ergonomic: each sub-category took ~5 minutes of @mo-sp's review time per code. 120-item profile per session is realistic; the pair (RS + NotSan) in one session worked because they're a tier progression, not structurally different.
- **Four-anchor triangulation for the Data Scientist.** Single-anchor codes (Blockchain ≈ SwDev + InfoSec) are simple. DS genuinely sits between 15-2041 Statisticians (math depth), 15-2031 Operations Research Analysts (business-to-model translation), 15-1221 Research Scientists (methodological rigour), and 15-1252 Software Developers (coding/pipelines) — no single anchor dominates. The four-column reference table gave @mo-sp enough context to judge "80 % Stat on Math, at SwDev on Programmieren, between anchors on Requirements Analysis" without me having to re-justify each cell.
- **Pair-curation for RS + NotSan is a natural unit.** The two are an ability-tier progression, not independent occupations. Shared table (both codes' values next to three anchors, delta-annotation per row) let @mo-sp review the *difference* rather than twice the absolute values. Physical / emergency-response / transport / patient-service items are identical between tiers; the clinical-depth / decision-authority / pharmacology items lift.
- **Sanity-check after each code.** Ran the skills-match math against canonical user archetypes (all-1s / median / tech-archetype / all-5s for Blockchain/DS; medical-emergency archetype for RS/NotSan) and compared `floor / neutral / bonus` against the reference anchors. Every curated code's floor/neutral sat within 0.01 of its primary anchor's — structural calibration is consistent with the O\*NET-surveyed corpus, so curated codes don't warp the bonus denominators.
- **Subtitle vs primary-display clarification mid-session.** @mo-sp flagged rank 508 showing "Berufe in der Informatik (ohne Spezialisierung)" for 15-1299.07. Turned out to be the KldB-subtitle, not the primary title — primary is "Blockchain-Entwickler/Blockchain-Entwicklerin" from the session-19 override. The KldB class 43103 is a catch-all because KldB 2010 has no Blockchain-specific class; same pattern-family as the medical-subtitle bug already in BACKLOG. No fix in this session.
- **Spotted an O\*NET-items data bug for Fremdsprachen across all 894 surveyed codes.** Session 21 relabelled `2.C.7.a` English Language → Deutsche Sprache as a cultural-localization content swap, but the occupation-level `(l, i)` values for `2.C.7.b` Fremdsprachen were not recalibrated. For tech/international roles (SwDev 0.3/1.1) this systematically underweights English — reality is closer to 4.0/3.5. Logged to BACKLOG with a per-code-override fix idea; not touching in-session to avoid a double-correction when the system-wide fix lands. For all four curated codes this session, kept Fremdsprachen values in line with their anchors so the profiles stay consistent with the rest of the corpus until the global fix.
- **BACKLOG addition for UX polish.** @mo-sp flagged that the 238 questionnaire items (60 RIASEC + 50 Big Five + 120 Skills + 8 Values) are abstract enough that first-time test-takers, especially students, may be unsure what's meant. Adding a concrete example per item would help. Entered as UX-polish BACKLOG item before the friends-test push.

**What shipped — `feat/curate-skills-tier-a` (4 commits):**

*`0453bef` — 15-1299.07 Blockchain-Entwickler:* 120 items (35 S / 52 A / 33 K) curated against SwDev (primary) + InfoSec Analyst (crypto/security slice). Deltas vs SwDev: + Math/Programming/Complex-Problem-Solving/System-Design/Telecom/Engineering-Tech/Economics, − Customer Service / Time&Personnel Management / German Language. Tech-archetype sanity: bonus +0.135 (vs SwDev's +0.079). Floor/neutral track SwDev within 0.015. First commit opened the branch.

*`85e97a8` — 15-2051 Datenwissenschaftler:* 120 items against four anchors (Stat / OpsRes / Rscr / SwDev). Positioning: applies stats methods, codes at SwDev level, signature skill Inductive Reasoning from data. Deltas: + Finance/Marketing/Behavioral-Sciences/Communications/Media/Law, − Administration/Telecommunications/Customer-Service-vs-SwDev. Tech-archetype sanity: +0.147 (between Stat's +0.163 and SwDev's +0.079). Floor/neutral triangulate cleanly — DS floor is within 0.001 of Stat, neutral between Stat and SwDev.

*`fec5b96` — 29-2042 RS + 29-2043 NotSan (pair):* 2 × 120 items against RN / LPN / Firefighter. RS positioned at LPN-tier clinically plus Firefighter-level physical; NotSan is a clinical upgrade on RS approaching RN on Medicine/Biology/Psychology/Therapy and Judgment/Complex-Problem-Solving, plus team-lead. Physical / transport / service items identical between tiers. Medical-emergency archetype sanity: RS floor/neutral (0.595/0.986) match LPN's (0.598/0.979); NotSan (0.560/0.972) matches RN (0.562/0.960). BACKLOG additions (Fremdsprachen data-gap, UX-polish examples-per-item) bundled.

*SUMMARY commit (this file) rides with the final PR.*

**Coverage after the session:**

| | Before session 23 | After |
|---|---|---|
| Occupations | 923 | 923 |
| workContext | 923 | 923 |
| Skills / Abilities / Knowledge | 894 | 898 (+4 curated) |
| Title overrides applied | 218 | 218 |
| Tests passing | 212 | 212 |

**Branches (merge order on main):** `feat/curate-skills-tier-a` (4 commits → 1 PR).

**Open for next sessions:**
- **PR 2c continuation — 6 more priority codes to curate:** 15-1299.04 ethischer Hacker (Pentester), 15-1299.06 IT-Forensik-Experte, 15-1255 Multimedia-Designer, 29-1212 Kardiologie, 29-1242 Orthopäde, 29-1243 Kinderchirurg. Each ~30-45 min review. IT-Forensik and Pentester can re-use Blockchain's tech-anchor setup; the three Facharzt codes share anchor RN/Internist/Surgeon. Likely 3-4 more sessions to finish.
- **Systemic 2.C.7.b Fremdsprachen fix** before the archetype validation — logged to BACKLOG. Per-code-override layer that bumps the value for tech / research / international-business occupations; current values systematically underweight English for the German audience.
- **Phase B archetype-persona test** still downstream — unchanged from session 22's plan. Once the 10 priority codes are curated, run 5 persona tests and decide whether to tune SKILLS\_ALPHA / values weights / RIASEC-C items.
- **UX-polish — example per questionnaire item.** New BACKLOG entry from this session. Non-blocking but important before friends-test push.

---

### Session 22 – 2026-04-16
**Focus:** Preparing end-to-end scoring validation. Fixed a math bug in the Big-Five adjustment, bumped the O\*NET database to the current production release (30.2), hand-curated the `workContext` layer for every occupation O\*NET hasn't surveyed yet, and cleaned up a handful of display and language inconsistencies surfaced by the browser test. Four shipped PRs plus a BACKLOG cleanup.

**Meta / process notes:**
- **Math-bug root cause: Big-Five applied multiplicatively on a signed RIASEC base.** `fitScore = riasecCorrelation × (1 + α·bfSim)` works when RIASEC is positive, but inverts the sign logic when it's negative — a *good* personality match made a negative RIASEC base *more* negative, a mismatched personality *rescued* it by dampening magnitude. @mo-sp's real test showed his actual occupation (15-1252 Software Developer) at rank 410 with fitScore −0.17, displayed as "−17/100". Switching to additive (`fitScore = riasec + α·bfSim`) makes BF sign-agnostic — a good personality always pulls the score up, a bad one always pulls it down, regardless of RIASEC direction.
- **Negative display values are desired, not a bug.** @mo-sp kept the "−17/100" display intentionally: shows the user where they are *not* a fit, useful for debugging and honest self-knowledge. No `max(0, …)` clamp.
- **Three-ring investigation instead of guessing at calibration.** Before touching α/β/γ the plan was: (A) instrument & reproduce (@mo-sp already had the breakdown panel), (B) diagnose root cause per layer, (C) only then tune. Ring A surfaced the math bug directly, so ring B was partly obviated for the first problem — but the layer-wise analysis also surfaced two other issues: missing skills data for 44 codes (14 % of our Tier-A tech roles) and a display bug rendering "no values data" as "perfect match".
- **O\*NET version pinning.** `build-onet-data.mjs` was already parameterised via `ONET_DB_VERSION`; bumping the default from `29_2` to `30_2` was a one-line change. All downstream builds (ESCO German titles, KldB mapping, Big Five profiles) re-run cleanly off the regenerated `onet-occupations.json` — none of those scripts depend on the raw O\*NET file layout.
- **15 of 44 no-skills codes filled by 30.2 upgrade, 29 remained.** Including the flagship 15-1252 Software Developer. O\*NET ran the survey in 2025 for several codes that were split in 2018-2019. The 29 still-missing ones are new specialties (Blockchain, Pentest, Forensik, Multimedia, Data Scientist), physician specialties (Kardiologie, Orthopädie, Kinderchirurgie), EMT/paramedics, and niche operational roles.
- **No cloning for data gaps — per @mo-sp preference.** Cloning 15-1251 Computer Programmer onto 15-1252 Software Developer would bury the genuine differences in scope. Instead: manual curation with reasoning, clearly marked as `dataSource: "pathfinder-curated-YYYY-MM"`. Memory-recorded as a durable preference.
- **Future-proof conditional override.** The build step applies each curated field *only* when the raw O\*NET data is missing. The moment a future O\*NET release ships real survey data for one of these codes, the override becomes a no-op and the real data wins. No manual retirement of entries needed.
- **Dimension-by-dimension review with @mo-sp for the 29 curated workContext profiles.** Mirrored the session-20 RIASEC item process: I drafted, presented in thematic batches (desk workers, clinical medicine, active/mixed, operational/physical), @mo-sp reviewed each occupation's 9 dimensions with go/counter-proposal per cell. Representative adjustments: Politiker autonomy 4.5→3.3 (party discipline), Pentester team/contact lowered (solo work), Rettungssanitäter indoor/outdoor swapped (ambulance ≠ climate-controlled office), Kremationstechniker public contact dropped (furnace operator, not family liaison), Taxifahrer outdoor 2.8→1.8 (climate-controlled cabin reads as indoor).
- **Documentation convention correction.** PR #45's body and BACKLOG additions slipped into German; CLAUDE.md calls for English across all written artifacts outside the app UI. @mo-sp noticed after merge; retroactively edited PR title/body and opened a cleanup PR (#46) for the BACKLOG entries I had introduced. Memory-recorded as feedback to prevent recurrence. The historical German drift in SUMMARY.md session entries is not a license to continue — this entry is English.

**What shipped:**

*`feat/bigfive-additive-modifier`:*
- `matcher.ts` formula: `min(riasec × (1+α·bfSim), 1)` → `riasec + α·bfSim`. Field name `bigFiveModifier` kept to avoid a drive-by rename across six files; only semantics (range, sign) updated in types comment and display layer.
- `ResultsPage.vue`: breakdown row renders `+0.06` instead of `×1.19`, formula line `r + a` instead of `min(r × m, 1.00)`. `stageForBigFive` thresholds shifted from multiplicative `[1.1, 0.95, 0.9]` to additive `[0.1, −0.05, −0.1]` — same semantic bands.
- Tests: modifier comparisons vs. 1.0 → vs. 0.0; expected bounds ±0.3 instead of 0.7/1.3.
- Observed effect: @mo-sp's Dev rank moved from 410 (fitScore −0.17) to 266 (+0.04). Still mid-pack — the weak RIASEC basis and missing skills data remained, fixed separately.

*`fix/backlog-english-entries`:*
- Rewrote the two BACKLOG entries introduced in the prior PR (RIASEC short-vs-long form, C-items clerical-heavy) from German to English. Historical German-flavoured lines in the rest of BACKLOG.md untouched — cleanup pass is a separate concern.

*`feat/fill-missing-skills-profiles`:*
- Bumped O\*NET database default from 29.2 (Feb 2025) to 30.2 (the current production release as of April 2026). Same 1017 raw codes / 923 in corpus — no list churn. 15 newly-filled layer-4 profiles, most notably 15-1252 Software Developers (the reference code for tech testers). Bundle grew +9 KB gzip.
- Other gains: 15-1299.05 IT Security Engineers, 25-2056 Special Ed Teachers Elem, 25-3031 Substitute Teachers, 29-1214 Emergency Medicine Physicians, 53-3051/53 Bus/Shuttle Drivers, and a handful of manager/security-supervisor codes.
- Three display/calibration observations parked in BACKLOG for later: values-penalty rendering "perfect match" when workContext missing; skills stage "Solide Überschneidung" paired with a 0 bonus on median-user answers; values layer is penalty-only with no symmetric positive bonus like BF/Skills.

*`feat/curate-missing-occupation-profiles`:*
- New override file `scripts/input/curated-occupation-profiles.mjs` with workContext profiles for the 29 codes O\*NET hasn't surveyed. Each entry carries 9 workContext values on the CX scale, a `_source: "pathfinder-curated-2026-04"` tag, and `_notes` explaining the reasoning. `build-onet-data.mjs` applies each field conditionally — real O\*NET data always wins when it ships.
- `Occupation` type extended with optional `dataSource` field so downstream consumers can tell curated from O\*NET-survey data.
- Display fix bundled: `computeValuesPenalty` now returns `null` (not `0`) when `workContext` is missing; matcher guards the subtraction; UI falls through to the existing `"Keine Daten für diesen Beruf"` branch instead of staging "−0.00 passt fast perfekt". Regression test included.
- Four title overrides surfaced during the dimension review: `11-1031` Regierungsmitglied → Politiker/Politikerin (O\*NET scope is legislators, not cabinet), `15-1299.07` Blockchain Engineers → Blockchain-Entwickler/Blockchain-Entwicklerin (was rendering the English label), `39-1014` Bewirtungsmanager → Leiter/Leiterin Gastronomie und Freizeit (broader scope matches the supervisor role), `53-1044` Purser/Purserette → Leitender Flugbegleiter / Leitende Flugbegleiterin (German aviation idiom).

*Tests: 211 → 212 (+1).* One new regression test for `valuesPenalty: null` on missing workContext. All type-check, lint, build green across all four branches.

**Branches (merge-commit order on main):** `feat/bigfive-additive-modifier` · `fix/backlog-english-entries` · `feat/fill-missing-skills-profiles` · `feat/curate-missing-occupation-profiles`

**Coverage after the session:**

| | Before session 22 | After |
|---|---|---|
| Occupations | 923 | 923 |
| workContext | 894 | 923 (+29 curated) |
| Skills / Abilities / Knowledge | 879 | 894 (+15 via 30.2) |
| title.de | 889 | 890 (+1 Blockchain) |
| Title overrides applied | 214 | 218 (+4: Politiker, Blockchain, Gastro/Freizeit, Flugbegleitung) |
| Tests passing | 211 | 212 |

**Open for next sessions:**
- **PR 2c — Skills / Abilities / Knowledge curation for tier-A codes.** 29 codes still missing layer-4 data. Top-20 items per code for the ten highest-priority ones (Data Scientist, 4 emerging IT specialties, 3 Facharzt specialties, 2 sanitäter tiers). ~200 values. Dimension-by-dimension review like this session's batches A-D.
- **Phase B — Archetype-persona test.** The whole calibration point. Once layer-4 curation is done, @mo-sp runs 5 tests "as if I were X" (Software Dev, teacher, nurse, craft, designer covering RIASEC dimensions and Anforderungsniveaus), we check top-20 results, and decide whether to tune `SKILLS_ALPHA` / values dimension weights / RIASEC-C item content. The session-20 A-coverage shift and the session-22 C-item clerical observation both point toward possible calibration drift that the archetype test would surface concretely.
- **Parked display / scoring notes (BACKLOG):**
  - Skills stage label vs. value inconsistency for median (all-3s) users — "Solide Überschneidung" paired with "+0.00".
  - Values layer is penalty-only (`[0, 0.35]`). Could mirror BF/Skills with a symmetric `[−0.175, +0.175]`.
  - RIASEC short-form outlier sensitivity — a single low C tanked @mo-sp's Dev correlation to −0.17. Options: long-form, robust aggregation, per-dim content sharpening.
  - C-dimension item content is clerical-heavy (8/10 items are office/bookkeeping). Dev-flavoured Conventional (syntax discipline, quality control, documentation) is not represented. Decide after archetype test.
- **Data-quality BACKLOG items untouched:** KldB subtitle drift (medical + non-medical), 33 remaining codes without DE title (Session 19 pass-2), 22 O\*NET-orphan codes, 17 Anforderungsniveau-2-away codes.

---

### Session 21 – 2026-04-15
**Focus:** Phase-4-Skills-Items-Polish — O\*NET 29.2 Content Model mit 120 Items (35 skills / 52 abilities / 33 knowledge) für das deutsche Publikum. Sub-Kategorie für Sub-Kategorie mit @mo-sp durchgegangen wie Phase 1 in Session 20, danach Live-Test mit ernsthaften Antworten und parallel Description-Polish Item für Item.

**Meta / process notes:**
- **Scoring-safe wie Phase 1.** `store.ts:36-120` matcht über `id`, Item-Texte fließen nirgends ins Scoring. Item-IDs und EN-Felder bleiben als O\*NET-Attribution-Anker unberührt.
- **Cross-Subcategory-Label-Kollisionen entschärft.** "Mathematik" (skill `2.A.1.e` vs knowledge `2.C.4.a`) und "Mündliches Verständnis"/"Sprachverstehen" (Comprehension vs Speech Recognition) liefen im UI als Zwillinge — via Verb-Rename und Re-Scope (akustisches Parsen vs inhaltliches Verstehen) aufgelöst.
- **O\*NET-US-Anchor für "English Language" kulturell lokalisiert.** `2.C.7.a` "English Language" → **"Deutsche Sprache"** als Content-Swap wie die 15 RIASEC-Fälle: O\*NET-Berufsprofile messen Landessprach-Beherrschung, nicht Englisch-spezifisch. Ein DE-Anwalt mit 3/5 Englisch würde sonst gegen US-Anwalts-Profile (4.5/5) unterbewertet trotz exzellenter DE-Kompetenz. Fremdsprachen-Item `2.C.7.b` holt Englisch explizit als Beispiel rein. EN-Feld verbatim, `translationNotes` dokumentiert den Swap.
- **Live-Test mit ernsthaften Antworten.** @mo-sp hat die Änderungen nicht nur abstrakt beurteilt, sondern parallel den kompletten Assessment-Flow durchgespielt und Item für Item angeschaut. Dabei sind 25 Description-Polishes on-the-fly entstanden (Clunky-Übersetzungen, verlorene EN-Nuancen, Genus-/Präpositions-Holpersteine). Wesentlich dichter am tatsächlichen User-Lesefluss als ein reiner Label-Review.

**What was done — `feat/skills-items-de-polish`:**

*17 Label-Umbenennungen:*
- skills: `2.A.1.e` Mathematik → Mathematik anwenden · `2.B.1.e` Unterweisen → Anleiten · `2.B.3.b` Technologieentwicklung → Technische Lösungen entwerfen · `2.B.5.c` Ressourcenmanagement → Material- und Ausrüstungsmanagement
- abilities: `1.A.1.b.6` Informationsordnung → Informationen strukturieren · `1.A.1.b.7` Kategorienflexibilität → Flexibles Kategorisieren · `1.A.1.e.1` Wahrnehmungsintegration → Schnelles Erfassen · `1.A.1.e.2` Gestalterkennung → Verdeckte Muster erkennen · `1.A.2.a.1` Arm-Hand-Ruhe → Ruhige Hand · `1.A.2.b.2` Mehrgliedrige Koordination → Koordination mehrerer Gliedmaßen · `1.A.2.c.3` Gliedmaßenschnelligkeit → Schnelle Arm- und Beinbewegung · `1.A.3.c.1` Beweglichkeit → Statische Beweglichkeit · `1.A.4.b.4` Sprachverstehen → Gesprochenes erkennen
- knowledge: `2.C.2.b` Lebensmittelproduktion → Landwirtschaft und Lebensmittelproduktion · `2.C.5.b` Therapie und Beratung → Therapie und psychosoziale Beratung · `2.C.6` Pädagogik und Didaktik → Bildung und Ausbildung · `2.C.8.b` Recht und Verwaltung → Recht und Staat

*1 Content-Swap (kulturelle Lokalisation):*
- `2.C.7.a` Englische Sprache → **Deutsche Sprache** (DE-Landessprache statt US-Englisch als Native-Item). Description parallel umgezogen, `2.C.7.b` Foreign Language nennt Englisch jetzt als Beispiel.

*25 Description-Polishes (live mit @mo-sp):*
- skills: `2.B.1.d` Negotiation ("Differenzen beilegen" ergänzt), `2.B.4.h` Systems Evaluation (festlegen → erkennen, Verbesserungen ableiten)
- abilities: `1.A.1.f.2` Visualization (Bewegung → Drehung/Neuanordnung), `1.A.1.e.2` Flexibility of Closure (Material → ablenkende Reize), `1.A.1.b.7` Category Flexibility (entwickeln *oder* anwenden ergänzt), `1.A.4.b.4` Speech Recognition (akustisches Parsen statt Verstehen — grenzt gegen Oral Comprehension ab), `1.A.1.a.1` Oral Comprehension ("was jemand in Worten und Sätzen sagt"), `1.A.1.a.2` Written Comprehension (parallel), `1.A.3.c.4` Gross Body Equilibrium ("instabile Lage" → "wenn der Stand unsicher ist"), `1.A.1.b.5` Inductive Reasoning (loser Anhang → zwei gleichwertige Fähigkeiten)
- knowledge: `2.C.7.e` Philosophy (Grundsätze/Bräuche/Denkweisen ergänzt), `2.C.10` Transportation (Kosten-Nutzen-Abwägung → Vor-/Nachteile), `2.C.5.b` Therapy (Beschwerden statt Störungen, Berufs- und Lebensberatung), `2.C.1.e` Customer Service (aktiv erkennen, Qualitätsstandards statt Servicestandards), `2.C.5.a` Medicine (Fehlbildungen, Symptome, Behandlungsalternativen ergänzt), `2.C.3.c` Design (Prinzipien + Baupläne ergänzt), `2.C.8.a` Public Safety (Doppelliste entzerrt, "kommunal/Land/Bund"-Ebenen ergänzt), `2.C.3.d` Building (Bau → Neubau), `2.C.1.f` Personnel (betriebliche Zusatzleistungen, Personalverwaltungssoftware, Tarifverhandlungen), `2.C.9.a` Telecommunications (Übertragungstechnik + Rundfunk statt generischer "Übertragung"), `2.C.2.a` Production (Verteilung + Effizienz ergänzt), `2.C.9.b` Communications (Nominal → Verb-basiert), `2.C.1.a` Administration (Personalplanung ergänzt, Ressourcenzuteilung gestrichen wegen Überlapp mit Koordination)

*Metadaten-Update:* `translator: v2 (2026-04-15) — polish pass complete`, `translationNotes` erweitert um Cultural-Localization-Note zum Englisch→Deutsch-Swap.

*Tests: 211/211 unverändert.* Reine Daten-Änderung, keine Code-Pfade. Type-check, lint, build, test alle grün.

**Branch:** `feat/skills-items-de-polish`

**Offene Beobachtungen aus dem Live-Test (für die nächste Runde):**
- **Score-Kalibrierung schlägt ein.** Top-1 des Real-Tests kam auf 51 von 100; @mo-sp's tatsächlicher Beruf Software Developer landete bei -17. Klassisches Signal für Archetyp/Weight-Miskalibrierung — steht im BACKLOG als "End-to-end scoring validation".
- **Rang 15 "Aufsichtskräfte" ohne DE-Titel** (nur O\*NET 19-1023.00 sichtbar). Data-Quality-Gap, gehört zum DE-Title-Pass-2.
- **KldB-Subtitle-Drift jenseits Medizin.** Agraringenieur → "Papierverarbeitung und Verpackungstechnik", Bioingenieur → "Sprengtechnik", Naturschutz-Wissenschaftler → "Reiseleiter/Fremdenführer". Gleiches stemOverlap-Muster wie bei Medizin-Subtitles.
- **Share-Feature-Idee:** Top-20 als Copy-Button oder Bild-Download zum Teilen mit Freunden. Nicht im BACKLOG, als nächste Session im Gespräch.
- **"Test neu starten"-Button unten im Ergebnis** entfernen — verwechselt sich beim Lazy-Loading mit einem "Nach oben"-Knopf und ist redundant (selber Button sitzt schon oben). Optional durch "Nach oben" ersetzen.

---

### Session 20 – 2026-04-15
**Focus:** Semantische Überarbeitung der 60 Phase-1 RIASEC-Items (O\*NET Interest Profiler Short Form) für das deutsche Publikum. Ziel: datierte, US-spezifische und redundante Formulierungen austauschen, ohne die Scoring-Qualität zu verlieren. Dimension-für-Dimension mit @mo-sp durchgegangen.

**Meta / process notes:**
- **Scoring-Safety vor Start verifiziert.** `riasec.ts:26-28` aggregiert nur pro Dimension (Summe Likert × Pearson gegen Occupation-Profile). Item-IDs und Item-Texte fließen nirgends ins Matching. Content-Swaps sind sicher, solange die Facet-Coverage innerhalb der Dimension erhalten bleibt — kein Risiko für die `onet-occupations`-Kalibrierung.
- **EN-Feld bewusst unverändert** als O\*NET-Attribution-Anker gegen die Developer-License. Nur `text.de` angefasst. Folge: bei den 15 Content-Swaps divergiert EN vs DE semantisch — im neuen `attribution`-Feld explizit erklärt.
- **Gender-Policy:** keine `:in`-Formen (@mo-sp-Präferenz), stattdessen männliche/weibliche/neutrale Einzelformen. Einmal selber `Tänzer:in`/`LKW-Fahrer:in` verwendet und dann korrigiert.
- **Dimension-für-Dimension-Review statt Big-Bang-Diff.** Jede Dimension einzeln vorgeschlagen (Tabelle: Jetzt / Vorschlag / Begründung), @mo-sp hat Zeile für Zeile Go/Nein/Gegenvorschlag gegeben. Mehrere Runden Gegenvorschläge (Fotografie statt Band-Singen, Pflege statt Gebärdensprache, Immobilien statt Bekleidungsgeschäft, politisches Amt statt Vertragsverhandlung). Im Browser-Test nochmal zwei Last-Mile-Fixes (Sekretariat statt "für ein Büro", Lieferwagen statt Lastwagen, Mandanten-Rückroll).

**What was done — `feat/riasec-items-de-polish`:**

*15 Content-Swaps (Aktivität ausgetauscht, Facet-Coverage erhalten):*
- R-04 Fischzucht → Bauernhof/Felder · R-10 Waldbrände → Feuerwehr
- I-05 Blutproben → Tierverhalten im Feld · I-09 Zuckerersatz → Archäologische Funde
- A-03 Musik komponieren → Mode entwerfen · A-06 Bühnenbilder → Innenausstattung · A-07 Drehbücher → Tattoos/Illustrationen · A-09 Band-Singen → Fotografie
- S-06 Kindersport → Obdachlose/Notlagen · S-07 Gebärdensprache → Pflege
- E-03 Friseursalon → Event/Messe · E-06 Verträge verhandeln → politisches Amt · E-10 Bekleidungsgeschäft → Immobilien
- C-05 Warenein-/ausgang → Kundendaten-Datenbank · C-09 Bestandslisten → Sekretariat/Termine

*19 Wording-Fixes (gleiche Facette, schärferes DE):*
- R: r-01 Küchenschränke → Möbel · r-03 konkretisiert (Waschmaschinen/Kühlschränke) · r-06 Lastwagen → Lieferwagen · r-08 Schlösser → "Als Schlüsseldienst" (Doppeldeutigkeit raus) · r-09 generisch → Fabrik-Kontext
- I: i-02 Genitiv-Stapel raus · i-04 Artikel-Fix · i-06 "Im Labor" ergänzt (Drift Richtung R verhindern) · i-07 Bürokraten-DE entschärft
- A: a-04 enger auf "Stift/Pinsel" · a-08 US-Tanz-Beispiele raus
- S: s-04 Reha konkretisiert (Genesung begleiten) · s-08 "mithelfen" → "leiten" (Original "help conduct")
- E: e-08 Mode → Produktlinie · e-09 Kaufhaus → Verkaufsgespräch
- C: c-01 Tabellenkalkulation → Tabellen · c-04 Taschenrechner → Rechnungen prüfen · c-06 Löhne/Angestellte → Gehälter/Mitarbeiter · c-07 Handheld → digital · c-10 Post stempeln → sortieren/weiterleiten

*Attribution-Update:*
- `source` → "Adapted from O*NET Interest Profiler Short Form (v1) — items culturally localized for the German audience"
- `attribution` erweitert um Modifications-Hinweis (15 replaced / 19 reworded by PathFinder, O\*NET nicht verantwortlich für DE-Adaption, EN-Text verbatim erhalten).

*Coverage-Notiz A-Dimension:* 3 Musik-Items auf 1 reduziert (nur a-02 Instrument bleibt), dafür 3 Design-Items reingekommen (Mode, Innenraum, Tattoo/Illustration). Bewusst — Design ist zeitgemäßes A-Feld. Falls Archetyp-Kalibrierung später schiefgeht, hier zuerst nachsehen.

*Tests: 211 unverändert.* Reine Daten-Änderung, keine Code-Pfade. `npm run type-check`, `npm run lint`, `npm run build`, `npm test` alle grün.

**Follow-up PR — `feat/values-items-wording-polish` (Phase 3 polish):**

Nach Phase-1-Merge noch ein Schnell-Review der 8 Werte-Items (Phase 3, custom PathFinder, O\*NET Work Context mapping). Phase 2 (IPIP-50 Big Five) bewusst **nicht angefasst** — validierte Ostendorf-Übersetzung, Item-Redundanz ist psychometrisches Design für Cronbach-α, nicht Dubletten.

- `val-education-01` Frage: "…passt zu dir – schon erreicht oder geplant?" → **"Welchen Ausbildungsabschluss hast du oder möchtest du erreichen?"** · Label 1: "Ohne Ausbildung / Helfer" → **"Ohne formale Ausbildung / Hilfstätigkeit"** (KldB-Jargon raus)
- `val-physical-01` Frage: "…ist für dich in Ordnung?" → **"…passt zu dir im Beruf?"** (passiv-resignierter Ton raus)
- `val-public-01` Frage: "Möchtest du direkt mit Kunden oder der Öffentlichkeit arbeiten?" → **"Möchtest du im Beruf viel Kontakt zu fremden Menschen (Kunden, Gäste, Publikum) haben?"** (grenzt auf UX-Ebene klarer gegen `val-social-01` Kollegen-Kontakt ab)

*Streichen von `val-public-01` wurde erwogen* (@mo-sp hatte Dublette-Verdacht), aber abgelehnt — die Dimension ist in 9 Dateien verankert (ValueDimension union, Occupation type, values scoring array, matcher penalty, i18n, 5 test fixtures, 923 onet-occupations Einträge, build script) und trägt echtes Signal (Back-Office ≈ 2 vs. Außendienst ≈ 4.7). Wording-Fix statt Architektur-Change.

EN-Feld ebenfalls gefixt (custom items, nicht attribution-anchored). Tests 211/211 unverändert.

**Branches:** `feat/riasec-items-de-polish` · `feat/values-items-wording-polish`

**Offene Beobachtungen / TODOs:**
- **Archetyp-Revalidation mit neuen Items** — die End-to-end Scoring-Validation im BACKLOG sollte mit den geschärften Phase-1-Items wiederholt werden, insbesondere wegen der A-Coverage-Verschiebung.
- **Phase 4 / Skills-Items DE-polish** — 120 Items, Kategorie-für-Kategorie-Durchgang wie bei RIASEC. Scope-technisch eine eigene Session wert. Bleibt im BACKLOG.
- **KldB-Subtitle-Fix** bleibt offen · **Homepage → Ergebnis-Shortcut** bleibt offen.

---

### Session 19 – 2026-04-14
**Focus:** Daten-Qualitäts-Sweep für die generischen `title.de`-Cluster, die in Session 18 beim Suchfeld-Test aufgefallen waren — 107 Cluster mit 249 O\*NET-Codes fallen bei ESCO auf denselben deutschen Titel (10× „Facharzt/Fachärztin", alle Helper-\*-Codes auf die Haupt-Handwerk-Bezeichnung, etc.). Eine PR mit kuratierter Override-Map, die jeden betroffenen Code auf einen eindeutigen deutschen Titel setzt.

**Meta / process notes:**
- **Scope breiter als in BACKLOG vermerkt.** BACKLOG sprach von "medical specialties + Helper-variants"; tatsächliches Enumerate ergab 107 Cluster, 249 Codes — ~27 % aller Berufe mit DE-Titel. Full sweep statt Top-Impact-Pass, damit kein Rest-Rausch im UI bleibt.
- **BACKLOG-Hinweis war architektonisch ungenau.** Stand "rerun `build-kldb-mapping.mjs`", aber `title.de` kommt aus `build-esco-german.mjs` (ESCO preferredLabel-API), nicht aus dem KldB-Builder. Korrekter Ort für den Override-Hook: am Ende der ESCO-Build-Pipeline.
- **Drei Collisions durch eigene Overrides gefangen** vor dem Merge. Build-Skript hat nach der ersten Override-Runde 2 neue Duplikate produziert (43-4121 Library Assistants kollidiert mit 25-4031 Library Technicians; 33-3021 Detectives kollidiert mit 33-3021.02 Police Identification). Mit "Bibliothekshilfskraft" bzw. "Kommissar Kriminalpolizei" gelöst. Check war ein sechszeiliges Node-Snippet das am Ende 0 Dups bestätigt hat.
- **Gender-Pair-Inkonsistenz vom User im Retest entdeckt.** 5 Overrides waren nur männlich formuliert (4 Bauhelfer/Helfer-Einträge + Bahn- und Verkehrspolizist, letzterer zusätzlich keine M/F-Paarung sondern zwei distinkte Jobnamen). Zweiter Commit fixt alle 5 auf die Xe/Xin-Form.
- **KldB-Rebuild war verlockend, aber zu riskant für die PR.** Da die Facharzt-Codes jetzt distinkte `title.de` haben, sollte der Stem-Overlap-Tie-Breaker in `build-kldb-mapping.mjs` jedem Facharzt seinen korrekten KldB-5d-Untertitel geben (statt der aktuellen "alle → Kinder- und Jugendmedizin"). Rebuild getestet: ~7 Verbesserungen (Anästhesiologie, Neurologie, Psychiatrie, Allgemeinmedizin landen auf der jeweils richtigen KldB-Klasse), aber ~7 neue Regressionen (Sportmedizin → "Führungskräfte Pferdewirtschaft", Radiologe → "Ergotherapie", Pathologe → "Pharmakologie"). Ursache: KldB 2010 hat nur ~5 Facharzt-5d-Klassen (Kinder/Jugend, Anästhesie, Neurologie/Psychiatrie, Pharmakologie, "ohne Spezialisierung"); für Kardiologie/Dermatologie/Urologie etc. existiert keine eigene Klasse, der Tie-Break erfindet dann absurde Matches. Rebuild zurückgerollt, als klarer BACKLOG-Punkt mit Fix-Idee dokumentiert (ISCO-Fallback auf "ohne Spezialisierung"-Klasse wenn stemOverlap=0).
- **Anwendungsentwickler-Frage war kein Backlog-Kandidat.** User fragte nach meiner fachlichen Einschätzung zum O\*NET-Split 15-1251 (Programmers) vs 15-1252 (Software Developers) und wie der deutsche IHK-Anwendungsentwickler dazu steht. Ich hatte das vorschnell als Feature-Idee geparkt; dritter Commit entfernt den Eintrag wieder. Meine fachliche Position: der Split ist ehrlich und informationstragend (Programmer = Umsetzung nach Vorgabe, Developer = Konzeption/Architektur), nicht zusammenlegungswürdig; IHK-Anwendungsentwickler sitzt real zwischen beiden und ein Profil das stark auf einem der beiden scort liefert echtes Signal.
- **Ausbildungsberuf-Titel inkonsistent** fällt dem User im Retest auf (manche Codes haben IHK-Namen wie MFA/Rechtsanwaltsfachangestellte/Kfz-Mechatroniker, andere beschreibende Namen). Kommt aus ESCO — ESCO liefert für ca. die Hälfte der Codes direkt den deutschen Ausbildungsberuf-Label, für den Rest generisches Deutsch. Overrides folgen demselben Muster. "Systematisch auf IHK-Namen vereinheitlichen" wäre eine separate Design-Entscheidung, kein Bug.

**What was done — `feat/de-title-overrides`:**

*Enumerate der Duplikat-Cluster:*
- Ein sechszeiliges Node-Snippet über `src/data/onet-occupations.json` gruppiert nach `title.de` → 107 Duplikat-Cluster, 249 Codes. Top: 10× Facharzt/Fachärztin, 4× Optometrist, 4× Allgemeinmediziner, danach 24 Cluster à 3 Codes und 80 Cluster à 2.

*Neue Override-Datei (`scripts/input/title-overrides-de.mjs`):*
- ES-Module, exports `{ [onetCode: string]: string }`. 249 Einträge, gruppiert per Cluster in Quell-Reihenfolge, mit engl. Originaltitel als Inline-Kommentar hinter jedem Eintrag. Kuratierungs-Konvention im Header-Kommentar dokumentiert: medizinische Fachärzte als "Facharzt für X / Fachärztin für X" (oder umgangssprachlich Kinderarzt/Augenarzt wo natürlicher), Helper-Codes als "Bauhelfer …handwerk / Bauhelferin …handwerk", sonst BERUFENET-/KldB-nahe DE-Titel in M/F-Paar-Form.
- Drei Collision-Fixes: 43-4121 → "Bibliothekshilfskraft", 33-3021.00 → "Kommissar Kriminalpolizei / Kommissarin Kriminalpolizei", 33-3052 → "Bahn- und Verkehrspolizist/Bahn- und Verkehrspolizistin".
- Nach User-Feedback gender-pair-fix auf 5 Entries (47-3011/47-3012/47-3013/47-3014/33-3052).

*Build-Hook (`scripts/build-esco-german.mjs`):*
- Am Ende der Pipeline nach dem ESCO-Label-Apply: zweite Schleife die pro Occupation prüft ob der Override-Key existiert und dann `occ.title.de` damit überschreibt. Zählt wie viele Overrides gegriffen haben (214 von 249 — die übrigen 35 waren identisch zum ESCO-Label, also no-op).
- `withGerman`-Zähler von "incrementiert im ESCO-Loop" auf "einmaliger `.filter(o => o.title.de).length` am Ende" umgezogen — Korrekter beim Zusammenspiel von ESCO-Labels und Overrides.

*Ergebnis nach Rebuild:*
- **0 Duplikate** in `title.de` (von 107 Clustern / 249 Codes).
- **889 Codes mit DE-Titel**, **889 distinkte DE-Titel**.
- `src/data/onet-occupations.json` gepatcht, `src/data/kldb-occupation-mapping.json` bewusst unverändert (siehe KldB-Rebuild-Note oben).

*BACKLOG-Updates:*
- "Data-quality sweep for generic `title.de` clusters" aus "Up next" entfernt (shippt hier).
- Neu unter "Data quality": KldB-Subtitle-Bug für medizinische Spezialitäten (mit Fix-Idee) + andere Subtitle-Mismatches die der User im Retest mit entdeckt hat (47-2061 Construction Laborers → "Sprengtechnik", 33-9094 School Bus Monitors → "Kinderbetreuung").
- Neu unter "Ideas": KI-gefährdete Berufe als Feature-Idee (Source-Optionen + offene Design-Fragen skizziert).

*Tests: 211 unverändert.*
- Overrides sind reine Daten-Patches ohne neue Code-Pfade. `npm run type-check`, `npm run lint`, `npm run build`, `npm test` alle grün.
- Bundle-Size unverändert.

**Branches:** `feat/de-title-overrides` (3 Commits: Override-Apparat, Gender-Pair-Fixes + BACKLOG-Erweiterungen, BACKLOG-Rollback des Anwendungsentwickler-Eintrags)

**Offene Beobachtungen / TODOs für folgende Sessions:**
- **KldB-Subtitle für medizinische Spezialitäten** bleibt falsch (alle 10 Facharzt-Codes kriegen noch den alten Kinder- und Jugendmedizin-Subtitle aus der nicht rebuilten `kldb-occupation-mapping.json`). Fix erfordert Per-ISCO-Fallback im KldB-Builder. BACKLOG.
- **Andere Subtitle-Mismatches** (47-2061 → Sprengtechnik, 33-9094 → Kinderbetreuung) — selbes Muster, derselbe Fix.
- **IHK-Ausbildungsberuf-Cross-Reference** wäre eine saubere UX-Option für Codes wie 15-1251/15-1252 (Zusatzzeile „In Deutschland oft als *Anwendungsentwickler (IHK)* zusammengefasst"). Nicht umgesetzt, wartet auf User-Entscheidung ob's nötig ist.
- **End-to-end Scoring-Validierung mit Archetyp-Personas**, **Homepage → Ergebnis-Shortcut**, **Skills-Items-Polish** — alles weiter offen, siehe BACKLOG.

**Next steps — Session 20:**
- Nach User-Präferenz entweder den KldB-Subtitle-Fix angehen (ISCO-Fallback), die Scoring-Validierung mit jetzt sauber benannten Berufen, oder die in Session 19 parkierte Phase-1-Fragen-Überarbeitung (RIASEC-Items komisch/langweilig/verwirrend übersetzt, User will rewriten, Scope aber vor Start noch diskutieren — insb. ob einzelne Items durch DE-passendere Anker ersetzt werden dürfen).

---

### Session 18 – 2026-04-14
**Focus:** Der UX-Batzen für "kann es Freunden geben" — offizielle deutsche Berufsbezeichnungen aus der KldB 2010 (Bundesagentur), kategorialer Ausbildungs-Filter statt numerischem jobZone-Cap, und als kleine Schwester noch eine Such- und Sichtbarkeits-UX auf der Ergebnisseite. Zwei PRs: (1) KldB-Mapping inkl. UI-Umbau, (2) Suchfeld + "Alle Berufe zeigen"-Toggle.

**Meta / process notes:**
- **Entscheidung gegen 2j/3j-Granularität beim Ausbildungsfilter.** Ursprüngliche Session-Idee des Users war *"2-jährige IHK, 3-jährig, ohne Ausbildung, Studium"* — das hätte BERUFENET-API-Calls pro Beruf gebraucht (Ausbildungsdauer ist nicht in KldB-Systematik). User hat nach Abwägung *"weiß man ja was gemeint ist"* entschieden: die vier KldB-Anforderungsniveaus 1-4 (Helfer / Fachkraft / Spezialist / Experte) reichen. Spart ~800 API-Calls und den ganzen Auth-Flow; Upgrade auf 2j/3j-Trennung bleibt als klar abgegrenzte Follow-up-PR machbar wenn je nötig.
- **Dreifacher Qualitäts-Nachschlag am Build-Skript.** Erste Version machte viele Miss-Classifications (Registered Nurses → Lehrkräfte, Family Medicine Physicians → Medizinisch-technische Laborberufe). Ursache: der ONET↔ESCO-Crosswalk hat eine `Type of Match`-Spalte (exactMatch/closeMatch/narrow/broad) die wir zunächst ignorierten. Nachschlag 1: pro O\*NET nur die Einträge des besten verfügbaren Match-Tiers behalten — schlagartig viele Qualitätssprünge (Nurses → Gesundheits-Aufsichtskräfte, Physicians → Ärzte ohne Spezialisierung). Nachschlag 2: Vote-Count pro KldB-Kandidat über mehrere ISCO-Routen — half bei Mehrfach-Treffern. Nachschlag 3: stem-basiertes Token-Overlap zwischen `title.de` und KldB-Kandidatnamen (5-char-Prefix, robust genug um "Zimmerer" auf "Zimmerei" zu matchen statt auf "Fassadenbau"). Erst nach allen drei kam "Zimmerer/Zimmerin → Berufe in der Zimmerei" zuverlässig raus.
- **Ehrlichkeits-Korrektur vom User nötig** beim "900 Berufe rüber geholt" — nicht 100% korrekt: 490 exactMatch / 274 closeMatch / 55 narrowMatch / 85 broadMatch. Der broadMatch-Tier ist der Rest-Rausch-Topf. Ehrlich kommuniziert + als Memory-Note fürs Polishing abgelegt (`project_kldb_data_quality.md`).
- **Frage-Formulierung richtungsneutral.** User-Feedback: "Wie viel Ausbildung bist du bereit zu investieren?" schließt Menschen aus die schon mit Ausbildung/Studium fertig sind und jetzt nach Qualifikation filtern wollen. Auf *"Welches Ausbildungsniveau passt zu dir – schon erreicht oder geplant?"* umgeschrieben. Beide Zielgruppen abgedeckt.
- **"Alle Berufe zeigen"-Toggle evolviert von Debug zu Feature.** Erster Gedanke war: User hat "Helfer"-Filter + nur 1 sichtbarer Beruf, weil das Pre-Existing-fitScore-0-Filter die Liste leerrasiert. Fix: Checkbox-Toggle. Diskussion dann: ist das nur fürs Debugging? User-seitiger Insight: Anti-Matches sind valide Selbstkenntnis ("ich bin ganz klar kein Politiker"). Label umformuliert auf *"Alle Berufe zeigen – auch die, die nicht zu dir passen"*, bleibt als legitimes Transparenz-Feature drin.
- **Suchfunktion als erstes echtes Archetyp-Check-Tool.** User hatte es initial als "merken wir uns für später" eingestuft, nach Sichtung der 38 Helfer-Berufe dann aber als direkter Mehrwert für die bevorstehenden Scoring-Validierungs-Sessions gesehen: *"dass man gezielt schauen kann wie man in bestimmten berufen abschneided"*. Als separate kleine PR gezogen damit die große KldB-PR sauber merged werden kann.
- **Duplikate-Bug beim Such-Debugging entdeckt.** Beim Test der Suche sind Cluster sichtbar geworden: 20+ O\*NET-Codes für medizinische Spezialitäten (Cardiologists, Dermatologists, Neurologists …) haben alle `title.de = "Facharzt/Fachärztin"` und mappen alle auf KldB 81414 "Kinder- und Jugendmedizin" (erste alphabetische — Stem-Overlap identisch zwischen allen Facharzt-Kategorien). Dasselbe bei Carpenters vs Helpers-Carpenters (beide "Zimmerer/Zimmerin"). Quick-Fix mit EN-Titel als Disambiguator probiert, vom User zurecht verworfen ("non-english speaker könnten verwirrt sein"). Richtige Lösung: DE-Titel-Override-Map für generische Cluster — klar als eigene Session markiert, Memory-Note geschrieben (`project_occupation_titles_followup.md`).

**What was done — `feat/kldb-occupation-mapping`:**

*Daten-Akquise (alles in `data-raw/kldb/`, gitignored):*
- `systematisches-verzeichnis.xlsx` (225 KB, Bundesagentur) — 1300 KldB-5d-Berufsgattungen mit Langbezeichnungen + Hierarchie 1-5 Stellen
- `umsteigeschluessel-kldb-isco.xlsx` (203 KB, Bundesagentur) — 1523 KldB-5d↔ISCO-08-4d Paare mit Schwerpunkt-Flag (1300 primäre, 223 sekundäre)

*Neuer Extractor (`scripts/extract-kldb.py`, Python stdlib-only):*
- Parst beide xlsx-Dateien via zipfile+ElementTree (kein openpyxl dep), schreibt `scripts/input/kldb-data.json` mit {kldbClasses: [{code, name, anforderungsniveau}], kldbToIsco: [{kldb5d, isco4d, schwerpunkt, eindeutig}]}. Anforderungsniveau = Position 5 des KldB-Codes (1=Helfer, 2=Fachkraft, 3=Spezialist, 4=Experte).

*Neues Build-Script (`scripts/build-kldb-mapping.mjs`):*
- Reuses ESCO-Infrastruktur von `build-bigfive-profiles.mjs` (tabiya-occupations.csv + ESCO↔O\*NET-crosswalk, both auto-downloaded).
- Kette: O\*NET → ESCO-URI → ISCO-08-4d → KldB-5d-Kandidaten. Pro O\*NET werden Kandidaten gesammelt, Deduplikat pro kldb5d mit Vote-Count über ISCO-Routen.
- Match-Type-Tier-Filter: wenn exactMatch-Einträge vorhanden, ignoriere closeMatch/narrow/broad; sonst fallende Priorität. Halbiert den Rausch.
- Tiebreaker-Chain (lexikographisch, lower wins): [|Anf − preferredAnf|, schwerpunktPenalty, −votes, −stemOverlap(title.de, kldb.name)]. `preferredAnf` aus O\*NET jobZone via {1:1, 2:2, 3:2, 4:3, 5:4}. stemOverlap = 5-char-Prefix-Jaccard über Tokens ≥ 4 Zeichen.
- Für O\*NET ohne KldB-Partner (22 Codes, meist US-specific): Fallback `trainingCategory` aus jobZone-preferredAnf, `kldbCode/kldbName = null`.
- Schreibt `src/data/kldb-occupation-mapping.json` mit `{meta, mappings: {[onetCode]: {kldbCode, kldbName, anforderungsniveau, trainingCategory}}}`.

*Ergebnis der Pipeline:*
- **901 / 923 O\*NET-Codes** mit KldB-Name gemappt, 22 fallback-only.
- Match-Tier: 490 exactMatch, 274 closeMatch, 55 narrowMatch, 85 broadMatch.
- Anforderungsniveau-Distanz zum jobZone-Ziel: 672 perfekt, 212 1-off, 17 2-off.
- Verteilung trainingCategory: 258 studies, 195 specialist, 432 apprenticeship, 38 none.

*Code-Seite:*
- `Occupation` Type erweitert um optionale `kldbCode | kldbName | anforderungsniveau | trainingCategory` (+ neuer String-Union-Type `TrainingCategory`).
- `store.ts` fetchOccupations lädt jetzt parallel O\*NET + KldB-Mapping und overlay'd beim Load — ein merged Occupation-Shape für downstream consumers. Keine zweite Lookup-Table im Runtime.
- `matcher.ts` Hard-Filter geändert: `occ.anforderungsniveau ≤ EDUCATION_TO_MAX_ANF[userValues.education]` statt `occ.jobZone ≤ userValues.education`. Mapping: {1:1, 2:2, 3:3, 4:4, 5:4} — Stufe 5 kollabiert auf 4 ("Egal = alles erlaubt"). Occupations ohne Anforderungsniveau fallen durch.
- `values-items.json` Education-Frage umformuliert: Text "Welches Ausbildungsniveau passt zu dir – schon erreicht oder geplant?" + Labels {Ohne / Ausbildung / Meister·Techniker·Bachelor / Master·Promotion / Egal}.
- `ResultsPage.vue` Display-Helpers `displayTitle()` + `occupationSubtitle()` + `stripKldbSuffix()`: primärer Titel bleibt `title.de` wenn vorhanden (konkrete Namen wie "Zimmerer/Zimmerin"), Fallback-Kette auf `kldbName` → `title.en`. KldB-Klassifikation als Subtitle wenn meaningful anders (strippt den Anf-Suffix " - fachlich/komplex/hoch komplex").

*Tests:* 210 → 211 (+1)
- `hard-filters occupations whose Anforderungsniveau exceeds education willingness` — Test auf neuer Semantik, Fixtures auf `anforderungsniveau` umgezogen.
- `keeps occupations without Anforderungsniveau when filtering` — Regression gegen die 22 Fallback-Codes ohne Anforderungsniveau.
- `education=5 (egal) lets every Anforderungsniveau through` — neu, deckt den Kollaps der 5→4-Mapping ab.
- Die übrigen 208 unverändert grün.

**What was done — `feat/occupation-search`:**

*Feature:*
- Such-Input oben über der Ergebnisliste, v-model auf `searchQuery`. Tokenisierung: lowercase + NFKD-Diakritika-Stripping + Split auf Whitespace. AND-Semantik — alle Tokens müssen als Substring im Haystack vorkommen.
- Haystack pro Beruf: `title.de + title.en + kldbName + onetCode`, normalisiert. "zimmer" findet sowohl "Zimmerer" als auch "Zimmerin"; "arzt" findet "Facharzt" und "Zahnarzt"; Teil-O\*NET-Codes wie "47-2031" matchen.
- Wenn Suche aktiv: `rankedResults` zeigt ALLE Treffer mit echtem Rank (aus vollem sortierten `activeResults`), bypassed den fitScore-0-Filter. `visibleResults` bypassed die Pagination. "Mehr anzeigen"-Button verschwindet. Weak-Matches-Toggle wird ausgeblendet weil irrelevant.
- `×`-Button rechts im Such-Feld zum Clear. Treffer-Count (`"N Treffer"`) neben dem Feld.

*Code (ResultsPage.vue only):*
- 3 neue Refs: `searchQuery`, `showWeakMatches`, (bestehender) `visibleCount`. 4 neue computed: `searchTokens`, `isSearching`, `weakMatchCount`, `rankedResults`/`visibleResults`/`canShowMore` erweitert. 2 neue helpers: `normalize()` und `searchMatches()`. 1 neues function: `clearSearch()`.
- Template: Such-Input-Div über dem Weak-Matches-Toggle. Weak-Matches-Toggle bekommt `v-if="!isSearching && …"` damit es bei aktiver Suche verschwindet.

*Tests:* 211 unverändert.
- Kein neuer Test: die Suchlogik ist reine Template-/Computed-Kombinatorik ohne testbare Pure-Function-Grenzen, und der bestehende ResultsPage-Test deckt den Grundaufbau bereits. Browser-Test war das Akzeptanzgate.

**Branches:** `feat/kldb-occupation-mapping` (merged, commit `4dab1f6`) und `feat/occupation-search` (diese PR).

**Offene Beobachtungen / TODOs für folgende Sessions:**
- **Generische title.de-Cluster**. Medizinische Spezialisten (20+ Codes als "Facharzt/Fachärztin"), Helper-Varianten ("Zimmerer/Zimmerin" für Carpenter UND Helpers-Carpenters), Software-Rollen (Programmers vs Developers vs QA). Fix: DE-Titel-Override-Map, siehe `project_occupation_titles_followup.md` in der Memory.
- **Die 85 broadMatch-Mappings** sind der Rest-Rausch-Topf. Wenn der User zufriedener sein will: broadMatch-Kandidaten aus dem Display weglassen, Fallback auf jobZone-only.
- **Die 22 Berufe ohne ESCO-Partner** könnten gehidden oder hand-gemappt werden. Liste in `project_kldb_data_quality.md`.
- **BERUFENET-API für echte Ausbildungsdauer-Granularität (2j vs 3j)**, falls User später doch will.
- **Homepage → Ergebnis-Shortcut** weiter offen (Session 17 parked, nicht angegangen in 18).
- **Score-Delta Baseline-Labeling** — weiter offen.
- **Skills-Items DE-Polish** — weiter offen.

**Next steps — Session 19:**
- Entweder Daten-Qualitäts-Sweep (DE-Titel-Overrides für medizinische Spezialitäten + Helper-Varianten) oder Scoring-Validierung mit Archetyp-Personas (jetzt mit Such-Tool direkt im UI). Beides hat jetzt gute Voraussetzungen.

---

### Session 17 – 2026-04-14
**Focus:** Echte Big-Five-Occupation-Daten aus Anni, Vainik & Mõttus (2024) einbauen. Die Mock-Datei von Session 11 hatte 43 erfundene T-Score-Profile als Platzhalter, mit `meta.mock=true` und dem Kommentar "Real data pending author approval". Data-use-Approval kam heute per Mail vom Erstautor der Studie — explizit positiv-framed, weil derartige Anwendungen laut Autor genau der Grund für die Publikation der Daten waren. Eine PR.

**Meta / process notes:**
- **Dreifacher Wäge-Halt vor dem Code**, per User-Bitte. (1) Welcher Score-Variant aus den 14 Excel-Sheets — S6 (`B5 profiles weighted n=50`) ist die gelabelte Hauptreferenz, Shrinkage zum Populationsmittel für kleine Berufe; Alternativen S11-S14 sind residualised/smoothed Varianten, interessant aber v2. (2) X-Aggregat-Codes wie `101x`, `200x` aus Anni's Tabelle — sind *keine* echten ISCO-Codes, sondern von den Autoren geprägte Labels für Respondenten deren Selbstbezeichnung mehrere 4d-Gruppen überspannt → skip. (3) Bei mehreren ISCO-Treffern pro O\*NET-Code: ungewichteter Mittelwert der T-Scores (die einzelnen ISCO-Profile sind schon N-gewichtet innerhalb ihrer Gruppe).
- **Plot-Twist beim Anni-eigenen Crosswalk-XLSX (`ONET_ESCO crosswalk.xlsx`).** Schien zuerst ein Shortcut zu sein — die Autoren haben "ihren" Crosswalk mitgeliefert, also vielleicht mit direkter ISCO→O\*NET-Ableitung. Beim Unzip und Inspect stellte sich raus: ist eine 1:1-Kopie des offiziellen ESCO-Crosswalks (4271 Zeilen inkl. Meta-Headers, entspricht unseren 4253 gemappten Zeilen nach Skip). Sheet "Sheet1" ist leer. Keine eigene Ableitung, keine Abkürzung. Wir mussten die ISCO→O\*NET-Chain selbst bauen wie geplant.
- **ESCO-Portal will Email + T&C** — kein Direktlink zum Bulk-CSV. Workaround: tabiya-tech mirrort die komplette ESCO v1.1.1 auf GitHub (`tabiya-open-dataset/tabiya-esco-v1.1.1/csv/occupations.csv`), schema-kompatibel mit `ISCOGROUPCODE` Spalte direkt pro ESCO-Occupation. 2.6 MB, CC BY 4.0, direkter Raw-URL. Baut `scripts/build-bigfive-profiles.mjs` ohne neue Deps, ohne 4000 API-Calls.
- **Zwei-Script-Pipeline statt einem.** Python-Extractor für die XLSX (stdlib-only, keine `openpyxl` oder `xlsx`-Dep) schreibt einen committeten JSON-Snapshot in `scripts/input/`; der Node-Build liest reinen JSON + zwei CSVs. Das hält das Runtime stackless (no XLSX parser npm dep) und macht den Extract-Schritt dokumentierbar und reproduzierbar, aber nur dann ausführbar wenn Anni-XLSX lokal in `data-raw/osf-anni/` liegt — konsistent mit dem existierenden Pattern von `build-esco-german.mjs`.
- **Schema 100% kompatibel mit Mock-Datei.** Session 11 hatte die Struktur vorbereitet (OCEAN-Keys, T-Score-Range, `meta.mock`-Flag). Null Codeänderung in Matcher, Store, Types — nur die JSON selbst tauscht. `meta.mock` wird von keinem Code gelesen, ist reine Dokumentation.

**What was done — `feat/bigfive-anni-real-data`:**

*Daten-Akquise (alles in `data-raw/`, gitignored):*
- `data-raw/osf-anni/supplementary-tables.xlsx` (949 KB) — Anni's Supplementary Tables mit S1-S14
- `data-raw/osf-anni/onet-esco-crosswalk-anni.xlsx` (633 KB) — kam mit, aber redundant zu `onet-esco-crosswalk.csv`
- `data-raw/osf-anni/supplementary-material.pdf` + `calculateJobMeansForDomains.R` — Referenz
- `data-raw/esco/tabiya-occupations.csv` (2.6 MB, auto-downloaded) — ESCO v1.1.1 Occupations mit ISCOGROUPCODE

*Neuer Extractor (`scripts/extract-anni-s6.py`, Python stdlib-only):*
- Unzipped `supplementary-tables.xlsx`, parst Shared-Strings + Sheet2 (S2 ISCO-Code-Index) + Sheet6 (S6 Profiles).
- Join S6 (keyed by name) onto S2 (hat `4d_code` + `4d_name`) per exaktem Namens-Match. 263/263 Rows matchten clean, null Missing.
- Schreibt `scripts/input/anni-bigfive-profiles.json` (committed) mit `{source, dimensions, profiles: [{iscoCode, name, sampleSize, scores}]}`. One-off-Script, wird bei XLSX-Refresh re-run.

*Neues Build-Script (`scripts/build-bigfive-profiles.mjs`):*
- Lädt Anni-Profile, filtert 26 X-Aggregat-Codes raus → 237 echte ISCO-4d-Gruppen.
- Lädt `tabiya-occupations.csv` → Map von 3007 `escoUri → iscoGroupCode`.
- Lädt `onet-esco-crosswalk.csv` → 4253 O\*NET↔ESCO-Pairs (skip der 14 Meta-Rows oben via relax_column_count + regex-match auf O\*NET-Format `NN-NNNN.NN`).
- Für jede Crosswalk-Zeile: ISCO-Code resolven — wenn ESCO-URI direkt `.../esco/isco/C####` ist, inline parsen; sonst über tabiya-Map. 4 URIs waren unresolvable (0.09%, ignoriert).
- Pro O\*NET-Code: Set aller beitragenden ISCO-Codes sammeln, Anni-Profile avaraged ungewichtet über die 5 OCEAN-Dimensionen, auf 2 Dezimalstellen gerundet.
- Schreibt `src/data/bigfive-occupation-profiles.json` mit `meta.mock=false`, Citation, DOI, OSF-Link, CC-BY-4.0-License, korrektem `iscoMapping`-String.

*Coverage-Ergebnis:*
- **782 / 923 O\*NET-Codes** (84.7 %) haben jetzt echte Big-Five-Profile — vs. 43 / 923 mit Mock (4.7 %). **18× Coverage-Sprung.**
- T-Score-Range in der Output-JSON: min 40.1, max 57.6, mean 49.8 — sauber gegen Populationsmittel 50 zentriert, erwartbar komprimiert durch Shrinkage (Berufe streuen konservativer als Individuen).
- Plausibilitäts-Spotchecks: Software Devs O 53.7 / E 45.8 (curious + introverted ✓), CEOs erhöht allround / reduziert N (selection effect ✓), Nurse Practitioners A 52.0 (care ✓).
- 141 O\*NET-Codes bleiben ohne Profil — entweder kein ESCO-Crosswalk-Partner, oder Partner gehört zu einer ISCO-Gruppe außerhalb Anni's 263.

*Browser-Test bestätigt:*
- Beispiel vom User: `11-3131.00 Training and Development Managers` → Persönlichkeit ×1.20 Modifier (Near-Max des [0.7, 1.3]-Korridors), Delta +14, Top-Rank-Shift.
- Explain-Panel zeigt bei fast allen Top-Berufen Big-Five-Pill statt "Keine Daten" — vorher war "Keine Daten" die Mehrheit.
- Keine Console-Errors, Rankings fühlen sich sinnvoll an.

*Tests: 210 → 210 (unverändert).*
- Keine neuen Tests nötig: Matcher/Store/Typen unverändert, existierende Tests nutzen Fixtures statt der Mock-JSON.
- Alle 210 bleiben grün; type-check, lint, build grün.
- Bundle `bigfive-occupation-profiles-*.js`: 5 KB → 94.82 KB (gzip 11.33 KB), lazy-loaded, kein Initial-Bundle-Impact.

**Branches:** `feat/bigfive-anni-real-data` (diese PR)

**Offene Beobachtungen / TODOs für folgende Sessions:**
- **141 unpaarige O\*NET-Codes** — bleiben ohne Big-Five-Daten. Option wenn's stört: Name-Matching-Fallback à la `build-esco-german.mjs` Jaccard. Heute: kein Handlungsdruck, 85% Coverage ist schon gut.
- **Residualised-Variante (S11–S14) als v2.** Kontrolliert für Alter/Geschlecht; zeigt "reine" berufliche Persönlichkeitsunterschiede statt konfundierter Rohprofile. Interessante Iteration wenn Coverage zu stark schwankt.
- **Layer-4-Daten unvollständig** — 44 Berufe ohne Skills/Abilities/Knowledge-Maps (Session 16 TODO, unverändert).
- **Prozent-Anzeige im Breakdown**, **DE-Mapping der US-Occupations**, **Ausbildungs-Filter-Kategorien**, **Homepage-Shortcut zum Ergebnis** — alles von Session 16 übertragen, unverändert.
- **Skills-Items DE-Polish** — Translator-Tag `"v1 — polish pass pending"` weiter offen.

**Next steps — Session 18:**
- User-Entscheidung welche der Sessions-16/17-TODOs anzugehen. Naheliegend nach dem Coverage-Sprung: konsistente End-to-End-Scoring-Validierung (jetzt haben ALLE 4 Layers echte Daten über die meisten Berufe). Oder UX-Pflege der offenen Baustellen.

---

### Session 16 – 2026-04-13
**Focus:** Skills-Bonus-Kalibrierung zu Ende bringen. Der asymmetrische Match aus Session 15 hat Überqualifikation gefixt, aber im Gegenzug die Baseline für den zentrierten Bonus verschoben — ein all-1er User bekam leichte *positive* Boni auf durchschnittlich-komplexen Berufen, statt den erwarteten Malus. Eine PR, zwei Commits (erster: Floor-Only-Calibration, zweiter: Neutral-Anchor + Farb-UX nachgezogen nach dem ersten Browser-Test).

**Meta / process notes:**
- **Fix wurde in zwei Durchgängen scharf.** Erste Iteration hat nur den zero-skill floor als Anker verwendet: `bonus = ((match − floor)/(1 − floor) − 0.5) × α`. Browser-Test hat dann gezeigt, dass schwache gemischte Profile (User bei ~47%/26%/27% Likert-Durchschnitt pro Sub-Kategorie) immer noch keinen Malus abbekommen. Grund: ihr userNorm ~0.25 liegt schon über der floor-Baseline, also bekommt ein nominell schwacher User auch noch positive Boni. Zweite Iteration: dritter Anker für den Median-User (userNorm=0.5) eingeführt, dann piecewise-linear zwischen floor → neutral → ceiling mappen. Schwach-mixed fällt damit sauber in die negative Hälfte. Diesmal sofort vom User bestätigt.
- **Drei-Punkt-Kalibrierung war ein echtes Refinement, kein Scope-Creep.** Der Zwischenschritt durch die Floor-Only-Version war nicht umsonst — das Browser-Test-Feedback hat den konzeptionellen Gap aufgedeckt (floor-anchor ≠ neutral-anchor). Ohne den Zwischenschritt wäre der Neutral-Anchor womöglich nicht aufgefallen.
- **Farb-Feedback nach dem Live-Check dazugenommen.** Grauer Neutral-Band bei Werten 0 bis +0.10 war visuelles Rauschen — der User wollte ein klares grün/rot-Binär, weil der piecewise Bonus jetzt schon um 0 zentriert ist, d.h. near-zero *ist* Information. Änderung minimal (stageForSkills-Schwellen + TONE_BY_STAGE.skills: moderate → positive).
- **Edge-Case `upSpan = 0` bewusst auf max-Bonus gemappt.** Auf super-einfachen Berufen (alle occNorm < 0.5) hat der Median-User schon match=1 — es gibt keinen Raum für Differenzierung zwischen median und maxed. Beide kriegen +α/2, weil beide "voll qualifiziert" sind. Konsistent mit dem asymmetrischen Match-Prinzip ("qualify → full bonus").
- **Median-User-Test mußte sich bewusst auf Berufe mit occNorm > 0.5 beschränken**, sonst kollabiert das Assertion-Statement. Im Test-Kommentar dokumentiert.

**What was done — `fix/skills-floor-calibration`:**

*Algorithmus in `matcher.ts`:*
- `computeSkillsMatch` gibt jetzt `{ match, floor, neutral }` zurück. Drei gewichtete Summen pro Beruf in einem Durchlauf:
  - `match` = Σ (1 − max(0, occNorm − userNorm)) × w / Σw  — vom User
  - `floor` = 1 − Σ occNorm × w / Σw  — was ein all-1er scoren würde
  - `neutral` = Σ (1 − max(0, occNorm − 0.5)) × w / Σw  — was ein all-3er scoren würde
- Bonus-Mapping in `matchOccupations` piecewise-linear:
  - `match ≥ neutral`: `bonus = ((match − neutral) / (1 − neutral)) × α/2`, Fallback auf `α/2` wenn `upSpan ≈ 0`
  - `match < neutral`: `bonus = −((neutral − match) / (neutral − floor)) × α/2`, Fallback auf 0 wenn `downSpan ≈ 0` (unmöglich in der Praxis, aber defensive)
  - Gerundet auf 3 Dezimalstellen wie bisher

*Display-Logik in `ResultsPage.vue`:*
- `stageForSkills` liest jetzt `skillsBonus` statt `skillsMatch`. Match ist nach der Kalibrierung pro Beruf relativ, nicht mehr absolut vergleichbar.
- Schwellen: `>= 0.10 strong`, `>= 0 moderate`, `>= −0.10 weak`, sonst `poor`.
- `TONE_BY_STAGE.skills.moderate` von `neutral` auf `positive` umgestellt → grauer Band im Bonus-Bereich [0, +0.10] ist weg, jede positive Abweichung ist grün.
- Caller in `scoreBreakdown` von `stageForSkills(result.skillsMatch)` auf `stageForSkills(result.skillsBonus)` umgezogen.

*Tests (+5):* 205 → 210
- `all-1s user hits exactly −0.25 regardless of occupation complexity` — Regression gegen den Floor-Only-Bug. Easy-Job (l=2) und Hard-Job (l=6.5) beide getestet.
- `maxed user hits exactly +0.25 regardless of occupation complexity` — Counterpart. Deckt den `upSpan=0` Pfad mit ab (easy job kollabiert auf full-bonus).
- `median user (all 3s) hits exactly 0 bonus when the occupation has real requirements` — Neutral-Anchor-Check. Test-Kommentar erklärt warum occNorm > 0.5 nötig ist, sonst kollabiert neutral auf 1.
- `weak-mixed user (all 2s) lands in the negative half of the bonus range` — Das war der eigentliche Bug den der User gemeldet hat. Test hält den User-Szenario-Pfad abgedeckt.
- `floor-calibration rewards importance-weighted matching in mixed profiles` — Fokussierter User (5er auf wichtigen Items, 1er auf peripheren) erreicht fast +0.25. Bestätigt dass die importance-Gewichtung sich durch die ganze Kalibrierung hindurchzieht.

**Branches:** `fix/skills-floor-calibration` (dieser PR)

**Offene Beobachtungen / TODOs für folgende Sessions:**
- **UX: Prozent-Anzeige in Ergebnis-Breakdown** (`Fähigkeiten 47%`) ist nichtssagend für den Nicht-Test-Publikum. Bessere Labels à la "Eher grundlegend / Solide / Stark ausgeprägt" oder Band-Darstellung. Kein Bug, reine UX-Session. Für Debugging aktuell nützlich, also nicht prio.
- **US-Berufe auf deutsche mappen** — die 923 O*NET-Occupations sind per ESCO teilweise übersetzt, aber nicht alle sind für den DE-Arbeitsmarkt naheliegend oder existieren so überhaupt. Session-Scope: ESCO-Mapping-Coverage prüfen, unmapped/unpassende filtern oder re-labeln.
- **Ausbildungs-Filter umbauen** — aktuell wird `jobZone ≤ userValues.education` als numerischer Education-Filter benutzt (jobZone 1-5 = Ausbildungsdauer). Für DE-User wären kategoriale Optionen intuitiver: *"ohne Ausbildung / Ausbildungsberufe (kurz/lang) / Studium"*. Braucht UI-Umbau im Values-Picker und Mapping jobZone → Kategorie.
- **Layer-4-Daten unvollständig für einige Berufe.** 44 von 923 Occupations (~5%) haben keine Skills/Abilities/Knowledge-Maps (die gleichen die auch WorkContext fehlen). Diese kriegen aktuell `skillsBonus = null` und erscheinen in den Ergebnissen mit dem "Keine Daten"-Badge im Panel. Option: (a) händisch/geschätzt nachmappen, (b) entfernen, (c) ausblenden (am billigsten). User tendiert zu (a) oder (c).
- **Homepage → Ergebnis-Shortcut.** Wenn ein Test abgeschlossen ist und der User zur Homepage navigiert, gibt es aktuell keinen sichtbaren Weg zurück zum Ergebnis außer manuell `/ergebnis` in die URL tippen. Ein "Zu deinem Ergebnis"-Button auf der Homepage wenn `store.results` hydriert/vorhanden ist wäre das kleinste Fix. UX, kein Bug.
- **Skills-Items DE-Polish** — Translator-Tag `"v1 — polish pass pending"` steht weiter.
- **Big Five Anni-Daten** — Rückmeldung der Autoren immer noch ausstehend.

**Next steps — Session 17:**
- Eines der vier Kernthemen oben angehen. Mein Vorschlag der Reihenfolge: (1) Layer-4-Lücken schließen oder ausblenden (quick-win), (2) DE-Occupation-Mapping + Education-Kategorien (größerer UX-Impact), (3) Prozent-Anzeige polieren, (4) weitere Scoring-Tuning-Runden mit Archetyp-Personas jetzt wo die Kalibrierung ehrlich ist.

---

### Session 15 – 2026-04-13
**Focus:** Scoring-Validierungs-Infrastruktur + erster konkret gefundener Scoring-Bug. Zwei PRs in dieser Reihenfolge: (1) Per-Result-Explain-Panel mit vollem Faktor-Breakdown — unser Debug-Werkzeug um durch den 4-Layer-fitScore zu tracen; (2) Skills-Match-Formel auf asymmetrisch umgestellt — das Panel hat den Bug sofort sichtbar gemacht.

**Meta / process notes:**
- Planung hat mehrfach den Ansatz geflipped bevor er stand. Ursprüngliches Memory-Briefing war "Offline-Script + Archetyp-Personas + Live-What-if + Tuning". User hat den ersten Schritt komplett zerlegt: *"was bringen die archetypen? wofür das offline debug script bzw was bringt es? zu live what if auch gerne mehr erzählen.. warum dieser rang explain panel (oder als tooltip für jeden der berufsempfehlungen damit man direkt sieht was einfluss darauf hatte?"* Ergebnis: Explain-Panel zuerst (löst beide Zwecke), kein Offline-Script (wäre wegwerfbare Arbeit gewesen, das permanente UI-Feature kann dasselbe), Archetypen erst später bei Bedarf.
- **Tooltip-Variante verworfen**, als User sie vorschlug: kein Hover auf Touch (mobile-first-Anspruch), kein Platz für strukturierte 4-Zeilen-Tabelle + Formel, A11y schwach. Expandable-Panel pro `<li>` mit Chevron stattdessen.
- **Scope-Evolution mid-implementation.** Erste Panel-Version hat Faktoren außerhalb der aktiven View komplett versteckt mit "Ausgeblendet"-Text. User direkt beim ersten Browser-Test: *"fürs debugging sollten wir vielleicht die angezeigten werte komplett drin lassen. weil vielleicht fließen ja die scores auch irgendwie ein, obwohl eigentlich nur interessen ausgewählt ist? das wäre ein bug hinweis."* Richtig gesehen — war tatsächlich ein pre-existing Bug (siehe riasecOnlyRanked unten). Panel wurde auf view-aware-but-transparent umgebaut: alle Faktoren bleiben sichtbar mit ihren Roh-Werten + Farben; nur `inactive`-Zeilen werden gedimmt und mit *"· in dieser Ansicht nicht gewertet"* getagged.
- **Pre-existing-Bug gleich mitgefunden.** Die Refactor-Runde auf viewMode-aware-Formel hat aufgedeckt, dass `riasecOnlyRanked` in ResultsPage den `fitScore` NICHT überschrieben hat (im Gegensatz zu bigfiveRanked/valuesRanked). In "Nur Interessen"-View hat der Top-Row-Indigo-Score also heimlich den full-combined `store.results[i].fitScore` angezeigt, nicht `riasecCorrelation`. Fix in derselben PR: `.map(r => ({ ...r, fitScore: r.riasecCorrelation }))` in den Pipeline-Step eingebaut. Top-Row ist jetzt ehrlich bzgl. der gewählten View.
- **Explain-Panel hat seinen Zweck sofort bewiesen.** Post-Merge hat User mit "alle Skills/Talente/Wissen auf 5" getestet — Panel zeigt: fast überall Skills-Bonus zwischen −0.01 und −0.03, nur Physiker +0.01. Das ergab keinen Sinn für einen maxed-out User. Root-Cause via Panel-Formel-Zeile sofort traceable: symmetrische `sim = 1 − |userNorm − occNorm|` bestraft Überqualifikation gleich stark wie Unterqualifikation. Skills-Fix wurde zur zweiten PR dieser Session.
- **Flaky-Test bewusst verworfen.** Ein Test für den `inactive`-Pfad (mapped-BigFive-Occ in Top-20 mit toggle zurück auf riasec-View) ist vom per-Session-Shuffle abhängig — nur ~63% Wahrscheinlichkeit dass einer der 43 mock-Codes in die Top-20 rutscht. Statt Seeded-Random einzuführen (scope creep) habe ich den Test entfernt; der Pfad ist durch User-Browser-Test abgedeckt.

**PR 1 — `feat/explain-panel` (merged as `4ac95fe`):**

*State:*
- `openExplanations: Ref<Set<string>>` für offen-Panels (Set statt null-ref, damit mehrere Panels gleichzeitig offen sein können). Toggle via `new Set(prev)`-Reassignment, vermeidet Reactivity-Edge-Cases mit Set-Mutations.
- Nur lokaler Component-State — keine Store-Änderung, keine Dexie-Persistenz (Panel-Zustand überlebt Reload nicht; v1 so gewollt).

*Panel-Struktur:*
- `<li>` von `flex items-center justify-between` auf implizit `flex-col` umgebaut: Top-Row (Titel + Score + Chevron) in einen inneren Flex-Container, Expansion-`<div v-if="openExplanations.has(...)">` darunter mit `border-t`.
- Expansion: Header *"Warum dieser Rang?"*, 4-zeilige Tabelle (Label / threshold-Text + optional Inactive-Tag / Farb-Pill), dann Formel-Zeile darunter mit `border-t` separator.
- Chevron: SVG mit `transition-transform`, rotiert 180° wenn offen. `aria-expanded`-Flip + `aria-label` wechselt zwischen *Details einblenden* / *Details ausblenden*.

*Vier Row-States* (`FactorState = 'active' | 'inactive' | 'notScored' | 'noData'`):
- `active` — Layer abgeschlossen UND in der aktiven View → farbige Pill (pos/neg/neutral nach threshold) + Klartext.
- `inactive` — Layer abgeschlossen, aber View liegt drunter im MODE_ORDER → Wert+Farbe bleiben, aber Row ist `opacity-60` gedimmt und hinten dran kursiv `· in dieser Ansicht nicht gewertet`. **Diese Wahl ist der Debug-Move**: wenn die Formel-RHS (= nur aktive Terme) nicht mit dem Top-Row-Score übereinstimmt, ist irgendwo ein Bug.
- `notScored` — Layer nicht durchgemacht → graue Pill `–` + *Noch nicht erfasst*.
- `noData` — Layer durchgemacht, aber dieser Beruf hat keine Daten (z.B. Berufe außerhalb der 43 Big-Five-Mock-Codes) → graue Pill `–` + *Keine Daten für diesen Beruf*.

*Threshold-Tuning:*
- `stageForSkills` stages by `skillsMatch` (nicht `skillsBonus`) damit near-zero Boni wirklich als neutral gelesen werden. Original hatte `-0.02` Bonus rot gefärbt, obwohl das effektiv nichts drückt. Neue Moderate-Band 0.4–0.7 → match 0.46 (bonus ≈ −0.02) kommt in neutral/grey.
- `stageForValues` weak-Grenze von 0.15 auf 0.10 vorgezogen → `−0.12` penalty wird jetzt rot (vorher grau, Wahrnehmung war inkonsistent mit `−0.17 = rot`).
- `stageForRiasec`, `stageForBigFive`: auch leicht enger gezogen damit die Farbsprache über alle 4 Faktoren hinweg einheitlich wirkt.

*Pre-existing-Bug-Fix mit drin:*
- `riasecOnlyRanked` hatte keinen fitScore-Override. Die zweite `.map((r, i) => ({ ...r, rank: i + 1 }))` hat Rank gesetzt, aber `fitScore` blieb der kombinierte Wert aus `store.results`. → In "Nur Interessen" wurde der volle Combined-Score als "Interessen-Score" getarnt angezeigt. Jetzt erster Map-Step `{ ...r, fitScore: r.riasecCorrelation }` davor → Top-Row passt zur Selection.

*View-aware Formel:*
- `scoreFormula(result, mode)` baut Terme nur für Faktoren die im aktuellen Modus aktiv sind und berechnet die RHS aus denselben Termen. Mit dem riasecOnlyRanked-Fix matcht die RHS das Top-Row-Score in jeder View exakt.

*i18n:*
- Neuer Top-Level-Block `explainPanel` mit `title`, `toggle.{open,close}`, `factors.{riasec,bigfive,values,skills}`, `notScored`, `noData`, `inactiveTag`, und `thresholds.{riasec,bigfive,values,skills}.{strong,moderate,weak,poor}` — vier Klartext-Sätze pro Faktor.

*Tests (+5):* 196 → 202
- Toggle-Button existiert pro visible Result, Default zu, Click öffnet, 2× Click schließt, mehrere Panels concurrent, un-scored Layer zeigen 3× "Noch nicht erfasst" wenn nur RIASEC komplett ist, Formel-RHS = `first.fitScore.toFixed(2)`.

**PR 2 — `fix/skills-match-asymmetric` (diese PR):**

*Core-Fix:*
- In `computeSkillsMatch` (matcher.ts:104): `sim = 1 - Math.abs(userNorm - occNorm)` → `sim = 1 - Math.max(0, occNorm - userNorm)`. Einzige algorithmische Zeile geändert.
- Semantik: `userNorm >= occNorm` (Anforderung erfüllt oder übertroffen) → `sim = 1` ("du qualifizierst dich"). `userNorm < occNorm` → linear proportional zum Shortfall — identisch zum alten symmetrischen Fall, d.h. Undershooting-Verhalten unverändert.
- JSDoc erweitert um die Begründung: symmetrische Formel hat Overqualifikation mit `|Δ|` bestraft, hat skillsMatch für Hoch-Skill-User Richtung gewichteter Berufs-Level-Durchschnitt (~0.4-0.6 normalisiert) gezogen. Ergebnis war "maxed-out User bekommt fast überall bonus ≈ 0".

*Display-Cap (in derselben PR gebündelt):*
- Neuer Helper `displayFitScore(v) = Math.min(v, 1)` in ResultsPage.vue.
- Top-Row-Indigo-Score und scoreDelta verwenden ihn — Anzeige bleibt in 0-100 auch wenn der rohe `fitScore` nach Skills-Bonus bis 1.25 steigen kann.
- **Formel-Zeile im Panel bleibt ungecapped** → zeigt die Wahrheit (z.B. `= 1.24`) auch wenn Top-Row `100` zeigt. Bewusste Design-Entscheidung: Top-Row ist User-facing, Panel-Formel ist Debug-View.

*Tests (+3):* 202 → 205
- `does NOT penalize overqualification` — Low-Requirement-Job (l=2/7) + maxed-user (value=5) → `skillsMatch === 1`, `skillsBonus === 0.25`. Haupt-Regression-Test für das Bug-Szenario.
- `matches perfectly when user is exactly at occupation level` — user=5 vs occ-l=7 → `skillsMatch === 1` (meet-or-exceed).
- `penalizes shortfall proportionally when user is below occupation level` — user=1 vs occ-l=7 → `skillsMatch === 0`, `skillsBonus === −0.25`. Bestätigt dass der Undershooting-Pfad unverändert bleibt.
- Bestehende 5 Skills-Tests laufen durch: Undershooting-Assertions unbeeinflusst; Matching-Tests produzieren jetzt Skills-Matches ≈ 1.0 statt ≈ 0.8, aber die `> 0.6`-Grenzen halten.

**Branches:**
- `feat/explain-panel` — PR 1 (merged)
- `fix/skills-match-asymmetric` — PR 2 (diese PR)

**Offene Beobachtungen / TODOs:**
- **Baseline-Shift im Skills-Bonus.** All-1er-Gegenprobe zeigt: ungelernte User bekommen bei durchschnittlich-komplexen Berufen noch `+0.01` bis `+0.03` Bonus (z.B. Anthropologe `+0.02`, Geograf `+0.03`). Ursache: `bonus = (match − 0.5) × α` hat einen Baseline bei 0.5, aber der tatsächliche gewichtete Mittelwert von occNorm liegt bei ~0.43-0.48 (typische O*NET-Level 3/7). Saubere Fixes: (a) per-Beruf Baseline aus gewichtetem occNorm rechnen, oder (b) globalen Shift auf z.B. 0.3. Eigene Mini-PR wenn wir das angehen.
- **Score-Delta-Baseline ist kontextlos.** In jeder View wird Delta gegen raw `riasecCorrelation` gerechnet, nicht gegen den Score der vorherigen View. Heißt: User klickt "+ Werte" und sieht `−18`, meint aber gegenüber dem 88-Bigfive-Score würde das nur `−2` sein. UX-Frage, kein Bug — ein Label wie *"vs. Nur Interessen"* neben dem Delta würde Klarheit schaffen.
- **Scoring-Validierungs-Sitzung selbst noch offen.** Die Infrastruktur steht, aber eigentliches Tuning (SKILLS_ALPHA, BIG_FIVE_ALPHA, VALUES_DIMENSION_WEIGHT, evtl. Baseline-Shift) ist noch nicht durchgearbeitet.
- **Flaky-inactive-Pfad-Test.** Siehe Meta-Notes oben; User-Browser-Test deckt das ab. Falls das irgendwann als dauerhaft getesteter Pfad gebraucht wird, müsste ein Seeded-Random dazu.
- **Anni et al. real Big Five Daten** — weiterhin ausstehend bei den Autoren.
- **DE-Polish der 120 Skills-Items** — Translator-Tag `"v1 — polish pass pending"` steht noch.

**Next steps — Session 16:**
- Baseline-Shift im Skills-Bonus (all-zero-User sollte nirgendwo positiven Bonus bekommen).
- Score-Delta Baseline-Labeling oder Umstellung auf Inkremental-Deltas.
- Weitere Tuning-Runden an SKILLS_ALPHA / BIG_FIVE_ALPHA / VALUES_DIMENSION_WEIGHT mit Archetyp-Personas, jetzt wo das Panel die Zahlen direkt ablesbar macht.

---

### Session 14 – 2026-04-12
**Focus:** Layer 4 — Fähigkeiten, Talente & Wissen. 120 O*NET items across 3 sub-categories, additive-centered score bonus, Zwischenscreen between sub-categories, 4-position results toggle.

**Meta / process notes:**
- Scope pivot mid-planning: started planning scoring-validation session first, but user flipped to "ship Layer 4 first, validate all 4 layers together next session" — better to add the last signal before tuning weights than to tune twice.
- Translation strategy: manual first-pass DE for all 120 labels + descriptions, delegated to sub-agent with explicit fidelity rules (EN verbatim from O*NET Content Model Reference, DE idiomatic paraphrase, short psychometric-register labels). Marked in `skills-items.json` as `translator: "claude-manual, v1 (2026-04-12) — polish pass pending"` since no official DE O*NET translation exists (unlike IPIP-50 which had Fritz Ostendorf's published set).
- **Scoring design call: centered bonus ±0.25 (not additive-positive).** PROJECT_PLAN.md originally said "additive: high match → bonus, low match → no effect, annotation". User agreed with centered variant: pure positive would lift all occupations equally and not differentiate ranking, while centered lets mismatched skills actively dampen. PROJECT_PLAN.md §Layer 4 updated in the same PR to reflect the decision. Magnitude locked at 0.25 for v1; explicit follow-up in next session to validate by playing with the values-picker and comparing rankings to intuition.
- **Perf regression found + fixed in the same PR.** With full Layer 4 data, each occupation now carries 120 skill-items — and the store was persisting all 923 `results` with embedded full occupation objects on every Likert click. Mid-test: the final RIASEC-answer navigation broke a 5s vi.waitFor in `AssessmentPage.test.ts` because `persist()` was serializing ~7MB per answer. Added `trimResultsForPersist()` which slices to top-20 and strips `skills/abilities/knowledge/workContext` from each embedded occupation. Dexie row drops from multi-MB back to <30KB. `hydrate()` was never reading `results` back anyway — the live app always recomputes from the lazy `occupations` chunk — so the trim is purely an archive-size optimization, not a behavior change.

**What was done — `feat/layer-skills-talents-knowledge`:**

*Data pipeline (`scripts/build-onet-data.mjs`):*
- Reads `Skills.txt`, `Abilities.txt`, `Knowledge.txt` in addition to the existing sources. `parseLayer4Source()` helper merges the two rows per element (IM = Importance, LV = Level) into a single `{ l, i }` entry per O*NET Element ID, keyed by occupation. Short keys to save ~1.5 MB on the JSON (120 items × 923 occupations × 2 floats = lots of keys).
- Build output: 879/923 occupations have skills/abilities/knowledge data (the same 44 that lack workContext — low-density/bright-outlook occupations).
- Full rebuild: `onet-occupations.json` grew ~653 KB → 7.7 MB raw, **657 KB gzipped** on the wire. Minified JS chunk: 3.78 MB. Acceptable for a lazy-loaded chunk on `/ergebnis`.

*Items data (`src/data/skills-items.json`):*
- 120 items: 35 Skills (2.A.* + 2.B.*), 52 Abilities (1.A.*.* leaves), 33 Knowledge (2.C.* leaves).
- Each item: `id` (`sk-{subCategory}-{onetElementId}`), `layer: 'skills'`, `subCategory`, `onetElementId`, `text` (en+de label), `description` (en+de concept description). EN fields copied verbatim from `Content Model Reference.txt`; DE hand-translated (v1).
- Translation judgment calls worth revisiting in a polish pass: "Monitoring" → "Leistungsbeobachtung" (O*NET scope is performance assessment, not generic Überwachung); "Speed/Flexibility of Closure" → "Wahrnehmungsintegration"/"Gestalterkennung" (no clean German Gestalt-psych term); "Rate Control" → "Bewegungsantizipation"; "Administration and Management" → "Unternehmensführung" (cleaner than literal); "Design" → "Konstruktion und Design" (pure "Design" leans graphic in German; O*NET means technical drafting); "Fine Arts" → "Bildende und darstellende Künste" (O*NET bundles music/dance/drama/visual).

*Types:*
- `SkillsSubCategory = 'skills' | 'abilities' | 'knowledge'` in `question/model/types.ts`.
- `Question` extended with optional `subCategory`, `onetElementId`, `description` fields (non-breaking for other layers).
- `OccupationSkillEntry = { l: number; i: number }` + `OccupationSkillMap` in `occupation/model/types.ts`; `Occupation` extended with optional `skills`/`abilities`/`knowledge` maps.
- `MatchResult` extended with required `skillsMatch: number | null` + `skillsBonus: number | null` fields.
- `AssessmentLayer` union gains `'skills'`.
- `AssessmentSession` extended with optional `skillsAnswers`, `skillsOrder`, `skillsInterstitialPending`.

*Scoring (`src/features/scoring/lib/skills.ts` + 17 unit tests):*
- `SkillsProfile` = `{ skills: Record<elementId, value>; abilities: ...; knowledge: ... }` — grouped by sub-category, keyed by O*NET Element ID (same keying as occupation skill maps so the matcher can do a direct join).
- `computeSkillsProfile()` drops non-skills-layer answers and items missing `subCategory`/`onetElementId`.
- `subCategoryAverages()` + `averageToPercent()` feed the three aggregate bars on ResultsPage.
- `totalAnswers()` sums across sub-cats for progress/completion math.

*Matcher (`src/features/matching/lib/matcher.ts` + 8 integration tests):*
- `computeSkillsMatch(userSkills, occupation)` iterates the 3 sub-categories, joins on Element ID, computes `sim_i = 1 − |userNorm − occLevelNorm|` weighted by `occ.importance`, returns `Σ sim × weight / Σ weight ∈ [0, 1]`. Skips items the user hasn't rated or the occupation doesn't list. Returns `null` when no overlap exists (e.g., no skills data on occupation).
- `skillsBonus = (skillsMatch − 0.5) × SKILLS_ALPHA` with `SKILLS_ALPHA = 0.5`, yielding range `[−0.25, +0.25]`.
- `matchOccupations` gains optional `userSkills?: SkillsProfile | null` parameter. Fully backward-compatible — existing RIASEC-only/RIASEC+BF/RIASEC+BF+Values call sites unchanged. Final `fitScore = min(riasecCorrelation × bigFiveModifier, 1) − valuesPenalty + skillsBonus`.

*Store (`src/features/questionnaire/model/store.ts` + 13 new tests):*
- Skills items JSON loader synthesizes `dimension = subCategory` + `scale = 'likert5'` at load time so Question keeps a uniform required-fields shape across all layers.
- Source order = [shuffled 35 skills] + [shuffled 52 abilities] + [shuffled 33 knowledge], reshuffled independently per sub-category so the 3 sub-sequences stay sequential in the UI. `buildSkillsOrder()` helper.
- New state: `skillsAnswers`, `skillsCurrentIndex`, `skillsOrder`, `skillsInterstitialPending`.
- New computeds: `skillsQuestions`, `skillsTotal` (120), `skillsIsComplete`, `skillsProgress`, `skillsProfile`, `skillsCurrentSubCategory` (derived from flat index), `skillsSubCategoryIndex` (local 0-based inside current sub-cat for "12/35" display), `skillsSubCategoryTotal`, `skillsPendingNextSubCategory` (Zwischenscreen-target inference).
- Layer-aware aliases (`answers`, `questions`, `total`, `currentIndex`, `currentQuestion`, `isComplete`, `progress`) extended to the 4th layer.
- New action `answerSkillsQuestion(value)` records + advances, but at boundary indices (34 = last skill, 86 = last ability) flips `skillsInterstitialPending = true` and keeps index put. `dismissSkillsInterstitial()` clears the flag and advances past the boundary. `previous()` on an interstitial clears the flag without changing index (user can revise their last answer before committing to the transition).
- `startSkillsLayer()` + `repeatLayer('skills')` + `resetCurrentLayer()` + `reset()` all extended.
- `persist()` snapshots skills state + interstitial flag to Dexie. `hydrate()` has interstitial-aware resume: if `skillsInterstitialPending` was true on save, user lands back ON the boundary question (index = answers.length − 1) instead of one past it.
- `results` computed passes `skillsProfile` to the matcher when `skillsIsComplete`.
- `trimResultsForPersist()` strips bulky occupation fields and caps to top 20 before Dexie write (perf fix).

*AssessmentPage (`src/pages/assessment/AssessmentPage.vue`):*
- Layer label: *"Schicht 4 · Fähigkeiten, Talente & Wissen"*; sub-line shows *"Fähigkeiten (12/35)"* / *"Talente (3/52)"* / *"Wissen (10/33)"* instead of generic "Frage X von Y" for Layer 4.
- Per-sub-category prompt + Likert labels (different semantics — *"Wie gut beherrschst du das?"* / *"Wie stark ausgeprägt?"* / *"Wie viel Wissen?"* with matching scales Gar nicht→Experte / Sehr schwach→Sehr stark / Kein Wissen→Expertenwissen).
- Skills items render an optional `description` line in smaller slate-400 text below the label, so unfamiliar terms ("Kategorienflexibilität", "Bewegungsantizipation") are self-explanatory without a hover.
- **Zwischenscreen** — between `v-if="store.currentQuestion"` and the question card, a new `v-if="store.skillsInterstitialPending"` block with indigo-tinted border, "Sehr gut!" eyebrow, "{ sub-cat } abgeschlossen" headline, "Du hast alle N Fragen zu … beantwortet", then an "Als nächstes"-divider with the upcoming sub-cat's count + description, and Zurück / Weiter buttons. Weiter calls `dismissSkillsInterstitial()`; Zurück calls `store.previous()` which clears the flag.

*ResultsPage (`src/pages/results/ResultsPage.vue`):*
- `ViewMode` union extended to 4 values; `toggleOptions` appends `+ Fähigkeiten` when `skillsIsComplete`; `MODE_ORDER` drives the progressive-highlight logic.
- New `valuesRanked` computed — derives "up to values" ranking even when skills is also complete (strips `skillsBonus` from `store.results`). Symmetric with existing `riasecOnlyRanked` and `bigfiveRanked`.
- `activeResults` switch adds 'skills' case → returns `store.results` (= full-combined ranking with skills bonus applied).
- `scoreDelta` extended to include `skillsBonus` in the "no contribution → null" short-circuit.
- `hardFilteredCount` display extended to also apply in 'skills' view (hard-filter is part of the pipeline from values onwards; the 'skills' toggle is above values, so the filter is still in effect).
- **Skills block** after the Values block: *"Deine Fähigkeiten, Talente & Wissen"* with 3 indigo progress bars (sub-category averages on 1-5 → percent via `averageToPercent`) and per-sub-cat description. "Fähigkeiten-Test wiederholen" repeat-link.
- **Skills CTA** shown when `valuesIsComplete && !skillsIsComplete`: *"Fähigkeiten ergänzen"*, calls `refineWithSkills()` → `startSkillsLayer()` + router.push('/test').
- Subtitle line on the Top-Empfehlungen header gains a 'skills' branch: *"Gewichtet nach RIASEC, Persönlichkeit, Werten und deinen Fähigkeiten."*

*HomePage:*
- Layer 4 card no longer `opacity-60` muted; description updated from "folgt in Phase 2" to "Selbsteinschätzung – Fähigkeiten, Talente & Wissen (O*NET)".
- Banner copy updated to reflect the new scope (adds "Fähigkeiten-Schicht mit 120 Items (35 Fähigkeiten + 52 Talente + 33 Wissensgebiete)").

*i18n (`src/shared/lib/i18n.ts`):*
- New top-level keys `skillsSubCategory`, `skillsSubCategoryDescription`, `skillsSubCategoryCountText`, `skillsInterstitial.{done,nextHeader,continue}`.
- Nested `questionPrompt.skills.{skills,abilities,knowledge}` and `likert.skills.{skills,abilities,knowledge}.{1..5}` — different semantics per sub-cat means different label sets.

*Other:*
- `docs/PROJECT_PLAN.md` §Layer 4 block rewritten to reflect the centered-bonus decision (was additive-only).
- `vite.config.ts` bumps `testTimeout` to 15 000 ms. Dynamic-import of the 7 MB `onet-occupations.json` + matcher work for 923 occupations with Layer 4 data occasionally brushed against the default 5 s under vitest's transform overhead. Not a production concern (the app's matcher runs in a ref + computed reactive loop, not in a test environment).

**Tests: 184 → 196 (+12)**
- `skills.test.ts`: 10 tests (compute grouped by sub-cat, ignores non-skills-layer, skips broken items, sub-cat averages, percent conversion, totalAnswers, canonical sub-cat order).
- `matcher.test.ts`: +7 tests for skills block (match null-null contract, positive/negative bonus, bonus applied to fitScore, re-rank on same-RIASEC, ignore extras, range ±0.25).
- `store.test.ts`: +12 tests in a new Layer 4 describe block (sub-cat indicator, answer-advances-within, boundary-sets-pending, dismiss-advances, second boundary for knowledge, previous on interstitial, complete flow, reset-clears-flag, repeatLayer, persist/hydrate round-trip with interstitial-aware resume, results include skillsMatch).
- `matcher.integration.test.ts` + `db.test.ts` fixtures updated for the two new MatchResult fields (skillsMatch, skillsBonus).

**Browser test flow (confirmed by user):**
- HomePage: Layer 4 card active, banner lists 120 items. ✓
- ResultsPage (post-Values): "Fähigkeiten ergänzen" CTA renders. ✓
- /test: sub-cat indicator, per-cat prompt + Likert labels, description under label. ✓
- Zwischenscreen after 35 skills: headline, "Als nächstes" preview, Weiter advances into Talente. ✓
- Zwischenscreen after 52 abilities: transitions into Wissen. ✓
- Post-completion: skills block with 3 aggregate bars, toggle has 4 positions, "+ Fähigkeiten" re-ranks live, repeat-link works.

**Branches:**
- `feat/layer-skills-talents-knowledge` — this PR.

**Known issues / TODOs:**
- **Scoring validation is the explicit next session's focus.** The SKILLS_ALPHA = 0.5 (bonus range ±0.25) and the equal-weight-per-importance summation were reasonable defaults, not validated numbers. With all 4 layers live it is now possible to trace any ranking end-to-end and see whether the combined math matches intuition. User's explicit call: "es gibt definitiv noch bedarf für die gewichtung und alles, sollten wir nächste session direkt angehen."
- **Per-sub-category score-delta breakdown** (why did Layer 4 push this occupation up/down by X?). Would use an expandable "Warum dieser Rang?" panel; deferred until validation surfaces concrete questions worth answering.
- **Interactive skills-cards on ResultsPage** (live-adjust skill ratings like the values-picker from Session 13) — deferred until validation shows it's needed.
- **"Entwicklungsbedarf"-Annotation per occupation** — deferred to a later session per user call.
- **DE translations are v1.** 120 hand-translated labels + descriptions; translator tag marks polish-pass as pending. A few judgment calls (Monitoring → Leistungsbeobachtung, Speed of Closure → Wahrnehmungsintegration, Rate Control → Bewegungsantizipation) should be reviewed by a German-fluent user with O*NET domain familiarity.
- **44 occupations without skills/abilities/knowledge** — same 44 that lack workContext. Matcher returns `skillsMatch: null` for those; fitScore just skips the bonus.
- **Anni et al. real Big Five data** still pending author reply.

**Next steps — Session 15:**
- Scoring validation against hand-crafted archetype personas (Software-Dev, Sozialarbeiter, Handwerker, Unternehmer, Künstler). Trace full ranking math, compare to intuition. Tune weights: SKILLS_ALPHA, BIG_FIVE_ALPHA, VALUES_DIMENSION_WEIGHT. Possibly add per-result score-delta explain panels to make tracing easier.
- Polish pass on the 120 DE translations once 1-2 users have test-driven the Layer 4 flow.

---

### Session 13 – 2026-04-12
**Focus:** Layer-Wiederholung ohne Full-Reset + interaktive Werte-Cards im Ergebnis für direktes "Was-wäre-wenn"-Testen.

**What was done — `feat/layer-repeat-and-values-picker`:**

*Store:*
- `repeatLayer(layer)` — atomar: setzt `currentLayer` + ruft `resetCurrentLayer()`. Kombiniert die zwei Schritte, damit UI-Aufrufer sie nicht einzeln aufrufen können (und damit die AssessmentPage-Guard-Invariante brechen).
- `updateValuesAnswer(questionId, value)` — mutiert eine einzelne Values-Antwort in-place. `valuesProfile` + `results` computeds rechnen automatisch nach, Persist-Watcher schreibt nach Dexie.

*AssessmentPage guard fix (`src/pages/assessment/AssessmentPage.vue:22`):*
- `if (store.isComplete) store.reset()` → `if (store.isComplete) store.resetCurrentLayer()`.
- Ursprünglicher Guard stammt aus Zeit, als nur RIASEC existierte — `reset()` und Layer-Reset waren identisch. Mit 3 Layern löschte der alte Guard beim Wiedereinstieg in `/test` alle Layer. Jetzt wird nur der aktive Layer geleert.
- Alle bestehenden Flows analysiert: Fresh-Start, Mid-Layer-Resume, Verfeinern-CTA, Repeat-Flow — alle verhalten sich korrekt.

*ResultsPage — Repeat-Links:*
- Jeder abgeschlossene Layer-Block (RIASEC, Big Five, Werte) ist in einen eigenen Container mit `rounded-xl border border-slate-700/60 bg-slate-900/50 p-6` gewrappt — visuell klar als eigenständige Sektion erkennbar.
- Dezenter "wiederholen"-Link unten rechts in jedem Block: "Interessen-Test wiederholen", "Persönlichkeitstest wiederholen", "Werte-Test wiederholen".

*ResultsPage — interaktive Values-Cards:*
- Iteration 1 (verworfen): Alle 5 Optionen als Pills nebeneinander — zu viel visueller Lärm.
- Iteration 2 (final): Card zeigt nur den gewählten Wert mit `▾`-Indikator. Klick öffnet Dropdown unter der Card, Auswahl schließt ihn und übernimmt sofort den neuen Wert.
- Klick außerhalb des Grids schließt den offenen Dropdown (document-level click listener, sauber via `onMounted`/`onBeforeUnmount` registriert).
- Nur ein Dropdown gleichzeitig offen.
- Berufsranking rechnet live nach — Edu-Wert runter/hoch ändert auch den Hard-Filter-Count.
- Use case: schnelles "was wäre wenn" ohne 8 Fragen neu zu beantworten; hilft beim Kalibrieren des Values-Scoring.

**Tests: 159 → 166 (+7)**
- `store.test.ts`: 3 neue Tests für `repeatLayer` (bigfive/riasec/values — jeweils clears target, preserves others, keeps sessionId)
- `AssessmentPage.test.ts`: Guard-Regressions-Test aktualisiert — `sessionId` bleibt jetzt erhalten (war vorher: wird neu gerollt)
- `ResultsPage.test.ts`: 4 neue Tests für Repeat-Buttons (Sichtbarkeit pro Layer + Click löst repeatLayer + Navigation)

**Branches:**
- `feat/layer-repeat-and-values-picker` — diese PR

**Known issues / TODOs:**
- `updateValuesAnswer` hat keinen eigenen Unit-Test — die Wirkung wurde per Browser-Test validiert. Wenn der Code mal komplexer wird (z.B. Validierung, Cross-Layer-Effekte), sollte ein Test nachgezogen werden.
- Die interaktiven Cards gibt es aktuell nur für den Values-Layer. RIASEC und Big Five haben keine vergleichbare "Live-Anpassung" — bewusst, da deren Antworten aggregiert in Profile einfließen und eine Einzelanpassung semantisch weniger aussagekräftig wäre.
- Layer 4 (Fähigkeiten) + Scoring-Validierung bleiben auf der Roadmap.

**Next steps — Session 14:**
- Layer 4: Skills self-assessment
- Post-Layer-4: Scoring-Validierung anhand bekannter Berufe

---

### Session 12 – 2026-04-12
**Focus:** Layer 3 — Werte & Rahmenbedingungen (values & preferences). Hard filters + soft penalties backed by real O*NET data.

**What was done — `feat/values-layer` (this PR):**

*Data pipeline:*
- Extended `scripts/build-onet-data.mjs` to read `Job Zones.txt` and `Work Context.txt` (already in `data-raw/`). Adds `jobZone` (1-5) and `workContext` (9 CX-scale floats) per occupation. Coverage: 923/923 jobZone, 879/923 workContext.
- Re-ran `build-esco-german.mjs` to preserve German titles on the enriched JSON. Output: `onet-occupations.json` grew ~600KB → ~653KB.

*Values items:*
- `src/data/values-items.json` — 8 custom questions, each mapping 1:1 to an O*NET occupation attribute. Every question carries per-question `labels` (DE+EN) instead of shared layer-level Likert labels.
- Dimensions: education (hard filter via jobZone), environment (indoor/outdoor composite), social interaction, teamwork, physical demands, autonomy, public contact, routine/variety.
- All items backed by real O*NET data. Dimensions without data backing (income/meaning, security/freedom, mobility from PROJECT_PLAN.md) explicitly deferred.

*Types:*
- `ValuesDimension` union type (8 members), `ValuesProfile = Record<ValuesDimension, number>`.
- `WorkContext` interface on `Occupation` (9 O*NET CX-scale fields).
- `Question` extended with optional `labels` and `filterType` fields.
- `AssessmentLayer` extended to `'riasec' | 'bigfive' | 'values'`.
- `MatchResult` extended with `valuesPenalty: number | null`.
- `AssessmentSession` extended with `valuesAnswers`, `valuesOrder`, `valuesProfile`.

*Scoring:*
- `src/features/scoring/lib/values.ts` — trivial: each dimension has exactly 1 question, so profile = raw 1-5 answers. Missing dimensions default to 3 (neutral).

*Matcher:*
- **Hard filter**: occupations where `jobZone > userValues.education` are eliminated before scoring. Education=1 filters ~892/923 occupations.
- **Soft penalties**: 7 dimensions, each `|userNorm - occNorm| × 0.05` weight. Max total ~0.35. Special handling: environment is a composite of indoor/outdoor, physicalDemands averages standing+walking, routine is inverted.
- Combined: `fitScore = min(riasecCorrelation × bigFiveModifier, 1) − valuesPenalty`.

*Store:*
- Full values layer state: `valuesAnswers`, `valuesCurrentIndex`, `valuesOrder`, `valuesQuestions`, `valuesTotal`, `valuesIsComplete`, `valuesProgress`, `valuesProfile` — following the exact Big Five pattern.
- Layer-aware aliases extended from 2-way to 3-way switch.
- `startValuesLayer()`, `resetCurrentLayer()` for values, `reset()` clears all 3 layers.
- Persist/hydrate includes values state. Watch includes `valuesAnswers`/`valuesCurrentIndex`.
- Exposed `totalOccupations` computed for hard-filter count display.

*AssessmentPage:*
- Per-question labels: `likertLabels` computed reads `currentQuestion.labels.de` when available, falls back to layer-level i18n.
- No question prompt for values layer (question text IS the prompt).
- Layer indicator: "Schicht 3 · Werte & Rahmenbedingungen".

*ResultsPage — 3-position progressive toggle:*
- Three view modes: "Nur Interessen" (RIASEC only) | "+ Persönlichkeit" (RIASEC + Big Five) | "+ Werte" (all layers including hard filter).
- **Progressive highlight**: clicking "+ Werte" colors all 3 buttons blue; clicking "+ Persönlichkeit" colors 2 blue. Visual shows which layers are active.
- Toggle positions available only for completed layers.
- Subtitle changes per position; score deltas relative to RIASEC baseline.

*ResultsPage — values profile + hard-filter count:*
- "Deine Werte & Rahmenbedingungen" section: 8 labeled cards showing the user's chosen answer per dimension.
- "X Berufe aufgrund deiner Ausbildungspräferenz ausgeblendet" text below the toggle (only in "+ Werte" view, only when occupations were actually filtered).
- Values CTA ("Weiter verfeinern") appears after Big Five completion, before values is started.

*HomePage:*
- Layer 3 card activated (no longer grayed out), text updated.
- Prototype banner updated to mention "Werte-Schicht mit 8 Items".

*Mid-session UX iterations (user feedback → shipped in same commit):*
- **3-position toggle instead of binary**: user wanted one toggle per layer, not a combined "all or nothing" switch.
- **Progressive blue highlight**: user wanted all layers up to and including the selected view to be colored, not just the active button.
- **Hard-filter count bug fix**: `riasecOnlyRanked` was derived from the already-filtered `store.results`, so the difference was always 0. Fixed by comparing against `store.totalOccupations`.

**Tests: 138 → 159 (+21)**
- `values.test.ts`: 5 tests (profile computation, dimension mapping, neutral defaults, non-values ignore, all 8 dimensions present)
- `matcher.test.ts`: +9 tests (hard filter eliminates, keeps no-jobZone, soft penalties reduce, null compat, perfect match near-zero penalty, max penalty range, values re-rank, combined BF+values)
- `store.test.ts`: +7 tests (values defaults, startValuesLayer, layer-isolated answer, completion, resetCurrentLayer, reset clears all, persist/hydrate round-trip, results include valuesPenalty)
- `ResultsPage.test.ts`: subtitle assertion updated for new toggle text
- `db.test.ts`: fixture updated for valuesPenalty field

**Branches:**
- `feat/values-layer` — this PR

**Known issues / TODOs:**
- **"Einzelne Schichten wiederholen" feature** — users need to re-run specific layers without full restart. Top priority for Session 13.
- **Scoring validation** — values changes look partially but not universally logical. After Layer 4, dedicate sessions to tracing the combined scoring math against known occupations.
- **44 occupations without workContext** — 879/923 have Work Context data; the 44 without get 0 soft penalty (treated as neutral). Minor, all have jobZone.
- **Dimensions without O*NET backing** — income/meaning, security/freedom, mobility from PROJECT_PLAN.md deferred. Can be added when external data is sourced or heuristics designed.
- **Anni et al. real Big Five data** — still pending author reply.
- **Layer 4: Fähigkeiten-Selbsteinschätzung** — next depth layer per PROJECT_PLAN.md.

**Next steps — Session 13:**
- "Einzelne Schichten wiederholen" feature (user's explicit top priority)
- Layer 4: Skills self-assessment (if time)
- Post-Layer-4: scoring validation sessions

---

### Session 11 – 2026-04-12
**Focus:** Big Five re-ranking (PR B) — make Big Five actually affect the occupation ranking, not just display a profile.

**What was done — `feat/bigfive-reranking` (PR #29):**

*Matcher extension:*
- `matchOccupations()` gains optional `userBigFive` + `occBigFiveProfiles` params. When both present, each mapped occupation gets a modifier: `1 + 0.3 × pearson(userBigFive, occBigFive)`, range [0.7, 1.3]. `fitScore = riasecCorrelation × modifier`, capped at 1.0.
- `MatchResult` extended with `riasecCorrelation` (raw Pearson, always present) and `bigFiveModifier` (null for unmapped occupations). Existing RIASEC-only call sites are backward-compatible.
- Pearson chosen over cosine because T-scores cluster around mean=50 — cosine would give ~0.99 for all pairs, hiding the signal. Pearson mean-centers, extracting the pattern of relative highs/lows.

*Mock occupation Big Five data:*
- `src/data/bigfive-occupation-profiles.json` — 43 O*NET codes from 15 ISCO-08 groups (extracted from direct ISCO entries in the ESCO crosswalk CSV). Hand-crafted T-scores with intentional personality contrasts (e.g. Software Dev = high O low E, PR Specialist = high E, Potters = high O low E low C).
- Schema mirrors Anni et al. (2024) exactly. Real data swaps in as a JSON-only change (zero code modifications) after author approval. `meta.mock = true` flag marks the file as placeholder.

*Store integration:*
- Lazy-load `bigfive-occupation-profiles.json` via `loadBigFiveProfiles()` (same pattern as occupations). Called from AssessmentPage + ResultsPage onMounted.
- `results` computed passes Big Five profile + occupation profiles to matcher when `bigfiveIsComplete`, reactively re-sorting when Big Five completion flips.

*ResultsPage UI — toggle + score deltas:*
- **Toggle pill switch** ("Nur Interessen" / "+ Persönlichkeit") appears after Big Five completion. Switches between RIASEC-only ranking (sorted by `riasecCorrelation`) and combined ranking (sorted by `fitScore`). Both computed from the same result set — no re-fetch.
- **Score-delta badges**: green "+7" / red "-3" next to each occupation's score, showing the point difference between RIASEC-only and combined score. Only visible in combined view for mapped occupations.
- Subtitle text toggles: "Berechnet via Pearson-Korrelation..." vs "Gewichtet nach RIASEC-Korrelation und Persönlichkeitsprofil."

*Mid-session UX iterations (user feedback → shipped in same commit):*
- **Score cap at 1.0**: `riasecCorrelation × modifier` could exceed 1.0 (e.g. 0.95 × 1.1 = 1.045). Capped in matcher: `Math.min(riasecCorrelation * bigFiveModifier, 1)`.
- **Score delta instead of rank change**: original badges showed rank position change (↑5, ↓3) which looked like score changes next to the score number. Switched to actual score point difference — clearer and less ambiguous.
- **Toggle instead of one-way progression**: user couldn't compare before/after because completing Big Five was a one-way street. The toggle lets users freely switch between views.

**Tests: 134 → 138 (+4)**
- `matcher.test.ts`: +7 tests (riasecCorrelation populated, Big Five boost/dampen/unmapped/range/re-rank/null-compat)
- `matcher.integration.test.ts`: updated bounds check for new MatchResult fields
- `store.test.ts`: +2 tests (riasecCorrelation-only when no Big Five, results re-rank on Big Five completion)
- `ResultsPage.test.ts`: +2 tests (RIASEC-only subtitle, combined subtitle + toggle buttons)
- `db.test.ts`: updated MatchResult fixture

**Branches:**
- `feat/bigfive-reranking` — this PR

**Known issues / TODOs:**
- **Anni et al. real data**: 263 ISCO-08 groups with empirical T-scores. Author approval pending. Build script `scripts/build-bigfive-profiles.mjs` needed for ISCO→O*NET mapping at scale (ESCO API for the ~860 O*NET codes without direct ISCO crosswalk entries).
- **Coverage**: only 43/923 occupations have Big Five profiles with mock data. Most occupations show no delta badge. Real data will cover ~263 ISCO groups → significantly more O*NET codes.
- **Translation polish** of 50 IPIP items (deferred from Session 10).
- **PROJECT_PLAN.md label fix**: still reads "BFI-2-S", should say "IPIP Big Five Factor Markers, 50 items (Goldberg 1992)".

**Next steps — Session 12:**
- Build script for real Anni data (if approval received)
- Layer 3: Werte & Rahmenbedingungen (values/preferences)
- Translation polish pass on Big Five items

---

### Session 10 – 2026-04-12
**Focus:** Phase 2 / Layer 2 kickoff — Big Five foundation (data + scoring + store layer + viz + UI), plus a prep dark-mode pass so the new UI is authored dark-native from day 1. No matcher changes yet; PR B (re-ranking) is explicitly Session 11.

**Meta / process notes:**
- Two-PR session. Dark mode shipped first as a prerequisite so the Big Five UI could be authored dark-native from the first line instead of needing a second refactor pass. This entry rides with `feat/bigfive-foundation`, the last PR of the session, and retrospectively covers both.
- **Explicit scope lock: PR A only.** Original plan had Big Five split into PR A (foundation) + PR B (re-ranking integration). User cut the session to PR A at kickoff to avoid cramming a 2-3× larger scope into one sitting. Ranking integration deferred to Session 11.
- **Upgraded item count: IPIP-50 instead of IPIP-30.** User pushed back on the plan doc's "30 items" during scoping — IPIP-50 Big Five Factor Markers (Goldberg 1992) is the standard validated instrument with ~α = 0.85 per dimension (10 items), vs. ~0.70-0.75 for an arbitrary 6-per-dim subset. +20 questions = ~3 extra minutes for a "deep assessment" already positioned at 30-60 min. And picking the full set skips the "which 6 per dim?" curation question entirely.
- **German translation sourced via WebFetch from `ipip.ori.org/German50-itemBigFiveFactorMarkers.htm`** (Fritz Ostendorf's official IPIP-DE translation). Used verbatim with three purely orthographic fixes flagged in the JSON's `germanTranslator` metadata: `beleidge`→`beleidige`, `grübel`→`grüble`, `wechsel`→`wechsle`. All missing letters or conjugation errors, not semantic edits — user preference is existing-translation-first, hand-polish for genuinely awkward items later.
- **New memory: SUMMARY.md is drafted AFTER successful user browser test, not before.** User caught me drafting the entry pre-test mid-session; the order is now (1) code + automated checks, (2) user browser test, (3) SUMMARY + commit + push + PR. Saved as `feedback_summary_after_test.md` overriding the CLAUDE.md §"Testing & Review Workflow" step-1 phrasing.
- **Four rounds of user-requested UX iteration** landed in this PR before the final go-ahead — this matters for the `feedback_test_before_pr.md` memory: the edit-test-iterate-on-disk loop earned its keep this session. Each iteration was pure HMR, no extra branches, no extra commits until user approval.

**What was done — dark-mode PR (merged as `1070751`):**
- Pure color-class swap across `App.vue`, `HomePage.vue`, `AssessmentPage.vue`, `ResultsPage.vue`, `RiasecHexagon.vue`, and `main.css`. 62 insertions, 62 deletions, zero logic changes. No Tailwind `dark:` variants, no system-preference detection, no toggle. Dark is the only mode. Going from "dark-only" to "dark default with `dark:` light fallback" later is a cheap second pass, not a rewrite, so deferring the toggle until someone actually asks is the right call.
- Palette: `:root { color-scheme: dark }`, body `bg-slate-950 text-slate-100`, cards/headers on `slate-900` with `slate-800` borders, primary accents `indigo-500`/`indigo-400`, amber warning/info banners in `amber-950/40` backgrounds with `amber-200` text so they feel muted instead of grab-you-by-the-face. Hexagon SVG colors swapped: grid/axes `#334155` (slate-700), profile polygon/vertices `#6366f1` (indigo-500), axis labels in slate-100/400.

**What was done — `feat/bigfive-foundation` (this PR):**

*Data:*
- `src/data/ipip-bigfive-items.json` — 50 items, 10 per dimension (O/C/E/A/N), EN+DE, attribution + the three orthographic fixes documented in the file's metadata.

*Types:*
- `BigFiveDimension = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'`
- `BigFiveProfile = Record<BigFiveDimension, number>` (parallel to `RIASECProfile`)
- `AssessmentLayer = 'riasec' | 'bigfive'`
- `AssessmentSession` gained optional `bigfiveAnswers`, `bigfiveOrder`, `bigfiveProfile`, `currentLayer`. **No Dexie schema bump**: the new fields are non-indexed, Dexie stores them alongside the v1 schema without migration, and the existing `db.test.ts` round-trips still pass.

*Scoring:*
- `src/features/scoring/lib/bigfive.ts` — `computeBigFiveProfile`, `normalizeBigFiveToPercent`, `BIG_FIVE_DIMENSIONS`. Reverse-scoring helper flips likert5 via `6 - value` (tolerant of a future likert7). Dimension-sum → percent arithmetic matches `riasec.ts` so both charts share the same 0-100 display scale.
- `bigfive.test.ts` — 10 new tests: empty-answers zero case, direct-key sums, reverse-key flipping, mixed direct/reverse within a dimension, unknown-id robustness, RIASEC/Big-Five layer isolation, normalization 20%/100% boundaries, plus a smoke-integration check against the real 50-item JSON that asserts every dimension sums to 30 at the neutral-answer fixed point. Value 3 is the fixed point of the reverse-key flip (`6 - 3 = 3`), which is why it's the smoke-test value across both layers.

*Store (`src/features/questionnaire/model/store.ts`) — the biggest file in the diff:*
- **Layer-aware extension, ~170 new lines.** Two parallel per-layer state bundles (`riasecAnswers`/`riasecOrder`/`riasecCurrentIndex` + the Big Five equivalents), a `currentLayer` ref as the switcher, and **layer-aware computed aliases** for `answers`, `questions`, `total`, `currentIndex`, `currentQuestion`, `isComplete`, `progress`. `answer()` and `previous()` dispatch via a small `answerLayer(value, layerAnswers, layerIndex, layerQuestions, layerTotal)` helper.
- **New actions:** `startBigFiveLayer()` (flips `currentLayer = 'bigfive'`, called from the ResultsPage Verfeinern CTA) and `resetCurrentLayer()` (clears only the active layer's state + re-shuffles its order, keeps `sessionId`/`startedAt` — this is a within-session re-run, not a new session). Full `reset()` still exists and is called from HomePage CTA / ResultsPage "Test neu starten" / AssessmentPage setup guard.
- `persist()` snapshots both layers to Dexie including `currentLayer`; `hydrate()` restores both with legacy pre-Phase-2 sessions cleanly defaulting `currentLayer` to `'riasec'` and Big Five state to empty. `completedAt` semantics unchanged (set on RIASEC completion so the existing persist tests still pass — Big Five is optional refinement and does not gate the "test is done" timestamp).
- Persist watcher now tracks `[riasecAnswers, riasecCurrentIndex, bigfiveAnswers, bigfiveCurrentIndex, currentLayer]` so any state change — including a pure layer-switch — triggers a Dexie write. Firing on `currentLayer` alone is what makes the Verfeinern flow durable across reloads.
- `results` computed unchanged (gated on `riasecIsComplete && occupations`). **PR A does not touch matching**; the top-20 stays observable-equal to pre-Phase-2 for any user. Re-ranking is its own PR next session, intentionally isolated so the eventual diff is easy to reason about.

*Visualization:*
- `src/widgets/bigfive-chart/ui/BigFiveBars.vue` — horizontal bar chart. 5 rows each `grid-cols-[auto_1fr_auto]` with OCEAN-letter badge + German dimension name + `bg-slate-800` track + `bg-indigo-500` fill scaled to percent + mono percent label. `role="progressbar"` per row with `aria-valuenow`/`min`/`max` + an `aria-label` composing name and percent. Dark-native from the first line.
- **Decision against a pentagon radar:** Big Five dimensions are not conceptually circular the way Holland RIASEC types are (where adjacent hexagon vertices reflect real interest-similarity). A pentagon radar would imply a meaningless "distance" between e.g. Openness and Extraversion. Bars are info-denser, more honest about the model, and more legible on narrow screens.

*i18n:*
- Restructured `likert.1..5` → `likert.riasec.1..5` + new `likert.bigfive.1..5`. Preference scale and agreement scale have genuinely different semantics so sharing one label set was wrong.
- Moved the hardcoded "Wie sehr würdest du das gerne tun?" prompt from `AssessmentPage.vue` into `questionPrompt.riasec`, with sibling `questionPrompt.bigfive = 'Wie sehr trifft diese Aussage auf dich zu?'`.
- New `bigfive.*` labels (Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus) + `bigfiveDescription.*` one-liners for the results-page legend.

*UI / pages:*
- `AssessmentPage.vue` — layer-aware. Prompt, Likert labels, and progress counter/total all flow from the layer-aware store computeds. New "Schicht {1|2} · {Interessen|Persönlichkeit}" indicator above the progress percent. Existing setup-time fresh-start guard `if (store.isComplete) store.reset()` untouched — because `isComplete` is now the layer-aware alias it auto-handles both layers correctly (mid-Big-Five returns false → no reset → resume; completed layer returns true → reset → fresh RIASEC). Layer promotion into Big Five is strictly inbound: AssessmentPage never auto-continues after RIASEC completion, it routes to `/ergebnis` and the user opts in via the Verfeinern CTA.
- `ResultsPage.vue` — new "Big Five block" between the RIASEC block and the top matches. Two states gated on `bigfiveIsComplete`: (a) indigo-tinted "Ergebnis verfeinern" CTA card with copy that explicitly frames refinement as re-weighting ("filtern nicht, verfeinern die bestehende Reihenfolge") so users don't think their RIASEC list is about to be thrown away; (b) heading "Dein Persönlichkeitsprofil" + BigFiveBars + 5-card dimension legend mirroring the RIASEC legend. Top-matches list is **unchanged** — `store.results` is still the pure-RIASEC matcher output. The incomplete-session interstitial now gates on `store.riasecIsComplete` explicitly (not the layer-aware `isComplete`), otherwise a user mid-Big-Five would land on the interstitial even though their RIASEC results are ready.
- `HomePage.vue` — 4th layer card "Schicht 4: Fähigkeiten – folgt in Phase 2" added, grid switched from `sm:grid-cols-3` to `sm:grid-cols-2 lg:grid-cols-4` (1-col mobile, 2-col tablet, 4-col desktop). Schicht 2 Big Five card came out of its `opacity-60` muted state since Layer 2 is live now. Amber "Früher Prototyp" copy updated to reflect the new scope ("RIASEC-Test mit 60 Items, optional verfeinert durch ein Big-Five-Persönlichkeitsprofil mit 50 Items; Werte und Fähigkeiten folgen in späteren Phasen").

**Mid-session UX iterations (all landed in this PR):**
- **Likert midpoint labels** — "Neutral" was ambiguous in both layers. Changed RIASEC `3` → **"Weder noch"** (standard psychometric German for "neither pro nor con" preference midpoint, matches the formal register of "Überhaupt nicht"/"Eher nicht"/"Gerne"/"Sehr gerne"). Changed Big Five `3` → **"Teils, teils"** (standard German psychometric agreement-midpoint, used in the BFI-2-DE — conveys "sometimes yes, sometimes no / depends"). The two scales need different midpoint labels because preference and agreement are different semantics; trying to share one word across both is what made "Neutral" feel hollow.
- **`resetCurrentLayer()` + "Schicht neu starten" button label.** Original "Neu starten" did a full reset (both layers + sessionId re-roll). User pointed out that mid-Big-Five this silently threw away the completed RIASEC run, which is a destructive surprise. Now the AssessmentPage button calls `resetCurrentLayer()` which scopes the clear to the active layer only — sessionId + the other layer survive. Full reset is still reachable from HomePage CTA and ResultsPage "Test neu starten", where its destructive semantic is expected.
- **Visible button affordance for Zurück and Schicht-neu-starten.** Were text-only with hover color change; hard to recognize as buttons. Now both have `rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium` with `hover:border-slate-600 hover:bg-slate-700`, matching the visual weight of the "Mehr anzeigen" button on ResultsPage. Zurück also gains `disabled:cursor-not-allowed disabled:opacity-40` for the index-0 edge.
- **Progress-bar regression fix.** Was `answers.length / total`; steps backward via "Zurück" didn't lower the percent because the already-stored answer stayed in the array. Fixed to `currentIndex / total` with an `isComplete ? 1 : ...` short-circuit for the very last question (where `answerLayer` clamps `currentIndex` at `total - 1`, so the formula would otherwise read 98% instead of 100% for the brief moment before navigation fires).
- **"Ergebnisansicht" shortcut button on AssessmentPage** — visible only when `store.riasecIsComplete` (i.e. during Big Five), placed between Zurück and Schicht-neu-starten. Router-push to `/ergebnis` without mutating store state; partial Big Five progress survives the side trip, and coming back via the Verfeinern CTA lands the user exactly where they left off (no reset, no reshuffle).

**Tests added in this PR:**
- `bigfive.test.ts` — 10 new tests (new file)
- `store.test.ts` — +13 tests: Big Five layer defaults, `startBigFiveLayer`, layer-isolated `answer()`, 50-item completion fixed-point, persist Big Five round-trip, hydrate Big Five partial resume, legacy-session fallback, `reset()` clears both layers, `resetCurrentLayer()` RIASEC-scoped, `resetCurrentLayer()` preserves the other layer, `resetCurrentLayer()` re-shuffles, `progress` tracks currentIndex through previous(), `progress` forces 1 at `isComplete`
- `AssessmentPage.test.ts` — +5 tests: Big Five prompt + 1/50 counter + agreement labels, layer-isolated Big Five click, "Schicht neu starten" within-session re-run, "Schicht neu starten" in Big Five preserves RIASEC, "Ergebnisansicht" hidden-in-RIASEC / visible-in-Big-Five / click-preserves-state (3 tests in one describe)
- `ResultsPage.test.ts` — +3 tests: Verfeinern CTA visible when only RIASEC done, CTA click promotes layer + navigates, BigFiveBars + 5-dim legend renders when both layers done
- `HomePage.test.ts` — +1 test: all 4 layer cards visible
- Existing "Neu starten resets the store back to a fresh state" test replaced by the two partial-reset tests — semantic change, not a delete. Old full-reset test coverage survives on HomePage.test.ts' "Test starten calls store.reset()" test.
- **Net: 94 → 127 tests (+33)**

**Architectural choices worth remembering:**
- **One `/test` route, layer-aware inside the store.** Not two routes, not a URL query param. Downstream cost if this becomes insufficient (e.g. shareable deep link to "continue Big Five"): trivial — add a query param later and seed `currentLayer` from it in the AssessmentPage setup.
- **`store.answers` / `store.total` / `store.currentIndex` kept as layer-aware aliases, NOT renamed.** Forcing all call sites to switch to `store.riasecAnswers` / `store.bigfiveAnswers` would have broken every existing test and required an AssessmentPage rewrite instead of an extension. The flat names + dispatching computeds is the single biggest ergonomic win of this PR.
- **Matcher signature unchanged in PR A.** Session 11's ranking PR will extend `matchOccupations(riasec, occupations, topN)` to `(riasec, bigfive: BigFiveProfile | null, occupations, topN)` with `null` producing exactly today's behaviour. Keeping the matcher out of this PR means the top-20 stays observable-equal to pre-Phase-2 for any user, which makes PR B's re-ranking diff easier to reason about and to compare against in a second friends-feedback round.
- **Dark mode as a prep PR before Big Five** was the right order. Zero theming refactor on the new BigFiveBars widget, the Verfeinern CTA, or any of the mid-session UX iterations — all authored dark-native from the first line.
- **Progress = `currentIndex / total` (with `isComplete ? 1` override)**, not `answers.length / total`. Answers-length made the bar feel stuck when stepping backward. The user's mental model is "where am I in the test", not "how many rows sit in storage".
- **`resetCurrentLayer()` keeps `sessionId`** on purpose. The Dexie row stays linked, hydrate still finds the same run, and re-running just one layer is conceptually a re-answer rather than a new test-taking session.

**Branches / merge commits:**
- `feat/dark-mode` — dark-mode color swap, merged as `1070751`
- `feat/bigfive-foundation` — this PR, Big Five foundation (data/scoring/store/viz/UI, no re-ranking)

**Known issues / TODOs (carried over / newly deferred):**
- **PR B: Big Five re-ranking** (Session 11) — extend matcher to take `bigfive: BigFiveProfile | null`, apply BigFiveModifier as a scaled cosine-similarity multiplier (`1 + α × cosine`, α ≈ 0.3, range [0.7, 1.3], never zero). Occupation-side Big Five target profiles derived from a RIASEC→Big Five transformation matrix — user wants to try Barrick/Mount/Gupta 2003 meta-analytic correlations first (attempt WebSearch/WebFetch), fall back to a transparent rule-based heuristic explicitly documented as placeholder if sourcing fails. `MatchResult` gains `riasecCorrelation` + `bigFiveModifier` as transparent components. Deploy afterwards to `pathfinder-liard-phi.vercel.app` for a second friends-feedback round.
- **Translation polish pass** on the 50 Big Five items — three orthographic fixes already applied, remaining work is natural-reading roughness surfaced during real use (same workflow as Session 8's RIASEC polish).
- **Layer 3: Werte** and **Layer 4: Skills** per PROJECT.md §5 — Phase 2 material, sequenced after Layer 2 re-ranking.
- **O*NET Work Styles** as upgrade path for Layer 2's occupation targets (replaces matrix/heuristic with real per-occupation Big Five data). Own ticket, after re-ranking has been validated against a feedback round.
- **PROJECT_PLAN.md §3.1 label fix**: still reads "IPIP Big Five (BFI-2-S)" which conflates two different instruments. Correct label for what's shipped is "IPIP Big Five Factor Markers, 50 items (Goldberg 1992)". Tiny doc PR, not in this session's scope.
- **Ship-it track** (Impressum, Datenschutz, Über, Spenden, domain, responsive audit, remove `noindex`) — still deferred until after the Phase 2 depth layers land.

**Known issues / TODOs closed this session:**
- ~~Dark-mode prerequisite for Phase 2 UI~~ → `feat/dark-mode` / merge `1070751`
- ~~Big Five data pipeline end-to-end (Layer 2 foundation)~~ → `feat/bigfive-foundation` (this PR)
- ~~Progress-bar regression when stepping backward~~ → fixed mid-session in `feat/bigfive-foundation`

**Next steps — Session 11:**
- **PR B: Big Five re-ranking** — matcher extension + modifier math + results-page surfacing of the two score components. See the Known Issues entry above for the Barrick-2003-vs-heuristic decision tree.
- Translation polish of the 50 IPIP items surfaced during the browser walkthrough.

---

### Session 9 – 2026-04-11
**Focus:** First live deploy – Vercel CLI preview for friends-feedback, plus strategic reframing of the ship-it roadmap

**Meta / process notes:**
- Single-PR session. This entry rides with `feat/vercel-preview-deploy`, which is both the first and the last (and only) PR of the session.
- **Strategic pivot, set at session start:** the user pushed back on the Session-8 "ship-it track" framing which bundled *hosting deploy* with *Impressum / Datenschutz / Über / Spenden-Seite / responsive audit* under one umbrella. His argument: the current content is still primarily "another 60-item RIASEC test", the differentiator is only "no trackers / no login", and shipping legal infrastructure for something he'd only show to friends anyway is premature. Decision: split the umbrella – do a **minimal friends-only preview deploy now** to close the feedback loop on what's already built, continue with **Phase 2 depth work (Big Five)** next, and save the real legal/content/domain push for when the app is actually ship-ready post-Phase-2. This is the shape the rest of the session was executed against.
- **Bushcraft-Planer deploy pattern adopted for PathFinder.** User already deploys his Bushcraft-Planer project via `npx vercel` manually, without installing the Vercel GitHub App. We replicated that here for the same reason: the Vercel GitHub App install dialog requests `code: write` (among other broad scopes), and the manual-CLI path skips the entire permission grant. Tradeoff accepted: no auto-preview on push, no PR-comment preview URLs, no webhook magic — every future deploy is a manual `npx vercel --prod` from his terminal. For a friends-feedback preview updated maybe 1-2× per session, that's fine.
- **Updated `PROJECT.md` (PR #21, merged before session start) is now the authoritative roadmap document** and was read into context at the top of this session. Key architectural decisions encoded there that affect future sessions: progressive funnel (RIASEC base → Big Five multiplier → Values hard/soft penalties → Skills additive bonus, each layer *refines* not *replaces*), Big Five is a re-ranking multiplier on the RIASEC correlation (not an independent score), values are the only source of hard eliminations, skills are additive with a "development needed" annotation rather than elimination. This resolves the open (a)-vs-(b) Big-Five-matching question the assistant flagged earlier in the session: the plan is (b), with concrete architecture.

**What was done:**
- **`vercel.json`** (new, 5 lines): SPA catch-all rewrite `{ source: "/(.*)", destination: "/index.html" }`. Vercel's static-filesystem check runs before rewrites, so real build artifacts under `dist/assets/` (JS/CSS/favicon) serve normally and only non-existent paths like `/test` and `/ergebnis` fall through to `index.html`, at which point Vue Router takes over client-side. Verified on the live deploy by directly hitting the deep-links in a fresh browser tab with no 404s.
- **`index.html`**: added `<meta name="robots" content="noindex, nofollow">` in the `<head>`. Keeps the preview URL out of Google while the app is still in "RIASEC-only" state. Comes off at the same time as the legal pages go live during the eventual real ship-it push.
- **`src/pages/home/HomePage.vue`**: new amber banner at the bottom of the landing section replacing the previous tiny gray `mt-12 text-xs text-slate-400` "Aktueller Stand:" footnote. Structure: `rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900` container with a `text-base font-semibold` heading "Früher Prototyp", a `text-sm` body paragraph about the early-development-stage nature and the feedback invitation, and — merged in mid-session at the user's explicit request — a third `text-sm` paragraph carrying the original "Aktueller Stand: vollständiger RIASEC-Test mit 60 Items … Big Five und persönliche Werte folgen in Phase 2." text. The two messages conceptually belong together: one sets expectations for *quality*, the other sets expectations for *scope*, and having them visually joined keeps the HomePage footer area one coherent block instead of two disconnected notes. Font sizes came up from the old `text-xs` because the original was too quiet to register as real information.
- One intermediate state that did not ship: an initial attempt put a one-line "Früher Prototyp – Feedback willkommen." in the App-level footer (`App.vue`) instead of a HomePage banner. User asked for something more prominent; the footer line was removed when the HomePage banner was added, to avoid a duplicate prototype notice on the same page. Net change to `App.vue` is zero.

**Deploy:**
- First live deploy ever for PathFinder. `npx vercel` wizard accepted defaults: project name `pathfinder`, framework auto-detected as Vite, build + output dirs from Vite defaults, scope = user's personal Vercel account.
- Key CLI prompt: *"Detected a repository. Connect it to this project?"* → answered **N**. That prompt is the trigger for the Vercel GitHub App install dialog; saying N keeps the project purely CLI-driven with zero GitHub-side integration, zero webhooks, zero PR-comment bots. Matches the Bushcraft-Planer setup.
- **Live production alias:** `pathfinder-liard-phi.vercel.app`. Vercel auto-disambiguated because `pathfinder.vercel.app` was already taken; the `liard-phi` suffix is random and stable. The alias points to whatever the latest `--prod` deploy is, so subsequent `npx vercel --prod` runs replace the content behind the same URL.
- **Gotcha worth remembering:** `npx vercel` bundles the **local working tree**, not `HEAD`. The first live deploy in this session was of uncommitted working-tree changes on `feat/vercel-preview-deploy` — it worked and was correct, but it's a different failure mode than the git-based workflow (a deploy can contain state that doesn't match any commit). Mitigation going forward: commit before deploying, even though the CLI doesn't enforce it. Not a blocker, just a different mental model.
- Five manual acceptance checks passed on the live `pathfinder-liard-phi.vercel.app` before the user gave go-ahead for commit + PR:
  1. HomePage renders with the amber banner visible and the "Aktueller Stand" copy inside it
  2. Direct `/test` URL renders the assessment page (SPA rewrite working end-to-end)
  3. Direct `/ergebnis` URL renders the "noch nicht abgeschlossen" interstitial (also SPA rewrite)
  4. View-source on `/` confirms the `noindex, nofollow` meta tag survived the Vite build
  5. Full 60-item questionnaire flow end-to-end with hexagon + top-20 + "Mehr anzeigen" + no console errors

**Findings / notes for the record:**
- **`npx vercel` from a git repo triggers a "Connect it to this project?" prompt that is a GitHub-App-install gate.** The question is phrased as if it's about linking, but answering Y actually walks you into the Vercel GitHub App permission dialog (`administration`, `checks`, `code: write`, `commit statuses`, `deployments`, `issues`, `pull requests`, `repository hooks`, `workflows`). For any future Vercel project that the user wants to keep CLI-only, this prompt must be answered **N**.
- **`code: write` is the single permission worth pausing over** when deciding whether to install the Vercel GitHub App at all. Vercel's own docs say they don't use the write access for anything in practice, but the permission is bundled into GitHub's permission model at the "contents" level and can't be split out. For Bushcraft-Planer and PathFinder both, the user has opted out of granting it entirely via the CLI-deploy path.
- **The "Only select repositories" scope during GitHub App installation is the single most important risk-reducer** if the GitHub App route is ever chosen in the future. It limits the blast radius of the entire permission list to exactly the opted-in repos. Noted here for whichever future session re-evaluates the deploy automation question.
- **Strategic reframing is the main outcome of this session, not the code changes.** The three-file diff is small and boring on its own. What matters is the rearranged TODO list: "first hosting deploy" is now closed (friends-only preview), the rest of the old ship-it bundle is deferred behind Phase 2, and next session picks up Big Five as the first Phase 2 deliverable instead of Impressum/Datenschutz. Session 8's "next session is explicitly the ship-it track" instruction has been superseded.

**Branches / merge commits:**
- `feat/vercel-preview-deploy` – first live deploy config (`vercel.json`, `noindex`, HomePage prototype banner) + this SUMMARY entry

**Known issues / TODOs (carried over, re-prioritized):**
- **Phase 2 depth layers** per updated `PROJECT.md` – **this is now the active track**, starting with Big Five:
  - **Layer 2: Big Five** (IPIP-30 items, 6 per dimension, Public Domain). New `bigfive` layer in the store, second scoring module, second visualization, results page updates live after completing the new layer, integration into `fitScore` as a multiplier per the progressive-funnel architecture. In the absence of Big Five profiles per O*NET occupation, either an externally-sourced mapping or a transparent heuristic (user-inspectable) will be needed.
  - Layer 3: Values (custom items, hard filters + soft penalties)
  - Layer 4: Skills self-assessment (matched against O*NET ability data, additive bonus)
- **Real ship-it track** (deferred until after Phase 2 is actually in): Impressum / Datenschutz / Über pages, Spenden-Seite (Bitcoin / Lightning / PayPal), domain decision, responsive audit, removal of the `noindex, nofollow` meta tag
- **Deploy automation** stays deliberately manual (`npx vercel --prod` from the user's terminal). If that becomes friction later, revisit the GitHub App install question with "Only select repositories" scope as the risk-reducer

**Known issues / TODOs closed this session:**
- ~~First hosting deploy~~ → `feat/vercel-preview-deploy` + live `pathfinder-liard-phi.vercel.app`. Domain decision itself is still deferred to the real ship-it push; the auto-generated Vercel alias is fine for friends-feedback and subsequent `--prod` deploys keep the URL stable.

**Next steps – Phase 2 depth track (next session):**
- **Big Five (Layer 2)** as the first Phase 2 deliverable – see details above. Once it lands, promote to the same `pathfinder-liard-phi.vercel.app` URL via `npx vercel --prod` for a round-two feedback cycle with the same friends; the link stays identical, only the content behind it changes.

**Next steps – ship-it track (deferred until post-Phase-2):**
- Domain decision + migrate off the auto-generated Vercel alias
- Impressum / Datenschutz / Über pages (required before any public DE launch)
- Spenden-Seite: Bitcoin on-chain + Lightning + PayPal
- Responsive design audit across common mobile/tablet breakpoints
- Remove the `noindex, nofollow` meta tag at the same time as the legal pages go live

---

### Session 8 – 2026-04-11
**Focus:** Test infrastructure depth – Dexie persistence direct tests, page-level component tests, plus a small German translation polish pass caught during manual browser testing

**Meta / process notes:**
- Three-PR session following the Session 5/6/7 workflow (branch off fresh main → edit-test-iterate live via HMR → commit+push+PR only after user approval). PRs #18 and #19 shipped with no `SUMMARY.md` change; this entry rides with PR C and retrospectively covers all three.
- The translation polish (PR C) was **not** planned at session start. The user spotted five items while doing a real walkthrough of the live app between PRs B and C and surfaced them mid-session. Fits the "edit-test-iterate live on disk" pattern: PR B's changes don't affect runtime, so the user could keep testing on the live app between automated test runs and manual flagging without context switches.
- Native-proofreading TODO from Sessions 5/6/7 has been **demoted** by the user after this session's manual reading. The remaining German strings are mostly natural; the five items caught here are subtle polish, not blockers. Pushed to end-of-Phase-2 polishing or later.

**What was done — PR #18 (Dexie persistence direct tests):**
- New `src/shared/config/db.test.ts` with **11 tests** covering the persistence contract directly: schema declaration (DB name `pathfinder`, single `sessions` table), CRUD round-trips for both minimal in-progress and fully populated complete `AssessmentSession` shapes, the exact `orderBy('startedAt').reverse().first()` query that `hydrate()` relies on (plus its empty-table boundary so the `if (!latest) return` branch is locked in), `completedAt` index sanity via `where().above()`, and `bulkPut`/`clear` round-trip preservation.
- Where the existing `store.test.ts` exercises persistence *through* the watcher and `hydrate()`, these tests isolate the Dexie layer so a regression localizes to either the store wiring **or** the schema definition, not both.
- Behavioral assertions throughout — no introspection of internal Dexie API fields like `schema.primKey.name` — so the suite is robust against Dexie version bumps.
- Closes the schema + round-trip half of the long-standing "Dexie persistence layer direct tests" TODO from Sessions 5/6/7. The "schema upgrades" half is moot: the schema is still at version 1 with nothing to upgrade from.

**What was done — PR #19 (page component tests + jsdom setup):**
- Added `jsdom@29` and `@vue/test-utils@2.4` as devDependencies.
- Per-file `// @vitest-environment jsdom` docblock pattern: only the three new page test files run jsdom; existing node-environment tests (store, db, scoring, matcher) stay node. **No global vitest config change** — sibling tests can't accidentally inherit the jsdom env.
- New `src/pages/home/HomePage.test.ts` (3 tests): title + CTA with live `store.total`, the homepage `Test starten` reset path, CTA href targeting.
- New `src/pages/assessment/AssessmentPage.test.ts` (8 tests). The centerpiece is the **PR #17 setup-time fresh-start guard** under regression test: mounting with a complete session calls `store.reset()` *before the first render*, leaving no flash of stale state; gegenproben confirm in-progress and empty stores stay untouched. Plus Likert click recording, Zurück disabled at index 0, Neu starten resets, progress display, and the completion → `router.push('/ergebnis')` flow.
- New `src/pages/results/ResultsPage.test.ts` (10 tests). Locks in **PR #15 uniform-answer banner** (full assertion at value 3 plus an `it.each([1, 5])` boundary check so all-low and all-high uniform profiles also catch the banner — not just the obvious midpoint), **PR #16 pagination** (initial 20 visible, "Mehr anzeigen" reveals 20 more, button disappears once every positive-`fitScore` match is shown, visible row count asserted equal to `store.results.filter(r => r.fitScore > 0).length` so zero/negative entries demonstrably never leak), and the **Session 4 restart fix** (the "Test neu starten" path now explicitly verifies both `store.reset()` AND `router.push('/test')` fire — guards the regression where missing the navigate left the user back on the "noch nicht abgeschlossen" interstitial).
- Test count: **62 → 73** after PR #18, **73 → 94** after PR #19 (21 new component tests).
- Setup choices worth knowing for future page tests:
  - Real `createMemoryHistory()` router with stub routes, not mock objects, so `useRouter()` returns a real instance and `vi.spyOn(router, 'push')` works without prop-drilling.
  - Real `i18n` singleton from `@shared/lib/i18n` — messages are static, no cross-test leak.
  - `fake-indexeddb/auto` per file for the persist watchers' fire-and-forget writes during seeding.
- Two non-obvious gotchas hit and resolved during PR #19's debugging:
  - **Pre-warming `loadOccupations()`** before the final-click test in AssessmentPage was needed because `selectAnswer`'s `await store.persist()` chain dynamic-imports the 500 KB occupations JSON when `isComplete`, which can stretch past `vi.waitFor`'s default window on first load. With the pre-warm the chain settles in <50 ms — deterministic. Documented inline.
  - **"Mehr anzeigen" loop has a 100-click safety bound** so a regression to "always visible" doesn't infinite-loop the test instead of failing it.

**What was done — PR C (German translation polish, this PR):**
- Five edits in `src/data/onet-items.json`. All caught by the user during a manual walkthrough of the live app between PRs B and C. Each fix preserves the O*NET semantics while replacing slightly off German with something a German speaker would actually say:
  - **`ip-r-01`** `Build kitchen cabinets`: `Küchenschränke bauen` → `Küchenschränke aus Holz bauen`. The English `build` in a craft context means "make from raw materials" (Tischler), not "assemble from a flat-pack" (IKEA). Plain `bauen` is ambiguous in German and many readers default to the IKEA mental model — wrong frame for an R-dimension item where the intended career is carpentry/joinery. `aus Holz` disambiguates without inventing job context.
  - **`ip-s-04`** `Perform rehabilitation therapy`: `Rehabilitationstherapie durchführen` → `In der Reha mit Patienten arbeiten`. The original German is technically correct but bureaucratic — no German speaker would describe their job that way. The new phrasing is what an actual Reha-Therapeut*in or Physiotherapeut*in would say, and the survey frame "wie sehr würdest du das gerne tun?" reads naturally with it.
  - **`ip-s-06`** `Teach children how to play sports`: `Kindern Sport beibringen` → `Kindern Sportarten beibringen`. `Sport` is unzählbar in German so `Sport beibringen` is grammatically odd — `beibringen` wants something concrete. `Sportarten` (sports as disciplines) matches the English plural and gives the verb a proper object.
  - **`ip-s-08`** `Help conduct a group therapy session`: `Bei einer Gruppentherapie assistieren` → `Bei einer Gruppentherapie mithelfen`. `assistieren` leans clinical/medical (Operationsassistent), losing the softer co-facilitation sense of the English `help conduct`. `mithelfen` is closer in register and clearly captures the "junior helper to the lead therapist" role. Also addresses a real reader misreading the user reported during testing: the English doesn't mean "help the *group*" but "help [someone] *conduct* the session" — `mithelfen` keeps that ambiguity narrower than `assistieren` did.
  - **`ip-a-08`** `Perform jazz or tap dance`: `Jazz- oder Stepptanz aufführen` → `Auf der Bühne tanzen, zum Beispiel Jazz Dance oder Stepptanz`. `Jazztanz` exists in the Duden but is rarely used in real German — actual dance schools use the English loanword `Jazz Dance`. `Auf der Bühne tanzen` rescues the `Perform` semantic that `aufführen` carried; the `zum Beispiel` framing keeps both styles as concrete examples without making the unusual compound do all the work.
- No code changes, no test changes. JSON edits only — `npm test` still 94/94 because the items file is loaded by the store and shape-checked but the German strings aren't asserted anywhere (intentional: tests should not couple to copy).

**Session-wide findings / notes for the record:**
- **The per-file `// @vitest-environment jsdom` docblock is the right move** vs. flipping the global vitest environment to jsdom or splitting into two configs. Sibling node tests can't accidentally pull in DOM globals, and the cost is one comment line per page-test file.
- **Translation polish from "edit-test-iterate live on disk" is more efficient than a planned proofreading pass.** The user found these by actually using the app under realistic conditions — the same translations had been looked at during Session 6's batch review without flagging them. Lesson: the next translation pass should be "use the app for real and flag what catches the eye", not "read 60 items in a list".
- **`store.results.filter(r => r.fitScore > 0).length` as a test invariant** is a more robust assertion than "click N times and check final count" because it asserts the cap *rule*, not the cap *number* — survives changes to `PAGE_SIZE` or to the underlying occupation dataset.
- **Component tests run in <2 s** even with real Pinia + real router + real i18n + fake-indexeddb. No mocking ceremony was worth introducing; the real wiring is fast enough.

**Branches / merge commits:**
- `test/dexie-persistence-direct` – PR #18, 11 Dexie schema/CRUD/index tests, merged as `bef9ee1`
- `test/page-components` – PR #19, jsdom + @vue/test-utils + 21 page component tests, merged as `623fcb5`
- `fix/de-translation-polish` – this PR, carries this SUMMARY entry

**Known issues / TODOs (carried over):**
- **Still no Phase 1 MVP ship items** (untouched since session-1 inception): domain decision, free-tier hosting deploy, Spenden-Seite (Bitcoin/Lightning/PayPal), Impressum/Datenschutz/Über pages, responsive audit. **Next session is explicitly the ship-it track per user instruction.**
- **Dexie schema upgrade testing** – moot until the schema goes past v1; nothing to upgrade from yet.

**Known issues / TODOs closed this session:**
- ~~Dexie persistence layer direct tests (schema, round-trip)~~ → PR #18
- ~~Component-level tests for `HomePage`, `AssessmentPage`, `ResultsPage`~~ → PR #19
- ~~German translation native-proofreading pass~~ → **demoted** by user after this session's manual reading; the five subtle polish items found here went into PR C, but the broader "full pass" is no longer blocking and is pushed to end-of-Phase-2 polishing or later

**Next steps – ship-it track (user's call for next session):**
- Domain decision + first hosting deploy (Cloudflare Pages / Vercel)
- Spenden-Seite: Bitcoin on-chain + Lightning + PayPal
- Impressum / Datenschutz / Über pages (required before any public DE launch)
- Responsive design audit across common mobile/tablet breakpoints

**Next steps – product-depth track (deferred):**
- Translation polish opportunistically as the user keeps using the app, not as a dedicated session.
- (No outstanding test-coverage gaps after this session.)

---

### Session 7 – 2026-04-11
**Focus:** Product-depth follow-ups – top-20 results pagination, post-completion fresh-start on `/test`

**Meta / process notes:**
- Two-PR session following the same workflow as Sessions 5 and 6 (branch off fresh main → edit-test-iterate live via HMR → commit+push+PR only after user approval). First PR shipped with no `SUMMARY.md` change; this entry rides with the final PR and retrospectively covers both.
- PR #16's top-20 task was queued at the end of Session 6 via a handoff memory note (not via a Session 6 SUMMARY TODO), including two open design questions the user deferred at the time. Both questions resolved at the start of this session before touching code (cap = `fitScore > 0`, label = "Mehr anzeigen").

**What was done — PR #16 (top-20 results + "Mehr anzeigen" pagination):**
- `/ergebnis` now renders **20 occupations initially** instead of the previous fixed top-10, with a centered **"Mehr anzeigen"** button that reveals 20 more per click. `ResultsPage` holds a local `visibleCount = ref(20)` with a `PAGE_SIZE = 20` step; the store dropped its hardcoded `topN = 20` cap on `matchOccupations` and now returns the **full ranked list** so the UI owns pagination.
- The visible slice filters entries with `fitScore ≤ 0` — so the button **auto-disappears** at the point where remaining matches carry no signal rather than exposing a "rank 500: Postmasters · 0" tail. Honest self-adjusting cap instead of an arbitrary round number. The `fitScore > 0` filter was the recommended approach from Session 6's handoff and stayed after a brief discussion of alternatives (no cap / round cap).
- `visibleCount` is intentionally **local UI state**, not persisted: a reload resets to 20 because it's a fresh visit. No Dexie schema change.
- Natural composition with Session 6's uniform-answer banner: when `hasProfileDirection === false`, the banner renders alone — neither the list nor the "Mehr anzeigen" button appear, zero extra plumbing needed.
- **Drive-by fix** caught during browser test: centered the "Test neu starten" button via `flex justify-center` on its wrapper div (was hanging half-left). User explicitly pulled it into this PR since we were already in the file.
- One existing store test updated: the `toBeLessThanOrEqual(20)` assertion in the `results populates once complete` test flipped to `toBeGreaterThan(20)` to lock in the new "store returns the full ranked list" contract — guards against a regression to the old hardcoded cap.
- Bundle impact: ResultsPage chunk **6.17 → 6.55 kB** (+0.38 kB, pagination state + button markup). Store chunk essentially flat (108.18 → 108.20 kB).

**What was done — this session's final PR (post-completion fresh-start on /test):**
- **Bug fix:** navigating to `/test` with a completed session in the store — via the header's "Zum Test" link, a direct reload of `/test`, or any programmatic path — used to land the user on the **last** question of the finished run. `hydrate()` clamps `currentIndex` to `total - 1` for complete sessions, which is correct resume behavior for *in-progress* runs but wrong for *completed* ones. Only the homepage's *Test starten* CTA was a clean fresh-start entry point. Known issue carried over from Session 5, noted in Session 6's TODO list.
- **Fix:** a 2-line check in `AssessmentPage.vue`'s `<script setup>`: `if (store.isComplete) store.reset()`. Runs during setup, before the first render, so there's no flash of the stale "complete" state. `reset()` also re-rolls `questionOrder`, so the fresh run gets a genuinely different shuffle sequence from the one just finished. The existing persist watcher writes the empty fresh session to Dexie, same mechanism as HomePage's *Test starten* path, keeping hydrate-next-reload consistent.
- **Why not a literal router `beforeEach` guard** (user's original phrasing in the carry-over memory was "Route-Guard"): every navigation flavor to `/test` converges on a single mount of `AssessmentPage`, so the observable behavior is identical. The router-guard version would add ~6 lines of async dynamic-import plumbing with no realistic future payoff — "kein Login / keine Tracker / keine i18n-URL-Präfixe / single assessment entry" rules out the standard beforeEach use cases, and the CLAUDE.md "no abstractions for single-use code" rule wins. Decision was walked through with the user explicitly and accepted. If a second `/test` entry appears later, hoisting the check into the router is a trivial refactor.
- **Regression surface — all existing resume scenarios still work unchanged and were browser-tested:**
  - Mid-test reload of `/test` → resumes at next unanswered question (`isComplete === false`, check is a no-op)
  - Mid-test click on header "Zum Test" → resumes at next unanswered question
  - Reload of `/ergebnis` after completion → still shows results (check is scoped to AssessmentPage, ResultsPage untouched)
  - Homepage "Test starten" → unchanged (HomePage's own `store.reset()` already covers it; the new check is a no-op)
- Bundle impact: AssessmentPage chunk **2.43 → 2.45 kB** (+0.02 kB).

**Session-wide findings / notes for the record:**
- **Pagination doesn't need persistence.** Considered briefly whether `visibleCount` should round-trip to Dexie so a user who clicked "Mehr anzeigen" 5× and reloaded sees 120 results again. Decided no: a reload is a fresh visit, 20 is the natural starting point, and persisting a UI pagination counter in the assessment session schema would be scope creep.
- **`fitScore > 0` cap also sidesteps a subtle UX footgun:** because the uniform-answer banner from Session 6's final PR handles flat profiles (`hasProfileDirection === false`), the only way to hit "all remaining matches are ≤ 0" with the banner bypassed is an adversarially-constructed profile against the full O*NET dataset — practically impossible at 923 diverse entries. We therefore didn't add a fallback message for "20 shown, but nothing past them is positive"; if it ever triggers the button just doesn't render, which is acceptable dead-end behavior for an edge case that won't happen.

**Branches / merge commits:**
- `feat/top-20-show-more` – top-20 pagination + "Mehr anzeigen" + centered restart button, merged as `e367dd1`
- `fix/zum-test-fresh-start` – this session's final PR, carries this SUMMARY entry

**Known issues / TODOs (carried over):**
- **Component-level tests** for `HomePage`, `AssessmentPage`, `ResultsPage` – still deferred. The setup-level fresh-start check from this session's final PR is exactly the kind of behavior a component test would lock in; currently it's only covered by the manual browser test.
- **Dexie persistence layer direct tests** – still only indirectly exercised via `fake-indexeddb` in the store tests; no focused unit tests for `@shared/config/db` (schema, upgrades, round-trip).
- **German translation native-proofreading pass** – current 60-item pass from Session 6 reads naturally but a native speaker skimming all 60 in context may still catch a few.
- **Still no Phase 1 MVP ship items:** domain decision, free-tier hosting deploy, Spenden-Seite (Bitcoin/Lightning/PayPal), Impressum/Datenschutz/Über pages, responsive audit.

**Known issues / TODOs closed this session:**
- ~~Top-10 results list is too narrow; want top-20 with "Mehr anzeigen" pagination~~ → PR #16 (queued from Session 6 handoff memory)
- ~~Header's *Zum Test* link resumes at the last answered question after a completed run instead of starting fresh~~ → this session's final PR (known issue since Session 5)

**Next steps – product-depth track (continued):**
- Component-level tests for the assessment flow (`AssessmentPage` + `ResultsPage` rendering against a test store). The fresh-start setup check is a prime candidate for the first regression test in that suite.
- Dexie persistence layer direct tests (schema round-trip, legacy row handling).
- Revisit translations in a native-proofreading pass.

**Next steps – ship-it track (still untouched):**
- Domain decision + first hosting deploy (Cloudflare Pages / Vercel).
- Spenden-Seite: Bitcoin on-chain + Lightning + PayPal.
- Impressum / Datenschutz / Über pages (required before any public launch in DE).
- Responsive design audit across common mobile/tablet breakpoints.

---

### Session 6 – 2026-04-11
**Focus:** Product-depth track – bundle split, full 60-item questionnaire in German, per-session question shuffle, uniform-answer edge case

**Meta / process notes:**
- Four-PR session following the Session-4/5 workflow (branch off fresh main → edit-test-iterate live via HMR → commit+push+PR only after user approval). Earlier PRs shipped with no `SUMMARY.md` change; this Session 6 entry rides with the final PR and retrospectively covers all four.
- No PR URLs in the entry (per the convention established in Session 5): PRs are referenced by verb or branch name.

**What was done — PR #12 (lazy-load occupations):**
- Moved the ~495 KB `onet-occupations.json` import out of the questionnaire store chunk via dynamic `import()`, creating a separate `onet-occupations-*.js` chunk. `AssessmentPage.onMounted` prefetches it while the user reads question 1 so the chunk is cached by the time they finish; `ResultsPage.onMounted` triggers a safety-net load for direct `/ergebnis` navigation. Brief "Berufsempfehlungen werden geladen …" placeholder during that short fetch window.
- `persist()` awaits `loadOccupations()` when `isComplete`, so the Dexie write always snapshots populated `results` instead of racing the dynamic import.
- Bundle delta: **store chunk 600.48 → 105.89 kB (−494 kB)**, landing-page initial JS **~748 → ~253 kB (−495 kB / −66 %)**. Same total bytes shipped — just split so `/` no longer pays the occupations tax up front. Pre-existing 500 kB chunk-size warning (carried over since Session 2) is **gone**.
- 1 new test in `store.test.ts` for `loadOccupations()` idempotency; the "results populates once complete" test was updated to reflect the new lazy behavior (explicit `await store.loadOccupations()` after the final answer).
- Browser-tested: network tab showed the split working, completion flow still renders instantly because of the prefetch.

**What was done — PR #13 (full 60-item questionnaire in German):**
- **50 new German translations** for the O*NET Interest Profiler Short Form items that had been `de: null` since Session 1. All 60 items now have German text. Style matches the existing 10: infinitive verb phrases, gender-neutral via verb form, natural idiomatic German. Notable choices: `Ziegel mauern oder Fliesen verlegen` (ip-r-02, disambiguates `mauern` verb with preceding object), `Mit einem Taschenrechner arbeiten` (ip-c-04, survey frame "how much would you enjoy this?" rather than literal "bedienen"), `Mandanten vor Gericht vertreten` (ip-e-07, accepted generic masculine since `Mandant:innen` felt too formal for a career-interest survey).
- **Production questionnaire bumped from PoC 10 → full 60 items.** `store.ts` drops `POC_ITEM_IDS` and filters `allItems` by `layer === 'riasec'` defensively. Store tests parameterized with `store.total` where it made the assertions more robust (e.g. `expect(row?.answers).toHaveLength(store.total)`), and the seed-complete hydrate fixture grew from 10 to 60 fake answers.
- `HomePage` footer text rewritten to reflect the full questionnaire ("vollständiger RIASEC-Test mit 60 Items aus dem O*NET Interest Profiler Short Form. Big Five und persönliche Werte folgen in Phase 2."), time estimate bumped ~2 → ~5 min, and the trailing "· Proof of Concept" qualifier removed at the user's request since the questionnaire itself is no longer a PoC.
- `matcher.integration.test.ts` still keeps its local 10-item `POC_ITEM_IDS` as a frozen fixture so the scaling claim ("same helper, 10 items and 60 items, same scoring outcome") remains a meaningful forward-compat smoke check. Test names and comments updated so they don't read as if the production store still uses the PoC subset.
- Build impact: store chunk 105.89 → 107.64 kB (+1.75 kB from the extra German text). No functional regressions.
- Browser-tested: user walked the full 60-item questionnaire in German and confirmed translations read naturally. During the test, spotted and accepted the **uniform-answer fitScore=0 edge case** (see PR B below) as mathematically correct Pearson behavior.

**What was done — PR #14 (per-session question shuffle):**
- Fisher-Yates shuffle (module-scoped helper in `store.ts`) randomises the presentation order of the 60 items per session. Breaks the source-order R→I→A→S→E→C clustering so a tired user's lower-energy answers don't all fall in the same RIASEC letter and bias the profile against that dimension.
- Order is persisted in a new `AssessmentSession.questionOrder?: string[]` field and restored on `hydrate()` so reload preserves the exact sequence the user started with — `currentIndex` still maps to the same question they actually saw. `reset()` re-rolls a fresh order so "Test neu starten" gives a meaningfully different run.
- `hydrate()` validates the restored order via `isValidOrder()` (same length as source, no duplicates, no stray ids). Legacy pre-shuffle sessions in a returning user's IndexedDB (no `questionOrder` field) and tampered Dexie rows (wrong length / bad ids) fall back to source order — which is what those sessions were implicitly authored against, so their `currentIndex` still lines up.
- Internal: added module-scoped `sourceOrder: readonly string[]` and `itemsById: Map<string, Question>` so the `questions` computed does an O(1) lookup per slot instead of `allItems.find()`.
- 7 new tests in the store suite: valid permutation (length + set equality + no dupes), shuffled order ≠ identity (1/60! ≈ 10⁻⁸² false-positive rate, documented), `reset()` re-roll, `persist()` writes `questionOrder`, `hydrate()` restores exact order (tested with a deliberately-reversed source order to prove the module-level init shuffle isn't leaking through), legacy fallback, tampered-row rejection (`questionOrder: ['ip-r-01', 'ip-r-02']` → falls back to source, `total` stays at 60).
- Browser-tested: first question differs across fresh starts, reload mid-assessment preserves the order, reset re-rolls, dimensions visibly interleave, two-tab parallel hydration shows the same order.

**What was done — this session's final PR (uniform-answer banner):**
- **Root cause recap:** a user who answers every item with the same Likert value (all 1s, all 3s, all 5s) produces a flat RIASEC profile (`{R, I, A, S, E, C}` all equal). Pearson correlation at `features/scoring/lib/pearson.ts:37` has a zero-variance guard that returns 0 when the user's profile has `σ = 0`, so every occupation's `fitScore` collapses to 0 and the top-10 renders as an arbitrary list of zeros. Mathematically correct — a flat profile expresses no preference direction, so there's no axis to rank along — but the UI looked broken.
- **Fix:** new `hasProfileDirection(profile)` helper in `features/scoring/lib/riasec.ts` returns `false` iff all six dimensions are equal (covers all-zero, all-low, all-high, and any mid-level uniform profile). `ResultsPage.vue` imports it as a reactive computed over `store.riasecProfile` and swaps the top-10 block for an amber-banner German message when the profile has no direction:
  > *Dein Profil ist auf allen sechs Dimensionen gleich gewichtet. Ohne Präferenzunterschiede kann das Matching keine aussagekräftigen Berufsempfehlungen berechnen.*
  > *Der Test wird hilfreicher, wenn du bei den Antworten klarer differenzierst – zwischen Aktivitäten, die du wirklich gerne machen würdest, und solchen, die dich weniger reizen.*
- The hexagon stays visible even when the banner is shown — a flat hexagon is itself informative visual feedback about what happened. The "Test neu starten" button at the bottom of the page already gives the user a way to try again, so no duplicate CTA in the banner.
- 5 new unit tests for `hasProfileDirection`: returns true when one dimension differs, returns false for all-low uniform / all-high uniform / all-zero (initial state) / all-mid uniform, returns true even for a single-dimension outlier (one value off by 1).
- Build: `ResultsPage` chunk 5.56 → 6.17 kB (+0.6 kB from the banner markup and the extra computed); store chunk 108.12 → 108.18 kB (+0.06 kB from the added helper export).

**Session-wide findings / non-bugs noted for the record:**
- **Pearson zero-variance → fitScore=0 is correct math.** Covered by `pearson.test.ts`'s "zero-variance guard" unit test from Session 3. The banner in this session's final PR addresses the UX, not the math.
- **The Vite dev server reports `onet-occupations.json` at ~4 MB** in the browser's Network tab, which alarmed the user during PR #12's browser test. That's how Vite serves JSON in dev mode (one `export const` per field for tree-shaking), not what ships. Production build output is the authoritative 484 kB / 134 kB gz chunk in `dist/assets/`.
- **Shuffle's "1/60! false positive rate" assertions** in the store tests are deliberate: a random permutation of 60 elements coinciding with the identity has a probability of ~10⁻⁸². If those assertions fail, Fisher-Yates is broken, not unlucky. Documented in test comments so future maintainers don't "fix" the non-determinism.

**Branches / merge commits:**
- `feat/lazy-load-occupations` – lazy-load occupations, merged as `38d00e7`
- `feat/full-60-items-german` – 60-item questionnaire + 50 translations + landing page cleanup, merged as `72b7fb5`
- `feat/shuffle-questions` – per-session Fisher-Yates shuffle with hydrate preservation, merged as `6c30507`
- `feat/uniform-answer-banner` – this session's final PR, carries this SUMMARY entry

**Known issues / TODOs (carried over):**
- **Component-level tests** for `HomePage`, `AssessmentPage`, `ResultsPage` – still deferred. The store-layer tests from Session 5 + the shuffle and banner tests from Session 6 cover the logic, but no `@vue/test-utils` rendering tests yet.
- **Dexie persistence layer direct tests** – still indirectly exercised via `fake-indexeddb` in the store tests; no focused unit tests for `@shared/config/db` (schema, upgrades, round-trip).
- **Resume-on-reload edge case** from Session 5: navigating `/test` via the header's *Zum Test* link *after* a completed run shows the last completed question instead of starting fresh. Only `HomePage`'s *Test starten* CTA is a clean fresh-start entry point. Small route-guard fix.
- **Still no Phase 1 MVP ship items:** domain decision, free-tier hosting deploy, Spenden-Seite (Bitcoin/Lightning/PayPal), Impressum/Datenschutz/Über pages, responsive audit.

**Known issues / TODOs closed this session:**
- ~~Translate the remaining 50 O*NET items to German~~ → PR #13
- ~~Lazy-load `onet-occupations.json` out of the main store chunk~~ → PR #12 (and the ~600 KB chunk-size warning that had been carried since Session 2 is also gone)
- ~~No Pinia `questionnaire` store tests~~ → closed by Session 5's initial test suite and extended by PRs #14 and the final PR this session
- ~~Clustered question order / dimension-block fatigue risk~~ → PR #14
- ~~Uniform-answer UX (top-10 of zeros)~~ → this session's final PR

**Next steps – product-depth track (continued):**
- Component-level tests for the assessment flow (`AssessmentPage` + `ResultsPage` rendering against a test store).
- Dexie persistence layer direct tests (schema round-trip, legacy row handling).
- Resume-on-reload "fresh start from header link after completion" route guard.
- Revisit translations in a native-proofreading pass (current pass is natural but a German speaker skimming all 60 in context may still catch a few).

**Next steps – ship-it track (still untouched):**
- Domain decision + first hosting deploy (Cloudflare Pages / Vercel).
- Spenden-Seite: Bitcoin on-chain + Lightning + PayPal.
- Impressum / Datenschutz / Über pages (required before any public launch in DE).
- Responsive design audit across common mobile/tablet breakpoints.

---

### Session 5 – 2026-04-11
**Focus:** Product-depth track – RIASEC hexagon widget, resume-on-reload, Pinia store tests

**Meta / process notes:**
- Three-PR session following the "branch off fresh main, edit-test-iterate live via HMR, commit only after user approval" workflow from Session 4's memory. Earlier PRs in the session shipped with NO `SUMMARY.md` change; this Session 5 entry rides with the final PR of the session and retrospectively covers all three.
- New convention adopted this session: **do not include PR URLs in SUMMARY entries.** PR URLs aren't known at commit time (the SUMMARY commit ships as part of the same branch that becomes the PR), and editing after opening the PR is blocked by the "approved PRs are frozen" rule. Reference PRs by verb ("the hexagon widget PR") or commit hash when needed.

**What was done — PR #8 (RIASEC hexagon widget):**
- New widget `src/widgets/riasec-chart/ui/RiasecHexagon.vue` – dependency-free inline SVG in the standard Holland hexagon order (R-I-A-S-E-C clockwise from top at 60° intervals), grid rings at 25/50/75/100 %, axis labels showing letter + percent, and a filled polygon for the user profile. Scales fluidly via `viewBox` + `w-full`. Barrel export from `src/widgets/riasec-chart/index.ts`.
- `ResultsPage.vue` swaps the six horizontal percent bars for the hexagon + a compact 3-column legend grid (3/2/1 col responsive) that preserves the German dimension descriptions from the i18n layer.
- **Also bundled in PR #8 (small layout fix found during browser test):** long German occupation titles overflowed their top-10 cards on narrow viewports. Classic flexbox `min-width: auto` trap – the title `<div>` couldn't shrink below its content width. Fix: `min-w-0 flex-1` on the title container, `shrink-0` on the fit-score, `break-words` on the text so long compound words wrap.
- Verified: `npm test` 32/32 ✅, type-check ✅, lint ✅, build ✅ (ResultsPage chunk 2.88 KB → 5.22 KB for the hexagon; store chunk unchanged at 600 KB).
- Browser-tested by @mo-sp: hexagon renders correctly, labels don't clip, responsive legend reflows 3→2→1 col, all-*Sehr gerne* profile fills, all-*Überhaupt nicht* profile → 20 % (expected – see findings below).

**What was done — PR #9 (resume on reload + header nav rename):**
- Added `hydrate()` to the questionnaire store and a persist-on-change `watch` around `[answers, currentIndex]` with `{ deep: true }`. `main.ts` calls `hydrate()` via **dynamic import** (`import('@features/questionnaire/model/store')`) only when `window.location.pathname` matches `/test` or `/ergebnis`, so a visitor who bounces off `/` still doesn't download the 600 KB occupations chunk. Landing on `/` always starts fresh.
- Removed the initial "length > 0" guard on the persist watcher so even empty resets get written to Dexie. Without this, reloading `/test` immediately after clicking *Test starten* (before answering) would hydrate the previous completed session as the "most recent by startedAt".
- Dynamic-import side effect: rolldown re-chunked `vue-router` (140 KB → 24 KB) and hoisted `pinia` into its own 115 KB chunk. Same total bytes for `/`, just a different split. Store chunk stayed at 600 KB and remained lazy.
- **Also bundled (found during browser test):** the header nav's `Start` label collided with the homepage *Test starten* CTA, AND the header `Test starten` link silently did NOT reset the store (unlike the homepage CTA's `@click="start"` path). Same label, different semantics. Renamed to `Startseite` + `Zum Test` so the labels match the actual behavior; unchanged underlying behavior.
- Verified: 32/32 ✅, type-check ✅, lint ✅, build ✅. Browser-tested: reload `/test` resumes at next unanswered question, reload `/ergebnis` after completion still shows results, the `→ Zum Test` interstitial button now resumes instead of restarting from question 1, and *Test starten* from home after completion correctly starts a fresh test.

**What was done — questionnaire store tests (this session's final PR):**
- Added `src/features/questionnaire/model/store.test.ts` with **17 new tests** exercising the Pinia store end-to-end against real `onet-items.json` + `onet-occupations.json` and a `fake-indexeddb` Dexie backend.
- Chose `fake-indexeddb/auto` as a **scoped import at the top of the test file** (not a global vitest setup file) so sibling tests keep their plain node environment and don't silently depend on an IDB global.
- **Action-layer block (6 tests):** initial state + `total === 10` guard, `answer()` advances + records, `answer()` overwrites a re-answered question without duplicating, `answer()` clamps at the last index (doesn't step off the end of the questions array), `previous()` clamps at 0, `reset()` clears answers + currentIndex + generates a new `sessionId`.
- **Computed-layer block (3 tests):** `riasecProfile` sums Likert responses per dimension against the known PoC distribution `R=2/I=2/A=2/S=2/E=1/C=1` (so answering all 10 with value 3 lands on exact counts `R=I=A=S=6, E=C=3`), `riasecPercent` normalization at max (every dim → 100), `results` empty-until-complete.
- **Persist-watcher block (3 tests):** writes in-progress session after an answer, writes `completedAt` + `riasecProfile` + `results` once the session is complete, empty `reset()` overrides the previous completed session as "latest by startedAt" – the specific behavior that lets `hydrate()` find a fresh state after a double *Test starten* click.
- **Hydrate block (5 tests):** restores an in-progress session and advances `currentIndex` to the next unanswered question, restores a complete session and clamps `currentIndex` to `total-1` (prevents stepping off the questions array), no-op on empty Dexie, picks the most recent session by `startedAt` regardless of insertion order (`bulkPut([old, newer])` still hydrates `newer`), second call is a no-op so intervening user input is not clobbered.
- Small helper `flushPersist()` – `2× nextTick()` + `2× setTimeout(0)`. Overkill for fake-IDB's write speed but keeps the tests stable without polling for state. 17/17 green on first run after fixing one TS error where the initial draft reached for `store.startedAt` which isn't exposed in the store's public return block.
- Verified: `npm test` → **49/49** ✅ (32 from prior sessions + 17 new), type-check ✅, lint ✅, build ✅. No runtime/bundle delta – pure test-only addition. No browser test applicable.

**Session-wide findings / non-bugs noted for the record:**
- **Likert minimum = 20 %, not 0 %.** Scale is 1-5, so the minimum response maps to `1×count / (5×count) = 20%`. The math at `src/features/scoring/lib/riasec.ts:37` is working as designed; matching uses the raw profile (not percent) so ranking is unaffected. Noted so future sessions don't "fix" it.
- **Narrow-viewport limit is the browser's own minimum window width (~500 px), not an app bug.** The hexagon + legend scale fluidly down to that limit. Use DevTools device mode for smaller widths.
- **Resume-on-reload is best-effort, not transactional.** If Dexie is unavailable (private mode, quota exceeded), `hydrate()` and the persist watcher silently swallow the error and the store stays in its pristine in-memory state. The user continues uninterrupted but loses the resume feature.
- **One narrow edge case accepted on PR #9:** reloading `/test` immediately after clicking *Test starten* from the homepage without answering any questions. The empty-reset persist covers it, but the user explicitly marked it as low-priority if it flakes.

**Branches / merge commits:**
- `feat/riasec-hexagon-widget` – hexagon widget + top-10 overflow fix, merged as `d6479f4`
- `feat/resume-on-reload` – resume on reload + header nav rename, merged as `f427487`
- `test/questionnaire-store` – this session's final PR, carries this SUMMARY entry

**Known issues / TODOs:**
- Bundle-size warning (~600 KB `store` chunk) **unchanged** since Session 2. The store chunk is already lazy-loaded for the `/` route (via page imports + PR #9's dynamic import for hydration), but on `/test` or `/ergebnis` the whole 600 KB / 169 KB gz chunk still loads as a single unit. The cleanest remaining fix is extracting `onet-occupations.json` out of the store chunk into its own lazy import inside the matcher, so `/test` (which only needs questions) doesn't pay for the occupations payload.
- 50 of 60 O*NET items still English-only. Deferred because native German judgment is needed per item – better as a dedicated back-and-forth session.
- No tests yet for the Dexie persistence layer directly (the store tests indirectly exercise it via fake-indexeddb).
- No component-level tests yet for `AssessmentPage`, `ResultsPage`, or `HomePage`.
- Resume-on-reload does not yet handle a "start a new test from /test after completion" flow distinctly from "continue test" – navigating `/test` after completion via the header's *Zum Test* link would show the last completed question. HomePage's `Test starten` CTA is the only fresh-start entry point.
- Still no Phase 1 MVP ship items: domain decision, free-tier hosting deploy, Spenden-Seite (Bitcoin/PayPal), Impressum/Datenschutz/Über pages, responsive audit.

**Next steps – product-depth track (continued):**
- Translate the remaining 50 O*NET items to German (dedicated session – needs native review per item).
- Extract `onet-occupations.json` out of the store chunk into its own lazy import inside the matcher.
- Add component-level tests for the assessment flow (`AssessmentPage` + `ResultsPage` rendering against a test store).

**Next steps – ship-it track (still untouched):**
- Domain decision + first hosting deploy (Cloudflare Pages / Vercel).
- Spenden-Seite: Bitcoin on-chain + Lightning + PayPal.
- Impressum / Datenschutz / Über pages (required before any public launch in DE).
- Responsive design audit across common mobile/tablet breakpoints.

---

### Session 4 – 2026-04-11
**Focus:** Routing bugfix for *Test neu starten* on `/ergebnis` + scoring pipeline integration tests against real O*NET data

**Meta / process refinements:**
- Clarified that on the dev-sandbox, Vite HMR serves filesystem edits to the user's browser immediately — git commits, branches, and pushes are purely for version control, not for "making changes visible". Previous sessions were implicitly conflating the two, which caused this session's own early mistake: after pushing the routing fix, the assistant branched off `main` for the integration-tests work, silently reverting `ResultsPage.vue` on disk and breaking the live fix the user was about to browser-test. Fixed in place; memory (`feedback_test_before_pr.md`) rewritten so future sessions edit-test-iterate-live and only commit/branch/push after user approval.
- Clarified SUMMARY.md discipline: **one entry per session, rides with the final PR only.** Multi-PR sessions do NOT fragment the session log across PRs. Earlier PRs in the session ship with no SUMMARY change. Memory (`feedback_summary_timing.md`) rewritten accordingly. This Session 4 entry ships in PR #7 and covers both PR #6 and PR #7.

**What was done — PR #6 (routing fix):**
- Traced the *Test neu starten* bug from Session 3's TODO list. Root cause: the button on `ResultsPage.vue` called `store.reset()` directly, clearing answers but leaving the user on `/ergebnis`. `isComplete` flipped to `false`, the `v-if="!store.isComplete"` branch at the top of the page rendered the *Du hast den Test noch nicht abgeschlossen* interstitial, and the user had to click an extra `→ Zum Test` link to actually start over.
- Fix: introduce a component-local `async function restart() { store.reset(); await router.push('/test') }` and bind the button to `restart`. The identical `@click="store.reset"` on `AssessmentPage` is **not** touched — it already lives at `/test`, so an in-place reset is correct there.
- Verified: browser-tested on the dev-sandbox by @mo-sp (click *Test neu starten* → direct to question 1, no interstitial, URL changes to `/test`, progress bar shows `1/10`, no console errors).

**What was done — PR #7 (scoring pipeline integration tests):**
- Added `src/features/matching/lib/matcher.integration.test.ts` with 8 new tests exercising the real scoring pipeline against `src/data/onet-occupations.json` (923 occupations) and `src/data/onet-items.json` (60 items). Complements but does not overlap the existing unit tests from Session 3.
- **Matcher-only** block (5 tests, synthesized `RIASECProfile` → matcher, no scoring layer):
  - top-20 sanity (length 20, monotonic desc by `fitScore`, well-formed `rank` 1..20, `fitScore ∈ [-1, 1]`)
  - identity check: fed Software Developers' own profile, matcher ranks `15-1252.00` first with `fitScore ≈ 1.0`
  - pure-Social `{R:1,I:1,A:1,S:5,E:1,C:1}` → ≥ 9/10 of top-10 in major group `25` (Education). Actual: 10/10.
  - pure-Realistic → ≥ 8/10 in `{37, 45, 47}` (Grounds / Agriculture / Construction). Actual: 10/10.
  - pure-Enterprising → ≥ 7/10 in `{11, 41}` (Management / Sales). Actual: 8/10.
- **Full pipeline** block (3 tests, `Answer[]` → `computeRiasecProfile` → `matchOccupations`):
  - dominant-I answers on the **PoC 10** items → ≥ 8/10 of top-10 in `{15, 19}` (Science / Math). Actual: 10/10.
  - dominant-I answers on the **full 60** items → identical assertion passes against the identical helper fed a larger item subset. Actual: 10/10. This is the forward-compat claim @mo-sp asked about at the start of the session: **scaling the questionnaire from 10 → 60 items requires no test changes.**
  - helper length check: asserts `makeRiasecAnswers(items, perDim, default)` emits exactly one `Answer` per riasec item in its input subset, and explicitly guards against the PoC silently growing to match the full item set.
- Key design choice: `makeRiasecAnswers(items: Question[], perDim, defaultValue = 3)` takes the item list as input and never hardcodes IDs or counts. Same helper runs both the 10-item and 60-item tests. Assertions are ≥ bounds (`≥ 7`/`≥ 8`/`≥ 9`) rather than exact ranks so future O*NET data refreshes that nudge a handful of occupations around do not spuriously break the suite — actual counts today have 1-3 occupations of headroom on every assertion.
- Verified: `npm test` → **32/32** passing (24 from Session 3 + 8 new), `npm run type-check` ✅, `npm run lint` ✅, `npm run build` ✅ (pre-existing 600 KB store-chunk warning unchanged). No browser test applicable — pure test-only addition, no UI impact.

**Commits / PRs:**
- Branch: `fix/results-restart-navigation` (off fresh `main` post-PR #5 merge)
  - `062cf82` fix(results): navigate to /test on restart to avoid interstitial
  - **PR mo-sp/pathfinder#6** → https://github.com/mo-sp/pathfinder/pull/6
- Branch: `test/scoring-integration` (off fresh `main`, independent of PR #6)
  - `19e0d18` test(scoring): add integration tests against real O*NET data
  - *(this SUMMARY commit)* docs(summary): add Session 4 entry for restart fix + integration tests
  - **PR mo-sp/pathfinder#7** → https://github.com/mo-sp/pathfinder/pull/7

**Known issues / TODOs:**
- Bundle-size warning (~600 KB `store` chunk) still unchanged since Session 2. Lazy-loading `onet-occupations.json` remains the cleanest fix and is now the oldest carry-over TODO.
- 50 of 60 O*NET items still only have English text.
- No tests yet for the Pinia `questionnaire` store (Session 4 added a helper that *would* feed it synthesized answers, but the store itself is still untested), the Dexie persistence layer, or any component/integration test. Still deferred.
- The new integration tests exercise the real data but **only** the pure-function layer (`computeRiasecProfile`, `matchOccupations`). A full Pinia-level store test still isn't here.
- One of the integration tests only gets 8/10 top-10 occupations in expected families for pure-Enterprising (tight against the `≥ 7` bound). If O*NET refreshes drop this by two more, the assertion will start flaking. Not urgent but worth a note.

**Next steps:**
- Replace the RIASEC bar chart with a proper hexagon/radar widget under `widgets/riasec-chart/`.
- Lazy-load `onet-occupations.json` out of the main store chunk.
- Translate the remaining 50 O*NET items to German.
- Eventually add Pinia-level questionnaire store tests (probably with `@pinia/testing`).

---

### Session 3 – 2026-04-11
**Focus:** Vitest setup + unit tests for `pearson.ts`, `riasec.ts`, `matcher.ts` (plus stacked-PR recovery)

**Meta / recovery:**
- Discovered that PR #2 (`feat/esco-german-titles`) and PR #3 (`docs/session-summary-pr-links`) had merged into their stacked parent branches (`feat/poc-scaffold` and `feat/esco-german-titles` respectively) rather than into `main`, leaving `main` stuck at PR #1's state. ESCO German titles, the `build-esco-german.mjs` script, and the Testing & Review Workflow docs were all orphaned in feature branches. Root causes: (a) repo setting `delete_branch_on_merge = false`, so GitHub never auto-retargeted child PRs when a parent merged; (b) feature branches were cut from each other locally rather than from a freshly-pulled `main`, so `gh pr create` defaulted each PR's base to the immediate parent feature branch.
- **Fix:** opened a one-shot catch-up PR from `feat/esco-german-titles` → `main`. Normal merge, no rewrites, no force-pushes. Pulled 8 commits (PRs #2 + #3 content) onto `main` in one go.
  - **PR mo-sp/pathfinder#4** → https://github.com/mo-sp/pathfinder/pull/4
- **Prevention:** flipped repo setting to `delete_branch_on_merge = true` via `gh api -X PATCH repos/mo-sp/pathfinder -f delete_branch_on_merge=true`. Future stacked PRs will now auto-retarget to the grandparent base as parents merge. Also saved memory (`feedback_stacked_pr_hygiene.md`) so future sessions default to branching from a freshly-pulled `main`.

**What was done:**
- Installed `vitest@^4.1.4` as a dev dependency. Added `npm test` (one-shot, used by pre-PR checks) and `npm run test:watch` (interactive watch mode) scripts to `package.json`. Added a `test` block to `vite.config.ts` (node environment, `src/**/*.test.ts` include pattern) so the existing `@features/*` / `@entities/*` path aliases resolve in tests automatically.
- Wrote 24 unit tests across the three pure-logic modules that drive the scoring pipeline:
  - **`src/features/scoring/lib/pearson.test.ts`** (9 tests) – empty/mismatched-length inputs return 0; zero-variance guard (no NaN); identical and linearly-scaled inputs → +1; inverse inputs → −1; hand-computed known value (`[1..5]` vs `[2,4,5,4,5]` → ~0.7746); symmetry.
  - **`src/features/scoring/lib/riasec.test.ts`** (9 tests) – `computeRiasecProfile` per-dimension Likert sums, ignores non-riasec layer answers, ignores answers referencing unknown `questionId`, ignores riasec questions carrying an invalid dimension letter; `normalizeRiasecToPercent` percent math against item counts, zero-count safety (no divide-by-zero), integer rounding.
  - **`src/features/matching/lib/matcher.test.ts`** (6 tests) – identical user/occupation profile ranks that occupation first with `fitScore ≈ 1`, results sort strictly descending by `fitScore`, `rank` field assigned 1..N, `topN` slicing, empty list returns empty, occupation references preserved (no defensive cloning).
- First config attempt imported `defineConfig` from `'vitest/config'`. This silently broke Vite **dev-mode** alias resolution (every `@app`/`@shared` import in `src/main.ts` failed with `Failed to resolve import`) while leaving `npm run build` and `npm test` working. A second root-level `.vite/` cache directory also appeared alongside the usual `node_modules/.vite/` — `vitest/config`'s `defineConfig` seems to apply extra wrapping that interferes with Vite 8's environment-aware alias plumbing in the dev server. **Fix:** switch back to `defineConfig` from `'vite'` and declare the `test` block's type via a `/// <reference types="vitest/config" />` directive (the other pattern the vitest docs recommend). Manually verified with a curl against `/src/main.ts` on a temporary port — the transform returned the real file paths like `App from "/src/app/App.vue"`.
- Verified: `npm test` → 24/24 passing, `npm run type-check` ✅, `npm run lint` ✅, `npm run build` ✅ (existing 500 KB store-chunk warning unchanged), dev server on `--host` mode serves the questionnaire end-to-end with German occupation titles on the Results page (confirmed by @mo-sp in the browser before PR).

**Commits / PRs:**
- Branch: `feat/vitest-scoring-tests` (branched from `main` **after** PR #4 merged — truly clean base)
- `a67b922` chore(tests): set up vitest with node env and path aliases
- `ff3cdf6` test(scoring): add unit tests for pearson, riasec, and matcher
- `fe13b50` fix(vite): use defineConfig from 'vite' with triple-slash vitest type ref
- **PR mo-sp/pathfinder#5** → https://github.com/mo-sp/pathfinder/pull/5
- Related: **PR mo-sp/pathfinder#4** → https://github.com/mo-sp/pathfinder/pull/4 (catch-up merge that put PRs #2 + #3 onto `main`)

**Known issues / TODOs:**
- **"Test neu starten" routing bug** (spotted during Session 3 smoke test, pre-existing — not introduced here): clicking *Test neu starten* on the Results page after a completed assessment bounces to a "Du hast den Test noch nicht abgeschlossen" interstitial with a `> Zum Test` link, and only then starts a new run. It eventually works but the interstitial shouldn't appear on this path — likely an assessment-route guard that checks for an in-progress session too eagerly.
- Bundle-size warning (~600 KB `store` chunk) unchanged since Session 2. Lazy-loading `onet-occupations.json` is still the cleanest fix.
- 50 of 60 O*NET items still only have English text.
- No tests yet for the Pinia `questionnaire` store, the Dexie persistence layer, or any component/integration test. Deferred.
- No integration test yet that runs the full scoring pipeline against the real `src/data/onet-occupations.json` (e.g. an all-Investigative profile should rank software/science occupations in the top 10).

**Next steps:**
- Fix the "Test neu starten" interstitial routing bug (small, scoped).
- Replace the RIASEC bar chart with a proper hexagon/radar widget under `widgets/riasec-chart/`.
- Lazy-load `onet-occupations.json` out of the main store chunk.
- Add an integration test that exercises scoring + matching against the real occupations JSON.
- Translate the remaining 50 O*NET items to German.

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
