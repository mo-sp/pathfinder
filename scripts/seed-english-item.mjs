#!/usr/bin/env node
/**
 * Seed the PathFinder-authored "Englisch" knowledge item (onetElementId
 * `2.C.7.eng`) into every occupation's knowledge block in
 * src/data/onet-occupations.json.
 *
 * Rationale: O*NET's `2.C.7.b` "Foreign Language" values reflect the US
 * labour market, where "foreign language" means non-English (typically
 * Spanish) and is required for relatively few roles. In the DE market
 * English is a distinct construct — the de-facto lingua franca for
 * tech/research/business, with much higher requirements than the raw
 * O*NET values suggest for the same occupations. We therefore split the
 * question into two items: existing `2.C.7.b` is relabelled "Weitere
 * Fremdsprachen" (Englisch excluded), and this new `2.C.7.eng` is seeded
 * with DE-labour-market-calibrated values per SOC major group.
 *
 * Calibration source: triangulation of 10 independent Sonnet-agent
 * estimates for 10 representative occupations plus external evidence
 * (UEPO 900k-job-posting analysis Jan 2021, OECD 2023 skill-demand
 * study). See SUMMARY.md session entry for the full methodology.
 *
 * Idempotent — re-running with the same anchors overwrites the prior
 * 2.C.7.eng entry on each occupation.
 *
 * Usage: node scripts/seed-english-item.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OCC_PATH = join(__dirname, '..', 'src/data/onet-occupations.json')
const NEW_ELEMENT = '2.C.7.eng'

/** SOC-major / minor group anchors for Englisch (O*NET l 0-7, i 1-5). */
const ANCHORS = {
  // Tech / research / engineering — high, English = lingua franca.
  '15': { l: 4.0, i: 4.0 }, // Computer & Math
  '19': { l: 4.8, i: 4.5 }, // Life / Physical / Social Sciences
  '17': { l: 3.8, i: 3.0 }, // Engineering
  // Management & business — bimodal (SME low / DAX high), averaged.
  '11': { l: 3.5, i: 2.8 }, // Management
  '13-1': { l: 3.2, i: 2.8 }, // Business operations specialists (analysts)
  '13-2': { l: 2.0, i: 1.8 }, // Financial specialists (retail-facing)
  // Legal — 66% of DE legal job postings require English (UEPO 2021).
  '23': { l: 3.8, i: 3.0 },
  // Education — postsecondary high (publication lang), K-12 low.
  '25-1': { l: 4.5, i: 4.0 }, // Postsecondary teachers
  '25-2': { l: 1.8, i: 1.5 }, // K-12 teachers
  '25-3': { l: 2.5, i: 2.0 }, // Other education / training
  '25-4': { l: 2.5, i: 2.0 }, // Librarians / archivists / curators
  '25-9': { l: 2.5, i: 2.0 }, // Other educational instruction
  // Arts / Media — variable, moderate default.
  '27': { l: 2.5, i: 2.2 },
  // Healthcare — 5–8% of DE healthcare job postings require English.
  '29': { l: 1.8, i: 1.3 }, // Healthcare Practitioners
  '31': { l: 1.3, i: 1.0 }, // Healthcare Support
  // Service / protective — low.
  '21': { l: 1.8, i: 1.3 }, // Community & Social Service
  '33': { l: 1.5, i: 1.3 }, // Protective Services
  '35': { l: 0.8, i: 1.0 }, // Food Prep / Serving
  '37': { l: 0.8, i: 1.0 }, // Building / Grounds Cleaning
  '39': { l: 1.2, i: 1.0 }, // Personal Care / Service
  // Sales — high (Vertrieb international per UEPO).
  '41': { l: 2.8, i: 2.3 },
  // Office / admin — moderate.
  '43': { l: 2.0, i: 1.8 },
  // Manual / trades / transport — low.
  '45': { l: 0.8, i: 1.0 }, // Farming / Fishing / Forestry
  '47': { l: 0.8, i: 1.0 }, // Construction / Extraction
  '49': { l: 0.8, i: 1.0 }, // Installation / Maintenance / Repair
  '51': { l: 0.8, i: 1.0 }, // Production
  '53': { l: 0.8, i: 1.0 }, // Transportation / Material Moving
  // Military — rare in civilian corpus, treat as protective.
  '55': { l: 1.5, i: 1.3 },
  // Fallback for unmatched majors.
  default: { l: 1.5, i: 1.3 },
}

/**
 * Hand-overrides for codes where the SOC-major anchor clearly misses
 * because English is intrinsic to the role (language teachers,
 * interpreters, aviation where ICAO mandates English).
 * Keys are SOC detail codes (7 chars incl. dash, e.g. "15-1252").
 */
const OVERRIDES = {
  // Interpreters & Translators — English transfer is the core function.
  '27-3091': { l: 5.0, i: 5.0 },
  // Postsecondary Foreign Language & Literature Teachers.
  '25-1124': { l: 4.5, i: 4.5 },
  // Commercial & airline pilots — ICAO English mandatory.
  '53-2011': { l: 5.0, i: 5.0 },
  '53-2012': { l: 5.0, i: 5.0 },
  // Air traffic controllers — ICAO English mandatory.
  '53-2021': { l: 5.0, i: 5.0 },
  // Airfield operations — non-pilot but still aviation.
  '53-2022': { l: 4.0, i: 3.8 },
  // Flight attendants — international crew + safety announcements.
  '53-2031': { l: 4.0, i: 3.8 },
  // Tour guides / travel guides — often host international visitors.
  '39-6011': { l: 3.0, i: 2.5 },
  '39-6012': { l: 3.0, i: 2.5 },
  // Logisticians — international supply chain coordination.
  '13-1081': { l: 3.2, i: 2.8 },
  // Cargo & Freight Agents — customs paperwork often in English.
  '43-5011': { l: 2.8, i: 2.3 },
}

function anchorFor(onetCode) {
  const socDetail = onetCode.slice(0, 7) // e.g. "15-1252"
  if (OVERRIDES[socDetail]) return OVERRIDES[socDetail]
  const socMinor = onetCode.slice(0, 4) // e.g. "13-1"
  if (ANCHORS[socMinor]) return ANCHORS[socMinor]
  const major = onetCode.slice(0, 2)
  if (ANCHORS[major]) return ANCHORS[major]
  return ANCHORS.default
}

function round2(x) {
  return Math.round(x * 100) / 100
}

const data = JSON.parse(readFileSync(OCC_PATH, 'utf8'))
let seeded = 0
let skipped = 0
const byMajor = {}

for (const occ of data) {
  if (!occ.knowledge || typeof occ.knowledge !== 'object') {
    skipped++
    continue
  }
  const anchor = anchorFor(occ.onetCode)
  occ.knowledge[NEW_ELEMENT] = { i: round2(anchor.i), l: round2(anchor.l) }
  seeded++
  const major = occ.onetCode.slice(0, 2)
  byMajor[major] = (byMajor[major] ?? 0) + 1
}

writeFileSync(OCC_PATH, JSON.stringify(data, null, 2) + '\n')

console.log(`Seeded ${NEW_ELEMENT} on ${seeded} occupations (skipped ${skipped} without knowledge block).`)
console.log('Occupations seeded per SOC major group:')
for (const [major, n] of Object.entries(byMajor).sort()) {
  console.log(`  ${major}: ${n}`)
}
