/**
 * German occupation title overrides, keyed by O*NET-SOC code.
 *
 * Why this exists:
 *   The ESCO preferredLabel.de that we pull via the ESCO REST API is often
 *   cluster-level — e.g. 10 different medical specialties all come back as
 *   "Facharzt/Fachärztin", and Helper-* O*NET codes inherit the title of
 *   their main trade. That produces duplicate-looking rows in the results
 *   list and the occupation search. This file lets us hand-curate a
 *   distinguishing German title per affected O*NET code.
 *
 * How it is applied:
 *   build-esco-german.mjs loads this map after fetching ESCO labels; for
 *   any O*NET code with an entry here, the override wins. Codes that are
 *   not listed here keep their ESCO-derived title unchanged.
 *
 * Curation conventions:
 *   - Medical specialties: "Facharzt für X / Fachärztin für X" or the short
 *     colloquial form (Kinderarzt/Kinderärztin) where it's more natural.
 *   - Helper O*NET codes (47-3xxx): "Bauhelfer …handwerk" or "…helfer".
 *   - Otherwise: follow BERUFENET / KldB-style DE job titles where they
 *     exist; use M/F paired form (X/Xin) as the default.
 */

export default {
  // === Cluster: "Facharzt/Fachärztin" (10 codes) ===
  '29-1212.00': 'Facharzt für Kardiologie / Fachärztin für Kardiologie', // Cardiologists
  '29-1213.00': 'Facharzt für Dermatologie / Fachärztin für Dermatologie', // Dermatologists
  '29-1214.00': 'Notfallmediziner/Notfallmedizinerin', // Emergency Medicine Physicians
  '29-1217.00': 'Facharzt für Neurologie / Fachärztin für Neurologie', // Neurologists
  '29-1218.00': 'Frauenarzt/Frauenärztin', // Obstetricians and Gynecologists
  '29-1221.00': 'Kinderarzt/Kinderärztin', // Pediatricians, General
  '29-1223.00': 'Psychiater/Psychiaterin', // Psychiatrists
  '29-1229.03': 'Urologe/Urologin', // Urologists
  '29-1242.00': 'Orthopäde/Orthopädin', // Orthopedic Surgeons, Except Pediatric
  '29-1243.00': 'Kinderchirurg/Kinderchirurgin', // Pediatric Surgeons

  // === Cluster: "Optometrist/Optometristin" (4) ===
  '29-1041.00': 'Optometrist/Optometristin', // Optometrists (keeps the natural DE term)
  '29-1241.00': 'Augenarzt/Augenärztin', // Ophthalmologists, Except Pediatric
  '29-2057.00': 'Augenoptiker-Assistent/Augenoptiker-Assistentin', // Ophthalmic Medical Technicians
  '29-2099.05': 'Ophthalmologisch-technischer Assistent/Ophthalmologisch-technische Assistentin', // Ophthalmic Medical Technologists

  // === Cluster: "Arzt für Allgemeinmedizin" (4) ===
  '29-1171.00': 'Pflegeexperte/Pflegeexpertin', // Nurse Practitioners — DE-Äquivalent ist Advanced Practice Nurse, aber der APN-Zusatz stiftet mehr Verwirrung als er nützt
  '29-1215.00': 'Facharzt für Allgemeinmedizin / Fachärztin für Allgemeinmedizin', // Family Medicine Physicians
  '29-1229.02': 'Krankenhausarzt/Krankenhausärztin', // Hospitalists
  '29-1229.05': 'Facharzt für Öffentliches Gesundheitswesen / Fachärztin für Öffentliches Gesundheitswesen', // Preventive Medicine Physicians

  // === Cluster: "Kraftwerksmeister/Kraftwerksmeisterin" (3) ===
  '11-3051.04': 'Leiter Biomassekraftwerk / Leiterin Biomassekraftwerk', // Biomass Power Plant Managers
  '11-9199.09': 'Betriebsleiter Windpark / Betriebsleiterin Windpark', // Wind Energy Operations Managers
  '11-9199.10': 'Projektleiter Windenergie / Projektleiterin Windenergie', // Wind Energy Development Managers

  // === Cluster: "Regulatory-Affairs-Manager" (3) ===
  '11-9199.01': 'Zulassungsleiter/Zulassungsleiterin', // Regulatory Affairs Managers — batch-11 in-place: war "Leiter Regulatory Affairs" (hybrider Anglizismus); Zulassungsleiter ist DE-übliche Bezeichnung für RA-Mgmt-Tier
  '11-9199.02': 'Compliance-Manager/Compliance-Managerin', // Compliance Managers
  '13-1041.07': 'Regulatory-Affairs-Spezialist/Regulatory-Affairs-Spezialistin', // Regulatory Affairs Specialists

  // === Cluster: "Logistik-Analyst" (3) ===
  '13-1081.00': 'Logistiker/Logistikerin', // Logisticians
  '13-1081.02': 'Logistik-Analyst/Logistik-Analystin', // Logistics Analysts
  '15-2031.00': 'Operations-Research-Analyst/Operations-Research-Analystin', // Operations Research Analysts

  // === Cluster: "Umweltingenieur" (3) ===
  '17-2081.00': 'Umweltingenieur/Umweltingenieurin', // Environmental Engineers
  '19-2041.02': 'Planer Umweltsanierung / Planerin Umweltsanierung', // Environmental Restoration Planners
  '19-2041.03': 'Industrieökologe/Industrieökologin', // Industrial Ecologists

  // === Cluster: "Genetiker" (3) ===
  '19-1029.03': 'Genetiker/Genetikerin', // Geneticists
  '29-2011.01': 'Zytogenetisch-technische Assistenz', // Cytogenetic Technologists
  '29-9092.00': 'Genetischer Berater / Genetische Beraterin', // Genetic Counselors

  // === Cluster: "Hochschullehrkraft" (3) ===
  '25-1043.00': 'Hochschullehrkraft Forst- und Naturschutzwissenschaften', // Forestry and Conservation Science Teachers
  '25-1082.00': 'Hochschullehrkraft Bibliothekswissenschaft', // Library Science Teachers
  '25-1111.00': 'Hochschullehrkraft Kriminologie und Polizeiwissenschaft', // Criminal Justice Teachers

  // === Cluster: "Lehrkraft für Sprachschulen" (3) ===
  '25-1123.00': 'Hochschullehrkraft Anglistik', // English Language and Literature Teachers, Postsecondary
  '25-1124.00': 'Hochschullehrkraft Fremdsprachenphilologien', // Foreign Language and Literature Teachers, Postsecondary
  '25-2022.00': 'Lehrkraft Sekundarstufe I', // Middle School Teachers

  // === Cluster: "Archivar" (3) ===
  '25-4011.00': 'Archivar/Archivarin', // Archivists
  '25-4013.00': 'Museumstechniker und Restaurator / Museumstechnikerin und Restauratorin', // Museum Technicians and Conservators
  '43-4121.00': 'Bibliothekshilfskraft', // Library Assistants, Clerical (25-4031 already holds "Bibliotheksassistent")

  // === Cluster: "Zahntechniker/Zahntechnikerin" (3) ===
  '29-1023.00': 'Kieferorthopäde/Kieferorthopädin', // Orthodontists
  '29-1024.00': 'Fachzahnarzt für Zahnersatzkunde / Fachzahnärztin für Zahnersatzkunde', // Prosthodontists
  '51-9081.00': 'Zahntechniker/Zahntechnikerin', // Dental Laboratory Technicians

  // === Cluster: "Anästhesietechnischer Assistent" (3) ===
  '29-1071.01': 'Anästhesietechnischer Assistent/Anästhesietechnische Assistentin', // Anesthesiologist Assistants
  '29-1151.00': 'Fachkrankenpfleger Anästhesie / Fachkrankenpflegerin Anästhesie', // Nurse Anesthetists
  '29-1211.00': 'Facharzt für Anästhesiologie / Fachärztin für Anästhesiologie', // Anesthesiologists

  // === Cluster: "Medizinisch-technischer Assistent für radiologische Diagnostik" (3) ===
  '29-2032.00': 'MTA Sonografie', // Diagnostic Medical Sonographers
  '29-2034.00': 'MTA Radiologie', // Radiologic Technologists and Technicians
  '29-2099.01': 'MTA Neurodiagnostik', // Neurodiagnostic Technologists

  // === Cluster: "Pflegehelfer" (3) ===
  '29-2061.00': 'Krankenpflegeassistent/Krankenpflegeassistentin', // Licensed Practical and Licensed Vocational Nurses
  '29-9093.00': 'OP-Assistent/OP-Assistentin', // Surgical Assistants
  '31-1133.00': 'Pflegehelfer Psychiatrie / Pflegehelferin Psychiatrie', // Psychiatric Aides

  // === Cluster: "medizinischer Sekretär" (3) ===
  '29-2072.00': 'Medizinischer Dokumentar / Medizinische Dokumentarin', // Medical Records Specialists
  '31-9092.00': 'Medizinischer Fachangestellter / Medizinische Fachangestellte', // Medical Assistants (MFA)
  '43-6013.00': 'Sekretär im Gesundheitswesen / Sekretärin im Gesundheitswesen', // Medical Secretaries and Administrative Assistants

  // === Cluster: "Imbissmitarbeiter" (3) ===
  '35-2011.00': 'Imbisskoch/Imbissköchin', // Cooks, Fast Food
  '35-2015.00': 'Schnellgastronomie-Koch / Schnellgastronomie-Köchin', // Cooks, Short Order
  '35-3023.00': 'Mitarbeiter Systemgastronomie / Mitarbeiterin Systemgastronomie', // Fast Food and Counter Workers

  // === Cluster: "Büroassistent" (3) ===
  '43-4021.00': 'Sachbearbeiter Korrespondenz / Sachbearbeiterin Korrespondenz', // Correspondence Clerks
  '43-9061.00': 'Bürokraft (allgemein)', // Office Clerks, General
  '43-9071.00': 'Reprografiekraft', // Office Machine Operators (audit batch 9): war "Bürogerätemitarbeiter" (wortwörtliche Übersetzung) — "Reprografiekraft" ist DE-üblich für Kopierer-/Drucker-/Vervielfältigungs-Bediener

  // === Cluster: "Solartechniker" (3) ===
  '47-1011.03': 'Montageleiter Photovoltaik / Montageleiterin Photovoltaik', // Solar Energy Installation Managers
  '47-2152.04': 'Solarthermie-Installateur/Solarthermie-Installateurin', // Solar Thermal Installers and Technicians
  '47-2231.00': 'Photovoltaik-Monteur/Photovoltaik-Monteurin', // Solar Photovoltaic Installers

  // === Cluster: "Maurer" (3) ===
  '47-2021.00': 'Maurer/Maurerin', // Brickmasons and Blockmasons
  '47-2044.00': 'Fliesenleger/Fliesenlegerin', // Tile and Stone Setters
  '49-9045.00': 'Feuerfestbauer/Feuerfestbauerin', // Refractory Materials Repairers

  // === Cluster: "Erdbaumaschinenführer" (3) ===
  '47-2073.00': 'Baumaschinenführer/Baumaschinenführerin', // Operating Engineers and Other Construction Equipment Operators
  '47-5022.00': 'Bagger- und Lademaschinenführer Tagebau / Bagger- und Lademaschinenführerin Tagebau', // Excavating Machine Operators, Surface Mining
  '47-5044.00': 'Bergbau-Maschinenführer Untertage / Bergbau-Maschinenführerin Untertage', // Loading Machine Operators, Underground Mining

  // === Cluster: "Metallbauer – Konstruktionstechnik" (3) ===
  '47-2171.00': 'Betonstahlverleger/Betonstahlverlegerin', // Reinforcing Iron and Rebar Workers
  '47-2221.00': 'Stahlbauer/Stahlbauerin', // Structural Iron and Steel Workers
  '51-2041.00': 'Metallbauer Konstruktionstechnik / Metallbauerin Konstruktionstechnik', // Structural Metal Fabricators and Fitters

  // === Cluster: "Metallziehmaschinenbediener" (3) ===
  '51-4021.00': 'Maschinen- und Anlagenführer Strangpressen und Ziehen / Maschinen- und Anlagenführerin Strangpressen und Ziehen', // Extruding and Drawing Machine Setters
  '51-4022.00': 'Maschinen- und Anlagenführer Schmiedetechnik / Maschinen- und Anlagenführerin Schmiedetechnik', // Forging Machine Setters
  '51-4023.00': 'Maschinen- und Anlagenführer Walzwerk / Maschinen- und Anlagenführerin Walzwerk', // Rolling Machine Setters

  // === Cluster: "Technischer Modellbauer Fachrichtung Gießerei" (3) ===
  '51-4061.00': 'Technischer Modellbauer Metall und Kunststoff / Technische Modellbauerin Metall und Kunststoff', // Model Makers, Metal and Plastic
  '51-4062.00': 'Technischer Modellbauer Gießereimodelle / Technische Modellbauerin Gießereimodelle', // Patternmakers, Metal and Plastic — Gießerei-Urmodelle (Abgrenzung zu 51-4061 Anschauungs-/Designmodelle)
  '51-7032.00': 'Holzmodellbauer/Holzmodellbauerin', // Patternmakers, Wood

  // === Cluster: "Steuerer Ölpumpsysteme" (3) ===
  '51-8093.00': 'Anlagenfahrer Raffinerie / Anlagenfahrerin Raffinerie', // Petroleum Pump System Operators, Refinery
  '53-7073.00': 'Steuerer Förderpumpen / Steuererin Förderpumpen', // Wellhead Pumpers
  '53-7121.00': 'Verladeoperator Tank / Verladeoperatorin Tank', // Tank Car, Truck, and Ship Loaders

  // === Cluster: "Omnibusfahrer" (3) ===
  '53-3052.00': 'Omnibusfahrer/Omnibusfahrerin', // Bus Drivers, Transit and Intercity
  '53-3053.00': 'Shuttle- und Chauffeurfahrer/Shuttle- und Chauffeurfahrerin', // Shuttle Drivers and Chauffeurs
  '53-4041.00': 'U-Bahn- und Straßenbahnfahrer/U-Bahn- und Straßenbahnfahrerin', // Subway and Streetcar Operators

  // === Cluster: "Sicherheitsbeauftragter" (2) ===
  '11-3013.01': 'Leiter Sicherheit / Leiterin Sicherheit', // Security Managers
  '11-9199.08': 'Leiter Diebstahlprävention / Leiterin Diebstahlprävention', // Loss Prevention Managers

  // === Cluster: "Führungskraft im Personalwesen" (2) ===
  '11-3111.00': 'Leiter Vergütung und Zusatzleistungen / Leiterin Vergütung und Zusatzleistungen', // Compensation and Benefits Managers — "Benefits" = betriebliche Zusatzleistungen, nicht staatliche Sozialleistungen
  '11-3121.00': 'Personalleiter/Personalleiterin', // Human Resources Managers

  // === Cluster: "Leiter der betrieblichen Aus- und Weiterbildung" (2) ===
  '11-3131.00': 'Leiter Personalentwicklung / Leiterin Personalentwicklung', // Training and Development Managers
  '13-1151.00': 'Referent Personalentwicklung / Referentin Personalentwicklung', // Training and Development Specialists

  // === Cluster: "Führungskraft bei Bauprojekten" (2) ===
  '11-9021.00': 'Bauleiter/Bauleiterin', // Construction Managers
  '11-9041.00': 'Leiter Architektur- und Ingenieurbüro / Leiterin Architektur- und Ingenieurbüro', // Architectural and Engineering Managers

  // === Cluster: "Forschungsleiter" (2) ===
  '11-9121.00': 'Leiter naturwissenschaftliche Forschung / Leiterin naturwissenschaftliche Forschung', // Natural Sciences Managers
  '11-9121.01': 'Koordinator Klinische Studien / Koordinatorin Klinische Studien', // Clinical Research Coordinators

  // === Cluster: "Bestattungsleiter" (2) ===
  '11-9171.00': 'Leiter Bestattungsinstitut / Leiterin Bestattungsinstitut', // Funeral Home Managers
  '39-4031.00': 'Bestattungsfachkraft', // Morticians, Undertakers, and Funeral Arrangers

  // === Cluster: "Schadensregulierer" (2) ===
  '13-1031.00': 'Schadensachbearbeiter/Schadensachbearbeiterin', // Claims Adjusters, Examiners, and Investigators: war "Schadensregulierer" — kein etablierter Berufstitel; Schadensachbearbeiter ist die übliche DE-Berufsbezeichnung in Versicherungen
  '13-1032.00': 'Kfz-Schadensgutachter/Kfz-Schadensgutachterin', // Insurance Appraisers, Auto Damage

  // === Cluster: "Immobilienschätzer" (2) ===
  '13-1041.04': 'Regierungsinspektor/Regierungsinspektorin', // Government Property Inspectors: war "Inspekteur öffentliches Eigentum" — konstruiertes Kompositum, kein DE-Beruf; Regierungsinspektor ist Beamten-Titel im gehobenen Dienst (passt zur SOC Vertrags-/Regelungs-Compliance)
  '13-2023.00': 'Immobiliengutachter/Immobiliengutachterin', // Appraisers and Assessors of Real Estate

  // === Cluster: "Unternehmensanalyst" (2) ===
  '13-1111.00': 'Unternehmensberater/Unternehmensberaterin', // Management Analysts
  '15-2051.01': 'Business-Intelligence-Analyst/Business-Intelligence-Analystin', // Business Intelligence Analysts

  // === Cluster: "Arbeitsanalytiker" (2) ===
  '13-1141.00': 'Referent Vergütung und Stellenbewertung / Referentin Vergütung und Stellenbewertung', // Compensation, Benefits, Job Analysis Specialists
  '19-3032.00': 'Arbeits- und Organisationspsychologe / Arbeits- und Organisationspsychologin', // Industrial-Organizational Psychologists

  // === Cluster: "Kreditberater" (2) ===
  '13-2071.00': 'Schuldnerberater/Schuldnerberaterin', // Credit Counselors
  '43-4041.00': 'Sachbearbeiter Kreditprüfung / Sachbearbeiterin Kreditprüfung', // Credit Authorizers, Checkers, and Clerks

  // === Cluster: "Kreditsachbearbeiter" (2) ===
  '13-2072.00': 'Kreditsachbearbeiter/Kreditsachbearbeiterin', // Loan Officers
  '43-4131.00': 'Kreditantragsbearbeiter/Kreditantragsbearbeiterin', // Loan Interviewers and Clerks

  // === Cluster: "Leiter der klinischen Informatik" (2) ===
  '15-1211.01': 'Gesundheitsinformatiker/Gesundheitsinformatikerin', // Health Informatics Specialists
  '15-2051.02': 'Klinischer Datenmanager / Klinische Datenmanagerin', // Clinical Data Managers

  // === Cluster: "IKT-Sicherheitsberater" (2) ===
  '15-1212.00': 'IT-Sicherheitsanalyst/IT-Sicherheitsanalystin', // Information Security Analysts
  '15-1299.05': 'IT-Sicherheitsingenieur/IT-Sicherheitsingenieurin', // Information Security Engineers

  // === Cluster: "IT-Systemarchitekt" (2) ===
  '15-1241.00': 'Netzwerkarchitekt/Netzwerkarchitektin', // Computer Network Architects
  '15-1299.08': 'IT-Systemarchitekt/IT-Systemarchitektin', // Computer Systems Engineers/Architects

  // === Standalone: Blockchain Engineer (no DE label from ESCO) ===
  '15-1299.07': 'Blockchain-Entwickler/Blockchain-Entwicklerin', // Blockchain Engineers

  // === Standalone: Politiker (ESCO label "Regierungsmitglied" is too narrow — cabinet-only) ===
  '11-1031.00': 'Politiker/Politikerin', // Legislators — MPs, council members, elected officials

  // === Standalone: broader label for the service + recreation supervisor cluster ===
  '39-1014.00': 'Leiter/Leiterin Gastronomie und Freizeit', // First-Line Supervisors of Personal Service and Entertainment and Recreation Workers

  // === Standalone: German aviation-idiomatic label replaces "Purser/Purserette" ===
  '53-1044.00': 'Leitender Flugbegleiter / Leitende Flugbegleiterin', // First-Line Supervisors of Passenger Attendants

  // === Cluster: "Datenbankadministrator" (2) ===
  '15-1242.00': 'Datenbankadministrator/Datenbankadministratorin', // Database Administrators
  '15-1243.00': 'Datenbankarchitekt/Datenbankarchitektin', // Database Architects

  // === Cluster: "Softwareentwickler" (2) ===
  '15-1251.00': 'Anwendungsprogrammierer/Anwendungsprogrammiererin', // Computer Programmers
  '15-1252.00': 'Softwareentwickler/Softwareentwicklerin', // Software Developers

  // === Cluster: "Bioinformatiker" (2) ===
  '15-2099.01': 'Bioinformatik-Techniker/Bioinformatik-Technikerin', // Bioinformatics Technicians
  '19-1029.01': 'Bioinformatiker/Bioinformatikerin', // Bioinformatics Scientists

  // === Cluster: "Ingenieur Agrarwirtschaft" (2) ===
  '17-2021.00': 'Agraringenieur/Agraringenieurin', // Agricultural Engineers
  '19-4012.01': 'Techniker Präzisionslandwirtschaft / Technikerin Präzisionslandwirtschaft', // Precision Agriculture Technicians

  // === Cluster: "Ingenieur Sicherheit und Gesundheitsschutz" (2) ===
  '17-2111.00': 'Sicherheitsingenieur/Sicherheitsingenieurin', // Health and Safety Engineers
  '17-2112.01': 'Ergonomie-Ingenieur/Ergonomie-Ingenieurin', // Human Factors Engineers and Ergonomists

  // === Cluster: "Ingenieur Werkstofftechnik" (2) ===
  '17-2131.00': 'Werkstoffingenieur/Werkstoffingenieurin', // Materials Engineers
  '19-2032.00': 'Werkstoffwissenschaftler/Werkstoffwissenschaftlerin', // Materials Scientists

  // === Cluster: "Ingenieur für Nanotechnologie" (2) ===
  '17-2199.09': 'Nanosystem-Ingenieur/Nanosystem-Ingenieurin', // Nanosystems Engineers
  '17-3026.01': 'Nanotechnologie-Techniker/Nanotechnologie-Technikerin', // Nanotechnology Engineering Technologists

  // === Cluster: "Umweltschutztechniker" (2) ===
  '17-3025.00': 'Umwelttechniker Anlagentechnik / Umwelttechnikerin Anlagentechnik', // Environmental Engineering Technologists
  '19-4042.00': 'Umweltschutztechniker/Umweltschutztechnikerin', // Environmental Science and Protection Technicians

  // === Cluster: "Biochemiker" (2) ===
  '19-1021.00': 'Biochemiker/Biochemikerin', // Biochemists and Biophysicists
  '19-1029.02': 'Molekular- und Zellbiologe / Molekular- und Zellbiologin', // Molecular and Cellular Biologists

  // === Cluster: "Epidemiologe" (2) ===
  '19-1041.00': 'Epidemiologe/Epidemiologin', // Epidemiologists
  '29-1229.01': 'Facharzt für Allergologie und Immunologie / Fachärztin für Allergologie und Immunologie', // Allergists and Immunologists

  // === Cluster: "Fernerkundungstechniker" (2) ===
  '19-2099.01': 'Fernerkundungswissenschaftler/Fernerkundungswissenschaftlerin', // Remote Sensing Scientists (audit batch 10): Hyphen-mid-compound ist non-standard German; closed compound ist korrekt
  '19-4099.03': 'Fernerkundungstechniker/Fernerkundungstechnikerin', // Remote Sensing Technicians

  // === Cluster: "Psychologe" (2) ===
  '19-3033.00': 'Klinischer Psychologe / Klinische Psychologin', // Clinical and Counseling Psychologists
  '19-3039.02': 'Neuropsychologe/Neuropsychologin', // Neuropsychologists

  // === Cluster: "Sozialarbeiter im Bereich Rehabilitation" (2) ===
  '21-1015.00': 'Rehabilitationsberater/Rehabilitationsberaterin', // Rehabilitation Counselors
  '29-1122.01': 'Rehalehrer für Sehbehinderte / Rehalehrerin für Sehbehinderte', // Low Vision Therapists, Orientation and Mobility

  // === Cluster: "Klinischer Sozialarbeiter" (2) ===
  '21-1022.00': 'Sozialarbeiter im Gesundheitswesen / Sozialarbeiterin im Gesundheitswesen', // Healthcare Social Workers
  '21-1023.00': 'Sozialarbeiter Psychiatrie und Suchthilfe / Sozialarbeiterin Psychiatrie und Suchthilfe', // Mental Health and Substance Abuse Social Workers

  // === Cluster: "Hochschullehrkraft für Betriebswirtschaftslehre" (2) ===
  '25-1011.00': 'Hochschullehrkraft BWL', // Business Teachers, Postsecondary
  '25-1192.00': 'Hochschullehrkraft Haushalts- und Ernährungswissenschaften', // Family and Consumer Sciences Teachers, Postsecondary

  // === Cluster: "Hochschullehrkraft für Biologie" (2) ===
  '25-1042.00': 'Hochschullehrkraft Biologie', // Biological Science Teachers, Postsecondary
  '25-1053.00': 'Hochschullehrkraft Umweltwissenschaften', // Environmental Science Teachers, Postsecondary

  // === Cluster: "Hochschullehrkraft für Geschichte" (2) ===
  '25-1061.00': 'Hochschullehrkraft Anthropologie und Archäologie', // Anthropology and Archeology Teachers, Postsecondary
  '25-1125.00': 'Hochschullehrkraft Geschichte', // History Teachers, Postsecondary

  // === Cluster: "Lehrkraft im Bereich Berufsbildung" (2) ===
  '25-2023.00': 'Lehrkraft Berufsbildung Sekundarstufe I', // Career/Technical Education Teachers, Middle School
  '25-2032.00': 'Lehrkraft Berufsbildung Sekundarstufe II', // Career/Technical Education Teachers, Secondary School

  // === Cluster: "Lehrkraft Sekundarstufe" (2) ===
  '25-2031.00': 'Lehrkraft Sekundarstufe II / Lehrerin Sekundarstufe II', // Secondary School Teachers (Grades 9-12 = Oberstufe; parallels 25-2022 Sek. I)
  '25-3031.00': 'Vertretungslehrkraft', // Substitute Teachers, Short-Term

  // === Cluster: "mobiler Sonderpädagoge" (2) ===
  '25-2051.00': 'Sonderpädagoge Vorschule / Sonderpädagogin Vorschule', // Special Education Teachers, Preschool
  '25-2057.00': 'Sonderpädagoge Sekundarstufe I / Sonderpädagogin Sekundarstufe I', // Special Education Teachers, Middle School

  // === Cluster: "Sporttherapeut" (2) ===
  '25-2059.01': 'Sportlehrer für Menschen mit Behinderung / Sportlehrerin für Menschen mit Behinderung', // Adapted Physical Education Specialists
  '29-1229.06': 'Facharzt für Sportmedizin / Fachärztin für Sportmedizin', // Sports Medicine Physicians

  // === Cluster: "Lehrassistent Sonderpädagogik" (2) ===
  '25-9042.00': 'Schulassistenz Regelschule', // Teaching Assistants, Preschool/Elementary/Middle/Secondary
  '25-9043.00': 'Schulassistenz Sonderpädagogik', // Teaching Assistants, Special Education

  // === Cluster: "Gerichtsstenograf" (2) ===
  '27-3092.00': 'Gerichtsstenograf/Gerichtsstenografin', // Court Reporters and Simultaneous Captioners
  '43-4031.00': 'Justizfachangestellter/Justizfachangestellte', // Court, Municipal, and License Clerks

  // === Cluster: "Fotograf" (2) ===
  '27-4021.00': 'Fotograf/Fotografin', // Photographers
  '51-9151.00': 'Fachkraft Foto- und Medienlabor', // Photographic Process Workers

  // === Cluster: "Chiropraktiker" (2) ===
  '29-1011.00': 'Chiropraktiker/Chiropraktikerin', // Chiropractors
  '29-9091.00': 'Sportphysiotherapeut/Sportphysiotherapeutin', // Athletic Trainers

  // === Cluster: "Zahnarzt" (2) ===
  '29-1021.00': 'Zahnarzt/Zahnärztin', // Dentists, General
  '29-1022.00': 'Mund-, Kiefer- und Gesichtschirurg / Mund-, Kiefer- und Gesichtschirurgin', // Oral and Maxillofacial Surgeons

  // === Cluster: "Medizinischer Fachangestellter" (2) ===
  '29-1071.00': 'Physician Assistant (Arztassistent/Arztassistentin)', // Physician Assistants
  '29-2055.00': 'Operationstechnischer Assistent / Operationstechnische Assistentin', // Surgical Technologists

  // === Cluster: "Sprachtherapeut" (2) ===
  '29-1127.00': 'Logopäde/Logopädin', // Speech-Language Pathologists
  '31-9099.01': 'Logopädie-Assistent/Logopädie-Assistentin', // Speech-Language Pathology Assistants

  // === Cluster: "Krankenpfleger Allgemeine Krankenpflege" (2) ===
  '29-1141.00': 'Gesundheits- und Krankenpfleger / Gesundheits- und Krankenpflegerin', // Registered Nurses
  '29-1141.01': 'Fachkrankenpfleger Akutpflege / Fachkrankenpflegerin Akutpflege', // Acute Care Nurses

  // === Cluster: "Biomedizintechniker" (2) ===
  '29-1222.00': 'Facharzt für Pathologie / Fachärztin für Pathologie', // Physicians, Pathologists
  '29-2011.00': 'MTA Laboratoriumsmedizin', // Medical and Clinical Laboratory Technologists

  // === Cluster: "Röntgentechniker" (2) ===
  '29-1224.00': 'Facharzt für Radiologie / Fachärztin für Radiologie', // Radiologists
  '29-2035.00': 'MTA Magnetresonanztomografie', // Magnetic Resonance Imaging Technologists

  // === Cluster: "Akupunkteur" (2) ===
  '29-1291.00': 'Akupunkteur/Akupunkteurin', // Acupuncturists
  '29-1299.01': 'Heilpraktiker Naturheilkunde / Heilpraktikerin Naturheilkunde', // Naturopathic Physicians

  // === Cluster: "Zytologieassistent" (2) ===
  '29-2011.02': 'Zytologie-Assistent/Zytologie-Assistentin', // Cytotechnologists
  '29-2011.04': 'Histologie-Assistent/Histologie-Assistentin', // Histotechnologists

  // === Cluster: "Rettungshelfer" (2) ===
  '29-2042.00': 'Rettungssanitäter/Rettungssanitäterin', // Emergency Medical Technicians
  '53-3011.00': 'Krankentransporthelfer/Krankentransporthelferin', // Ambulance Drivers and Attendants

  // === Cluster: "Ergotherapieassistent" (2) ===
  '31-2011.00': 'Ergotherapieassistent/Ergotherapieassistentin', // Occupational Therapy Assistants
  '31-2012.00': 'Ergotherapiehelfer/Ergotherapiehelferin', // Occupational Therapy Aides

  // === Cluster: "Privatdetektiv" (2) ===
  '33-3021.00': 'Kommissar Kriminalpolizei / Kommissarin Kriminalpolizei', // Detectives and Criminal Investigators (33-3021.02 already holds "Kriminalbeamter")
  '33-9021.00': 'Privatdetektiv/Privatdetektivin', // Private Detectives and Investigators

  // === Cluster: "Wildhüter" (2) ===
  '33-3031.00': 'Jagd- und Fischereiaufseher/Jagd- und Fischereiaufseherin', // Fish and Game Wardens
  '45-3031.00': 'Berufsfischer und -jäger / Berufsfischerin und -jägerin', // Fishing and Hunting Workers

  // 33-3041.00 replaces informal "Ordnungshüter" with the concrete DE role
  // (O*NET description is parking enforcement, not general law enforcement).
  '33-3041.00': 'Mitarbeiter Verkehrsüberwachung / Mitarbeiterin Verkehrsüberwachung', // Parking Enforcement Workers

  // === Cluster: "Polizist" (2) ===
  '33-3051.00': 'Polizeibeamter Streifendienst / Polizeibeamtin Streifendienst', // Police and Sheriff's Patrol Officers
  '33-3052.00': 'Bahn- und Verkehrspolizist/Bahn- und Verkehrspolizistin', // Transit and Railroad Police

  // === Cluster: "Hilfskraft im Freizeit- und Erholungsbereich" (2) ===
  '39-3031.00': 'Einlasskontrolle und Saaldienst', // Ushers, Lobby Attendants, and Ticket Takers
  '39-3091.00': 'Mitarbeiter Freizeitpark / Mitarbeiterin Freizeitpark', // Amusement and Recreation Attendants

  // === Cluster: "Einbalsamierer" (2) ===
  '39-4011.00': 'Einbalsamierer/Einbalsamiererin', // Embalmers
  '39-4012.00': 'Kremationstechniker/Kremationstechnikerin', // Crematory Operators

  // === Cluster: "Hotelpförtner" (2) ===
  '39-6012.00': 'Concierge', // Concierges
  '43-4081.00': 'Hotelrezeptionist/Hotelrezeptionistin', // Hotel, Motel, and Resort Desk Clerks

  // === Cluster: "Reisevermittler" (2) ===
  '39-7012.00': 'Reiseleiter/Reiseleiterin', // Travel Guides
  '41-3041.00': 'Reisevermittler/Reisevermittlerin', // Travel Agents

  // === Cluster: "Casino-Kassierer" (2) ===
  '41-2012.00': 'Kassierer Spielbank / Kassiererin Spielbank', // Gambling Change Persons and Booth Cashiers
  '43-3041.00': 'Mitarbeiter Spielbankkasse / Mitarbeiterin Spielbankkasse', // Gambling Cage Workers

  // === Cluster: "Verkaufsberater für Solarenergie" (2) ===
  '41-3091.00': 'Vertriebsmitarbeiter Dienstleistungen / Vertriebsmitarbeiterin Dienstleistungen', // Sales Representatives of Services
  '41-4011.07': 'Vertriebsmitarbeiter Solarenergie / Vertriebsmitarbeiterin Solarenergie', // Solar Sales Representatives and Assessors

  // === Cluster: "Postabfertiger" (2) ===
  '43-5053.00': 'Postsortierer/Postsortiererin', // Postal Service Mail Sorters
  '43-9051.00': 'Poststellenmitarbeiter/Poststellenmitarbeiterin', // Mail Clerks and Mail Machine Operators

  // === Cluster: "Anwaltssekretär" (2) ===
  '43-6012.00': 'Rechtsanwaltsfachangestellter/Rechtsanwaltsfachangestellte', // Legal Secretaries and Administrative Assistants
  '43-6014.00': 'Sekretär/Sekretärin', // Secretaries and Administrative Assistants

  // === Cluster: "Aufsichtskraft Brückenbau" (2) ===
  '47-1011.00': 'Vorarbeiter Bau / Vorarbeiterin Bau', // First-Line Supervisors of Construction Trades
  '53-6011.00': 'Brücken- und Schleusenwärter/Brücken- und Schleusenwärterin', // Bridge and Lock Tenders

  // === Cluster: "Steinmetz" (2) ===
  '47-2022.00': 'Steinmetz/Steinmetzin', // Stonemasons
  '47-3011.00': 'Bauhelfer Maurer- und Steinmetzhandwerk / Bauhelferin Maurer- und Steinmetzhandwerk', // Helpers--Brickmasons, Blockmasons, Stonemasons

  // === Cluster: "Zimmerer" (2) ===
  '47-2031.00': 'Zimmerer/Zimmerin', // Carpenters
  '47-3012.00': 'Bauhelfer Zimmerei / Bauhelferin Zimmerei', // Helpers--Carpenters

  // === Cluster: "Holzschleifer" (2) ===
  '47-2043.00': 'Parkett- und Bodenschleifer/Parkett- und Bodenschleiferin', // Floor Sanders and Finishers
  '51-4033.00': 'Metallschleifer und -polierer / Metallschleiferin und -poliererin', // Grinding, Lapping, Polishing Machine Tool Setters

  // === Cluster: "Straßenbaumaschinenführer" (2) ===
  '47-2071.00': 'Straßenbaumaschinenführer/Straßenbaumaschinenführerin', // Paving, Surfacing, Tamping Equipment Operators
  '47-4091.00': 'Pflasterer/Pflasterin', // Segmental Pavers

  // === Cluster: "Industrieelektriker – Geräte und Systeme" (2) ===
  '47-2111.00': 'Elektroinstallateur/Elektroinstallateurin', // Electricians
  '47-3013.00': 'Helfer Elektrotechnik / Helferin Elektrotechnik', // Helpers--Electricians

  // === Cluster: "Isoliermonteur" (2) ===
  '47-2131.00': 'Bauisolierer Hochbau / Bauisoliererin Hochbau', // Insulation Workers, Floor, Ceiling, and Wall
  '47-2132.00': 'Wärme- und Kälteisolierer / Wärme- und Kälteisoliererin', // Insulation Workers, Mechanical

  // === Cluster: "Tapezierer" (2) ===
  '47-2142.00': 'Tapezierer/Tapeziererin', // Paperhangers
  '47-3014.00': 'Bauhelfer Maler- und Tapeziererhandwerk / Bauhelferin Maler- und Tapeziererhandwerk', // Helpers--Painters, Paperhangers, Plasterers

  // === Cluster: "Dachdecker" (2) ===
  '47-2181.00': 'Dachdecker/Dachdeckerin', // Roofers
  '47-3016.00': 'Dachdeckerhelfer/Dachdeckerhelferin', // Helpers--Roofers

  // === Cluster: "Schieneninstandhaltungstechniker" (2) ===
  '47-4061.00': 'Gleisbaumaschinenführer/Gleisbaumaschinenführerin', // Rail-Track Laying and Maintenance Equipment Operators
  '53-4022.00': 'Rangierbegleiter/Rangierbegleiterin', // Railroad Brake, Signal, and Switch Operators

  // === Cluster: "Berg- und Maschinenmann" (2) ===
  '47-5041.00': 'Bergbau-Maschinenführer Kohleabbau / Bergbau-Maschinenführerin Kohleabbau', // Continuous Mining Machine Operators
  '47-5043.00': 'Ankerbohrer Bergbau / Ankerbohrerin Bergbau', // Roof Bolters, Mining

  // === Cluster: "Kundendiensttechniker - Unterhaltungselektronik" (1) ===
  // 49-2094.00 moved to batch-6 ("Elektroniker für Betriebstechnik")
  '49-9061.00': 'Reparateur Foto- und Kameratechnik / Reparateurin Foto- und Kameratechnik', // Camera and Photographic Equipment Repairers

  // === Cluster: "Kraftfahrzeugmechatroniker Schwerpunkt Personenkraftwagentechnik" (2) ===
  '49-3023.00': 'Kfz-Mechatroniker Pkw / Kfz-Mechatronikerin Pkw', // Automotive Service Technicians and Mechanics
  '49-3052.00': 'Zweiradmechatroniker/Zweiradmechatronikerin', // Motorcycle Mechanics

  // === Cluster: "Schloss- und Schlüsselmacher" (1) ===
  // 49-9011.00 moved to batch-6 ("Monteur Tor- und Türtechnik")
  '49-9094.00': 'Schlüssel- und Tresorfachkraft', // Locksmiths and Safe Repairers

  // === Cluster: "Takler" (2) ===
  '49-9044.00': 'Industriemechaniker Montage / Industriemechanikerin Montage', // Millwrights
  '53-5011.00': 'Matrose/Matrosin', // Sailors and Marine Oilers

  // === Cluster: "Lebensmittelproduktionsmitarbeiter" (2) ===
  '51-3092.00': 'Lebensmittelproduktion Chargenherstellung', // Food Batchmakers
  '51-3093.00': 'Lebensmittelmaschinenführer/Lebensmittelmaschinenführerin', // Food Cooking Machine Operators

  // === Cluster: "Werkzeugbautechniker" (2) ===
  '51-4081.00': 'Mehrspindelmaschinen-Bediener/Mehrspindelmaschinen-Bedienerin', // Multiple Machine Tool Setters
  '51-4111.00': 'Werkzeugmechaniker/Werkzeugmechanikerin', // Tool and Die Makers

  // === Cluster: "Steuerer von Gasanlagen" (2) ===
  '51-8092.00': 'Anlagenfahrer Gasanlage / Anlagenfahrerin Gasanlage', // Gas Plant Operators
  '53-7071.00': 'Anlagenfahrer Gasversorgung / Anlagenfahrerin Gasversorgung', // Gas Compressor and Gas Pumping Station Operators (batch 5: war "Verdichter-Operator Gas", nicht idiomatisch DE)

  // === Cluster: "Flugbegleiter" (2) ===
  '53-2031.00': 'Flugbegleiter/Flugbegleiterin', // Flight Attendants
  '53-6061.00': 'Fahrgastbetreuer/Fahrgastbetreuerin', // Passenger Attendants

  // === Cluster: "Lieferfahrer" (2) ===
  '53-3031.00': 'Verkaufsfahrer/Verkaufsfahrerin', // Driver/Sales Workers
  '53-3033.00': 'Lieferfahrer/Lieferfahrerin', // Light Truck Drivers

  // Primary-null fills paired with the batch-3 KldB-override remap (2026-04-24).
  // These five codes had title.de=null + a wrong KldB container class; the
  // KldB side is fixed in kldb-overrides.mjs batch 3, and without a concrete
  // DE title the primary display would still read as the (now correct)
  // category phrase ("Bauplanung und -überwachung", "Markt- und
  // Meinungsforschung", …) instead of a job name. Coupled here.
  '11-3051.02': 'Leiter Geothermiekraftwerk / Leiterin Geothermiekraftwerk', // Geothermal Production Managers
  '17-2051.00': 'Bauingenieur/Bauingenieurin', // Civil Engineers
  '17-2141.01': 'Brennstoffzellen-Ingenieur / Brennstoffzellen-Ingenieurin', // Fuel Cell Engineers
  '29-2036.00': 'Medizinphysiker Dosimetrie / Medizinphysikerin Dosimetrie', // Medical Dosimetrists
  '43-4111.00': 'Interviewer/Interviewerin', // Interviewers, Except Eligibility and Loan

  // === Cluster-C batch 1: primary-null fills (2026-04-24, extended 2026-04-25) ===
  // 27 codes where title.de was null from ESCO. Mix of (i) codes with real
  // DE-Ausbildungsberuf equivalents where ESCO had no mapped preferredLabel.de
  // (MTRA Strahlentherapie, Patientenfuersprecher, Vermessungsingenieur, …)
  // and (ii) genuinely US-taxonomy-specific roles where no 1:1 DE equivalent
  // exists — best-effort nearest approximation (13-1074.00 Farm Labor
  // Contractors falls in (ii); kept as a single-line approximation rather
  // than the previously-planned filter mechanism, per browser-test scope
  // call).
  '11-9131.00': 'Poststellenleiter/Poststellenleiterin', // Postmasters and Mail Superintendents — batch-11 in-place: war "Postdirektor" (bürokratischer Beamtentitel) — Poststellenleiter ist heute übliche Berufsbezeichnung
  '11-9199.11': 'Projektleiter Altlastensanierung / Projektleiterin Altlastensanierung', // Brownfield Redevelopment Specialists and Site Managers
  '13-1022.00': 'Einkäufer/Einkäuferin', // Wholesale and Retail Buyers, Except Farm Products
  '13-1074.00': 'Arbeitsvermittler Landwirtschaft / Arbeitsvermittlerin Landwirtschaft', // Farm Labor Contractors: war "Saisonkräfte-Vermittler Landwirtschaft" — konstruiertes Kompositum; Arbeitsvermittler ist der etablierte DE-Beruf, "Landwirtschaft" als Domain-Klammer (US-taxonomy, no 1:1 DE)
  // 15-1299.03 Document Management Specialists title moved to batch-4 block (FaMI ist Bibliotheks-/Archiv-Ausbildungsberuf, SOC ist Enterprise-DMS — siehe Audit batch 4)
  '17-1022.01': 'Vermessungsingenieur Landesvermessung / Vermessungsingenieurin Landesvermessung', // Geodetic Surveyors
  '23-1022.00': 'Mediator/Mediatorin', // Arbitrators, Mediators, and Conciliators
  '25-9021.00': 'Haushalts- und Landwirtschaftsberater/Haushalts- und Landwirtschaftsberaterin', // Farm and Home Management Educators
  '27-4011.00': 'Audio- und Videotechniker/Audio- und Videotechnikerin', // Audio and Video Technicians
  '29-1124.00': 'MTRA Strahlentherapie', // Radiation Therapists (konsistent mit 29-2034 "MTA Radiologie" / 29-2035 "MTA MRT")
  '29-2099.08': 'Patientenfürsprecher/Patientenfürsprecherin', // Patient Representatives (gesetzlich in KH-Gesetzen verankert)
  '31-9099.02': 'Endoskopie-Fachassistent/Endoskopie-Fachassistentin', // Endoscopy Technicians (DEGEA-Zertifikat)
  '33-9099.02': 'Ladendetektiv/Ladendetektivin', // Retail Loss Prevention Specialists
  '35-9011.00': 'Servicekraft Gastronomie', // Dining Room and Cafeteria Attendants and Bartender Helpers
  '35-9031.00': 'Oberkellner/Oberkellnerin', // Hosts and Hostesses, Restaurant, Lounge, and Coffee Shop
  '39-1022.00': 'Teamleiter Dienstleistungsberufe / Teamleiterin Dienstleistungsberufe', // First-Line Supervisors of Personal Service Workers
  '43-3061.00': 'Sachbearbeiter Einkauf / Sachbearbeiterin Einkauf', // Procurement Clerks
  '47-2082.00': 'Trockenbauspachtler/Trockenbauspachtlerin', // Tapers
  '47-4099.03': 'Energiesanierer/Energiesaniererin', // Weatherization Installers and Technicians
  '49-2097.00': 'Installateur Audio- und Videotechnik / Installateurin Audio- und Videotechnik', // Audiovisual Equipment Installers and Repairers
  '49-9081.00': 'Servicetechniker Windenergie / Servicetechnikerin Windenergie', // Wind Turbine Service Technicians
  '49-9098.00': 'Helfer Instandhaltung / Helferin Instandhaltung', // Helpers--Installation, Maintenance, and Repair Workers
  '49-9099.01': 'Geothermie-Techniker/Geothermie-Technikerin', // Geothermal Technicians
  '51-4192.00': 'Anreißer Metall- und Kunststoffbearbeitung / Anreißerin Metall- und Kunststoffbearbeitung', // Layout Workers, Metal and Plastic
  '51-8099.01': 'Biokraftstoff-Verfahrenstechniker/Biokraftstoff-Verfahrenstechnikerin', // Biofuels Processing Technicians
  '53-6041.00': 'Verkehrstechniker/Verkehrstechnikerin', // Traffic Technicians
  '53-7011.00': 'Förderbandbediener/Förderbandbedienerin', // Conveyor Operators and Tenders

  // === Cluster-C batch 1: ESCO-raw corrections (2026-04-24) ===
  // 23 codes where ESCO's preferredLabel.de was wrong, too narrow, grammatically
  // broken, or an un-translated Anglicism. Surfaced via Session-26-28 browser
  // tests (18 codes) + a heuristic filter pass this session (5 additional).
  // See SUMMARY session entry for per-code rationale.
  '13-2053.00': 'Risikoprüfer Versicherung / Risikoprüferin Versicherung', // Insurance Underwriters: was "Underwriter im Versicherungswesen"
  '13-2054.00': 'Risikoanalyst Finanzen / Risikoanalystin Finanzen', // Financial Risk Specialists: was "Financial Risk Analyst" (ESCO-raw)
  '13-2099.01': 'Quantitativer Finanzanalyst / Quantitative Finanzanalystin', // Financial Quantitative Analysts: was "Investment Analyst" (wrong domain)
  '17-3011.00': 'Bauzeichner/Bauzeichnerin', // Architectural and Civil Drafters: was "CAD-Bediener" (IHK-Ausbildungsberuf passt exakt)
  '19-3091.00': 'Anthropologe und Archäologe / Anthropologin und Archäologin', // Anthropologists and Archeologists: Archäologe-Hälfte fehlte
  '25-9031.00': 'Bildungsreferent/Bildungsreferentin', // Instructional Coordinators: was "Instruktionsdesigner"
  '27-2012.04': 'Casting Director / Casting Directorin', // Talent Directors: ESCO hatte nur "Casting Director" ohne Fem-Form
  '27-4031.00': 'Kameramann/Kamerafrau', // Camera Operators: was "Kameraschwenker"
  '29-1031.00': 'Ernährungsberater/Ernährungsberaterin', // Dietitians and Nutritionists: war "Futtermittelwissenschaftler" (grob falsch). "Diätassistent" kollidiert mit 29-2051.00.
  '29-2052.00': 'Pharmazeutisch-technischer Assistent / Pharmazeutisch-technische Assistentin', // Pharmacy Technicians: Grammatikfehler bei Mask-Form ("Pharmazeutisch-technische" statt "-technischer")
  '29-2091.00': 'Orthopädietechniker/Orthopädietechnikerin', // Orthotists and Prosthetists: war "Orthopädist" (veraltet)
  '31-9097.00': 'Fachkraft Blutentnahme', // Phlebotomists: war "Blutabnehmer" (colloquial). 31-9092.00 hält bereits MFA, "Fachkraft Blutentnahme" grenzt sauber ab.
  '41-3031.00': 'Wertpapierhändler/Wertpapierhändlerin', // Securities/Commodities Sales Agents: war "Warenmakler"
  '43-5051.00': 'Postschalterangestellter/Postschalterangestellte', // Postal Service Clerks: war "Postschalterbediensteter" (altmodisch). Kein moderner Ausbildungsberuf für diese enge Rolle.
  '43-5071.00': 'Fachkraft für Lagerlogistik', // Shipping, Receiving, and Inventory Clerks: war "Warenlagerverwalter" (veraltet; Fachkraft für Lagerlogistik ist IHK-Ausbildungsberuf, genderneutral)
  '49-3042.00': 'Land- und Baumaschinenmechatroniker/Land- und Baumaschinenmechatronikerin', // Mobile Heavy Equipment Mechanics: war "Berg- und Maschinenmann" (Bergbau-Domain, falsches Berufsfeld — IHK-Ausbildungsberuf passt exakt)
  '49-9071.00': 'Wartungsmonteur/Wartungsmonteurin', // Maintenance and Repair Workers, General: war "Gelegenheitsarbeiter" (prekär-klingend)
  '51-2031.00': 'Maschinen- und Motorenmonteur / Maschinen- und Motorenmonteurin', // Engine and Other Machine Assemblers: war "Fluggerätemechaniker für Gasturbinen-Triebwerke" (zu eng aircraft-fokussiert; 49-3011.00 hält Fluggerätemechaniker)
  '51-4031.00': 'Maschinen- und Anlagenführer Metall- und Kunststofftechnik / Maschinen- und Anlagenführerin Metall- und Kunststofftechnik', // Cutting, Punching, and Press Machine Setters: war "Maschinenbediener für Ständerbohrmaschine" (viel zu eng; IHK-Ausbildungsberuf deckt das komplette SOC ab)
  '51-4041.00': 'Zerspanungsmechaniker/Zerspanungsmechanikerin', // Machinists: war "Zerspanungsmechaniker im Getriebebau" (Spezialisierung entfernt, analog zur 51-8013-Generalisierung)
  '51-4072.00': 'Formgießmaschinenführer/Formgießmaschinenführerin', // Molding, Coremaking, and Casting Machine: Typo-Fix "Fom" → "Form"
  '51-6092.00': 'Modellmacher Bekleidung / Modellmacherin Bekleidung', // Fabric and Apparel Patternmakers: war "…Modelleur/…Direktrice" (Fem-Form-Stilbruch mit archaischem Begriff)
  '51-8013.00': 'Kraftwerker/Kraftwerkerin', // Power Plant Operators: war "Steuerer von Geothermiekraftwerken" (Spezialisierung entfernt; .03/.04 halten Biomass/Hydro, 11-3051.02/49-9099.01 halten Geothermie)

  // === Cluster-A batch 4 — coupled title fix (2026-04-24) ===
  // Paired with the kldb-overrides batch-4 remap of 33-3021.06 to 53223
  // Kriminaldienst. The ESCO-raw "Mitarbeiter im Bereich Informations-
  // gewinnung" obscures the role; "Kriminalanalyst" is the etablierter
  // BKA-/LKA-Begriff and matches the Kriminaldienst-Klasse.
  '33-3021.06': 'Kriminalanalyst/Kriminalanalystin', // Intelligence Analysts: war "Mitarbeiter im Bereich Informationsgewinnung"

  // === Cluster-A batch 5 — coupled title fix (2026-04-25) ===
  // 19-4012.00 sits correctly at KldB 11132 Berufe im landwirtschaftlich-
  // technischen Laboratorium (the SOC content is lab-centric: collect
  // samples, prepare specimens, maintain lab equipment, assist with
  // experiments). The ESCO-raw "Agrartechniker" reads colloquially as
  // production-/Maschinen-tech, not lab-tech. "Landwirtschaftlich-
  // technischer Assistent" (LTA) is the established DE-Berufsbild
  // (2-jährige Berufsfachschule, passt zur Anf-2-Klasse).
  '19-4012.00': 'Landwirtschaftlich-technischer Assistent / Landwirtschaftlich-technische Assistentin', // Agricultural Technicians: war "Agrartechniker" (zu allgemein, suggeriert Maschinen-/Produktionstechnik)
  '19-4099.01': 'Qualitätsprüfer/Qualitätsprüferin', // Quality Control Analysts: war "Labortechniker Schuhwarenqualitätskontrolle" (ESCO-Label hat sich auf Schuhwaren-Spezialisierung verengt; SOC-Description ist branchenneutral)
  '11-3051.01': 'Qualitätsmanager/Qualitätsmanagerin', // Quality Control Systems Managers: war "Fachkraft für Qualitätssicherung und -management Bau" (Bau-Spezialisierung war ESCO-Drift, SOC ist branchenneutraler QS-Manager)
  '15-1253.00': 'Softwaretester/Softwaretesterin', // Software Quality Assurance Analysts and Testers: war "Softwareprüfer" (klingt bürokratisch-altmodisch; "Softwaretester" ist der etablierte Berufsbild-Name in der DE-IT-Industrie)
  '13-2022.00': 'Kunstsachverständiger/Kunstsachverständige', // Appraisers of Personal and Business Property: war "Sachwertspezialist" — ungebräuchlich; "Kunstsachverständiger" matcht KldB-Klasse und deckt jewelry/art/antiques/collectibles
  '31-9094.00': 'Medizinische Schreibkraft', // Medical Transcriptionists: war "medizinische Schreibkraft" — Capitalize-Fix
  '29-1141.03': 'Fachkrankenpfleger Intensivpflege / Fachkrankenpflegerin Intensivpflege', // Critical Care Nurses: war "Akademischer Krankenpfleger / Akademische Krankenschwester" — "akademisch" trifft das Berufsbild nicht; Intensivpflege-Fachkrankenpflege ist die etablierte DE-Bezeichnung
  '19-3022.00': 'Marktforscher/Marktforscherin', // Survey Researchers: war "Interviewer im Bereich Umfragen" — Survey Researchers DESIGNen Umfragen (nicht nur durchführen); "Marktforscher" ist der DE-Berufsbild-Begriff
  '43-4171.00': 'Empfangsmitarbeiter/Empfangsmitarbeiterin', // Receptionists and Information Clerks: war "Kundeninformationsfachkraft" — sperrig; "Empfangsmitarbeiter" deckt sowohl Receptionists als auch Information Clerks
  '13-1199.04': 'Business Continuity Manager / Business Continuity Managerin', // Business Continuity Planners: war "Analytiker für IT-Notfallwiederherstellung" — BCM ist organisationsübergreifend (nicht nur IT); etablierter Anglizismus in DE-BCM-Kreisen
  '43-5031.00': 'Disponent Notrufleitstelle / Disponentin Notrufleitstelle', // Public Safety Telecommunicators: war "Notruftelefonist" — Telefonist trifft die Disposition-/Koordinations-Komponente nicht; "Disponent Notrufleitstelle" ist DE-üblich

  // === Audit batch 1 — SOC 21+45 coupled title fixes (2026-04-25) ===
  // From the 10-agent audit (full output in scripts/audit/findings-2026-04-25.json).
  '21-2021.00': 'Gemeindereferent/Gemeindereferentin', // Directors of Religious Activities: war "Missionar" — zu eng, SOC umfasst Programm-Koordination und Religionspädagogik, nicht nur Mission
  '45-1011.00': 'Aufsichtskraft Land- und Forstwirtschaft', // First-Line Supervisors Farming/Fishing/Forestry: war "Führungskraft für die Ernte aquatischer Organismen" — wörtliche Übersetzung, übergeneralisiert die Aquakultur-Nische auf die gesamte Supervisor-Klasse
  '45-2041.00': 'Sortierer/Sortiererin landwirtschaftlicher Produkte', // Graders and Sorters of Agricultural Products: war "Milchkontrolleur" — zu eng (SOC umfasst alle Agrarprodukte nach Größe/Gewicht/Farbe/Zustand) und falsche Tätigkeit; Kontrolleur-Rolle sitzt bei 45-2011 Agricultural Inspectors
  '45-2093.00': 'Tierwirt/Tierwirtin', // Farmworkers Farm/Ranch/Aquacultural Animals: war "Zuchtassistent Aquakultur" — zu eng; Tierwirt ist staatlich anerkannter Ausbildungsberuf (Rinder/Schafe/Geflügel/Aquakultur)
  '45-4021.00': 'Forstwirt/Forstwirtin', // Fallers: war "Schrotsägenführer" — archaisch; Forstwirt ist 3-jähriger Ausbildungsberuf, deckt Bäume-Fällen mit Axt/Motorsäge ab. Helfer-Tier "Waldarbeiter" sitzt korrekt bei 45-4011 Forest and Conservation Workers (KldB 11711 Forstwirtschaft Helfer)

  // === Audit batch 2 — SOC 31+33 coupled title fixes (2026-04-25) ===
  '31-1122.00': 'Alltagsbegleiter/Alltagsbegleiterin', // Personal Care Aides: war "Sozialbetreuer häusliche Betreuung" — Alltagsbegleiter ist etabliertes Berufsbild (§43b SGB XI Betreuungsassistent)
  '31-1131.00': 'Pflegeassistent/Pflegeassistentin', // Nursing Assistants: war "Gesundheits- und Krankenpfleger/Krankenschwester" — Title impliziert die geschützte 3-jährige Ausbildung; Nursing Assistants sind Helfer-Tier (KldB 81301 Anf 1 stays correct)
  '31-1132.00': 'Patientenbegleiter/Patientenbegleiterin', // Orderlies: war "Krankenträger" — archaisch; moderner Begriff für Patiententransport innerhalb Krankenhaus
  '31-2021.00': 'Physiotherapieassistent/Physiotherapieassistentin', // PT Assistants: war "Therapeut Komplementärmedizin" — PT-Assistant assistiert Physiotherapeut, nicht Heilpraktiker (war auch falsche KldB)
  '33-1011.00': 'Dienstgruppenleiter Justizvollzug / Dienstgruppenleiterin Justizvollzug', // First-Line Supervisors of Correctional Officers: war "Gefängnisdirektor" — Direktor ist Anstaltsleiter (höher als First-Line Supervisor); Dienstgruppenleiter trifft die mittlere Führungsebene
  '33-1012.00': 'Polizeihauptkommissar/Polizeihauptkommissarin', // First-Line Supervisors of Police: war "Polizeipräsident" — Präsident ist Behördenleiter (z.B. PP Berlin); Polizeihauptkommissar ist die Standard-Dienstbezeichnung am Dienstgruppenleiter-Tier (gehobener Dienst)
  '33-1021.00': 'Brandinspektor/Brandinspektorin', // First-Line Supervisors of Firefighters: war "Feuerwehrkommandant" — Kommandant ist in DE der Wehrleiter einer Freiwilligen Feuerwehr; Brandinspektor ist die Dienstbezeichnung am gehobenen-Dienst-/Zugführer-Tier in der Berufsfeuerwehr
  '33-1091.00': 'Einsatzleiter Sicherheitsdienst / Einsatzleiterin Sicherheitsdienst', // First-Line Supervisors of Security Workers: war "Sicherheitspersonalmanager" — Kunstwort; Einsatzleiter trifft die operative Schichtleitung (Sicherheitsdienstleiter würde Firmen-CEO suggerieren)
  '33-9092.00': 'Rettungsschwimmer/Rettungsschwimmerin', // Lifeguards/Ski Patrol: war "Beamter der Küstenwache" — wildly falsch; Lifeguards sind Rettungsschwimmer (Ski Patrol ist im DE-Kontext rare Nische)
  '33-9094.00': 'Schulbusbegleiter/Schulbusbegleiterin', // School Bus Monitors: war "Schulbusbegleiter" — fehlende feminine Form ergänzt

  // === Audit batch 3 — SOC 23+37+35 coupled title fixes (2026-04-25) ===
  '37-1012.00': 'Vorarbeiter im Garten- und Landschaftsbau / Vorarbeiterin im Garten- und Landschaftsbau', // First-Line Supervisors Landscaping/Lawn/Groundskeeping: war "Produktionsleiter im Bereich Gartenbau" — industriell-schief; Vorarbeiter ist der etablierte DE-Titel auf Aufsichtskraft-Tier im GaLaBau
  '37-3011.00': 'Garten- und Landschaftspfleger/Garten- und Landschaftspflegerin', // Landscaping and Groundskeeping Workers: war "Rasenpfleger" — zu eng (SOC umfasst Bäume, Sträucher, Beete, allgemeine Pflege)
  '37-3012.00': 'Mitarbeiter im Pflanzenschutz / Mitarbeiterin im Pflanzenschutz', // Pesticide Handlers Vegetation: war "Mitarbeiter für die Pestizidausbringung" — sperrige Wort-für-Wort-Übersetzung; Pflanzenschutz ist der etablierte DE-Sektor-Begriff (signalisiert Pflanzen, nicht Tiere/Schädlingsbekämpfung)
  '35-1012.00': 'Schichtleiter Gastronomie / Schichtleiterin Gastronomie', // First-Line Supervisors of Food Prep/Serving: war "Schnellrestaurantteamleiter" — Kompositum-Klotz und zu eng (SOC umfasst Restaurants, Mensen, Cafeterien, nicht nur Schnellrestaurant); Schichtleiter Gastronomie deckt das KldB-63393-Spektrum ab
  '35-2012.00': 'Großküchenkoch/Großküchenköchin', // Cooks Institution and Cafeteria: war "Diätkoch" — Diätkoch ist Zusatzqualifikation, nicht der Standard für Mensa/Krankenhaus/Heim-Küche; Großküchenkoch ist alltagstauglich und deckt SOC-Scope (Gemeinschaftsverpflegung) ab

  // === Audit batch 4 — SOC 41+15 coupled title fixes (2026-04-25) ===
  '15-1232.00': 'IT-Support-Spezialist/IT-Support-Spezialistin', // Computer User Support Specialists: war "IT-Helpdesk-Manager" — Manager-Endung suggeriert Führung, SOC ist End-User-Support; Anf 2 bestätigt vom Audit
  '15-1254.00': 'Web-Entwickler/Web-Entwicklerin', // Web Developers: war "Web-Designer" — zwei verschiedene Berufe (Developer programmiert, Designer gestaltet)
  '15-1299.03': 'Dokumentenmanagement-Spezialist/Dokumentenmanagement-Spezialistin', // Document Management Specialists: war "Fachangestellter für Medien- und Informationsdienste" (FaMI ist 3-jähriger IHK-Ausbildungsberuf für Bibliothek/Archiv, Anf 2) — SOC ist Enterprise-DMS-Implementierer (SharePoint/OpenText/Documentum), IT-Spezialist Anf 3
  '41-1011.00': 'Filialleiter Einzelhandel/Filialleiterin Einzelhandel', // First-Line Supervisors Retail Sales: war "Leiter eines Bekleidungsgeschäftes" — zu eng (SOC umfasst alle Einzelhandelsfilialen) und unidiomatisch für Aufsichtskraft-Tier
  '41-1012.00': 'Teamleiter Vertrieb / Teamleiterin Vertrieb', // First-Line Supervisors Non-Retail Sales: war "Ladenmanager" — SOC ist B2B Non-Retail, kein "Laden"; Teamleiter Vertrieb ist eindeutige Anf-3-Mid-Tier-Bezeichnung (Vertriebsleiter wäre ambig zwischen Anf 3 und 4)
  '41-4011.00': 'Technischer Vertriebsmitarbeiter / Technische Vertriebsmitarbeiterin', // Sales Reps Wholesale/Manufacturing Technical/Scientific Products: war "Fachkraft im Bereich Vertrieb" — sehr generisch; technischer Vertrieb ist der etablierte DE-Begriff
  '41-9012.00': 'Model/Fotomodell', // Models: war "Modell für Künstler" — zu eng (impliziert Aktmodell), SOC umfasst Fashion-/Werbe-/Fitness-Models
  '41-9021.00': 'Immobilienmakler/Immobilienmaklerin', // Real Estate Brokers: war "Immobilienhändler" — klingt nach privatem Trader; Immobilienmakler ist die etablierte Berufsbezeichnung

  // === Audit batch 5 — SOC 25 Education coupled title fixes (2026-04-25) ===
  '25-1062.00': 'Hochschullehrkraft für Kultur- und Sozialwissenschaften', // Area, Ethnic, and Cultural Studies Teachers Postsec.: war "Hochschullehrkraft für Anthropologie" — zu eng, SOC umfasst Latino/Women's/Ethnic/Cultural Studies
  '25-1064.00': 'Hochschullehrkraft für Geografie/Erdkunde', // Geography Teachers Postsecondary: war "Lehrkraft für Erdkunde/Geografie Sekundarstufe" — Postsecondary = Hochschule, nicht Sekundarstufe
  '25-1121.00': 'Hochschullehrkraft Kunst, Drama und Musik', // Art, Drama, and Music Teachers Postsecondary: war "Kunsterzieher Sekundarstufe" — Postsec; SOC umfasst Kunst+Drama+Musik kombiniert
  '25-1193.00': 'Hochschullehrkraft für Sportwissenschaft', // Recreation and Fitness Studies Teachers Postsec.: war "Ausbilder für Sportinstruktoren" — kein etablierter Beruf; Sportwissenschaft ist das DE-Hochschulfach
  '25-1194.00': 'Lehrkraft für berufsbildende Fächer', // Career/Technical Education Teachers Postsec.: war "Lehrkraft für industriell gefertigte Kunst" (sinnloseübersetzung von Career/Technical Education); KldB 84213 bleibt
  '25-2011.00': 'Erzieher/Erzieherin', // Preschool Teachers Except SpEd: war "Lehrkraft für Freinet-Schulen" (Reformpädagogik-Methode, kein Beruf); Erzieher ist der etablierte DE-Vorschul-/Kita-Beruf
  '25-3011.00': 'Lehrkraft für Grundbildung und Alphabetisierung', // Adult Basic Ed / ESL: war "Lehrkraft für Erwachsenenalphabetisierung" — zu eng (SOC umfasst Alphabetisierung + ESL + Hauptschulabschluss-Nachholen)
  '25-3021.00': 'Kursleiter/Kursleiterin Freizeitbildung', // Self-Enrichment Teachers: war "Lebensberater/Lebensberaterin" (Eso-Konnotation in DE — Tarot/Astrologie/Lebenshilfe-Praxis); Self-Enrichment = Hobby/VHS-Kurslehrer (Yoga, Töpfern, Foto, Bridge)

  // === Audit batch 6 — SOC 49 Maintenance/Repair coupled title fixes (2026-04-25) ===
  '49-1011.00': 'Werkstattleiter Maschinenbau / Werkstattleiterin Maschinenbau', // First-Line Supervisors of Mechanics/Installers/Repairers: war "Produktionsleiter Feinwerkmechanik" — zu eng (Feinwerk) und Produktionsleiter ist Industrie-Führung, nicht Aufsichtskraft-Tier; Werkstattleiter passt zum Aufsichtskraft-Pattern (analog 33-1011/12, 37-1011/12, 35-1012, 41-1011/12)
  '49-2093.00': 'Fahrzeugelektroniker (Mobile Systeme) / Fahrzeugelektronikerin (Mobile Systeme)', // Electronics Installers/Repairers Transportation: war "Schiffselektrotechniker" — zu eng (SOC umfasst Züge, Schiffe, andere mobile Systeme), nicht nur Schiff
  '49-2094.00': 'Elektroniker für Betriebstechnik / Elektronikerin für Betriebstechnik', // Industrial Electronics Repairers: war "Elektroniker Gewerbliche Geräte" — kein etablierter Ausbildungsberuf; Elektroniker für Betriebstechnik ist 3,5-Jahre IHK-Beruf für Industrie-/Gebäudeelektronik
  '49-2095.00': 'Elektrotechniker Energieanlagen / Elektrotechnikerin Energieanlagen', // Powerhouse/Substation/Relay Repairers: war "Steuerer Stromversorgung" — "Steuerer" grammatisch falsch und ungebräuchlich
  '49-3021.00': 'Karosserie- und Fahrzeugbaumechaniker / Karosserie- und Fahrzeugbaumechanikerin', // Automotive Body Repairers: war "Oldtimerrestaurator" — Oldtimer-Spezialisierung ist Nische, SOC umfasst alle Karosseriereparaturen; Karosserie- und Fahrzeugbaumechaniker ist der etablierte IHK-Ausbildungsberuf
  '49-3031.00': 'Nutzfahrzeugmechatroniker/Nutzfahrzeugmechatronikerin', // Bus and Truck Mechanics and Diesel Engine Specialists: war "Kfz-Motorenbauer" — kein etablierter Ausbildungsberuf; Nutzfahrzeugmechatroniker ist staatlich anerkannter Ausbildungsberuf seit 2007
  '49-3053.00': 'Motorgerätemechaniker/Motorgerätemechanikerin', // Outdoor Power Equipment / Small Engine Mechanics: war "Elektroniker für Maschinen und Antriebstechnik" — das ist ein Industrie-Elektronik-Beruf; SOC ist Rasenmäher-/Kettensägen-Mechaniker (Motorgerätemechaniker ist der etablierte Ausbildungsberuf seit 2007)
  '49-9011.00': 'Monteur Tor- und Türtechnik / Monteurin Tor- und Türtechnik', // Mechanical Door Repairers: war "Reparateur Türmechanik" — ungebräuchlich; Monteur Tor- und Türtechnik trifft den Berufsbild (Automatiktüren, Garagentore, Industrietore)
  '49-9062.00': 'Medizintechniker/Medizintechnikerin', // Medical Equipment Repairers: war "Biomedizinischer Ingenieur" — Ingenieur impliziert Forschung/Entwicklung; SOC ist Reparatur/Wartung medizintechnischer Geräte = Medizintechniker (Anf 3, BMET-Tier)
  '49-9092.00': 'Berufstaucher/Berufstaucherin', // Commercial Divers: war "Bauleiter Unterwasserarbeiten" — Bauleiter ist Aufsichtskraft am Bau; Commercial Divers sind Berufstaucher (operative Unterwasserarbeit)
  '49-9097.00': 'Signaltechniker Eisenbahn / Signaltechnikerin Eisenbahn', // Signal and Track Switch Repairers: war "Weichenwärter" — Weichenwärter ist Betriebsberuf (stellt Weichen), nicht Wartungstechniker; Signaltechniker Eisenbahn passt zur Wartung von Signalanlagen

  // === Audit batch 7 — SOC 27 Arts coupled title fixes (2026-04-25) ===
  '27-1012.00': 'Kunsthandwerker/Kunsthandwerkerin', // Craft Artists: war "Kunstglaser" — zu eng (Glas-Spezialfall); SOC umfasst Weben, Töpfern, Metall, Skulptur, Bildhauerei
  '27-1023.00': 'Florist/Floristin', // Floral Designers: war "Fachverkäufer für Blumen und Pflanzen" — beschreibt Verkäufer, nicht Gestalter; Florist ist der etablierte 3-jährige Ausbildungsberuf
  '27-1025.00': 'Innenarchitekt/Innenarchitektin', // Interior Designers: war "Raumgestalter" — Raumgestalter ist Ausführungs-/Handwerks-Tier (Anf 2); SOC ist planerisch/konzeptionell (Anf 3) = Innenarchitekt (Architekturstudium)
  '27-1027.00': 'Szenenbildner/Szenenbildnerin', // Set and Exhibit Designers: war "Kulissenbauer" — handwerklicher Ausführungsberuf; Set Designer ist kreativ-konzeptionell = Szenenbildner
  '27-2012.00': 'Regisseur/Regisseurin', // Producers and Directors: war "Regieassistent" — Assistent ist nur die Assistentenstufe, SOC ist die Director-Hauptrolle; Regisseur ist der dominante DE-Beruf in dieser SOC (Producer-Rolle wird in DE oft personalunion mit Regie ausgeübt)
  '27-2012.05': 'Produktionsleiter Medientechnik / Produktionsleiterin Medientechnik', // Media Technical Directors/Managers: war "Technischer Leiter für Bühne, Film und Fernsehen" — wörtliche Übersetzung; Produktionsleiter Medientechnik ist der etablierte DE-Begriff
  '27-2022.00': 'Sporttrainer/Sporttrainerin', // Coaches and Scouts: war "Lehrkraft für Sport Sekundarstufe" — Sportlehrkraft an Schulen ist anderer Beruf; Coaches sind Wettkampftrainer (KldB 84503 Sportlehrer ohne Spezialisierung Anf 3 deckt das, ohne Anpassung)
  '27-3023.00': 'Journalist/Journalistin', // News Analysts/Reporters/Journalists: war "Auslandskorrespondent" — Auslandskorrespondent ist enge Spezialisierung; SOC ist die breite Journalist-Hauptrolle
  '27-4012.00': 'Rundfunk- und Veranstaltungstechniker / Rundfunk- und Veranstaltungstechnikerin', // Broadcast Technicians: war "Informationselektroniker" — Informationselektroniker ist Consumer-Electronics-Reparateur, nicht Broadcast-Operation; Rundfunk- und Veranstaltungstechniker ist der reale 3-Jahre-IHK-Ausbildungsberuf für Sendetechnik
  '27-4014.00': 'Tontechniker/Tontechnikerin', // Sound Engineering Technicians: war "Theatertechniker" — Theater ist nur ein Anwendungsfeld; SOC umfasst Tonstudio, Film, TV, Podcasts, Live-Events; Tontechniker ist generischer

  // === Audit batch 8 — SOC 13 Business and Financial Operations coupled title fixes (2026-04-25) ===
  '13-1011.00': 'Künstler- und Sportleragent / Künstler- und Sportleragentin', // Agents/Business Managers Artists/Performers/Athletes: war "Künstleragent" (zu eng auf Künstler) — SOC umfasst Künstler+Performer+Athleten; broadened title
  '13-1021.00': 'Einkäufer Agrarprodukte / Einkäuferin Agrarprodukte', // Buyers and Purchasing Agents Farm Products: war "Holzhändler" (zu eng auf Holz) — SOC umfasst Getreide/Tabak/Holz/etc.; Einkäufer Agrarprodukte deckt SOC-Scope
  '13-1131.00': 'Fundraiser/Fundraiserin', // Fundraisers: war "Mitarbeiter im Bereich Fundraising" — klunky Umschreibung; Fundraiser ist die etablierte DE-Berufsbezeichnung
  '13-1199.05': 'Nachhaltigkeitsmanager/Nachhaltigkeitsmanagerin', // Sustainability Specialists: war "Programmkoordinator Umwelt" — ungewöhnliche Wortfügung; Nachhaltigkeitsmanager ist der etablierte DE-Begriff für die SOC-Rolle
  '13-2031.00': 'Budgetanalyst/Budgetanalystin', // Budget Analysts: war "Haushaltsanalyst" — klingt nach privatem Haushalt; Budgetanalyst ist etablierter DE-Begriff für öffentliche Haushalts-/Finanzplanung
  '13-2082.00': 'Steuerfachangestellter/Steuerfachangestellte', // Tax Preparers: war "Steuerberater" (geschützter DE-Titel für Kammerberuf, falsch für Tax-Preparer-Helper) — Steuerfachangestellte ist der 3-jährige IHK-Ausbildungsberuf, deckt einfache Steuererklärungs-Hilfstätigkeit

  // === Audit batch 9 — SOC 43 Office and Administrative Support coupled title fixes (2026-04-25) ===
  '43-3031.00': 'Buchhalter/Buchhalterin', // Bookkeeping/Accounting/Auditing Clerks: war "Steuersachbearbeiter" (impliziert Steuerrecht-Spezialisierung) — Buchhalter ist die direkte SOC-Übersetzung
  '43-4011.00': 'Wertpapiersachbearbeiter/Wertpapiersachbearbeiterin', // Brokerage Clerks: war "Back-Office-Mitarbeiter im Maklergeschäft" (sperrige Konstruktion) — Wertpapiersachbearbeiter ist DE-üblich
  '43-4061.00': 'Sachbearbeiter Sozialleistungen / Sachbearbeiterin Sozialleistungen', // Eligibility Interviewers Government Programs: war "Grenzschutzbeamter" (völlig falsches Berufsbild — KldB war bereits 73212 Sozialverwaltung, nur Title war Drift) — Sachbearbeiter Sozialleistungen passt zu KldB-Klasse
  '43-4151.00': 'Auftragsbearbeiter/Auftragsbearbeiterin', // Order Clerks: war "Warenkommissionierer" (beschreibt physische Lagerarbeit) — SOC ist kaufmännische Auftragsbearbeitung; KldB 61122 Vertrieb fachlich bleibt
  '43-4181.00': 'Reisebürokaufmann/-kauffrau', // Reservation and Transportation Ticket Agents: war "Fahrkartenverkäufer" (nur Fahrschein-Teil) — SOC umfasst Buchungen + Reservierungen für Reisen; KldB 63112 Tourismus bleibt
  '43-5032.00': 'Disponent (Transport und Logistik) / Disponentin (Transport und Logistik)', // Dispatchers Except Police/Fire/Ambulance: war "Flugdienstberater" (Luftverkehrs-Spezialisierung) — Disponent ist der DE-übliche Begriff
  '43-5111.00': 'Prüfer/Prüferin (Wiegen und Messen)', // Weighers/Measurers/Checkers/Samplers: war "Gewichte- und Maßekontrolleur" (wörtliche Übersetzung) — Prüfer ist die etablierte DE-Berufsbezeichnung

  // === Audit batch 10 — SOC 19 Life, Physical, and Social Science coupled title fixes (2026-04-25) ===
  '19-1011.00': 'Nutztierwissenschaftler/Nutztierwissenschaftlerin', // Animal Scientists: war "Biologe im Bereich Aquakultur" (Aquakultur ist Fischzucht — falsche Domain) — SOC ist Forschung an Nutztieren (Genetik/Ernährung/Reproduktion); Nutztierwissenschaftler ist DE-akademischer Begriff für die Domain
  '19-1031.02': 'Landschaftsökologe/Landschaftsökologin', // Range Managers: war "Forstwirt" (Forst ≠ Range/Weide) — Range Mgmt ist Weide-/Grasland-Ökologie; Landschaftsökologe ist der nächste DE-Berufsbild-Match
  '19-1032.00': 'Förster/Försterin', // Foresters: war "Botaniktechniker" (komplett anderes Berufsbild) — Foresters sind Forstmanager auf Spezialisten-Tier (Anf 3); "Förster" statt agent's "Forstwirt" (Forstwirt ist Geselle Anf 2); resolves BACKLOG-Wunsch nach Suchbarkeit "Förster"
  '19-2021.00': 'Meteorologe/Meteorologin', // Atmospheric/Space/Weather Scientists: war "Klimatologe" (zu eng — nur Klima-Subdomain) — SOC umfasst Atmosphäre/Wetter/Space; Meteorologe ist breiter
  '19-2041.01': 'Klimapolitik-Analyst/Klimapolitik-Analystin', // Climate Change Policy Analysts: war "Referent" (zu generisch) — Klimapolitik-Analyst ist die spezifische Berufsbezeichnung
  '19-3051.00': 'Stadt- und Raumplaner/Stadt- und Raumplanerin', // Urban and Regional Planners: war "Referent für Regionalentwicklung" (Verwaltungs-Position-Bezeichnung, kein Beruf) — Stadt- und Raumplaner ist der etablierte DE-Berufstitel
  '19-4013.00': 'Lebensmitteltechniker/Lebensmitteltechnikerin', // Food Science Technicians: war "Lebensmittelchemiker" (Hochschulberuf Anf 4 / Staatsexamen) — SOC ist Tech-Niveau (Anf 2 Lab-Standardtests); Lebensmitteltechniker ist der korrekte Tech-Tier-Beruf
  '19-4044.00': 'Hydrologische Fachkraft', // Hydrologic Technicians: war "Hydrogeologe" (Hochschulberuf Anf 4) — SOC ist Tech-Hilfskraft (Datensammlung Anf 2-3); Hydrologische Fachkraft ist Tech-Tier-konform
  '19-4061.00': 'Sozialwissenschaftlicher Assistent / Sozialwissenschaftliche Assistentin', // Social Science Research Assistants: war "Sozialarbeitswissenschaftler" (verwechselt Sozialwissenschaft mit Sozialarbeit) — Research Assistant in Sozialwissenschaften (Tech-Tier-Forschungshilfe)
  '19-4092.00': 'Kriminaltechniker/Kriminaltechnikerin', // Forensic Science Technicians: war "Polizeibeamter im Ermittlungsdienst" (Polizeivollzugsdienst-Bezeichnung statt Lab-Tech) — Kriminaltechniker ist DE-Berufsbild für Forensik-Lab

  // === Audit batch 11 — SOC 11 Management coupled title fixes (2026-04-25) ===
  '11-1011.03': 'CSR-Manager/CSR-Managerin', // Chief Sustainability Officers: war "Beauftragter für die soziale Verantwortung der Unternehmen" (wörtliche Übersetzung) — CSR-Manager ist etablierte DE-Berufsbezeichnung
  '11-2011.00': 'Werbemanager/Werbemanagerin', // Advertising and Promotions Managers: war "Werbeleiter" — auf "-manager"-Familie umgestellt parallel zu 11-2021 Marketingmanager und 11-3061 Einkaufsmanager
  '11-2021.00': 'Marketingmanager/Marketingmanagerin', // Marketing Managers: war "Führungskraft für Marketing" (sperrige Umschreibung) — Marketingmanager ist DE-üblich
  '11-3012.00': 'Verwaltungsleiter/Verwaltungsleiterin', // Administrative Services Managers: war "Bibliotheksleiter" (komplett falsches Berufsbild) — Verwaltungsleiter ist die direkte SOC-Übersetzung
  '11-3061.00': 'Einkaufsmanager/Einkaufsmanagerin', // Purchasing Managers: war "Einkaufsleiter" — auf "-manager"-Familie umgestellt parallel zu 11-2011 Werbemanager und 11-2021 Marketingmanager
  '11-9033.00': 'Hochschulleiter/Hochschulleiterin', // Education Administrators Postsecondary: war "Leiter einer höheren Lehranstalt" (veralteter österreichischer Begriff) — Hochschulleiter ist DE-Standard
  // 11-9131.00 in-place modified at line ~526 (war "Postdirektor" → "Poststellenleiter")
  '11-9151.00': 'Leiter sozialer Dienste / Leiterin sozialer Dienste', // Social and Community Service Managers: war "Manager im Bereich soziale Dienste" (sperrige Umschreibung) — Leiter sozialer Dienste ist DE-üblich; KldB 83193 bleibt korrekt
  '11-9179.02': 'Spa-Manager/Spa-Managerin', // Spa Managers: war "Leiter eines Heilbades" (Heilbad = staatlich anerkanntes Kurbad ≠ Wellness-Spa) — Spa-Manager trifft SOC-Lesart
  // 11-9199.01 in-place modified at line ~56 (war "Leiter Regulatory Affairs" → "Zulassungsleiter")
}
