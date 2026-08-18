// @vitest-environment jsdom
// jsdom rather than the default node environment: importing the module builds
// the router, and createWebHistory() reads window.
import { describe, expect, it } from 'vitest'

import indexHtml from '../../index.html?raw'
import { routes } from './router'

/**
 * A route that ships without a title inherits whatever index.html declares,
 * which is wrong in a browser tab and wrong in a search result. These guard the
 * two things easy to get wrong later: adding a fifth route and forgetting its
 * title, and changing one of the two landing-page titles without the other.
 */
describe('route titles', () => {
  it('gives every route a non-empty title', () => {
    for (const route of routes) {
      expect(route.meta?.title, `route ${route.path} has no title`).toBeTruthy()
    }
  })

  it('keeps the landing title identical to the static one a crawler sees first', () => {
    const home = routes.find((route) => route.path === '/')

    expect(indexHtml).toContain(`<title>${home?.meta?.title}</title>`)
  })
})
