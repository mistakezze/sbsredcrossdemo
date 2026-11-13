/**
 * 协同过滤信号的融合工具
 *
 * 地点推荐与活动推荐共用同一套融合口径：
 * UserCF（邻域法）为主，低秩隐因子模型为辅，两者预测值各自在候选集内做极值归一化，
 * 再按 CF_WEIGHTS 加权。任一路不可用时由另一路独占，两路都不可用时整项退出。
 */

export const CF_WEIGHTS = {
  usercf: 0.6,
  latent: 0.4
}

/**
 * 预测值在候选集内做极值归一化，转成 0-1 的相对偏好
 * @param {Map<number, number>} predMap 候选 id → 预测评分
 * @param {number} minSpread 预测极差低于该值时视为无区分度
 */
export const normalizePredictions = (predMap, minSpread = 0.15) => {
  const values = [...predMap.values()]
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const spread = max - min
  const usable = values.length > 0 && spread >= minSpread

  return {
    usable,
    scoreOf: (id) => {
      if (!usable) return null
      const value = predMap.get(id)
      // 邻居没有评价过这里 → 给中性分，不凭空抬高或压低
      return value == null ? 0.5 : (value - min) / spread
    }
  }
}

/**
 * 构建混合协同过滤打分器
 * @param {object} options
 * @param {{ predict: Function }} options.userCF UserCF 模型
 * @param {{ predict: Function }} options.latent 低秩模型
 * @param {number[]} options.itemIds 候选 id 列表
 */
export const buildCollaborativeSignal = ({ userCF, latent, itemIds = [], minSpread = 0.15 }) => {
  const collect = (model) => {
    const map = new Map()
    itemIds.forEach((id) => {
      const value = model.predict(id)
      if (value != null) map.set(id, value)
    })
    return map
  }

  const userCFNorm = normalizePredictions(collect(userCF), minSpread)
  const latentNorm = normalizePredictions(collect(latent), minSpread)

  const scoreOf = (id) => {
    const usercfScore = userCFNorm.scoreOf(id)
    const latentScore = latentNorm.scoreOf(id)
    if (usercfScore != null && latentScore != null) {
      return usercfScore * CF_WEIGHTS.usercf + latentScore * CF_WEIGHTS.latent
    }
    if (usercfScore != null) return usercfScore
    if (latentScore != null) return latentScore
    return null
  }

  return {
    scoreOf,
    signals: {
      userCF: userCFNorm.usable,
      latent: latentNorm.usable,
      cf: userCFNorm.usable || latentNorm.usable
    }
  }
}
