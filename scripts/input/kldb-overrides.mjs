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
  "13-1081.01": { kldbCode: "51624", kldbName: "Speditions- und Logistikkaufleute - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Logistikingenieur/Logistikingenieurin
  "13-1082.00": { kldbCode: "71393", kldbName: "Aufsichtskräfte - Unternehmensorganisation und -strategie", anforderungsniveau: 4, trainingCategory: "studies" }, // Projektmanager/Projektmanagerin
  "13-1131.00": { kldbCode: "63123", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Mitarbeiter im Bereich Fundraising/Mitarbeiterin im Bereich Fundraising
  "13-2051.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Anlage- und Vermögensberater/Anlage- und Vermögensberaterin
  "13-2052.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Finanzplaner/Finanzplanerin
  "13-2054.00": { kldbCode: "72124", kldbName: "Anlageberater und sonstige Finanzdienstleistungsberufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Financial Risk Analyst/Financial Risk Analystin
  "15-2031.00": { kldbCode: "51624", kldbName: "Speditions- und Logistikkaufleute - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Operations-Research-Analyst/Operations-Research-Analystin
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
  "25-1123.00": { kldbCode: "84124", kldbName: "Lehrkräfte in der Sekundarstufe - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Hochschullehrkraft Anglistik
  "25-1124.00": { kldbCode: "84454", kldbName: "(Fremd-)Sprachenlehrer - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Hochschullehrkraft Fremdsprachenphilologien
  "25-2022.00": { kldbCode: "84454", kldbName: "(Fremd-)Sprachenlehrer - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Lehrkraft Sekundarstufe I
  "25-4013.00": { kldbCode: "73314", kldbName: "Berufe im Archivwesen - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Museumstechniker und Restaurator / Museumstechnikerin und Restauratorin
  "27-2011.00": { kldbCode: "94214", kldbName: "Schauspieler - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Schauspieler/Schauspielerin
  "27-2021.00": { kldbCode: "94243", kldbName: "Athleten/Athletinnen und Berufssportler - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Berufssportler/Berufssportlerin
  "27-2022.00": { kldbCode: "84503", kldbName: "Sportlehrer (ohne Spezialisierung) - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Lehrkraft für Sport Sekundarstufe
  "27-2023.00": { kldbCode: "63122", kldbName: "Sport- und Fitnesskaufleute, Sportmanager - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Schiedsrichter/Schiedsrichterin
  "27-3091.00": { kldbCode: "71423", kldbName: "Dolmetscher und Übersetzer - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Dolmetscher/Dolmetscherin
  "27-4011.00": { kldbCode: "82332", kldbName: "Tätowierer und Piercer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Audio and Video Technicians
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
  "49-3031.00": { kldbCode: "25112", kldbName: "Maschinen- und Gerätezusammensetzer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Kfz-Motorenbauer/Kfz-Motorenbauerin
  "49-3043.00": { kldbCode: "25112", kldbName: "Maschinen- und Gerätezusammensetzer - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Schienenfahrzeugmonteur/Schienenfahrzeugmonteurin
  "49-9045.00": { kldbCode: "32122", kldbName: "Berufe im Maurerhandwerk - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Feuerfestbauer/Feuerfestbauerin
  "49-9062.00": { kldbCode: "26122", kldbName: "Berufe in der Automatisierungstechnik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Biomedizinischer Ingenieur/Biomedizinische Ingenieurin
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
  "23-2093.00": { kldbCode: "73112", kldbName: "Assistenzkräfte in Rechtsanwaltskanzlei und Notariat - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Notariatsmitarbeiter: was Detektive
  "25-2059.01": { kldbCode: "84504", kldbName: "Sportlehrer (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Sportlehrer für Menschen mit Behinderung: was Führungskräfte Pferdewirtschaft
  "25-3021.00": { kldbCode: "83122", kldbName: "Berufe in der Sozialarbeit und Sozialpädagogik - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Lebensberater: was Kinderbetreuung und -erziehung
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
  "49-3021.00": { kldbCode: "25213", kldbName: "Berufe in der Kraftfahrzeugtechnik - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Oldtimerrestaurator: was Kfz-Technik fachlich (Anf 2); bumped to specialist-tier since Oldtimer-Restaurierung is post-Ausbildung specialization
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
  "13-1041.04": { kldbCode: "31163", kldbName: "Bausachverständige und Baukontrolleure/-kontrolleurinnen - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Inspekteur öffentliches Eigentum: was Landwirtschaftliche Sachverständige — Property-Inspektionen sind Bauinspektion, 31163 ist der Domain-Match
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
}
