# 轻养伴侣（Light Nurture Companion）

> 今天不用一下子变得很健康。先从一口水、一次起身、一次深呼吸开始。

**轻养伴侣** 是一个 AI 驱动的温柔健康微习惯 PWA 应用，帮助你用最低的阻力照顾好自己——不追求完美，只在意"今天做了一点点"。

***

## 功能概览

| 模块       | 说明                                     |
| -------- | -------------------------------------- |
| **今日照顾** | 当日入口：喝水、起身、情绪安放和今日回顾聚合在一个轻量面板          |
| **身体补给** | 饮水记录 + 饮水热力图 + 药品提醒小纸条 + 经期追踪 + 轻零食记录  |
| **活动一下** | 久坐起身计时器 + 走路计时 + 微运动引导 + 呼吸练习 + 白噪音    |
| **情绪安放** | 情绪性进食记录 + AI 树洞陪伴 + 每日情绪趋势             |
| **今日回顾** | 睡眠质量 + 每日总结 + 日记 + 小贴纸成就墙 + AI 温柔语录收藏  |
| **数据洞察** | 饮水热力图 / 情绪趋势 / 周报 / 月记 / 健康快照 / BMI 指数 |

### AI 能力

- **AI 问候**：根据时段（清晨/午间/傍晚/深夜）和天气生成温柔问候 + 微行动建议
- **情绪食物建议**：识别情绪性进食信号，给出 AI 陪伴式建议
- **树洞陪伴**：承接负面情绪文本，返回温柔回应（不做诊断）
- **每日诗词**：结合天气和近期心情生成一首小诗
- **周报告**：汇总本周喝水/起身/情绪数据，生成 AI 综评
- **轻零食洞察**：分析零食记录的 batch 模式
- **BMI 建议**：根据身高体重和生活习惯生成健康分析建议
- **自定义提醒**：可配置的温和提醒语

### 交互体验

- 季节色彩微调 + 时段环境光氛围
- Framer Motion 纸张翻页过渡动画
- 小猫陪伴角色的随机动画和交互
- 成就里程碑弹窗（7天/30天/100天/365天）

***

## 技术栈

| 层级    | 技术                            | 用途                 |
| ----- | ----------------------------- | ------------------ |
| 框架    | React 19                      | UI                 |
| 语言    | TypeScript 6.0                | 全量类型覆盖             |
| 构建    | Vite 8                        | 开发和构建              |
| 样式    | Tailwind CSS 4.3              | 原子化 CSS            |
| 动画    | Framer Motion 12              | 页面过渡 + 微动效         |
| 状态    | Zustand 5                     | 全局状态管理             |
| 离线存储  | Dexie 4 (IndexedDB)           | 所有健康数据离线优先存储       |
| 图标    | Lucide React                  | 轻量图标组件             |
| PWA   | vite-plugin-pwa + Workbox     | 可安装到桌面 + 离线缓存      |
| 后端    | Hono 4 + tsx (Node.js)        | BFF API 层，代理 AI 调用 |
| AI 接口 | OpenAI 兼容格式                   | 默认对接 DeepSeek，可切换  |
| 代码检查  | ESLint 10 + typescript-eslint | 代码质量               |

### 本地数据表

项目使用 IndexedDB（Dexie）管理 11 张离线数据表：

`hydration` / `standup` / `emotionFood` / `medicine` / `moodTreeHole` / `sticker` / `gentleQuote` / `cycleRecord` / `snack` / `specialDate` / `sleep`

### 安全设计

- **内容安全管线**：AI 返回内容经过 `safetyGuard` 过滤，拦截医疗建议和自伤倾向内容
- **隐私控制面板**：用户可按数据类型控制是否上传给 AI（情绪/树洞/健康等分类开关）
- **离线兜底**：AI 不可用时自动回退到本地模板文案（`templateFallback.ts`）
- **安全声明**：页面底部常驻医疗免责声明，强调"本应用不提供医疗建议"

***

## 项目结构

```
ai-health-companion/
├── api/                    # Hono BFF API 后端
│   ├── _shared/            # AI 模型调用 / 输出安全 / Prompt 构建
│   ├── ai/                 # 各 AI 端点路由（8 个）
│   │   ├── reminder.ts     #   自定义提醒
│   │   ├── emotion-food.ts #   情绪食物建议
│   │   ├── greeting.ts     #   时段问候
│   │   ├── mood-tree-hole.ts # 树洞陪伴
│   │   ├── weekly-report.ts  # 周报告
│   │   ├── snack-insight.ts  # 零食洞察
│   │   ├── snack-batch.ts    # 零食批量洞察
│   │   └── daily-poem.ts     # 每日诗词
│   └── server.ts           # API 服务入口（端口 8787）
├── src/
│   ├── components/         # React 组件
│   │   ├── breathing/      #   呼吸练习组件
│   │   ├── cards/          #   各功能卡片（28 个）
│   │   ├── decorative/     #   装饰组件（小猫/光标/装饰元素等）
│   │   ├── layout/         #   布局组件（底部导航/错帧动画/错误边界）
│   │   ├── settings/       #   设置组件（隐私面板/语调控件）
│   │   └── ui/             #   UI 基元（天气徽章/主题切换/导航胶囊）
│   ├── data/               # 静态数据
│   │   ├── modules.ts      #   6 个功能模块配置
│   │   └── greetings/      #   按时段分组的本地标语
│   ├── hooks/              # 自定义 Hooks（12 个）
│   ├── services/           # 业务逻辑层（AI 客户端/离线检测/安全过滤/模板兜底）
│   ├── store/              # 状态管理（Zustand + Dexie，12 个 store）
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 主应用入口
│   └── main.tsx            # React 挂载点
├── public/                 # 静态资源（小猫视频/SVG/离线页）
├── index.html              # HTML 入口
├── vite.config.ts          # Vite + Tailwind + PWA 配置
├── tsconfig*.json          # TypeScript 配置
├── package.json            # 依赖和脚本
└── .env.local              # 环境变量（AI 密钥等）
```

***

## 快速开始

### 前提条件

- Node.js >= 18
- 一个 DeepSeek（或其他 OpenAI 兼容）的 API Key（需要去官网获取）

### 1. 安装依赖

```bash
cd ai-health-companion
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

然后编辑 `.env.local`，将 `AI_API_KEY` 替换为你的 DeepSeek API Key（或任意 OpenAI 兼容服务的 Key）。

### 3. 启动开发环境

```bash
# 终端 1：启动前端开发服务器（端口 5173）
npm run dev

# 终端 2：启动 API 服务器（端口 8787）
npm run dev:api
```

### 4. 构建生产版本

```bash
npm run build
```

## 设计理念

- **最小阻力**：每个操作不超过 30 秒——记录喝水一次点击，记录起身一次点击
- **温柔不push**：不设打卡 KPI，不弹警告通知，不提供医疗建议
- **AI 做陪伴，不做医生**：所有 AI 输出经过安全管道过滤，强调"建议而非诊断"
- **离线优先**：所有健康数据存储在本地 IndexedDB，不上传服务器；AI 功能可选择性关闭
- **隐私可控**：用户可按数据类型选择是否与 AI 共享

***

## 许可证

MIT
