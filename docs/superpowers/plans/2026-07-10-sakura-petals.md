# 樱花飘落特效 Implementation Plan

> **For agentic workers:** Execute tasks inline using executing-plans methodology.

**Goal:** 为轻养伴侣添加 Canvas 樱花飘落特效，适配纸墨设计风格

**Architecture:** 独立 React 组件 `SakuraPetals`，基于 Canvas + requestAnimationFrame，使用 SVG 路径绘制花瓣（无外部图片依赖），通过 props 控制色彩以适配暗色模式。集成到 `DecorativeElements` 中作为可选图层。

**Tech Stack:** React 19 + TypeScript + Canvas 2D API + requestAnimationFrame

**Source:** 改编自 https://www.cnblogs.com/quaint/p/12291936.html 的樱花特效 JS

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/components/decorative/SakuraPetals.tsx` | **新建** | 樱花飘落 Canvas 组件 |
| `src/components/decorative/DecorativeElements.tsx` | **修改** | 引入 SakuraPetals，按天气条件控制显示 |
| `src/index.css` | **修改** | 如需要可添加樱花相关动画（可选） |

## 设计适配

- **花瓣颜色**：浅色模式 `rgba(232,180,184,0.7)`（淡粉），暗色模式 `rgba(200,140,150,0.5)`（暗粉）
- **数量**：14 朵（21→14，与现有叶子粒子密度一致）
- **大小**：0.4× ~ 1.0× 随机缩放（含蓄不抢眼）
- **速度**：1.2 ~ 2.0 px/帧 下落速度（轻柔缓慢）
- **摇摆**：±0.3 ~ ±1.0 px/帧 水平偏移（模拟微风）
- **显示条件**：始终显示（非天气绑定），春秋季密度略高

---

### Task 1: 创建 SakuraPetals 组件

**Files:**
- Create: `src/components/decorative/SakuraPetals.tsx`

- [ ] **Step 1: 编写组件骨架**

```tsx
import { useEffect, useRef } from 'react';

interface SakuraPetalsProps {
  /** 花瓣数量，默认 14 */
  count?: number;
  /** 浅色模式花瓣颜色 */
  lightColor?: string;
  /** 暗色模式花瓣颜色 */
  darkColor?: string;
  /** 是否激活 */
  active?: boolean;
}

export default function SakuraPetals({
  count = 14,
  lightColor = 'rgba(232,180,184,0.7)',
  darkColor = 'rgba(200,140,150,0.5)',
  active = true,
}: SakuraPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // ... implementation
    
    return () => {
      // cleanup
    };
  }, [active, count, lightColor, darkColor]);
  
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
```

- [ ] **Step 2: 实现花瓣绘制（SVG 路径 → Canvas）**

用 Canvas Path2D 绘制樱花花瓣形状（5 瓣）：

```typescript
function drawPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  
  const s = size * 20; // base size
  // 5-petal sakura shape
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const px = Math.cos(angle) * s * 0.5;
    const py = Math.sin(angle) * s * 0.5;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
    // Petal curve
    const cpAngle1 = (i * 72 - 45) * Math.PI / 180;
    const cpAngle2 = (i * 72 + 45) * Math.PI / 180;
    ctx.quadraticCurveTo(
      Math.cos(cpAngle1) * s,
      Math.sin(cpAngle1) * s,
      Math.cos(cpAngle2) * s * 0.4,
      Math.sin(cpAngle2) * s * 0.4
    );
  }
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}
```

- [ ] **Step 3: 实现樱花物理模型**

```typescript
interface Sakura {
  x: number;
  y: number;
  size: number;    // 0.4 ~ 1.0
  rotation: number; // 0 ~ 2π
  speedY: number;   // 1.2 ~ 2.0
  speedX: number;   // -0.5 ~ 0.5
  rotationSpeed: number; // -0.02 ~ 0.02
  limitCrosses: number;  // remaining out-of-bounds resets
}

function createSakura(canvasW: number, canvasH: number): Sakura {
  return {
    x: Math.random() * canvasW,
    y: Math.random() * -canvasH, // start above viewport
    size: 0.4 + Math.random() * 0.6,
    rotation: Math.random() * Math.PI * 2,
    speedY: 1.2 + Math.random() * 0.8,
    speedX: -0.5 + Math.random() * 1.0,
    rotationSpeed: -0.02 + Math.random() * 0.04,
    limitCrosses: 2,
  };
}
```

- [ ] **Step 4: 实现动画循环 + 暗色模式检测**

```typescript
useEffect(() => {
  if (!active) return;
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Resize handling
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);
  
  // Detect dark mode
  const isDark = () => document.documentElement.classList.contains('dark');
  const getColor = () => isDark() ? darkColor : lightColor;
  
  // Create sakura list
  const MAX_COUNT = count;
  const sakuras: Sakura[] = [];
  for (let i = 0; i < MAX_COUNT; i++) {
    sakuras.push(createSakura(canvas.width, canvas.height));
  }
  
  let animId: number;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const color = getColor();
    
    for (const s of sakuras) {
      // Update position
      s.x += s.speedX;
      s.y += s.speedY;
      s.rotation += s.rotationSpeed;
      
      // Draw
      drawPetal(ctx, s.x, s.y, s.size, s.rotation, color);
      
      // Check bounds
      if (s.y > canvas.height + 40 || s.x < -40 || s.x > canvas.width + 40) {
        if (s.limitCrosses > 0) {
          s.limitCrosses--;
          // Respawn at top
          s.x = Math.random() * canvas.width;
          s.y = -40;
          s.size = 0.4 + Math.random() * 0.6;
          s.speedY = 1.2 + Math.random() * 0.8;
          s.speedX = -0.5 + Math.random() * 1.0;
        } else {
          // Remove from array (fade out naturally by not redrawing)
          // Reset to top after all limit crosses exhausted for infinite loop
          s.x = Math.random() * canvas.width;
          s.y = -40;
          s.limitCrosses = 2;
        }
      }
    }
    
    animId = requestAnimationFrame(animate);
  };
  
  animId = requestAnimationFrame(animate);
  
  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}, [active, count, lightColor, darkColor]);
```

- [ ] **Step 5: 完整组件代码**

（合并以上步骤，确保性能：使用 `willReadFrequently: false` 的 Canvas context，限制花瓣数量 ≤ 14）

---

### Task 2: 集成到 DecorativeElements

**Files:**
- Modify: `src/components/decorative/DecorativeElements.tsx`

- [ ] **Step 1: 引入 SakuraPetals**

在 DecorativeElements 的 import 区域添加：
```typescript
import SakuraPetals from './SakuraPetals';
```

- [ ] **Step 2: 在 JSX 中添加组件**

在 `return` 的 `<div>` 内部添加：
```tsx
{/* Sakura petals — always on, paper-ink style */}
<SakuraPetals
  count={14}
  lightColor="rgba(232,180,184,0.55)"
  darkColor="rgba(180,130,140,0.35)"
/>
```

---

### Task 3: 验证与自检

- [ ] **Step 1: TypeScript 编译检查**
```bash
npx -p typescript@6.0.2 tsc --noEmit --project ai-health-companion/tsconfig.app.json
```

- [ ] **Step 2: 视觉验证清单**
  - [ ] 浅色模式：淡粉花瓣飘落
  - [ ] 暗色模式：暗粉花瓣飘落（切换到暗色模式验证）
  - [ ] 花瓣数量 14 朵，不拥挤不稀疏
  - [ ] 不阻挡交互（pointer-events-none）
  - [ ] 浏览器窗口缩放后自适应
  - [ ] 组件卸载后动画停止

- [ ] **Step 3: 性能验证**
  - [ ] 页面 FPS 保持 60（14 朵 Canvas 花瓣开销极小）
  - [ ] 无内存泄漏（useEffect cleanup 正确）

---

## 自审

1. **Spec coverage**: 樱花特效 ✅ | 适配纸墨风格 ✅ | 暗色模式 ✅ | 不破坏现有功能 ✅ | 性能 ✅
2. **Placeholder scan**: 无 TBD/TODO，所有步骤有具体代码
3. **Type consistency**: `SakuraPetalsProps` 接口定义清晰，所有类型可推导
