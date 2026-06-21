<template>
  <div class="routes-page">
    <!-- ==============================
         PC 端模板
         ============================== -->
    <template v-if="!isMobile">
      <!-- 页面头部 -->
      <div class="pc-page-header">
        <div class="pc-page-badge">路线推荐</div>
        <h1 class="pc-page-title">上海红十字地点游览路线</h1>
        <p class="pc-page-subtitle">从博物馆到救灾中心，从医疗机构到国际代表处，循着先驱者的足迹，探索上海这座红十字之城。</p>
      </div>

      <!-- Tab 切换 -->
      <div class="pc-tabs-wrap">
        <div class="pc-tabs">
          <button
            class="pc-tab-btn"
            :class="{ active: currentTab === 'fixed' }"
            @click="switchTab('fixed')"
          >
            <span class="pc-tab-icon">📋</span>
            <span class="pc-tab-text">固定路线推荐</span>
          </button>
          <button
            class="pc-tab-btn"
            :class="{ active: currentTab === 'ai' }"
            @click="switchTab('ai')"
          >
            <span class="pc-tab-icon">✨</span>
            <span class="pc-tab-text">AI 智能推荐</span>
          </button>
        </div>
      </div>

      <!-- Tab 1：固定路线推荐 -->
      <div v-if="currentTab === 'fixed'" class="pc-tab-content">
        <div class="pc-locations-list">
          <div
            v-for="(loc, index) in sortedLocations"
            :key="loc.id"
            class="pc-loc-card"
            :class="{ 'pc-loc-checked': hasCheckedIn(loc.id) }"
            @click="openModal(loc)"
          >
            <div class="pc-loc-number">{{ index + 1 }}</div>
            <div class="pc-loc-icon">
              <div class="pc-cross-outer">
                <div class="pc-cross-h"></div>
                <div class="pc-cross-v"></div>
              </div>
            </div>
            <div class="pc-loc-info">
              <h3 class="pc-loc-name">{{ loc.name }}</h3>
              <div class="pc-loc-meta">{{ loc.location }} · {{ loc.category }}</div>
              <p class="pc-loc-desc">{{ loc.description }}</p>
              <div class="pc-loc-tags">
                <span v-for="tag in loc.highlights" :key="tag" class="pc-loc-tag">{{ tag }}</span>
              </div>
            </div>
            <div class="pc-loc-status">
              <span v-if="hasCheckedIn(loc.id)" class="pc-status-done">✓ 已打卡</span>
              <span v-else class="pc-status-todo">点击打卡 →</span>
            </div>
          </div>
        </div>

        <!-- 路线说明 -->
        <div class="pc-route-info">
          <div class="pc-info-title">📋 推荐游览顺序</div>
          <div class="pc-info-steps">
            <div
              v-for="(loc, index) in sortedLocations"
              :key="loc.id"
              class="pc-step-item"
              :class="{ 'pc-step-checked': hasCheckedIn(loc.id) }"
              @click="openModal(loc)"
            >
              <div class="pc-step-number" :style="{ background: hasCheckedIn(loc.id) ? '#4caf50' : '#d32f2f' }">{{ index + 1 }}</div>
              <div class="pc-step-content">
                <div class="pc-step-name">{{ loc.name }}</div>
                <div class="pc-step-place">{{ loc.location }} · {{ loc.category }}</div>
              </div>
              <div class="pc-step-status">{{ hasCheckedIn(loc.id) ? '✓ 已打卡' : '点击打卡' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2：AI 智能推荐 -->
      <div v-if="currentTab === 'ai'" class="pc-tab-content">
        <!-- 预设问题区域 -->
        <div class="pc-ai-card pc-ai-question-card">
          <div class="pc-ai-card-header">
            <div class="pc-ai-icon">🤖</div>
            <div class="pc-ai-header-text">
              <h3 class="pc-ai-title">选择你感兴趣的方向</h3>
              <p class="pc-ai-subtitle">从下方预设问题中选一个，AI 将为你智能生成个性化游览路线</p>
            </div>
          </div>

          <div class="pc-preset-questions">
            <div
              v-for="(q, idx) in presetQuestions"
              :key="idx"
              class="pc-preset-item"
              :class="{ selected: selectedQuestion === q.label, loading: aiLoading && selectedQuestion === q.label }"
              @click="selectAndAsk(q)"
            >
              <span class="pc-preset-emoji">{{ q.emoji }}</span>
              <span class="pc-preset-label">{{ q.label }}</span>
              <span v-if="aiLoading && selectedQuestion === q.label" class="pc-preset-spinner"></span>
            </div>
          </div>

          <!-- 自定义提问区 -->
          <div class="pc-custom-ask">
            <div class="pc-custom-ask-label">
              <span class="pc-ask-emoji">💬</span>
              <span>或直接描述您的需求，AI 将为您量身规划</span>
            </div>
            <div class="pc-custom-ask-input">
              <textarea
                v-model="customQuestion"
                class="pc-ask-textarea"
                rows="2"
                placeholder="例如：我上午 9 点从虹桥火车站出发，想在下午 3 点前游览 3 个最有故事感的红十字地点，帮忙安排路线和交通"
                @keydown.enter.ctrl="submitCustom"
              ></textarea>
              <button
                class="pc-btn-ask-submit"
                :disabled="aiLoading || !customQuestion.trim()"
                @click="submitCustom"
              >
                <span v-if="aiLoading && isCustomAsk" class="pc-submit-spinner"></span>
                <span v-else class="pc-submit-arrow">➤</span>
                <span class="pc-submit-text">{{ aiLoading && isCustomAsk ? '生成中...' : '生成路线' }}</span>
              </button>
            </div>
            <div class="pc-custom-ask-tip">
              小提示：Ctrl + Enter 快捷提交 · 可告诉 AI 您的起点、时间、兴趣偏好等
            </div>
          </div>
        </div>

        <!-- AI 回答结果区域 -->
        <div v-if="aiAnswer" class="pc-ai-card pc-ai-result-card">
          <div class="pc-ai-result-header">
            <span class="pc-result-badge">✨ AI 推荐路线</span>
            <button class="pc-btn-refresh" @click="clearAnswer">清空重新生成</button>
          </div>

          <div class="pc-ai-result-question">
            <span class="pc-q-label">您的问题：</span>
            <span class="pc-q-text">{{ aiAnswer.question }}</span>
          </div>

          <div class="pc-ai-disclaimer">
            <span class="pc-disclaimer-icon">⚠️</span>
            <span class="pc-disclaimer-text">路线中的交通方式由 AI 基于地点所在行政区推断生成，仅作游览参考。实际出行请以地图导航（高德/百度地图）提供的实时线路为准。</span>
          </div>

          <div v-if="aiAnswer.steps && aiAnswer.steps.length > 0" class="pc-ai-steps">
            <div
              v-for="(step, idx) in aiAnswer.steps"
              :key="idx"
              class="pc-ai-step-item"
            >
              <div class="pc-ai-step-index">{{ idx + 1 }}</div>
              <div class="pc-ai-step-content">
                <h4 class="pc-ai-step-name">{{ step.name }}</h4>
                <div class="pc-ai-step-meta">{{ step.meta }}</div>
                <p class="pc-ai-step-desc">{{ step.desc }}</p>

                <div v-if="step.history" class="pc-ai-step-section pc-history-section">
                  <div class="pc-section-label">📜 历史故事</div>
                  <p class="pc-section-text">{{ step.history }}</p>
                </div>

                <div v-if="step.highlights && step.highlights.length > 0" class="pc-ai-step-section pc-highlights-section">
                  <div class="pc-section-label">⭐ 参观亮点</div>
                  <ul class="pc-highlights-list">
                    <li v-for="(h, hi) in step.highlights" :key="hi">{{ h }}</li>
                  </ul>
                </div>

                <div class="pc-time-ticket-row">
                  <div v-if="step.best_time || step.bestTime" class="pc-time-ticket-item">
                    <span class="pc-item-icon">🕐</span>
                    <div class="pc-item-content">
                      <div class="pc-item-label">最佳时间</div>
                      <div class="pc-item-value">{{ step.best_time || step.bestTime }}</div>
                    </div>
                  </div>
                  <div v-if="step.ticket" class="pc-time-ticket-item">
                    <span class="pc-item-icon">🎟️</span>
                    <div class="pc-item-content">
                      <div class="pc-item-label">门票预约</div>
                      <div class="pc-item-value">{{ step.ticket }}</div>
                    </div>
                  </div>
                </div>

                <div class="pc-food-photo-row">
                  <div v-if="step.nearby_food || step.nearbyFood" class="pc-food-photo-item pc-food-item">
                    <span class="pc-item-icon">🍜</span>
                    <div class="pc-item-content">
                      <div class="pc-item-label">附近餐饮</div>
                      <div class="pc-item-value">{{ step.nearby_food || step.nearbyFood }}</div>
                    </div>
                  </div>
                  <div v-if="step.photo_spots && step.photo_spots.length > 0" class="pc-food-photo-item pc-photo-item">
                    <span class="pc-item-icon">📷</span>
                    <div class="pc-item-content">
                      <div class="pc-item-label">拍照打卡点</div>
                      <div class="pc-item-value">{{ step.photo_spots.join('、') }}</div>
                    </div>
                  </div>
                </div>

                <div v-if="step.practical_tips && step.practical_tips.length > 0" class="pc-ai-step-section pc-practical-section">
                  <div class="pc-section-label">💡 实用贴士</div>
                  <ul class="pc-practical-list">
                    <li v-for="(pt, pti) in step.practical_tips" :key="pti">{{ pt }}</li>
                  </ul>
                </div>

                <div v-if="step.tips" class="pc-ai-step-tips">
                  <span v-for="(tip, ti) in step.tips" :key="ti" class="pc-step-chip">{{ tip }}</span>
                </div>

                <div v-if="step.transit" class="pc-ai-step-transit">
                  <div class="pc-transit-head">
                    <span class="pc-transit-icon" :class="`pc-mode-${step.transit.mode}`">
                      {{ modeIcon(step.transit.mode) }}
                    </span>
                    <span class="pc-transit-label">🚗 交通路线</span>
                    <span class="pc-transit-text">{{ step.transit.from_prev || step.transit.fromPrev }}</span>
                  </div>
                  <div v-if="step.transit.route_hint || step.transit.routeHint" class="pc-transit-hint">
                    <span class="pc-hint-arrow">→</span>
                    <span class="pc-hint-text">{{ step.transit.route_hint || step.transit.routeHint }}</span>
                  </div>
                  <div v-if="step.transit.cost || step.transit.duration" class="pc-transit-meta">
                    <span v-if="step.transit.duration" class="pc-transit-meta-item">⏱️ {{ step.transit.duration }}</span>
                    <span v-if="step.transit.cost" class="pc-transit-meta-item">💰 {{ step.transit.cost }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="pc-ai-raw-content">
            <p class="pc-ai-raw-text">{{ aiAnswer.raw }}</p>
          </div>

          <div v-if="aiAnswer.summary" class="pc-ai-summary">
            <div class="pc-summary-title">📝 路线要点</div>
            <ul class="pc-summary-list">
              <li v-for="(s, i) in aiAnswer.summary" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <!-- ==============================
         移动端模板
         ============================== -->
    <template v-else>
      <!-- 页面头部（紧凑） -->
      <div class="mobile-page-header">
        <div class="mobile-page-badge">路线推荐</div>
        <h1 class="mobile-page-title">上海红十字地点游览路线</h1>
        <p class="mobile-page-subtitle">从博物馆到救灾中心，循着先驱者的足迹探索红十字之城。</p>
      </div>

      <!-- Tab 切换（全宽度按钮样式） -->
      <div class="mobile-tabs-wrap">
        <div class="mobile-tabs">
          <button
            class="mobile-tab-btn"
            :class="{ active: currentTab === 'fixed' }"
            @click="switchTab('fixed')"
          >
            <span class="mobile-tab-text">固定路线</span>
          </button>
          <button
            class="mobile-tab-btn"
            :class="{ active: currentTab === 'ai' }"
            @click="switchTab('ai')"
          >
            <span class="mobile-tab-text">AI 推荐</span>
          </button>
        </div>
      </div>

      <!-- Tab 1：固定路线推荐（移动端单列紧凑卡片） -->
      <div v-if="currentTab === 'fixed'" class="mobile-tab-content">
        <div class="mobile-locations-list">
          <div
            v-for="(loc, index) in sortedLocations"
            :key="loc.id"
            class="mobile-loc-card"
            :class="{ 'mobile-loc-checked': hasCheckedIn(loc.id) }"
            @click="openModal(loc)"
          >
            <div class="mobile-loc-number">{{ index + 1 }}</div>
            <div class="mobile-loc-info">
              <h3 class="mobile-loc-name">{{ loc.name }}</h3>
              <div class="mobile-loc-meta">{{ loc.location }}</div>
              <p class="mobile-loc-desc">{{ loc.description }}</p>
              <div v-if="loc.highlights && loc.highlights.length > 0" class="mobile-loc-tags">
                <span v-for="tag in loc.highlights.slice(0, 2)" :key="tag" class="mobile-loc-tag">{{ tag }}</span>
              </div>
            </div>
            <div class="mobile-loc-status">
              <span v-if="hasCheckedIn(loc.id)" class="mobile-status-done">✓</span>
              <span v-else class="mobile-status-todo">›</span>
            </div>
          </div>
        </div>

        <!-- 路线说明（简化为列表样式） -->
        <div class="mobile-route-info">
          <div class="mobile-info-title">📋 游览顺序</div>
          <div class="mobile-info-steps">
            <div
              v-for="(loc, index) in sortedLocations"
              :key="loc.id"
              class="mobile-step-item"
              :class="{ 'mobile-step-checked': hasCheckedIn(loc.id) }"
              @click="openModal(loc)"
            >
              <div class="mobile-step-number" :style="{ background: hasCheckedIn(loc.id) ? '#4caf50' : '#d32f2f' }">{{ index + 1 }}</div>
              <div class="mobile-step-content">
                <div class="mobile-step-name">{{ loc.name }}</div>
                <div class="mobile-step-place">{{ loc.location }}</div>
              </div>
              <div class="mobile-step-status">{{ hasCheckedIn(loc.id) ? '✓' : '›' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2：AI 智能推荐（移动端紧凑） -->
      <div v-if="currentTab === 'ai'" class="mobile-tab-content">
        <!-- 预设问题区域（单列卡片） -->
        <div class="mobile-ai-card mobile-ai-question-card">
          <div class="mobile-ai-card-header">
            <span class="mobile-ai-icon">🤖</span>
            <span class="mobile-ai-title">选择方向</span>
          </div>

          <div class="mobile-preset-questions">
            <div
              v-for="(q, idx) in presetQuestions"
              :key="idx"
              class="mobile-preset-item"
              :class="{ selected: selectedQuestion === q.label, loading: aiLoading && selectedQuestion === q.label }"
              @click="selectAndAsk(q)"
            >
              <span class="mobile-preset-emoji">{{ q.emoji }}</span>
              <span class="mobile-preset-label">{{ q.label }}</span>
              <span v-if="aiLoading && selectedQuestion === q.label" class="mobile-preset-spinner"></span>
            </div>
          </div>

          <div class="mobile-custom-ask">
            <div class="mobile-custom-ask-label">
              <span>💬 或直接描述需求</span>
            </div>
            <textarea
              v-model="customQuestion"
              class="mobile-ask-textarea"
              rows="2"
              placeholder="例如：上午9点从虹桥出发，下午3点前游览3个最有故事感的地点"
              @keydown.enter.ctrl="submitCustom"
            ></textarea>
            <button
              class="mobile-btn-ask-submit"
              :disabled="aiLoading || !customQuestion.trim()"
              @click="submitCustom"
            >
              <span v-if="aiLoading && isCustomAsk" class="mobile-submit-spinner"></span>
              <span class="mobile-submit-text">{{ aiLoading && isCustomAsk ? '生成中...' : '生成路线' }}</span>
            </button>
          </div>
        </div>

        <!-- AI 结果（紧凑） -->
        <div v-if="aiAnswer" class="mobile-ai-card mobile-ai-result-card">
          <div class="mobile-ai-result-header">
            <span class="mobile-result-badge">✨ AI 推荐</span>
            <button class="mobile-btn-refresh" @click="clearAnswer">清空</button>
          </div>

          <div class="mobile-ai-result-question">
            <span class="mobile-q-text">{{ aiAnswer.question }}</span>
          </div>

          <div v-if="aiAnswer.steps && aiAnswer.steps.length > 0" class="mobile-ai-steps">
            <div
              v-for="(step, idx) in aiAnswer.steps"
              :key="idx"
              class="mobile-ai-step-item"
            >
              <div class="mobile-ai-step-top">
                <div class="mobile-ai-step-index">{{ idx + 1 }}</div>
                <div class="mobile-ai-step-title">
                  <h4 class="mobile-ai-step-name">{{ step.name }}</h4>
                  <div class="mobile-ai-step-meta">{{ step.meta }}</div>
                </div>
              </div>
              <p class="mobile-ai-step-desc">{{ step.desc }}</p>

              <div v-if="step.best_time || step.bestTime || step.ticket" class="mobile-time-ticket-row">
                <div v-if="step.best_time || step.bestTime" class="mobile-time-ticket-item">
                  <span>🕐</span>
                  <div class="mobile-item-value">{{ step.best_time || step.bestTime }}</div>
                </div>
                <div v-if="step.ticket" class="mobile-time-ticket-item">
                  <span>🎟️</span>
                  <div class="mobile-item-value">{{ step.ticket }}</div>
                </div>
              </div>

              <div v-if="step.nearby_food || step.nearbyFood || (step.photo_spots && step.photo_spots.length > 0)" class="mobile-food-photo-row">
                <div v-if="step.nearby_food || step.nearbyFood" class="mobile-food-photo-item mobile-food-item">
                  <span>🍜</span>
                  <div class="mobile-item-value">{{ step.nearby_food || step.nearbyFood }}</div>
                </div>
                <div v-if="step.photo_spots && step.photo_spots.length > 0" class="mobile-food-photo-item mobile-photo-item">
                  <span>📷</span>
                  <div class="mobile-item-value">{{ step.photo_spots.join('、') }}</div>
                </div>
              </div>

              <div v-if="step.transit" class="mobile-ai-step-transit">
                <div class="mobile-transit-head">
                  <span class="mobile-transit-icon">{{ modeIcon(step.transit.mode) }}</span>
                  <span class="mobile-transit-label">交通</span>
                  <span class="mobile-transit-text">{{ step.transit.from_prev || step.transit.fromPrev }}</span>
                </div>
                <div v-if="step.transit.route_hint || step.transit.routeHint" class="mobile-transit-hint">
                  <span>{{ step.transit.route_hint || step.transit.routeHint }}</span>
                </div>
                <div v-if="step.transit.cost || step.transit.duration" class="mobile-transit-meta">
                  <span v-if="step.transit.duration">⏱️ {{ step.transit.duration }}</span>
                  <span v-if="step.transit.cost"> 💰 {{ step.transit.cost }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="mobile-ai-raw-content">
            <p class="mobile-ai-raw-text">{{ aiAnswer.raw }}</p>
          </div>

          <div v-if="aiAnswer.summary && aiAnswer.summary.length > 0" class="mobile-ai-summary">
            <div class="mobile-summary-title">📝 要点</div>
            <ul class="mobile-summary-list">
              <li v-for="(s, i) in aiAnswer.summary" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <!-- ==============================
         地点详情弹窗（通用）
         ============================== -->
    <div v-if="selectedLocation" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card" :style="{ '--accent-color': selectedLocation.color }">
        <div class="modal-header">
          <div class="modal-image" :class="{ 'has-image': selectedLocation.image }">
            <img v-if="selectedLocation.image" :src="selectedLocation.image" :alt="selectedLocation.name" />
            <div v-else class="modal-image-placeholder">
              <span class="placeholder-badge">图片预留位置</span>
            </div>
            <div class="modal-category">{{ selectedLocation.category }}</div>
            <button class="modal-close" @click="closeModal">×</button>
          </div>
        </div>

        <div class="modal-body">
          <h2 class="modal-title">{{ selectedLocation.name }}</h2>
          <div class="modal-place">📍 {{ selectedLocation.location }}</div>
          <p class="modal-desc">{{ selectedLocation.description }}</p>

          <div class="modal-history">
            <div class="history-label">📖 历史背景</div>
            <div class="history-text">{{ selectedLocation.history }}</div>
          </div>

          <div class="modal-highlights">
            <div class="highlights-label">✨ 亮点内容</div>
            <div class="highlights-list">
              <span v-for="(h, i) in selectedLocation.highlights" :key="i" class="highlight-item">{{ h }}</span>
            </div>
          </div>

          <div v-if="hasCheckedIn(selectedLocation.id)" class="modal-note-box">
            <div class="note-label">📝 我的打卡备注</div>
            <div class="note-content">{{ getCheckinNote(selectedLocation.id) }}</div>
            <div class="note-time">打卡时间: {{ getCheckinTime(selectedLocation.id) }}</div>
          </div>

          <div v-else class="modal-note-input">
            <div class="note-label">📝 游览感受（选填）</div>
            <textarea
              v-model="noteText"
              class="note-input"
              rows="4"
              placeholder="请记录您的游览感受或红十字精神感悟..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button v-if="!hasCheckedIn(selectedLocation.id)" class="btn-checkin" @click="doCheckin">
            🔖 立即打卡
          </button>
          <button v-else class="btn-checked" disabled>
            ✓ 已打卡
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLocationStore } from '../stores/locationStore'
import { useCheckinStore } from '../stores/checkinStore'
import { useViewport } from '../composables/useViewport'

const { isMobile } = useViewport()

const { locations } = useLocationStore()
const { hasCheckedIn, addCheckin, getCheckinNote, getCheckinTime } = useCheckinStore()

const selectedLocation = ref(null)
const noteText = ref('')

const sortedLocations = computed(() => {
  return locations.value
})

const openModal = (loc) => {
  selectedLocation.value = loc
  noteText.value = ''
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedLocation.value = null
  noteText.value = ''
  document.body.style.overflow = ''
}

const doCheckin = () => {
  if (selectedLocation.value) {
    addCheckin(selectedLocation.value.id, noteText.value)
  }
}

// ==============================
// Tab 切换逻辑
// ==============================
const currentTab = ref('fixed')
const switchTab = (tab) => {
  currentTab.value = tab
}

// ==============================
// AI 推荐 - 预设问题
// ==============================
const presetQuestions = [
  {
    emoji: '⏰',
    label: '半天（3-4小时）能走完的精华路线',
  },
  {
    emoji: '👶',
    label: '适合儿童的红十字精神启蒙路线',
  },
  {
    emoji: '📚',
    label: '以博物馆和历史地标为主的深度路线',
  },
  {
    emoji: '🌆',
    label: '一天内游览所有红十字地点的完整路线',
  },
  {
    emoji: '❤️',
    label: '以医疗救助机构为主的感人路线',
  },
  {
    emoji: '📷',
    label: '适合拍照打卡的网红路线',
  },
]

// ==============================
// AI 路线推荐：调用后端 Spring Boot 接口
// POST http://localhost:8080/api/ai/route
// 由后端代理访问 DeepSeek，避免在浏览器暴露 API Key
// ==============================

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api/ai/route'

const aiLoading = ref(false)
const selectedQuestion = ref('')
const customQuestion = ref('')
const isCustomAsk = ref(false)
const aiAnswer = ref(null)

const selectAndAsk = async (q) => {
  await askAI(q.label, false)
}

// 处理用户的自由输入提问
const submitCustom = async () => {
  const text = customQuestion.value.trim()
  if (!text || aiLoading.value) return
  await askAI(text, true)
}

// 统一的 AI 提问入口
const askAI = async (question, isCustom) => {
  if (aiLoading.value) return
  selectedQuestion.value = question
  isCustomAsk.value = !!isCustom

  aiLoading.value = true
  aiAnswer.value = null

  const body = {
    question: question,
    locations: locations.value.map(l => ({
      name: l.name,
      category: l.category,
      location: l.location,
      description: l.description + '（历史背景：' + l.history + '；亮点：' + (l.highlights || []).join('、') + '）'
    }))
  }

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      aiAnswer.value = {
        question: question,
        steps: generateMockRoute(question),
        summary: [
          '后端暂不可用，以下为本地参考路线',
          '请稍后重试以获得 AI 智能推荐',
          '路线经过精心编排，符合您的时间与兴趣',
        ],
        raw: data.error || '请求失败：HTTP ' + res.status,
      }
      return
    }

    const normalizedSteps = (data.steps || []).map(s => ({
      name: s.name,
      meta: s.meta,
      desc: s.desc,
      history: s.history,
      best_time: s.best_time || s.bestTime,
      ticket: s.ticket,
      highlights: s.highlights || [],
      photo_spots: s.photo_spots || s.photoSpots || [],
      nearby_food: s.nearby_food || s.nearbyFood,
      practical_tips: s.practical_tips || s.practicalTips || [],
      tips: s.tips || [],
      transit: s.transit ? {
        from_prev: s.transit.from_prev || s.transit.fromPrev,
        route_hint: s.transit.route_hint || s.transit.routeHint,
        mode: s.transit.mode,
        cost: s.transit.cost,
        duration: s.transit.duration,
      } : null
    }))

    aiAnswer.value = {
      question: question,
      steps: normalizedSteps,
      summary: data.summary || [],
      mocked: !!data.mocked,
      errorMessage: data.errorMessage,
      raw: '',
    }
  } catch (err) {
    aiAnswer.value = {
      question: question,
      steps: generateMockRoute(question),
      summary: [
        '无法连接到 AI 服务，以下为本地参考路线',
        '请确认后端服务已启动（http://localhost:8080）',
        '实际出行请以地图导航为准',
      ],
      raw: '无法连接后端服务：' + (err?.message || '网络错误') + '\n\n提示：请启动 Spring Boot 后端服务，或在 .env 中配置 VITE_BACKEND_URL。',
    }
  } finally {
    aiLoading.value = false
    isCustomAsk.value = false
  }
}

// 交通方式图标映射
const modeIcon = (mode) => {
  const map = {
    walk: '🚶',
    subway: '🚇',
    bus: '🚌',
    taxi: '🚕',
  }
  return map[mode] || '🚗'
}

// 本地 mock 路线生成
const generateMockRoute = (question) => {
  const locs = locations.value
  const takeHalf = question.includes('半天') || question.includes('3-4小时') || question.includes('精华')
  const takeAll = question.includes('一天') || question.includes('完整') || question.includes('全部')
  const takeCount = takeHalf ? 4 : (takeAll ? locs.length : Math.min(5, locs.length))

  const sortedLocs = [...locs]
  const isKids = question.includes('儿童') || question.includes('青少年')
  const isMuseum = question.includes('博物馆') || question.includes('历史') || question.includes('深度')
  const isMedical = question.includes('医疗') || question.includes('救助') || question.includes('感人')
  if (isKids) sortedLocs.sort((a, b) => (a.category === '青少年教育' ? -1 : 1))
  if (isMuseum) sortedLocs.sort((a, b) => (a.category === '博物馆' ? -1 : 1))
  if (isMedical) sortedLocs.sort((a, b) => (a.category === '医疗机构' ? -1 : 1))

  const picked = sortedLocs.slice(0, takeCount)

  const transitByDistrict = (prevLoc, currLoc) => {
    if (!prevLoc) return {
      from_prev: '从您的出发点前往本地点',
      route_hint: '建议使用手机地图导航，输入地点名称即可规划最优路线',
      mode: 'subway',
      cost: '请以实际导航为准',
      duration: '请以实际导航为准',
    }

    const getDist = (l) => {
      const parts = (l.location || '').split('·').map(s => s.trim())
      return parts[parts.length - 1] || '上海'
    }

    const prevDist = getDist(prevLoc)
    const currDist = getDist(currLoc)

    if (prevDist === currDist) {
      return {
        from_prev: '步行约 10-15 分钟，或公交 2 站',
        route_hint: `两地点都位于${currDist}，沿主要道路步行或乘区内公交即可到达`,
        mode: 'walk',
      }
    }

    const adjacentPairs = [
      ['黄浦区', '静安区'], ['静安区', '长宁区'], ['静安区', '徐汇区'],
      ['徐汇区', '长宁区'], ['徐汇区', '黄浦区'], ['徐汇区', '杨浦区'],
      ['黄浦区', '浦东新区'], ['静安区', '杨浦区'], ['浦东新区', '杨浦区'],
      ['静安区', '闵行区'], ['徐汇区', '闵行区'],
    ]
    const isAdjacent = adjacentPairs.some(([a, b]) =>
      (a === prevDist && b === currDist) || (a === currDist && b === prevDist)
    )

    if (isAdjacent) {
      return {
        from_prev: '地铁 1-2 站 + 步行约 5 分钟，约 15 分钟',
        route_hint: `从${prevDist}乘坐地铁前往${currDist}，出站后步行几分钟到达`,
        mode: 'subway',
        cost: '约4元',
        duration: '约15分钟',
      }
    }

    if (prevDist === '浦东新区' || currDist === '浦东新区') {
      return {
        from_prev: '地铁 3-5 站，约 25 分钟',
        route_hint: `从${prevDist}经地铁过江线路前往${currDist}，具体线路请以地图导航为准`,
        mode: 'subway',
        cost: '约6元',
        duration: '约25分钟',
      }
    }
    if (prevDist === '闵行区' || currDist === '闵行区') {
      return {
        from_prev: '地铁 4-6 站，约 30 分钟',
        route_hint: `从${prevDist}乘坐地铁前往${currDist}，具体线路请以地图导航为准`,
        mode: 'subway',
        cost: '约7元',
        duration: '约30分钟',
      }
    }

    return {
      from_prev: '公交或地铁换乘，约 20-30 分钟',
      route_hint: `从${prevDist}前往${currDist}，建议使用地图导航查询最优换乘方案`,
      mode: 'bus',
      cost: '约3元',
      duration: '约25分钟',
    }
  }

  return picked.map((loc, idx) => {
    const prev = idx === 0 ? null : picked[idx - 1]
    const transit = transitByDistrict(prev, loc)
    return {
      name: loc.name,
      meta: `预计参观 ${40 + idx * 10} 分钟（${loc.category}）`,
      desc: loc.description + ' 本场馆是上海红十字文化的重要展示窗口，承载着深厚的人道主义精神，是了解上海乃至中国红十字运动历史的绝佳起点。',
      history: '该场馆成立于近现代时期，见证了中国红十字运动在上海的发展历程，承载着几代红十字人的理想与实践。',
      best_time: '建议工作日上午 9:00-11:00，此时人流较少，可安静参观；周末 10:00-14:00 为参观高峰期，建议提前到达。',
      ticket: '免费开放，无需购票。建议提前通过官方公众号预约名额；部分场馆每周一闭馆维护。',
      highlights: ['馆内珍藏历史文献与实物展品', '专业讲解员免费定时讲解（每日 10:00 / 14:00）', '互动多媒体展示区，深入了解红十字精神', '临期主题特展，定期更换内容'],
      photo_spots: ['场馆正门的红十字主题雕塑', '一楼大厅的光辉历程展区', '二楼临展互动区（光线最佳，适合人像）'],
      nearby_food: loc.location.includes('徐汇区')
        ? '出门右转 200 米岳阳路有多家本帮菜馆，人均约 60-80 元；永康路有网红咖啡店，适合短暂休憩。'
        : '附近商场 B1 层有实惠快餐，约 30-45 元；路边有连锁便利店，可购买简餐。',
      practical_tips: ['场馆周边停车困难，建议搭乘地铁或公交前往', '馆内设有无障碍通道及轮椅免费借用服务', '可携带饮用水，但请勿携带食品进入展厅', '参观时长建议预留 1-2 小时'],
      tips: ['请遵守场馆规定，勿使用闪光灯拍照', '部分展品需预约才能近距离观看'],
      transit,
    }
  })
}

const clearAnswer = () => {
  aiAnswer.value = null
  selectedQuestion.value = ''
  customQuestion.value = ''
}
</script>

<style scoped>
.routes-page {
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ==============================
   PC 端样式
   ============================== */

/* 页面头部 */
.pc-page-header {
  text-align: center;
}

.pc-page-badge {
  display: inline-block;
  padding: 10px 24px;
  background: white;
  border: 2px solid #d32f2f;
  color: #d32f2f;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.15);
  animation: badgeFadeIn 1s ease-out;
}

@keyframes badgeFadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.pc-page-title {
  font-size: clamp(18px, 4vw, 38px);
  color: #1a2332;
  margin: 0 0 16px 0;
  font-weight: 800;
  background: linear-gradient(135deg, #1a2332 0%, #d32f2f 50%, #1a2332 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 6s ease-in-out infinite;
}

@keyframes titleShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.pc-page-subtitle {
  font-size: 16px;
  color: #7a8599;
  margin: 0 auto;
  line-height: 1.8;
  max-width: 720px;
  animation: fadeInUp 1s ease-out 0.3s backwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Tab 切换 */
.pc-tabs-wrap {
  display: flex;
  justify-content: center;
}

.pc-tabs {
  display: inline-flex;
  background: white;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(26, 35, 50, 0.08);
  gap: 6px;
}

.pc-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #7a8599;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pc-tab-btn:hover {
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.05);
}

.pc-tab-btn.active {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.35);
  animation: tabActive 0.3s ease-out;
}

@keyframes tabActive {
  from { transform: scale(0.96); }
  to { transform: scale(1); }
}

.pc-tab-icon {
  font-size: 17px;
}

.pc-tab-content {
  animation: tabContentFadeIn 0.45s ease-out;
}

@keyframes tabContentFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 固定路线 - 列表 */
.pc-locations-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pc-loc-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 28px;
  display: flex;
  align-items: flex-start;
  gap: 24px;
  border: 2px solid #fce4ec;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: cardSlideIn 0.7s ease-out backwards;
}

.pc-loc-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(180deg, #d32f2f, #ff7043);
  border-radius: 20px 0 0 20px;
  transition: width 0.3s ease;
}

.pc-loc-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle at top right, rgba(211, 47, 47, 0.05), transparent 70%);
  transition: all 0.4s ease;
  pointer-events: none;
}

.pc-loc-card:nth-child(1) { animation-delay: 0.05s; }
.pc-loc-card:nth-child(2) { animation-delay: 0.15s; }
.pc-loc-card:nth-child(3) { animation-delay: 0.25s; }
.pc-loc-card:nth-child(4) { animation-delay: 0.35s; }
.pc-loc-card:nth-child(5) { animation-delay: 0.45s; }
.pc-loc-card:nth-child(6) { animation-delay: 0.55s; }
.pc-loc-card:nth-child(7) { animation-delay: 0.65s; }
.pc-loc-card:nth-child(8) { animation-delay: 0.75s; }

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.pc-loc-card:hover {
  transform: translateX(8px);
  border-color: #ff7043;
  box-shadow: 0 12px 40px rgba(255, 112, 67, 0.18);
}

.pc-loc-card:hover::before {
  width: 8px;
}

.pc-loc-card:hover::after {
  width: 180px;
  height: 180px;
}

.pc-loc-card.pc-loc-checked {
  border-color: #c8e6c9;
  background: linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%);
}

.pc-loc-card.pc-loc-checked::before {
  background: linear-gradient(180deg, #4caf50, #81c784);
}

.pc-loc-card.pc-loc-checked:hover {
  border-color: #4caf50;
  box-shadow: 0 12px 40px rgba(76, 175, 80, 0.22);
}

.pc-loc-number {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  font-size: 24px;
  font-weight: 800;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(211, 47, 47, 0.3);
  transition: all 0.4s ease;
  position: relative;
}

.pc-loc-card:hover .pc-loc-number {
  transform: rotate(-8deg) scale(1.1);
  box-shadow: 0 10px 24px rgba(211, 47, 47, 0.45);
}

.pc-loc-card.pc-loc-checked .pc-loc-number {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 6px 18px rgba(76, 175, 80, 0.3);
}

.pc-loc-number::after {
  content: '';
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff7043;
  animation: dotPulse 2s ease-in-out infinite;
}

.pc-loc-card.pc-loc-checked .pc-loc-number::after {
  background: #81c784;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.35); opacity: 0.6; }
}

.pc-loc-icon {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.4s ease;
  overflow: hidden;
}

.pc-loc-card:hover .pc-loc-icon {
  transform: rotate(5deg) scale(1.08);
  background: linear-gradient(135deg, #ffe0e0, #ffcccc);
}

.pc-cross-outer {
  width: 50px;
  height: 50px;
  position: relative;
  animation: crossBreath 3s ease-in-out infinite;
}

.pc-cross-h, .pc-cross-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
  transition: all 0.3s ease;
}

.pc-cross-h {
  width: 42px;
  height: 12px;
  transform: translate(-50%, -50%);
}

.pc-cross-v {
  width: 12px;
  height: 42px;
  transform: translate(-50%, -50%);
}

.pc-loc-card:hover .pc-cross-h,
.pc-loc-card:hover .pc-cross-v {
  background: linear-gradient(135deg, #ff7043, #d32f2f);
  box-shadow: 0 4px 14px rgba(255, 112, 67, 0.5);
}

@keyframes crossBreath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.pc-loc-card.pc-loc-checked .pc-cross-h,
.pc-loc-card.pc-loc-checked .pc-cross-v {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.pc-loc-info {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

.pc-loc-name {
  font-size: 22px;
  color: #1a2332;
  margin: 0 0 8px 0;
  font-weight: 700;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.35;
}

.pc-loc-card:hover .pc-loc-name {
  color: #d32f2f;
}

.pc-loc-card.pc-loc-checked:hover .pc-loc-name {
  color: #4caf50;
}

.pc-loc-meta {
  font-size: 13px;
  color: #7a8599;
  margin-bottom: 12px;
  font-weight: 500;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.55;
}

.pc-loc-desc {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0 0 16px 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-loc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pc-loc-tag {
  font-size: 12px;
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pc-loc-card:hover .pc-loc-tag {
  background: rgba(211, 47, 47, 0.18);
  transform: translateY(-1px);
}

.pc-loc-card.pc-loc-checked .pc-loc-tag {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.12);
}

.pc-loc-card.pc-loc-checked:hover .pc-loc-tag {
  background: rgba(76, 175, 80, 0.22);
}

.pc-loc-status {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: 12px;
  white-space: nowrap;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.pc-status-todo {
  color: #ff7043;
  background: linear-gradient(135deg, rgba(255, 112, 67, 0.1), rgba(255, 112, 67, 0.05));
  border: 2px solid rgba(255, 112, 67, 0.3);
}

.pc-loc-card:hover .pc-status-todo {
  background: linear-gradient(135deg, #ff7043, #d32f2f);
  color: white;
  transform: translateX(4px);
  box-shadow: 0 6px 16px rgba(255, 112, 67, 0.35);
}

.pc-status-done {
  color: white;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 4px 14px rgba(76, 175, 80, 0.35);
  animation: checkedGlow 2.5s ease-in-out infinite;
}

@keyframes checkedGlow {
  0%, 100% { box-shadow: 0 4px 14px rgba(76, 175, 80, 0.35); }
  50% { box-shadow: 0 6px 22px rgba(76, 175, 80, 0.6); }
}

/* 路线说明区块 */
.pc-route-info {
  background: white;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 4px 24px rgba(26, 35, 50, 0.08);
  position: relative;
  overflow: hidden;
}

.pc-route-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #d32f2f, transparent);
  opacity: 0.5;
}

.pc-info-title {
  font-size: 22px;
  font-weight: 800;
  color: #1a2332;
  text-align: center;
  margin-bottom: 26px;
  letter-spacing: 1px;
}

.pc-info-steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.pc-step-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #fafbfc;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.pc-step-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(211, 47, 47, 0.15), transparent);
  transition: width 0.3s ease;
}

.pc-step-item:hover {
  background: white;
  border-color: #d32f2f;
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(211, 47, 47, 0.12);
}

.pc-step-item:hover::before {
  width: 100%;
}

.pc-step-item.pc-step-checked {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.03));
}

.pc-step-item.pc-step-checked:hover {
  border-color: #4caf50;
  background: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.15);
}

.pc-step-number {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  transition: transform 0.3s ease;
  z-index: 1;
}

.pc-step-item:hover .pc-step-number {
  transform: rotate(360deg) scale(1.1);
}

.pc-step-item.pc-step-checked .pc-step-number {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.pc-step-content {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.pc-step-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a2332;
  margin-bottom: 4px;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
}

.pc-step-item:hover .pc-step-name {
  color: #d32f2f;
}

.pc-step-item.pc-step-checked:hover .pc-step-name {
  color: #4caf50;
}

.pc-step-place {
  font-size: 12px;
  color: #7a8599;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-step-status {
  flex-shrink: 0;
  font-size: 13px;
  color: #d32f2f;
  font-weight: 600;
  transition: transform 0.3s ease;
  z-index: 1;
}

.pc-step-item.pc-step-checked .pc-step-status {
  color: #4caf50;
}

.pc-step-item:hover .pc-step-status {
  transform: translateX(4px);
}

/* AI 推荐页面 */
.pc-ai-card {
  background: white;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 4px 24px rgba(26, 35, 50, 0.08);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.pc-ai-card-header {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
}

.pc-ai-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1a2332, #d32f2f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 8px 20px rgba(211, 47, 47, 0.25);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-6px) rotate(2deg); }
}

.pc-ai-header-text {
  flex: 1;
}

.pc-ai-title {
  font-size: 22px;
  color: #1a2332;
  margin: 0 0 8px 0;
  font-weight: 800;
}

.pc-ai-subtitle {
  font-size: 14px;
  color: #7a8599;
  margin: 0;
  line-height: 1.7;
}

.pc-preset-questions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.pc-preset-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #fafbfc, #f5f7fa);
  border: 2px solid transparent;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
}

.pc-preset-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.06), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pc-preset-item:hover {
  transform: translateY(-3px);
  border-color: #d32f2f;
  background: white;
  box-shadow: 0 10px 28px rgba(211, 47, 47, 0.18);
}

.pc-preset-item:hover::before {
  opacity: 1;
}

.pc-preset-item.selected {
  border-color: #d32f2f;
  background: linear-gradient(135deg, #fff5f5, #ffecec);
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.2);
}

.pc-preset-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.pc-preset-emoji {
  font-size: 26px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.pc-preset-item:hover .pc-preset-emoji {
  transform: scale(1.25) rotate(-5deg);
}

.pc-preset-label {
  font-size: 14px;
  color: #1a2332;
  font-weight: 600;
  line-height: 1.5;
  flex: 1;
}

.pc-preset-item:hover .pc-preset-label {
  color: #d32f2f;
}

.pc-preset-spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(211, 47, 47, 0.2);
  border-top-color: #d32f2f;
  border-radius: 50%;
  animation: spinSpin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spinSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pc-custom-ask {
  margin-top: 8px;
  padding: 20px;
  background: linear-gradient(135deg, #fff9f5, #fff3e0);
  border-radius: 16px;
  border: 2px dashed #ffcc80;
  animation: customAskIn 0.5s ease-out;
}

@keyframes customAskIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.pc-custom-ask-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #5d4037;
}

.pc-ask-emoji {
  font-size: 18px;
}

.pc-custom-ask-input {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.pc-ask-textarea {
  flex: 1;
  min-height: 56px;
  padding: 12px 14px;
  background: #fff;
  border: 2px solid #ffe0b2;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: #3e2723;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s ease;
  outline: none;
}

.pc-ask-textarea::placeholder {
  color: #bca89a;
}

.pc-ask-textarea:focus {
  border-color: #d32f2f;
  box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.08);
  background: #fffaf5;
}

.pc-btn-ask-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 22px;
  min-width: 128px;
  background: linear-gradient(135deg, #d32f2f, #c62828);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  flex-shrink: 0;
}

.pc-btn-ask-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #c62828, #a61b1b);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(211, 47, 47, 0.35);
}

.pc-btn-ask-submit:active:not(:disabled) {
  transform: translateY(0);
}

.pc-btn-ask-submit:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
  box-shadow: none;
}

.pc-submit-arrow {
  font-size: 14px;
  line-height: 1;
}

.pc-submit-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spinSpin 0.8s linear infinite;
}

.pc-submit-text {
  font-size: 14px;
}

.pc-custom-ask-tip {
  margin-top: 10px;
  padding-left: 2px;
  font-size: 12px;
  color: #a1887f;
  line-height: 1.6;
}

/* AI 结果卡片 */
.pc-ai-result-card {
  background: linear-gradient(135deg, #ffffff 0%, #fffaf5 100%);
  border: 2px solid rgba(211, 47, 47, 0.15);
}

.pc-ai-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pc-result-badge {
  display: inline-block;
  padding: 10px 22px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.3);
  animation: badgePop 0.4s ease-out;
}

@keyframes badgePop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.pc-btn-refresh {
  padding: 10px 20px;
  background: transparent;
  color: #7a8599;
  border: 2px solid #e5e9ef;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pc-btn-refresh:hover {
  color: #d32f2f;
  border-color: #d32f2f;
  background: rgba(211, 47, 47, 0.05);
}

.pc-ai-result-question {
  background: #f8fafc;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.pc-q-label {
  font-size: 13px;
  color: #7a8599;
  font-weight: 600;
}

.pc-q-text {
  font-size: 14px;
  color: #1a2332;
  font-weight: 700;
}

.pc-ai-disclaimer {
  background: linear-gradient(135deg, #fffbe6, #fff3cd);
  border-left: 3px solid #f5a623;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: #7a5a00;
}

.pc-disclaimer-icon {
  font-size: 16px;
  flex-shrink: 0;
  line-height: 1.7;
}

.pc-disclaimer-text {
  flex: 1;
}

/* AI 步骤列表 */
.pc-ai-steps {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
}

.pc-ai-step-item {
  display: flex;
  gap: 16px;
  padding: 22px 24px;
  background: white;
  border-radius: 18px;
  border: 2px solid #f5f5f5;
  transition: all 0.3s ease;
  animation: stepSlideIn 0.5s ease-out backwards;
  position: relative;
}

.pc-ai-step-item:nth-child(1) { animation-delay: 0.05s; }
.pc-ai-step-item:nth-child(2) { animation-delay: 0.15s; }
.pc-ai-step-item:nth-child(3) { animation-delay: 0.25s; }
.pc-ai-step-item:nth-child(4) { animation-delay: 0.35s; }
.pc-ai-step-item:nth-child(5) { animation-delay: 0.45s; }
.pc-ai-step-item:nth-child(6) { animation-delay: 0.55s; }

@keyframes stepSlideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.pc-ai-step-item:hover {
  border-color: #d32f2f;
  transform: translateX(4px);
  box-shadow: 0 10px 28px rgba(211, 47, 47, 0.15);
}

.pc-ai-step-index {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #d32f2f, #ff7043);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  box-shadow: 0 6px 14px rgba(211, 47, 47, 0.3);
}

.pc-ai-step-content {
  flex: 1;
  min-width: 0;
}

.pc-ai-step-name {
  font-size: clamp(12px, 2vw, 17px);
  color: #1a2332;
  margin: 0 0 6px 0;
  font-weight: 700;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
}

.pc-ai-step-item:hover .pc-ai-step-name {
  color: #d32f2f;
}

.pc-ai-step-meta {
  font-size: 12px;
  color: #d32f2f;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pc-ai-step-desc {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0 0 14px 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* 通用区块样式 */
.pc-ai-step-section {
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  animation: sectionIn 0.4s ease-out backwards;
}

@keyframes sectionIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.pc-section-label {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.pc-section-text {
  font-size: 13px;
  color: #555;
  line-height: 1.7;
  margin: 0;
}

.pc-highlights-list, .pc-practical-list {
  margin: 0;
  padding-left: 20px;
}

.pc-highlights-list li, .pc-practical-list li {
  font-size: 13px;
  color: #444;
  line-height: 1.7;
  margin-bottom: 4px;
}

.pc-history-section {
  background: linear-gradient(135deg, #fffdf5, #fff8e1);
  border-left: 3px solid #d4a017;
}

.pc-highlights-section {
  background: linear-gradient(135deg, #f0f7ff, #e3f2fd);
  border-left: 3px solid #1976d2;
}

.pc-practical-section {
  background: linear-gradient(135deg, #f1fff5, #e8f5e9);
  border-left: 3px solid #388e3c;
}

.pc-history-section .pc-section-label { color: #b8860b; }
.pc-highlights-section .pc-section-label { color: #1565c0; }
.pc-practical-section .pc-section-label { color: #2e7d32; }

/* 最佳时间 & 门票 同行 */
.pc-time-ticket-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.pc-time-ticket-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #eee;
}

.pc-item-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.pc-item-content {
  flex: 1;
  min-width: 0;
}

.pc-item-label {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}

.pc-item-value {
  font-size: 12.5px;
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

/* 附近餐饮 & 打卡点 同行 */
.pc-food-photo-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.pc-food-photo-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid;
}

.pc-food-item {
  background: #fffbf5;
  border-color: #ffe0b2;
}

.pc-photo-item {
  background: #fdf7ff;
  border-color: #e1bee7;
}

/* 快速贴士 chip */
.pc-ai-step-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pc-step-chip {
  font-size: 12px;
  padding: 5px 12px;
  background: rgba(211, 47, 47, 0.08);
  color: #d32f2f;
  border-radius: 20px;
  font-weight: 500;
}

/* 交通路线展示 */
.pc-ai-step-transit {
  margin-top: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fff8f5, #fff3eb);
  border-left: 3px solid #ff9800;
  border-radius: 10px;
  animation: transitIn 0.4s ease-out backwards;
}

.pc-ai-step-item:nth-child(1) .pc-ai-step-transit { animation-delay: 0.15s; }
.pc-ai-step-item:nth-child(2) .pc-ai-step-transit { animation-delay: 0.25s; }
.pc-ai-step-item:nth-child(3) .pc-ai-step-transit { animation-delay: 0.35s; }
.pc-ai-step-item:nth-child(4) .pc-ai-step-transit { animation-delay: 0.45s; }
.pc-ai-step-item:nth-child(5) .pc-ai-step-transit { animation-delay: 0.55s; }
.pc-ai-step-item:nth-child(6) .pc-ai-step-transit { animation-delay: 0.65s; }

@keyframes transitIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

.pc-transit-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.pc-transit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #fff;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.pc-transit-label {
  font-size: 12px;
  color: #e65100;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.pc-transit-text {
  font-size: 13px;
  color: #5d4037;
  font-weight: 600;
}

.pc-transit-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 4px;
  padding-left: 38px;
}

.pc-hint-arrow {
  color: #ff9800;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}

.pc-hint-text {
  font-size: 12px;
  color: #795548;
  line-height: 1.6;
}

/* 交通费用/时间元信息 */
.pc-transit-meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.pc-transit-meta-item {
  font-size: 12px;
  color: #777;
  background: rgba(255,152,0,0.1);
  padding: 3px 8px;
  border-radius: 6px;
}

/* 原始文本内容区 */
.pc-ai-raw-content {
  background: #f8fafc;
  padding: 24px;
  border-radius: 14px;
  margin-bottom: 24px;
}

.pc-ai-raw-text {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.9;
  margin: 0;
  white-space: pre-wrap;
}

/* 摘要 */
.pc-ai-summary {
  background: linear-gradient(135deg, #fff8e1, #ffe9d9);
  padding: 22px 26px;
  border-radius: 16px;
  border-left: 5px solid #ff9800;
}

.pc-summary-title {
  font-size: 15px;
  color: #8a6d00;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.pc-summary-list {
  margin: 0;
  padding-left: 20px;
}

.pc-summary-list li {
  font-size: 14px;
  color: #5d4e00;
  line-height: 1.8;
  margin-bottom: 4px;
}

/* ==============================
   移动端样式
   ============================== */

/* 页面头部 */
.mobile-page-header {
  text-align: center;
  padding: 0 4px;
}

.mobile-page-header .mobile-page-badge {
  display: inline-block;
  padding: 6px 14px;
  background: white;
  border: 1.5px solid #d32f2f;
  color: #d32f2f;
  border-radius: 30px;
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.12);
}

.mobile-page-title {
  font-size: clamp(18px, 5.5vw, 24px);
  color: #1a2332;
  margin: 0 0 10px 0;
  font-weight: 800;
  line-height: 1.3;
  word-break: break-word;
}

.mobile-page-subtitle {
  font-size: clamp(11px, 3vw, 13px);
  color: #7a8599;
  margin: 0 auto;
  line-height: 1.6;
  max-width: 100%;
  word-break: break-word;
}

/* Tab 切换 - 全宽度按钮样式 */
.mobile-tabs-wrap {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.mobile-tabs {
  display: flex;
  width: 100%;
  background: white;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(26, 35, 50, 0.08);
  gap: 4px;
}

.mobile-tab-btn {
  flex: 1;
  padding: 10px 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #7a8599;
  font-size: clamp(12px, 3.5vw, 14px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.mobile-tab-btn:active {
  background: rgba(211, 47, 47, 0.08);
  color: #d32f2f;
  transform: scale(0.98);
}

.mobile-tab-btn.active {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 3px 10px rgba(211, 47, 47, 0.3);
}

/* 固定路线 - 单列紧凑卡片 */
.mobile-locations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-loc-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border: 1.5px solid #fce4ec;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(26, 35, 50, 0.04);
}

.mobile-loc-card:active {
  background: #fff5f5;
  border-color: #ffcdd2;
  transform: scale(0.99);
}

.mobile-loc-card.mobile-loc-checked {
  border-color: #c8e6c9;
  background: linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%);
}

.mobile-loc-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  font-size: clamp(12px, 3.5vw, 14px);
  font-weight: 800;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.25);
}

.mobile-loc-card.mobile-loc-checked .mobile-loc-number {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.mobile-loc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.mobile-loc-name {
  font-size: clamp(13px, 4vw, 16px);
  color: #1a2332;
  margin: 0 0 4px 0;
  font-weight: 700;
  word-break: break-word;
  line-height: 1.35;
}

.mobile-loc-meta {
  font-size: clamp(10px, 2.8vw, 12px);
  color: #7a8599;
  margin-bottom: 6px;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.4;
}

.mobile-loc-desc {
  font-size: clamp(11px, 3vw, 13px);
  color: #5a6478;
  line-height: 1.6;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.mobile-loc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.mobile-loc-tag {
  font-size: clamp(9px, 2.5vw, 11px);
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.1);
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.mobile-loc-status {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: rgba(255, 112, 67, 0.1);
  color: #ff7043;
  margin-top: 2px;
}

.mobile-loc-card.mobile-loc-checked .mobile-loc-status {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

/* 路线说明 - 移动端列表样式 */
.mobile-route-info {
  background: white;
  border-radius: 14px;
  padding: 16px 14px;
  box-shadow: 0 2px 8px rgba(26, 35, 50, 0.06);
  margin-top: 8px;
}

.mobile-info-title {
  font-size: clamp(12px, 3.5vw, 14px);
  font-weight: 800;
  color: #1a2332;
  text-align: center;
  margin-bottom: 14px;
  letter-spacing: 0.5px;
}

.mobile-info-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fafbfc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
}

.mobile-step-item:active {
  background: #fff5f5;
  border-color: #ffcdd2;
}

.mobile-step-item.mobile-step-checked {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.03));
}

.mobile-step-number {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: clamp(10px, 2.8vw, 12px);
  box-shadow: 0 2px 6px rgba(211, 47, 47, 0.25);
}

.mobile-step-item.mobile-step-checked .mobile-step-number {
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.mobile-step-content {
  flex: 1;
  min-width: 0;
}

.mobile-step-name {
  font-size: clamp(11px, 3.2vw, 13px);
  font-weight: 700;
  color: #1a2332;
  margin-bottom: 2px;
  word-break: break-word;
  line-height: 1.35;
}

.mobile-step-place {
  font-size: clamp(9px, 2.5vw, 11px);
  color: #7a8599;
  word-break: break-word;
  line-height: 1.4;
}

.mobile-step-status {
  flex-shrink: 0;
  font-size: 14px;
  color: #d32f2f;
  font-weight: 600;
}

.mobile-step-item.mobile-step-checked .mobile-step-status {
  color: #4caf50;
}

/* AI 推荐页面 - 移动端 */
.mobile-ai-card {
  background: white;
  border-radius: 14px;
  padding: 16px 14px;
  box-shadow: 0 2px 8px rgba(26, 35, 50, 0.06);
  margin-bottom: 14px;
}

.mobile-ai-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1.5px solid #f0f2f5;
  justify-content: center;
}

.mobile-ai-icon {
  font-size: clamp(18px, 5vw, 22px);
}

.mobile-ai-title {
  font-size: clamp(12px, 3.5vw, 15px);
  color: #1a2332;
  font-weight: 800;
}

/* 预设问题 - 单列卡片 */
.mobile-preset-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.mobile-preset-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fafbfc, #f5f7fa);
  border: 1.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-preset-item:active {
  background: #fff5f5;
  border-color: #ffcdd2;
  transform: scale(0.99);
}

.mobile-preset-item.selected {
  border-color: #d32f2f;
  background: linear-gradient(135deg, #fff5f5, #ffecec);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.15);
}

.mobile-preset-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.mobile-preset-emoji {
  font-size: clamp(16px, 5vw, 20px);
  flex-shrink: 0;
}

.mobile-preset-label {
  font-size: clamp(11px, 3.2vw, 13px);
  color: #1a2332;
  font-weight: 600;
  line-height: 1.45;
  flex: 1;
  word-break: break-word;
}

.mobile-preset-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(211, 47, 47, 0.2);
  border-top-color: #d32f2f;
  border-radius: 50%;
  animation: spinSpin 0.8s linear infinite;
  flex-shrink: 0;
}

/* 自定义提问 - 移动端 */
.mobile-custom-ask {
  margin-top: 4px;
  padding: 12px;
  background: linear-gradient(135deg, #fff9f5, #fff3e0);
  border-radius: 12px;
  border: 1.5px dashed #ffcc80;
}

.mobile-custom-ask-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: clamp(10px, 2.8vw, 12px);
  font-weight: 600;
  color: #5d4037;
}

.mobile-ask-textarea {
  width: 100%;
  min-height: 60px;
  padding: 10px 12px;
  background: #fff;
  border: 1.5px solid #ffe0b2;
  border-radius: 10px;
  font-size: clamp(11px, 3.2vw, 13px);
  font-family: inherit;
  color: #3e2723;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 10px;
}

.mobile-ask-textarea::placeholder {
  color: #bca89a;
}

.mobile-ask-textarea:focus {
  border-color: #d32f2f;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.08);
}

.mobile-btn-ask-submit {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #d32f2f, #c62828);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: clamp(12px, 3.5vw, 14px);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(211, 47, 47, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.mobile-btn-ask-submit:active:not(:disabled) {
  background: linear-gradient(135deg, #b71c1c, #a61b1b);
  transform: scale(0.99);
}

.mobile-btn-ask-submit:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
  box-shadow: none;
}

.mobile-submit-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spinSpin 0.8s linear infinite;
}

/* AI 结果 - 移动端 */
.mobile-ai-result-card {
  background: linear-gradient(135deg, #ffffff 0%, #fffaf5 100%);
  border: 1.5px solid rgba(211, 47, 47, 0.15);
}

.mobile-ai-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 10px;
}

.mobile-result-badge {
  padding: 6px 14px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  border-radius: 8px;
  font-size: clamp(10px, 2.8vw, 12px);
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.25);
}

.mobile-btn-refresh {
  padding: 6px 12px;
  background: transparent;
  color: #7a8599;
  border: 1.5px solid #e5e9ef;
  border-radius: 8px;
  font-size: clamp(10px, 2.8vw, 12px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-btn-refresh:active {
  color: #d32f2f;
  border-color: #d32f2f;
  background: rgba(211, 47, 47, 0.05);
}

.mobile-ai-result-question {
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 14px;
}

.mobile-q-text {
  font-size: clamp(11px, 3vw, 13px);
  color: #1a2332;
  font-weight: 700;
  word-break: break-word;
  line-height: 1.5;
}

/* AI 步骤列表 - 移动端 */
.mobile-ai-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.mobile-ai-step-item {
  padding: 14px;
  background: white;
  border-radius: 12px;
  border: 1.5px solid #f5f5f5;
  transition: all 0.2s ease;
}

.mobile-ai-step-top {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.mobile-ai-step-index {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #d32f2f, #ff7043);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(12px, 3.5vw, 14px);
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(211, 47, 47, 0.25);
}

.mobile-ai-step-title {
  flex: 1;
  min-width: 0;
}

.mobile-ai-step-name {
  font-size: clamp(12px, 3.5vw, 15px);
  color: #1a2332;
  margin: 0 0 3px 0;
  font-weight: 700;
  word-break: break-word;
  line-height: 1.35;
}

.mobile-ai-step-meta {
  font-size: clamp(10px, 2.8vw, 11px);
  color: #d32f2f;
  font-weight: 600;
  letter-spacing: 0.3px;
  word-break: break-word;
  line-height: 1.4;
}

.mobile-ai-step-desc {
  font-size: clamp(11px, 3vw, 13px);
  color: #5a6478;
  line-height: 1.65;
  margin: 0 0 10px 0;
  word-break: break-word;
}

/* 时间/门票 - 移动端 */
.mobile-time-ticket-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.mobile-time-ticket-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.mobile-time-ticket-item span:first-child {
  font-size: clamp(12px, 3.5vw, 14px);
  flex-shrink: 0;
  margin-top: 0;
}

.mobile-item-value {
  font-size: clamp(10px, 2.8vw, 12px);
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

/* 附近餐饮/拍照点 - 移动端 */
.mobile-food-photo-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.mobile-food-photo-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid;
}

.mobile-food-photo-item.mobile-food-item {
  background: #fffbf5;
  border-color: #ffe0b2;
}

.mobile-food-photo-item.mobile-photo-item {
  background: #fdf7ff;
  border-color: #e1bee7;
}

.mobile-food-photo-item span:first-child {
  font-size: clamp(12px, 3.5vw, 14px);
  flex-shrink: 0;
}

/* 交通路线 - 移动端 */
.mobile-ai-step-transit {
  margin-top: 10px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fff8f5, #fff3eb);
  border-left: 2.5px solid #ff9800;
  border-radius: 8px;
}

.mobile-transit-head {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.mobile-transit-icon {
  font-size: clamp(12px, 3.5vw, 14px);
}

.mobile-transit-label {
  font-size: clamp(9px, 2.5vw, 11px);
  color: #e65100;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.mobile-transit-text {
  font-size: clamp(11px, 3vw, 13px);
  color: #5d4037;
  font-weight: 600;
  word-break: break-word;
  line-height: 1.45;
}

.mobile-transit-hint {
  margin-top: 4px;
  padding-left: 0;
}

.mobile-transit-hint span {
  font-size: clamp(10px, 2.8vw, 12px);
  color: #795548;
  line-height: 1.55;
  word-break: break-word;
}

.mobile-transit-meta {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.mobile-transit-meta span {
  font-size: clamp(9px, 2.5vw, 11px);
  color: #777;
  background: rgba(255, 152, 0, 0.12);
  padding: 3px 6px;
  border-radius: 4px;
  word-break: break-word;
}

/* AI 原始内容 - 移动端 */
.mobile-ai-raw-content {
  background: #f8fafc;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.mobile-ai-raw-text {
  font-size: clamp(11px, 3vw, 13px);
  color: #5a6478;
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* AI 摘要 - 移动端 */
.mobile-ai-summary {
  background: linear-gradient(135deg, #fff8e1, #ffe9d9);
  padding: 14px;
  border-radius: 10px;
  border-left: 3px solid #ff9800;
}

.mobile-summary-title {
  font-size: clamp(11px, 3.2vw, 13px);
  color: #8a6d00;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.mobile-summary-list {
  margin: 0;
  padding-left: 18px;
}

.mobile-summary-list li {
  font-size: clamp(10px, 2.8vw, 12px);
  color: #5d4e00;
  line-height: 1.7;
  margin-bottom: 3px;
  word-break: break-word;
}

/* ==============================
   弹窗 - 通用（PC + 移动端适配）
   ============================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 26, 43, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: white;
  border-radius: 24px;
  max-width: 580px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { transform: translateY(60px) scale(0.92); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-image {
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, var(--accent-color), #ff7043);
  overflow: hidden;
}

.modal-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15), transparent 50%);
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 1;
}

.modal-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.placeholder-badge {
  padding: 14px 32px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--accent-color);
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-category {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  color: var(--accent-color);
  padding: 8px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #1a2332;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
  z-index: 2;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.modal-close:hover {
  background: #d32f2f;
  color: white;
  transform: rotate(90deg) scale(1.1);
}

.modal-close:active {
  background: #b71c1c;
  color: white;
  transform: scale(0.95);
}

.modal-body {
  padding: 32px 36px;
}

.modal-title {
  font-size: 28px;
  color: #1a2332;
  margin: 0 0 12px 0;
  font-weight: 800;
  word-break: break-word;
  line-height: 1.3;
}

.modal-place {
  color: #7a8599;
  font-size: 15px;
  margin-bottom: 22px;
  font-weight: 500;
}

.modal-desc {
  font-size: 15px;
  color: #5a6478;
  line-height: 1.9;
  margin: 0 0 24px 0;
  word-break: break-word;
}

.modal-history {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  padding: 18px 20px;
  border-radius: 14px;
  margin-bottom: 22px;
  border-left: 4px solid #ff9800;
  position: relative;
  overflow: hidden;
}

.modal-history::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: modalSweep 4s ease-in-out infinite;
}

@keyframes modalSweep {
  0% { left: -100%; }
  50%, 100% { left: 200%; }
}

.history-label {
  font-size: 13px;
  color: #8a6d00;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

.history-text {
  font-size: 14px;
  color: #5d4e00;
  line-height: 1.8;
  position: relative;
  z-index: 1;
  word-break: break-word;
}

.modal-highlights {
  margin-bottom: 24px;
}

.highlights-label {
  font-size: 13px;
  font-weight: 700;
  color: #7a8599;
  margin-bottom: 14px;
  letter-spacing: 0.5px;
}

.highlights-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.highlight-item {
  font-size: 13px;
  color: var(--accent-color);
  background: color-mix(in srgb, var(--accent-color) 10%, transparent);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  word-break: break-word;
}

.highlight-item:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--accent-color) 20%, transparent);
}

.highlight-item:active {
  transform: translateY(0);
}

.modal-note-box {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  padding: 20px;
  border-radius: 14px;
  border-left: 4px solid #4caf50;
}

.modal-note-box .note-label {
  font-size: 13px;
  color: #2e7d32;
  font-weight: 700;
  margin-bottom: 10px;
}

.modal-note-box .note-content {
  font-size: 15px;
  color: #1b5e20;
  line-height: 1.7;
  margin-bottom: 10px;
  word-break: break-word;
}

.modal-note-box .note-time {
  font-size: 12px;
  color: #558b2f;
  font-weight: 500;
}

.modal-note-input {
  background: #f8fafc;
  padding: 20px;
  border-radius: 14px;
}

.modal-note-input .note-label {
  font-size: 13px;
  color: #5a6478;
  font-weight: 700;
  margin-bottom: 12px;
}

.note-input {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  color: #1a2332;
  font-family: inherit;
  resize: vertical;
  background: white;
  transition: all 0.3s ease;
  line-height: 1.7;
}

.note-input:focus {
  outline: none;
  border-color: #d32f2f;
  box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.1);
}

.modal-footer {
  padding: 24px 36px 36px;
}

.btn-checkin {
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(211, 47, 47, 0.35);
  position: relative;
  overflow: hidden;
}

.btn-checkin::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btnShine 2.5s ease-in-out infinite;
}

@keyframes btnShine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.btn-checkin:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.5);
}

.btn-checkin:active {
  transform: translateY(0);
  background: linear-gradient(135deg, #b71c1c, #a61b1b);
}

.btn-checked {
  width: 100%;
  padding: 16px 32px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: not-allowed;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.35);
}

/* 弹窗 - 移动端适配 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
    background: rgba(15, 26, 43, 0.85);
  }

  .modal-card {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.3);
    animation: slideUpMobile 0.35s ease-out;
  }

  @keyframes slideUpMobile {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-image {
    aspect-ratio: 16 / 10;
  }

  .modal-category {
    top: 14px;
    left: 14px;
    padding: 6px 14px;
    font-size: clamp(10px, 2.8vw, 12px);
    border-radius: 8px;
  }

  .modal-close {
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    font-size: 24px;
  }

  .modal-body {
    padding: 20px 18px;
  }

  .modal-title {
    font-size: clamp(18px, 5.5vw, 22px);
    margin-bottom: 10px;
  }

  .modal-place {
    font-size: clamp(12px, 3.5vw, 14px);
    margin-bottom: 16px;
  }

  .modal-desc {
    font-size: clamp(12px, 3.5vw, 14px);
    line-height: 1.75;
    margin-bottom: 18px;
  }

  .modal-history {
    padding: 14px 16px;
    margin-bottom: 18px;
    border-radius: 12px;
    border-left-width: 3px;
  }

  .history-label {
    font-size: clamp(11px, 3vw, 13px);
    margin-bottom: 6px;
  }

  .history-text {
    font-size: clamp(11px, 3.2vw, 13px);
    line-height: 1.7;
  }

  .modal-highlights {
    margin-bottom: 18px;
  }

  .highlights-label {
    font-size: clamp(11px, 3vw, 13px);
    margin-bottom: 10px;
  }

  .highlights-list {
    gap: 8px;
  }

  .highlight-item {
    font-size: clamp(11px, 3vw, 13px);
    padding: 6px 12px;
    border-radius: 16px;
  }

  .modal-note-box {
    padding: 14px 16px;
    border-radius: 12px;
  }

  .modal-note-box .note-label {
    font-size: clamp(11px, 3vw, 13px);
    margin-bottom: 8px;
  }

  .modal-note-box .note-content {
    font-size: clamp(12px, 3.5vw, 14px);
    line-height: 1.6;
  }

  .modal-note-box .note-time {
    font-size: clamp(10px, 2.8vw, 12px);
  }

  .modal-note-input {
    padding: 14px 16px;
    border-radius: 12px;
  }

  .modal-note-input .note-label {
    font-size: clamp(11px, 3vw, 13px);
    margin-bottom: 10px;
  }

  .note-input {
    padding: 12px 14px;
    font-size: clamp(12px, 3.5vw, 14px);
    border-radius: 10px;
    line-height: 1.65;
  }

  .modal-footer {
    padding: 16px 18px 28px;
  }

  .btn-checkin,
  .btn-checked {
    padding: 14px 24px;
    font-size: clamp(13px, 3.8vw, 15px);
    border-radius: 12px;
  }

  .btn-checkin:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 480px) {
  .modal-card {
    max-height: 95vh;
  }

  .modal-image {
    aspect-ratio: 16 / 9;
  }

  .modal-body {
    padding: 16px 14px;
  }

  .modal-footer {
    padding: 14px 14px 22px;
  }

  .modal-history {
    padding: 12px 14px;
  }

  .modal-note-box,
  .modal-note-input {
    padding: 12px 14px;
  }
}
</style>