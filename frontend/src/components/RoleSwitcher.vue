<template>
  <div class="role-switcher" :class="{ 'is-mobile': isMobile }">
    <button class="role-trigger" :title="'当前身份：' + currentUser.name" @click="toggle">
      <span class="trigger-avatar" :style="{ background: currentUser.color }">
        <AppIcon :name="currentUser.icon" size="16" />
      </span>
      <span v-if="!isMobile" class="trigger-text">
        <span class="trigger-name">{{ currentUser.name }}</span>
        <span v-if="currentUser.starred" class="trigger-star">
          <AppIcon name="starFill" size="10" /> {{ currentUser.starLevel }}
        </span>
      </span>
      <span v-if="!isMobile" class="trigger-caret" :class="{ open }">▾</span>
    </button>

    <Teleport to="#overlay-root">
      <transition name="fade">
        <div v-if="open" class="role-backdrop" @click="close"></div>
      </transition>

      <transition :name="isMobile ? 'slide-up' : 'pop'">
        <div
          v-if="open"
          class="role-panel"
          :class="{ 'is-mobile': isMobile }"
          @click.stop
        >
          <div class="panel-head">
            <div class="panel-head-text">
              <span class="panel-title">切换演示角色</span>
              <span class="panel-sub">演示模式 · 不同角色权限不同</span>
            </div>
            <button class="panel-close" aria-label="关闭角色选择" @click="close">
              <AppIcon name="x" size="17" />
            </button>
          </div>

          <div class="role-list">
            <button
              v-for="r in ROLES"
              :key="r.key"
              class="role-item"
              :class="{ active: r.key === currentRoleKey }"
              @click="select(r.key)"
            >
              <span class="item-avatar" :style="{ background: r.color }">
                <AppIcon :name="r.icon" size="18" />
              </span>
              <span class="item-body">
                <span class="item-head">
                  <span class="item-name">{{ r.name }}</span>
                  <span v-if="r.starred" class="item-star">
                    <AppIcon name="starFill" size="10" /> {{ r.starLevel }}
                  </span>
                </span>
                <span class="item-desc">{{ r.desc }}</span>
              </span>
              <span v-if="r.key === currentRoleKey" class="item-check">
                <AppIcon name="check" size="15" />
              </span>
            </button>
          </div>

          <div class="panel-foot">
            当前身份：<strong>{{ currentUser.name }}</strong>
            <span v-if="currentUser.starred" class="foot-star">
              · 星级志愿者 <AppIcon name="starFill" size="11" /> {{ currentUser.starLevel }}
            </span>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useViewport } from '../composables/useViewport'

const { ROLES, currentRoleKey, currentUser, setRole } = useUserStore()
const { isMobile } = useViewport()

const open = ref(false)

const toggle = () => {
  open.value = !open.value
}

const close = () => {
  open.value = false
}

const select = (key) => {
  setRole(key)
  close()
}

// 弹层打开时锁定背景滚动（仅移动端体验需要）
watch(open, (val) => {
  if (isMobile.value) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.role-switcher {
  position: relative;
  flex-shrink: 0;
}

/* ========== 触发按钮 ========== */
.role-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  color: #fff;
}

.role-trigger:hover {
  background: rgba(255, 255, 255, 0.26);
}

.trigger-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.trigger-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.trigger-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.trigger-star {
  font-size: 10px;
  color: #ffe082;
  font-weight: 700;
  white-space: nowrap;
}

.trigger-caret {
  font-size: 11px;
  opacity: 0.8;
  transition: transform 0.25s ease;
}

.trigger-caret.open {
  transform: rotate(180deg);
}

/* 移动端触发按钮：只留圆形头像 */
.is-mobile .role-trigger {
  padding: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.is-mobile .trigger-avatar {
  width: 32px;
  height: 32px;
  font-size: 16px;
}

/* ========== 遮罩 ========== */
.role-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 26, 43, 0.55);
  backdrop-filter: blur(3px);
  z-index: 1990;
}

/* ========== 弹层 ========== */
.role-panel {
  position: fixed;
  top: 100px;
  right: 32px;
  width: 360px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(15, 26, 43, 0.28);
  z-index: 2000;
  padding: 18px;
  box-sizing: border-box;
}

.role-panel.is-mobile {
  top: auto;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  max-height: 82vh;
  border-radius: 20px 20px 0 0;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.28);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 12px;
  border-bottom: 1.5px solid #f0f2f5;
}

.panel-head-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.panel-title {
  font-size: 16px;
  font-weight: 800;
  color: #1a2332;
}

.panel-sub {
  font-size: 12px;
  color: #98a2b3;
}

.panel-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: #f4f6f9;
  border-radius: 50%;
  color: #7a8599;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.panel-close:hover {
  background: #e8ebef;
  color: #1a2332;
}

/* ========== 角色列表 ========== */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafbfc;
  border: 1.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.2s ease;
  width: 100%;
}

.role-item:hover {
  background: #fff;
  border-color: #ffcdd2;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(211, 47, 47, 0.08);
}

.role-item.active {
  background: linear-gradient(135deg, #fff5f5, #ffecec);
  border-color: #d32f2f;
  box-shadow: 0 4px 14px rgba(211, 47, 47, 0.14);
}

.item-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.14);
  color: white;
}

.item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.item-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a2332;
}

.item-star {
  font-size: 10px;
  font-weight: 700;
  color: #b7791f;
  background: rgba(249, 168, 37, 0.16);
  padding: 1px 6px;
  border-radius: 8px;
}

.item-desc {
  font-size: 11.5px;
  color: #7a8599;
  line-height: 1.45;
  word-break: break-word;
}

.item-check {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 800;
  color: #d32f2f;
}

.panel-foot {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1.5px solid #f0f2f5;
  font-size: 12px;
  color: #7a8599;
  line-height: 1.6;
}

.panel-foot strong {
  color: #d32f2f;
}

.foot-star {
  color: #b7791f;
  font-weight: 600;
}

/* ========== 过渡动画 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
