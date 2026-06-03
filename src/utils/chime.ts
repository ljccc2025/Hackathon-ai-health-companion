let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function isMuted(): boolean {
  try {
    const raw = localStorage.getItem('light-nurture-preference');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.state?.muted === true;
  } catch { return false; }
}

export function playChime(): void {
  if (isMuted()) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  // Two-tone chime: warm lower note + bright upper note
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(660, now);
  osc1.frequency.linearRampToValueAtTime(880, now + 0.15);
  osc1.frequency.linearRampToValueAtTime(550, now + 0.4);
  osc1.connect(gain);
  osc1.start(now);
  osc1.stop(now + 0.6);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1100, now + 0.08);
  osc2.frequency.linearRampToValueAtTime(1320, now + 0.2);
  osc2.frequency.exponentialRampToValueAtTime(880, now + 0.5);
  const gain2 = ctx.createGain();
  gain2.connect(ctx.destination);
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.15, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc2.connect(gain2);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.5);
}
