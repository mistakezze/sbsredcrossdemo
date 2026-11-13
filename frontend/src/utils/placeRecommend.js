import { haversineKm } from './coordTransform'
import { fitLowRankPreference } from './lowRankModel'
import { fitUserCF } from './userCF'
import { buildCollaborativeSignal } from './cfBlend'

/**
 * 地点推荐算法
 *
 * 综合打分（协同过滤 + 内容特征）：
 * 协同过滤 30% + 兴趣匹配 25% + 口碑评分 15% + 评价热度 10% + 探索价值 10% + 距离 10%
 *
 * 协同过滤这一项由两路信号混合（配比见 cfBlend.js 的 CF_WEIGHTS）：
 * - UserCF（60%）：邻域法。在共同评价过的地点上算访客相似度，取 Top-K 邻居，
 *   用邻居评分的相似度加权平均预测当前访客的评分。见 userCF.js
 * - 低秩偏好（40%）：模型法。把评分矩阵分解为 k 维隐向量再重建。见 lowRankModel.js
 *   两者都度量「相似的人怎么评价」，一路靠邻居、一路靠隐因子，互补覆盖。
 *   任一路不可用时，另一路独占该项权重；两路都不可用时整项剔除，
 *   其余权重按比例归一化（冷启动兜底）。
 *
 * 其余内容特征：
 * - 兴趣画像：已打卡地点的类别权重 2，给出 4 星以上评价地点的类别权重 1
 * - 口碑：地点平均星级 / 5，无评价时给中性分 0.5
 * - 热度：评价条数相对最大值归一化
 * - 探索价值：尚未打卡过的地点得满分，已打卡得 0
 * - 距离：拿到定位时按 1/(1+km/10) 衰减，无定位时给中性分 0.5
 */

// 各项权重，供 UI 展示与调参共用
export const RECO_WEIGHTS = {
  cf: 0.3,
  interest: 0.25,
  rating: 0.15,
  hot: 0.1,
  explore: 0.1,
  distance: 0.1
}

export const recommendPlaces = ({
  locations = [],
  checkins = [],
  reviews = [],
  userLocation = null,
  currentRoleKey = 'member',
  roleNameOf = (key) => key,
  latentModel = null,
  userCFModel = null,
  limit = 4
} = {}) => {
  if (!locations.length) return []

  const checkedIds = new Set(checkins.map(c => c.locationId))

  // 1. 构建兴趣画像
  const interest = {}
  checkins.forEach(c => {
    const loc = locations.find(l => l.id === c.locationId)
    if (loc) interest[loc.category] = (interest[loc.category] || 0) + 2
  })
  reviews
    .filter(r => r.rating >= 4)
    .forEach(r => {
      const loc = locations.find(l => l.id === r.locationId)
      if (loc) interest[loc.category] = (interest[loc.category] || 0) + 1
    })
  const maxInterest = Math.max(1, ...Object.values(interest))

  // 2. 汇总每个地点的评价统计
  const statsMap = {}
  reviews.forEach(r => {
    if (!statsMap[r.locationId]) statsMap[r.locationId] = { count: 0, sum: 0 }
    statsMap[r.locationId].count += 1
    statsMap[r.locationId].sum += r.rating
  })
  const maxReviewCount = Math.max(1, ...Object.values(statsMap).map(s => s.count))

  // 3. 协同过滤：UserCF 邻居预测 + 低秩隐因子预测
  const userCF =
    userCFModel ||
    fitUserCF({ locations, reviews, checkins, currentRoleKey, roleNameOf })
  const latent =
    latentModel ||
    fitLowRankPreference({ locations, reviews, checkins, currentRoleKey, roleNameOf })

  const cf = buildCollaborativeSignal({
    userCF,
    latent,
    itemIds: locations.map(loc => loc.id)
  })

  // 4. 逐个打分
  const scored = locations.map(loc => {
    const st = statsMap[loc.id] || { count: 0, sum: 0 }
    const avg = st.count ? st.sum / st.count : 0

    const interestScore = (interest[loc.category] || 0) / maxInterest
    const ratingScore = st.count ? avg / 5 : 0.5
    const hotScore = st.count / maxReviewCount
    const exploreScore = checkedIds.has(loc.id) ? 0 : 1
    const cfScore = cf.scoreOf(loc.id)

    let distanceKm = null
    let distanceScore = 0.5
    if (userLocation) {
      distanceKm = haversineKm(
        userLocation.lat,
        userLocation.lng,
        loc.lat,
        loc.lng
      )
      distanceScore = 1 / (1 + distanceKm / 10)
    }

    // 各项按可用性加权后归一化：协同过滤失效时其余权重自动放大
    const parts = [
      { weight: RECO_WEIGHTS.cf, score: cfScore },
      { weight: RECO_WEIGHTS.interest, score: interestScore },
      { weight: RECO_WEIGHTS.rating, score: ratingScore },
      { weight: RECO_WEIGHTS.hot, score: hotScore },
      { weight: RECO_WEIGHTS.explore, score: exploreScore },
      { weight: RECO_WEIGHTS.distance, score: distanceScore }
    ].filter(part => part.score != null)

    const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0)
    const score = parts.reduce((sum, part) => sum + part.score * part.weight, 0) / totalWeight

    // 5. 可解释的推荐理由（协同信号优先展示）
    const reasons = []
    const cfInfo = cf.signals.userCF ? userCF.explain(loc.id) : null

    if (cfInfo && cfInfo.supporters.length) {
      const top = cfInfo.supporters[0]
      reasons.push(`相似访客「${top.name}」打了 ${top.rating} 分`)
    } else {
      const latentInfo = cf.signals.latent ? latent.explain(loc.id) : null
      if (latentInfo && latentInfo.predicted >= 4.2) {
        if (latentInfo.neighbor) {
          reasons.push(`${latentInfo.neighbor.name}也打了 ${latentInfo.neighbor.rating} 分`)
        } else {
          reasons.push(`低秩模型预测 ${latentInfo.predicted.toFixed(1)} 分`)
        }
      }
    }

    if (interest[loc.category] > 0) {
      reasons.push(`你关注过${loc.category}类地点`)
    }
    if (st.count && avg >= 4.5) {
      reasons.push(`评分 ${avg.toFixed(1)} 分`)
    }
    if (st.count >= 2) {
      reasons.push(`${st.count} 条评价`)
    }
    if (distanceKm !== null && distanceKm <= 10) {
      const text =
        distanceKm < 1
          ? Math.round(distanceKm * 1000) + ' m'
          : distanceKm.toFixed(1) + ' km'
      reasons.push(`距你 ${text}`)
    }
    if (!checkedIds.has(loc.id)) {
      reasons.push('还没去过')
    }
    if (!reasons.length) {
      reasons.push('综合匹配度较高')
    }

    return {
      location: loc,
      score: Math.round(score * 100),
      reasons: reasons.slice(0, 2),
      distanceKm,
      avg,
      reviewCount: st.count
    }
  })

  return {
    items: scored.sort((a, b) => b.score - a.score).slice(0, limit),
    // 向 UI 汇报每一路信号是否真的参与了打分，避免文案与实际算分不一致
    signals: cf.signals
  }
}
