import { describe, expect, it } from 'vitest'
import type { Answer } from '@entities/assessment/model/types'
import type { Question } from '@entities/question/model/types'
import {
  BIG_FIVE_DIMENSIONS,
  computeBigFiveProfile,
  normalizeBigFiveToPercent,
} from './bigfive'

// Minimal item fixtures — we don't need the full IPIP pool to test the
// scoring arithmetic, just representative items per dimension with a mix
// of direct and reverse keying.
function makeItems(): Question[] {
  const items: Question[] = []
  for (const dim of BIG_FIVE_DIMENSIONS) {
    for (let i = 0; i < 4; i += 1) {
      items.push({
        id: `bf-${dim}-${i + 1}`,
        layer: 'bigfive',
        dimension: dim,
        scale: 'likert5',
        reverse: i % 2 === 1, // alternating direct / reverse
        text: { en: `item ${dim} ${i + 1}`, de: `item ${dim} ${i + 1}` },
      })
    }
  }
  return items
}

function answer(id: string, value: number): Answer {
  return { questionId: id, value, answeredAt: 0 }
}

describe('computeBigFiveProfile', () => {
  it('returns zeros when there are no answers', () => {
    const items = makeItems()
    const profile = computeBigFiveProfile([], items)
    for (const dim of BIG_FIVE_DIMENSIONS) {
      expect(profile[dim]).toBe(0)
    }
  })

  it('sums direct-keyed Likert responses per dimension', () => {
    const items = makeItems()
    // Answer only the two direct-keyed items per dimension (indices 0, 2)
    // with value 4. Reverse-keyed items are unanswered, so they don't
    // contribute.
    const answers: Answer[] = []
    for (const dim of BIG_FIVE_DIMENSIONS) {
      answers.push(answer(`bf-${dim}-1`, 4))
      answers.push(answer(`bf-${dim}-3`, 4))
    }
    const profile = computeBigFiveProfile(answers, items)
    for (const dim of BIG_FIVE_DIMENSIONS) {
      expect(profile[dim]).toBe(8) // 4 + 4
    }
  })

  it('applies reverse scoring so high agreement to a negatively-keyed item lowers the dimension', () => {
    const items = makeItems()
    // Pick one dimension; answer both reverse-keyed items (indices 1, 3)
    // with value 5. With reverse scoring each 5 flips to 1, so the sum
    // should be 2 — NOT 10.
    const dim = 'extraversion' as const
    const answers = [
      answer(`bf-${dim}-2`, 5),
      answer(`bf-${dim}-4`, 5),
    ]
    const profile = computeBigFiveProfile(answers, items)
    expect(profile[dim]).toBe(2)
    // Other dimensions untouched.
    expect(profile.openness).toBe(0)
  })

  it('mixes direct and reverse items into a single per-dimension sum', () => {
    const items = makeItems()
    // Openness: all 4 items answered with 3.
    // Direct items (indices 0, 2) contribute 3 each → 6.
    // Reverse items (indices 1, 3) contribute (6 - 3) = 3 each → 6.
    // Total: 12.
    const answers = [
      answer('bf-openness-1', 3),
      answer('bf-openness-2', 3),
      answer('bf-openness-3', 3),
      answer('bf-openness-4', 3),
    ]
    const profile = computeBigFiveProfile(answers, items)
    expect(profile.openness).toBe(12)
  })

  it('ignores answers that reference unknown item ids', () => {
    const items = makeItems()
    const profile = computeBigFiveProfile(
      [answer('not-a-real-item', 5)],
      items,
    )
    for (const dim of BIG_FIVE_DIMENSIONS) {
      expect(profile[dim]).toBe(0)
    }
  })

  it('ignores answers to RIASEC items (wrong layer)', () => {
    // A store hydrated mid-session can have both RIASEC and Big Five
    // answers sitting side by side. The Big Five scorer must filter by
    // layer so RIASEC answers never leak into a Big Five dimension.
    const items: Question[] = [
      ...makeItems(),
      {
        id: 'ip-r-01',
        layer: 'riasec',
        dimension: 'R',
        scale: 'likert5',
        text: { en: 'riasec item', de: 'riasec item' },
      },
    ]
    const profile = computeBigFiveProfile(
      [answer('ip-r-01', 5), answer('bf-openness-1', 4)],
      items,
    )
    expect(profile.openness).toBe(4)
  })
})

describe('normalizeBigFiveToPercent', () => {
  it('returns 100 for each dimension when all items max out', () => {
    const items = makeItems()
    // Direct items at 5, reverse items at 1 → effective 5 each → max.
    const answers: Answer[] = []
    for (const dim of BIG_FIVE_DIMENSIONS) {
      for (let i = 0; i < 4; i += 1) {
        answers.push(answer(`bf-${dim}-${i + 1}`, i % 2 === 1 ? 1 : 5))
      }
    }
    const raw = computeBigFiveProfile(answers, items)
    const percent = normalizeBigFiveToPercent(raw, items)
    for (const dim of BIG_FIVE_DIMENSIONS) {
      expect(percent[dim]).toBe(100)
    }
  })

  it('returns 20 for each dimension when all items bottom out', () => {
    const items = makeItems()
    // Direct items at 1, reverse items at 5 → effective 1 each → min.
    // 4 items × 1 = 4; 4 × 5 max = 20; 4/20 = 20%.
    const answers: Answer[] = []
    for (const dim of BIG_FIVE_DIMENSIONS) {
      for (let i = 0; i < 4; i += 1) {
        answers.push(answer(`bf-${dim}-${i + 1}`, i % 2 === 1 ? 5 : 1))
      }
    }
    const raw = computeBigFiveProfile(answers, items)
    const percent = normalizeBigFiveToPercent(raw, items)
    for (const dim of BIG_FIVE_DIMENSIONS) {
      expect(percent[dim]).toBe(20)
    }
  })

  it('produces 0 for every dimension when the item pool is empty', () => {
    const percent = normalizeBigFiveToPercent(
      {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
      },
      [],
    )
    for (const dim of BIG_FIVE_DIMENSIONS) {
      expect(percent[dim]).toBe(0)
    }
  })
})

describe('real IPIP data', () => {
  it('yields a balanced profile for uniform 3s across the 50-item IPIP set', async () => {
    // Integration-smoke: answering every real item with the neutral
    // value must land each dimension at 30 (sum of 10 items × 3), just
    // like the RIASEC equivalent test in store.test.ts. This proves the
    // JSON file is structurally consistent: 10 items per dimension,
    // none of the reverse flags scrambled.
    const data = (await import('@data/ipip-bigfive-items.json')).default
    const items = data.items as Question[]
    const answers: Answer[] = items.map((q) => ({
      questionId: q.id,
      value: 3,
      answeredAt: 0,
    }))
    const profile = computeBigFiveProfile(answers, items)
    for (const dim of BIG_FIVE_DIMENSIONS) {
      // Reverse flag flips 3 → (6 - 3) = 3 as well, so the midpoint is
      // immune to reverse keying — another reason to prefer it as the
      // smoke-test value over 1 or 5.
      expect(profile[dim]).toBe(30)
    }
    const percent = normalizeBigFiveToPercent(profile, items)
    for (const dim of BIG_FIVE_DIMENSIONS) {
      expect(percent[dim]).toBe(60) // 30 / 50 × 100
    }
  })
})
