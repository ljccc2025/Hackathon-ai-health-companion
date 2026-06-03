import { motion } from 'framer-motion';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
} from 'lucide-react';
import useWeather from '../../hooks/useWeather';

function getWeatherIcon(code: number) {
  if (code === 0) return { Icon: Sun, label: '晴天' };
  if (code >= 1 && code <= 3) return { Icon: CloudSun, label: '少云' };
  if (code >= 45 && code <= 48) return { Icon: CloudFog, label: '雾' };
  if (code >= 51 && code <= 55) return { Icon: CloudDrizzle, label: '小雨' };
  if (code >= 61 && code <= 67) return { Icon: CloudRain, label: '雨' };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, label: '雪' };
  if (code >= 80 && code <= 82) return { Icon: CloudRain, label: '大雨' };
  if (code >= 85 && code <= 86) return { Icon: CloudSnow, label: '雪' };
  if (code >= 95) return { Icon: CloudLightning, label: '雷暴' };
  return { Icon: Cloud, label: '多云' };
}

export default function WeatherBadge() {
  const { status, temp, code, refresh } = useWeather();

  if (status === 'denied' || status === 'error' || status === 'loading') {
    return (
      <button
        type="button"
        onClick={refresh}
        aria-label="刷新天气"
        className="fixed right-4 sm:right-6 top-[5.5rem] sm:top-[6rem] z-40 flex items-center gap-1 text-gentle-400/70 dark:text-gentle-100/90 hover:text-gentle-500 dark:hover:text-gentle-300 transition-colors cursor-pointer"
      >
        <CloudSun size={18} strokeWidth={1.5} />
        <span className="text-xs font-light tracking-wide">—°</span>
      </button>
    );
  }

  const { Icon, label } = getWeatherIcon(code!);

  return (
    <motion.button
      type="button"
      onClick={refresh}
      aria-label={`${label} ${temp}度，点击刷新`}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed right-4 sm:right-6 top-[5.5rem] sm:top-[6rem] z-40 flex items-center gap-1 text-gentle-500/80 dark:text-gentle-100/90 hover:text-gentle-700 dark:hover:text-gentle-200 transition-colors cursor-pointer"

    >
      <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
      <span className="text-xs font-light tracking-wide">{temp}°</span>
    </motion.button>
  );
}
