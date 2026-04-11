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
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
