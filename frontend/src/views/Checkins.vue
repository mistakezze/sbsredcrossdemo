<template>
  <div class="checkins">
    <section class="page-header">
      <div class="header-content">
        <span class="page-tag">📋 我的足迹</span>
        <h1 class="page-title">个人打卡</h1>
        <p class="page-desc">记录您探索红十字文化的每一步。</p>
      </div>
      <div class="header-stats-card">
        <div class="stats-number">{{ checkins.length }}</div>
        <div class="stats-label">打卡记录</div>
      </div>
    </section>

    <div v-if="checkins.length === 0" class="empty-state">
      <div class="empty-icon">
        <div class="empty-cross">
          <span class="ec-h"></span>
          <span class="ec-v"></span>
        </div>
      </div>
      <h2 class="empty-title">还没有打卡记录</h2>
      <p class="empty-desc">前往路线推荐页面，开始您的红十字文化之旅吧！</p>
      <button class="empty-btn" @click="goToRoutes">🗺️ 前往路线推荐</button>
    </div>

    <section v-else class="checkin-list">
      <div class="list-header">
        <h3 class="list-title">打卡记录</h3>
        <span class="list-count">共 {{ checkins.length }} 条</span>
      </div>

      <div class="timeline">
        <div
          v-for="(checkin, index) in checkins"
          :key="checkin.id"
          class="timeline-item"
          @click="viewDetail(checkin.locationId)"
        >
          <div class="timeline-left">
            <div class="timeline-dot" :class="{ 'first-dot': index === 0 }">
              {{ index + 1 }}
            </div>
            <div v-if="index < checkins.length - 1" class="timeline-line"></div>
          </div>

          <div class="timeline-card">
            <div class="card-top">
              <h3 class="card-location">{{ checkin.locationName }}</h3>
              <span class="card-category">{{ checkin.category }}</span>
            </div>

            <div class="card-info">
              <div class="info-row">
                <span class="info-icon">📍</span>
                <span class="info-text">{{ checkin.location }}</span>
              </div>
              <div class="info-row">
                <span class="info-icon">🕐</span>
                <span class="info-text">{{ checkin.checkinTime }}</span>
              </div>
            </div>

            <div v-if="checkin.note" class="card-note">
              <span class="note-label">我的备注</span>
              <p class="note-content">{{ checkin.note }}</p>
            </div>

            <div class="card-footer">
              <span class="view-detail">查看详情 →</span>
              <button class="delete-btn" @click.stop="handleDelete(checkin)">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <transition name="fade">
      <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="showDeleteConfirm = false">
        <div class="confirm-box">
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
.checkins { display: flex; flex-direction: column; }

/* ==============================
   页面头部 - 光效与浮动动画
   ============================== */
.page-header {
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
  animation: headerFadeIn 0.8s ease-out;
}

@keyframes headerFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.15), transparent 70%);
  animation: bgPulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes bgPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
}

.page-tag {
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
  animation: tagFloat 3s ease-in-out infinite;
}

@keyframes tagFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.page-title {
  font-size: 40px;
  color: #1a2332;
  margin: 0 0 16px 0;
  font-weight: 800;
  position: relative;
  background: linear-gradient(135deg, #1a2332, #d32f2f, #1a2332);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 5s ease-in-out infinite;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.25;
}

@keyframes titleShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.page-desc {
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

.header-stats-card {
  background: white;
  border-radius: 20px;
  padding: 28px 36px;
  box-shadow: 0 8px 32px rgba(211, 47, 47, 0.15);
  text-align: center;
  min-width: 160px;
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: statsSlideIn 0.8s ease-out 0.3s backwards;
}

@keyframes statsSlideIn {
  from { opacity: 0; transform: translateX(30px) scale(0.9); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

.header-stats-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 16px 40px rgba(211, 47, 47, 0.25);
}

.header-stats-card .stats-number {
  font-size: 48px;
  font-weight: 800;
  color: #d32f2f;
  line-height: 1;
  position: relative;
  text-shadow: 0 2px 12px rgba(211, 47, 47, 0.2);
}

.header-stats-card .stats-number::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: -12px;
  width: 10px;
  height: 10px;
  background: #ff7043;
  border-radius: 50%;
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

.header-stats-card .stats-label {
  font-size: 13px;
  color: #7a8599;
  margin-top: 10px;
  letter-spacing: 0.5px;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.06);
  position: relative;
  overflow: hidden;
  animation: emptyFadeIn 0.8s ease-out;
}

@keyframes emptyFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-icon {
  width: 140px;
  height: 140px;
  margin: 0 auto 28px;
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: iconFloat 4s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-icon::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.15), transparent 70%);
  animation: emptyGlow 3s ease-in-out infinite;
}

@keyframes emptyGlow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.empty-cross {
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
  animation: crossRotate 6s ease-in-out infinite;
}

@keyframes crossRotate {
  0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.25; }
  50% { transform: rotate(15deg) scale(1.08); opacity: 0.4; }
}

.ec-h, .ec-v {
  position: absolute;
  background: #d32f2f;
  opacity: 1;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
}

.ec-h { width: 38px; height: 10px; }
.ec-v { width: 10px; height: 38px; }

.empty-title {
  font-size: 24px;
  color: #1a2332;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.empty-desc {
  font-size: 15px;
  color: #5a6478;
  margin: 0 0 28px 0;
}

.empty-btn {
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

.empty-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btnShine 3s ease-in-out infinite;
}

@keyframes btnShine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.empty-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.45);
}

/* ==============================
   打卡列表与时间轴动画
   ============================== */
.checkin-list {
  background: white;
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.06);
  margin-bottom: 40px;
  animation: listFadeIn 0.8s ease-out;
}

@keyframes listFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
  position: relative;
}

.list-header::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 80px;
  background: linear-gradient(90deg, #d32f2f, #ff7043);
  border-radius: 2px;
  animation: lineSweep 2s ease-out;
}

@keyframes lineSweep {
  from { width: 0; }
  to { width: 80px; }
}

.list-title {
  font-size: 20px;
  color: #1a2332;
  margin: 0;
  font-weight: 700;
}

.list-count {
  font-size: 13px;
  color: #7a8599;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(255, 112, 67, 0.1));
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 600;
  color: #d32f2f;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 20px;
  cursor: pointer;
  position: relative;
  animation: timelineSlideIn 0.6s ease-out backwards;
}

.timeline-item:nth-child(1) { animation-delay: 0.1s; }
.timeline-item:nth-child(2) { animation-delay: 0.2s; }
.timeline-item:nth-child(3) { animation-delay: 0.3s; }
.timeline-item:nth-child(4) { animation-delay: 0.4s; }
.timeline-item:nth-child(5) { animation-delay: 0.5s; }
.timeline-item:nth-child(6) { animation-delay: 0.6s; }
.timeline-item:nth-child(7) { animation-delay: 0.7s; }
.timeline-item:nth-child(8) { animation-delay: 0.8s; }

@keyframes timelineSlideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.timeline-item:hover .timeline-card {
  transform: translateX(8px);
  box-shadow: 0 10px 32px rgba(211, 47, 47, 0.18);
  border-color: #d32f2f;
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 40px;
  position: relative;
}

.timeline-dot {
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

.timeline-dot::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid rgba(211, 47, 47, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-item:hover .timeline-dot {
  background: linear-gradient(135deg, #d32f2f, #ff7043);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.4);
}

.timeline-item:hover .timeline-dot::after {
  opacity: 1;
  animation: ringPulse 1.5s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.2; }
}

.timeline-dot.first-dot {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.35);
  animation: firstDotPulse 3s ease-in-out infinite;
}

@keyframes firstDotPulse {
  0%, 100% { box-shadow: 0 6px 16px rgba(211, 47, 47, 0.35); }
  50% { box-shadow: 0 8px 24px rgba(211, 47, 47, 0.55); }
}

.timeline-line {
  width: 3px;
  flex: 1;
  min-height: 30px;
  background: linear-gradient(180deg, rgba(211, 47, 47, 0.4) 0%, rgba(211, 47, 47, 0.15) 100%);
  position: relative;
  overflow: hidden;
}

.timeline-line::after {
  content: '';
  position: absolute;
  top: -50%;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, transparent, #d32f2f, transparent);
  animation: lineFlow 2.5s ease-in-out infinite;
}

@keyframes lineFlow {
  0% { top: -50%; }
  100% { top: 100%; }
}

.timeline-card {
  flex: 1;
  background: #fafbfc;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 16px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.card-location {
  font-size: 17px;
  color: #1a2332;
  margin: 0;
  font-weight: 700;
  line-height: 1.4;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
}

.timeline-item:hover .card-location {
  color: #d32f2f;
}

.card-category {
  font-size: 11px;
  color: white;
  background: linear-gradient(135deg, #d32f2f, #ff7043);
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
}

.card-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 14px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #7a8599;
  word-break: break-word;
  overflow-wrap: break-word;
}

.card-note {
  background: linear-gradient(135deg, #fff8e1, #ffe9d9);
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 14px;
  border-left: 3px solid #ff9800;
  position: relative;
  overflow: hidden;
}

.card-note::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: noteShine 4s ease-in-out infinite;
}

@keyframes noteShine {
  0% { left: -100%; }
  50%, 100% { left: 150%; }
}

.note-label {
  font-size: 11px;
  color: #8a6d00;
  font-weight: 700;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}

.note-content {
  font-size: 14px;
  color: #5d4e00;
  line-height: 1.7;
  margin: 0;
  position: relative;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e8ecf3;
}

.view-detail {
  font-size: 13px;
  color: #d32f2f;
  font-weight: 600;
  transition: transform 0.3s ease;
  position: relative;
}

.timeline-item:hover .view-detail {
  transform: translateX(6px);
}

.view-detail::after {
  content: ' →';
  display: inline-block;
  transition: transform 0.3s ease;
}

.timeline-item:hover .view-detail::after {
  transform: translateX(3px);
}

.delete-btn {
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

.delete-btn:hover {
  background: linear-gradient(135deg, #fff5f5, #ffeaea);
  color: #d32f2f;
  border-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.15);
}

/* Confirm Modal */
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

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .page-header {
    padding: 36px 24px;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
  .page-title { font-size: 28px; line-height: 1.3; }
  .page-desc { font-size: 14px; max-width: 100%; }
  .checkin-list { padding: 24px 20px; }
  .timeline-card { padding: 16px; }
  .card-top { flex-direction: column; align-items: flex-start; gap: 10px; }
  .card-info { flex-direction: column; gap: 8px; }
  .card-footer { flex-direction: column; gap: 12px; align-items: stretch; padding-top: 10px; }
  .delete-btn { width: 100%; padding: 10px; }
  .timeline-dot { width: 34px; height: 34px; font-size: 13px; }
  .timeline-left { width: 34px; flex-shrink: 0; }
  .card-location { font-size: 16px; }
  .note-content { font-size: 13px; line-height: 1.7; }
  .card-category { font-size: 11px; padding: 3px 10px; }
  .view-detail { width: 100%; text-align: center; padding: 10px; background: rgba(211, 47, 47, 0.08); border-radius: 8px; }
}

@media (max-width: 480px) {
  .page-title { font-size: 24px; }
  .page-stats-card { padding: 16px 20px; }
  .stats-number { font-size: 32px; }
  .timeline-item { gap: 12px; }
  .timeline-card { padding: 14px 12px; }
  .card-location { font-size: 15px; }
  .info-row { font-size: 12px; }
  .note-content { font-size: 12.5px; line-height: 1.7; }
  .card-note { padding: 12px 14px; margin-bottom: 12px; }
  .confirm-box { padding: 28px 24px; }
  .confirm-actions { flex-direction: column; }
  .confirm-btn { width: 100%; text-align: center; }
}

@media (max-width: 375px) {
  .page-header { padding: 28px 16px; }
  .checkin-list { padding: 20px 14px; }
  .timeline-left { width: 30px; flex-shrink: 0; }
  .timeline-dot { width: 30px; height: 30px; font-size: 12px; }
  .timeline-card { padding: 12px 12px; }
  .card-footer { padding-top: 10px; }
  .card-location { font-size: 14.5px; }
  .page-title { font-size: 22px; }
  .page-desc { font-size: 13.5px; }
}
</style>
