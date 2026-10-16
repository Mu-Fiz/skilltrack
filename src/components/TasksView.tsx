import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Play, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Columns, 
  ListFilter,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { DailyTask, TaskPriority, TaskStatus, Skill } from '../types';
import { playNotificationSound, triggerCelebration } from '../services/storage';

interface TasksViewProps {
  tasks: DailyTask[];
  skills: Skill[];
  onAddTask: (task: DailyTask) => void;
  onUpdateTask: (task: DailyTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTask: (taskId: string) => void;
  onStartFocus: (skillId?: string, taskId?: string) => void;
  isCreateModalOpen?: boolean;
  onCloseCreateModal?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  skills,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onStartFocus,
  isCreateModalOpen = false,
  onCloseCreateModal,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(isCreateModalOpen);
  const [editingTask, setEditingTask] = useState<Partial<DailyTask> | null>(null);

  React.useEffect(() => {
    if (isCreateModalOpen) {
      const todayStr = new Date().toISOString().split('T')[0];
      setEditingTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: todayStr,
        estimatedMinutes: 30,
        tags: [],
      });
      setIsModalOpen(true);
    }
  }, [isCreateModalOpen]);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSkill = selectedSkillFilter === 'all' || task.skillId === selectedSkillFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || task.priority === selectedPriorityFilter;
    return matchesSearch && matchesSkill && matchesPriority;
  });

  const handleTaskCheckbox = (taskId: string, isCurrentlyCompleted: boolean) => {
    onToggleTask(taskId);
    if (!isCurrentlyCompleted) {
      playNotificationSound('complete');
      triggerCelebration();
    } else {
      playNotificationSound('ding');
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask?.title?.trim()) return;

    if (editingTask.id) {
      onUpdateTask(editingTask as DailyTask);
    } else {
      const newTask: DailyTask = {
        id: `task-${Date.now()}`,
        title: editingTask.title.trim(),
        description: editingTask.description || '',
        skillId: editingTask.skillId || undefined,
        priority: (editingTask.priority as TaskPriority) || 'medium',
        status: (editingTask.status as TaskStatus) || 'todo',
        dueDate: editingTask.dueDate || todayStr,
        estimatedMinutes: editingTask.estimatedMinutes || 30,
        spentMinutes: 0,
        createdAt: todayStr,
        tags: editingTask.tags || [],
      };
      onAddTask(newTask);
      playNotificationSound('ding');
    }

    setIsModalOpen(false);
    setEditingTask(null);
    if (onCloseCreateModal) onCloseCreateModal();
  };

  // Grouping for List view
  const todayTasks = filteredTasks.filter(t => t.dueDate === todayStr && t.status !== 'completed');
  const tomorrowTasks = filteredTasks.filter(t => t.dueDate === tomorrowStr && t.status !== 'completed');
  const upcomingTasks = filteredTasks.filter(t => t.dueDate > tomorrowStr && t.status !== 'completed');
  const overdueTasks = filteredTasks.filter(t => t.dueDate < todayStr && t.status !== 'completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  // Priority helper
  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return { label: 'Mendesak', color: 'text-rose-600 font-bold' };
      case 'high': return { label: 'Tinggi', color: 'text-amber-600 font-semibold' };
      case 'medium': return { label: 'Sedang', color: 'text-slate-600 font-medium' };
      case 'low': return { label: 'Rendah', color: 'text-slate-400 font-normal' };
    }
  };

  const renderTaskCard = (task: DailyTask, isCompact: boolean = false) => {
    const linkedSkill = skills.find(s => s.id === task.skillId);
    const isCompleted = task.status === 'completed';
    const prio = getPriorityLabel(task.priority);

    return (
      <div 
        key={task.id}
        className={`p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between gap-3 group ${
          isCompleted ? 'bg-slate-50/50 opacity-75' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => handleTaskCheckbox(task.id, isCompleted)}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
            ) : (
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-indigo-600 transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {task.title}
            </h4>

            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Zero-Pill metadata row */}
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 flex-wrap">
              {linkedSkill && (
                <>
                  <span className="text-indigo-600 font-medium">{linkedSkill.title}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className={prio.color}>{prio.label}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{task.estimatedMinutes} Menit</span>
              {task.dueDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-400">{task.dueDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Task Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1">
            {!isCompleted && (
              <button
                onClick={() => onStartFocus(task.skillId, task.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-indigo-700" />
                <span>Fokus</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setEditingTask(task);
                setIsModalOpen(true);
              }}
              title="Edit Tugas"
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Hapus tugas "${task.title}"?`)) {
                  onDeleteTask(task.id);
                }
              }}
              title="Hapus Tugas"
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Beranda</span>
            <span aria-hidden="true">/</span>
            <span>Manajemen Tugas Harian</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tugas & Aktivitas Harian
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Atur prioritas latihan, hubungkan dengan skill, dan selesaikan target harianmu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle (Segmented control) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask({
                title: '',
                description: '',
                priority: 'medium',
                status: 'todo',
                dueDate: todayStr,
                estimatedMinutes: 30,
                tags: [],
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedSkillFilter}
            onChange={(e) => setSelectedSkillFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
          >
            <option value="all">Semua Skill</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
          >
            <option value="all">Semua Prioritas</option>
            <option value="urgent">Mendesak</option>
            <option value="high">Tinggi</option>
            <option value="medium">Sedang</option>
            <option value="low">Rendah</option>
          </select>
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Belum Mulai (Todo) */}
          <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">Belum Mulai</span>
              <span className="text-xs font-mono tabular-nums text-slate-500 font-semibold">
                {filteredTasks.filter(t => t.status === 'todo').length}
              </span>
            </div>
            <div className="space-y-3">
              {filteredTasks.filter(t => t.status === 'todo').map((task) => renderTaskCard(task))}
              {filteredTasks.filter(t => t.status === 'todo').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Tidak ada tugas di antrian</p>
              )}
            </div>
          </div>

          {/* Column 2: Sedang Dikerjakan (In Progress) */}
          <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-indigo-700">Sedang Dikerjakan</span>
              <span className="text-xs font-mono tabular-nums text-indigo-700 font-semibold">
                {filteredTasks.filter(t => t.status === 'in_progress').length}
              </span>
            </div>
            <div className="space-y-3">
              {filteredTasks.filter(t => t.status === 'in_progress').map((task) => renderTaskCard(task))}
              {filteredTasks.filter(t => t.status === 'in_progress').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada tugas yang aktif berjalan</p>
              )}
            </div>
          </div>

          {/* Column 3: Selesai (Completed) */}
          <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-emerald-700">Selesai</span>
              <span className="text-xs font-mono tabular-nums text-emerald-700 font-semibold">
                {filteredTasks.filter(t => t.status === 'completed').length}
              </span>
            </div>
            <div className="space-y-3">
              {filteredTasks.filter(t => t.status === 'completed').map((task) => renderTaskCard(task))}
              {filteredTasks.filter(t => t.status === 'completed').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada tugas yang diselesaikan</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW: GROUPED LIST */
        <div className="space-y-6">
          {/* Overdue alert section if any */}
          {overdueTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Melewati Batas Waktu ({overdueTasks.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overdueTasks.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}

          {/* Hari Ini */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Hari Ini</span>
                <span className="text-xs font-mono tabular-nums text-slate-400">({todayTasks.length})</span>
              </h3>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-4 rounded-xl border border-slate-200">
                Tidak ada tugas tertunda untuk hari ini.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {todayTasks.map((t) => renderTaskCard(t))}
              </div>
            )}
          </div>

          {/* Besok */}
          {tomorrowTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Besok</span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">({tomorrowTasks.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tomorrowTasks.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}

          {/* Mendatang */}
          {upcomingTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Mendatang & Terjadwal</span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">({upcomingTasks.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingTasks.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}

          {/* Selesai */}
          {completedTasks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <span>Telah Diselesaikan</span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">({completedTasks.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedTasks.map((t) => renderTaskCard(t))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingTask?.id ? 'Edit Tugas Harian' : 'Tambah Tugas Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onCloseCreateModal) onCloseCreateModal();
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Judul Tugas / Aktivitas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selesaikan latihan modul REST API TanStack Query..."
                  value={editingTask?.title || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Keterangan / Rincian Langkah (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan kecil tentang apa yang harus diselesaikan..."
                  value={editingTask?.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hubungkan ke Skill
                  </label>
                  <select
                    value={editingTask?.skillId || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, skillId: e.target.value || undefined })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="">(Tidak Terhubung / Umum)</option>
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={editingTask?.priority || 'medium'}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="urgent">Mendesak (Urgent)</option>
                    <option value="high">Tinggi (High)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="low">Rendah (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={editingTask?.dueDate || todayStr}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Estimasi Waktu (Menit)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    max="300"
                    value={editingTask?.estimatedMinutes || 30}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (onCloseCreateModal) onCloseCreateModal();
                  }}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
