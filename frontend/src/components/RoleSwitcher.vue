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
              :class="{ active: isRoleActive(r) }"
              @click="selectRole(r)"
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
              <span v-if="isRoleActive(r)" class="item-check">
                <AppIcon name="check" size="15" />
              </span>
            </button>
          </div>

          <transition name="fade">
            <section v-if="registeredOpen" class="registered-account-picker">
              <div class="registered-account-head">
                <div>
                  <span>选择登录账号</span>
                  <small>从 {{ registeredUserCount }} 名注册用户中随机抽取 5 名</small>
                </div>
                <button class="registered-refresh" @click="refreshRegisteredAccounts">
                  <AppIcon name="sparkles" size="12" />
                  换一批
                </button>
              </div>
              <div class="registered-account-list">
                <button
                  v-for="account in registeredAccountSample"
                  :key="account.id"
                  class="registered-account-item"
                  :class="{ active: currentRoleKey === account.id }"
                  @click="selectRegisteredAccount(account)"
                >
                  <span class="registered-account-avatar" :style="{ background: account.color }">
                    <AppIcon :name="account.icon" size="16" />
                  </span>
                  <span class="registered-account-copy">
                    <strong>{{ account.name }}</strong>
                    <small>{{ account.preferredActivityLabels.join(' · ') }}</small>
                  </span>
                  <AppIcon v-if="currentRoleKey === account.id" name="check" size="14" />
                </button>
              </div>
            </section>
          </transition>

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

const {
  ROLES,
  currentRoleKey,
  currentUser,
  registeredAccountSample,
  refreshRegisteredAccounts,
  registeredUserCount,
  setRole
} = useUserStore()
const { isMobile } = useViewport()

const open = ref(false)
const registeredOpen = ref(false)

const toggle = () => {
  open.value = !open.value
  if (open.value) {
    registeredOpen.value = currentUser.value.permissionRole === 'member'
    if (currentUser.value.simulated) refreshRegisteredAccounts()
  } else {
    registeredOpen.value = false
  }
}

const close = () => {
  open.value = false
}

const isRoleActive = (role) =>
  role.key === currentRoleKey.value ||
  (role.key === 'member' && currentUser.value.permissionRole === 'member')

const selectRole = (role) => {
  if (role.key === 'member') {
    setRole('member')
    registeredOpen.value = true
    return
  }
  setRole(role.key)
  registeredOpen.value = false
  close()
}

const selectRegisteredAccount = (account) => {
  setRole(account.id)
  registeredOpen.value = false
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
  background: rgba(254, 238, 225, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  color: #fff;
}

.role-trigger:hover {
  background: rgba(254, 238, 225, 0.23);
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
  background: rgba(255, 249, 242, 0.96);
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
  border-bottom: 1.5px solid rgba(129, 2, 31, 0.09);
}

.panel-head-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.panel-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--palette-burgundy-deep);
}

.panel-sub {
  font-size: 12px;
  color: var(--apple-secondary);
}

.panel-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(129, 2, 31, 0.06);
  border-radius: 50%;
  color: var(--apple-secondary);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.panel-close:hover {
  background: rgba(129, 2, 31, 0.12);
  color: var(--palette-burgundy);
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
  background: rgba(255, 250, 244, 0.82);
  border: 1.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.2s ease;
  width: 100%;
}

.role-item:hover {
  background: #fffaf3;
  border-color: rgba(239, 86, 84, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 7px 20px rgba(129, 2, 31, 0.08);
}

.role-item.active {
  background: linear-gradient(135deg, #feeee1, #fbe7dc);
  border-color: var(--palette-silver-red);
  box-shadow: 0 5px 16px rgba(129, 2, 31, 0.13);
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
  color: var(--palette-burgundy-deep);
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
  color: var(--apple-secondary);
  line-height: 1.45;
  word-break: break-word;
}

.item-check {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 800;
  color: var(--palette-silver-red);
}

.panel-foot {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1.5px solid rgba(129, 2, 31, 0.09);
  font-size: 12px;
  color: var(--apple-secondary);
  line-height: 1.6;
}

.panel-foot strong {
  color: var(--palette-burgundy);
}

.foot-star {
  color: #b7791f;
  font-weight: 600;
}

.registered-account-picker {
  margin-top: 13px;
  padding: 13px;
  border: 1px solid var(--apple-separator);
  border-radius: 15px;
  background: var(--apple-fill);
}

.registered-account-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.registered-account-head > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.registered-account-head span {
  color: var(--apple-ink);
  font-size: 12px;
  font-weight: 720;
}

.registered-account-head small {
  color: var(--apple-tertiary);
  font-size: 9px;
  line-height: 1.45;
}

.registered-refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 4px 7px;
  border: 1px solid var(--apple-separator);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.42);
  color: var(--apple-secondary);
  font-family: inherit;
  font-size: 9px;
  font-weight: 650;
  cursor: pointer;
}

.registered-account-list {
  display: grid;
  gap: 6px;
}

.registered-account-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 9px;
  border: 1px solid transparent;
  border-radius: 11px;
  background: var(--apple-surface-solid);
  color: var(--apple-secondary);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.registered-account-item:hover {
  transform: translateX(2px);
  border-color: rgba(239, 86, 84, 0.22);
}

.registered-account-item.active {
  border-color: rgba(239, 86, 84, 0.36);
  background: rgba(239, 86, 84, 0.1);
  color: var(--palette-burgundy);
}

.registered-account-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--palette-lotus-white);
  box-shadow: 0 3px 8px rgba(68, 2, 18, 0.16);
}

.registered-account-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.registered-account-copy strong {
  color: var(--apple-ink);
  font-size: 11px;
  font-weight: 680;
}

.registered-account-copy small {
  overflow: hidden;
  color: var(--apple-tertiary);
  font-size: 8.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:root[data-theme="dark"] .registered-refresh,
:root[data-theme="dark"] .registered-account-item {
  background: rgba(255, 255, 255, 0.055);
}

:root[data-theme="dark"] .registered-account-item.active {
  border-color: rgba(239, 86, 84, 0.38);
  background: rgba(239, 86, 84, 0.12);
  color: #ffaaa7;
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
