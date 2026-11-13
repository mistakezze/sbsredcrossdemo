import { ref, computed } from 'vue'

const STORAGE_KEY = 'redcross_place_submissions'
const DAY = 86400000

// 上传地点可选的类别
export const PLACE_CATEGORIES = [
  '博物馆',
  '机构',
  '救灾中心',
  '医疗机构',
  '国际组织',
  '青少年教育',
  '公益机构',
  '纪念公园',
  '教育基地',
  '志愿服务站',
  '其他'
]

// 自动分配的颜色
const COLORS = ['#ef5654', '#f47a76', '#f9a39a', '#81021f', '#9d1934', '#5d0017']

// 审核状态
export const SUBMIT_STATUS = {
  pending: { key: 'pending', label: '待审核', color: '#f9a825', icon: 'clock' },
  approved: { key: 'approved', label: '已通过', color: '#2e7d32', icon: 'check' },
  rejected: { key: 'rejected', label: '已驳回', color: '#81021f', icon: 'x' }
}

const buildSeed = () => {
  const now = Date.now()
  return [
    {
      id: 5001,
      name: '上海红十字人道主义教育基地',
      location: '上海市 · 虹口区',
      category: '教育基地',
      era: 'modern',
      description:
        '依托老厂房改造的人道主义主题教育基地，设有沉浸式情景剧场、模拟灾区通道与青少年人道课堂，常年面向学校和企事业单位开放。',
      history: '2021 年由区红十字会与街道共建，是本市首批社区级人道主义教育基地之一。',
      highlights: ['沉浸式情景剧场', '模拟灾区体验通道', '青少年人道课堂'],
      lat: 31.2565,
      lng: 121.482,
      color: '#ef5654',
      submitterRole: 'venue',
      submitterName: '企业/地点用户',
      status: 'pending',
      reviewNote: '',
      createdAt: now - DAY * 2,
      reviewedAt: null
    },
    {
      id: 5002,
      name: '徐汇区红十字志愿服务站',
      location: '上海市 · 徐汇区',
      category: '志愿服务站',
      era: 'modern',
      description:
        '社区嵌入式志愿服务站点，提供应急救护咨询、无偿献血宣传、独居老人结对帮扶对接等服务，每周固定开展急救技能微课堂。',
      history: '2023 年设立，是徐汇区首批标准化社区红十字志愿服务站。',
      highlights: ['急救技能微课堂', '志愿者现场注册', '独居老人结对帮扶'],
      lat: 31.1955,
      lng: 121.4432,
      color: '#f47a76',
      submitterRole: 'venue',
      submitterName: '企业/地点用户',
      status: 'approved',
      reviewNote: '信息完整，位置核实无误，准予上线。',
      createdAt: now - DAY * 8,
      reviewedAt: now - DAY * 6
    },
    {
      id: 5003,
      name: '某红十字文化展馆',
      location: '上海市 · 未知',
      category: '其他',
      era: 'history',
      description: '待补充。',
      history: '',
      highlights: [],
      lat: 31.23,
      lng: 121.47,
      color: '#ef5654',
      submitterRole: 'venue',
      submitterName: '企业/地点用户',
      status: 'rejected',
      reviewNote: '地点信息不完整（缺少具体地址与简介），且未提供可核实的场地照片，请补充后重新提交。',
      createdAt: now - DAY * 12,
      reviewedAt: now - DAY * 10
    }
  ]
}

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeed()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : buildSeed()
  } catch {
    return buildSeed()
  }
}

const submissionsRef = ref(loadFromStorage())

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissionsRef.value))
  } catch (e) {
    console.error('保存地点提交失败', e)
  }
}

export const formatSubmitTime = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const usePlaceSubmitStore = () => {
  const submissions = computed(() => submissionsRef.value)

  // 已通过审核的地点，会被合并进地点库
  const approvedLocations = computed(() =>
    submissionsRef.value.filter(s => s.status === 'approved')
  )

  const pendingList = computed(() =>
    submissionsRef.value
      .filter(s => s.status === 'pending')
      .sort((a, b) => b.createdAt - a.createdAt)
  )

  const stats = computed(() => {
    const base = { pending: 0, approved: 0, rejected: 0 }
    submissionsRef.value.forEach(s => {
      base[s.status] += 1
    })
    return base
  })

  // 当前角色提交的地点
  const mySubmissions = (roleKey) =>
    submissionsRef.value
      .filter(s => s.submitterRole === roleKey)
      .sort((a, b) => b.createdAt - a.createdAt)

  const submitPlace = (payload, submitter) => {
    const id = Date.now()
    const record = {
      id,
      name: payload.name.trim(),
      location: payload.location.trim(),
      category: payload.category,
      era: payload.era,
      description: payload.description.trim(),
      history: (payload.history || '').trim(),
      highlights: payload.highlights || [],
      lat: Number(payload.lat),
      lng: Number(payload.lng),
      color: COLORS[submissionsRef.value.length % COLORS.length],
      submitterRole: submitter.roleKey,
      submitterName: submitter.userName,
      status: 'pending',
      reviewNote: '',
      createdAt: Date.now(),
      reviewedAt: null
    }
    submissionsRef.value.unshift(record)
    persist()
    return id
  }

  const approve = (id, note) => {
    const item = submissionsRef.value.find(s => s.id === Number(id))
    if (!item) return false
    item.status = 'approved'
    item.reviewNote = (note || '').trim() || '信息核实无误，准予上线。'
    item.reviewedAt = Date.now()
    persist()
    return true
  }

  const reject = (id, note) => {
    const item = submissionsRef.value.find(s => s.id === Number(id))
    if (!item) return false
    item.status = 'rejected'
    item.reviewNote = (note || '').trim() || '信息不完整，请补充后重新提交。'
    item.reviewedAt = Date.now()
    persist()
    return true
  }

  const removeSubmission = (id) => {
    const idx = submissionsRef.value.findIndex(s => s.id === Number(id))
    if (idx < 0) return false
    submissionsRef.value.splice(idx, 1)
    persist()
    return true
  }

  const getSubmissionById = (id) =>
    submissionsRef.value.find(s => s.id === Number(id)) || null

  return {
    submissions,
    approvedLocations,
    pendingList,
    stats,
    mySubmissions,
    submitPlace,
    approve,
    reject,
    removeSubmission,
    getSubmissionById
  }
}
