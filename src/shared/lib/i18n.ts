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
    likert: {
      1: 'Überhaupt nicht',
      2: 'Eher nicht',
      3: 'Neutral',
      4: 'Gerne',
      5: 'Sehr gerne',
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
