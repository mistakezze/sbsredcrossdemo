<template>
  <div class="checkin-detail">
    <button class="back-btn" @click="goBack">
      ← 返回打卡列表
    </button>

    <div v-if="!checkin" class="not-found">
      <div class="nf-icon">❌</div>
      <h2>未找到该打卡记录</h2>
      <p>该地点可能尚未打卡或记录已被删除。</p>
      <button class="nf-btn" @click="goBack">返回</button>
    </div>

    <div v-else class="detail-content">
      <section class="hero-section" :style="{ '--accent-color': location?.color || '#d32f2f' }">
        <div class="hero-content">
          <span class="hero-category">{{ checkin.category }}</span>
          <h1 class="hero-title">{{ checkin.locationName }}</h1>
          <div class="hero-place">📍 {{ checkin.location }}</div>
          <div class="hero-checkin-time">
            <span class="checkin-badge">✓ 已打卡</span>
            <span class="checkin-date">{{ checkin.checkinTime }}</span>
          </div>
        </div>
      </section>

      <section v-if="location" class="info-section">
        <h2 class="section-title">📖 地点介绍</h2>
        <p class="section-text">{{ location.description }}</p>
      </section>

      <section v-if="location" class="info-section">
        <h2 class="section-title">📜 历史背景</h2>
        <p class="section-text">{{ location.history }}</p>
      </section>

      <section v-if="location" class="info-section">
        <h2 class="section-title">✨ 推荐看点</h2>
        <ul class="highlights">
          <li v-for="(h, i) in location.highlights" :key="i">
            <span class="highlight-marker">{{ i + 1 }}</span>
            <span class="highlight-text">{{ h }}</span>
          </li>
        </ul>
      </section>

      <section class="note-section">
        <div class="note-header">
          <h2 class="section-title">✍️ 我的备注</h2>
          <button
            v-if="!isEditing"
            class="edit-btn"
            @click="startEdit"
          >
            编辑
          </button>
        </div>

        <div v-if="!isEditing" class="note-display">
          <p v-if="checkin.note" class="note-text">{{ checkin.note }}</p>
          <p v-else class="note-empty">暂无备注，点击「编辑」添加您的感受。</p>
        </div>

        <div v-else class="note-editor">
          <textarea
            v-model="editNote"
            class="note-input"
            rows="4"
            placeholder="记录您的感受或参观体验..."
          ></textarea>
          <div class="note-actions">
            <button class="note-btn cancel" @click="cancelEdit">取消</button>
            <button class="note-btn save" @click="saveNote">保存</button>
          </div>
        </div>
      </section>

      <section class="info-section">
        <h2 class="section-title">📋 打卡信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">地点名称</span>
            <span class="info-value">{{ checkin.locationName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所在位置</span>
            <span class="info-value">{{ checkin.location }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">打卡时间</span>
            <span class="info-value">{{ checkin.checkinTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">记录 ID</span>
            <span class="info-value">#{{ checkin.id }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCheckinStore } from '../stores/checkinStore'
import { useLocationStore } from '../stores/locationStore'

const route = useRoute()
const router = useRouter()

const { checkins, getCheckinById, updateNote } = useCheckinStore()
const { locations } = useLocationStore()

const isEditing = ref(false)
const editNote = ref('')

const checkin = computed(() => {
  const id = route.params.id
  return getCheckinById(id)
})

const location = computed(() => {
  if (!checkin.value) return null
  return locations.value.find(l => l.id === Number(checkin.value.locationId))
})

const goBack = () => {
  router.push('/checkins')
}

const startEdit = () => {
  editNote.value = checkin.value?.note || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editNote.value = ''
}

const saveNote = () => {
  if (checkin.value) {
    updateNote(checkin.value.id, editNote.value.trim())
  }
  isEditing.value = false
}
</script>

<style scoped>
.checkin-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  animation: pageFadeIn 0.6s ease-out;
}

@keyframes pageFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.back-btn {
  background: white;
  border: 2px solid #e5e9ef;
  color: #5a6478;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.back-btn:hover {
  border-color: #d32f2f;
  color: #d32f2f;
  background: #fff5f5;
  transform: translateX(-4px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.1);
}

.not-found {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.06);
}

.nf-icon {
  font-size: 64px;
  margin-bottom: 20px;
  display: inline-block;
  animation: iconShake 2s ease-in-out infinite;
}

@keyframes iconShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.not-found h2 {
  font-size: 22px;
  color: #1a2332;
  margin: 0 0 12px 0;
}

.not-found p {
  font-size: 14px;
  color: #5a6478;
  margin: 0 0 28px 0;
}

.nf-btn {
  padding: 12px 28px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  position: relative;
  overflow: hidden;
}

.nf-btn::before {
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

.nf-btn:hover {
  background: #b71c1c;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(211, 47, 47, 0.4);
}

/* ==============================
   Hero 区块 - 渐变光效动画
   ============================== */
.hero-section {
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
  border-radius: 24px;
  padding: 48px;
  margin-bottom: 32px;
  border-left: 8px solid var(--accent-color);
  position: relative;
  overflow: hidden;
  animation: heroFadeIn 0.8s ease-out;
}

@keyframes heroFadeIn {
  from { opacity: 0; transform: translateY(-15px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.12), transparent 70%);
  animation: bgPulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes bgPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}

.hero-category {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--accent-color), #ff7043);
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.25);
  animation: badgeFloat 3s ease-in-out infinite;
}

@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.hero-title {
  font-size: 36px;
  color: #1a2332;
  margin: 0 0 16px 0;
  font-weight: 800;
  line-height: 1.3;
  position: relative;
  background: linear-gradient(135deg, #1a2332, var(--accent-color), #1a2332);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 5s ease-in-out infinite;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

@keyframes titleShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-place {
  font-size: 16px;
  color: #5a6478;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  word-break: break-word;
  overflow-wrap: break-word;
}

.hero-checkin-time {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.checkin-badge {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  position: relative;
  overflow: hidden;
}

.checkin-badge::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 8px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 8px white;
  animation: checkinPulse 1.5s ease-in-out infinite;
}

.checkin-badge span {
  padding-left: 12px;
}

@keyframes checkinPulse {
  0%, 100% { transform: translateY(-50%) scale(1); opacity: 1; }
  50% { transform: translateY(-50%) scale(1.3); opacity: 0.7; }
}

.checkin-date {
  font-size: 14px;
  color: #7a8599;
  font-weight: 500;
}

/* ==============================
   Info 区块 - 入场与悬浮光效
   ============================== */
.info-section {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.06);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: sectionFadeIn 0.8s ease-out backwards;
}

.info-section:nth-of-type(1) { animation-delay: 0.1s; }
.info-section:nth-of-type(2) { animation-delay: 0.2s; }
.info-section:nth-of-type(3) { animation-delay: 0.3s; }
.info-section:nth-of-type(4) { animation-delay: 0.4s; }

@keyframes sectionFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(26, 35, 50, 0.1);
}

.info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-color, #d32f2f), transparent);
  opacity: 0.4;
  animation: topLineSweep 2s ease-out;
}

@keyframes topLineSweep {
  from { width: 0; opacity: 0; }
  to { width: 120px; opacity: 0.4; }
}

.section-title {
  font-size: clamp(12px, 2vw, 18px);
  color: #1a2332;
  margin: 0 0 16px 0;
  font-weight: 700;
  position: relative;
  display: inline-block;
  word-break: break-word;
  overflow-wrap: break-word;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-color, #d32f2f), #ff7043);
  border-radius: 2px;
}

.section-text {
  font-size: 15px;
  color: #5a6478;
  line-height: 1.9;
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.highlights {
  list-style: none;
  padding: 0;
  margin: 0;
}

.highlights li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s ease;
  position: relative;
}

.highlights li:last-child {
  border-bottom: none;
}

.highlights li:hover {
  transform: translateX(6px);
}

.highlight-marker {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-color, #d32f2f), #ff7043);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.25);
  transition: all 0.3s ease;
}

.highlights li:hover .highlight-marker {
  transform: scale(1.15) rotate(15deg);
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.4);
}

.highlight-text {
  font-size: clamp(12px, 2vw, 15px);
  color: #5a6478;
  line-height: 1.7;
  padding-top: 3px;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* ==============================
   Note 备注区块 - 金色流光
   ============================== */
.note-section {
  background: linear-gradient(135deg, #fff8e1, #ffe9d9);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  border-left: 6px solid #ff9800;
  position: relative;
  overflow: hidden;
  animation: sectionFadeIn 0.8s ease-out 0.25s backwards;
}

.note-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
  animation: noteShine 4s ease-in-out infinite;
}

@keyframes noteShine {
  0% { left: -100%; }
  50%, 100% { left: 150%; }
}

.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.edit-btn {
  background: white;
  border: 2px solid #ff9800;
  color: #ff9800;
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15);
}

.edit-btn:hover {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.35);
}

.note-display {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 20px 22px;
  position: relative;
  z-index: 1;
}

.note-text {
  font-size: clamp(12px, 2vw, 15px);
  color: #5d4e00;
  line-height: 1.8;
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.note-empty {
  font-size: 14px;
  color: #8a6d00;
  font-style: italic;
  margin: 0;
}

.note-editor {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  padding: 16px;
  position: relative;
  z-index: 1;
}

.note-input {
  width: 100%;
  border: 2px solid #ffcc80;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  color: #1a2332;
  font-family: inherit;
  resize: vertical;
  background: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  line-height: 1.7;
  margin-bottom: 12px;
}

.note-input:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.15);
}

.note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.note-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-btn.cancel {
  background: white;
  color: #7a8599;
  border: 2px solid #e5e9ef;
}

.note-btn.cancel:hover {
  background: #f5f5f5;
  border-color: #ccc;
  transform: translateY(-1px);
}

.note-btn.save {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.note-btn.save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 152, 0, 0.4);
}

/* ==============================
   打卡信息网格 - 卡片悬浮
   ============================== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  position: relative;
  z-index: 1;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fafbfc, #f5f7fa);
  border-radius: 14px;
  border: 2px solid transparent;
  transition: all 0.35s ease;
}

.info-item:hover {
  border-color: var(--accent-color, #d32f2f);
  background: linear-gradient(135deg, #fff8f8, #ffffff);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.12);
}

.info-item .info-label {
  font-size: 11px;
  color: #7a8599;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.info-item .info-value {
  font-size: 15px;
  color: #1a2332;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: break-word;
}

@media (max-width: 768px) {
  .hero-section { padding: 32px 20px; }
  .hero-title { font-size: 26px; line-height: 1.3; }
  .hero-place { font-size: 14px; margin-bottom: 16px; }
  .hero-checkin-time { gap: 10px; }
  .info-section { padding: 22px 18px; }
  .note-section { padding: 22px 18px; }
  .info-grid { grid-template-columns: 1fr; gap: 12px; }
  .note-actions { flex-direction: column; gap: 10px; }
  .note-btn { width: 100%; text-align: center; padding: 12px; }
  .section-text { font-size: 14px; line-height: 1.8; }
  .highlight-text { font-size: 14px; line-height: 1.7; }
  .note-text { font-size: 14px; line-height: 1.75; }
  .checkin-date { font-size: 13px; }
}

@media (max-width: 480px) {
  .hero-section { padding: 24px 16px; border-radius: 16px; }
  .hero-title { font-size: 22px; }
  .hero-category { font-size: 11px; padding: 6px 14px; }
  .hero-place { font-size: 14px; }
  .checkin-badge { font-size: 11px; padding: 6px 14px; }
  .checkin-date { font-size: 13px; }
  .back-btn { padding: 8px 16px; font-size: 13px; margin-bottom: 18px; }
  .info-section { padding: 18px 16px; }
  .note-section { padding: 18px 16px; }
  .section-title { font-size: 16px; }
  .section-text { font-size: 14px; line-height: 1.75; }
  .highlight-text { font-size: 13.5px; }
  .highlight-marker { width: 28px; height: 28px; font-size: 11px; }
  .info-value { font-size: 14px; }
  .info-item { padding: 14px 16px; }
  .note-input { font-size: 14px; min-height: 80px; }
  .note-text { font-size: 13.5px; line-height: 1.75; }
}

@media (max-width: 375px) {
  .hero-section { padding: 20px 14px; }
  .hero-title { font-size: 20px; }
  .info-item { padding: 14px 14px; }
  .info-value { font-size: 14px; }
  .info-label { font-size: 10px; letter-spacing: 1px; }
  .section-text { font-size: 13.5px; }
  .note-text { font-size: 13px; }
}

</style>
