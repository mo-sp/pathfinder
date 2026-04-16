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
  '11-9199.01': 'Leiter Regulatory Affairs / Leiterin Regulatory Affairs', // Regulatory Affairs Managers
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
  '43-9071.00': 'Bürogerätemitarbeiter/Bürogerätemitarbeiterin', // Office Machine Operators

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
  '13-1031.00': 'Schadensregulierer/Schadensreguliererin', // Claims Adjusters, Examiners, and Investigators
  '13-1032.00': 'Kfz-Schadensgutachter/Kfz-Schadensgutachterin', // Insurance Appraisers, Auto Damage

  // === Cluster: "Immobilienschätzer" (2) ===
  '13-1041.04': 'Inspekteur öffentliches Eigentum / Inspekteurin öffentliches Eigentum', // Government Property Inspectors
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
  '19-2099.01': 'Fernerkundungs-Wissenschaftler/Fernerkundungs-Wissenschaftlerin', // Remote Sensing Scientists and Technologists
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
  '25-2031.00': 'Lehrkraft Gymnasium und Realschule', // Secondary School Teachers
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

  // === Cluster: "Kundendiensttechniker - Unterhaltungselektronik" (2) ===
  '49-2094.00': 'Elektroniker Gewerbliche Geräte / Elektronikerin Gewerbliche Geräte', // Electrical and Electronics Repairers, Commercial and Industrial Equipment
  '49-9061.00': 'Reparateur Foto- und Kameratechnik / Reparateurin Foto- und Kameratechnik', // Camera and Photographic Equipment Repairers

  // === Cluster: "Kraftfahrzeugmechatroniker Schwerpunkt Personenkraftwagentechnik" (2) ===
  '49-3023.00': 'Kfz-Mechatroniker Pkw / Kfz-Mechatronikerin Pkw', // Automotive Service Technicians and Mechanics
  '49-3052.00': 'Zweiradmechatroniker/Zweiradmechatronikerin', // Motorcycle Mechanics

  // === Cluster: "Schloss- und Schlüsselmacher" (2) ===
  '49-9011.00': 'Reparateur Türmechanik / Reparateurin Türmechanik', // Mechanical Door Repairers
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
  '53-7071.00': 'Verdichter-Operator Gas / Verdichter-Operatorin Gas', // Gas Compressor and Gas Pumping Station Operators

  // === Cluster: "Flugbegleiter" (2) ===
  '53-2031.00': 'Flugbegleiter/Flugbegleiterin', // Flight Attendants
  '53-6061.00': 'Fahrgastbetreuer/Fahrgastbetreuerin', // Passenger Attendants

  // === Cluster: "Lieferfahrer" (2) ===
  '53-3031.00': 'Verkaufsfahrer/Verkaufsfahrerin', // Driver/Sales Workers
  '53-3033.00': 'Lieferfahrer/Lieferfahrerin', // Light Truck Drivers
}
