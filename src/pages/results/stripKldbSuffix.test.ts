import { describe, expect, it } from 'vitest'
import { stripKldbSuffix } from './stripKldbSuffix'

describe('stripKldbSuffix', () => {
  it('returns null for null or undefined input', () => {
    expect(stripKldbSuffix(null)).toBeNull()
    expect(stripKldbSuffix(undefined)).toBeNull()
    expect(stripKldbSuffix('')).toBeNull()
  })

  it('strips each of the four Anforderungsniveau suffixes', () => {
    expect(stripKldbSuffix('Berufe im Metallbau - Helfer-/Anlerntätigkeiten')).toBe('Berufe im Metallbau')
    expect(stripKldbSuffix('Berufe im Metallbau - fachlich ausgerichtete Tätigkeiten')).toBe('Berufe im Metallbau')
    expect(stripKldbSuffix('Berufe im Metallbau - komplexe Spezialistentätigkeiten')).toBe('Berufe im Metallbau')
    expect(stripKldbSuffix('Berufe im Metallbau - hoch komplexe Tätigkeiten')).toBe('Berufe im Metallbau')
  })

  it('preserves interior " - " separators that carry specialization info', () => {
    expect(
      stripKldbSuffix('Trainer - Fitness und Gymnastik - komplexe Spezialistentätigkeiten'),
    ).toBe('Trainer - Fitness und Gymnastik')
    expect(stripKldbSuffix('Führungskräfte - Personalwesen und -dienstleistung')).toBe(
      'Führungskräfte - Personalwesen und -dienstleistung',
    )
  })

  it('strips the "(sonstige spezifische Tätigkeitsangabe)" marker alongside the suffix', () => {
    expect(
      stripKldbSuffix(
        'Fahrzeugführer im Straßenverkehr (sonstige spezifische Tätigkeitsangabe) - fachlich ausgerichtete Tätigkeiten',
      ),
    ).toBe('Fahrzeugführer im Straßenverkehr')
    expect(
      stripKldbSuffix(
        'Berufe in Versicherungs- und Finanzdienstleistungen (sonstige spezifische Tätigkeitsangabe) - hoch komplexe Tätigkeiten',
      ),
    ).toBe('Berufe in Versicherungs- und Finanzdienstleistungen')
  })

  it('returns the trimmed original when no known suffix matches', () => {
    expect(stripKldbSuffix('Aufsichtskräfte - Chemie')).toBe('Aufsichtskräfte - Chemie')
    expect(stripKldbSuffix('  Ärzte/Ärztinnen (ohne Spezialisierung)  ')).toBe(
      'Ärzte/Ärztinnen (ohne Spezialisierung)',
    )
  })

  it('is idempotent on already-stripped names', () => {
    const input = 'Berufe im Metallbau - fachlich ausgerichtete Tätigkeiten'
    const once = stripKldbSuffix(input)
    const twice = stripKldbSuffix(once)
    expect(twice).toBe(once)
  })
})
