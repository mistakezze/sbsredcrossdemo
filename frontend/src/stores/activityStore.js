import { ref, computed } from 'vue'
import { fitUserCF } from '../utils/userCF'
import { fitLowRankPreference } from '../utils/lowRankModel'
import { buildCollaborativeSignal } from '../utils/cfBlend'

const STORAGE_KEY = 'redcross_activity_state_v2'
const DAY = 86400000

// 活动条目少、新活动又没有评分，直接在「活动」维度做协同过滤会全程冷启动，
// 因此在「活动类型」维度上做协同过滤，再把类型偏好映射回具体活动。
const TYPE_INDEX = {
  training: 1,
  volunteer: 2,
  lecture: 3,
  blood: 4,
  fundraiser: 5
}

// 活动推荐各项权重，供 UI 展示与调参共用
export const ACTIVITY_RECO_WEIGHTS = {
  cf: 0.3,
  interest: 0.3,
  rating: 0.2,
  hot: 0.1,
  urgency: 0.1
}

// 冷启动默认策略：用户还没有任何报名/评价，缺少个性化依据，
// 改为「近期热门为主、即将开始为辅、往期口碑兜底」
export const ACTIVITY_COLD_START_WEIGHTS = {
  cf: 0,
  interest: 0,
  rating: 0.2,
  hot: 0.5,
  urgency: 0.3
}

// 活动类型
export const ACTIVITY_TYPES = {
  training: { key: 'training', label: '急救培训', icon: 'firstAid', color: '#0288d1' },
  volunteer: { key: 'volunteer', label: '志愿服务', icon: 'handshake', color: '#d32f2f' },
  lecture: { key: 'lecture', label: '人道讲座', icon: 'book', color: '#7b1fa2' },
  blood: { key: 'blood', label: '无偿献血', icon: 'blood', color: '#c62828' },
  fundraiser: { key: 'fundraiser', label: '公益筹款', icon: 'gift', color: '#f9a825' }
}

// 种子活动
const buildSeed = () => {
  const now = Date.now()
  return {
    activities: [
      {
        id: 2001,
        title: '红十字应急救援演练开放日',
        type: 'training',
        venue: '上海红十字备灾救灾中心 · 浦东新区',
        desc: '现场观摩专业救援队破拆、搜救、应急通讯全流程演练，并可亲手体验救灾帐篷搭建与家庭应急包整理。适合对应急救援感兴趣的市民与志愿者。',
        highlights: ['救援队实战演练', '救灾装备实操', '应急包现场教学'],
        startTime: now + DAY * 3 + 9 * 3600000,
        endTime: now + DAY * 3 + 13 * 3600000,
        capacity: 60,
        baseEnrolled: 41,
        organizerRole: 'admin',
        organizerName: '管理员',
        createdAt: now - DAY * 12
      },
      {
        id: 2002,
        title: '造血干细胞捐献科普讲座',
        type: 'lecture',
        venue: '上海红十字造血干细胞捐献者资料库 · 静安区',
        desc: '由骨髓库工作人员与已成功捐献的志愿者共同主讲，讲清楚「捐献到底会不会影响健康」这个最常被误解的问题，现场可登记加入资料库。',
        highlights: ['捐献者亲身分享', 'HLA 配型科普', '现场入库登记'],
        startTime: now + DAY * 5 + 14 * 3600000,
        endTime: now + DAY * 5 + 16 * 3600000,
        capacity: 80,
        baseEnrolled: 52,
        organizerRole: 'venue',
        organizerName: '企业/地点用户',
        createdAt: now - DAY * 9
      },
      {
        id: 2003,
        title: '社区急救员认证培训班（周末班）',
        type: 'training',
        venue: '上海市红十字会 · 静安区',
        desc: '两天共 12 学时的系统课程，涵盖心肺复苏、AED 使用、创伤止血包扎、气道异物梗阻处理，考核合格可获得红十字救护员证。',
        highlights: ['可获救护员证', '小班实操教学', '教材与耗材全包'],
        startTime: now + DAY * 8 + 9 * 3600000,
        endTime: now + DAY * 9 + 17 * 3600000,
        capacity: 30,
        baseEnrolled: 27,
        organizerRole: 'admin',
        organizerName: '管理员',
        createdAt: now - DAY * 15
      },
      {
        id: 2004,
        title: '红十字志愿者招募日',
        type: 'volunteer',
        venue: '上海博爱园 · 闵行区',
        desc: '一年一度的志愿者集中招募，现场设置志愿服务项目展示、面谈与登记三个环节，当天即可确定加入的服务方向。',
        highlights: ['当天完成登记', '多项目现场面谈', '老志愿者经验分享'],
        startTime: now + DAY * 1 + 10 * 3600000,
        endTime: now + DAY * 1 + 16 * 3600000,
        capacity: 120,
        baseEnrolled: 96,
        organizerRole: 'admin',
        organizerName: '管理员',
        createdAt: now - DAY * 20
      },
      {
        id: 2005,
        title: '无偿献血公益行动（冬季场）',
        type: 'blood',
        venue: '上海市红十字医院 · 长宁区',
        desc: '联合血站开展的冬季备血行动，现场设有献血知识问答与健康咨询，献血成功者可获得纪念徽章与健康礼包。',
        highlights: ['纪念徽章赠送', '免费健康咨询', '献血知识问答'],
        startTime: now - DAY * 15,
        endTime: now - DAY * 15 + 8 * 3600000,
        capacity: 100,
        baseEnrolled: 88,
        organizerRole: 'venue',
        organizerName: '企业/地点用户',
        createdAt: now - DAY * 40
      },
      {
        id: 2006,
        title: '博爱园公益徒步筹款',
        type: 'fundraiser',
        venue: '上海博爱园 · 闵行区',
        desc: '五公里公益徒步，每一步都由爱心企业配捐，全部善款用于本市困难家庭大病救助。沿途设置红十字历史打卡点。',
        highlights: ['企业配捐', '五公里路线', '历史打卡点'],
        startTime: now - DAY * 20,
        endTime: now - DAY * 20 + 5 * 3600000,
        capacity: 300,
        baseEnrolled: 264,
        organizerRole: 'admin',
        organizerName: '管理员',
        createdAt: now - DAY * 50
      },
      {
        id: 2007,
        title: '老年关怀志愿服务（半日）',
        type: 'volunteer',
        venue: '上海市红十字医院 · 长宁区',
        desc: '走进医院老年病房，陪伴聊天、协助读报、教用智能手机。需具备基本耐心与沟通意愿，服务时长计入志愿记录。',
        highlights: ['服务时长认证', '专业社工带教', '半日灵活参与'],
        startTime: now + DAY * 2 + 13 * 3600000,
        endTime: now + DAY * 2 + 17 * 3600000,
        capacity: 20,
        baseEnrolled: 12,
        organizerRole: 'venue',
        organizerName: '企业/地点用户',
        createdAt: now - DAY * 6
      },
      {
        id: 2008,
        title: '国际人道法主题读书会',
        type: 'lecture',
        venue: '红十字国际委员会东亚地区代表处 · 黄浦区',
        desc: '围绕《日内瓦公约》及其附加议定书展开的共读活动，由代表处工作人员领读，讨论武装冲突中的人道底线问题。',
        highlights: ['原文共读', '代表处工作人员领读', '自由讨论环节'],
        startTime: now - DAY * 10,
        endTime: now - DAY * 10 + 3 * 3600000,
        capacity: 40,
        baseEnrolled: 35,
        organizerRole: 'venue',
        organizerName: '企业/地点用户',
        createdAt: now - DAY * 30
      },
      {
        id: 2009,
        title: '社区急救员认证培训班（夏季场）',
        type: 'training',
        venue: '上海市红十字会 · 静安区',
        desc: '与周末班同样的 12 学时课程，暑期专场面向社区居民开放，课程结束后统一参加救护员证考核。',
        highlights: ['救护员证考核', '暑期专场', '全流程实操'],
        startTime: now - DAY * 26,
        endTime: now - DAY * 25,
        capacity: 30,
        baseEnrolled: 30,
        organizerRole: 'admin',
        organizerName: '管理员',
        createdAt: now - DAY * 45
      },
      {
        id: 2010,
        title: '敬老院陪伴志愿服务（秋季场）',
        type: 'volunteer',
        venue: '上海市红十字医院 · 长宁区',
        desc: '秋季敬老服务专场，志愿者两人一组进入病房陪伴老人，协助整理床铺、读报与散步。',
        highlights: ['服务时长认证', '两人一组带教', '秋季专场'],
        startTime: now - DAY * 32,
        endTime: now - DAY * 32 + 4 * 3600000,
        capacity: 20,
        baseEnrolled: 20,
        organizerRole: 'venue',
        organizerName: '企业/地点用户',
        createdAt: now - DAY * 60
      }
    ],
    // 报名记录
    enrollments: [
      { id: 1, activityId: 2002, roleKey: 'member', userName: '注册用户', timestamp: now - DAY * 2 },
      { id: 2, activityId: 2005, roleKey: 'volunteer', userName: '志愿者', timestamp: now - DAY * 18 }
    ],
    // 活动评价
    reviews: [
      {
        id: 3001,
        activityId: 2005,
        roleKey: 'volunteer',
        userName: '志愿者',
        rating: 5,
        content: '流程安排得很顺，从填表到献血不到 40 分钟。护士会一直问状态，第一次献血也不紧张。',
        timestamp: now - DAY * 14
      },
      {
        id: 3002,
        activityId: 2005,
        roleKey: 'member',
        userName: '注册用户',
        rating: 4,
        content: '纪念徽章挺好看，就是现场排队人有点多，建议分时段预约。',
        timestamp: now - DAY * 14
      },
      {
        id: 3003,
        activityId: 2006,
        roleKey: 'member',
        userName: '注册用户',
        rating: 5,
        content: '五公里走下来不累，沿途的红十字历史打卡点设计得很有心，边走边学。',
        timestamp: now - DAY * 19
      },
      {
        id: 3004,
        activityId: 2008,
        roleKey: 'volunteer',
        userName: '志愿者',
        rating: 4,
        content: '讨论很深入，原著段落读起来有点门槛，但领读的人解释得很清楚。',
        timestamp: now - DAY * 9
      },
      {
        id: 3005,
        activityId: 2009,
        roleKey: 'volunteer',
        userName: '志愿者',
        rating: 5,
        content: '两天学完收获很大，AED 实操反复练了好几轮，考核前老师会逐个纠正动作。',
        timestamp: now - DAY * 24
      },
      {
        id: 3006,
        activityId: 2009,
        roleKey: 'member',
        userName: '注册用户',
        rating: 4,
        content: '课程内容扎实，就是暑期人多，实操器材需要轮流用，建议再加一组。',
        timestamp: now - DAY * 24
      },
      {
        id: 3007,
        activityId: 2010,
        roleKey: 'volunteer',
        userName: '志愿者',
        rating: 5,
        content: '陪老人聊了一下午，有位爷爷讲了很多老上海的故事。做志愿服务最治愈的一次。',
        timestamp: now - DAY * 31
      },
      {
        id: 3008,
        activityId: 2010,
        roleKey: 'member',
        userName: '注册用户',
        rating: 4,
        content: '活动很有意义，不过岗前培训只有半小时，第一次去有点不知道怎么开口。',
        timestamp: now - DAY * 31
      }
    ]
  }
}

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeed()
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.activities)) return buildSeed()
    return {
      activities: parsed.activities,
      enrollments: parsed.enrollments || [],
      reviews: parsed.reviews || []
    }
  } catch {
    return buildSeed()
  }
}

const state = ref(loadFromStorage())

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  } catch (e) {
    console.error('保存活动数据失败', e)
  }
}

// 活动状态
export const activityStatus = (activity) => {
  const now = Date.now()
  if (now < activity.startTime) return 'upcoming'
  if (now < activity.endTime) return 'ongoing'
  return 'ended'
}

export const STATUS_META = {
  upcoming: { key: 'upcoming', label: '即将开始', color: '#0288d1' },
  ongoing: { key: 'ongoing', label: '进行中', color: '#2e7d32' },
  ended: { key: 'ended', label: '已结束', color: '#9aa5b4' }
}

export const formatActivityTime = (ts) => {
  return new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const activityTimeHint = (activity) => {
  const now = Date.now()
  if (now < activity.startTime) {
    const days = Math.ceil((activity.startTime - now) / DAY)
    if (days <= 1) return '即将开始'
    return days + ' 天后'
  }
  if (now < activity.endTime) return '进行中'
  return '已结束'
}

export const formatReviewTime = (ts) => {
  const diff = Date.now() - ts
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < DAY) return Math.floor(diff / 3600000) + ' 小时前'
  if (diff < DAY * 30) return Math.floor(diff / DAY) + ' 天前'
  return new Date(ts).toLocaleDateString('zh-CN')
}

export const useActivityStore = () => {
  const activities = computed(() => state.value.activities)
  const enrollments = computed(() => state.value.enrollments)
  const reviews = computed(() => state.value.reviews)

  // ==============================
  // 报名
  // ==============================
  const enrollmentsOf = (activityId) =>
    state.value.enrollments.filter(e => e.activityId === Number(activityId))

  const enrolledCount = (activityId) => {
    const act = state.value.activities.find(a => a.id === Number(activityId))
    if (!act) return 0
    return (act.baseEnrolled || 0) + enrollmentsOf(activityId).length
  }

  const isEnrolled = (activityId, roleKey) =>
    state.value.enrollments.some(
      e => e.activityId === Number(activityId) && e.roleKey === roleKey
    )

  const enroll = (activityId, roleKey, userName) => {
    const act = state.value.activities.find(a => a.id === Number(activityId))
    if (!act) return false
    if (isEnrolled(activityId, roleKey)) return false
    if (enrolledCount(activityId) >= act.capacity) return false
    state.value.enrollments.push({
      id: Date.now(),
      activityId: Number(activityId),
      roleKey,
      userName,
      timestamp: Date.now()
    })
    persist()
    return true
  }

  const cancelEnroll = (activityId, roleKey) => {
    const idx = state.value.enrollments.findIndex(
      e => e.activityId === Number(activityId) && e.roleKey === roleKey
    )
    if (idx < 0) return false
    state.value.enrollments.splice(idx, 1)
    persist()
    return true
  }

  // ==============================
  // 活动评价（评级）
  // ==============================
  const reviewsOf = (activityId) =>
    state.value.reviews
      .filter(r => r.activityId === Number(activityId))
      .sort((a, b) => b.timestamp - a.timestamp)

  const statsOf = (activityId) => {
    const list = reviewsOf(activityId)
    const count = list.length
    const distribution = [0, 0, 0, 0, 0]
    let sum = 0
    list.forEach(r => {
      sum += r.rating
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1] += 1
    })
    return { count, avg: count ? Number((sum / count).toFixed(1)) : 0, distribution }
  }

  const myReviewOf = (activityId, roleKey) =>
    state.value.reviews.find(
      r => r.activityId === Number(activityId) && r.roleKey === roleKey
    ) || null

  // 未结束的活动需已报名才能评级；已结束的活动所有可评价角色都能补评
  const canReview = (activityId, roleKey) => {
    const act = state.value.activities.find(a => a.id === Number(activityId))
    if (!act) return false
    if (myReviewOf(activityId, roleKey)) return false
    if (activityStatus(act) === 'ended') return true
    return isEnrolled(activityId, roleKey)
  }

  const addReview = (activityId, { roleKey, userName, rating, content }) => {
    const safeRating = Math.min(5, Math.max(1, Number(rating) || 0))
    if (!safeRating) return false
    const idx = state.value.reviews.findIndex(
      r => r.activityId === Number(activityId) && r.roleKey === roleKey
    )
    const record = {
      id: idx >= 0 ? state.value.reviews[idx].id : Date.now(),
      activityId: Number(activityId),
      roleKey,
      userName,
      rating: safeRating,
      content: (content || '').trim(),
      timestamp: Date.now()
    }
    if (idx >= 0) state.value.reviews.splice(idx, 1, record)
    else state.value.reviews.unshift(record)
    persist()
    return true
  }

  const removeReview = (reviewId) => {
    const idx = state.value.reviews.findIndex(r => r.id === Number(reviewId))
    if (idx < 0) return false
    state.value.reviews.splice(idx, 1)
    persist()
    return true
  }

  // ==============================
  // 发布与删除
  // ==============================
  const createActivity = (payload, organizer) => {
    const id = Date.now()
    state.value.activities.unshift({
      id,
      title: payload.title.trim(),
      type: payload.type,
      venue: payload.venue.trim(),
      desc: payload.desc.trim(),
      highlights: payload.highlights || [],
      startTime: payload.startTime,
      endTime: payload.endTime,
      capacity: Number(payload.capacity) || 30,
      baseEnrolled: 0,
      organizerRole: organizer.roleKey,
      organizerName: organizer.userName,
      createdAt: Date.now()
    })
    persist()
    return id
  }

  const removeActivity = (activityId) => {
    const idx = state.value.activities.findIndex(a => a.id === Number(activityId))
    if (idx < 0) return false
    state.value.activities.splice(idx, 1)
    state.value.enrollments = state.value.enrollments.filter(
      e => e.activityId !== Number(activityId)
    )
    state.value.reviews = state.value.reviews.filter(
      r => r.activityId !== Number(activityId)
    )
    persist()
    return true
  }

  // ==============================
  // 算法推荐
  // ==============================
  /**
   * 协同过滤：活动评价当作显式评分、报名当作弱正反馈，聚合到活动类型维度，
   * 复用与地点推荐相同的一对模型（UserCF 邻居法 + 低秩隐因子）
   */
  const buildRecommendModels = (roleKey) => {
    const typeIndexOf = (activityId) => {
      const act = state.value.activities.find(a => a.id === Number(activityId))
      return act ? TYPE_INDEX[act.type] : null
    }

    const items = Object.values(TYPE_INDEX).map(id => ({ id }))
    const explicit = state.value.reviews
      .map(r => ({ ...r, typeIndex: typeIndexOf(r.activityId) }))
      .filter(r => r.typeIndex)
      .map(r => ({
        roleKey: r.roleKey,
        locationId: r.typeIndex,
        rating: r.rating,
        timestamp: r.timestamp
      }))
    const implicit = state.value.enrollments
      .map(e => ({ ...e, typeIndex: typeIndexOf(e.activityId) }))
      .filter(e => e.typeIndex)
      .map(e => ({ locationId: e.typeIndex, timestamp: e.timestamp }))

    // 角色名优先取真实记录里的署名，缺失时退回角色 key
    const roleNameOf = (key) => {
      const record =
        state.value.reviews.find(r => r.roleKey === key) ||
        state.value.enrollments.find(e => e.roleKey === key)
      return record?.userName || key
    }

    const userCF = fitUserCF({
      locations: items,
      reviews: explicit,
      checkins: implicit,
      currentRoleKey: roleKey,
      roleNameOf
    })
    const latent = fitLowRankPreference({
      locations: items,
      reviews: explicit,
      checkins: implicit,
      currentRoleKey: roleKey,
      roleNameOf
    })

    return {
      userCF,
      latent,
      cf: buildCollaborativeSignal({
        userCF,
        latent,
        itemIds: items.map(item => item.id)
      })
    }
  }

  /**
   * 综合打分推荐：
   * 协同过滤 30% + 兴趣匹配 30% + 口碑评分 20% + 报名热度 10% + 时间临近 10%
   *
   * 冷启动（自己既没报名也没评价）不做个性化：改走 ACTIVITY_COLD_START_WEIGHTS，
   * 按「近期热门 + 即将开始 + 往期口碑」排序，并限制同类活动最多 2 个，
   * 保证默认列表覆盖更多类型。参与过活动后自动切回个性化推荐。
   */
  const recommend = (roleKey, limit = 4) => {
    const now = Date.now()

    const myEnrollments = state.value.enrollments.filter(e => e.roleKey === roleKey)
    const myReviews = state.value.reviews.filter(r => r.roleKey === roleKey)
    const isColdStart = myEnrollments.length === 0 && myReviews.length === 0
    const weights = isColdStart ? ACTIVITY_COLD_START_WEIGHTS : ACTIVITY_RECO_WEIGHTS

    // 1. 构建兴趣画像：报名权重 2，高分评价权重 1
    const interest = {}
    myEnrollments.forEach(e => {
      const act = state.value.activities.find(a => a.id === e.activityId)
      if (act) interest[act.type] = (interest[act.type] || 0) + 2
    })
    myReviews
      .filter(r => r.rating >= 3)
      .forEach(r => {
        const act = state.value.activities.find(a => a.id === r.activityId)
        if (act) interest[act.type] = (interest[act.type] || 0) + 1
      })
    const maxInterest = Math.max(1, ...Object.values(interest))

    // 2. 候选：未结束、未报名的活动
    const candidates = state.value.activities.filter(a => {
      if (activityStatus(a) === 'ended') return false
      return !isEnrolled(a.id, roleKey)
    })

    // 3. 协同过滤信号（冷启动时跳过，省掉无意义训练）
    const models = isColdStart ? null : buildRecommendModels(roleKey)
    const userCF = models?.userCF
    const latent = models?.latent
    const cfSignals = models?.cf.signals || { userCF: false, latent: false, cf: false }

    // 4. 打分
    const scored = candidates.map(a => {
      const interestRaw = interest[a.type] || 0
      const interestScore = interestRaw / maxInterest

      const stats = statsOf(a.id)
      const ratingScore = stats.count ? stats.avg / 5 : 0.6

      const fillRate = enrolledCount(a.id) / a.capacity
      const hotScore = Math.min(1, fillRate * 1.2)

      const days = Math.max(0, (a.startTime - now) / DAY)
      const urgencyScore = 1 / (1 + days / 7)

      const parts = [
        { weight: weights.cf, score: models ? models.cf.scoreOf(TYPE_INDEX[a.type]) : null },
        { weight: weights.interest, score: interestScore },
        { weight: weights.rating, score: ratingScore },
        { weight: weights.hot, score: hotScore },
        { weight: weights.urgency, score: urgencyScore }
      ].filter(part => part.score != null && part.weight > 0)

      const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0)
      const score = parts.reduce((sum, part) => sum + part.score * part.weight, 0) / totalWeight

      // 5. 生成可解释的推荐理由（协同信号优先）
      const reasons = []
      const typeIndex = TYPE_INDEX[a.type]
      const typeLabel = ACTIVITY_TYPES[a.type].label
      const cfInfo = models && cfSignals.userCF ? userCF.explain(typeIndex) : null

      if (cfInfo && cfInfo.supporters.length) {
        const top = cfInfo.supporters[0]
        reasons.push(`相似访客「${top.name}」在${typeLabel}类给了 ${top.rating} 分`)
      } else if (models && cfSignals.latent) {
        const latentInfo = latent.explain(typeIndex)
        if (latentInfo && latentInfo.predicted >= 4.2) {
          if (latentInfo.neighbor) {
            reasons.push(`${latentInfo.neighbor.name}在${typeLabel}类给了 ${latentInfo.neighbor.rating} 分`)
          } else {
            reasons.push(`低秩模型预测你对这类活动打 ${latentInfo.predicted.toFixed(1)} 分`)
          }
        }
      }

      if (interestRaw > 0) {
        reasons.push(`你关注过${ACTIVITY_TYPES[a.type].label}类活动`)
      }
      if (stats.count && stats.avg >= 4.5) {
        reasons.push(`往期评分 ${stats.avg} 分`)
      }
      if (fillRate >= 0.7) {
        reasons.push(`已有 ${enrolledCount(a.id)} 人报名`)
      }
      if (days <= 3) {
        reasons.push(activityTimeHint(a))
      }
      if (!reasons.length) {
        reasons.push(isColdStart ? '近期热门活动' : '综合匹配度较高')
      }

      return {
        activity: a,
        score: Number((score * 100).toFixed(0)),
        reasons: reasons.slice(0, 2)
      }
    })

    const ranked = scored.sort((a, b) => b.score - a.score)

    // 6. 冷启动时做类型打散：同类最多 2 个，避免整个列表都是急救培训
    let items = ranked.slice(0, limit)
    if (isColdStart) {
      const perType = {}
      const picked = []
      ranked.forEach(item => {
        if (picked.length >= limit) return
        const type = item.activity.type
        if ((perType[type] || 0) >= 2) return
        perType[type] = (perType[type] || 0) + 1
        picked.push(item)
      })
      // 类型不够时再用剩余的高分活动补齐，保证列表不缩水
      ranked.forEach(item => {
        if (picked.length < limit && !picked.includes(item)) picked.push(item)
      })
      items = picked
    }

    return {
      items,
      signals: cfSignals,
      mode: isColdStart ? 'cold' : 'personal',
      models: models
        ? {
            userCF: { neighborCount: userCF.neighborCount, neighbors: userCF.neighbors },
            latent: { rank: latent.rank, userCount: latent.userCount, rmse: latent.rmse }
          }
        : {
            userCF: { neighborCount: 0, neighbors: [] },
            latent: { rank: 0, userCount: 0, rmse: 0 }
          }
    }
  }

  return {
    activities,
    enrollments,
    reviews,
    enrollmentsOf,
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
  }
}
