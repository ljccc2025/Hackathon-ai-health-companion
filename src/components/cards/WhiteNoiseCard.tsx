import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Play, Square } from 'lucide-react';
import { useWhiteNoiseStore, type NoiseTrack } from '../../store/whiteNoiseStore';

const TRACK_LABELS: Record<NoiseTrack, { label: string; emoji: string }> = {
  rain: { label: '雨声', emoji: '🌧' },
  forest: { label: '林间', emoji: '🌿' },
  cafe: { label: '咖啡馆', emoji: '☕' },
};

function createNoiseNode(ctx: AudioContext, type: NoiseTrack): AudioNode {
  switch (type) {
    case 'rain': {
      // Rain: filtered white noise with irregular pops
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        // Gaussian-like noise with occasional louder drops
        const r = Math.random() * 2 - 1;
        const drop = Math.random() < 0.003 ? (Math.random() * 0.8 + 0.2) : 0;
        last = last * 0.999 + r * 0.15 + drop;
        data[i] = last;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 800;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 8000;
      source.connect(hp);
      hp.connect(lp);
      source.start();
      return lp;
    }
    case 'forest': {
      // Forest: filtered pink-ish noise with occasional chirps
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        data[i] = (b0 + b1 + b2 + white * 0.05) * 0.11;
        // occasional bird-like chirp
        if (Math.random() < 0.0002) {
          const freq = 2000 + Math.random() * 3000;
          const dur = 0.05 + Math.random() * 0.1;
          const start = i;
          for (let j = 0; j < dur * ctx.sampleRate && start + j < bufferSize; j++) {
            data[start + j] += Math.sin(2 * Math.PI * freq * j / ctx.sampleRate) *
              (1 - j / (dur * ctx.sampleRate)) * 0.3;
          }
        }
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 6000;
      source.connect(lp);
      source.start();
      return lp;
    }
    case 'cafe': {
      // Cafe: low hubbub noise with occasional clinks
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
        // occasional clink
        if (Math.random() < 0.0008) {
          const freq = 3000 + Math.random() * 4000;
          const dur = 0.03;
          const start = i;
          for (let j = 0; j < dur * ctx.sampleRate && start + j < bufferSize; j++) {
            data[start + j] += Math.sin(2 * Math.PI * freq * j / ctx.sampleRate) *
              Math.exp(-j * 80 / ctx.sampleRate) * 0.4;
          }
        }
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 4500;
      source.connect(lp);
      source.start();
      return lp;
    }
  }
}

export default function WhiteNoiseCard() {
  const active = useWhiteNoiseStore((s) => s.active);
  const volumes = useWhiteNoiseStore((s) => s.volumes);
  const muteStates = useWhiteNoiseStore((s) => s.muteStates);
  const toggle = useWhiteNoiseStore((s) => s.toggle);
  const setVolume = useWhiteNoiseStore((s) => s.setVolume);
  const setMute = useWhiteNoiseStore((s) => s.setMute);

  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Map<NoiseTrack, AudioNode>>(new Map());
  const gainsRef = useRef<Map<NoiseTrack, GainNode>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  const startNoise = useCallback(async () => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = 0.3;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const tracks: NoiseTrack[] = ['rain', 'forest', 'cafe'];
    for (const t of tracks) {
      const gain = ctx.createGain();
      gain.gain.value = 0.5;
      const node = createNoiseNode(ctx, t);
      node.connect(gain);
      gain.connect(master);
      nodesRef.current.set(t, node);
      gainsRef.current.set(t, gain);
    }
  }, []);

  const stopNoise = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
      nodesRef.current.clear();
      gainsRef.current.clear();
      masterGainRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (active) {
      startNoise();
    } else {
      stopNoise();
    }
    return () => stopNoise();
  }, [active, startNoise, stopNoise]);

  // Sync volumes and mute states to gain nodes
  useEffect(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') return;
    const gains = gainsRef.current;
    for (const track of ['rain', 'forest', 'cafe'] as NoiseTrack[]) {
      const gain = gains.get(track);
      if (gain) {
        gain.gain.value = muteStates[track] ? 0 : volumes[track];
      }
    }
  }, [volumes, muteStates]);

  const anyUnmuted = Object.values(muteStates).some((m) => !m);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-200/95 via-gentle-100/92 to-white/75 p-5 sm:p-6 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:bg-[#0e1f1b]/92 dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.52)] transition-colors duration-500 "
    >
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-gentle-500 dark:text-gentle-50">
              <Volume2 size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100">
              白噪音轻混音
            </span>
          </div>

          <motion.button
            type="button"
            onClick={toggle}
            whileTap={{ scale: 0.97 }}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              active
                ? 'bg-gentle-500/90 text-white dark:bg-gentle-400/80 dark:text-gentle-900'
                : 'bg-gentle-200/80 text-gentle-700 hover:bg-gentle-300/80 dark:bg-gentle-700/60 dark:text-gentle-100 dark:hover:bg-gentle-600/60'
            }`}
          >
            {active ? (
              <>
                <Square size={12} strokeWidth={2.5} />
                停止
              </>
            ) : (
              <>
                <Play size={12} strokeWidth={2.5} />
                开始
              </>
            )}
          </motion.button>
        </div>

        {!active && !anyUnmuted && (
          <p className="text-xs leading-relaxed text-gentle-600/65 dark:text-gentle-300">
            打开一段轻柔的背景音，在专注时陪伴你。三轨独立，自由调节。
          </p>
        )}

        {active && (
          <p className="text-xs leading-relaxed text-gentle-500/80 dark:text-gentle-300 animate-pulse">
            正在播放中… 关闭此卡片或切换到其他页面，声音会继续陪伴
          </p>
        )}

        <div className="flex flex-col gap-4">
          {(['rain', 'forest', 'cafe'] as NoiseTrack[]).map((track) => {
            const muted = muteStates[track];
            const vol = volumes[track];
            const { label, emoji } = TRACK_LABELS[track];

            return (
              <motion.div
                key={track}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <motion.button
                  type="button"
                  onClick={() => setMute(track, !muted)}
                  whileTap={{ scale: 0.94 }}
                  className={`flex-none flex items-center justify-center w-10 h-10 rounded-full border transition-all ${
                    muted
                      ? 'border-gentle-200/50 bg-gentle-100/40 text-gentle-400/60 dark:border-gentle-700/40 dark:bg-gentle-800/40 dark:text-gentle-500/60'
                      : 'border-gentle-300/70 bg-gentle-200/70 text-gentle-600 shadow-sm dark:border-gentle-500/30 dark:bg-gentle-700/50 dark:text-gentle-200'
                  }`}
                  title={muted ? `取消静音 ${label}` : `静音 ${label}`}
                >
                  {muted ? <VolumeX size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
                </motion.button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gentle-700 dark:text-gentle-200">
                      {emoji} {label}
                    </span>
                    <span className="text-[10px] tabular-nums text-gentle-500/70 dark:text-gentle-400">
                      {muted ? '静音' : `${Math.round(vol * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={vol}
                    onChange={(e) => setVolume(track, parseFloat(e.target.value))}
                    disabled={muted}
                    className={`w-full h-1.5 rounded-full appearance-none cursor-pointer ${
                      muted
                        ? 'bg-gentle-200/50 dark:bg-gentle-700/40 opacity-50'
                        : 'bg-gentle-300/60 dark:bg-gentle-600/50'
                    } [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gentle-500 [&::-webkit-slider-thumb]:dark:bg-gentle-300 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/60 [&::-webkit-slider-thumb]:dark:border-gentle-800/60`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
