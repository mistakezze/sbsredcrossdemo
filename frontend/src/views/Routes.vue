<template>
  <div class="routes-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-badge">路线推荐</div>
      <h1 class="page-title">上海红十字地点游览路线</h1>
      <p class="page-subtitle">从博物馆到救灾中心，从医疗机构到国际代表处，循着先驱者的足迹，探索上海这座红十字之城。</p>
    </div>

    <!-- ==============================
         Tab 切换：固定推荐 / AI推荐
         ============================== -->
    <div class="tabs-wrap">
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'fixed' }"
          @click="switchTab('fixed')"
        >
          <span class="tab-icon">📋</span>
          <span class="tab-text">固定路线推荐</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'ai' }"
          @click="switchTab('ai')"
        >
          <span class="tab-icon">✨</span>
          <span class="tab-text">AI 智能推荐</span>
        </button>
      </div>
    </div>

    <!-- ==============================
         Tab 1：固定路线推荐（保留原逻辑）
         ============================== -->
    <div v-if="currentTab === 'fixed'" class="tab-content tab-fixed">
      <div class="locations-list">
        <div
          v-for="(loc, index) in sortedLocations"
          :key="loc.id"
          class="loc-card"
          :class="{ 'loc-checked': hasCheckedIn(loc.id) }"
          @click="openModal(loc)"
        >
          <div class="loc-number">{{ index + 1 }}</div>
          <div class="loc-icon">
            <div class="cross-outer">
              <div class="cross-h"></div>
              <div class="cross-v"></div>
            </div>
          </div>
          <div class="loc-info">
            <h3 class="loc-name">{{ loc.name }}</h3>
            <div class="loc-meta">{{ loc.location }} · {{ loc.category }}</div>
            <p class="loc-desc">{{ loc.description }}</p>
            <div class="loc-tags">
              <span v-for="tag in loc.highlights" :key="tag" class="loc-tag">{{ tag }}</span>
            </div>
          </div>
          <div class="loc-status">
            <span v-if="hasCheckedIn(loc.id)" class="status-done">✓ 已打卡</span>
            <span v-else class="status-todo">点击打卡 →</span>
          </div>
        </div>
      </div>

      <!-- 路线说明 -->
      <div class="route-info">
        <div class="info-title">📋 推荐游览顺序</div>
        <div class="info-steps">
          <div
            v-for="(loc, index) in sortedLocations"
            :key="loc.id"
            class="step-item"
            :class="{ 'step-checked': hasCheckedIn(loc.id) }"
            @click="openModal(loc)"
          >
            <div class="step-number" :style="{ background: hasCheckedIn(loc.id) ? '#4caf50' : '#d32f2f' }">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-name">{{ loc.name }}</div>
              <div class="step-place">{{ loc.location }} · {{ loc.category }}</div>
            </div>
            <div class="step-status">{{ hasCheckedIn(loc.id) ? '✓ 已打卡' : '点击打卡' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==============================
         Tab 2：AI 智能推荐
         ============================== -->
    <div v-else-if="currentTab === 'ai'" class="tab-content tab-ai">

      <!-- 预设问题区域 -->
      <div class="ai-card ai-question-card">
        <div class="ai-card-header">
          <div class="ai-icon">🤖</div>
          <div class="ai-header-text">
            <h3 class="ai-title">选择你感兴趣的方向</h3>
            <p class="ai-subtitle">从下方预设问题中选一个，AI 将为你智能生成个性化游览路线</p>
          </div>
        </div>

        <div class="preset-questions">
          <div
            v-for="(q, idx) in presetQuestions"
            :key="idx"
            class="preset-item"
            :class="{ selected: selectedQuestion === q.label, loading: aiLoading && selectedQuestion === q.label }"
            @click="selectAndAsk(q)"
          >
            <span class="preset-emoji">{{ q.emoji }}</span>
            <span class="preset-label">{{ q.label }}</span>
            <span v-if="aiLoading && selectedQuestion === q.label" class="preset-spinner"></span>
          </div>
        </div>

        <!-- 自定义提问区 -->
        <div class="custom-ask">
          <div class="custom-ask-label">
            <span class="ask-emoji">💬</span>
            <span>或直接描述您的需求，AI 将为您量身规划</span>
          </div>
          <div class="custom-ask-input">
            <textarea
              v-model="customQuestion"
              class="ask-textarea"
              rows="2"
              placeholder="例如：我上午 9 点从虹桥火车站出发，想在下午 3 点前游览 3 个最有故事感的红十字地点，帮忙安排路线和交通"
              @keydown.enter.ctrl="submitCustom"
            ></textarea>
            <button
              class="btn-ask-submit"
              :disabled="aiLoading || !customQuestion.trim()"
              @click="submitCustom"
            >
              <span v-if="aiLoading && isCustomAsk" class="submit-spinner"></span>
              <span v-else class="submit-arrow">➤</span>
              <span class="submit-text">{{ aiLoading && isCustomAsk ? '生成中...' : '生成路线' }}</span>
            </button>
          </div>
          <div class="custom-ask-tip">
            小提示：Ctrl + Enter 快捷提交 · 可告诉 AI 您的起点、时间、兴趣偏好等
          </div>
        </div>
      </div>

      <!-- AI 回答结果区域 -->
      <div v-if="aiAnswer" class="ai-card ai-result-card">
        <div class="ai-result-header">
          <span class="result-badge">✨ AI 推荐路线</span>
          <button class="btn-refresh" @click="clearAnswer">清空重新生成</button>
        </div>

        <div class="ai-result-question">
          <span class="q-label">您的问题：</span>
          <span class="q-text">{{ aiAnswer.question }}</span>
        </div>

        <!-- 信息来源/免责提示 -->
        <div class="ai-disclaimer">
          <span class="disclaimer-icon">⚠️</span>
          <span class="disclaimer-text">路线中的交通方式由 AI 基于地点所在行政区推断生成，仅作游览参考。实际出行请以地图导航（高德/百度地图）提供的实时线路为准。</span>
        </div>

        <!-- 路线步骤卡片（详细版） -->
        <div v-if="aiAnswer.steps && aiAnswer.steps.length > 0" class="ai-steps">
          <div
            v-for="(step, idx) in aiAnswer.steps"
            :key="idx"
            class="ai-step-item"
          >
            <div class="ai-step-index">{{ idx + 1 }}</div>
            <div class="ai-step-content">
              <h4 class="ai-step-name">{{ step.name }}</h4>
              <div class="ai-step-meta">{{ step.meta }}</div>
              <p class="ai-step-desc">{{ step.desc }}</p>

              <!-- 历史背景 -->
              <div v-if="step.history" class="ai-step-section history-section">
                <div class="section-label">📜 历史故事</div>
                <p class="section-text">{{ step.history }}</p>
              </div>

              <!-- 参观亮点 -->
              <div v-if="step.highlights && step.highlights.length > 0" class="ai-step-section highlights-section">
                <div class="section-label">⭐ 参观亮点</div>
                <ul class="highlights-list">
                  <li v-for="(h, hi) in step.highlights" :key="hi">{{ h }}</li>
                </ul>
              </div>

              <!-- 最佳时间 & 门票 -->
              <div class="time-ticket-row">
                <div v-if="step.best_time || step.bestTime" class="time-ticket-item">
                  <span class="item-icon">🕐</span>
                  <div class="item-content">
                    <div class="item-label">最佳时间</div>
                    <div class="item-value">{{ step.best_time || step.bestTime }}</div>
                  </div>
                </div>
                <div v-if="step.ticket" class="time-ticket-item">
                  <span class="item-icon">🎟️</span>
                  <div class="item-content">
                    <div class="item-label">门票预约</div>
                    <div class="item-value">{{ step.ticket }}</div>
                  </div>
                </div>
              </div>

              <!-- 附近餐饮 & 打卡点 -->
              <div class="food-photo-row">
                <div v-if="step.nearby_food || step.nearbyFood" class="food-photo-item food-item">
                  <span class="item-icon">🍜</span>
                  <div class="item-content">
                    <div class="item-label">附近餐饮</div>
                    <div class="item-value">{{ step.nearby_food || step.nearbyFood }}</div>
                  </div>
                </div>
                <div v-if="step.photo_spots && step.photo_spots.length > 0" class="food-photo-item photo-item">
                  <span class="item-icon">📷</span>
                  <div class="item-content">
                    <div class="item-label">拍照打卡点</div>
                    <div class="item-value">{{ step.photo_spots.join('、') }}</div>
                  </div>
                </div>
              </div>

              <!-- 实用贴士 -->
              <div v-if="step.practical_tips && step.practical_tips.length > 0" class="ai-step-section practical-section">
                <div class="section-label">💡 实用贴士</div>
                <ul class="practical-list">
                  <li v-for="(pt, pti) in step.practical_tips" :key="pti">{{ pt }}</li>
                </ul>
              </div>

              <!-- 快速贴士 chip -->
              <div v-if="step.tips" class="ai-step-tips">
                <span v-for="(tip, ti) in step.tips" :key="ti" class="step-chip">{{ tip }}</span>
              </div>

              <!-- 交通路线 -->
              <div v-if="step.transit" class="ai-step-transit">
                <div class="transit-head">
                  <span class="transit-icon" :class="`mode-${step.transit.mode}`">
                    {{ modeIcon(step.transit.mode) }}
                  </span>
                  <span class="transit-label">🚗 交通路线</span>
                  <span class="transit-text">{{ step.transit.from_prev || step.transit.fromPrev }}</span>
                </div>
                <div v-if="step.transit.route_hint || step.transit.routeHint" class="transit-hint">
                  <span class="hint-arrow">→</span>
                  <span class="hint-text">{{ step.transit.route_hint || step.transit.routeHint }}</span>
                </div>
                <div v-if="step.transit.cost || step.transit.duration" class="transit-meta">
                  <span v-if="step.transit.duration" class="transit-meta-item">⏱️ {{ step.transit.duration }}</span>
                  <span v-if="step.transit.cost" class="transit-meta-item">💰 {{ step.transit.cost }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 纯文本/Markdown 显示区（若 steps 为空） -->
        <div v-else class="ai-raw-content">
          <p class="ai-raw-text">{{ aiAnswer.raw }}</p>
        </div>

        <!-- 摘要/小贴士 -->
        <div v-if="aiAnswer.summary" class="ai-summary">
          <div class="summary-title">📝 路线要点</div>
          <ul class="summary-list">
            <li v-for="(s, i) in aiAnswer.summary" :key="i">{{ s }}</li>
          </ul>
        </div>
      </div>
    </div>

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

// 统一的 AI 提问入口：question 是用户的问题文本，isCustom 表明是否来自自定义输入
const askAI = async (question, isCustom) => {
  if (aiLoading.value) return
  selectedQuestion.value = question
  isCustomAsk.value = !!isCustom

  // 先清掉旧结果，显示 loading
  aiLoading.value = true
  aiAnswer.value = null

  // 准备请求体：问题 + 当前地点完整信息（由后端构造提示词和调用 DeepSeek）
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
      // 后端返回错误（如限流、服务器异常）
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

    // 后端返回的字段可能是 camelCase（fromPrev / routeHint），也可能是 snake_case（from_prev / route_hint）
    // 统一转换让模板能兼容所有格式
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
    // 网络错误（后端未启动等）：降级为本地 mock 路线，给出明确提示
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

// 本地 mock 路线生成（未配置 API Key 时用于演示）
const generateMockRoute = (question) => {
  const locs = locations.value
  const takeHalf = question.includes('半天') || question.includes('3-4小时') || question.includes('精华')
  const takeAll = question.includes('一天') || question.includes('完整') || question.includes('全部')
  const takeCount = takeHalf ? 4 : (takeAll ? locs.length : Math.min(5, locs.length))

  // 根据问题关键字简单重新排序，但不随机打乱
  const sortedLocs = [...locs]
  const isKids = question.includes('儿童') || question.includes('青少年')
  const isMuseum = question.includes('博物馆') || question.includes('历史') || question.includes('深度')
  const isMedical = question.includes('医疗') || question.includes('救助') || question.includes('感人')
  if (isKids) sortedLocs.sort((a, b) => (a.category === '青少年教育' ? -1 : 1))
  if (isMuseum) sortedLocs.sort((a, b) => (a.category === '博物馆' ? -1 : 1))
  if (isMedical) sortedLocs.sort((a, b) => (a.category === '医疗机构' ? -1 : 1))

  const picked = sortedLocs.slice(0, takeCount)

  // 基于地点所在行政区，生成合理的交通描述（不编造具体站名，只给出合理的通用描述）
  const transitByDistrict = (prevLoc, currLoc) => {
    if (!prevLoc) return {
      from_prev: '从您的出发点前往本地点',
      route_hint: '建议使用手机地图导航，输入地点名称即可规划最优路线',
      mode: 'subway',
      cost: '请以实际导航为准',
      duration: '请以实际导航为准',
    }

    // 从 location 字段中提取行政区（格式："上海市 · 徐汇区"）
    const getDist = (l) => {
      const parts = (l.location || '').split('·').map(s => s.trim())
      return parts[parts.length - 1] || '上海'
    }

    const prevDist = getDist(prevLoc)
    const currDist = getDist(currLoc)

    // 同一行政区 → 步行或公交
    if (prevDist === currDist) {
      return {
        from_prev: '步行约 10-15 分钟，或公交 2 站',
        route_hint: `两地点都位于${currDist}，沿主要道路步行或乘区内公交即可到达`,
        mode: 'walk',
      }
    }

    // 相邻行政区 → 地铁 + 短步行
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

    // 跨区（如浦东新区、闵行区与其他区）→ 地铁多站
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

    // 默认：跨区公交/地铁换乘
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
   页面头部
   ============================== */
.page-header {
  text-align: center;
}

.page-badge {
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

.page-title {
  font-size: 46px;
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

.page-subtitle {
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

/* ==============================
   Tab 切换
   ============================== */
.tabs-wrap {
  display: flex;
  justify-content: center;
}

.tabs {
  display: inline-flex;
  background: white;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(26, 35, 50, 0.08);
  gap: 6px;
}

.tab-btn {
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

.tab-btn:hover {
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.05);
}

.tab-btn.active {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.35);
  animation: tabActive 0.3s ease-out;
}

@keyframes tabActive {
  from { transform: scale(0.96); }
  to { transform: scale(1); }
}

.tab-icon {
  font-size: 17px;
}

.tab-content {
  animation: tabContentFadeIn 0.45s ease-out;
}

@keyframes tabContentFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==============================
   固定路线 - 列表
   ============================== */
.locations-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loc-card {
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

.loc-card::before {
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

.loc-card::after {
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

.loc-card:nth-child(1) { animation-delay: 0.05s; }
.loc-card:nth-child(2) { animation-delay: 0.15s; }
.loc-card:nth-child(3) { animation-delay: 0.25s; }
.loc-card:nth-child(4) { animation-delay: 0.35s; }
.loc-card:nth-child(5) { animation-delay: 0.45s; }
.loc-card:nth-child(6) { animation-delay: 0.55s; }
.loc-card:nth-child(7) { animation-delay: 0.65s; }
.loc-card:nth-child(8) { animation-delay: 0.75s; }

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

.loc-card:hover {
  transform: translateX(8px);
  border-color: #ff7043;
  box-shadow: 0 12px 40px rgba(255, 112, 67, 0.18);
}

.loc-card:hover::before {
  width: 8px;
}

.loc-card:hover::after {
  width: 180px;
  height: 180px;
}

.loc-card.loc-checked {
  border-color: #c8e6c9;
  background: linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%);
}

.loc-card.loc-checked::before {
  background: linear-gradient(180deg, #4caf50, #81c784);
}

.loc-card.loc-checked:hover {
  border-color: #4caf50;
  box-shadow: 0 12px 40px rgba(76, 175, 80, 0.22);
}

/* 序号 */
.loc-number {
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

.loc-card:hover .loc-number {
  transform: rotate(-8deg) scale(1.1);
  box-shadow: 0 10px 24px rgba(211, 47, 47, 0.45);
}

.loc-card.loc-checked .loc-number {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 6px 18px rgba(76, 175, 80, 0.3);
}

.loc-number::after {
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

.loc-card.loc-checked .loc-number::after {
  background: #81c784;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.35); opacity: 0.6; }
}

/* 红十字图标 */
.loc-icon {
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

.loc-card:hover .loc-icon {
  transform: rotate(5deg) scale(1.08);
  background: linear-gradient(135deg, #ffe0e0, #ffcccc);
}

.cross-outer {
  width: 50px;
  height: 50px;
  position: relative;
  animation: crossBreath 3s ease-in-out infinite;
}

.cross-h, .cross-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.3);
  transition: all 0.3s ease;
}

.cross-h {
  width: 42px;
  height: 12px;
  transform: translate(-50%, -50%);
}

.cross-v {
  width: 12px;
  height: 42px;
  transform: translate(-50%, -50%);
}

.loc-card:hover .cross-h,
.loc-card:hover .cross-v {
  background: linear-gradient(135deg, #ff7043, #d32f2f);
  box-shadow: 0 4px 14px rgba(255, 112, 67, 0.5);
}

@keyframes crossBreath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.loc-card.loc-checked .cross-h,
.loc-card.loc-checked .cross-v {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

/* 卡片信息内容 */
.loc-info {
  flex: 1;
  min-width: 0;
}

.loc-name {
  font-size: 22px;
  color: #1a2332;
  margin: 0 0 8px 0;
  font-weight: 700;
  transition: color 0.3s ease;
}

.loc-card:hover .loc-name {
  color: #d32f2f;
}

.loc-card.loc-checked:hover .loc-name {
  color: #4caf50;
}

.loc-meta {
  font-size: 13px;
  color: #7a8599;
  margin-bottom: 12px;
  font-weight: 500;
}

.loc-desc {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0 0 16px 0;
}

.loc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loc-tag {
  font-size: 12px;
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.loc-card:hover .loc-tag {
  background: rgba(211, 47, 47, 0.18);
  transform: translateY(-1px);
}

.loc-card.loc-checked .loc-tag {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.12);
}

.loc-card.loc-checked:hover .loc-tag {
  background: rgba(76, 175, 80, 0.22);
}

/* 状态标签 */
.loc-status {
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

.status-todo {
  color: #ff7043;
  background: linear-gradient(135deg, rgba(255, 112, 67, 0.1), rgba(255, 112, 67, 0.05));
  border: 2px solid rgba(255, 112, 67, 0.3);
}

.loc-card:hover .status-todo {
  background: linear-gradient(135deg, #ff7043, #d32f2f);
  color: white;
  transform: translateX(4px);
  box-shadow: 0 6px 16px rgba(255, 112, 67, 0.35);
}

.status-done {
  color: white;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 4px 14px rgba(76, 175, 80, 0.35);
  animation: checkedGlow 2.5s ease-in-out infinite;
}

@keyframes checkedGlow {
  0%, 100% { box-shadow: 0 4px 14px rgba(76, 175, 80, 0.35); }
  50% { box-shadow: 0 6px 22px rgba(76, 175, 80, 0.6); }
}

/* ==============================
   路线说明区块
   ============================== */
.route-info {
  background: white;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 4px 24px rgba(26, 35, 50, 0.08);
  position: relative;
  overflow: hidden;
}

.route-info::before {
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

.info-title {
  font-size: 22px;
  font-weight: 800;
  color: #1a2332;
  text-align: center;
  margin-bottom: 26px;
  letter-spacing: 1px;
}

.info-steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.step-item {
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

.step-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(211, 47, 47, 0.15), transparent);
  transition: width 0.3s ease;
}

.step-item:hover {
  background: white;
  border-color: #d32f2f;
  transform: translateX(6px);
  box-shadow: 0 6px 20px rgba(211, 47, 47, 0.12);
}

.step-item:hover::before {
  width: 100%;
}

.step-item.step-checked {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(76, 175, 80, 0.03));
}

.step-item.step-checked:hover {
  border-color: #4caf50;
  background: white;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.15);
}

.step-number {
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

.step-item:hover .step-number {
  transform: rotate(360deg) scale(1.1);
}

.step-item.step-checked .step-number {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.step-content {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.step-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a2332;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.step-item:hover .step-name {
  color: #d32f2f;
}

.step-item.step-checked:hover .step-name {
  color: #4caf50;
}

.step-place {
  font-size: 12px;
  color: #7a8599;
}

.step-status {
  flex-shrink: 0;
  font-size: 13px;
  color: #d32f2f;
  font-weight: 600;
  transition: transform 0.3s ease;
  z-index: 1;
}

.step-item.step-checked .step-status {
  color: #4caf50;
}

.step-item:hover .step-status {
  transform: translateX(4px);
}

/* ==============================
   AI 推荐页面
   ============================== */
.ai-card {
  background: white;
  border-radius: 24px;
  padding: 36px;
  box-shadow: 0 4px 24px rgba(26, 35, 50, 0.08);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

/* 问题卡片头部 */
.ai-card-header {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;
}

.ai-icon {
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

.ai-header-text {
  flex: 1;
}

.ai-title {
  font-size: 22px;
  color: #1a2332;
  margin: 0 0 8px 0;
  font-weight: 800;
}

.ai-subtitle {
  font-size: 14px;
  color: #7a8599;
  margin: 0;
  line-height: 1.7;
}

/* 预设问题按钮 */
.preset-questions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.preset-item {
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

.preset-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.06), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preset-item:hover {
  transform: translateY(-3px);
  border-color: #d32f2f;
  background: white;
  box-shadow: 0 10px 28px rgba(211, 47, 47, 0.18);
}

.preset-item:hover::before {
  opacity: 1;
}

.preset-item.selected {
  border-color: #d32f2f;
  background: linear-gradient(135deg, #fff5f5, #ffecec);
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.2);
}

.preset-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.preset-emoji {
  font-size: 26px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.preset-item:hover .preset-emoji {
  transform: scale(1.25) rotate(-5deg);
}

.preset-label {
  font-size: 14px;
  color: #1a2332;
  font-weight: 600;
  line-height: 1.5;
  flex: 1;
}

.preset-item:hover .preset-label {
  color: #d32f2f;
}

.preset-spinner {
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

/* 提示 */
.custom-ask {
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

.custom-ask-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #5d4037;
}

.ask-emoji {
  font-size: 18px;
}

.custom-ask-input {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.ask-textarea {
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

.ask-textarea::placeholder {
  color: #bca89a;
}

.ask-textarea:focus {
  border-color: #d32f2f;
  box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.08);
  background: #fffaf5;
}

.btn-ask-submit {
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

.btn-ask-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #c62828, #a61b1b);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(211, 47, 47, 0.35);
}

.btn-ask-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-ask-submit:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-arrow {
  font-size: 14px;
  line-height: 1;
}

.submit-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spinSpin 0.8s linear infinite;
}

.submit-text {
  font-size: 14px;
}

.custom-ask-tip {
  margin-top: 10px;
  padding-left: 2px;
  font-size: 12px;
  color: #a1887f;
  line-height: 1.6;
}

.ai-hint {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  padding: 16px 20px;
  border-radius: 12px;
  border-left: 4px solid #ff9800;
  font-size: 13px;
  color: #8a6d00;
  line-height: 1.7;
}

.ai-hint code {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #d32f2f;
  font-weight: 600;
}

/* AI 结果卡片 */
.ai-result-card {
  background: linear-gradient(135deg, #ffffff 0%, #fffaf5 100%);
  border: 2px solid rgba(211, 47, 47, 0.15);
}

.ai-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.result-badge {
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

.btn-refresh {
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

.btn-refresh:hover {
  color: #d32f2f;
  border-color: #d32f2f;
  background: rgba(211, 47, 47, 0.05);
}

.ai-result-question {
  background: #f8fafc;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.q-label {
  font-size: 13px;
  color: #7a8599;
  font-weight: 600;
}

.q-text {
  font-size: 14px;
  color: #1a2332;
  font-weight: 700;
}

/* AI 结果免责提示 */
.ai-disclaimer {
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

.disclaimer-icon {
  font-size: 16px;
  flex-shrink: 0;
  line-height: 1.7;
}

.disclaimer-text {
  flex: 1;
}

/* AI 步骤列表 */
.ai-steps {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 24px;
}

.ai-step-item {
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

.ai-step-item:nth-child(1) { animation-delay: 0.05s; }
.ai-step-item:nth-child(2) { animation-delay: 0.15s; }
.ai-step-item:nth-child(3) { animation-delay: 0.25s; }
.ai-step-item:nth-child(4) { animation-delay: 0.35s; }
.ai-step-item:nth-child(5) { animation-delay: 0.45s; }
.ai-step-item:nth-child(6) { animation-delay: 0.55s; }

@keyframes stepSlideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.ai-step-item:hover {
  border-color: #d32f2f;
  transform: translateX(4px);
  box-shadow: 0 10px 28px rgba(211, 47, 47, 0.15);
}

.ai-step-index {
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

.ai-step-content {
  flex: 1;
  min-width: 0;
}

.ai-step-name {
  font-size: 17px;
  color: #1a2332;
  margin: 0 0 6px 0;
  font-weight: 700;
  transition: color 0.3s ease;
}

.ai-step-item:hover .ai-step-name {
  color: #d32f2f;
}

.ai-step-meta {
  font-size: 12px;
  color: #d32f2f;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.ai-step-desc {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0 0 14px 0;
}

/* 通用区块样式 */
.ai-step-section {
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  animation: sectionIn 0.4s ease-out backwards;
}
@keyframes sectionIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.section-label {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}
.section-text {
  font-size: 13px;
  color: #555;
  line-height: 1.7;
  margin: 0;
}
.highlights-list, .practical-list {
  margin: 0;
  padding-left: 20px;
}
.highlights-list li, .practical-list li {
  font-size: 13px;
  color: #444;
  line-height: 1.7;
  margin-bottom: 4px;
}

/* 历史故事 - 米色背景 */
.history-section {
  background: linear-gradient(135deg, #fffdf5, #fff8e1);
  border-left: 3px solid #d4a017;
}
/* 参观亮点 - 淡蓝背景 */
.highlights-section {
  background: linear-gradient(135deg, #f0f7ff, #e3f2fd);
  border-left: 3px solid #1976d2;
}
/* 实用贴士 - 淡绿背景 */
.practical-section {
  background: linear-gradient(135deg, #f1fff5, #e8f5e9);
  border-left: 3px solid #388e3c;
}
.history-section .section-label { color: #b8860b; }
.highlights-section .section-label { color: #1565c0; }
.practical-section .section-label { color: #2e7d32; }

/* 最佳时间 & 门票 同行 */
.time-ticket-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.time-ticket-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #eee;
}
.item-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}
.item-content {
  flex: 1;
  min-width: 0;
}
.item-label {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
}
.item-value {
  font-size: 12.5px;
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

/* 附近餐饮 & 打卡点 同行 */
.food-photo-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.food-photo-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid;
}
.food-item {
  background: #fffbf5;
  border-color: #ffe0b2;
}
.photo-item {
  background: #fdf7ff;
  border-color: #e1bee7;
}

/* 交通费用/时间元信息 */
.transit-meta {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.transit-meta-item {
  font-size: 12px;
  color: #777;
  background: rgba(255,152,0,0.1);
  padding: 3px 8px;
  border-radius: 6px;
}

.ai-step-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.step-chip {
  font-size: 12px;
  padding: 5px 12px;
  background: rgba(211, 47, 47, 0.08);
  color: #d32f2f;
  border-radius: 20px;
  font-weight: 500;
}

/* 交通路线展示 */
.ai-step-transit {
  margin-top: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fff8f5, #fff3eb);
  border-left: 3px solid #ff9800;
  border-radius: 10px;
  animation: transitIn 0.4s ease-out backwards;
}

.ai-step-item:nth-child(1) .ai-step-transit { animation-delay: 0.15s; }
.ai-step-item:nth-child(2) .ai-step-transit { animation-delay: 0.25s; }
.ai-step-item:nth-child(3) .ai-step-transit { animation-delay: 0.35s; }
.ai-step-item:nth-child(4) .ai-step-transit { animation-delay: 0.45s; }
.ai-step-item:nth-child(5) .ai-step-transit { animation-delay: 0.55s; }
.ai-step-item:nth-child(6) .ai-step-transit { animation-delay: 0.65s; }

@keyframes transitIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

.transit-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.transit-icon {
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

.transit-icon.mode-walk { background: #e8f5e9; }
.transit-icon.mode-subway { background: #e3f2fd; }
.transit-icon.mode-bus { background: #fff3e0; }
.transit-icon.mode-taxi { background: #fff8c4; }

.transit-label {
  font-size: 12px;
  color: #e65100;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.transit-text {
  font-size: 13px;
  color: #5d4037;
  font-weight: 600;
}

.transit-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 4px;
  padding-left: 38px;
}

.hint-arrow {
  color: #ff9800;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}

.hint-text {
  font-size: 12px;
  color: #795548;
  line-height: 1.6;
}

/* 原始文本内容区 */
.ai-raw-content {
  background: #f8fafc;
  padding: 24px;
  border-radius: 14px;
  margin-bottom: 24px;
}

.ai-raw-text {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.9;
  margin: 0;
  white-space: pre-wrap;
}

/* 摘要 */
.ai-summary {
  background: linear-gradient(135deg, #fff8e1, #ffe9d9);
  padding: 22px 26px;
  border-radius: 16px;
  border-left: 5px solid #ff9800;
}

.summary-title {
  font-size: 15px;
  color: #8a6d00;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.summary-list {
  margin: 0;
  padding-left: 20px;
}

.summary-list li {
  font-size: 14px;
  color: #5d4e00;
  line-height: 1.8;
  margin-bottom: 4px;
}

/* ==============================
   弹窗
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

.modal-body {
  padding: 32px 36px;
}

.modal-title {
  font-size: 28px;
  color: #1a2332;
  margin: 0 0 12px 0;
  font-weight: 800;
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
}

.highlight-item:hover {
  transform: translateY(-2px);
  background: color-mix(in srgb, var(--accent-color) 20%, transparent);
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

/* ==============================
   响应式
   ============================== */
@media (max-width: 900px) {
  .info-steps { grid-template-columns: 1fr; }
  .preset-questions { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .page-title { font-size: 32px; }
  .loc-card {
    padding: 22px 20px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .loc-number { width: 44px; height: 44px; font-size: 20px; }
  .loc-icon { width: 60px; height: 60px; }
  .cross-outer { width: 42px; height: 42px; }
  .cross-h { width: 36px; height: 10px; }
  .cross-v { width: 10px; height: 36px; }
  .loc-name { font-size: 18px; }
  .route-info { padding: 26px 20px; }
  .modal-body { padding: 26px 24px; }
  .modal-footer { padding: 20px 24px 28px; }
  .modal-title { font-size: 22px; }
  .ai-card { padding: 24px 20px; }
  .ai-card-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .tab-btn { padding: 10px 18px; font-size: 14px; }
}

@media (max-width: 768px) {
  .page-title { font-size: 32px; }
  .page-subtitle { font-size: 14px; }
  .loc-card {
    padding: 20px 16px;
    gap: 14px;
    flex-wrap: wrap;
  }
  .loc-number { width: 40px; height: 40px; font-size: 18px; }
  .loc-icon { width: 56px; height: 56px; }
  .cross-outer { width: 40px; height: 40px; }
  .cross-h { width: 34px; height: 9px; }
  .cross-v { width: 9px; height: 34px; }
  .loc-name { font-size: 17px; }
  .loc-desc { font-size: 13px; margin-bottom: 12px; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
  .loc-tags { gap: 6px; }
  .loc-tag { font-size: 11px; padding: 4px 10px; }
  .loc-status { font-size: 12px; padding: 8px 14px; }
  .route-info { padding: 24px 16px; }
  .step-item { padding: 14px 16px; gap: 12px; }
  .step-number { width: 32px; height: 32px; font-size: 14px; }
  .step-name { font-size: 14px; }
  .step-place { font-size: 12px; }
  .modal-body { padding: 24px 18px; }
  .modal-footer { padding: 18px 18px 24px; }
  .modal-title { font-size: 22px; }
  .ai-card { padding: 20px 16px; }
  .ai-card-header { flex-direction: column; gap: 12px; align-items: flex-start; }
  .ai-title { font-size: 18px; }
  .ai-subtitle { font-size: 13px; }
  .tab-btn { padding: 10px 16px; font-size: 13px; }
  .tab-text { display: none; }
  .tabs-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tabs { min-width: max-content; }
  /* AI 步骤卡片移动端 */
  .ai-step-item { padding: 18px 16px; gap: 14px; }
  .ai-step-index { width: 38px; height: 38px; font-size: 18px; }
  .ai-step-name { font-size: 15px; }
  .ai-step-desc { font-size: 13px; }
  .preset-questions { grid-template-columns: 1fr; gap: 10px; }
  .preset-item { padding: 14px 16px; }
  .preset-label { font-size: 13px; }
  .preset-emoji { font-size: 22px; }
  /* 交通区块移动端 */
  .transit-head { gap: 8px; }
  .transit-text { font-size: 12px; }
  .transit-hint { flex-direction: column; gap: 4px; }
  .hint-arrow { display: none; }
  /* 实用贴士/亮点列表缩小 */
  .highlights-list li, .practical-list li { font-size: 12px; }
  .item-value { font-size: 12px; }
}

@media (max-width: 480px) {
  .tabs { width: 100%; }
  .tab-btn { flex: 1; justify-content: center; padding: 12px 14px; }
  .tab-text { display: inline; }
  .tab-icon { display: none; }
  .page-title { font-size: 26px; }
  /* 时间/门票、美食/拍照点 改为单列 */
  .time-ticket-row { grid-template-columns: 1fr; }
  .food-photo-row { grid-template-columns: 1fr; }
  /* 自定义提问区 */
  .custom-ask-input { flex-direction: column; }
  .btn-ask-submit { width: 100%; min-width: unset; padding: 14px; }
  .ask-textarea { min-height: 80px; }
  /* 步骤列表改为单列 */
  .info-steps { grid-template-columns: 1fr; }
  /* 统计卡片 */
  .header-stats-card { min-width: unset; padding: 20px 28px; }
  .stats-number { font-size: 36px; }
}

@media (max-width: 375px) {
  .loc-card { padding: 16px 14px; }
  .loc-icon { display: none; }
  .loc-name { font-size: 16px; }
  .loc-meta { font-size: 12px; }
  .page-title { font-size: 22px; }
  .ai-step-item { padding: 16px 14px; }
  .ai-step-meta { font-size: 11px; }
}
