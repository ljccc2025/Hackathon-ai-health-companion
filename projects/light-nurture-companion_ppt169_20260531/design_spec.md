# light-nurture-companion - Design Spec

> Human-readable design narrative. Machine-readable execution contract in `spec_lock.md`.

## I. Project Information

| Item | Value |
| ---- | ----- |
| **Project Name** | light-nurture-companion |
| **Canvas Format** | PPT 16:9 (1280×720) |
| **Page Count** | 17 |
| **Design Style** | General Versatile |
| **Target Audience** | 毕业答辩评审老师 |
| **Use Case** | 毕业设计答辩 — AI 健康微习惯产品展示 |
| **Created Date** | 2026-05-31 |

---

## II. Canvas Specification

| Property | Value |
| -------- | ----- |
| **Format** | PPT 16:9 |
| **Dimensions** | 1280×720 |
| **viewBox** | `0 0 1280 720` |
| **Margins** | left/right 60px, top/bottom 50px |
| **Content Area** | 1160×620 (after margins) |

---

## III. Visual Theme

### Theme Style

- **Style**: General Versatile
- **Theme**: Light theme (with dark cover/ending pages)
- **Tone**: 温暖、自然、学术、专业 — "纸墨手帐"东方美学

### Color Scheme

| Role | HEX | Purpose |
| ---- | --- | ------- |
| **Background** | `#FDFCF9` | 主页面背景（宣纸暖白） |
| **Secondary bg** | `#F4F7F5` | 卡片背景、区块背景 |
| **Primary** | `#498268` | 标题装饰、重点标记、图标 |
| **Accent** | `#F5973B` | 数据高亮、活动模块强调 |
| **Secondary accent** | `#D85C7E` | 情绪模块、安全标注 |
| **Body text** | `#1C3A2C` | 正文文字（墨绿深色） |
| **Secondary text** | `#6D9C83` | 说明文字、注释 |
| **Tertiary text** | `#9BBBA8` | 辅助信息 |
| **Border/divider** | `#E5D9C3` | 卡片边框、分割线 |
| **Dark bg** | `#1C3A2C` | 封面/致谢深色背景 |
| **Dark text** | `#FDFCF9` | 深色背景上的文字 |
| **Success** | `#498268` | 完成状态 |
| **Warning** | `#F5973B` | 安全提示 |

---

## IV. Typography System

### Font Plan

**Typography direction**: 现代 CJK 无衬线

| Role | Chinese | English | Fallback tail |
| ---- | ------- | ------- | ------------- |
| **Title** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Body** | `"Microsoft YaHei", "PingFang SC"` | `Arial` | `sans-serif` |
| **Emphasis** | same as Body | — | — |
| **Code** | — | `Consolas, "Courier New"` | `monospace` |

**Per-role font stacks**:
- Title: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`
- Body: `"Microsoft YaHei", "PingFang SC", Arial, sans-serif`
- Emphasis: same as Body
- Code: `Consolas, "Courier New", monospace`

### Font Size Hierarchy

**Baseline**: Body font size = 18px

| Purpose | Ratio to body | Value (body=18) | Weight |
| ------- | ------------- | --------------- | ------ |
| Cover title | 2.5-5x | 48-90px | Bold |
| Page title | 1.5-2x | 28-36px | Bold |
| Subtitle | 1.2-1.5x | 22-27px | Regular |
| **Body content** | **1x** | **18px** | Regular |
| Annotation / caption | 0.7-0.85x | 13-15px | Regular |
| Page number / footnote | 0.5-0.65x | 10-12px | Regular |

---

## V. Layout Principles

### Page Structure

- **Header area**: Title at top-left (or center for cover/ending), 60-80px from top
- **Content area**: Flexible, driven by page content density
- **Footer area**: Page number at bottom-right, 10pt, color `#C4D6CC`

### Layout Pattern Library

| Pattern | Used On |
| ------- | ------- |
| **Single column centered** | P01 Cover, P17 Thank You |
| **Symmetric split (5:5)** | P16 Summary vs Outlook |
| **Asymmetric split (3:7)** | P03 Pain points (left text, right image placeholder) |
| **Three-column cards** | P04 Core concepts (1×3) |
| **2×3 card grid** | P05 Six modules overview |
| **Asymmetric split (6:4)** | P06-P11 Module detail pages (left text, right screenshot) |
| **Top-bottom split** | P12 Tech architecture (3 layers stacked) |
| **2×2 matrix grid** | P13 Security four layers |
| **Top colors + bottom list** | P14 Design language |
| **Data table + principle cards** | P15 Data model |
| **Full-bleed dark** | P01 Cover, P17 Thank You |

### Spacing Specification

**Universal**:

| Element | Value |
| ------- | ----- |
| Safe margin from canvas edge | 60px |
| Content block gap | 28px |
| Icon-text gap | 12px |

**Card-based layouts**:

| Element | Value |
| ------- | ----- |
| Card gap | 24px |
| Card padding | 24px |
| Card border radius | 12px |

---

## VI. Icon Usage Specification

### Source
- **Built-in icon library**: `templates/icons/tabler-filled/`
- **Usage method**: `{{icon:tabler-filled/icon-name}}`

### Icon Inventory

| Purpose | Icon Path | Used On |
| ------- | --------- | ------- |
| 今日照顾 | `{{icon:tabler-filled/home}}` | P05, P06 |
| 身体补给 | `{{icon:tabler-filled/droplet}}` | P05, P07 |
| 活动一下 | `{{icon:tabler-filled/man}}` | P05, P08 |
| 情绪安放 | `{{icon:tabler-filled/mood-smile}}` | P05, P09 |
| 今日回顾 | `{{icon:tabler-filled/book}}` | P05, P10 |
| 数据洞察 | `{{icon:tabler-filled/chart-area}}` | P05, P11 |
| 健康/关怀 | `{{icon:tabler-filled/heart}}` | P04 |
| 安全 | `{{icon:tabler-filled/shield}}` | P04, P13 |
| 隐私/锁定 | `{{icon:tabler-filled/lock}}` | P04, P13 |
| 数据存储 | `{{icon:tabler-filled/database}}` | P12, P15 |
| 设计/调色 | `{{icon:tabler-filled/palette}}` | P14 |
| 成就/亮点 | `{{icon:tabler-filled/star}}` | P10 |
| 完成/检查 | `{{icon:tabler-filled/check}}` | P16 |
| 自然/微习惯 | `{{icon:tabler-filled/leaf}}` | P04 |
| 太阳 | `{{icon:tabler-filled/sun}}` | P06 |
| 月亮/睡眠 | `{{icon:tabler-filled/moon}}` | P08, P10 |
| AI对话 | `{{icon:tabler-filled/message}}` | P06 |
| 语录 | `{{icon:tabler-filled/quote}}` | P10 |
| 猫咪 | `{{icon:tabler-filled/paw}}` | P06 |
| 洞察/可视 | `{{icon:tabler-filled/eye}}` | P11 |
| 快照/导出 | `{{icon:tabler-filled/camera}}` | P11 |
| 移动端 | `{{icon:tabler-filled/phone}}` | P12 |
| 提醒/时钟 | `{{icon:tabler-filled/clock}}` | P07 |
| 用药 | `{{icon:tabler-filled/pill}}` | P07 |
| 睡眠 | `{{icon:tabler-filled/bed}}` | P10 |
| 情绪/闪耀 | `{{icon:tabler-filled/sparkles}}` | P09 |
| 下载 | `{{icon:tabler-filled/download}}` | P11 |
| 日历/周期 | `{{icon:tabler-filled/calendar}}` | P07 |
| 建筑/架构 | `{{icon:tabler-filled/presentation}}` | P12 |
| 灯泡/理念 | `{{icon:tabler-filled/bulb}}` | P04 |
| 花朵 | `{{icon:tabler-filled/flower}}` | P14 |
| 日落 | `{{icon:tabler-filled/sunset}}` | P08 |
| 铃铛/通知 | `{{icon:tabler-filled/bell}}` | P07 |
| 用户 | `{{icon:tabler-filled/user}}` | P13 |

---

## VII. Visualization Reference List

| Visualization Type | Reference Template | Used In |
| ------------------ | ------------------ | ------- |
| icon_grid | `templates/charts/icon_grid.svg` | P05 (six modules overview) |
| process_flow | `templates/charts/process_flow.svg` | P13 (security pipeline) |
| vertical_list | `templates/charts/vertical_list.svg` | P03 (pain points) |

---

## VIII. Image Resource List

| Filename | Dimensions | Ratio | Purpose | Type | Status | Generation Description |
| -------- | --------- | ----- | ------- | ---- | ------ | --------------------- |
| screenshot_home.png | 400×720 | 0.56 | 应用首页截图占位 | Placeholder | Placeholder | Mobile app screenshot showing greeting and cat companion |
| screenshot_water.png | 400×720 | 0.56 | 喝水记录截图占位 | Placeholder | Placeholder | Mobile app screenshot showing water tracking UI |
| screenshot_breathing.png | 400×720 | 0.56 | 呼吸圆环截图占位 | Placeholder | Placeholder | Mobile app screenshot showing breathing circle animation |
| screenshot_treehole.png | 400×720 | 0.56 | 情绪树洞截图占位 | Placeholder | Placeholder | Mobile app screenshot showing mood tree hole interface |

---

## IX. Content Outline

### Part 1: Opening

#### P01 - Cover (封面)
- **Layout**: Full-bleed dark background, single column centered
- **Title**: 轻养伴侣
- **Subtitle**: AI 温柔健康微习惯助手
- **Tagline**: 今天不用一下子变得很健康。先从一口水、一次起身、一次深呼吸开始。
- **Info**: 导师：______ / 答辩人：______ / 2026年5月

#### P02 - Table of Contents (目录)
- **Layout**: Left-aligned numbered list with right decorative element
- **Title**: 目录
- **Content**: 9目录项（项目背景→总结展望）

### Part 2: Background & Positioning

#### P03 - Pain Points (项目背景与痛点)
- **Layout**: Asymmetric split (left 60% text cards, right 40% placeholder)
- **Title**: 为什么需要「轻养伴侣」？
- **Visualization**: vertical_list
- **Content**: 5个痛点卡片，左侧色条区分

#### P04 - Product Positioning (产品定位与核心理念)
- **Layout**: Three-column cards + bottom tagline
- **Title**: 不是教练，是陪伴
- **Content**: 4个核心理念卡片（微习惯/纸墨美学/安全边界/隐私优先）+ 品牌标语

### Part 3: Module Overview

#### P05 - Six Modules Overview (六大功能模块总览)
- **Layout**: 2×3 card grid
- **Title**: 六大模块，温柔覆盖每一天
- **Visualization**: icon_grid
- **Content**: 6个模块卡片（今日照顾/身体补给/活动一下/情绪安放/今日回顾/数据洞察）

### Part 4: Module Details

#### P06 - Module 1: Today (今日照顾)
- **Layout**: Asymmetric split (left 55% text, right 45% screenshot placeholder)
- **Title**: 今日照顾 — 一切从这一页开始
- **Content**: 4个功能要点 + 技术标签

#### P07 - Module 2: Hydration (身体补给)
- **Layout**: Asymmetric split (left 55% text, right 45% screenshot placeholder)
- **Title**: 身体补给 — 轻轻照顾身体
- **Content**: 5个功能要点 + 底部安全提示条

#### P08 - Module 3: Movement (活动一下)
- **Layout**: Asymmetric split (left 55% text, right 45% screenshot placeholder)
- **Title**: 活动一下 — 从久坐里把自己捞出来
- **Content**: 5个功能要点 + 呼吸法说明卡片

#### P09 - Module 4: Emotion (情绪安放) ⭐ Key Page
- **Layout**: Asymmetric split (left 55% text, right 45% screenshot placeholder)
- **Title**: 情绪安放 — 先接住感受，再慢慢决定要不要行动
- **Content**: 5个功能要点 + 安全设计高亮卡片

#### P10 - Module 5: Review (今日回顾)
- **Layout**: Asymmetric split (left 55% text, right 45% sticker wall)
- **Title**: 今日回顾 — 把照顾自己的瞬间收起来
- **Content**: 5个功能要点 + 6张贴纸展示

#### P11 - Module 6: Insight (数据洞察)
- **Layout**: Asymmetric split (left 55% text, right 45% visual previews)
- **Title**: 数据洞察 — 温柔地看见自己的痕迹
- **Content**: 5个功能要点 + 热力图/快照预览 + 金句

### Part 5: Technical Deep Dive

#### P12 - Technical Architecture (技术架构)
- **Layout**: Top-bottom split: 3-layer architecture diagram + tech tags
- **Title**: 技术栈与系统架构
- **Content**: 三层架构（前端/数据/AI后端）+ 7-8个技术标签

#### P13 - Security & Privacy (安全与隐私设计)
- **Layout**: Top process flow + bottom 2×2 card grid
- **Title**: 安全边界与隐私保护
- **Visualization**: process_flow
- **Content**: 安全管线流程 + 四层安全机制卡片

#### P14 - Design Language (设计语言与交互体验)
- **Layout**: Top color swatches + bottom numbered list
- **Title**: 纸墨手帐 — 一种温柔的设计语言
- **Content**: 4个色彩圆块 + 6个交互亮点

#### P15 - Data Model (数据模型与本地存储)
- **Layout**: Data table + bottom principle cards
- **Title**: 本地优先的数据架构
- **Content**: 11张表 + 3个数据原则

### Part 6: Closing

#### P16 - Summary & Outlook (项目总结与展望)
- **Layout**: Symmetric split (left completed, right outlook) + bottom golden quote
- **Title**: 温柔的力量 — 总结与展望
- **Content**: 6项已完成 + 5项未来展望 + 金句

#### P17 - Thank You (致谢)
- **Layout**: Full-bleed dark background, single column centered (mirror of P01)
- **Title**: 感谢聆听
- **Content**: 品牌标语 + 欢迎提问

---

## X. Speaker Notes Requirements

Generate corresponding speaker note files for each page, saved to `notes/` directory:

- **File naming**: `01_cover.md` through `17_thankyou.md`
- **Total presentation duration**: ~15 minutes
- **Notes style**: 正式答辩风格，每页一段话，~30-60秒
- **Content includes**: 本页核心要点总结、过渡语

---

## XI. Technical Constraints Reminder

### SVG Generation Must Follow:
1. viewBox: `0 0 1280 720`
2. Background uses `<rect>` elements
3. Text wrapping uses `<tspan>` (`<foreignObject>` FORBIDDEN)
4. Transparency uses `fill-opacity` / `stroke-opacity`; `rgba()` FORBIDDEN
5. FORBIDDEN: `mask`, `<style>`, `class`, `foreignObject`
6. FORBIDDEN: `textPath`, `animate*`, `script`
7. `<g opacity="...">` FORBIDDEN

### PPT Compatibility Rules:
- Inline styles only
- No external CSS or `@font-face`
- Font stacks must end with cross-platform pre-installed font
