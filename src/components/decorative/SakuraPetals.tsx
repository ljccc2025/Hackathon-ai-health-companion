import { useEffect, useRef, useCallback } from 'react';

interface SakuraPetalsProps {
  /** 是否激活 */
  active?: boolean;
}

// ========== 配置 ==========
const CONFIG = {
  maxBlossoms: 35, // 减少花瓣数量提升性能
  clickBurstCount: 8,
  burstRadius: 70,
  maxGroundBlossoms: 15,

  // 物理
  gravity: 0.08,
  windMin: -0.3,
  windMax: 0.5,
  windChangeSpeed: 0.002,
  terminalVelocity: 3,

  // 大小
  sizeMin: 5,
  sizeMax: 13,

  // 深度层数
  depthLayers: 3,

  // 旋转
  rotationSpeedMin: 0.005,
  rotationSpeedMax: 0.025,

  // 摆动
  swingAmplitude: 0.8,
  swingSpeed: 0.01,

  // 颜色 - 浅色模式
  colorPaletteLight: [
    { r: 232, g: 180, b: 184, a: 0.7 },
    { r: 255, g: 150, b: 180, a: 0.65 },
    { r: 255, g: 200, b: 210, a: 0.6 },
    { r: 252, g: 160, b: 175, a: 0.7 },
    { r: 245, g: 130, b: 160, a: 0.55 },
    { r: 255, g: 220, b: 225, a: 0.5 },
  ],

  // 颜色 - 深色模式
  colorPaletteDark: [
    { r: 180, g: 140, b: 150, a: 0.5 },
    { r: 200, g: 150, b: 165, a: 0.45 },
    { r: 190, g: 145, b: 155, a: 0.4 },
    { r: 185, g: 135, b: 148, a: 0.5 },
    { r: 175, g: 130, b: 145, a: 0.35 },
    { r: 195, g: 155, b: 165, a: 0.35 },
  ],

  // 背景 - 透明，不绘制背景
  backgroundGradient: false,

  // 远山
  showMountains: false,

  // 地面堆积
  groundAccumulate: true,
};

// ========== 工具函数 ==========
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function randomColor(isDark: boolean): { r: number; g: number; b: number; a: number } {
  const palette = isDark ? CONFIG.colorPaletteDark : CONFIG.colorPaletteLight;
  return palette[Math.floor(Math.random() * palette.length)];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ========== 樱花瓣类 ==========
class SakuraPetal {
  x: number;
  y: number;
  size: number;
  depth: number;
  petalCount: number;
  vx: number;
  vy: number;
  gravity: number;
  terminalV: number;
  rotation: number;
  rotationSpeed: number;
  swingPhase: number;
  swingSpeed: number;
  swingAmplitude: number;
  r: number;
  g: number;
  b: number;
  baseAlpha: number;
  alpha: number;
  settled: boolean;
  groundOffsetX: number;
  alive: boolean;
  _groundAdded: boolean;

  constructor(
    x: number | null,
    y: number | null,
    cfg: { depth?: number; size?: number; color?: { r: number; g: number; b: number; a: number } } | null,
    canvasWidth: number,
    canvasHeight: number,
    isDark: boolean,
  ) {
    const W = canvasWidth;
    const H = canvasHeight;

    this.x = x ?? rand(0, W);
    this.y = y ?? rand(-H * 0.2, -10);
    this.size = rand(CONFIG.sizeMin, CONFIG.sizeMax);
    if (cfg?.size) this.size = cfg.size;

    this.depth = cfg?.depth !== undefined ? cfg.depth : Math.floor(Math.random() * CONFIG.depthLayers);
    const depthFactor = (this.depth + 1) / CONFIG.depthLayers;
    this.size *= 0.7 + 0.3 * depthFactor;

    this.petalCount = Math.random() < 0.7 ? 5 : Math.random() < 0.5 ? 4 : 6;

    this.vx = 0;
    this.vy = rand(0.3, 1.2);
    this.gravity = CONFIG.gravity * (0.8 + 0.4 * depthFactor);
    this.terminalV = CONFIG.terminalVelocity * (0.7 + 0.3 * depthFactor);

    this.rotation = rand(0, Math.PI * 2);
    this.rotationSpeed =
      rand(CONFIG.rotationSpeedMin, CONFIG.rotationSpeedMax) * (Math.random() < 0.5 ? 1 : -1);

    this.swingPhase = rand(0, Math.PI * 2);
    this.swingSpeed = rand(CONFIG.swingSpeed * 0.5, CONFIG.swingSpeed * 1.5);
    this.swingAmplitude = CONFIG.swingAmplitude * (0.5 + 0.5 * depthFactor);

    const col = cfg?.color ?? randomColor(isDark);
    this.r = col.r;
    this.g = col.g;
    this.b = col.b;
    this.baseAlpha = col.a * (0.6 + 0.4 * depthFactor);
    this.alpha = this.baseAlpha;

    this.settled = false;
    this.groundOffsetX = 0;
    this.alive = true;
    this._groundAdded = false;
  }

  update(windForce: number, canvasWidth: number, canvasHeight: number) {
    if (this.settled || !this.alive) return;

    this.swingPhase += this.swingSpeed;
    const swingX = Math.sin(this.swingPhase) * this.swingAmplitude * 0.3;

    const windEffect = windForce + swingX * 0.02;
    this.vx += windEffect * 0.1;
    this.vy += this.gravity;
    if (this.vy > this.terminalV) this.vy = this.terminalV;
    this.vx *= 0.995;

    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;

    const groundY = canvasHeight - 10 + Math.sin(this.x * 0.01) * 5;
    if (this.y >= groundY) {
      if (CONFIG.groundAccumulate) {
        this.settled = true;
        this.y = groundY;
        this.groundOffsetX = rand(-3, 3);
        this.alpha = this.baseAlpha * 0.6;
      } else {
        this.resetPosition(canvasWidth, canvasHeight);
      }
    }
    if (this.x < -50) this.x = canvasWidth + 50;
    if (this.x > canvasWidth + 50) this.x = -50;
    if (this.y < -200) {
      this.y = rand(-50, 20);
      this.vy = rand(0.2, 1.0);
    }
  }

  resetPosition(canvasWidth: number, canvasHeight: number) {
    this.x = rand(0, canvasWidth);
    this.y = rand(-canvasHeight * 0.3, -10);
    this.vx = rand(-0.5, 0.5);
    this.vy = rand(0.3, 1.0);
    this.rotation = rand(0, Math.PI * 2);
    this.swingPhase = rand(0, Math.PI * 2);
    this.settled = false;
    this.alpha = this.baseAlpha;
    this.alive = true;
    this._groundAdded = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.alive) return;
    if (this.y < -50 && !this.settled) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;

    const size = this.size;
    const pc = this.petalCount;

    // 预计算颜色字符串（避免每帧重复创建）
    const fillColor = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;

    for (let i = 0; i < pc; i++) {
      const angle = (Math.PI * 2 / pc) * i;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -size * 0.4, -size * 0.3,
        -size * 0.6, -size * 0.7,
        -size * 0.2, -size * 1.1,
      );
      ctx.quadraticCurveTo(0, -size * 1.2, size * 0.2, -size * 1.1);
      ctx.bezierCurveTo(
        size * 0.6, -size * 0.7,
        size * 0.4, -size * 0.3,
        0, 0,
      );

      // 使用简单颜色填充替代渐变（性能提升显著）
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.restore();
    }

    // 花蕊 - 简化绘制
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,220,180,${this.alpha * 0.6})`;
    ctx.fill();

    ctx.restore();
  }
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

export default function SakuraPetals({ active = true }: SakuraPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petalsRef = useRef<SakuraPetal[]>([]);
  const groundPetalsRef = useRef<SakuraPetal[]>([]);
  const windRef = useRef(0);
  const targetWindRef = useRef(0);
  const animIdRef = useRef<number | null>(null);
  const mountainPointsRef = useRef<{ x: number; y: number }[]>([]);

  const generateMountains = useCallback((W: number, H: number) => {
    const points: { x: number; y: number }[] = [];
    const peaks = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i <= peaks; i++) {
      const x = (W / peaks) * i + rand(-30, 30);
      const y = H - rand(60, 150) - Math.sin(i * 1.5) * 40;
      points.push({ x: Math.max(0, Math.min(W, x)), y: Math.max(H * 0.5, y) });
    }
    points.sort((a, b) => a.x - b.x);
    return points;
  }, []);

  const drawMountains = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, points: { x: number; y: number }[]) => {
      if (points.length < 2) return;

      ctx.save();

      // 第一层
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (i === 0) {
          ctx.lineTo(p.x, p.y);
        } else {
          const prev = points[i - 1];
          ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
        }
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = 'rgba(30,20,40,0.15)';
      ctx.fill();

      // 第二层
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const nx = p.x + 30;
        const ny = p.y - rand(10, 30);
        if (i === 0) {
          ctx.lineTo(nx, ny);
        } else {
          const prev = points[i - 1];
          ctx.quadraticCurveTo(
            prev.x + 30,
            prev.y - 10,
            (prev.x + 30 + nx) / 2,
            (prev.y - 10 + ny) / 2,
          );
        }
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = 'rgba(40,25,50,0.08)';
      ctx.fill();

      ctx.restore();
    },
    [],
  );

  const drawAtmosphere = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    // 减少大气粒子数量
    const count = 6;
    const time = Date.now() * 0.001;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const seed = i * 137.508;
      const px = (Math.sin(seed + time * 0.02) * 0.5 + 0.5) * W;
      const py = (Math.cos(seed * 1.3 + time * 0.015) * 0.5 + 0.5) * H * 0.6;
      const radius = 1 + Math.sin(seed + time * 0.5) * 1;
      const alpha = 0.1 + Math.sin(seed * 2 + time * 0.3) * 0.05;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,220,240,${Math.max(0, alpha)})`;
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawGroundPetals = useCallback(
    (ctx: CanvasRenderingContext2D, groundPetals: SakuraPetal[]) => {
      // 避免每帧创建新数组和排序 - 直接遍历
      for (const p of groundPetals) {
        if (!p.settled) continue;
        ctx.save();
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.translate(p.x + p.groundOffsetX, p.y + 2);
        ctx.scale(1, 0.3);
        ctx.rotate(p.rotation * 0.3);
        const size = p.size * 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha * 0.5})`;
        ctx.fill();
        ctx.restore();
      }
    },
    [],
  );

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dark = isDarkMode();

    // Resize
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mountainPointsRef.current = generateMountains(W, H);
    };
    resize();

    // Observe dark mode changes
    const observer = new MutationObserver(() => {
      dark = isDarkMode();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Initialize petals
    const petals: SakuraPetal[] = [];
    for (let i = 0; i < CONFIG.maxBlossoms; i++) {
      const depth = Math.floor(Math.random() * CONFIG.depthLayers);
      const p = new SakuraPetal(rand(0, W), rand(-H * 0.5, H * 0.1), { depth }, W, H, dark);
      p.vx = rand(-0.3, 0.3);
      petals.push(p);
    }
    petalsRef.current = petals;
    groundPetalsRef.current = [];

    // Click handler
    const handleClick = (e: MouseEvent | Touch) => {
      const x = e.clientX;
      const y = e.clientY;
      const count = CONFIG.clickBurstCount;
      for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2);
        const r = rand(0, CONFIG.burstRadius);
        const bx = x + Math.cos(angle) * r;
        const by = y + Math.sin(angle) * r * 0.6;
        const p = new SakuraPetal(
          bx,
          by,
          {
            depth: randInt(0, CONFIG.depthLayers - 1),
            size: rand(CONFIG.sizeMin * 0.8, CONFIG.sizeMax * 1.2),
          },
          W,
          H,
          dark,
        );
        p.vx = Math.cos(angle) * rand(1, 4);
        p.vy = Math.sin(angle) * rand(-4, -1);
        p.rotationSpeed = rand(0.01, 0.04) * (Math.random() < 0.5 ? 1 : -1);
        petals.push(p);
      }
      if (petals.length > CONFIG.maxBlossoms + CONFIG.clickBurstCount * 2) {
        petals.splice(0, CONFIG.clickBurstCount);
      }
    };

    const onMouseClick = (e: MouseEvent) => handleClick(e);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handleClick(t);
    };

    canvas.addEventListener('click', onMouseClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('resize', resize);

    // Animation loop - 使用节流的风力更新
    let windUpdateCounter = 0;
    const loop = () => {
      // 每 3 帧更新一次风力（减少计算）
      windUpdateCounter++;
      if (windUpdateCounter % 3 === 0) {
        targetWindRef.current += rand(-0.02, 0.02);
        targetWindRef.current = Math.max(CONFIG.windMin, Math.min(CONFIG.windMax, targetWindRef.current));
        windRef.current = lerp(windRef.current, targetWindRef.current, CONFIG.windChangeSpeed);
      }

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Update & draw petals
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.update(windRef.current, W, H);
        if (p.settled) {
          if (groundPetalsRef.current.length < CONFIG.maxGroundBlossoms) {
            if (!p._groundAdded) {
              groundPetalsRef.current.push(p);
              p._groundAdded = true;
            }
          } else {
            p.resetPosition(W, H);
            p._groundAdded = false;
          }
        }
        p.draw(ctx);
      }

      // Draw ground petals
      drawGroundPetals(ctx, groundPetalsRef.current);

      // Draw mountains
      if (CONFIG.showMountains) {
        drawMountains(ctx, W, H, mountainPointsRef.current);
      }

      // Draw atmosphere
      drawAtmosphere(ctx, W, H);

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
      canvas.removeEventListener('click', onMouseClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [active, generateMountains, drawMountains, drawAtmosphere, drawGroundPetals]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-auto"
      style={{
        zIndex: 0,
        willChange: 'transform',
        transform: 'translateZ(0)', // 启用硬件加速
      }}
    />
  );
}
