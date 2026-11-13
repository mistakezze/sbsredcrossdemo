<template>
  <div class="act-page">
    <!-- ==============================
         头部
         ============================== -->
    <header v-if="!isMobile" class="pc-act-header">
      <div class="pc-header-text">
        <span class="pc-header-badge"><AppIcon name="calendar" size="13" /> 红十字活动</span>
        <h1 class="pc-header-title">活动发布与推荐</h1>
        <p class="pc-header-desc">急救培训、志愿服务、公益筹款——按兴趣、口碑、热度与时效，为你排出最值得参加的活动。</p>
      </div>
      <div class="pc-header-right">
        <div class="pc-header-stats">
          <div class="pc-stat">
            <span class="pc-stat-num">{{ statusCount.upcoming }}</span>
            <span class="pc-stat-label">即将开始</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-num">{{ statusCount.ongoing }}</span>
            <span class="pc-stat-label">进行中</span>
          </div>
          <div class="pc-stat">
            <span class="pc-stat-num">{{ statusCount.ended }}</span>
            <span class="pc-stat-label">已结束</span>
          </div>
        </div>
        <button v-if="can('publishActivity')" class="pc-btn-publish" @click="openCreate">
          <AppIcon name="plus" size="15" /> 提交活动
        </button>
      </div>
    </header>

    <header v-else class="m-act-header">
      <span class="m-header-badge"><AppIcon name="calendar" size="13" /> 红十字活动</span>
      <h1 class="m-header-title">活动发布与推荐</h1>
      <p class="m-header-desc">按兴趣与口碑，为你排序最值得参加的活动</p>
      <div class="m-header-stats">
        <div class="m-stat">
          <span class="m-stat-num">{{ statusCount.upcoming }}</span>
          <span class="m-stat-label">即将开始</span>
        </div>
        <div class="m-stat">
          <span class="m-stat-num">{{ statusCount.ongoing }}</span>
          <span class="m-stat-label">进行中</span>
        </div>
        <div class="m-stat">
          <span class="m-stat-num">{{ statusCount.ended }}</span>
          <span class="m-stat-label">已结束</span>
        </div>
      </div>
      <button v-if="can('publishActivity')" class="m-btn-publish" @click="openCreate">
        <AppIcon name="plus" size="15" /> 提交活动
      </button>
    </header>

    <section v-if="myReviewActivities.length" class="activity-review-strip">
      <div class="activity-review-strip-head">
        <span class="activity-review-strip-icon"><AppIcon name="clock" size="15" /></span>
        <div>
          <strong>我的活动申请</strong>
          <small>审核通过后会自动出现在公开活动列表中</small>
        </div>
        <span class="activity-review-strip-count">{{ myReviewActivities.length }}</span>
      </div>
      <div class="activity-review-strip-list">
        <article v-for="activity in myReviewActivities" :key="activity.id" class="activity-review-strip-item">
          <span
            class="activity-review-state"
            :style="{
              color: ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].color,
              background: ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].color + '16'
            }"
          >
            <AppIcon :name="ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].icon" size="11" />
            {{ ACTIVITY_REVIEW_STATUS[reviewStatusOf(activity)].label }}
          </span>
          <div>
            <strong>{{ activity.title }}</strong>
            <span>{{ activity.venue }} · {{ formatActivityTime(activity.startTime) }}</span>
            <small v-if="activity.reviewNote">审核意见：{{ activity.reviewNote }}</small>
          </div>
        </article>
      </div>
    </section>

    <!-- ==============================
         算法推荐
         ============================== -->
    <section class="reco-section" :class="{ 'is-mobile': isMobile }">
      <div class="reco-head">
        <div class="reco-head-left">
          <span class="reco-title"><AppIcon name="robot" size="15" /> 为你推荐</span>
          <span class="reco-badge">{{ currentUser.name }}</span>
          <span v-if="isColdStart" class="reco-cold-tag">新用户默认推荐</span>
        </div>
        <span
          class="reco-formula"
          :title="isColdStart
            ? '你还没有报名或评价记录，暂按近期热门与即将开始排序；参与一场活动后会自动切换为协同过滤 + 兴趣的个性化推荐'
            : '协同过滤：新活动没有评分，因此在活动类型维度上做 UserCF——找在共同类型上评价/报名过的相似访客，按其评分加权预测你对各类活动的偏好；低秩模型则用隐因子重建类型评分矩阵'"
        >{{ recoFormula }}</span>
      </div>

      <div class="reco-list" :class="{ 'is-mobile': isMobile }">
        <button
          v-for="item in recommendations"
          :key="item.activity.id"
          class="reco-card"
          @click="openDetail(item.activity)"
        >
          <div class="reco-card-top">
            <span class="reco-type" :style="{ background: typeOf(item.activity.type).color }">
              <AppIcon :name="typeOf(item.activity.type).icon" size="12" />
              {{ typeOf(item.activity.type).label }}
            </span>
            <span class="reco-score">匹配 {{ item.score }}</span>
          </div>
          <h4 class="reco-name">{{ item.activity.title }}</h4>
          <div class="reco-venue"><AppIcon name="pin" size="12" /> {{ item.activity.venue }}</div>
          <div class="reco-reasons">
            <span v-for="(r, i) in item.reasons" :key="i" class="reco-reason">{{ r }}</span>
          </div>
          <div class="reco-foot">
            <span class="reco-when">{{ activityTimeHint(item.activity) }}</span>
            <span class="reco-seats">
              {{ enrolledCount(item.activity.id) }}/{{ item.activity.capacity }} 人
            </span>
          </div>
        </button>

        <div v-if="!recommendations.length" class="reco-empty">
          暂无可推荐的活动，试试切换角色或先报名一场
        </div>
      </div>

      <p v-if="isColdStart" class="reco-model-note">
        <AppIcon name="clock" size="13" /> 你还没有报名或评价记录，先按「近期热门 + 即将开始 + 往期口碑」为你推荐，
        同类活动最多出现 2 场；参与或评价一场活动后会自动切换为个性化推荐。
      </p>
      <p v-else-if="recoSignals.userCF || recoSignals.latent" class="reco-model-note">
        <span v-if="recoSignals.userCF">
          <AppIcon name="users" size="12" /> UserCF：{{ recoModels.userCF.neighborCount }} 位最近邻居（{{ neighborSummary }}）
        </span>
        <span v-if="recoSignals.userCF && recoSignals.latent"> · </span>
        <span v-if="recoSignals.latent">
          <AppIcon name="calculator" size="12" /> 低秩：{{ recoModels.latent.userCount }} 位访客 × {{ typeCount }} 个活动类型，秩 k={{ recoModels.latent.rank }}，RMSE {{ recoModels.latent.rmse }}
        </span>
      </p>
    </section>

    <!-- ==============================
         筛选
         ============================== -->
    <div class="act-filters" :class="{ 'is-mobile': isMobile }">
      <div class="filter-group">
        <span class="filter-label">状态</span>
        <button
          v-for="s in statusFilters"
          :key="s.key"
          class="filter-chip"
          :class="{ active: activeStatus === s.key }"
          @click="activeStatus = s.key"
        >{{ s.label }}</button>
      </div>
      <div class="filter-group">
        <span class="filter-label">类型</span>
        <button
          v-for="t in typeFilters"
          :key="t.key"
          class="filter-chip"
          :class="{ active: activeType === t.key }"
          @click="activeType = t.key"
        ><AppIcon :name="t.icon" size="13" /> {{ t.label }}</button>
      </div>
    </div>

    <!-- ==============================
         活动列表
         ============================== -->
    <div class="act-list" :class="isMobile ? 'is-mobile' : 'is-pc'">
      <button
        v-for="act in filteredActivities"
        :key="act.id"
        class="act-card"
        :class="{ 'is-ended': activityStatus(act) === 'ended' }"
        @click="openDetail(act)"
      >
        <div class="act-card-bar" :style="{ background: typeOf(act.type).color }"></div>

        <div class="act-card-body">
          <div class="act-card-top">
            <span class="act-type" :style="{ color: typeOf(act.type).color, background: typeOf(act.type).color + '18' }">
              <AppIcon :name="typeOf(act.type).icon" size="11" /> {{ typeOf(act.type).label }}
            </span>
            <span
              class="act-status"
              :style="{ color: STATUS_META[activityStatus(act)].color, background: STATUS_META[activityStatus(act)].color + '16' }"
            >{{ STATUS_META[activityStatus(act)].label }}</span>
          </div>

          <h3 class="act-title">{{ act.title }}</h3>

          <div class="act-meta">
            <span class="act-meta-item"><AppIcon name="clock" size="12" /> {{ formatActivityTime(act.startTime) }}</span>
            <span class="act-meta-item"><AppIcon name="pin" size="12" /> {{ act.venue }}</span>
          </div>

          <p class="act-desc">{{ act.desc }}</p>

          <div class="act-seats">
            <div class="seats-track">
              <span
                class="seats-fill"
                :style="{ width: fillPercent(act) + '%', background: fillPercent(act) >= 100 ? '#a79599' : typeOf(act.type).color }"
              ></span>
            </div>
            <span class="seats-text">{{ enrolledCount(act.id) }}/{{ act.capacity }}</span>
          </div>

          <div class="act-card-foot">
            <span v-if="statsOf(act.id).count" class="act-rating">
              <AppIcon name="starFill" size="12" /> {{ statsOf(act.id).avg.toFixed(1) }}
              <i>({{ statsOf(act.id).count }})</i>
            </span>
            <span v-else class="act-rating is-empty">暂无评价</span>

            <span v-if="isEnrolled(act.id, currentRoleKey)" class="act-tag-joined">
              <AppIcon name="check" size="12" /> 已报名
            </span>
            <span v-else-if="activityTimeHint(act)" class="act-tag-hint">{{ activityTimeHint(act) }}</span>
          </div>
        </div>
      </button>

      <div v-if="!filteredActivities.length" class="act-empty">
        没有符合条件的活动
      </div>
    </div>

    <!-- ==============================
         活动详情弹窗
         ============================== -->
    <transition name="fade">
      <div v-if="detailAct" class="act-overlay" @click.self="closeDetail">
        <div class="act-modal" :class="{ 'is-mobile': isMobile }">
          <div class="act-modal-banner" :style="{ background: `linear-gradient(135deg, ${typeOf(detailAct.type).color}, #81021f)` }">
            <div class="banner-top">
              <span class="banner-type">
                <AppIcon :name="typeOf(detailAct.type).icon" size="12" />
                {{ typeOf(detailAct.type).label }}
              </span>
              <button class="banner-close" aria-label="关闭活动详情" @click="closeDetail">
                <AppIcon name="x" size="18" />
              </button>
            </div>
            <h2 class="banner-title">{{ detailAct.title }}</h2>
            <div class="banner-meta">
              {{ STATUS_META[activityStatus(detailAct)].label }} · {{ activityTimeHint(detailAct) }}
            </div>
          </div>

          <div class="act-modal-body">
            <div class="detail-info">
              <div class="detail-info-row">
                <span class="detail-icon"><AppIcon name="clock" size="15" /></span>
                <div>
                  <div class="detail-label">活动时间</div>
                  <div class="detail-value">
                    {{ formatActivityTime(detailAct.startTime) }} — {{ formatActivityTime(detailAct.endTime) }}
                  </div>
                </div>
              </div>
              <div class="detail-info-row">
                <span class="detail-icon"><AppIcon name="pin" size="15" /></span>
                <div>
                  <div class="detail-label">活动地点</div>
                  <div class="detail-value">{{ detailAct.venue }}</div>
                </div>
              </div>
              <div class="detail-info-row">
                <span class="detail-icon"><AppIcon name="users" size="15" /></span>
                <div>
                  <div class="detail-label">报名名额</div>
                  <div class="detail-value">
                    {{ enrolledCount(detailAct.id) }} / {{ detailAct.capacity }} 人
                    <span v-if="fillPercent(detailAct) >= 100" class="detail-full">已满</span>
                  </div>
                </div>
              </div>
              <div class="detail-info-row">
                <span class="detail-icon"><AppIcon name="building" size="15" /></span>
                <div>
                  <div class="detail-label">发布方</div>
                  <div class="detail-value">{{ detailAct.organizerName }}</div>
                </div>
              </div>
            </div>

            <p class="detail-desc">{{ detailAct.desc }}</p>

            <div v-if="detailAct.highlights && detailAct.highlights.length" class="detail-highlights">
              <span v-for="h in detailAct.highlights" :key="h" class="detail-highlight">{{ h }}</span>
            </div>

            <!-- 活动评级 -->
            <div class="act-reviews">
              <div class="reviews-head">
                <span class="reviews-title"><AppIcon name="starFill" size="14" /> 活动评级</span>
                <div class="reviews-summary">
                  <StarRating :model-value="detailStats.avg" readonly size="small" />
                  <span class="reviews-avg">
                    {{ detailStats.count ? detailStats.avg.toFixed(1) + ' 分 · ' + detailStats.count + ' 人评价' : '暂无评价' }}
                  </span>
                </div>
              </div>

              <!-- 写评价 -->
              <div v-if="canReview(detailAct.id, currentRoleKey)" class="review-form">
                <div class="review-form-head">
                  <span class="review-form-label">我的评分</span>
                  <StarRating v-model="draftRating" size="normal" />
                  <span v-if="draftRating" class="review-form-score">{{ draftRating }} 分</span>
                </div>
                <textarea
                  v-model="draftContent"
                  class="review-textarea"
                  rows="3"
                  placeholder="说说这次活动的体验，帮其他人做判断..."
                ></textarea>
                <button class="review-submit" :disabled="!draftRating" @click="submitReview">
                  {{ draftRating ? '发布评级' : '请先选择星级' }}
                </button>
              </div>

              <div v-else-if="myReview" class="review-mine-tip">
                <span class="mine-avatar" :style="{ background: currentUser.color }">
                  <AppIcon :name="currentUser.icon" size="14" />
                </span>
                <span>你已给出 <strong>{{ myReview.rating }} 星</strong> 评级</span>
              </div>

              <div v-else-if="!can('review')" class="review-lock-tip">
                <AppIcon name="user" size="14" /> 当前为「{{ currentUser.name }}」，切换到「注册用户」或「志愿者」后可评级
              </div>

              <div v-else-if="activityStatus(detailAct) !== 'ended'" class="review-lock-tip">
                <AppIcon name="bookmark" size="13" /> 报名并参与活动后即可评级
              </div>

              <!-- 评价列表 -->
              <div class="review-list">
                <div v-for="r in detailReviews" :key="r.id" class="review-item">
                  <div class="review-item-head">
                    <span class="review-avatar" :style="{ background: roleOf(r.roleKey).color }">
                      <AppIcon :name="roleOf(r.roleKey).icon" size="14" />
                    </span>
                    <span class="review-user">{{ r.userName }}</span>
                    <StarRating :model-value="r.rating" readonly size="small" />
                    <span class="review-time">{{ formatReviewTime(r.timestamp) }}</span>
                    <button v-if="can('moderate')" class="review-del" @click="deleteReview(r.id)">删除</button>
                  </div>
                  <p v-if="r.content" class="review-content">{{ r.content }}</p>
                </div>
                <div v-if="!detailReviews.length" class="review-empty">还没有评级，来写下第一条</div>
              </div>
            </div>
          </div>

          <div class="act-modal-footer">
            <button
              v-if="!can('enrollActivity')"
              class="btn-enroll disabled"
              disabled
            >切换角色后可报名</button>

            <template v-else-if="isEnrolled(detailAct.id, currentRoleKey)">
              <button class="btn-enroll joined" @click="doCancelEnroll">
                <AppIcon name="check" size="14" /> 已报名 · 取消
              </button>
            </template>

            <template v-else-if="activityStatus(detailAct) === 'ended'">
              <button class="btn-enroll disabled" disabled>活动已结束</button>
            </template>

            <template v-else-if="fillPercent(detailAct) >= 100">
              <button class="btn-enroll disabled" disabled>名额已满</button>
            </template>

            <template v-else>
              <button class="btn-enroll" @click="doEnroll">立即报名</button>
            </template>

            <button v-if="can('moderate')" class="btn-del-act" @click="doDeleteActivity">删除活动</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ==============================
         发布活动弹窗
         ============================== -->
    <transition name="fade">
      <div v-if="showCreate" class="act-overlay" @click.self="closeCreate">
        <div class="create-modal" :class="{ 'is-mobile': isMobile }">
          <div class="create-head">
            <span class="create-title">提交活动审核</span>
            <button class="banner-close dark" aria-label="关闭活动提交" @click="closeCreate">
              <AppIcon name="x" size="18" />
            </button>
          </div>

          <div class="create-body">
            <label class="field">
              <span class="field-label">活动名称</span>
              <input v-model="form.title" class="field-input" placeholder="例如：周末社区急救培训" />
            </label>

            <div class="field">
              <span class="field-label">活动类型</span>
              <div class="type-picker">
                <button
                  v-for="t in typeFilters.slice(1)"
                  :key="t.key"
                  class="type-option"
                  :class="{ active: form.type === t.key }"
                  :style="form.type === t.key ? { background: t.color, borderColor: t.color } : {}"
                  @click="form.type = t.key"
                ><AppIcon :name="t.icon" size="13" /> {{ t.label }}</button>
              </div>
            </div>

            <label class="field">
              <span class="field-label">活动地点</span>
              <input v-model="form.venue" class="field-input" placeholder="例如：上海市红十字会 · 静安区" />
            </label>

            <div class="field-row">
              <label class="field">
                <span class="field-label">开始时间</span>
                <input v-model="form.start" type="datetime-local" class="field-input" />
              </label>
              <label class="field">
                <span class="field-label">结束时间</span>
                <input v-model="form.end" type="datetime-local" class="field-input" />
              </label>
            </div>

            <label class="field">
              <span class="field-label">报名名额</span>
              <input v-model.number="form.capacity" type="number" min="1" max="999" class="field-input" />
            </label>

            <label class="field">
              <span class="field-label">活动简介</span>
              <textarea v-model="form.desc" class="field-textarea" rows="3" placeholder="简单介绍活动内容与适合人群..."></textarea>
            </label>

            <div v-if="formError" class="form-error"><AppIcon name="alert" size="14" /> {{ formError }}</div>
          </div>

          <div class="create-footer">
            <button class="btn-cancel" @click="closeCreate">取消</button>
            <button class="btn-submit" @click="submitCreate">提交审核</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="activityNotice" class="activity-submit-toast" role="status">
        <AppIcon name="check" size="14" />
        {{ activityNotice }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import {
  useActivityStore,
  ACTIVITY_TYPES,
  ACTIVITY_REVIEW_STATUS,
  ACTIVITY_RECO_WEIGHTS,
  ACTIVITY_COLD_START_WEIGHTS,
  STATUS_META,
  activityStatus,
  reviewStatusOf,
  formatActivityTime,
  activityTimeHint,
  formatReviewTime
} from '../stores/activityStore'
import { useUserStore, ROLES } from '../stores/userStore'
import { useViewport } from '../composables/useViewport'
import StarRating from '../components/StarRating.vue'

const { isMobile } = useViewport()
const { currentRoleKey, currentUser, can } = useUserStore()

const {
  activities: allActivities,
  approvedActivities: activities,
  enrolledCount,
  isEnrolled,
  enroll,
  cancelEnroll,
  reviewsOf,
  statsOf,
  myReviewOf,
  canReview,
  addReview,
  removeReview,
  createActivity,
  removeActivity,
  recommend
} = useActivityStore()

const myReviewActivities = computed(() =>
  allActivities.value
    .filter(activity =>
      activity.organizerRole === currentRoleKey.value &&
      reviewStatusOf(activity) !== 'approved'
    )
    .sort((a, b) => b.createdAt - a.createdAt)
)

// ==============================
// 筛选
// ==============================
const activeStatus = ref('all')
const activeType = ref('all')

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'upcoming', label: '即将开始' },
  { key: 'ongoing', label: '进行中' },
  { key: 'ended', label: '已结束' }
]

const typeFilters = computed(() => [
  { key: 'all', label: '全部类型', icon: 'clipboard', color: '#79636a' },
  ...Object.values(ACTIVITY_TYPES)
])

const typeOf = (key) => ACTIVITY_TYPES[key] || ACTIVITY_TYPES.volunteer

const statusCount = computed(() => {
  const base = { upcoming: 0, ongoing: 0, ended: 0 }
  activities.value.forEach(a => {
    base[activityStatus(a)] += 1
  })
  return base
})

const filteredActivities = computed(() => {
  return activities.value
    .filter(a => {
      if (activeStatus.value !== 'all' && activityStatus(a) !== activeStatus.value) return false
      if (activeType.value !== 'all' && a.type !== activeType.value) return false
      return true
    })
    .sort((a, b) => {
      // 未结束的按开始时间正序，已结束的按开始时间倒序
      const aEnded = activityStatus(a) === 'ended'
      const bEnded = activityStatus(b) === 'ended'
      if (aEnded !== bEnded) return aEnded ? 1 : -1
      return aEnded ? b.startTime - a.startTime : a.startTime - b.startTime
    })
})

const recoResult = computed(() => recommend(currentRoleKey.value, 4))
const recommendations = computed(() => recoResult.value.items)
const recoSignals = computed(() => recoResult.value.signals)
const recoModels = computed(() => recoResult.value.models)
const isColdStart = computed(() => recoResult.value.mode === 'cold')
const typeCount = Object.keys(ACTIVITY_TYPES).length

// 脚注只展示相似度最高的 3 位邻居，避免文案过长
const neighborSummary = computed(() =>
  recoModels.value.userCF.neighbors
    .slice(0, 3)
    .map(n => `${n.name} ${n.similarity.toFixed(2)}`)
    .join(' · ')
)

// 权重文案跟随推荐模式：冷启动展示默认策略，个性化展示实际生效的权重
const recoFormula = computed(() => {
  const weights = isColdStart.value ? ACTIVITY_COLD_START_WEIGHTS : ACTIVITY_RECO_WEIGHTS
  const items = [
    ['cf', '协同过滤'],
    ['interest', '兴趣'],
    ['rating', '口碑'],
    ['hot', '热度'],
    ['urgency', '时效']
  ].filter(([key]) => weights[key] > 0 && (key !== 'cf' || recoSignals.value.cf))
    // 按权重从大到小展示，冷启动时首项即为主导因素
    .sort((a, b) => weights[b[0]] - weights[a[0]])

  const total = items.reduce((sum, [key]) => sum + weights[key], 0)
  return items
    .map(([key, label]) => `${label} ${Math.round((weights[key] / total) * 100)}%`)
    .join(' · ')
})

const fillPercent = (act) => {
  if (!act || !act.capacity) return 0
  return Math.min(100, Math.round((enrolledCount(act.id) / act.capacity) * 100))
}

const roleOf = (key) => ROLES.find(r => r.key === key) || ROLES[3]

// ==============================
// 详情
// ==============================
const detailAct = ref(null)
const draftRating = ref(0)
const draftContent = ref('')

const detailStats = computed(() =>
  detailAct.value ? statsOf(detailAct.value.id) : { count: 0, avg: 0, distribution: [] }
)

const detailReviews = computed(() =>
  detailAct.value ? reviewsOf(detailAct.value.id) : []
)

const myReview = computed(() =>
  detailAct.value ? myReviewOf(detailAct.value.id, currentRoleKey.value) : null
)

const openDetail = (act) => {
  detailAct.value = act
  draftRating.value = 0
  draftContent.value = ''
  document.body.style.overflow = 'hidden'
}

const closeDetail = () => {
  detailAct.value = null
  document.body.style.overflow = ''
}

const doEnroll = () => {
  if (!detailAct.value) return
  enroll(detailAct.value.id, currentRoleKey.value, currentUser.value.name)
}

const doCancelEnroll = () => {
  if (!detailAct.value) return
  cancelEnroll(detailAct.value.id, currentRoleKey.value)
}

const submitReview = () => {
  if (!detailAct.value || !draftRating.value) return
  addReview(detailAct.value.id, {
    roleKey: currentRoleKey.value,
    userName: currentUser.value.name,
    rating: draftRating.value,
    content: draftContent.value
  })
  draftRating.value = 0
  draftContent.value = ''
}

const deleteReview = (id) => {
  if (!can('moderate')) return
  removeReview(id)
}

const doDeleteActivity = () => {
  if (!detailAct.value || !can('moderate')) return
  removeActivity(detailAct.value.id)
  closeDetail()
}

// ==============================
// 发布活动
// ==============================
const showCreate = ref(false)
const formError = ref('')
const activityNotice = ref('')
let activityNoticeTimer = null

const toLocalInput = (ts) => {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const form = ref({
  title: '',
  type: 'training',
  venue: '',
  start: '',
  end: '',
  capacity: 30,
  desc: ''
})

const resetForm = () => {
  const tomorrow = Date.now() + 86400000
  form.value = {
    title: '',
    type: 'training',
    venue: '',
    start: toLocalInput(tomorrow),
    end: toLocalInput(tomorrow + 3 * 3600000),
    capacity: 30,
    desc: ''
  }
  formError.value = ''
}

const openCreate = () => {
  resetForm()
  showCreate.value = true
  document.body.style.overflow = 'hidden'
}

const closeCreate = () => {
  showCreate.value = false
  document.body.style.overflow = ''
}

const submitCreate = () => {
  const f = form.value
  if (!f.title.trim()) {
    formError.value = '请填写活动名称'
    return
  }
  if (!f.venue.trim()) {
    formError.value = '请填写活动地点'
    return
  }
  const start = new Date(f.start).getTime()
  const end = new Date(f.end).getTime()
  if (!start || !end) {
    formError.value = '请选择活动时间'
    return
  }
  if (end <= start) {
    formError.value = '结束时间必须晚于开始时间'
    return
  }
  if (!f.capacity || f.capacity < 1) {
    formError.value = '名额至少为 1 人'
    return
  }

  createActivity(
    {
      title: f.title,
      type: f.type,
      venue: f.venue,
      desc: f.desc || '暂无详细说明',
      highlights: [],
      startTime: start,
      endTime: end,
      capacity: f.capacity
    },
    { roleKey: currentRoleKey.value, userName: currentUser.value.name }
  )
  activityNotice.value = '活动已提交，等待管理员审核'
  window.clearTimeout(activityNoticeTimer)
  activityNoticeTimer = window.setTimeout(() => {
    activityNotice.value = ''
  }, 3200)
  closeCreate()
}

onBeforeUnmount(() => {
  window.clearTimeout(activityNoticeTimer)
})
</script>

<style scoped>
.act-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 8px 0 40px;
}

/* ==============================
   头部
   ============================== */
.pc-act-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  flex-wrap: wrap;
  background: linear-gradient(135deg, #feeee1 0%, #fbe7dc 100%);
  border-radius: 24px;
  padding: 30px 34px;
}

.pc-header-text {
  flex: 1;
  min-width: 280px;
}

.pc-header-badge {
  display: inline-block;
  padding: 7px 18px;
  background: #fff;
  border: 2px solid #ef5654;
  color: #ef5654;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 14px;
}

.pc-header-title {
  font-size: clamp(20px, 2.4vw, 30px);
  color: #32181f;
  margin: 0 0 10px 0;
  font-weight: 800;
  line-height: 1.3;
}

.pc-header-desc {
  font-size: 14px;
  color: #79636a;
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

.pc-header-stats {
  display: flex;
  gap: 12px;
}

.pc-stat {
  background: #fff;
  border-radius: 14px;
  padding: 14px 18px;
  min-width: 88px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.09);
}

.pc-stat-num {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #ef5654;
  line-height: 1;
}

.pc-stat-label {
  display: block;
  font-size: 11.5px;
  color: #79636a;
  margin-top: 6px;
  font-weight: 600;
}

.pc-btn-publish {
  padding: 13px 24px;
  background: linear-gradient(135deg, #ef5654, #81021f);
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

.pc-btn-publish:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(211, 47, 47, 0.4);
}

.m-act-header {
  background: linear-gradient(160deg, #feeee1 0%, #fbe7dc 60%, #fbe9df 100%);
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
  color: #ef5654;
  border-radius: 50px;
  font-size: clamp(10px, 2.5vw, 12px);
  font-weight: 700;
}

.m-header-title {
  font-size: clamp(18px, 5vw, 23px);
  color: #32181f;
  margin: 0;
  font-weight: 800;
  line-height: 1.25;
  word-break: break-word;
}

.m-header-desc {
  font-size: clamp(11px, 3vw, 13px);
  color: #9a858a;
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

.m-stat-num {
  display: block;
  font-size: clamp(16px, 4.4vw, 20px);
  font-weight: 800;
  color: #ef5654;
  line-height: 1.1;
}

.m-stat-label {
  display: block;
  font-size: clamp(9px, 2.4vw, 11px);
  color: #9a858a;
  margin-top: 3px;
  font-weight: 600;
}

.m-btn-publish {
  margin-top: 4px;
  padding: 11px;
  background: linear-gradient(135deg, #ef5654, #81021f);
  color: #fff;
  border: none;
  border-radius: 11px;
  font-size: clamp(12px, 3.4vw, 14px);
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(211, 47, 47, 0.28);
}

/* ==============================
   算法推荐
   ============================== */
.reco-section {
  background: linear-gradient(135deg, #f4f7ff 0%, #eaf0ff 100%);
  border: 1.5px solid rgba(91, 107, 255, 0.14);
  border-radius: 20px;
  padding: 20px 22px;
}

.reco-section.is-mobile {
  padding: 15px 14px;
  border-radius: 16px;
}

.reco-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.reco-head-left {
  display: flex;
  align-items: center;
  gap: 9px;
}

.reco-title {
  font-size: 16px;
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

.reco-cold-tag {
  font-size: 10.5px;
  font-weight: 700;
  color: #b26a00;
  background: rgba(249, 168, 37, 0.16);
  padding: 2px 9px;
  border-radius: 9px;
  white-space: nowrap;
}

.reco-formula {
  font-size: 11px;
  color: #7d87b8;
  font-weight: 600;
  cursor: help;
}

.reco-model-note {
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

.reco-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
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
  border-radius: 15px;
  padding: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.reco-list.is-mobile .reco-card {
  flex: 0 0 80vw;
  max-width: 320px;
  scroll-snap-align: center;
}

.reco-card:hover {
  transform: translateY(-3px);
  border-color: #5b6bff;
  box-shadow: 0 10px 26px rgba(91, 107, 255, 0.18);
}

.reco-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.reco-type {
  font-size: 10.5px;
  font-weight: 700;
  color: #fff;
  padding: 3px 9px;
  border-radius: 8px;
  white-space: nowrap;
}

.reco-score {
  font-size: 11px;
  font-weight: 800;
  color: #5b6bff;
  white-space: nowrap;
}

.reco-name {
  font-size: 14px;
  font-weight: 800;
  color: #32181f;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.reco-venue {
  font-size: 11px;
  color: #9a858a;
  word-break: break-word;
  line-height: 1.45;
}

.reco-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.reco-reason {
  font-size: 10px;
  font-weight: 600;
  color: #4a56a8;
  background: rgba(91, 107, 255, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.reco-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed rgba(91, 107, 255, 0.16);
  font-size: 11px;
  font-weight: 700;
}

.reco-when {
  color: #ef5654;
}

.reco-seats {
  color: #9a858a;
}

.reco-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 22px 0;
  font-size: 12.5px;
  color: #9a858a;
}

/* ==============================
   筛选
   ============================== */
.act-filters {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.act-filters.is-mobile .filter-group {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.act-filters.is-mobile .filter-group::-webkit-scrollbar {
  display: none;
}

.filter-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #9a858a;
  flex-shrink: 0;
  margin-right: 2px;
}

.filter-chip {
  flex-shrink: 0;
  padding: 7px 14px;
  background: #fff;
  border: 1.5px solid #f4ece4;
  border-radius: 10px;
  color: #79636a;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.act-filters.is-mobile .filter-chip {
  padding: 6px 12px;
  font-size: 11.5px;
}

.filter-chip:hover {
  border-color: #f6c7bd;
  color: #ef5654;
}

.filter-chip.active {
  background: linear-gradient(135deg, #ef5654, #81021f);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.24);
}

/* ==============================
   活动列表
   ============================== */
.act-list.is-pc {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.act-list.is-mobile {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.act-card {
  position: relative;
  display: flex;
  text-align: left;
  background: #fff;
  border: 1.5px solid #f4ece4;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
  box-shadow: 0 2px 14px rgba(26, 35, 50, 0.045);
}

.act-card:hover {
  transform: translateY(-3px);
  border-color: #f6c7bd;
  box-shadow: 0 12px 30px rgba(211, 47, 47, 0.12);
}

.act-card.is-ended {
  opacity: 0.78;
}

.act-card-bar {
  width: 5px;
  flex-shrink: 0;
}

.act-card-body {
  flex: 1;
  min-width: 0;
  padding: 15px 17px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.act-card-top {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
}

.act-type {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 8px;
}

.act-status {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 8px;
}

.act-title {
  font-size: 15.5px;
  font-weight: 800;
  color: #32181f;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.act-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.act-meta-item {
  font-size: 11.5px;
  color: #9a858a;
  word-break: break-word;
  line-height: 1.45;
}

.act-desc {
  font-size: 12.5px;
  color: #635057;
  line-height: 1.65;
  margin: 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.act-seats {
  display: flex;
  align-items: center;
  gap: 9px;
}

.seats-track {
  flex: 1;
  height: 6px;
  background: #f0f3f7;
  border-radius: 4px;
  overflow: hidden;
}

.seats-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.seats-text {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #9a858a;
}

.act-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #f7efe6;
}

.act-rating {
  font-size: 12px;
  font-weight: 800;
  color: #ff9800;
}

.act-rating i {
  font-style: normal;
  font-weight: 600;
  color: #b6a6a9;
  font-size: 10.5px;
}

.act-rating.is-empty {
  color: #b6a6a9;
  font-weight: 600;
}

.act-tag-joined {
  font-size: 11px;
  font-weight: 700;
  color: #2e7d32;
  background: rgba(76, 175, 80, 0.12);
  padding: 2px 9px;
  border-radius: 9px;
}

.act-tag-hint {
  font-size: 11px;
  font-weight: 700;
  color: #ef5654;
}

.act-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 46px 0;
  font-size: 13px;
  color: #9a858a;
  background: #fff;
  border-radius: 18px;
}

/* ==============================
   活动详情弹窗
   ============================== */
.act-overlay {
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

.act-modal {
  background: #fff;
  border-radius: 22px;
  width: 100%;
  max-width: 580px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
  animation: actPop 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}

@keyframes actPop {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.act-modal.is-mobile {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  align-self: flex-end;
  animation: actSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes actSlide {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.act-modal-banner {
  padding: 20px 22px 18px;
  color: #fff;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.act-modal-banner::after {
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

.banner-type {
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

.banner-close:hover {
  background: rgba(255, 255, 255, 0.42);
  transform: rotate(90deg);
}

.banner-close.dark {
  background: #f8f0e7;
  color: #79636a;
}

.banner-close.dark:hover {
  background: #efe4da;
  color: #32181f;
}

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
}

.act-modal-body {
  padding: 18px 22px;
  overflow-y: auto;
  flex: 1;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 14px;
  background: #fbf4eb;
  border-radius: 13px;
  margin-bottom: 15px;
}

.detail-info-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.detail-icon {
  font-size: 15px;
  flex-shrink: 0;
  margin-top: 1px;
}

.detail-label {
  font-size: 10.5px;
  color: #9a858a;
  font-weight: 700;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 12.5px;
  color: #33415c;
  font-weight: 600;
  line-height: 1.5;
  word-break: break-word;
}

.detail-full {
  color: #ef5654;
  font-weight: 800;
  margin-left: 4px;
}

.detail-desc {
  font-size: 13px;
  color: #635057;
  line-height: 1.75;
  margin: 0 0 14px 0;
  word-break: break-word;
}

.detail-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 16px;
}

.detail-highlight {
  font-size: 11.5px;
  color: #ef5654;
  background: rgba(211, 47, 47, 0.08);
  padding: 5px 12px;
  border-radius: 16px;
  font-weight: 600;
  word-break: break-word;
}

/* 活动评级 */
.act-reviews {
  padding: 14px;
  background: #fbf4eb;
  border-radius: 13px;
  border: 1.5px solid #f4ece4;
}

.reviews-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.reviews-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #32181f;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 7px;
}

.reviews-avg {
  font-size: 11.5px;
  color: #9a858a;
  font-weight: 600;
}

.review-form {
  padding: 13px;
  background: #fff;
  border-radius: 11px;
  border: 1.5px solid #f5d8cd;
  margin-bottom: 14px;
}

.review-form-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 9px;
  flex-wrap: wrap;
}

.review-form-label {
  font-size: 12px;
  font-weight: 700;
  color: #635057;
}

.review-form-score {
  font-size: 12px;
  font-weight: 700;
  color: #ff9800;
}

.review-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #e8ecf2;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 12.5px;
  font-family: inherit;
  color: #32181f;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  margin-bottom: 9px;
}

.review-textarea:focus {
  border-color: #ef5654;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.08);
}

.review-submit {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #ef5654, #81021f);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.review-submit:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
}

.review-mine-tip,
.review-lock-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.review-mine-tip {
  background: rgba(76, 175, 80, 0.08);
  border: 1.5px solid rgba(76, 175, 80, 0.2);
  color: #2e7d32;
}

.mine-avatar {
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #fff;
}

.review-lock-tip {
  background: rgba(120, 144, 156, 0.08);
  border: 1.5px dashed rgba(120, 144, 156, 0.28);
  color: #607d8b;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-item {
  padding-top: 10px;
  border-top: 1px solid #f3e8de;
}

.review-item:first-child {
  padding-top: 0;
  border-top: none;
}

.review-item-head {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.review-avatar {
  width: 21px;
  height: 21px;
  min-width: 21px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  color: #fff;
}

.review-user {
  font-size: 12px;
  font-weight: 700;
  color: #32181f;
}

.review-time {
  font-size: 10.5px;
  color: #9a858a;
  margin-left: auto;
}

.review-del {
  border: none;
  background: none;
  color: #ef5654;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  font-family: inherit;
}

.review-del:hover {
  background: rgba(211, 47, 47, 0.08);
}

.review-content {
  font-size: 12px;
  color: #635057;
  line-height: 1.65;
  margin: 0;
  word-break: break-word;
}

.review-empty {
  padding: 14px 0;
  text-align: center;
  font-size: 12px;
  color: #9a858a;
}

.act-modal-footer {
  display: flex;
  gap: 9px;
  padding: 14px 22px calc(18px + env(safe-area-inset-bottom, 0px));
  border-top: 1.5px solid #f7efe6;
  flex-shrink: 0;
}

.btn-enroll {
  flex: 1;
  padding: 13px;
  background: linear-gradient(135deg, #ef5654, #81021f);
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

.btn-enroll:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(211, 47, 47, 0.4);
}

.btn-enroll.joined {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  box-shadow: 0 5px 16px rgba(76, 175, 80, 0.3);
}

.btn-enroll.disabled {
  background: #efe4da;
  color: #a79599;
  box-shadow: none;
  cursor: default;
}

.btn-del-act {
  flex-shrink: 0;
  padding: 13px 16px;
  background: #fff;
  border: 1.5px solid #f6c7bd;
  border-radius: 12px;
  color: #ef5654;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s ease;
}

.btn-del-act:hover {
  background: #feeee1;
}

/* ==============================
   发布活动弹窗
   ============================== */
.create-modal {
  background: #fff;
  border-radius: 22px;
  width: 100%;
  max-width: 520px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.create-modal.is-mobile {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  align-self: flex-end;
}

.create-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1.5px solid #f7efe6;
  flex-shrink: 0;
}

.create-title {
  font-size: 16px;
  font-weight: 800;
  color: #32181f;
}

.create-body {
  padding: 18px 22px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

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
  color: #79636a;
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
  color: #32181f;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: #fff;
}

.field-input:focus,
.field-textarea:focus {
  border-color: #ef5654;
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.08);
}

.field-textarea {
  resize: vertical;
  line-height: 1.6;
}

.type-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.type-option {
  padding: 7px 13px;
  background: #fbf4eb;
  border: 1.5px solid #f4ece4;
  border-radius: 10px;
  color: #79636a;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.type-option.active {
  color: #fff;
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

.create-footer {
  display: flex;
  gap: 9px;
  padding: 14px 22px calc(18px + env(safe-area-inset-bottom, 0px));
  border-top: 1.5px solid #f7efe6;
  flex-shrink: 0;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f8f0e7;
  border: none;
  border-radius: 11px;
  color: #79636a;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.btn-cancel:hover {
  background: #efe4da;
}

.btn-submit {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #ef5654, #81021f);
  border: none;
  border-radius: 11px;
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 5px 16px rgba(211, 47, 47, 0.3);
}

.btn-submit:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .act-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .banner-title {
    font-size: clamp(16px, 4.5vw, 19px);
  }

  .act-modal-body {
    padding: 15px 16px;
  }

  .act-modal-banner {
    padding: 16px 16px 14px;
  }

  .detail-desc {
    font-size: clamp(12px, 3.2vw, 13px);
  }

  .act-modal-footer {
    padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .create-body {
    padding: 15px 16px;
  }

  .create-head {
    padding: 15px 16px;
  }

  .create-footer {
    padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .field-row {
    grid-template-columns: 1fr;
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
.pc-act-header,
.m-act-header {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(150, 47, 63, 0.09);
  background:
    radial-gradient(circle at 92% 10%, rgba(255, 255, 255, 0.9) 0 7%, transparent 7.3%),
    radial-gradient(circle at 80% 20%, rgba(197, 34, 55, 0.08), transparent 25%),
    linear-gradient(135deg, #fef5ea 0%, #fcefe5 55%, #f1d4c8 100%);
  box-shadow: 0 16px 42px rgba(101, 35, 48, 0.07);
}

.pc-act-header {
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
  color: #746469;
}

.pc-stat,
.m-stat {
  border: 1px solid rgba(143, 61, 76, 0.08);
  border-radius: 15px;
  box-shadow: 0 8px 22px rgba(52, 33, 39, 0.055);
}

.pc-btn-publish,
.m-btn-publish {
  border-radius: 14px;
  background: linear-gradient(135deg, #ef5654, #81021f);
  box-shadow: 0 9px 22px rgba(147, 25, 44, 0.22);
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

.reco-card {
  border-color: rgba(107, 93, 183, 0.12);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 7px 20px rgba(66, 56, 123, 0.055);
}

.reco-list.is-mobile {
  scroll-padding-inline: 14px;
}

.reco-list.is-mobile .reco-card {
  scroll-snap-align: start;
}

.filter-chip {
  border-color: rgba(126, 71, 82, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
}

.filter-chip.active {
  background: linear-gradient(135deg, #ef5654, #81021f);
  box-shadow: 0 6px 18px rgba(145, 25, 44, 0.2);
}

.act-filters.is-mobile .filter-group {
  padding-inline: 1px 20px;
  mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
}

.act-card {
  border-color: rgba(139, 62, 76, 0.09);
  border-radius: 19px;
  box-shadow: 0 8px 24px rgba(45, 32, 37, 0.055);
}

.act-card:hover {
  transform: translateY(-2px);
  border-color: rgba(197, 34, 55, 0.2);
  box-shadow: 0 14px 32px rgba(106, 34, 48, 0.1);
}

.act-card-bar {
  width: 4px;
}

.btn-enroll,
.btn-submit {
  border-radius: 12px;
  background: linear-gradient(135deg, #ef5654, #81021f);
}

.act-modal,
.create-modal {
  border: 1px solid rgba(138, 65, 79, 0.09);
  border-radius: 24px;
}

@media (max-width: 768px) {
  .act-page {
    gap: 17px;
    padding-top: 15px;
  }

  .m-act-header {
    padding: 20px 17px 17px;
    border-radius: 23px;
  }

  .m-header-title {
    font-size: clamp(21px, 5.8vw, 26px);
  }

  .m-stat {
    border-radius: 13px;
  }

  .act-card {
    border-radius: 17px;
  }
}

.activity-review-strip {
  padding: 16px 18px;
  border: 1px solid rgba(129, 2, 31, 0.1);
  border-radius: 20px;
  background:
    radial-gradient(circle at 94% 5%, rgba(239, 86, 84, 0.12), transparent 30%),
    var(--apple-surface);
  box-shadow: var(--apple-shadow);
}

.activity-review-strip-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-review-strip-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: rgba(239, 86, 84, 0.12);
  color: var(--palette-burgundy);
}

.activity-review-strip-head > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.activity-review-strip-head strong {
  color: var(--apple-ink);
  font-size: 13px;
  font-weight: 700;
}

.activity-review-strip-head small {
  color: var(--apple-tertiary);
  font-size: 9.5px;
}

.activity-review-strip-count {
  min-width: 22px;
  margin-left: auto;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(239, 86, 84, 0.12);
  color: var(--palette-burgundy);
  font-size: 9px;
  font-weight: 700;
  text-align: center;
}

.activity-review-strip-list {
  display: grid;
  gap: 7px;
  margin-top: 12px;
}

.activity-review-strip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 11px;
  border-radius: 12px;
  background: rgba(129, 2, 31, 0.035);
}

.activity-review-state {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 3px 7px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 700;
}

.activity-review-strip-item > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-review-strip-item strong {
  color: var(--apple-ink);
  font-size: 11.5px;
  font-weight: 680;
  line-height: 1.45;
}

.activity-review-strip-item span,
.activity-review-strip-item small {
  color: var(--apple-tertiary);
  font-size: 9px;
  line-height: 1.55;
}

.activity-review-strip-item small {
  color: var(--palette-burgundy);
}

.activity-submit-toast {
  position: fixed;
  left: 50%;
  bottom: calc(88px + env(safe-area-inset-bottom, 0px));
  z-index: 2800;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid rgba(254, 238, 225, 0.15);
  border-radius: 999px;
  background: rgba(49, 5, 17, 0.94);
  color: var(--palette-lotus-white);
  box-shadow: 0 10px 28px rgba(37, 0, 10, 0.24);
  font-size: 10.5px;
  font-weight: 620;
  transform: translateX(-50%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

:root[data-theme="dark"] .activity-review-strip {
  border-color: rgba(254, 238, 225, 0.09);
}

:root[data-theme="dark"] .activity-review-strip-icon,
:root[data-theme="dark"] .activity-review-strip-count {
  background: rgba(239, 86, 84, 0.13);
  color: #ffaaa7;
}

:root[data-theme="dark"] .activity-review-strip-item {
  background: rgba(239, 86, 84, 0.07);
}

:root[data-theme="dark"] .activity-review-strip-item small {
  color: #ffaaa7;
}

@media (min-width: 769px) {
  .activity-submit-toast {
    bottom: 28px;
  }
}

@media (max-width: 768px) {
  .activity-review-strip {
    padding: 14px;
    border-radius: 18px;
  }

  .activity-review-strip-item {
    flex-direction: column;
    gap: 7px;
  }
}
</style>
