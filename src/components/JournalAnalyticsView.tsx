import React, { useState } from 'react';
import { 
  BarChart3, 
  BookMarked, 
  Award, 
  Calendar, 
  Star, 
  Plus, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Clock,
  Compass,
  Trophy
} from 'lucide-react';
import { Skill, DailyTask, StudySession, DailyReflection, Badge, UserProfile } from '../types';
import { playNotificationSound, triggerCelebration } from '../services/storage';

interface JournalAnalyticsViewProps {
  skills: Skill[];
  tasks: DailyTask[];
  sessions: StudySession[];
  reflections: DailyReflection[];
  badges: Badge[];
  profile: UserProfile;
  onAddReflection: (reflection: DailyReflection) => void;
}

export const JournalAnalyticsView: React.FC<JournalAnalyticsViewProps> = ({
  skills,
  tasks,
  sessions,
  reflections,
  badges,
  profile,
  onAddReflection,
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'analytics' | 'badges'>('journal');

  // Form state for today's reflection
  const todayStr = new Date().toISOString().split('T')[0];
  const existingTodayReflection = reflections.find(r => r.date === todayStr);

  const [summary, setSummary] = useState(existingTodayReflection?.summary || '');
  const [keyLearnings, setKeyLearnings] = useState(existingTodayReflection?.keyLearnings || '');
  const [tomorrowGoals, setTomorrowGoals] = useState(existingTodayReflection?.tomorrowGoals || '');
  const [rating, setRating] = useState(existingTodayReflection?.rating || 5);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const newReflection: DailyReflection = {
      id: existingTodayReflection?.id || `refl-${Date.now()}`,
      date: todayStr,
      summary: summary.trim(),
      keyLearnings: keyLearnings.trim(),
      tomorrowGoals: tomorrowGoals.trim(),
      rating: rating,
    };

    onAddReflection(newReflection);
    playNotificationSound('ding');
    triggerCelebration();
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  // Analytics calculation
  const totalStudiedMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalTasksCompleted = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Beranda</span>
            <span aria-hidden="true">/</span>
            <span>Jurnal, Evaluasi & Statistik Belajar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Refleksi & Analitik Belajar
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Dokumentasikan wawasan baru, pantau sebaran jam belajar, dan raih lencana pencapaian.
          </p>
        </div>

        {/* Segmented Sub-navigation */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'journal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Jurnal Harian</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analitik Waktu</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'badges' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Pencapaian & Lencana</span>
          </button>
        </div>
      </div>

      {/* TAB 1: JURNAL HARIAN */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Refleksi Hari Ini */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Refleksi Hari Ini</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setRating(val)}
                      className="cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          val <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveReflection} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Rangkuman Aktivitas & Materi yang Dipelajari Hari Ini
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Contoh: Hari ini fokus mendalami penanganan pagination dan caching di TanStack Query serta latihan speaking kosakata tech..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Wawasan Kunci / Hal Baru yang Dipahami (Aha! Moment)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Mengerti bagaimana garbage collection membebaskan memori pada closures yang tidak lagi memiliki referensi..."
                    value={keyLearnings}
                    onChange={(e) => setKeyLearnings(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Prioritas & Target untuk Besok
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Lanjut modul filtering data Pandas dan selesaikan tugas PR review..."
                    value={tomorrowGoals}
                    onChange={(e) => setTomorrowGoals(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {isSavedSuccess && (
                    <span className="text-xs font-semibold text-emerald-600">
                      ✓ Refleksi berhasil disimpan!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Simpan Catatan Refleksi
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Riwayat Refleksi Hari-Hari Sebelumnya */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Refleksi ({reflections.length})
            </h3>

            <div className="space-y-3">
              {reflections.length === 0 ? (
                <p className="text-xs text-slate-400 p-6 bg-white rounded-xl border border-slate-200 text-center">
                  Belum ada catatan refleksi yang tersimpan.
                </p>
              ) : (
                reflections.map((refl) => (
                  <div key={refl.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {refl.date}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: refl.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {refl.summary}
                    </p>

                    {refl.keyLearnings && (
                      <div className="text-xs text-indigo-700 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
                        <strong className="block text-[11px] font-bold text-indigo-900 mb-0.5">Wawasan Kunci:</strong>
                        {refl.keyLearnings}
                      </div>
                    )}

                    {refl.tomorrowGoals && (
                      <div className="text-[11px] text-slate-500">
                        <strong>Target Besok:</strong> {refl.tomorrowGoals}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALITIK WAKTU & DISTRIBUSI */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Sesi Tercatat</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {sessions.length}
              </div>
              <span className="text-xs text-slate-400">Sesi terfokus</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Akumulasi Menit Belajar</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 mt-1">
                {totalStudiedMinutes}
              </div>
              <span className="text-xs text-slate-400">≈ {(totalStudiedMinutes / 60).toFixed(1)} Jam Produktif</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Tugas Selesai Terhubung</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
                {totalTasksCompleted}
              </div>
              <span className="text-xs text-slate-400">Dari seluruh modul</span>
            </div>
          </div>

          {/* Distribusi Jam Belajar per Skill */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Distribusi Waktu Belajar Berdasarkan Skill
            </h3>

            <div className="space-y-4">
              {skills.map((skill) => {
                const percent = Math.min(100, Math.round((skill.currentHours / skill.targetHours) * 100));

                return (
                  <div key={skill.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{skill.title}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {skill.currentHours.toFixed(1)} / {skill.targetHours} Jam ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabel Log Sesi Belajar Terakhir */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Riwayat Sesi Belajar Terkini
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Tanggal & Waktu</th>
                    <th className="py-2.5 px-4">Skill</th>
                    <th className="py-2.5 px-4">Durasi</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4">Catatan Sesi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.slice(0, 10).map((sess) => {
                    const sk = skills.find(s => s.id === sess.skillId);
                    const formattedDate = new Intl.DateTimeFormat('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    }).format(new Date(sess.completedAt));

                    return (
                      <tr key={sess.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                          {formattedDate}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {sk?.title || 'Umum'}
                        </td>
                        <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-indigo-600">
                          {sess.durationMinutes} Menit
                        </td>
                        <td className="py-2.5 px-4 capitalize text-slate-600">
                          {sess.mode === 'pomodoro' ? 'Pomodoro' : 'Stopwatch'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs">
                          {sess.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENCAPAIAN & LENCANA (BADGES) */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold mb-1">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Pencapaian & Milestone Pengguna</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                {profile.name} · Level {Math.floor(profile.totalXp / 500) + 1}
              </h2>
              <p className="text-xs text-indigo-200 mt-1">
                Total Akumulasi: <strong className="text-white font-mono">{profile.totalXp} XP</strong>. Selesaikan tugas dan sesi fokus untuk membuka lebih banyak lencana!
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center shrink-0">
              <span className="text-[11px] text-indigo-200 font-medium">Lencana Terbuka</span>
              <div className="text-xl font-bold font-mono">
                {badges.filter(b => b.unlocked).length} / {badges.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  badge.unlocked
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      badge.unlocked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      {badge.unlocked ? '✓ Terbuka' : `${badge.progress}%`}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{badge.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${badge.unlocked ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  {badge.unlockedAt && (
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      Didapatkan: {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
