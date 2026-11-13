import { buildPreferenceMatrix } from './preferenceMatrix'

/**
 * UserCF（基于用户的协同过滤）
 *
 * 思路：口味相近的访客，对同一个地点的评价也应当相近。
 * 1. 在共同评价过的地点上，计算当前访客与其他访客的相似度（皮尔逊相关，
 *    共同项目仅 1 个时方差为零，退化为余弦相似度）
 * 2. 用共同项目数做收缩：sim' = sim × n / (n + λ)，避免只共同看过一个地点
 *    就被当成「高度相似」
 * 3. 取相似度最高的 K 个邻居，用邻居对该地点的评分做相似度加权平均，预测当前
 *    访客对未到访地点的评分：
 *
 *       r̂(u,i) = Σ_v sim(u,v)·r(v,i) / Σ_v |sim(u,v)|
 *
 *    数据稠密（人均评分 ≥ 5）时改用去偏形式，抵消个人打分松紧：
 *
 *       r̂(u,i) = mean(u) + Σ_v sim(u,v)·(r(v,i) - mean(v)) / Σ_v |sim(u,v)|
 *
 *    稀疏时退回加权平均：demo 的种子数据里每位访客只有一两条评分，均值偏差恒为 0，
 *    去偏预测会退化成同一个常数、失去区分度。
 */

const UNAVAILABLE = Object.freeze({
  available: false,
  neighborCount: 0,
  neighbors: [],
  predict: () => null,
  explain: () => null
})

const mean = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length

const clampRating = (v) => Math.min(5, Math.max(1, v))

const pearson = (a, b) => {
  const ma = mean(a)
  const mb = mean(b)
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma
    const y = b[i] - mb
    num += x * y
    da += x * x
    db += y * y
  }
  // 任一方在共同项目上没有波动时，相关系数无定义
  if (da < 1e-9 || db < 1e-9) return null
  return num / Math.sqrt(da * db)
}

const cosine = (a, b) => {
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < a.length; i++) {
    num += a[i] * b[i]
    da += a[i] * a[i]
    db += b[i] * b[i]
  }
  return da && db ? num / Math.sqrt(da * db) : 0
}

/**
 * @returns {{
 *   available: boolean,
 *   neighborCount: number,
 *   neighbors: Array<{ name: string, roleKey: string, similarity: number, coCount: number }>,
 *   predict: (itemId: number) => number|null,
 *   explain: (itemId: number) => ({ predicted: number, supporters: Array<{ name: string, rating: number, similarity: number }> })|null
 * }}
 */
export const fitUserCF = ({
  locations = [],
  reviews = [],
  checkins = [],
  currentRoleKey = 'member',
  roleNameOf = (key) => key,
  k = 5,
  shrinkage = 1
} = {}) => {
  const matrix = buildPreferenceMatrix({ locations, reviews, checkins, currentRoleKey })
  const me = matrix.users.get(currentRoleKey)

  // 冷启动：自己没有评分，或系统里没有第二个访客，就没有邻居可找
  if (!me || !me.size || matrix.users.size < 2) return UNAVAILABLE

  // 偏差校正（去偏预测）需要足够多的评分才能估计出稳定的用户均值：
  // 数据稠密时抵消个人打分松紧，稀疏时退回原始加权平均，避免预测退化成同一常数
  const avgRatingsPerUser =
    [...matrix.users.values()].reduce((sum, map) => sum + map.size, 0) / matrix.users.size
  const useBiasCorrection = avgRatingsPerUser >= 5 && me.size >= 2
  const myMean = useBiasCorrection ? mean([...me.values()].map((s) => s.value)) : 0

  // 1. 与其他访客的相似度
  const candidates = []
  matrix.users.forEach((theirMap, roleKey) => {
    if (roleKey === currentRoleKey) return

    const coItems = [...theirMap.keys()].filter((itemId) => me.has(itemId))
    if (!coItems.length) return

    const a = coItems.map((itemId) => me.get(itemId).value)
    const b = coItems.map((itemId) => theirMap.get(itemId).value)
    const base = pearson(a, b) ?? cosine(a, b)

    // 共同项目越少越不可信，向 0 收缩
    const similarity = base * (coItems.length / (coItems.length + shrinkage))
    if (similarity <= 0) return

    candidates.push({
      roleKey,
      name: roleNameOf(roleKey),
      similarity,
      ratings: theirMap,
      // 邻居的全局均分（覆盖其全部评分，而不是仅共同项）
      userMean: mean([...theirMap.values()].map((s) => s.value)),
      coCount: coItems.length
    })
  })

  // 2. Top-K 邻居
  candidates.sort((x, y) => y.similarity - x.similarity)
  const neighbors = candidates.slice(0, k)
  if (!neighbors.length) return UNAVAILABLE

  // 3. 邻居加权预测；无邻居评价过该地点时返回 null（交由上层兜底）
  const predict = (itemId) => {
    const id = Number(itemId)
    let num = 0
    let den = 0
    neighbors.forEach((n) => {
      const record = n.ratings.get(id)
      if (!record) return
      num += n.similarity * (useBiasCorrection ? record.value - n.userMean : record.value)
      den += n.similarity
    })
    if (!den) return null
    return clampRating(useBiasCorrection ? myMean + num / den : num / den)
  }

  // 4. 可解释性：哪些相似访客真的评价过这里
  const explain = (itemId) => {
    const id = Number(itemId)
    const predicted = predict(id)
    if (predicted == null) return null

    const supporters = neighbors
      .filter((n) => n.ratings.has(id) && !n.ratings.get(id).implicit)
      .sort((x, y) => y.similarity - x.similarity)
      .slice(0, 2)
      .map((n) => ({
        name: n.name,
        rating: n.ratings.get(id).value,
        similarity: Number(n.similarity.toFixed(2))
      }))

    return { predicted: Number(predicted.toFixed(2)), supporters }
  }

  return {
    available: true,
    neighborCount: neighbors.length,
    neighbors: neighbors.map((n) => ({
      roleKey: n.roleKey,
      name: n.name,
      similarity: Number(n.similarity.toFixed(2)),
      coCount: n.coCount
    })),
    predict,
    explain
  }
}
