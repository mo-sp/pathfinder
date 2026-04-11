export type RiasecDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

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
  /** RIASEC letter for the riasec layer; "openness" etc. for bigfive. */
  dimension: string
  text: LocalizedText
  scale: Scale
  /** Reverse-scored item (Big Five etc.). */
  reverse?: boolean
}
