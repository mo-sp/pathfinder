/**
 * Pearson product-moment correlation coefficient between two equal-length
 * numeric vectors. Returns a value in [-1, 1], or 0 if either vector is
 * constant (no variance) or the inputs are mismatched.
 */
export function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0

  const n = a.length
  let sumA = 0
  let sumB = 0
  for (let i = 0; i < n; i++) {
    sumA += a[i]
    sumB += b[i]
  }
  const meanA = sumA / n
  const meanB = sumB / n

  let num = 0
  let denA = 0
  let denB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denA += da * da
    denB += db * db
  }

  const den = Math.sqrt(denA * denB)
  if (den === 0) return 0
  return num / den
}
