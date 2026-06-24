<template>
  <div class="home">
    <!-- ===================== PC 端 ===================== -->
    <template v-if="!isMobile">
      <!-- 首页英雄区 -->
      <section class="pc-hero">
        <!-- 两侧装饰 -->
        <div class="hero-decor-left">
          <span class="decor-cross decor-1">+</span>
          <span class="decor-cross decor-2">+</span>
          <span class="decor-cross decor-3">+</span>
        </div>
        <div class="hero-decor-right">
          <span class="decor-cross decor-4">+</span>
          <span class="decor-cross decor-5">+</span>
          <span class="decor-cross decor-6">+</span>
        </div>

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
                :key="figureIndex"
                class="pc-figure-card large"
                :style="{ '--accent-color': figures[figureIndex]?.color }"
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
                    <span class="figure-years">{{ figures[figureIndex]?.years }}</span>
                  </div>
                  <h3 class="pc-figure-name large">{{ figures[figureIndex]?.name }}</h3>
                  <p class="figure-en large">{{ figures[figureIndex]?.enName }}</p>
                  <p class="pc-figure-title-line large">{{ figures[figureIndex]?.title }}</p>
                  <p class="pc-figure-desc large">{{ figures[figureIndex]?.description }}</p>
                  <div class="pc-figure-achievement large">🏆 {{ figures[figureIndex]?.achievement }}</div>
                  <blockquote v-if="figures[figureIndex]?.quote" class="figure-quote large">「{{ figures[figureIndex]?.quote }}」</blockquote>
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
                :key="locationIndex"
                :to="`/routes`"
                class="pc-location-card large"
                :style="{ '--accent-color': locations[locationIndex]?.color }"
              >
                <div class="pc-location-image large">
                  <img v-if="locations[locationIndex]?.image" :src="locations[locationIndex]?.image" :alt="locations[locationIndex]?.name" />
                  <template v-else>
                    <div class="placeholder-cross">
                      <span class="ph-h"></span>
                      <span class="ph-v"></span>
                    </div>
                  </template>
                  <div class="location-category large">{{ locations[locationIndex]?.category }}</div>
                  <div v-if="locations[locationIndex] && hasCheckedIn(locations[locationIndex]?.id)" class="location-checked large">
                    <span class="check-icon">✓</span>
                    <span>已打卡</span>
                  </div>
                </div>
                <div class="pc-location-body large">
                  <h3 class="pc-location-name large">{{ locations[locationIndex]?.name }}</h3>
                  <div class="location-place large">📍 {{ locations[locationIndex]?.location }}</div>
                  <p class="pc-location-desc large">{{ locations[locationIndex]?.description }}</p>
                  <div class="location-highlights large">
                    <span v-for="(h, i) in (locations[locationIndex]?.highlights || []).slice(0, 3)" :key="i" class="highlight-tag">{{ h }}</span>
                    <span v-if="(locations[locationIndex]?.highlights?.length || 0) > 3" class="highlight-tag more">+{{ locations[locationIndex].highlights.length - 3 }}</span>
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

      <!-- ===================== 历史时间线（PC端） ===================== -->
      <section class="pc-section pc-timeline-section">
        <div class="pc-section-header">
          <div class="section-tag">百年历程</div>
          <h2 class="pc-section-title">上海红十字大事记</h2>
          <p class="pc-section-subtitle">从1904到2024，红十字精神在这座城市生生不息</p>
        </div>

        <div class="pc-timeline">
          <div class="timeline-line"></div>
          <div
            v-for="(event, index) in timelineEvents"
            :key="index"
            class="pc-timeline-item"
            :style="{ '--event-color': event.color }"
          >
            <div class="pc-timeline-card">
              <div class="pc-timeline-year">{{ event.year }}</div>
              <h4 class="pc-timeline-title">{{ event.title }}</h4>
              <p class="pc-timeline-desc">{{ event.desc }}</p>
            </div>
            <div class="pc-timeline-dot"></div>
          </div>
        </div>
      </section>

      <!-- ===================== 红十字小知识（PC端） ===================== -->
      <section class="pc-section pc-facts-section">
        <div class="pc-section-header">
          <div class="section-tag">知识科普</div>
          <h2 class="pc-section-title">红十字小知识</h2>
          <p class="pc-section-subtitle">了解红十字运动，传递人道精神</p>
        </div>

        <div class="pc-facts-grid">
          <div
            v-for="(fact, index) in redCrossFacts"
            :key="index"
            class="pc-fact-card"
            @click="openFactModal(fact)"
          >
            <div class="pc-fact-icon">{{ fact.icon }}</div>
            <h4 class="pc-fact-title">{{ fact.title }}</h4>
            <p class="pc-fact-desc">{{ fact.desc }}</p>
          </div>
        </div>
      </section>

      <!-- ===================== 小知识详情弹窗 ===================== -->
      <div v-if="selectedFact" class="fact-modal-overlay" @click.self="closeFactModal">
        <div class="fact-modal-card" :style="{ '--accent-color': selectedFact.color }">
          <button class="fact-modal-close" @click="closeFactModal">×</button>
          
          <div class="fact-modal-header">
            <div class="fact-modal-icon">{{ selectedFact.icon }}</div>
            <h2 class="fact-modal-title">{{ selectedFact.title }}</h2>
          </div>
          
          <div class="fact-modal-body">
            <p
              v-for="(para, idx) in selectedFact.detail.split('\n\n')"
              :key="idx"
              class="fact-modal-para"
            >{{ para }}</p>
          </div>
        </div>
      </div>
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

      <!-- 移动端 红十字小知识 -->
      <section class="mobile-section">
        <div class="mobile-section-header">
          <div class="mobile-section-title-wrap">
            <span class="mobile-section-emoji">💡</span>
            <h2 class="mobile-section-title">小知识</h2>
          </div>
          <span class="mobile-section-count">{{ redCrossFacts.length }} 条</span>
        </div>

        <div class="mobile-facts-list">
          <div
            v-for="(fact, index) in redCrossFacts"
            :key="index"
            class="mobile-fact-item"
            :style="{ '--accent-color': fact.color }"
            @click="openFactModal(fact)"
          >
            <div class="mobile-fact-icon">{{ fact.icon }}</div>
            <div class="mobile-fact-info">
              <h4 class="mobile-fact-title">{{ fact.title }}</h4>
              <p class="mobile-fact-desc">{{ fact.desc }}</p>
            </div>
            <span class="mobile-fact-arrow">›</span>
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

      <!-- 移动端 小知识详情弹窗 -->
      <div v-if="selectedFact" class="fact-modal-overlay" @click.self="closeFactModal">
        <div class="fact-modal-card" :style="{ '--accent-color': selectedFact.color }">
          <button class="fact-modal-close" @click="closeFactModal">×</button>
          
          <div class="fact-modal-header">
            <div class="fact-modal-icon">{{ selectedFact.icon }}</div>
            <h2 class="fact-modal-title">{{ selectedFact.title }}</h2>
          </div>
          
          <div class="fact-modal-body">
            <p
              v-for="(para, idx) in selectedFact.detail.split('\n\n')"
              :key="idx"
              class="fact-modal-para"
            >{{ para }}</p>
          </div>
        </div>
      </div>
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

const timelineEvents = [
  {
    year: '1904',
    title: '上海万国红十字会成立',
    desc: '日俄战争爆发，沈敦和等人发起成立上海万国红十字会，成为中国红十字运动的起点。',
    color: '#d32f2f'
  },
  {
    year: '1911',
    title: '辛亥革命战地救护',
    desc: '辛亥革命爆发后，红十字会组建多支医疗队奔赴前线，救治伤兵数万人。',
    color: '#e53935'
  },
  {
    year: '1937',
    title: '淞沪抗战救护行动',
    desc: '淞沪会战期间，上海红十字会组织大规模战地救护，建立多所临时医院。',
    color: '#f44336'
  },
  {
    year: '1949',
    title: '新中国红十字事业新生',
    desc: '上海解放后，红十字会改组，成为新中国卫生事业和人道救助的重要力量。',
    color: '#ff5722'
  },
  {
    year: '1978',
    title: '改革开放后恢复发展',
    desc: '改革开放后，上海红十字会恢复各项工作，在救灾、救护、救助等领域持续发力。',
    color: '#ff9800'
  },
  {
    year: '2008',
    title: '汶川地震救援',
    desc: '汶川特大地震发生后，上海红十字会迅速行动，募集大量善款物资并派出救援队。',
    color: '#ffc107'
  },
  {
    year: '2020',
    title: '新冠疫情防控',
    desc: '新冠疫情期间，上海红十字会全力参与疫情防控，动员社会力量支援抗疫一线。',
    color: '#8bc34a'
  },
  {
    year: '2024',
    title: '新时代新征程',
    desc: '进入新时代，上海红十字事业持续高质量发展，谱写人道事业新篇章。',
    color: '#4caf50'
  }
]

const redCrossFacts = [
  {
    icon: '🏥',
    title: '红十字的起源',
    desc: '红十字运动起源于1863年，由亨利·杜南发起，旨在为战争中的伤员提供中立的人道救助。',
    detail: '1859年，瑞士商人亨利·杜南在意大利索尔费里诺战场上目睹了战争的残酷。四万多名伤病士兵被遗弃在战场上，无人救治。深受触动的杜南撰写了《索尔费里诺回忆录》，呼吁制定国际公约，为战地伤员和医护人员提供中立保护。\n\n1863年，在杜南的倡议下，16个国家的代表在日内瓦召开会议，决定成立红十字国际委员会。1864年，《日内瓦公约》正式签署，红十字运动由此诞生。\n\n红十字标志是将瑞士国旗的颜色翻转而来——红底白十字变为白底红十字，以向红十字运动的发源地瑞士致敬。',
    color: '#d32f2f'
  },
  {
    icon: '🕊️',
    title: '七项基本原则',
    desc: '人道、公正、中立、独立、志愿服务、统一、普遍，是红十字运动的核心价值观。',
    detail: '红十字与红新月运动的七项基本原则于1965年正式通过，是运动所有成员必须遵守的行为准则：\n\n📌 人道：保护人的生命和健康，保障人类的尊严\n📌 公正：不歧视任何人，仅根据需要提供帮助\n📌 中立：不在争议中选边站队，不参与政治、种族、宗教等纷争\n📌 独立：保持自主性，不受任何政府或势力控制\n📌 志愿服务：以志愿服务为基础，不求回报\n📌 统一：每个国家只有一个红十字会，对所有人开放\n📌 普遍：运动遍及全球，人人地位平等',
    color: '#e53935'
  },
  {
    icon: '🌍',
    title: '全球最大人道网络',
    desc: '红十字与红新月运动是全球最大的人道网络，在192个国家拥有约1400万志愿者。',
    detail: '红十字与红新月运动是世界上最大的人道网络，由三大部分组成：\n\n🏛️ 红十字国际委员会（ICRC）：负责在武装冲突中保护战争受害者\n🏛️ 红十字会与红新月会国际联合会（IFRC）：协调各国红会开展灾害应对等工作\n🏛️ 各国红十字会与红新月会：在各自国家开展人道服务\n\n运动在全球192个国家拥有成员协会，约1400万名志愿者和数十万工作人员，每年为数亿人提供帮助。无论是自然灾害、武装冲突还是公共卫生危机，哪里有人道需求，哪里就有红十字与红新月的身影。',
    color: '#f44336'
  },
  {
    icon: '❤️',
    title: '中国红十字会',
    desc: '中国红十字会成立于1904年，是国际红十字运动的重要成员，以保护人的生命和健康为宗旨。',
    detail: '中国红十字会成立于1904年3月10日，是中国近代史上第一个民间人道救助团体，也是国际红十字运动的重要成员。\n\n🔹 1904年：上海万国红十字会成立（中国红十字会前身）\n🔹 1912年：正式加入红十字国际委员会\n🔹 1949年：新中国成立后改组为中国红十字会\n🔹 1993年：《中华人民共和国红十字会法》颁布实施\n\n中国红十字会始终秉承"人道、博爱、奉献"的红十字精神，在应急救援、应急救护、人道救助、无偿献血、造血干细胞捐献、遗体和人体器官捐献、国际人道援助等领域发挥着重要作用。',
    color: '#ff5722'
  },
  {
    icon: '🩸',
    title: '三救三献',
    desc: '应急救援、应急救护、人道救助；献血液、献造血干细胞、献遗体器官，是红十字会的核心业务。',
    detail: '"三救三献"是中国红十字会的核心业务：\n\n🚑 三救：\n  • 应急救援：参与自然灾害、事故灾难等突发事件救援\n  • 应急救护：开展应急救护培训，普及急救知识技能\n  • 人道救助：帮扶困难群体，开展助学、助医、助老等\n\n💝 三献：\n  • 献血液：推动无偿献血工作，保障临床用血需求\n  • 献造血干细胞：建设中华骨髓库，为白血病患者寻找供者\n  • 献遗体器官：推动遗体和人体器官捐献，延续生命希望\n\n截至目前，中华骨髓库已登记入库志愿者超300万人，累计捐献造血干细胞超1.5万例；全国累计实现人体器官捐献超4万例，挽救了数万濒危患者的生命。',
    color: '#ff9800'
  },
  {
    icon: '👶',
    title: '人道救助',
    desc: '红十字会开展助学、助医、助老、助困等多种人道救助服务，惠及数百万困难群众。',
    detail: '人道救助是红十字会的重要职责，围绕"改善最易受损害群体的境况"这一目标，开展了多种形式的救助服务：\n\n🎒 助学救助：资助家庭困难学生完成学业，援建博爱学校\n🏥 助医救助：开展大病救助，帮助贫困家庭患者获得治疗\n👴 助老服务：关爱空巢老人，建设博爱养老服务机构\n🏠 助困帮扶：慰问困难家庭，发放生活物资\n\n此外，还有"红十字博爱送万家"品牌项目，每年元旦春节期间走访慰问困难群众，把温暖送到千家万户。\n\n据统计，全国各级红十字会每年投入人道救助资金数十亿元，受益群众数百万，成为政府社会保障体系的重要补充。',
    color: '#ffc107'
  }
]

const selectedFact = ref(null)

const openFactModal = (fact) => {
  selectedFact.value = fact
  document.body.style.overflow = 'hidden'
}

const closeFactModal = () => {
  selectedFact.value = null
  document.body.style.overflow = ''
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  z-index: 1;
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

/* 英雄区两侧装饰 */
.hero-decor-left,
.hero-decor-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120px;
  pointer-events: none;
  z-index: 1;
}

.hero-decor-left {
  left: 20px;
}

.hero-decor-right {
  right: 20px;
}

.decor-cross {
  position: absolute;
  color: rgba(211, 47, 47, 0.25);
  font-weight: 300;
  line-height: 1;
  z-index: 1;
}

.decor-1 {
  top: 15%;
  font-size: 48px;
  animation: floatDecor1 6s ease-in-out infinite;
}

.decor-2 {
  top: 45%;
  font-size: 36px;
  animation: floatDecor2 8s ease-in-out infinite;
}

.decor-3 {
  top: 75%;
  font-size: 28px;
  animation: floatDecor3 7s ease-in-out infinite;
}

.decor-4 {
  top: 20%;
  font-size: 32px;
  animation: floatDecor2 7s ease-in-out infinite;
}

.decor-5 {
  top: 50%;
  font-size: 44px;
  animation: floatDecor1 9s ease-in-out infinite;
}

.decor-6 {
  top: 80%;
  font-size: 26px;
  animation: floatDecor3 6s ease-in-out infinite;
}

@keyframes floatDecor1 {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-15px) rotate(10deg); opacity: 1; }
}

@keyframes floatDecor2 {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-12px) rotate(-8deg); opacity: 0.9; }
}

@keyframes floatDecor3 {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
  50% { transform: translateY(-10px) rotate(5deg); opacity: 0.8; }
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
  z-index: 1;
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

/* ===== PC 人物区背景装饰 ===== */
#pc-figures {
  position: relative;
  overflow: visible;
}

#pc-figures::before {
  content: '';
  position: absolute;
  top: 20px;
  left: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.12) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseDecor 4s ease-in-out infinite;
  pointer-events: none;
}

#pc-figures::after {
  content: '';
  position: absolute;
  bottom: 20px;
  right: -40px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 152, 0, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseDecor 5s ease-in-out infinite 1s;
  pointer-events: none;
}

@keyframes pulseDecor {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.15); opacity: 1; }
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

/* ===== PC 地点区背景装饰 ===== */
#pc-locations {
  position: relative;
  overflow: visible;
}

#pc-locations::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -50px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(244, 67, 54, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseDecor 6s ease-in-out infinite 0.5s;
  pointer-events: none;
}

#pc-locations::after {
  content: '';
  position: absolute;
  top: 20%;
  right: -60px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseDecor 5s ease-in-out infinite 2s;
  pointer-events: none;
}

/* ===== PC 地点卡片 - 轮播大卡片（横向布局，和人物卡片一致） ===== */
.pc-location-card.large {
  background: white;
  border-radius: 24px;
  padding: 36px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(26, 35, 50, 0.1);
  border-left: 6px solid var(--accent-color);
  position: relative;
  text-decoration: none;
  display: flex;
  gap: 28px;
  color: inherit;
  max-width: 700px;
  width: 100%;
}

.pc-location-card.large:hover {
  box-shadow: 0 16px 50px rgba(26, 35, 50, 0.18);
}

.pc-location-image.large {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff5f5, #ffe0e0);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pc-location-image.large.has-image img,
.pc-location-image.large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
}

.placeholder-cross {
  width: 60px;
  height: 60px;
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
.ph-h { width: 48px; height: 12px; transform: translate(-50%, -50%); }
.ph-v { width: 12px; height: 48px; transform: translate(-50%, -50%); }

@keyframes placeholderPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
}

.location-category.large {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--accent-color), #b71c1c);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 3;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.location-checked.large {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pc-location-body.large {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* ===== PC 时间线/小知识区背景装饰 ===== */
.pc-timeline-section::before,
.pc-facts-section::before {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  pointer-events: none;
  animation: floatBgDecor 8s ease-in-out infinite;
}

.pc-timeline-section::before {
  top: -60px;
  left: 8%;
  background: radial-gradient(circle, rgba(211, 47, 47, 0.1) 0%, transparent 70%);
}

.pc-timeline-section::after {
  content: '';
  position: absolute;
  bottom: -40px;
  right: 12%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: floatBgDecor 10s ease-in-out infinite 2s;
  pointer-events: none;
}

@keyframes floatBgDecor {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.08); }
}

/* ===== PC 时间线（最初版本：横向排列，卡片在上方） ===== */
.pc-timeline-section {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.pc-timeline {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 60px 60px 50px;
  gap: 20px;
  z-index: 2;
}

.timeline-line {
  position: absolute;
  top: calc(50% + 30px);
  left: 80px;
  right: 80px;
  height: 4px;
  background: linear-gradient(90deg, #d32f2f, #ff9800, #ffc107, #8bc34a, #4caf50);
  border-radius: 2px;
  transform: translateY(-50%);
}

.pc-timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.pc-timeline-card {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.08);
  border-top: 4px solid var(--event-color);
  margin-bottom: 40px;
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.pc-timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(26, 35, 50, 0.15);
}

.pc-timeline-year {
  font-size: 18px;
  font-weight: 800;
  color: var(--event-color);
  margin-bottom: 6px;
}

.pc-timeline-title {
  font-size: 13px;
  color: #1a2332;
  margin: 0 0 6px 0;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
}

.pc-timeline-desc {
  font-size: 11px;
  color: #7a8599;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

.pc-timeline-dot {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: var(--event-color);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* ===== 小知识区额外装饰 ===== */
.pc-facts-section {
  position: relative;
}

.pc-facts-section::before {
  display: none;
}

.pc-facts-section::after {
  content: '';
  position: absolute;
  top: -40px;
  right: 8%;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(139, 195, 74, 0.04) 0%, transparent 70%);
  border-radius: 50%;
  animation: floatBgDecor 9s ease-in-out infinite 1s;
  pointer-events: none;
  z-index: 0;
}

/* ===== PC 红十字小知识 ===== */
.pc-facts-section {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.pc-facts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  position: relative;
  z-index: 2;
}

.pc-fact-card {
  background: white;
  border-radius: 20px;
  padding: 32px 28px;
  box-shadow: 0 4px 20px rgba(26, 35, 50, 0.06);
  border: 2px solid #f0f2f5;
  transition: all 0.3s ease;
  cursor: pointer;
}

.pc-fact-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(211, 47, 47, 0.15);
  border-color: rgba(211, 47, 47, 0.2);
}

.pc-fact-icon {
  font-size: 48px;
  margin-bottom: 16px;
  line-height: 1;
}

.pc-fact-title {
  font-size: 18px;
  color: #1a2332;
  margin: 0 0 10px 0;
  font-weight: 700;
  word-break: break-word;
}

.pc-fact-desc {
  font-size: 14px;
  color: #5a6478;
  line-height: 1.8;
  margin: 0;
  word-break: break-word;
}

/* ===== 小知识弹窗 ===== */
.fact-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
  animation: factFadeIn 0.25s ease;
}

@keyframes factFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fact-modal-card {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-top: 6px solid var(--accent-color);
  animation: factSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes factSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.fact-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f0f2f5;
  color: #5a6478;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.fact-modal-close:hover {
  background: #e5e9ef;
  color: #1a2332;
  transform: rotate(90deg);
}

.fact-modal-header {
  text-align: center;
  padding: 40px 36px 24px;
  background: linear-gradient(180deg, rgba(211, 47, 47, 0.06), transparent);
}

.fact-modal-icon {
  font-size: 64px;
  margin-bottom: 16px;
  line-height: 1;
}

.fact-modal-title {
  font-size: clamp(22px, 3vw, 28px);
  color: #1a2332;
  margin: 0;
  font-weight: 800;
  word-break: break-word;
}

.fact-modal-body {
  padding: 24px 36px 40px;
}

.fact-modal-para {
  font-size: 15px;
  color: #5a6478;
  line-height: 1.9;
  margin: 0 0 16px 0;
  word-break: break-word;
  white-space: pre-line;
}

.fact-modal-para:last-child {
  margin-bottom: 0;
}

/* 弹窗移动端适配 */
@media (max-width: 768px) {
  .fact-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .fact-modal-card {
    max-width: 100%;
    max-height: 88vh;
    border-radius: 24px 24px 0 0;
    border-top: none;
    border-bottom: 6px solid var(--accent-color);
    animation: factSlideUpMobile 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes factSlideUpMobile {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .fact-modal-close {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .fact-modal-header {
    padding: 32px 20px 16px;
  }

  .fact-modal-icon {
    font-size: 52px;
  }

  .fact-modal-title {
    font-size: clamp(18px, 5vw, 22px);
  }

  .fact-modal-body {
    padding: 16px 20px 32px;
  }

  .fact-modal-para {
    font-size: 14px;
    line-height: 1.8;
  }
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
  padding: 4px 0 20px;
  scroll-snap-stop: always;
}

.mobile-figure-scroll::-webkit-scrollbar,
.mobile-location-scroll::-webkit-scrollbar {
  display: none;
}

.mobile-figure-track,
.mobile-location-track {
  display: flex;
  gap: 14px;
  width: max-content;
  padding: 0 calc((100vw - 85vw) / 2);
}

.mobile-figure-card-snap,
.mobile-location-card-snap {
  flex-shrink: 0;
  width: 85vw;
  max-width: 360px;
  scroll-snap-align: center;
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

/* 移动端 小知识列表 */
.mobile-facts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-fact-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(26, 35, 50, 0.06);
  border-left: 4px solid var(--accent-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

.mobile-fact-item:active {
  transform: scale(0.98);
  background: #f8fafc;
}

.mobile-fact-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.mobile-fact-info {
  flex: 1;
  min-width: 0;
}

.mobile-fact-title {
  font-size: clamp(14px, 3.8vw, 16px);
  color: #1a2332;
  margin: 0 0 4px 0;
  font-weight: 700;
  word-break: break-word;
}

.mobile-fact-desc {
  font-size: clamp(11px, 3vw, 13px);
  color: #7a8599;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-fact-arrow {
  font-size: 24px;
  color: #c0c6d0;
  flex-shrink: 0;
  font-weight: 300;
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
