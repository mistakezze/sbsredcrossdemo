<template>
  <div class="checkins">
    <!-- ========== PC 端模板 ========== -->
    <template v-if="!isMobile">
      <section class="pc-page-header">
        <div class="pc-header-content">
          <span class="pc-page-tag"><AppIcon name="clipboard" size="13" /> 我的足迹</span>
          <h1 class="pc-page-title">个人打卡</h1>
          <p class="pc-page-desc">记录您探索红十字文化的每一步，把一次参观变成值得回看的旅程。</p>
        </div>
        <div class="pc-journey-summary">
          <div class="pc-progress-orb" :style="{ '--journey-progress': journeyProgress + '%' }">
            <span>{{ journeyProgress }}<small>%</small></span>
          </div>
          <div class="pc-journey-copy">
            <span class="pc-summary-label">JOURNEY PROGRESS</span>
            <strong>{{ checkinsWithEra.length }}<small> / {{ locations.length }}</small></strong>
            <span>个地点已点亮</span>
          </div>
        </div>
      </section>

      <div v-if="checkinsWithEra.length === 0" class="pc-empty-state">
        <div class="pc-empty-visual">
          <span class="pc-orbit-dot pc-orbit-dot-a"></span>
          <span class="pc-orbit-dot pc-orbit-dot-b"></span>
          <div class="pc-empty-icon">
            <div class="pc-empty-cross">
              <span class="pc-ec-h"></span>
              <span class="pc-ec-v"></span>
            </div>
          </div>
        </div>
        <span class="pc-empty-kicker">YOUR JOURNEY STARTS HERE</span>
        <h2 class="pc-empty-title">从一次相遇，开始你的红十字足迹</h2>
        <p class="pc-empty-desc">发现地点、完成参观，再留下一段专属感受。你的每一步都会成为这段文化旅程的一部分。</p>
        <div class="pc-empty-steps">
          <span><b>01</b> 发现地点</span>
          <i></i>
          <span><b>02</b> 完成打卡</span>
          <i></i>
          <span><b>03</b> 珍藏感受</span>
        </div>
        <div class="pc-empty-actions">
          <button class="pc-empty-btn" @click="goToRoutes">
            探索游览路线 <AppIcon name="arrowRight" size="14" />
          </button>
          <button class="pc-empty-secondary" @click="goToMap">先看看地图</button>
        </div>
      </div>

      <section v-else class="pc-checkin-list">
        <div class="pc-list-header">
          <h3 class="pc-list-title">打卡记录</h3>
          <span class="pc-list-count">共 {{ checkinsWithEra.length }} 条</span>
        </div>

        <div class="pc-timeline">
          <div
            v-for="(checkin, index) in checkinsWithEra"
            :key="checkin.id"
            class="pc-timeline-item"
            @click="viewDetail(checkin.locationId)"
          >
            <div class="pc-timeline-left">
              <div class="pc-timeline-dot" :class="{ 'pc-first-dot': index === 0 }">
                {{ index + 1 }}
              </div>
              <div v-if="index < checkinsWithEra.length - 1" class="pc-timeline-line"></div>
            </div>

            <div class="pc-timeline-card">
              <div class="pc-card-top">
                <h3 class="pc-card-location">{{ checkin.locationName }}</h3>
                <div class="pc-card-tags">
                  <span v-if="checkin.era" class="pc-card-era" :class="'era-' + checkin.era">
                    <AppIcon :name="checkin.era === 'history' ? 'historic' : 'city'" size="11" />
                    {{ eraLabel(checkin.era) }}
                  </span>
                  <span class="pc-card-category">{{ checkin.category }}</span>
                </div>
              </div>

              <div class="pc-card-info">
                <div class="pc-info-row">
                  <span class="pc-info-icon"><AppIcon name="pin" size="13" /></span>
                  <span class="pc-info-text">{{ checkin.location }}</span>
                </div>
                <div class="pc-info-row">
                  <span class="pc-info-icon"><AppIcon name="clock" size="13" /></span>
                  <span class="pc-info-text">{{ checkin.checkinTime }}</span>
                </div>
              </div>

              <div v-if="checkin.note" class="pc-card-note">
                <span class="pc-note-label">我的备注</span>
                <p class="pc-note-content">{{ checkin.note }}</p>
              </div>

              <div class="pc-card-footer">
                <span class="pc-view-detail">
                  查看详情 <AppIcon name="arrowRight" size="13" />
                </span>
                <button class="pc-delete-btn" @click.stop="handleDelete(checkin)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ========== 移动端模板 ========== -->
    <template v-else>
      <section class="m-page-header">
        <div class="m-hero-main">
          <div class="m-hero-copy">
            <span class="m-page-tag"><span class="m-tag-dot"></span> 个人打卡</span>
            <h1 class="m-page-title">我的红十字足迹</h1>
            <p class="m-page-desc">每一步都有意义，每一次相遇都值得珍藏。</p>
          </div>
          <div class="m-progress-orb" :style="{ '--journey-progress': journeyProgress + '%' }">
            <span>{{ journeyProgress }}<small>%</small></span>
          </div>
        </div>
        <div class="m-hero-meta">
          <span><strong>{{ checkinsWithEra.length }}</strong> 枚足迹</span>
          <i></i>
          <span>共 {{ locations.length }} 个文化地点</span>
        </div>
      </section>

      <div v-if="checkinsWithEra.length === 0" class="m-empty-state">
        <div class="m-empty-visual">
          <div class="m-empty-icon">
            <div class="m-empty-cross">
              <span class="m-ec-h"></span>
              <span class="m-ec-v"></span>
            </div>
          </div>
          <span class="m-empty-spark m-spark-a"></span>
          <span class="m-empty-spark m-spark-b"></span>
        </div>
        <span class="m-empty-kicker">YOUR JOURNEY STARTS HERE</span>
        <h2 class="m-empty-title">下一枚足迹，等你点亮</h2>
        <p class="m-empty-desc">从一条路线开始，到达真正的红十字文化现场。完成参观后，回来留下你的时间与感受。</p>
        <div class="m-empty-steps">
          <span class="m-empty-step"><b>01</b>发现地点</span>
          <span class="m-empty-step"><b>02</b>完成打卡</span>
          <span class="m-empty-step"><b>03</b>珍藏感受</span>
        </div>
        <div class="m-empty-actions">
          <button class="m-empty-btn" @click="goToRoutes">
            开始探索路线 <AppIcon name="arrowRight" size="14" />
          </button>
          <button class="m-empty-secondary" @click="goToMap">先浏览地点地图</button>
        </div>
      </div>

      <section v-else class="m-checkin-list">
        <div class="m-list-heading">
          <div>
            <span class="m-list-kicker">JOURNEY LOG</span>
            <h2>足迹时间线</h2>
          </div>
          <span class="m-list-count">{{ checkinsWithEra.length }} 枚</span>
        </div>
        <div
          v-for="(checkin, index) in checkinsWithEra"
          :key="checkin.id"
          class="m-timeline-item"
          @click="viewDetail(checkin.locationId)"
        >
          <div class="m-timeline-left">
            <div class="m-timeline-dot" :class="{ 'm-first-dot': index === 0 }">
              {{ index + 1 }}
            </div>
            <div v-if="index < checkinsWithEra.length - 1" class="m-timeline-line"></div>
          </div>

          <div class="m-timeline-card">
            <div class="m-card-top">
              <h3 class="m-card-location">{{ checkin.locationName }}</h3>
              <div class="m-card-tags">
                <span v-if="checkin.era" class="m-card-era" :class="'era-' + checkin.era">
                  <AppIcon :name="checkin.era === 'history' ? 'historic' : 'city'" size="10" />
                  {{ eraLabel(checkin.era) }}
                </span>
                <span class="m-card-category">{{ checkin.category }}</span>
              </div>
            </div>

            <div class="m-card-info">
              <div class="m-info-row">
                <span class="m-info-icon"><AppIcon name="pin" size="12" /></span>
                <span class="m-info-text">{{ checkin.location }}</span>
              </div>
              <div class="m-info-row">
                <span class="m-info-icon"><AppIcon name="clock" size="12" /></span>
                <span class="m-info-text">{{ checkin.checkinTime }}</span>
              </div>
            </div>

            <div v-if="checkin.note" class="m-card-note">
              <p class="m-note-content">{{ checkin.note }}</p>
            </div>

            <div class="m-card-footer">
              <span class="m-view-detail">查看详情 <AppIcon name="arrowRight" size="12" /></span>
              <button class="m-delete-btn" @click.stop="handleDelete(checkin)">
                删除
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ========== 删除确认弹窗（共用） ========== -->
    <transition name="fade">
      <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="showDeleteConfirm = false">
        <div class="confirm-box" :class="{ 'confirm-box-mobile': isMobile }">
          <div class="confirm-icon"><AppIcon name="alert" size="28" /></div>
          <h3 class="confirm-title">确认删除</h3>
          <p class="confirm-desc">确定要删除「{{ deleteTarget?.locationName }}」的打卡记录吗？此操作无法撤销。</p>
          <div class="confirm-actions">
            <button class="confirm-btn cancel" @click="showDeleteConfirm = false">取消</button>
            <button class="confirm-btn danger" @click="confirmDelete">确认删除</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckinStore } from '../stores/checkinStore'
import { useLocationStore } from '../stores/locationStore'
import { useViewport } from '../composables/useViewport'

const { isMobile } = useViewport()

const router = useRouter()
const { checkins, removeCheckin } = useCheckinStore()
const { locations, getLocationById } = useLocationStore()

// 旧打卡记录可能没有 era 字段，按 locationId 关联地点数据兜底
const checkinsWithEra = computed(() =>
  checkins.value.map(c => ({
    ...c,
    era: c.era || getLocationById(c.locationId)?.era || ''
  }))
)

const journeyProgress = computed(() => {
  if (!locations.value.length) return 0
  return Math.min(100, Math.round((checkinsWithEra.value.length / locations.value.length) * 100))
})

const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const goToRoutes = () => {
  router.push('/routes')
}

const goToMap = () => {
  router.push('/map')
}

const eraLabel = (era) => (era === 'history' ? '历史' : era === 'modern' ? '现代' : '')

const viewDetail = (locationId) => {
  router.push(`/checkins/${locationId}`)
}

const handleDelete = (checkin) => {
  deleteTarget.value = checkin
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    removeCheckin(deleteTarget.value.id)
  }
  showDeleteConfirm.value = false
  deleteTarget.value = null
}
</script>

<style scoped>
/* ==============================
   通用根容器
   ============================== */
.checkins {
  display: flex;
  flex-direction: column;
}

/* ==============================
   ======= PC 端样式组 =======
   ============================== */

/* ========== PC 页面头部 ========== */
.pc-page-header {
  background: linear-gradient(135deg, #feeee1 0%, #fbe7dc 100%);
  border-radius: 24px;
  padding: 48px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
  animation: pc-headerFadeIn 0.8s ease-out;
}

@keyframes pc-headerFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.pc-page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.15), transparent 70%);
  animation: pc-bgPulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pc-bgPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
}

.pc-page-tag {
  display: inline-block;
  padding: 8px 20px;
  background: white;
  border: 2px solid #ef5654;
  color: #ef5654;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.15);
  animation: pc-tagFloat 3s ease-in-out infinite;
}

@keyframes pc-tagFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.pc-page-title {
  font-size: clamp(22px, 5vw, 40px);
  color: #32181f;
  margin: 0 0 16px 0;
  font-weight: 800;
  position: relative;
  background: linear-gradient(135deg, #32181f, #ef5654, #32181f);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pc-titleShine 5s ease-in-out infinite;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.25;
}

@keyframes pc-titleShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.pc-page-desc {
  font-size: 16px;
  color: #635057;
  line-height: 1.7;
  margin: 0;
  max-width: 500px;
  position: relative;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-header-stats-card {
  background: white;
  border-radius: 20px;
  padding: 28px 36px;
  box-shadow: 0 8px 32px rgba(211, 47, 47, 0.15);
  text-align: center;
  min-width: 160px;
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pc-statsSlideIn 0.8s ease-out 0.3s backwards;
}

@keyframes pc-statsSlideIn {
  from { opacity: 0; transform: translateX(30px) scale(0.9); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

.pc-header-stats-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 16px 40px rgba(211, 47, 47, 0.25);
}

.pc-stats-number {
  font-size: 48px;
  font-weight: 800;
  color: #ef5654;
  line-height: 1;
  position: relative;
  text-shadow: 0 2px 12px rgba(211, 47, 47, 0.2);
}

.pc-stats-number::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: -12px;
  width: 10px;
  height: 10px;
  background: #ef5654;
  border-radius: 50%;
  animation: pc-dotPulse 2s ease-in-out infinite;
}

@keyframes pc-dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

.pc-stats-label {
  font-size: 13px;
  color: #79636a;
  margin-top: 10px;
  letter-spacing: 0.5px;
}

/* ========== PC 空状态 ========== */
.pc-empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.06);
  position: relative;
  overflow: hidden;
  animation: pc-emptyFadeIn 0.8s ease-out;
}

@keyframes pc-emptyFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.pc-empty-icon {
  width: 140px;
  height: 140px;
  margin: 0 auto 28px;
  background: linear-gradient(135deg, #feeee1, #fbe7dc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: pc-iconFloat 4s ease-in-out infinite;
}

@keyframes pc-iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.pc-empty-icon::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.15), transparent 70%);
  animation: pc-emptyGlow 3s ease-in-out infinite;
}

@keyframes pc-emptyGlow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.pc-empty-cross {
  width: 70px;
  height: 70px;
  background: #ef5654;
  border-radius: 18px;
  opacity: 0.25;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.3);
  animation: pc-crossRotate 6s ease-in-out infinite;
}

@keyframes pc-crossRotate {
  0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.25; }
  50% { transform: rotate(15deg) scale(1.08); opacity: 0.4; }
}

.pc-ec-h, .pc-ec-v {
  position: absolute;
  background: #ef5654;
  opacity: 1;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
}

.pc-ec-h { width: 38px; height: 10px; }
.pc-ec-v { width: 10px; height: 38px; }

.pc-empty-title {
  font-size: 24px;
  color: #32181f;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.pc-empty-desc {
  font-size: 15px;
  color: #635057;
  margin: 0 0 28px 0;
}

.pc-empty-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #ef5654, #81021f);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.3);
  position: relative;
  overflow: hidden;
}

.pc-empty-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: pc-btnShine 3s ease-in-out infinite;
}

@keyframes pc-btnShine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.pc-empty-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.45);
}

/* ========== PC 打卡列表与时间轴 ========== */
.pc-checkin-list {
  background: white;
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.06);
  margin-bottom: 40px;
  animation: pc-listFadeIn 0.8s ease-out;
}

@keyframes pc-listFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.pc-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3e8de;
  position: relative;
}

.pc-list-header::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 80px;
  background: linear-gradient(90deg, #ef5654, #ef5654);
  border-radius: 2px;
  animation: pc-lineSweep 2s ease-out;
}

@keyframes pc-lineSweep {
  from { width: 0; }
  to { width: 80px; }
}

.pc-list-title {
  font-size: 20px;
  color: #32181f;
  margin: 0;
  font-weight: 700;
}

.pc-list-count {
  font-size: 13px;
  color: #79636a;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(255, 112, 67, 0.1));
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  color: #ef5654;
}

.pc-timeline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.pc-timeline-item {
  display: flex;
  gap: 20px;
  cursor: pointer;
  position: relative;
  animation: pc-timelineSlideIn 0.6s ease-out backwards;
}

.pc-timeline-item:nth-child(1) { animation-delay: 0.1s; }
.pc-timeline-item:nth-child(2) { animation-delay: 0.2s; }
.pc-timeline-item:nth-child(3) { animation-delay: 0.3s; }
.pc-timeline-item:nth-child(4) { animation-delay: 0.4s; }
.pc-timeline-item:nth-child(5) { animation-delay: 0.5s; }
.pc-timeline-item:nth-child(6) { animation-delay: 0.6s; }
.pc-timeline-item:nth-child(7) { animation-delay: 0.7s; }
.pc-timeline-item:nth-child(8) { animation-delay: 0.8s; }

@keyframes pc-timelineSlideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.pc-timeline-item:hover .pc-timeline-card {
  transform: translateX(8px);
  box-shadow: 0 10px 32px rgba(211, 47, 47, 0.18);
  border-color: #ef5654;
  background: linear-gradient(135deg, #fff7ed 0%, #fffaf3 100%);
}

.pc-timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 40px;
  position: relative;
}

.pc-timeline-dot {
  width: 40px;
  height: 40px;
  background: #f3e8de;
  color: #79636a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pc-timeline-dot::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(211, 47, 47, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pc-timeline-item:hover .pc-timeline-dot {
  background: linear-gradient(135deg, #ef5654, #ef5654);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.4);
}

.pc-timeline-item:hover .pc-timeline-dot::after {
  opacity: 1;
  animation: pc-ringPulse 1.5s ease-in-out infinite;
}

@keyframes pc-ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.2; }
}

.pc-timeline-dot.pc-first-dot {
  background: linear-gradient(135deg, #ef5654, #81021f);
  color: white;
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.35);
  animation: pc-firstDotPulse 3s ease-in-out infinite;
}

@keyframes pc-firstDotPulse {
  0%, 100% { box-shadow: 0 6px 16px rgba(211, 47, 47, 0.35); }
  50% { box-shadow: 0 8px 24px rgba(211, 47, 47, 0.55); }
}

.pc-timeline-line {
  width: 3px;
  flex: 1;
  min-height: 30px;
  background: linear-gradient(180deg, rgba(211, 47, 47, 0.4) 0%, rgba(211, 47, 47, 0.15) 100%);
  position: relative;
  overflow: hidden;
}

.pc-timeline-line::after {
  content: '';
  position: absolute;
  top: -50%;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, transparent, #ef5654, transparent);
  animation: pc-lineFlow 2.5s ease-in-out infinite;
}

@keyframes pc-lineFlow {
  0% { top: -50%; }
  100% { top: 100%; }
}

.pc-timeline-card {
  flex: 1;
  background: #fbf4eb;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.pc-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.pc-card-location {
  font-size: 17px;
  color: #32181f;
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-timeline-item:hover .pc-card-location {
  color: #ef5654;
}

.pc-card-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.pc-card-era {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  white-space: nowrap;
}

.pc-card-era.era-history {
  background: rgba(184, 134, 11, 0.14);
  color: #96700c;
}

.pc-card-era.era-modern {
  background: rgba(211, 47, 47, 0.1);
  color: #81021f;
}

.pc-card-category {
  font-size: 11px;
  color: white;
  background: linear-gradient(135deg, #ef5654, #ef5654);
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
}

.pc-card-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 14px;
}

.pc-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #79636a;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-card-note {
  background: linear-gradient(135deg, #fff8e1, #ffe9d9);
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 14px;
  border-left: 3px solid #ff9800;
  position: relative;
  overflow: hidden;
}

.pc-card-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: pc-noteShine 4s ease-in-out infinite;
}

@keyframes pc-noteShine {
  0% { left: -100%; }
  50%, 100% { left: 150%; }
}

.pc-note-label {
  font-size: 11px;
  color: #8a6d00;
  font-weight: 700;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}

.pc-note-content {
  font-size: clamp(12px, 2vw, 14px);
  color: #5d4e00;
  line-height: 1.7;
  margin: 0;
  position: relative;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e8ecf3;
}

.pc-view-detail {
  font-size: 13px;
  color: #ef5654;
  font-weight: 600;
  transition: transform 0.3s ease;
  position: relative;
}

.pc-timeline-item:hover .pc-view-detail {
  transform: translateX(6px);
}

.pc-delete-btn {
  background: transparent;
  border: 1px solid #eadfd6;
  color: #79636a;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pc-delete-btn:hover {
  background: linear-gradient(135deg, #feeee1, #fbe7dc);
  color: #ef5654;
  border-color: #ef5654;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.15);
}

/* ==============================
   ======= 移动端样式组 =======
   ============================== */

/* ========== 移动端页面头部 ========== */
.m-page-header {
  background: linear-gradient(160deg, #feeee1 0%, #fbe7dc 40%, #fbe9df 100%);
  border-radius: 18px;
  padding: clamp(18px, 4.5vw, 26px) clamp(16px, 4vw, 22px);
  margin-bottom: clamp(14px, 3vw, 20px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: clamp(10px, 2vw, 14px);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.06);
}

.m-page-header::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.1), transparent 70%);
  pointer-events: none;
}

.m-page-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: clamp(5px, 1vw, 7px) clamp(12px, 2.5vw, 16px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid rgba(211, 47, 47, 0.15);
  color: #ef5654;
  border-radius: 50px;
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 10px rgba(211, 47, 47, 0.1);
  word-break: break-word;
}

.m-page-title {
  font-size: clamp(19px, 5vw, 25px);
  color: #32181f;
  margin: 0;
  font-weight: 800;
  position: relative;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.25;
  background: linear-gradient(135deg, #32181f 30%, #ef5654 70%, #81021f);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.m-header-stats-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 14px;
  padding: clamp(12px, 2.5vw, 16px) clamp(16px, 3.5vw, 22px);
  box-shadow: 0 2px 16px rgba(211, 47, 47, 0.08), 0 0 0 1px rgba(211, 47, 47, 0.04);
  text-align: center;
  width: 100%;
  max-width: 200px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 2vw, 12px);
}

.m-stats-number {
  font-size: clamp(22px, 5.5vw, 30px);
  font-weight: 800;
  color: #ef5654;
  line-height: 1;
  position: relative;
}

.m-stats-label {
  font-size: clamp(11px, 2.8vw, 13px);
  color: #9a858a;
  letter-spacing: 0.5px;
  font-weight: 600;
}

/* ========== 移动端空状态 ========== */
.m-empty-state {
  text-align: center;
  padding: clamp(40px, 10vw, 60px) clamp(16px, 4vw, 24px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1.5px solid rgba(211, 47, 47, 0.04);
  box-shadow: 0 2px 16px rgba(26, 35, 50, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.m-empty-icon {
  width: clamp(80px, 22vw, 110px);
  height: clamp(80px, 22vw, 110px);
  margin: 0 auto clamp(16px, 4vw, 24px);
  background: linear-gradient(135deg, #feeee1, #fbe7dc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.m-empty-cross {
  width: clamp(40px, 11vw, 56px);
  height: clamp(40px, 11vw, 56px);
  background: #ef5654;
  border-radius: 12px;
  opacity: 0.28;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.25);
}

.m-ec-h, .m-ec-v {
  position: absolute;
  background: #ef5654;
  opacity: 1;
}

.m-ec-h { width: 60%; height: 18%; }
.m-ec-v { width: 18%; height: 60%; }

.m-empty-title {
  font-size: clamp(16px, 4.5vw, 20px);
  color: #32181f;
  margin: 0 0 clamp(8px, 2vw, 12px) 0;
  font-weight: 700;
  word-break: break-word;
  overflow-wrap: break-word;
}

.m-empty-desc {
  font-size: clamp(12px, 3vw, 14px);
  color: #9a858a;
  margin: 0 0 clamp(20px, 5vw, 28px) 0;
  line-height: 1.65;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 280px;
}

.m-empty-btn {
  width: 100%;
  max-width: 320px;
  padding: clamp(14px, 3.2vw, 16px) clamp(16px, 4vw, 24px);
  background: linear-gradient(135deg, #ef5654, #81021f);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: clamp(14px, 3.5vw, 16px);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.3px;
}

.m-empty-btn:active {
  transform: scale(0.96);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
}

/* ========== 移动端打卡列表 ========== */
.m-checkin-list {
  background: white;
  border-radius: 16px;
  padding: clamp(12px, 3vw, 16px) clamp(10px, 2.5vw, 14px);
  box-shadow: 0 2px 12px rgba(26, 35, 50, 0.06);
  margin-bottom: clamp(12px, 3vw, 20px);
}

.m-timeline-item {
  display: flex;
  gap: clamp(10px, 2.5vw, 14px);
  cursor: pointer;
  position: relative;
}

.m-timeline-item:active .m-timeline-card {
  background: linear-gradient(135deg, #fff7ed 0%, #fffaf3 100%);
  transform: scale(0.98);
}

.m-timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: clamp(24px, 6vw, 30px);
  position: relative;
}

.m-timeline-dot {
  width: clamp(24px, 6vw, 30px);
  height: clamp(24px, 6vw, 30px);
  background: #f3e8de;
  color: #79636a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: clamp(10px, 2.6vw, 12px);
  flex-shrink: 0;
  z-index: 2;
  position: relative;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.m-timeline-dot.m-first-dot {
  background: linear-gradient(135deg, #ef5654, #81021f);
  color: white;
  box-shadow: 0 3px 10px rgba(211, 47, 47, 0.3);
}

.m-timeline-line {
  width: 2px;
  flex: 1;
  min-height: clamp(20px, 5vw, 28px);
  background: linear-gradient(180deg, rgba(211, 47, 47, 0.35) 0%, rgba(211, 47, 47, 0.12) 100%);
}

.m-timeline-card {
  flex: 1;
  background: #fffaf3;
  border-radius: 16px;
  padding: clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 18px);
  margin-bottom: clamp(10px, 2.5vw, 14px);
  box-shadow: 0 2px 16px rgba(26, 35, 50, 0.05);
  border: 1.5px solid rgba(211, 47, 47, 0.04);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.m-timeline-card:active {
  transform: scale(0.99);
  border-color: rgba(211, 47, 47, 0.1);
}

.m-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: clamp(8px, 2vw, 12px);
  margin-bottom: clamp(8px, 2vw, 12px);
}

.m-card-location {
  font-size: clamp(14px, 3.6vw, 16px);
  color: #32181f;
  margin: 0;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: break-word;
  flex: 1;
}

.m-card-tags {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.m-card-era {
  font-size: clamp(9px, 2.2vw, 10px);
  padding: clamp(3px, 0.8vw, 4px) clamp(6px, 1.5vw, 8px);
  border-radius: 7px;
  font-weight: 700;
  white-space: nowrap;
}

.m-card-era.era-history {
  background: rgba(184, 134, 11, 0.14);
  color: #96700c;
}

.m-card-era.era-modern {
  background: rgba(211, 47, 47, 0.1);
  color: #81021f;
}

.m-card-category {
  font-size: clamp(10px, 2.4vw, 11px);
  color: white;
  background: linear-gradient(135deg, #ef5654, #ef5654);
  padding: clamp(3px, 0.8vw, 4px) clamp(8px, 2vw, 10px);
  border-radius: 8px;
  font-weight: 700;
  flex-shrink: 0;
  word-break: break-word;
  box-shadow: 0 2px 6px rgba(211, 47, 47, 0.25);
}

.m-card-info {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1.5vw, 8px);
  margin-bottom: clamp(10px, 2.5vw, 12px);
}

.m-info-row {
  display: flex;
  align-items: flex-start;
  gap: clamp(6px, 1.5vw, 8px);
  font-size: clamp(11px, 2.8vw, 13px);
  color: #9a858a;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.55;
}

.m-card-note {
  background: linear-gradient(135deg, #fff8e1, #ffe9d9);
  padding: clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 14px);
  border-radius: 10px;
  margin-bottom: clamp(10px, 2.5vw, 12px);
  border-left: 3px solid #ff9800;
  box-shadow: 0 1px 6px rgba(255, 152, 0, 0.06);
}

.m-note-content {
  font-size: clamp(11px, 2.8vw, 13px);
  color: #5d4e00;
  line-height: 1.65;
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.m-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(8px, 2vw, 12px);
  padding-top: clamp(8px, 2vw, 12px);
  border-top: 1px solid rgba(211, 47, 47, 0.06);
}

.m-view-detail {
  font-size: clamp(11px, 2.8vw, 13px);
  color: #ef5654;
  font-weight: 700;
  flex: 1;
  word-break: break-word;
}

.m-delete-btn {
  background: transparent;
  border: 1.5px solid rgba(211, 47, 47, 0.12);
  color: #9a858a;
  padding: clamp(5px, 1.3vw, 7px) clamp(10px, 2.5vw, 14px);
  border-radius: 10px;
  font-size: clamp(11px, 2.6vw, 12px);
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.m-delete-btn:active {
  background: linear-gradient(135deg, #feeee1, #fbe7dc);
  color: #ef5654;
  border-color: rgba(211, 47, 47, 0.3);
  transform: scale(0.96);
}

/* ==============================
   ======= 确认弹窗（共用） =======
   ============================== */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 35, 50, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-box {
  background: white;
  border-radius: 20px;
  padding: 36px;
  text-align: center;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirm-title {
  font-size: 20px;
  color: #32181f;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.confirm-desc {
  font-size: 14px;
  color: #635057;
  line-height: 1.7;
  margin: 0 0 24px 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn.cancel {
  background: #f3e8de;
  color: #635057;
}

.confirm-btn.cancel:hover {
  background: #eadfd6;
}

.confirm-btn.danger {
  background: linear-gradient(135deg, #ef5654, #81021f);
  color: white;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.confirm-btn.danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.4);
}

/* 移动端弹窗适配 */
.confirm-box.confirm-box-mobile {
  padding: clamp(24px, 6vw, 32px) clamp(20px, 5vw, 28px);
  border-radius: 16px;
  max-width: 100%;
}

.confirm-box.confirm-box-mobile .confirm-icon {
  font-size: clamp(36px, 9vw, 44px);
  margin-bottom: clamp(10px, 2.5vw, 14px);
}

.confirm-box.confirm-box-mobile .confirm-title {
  font-size: clamp(16px, 4.2vw, 18px);
  margin-bottom: clamp(8px, 2vw, 10px);
}

.confirm-box.confirm-box-mobile .confirm-desc {
  font-size: clamp(12px, 3vw, 13px);
  line-height: 1.6;
  margin-bottom: clamp(18px, 4.5vw, 22px);
}

.confirm-box.confirm-box-mobile .confirm-actions {
  flex-direction: column;
  gap: 10px;
}

.confirm-box.confirm-box-mobile .confirm-btn {
  width: 100%;
  padding: clamp(10px, 2.6vw, 12px) clamp(14px, 3.5vw, 18px);
  font-size: clamp(13px, 3.2vw, 14px);
}

.confirm-box.confirm-box-mobile .confirm-btn:active {
  transform: scale(0.97);
}

/* ==============================
   ======= 过渡动画（共用） =======
   ============================== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ==============================
   ======= 视觉升级 =======
   ============================== */
.checkins {
  --journey-red: #ef5654;
  --journey-red-deep: #8d1424;
  --journey-ink: #32181f;
  --journey-muted: #778093;
  --journey-cream: #fef5ea;
  --journey-line: rgba(129, 45, 58, 0.12);
}

/* PC 主视觉 */
.pc-page-header {
  min-height: 260px;
  padding: 46px 52px;
  background:
    radial-gradient(circle at 86% 20%, rgba(255, 255, 255, 0.85) 0 7%, transparent 7.2%),
    radial-gradient(circle at 88% 28%, rgba(255, 255, 255, 0.42) 0 13%, transparent 13.2%),
    linear-gradient(125deg, #fff9f5 0%, #fff1ed 48%, #f9dce1 100%);
  border: 1px solid rgba(159, 38, 55, 0.1);
  border-radius: 30px;
  box-shadow: 0 22px 60px rgba(117, 27, 43, 0.08);
}

.pc-page-header::before {
  top: auto;
  right: 18%;
  bottom: -180px;
  width: 390px;
  height: 390px;
  border: 1px solid rgba(197, 34, 55, 0.12);
  border-radius: 50%;
  background: transparent;
  animation: none;
}

.pc-page-header::after {
  content: '';
  position: absolute;
  width: 210px;
  height: 210px;
  right: -54px;
  bottom: -72px;
  border-radius: 42px;
  background: linear-gradient(135deg, rgba(197, 34, 55, 0.14), rgba(232, 110, 120, 0.03));
  transform: rotate(18deg);
  pointer-events: none;
}

.pc-header-content {
  max-width: 650px;
}

.pc-page-tag {
  margin-bottom: 22px;
  padding: 8px 16px;
  border: 1px solid rgba(197, 34, 55, 0.14);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: none;
  animation: none;
}

.pc-page-title {
  margin-bottom: 14px;
  font-size: clamp(34px, 4.2vw, 54px);
  letter-spacing: -1.5px;
  background: linear-gradient(120deg, #32181f 20%, #a9152b 100%);
  -webkit-text-fill-color: transparent;
  animation: none;
}

.pc-page-desc {
  max-width: 580px;
  color: #6f6570;
  font-size: 15px;
}

.pc-journey-summary {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 270px;
  padding: 22px 24px;
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 42px rgba(108, 24, 39, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.pc-progress-orb,
.m-progress-orb {
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: conic-gradient(var(--journey-red) var(--journey-progress), rgba(151, 46, 63, 0.12) 0);
}

.pc-progress-orb {
  width: 96px;
  height: 96px;
}

.pc-progress-orb::before,
.m-progress-orb::before {
  content: '';
  position: absolute;
  inset: 7px;
  border-radius: inherit;
  background: #fffaf8;
  box-shadow: inset 0 0 0 1px rgba(145, 36, 52, 0.06);
}

.pc-progress-orb > span,
.m-progress-orb > span {
  position: relative;
  z-index: 1;
  color: var(--journey-red-deep);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
}

.pc-progress-orb > span {
  font-size: 25px;
}

.pc-progress-orb small,
.m-progress-orb small {
  font-size: 0.55em;
  letter-spacing: 0;
}

.pc-journey-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pc-summary-label,
.pc-empty-kicker,
.m-empty-kicker,
.m-list-kicker {
  color: #a34453;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.pc-journey-copy strong {
  margin: 3px 0;
  color: var(--journey-ink);
  font-size: 28px;
  line-height: 1.15;
}

.pc-journey-copy strong small {
  color: #a79a9e;
  font-size: 15px;
}

.pc-journey-copy > span:last-child {
  color: var(--journey-muted);
  font-size: 12px;
}

/* PC 空状态 */
.pc-empty-state {
  padding: 64px 48px 54px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.96)),
    radial-gradient(circle at 50% 0, rgba(197, 34, 55, 0.14), transparent 46%);
  border: 1px solid rgba(143, 37, 54, 0.09);
  border-radius: 30px;
  box-shadow: 0 18px 48px rgba(36, 37, 50, 0.06);
}

.pc-empty-visual {
  position: relative;
  width: 150px;
  height: 118px;
  margin: 0 auto 24px;
  display: grid;
  place-items: center;
}

.pc-empty-visual::before {
  content: '';
  position: absolute;
  inset: 5px 8px 12px;
  border: 1.5px dashed rgba(197, 34, 55, 0.22);
  border-radius: 50%;
  transform: rotate(-8deg);
}

.pc-empty-icon {
  width: 88px;
  height: 88px;
  margin: 0;
  background: #fff4f2;
  box-shadow: inset 0 0 0 1px rgba(197, 34, 55, 0.08);
  animation: none;
}

.pc-empty-icon::before {
  inset: 11px;
  border: 1px solid rgba(197, 34, 55, 0.1);
  animation: none;
}

.pc-empty-cross {
  width: 54px;
  height: 54px;
  border-radius: 17px;
  opacity: 1;
  background: linear-gradient(145deg, #d52b42, #99182a);
  box-shadow: 0 14px 28px rgba(156, 24, 43, 0.25);
  transform: rotate(-4deg);
  animation: none;
}

.pc-ec-h,
.pc-ec-v {
  background: white;
  box-shadow: none;
}

.pc-ec-h {
  width: 30px;
  height: 7px;
  border-radius: 4px;
}

.pc-ec-v {
  width: 7px;
  height: 30px;
  border-radius: 4px;
}

.pc-orbit-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d4374b;
  box-shadow: 0 0 0 5px rgba(212, 55, 75, 0.09);
}

.pc-orbit-dot-a {
  top: 18px;
  right: 14px;
}

.pc-orbit-dot-b {
  bottom: 18px;
  left: 13px;
  width: 6px;
  height: 6px;
  background: #d8a55b;
}

.pc-empty-kicker {
  display: block;
  margin-bottom: 9px;
}

.pc-empty-title {
  max-width: 620px;
  margin-inline: auto;
  font-size: 26px;
  letter-spacing: -0.4px;
}

.pc-empty-desc {
  max-width: 580px;
  margin: 0 auto 24px;
  color: #7b7480;
  line-height: 1.8;
}

.pc-empty-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 28px;
  color: #7b7480;
  font-size: 13px;
}

.pc-empty-steps span {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #f0e5e6;
  border-radius: 10px;
  background: #fffaf4;
}

.pc-empty-steps b {
  color: #ef5654;
  font-size: 10px;
}

.pc-empty-steps i {
  width: 28px;
  height: 1px;
  background: #ead7da;
}

.pc-empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.pc-empty-btn {
  min-width: 190px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ef5654, #81021f);
  box-shadow: 0 10px 24px rgba(150, 27, 44, 0.22);
}

.pc-empty-btn::before {
  animation: none;
}

.pc-empty-btn span {
  display: inline-block;
  margin-left: 8px;
  transition: transform 0.2s ease;
}

.pc-empty-btn:hover span {
  transform: translateX(4px);
}

.pc-empty-secondary {
  padding: 13px 20px;
  border: 1px solid #eadde0;
  border-radius: 14px;
  background: white;
  color: #716877;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.pc-empty-secondary:hover {
  border-color: rgba(197, 34, 55, 0.35);
  background: #fff7ed;
  color: #b31d33;
}

/* 移动端主视觉 */
.m-page-header {
  gap: 0;
  padding: 22px 20px 17px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 26px;
  background:
    radial-gradient(circle at 92% 2%, rgba(255, 255, 255, 0.24), transparent 31%),
    radial-gradient(circle at -8% 108%, rgba(255, 181, 185, 0.2), transparent 35%),
    linear-gradient(135deg, #81021f 0%, #ef5654 56%, #d94855 100%);
  box-shadow: 0 18px 38px rgba(111, 16, 34, 0.23);
}

.m-page-header::before {
  top: -38px;
  right: -30px;
  width: 170px;
  height: 170px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  background: transparent;
}

.m-page-header::after {
  content: '';
  position: absolute;
  right: 80px;
  bottom: -42px;
  width: 104px;
  height: 104px;
  border: 26px solid rgba(255, 255, 255, 0.04);
  border-radius: 50%;
  pointer-events: none;
}

.m-hero-main {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}

.m-hero-copy {
  flex: 1;
  min-width: 0;
}

.m-page-tag {
  gap: 7px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.78);
  box-shadow: none;
  letter-spacing: 1px;
}

.m-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ffd6ae;
  box-shadow: 0 0 0 4px rgba(255, 214, 174, 0.12);
}

.m-page-title {
  margin-top: 8px;
  color: white;
  font-size: clamp(23px, 6.4vw, 29px);
  line-height: 1.22;
  letter-spacing: -0.7px;
  background: none;
  -webkit-text-fill-color: currentColor;
}

.m-page-desc {
  max-width: 260px;
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: clamp(11px, 2.9vw, 12.5px);
  line-height: 1.6;
}

.m-progress-orb {
  width: clamp(68px, 19vw, 78px);
  height: clamp(68px, 19vw, 78px);
  background: conic-gradient(#fff0da var(--journey-progress), rgba(255, 255, 255, 0.18) 0);
  box-shadow: 0 10px 22px rgba(74, 6, 18, 0.2);
}

.m-progress-orb::before {
  inset: 6px;
  background: rgba(157, 18, 39, 0.91);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.m-progress-orb > span {
  color: #fff7ee;
  font-size: clamp(17px, 4.6vw, 20px);
  letter-spacing: -0.7px;
}

.m-hero-meta {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 17px;
  padding-top: 13px;
  border-top: 1px solid rgba(255, 255, 255, 0.13);
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  letter-spacing: 0.2px;
}

.m-hero-meta strong {
  color: white;
  font-size: 13px;
}

.m-hero-meta i {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
}

/* 移动端空状态 */
.m-empty-state {
  position: relative;
  overflow: hidden;
  padding: 27px 19px 22px;
  border: 1px solid rgba(153, 43, 59, 0.09);
  border-radius: 25px;
  background:
    radial-gradient(circle at 50% 13%, rgba(197, 34, 55, 0.075), transparent 25%),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 42px rgba(37, 32, 42, 0.07);
}

.m-empty-state::before {
  content: '';
  position: absolute;
  top: -72px;
  right: -55px;
  width: 150px;
  height: 150px;
  border: 1px solid rgba(197, 34, 55, 0.07);
  border-radius: 50%;
}

.m-empty-visual {
  position: relative;
  width: 126px;
  height: 88px;
  margin: 0 auto 11px;
  display: grid;
  place-items: center;
}

.m-empty-visual::before {
  content: '';
  position: absolute;
  width: 116px;
  height: 66px;
  border: 1.5px dashed rgba(197, 34, 55, 0.18);
  border-radius: 50%;
  transform: rotate(-9deg);
}

.m-empty-icon {
  width: 68px;
  height: 68px;
  margin: 0;
  background: #fff1f1;
  box-shadow: inset 0 0 0 1px rgba(197, 34, 55, 0.06);
}

.m-empty-cross {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(145deg, #d63148, #98172a);
  opacity: 1;
  box-shadow: 0 12px 24px rgba(151, 22, 42, 0.24);
  transform: rotate(-4deg);
}

.m-ec-h,
.m-ec-v {
  background: white;
}

.m-ec-h {
  width: 27px;
  height: 7px;
  border-radius: 4px;
}

.m-ec-v {
  width: 7px;
  height: 27px;
  border-radius: 4px;
}

.m-empty-spark {
  position: absolute;
  border-radius: 50%;
}

.m-spark-a {
  top: 18px;
  right: 10px;
  width: 7px;
  height: 7px;
  background: #d33d50;
  box-shadow: 0 0 0 4px rgba(211, 61, 80, 0.08);
}

.m-spark-b {
  bottom: 16px;
  left: 9px;
  width: 5px;
  height: 5px;
  background: #d7a65b;
}

.m-empty-kicker {
  display: block;
  margin-bottom: 7px;
  color: #ad5965;
  font-size: 8.5px;
  letter-spacing: 1.2px;
}

.m-empty-title {
  margin-bottom: 8px;
  color: var(--journey-ink);
  font-size: clamp(18px, 4.9vw, 21px);
  letter-spacing: -0.3px;
}

.m-empty-desc {
  max-width: 310px;
  margin-bottom: 17px;
  color: #85808a;
  font-size: clamp(11.5px, 3vw, 13px);
  line-height: 1.75;
}

.m-empty-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
  margin-bottom: 18px;
}

.m-empty-step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid #f1e7e7;
  border-radius: 12px;
  background: #fffaf4;
  color: #746c76;
  font-size: 10px;
  font-weight: 600;
  text-align: left;
}

.m-empty-step b {
  color: var(--journey-red);
  font-size: 9px;
  letter-spacing: 0.5px;
}

.m-empty-actions {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.m-empty-btn {
  width: 100%;
  padding: 14px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ef5654, #81021f);
  box-shadow: 0 10px 22px rgba(150, 25, 43, 0.24);
}

.m-empty-btn span {
  display: inline-block;
  margin-left: 6px;
  transition: transform 0.2s ease;
}

.m-empty-btn:active span {
  transform: translateX(3px);
}

.m-empty-secondary {
  padding: 6px 8px;
  border: 0;
  background: transparent;
  color: #9b6670;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.m-empty-secondary:active {
  color: var(--journey-red);
}

/* 移动端记录列表 */
.m-checkin-list {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.m-list-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 3px 3px 0;
}

.m-list-heading h2 {
  margin-top: 2px;
  color: var(--journey-ink);
  font-size: 18px;
}

.m-list-kicker {
  color: #ad6771;
  font-size: 8.5px;
}

.m-list-count {
  padding: 5px 9px;
  border-radius: 999px;
  background: #fff1f1;
  color: #ad1e33;
  font-size: 10px;
  font-weight: 700;
}

.m-timeline-card {
  border: 1px solid rgba(139, 44, 59, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 9px 24px rgba(39, 33, 42, 0.06);
}

.m-card-location {
  color: var(--journey-ink);
}

@media (max-width: 360px) {
  .m-page-header {
    padding-inline: 16px;
  }

  .m-page-title {
    font-size: 21px;
  }

  .m-progress-orb {
    width: 62px;
    height: 62px;
  }

  .m-empty-step {
    padding-inline: 7px;
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .checkins *,
  .checkins *::before,
  .checkins *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
