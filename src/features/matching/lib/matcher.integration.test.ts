import { describe, it, expect } from 'vitest'
import type { Answer } from '@entities/assessment/model/types'
import type { Question, RiasecDimension } from '@entities/question/model/types'
import type {
  MatchResult,
  Occupation,
  RIASECProfile,
} from '@entities/occupation/model/types'
import { matchOccupations } from '@features/matching/lib/matcher'
import {
  computeRiasecProfile,
  RIASEC_DIMENSIONS,
} from '@features/scoring/lib/riasec'
import occupationsData from '@data/onet-occupations.json'
import itemsData from '@data/onet-items.json'

// Integration tests exercise the full scoring pipeline against the real
// `src/data/onet-occupations.json` (923 occupations) and `src/data/onet-items.json`
// (60 O*NET Interest Profiler items). Unlike the unit tests under
// `pearson.test.ts` / `riasec.test.ts` / `matcher.test.ts`, these rely on the
// shape of the bundled O*NET data — if the data regenerates and the asserted
// family counts drop, investigate before loosening the bounds.

interface ItemsFile {
  items: Question[]
}

const occupations = occupationsData as Occupation[]
const allItems = (itemsData as ItemsFile).items

// The 10 items the PoC questionnaire uses today (see
// features/questionnaire/model/store.ts). Kept here instead of imported so
// the test fails obviously if the store drops or renames one.
const POC_ITEM_IDS = [
  'ip-r-01',
  'ip-r-03',
  'ip-i-01',
  'ip-i-08',
  'ip-a-01',
  'ip-a-04',
  'ip-s-02',
  'ip-s-10',
  'ip-e-05',
  'ip-c-01',
] as const

const pocItems: Question[] = POC_ITEM_IDS.map((id) => {
  const q = allItems.find((item) => item.id === id)
  if (!q) throw new Error(`PoC item ${id} missing from onet-items.json`)
  return q
})

const RIASEC_LETTERS = new Set<string>(RIASEC_DIMENSIONS)

/**
 * Synthesize `Answer[]` for any subset of riasec items, using a per-dimension
 * value (fallback: `defaultValue`). The signature intentionally takes `items`
 * as input so the same helper works for the PoC's 10 items and the full
 * Interest Profiler's 60 items — scaling the questionnaire requires no
 * changes here.
 */
function makeRiasecAnswers(
  items: Question[],
  perDim: Partial<Record<RiasecDimension, number>>,
  defaultValue = 3,
): Answer[] {
  return items
    .filter((q) => q.layer === 'riasec' && RIASEC_LETTERS.has(q.dimension))
    .map<Answer>((q) => ({
      questionId: q.id,
      value: perDim[q.dimension as RiasecDimension] ?? defaultValue,
      answeredAt: 0,
    }))
}

/** O*NET-SOC major group, e.g. "15-1252.00" → "15". */
function majorGroup(occupation: Occupation): string {
  return occupation.onetCode.split('-')[0]
}

function countInFamilies(results: MatchResult[], families: string[]): number {
  return results.filter((r) => families.includes(majorGroup(r.occupation))).length
}

describe('scoring pipeline integration (real O*NET data)', () => {
  describe('matcher against real occupations.json', () => {
    it('returns a sorted top-20 with well-formed rank and fitScore fields', () => {
      const profile: RIASECProfile = { R: 3, I: 4, A: 2, S: 3, E: 3, C: 3 }
      const results = matchOccupations(profile, occupations, 20)

      expect(results).toHaveLength(20)
      for (let i = 0; i < results.length; i++) {
        expect(results[i].rank).toBe(i + 1)
        expect(Number.isFinite(results[i].fitScore)).toBe(true)
        expect(results[i].fitScore).toBeGreaterThanOrEqual(-1)
        expect(results[i].fitScore).toBeLessThanOrEqual(1)
        if (i > 0) {
          expect(results[i].fitScore).toBeLessThanOrEqual(
            results[i - 1].fitScore,
          )
        }
      }
    })

    it("ranks an occupation first when fed its own profile (identity check on 'Software Developers')", () => {
      const softwareDevelopers = occupations.find(
        (o) => o.onetCode === '15-1252.00',
      )
      expect(softwareDevelopers).toBeDefined()

      const results = matchOccupations(
        softwareDevelopers!.riasecProfile,
        occupations,
        5,
      )
      expect(results[0].occupation.onetCode).toBe('15-1252.00')
      expect(results[0].fitScore).toBeCloseTo(1, 6)
    })

    it('ranks teachers exclusively at the top for a pure-Social profile', () => {
      const profile: RIASECProfile = { R: 1, I: 1, A: 1, S: 5, E: 1, C: 1 }
      const results = matchOccupations(profile, occupations, 10)

      // Major group 25 = Education, Training, and Library Occupations.
      expect(countInFamilies(results, ['25'])).toBeGreaterThanOrEqual(9)
    })

    it('ranks manual-trade occupations at the top for a pure-Realistic profile', () => {
      const profile: RIASECProfile = { R: 5, I: 1, A: 1, S: 1, E: 1, C: 1 }
      const results = matchOccupations(profile, occupations, 10)

      // 47 = Construction and Extraction, 45 = Farming/Fishing/Forestry,
      // 37 = Building and Grounds Cleaning and Maintenance.
      expect(countInFamilies(results, ['47', '45', '37'])).toBeGreaterThanOrEqual(8)
    })

    it('ranks management and sales occupations at the top for a pure-Enterprising profile', () => {
      const profile: RIASECProfile = { R: 1, I: 1, A: 1, S: 1, E: 5, C: 1 }
      const results = matchOccupations(profile, occupations, 10)

      // 11 = Management, 41 = Sales and Related.
      expect(countInFamilies(results, ['11', '41'])).toBeGreaterThanOrEqual(7)
    })
  })

  describe('full pipeline: answers → computeRiasecProfile → matchOccupations', () => {
    it('dominant-Investigative answers on the PoC 10 items rank science/research roles first', () => {
      const answers = makeRiasecAnswers(pocItems, { I: 5 }, 1)
      const profile = computeRiasecProfile(answers, pocItems)
      const results = matchOccupations(profile, occupations, 10)

      // 19 = Life, Physical, and Social Science;
      // 15 = Computer and Mathematical Occupations (incl. 15-2xxx Math Science).
      expect(countInFamilies(results, ['19', '15'])).toBeGreaterThanOrEqual(8)
    })

    it('dominant-Investigative answers on the full 60 items rank science/research roles first (same helper, more items)', () => {
      const answers = makeRiasecAnswers(allItems, { I: 5 }, 1)
      const profile = computeRiasecProfile(answers, allItems)
      const results = matchOccupations(profile, occupations, 10)

      expect(countInFamilies(results, ['19', '15'])).toBeGreaterThanOrEqual(8)
    })

    it('helper emits one Answer per riasec item and scales without code changes from 10 items to 60', () => {
      const answers10 = makeRiasecAnswers(pocItems, { I: 5 }, 1)
      const answers60 = makeRiasecAnswers(allItems, { I: 5 }, 1)

      const pocRiasecCount = pocItems.filter((q) => q.layer === 'riasec').length
      const fullRiasecCount = allItems.filter((q) => q.layer === 'riasec').length

      expect(answers10).toHaveLength(pocRiasecCount)
      expect(answers60).toHaveLength(fullRiasecCount)
      // PoC has 10 riasec items, full Interest Profiler has 60 — if these
      // ever coincide, the PoC has silently grown and this test's value
      // as a forward-compat smoke check is gone.
      expect(answers10.length).toBeLessThan(answers60.length)
    })
  })
})
