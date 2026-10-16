export type SkillCategory = 
  | 'Frontend' 
  | 'Backend' 
  | 'Data' 
  | 'Design' 
  | 'Language' 
  | 'DevOps' 
  | 'Mobile'
  | 'Lainnya';

export type SkillLevel = 'Pemula' | 'Menengah' | 'Mahir' | 'Ahli';

export interface SkillTopic {
  id: string;
  title: string;
  completed: boolean;
  hoursEstimate: number;
  completedAt?: string;
  resourceLinks?: string[];
}

export interface SkillNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  title: string;
  category: SkillCategory;
  description: string;
  level: SkillLevel;
  currentHours: number;
  targetHours: number;
  color: string; // e.g. 'indigo', 'emerald', 'sky', 'amber', 'purple', 'rose'
  topics: SkillTopic[];
  notes: SkillNote[];
  createdAt: string;
  lastStudiedAt?: string;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  skillId?: string; // Links to Skill
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  spentMinutes: number;
  completedAt?: string;
  createdAt: string;
  tags: string[];
}

export interface StudySession {
  id: string;
  skillId?: string;
  taskId?: string;
  durationMinutes: number;
  mode: 'pomodoro' | 'stopwatch';
  notes?: string;
  completedAt: string; // ISO date string
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  summary: string;
  keyLearnings: string;
  tomorrowGoals: string;
  rating: number; // 1 to 5
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface UserProfile {
  name: string;
  title: string;
  weeklyTargetHours: number;
  dailyStreak: number;
  lastActiveDate: string;
  totalXp: number;
}
