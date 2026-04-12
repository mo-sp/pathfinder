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

/**
 * Sub-categories inside the skills layer (Layer 4). Each item belongs to
 * exactly one. Used to group the 120 items into three sub-phases of the
 * assessment (Fähigkeiten → Talente → Wissen) and to aggregate user
 * ratings per sub-category for visualization on ResultsPage.
 */
export type SkillsSubCategory = 'skills' | 'abilities' | 'knowledge'

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
  /** RIASEC letter for riasec; "openness" etc. for bigfive; ValuesDimension for values; SkillsSubCategory for skills. */
  dimension: string
  text: LocalizedText
  scale: Scale
  /** Reverse-scored item (Big Five etc.). */
  reverse?: boolean
  /** Per-question answer labels (values layer). Overrides layer-level i18n labels. */
  labels?: { de: string[]; en: string[] }
  /** Whether this values question creates a hard filter or soft penalty. */
  filterType?: 'hard' | 'soft'
  /** Skills layer only: which of the 3 sub-categories this item belongs to. */
  subCategory?: SkillsSubCategory
  /** Skills layer only: O*NET Element ID used to look up the matching occupation skill/ability/knowledge value. */
  onetElementId?: string
  /** Skills layer only: optional concept description rendered below the label on AssessmentPage. */
  description?: LocalizedText
}
