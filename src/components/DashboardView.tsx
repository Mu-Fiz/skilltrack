import React from 'react';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Award, 
  Play, 
  ArrowRight, 
  Plus, 
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Skill, DailyTask, UserProfile } from '../types';
import { playNotificationSound, triggerCelebration } from '../services/storage';

interface DashboardViewProps {
  profile: UserProfile;
  skills: Skill[];
  tasks: DailyTask[];
  onToggleTask: (taskId: string) => void;
  onNavigateToTasks: () => void;
  onNavigateToSkills: () => void;
  onStartFocus: (skillId?: string, taskId?: string) => void;
  onOpenNewTask: () => void;
  onSelectSkill: (skill: Skill) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  skills,
  tasks,
  onToggleTask,
  onNavigateToTasks,
  onNavigateToSkills,
  onStartFocus,
  onOpenNewTask,
  onSelectSkill,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Filter today's tasks
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed');
  const pendingTodayTasks = todayTasks.filter(t => t.status !== 'completed');

  // Calculate total study hours across all skills
  const totalStudiedHours = skills.reduce((acc, s) => acc + s.currentHours, 0);

  // High priority task to focus on right now
  const nextUpTask = pendingTodayTasks[0] || tasks.find(t => t.status === 'in_progress') || tasks.find(t => t.status === 'todo');

  const handleTaskCheck = (taskId: string, isCurrentlyCompleted: boolean) => {
    onToggleTask(taskId);
    if (!isCurrentlyCompleted) {
      playNotificationSound('complete');
      triggerCelebration();
    } else {
      playNotificationSound('ding');
    }
  };

  // Recent 14-day consistency strip
  const renderConsistencyDays = () => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayDateStr = d.toISOString().split('T')[0];
      const isToday = dayDateStr === todayStr;
      
      // Active if within current streak days
      const isActive = i < profile.dailyStreak;
      
      days.push(
        <div key={dayDateStr} className="flex flex-col items-center gap-1">
          <div 
            title={`${dayDateStr}: ${isActive ? 'Aktif Belajar' : 'Tidak Ada Sesi'}`}
            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono transition-all ${
              isActive 
                ? 'bg-emerald-600 text-white font-medium shadow-xs' 
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
          >
            {d.getDate()}
          </div>
          <span className="text-[10px] text-slate-400">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()]}
          </span>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Beranda</span>
            <span aria-hidden="true">/</span>
            <span>Ikhtisar Produktivitas</span>
            <span aria-hidden="true">/</span>
            <span>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Semangat Belajar, {profile.name}!
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pantau kemajuan kompetensi teknis dan selesaikan target harianmu secara konsisten.
          </p>
        </div>

        {/* Quick Focus Button if there is a pending task */}
        {nextUpTask && (
          <div className="flex items-center gap-3 bg-indigo-50/80 border border-indigo-100 p-3 rounded-xl">
            <div className="flex-1 min-w-[200px]">
              <span className="text-xs font-semibold text-indigo-700 block">Fokus Berikutnya</span>
              <p className="text-xs font-medium text-slate-800 truncate">{nextUpTask.title}</p>
            </div>
            <button
              onClick={() => onStartFocus(nextUpTask.skillId, nextUpTask.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Mulai Fokus</span>
            </button>
          </div>
        )}
      </div>

      {/* 4-Column Structured Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Streak */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Rentetan Hari Belajar</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {profile.dailyStreak}
            </span>
            <span className="text-xs text-slate-500 font-medium">Hari Beruntun</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <span>Terus pertahankan ritme belajar harian!</span>
          </p>
        </div>

        {/* Metric 2: Waktu Belajar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Akumulasi Belajar</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalStudiedHours.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 font-medium">Jam Total</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalStudiedHours / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Tugas Hari Ini */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tugas Hari Ini</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {completedTodayTasks.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {todayTasks.length} Selesai</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {todayTasks.length > 0 
              ? `${Math.round((completedTodayTasks.length / todayTasks.length) * 100)}% terselesaikan` 
              : 'Belum ada target hari ini'}
          </p>
        </div>

        {/* Metric 4: EXP / Level */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Poin Kemahiran (XP)</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {profile.totalXp.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500 font-medium">XP</span>
          </div>
          <p className="text-xs text-purple-600 font-medium mt-2">
            Level {Math.floor(profile.totalXp / 500) + 1} · Pelajar Tekun
          </p>
        </div>
      </div>

      {/* Main Content Split: Agenda Tugas Hari Ini (Left) & Konsistensi + Skill Tracker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Agenda Tugas Hari Ini (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Agenda Hari Ini</h2>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                ({completedTodayTasks.length}/{todayTasks.length})
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenNewTask}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tugas</span>
              </button>
              <button
                onClick={onNavigateToTasks}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Belum ada tugas terjadwal untuk hari ini</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Rencanakan sesi belajarmu hari ini dengan menambahkan tugas baru yang terhubung ke skill.
              </p>
              <button
                onClick={onOpenNewTask}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                + Tambah Tugas Hari Ini
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {todayTasks.map((task) => {
                const linkedSkill = skills.find(s => s.id === task.skillId);
                const isCompleted = task.status === 'completed';

                return (
                  <div 
                    key={task.id}
                    className={`p-4 flex items-start gap-3.5 transition-colors hover:bg-slate-50/70 ${
                      isCompleted ? 'bg-slate-50/40 opacity-75' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleTaskCheck(task.id, isCompleted)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-indigo-600 transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className={`text-sm font-semibold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Unboxed Metadata Line */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                        {linkedSkill && (
                          <>
                            <span className="text-indigo-600 font-medium">{linkedSkill.title}</span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span className={`capitalize ${
                          task.priority === 'urgent' ? 'text-rose-600 font-bold' :
                          task.priority === 'high' ? 'text-amber-600 font-semibold' :
                          'text-slate-500'
                        }`}>
                          Prioritas {task.priority === 'urgent' ? 'Mendesak' : task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{task.estimatedMinutes} Menit</span>
                      </div>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => onStartFocus(task.skillId, task.id)}
                        title="Fokuskan tugas ini di timer"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Konsistensi Belajar 14 Hari */}
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Ritme Konsistensi (14 Hari)</h3>
              </div>
              <span className="text-xs text-slate-500">
                Streak Aktif: <strong className="text-slate-900 font-mono">{profile.dailyStreak} Hari</strong>
              </span>
            </div>
            
            <div className="flex items-center justify-between overflow-x-auto py-1">
              {renderConsistencyDays()}
            </div>
          </div>
        </div>

        {/* Right Column: Skill yang Sedang Dipelajari (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Skill yang Sedang Aktif</h2>
            <button
              onClick={onNavigateToSkills}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola Roadmap</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {skills.slice(0, 3).map((skill) => {
              const completedTopicsCount = skill.topics.filter(t => t.completed).length;
              const totalTopicsCount = skill.topics.length;
              const percentTopics = totalTopicsCount > 0 
                ? Math.round((completedTopicsCount / totalTopicsCount) * 100) 
                : 0;
              const percentHours = Math.min(100, Math.round((skill.currentHours / skill.targetHours) * 100));

              return (
                <div 
                  key={skill.id}
                  onClick={() => onSelectSkill(skill)}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span>{skill.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-indigo-600">{skill.level}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {skill.title}
                      </h4>
                    </div>
                    
                    <span className="text-xs font-mono tabular-nums font-bold text-slate-700">
                      {percentHours}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {skill.description}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentHours}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2.5 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      {skill.currentHours.toFixed(1)} / {skill.targetHours} Jam
                    </span>
                    <span>
                      {completedTopicsCount}/{totalTopicsCount} Topik Selesai
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick AI Roadmap Generator Teaser */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100/80">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-950">Ingin Menguasai Skill Baru?</h4>
                <p className="text-xs text-indigo-700/80 mt-0.5">
                  Gunakan Generator Kurikulum untuk menyusun roadmap materi terstruktur & latihan tugas otomatis.
                </p>
                <button
                  onClick={onNavigateToSkills}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Buka Katalog & Buat Roadmap</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
