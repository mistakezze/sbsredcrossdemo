<template>
  <div class="app-container">
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <div class="logo-icon">
            <span class="cross-h"></span>
            <span class="cross-v"></span>
          </div>
          <div class="logo-text">
            <h1>红十字会文化之旅</h1>
            <p>Red Cross Cultural Journey</p>
          </div>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
            🏠 首页
          </router-link>
          <router-link to="/routes" class="nav-item" :class="{ active: $route.path === '/routes' }">
            🗺️ 路线推荐
          </router-link>
          <router-link to="/checkins" class="nav-item" :class="{ active: $route.path === '/checkins' }">
            📋 个人打卡
            <span v-if="checkinCount > 0" class="badge">{{ checkinCount }}</span>
          </router-link>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <router-view></router-view>
    </main>
    <footer class="footer">
      <div class="footer-content">
        <p>© 2026 红十字会文化之旅 | 人道主义精神传承</p>
        <p class="footer-sub">以人为本 · 博爱奉献 · 共建和平</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCheckinStore } from './stores/checkinStore'

const router = useRouter()
const { checkinCount } = useCheckinStore()
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f9fc;
}

.header {
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.25);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  user-select: none;
  /* 防止 logo 挤压导航 */
  flex-shrink: 0;
  min-width: 0;
  max-width: 55%;
}

.logo-icon {
  width: 54px;
  height: 54px;
  background: white;
  border-radius: 14px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.logo-icon .cross-h,
.logo-icon .cross-v {
  position: absolute;
  background: #d32f2f;
}

.logo-icon .cross-h {
  width: 24px;
  height: 6px;
}

.logo-icon .cross-v {
  width: 6px;
  height: 24px;
}

.logo-text {
  min-width: 0;
}

.logo-text h1 {
  font-size: 20px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
  word-break: break-word;
  line-height: 1.3;
}

.logo-text p {
  font-size: 12px;
  margin: 2px 0 0 0;
  opacity: 0.85;
  letter-spacing: 1px;
  /* 小屏隐藏英文字样，节省空间 */
}

.nav {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
}

.nav-item {
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
  flex-shrink: 0;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.nav-item.active {
  background: white;
  color: #d32f2f;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.badge {
  background: #ffeb3b;
  color: #d32f2f;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  min-width: 20px;
  line-height: 1.4;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
}

.footer {
  background: #1a2332;
  color: #a0aec0;
  padding: 28px 32px;
  margin-top: auto;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.footer-content p {
  margin: 4px 0;
  font-size: 14px;
  word-break: break-word;
}

.footer-sub {
  font-size: 12px !important;
  opacity: 0.7;
  letter-spacing: 4px;
}

@media (max-width: 960px) {
  .logo-text p { display: none; }
  .nav-item { padding: 10px 12px; font-size: 13px; }
  .nav-item .nav-text { /* 如果有文字标签，可选择性隐藏 */ }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 14px 16px;
    gap: 12px;
    width: 100%;
  }

  .logo {
    width: 100%;
    justify-content: center;
    max-width: 100%;
  }

  .logo-icon { width: 44px; height: 44px; }
  .logo-icon .cross-h { width: 20px; height: 5px; }
  .logo-icon .cross-v { width: 5px; height: 20px; }

  .logo-text h1 { font-size: 17px; text-align: center; }

  .nav {
    width: 100%;
    justify-content: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 6px;
  }

  .nav-item {
    padding: 10px 14px;
    font-size: 13px;
    gap: 5px;
    flex-shrink: 0;
  }

  .badge {
    font-size: 10px;
    padding: 1px 7px;
    min-width: 16px;
    max-width: 36px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .main-content { padding: 16px 14px; }
}

@media (max-width: 400px) {
  .nav-item {
    padding: 8px 10px;
    font-size: 12px;
  }
  /* 极窄屏：只保留图标 */
  .nav-item .badge { display: none; }
  .logo-text h1 { font-size: 15px; }
  .logo-icon { width: 40px; height: 40px; }
  .logo-icon .cross-h { width: 18px; height: 4px; }
  .logo-icon .cross-v { width: 4px; height: 18px; }
}

</style>
