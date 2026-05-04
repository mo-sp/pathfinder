/* eslint-disable no-irregular-whitespace -- some O*NET title.de values
   contain non-breaking spaces; comments echo them verbatim. */
/**
 * Manual overrides for build-kldb-mapping.mjs. Keyed by O*NET-SOC code.
 *
 * Why this exists:
 *   The ISCO-4d → KldB-5d crosswalk used by the build script often produces
 *   many candidates with identical (Anf, Schwerpunkt, vote-count) tuples.
 *   The stem-overlap tiebreaker can't always distinguish the semantically
 *   right class from a container/catch-all class (e.g. 21124 Sprengtechnik,
 *   61394 Immo/Facility, 41204 Biologie). This file captures per-code
 *   output that must survive a full rebuild.
 *
 * How it is applied:
 *   build-kldb-mapping.mjs loads this map after computing the primary
 *   mapping; any entry here replaces the corresponding slot. Set kldbCode
 *   to null to suppress the subtitle line (the UI falls back to the
 *   jobZone-derived training category only).
 *
 * Seeded retrospectively: the prior JSON had diverged from what the build
 * script currently produces (Session-24 Sprengtechnik/Immo-Facility/
 * Biologie remaps + accumulated drift from title.de updates). This file
 * pins all 132 divergences so the initial "wire up overrides + tiebreaker"
 * migration is behaviour-preserving. A follow-up audit should walk each
 * entry and drop those that are not intentional manual fixes.
 */

export default {
  "11-1011.00": { kldbCode: "71104", kldbName: "Geschäftsführer und Vorstände - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Geschäftsführer/Geschäftsführerin
  // 11-1011.03 Chief Sustainability Officers pulled out of seed (was 71104 Geschäftsführer/Vorstände — Stabsrolle, kein Vorstand) → batch-11 block (71384 Unternehmensorg. sonstige Anf 4)
  "11-1021.00": { kldbCode: "71104", kldbName: "Geschäftsführer und Vorstände - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter des operativen Geschäftsbereichs/Leiterin des operativen Geschäftsbereichs
  "11-3013.01": { kldbCode: "53124", kldbName: "Berufe in Arbeitssicherheit und Sicherheitstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter Sicherheit / Leiterin Sicherheit
  "11-3031.03": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Investmentfondsmanager/Investmentfondsmanagerin
  // 11-3051.04 Biomass Plant Managers pulled out of seed (was 41393 Aufsichtskräfte Chemie — Domain-Drift) → batch-11 block (26234 Energie/Kraftwerk Anf 4)
  "11-3111.00": { kldbCode: "71594", kldbName: "Führungskräfte - Personalwesen und -dienstleistung", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter Vergütung und Zusatzleistungen / Leiterin Vergütung und Zusatzleistungen
  // 11-9071.00 Gambling Managers pulled out of seed (was 63124 Sport/Fitness — Drift; Glücksspiel-Domain 94342 catalog-only Anf 2 → sibling-domain-pivot to generic Führungskräfte) → batch-11 block (71394 Führungskräfte Unternehmensorganisation Anf 4)
  // 11-9072.00 Entertainment & Recreation Managers pulled out of seed (was 63124 Sport/Fitness) → batch-11 block (63194 Führungskräfte Tourismus/Sport Anf 4)
  "11-9179.01": { kldbCode: "63124", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter einer Sporteinrichtung/Leiterin einer Sporteinrichtung
  // 11-9179.02 Spa Managers pulled out of seed (was 63124 Sport/Fitness — "Heilbad" verfehlte Spa-Lesart) → batch-11 block (63194 Führungskräfte Tourismus/Sport Anf 4)
  // 11-9199.08 Loss Prevention Managers pulled out of seed (was 53122 Arbeitssicherheit Anf 2 — Manager-Tier verfehlt) → batch-11 block (53123 Arbeitssicherheit komplex Anf 3)
  "11-9199.09": { kldbCode: "61394", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Betriebsleiter Windpark / Betriebsleiterin Windpark
  // 11-9199.10 Wind Energy Project Managers pulled out of seed (was 61394 Immobilien — Drift) → batch-11 block (26244 Regenerative Energietechnik Anf 4)
  // 13-1081.01 Logistics Engineers pulled out of seed (was 51624 Speditions-/Logistikkaufleute — kaufmännisch-fokussiert; Logistics Engineers gestalten systemisch Transportnetzwerke) → batch-8 block (71384 Unternehmensorganisation sonstige hoch komplex Anf 4)
  // 13-1082.00 Project Management Specialists pulled out of seed (was 71393 Aufsichtskräfte — Tier-Mismatch zu Anf 4) → batch-8 block (71394 Führungskräfte Unternehmensorganisation Anf 4)
  // 13-1131.00 Fundraisers pulled out of seed (was 63123 Sport-/Fitnesskaufleute — Stem-Drift via "-kauf-") → batch-8 block (92113 Werbung/Marketing komplex Anf 3)
  "13-2051.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Anlage- und Vermögensberater/Anlage- und Vermögensberaterin
  "13-2052.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Finanzplaner/Finanzplanerin
  "13-2054.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Financial Risk Analyst/Financial Risk Analystin
  // 15-2031.00 Operations Research Analysts pulled out of seed (was 51624 Speditions-/Logistikkaufleute Anf 4 — stem-drift "Logistik") → batch-4 block (41104 Mathematik hoch komplex)
  "15-2051.01": { kldbCode: "71314", kldbName: "Berufe in der Unternehmensorganisation und -planung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Business-Intelligence-Analyst/Business-Intelligence-Analystin
  // 17-2031.00 Bioengineers/Biomedical pulled out of seed (was 26324 Mikrosystemtechnik — Biomedical Eng ist Med-Tech/Bio-Wissenschaft, nicht Mikrosystem) → batch-12 block (27104 Tech F&E ohne-Spez. Anf 4)
  "17-2112.01": { kldbCode: "53124", kldbName: "Berufe in Arbeitssicherheit und Sicherheitstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Ergonomie-Ingenieur/Ergonomie-Ingenieurin
  // 17-2112.02 Validation Engineers pulled out of seed (was 25194 Führungskräfte Maschinenbau — Validation ist QS, nicht Führung) → batch-12 block (27314 Tech QS Anf 4)
  // 17-2131.00 Materials Engineers pulled out of seed (was 25194 Führungskräfte Maschinenbau — Werkstoffingenieure sind nicht Führung sondern Spezialisten) → batch-12 block (41424 Werkstofftechnik Anf 4)
  // 17-2161.00 Nuclear Engineers pulled out of seed (was 41404 Physik — Nuklearingenieure sind Ingenieure, nicht Physiker) → batch-12 block (26234 Energie/Kraftwerktechnik Anf 4)
  "17-2199.07": { kldbCode: "26324", kldbName: "Berufe in der Mikrosystemtechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Ingenieur Photonik/Ingenieurin Photonik
  "17-2199.08": { kldbCode: "26124", kldbName: "Berufe in der Automatisierungstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Ingenieur Robotik und Autonome Systeme/Ingenieurin Robotik und Autonome Systeme
  "17-2199.09": { kldbCode: "26324", kldbName: "Berufe in der Mikrosystemtechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Nanosystem-Ingenieur/Nanosystem-Ingenieurin
  "17-2199.10": { kldbCode: "21124", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Energieingenieur/Energieingenieurin
  "17-2199.11": { kldbCode: "21124", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Ingenieur Solartechnik/Ingenieurin Solartechnik
  "17-3011.00": { kldbCode: "27212", kldbName: "Technische Zeichner - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // CAD-Bediener/CAD-Bedienerin
  "17-3012.00": { kldbCode: "27212", kldbName: "Technische Zeichner - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Elektrozeichner/Elektrozeichnerin
  "17-3013.00": { kldbCode: "27212", kldbName: "Technische Zeichner - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Maschinenbauzeichner/Maschinenbauzeichnerin
  // 17-3026.01 Nanotech Technologists pulled out of seed (was 26123 Anf 4 — code-Anf-Widerspruch: 26123 ist Anf-3-Klasse) → batch-12 block (41423 Werkstofftechnik komplex Anf 3 löst Inkonsistenz)
  // 19-1023.00 Zoologists/Wildlife Biologists: pulled out of seed → batch-10 (KldB → 41254 Zoologie Anf 4)
  // 19-2032.00 Materials Scientists: pulled out of seed → batch-10 (KldB → 41304 canonical Anf-4 sibling; resolves Anf-4-declared / 41303-Anf-3 contradiction)
  "21-1023.00": { kldbCode: "83124", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Sozialarbeiter Psychiatrie und Suchthilfe / Sozialarbeiterin Psychiatrie und Suchthilfe
  "23-1021.00": { kldbCode: "73154", kldbName: "Richter - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Friedensrichter/Friedensrichterin
  "23-1023.00": { kldbCode: "73154", kldbName: "Richter - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Richter/Richterin
  // 25-1123.00 English Teachers Postsecondary pulled out of seed (was 84124 Sekundarstufe — wrong tier, Postsecondary = Hochschule) → batch-5 block (84304 Hochschullehre Anf 4)
  // 25-1124.00 Foreign Language Teachers Postsecondary pulled out of seed (was 84454 außerschulische Sprachenlehrer) → batch-5 block (84304 Hochschullehre Anf 4)
  // 25-2022.00 Middle School Teachers pulled out of seed (was 84454 Sprachenlehrer — Sekundarstufe I deckt alle Fächer ab, nicht nur Sprachen) → batch-5 block (84124 Sekundarstufe Anf 4)
  "25-4013.00": { kldbCode: "73314", kldbName: "Berufe im Archivwesen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Museumstechniker und Restaurator / Museumstechnikerin und Restauratorin
  "27-2011.00": { kldbCode: "94214", kldbName: "Schauspieler - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Schauspieler/Schauspielerin
  "27-2021.00": { kldbCode: "94243", kldbName: "Athleten/Athletinnen und Berufssportler - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Berufssportler/Berufssportlerin
  // 27-2022.00 Coaches and Scouts moved to batch-7 block (KldB unchanged at 84503, but title-coupled and reject-vs-agent context belongs in batch-7)
  // 27-2023.00 Umpires/Referees pulled out of seed (was 63122 Sport-/Fitnesskaufleute — kaufmännisch, nicht sportlich) → batch-7 block (94243 Athleten/Berufssportler komplex Anf 3)
  "27-3091.00": { kldbCode: "71423", kldbName: "Dolmetscher und Übersetzer - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Dolmetscher/Dolmetscherin
  // 27-4011.00 Audio and Video Technicians pulled out of seed (was 82332 Tätowierer und Piercer — drift) → batch-7 block (94532 Bild- und Tontechnik fachlich Anf 2)
  // 29-1031.00 Dietitians and Nutritionists pulled out of seed (was 41204 "Futtermittelwissenschaftler"/Biologie ohne-Spez. — Domain-falsch; SOC ist Ernährungsberatung/Diätetik) → batch-15 block (81764 Diät-/Ernährungstherapie hoch komplex Anf 4)
  "29-1051.00": { kldbCode: "81804", kldbName: "Apotheker, Pharmazeuten/Pharmazeutinnen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Krankenhausapotheker/Krankenhausapothekerin
  "29-1128.00": { kldbCode: "84553", kldbName: "Trainer - Fitness und Gymnastik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Personal Trainer/Personal Trainerin
  "29-1222.00": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt für Pathologie / Fachärztin für Pathologie
  "29-1229.01": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt für Allergologie und Immunologie / Fachärztin für Allergologie und Immunologie
  // 29-2011.02 Cytotechnologists pulled out of seed (was 41204 Biologie ohne-Spez. — MTA-Domain falsch) → batch-15 block (81213 Medtech Labor komplex Anf 3)
  // 29-2055.00 Surgical Technologists (OTA) pulled out of seed (was 81102 Med-FA — OTA arbeiten im OP, nicht Praxisassistenz) → batch-15 block (81332 OP-/medtech Assistenz fachlich Anf 2)
  // 29-9092.00 Genetic Counselors pulled out of seed (was 41204 Biologie ohne-Spez. — Genetik-Beratungs-Domain) → batch-15 block (41274 Humanbiologie hoch Anf 4)
  // 29-9093.00 Surgical Assistants pulled out of seed (was 81102 Med-FA — OP-Assistenz-Domain) → batch-15 block (81332 OP-/medtech Assistenz fachlich Anf 2)
  "35-3011.00": { kldbCode: "63322", kldbName: "Barkeeper - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Barkeeper/Barkeeperin
  "35-3023.01": { kldbCode: "63322", kldbName: "Barkeeper - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Barista
  "35-9011.00": { kldbCode: null, kldbName: null, anforderungsniveau: 1, trainingCategory: "none" }, // Dining Room and Cafeteria Attendants and Bartender Helpers
  // 39-1014.00 First-Line Supervisors of Entertainment & Recreation Workers pulled out of seed (was 63122 Sport-/Fitnesskaufleute Anf 2 — Drift; KldB hat kein 63193 Aufsichtskraft-Tourismus/Sport, sibling-domain-pivot zu generic Aufsichtskräfte) → batch-13 block (71393 Aufsichtskräfte Unternehmensorganisation Anf 3)
  // 39-3031.00 Ushers/Lobby Attendants/Ticket Takers pulled out of seed (was 62112 Kassierer/Kartenverkäufer Anf 2 — Drift; Einlasskontrolle ≠ Kassieren) → batch-13 block (53111 Objekt-/Werte-/Personenschutz Helfer Anf 1)
  // 39-3092.00 Costume Attendants pulled out of seed (was 82332 Tätowierer/Piercer Anf 2 — komplett falsche Domain) → batch-13 block (94612 Bühnen-/Kostümbildnerei Anf 2)
  "39-7011.00": { kldbCode: "63142", kldbName: "Reiseleiter und Fremdenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Tour Guides and Escorts: KldB stays — seed correct; batch-13 changes title.de "Fremdenführer" → "Gästeführer"
  "39-7012.00": { kldbCode: "63142", kldbName: "Reiseleiter und Fremdenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Reiseleiter/Reiseleiterin
  // 39-9031.00 Exercise Trainers and Group Fitness Instructors pulled out of seed (was 63122 Sport-/Fitnesskaufleute Anf 2 — kaufmännisch, nicht Trainer-Tätigkeit) → batch-13 block (84553 Trainer Fitness/Gymnastik Anf 3, catalog-only Anf-3 sibling-Familie)
  // 39-9032.00 Recreation Workers pulled out of seed (was 84553 Trainer Fitness/Gymnastik Anf 3 — zu eng nach Fitness; auch durch 39-9031 belegt) → batch-13 block (83123 Sozialarbeit/Sozialpädagogik komplex Anf 3, parallel zu 39-9041 Residential Advisors)
  "41-2011.00": { kldbCode: "62112", kldbName: "Kassierer und Kartenverkäufer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kassierer/Kassiererin
  "41-2012.00": { kldbCode: "62112", kldbName: "Kassierer und Kartenverkäufer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kassierer Spielbank / Kassiererin Spielbank
  "41-9091.00": { kldbCode: "62301", kldbName: "Berufe im Verkauf von Lebensmitteln (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Straßenverkäufer von Lebensmitteln/Straßenverkäuferin von Lebensmitteln
  // 43-3031.00 Bookkeeping/Accounting Clerks: pulled out of seed → batch-9 (KldB → 72212 Buchhaltung)
  "43-4011.00": { kldbCode: "72122", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Back-Office-Mitarbeiter im Maklergeschäft/Back-Office-Mitarbeiterin im Maklergeschäft (audit batch 9: KldB stays — Anlageberater fits brokerage support; title only changed via title-overrides → "Wertpapiersachbearbeiter")
  // 43-4031.00 Court/Municipal/License Clerks: pulled out of seed → batch-9 (KldB → 73252 Justizverwaltung)
  "43-4131.00": { kldbCode: "72122", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kreditantragsbearbeiter/Kreditantragsbearbeiterin
  "43-5021.00": { kldbCode: "52182", kldbName: "Fahrzeugführer im Straßenverkehr (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Fahrradkurier/Fahrradkurierin
  "45-2041.00": { kldbCode: "29152", kldbName: "Nahrungsmittel- und Getränkekoster - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Milchkontrolleur/Milchkontrolleurin
  "45-2091.00": { kldbCode: "52512", kldbName: "Führer von land- und forstwirtschaftlichen Maschinen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Maschinenbediener für die landwirtschaftliche Produktion/Maschinenbedienerin für die landwirtschaftliche Produktion
  "45-2092.00": { kldbCode: "12101", kldbName: "Berufe im Gartenbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Gartenhilfsarbeiter/Gartenhilfsarbeiterin
  "45-4022.00": { kldbCode: "52512", kldbName: "Führer von land- und forstwirtschaftlichen Maschinen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Forstmaschinenführer/Forstmaschinenführerin
  // 47-3011.00 Helpers-Brickmasons/Stonemasons/Tile Setters pulled out of seed (was 32212 Pflasterer/Steinsetzer Anf 2 — falscher Tier, Pflasterer ist eigenständiger Ausbildungsberuf) → batch-14 block (32101 Hochbau Helfer Anf 1)
  "47-4051.00": { kldbCode: "51212", kldbName: "Straßen- und Tunnelwärter - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Straßenunterhaltungsarbeiter/Straßenunterhaltungsarbeiterin
  // 47-4071.00 Septic Tank Servicers/Sewer Pipe Cleaners pulled out of seed (was 32201 Tiefbau Helfer Anf 1 — Reinigungstätigkeit ist Wasser-/Abwasser-Domain) → batch-14 block (34312 Wasserversorgung/Abwasser Anf 2)
  // 47-5044.00 Underground Mining Loading Machine Operators pulled out of seed (was 32222 Straßen-/Asphaltbau — Drift) → batch-14 block (21112 Berg-/Tagebau Anf 2)
  "49-2094.00": { kldbCode: "26122", kldbName: "Berufe in der Automatisierungstechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Elektroniker Gewerbliche Geräte / Elektronikerin Gewerbliche Geräte
  // 49-3031.00 Bus/Truck Mechanics pulled out of seed (was 25112 Maschinen-/Gerätezusammensetzer — zu fertigungs-fokussiert für Diagnostik/Reparatur) → batch-6 block (25212 Kfz-Technik fachlich)
  // 49-3043.00 Rail Car Repairers pulled out of seed (was 25112 Maschinen-/Gerätezusammensetzer — generisch) → batch-6 block (51112 Eisenbahnbetrieb fachlich)
  // 49-9045.00 Refractory Materials Repairers pulled out of seed (was 32122 Maurerhandwerk — Bauberuf, SOC explizit "Except Brickmasons") → batch-6 block (21412 Industriekeramik)
  // 49-9062.00 Medical Equipment Repairers pulled out of seed (was 26122 Automatisierungstechnik Anf 4 — falsche Domain + zu hoher Tier) → batch-6 block (82503 Medizintechnik komplex Anf 3, Techniker-Tier)
  "51-2011.00": { kldbCode: "25112", kldbName: "Maschinen- und Gerätezusammensetzer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Flugzeugmonteur/Flugzeugmonteurin
  "51-3022.00": { kldbCode: "29201", kldbName: "Berufe in der Lebensmittelherstellung (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Fleischverarbeitungskraft
  "51-4021.00": { kldbCode: "24122", kldbName: "Berufe in der Metallumformung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Maschinen- und Anlagenführer Strangpressen und Ziehen / Maschinen- und Anlagenführerin Strangpressen und Ziehen
  // 51-6011.00 Laundry and Dry-Cleaning Workers pulled out of seed (was 54101 Reinigung ohne-Spez. Helfer Anf 1 — Textilreiniger ist eigener IHK-Ausbildungsberuf Anf 2 in dedizierter KldB-Klasse) → batch-17 block (54132 Textilreinigung fachlich Anf 2)
  "51-6021.00": { kldbCode: null, kldbName: null, anforderungsniveau: 1, trainingCategory: "none" }, // Bügler/Büglerin
  "51-6031.00": { kldbCode: "28221", kldbName: "Berufe in der Bekleidungs-, Hut- und Mützenherstellung - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Maschinennäher/Maschinennäherin
  "51-6051.00": { kldbCode: "28221", kldbName: "Berufe in der Bekleidungs-, Hut- und Mützenherstellung - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Textilgestalter im Handwerk – Sticken/Textilgestalterin im Handwerk – Sticken
  "51-7032.00": { kldbCode: "27232", kldbName: "Berufe im Modellbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Holzmodellbauer/Holzmodellbauerin
  "51-8021.00": { kldbCode: "25122", kldbName: "Maschinen- und Anlagenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kesselwärter/Kesselwärterin
  "51-9032.00": { kldbCode: "25122", kldbName: "Maschinen- und Anlagenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Rollenschneider/Rollenschneiderin
  "53-2011.00": { kldbCode: "52313", kldbName: "Piloten/Pilotinnen und Verkehrsflugzeugführer - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Flugzeugführer/Flugzeugführerin
  "53-2012.00": { kldbCode: "52313", kldbName: "Piloten/Pilotinnen und Verkehrsflugzeugführer - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Verkehrsflugzeugführer/Verkehrsflugzeugführerin
  // 53-3031.00 Driver/Sales Workers pulled out of seed (was 52112 PKW — SOC ist Lieferung+Verkauf, also Gütertransport) → batch-16 block (52122 LKW Anf 2)
  "53-3032.00": { kldbCode: "52122", kldbName: "Berufskraftfahrer (Güterverkehr/LKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Lastkraftwagenfahrer/Lastkraftwagenfahrerin
  // 53-3033.00 Light Truck Drivers pulled out of seed (was 52112 PKW — Light Truck/Van fährt Waren aus, ist Gütertransport) → batch-16 block (52122 LKW Anf 2)
  "53-3051.00": { kldbCode: "52132", kldbName: "Bus- und Straßenbahnfahrer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Oberleitungsbusfahrer/Oberleitungsbusfahrerin
  "53-3052.00": { kldbCode: "52132", kldbName: "Bus- und Straßenbahnfahrer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Omnibusfahrer/Omnibusfahrerin
  // 53-3053.00 Shuttle Drivers and Chauffeurs pulled out of seed (was 52132 Bus/Straßenbahn — Shuttle/Chauffeur fährt PKW/Kleinbus, kein Linienbus) → batch-16 block (52112 PKW Anf 2)
  "53-3054.00": { kldbCode: "52112", kldbName: "Berufskraftfahrer (Personentransport/PKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Taxifahrer/Taxifahrerin
  "53-4011.00": { kldbCode: "52202", kldbName: "Triebfahrzeugführer im Eisenbahnverkehr (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Schienenfahrzeugführer/Schienenfahrzeugführerin
  // 53-4022.00 Railroad Brake/Signal/Switch Operators pulled out of seed (was 51632 Verkehrskaufleute — Bedienung Signalanlagen + Waggon-Kuppeln ist tech Eisenbahnbetrieb) → batch-16 block (51112 tech Eisenbahn Anf 2)
  "53-4041.00": { kldbCode: "52132", kldbName: "Bus- und Straßenbahnfahrer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // U-Bahn- und Straßenbahnfahrer/U-Bahn- und Straßenbahnfahrerin
  // 53-5011.00 Sailors and Marine Oilers pulled out of seed (was 52422 Schiffsführer Binnen — Schiffsführer ist Kapitänsrolle; Matrose ist Decksmannschaft) → batch-16 block (51432 Service Schiffsverkehr Anf 2)
  "53-5022.00": { kldbCode: "52422", kldbName: "Schiffsführer in Binnenschifffahrt und Hafenverkehr - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Seelotse/Seelotsin
  // 53-6021.00 Parking Attendants pulled out of seed (was 52112 PKW-Berufskraftfahrer — Parking Attendants parken Autos, fahren keine Kunden) → batch-16 block (52182 Fahrzeugführer Straßenverkehr sonstige Anf 2)
  // 53-6032.00 Aircraft Service Attendants pulled out of seed (was 52122 LKW — betanken/warten Flugzeuge am Boden = Bodenabfertigung Luftverkehr, kein LKW-Gütertransport) → batch-16 block (51122 tech Luftverkehrsbetrieb Anf 2)
  "53-7011.00": { kldbCode: null, kldbName: null, anforderungsniveau: 1, trainingCategory: "none" }, // Conveyor Operators and Tenders
  // 53-7021.00 Crane and Tower Operators pulled out of seed (was 51242 Wasserstraßen-/Brückenwärter — Drift; Crane/Tower-Operators führen Krane, kein Infrastrukturwächter) → batch-16 block (52532 Kranführer Anf 2)
  // 53-7041.00 Hoist and Winch Operators pulled out of seed (was 51242 Wasserstraßen-/Brückenwärter — Hoist/Winch-Operators bedienen Hebemaschinen, kein Infrastrukturwächter) → batch-16 block (52532 Kranführer Anf 2)
  // 53-7051.00 Industrial Truck and Tractor Operators pulled out of seed (was 52122 LKW — Gabelstapler/Flurförderzeuge fahren in Lagerhallen, kein LKW-Güterverkehr) → batch-16 block (51312 Lagerwirtschaft fachlich Anf 2)

  // Tiebreaker regressions from the compound-noun substring fix (2026-04-23).
  // The improved tiebreaker picks these wrongly because a generic German
  // compound-noun substring matches more tokens in the wrong candidate than
  // in the semantically right one. Pin each back to its prior correct value.
  "15-2041.00": { kldbCode: "41114", kldbName: "Berufe in der Statistik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Statistiker (Statistik > Mathematik ohne Spez.)
  "17-3023.00": { kldbCode: "26123", kldbName: "Berufe in der Automatisierungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Elektroniker Automatisierungstechnik (literal match with candidate)
  "17-3027.01": { kldbCode: "25213", kldbName: "Berufe in der Kraftfahrzeugtechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Kraftfahrzeugbautechniker (literal match)
  "47-4099.03": { kldbCode: "33312", kldbName: "Berufe in der Isolierung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Weatherization Installers (Isolierung is the correct domain)
  // 51-3091.00 Food/Tobacco Roasting/Baking/Drying pulled out of seed (was 22312 Holztrocknung — Stem-Drift via "Trocknung", SOC ist Lebensmittel/Tabak nicht Holz) → batch-17 block (29282 Lebensmittel-sonstige fachlich Anf 2)
  "51-4041.00": { kldbCode: "24202", kldbName: "Berufe in der Metallbearbeitung (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Zerspanungsmechaniker (Zerspanen = spanend, not spanlos)
  "51-9195.04": { kldbCode: "21332", kldbName: "Berufe in der industriellen Glasbläserei - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Glasbläser (industrielle Glasbläserei, not Glasapparatebau)

  // Container-abuse overrides — batch 1 (2026-04-24).
  // Cases where the primary mapping routes a code to a container KldB class
  // that has nothing to do with the occupation. Targets chosen against the
  // KldB 2010 catalog + SOC-4/SOC-3 sibling lookup; reviewed with @mo-sp.
  // Same mechanism-family as Session-24's Sprengtechnik/Immo-Facility/
  // Biologie cleanup.
  "13-1031.00": { kldbCode: "72133", kldbName: "Versicherungskaufleute - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Schadensregulierer: was Landwirtschaftliche Sachverständige
  "19-3093.00": { kldbCode: "91224", kldbName: "Berufe in Geschichtswissenschaften - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Historiker: was Philosophie, Religion und Ethik — exact Geschichtswissenschaften class
  "23-2011.00": { kldbCode: "73112", kldbName: "Assistenzkräfte in Rechtsanwaltskanzlei und Notariat - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Rechtsanwaltsfachangestellte: was Detektive
  // 23-2093.00 Title Examiners pulled out of seed (was 73112 Anf 2) → batch-3 block (73113 Anf 3, eigenständige Spezialistentätigkeit)
  "25-2059.01": { kldbCode: "84504", kldbName: "Sportlehrer (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Sportlehrer für Menschen mit Behinderung: was Führungskräfte Pferdewirtschaft
  // 25-3021.00 Self-Enrichment Teachers pulled out of seed (was 83122 Sozialarbeit/Sozialpädagogik Anf 2 — Sozialarbeit-Drift via "Lebensberater"-Title-Konnotation) → batch-5 block (84483 außerschulische Bildung Anf 3, Hobby/VHS-Kursleiter)
  "27-4015.00": { kldbCode: "94512", kldbName: "Berufe in der Veranstaltungs- und Bühnentechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Beleuchtungstechniker: was Tätowierer (prior seed pin was not a manual fix — corrected here)
  "33-3011.00": { kldbCode: "53242", kldbName: "Berufe im Justizvollzugsdienst - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Justizwachtmeister: was Detektive
  "33-3041.00": { kldbCode: "51512", kldbName: "Berufe in der Überwachung und Steuerung des Straßenverkehrsbetriebs - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Parking Enforcement Workers: was Jagdwirtschaft; title.de also updated "Ordnungshüter" → "Mitarbeiter Verkehrsüberwachung"
  "39-3091.00": { kldbCode: null, kldbName: null, anforderungsniveau: 1, trainingCategory: "none" }, // Mitarbeiter Freizeitpark: was Objekt-/Personenschutz-Helfer — no clean KldB class, suppress subtitle
  "47-2061.00": { kldbCode: "32102", kldbName: "Berufe im Hochbau (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Hochbauhelfer: was Sprengtechnik
  "47-2211.00": { kldbCode: "24412", kldbName: "Berufe im Metallbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Konstruktionsmechaniker Feinblechbau: was Klempnerei
  // 47-5011.00 Derrick Operators (Oil and Gas) pulled out of seed (was 94512 Veranstaltungstechnik — Drift via "Bühne"; SOC ist Erdöl-/Erdgasbohranlage) → batch-14 block (21112 Berg-/Tagebau Anf 2)
  "49-2091.00": { kldbCode: "26332", kldbName: "Berufe in der Luftverkehrs-, Schiffs- und Fahrzeugelektronik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Avioniker: was Automatisierungstechnik (generic)
  // 53-7065.00 Stockers and Order Fillers pulled out of seed (was 51312 Lagerwirtschaft fachlich Anf 2 — Stockers sind Anlerntätigkeiten, kein Ausbildungsberuf) → batch-16 block (51311 Lagerwirtschaft Helfer Anf 1, sibling-down)

  // Container-abuse overrides — batch 2 (2026-04-24).
  // Remaining Session-26 browser-test (A) findings plus the older scan-based
  // entries from BACKLOG. Reviewed with @mo-sp; each target verified against
  // scripts/input/kldb-data.json (full KldB 2010 catalog).
  "15-2041.01": { kldbCode: "41114", kldbName: "Berufe in der Statistik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Biometriker: was Mathematik (ohne Spez.) — same family as Statistiker 15-2041.00
  "17-1021.00": { kldbCode: "31213", kldbName: "Berufe in der Vermessungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Katasteringenieur: was Baustoffherstellung
  // 19-2099.01 Remote Sensing Scientists: moved → batch-10 (KldB → 43144 Geoinformatik Anf 4 — audit confirms Anf-4 tier is correct, prior Anf-3-cap reasoning superseded)
  "19-4099.03": { kldbCode: "31213", kldbName: "Berufe in der Vermessungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Fernerkundungstechniker: was chemisch-technisches Labor
  "27-3042.00": { kldbCode: "92413", kldbName: "Redakteure/Redakteurinnen und Journalisten/Journalistinnen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Technischer Redakteur: was Stenotypisten
  "39-9041.00": { kldbCode: "83123", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Jugendarbeiter: was Verbraucherberatung
  "43-9061.00": { kldbCode: "71402", kldbName: "Büro- und Sekretariatskräfte (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bürokraft (allgemein): was Umweltschutzverwaltung
  "47-5032.00": { kldbCode: "21122", kldbName: "Berufe in der Sprengtechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sprengstoffarbeiter: was Chemie-/Pharmatechnik — Session-24 emptied 21122 of engineers, but the actual explosives-worker belongs here
  // 49-3021.00 Automotive Body Repairers pulled out of seed (was 25213 Kfz-Technik komplex Anf 3 — bumped für Oldtimerrestaurator-Spezialisierung) → batch-6 block (25212 Anf 2, coupled-down zum neuen generischen Title "Karosserie- und Fahrzeugbaumechaniker" = IHK-Geselle-Tier)
  "51-9051.00": { kldbCode: "24112", kldbName: "Berufe in der Hüttentechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Koksofensteuerer: was Chemie-/Pharmatechnik — coke ovens are metallurgy, not pharma
  // 53-1044.00 First-Line Supervisors of Passenger Attendants pulled out of seed (was 51422 Service Luftverkehr fachlich Anf 2 — Purser hat Aufsichtsfunktion über Kabinenbesatzung, kein Service-Tier) → batch-16 block (51493 Aufsichtskräfte Personenverkehr Servicebereich Anf 3)

  // Container-abuse overrides — batch 3 (2026-04-24).
  // Surfaced during the Cluster-B investigation (originally listed as
  // "category-phrase as primary display") — catalog lookup showed each of
  // these is in fact a wrong KldB mapping, not a rendering issue. Same
  // SOC-sibling lookup + kldb-data.json verification as batches 1/2.
  "11-3051.02": { kldbCode: "26234", kldbName: "Berufe in der Energie- und Kraftwerkstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Geothermal Production Managers: was Sprengtechnik — geothermal plant operators (51-8011/8012/8013) all sit at 26233 Energie-/Kraftwerkstechnik komplex, the manager tier is 26234
  "17-2051.00": { kldbCode: "31104", kldbName: "Berufe in der Bauplanung und -überwachung (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Civil Engineers: was Metallbau — core Bauingenieur role, the unspecialised planning-and-oversight class at hoch-komplex tier is the natural home
  "17-2051.01": { kldbCode: "31134", kldbName: "Berufe in der Bauplanung von Verkehrswegen und -anlagen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Transportation Engineers (Verkehrsingenieur): was Metallbau — transport-infrastructure planning class at same tier as Civil Engineers
  "17-2141.01": { kldbCode: "25104", kldbName: "Berufe in der Maschinenbau- und Betriebstechnik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Fuel Cell Engineers: was Sprengtechnik — fuel cells are an energy-conversion mech-engineering topic, matches the parent 17-2141.00 (Mechanical Engineers) which already sits at 25104
  // 29-2036.00 Medical Dosimetrists pulled out of seed (was 81233 Radiologie komplex Anf 3 — Medizinphysikexperte ist Master-Tier) → batch-15 block (81234 Radiologie hoch Anf 4)
  "43-4111.00": { kldbCode: "91342", kldbName: "Berufe in der Markt- und Meinungsforschung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Interviewers, Except Eligibility and Loan: was Auskunft und Kundeninformation — survey/market-research interviewers, 91342 is the exact domain class

  // Container-abuse overrides — batch 4 (2026-04-24).
  // (1) Five tiebreaker victims surfaced during the Session-30 browser test:
  // "Sachverständige" stem-overlap pulled three codes into 11123 Landwirt-
  // schaftliche Sachverständige, the Kriminaldienst codes landed in non-
  // Kriminal classes. (2) Six medical-specialty entries moved out of the
  // seed block — they had been routed to 81414 Kinder- und Jugendmedizin
  // via stem-overlap because KldB 2010 lacks a dedicated 5d class for
  // most physician specialties (only 81414, 81454, 81464, 81814 exist).
  // The 81404 "ohne Spezialisierung" fallback (already home to 29-1222
  // Pathologie + 29-1229.01 Allergologie) is the right pattern;
  // Neurologie/Psychiatrie additionally has its own 81464 class.
  "13-1032.00": { kldbCode: "25213", kldbName: "Berufe in der Kraftfahrzeugtechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Kfz-Schadensgutachter: was Landwirtschaftliche Sachverständige — Kfz-Sachverständige sind technisch verankert (Kfz-Meister mit Sachverständigen-Bestellung), 25213 trifft die Fachexpertise
  // 13-1041.04 Government Property Inspectors moved from batch-4 to batch-8 (batch-4 hatte 31163 Bausachverständige basierend auf Title-Lesart "Property = Bauwerke"; SOC ist tatsächlich Vertrags-/Regelungs-Compliance) → batch-8 block (53313 Gewerbeaufsicht komplex Anf 3)
  "13-2023.00": { kldbCode: "31163", kldbName: "Bausachverständige und Baukontrolleure/-kontrolleurinnen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Immobiliengutachter: was Landwirtschaftliche Sachverständige — Immobilienbewertung ist Bausachverständige-Aufgabe, 61313 Immobilienvermarktung ist Sales nicht Gutachten
  "33-3021.00": { kldbCode: "53223", kldbName: "Berufe im Kriminaldienst - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Kommissar Kriminalpolizei: was Privatdetektive (Anf 2 → 3 — Kommissar = gehobener Polizeidienst, Bachelor-Eingang); SOC-Sibling 33-3021.02 sitzt bereits in 53222 fachlich
  "33-3021.06": { kldbCode: "53223", kldbName: "Berufe im Kriminaldienst - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Kriminalanalyst (title.de updated): was Wirtschaftsförderung — Intelligence Analysts arbeiten kriminalistisch-analytisch, gehobener Dienst
  "29-1214.00": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Notfallmediziner: was Kinder- und Jugendmedizin — keine 5d-Klasse für Notfallmedizin in KldB 2010, 81404 ist der korrekte Fallback
  "29-1217.00": { kldbCode: "81464", kldbName: "Fachärzte/-ärztinnen in der Neurologie, Psychiatrie, Psychotherapie und psychosomatischen Medizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt Neurologie: was Kinder- und Jugendmedizin — 81464 ist die explizite Neurologie/Psychiatrie-Klasse
  "29-1218.00": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Frauenarzt: was Kinder- und Jugendmedizin — keine 5d-Klasse für Gynäkologie, 81404 Fallback
  "29-1223.00": { kldbCode: "81464", kldbName: "Fachärzte/-ärztinnen in der Neurologie, Psychiatrie, Psychotherapie und psychosomatischen Medizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Psychiater: was Kinder- und Jugendmedizin — 81464 enthält Psychiatrie explizit
  "29-1229.03": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Urologe: was Kinder- und Jugendmedizin — keine 5d-Klasse für Urologie, 81404 Fallback
  "29-1242.00": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Orthopäde: was Kinder- und Jugendmedizin — keine 5d-Klasse für Orthopädie, 81404 Fallback (gleiches Muster wie 29-1222.00 Pathologe)

  // Container-abuse overrides — batch 5 (2026-04-25).
  // Two non-medical drift codes from Session 21's BACKLOG entry:
  // Agraringenieur was routed to Papierverarbeitung via stem-overlap on
  // "-technik"; Naturschutz-Wissenschaftler had been seed-pinned to
  // Reiseleiter (drift, not intentional). Both are studies-tier roles
  // that map cleanly onto existing KldB ohne-Spez/Ökologie classes.
  "17-2021.00": { kldbCode: "11104", kldbName: "Berufe in der Landwirtschaft (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Agraringenieur: was Papierverarbeitung — keine eigene 5d-Klasse für Agraringenieurwesen, 11104 ist der ohne-Spez-Fallback (gleiches Muster wie 81404 für Ärzte ohne dedizierte Spezialisierung)
  "19-1031.03": { kldbCode: "41234", kldbName: "Berufe in der Biologie (Ökologie) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Wissenschaftler Natur- und Artenschutz: was Reiseleiter (Anf 3 → 4 — Wissenschaftler = Studienberuf); 41234 ist die exakte Ökologie-Klasse für Naturschutzwissenschaftler
  "19-4099.01": { kldbCode: "27312", kldbName: "Berufe in der technischen Qualitätssicherung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Quality Control Analysts: was technische F&E (sonstige spezifische) — 27312 ist der exakte QA-Domain-Match; coupled mit title.de "Schuhwarenqualitätskontrolle" → "Qualitätsprüfer"
  "11-3051.01": { kldbCode: "27314", kldbName: "Berufe in der technischen Qualitätssicherung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Quality Control Systems Managers: was Landtechnik komplex (Anf 3 → 4 — Manager-Rolle, studies-Tier); 27314 ist die QS-Manager-Klasse; coupled mit title.de "Fachkraft QS und -management Bau" → "Qualitätsmanager"
  "15-1253.00": { kldbCode: "43413", kldbName: "Berufe in der Softwareentwicklung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Software QA Analysts and Testers: was IT-Koordination — Software-Testing ist Teil der Softwareentwicklungs-Pipeline, nicht IT-Project-Management; coupled mit title.de "Softwareprüfer" → "Softwaretester"
  "13-2022.00": { kldbCode: "94724", kldbName: "Kunstsachverständige - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Appraisers of Personal and Business Property: was Landwirtschaftliche Sachverständige (Anf 3 → 4 — studies-Tier passt zur Sachverständigen-Bestellung); 94724 deckt jewelry/art/antiques/collectibles, equipment ist Kompromiss da KldB keine generische bewegliche-Sachen-Sachverständige-Klasse hat
  "53-7071.00": { kldbCode: "26232", kldbName: "Berufe in der Energie- und Kraftwerkstechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Gas Compressor and Pumping Station Operators: was Straßenverkehrsbetrieb (Seed-Drift) — gas-pump infrastructure ist energy-/utility-Domain, gleiche Schiene wie SOC-Sibling 51-8013 Power Plant Operators
  "43-5061.00": { kldbCode: "71302", kldbName: "Berufe in der kaufmännischen und technischen Betriebswirtschaft (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Production, Planning, and Expediting Clerks: was Hotelkaufleute — Produktionsdisposition ist generische Betriebswirtschaft, nicht Hotel
  "29-1171.00": { kldbCode: "81394", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Nurse Practitioners (Pflegeexperte): was Ärzte ohne Spez. — APN ist Pflege-Domain (Master Pflegewissenschaft), nicht Arzt; 81394 setzt die Domain richtig (Pflege studies-Tier), Subtitle suppressed weil "Führungskräfte" das APN-Profil nicht trifft, Anforderungs-Pill bleibt "Studium/Weiterbildung"
  "29-1141.03": { kldbCode: "81313", kldbName: "Berufe in der Fachkrankenpflege - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Critical Care Nurses: was Aufsichtskräfte Gesundheits-/Krankenpflege — Intensivpflege ist Fachkrankenpflege-komplex (Anf 3 ✓), nicht Aufsichtskraft; coupled mit title.de "Akademischer Krankenpfleger" → "Fachkrankenpfleger Intensivpflege"
  "19-3022.00": { kldbCode: "91344", kldbName: "Berufe in der Markt- und Meinungsforschung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Survey Researchers: was Mathematik (ohne Spez.) — Survey Research ist Markt-/Meinungsforschung-Domain, 91344 ist die studies-Tier-Klasse; coupled mit title.de "Interviewer im Bereich Umfragen" → "Marktforscher"
  "43-6014.00": { kldbCode: "71402", kldbName: "Büro- und Sekretariatskräfte (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Secretaries (general): was Hotelkaufleute (Seed-Drift) — generic Sekretär gehört in 71402 Büro/Sekretariat, nicht Hotel
  "43-4171.00": { kldbCode: "71452", kldbName: "Berufe in der Auskunft und Kundeninformation - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Receptionists and Information Clerks: was Hotelservice (zu spezifisch) — 71452 ist die exakte Klasse für Empfangs-/Auskunftsrollen; coupled mit title.de "Kundeninformationsfachkraft" → "Empfangsmitarbeiter"
  "13-1199.04": { kldbCode: "71314", kldbName: "Berufe in der Unternehmensorganisation und -planung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Business Continuity Planners: was IT-Koordination (Anf 3 → 4) — BCM ist organisationsübergreifend (risk/business-impact/strategy), nicht IT-spezifisch; coupled mit title.de "Analytiker für IT-Notfallwiederherstellung" → "Business Continuity Manager"
  "29-2035.00": { kldbCode: "81233", kldbName: "Medizinisch-technische Berufe in der Radiologie - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Magnetic Resonance Imaging Technologists: was Ergotherapie — MRT ist Radiologie, gleiche Klasse wie 29-2034 Radiologic Technologists und 29-2036 Medical Dosimetrists (batch 3)
  "43-5031.00": { kldbCode: "81342", kldbName: "Berufe im Rettungsdienst - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Public Safety Telecommunicators: was Büro-Helfer (Anf 1 → 2) — DE-Notrufdisponenten sind typisch Notfallsanitäter mit Leitstellen-Zusatz, 81342 ist die Heimat-Klasse; coupled mit title.de "Notruftelefonist" → "Disponent Notrufleitstelle"
  "17-2141.02": { kldbCode: "25214", kldbName: "Berufe in der Kraftfahrzeugtechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Automotive Engineers: was Papierverarbeitung — automotive engineering gehört in Kfz-Technik hoch komplex
  "47-2011.00": { kldbCode: "34342", kldbName: "Berufe im Anlagen-, Behälter- und Apparatebau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Boilermakers: was Klempnerei — KldB-Klassen-Name spiegelt title.de "Behälter- und Apparatebauer" 1:1

  // === Audit batch 1 — SOC 21+45 (2026-04-25) ===
  // First batch from the 10-agent KldB+title coherence audit (402 findings
  // across 923 occupations; full output in scripts/audit/findings-2026-04-25.json).
  // SOC 21 Community/Social Services: 6 entries — three Stem-Drift cases
  // routed via "-berater" into Verbraucher-/Personaldienstleistung instead
  // of Sozial-/Gesundheitsberatung; one Anf-2/3 mismatch (Sozialassistent);
  // one religious-activities scope correction (Missionar → Gemeindereferent).
  // SOC 45 Farming/Forestry/Fishing: 4 entries — Supervisor scope (Anf 2 → 3),
  // animal-husbandry breadth (Pferde-only → Nutztier broadly), and two Forst
  // entries that drifted into machine-operation/QS instead of Forstwirt-Domain.
  // 45-4021 was pulled out of the seed block (52512 → 11712). 45-2041 stays
  // in seed (29152 confirmed as nearest-class consensus); only its title was
  // corrected (Milchkontrolleur → Sortierer landwirtschaftlicher Produkte).
  "21-1012.00": { kldbCode: "83154", kldbName: "Berufe in der Sozial-, Erziehungs- und Suchtberatung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Berufsberater: was Personaldienstleistung — Berufsberatung ist Sozial-/Bildungsberatung, nicht Personalvermittlung
  "21-1015.00": { kldbCode: "83123", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Rehabilitationsberater: was Verbraucherberatung (Stem-Drift "-berater") — Reha-Beratung ist Sozialarbeit
  "21-1091.00": { kldbCode: "82213", kldbName: "Berufe in der Gesundheitsberatung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Health Education Specialists: was Wirtschaftsförderung (Stem-Drift) — Public Health gehört in Gesundheitsberatung
  "21-1092.00": { kldbCode: "83123", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Bewährungshelfer: was Verbraucherberatung (Stem-Drift "-berater") — Bewährungshilfe ist Resozialisierungs-Sozialarbeit
  "21-1093.00": { kldbCode: "83122", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sozialassistent: war Anf 3 komplex — Sozialassistent ist 2-jährige schulische Ausbildung (Anf 2), nicht Spezialist
  "21-2021.00": { kldbCode: "83323", kldbName: "Berufe in der Gemeindearbeit - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Directors of Religious Activities: was Angehörige geistlicher Orden — SOC umfasst Programm-Koordination/Bildungsarbeit, nicht nur Mission/Ordensleben; coupled mit title.de "Missionar" → "Gemeindereferent"
  "45-1011.00": { kldbCode: "11193", kldbName: "Aufsichtskräfte - Landwirtschaft", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors Farming/Fishing/Forestry: was Landwirtschaft fachlich (Anf 2 → 3 — Supervisor-Rolle); coupled mit title.de "Führungskraft für die Ernte aquatischer Organismen" → "Aufsichtskraft Land- und Forstwirtschaft"
  "45-2093.00": { kldbCode: "11212", kldbName: "Berufe in der Nutztierhaltung (außer Geflügelhaltung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Farmworkers Farm/Ranch/Aquacultural Animals: was Pferdewirtschaft (zu eng) — SOC umfasst alle Nutztiere; coupled mit title.de "Zuchtassistent Aquakultur" → "Tierwirt"
  "45-4021.00": { kldbCode: "11712", kldbName: "Berufe in der Forstwirtschaft - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Fallers: was Führer land-/forstw. Maschinen (Seed-Drift) — Fallers fällen Bäume mit Axt/Säge, ist Forstwirt-Domain (3-jähriger Ausbildungsberuf); coupled mit title.de "Schrotsägenführer" → "Forstwirt"
  "45-4023.00": { kldbCode: "11712", kldbName: "Berufe in der Forstwirtschaft - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Log Graders and Scalers: was technische QS — Holz klassifizieren ist forstwirtschaftliche Tätigkeit, nicht industrielle Qualitätssicherung

  // === Audit batch 2 — SOC 31+33 (2026-04-25) ===
  // SOC 31 Healthcare Support (8 entries) — multiple Aide/Assistant roles
  // wrongly tiered as Anf 3 Spezialist when SOC describes delegated routine
  // tasks (OT Aides, OT Assistants, Speech-Lang Pathology Aides, PT
  // Assistants); two Rettungsdienst-Helfer drift cases (Med Equipment
  // Preparers/ZSVA, Phlebotomists — neither is rescue-service); one
  // Patient-transport role moved from Rettungsdienst to Krankenpflege;
  // Personal Care Aides moved from Sozialarbeit to Haus-/Familienpflege.
  // Note: 81721 Ergotherapie-Helfer (Anf 1) does not exist in KldB; OT
  // Aides + Assistants both land at 81722 Anf 2 (nearest tier), kept
  // distinguishable by title.
  // SOC 33 Protective Services (10 entries) — three First-Line Supervisor
  // roles routed via Stem-Drift into 27294 Tech-Konstruktion or 73294
  // Verwaltung instead of their Polizei-/Justiz-/Brandschutz-Domains;
  // Brandschutz-Inspektor and Forest-Fire-Inspector both pulled into
  // wrong domains (Bauplanung, Gewerbeaufsicht); Lifeguards and Animal
  // Control mis-routed to Jagdwirtschaft via stem; Casino-surveillance
  // moved from Gewerbeaufsicht to Glücks-/Wettspiel.
  "31-1122.00": { kldbCode: "83142", kldbName: "Berufe in der Haus- und Familienpflege - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Personal Care Aides: was Sozialarbeit (zu spezialisiert) — Alltagsbegleitung ist Haus-/Familienpflege; coupled mit title.de "Sozialbetreuer häusliche Betreuung" → "Alltagsbegleiter"
  "31-1132.00": { kldbCode: "81301", kldbName: "Berufe in der Gesundheits- und Krankenpflege (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Orderlies: was Rettungsdienst (Patiententransport innerhalb Krankenhaus, nicht Notfall); coupled mit title.de "Krankenträger" → "Patientenbegleiter"
  "31-2011.00": { kldbCode: "81722", kldbName: "Berufe in der Ergotherapie - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // OT Assistants: war Anf 3 Spezialist — Assistenz ist Anf-2-Routine, nicht Spezialist
  "31-2012.00": { kldbCode: "81722", kldbName: "Berufe in der Ergotherapie - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // OT Aides: war Anf 3 Spezialist — Aides delegierte Routinearbeit, KldB hat keine 81721 Helfer-Klasse, 81722 Anf 2 ist niedrigste verfügbare Stufe (geteilt mit OT Assistants 31-2011, durch Title differenziert)
  "31-2021.00": { kldbCode: "81712", kldbName: "Berufe in der Physiotherapie - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // PT Assistants: was Heilkunde/Homöopathie — PT-Assistant assistiert Physiotherapeut, nicht Heilpraktiker; coupled mit title.de "Therapeut Komplementärmedizin" → "Physiotherapieassistent"
  "31-9093.00": { kldbCode: "82502", kldbName: "Berufe in der Medizintechnik (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Medical Equipment Preparers (ZSVA-Sterilgut): war Rettungsdienst-Helfer (Anf 1 → 2) — Sterilgutaufbereitung ist Medizintechnik mit Fachkundenachweis
  "31-9097.00": { kldbCode: "81332", kldbName: "Berufe in der operations-/medizintechnischen Assistenz - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Phlebotomists: was Rettungsdienst-Helfer (Anf 1 → 2) — Blutentnahme ist medizintechnische Assistenz
  "31-9099.01": { kldbCode: "81782", kldbName: "Berufe in der nicht ärztlichen Therapie und Heilkunde (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Speech-Lang Pathology Assistants: war Sprachtherapie komplex (Anf 3 → 2) — Logopädie-Assistent ist Hilfskraft; KldB hat keine Anf-2-Sprachtherapie-Klasse, 81782 ist nearest-class catch-all
  "33-1011.00": { kldbCode: "53244", kldbName: "Berufe im Justizvollzugsdienst - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // First-Line Supervisors of Correctional Officers: was Tech. Konstruktion (Stem-Drift) — Justizvollzug-Domain; coupled mit title.de "Gefängnisdirektor" → "Dienstgruppenleiter Justizvollzug" (Direktor wäre Anstaltsleiter, zu hoch)
  "33-1012.00": { kldbCode: "53214", kldbName: "Berufe im Polizeivollzugsdienst - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // First-Line Supervisors of Police: was Verwaltung (Stem-Drift) — Polizei-Domain; coupled mit title.de "Polizeipräsident" → "Vorgesetzter im Polizeivollzugsdienst" (Präsident wäre Behördenleiter, zu hoch)
  "33-1021.00": { kldbCode: "53133", kldbName: "Berufe im Brandschutz - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Firefighters: was Tech. Konstruktion (Stem-Drift) — Brandschutz-Domain; Anf 4 → 3 (Zugführer-Ebene gehobener Dienst, nicht B-Dienst Studium)
  "33-1091.00": { kldbCode: "53193", kldbName: "Aufsichtskräfte - Objekt-, Personen-, Brandschutz, Arbeitssicherheit", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Security Workers: war 53112 fachlich (Anf 2 → 3) — Supervisor ist Aufsichtskraft, nicht Fachkraft; coupled mit title.de "Sicherheitspersonalmanager" → "Sicherheitsdienstleiter"
  "33-2021.00": { kldbCode: "53132", kldbName: "Berufe im Brandschutz - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Fire Inspectors and Investigators: was Bauplanung — Brandschutz-Inspektion gehört in Brandschutz, nicht Bau
  "33-2022.00": { kldbCode: "11712", kldbName: "Berufe in der Forstwirtschaft - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Forest Fire Inspectors: was Gewerbeaufsicht — Waldbrandinspektion gehört in Forstwirtschaft (analog zu 45-4021/45-4023 in batch 1); title bleibt "Forstwirtschaftskontrolleur" (Forstaufseher ist 19-4071-Title, vermeidet Duplikat)
  "33-9031.00": { kldbCode: "94342", kldbName: "Berufe im Bereich Glücks- und Wettspiel - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Gambling Surveillance Officers: was Gewerbeaufsicht (staatliche Betriebsprüfung, falsch) — Casino-Überwachung gehört in Glücksspiel-Domain
  "33-9092.00": { kldbCode: "53142", kldbName: "Berufe in der Badeaufsicht - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Lifeguards/Ski Patrol: was Jagdwirtschaft (Stem-Drift); 53142 trifft Lifeguards exakt; coupled mit title.de "Beamter der Küstenwache" → "Rettungsschwimmer"

  // === Audit batch 3 — SOC 23+37+35 (2026-04-25) ===
  // Mini-cleanup of the three smallest remaining SOC groups in one section.
  // SOC 23 Legal (1 entry) — Title Examiners re-tiered Anf 2 → 3 in same
  // Notariat-Assistenzkräfte family (eigenständige Grundbuch-Recherche, keine
  // reine Assistenz). SOC 37 Building/Grounds (3 entries — 37-3011 is title-
  // only, no KldB change) — two First-Line Supervisor Anf-2/Aufsichtskraft-3
  // mismatches (Housekeeping, Landscaping) analogous to the SOC 33-1011/12/21
  // pattern from batch 2; one Pesticide-Vegetation drift out of Holz-/
  // Bautenschutz into Desinfektion/Schädlingsbekämpfung. SOC 35 Food Prep
  // (5 entries — 35-2012 is title-only, no KldB change) — fast-food + private
  // cooks mis-routed to Gastronomieservice or Aufsichtskräfte instead of Köche-
  // Klassen; Short Order Cooks moved to Systemgastronomie; Hosts/Hostesses
  // pulled out of Tourismuskaufleute (Reisebüro-Drift) into Gastronomieservice;
  // 35-1012 First-Line Supervisor reconciliation: Anf 2 fachlich → Anf 3
  // Aufsichtskräfte (agent flagged title only, but structurally First-Line
  // Supervisor = Aufsichtskraft, analog SOC 33/37 supervisor reconciliations).
  "23-2093.00": { kldbCode: "73113", kldbName: "Assistenzkräfte in Rechtsanwaltskanzlei und Notariat - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Title Examiners/Abstractors: war 73112 Anf 2 — Grundbuchrecherche/-analyse ist eigenständige Spezialistentätigkeit (Notarfachwirt-Tier), nicht reine Anwaltsassistenz
  "37-1011.00": { kldbCode: "83293", kldbName: "Aufsichtskräfte - Hauswirtschaft und Verbraucherberatung", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors Housekeeping/Janitorial: war 83212 fachlich (Anf 2 → 3) — Supervisor ist Aufsichtskraft, nicht Fachkraft (analog 33-1091, 37-1012)
  "37-1012.00": { kldbCode: "12193", kldbName: "Aufsichtskräfte - Gartenbau", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors Landscaping/Lawn/Groundskeeping: war 12102 Gartenbau fachlich (Anf 2 → 3) — Supervisor-Tier; coupled mit title.de "Produktionsleiter im Bereich Gartenbau" → "Vorarbeiter im Garten- und Landschaftsbau"
  "37-3012.00": { kldbCode: "53342", kldbName: "Berufe in der Desinfektion und Schädlingsbekämpfung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Pesticide Handlers Vegetation: was 33242 Holz- und Bautenschutz (Drift) — Pestizidausbringung auf Pflanzen ist Schädlingsbekämpfung-Domain (KldB hat keine reine Pflanzenschutz-Klasse); coupled mit title.de "Mitarbeiter für die Pestizidausbringung" → "Mitarbeiter im Pflanzenschutz"
  "35-1012.00": { kldbCode: "63393", kldbName: "Aufsichtskräfte - Gastronomie und Systemgastronomie", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Food Prep/Serving: was 63312 Systemgastronomie fachlich (Anf 2 → 3) — Reconciliation: Agent flagged title only, but First-Line Supervisor = Aufsichtskraft (analog 37-1011/12, 33-1011/12/21); 63393 deckt Gastronomie+Systemgastronomie ab, breiter als SOC; coupled mit title.de "Schnellrestaurantteamleiter" → "Schichtleiter Gastronomie"
  "35-2011.00": { kldbCode: "29301", kldbName: "Köche/Köchinnen (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Cooks Fast Food: war 63301 Gastronomieservice (Service ≠ Speisenzubereitung) — Fast-Food-Koch ist Köche-Helfer-Tier, nicht Service
  "35-2013.00": { kldbCode: "29302", kldbName: "Köche/Köchinnen (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Cooks Private Household: war 29393 Aufsichtskräfte Speisenzubereitung Anf 3 — Privatkoch ist ausgebildeter Fachkoch, weder Aufsichtskraft (zu hoch) noch Helfer (Agent-Vorschlag 29301 zu niedrig); 29302 Anf 2 ist die Reconciliation-Mitte
  "35-2015.00": { kldbCode: "63312", kldbName: "Berufe in der Systemgastronomie - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Cooks Short Order: war 63301 Gastronomieservice Helfer Anf 1 — Short-Order ist Systemgastronomie-Fachkraft (Imbiss/Diner-Tradition mit Ausbildung)
  "35-9031.00": { kldbCode: "63302", kldbName: "Berufe im Gastronomieservice (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Hosts and Hostesses Restaurant: war 63112 Tourismuskaufleute (Reisebüro-Drift) — Restaurant-Empfang/Platzierung ist Gastronomieservice-Tier; title "Oberkellner" bleibt unverändert (Restaurantservice deckt Oberkellner und Empfangsmitarbeiter beide ab)

  // === Audit batch 4 — SOC 41+15 (2026-04-25) ===
  // Largest batch so far (20 findings). SOC 15 Computer/Math (10 KldB
  // changes, 1 title-only): four IT roles routed to wrong subdomain
  // classes (Network Architects → IT-Netzwerktechnik, SwDev →
  // Softwareentwicklung, Web Devs → Softwareentwicklung-fachlich, Game
  // Designers → Medieninformatik); GIS moved out of Vermessungstechnik
  // into Geoinformatik; Document Management Specialists pulled out of
  // Führungskräfte-Mediendienste tier into IT-Organisation komplex
  // (FaMI title was IHK-Ausbildungsberuf, SOC is Enterprise-DMS);
  // Blockchain + Clinical Data Manager both → Softwareentwicklung
  // komplex; Aktuar re-tiered Anf 3 → 4 (DAV-Ausbildung); Operations
  // Research stem-drift "Logistik" → Mathematik (pulled out of seed).
  // Reconciliation 15-1252 SwDev: agent suggested 43104 Informatik hoch
  // komplex Anf 4, but 43413 Softwareentwicklung komplex Anf 3 is the
  // exact-class match (no unnecessary Anf-4 bump).
  // SOC 41 Sales (7 KldB changes, 2 title-only): two First-Line
  // Supervisors re-tiered Führungskräfte Handel Anf 4 → Aufsichtskraft
  // tier Anf 3 (analog SOC 33-1011/12, 37-1011/12, 35-1012); three
  // Vertriebs-roles pulled out of 81883 Pharmazie (Stem-Drift "Vertrieb")
  // into proper Vertrieb-Klassen; Retail Salespersons moved out of
  // Groß-/Außenhandel (B2B) into Verkauf (Einzelhandel); Advertising
  // Sales Agents pulled out of Versicherung-Drift into Werbung/Marketing.
  // Note 41-1012 Non-Retail Supervisors: KldB lacks an "Aufsichtskräfte
  // Vertrieb" class, so 61123 Vertrieb komplex Anf 3 is the nearest-tier
  // fallback (Spezialist statt Aufsichtskraft).
  "15-1241.00": { kldbCode: "43313", kldbName: "Berufe in der IT-Netzwerktechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Computer Network Architects: war 43103 Informatik (ohne Spez.) — Netzwerkarchitektur ist Netzwerktechnik-Spezialdomäne, nicht generische Informatik
  "15-1252.00": { kldbCode: "43413", kldbName: "Berufe in der Softwareentwicklung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Software Developers: war 43123 technische Informatik (= Hardware-nah, Drift) — 43413 Softwareentwicklung ist Exact-Klasse; Reconciliation gegen Agent's 43104 (Informatik hoch komplex Anf 4) — kein unnötiger Anf-4-Bump
  "15-1254.00": { kldbCode: "43412", kldbName: "Berufe in der Softwareentwicklung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Web Developers: war 43152 Medieninformatik fachlich — Web-Devs programmieren primär (kein Design); coupled mit title.de "Web-Designer" → "Web-Entwickler"
  "15-1255.01": { kldbCode: "43153", kldbName: "Berufe in der Medieninformatik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Video Game Designers: war 23223 Grafik-/Kommunikations-/Fotodesign — Game Design ist Mechanik+Code+Spec, nicht reines Grafikdesign; Medieninformatik passt strukturell
  "15-1299.02": { kldbCode: "43144", kldbName: "Berufe in der Geoinformatik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // GIS Technologists/Technicians: war 31214 Vermessungstechnik — SOC explizit "geographic information **systems**, software" → Geoinformatik
  "15-1299.03": { kldbCode: "43333", kldbName: "Berufe in der IT-Organisation - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Document Management Specialists: war 73394 Führungskräfte Medien-/Doku-/Informationsdienste Anf 4 — SOC ist Enterprise-DMS-Implementierer (SharePoint/OpenText/etc.), IT-Spezialist Anf 3 (nicht Führungskraft); coupled mit title.de FaMI → "Dokumentenmanagement-Spezialist" (FaMI ist Bibliotheks-/Archiv-Ausbildungsberuf)
  "15-1299.07": { kldbCode: "43413", kldbName: "Berufe in der Softwareentwicklung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Blockchain Engineers: war 43103 Informatik (ohne Spez.) — Smart-Contract-Code ist Softwareentwicklung
  "15-2011.00": { kldbCode: "41104", kldbName: "Berufe in der Mathematik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Actuaries: war 41103 Mathematik komplex Anf 3 — Aktuar in DE braucht Mathestudium + DAV-Ausbildung (5 Jahre Praxis), klar Anf 4
  "15-2031.00": { kldbCode: "41104", kldbName: "Berufe in der Mathematik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Operations Research Analysts: was 51624 Speditions-/Logistikkaufleute (Stem-Drift "Logistik") — OR ist angewandte Mathematik/Statistik. Pulled out of seed.
  "15-2051.02": { kldbCode: "43413", kldbName: "Berufe in der Softwareentwicklung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Clinical Data Managers: war 81294 Führungskräfte Medizinisches Laboratorium Anf 4 — Clinical Data Manager ist DB-/Software-Rolle für klinische Studien (CDISC, OpenClinica), weder Lab-Führung noch Anf-4-hierarchisch
  "41-1011.00": { kldbCode: "62193", kldbName: "Aufsichtskräfte - Verkauf", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Retail Sales: war 61294 Führungskräfte Handel Anf 4 — Reconciliation: Agent flagged title only, but First-Line Supervisor = Aufsichtskraft Anf 3 (analog 33-1011/12, 37-1011/12, 35-1012); coupled mit title.de "Leiter eines Bekleidungsgeschäftes" → "Filialleiter Einzelhandel" (SOC umfasst alle Einzelhandel, nicht nur Bekleidung)
  "41-1012.00": { kldbCode: "61123", kldbName: "Berufe im Vertrieb (außer Informations- und Kommunikationstechnologien) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Non-Retail Sales: war 61294 Führungskräfte Handel Anf 4 — KldB hat keine "Aufsichtskräfte Vertrieb"-Klasse, 61123 Vertrieb komplex Anf 3 ist nearest-tier (Spezialist statt Aufsichtskraft); coupled mit title.de "Ladenmanager" → "Teamleiter Vertrieb" (SOC ist B2B Non-Retail, kein "Laden")
  "41-2031.00": { kldbCode: "62102", kldbName: "Berufe im Verkauf (ohne Produktspezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Retail Salespersons: war 61212 Kaufleute Groß- und Außenhandel (= B2B) — Retail = Einzelhandel-Verkauf
  "41-3011.00": { kldbCode: "92113", kldbName: "Berufe in Werbung und Marketing - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Advertising Sales Agents: war 72183 Versicherungs-/Finanzdienstleistungen (Stem-Drift "Verkäufer") — Anzeigenverkauf gehört in Werbung/Marketing
  "41-4011.00": { kldbCode: "61122", kldbName: "Berufe im Vertrieb (außer Informations- und Kommunikationstechnologien) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sales Reps Wholesale/Manufacturing Technical/Scientific Products: war 81883 Pharmazie (Stem-Drift "Vertrieb") — generischer Vertrieb-Außendienst Anf 2; coupled mit title.de "Fachkraft im Bereich Vertrieb" → "Technischer Vertriebsmitarbeiter"
  "41-4011.07": { kldbCode: "61122", kldbName: "Berufe im Vertrieb (außer Informations- und Kommunikationstechnologien) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Solar Sales Reps: war 81883 Pharmazie (gleicher Stem-Drift); Solar-Außendienst-Kaufmann ist Anf 2 (Agent flagged Anf-Mismatch explizit)
  "41-9031.00": { kldbCode: "61123", kldbName: "Berufe im Vertrieb (außer Informations- und Kommunikationstechnologien) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Sales Engineers: war 81883 Pharmazie (Stem-Drift "Vertrieb") — Sales Engineers sind technischer Bachelor + Vertriebsspezialisten

  // === Audit batch 5 — SOC 25 Education (2026-04-25) ===
  // 16 findings walked, 14 KldB+/-Anf changes applied, 1 reject, 1 Anf-only.
  // Five "Postsecondary" SOC entries had been routed to Sekundarstufe-/
  // Sprachenlehrer-/betriebliche-Ausbildung-Klassen — all pulled into 84304
  // Hochschullehre und -forschung (Geography, Art/Drama/Music, English,
  // Foreign Languages, Recreation/Fitness Studies). Three of these
  // (25-1123, 25-1124, 25-2022) were seed-pinned and got pulled out (see
  // commented entries in the seed block above). 25-2022 Middle School
  // Teachers shifted from Sprachenlehrer-Drift to 84124 Sekundarstufe
  // (Mittelschule deckt alle Fächer ab). Self-Enrichment Teachers moved
  // out of Sozialarbeit-Drift into außerschulische Bildung (84483 Anf 3 —
  // Hobby-/VHS-Kursleiter); coupled with title.de "Lebensberater"
  // (Eso-Konnotation) → "Kursleiter Freizeitbildung". Adult Basic
  // Education Instructors moved from Förderschule (84134) into
  // Erwachsenenbildung (84404). Curators moved from Archivwesen (73314)
  // into Museumsberufe (94704). Teaching Assistants Special Education
  // dropped from 84183 Anf 3 into 83132 Heilerziehungspflege/
  // Sonderpädagogik Anf 2 (Schulbegleiter-/Integrationshelfer-Tier).
  // Substitute Teachers re-tiered Anf 3 → 4 (Lehramts-Norm). Instructional
  // Coordinators moved from allgemeinbildende-Schulen-Drift into
  // Erwachsenenbildung (84404 — Bildungsreferenten sind primär
  // Curriculum-Spezialisten in Corporate Training und VHS).
  // Reject: 25-9042 Teaching Assistants Regelschule — agent flagged Anf 3
  // → 2, but KldB-841xx hat keine Anf-2-Klasse für allgemeinbildende
  // Schulen; current 84183 Anf 3 ist nearest-tier defensibel.
  "25-1062.00": { kldbCode: "84304", kldbName: "Berufe in der Hochschullehre und -forschung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Area, Ethnic, and Cultural Studies Teachers Postsec.: KldB stays 84304 (already correct), pinned with title.de override "Anthropologie" → "Kultur- und Sozialwissenschaften" (siehe title-overrides batch 5)
  "25-1064.00": { kldbCode: "84304", kldbName: "Berufe in der Hochschullehre und -forschung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Geography Teachers Postsecondary: war 84124 Sekundarstufe — Postsecondary = Hochschule, nicht Sekundarstufe; coupled mit title.de "Erdkunde Sekundarstufe" → "Hochschullehrkraft für Geografie/Erdkunde"
  "25-1121.00": { kldbCode: "84304", kldbName: "Berufe in der Hochschullehre und -forschung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Art, Drama, and Music Teachers Postsecondary: war 84124 Sekundarstufe — Postsec; coupled mit title.de "Kunsterzieher Sekundarstufe" → "Hochschullehrkraft Kunst, Drama und Musik"
  "25-1123.00": { kldbCode: "84304", kldbName: "Berufe in der Hochschullehre und -forschung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // English Language and Literature Teachers Postsec.: war 84124 Sekundarstufe (seed) — Anglistik-Hochschullehre. Pulled out of seed.
  "25-1124.00": { kldbCode: "84304", kldbName: "Berufe in der Hochschullehre und -forschung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Foreign Language and Literature Teachers Postsec.: war 84454 (Fremd-)Sprachenlehrer (= außerschulisch, seed) — Postsec gehört in Hochschullehre. Pulled out of seed.
  "25-1193.00": { kldbCode: "84304", kldbName: "Berufe in der Hochschullehre und -forschung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Recreation and Fitness Studies Teachers Postsec.: war 84224 betriebliche Ausbildung — Sportwissenschaft-Hochschullehre, keine betriebl. Ausbildung; coupled mit title.de "Ausbilder für Sportinstruktoren" → "Hochschullehrkraft für Sportwissenschaft"
  "25-2022.00": { kldbCode: "84124", kldbName: "Lehrkräfte in der Sekundarstufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Middle School Teachers (allg.): war 84454 Sprachenlehrer (seed, Sprachen-Drift) — Mittelschul-Lehrkräfte unterrichten alle Fächer, nicht nur Sprachen. Pulled out of seed.
  "25-3011.00": { kldbCode: "84404", kldbName: "Berufe in der Erwachsenenbildung (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Adult Basic Ed / ESL Instructors: war 84134 Förderschulen — Erwachsenenbildung außerschulisch (BAMF-Integrationskurse, VHS-Alphabetisierung); coupled mit title.de "Erwachsenenalphabetisierung" → "Lehrkraft für Grundbildung und Alphabetisierung"
  "25-3021.00": { kldbCode: "84483", kldbName: "Lehrkräfte an außerschulischen Bildungseinrichtungen (sonstige spezifische Tätigkeitsangabe) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Self-Enrichment Teachers: war 83122 Sozialarbeit/Sozialpädagogik — Hobby/VHS-Kursleiter (Yoga, Töpfern, Foto, Bridge), keine Sozialarbeit; coupled mit title.de "Lebensberater" (Eso-Konnotation) → "Kursleiter Freizeitbildung"
  "25-3031.00": { kldbCode: "84184", kldbName: "Lehrkräfte an allgemeinbildenden Schulen (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Substitute Teachers Short-Term: war 84183 Anf 3 — Lehramts-2.-Staatsexamen ist Norm (Anf 4); Quereinsteiger sind Ausnahme
  "25-4012.00": { kldbCode: "94704", kldbName: "Museumsberufe (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Curators: war 73314 Archivwesen — Kurator verwalten Museumssammlungen, eigene Klasse 94704 statt Archiv
  "25-9031.00": { kldbCode: "84404", kldbName: "Berufe in der Erwachsenenbildung (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Instructional Coordinators: war 84184 allgemeinbildend Sonstige — Bildungsreferenten/Curriculum-Spezialisten primär in Erwachsenenbildung/Corporate Training/VHS; Schul-Bezug ist nur ein Subset
  "25-9043.00": { kldbCode: "83132", kldbName: "Berufe in Heilerziehungspflege und Sonderpädagogik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Teaching Assistants Special Education: war 84183 Anf 3 — Schulbegleiter/Integrationshelfer haben Heilerziehungspfleger-Ausbildung Anf 2, nicht Lehrkräfte-Tier

  // === Audit batch 6 — SOC 49 Maintenance/Repair (2026-04-25) ===
  // 17 findings walked, 15 KldB changes (1 with Anf-bump), 11 title overrides.
  // First-Line Supervisor pattern continued: 49-1011 re-tiered Anf 2 → 3
  // (25212 Kfz-Technik Drift → 25193 Aufsichtskräfte Maschinenbau), coupled
  // title fix "Produktionsleiter Feinwerkmechanik" → "Werkstattleiter
  // Maschinenbau" (analog 33-1011/12, 37-1011/12, 35-1012, 41-1011/12 aus
  // batches 2-4). Five seed pull-outs: 49-3031 (25112 → 25212 Kfz-Technik,
  // Diagnostik/Reparatur statt generic Zusammensetzer), 49-3043 (25112 →
  // 51112 Eisenbahnbetrieb, agent-pick — semantisch nicht perfekt aber
  // näher als generischer Maschinenbau), 49-9045 (32122 Maurerhandwerk
  // → 21412 Industriekeramik, SOC explizit "Except Brickmasons"), 49-9062
  // (26122 Automatisierungstechnik Anf 4 → 82503 Medizintechnik Anf 3 —
  // Reconciliation gegen agent's Anf 4 82504; Med-Equip-Repairer ist
  // Techniker-Tier, kein Master/Diplom), 49-3021 (25213 Kfz-Technik
  // komplex Anf 3 → 25212 Anf 2, coupled-down vom Oldtimer-Spezialisten-
  // Bump zum generischen Karosseriebauer-Geselle-Tier).
  // Two more reconciliations: 49-9064 Watch Repairers 24533 Anf 3 → 24532
  // Anf 2 (Geselle-Tier statt agent's Meister-Tier; US-Watch-Repairer ist
  // 18-month Lehre); 49-9092 Commercial Divers — agent left null, picked
  // 24432 Industrietaucher Anf 2 from catalog (deckt Berufstaucher ab).
  // Three KldB-only: 49-9061 Camera Repairers (26122 → 23312 Fototechnik),
  // 49-3041 Farm Equipment (25102 → 25222 Land-/Baumaschinentechnik —
  // Exact-Klasse-Match), 49-9021 HVACR (34232 Kältetechnik zu eng → 34212
  // SHK = etablierter 3,5-Jahre-Anlagenmechaniker-Beruf).
  // Three coupled KldB+title: 49-9011 Mechanical Door Repairers (24522
  // Werkzeugtechnik → 26112 Mechatronik, "Reparateur Türmechanik" →
  // "Monteur Tor- und Türtechnik"), 49-9097 Signal Repairers (51112
  // Eisenbahnbetrieb → 51222 Wartung Eisenbahninfrastruktur,
  // "Weichenwärter" = Betriebsberuf → "Signaltechniker Eisenbahn"),
  // 49-2093 Transport-Electronics (26312 IT/TK → 26332 Luftverkehr/
  // Schiffe/Fahrzeugelektronik, "Schiffselektrotechniker" zu eng →
  // "Fahrzeugelektroniker (Mobile Systeme)").
  // Two title-only (KldB stays/pinned via existing seed): 49-2095 Powerhouse
  // Repairers ("Steuerer Stromversorgung" = grammatisch falsch →
  // "Elektrotechniker Energieanlagen", KldB 26262 unverändert), 49-2094
  // Industrial Electronics ("Elektroniker Gewerbliche Geräte" = kein
  // etablierter Beruf → "Elektroniker für Betriebstechnik", seed 26122
  // unverändert).
  "49-1011.00": { kldbCode: "25193", kldbName: "Aufsichtskräfte - Maschinenbau- und Betriebstechnik", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Mechanics/Installers/Repairers: war 25212 Kfz-Technik Anf 2 — First-Line Supervisor = Aufsichtskraft Anf 3 (Maschinenbau-domain), nicht Kfz-spezifisch; coupled mit title.de "Produktionsleiter Feinwerkmechanik" → "Werkstattleiter Maschinenbau"
  "49-2093.00": { kldbCode: "26332", kldbName: "Berufe in der Luftverkehrs-, Schiffs- und Fahrzeugelektronik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Electronics Installers/Repairers Transportation: war 26312 IT/TK-Technik (Drift) — SOC umfasst Züge/Schiffe/andere mobile Systeme; coupled mit title.de "Schiffselektrotechniker" → "Fahrzeugelektroniker (Mobile Systeme)"
  "49-3021.00": { kldbCode: "25212", kldbName: "Berufe in der Kraftfahrzeugtechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Automotive Body Repairers: war 25213 Anf 3 (seed, Oldtimer-Spezialisten-Bump) — neuer generischer Title "Karosserie- und Fahrzeugbaumechaniker" ist 3,5-Jahre IHK-Geselle (Anf 2); pulled out of seed and coupled-down
  "49-3031.00": { kldbCode: "25212", kldbName: "Berufe in der Kraftfahrzeugtechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bus and Truck Mechanics: war 25112 Maschinen-/Gerätezusammensetzer (seed, generisch) — Diagnostik/Reparatur ist Kfz-Technik-Domain; coupled mit title.de "Kfz-Motorenbauer" → "Nutzfahrzeugmechatroniker"
  "49-3041.00": { kldbCode: "25222", kldbName: "Berufe in der Land- und Baumaschinentechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Farm Equipment Mechanics: war 25102 Maschinenbau o.S. — 25222 ist Exact-Klasse für Landmaschinenmechatroniker
  "49-3043.00": { kldbCode: "51112", kldbName: "Berufe im technischen Eisenbahnbetrieb - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Rail Car Repairers: war 25112 Maschinen-/Gerätezusammensetzer (seed, generisch) — agent-pick 51112 ist semantisch nicht perfekt (Eisenbahnbetrieb suggeriert Operations) aber näher am Bahn-Kontext als generischer Maschinenbau
  "49-3053.00": { kldbCode: "25182", kldbName: "Berufe in der Maschinenbau- und Betriebstechnik (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Outdoor Power Equipment / Small Engine Mechanics: war 26222 Elektromaschinentechnik (passt zum alten title.de "Elektroniker für Maschinen und Antriebstechnik" = falscher Beruf für Rasenmäher-/Kettensägen-Reparatur); coupled mit title.de → "Motorgerätemechaniker"
  "49-9011.00": { kldbCode: "26112", kldbName: "Berufe in der Mechatronik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Mechanical Door Repairers: war 24522 Werkzeugtechnik (Drift) — Automatiktüren/Garagentore sind Mechatronik (Antrieb+Elektronik+Steuerung); coupled mit title.de "Reparateur Türmechanik" → "Monteur Tor- und Türtechnik"
  "49-9021.00": { kldbCode: "34212", kldbName: "Berufe in der Sanitär-, Heizungs- und Klimatechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // HVACR Mechanics: war 34232 Kältetechnik (zu eng auf Kälte) — SHK-Anlagenmechaniker ist der etablierte 3,5-Jahre-IHK-Beruf, deckt Heizung+Lüftung+Klima+Kälte
  "49-9045.00": { kldbCode: "21412", kldbName: "Berufe in der Industriekeramik (Verfahrens- und Anlagentechnik) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Refractory Materials Repairers Except Brickmasons: war 32122 Maurerhandwerk (seed) — SOC explizit Bauberuf-ausgeschlossen; Industrieofen-Auskleidung ist Industriekeramik-Schnittstelle
  "49-9061.00": { kldbCode: "23312", kldbName: "Berufe in der Fototechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Camera and Photographic Equipment Repairers: war 26122 Automatisierungstechnik (Drift) — Foto-/Kameratechnik ist Feinmechanik/Fototechnik
  "49-9062.00": { kldbCode: "82503", kldbName: "Berufe in der Medizintechnik (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Medical Equipment Repairers: war 26122 Automatisierungstechnik Anf 4 (seed) — Reconciliation gegen agent's 82504 Anf 4: Med-Equip-Repairer ist BMET-Techniker-Tier (associate's degree / 3-jährige Fachschule), kein Master-Tier; 82503 Anf 3 passt; coupled mit title.de "Biomedizinischer Ingenieur" → "Medizintechniker"
  "49-9064.00": { kldbCode: "24532", kldbName: "Berufe im Uhrmacherhandwerk - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Watch and Clock Repairers: war 21352 Glasapparatejustierung (Drift) — Reconciliation gegen agent's 24533 Anf 3 (Meister-Tier): Standard-Watch-Repairer ist Geselle-Tier (3,5-Jahre Lehre); 24532 Anf 2 passt
  "49-9092.00": { kldbCode: "24432", kldbName: "Industrietaucher/innen und andere Taucherberufe - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Commercial Divers: war 31193 Aufsichtskräfte Bauplanung Anf 3 (Drift "Bauleiter Unterwasserarbeiten") — agent left KldB null; catalog-pick 24432 deckt Berufstaucher; coupled mit title.de "Bauleiter Unterwasserarbeiten" → "Berufstaucher"
  "49-9097.00": { kldbCode: "51222", kldbName: "Berufe in der Überwachung und Wartung der Eisenbahninfrastruktur - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Signal and Track Switch Repairers: war 51112 Eisenbahnbetrieb (= Operations) — Signal-/Weichenwartung ist Infrastruktur-Wartung 51222; coupled mit title.de "Weichenwärter" (Betriebsberuf) → "Signaltechniker Eisenbahn"

  // === Audit batch 7 — SOC 27 Arts/Design/Entertainment/Sports/Media (2026-04-25) ===
  // Two seed pull-outs (27-2023 Umpires + 27-4011 Audio/Video Technicians;
  // 27-2022 Coaches stays in seed since KldB unchanged, only title fixes).
  // Multiple Anf-tier upgrades into hoch-komplex catalog-only classes
  // (94224 Tänzer/Choreografen Anf 4 only, 94134 Dirigenten Anf 4 only,
  // 92434 Autoren/Schriftsteller Anf 4 only) — these classes don't have
  // sibling-tiers in KldB so the agent's Anf 4 picks are the only
  // catalog options.
  // Two reconciliations against agent suggestions:
  // (1) 27-1022 Fashion Designers — agent suggested 28212 Anf 2 + Anf-bump 3,
  //     resolved as 28213 Anf 3 (the Anf-3-sibling of the same Modedesign family).
  // (2) 27-1012 Craft Artists — agent left KldB null; catalog-pick 93302
  //     "Kunsthandwerk und bildende Kunst (ohne Spezialisierung) fachlich Anf 2"
  //     covers the broad SOC scope (weaving, ceramics, metal, sculpture).
  // (3) 27-2022 Coaches and Scouts — agent suggested 84543 Trainer Ballsport,
  //     reject as too narrow (SOC = "Coaches AND Scouts" covers all sports +
  //     Talent-Scouts); current 84503 Sportlehrer ohne Spezialisierung is the
  //     correct broad catch-all (kept in seed, only title-only fix added).
  // (4) 27-4012 Broadcast Technicians — agent suggested 26302 Elektrotechnik
  //     ohne Spez. fachlich, reconciled to 94512 Veranstaltungs-/Bühnentechnik
  //     fachlich (the KldB class for the real Ausbildungsberuf "Rundfunk- und
  //     Veranstaltungstechniker"; collides with 27-4015 Lighting Technicians
  //     but KldB is nominal — multiple SOCs may map to the same class).
  // (5) 27-2012.04 Casting Director — agent flagged title; @mo-sp kept the
  //     "Casting Director" wording (KldB 94493 → 94483 only, Aufsichtskraft
  //     drift corrected to sonstige Theater/Film/TV-Produktion).
  // Coupled KldB+title fixes: 27-1012, 27-1023, 27-1025, 27-1027, 27-4012,
  //   27-4014. Title-only fixes (no KldB change): 27-2012, 27-2012.05,
  //   27-2022, 27-3023.
  "27-1011.00": { kldbCode: "23224", kldbName: "Berufe im Grafik-, Kommunikations- und Fotodesign - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Art Directors: war 94493 Aufsichtskräfte Theater/Film/TV — Art Director entwickelt visuelle Konzepte für Medien (Werbung, Print, Web), nicht Aufsichtskraft am Set
  "27-1012.00": { kldbCode: "93302", kldbName: "Berufe in Kunsthandwerk und bildender Kunst (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Craft Artists: war 93422 Glas-/Keram-/Porzellanmalerei (zu eng) — 93302 ist die ohne-Spez-Klasse, deckt SOC-Scope (Weben, Töpfern, Schweißen, Skulptur); agent left KldB null, catalog-pick; coupled mit title.de "Kunstglaser" → "Kunsthandwerker"
  "27-1022.00": { kldbCode: "28213", kldbName: "Berufe im Modedesign - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Fashion Designers: war 93102 Produkt-/Industriedesign — Modedesign hat eigene Klassen-Familie 28212/13/14; reconciliation gegen agent's 28212 Anf 2 + Anf-bump 3 → direkt 28213 (Anf-3-Sibling), entspricht FH/Designstudium-Tier
  "27-1023.00": { kldbCode: "12202", kldbName: "Berufe in der Floristik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Floral Designers: war 61212 Groß-/Außenhandel (drift via "Fachverkäufer für Blumen"); coupled mit title.de "Fachverkäufer für Blumen und Pflanzen" → "Florist/Floristin"
  "27-1025.00": { kldbCode: "93213", kldbName: "Berufe in der Innenarchitektur - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Interior Designers: war 93233 Raumausstattung (Handwerks-Tier statt Designplanung); coupled mit title.de "Raumgestalter" → "Innenarchitekt"
  "27-1027.00": { kldbCode: "94403", kldbName: "Berufe in der Theater-, Film- und Fernsehproduktion (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Set and Exhibit Designers: war 93213 Innenarchitektur (Set-Designer ist Bühne/Film, nicht Innenarchitektur); coupled mit title.de "Kulissenbauer" (handwerklich) → "Szenenbildner" (kreativ-konzeptionell)
  "27-2012.04": { kldbCode: "94483", kldbName: "Berufe in der Theater-, Film- und Fernsehproduktion (sonstige spezifische Tätigkeitsangabe) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Casting Directors: war 94493 Aufsichtskräfte (Casting Director ist fachliche Director-Rolle, keine Vorgesetztenfunktion); title bleibt "Casting Director" (per @mo-sp)
  "27-2022.00": { kldbCode: "84503", kldbName: "Sportlehrer (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Coaches and Scouts: KldB unverändert (war bereits korrekt im seed) — Reject gegen agent's 84543 Ballsport (zu eng, SOC umfasst alle Sportarten + Talent-Scouts); 84503 ohne-Spez ist die richtige Catch-all-Klasse; coupled mit title.de "Lehrkraft für Sport Sekundarstufe" → "Sporttrainer" (Coaches sind Wettkampftrainer, keine Schul-Sportlehrer)
  "27-2023.00": { kldbCode: "94243", kldbName: "Athleten/Athletinnen und Berufssportler - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Umpires/Referees: war 63122 Sport-/Fitnesskaufleute (kaufmännisch, nicht sportlich) — 94243 ist die Sportler-Klasse, deckt aktive Sport-Akteure incl. Schiedsrichter
  "27-2031.00": { kldbCode: "94224", kldbName: "Tänzer/innen und Choreografen/Choreografinnen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Dancers: war 94382 Moderation/Unterhaltung sonstige fachlich (Anf 2) — 94224 ist die exakte Tänzer-Klasse, KldB-only auf Anf 4 (kein Anf-3-Sibling im Katalog), Anf-bump nötig
  "27-2032.00": { kldbCode: "94224", kldbName: "Tänzer/innen und Choreografen/Choreografinnen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Choreographers: war 94382 Moderation/Unterhaltung sonstige fachlich — gleiche Klasse 94224 wie Tänzer, Anf 4 only
  "27-2041.00": { kldbCode: "94134", kldbName: "Dirigenten/Dirigentinnen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Music Directors and Composers: war 94183 Musik/Gesang/Dirigent sonstige Anf 3 — 94134 ist die explizite Dirigenten-Klasse, KldB-only auf Anf 4 (Hochschulausbildung Dirigieren); Title "Musikdirektor" bleibt (deckt SOC-Scope Director+Composer)
  "27-2042.00": { kldbCode: "94183", kldbName: "Musik-, Gesangs- und Dirigententätigkeiten (sonstige spezifische Tätigkeitsangabe) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Musicians and Singers: war 94283 Schauspiel/Tanz/Bewegung sonstige (falsche Domain) — 94183 ist die Musik-Domain sonstige; 94114 Musiker hoch komplex existiert, aber nur auf Anf 4 (zu hoch für working musicians)
  "27-3043.00": { kldbCode: "92434", kldbName: "Autoren/Autorinnen und Schriftsteller/innen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Writers and Authors: war 92413 Redakteure/Journalisten Anf 3 (drift) — 92434 ist die Autoren-/Schriftsteller-Klasse, KldB-only auf Anf 4
  "27-3043.05": { kldbCode: "92434", kldbName: "Autoren/Autorinnen und Schriftsteller/innen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Poets/Lyricists/Creative Writers: war 92413 Redakteure/Journalisten — 92434 deckt Lyrik/Belletristik
  "27-3092.00": { kldbCode: "71432", kldbName: "Steno- und Phonotypisten/-typistinnen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Court Reporters/Captioners: war 63212 Hotelkaufleute (Drift) — Steno/Phono ist die exakte Klasse für Gerichtsstenografen
  "27-4011.00": { kldbCode: "94532", kldbName: "Berufe in der Bild- und Tontechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Audio and Video Technicians: war 82332 Tätowierer (seed-Drift) — 94532 ist die Bild-/Tontechnik-Klasse
  "27-4012.00": { kldbCode: "94512", kldbName: "Berufe in der Veranstaltungs- und Bühnentechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Broadcast Technicians: war 51182 Eisenbahn-/Luft-/Schiffstechnik sonstige (Drift) — Reconciliation gegen agent's 26302 Elektrotechnik ohne-Spez (zu generisch); 94512 ist die KldB-Klasse für den realen Ausbildungsberuf "Rundfunk- und Veranstaltungstechniker"; collides nominal mit 27-4015 Lighting Technicians, aber KldB-Klassen sind keine 1:1-Zuordnungen; coupled mit title.de "Informationselektroniker" → "Rundfunk- und Veranstaltungstechniker"
  "27-4014.00": { kldbCode: "94532", kldbName: "Berufe in der Bild- und Tontechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sound Engineering Technicians: war 94402 Theater/Film/TV ohne-Spez (zu eng auf Theater-Kontext) — 94532 ist die Bild-/Tontechnik-Klasse, deckt Tonstudio/Film/TV/Podcast; coupled mit title.de "Theatertechniker" → "Tontechniker"
  "27-4032.00": { kldbCode: "94483", kldbName: "Berufe in der Theater-, Film- und Fernsehproduktion (sonstige spezifische Tätigkeitsangabe) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Film and Video Editors: war 94493 Aufsichtskräfte Theater/Film/TV — Editor ist fachliche Schnitt-Tätigkeit, keine Aufsichtskraft; 94483 sonstige fachlich-komplex passt

  // === Audit batch 8 — SOC 13 Business and Financial Operations (2026-04-25) ===
  // Three seed pull-outs (13-1081.01 Logistics Engineers, 13-1082 Project
  // Management Specialists, 13-1131 Fundraisers); one batch-4 re-evaluation
  // (13-1041.04 Government Property Inspectors moved from 31163 Bausach-
  // verständige to 53313 Gewerbeaufsicht — SOC is regulations-/contract-
  // compliance, not building inspection).
  // Multiple Sibling-Tier-Reconciliations: 13-1081 Logisticians + 13-1081.02
  // Analysts down 51624 Anf 4 → 51623 Anf 3 (Spezialist statt hoch komplex);
  // 13-2061 Financial Examiners up 72243 Anf 3 → 72244 Anf 4 (regulatorische
  // Prüfung auf Behördenebene = Studienberuf); 13-2081 Tax Examiners up 73232
  // Anf 2 → 73233 Anf 3 (gehobener Dienst, Bachelor-Eingang); 13-2082 Tax
  // Preparers DOWN 72243 Anf 3 → 72302 Anf 2 (US-"Tax Preparers" sind nicht
  // der DE-Steuerberater-Kammerberuf, sondern Steuerfachangestellte).
  // Reconciliations against agent suggestions:
  // (1) 13-1011 Künstler-/Sportler-Agent — agent's 63194 Tourismus/Sport-
  //     Führungskräfte zu eng; 63124 Sportmanager hoch komplex deckt
  //     Career-Manager-Aspekt (Sport + Künstler) besser; title broadened
  //     to "Künstler- und Sportleragent".
  // (2) 13-1041.07 Regulatory Affairs — agent's 73284 Öffentliche Verwaltung
  //     falsch (RA arbeitet in Industrie, nicht Behörden); 71384 Unternehmens-
  //     organisation sonstige hoch komplex passt für Industry-Compliance.
  // (3) 13-2023 Real Estate Appraisers — REJECT agent's 61313 Immo-Vermarktung
  //     (Sales-Domain, nicht Bewertung); batch-4 pick 31163 Bausachverständige
  //     bleibt unverändert (kein batch-8 entry für 13-2023).
  // (4) 13-2071 Credit Counselors — agent's 83154 Sozial-/Suchtberatung Anf 4
  //     stimmt; KldB-Klasse hat nur Anf 4 (kein Anf-3-Sibling), Tier-Bump
  //     vom drift-bedingten 72113 Bankkaufleute Anf 3 inevitable.
  "13-1011.00": { kldbCode: "63124", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Agents/Business Managers Artists/Performers/Athletes: war 72183 Versicherungs-/Finanzdienst sonstige (Drift via "Manager") — Reconcile gegen agent's 63194 Tourismus/Sport (zu eng); 63124 Sportmanager-Klasse passt für Career-Manager-Domain (Sport + Künstler indirekt); coupled mit title.de "Künstleragent" → "Künstler- und Sportleragent"
  "13-1041.04": { kldbCode: "53313", kldbName: "Berufe in der Gewerbeaufsicht - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Government Property Inspectors: war 31163 Bausachverständige (batch-4 pick auf Title-Lesart "Property=Bauwerke") — Re-evaluation: SOC ist Vertrags-/Regelungs-Compliance, nicht Bauinspektion; 53313 Gewerbeaufsicht passt; coupled mit title.de "Inspekteur öffentliches Eigentum" → "Regierungsinspektor"
  "13-1041.06": { kldbCode: "81484", kldbName: "Ärzte/Ärztinnen (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Coroners (Gerichtsmediziner): war 73104 Rechtsberatung ohne-Spez (Drift) — Coroner = forensic pathologist = MD; 81484 Ärzte sonstige passt
  "13-1041.07": { kldbCode: "71384", kldbName: "Berufe in der Unternehmensorganisation und -strategie (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Regulatory Affairs Specialists: war 73104 Rechtsberatung — Reconcile gegen agent's 73284 ÖV (RA arbeitet in Pharma/Medtech-Industrie, nicht Behörden); 71384 ist die Industry-Compliance-Klasse
  "13-1051.00": { kldbCode: "72223", kldbName: "Berufe in Kostenrechnung und Kalkulation - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Cost Estimators: war 72243 Wirtschaftsprüfung — Cost Estimator macht Kalkulation, nicht Audit; 72223 ist die Exact-Klasse für Kostenrechnung
  "13-1081.00": { kldbCode: "51623", kldbName: "Speditions- und Logistikkaufleute - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Logisticians: war 51624 Anf 4 — Sibling-Tier-Downgrade; SOC ist Spezialist-Niveau (Bachelor), nicht Studien-Niveau (Master)
  "13-1081.01": { kldbCode: "71384", kldbName: "Berufe in der Unternehmensorganisation und -strategie (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Logistics Engineers: war 51624 Speditionskaufleute (seed, kaufmännisch-fokussiert) — Logistics Engineer ist Systemingenieur (gestaltet Transportnetzwerke + Prozesse); 71384 Unternehmensorg trifft den systemisch-organisatorischen Charakter
  "13-1081.02": { kldbCode: "51623", kldbName: "Speditions- und Logistikkaufleute - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Logistics Analysts: war 51624 Anf 4 — Sibling-Tier-Downgrade; Analyst ist Bachelor-Tier (Anf 3)
  "13-1082.00": { kldbCode: "71394", kldbName: "Führungskräfte - Unternehmensorganisation und -strategie", anforderungsniveau: 4, trainingCategory: "studies" }, // Project Management Specialists: war 71393 Aufsichtskräfte (seed, Tier-Mismatch zu Anf 4) — 71394 Führungskräfte ist die Anf-4-Klasse derselben Familie
  "13-1131.00": { kldbCode: "92113", kldbName: "Berufe in Werbung und Marketing - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Fundraisers: war 63123 Sport-/Fitnesskaufleute (seed, Stem-Drift via "-kauf-") — Fundraising ist PR/Marketing für Non-Profits; 92113 ist der Domain-Match; coupled mit title.de "Mitarbeiter im Bereich Fundraising" → "Fundraiser"
  "13-1151.00": { kldbCode: "71513", kldbName: "Berufe in der Personalentwicklung und -sachbearbeitung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Training and Development Specialists: war 84483 Lehrkräfte außerschulische Bildung (Drift via "Lehr-") — Personalentwicklung ist intern im Unternehmen, nicht Volkshochschul-Lehrkraft; 71513 trifft genau die HR-Personalentwicklung-Domain
  "13-1199.06": { kldbCode: "61283", kldbName: "Kaufleute im Handel (sonstige spezifische Tätigkeitsangabe) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Online Merchants: war 92113 Werbung/Marketing — E-Commerce ist Handel, nicht Marketing (Marketing ist Nebentätigkeit); 61283 Handel sonstige passt
  "13-1199.07": { kldbCode: "53183", kldbName: "Berufe in Objekt-, Personen-, Brandschutz, Arbeitssicherheit (sonstige spezifische Tätigkeitsangabe) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Security Management Specialists: war 53122 Arbeitssicherheit fachlich Anf 2 — SOC ist Security-Strategy/Planning (beratend, Bachelor-Tier), nicht Site-Helfer; 53183 sonstige komplex Anf 3 passt
  "13-2061.00": { kldbCode: "72244", kldbName: "Berufe in Wirtschaftsprüfung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Financial Examiners: war 72243 Anf 3 — Sibling-Tier-Upgrade; regulatorische Prüfung auf Behördenebene = Studienberuf
  "13-2071.00": { kldbCode: "83154", kldbName: "Berufe in der Sozial-, Erziehungs- und Suchtberatung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Credit Counselors: war 72113 Bankkaufleute Anf 3 (Stem-Drift "Berater" → Bank) — Schuldnerberatung ist anerkannte Sozialberatung (Caritas/Diakonie/AWO), Sozialarbeit-Studium; 83154 nur auf Anf 4 verfügbar
  "13-2081.00": { kldbCode: "73233", kldbName: "Berufe in der Steuerverwaltung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Tax Examiners and Revenue Agents: war 73232 Anf 2 — Sibling-Tier-Upgrade; Steuerbeamte gehobener Dienst (Bachelor-Eingang)
  "13-2082.00": { kldbCode: "72302", kldbName: "Berufe in der Steuerberatung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Tax Preparers: war 72243 Wirtschaftsprüfung Anf 3 — SOC "Tax Preparers" sind NICHT der geschützte DE-Steuerberater (Anf 4 Kammerberuf), sondern Steuerfachangestellte (Anf 2 IHK-Lehrberuf); coupled mit title.de "Steuerberater" (geschützter Titel!) → "Steuerfachangestellte"

  // === Audit batch 10 — SOC 19 Life, Physical, and Social Science (2026-04-25) ===
  // Plan-table walked all 27 SOC 19 findings. 22 KldB-changing entries below
  // (14 Apply, 2 seed pull-outs, 5 Modify reconciliations, 1 KldB-only Modify).
  // 4 Title-only fixes via title-overrides-de.mjs (KldB stays correct: 19-1011
  // at 41204 Biologie, 19-2021 at 42144 Meteorologie, 19-4013 at 41322
  // chem-Lab, 19-4092 at 53222 Polizeivollzug). 1 entry skipped (19-4099.03 —
  // agent marked current 31213 Anf 3 as defensible).

  // Biology research scientists — domain corrections + Anf-up to studies tier
  "19-1012.00": { kldbCode: "41284", kldbName: "Berufe in der Biologie (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Food Scientists: war 27103 generic technische F&E Anf 3 — Lebensmittelwissenschaftler sind Hochschulabsolventen; 41284 Biologie sonstige Anf 4 trifft den Forschungs-Charakter
  "19-1022.00": { kldbCode: "41264", kldbName: "Berufe in der Biologie (Mikrobiologie) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Microbiologists: war 41203 Biologie ohne-Spez. Anf 3 — Mikrobiologie hat eigene Klasse 41264; sibling-up Anf 3 → 4 (Master/Promotion-Tier)
  "19-1023.00": { kldbCode: "41254", kldbName: "Berufe in der Biologie (Zoologie) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Zoologists/Wildlife Biologists: war 41293 Aufsichtskräfte Biologie Anf 3 (seed) — Forschungstätigkeit ist Studienberuf, 41254 Zoologie ist die Exact-Klasse; pulled out of seed
  "19-1031.02": { kldbCode: "41234", kldbName: "Berufe in der Biologie (Ökologie) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Range Managers: war 42314 Umweltschutzverwaltung — Reconcile gegen agent's 11714 Forst (Range Mgmt = Weide/Grasland, nicht Forst); 41234 Ökologie matched DE-Beruf "Landschaftsökologe"; sibling-aligned mit 19-1031.03 Conservation Scientists
  "19-1032.00": { kldbCode: "11713", kldbName: "Berufe in der Forstwirtschaft - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Foresters: war 41213 biologisch-techn. Lab — Foresters sind Forstmanager/Forstinspektoren; coupled mit title.de "Botaniktechniker" → "Förster" (statt agent's "Forstwirt" — Förster ist Anf-3-Tier; matched BACKLOG-Wunsch nach Suchbarkeit)

  // Materials/Atmosphere/Policy/Remote-Sensing — sibling resolution + drift fixes
  "19-2032.00": { kldbCode: "41304", kldbName: "Berufe in der Chemie (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Materials Scientists: war 41303 Anf 4 (seed-Widerspruch — 41303 ist Anf-3-Klasse, declared anf=4); kanonischer Anf-4-Sibling 41304 behebt Code-Anf-Mismatch; pulled out of seed
  "19-2041.01": { kldbCode: "42314", kldbName: "Berufe in der Umweltschutzverwaltung und -beratung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Climate Change Policy Analysts: war 72184 Versicherungs-/Finanzdienst (Drift) — Reconcile gegen agent's 42144 Meteorologie (Policy = Verwaltung/Beratung, nicht Forschung); 42314 sibling-aligned mit 19-3011.01 Environmental Economists; coupled mit title.de "Referent" → "Klimapolitik-Analyst"
  "19-2099.01": { kldbCode: "43144", kldbName: "Berufe in der Geoinformatik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Remote Sensing Scientists: war 31213 Vermessungstechnik Anf 3 (prior batch-entry: "43144 only Anf 4 out of reach at jobZone Anf 3") — Audit übersteuert: Remote-Sensing-Scientist IST Forschungs-Tier (Anf 4), 43144 ist die Exact-Klasse; coupled mit title.de hyphen-fix "Fernerkundungs-Wissenschaftler" → "Fernerkundungswissenschaftler"

  // Social/Policy sciences
  "19-3011.01": { kldbCode: "42314", kldbName: "Berufe in der Umweltschutzverwaltung und -beratung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Environmental Economists: war 72184 Versicherungs-/Finanzdienst (Stem-Drift "Ökonom") — Umweltökonomik gehört in Umweltschutzverwaltung/-beratung
  "19-3032.00": { kldbCode: "81614", kldbName: "Berufe in der nicht klinischen Psychologie - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Industrial-Organizational Psychologists: war 71524 Personaldienstleister (Stem-Drift "HR/Org") — A&O-Psychologen sind Psychologen, nicht Personaldienstleister
  "19-3033.00": { kldbCode: "81624", kldbName: "Berufe in der klinischen Psychologie - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Clinical/Counseling Psychologists: war 81614 nicht-klinische (sibling-Drift; current Code ist exakt das Gegenteil der Tätigkeit)
  "19-3039.03": { kldbCode: "81624", kldbName: "Berufe in der klinischen Psychologie - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Clinical Neuropsychologists: war 81614 nicht-klinische (sibling-Drift)
  "19-3051.00": { kldbCode: "31124", kldbName: "Berufe in der Stadt- und Raumplanung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Urban and Regional Planners: war 31114 Architektur — Urban/Regional Planning ist Stadt-/Raumplanung, nicht Architektur; coupled mit title.de "Referent Regionalentwicklung" → "Stadt- und Raumplaner"
  "19-3091.00": { kldbCode: "91264", kldbName: "Berufe in der Anthropologie und Ethnologie - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Anthropologists/Archeologists: war 91234 Archäologie (deckt nur Archaeology-Hälfte) — 91264 deckt Anthropologie/Ethnologie-Hälfte; Title bleibt "Anthropologe und Archäologe..." (deckt beide SOC-Subdomains)

  // Technicians (research-support tier)
  "19-4012.01": { kldbCode: "11113", kldbName: "Berufe in der Landtechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Precision Agriculture Technicians: war 11103 Landwirtschaft ohne-Spez. — GIS/GPS/Landtechnik ist die Spezial-Domain; 11113 Landtechnik passt
  "19-4042.00": { kldbCode: "42203", kldbName: "Berufe in der Umweltschutztechnik (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Environmental Sci/Protection Technicians: war 42314 Umweltschutzverwaltung Anf 4 — Tech-Tier (Bachelor/FH), nicht Verwaltung-Studienberuf; sibling-domain Verwaltung → Technik + Anf-down 4 → 3
  "19-4043.00": { kldbCode: "42113", kldbName: "Berufe in der Geotechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Geological Technicians: war 41323 chem-techn. Lab (Drift) — Geotechnik komplex passt für Bohrproben/Erdanalyse-Assistenz
  "19-4044.00": { kldbCode: "42113", kldbName: "Berufe in der Geotechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Hydrologic Technicians: war 42124 Geologie Anf 4 — Tech-Tier-Korrektur; agent gab keine KldB-Suggestion, aber 42124 hat keine Anf-3-Klasse; 42113 Geotechnik komplex deckt Hydrogeologie-Tech-Arbeit; coupled mit title.de "Hydrogeologe" → "Hydrologische Fachkraft"
  "19-4051.00": { kldbCode: "26233", kldbName: "Berufe in der Energie- und Kraftwerkstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Nuclear Technicians: war 41322 chem-techn. Lab (Drift) — Kernkraftwerks-Tech ist Energie-Domain; Anf-up 2 → 3 (Spezialisten-Ausbildung)
  "19-4051.02": { kldbCode: "42333", kldbName: "Strahlenschutzbeauftragte - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Nuclear Monitoring Technicians: war 41322 chem-techn. Lab (Drift) — Strahlenschutz ist eigene KldB-Klasse 42333; Anf-up 2 → 3 (Strahlenschutz-Fachkunde)
  "19-4061.00": { kldbCode: "91343", kldbName: "Berufe in der Markt- und Meinungsforschung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Social Science Research Assistants: war 91324 Soziologie hoch komplex Anf 4 (überhöht — Research Assistants sind Hilfskräfte, nicht promovierte Soziologen); 91343 Markt-/Meinungsforschung Anf 3 trifft Tech-Tier; coupled mit title.de "Sozialarbeitswissenschaftler" → "Sozialwissenschaftlicher Assistent"
  "19-5012.00": { kldbCode: "53122", kldbName: "Berufe in Arbeitssicherheit und Sicherheitstechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Occupational Health & Safety Technicians: war 31102 Bauplanung Anf 2 (Drift) — 53122 Arbeitssicherheit fachlich ist die Exact-Klasse

  // === Audit batch 9 — SOC 43 Office and Administrative Support (2026-04-25) ===
  // Plan-table walked all 23 SOC 43 findings. 17 KldB-changing entries below
  // (12 Apply, 2 seed pull-outs, 3 Modify reconciliations). 5 entries get
  // title-only fixes via title-overrides-de.mjs (KldB stays correct: 43-4011
  // remains in seed at 72122, 43-4061 stays at 73212 Sozialverwaltung,
  // 43-4151 stays at 61122 Vertrieb, 43-4181 stays at 63112 Tourismus,
  // 43-5111 stays at 27312 Q-Sicherung). 1 entry skipped (43-5031 — agent
  // marked current 81342 as akzeptable).
  "43-2011.00": { kldbCode: "71452", kldbName: "Berufe in der Auskunft und Kundeninformation - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Switchboard Operators: war 71401 Büro-Helfer Anf 1 — Telefonzentrale leitet Anrufe weiter + gibt Auskünfte; 71452 Auskunft/Kundeninfo passt; Anf-bump 1 → 2
  "43-3021.00": { kldbCode: "72212", kldbName: "Berufe in der Buchhaltung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Billing and Posting Clerks: war 61122 Vertrieb (Drift) — Fakturisten erstellen Rechnungen + buchen Zahlungsvorgänge = Buchhaltung, nicht Vertrieb
  "43-3031.00": { kldbCode: "72212", kldbName: "Berufe in der Buchhaltung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bookkeeping/Accounting/Auditing Clerks: war 72122 Anlageberater (seed-Drift) — Buchhalter sind Buchhaltungsberufe, keine Anlageberater; coupled mit title.de "Steuersachbearbeiter" → "Buchhalter/Buchhalterin"
  "43-3061.00": { kldbCode: "61112", kldbName: "Berufe im Einkauf - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Procurement Clerks: war 63212 Hotelkaufleute (Stem-Kollision ohne Bezug) — 61112 Einkauf ist die Exact-Klasse
  "43-4021.00": { kldbCode: "71402", kldbName: "Büro- und Sekretariatskräfte (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Correspondence Clerks: war 42312 Umweltschutzverwaltung (Drift) — Geschäftskorrespondenz = Büro/Sekretariat
  "43-4031.00": { kldbCode: "73252", kldbName: "Berufe in der Justizverwaltung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Court/Municipal/License Clerks: war 53232 Gerichtsvollzug (seed-Drift) — Justizfachangestellte arbeiten in Gerichtskanzlei/Verwaltung, nicht Pfändung; pulled out of seed
  "43-4081.00": { kldbCode: "63212", kldbName: "Hotelkaufleute - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Hotel/Motel/Resort Desk Clerks: war 71452 Auskunft (zu generisch) — Reconcile gegen agent's null; KldB hat 63212 Hotelkaufleute als DE-Hotelfach-Berufsbild (Hotelfachmann/-frau IHK-Lehrberuf)
  "43-4121.00": { kldbCode: "73322", kldbName: "Berufe im Bibliothekswesen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Library Assistants Clerical: war 73312 Archivwesen (Schwester-Klasse, falsches Domain) — 73322 Bibliothekswesen exact
  "43-4141.00": { kldbCode: "72112", kldbName: "Bankkaufleute - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // New Accounts Clerks: war 72113 Bankkaufleute komplex Anf 3 — SOC ist Konten-Eröffnung + Antragsformulare = Fachkraft (Bankkaufmann/-frau Lehrberuf), nicht Spezialist; sibling-down Anf 3 → 2
  "43-5011.00": { kldbCode: "51622", kldbName: "Speditions- und Logistikkaufleute - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Cargo and Freight Agents: war 51623 Spedition komplex Anf 3 — Disposition/Abfertigung = Speditionskaufmann/-frau Lehrberuf; sibling-down Anf 3 → 2
  "43-5011.01": { kldbCode: "51623", kldbName: "Speditions- und Logistikkaufleute - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Freight Forwarders: war 51332 Hafenumschlag (körperlicher Güterumschlag, falsch) — Reconcile gegen agent's 61123 Vertrieb (passt nicht für Spedition); 51623 ist die parent-class von 43-5011.00, .01-Suffix = Spezialist Anf 3
  "43-5032.00": { kldbCode: "51622", kldbName: "Speditions- und Logistikkaufleute - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Dispatchers (exc. Police/Fire/Ambulance): war 51122 Luftverkehrstechnik (technischer Betrieb, falsch) — Disponent koordiniert Transport per Telefon/Funk = Spedition; coupled mit title.de "Flugdienstberater" → "Disponent (Transport und Logistik)"
  "43-5051.00": { kldbCode: "51322", kldbName: "Berufe für Post- und Zustelldienste - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Postal Service Clerks: war 72112 Bankkaufleute (Drift) — Postschalter gehört zu Post-/Zustelldiensten, nicht Bank
  "43-6011.00": { kldbCode: "71403", kldbName: "Büro- und Sekretariatskräfte (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Executive Secretaries: war 63212 Hotelkaufleute (kein Bezug) — Vorstandsassistent ist hochrangige Büro-/Sekretariatskraft Anf 3
  "43-9071.00": { kldbCode: "71402", kldbName: "Büro- und Sekretariatskräfte (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Office Machine Operators: war 42312 Umweltschutzverwaltung (offensichtlich falsch) — 71402 generic Büro fachlich; coupled mit title.de "Bürogerätemitarbeiter" → "Reprografiekraft"
  "43-9081.00": { kldbCode: "71442", kldbName: "Kodierer/innen, Korrekturleser/innen und verwandte Bürokräfte - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Proofreaders and Copy Markers: war 23213 Digital-/Printmediengestaltung Anf 3 (zu kreativ-fokussiert) — 71442 Korrekturleser ist die Exact-Klasse; sibling-down Anf 3 → 2
  "43-9111.00": { kldbCode: "91342", kldbName: "Berufe in der Markt- und Meinungsforschung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Statistical Assistants: war 91343 Markt-/Meinungsforschung komplex Anf 3 — Reconcile gegen agent's null; 91342 enthält Demoskopie-Statistik-Hilfskräfte, sibling-down Anf 3 → 2 ist klarer als zu generic 71402

  // === Audit batch 11 — SOC 11 Management (2026-04-25) ===
  // Plan-table walked all 24 SOC 11 findings. 22 KldB-changing entries below
  // (14 Apply, 7 seed pull-outs, 2 Modify reconciliations, 1 title-only).
  // Three reconciliations against agent picks: 11-9072 Recreation 63404 →
  // 63194 (Tourismus/Sport sauberer als Veranstaltungsservice für Park/Rec
  // Mgmt); 11-9199.01 RA Director 27194 → 71394 (Konsistenz mit
  // 13-1041.07 RA Specialist in 71384/Unternehmensorg-Familie);
  // 11-9071 Gambling Manager 63394 Gastronomie → 71394 generische
  // Führungskräfte-Klasse (Glücksspiel-Domain 94342 catalog-only Anf 2,
  // Casino-Mgmt ist nicht Restaurant-Mgmt; sibling-domain-pivot zu generic
  // Director-Tier — vgl. 33-9031 Surveillance in 94342 als Tier-1-Counterpart).
  // Sibling-Tier-Pattern weiter aktiv: 5 Anf-Bumps innerhalb gleicher Domain
  // (11-2033 92203→92204; 11-3012 71393→71394; 11-9051 63313→63394 mit
  // KldB+Anf-Drift; 11-9171 82402→82403; 11-9199.08 53122→53123).

  // CSR/Sustainability — Stabsrolle, kein Vorstand
  "11-1011.03": { kldbCode: "71384", kldbName: "Berufe in der Unternehmensorganisation und -strategie (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Chief Sustainability Officers: war 71104 Geschäftsführer/Vorstände (seed-Drift — CSO/Nachhaltigkeitsbeauftragter ist Stabsrolle, kein C-Suite); pulled out of seed; coupled mit title.de "Beauftragter f.d. soziale Verantwortung..." → "CSR-Manager/CSR-Managerin"

  // Marketing/Werbung/PR — Werbung-und-Marketing-Familie
  "11-2011.00": { kldbCode: "92194", kldbName: "Führungskräfte - Werbung und Marketing", anforderungsniveau: 4, trainingCategory: "studies" }, // Advertising and Promotions Managers: war 43294 IT-Vertrieb (Drift) — Werbeleitung ist Marketing/Werbung; coupled mit title.de "Werbeleiter" → "Werbemanager/Werbemanagerin"
  "11-2021.00": { kldbCode: "92194", kldbName: "Führungskräfte - Werbung und Marketing", anforderungsniveau: 4, trainingCategory: "studies" }, // Marketing Managers: war 43294 IT-Vertrieb (Drift) — gleiche Werbung/Marketing-Familie wie 11-2011; coupled mit title.de "Führungskraft für Marketing" → "Marketingmanager/Marketingmanagerin"
  "11-2022.00": { kldbCode: "61194", kldbName: "Führungskräfte - Einkauf und Vertrieb", anforderungsniveau: 4, trainingCategory: "studies" }, // Sales Managers: war 43294 IT-Vertrieb (Drift) — generischer Sales Manager gehört in 61194 Einkauf/Vertrieb, nicht IT-Sales-Spezialklasse
  "11-2032.00": { kldbCode: "92294", kldbName: "Führungskräfte - Öffentlichkeitsarbeit", anforderungsniveau: 4, trainingCategory: "studies" }, // Public Relations Managers: war 23294 Technische Mediengestaltung (Drift) — PR ist Öffentlichkeitsarbeit
  "11-2033.00": { kldbCode: "92204", kldbName: "Berufe in der Öffentlichkeitsarbeit - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Fundraising Managers: war 92203 Öffentlichkeit komplex Anf 3 — Manager-Tier (Studienabschluss + Budgetverantwortung); sibling-up 92203 → 92204

  // Admin/Office — Unternehmensorganisations-Familie
  "11-3012.00": { kldbCode: "71394", kldbName: "Führungskräfte - Unternehmensorganisation und -strategie", anforderungsniveau: 4, trainingCategory: "studies" }, // Administrative Services Managers: war 71393 Aufsichtskräfte Anf 3 (zu niedrig — General Manager Verwaltung ist Director-Tier); sibling-up 71393 → 71394; coupled mit title.de "Bibliotheksleiter" → "Verwaltungsleiter/Verwaltungsleiterin"

  // Energy/Production — domänen-Drift-Korrekturen
  "11-3051.04": { kldbCode: "26234", kldbName: "Berufe in der Energie- und Kraftwerkstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Biomass Plant Managers: war 41393 Aufsichtskräfte Chemie (seed-Drift) — Biomasse-Kraftwerk ist Energie-Domain, sibling-Domain zu 11-3051.02 Geothermal (auch 26234) und 11-3051.06 Hydro (31144 Wasser); pulled out of seed
  "11-3061.00": { kldbCode: "61194", kldbName: "Führungskräfte - Einkauf und Vertrieb", anforderungsniveau: 4, trainingCategory: "studies" }, // Purchasing Managers: war 51694 Verkehr/Logistik (Drift via "-leitung") — Einkauf gehört in 61194; coupled mit title.de "Einkaufsleiter" → "Einkaufsmanager/Einkaufsmanagerin"

  // Education/Hospitality
  "11-9033.00": { kldbCode: "84394", kldbName: "Führungskräfte - Hochschullehre und -forschung", anforderungsniveau: 4, trainingCategory: "studies" }, // Education Administrators Postsecondary: war 84194 Allgemeinbildende Schulen (Drift; SOC ist Postsecondary = Hochschule); coupled mit title.de "höhere Lehranstalt" → "Hochschulleiter/Hochschulleiterin"
  "11-9051.00": { kldbCode: "63394", kldbName: "Führungskräfte - Gastronomie und Systemgastronomie", anforderungsniveau: 4, trainingCategory: "studies" }, // Food Service Managers: war 63313 Systemgastronomie komplex Anf 3 (Spezialist-Tier zu niedrig) — Restaurantmanager ist Director-Tier; sibling-up 63313 → 63394 mit Anf 3 → 4
  "11-9071.00": { kldbCode: "71394", kldbName: "Führungskräfte - Unternehmensorganisation und -strategie", anforderungsniveau: 4, trainingCategory: "studies" }, // Gambling Managers: was seed 63124 Sport/Fitness (Drift) — Reconcile gegen agent's 63394 Gastronomie (Casino ≠ Restaurant); KldB hat keine Glücksspiel-Führungskräfte-Klasse (94342 catalog-only Anf 2), pivot zu 71394 generischer Director-Tier; pulled out of seed
  "11-9072.00": { kldbCode: "63194", kldbName: "Führungskräfte - Tourismus und Sport", anforderungsniveau: 4, trainingCategory: "studies" }, // Entertainment & Recreation Managers: was seed 63124 Sport/Fitness — Reconcile gegen agent's 63404 Veranstaltungsservice (zu Event-spezifisch); 63194 Tourismus/Sport ist Director-Klasse für Park/Rec/Country-Club-Mgmt, parallel zu 11-9179.02 Spa und 11-9179.01 Sporteinrichtung-Seed; pulled out of seed

  // Research/Engineering Director-Tier
  "11-9121.01": { kldbCode: "27184", kldbName: "Berufe in der technischen Forschung und Entwicklung (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Clinical Research Coordinators: war 27194 Tech F&E Führungskräfte (Coordinator ist nicht Director-Tier) — 27184 Forschungs-Spezialist Anf 4 trifft Coordinator-Tier besser; KldB hat keine clinical-research-management-Klasse, 27184 ist nearest-tier Forschungs-Domain
  "11-9121.02": { kldbCode: "31144", kldbName: "Berufe in der Wasserwirtschaft - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Water/Wastewater Engineers: war 71333 Wirtschaftsförderung Anf 3 (Drift) — Wasserwirtschaftsingenieur sitzt in Bau-/Umwelttechnik; KldB+Anf 3 → 4

  // Public sector / facilities
  "11-9131.00": { kldbCode: "51393", kldbName: "Aufsichtskräfte - Lagerwirtschaft, Post und Zustellung, Güterumschlag", anforderungsniveau: 3, trainingCategory: "specialist" }, // Postmasters and Mail Superintendents: war null Anf 2 (Lücke) — Aufsichts-Tier in Post/Lager-Domain; coupled mit title.de "Postdirektor" → "Poststellenleiter/Poststellenleiterin"
  "11-9161.00": { kldbCode: "53184", kldbName: "Berufe in Objekt-, Personen-, Brandschutz, Arbeitssicherheit (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Emergency Management Directors: war 42334 Strahlenschutz (Drift) — Katastrophenschutz/Notfallmgmt ist Brandschutz/Sicherheits-Domain, nicht Strahlenschutz
  "11-9171.00": { kldbCode: "82403", kldbName: "Berufe im Bestattungswesen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Funeral Home Managers: war 82402 Bestattungswesen fachlich Anf 2 (Geselle-Tier) — Bestattermeister/Funeral Director ist Spezialisten-Tier; sibling-up 82402 → 82403 mit Anf 2 → 3
  "11-9179.02": { kldbCode: "63194", kldbName: "Führungskräfte - Tourismus und Sport", anforderungsniveau: 4, trainingCategory: "studies" }, // Spa Managers: was seed 63124 Sport/Fitness — "Heilbad" verfehlte Spa-Lesart komplett; 63194 Tourismus/Sport ist Director-Klasse für Wellness/Spa-Mgmt; pulled out of seed; coupled mit title.de "Leiter eines Heilbades" → "Spa-Manager/Spa-Managerin"

  // Compliance/Legal/Risk — Unternehmensorg-Familie konsistent zu 13-1041.07
  "11-9199.01": { kldbCode: "71394", kldbName: "Führungskräfte - Unternehmensorganisation und -strategie", anforderungsniveau: 4, trainingCategory: "studies" }, // Regulatory Affairs Managers: war 73104 Rechtsberatung (Drift — RA ist Zulassungsmgmt, kein Anwalt) — Reconcile gegen agent's 27194 Tech F&E; 71394 hält RA-Familie konsistent zu 13-1041.07 RA Specialist (71384) als Director-Tier; coupled mit title.de "Leiter Regulatory Affairs" → "Zulassungsleiter/Zulassungsleiterin"
  "11-9199.02": { kldbCode: "71384", kldbName: "Berufe in der Unternehmensorganisation und -strategie (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Compliance Managers: war 73104 Rechtsberatung (Drift) — Compliance-Mgmt ist Unternehmensorg-Senior-Specialist-Tier (Lead innerhalb Risk/Legal), 71384 statt 71394-Director-Tier
  "11-9199.08": { kldbCode: "53123", kldbName: "Berufe in Arbeitssicherheit und Sicherheitstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Loss Prevention Managers: was seed 53122 fachlich Anf 2 (zu niedrig — Manager plant/steuert Sicherheitsprogramme); sibling-up 53122 → 53123 mit Anf 2 → 3; pulled out of seed
  "11-9199.10": { kldbCode: "26244", kldbName: "Berufe in der regenerativen Energietechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Wind Energy Project Managers: was seed 61394 Immobilien (Drift) — Windenergie-Projektmgmt gehört in regenerative Energietechnik; pulled out of seed

  // === Audit batch 12 — SOC 17 Architecture and Engineering (2026-04-25) ===
  // Plan-table walked all 21 SOC 17 findings. 18 KldB-changing entries below
  // (12 Apply, 5 seed pull-outs, 4 Modify reconciliations); 2 explicit Rejects
  // not represented (17-2171 Petroleum — current 21114 already matches
  // agent's suggestion; 17-2051 Civil — agent flagged anf-mismatch but own
  // reasoning admits "current Anf 4 ist korrekt"). 4 coupled title overrides.
  // Sibling-tier pattern continued: 17-2121 Marine triple-fix (KldB+title+Anf
  // 3→4), 17-2199.03 Energy double-fix (KldB+Anf 3→4), 17-2051.02 Water
  // pulled beyond audit's title-only flag to Anf 4 for engineer-tier
  // consistency with batch-11's 11-9121.02 (31144 Wasserwirtschaft).
  // Modify gegen agent's null on 17-3028 Calibration: 27312 Tech QS fachlich
  // Anf 2 (KldB hat keine dedizierte Mess-/Eichwesen-Klasse, Kalibrierung
  // ist QS-Disziplin; konsistent zu sibling 17-3029.01 NDT in 27313
  // QS komplex Anf 3). Code-Anf-Widerspruch im Seed bei 17-3026.01 Nano-Tech
  // (war 26123 Anf 4, aber 26123 ist Anf-3-Klasse) — pull-out + 41423
  // Werkstofftechnik komplex Anf 3 löst Inkonsistenz (gleiches Pattern wie
  // batch-10's 19-2032 Materials Scientists).

  // Pulled out of seed
  "17-2031.00": { kldbCode: "27104", kldbName: "Berufe in der technischen Forschung und Entwicklung (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Bioengineers/Biomedical Engineers: was seed 26324 Mikrosystemtechnik (Drift — Biomedical Eng ist Med-Tech/Bio-Wissenschaft); 27104 Tech F&E ohne-Spez. ist nearest-tier (KldB hat keine dedizierte Med-Tech-Eng-Klasse); pulled out of seed
  "17-2112.02": { kldbCode: "27314", kldbName: "Berufe in der technischen Qualitätssicherung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Validation Engineers: was seed 25194 Führungskräfte Maschinenbau (Validation ist QS, nicht Führung) — 27314 Tech QS hoch komplex ist Exact-Klasse; pulled out of seed
  "17-2131.00": { kldbCode: "41424", kldbName: "Berufe in der Werkstofftechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Materials Engineers: was seed 25194 Führungskräfte Maschinenbau — Werkstoffingenieure sind in 41424 Werkstofftechnik (Physik/Materialwissenschaft); pulled out of seed
  "17-2161.00": { kldbCode: "26234", kldbName: "Berufe in der Energie- und Kraftwerkstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Nuclear Engineers: was seed 41404 Physik ohne-Spez. (zu generisch — Nuklearing. sind Ingenieure, nicht Physiker); 26234 Energie-/Kraftwerkstechnik konsistent zu 11-3051.04 Biomass und 11-3051.02 Geothermal; pulled out of seed
  "17-3026.01": { kldbCode: "41423", kldbName: "Berufe in der Werkstofftechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Nanotechnology Engineering Technologists: was seed 26123 Anf 4 (code-Anf-Widerspruch — 26123 ist Anf-3-Klasse, gleicher Pattern wie 19-2032 in batch-10); 41423 Werkstofftechnik komplex Anf 3 löst Inkonsistenz; pulled out of seed; coupled title bleibt "Nanotechnologie-Techniker"

  // Drift corrections — Hardware/Electronics
  "17-2061.00": { kldbCode: "43124", kldbName: "Berufe in der technischen Informatik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Computer Hardware Engineers: war 26124 Automatisierungstechnik (Drift — Hardware-Eng gehört zu IT/tech. Informatik) — 43124 ist Exact-Klasse
  "17-2072.00": { kldbCode: "26304", kldbName: "Berufe in der Elektrotechnik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Electronics Engineers: war 26334 Luft-/Schiffs-/Fahrzeugelektronik (zu Branchen-spezifisch) — allgemeine Elektronikingenieure passen in 26304 Elektrotechnik ohne-Spez.

  // Industrial/Manufacturing — Maschinenbau-ohne-Spez.-Familie statt Führungskräfte
  "17-2112.00": { kldbCode: "25104", kldbName: "Berufe in der Maschinenbau- und Betriebstechnik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Industrial Engineers: war 25194 Führungskräfte Maschinenbau (zu hoch — Industrial Eng sind Wirtschaftsing./Produktionsing., keine Führung); 25104 Maschinenbau ohne-Spez. ist Exact-Klasse; coupled mit title.de "Berechnungsingenieur" → "Wirtschaftsingenieur"
  "17-2112.03": { kldbCode: "25104", kldbName: "Berufe in der Maschinenbau- und Betriebstechnik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Manufacturing Engineers: war 25194 Führungskräfte Maschinenbau — Fertigungsing. konstruieren/optimieren Fertigungssysteme = Maschinenbau-Spezialist, nicht Führung; sibling-Apply zu 17-2112.00

  // Marine/Schiffbau — triple-fix (KldB+title+Anf)
  "17-2121.00": { kldbCode: "25244", kldbName: "Berufe in der Schiffbautechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Marine Engineers and Naval Architects: war 51133 tech. Schiffsverkehrsbetrieb komplex Anf 3 (Drift — Schiffsverkehr ≠ Schiffbau-Konstruktion); 25244 Schiffbautechnik Anf 4 ist Engineer-Tier; KldB+Anf 3→4; coupled mit title.de "Zeichner Seefahrzeuge" → "Schiffbauingenieur"

  // Energy/Mechatronics — Drift fixes
  "17-2199.03": { kldbCode: "26244", kldbName: "Berufe in der regenerativen Energietechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Energy Engineers (.03 — distinct from .10/.11): war 21223 Baustoffherstellung Anf 3 (Drift) — Energy Eng arbeiten an Effizienz/Erneuerbar; 26244 konsistent zu 11-9199.10 in batch-11; KldB+Anf 3→4; coupled mit title.de "Energieanalyst" → "Energieingenieur"
  "17-2199.05": { kldbCode: "26114", kldbName: "Berufe in der Mechatronik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Mechatronics Engineers: war 23124 Papierverarbeitung (offensichtlich Drift) — 26114 Mechatronik ist Exact-Klasse

  // Civil — water reconciliation beyond audit's title-only flag
  "17-2051.02": { kldbCode: "31144", kldbName: "Berufe in der Wasserwirtschaft - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Water/Wastewater Engineers: war 31143 Wasserwirtschaft komplex Anf 3 (Audit nur title-flag) — Engineer-Title impliziert Anf 4; sibling-up 31143 → 31144 konsistent zu batch-11's 11-9121.02 Ingenieur Wasserwirtschaft (auch 31144); coupled mit title.de "Wasserbautechniker" → "Wasserbauingenieur"

  // Technician-tier (Anf 2/3) — Drift + sibling-up
  "17-3021.00": { kldbCode: "26123", kldbName: "Berufe in der Automatisierungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Aerospace Engineering Technicians: war 25133 tech. Servicekräfte Wartung (zu allgemein — Aerospace-Tech arbeiten mit Simulatoren/Systemen, nicht Wartung); 26123 Automatisierungstechnik komplex passt
  "17-3022.00": { kldbCode: "31103", kldbName: "Berufe in der Bauplanung und -überwachung (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Civil Engineering Technologists: war 31102 fachlich Anf 2 — Technikerausbildung ist Spezialisten-Tier (Anf 3), nicht Apprenticeship; sibling-up 31102 → 31103
  "17-3025.00": { kldbCode: "42203", kldbName: "Berufe in der Umweltschutztechnik (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Environmental Engineering Technicians: war 42314 Umweltschutzverwaltung Anf 4 (Verwaltung-Studienberuf, nicht Tech-Tier — Tech sind ausführende Prüftechniker); KldB+Anf 4→3; sibling-domain Verwaltung → Technik konsistent zu batch-10's 19-4042 Environmental Sci/Protection Tech (auch 42203)
  "17-3028.00": { kldbCode: "27312", kldbName: "Berufe in der technischen Qualitätssicherung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Calibration Technicians/Metrology Tech: war 41322 chem-tech. Lab (Drift — Kalibrierung ist physikalische Messtechnik, nicht Chemie); Modify gegen agent's null (KldB hat keine dedizierte Mess-/Eichwesen-Klasse) — 27312 Tech QS fachlich passt (Mess-/Eichwesen ist QS-Disziplin), konsistent zu sibling 17-3029.01 NDT in 27313
  "17-3029.01": { kldbCode: "27313", kldbName: "Berufe in der technischen Qualitätssicherung - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // NDT Specialists (Non-Destructive Testing): war 27312 Tech QS fachlich Anf 2 (zu niedrig — NDT-Spezialisten sind zertifizierte Spezialisten, kein Apprenticeship-Tier); sibling-up 27312 → 27313 mit Anf 2→3
  "17-3029.08": { kldbCode: "21363", kldbName: "Berufe in der Feinoptik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Photonics Technicians: war 27182 Tech F&E sonstige fachlich Anf 2 (zu generisch + zu niedrig) — Photonik-Tech installieren/warten optische Geräte = Feinoptik komplex; sibling-domain pivot + Anf-up 2→3

  // === Audit batch 14 — SOC 47 Construction and Extraction (2026-04-25) ===
  // Plan-table walked all 31 SOC 47 findings. 28 KldB-changing entries below
  // (15 Apply, 4 seed pull-outs, 9 Modify reconciliations); 1 explicit Reject
  // (47-2011 Boilermakers — agent's eigenes Reasoning admittiert "die
  // Schreibweise ist korrekt", null suggestion); 2 title-only entries
  // (47-2051 Concrete Finishers, 47-2082 Drywall Tapers — KldB unchanged).
  // Heaviest catalog-only-Anf-Pattern der Pipeline: 5 Bauhelfer-SOC-Codes
  // (47-3011/3012/3014/3015/3016) — KldB hat in Zimmerei/SHK/Dachdeckerei
  // KEINE Anf-1-Sibling-Klassen; nur Maler-/Lackierer (33211) und
  // Hochbau-ohne-Spez (32101) haben dedizierte Helfer-Klassen. 4 von 5
  // Bauhelfer-SOC-Codes pivotieren zu generic 32101 Hochbau Helfer (catalog-
  // only-Anf-Fallback, gleiches Pattern wie Casino-/Glücksspiel-Pivot batch
  // 11/12). Modifies gegen agent: 47-2042 Floor Layers (agent null →
  // 33102 Bodenverlegung ohne-Spez, parallel zu Holz-Ausschluss in SOC);
  // 47-2072 Pile Drivers + 47-2151 Pipelayers (agent's 32102 Hochbau →
  // 32202 Tiefbau, agent's eigenes Reasoning sagte explizit
  // "Spezialtiefbauer"); 47-3015 Helpers-Plumbers (agent null → 32101
  // catalog-pivot — kein 34211 Anf-1-Sibling); 47-4041 Hazmat (agent's
  // 34333 Abfallwirtschaft → 42203 Umweltschutztechnik, konsistent zu
  // batch-10's 19-4042 + batch-12's 17-3025). Modify-beyond-audit's-flag
  // bei 47-3012/3016 (Audit nur Anf-flag, catalog-Pivot zu 32101 wegen
  // fehlendem Anf-1-Sibling), 47-5071 Roustabouts (Audit nur Title-flag,
  // KldB+Anf-Shift zu 21111 Berg-/Tagebau Helfer parallel zu 47-5081
  // Helpers-Mining). Coupled title cascades: 47-2042 → "Bodenleger";
  // 47-2051 → "Betonbauer"; 47-2082 → "Trockenbaumonteur"; 47-3015 →
  // "Helfer Sanitär-/Rohrinstallation"; 47-4031 → "Zaunbauer";
  // 47-4071 → "Kanal-/Rohrreiniger"; 47-5011 → "Bohranlagenoperator";
  // 47-5071 → "Bohranlagenhelfer". Slot-Swaps: 47-2042/2043 (Bodenverlegung
  // ohne-Spez ↔ Parkett); 47-3011/4091 (32212 Pflasterer slot frei nach
  // 47-3011-Pull-out → 47-4091); 47-2151/4061 (32232 Gleisbau slot frei
  // nach 47-2151-Move → 47-4061).

  // First-Line Supervisor — Aufsichtskraft-Tier
  "47-1011.00": { kldbCode: "32193", kldbName: "Aufsichtskräfte - Hochbau", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Construction Trades: war 51332 Güter-/Warenumschlag (komplett falscher Sektor) — 32193 Aufsichtskräfte Hochbau ist Exact-Klasse für Bauleiter-Tier; KldB+Anf 2→3

  // Renewable Energy
  "47-1011.03": { kldbCode: "26243", kldbName: "Berufe in der regenerativen Energietechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Solar Energy Installation Managers: war 26212 Bauelektrik Anf 2 — Solar-Installationsleiter ist Meister/Techniker-Tier in regenerativer Energie; KldB+Anf 2→3
  "47-2152.04": { kldbCode: "26242", kldbName: "Berufe in der regenerativen Energietechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Solar Thermal Installers: war 26212 Bauelektrik (Drift) — Solarthermie ist regenerative Energie/Sanitär-Heizung, nicht Bauelektrik

  // Bodenverlegung — Slot-Swap zwischen 47-2042/2043
  "47-2042.00": { kldbCode: "33102", kldbName: "Berufe in der Bodenverlegung (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Floor Layers Except Carpet/Wood/Hard Tiles: war 33132 Parkettverlegung (Drift — SOC schließt Holz EXPLIZIT aus); Modify gegen agent's null — 33102 Bodenverlegung ohne-Spez. trifft Vinyl/Kork/Soft-Beläge; coupled mit title.de "Parkettleger" → "Bodenleger/Bodenlegerin"
  "47-2043.00": { kldbCode: "33132", kldbName: "Berufe in der Parkettverlegung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Floor Sanders and Finishers: war 33102 Bodenverlegung ohne-Spez. — Schleifen ist Holzboden-spezifisch, 33132 Parkett trifft besser; Slot-Swap zu 47-2042

  // Specialty trades
  "47-2044.00": { kldbCode: "33112", kldbName: "Berufe in der Fliesen-, Platten- und Mosaikverlegung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Tile and Stone Setters: war 32122 Maurerhandwerk (Drift) — Fliesenleger ist eigenständige Handwerksklasse
  "47-2072.00": { kldbCode: "32202", kldbName: "Berufe im Tiefbau (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Pile-Driver Operators: war 32222 Straßen-/Asphaltbau (Drift) — Modify gegen agent's 32102 Hochbau (agent's eigenes Reasoning: "Pile Driver Operators sind Spezialtiefbauer") → 32202 Tiefbau ohne-Spez. ist Domain-konsistent
  "47-2142.00": { kldbCode: "93232", kldbName: "Berufe in der Raumausstattung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Paperhangers (Tapezierer): war 33212 Maler-/Lackiererarbeiten — Raumausstatter ist die korrekte DE-Ausbildung für Tapezierarbeiten

  // Pipe / Drainage / Rebar
  "47-2151.00": { kldbCode: "32202", kldbName: "Berufe im Tiefbau (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Pipelayers: war 32232 Gleisbau (Drift via "-bau") — Modify gegen agent's 32102 Hochbau — Pipelayers verlegen Rohre IM BODEN = Tiefbau-Domain (parallel zu 47-2072 Pile Drivers)
  "47-2152.00": { kldbCode: "34322", kldbName: "Berufe im Rohrleitungsbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Plumbers/Pipefitters/Steamfitters: war 24422 Schweiß-/Verbindungstechnik (Drift — Verbindungstechnik ist Methode, nicht Beruf); Rohrleitungsbau differenziert von 47-3015 SHK in 34212
  "47-2171.00": { kldbCode: "32112", kldbName: "Berufe im Beton- und Stahlbetonbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Reinforcing Iron and Rebar Workers: war 32122 Maurerhandwerk (Drift) — Bewehrungsstahl-Verlegung gehört in Beton-/Stahlbetonbau

  // Bauhelfer (Helper-Tier) — Catalog-only-Anf-Fallback zu 32101 (4 von 5 Codes)
  "47-3011.00": { kldbCode: "32101", kldbName: "Berufe im Hochbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Helpers-Brickmasons/Stonemasons/Tile Setters: was seed 32212 Pflasterer/Steinsetzer Anf 2 (falscher Tier — Pflasterer ist eigenständiger Ausbildungsberuf, nicht Hilfsarbeiter); pulled out of seed; KldB+Anf 2→1
  "47-3012.00": { kldbCode: "32101", kldbName: "Berufe im Hochbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Helpers-Carpenters: war 33322 Zimmerei Anf 2 (Audit nur Anf-flag) — Modify-beyond-audit's-flag (catalog-pivot — kein 33321 Anf-1-Sibling in Zimmerei); 32101 generic Bauhelfer; KldB+Anf 2→1
  "47-3014.00": { kldbCode: "33211", kldbName: "Berufe für Maler- und Lackiererarbeiten - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Helpers-Painters/Paperhangers/Plasterers: war 33212 Maler/Lackierer Anf 2 — sibling-down zur Helfer-Klasse 33211 (einzige Bauhandwerks-Domain mit Anf-1-Sibling)
  "47-3015.00": { kldbCode: "32101", kldbName: "Berufe im Hochbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Helpers-Pipelayers/Plumbers: war 34212 SHK Anf 2 — Modify gegen agent's null (catalog-pivot — kein 34211 Anf-1-Sibling in SHK); 32101 generic Bauhelfer; coupled mit title.de "Gas- und Sanitärinstallateur" → "Helfer Sanitär- und Rohrinstallation"; KldB+Anf 2→1
  "47-3016.00": { kldbCode: "32101", kldbName: "Berufe im Hochbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Helpers-Roofers: war 32142 Dachdeckerei Anf 2 (Audit nur Anf-flag) — Modify-beyond-audit's-flag (catalog-pivot — kein 32141 Anf-1-Sibling in Dachdeckerei); 32101 generic Bauhelfer; KldB+Anf 2→1

  // Inspection
  "47-4011.00": { kldbCode: "31163", kldbName: "Bausachverständige und Baukontrolleure/-kontrolleurinnen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Construction and Building Inspectors: war 26102 Mechatronik (Drift) — Bausachverständige ist Exact-Klasse, Anf 3 für Meister/Techniker-Tier; KldB+Anf 2→3

  // Maintenance/Specialty
  "47-4021.00": { kldbCode: "26112", kldbName: "Berufe in der Mechatronik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Elevator and Escalator Mechanics: war 25132 Wartungstechnik (zu allgemein) — Aufzugmonteure sind Mechatroniker-Spezialisten
  "47-4031.00": { kldbCode: "24412", kldbName: "Berufe im Metallbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Fence Erectors: war 32152 Fassadenbau (Drift via "-bau") — Zaunbau ist Metallbau (parallel zu 47-2211 Sheet Metal Workers in 24412); coupled mit title.de "Türenbauer" → "Zaunbauer/Zaunbauerin"
  "47-4041.00": { kldbCode: "42203", kldbName: "Berufe in der Umweltschutztechnik (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Hazardous Materials Removal Workers: war 22203 Farb-/Lacktechnik komplex Anf 3 (Drift) — Modify gegen agent's 34333 Abfallwirtschaft (zu eng auf Disposal); 42203 Umweltschutztechnik fängt Asbest-/Bodensanierung breiter und ist konsistent zu batch-10's 19-4042 + batch-12's 17-3025

  // Construction operators
  "47-4061.00": { kldbCode: "32232", kldbName: "Berufe im Gleisbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Rail-Track Laying and Maintenance Equipment Operators: war 31102 Bauplanung (Drift — Bauplanung ist planerisch, nicht ausführend) — 32232 Gleisbau ist Exact-Klasse (Slot frei nach 47-2151 Move zu Tiefbau)
  "47-4071.00": { kldbCode: "34312", kldbName: "Berufe in der Wasserversorgungs- und Abwassertechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Septic Tank Servicers/Sewer Pipe Cleaners: was seed 32201 Tiefbau Helfer Anf 1 (Reinigungstätigkeit ist Wasser-/Abwasser-Domain, nicht Tiefbau-Helfer); pulled out of seed; coupled mit title.de "Kanalbauer" → "Kanal- und Rohrreiniger/Kanal- und Rohrreinigerin"; KldB+Anf 1→2

  // Pflasterer
  "47-4091.00": { kldbCode: "32212", kldbName: "Pflasterer/Pflasterinnen und Steinsetzer/innen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Segmental Pavers (Pflasterer): war 32222 Straßen-/Asphaltbau — 32212 Pflasterer/Steinsetzer ist Exact-Klasse (Slot frei nach 47-3011 Pull-out)

  // Oil / Gas / Mining — 21112 Berg-/Tagebau-Cluster
  "47-5011.00": { kldbCode: "21112", kldbName: "Berufe im Berg- und Tagebau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Derrick Operators (Oil and Gas): was seed 94512 Veranstaltungstechnik (Drift via "Bühne"; SOC ist Erdöl-/Erdgasbohranlage); pulled out of seed; coupled mit title.de "Bühnenmann" → "Bohranlagenoperator/Bohranlagenoperatorin"
  "47-5012.00": { kldbCode: "21112", kldbName: "Berufe im Berg- und Tagebau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Rotary Drill Operators (Oil and Gas): war 32242 Brunnenbau (Drift — Brunnenbau ist Wasser, nicht Öl/Gas) — 21112 Berg-/Tagebau-Cluster
  "47-5013.00": { kldbCode: "21112", kldbName: "Berufe im Berg- und Tagebau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Service Unit Operators (Oil/Gas/Mining): war 41312 Chemie-/Pharmatechnik (Drift) — 21112 Berg-/Tagebau-Cluster
  "47-5044.00": { kldbCode: "21112", kldbName: "Berufe im Berg- und Tagebau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Underground Mining Loading Machine Operators: was seed 32222 Straßen-/Asphaltbau (Drift); pulled out of seed; 21112 Berg-/Tagebau-Cluster

  // Roustabouts — Helfer-Tier des Bohranlagen-Clusters
  "47-5071.00": { kldbCode: "21111", kldbName: "Berufe im Berg- und Tagebau - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Roustabouts (Oil and Gas): war 32242 Brunnenbau Anf 2 (Drift via "Deck"=Schiff); Modify-beyond-audit's-flag (Audit nur Title-flag) — Helfer-Tier 21111 parallel zu 47-5081 Helpers-Mining; coupled mit title.de "Deckarbeiter" → "Bohranlagenhelfer/Bohranlagenhelferin" (Helfer-Pendant zu 47-5011 Bohranlagenoperator); KldB+Anf 2→1
  // === Audit batch 13 — SOC 39 Personal Care and Service (2026-04-25) ===
  // Plan-table walked all 14 SOC 39 findings. 12 KldB-changing entries below
  // (5 Apply, 5 seed pull-outs, 2 Modify reconciliations against agent's
  // catalog-misses); 2 entries are title-only with no KldB change
  // (39-4021 Funeral Attendants — title only; 39-7011 Tour Guides — title
  // only, seed kept as-is). Catalog-only-Anf-Pattern at zwei Stellen:
  // (1) 39-1013 Spielbetriebsleiter — 94342 Glücksspiel hat keinen Anf-3-
  // sibling, sibling-domain-pivot zu 71393 generic Aufsichtskräfte (parallel
  // zu Casino Manager 11-9071 → 71394 aus batch-11, eine Tier-Stufe runter
  // für First-Line-Supervisor); (2) 39-9031 Exercise Trainers — KldB hat
  // keine Anf-2-Klasse für Trainer/Sportlehrer (nur Sport-/Fitnesskaufleute
  // 63122 ist Anf 2, aber kaufmännisch); 84553 Trainer Fitness/Gymnastik
  // catalog-only Anf 3 akzeptiert. Modify gegen agent: 39-9031 → 84553
  // statt agent's 84503 Sportlehrer ohne-Spez. (84553 trifft "Fitness und
  // Gymnastik" wörtlich); 39-3031 Ushers → 53111 statt agent's 53112
  // (agent flag Anf-down 2→1 erfordert Anf-1-sibling 53111). Modify-beyond-
  // audit's-flag bei 39-9032 Recreation Workers — Audit nur title-Flag,
  // aber 84553 (current) wird durch 39-9031 belegt + ist für Recreation
  // zu eng; 83123 Sozialpädagogik (Freizeitpädagoge) parallel zu 39-9041
  // Residential Advisors. Sibling-Anf-Pattern aktiv: 39-3031 62112→53111
  // mit Anf 2→1; 39-5093 82312→82311 mit Anf 2→1; 39-9031 63122→84553
  // mit Anf 2→3.

  // First-Line Supervisors — generic Aufsichtskraft-Pivot
  "39-1013.00": { kldbCode: "71393", kldbName: "Aufsichtskräfte - Unternehmensorganisation und -strategie", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Gambling Services Workers: war 94342 Glücksspiel Anf 2 (catalog-only — kein Anf-3-sibling in 9434x) — sibling-domain-pivot zu 71393 generic Aufsichtskräfte, parallel zu 11-9071 Casino Manager → 71394 (eine Tier-Stufe höher) aus batch-11; KldB+Anf 2→3
  "39-1014.00": { kldbCode: "71393", kldbName: "Aufsichtskräfte - Unternehmensorganisation und -strategie", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Entertainment & Recreation Workers: was seed 63122 Sport-/Fitnesskaufleute Anf 2 (Drift) — kein 63193 Aufsichtskraft-Tourismus/Sport in KldB; sibling-domain-pivot zu 71393 parallel zu #39-1013, konsistent zu 11-9072 Recreation Mgmt 63194 (Director-Tier) eine Stufe höher; pulled out of seed; KldB+Anf 2→3; coupled mit title.de "Leiter Gastronomie und Freizeit" → "Teamleiter Freizeit und Unterhaltung"

  // Animal — Drift correction
  "39-2011.00": { kldbCode: "11582", kldbName: "Berufe in der Tierpflege (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Animal Trainers: war 11502 Tierpflege ohne-Spez. (zu generisch — Trainer ≠ reine Pflege); 11582 sonstige Tätigkeitsangabe trifft Trainings-Aspekt
  "39-2021.00": { kldbCode: "11522", kldbName: "Berufe in der Haus- und Zootierpflege - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Animal Caretakers: war 11502 Tierpflege ohne-Spez. (zu generisch) — 11522 Haus-/Zootierpflege trifft Tierheim/Zoo-Domain; coupled mit title.de "Tiersitter" → "Tierpfleger/Tierpflegerin"

  // Entertainment/Theater — Drift corrections + sibling-tier
  "39-3021.00": { kldbCode: "94532", kldbName: "Berufe in der Bild- und Tontechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Motion Picture Projectionists: war 51182 Eisenbahn-/Luft-/Schiffstechnik (Drift via "-betrieb-") — Filmvorführer ist Medien-/Veranstaltungstechnik
  "39-3031.00": { kldbCode: "53111", kldbName: "Berufe im Objekt-, Werte- und Personenschutz - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Ushers/Lobby Attendants/Ticket Takers: was seed 62112 Kassierer/Kartenverkäufer Anf 2 (Drift — Einlasskontrolle ≠ Kassieren) — Modify gegen agent's 53112 Anf 2 (agent flagte Anf-down 2→1, also Anf-1-sibling 53111 ist konsistent); pulled out of seed; coupled mit title.de "Einlasskontrolle und Saaldienst" → "Platzanweiser/Platzanweiserin"; KldB+Anf 2→1
  "39-3092.00": { kldbCode: "94612", kldbName: "Berufe in der Bühnen- und Kostümbildnerei - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Costume Attendants: was seed 82332 Tätowierer/Piercer Anf 2 (komplett falsche Domain) — 94612 Bühnen-/Kostümbildnerei ist Exact-Klasse; pulled out of seed (title "Ankleider" bleibt, agent flagte nicht)

  // Hair/Beauty — Drift corrections + sibling-tier
  "39-5012.00": { kldbCode: "82312", kldbName: "Berufe im Friseurgewerbe - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Hairdressers/Hairstylists/Cosmetologists: war 28222 Bekleidungs-/Hutherstellung (Drift — "Perückenmacher" als wörtliche Lesart) — 82312 Friseurgewerbe ist Exact-Klasse; coupled mit title.de "Perückenmacher" → "Friseur/Friseurin" (39-5011 Barbers behält "Herrenfriseur" zur Differenzierung)
  "39-5093.00": { kldbCode: "82311", kldbName: "Berufe im Friseurgewerbe - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Shampooers: war 82312 fachlich Anf 2 — Haarewaschen ist Anlerntätigkeit (kein Apprenticeship-Tier); sibling-down 82312 → 82311 mit Anf 2→1

  // Hotel — Drift correction
  "39-6011.00": { kldbCode: "63222", kldbName: "Berufe im Hotelservice - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Baggage Porters and Bellhops: war 51122 tech. Luftverkehrsbetrieb (Drift — Hotelportier ≠ Airport-Bagagedienst) — 63222 Hotelservice ist Exact-Klasse

  // Sport/Recreation — catalog-only-Anf + Modify-beyond-audit
  "39-9031.00": { kldbCode: "84553", kldbName: "Trainer/innen - Fitness und Gymnastik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Exercise Trainers and Group Fitness Instructors: was seed 63122 Sport-/Fitnesskaufleute Anf 2 (Drift — Trainer ≠ Kaufmann); Modify gegen agent's 84503 Sportlehrer ohne-Spez. — 84553 trifft "Fitness und Gymnastik" wörtlich; KldB hat keine Anf-2-Klasse für Trainer (alle Trainer-/Sportlehrer-Klassen catalog-only Anf 3); pulled out of seed; KldB+Anf 2→3
  "39-9032.00": { kldbCode: "83123", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Recreation Workers: was seed 84553 Trainer Fitness/Gymnastik (zu eng nach Fitness — Recreation Workers organisieren breites Freizeitspektrum) und durch 39-9031 belegt; Modify-beyond-audit's-flag (Audit nur title-flag) — 83123 Sozialpädagogik fängt Freizeitpädagogen, parallel zu 39-9041 Residential Advisors; pulled out of seed; coupled mit title.de "Trainer für Outdoor-Aktivitäten" → "Freizeitpädagoge/Freizeitpädagogin"

  // === Audit batch 16 — SOC 53 Transportation and Material Moving (2026-05-04) ===
  // Plan-table walked all 34 SOC 53 findings. 29 KldB-changing entries below
  // (16 Apply, 12 seed pull-outs, 1 sibling-up); 4 entries are title-only with
  // no KldB change (53-3051 Bus Drivers School, 53-4013 Rail Yard Engineers,
  // 53-5022 Motorboat Operators, 53-7081 Refuse Collectors); 1 explicit Reject
  // (53-4041 Subway/Streetcar Operators — Straßenbahnfahrer-Lesart in 52132
  // konsistent; agent's 51112 tech Eisenbahn trifft Operator-Tätigkeit nicht,
  // 51112 ist Signalmen/Dispatcher).
  // Heaviest pattern: Driver-Domain-Pivots (PKW ↔ LKW ↔ Bus/Straßenbahn ↔
  // Fahrzeugführer-sonstige) — 4 Codes wandern zwischen 52112/52122/52132/
  // 52182 je nach SOC-Lesart (Light Truck/Sales = LKW, Shuttle/Chauffeur =
  // PKW, Parking = Fahrzeugführer-sonstige). Zweites Cluster: Hebezeug-
  // Korrektur — 51242 Wasserstraßen-/Brückenwärter ist Drift via "-führer";
  // Crane/Hoist-Operators gehören in 52532 Kranführer (2 Codes).
  // Drittes Cluster: Aufsichtskraft-Tier-Anhebung (51393 Lager/Güterumschlag
  // Anf 3, 52593 Bau-/Transportgeräteführung Anf 3, 51493 Personenverkehr
  // Servicebereich Anf 3) für 4 First-Line-Supervisor-SOCs aus falschen
  // Anf-2-fachlich oder Bauplanung-Klassen. Catalog-only-Anf-Pattern bei
  // 53-2021 Air Traffic Controllers — Catalog HAT 51534 Anf 4 (DFS-
  // Ausbildung ist bachelor-grade), sibling-up 51533 → 51534.
  // Modifies gegen agent: 53-1041 Aircraft Cargo Handling Supervisors
  // (agent's 51332 Anf 2 fachlich → 51393 Anf 3 Aufsichtskraft — First-
  // Line Supervisor braucht Aufsichtskraft-Tier); 53-4041 Subway/Streetcar
  // (Reject — siehe oben); 53-5022 Motorboat Operators (agent's null
  // suggestion → keep 52422 Schiffsführer Binnen, KldB ist akzeptabel,
  // nur Title-Fix von "Seelotse" → "Motorbootführer"); 53-1044 Purser
  // (Anf-Konsens 3 — agent flagte Anf nur medium, aber Klasse 51493
  // expliziter Aufsichtskraft-Tier).
  // Coupled title cascades: 53-1042 → "Vorarbeiter Lager und Logistik";
  // 53-1043 → "Aufsichtskraft Bau- und Transportgeräteführung"; 53-3051
  // in-place → "Schulbusfahrer"; 53-3053 in-place → "Chauffeur";
  // 53-4013 → "Lokrangierführer"; 53-5021 → "Kapitän"; 53-5022 →
  // "Motorbootführer"; 53-6051.01 → "Luftfahrtprüfer" (war "Flugverkehrs-
  // kontrolleur" = Fluglotse, falsch); 53-7041 → "Kranführer"; 53-7051 →
  // "Gabelstaplerfahrer"; 53-7062.04 → "Recyclingfachkraft" (ungendert,
  // DE-Konvention); 53-7081 → "Müllwerker".

  // First-Line Supervisors — Aufsichtskraft-Tier-Anhebung
  "53-1041.00": { kldbCode: "51393", kldbName: "Aufsichtskräfte - Lagerwirtschaft, Post und Zustellung, Güterumschlag", anforderungsniveau: 3, trainingCategory: "specialist" }, // Aircraft Cargo Handling Supervisors: war 51532 Überwachung Luftverkehrsbetrieb fachlich Anf 2 (zu niedriger Tier — First-Line Supervisor); Modify gegen agent's 51332 Güterumschlag Anf 2 fachlich (Supervisor braucht Aufsichtskraft-Tier); 51393 fängt Cargo-Handling-Aspekt = Güterumschlag-Domain; KldB+Anf 2→3
  "53-1042.00": { kldbCode: "51393", kldbName: "Aufsichtskräfte - Lagerwirtschaft, Post und Zustellung, Güterumschlag", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Helpers/Laborers/Material Movers: war 31193 Bauplanung-Aufsicht (Stem-Tiebreaker via "Aufsichtskraft" — falsche Domain); 51393 Aufsichtskräfte Lager/Güterumschlag ist Domain-Exact; coupled mit title.de "Aufsichtskraft Abrissarbeiten" → "Vorarbeiter Lager und Logistik / Vorarbeiterin Lager und Logistik"
  "53-1042.01": { kldbCode: "34333", kldbName: "Berufe in der Abfallwirtschaft - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Recycling Coordinators: war 11724 Natur-/Landschaftspflege hoch Anf 4 studies (komplette Domain-Verwechslung); 34333 Abfallwirtschaft komplex ist Domain-Exact; KldB+Anf 4→3 + trainingCategory studies→specialist
  "53-1043.00": { kldbCode: "52593", kldbName: "Aufsichtskräfte - Bau- und Transportgeräteführung", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Material-Moving Machine/Vehicle Operators: war 31193 Bauplanung-Aufsicht (Stem-Tiebreaker); 52593 Aufsichtskräfte Bau-/Transportgeräteführung ist Domain-Exact für Kran-/Fahrzeugführer-Aufsicht; coupled mit title.de "Aufsichtskraft Kranarbeiten" → "Aufsichtskraft Bau- und Transportgeräteführung / …in"
  "53-1044.00": { kldbCode: "51493", kldbName: "Aufsichtskräfte - Personenverkehr (Servicebereich)", anforderungsniveau: 3, trainingCategory: "specialist" }, // First-Line Supervisors of Passenger Attendants (Purser): pulled out of seed (was 51422 Service Luftverkehr fachlich Anf 2); 51493 Aufsichtskräfte Personenverkehr Servicebereich Anf 3 ist Domain-Exact für Kabinenchef/Purser; KldB+Anf 2→3

  // Air Traffic Control — sibling-up bei catalog-vorhandenem Anf-4-Sibling
  "53-2021.00": { kldbCode: "51534", kldbName: "Berufe in der Überwachung und Steuerung des Luftverkehrsbetriebs - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Air Traffic Controllers: war 51533 Überwachung Luftverkehrsbetrieb komplex Anf 3 specialist — DFS-Ausbildung ist mehrjährig + bachelor-grade; sibling-up 51533 → 51534; KldB+Anf 3→4 + trainingCategory specialist→studies

  // Driver-Domain-Pivots (PKW ↔ LKW ↔ Bus ↔ Fahrzeugführer-sonstige)
  "53-3031.00": { kldbCode: "52122", kldbName: "Berufskraftfahrer/innen (Güterverkehr/LKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Driver/Sales Workers: pulled out of seed (was 52112 PKW); SOC ist Lieferung+Verkauf via Fahrzeug = Gütertransport
  "53-3033.00": { kldbCode: "52122", kldbName: "Berufskraftfahrer/innen (Güterverkehr/LKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Light Truck Drivers: pulled out of seed (was 52112 PKW); Light Truck/Van fährt Waren aus = Gütertransport
  "53-3053.00": { kldbCode: "52112", kldbName: "Berufskraftfahrer/innen (Personentransport/PKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Shuttle Drivers and Chauffeurs: pulled out of seed (was 52132 Bus/Straßenbahn); Chauffeur fährt PKW/Kleinbus, kein Linienbus; coupled mit title.de "Shuttle- und Chauffeurfahrer" → "Chauffeur/Chauffeurin"

  // Eisenbahn — Drift correction
  "53-4022.00": { kldbCode: "51112", kldbName: "Berufe im technischen Eisenbahnbetrieb - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Railroad Brake/Signal/Switch Operators: pulled out of seed (was 51632 Verkehrskaufleute — kaufmännisch); SOC ist tech Bedienung Signalanlagen + Waggon-Kuppeln im Rangierbetrieb
  "53-4031.00": { kldbCode: "51112", kldbName: "Berufe im technischen Eisenbahnbetrieb - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Railroad Conductors and Yardmasters: war 51412 Service Straße/Schiene fachlich Anf 2 (Service-Tier); SOC ist primär Yardmaster (Coordinator switch-engine crew) + Conductor secondary, gehört in tech Eisenbahnbetrieb

  // Schifffahrt — Drift correction + sibling-up bei Captains
  "53-5011.00": { kldbCode: "51432", kldbName: "Servicefachkräfte im Schiffsverkehr - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sailors and Marine Oilers: pulled out of seed (was 52422 Schiffsführer Binnen — Schiffsführer ist Kapitänsrolle); SOC Decksmannschaft/Wartungsschmierer = Service-Tier 51432
  "53-5021.00": { kldbCode: "52413", kldbName: "Nautische Schiffsoffiziere/-offizierinnen und Kapitäne/Kapitäninnen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Captains/Mates/Pilots of Water Vessels: war 11402 Fischwirtschaft fachlich Anf 2 (Drift via "Küstenfischerei"-Title); SOC umfasst alle Wasserfahrzeuge (Schlepper/Fähren/etc.); coupled mit title.de "Kapitän Küstenfischerei" → "Kapitän/Kapitänin"; KldB+Anf 2→3

  // Fahrzeug-Service / Parking
  "53-6021.00": { kldbCode: "52182", kldbName: "Fahrzeugführer/innen im Straßenverkehr (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Parking Attendants: pulled out of seed (was 52112 PKW-Berufskraftfahrer); Parking Attendants parken Autos, fahren keine Kunden — 52182 Fahrzeugführer-sonstige fängt Park-/Service-Lesart
  "53-6031.00": { kldbCode: "25201", kldbName: "Berufe in der Fahrzeugtechnik (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Automotive and Watercraft Service Attendants: war 25212 Kfz-Tech fachlich Anf 2 (zu hoch — Tankwart/Schmiertätigkeit ist Anlerntier); 25201 Kfz-Tech Helfer ist Domain-Exact; KldB+Anf 2→1 + trainingCategory apprenticeship→none
  "53-6032.00": { kldbCode: "51122", kldbName: "Berufe im technischen Luftverkehrsbetrieb - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Aircraft Service Attendants: pulled out of seed (was 52122 LKW); Bodenabfertigung Luftverkehr — betanken/de-icen/wartet Flugzeuge am Boden, kein LKW

  // Verkehrs-Inspektoren — Drift corrections
  "53-6011.00": { kldbCode: "51243", kldbName: "Wasserstraßen- und Brückenwärter/innen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Bridge and Lock Tenders: war 51293 Aufsichtskräfte Verkehrsinfra Anf 3 (zu generisch); 51243 ist die spezifische Klasse für Brücken-/Schleusenwärter (Anf bleibt 3, Klassen-Spezifizierung)
  "53-6051.00": { kldbCode: "51503", kldbName: "Berufe in der Überwachung und Steuerung des Verkehrsbetriebs (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Transportation Inspectors: war 23123 Papierverarbeitung 😱 (Stem-Tiebreaker via "Verpackung"=Cargo); 51503 Überwachung Verkehrsbetrieb ohne-Spez. fängt Inspektor-Domain breit
  "53-6051.01": { kldbCode: "25233", kldbName: "Berufe in der Luft- und Raumfahrttechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Aviation Inspectors: war 51533 Überwachung Luftverkehrsbetrieb komplex (= Fluglotse-Klasse, falsch — Aviation Inspector prüft Flugzeuge/Wartung, kein Luftraumkontrolleur); coupled mit title.de "Flugverkehrskontrolleur" (= Fluglotse, falsch) → "Luftfahrtprüfer/Luftfahrtprüferin"; 25233 Luft-/Raumfahrttechnik komplex ist Tech-Inspektor-Domain

  // Hebezeug & Bagger — 51242 Brückenwärter ist Drift, korrekte Klasse 52532 Kranführer
  "53-7021.00": { kldbCode: "52532", kldbName: "Kranführer/innen, Aufzugsmaschinisten und Bediener/innen verwandter Hebeeinrichtungen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Crane and Tower Operators: pulled out of seed (was 51242 Brückenwärter — Drift); 52532 Kranführer ist Exact-Klasse
  "53-7031.00": { kldbCode: "32262", kldbName: "Berufe im Kultur- und Wasserbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Dredge Operators: war 32222 Straßen-/Asphaltbau (Drift) — Schwimmbagger im Wasser ist Wasser-/Tiefbau-Domain (32262 Kultur-/Wasserbau)
  "53-7041.00": { kldbCode: "52532", kldbName: "Kranführer/innen, Aufzugsmaschinisten und Bediener/innen verwandter Hebeeinrichtungen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Hoist and Winch Operators: pulled out of seed (was 51242 Brückenwärter — Drift); 52532 Kranführer/Hebezeugbediener ist Exact-Klasse für Hoist/Winch; coupled mit title.de "Verladebrückenführer" → "Kranführer/Kranführerin"
  "53-7051.00": { kldbCode: "51312", kldbName: "Berufe in der Lagerwirtschaft - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Industrial Truck and Tractor Operators (Forklift): pulled out of seed (was 52122 LKW — Gabelstapler fahren in Lagerhallen, kein LKW-Güterverkehr); 51312 Lagerwirtschaft fachlich ist Domain-Exact; coupled mit title.de "Umzugsfahrer" → "Gabelstaplerfahrer/Gabelstaplerfahrerin"

  // Lager / Recycling / Helfer
  "53-7062.00": { kldbCode: "51311", kldbName: "Berufe in der Lagerwirtschaft - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Laborers and Freight/Stock/Material Movers: war 51122 tech Luftverkehrsbetrieb 😱 fachlich Anf 2 (komplette Sektor-Verwechslung); 51311 Lagerwirtschaft Helfer ist Domain-Exact für manuelle Materialträger ohne Ausbildung; KldB+Anf 2→1 + trainingCategory apprenticeship→none
  "53-7062.04": { kldbCode: "34332", kldbName: "Berufe in der Abfallwirtschaft - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Recycling and Reclamation Workers: war 24412 Metallbau (Drift via "Metallarbeiter"-Title); 34332 Abfallwirtschaft fachlich ist Recycling-Domain-Exact; coupled mit title.de "Metallarbeiter im Bereich Demontage" → "Recyclingfachkraft" (ungendert, DE-Konvention für "-fachkraft")
  "53-7065.00": { kldbCode: "51311", kldbName: "Berufe in der Lagerwirtschaft - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Stockers and Order Fillers: pulled out of seed (was 51312 Lagerwirtschaft fachlich Anf 2); SOC ist Anlerntätigkeit (Regale befüllen + Bestellungen kommissionieren), kein Ausbildungsberuf; sibling-down 51312 → 51311; KldB+Anf 2→1 + trainingCategory apprenticeship→none

  // Pumpen & Verladung — Drift corrections
  "53-7072.00": { kldbCode: "34322", kldbName: "Berufe im Rohrleitungsbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Pump Operators (Except Wellhead): war 32242 Brunnenbau (Drift — Brunnenbau ist Wasser-/Hochbau, nicht Pumpenbedienung); 34322 Rohrleitungsbau fängt Pumpen-Domain (Pump Operators bedienen Pumpen für Flüssigkeits-/Gas-Förderung)
  "53-7073.00": { kldbCode: "21112", kldbName: "Berufe im Berg- und Tagebau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Wellhead Pumpers: war 41343 Erdölraffinerie komplex Anf 3 (zu spät im Prozess — Wellhead ist Bohrloch, nicht Raffinerie); 21112 Berg-/Tagebau-Cluster (parallel zu batch-14 47-5011/12/13/44 Oil/Gas/Mining); KldB+Anf 3→2 + trainingCategory specialist→apprenticeship
  "53-7121.00": { kldbCode: "51332", kldbName: "Berufe im Güter- und Warenumschlag - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Tank Car/Truck/Ship Loaders: war 41343 Erdölraffinerie komplex Anf 3 (Drift via Erdöl-Lesart); SOC verlädt Schüttgut+Chemikalien = Güter-/Warenumschlag, kein Raffinerieanlagen-Steuerer; KldB+Anf 3→2 + trainingCategory specialist→apprenticeship

  // === Audit batch 15 — SOC 29 Healthcare Practitioners and Technical (2026-05-04) ===
  // Plan-table walked all 43 SOC 29 findings. 39 KldB-changing entries below
  // (28 Apply, 6 seed pull-outs incl. 29-1031/29-2011.02/29-2036/29-2055/
  // 29-9092/29-9093, 6 Modify reconciliations); 1 explicit Reject
  // (29-1071 Physician Assistants — KldB hat keinen Anf-4-Sibling in 8110x
  // Med-FA-Branch und Pivot zu Ärzte-Klassen würde PA als Arzt überzeichnen);
  // 2 entries are title-only with no KldB change (29-1131 Veterinarians,
  // 29-9021 Health Information Technologists). Heaviest pattern: Ergotherapie-
  // Cluster-Drift (81722/3/4) — 7 Codes wandern in real Domain (Diät 81762/4,
  // Heilkunde 81753, Podologie 81772, Funktionsdiagnostik 81222, Radiologie
  // 81232, Physio 81712/3). Zweites Cluster-Pattern: 5 Facharzt-Domain-
  // Korrekturen aus 81414 Kinder/81814 Pharma/81784 nicht-ärztl./82524
  // Augenoptik/11394 Pferdewirtschaft (alle Stem-Tiebreaker-Drifts) zu
  // korrektem Facharzt-Code (81424 Innere, 81444 Hautkrankh./Sinnesorg.,
  // 81484 Ärzte sonstige, 81404 Ärzte ohne-Spez.). Biologie-Cluster (41203/
  // 41204) → 4 Codes wandern zu 81213 Medtech Labor (parallel zu batch-10
  // Pattern). Pflege-Cluster: 81393 Aufsichtskräfte/81103 Med-FA/83122
  // Sozialarbeit/83142 Haus-Familienpflege drift → 81302 Pflege ohne-Spez.
  // (Anf 2) für Pflegefachkräfte/-helfer und 81313 Fachkrankenpflege (Anf 3)
  // für Fachpfleger. OP-Cluster: 81102 Med-FA → 81332 OP-/medtech Assistenz
  // (parallel-Codes 29-2055 OTA + 29-9093 OP-Assistent).
  // Modifies gegen agent: 29-1122.01 Low Vision Therapists (agent's 81783
  // Anf 3 → 81784 Anf 4 — Hochschul-Qualifikation in DE, gleiche Domain
  // höherer Tier); 29-1141.02 Adv. Practice Psychiatric Nurses (agent's
  // 81634 nicht-ärztl. Psychotherapie → 81313 Fachkrankenpflege Anf 3 +
  // title-coupled "Fachkrankenpfleger Psychiatrie" — APRN sind in DE-
  // Lesart Fachpfleger, keine Psychotherapeuten); 29-2055 Surgical
  // Technologists (agent's 81103 Anf 3 → 81332 Anf 2 — OTA ist 3-jährige
  // Ausbildung in OP-/medtech Assistenz-Domain, NICHT Med-FA-Niveau;
  // KldB-Konvention Anf 2 für Berufsausbildung); 29-2099.01 Neurodiagnostik
  // (agent's 81212 Labor → 81222 Funktionsdiagnostik — EEG/Neurophysiologie
  // ist Funktionsdiagnostik in DE, nicht Labor); 29-2099.05 Ophthalmic
  // Medical Technologists (agent gibt null suggestion → 81182 Med-FA
  // sonstige Anf 2 — Augenarzthelfer-Domain, weil Orthoptisten 81132 eine
  // andere Profession sind); 29-1031 Dietitians (Pull-out seed 41204
  // Biologie → 81764 Diät-/Ernährungstherapie hoch komplex Anf 4).
  // Title-Konsistenz: 3 title-awkward-Flags rejected (29-2032 MTA Sonografie,
  // 29-2099.01 MTA Neurodiagnostik, 29-1124 MTRA Strahlentherapie) — sister
  // codes 29-2034/29-2035 nutzen bewusst kompakte "MTA <X>"-Form.
  // Coupled title cascades: 29-1126 → "Atmungstherapeut"; 29-1131 →
  // "Tierarzt"; 29-1141.02 → "Fachkrankenpfleger Psychiatrie"; 29-1161 →
  // "Hebamme/Entbindungspfleger"; 29-1216 → "Internist"; 29-1229.04 →
  // "Facharzt für Physikalische und Rehabilitative Medizin"; 29-2053 →
  // "Psychiatriepfleger"; 29-2061 → "Krankenpflegehelfer" (etablierter
  // als "Krankenpflegeassistent"); 29-2099.05 → "MTA Ophthalmologie";
  // 29-9021 → "Medizinischer Dokumentationsassistent".

  // Fachärzte — Domain-Korrekturen (Stem-Tiebreaker-Drifts in 81414/81814/81784/82524/11394)
  "29-1212.00": { kldbCode: "81424", kldbName: "Fachärzte/-ärztinnen in der Inneren Medizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Cardiologists: war 81414 Kinder-/Jugendmedizin (Stem-Drift) — Kardiologie ist Innere-Medizin-Subdomain
  "29-1213.00": { kldbCode: "81444", kldbName: "Fachärzte/-ärztinnen in den Bereichen Hautkrankheiten, Sinnes- und Geschlechtsorgane - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Dermatologists: war 81414 Kinder-/Jugendmedizin (Stem-Drift) — Dermatologie ist Hautkrankh.-Subdomain
  "29-1216.00": { kldbCode: "81424", kldbName: "Fachärzte/-ärztinnen in der Inneren Medizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // General Internal Medicine Physicians: war 81814 Pharmakologie (Drift) — General Internist ist exakt Innere Medizin; coupled mit title.de "Physiologe/Physiologin" → "Internist/Internistin"
  "29-1224.00": { kldbCode: "81484", kldbName: "Ärzte/Ärztinnen (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Radiologists: war 81784 nicht-ärztl. Therapie sonstige (Drift — Radiologen sind Fachärzte, keine Therapeuten); KldB hat keine 8146x-Sibling für Radiologie, daher 81484 Ärzte sonstige
  "29-1229.04": { kldbCode: "81484", kldbName: "Ärzte/Ärztinnen (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Physical Medicine and Rehabilitation Physicians: war 81714 Physiotherapie hoch (komplette Domain-Verwechslung Arzt vs. Therapeut); coupled mit title.de "Fachphysiotherapeut" → "Facharzt für Physikalische und Rehabilitative Medizin / Fachärztin..."
  "29-1229.06": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Sports Medicine Physicians: war 11394 Führungskräfte Pferdewirtschaft (😱 Stem-Tiebreaker via "Sport"=Pferdesport) — Sportmedizin ist Zusatz-Weiterbildung über jeder Facharzt-Spez., 81404 Ärzte ohne-Spez. ist beste pauschale Domain
  "29-1241.00": { kldbCode: "81444", kldbName: "Fachärzte/-ärztinnen in den Bereichen Hautkrankheiten, Sinnes- und Geschlechtsorgane - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Ophthalmologists Except Pediatric: war 82524 Berufe in der Augenoptik (😱 Augenoptiker ist Handwerk, nicht Arzt) — Ophthalmologie fällt unter Sinnesorgane

  // Zahnmedizin — Domain-Korrekturen (82513 Orthopädie/Reha-Technik ist Techniker-Klasse, nicht Arzt)
  "29-1023.00": { kldbCode: "81474", kldbName: "Zahnärzte/-ärztinnen und Kieferorthopäden/-orthopädinnen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Orthodontists: war 82513 Orthopädie-/Rehatechnik komplex Anf 3 (Drift via "Orthopädie") — Kieferorthopäden sind Fachzahnärzte; KldB+Anf 3→4
  "29-1024.00": { kldbCode: "81474", kldbName: "Zahnärzte/-ärztinnen und Kieferorthopäden/-orthopädinnen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Prosthodontists: war 82513 Orthopädie-/Rehatechnik komplex Anf 3 (analoger Drift) — Prosthodontists sind Fachzahnärzte; KldB+Anf 3→4

  // Pflege/Geburtshilfe/Psychiatrie — 81302 Anf 2 für Pflegefachkräfte und -helfer, 81313 Anf 3 für Fachpfleger
  "29-1141.00": { kldbCode: "81302", kldbName: "Berufe in der Gesundheits- und Krankenpflege (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Registered Nurses: war 81393 Aufsichtskräfte (Drift via "examined" / Tier-Falsch — RNs sind Pflegefachkräfte, keine Aufsicht); KldB+Anf 3→2 (Berufsausbildung)
  "29-1141.02": { kldbCode: "81313", kldbName: "Berufe in der Fachkrankenpflege - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Advanced Practice Psychiatric Nurses: war 81614 nicht-klin. Psychologie hoch (komplette Domain-Verwechslung); Modify gegen agent's 81634 nicht-ärztl. Psychotherapie — APRN sind in DE-Lesart Fachkrankenpfleger Psychiatrie, keine Psychotherapeuten; coupled mit title.de "Psychotherapeut" → "Fachkrankenpfleger Psychiatrie / Fachkrankenpflegerin Psychiatrie"; KldB+Anf 4→3
  "29-1151.00": { kldbCode: "81313", kldbName: "Berufe in der Fachkrankenpflege - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Nurse Anesthetists: war 81103 Med-FA komplex (Drift) — Fachkrankenpfleger Anästhesie ist Fachkrankenpflege-Klasse 81313
  "29-1161.00": { kldbCode: "81353", kldbName: "Berufe in der Geburtshilfe und Entbindungspflege - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Nurse Midwives: war 84214 Lehrkräfte berufsbildende hoch (😱 falsche Lesart "Midwives = Lehrer für Pflege"); 81353 Geburtshilfe ist Exact-Klasse; coupled mit title.de "Lehrkraft für Krankenpflege..." → "Hebamme/Entbindungspfleger"; KldB+Anf 4→3
  "29-2061.00": { kldbCode: "81302", kldbName: "Berufe in der Gesundheits- und Krankenpflege (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Licensed Practical and Licensed Vocational Nurses: war 83142 Haus-/Familienpflege (Drift — LPNs arbeiten in Kliniken); 81302 Pflege ohne-Spez. trifft Krankenpflegehelfer-Tier; coupled mit title.de "Krankenpflegeassistent" → "Krankenpflegehelfer/Krankenpflegehelferin" (etablierter als "Assistent")
  "29-2053.00": { kldbCode: "81302", kldbName: "Berufe in der Gesundheits- und Krankenpflege (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Psychiatric Technicians: war 83122 Sozialarbeit (Drift) — Psychiatric Technicians arbeiten unter ärztlicher Anweisung in Kliniken, nicht Sozialarbeit; coupled mit title.de "Sozialbetreuer psychische Gesundheit" → "Psychiatriepfleger/Psychiatriepflegerin"

  // Therapeuten/Diät/Heilkunde — Ergotherapie-Cluster-Drift (81722/3/4) zur real Domain
  "29-1011.00": { kldbCode: "81753", kldbName: "Berufe in der Heilkunde und Homöopathie - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Chiropractors: war 81724 Ergotherapie hoch Anf 4 (Drift); Chiropraktik in DE ist Heilpraktiker-Domain (oder ärztl. Zusatzweiterbildung); 81753 Heilkunde/Homöopathie passt; KldB+Anf 4→3
  "29-1031.00": { kldbCode: "81764", kldbName: "Berufe in der Diät- und Ernährungstherapie - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Dietitians and Nutritionists: pulled out of seed (was 41204 Biologie ohne-Spez. "Futtermittelwissenschaftler" — Domain-falsch); 81764 Diät-/Ernährungstherapie hoch ist Exact-Klasse für RD-Studienberuf (Oecotrophologe)
  "29-1081.00": { kldbCode: "81772", kldbName: "Podologen/Podologinnen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Podiatrists: war 81724 Ergotherapie hoch Anf 4 studies (Drift) — Podologie hat eigene KldB-Klasse 81772 (nur Anf 2 — DE-Podologie ist 2-jährige Fachschulausbildung); KldB+Anf 4→2 + trainingCategory studies→apprenticeship
  "29-1122.01": { kldbCode: "81784", kldbName: "Berufe in der nicht ärztlichen Therapie und Heilkunde (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Low Vision/Vision Rehab Therapists: war 83124 Sozialarbeit hoch Anf 4 (Domain-Drift); Modify gegen agent's 81783 Anf 3 — Reha-Lehrer für Sehbehinderte ist Hochschulausbildung (Marburg/Würzburg) Bachelor-Tier, daher Anf 4; gleiche Domain-Pivot, höherer Tier behalten
  "29-1123.00": { kldbCode: "81712", kldbName: "Berufe in der Physiotherapie - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Physical Therapists: war 81714 Physio hoch Anf 4 studies — Physiotherapie in DE ist 3-jährige Berufsausbildung (Anf 2), kein Studium; sibling-down 81714 → 81712; KldB+Anf 4→2 + trainingCategory studies→apprenticeship
  "29-1126.00": { kldbCode: "81783", kldbName: "Berufe in der nicht ärztlichen Therapie und Heilkunde (sonstige spezifische Tätigkeitsangabe) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Respiratory Therapists: war 81782 fachlich Anf 2 — Atmungstherapeuten in DE haben Fachweiterbildung über Pflege-Niveau hinaus, daher Anf 3; sibling-up 81782 → 81783; coupled mit title.de "Atemtherapietechniker" → "Atmungstherapeut/Atmungstherapeutin"; KldB+Anf 2→3
  "29-1181.00": { kldbCode: "81784", kldbName: "Berufe in der nicht ärztlichen Therapie und Heilkunde (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Audiologists: war 81734 Sprachtherapie hoch (eng verwandt aber ungenau) — Audiologie ist eigene Profession (Hörgeräteanpassung + Diagnostik), 81784 nicht-ärztl. Therapie sonstige fängt breiter
  "29-1292.00": { kldbCode: "81113", kldbName: "Zahnmedizinische Fachangestellte - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Dental Hygienists: war 81112 ZFA fachlich Anf 2 — Dentalhygieniker/innen absolvieren Fachweiterbildung über ZFA hinaus; sibling-up 81112 → 81113; KldB+Anf 2→3
  "29-2051.00": { kldbCode: "81762", kldbName: "Berufe in der Diät- und Ernährungstherapie - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Dietetic Technicians: war 81722 Ergotherapie fachlich (Drift); Diätassistent ist 3-jährige Ausbildung in 81762 Diät-/Ernährungstherapie; differenziert von 29-1031 Ernährungsberater (81764 hoch komplex Anf 4)
  "29-9091.00": { kldbCode: "81713", kldbName: "Berufe in der Physiotherapie - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Athletic Trainers: war 81714 Physio hoch Anf 4 studies — Sportphysiotherapeut in DE ist Bachelor-Tier (komplexe Spez.), nicht Forschungs-/Master-Tier; sibling-down 81714 → 81713; KldB+Anf 4→3 + trainingCategory studies→specialist

  // Med-tech — Labor 81213/Funktionsdiagnostik 81222/Radiologie 81232/OP-Assistenz 81332/Med-FA sonstige 81182
  "29-1071.01": { kldbCode: "81333", kldbName: "Berufe in der operations-/medizintechnischen Assistenz - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Anesthesiologist Assistants: war 81623 klin. Psychologie 😱 (komplett falsche Domain) — ATA unterstützen bei Narkose im OP, gehören in OP-/medtech Assistenz
  "29-2011.00": { kldbCode: "81213", kldbName: "Medizinisch-technische Berufe im Laboratorium - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Medical and Clinical Lab. Technologists: war 41203 Biologie komplex (Drift) — MTA Labor gehört in 81213 Medtech Labor (parallel zu batch-10 19-1029.x Pattern)
  "29-2011.02": { kldbCode: "81213", kldbName: "Medizinisch-technische Berufe im Laboratorium - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Cytotechnologists: war 41204 Biologie ohne-Spez. hoch Anf 4 studies (Drift) — Zytologie-Assistenten sind MTAs, keine Biologen; KldB+Anf 4→3 + trainingCategory studies→specialist
  "29-2011.04": { kldbCode: "81213", kldbName: "Medizinisch-technische Berufe im Laboratorium - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Histotechnologists: war 41203 Biologie komplex (Drift) — Histologie-Assistenten bereiten Gewebeschnitte für Pathologie; medtech Labor-Domain
  "29-2031.00": { kldbCode: "81222", kldbName: "Medizinisch-technische Berufe in der Funktionsdiagnostik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Cardiovascular Technologists and Technicians: war 81232 Radiologie (Drift) — Herz-Kreislauf-Funktionsdiagnostik gehört zu 81222 Funktionsdiagnostik
  "29-2032.00": { kldbCode: "81222", kldbName: "Medizinisch-technische Berufe in der Funktionsdiagnostik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Diagnostic Medical Sonographers: war 81723 Ergotherapie komplex (Drift) — Sonografie ist Funktionsdiagnostik (parallel zu 29-2031 Cardiovascular); KldB+Anf 3→2 (Berufsausbildung); title-awkward agent-flag rejected (sister codes 29-2034/29-2035 nutzen "MTA <X>"-Konsistenz)
  "29-2033.00": { kldbCode: "81232", kldbName: "Medizinisch-technische Berufe in der Radiologie - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Nuclear Medicine Technologists: war 81723 Ergotherapie komplex (Drift) — Radioisotop-Verabreichung ist Radiologie-Domain (parallel zu MTRA); KldB+Anf 3→2
  "29-2036.00": { kldbCode: "81234", kldbName: "Medizinisch-technische Berufe in der Radiologie - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Medical Dosimetrists: war 81233 Radiologie komplex Anf 3 specialist — Medizinphysikexperte ist Master-Tier-Beruf; sibling-up 81233 → 81234; KldB+Anf 3→4 + trainingCategory specialist→studies
  "29-2055.00": { kldbCode: "81332", kldbName: "Berufe in der operations-/medizintechnischen Assistenz - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Surgical Technologists (OTA): war 81102 Med-FA fachlich (Drift — Med-FA sind Praxisassistenz, OTA arbeiten im OP); Modify gegen agent's 81103 Anf 3 — OTA-Ausbildung ist 3-jährige Berufsausbildung (KldB-Konvention Anf 2 für Berufsausbildung; Anf 3 wäre Meister/Techniker-Tier); 81332 OP-/medtech Assistenz fachlich ist Domain-Exact (parallel zu 29-9093 OP-Assistent)
  "29-2099.01": { kldbCode: "81222", kldbName: "Medizinisch-technische Berufe in der Funktionsdiagnostik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Neurodiagnostic Technologists: war 81723 Ergotherapie komplex (Drift); Modify gegen agent's 81212 Labor — EEG/Neurophysiologie ist in DE Funktionsdiagnostik-Domain (Labor ist Proben/Blut), 81222 trifft besser; title-awkward agent-flag rejected (Konsistenz mit "MTA <X>"-Sister-Codes); KldB+Anf 3→2
  "29-2099.05": { kldbCode: "81182", kldbName: "Medizinische Fachangestellte (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Ophthalmic Medical Technologists: war 81132 Orthoptisten/Orthoptistinnen — Modify gegen agent's null suggestion; Orthoptisten ist eigene enge Profession (nur Augenmotilität), 81182 Med-FA sonstige fängt Augenarzthelfer-Domain (Klinik-Funktionen + OP-Assistenz im Augenbereich); coupled mit title.de "Ophthalmologisch-techn. Assistent" → "MTA Ophthalmologie"
  "29-9093.00": { kldbCode: "81332", kldbName: "Berufe in der operations-/medizintechnischen Assistenz - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Surgical Assistants: war 81102 Med-FA fachlich (Drift — Praxisassistenz vs. OP); 81332 OP-/medtech Assistenz fachlich ist Exact-Domain (parallel-Code zu 29-2055 OTA)

  // Sonstige
  "29-2043.00": { kldbCode: "81343", kldbName: "Berufe im Rettungsdienst - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Paramedics: war 81342 Rettungsdienst fachlich Anf 2 — Notfallsanitäter ist seit 2014 staatlich anerkannter 3-jähriger Beruf mit Heilkundekompetenzen, daher Spezialisten-Tier; sibling-up 81342 → 81343; KldB+Anf 2→3
  "29-9092.00": { kldbCode: "41274", kldbName: "Berufe in der Biologie (Humanbiologie) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Genetic Counselors: war 41204 Biologie ohne-Spez. (Drift via "genetisch") — Humanbiologie 41274 trifft Genetik-Beratungs-Domain spezifischer

  // === Audit batch 17 — SOC 51 Production (2026-05-04) ===
  // Final batch of the 10-agent Sonnet coherence audit (Session 36, persisted
  // at scripts/audit/findings-2026-04-25.json). 43 findings walked, 1 explicit
  // Reject (51-4021 Extruding/Drawing Mixed-Material — agent sug=null,
  // current 24122 Metallumformung is best-fit for Metall-Hauptlast in DE
  // Praxis; mixed-Metall+Plastik SOC unauflösbar in single-domain KldB).
  // 24 KldB-overrides total: 22 batch-17 entries + 2 seed pull-outs (51-3091
  // Food/Tobacco Roasting from 22312 Holztrocknung — Stem-Drift via
  // "Trocknung"; 51-6011 Laundry from 54101 Reinigung-Helfer Anf 1 —
  // sibling-up zu 54132 Textilreinigung Anf 2, IHK-Ausbildungsberuf).
  // Heaviest cluster: Metallbearbeitung (5 codes pivoting between
  // 22302/24112/24122/24202/24222/24232/24302/24422 by exact spanend/
  // umformend/giessend/schweissend/oberflächen-Domain). Other patterns:
  // 4 codes anf-up von 26301 Helfer Anf 1 zu 26302 fachlich Anf 2
  // (Equipment Assemblers, Solder Machine, Semicon Tech), parallel zu
  // 51-2023 EMEA Modify-beyond-flag mit explizitem Audit-anf-up; 4 codes
  // Title-Verfeinerung "Steuerer/Steuerin" (KldB-Klassennamen-Stil) zu
  // etablierten DE-Berufstiteln "Anlagenfahrer X" oder "Kraftwerksoperateur"
  // (parallel zu 51-8092/8093 Cluster); 4 codes pivoting Multi-Material-
  // SOCs auf 25122 mat-agnostic Maschinen-/Anlagenführer (51-9021
  // Crushing/Grinding, 51-9041 Extruding/Forming, plus 51-9111/etc.).
  // Catalog-only-Anf positives Sibling-Up bei 51-6011 (54132 Textilreinigung
  // Anf 2 IHK-Beruf) und 51-4051 (24112 Hüttentechnik Anf 2 statt Anf 3
  // specialist — Furnace Operator ist Geselle-Tier, kein Spezialist).

  // 51-2xxx Assembler / Elektromontage (5 codes; 51-2022 ist title-only)
  "51-2021.00": { kldbCode: "26302", kldbName: "Berufe in der Elektrotechnik (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Coil Winders/Tapers/Finishers: war 22102 Kunststoff/Kautschuk (vollständige Stem-Kollision; SOC ist Drahtspulen-Wickeln für Elektrokomponenten); coupled mit title.de "Bediener von Maschinen zum Glasfaserziehen" → "Spulenwickler/Spulenwicklerin"
  "51-2023.00": { kldbCode: "26302", kldbName: "Berufe in der Elektrotechnik (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Electromechanical Equipment Assemblers: war 26301 Elektrotechnik-Helfer Anf 1 — SOC montiert Servo-/Gyro-/Tape-Drive-Baugruppen, Mechatroniker-Tier; anf-up 1→2; coupled mit title.de "Elektroanlageninstallateur" → "Elektromechaniker/Elektromechanikerin"
  "51-2031.00": { kldbCode: "25112", kldbName: "Maschinen- und Gerätezusammensetzer/innen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Engine and Other Machine Assemblers: war 25232 Luft-/Raumfahrttechnik (zu eng — SOC ist allgemein Maschinen+Motoren); Title-Override existiert ("Maschinen- und Motorenmonteur"), bleibt
  "51-2092.00": { kldbCode: "25112", kldbName: "Maschinen- und Gerätezusammensetzer/innen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Team Assemblers: war 27303 Produktionsplanung komplex Anf 3 — SOC ist Fließbandmontage rotierende Aufgaben (Anf 2), kein Anf-3-Planungs-Spezialist; KldB+Anf 3→2 + trainingCategory specialist→apprenticeship; coupled mit title.de "Steuerer von automatisierten Montagelinien" → "Montierer/Montiererin"

  // 51-3xxx Lebensmittelverarbeitung (1 code; 51-3092 ist title-only)
  "51-3091.00": { kldbCode: "29282", kldbName: "Berufe in der Lebensmittelherstellung (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Food/Tobacco Roasting/Baking/Drying Machine Operators: pull-out (war 22312 Holztrocknung — Stem-Drift "Trocknung"); SOC ist Lebensmittel+Tabak-Verarbeitung, 29282 Lebensmittel-sonstige passt zur Röst-/Trocken-Spezifik (allg. 29202 wäre auch akzeptabel, sonstige spez. ist treffender); coupled mit title.de "Bediener von Holztrocknungsanlagen" → "Bediener von Röst- und Trocknungsanlagen / Bedienerin von Röst- und Trocknungsanlagen"

  // 51-4xxx Metallbearbeitung (8 codes; 51-4121 + 51-4191 sind title-only; 51-4021 REJECT)
  "51-4032.00": { kldbCode: "24232", kldbName: "Berufe in der spanenden Metallbearbeitung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Drilling/Boring Metal+Plastic: war 22302 Holzbearbeitung (Stem-Drift "Bohrer"); Modify gegen agent's 24202 ohne-Spez. — Bohren/Drehen/Fräsen ist exakt spanende Metallbearbeitung (24232), nicht "ohne Spezialisierung"; coupled mit title.de "Holzbohrmaschinenbediener" (+Tippfehler "Hozbohr") → "Maschinenführer Zerspanungstechnik / Maschinenführerin Zerspanungstechnik"
  "51-4033.00": { kldbCode: "24222", kldbName: "Berufe in der schleifenden Metallbearbeitung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Grinding/Lapping/Polishing Metal+Plastic: war 22302 Holzbearbeitung (Stem-Drift "Schleifer"); Title-Override existiert ("Metallschleifer und -polierer"), bleibt
  "51-4035.00": { kldbCode: "24232", kldbName: "Berufe in der spanenden Metallbearbeitung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Milling/Planing Metal+Plastic: war 24202 Metallbearbeitung ohne-Spez. — Modify-beyond-flag (Audit nur Title-flag); SOC ist Fräsen/Hobeln = spanend, parallel zu 51-4032; coupled mit title.de "Metallsäger" → "Fräser/Fräserin"
  "51-4051.00": { kldbCode: "24112", kldbName: "Berufe in der Hüttentechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Metal-Refining Furnace Operators: war 24113 Hüttentechnik komplex Anf 3 specialist — Furnace Operator ist Geselle-Tier (Schmelzer-IHK-Ausbildung), nicht Spezialist; anf-down 3→2 + trainingCategory specialist→apprenticeship; coupled mit title.de "Schmelzofensteuerer" → "Schmelzer/Schmelzerin"
  "51-4072.00": { kldbCode: "24132", kldbName: "Berufe in der industriellen Gießerei - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Molding/Coremaking/Casting Metal+Plastic: war 24122 Metallumformung — Casting ist Gießerei (24132), nicht Umformung (= Pressen/Walzen); Title-Override existiert ("Formgießmaschinenführer"), bleibt
  "51-4122.00": { kldbCode: "24422", kldbName: "Berufe in der Schweiß- und Verbindungstechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Welding/Soldering/Brazing Machine Operators: war 26301 Elektrotechnik-Helfer Anf 1 (vollständige Domain-Drift — "Wellenlöten" ist Elektronikfertigung, SOC ist breit alle Schweiß-/Löt-Methoden); KldB+Anf 1→2 + trainingCategory none→apprenticeship; coupled mit title.de "Maschinenbediener im Bereich Wellenlöten" → "Maschinenbediener Schweiß- und Löttechnik / Maschinenbedienerin Schweiß- und Löttechnik"
  "51-4193.00": { kldbCode: "24302", kldbName: "Berufe in der Metalloberflächenbehandlung (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Plating Machine Operators: war 24222 schleifende Metallbearbeitung — Plating ist Galvanik/elektrolytische Beschichtung, kein Schleifen; Modify gegen agent's null suggestion (Catalog-Pivot zu 24302 Metalloberflächenbehandlung); coupled mit title.de "Metallpolierer" → "Galvaniseur/Galvaniseurin"

  // 51-6xxx Textil / Leder / Reinigung (4 codes; 51-6041 + 51-6051 + 51-6061 sind title-only)
  "51-6011.00": { kldbCode: "54132", kldbName: "Berufe in der Textilreinigung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Laundry and Dry-Cleaning Workers: pull-out (war 54101 Reinigung-Helfer Anf 1 in seed) — Modify-beyond-flag, sibling-up zu 54132 Textilreinigung Anf 2 (IHK-Ausbildungsberuf "Textilreiniger" existiert); KldB+Anf 1→2 + trainingCategory none→apprenticeship; coupled mit title.de "Maschinenwäscher" → "Textilreiniger/Textilreinigerin"
  "51-6062.00": { kldbCode: "28102", kldbName: "Berufe in der Textiltechnik (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Textile Cutting Machine Operators: war 28332 Schuhherstellung (vollständige Domain-Drift — "Oberlederzurichter" ist Lederberuf, SOC ist Textilschnitt); coupled mit title.de "Oberlederzurichter" → "Textilzuschneider/Textilzuschneiderin" (+ Tippfehler-Fix gegen agent's "Textilzuschneiderein")
  "51-6091.00": { kldbCode: "22102", kldbName: "Berufe in der Kunststoff- und Kautschukherstellung (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Extruding/Forming Synthetic+Glass Fibers: war 21312 Glasherstellung — Kunstfaser-/Glasfaserextrusion ist Kunststoff-/Polymer-Domain, nicht Glasware-Herstellung (Kunstfasern sind Polymer-basiert auch wenn die Fasern teils glasartig)

  // 51-8xxx Anlagen-Steuerer (1 code; 4 weitere sind title-only)
  "51-8013.03": { kldbCode: "26243", kldbName: "Berufe in der regenerativen Energietechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Biomass Plant Technicians: war 41333 chemische Verfahrensanlagen — Biogas/Biomasse ist regenerative Energietechnik (parallel zu 51-8013 Power Plant Operators-Family-Cluster); Title-Override existiert ("Biogas-Techniker"), bleibt

  // 51-9xxx Sonstige Fertigung (10 codes mit KldB-Edit; 9 weitere title-only)
  "51-9021.00": { kldbCode: "25122", kldbName: "Maschinen- und Anlagenführer/innen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Crushing/Grinding/Polishing Machine: war 21222 Baustoffe (zu eng — SOC umfasst Kohle, Glas, Getreide, Stein, Lebensmittel, Gummi); mat-agnostic 25122 trifft Multi-Material-SOC-Charakter; coupled mit title.de "Steinschleifer" → "Maschinen- und Anlagenführer/Maschinen- und Anlagenführerin"
  "51-9031.00": { kldbCode: "28222", kldbName: "Berufe in der Bekleidungs-, Hut- und Mützenherstellung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Cutters and Trimmers, Hand: war 28332 Schuhherstellung (Domain-Drift); SOC ist Handschneiden Stoff/Bekleidung, nicht Leder/Schuh; Title bleibt "Zuschneider (Bekleidung)"
  "51-9041.00": { kldbCode: "25122", kldbName: "Maschinen- und Anlagenführer/innen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Extruding/Forming/Pressing/Compacting Machine: war 22102 Kunststoff (zu eng); Modify gegen agent's 21312 Glas — SOC umfasst Glas+Lebensmittel+Gummi+Seife+Keramik (Multi-Material), parallel zu 51-9021 mat-agnostic-Pivot; coupled mit title.de "Glasformer" → "Formmaschinenführer/Formmaschinenführerin"
  "51-9141.00": { kldbCode: "26302", kldbName: "Berufe in der Elektrotechnik (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Semiconductor Processing Technicians: war 26301 Elektrotechnik-Helfer Anf 1 — Halbleiterfertigungs-Techniker sind Fachkräfte mit Ausbildung (Mikrotechnologe IHK-Beruf), kein Anf-1; anf-up 1→2 + trainingCategory none→apprenticeship; Title bleibt "Halbleiterfertiger"
  "51-9162.00": { kldbCode: "24232", kldbName: "Berufe in der spanenden Metallbearbeitung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // CNC Tool Programmers: war 43412 Softwareentwicklung (vollständige Domain-Drift — "Programmierer" hat IT-Treffer ausgelöst); SOC ist Werkzeugmaschinen-Programmierung + Setup/Operate, exakt spanende Metallbearbeitung; coupled mit title.de "CNC-Programmierer" → "Zerspanungsmechaniker CNC/Zerspanungsmechanikerin CNC" (Disambiguierung gegen IT-Programmierer-Lesart)
  "51-9192.00": { kldbCode: "29202", kldbName: "Berufe in der Lebensmittelherstellung (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Cleaning/Washing/Metal Pickling Equipment: war 23112 Papierherstellung (vollständige Domain-Drift — "Reinigung von Fässern" hat Papier-Treffer ausgelöst); SOC ist Reinigen von Lebensmitteln/Glaswaren/Kunststoff vor Weiterverarbeitung, Lebensmittel-Domain ist Hauptlast; coupled mit title.de "Raffinationsanlagenbediener" → "Maschinenführer Reinigung und Aufbereitung / Maschinenführerin Reinigung und Aufbereitung"
  "51-9193.00": { kldbCode: "29202", kldbName: "Berufe in der Lebensmittelherstellung (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Cooling and Freezing Equipment Operators: war 29102 Getränke (zu eng); Lebensmittel-Kühlung ist Hauptlast in DE-Industriepraxis (Tiefkühlkost-Industrie), 29202 ohne-Spez. ist breiter und passt; coupled mit title.de "Tiefkühlkosthersteller" → "Anlagenführer Kältetechnik / Anlagenführerin Kältetechnik" (operate-/tend-Frame, parallel zu 51-8091 Anlagenfahrer-Cluster)
  "51-9198.00": { kldbCode: "25101", kldbName: "Berufe in der Maschinenbau- und Betriebstechnik (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Helpers — Production Workers: war 21201 Naturstein-/Mineral-Helfer (zu eng — SOC ist allgemeiner Produktionshelfer); Modify gegen agent's null suggestion (mat-agnostic 25101 Maschinenbau-/Betriebstechnik Helfer ist generischste Helfer-Klasse); coupled mit title.de "Fabrikhilfsarbeiter" → "Produktionshelfer/Produktionshelferin"
}
