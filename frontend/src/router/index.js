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
  },
  {
    path: '/admin',
    redirect: '/admin/places'
  },
  {
    path: '/admin/places',
    name: 'AdminPlaces',
    component: () => import('../views/Admin.vue'),
    meta: { adminOnly: true, adminSection: 'places' }
  },
  {
    path: '/admin/activities',
    name: 'AdminActivities',
    component: () => import('../views/Admin.vue'),
    meta: { adminOnly: true, adminSection: 'activities' }
  },
  {
    path: '/admin/reviews',
    name: 'AdminReviews',
    component: () => import('../views/Admin.vue'),
    meta: { adminOnly: true, adminSection: 'reviews' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

// 管理员使用独立工作台；普通角色不能进入管理路由。
router.beforeEach((to) => {
  const { currentRoleKey } = useUserStore()

  if (to.meta.adminOnly) {
    if (currentRoleKey.value === 'admin') return true
    return { path: '/', replace: true }
  }

  if (currentRoleKey.value === 'admin') {
    return { path: '/admin/places', replace: true }
  }

  if (!to.meta.roles) return true
  if (to.meta.roles.includes(currentRoleKey.value)) return true
  return { path: '/map', replace: true }
})

export default router
