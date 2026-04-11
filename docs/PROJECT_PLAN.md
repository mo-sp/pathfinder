# Berufung – Finde deinen Weg
## Projektplan & Technische Architektur

> *"Jeder Mensch hat ein Recht darauf, seine Berufung zu finden – unabhängig von Einkommen, Herkunft oder Bildungsstand."*

---

## 1. Vision & Abgrenzung

**Was Berufung ist:**
- Tiefes, mehrstufiges Career-Assessment (30-60 Min MVP, perspektivisch 2-3h)
- Komplett kostenlos, kein Login, keine Paywall
- Privacy-first: alle Daten lokal im Browser, optional anonymisiertes Backend
- Algorithmisches Scoring auf Basis validierter psychometrischer Modelle
- Open Source

**Was Berufung NICHT ist:**
- Kein 5-Minuten-Spaßquiz
- Keine AI-generierte Auswertung (deterministisch & reproduzierbar)
- Kein Daten-Harvesting-Produkt

---

## 2. Tech Stack

| Komponente        | Technologie                          | Begründung                              |
|-------------------|--------------------------------------|-----------------------------------------|
| Frontend          | Vue 3 + TypeScript + Vite            | Dein Stack, bewährt im Bushcraft-Planer |
| State Management  | Pinia                                | Assessment-Zustand & Ergebnisse         |
| Lokale Persistenz | Dexie.js (IndexedDB)                 | Fortschritt speichern ohne Backend      |
| Styling           | Tailwind CSS                         | Schnelle, responsive UI                 |
| i18n              | vue-i18n                             | Infrastruktur vorbereiten, Fokus erstmal DE |
| Backend (später)  | Supabase                             | Anonyme Statistiken, Row Level Security |
| Hosting           | Free Tier (Cloudflare Pages, Vercel, o.ä.) | Entscheidung bei Skalierung neu bewerten |
| SEO (später)      | Nuxt 3 oder vite-ssg                 | SSG für Landing Pages & Blog (spätere Phase) |
| Mobile (später)   | Capacitor                            | PWA-first, native Apps perspektivisch   |

---

## 3. Datenquellen & Lizenzen

### 3.1 Fragebogen-Items

| Quelle                          | Items | Lizenz                    | Verwendung              |
|---------------------------------|-------|---------------------------|-------------------------|
| O*NET Interest Profiler (Short) | 60    | O*NET Developer License   | RIASEC-Kern (Schicht 1) |
| IPIP Big Five (BFI-2-S)        | 30    | Public Domain             | Persönlichkeit (Schicht 2) |
| Eigene Items                    | ~30   | Eigene Lizenz             | Werte & Rahmenbedingungen (Schicht 3) |

**Gesamtumfang MVP:** ~120 Items in 3 Abschnitten

### 3.2 Berufsdatenbanken

| Quelle       | Berufe | Lizenz          | Daten                                |
|--------------|--------|-----------------|--------------------------------------|
| O*NET DB     | 900+   | CC BY 4.0       | RIASEC-Profile, Skills, Gehalt, Ausbildung |
| ESCO (EU)    | 3000+  | Open Data (EU)  | Mehrsprachige Berufsbezeichnungen, Skills |
| ESCO→O*NET   | Mapping| Frei verfügbar  | Brücke zwischen EU- und US-Taxonomie |

### 3.3 Zu klären / später

- BERUFENET (Bundesagentur): Kein offenes API, aber Beschreibungen können als Referenz für deutsche Berufstexte dienen
- Schweizer BIZ / Explorix: Proprietär, nur als Benchmark

---

## 4. Architektur

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Client)                    │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Assessment│  │ Scoring  │  │ Matching │  │ Results │ │
│  │ Engine   │→ │ Engine   │→ │ Engine   │→ │ Display │ │
│  │(Vue Comp)│  │(Pinia)   │  │(Worker)  │  │(Vue Comp│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│       ↕              ↕              ↕                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Dexie.js (IndexedDB)                 │   │
│  │  - Assessment Progress                            │   │
│  │  - User Responses                                 │   │
│  │  - Cached Occupation Data                         │   │
│  │  - Results History                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Static JSON Data (bundled)                │   │
│  │  - onet-occupations.json (RIASEC profiles)        │   │
│  │  - esco-translations.json (i18n Berufsnamen)      │   │
│  │  - scoring-weights.json (Matching-Algorithmus)    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         ↕ (optional, Phase 2+)
┌─────────────────────────────────────────────────────────┐
│              Supabase Backend (anonym)                    │
│  - Anonyme Antwortstatistiken (kein User-Bezug)          │
│  - Aggregierte Ergebnisdaten für Testverbesserung        │
│  - Spenden-Tracking                                      │
│  - Kein Login, keine User-Accounts                       │
└─────────────────────────────────────────────────────────┘
```

**Kern-Prinzip:** Die gesamte Assessment- und Matching-Logik läuft im Browser.
Das Backend ist optional und speichert nur anonymisierte, aggregierte Daten.

---

## 5. Scoring-Algorithmus – Progressive Verfeinerung

### Kernprinzip

Das Assessment ist ein **progressiver Trichter**, nicht drei separate Tests. Jeder Layer verfeinert die Ergebnisse des vorherigen. User sehen ihre Ergebnisse nach jedem Layer live aktualisiert — die Berufsliste wird mit jedem Schritt präziser.

```
Score_final(Beruf) =
    w1 × RIASEC_correlation          // Layer 1: Basis-Fit (Pearson, -1 bis 1)
  + w2 × BigFive_modifier            // Layer 2: Persönlichkeits-Reranking
  + w3 × Skills_match                // Layer 4: Fähigkeiten-Bonus
  − penalties(Values_conflicts)      // Layer 3: Werte-Konflikte (hart + weich)
```

### Layer 1: RIASEC-Profil (Trichter)

```typescript
// 60 O*NET-Fragen → 6 Dimensionen
// Score pro Dimension = Summe der 10 zugehörigen Antworten (10-50)
// Pearson-Korrelation gegen alle 923 Berufsprofile
// Ergebnis: ~80-100 realistische Kandidaten (Korrelation > 0.5)
// Dem User als "Zwischenergebnis / Draft" präsentiert

interface RIASECProfile {
  R: number  // Realistic    (10-50)
  I: number  // Investigative (10-50)
  A: number  // Artistic      (10-50)
  S: number  // Social        (10-50)
  E: number  // Enterprising  (10-50)
  C: number  // Conventional  (10-50)
}
```

### Layer 2: Persönlichkeits-Reranking (Big Five)

```typescript
// 30 IPIP-Items → 5 Scores
// Big Five RE-RANKT innerhalb des RIASEC-Trichters, filtert nicht raus.
// Beispiel bei hohem I/A-Profil:
//   introvertiert + gewissenhaft → Archivar, Restaurator, Datenanalyst steigen
//   extravertiert + offen → Wissenschaftsjournalist, Museumskurator steigen
// BigFive_modifier ist ein Multiplikator, kein eigener Score.
// Hohe Extraversion bei Beruf der Extraversion braucht → Boost
// Niedrige Extraversion bei gleichem Beruf → Dämpfung (aber nie Null)

interface BigFiveProfile {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}
```

### Layer 3: Werte & Rahmenbedingungen (Filter + Gewichtung)

```typescript
// Eigene Items → Harte Filter + weiche Gewichtungsanpassungen
// Hart: "Max 3 Jahre Ausbildung" → eliminiert Chirurg
// Weich: "Bevorzugt Outdoor" bei Mixed-Beruf → kleine Penalty
// Einzige Quelle für echte Eliminierungen

interface ValuesProfile {
  maxEducationYears: number
  prefersOutdoor: boolean
  prefersTeamwork: boolean
  incomeOverMeaning: number    // Spektrum
  mobilityWillingness: number
  physicalDemandTolerance: number
}
```

### Layer 4: Fähigkeiten-Selbsteinschätzung (Bonus)

```typescript
// Selbstbewertung gegen O*NET Ability-Daten pro Beruf
// Additiv: hohe Übereinstimmung → Bonus
// Niedrige Übereinstimmung eliminiert NICHT, sondern triggert:
// "Du müsstest diese Fähigkeiten entwickeln" Annotation
```

### Berufs-Matching (alle Layer kombiniert)

```typescript
function matchOccupations(
  riasec: RIASECProfile,
  bigFive: BigFiveProfile | null,
  values: ValuesProfile | null,
  skills: SkillsProfile | null,
  occupations: Occupation[]
): RankedOccupation[] {
  return occupations
    .map(occ => {
      const riasecFit = pearsonCorrelation(
        Object.values(riasec),
        Object.values(occ.riasecProfile)
      )
      const bfMod = bigFive ? computeBigFiveModifier(bigFive, occ) : 0
      const skillsMod = skills ? computeSkillsMatch(skills, occ) : 0
      const valuesPen = values ? computeValuesPenalty(values, occ) : 0

      return {
        ...occ,
        fitScore: W1 * riasecFit + W2 * bfMod + W3 * skillsMod - valuesPen,
        riasecCorrelation: riasecFit,
        bigFiveModifier: bfMod,
        skillsMatch: skillsMod,
        valuesPenalty: valuesPen,
        eliminated: values ? isHardConflict(values, occ) : false
      }
    })
    .filter(occ => !occ.eliminated)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 20)
}
```

### Optionale Adaptive Vertiefung

Bei uneindeutigem RIASEC-Profil (≥3 Dimensionen innerhalb von 5 Punkten) bietet das System gezielte Nachfragen aus der O*NET Interest Profiler Long Form (180 Items, 30 pro Dimension) an — aber nur für die unklaren Dimensionen. Kein User muss alle 180 Fragen beantworten.

---

## 6. Feature-Sliced Design – Ordnerstruktur

```
src/
├── app/                          # App-Shell, Router, Providers
│   ├── App.vue
│   ├── router.ts
│   └── styles/
│
├── pages/                        # Seiten (Routen)
│   ├── home/                     # Landing Page
│   ├── assessment/               # Fragebogen-Flow
│   ├── results/                  # Ergebnis-Seite
│   └── about/                    # Über das Projekt
│
├── widgets/                      # Zusammengesetzte UI-Blöcke
│   ├── assessment-stepper/       # Fortschrittsanzeige + Navigation
│   ├── riasec-chart/             # Hexagon/Radar-Chart der Ergebnisse
│   ├── occupation-card/          # Berufs-Empfehlungskarte
│   └── donation-banner/          # Spenden-CTA
│
├── features/                     # Feature-Module
│   ├── questionnaire/            # Fragen-Rendering & Antwort-Handling
│   │   ├── ui/
│   │   ├── model/                # Pinia Store: answers, progress
│   │   └── lib/                  # Item-Loading, Randomisierung
│   │
│   ├── scoring/                  # Auswertungslogik
│   │   ├── lib/
│   │   │   ├── riasec.ts         # RIASEC-Score-Berechnung
│   │   │   ├── big-five.ts       # Big-Five-Score-Berechnung
│   │   │   └── pearson.ts        # Korrelationsberechnung
│   │   └── model/                # Pinia Store: scores
│   │
│   ├── matching/                 # Berufs-Matching
│   │   ├── lib/
│   │   │   ├── matcher.ts        # Matching-Algorithmus
│   │   │   └── filters.ts        # Werte-/Präferenz-Filter
│   │   └── model/                # Pinia Store: results
│   │
│   ├── export/                   # Ergebnis-Export (PDF, Share-Link)
│   │   └── lib/
│   │
│   └── analytics/                # Anonyme Statistiken (optional)
│       └── lib/
│
├── entities/                     # Datenmodelle
│   ├── occupation/               # Berufs-Entity
│   │   ├── model/
│   │   │   └── types.ts          # Occupation, RIASECProfile, etc.
│   │   └── api/                  # O*NET/ESCO Daten-Loader
│   │
│   ├── question/                 # Frage-Entity
│   │   └── model/
│   │       └── types.ts          # Question, Scale, Section
│   │
│   └── assessment/               # Assessment-Session Entity
│       └── model/
│           └── types.ts          # Session, Progress, Answer
│
├── shared/                       # Geteilte Utilities
│   ├── ui/                       # Basis-Komponenten (Button, Card, etc.)
│   ├── lib/                      # Utilities (i18n, Dexie-Setup, etc.)
│   └── config/                   # Konstanten, Scoring-Gewichte
│
└── data/                         # Statische JSON-Daten
    ├── onet-items-en.json        # O*NET Interest Profiler Items (EN)
    ├── onet-items-de.json        # Deutsche Übersetzung
    ├── onet-occupations.json     # Berufe + RIASEC-Profile
    ├── esco-occupations-de.json  # ESCO Berufsnamen (DE)
    ├── esco-onet-mapping.json    # ESCO↔O*NET Crosswalk
    └── ipip-big5-items.json      # IPIP Big Five Items
```

---

## 7. Roadmap

> **Leitprinzip:** Erst Tiefe, dann Breite. Erst das Produkt wirklich gut machen, dann skalieren.

### Phase 1 – MVP (Monate 1-3)
**Ziel:** Funktionierender RIASEC-Test auf Deutsch mit Berufsempfehlungen
**Release-Strategie:** Kein Public Launch in Phase 1. Preview-Deploy auf Vercel für Freunde-Feedback, dann Phase 2 für echte Tiefe, Public Launch erst danach.

**Proof of Concept (Woche 1-2) — ✅ erledigt (CC Sessions 1-4):**
- [x] Projekt-Setup: Vue 3 + Vite + TypeScript + Tailwind + Pinia + Dexie
- [x] 10 O*NET-Items als Minimal-Fragebogen implementieren (Deutsch)
- [x] Basis-Scoring: RIASEC-Summen berechnen & als Balkendiagramm anzeigen
- [x] 923 Berufe aus O*NET DB als statisches JSON aufbereitet
- [x] Pearson-Korrelation Matching implementiert
- [x] Ergebnis-Seite: Top-10-Berufe mit Fit-Scores
- [x] 890/923 deutsche Berufsbezeichnungen via ESCO-Mapping
- [x] 32 Tests (Unit + Integration) für Scoring-Pipeline
- [x] O*NET Attribution im Footer

**Vollständiger MVP — CC Sessions 5-8:**

**CC Session 5 — Deutsche Übersetzung + 60-Item-Umstellung:**
- [ ] 50 verbleibende Items übersetzen (Referenz: OPEN RIASEC opentest.ch + Überarbeitung)
- [ ] AssessmentPage von 10 auf 60 Items umstellen
- [ ] Fortschrittsbalken anpassen (1/60)
- [ ] Bestehende Tests verifizieren (Integration-Tests sind auf 60 Items vorbereitet)

**CC Session 6 — RIASEC Hexagon-Chart + Top-20:**
- [ ] `widgets/riasec-chart/` als Radar/Hexagon (SVG oder Chart-Lib)
- [ ] ResultsPage auf Top-20 erweitern
- [ ] Alten Balkenchart ersetzen
- [ ] Optional: Profilvergleich (User vs. Beruf) in der Occupation Card

**CC Session 7 — Bundle-Optimierung + Dexie-Härtung:**
- [ ] `onet-occupations.json` lazy-loaden (dynamic import im Matcher)
- [ ] Dexie-Persistenz testen: Tab schließen → wiederkommen → Fortschritt da
- [ ] Tests für Dexie-Layer und ggf. Pinia Questionnaire Store
- [ ] Bundle-Size verifizieren (Ziel: initial chunk < 200 KB gzipped)

**CC Session 8 — Vercel Preview-Deploy (Friends-only):**
- [ ] `vercel.json` mit SPA-Rewrite (alle Routen → `index.html`)
- [ ] `<meta name="robots" content="noindex">` in `index.html`
- [ ] Dezenter "Früher Prototyp – Feedback willkommen" Hinweis im Footer
- [ ] Responsive Durchgang: Assessment-Flow + Results auf Mobile prüfen
- [ ] Prod-Build verifizieren + Deploy
- [ ] Kein Impressum / Datenschutz / Spenden nötig (nicht öffentlich)

→ **Nach Session 8:** Link an Freunde, Feedback sammeln, dann Phase 2.

**Auf Public Launch verschoben (nach Phase 2):**
- Domain-Entscheidung + eigene Domain verbinden
- Impressum, Datenschutz, Über-das-Projekt-Seite
- Spenden-Seite: Bitcoin (On-Chain + Lightning) & PayPal
- SEO-Basics

### Phase 2 – Vertiefung (Monate 4-8)
**Ziel:** Tieferes, persönlicheres Assessment mit progressiver Verfeinerung – das Herzstück des Projekts

**Progressive Scoring-Architektur:**
- [ ] Scoring-Engine umbauen: `Score_final = w1×RIASEC + w2×BigFive_modifier + w3×Skills − penalties(Values)`
- [ ] Ergebnis-Seite nach jedem Layer live aktualisieren (User sieht Top-20 sich verändern)
- [ ] Erklärungstext pro Beruf: "Warum passt dieser Beruf nach Layer X besser/schlechter?" (algorithmisch, kein AI)
- [ ] MatchResult erweitern: `riasecCorrelation`, `bigFiveModifier`, `skillsMatch`, `valuesPenalty` als transparente Komponenten

**Layer 2 – Big Five (Persönlichkeits-Reranking):**
- [ ] IPIP Big Five Short Form (30 Items) einbauen
- [ ] BigFive_modifier als Multiplikator implementieren (re-rankt innerhalb RIASEC-Trichter, eliminiert nicht)
- [ ] Deutsche Übersetzung der 30 Items

**Layer 3 – Werte & Rahmenbedingungen (Filter + Gewichtung):**
- [ ] Werte-Fragebogen (eigene Items, ~30 Fragen)
  - Ausbildungsbereitschaft, Indoor/Outdoor, Team/Solo, Sicherheit vs. Freiheit
  - Einkommen vs. Sinnhaftigkeit, Mobilität, körperliche Belastung
- [ ] Harte Filter (z.B. max Ausbildungsdauer) + weiche Penalties implementieren
- [ ] O*NET JobZone-Daten als Proxy für Ausbildungsdauer nutzen

**Layer 4 – Fähigkeiten-Selbsteinschätzung (Bonus):**
- [ ] Matching gegen O*NET Ability-Daten pro Beruf
- [ ] Niedrige Übereinstimmung → "Entwicklungsbedarf" Annotation (nicht Elimination)

**Optionale Adaptive Vertiefung:**
- [ ] Erkennung uneindeutiger RIASEC-Profile (≥3 Dimensionen innerhalb 5 Punkte)
- [ ] Gezielte Nachfragen aus O*NET Long Form (180 Items) nur für unklare Dimensionen
- [ ] UX: "Dein Profil ist noch nicht ganz eindeutig – möchtest du 10 weitere Fragen beantworten?"

**Sonstige Verbesserungen:**
- [ ] Vertiefungsmodule pro RIASEC-Typ (zusätzliche 20-30 Fragen)
- [ ] Szenario-basierte Fragen ("Stell dir vor, du hast einen Tag frei…")
- [ ] Detaillierte deutsche Berufsprofile: Beschreibungen, typische Ausbildungswege (DACH)
- [ ] Share-Funktion (URL mit encoded Result, kein Backend nötig)
- [ ] Ergebnis-Export als PDF

### 🚀 Public Launch (nach Phase 2)
**Ziel:** Echtes öffentliches Release mit rechtlicher Absicherung und Monetarisierung

- [ ] Domain-Entscheidung finalisieren + verbinden
- [ ] Impressum (§5 TMG)
- [ ] Datenschutzerklärung (IndexedDB-Hinweis, kein Tracking, ggf. Supabase opt-in)
- [ ] Über-das-Projekt-Seite
- [ ] Spenden-Seite: Bitcoin (On-Chain + Lightning) & PayPal
- [ ] `<meta name="robots">` entfernen, SEO-Basics
- [ ] "Prototyp"-Hinweis aus Footer entfernen
- [ ] Zweite Feedback-Runde mit denselben Testern (sehen den Sprung Phase 1 → 2)

### Phase 3 – Feedback & Daten (Monate 9-14)
**Ziel:** Das Assessment durch echte Nutzerdaten verbessern

- [ ] Supabase-Backend: anonyme Antwort-Statistiken (opt-in, DSGVO-konform)
- [ ] Feedback-System ("Hat dir die Empfehlung geholfen?" → Matching verbessern)
- [ ] Itemanalyse: Welche Fragen diskriminieren gut? (aus anonymen Daten)
- [ ] Lebensumstände-Modul (Familienstand, Behinderung, Quereinsteiger-Flag)
- [ ] Detaillierte Gehaltsspannen & Arbeitsmarkt-Perspektiven (DACH-Daten)
- [ ] Hosting-Entscheidung neu bewerten basierend auf Traffic

### Phase 4 – Internationalisierung & Reichweite (Jahr 2+)
**Ziel:** Von der deutschen Nische zum globalen Tool

- [ ] Englische Version (Items + Berufsdatenbank)
- [ ] i18n-Infrastruktur für Community-Übersetzungen (FR, ES, PT, …)
- [ ] SEO: Nuxt 3 Migration oder vite-ssg für Landing Pages & Blog-Content
- [ ] Blog / Content: SEO-Texte zu Berufsorientierung (DE + EN)
- [ ] Progressive Web App (PWA) Setup
- [ ] Matching gegen reale Stellenanzeigen (Job-Board-API-Integration)

### Phase 5 – Professionalisierung (Jahr 3+)
**Ziel:** Nachhaltiges Projekt mit optionalen Einnahmen

- [ ] Capacitor: Native Apps (iOS/Android)
- [ ] Zusammenarbeit mit Berufsberatung / Arbeitspsychologie
- [ ] Optionaler AI-Erklärungstext für Ergebnisse (LLM-Call, anonymisiert)
- [ ] Dezente, transparente Werbung (nur Ergebnis-Seite, keine Tracker)
- [ ] Affiliate: Links zu Weiterbildungsanbietern (transparent gekennzeichnet)
- [ ] Opt-in Vermittlung an Karriereberater

---

## 8. Finanzierung

**Grundsatz:** Das Produkt ist und bleibt kostenlos. Keine Paywall, nie.

| Kanal               | Ab Phase      | Beschreibung                                     |
|----------------------|---------------|--------------------------------------------------|
| Bitcoin (On-Chain)   | Public Launch | BTC-Adresse + QR-Code auf Spenden-Seite          |
| Bitcoin (Lightning)  | Public Launch | LNURL / Lightning Address für Mikro-Spenden      |
| PayPal               | Public Launch | Für Nicht-Crypto-Nutzer                           |
| GitHub Sponsors      | Public Launch | Open-Source-Community                             |
| Dezente Werbung      | 5             | Nur Ergebnis-Seite, keine Tracker, transparent    |
| Affiliate            | 5             | Weiterbildungsanbieter (gekennzeichnet)           |
| Beratungs-Vermittlung| 5             | Opt-in Vermittlung an Karriereberater             |

---

## 9. Namensfindung

Arbeitstitel: **PathFinder**

Favorit. International verständlich, transportiert die Metapher "seinen Weg finden".

Domain-Kandidaten (noch zu prüfen):
- pathfinder.careers
- mypathfinder.app
- findyourpath.app
- pathfinder-test.de
- pathfinder.quest
- getpathfinder.de

Weitere Namensideen als Backup:
- Berufung / Calling
- Kompass / TrueWork

→ **Phase 1:** Domain-Recherche & Verfügbarkeit prüfen, finale Entscheidung treffen

---

## 10. Rechtliche Hinweise

- O*NET Interest Profiler: **O*NET Tools Developer License** (Modifikation erlaubt, Attribution erforderlich)
- O*NET Database: **CC BY 4.0** (Attribution erforderlich)
- ESCO: **EU Open Data** (frei nutzbar)
- IPIP Items: **Public Domain** (keine Einschränkungen)
- DSGVO: Keine personenbezogenen Daten → minimale Anforderungen. Bei anonymem Backend: Datenschutzerklärung mit Opt-in für anonyme Statistiken.

---

## 11. Erste Schritte

1. **Repository erstellen** (`berufung` oder `calling`)
2. **O*NET Daten herunterladen**: https://www.onetcenter.org/database.html
   - `Interests.csv` (RIASEC-Profile pro Beruf)
   - `Occupation Data.csv` (Berufsbezeichnungen + Beschreibungen)
3. **O*NET Interest Profiler PDF herunterladen**: https://www.onetcenter.org/IP.html
   - 60 Items extrahieren und als JSON strukturieren
4. **ESCO Download**: https://esco.ec.europa.eu/en/use-esco/download
   - Deutsche Berufsbezeichnungen + ESCO↔SOC-Mapping
5. **Deutsche Übersetzung der 60 Items** (Referenz: OPEN RIASEC opentest.ch)
6. **Projekt aufsetzen**: Vite + Vue 3 + TypeScript Scaffold
7. **Proof of Concept**: 10 Fragen (Deutsch) → Score → Ergebnis-Liste

---

*Dieses Dokument ist ein lebendes Dokument und wird iterativ erweitert.*