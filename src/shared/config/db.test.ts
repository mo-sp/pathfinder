/**
 * Direct persistence-layer tests for the Dexie schema in `db.ts`.
 *
 * Where the questionnaire store tests exercise the persist watcher and
 * hydrate() *through* the store, these tests poke the Dexie surface
 * directly: schema declaration, CRUD round-trips for every optional-field
 * combination of `AssessmentSession`, the index queries that hydrate uses,
 * and bulk/clear operations. Failures here mean the persistence contract
 * (not the store wiring) regressed.
 */
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import type { AssessmentSession } from '@entities/assessment/model/types'

describe('pathfinder Dexie schema', () => {
  beforeEach(async () => {
    await db.sessions.clear()
  })

  describe('schema declaration', () => {
    it('uses the "pathfinder" database name', () => {
      // Locked in so a typo in db.ts doesn't accidentally orphan all
      // existing users' IndexedDB data on the next deploy.
      expect(db.name).toBe('pathfinder')
    })

    it('exposes a single "sessions" table', () => {
      expect(db.tables.map((t) => t.name)).toEqual(['sessions'])
    })
  })

  describe('CRUD round-trip', () => {
    it('round-trips a minimal in-progress session (only required fields)', async () => {
      const minimal: AssessmentSession = {
        id: 'min',
        startedAt: 1_000,
        answers: [{ questionId: 'ip-r-01', value: 4, answeredAt: 1_010 }],
      }
      await db.sessions.put(minimal)

      const got = await db.sessions.get('min')
      expect(got).toEqual(minimal)
      // Unset optional fields stay undefined after the round-trip — not
      // null, not promoted to []. The store's `if (latest.questionOrder ...)`
      // check in hydrate() relies on this for the legacy-session fallback.
      expect(got?.completedAt).toBeUndefined()
      expect(got?.riasecProfile).toBeUndefined()
      expect(got?.results).toBeUndefined()
      expect(got?.questionOrder).toBeUndefined()
    })

    it('round-trips a fully populated completed session (all optional fields set)', async () => {
      const complete: AssessmentSession = {
        id: 'full',
        startedAt: 2_000,
        completedAt: 2_500,
        answers: Array.from({ length: 60 }, (_, i) => ({
          questionId: `ip-q-${i}`,
          value: (i % 5) + 1,
          answeredAt: 2_000 + i,
        })),
        riasecProfile: { R: 30, I: 40, A: 25, S: 35, E: 20, C: 28 },
        results: [
          {
            occupation: {
              onetCode: '15-1252.00',
              title: { de: 'Softwareentwicklung', en: 'Software Developers' },
              riasecProfile: { R: 20, I: 50, A: 15, S: 10, E: 25, C: 30 },
              jobZone: 4,
            },
            fitScore: 0.87,
            rank: 1,
          },
        ],
        questionOrder: Array.from({ length: 60 }, (_, i) => `ip-q-${i}`),
      }
      await db.sessions.put(complete)

      const got = await db.sessions.get('full')
      expect(got).toEqual(complete)
    })

    it('put() with an existing id overwrites the row instead of duplicating', async () => {
      const id = 'overwrite-me'
      await db.sessions.put({ id, startedAt: 100, answers: [] })
      await db.sessions.put({
        id,
        startedAt: 100,
        completedAt: 500,
        answers: [{ questionId: 'ip-r-01', value: 5, answeredAt: 200 }],
        riasecProfile: { R: 10, I: 0, A: 0, S: 0, E: 0, C: 0 },
      })

      const all = await db.sessions.toArray()
      expect(all).toHaveLength(1)
      expect(all[0]?.completedAt).toBe(500)
      expect(all[0]?.answers).toHaveLength(1)
      expect(all[0]?.riasecProfile?.R).toBe(10)
    })

    it('clear() empties the table', async () => {
      await db.sessions.bulkPut([
        { id: 'a', startedAt: 1, answers: [] },
        { id: 'b', startedAt: 2, answers: [] },
      ])
      expect(await db.sessions.count()).toBe(2)
      await db.sessions.clear()
      expect(await db.sessions.count()).toBe(0)
    })
  })

  describe('index queries', () => {
    it('startedAt is indexed: orderBy returns rows ascending by startedAt', async () => {
      // Dexie throws on orderBy() against an unindexed key, so this also
      // serves as a behavioral check that the index spec in db.ts still
      // declares startedAt.
      await db.sessions.bulkPut([
        { id: 'middle', startedAt: 200, answers: [] },
        { id: 'oldest', startedAt: 100, answers: [] },
        { id: 'newest', startedAt: 300, answers: [] },
      ])
      const ordered = await db.sessions.orderBy('startedAt').toArray()
      expect(ordered.map((r) => r.id)).toEqual(['oldest', 'middle', 'newest'])
    })

    it('orderBy("startedAt").reverse().first() picks the most recent session — the hydrate() query', async () => {
      // Exact query the store uses in hydrate() to pick the resume target.
      // Inserted out of startedAt order so the result depends on the index
      // sort, not insertion order.
      await db.sessions.bulkPut([
        { id: 'middle', startedAt: 200, answers: [] },
        { id: 'oldest', startedAt: 100, answers: [] },
        { id: 'newest', startedAt: 300, answers: [] },
      ])
      const latest = await db.sessions.orderBy('startedAt').reverse().first()
      expect(latest?.id).toBe('newest')
    })

    it('orderBy("startedAt").reverse().first() returns undefined on an empty table', async () => {
      // hydrate()'s `if (!latest) return` branch depends on this; a future
      // Dexie that returned `null` instead would silently break the
      // empty-DB → fresh-store path.
      const latest = await db.sessions.orderBy('startedAt').reverse().first()
      expect(latest).toBeUndefined()
    })

    it('completedAt is indexed: where() filter against the index returns matching rows', async () => {
      // The store doesn't currently filter by completedAt, but the schema
      // declares the index. Lock the contract in place against an
      // accidental drop in db.ts.
      await db.sessions.bulkPut([
        { id: 'in-progress', startedAt: 100, answers: [] },
        { id: 'done-1', startedAt: 200, completedAt: 250, answers: [] },
        { id: 'done-2', startedAt: 300, completedAt: 350, answers: [] },
      ])
      const completed = await db.sessions
        .where('completedAt')
        .above(0)
        .toArray()
      expect(completed.map((r) => r.id).sort()).toEqual(['done-1', 'done-2'])
    })
  })

  describe('bulk operations', () => {
    it('bulkPut + toArray preserves all fields across multiple sessions', async () => {
      const sessions: AssessmentSession[] = [
        {
          id: 'a',
          startedAt: 100,
          answers: [{ questionId: 'ip-r-01', value: 3, answeredAt: 110 }],
          questionOrder: ['ip-r-01'],
        },
        {
          id: 'b',
          startedAt: 200,
          completedAt: 300,
          answers: [
            { questionId: 'ip-r-01', value: 4, answeredAt: 210 },
            { questionId: 'ip-i-01', value: 5, answeredAt: 220 },
          ],
          riasecProfile: { R: 4, I: 5, A: 0, S: 0, E: 0, C: 0 },
        },
      ]
      await db.sessions.bulkPut(sessions)

      const got = await db.sessions.orderBy('startedAt').toArray()
      expect(got).toEqual(sessions)
    })
  })
})
