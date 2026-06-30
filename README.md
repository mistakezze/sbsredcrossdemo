# sbsredcrossdemo

## 上海红十字文化游览网站

> 一座城市的红十字记忆，从这里开始。

本项目是一个面向公众的 **上海红十字文化游览网站**，旨在以数字化、互动化的方式，向用户介绍上海这座"红十字之城"的历史脉络、代表人物、重要地点与人道主义精神。

### 核心功能

- 🏠 **首页**：以滑动轮播形式展示红十字代表人物与重要地点，下方配有历史时间线与红十字小知识卡片，让用户快速建立对红十字运动的整体认知。
- 🗺️ **路线推荐**：内置多条精心编排的上海红十字地点游览路线（固定路线 + AI 智能推荐），每条路线包含参观顺序、最佳时间、门票信息、餐饮推荐、拍照打卡点、实用贴士与交通方式。
- 🤖 **AI 智能推荐**：基于 **DeepSeek** 大模型，根据用户的时间、起点、兴趣偏好等个性化生成游览路线，附带交通方式与费用估算；后端内置限流与 Mock 降级，保证服务稳定可用。
- 🔖 **地点打卡**：用户可在每个红十字地点详情页记录打卡时间与游览感受，形成自己的"红十字足迹"。
- 📱 **PC / 移动端双套 UI**：基于 768px 断点自动切换两套独立 UI 模板，PC 端信息密度高、移动端单列紧凑；标签栏吸顶、卡片横滑居中等细节针对触屏优化。

### 适用人群

- 想了解上海红十字运动历史的游客与本地居民
- 学校、机构组织红十字主题研学与团队参观
- 对人道主义精神、公益文化感兴趣的所有人

### 项目亮点

- ✅ **前后端分离**：Vue 3 + Vite 前端，Java Spring Boot 后端
- ✅ **API Key 安全**：DeepSeek 密钥仅存在于后端配置，前端零密钥
- ✅ **响应式设计**：所有文字使用 `clamp()` 流体缩放，卡片使用 `scroll-snap` 居中
- ✅ **AI 降级保障**：后端不可用时自动切换为本地推荐路线，服务永不离线

---

## 版本历史

### V1.0 - 初始版本
> 2026-06-24

- 搭建上海红十字地点游览项目脚手架
- 前端：Vue 3 + Vite
- 后端：Java Spring Boot

---

### V1.1 - AI 路线推荐
> 2026-06-24

- 新增 AI 路线推荐详细化功能
- 后端代理 DeepSeek API（限流 + CORS + Mock 降级）
- 新增字段：历史背景、参观亮点、最佳时间、门票信息、餐饮推荐、打卡点、实用贴士、交通费用时间等

---

### V1.2 - 安全与部署配置
> 2026-06-24

- `application.properties` 从 Git 追踪中排除（含敏感 API Key）
- DeepSeek API Key 使用占位符管理
- Java 版本升级为 Java 17
- CORS 放开所有来源（适合部署模式）

---

### V2.0 - 全站移动端适配
> 2026-06-24

- 全站移动端适配
- 响应式优化：路线卡片、AI 步骤、打卡时间线、导航栏、首页英雄区
- 所有页面文字换行 & 布局优化
- 全局流体字体：所有文字随屏幕宽度自动缩放

---

### V2.1 - PC/移动端双套独立 UI
> 2026-06-24

- 基于 768px 断点切换 PC 与移动端模板
- 实现 `useViewport` 组合式函数检测设备类型
- Home.vue、Routes.vue、Checkins.vue、CheckinDetail.vue 双套独立 UI
- PC 端顶部导航 + 移动端底部 Tab 栏

---

### V2.2 - DeepSeek 模型配置
> 2026-06-24

- 模型默认值对齐为 `deepseek-v4-pro`
- 与 `application.properties` 保持一致

---

### V2.3 - UI 细节优化
> 2026-06-24

- PC 端导航栏改为 `fixed` 定位，始终固定在顶部
- 网页 favicon 改为红色十字（透明底），去掉红底圆

---

### V3.0 - 首页卡片滑动轮播
> 2026-06-24

- 首页人物区改为滑动轮播（PC 单卡片切换 + 移动端横滑）
- 首页地点区改为滑动轮播
- 大幅缩短首页页面长度
- 修复轮播 bug（v-for 与 v-show 冲突）
- 移动端卡片居中显示

---

### V3.1 - 轮播卡片样式优化
> 2026-06-24

- PC 端地点卡片尺寸与人物卡片统一（max-width: 700px）
- PC 端地点卡片改为横向布局（左图右文），与人物卡片结构一致
- 修复轮播切换效果冲突问题（去除 translateY 和 shine overlay 动画）

---

### V3.2 - 首页内容扩充
> 2026-06-25

- 首页新增红十字历史时间线
- 首页新增红十字小知识卡片（红十字起源、七项基本原则等）
- 小知识卡片支持弹窗详情（PC 居中弹窗 + 移动端底部抽屉）
- 首页主区域 max-width 由 1280px 调整到 1440px
- 人物/地点卡片 max-width 由 700px 调整到 900px
- 移除页面两侧固定装饰元素，保留区块内部装饰
- 移动端人物/地点卡片使用 `scroll-snap-align: center` + `scroll-snap-stop: always`，滑动后自动居中
- 移动端卡片宽度固定为 85vw

---

### V3.3 - 移动端 Routes 标签栏吸顶
> 2026-06-25

- 移动端 Routes 页面 `.mobile-tabs-wrap` 添加 `position: sticky; top: 0`
- 标签栏添加半透明背景 + 背景模糊（`backdrop-filter: blur(12px)`）
- 下滑浏览路线列表时，标签栏始终固定在顶部可见位置
- 解决"滑下去后看不到标签、需滚回顶部才能切换 Tab"的问题

---

## 技术栈

### 前端
- **Vue 3.4** - Composition API（`<script setup>`）
- **Vite 5** - 构建工具
- **Vue Router 4** - 路由
- **Pinia 风格的轻量 store** - 数据状态管理（基于 `ref` + 模块单例）

### 后端
- **Java 17**
- **Spring Boot 4.1.0** - Web MVC
- **RestTemplate** - 调用 DeepSeek
- **Jackson** - JSON 序列化/反序列化
- **DeepSeek API** (`deepseek-v4-pro`) - AI 路线生成
- **滑动窗口限流** - 防止 AI 接口被刷
- **Mock 降级** - 真实 API 不可用时自动使用本地推荐

### 工程约束
- 双 UI 模板：PC（≥768px）+ 移动端（<768px），断点统一在 `useViewport.js`
- 文字容器必须包含 `word-break: break-word` + `overflow-wrap: break-word`，字号使用 `clamp()` 流体缩放
- 移动端交互用 `:active`，PC 端用 `:hover`
- API Key 仅在后端，前端零密钥

---

## 项目结构

```
redcross/
├── frontend/                          # 前端
│   ├── index.html
│   ├── package.json                   # vue / vue-router / vite
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.js                    # 入口（createApp + 路由 + 全局样式）
│       ├── App.vue                    # 顶层布局（PC 顶部导航 / 移动端底部 Tab）
│       ├── styles/global.css          # 全局样式
│       ├── router/index.js            # 路由表（4 个页面）
│       ├── composables/
│       │   └── useViewport.js         # 视口检测（768px 断点）
│       ├── stores/                    # 前端数据层（localStorage 持久化）
│       │   ├── figureStore.js         # 6 位红十字人物
│       │   ├── locationStore.js       # 8 个上海红十字地点
│       │   └── checkinStore.js        # 打卡记录（localStorage）
│       └── views/
│           ├── Home.vue               # 首页（人物/地点轮播 + 时间线 + 小知识）
│           ├── Routes.vue             # 路线推荐（固定 + AI）
│           ├── Checkins.vue           # 打卡列表
│           └── CheckinDetail.vue      # 打卡详情
│
├── src/main/java/com/example/redcross/  # 后端
│   ├── RedcrossApplication.java       # 启动类
│   ├── controller/AiController.java   # AI 接口
│   ├── service/
│   │   ├── DeepSeekService.java       # DeepSeek 调用 + Prompt + 降级
│   │   └── RateLimitService.java      # 滑动窗口限流
│   ├── dto/                           # 请求/响应 DTO
│   │   ├── AiRouteRequest.java
│   │   ├── AiRouteResponse.java
│   │   ├── RouteStep.java
│   │   ├── TransitInfo.java
│   │   └── LocationItem.java
│   ├── deepseek/                      # DeepSeek API 数据结构
│   │   ├── DeepSeekRequest.java
│   │   └── DeepSeekResponse.java
│   └── config/                        # CORS / RestTemplate
│
├── src/main/resources/application.properties
├── pom.xml                            # Maven 配置
└── README.md
```

---

## 前端架构

### 路由表

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | Home | `Home.vue` | 首页（轮播 + 时间线 + 小知识） |
| `/routes` | Routes | `Routes.vue` | 路线推荐（固定 / AI） |
| `/checkins` | Checkins | `Checkins.vue` | 打卡列表 |
| `/checkins/:id` | CheckinDetail | `CheckinDetail.vue` | 打卡详情（按 locationId 查询） |

跳转行为：每次路由切换后平滑滚动到顶部（`scrollBehavior`）。

### 核心 Composable

#### `useViewport()` - 视口检测

```js
// frontend/src/composables/useViewport.js
const { isMobile, width, height, breakpoint } = useViewport()
// isMobile: boolean（<768px 为 true）
// width/height: ref 响应式
// breakpoint: 768
```

监听 `resize` 和 `orientationchange`，全应用共享单例。

### 数据 Store

所有 store 都基于 `ref` + 模块单例实现，无 Pinia 依赖。

#### `useFigureStore()` - 人物数据

```js
const { figures } = useFigureStore()
// figures: Ref<Array<{id, name, enName, title, years, description, achievement, quote, color}>>
```

内置 6 位上海红十字代表人物（沈敦和、任鸿隽、宋庆龄、钱信忠、吴贻芳、颜福庆）。

#### `useLocationStore()` - 地点数据

```js
const { locations, getLocationById } = useLocationStore()
// locations: Ref<Array<Location>>
// getLocationById(id): Location | undefined
```

内置 8 个上海红十字地点（博物馆 / 机构 / 救灾中心 / 医院 / 国际代表处 / 青少年中心 / 骨髓库 / 博爱园）。

#### `useCheckinStore()` - 打卡数据

| API | 说明 |
|-----|------|
| `checkins` | 全部打卡记录（`Ref<Array<Checkin>>`） |
| `checkinCount` | 打卡总数（computed） |
| `addCheckin(locationId, note)` | 添加/更新打卡，返回 boolean |
| `removeCheckin(id)` | 删除打卡 |
| `hasCheckedIn(locationId)` | 是否已打卡 |
| `getCheckinById(id)` | 按 id 或 locationId 查找 |
| `getCheckinNote(locationId)` | 备注内容 |
| `getCheckinTime(locationId)` | 打卡时间 |
| `updateNote(id, note)` | 修改备注 |

**数据格式**：
```ts
Checkin = {
  id: number                // timestamp
  locationId: number
  locationName: string
  location: string          // "上海市 · 徐汇区"
  note: string
  checkinTime: string       // "2026/06/25 14:30:00"
  timestamp: number
  category: string
}
```

**持久化**：`localStorage` key = `redcross_checkins`，自动同步。

### 环境变量

```bash
# frontend/.env（参考 .env.example）
VITE_BACKEND_URL=http://localhost:8080   # 后端地址
```

---

## 后端架构

### 配置项 `application.properties`

```properties
server.port=8080

# DeepSeek API
deepseek.api.key=${DEEPSEEK_API_KEY:}                          # 必须配置环境变量
deepseek.api.url=https://api.deepseek.com/chat/completions
deepseek.api.model=deepseek-v4-pro
deepseek.api.timeout-seconds=30

# CORS（空 = 允许所有来源）
app.cors.allowed-origins=

# 限流：每 IP 每 60 秒最多 N 次 AI 调用
app.rate-limit.requests-per-minute=10
```

### 关键 Bean

- **`DeepSeekService`**：调用 DeepSeek；未配置 API Key 时自动走 mock；调用失败时降级
- **`RateLimitService`**：滑动窗口限流（HashMap<ip, Deque<Long>>）
- **`CorsConfig`**：根据 `app.cors.allowed-origins` 配置 CORS
- **`RestTemplateConfig`**：配置 RestTemplate Bean

---

## API 接口

### 1. POST `/api/ai/route` - 生成 AI 路线

调用 DeepSeek 生成上海红十字文化游览路线。未配置 API Key 或调用失败时返回本地 mock。

**请求体**：
```json
{
  "question": "半天能走完的精华路线",
  "locations": [
    {
      "name": "上海红十字会博物馆",
      "category": "博物馆",
      "location": "上海市 · 徐汇区",
      "description": "中国第一座红十字主题博物馆..."
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `question` | string | 是 | 用户问题（如："半天能走完的精华路线"） |
| `locations` | LocationItem[] | 否 | 候选地点列表；为空时使用后端内置默认 6 个 |

**响应体（成功）**：
```json
{
  "question": "半天能走完的精华路线",
  "mocked": false,
  "errorMessage": null,
  "steps": [
    {
      "name": "上海红十字会博物馆",
      "meta": "博物馆 · 约2小时",
      "desc": "本馆是上海红十字运动的起点...",
      "history": "2005年开馆...",
      "bestTime": "建议工作日上午9:00-11:00",
      "ticket": "免费开放，需提前3天在公众号预约",
      "highlights": ["百年红十字史展", "人道救援实物展", "沈敦和故居复原", "互动体验区"],
      "photoSpots": ["场馆正门的红十字主题雕塑", "一楼大厅的光辉历程展区"],
      "nearbyFood": "出门右转200米岳阳路有多家本帮菜馆...",
      "practicalTips": ["场馆周边停车困难，建议地铁", "馆内设无障碍通道"],
      "tips": ["请遵守场馆规定", "部分展品需预约才能近距离观看"],
      "transit": {
        "fromPrev": "地铁1号线人民广场站→黄陂南路站，2站约8分钟",
        "routeHint": "从7号口出，沿西藏中路向北步行约300米",
        "mode": "subway",
        "cost": "约4元",
        "duration": "约15分钟"
      }
    }
  ],
  "summary": ["按行政区串联上海红十字地标", "交通路线为参考建议"]
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `question` | string | 回显原始问题 |
| `mocked` | boolean | true = 走 mock 降级；false = 真实 DeepSeek 返回 |
| `errorMessage` | string \| null | 调用失败时的错误描述（成功时为 null） |
| `steps` | RouteStep[] | 路线步骤（3-6 个） |
| `summary` | string[] | 路线要点总结 |

**transit.mode 取值**：`walk` | `subway` | `bus` | `taxi`

**响应（限流触发）**：
```json
{
  "error": "请求过于频繁，请稍后再试",
  "rateLimit": "每 60 秒最多 10 次",
  "remaining": 0
}
```
HTTP 429。

### 2. GET `/api/ai/status` - 健康检查

查询服务状态与当前 IP 剩余配额。

**响应**：
```json
{
  "ok": true,
  "remainingInWindow": 8,
  "ip": "127.0.0.1"
}
```

---

## AI Prompt 设计

后端在 `DeepSeekService#buildPrompt` 中构造四段式 Prompt：

1. **【地点数据库】** - 列出所有候选地点（含区域、类别、简介），强制 AI 只能从中选择
2. **【用户需求】** - 用户原始问题
3. **【输出要求】** - 严格 JSON Schema（含字段名、类型、示例）
4. **【硬性规则】** - 7 条约束（地点必须存在、不能编造门牌号、transit 只能 4 种模式、必须返回合法 JSON 等）

DeepSeek 使用 `response_format: json_object` 强制 JSON 输出，简化解析。

---

## 限流 & 降级

- **限流**：`RateLimitService` 使用 HashMap<ip, Deque<Long>> 实现滑动窗口，每 60s 默认 10 次
- **降级 1**：`apiKey` 为空时直接走 `generateMockSteps`（本地 5 步路线）
- **降级 2**：DeepSeek 抛 `HttpClientErrorException` / 任意 Exception 时，返回 mock + `errorMessage`
- **降级 3**：JSON 解析失败时返回 mock + `errorMessage`
- 所有降级都会把 `mocked=true` 返回给前端

---

## 快速开始

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
# 配置 DEEPSEEK_API_KEY 环境变量
# 修改 src/main/resources/application.properties 中的 API Key

# 运行 Spring Boot
./mvnw spring-boot:run
```

---

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |

---

## 部署

前端构建产物在 `frontend/dist/`，后端构建产物为 JAR 文件。
