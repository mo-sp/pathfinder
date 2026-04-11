import { describe, it, expect } from 'vitest'
import { pearsonCorrelation } from './pearson'

describe('pearsonCorrelation', () => {
  it('returns 0 for empty inputs', () => {
    expect(pearsonCorrelation([], [])).toBe(0)
  })

  it('returns 0 when vector lengths differ', () => {
    expect(pearsonCorrelation([1, 2], [1, 2, 3])).toBe(0)
  })

  it('returns 0 when one vector has zero variance', () => {
    // [1,1,1] has no variance → denominator collapses to 0 → guard returns 0
    expect(pearsonCorrelation([1, 1, 1], [1, 2, 3])).toBe(0)
  })

  it('returns 0 when both vectors have zero variance', () => {
    expect(pearsonCorrelation([5, 5, 5], [7, 7, 7])).toBe(0)
  })

  it('returns +1 for perfectly correlated vectors (same vector)', () => {
    expect(pearsonCorrelation([1, 2, 3, 4], [1, 2, 3, 4])).toBeCloseTo(1, 10)
  })

  it('returns +1 for a positive linear transform (scale-invariant)', () => {
    // Pearson is scale/shift-invariant: b = 2*a + 1 should still correlate perfectly
    expect(pearsonCorrelation([1, 2, 3], [3, 5, 7])).toBeCloseTo(1, 10)
  })

  it('returns -1 for a perfectly inverse linear relationship', () => {
    expect(pearsonCorrelation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 10)
  })

  it('returns a known value for a hand-computed example', () => {
    // a=[1,2,3,4,5], b=[2,4,5,4,5]
    // meanA=3, meanB=4, num=6, denA=10, denB=6 → 6/sqrt(60) ≈ 0.7745966
    expect(pearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])).toBeCloseTo(
      0.7745966,
      6,
    )
  })

  it('is symmetric: pearson(a, b) === pearson(b, a)', () => {
    const a = [1, 4, 9, 16, 25]
    const b = [2, 5, 11, 14, 27]
    expect(pearsonCorrelation(a, b)).toBeCloseTo(pearsonCorrelation(b, a), 10)
  })
})
