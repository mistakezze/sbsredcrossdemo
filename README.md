# sbsredcrossdemo

## 上海红十字文化游览与推荐平台

> 一座城市的红十字记忆，从这里开始。

本项目是一个面向公众的上海红十字文化游览网站，通过地图、文化内容、活动、打卡和可解释的推荐算法，向用户介绍上海红十字运动的历史脉络、代表人物、重要地点与人道主义精神。

项目采用前后端分离架构：

- **前端**：Vue 3 + Vite + Vue Router + Leaflet
- **后端**：Java 17 + Spring Boot 4.1
- **推荐**：UserCF、低秩隐因子模型、内容特征加权排序
- **生成式 AI**：DeepSeek 地点推荐与路线规划，后端代理调用
- **数据存储**：当前演示版主要使用浏览器 `localStorage`

---

## 核心功能

### 🏠 红十字文化首页

- 通过轮播展示 6 位红十字代表人物和上海红十字地点
- 展示红十字运动历史时间线
- 提供红十字起源、七项基本原则等知识卡片及详情弹窗
- 显示当前角色的浏览与打卡进度

### 🗺️ 地点地图

- 使用 Leaflet 和高德地图底图展示上海红十字地点
- 支持历史地点、现代地点筛选
- 使用 MarkerCluster 聚合密集标记
- 支持浏览器 GPS 定位、距离计算和按距离排序
- 提供地点详情、打卡、评价摘要和高德地图外部导航
- 地图标记会根据打卡状态改变颜色

### 📍 地点管理与审核

- 管理员和企业/地点用户可以提交自定义地点
- 支持填写名称、区域、类别、时代、简介、历史与亮点
- 可在地图上选点，保存 WGS84 坐标并在展示时转换为 GCJ-02
- 地点提交状态包括待审核、已通过、已驳回
- 管理员可通过或驳回地点，并可删除提交记录
- 审核通过的地点会自动合并进地图和路线使用的地点库

该页面仅允许管理员和企业/地点用户访问，其他角色访问时会返回地图页。

### 📋 路线推荐

提供固定路线和 AI 智能推荐两种模式：

- **固定路线**：按当前地点库顺序展示地点，支持查看详情、评价与打卡
- **AI 路线**：支持预设问题和自定义问题，由 DeepSeek 生成 3–6 站路线
- 路线结果包含推荐顺序、参观亮点、历史背景、最佳时间、预约信息、附近餐饮、拍照点和实用贴士
- 展示 AI 路线生成过程，并使用打字机效果逐字呈现
- 后端或网络不可用时，前端会生成本地参考路线

### 🎪 红十字活动

- 按即将开始、进行中、已结束筛选
- 支持急救培训、志愿服务、人道讲座、无偿献血、公益筹款五类活动
- 支持活动报名、取消报名、查看报名人数与剩余名额
- 支持活动评分与文字评价
- 企业/地点用户提交的活动进入待审核状态，管理员通过后才会公开展示
- 管理员可按待审核、已通过、已驳回筛选并填写审核意见
- 管理员可以删除活动和不当评价
- 根据角色行为提供个性化活动推荐或冷启动推荐

### ⭐ 地点评价

- 支持 1–5 星评分和文字评价
- 同一角色对同一地点只保留最新一条评价
- 展示平均分、评价数量和星级分布
- 管理员可删除不当评价
- 评价会作为协同过滤模型的显式反馈

### 📋 打卡足迹

- 在地点详情或地图中完成打卡
- 每个地点只保留一条打卡记录，重复打卡会更新时间与备注
- 支持编辑游览感受、查看打卡详情和删除记录
- 打卡记录按时间线展示，并区分历史地点与现代地点

### 👥 演示角色与权限

当前项目使用角色切换器模拟不同用户身份，不包含真实登录系统。

| 角色 | 浏览 | 评价 | 打卡 | 报名活动 | 发布活动 | 上传地点 | 审核/删除 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 管理员 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 企业/地点用户 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 游客用户 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 注册用户 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 志愿者 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

当前角色保存在 `redcross_current_role` 中。志愿者同时显示星级荣誉标识。

注册用户支持从 100 名带独立偏好的模拟账号中随机抽取 5 名登录。模拟账号的评价、打卡和活动偏好会进入 UserCF 与低秩模型，用于形成更真实的用户矩阵和推荐验证数据。

### 📱 响应式双 UI

- 以 768px 为断点自动切换桌面端和移动端模板
- 桌面端使用顶部导航，移动端使用底部 Tab 栏
- 主要页面分别提供 PC 和移动端布局
- 支持移动端安全区域、横滑卡片、底部抽屉和吸顶筛选栏

---

## 页面与路由

| 路径 | 页面 | 主要功能 |
| --- | --- | --- |
| `/` | 首页 | 人物、地点、时间线、红十字知识 |
| `/map` | 地图 | 地点地图、定位、筛选、算法推荐、AI 地点推荐 |
| `/routes` | 路线 | 固定路线、地点详情、评价、打卡、AI 路线 |
| `/activities` | 活动 | 活动浏览、筛选、报名、评价、发布 |
| `/places` | 地点管理 | 地点上传、地图选点、审核与状态管理 |
| `/checkins` | 个人打卡 | 打卡时间线与删除 |
| `/checkins/:id` | 打卡详情 | 查看和编辑打卡备注 |

`/places` 配置了角色访问限制，仅管理员和企业/地点用户可以进入。

---

## 项目结构

```text
redcross/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── components/
│       │   ├── RoleSwitcher.vue      # 角色切换器
│       │   └── StarRating.vue        # 星级评分组件
│       ├── composables/
│       │   └── useViewport.js        # 768px 响应式断点
│       ├── router/
│       │   └── index.js              # 页面路由与访问限制
│       ├── stores/
│       │   ├── activityStore.js      # 活动、报名、活动推荐
│       │   ├── checkinStore.js       # 打卡记录
│       │   ├── figureStore.js        # 红十字人物数据
│       │   ├── locationStore.js      # 地点库
│       │   ├── locationSubmitStore.js# 地点提交与审核
│       │   ├── reviewStore.js        # 地点评价
│       │   └── userStore.js          # 演示角色与权限
│       ├── styles/
│       │   └── global.css
│       ├── utils/
│       │   ├── cfBlend.js            # 协同过滤信号融合
│       │   ├── coordTransform.js     # 坐标转换与距离计算
│       │   ├── lowRankModel.js       # 低秩隐因子模型
│       │   ├── placeRecommend.js     # 地点综合推荐
│       │   ├── preferenceMatrix.js   # 统一偏好矩阵
│       │   └── userCF.js             # 基于用户的协同过滤
│       └── views/
│           ├── Home.vue
│           ├── Map.vue
│           ├── Routes.vue
│           ├── Activities.vue
│           ├── Places.vue
│           ├── Checkins.vue
│           └── CheckinDetail.vue
│
├── src/
│   ├── main/
│   │   ├── java/com/example/redcross/
│   │   │   ├── RedcrossApplication.java
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── RestTemplateConfig.java
│   │   │   ├── controller/
│   │   │   │   └── AiController.java
│   │   │   ├── deepseek/
│   │   │   │   ├── DeepSeekRequest.java
│   │   │   │   └── DeepSeekResponse.java
│   │   │   ├── dto/                   # AI 请求、响应与路线数据
│   │   │   └── service/
│   │   │       ├── DeepSeekService.java
│   │   │       └── RateLimitService.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/com/example/redcross/
│           └── RedcrossApplicationTests.java
│
├── 推荐算法解析.md
├── 红十字文化推荐算法研究_论文.docx
├── pom.xml
├── mvnw
└── mvnw.cmd
```

---

## 技术栈

### 前端

- Vue 3.4，使用 Composition API 和 `<script setup>`
- Vite 5
- Vue Router 4
- Leaflet 1.9 与 Leaflet.markercluster
- 轻量模块级 Store，使用 Vue `ref` / `computed` 和 `localStorage`

### 后端

- Java 17
- Spring Boot 4.1.0
- Spring Web MVC
- RestTemplate
- Jackson
- DeepSeek Chat Completions API
- 内存滑动窗口限流

---

## 前端数据层

当前演示版没有数据库和真实账号系统，主要业务数据保存在浏览器本地。

| Store | 数据内容 | `localStorage` Key |
| --- | --- | --- |
| `userStore` | 当前演示角色与权限 | `redcross_current_role` |
| `locationStore` | 内置地点与审核通过的地点 | 基础数据在代码中，审核数据复用 `redcross_place_submissions` |
| `locationSubmitStore` | 地点提交与审核状态 | `redcross_place_submissions` |
| `reviewStore` | 地点评分与评价 | `redcross_reviews` |
| `checkinStore` | 打卡时间、备注与分类 | `redcross_checkins` |
| `activityStore` | 活动、报名、活动评价 | `redcross_activity_state_v2` |
| `figureStore` | 6 位红十字代表人物 | 静态数据 |

默认地点库包含 8 个内置红十字地点，并会合并审核通过的自定义地点。项目还包含少量种子评价、活动和地点审核数据，便于首次打开时直接体验完整界面。

所有状态按浏览器和域名隔离，不会同步到其他设备，也不由后端持久化。清除对应 `localStorage` Key 可以恢复该模块的演示数据。

---

## 推荐系统

项目中有四类推荐入口：

| 推荐类型 | 入口 | 实现 |
| --- | --- | --- |
| 地点算法推荐 | `/map` | 协同过滤 + 内容特征 |
| 活动算法推荐 | `/activities` | 类型维度协同过滤 + 内容特征 |
| AI 地点推荐 | `/map` | DeepSeek + 用户足迹 |
| AI 路线推荐 | `/routes` | DeepSeek + 候选地点库 |

### 统一偏好矩阵

地点算法推荐和活动算法推荐复用同一套协同过滤基础能力：

```text
显式评价（1–5 星） + 隐式正反馈（打卡/报名，计 4 分）
                         │
                         ▼
                  统一偏好矩阵
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      UserCF 邻域模型         低秩隐因子模型
     （相似访客怎么做）       （隐因子重建评分）
             └───────────┬───────────┘
                         ▼
                 协同过滤融合信号
                         │
                         ▼
          内容特征加权、排序与推荐理由
```

协同过滤融合默认配置为：

- UserCF：60%
- 低秩隐因子模型：40%
- 某一路不可用时由另一路独占权重
- 两路都不可用时，协同过滤项退出，其余内容特征按可用权重重新归一化

### 地点推荐

```text
总分 =
  协同过滤 30%
  + 兴趣匹配 25%
  + 口碑评分 15%
  + 评价热度 10%
  + 探索价值 10%
  + 距离 10%
```

- 兴趣来自打卡类别和高分评价类别
- 热度按评价数量相对归一化
- 未打卡地点获得探索加分
- 有定位时使用距离衰减，无定位时使用中性分
- 每张推荐卡展示最多 2 条可解释推荐理由

### 活动推荐

活动数量较少，因此协同过滤聚合到“活动类型”维度，再映射回具体活动。

个性化模式：

```text
总分 =
  协同过滤 30%
  + 兴趣匹配 30%
  + 口碑评分 20%
  + 报名热度 10%
  + 时间临近 10%
```

用户既没有报名也没有评价时进入冷启动模式：

```text
总分 =
  报名热度 50%
  + 时间临近 30%
  + 口碑评分 20%
```

冷启动推荐会对活动类型进行打散，同一类型默认最多出现 2 场。用户产生报名或评价后，会自动切换到个性化模式。

完整的公式、参数、复杂度和冷启动策略见 [推荐算法解析.md](./推荐算法解析.md)。

---

## AI 服务

### 接口

#### 1. 获取服务状态

```http
GET /api/ai/status
```

返回服务状态、当前 IP 和限流窗口剩余次数。

#### 2. 生成游览路线

```http
POST /api/ai/route
Content-Type: application/json
```

请求体：

```json
{
  "question": "半天能走完的精华路线",
  "locations": [
    {
      "name": "上海红十字会博物馆",
      "category": "博物馆",
      "location": "上海市 · 徐汇区",
      "description": "中国第一座红十字主题博物馆……"
    }
  ]
}
```

主要响应字段：

- `question`：原始问题
- `steps`：路线步骤
- `summary`：路线要点
- `routeGenerationProcess`：路线生成过程说明
- `mocked`：是否使用本地 Mock 降级
- `errorMessage`：调用失败信息

#### 3. 根据足迹推荐地点

```http
POST /api/ai/places
Content-Type: application/json
```

请求体包含：

- `preference`：可选偏好描述
- `checkedNames`：已打卡地点名称
- `checkedCategories`：已到访类别
- `likedCategories`：高分评价类别
- `locations`：当前候选地点

响应包含推荐摘要和地点推荐列表。每个推荐地点包括名称、类别、推荐理由、亮点、最佳时间和实用提示。

### DeepSeek 调用策略

- API Key 只保存在后端配置或环境变量中，前端不接触密钥
- 使用 `response_format: json_object` 约束结构化输出
- 支持路线推荐和地点推荐两组 Prompt
- API Key 未配置时直接返回本地 Mock
- HTTP 错误、调用异常、JSON 解析失败或空结果会自动降级
- 降级结果通过 `mocked=true` 标识，并尽量附带 `errorMessage`
- CORS 允许的请求方法为 `GET`、`POST`、`OPTIONS`

### 限流

`RateLimitService` 使用每个 IP 独立的 60 秒滑动窗口，默认最多 10 次请求。超过限制时返回 HTTP 429。

IP 优先从 `X-Forwarded-For` 的第一个地址读取，未提供时使用连接地址。

---

## 后端配置

主要配置位于 `src/main/resources/application.properties`：

```properties
server.port=8080

deepseek.api.key=${DEEPSEEK_API_KEY:}
deepseek.api.url=https://api.deepseek.com/chat/completions
deepseek.api.model=deepseek-flash
deepseek.api.reasoning-effort=low
deepseek.api.timeout-seconds=90

app.cors.allowed-origins=
app.rate-limit.requests-per-minute=10
```

如果 `app.cors.allowed-origins` 为空，开发配置会允许所有来源。生产部署时建议填写明确的前端域名白名单。

---

## 本地运行

### 环境要求

- JDK 17
- Node.js 与 npm
- Maven Wrapper 已包含在仓库中

### 1. 启动后端

Windows PowerShell：

```powershell
$env:DEEPSEEK_API_KEY="sk-your-key"
.\mvnw.cmd spring-boot:run
```

macOS / Linux：

```bash
export DEEPSEEK_API_KEY="sk-your-key"
./mvnw spring-boot:run
```

不配置 `DEEPSEEK_API_KEY` 也可以启动，此时 AI 接口会返回本地 Mock 数据。

后端默认地址：

```text
http://localhost:8080
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器默认地址：

```text
http://localhost:5173
```

如果后端地址不是 `http://localhost:8080`，在 `frontend/.env` 中配置：

```env
VITE_BACKEND_URL=http://localhost:8080
```

前端当前只读取后端地址。不要在 Vite 环境变量中填写 DeepSeek API Key，所有 AI 请求都应通过 Spring Boot 代理。

### 3. 构建

前端：

```bash
cd frontend
npm run build
```

构建产物位于 `frontend/dist/`。

后端：

```powershell
.\mvnw.cmd clean package
```

构建产物位于 `target/`。

---

## 常用调试

检查后端状态：

```powershell
Invoke-RestMethod http://localhost:8080/api/ai/status
```

验证地点与活动推荐算法：

```text
http://localhost:5173/recommendation-check.html
```

该页面会直接调用项目中的 UserCF、低秩模型和业务排序模块，并以 `PASS / FAIL` 展示断言结果。

重置前端演示数据：

```js
localStorage.removeItem('redcross_current_role')
localStorage.removeItem('redcross_checkins')
localStorage.removeItem('redcross_reviews')
localStorage.removeItem('redcross_place_submissions')
localStorage.removeItem('redcross_activity_state_v2')
location.reload()
```

---

## 当前限制

- 演示角色不是真实账号，权限判断仅用于前端交互演示
- 业务数据保存在浏览器 `localStorage`，没有统一数据库和多设备同步
- 地点审核、活动发布和评价管理均未接入后端持久化
- 协同过滤数据规模较小，冷启动和信号退化是已知问题
- AI 推荐与算法推荐目前分开展示，尚未进入同一排序链路
- AI 结果依赖外部模型服务；无 Key 或服务异常时使用 Mock 数据

---

## 版本历史

### V1.0 - 初始版本

> 2026-06-24

- 搭建上海红十字地点游览项目脚手架
- 前端使用 Vue 3 + Vite
- 后端使用 Java Spring Boot

---

### V1.1 - AI 路线推荐

> 2026-06-24

- 新增 AI 路线推荐详细化功能
- 后端代理 DeepSeek API（限流 + CORS + Mock 降级）
- 新增历史背景、参观亮点、最佳时间、门票信息、餐饮推荐、打卡点、实用贴士、交通费用与时间等字段

---

### V1.2 - 安全与部署配置

> 2026-06-24

- `application.properties` 从 Git 追踪中排除（含敏感 API Key）
- DeepSeek API Key 使用占位符管理
- Java 版本升级为 Java 17
- CORS 支持部署模式配置

---

### V2.0 - 全站移动端适配

> 2026-06-24

- 全站移动端适配
- 响应式优化：路线卡片、AI 步骤、打卡时间线、导航栏、首页英雄区
- 所有页面文字换行与布局优化
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

- 模型默认值对齐为 `deepseek-flash`
- 与 `application.properties` 保持一致

---

### V2.3 - UI 细节优化

> 2026-06-24

- PC 端导航栏改为 `fixed` 定位，始终固定在顶部
- 网页 favicon 改为红十字图标（透明底）

---

### V3.0 - 首页卡片滑动轮播

> 2026-06-24

- 首页人物区改为滑动轮播（PC 单卡片切换 + 移动端横滑）
- 首页地点区改为滑动轮播
- 大幅缩短首页页面长度
- 修复轮播 bug（`v-for` 与 `v-show` 冲突）
- 移动端卡片居中显示

---

### V3.1 - 轮播卡片样式优化

> 2026-06-24

- PC 端地点卡片尺寸与人物卡片统一
- PC 端地点卡片改为横向布局，与人物卡片结构一致
- 修复轮播切换效果冲突

---

### V3.2 - 首页内容扩充

> 2026-06-25

- 首页新增红十字历史时间线
- 首页新增红十字小知识卡片（红十字起源、七项基本原则等）
- 小知识卡片支持详情弹窗
- 首页主区域最大宽度调整为 1440px
- 人物/地点卡片最大宽度调整为 900px
- 移动端人物/地点卡片支持自动居中

---

### V3.3 - 移动端 Routes 标签栏吸顶

> 2026-06-25

- 移动端 Routes 标签栏添加吸顶定位
- 标签栏添加半透明背景与背景模糊
- 下滑浏览路线列表时，标签栏始终固定在顶部可见

---

### V4.0 - 地图、活动与个性化推荐

> 2026-11-13

- 新增 `/map` 地点地图页面，支持高德底图、Leaflet 标记、地点聚合、历史/现代地点筛选、GPS 定位、距离计算和外部导航
- 新增地点算法推荐，综合协同过滤、兴趣、口碑、热度、探索价值和距离，并展示匹配分与推荐理由
- 新增 DeepSeek AI 地点推荐，根据当前角色的打卡记录和高分评价生成个性化地点、理由、亮点、最佳时间和实用提示
- 新增 `/activities` 活动页面，支持活动筛选、详情查看、报名、取消报名、名额展示、活动评分和文字评价
- 新增活动推荐；没有报名或评价记录时使用热门、时效和口碑冷启动策略，并限制同一类型活动的出现数量
- 新增 `/places` 地点管理页面，管理员和企业/地点用户可以上传地点、填写详情并在地图上选择位置
- 新增地点审核流程，支持待审核、已通过和已驳回状态；审核通过的地点会自动进入地图、路线和推荐地点库
- 新增管理员、企业/地点用户、游客、注册用户和志愿者五种演示角色，提供统一角色切换器及权限判断
- 新增地点星级评价，支持平均分、评价数量、星级分布和文字评价；管理员可以删除不当评价
- 新增 UserCF 邻域模型、低秩隐因子模型和统一偏好矩阵，打卡与报名作为隐式正反馈参与推荐
- 新增协同过滤融合逻辑：UserCF 占 60%，低秩模型占 40%；信号不足时自动缩减权重或退出协同过滤项
- 新增 `POST /api/ai/places` 接口，并在 `DeepSeekService` 中补充地点推荐 Prompt、JSON 解析、Mock 生成和异常降级
- 扩展桌面端顶部导航和移动端底部 Tab，加入地图、活动及按角色显示的地点管理入口
- 地点库改为“内置地点 + 审核通过的自定义地点”，打卡记录增加历史/现代地点分类
- 新增坐标转换、活动/评价/地点提交/用户角色 Store，以及地点审核、活动和评价种子数据
- 新增 `leaflet`、`leaflet.markercluster`、`RoleSwitcher`、`StarRating` 等依赖与组件
- 更新 README，并新增推荐算法解析文档和红十字文化推荐算法研究论文稿
