import { Skill, DailyTask, StudySession, DailyReflection, UserProfile, Badge } from '../types';

export const initialProfile: UserProfile = {
  name: 'Muhamad Hafiz',
  title: 'Aspiring Fullstack Engineer',
  weeklyTargetHours: 15,
  dailyStreak: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalXp: 1850,
};

const todayStr = new Date().toISOString().split('T')[0];
const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

export const initialSkills: Skill[] = [
  {
    id: 'skill-1',
    title: 'React & TypeScript Modern',
    category: 'Frontend',
    description: 'Penguasaan ekosistem React 19, arsitektur TypeScript bertipe ketat, dan state management modern.',
    level: 'Menengah',
    currentHours: 38.5,
    targetHours: 80,
    color: 'indigo',
    createdAt: '2026-09-01',
    lastStudiedAt: todayStr,
    topics: [
      { id: 'top-1', title: 'Komponen Fungsional & Props Interface', completed: true, hoursEstimate: 6, completedAt: '2026-09-05' },
      { id: 'top-2', title: 'React Hooks mendalam (useState, useEffect, useMemo, useCallback)', completed: true, hoursEstimate: 12, completedAt: '2026-09-15' },
      { id: 'top-3', title: 'TypeScript Generics & Strict Typing pada Event Handlers', completed: true, hoursEstimate: 10, completedAt: '2026-09-28' },
      { id: 'top-4', title: 'State Management Global (Zustand & Context API)', completed: true, hoursEstimate: 10, completedAt: '2026-10-08' },
      { id: 'top-5', title: 'Data Fetching, Cache & Optimistic UI (TanStack Query)', completed: false, hoursEstimate: 14 },
      { id: 'top-6', title: 'Unit Testing Komponen dengan Vitest & React Testing Library', completed: false, hoursEstimate: 12 },
      { id: 'top-7', title: 'Server Components & Optimasi Performa Rendering', completed: false, hoursEstimate: 16 }
    ],
    notes: [
      {
        id: 'note-1',
        title: 'Memoization Best Practices di React 19',
        content: 'Hindari overuse useMemo untuk komputasi ringan. Hanya gunakan saat ada perhitungan array/objek berat atau referensi fungsi yang dipass ke React.memo child component.',
        createdAt: '2026-10-09'
      },
      {
        id: 'note-2',
        title: 'Zustand vs Redux Toolkit',
        content: 'Zustand jauh lebih minim boilerplate, mendukung selector reaktif otomatis tanpa provider wrapper yang membengkak.',
        createdAt: '2026-10-12'
      }
    ]
  },
  {
    id: 'skill-2',
    title: 'Python untuk Analisis Data',
    category: 'Data',
    description: 'Pemrosesan data tabular, pembersihan dataset mentah, dan visualisasi interaktif.',
    level: 'Pemula',
    currentHours: 21.0,
    targetHours: 60,
    color: 'emerald',
    createdAt: '2026-09-12',
    lastStudiedAt: yesterdayStr,
    topics: [
      { id: 'top-201', title: 'Sintaks Python Lanjutan & List Comprehension', completed: true, hoursEstimate: 8, completedAt: '2026-09-20' },
      { id: 'top-202', title: 'Manipulasi Array Multi-dimensi dengan NumPy', completed: true, hoursEstimate: 10, completedAt: '2026-10-02' },
      { id: 'top-203', title: 'Pembersihan & Filtering Data dengan Pandas DataFrames', completed: false, hoursEstimate: 15 },
      { id: 'top-204', title: 'Visualisasi Data dengan Matplotlib & Seaborn', completed: false, hoursEstimate: 12 },
      { id: 'top-205', title: 'Studi Kasus Exploratory Data Analysis (EDA)', completed: false, hoursEstimate: 15 }
    ],
    notes: [
      {
        id: 'note-201',
        title: 'Pandas Vectorization vs For Loop',
        content: 'Jangan pernah iterasi baris dataframe dengan loop `for` standar jika bisa menggunakan operasi vectorized atau `.apply()`. Perbedaan kecepatannya bisa 100x lebih cepat.',
        createdAt: '2026-10-03'
      }
    ]
  },
  {
    id: 'skill-3',
    title: 'Bahasa Inggris Komunikasi Teknis',
    category: 'Language',
    description: 'Kemampuan membaca dokumentasi resmi, menulis Pull Request deskriptif, dan presentasi teknis.',
    level: 'Menengah',
    currentHours: 32.0,
    targetHours: 50,
    color: 'sky',
    createdAt: '2026-09-02',
    lastStudiedAt: todayStr,
    topics: [
      { id: 'top-301', title: 'Membaca Dokumentasi & RFC Berbahasa Inggris', completed: true, hoursEstimate: 10, completedAt: '2026-09-18' },
      { id: 'top-302', title: 'Menulis Deskripsi Pull Request & Issue Bug Report', completed: true, hoursEstimate: 8, completedAt: '2026-10-01' },
      { id: 'top-303', title: 'Kosakata Arsitektur Sistem & Engineering Trade-offs', completed: true, hoursEstimate: 12, completedAt: '2026-10-11' },
      { id: 'top-304', title: 'Percakapan Standup Harian & Simulasi Interview Teknis', completed: false, hoursEstimate: 20 }
    ],
    notes: [
      {
        id: 'note-301',
        title: 'Format Pull Request yang Efektif',
        content: 'Gunakan struktur: "Context / What changed / How to test / Screenshots". Gunakan kalimat imperatif di commit title ("Fix: resolve hydration mismatch").',
        createdAt: '2026-10-05'
      }
    ]
  },
  {
    id: 'skill-4',
    title: 'Desain Sistem UI & Tailwind CSS',
    category: 'Design',
    description: 'Pembuatan antarmuka pengguna yang bersih, proporsional, aksesibel, dan konsisten.',
    level: 'Pemula',
    currentHours: 14.5,
    targetHours: 40,
    color: 'amber',
    createdAt: '2026-09-25',
    lastStudiedAt: '2026-10-13',
    topics: [
      { id: 'top-401', title: 'Hierarki Tipografi & Skala Spasial 4px/8px', completed: true, hoursEstimate: 6, completedAt: '2026-10-04' },
      { id: 'top-402', title: 'Kontras Warna & Prinsip Desain Aksesibilitas WCAG', completed: true, hoursEstimate: 6, completedAt: '2026-10-10' },
      { id: 'top-403', title: 'Membangun Komponen Reusable dengan Tailwind CSS v4', completed: false, hoursEstimate: 14 },
      { id: 'top-404', title: 'Mikro-Interaksi Halus dengan Framer Motion', completed: false, hoursEstimate: 14 }
    ],
    notes: []
  }
];

export const initialTasks: DailyTask[] = [
  {
    id: 'task-1',
    title: 'Implementasi Pagination & Cache di TanStack Query',
    description: 'Membaca dokumentasi useInfiniteQuery dan menghubungkan state cursor ke tabel data.',
    skillId: 'skill-1',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: todayStr,
    estimatedMinutes: 50,
    spentMinutes: 30,
    createdAt: todayStr,
    tags: ['Frontend', 'API', 'React']
  },
  {
    id: 'task-2',
    title: 'Latihan Pandas: Handle Missing Data pada Dataset Penjualan',
    description: 'Gunakan .fillna() dan interpolasi statistik untuk menangani null value pada kolom numerik.',
    skillId: 'skill-2',
    priority: 'high',
    status: 'todo',
    dueDate: todayStr,
    estimatedMinutes: 45,
    spentMinutes: 0,
    createdAt: todayStr,
    tags: ['Python', 'Pandas', 'EDA']
  },
  {
    id: 'task-3',
    title: 'Tulis Refleksi Arsitektur Kode dalam Bahasa Inggris',
    description: 'Buat rangkuman 250 kata mengenai trade-off Client vs Server Components.',
    skillId: 'skill-3',
    priority: 'medium',
    status: 'todo',
    dueDate: todayStr,
    estimatedMinutes: 30,
    spentMinutes: 0,
    createdAt: todayStr,
    tags: ['English', 'Writing']
  },
  {
    id: 'task-4',
    title: 'Selesaikan Desain Modal Interaktif dengan Aksesibilitas ARIA',
    description: 'Pastikan focus trap aktif dan tombol Escape menutup modal dengan benar.',
    skillId: 'skill-4',
    priority: 'low',
    status: 'todo',
    dueDate: tomorrowStr,
    estimatedMinutes: 40,
    spentMinutes: 0,
    createdAt: todayStr,
    tags: ['A11y', 'Tailwind', 'UI']
  },
  {
    id: 'task-5',
    title: 'Refactor Custom Hook useLocalStorage dengan TypeScript Generics',
    description: 'Menambahkan unit test sederhana dan serialisasi JSON yang aman.',
    skillId: 'skill-1',
    priority: 'high',
    status: 'completed',
    dueDate: yesterdayStr,
    estimatedMinutes: 60,
    spentMinutes: 55,
    completedAt: `${yesterdayStr}T16:30:00Z`,
    createdAt: yesterdayStr,
    tags: ['TypeScript', 'Refactor']
  },
  {
    id: 'task-6',
    title: 'Simulasi Tech Interview: Explain Closure in JavaScript',
    description: 'Latihan rekaman suara menjawab pertanyaan closure selama 3 menit secara runut.',
    skillId: 'skill-3',
    priority: 'medium',
    status: 'completed',
    dueDate: todayStr,
    estimatedMinutes: 25,
    spentMinutes: 25,
    completedAt: `${todayStr}T11:15:00Z`,
    createdAt: todayStr,
    tags: ['Speaking', 'Interview']
  }
];

export const initialSessions: StudySession[] = [
  {
    id: 'sess-1',
    skillId: 'skill-1',
    taskId: 'task-5',
    durationMinutes: 50,
    mode: 'pomodoro',
    notes: 'Berhasil membuat hook generic dengan default fallback parser.',
    completedAt: `${yesterdayStr}T16:20:00.000Z`
  },
  {
    id: 'sess-2',
    skillId: 'skill-3',
    taskId: 'task-6',
    durationMinutes: 25,
    mode: 'pomodoro',
    notes: 'Menjelaskan lexical scoping dan memory heap lifecycle.',
    completedAt: `${todayStr}T11:10:00.000Z`
  },
  {
    id: 'sess-3',
    skillId: 'skill-1',
    taskId: 'task-1',
    durationMinutes: 30,
    mode: 'pomodoro',
    notes: 'Setup awal queryClient dan cache configuration.',
    completedAt: `${todayStr}T14:45:00.000Z`
  }
];

export const initialReflections: DailyReflection[] = [
  {
    id: 'refl-1',
    date: yesterdayStr,
    summary: 'Fokus menyelesaikan arsitektur generics TypeScript dan latihan listening materi tech talk.',
    keyLearnings: 'Memahami bagaimana TypeScript infer tipe return type otomatis dari parameter fungsi.',
    tomorrowGoals: 'Menyelesaikan modul TanStack Query dan praktik dataframe Pandas.',
    rating: 5
  }
];

export const initialBadges: Badge[] = [
  {
    id: 'badge-1',
    title: 'Langkah Pertama',
    description: 'Menyelesaikan sesi belajar terfokus pertama kali.',
    iconName: 'Sparkles',
    unlocked: true,
    unlockedAt: '2026-09-02',
    progress: 100
  },
  {
    id: 'badge-2',
    title: 'Streak 5 Hari',
    description: 'Belajar berturut-turut selama minimal 5 hari tanpa terputus.',
    iconName: 'Flame',
    unlocked: true,
    unlockedAt: todayStr,
    progress: 100
  },
  {
    id: 'badge-3',
    title: 'Master Pomodoro',
    description: 'Menyelesaikan 10 sesi fokus 25 menit.',
    iconName: 'Timer',
    unlocked: false,
    progress: 70
  },
  {
    id: 'badge-4',
    title: 'Pemberantas Tugas',
    description: 'Menuntaskan 20 tugas harian terhubung ke skill.',
    iconName: 'CheckCircle2',
    unlocked: false,
    progress: 45
  },
  {
    id: 'badge-5',
    title: 'Penjelajah Kurikulum',
    description: 'Menguasai minimal 10 topik sub-kompetensi.',
    iconName: 'Compass',
    unlocked: true,
    unlockedAt: '2026-10-11',
    progress: 100
  },
  {
    id: 'badge-6',
    title: 'Jam Terbang 100 Jam',
    description: 'Mencapai total 100 jam akumulasi waktu belajar produktif.',
    iconName: 'Trophy',
    unlocked: false,
    progress: 86
  }
];
