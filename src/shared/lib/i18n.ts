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
    questionPrompt: {
      riasec: 'Wie sehr würdest du das gerne tun?',
      bigfive: 'Wie sehr trifft diese Aussage auf dich zu?',
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
