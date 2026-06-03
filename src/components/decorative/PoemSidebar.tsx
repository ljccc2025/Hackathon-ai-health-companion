import { useState, useEffect, useMemo } from 'react';
import { Feather } from 'lucide-react';
import type { DayPeriod } from '../../types/health';

function getPeriod(): DayPeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function pickRandomPoem(period: DayPeriod): string {
  const pools: Record<DayPeriod, string[]> = {
    morning: [
      '晨光轻轻推开窗\n风里有露水的味道\n今天不用急\n一口水就可以开始',
      '鸟在窗外说了早安\n你慢慢睁开眼睛\n这个世界\n不差这一小会儿',
      '清晨像一张白纸\n你用一口温水\n画下第一笔\n今天不需要完美',
      '太阳刚醒\n光还有点软\n你也是\n可以再缓一缓',
    ],
    noon: [
      '正午的影子很短\n找一个角落坐下来\n好好吃一顿饭\n也是一件重要的事',
      '太阳走到头顶\n停下来歇一歇吧\n把筷子拿起来\n把手机放下',
      '中午的光很亮\n但不刺眼\n像一句温柔的话\n你值得这顿饭',
      '时钟指向十二点\n身体说它饿了\n你听见了吗\n它在等你照顾它',
    ],
    afternoon: [
      '下午很长\n但不需要一口气撑过去\n让肩膀沉下来\n像云放下雨一样',
      '三点钟的阳光\n斜斜地照在桌上\n你手里的杯子\n还有半口温水',
      '下午是一只慢慢走的猫\n不急不忙\n你可以学它的节奏\n把呼吸放慢',
      '窗外的树叶\n在风里翻了个身\n你也在座位上\n换个姿势吧',
    ],
    evening: [
      '天光慢慢收拢\n今天你已经走了很远\n剩下的路\n明天再走也不迟',
      '晚霞把天空还给夜晚\n你把今天还给今天\n剩下的时间\n是给自己的礼物',
      '路灯一盏一盏亮了\n你该回家了\n不是指回到住处\n是回到自己身边',
      '黄昏很短\n但足够你深深呼一口气\n把肩上的东西\n轻轻放下来',
    ],
    night: [
      '星星一颗一颗亮起来\n你不用解决所有问题\n今晚只需要\n跟着呼吸慢慢沉下去',
      '夜深了\n世界安静下来\n你也该\n把今天的自己轻轻放下',
      '月光很淡\n刚好够看见自己的呼吸\n一上一下\n像最小的波浪',
      '夜晚不需要答案\n只需要一个柔软的枕头\n和对自己说一句\n今天辛苦了',
    ],
  };
  const pool = pools[period] ?? pools.night;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function PoemSidebar() {
  const period = useMemo(() => getPeriod(), []);
  const [poemLines, setPoemLines] = useState<string[]>(() => {
    const raw = pickRandomPoem(period);
    return raw.split('\n').map((l) => l.trim()).filter(Boolean);
  });

  // Listen for fresh AI poems dispatched by GreetingCard
  useEffect(() => {
    const handleCached = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      const lines = detail.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) setPoemLines(lines);
    };
    window.addEventListener('poem-cached', handleCached);
    return () => window.removeEventListener('poem-cached', handleCached);
  }, []);

  if (poemLines.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex fixed top-1/2 -translate-y-1/2 pointer-events-none select-none z-[4]"
      style={{ left: 'max(20px, calc(50% - 35rem - 24px))' }}
    >
      <div className="flex items-end gap-5 opacity-35 hover:opacity-65 transition-opacity duration-[1500ms] ease-out">
        {poemLines.map((line, colIdx) => (
          <div key={colIdx} className="flex flex-col items-center" style={{ gap: 1 }}>
            {[...line].map((char, charIdx) => (
              <span
                key={charIdx}
                className="text-[13px] font-light tracking-[0.12em] text-gentle-700 dark:text-gentle-200 leading-[1.9]"
              >
                {char}
              </span>
            ))}
          </div>
        ))}
        <Feather
          size={9}
          strokeWidth={1.3}
          className="text-gentle-400/60 dark:text-gentle-400/40 flex-none mb-0.5"
        />
      </div>
    </div>
  );
}
