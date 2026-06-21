import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/routes',
    name: 'Routes',
    component: () => import('../views/Routes.vue')
  },
  {
    path: '/checkins',
    name: 'Checkins',
    component: () => import('../views/Checkins.vue')
  },
  {
    path: '/checkins/:id',
    name: 'CheckinDetail',
    component: () => import('../views/CheckinDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
