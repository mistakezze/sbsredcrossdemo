import { ref, computed } from 'vue'

const STORAGE_KEY = 'redcross_current_role'

// 五种演示角色（顺序与产品需求一致）
export const ROLES = [
  {
    key: 'admin',
    name: '管理员',
    icon: 'shield',
    color: '#7b1fa2',
    desc: '平台管理者，可审核地点、删除不当评价',
    starred: false,
    starLevel: 0
  },
  {
    key: 'venue',
    name: '企业/地点用户',
    icon: 'building',
    color: '#0288d1',
    desc: '场馆与企业账号，可上传自定义地点',
    starred: false,
    starLevel: 0
  },
  {
    key: 'guest',
    name: '游客用户',
    icon: 'user',
    color: '#78909c',
    desc: '未注册访客，仅可浏览与查看评价',
    starred: false,
    starLevel: 0
  },
  {
    key: 'member',
    name: '注册用户',
    icon: 'userHeart',
    color: '#d32f2f',
    desc: '核心用户，可打卡、评价与打分',
    starred: false,
    starLevel: 0
  },
  {
    key: 'volunteer',
    name: '志愿者',
    icon: 'medal',
    color: '#f9a825',
    desc: '星标用户，享有星级荣誉，可评价与打分',
    starred: true,
    starLevel: 4
  }
]

// 角色权限表
export const PERMISSIONS = {
  admin: {
    review: true, moderate: true, checkin: true, uploadLocation: true,
    publishActivity: true, enrollActivity: true
  },
  venue: {
    review: true, moderate: false, checkin: true, uploadLocation: true,
    publishActivity: true, enrollActivity: true
  },
  guest: {
    review: false, moderate: false, checkin: false, uploadLocation: false,
    publishActivity: false, enrollActivity: false
  },
  member: {
    review: true, moderate: false, checkin: true, uploadLocation: false,
    publishActivity: false, enrollActivity: true
  },
  volunteer: {
    review: true, moderate: false, checkin: true, uploadLocation: false,
    publishActivity: false, enrollActivity: true
  }
}

const DEFAULT_ROLE = 'member'

const loadRole = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return ROLES.some(r => r.key === saved) ? saved : DEFAULT_ROLE
  } catch {
    return DEFAULT_ROLE
  }
}

const currentRoleKey = ref(loadRole())

const saveRole = () => {
  try {
    localStorage.setItem(STORAGE_KEY, currentRoleKey.value)
  } catch (e) {
    console.error('保存角色失败', e)
  }
}

export const useUserStore = () => {
  const currentUser = computed(
    () => ROLES.find(r => r.key === currentRoleKey.value) || ROLES[3]
  )

  const setRole = (key) => {
    if (!ROLES.some(r => r.key === key)) return false
    currentRoleKey.value = key
    saveRole()
    return true
  }

  // 权限判断：can('review') / can('moderate') / can('checkin') / can('uploadLocation')
  const can = (action) => {
    const perm = PERMISSIONS[currentRoleKey.value]
    return !!(perm && perm[action])
  }

  const getRole = (key) => ROLES.find(r => r.key === key)

  return {
    ROLES,
    currentRoleKey,
    currentUser,
    setRole,
    can,
    getRole
  }
}
