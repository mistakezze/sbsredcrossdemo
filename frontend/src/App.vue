<template>
  <div class="app-container" :class="{ mobile: isMobile, desktop: !isMobile }">
    <!-- ====== 桌面端：顶部 Logo + 导航栏 ====== -->
    <header v-if="!isMobile" class="pc-header">
      <div class="pc-header-inner">
        <div class="pc-logo" @click="router.push(homePath)">
          <div class="pc-logo-icon">
            <span class="cross-h"></span>
            <span class="cross-v"></span>
          </div>
          <div class="pc-logo-text">
            <h1>{{ isAdmin ? '红十字管理台' : '红十字会文化之旅' }}</h1>
            <p>{{ isAdmin ? 'Administration Console' : 'Red Cross Cultural Journey' }}</p>
          </div>
        </div>
        <div class="pc-header-right">
          <nav v-if="!isAdmin" class="pc-nav">
            <router-link to="/" class="pc-nav-item" :class="{ active: $route.path === '/' }">
              <AppIcon name="home" size="16" /> 首页
            </router-link>
            <router-link to="/map" class="pc-nav-item" :class="{ active: $route.path === '/map' }">
              <AppIcon name="map" size="16" /> 地图
            </router-link>
            <router-link to="/routes" class="pc-nav-item" :class="{ active: $route.path === '/routes' }">
              <AppIcon name="route" size="16" /> 路线推荐
            </router-link>
            <router-link to="/activities" class="pc-nav-item" :class="{ active: $route.path === '/activities' }">
              <AppIcon name="calendar" size="16" /> 活动
            </router-link>
            <router-link
              v-if="canManagePlaces"
              to="/places"
              class="pc-nav-item"
              :class="{ active: $route.path === '/places' }"
            >
              <AppIcon name="building" size="16" /> 地点管理
            </router-link>
            <router-link to="/checkins" class="pc-nav-item" :class="{ active: $route.path.startsWith('/checkins') }">
              <AppIcon name="clipboard" size="16" /> 个人打卡
              <span v-if="checkinCount > 0" class="pc-badge">{{ checkinCount }}</span>
            </router-link>
          </nav>
          <nav v-else class="pc-nav admin-pc-nav" aria-label="管理员导航">
            <router-link
              v-for="item in adminNavItems"
              :key="item.key"
              :to="item.path"
              class="pc-nav-item"
              :class="{ active: $route.meta.adminSection === item.key }"
            >
              <AppIcon :name="item.icon" size="16" />
              {{ item.label }}
              <span v-if="item.count > 0" class="pc-badge">{{ item.count }}</span>
            </router-link>
          </nav>
          <button
            class="theme-toggle"
            :class="{ 'is-dark': isDark }"
            role="switch"
            :aria-label="`切换到${isDark ? '浅色' : '深色'}模式`"
            :aria-checked="isDark"
            @click="toggleTheme"
          >
            <span class="theme-switch">
              <span class="theme-switch-symbol is-sun">
                <AppIcon name="sun" size="10" />
              </span>
              <span class="theme-switch-symbol is-moon">
                <AppIcon name="moon" size="10" />
              </span>
              <span class="theme-switch-thumb">
                <AppIcon :name="isDark ? 'moon' : 'sun'" size="13" />
              </span>
            </span>
            <span class="theme-toggle-label">{{ themeLabel }}</span>
          </button>
          <RoleSwitcher />
        </div>
      </div>
    </header>

    <!-- ====== 移动端：顶栏 + 底部 Tab ====== -->
    <header v-if="isMobile" class="mobile-topbar">
      <div class="mobile-topbar-inner">
        <div class="mobile-topbar-logo" @click="router.push(homePath)">
          <div class="mobile-topbar-icon">
            <span class="cross-h"></span>
            <span class="cross-v"></span>
          </div>
          <div class="mobile-topbar-text">
            <span>{{ isAdmin ? '红十字管理台' : '红十字会文化之旅' }}</span>
          </div>
        </div>
        <div class="mobile-topbar-actions">
          <button
            class="theme-toggle is-mobile"
            :class="{ 'is-dark': isDark }"
            role="switch"
            :aria-label="`切换到${isDark ? '浅色' : '深色'}模式`"
            :aria-checked="isDark"
            @click="toggleTheme"
          >
            <span class="theme-switch">
              <span class="theme-switch-symbol is-sun">
                <AppIcon name="sun" size="9" />
              </span>
              <span class="theme-switch-symbol is-moon">
                <AppIcon name="moon" size="9" />
              </span>
              <span class="theme-switch-thumb">
                <AppIcon :name="isDark ? 'moon' : 'sun'" size="12" />
              </span>
            </span>
          </button>
          <RoleSwitcher />
        </div>
      </div>
    </header>

    <!-- ====== 内容区 ====== -->
    <main class="main-content" :class="{ 'pc-main': !isMobile, 'mobile-main': isMobile }">
      <router-view v-slot="{ Component }">
        <transition name="page-shift" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- ====== 桌面端：页脚 ====== -->
    <footer v-if="!isMobile && !isAdmin" class="pc-footer">
      <div class="pc-footer-inner">
        <p>© 2026 红十字会文化之旅 | 人道主义精神传承</p>
        <p class="pc-footer-sub">以人为本 · 博爱奉献 · 共建和平</p>
      </div>
    </footer>

    <!-- ====== 移动端：底部 Tab 栏 ====== -->
    <nav v-if="isMobile" class="mobile-tabbar" :class="{ 'is-admin': isAdmin }">
      <template v-if="isAdmin">
        <router-link
          v-for="item in adminNavItems"
          :key="item.key"
          :to="item.path"
          class="mobile-tabbar-item"
          :class="{ active: $route.meta.adminSection === item.key }"
        >
          <AppIcon :name="item.icon" size="21" class="mobile-tabbar-icon" />
          <span class="mobile-tabbar-label">{{ item.shortLabel }}</span>
          <span v-if="item.count > 0" class="mobile-tabbar-badge">{{ item.count }}</span>
        </router-link>
      </template>
      <template v-else>
      <router-link to="/" class="mobile-tabbar-item" :class="{ active: $route.path === '/' }">
        <svg class="mobile-tabbar-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 11.5 12 4l8.5 7.5M5.5 10.5V20h13v-9.5M9.5 20v-5h5v5" />
        </svg>
        <span class="mobile-tabbar-label">首页</span>
      </router-link>
      <router-link to="/map" class="mobile-tabbar-item" :class="{ active: $route.path === '/map' }">
        <svg class="mobile-tabbar-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 10c0 5.4-8 11-8 11S4 15.4 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.7" />
        </svg>
        <span class="mobile-tabbar-label">地图</span>
      </router-link>
      <router-link
        v-if="canManagePlaces"
        to="/places"
        class="mobile-tabbar-item"
        :class="{ active: $route.path === '/places' }"
      >
        <svg class="mobile-tabbar-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20V8.5L12 4l8 4.5V20M9 20v-5.5h6V20" />
          <path d="M8 10h2M14 10h2" />
        </svg>
        <span class="mobile-tabbar-label">地点</span>
      </router-link>
      <router-link to="/routes" class="mobile-tabbar-item" :class="{ active: $route.path === '/routes' }">
        <svg class="mobile-tabbar-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="18" r="2" />
          <circle cx="19" cy="6" r="2" />
          <path d="M7 18h3.5a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3H17" />
        </svg>
        <span class="mobile-tabbar-label">路线</span>
      </router-link>
      <router-link to="/activities" class="mobile-tabbar-item" :class="{ active: $route.path === '/activities' }">
        <svg class="mobile-tabbar-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5.5" width="17" height="15" rx="3" />
          <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17M8 14h3M13 14h3M8 17.5h3" />
        </svg>
        <span class="mobile-tabbar-label">活动</span>
      </router-link>
      <router-link to="/checkins" class="mobile-tabbar-item" :class="{ active: $route.path.startsWith('/checkins') }">
        <svg class="mobile-tabbar-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="4.5" width="14" height="16.5" rx="3" />
          <path d="M9 4.5V3h6v1.5M9 12l2 2 4-4M9 18h6" />
        </svg>
        <span class="mobile-tabbar-label">打卡</span>
        <span v-if="checkinCount > 0" class="mobile-tabbar-badge">{{ checkinCount }}</span>
      </router-link>
      </template>
    </nav>

  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckinStore } from './stores/checkinStore'
import { useUserStore } from './stores/userStore'
import { useThemeStore } from './stores/themeStore'
import { usePlaceSubmitStore } from './stores/locationSubmitStore'
import { useActivityStore } from './stores/activityStore'
import { useReviewStore } from './stores/reviewStore'
import { useViewport } from './composables/useViewport'
import RoleSwitcher from './components/RoleSwitcher.vue'
import { ADMIN_DEFAULT_PATH, ADMIN_SECTIONS } from './config/adminSections'

const router = useRouter()
const { checkinCount } = useCheckinStore()
const { isMobile } = useViewport()
const { currentRoleKey, can } = useUserStore()
const { isDark, themeLabel, toggleTheme } = useThemeStore()
const { stats: placeStats } = usePlaceSubmitStore()
const { activityReviewStats, reviews: activityReviews } = useActivityStore()
const { reviews: locationReviews } = useReviewStore()

// 地点管理只对管理员和企业/地点用户开放
const canManagePlaces = computed(() => can('uploadLocation'))
const isAdmin = computed(() => currentRoleKey.value === 'admin')
const homePath = computed(() => isAdmin.value ? ADMIN_DEFAULT_PATH : '/')
const adminNavItems = computed(() =>
  ADMIN_SECTIONS.map(section => ({
    ...section,
    count:
      section.key === 'places'
        ? placeStats.value.pending
        : section.key === 'activities'
          ? activityReviewStats.value.pending
          : activityReviews.value.length + locationReviews.value.length
  }))
)

watch(currentRoleKey, (role) => {
  const currentRoute = router.currentRoute.value

  if (role === 'admin') {
    if (!currentRoute.meta.adminOnly) router.replace(ADMIN_DEFAULT_PATH)
    return
  }

  if (currentRoute.meta.adminOnly) {
    router.replace('/')
  } else if (currentRoute.path === '/places' && !canManagePlaces.value) {
    router.replace('/map')
  }
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--apple-bg);
}

/* ============ 桌面端样式 ============ */
.pc-header {
  background: linear-gradient(118deg, #43000f 0%, var(--palette-burgundy) 68%, #9c1932 100%);
  color: white;
  box-shadow: 0 12px 34px rgba(65, 0, 15, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.pc-page-content {
  padding-top: 80px;
}

.pc-header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.pc-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.pc-logo-icon {
  width: 54px;
  height: 54px;
  background: white;
  border-radius: 14px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pc-logo-icon .cross-h,
.pc-logo-icon .cross-v {
  position: absolute;
  background: var(--palette-silver-red);
}

.pc-logo-icon .cross-h {
  width: 24px;
  height: 6px;
}

.pc-logo-icon .cross-v {
  width: 6px;
  height: 24px;
}

.pc-logo-text h1 {
  font-size: 20px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.3;
}

.pc-logo-text p {
  font-size: 12px;
  margin: 2px 0 0 0;
  opacity: 0.85;
  letter-spacing: 1px;
}

.pc-header-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.pc-nav {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.pc-nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
  position: relative;
  white-space: nowrap;
}

.pc-nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.pc-nav-item.active {
  background: var(--palette-lotus-white);
  color: var(--palette-burgundy);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pc-badge {
  background: #ffeb3b;
  color: var(--palette-burgundy-deep);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  min-width: 20px;
  line-height: 1.4;
}

.pc-main {
  flex: 1;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 96px 40px 0;
}

.pc-footer {
  background: linear-gradient(120deg, #39000e, var(--palette-burgundy));
  color: rgba(254, 238, 225, 0.62);
  padding: 28px 32px;
  margin-top: auto;
}

.pc-footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.pc-footer-inner p {
  margin: 4px 0;
  font-size: 14px;
  word-break: break-word;
}

.pc-footer-sub {
  font-size: 12px !important;
  opacity: 0.7;
  letter-spacing: 4px;
}

/* ============ 移动端样式 ============ */
.mobile-topbar {
  background: linear-gradient(120deg, #40000e 0%, var(--palette-burgundy) 74%, #96142f 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  /* 移除 box-shadow，改用底部渐变融合 */
}

.mobile-topbar::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 0;
  right: 0;
  height: 16px;
  background: linear-gradient(to bottom, rgba(129, 2, 31, 0.12), transparent);
  pointer-events: none;
}

.mobile-topbar-inner {
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top, 0px));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 注意：此处不能用 transform 垂直居中，
   否则会为 RoleSwitcher 内 position: fixed 的弹层创建包含块，导致弹层尺寸塌陷 */
.mobile-role-slot {
  position: absolute;
  right: 16px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
}

.mobile-topbar-actions {
  position: absolute;
  right: 13px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 7px;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 4px 10px 4px 4px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.88);
  font-family: inherit;
  cursor: pointer;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.12) inset,
    0 4px 14px rgba(48, 7, 17, 0.12);
  transition:
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.theme-toggle:hover {
  border-color: rgba(255, 255, 255, 0.38);
  background: rgba(255, 255, 255, 0.24);
}

.theme-toggle:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.24);
  outline-offset: 2px;
}

.theme-switch {
  position: relative;
  width: 42px;
  height: 24px;
  display: block;
  flex-shrink: 0;
  border-radius: 999px;
  background:
    linear-gradient(90deg, rgba(239, 86, 84, 0.52), rgba(254, 238, 225, 0.22));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.18) inset,
    0 1px 3px rgba(49, 8, 18, 0.12) inset;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.theme-switch-symbol {
  position: absolute;
  top: 50%;
  z-index: 0;
  display: inline-flex;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.66);
  transition: opacity 0.22s ease, color 0.22s ease;
}

.theme-switch-symbol.is-sun {
  left: 6px;
}

.theme-switch-symbol.is-moon {
  right: 6px;
}

.theme-switch-thumb {
  position: absolute;
  top: 2px;
  left: 3px;
  z-index: 1;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fff;
  color: var(--palette-burgundy);
  box-shadow:
    0 1px 1px rgba(255, 255, 255, 0.7) inset,
    0 3px 8px rgba(48, 8, 18, 0.24);
  transition:
    transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
    color 0.2s ease,
    background 0.25s ease;
}

.theme-toggle.is-dark .theme-switch {
  background:
    linear-gradient(90deg, rgba(49, 8, 19, 0.85), rgba(129, 2, 31, 0.58));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.14) inset,
    0 1px 3px rgba(0, 0, 0, 0.24) inset;
}

.theme-toggle.is-dark .theme-switch-symbol.is-sun {
  color: rgba(255, 214, 135, 0.45);
}

.theme-toggle.is-dark .theme-switch-symbol.is-moon {
  color: rgba(224, 221, 255, 0.9);
}

.theme-toggle.is-dark .theme-switch-thumb {
  transform: translateX(16px);
  color: var(--palette-burgundy);
  background: #f7f7fa;
}

.theme-toggle-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.theme-toggle.is-mobile {
  width: 46px;
  height: 34px;
  justify-content: center;
  padding: 3px;
  border-radius: 999px;
}

.theme-toggle.is-mobile .theme-switch {
  width: 36px;
  height: 22px;
}

.theme-toggle.is-mobile .theme-switch-thumb {
  top: 2px;
  left: 3px;
  width: 18px;
  height: 18px;
}

.theme-toggle.is-mobile.is-dark .theme-switch-thumb {
  transform: translateX(12px);
}

.theme-toggle.is-mobile .theme-switch-symbol.is-sun {
  left: 5px;
}

.theme-toggle.is-mobile .theme-switch-symbol.is-moon {
  right: 5px;
}

.mobile-topbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease;
}

.mobile-topbar-logo:active {
  transform: scale(0.96);
}

.mobile-topbar-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
}

.mobile-topbar-icon .cross-h {
  position: absolute;
  width: 16px;
  height: 4px;
  background: var(--palette-silver-red);
  border-radius: 2px;
}

.mobile-topbar-icon .cross-v {
  position: absolute;
  width: 4px;
  height: 16px;
  background: var(--palette-silver-red);
  border-radius: 2px;
}

.mobile-topbar-text {
  display: flex;
  flex-direction: column;
}

.mobile-topbar-text span {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.8px;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.mobile-main {
  flex: 1;
  padding: 20px 16px 108px 16px; /* 底部留位给悬浮 tabbar */
  width: 100%;
  max-width: 100%;
}

.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: rgba(255, 249, 242, 0.86);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-top: 0.5px solid rgba(129, 2, 31, 0.1);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.mobile-tabbar::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.03), transparent);
  pointer-events: none;
}

.mobile-tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px 8px;
  color: #927b80;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  gap: 3px;
  min-height: 56px;
}

.mobile-tabbar-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  filter: saturate(0);
}

.mobile-tabbar-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  line-height: 1.3;
  transition: color 0.25s ease;
}

.mobile-tabbar-item.active {
  color: var(--palette-burgundy);
}

.mobile-tabbar-item.active .mobile-tabbar-icon {
  transform: scale(1.18) translateY(-1px);
  filter: saturate(1);
}

.mobile-tabbar-item.active .mobile-tabbar-label {
  font-weight: 700;
}

/* Tab 点击涟漪效果 */
.mobile-tabbar-item:active {
  transform: scale(0.92);
}

.mobile-tabbar-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, var(--palette-silver-red), #f78b84);
  border-radius: 0 0 3px 3px;
}

.mobile-tabbar-badge {
  position: absolute;
  top: 4px;
  right: calc(50% - 24px);
  background: linear-gradient(135deg, #f78b84, var(--palette-silver-red));
  color: var(--palette-burgundy-deep);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 16px;
  line-height: 1.4;
  box-shadow: 0 2px 6px rgba(129, 2, 31, 0.25);
  animation: badgePop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes badgePop {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* ==============================
   ======= 移动端视觉升级 =======
   ============================== */
.mobile-topbar {
  background:
    radial-gradient(circle at 82% -45%, rgba(239, 86, 84, 0.4), transparent 43%),
    linear-gradient(120deg, #40000e 0%, var(--palette-burgundy) 72%, #96142f 100%);
  box-shadow: 0 10px 28px rgba(65, 0, 15, 0.22);
}

.mobile-topbar::before {
  content: '';
  position: absolute;
  top: -44px;
  left: -28px;
  width: 112px;
  height: 112px;
  border: 22px solid rgba(255, 255, 255, 0.035);
  border-radius: 50%;
  pointer-events: none;
}

.mobile-topbar::after {
  bottom: -11px;
  height: 12px;
  background: linear-gradient(to bottom, rgba(65, 0, 15, 0.1), transparent);
}

.mobile-topbar-inner {
  padding: 13px 18px;
  padding-top: calc(13px + env(safe-area-inset-top, 0px));
}

.mobile-topbar-logo {
  gap: 11px;
}

.mobile-topbar-icon {
  width: 37px;
  height: 37px;
  border-radius: 12px;
  box-shadow: 0 7px 16px rgba(74, 5, 17, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}

.mobile-topbar-text span {
  font-size: 16px;
  letter-spacing: 0.45px;
  text-shadow: 0 1px 5px rgba(79, 5, 18, 0.18);
}

.mobile-role-slot {
  right: 15px;
}

.mobile-tabbar {
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  gap: 2px;
  padding: 7px 6px;
  border: 1px solid rgba(129, 2, 31, 0.12);
  border-radius: 23px;
  background: rgba(255, 249, 242, 0.92);
  box-shadow: 0 14px 38px rgba(43, 30, 35, 0.16);
  backdrop-filter: saturate(170%) blur(22px);
  -webkit-backdrop-filter: saturate(170%) blur(22px);
}

.mobile-tabbar::before {
  display: none;
}

.mobile-tabbar-item {
  min-width: 0;
  min-height: 53px;
  padding-inline: 2px;
  gap: 2px;
  border-radius: 17px;
  color: #927b80;
  z-index: 1;
}

.mobile-tabbar-icon {
  width: 21px;
  height: 21px;
  opacity: 0.58;
  filter: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mobile-tabbar-label {
  font-size: 9.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
}

.mobile-tabbar-item.active {
  background: linear-gradient(135deg, #fbe7dc, #fff8ef);
  color: var(--palette-burgundy);
}

.mobile-tabbar-item.active::before {
  display: none;
}

.mobile-tabbar-item.active .mobile-tabbar-icon {
  opacity: 1;
  transform: translateY(-1px) scale(1.08);
}

.mobile-tabbar-item.active .mobile-tabbar-label {
  font-weight: 800;
}

.mobile-tabbar-badge {
  top: 3px;
  right: calc(50% - 22px);
  background: var(--palette-silver-red);
  box-shadow: 0 4px 10px rgba(129, 2, 31, 0.25);
}

@media (max-width: 360px) {
  .mobile-tabbar {
    left: 8px;
    right: 8px;
    padding-inline: 4px;
  }

  .mobile-tabbar-label {
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-topbar *,
  .mobile-tabbar * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}

/* 页面切换 */
.page-shift-enter-active,
.page-shift-leave-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-shift-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-shift-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (prefers-reduced-motion: reduce) {
  .page-shift-enter-active,
  .page-shift-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
