// Beta feedback endpoint for PathFinder.
//
// A deliberately minimal, dependency-free Node service that accepts voluntary,
// anonymous assessment submissions from beta testers so we can check whether
// the scoring produces sensible results. It is NOT part of the app bundle and
// runs as its own container; the SPA POSTs to it at /api/feedback.
//
// Privacy stance (this whole file is the data-handling surface @mo-sp reviews):
//   - We NEVER read req.socket.remoteAddress and NEVER read X-Forwarded-For.
//     The client IP is intentionally never touched, never stored, never logged.
//   - We do NOT log payload contents to stdout (only opaque counters), so the
//     container log can't become a backdoor copy of the answers.
//   - The only id is a client-generated random submission id used for de-dup;
//     it is not derived from anything and links to no person.
//   - A single FEEDBACK_ENABLED env acts as a kill switch so the feature can be
//     switched off at public release without a redeploy of the app itself.
//   - Submissions are deleted after RETENTION_DAYS. The Datenschutzerklärung
//     promises twelve months, and a promise nobody automates is not one, so the
//     deletion runs here rather than as an ops task someone has to remember.

import { createServer } from 'node:http'
import { appendFile, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const PORT = Number(process.env.PORT ?? 8080)
const ENABLED = (process.env.FEEDBACK_ENABLED ?? 'true') !== 'false'
const FEEDBACK_FILE = process.env.FEEDBACK_FILE ?? '/data/feedback.jsonl'
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://pathfinder-berufetest.de'
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES ?? 65536)
const MAX_COMMENT_CHARS = Number(process.env.MAX_COMMENT_CHARS ?? 2000)
// Ceiling on the whole store, not on one request. Per-client throttling belongs
// at the reverse proxy, which already sees the address this service deliberately
// never touches; this cap is the backstop that bounds how much disk a flood of
// otherwise-valid submissions can ever consume. 50 MB is roughly 5000 real
// submissions at the current record size.
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES ?? 50 * 1024 * 1024)
// Retention for stored submissions, matching what the Datenschutzerklärung says.
// The text names an earlier trigger too ("once it has been evaluated"), which is
// a manual step; this is the backstop that holds without anyone acting.
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS ?? 365)
const PRUNE_INTERVAL_MS = 24 * 60 * 60 * 1000

// A submission counter for the process lifetime — lets us confirm the endpoint
// is receiving data without ever logging what was sent.
let accepted = 0

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  res.end(body ?? '')
}

// CORS is only needed if the endpoint is reached cross-origin (e.g. the
// api.<domain> subdomain fallback). On the same-origin /api path it's a no-op.
function corsHeaders(req) {
  const origin = req.headers.origin
  if (origin && origin === ALLOWED_ORIGIN) {
    return {
      'access-control-allow-origin': ALLOWED_ORIGIN,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
    }
  }
  return {}
}

// The comment is free text from an anonymous stranger, and it does not stay in
// this file: it is rendered into reports and read elsewhere, later. So the risk
// here is not XSS — nothing renders the comment in the app — but that text
// written to be read as data ends up read as structure, or as instruction.
//
// The defence is deliberately structural: drop the characters that mean nothing
// to a reader yet carry weight for a parser — C0/C1 controls, zero-width marks,
// bidi overrides that can visually reorder a line, and the Unicode line and
// paragraph separators. Tabs and newlines survive, because a person may
// legitimately have typed them and the renderer quotes them safely.
//
// What this deliberately does NOT do is look for wording. Blocking phrases like
// "ignore previous instructions" is endless in one language and hopeless across
// many, and its worst effect is the false confidence it buys.
// The rule below exists to catch control characters that slipped into a
// pattern by accident. Here they are the entire point of the pattern.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]/gu

export function sanitizeComment(text) {
  return text.replace(UNSAFE_CHARS, '').trim()
}

export function validate(payload) {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return 'body must be a JSON object'
  }
  if (payload.v !== 1) return 'unsupported or missing schema version "v"'
  if (typeof payload.answers !== 'object' || payload.answers === null) {
    return 'missing "answers" object'
  }
  if (typeof payload.result !== 'object' || payload.result === null) {
    return 'missing "result"'
  }
  if (!Number.isInteger(payload.selfRating) || payload.selfRating < 1 || payload.selfRating > 5) {
    return '"selfRating" must be an integer 1..5'
  }
  if (payload.comment !== undefined) {
    if (typeof payload.comment !== 'string') return '"comment" must be a string'
    if (payload.comment.length > MAX_COMMENT_CHARS) return '"comment" too long'
  }
  return null
}

// Appending and pruning both touch the same file, and the prune is a
// read-rewrite-rename: an append landing in between would be dropped. Every
// write goes through this single process, so one promise chain is enough to
// order them. Tasks run even if the previous one failed.
let writeQueue = Promise.resolve()

function serialize(task) {
  const result = writeQueue.then(task, task)
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

/**
 * Drop stored lines older than the retention period. Pure, and `now` is a
 * parameter, so the boundary is testable without waiting a year.
 *
 * A line whose receivedAt is missing or unparseable is KEPT, and the caller
 * logs how many. Every record this service writes carries the field, so such a
 * line means something unexpected happened to the store, and silently deleting
 * data we failed to understand is the worse of the two failures. It stays
 * visible instead, for a human to look at.
 */
export function pruneRecords(lines, now, retentionDays = RETENTION_DAYS) {
  const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000
  const kept = []
  let unparseable = 0
  for (const line of lines) {
    let receivedAt
    try {
      receivedAt = Date.parse(JSON.parse(line).receivedAt)
    } catch {
      receivedAt = NaN
    }
    if (Number.isNaN(receivedAt)) {
      unparseable += 1
      kept.push(line)
    } else if (receivedAt >= cutoff) {
      kept.push(line)
    }
  }
  return { kept, removed: lines.length - kept.length, unparseable }
}

/**
 * Apply the retention to the store on disk. Writes a temporary file and renames
 * it over the original, which is atomic on the same filesystem, so a crash
 * mid-prune leaves the previous store intact rather than a half-written one.
 */
export async function pruneStore(file = FEEDBACK_FILE, now = new Date()) {
  let raw
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    return { removed: 0, unparseable: 0 } // No file yet: nothing to retain.
  }
  const lines = raw.split('\n').filter((line) => line !== '')
  const { kept, removed, unparseable } = pruneRecords(lines, now)
  if (removed > 0) {
    const tmp = `${file}.tmp`
    await writeFile(tmp, kept.map((line) => `${line}\n`).join(''), 'utf8')
    await rename(tmp, file)
  }
  return { removed, unparseable }
}

async function runPrune() {
  try {
    const { removed, unparseable } = await serialize(() => pruneStore())
    if (removed > 0) console.log(`retention: removed ${removed} submission(s)`)
    if (unparseable > 0) console.error(`retention: ${unparseable} unparseable line(s) kept`)
  } catch (err) {
    console.error('retention run failed:', err.code ?? err.message)
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    let aborted = false
    const chunks = []
    req.on('data', (chunk) => {
      if (aborted) return
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        // Stop accumulating and reject once; the handler sends 413 and closes
        // the connection (which aborts the rest of the upload). We do NOT
        // destroy the socket here, or the response would never reach the client.
        aborted = true
        reject(Object.assign(new Error('payload too large'), { httpStatus: 413 }))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => { if (!aborted) resolve(Buffer.concat(chunks).toString('utf8')) })
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  let path = (req.url ?? '').split('?')[0]
  // A reverse proxy may or may not strip a leading "/api" prefix before
  // forwarding (Coolify/Traefik path routing strips it; an api.<domain>
  // subdomain would not). Normalise so the endpoint matches either way.
  if (path.startsWith('/api/')) path = path.slice(4)
  else if (path === '/api') path = '/'
  const cors = corsHeaders(req)

  // Health check for Coolify — touches no data, returns no identifiers.
  if (req.method === 'GET' && path === '/health') {
    return send(res, 200, 'ok')
  }

  if (path !== '/feedback') return send(res, 404, 'not found')

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors)
    return res.end()
  }

  if (req.method !== 'POST') return send(res, 405, 'method not allowed')

  // Kill switch: 410 Gone makes it explicit the feature was retired, not broken.
  if (!ENABLED) return send(res, 410, 'feedback disabled')

  // Soft anti-spam guard: if a browser sends an Origin header it must match.
  // (Same-origin POSTs and non-browser clients without an Origin pass through;
  //  this is a low-cost filter, not a security boundary.)
  const origin = req.headers.origin
  if (origin && origin !== ALLOWED_ORIGIN) return send(res, 403, 'forbidden origin')

  let raw
  try {
    raw = await readBody(req)
  } catch (err) {
    if (err.httpStatus === 413) {
      // Close the connection so the unread remainder of the upload is dropped.
      res.writeHead(413, { 'content-type': 'text/plain; charset=utf-8', connection: 'close' })
      return res.end('payload too large')
    }
    return send(res, 400, 'bad request')
  }

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return send(res, 400, 'invalid JSON')
  }

  const invalid = validate(payload)
  if (invalid) return send(res, 400, invalid)

  // Build the stored record explicitly — only the fields we want, nothing the
  // client smuggled in (no spread of the raw payload).
  const record = {
    v: 1,
    sid: typeof payload.sid === 'string' && payload.sid.length <= 64 ? payload.sid : randomUUID(),
    receivedAt: new Date().toISOString(),
    selfRating: payload.selfRating,
    answers: payload.answers,
    result: payload.result,
  }
  if (typeof payload.comment === 'string') {
    const comment = sanitizeComment(payload.comment)
    if (comment !== '') record.comment = comment
  }

  // Check the ceiling per request rather than caching it, so it still holds if
  // the volume is shared or the file is replaced under a running process. A
  // missing file is the normal first-submission case, not an error.
  try {
    const { size } = await stat(FEEDBACK_FILE)
    if (size >= MAX_FILE_BYTES) {
      console.error(`feedback file at cap (${size} bytes), refusing write`)
      return send(res, 507, 'feedback storage full')
    }
  } catch {
    // No file yet.
  }

  try {
    await serialize(() => appendFile(FEEDBACK_FILE, JSON.stringify(record) + '\n', 'utf8'))
  } catch (err) {
    // Log the failure reason (not the payload) so a misconfigured volume is
    // diagnosable without leaking submitted data.
    console.error('append failed:', err.code ?? err.message)
    return send(res, 500, 'could not store feedback')
  }

  accepted += 1
  console.log(`feedback accepted (#${accepted} this process)`)
  res.writeHead(204, cors)
  res.end()
})

// Bind only when this file is run as a program. The tests import it for
// sanitizeComment() and validate(), and an import must not open a port.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  server.listen(PORT, () => {
    console.log(`feedback endpoint listening on :${PORT} (enabled=${ENABLED}, file=${FEEDBACK_FILE})`)
  })
  // Once at startup, then daily. The container runs for weeks at a time, so the
  // interval really does fire; the startup run covers a box that was restarted.
  // unref() keeps the timer from being a reason for the process to stay alive.
  runPrune()
  setInterval(runPrune, PRUNE_INTERVAL_MS).unref()
}
