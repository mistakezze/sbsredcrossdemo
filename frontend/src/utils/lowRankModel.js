/**
 * 偏好的低秩假设（Low-Rank Assumption）
 *
 * 核心假设：访客对地点的偏好并不是彼此独立、杂乱无章的，而是由少数几个潜在因子
 * （例如「历史叙事」「亲子互动」「公益参与」）共同驱动。因此「访客 × 地点」的
 * 偏好矩阵 R 近似低秩：
 *
 *     R ≈ μ + b_u + b_i + P_u · Q_iᵀ
 *
 * 其中 P（访客 × k）与 Q（地点 × k）分别是访客和地点在 k 维隐空间中的坐标，
 * μ 是全局均分，b_u / b_i 是访客与地点的偏置。只要秩 k 远小于访客数和地点数，
 * 少量参数就能解释整张矩阵，未观测到的格子也能被「重建」出来。
 *
 * 实现方式：带偏置的隐因子分解（FunkSVD 风格，SGD 训练）。只用已观测的评分拟合
 * 隐向量，再用重建矩阵为当前访客预测他还没到访过的地点的偏好分。
 */

import { buildPreferenceMatrix } from './preferenceMatrix'

const UNAVAILABLE = Object.freeze({
  available: false,
  rank: 0,
  observedCount: 0,
  userCount: 0,
  rmse: 0,
  predict: () => null,
  explain: () => null
})

// 固定种子的伪随机数，保证同一次点击得到稳定的推荐结果
const makeRandom = (seed) => {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const clampRating = (v) => Math.min(5, Math.max(1, v))

/**
 * 训练低秩偏好模型
 * @returns {{
 *   available: boolean,
 *   rank: number,
 *   observedCount: number,
 *   userCount: number,
 *   rmse: number,
 *   predict: (itemId: number, roleKey?: string) => number|null,
 *   explain: (itemId: number) => ({ predicted: number, neighbor: { name: string, rating: number, similarity: number }|null })|null
 * }}
 */
export const fitLowRankPreference = ({
  locations = [],
  reviews = [],
  checkins = [],
  currentRoleKey = 'member',
  roleNameOf = (key) => key,
  rank = 3,
  epochs = 320,
  learningRate = 0.03,
  regularization = 0.08
} = {}) => {
  // 1. 观测矩阵与 UserCF 共用同一份口径
  const matrix = buildPreferenceMatrix({ locations, reviews, checkins, currentRoleKey })
  const { itemIds, samples } = matrix
  if (itemIds.length < 3) return UNAVAILABLE

  const users = [...matrix.users.keys()]

  // 数据太少时无法做分解，交由上层退回纯内容特征打分
  if (samples.length < 3 || users.length < 2) return UNAVAILABLE

  // 2. 秩 k 必须严格小于矩阵的维度，否则「低秩约束」就失去意义
  const k = Math.max(1, Math.min(rank, Math.min(users.length, itemIds.length) - 1))

  const mu = samples.reduce((sum, s) => sum + s.value, 0) / samples.length
  const bu = new Map(users.map((u) => [u, 0]))
  const bi = new Map(itemIds.map((i) => [i, 0]))

  const rand = makeRandom(20240513)
  const initVec = () => Array.from({ length: k }, () => (rand() - 0.5) * 0.1)
  const P = new Map(users.map((u) => [u, initVec()]))
  const Q = new Map(itemIds.map((i) => [i, initVec()]))

  // 3. SGD 最小化 ∑(r - r̂)² + λ(‖P‖² + ‖Q‖² + b²)
  const order = [...samples]
  for (let epoch = 0; epoch < epochs; epoch++) {
    // Fisher-Yates 洗牌，避免固定顺序带来的偏置
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      const tmp = order[i]
      order[i] = order[j]
      order[j] = tmp
    }

    order.forEach((s) => {
      const pu = P.get(s.user)
      const qi = Q.get(s.item)
      if (!pu || !qi) return

      let pred = mu + bu.get(s.user) + bi.get(s.item)
      for (let d = 0; d < k; d++) pred += pu[d] * qi[d]

      const err = s.value - pred
      // 隐式打卡的置信度低于显式评分，步长减半
      const step = learningRate * (s.implicit ? 0.5 : 1)

      bu.set(s.user, bu.get(s.user) + step * (err - regularization * bu.get(s.user)))
      bi.set(s.item, bi.get(s.item) + step * (err - regularization * bi.get(s.item)))

      for (let d = 0; d < k; d++) {
        const p = pu[d]
        const q = qi[d]
        pu[d] = p + step * (err * q - regularization * p)
        qi[d] = q + step * (err * p - regularization * q)
      }
    })
  }

  const predict = (itemId, roleKey = currentRoleKey) => {
    const id = Number(itemId)
    const pu = P.get(roleKey)
    const qi = Q.get(id)
    if (!pu || !qi) return null
    let pred = mu + (bu.get(roleKey) || 0) + (bi.get(id) || 0)
    for (let d = 0; d < k; d++) pred += pu[d] * qi[d]
    return clampRating(pred)
  }

  // 4. 可解释性：找隐向量最接近、且真实评价过该地点的其他访客
  const cosine = (a, b) => {
    let dot = 0
    let na = 0
    let nb = 0
    for (let d = 0; d < k; d++) {
      dot += a[d] * b[d]
      na += a[d] * a[d]
      nb += b[d] * b[d]
    }
    return na && nb ? dot / Math.sqrt(na * nb) : 0
  }

  const explain = (itemId) => {
    const id = Number(itemId)
    const predicted = predict(id)
    if (predicted == null) return null

    const me = P.get(currentRoleKey)
    let best = null
    samples.forEach((s) => {
      if (s.user === currentRoleKey || s.item !== id || s.implicit) return
      const other = P.get(s.user)
      if (!other || !me) return
      const similarity = cosine(me, other)
      if (!best || similarity > best.similarity) {
        best = { similarity, roleKey: s.user, rating: s.value }
      }
    })

    return {
      predicted: Number(predicted.toFixed(2)),
      neighbor:
        best && best.similarity > 0.35
          ? {
              name: roleNameOf(best.roleKey),
              rating: best.rating,
              similarity: Number(best.similarity.toFixed(2))
            }
          : null
    }
  }

  const rmse = Math.sqrt(
    samples.reduce((sum, s) => {
      const pred = predict(s.item, s.user)
      const err = s.value - (pred == null ? 0 : pred)
      return sum + err * err
    }, 0) / samples.length
  )

  return {
    available: true,
    rank: k,
    observedCount: samples.length,
    userCount: users.length,
    rmse: Number(rmse.toFixed(2)),
    predict,
    explain
  }
}
