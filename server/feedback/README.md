# Beta feedback endpoint

A standalone, dependency-free Node service that accepts **voluntary, anonymous**
assessment submissions from beta testers, so we can sanity-check the scoring
against real answer sets. It is not part of the SPA bundle and runs as its own
container alongside the nginx app container.

Beta-only: a public release turns it off via `FEEDBACK_ENABLED=false` (the
endpoint then returns `410 Gone`) without redeploying the app.

## API

- `POST /api/feedback` — body is JSON (see schema below). Returns `204` on
  success, `400` on a malformed/invalid body, `413` if larger than the cap,
  `410` if disabled, `403` on a foreign `Origin`.
- `GET /api/health` — returns `200 ok`, touches no data. Use as the Coolify
  health check.

### Request schema (`v: 1`)

```jsonc
{
  "v": 1,
  "sid": "<optional client-generated random id, <=64 chars, for de-dup>",
  "selfRating": 4,            // integer 1..5 — "passt das Ergebnis zu dir?"
  "comment": "optional free text (<=2000 chars)",
  "answers": { /* raw answers per layer */ },
  "result":  { /* computed top results */ }
}
```

The server stores only those fields plus a server-side `receivedAt` timestamp.
It never reads, stores, or logs the client IP or `X-Forwarded-For`, and never
logs payload contents.

## Configuration (env)

| Var | Default | Meaning |
|---|---|---|
| `PORT` | `8080` | listen port |
| `FEEDBACK_ENABLED` | `true` | set to `false` to retire the feature (`410`) |
| `FEEDBACK_FILE` | `/data/feedback.jsonl` | append target (persistent volume) |
| `ALLOWED_ORIGIN` | `https://pathfinder-berufetest.de` | CORS + soft origin guard |
| `MAX_BODY_BYTES` | `65536` | request size cap |
| `MAX_COMMENT_CHARS` | `2000` | free-text length cap |

## Coolify deploy

1. New **Application** in the same project, source = this repo, **Base
   Directory** `server/feedback`, build pack **Dockerfile**.
2. **Persistent storage**: mount a volume at `/data` (this is where
   `feedback.jsonl` lives — without it, data is lost on redeploy).
3. **Domain / routing**: route `https://pathfinder-berufetest.de/api` to this
   service (Traefik path rule) so it shares the app's origin (no CORS). The
   container listens on `8080`. Traefik strips the `/api` prefix before
   forwarding, so the container receives `/feedback` / `/health`; the server
   normalises an optional leading `/api`, so it works whether the prefix is
   stripped or not. Fallback if path routing is fiddly:
   `https://api.pathfinder-berufetest.de` — then `ALLOWED_ORIGIN` already
   permits the apex via CORS.
4. **Health check path**: `/api/health`.

## Reading the collected feedback

```sh
# on the box, from the mounted volume:
cat /path/to/volume/feedback.jsonl | jq .
```
