// KldB class names end with an Anforderungsniveau suffix (redundant next to
// the trainingCategory pill), but interior " - " separators carry real
// specialization info (e.g. "Trainer - Fitness und Gymnastik", "Führungskräfte
// - Informatik") that must survive. Only strip the four well-known suffixes.
const KLDB_ANFORDERUNG_SUFFIXES = [
  ' - Helfer-/Anlerntätigkeiten',
  ' - fachlich ausgerichtete Tätigkeiten',
  ' - komplexe Spezialistentätigkeiten',
  ' - hoch komplexe Tätigkeiten',
] as const

// Some KldB classes also carry an inline specialization marker in parentheses,
// e.g. "Fahrzeugführer im Straßenverkehr (sonstige spezifische Tätigkeitsangabe)
// - fachlich ausgerichtete Tätigkeiten". After the Anforderungsniveau suffix is
// stripped, the trailing parenthetical is still noise for the user.
const KLDB_SPECIFICATION_SUFFIX = ' (sonstige spezifische Tätigkeitsangabe)'

export function stripKldbSuffix(name: string | null | undefined): string | null {
  if (!name) return null
  let result = name
  for (const suffix of KLDB_ANFORDERUNG_SUFFIXES) {
    if (result.endsWith(suffix)) {
      result = result.slice(0, -suffix.length)
      break
    }
  }
  if (result.endsWith(KLDB_SPECIFICATION_SUFFIX)) {
    result = result.slice(0, -KLDB_SPECIFICATION_SUFFIX.length)
  }
  return result.trim()
}
