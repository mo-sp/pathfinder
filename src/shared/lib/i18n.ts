import { createI18n } from 'vue-i18n'

const messages = {
  de: {
    riasec: {
      R: 'Realistisch',
      I: 'Forschend',
      A: 'Künstlerisch',
      S: 'Sozial',
      E: 'Unternehmerisch',
      C: 'Konventionell',
    },
    riasecDescription: {
      R: 'Praktisch, körperlich, technisch – arbeitet gern mit Werkzeugen, Maschinen und in der Natur.',
      I: 'Analytisch, neugierig – will verstehen, forschen, Probleme durchdringen.',
      A: 'Kreativ, expressiv – sucht Gestaltungsfreiheit und Ausdruck.',
      S: 'Hilfsbereit, kommunikativ – arbeitet gern mit und für Menschen.',
      E: 'Überzeugend, führend – will bewegen, verkaufen, organisieren.',
      C: 'Strukturiert, ordnungsliebend – arbeitet gern mit Daten, Zahlen, Systemen.',
    },
    bigfive: {
      openness: 'Offenheit',
      conscientiousness: 'Gewissenhaftigkeit',
      extraversion: 'Extraversion',
      agreeableness: 'Verträglichkeit',
      neuroticism: 'Neurotizismus',
    },
    bigfiveDescription: {
      openness: 'Offen für Neues, fantasievoll, intellektuell neugierig.',
      conscientiousness: 'Zuverlässig, organisiert, zielorientiert.',
      extraversion: 'Gesellig, aktiv, sucht soziale Interaktion.',
      agreeableness: 'Mitfühlend, kooperativ, vertrauensvoll.',
      neuroticism: 'Empfindsam für Stress, emotional reaktiv.',
    },
    values: {
      education: 'Ausbildungsdauer',
      environment: 'Arbeitsumgebung',
      socialInteraction: 'Soziale Interaktion',
      teamwork: 'Teamarbeit',
      physicalDemands: 'Körperliche Anforderungen',
      autonomy: 'Entscheidungsfreiheit',
      publicContact: 'Kundenkontakt',
      routine: 'Routine / Abwechslung',
    },
    valuesDescription: {
      education: 'Wie viel Ausbildungszeit du investieren möchtest.',
      environment: 'Ob du lieber drinnen oder draußen arbeitest.',
      socialInteraction: 'Wie viel Kontakt mit Menschen du im Beruf möchtest.',
      teamwork: 'Ob du lieber allein oder im Team arbeitest.',
      physicalDemands: 'Wie viel körperliche Arbeit du dir vorstellen kannst.',
      autonomy: 'Wie wichtig dir eigenständiges Entscheiden ist.',
      publicContact: 'Ob du direkt mit Kunden oder der Öffentlichkeit arbeiten möchtest.',
      routine: 'Ob du gleichmäßige Aufgaben oder ständig Neues bevorzugst.',
    },
    skillsSubCategory: {
      skills: 'Fähigkeiten',
      abilities: 'Talente',
      knowledge: 'Wissen',
    },
    skillsSubCategoryDescription: {
      skills: 'Erlernte Kompetenzen – was du durch Übung beherrschst.',
      abilities: 'Angeborene Ausprägungen – deine Grundveranlagungen.',
      knowledge: 'Fachliches Wissen – Gebiete, die du kennst.',
    },
    skillsSubCategoryCountText: {
      skills: '35 Fragen zu deinen Fähigkeiten',
      abilities: '52 Fragen zu deinen Talenten',
      knowledge: '34 Fragen zu deinem Wissen',
    },
    skillsBand: {
      none: 'Kaum vorhanden',
      basics: 'Grundlagen',
      average: 'Durchschnittlich',
      advanced: 'Fortgeschritten',
      expert: 'Expertise',
    },
    skillsInterstitial: {
      done: {
        skills: 'Fähigkeiten abgeschlossen',
        abilities: 'Talente abgeschlossen',
      },
      nextHeader: 'Als nächstes',
      continue: 'Weiter',
    },
    questionPrompt: {
      riasec: 'Wie sehr würdest du das gerne tun?',
      bigfive: 'Wie sehr trifft diese Aussage auf dich zu?',
      skills: {
        skills: 'Wie gut beherrschst du diese Fähigkeit?',
        abilities: 'Wie stark ist diese Ausprägung bei dir?',
        knowledge: 'Wie viel Wissen hast du auf diesem Gebiet?',
      },
    },
    explainPanel: {
      title: 'Warum dieser Rang?',
      toggle: {
        open: 'Details einblenden',
        close: 'Details ausblenden',
      },
      factors: {
        riasec: 'Interessen (RIASEC)',
        bigfive: 'Persönlichkeit',
        values: 'Werte & Rahmen',
        skills: 'Fähigkeiten',
      },
      notScored: 'Noch nicht erfasst',
      noData: 'Keine Daten für diesen Beruf',
      inactiveTag: 'in dieser Ansicht nicht gewertet',
      thresholds: {
        riasec: {
          strong: 'Sehr starke Interessen-Übereinstimmung.',
          moderate: 'Moderate Interessen-Übereinstimmung.',
          weak: 'Schwache Interessen-Übereinstimmung.',
          poor: 'Kaum Interessen-Übereinstimmung.',
        },
        bigfive: {
          strong: 'Persönlichkeit passt sehr gut – Score wird angehoben.',
          moderate: 'Persönlichkeit neutral – kaum Einfluss.',
          weak: 'Persönlichkeit dämpft den Score leicht.',
          poor: 'Persönlichkeit dämpft den Score deutlich.',
        },
        values: {
          strong: 'Rahmenbedingungen passen fast perfekt.',
          moderate: 'Leichte Abweichung bei den Rahmenbedingungen.',
          weak: 'Deutliche Abweichung bei den Rahmenbedingungen.',
          poor: 'Starke Abweichung bei den Rahmenbedingungen.',
        },
        skills: {
          strong: 'Deine Fähigkeiten decken sich stark mit dem Berufsprofil.',
          moderate: 'Solide Überschneidung bei den Fähigkeiten.',
          weak: 'Nur teilweise passende Fähigkeiten.',
          poor: 'Fähigkeiten passen kaum zum Profil.',
        },
      },
    },
    likert: {
      riasec: {
        1: 'Überhaupt nicht',
        2: 'Eher nicht',
        3: 'Weder noch',
        4: 'Gerne',
        5: 'Sehr gerne',
      },
      bigfive: {
        1: 'Trifft nicht zu',
        2: 'Eher nicht',
        3: 'Teils, teils',
        4: 'Eher zu',
        5: 'Trifft voll zu',
      },
      skills: {
        skills: {
          1: 'Gar nicht',
          2: 'Grundkenntnisse',
          3: 'Solide',
          4: 'Sehr gut',
          5: 'Experte',
        },
        abilities: {
          1: 'Sehr schwach',
          2: 'Eher schwach',
          3: 'Durchschnittlich',
          4: 'Eher stark',
          5: 'Sehr stark',
        },
        knowledge: {
          1: 'Kein Wissen',
          2: 'Grundlagen',
          3: 'Solide',
          4: 'Fortgeschritten',
          5: 'Expertenwissen',
        },
      },
    },
  },
} as const

export const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  messages,
})

export type Locale = keyof typeof messages
