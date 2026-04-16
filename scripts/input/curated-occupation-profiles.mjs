/**
 * Hand-curated occupation profiles for codes where O*NET ships no survey
 * data. As of O*NET 30.2 (February 2026), 29 codes in our corpus have
 * empty Skills / Abilities / Knowledge tables and no Work Context rows.
 * These are typically recent O*NET splits (Blockchain Engineers, Penetration
 * Testers, Data Scientists, Multimedia Designers), specialty medical roles
 * (Kardiologie, Orthopädie, Kinderchirurgie), or niche occupations (DJ,
 * Purser, Crematory Technician) for which O*NET has not yet run the survey.
 *
 * Why curate instead of cloning from a neighbour code:
 *   Cloning 15-1251 Computer Programmer onto 15-1252 Software Developer
 *   would bury the genuine differences in scope (implementation-only vs.
 *   architecture-and-design). We'd rather represent the data gap honestly
 *   with values that reflect the role, authored by someone who understands
 *   it, than fake precision with a copied profile.
 *
 * Future-proofing — the override is conditional:
 *   build-onet-data.mjs applies each field from this file ONLY when the
 *   corresponding field in the raw O*NET data is missing. The moment a
 *   future O*NET release ships survey data for 15-2051 Data Scientist, the
 *   override for that field will be skipped and the real data wins. We do
 *   NOT need to retire entries from this file — they become no-ops.
 *
 * Scale reference — workContext values use the O*NET CX scale 1-5 where:
 *   indoor / outdoor:      1 = Never, 5 = Every day
 *   contactWithOthers:     1 = No contact, 5 = Constant contact with others
 *   teamwork:              1 = Not important, 5 = Extremely important
 *   standing / walking:    1 = Never, 5 = Continually or almost continually
 *   autonomy:              1 = No freedom, 5 = A lot of freedom
 *   publicContact:         1 = Never, 5 = Every day
 *   routine:               1 = Not at all important, 5 = Extremely important
 *
 * Curation notes live in the per-entry `_notes` field. The `_source` field
 * marks each profile as PathFinder-curated so downstream consumers can tell
 * it apart from O*NET survey data if they need to.
 */

const SRC = 'pathfinder-curated-2026-04'

export default {
  // === Management & Government ===

  '11-1031.00': { // Politiker / Legislators (elected officials, not cabinet)
    _source: SRC,
    _notes: 'Legislators / elected politicians: indoor parliamentary work, very high public contact, bounded autonomy (party discipline, whip), low physical demand, non-routine.',
    workContext: { indoor: 4.5, outdoor: 1.5, contactWithOthers: 4.8, teamwork: 3.8, standing: 2.5, walking: 2.2, autonomy: 3.3, publicContact: 4.6, routine: 2.0 },
  },

  '11-2032.00': { // Public-Relations-Manager
    _source: SRC,
    _notes: 'PR managers: office-based with press events, high contact and public exposure, moderate-to-high teamwork coordinating campaigns.',
    workContext: { indoor: 4.6, outdoor: 1.6, contactWithOthers: 4.5, teamwork: 4.2, standing: 2.2, walking: 2.0, autonomy: 4.2, publicContact: 4.3, routine: 2.8 },
  },

  '13-1082.00': { // Projektmanager
    _source: SRC,
    _notes: 'Project managers: office work driven by meetings, high teamwork and coordination, moderate public contact (mostly internal stakeholders + vendors).',
    workContext: { indoor: 4.7, outdoor: 1.3, contactWithOthers: 4.5, teamwork: 4.6, standing: 2.0, walking: 2.0, autonomy: 4.2, publicContact: 3.2, routine: 2.5 },
  },

  '13-2051.00': { // Anlage- und Vermögensberater
    _source: SRC,
    _notes: 'Financial advisors: office and client meetings, very high client contact, moderate teamwork, high autonomy over client strategy.',
    workContext: { indoor: 4.6, outdoor: 1.3, contactWithOthers: 4.6, teamwork: 3.5, standing: 1.8, walking: 1.6, autonomy: 4.2, publicContact: 4.4, routine: 3.3 },
  },

  '13-2054.00': { // Financial Risk Analyst
    _source: SRC,
    _notes: 'Quantitative analysts: very indoor/desk-bound, moderate contact, lower public contact, elevated routine from recurring model runs and reports.',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 3.6, teamwork: 3.6, standing: 1.5, walking: 1.4, autonomy: 3.8, publicContact: 2.2, routine: 3.4 },
  },

  // === IT / Tech (new O*NET codes, no survey yet) ===

  '15-1255.00': { // Multimedia-Designer
    _source: SRC,
    _notes: 'Digital interface / multimedia designers: desk-based creative work, moderate teamwork with devs/PMs, low public contact, moderate routine (projects not tickets).',
    workContext: { indoor: 4.7, outdoor: 1.2, contactWithOthers: 3.4, teamwork: 3.6, standing: 1.9, walking: 1.7, autonomy: 4.0, publicContact: 2.2, routine: 2.8 },
  },

  '15-1299.04': { // ethischer Hacker / Penetration Testers
    _source: SRC,
    _notes: 'Penetration testers: deep-focus technical work often solo or in pairs, low sustained team contact (client consults are short), very low public contact, elevated autonomy, non-routine by definition (novel targets).',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 2.8, teamwork: 3.0, standing: 1.5, walking: 1.3, autonomy: 4.2, publicContact: 1.8, routine: 2.0 },
  },

  '15-1299.06': { // IT-Forensik-Experte / Digital Forensics Analysts
    _source: SRC,
    _notes: 'Digital forensics: indoor lab/desk, moderate teamwork with investigators/counsel, low public contact, moderate routine from standardized evidence procedures.',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 3.4, teamwork: 3.6, standing: 1.5, walking: 1.3, autonomy: 4.0, publicContact: 2.3, routine: 3.0 },
  },

  '15-1299.07': { // Blockchain Engineers
    _source: SRC,
    _notes: 'Blockchain engineers: like Software Developers — very indoor, moderate contact, low public contact, high autonomy over architectural decisions, moderate routine.',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 3.2, teamwork: 3.7, standing: 1.4, walking: 1.3, autonomy: 4.3, publicContact: 1.8, routine: 2.6 },
  },

  '15-2051.00': { // Datenwissenschaftler / Data Scientists
    _source: SRC,
    _notes: 'Data scientists: desk-heavy analytical work, moderate-to-high teamwork with product and eng teams, low public contact, exploratory work so below-average routine.',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 3.5, teamwork: 3.9, standing: 1.3, walking: 1.2, autonomy: 4.2, publicContact: 2.0, routine: 2.5 },
  },

  // === Medicine — specialists ===

  '29-1212.00': { // Facharzt für Kardiologie
    _source: SRC,
    _notes: 'Cardiologists: clinic/hospital indoor, continuous patient contact, high teamwork (ward + imaging), moderate-to-high standing (bedside exams + imaging + some interventions, less OR-heavy than surgery), very high autonomy, moderate routine from protocols.',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 4.8, teamwork: 4.5, standing: 3.8, walking: 3.3, autonomy: 4.7, publicContact: 4.3, routine: 3.0 },
  },

  '29-1242.00': { // Orthopäde
    _source: SRC,
    _notes: 'Orthopedic physicians: similar profile to cardiology but more standing/walking (OR + rehab rounds).',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 4.7, teamwork: 4.5, standing: 4.5, walking: 3.6, autonomy: 4.7, publicContact: 4.3, routine: 3.0 },
  },

  '29-1243.00': { // Kinderchirurg
    _source: SRC,
    _notes: 'Pediatric surgeons: OR-heavy, very high teamwork (surgical team), continuously standing during operations, maximum autonomy on intra-operative decisions.',
    workContext: { indoor: 4.9, outdoor: 1.0, contactWithOthers: 4.8, teamwork: 4.7, standing: 4.8, walking: 3.1, autonomy: 4.8, publicContact: 4.0, routine: 2.8 },
  },

  // === Medicine — emergency / documentation ===

  '29-2042.00': { // Rettungssanitäter
    _source: SRC,
    _notes: 'EMTs: field work — scene (outdoor) and ambulance (not a climate-controlled indoor office), continuously on the move, very high contact and teamwork with partner, very high public contact, every callout different (low routine).',
    workContext: { indoor: 3.0, outdoor: 4.0, contactWithOthers: 4.8, teamwork: 4.7, standing: 4.5, walking: 4.5, autonomy: 3.7, publicContact: 4.8, routine: 2.5 },
  },

  '29-2043.00': { // Notfallsanitäter (advanced)
    _source: SRC,
    _notes: 'Paramedics: same on-scene profile as EMTs (field / ambulance, continuously on the move) but higher autonomy (permitted to perform advanced interventions independently).',
    workContext: { indoor: 3.0, outdoor: 4.0, contactWithOthers: 4.8, teamwork: 4.7, standing: 4.5, walking: 4.5, autonomy: 4.2, publicContact: 4.8, routine: 2.5 },
  },

  '29-2072.00': { // Medizinischer Dokumentar
    _source: SRC,
    _notes: 'Medical records technicians: heavy desk / coding work, limited patient contact, low public contact, high routine from coding standards.',
    workContext: { indoor: 4.8, outdoor: 1.1, contactWithOthers: 3.2, teamwork: 3.3, standing: 1.7, walking: 1.6, autonomy: 3.3, publicContact: 2.0, routine: 4.0 },
  },

  '29-9021.00': { // Informations- und Wissensmanager (IKT) / Health Informatics
    _source: SRC,
    _notes: 'Health informatics specialists: office-based, bridge clinical and IT teams, moderate-high teamwork, low public contact, moderate routine.',
    workContext: { indoor: 4.7, outdoor: 1.2, contactWithOthers: 3.8, teamwork: 4.0, standing: 2.0, walking: 1.8, autonomy: 3.8, publicContact: 2.5, routine: 3.0 },
  },

  // === Education — special needs (elementary / early) ===

  '25-2055.00': { // Sonderpädagoge Frühförderung
    _source: SRC,
    _notes: 'Early-childhood special-ed teachers: indoor (homes + classrooms + therapy rooms), very high contact with children and parents, moderate-to-high standing/walking, high public contact.',
    workContext: { indoor: 4.3, outdoor: 1.8, contactWithOthers: 4.7, teamwork: 3.9, standing: 3.5, walking: 3.2, autonomy: 3.8, publicContact: 4.2, routine: 3.2 },
  },

  // === Arts / Entertainment / Stage Tech ===

  '27-2091.00': { // Diskjockey
    _source: SRC,
    _notes: 'DJs: club/event work, mostly indoor, very high public contact (reading the crowd), largely solo at the console with light coordination through event staff, long continuous standing, high set-building autonomy, each event different.',
    workContext: { indoor: 4.5, outdoor: 1.8, contactWithOthers: 4.5, teamwork: 2.3, standing: 4.5, walking: 3.0, autonomy: 4.2, publicContact: 4.6, routine: 2.4 },
  },

  '27-4015.00': { // Beleuchtungstechniker
    _source: SRC,
    _notes: 'Lighting technicians: theatres / events / studios. Collaborative during setup and rehearsals (stage manager, LD, sound, electrics) but operate the board alone during the show — net moderate teamwork. Low autonomy on creative decisions (LD/director sets the plot, tech executes). Cue sheets repeat show after show → higher routine during a run.',
    workContext: { indoor: 4.2, outdoor: 2.2, contactWithOthers: 3.6, teamwork: 3.2, standing: 4.4, walking: 3.5, autonomy: 2.5, publicContact: 2.8, routine: 3.5 },
  },

  // === Science / Technical Specialists ===

  '17-3028.00': { // Metrologietechniker / Calibration Technicians
    _source: SRC,
    _notes: 'Calibration / metrology technicians: lab-based, moderate standing, low public contact, high routine (protocols + repeat measurements).',
    workContext: { indoor: 4.5, outdoor: 1.6, contactWithOthers: 3.2, teamwork: 3.4, standing: 3.6, walking: 2.6, autonomy: 3.4, publicContact: 2.0, routine: 4.0 },
  },

  '19-4044.00': { // Hydrogeologe / Hydrologic Technicians
    _source: SRC,
    _notes: 'Hydrologic technicians: split between field sampling and office analysis, moderate teamwork, moderate autonomy, low-moderate public contact.',
    workContext: { indoor: 3.2, outdoor: 3.6, contactWithOthers: 3.3, teamwork: 3.7, standing: 3.2, walking: 3.3, autonomy: 3.8, publicContact: 2.5, routine: 2.8 },
  },

  // === Service / Hospitality ===

  '39-1014.00': { // Leiter/Leiterin Gastronomie und Freizeit / First-Line Supervisors of Personal Service and Entertainment and Recreation Workers
    _source: SRC,
    _notes: 'Service / hospitality / leisure supervisors: indoor venue work, very high public contact, high teamwork, long standing, branch-manager-level autonomy (chain rules within own operation), elevated routine from shift patterns.',
    workContext: { indoor: 4.4, outdoor: 1.8, contactWithOthers: 4.7, teamwork: 4.2, standing: 4.2, walking: 3.8, autonomy: 4.5, publicContact: 4.6, routine: 3.7 },
  },

  '39-4012.00': { // Kremationstechniker / Crematory Operators
    _source: SRC,
    _notes: 'Crematory operators: indoor facility work at the furnace, long standing, low contact and public exposure (the grieving families go to the funeral director, not the operator), low teamwork, high routine.',
    workContext: { indoor: 4.5, outdoor: 1.6, contactWithOthers: 2.5, teamwork: 2.5, standing: 4.0, walking: 3.2, autonomy: 3.3, publicContact: 1.5, routine: 4.0 },
  },

  '41-3091.00': { // Vertriebsmitarbeiter Dienstleistungen / Sales Rep, Services
    _source: SRC,
    _notes: 'Services sales reps: split office / client-meeting, very high client contact and public exposure, moderate teamwork, high autonomy on pitches, moderate physical demand (some site visits but mostly seated).',
    workContext: { indoor: 3.9, outdoor: 2.1, contactWithOthers: 4.6, teamwork: 3.2, standing: 2.5, walking: 2.5, autonomy: 4.0, publicContact: 4.6, routine: 2.8 },
  },

  '33-9094.00': { // Schulbusbegleiter / School Bus Monitors
    _source: SRC,
    _notes: 'School bus monitors: bus-based route work, moderate contact (children), low teamwork (alone on bus with driver), low autonomy (route-driven), high routine.',
    workContext: { indoor: 3.8, outdoor: 2.2, contactWithOthers: 4.2, teamwork: 3.0, standing: 3.0, walking: 2.5, autonomy: 2.5, publicContact: 4.2, routine: 4.0 },
  },

  // === Transport / Aviation / Drivers ===

  '53-1044.00': { // Leitender Flugbegleiter / Flight Attendant Supervisor (Purser)
    _source: SRC,
    _notes: 'Head flight attendants / pursers: cabin work during flights, very high public contact and teamwork, very high standing/walking, authority over the cabin crew and passenger-side decisions in flight.',
    workContext: { indoor: 4.2, outdoor: 1.5, contactWithOthers: 4.8, teamwork: 4.5, standing: 4.5, walking: 4.2, autonomy: 4.0, publicContact: 4.8, routine: 3.2 },
  },

  '53-3054.00': { // Taxifahrer / Taxi Drivers
    _source: SRC,
    _notes: 'Taxi drivers: vehicle-based (climate-controlled cabin reads as mostly indoor), seated (low standing/walking), very high public contact, low teamwork, high autonomy over routing and fare selection.',
    workContext: { indoor: 3.5, outdoor: 1.8, contactWithOthers: 4.2, teamwork: 1.8, standing: 1.5, walking: 1.5, autonomy: 4.3, publicContact: 4.6, routine: 3.6 },
  },

  '53-6032.00': { // Flugzeugtankwart / Aircraft Service Attendants
    _source: SRC,
    _notes: 'Aircraft service attendants: ramp-side outdoor work, high standing/walking, brief contact with pilots and ground crew, minimal public contact, high routine from safety checklists.',
    workContext: { indoor: 1.9, outdoor: 4.5, contactWithOthers: 3.4, teamwork: 4.0, standing: 4.2, walking: 3.8, autonomy: 2.9, publicContact: 2.0, routine: 4.2 },
  },
}
