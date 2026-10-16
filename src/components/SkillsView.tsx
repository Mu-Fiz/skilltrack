import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Search, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Play, 
  Trash2, 
  Edit3, 
  ExternalLink,
  FileText,
  X,
  Check,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Skill, SkillCategory, SkillTopic, SkillNote, DailyTask } from '../types';
import { generateLearningRoadmap, GeneratedRoadmap } from '../services/aiRoadmap';
import { playNotificationSound, triggerCelebration } from '../services/storage';

interface SkillsViewProps {
  skills: Skill[];
  onAddSkill: (newSkill: Skill) => void;
  onUpdateSkill: (updatedSkill: Skill) => void;
  onDeleteSkill: (skillId: string) => void;
  onStartFocus: (skillId?: string) => void;
  onAddGeneratedTasks: (tasks: Array<Omit<DailyTask, 'id' | 'createdAt' | 'spentMinutes'>>) => void;
  selectedSkillForDetail?: Skill | null;
  onCloseSkillDetail?: () => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skills,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onStartFocus,
  onAddGeneratedTasks,
  selectedSkillForDetail,
  onCloseSkillDetail,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSkillInput, setAiSkillInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<GeneratedRoadmap | null>(null);

  // Manual Add/Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);

  // Active detail modal
  const [activeSkillModal, setActiveSkillModal] = useState<Skill | null>(selectedSkillForDetail || null);

  // Synchronize when parent passes selectedSkillForDetail
  React.useEffect(() => {
    if (selectedSkillForDetail) {
      setActiveSkillModal(selectedSkillForDetail);
    }
  }, [selectedSkillForDetail]);

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'Frontend', label: 'Frontend' },
    { id: 'Backend', label: 'Backend' },
    { id: 'Data', label: 'Data & AI' },
    { id: 'Design', label: 'UI/UX Desain' },
    { id: 'Language', label: 'Bahasa' },
    { id: 'DevOps', label: 'DevOps' },
    { id: 'Mobile', label: 'Mobile' },
  ];

  // Filtering
  const filteredSkills = skills.filter((skill) => {
    const matchesCategory = activeCategory === 'all' || skill.category === activeCategory;
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle topic completion toggle
  const handleToggleTopic = (skill: Skill, topicId: string) => {
    const updatedTopics = skill.topics.map((t) => {
      if (t.id === topicId) {
        const nextState = !t.completed;
        if (nextState) {
          playNotificationSound('complete');
          triggerCelebration();
        } else {
          playNotificationSound('ding');
        }
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    const updatedSkill: Skill = {
      ...skill,
      topics: updatedTopics,
    };

    onUpdateSkill(updatedSkill);
    if (activeSkillModal?.id === skill.id) {
      setActiveSkillModal(updatedSkill);
    }
  };

  // Add new topic manually inside detail
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicHours, setNewTopicHours] = useState('8');

  const handleAddTopic = (skill: Skill) => {
    if (!newTopicTitle.trim()) return;
    const newTopic: SkillTopic = {
      id: `top-${Date.now()}`,
      title: newTopicTitle.trim(),
      completed: false,
      hoursEstimate: parseFloat(newTopicHours) || 6,
    };
    const updatedSkill: Skill = {
      ...skill,
      topics: [...skill.topics, newTopic],
    };
    onUpdateSkill(updatedSkill);
    setActiveSkillModal(updatedSkill);
    setNewTopicTitle('');
    setNewTopicHours('8');
  };

  // Add note inside detail
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = (skill: Skill) => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const newNote: SkillNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updatedSkill: Skill = {
      ...skill,
      notes: [newNote, ...skill.notes],
    };
    onUpdateSkill(updatedSkill);
    setActiveSkillModal(updatedSkill);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  // AI Roadmap generation
  const handleGenerateAi = async () => {
    if (!aiSkillInput.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await generateLearningRoadmap(aiSkillInput);
      setAiGeneratedResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiRoadmap = () => {
    if (!aiGeneratedResult) return;

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      title: aiGeneratedResult.title,
      category: aiGeneratedResult.category,
      description: aiGeneratedResult.description,
      level: aiGeneratedResult.level,
      currentHours: 0,
      targetHours: aiGeneratedResult.targetHours,
      color: 'indigo',
      createdAt: new Date().toISOString().split('T')[0],
      topics: aiGeneratedResult.topics.map((t, idx) => ({
        id: `top-${Date.now()}-${idx}`,
        title: t.title,
        completed: false,
        hoursEstimate: t.hoursEstimate,
      })),
      notes: [],
    };

    onAddSkill(newSkill);

    // Also add suggested tasks if any
    if (aiGeneratedResult.suggestedTasks && aiGeneratedResult.suggestedTasks.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const tasksToCreate = aiGeneratedResult.suggestedTasks.map((task) => ({
        title: task.title,
        description: task.description,
        skillId: newSkill.id,
        priority: task.priority,
        status: 'todo' as const,
        dueDate: todayStr,
        estimatedMinutes: task.estimatedMinutes,
        tags: [newSkill.category, 'Latihan Praktik'],
      }));
      onAddGeneratedTasks(tasksToCreate);
    }

    setIsAiModalOpen(false);
    setAiGeneratedResult(null);
    setAiSkillInput('');
    playNotificationSound('complete');
    triggerCelebration();
  };

  // Manual save
  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.title?.trim()) return;

    if (editingSkill.id) {
      // update
      onUpdateSkill(editingSkill as Skill);
      if (activeSkillModal?.id === editingSkill.id) {
        setActiveSkillModal(editingSkill as Skill);
      }
    } else {
      // create new
      const created: Skill = {
        id: `skill-${Date.now()}`,
        title: editingSkill.title.trim(),
        category: (editingSkill.category as SkillCategory) || 'Frontend',
        description: editingSkill.description || '',
        level: editingSkill.level || 'Pemula',
        currentHours: editingSkill.currentHours || 0,
        targetHours: editingSkill.targetHours || 50,
        color: editingSkill.color || 'indigo',
        topics: [],
        notes: [],
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddSkill(created);
    }

    setIsEditModalOpen(false);
    setEditingSkill(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span>Beranda</span>
            <span aria-hidden="true">/</span>
            <span>Skill & Kurikulum Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Matriks & Kemajuan Skill
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Kelola peta kompetensi, sub-topik pembelajaran, dan akumulasi jam terbang secara terstruktur.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAiGeneratedResult(null);
              setIsAiModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Roadmap Planner</span>
          </button>

          <button
            onClick={() => {
              setEditingSkill({
                title: '',
                category: 'Frontend',
                description: '',
                level: 'Pemula',
                currentHours: 0,
                targetHours: 60,
                color: 'indigo',
              });
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Skill Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filter Tabs (Interactive Segmented Control) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama skill atau materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Tidak ada skill yang ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery 
              ? `Tidak ada hasil untuk pencarian "${searchQuery}". Coba kata kunci lain.`
              : 'Mulai petualangan belajarmu dengan menambahkan skill target atau gunakan AI Roadmap Planner.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              ✨ Buat dengan AI
            </button>
            <button
              onClick={() => {
                setEditingSkill({
                  title: '',
                  category: 'Frontend',
                  description: '',
                  level: 'Pemula',
                  currentHours: 0,
                  targetHours: 60,
                });
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              + Buat Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill) => {
            const completedTopics = skill.topics.filter((t) => t.completed).length;
            const totalTopics = skill.topics.length;
            const percentHours = Math.min(100, Math.round((skill.currentHours / skill.targetHours) * 100));
            const percentTopics = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return (
              <div
                key={skill.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  {/* Clean unboxed metadata line */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{skill.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-600 font-medium">{skill.level}</span>
                    </div>

                    <span className="font-mono tabular-nums font-semibold text-slate-800">
                      {percentHours}%
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 
                    onClick={() => setActiveSkillModal(skill)}
                    className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {skill.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentHours}%` }}
                    />
                  </div>

                  {/* Stats line */}
                  <div className="flex items-center justify-between mt-2.5 text-xs text-slate-500">
                    <span className="font-mono tabular-nums font-medium text-slate-700">
                      {skill.currentHours.toFixed(1)} / {skill.targetHours} Jam
                    </span>
                    <span className="font-mono tabular-nums">
                      {completedTopics}/{totalTopics} Topik ({percentTopics}%)
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onStartFocus(skill.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-700" />
                    <span>Mulai Fokus</span>
                  </button>

                  <button
                    onClick={() => setActiveSkillModal(skill)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Detail & Roadmap</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL / DRAWER */}
      {activeSkillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>{activeSkillModal.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-indigo-600">{activeSkillModal.level}</span>
                  <span aria-hidden="true">·</span>
                  <span>Dibuat: {activeSkillModal.createdAt}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {activeSkillModal.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {activeSkillModal.description}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingSkill(activeSkillModal);
                    setIsEditModalOpen(true);
                  }}
                  title="Edit Skill"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus skill "${activeSkillModal.title}"?`)) {
                      onDeleteSkill(activeSkillModal.id);
                      setActiveSkillModal(null);
                      if (onCloseSkillDetail) onCloseSkillDetail();
                    }
                  }}
                  title="Hapus Skill"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveSkillModal(null);
                    if (onCloseSkillDetail) onCloseSkillDetail();
                  }}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Progress Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">Waktu Belajar</span>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {activeSkillModal.currentHours.toFixed(1)} / {activeSkillModal.targetHours} Jam
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500">Topik Selesai</span>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {activeSkillModal.topics.filter(t => t.completed).length} / {activeSkillModal.topics.length} Topik
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-medium text-slate-500">Progres Penguasaan</span>
                  <div className="text-base font-bold font-mono tabular-nums text-indigo-600 mt-0.5">
                    {Math.min(100, Math.round((activeSkillModal.currentHours / activeSkillModal.targetHours) * 100))}%
                  </div>
                </div>
              </div>

              {/* Sub-Topics / Roadmap Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Kurikulum & Topik Pembelajaran</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Centang materi yang telah dipelajari
                  </span>
                </div>

                <div className="space-y-2">
                  {activeSkillModal.topics.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      Belum ada sub-topik. Tambahkan materi di bawah ini.
                    </p>
                  ) : (
                    activeSkillModal.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                          topic.completed
                            ? 'bg-slate-50 border-slate-200 text-slate-500'
                            : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-200'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleTopic(activeSkillModal, topic.id)}
                          className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                        >
                          {topic.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 fill-emerald-50" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 shrink-0 hover:text-indigo-600" />
                          )}
                          <span className={`text-xs font-semibold ${topic.completed ? 'line-through text-slate-400' : ''}`}>
                            {topic.title}
                          </span>
                        </button>

                        <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                          ~{topic.hoursEstimate} Jam
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Topic Input Inline */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tambah topik materi baru..."
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Jam"
                    value={newTopicHours}
                    onChange={(e) => setNewTopicHours(e.target.value)}
                    className="w-16 px-2 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-center"
                  />
                  <button
                    onClick={() => handleAddTopic(activeSkillModal)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Learning Notes & Insights */}
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Catatan & Ringkasan Belajar ({activeSkillModal.notes.length})</span>
                  </h3>
                  
                  {!isAddingNote && (
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tulis Catatan</span>
                    </button>
                  )}
                </div>

                {isAddingNote && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Judul Catatan (contoh: Memoization di React 19)"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                    <textarea
                      rows={3}
                      placeholder="Tuliskan rangkuman, rumus, sintaks penting, atau kendala yang dihadapi..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsAddingNote(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleAddNote(activeSkillModal)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {activeSkillModal.notes.length === 0 && !isAddingNote ? (
                    <p className="text-xs text-slate-500 italic">
                      Belum ada catatan materi untuk skill ini. Catat hal penting saat belajar.
                    </p>
                  ) : (
                    activeSkillModal.notes.map((note) => (
                      <div key={note.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-1 text-xs">
                          <h4 className="font-bold text-slate-900">{note.title}</h4>
                          <span className="text-slate-400 font-mono text-[11px]">{note.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={() => {
                  onStartFocus(activeSkillModal.id);
                  setActiveSkillModal(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Mulai Sesi Fokus untuk Skill Ini</span>
              </button>

              <button
                onClick={() => {
                  setActiveSkillModal(null);
                  if (onCloseSkillDetail) onCloseSkillDetail();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI ROADMAP GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">AI Roadmap & Curriculum Generator</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Skill atau Bidang yang Ingin Dipelajari
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Golang Backend, Flutter Mobile, Machine Learning..."
                    value={aiSkillInput}
                    onChange={(e) => setAiSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerateAi();
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleGenerateAi}
                    disabled={isAiLoading || !aiSkillInput.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyusun...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Rancang</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 flex-wrap">
                  <span>Coba preset:</span>
                  {['golang', 'flutter', 'devops', 'ai'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAiSkillInput(preset);
                      }}
                      className="text-indigo-600 hover:underline cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Preview */}
              {aiGeneratedResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 max-h-[50vh] overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{aiGeneratedResult.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>Target: {aiGeneratedResult.targetHours} Jam</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {aiGeneratedResult.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">{aiGeneratedResult.description}</p>

                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1.5">
                      Topik Kurikulum yang Dihasilkan ({aiGeneratedResult.topics.length}):
                    </h5>
                    <ul className="space-y-1">
                      {aiGeneratedResult.topics.map((t, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                          <span>{t.title}</span>
                          <span className="font-mono text-slate-400 text-[11px]">~{t.hoursEstimate} Jam</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {aiGeneratedResult.suggestedTasks && aiGeneratedResult.suggestedTasks.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 mb-1.5">
                        Latihan Tugas Praktis Langsung:
                      </h5>
                      <div className="space-y-1">
                        {aiGeneratedResult.suggestedTasks.map((task, idx) => (
                          <div key={idx} className="text-xs bg-white p-2 rounded-lg border border-slate-200">
                            <span className="font-semibold text-slate-900 block">{task.title}</span>
                            <span className="text-slate-500 text-[11px]">{task.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              {aiGeneratedResult && (
                <button
                  onClick={handleApplyAiRoadmap}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Tambahkan ke Skill Saya</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADD / EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingSkill?.id ? 'Edit Skill' : 'Tambah Skill Baru'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Skill
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Arsitektur Microservices, Flutter, Rust..."
                  value={editingSkill?.title || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={editingSkill?.category || 'Frontend'}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as SkillCategory })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Data">Data & AI</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Language">Bahasa</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tingkat Kemahiran
                  </label>
                  <select
                    value={editingSkill?.level || 'Pemula'}
                    onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Pemula">Pemula</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Mahir">Mahir</option>
                    <option value="Ahli">Ahli</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Deskripsi / Fokus Pembelajaran
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan apa yang ingin kamu capai dalam skill ini..."
                  value={editingSkill?.description || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Jam Belajar
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={editingSkill?.targetHours || 50}
                    onChange={(e) => setEditingSkill({ ...editingSkill, targetHours: parseFloat(e.target.value) || 50 })}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Jam Selesai Saat Ini
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editingSkill?.currentHours || 0}
                    onChange={(e) => setEditingSkill({ ...editingSkill, currentHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Simpan Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
