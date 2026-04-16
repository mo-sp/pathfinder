#!/usr/bin/env node
/**
 * Build src/data/onet-occupations.json from the O*NET database.
 *
 * Reads:
 *   data-raw/db_30_2_text/Interests.txt
 *   data-raw/db_30_2_text/Occupation Data.txt
 *   data-raw/db_30_2_text/Job Zones.txt
 *   data-raw/db_30_2_text/Work Context.txt
 *   data-raw/db_30_2_text/Skills.txt
 *   data-raw/db_30_2_text/Abilities.txt
 *   data-raw/db_30_2_text/Knowledge.txt
 *
 * Writes:
 *   src/data/onet-occupations.json
 *
 * If the raw files are missing, downloads and unzips the official O*NET text
 * archive (CC BY 4.0) into ./data-raw/ first. Requires `curl` and `unzip` on
 * the system PATH.
 *
 * Usage:
 *   node scripts/build-onet-data.mjs
 *   ONET_DB_VERSION=30_2 node scripts/build-onet-data.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import curatedProfiles from './input/curated-occupation-profiles.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const VERSION = process.env.ONET_DB_VERSION ?? '30_2'
const RAW_DIR = join(ROOT, 'data-raw')
const DB_DIR = join(RAW_DIR, `db_${VERSION}_text`)
const ZIP_PATH = join(RAW_DIR, `db_${VERSION}_text.zip`)
const URL = `https://www.onetcenter.org/dl_files/database/db_${VERSION}_text.zip`
const OUT_PATH = join(ROOT, 'src/data/onet-occupations.json')

const DIM_MAP = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprising: 'E',
  Conventional: 'C',
}

function ensureRawData() {
  if (existsSync(DB_DIR)) return
  mkdirSync(RAW_DIR, { recursive: true })
  if (!existsSync(ZIP_PATH)) {
    console.log(`Downloading ${URL} ...`)
    const res = spawnSync('curl', ['-sSL', '-o', ZIP_PATH, URL], { stdio: 'inherit' })
    if (res.status !== 0) throw new Error('curl failed')
  }
  console.log(`Unzipping ${ZIP_PATH} ...`)
  const res = spawnSync('unzip', ['-o', '-q', ZIP_PATH, '-d', RAW_DIR], { stdio: 'inherit' })
  if (res.status !== 0) throw new Error('unzip failed')
}

function parseTsv(path) {
  const text = readFileSync(path, 'utf8')
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  const headers = lines[0].split('\t')
  return lines.slice(1).map((line) => {
    const cells = line.split('\t')
    const row = {}
    headers.forEach((h, i) => {
      row[h] = cells[i]
    })
    return row
  })
}

// Work Context elements we extract for the values layer (Layer 3).
// Each maps to a values dimension that users declare preferences for.
const WORK_CONTEXT_ELEMENTS = [
  'Indoors, Environmentally Controlled',
  'Outdoors, Exposed to All Weather Conditions',
  'Contact With Others',
  'Work With or Contribute to a Work Group or Team',
  'Spend Time Standing',
  'Spend Time Walking or Running',
  'Freedom to Make Decisions',
  'Deal With External Customers or the Public in General',
  'Importance of Repeating Same Tasks',
]

const WORK_CONTEXT_KEY_MAP = {
  'Indoors, Environmentally Controlled': 'indoor',
  'Outdoors, Exposed to All Weather Conditions': 'outdoor',
  'Contact With Others': 'contactWithOthers',
  'Work With or Contribute to a Work Group or Team': 'teamwork',
  'Spend Time Standing': 'standing',
  'Spend Time Walking or Running': 'walking',
  'Freedom to Make Decisions': 'autonomy',
  'Deal With External Customers or the Public in General': 'publicContact',
  'Importance of Repeating Same Tasks': 'routine',
}

/**
 * Extract per-occupation Level + Importance data from a Skills/Abilities/
 * Knowledge file. Each element has two rows per occupation (one per scale
 * ID: IM = Importance 1-5, LV = Level 0-7). We combine both into a single
 * `{ l: level, i: importance }` entry per O*NET Element ID, stored under
 * the occupation's `skills` / `abilities` / `knowledge` key. Short keys
 * save ~1.5MB of JSON across 923 occupations × 120 items.
 */
function parseLayer4Source(path) {
  const rows = parseTsv(path)
  /** @type {Map<string, Record<string, { l: number; i: number }>>} */
  const byOccupation = new Map()
  const pending = new Map() // `${code}\t${elementId}` → partial entry
  for (const row of rows) {
    const code = row['O*NET-SOC Code']
    const elementId = row['Element ID']
    const scale = row['Scale ID']
    const value = Number.parseFloat(row['Data Value'])
    if (!code || !elementId || !Number.isFinite(value)) continue
    if (scale !== 'IM' && scale !== 'LV') continue
    const key = `${code}\t${elementId}`
    const existing = pending.get(key) ?? {}
    if (scale === 'IM') existing.i = Math.round(value * 100) / 100
    else existing.l = Math.round(value * 100) / 100
    pending.set(key, existing)
    if (existing.i != null && existing.l != null) {
      if (!byOccupation.has(code)) byOccupation.set(code, {})
      byOccupation.get(code)[elementId] = existing
      pending.delete(key)
    }
  }
  return byOccupation
}

function build() {
  ensureRawData()

  const interestsRows = parseTsv(join(DB_DIR, 'Interests.txt'))
  const occupationRows = parseTsv(join(DB_DIR, 'Occupation Data.txt'))
  const jobZoneRows = parseTsv(join(DB_DIR, 'Job Zones.txt'))
  const workContextRows = parseTsv(join(DB_DIR, 'Work Context.txt'))
  const skillsByOcc = parseLayer4Source(join(DB_DIR, 'Skills.txt'))
  const abilitiesByOcc = parseLayer4Source(join(DB_DIR, 'Abilities.txt'))
  const knowledgeByOcc = parseLayer4Source(join(DB_DIR, 'Knowledge.txt'))

  const titles = new Map()
  for (const row of occupationRows) {
    titles.set(row['O*NET-SOC Code'], {
      title: row['Title'],
      description: row['Description'],
    })
  }

  // Job Zones: O*NET-SOC Code → 1-5
  const jobZones = new Map()
  for (const row of jobZoneRows) {
    const zone = Number.parseInt(row['Job Zone'], 10)
    if (Number.isFinite(zone)) {
      jobZones.set(row['O*NET-SOC Code'], zone)
    }
  }

  // Work Context: O*NET-SOC Code → { indoor, outdoor, ... }
  // Only CX scale rows (the context-level mean, not the category percentages).
  const workContextMap = new Map()
  for (const row of workContextRows) {
    if (row['Scale ID'] !== 'CX') continue
    if (!WORK_CONTEXT_ELEMENTS.includes(row['Element Name'])) continue
    const code = row['O*NET-SOC Code']
    const key = WORK_CONTEXT_KEY_MAP[row['Element Name']]
    const value = Number.parseFloat(row['Data Value'])
    if (!key || !Number.isFinite(value)) continue
    if (!workContextMap.has(code)) workContextMap.set(code, {})
    workContextMap.get(code)[key] = Math.round(value * 100) / 100
  }

  /** @type {Map<string, Record<string, number>>} */
  const profiles = new Map()
  for (const row of interestsRows) {
    if (row['Scale ID'] !== 'OI') continue
    const dim = DIM_MAP[row['Element Name']]
    if (!dim) continue
    const code = row['O*NET-SOC Code']
    const value = Number.parseFloat(row['Data Value'])
    if (!Number.isFinite(value)) continue
    if (!profiles.has(code)) {
      profiles.set(code, { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
    }
    profiles.get(code)[dim] = value
  }

  const occupations = []
  for (const [code, profile] of profiles) {
    const meta = titles.get(code)
    if (!meta) continue
    const entry = {
      onetCode: code,
      title: { en: meta.title, de: null },
      description: { en: meta.description, de: null },
      riasecProfile: profile,
      jobZone: jobZones.get(code) ?? null,
    }
    const wc = workContextMap.get(code)
    if (wc) entry.workContext = wc
    const skills = skillsByOcc.get(code)
    const abilities = abilitiesByOcc.get(code)
    const knowledge = knowledgeByOcc.get(code)
    if (skills) entry.skills = skills
    if (abilities) entry.abilities = abilities
    if (knowledge) entry.knowledge = knowledge
    occupations.push(entry)
  }

  occupations.sort((a, b) => a.onetCode.localeCompare(b.onetCode))

  // Apply PathFinder-curated profile overrides for occupations where O*NET
  // has no survey data. Each field is applied ONLY when the corresponding
  // field is missing from the raw O*NET data — the moment a future O*NET
  // release ships real data for one of these codes, the override becomes
  // a no-op and the real data wins. See curated-occupation-profiles.mjs
  // for the rationale and scale semantics.
  let curatedApplied = { workContext: 0, skills: 0, abilities: 0, knowledge: 0 }
  for (const occ of occupations) {
    const curated = curatedProfiles[occ.onetCode]
    if (!curated) continue
    if (!occ.workContext && curated.workContext) {
      occ.workContext = curated.workContext
      curatedApplied.workContext++
    }
    if (!occ.skills && curated.skills) {
      occ.skills = curated.skills
      curatedApplied.skills++
    }
    if (!occ.abilities && curated.abilities) {
      occ.abilities = curated.abilities
      curatedApplied.abilities++
    }
    if (!occ.knowledge && curated.knowledge) {
      occ.knowledge = curated.knowledge
      curatedApplied.knowledge++
    }
    if (curated._source) occ.dataSource = curated._source
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(occupations, null, 2) + '\n')
  console.log(`Wrote ${occupations.length} occupations → ${OUT_PATH}`)
  console.log(`  curated overlay applied (only where O*NET data missing):`)
  console.log(`    workContext: +${curatedApplied.workContext}`)
  console.log(`    skills:      +${curatedApplied.skills}`)
  console.log(`    abilities:   +${curatedApplied.abilities}`)
  console.log(`    knowledge:   +${curatedApplied.knowledge}`)

  // Stats
  const withJobZone = occupations.filter((o) => o.jobZone != null).length
  const withWorkContext = occupations.filter((o) => o.workContext).length
  const withSkills = occupations.filter((o) => o.skills).length
  const withAbilities = occupations.filter((o) => o.abilities).length
  const withKnowledge = occupations.filter((o) => o.knowledge).length
  console.log(`  jobZone: ${withJobZone}/${occupations.length}`)
  console.log(`  workContext: ${withWorkContext}/${occupations.length}`)
  console.log(`  skills:    ${withSkills}/${occupations.length}`)
  console.log(`  abilities: ${withAbilities}/${occupations.length}`)
  console.log(`  knowledge: ${withKnowledge}/${occupations.length}`)
}

build()
