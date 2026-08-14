import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@pages/home/HomePage.vue'),
  },
  {
    path: '/test',
    name: 'assessment',
    component: () => import('@pages/assessment/AssessmentPage.vue'),
  },
  {
    path: '/ergebnis',
    name: 'results',
    component: () => import('@pages/results/ResultsPage.vue'),
  },
  {
    path: '/datenschutz',
    name: 'privacy',
    component: () => import('@pages/legal/PrivacyPage.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  // Without this the scroll position simply carries over, so a link clicked at
  // the bottom of a long page — the footer's Datenschutz link — opens the next
  // page already scrolled halfway down. Back/forward restores the remembered
  // position; everything else starts at the top. The exception is
  // /ergebnis?focus=<layer>, which scrolls to the just-finished layer on its
  // own (see ResultsPage onMounted) and must not be yanked to the top first.
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.query.focus) return false
    return { top: 0 }
  },
})
