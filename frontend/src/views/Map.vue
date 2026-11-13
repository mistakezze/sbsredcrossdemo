<template>
  <div class="map-page">
    <!-- ==============================
         页面头部
         ============================== -->
    <header v-if="!isMobile" class="pc-map-header">
      <div class="pc-header-text">
        <span class="pc-header-badge"><AppIcon name="map" size="13" /> 红十字地图</span>
        <h1 class="pc-header-title">上海红十字地点地图</h1>
        <p class="pc-header-desc">基于真实地理坐标，定位你身边的历史与现代红十字地点，一路打卡连线。</p>
      </div>
      <div class="pc-header-stats">
        <div class="pc-stat-card">
          <div class="pc-stat-value">{{ stats.all.done }}<span class="pc-stat-total">/{{ stats.all.total }}</span></div>
          <div class="pc-stat-label">全部打卡</div>
          <div class="pc-stat-bar"><span :style="{ width: percent(stats.all) }"></span></div>
        </div>
        <div class="pc-stat-card">
          <div class="pc-stat-value">{{ stats.history.done }}<span class="pc-stat-total">/{{ stats.history.total }}</span></div>
          <div class="pc-stat-label"><AppIcon name="historic" size="13" /> 历史地点</div>
          <div class="pc-stat-bar"><span :style="{ width: percent(stats.history) }"></span></div>
        </div>
        <div class="pc-stat-card">
          <div class="pc-stat-value">{{ stats.modern.done }}<span class="pc-stat-total">/{{ stats.modern.total }}</span></div>
          <div class="pc-stat-label"><AppIcon name="city" size="13" /> 现代地点</div>
          <div class="pc-stat-bar"><span :style="{ width: percent(stats.modern) }"></span></div>
        </div>
      </div>
    </header>

    <header v-else class="m-map-header">
      <span class="m-header-badge"><AppIcon name="map" size="13" /> 红十字地图</span>
      <h1 class="m-header-title">上海红十字地点地图</h1>
      <p class="m-header-desc">真实坐标定位 · 点亮每一处红十字足迹</p>
      <div class="m-header-stats">
        <div class="m-stat">
          <span class="m-stat-value">{{ stats.all.done }}<i>/{{ stats.all.total }}</i></span>
          <span class="m-stat-label">全部</span>
        </div>
        <div class="m-stat">
          <span class="m-stat-value">{{ stats.history.done }}<i>/{{ stats.history.total }}</i></span>
          <span class="m-stat-label"><AppIcon name="historic" size="12" /> 历史</span>
        </div>
        <div class="m-stat">
          <span class="m-stat-value">{{ stats.modern.done }}<i>/{{ stats.modern.total }}</i></span>
          <span class="m-stat-label"><AppIcon name="city" size="12" /> 现代</span>
        </div>
      </div>
    </header>

    <!-- ==============================
         推荐地点（算法 / AI）
         ============================== -->
    <section class="reco-section" :class="{ 'is-mobile': isMobile }">
      <div class="reco-head">
        <div class="reco-head-left">
          <span class="reco-title">
            <AppIcon :name="aiMode ? 'sparkles' : 'robot'" size="15" />
            {{ aiMode ? 'AI 为你推荐' : '为你推荐' }}
          </span>
          <span class="reco-badge">{{ currentUser.name }}</span>
        </div>
        <div class="reco-head-actions">
          <span
            v-if="!aiMode"
            class="reco-formula"
            title="协同过滤：UserCF 在共同评价过的地点上找口味相近的访客，按其评分偏差加权预测；低秩模型则用隐因子重建评分矩阵。两者冷启动时整项退出，其余权重按比例归一化"
          >{{ recoFormula }}</span>
          <button
            v-if="!aiMode"
            class="reco-ai-btn"
            :disabled="aiLoading"
            @click="askAIRecommend"
          >
            <AppIcon :name="aiLoading ? 'clock' : 'sparkles'" size="14" />
            {{ aiLoading ? '生成中' : 'AI 推荐' }}
          </button>
          <button v-else class="reco-ai-btn ghost" @click="exitAIMode">
            <AppIcon name="arrowLeft" size="14" /> 算法推荐
          </button>
        </div>
      </div>

      <!-- AI 模式 -->
      <div v-if="aiMode" class="ai-zone">
        <div v-if="aiLoading" class="ai-loading">
          <span class="ai-orb"></span>
          <div class="ai-loading-text">
            <span class="ai-loading-title">AI 正在根据你的足迹挑选地点</span>
            <ul class="ai-steps">
              <li
                v-for="(s, i) in AI_STEPS"
                :key="i"
                class="ai-step"
                :class="{ done: i < aiStepIndex, active: i === aiStepIndex }"
              >
                <span class="ai-step-dot"></span>{{ s }}
              </li>
            </ul>
          </div>
        </div>

        <div v-else-if="aiResult" class="ai-body">
          <p v-if="aiResult.summary" class="ai-summary">{{ aiResult.summary }}</p>
          <div class="ai-cards" :class="{ 'is-mobile': isMobile }">
            <button
              v-for="(r, i) in aiResult.recommendations"
              :key="i"
              class="ai-card"
              @click="openByName(r.name)"
            >
              <div class="ai-card-head">
                <span class="ai-card-index">{{ i + 1 }}</span>
                <span class="ai-card-name">{{ r.name }}</span>
                <span v-if="r.category" class="ai-card-cat">{{ r.category }}</span>
              </div>
              <p class="ai-card-reason">{{ r.reason }}</p>
              <div class="ai-card-meta">
                <span v-if="r.highlight" class="ai-meta-item"><AppIcon name="target" size="12" /> {{ r.highlight }}</span>
                <span v-if="r.bestTime" class="ai-meta-item"><AppIcon name="clock" size="12" /> {{ r.bestTime }}</span>
                <span v-if="r.tip" class="ai-meta-item"><AppIcon name="lightbulb" size="12" /> {{ r.tip }}</span>
              </div>
            </button>
          </div>
        </div>

        <div v-else-if="aiError" class="ai-error">
          <AppIcon name="alert" size="14" /> {{ aiError }}
          <button class="ai-retry" @click="askAIRecommend">重试</button>
        </div>
      </div>

      <!-- 算法模式 -->
      <div v-else class="reco-list" :class="{ 'is-mobile': isMobile }">
        <button
          v-for="item in recommendations"
          :key="item.location.id"
          class="reco-card"
          :class="{ 'is-checked': hasCheckedIn(item.location.id) }"
          @click="openLocation(item.location)"
        >
          <div class="reco-card-top">
            <span class="reco-name">{{ item.location.name }}</span>
            <span class="reco-score">{{ item.score }}</span>
          </div>
          <div class="reco-meta">
            <span class="reco-era" :class="'era-' + item.location.era">
              {{ ERAS[item.location.era].short }}
            </span>
            <span class="reco-category">{{ item.location.category }}</span>
            <span v-if="item.reviewCount" class="reco-rating"><AppIcon name="starFill" size="11" /> {{ item.avg.toFixed(1) }}</span>
          </div>
          <div class="reco-reasons">
            <span v-for="(r, i) in item.reasons" :key="i" class="reco-reason">{{ r }}</span>
          </div>
        </button>
      </div>

      <p v-if="!aiMode && (recoSignals.userCF || recoSignals.latent)" class="reco-foot">
        <span v-if="recoSignals.userCF">
          <AppIcon name="users" size="12" /> UserCF：{{ userCFModel.neighborCount }} 位最近邻居（{{ neighborSummary }}）
        </span>
        <span v-if="recoSignals.userCF && recoSignals.latent"> · </span>
        <span v-if="recoSignals.latent">
          <AppIcon name="calculator" size="12" /> 低秩：{{ lowRankModel.userCount }} 位访客 × {{ locations.length }} 个地点，秩 k={{ lowRankModel.rank }}，RMSE {{ lowRankModel.rmse }}
        </span>
      </p>
    </section>

    <!-- ==============================
         工具栏（筛选 / 定位 / 排序）
         ============================== -->
    <div class="map-toolbar" :class="{ 'is-mobile': isMobile }">
      <div class="toolbar-filters">
        <button
          v-for="f in eraFilters"
          :key="f.key"
          class="filter-btn"
          :class="{ active: activeEra === f.key }"
          @click="activeEra = f.key"
        >
          <span><AppIcon :name="f.icon" size="14" /> {{ f.label }}</span>
          <span class="filter-count">{{ f.count }}</span>
        </button>
      </div>
      <div class="toolbar-actions">
        <button
          class="action-btn"
          :class="{ active: !!userLocation, busy: locating }"
          :disabled="locating"
          @click="locateMe"
        >
          <AppIcon :name="locating ? 'clock' : userLocation ? 'navigation' : 'target'" size="14" />
          {{ locating ? '定位中' : userLocation ? '已定位' : '我的位置' }}
        </button>
        <button
          v-if="userLocation"
          class="action-btn"
          :class="{ active: sortMode === 'distance' }"
          @click="toggleSort"
        >
          <AppIcon name="upDown" size="14" /> 距离排序
        </button>
        <button class="action-btn" @click="fitAll"><AppIcon name="map" size="14" /> 全部地点</button>
        <button v-if="can('uploadLocation')" class="action-btn" @click="goPlaces">
          <AppIcon name="building" size="14" /> 地点管理
        </button>
      </div>
    </div>

    <div v-if="locError" class="map-error"><AppIcon name="alert" size="14" /> {{ locError }}</div>

    <!-- ==============================
         地图 + 列表
         ============================== -->
    <div class="map-layout" :class="isMobile ? 'layout-mobile' : 'layout-pc'">
      <div class="map-stage">
        <div ref="mapEl" class="map-leaflet" :class="{ 'is-mobile': isMobile }"></div>
        <div class="map-legend">
          <span class="legend-item"><i class="legend-dot history"></i> 历史地点</span>
          <span class="legend-item"><i class="legend-dot modern"></i> 现代地点</span>
          <span class="legend-item"><i class="legend-dot checked"></i> 已打卡</span>
          <span v-if="userLocation" class="legend-item"><i class="legend-dot me"></i> 我的位置</span>
        </div>
      </div>

      <!-- PC 侧边列表 -->
      <aside v-if="!isMobile" class="pc-map-side">
        <div class="pc-side-head">
          <span class="pc-side-title">地点列表</span>
          <span class="pc-side-count">{{ sortedLocations.length }} 处</span>
        </div>
        <div class="pc-side-list">
          <button
            v-for="(loc, idx) in sortedLocations"
            :key="loc.id"
            class="pc-side-item"
            :class="{ 'is-checked': hasCheckedIn(loc.id), 'is-active': selectedLoc && selectedLoc.id === loc.id }"
            @click="openLocation(loc)"
          >
            <span class="pc-side-index" :style="{ background: hasCheckedIn(loc.id) ? '#4caf50' : loc.color }">{{ idx + 1 }}</span>
            <span class="pc-side-body">
              <span class="pc-side-name">{{ loc.name }}</span>
              <span class="pc-side-meta">
                <span class="pc-side-era" :class="'era-' + loc.era">{{ ERAS[loc.era].short }}</span>
                <span v-if="distanceOf(loc) !== null" class="pc-side-distance">{{ formatDistance(distanceOf(loc)) }}</span>
                <span v-else>{{ loc.location }}</span>
              </span>
            </span>
            <span class="pc-side-status">
              <AppIcon :name="hasCheckedIn(loc.id) ? 'check' : 'chevronRight'" size="16" />
            </span>
          </button>
        </div>
      </aside>

      <!-- 移动端列表 -->
      <div v-else class="m-loc-list">
        <button
          v-for="(loc, idx) in sortedLocations"
          :key="loc.id"
          class="m-loc-item"
          :class="{ 'is-checked': hasCheckedIn(loc.id) }"
          @click="openLocation(loc)"
        >
          <span class="m-loc-index" :style="{ background: hasCheckedIn(loc.id) ? '#4caf50' : loc.color }">{{ idx + 1 }}</span>
          <span class="m-loc-body">
            <span class="m-loc-name">{{ loc.name }}</span>
            <span class="m-loc-meta">
              <span class="m-loc-era" :class="'era-' + loc.era">{{ ERAS[loc.era].short }}</span>
              <span v-if="distanceOf(loc) !== null" class="m-loc-distance">{{ formatDistance(distanceOf(loc)) }}</span>
              <span v-else>{{ loc.location }}</span>
            </span>
          </span>
          <span class="m-loc-status" :class="{ 'is-done': hasCheckedIn(loc.id) }">
            <AppIcon :name="hasCheckedIn(loc.id) ? 'check' : 'chevronRight'" size="15" />
          </span>
        </button>
      </div>
    </div>

    <!-- ==============================
         地点详情弹窗
         ============================== -->
    <transition name="fade">
      <div v-if="selectedLoc" class="loc-overlay" @click.self="closeDetail">
        <div class="loc-modal" :class="{ 'loc-modal-mobile': isMobile }">
          <div class="loc-banner" :style="{ background: `linear-gradient(135deg, ${selectedLoc.color}, #b71c1c)` }">
            <div class="loc-banner-top">
              <span class="loc-era-tag"><AppIcon :name="ERAS[selectedLoc.era].icon" size="13" /> {{ ERAS[selectedLoc.era].label }}</span>
              <button class="loc-close" aria-label="关闭地点详情" @click="closeDetail">
                <AppIcon name="x" size="18" />
              </button>
            </div>
            <h2 class="loc-banner-title">{{ selectedLoc.name }}</h2>
            <div class="loc-banner-meta"><AppIcon name="pin" size="13" /> {{ selectedLoc.location }} · {{ selectedLoc.category }}</div>
          </div>

          <div class="loc-body">
            <div class="loc-info-row">
              <div class="loc-rating-row">
                <StarRating :model-value="selectedStats.avg" readonly size="small" />
                <span class="loc-rating-text">
                  {{ selectedStats.count ? selectedStats.avg.toFixed(1) + ' 分 · ' + selectedStats.count + ' 条评价' : '暂无评价' }}
                </span>
              </div>
              <span v-if="distanceOf(selectedLoc) !== null" class="loc-distance-tag">
                距你 {{ formatDistance(distanceOf(selectedLoc)) }}
              </span>
            </div>

            <p class="loc-desc">{{ selectedLoc.description }}</p>

            <div class="loc-highlights">
              <span v-for="h in selectedLoc.highlights" :key="h" class="loc-highlight">{{ h }}</span>
            </div>

            <div v-if="hasCheckedIn(selectedLoc.id)" class="loc-checked-note">
              <AppIcon name="check" size="14" /> 已于 {{ getCheckinTime(selectedLoc.id) }} 打卡
            </div>

            <div v-else-if="!can('checkin')" class="loc-guest-tip">
              <AppIcon name="user" size="14" /> 当前为「{{ currentUser.name }}」，切换到「注册用户」或「志愿者」即可打卡
            </div>
          </div>

          <div class="loc-footer">
            <button
              class="loc-btn-checkin"
              :class="{ done: hasCheckedIn(selectedLoc.id) }"
              :disabled="!can('checkin') || hasCheckedIn(selectedLoc.id)"
              @click="doCheckin"
            >
              <AppIcon :name="hasCheckedIn(selectedLoc.id) ? 'check' : 'bookmark'" size="15" />
              {{ hasCheckedIn(selectedLoc.id) ? '已打卡' : '立即打卡' }}
            </button>
            <a
              class="loc-btn-nav"
              :href="navUrl(selectedLoc)"
              target="_blank"
              rel="noopener noreferrer"
            >导航</a>
            <button class="loc-btn-more" @click="goFullDetail">完整详情</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import { useLocationStore, ERAS } from '../stores/locationStore'
import { useCheckinStore } from '../stores/checkinStore'
import { useReviewStore } from '../stores/reviewStore'
import { useUserStore } from '../stores/userStore'
import { useViewport } from '../composables/useViewport'
import { wgs84ToGcj02, haversineKm } from '../utils/coordTransform'
import { recommendPlaces, RECO_WEIGHTS } from '../utils/placeRecommend'
import { fitLowRankPreference } from '../utils/lowRankModel'
import { fitUserCF } from '../utils/userCF'
import StarRating from '../components/StarRating.vue'

const router = useRouter()
const { isMobile } = useViewport()

const { locations, getLocationsByEra, getLocationById } = useLocationStore()
const { checkins, hasCheckedIn, addCheckin, getCheckinTime } = useCheckinStore()
const { getStats, reviews } = useReviewStore()
const { currentUser, currentRoleKey, getRole, can } = useUserStore()

const activeEra = ref('all')
const selectedLoc = ref(null)
const sortMode = ref('default')

// ==============================
// 地图实例
// ==============================
const mapEl = ref(null)
const SHANGHAI_CENTER = [31.225, 121.47]

let map = null
let markerLayer = null
let userLayer = null

const eraFilters = computed(() => [
  { key: 'all', label: '全部', icon: 'pin', count: locations.value.length },
  { key: 'history', label: '历史地点', icon: 'historic', count: getLocationsByEra('history').length },
  { key: 'modern', label: '现代地点', icon: 'city', count: getLocationsByEra('modern').length }
])

const filteredLocations = computed(() => getLocationsByEra(activeEra.value))

// ==============================
// GPS 定位与距离
// ==============================
const userLocation = ref(null)
const locating = ref(false)
const locError = ref('')

// 高德底图为 GCJ-02 坐标系，展示前统一转换，避免标记偏移
const mapPoint = (lat, lng) => {
  const p = wgs84ToGcj02(lat, lng)
  return [p.lat, p.lng]
}

const distanceOf = (loc) => {
  if (!userLocation.value || !loc) return null
  return haversineKm(userLocation.value.lat, userLocation.value.lng, loc.lat, loc.lng)
}

const formatDistance = (km) => {
  if (km === null || km === undefined) return ''
  return km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km'
}

const locateMe = () => {
  if (locating.value) return
  if (!navigator.geolocation) {
    locError.value = '当前浏览器不支持定位功能'
    return
  }
  locating.value = true
  locError.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation.value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }
      locating.value = false
      renderUser()
      if (map) {
        map.flyTo(mapPoint(userLocation.value.lat, userLocation.value.lng), 13, { duration: 0.9 })
      }
    },
    (err) => {
      locating.value = false
      locError.value =
        err.code === 1
          ? '定位权限被拒绝，你仍可手动浏览地图'
          : '定位失败，请检查网络或稍后重试'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  )
}

// ==============================
// 排序
// ==============================
const sortedLocations = computed(() => {
  const list = [...filteredLocations.value]
  if (sortMode.value === 'distance' && userLocation.value) {
    list.sort((a, b) => distanceOf(a) - distanceOf(b))
  }
  return list
})

const toggleSort = () => {
  sortMode.value = sortMode.value === 'distance' ? 'default' : 'distance'
}

// ==============================
// 算法推荐地点（UserCF + 低秩偏好 + 内容特征）
// ==============================
const roleNameOf = (key) => getRole(key)?.name || key

// 协同过滤第一路：UserCF 邻域法，找口味相近的访客
const userCFModel = computed(() =>
  fitUserCF({
    locations: locations.value,
    checkins: checkins.value,
    reviews: reviews.value,
    currentRoleKey: currentRoleKey.value,
    roleNameOf
  })
)

// 协同过滤第二路：「访客 × 地点」偏好矩阵的隐因子分解
const lowRankModel = computed(() =>
  fitLowRankPreference({
    locations: locations.value,
    checkins: checkins.value,
    reviews: reviews.value,
    currentRoleKey: currentRoleKey.value,
    roleNameOf
  })
)

const recoResult = computed(() =>
  recommendPlaces({
    locations: locations.value,
    checkins: checkins.value,
    reviews: reviews.value,
    userLocation: userLocation.value,
    currentRoleKey: currentRoleKey.value,
    roleNameOf,
    latentModel: lowRankModel.value,
    userCFModel: userCFModel.value,
    limit: 4
  })
)

const recommendations = computed(() => recoResult.value.items)
const recoSignals = computed(() => recoResult.value.signals)

// 脚注里只展示相似度最高的 3 位邻居，避免文案过长
const neighborSummary = computed(() =>
  userCFModel.value.neighbors
    .slice(0, 3)
    .map((n) => `${n.name} ${n.similarity.toFixed(2)}`)
    .join(' · ')
)

// 权重文案跟随模型状态：协同过滤冷启动退出时，展示按比例归一化后的实际权重
const recoFormula = computed(() => {
  const cfAvailable = recoSignals.value.cf
  const items = [
    ['cf', '协同过滤'],
    ['interest', '兴趣'],
    ['rating', '口碑'],
    ['hot', '热度'],
    ['explore', '探索'],
    ['distance', '距离']
  ].filter(([key]) => key !== 'cf' || cfAvailable)

  const total = items.reduce((sum, [key]) => sum + RECO_WEIGHTS[key], 0)
  return items
    .map(([key, label]) => `${label} ${Math.round((RECO_WEIGHTS[key] / total) * 100)}%`)
    .join(' · ')
})

// ==============================
// AI 地点推荐（调用后端 DeepSeek）
// ==============================
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

const aiMode = ref(false)
const aiLoading = ref(false)
const aiResult = ref(null)
const aiError = ref('')

// 加载阶段展示的步骤，逐条推进，让「AI 正在思考」这个过程可见
const AI_STEPS = [
  '读取你的打卡足迹与评价偏好',
  '比对地点库的类别与主题',
  '排除已经到访过的地方',
  '为每个候选地点撰写推荐理由'
]
const aiStepIndex = ref(0)
let aiStepTimer = null
const stopAISteps = () => {
  if (aiStepTimer) {
    clearInterval(aiStepTimer)
    aiStepTimer = null
  }
}
const startAISteps = () => {
  stopAISteps()
  aiStepIndex.value = 0
  aiStepTimer = setInterval(() => {
    if (aiStepIndex.value < AI_STEPS.length - 1) aiStepIndex.value += 1
  }, 700)
}

// 接口本地 5-30ms 就返回，加载态会一闪而过，这里保证至少展示这么久
const MIN_AI_LOADING_MS = 1600

// 汇总当前用户的足迹，作为 AI 推荐的画像输入
const buildProfile = () => {
  const checkedNames = []
  const checkedCats = new Set()
  checkins.value.forEach(c => {
    const loc = getLocationById(c.locationId)
    if (!loc) return
    checkedNames.push(loc.name)
    checkedCats.add(loc.category)
  })

  const likedCats = new Set()
  reviews.value
    .filter(r => r.rating >= 4)
    .forEach(r => {
      const loc = getLocationById(r.locationId)
      if (loc) likedCats.add(loc.category)
    })

  return {
    checkedNames,
    checkedCategories: [...checkedCats],
    likedCategories: [...likedCats]
  }
}

const askAIRecommend = async () => {
  if (aiLoading.value) return
  aiMode.value = true
  aiLoading.value = true
  aiError.value = ''
  aiResult.value = null
  startAISteps()
  const startedAt = Date.now()

  const body = {
    ...buildProfile(),
    locations: locations.value.map(l => ({
      name: l.name,
      category: l.category,
      location: l.location,
      description: l.description
    }))
  }

  try {
    const res = await fetch(BACKEND_URL + '/api/ai/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)

    const data = await res.json()
    if (!data.recommendations || data.recommendations.length === 0) {
      throw new Error(data.errorMessage || 'AI 未返回有效推荐')
    }
    aiResult.value = data
  } catch (err) {
    aiError.value =
      'AI 推荐暂不可用（' + (err?.message || '网络错误') + '），可先参考算法推荐结果'
  } finally {
    const rest = MIN_AI_LOADING_MS - (Date.now() - startedAt)
    if (rest > 0) await new Promise(r => setTimeout(r, rest))
    stopAISteps()
    aiLoading.value = false
  }
}

const exitAIMode = () => {
  stopAISteps()
  aiLoading.value = false
  aiMode.value = false
  aiError.value = ''
  aiResult.value = null
}

// 按 AI 返回的地点名称定位到地图上的地点
const openByName = (name) => {
  const loc = locations.value.find(l => l.name === name)
  if (loc) openLocation(loc)
}

// ==============================
// 打卡进度统计
// ==============================
const stats = computed(() => {
  const all = locations.value
  const checkedIds = new Set(checkins.value.map(c => c.locationId))
  const build = (list) => ({
    total: list.length,
    done: list.filter(l => checkedIds.has(l.id)).length
  })
  return {
    all: build(all),
    history: build(all.filter(l => l.era === 'history')),
    modern: build(all.filter(l => l.era === 'modern'))
  }
})

const percent = (item) => (item.total ? (item.done / item.total) * 100 + '%' : '0%')

const selectedStats = computed(() =>
  selectedLoc.value ? getStats(selectedLoc.value.id) : { count: 0, avg: 0, distribution: [] }
)

// ==============================
// 地图渲染
// ==============================
const buildIcon = (loc, index) => {
  const checked = hasCheckedIn(loc.id)
  const color = checked ? '#4caf50' : loc.color
  return L.divIcon({
    className: 'rc-marker-host',
    html: `<div class="rc-marker" style="--c:${color}">
      <span class="rc-marker-pulse"></span>
      <span class="rc-marker-core">${index + 1}</span>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  })
}

const renderMarkers = () => {
  if (!markerLayer) return
  markerLayer.clearLayers()
  filteredLocations.value.forEach((loc, index) => {
    const marker = L.marker(mapPoint(loc.lat, loc.lng), {
      icon: buildIcon(loc, index),
      riseOnHover: true,
      zIndexOffset: hasCheckedIn(loc.id) ? 400 : 0
    })
    marker.on('click', () => openLocation(loc))
    marker.bindTooltip(loc.name, {
      direction: 'top',
      offset: [0, -18],
      className: 'rc-tip'
    })
    markerLayer.addLayer(marker)
  })
}

const renderUser = () => {
  if (!map) return
  if (userLayer) {
    map.removeLayer(userLayer)
    userLayer = null
  }
  if (!userLocation.value) return
  const { lat, lng, accuracy } = userLocation.value
  const pos = mapPoint(lat, lng)
  userLayer = L.layerGroup().addTo(map)
  L.circle(pos, {
    radius: Math.min(accuracy || 200, 2000),
    color: '#1976d2',
    weight: 1,
    fillColor: '#1976d2',
    fillOpacity: 0.1
  }).addTo(userLayer)
  L.circleMarker(pos, {
    radius: 8,
    color: '#ffffff',
    weight: 3,
    fillColor: '#1976d2',
    fillOpacity: 1
  }).addTo(userLayer).bindTooltip('我的位置', { direction: 'top', offset: [0, -10], className: 'rc-tip' })
}

const fitAll = () => {
  if (!map) return
  const pts = (filteredLocations.value.length ? filteredLocations.value : locations.value).map(l => mapPoint(l.lat, l.lng))
  if (!pts.length) return
  map.fitBounds(L.latLngBounds(pts).pad(0.12), { maxZoom: 14 })
}

const initMap = () => {
  if (!mapEl.value || map) return
  map = L.map(mapEl.value, {
    center: mapPoint(SHANGHAI_CENTER[0], SHANGHAI_CENTER[1]),
    zoom: 11,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: !isMobile.value
  })
  // 国内网络下 OSM / Carto 瓦片不可达，使用高德底图（GCJ-02，配合上面的坐标转换）
  L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      attribution: '&copy; 高德地图'
    }
  ).addTo(map)
  markerLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 46,
    disableClusteringAtZoom: 15,
    iconCreateFunction: (cluster) =>
      L.divIcon({
        className: 'rc-cluster-host',
        html: `<div class="rc-cluster"><span>${cluster.getChildCount()}</span></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      })
  }).addTo(map)
  renderMarkers()
  renderUser()
  fitAll()
}

// ==============================
// 交互
// ==============================
const openLocation = (loc) => {
  selectedLoc.value = loc
  document.body.style.overflow = 'hidden'
  if (map) {
    map.panTo(mapPoint(loc.lat, loc.lng), { animate: true, duration: 0.4 })
  }
}

const closeDetail = () => {
  selectedLoc.value = null
  document.body.style.overflow = ''
}

const doCheckin = () => {
  if (!selectedLoc.value || !can('checkin') || hasCheckedIn(selectedLoc.value.id)) return
  addCheckin(selectedLoc.value.id, '')
}

const goFullDetail = () => {
  const id = selectedLoc.value?.id
  closeDetail()
  router.push({ path: '/routes', query: { loc: id } })
}

const goPlaces = () => {
  closeDetail()
  router.push('/places')
}

// 跳转外部地图导航（高德，无需 Key）
const navUrl = (loc) => {
  return `https://uri.amap.com/marker?position=${loc.lng},${loc.lat}&name=${encodeURIComponent(loc.name)}&src=redcross&coordinate=wgs84&callnative=0`
}

// ==============================
// 生命周期与响应式更新
// ==============================
onMounted(() => {
  nextTick(() => initMap())
})

onBeforeUnmount(() => {
  stopAISteps()
  if (map) {
    map.remove()
    map = null
    markerLayer = null
    userLayer = null
  }
  document.body.style.overflow = ''
})

// 筛选、打卡状态或地点库变化时刷新标记
watch(
  () =>
    `${activeEra.value}|${checkins.value.map(c => c.locationId).join(',')}|${locations.value
      .map(l => l.id)
      .join(',')}`,
  () => {
    renderMarkers()
  }
)

// 设备切换时修正地图尺寸
watch(isMobile, () => {
  nextTick(() => {
    if (map) map.invalidateSize()
  })
})
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 0 40px;
}

/* ==============================
   Leaflet 标记与提示（动态插入需 :deep）
   ============================== */
.map-leaflet {
  width: 100%;
  height: 560px;
  border-radius: 18px;
  overflow: hidden;
  border: 1.5px solid #eef3f8;
  z-index: 0;
}

.map-leaflet.is-mobile {
  height: 340px;
}

:deep(.rc-marker-host) {
  background: transparent;
  border: none;
}

:deep(.rc-cluster-host) {
  background: transparent;
  border: none;
}

:deep(.rc-cluster) {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.42);
  font-family: inherit;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

:deep(.rc-cluster-host:hover .rc-cluster) {
  transform: scale(1.08);
}

:deep(.rc-marker) {
  position: relative;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.rc-marker-pulse) {
  position: absolute;
  inset: -7px;
  border-radius: 50%;
  background: var(--c);
  opacity: 0.25;
  animation: rcPulse 2.6s ease-out infinite;
}

@keyframes rcPulse {
  0% { transform: scale(0.55); opacity: 0.32; }
  70% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(1.3); opacity: 0; }
}

:deep(.rc-marker-core) {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--c);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2.5px solid #fff;
  box-shadow: 0 3px 10px rgba(15, 26, 43, 0.3);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
}

:deep(.leaflet-marker-icon:hover .rc-marker-core) {
  transform: scale(1.18);
}

:deep(.rc-tip) {
  background: #1a2332;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(15, 26, 43, 0.25);
}

:deep(.rc-tip::before) {
  border-top-color: #1a2332;
}

:deep(.leaflet-container) {
  font-family: inherit;
  background: #eef3f8;
}

/* ==============================
   算法推荐地点
   ============================== */
.reco-section {
  background: linear-gradient(135deg, #f4f7ff 0%, #eaf0ff 100%);
  border: 1.5px solid rgba(91, 107, 255, 0.14);
  border-radius: 20px;
  padding: 18px 20px;
}

.reco-section.is-mobile {
  padding: 14px 13px;
  border-radius: 16px;
}

.reco-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.reco-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reco-title {
  font-size: 15px;
  font-weight: 800;
  color: #283593;
}

.reco-section.is-mobile .reco-title {
  font-size: clamp(13px, 3.6vw, 15px);
}

.reco-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: #5b6bff;
  background: rgba(91, 107, 255, 0.12);
  padding: 2px 9px;
  border-radius: 9px;
}

.reco-formula {
  font-size: 10.5px;
  color: #7d87b8;
  font-weight: 600;
  cursor: help;
}

.reco-foot {
  margin: 10px 0 0;
  padding: 8px 12px;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.7;
  color: #6f79a8;
  background: rgba(91, 107, 255, 0.05);
  border-radius: 9px;
  word-break: break-word;
}

.reco-head-actions {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.reco-ai-btn {
  padding: 7px 15px;
  background: linear-gradient(135deg, #5b6bff, #3f4fd8);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(91, 107, 255, 0.3);
  white-space: nowrap;
}

.reco-ai-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 7px 18px rgba(91, 107, 255, 0.4);
}

.reco-ai-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.reco-ai-btn.ghost {
  background: #fff;
  color: #5b6bff;
  border: 1.5px solid rgba(91, 107, 255, 0.3);
  box-shadow: none;
}

.reco-ai-btn.ghost:hover {
  background: rgba(91, 107, 255, 0.06);
}

/* ===== AI 推荐结果 ===== */
.ai-zone {
  min-height: 90px;
}

.ai-loading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 18px;
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid rgba(91, 107, 255, 0.12);
}

.ai-orb {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  background: conic-gradient(from 0deg, #5b6bff, #9aa6ff, #5b6bff);
  animation: orbSpin 1.1s linear infinite;
  box-shadow: 0 0 16px rgba(91, 107, 255, 0.45);
}

@keyframes orbSpin {
  to { transform: rotate(360deg); }
}

.ai-loading-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ai-loading-title {
  font-size: 13px;
  font-weight: 800;
  color: #283593;
}

.ai-loading-sub {
  font-size: 11px;
  color: #8b93bd;
  font-weight: 600;
}

.ai-steps {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ai-step {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  font-weight: 600;
  color: #b2b8d4;
  transition: color 0.25s ease;
}

.ai-step-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d5d9ea;
  flex-shrink: 0;
  transition: background 0.25s ease, box-shadow 0.25s ease;
}

.ai-step.active {
  color: #5b6bff;
}

.ai-step.active .ai-step-dot {
  background: #5b6bff;
  box-shadow: 0 0 0 3px rgba(91, 107, 255, 0.18);
  animation: aiStepPulse 1s ease-in-out infinite;
}

.ai-step.done {
  color: #5566d8;
}

.ai-step.done .ai-step-dot {
  background: #8f9bf0;
}

@keyframes aiStepPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.ai-body {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.ai-summary {
  font-size: 12.5px;
  color: #3d4785;
  line-height: 1.7;
  margin: 0;
  padding: 11px 14px;
  background: rgba(91, 107, 255, 0.07);
  border-left: 3px solid #5b6bff;
  border-radius: 10px;
  word-break: break-word;
}

.ai-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 11px;
}

.ai-cards.is-mobile {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  text-align: left;
  background: #fff;
  border: 1.5px solid rgba(91, 107, 255, 0.12);
  border-radius: 14px;
  padding: 13px 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
}

.ai-card:hover {
  transform: translateY(-2px);
  border-color: #5b6bff;
  box-shadow: 0 10px 24px rgba(91, 107, 255, 0.16);
}

.ai-card-head {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.ai-card-index {
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 6px;
  background: linear-gradient(135deg, #5b6bff, #3f4fd8);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-card-name {
  font-size: 13.5px;
  font-weight: 800;
  color: #1a2332;
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

.ai-card-cat {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  color: #5b6bff;
  background: rgba(91, 107, 255, 0.1);
  padding: 1px 8px;
  border-radius: 7px;
}

.ai-card-reason {
  font-size: 12.5px;
  color: #4a5578;
  line-height: 1.7;
  margin: 0;
  word-break: break-word;
}

.ai-card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px dashed rgba(91, 107, 255, 0.16);
}

.ai-meta-item {
  font-size: 11px;
  color: #7a85a8;
  line-height: 1.55;
  word-break: break-word;
}

.ai-error {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 14px 16px;
  background: rgba(255, 152, 0, 0.08);
  border: 1.5px solid rgba(255, 152, 0, 0.25);
  border-radius: 12px;
  font-size: 12.5px;
  color: #b26a00;
  line-height: 1.55;
}

.ai-retry {
  flex-shrink: 0;
  padding: 5px 13px;
  background: #fff;
  border: 1.5px solid rgba(255, 152, 0, 0.4);
  border-radius: 8px;
  color: #b26a00;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.ai-retry:hover {
  background: rgba(255, 152, 0, 0.08);
}

.reco-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 11px;
}

.reco-list.is-mobile {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}

.reco-list.is-mobile::-webkit-scrollbar {
  display: none;
}

.reco-card {
  text-align: left;
  background: #fff;
  border: 1.5px solid rgba(91, 107, 255, 0.1);
  border-radius: 14px;
  padding: 12px 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reco-list.is-mobile .reco-card {
  flex: 0 0 76vw;
  max-width: 300px;
  scroll-snap-align: center;
}

.reco-card:hover {
  transform: translateY(-3px);
  border-color: #5b6bff;
  box-shadow: 0 10px 24px rgba(91, 107, 255, 0.18);
}

.reco-card.is-checked {
  background: rgba(76, 175, 80, 0.04);
}

.reco-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.reco-name {
  font-size: 13px;
  font-weight: 800;
  color: #1a2332;
  line-height: 1.4;
  word-break: break-word;
  flex: 1;
  min-width: 0;
}

.reco-score {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 800;
  color: #5b6bff;
  background: rgba(91, 107, 255, 0.1);
  padding: 1px 7px;
  border-radius: 7px;
}

.reco-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 10.5px;
  color: #8a95a8;
}

.reco-era {
  padding: 1px 6px;
  border-radius: 6px;
  font-weight: 700;
}

.reco-era.era-history {
  background: rgba(184, 134, 11, 0.14);
  color: #96700c;
}

.reco-era.era-modern {
  background: rgba(211, 47, 47, 0.1);
  color: #c62828;
}

.reco-rating {
  color: #ff9800;
  font-weight: 800;
}

.reco-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: auto;
  padding-top: 4px;
}

.reco-reason {
  font-size: 9.5px;
  font-weight: 600;
  color: #4a56a8;
  background: rgba(91, 107, 255, 0.1);
  padding: 2px 7px;
  border-radius: 7px;
}

/* ==============================
   工具栏
   ============================== */
.map-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.toolbar-filters,
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-toolbar.is-mobile {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.map-toolbar.is-mobile .toolbar-filters,
.map-toolbar.is-mobile .toolbar-actions {
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.map-toolbar.is-mobile .toolbar-filters::-webkit-scrollbar,
.map-toolbar.is-mobile .toolbar-actions::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: #fff;
  border: 1.5px solid #eef1f5;
  border-radius: 12px;
  color: #7a8599;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.map-toolbar.is-mobile .filter-btn {
  padding: 8px 13px;
  font-size: 12px;
  border-radius: 10px;
}

.filter-btn:hover {
  border-color: #ffcdd2;
  color: #d32f2f;
}

.filter-btn.active {
  background: linear-gradient(135deg, #d32f2f, #c62828);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 5px 16px rgba(211, 47, 47, 0.26);
}

.filter-count {
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.06);
  font-weight: 700;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.24);
}

.action-btn {
  flex-shrink: 0;
  padding: 9px 15px;
  background: #fff;
  border: 1.5px solid #eef1f5;
  border-radius: 12px;
  color: #5a6478;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.map-toolbar.is-mobile .action-btn {
  padding: 8px 13px;
  font-size: 12px;
  border-radius: 10px;
}

.action-btn:hover:not(:disabled) {
  border-color: #d32f2f;
  color: #d32f2f;
  background: #fff5f5;
}

.action-btn.active {
  border-color: #1976d2;
  color: #1976d2;
  background: rgba(25, 118, 210, 0.08);
}

.action-btn.busy {
  opacity: 0.65;
  cursor: wait;
}

.action-btn:disabled {
  cursor: wait;
}

.map-error {
  font-size: 12.5px;
  color: #b26a00;
  background: rgba(255, 152, 0, 0.1);
  border: 1.5px solid rgba(255, 152, 0, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  line-height: 1.5;
}

/* ==============================
   布局
   ============================== */
.map-layout.layout-pc {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.map-layout.layout-mobile {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.map-stage {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 0 4px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #8a95a8;
  font-weight: 600;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.history { background: #b8860b; }
.legend-dot.modern { background: #d32f2f; }
.legend-dot.checked { background: #4caf50; }
.legend-dot.me { background: #1976d2; }

/* ==============================
   头部
   ============================== */
.pc-map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
  border-radius: 24px;
  padding: 30px 34px;
}

.pc-header-text {
  flex: 1;
  min-width: 260px;
}

.pc-header-badge {
  display: inline-block;
  padding: 7px 18px;
  background: #fff;
  border: 2px solid #d32f2f;
  color: #d32f2f;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 14px;
}

.pc-header-title {
  font-size: clamp(20px, 2.4vw, 30px);
  color: #1a2332;
  margin: 0 0 10px 0;
  font-weight: 800;
  line-height: 1.3;
}

.pc-header-desc {
  font-size: 14px;
  color: #7a8599;
  margin: 0;
  line-height: 1.7;
  max-width: 540px;
}

.pc-header-stats {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}

.pc-stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 116px;
  box-shadow: 0 4px 18px rgba(211, 47, 47, 0.1);
}

.pc-stat-value {
  font-size: 26px;
  font-weight: 800;
  color: #d32f2f;
  line-height: 1;
}

.pc-stat-total {
  font-size: 14px;
  color: #b0bac7;
  font-weight: 600;
}

.pc-stat-label {
  font-size: 12px;
  color: #7a8599;
  margin: 6px 0 8px;
  font-weight: 600;
}

.pc-stat-bar {
  height: 5px;
  background: #f0f3f7;
  border-radius: 4px;
  overflow: hidden;
}

.pc-stat-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ff7043, #d32f2f);
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* PC 侧边列表 */
.pc-map-side {
  background: #fff;
  border-radius: 22px;
  padding: 20px;
  box-shadow: 0 4px 22px rgba(26, 35, 50, 0.07);
  position: sticky;
  top: 100px;
}

.pc-side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 2px solid #f2f5f9;
}

.pc-side-title {
  font-size: 16px;
  font-weight: 800;
  color: #1a2332;
}

.pc-side-count {
  font-size: 12px;
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.08);
  padding: 4px 11px;
  border-radius: 8px;
  font-weight: 700;
}

.pc-side-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 260px);
  overflow-y: auto;
}

.pc-side-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  background: #fafbfc;
  border: 1.5px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.22s ease;
  width: 100%;
}

.pc-side-item:hover {
  background: #fff;
  border-color: #ffcdd2;
  transform: translateX(3px);
}

.pc-side-item.is-active {
  border-color: #d32f2f;
  background: #fff5f5;
}

.pc-side-item.is-checked {
  background: rgba(76, 175, 80, 0.05);
}

.pc-side-item.is-checked.is-active {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.09);
}

.pc-side-index {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.pc-side-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pc-side-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a2332;
  word-break: break-word;
  line-height: 1.35;
}

.pc-side-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #8a95a8;
  word-break: break-word;
}

.pc-side-era {
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.pc-side-era.era-history {
  background: rgba(184, 134, 11, 0.14);
  color: #96700c;
}

.pc-side-era.era-modern {
  background: rgba(211, 47, 47, 0.1);
  color: #c62828;
}

.pc-side-distance {
  color: #1976d2;
  font-weight: 700;
}

.pc-side-status {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 800;
  color: #c9d1db;
}

.pc-side-item.is-checked .pc-side-status {
  color: #4caf50;
}

/* ==============================
   移动端
   ============================== */
.m-map-header {
  background: linear-gradient(160deg, #fff5f5 0%, #ffeaea 60%, #fff0f3 100%);
  border-radius: 18px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.06);
}

.m-header-badge {
  align-self: flex-start;
  padding: 5px 13px;
  background: rgba(255, 255, 255, 0.9);
  border: 1.5px solid rgba(211, 47, 47, 0.15);
  color: #d32f2f;
  border-radius: 50px;
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: 700;
}

.m-header-title {
  font-size: clamp(18px, 5vw, 23px);
  color: #1a2332;
  margin: 0;
  font-weight: 800;
  line-height: 1.25;
  word-break: break-word;
}

.m-header-desc {
  font-size: clamp(11px, 3vw, 13px);
  color: #8a95a8;
  margin: 0;
  line-height: 1.6;
}

.m-header-stats {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.m-stat {
  flex: 1;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 12px;
  padding: 9px 6px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(211, 47, 47, 0.06);
}

.m-stat-value {
  display: block;
  font-size: clamp(16px, 4.4vw, 20px);
  font-weight: 800;
  color: #d32f2f;
  line-height: 1.1;
}

.m-stat-value i {
  font-size: clamp(10px, 2.8vw, 12px);
  color: #b0bac7;
  font-style: normal;
  font-weight: 600;
}

.m-stat-label {
  display: block;
  font-size: clamp(9px, 2.4vw, 11px);
  color: #8a95a8;
  margin-top: 3px;
  font-weight: 600;
}

.m-loc-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.m-loc-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 13px;
  background: rgba(255, 255, 255, 0.92);
  border: 1.5px solid rgba(211, 47, 47, 0.06);
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.2s ease;
  width: 100%;
  box-shadow: 0 2px 12px rgba(26, 35, 50, 0.04);
}

.m-loc-item:active {
  transform: scale(0.985);
  border-color: rgba(211, 47, 47, 0.16);
}

.m-loc-item.is-checked {
  background: rgba(76, 175, 80, 0.05);
  border-color: rgba(76, 175, 80, 0.16);
}

.m-loc-index {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: clamp(12px, 3.2vw, 14px);
  font-weight: 800;
}

.m-loc-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.m-loc-name {
  font-size: clamp(12px, 3.4vw, 14px);
  font-weight: 700;
  color: #1a2332;
  word-break: break-word;
  line-height: 1.35;
}

.m-loc-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: clamp(10px, 2.6vw, 11px);
  color: #8a95a8;
  word-break: break-word;
}

.m-loc-era {
  padding: 1px 5px;
  border-radius: 5px;
  font-size: clamp(8.5px, 2.2vw, 10px);
  font-weight: 700;
  flex-shrink: 0;
}

.m-loc-era.era-history {
  background: rgba(184, 134, 11, 0.14);
  color: #96700c;
}

.m-loc-era.era-modern {
  background: rgba(211, 47, 47, 0.1);
  color: #c62828;
}

.m-loc-distance {
  color: #1976d2;
  font-weight: 700;
}

.m-loc-status {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 800;
  color: #c9d1db;
}

.m-loc-status.is-done {
  color: #4caf50;
}

/* ==============================
   地点详情弹窗
   ============================== */
.loc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 26, 43, 0.82);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  padding: 20px;
}

.loc-modal {
  background: #fff;
  border-radius: 22px;
  width: 100%;
  max-width: 540px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
  animation: locPop 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}

@keyframes locPop {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.loc-banner {
  padding: 22px 24px 20px;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.loc-banner::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -40px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.loc-banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.loc-era-tag {
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.22);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.loc-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.24);
  color: #fff;
  font-size: 19px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loc-close:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: rotate(90deg);
}

.loc-banner-title {
  font-size: 20px;
  margin: 0 0 8px 0;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
  position: relative;
  z-index: 1;
}

.loc-banner-meta {
  font-size: 12.5px;
  opacity: 0.9;
  word-break: break-word;
  position: relative;
  z-index: 1;
}

.loc-body {
  padding: 20px 24px;
}

.loc-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.loc-rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.loc-rating-text {
  font-size: 12px;
  color: #8a95a8;
  font-weight: 600;
}

.loc-distance-tag {
  font-size: 11.5px;
  font-weight: 700;
  color: #1976d2;
  background: rgba(25, 118, 210, 0.1);
  padding: 3px 10px;
  border-radius: 10px;
}

.loc-desc {
  font-size: 13.5px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0 0 16px 0;
  word-break: break-word;
}

.loc-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 16px;
}

.loc-highlight {
  font-size: 11.5px;
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.08);
  padding: 5px 12px;
  border-radius: 16px;
  font-weight: 600;
  word-break: break-word;
}

.loc-checked-note {
  font-size: 12.5px;
  color: #2e7d32;
  background: rgba(76, 175, 80, 0.09);
  border: 1.5px solid rgba(76, 175, 80, 0.2);
  border-radius: 10px;
  padding: 11px 14px;
  font-weight: 600;
}

.loc-guest-tip {
  font-size: 12.5px;
  color: #607d8b;
  background: rgba(120, 144, 156, 0.08);
  border: 1.5px dashed rgba(120, 144, 156, 0.3);
  border-radius: 10px;
  padding: 11px 14px;
  line-height: 1.55;
}

.loc-footer {
  display: flex;
  gap: 9px;
  padding: 0 24px 22px;
}

.loc-btn-checkin {
  flex: 1;
  padding: 13px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
  box-shadow: 0 5px 16px rgba(211, 47, 47, 0.3);
}

.loc-btn-checkin:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(211, 47, 47, 0.4);
}

.loc-btn-checkin.done,
.loc-btn-checkin:disabled {
  background: #e8ebef;
  color: #9aa5b4;
  box-shadow: none;
  cursor: default;
}

.loc-btn-checkin.done {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fff;
}

.loc-btn-nav,
.loc-btn-more {
  flex-shrink: 0;
  padding: 13px 16px;
  background: #fff;
  border: 1.5px solid #e5e9ef;
  border-radius: 12px;
  color: #7a8599;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.loc-btn-nav:hover,
.loc-btn-more:hover {
  border-color: #d32f2f;
  color: #d32f2f;
  background: #fff5f5;
}

/* 移动端弹窗 */
.loc-modal-mobile {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  align-self: flex-end;
  animation: locSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes locSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.loc-modal-mobile .loc-banner {
  padding: 18px 18px 16px;
}

.loc-modal-mobile .loc-banner-title {
  font-size: clamp(16px, 4.5vw, 19px);
}

.loc-modal-mobile .loc-body {
  padding: 16px 18px;
}

.loc-modal-mobile .loc-desc {
  font-size: clamp(12px, 3.2vw, 13.5px);
}

.loc-modal-mobile .loc-footer {
  padding: 0 18px calc(18px + env(safe-area-inset-bottom, 0px));
  flex-wrap: wrap;
}

.loc-modal-mobile .loc-btn-checkin {
  flex: 1 1 100%;
}

.loc-modal-mobile .loc-btn-nav,
.loc-modal-mobile .loc-btn-more {
  flex: 1;
  justify-content: center;
}

@media (max-width: 768px) {
  .loc-overlay {
    padding: 0;
    align-items: flex-end;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 统一视觉语言 */
.pc-map-header,
.m-map-header {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(150, 47, 63, 0.09);
  background:
    radial-gradient(circle at 92% 10%, rgba(255, 255, 255, 0.9) 0 7%, transparent 7.3%),
    radial-gradient(circle at 80% 20%, rgba(197, 34, 55, 0.08), transparent 25%),
    linear-gradient(135deg, #fffaf7 0%, #fff0ed 55%, #f8dde2 100%);
  box-shadow: 0 16px 42px rgba(101, 35, 48, 0.07);
}

.pc-map-header {
  border-radius: 26px;
  padding: 32px 36px;
}

.pc-header-badge,
.m-header-badge {
  border: 1px solid rgba(197, 34, 55, 0.12);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 5px 14px rgba(102, 35, 48, 0.06);
}

.pc-header-title,
.m-header-title {
  letter-spacing: -0.7px;
}

.pc-header-desc,
.m-header-desc {
  color: #77717a;
}

.pc-stat-card,
.m-stat {
  border: 1px solid rgba(143, 61, 76, 0.08);
  box-shadow: 0 8px 22px rgba(52, 33, 39, 0.055);
}

.reco-section {
  border-color: rgba(99, 86, 189, 0.13);
  background:
    radial-gradient(circle at 93% 8%, rgba(255, 255, 255, 0.78), transparent 24%),
    linear-gradient(135deg, #f8f7ff 0%, #f1f2ff 100%);
  box-shadow: 0 10px 28px rgba(66, 58, 130, 0.055);
}

.reco-section.is-mobile {
  border-radius: 20px;
}

.reco-ai-btn {
  border-radius: 11px;
  background: linear-gradient(135deg, #6b68df, #504ac4);
  box-shadow: 0 6px 16px rgba(84, 77, 194, 0.2);
}

.reco-card,
.ai-card {
  border-color: rgba(107, 93, 183, 0.12);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 7px 20px rgba(66, 56, 123, 0.055);
}

.reco-list.is-mobile,
.ai-cards.is-mobile {
  scroll-padding-inline: 13px;
}

.reco-list.is-mobile .reco-card,
.ai-cards.is-mobile .ai-card {
  scroll-snap-align: start;
}

.filter-btn,
.action-btn {
  border-color: rgba(126, 71, 82, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
}

.filter-btn.active {
  background: linear-gradient(135deg, #c52237, #941629);
  box-shadow: 0 6px 18px rgba(145, 25, 44, 0.2);
}

.map-toolbar.is-mobile .toolbar-filters,
.map-toolbar.is-mobile .toolbar-actions {
  padding-inline: 1px 20px;
  mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
}

.map-leaflet {
  border-color: rgba(127, 70, 81, 0.1);
  box-shadow: 0 16px 38px rgba(43, 34, 39, 0.1);
}

.pc-map-side,
.m-loc-item {
  border-color: rgba(139, 62, 76, 0.09);
  box-shadow: 0 8px 24px rgba(45, 32, 37, 0.055);
}

.loc-modal {
  border: 1px solid rgba(135, 65, 78, 0.09);
  border-radius: 24px;
}

.loc-btn-checkin {
  background: linear-gradient(135deg, #c52237, #901528);
}

.loc-btn-nav,
.loc-btn-more {
  border-color: rgba(132, 71, 82, 0.12);
  border-radius: 12px;
}

@media (max-width: 768px) {
  .map-page {
    gap: 15px;
    padding-top: 15px;
  }

  .m-map-header {
    padding: 20px 17px 17px;
    border-radius: 23px;
  }

  .m-header-title {
    font-size: clamp(21px, 5.8vw, 26px);
  }

  .m-stat {
    border-radius: 14px;
  }

  .m-loc-item {
    border-radius: 16px;
  }
}
</style>
