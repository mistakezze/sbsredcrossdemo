<template>
  <div class="admin-page">
    <header class="admin-hero">
      <div class="admin-hero-copy">
        <span class="admin-eyebrow">
          <AppIcon name="shield" size="14" />
          管理员工作台
        </span>
        <h1>{{ currentSection.title }}</h1>
        <p>{{ currentSection.description }}</p>
      </div>

      <div class="admin-hero-side">
        <span class="admin-access-state">
          <span class="admin-access-dot"></span>
          管理权限已启用
        </span>
        <div class="admin-summary">
          <div class="admin-summary-item">
            <strong>{{ placeStats.pending }}</strong>
            <span>待审核地点</span>
          </div>
          <div class="admin-summary-item">
            <strong>{{ activityReviewStats.pending }}</strong>
            <span>待审核活动</span>
          </div>
          <div class="admin-summary-item">
            <strong>{{ allReviews.length }}</strong>
            <span>评价总数</span>
          </div>
        </div>
      </div>
    </header>

    <section v-if="activeSection === 'places'" class="admin-panel">
      <div class="admin-section-head">
        <div>
          <span class="admin-section-kicker">REVIEW QUEUE</span>
          <h2>待审核地点</h2>
        </div>
        <span class="admin-section-count">{{ pendingPlaces.length }} 项待处理</span>
      </div>

      <div v-if="pendingPlaces.length" class="admin-card-list place-review-list">
        <article v-for="item in pendingPlaces" :key="item.id" class="admin-card place-review-card">
          <div class="admin-card-top">
            <div class="admin-card-tags">
              <span class="admin-tag status-pending">
                <AppIcon name="clock" size="11" /> 待审核
              </span>
              <span class="admin-tag">
                <AppIcon :name="item.era === 'history' ? 'historic' : 'city'" size="11" />
                {{ item.era === 'history' ? '历史' : '现代' }}
              </span>
              <span class="admin-tag">{{ item.category }}</span>
            </div>
            <button class="admin-icon-btn danger" aria-label="删除地点提交" @click="requestDeletePlace(item)">
              <AppIcon name="trash" size="15" />
            </button>
          </div>

          <h3>{{ item.name }}</h3>
          <div class="admin-meta-row">
            <span><AppIcon name="pin" size="12" /> {{ item.location }}</span>
            <span><AppIcon name="user" size="12" /> {{ item.submitterName }}</span>
            <span><AppIcon name="clock" size="12" /> {{ formatSubmitTime(item.createdAt) }}</span>
          </div>
          <p class="admin-card-desc">{{ item.description }}</p>

          <div v-if="item.highlights.length" class="admin-chip-list">
            <span v-for="highlight in item.highlights.slice(0, 4)" :key="highlight">{{ highlight }}</span>
          </div>

          <footer class="admin-card-actions">
            <button class="admin-action primary" @click="openDecision(item, 'approve')">
              <AppIcon name="check" size="14" /> 通过
            </button>
            <button class="admin-action reject" @click="openDecision(item, 'reject')">
              <AppIcon name="x" size="14" /> 驳回
            </button>
          </footer>
        </article>
      </div>

      <div v-else class="admin-empty">
        <span class="admin-empty-icon"><AppIcon name="inbox" size="30" /></span>
        <h3>审核队列已清空</h3>
        <p>当前没有新的地点提交，新的审核任务会显示在这里。</p>
      </div>
    </section>

    <section v-else-if="activeSection === 'activities'" class="admin-panel">
      <div class="admin-section-head with-filter">
        <div>
          <span class="admin-section-kicker">ACTIVITY CONTROL</span>
          <h2>活动审核与管理</h2>
        </div>
        <div class="admin-review-filters">
          <button
            v-for="filter in activityFilters"
            :key="filter.key"
            class="admin-filter-btn"
            :class="{ active: activityFilter === filter.key }"
            @click="activityFilter = filter.key"
          >
            {{ filter.label }}
            <span>{{ filter.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="filteredActivities.length" class="admin-card-list activity-admin-list">
        <article v-for="activity in filteredActivities" :key="activity.id" class="admin-card activity-admin-card">
          <div class="activity-accent" :style="{ background: activityTypeOf(activity).color }"></div>
          <div class="admin-card-top">
            <div class="admin-card-tags">
              <span
                class="admin-tag"
                :style="{
                  color: ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].color,
                  background: ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].color + '16'
                }"
              >
                <AppIcon :name="ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].icon" size="11" />
                {{ ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].label }}
              </span>
              <span
                class="admin-tag type-tag"
                :style="{
                  color: activityTypeOf(activity).color,
                  background: activityTypeOf(activity).color + '16'
                }"
              >
                <AppIcon :name="activityTypeOf(activity).icon" size="11" />
                {{ activityTypeOf(activity).label }}
              </span>
              <span
                class="admin-tag"
                :style="{
                  color: ACTIVITY_STATUS[activityStatus(activity)].color,
                  background: ACTIVITY_STATUS[activityStatus(activity)].color + '16'
                }"
              >
                {{ ACTIVITY_STATUS[activityStatus(activity)].label }}
              </span>
            </div>
            <button class="admin-icon-btn danger" aria-label="删除活动" @click="requestDeleteActivity(activity)">
              <AppIcon name="trash" size="15" />
            </button>
          </div>

          <h3>{{ activity.title }}</h3>
          <div class="admin-meta-row">
            <span><AppIcon name="calendar" size="12" /> {{ formatActivityTime(activity.startTime) }}</span>
            <span><AppIcon name="pin" size="12" /> {{ activity.venue }}</span>
            <span><AppIcon name="users" size="12" /> {{ enrolledCount(activity.id) }} / {{ activity.capacity }} 人</span>
          </div>
          <p class="admin-card-desc">{{ activity.desc }}</p>
          <div v-if="activity.reviewNote" class="admin-activity-review-note">
            <span>审核意见</span>
            <p>{{ activity.reviewNote }}</p>
          </div>
          <footer v-if="reviewStatusOf(activity) === 'pending'" class="admin-card-actions">
            <button class="admin-action primary" @click="openActivityDecision(activity, 'approve')">
              <AppIcon name="check" size="14" /> 通过
            </button>
            <button class="admin-action reject" @click="openActivityDecision(activity, 'reject')">
              <AppIcon name="x" size="14" /> 驳回
            </button>
          </footer>
          <div class="admin-card-foot">
            <span>发布方：{{ activity.organizerName }}</span>
            <button class="admin-text-action" @click="openReviewSectionForActivity(activity.id)">
              查看相关评论
              <AppIcon name="arrowRight" size="13" />
            </button>
          </div>
        </article>
      </div>

      <div v-else class="admin-empty">
        <span class="admin-empty-icon"><AppIcon name="calendar" size="30" /></span>
        <h3>{{ activityEmptyText }}</h3>
        <p>新的活动发布申请会显示在这里。</p>
      </div>
    </section>

    <section v-else class="admin-panel">
      <div class="admin-section-head with-filter">
        <div>
          <span class="admin-section-kicker">CONTENT MODERATION</span>
          <h2>评价与评论</h2>
        </div>
        <div class="admin-review-filters">
          <button
            v-for="filter in reviewFilters"
            :key="filter.key"
            class="admin-filter-btn"
            :class="{ active: reviewFilter === filter.key }"
            @click="changeReviewFilter(filter.key)"
          >
            {{ filter.label }}
            <span>{{ filter.count }}</span>
          </button>
        </div>
      </div>

      <div class="admin-rating-quickbar" aria-label="按评分快速筛选">
        <span class="admin-rating-title">
          <AppIcon name="starFill" size="13" />
          按评分快速查询
        </span>
        <div class="admin-rating-filters">
          <button
            v-for="filter in ratingFilters"
            :key="filter.key"
            class="admin-rating-btn"
            :class="[`is-${filter.key}`, { active: ratingFilter === filter.key }]"
            :aria-pressed="ratingFilter === filter.key"
            @click="ratingFilter = filter.key"
          >
            <span>{{ filter.label }}</span>
            <small>{{ filter.hint }}</small>
            <span class="admin-rating-count">{{ filter.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="focusedActivity" class="admin-review-focus">
        <span><AppIcon name="calendar" size="12" /> 仅显示「{{ focusedActivity.title }}」的评论</span>
        <button @click="clearActivityFocus">查看全部</button>
      </div>

      <div v-if="filteredReviews.length" class="admin-card-list review-admin-list">
        <article v-for="review in filteredReviews" :key="`${review.source}-${review.id}`" class="admin-card review-admin-card">
          <div class="admin-card-top">
            <span class="admin-tag source-tag">
              <AppIcon :name="review.source === 'place' ? 'pin' : 'calendar'" size="11" />
              {{ review.sourceLabel }}
            </span>
            <button class="admin-icon-btn danger" aria-label="删除评价" @click="requestDeleteReview(review)">
              <AppIcon name="trash" size="15" />
            </button>
          </div>

          <h3>{{ review.targetName }}</h3>
          <div class="review-author-row">
            <span class="review-author"><AppIcon name="user" size="12" /> {{ review.userName }}</span>
            <StarRating :model-value="review.rating" readonly size="small" />
            <span class="review-time">{{ formatReviewTime(review.timestamp) }}</span>
          </div>
          <p class="review-copy">{{ review.content || '未填写文字评价' }}</p>
        </article>
      </div>

      <div v-else class="admin-empty">
        <span class="admin-empty-icon"><AppIcon name="message" size="30" /></span>
        <h3>没有需要处理的评论</h3>
        <p>当前筛选条件下没有评价内容。</p>
      </div>
    </section>

    <transition name="admin-fade">
      <div v-if="decisionTarget" class="admin-overlay" @click.self="closeDecision">
        <article class="admin-dialog">
          <button class="admin-dialog-close" aria-label="关闭审核弹窗" @click="closeDecision">
            <AppIcon name="x" size="17" />
          </button>
          <div class="admin-dialog-icon" :class="{ reject: decisionAction === 'reject' }">
            <AppIcon :name="decisionAction === 'approve' ? 'check' : 'x'" size="22" />
          </div>
          <h2>{{ decisionAction === 'approve' ? '通过地点审核' : '驳回地点提交' }}</h2>
          <p>{{ decisionTarget.name }}</p>
          <label class="admin-field">
            <span>审核意见{{ decisionAction === 'reject' ? '（必填）' : '（选填）' }}</span>
            <textarea
              v-model="decisionNote"
              rows="4"
              :placeholder="decisionAction === 'approve' ? '信息核实无误，准予上线。' : '请说明需要补充或修改的内容。'"
            ></textarea>
          </label>
          <p v-if="decisionError" class="admin-form-error">{{ decisionError }}</p>
          <footer class="admin-dialog-actions">
            <button class="admin-action ghost" @click="closeDecision">取消</button>
            <button
              class="admin-action"
              :class="decisionAction === 'approve' ? 'primary' : 'reject'"
              @click="submitDecision"
            >
              确认{{ decisionAction === 'approve' ? '通过' : '驳回' }}
            </button>
          </footer>
        </article>
      </div>
    </transition>

    <transition name="admin-fade">
      <div v-if="activityDecisionTarget" class="admin-overlay" @click.self="closeActivityDecision">
        <article class="admin-dialog">
          <button class="admin-dialog-close" aria-label="关闭活动审核弹窗" @click="closeActivityDecision">
            <AppIcon name="x" size="17" />
          </button>
          <div class="admin-dialog-icon" :class="{ reject: activityDecisionAction === 'reject' }">
            <AppIcon :name="activityDecisionAction === 'approve' ? 'check' : 'x'" size="22" />
          </div>
          <h2>{{ activityDecisionAction === 'approve' ? '通过活动审核' : '驳回活动申请' }}</h2>
          <p>{{ activityDecisionTarget.title }}</p>
          <label class="admin-field">
            <span>审核意见{{ activityDecisionAction === 'reject' ? '（必填）' : '（选填）' }}</span>
            <textarea
              v-model="activityDecisionNote"
              rows="4"
              :placeholder="activityDecisionAction === 'approve' ? '活动信息完整，审核通过。' : '请说明活动需要修改或补充的内容。'"
            ></textarea>
          </label>
          <p v-if="activityDecisionError" class="admin-form-error">{{ activityDecisionError }}</p>
          <footer class="admin-dialog-actions">
            <button class="admin-action ghost" @click="closeActivityDecision">取消</button>
            <button
              class="admin-action"
              :class="activityDecisionAction === 'approve' ? 'primary' : 'reject'"
              @click="submitActivityDecision"
            >
              确认{{ activityDecisionAction === 'approve' ? '通过' : '驳回' }}
            </button>
          </footer>
        </article>
      </div>
    </transition>

    <transition name="admin-fade">
      <div v-if="deleteTarget" class="admin-overlay" @click.self="closeDelete">
        <article class="admin-dialog confirm-dialog">
          <button class="admin-dialog-close" aria-label="关闭删除确认" @click="closeDelete">
            <AppIcon name="x" size="17" />
          </button>
          <div class="admin-dialog-icon delete">
            <AppIcon name="trash" size="21" />
          </div>
          <h2>{{ deleteTarget.title }}</h2>
          <p>{{ deleteTarget.description }}</p>
          <footer class="admin-dialog-actions">
            <button class="admin-action ghost" @click="closeDelete">取消</button>
            <button class="admin-action reject" @click="confirmDelete">确认删除</button>
          </footer>
        </article>
      </div>
    </transition>

    <transition name="admin-toast">
      <div v-if="notice" class="admin-notice" role="status">
        <AppIcon name="check" size="14" />
        {{ notice }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ADMIN_SECTIONS } from '../config/adminSections'
import { useUserStore } from '../stores/userStore'
import {
  usePlaceSubmitStore,
  formatSubmitTime
} from '../stores/locationSubmitStore'
import { useLocationStore } from '../stores/locationStore'
import {
  useActivityStore,
  ACTIVITY_TYPES,
  ACTIVITY_REVIEW_STATUS,
  STATUS_META as ACTIVITY_STATUS,
  activityStatus,
  reviewStatusOf,
  formatActivityTime,
  formatReviewTime
} from '../stores/activityStore'
import { useReviewStore } from '../stores/reviewStore'
import StarRating from '../components/StarRating.vue'

const route = useRoute()
const router = useRouter()
const { currentUser, can } = useUserStore()

const {
  pendingList,
  stats: placeStats,
  approve,
  reject,
  removeSubmission
} = usePlaceSubmitStore()

const { locations, getLocationById } = useLocationStore()
const {
  activities,
  reviews: activityReviews,
  activityReviewStats,
  enrolledCount,
  approveActivity,
  rejectActivity,
  removeReview: removeActivityReview,
  removeActivity
} = useActivityStore()
const {
  reviews: locationReviews,
  removeReview: removeLocationReview
} = useReviewStore()

const activeSection = computed(() => route.meta.adminSection || 'places')
const currentSection = computed(
  () => ADMIN_SECTIONS.find(section => section.key === activeSection.value) || ADMIN_SECTIONS[0]
)

const pendingPlaces = computed(() => pendingList.value)

const allReviews = computed(() => {
  const placeItems = locationReviews.value.map(review => ({
    ...review,
    source: 'place',
    sourceLabel: '地点评价',
    targetName: getLocationById(review.locationId)?.name || '已移除的地点'
  }))
  const activityItems = activityReviews.value.map(review => {
    const activity = activities.value.find(item => item.id === review.activityId)
    return {
      ...review,
      source: 'activity',
      sourceLabel: '活动评论',
      targetName: activity?.title || '已移除的活动'
    }
  })
  return [...placeItems, ...activityItems].sort((a, b) => b.timestamp - a.timestamp)
})

const focusedActivityId = computed(() => Number(route.query.activity) || null)
const focusedActivity = computed(
  () => activities.value.find(activity => activity.id === focusedActivityId.value) || null
)
const reviewFilter = ref(route.query.activity ? 'activity' : 'all')
const ratingFilter = ref('all')
const reviewFilters = computed(() => [
  { key: 'all', label: '全部', count: allReviews.value.length },
  {
    key: 'place',
    label: '地点',
    count: allReviews.value.filter(review => review.source === 'place').length
  },
  {
    key: 'activity',
    label: '活动',
    count: allReviews.value.filter(review => review.source === 'activity').length
  }
])

const scopedReviews = computed(() => {
  let list = allReviews.value
  if (reviewFilter.value !== 'all') {
    list = list.filter(review => review.source === reviewFilter.value)
  }
  if (focusedActivityId.value) {
    list = list.filter(
      review => review.source === 'activity' && review.activityId === focusedActivityId.value
    )
  }
  return list
})

const ratingFilters = computed(() => [
  { key: 'all', label: '全部', hint: '所有评分', count: scopedReviews.value.length },
  {
    key: 'positive',
    label: '好评',
    hint: '4–5 星',
    count: scopedReviews.value.filter(review => review.rating >= 4).length
  },
  {
    key: 'neutral',
    label: '中评',
    hint: '3 星',
    count: scopedReviews.value.filter(review => review.rating === 3).length
  },
  {
    key: 'negative',
    label: '差评',
    hint: '1–2 星',
    count: scopedReviews.value.filter(review => review.rating <= 2).length
  }
])

const filteredReviews = computed(() => {
  if (ratingFilter.value === 'all') return scopedReviews.value
  if (ratingFilter.value === 'positive') {
    return scopedReviews.value.filter(review => review.rating >= 4)
  }
  if (ratingFilter.value === 'neutral') {
    return scopedReviews.value.filter(review => review.rating === 3)
  }
  return scopedReviews.value.filter(review => review.rating <= 2)
})

const sortedActivities = computed(() =>
  [...activities.value].sort((a, b) => {
    const aEnded = activityStatus(a) === 'ended'
    const bEnded = activityStatus(b) === 'ended'
    if (aEnded !== bEnded) return aEnded ? 1 : -1
    return aEnded ? b.startTime - a.startTime : a.startTime - b.startTime
  })
)

const activityTypeOf = (activity) => ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.volunteer
const activityFilter = ref('pending')
const activityFilters = computed(() => [
  { key: 'pending', label: '待审核', count: activityReviewStats.value.pending },
  { key: 'approved', label: '已通过', count: activityReviewStats.value.approved },
  { key: 'rejected', label: '已驳回', count: activityReviewStats.value.rejected },
  { key: 'all', label: '全部', count: activities.value.length }
])
const filteredActivities = computed(() =>
  sortedActivities.value.filter(activity =>
    activityFilter.value === 'all' || reviewStatusOf(activity) === activityFilter.value
  )
)
const activityEmptyText = computed(() => {
  if (activityFilter.value === 'pending') return '暂无待审核活动'
  if (activityFilter.value === 'rejected') return '暂无已驳回活动'
  if (activityFilter.value === 'approved') return '暂无已通过活动'
  return '暂无活动'
})

const decisionTarget = ref(null)
const decisionAction = ref('approve')
const decisionNote = ref('')
const decisionError = ref('')
const activityDecisionTarget = ref(null)
const activityDecisionAction = ref('approve')
const activityDecisionNote = ref('')
const activityDecisionError = ref('')
const deleteTarget = ref(null)
const notice = ref('')
let noticeTimer = null
let previousOverflow = ''

const lockBody = () => {
  if (!document.body.style.overflow) previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

const unlockBody = () => {
  document.body.style.overflow = previousOverflow
  previousOverflow = ''
}

const closeDecision = () => {
  decisionTarget.value = null
  decisionNote.value = ''
  decisionError.value = ''
  unlockBody()
}

const openDecision = (item, action) => {
  if (!can('moderate')) return
  decisionTarget.value = item
  decisionAction.value = action
  decisionNote.value = ''
  decisionError.value = ''
  lockBody()
}

const notify = (message) => {
  notice.value = message
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    notice.value = ''
  }, 2400)
}

const submitDecision = () => {
  if (!decisionTarget.value || !can('moderate')) return
  if (decisionAction.value === 'reject' && !decisionNote.value.trim()) {
    decisionError.value = '驳回时必须填写审核意见'
    return
  }

  if (decisionAction.value === 'approve') {
    approve(decisionTarget.value.id, decisionNote.value)
    notify('地点已通过审核')
  } else {
    reject(decisionTarget.value.id, decisionNote.value)
    notify('地点提交已驳回')
  }
  closeDecision()
}

const closeActivityDecision = () => {
  activityDecisionTarget.value = null
  activityDecisionNote.value = ''
  activityDecisionError.value = ''
  unlockBody()
}

const openActivityDecision = (activity, action) => {
  if (!can('moderate')) return
  activityDecisionTarget.value = activity
  activityDecisionAction.value = action
  activityDecisionNote.value = ''
  activityDecisionError.value = ''
  lockBody()
}

const submitActivityDecision = () => {
  if (!activityDecisionTarget.value || !can('moderate')) return
  if (activityDecisionAction.value === 'reject' && !activityDecisionNote.value.trim()) {
    activityDecisionError.value = '驳回活动时必须填写审核意见'
    return
  }

  if (activityDecisionAction.value === 'approve') {
    approveActivity(activityDecisionTarget.value.id, activityDecisionNote.value, currentUser.value)
    notify('活动已通过审核并公开展示')
  } else {
    rejectActivity(activityDecisionTarget.value.id, activityDecisionNote.value, currentUser.value)
    notify('活动申请已驳回')
  }
  closeActivityDecision()
}

const closeDelete = () => {
  deleteTarget.value = null
  unlockBody()
}

const requestDeletePlace = (item) => {
  deleteTarget.value = {
    kind: 'place',
    id: item.id,
    title: '删除地点提交？',
    description: `「${item.name}」的提交记录将被永久删除。`
  }
  lockBody()
}

const requestDeleteActivity = (activity) => {
  deleteTarget.value = {
    kind: 'activity',
    id: activity.id,
    title: '删除活动？',
    description: `「${activity.title}」及其报名、评论记录都会被删除。`
  }
  lockBody()
}

const requestDeleteReview = (review) => {
  deleteTarget.value = {
    kind: 'review',
    source: review.source,
    id: review.id,
    title: '删除这条评价？',
    description: `${review.userName} 对「${review.targetName}」的评价将被永久删除。`
  }
  lockBody()
}

const confirmDelete = () => {
  if (!deleteTarget.value || !can('moderate')) return
  const target = deleteTarget.value
  if (target.kind === 'place') {
    removeSubmission(target.id)
    notify('地点提交已删除')
  } else if (target.kind === 'activity') {
    removeActivity(target.id)
    notify('活动已删除')
  } else if (target.source === 'place') {
    removeLocationReview(target.id)
    notify('地点评价已删除')
  } else {
    removeActivityReview(target.id)
    notify('活动评论已删除')
  }
  closeDelete()
}

const openReviewSectionForActivity = (activityId) => {
  reviewFilter.value = 'activity'
  ratingFilter.value = 'all'
  router.push({ path: '/admin/reviews', query: { activity: String(activityId) } })
}

const changeReviewFilter = (key) => {
  reviewFilter.value = key
  if (focusedActivityId.value) {
    router.replace({ path: '/admin/reviews' })
  }
}

const clearActivityFocus = () => {
  router.replace({ path: '/admin/reviews' })
}

const closeOverlays = () => {
  decisionTarget.value = null
  activityDecisionTarget.value = null
  deleteTarget.value = null
  unlockBody()
}

watch(
  () => route.fullPath,
  () => {
    closeOverlays()
    if (route.name === 'AdminReviews') {
      reviewFilter.value = route.query.activity ? 'activity' : reviewFilter.value
    }
  }
)

onBeforeUnmount(() => {
  window.clearTimeout(noticeTimer)
  unlockBody()
})
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0 36px;
}

.admin-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding: 29px 30px;
  border: 1px solid rgba(254, 238, 225, 0.16);
  border-radius: 28px;
  background:
    radial-gradient(circle at 88% 10%, rgba(239, 86, 84, 0.4), transparent 31%),
    radial-gradient(circle at 10% 120%, rgba(129, 2, 31, 0.46), transparent 37%),
    linear-gradient(125deg, #36000d 0%, #650019 56%, #81021f 100%);
  color: var(--palette-lotus-white);
  box-shadow: 0 20px 46px rgba(76, 0, 19, 0.2);
}

.admin-hero::before,
.admin-hero::after {
  content: "";
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(254, 238, 225, 0.09);
  border-radius: 50%;
  pointer-events: none;
}

.admin-hero::before {
  right: -75px;
  top: -112px;
  width: 280px;
  height: 280px;
}

.admin-hero::after {
  right: 85px;
  bottom: -168px;
  width: 240px;
  height: 240px;
}

.admin-hero-copy {
  max-width: 700px;
}

.admin-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 15px;
  padding: 6px 10px;
  border: 1px solid rgba(254, 238, 225, 0.16);
  border-radius: 999px;
  background: rgba(254, 238, 225, 0.1);
  color: rgba(254, 238, 225, 0.82);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
}

#app .admin-hero h1 {
  margin: 0;
  color: var(--palette-lotus-white);
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 760;
  letter-spacing: -0.045em;
}

.admin-hero-copy > p {
  max-width: 620px;
  margin-top: 9px;
  color: rgba(254, 238, 225, 0.68);
  font-size: 13px;
  line-height: 1.7;
}

.admin-hero-side {
  min-width: min(410px, 42%);
}

.admin-access-state {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  margin-bottom: 11px;
  color: rgba(254, 238, 225, 0.66);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.admin-access-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8ee4a5;
  box-shadow: 0 0 0 4px rgba(142, 228, 165, 0.11);
}

.admin-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  padding: 5px;
  border: 1px solid rgba(254, 238, 225, 0.12);
  border-radius: 17px;
  background: rgba(27, 0, 8, 0.2);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.admin-summary-item {
  min-width: 88px;
  padding: 11px 10px;
  border-radius: 12px;
  background: rgba(254, 238, 225, 0.09);
  text-align: center;
}

.admin-summary-item strong {
  display: block;
  color: #ffaeaa;
  font-size: 22px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.admin-summary-item span {
  display: block;
  margin-top: 4px;
  color: rgba(254, 238, 225, 0.6);
  font-size: 9px;
  white-space: nowrap;
}

.admin-panel {
  padding: 23px;
  border: 1px solid var(--apple-separator);
  border-radius: 24px;
  background: var(--apple-surface);
  box-shadow: var(--apple-shadow);
  backdrop-filter: blur(18px) saturate(122%);
  -webkit-backdrop-filter: blur(18px) saturate(122%);
}

.admin-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 17px;
}

.admin-section-head.with-filter {
  align-items: center;
}

.admin-section-kicker {
  display: block;
  margin-bottom: 3px;
  color: var(--palette-silver-red);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.13em;
}

.admin-section-head h2 {
  margin: 0;
  color: var(--apple-ink);
  font-size: 21px;
  font-weight: 720;
  letter-spacing: -0.03em;
}

.admin-section-count {
  padding: 5px 9px;
  border-radius: 8px;
  background: rgba(129, 2, 31, 0.055);
  color: var(--apple-secondary);
  font-size: 10px;
  font-weight: 600;
}

.admin-card-list {
  display: grid;
  gap: 11px;
}

.activity-admin-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.review-admin-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-card {
  position: relative;
  min-width: 0;
  padding: 17px;
  overflow: hidden;
  border: 1px solid rgba(129, 2, 31, 0.085);
  border-radius: 17px;
  background: rgba(255, 250, 244, 0.82);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.admin-card:hover {
  transform: translateY(-1px);
  border-color: rgba(239, 86, 84, 0.24);
  box-shadow: 0 11px 26px rgba(82, 3, 23, 0.07);
}

.admin-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.admin-card-tags {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.admin-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 7px;
  background: rgba(129, 2, 31, 0.055);
  color: var(--apple-secondary);
  font-size: 9px;
  font-weight: 650;
  line-height: 1.55;
}

.admin-tag.status-pending {
  background: rgba(249, 168, 37, 0.13);
  color: #a26a00;
}

.admin-card h3 {
  margin: 11px 0 7px;
  color: var(--apple-ink);
  font-size: 16px;
  font-weight: 710;
  letter-spacing: -0.02em;
}

.admin-meta-row {
  display: flex;
  align-items: center;
  gap: 8px 13px;
  flex-wrap: wrap;
  color: var(--apple-tertiary);
  font-size: 10px;
}

.admin-meta-row span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.admin-card-desc {
  display: -webkit-box;
  margin: 10px 0 0;
  overflow: hidden;
  color: var(--apple-secondary);
  font-size: 11.5px;
  line-height: 1.72;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.admin-activity-review-note {
  margin-top: 11px;
  padding: 9px 10px;
  border-left: 3px solid var(--palette-silver-red);
  border-radius: 9px;
  background: rgba(239, 86, 84, 0.07);
}

.admin-activity-review-note span {
  display: block;
  color: var(--palette-burgundy);
  font-size: 8.5px;
  font-weight: 720;
}

.admin-activity-review-note p {
  margin-top: 3px;
  color: var(--apple-secondary);
  font-size: 10px;
  line-height: 1.62;
}

.admin-chip-list {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.admin-chip-list span {
  padding: 3px 7px;
  border-radius: 6px;
  background: rgba(239, 86, 84, 0.09);
  color: var(--palette-burgundy);
  font-size: 9px;
  font-weight: 600;
}

.admin-card-actions {
  display: flex;
  gap: 7px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(129, 2, 31, 0.075);
}

.admin-action {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 13px;
  border: 1px solid rgba(129, 2, 31, 0.11);
  border-radius: 10px;
  background: rgba(254, 238, 225, 0.72);
  color: var(--apple-ink);
  font-family: inherit;
  font-size: 11px;
  font-weight: 680;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.admin-action:hover {
  transform: translateY(-1px);
}

.admin-action.primary {
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(180deg, #f66c68, var(--palette-silver-red));
  color: var(--palette-burgundy-deep);
  box-shadow: 0 6px 15px rgba(129, 2, 31, 0.12);
}

.admin-action.reject {
  border-color: rgba(129, 2, 31, 0.14);
  background: rgba(129, 2, 31, 0.07);
  color: var(--palette-burgundy);
}

.admin-action.ghost {
  background: transparent;
  color: var(--apple-secondary);
}

.admin-icon-btn {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid rgba(129, 2, 31, 0.1);
  border-radius: 9px;
  background: rgba(255, 250, 244, 0.74);
  color: var(--apple-secondary);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.admin-icon-btn.danger:hover {
  background: rgba(129, 2, 31, 0.09);
  color: var(--palette-burgundy);
}

.activity-accent {
  position: absolute;
  top: 17px;
  bottom: 17px;
  left: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
}

.admin-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 13px;
  padding-top: 11px;
  border-top: 1px solid rgba(129, 2, 31, 0.075);
  color: var(--apple-tertiary);
  font-size: 9.5px;
}

.admin-text-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--palette-burgundy);
  font-family: inherit;
  font-size: 9.5px;
  font-weight: 650;
  cursor: pointer;
}

.admin-review-filters {
  display: flex;
  gap: 5px;
  padding: 3px;
  border-radius: 11px;
  background: rgba(129, 2, 31, 0.055);
}

.admin-rating-quickbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 13px;
  padding: 8px;
  border: 1px solid rgba(129, 2, 31, 0.085);
  border-radius: 14px;
  background: rgba(254, 238, 225, 0.48);
}

.admin-rating-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-left: 4px;
  color: var(--apple-secondary);
  font-size: 10px;
  font-weight: 680;
}

.admin-rating-title .app-icon {
  color: var(--palette-silver-red);
}

.admin-rating-filters {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
}

.admin-rating-btn {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  gap: 0 6px;
  padding: 7px 9px;
  border: 1px solid rgba(129, 2, 31, 0.075);
  border-radius: 10px;
  background: rgba(255, 250, 244, 0.76);
  color: var(--apple-secondary);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.admin-rating-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(239, 86, 84, 0.24);
  background: rgba(255, 250, 244, 0.96);
}

.admin-rating-btn > span:first-child {
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.25;
}

.admin-rating-btn small {
  color: var(--apple-tertiary);
  font-size: 8.5px;
  line-height: 1.4;
}

.admin-rating-count {
  grid-column: 2;
  grid-row: 1 / 3;
  align-self: center;
  min-width: 20px;
  padding: 1px 5px;
  border-radius: 999px;
  background: rgba(129, 2, 31, 0.06);
  color: inherit;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.admin-rating-btn.is-all.active {
  border-color: rgba(255, 255, 255, 0.22);
  background: linear-gradient(180deg, #f66c68, var(--palette-silver-red));
  color: var(--palette-burgundy-deep);
}

.admin-rating-btn.is-positive.active {
  border-color: rgba(46, 125, 50, 0.2);
  background: rgba(46, 125, 50, 0.11);
  color: #246b2b;
}

.admin-rating-btn.is-neutral.active {
  border-color: rgba(184, 116, 0, 0.2);
  background: rgba(249, 168, 37, 0.13);
  color: #946000;
}

.admin-rating-btn.is-negative.active {
  border-color: rgba(129, 2, 31, 0.17);
  background: rgba(129, 2, 31, 0.09);
  color: var(--palette-burgundy);
}

.admin-rating-btn.active small {
  color: currentColor;
  opacity: 0.72;
}

.admin-rating-btn.active .admin-rating-count {
  background: rgba(255, 255, 255, 0.34);
}

.admin-review-focus {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 13px;
  padding: 9px 11px;
  border: 1px solid rgba(239, 86, 84, 0.14);
  border-radius: 11px;
  background: rgba(239, 86, 84, 0.07);
  color: var(--apple-secondary);
  font-size: 10px;
}

.admin-review-focus span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.admin-review-focus button {
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--palette-burgundy);
  font-family: inherit;
  font-size: 10px;
  font-weight: 680;
  cursor: pointer;
}

.admin-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--apple-secondary);
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.admin-filter-btn span {
  opacity: 0.68;
}

.admin-filter-btn.active {
  background: rgba(239, 86, 84, 0.16);
  color: var(--palette-burgundy);
}

.review-author-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--apple-tertiary);
  font-size: 9.5px;
}

.review-author {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--apple-secondary);
  font-weight: 620;
}

.review-time {
  margin-left: auto;
}

.review-copy {
  margin: 10px 0 0;
  padding: 10px 11px;
  border-radius: 10px;
  background: rgba(129, 2, 31, 0.04);
  color: var(--apple-secondary);
  font-size: 11px;
  line-height: 1.72;
}

.admin-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 230px;
  padding: 28px;
  text-align: center;
}

.admin-empty-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  border: 1px solid rgba(129, 2, 31, 0.08);
  border-radius: 18px;
  background: rgba(239, 86, 84, 0.08);
  color: var(--palette-silver-red);
}

.admin-empty h3 {
  margin: 0;
  color: var(--apple-ink);
  font-size: 15px;
}

.admin-empty p {
  margin-top: 5px;
  color: var(--apple-tertiary);
  font-size: 10.5px;
}

.admin-overlay {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(20, 12, 15, 0.56);
  backdrop-filter: blur(13px) saturate(90%);
  -webkit-backdrop-filter: blur(13px) saturate(90%);
}

.admin-dialog {
  position: relative;
  width: min(430px, 100%);
  padding: 25px;
  border: 1px solid rgba(254, 238, 225, 0.68);
  border-radius: 23px;
  background: rgba(255, 249, 242, 0.97);
  box-shadow: 0 30px 90px rgba(38, 0, 10, 0.3);
}

.admin-dialog-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(129, 2, 31, 0.09);
  border-radius: 50%;
  background: rgba(129, 2, 31, 0.055);
  color: var(--apple-secondary);
  cursor: pointer;
}

.admin-dialog-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin-bottom: 13px;
  border-radius: 14px;
  background: rgba(239, 86, 84, 0.12);
  color: var(--palette-burgundy);
}

.admin-dialog-icon.reject,
.admin-dialog-icon.delete {
  background: rgba(129, 2, 31, 0.09);
  color: var(--palette-burgundy);
}

.admin-dialog h2 {
  margin: 0;
  color: var(--apple-ink);
  font-size: 20px;
  font-weight: 720;
  letter-spacing: -0.03em;
}

.admin-dialog > p {
  margin: 6px 0 0;
  color: var(--apple-secondary);
  font-size: 11.5px;
  line-height: 1.65;
}

.admin-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 17px;
}

.admin-field > span {
  color: var(--apple-secondary);
  font-size: 10px;
  font-weight: 650;
}

.admin-field textarea {
  width: 100%;
  padding: 11px 12px;
  resize: vertical;
  border: 1px solid rgba(129, 2, 31, 0.12);
  border-radius: 12px;
  outline: 0;
  background: rgba(129, 2, 31, 0.035);
  color: var(--apple-ink);
  font-family: inherit;
  font-size: 12px;
  line-height: 1.65;
}

.admin-field textarea:focus {
  border-color: rgba(239, 86, 84, 0.48);
  box-shadow: 0 0 0 4px rgba(239, 86, 84, 0.09);
}

.admin-form-error {
  margin-top: 8px !important;
  color: var(--palette-burgundy) !important;
  font-size: 10px !important;
}

.admin-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 19px;
}

.confirm-dialog {
  width: min(390px, 100%);
}

.admin-notice {
  position: fixed;
  left: 50%;
  bottom: calc(88px + env(safe-area-inset-bottom, 0px));
  z-index: 2700;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid rgba(254, 238, 225, 0.14);
  border-radius: 999px;
  background: rgba(49, 5, 17, 0.92);
  color: var(--palette-lotus-white);
  box-shadow: 0 10px 28px rgba(37, 0, 10, 0.22);
  font-size: 10.5px;
  font-weight: 620;
  transform: translateX(-50%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.admin-fade-enter-active,
.admin-fade-leave-active {
  transition: opacity 0.2s ease;
}

.admin-fade-enter-active .admin-dialog,
.admin-fade-leave-active .admin-dialog {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.admin-fade-enter-from,
.admin-fade-leave-to {
  opacity: 0;
}

.admin-fade-enter-from .admin-dialog,
.admin-fade-leave-to .admin-dialog {
  transform: translateY(12px) scale(0.97);
}

.admin-toast-enter-active,
.admin-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.24s ease;
}

.admin-toast-enter-from,
.admin-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

:root[data-theme="dark"] .admin-summary {
  background: rgba(0, 0, 0, 0.2);
}

:root[data-theme="dark"] .admin-review-filters {
  border-color: rgba(254, 238, 225, 0.08);
  background: rgba(239, 86, 84, 0.08);
}

:root[data-theme="dark"] .admin-filter-btn.active {
  background: linear-gradient(180deg, #f66c68, var(--palette-silver-red));
  color: var(--palette-burgundy-deep);
}

:root[data-theme="dark"] .admin-card {
  border-color: rgba(254, 238, 225, 0.08);
  background: rgba(37, 27, 31, 0.72);
}

:root[data-theme="dark"] .admin-card:hover {
  border-color: rgba(239, 86, 84, 0.3);
}

:root[data-theme="dark"] .admin-rating-quickbar {
  border-color: rgba(254, 238, 225, 0.08);
  background: rgba(239, 86, 84, 0.055);
}

:root[data-theme="dark"] .admin-rating-btn {
  border-color: rgba(254, 238, 225, 0.08);
  background: rgba(255, 255, 255, 0.045);
  color: #cbbdc0;
}

:root[data-theme="dark"] .admin-rating-btn:hover {
  border-color: rgba(239, 86, 84, 0.26);
  background: rgba(255, 255, 255, 0.075);
}

:root[data-theme="dark"] .admin-rating-btn.is-positive.active {
  border-color: rgba(72, 187, 94, 0.22);
  background: rgba(52, 199, 89, 0.14);
  color: #8ce6a2;
}

:root[data-theme="dark"] .admin-rating-btn.is-neutral.active {
  border-color: rgba(249, 168, 37, 0.2);
  background: rgba(249, 168, 37, 0.14);
  color: #ffd166;
}

:root[data-theme="dark"] .admin-rating-btn.is-negative.active {
  border-color: rgba(255, 151, 151, 0.18);
  background: rgba(239, 86, 84, 0.12);
  color: #ffaaa7;
}

:root[data-theme="dark"] .admin-rating-count {
  background: rgba(255, 255, 255, 0.07);
}

:root[data-theme="dark"] .admin-tag,
:root[data-theme="dark"] .admin-section-count,
:root[data-theme="dark"] .admin-card-actions,
:root[data-theme="dark"] .admin-card-foot {
  border-color: rgba(254, 238, 225, 0.08);
}

:root[data-theme="dark"] .admin-chip-list span,
:root[data-theme="dark"] .review-copy {
  background: rgba(239, 86, 84, 0.09);
  color: #ffc0bc;
}

:root[data-theme="dark"] .admin-activity-review-note {
  background: rgba(239, 86, 84, 0.09);
}

:root[data-theme="dark"] .admin-activity-review-note span {
  color: #ffaaa7;
}

:root[data-theme="dark"] .admin-review-focus {
  border-color: rgba(239, 86, 84, 0.18);
  background: rgba(239, 86, 84, 0.08);
}

:root[data-theme="dark"] .admin-review-focus button {
  color: #ffaaa7;
}

:root[data-theme="dark"] .admin-action.ghost {
  color: #cbbdc0;
}

:root[data-theme="dark"] .admin-action.reject {
  border-color: rgba(255, 170, 167, 0.2);
  background: rgba(239, 86, 84, 0.11);
  color: #ffaaa7;
}

:root[data-theme="dark"] .admin-text-action {
  color: #ffaaa7;
}

:root[data-theme="dark"] .admin-icon-btn {
  border-color: rgba(254, 238, 225, 0.1);
  background: rgba(255, 255, 255, 0.055);
  color: #cbbdc0;
}

:root[data-theme="dark"] .admin-dialog {
  border-color: rgba(254, 238, 225, 0.1);
  background: rgba(29, 23, 26, 0.98);
}

:root[data-theme="dark"] .admin-dialog-close,
:root[data-theme="dark"] .admin-field textarea {
  border-color: rgba(254, 238, 225, 0.1);
  background: rgba(255, 255, 255, 0.055);
  color: var(--palette-lotus-white);
}

@media (max-width: 980px) {
  .admin-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .admin-hero-side {
    min-width: 0;
  }

  .admin-access-state {
    justify-content: flex-start;
  }

  .activity-admin-list,
  .review-admin-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-page {
    gap: 14px;
    padding: 3px 0 12px;
  }

  .admin-hero {
    gap: 18px;
    padding: 21px 18px 18px;
    border-radius: 23px;
  }

  .admin-eyebrow {
    margin-bottom: 11px;
    font-size: 10px;
  }

  .admin-hero h1 {
    font-size: 28px;
  }

  .admin-hero-copy > p {
    font-size: 11.5px;
  }

  .admin-summary {
    gap: 5px;
  }

  .admin-summary-item {
    min-width: 0;
    padding: 9px 6px;
  }

  .admin-summary-item strong {
    font-size: 20px;
  }

  .admin-summary-item span {
    font-size: 8.5px;
    white-space: normal;
  }

  .admin-panel {
    padding: 15px;
    border-radius: 21px;
  }

  .admin-section-head,
  .admin-section-head.with-filter {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 13px;
  }

  .admin-section-head h2 {
    font-size: 19px;
  }

  .admin-review-filters {
    width: 100%;
  }

  .admin-filter-btn {
    flex: 1;
    justify-content: center;
  }

  .admin-rating-quickbar {
    align-items: stretch;
    flex-direction: column;
    gap: 7px;
    padding: 8px;
  }

  .admin-rating-title {
    padding: 2px 3px 0;
  }

  .admin-rating-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-card {
    padding: 14px;
    border-radius: 15px;
  }

  .admin-card h3 {
    font-size: 15px;
  }

  .admin-card-desc {
    font-size: 11px;
  }

  .admin-meta-row {
    gap: 6px 10px;
  }

  .admin-card-actions .admin-action {
    flex: 1;
  }

  .admin-card-foot {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .admin-overlay {
    align-items: end;
    padding: 10px 8px 0;
  }

  .admin-dialog {
    width: 100%;
    padding: 22px 18px calc(18px + env(safe-area-inset-bottom, 0px));
    border-radius: 25px 25px 0 0;
  }

  .admin-dialog-actions .admin-action {
    flex: 1;
  }

  .admin-notice {
    bottom: calc(84px + env(safe-area-inset-bottom, 0px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-card,
  .admin-action,
  .admin-dialog,
  .admin-notice {
    transition-duration: 0.01ms !important;
  }
}
</style>
