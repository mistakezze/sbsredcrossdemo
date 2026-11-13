import { ref, computed } from 'vue'
import {
  SIMULATED_REGISTERED_USERS,
  SIMULATED_USER_BY_ID,
  pickRandomRegisteredUsers
} from '../data/demoUsers'

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
    color: '#ef5654',
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
const VALID_ROLE_KEYS = new Set([
  ...ROLES.map(role => role.key),
  ...SIMULATED_REGISTERED_USERS.map(user => user.id)
])
const registeredAccountSample = ref(pickRandomRegisteredUsers(5))

const loadRole = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return VALID_ROLE_KEYS.has(saved) ? saved : DEFAULT_ROLE
  } catch {
    return DEFAULT_ROLE
  }
}

const currentRoleKey = ref(loadRole())

const includeCurrentRegisteredUser = (users) => {
  const current = SIMULATED_USER_BY_ID.get(currentRoleKey.value)
  if (!current || users.some(user => user.id === current.id)) return users
  return [...users.slice(0, users.length - 1), current]
}

const refreshRegisteredAccounts = () => {
  registeredAccountSample.value = includeCurrentRegisteredUser(pickRandomRegisteredUsers(5))
  return registeredAccountSample.value
}

const saveRole = () => {
  try {
    localStorage.setItem(STORAGE_KEY, currentRoleKey.value)
  } catch (e) {
    console.error('保存角色失败', e)
  }
}

export const useUserStore = () => {
  const currentUser = computed(
    () =>
      SIMULATED_USER_BY_ID.get(currentRoleKey.value) ||
      ROLES.find(r => r.key === currentRoleKey.value) ||
      ROLES[3]
  )

  const setRole = (key) => {
    if (!VALID_ROLE_KEYS.has(key)) return false
    currentRoleKey.value = key
    saveRole()
    return true
  }

  // 权限判断：can('review') / can('moderate') / can('checkin') / can('uploadLocation')
  const can = (action) => {
    const permissionRole = currentUser.value.permissionRole || currentRoleKey.value
    const perm = PERMISSIONS[permissionRole]
    return !!(perm && perm[action])
  }

  const getRole = (key) =>
    SIMULATED_USER_BY_ID.get(key) || ROLES.find(r => r.key === key)

  return {
    ROLES,
    currentRoleKey,
    currentUser,
    registeredAccountSample,
    refreshRegisteredAccounts,
    registeredUserCount: SIMULATED_REGISTERED_USERS.length,
    setRole,
    can,
    getRole
  }
}
