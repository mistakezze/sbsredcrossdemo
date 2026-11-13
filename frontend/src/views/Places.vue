<template>
  <div class="places-page">
    <!-- ==============================
         头部
         ============================== -->
    <header v-if="!isMobile" class="pc-places-header">
      <div class="pc-header-text">
        <span class="pc-header-badge"><AppIcon name="pin" size="13" /> 地点管理</span>
        <h1 class="pc-header-title">地点上传与审核</h1>
        <p class="pc-header-desc">企业/地点用户可提交自定义红十字地点，管理员审核通过后自动进入地图与路线库。</p>
      </div>
      <div class="pc-header-right">
        <div class="pc-header-stats">
          <div class="pc-stat">
            <span class="pc-stat-num pending">{{ stats.pending }}</span>
            <span class="pc-stat-label">待审核</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-num approved">{{ stats.approved }}</span>
            <span class="pc-stat-label">已通过</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-num rejected">{{ stats.rejected }}</span>
            <span class="pc-stat-label">已驳回</span>
          </div>
        </div>
        <button v-if="can('uploadLocation')" class="pc-btn-upload" @click="openUpload">
          <AppIcon name="plus" size="15" /> 上传地点
        </button>
      </div>
    </header>

    <header v-else class="m-places-header">
      <span class="m-header-badge"><AppIcon name="pin" size="13" /> 地点管理</span>
      <h1 class="m-header-title">地点上传与审核</h1>
      <p class="m-header-desc">提交自定义地点，审核通过后进入地图</p>
      <div class="m-header-stats">
        <div class="m-stat">
          <span class="m-stat-num pending">{{ stats.pending }}</span>
          <span class="m-stat-label">待审核</span>
        </div>
        <div class="m-stat">
          <span class="m-stat-num approved">{{ stats.approved }}</span>
          <span class="m-stat-label">已通过</span>
        </div>
        <div class="m-stat">
          <span class="m-stat-num rejected">{{ stats.rejected }}</span>
          <span class="m-stat-label">已驳回</span>
        </div>
      </div>
      <button v-if="can('uploadLocation')" class="m-btn-upload" @click="openUpload">
        <AppIcon name="plus" size="15" /> 上传地点
      </button>
    </header>

    <!-- 无权限提示 -->
    <div v-if="!can('uploadLocation') && !can('moderate')" class="perm-tip">
      <AppIcon name="user" size="14" /> 当前为「{{ currentUser.name }}」，切换到「企业/地点用户」可上传地点，切换到「管理员」可审核。
    </div>

    <!-- ==============================
         筛选
         ============================== -->
    <div class="places-filters" :class="{ 'is-mobile': isMobile }">
      <button
        v-for="f in statusFilters"
        :key="f.key"
        class="filter-chip"
        :class="{ active: activeStatus === f.key }"
        @click="activeStatus = f.key"
      >
        {{ f.label }}
        <span class="filter-count">{{ countOf(f.key) }}</span>
      </button>
    </div>

    <!-- ==============================
         提交列表
         ============================== -->
    <div class="places-list" :class="isMobile ? 'is-mobile' : 'is-pc'">
      <div
        v-for="item in filteredSubmissions"
        :key="item.id"
        class="place-card"
      >
        <div class="place-card-bar" :style="{ background: SUBMIT_STATUS[item.status].color }"></div>

        <div class="place-card-body">
          <div class="place-card-top">
            <span
              class="place-status"
              :class="'status-' + item.status"
              :style="{ color: SUBMIT_STATUS[item.status].color, background: SUBMIT_STATUS[item.status].color + '18' }"
            ><AppIcon :name="SUBMIT_STATUS[item.status].icon" size="11" /> {{ SUBMIT_STATUS[item.status].label }}</span>
            <span class="place-era" :class="'era-' + item.era">
              <AppIcon :name="item.era === 'history' ? 'historic' : 'city'" size="11" />
              {{ item.era === 'history' ? '历史' : '现代' }}
            </span>
            <span class="place-category">{{ item.category }}</span>
          </div>

          <h3 class="place-name">{{ item.name }}</h3>

          <div class="place-meta">
            <span><AppIcon name="pin" size="11" /> {{ item.location }}</span>
            <span><AppIcon name="user" size="11" /> {{ item.submitterName }}</span>
            <span><AppIcon name="clock" size="11" /> {{ formatSubmitTime(item.createdAt) }}</span>
          </div>

          <p class="place-desc">{{ item.description }}</p>

          <div v-if="item.reviewNote" class="place-note" :class="{ rejected: item.status === 'rejected' }">
            <span class="note-label">审核意见</span>
            <span class="note-text">{{ item.reviewNote }}</span>
          </div>

          <div class="place-actions">
            <button class="btn-ghost" @click="openDetail(item)">查看详情</button>

            <template v-if="can('moderate') && item.status === 'pending'">
              <button class="btn-approve" @click="openReview(item, 'approve')">通过</button>
              <button class="btn-reject" @click="openReview(item, 'reject')">驳回</button>
            </template>

            <button v-if="can('moderate')" class="btn-remove" @click="doRemove(item)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!filteredSubmissions.length" class="places-empty">
        <span class="empty-emoji"><AppIcon name="inbox" size="34" /></span>
        <span class="empty-text">{{ emptyText }}</span>
      </div>
    </div>

    <!-- ==============================
         详情弹窗
         ============================== -->
    <transition name="fade">
      <div v-if="detailItem" class="pl-overlay" @click.self="closeDetail">
        <div class="pl-modal" :class="{ 'is-mobile': isMobile }">
          <div class="pl-banner" :style="{ background: `linear-gradient(135deg, ${detailItem.color}, #b71c1c)` }">
            <div class="banner-top">
              <span class="banner-status">
                <AppIcon :name="SUBMIT_STATUS[detailItem.status].icon" size="11" />
                {{ SUBMIT_STATUS[detailItem.status].label }}
              </span>
              <button class="banner-close" aria-label="关闭地点详情" @click="closeDetail">
                <AppIcon name="x" size="18" />
              </button>
            </div>
            <h2 class="banner-title">{{ detailItem.name }}</h2>
            <div class="banner-meta">
              <AppIcon :name="detailItem.era === 'history' ? 'historic' : 'city'" size="12" />
              {{ detailItem.era === 'history' ? '历史地点' : '现代地点' }} · {{ detailItem.category }} · {{ detailItem.location }}
            </div>
          </div>

          <div class="pl-body">
            <p class="pl-desc">{{ detailItem.description }}</p>

            <div v-if="detailItem.history" class="pl-section">
              <div class="pl-section-label"><AppIcon name="book" size="13" /> 历史背景</div>
              <p class="pl-section-text">{{ detailItem.history }}</p>
            </div>

            <div v-if="detailItem.highlights && detailItem.highlights.length" class="pl-highlights">
              <span v-for="h in detailItem.highlights" :key="h" class="pl-highlight">{{ h }}</span>
            </div>

            <div class="pl-info">
              <div class="pl-info-row">
                <span class="pl-info-label">提交人</span>
                <span class="pl-info-value">{{ detailItem.submitterName }}</span>
              </div>
              <div class="pl-info-row">
                <span class="pl-info-label">提交时间</span>
                <span class="pl-info-value">{{ formatSubmitTime(detailItem.createdAt) }}</span>
              </div>
              <div class="pl-info-row">
                  <span class="pl-info-label"><AppIcon name="pin" size="11" /> 坐标</span>
                  <span class="pl-info-value">{{ detailItem.lat.toFixed(4) }}, {{ detailItem.lng.toFixed(4) }}</span>
              </div>
              <div v-if="detailItem.reviewedAt" class="pl-info-row">
                <span class="pl-info-label">审核时间</span>
                <span class="pl-info-value">{{ formatSubmitTime(detailItem.reviewedAt) }}</span>
              </div>
            </div>

            <div v-if="detailItem.reviewNote" class="pl-note" :class="{ rejected: detailItem.status === 'rejected' }">
              <span class="note-label">审核意见</span>
              <span class="note-text">{{ detailItem.reviewNote }}</span>
            </div>
          </div>

          <div v-if="can('moderate') && detailItem.status === 'pending'" class="pl-footer">
            <button class="btn-approve wide" @click="openReview(detailItem, 'approve')">通过审核</button>
            <button class="btn-reject wide" @click="openReview(detailItem, 'reject')">驳回</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ==============================
         审核弹窗
         ============================== -->
    <transition name="fade">
      <div v-if="reviewTarget" class="pl-overlay" @click.self="closeReview">
        <div class="review-modal" :class="{ 'is-mobile': isMobile }">
          <div class="review-head">
            <span class="review-title">
              {{ reviewAction === 'approve' ? '通过审核' : '驳回提交' }}
            </span>
            <button class="banner-close dark" aria-label="关闭审核弹窗" @click="closeReview">
              <AppIcon name="x" size="18" />
            </button>
          </div>
          <div class="review-body">
            <div class="review-target">
              <div class="review-target-name">{{ reviewTarget.name }}</div>
              <div class="review-target-meta">{{ reviewTarget.category }} · {{ reviewTarget.location }}</div>
            </div>
            <label class="field">
              <span class="field-label">
                审核意见{{ reviewAction === 'reject' ? '（驳回时必填）' : '（选填）' }}
              </span>
              <textarea
                v-model="reviewNote"
                class="field-textarea"
                rows="3"
                :placeholder="reviewAction === 'approve' ? '例如：信息核实无误，准予上线。' : '请说明驳回原因，便于提交方修改'"
              ></textarea>
            </label>
            <div v-if="reviewError" class="form-error"><AppIcon name="alert" size="14" /> {{ reviewError }}</div>
          </div>
          <div class="review-footer">
            <button class="btn-cancel" @click="closeReview">取消</button>
            <button
              class="btn-confirm"
              :class="{ reject: reviewAction === 'reject' }"
              @click="submitReview"
            >
              {{ reviewAction === 'approve' ? '确认通过' : '确认驳回' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ==============================
         上传地点弹窗
         ============================== -->
    <transition name="fade">
      <div v-if="showUpload" class="pl-overlay" @click.self="closeUpload">
        <div class="upload-modal" :class="{ 'is-mobile': isMobile }">
          <div class="upload-head">
            <span class="upload-title">上传新地点</span>
            <button class="banner-close dark" aria-label="关闭上传地点" @click="closeUpload">
              <AppIcon name="x" size="18" />
            </button>
          </div>

          <div class="upload-body">
            <label class="field">
              <span class="field-label">地点名称 *</span>
              <input v-model="form.name" class="field-input" placeholder="例如：静安区红十字应急救护培训基地" />
            </label>

            <div class="field-row">
              <label class="field">
                <span class="field-label">类别</span>
                <select v-model="form.category" class="field-input">
                  <option v-for="c in PLACE_CATEGORIES" :key="c" :value="c">{{ c }}</option>
                </select>
              </label>
              <div class="field">
                <span class="field-label">时代分类</span>
                <div class="era-picker">
                  <button
                    class="era-option"
                    :class="{ active: form.era === 'history' }"
                    @click="form.era = 'history'"
                  ><AppIcon name="historic" size="13" /> 历史</button>
                  <button
                    class="era-option"
                    :class="{ active: form.era === 'modern' }"
                    @click="form.era = 'modern'"
                  ><AppIcon name="city" size="13" /> 现代</button>
                </div>
              </div>
            </div>

            <label class="field">
              <span class="field-label">所在区域 *</span>
              <input v-model="form.location" class="field-input" placeholder="例如：上海市 · 静安区" />
            </label>

            <label class="field">
              <span class="field-label">地点简介 *</span>
              <textarea
                v-model="form.description"
                class="field-textarea"
                rows="3"
                placeholder="介绍这个地点的功能、特色与适合人群..."
              ></textarea>
            </label>

            <label class="field">
              <span class="field-label">历史背景（选填）</span>
              <textarea
                v-model="form.history"
                class="field-textarea"
                rows="2"
                placeholder="若为历史地点，可补充其历史渊源"
              ></textarea>
            </label>

            <label class="field">
              <span class="field-label">亮点标签（选填，用逗号分隔）</span>
              <input v-model="form.highlights" class="field-input" placeholder="急救培训, 志愿服务, 亲子活动" />
            </label>

            <div class="field">
              <span class="field-label">
                地图位置 * <span class="field-hint">在地图上点击选择坐标</span>
              </span>
              <div ref="pickerEl" class="picker-map"></div>
              <div class="picker-coord">
                <AppIcon name="pin" size="12" /> 已选：{{ form.lat.toFixed(4) }}, {{ form.lng.toFixed(4) }}
              </div>
            </div>

            <div v-if="uploadError" class="form-error"><AppIcon name="alert" size="14" /> {{ uploadError }}</div>
          </div>

          <div class="upload-footer">
            <button class="btn-cancel" @click="closeUpload">取消</button>
            <button class="btn-confirm" @click="submitUpload">提交审核</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  usePlaceSubmitStore,
  PLACE_CATEGORIES,
  SUBMIT_STATUS,
  formatSubmitTime
} from '../stores/locationSubmitStore'
import { useUserStore } from '../stores/userStore'
import { useViewport } from '../composables/useViewport'
import { wgs84ToGcj02 } from '../utils/coordTransform'

const { isMobile } = useViewport()
const { currentUser, can } = useUserStore()

const {
  submissions,
  stats,
  submitPlace,
  approve,
  reject,
  removeSubmission
} = usePlaceSubmitStore()

// ==============================
// 筛选
// ==============================
const activeStatus = ref('all')

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' }
]

const countOf = (key) => {
  if (key === 'all') return submissions.value.length
  return stats.value[key] || 0
}

const filteredSubmissions = computed(() => {
  const list =
    activeStatus.value === 'all'
      ? submissions.value
      : submissions.value.filter(s => s.status === activeStatus.value)
  return [...list].sort((a, b) => b.createdAt - a.createdAt)
})

const emptyText = computed(() => {
  if (activeStatus.value === 'pending') return '没有待审核的地点提交'
  if (activeStatus.value === 'approved') return '还没有审核通过的地点'
  if (activeStatus.value === 'rejected') return '没有已驳回的提交'
  return '还没有任何地点提交记录'
})

// ==============================
// 详情
// ==============================
const detailItem = ref(null)

const openDetail = (item) => {
  detailItem.value = item
  document.body.style.overflow = 'hidden'
}

const closeDetail = () => {
  detailItem.value = null
  document.body.style.overflow = ''
}

// ==============================
// 审核
// ==============================
const reviewTarget = ref(null)
const reviewAction = ref('approve')
const reviewNote = ref('')
const reviewError = ref('')

const openReview = (item, action) => {
  reviewTarget.value = item
  reviewAction.value = action
  reviewNote.value = ''
  reviewError.value = ''
  document.body.style.overflow = 'hidden'
}

const closeReview = () => {
  reviewTarget.value = null
  reviewNote.value = ''
  reviewError.value = ''
  document.body.style.overflow = ''
}

const submitReview = () => {
  if (!reviewTarget.value) return
  if (reviewAction.value === 'reject' && !reviewNote.value.trim()) {
    reviewError.value = '驳回必须填写审核意见'
    return
  }
  if (reviewAction.value === 'approve') {
    approve(reviewTarget.value.id, reviewNote.value)
  } else {
    reject(reviewTarget.value.id, reviewNote.value)
  }
  closeReview()
  closeDetail()
}

const doRemove = (item) => {
  if (!can('moderate')) return
  removeSubmission(item.id)
}

// ==============================
// 上传（含地图选点）
// ==============================
const showUpload = ref(false)
const uploadError = ref('')
const pickerEl = ref(null)

let pickerMap = null
let pickerMarker = null

const SHANGHAI_CENTER = { lat: 31.225, lng: 121.47 }

const form = ref({
  name: '',
  category: '教育基地',
  era: 'modern',
  location: '',
  description: '',
  history: '',
  highlights: '',
  lat: SHANGHAI_CENTER.lat,
  lng: SHANGHAI_CENTER.lng
})

const toMapPoint = (lat, lng) => {
  const p = wgs84ToGcj02(lat, lng)
  return [p.lat, p.lng]
}

const fromMapPoint = (p) => {
  // 反向近似：高德底图上选点后转为 WGS84 存储
  // 由于 GCJ-02 偏移量小，这里做一次迭代反解即可满足展示精度
  const gcjLat = p.lat
  const gcjLng = p.lng
  const first = wgs84ToGcj02(gcjLat, gcjLng)
  return {
    lat: gcjLat - (first.lat - gcjLat),
    lng: gcjLng - (first.lng - gcjLng)
  }
}

const pickerMarkerMarkup = `
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none"
       stroke="#c52237" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 10c0 5.4-8 11-8 11S4 15.4 4 10a8 8 0 1 1 16 0Z"/>
    <circle cx="12" cy="10" r="2.5"/>
  </svg>
`

const buildPickerMarker = (lat, lng) =>
  L.marker(toMapPoint(lat, lng), {
    icon: L.divIcon({
      className: 'picker-marker-host',
      html: `<div class="picker-marker">${pickerMarkerMarkup}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 28]
    })
  })

const initPicker = () => {
  if (!pickerEl.value || pickerMap) return
  pickerMap = L.map(pickerEl.value, {
    center: toMapPoint(form.value.lat, form.value.lng),
    zoom: 12,
    zoomControl: false,
    scrollWheelZoom: false
  })
  L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    { subdomains: ['1', '2', '3', '4'], maxZoom: 18, attribution: '&copy; 高德地图' }
  ).addTo(pickerMap)

  pickerMarker = buildPickerMarker(form.value.lat, form.value.lng).addTo(pickerMap)

  pickerMap.on('click', (e) => {
    const wgs = fromMapPoint(e.latlng)
    form.value.lat = wgs.lat
    form.value.lng = wgs.lng
    if (pickerMarker) {
      pickerMarker.setLatLng(e.latlng)
    } else {
      pickerMarker = buildPickerMarker(wgs.lat, wgs.lng).addTo(pickerMap)
    }
  })

  nextTick(() => {
    if (pickerMap) pickerMap.invalidateSize()
  })
}

const destroyPicker = () => {
  if (pickerMap) {
    pickerMap.remove()
    pickerMap = null
    pickerMarker = null
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    category: '教育基地',
    era: 'modern',
    location: '',
    description: '',
    history: '',
    highlights: '',
    lat: SHANGHAI_CENTER.lat,
    lng: SHANGHAI_CENTER.lng
  }
  uploadError.value = ''
}

const openUpload = () => {
  resetForm()
  showUpload.value = true
  document.body.style.overflow = 'hidden'
}

const closeUpload = () => {
  showUpload.value = false
  destroyPicker()
  document.body.style.overflow = ''
}

watch(showUpload, (val) => {
  if (val) {
    nextTick(() => initPicker())
  } else {
    destroyPicker()
  }
})

onBeforeUnmount(() => {
  destroyPicker()
  document.body.style.overflow = ''
})

const submitUpload = () => {
  const f = form.value
  if (!f.name.trim()) {
    uploadError.value = '请填写地点名称'
    return
  }
  if (!f.location.trim()) {
    uploadError.value = '请填写所在区域'
    return
  }
  if (!f.description.trim()) {
    uploadError.value = '请填写地点简介'
    return
  }

  submitPlace(
    {
      name: f.name,
      category: f.category,
      era: f.era,
      location: f.location,
      description: f.description,
      history: f.history,
      highlights: f.highlights
        ? f.highlights.split(/[,，]/).map(s => s.trim()).filter(Boolean)
        : [],
      lat: f.lat,
      lng: f.lng
    },
    { roleKey: currentUser.value.key, userName: currentUser.value.name }
  )
  closeUpload()
  activeStatus.value = 'pending'
}
</script>

<style scoped>
.places-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0 40px;
}

/* ==============================
   头部
   ============================== */
.pc-places-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  flex-wrap: wrap;
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
  border-radius: 24px;
  padding: 30px 34px;
}

.pc-header-text { flex: 1; min-width: 280px; }

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
  max-width: 560px;
}

.pc-header-right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.pc-header-stats { display: flex; gap: 12px; }

.pc-stat {
  background: #fff;
  border-radius: 14px;
  padding: 14px 18px;
  min-width: 84px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.09);
}

.pc-stat-num {
  display: block;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  color: #d32f2f;
}

.pc-stat-num.pending { color: #f9a825; }
.pc-stat-num.approved { color: #2e7d32; }
.pc-stat-num.rejected { color: #c62828; }

.pc-stat-label {
  display: block;
  font-size: 11.5px;
  color: #7a8599;
  margin-top: 6px;
  font-weight: 600;
}

.pc-btn-upload {
  padding: 13px 24px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: #fff;
  border: none;
  border-radius: 13px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 6px 18px rgba(211, 47, 47, 0.3);
  transition: all 0.22s ease;
  white-space: nowrap;
}

.pc-btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(211, 47, 47, 0.4);
}

.m-places-header {
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

.m-header-stats { display: flex; gap: 8px; margin-top: 4px; }

.m-stat {
  flex: 1;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 12px;
  padding: 9px 6px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(211, 47, 47, 0.06);
}

.m-stat-num {
  display: block;
  font-size: clamp(16px, 4.4vw, 20px);
  font-weight: 800;
  line-height: 1.1;
  color: #d32f2f;
}

.m-stat-num.pending { color: #f9a825; }
.m-stat-num.approved { color: #2e7d32; }
.m-stat-num.rejected { color: #c62828; }

.m-stat-label {
  display: block;
  font-size: clamp(9px, 2.4vw, 11px);
  color: #8a95a8;
  margin-top: 3px;
  font-weight: 600;
}

.m-btn-upload {
  margin-top: 4px;
  padding: 11px;
  background: linear-gradient(135deg, #d32f2f, #c62828);
  color: #fff;
  border: none;
  border-radius: 11px;
  font-size: clamp(12px, 3.4vw, 14px);
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(211, 47, 47, 0.28);
}

.perm-tip {
  font-size: 12.5px;
  color: #607d8b;
  background: rgba(120, 144, 156, 0.08);
  border: 1.5px dashed rgba(120, 144, 156, 0.28);
  border-radius: 12px;
  padding: 12px 16px;
  line-height: 1.6;
}

/* ==============================
   筛选
   ============================== */
.places-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.places-filters.is-mobile {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.places-filters.is-mobile::-webkit-scrollbar { display: none; }

.filter-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1.5px solid #eef1f5;
  border-radius: 11px;
  color: #7a8599;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.places-filters.is-mobile .filter-chip {
  padding: 7px 13px;
  font-size: 12px;
}

.filter-chip:hover { border-color: #ffcdd2; color: #d32f2f; }

.filter-chip.active {
  background: linear-gradient(135deg, #d32f2f, #c62828);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.24);
}

.filter-count {
  font-size: 10.5px;
  padding: 1px 6px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.06);
  font-weight: 700;
}

.filter-chip.active .filter-count { background: rgba(255, 255, 255, 0.24); }

/* ==============================
   列表
   ============================== */
.places-list.is-pc {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.places-list.is-mobile {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.place-card {
  display: flex;
  background: #fff;
  border: 1.5px solid #eef1f5;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.22s ease;
  box-shadow: 0 2px 14px rgba(26, 35, 50, 0.045);
}

.place-card:hover {
  transform: translateY(-3px);
  border-color: #ffcdd2;
  box-shadow: 0 12px 30px rgba(211, 47, 47, 0.1);
}

.place-card-bar { width: 5px; flex-shrink: 0; }

.place-card-body {
  flex: 1;
  min-width: 0;
  padding: 15px 17px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.place-card-top {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.place-status,
.place-era,
.place-category {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 8px;
}

.place-era.era-history {
  background: rgba(184, 134, 11, 0.14);
  color: #96700c;
}

.place-era.era-modern {
  background: rgba(211, 47, 47, 0.1);
  color: #c62828;
}

.place-category {
  background: #f4f6f9;
  color: #7a8599;
}

.place-name {
  font-size: 15.5px;
  font-weight: 800;
  color: #1a2332;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.place-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;
  color: #8a95a8;
  word-break: break-word;
}

.place-desc {
  font-size: 12.5px;
  color: #5a6478;
  line-height: 1.65;
  margin: 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.place-note {
  font-size: 11.5px;
  line-height: 1.55;
  padding: 9px 12px;
  border-radius: 10px;
  background: rgba(76, 175, 80, 0.07);
  border-left: 3px solid #4caf50;
  color: #2e7d32;
  word-break: break-word;
}

.place-note.rejected {
  background: rgba(198, 40, 40, 0.06);
  border-left-color: #c62828;
  color: #b71c1c;
}

.note-label {
  font-weight: 800;
  margin-right: 6px;
}

.place-actions {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid #f2f5f9;
  margin-top: 2px;
}

.btn-ghost,
.btn-approve,
.btn-reject,
.btn-remove {
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
}

.btn-ghost {
  background: #f4f6f9;
  color: #5a6478;
}

.btn-ghost:hover { background: #e8ebef; }

.btn-approve {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: #fff;
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.28);
}

.btn-approve:hover { transform: translateY(-1px); }

.btn-reject {
  background: #fff;
  border-color: #ffcdd2;
  color: #d32f2f;
}

.btn-reject:hover { background: #fff5f5; }

.btn-remove {
  background: transparent;
  color: #b0bac7;
  margin-left: auto;
}

.btn-remove:hover { color: #d32f2f; }

.places-empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 52px 0;
  background: #fff;
  border-radius: 18px;
}

.empty-emoji { font-size: 34px; opacity: 0.5; }
.empty-text { font-size: 13px; color: #a0aab8; }

/* ==============================
   弹窗通用
   ============================== */
.pl-overlay {
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

.pl-modal,
.review-modal,
.upload-modal {
  background: #fff;
  border-radius: 22px;
  width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.pl-modal { max-width: 560px; }
.review-modal { max-width: 460px; }
.upload-modal { max-width: 560px; }

.pl-modal.is-mobile,
.review-modal.is-mobile,
.upload-modal.is-mobile {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  align-self: flex-end;
}

.pl-banner {
  padding: 20px 22px 18px;
  color: #fff;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.pl-banner::after {
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

.banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}

.banner-status {
  font-size: 11.5px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.22);
  padding: 4px 12px;
  border-radius: 20px;
}

.banner-close {
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
  flex-shrink: 0;
}

.banner-close:hover { background: rgba(255, 255, 255, 0.42); }

.banner-close.dark {
  background: #f4f6f9;
  color: #7a8599;
}

.banner-close.dark:hover { background: #e8ebef; color: #1a2332; }

.banner-title {
  font-size: 20px;
  margin: 0 0 8px 0;
  font-weight: 800;
  line-height: 1.35;
  word-break: break-word;
  position: relative;
  z-index: 1;
}

.banner-meta {
  font-size: 12.5px;
  opacity: 0.92;
  position: relative;
  z-index: 1;
  word-break: break-word;
}

.pl-body {
  padding: 18px 22px;
  overflow-y: auto;
  flex: 1;
}

.pl-desc {
  font-size: 13px;
  color: #5a6478;
  line-height: 1.75;
  margin: 0 0 14px 0;
  word-break: break-word;
}

.pl-section {
  background: linear-gradient(135deg, #fffdf5, #fff8e1);
  border-left: 3px solid #d4a017;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.pl-section-label {
  font-size: 11.5px;
  font-weight: 800;
  color: #b8860b;
  margin-bottom: 6px;
}

.pl-section-text {
  font-size: 12.5px;
  color: #5d4e00;
  line-height: 1.7;
  margin: 0;
  word-break: break-word;
}

.pl-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 14px;
}

.pl-highlight {
  font-size: 11.5px;
  color: #d32f2f;
  background: rgba(211, 47, 47, 0.08);
  padding: 5px 12px;
  border-radius: 16px;
  font-weight: 600;
  word-break: break-word;
}

.pl-info {
  background: #fafbfc;
  border-radius: 12px;
  padding: 13px 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.pl-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}

.pl-info-label { color: #a0aab8; font-weight: 700; flex-shrink: 0; }
.pl-info-value { color: #33415c; font-weight: 600; text-align: right; word-break: break-word; }

.pl-note {
  font-size: 12px;
  line-height: 1.6;
  padding: 11px 14px;
  border-radius: 11px;
  background: rgba(76, 175, 80, 0.07);
  border-left: 3px solid #4caf50;
  color: #2e7d32;
  word-break: break-word;
}

.pl-note.rejected {
  background: rgba(198, 40, 40, 0.06);
  border-left-color: #c62828;
  color: #b71c1c;
}

.pl-footer,
.review-footer,
.upload-footer {
  display: flex;
  gap: 9px;
  padding: 14px 22px calc(18px + env(safe-area-inset-bottom, 0px));
  border-top: 1.5px solid #f2f5f9;
  flex-shrink: 0;
}

.btn-approve.wide,
.btn-reject.wide {
  flex: 1;
  padding: 12px;
  font-size: 13.5px;
}

/* 审核弹窗 */
.review-head,
.upload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 21px;
  border-bottom: 1.5px solid #f2f5f9;
  flex-shrink: 0;
}

.review-title,
.upload-title {
  font-size: 16px;
  font-weight: 800;
  color: #1a2332;
}

.review-body,
.upload-body {
  padding: 18px 21px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.review-target {
  background: #fafbfc;
  border-radius: 12px;
  padding: 12px 14px;
}

.review-target-name {
  font-size: 14px;
  font-weight: 800;
  color: #1a2332;
  margin-bottom: 4px;
  word-break: break-word;
}

.review-target-meta {
  font-size: 11.5px;
  color: #8a95a8;
  word-break: break-word;
}

/* 表单 */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #7a8599;
}

.field-hint {
  font-weight: 600;
  color: #b0bac7;
  font-size: 10.5px;
}

.field-input,
.field-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #e8ecf2;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  color: #1a2332;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: #fff;
}

.field-input:focus,
.field-textarea:focus {
  border-color: #d32f2f;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.08);
}

.field-textarea { resize: vertical; line-height: 1.6; }

.era-picker { display: flex; gap: 7px; }

.era-option {
  flex: 1;
  padding: 10px;
  background: #fafbfc;
  border: 1.5px solid #eef1f5;
  border-radius: 10px;
  color: #7a8599;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.era-option.active {
  background: linear-gradient(135deg, #d32f2f, #c62828);
  border-color: transparent;
  color: #fff;
}

.picker-map {
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #eef1f5;
}

:deep(.picker-marker-host) { background: transparent; border: none; }

:deep(.picker-marker) {
  width: 30px;
  height: 30px;
  color: #c52237;
  line-height: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.picker-coord {
  font-size: 11.5px;
  color: #8a95a8;
  font-weight: 600;
  margin-top: 6px;
}

.form-error {
  font-size: 12px;
  color: #b26a00;
  background: rgba(255, 152, 0, 0.1);
  border: 1.5px solid rgba(255, 152, 0, 0.25);
  border-radius: 10px;
  padding: 9px 12px;
  line-height: 1.5;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f4f6f9;
  border: none;
  border-radius: 11px;
  color: #7a8599;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.btn-cancel:hover { background: #e8ebef; }

.btn-confirm {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border: none;
  border-radius: 11px;
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 5px 16px rgba(76, 175, 80, 0.3);
}

.btn-confirm.reject {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  box-shadow: 0 5px 16px rgba(211, 47, 47, 0.3);
}

.btn-confirm:hover { transform: translateY(-1px); }

@media (max-width: 768px) {
  .pl-overlay { padding: 0; align-items: flex-end; }
  .banner-title { font-size: clamp(16px, 4.5vw, 19px); }
  .pl-body { padding: 15px 16px; }
  .pl-banner { padding: 16px 16px 14px; }
  .review-body, .upload-body { padding: 15px 16px; }
  .review-head, .upload-head { padding: 14px 16px; }
  .field-row { grid-template-columns: 1fr; }
  .pl-footer, .review-footer, .upload-footer {
    padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
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
.pc-places-header,
.m-places-header {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(150, 47, 63, 0.09);
  background:
    radial-gradient(circle at 92% 10%, rgba(255, 255, 255, 0.9) 0 7%, transparent 7.3%),
    radial-gradient(circle at 80% 20%, rgba(197, 34, 55, 0.08), transparent 25%),
    linear-gradient(135deg, #fffaf7 0%, #fff0ed 55%, #f8dde2 100%);
  box-shadow: 0 16px 42px rgba(101, 35, 48, 0.07);
}

.pc-places-header {
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

.pc-stat,
.m-stat {
  border: 1px solid rgba(143, 61, 76, 0.08);
  border-radius: 15px;
  box-shadow: 0 8px 22px rgba(52, 33, 39, 0.055);
}

.pc-btn-upload,
.m-btn-upload {
  border-radius: 14px;
  background: linear-gradient(135deg, #c52237, #901528);
  box-shadow: 0 9px 22px rgba(147, 25, 44, 0.22);
}

.filter-chip {
  border-color: rgba(126, 71, 82, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
}

.filter-chip.active {
  background: linear-gradient(135deg, #c52237, #941629);
  box-shadow: 0 6px 18px rgba(145, 25, 44, 0.2);
}

.places-filters.is-mobile {
  padding-inline: 1px 20px;
  mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
}

.place-card {
  border-color: rgba(139, 62, 76, 0.09);
  border-radius: 19px;
  box-shadow: 0 8px 24px rgba(45, 32, 37, 0.055);
}

.place-card:hover {
  transform: translateY(-2px);
  border-color: rgba(197, 34, 55, 0.2);
  box-shadow: 0 14px 32px rgba(106, 34, 48, 0.1);
}

.place-card-bar {
  width: 4px;
}

.place-status,
.place-era,
.place-category {
  border: 1px solid rgba(117, 70, 79, 0.06);
}

.place-note {
  border-radius: 12px;
}

.btn-ghost,
.btn-approve,
.btn-reject,
.btn-remove {
  border-radius: 10px;
}

.pl-modal,
.review-modal,
.upload-modal {
  border: 1px solid rgba(138, 65, 79, 0.09);
  border-radius: 24px;
}

.btn-confirm {
  border-radius: 12px;
}

@media (max-width: 768px) {
  .places-page {
    gap: 16px;
    padding-top: 15px;
  }

  .m-places-header {
    padding: 20px 17px 17px;
    border-radius: 23px;
  }

  .m-header-title {
    font-size: clamp(21px, 5.8vw, 26px);
  }

  .m-stat {
    border-radius: 13px;
  }

  .place-card {
    border-radius: 17px;
  }
}
</style>
