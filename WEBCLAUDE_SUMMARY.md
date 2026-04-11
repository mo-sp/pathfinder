# WEBCLAUDE_SUMMARY.md – Webchat Session Protocol

## Project: PathFinder

---

### Session 1 – 2026-04-10
**Focus:** Project inception, research, architecture

**Key topics discussed:**
- Initial idea: deep, free, privacy-first career aptitude assessment
- Market research: existing competitors (Apt, JobTest.org, CareerSeeker AI, etc.)
- Framework selection: Holland RIASEC as core, Big Five as overlay, personal values as filter
- Data sources: O*NET Interest Profiler (Developer License), O*NET DB (CC BY 4.0), ESCO (EU Open Data), IPIP (Public Domain)
- Scoring algorithm: Likert → RIASEC profile → Pearson correlation against occupation profiles
- Tech stack validation: Vue 3 + TS + Vite + Pinia + Dexie + Tailwind confirmed
- Hosting: free tier for now, re-evaluate when scaling
- German-first approach, internationalization in Phase 4

**Decisions made:**
- Use O*NET Interest Profiler Short Form (60 items) as base (Developer License allows modification)
- Algorithmic scoring only, no LLM in the scoring pipeline
- Depth before breadth: improve assessment quality before scaling/mobile/i18n
- Name: PathFinder (working title, domain TBD)
- Donations (Bitcoin + PayPal) from end of Phase 1, other monetization → Phase 5
- Phase structure: MVP → Depth → Feedback/Data → International → Professional

**Open questions:**
- Final project name and domain
- GitHub repo name (`pathfinder` vs `path-finder` vs other)
- Exact German translations for O*NET items (reference: OPEN RIASEC from opentest.ch)

**Prepared for CC session:**
- CLAUDE.md, PROJECT.md, SUMMARY.md, WEBCLAUDE_SUMMARY.md
- SETUP_GUIDE.md with repo + VM setup instructions
- PROJECT_PLAN.md (full roadmap)

**Next steps:**
- Create GitHub repo
- Set up dev-sandbox with project scaffold
- CC Session 1: PoC with 10 items, basic scoring, result display

---

<!-- Template for new sessions:

### Session N – [DATE]
**Focus:** [topic]

**Key topics discussed:**
-

**Decisions made:**
-

**Open questions:**
-

**Next steps:**
-

-->
