<template>
  <div class="app-container" :class="{ mobile: isMobile, desktop: !isMobile }">

    <!-- ====== 桌面端：顶部 Logo + 导航栏 ====== -->
    <header v-if="!isMobile" class="pc-header">
      <div class="pc-header-inner">
        <div class="pc-logo" @click="router.push('/')">
          <div class="pc-logo-icon">
            <span class="cross-h"></span>
            <span class="cross-v"></span>
          </div>
          <div class="pc-logo-text">
            <h1>红十字会文化之旅</h1>
            <p>Red Cross Cultural Journey</p>
          </div>
        </div>
        <nav class="pc-nav">
          <router-link to="/" class="pc-nav-item" :class="{ active: $route.path === '/' }">
            🏠 首页
          </router-link>
          <router-link to="/routes" class="pc-nav-item" :class="{ active: $route.path === '/routes' }">
            🗺️ 路线推荐
          </router-link>
          <router-link to="/checkins" class="pc-nav-item" :class="{ active: $route.path.startsWith('/checkins') }">
            📋 个人打卡
            <span v-if="checkinCount > 0" class="pc-badge">{{ checkinCount }}</span>
          </router-link>
        </nav>
      </div>
    </header>

    <!-- ====== 移动端：顶栏 + 底部 Tab ====== -->
    <header v-if="isMobile" class="mobile-topbar">
      <div class="mobile-topbar-inner">
        <div class="mobile-topbar-logo" @click="router.push('/')">
          <div class="mobile-topbar-icon">
            <span class="cross-h"></span>
            <span class="cross-v"></span>
          </div>
          <div class="mobile-topbar-text">
            <span>红十字会文化之旅</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ====== 内容区 ====== -->
    <main class="main-content" :class="{ 'pc-main': !isMobile, 'mobile-main': isMobile }">
      <router-view></router-view>
    </main>

    <!-- ====== 桌面端：页脚 ====== -->
    <footer v-if="!isMobile" class="pc-footer">
      <div class="pc-footer-inner">
        <p>© 2026 红十字会文化之旅 | 人道主义精神传承</p>
        <p class="pc-footer-sub">以人为本 · 博爱奉献 · 共建和平</p>
      </div>
    </footer>

    <!-- ====== 移动端：底部 Tab 栏 ====== -->
    <nav v-if="isMobile" class="mobile-tabbar">
      <router-link to="/" class="mobile-tabbar-item" :class="{ active: $route.path === '/' }">
        <span class="mobile-tabbar-icon">🏠</span>
        <span class="mobile-tabbar-label">首页</span>
      </router-link>
      <router-link to="/routes" class="mobile-tabbar-item" :class="{ active: $route.path === '/routes' }">
        <span class="mobile-tabbar-icon">🗺️</span>
        <span class="mobile-tabbar-label">路线</span>
      </router-link>
      <router-link to="/checkins" class="mobile-tabbar-item" :class="{ active: $route.path.startsWith('/checkins') }">
        <span class="mobile-tabbar-icon">📋</span>
        <span class="mobile-tabbar-label">打卡</span>
        <span v-if="checkinCount > 0" class="mobile-tabbar-badge">{{ checkinCount }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCheckinStore } from './stores/checkinStore'
import { useViewport } from './composables/useViewport'

const router = useRouter()
const { checkinCount } = useCheckinStore()
const { isMobile } = useViewport()
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f9fc;
}

/* ============ 桌面端样式 ============ */
.pc-header {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.25);
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
  background: #d32f2f;
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
  background: white;
  color: #d32f2f;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pc-badge {
  background: #ffeb3b;
  color: #d32f2f;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  min-width: 20px;
  line-height: 1.4;
}

.pc-main {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 96px 32px 0;
}

.pc-footer {
  background: #1a2332;
  color: #a0aec0;
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
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(211, 47, 47, 0.25);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.mobile-topbar-inner {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-topbar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.mobile-topbar-icon {
  width: 34px;
  height: 34px;
  background: white;
  border-radius: 9px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mobile-topbar-icon .cross-h {
  position: absolute;
  width: 16px;
  height: 4px;
  background: #d32f2f;
}

.mobile-topbar-icon .cross-v {
  position: absolute;
  width: 4px;
  height: 16px;
  background: #d32f2f;
}

.mobile-topbar-text {
  display: flex;
  flex-direction: column;
}

.mobile-topbar-text span {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.mobile-main {
  flex: 1;
  padding: 16px 14px 80px 14px; /* 底部留位给 tabbar */
  width: 100%;
  max-width: 100%;
}

.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  border-top: 1px solid #e5e9ef;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.06);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.mobile-tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  color: #7a8599;
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
  gap: 3px;
  min-height: 56px;
}

.mobile-tabbar-icon {
  font-size: 22px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.mobile-tabbar-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.mobile-tabbar-item.active {
  color: #d32f2f;
}

.mobile-tabbar-item.active .mobile-tabbar-icon {
  transform: scale(1.15);
}

.mobile-tabbar-badge {
  position: absolute;
  top: 6px;
  right: calc(50% - 22px);
  background: #d32f2f;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  line-height: 1.3;
  box-shadow: 0 1px 4px rgba(211, 47, 47, 0.35);
}
</style>
