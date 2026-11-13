const LOCATION_TEMPLATES = [
  { id: 1, category: '博物馆' },
  { id: 2, category: '机构' },
  { id: 3, category: '救灾中心' },
  { id: 4, category: '医疗机构' },
  { id: 5, category: '国际组织' },
  { id: 6, category: '青少年教育' },
  { id: 7, category: '公益机构' },
  { id: 8, category: '纪念公园' },
  { id: 9, category: '志愿服务站' }
]

const ACTIVITY_TYPE_IDS = {
  training: [2001, 2003, 2009],
  volunteer: [2004, 2007, 2010],
  lecture: [2002, 2008],
  blood: [2005],
  fundraiser: [2006]
}

const ACTIVITY_TYPE_LABELS = {
  training: '急救培训',
  volunteer: '志愿服务',
  lecture: '人道讲座',
  blood: '无偿献血',
  fundraiser: '公益筹款'
}

const SURNAMES = ['沈', '张', '王', '李', '陈', '杨', '赵', '周', '吴', '徐']
const GIVEN_NAMES = ['知远', '思齐', '雨辰', '若岚', '明川', '嘉宁', '安然', '书桐', '清和', '星野']
const AVATAR_COLORS = ['#ef5654', '#81021f', '#f47a76', '#9d1934', '#d94f50']
const PREFERENCE_TYPES = Object.keys(ACTIVITY_TYPE_IDS)

const createRandom = (seed) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

const random = createRandom(20261113)
const pick = (list) => list[Math.floor(random() * list.length)]

const shuffle = (list) => {
  const result = [...list]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const buildUser = (index) => {
  const surname = SURNAMES[index % SURNAMES.length]
  const givenName = GIVEN_NAMES[Math.floor(index / SURNAMES.length)]
  const id = `registered_${String(index + 1).padStart(3, '0')}`

  const preferredCategories = shuffle(
    [...new Set(LOCATION_TEMPLATES.map(location => location.category))]
  ).slice(0, 2 + (index % 2))
  const preferredActivityTypes = shuffle(PREFERENCE_TYPES).slice(0, 1 + (index % 2))

  return {
    id,
    key: id,
    name: `${surname}${givenName}`,
    icon: 'userHeart',
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    permissionRole: 'member',
    desc: `登录账号 · 偏好 ${preferredCategories.join('、')}`,
    preferredCategories,
    preferredActivityTypes,
    preferredActivityLabels: preferredActivityTypes.map(type => ACTIVITY_TYPE_LABELS[type]),
    starred: false,
    starLevel: 0,
    simulated: true
  }
}

export const SIMULATED_REGISTERED_USERS = Array.from({ length: 100 }, (_, index) => buildUser(index))

export const SIMULATED_USER_BY_ID = new Map(
  SIMULATED_REGISTERED_USERS.map(user => [user.id, user])
)

const locationReviews = []
const locationCheckins = []
const activityReviews = []
const activityEnrollments = []

SIMULATED_REGISTERED_USERS.forEach((user, index) => {
  const preferredLocationPool = LOCATION_TEMPLATES.filter(location =>
    user.preferredCategories.includes(location.category)
  )
  const otherLocationPool = LOCATION_TEMPLATES.filter(location =>
    !user.preferredCategories.includes(location.category)
  )
  const selectedLocations = shuffle([
    ...shuffle(preferredLocationPool).slice(0, Math.min(3, preferredLocationPool.length)),
    ...shuffle(otherLocationPool).slice(0, 3)
  ]).slice(0, 5 + (index % 2))

  selectedLocations.forEach((location, reviewIndex) => {
    const prefersCategory = user.preferredCategories.includes(location.category)
    const rating = prefersCategory
      ? (reviewIndex % 2 === 0 ? 5 : 4)
      : (reviewIndex % 4 === 0 ? 3 : 4)
    const timestamp = Date.UTC(2026, 9, 1) + index * 3600000 + reviewIndex * 60000

    locationReviews.push({
      id: 400000 + index * 20 + reviewIndex,
      locationId: location.id,
      roleKey: user.id,
      userName: user.name,
      rating,
      content: '',
      timestamp,
      simulated: true
    })

    if (rating >= 4 && reviewIndex < 2) {
      locationCheckins.push({
        id: 500000 + index * 10 + reviewIndex,
        locationId: location.id,
        roleKey: user.id,
        timestamp,
        simulated: true
      })
    }
  })

  user.preferredActivityTypes.slice(0, 2).forEach((type, typeIndex) => {
    const activityId = pick(ACTIVITY_TYPE_IDS[type])
    const timestamp = Date.UTC(2026, 9, 2) + index * 3600000 + typeIndex * 120000
    activityReviews.push({
      id: 600000 + index * 10 + typeIndex,
      activityId,
      roleKey: user.id,
      userName: user.name,
      rating: typeIndex === 0 ? 5 : 4,
      content: '',
      timestamp,
      simulated: true
    })
  })

  const enrollmentType = user.preferredActivityTypes[0]
  activityEnrollments.push({
    id: 700000 + index,
    activityId: pick(ACTIVITY_TYPE_IDS[enrollmentType]),
    roleKey: user.id,
    userName: user.name,
    timestamp: Date.UTC(2026, 9, 3) + index * 3600000,
    simulated: true
  })
})

export const SIMULATED_LOCATION_REVIEWS = locationReviews
export const SIMULATED_LOCATION_CHECKINS = locationCheckins
export const SIMULATED_ACTIVITY_REVIEWS = activityReviews
export const SIMULATED_ACTIVITY_ENROLLMENTS = activityEnrollments

export const simulatedLocationCheckinsFor = (roleKey) =>
  SIMULATED_LOCATION_CHECKINS.filter(checkin => checkin.roleKey === roleKey)

export const pickRandomRegisteredUsers = (count = 5) => {
  const pool = [...SIMULATED_REGISTERED_USERS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}
