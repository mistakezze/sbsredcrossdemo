<template>
  <div class="home">
    <!-- 首页英雄区 -->
    <section class="hero">
      <!-- 背景红十字光芒 -->
      <div class="hero-glow-bg">
        <div class="hero-cross">
          <span class="cross-arm horizontal"></span>
          <span class="cross-arm vertical"></span>
        </div>
        <div class="hero-rays"></div>
      </div>

      <!-- 浮动粒子 -->
      <div class="particles">
        <span v-for="i in 12" :key="i" class="particle" :style="{
          '--delay': (i * 0.3) + 's',
          '--x': (10 + Math.random() * 80) + '%',
          '--duration': (6 + Math.random() * 5) + 's',
          '--size': (8 + Math.random() * 10) + 'px'
        }"></span>
      </div>

      <div class="hero-content">
        <div class="hero-badge">上海 · 红十字发源地</div>
        <h1 class="hero-title">
          <span class="title-main">上海红十字</span>
          <span class="hero-subtitle">地点游览</span>
        </h1>
        <p class="hero-description">
          从1904年上海万国红十字会成立至今，上海已成为中国红十字运动的发源地和核心基地。
          跟随先驱人物的足迹，探访承载人道精神的8个标志性地点，开启您的上海红十字文化之旅。
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ figures.length }}</div>
            <div class="stat-label">杰出人物</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ locations.length }}</div>
            <div class="stat-label">文化地点</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">{{ checkinCount }}</div>
            <div class="stat-label">我的打卡</div>
          </div>
        </div>
        <div class="hero-actions">
          <a href="#figures" class="btn btn-primary">
            <span>了解人物</span>
            <span class="btn-arrow">→</span>
          </a>
          <a href="#locations" class="btn btn-secondary">
            <span>浏览地点</span>
            <span class="btn-arrow">→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- 人物区 -->
    <section id="figures" class="section">
      <div class="section-header">
        <div class="section-tag">杰出人物</div>
        <h2 class="section-title">
          <span class="title-text">红十字人物</span>
        </h2>
        <p class="section-subtitle">那些以博爱精神改变世界的人们</p>
      </div>

      <div class="figures-grid">
        <div v-for="figure in figures" :key="figure.id" class="figure-card" :style="{ '--accent-color': figure.color }">
          <div class="figure-portrait">
            <div class="portrait-glow"></div>
            <div class="portrait-icon">
              <span class="portrait-h"></span>
              <span class="portrait-v"></span>
            </div>
            <div class="portrait-ring"></div>
          </div>
          <div class="figure-content">
            <div class="figure-meta">
              <span class="figure-years">{{ figure.years }}</span>
            </div>
            <h3 class="figure-name">{{ figure.name }}</h3>
            <p class="figure-en">{{ figure.enName }}</p>
            <p class="figure-title-line">{{ figure.title }}</p>
            <p class="figure-desc">{{ figure.description }}</p>
            <div class="figure-achievement">
              🏆 {{ figure.achievement }}
            </div>
            <blockquote class="figure-quote">「{{ figure.quote }}」</blockquote>
          </div>
        </div>
      </div>
    </section>

    <!-- 地点区 -->
    <section id="locations" class="section section-alt">
      <div class="section-header">
        <div class="section-tag">文化地标</div>
        <h2 class="section-title">
          <span class="title-text">红十字地点</span>
        </h2>
        <p class="section-subtitle">承载人道精神的标志性建筑与场所</p>
      </div>

      <div class="locations-grid">
        <div v-for="loc in locations" :key="loc.id" class="location-card" :style="{ '--accent-color': loc.color }">
          <div class="location-image" :class="{ 'has-image': loc.image }">
            <img v-if="loc.image" :src="loc.image" :alt="loc.name" />
            <div v-else class="image-placeholder">
              <div class="placeholder-cross">
                <span class="ph-h"></span>
                <span class="ph-v"></span>
              </div>
              <span class="placeholder-text">图片预留位置</span>
            </div>
            <div class="shine-overlay"></div>
            <div class="location-category">{{ loc.category }}</div>
            <div v-if="hasCheckedIn(loc.id)" class="location-checked">
              <span class="check-icon">✓</span>
              <span>已打卡</span>
            </div>
          </div>
          <div class="location-body">
            <h3 class="location-name">{{ loc.name }}</h3>
            <div class="location-place">📍 {{ loc.location }}</div>
            <p class="location-desc">{{ loc.description }}</p>
            <div class="location-highlights">
              <span v-for="(h, i) in loc.highlights.slice(0, 2)" :key="i" class="highlight-tag">{{ h }}</span>
              <span v-if="loc.highlights.length > 2" class="highlight-tag more">+{{ loc.highlights.length - 2 }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useFigureStore } from '../stores/figureStore'
import { useLocationStore } from '../stores/locationStore'
import { useCheckinStore } from '../stores/checkinStore'

const { figures } = useFigureStore()
const { locations } = useLocationStore()
const { hasCheckedIn, checkinCount } = useCheckinStore()
</script>

<style scoped>
.home { display: flex; flex-direction: column; gap: 0; }

/* ==============================
   英雄区 & 红十字光芒特效
   ============================== */
.hero {
  position: relative;
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 50%, #ffffff 100%);
  padding: 80px 48px 100px;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 48px;
}

.hero-glow-bg {
  position: absolute;
  top: 50%;
  right: -80px;
  transform: translateY(-50%);
  width: 600px;
  height: 600px;
  pointer-events: none;
}

.hero-cross {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 240px;
  height: 240px;
  animation: slowRotate 30s linear infinite;
}

.cross-arm {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(211, 47, 47, 0.25), transparent);
  border-radius: 4px;
}

.cross-arm.horizontal {
  top: 50%;
  left: 0;
  width: 100%;
  height: 80px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, transparent, rgba(211, 47, 47, 0.3), transparent);
}

.cross-arm.vertical {
  left: 50%;
  top: 0;
  width: 80px;
  height: 100%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, transparent, rgba(211, 47, 47, 0.3), transparent);
}

@keyframes slowRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.hero-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(211, 47, 47, 0.08) 15deg,
    transparent 30deg,
    transparent 90deg,
    rgba(211, 47, 47, 0.08) 105deg,
    transparent 120deg,
    transparent 180deg,
    rgba(211, 47, 47, 0.08) 195deg,
    transparent 210deg,
    transparent 270deg,
    rgba(211, 47, 47, 0.08) 285deg,
    transparent 300deg,
    transparent 360deg
  );
  animation: raysRotate 25s linear infinite;
  filter: blur(3px);
}

@keyframes raysRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 浮动粒子 */
.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 100%;
  left: var(--x);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.6), rgba(211, 47, 47, 0.1));
  animation: particleFloat var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  box-shadow: 0 0 10px rgba(211, 47, 47, 0.3);
}

@keyframes particleFloat {
  0% {
    top: 100%;
    opacity: 0;
    transform: translateX(0) scale(0.5);
  }
  10% {
    opacity: 1;
    transform: translateX(-10px) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateX(20px) scale(0.9);
  }
  90% {
    opacity: 0.6;
    transform: translateX(-15px) scale(0.7);
  }
  100% {
    top: -10%;
    opacity: 0;
    transform: translateX(5px) scale(0.3);
  }
}

.hero-content { position: relative; z-index: 2; max-width: 680px; }

.hero-badge {
  display: inline-block;
  padding: 10px 24px;
  background: white;
  border: 2px solid #d32f2f;
  color: #d32f2f;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 28px;
  box-shadow: 0 4px 16px rgba(211, 47, 47, 0.15);
  animation: badgeFadeIn 1s ease-out;
}

@keyframes badgeFadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-title {
  font-size: 52px;
  line-height: 1.2;
  margin: 0 0 24px 0;
  color: #1a2332;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 8px;
  word-break: break-word;
  overflow-wrap: break-word;
}

.title-main {
  background: linear-gradient(135deg, #1a2332, #d32f2f, #1a2332);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 6s ease-in-out infinite;
}

@keyframes titleShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-subtitle {
  color: #d32f2f;
  font-size: 42px;
  position: relative;
  display: inline-block;
}

.hero-subtitle::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #d32f2f, transparent);
  border-radius: 2px;
  animation: lineGrow 2s ease-out;
}

@keyframes lineGrow {
  from { width: 0; opacity: 0; }
  to { width: 100%; opacity: 1; }
}

.hero-description {
  font-size: 17px;
  color: #5a6478;
  line-height: 1.9;
  margin: 0 0 36px 0;
  animation: fadeInUp 1s ease-out 0.3s backwards;
  word-break: break-word;
  overflow-wrap: break-word;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(211, 47, 47, 0.1);
  margin-bottom: 28px;
  animation: fadeInUp 1s ease-out 0.5s backwards;
  position: relative;
  overflow: hidden;
}

.hero-stats::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #d32f2f, transparent);
  animation: statsSweep 3s ease-in-out infinite;
}

@keyframes statsSweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: #d32f2f;
  position: relative;
  text-shadow: 0 2px 8px rgba(211, 47, 47, 0.2);
}

.stat-number::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: -8px;
  width: 8px;
  height: 8px;
  background: #ff7043;
  border-radius: 50%;
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

.stat-label {
  font-size: 13px;
  color: #7a8599;
  margin-top: 6px;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, #e5e9ef, transparent);
}

.hero-actions {
  display: flex;
  gap: 16px;
  animation: fadeInUp 1s ease-out 0.7s backwards;
}

.btn {
  padding: 16px 36px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.btn:hover .btn-arrow {
  transform: translateX(5px);
}

.btn-primary {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.35);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btnShine 3s ease-in-out infinite;
}

@keyframes btnShine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.5);
}

.btn-secondary {
  background: white;
  color: #d32f2f;
  border: 2px solid #d32f2f;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #d32f2f;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.35);
}

/* ==============================
   通用区块标题
   ============================== */
.section { padding: 70px 48px; margin-bottom: 40px; }

.section-alt {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
}

.section-alt::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #d32f2f, transparent);
  opacity: 0.5;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.section-tag {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(211, 47, 47, 0.1);
  color: #d32f2f;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  margin-bottom: 18px;
  position: relative;
}

.section-tag::before,
.section-tag::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(211, 47, 47, 0.3), transparent);
}

.section-tag::before { right: calc(100% + 16px); }
.section-tag::after { left: calc(100% + 16px); }

.section-title {
  font-size: 44px;
  color: #1a2332;
  margin: 0 0 14px 0;
  font-weight: 800;
  word-break: break-word;
  overflow-wrap: break-word;
}

.title-text {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #1a2332 0%, #d32f2f 50%, #1a2332 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleShine 5s ease-in-out infinite;
}

.section-subtitle {
  font-size: 16px;
  color: #7a8599;
  margin: 0;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
}

/* ==============================
   人物卡片 - 悬浮 & 发光特效
   ============================== */
.figures-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

.figure-card {
  background: white;
  border-radius: 22px;
  padding: 32px;
  display: flex;
  gap: 24px;
  box-shadow: 0 4px 24px rgba(26, 35, 50, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 5px solid var(--accent-color);
  position: relative;
  overflow: hidden;
}

.figure-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle at top right, var(--accent-color), transparent 70%);
  opacity: 0.06;
  transition: opacity 0.4s ease;
}

.figure-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.figure-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(26, 35, 50, 0.15), 0 0 0 1px var(--accent-color);
}

.figure-card:hover::after {
  opacity: 1;
}

.figure-portrait {
  flex-shrink: 0;
  width: 110px;
  height: 110px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--accent-color), #ff8a80);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.portrait-glow {
  position: absolute;
  inset: -30px;
  background: radial-gradient(circle, var(--accent-color), transparent 60%);
  opacity: 0.3;
  animation: portraitGlow 3s ease-in-out infinite;
}

@keyframes portraitGlow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.1); }
}

.portrait-icon {
  position: relative;
  width: 60px;
  height: 60px;
  z-index: 2;
  animation: portraitFloat 4s ease-in-out infinite;
}

@keyframes portraitFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.portrait-h, .portrait-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: white;
  border-radius: 3px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

.portrait-h {
  width: 48px;
  height: 12px;
  transform: translate(-50%, -50%);
}

.portrait-v {
  width: 12px;
  height: 48px;
  transform: translate(-50%, -50%);
}

.portrait-ring {
  position: absolute;
  inset: -4px;
  border: 2px dashed rgba(255, 255, 255, 0.4);
  border-radius: 22px;
  animation: ringRotate 15s linear infinite;
  pointer-events: none;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.figure-content { flex: 1; position: relative; z-index: 2; }

.figure-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.figure-years {
  background: rgba(26, 35, 50, 0.06);
  color: #5a6478;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.figure-name {
  font-size: 22px;
  color: #1a2332;
  margin: 0 0 4px 0;
  font-weight: 700;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
}

.figure-card:hover .figure-name {
  color: var(--accent-color);
}

.figure-en {
  font-size: 12px;
  color: #a0aec0;
  margin: 0 0 10px 0;
  font-style: italic;
}

.figure-title-line {
  font-size: 13px;
  color: var(--accent-color);
  margin: 0 0 12px 0;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: break-word;
}

.figure-desc {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.75;
  margin: 0 0 14px 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.figure-achievement {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: #8a6d00;
  font-weight: 600;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
}

.figure-achievement::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: achievementSweep 4s ease-in-out infinite;
}

@keyframes achievementSweep {
  0% { left: -100%; }
  50%, 100% { left: 150%; }
}

.figure-quote {
  margin: 0;
  font-size: 13px;
  color: var(--accent-color);
  font-style: italic;
  padding-left: 12px;
  border-left: 3px solid var(--accent-color);
  line-height: 1.7;
  opacity: 0.85;
  transition: opacity 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
}

.figure-card:hover .figure-quote {
  opacity: 1;
}

/* ==============================
   地点卡片 - 图片光泽与悬浮特效
   ============================== */
.locations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.location-card {
  background: white;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(26, 35, 50, 0.06);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.location-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 22px;
  padding: 2px;
  background: linear-gradient(135deg, transparent, var(--accent-color), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.location-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 24px 60px rgba(26, 35, 50, 0.15);
}

.location-card:hover::after {
  opacity: 0.6;
}

.location-image {
  position: relative;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
  overflow: hidden;
}

.location-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 60%);
  z-index: 1;
  pointer-events: none;
}

.location-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.location-card:hover .location-image img {
  transform: scale(1.08);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
}

.placeholder-cross {
  width: 80px;
  height: 80px;
  position: relative;
  animation: placeholderPulse 2.5s ease-in-out infinite;
}

.ph-h, .ph-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: rgba(211, 47, 47, 0.35);
  border-radius: 4px;
}

.ph-h {
  width: 60px;
  height: 16px;
  transform: translate(-50%, -50%);
}

.ph-v {
  width: 16px;
  height: 60px;
  transform: translate(-50%, -50%);
}

@keyframes placeholderPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
}

.placeholder-text {
  font-size: 14px;
  color: #a0aec0;
  font-weight: 500;
}

.shine-overlay {
  position: absolute;
  top: -50%;
  left: -100%;
  width: 50%;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: rotate(25deg);
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.location-card:hover .shine-overlay {
  animation: shineSweep 1.5s ease-out;
  opacity: 1;
}

@keyframes shineSweep {
  0% { left: -100%; opacity: 0; }
  20% { opacity: 1; }
  100% { left: 200%; opacity: 0; }
}

.location-category {
  position: absolute;
  top: 16px;
  left: 16px;
  background: linear-gradient(135deg, var(--accent-color), #b71c1c);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 3;
  letter-spacing: 0.5px;
}

.location-checked {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: checkedPulse 2s ease-in-out infinite;
}

@keyframes checkedPulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4); }
  50% { box-shadow: 0 4px 20px rgba(76, 175, 80, 0.7); }
}

.check-icon {
  font-size: 14px;
  animation: checkBounce 1s ease-out;
}

@keyframes checkBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

.location-body {
  padding: 26px 24px 24px;
  position: relative;
}

.location-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(211, 47, 47, 0.2), transparent);
}

.location-name {
  font-size: 18px;
  color: #1a2332;
  margin: 0 0 10px 0;
  font-weight: 700;
  line-height: 1.4;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
}

.location-card:hover .location-name {
  color: var(--accent-color);
}

.location-place {
  font-size: 13px;
  color: #7a8599;
  margin-bottom: 14px;
  word-break: break-word;
  overflow-wrap: break-word;
}

.location-desc {
  font-size: 13px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0 0 18px 0;
  word-break: break-word;
  overflow-wrap: break-word;
}

.location-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.highlight-tag {
  font-size: 12px;
  padding: 6px 12px;
  background: rgba(211, 47, 47, 0.08);
  color: var(--accent-color);
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.location-card:hover .highlight-tag {
  background: rgba(211, 47, 47, 0.15);
  transform: translateY(-1px);
}

.highlight-tag.more {
  background: #f0f2f5;
  color: #7a8599;
}

/* ==============================
   响应式
   ============================== */
@media (max-width: 1024px) {
  .figures-grid { grid-template-columns: 1fr; }
  .locations-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-title { font-size: 36px; }
  .hero-subtitle { font-size: 32px; }
  .section-title { font-size: 32px; }
  .hero-glow-bg { width: 400px; height: 400px; right: -60px; }
}

@media (max-width: 640px) {
  .hero { padding: 40px 24px 60px; border-radius: 16px; }
  .hero-content { max-width: 100%; }
  .hero-title { font-size: 30px; line-height: 1.25; }
  .hero-subtitle { font-size: 24px; }
  .hero-badge { font-size: 12px; padding: 8px 18px; letter-spacing: 1.5px; margin-bottom: 20px; }
  .hero-stats { padding: 18px 20px; gap: 14px; margin-bottom: 24px; }
  .stat-number { font-size: 28px; }
  .stat-label { font-size: 12px; }
  .stat-divider { height: 32px; }
  .hero-description { font-size: 15px; line-height: 1.8; margin-bottom: 28px; }
  .hero-actions { flex-direction: column; gap: 12px; }
  .btn { width: 100%; justify-content: center; padding: 14px 24px; font-size: 14px; }
  .section { padding: 40px 20px; margin-bottom: 24px; }
  .section-header { margin-bottom: 32px; }
  .section-title { font-size: 28px; line-height: 1.3; }
  .section-subtitle { font-size: 14px; }
  .section-tag::before, .section-tag::after { display: none; }
  .figure-card {
    flex-direction: column;
    padding: 24px 20px;
    align-items: center;
    text-align: center;
    gap: 18px;
  }
  .figure-meta { justify-content: center; }
  .figure-portrait { width: 90px; height: 90px; }
  .figure-name { font-size: 20px; }
  .figure-desc { font-size: 13.5px; }
  .locations-grid { grid-template-columns: 1fr; }
  .hero-glow-bg { display: none; }
  .particle:nth-child(n+7) { display: none; }
  /* location card mobile text */
  .location-body { padding: 20px 18px; }
  .location-name { font-size: 17px; }
  .location-desc { font-size: 13px; line-height: 1.7; }
}

@media (max-width: 375px) {
  .hero { padding: 32px 16px 48px; }
  .hero-title { font-size: 26px; }
  .hero-subtitle { font-size: 20px; }
  .hero-badge { font-size: 11px; padding: 7px 16px; }
  .hero-description { font-size: 14px; }
  .hero-stats { padding: 16px; gap: 10px; }
  .stat-number { font-size: 24px; }
  .stat-divider { height: 28px; }
  .section { padding: 32px 14px; }
  .section-title { font-size: 24px; }
  .section-subtitle { font-size: 13px; }
  .figure-card { padding: 20px 16px; gap: 14px; }
  .figure-portrait { width: 76px; height: 76px; }
  .figure-name { font-size: 18px; }
  .figure-desc { font-size: 13px; line-height: 1.7; }
  .location-body { padding: 18px 16px; }
  .location-name { font-size: 16px; }
  .location-desc { font-size: 12.5px; }
}
</style>
