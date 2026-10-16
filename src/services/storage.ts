import { Skill, DailyTask, StudySession, DailyReflection, UserProfile, Badge } from '../types';
import { initialProfile, initialSkills, initialTasks, initialSessions, initialReflections, initialBadges } from '../data/initialData';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  PROFILE: 'skilltrack_user_profile_v1',
  SKILLS: 'skilltrack_skills_v1',
  TASKS: 'skilltrack_tasks_v1',
  SESSIONS: 'skilltrack_sessions_v1',
  REFLECTIONS: 'skilltrack_reflections_v1',
  BADGES: 'skilltrack_badges_v1',
};

export const getStoredData = () => {
  try {
    const profile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const skills = localStorage.getItem(STORAGE_KEYS.SKILLS);
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const reflections = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    const badges = localStorage.getItem(STORAGE_KEYS.BADGES);

    return {
      profile: profile ? (JSON.parse(profile) as UserProfile) : initialProfile,
      skills: skills ? (JSON.parse(skills) as Skill[]) : initialSkills,
      tasks: tasks ? (JSON.parse(tasks) as DailyTask[]) : initialTasks,
      sessions: sessions ? (JSON.parse(sessions) as StudySession[]) : initialSessions,
      reflections: reflections ? (JSON.parse(reflections) as DailyReflection[]) : initialReflections,
      badges: badges ? (JSON.parse(badges) as Badge[]) : initialBadges,
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return {
      profile: initialProfile,
      skills: initialSkills,
      tasks: initialTasks,
      sessions: initialSessions,
      reflections: initialReflections,
      badges: initialBadges,
    };
  }
};

export const saveStoredData = (data: {
  profile?: UserProfile;
  skills?: Skill[];
  tasks?: DailyTask[];
  sessions?: StudySession[];
  reflections?: DailyReflection[];
  badges?: Badge[];
}) => {
  try {
    if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    if (data.skills) localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(data.skills));
    if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
    if (data.sessions) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    if (data.reflections) localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(data.reflections));
    if (data.badges) localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(data.badges));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const resetStoredData = () => {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.SKILLS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
  localStorage.removeItem(STORAGE_KEYS.BADGES);
  return {
    profile: initialProfile,
    skills: initialSkills,
    tasks: initialTasks,
    sessions: initialSessions,
    reflections: initialReflections,
    badges: initialBadges,
  };
};

export const exportDataAsJSON = () => {
  const currentData = getStoredData();
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(currentData, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `skilltrack-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const triggerCelebration = () => {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
    });
  } catch (e) {
    // Ignore if canvas is unsupported
  }
};

// Web Audio API Sound generator (Pure client-side, zero external assets)
export const playNotificationSound = (type: 'complete' | 'tick' | 'ding' = 'ding') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'ding') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'complete') {
      // Pleasant multi-chord arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    }
  } catch {
    // Fail silently if browser audio autoplay is locked
  }
};
