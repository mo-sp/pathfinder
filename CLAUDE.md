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
