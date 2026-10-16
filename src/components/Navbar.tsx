import React from 'react';
import { 
  Compass, 
  CheckSquare, 
  Timer, 
  BarChart3, 
  LayoutDashboard, 
  Plus, 
  Database,
  Flame
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'skills' | 'tasks' | 'focus' | 'journal';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewTask: () => void;
  onOpenDataModal: () => void;
  dailyStreak: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTask,
  onOpenDataModal,
  dailyStreak,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 lg:gap-8">
          {/* Zone 1: Brand Wordmark (Single text element in display face, no taglines) */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                SkillTrack
              </span>
            </button>

            {/* Streak Indicator as quiet unboxed text */}
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs font-semibold text-amber-700">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-mono tabular-nums">{dailyStreak} Hari</span>
              <span className="text-slate-400 font-normal">Streak</span>
            </div>
          </div>

          {/* Zone 2: 4-5 Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ikhtisar</span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'skills'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Skill & Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'tasks'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tugas Harian</span>
            </button>

            <button
              onClick={() => setActiveTab('focus')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'focus'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Sesi Fokus</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-lg whitespace-nowrap cursor-pointer ${
                activeTab === 'journal'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Jurnal & Analitik</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Utility Backup */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenDataModal}
              title="Cadangan & Pengaturan Data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar at bottom */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-1.5 px-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Ikhtisar</span>
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            activeTab === 'skills' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Skill</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            activeTab === 'tasks' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          <span>Tugas</span>
        </button>
        <button
          onClick={() => setActiveTab('focus')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            activeTab === 'focus' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Timer className="w-4 h-4 mb-0.5" />
          <span>Fokus</span>
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            activeTab === 'journal' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>Jurnal</span>
        </button>
      </div>
    </header>
  );
};
