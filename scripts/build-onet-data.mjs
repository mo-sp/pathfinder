#!/usr/bin/env node
/**
 * Build src/data/onet-occupations.json from the O*NET database.
 *
 * Reads:
 *   data-raw/db_29_2_text/Interests.txt
 *   data-raw/db_29_2_text/Occupation Data.txt
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
 *   ONET_DB_VERSION=29_2 node scripts/build-onet-data.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const VERSION = process.env.ONET_DB_VERSION ?? '29_2'
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

function build() {
  ensureRawData()

  const interestsRows = parseTsv(join(DB_DIR, 'Interests.txt'))
  const occupationRows = parseTsv(join(DB_DIR, 'Occupation Data.txt'))

  const titles = new Map()
  for (const row of occupationRows) {
    titles.set(row['O*NET-SOC Code'], {
      title: row['Title'],
      description: row['Description'],
    })
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
    occupations.push({
      onetCode: code,
      title: { en: meta.title, de: null },
      description: { en: meta.description, de: null },
      riasecProfile: profile,
    })
  }

  occupations.sort((a, b) => a.onetCode.localeCompare(b.onetCode))

  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify(occupations, null, 2) + '\n')
  console.log(`Wrote ${occupations.length} occupations → ${OUT_PATH}`)
}

build()
