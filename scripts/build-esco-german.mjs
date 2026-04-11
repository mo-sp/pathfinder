#!/usr/bin/env node
/**
 * Patch src/data/onet-occupations.json with German occupation titles via the
 * official ESCO ↔ O*NET-SOC crosswalk and the public ESCO REST API.
 *
 * Pipeline:
 *   1. Read the ESCO ↔ O*NET crosswalk CSV from data-raw/esco/ (auto-
 *      downloads if missing). Each O*NET-SOC code can have multiple ESCO
 *      matches; we keep the best one by match type
 *      (exactMatch > closeMatch > broadMatch > narrowMatch).
 *   2. Read src/data/onet-occupations.json.
 *   3. For every occupation with an ESCO match, call the ESCO REST API
 *      (`https://ec.europa.eu/esco/api/resource/occupation?uri=…`) to fetch
 *      the German `preferredLabel.de`. Responses are cached on disk so re-
 *      runs are fast and offline-friendly.
 *   4. Write the patched JSON back, set `escoUri` and `title.de`, leave
 *      occupations without a match untouched (their `title.de` stays null
 *      and the UI keeps falling back to the English title).
 *
 * Usage:
 *   node scripts/build-esco-german.mjs
 *   ESCO_CONCURRENCY=20 node scripts/build-esco-german.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { parse } from 'csv-parse/sync'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ESCO_DIR = join(ROOT, 'data-raw/esco')
const CROSSWALK_PATH = join(ESCO_DIR, 'onet-esco-crosswalk.csv')
const CROSSWALK_URL =
  'https://esco.ec.europa.eu/system/files/2023-08/ONET_%28Occupations%29_0_updated.csv'
const CACHE_PATH = join(ESCO_DIR, 'esco-de-cache.json')
const OCCUPATIONS_PATH = join(ROOT, 'src/data/onet-occupations.json')
const ESCO_API = 'https://ec.europa.eu/esco/api/resource/occupation'

const MATCH_PRIORITY = {
  exactMatch: 4,
  closeMatch: 3,
  broadMatch: 2,
  narrowMatch: 1,
}

const CONCURRENCY = Number.parseInt(process.env.ESCO_CONCURRENCY ?? '15', 10)

function ensureCrosswalk() {
  if (existsSync(CROSSWALK_PATH)) return
  mkdirSync(ESCO_DIR, { recursive: true })
  console.log(`Downloading ${CROSSWALK_URL} ...`)
  const res = spawnSync('curl', ['-sSL', '-o', CROSSWALK_PATH, CROSSWALK_URL], {
    stdio: 'inherit',
  })
  if (res.status !== 0) throw new Error('curl failed downloading ESCO crosswalk')
}

// Quick-and-dirty English plural stemmer so "developer" matches "developers".
// Not perfect (won't handle "industries" → "industry") but good enough to keep
// the tiebreak honest on the O*NET vocabulary.
function stem(token) {
  if (token.length > 4 && token.endsWith('ies')) return token.slice(0, -3) + 'y'
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2)
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1)
  return token
}

function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .split(/[\s,;:/()\-–—]+/)
      .filter((t) => t.length > 2)
      .map(stem),
  )
}

/** Jaccard similarity of two title strings, in [0, 1]. */
function jaccard(a, b) {
  const ta = tokenize(a)
  const tb = tokenize(b)
  if (ta.size === 0 || tb.size === 0) return 0
  let common = 0
  for (const t of ta) if (tb.has(t)) common += 1
  const union = ta.size + tb.size - common
  return union === 0 ? 0 : common / union
}

function loadCrosswalk() {
  const raw = readFileSync(CROSSWALK_PATH, 'utf8')
  // The crosswalk file has 17 lines of project metadata before the actual
  // table header. csv-parse can skip them with `from_line`.
  const rows = parse(raw, {
    bom: true,
    columns: true,
    from_line: 17,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  })

  /** @type {Map<string, Array<{uri: string, enTitle: string, matchType: string, onetTitle: string}>>} */
  const grouped = new Map()
  for (const row of rows) {
    const code = row['O*NET Id']?.trim()
    const uri = row['ESCO or ISCO URI']?.trim()
    const enTitle = row['ESCO or ISCO Title']?.trim()
    const matchType = row['Type of Match']?.trim()
    const onetTitle = row['O*NET Title']?.trim() ?? ''
    // Only ESCO occupation URIs – ISCO group URIs use a different namespace
    // and the language API behaves differently for them.
    if (!code || !uri || !uri.startsWith('http://data.europa.eu/esco/occupation/')) continue

    if (!grouped.has(code)) grouped.set(code, [])
    grouped.get(code).push({ uri, enTitle, matchType, onetTitle })
  }

  // Pick the best match per O*NET code:
  //   1. highest priority match type
  //   2. within that group, highest token overlap with the O*NET title
  //   3. ties broken alphabetically by ESCO title
  /** @type {Map<string, {uri: string, enTitle: string, matchType: string}>} */
  const best = new Map()
  for (const [code, candidates] of grouped) {
    const winner = candidates.reduce((acc, cand) => {
      if (!acc) return cand
      const accScore = MATCH_PRIORITY[acc.matchType] ?? 0
      const candScore = MATCH_PRIORITY[cand.matchType] ?? 0
      if (candScore !== accScore) return candScore > accScore ? cand : acc

      const accSim = jaccard(acc.enTitle, acc.onetTitle)
      const candSim = jaccard(cand.enTitle, cand.onetTitle)
      if (candSim !== accSim) return candSim > accSim ? cand : acc

      return cand.enTitle.localeCompare(acc.enTitle) < 0 ? cand : acc
    }, null)
    if (winner) {
      best.set(code, {
        uri: winner.uri,
        enTitle: winner.enTitle,
        matchType: winner.matchType,
      })
    }
  }
  return best
}

function loadCache() {
  if (!existsSync(CACHE_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  mkdirSync(ESCO_DIR, { recursive: true })
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n')
}

async function fetchEscoGerman(uri) {
  const url = `${ESCO_API}?uri=${encodeURIComponent(uri)}&language=de`
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
        continue
      }
      if (!res.ok) return null
      const json = await res.json()
      const de = json.preferredLabel?.de
      return typeof de === 'string' && de.length > 0 ? de : null
    } catch {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
  return null
}

async function fetchAllGermanLabels(uris, cache) {
  const todo = uris.filter((u) => !(u in cache))
  console.log(`ESCO API: ${todo.length} URIs to fetch (${uris.length - todo.length} cached)`)

  let done = 0
  const results = { ...cache }
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY)
    const labels = await Promise.all(batch.map((uri) => fetchEscoGerman(uri)))
    batch.forEach((uri, idx) => {
      results[uri] = labels[idx]
    })
    done += batch.length
    if (done % 100 === 0 || done === todo.length) {
      console.log(`  ${done}/${todo.length}`)
      saveCache(results) // periodic checkpoint
    }
  }
  saveCache(results)
  return results
}

async function build() {
  ensureCrosswalk()

  console.log('Parsing crosswalk ...')
  const crosswalk = loadCrosswalk()
  console.log(`  ${crosswalk.size} O*NET codes have at least one ESCO match`)

  const occupations = JSON.parse(readFileSync(OCCUPATIONS_PATH, 'utf8'))
  console.log(`Loaded ${occupations.length} occupations from ${OCCUPATIONS_PATH}`)

  const matched = occupations
    .map((o) => crosswalk.get(o.onetCode))
    .filter((m) => m != null)
  const uniqueUris = [...new Set(matched.map((m) => m.uri))]
  console.log(
    `${matched.length}/${occupations.length} occupations have a crosswalk match (${uniqueUris.length} unique ESCO URIs)`,
  )

  const cache = loadCache()
  const labels = await fetchAllGermanLabels(uniqueUris, cache)

  let withGerman = 0
  for (const occ of occupations) {
    const match = crosswalk.get(occ.onetCode)
    if (!match) continue
    occ.escoUri = match.uri
    const de = labels[match.uri]
    if (de) {
      occ.title.de = de
      withGerman += 1
    }
  }

  writeFileSync(OCCUPATIONS_PATH, JSON.stringify(occupations, null, 2) + '\n')
  console.log(
    `Wrote ${occupations.length} occupations (${withGerman} with German title) → ${OCCUPATIONS_PATH}`,
  )
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
