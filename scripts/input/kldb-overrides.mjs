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
  "19-1031.03": { kldbCode: "63143", kldbName: "Reiseleiter und Fremdenführer - komplexe Spezialistentätigkeiten", anforderungsniveau: 3, trainingCategory: "specialist" }, // Wissenschaftler Natur- und Artenschutz/Wissenschaftlerin Natur- und Artenschutz
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
  "29-1214.00": { kldbCode: "81414", kldbName: "Fachärzte/-ärztinnen in der Kinder- und Jugendmedizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Notfallmediziner/Notfallmedizinerin
  "29-1217.00": { kldbCode: "81414", kldbName: "Fachärzte/-ärztinnen in der Kinder- und Jugendmedizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt für Neurologie / Fachärztin für Neurologie
  "29-1218.00": { kldbCode: "81414", kldbName: "Fachärzte/-ärztinnen in der Kinder- und Jugendmedizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Frauenarzt/Frauenärztin
  "29-1222.00": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt für Pathologie / Fachärztin für Pathologie
  "29-1223.00": { kldbCode: "81414", kldbName: "Fachärzte/-ärztinnen in der Kinder- und Jugendmedizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Psychiater/Psychiaterin
  "29-1229.01": { kldbCode: "81404", kldbName: "Ärzte/Ärztinnen (ohne Spezialisierung) - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Facharzt für Allergologie und Immunologie / Fachärztin für Allergologie und Immunologie
  "29-1229.03": { kldbCode: "81414", kldbName: "Fachärzte/-ärztinnen in der Kinder- und Jugendmedizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Urologe/Urologin
  "29-1242.00": { kldbCode: "81414", kldbName: "Fachärzte/-ärztinnen in der Kinder- und Jugendmedizin - hoch komplexe Tätigkeiten", anforderungsniveau: 4, trainingCategory: "studies" }, // Orthopäde/Orthopädin
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
  "43-6014.00": { kldbCode: "63212", kldbName: "Hotelkaufleute - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Sekretär/Sekretärin
  "45-2041.00": { kldbCode: "29152", kldbName: "Nahrungsmittel- und Getränkekoster - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Milchkontrolleur/Milchkontrolleurin
  "45-2091.00": { kldbCode: "52512", kldbName: "Führer von land- und forstwirtschaftlichen Maschinen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Maschinenbediener für die landwirtschaftliche Produktion/Maschinenbedienerin für die landwirtschaftliche Produktion
  "45-2092.00": { kldbCode: "12101", kldbName: "Berufe im Gartenbau (ohne Spezialisierung) - Helfer-/Anlerntätigkeiten", anforderungsniveau: 1, trainingCategory: "none" }, // Gartenhilfsarbeiter/Gartenhilfsarbeiterin
  "45-4021.00": { kldbCode: "52512", kldbName: "Führer von land- und forstwirtschaftlichen Maschinen - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Schrotsägenführer/Schrotsägenführerin
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
  "53-7071.00": { kldbCode: "51512", kldbName: "Berufe in der Überwachung und Steuerung des Straßenverkehrsbetriebs - fachlich ausgerichtete Tätigkeiten", anforderungsniveau: 2, trainingCategory: "apprenticeship" }, // Verdichter-Operator Gas / Verdichter-Operatorin Gas

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
}
