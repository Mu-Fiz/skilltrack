import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Coffee, 
  Volume2, 
  VolumeX, 
  Sparkles,
  BookOpen,
  CheckSquare
} from 'lucide-react';
import { Skill, DailyTask, StudySession } from '../types';
import { playNotificationSound, triggerCelebration } from '../services/storage';

interface FocusTimerViewProps {
  skills: Skill[];
  tasks: DailyTask[];
  onCompleteSession: (session: StudySession) => void;
  initialSkillId?: string;
  initialTaskId?: string;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  skills,
  tasks,
  onCompleteSession,
  initialSkillId,
  initialTaskId,
}) => {
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'short_break' | 'long_break' | 'stopwatch'>('pomodoro');
  
  // Selected skill & task
  const [selectedSkillId, setSelectedSkillId] = useState<string>(initialSkillId || (skills[0]?.id ?? ''));
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');

  // Sound enabled state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Time in seconds
  const getInitialSeconds = (mode: string) => {
    switch (mode) {
      case 'pomodoro': return 25 * 60;
      case 'short_break': return 5 * 60;
      case 'long_break': return 15 * 60;
      case 'stopwatch': return 0;
      default: return 25 * 60;
    }
  };

  const [timeLeft, setTimeLeft] = useState<number>(getInitialSeconds('pomodoro'));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Keep track of accumulated focused seconds for this active run
  const activeFocusSecondsRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialSkillId) setSelectedSkillId(initialSkillId);
    if (initialTaskId) setSelectedTaskId(initialTaskId);
  }, [initialSkillId, initialTaskId]);

  // Mode change
  const handleModeChange = (mode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch') => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(getInitialSeconds(mode));
    activeFocusSecondsRef.current = 0;
  };

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (timerMode === 'stopwatch') {
          setTimeLeft((prev) => prev + 1);
          activeFocusSecondsRef.current += 1;
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              // Timer finished!
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              if (soundEnabled) {
                playNotificationSound('complete');
              }
              triggerCelebration();
              return 0;
            }
            activeFocusSecondsRef.current += 1;
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timerMode, soundEnabled]);

  // Toggle start / pause
  const toggleTimer = () => {
    if (!isRunning && soundEnabled) {
      playNotificationSound('ding');
    }
    setIsRunning(!isRunning);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getInitialSeconds(timerMode));
    activeFocusSecondsRef.current = 0;
  };

  // Complete and log session
  const handleFinishAndSave = () => {
    // calculate minutes spent
    const minutesStudied = Math.max(1, Math.round(activeFocusSecondsRef.current / 60));
    
    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      skillId: selectedSkillId || undefined,
      taskId: selectedTaskId || undefined,
      durationMinutes: minutesStudied,
      mode: timerMode === 'stopwatch' ? 'stopwatch' : 'pomodoro',
      notes: sessionNotes.trim() || undefined,
      completedAt: new Date().toISOString(),
    };

    onCompleteSession(newSession);

    if (soundEnabled) {
      playNotificationSound('complete');
    }
    triggerCelebration();

    // Reset timer
    setIsRunning(false);
    setTimeLeft(getInitialSeconds(timerMode));
    activeFocusSecondsRef.current = 0;
    setSessionNotes('');
  };

  // Format time display MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const totalModeSeconds = getInitialSeconds(timerMode);
  const progressPercent = timerMode === 'stopwatch'
    ? Math.min(100, (timeLeft / (60 * 60)) * 100)
    : Math.max(0, Math.min(100, ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100));

  const currentSkill = skills.find((s) => s.id === selectedSkillId);
  const currentTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <span>Produktivitas</span>
          <span aria-hidden="true">/</span>
          <span>Sesi Fokus Terstruktur</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Zona Belajar Mendalam
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Tingkatkan konsentrasi tanpa distraksi. Setiap detik belajar otomatis dikreditkan ke kemajuan skillmu.
        </p>
      </div>

      {/* Main Timer Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle top progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Top Segmented Controls for Mode */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-md mx-auto mb-8 border border-slate-200">
          <button
            onClick={() => handleModeChange('pomodoro')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              timerMode === 'pomodoro'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fokus (25m)
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              timerMode === 'short_break'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rehat (5m)
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              timerMode === 'long_break'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Istirahat (15m)
          </button>
          <button
            onClick={() => handleModeChange('stopwatch')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              timerMode === 'stopwatch'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bebas
          </button>
        </div>

        {/* Target Association Selector (Skill & Task) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Skill yang Dipelajari:</span>
            </label>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">(Belajar Umum / Tanpa Skill)</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tugas Terkait (Opsional):</span>
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">(Tidak terhubung ke tugas tertentu)</option>
              {tasks.filter(t => t.status !== 'completed').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Digital Display with Tabular Figures */}
        <div className="text-center py-4 my-2">
          <div className="text-6xl sm:text-8xl font-black font-mono tabular-nums tracking-tight text-slate-900 select-none">
            {formatTime(timeLeft)}
          </div>
          
          <div className="mt-3 text-xs text-slate-500 font-medium">
            {timerMode === 'pomodoro' && 'Sesi Fokus Terbimbing'}
            {timerMode === 'short_break' && 'Waktunya istirahatkan mata & regangkan badan'}
            {timerMode === 'long_break' && 'Istirahat panjang untuk pulihkan fokus mental'}
            {timerMode === 'stopwatch' && 'Stopwatch belajar menghitung waktu maju'}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={toggleTimer}
            className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl shadow-sm transition-all transform active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Jeda Waktu</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Mulai Sesi</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset Timer"
            className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Matikan Suara Audio' : 'Aktifkan Suara Audio'}
            className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-600" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Selesaikan Sesi & Catat Hasil */}
        <div className="mt-10 pt-6 border-t border-slate-200">
          <div className="max-w-md mx-auto space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              Catatan Singkat Sesi Belajar Ini:
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Berhasil memahami implementasi cache di TanStack Query..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleFinishAndSave}
              className="w-full py-2.5 px-4 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>Selesaikan & Kreditkan Waktu Belajar ({Math.max(1, Math.round(activeFocusSecondsRef.current / 60))} Menit)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
