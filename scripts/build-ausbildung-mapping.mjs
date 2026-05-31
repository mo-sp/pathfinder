#!/usr/bin/env node
/**
 * Build src/data/ausbildung-occupation-mapping.json — a per-O*NET-code map to
 * the canonical German "anerkannter Ausbildungsberuf" (recognised training
 * occupation), surfaced as supplementary text on each occupation card.
 *
 * Data source:
 *   scripts/input/bibb-ausbildungsberufe.json — extracted from the BIBB list
 *   "Erhebungsberufe der Berufsbildungsstatistik mit Berufsschlüsseln der
 *   KldB 2010" (Tabelle 1, staatlich anerkannte Ausbildungsberufe BBiG/HwO).
 *   Aufgehobene Berufe removed, chamber/VO/§ tags cleaned, deduped by
 *   (name, KldB-5). Each entry carries kldb5 (first 5 digits of the 8-digit
 *   erweiterte KldB-2010) and kldb4 (Berufsgattung).
 *
 * Matching strategy (hybrid — KldB gate + title similarity):
 *   The KldB-5 group bundles up to ~32 Ausbildungsberufe, so a pure code join
 *   mispairs (Chemielaborant → Textillaborant). Instead:
 *     1. Gate: candidates = BIBB berufe sharing the occupation's KldB-5 code
 *        (fallback: KldB-4 Berufsgattung when the 5-digit group is empty).
 *     2. Pick: the candidate with the highest title-token overlap against the
 *        occupation's title.de (male form), provided it clears THRESHOLD.
 *   This is high-precision for lexically similar pairs and leaves the rest
 *   blank — semantically-correct-but-lexically-different pairs and wrong
 *   sibling picks are corrected in scripts/input/ausbildung-overrides.mjs.
 *
 * Output:
 *   src/data/ausbildung-occupation-mapping.json  (runtime overlay)
 *   scripts/audit/ausbildung-matches.md          (full review list for @mo-sp)
 *
 * Usage:
 *   node scripts/build-ausbildung-mapping.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ausbildungOverrides } from './input/ausbildung-overrides.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const BIBB_INPUT = join(ROOT, 'scripts/input/bibb-ausbildungsberufe.json')
const ONET_INPUT = join(ROOT, 'src/data/onet-occupations.json')
const KLDB_INPUT = join(ROOT, 'src/data/kldb-occupation-mapping.json')
const OUT_PATH = join(ROOT, 'src/data/ausbildung-occupation-mapping.json')
const AUDIT_PATH = join(ROOT, 'scripts/audit/ausbildung-matches.md')

/** Minimum title-token overlap for an automatic match. Below this → blank. */
const THRESHOLD = 0.5

const STOPWORDS = new Set([
  'für', 'und', 'der', 'die', 'das', 'mit', 'von', 'den', 'dem', 'fr',
  'beruf', 'berufe', 'fachkraft', 'fachmann', 'fachfrau', 'monoberuf',
])

/** Normalise a German occupation title to a comparable token set. */
function tokens(raw) {
  const male = raw.split('/')[0] // "Web-Entwickler/Web-Entwicklerin" → male form
  const words = male
    .toLowerCase()
    .replace(/\/-?in(nen)?\b/g, '')
    .replace(/[^a-zäöüß0-9]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  return new Set(words)
}

/** Overlap score: |A ∩ B| / min(|A|, |B|), 0..1. Compound nouns match as whole tokens. */
function similarity(aTokens, bTokens) {
  if (!aTokens.size || !bTokens.size) return 0
  let inter = 0
  for (const t of aTokens) if (bTokens.has(t)) inter++
  return inter / Math.min(aTokens.size, bTokens.size)
}

// ── Load inputs ──────────────────────────────────────────────────────────
const bibbDoc = JSON.parse(readFileSync(BIBB_INPUT, 'utf8'))
const occupations = JSON.parse(readFileSync(ONET_INPUT, 'utf8'))
const kldbDoc = JSON.parse(readFileSync(KLDB_INPUT, 'utf8'))
const kldbMap = kldbDoc.mappings ?? kldbDoc

// Pre-tokenise BIBB berufe, index by KldB-5 and KldB-4 (deduped names).
const bibb = bibbDoc.ausbildungsberufe.map((b) => ({ ...b, tok: tokens(b.name) }))
const by5 = new Map()
const by4 = new Map()
for (const b of bibb) {
  if (!by5.has(b.kldb5)) by5.set(b.kldb5, [])
  if (!by4.has(b.kldb4)) by4.set(b.kldb4, [])
  by5.get(b.kldb5).push(b)
  by4.get(b.kldb4).push(b)
}

// ── Match ────────────────────────────────────────────────────────────────
const mappings = {}
const review = [] // for the audit file: every occupation with a candidate group

let auto = 0
let overridden = 0
let suppressed = 0
let belowThreshold = 0
let noGroup = 0
let helferSkipped = 0

for (const occ of occupations) {
  const code = occ.onetCode
  const overlay = kldbMap[code]
  const kldb = overlay?.kldbCode ?? occ.kldbCode
  const titleDe = occ.title?.de
  const hasOverride = Object.prototype.hasOwnProperty.call(ausbildungOverrides, code)

  // Manual override wins outright (string forces a name, null suppresses).
  if (hasOverride) {
    const forced = ausbildungOverrides[code]
    if (forced) {
      mappings[code] = { ausbildungsberuf: forced, source: 'override' }
      overridden++
      review.push({ code, titleDe, chosen: forced, score: 1, cands: 0, status: 'override' })
    } else {
      suppressed++
      review.push({ code, titleDe, chosen: null, score: 0, cands: 0, status: 'suppressed' })
    }
    continue
  }

  if (!kldb || !titleDe) {
    noGroup++
    continue
  }
  // Anforderungsniveau 1 = Helfer/angelernt: by definition not a recognised
  // Ausbildungsberuf. Skip so the KldB-4 fallback can't pull a Helfer job
  // (e.g. Bauhelfer) onto a skilled trade (Maler/-in und Lackierer/-in).
  const anf = overlay?.anforderungsniveau ?? occ.anforderungsniveau
  if (anf === 1) {
    helferSkipped++
    continue
  }
  const k5 = String(kldb).slice(0, 5)
  const k4 = String(kldb).slice(0, 4)
  const cands = by5.get(k5) ?? by4.get(k4) ?? []
  if (!cands.length) {
    noGroup++
    continue
  }

  const occTok = tokens(titleDe)
  // Dedup candidate names; keep the best-scoring instance per unique name.
  let best = null
  let bestScore = 0
  for (const c of cands) {
    const s = similarity(occTok, c.tok)
    if (s > bestScore) {
      bestScore = s
      best = c
    }
  }

  const uniqueCandNames = new Set(cands.map((c) => c.name)).size
  if (best && bestScore >= THRESHOLD) {
    mappings[code] = {
      ausbildungsberuf: best.name,
      kldb: best.kldb5,
      score: Number(bestScore.toFixed(2)),
      source: 'auto',
    }
    auto++
    review.push({ code, titleDe, chosen: best.name, score: bestScore, cands: uniqueCandNames, status: 'auto' })
  } else {
    belowThreshold++
    review.push({
      code,
      titleDe,
      chosen: best ? best.name : null,
      score: bestScore,
      cands: uniqueCandNames,
      status: 'below',
    })
  }
}

// ── Write runtime overlay ──────────────────────────────────────────────────
const outDoc = {
  _meta: {
    source: bibbDoc._meta.source,
    sourceUrl: bibbDoc._meta.sourceUrl,
    built: bibbDoc._meta.extracted,
    threshold: THRESHOLD,
    note:
      'Hybrid KldB-gate + title-similarity match of O*NET occupations to BIBB ' +
      'anerkannte Ausbildungsberufe. source=auto|override. Regenerate with ' +
      'node scripts/build-ausbildung-mapping.mjs',
    license: bibbDoc._meta.license,
  },
  mappings,
}
writeFileSync(OUT_PATH, JSON.stringify(outDoc, null, 2) + '\n')

// ── Write full review file ─────────────────────────────────────────────────
if (!existsSync(dirname(AUDIT_PATH))) mkdirSync(dirname(AUDIT_PATH), { recursive: true })
const order = { override: 0, auto: 1, below: 2, suppressed: 3 }
review.sort(
  (a, b) => order[a.status] - order[b.status] || b.score - a.score || (a.titleDe ?? '').localeCompare(b.titleDe ?? ''),
)
const rows = review
  .map((r) => {
    const flag = { override: '🔧', auto: '✅', below: '·', suppressed: '🚫' }[r.status]
    return `| ${flag} | ${r.score.toFixed(2)} | ${r.cands || '-'} | ${r.code} | ${r.titleDe ?? ''} | ${r.chosen ?? '—'} |`
  })
  .join('\n')
const md = `# Ausbildungsberufe-Match — Review

Generated by \`scripts/build-ausbildung-mapping.mjs\` (threshold ${THRESHOLD}).
Source: BIBB Erhebungsberufe mit KldB 2010 (Tabelle 1, anerkannte Ausbildungsberufe).

Legend: ✅ auto-match (shown on card) · · below threshold (blank, candidate shown for review) · 🔧 manual override · 🚫 suppressed.

To correct: add an entry to \`scripts/input/ausbildung-overrides.mjs\`
(\`"code": "Name"\` to force, \`"code": null\` to suppress), then re-run the build.

**${auto} auto-matched** · ${overridden} override · ${suppressed} suppressed · ${belowThreshold} below threshold · ${noGroup} no KldB candidate group.

| | score | #cand | O*NET | Unser Titel (DE) | → Ausbildungsberuf |
|---|---|---|---|---|---|
${rows}
`
writeFileSync(AUDIT_PATH, md)

// ── Stats ──────────────────────────────────────────────────────────────────
console.log(`BIBB Ausbildungsberufe: ${bibb.length} (${by5.size} KldB-5 groups, ${by4.size} KldB-4)`)
console.log(`O*NET occupations: ${occupations.length}`)
console.log('match result:', {
  auto,
  override: overridden,
  suppressed,
  belowThreshold,
  noGroup,
  helferSkipped,
})
console.log(`Wrote ${OUT_PATH}`)
console.log(`Wrote ${AUDIT_PATH}`)
