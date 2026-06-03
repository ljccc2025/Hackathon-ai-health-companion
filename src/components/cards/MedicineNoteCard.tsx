import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, ChevronDown, Plus, Trash2, Clock, Bell, BellOff, Stethoscope, Loader2, Moon } from 'lucide-react';
import { useMedicineStore } from '../../store/medicineStore';
import { validateMedicineForm, checkMedicineSafety } from '../../utils/medicineSafety';
import { useAchievementStore } from '../../store/achievementStore';
import { usePreferenceStore } from '../../store/preferenceStore';
import type { MedicineNote, RepeatRule } from '../../types/health';
import type { MedicineFormErrors } from '../../utils/medicineSafety';

const repeatLabels: Record<RepeatRule, string> = {
  once: '单次',
  daily: '每天',
  custom: '自定义',
};

const emptyForm = {
  medicineName: '',
  dosageText: '',
  remindAt: '',
  repeatRule: 'daily' as RepeatRule,
  note: '',
};

export default function MedicineNoteCard() {
  const { notes, loaded, load, add, remove, toggleEnabled } = useMedicineStore();
  const [collapsed, setCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [errors, setErrors] = useState<MedicineFormErrors>({});
  const [safetyMsg, setSafetyMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('default');
  const [feedback, setFeedback] = useState<string | null>(null);
  const triggerAchievement = useAchievementStore((s) => s.trigger);

  // Quiet hours check
  const quietHoursEnabled = usePreferenceStore((s) => s.quietHoursEnabled);
  const quietHoursStart = usePreferenceStore((s) => s.quietHoursStart);
  const quietHoursEnd = usePreferenceStore((s) => s.quietHoursEnd);
  const isInQuietTime = (() => {
    if (!quietHoursEnabled) return false;
    const now = new Date();
    const cm = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = quietHoursStart.split(':').map(Number);
    const [eh, em] = quietHoursEnd.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start <= end) return cm >= start && cm < end;
    return cm >= start || cm < end;
  })();

  // Load notes on mount
  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  // Check notification permission
  useEffect(() => {
    if (!('Notification' in window)) {
      setNotifPerm('unsupported');
      return;
    }
    setNotifPerm(Notification.permission);
  }, []);

  const handleRequestNotif = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifPerm(result);
  };

  const enabledCount = notes.filter((n) => n.enabled).length;

  const resetForm = useCallback(() => {
    setForm({ ...emptyForm });
    setErrors({});
    setSafetyMsg(null);
  }, []);

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof MedicineFormErrors]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field as keyof MedicineFormErrors];
          return next;
        });
      }
      // Safety check for note field
      if (field === 'note' && value.trim()) {
        const safety = checkMedicineSafety(value);
        setSafetyMsg(safety);
      }
    },
    [errors],
  );

  const handleSubmit = useCallback(async () => {
    const formErrors = validateMedicineForm(form);
    if (formErrors) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);
    await add({
      medicineName: form.medicineName.trim(),
      dosageText: form.dosageText.trim(),
      remindAt: form.remindAt,
      repeatRule: form.repeatRule,
      note: form.note.trim() || undefined,
      enabled: true,
    });
    setSubmitting(false);
    resetForm();
    setShowForm(false);
    setFeedback('小纸条已记下，到时间会轻轻提醒你。');
    triggerAchievement('medicine');
    setTimeout(() => setFeedback(null), 2500);
  }, [form, add, resetForm, triggerAchievement]);

  const handleDelete = useCallback(
    async (id: string) => {
      await remove(id);
    },
    [remove],
  );

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      className="relative overflow-hidden rounded-2xl border border-ink-200/40 dark:border-ink-700/30 bg-gradient-to-br from-gentle-300/95 via-gentle-200/92 to-warm-200/65 dark:bg-gentle-900/75 p-5 sm:p-6 mt-4 shadow-[0_14px_36px_-24px_rgba(28,58,44,0.28)] dark:shadow-[0_14px_36px_-24px_rgba(0,0,0,0.45)] transition-colors duration-500 "
    >
      {/* Glass highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-px -left-px w-20 h-20 rounded-full bg-paper-50/30 dark:bg-paper-50/3 blur-xl transition-colors duration-500"
      />

      <div className="relative z-10 flex flex-col">
        {/* === Collapsed summary row === */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gentle-400 focus-visible:ring-offset-2 focus-visible:rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-gentle-500 dark:text-gentle-100">
              <Pill size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-gentle-700 dark:text-gentle-100/90">
              药品小纸条
            </span>
            <span className="text-xs text-gentle-600/70 dark:text-gentle-100/90">
              {notes.length > 0
                ? `· ${notes.length} 张小纸条${enabledCount > 0 ? `，${enabledCount} 张在提醒` : ''}`
                : '· 记下需要记得的用药'}
            </span>
            {enabledCount > 0 && (
              <span className="flex-none w-2 h-2 rounded-full bg-gentle-400 animate-bar-breathe" aria-hidden="true" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gentle-700/60 dark:text-gentle-100/90">
              {notes.length > 0 ? `${notes.length}` : ''}
            </span>
            <motion.span
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
              className="text-gentle-600/70 dark:text-gentle-100/90"
            >
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.span>
          </div>
        </button>

        {/* === Expanded content === */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-5">
                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <p className="text-sm text-gentle-600 dark:text-gentle-100/90 bg-gentle-100/60 dark:bg-gentle-800/55 rounded-xl px-4 py-2.5 text-center">
                        {feedback}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Medical boundary notice */}
                <div className="flex items-start gap-2.5 rounded-xl bg-warm-100/50 dark:bg-warm-900/15 px-3.5 py-2.5">
                  <Stethoscope size={14} strokeWidth={1.6} className="mt-0.5 flex-none text-warm-500 dark:text-warm-400" />
                  <p className="text-[0.68rem] leading-relaxed text-warm-600/80 dark:text-warm-300/70">
                    小纸条只帮你记住医嘱，不提供任何用药建议。如需调整用药，请咨询医生或药师。
                  </p>
                </div>

                {/* Quiet hours notice */}
                {isInQuietTime && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-gentle-100/50 dark:bg-gentle-800/65 px-3.5 py-2.5">
                    <Moon size={14} strokeWidth={1.6} className="mt-0.5 flex-none text-gentle-400 dark:text-gentle-500" />
                    <p className="text-[0.68rem] leading-relaxed text-gentle-500/80 dark:text-gentle-300/90">
                      当前在勿扰时段（{quietHoursStart}—{quietHoursEnd}），药品提醒不会弹出通知。设置页可调整。
                    </p>
                  </div>
                )}

                {/* Notification permission prompt */}
                {enabledCount > 0 && notifPerm !== 'granted' && notifPerm !== 'unsupported' && (
                  <div className="flex items-center gap-3 rounded-xl bg-warm-100/60 dark:bg-warm-900/20 px-4 py-3">
                    <Bell size={16} strokeWidth={1.5} className="flex-none text-warm-500 dark:text-warm-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-warm-700 dark:text-warm-300/90">
                        {notifPerm === 'denied'
                          ? '通知权限已被浏览器阻止，请在浏览器设置中开启。'
                          : '需要开启通知权限，到时间才能弹出提醒。'}
                      </p>
                    </div>
                    {notifPerm === 'default' && (
                      <button
                        type="button"
                        onClick={handleRequestNotif}
                        className="flex-none rounded-full bg-warm-400/20 dark:bg-warm-400/15 hover:bg-warm-400/30 dark:hover:bg-warm-400/25 px-3 py-1.5 text-xs font-medium text-warm-600 dark:text-warm-300 transition-colors cursor-pointer"
                      >
                        开启提醒
                      </button>
                    )}
                  </div>
                )}

                {/* Note list */}
                {notes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {notes.map((note) => (
                      <MedicineNoteItem
                        key={note.id}
                        note={note}
                        onToggle={() => toggleEnabled(note.id)}
                        onDelete={() => handleDelete(note.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {notes.length === 0 && !showForm && (
                  <p className="text-xs text-gentle-500/70 dark:text-gentle-300/80 text-center py-3">
                    还没有小纸条，记下医生交代的用药时间吧。
                  </p>
                )}

                {/* Add form */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-gentle-200/50 dark:border-gentle-700/25 bg-paper-50/50 dark:bg-gentle-800/65 p-4 space-y-3.5">
                        {/* Medicine name */}
                        <div>
                          <label className="text-xs text-gentle-600/80 dark:text-gentle-100/90 mb-1.5 block">
                            药品名称
                          </label>
                          <input
                            type="text"
                            value={form.medicineName}
                            onChange={(e) => handleFieldChange('medicineName', e.target.value)}
                            placeholder="如：阿莫西林、降压药"
                            maxLength={40}
                            className={`w-full px-3.5 py-2 rounded-xl bg-paper-50/60 dark:bg-gentle-800/65 border text-sm text-gentle-700 dark:text-gentle-100 placeholder:text-gentle-300/60 dark:placeholder:text-gentle-500/60 outline-none transition-colors ${
                              errors.medicineName
                                ? 'border-red-300 dark:border-red-700/40'
                                : 'border-gentle-200/40 dark:border-gentle-700/30 focus:border-gentle-400/50 dark:focus:border-gentle-400/40'
                            }`}
                          />
                          {errors.medicineName && (
                            <p className="mt-1 text-[0.65rem] text-red-400 dark:text-red-400/80">{errors.medicineName}</p>
                          )}
                        </div>

                        {/* Dosage */}
                        <div>
                          <label className="text-xs text-gentle-600/80 dark:text-gentle-100/90 mb-1.5 block">
                            每次用量
                          </label>
                          <input
                            type="text"
                            value={form.dosageText}
                            onChange={(e) => handleFieldChange('dosageText', e.target.value)}
                            placeholder="如：每次 1 片，一天 3 次"
                            maxLength={40}
                            className={`w-full px-3.5 py-2 rounded-xl bg-paper-50/60 dark:bg-gentle-800/65 border text-sm text-gentle-700 dark:text-gentle-100 placeholder:text-gentle-300/60 dark:placeholder:text-gentle-500/60 outline-none transition-colors ${
                              errors.dosageText
                                ? 'border-red-300 dark:border-red-700/40'
                                : 'border-gentle-200/40 dark:border-gentle-700/30 focus:border-gentle-400/50 dark:focus:border-gentle-400/40'
                            }`}
                          />
                          {errors.dosageText && (
                            <p className="mt-1 text-[0.65rem] text-red-400 dark:text-red-400/80">{errors.dosageText}</p>
                          )}
                        </div>

                        {/* Time + Repeat */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gentle-600/80 dark:text-gentle-100/90 mb-1.5 block">
                              提醒时间
                            </label>
                            <input
                              type="time"
                              value={form.remindAt}
                              onChange={(e) => handleFieldChange('remindAt', e.target.value)}
                              required
                              className={`w-full px-3 py-2 rounded-xl bg-paper-50/60 dark:bg-gentle-800/65 border text-sm text-gentle-700 dark:text-gentle-100 outline-none transition-colors ${
                                errors.remindAt
                                  ? 'border-red-300 dark:border-red-700/40'
                                  : 'border-gentle-200/40 dark:border-gentle-700/30 focus:border-gentle-400/50 dark:focus:border-gentle-400/40'
                              }`}
                            />
                            {errors.remindAt && (
                              <p className="mt-1 text-[0.65rem] text-red-400 dark:text-red-400/80">{errors.remindAt}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gentle-600/80 dark:text-gentle-100/90 mb-1.5 block">
                              重复方式
                            </label>
                            <select
                              value={form.repeatRule}
                              onChange={(e) => handleFieldChange('repeatRule', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-paper-50/60 dark:bg-gentle-800/65 border border-gentle-200/40 dark:border-gentle-700/30 text-sm text-gentle-700 dark:text-gentle-100 outline-none focus:border-gentle-400/50 dark:focus:border-gentle-400/40"
                            >
                              <option value="daily">每天</option>
                              <option value="once">单次</option>
                              <option value="custom">自定义</option>
                            </select>
                          </div>
                        </div>

                        {/* Optional note */}
                        <div>
                          <label className="text-xs text-gentle-600/80 dark:text-gentle-100/90 mb-1.5 block">
                            备注（可选）
                          </label>
                          <input
                            type="text"
                            value={form.note}
                            onChange={(e) => handleFieldChange('note', e.target.value)}
                            placeholder="如：饭后半小时服用"
                            maxLength={60}
                            className="w-full px-3.5 py-2 rounded-xl bg-paper-50/60 dark:bg-gentle-800/65 border border-gentle-200/40 dark:border-gentle-700/30 text-sm text-gentle-700 dark:text-gentle-100 placeholder:text-gentle-300/60 dark:placeholder:text-gentle-500/60 outline-none focus:border-gentle-400/50 dark:focus:border-gentle-400/40"
                          />
                          {safetyMsg && (
                            <p className="mt-1.5 flex items-start gap-1.5 text-[0.65rem] leading-relaxed text-warm-500 dark:text-warm-400/80">
                              <Stethoscope size={11} strokeWidth={1.6} className="mt-0.5 flex-none" />
                              {safetyMsg}
                            </p>
                          )}
                        </div>

                        {/* Form actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              resetForm();
                              setShowForm(false);
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-gentle-200/50 dark:border-gentle-700/30 bg-paper-50/50 dark:bg-gentle-800/60 text-xs font-medium text-gentle-500 dark:text-gentle-400 transition-all duration-200 hover:bg-gentle-100/70 dark:hover:bg-gentle-700/30 cursor-pointer"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gentle-400/25 dark:bg-gentle-400/10 hover:bg-gentle-400/35 dark:hover:bg-gentle-400/20 text-gentle-700 dark:text-gentle-100 text-xs font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? (
                              <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
                            ) : (
                              <Plus size={13} strokeWidth={1.5} />
                            )}
                            记下小纸条
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add button (when form not shown) */}
                {!showForm && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gentle-400/20 dark:bg-gentle-400/8 hover:bg-gentle-400/30 dark:hover:bg-gentle-400/15 text-gentle-700 dark:text-gentle-100 text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] border border-dashed border-gentle-300/50 dark:border-gentle-700/30"
                  >
                    <Plus size={16} strokeWidth={1.5} />
                    添加一张药品小纸条
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ── Individual note item ── */

function MedicineNoteItem({
  note,
  onToggle,
  onDelete,
}: {
  note: MedicineNote;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200 ${
        note.enabled
          ? 'bg-gentle-100/60 dark:bg-gentle-800/65 border border-gentle-200/40 dark:border-gentle-700/25'
          : 'bg-paper-50/30 dark:bg-gentle-800/55 border border-gentle-200/20 dark:border-gentle-700/15 opacity-70'
      }`}
    >
      {/* Icon */}
      <span className={`flex-none flex h-8 w-8 items-center justify-center rounded-full ${
        note.enabled
          ? 'bg-gentle-200/70 dark:bg-gentle-700/50'
          : 'bg-gentle-100/40 dark:bg-gentle-800/65'
      }`}>
        <Pill size={14} strokeWidth={1.6} className={note.enabled ? 'text-gentle-600 dark:text-gentle-300' : 'text-gentle-400 dark:text-gentle-500'} />
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gentle-800 dark:text-gentle-100 truncate">
            {note.medicineName}
          </span>
          <span className="text-xs text-gentle-500/70 dark:text-gentle-300/80 flex-none">
            {note.dosageText}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock size={10} strokeWidth={1.5} className="text-gentle-400/70 dark:text-gentle-400/80 flex-none" />
          <span className="text-[0.65rem] text-gentle-500/70 dark:text-gentle-300/80">
            {note.remindAt} · {repeatLabels[note.repeatRule]}
          </span>
          {note.note && (
            <span className="text-[0.65rem] text-gentle-400/60 dark:text-gentle-300/90 truncate">
              · {note.note}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={onToggle}
        className="flex-none flex items-center justify-center w-8 h-8 rounded-full border border-gentle-200/50 dark:border-gentle-700/30 bg-paper-50/50 dark:bg-gentle-800/60 hover:bg-gentle-100/60 dark:hover:bg-gentle-700/30 transition-all duration-200 cursor-pointer"
        title={note.enabled ? '关闭提醒' : '开启提醒'}
      >
        {note.enabled ? (
          <Bell size={14} strokeWidth={1.5} className="text-gentle-500 dark:text-gentle-400" />
        ) : (
          <BellOff size={14} strokeWidth={1.5} className="text-gentle-300/60 dark:text-gentle-300/90" />
        )}
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="flex-none flex items-center justify-center w-8 h-8 rounded-full border border-red-200/40 dark:border-red-800/20 bg-paper-50/40 dark:bg-gentle-800/55 hover:bg-red-50/60 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
        title="删除小纸条"
      >
        <Trash2 size={13} strokeWidth={1.5} className="text-red-300/80 dark:text-red-400/60" />
      </button>
    </div>
  );
}
