import { ref } from 'vue'

const STORAGE_KEY = 'redcross_reviews'

const DAY = 86400000

// 种子评价：让页面一进来就有真实内容可看
const seedReviews = [
  {
    id: 1001,
    locationId: 1,
    roleKey: 'volunteer',
    userName: '志愿者',
    rating: 5,
    content: '讲解志愿者非常专业，二楼战地救护复原区看得眼眶发热。建议挑周三上午来，人少且刚好有免费讲解。',
    timestamp: Date.now() - DAY * 3
  },
  {
    id: 1002,
    locationId: 1,
    roleKey: 'guest',
    userName: '游客用户',
    rating: 4,
    content: '展陈扎实，AR 组装担架的互动很有意思。唯一遗憾是文创区偏小，想买个纪念徽章没太多选择。',
    timestamp: Date.now() - DAY * 6
  },
  {
    id: 1003,
    locationId: 2,
    roleKey: 'member',
    userName: '注册用户',
    rating: 4,
    content: '一楼的爱心捐赠墙可以写字，工作人员很耐心地介绍了志愿者注册流程，当场就填了表。',
    timestamp: Date.now() - DAY * 2
  },
  {
    id: 1004,
    locationId: 3,
    roleKey: 'venue',
    userName: '企业/地点用户',
    rating: 5,
    content: '作为共建单位来参访过一次，仓储调度中心的数字化程度超出预期，物资出入库全程扫码可追溯。',
    timestamp: Date.now() - DAY * 9
  },
  {
    id: 1005,
    locationId: 4,
    roleKey: 'volunteer',
    userName: '志愿者',
    rating: 5,
    content: '门诊大厅的钢琴角真的能缓解焦虑，这个设计很人道。院史馆里的百年病历值得细看。',
    timestamp: Date.now() - DAY * 5
  },
  {
    id: 1006,
    locationId: 6,
    roleKey: 'member',
    userName: '注册用户',
    rating: 5,
    content: '带孩子参加了周末急救训练营，两个小时孩子完全投入，还拿了结业小证书，回家路上一直在讲。',
    timestamp: Date.now() - DAY * 1
  },
  {
    id: 1007,
    locationId: 8,
    roleKey: 'guest',
    userName: '游客用户',
    rating: 4,
    content: '公园免费开放，博爱广场适合散步，秋天来最好。承诺墙上的手写卡片挺打动人的。',
    timestamp: Date.now() - DAY * 12
  }
]

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return [...seedReviews]
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : [...seedReviews]
  } catch {
    return [...seedReviews]
  }
}

const reviewsRef = ref(loadFromStorage())

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewsRef.value))
  } catch (e) {
    console.error('保存评价失败', e)
  }
}

// 相对时间：刚刚 / N 小时前 / N 天前 / 日期
export const formatReviewTime = (ts) => {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < DAY) return Math.floor(diff / 3600000) + ' 小时前'
  if (diff < DAY * 30) return Math.floor(diff / DAY) + ' 天前'
  return new Date(ts).toLocaleDateString('zh-CN')
}

export const useReviewStore = () => {
  // 按地点取评价，时间倒序（filter 返回新数组，不污染原数据）
  const getReviewsByLocation = (locationId) => {
    const rid = Number(locationId)
    return reviewsRef.value
      .filter(r => r.locationId === rid)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  // 统计：数量 / 平均分 / 各星级分布（下标 0 对应 1 星）
  const getStats = (locationId) => {
    const list = getReviewsByLocation(locationId)
    const count = list.length
    const distribution = [0, 0, 0, 0, 0]
    let sum = 0
    list.forEach(r => {
      sum += r.rating
      if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1] += 1
    })
    return {
      count,
      avg: count ? Number((sum / count).toFixed(1)) : 0,
      distribution
    }
  }

  const getAvgRating = (locationId) => getStats(locationId).avg

  // 当前角色在某地点已发布的评价
  const getReviewByRole = (locationId, roleKey) => {
    const rid = Number(locationId)
    return reviewsRef.value.find(r => r.locationId === rid && r.roleKey === roleKey) || null
  }

  // 新增或更新（同一角色对同一地点只保留一条）
  const addReview = (locationId, { roleKey, userName, rating, content }) => {
    const rid = Number(locationId)
    const safeRating = Math.min(5, Math.max(1, Number(rating) || 0))
    if (!safeRating) return false

    const idx = reviewsRef.value.findIndex(
      r => r.locationId === rid && r.roleKey === roleKey
    )

    const record = {
      id: idx >= 0 ? reviewsRef.value[idx].id : Date.now(),
      locationId: rid,
      roleKey,
      userName,
      rating: safeRating,
      content: (content || '').trim(),
      timestamp: Date.now()
    }

    if (idx >= 0) {
      reviewsRef.value.splice(idx, 1, record)
    } else {
      reviewsRef.value.unshift(record)
    }

    saveToStorage()
    return true
  }

  const removeReview = (id) => {
    const index = reviewsRef.value.findIndex(r => r.id === Number(id))
    if (index >= 0) {
      reviewsRef.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  return {
    reviews: reviewsRef,
    getReviewsByLocation,
    getStats,
    getAvgRating,
    getReviewByRole,
    addReview,
    removeReview
  }
}
