# PathFinder – Find Your Path
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

## 5. Scoring-Algorithmus

### Phase 1: RIASEC-Profil berechnen

```typescript
// Jede der 60 O*NET-Fragen gehört zu einer RIASEC-Dimension
// Antwortskala: 1 (strongly dislike) bis 5 (strongly like)
// Score pro Dimension = Summe der 10 zugehörigen Antworten
// Ergebnis: { R: 12, I: 38, A: 24, S: 18, E: 30, C: 15 }

interface RIASECProfile {
  R: number  // Realistic    (10-50)
  I: number  // Investigative (10-50)
  A: number  // Artistic      (10-50)
  S: number  // Social        (10-50)
  E: number  // Enterprising  (10-50)
  C: number  // Conventional  (10-50)
}
```

### Phase 2: Persönlichkeits-Overlay (Big Five)

```typescript
// 30 IPIP-Items → 5 Scores
// Wird als sekundärer Filter verwendet:
// z.B. hohe Extraversion + hohes E → Vertrieb/Management
//      niedrige Extraversion + hohes I → Forschung/Analyse

interface BigFiveProfile {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}
```

### Phase 3: Berufs-Matching

```typescript
// Pearson-Korrelation zwischen User-RIASEC und Berufs-RIASEC
// Gefiltert nach Werte-/Rahmenbedingungen (Schicht 3)

function matchOccupations(
  userProfile: RIASECProfile,
  occupations: Occupation[],
  filters: UserPreferences
): RankedOccupation[] {
  return occupations
    .map(occ => ({
      ...occ,
      fit: pearsonCorrelation(
        Object.values(userProfile),
        Object.values(occ.riasecProfile)
      )
    }))
    .filter(occ => applyFilters(occ, filters))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 20)
}
```

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

**Proof of Concept (Woche 1-2):**
- [ ] Projekt-Setup: Vue 3 + Vite + TypeScript + Tailwind + Pinia + Dexie
- [ ] Domain-Recherche: Verfügbarkeit prüfen, Name final entscheiden
- [ ] 10 O*NET-Items als Minimal-Fragebogen implementieren (Deutsch)
- [ ] Basis-Scoring: RIASEC-Summen berechnen & als Balkendiagramm anzeigen
- [ ] 20 Berufe als Test-JSON → einfaches Matching → Ergebnis-Liste
- [ ] Deploy auf Free-Tier-Hoster → erster spielbarer Prototyp live

**Vollständiger MVP (Woche 3-12):**
- [ ] O*NET Interest Profiler Short Form (60 Items) implementieren
- [ ] Deutsche Übersetzung der 60 Items (Referenz: OPEN RIASEC von opentest.ch)
- [ ] O*NET Occupation Database als statisches JSON aufbereiten
- [ ] Deutsche Berufsbezeichnungen via ESCO-Mapping einbinden
- [ ] RIASEC-Scoring implementieren
- [ ] Pearson-Korrelation Matching implementieren
- [ ] Ergebnis-Seite: Top-20-Berufe mit RIASEC-Profil-Vergleich
- [ ] RIASEC-Hexagon-Visualisierung (Radar-Chart)
- [ ] Responsive Design (Mobile-first)
- [ ] Fortschritt-Speicherung in IndexedDB (Session überdauert Tab-Schließen)
- [ ] O*NET Attribution korrekt einbinden
- [ ] Spenden-Seite: Bitcoin (On-Chain + Lightning) & PayPal
- [ ] Impressum, Datenschutz, Über-das-Projekt-Seite

### Phase 2 – Vertiefung (Monate 4-8)
**Ziel:** Tieferes, persönlicheres Assessment – das Herzstück des Projekts

- [ ] IPIP Big Five Short Form (30 Items) einbauen → Persönlichkeits-Overlay
- [ ] Werte-/Rahmenbedingungen-Fragebogen (Schicht 3, eigene Items)
  - Ausbildungsbereitschaft, Indoor/Outdoor, Team/Solo, Sicherheit vs. Freiheit
  - Einkommen vs. Sinnhaftigkeit, Mobilität, körperliche Belastung
- [ ] Fähigkeiten-Selbsteinschätzung (Schicht 4)
  - Matching gegen O*NET Ability-Daten pro Beruf
- [ ] Vertiefungsmodule pro RIASEC-Typ (zusätzliche 20-30 Fragen)
- [ ] Szenario-basierte Fragen ("Stell dir vor, du hast einen Tag frei…")
- [ ] Matching-Algorithmus verfeinern: gewichtete Kombination aus RIASEC + Big Five + Werte + Fähigkeiten
- [ ] Detaillierte deutsche Berufsprofile: Beschreibungen, typische Ausbildungswege (DACH)
- [ ] Ergebnis-Seite verbessern: Warum passt dieser Beruf zu dir? (algorithmische Erklärung)
- [ ] Share-Funktion (URL mit encoded Result, kein Backend nötig)
- [ ] Ergebnis-Export als PDF

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

| Kanal               | Ab Phase | Beschreibung                                     |
|----------------------|----------|--------------------------------------------------|
| Bitcoin (On-Chain)   | 1        | BTC-Adresse + QR-Code auf Spenden-Seite          |
| Bitcoin (Lightning)  | 1        | LNURL / Lightning Address für Mikro-Spenden      |
| PayPal               | 1        | Für Nicht-Crypto-Nutzer                           |
| GitHub Sponsors      | 1        | Open-Source-Community                             |
| Dezente Werbung      | 5        | Nur Ergebnis-Seite, keine Tracker, transparent    |
| Affiliate            | 5        | Weiterbildungsanbieter (gekennzeichnet)           |
| Beratungs-Vermittlung| 5        | Opt-in Vermittlung an Karriereberater             |

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
