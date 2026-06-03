import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Pill } from 'lucide-react';
import { modules, applySeasonalShift, type ModuleId } from './data/modules';
import WeatherBadge from './components/ui/WeatherBadge';
import GreetingCard from './components/cards/GreetingCard';
import HydrationCard from './components/cards/HydrationCard';
import StandupCard from './components/cards/StandupCard';
import EmotionFoodCard from './components/cards/EmotionFoodCard';
import MoodTreeHoleCard from './components/cards/MoodTreeHoleCard';
import BreathingCard from './components/cards/BreathingCard';
import MedicineNoteCard from './components/cards/MedicineNoteCard';
import MicroExerciseCard from './components/cards/MicroExerciseCard';
import StickerWallCard from './components/cards/StickerWallCard';
import DailySummaryCard from './components/cards/DailySummaryCard';
import SleepRecordCard from './components/cards/SleepRecordCard';
import TodayLogCard from './components/cards/TodayLogCard';
import HydrationHeatmapCard from './components/cards/HydrationHeatmapCard';
import EmotionTrendCard from './components/cards/EmotionTrendCard';
import HealthSnapshotCard from './components/cards/HealthSnapshotCard';
import WeeklyReportCard from './components/cards/WeeklyReportCard';
import MonthlyJournalCard from './components/cards/MonthlyJournalCard';
import GentleQuoteCard from './components/cards/GentleQuoteCard';
import CycleTrackerCard from './components/cards/CycleTrackerCard';
import SnackLoggerCard from './components/cards/SnackLoggerCard';
import CustomReminderCard from './components/cards/CustomReminderCard';
import WhiteNoiseCard from './components/cards/WhiteNoiseCard';
import DailyDiaryCard from './components/cards/DailyDiaryCard';
import WalkTimerCard from './components/cards/WalkTimerCard';
import DietPatternInsightCard from './components/cards/DietPatternInsightCard';
import InsightCarouselCard from './components/cards/InsightCarouselCard';
import TrendForecastCard from './components/cards/TrendForecastCard';
import CompanionPresenceCard from './components/cards/CompanionPresenceCard';
import BMICard from './components/cards/BMICard';
import ToneSelector from './components/settings/ToneSelector';
import AchievementOverlay, { type MilestoneData } from './components/decorative/AchievementOverlay';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ErrorBoundary from './components/layout/ErrorBoundary';
import StaggerGroup from './components/layout/StaggerGroup';
import OnboardingGuide, { isOnboardingDone } from './components/decorative/OnboardingGuide';
import SafetyNotice from './components/decorative/SafetyNotice';
import PrivacyPanel from './components/settings/PrivacyPanel';
import ShakeToggle from './components/settings/ShakeToggle';
import PwaInstallBanner from './components/decorative/PwaInstallBanner';
import DecorativeElements from './components/decorative/DecorativeElements';
import SideTimeline from './components/decorative/SideTimeline';
import PoemSidebar from './components/decorative/PoemSidebar';
import CatCompanion from './components/decorative/CatCompanion';
import CursorGlow from './components/decorative/CursorGlow';
import ToastNotification from './components/decorative/ToastNotification';
import MorningEveningPanel from './components/decorative/MorningEveningPanel';
import ShakeEncouragement from './components/decorative/ShakeEncouragement';
import useWeather from './hooks/useWeather';
import useAmbientTone from './hooks/useAmbientTone';
import { useHydrationStore } from './store/hydrationStore';
import { useStandupStore } from './store/standupStore';
import { useAchievementStore } from './store/achievementStore';
import { useEmotionStore } from './store/emotionStore';
import { useBreathingStore } from './store/breathingStore';
import { useMedicineStore } from './store/medicineStore';
import {
  startMedicineReminderPoll,
  stopMedicineReminderPoll,
} from './services/medicineReminderEngine';
import { db } from './store/db';
import useTone from './hooks/useTone';

export default function App() {
  const tone = useTone();
  useAmbientTone(tone);
  const { code: weatherCode } = useWeather();
  const resetHydration = useHydrationStore((s) => s.resetToday);
  const resetStandup = useStandupStore((s) => s.resetToday);
  const resetEmotion = useEmotionStore((s) => s.resetToday);
  const resetBreathing = useBreathingStore((s) => s.resetToday);
  const [activeModule, setActiveModule] = useState<ModuleId>('today');
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingDone());
  const [milestone, setMilestone] = useState<MilestoneData | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // S78: Check milestone on mount
  useEffect(() => {
    const MILESTONES = [7, 30, 100, 365];
    const shownKey = 'milestone-shown';
    const shown = JSON.parse(localStorage.getItem(shownKey) || '[]') as number[];

    Promise.all([
      db.hydration.orderBy('timestamp').first(),
      db.moodTreeHole.orderBy('createdAt').first(),
      db.sticker.orderBy('earnedAt').first(),
      db.hydration.count(),
      db.standup.count(),
      db.moodTreeHole.count(),
    ]).then(([firstHyd, firstMood, firstSticker, hydCount, stdCount, moodCount]) => {
      const timestamps = [firstHyd?.timestamp, firstMood?.createdAt, firstSticker?.earnedAt]
        .filter(Boolean) as number[];
      if (timestamps.length === 0) return;

      const earliest = Math.min(...timestamps);
      const daysUsed = Math.floor((Date.now() - earliest) / (1000 * 60 * 60 * 24));

      const match = MILESTONES.find((m) => daysUsed >= m && !shown.includes(m));
      if (!match) return;

      const firstDate = new Date(earliest).toLocaleDateString('zh-CN');
      setMilestone({
        daysUsed,
        firstHydration: firstHyd ? `${firstDate}` : '',
        firstEmotion: firstMood ? firstMood.moodText.slice(0, 20) : '',
        totalActions: hydCount + stdCount + moodCount,
      });

      localStorage.setItem(shownKey, JSON.stringify([...shown, match]));
    });
  }, []);

  // S60: Paper texture opacity follows scroll depth
  const { scrollYProgress } = useScroll();
  const textureOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 1],
    [0.020, 0.035, 0.025],
  );
  useEffect(() => {
    const unsub = textureOpacity.on('change', (v) => {
      document.documentElement.style.setProperty('--texture-opacity', String(v));
    });
    return () => unsub();
  }, [textureOpacity]);

  // Smooth scroll to top on module switch
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeModule]);

  useEffect(() => {
    resetHydration();
    resetStandup();
    resetEmotion();
    resetBreathing();
  }, [resetHydration, resetStandup, resetEmotion, resetBreathing]);

  // Time-based ambient glow + seasonal shift
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();

    let color: string;
    if (hour >= 6 && hour < 11) color = 'rgba(155,187,168,0.08)';
    else if (hour >= 11 && hour < 16) color = 'rgba(229,217,195,0.1)';
    else if (hour >= 16 && hour < 19) color = 'rgba(240,179,196,0.08)';
    else if (hour >= 19 && hour < 22) color = 'rgba(245,151,59,0.06)';
    else color = 'rgba(109,156,131,0.05)';

    const seasonal = applySeasonalShift(color, month);
    document.documentElement.style.setProperty('--glow-color', seasonal);
  }, []);

  // Module color bleed
  useEffect(() => {
    const bleedMap: Record<ModuleId, { left: string; right: string }> = {
      today:      { left: 'rgba(155,187,168,0.05)', right: 'rgba(155,187,168,0.05)' },
      hydration:  { left: 'rgba(155,187,168,0.06)', right: 'rgba(109,156,131,0.05)' },
      movement:   { left: 'rgba(229,217,195,0.06)', right: 'rgba(224,201,170,0.04)' },
      emotion:    { left: 'rgba(240,179,196,0.06)', right: 'rgba(230,132,159,0.04)' },
      review:     { left: 'rgba(155,187,168,0.04)', right: 'rgba(155,187,168,0.04)' },
      insight:    { left: 'rgba(109,156,131,0.04)', right: 'rgba(155,187,168,0.04)' },
    };
    const bleed = bleedMap[activeModule] ?? bleedMap.today;
    document.documentElement.style.setProperty('--module-bleed-left', bleed.left);
    document.documentElement.style.setProperty('--module-bleed-right', bleed.right);
  }, [activeModule]);

  // Keyboard shortcuts (desktop only)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        const now = Date.now();
        const id = crypto.randomUUID();
        import('./store/db').then(({ db }) => {
          db.hydration.add({ id, timestamp: now, amountLevel: 'sip', source: 'manual' });
        });
        useHydrationStore.getState().recordDrink(now);
        useAchievementStore.getState().trigger('hydration');
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const now = Date.now();
        const id = crypto.randomUUID();
        import('./store/db').then(({ db }) => {
          db.standup.add({ id, startedAt: now - 30_000, completedAt: now, durationSeconds: 30 });
        });
        useStandupStore.getState().completeStandup(now);
        useAchievementStore.getState().trigger('standup');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Global medicine reminder poll
  const medicineLoaded = useMedicineStore((s) => s.loaded);
  const medicineLoad = useMedicineStore((s) => s.load);
  useEffect(() => {
    if (!medicineLoaded) medicineLoad();
  }, [medicineLoaded, medicineLoad]);
  useEffect(() => {
    if (!medicineLoaded) return;
    startMedicineReminderPoll(() => useMedicineStore.getState().notes);
    return () => stopMedicineReminderPoll();
  }, [medicineLoaded]);

  const activeModuleConfig = useMemo(
    () => modules.find((m) => m.id === activeModule) ?? modules[0],
    [activeModule],
  );

  const cursorTint = useMemo(() => {
    const tintMap: Record<ModuleId, string> = {
      today: 'rgba(73,130,104,0.05)',
      hydration: 'rgba(73,130,104,0.05)',
      movement: 'rgba(245,151,59,0.05)',
      emotion: 'rgba(216,92,126,0.05)',
      review: 'rgba(73,130,104,0.05)',
      insight: 'rgba(73,130,104,0.05)',
    };
    return tintMap[activeModule];
  }, [activeModule]);

  // S56: Detect desktop for 3D page-flip transition
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (min-width: 640px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // S56: direction-aware flip variants
  const moduleIndex = useMemo(() => modules.findIndex((m) => m.id === activeModule), [activeModule]);
  const lastIndex = useRef(moduleIndex);
  const flipDirection = useRef<'forward' | 'backward'>('forward');
  useEffect(() => {
    flipDirection.current = moduleIndex >= lastIndex.current ? 'forward' : 'backward';
    lastIndex.current = moduleIndex;
  }, [activeModule, moduleIndex]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-paper-50 via-paper-50 to-paper-100 transition-colors duration-500 dark:from-[#0f1612] dark:via-[#111814] dark:to-[#0c120f]">
      <DecorativeElements weatherCode={weatherCode} />
      <SideTimeline />
      <PoemSidebar />
      <CatCompanion />
      <CursorGlow tint={cursorTint} />
      <ToastNotification />

      {/* Ambient background glows — subtle ink wash effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-ink-300/10 blur-3xl transition-colors duration-500 dark:bg-ink-500/4"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-20 h-96 w-72 rounded-full bg-warm-200/8 blur-3xl transition-colors duration-500 dark:bg-warm-500/3"
      />
      {/* Time-based ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[60vh] w-[60vw] rounded-full blur-[120px] transition-all duration-[2000ms]"
        style={{
          background: `radial-gradient(circle, var(--glow-color, rgba(155,187,168,0.06)) 0%, transparent 70%)`,
        }}
      />

      {/* Module color bleed */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-full w-[30vw] transition-all duration-[1500ms] ease-out"
        style={{
          background: `radial-gradient(ellipse at 0% 50%, var(--module-bleed-left, rgba(155,187,168,0.05)) 0%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-[30vw] transition-all duration-[1500ms] ease-out"
        style={{
          background: `radial-gradient(ellipse at 100% 50%, var(--module-bleed-right, rgba(155,187,168,0.05)) 0%, transparent 70%)`,
        }}
      />

      <WeatherBadge />
      <AchievementOverlay milestone={milestone} />
      <MorningEveningPanel />
      <ShakeEncouragement />
      {showOnboarding && <OnboardingGuide />}
      <PwaInstallBanner />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6 pb-24 sm:px-6 sm:py-10 sm:pb-10 md:py-14 md:pb-14">
        {/* Brand title */}
        <p className="mb-4 text-center font-display text-sm tracking-[0.35em] text-gradient-flow sm:mb-6">
          轻 养 伴 侣
        </p>

        <GreetingCard />

        {/* Module pill navigation — paper-ink style */}
        <section className="mt-5 sm:mt-6">
          <div className="hidden sm:flex justify-center">
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-ink-200/50 bg-paper-50/80 px-2 py-2 shadow-[0_2px_12px_rgba(28,58,44,0.06)] transition-colors duration-300 dark:border-ink-700/40 dark:bg-ink-900/60 dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = module.id === activeModule;

                return (
                  <motion.button
                    key={module.id}
                    type="button"
                    onClick={() => setActiveModule(module.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium tracking-[0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-50 dark:focus-visible:ring-offset-ink-900 ${
                      isActive
                        ? 'bg-ink-200/70 text-ink-900 shadow-[0_2px_8px_rgba(28,58,44,0.12)] dark:bg-ink-600/50 dark:text-ink-50'
                        : 'bg-transparent text-ink-600/80 hover:bg-ink-100/60 hover:text-ink-800 dark:text-ink-100/80 dark:hover:bg-ink-700/40 dark:hover:text-ink-50'
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className="relative flex items-center gap-2">
                      <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                      {module.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* S56: Module header card — desktop 3D page-flip / mobile fade */}
        {isDesktop ? (
          <div className="mt-4 sm:mt-5" style={{ perspective: '800px' }}>
            <motion.section
              key={activeModule}
              initial={{
                opacity: 0,
                rotateY: flipDirection.current === 'forward' ? 90 : -90,
              }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{
                opacity: 0,
                rotateY: flipDirection.current === 'forward' ? -90 : 90,
              }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${activeModuleConfig.accent} p-5 sm:p-6 card-paper card-tilt`}
          >
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-medium tracking-[0.25em] text-ink-500/80 dark:text-ink-100/70">
                  {activeModuleConfig.summary}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight text-ink-900 dark:text-ink-50 sm:text-3xl">
                  {activeModuleConfig.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink-600/90 dark:text-ink-100/85 sm:text-[0.96rem]">
                  {activeModuleConfig.description}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-ink-200/40 bg-paper-50/50 px-3 py-2 text-xs text-ink-600/80 dark:border-ink-700/30 dark:bg-ink-800/40 dark:text-ink-100/80">
                <Pill size={14} strokeWidth={1.8} aria-hidden="true" />
                纸墨手帐
              </div>
            </div>
          </div>
        </motion.section>
          </div>
        ) : (
          <motion.section
            key={activeModule}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-4 sm:mt-5"
          >
            <div
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${activeModuleConfig.accent} p-5 sm:p-6 card-paper card-tilt`}
            >
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-medium tracking-[0.25em] text-ink-500/80 dark:text-ink-100/70">
                    {activeModuleConfig.summary}
                  </p>
                  <h2 className="mt-2 font-display text-2xl leading-tight text-ink-900 dark:text-ink-50 sm:text-3xl">
                    {activeModuleConfig.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-ink-600/90 dark:text-ink-100/85 sm:text-[0.96rem]">
                    {activeModuleConfig.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-ink-200/40 bg-paper-50/50 px-3 py-2 text-xs text-ink-600/80 dark:border-ink-700/30 dark:bg-ink-800/40 dark:text-ink-100/80">
                  <Pill size={14} strokeWidth={1.8} aria-hidden="true" />
                  纸墨手帐
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <ErrorBoundary>
        <StaggerGroup className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
          {activeModule === 'today' && (
            <>
              <BMICard />
              <ToneSelector />
              <CompanionPresenceCard />
              <CustomReminderCard />
            </>
          )}

          {activeModule === 'hydration' && (
            <>
              <HydrationCard />
              <MedicineNoteCard />
              <CycleTrackerCard />
              <SnackLoggerCard />
              <div className="rounded-2xl border border-dashed border-ink-200/50 bg-paper-50/50 p-5 text-sm leading-7 text-ink-600/80 dark:border-ink-700/30 dark:bg-ink-900/40 dark:text-ink-100/80">
                这个板块负责给身体补一点状态。喝水是主角，药品小纸条和轻补给是辅助。
              </div>
            </>
          )}

          {activeModule === 'movement' && (
            <>
              <StandupCard />
              <WalkTimerCard />
              <MicroExerciseCard />
              <BreathingCard />
              <WhiteNoiseCard />
              <div className="rounded-2xl border border-dashed border-warm-300/50 bg-paper-50/50 p-5 text-sm leading-7 text-warm-800/80 dark:border-warm-700/30 dark:bg-ink-900/40 dark:text-warm-100/80">
                这个板块负责把身体从久坐里轻轻带出来。站起来、舒展一下、然后跟着呼吸慢慢放松。
              </div>
            </>
          )}

          {activeModule === 'emotion' && (
            <>
              <EmotionFoodCard />
              <MoodTreeHoleCard />
              <div className="rounded-2xl border border-dashed border-blossom-300/50 bg-paper-50/50 p-5 text-sm leading-7 text-blossom-700/80 dark:border-blossom-700/30 dark:bg-ink-900/40 dark:text-blossom-100/80">
                这个板块负责先接住情绪，再给出很小的安抚动作，不急着解决所有问题。
              </div>
            </>
          )}

          {activeModule === 'review' && (
            <div className="flex flex-col gap-4">
              <SleepRecordCard />
              <DailySummaryCard />
              <GentleQuoteCard />
              <TodayLogCard />
              <DailyDiaryCard />
              <StickerWallCard />
            </div>
          )}

          {activeModule === 'insight' && (
            <>
              <InsightCarouselCard />
              <TrendForecastCard />
              <DietPatternInsightCard />
              <MonthlyJournalCard />
              <HydrationHeatmapCard />
              <EmotionTrendCard />
              <WeeklyReportCard />
              <HealthSnapshotCard />
              <div className="rounded-2xl border border-dashed border-ink-200/50 bg-paper-50/50 p-5 text-sm leading-7 text-ink-600/80 dark:border-ink-700/30 dark:bg-ink-900/40 dark:text-ink-100/80">
                数据洞察帮你温柔地看见自己。不需要分析，不需要比较，只是看看这些天你的小痕迹。
              </div>
            </>
          )}
        </StaggerGroup>
        <SafetyNotice />
        <PrivacyPanel />

        {/* S62: Shake encouragement toggle */}
        <ShakeToggle />
        </ErrorBoundary>
      </div>

      <MobileBottomNav
        modules={modules.map((m) => ({ id: m.id, label: m.label, icon: m.icon }))}
        activeId={activeModule}
        onChange={setActiveModule}
      />
    </main>
  );
}
