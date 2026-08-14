import {
  createRouter,
  createWebHistory,
  START_LOCATION,
  type RouteRecordRaw,
} from 'vue-router'

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
  scrollBehavior(to, from, savedPosition) {
    // Opening or reloading the site must start at the top, even though the
    // router kept a scroll offset for this history entry: Vue Router stores
    // the position in history.state and hands it back as savedPosition on a
    // reload, so someone who last stood at the footer would land in the footer
    // again. Restoring is right for back/forward, wrong for arriving.
    if (from === START_LOCATION) return { top: 0 }
    if (savedPosition) return savedPosition
    if (to.query.focus) return false
    return { top: 0 }
  },
})
