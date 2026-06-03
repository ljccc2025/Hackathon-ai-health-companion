import { useEffect, useRef } from 'react';

interface Props {
  /** Theme color for the glow trail — changes per active module */
  tint?: string;
}

export default function CursorGlow({ tint = 'rgba(78,163,135,0.06)' }: Props) {
  const glowRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const tintRef = useRef(tint);
  tintRef.current = tint;

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const mql = window.matchMedia('(pointer: fine)');
    if (!mql.matches) return;

    let lastX = -999;
    let lastY = -999;

    const onMove = (e: MouseEvent) => {
      // Skip redundant frames — only update if cursor moved meaningfully
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      lastX = e.clientX;
      lastY = e.clientY;

      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        glow.style.opacity = '1';
        glow.style.transform = `translate3d(${e.clientX - 160}px, ${e.clientY - 160}px, 0)`;
        glow.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease';
        glow.style.background = `radial-gradient(circle at center, ${tintRef.current} 0%, transparent 65%)`;
      });
    };

    const onLeave = () => {
      glow.style.opacity = '0';
      glow.style.transition = 'opacity 1.2s ease';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-0"
      style={{
        width: 320,
        height: 320,
        background: `radial-gradient(circle at center, ${tint} 0%, transparent 65%)`,
        borderRadius: '50%',
        willChange: 'transform, opacity',
      }}
    />
  );
}
