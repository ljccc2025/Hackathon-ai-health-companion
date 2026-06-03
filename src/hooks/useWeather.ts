import { useState, useEffect, useCallback } from 'react';

interface WeatherData {
  temp: number;
  code: number;
}

interface CachedWeather {
  data: WeatherData;
  fetchedAt: number;
}

const CACHE_KEY = 'weather-cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);
    if (Date.now() - cached.fetchedAt > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function setCache(data: WeatherData) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, fetchedAt: Date.now() }),
    );
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

type WeatherStatus = 'loading' | 'loaded' | 'denied' | 'error';

interface UseWeatherReturn {
  status: WeatherStatus;
  temp: number | null;
  code: number | null;
  refresh: () => void;
}

export default function useWeather(): UseWeatherReturn {
  const [status, setStatus] = useState<WeatherStatus>('loading');
  const [temp, setTemp] = useState<number | null>(null);
  const [code, setCode] = useState<number | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto&forecast_days=1`,
        {
          signal: AbortSignal.timeout(8000),
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
        },
      );
      if (!res.ok) throw new Error('API failed');
      const json = await res.json();
      const data: WeatherData = {
        temp: Math.round(json.current.temperature_2m),
        code: json.current.weather_code,
      };
      setTemp(data.temp);
      setCode(data.code);
      setStatus('loaded');
      setCache(data);
    } catch (err) {
      // CORS errors are expected in some environments
      // Use cached data if available, otherwise set error status
      const cached = getCached();
      if (cached) {
        setTemp(cached.temp);
        setCode(cached.code);
        setStatus('loaded');
      } else {
        setStatus('error');
      }
    }
  }, []);

  const refresh = useCallback(() => {
    const cached = getCached();
    if (cached) {
      setTemp(cached.temp);
      setCode(cached.code);
      setStatus('loaded');
      return;
    }

    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  }, [fetchWeather]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, temp, code, refresh };
}
