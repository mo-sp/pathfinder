import Dexie, { type EntityTable } from 'dexie'
import type { AssessmentSession } from '@entities/assessment/model/types'

/**
 * Local-only IndexedDB store for in-progress assessments and history.
 * Nothing here ever leaves the browser unless the user explicitly opts in.
 */
class PathFinderDB extends Dexie {
  sessions!: EntityTable<AssessmentSession, 'id'>

  constructor() {
    super('pathfinder')
    this.version(1).stores({
      sessions: 'id, startedAt, completedAt',
    })
  }
}

export const db = new PathFinderDB()
