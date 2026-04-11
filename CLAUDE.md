# CLAUDE.md – PathFinder

## Project

PathFinder is a free, privacy-first career aptitude assessment web app. It helps people discover their ideal career through validated psychometric models (Holland RIASEC, Big Five, personal values). German-first, open source, no login required.

## Tech Stack

- Vue 3 + TypeScript + Vite 7
- Pinia (state management)
- Dexie.js (IndexedDB for local persistence)
- Tailwind CSS
- vue-i18n (German first, i18n infrastructure ready)
- Feature-Sliced Design architecture

## Architecture

```
src/
├── app/          # App shell, router, global providers
├── pages/        # Route-level page components
├── widgets/      # Composed UI blocks (assessment stepper, charts, etc.)
├── features/     # Feature modules (questionnaire, scoring, matching, export)
├── entities/     # Data models (occupation, question, assessment)
├── shared/       # Base UI components, utilities, config
└── data/         # Static JSON (O*NET items, occupations, ESCO translations)
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint with ESLint
npm run type-check   # TypeScript type checking
```

## Code Style

- All code, comments, commit messages, and documentation in **English**
- App UI content (labels, questions, results) in **German**
- Use Composition API with `<script setup lang="ts">`
- Prefer `defineProps` / `defineEmits` with TypeScript generics
- Use Pinia stores with setup syntax (`defineStore` with function)
- Extract business logic into composables or lib/ functions
- Keep components focused – UI in components, logic in lib/

## Branching

- `main` is protected (PR required, no force pushes)
- Feature branches: `feat/short-description`
- Bug fixes: `fix/short-description`
- Always create a PR, never push directly to main

## Testing & Review Workflow

The order on every change is **automated checks → push → human browser test → PR**. Never skip the browser-test step.

For Claude Code sessions, that means:

1. **Make the change** and run automated checks: `npm run type-check`, `npm run lint`, `npm run build`. Add a Vitest test if appropriate; run `npm test`. **Update `SUMMARY.md` (and any other docs that describe the change) as part of this step**, so the PR you'll push contains its own session log – never with stale placeholders like "PR to be filed". Once a PR is approved, the branch is frozen: do not push more commits to it (not even docs).
2. **Commit and push** the branch to origin. Vite dev server on the dev-sandbox shares the same checkout, so the user's browser sees the change instantly via HMR – no extra deploy step.
3. **Provide explicit browser test instructions to the user**, including:
   - The exact URL to open (e.g. `http://192.168.178.33:5173/`, or whatever port the user's dev server is on)
   - The exact click path (e.g. "Start → Test starten → answer all 10 questions → Ergebnis")
   - **Concrete acceptance criteria** the user can tick off, e.g. "the top-10 list shows German occupation titles, not English", "the progress bar advances on each click", "no console errors". Be specific about what the *correct* result looks like; vague "check it works" is not enough.
   - Edge cases worth poking at if there's time (refresh mid-flow, hit Back, restart)
4. **Wait for user confirmation.** Type-check / lint / build / smoke tests are necessary but not sufficient – they catch shape and syntax problems, not "the right thing renders in the right place". The user's manual browser test is the final gate.
5. **Only after the user confirms** in the running app, run `gh pr create`. Treat `gh pr create` as a step that needs explicit user go-ahead, not a default end-of-task action.

If a user pushes back ("test before PR", "I want to verify this myself"), they mean it – do not retry the PR command, just provide the test instructions and wait.

## Data Sources

- O*NET Interest Profiler Short Form (60 items) → `src/data/onet-items-de.json`
- O*NET Occupation Database → `src/data/onet-occupations.json`
- ESCO German occupation names → `src/data/esco-occupations-de.json`
- ESCO↔O*NET mapping → `src/data/esco-onet-mapping.json`
- Licenses: O*NET Developer License (attribution required), ESCO EU Open Data

## Session Protocol

After each session, update `SUMMARY.md` with:
- Date, session focus
- What was built/changed
- Commits and PRs created
- Known issues or TODOs
- Next steps

## Key Principles

1. **Privacy first** – All assessment logic runs client-side. No data leaves the browser unless user opts in.
2. **Deterministic scoring** – No AI/LLM in the scoring pipeline. Results must be reproducible.
3. **Depth over breadth** – Make the assessment better before making it bigger.
4. **Accessible** – No login, no paywall, responsive, works on slow connections.
