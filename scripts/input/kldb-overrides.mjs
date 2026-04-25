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
  "11-1011.03": { kldbCode: "71104", kldbName: "Geschäftsführer und Vorstände - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Beauftragter für die soziale Verantwortung der Unternehmen/Beauftragte für die soziale Verantwortung der Unternehmen
  "11-1021.00": { kldbCode: "71104", kldbName: "Geschäftsführer und Vorstände - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter des operativen Geschäftsbereichs/Leiterin des operativen Geschäftsbereichs
  "11-3013.01": { kldbCode: "53124", kldbName: "Berufe in Arbeitssicherheit und Sicherheitstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter Sicherheit / Leiterin Sicherheit
  "11-3031.03": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Investmentfondsmanager/Investmentfondsmanagerin
  "11-3051.04": { kldbCode: "41393", kldbName: "Aufsichtskräfte - Chemie", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter Biomassekraftwerk / Leiterin Biomassekraftwerk
  "11-3111.00": { kldbCode: "71594", kldbName: "Führungskräfte - Personalwesen und -dienstleistung", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter Vergütung und Zusatzleistungen / Leiterin Vergütung und Zusatzleistungen
  "11-9071.00": { kldbCode: "63124", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter einer Glücksspieleinrichtung/Leiterin einer Glücksspieleinrichtung
  "11-9072.00": { kldbCode: "63124", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter einer Freizeiteinrichtung/Leiterin einer Freizeiteinrichtung
  "11-9179.01": { kldbCode: "63124", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter einer Sporteinrichtung/Leiterin einer Sporteinrichtung
  "11-9179.02": { kldbCode: "63124", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Leiter eines Heilbades/Leiterin eines Heilbades
  "11-9199.08": { kldbCode: "53122", kldbName: "Berufe in Arbeitssicherheit und Sicherheitstechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Leiter Diebstahlprävention / Leiterin Diebstahlprävention
  "11-9199.09": { kldbCode: "61394", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Betriebsleiter Windpark / Betriebsleiterin Windpark
  "11-9199.10": { kldbCode: "61394", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Projektleiter Windenergie / Projektleiterin Windenergie
  // 13-1081.01 Logistics Engineers pulled out of seed (was 51624 Speditions-/Logistikkaufleute — kaufmännisch-fokussiert; Logistics Engineers gestalten systemisch Transportnetzwerke) → batch-8 block (71384 Unternehmensorganisation sonstige hoch komplex Anf 4)
  // 13-1082.00 Project Management Specialists pulled out of seed (was 71393 Aufsichtskräfte — Tier-Mismatch zu Anf 4) → batch-8 block (71394 Führungskräfte Unternehmensorganisation Anf 4)
  // 13-1131.00 Fundraisers pulled out of seed (was 63123 Sport-/Fitnesskaufleute — Stem-Drift via "-kauf-") → batch-8 block (92113 Werbung/Marketing komplex Anf 3)
  "13-2051.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Anlage- und Vermögensberater/Anlage- und Vermögensberaterin
  "13-2052.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Finanzplaner/Finanzplanerin
  "13-2054.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Financial Risk Analyst/Financial Risk Analystin
  // 15-2031.00 Operations Research Analysts pulled out of seed (was 51624 Speditions-/Logistikkaufleute Anf 4 — stem-drift "Logistik") → batch-4 block (41104 Mathematik hoch komplex)
  "15-2051.01": { kldbCode: "71314", kldbName: "Berufe in der Unternehmensorganisation und -planung - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Business-Intelligence-Analyst/Business-Intelligence-Analystin
  "17-2031.00": { kldbCode: "26324", kldbName: "Berufe in der Mikrosystemtechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Bioingenieur/Bioingenieurin
  "17-2112.01": { kldbCode: "53124", kldbName: "Berufe in Arbeitssicherheit und Sicherheitstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Ergonomie-Ingenieur/Ergonomie-Ingenieurin
  "17-2112.02": { kldbCode: "25194", kldbName: "Führungskräfte - Maschinenbau- und Betriebstechnik", anforderungsniveau: 4, trainingCategory: "studies" }, // Qualitätsingenieur/Qualitätsingenieurin
  "17-2131.00": { kldbCode: "25194", kldbName: "Führungskräfte - Maschinenbau- und Betriebstechnik", anforderungsniveau: 4, trainingCategory: "studies" }, // Werkstoffingenieur/Werkstoffingenieurin
  "17-2161.00": { kldbCode: "41404", kldbName: "Berufe in der Physik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Nuklearingenieur/Nuklearingenieurin
  "17-2199.07": { kldbCode: "26324", kldbName: "Berufe in der Mikrosystemtechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Ingenieur Photonik/Ingenieurin Photonik
  "17-2199.08": { kldbCode: "26124", kldbName: "Berufe in der Automatisierungstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Ingenieur Robotik und Autonome Systeme/Ingenieurin Robotik und Autonome Systeme
  "17-2199.09": { kldbCode: "26324", kldbName: "Berufe in der Mikrosystemtechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Nanosystem-Ingenieur/Nanosystem-Ingenieurin
  "17-2199.10": { kldbCode: "21124", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Energieingenieur/Energieingenieurin
  "17-2199.11": { kldbCode: "21124", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Ingenieur Solartechnik/Ingenieurin Solartechnik
  "17-3011.00": { kldbCode: "27212", kldbName: "Technische Zeichner - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // CAD-Bediener/CAD-Bedienerin
  "17-3012.00": { kldbCode: "27212", kldbName: "Technische Zeichner - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Elektrozeichner/Elektrozeichnerin
  "17-3013.00": { kldbCode: "27212", kldbName: "Technische Zeichner - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Maschinenbauzeichner/Maschinenbauzeichnerin
  "17-3026.01": { kldbCode: "26123", kldbName: "Berufe in der Automatisierungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Nanotechnologie-Techniker/Nanotechnologie-Technikerin
  "19-1023.00": { kldbCode: "41293", kldbName: "Aufsichtskräfte - Biologie", anforderungsniveau: 3, trainingCategory: "specialist" }, // Zoologen und Wildtierbiologen
  "19-2032.00": { kldbCode: "41303", kldbName: "Berufe in der Chemie (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Werkstoffwissenschaftler/Werkstoffwissenschaftlerin
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
  "29-1031.00": { kldbCode: "41204", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Futtermittelwissenschaftler/Futtermittelwissenschaftlerin
  "29-1051.00": { kldbCode: "81804", kldbName: "Apotheker, Pharmazeuten/Pharmazeutinnen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Krankenhausapotheker/Krankenhausapothekerin
  "29-1128.00": { kldbCode: "84553", kldbName: "Trainer - Fitness und Gymnastik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Personal Trainer/Personal Trainerin
  "29-1222.00": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt für Pathologie / Fachärztin für Pathologie
  "29-1229.01": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt für Allergologie und Immunologie / Fachärztin für Allergologie und Immunologie
  "29-2011.02": { kldbCode: "41204", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Zytologie-Assistent/Zytologie-Assistentin
  "29-2055.00": { kldbCode: "81102", kldbName: "Medizinische Fachangestellte (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Operationstechnischer Assistent / Operationstechnische Assistentin
  "29-9092.00": { kldbCode: "41204", kldbName: null, anforderungsniveau: 4, trainingCategory: "studies" }, // Genetischer Berater / Genetische Beraterin
  "29-9093.00": { kldbCode: "81102", kldbName: "Medizinische Fachangestellte (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // OP-Assistent/OP-Assistentin
  "35-3011.00": { kldbCode: "63322", kldbName: "Barkeeper - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Barkeeper/Barkeeperin
  "35-3023.01": { kldbCode: "63322", kldbName: "Barkeeper - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Barista
  "35-9011.00": { kldbCode: null, kldbName: null, anforderungsniveau: 1, trainingCategory: "none" }, // Dining Room and Cafeteria Attendants and Bartender Helpers
  "39-1014.00": { kldbCode: "63122", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Leiter/Leiterin Gastronomie und Freizeit
  "39-3031.00": { kldbCode: "62112", kldbName: "Kassierer und Kartenverkäufer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Einlasskontrolle und Saaldienst
  "39-3092.00": { kldbCode: "82332", kldbName: "Tätowierer und Piercer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Ankleider/Ankleiderin
  "39-7011.00": { kldbCode: "63142", kldbName: "Reiseleiter und Fremdenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Fremdenführer/Fremdenführerin
  "39-7012.00": { kldbCode: "63142", kldbName: "Reiseleiter und Fremdenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Reiseleiter/Reiseleiterin
  "39-9031.00": { kldbCode: "63122", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sporttrainer/Sporttrainerin
  "39-9032.00": { kldbCode: "84553", kldbName: "Trainer - Fitness und Gymnastik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Trainer für Outdoor-Aktivitäten/Trainerin für Outdoor-Aktivitäten
  "41-2011.00": { kldbCode: "62112", kldbName: "Kassierer und Kartenverkäufer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kassierer/Kassiererin
  "41-2012.00": { kldbCode: "62112", kldbName: "Kassierer und Kartenverkäufer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kassierer Spielbank / Kassiererin Spielbank
  "41-9091.00": { kldbCode: "62301", kldbName: "Berufe im Verkauf von Lebensmitteln (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Straßenverkäufer von Lebensmitteln/Straßenverkäuferin von Lebensmitteln
  "43-3031.00": { kldbCode: "72122", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Steuersachbearbeiter/Steuersachbearbeiterin
  "43-4011.00": { kldbCode: "72122", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Back-Office-Mitarbeiter im Maklergeschäft/Back-Office-Mitarbeiterin im Maklergeschäft
  "43-4031.00": { kldbCode: "53232", kldbName: "Berufe im Gerichtsvollzug - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Justizfachangestellter/Justizfachangestellte
  "43-4131.00": { kldbCode: "72122", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kreditantragsbearbeiter/Kreditantragsbearbeiterin
  "43-5021.00": { kldbCode: "52182", kldbName: "Fahrzeugführer im Straßenverkehr (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Fahrradkurier/Fahrradkurierin
  "45-2041.00": { kldbCode: "29152", kldbName: "Nahrungsmittel- und Getränkekoster - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Milchkontrolleur/Milchkontrolleurin
  "45-2091.00": { kldbCode: "52512", kldbName: "Führer von land- und forstwirtschaftlichen Maschinen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Maschinenbediener für die landwirtschaftliche Produktion/Maschinenbedienerin für die landwirtschaftliche Produktion
  "45-2092.00": { kldbCode: "12101", kldbName: "Berufe im Gartenbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Gartenhilfsarbeiter/Gartenhilfsarbeiterin
  "45-4022.00": { kldbCode: "52512", kldbName: "Führer von land- und forstwirtschaftlichen Maschinen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Forstmaschinenführer/Forstmaschinenführerin
  "47-3011.00": { kldbCode: "32212", kldbName: "Pflasterer/Pflasterinnen und Steinsetzer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bauhelfer Maurer- und Steinmetzhandwerk / Bauhelferin Maurer- und Steinmetzhandwerk
  "47-4051.00": { kldbCode: "51212", kldbName: "Straßen- und Tunnelwärter - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Straßenunterhaltungsarbeiter/Straßenunterhaltungsarbeiterin
  "47-4071.00": { kldbCode: "32201", kldbName: "Berufe im Tiefbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Kanalbauer/Kanalbauerin
  "47-5044.00": { kldbCode: "32222", kldbName: "Berufe im Straßen- und Asphaltbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bergbau-Maschinenführer Untertage / Bergbau-Maschinenführerin Untertage
  "49-2094.00": { kldbCode: "26122", kldbName: "Berufe in der Automatisierungstechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Elektroniker Gewerbliche Geräte / Elektronikerin Gewerbliche Geräte
  // 49-3031.00 Bus/Truck Mechanics pulled out of seed (was 25112 Maschinen-/Gerätezusammensetzer — zu fertigungs-fokussiert für Diagnostik/Reparatur) → batch-6 block (25212 Kfz-Technik fachlich)
  // 49-3043.00 Rail Car Repairers pulled out of seed (was 25112 Maschinen-/Gerätezusammensetzer — generisch) → batch-6 block (51112 Eisenbahnbetrieb fachlich)
  // 49-9045.00 Refractory Materials Repairers pulled out of seed (was 32122 Maurerhandwerk — Bauberuf, SOC explizit "Except Brickmasons") → batch-6 block (21412 Industriekeramik)
  // 49-9062.00 Medical Equipment Repairers pulled out of seed (was 26122 Automatisierungstechnik Anf 4 — falsche Domain + zu hoher Tier) → batch-6 block (82503 Medizintechnik komplex Anf 3, Techniker-Tier)
  "51-2011.00": { kldbCode: "25112", kldbName: "Maschinen- und Gerätezusammensetzer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Flugzeugmonteur/Flugzeugmonteurin
  "51-3022.00": { kldbCode: "29201", kldbName: "Berufe in der Lebensmittelherstellung (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Fleischverarbeitungskraft
  "51-4021.00": { kldbCode: "24122", kldbName: "Berufe in der Metallumformung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Maschinen- und Anlagenführer Strangpressen und Ziehen / Maschinen- und Anlagenführerin Strangpressen und Ziehen
  "51-6011.00": { kldbCode: "54101", kldbName: "Berufe in der Reinigung (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Maschinenwäscher/Maschinenwäscherin
  "51-6021.00": { kldbCode: null, kldbName: null, anforderungsniveau: 1, trainingCategory: "none" }, // Bügler/Büglerin
  "51-6031.00": { kldbCode: "28221", kldbName: "Berufe in der Bekleidungs-, Hut- und Mützenherstellung - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Maschinennäher/Maschinennäherin
  "51-6051.00": { kldbCode: "28221", kldbName: "Berufe in der Bekleidungs-, Hut- und Mützenherstellung - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Textilgestalter im Handwerk – Sticken/Textilgestalterin im Handwerk – Sticken
  "51-7032.00": { kldbCode: "27232", kldbName: "Berufe im Modellbau - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Holzmodellbauer/Holzmodellbauerin
  "51-8021.00": { kldbCode: "25122", kldbName: "Maschinen- und Anlagenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kesselwärter/Kesselwärterin
  "51-9032.00": { kldbCode: "25122", kldbName: "Maschinen- und Anlagenführer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Rollenschneider/Rollenschneiderin
  "53-2011.00": { kldbCode: "52313", kldbName: "Piloten/Pilotinnen und Verkehrsflugzeugführer - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Flugzeugführer/Flugzeugführerin
  "53-2012.00": { kldbCode: "52313", kldbName: "Piloten/Pilotinnen und Verkehrsflugzeugführer - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Verkehrsflugzeugführer/Verkehrsflugzeugführerin
  "53-3031.00": { kldbCode: "52112", kldbName: "Berufskraftfahrer (Personentransport/PKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Verkaufsfahrer/Verkaufsfahrerin
  "53-3032.00": { kldbCode: "52122", kldbName: "Berufskraftfahrer (Güterverkehr/LKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Lastkraftwagenfahrer/Lastkraftwagenfahrerin
  "53-3033.00": { kldbCode: "52112", kldbName: "Berufskraftfahrer (Personentransport/PKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Lieferfahrer/Lieferfahrerin
  "53-3051.00": { kldbCode: "52132", kldbName: "Bus- und Straßenbahnfahrer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Oberleitungsbusfahrer/Oberleitungsbusfahrerin
  "53-3052.00": { kldbCode: "52132", kldbName: "Bus- und Straßenbahnfahrer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Omnibusfahrer/Omnibusfahrerin
  "53-3053.00": { kldbCode: "52132", kldbName: "Bus- und Straßenbahnfahrer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Shuttle- und Chauffeurfahrer/Shuttle- und Chauffeurfahrerin
  "53-3054.00": { kldbCode: "52112", kldbName: "Berufskraftfahrer (Personentransport/PKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Taxifahrer/Taxifahrerin
  "53-4011.00": { kldbCode: "52202", kldbName: "Triebfahrzeugführer im Eisenbahnverkehr (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Schienenfahrzeugführer/Schienenfahrzeugführerin
  "53-4022.00": { kldbCode: "51632", kldbName: "Straßen- und Schienenverkehrskaufleute - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Rangierbegleiter/Rangierbegleiterin
  "53-4041.00": { kldbCode: "52132", kldbName: "Bus- und Straßenbahnfahrer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // U-Bahn- und Straßenbahnfahrer/U-Bahn- und Straßenbahnfahrerin
  "53-5011.00": { kldbCode: "52422", kldbName: "Schiffsführer in Binnenschifffahrt und Hafenverkehr - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Matrose/Matrosin
  "53-5022.00": { kldbCode: "52422", kldbName: "Schiffsführer in Binnenschifffahrt und Hafenverkehr - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Seelotse/Seelotsin
  "53-6021.00": { kldbCode: "52112", kldbName: "Berufskraftfahrer (Personentransport/PKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Parkservice-Mitarbeiter/Parkservice-Mitarbeiterin
  "53-6032.00": { kldbCode: "52122", kldbName: "Berufskraftfahrer (Güterverkehr/LKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Flugzeugtankwart/Flugzeugtankwartin
  "53-7011.00": { kldbCode: null, kldbName: null, anforderungsniveau: 1, trainingCategory: "none" }, // Conveyor Operators and Tenders
  "53-7021.00": { kldbCode: "51242", kldbName: "Wasserstraßen- und Brückenwärter - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Turmdrehkranführer/Turmdrehkranführerin
  "53-7041.00": { kldbCode: "51242", kldbName: "Wasserstraßen- und Brückenwärter - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Verladebrückenführer/Verladebrückenführerin
  "53-7051.00": { kldbCode: "52122", kldbName: "Berufskraftfahrer (Güterverkehr/LKW) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Umzugsfahrer/Umzugsfahrerin

  // Tiebreaker regressions from the compound-noun substring fix (2026-04-23).
  // The improved tiebreaker picks these wrongly because a generic German
  // compound-noun substring matches more tokens in the wrong candidate than
  // in the semantically right one. Pin each back to its prior correct value.
  "15-2041.00": { kldbCode: "41114", kldbName: "Berufe in der Statistik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Statistiker (Statistik > Mathematik ohne Spez.)
  "17-3023.00": { kldbCode: "26123", kldbName: "Berufe in der Automatisierungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Elektroniker Automatisierungstechnik (literal match with candidate)
  "17-3027.01": { kldbCode: "25213", kldbName: "Berufe in der Kraftfahrzeugtechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Kraftfahrzeugbautechniker (literal match)
  "47-4099.03": { kldbCode: "33312", kldbName: "Berufe in der Isolierung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Weatherization Installers (Isolierung is the correct domain)
  "51-3091.00": { kldbCode: "22312", kldbName: "Berufe in der Holztrocknung und -konservierung - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bediener Holztrocknungsanlagen (literal)
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
  "47-5011.00": { kldbCode: "94512", kldbName: "Berufe in der Veranstaltungs- und Bühnentechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bühnenmann: was Brunnenbau
  "49-2091.00": { kldbCode: "26332", kldbName: "Berufe in der Luftverkehrs-, Schiffs- und Fahrzeugelektronik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Avioniker: was Automatisierungstechnik (generic)
  "53-7065.00": { kldbCode: "51312", kldbName: "Berufe in der Lagerwirtschaft - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Lagerarbeiter: was technischer Luftverkehrsbetrieb

  // Container-abuse overrides — batch 2 (2026-04-24).
  // Remaining Session-26 browser-test (A) findings plus the older scan-based
  // entries from BACKLOG. Reviewed with @mo-sp; each target verified against
  // scripts/input/kldb-data.json (full KldB 2010 catalog).
  "15-2041.01": { kldbCode: "41114", kldbName: "Berufe in der Statistik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Biometriker: was Mathematik (ohne Spez.) — same family as Statistiker 15-2041.00
  "17-1021.00": { kldbCode: "31213", kldbName: "Berufe in der Vermessungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Katasteringenieur: was Baustoffherstellung
  "19-2099.01": { kldbCode: "31213", kldbName: "Berufe in der Vermessungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Fernerkundungs-Wissenschaftler: was chemisch-technisches Labor (Geoinformatik 43144 only has Anf 4 tier, out of reach at current Anf 3)
  "19-4099.03": { kldbCode: "31213", kldbName: "Berufe in der Vermessungstechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Fernerkundungstechniker: was chemisch-technisches Labor
  "27-3042.00": { kldbCode: "92413", kldbName: "Redakteure/Redakteurinnen und Journalisten/Journalistinnen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Technischer Redakteur: was Stenotypisten
  "39-9041.00": { kldbCode: "83123", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Jugendarbeiter: was Verbraucherberatung
  "43-9061.00": { kldbCode: "71402", kldbName: "Büro- und Sekretariatskräfte (ohne Spezialisierung) - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Bürokraft (allgemein): was Umweltschutzverwaltung
  "47-5032.00": { kldbCode: "21122", kldbName: "Berufe in der Sprengtechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sprengstoffarbeiter: was Chemie-/Pharmatechnik — Session-24 emptied 21122 of engineers, but the actual explosives-worker belongs here
  // 49-3021.00 Automotive Body Repairers pulled out of seed (was 25213 Kfz-Technik komplex Anf 3 — bumped für Oldtimerrestaurator-Spezialisierung) → batch-6 block (25212 Anf 2, coupled-down zum neuen generischen Title "Karosserie- und Fahrzeugbaumechaniker" = IHK-Geselle-Tier)
  "51-9051.00": { kldbCode: "24112", kldbName: "Berufe in der Hüttentechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Koksofensteuerer: was Chemie-/Pharmatechnik — coke ovens are metallurgy, not pharma
  "53-1044.00": { kldbCode: "51422", kldbName: "Servicefachkräfte im Luftverkehr - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Leitender Flugbegleiter: was Service Straße/Schiene

  // Container-abuse overrides — batch 3 (2026-04-24).
  // Surfaced during the Cluster-B investigation (originally listed as
  // "category-phrase as primary display") — catalog lookup showed each of
  // these is in fact a wrong KldB mapping, not a rendering issue. Same
  // SOC-sibling lookup + kldb-data.json verification as batches 1/2.
  "11-3051.02": { kldbCode: "26234", kldbName: "Berufe in der Energie- und Kraftwerkstechnik - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Geothermal Production Managers: was Sprengtechnik — geothermal plant operators (51-8011/8012/8013) all sit at 26233 Energie-/Kraftwerkstechnik komplex, the manager tier is 26234
  "17-2051.00": { kldbCode: "31104", kldbName: "Berufe in der Bauplanung und -überwachung (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Civil Engineers: was Metallbau — core Bauingenieur role, the unspecialised planning-and-oversight class at hoch-komplex tier is the natural home
  "17-2051.01": { kldbCode: "31134", kldbName: "Berufe in der Bauplanung von Verkehrswegen und -anlagen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Transportation Engineers (Verkehrsingenieur): was Metallbau — transport-infrastructure planning class at same tier as Civil Engineers
  "17-2141.01": { kldbCode: "25104", kldbName: "Berufe in der Maschinenbau- und Betriebstechnik (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Fuel Cell Engineers: was Sprengtechnik — fuel cells are an energy-conversion mech-engineering topic, matches the parent 17-2141.00 (Mechanical Engineers) which already sits at 25104
  "29-2036.00": { kldbCode: "81233", kldbName: "Medizinisch-technische Berufe in der Radiologie - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Medical Dosimetrists: was Ergotherapie — dosimetry is radiation-therapy planning, sibling 29-2034 Radiologic Technologists sits in the same Radiologie family
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
}
