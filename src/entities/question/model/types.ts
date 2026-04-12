export type RiasecDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export type BigFiveDimension =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'agreeableness'
  | 'neuroticism'

export type ValuesDimension =
  | 'education'
  | 'environment'
  | 'socialInteraction'
  | 'teamwork'
  | 'physicalDemands'
  | 'autonomy'
  | 'publicContact'
  | 'routine'

export type QuestionLayer = 'riasec' | 'bigfive' | 'values' | 'skills'

export type Scale = 'likert5' | 'likert7' | 'boolean'

export interface LocalizedText {
  en: string
  de: string | null
}

export interface Question {
  /** Stable item id, e.g. "ip-r-01" for Interest Profiler Realistic item 1. */
  id: string
  layer: QuestionLayer
  /** RIASEC letter for the riasec layer; "openness" etc. for bigfive; ValuesDimension for values. */
  dimension: string
  text: LocalizedText
  scale: Scale
  /** Reverse-scored item (Big Five etc.). */
  reverse?: boolean
  /** Per-question answer labels (values layer). Overrides layer-level i18n labels. */
  labels?: { de: string[]; en: string[] }
  /** Whether this values question creates a hard filter or soft penalty. */
  filterType?: 'hard' | 'soft'
}
