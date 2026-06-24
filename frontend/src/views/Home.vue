<template>
  <div class="home">

    <!-- ===================== PC 端 ===================== -->
    <template v-if="!isMobile">
      <!-- 首页英雄区 -->
      <section class="pc-hero">
        <div class="hero-glow-bg">
          <div class="hero-cross">
            <span class="cross-arm horizontal"></span>
            <span class="cross-arm vertical"></span>
          </div>
          <div class="hero-rays"></div>
        </div>

        <div class="particles">
          <span v-for="i in 12" :key="i" class="particle" :style="{
            '--delay': (i * 0.3) + 's',
            '--x': (10 + Math.random() * 80) + '%',
            '--duration': (6 + Math.random() * 5) + 's',
            '--size': (8 + Math.random() * 10) + 'px'
          }"></span>
        </div>

        <div class="pc-hero-content">
          <div class="hero-badge">上海 · 红十字发源地</div>
          <h1 class="pc-hero-title">
            <span class="title-main">上海红十字文化之旅</span>
            <span class="pc-hero-subtitle">探访人道精神地标</span>
          </h1>
          <p class="pc-hero-desc">
            从1904年上海万国红十字会成立至今，上海已成为中国红十字运动的发源地和核心基地。
            跟随先驱人物的足迹，探访承载人道精神的标志性地点，开启您的上海红十字文化之旅。
          </p>
          <div class="pc-hero-stats">
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
            <router-link to="/routes" class="btn btn-primary">
              <span>开启旅程</span>
              <span class="btn-arrow">→</span>
            </router-link>
            <router-link to="/checkins" class="btn btn-secondary">
              <span>我的打卡</span>
              <span class="btn-arrow">→</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- 人物区 -->
      <section id="pc-figures" class="pc-section">
        <div class="pc-section-header">
          <div class="section-tag">杰出人物</div>
          <h2 class="pc-section-title">红十字人物</h2>
          <p class="pc-section-subtitle">那些以博爱精神改变世界的人们</p>
        </div>

        <div class="pc-figures-carousel">
          <button
            class="carousel-arrow prev"
            :class="{ disabled: figureIndex === 0 }"
            @click="figureIndex > 0 && figureIndex--"
            aria-label="上一个"
          >
            <span>‹</span>
          </button>

          <div class="carousel-viewport">
            <transition name="slide-fade" mode="out-in">
              <div
                v-for="(figure, index) in figures"
                v-show="index === figureIndex"
                :key="figure.id"
                class="pc-figure-card large"
                :style="{ '--accent-color': figure.color }"
              >
                <div class="pc-figure-portrait large">
                  <div class="portrait-glow"></div>
                  <div class="portrait-icon">
                    <span class="portrait-h"></span>
                    <span class="portrait-v"></span>
                  </div>
                  <div class="portrait-ring"></div>
                </div>
                <div class="pc-figure-content">
                  <div class="pc-figure-meta">
                    <span class="figure-years">{{ figure.years }}</span>
                  </div>
                  <h3 class="pc-figure-name large">{{ figure.name }}</h3>
                  <p class="figure-en large">{{ figure.enName }}</p>
                  <p class="pc-figure-title-line large">{{ figure.title }}</p>
                  <p class="pc-figure-desc large">{{ figure.description }}</p>
                  <div class="pc-figure-achievement large">🏆 {{ figure.achievement }}</div>
                  <blockquote v-if="figure.quote" class="figure-quote large">「{{ figure.quote }}」</blockquote>
                </div>
              </div>
            </transition>
          </div>

          <button
            class="carousel-arrow next"
            :class="{ disabled: figureIndex === figures.length - 1 }"
            @click="figureIndex < figures.length - 1 && figureIndex++"
            aria-label="下一个"
          >
            <span>›</span>
          </button>

          <div class="carousel-dots">
            <span
              v-for="(_, i) in figures"
              :key="i"
              class="dot"
              :class="{ active: i === figureIndex }"
              @click="figureIndex = i"
            ></span>
          </div>
        </div>
      </section>

      <!-- 地点区 -->
      <section id="pc-locations" class="pc-section pc-section-alt">
        <div class="pc-section-header">
          <div class="section-tag">文化地标</div>
          <h2 class="pc-section-title">红十字地点</h2>
          <p class="pc-section-subtitle">承载人道精神的标志性建筑与场所</p>
        </div>

        <div class="pc-locations-carousel">
          <button
            class="carousel-arrow prev"
            :class="{ disabled: locationIndex === 0 }"
            @click="locationIndex > 0 && locationIndex--"
            aria-label="上一个"
          >
            <span>‹</span>
          </button>

          <div class="carousel-viewport">
            <transition name="slide-fade" mode="out-in">
              <router-link
                v-for="(loc, index) in locations"
                v-show="index === locationIndex"
                :key="loc.id"
                :to="`/routes`"
                class="pc-location-card large"
                :style="{ '--accent-color': loc.color }"
              >
                <div class="pc-location-image large" :class="{ 'has-image': loc.image }">
                  <img v-if="loc.image" :src="loc.image" :alt="loc.name" />
                  <div v-else class="image-placeholder">
                    <div class="placeholder-cross">
                      <span class="ph-h"></span>
                      <span class="ph-v"></span>
                    </div>
                    <span class="placeholder-text">图片预留位置</span>
                  </div>
                  <div class="shine-overlay"></div>
                  <div class="location-category large">{{ loc.category }}</div>
                  <div v-if="hasCheckedIn(loc.id)" class="location-checked large">
                    <span class="check-icon">✓</span>
                    <span>已打卡</span>
                  </div>
                </div>
                <div class="pc-location-body large">
                  <h3 class="pc-location-name large">{{ loc.name }}</h3>
                  <div class="location-place large">📍 {{ loc.location }}</div>
                  <p class="pc-location-desc large">{{ loc.description }}</p>
                  <div class="location-highlights large">
                    <span v-for="(h, i) in loc.highlights.slice(0, 3)" :key="i" class="highlight-tag">{{ h }}</span>
                    <span v-if="loc.highlights.length > 3" class="highlight-tag more">+{{ loc.highlights.length - 3 }}</span>
                  </div>
                </div>
              </router-link>
            </transition>
          </div>

          <button
            class="carousel-arrow next"
            :class="{ disabled: locationIndex === locations.length - 1 }"
            @click="locationIndex < locations.length - 1 && locationIndex++"
            aria-label="下一个"
          >
            <span>›</span>
          </button>

          <div class="carousel-dots">
            <span
              v-for="(_, i) in locations"
              :key="i"
              class="dot"
              :class="{ active: i === locationIndex }"
              @click="locationIndex = i"
            ></span>
          </div>
        </div>
      </section>
    </template>

    <!-- ===================== 移动端 ===================== -->
    <template v-else>
      <!-- 移动端 Hero -->
      <section class="mobile-hero">
        <div class="mobile-hero-cross">
          <span class="m-cross-h"></span>
          <span class="m-cross-v"></span>
        </div>

        <div class="mobile-hero-content">
          <div class="mobile-hero-badge">🚩 上海 · 红十字发源地</div>
          <h1 class="mobile-hero-title">红十字文化之旅</h1>
          <p class="mobile-hero-desc">
            探访人道精神地标，跟随先驱的足迹
          </p>
        </div>

        <div class="mobile-hero-stats">
          <div class="mobile-stat">
            <span class="mobile-stat-num">{{ figures.length }}</span>
            <span class="mobile-stat-label">人物</span>
          </div>
          <div class="mobile-stat-sep"></div>
          <div class="mobile-stat">
            <span class="mobile-stat-num">{{ locations.length }}</span>
            <span class="mobile-stat-label">地点</span>
          </div>
          <div class="mobile-stat-sep"></div>
          <div class="mobile-stat">
            <span class="mobile-stat-num">{{ checkinCount }}</span>
            <span class="mobile-stat-label">打卡</span>
          </div>
        </div>

        <div class="mobile-hero-actions">
          <router-link to="/routes" class="mobile-btn-primary">🗺️ 开启旅程</router-link>
          <router-link to="/checkins" class="mobile-btn-secondary">📋 我的打卡</router-link>
        </div>
      </section>

      <!-- 移动端 人物区（横滑卡片） -->
      <section class="mobile-section">
        <div class="mobile-section-header">
          <div class="mobile-section-title-wrap">
            <span class="mobile-section-emoji">👥</span>
            <h2 class="mobile-section-title">杰出人物</h2>
          </div>
          <span class="mobile-section-count">{{ figures.length }} 位</span>
        </div>

        <div class="mobile-figure-scroll">
          <div class="mobile-figure-track">
            <div
              v-for="figure in figures"
              :key="figure.id"
              class="mobile-figure-card-snap"
              :style="{ '--accent-color': figure.color }"
            >
              <div class="mobile-figure-avatar large">
                <span class="mobile-avatar-h"></span>
                <span class="mobile-avatar-v"></span>
              </div>
              <div class="mobile-figure-info">
                <div class="mobile-figure-head">
                  <span class="mobile-figure-name">{{ figure.name }}</span>
                  <span class="mobile-figure-years">{{ figure.years }}</span>
                </div>
                <p class="mobile-figure-title">{{ figure.title }}</p>
                <p class="mobile-figure-desc">{{ figure.description }}</p>
                <div class="mobile-figure-tags">
                  <span class="mobile-tag achievement">🏆 {{ figure.achievement }}</span>
                </div>
                <blockquote v-if="figure.quote" class="mobile-figure-quote">「{{ figure.quote }}」</blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 移动端 地点区（横滑卡片） -->
      <section class="mobile-section">
        <div class="mobile-section-header">
          <div class="mobile-section-title-wrap">
            <span class="mobile-section-emoji">📍</span>
            <h2 class="mobile-section-title">文化地标</h2>
          </div>
          <span class="mobile-section-count">{{ locations.length }} 处</span>
        </div>

        <div class="mobile-location-scroll">
          <div class="mobile-location-track">
            <router-link
              v-for="loc in locations"
              :key="loc.id"
              :to="`/routes`"
              class="mobile-location-card-snap"
              :style="{ '--accent-color': loc.color }"
            >
              <div class="mobile-location-image">
                <img v-if="loc.image" :src="loc.image" :alt="loc.name" />
                <template v-else>
                  <span class="mobile-loc-icon-h"></span>
                  <span class="mobile-loc-icon-v"></span>
                </template>
                <div class="mobile-location-cat">{{ loc.category }}</div>
                <div v-if="hasCheckedIn(loc.id)" class="mobile-location-checked">✓</div>
              </div>
              <div class="mobile-location-info">
                <h3 class="mobile-location-name">{{ loc.name }}</h3>
                <div class="mobile-location-place">📍 {{ loc.location }}</div>
                <p class="mobile-location-desc">{{ loc.description }}</p>
                <div class="mobile-location-tags">
                  <span v-for="(h, i) in loc.highlights.slice(0, 3)" :key="i" class="mobile-tag">{{ h }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </section>

      <!-- 移动端底部引导 -->
      <section class="mobile-section mobile-footer-guide">
        <div class="mobile-guide-card">
          <div class="mobile-guide-emoji">🌟</div>
          <h3 class="mobile-guide-title">开始您的探索</h3>
          <p class="mobile-guide-desc">浏览路线推荐，记录您的打卡足迹</p>
          <router-link to="/routes" class="mobile-btn-primary full-width">🚀 立即开始</router-link>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFigureStore } from '../stores/figureStore'
import { useLocationStore } from '../stores/locationStore'
import { useCheckinStore } from '../stores/checkinStore'
import { useViewport } from '../composables/useViewport'

const { figures } = useFigureStore()
const { locations } = useLocationStore()
const { hasCheckedIn, checkinCount } = useCheckinStore()
const { isMobile } = useViewport()

const figureIndex = ref(0)
const locationIndex = ref(0)
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ==========================================================
   ==============           PC 样式          ================
   ========================================================== */

/* Hero */
.pc-hero {
  position: relative;
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 50%, #ffffff 100%);
  padding: 80px 48px 100px;
  border-radius: 24px;
  overflow: hidden;
}

.pc-hero-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
}

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
}

.pc-hero-title {
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1.15;
  margin: 0 0 24px 0;
  color: #1a2332;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 8px;
  word-break: break-word;
}

.title-main {
  background: linear-gradient(135deg, #1a2332, #d32f2f, #1a2332);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pc-hero-subtitle {
  color: #d32f2f;
  font-size: clamp(28px, 3.5vw, 42px);
  position: relative;
  display: inline-block;
}

.pc-hero-desc {
  font-size: 17px;
  color: #5a6478;
  line-height: 1.9;
  margin: 0 0 36px 0;
  word-break: break-word;
}

.pc-hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 24px 32px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(211, 47, 47, 0.1);
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
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
}

.btn {
  padding: 16px 36px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-arrow { transition: transform 0.3s ease; }
.btn:hover .btn-arrow { transform: translateX(5px); }

.btn-primary {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  box-shadow: 0 4px 20px rgba(211, 47, 47, 0.35);
}
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(211, 47, 47, 0.5);
}

.btn-secondary {
  background: white;
  color: #d32f2f;
  border: 2px solid #d32f2f;
}
.btn-secondary:hover {
  background: #d32f2f;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(211, 47, 47, 0.35);
}

/* PC Hero 特效 */
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

@keyframes slowRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes raysRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

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
  animation: particleFloat 7s ease-in-out infinite;
  animation-delay: var(--delay);
  box-shadow: 0 0 10px rgba(211, 47, 47, 0.3);
}

@keyframes particleFloat {
  0% { top: 100%; opacity: 0; transform: scale(0.5); }
  10% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.9); }
  90% { opacity: 0.6; transform: scale(0.7); }
  100% { top: -10%; opacity: 0; transform: scale(0.3); }
}

/* PC Section */
.pc-section {
  padding: 70px 48px;
}

.pc-section-alt {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
}

.pc-section-header {
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
}

.pc-section-title {
  font-size: clamp(32px, 4vw, 48px);
  color: #1a2332;
  margin: 0 0 14px 0;
  font-weight: 800;
}

.pc-section-subtitle {
  font-size: 16px;
  color: #7a8599;
  margin: 0;
  word-break: break-word;
  line-height: 1.6;
}

/* ===== PC 轮播通用样式 ===== */
.pc-figures-carousel,
.pc-locations-carousel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60px;
}

.carousel-viewport {
  flex: 1;
  display: flex;
  justify-content: center;
  min-height: 300px;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e9ef;
  color: #1a2332;
  font-size: 28px;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(26, 35, 50, 0.1);
  transition: all 0.3s ease;
  z-index: 10;
  padding: 0;
  line-height: 1;
}

.carousel-arrow:hover:not(.disabled) {
  transform: translateY(-50%) scale(1.12);
  border-color: #d32f2f;
  color: #d32f2f;
  box-shadow: 0 6px 24px rgba(211, 47, 47, 0.25);
}

.carousel-arrow:active:not(.disabled) {
  transform: translateY(-50%) scale(0.95);
}

.carousel-arrow.prev {
  left: 0;
}

.carousel-arrow.next {
  right: 0;
}

.carousel-arrow.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.carousel-dots {
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d0d5dd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot:hover {
  background: #d32f2f;
  transform: scale(1.2);
}

.dot.active {
  background: #d32f2f;
  width: 28px;
  border-radius: 5px;
}

/* 轮播过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

/* ===== PC 人物卡片 - 轮播大卡片 ===== */
.pc-figure-card.large {
  background: white;
  border-radius: 24px;
  padding: 40px;
  display: flex;
  gap: 36px;
  box-shadow: 0 8px 40px rgba(26, 35, 50, 0.1);
  border-left: 6px solid var(--accent-color);
  position: relative;
  overflow: hidden;
  max-width: 700px;
  width: 100%;
}

.pc-figure-portrait.large {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 22px;
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

.pc-figure-portrait.large .portrait-icon {
  width: 75px;
  height: 75px;
}

.pc-figure-portrait.large .portrait-h {
  width: 60px;
  height: 15px;
}

.pc-figure-portrait.large .portrait-v {
  width: 15px;
  height: 60px;
}

.portrait-h, .portrait-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: white;
  border-radius: 3px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  transform: translate(-50%, -50%);
}
.portrait-h { width: 48px; height: 12px; }
.portrait-v { width: 12px; height: 48px; }

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

.pc-figure-content { flex: 1; }

.pc-figure-meta {
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

.pc-figure-name.large {
  font-size: clamp(24px, 2.5vw, 30px);
  color: #1a2332;
  margin: 0 0 6px 0;
  font-weight: 700;
  word-break: break-word;
}

.figure-en.large {
  font-size: 14px;
  color: #a0aec0;
  margin: 0 0 14px 0;
  font-style: italic;
}

.pc-figure-title-line.large {
  font-size: 15px;
  color: var(--accent-color);
  margin: 0 0 16px 0;
  font-weight: 600;
  word-break: break-word;
}

.pc-figure-desc.large {
  font-size: 15px;
  color: #5a6478;
  line-height: 1.85;
  margin: 0 0 18px 0;
  word-break: break-word;
}

.pc-figure-achievement.large {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: #8a6d00;
  font-weight: 600;
  margin-bottom: 14px;
  word-break: break-word;
  line-height: 1.6;
}

.figure-quote.large {
  margin: 0;
  font-size: 14px;
  color: var(--accent-color);
  font-style: italic;
  padding-left: 14px;
  border-left: 4px solid var(--accent-color);
  line-height: 1.75;
  opacity: 0.85;
  word-break: break-word;
}

/* ===== PC 地点卡片 - 轮播大卡片 ===== */
.pc-location-card.large {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(26, 35, 50, 0.1);
  position: relative;
  text-decoration: none;
  display: block;
  color: inherit;
  max-width: 520px;
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pc-location-card.large:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 50px rgba(26, 35, 50, 0.18);
}

.pc-location-image.large {
  position: relative;
  aspect-ratio: 16 / 10;
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
  overflow: hidden;
}

.pc-location-image.large.has-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.pc-location-card.large:hover .pc-location-image img {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
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
.ph-h { width: 60px; height: 16px; transform: translate(-50%, -50%); }
.ph-v { width: 16px; height: 60px; transform: translate(-50%, -50%); }

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

.pc-location-card.large:hover .shine-overlay {
  animation: shineSweep 1.5s ease-out;
  opacity: 1;
}

@keyframes shineSweep {
  0% { left: -100%; opacity: 0; }
  20% { opacity: 1; }
  100% { left: 200%; opacity: 0; }
}

.location-category.large {
  position: absolute;
  top: 20px;
  left: 20px;
  background: linear-gradient(135deg, var(--accent-color), #b71c1c);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 3;
  letter-spacing: 0.5px;
}

.location-checked.large {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
}

.pc-location-body.large {
  padding: 30px 28px 28px;
  position: relative;
}

.pc-location-name.large {
  font-size: clamp(20px, 2vw, 24px);
  color: #1a2332;
  margin: 0 0 12px 0;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
  transition: color 0.3s ease;
}

.pc-location-card.large:hover .pc-location-name { color: var(--accent-color); }

.location-place.large {
  font-size: 14px;
  color: #7a8599;
  margin-bottom: 16px;
  word-break: break-word;
}

.pc-location-desc.large {
  font-size: 15px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0 0 20px 0;
  word-break: break-word;
}

.location-highlights.large {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.highlight-tag {
  font-size: 12px;
  padding: 6px 12px;
  background: rgba(211, 47, 47, 0.08);
  color: var(--accent-color);
  border-radius: 20px;
  font-weight: 600;
}

.highlight-tag.more {
  background: #f0f2f5;
  color: #7a8599;
}

/* ==========================================================
   ==============        移动端样式           ================
   ========================================================== */

/* Mobile Hero */
.mobile-hero {
  position: relative;
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 60%, #ffffff 100%);
  padding: 24px 18px 20px;
  border-radius: 20px;
  overflow: hidden;
  margin-top: 4px;
}

.mobile-hero-cross {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  opacity: 0.12;
  pointer-events: none;
}

.m-cross-h, .m-cross-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #d32f2f;
  border-radius: 3px;
}
.m-cross-h { width: 100px; height: 24px; transform: translate(-50%, -50%); }
.m-cross-v { width: 24px; height: 100px; transform: translate(-50%, -50%); }

.mobile-hero-content {
  position: relative;
  z-index: 1;
  max-width: 100%;
}

.mobile-hero-badge {
  display: inline-block;
  padding: 6px 14px;
  background: white;
  color: #d32f2f;
  border-radius: 30px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.15);
}

.mobile-hero-title {
  font-size: clamp(24px, 7vw, 32px);
  line-height: 1.2;
  margin: 0 0 8px 0;
  color: #1a2332;
  font-weight: 800;
  word-break: break-word;
  background: linear-gradient(135deg, #1a2332, #d32f2f);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mobile-hero-desc {
  font-size: clamp(13px, 3.5vw, 15px);
  color: #5a6478;
  line-height: 1.6;
  margin: 0 0 16px 0;
  word-break: break-word;
}

.mobile-hero-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 14px 12px;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(211, 47, 47, 0.1);
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}

.mobile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.mobile-stat-num {
  font-size: clamp(20px, 5.5vw, 28px);
  font-weight: 800;
  color: #d32f2f;
  line-height: 1.2;
}

.mobile-stat-label {
  font-size: 11px;
  color: #7a8599;
  margin-top: 3px;
  font-weight: 500;
}

.mobile-stat-sep {
  width: 1px;
  height: 28px;
  background: #e5e9ef;
}

.mobile-hero-actions {
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.mobile-btn-primary {
  flex: 1;
  padding: 14px 16px;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  transition: all 0.2s ease;
}

.mobile-btn-primary:active {
  transform: scale(0.97);
}

.mobile-btn-primary.full-width {
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 15px;
}

.mobile-btn-secondary {
  flex: 1;
  padding: 14px 16px;
  background: white;
  color: #d32f2f;
  border: 2px solid #d32f2f;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
}

.mobile-btn-secondary:active {
  transform: scale(0.97);
  background: #fff5f5;
}

/* Mobile Section */
.mobile-section {
  padding: 0;
}

.mobile-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 0 2px;
}

.mobile-section-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-section-emoji {
  font-size: 20px;
}

.mobile-section-title {
  font-size: clamp(18px, 5vw, 22px);
  color: #1a2332;
  margin: 0;
  font-weight: 800;
  word-break: break-word;
}

.mobile-section-count {
  font-size: 12px;
  color: #7a8599;
  font-weight: 500;
  background: #f0f2f5;
  padding: 4px 10px;
  border-radius: 20px;
}

/* ===== 移动端横滑通用 ===== */
.mobile-figure-scroll,
.mobile-location-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin: 0 -18px;
  padding: 4px 18px 20px;
}

.mobile-figure-scroll::-webkit-scrollbar,
.mobile-location-scroll::-webkit-scrollbar {
  display: none;
}

.mobile-figure-track,
.mobile-location-track {
  display: flex;
  gap: 14px;
}

.mobile-figure-card-snap,
.mobile-location-card-snap {
  flex-shrink: 0;
  width: 85%;
  scroll-snap-align: start;
}

/* ===== 移动端人物横滑卡片 ===== */
.mobile-figure-card-snap {
  background: white;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  gap: 14px;
  box-shadow: 0 2px 14px rgba(26, 35, 50, 0.07);
  border-left: 4px solid var(--accent-color);
  align-items: flex-start;
}

.mobile-figure-avatar.large {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-color), #ff8a80);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-avatar-h, .mobile-avatar-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: white;
  border-radius: 2px;
  transform: translate(-50%, -50%);
}
.mobile-avatar-h { width: 32px; height: 9px; }
.mobile-avatar-v { width: 9px; height: 32px; }

.mobile-figure-info {
  flex: 1;
  min-width: 0;
}

.mobile-figure-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.mobile-figure-name {
  font-size: clamp(15px, 4vw, 17px);
  color: #1a2332;
  font-weight: 700;
  word-break: break-word;
}

.mobile-figure-years {
  font-size: 11px;
  color: #7a8599;
  font-weight: 500;
  flex-shrink: 0;
}

.mobile-figure-title {
  font-size: clamp(11px, 3vw, 12px);
  color: var(--accent-color);
  margin: 2px 0 6px 0;
  font-weight: 600;
  word-break: break-word;
}

.mobile-figure-desc {
  font-size: clamp(12px, 3vw, 13px);
  color: #5a6478;
  line-height: 1.6;
  margin: 0 0 8px 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-figure-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mobile-tag {
  font-size: 11px;
  padding: 5px 10px;
  background: rgba(211, 47, 47, 0.08);
  color: var(--accent-color);
  border-radius: 12px;
  font-weight: 600;
  word-break: break-word;
}

.mobile-tag.achievement {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  color: #8a6d00;
}

.mobile-figure-quote {
  margin: 6px 0 0 0;
  font-size: clamp(11px, 2.8vw, 12px);
  color: var(--accent-color);
  font-style: italic;
  padding-left: 10px;
  border-left: 3px solid var(--accent-color);
  line-height: 1.6;
  opacity: 0.85;
  word-break: break-word;
}

/* ===== 移动端地点横滑卡片 ===== */
.mobile-location-card-snap {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(26, 35, 50, 0.07);
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.mobile-location-image {
  position: relative;
  aspect-ratio: 16 / 10;
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mobile-location-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-loc-icon-h, .mobile-loc-icon-v {
  position: absolute;
  top: 50%;
  left: 50%;
  background: rgba(211, 47, 47, 0.35);
  border-radius: 3px;
}
.mobile-loc-icon-h { width: 50px; height: 12px; transform: translate(-50%, -50%); }
.mobile-loc-icon-v { width: 12px; height: 50px; transform: translate(-50%, -50%); }

.mobile-location-cat {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, var(--accent-color), #b71c1c);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mobile-location-checked {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.mobile-location-info {
  flex: 1;
  padding: 14px;
  min-width: 0;
}

.mobile-location-name {
  font-size: clamp(16px, 4.3vw, 18px);
  color: #1a2332;
  margin: 0 0 6px 0;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}

.mobile-location-place {
  font-size: clamp(11px, 3vw, 12px);
  color: #7a8599;
  margin-bottom: 8px;
  word-break: break-word;
  line-height: 1.4;
}

.mobile-location-desc {
  font-size: clamp(12px, 3vw, 13px);
  color: #5a6478;
  line-height: 1.65;
  margin: 0 0 10px 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-location-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 移动端底部引导 */
.mobile-footer-guide {
  margin-bottom: 12px;
}

.mobile-guide-card {
  background: linear-gradient(135deg, #fff5f5 0%, #ffeaea 100%);
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  border: 2px solid rgba(211, 47, 47, 0.1);
}

.mobile-guide-emoji {
  font-size: 40px;
  margin-bottom: 10px;
  display: inline-block;
  animation: guideBounce 2s ease-in-out infinite;
}

@keyframes guideBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.mobile-guide-title {
  font-size: clamp(17px, 4.5vw, 19px);
  color: #1a2332;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.mobile-guide-desc {
  font-size: clamp(12px, 3.2vw, 14px);
  color: #5a6478;
  margin: 0 0 16px 0;
  line-height: 1.6;
  word-break: break-word;
}
</style>
