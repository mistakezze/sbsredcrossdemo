/**
 * 统一的「访客 × 地点」偏好矩阵
 *
 * UserCF 与低秩模型共用同一份观测数据，避免两套口径不一致：
 * - 显式评分优先，同一访客对同一地点只取最新一条
 * - 当前访客打过卡但没评分的地点，按 4 分记作弱正反馈（不覆盖显式评分）
 */

export const buildPreferenceMatrix = ({
  locations = [],
  reviews = [],
  checkins = [],
  currentRoleKey = 'member'
} = {}) => {
  const itemIds = locations.map((l) => l.id)
  const itemSet = new Set(itemIds)

  const empty = {
    itemIds,
    itemSet,
    users: new Map(),
    samples: [],
    currentRoleKey
  }
  if (!itemIds.length) return empty

  const observed = new Map()

  reviews.forEach((r) => {
    const itemId = Number(r.locationId)
    if (!itemSet.has(itemId) || !r.roleKey) return
    const rating = Number(r.rating)
    if (!rating) return

    const key = `${r.roleKey}|${itemId}`
    const prev = observed.get(key)
    if (!prev || (r.timestamp || 0) > (prev.timestamp || 0)) {
      observed.set(key, {
        user: r.roleKey,
        item: itemId,
        value: Math.min(5, Math.max(1, rating)),
        implicit: false,
        timestamp: r.timestamp || 0
      })
    }
  })

  checkins.forEach((c) => {
    const itemId = Number(c.locationId)
    if (!itemSet.has(itemId)) return
    const key = `${currentRoleKey}|${itemId}`
    if (observed.has(key)) return
    observed.set(key, {
      user: currentRoleKey,
      item: itemId,
      value: 4,
      implicit: true,
      timestamp: c.timestamp || 0
    })
  })

  const samples = [...observed.values()]
  const users = new Map()
  samples.forEach((s) => {
    if (!users.has(s.user)) users.set(s.user, new Map())
    users.get(s.user).set(s.item, s)
  })

  return { itemIds, itemSet, users, samples, currentRoleKey }
}
