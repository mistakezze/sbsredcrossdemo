import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

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
    path: '/map',
    name: 'Map',
    component: () => import('../views/Map.vue')
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('../views/Activities.vue')
  },
  {
    path: '/places',
    name: 'Places',
    component: () => import('../views/Places.vue'),
    // 地点管理只对管理员和企业/地点用户开放
    meta: { roles: ['admin', 'venue'] }
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

// 没有权限的角色直接访问 /places 时，退回地图页
router.beforeEach((to) => {
  if (!to.meta.roles) return true
  const { currentRoleKey } = useUserStore()
  if (to.meta.roles.includes(currentRoleKey.value)) return true
  return { path: '/map', replace: true }
})

export default router
