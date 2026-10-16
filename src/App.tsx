import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SkillsView } from './components/SkillsView';
import { TasksView } from './components/TasksView';
import { FocusTimerView } from './components/FocusTimerView';
import { JournalAnalyticsView } from './components/JournalAnalyticsView';
import { DataManagementModal } from './components/DataManagementModal';
import { 
  UserProfile, 
  Skill, 
  DailyTask, 
  StudySession, 
  DailyReflection, 
  Badge 
} from './types';
import { 
  getStoredData, 
  saveStoredData, 
  resetStoredData,
  triggerCelebration,
  playNotificationSound 
} from './services/storage';

export default function App() {
  const initialData = getStoredData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(initialData.profile);
  const [skills, setSkills] = useState<Skill[]>(initialData.skills);
  const [tasks, setTasks] = useState<DailyTask[]>(initialData.tasks);
  const [sessions, setSessions] = useState<StudySession[]>(initialData.sessions);
  const [reflections, setReflections] = useState<DailyReflection[]>(initialData.reflections);
  const [badges, setBadges] = useState<Badge[]>(initialData.badges);

  // Cross-view deep linking
  const [focusTargetSkillId, setFocusTargetSkillId] = useState<string | undefined>();
  const [focusTargetTaskId, setFocusTargetTaskId] = useState<string | undefined>();
  const [selectedSkillForDetail, setSelectedSkillForDetail] = useState<Skill | null>(null);

  // Global modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Save to localStorage when state changes
  useEffect(() => {
    saveStoredData({
      profile,
      skills,
      tasks,
      sessions,
      reflections,
      badges,
    });
  }, [profile, skills, tasks, sessions, reflections, badges]);

  // Streak verification on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      const lastDate = new Date(profile.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 2) {
        // Streak broken
        setProfile((prev) => ({
          ...prev,
          dailyStreak: 1,
          lastActiveDate: today,
        }));
      }
    }
  }, []);

  // Update badges progress based on current metrics
  const evaluateBadges = (
    updatedTasks: DailyTask[], 
    updatedSessions: StudySession[], 
    currentStreak: number,
    totalHours: number
  ) => {
    const completedTasksCount = updatedTasks.filter(t => t.status === 'completed').length;
    const pomodoroSessionsCount = updatedSessions.filter(s => s.mode === 'pomodoro').length;

    setBadges((prevBadges) => 
      prevBadges.map((badge) => {
        if (badge.unlocked) return badge;

        let shouldUnlock = false;
        let progress = badge.progress;

        if (badge.id === 'badge-2') { // 5 Days streak
          progress = Math.min(100, Math.round((currentStreak / 5) * 100));
          if (currentStreak >= 5) shouldUnlock = true;
        } else if (badge.id === 'badge-3') { // 10 Pomodoro sessions
          progress = Math.min(100, Math.round((pomodoroSessionsCount / 10) * 100));
          if (pomodoroSessionsCount >= 10) shouldUnlock = true;
        } else if (badge.id === 'badge-4') { // 20 tasks completed
          progress = Math.min(100, Math.round((completedTasksCount / 20) * 100));
          if (completedTasksCount >= 20) shouldUnlock = true;
        } else if (badge.id === 'badge-6') { // 100 study hours
          progress = Math.min(100, Math.round((totalHours / 100) * 100));
          if (totalHours >= 100) shouldUnlock = true;
        }

        if (shouldUnlock) {
          triggerCelebration();
          return {
            ...badge,
            unlocked: true,
            progress: 100,
            unlockedAt: new Date().toISOString().split('T')[0],
          };
        }

        return { ...badge, progress };
      })
    );
  };

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];
    let xpGained = 0;

    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const isNowCompleted = task.status !== 'completed';
        xpGained = isNowCompleted ? 50 : -50;

        return {
          ...task,
          status: isNowCompleted ? ('completed' as const) : ('todo' as const),
          completedAt: isNowCompleted ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });

    setTasks(updatedTasks);

    // Update profile XP
    setProfile((prev) => ({
      ...prev,
      totalXp: Math.max(0, prev.totalXp + xpGained),
      lastActiveDate: today,
    }));

    const totalHours = skills.reduce((acc, s) => acc + s.currentHours, 0);
    evaluateBadges(updatedTasks, sessions, profile.dailyStreak, totalHours);
  };

  // Start focus session
  const handleStartFocus = (skillId?: string, taskId?: string) => {
    setFocusTargetSkillId(skillId);
    setFocusTargetTaskId(taskId);
    setActiveTab('focus');
  };

  // Complete study session from timer
  const handleCompleteSession = (session: StudySession) => {
    const today = new Date().toISOString().split('T')[0];
    const durationHours = session.durationMinutes / 60;

    // 1. Append session
    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);

    // 2. Add hours to skill if linked
    let updatedSkills = [...skills];
    if (session.skillId) {
      updatedSkills = updatedSkills.map((s) => {
        if (s.id === session.skillId) {
          return {
            ...s,
            currentHours: parseFloat((s.currentHours + durationHours).toFixed(1)),
            lastStudiedAt: today,
          };
        }
        return s;
      });
      setSkills(updatedSkills);
    }

    // 3. Add spentMinutes to task if linked
    let updatedTasks = [...tasks];
    if (session.taskId) {
      updatedTasks = updatedTasks.map((t) => {
        if (t.id === session.taskId) {
          return {
            ...t,
            spentMinutes: t.spentMinutes + session.durationMinutes,
            status: t.status === 'todo' ? 'in_progress' : t.status,
          };
        }
        return t;
      });
      setTasks(updatedTasks);
    }

    // 4. Update Profile XP & Streak
    const xpFromSession = Math.max(10, Math.round((session.durationMinutes / 10) * 15));
    const isNewActiveDay = profile.lastActiveDate !== today;
    const newStreak = isNewActiveDay ? profile.dailyStreak + 1 : profile.dailyStreak;

    setProfile((prev) => ({
      ...prev,
      dailyStreak: newStreak,
      lastActiveDate: today,
      totalXp: prev.totalXp + xpFromSession,
    }));

    const totalHours = updatedSkills.reduce((acc, s) => acc + s.currentHours, 0);
    evaluateBadges(updatedTasks, updatedSessions, newStreak, totalHours);
  };

  // Skill CRUD
  const handleAddSkill = (newSkill: Skill) => {
    setSkills([newSkill, ...skills]);
  };

  const handleUpdateSkill = (updatedSkill: Skill) => {
    setSkills(skills.map((s) => (s.id === updatedSkill.id ? updatedSkill : s)));
  };

  const handleDeleteSkill = (skillId: string) => {
    setSkills(skills.filter((s) => s.id !== skillId));
  };

  // Task CRUD
  const handleAddTask = (newTask: DailyTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (updatedTask: DailyTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const handleAddGeneratedTasks = (newTasks: Array<Omit<DailyTask, 'id' | 'createdAt' | 'spentMinutes'>>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const created = newTasks.map((t, idx) => ({
      ...t,
      id: `task-${Date.now()}-${idx}`,
      spentMinutes: 0,
      createdAt: todayStr,
    }));
    setTasks([...created, ...tasks]);
  };

  // Reflection
  const handleAddReflection = (newReflection: DailyReflection) => {
    const existingIdx = reflections.findIndex((r) => r.date === newReflection.date);
    if (existingIdx >= 0) {
      const updated = [...reflections];
      updated[existingIdx] = newReflection;
      setReflections(updated);
    } else {
      setReflections([newReflection, ...reflections]);
    }

    // Award reflection bonus XP
    setProfile((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 30,
    }));
  };

  // Reset to initial data
  const handleResetData = () => {
    const reset = resetStoredData();
    setProfile(reset.profile);
    setSkills(reset.skills);
    setTasks(reset.tasks);
    setSessions(reset.sessions);
    setReflections(reset.reflections);
    setBadges(reset.badges);
    playNotificationSound('complete');
  };

  // Import JSON data
  const handleImportData = (data: any) => {
    if (data.profile) setProfile(data.profile);
    if (data.skills) setSkills(data.skills);
    if (data.tasks) setTasks(data.tasks);
    if (data.sessions) setSessions(data.sessions);
    if (data.reflections) setReflections(data.reflections);
    if (data.badges) setBadges(data.badges);
    playNotificationSound('complete');
    triggerCelebration();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 1. Header adhering strictly to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTask={() => setIsNewTaskModalOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        dailyStreak={profile.dailyStreak}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            skills={skills}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigateToTasks={() => setActiveTab('tasks')}
            onNavigateToSkills={() => setActiveTab('skills')}
            onStartFocus={handleStartFocus}
            onOpenNewTask={() => setIsNewTaskModalOpen(true)}
            onSelectSkill={(skill) => {
              setSelectedSkillForDetail(skill);
              setActiveTab('skills');
            }}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsView
            skills={skills}
            onAddSkill={handleAddSkill}
            onUpdateSkill={handleUpdateSkill}
            onDeleteSkill={handleDeleteSkill}
            onStartFocus={(skillId) => handleStartFocus(skillId)}
            onAddGeneratedTasks={handleAddGeneratedTasks}
            selectedSkillForDetail={selectedSkillForDetail}
            onCloseSkillDetail={() => setSelectedSkillForDetail(null)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            skills={skills}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onStartFocus={handleStartFocus}
            isCreateModalOpen={isNewTaskModalOpen}
            onCloseCreateModal={() => setIsNewTaskModalOpen(false)}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimerView
            skills={skills}
            tasks={tasks}
            onCompleteSession={handleCompleteSession}
            initialSkillId={focusTargetSkillId}
            initialTaskId={focusTargetTaskId}
          />
        )}

        {activeTab === 'journal' && (
          <JournalAnalyticsView
            skills={skills}
            tasks={tasks}
            sessions={sessions}
            reflections={reflections}
            badges={badges}
            profile={profile}
            onAddReflection={handleAddReflection}
          />
        )}
      </main>

      {/* 3. Global Modal for Data Backup & User Profile */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        profile={profile}
        onUpdateProfile={(p) => setProfile(p)}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </div>
  );
}
