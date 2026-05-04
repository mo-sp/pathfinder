#!/usr/bin/env node
/**
 * Diagnose BigFive coverage gap.
 *
 * Reads the 923-code corpus, reproduces build-bigfive-profiles.mjs mapping
 * logic, and classifies each unmapped O*NET code by failure mode:
 *
 *   A. no-crosswalk          — O*NET code has zero crosswalk rows
 *   B. unresolvable-esco     — has crosswalk rows but no row resolves to
 *                              a real ISCO-4d (X-suffix aggregates only,
 *                              or ESCO URIs not in tabiya)
 *   C. no-anni-data-at-4d    — resolves to a real ISCO-4d but Anni has
 *                              no profile for that 4d
 *
 * For category C, also reports sibling-recovery potential:
 *   3d-sibling: any ISCO-4d sharing the same first 3 digits with Anni data
 *   2d-sibling: any ISCO-4d sharing the same first 2 digits with Anni data
 *
 * For categories A+B, reports SOC-sibling potential:
 *   any other O*NET code with same first 5 digits (SOC-detail) that IS mapped
 *
 * Usage: node scripts/audit/bigfive-coverage-gap.mjs
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'csv-parse/sync'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')

const CORPUS = JSON.parse(readFileSync(join(ROOT, 'src/data/onet-occupations.json'), 'utf-8'))
const ANNI = JSON.parse(readFileSync(join(ROOT, 'scripts/input/anni-bigfive-profiles.json'), 'utf-8'))
const BIGFIVE_OUTPUT = JSON.parse(
  readFileSync(join(ROOT, 'src/data/bigfive-occupation-profiles.json'), 'utf-8'),
)

// Anni ISCO-4d codes that are real (not X-aggregates)
const anniIsco4d = new Set()
for (const p of ANNI.profiles) {
  if (/x/i.test(p.iscoCode)) continue
  anniIsco4d.add(p.iscoCode)
}

// Tabiya: ESCO URI → ISCO-4d
const tabiyaCsv = readFileSync(join(ROOT, 'data-raw/esco/tabiya-occupations.csv'), 'utf-8')
const tabiyaRows = parse(tabiyaCsv, { columns: true, skip_empty_lines: true })
const escoToIsco = new Map()
for (const row of tabiyaRows) {
  if (!row.ORIGINURI || !row.ISCOGROUPCODE) continue
  escoToIsco.set(row.ORIGINURI.trim(), row.ISCOGROUPCODE.trim())
}

function resolveIsco(uri) {
  const direct = uri.match(/\/esco\/isco\/C(\d{4})$/)
  if (direct) return direct[1]
  return escoToIsco.get(uri) ?? null
}

// Crosswalk: O*NET → list of ESCO URIs
const crosswalkCsv = readFileSync(join(ROOT, 'data-raw/esco/onet-esco-crosswalk.csv'), 'utf-8')
const crosswalkRows = parse(crosswalkCsv, {
  columns: false,
  skip_empty_lines: true,
  relax_column_count: true,
})
const crosswalkByOnet = new Map()
for (const row of crosswalkRows) {
  if (row.length < 7) continue
  const onetCode = row[0]
  const escoUri = row[3]
  if (!/^\d{2}-\d{4}\.\d{2}$/.test(onetCode) || !escoUri) continue
  if (!crosswalkByOnet.has(onetCode)) crosswalkByOnet.set(onetCode, [])
  crosswalkByOnet.get(onetCode).push(escoUri)
}

const mappedOnet = new Set(Object.keys(BIGFIVE_OUTPUT.profiles))

const buckets = { A: [], B: [], C: [] }

for (const occ of CORPUS) {
  if (mappedOnet.has(occ.onetCode)) continue

  const partners = crosswalkByOnet.get(occ.onetCode) ?? []
  if (partners.length === 0) {
    buckets.A.push({ onetCode: occ.onetCode, titleEn: occ.title.en, titleDe: occ.title.de })
    continue
  }

  const resolved4d = []
  for (const uri of partners) {
    const code = resolveIsco(uri)
    if (code) resolved4d.push(code)
  }

  if (resolved4d.length === 0) {
    buckets.B.push({
      onetCode: occ.onetCode,
      titleEn: occ.title.en,
      titleDe: occ.title.de,
      partners: partners.length,
    })
    continue
  }

  // Has resolved 4d codes but none have Anni data
  buckets.C.push({
    onetCode: occ.onetCode,
    titleEn: occ.title.en,
    titleDe: occ.title.de,
    isco4d: [...new Set(resolved4d)],
  })
}

// Sibling recovery analysis
function siblingScore3d(isco4d) {
  const prefix = isco4d.slice(0, 3)
  const matches = [...anniIsco4d].filter((c) => c.startsWith(prefix))
  return matches
}
function siblingScore2d(isco4d) {
  const prefix = isco4d.slice(0, 2)
  const matches = [...anniIsco4d].filter((c) => c.startsWith(prefix))
  return matches
}

const cWithRecovery = buckets.C.map((entry) => {
  let bestRecovery = null
  for (const code of entry.isco4d) {
    const sib3 = siblingScore3d(code)
    const sib2 = siblingScore2d(code)
    if (sib3.length > 0) {
      bestRecovery = { tier: '3d', siblings: sib3.length, anchor: code }
      break
    } else if (sib2.length > 0 && (!bestRecovery || bestRecovery.tier === '2d')) {
      bestRecovery = { tier: '2d', siblings: sib2.length, anchor: code }
    } else if (!bestRecovery) {
      bestRecovery = { tier: 'none', siblings: 0, anchor: code }
    }
  }
  return { ...entry, recovery: bestRecovery }
})

// SOC-sibling analysis for A+B
function socSibling(onetCode) {
  const soc5 = onetCode.slice(0, 7) // e.g. "15-1252"
  const sibs = []
  for (const code of mappedOnet) {
    if (code !== onetCode && code.startsWith(soc5)) sibs.push(code)
  }
  return sibs
}

const aWithRecovery = buckets.A.map((entry) => ({ ...entry, socSiblings: socSibling(entry.onetCode) }))
const bWithRecovery = buckets.B.map((entry) => ({ ...entry, socSiblings: socSibling(entry.onetCode) }))

// Distribution helpers
function bySocMajor(list) {
  const map = new Map()
  for (const e of list) {
    const major = e.onetCode.slice(0, 2)
    map.set(major, (map.get(major) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}
function byIsco2d(list) {
  const map = new Map()
  for (const e of list) {
    const code = e.isco4d?.[0] ?? null
    if (!code) continue
    const isco2 = code.slice(0, 2)
    map.set(isco2, (map.get(isco2) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
}

// SOC-major label lookup (first occurrence in corpus per major-2)
const socMajorLabel = new Map()
for (const occ of CORPUS) {
  const major = occ.onetCode.slice(0, 2)
  if (!socMajorLabel.has(major)) {
    // crude: take part of title before "/" or just the en title
    socMajorLabel.set(major, occ.title.en)
  }
}

// Output report
console.log('='.repeat(72))
console.log('BigFive coverage gap diagnostic')
console.log('='.repeat(72))
console.log(`Corpus size:                       ${CORPUS.length}`)
console.log(`Currently mapped:                  ${mappedOnet.size}`)
console.log(`Unmapped:                          ${CORPUS.length - mappedOnet.size}`)
console.log(`Anni real ISCO-4d codes:           ${anniIsco4d.size}`)
console.log()
console.log(`Bucket A (no crosswalk row):       ${buckets.A.length}`)
console.log(`Bucket B (unresolvable ESCO URI):  ${buckets.B.length}`)
console.log(`Bucket C (4d resolved, no Anni):   ${buckets.C.length}`)
console.log()

console.log('-'.repeat(72))
console.log('Bucket A — distribution by SOC major')
console.log('-'.repeat(72))
for (const [major, count] of bySocMajor(buckets.A)) {
  console.log(`  ${major}-xxxx  ${String(count).padStart(3)}  (${socMajorLabel.get(major)?.slice(0, 50) ?? ''}…)`)
}

console.log()
console.log('-'.repeat(72))
console.log('Bucket A — sample (first 30) with SOC-sibling recovery counts')
console.log('-'.repeat(72))
for (const e of aWithRecovery.slice(0, 30)) {
  console.log(`  ${e.onetCode}  sibs=${e.socSiblings.length}  ${e.titleEn.slice(0, 55)}`)
}
const aWithSibs = aWithRecovery.filter((e) => e.socSiblings.length > 0).length
console.log(`  ... (${aWithRecovery.length} total; ${aWithSibs} have ≥1 mapped SOC-sibling)`)

console.log()
console.log('-'.repeat(72))
console.log('Bucket B — distribution by SOC major')
console.log('-'.repeat(72))
for (const [major, count] of bySocMajor(buckets.B)) {
  console.log(`  ${major}-xxxx  ${String(count).padStart(3)}`)
}
console.log()
console.log('Bucket B — entries (all)')
for (const e of bWithRecovery) {
  console.log(`  ${e.onetCode}  partners=${e.partners}  sibs=${e.socSiblings.length}  ${e.titleEn.slice(0, 50)}`)
}

console.log()
console.log('-'.repeat(72))
console.log('Bucket C — distribution by ISCO-2d')
console.log('-'.repeat(72))
for (const [isco2, count] of byIsco2d(buckets.C)) {
  console.log(`  ISCO ${isco2}xx  ${String(count).padStart(3)}`)
}

console.log()
console.log('-'.repeat(72))
console.log('Bucket C — recovery potential at sibling levels')
console.log('-'.repeat(72))
const cByRecovery = { '3d': 0, '2d': 0, none: 0 }
for (const e of cWithRecovery) {
  cByRecovery[e.recovery.tier]++
}
console.log(`  3d-sibling recoverable:   ${cByRecovery['3d']}`)
console.log(`  2d-sibling recoverable:   ${cByRecovery['2d']}`)
console.log(`  no sibling recovery:      ${cByRecovery['none']}`)

console.log()
console.log('-'.repeat(72))
console.log('Bucket C — sample (first 30)')
console.log('-'.repeat(72))
for (const e of cWithRecovery.slice(0, 30)) {
  const rec =
    e.recovery.tier === 'none'
      ? 'no-sib'
      : `${e.recovery.tier}@${e.recovery.anchor.slice(0, e.recovery.tier === '3d' ? 3 : 2)} (${e.recovery.siblings} sibs)`
  console.log(`  ${e.onetCode}  isco=${e.isco4d.join(',')}  ${rec}  ${e.titleEn.slice(0, 50)}`)
}
console.log(`  ... (${cWithRecovery.length} total)`)

console.log()
console.log('-'.repeat(72))
console.log('Bucket C — entries with no sibling recovery (full list)')
console.log('-'.repeat(72))
for (const e of cWithRecovery.filter((x) => x.recovery.tier === 'none')) {
  console.log(`  ${e.onetCode}  isco=${e.isco4d.join(',')}  ${e.titleEn.slice(0, 55)}`)
}

console.log()
console.log('='.repeat(72))
console.log('Total recovery projection')
console.log('='.repeat(72))
const total = buckets.A.length + buckets.B.length + buckets.C.length
const cRecovered = cByRecovery['3d'] + cByRecovery['2d']
const abRecovered = aWithRecovery.filter((e) => e.socSiblings.length > 0).length
  + bWithRecovery.filter((e) => e.socSiblings.length > 0).length
console.log(`Total unmapped:                            ${total}`)
console.log(`Recoverable via ISCO-3d/2d siblings (C):   ${cRecovered}`)
console.log(`Recoverable via SOC siblings (A+B):        ${abRecovered}`)
console.log(`Combined recoverable (no double-count):    ${cRecovered + abRecovered}`)
console.log(`Residual needing hand-curation:            ${total - cRecovered - abRecovered}`)
