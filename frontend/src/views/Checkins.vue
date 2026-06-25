<template>
  <div class="checkins">
    <!-- ========== PC 端模板 ========== -->
    <template v-if="!isMobile">
      <section class="pc-page-header">
        <div class="pc-header-content">
          <span class="pc-page-tag">📋 我的足迹</span>
          <h1 class="pc-page-title">个人打卡</h1>
          <p class="pc-page-desc">记录您探索红十字文化的每一步。</p>
        </div>
        <div class="pc-header-stats-card">
          <div class="pc-stats-number">{{ checkins.length }}</div>
          <div class="pc-stats-label">打卡记录</div>
        </div>
      </section>

      <div v-if="checkins.length === 0" class="pc-empty-state">
        <div class="pc-empty-icon">
          <div class="pc-empty-cross">
            <span class="pc-ec-h"></span>
            <span class="pc-ec-v"></span>
          </div>
        </div>
        <h2 class="pc-empty-title">还没有打卡记录</h2>
        <p class="pc-empty-desc">前往路线推荐页面，开始您的红十字文化之旅吧！</p>
        <button class="pc-empty-btn" @click="goToRoutes">🗺️ 前往路线推荐</button>
      </div>

      <section v-else class="pc-checkin-list">
        <div class="pc-list-header">
          <h3 class="pc-list-title">打卡记录</h3>
          <span class="pc-list-count">共 {{ checkins.length }} 条</span>
        </div>

        <div class="pc-timeline">
          <div
            v-for="(checkin, index) in checkins"
            :key="checkin.id"
            class="pc-timeline-item"
            @click="viewDetail(checkin.locationId)"
          >
            <div class="pc-timeline-left">
              <div class="pc-timeline-dot" :class="{ 'pc-first-dot': index === 0 }">
                {{ index + 1 }}
              </div>
              <div v-if="index < checkins.length - 1" class="pc-timeline-line"></div>
            </div>

            <div class="pc-timeline-card">
              <div class="pc-card-top">
                <h3 class="pc-card-location">{{ checkin.locationName }}</h3>
                <span class="pc-card-category">{{ checkin.category }}</span>
              </div>

              <div class="pc-card-info">
                <div class="pc-info-row">
                  <span class="pc-info-icon">📍</span>
                  <span class="pc-info-text">{{ checkin.location }}</span>
                </div>
                <div class="pc-info-row">
                  <span class="pc-info-icon">🕐</span>
                  <span class="pc-info-text">{{ checkin.checkinTime }}</span>
                </div>
              </div>

              <div v-if="checkin.note" class="pc-card-note">
                <span class="pc-note-label">我的备注</span>
                <p class="pc-note-content">{{ checkin.note }}</p>
              </div>

              <div class="pc-card-footer">
                <span class="pc-view-detail">查看详情 →</span>
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
        <span class="m-page-tag">📋 我的足迹</span>
        <h1 class="m-page-title">个人打卡</h1>
        <div class="m-header-stats-card">
          <div class="m-stats-number">{{ checkins.length }}</div>
          <div class="m-stats-label">打卡记录</div>
        </div>
      </section>

      <div v-if="checkins.length === 0" class="m-empty-state">
        <div class="m-empty-icon">
          <div class="m-empty-cross">
            <span class="m-ec-h"></span>
            <span class="m-ec-v"></span>
          </div>
        </div>
        <h2 class="m-empty-title">还没有打卡记录</h2>
        <p class="m-empty-desc">前往路线推荐页面，开始您的红十字文化之旅吧！</p>
        <button class="m-empty-btn" @click="goToRoutes">🗺️ 前往路线推荐</button>
      </div>

      <section v-else class="m-checkin-list">
        <div
          v-for="(checkin, index) in checkins"
          :key="checkin.id"
          class="m-timeline-item"
          @click="viewDetail(checkin.locationId)"
        >
          <div class="m-timeline-left">
            <div class="m-timeline-dot" :class="{ 'm-first-dot': index === 0 }">
              {{ index + 1 }}
            </div>
            <div v-if="index < checkins.length - 1" class="m-timeline-line"></div>
          </div>

          <div class="m-timeline-card">
            <div class="m-card-top">
              <h3 class="m-card-location">{{ checkin.locationName }}</h3>
              <span class="m-card-category">{{ checkin.category }}</span>
            </div>

            <div class="m-card-info">
              <div class="m-info-row">
                <span class="m-info-icon">📍</span>
                <span class="m-info-text">{{ checkin.location }}</span>
              </div>
              <div class="m-info-row">
                <span class="m-info-icon">🕐</span>
                <span class="m-info-text">{{ checkin.checkinTime }}</span>
              </div>
            </div>

            <div v-if="checkin.note" class="m-card-note">
              <p class="m-note-content">{{ checkin.note }}</p>
            </div>

            <div class="m-card-footer">
              <span class="m-view-detail">查看详情</span>
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
          <div class="confirm-icon">⚠️</div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckinStore } from '../stores/checkinStore'
import { useViewport } from '../composables/useViewport'

const { isMobile } = useViewport()

const router = useRouter()
const { checkins, removeCheckin } = useCheckinStore()

const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const goToRoutes = () => {
  router.push('/routes')
}

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
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
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
  border: 2px solid #d32f2f;
  color: #d32f2f;
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
  color: #1a2332;
  margin: 0 0 16px 0;
  font-weight: 800;
  position: relative;
  background: linear-gradient(135deg, #1a2332, #d32f2f, #1a2332);
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
  color: #5a6478;
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
  color: #d32f2f;
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
  background: #ff7043;
  border-radius: 50%;
  animation: pc-dotPulse 2s ease-in-out infinite;
}

@keyframes pc-dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

.pc-stats-label {
  font-size: 13px;
  color: #7a8599;
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
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
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
  background: #d32f2f;
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
  background: #d32f2f;
  opacity: 1;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
}

.pc-ec-h { width: 38px; height: 10px; }
.pc-ec-v { width: 10px; height: 38px; }

.pc-empty-title {
  font-size: 24px;
  color: #1a2332;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.pc-empty-desc {
  font-size: 15px;
  color: #5a6478;
  margin: 0 0 28px 0;
}

.pc-empty-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
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
  border-bottom: 2px solid #f0f2f5;
  position: relative;
}

.pc-list-header::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 80px;
  background: linear-gradient(90deg, #d32f2f, #ff7043);
  border-radius: 2px;
  animation: pc-lineSweep 2s ease-out;
}

@keyframes pc-lineSweep {
  from { width: 0; }
  to { width: 80px; }
}

.pc-list-title {
  font-size: 20px;
  color: #1a2332;
  margin: 0;
  font-weight: 700;
}

.pc-list-count {
  font-size: 13px;
  color: #7a8599;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(255, 112, 67, 0.1));
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  color: #d32f2f;
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
  border-color: #d32f2f;
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
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
  background: #f0f2f5;
  color: #7a8599;
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
  background: linear-gradient(135deg, #d32f2f, #ff7043);
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
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
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
  background: linear-gradient(180deg, transparent, #d32f2f, transparent);
  animation: pc-lineFlow 2.5s ease-in-out infinite;
}

@keyframes pc-lineFlow {
  0% { top: -50%; }
  100% { top: 100%; }
}

.pc-timeline-card {
  flex: 1;
  background: #fafbfc;
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
  color: #1a2332;
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-timeline-item:hover .pc-card-location {
  color: #d32f2f;
}

.pc-card-category {
  font-size: 11px;
  color: white;
  background: linear-gradient(135deg, #d32f2f, #ff7043);
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
  color: #7a8599;
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
  color: #d32f2f;
  font-weight: 600;
  transition: transform 0.3s ease;
  position: relative;
}

.pc-timeline-item:hover .pc-view-detail {
  transform: translateX(6px);
}

.pc-view-detail::after {
  content: ' →';
  display: inline-block;
  transition: transform 0.3s ease;
}

.pc-timeline-item:hover .pc-view-detail::after {
  transform: translateX(3px);
}

.pc-delete-btn {
  background: transparent;
  border: 1px solid #e5e9ef;
  color: #7a8599;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pc-delete-btn:hover {
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
  color: #d32f2f;
  border-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.15);
}

/* ==============================
   ======= 移动端样式组 =======
   ============================== */

/* ========== 移动端页面头部 ========== */
.m-page-header {
  background: linear-gradient(160deg, #fff5f5 0%, #ffeaea 40%, #fff0f3 100%);
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
  color: #d32f2f;
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
  color: #1a2332;
  margin: 0;
  font-weight: 800;
  position: relative;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.25;
  background: linear-gradient(135deg, #1a2332 30%, #d32f2f 70%, #c62828);
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
  color: #d32f2f;
  line-height: 1;
  position: relative;
}

.m-stats-label {
  font-size: clamp(11px, 2.8vw, 13px);
  color: #8a95a8;
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
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.m-empty-cross {
  width: clamp(40px, 11vw, 56px);
  height: clamp(40px, 11vw, 56px);
  background: #d32f2f;
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
  background: #d32f2f;
  opacity: 1;
}

.m-ec-h { width: 60%; height: 18%; }
.m-ec-v { width: 18%; height: 60%; }

.m-empty-title {
  font-size: clamp(16px, 4.5vw, 20px);
  color: #1a2332;
  margin: 0 0 clamp(8px, 2vw, 12px) 0;
  font-weight: 700;
  word-break: break-word;
  overflow-wrap: break-word;
}

.m-empty-desc {
  font-size: clamp(12px, 3vw, 14px);
  color: #8a95a8;
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
  background: linear-gradient(135deg, #d32f2f, #c62828);
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
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
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
  background: #f0f2f5;
  color: #7a8599;
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
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
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
  background: #ffffff;
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
  color: #1a2332;
  margin: 0;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: break-word;
  flex: 1;
}

.m-card-category {
  font-size: clamp(10px, 2.4vw, 11px);
  color: white;
  background: linear-gradient(135deg, #d32f2f, #e53935);
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
  color: #8a95a8;
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
  color: #d32f2f;
  font-weight: 700;
  flex: 1;
  word-break: break-word;
}

.m-delete-btn {
  background: transparent;
  border: 1.5px solid rgba(211, 47, 47, 0.12);
  color: #8a95a8;
  padding: clamp(5px, 1.3vw, 7px) clamp(10px, 2.5vw, 14px);
  border-radius: 10px;
  font-size: clamp(11px, 2.6vw, 12px);
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.m-delete-btn:active {
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
  color: #d32f2f;
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
  color: #1a2332;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.confirm-desc {
  font-size: 14px;
  color: #5a6478;
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
  background: #f0f2f5;
  color: #5a6478;
}

.confirm-btn.cancel:hover {
  background: #e5e9ef;
}

.confirm-btn.danger {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
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
</style>
