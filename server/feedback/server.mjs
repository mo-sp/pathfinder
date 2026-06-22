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

import { createServer } from 'node:http'
import { appendFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT ?? 8080)
const ENABLED = (process.env.FEEDBACK_ENABLED ?? 'true') !== 'false'
const FEEDBACK_FILE = process.env.FEEDBACK_FILE ?? '/data/feedback.jsonl'
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://pathfinder-berufetest.de'
const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES ?? 65536)
const MAX_COMMENT_CHARS = Number(process.env.MAX_COMMENT_CHARS ?? 2000)

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

function validate(payload) {
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
  const url = (req.url ?? '').split('?')[0]
  const cors = corsHeaders(req)

  // Health check for Coolify — touches no data, returns no identifiers.
  if (req.method === 'GET' && url === '/api/health') {
    return send(res, 200, 'ok')
  }

  if (url !== '/api/feedback') return send(res, 404, 'not found')

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
  if (typeof payload.comment === 'string' && payload.comment.trim() !== '') {
    record.comment = payload.comment.trim()
  }

  try {
    await appendFile(FEEDBACK_FILE, JSON.stringify(record) + '\n', 'utf8')
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

server.listen(PORT, () => {
  console.log(`feedback endpoint listening on :${PORT} (enabled=${ENABLED}, file=${FEEDBACK_FILE})`)
})
