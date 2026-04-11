# SUMMARY.md – Claude Code Session Protocol

## Project: PathFinder
## Environment: dev-sandbox (192.168.178.33)

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
