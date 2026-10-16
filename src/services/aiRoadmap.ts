import { GoogleGenAI } from '@google/genai';
import { SkillCategory, SkillLevel } from '../types';

export interface GeneratedRoadmap {
  title: string;
  category: SkillCategory;
  description: string;
  level: SkillLevel;
  targetHours: number;
  topics: Array<{
    title: string;
    hoursEstimate: number;
  }>;
  suggestedTasks: Array<{
    title: string;
    description: string;
    estimatedMinutes: number;
    priority: 'urgent' | 'high' | 'medium' | 'low';
  }>;
}

// Built-in curated curriculum presets for instant generation
const CURATED_PRESETS: Record<string, GeneratedRoadmap> = {
  'golang': {
    title: 'Go (Golang) Backend Engineering',
    category: 'Backend',
    description: 'Penguasaan konkurensi Goroutines,Channels, arsitektur REST/gRPC API, dan clean architecture.',
    level: 'Pemula',
    targetHours: 60,
    topics: [
      { title: 'Sintaks Dasar, Struct, dan Pointer di Go', hoursEstimate: 8 },
      { title: 'Interfaces & Error Handling Idiomatik', hoursEstimate: 10 },
      { title: 'Goroutines, Channels & Worker Pools', hoursEstimate: 12 },
      { title: 'Membangun REST API dengan Chi / Gin Framework', hoursEstimate: 14 },
      { title: 'Database Integration (GORM & sqlx) dengan PostgreSQL', hoursEstimate: 8 },
      { title: 'Unit Testing & Benchmarking di Go', hoursEstimate: 8 }
    ],
    suggestedTasks: [
      { title: 'Implementasi CRUD REST API User dengan Chi router', description: 'Buat endpoint GET, POST, PUT, DELETE dengan JSON response.', estimatedMinutes: 45, priority: 'high' },
      { title: 'Eksperimen Concurrency Worker Pool untuk Image Processing', description: 'Gunakan sync.WaitGroup dan buffered channel.', estimatedMinutes: 60, priority: 'medium' }
    ]
  },
  'flutter': {
    title: 'Flutter & Dart Mobile Development',
    category: 'Mobile',
    description: 'Pembuatan aplikasi Android & iOS responsif dengan state management Riverpod atau Bloc.',
    level: 'Pemula',
    targetHours: 70,
    topics: [
      { title: 'Dasar Bahasa Dart: Null Safety & OOP', hoursEstimate: 8 },
      { title: 'Widget Tree: Stateless, Stateful & Layouting', hoursEstimate: 12 },
      { title: 'State Management (Riverpod / Bloc)', hoursEstimate: 16 },
      { title: 'Integrasi REST API & Local Caching (Hive/Isar)', hoursEstimate: 14 },
      { title: 'Navigasi GoRouter & Deep Linking', hoursEstimate: 10 },
      { title: 'Build, Optimasi & Rilis ke Google Play Store', hoursEstimate: 10 }
    ],
    suggestedTasks: [
      { title: 'Setup arsitektur Riverpod dengan StateNotifier', description: 'Buat feed list dengan pagination dan loading skeleton.', estimatedMinutes: 50, priority: 'high' },
      { title: 'Latihan membuat custom animated card di Flutter', description: 'Gunakan AnimatedContainer dan Hero widget.', estimatedMinutes: 35, priority: 'medium' }
    ]
  },
  'devops': {
    title: 'DevOps, Docker & CI/CD Pipeline',
    category: 'DevOps',
    description: 'Containerization aplikasi, orkestrasi, dan otomatisasi deployment dengan GitHub Actions.',
    level: 'Pemula',
    targetHours: 50,
    topics: [
      { title: 'Dasar Linux Command Line & Shell Scripting', hoursEstimate: 8 },
      { title: 'Containerization dengan Docker & Multi-stage Builds', hoursEstimate: 10 },
      { title: 'Docker Compose untuk Multi-Service App', hoursEstimate: 10 },
      { title: 'Otomatisasi CI/CD dengan GitHub Actions', hoursEstimate: 12 },
      { title: 'Dasar Kubernetes (Pod, Service, Ingress)', hoursEstimate: 10 }
    ],
    suggestedTasks: [
      { title: 'Buat Dockerfile multi-stage untuk optimasi ukuran image Node.js', description: 'Kurangi ukuran image di bawah 150MB dengan Alpine base.', estimatedMinutes: 40, priority: 'high' },
      { title: 'Setup GitHub Actions workflow untuk lint dan automated test', description: 'Pastikan status check lolos sebelum merge PR.', estimatedMinutes: 30, priority: 'medium' }
    ]
  },
  'ai': {
    title: 'Prompt Engineering & LLM App Development',
    category: 'Data',
    description: 'Pengembangan aplikasi AI generasi baru dengan Gemini SDK, Function Calling, dan RAG.',
    level: 'Pemula',
    targetHours: 45,
    topics: [
      { title: 'Prinsip Dasar LLM, Tokens, dan System Prompts', hoursEstimate: 6 },
      { title: 'Structured JSON Outputs & Schema Validation (Zod)', hoursEstimate: 8 },
      { title: 'Function Calling & Tool Execution Agents', hoursEstimate: 12 },
      { title: 'Vector Embeddings & Retrieval-Augmented Generation (RAG)', hoursEstimate: 12 },
      { title: 'Evaluasi & Pencegahan Halusinasi AI', hoursEstimate: 7 }
    ],
    suggestedTasks: [
      { title: 'Buat prototype function calling dengan Gemini 2.5 Flash', description: 'Hubungkan AI ke tool cuaca atau kalkulator.', estimatedMinutes: 45, priority: 'high' },
      { title: 'Eksperimen few-shot prompting untuk klasifikasi sentimen', description: 'Uji tingkat akurasi dengan 20 data sampel.', estimatedMinutes: 30, priority: 'medium' }
    ]
  }
};

export async function generateLearningRoadmap(skillQuery: string): Promise<GeneratedRoadmap> {
  const queryLower = skillQuery.toLowerCase().trim();

  // Try checking presets first for quick matching
  for (const [key, preset] of Object.entries(CURATED_PRESETS)) {
    if (queryLower.includes(key)) {
      return {
        ...preset,
        title: preset.title
      };
    }
  }

  // If Gemini API is available, generate custom roadmap
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                 (typeof import.meta !== 'undefined' && (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY) || 
                 '';

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah seorang kurator kurikulum profesional dan mentor teknologi.
Buatkan kurikulum roadmap belajar terstruktur dalam Bahasa Indonesia untuk skill: "${skillQuery}".
Format keluaran HARUS berupa objek JSON valid tanpa markdown formatting tambahan atau pembungkus lain di luar JSON:
{
  "title": "${skillQuery}",
  "category": "Frontend" | "Backend" | "Data" | "Design" | "Language" | "DevOps" | "Mobile" | "Lainnya",
  "description": "Deskripsi singkat 1-2 kalimat tentang fokus penguasaan materi.",
  "level": "Pemula",
  "targetHours": 40,
  "topics": [
    { "title": "Nama Topik 1", "hoursEstimate": 6 },
    { "title": "Nama Topik 2", "hoursEstimate": 8 },
    { "title": "Nama Topik 3", "hoursEstimate": 10 },
    { "title": "Nama Topik 4", "hoursEstimate": 8 },
    { "title": "Nama Topik 5", "hoursEstimate": 8 }
  ],
  "suggestedTasks": [
    { "title": "Tugas Latihan 1", "description": "Langkah praktis yang dapat langsung dikerjakan", "estimatedMinutes": 45, "priority": "high" },
    { "title": "Tugas Latihan 2", "description": "Latihan berikutnya", "estimatedMinutes": 30, "priority": "medium" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.title && Array.isArray(parsed.topics)) {
          return parsed as GeneratedRoadmap;
        }
      }
    } catch (err) {
      console.warn('Gemini roadmap generation fallback triggered:', err);
    }
  }

  // Fallback intelligent generator for generic input
  return {
    title: skillQuery.charAt(0).toUpperCase() + skillQuery.slice(1),
    category: detectCategory(skillQuery),
    description: `Kurikulum komprehensif untuk mendalami dan menguasai ${skillQuery} secara bertahap dari fondasi hingga implementasi praktis.`,
    level: 'Pemula',
    targetHours: 50,
    topics: [
      { title: `Fondasi & Prinsip Inti ${skillQuery}`, hoursEstimate: 8 },
      { title: `Struktur Data & Alur Kerja Standar pada ${skillQuery}`, hoursEstimate: 10 },
      { title: `Praktik Terbaik & Pola Desain (Best Practices)`, hoursEstimate: 12 },
      { title: `Integrasi Proyek Nyata & Studi Kasus Praktis`, hoursEstimate: 12 },
      { title: `Optimasi Performa & Evaluasi Mandiri`, hoursEstimate: 8 }
    ],
    suggestedTasks: [
      { 
        title: `Pelajari konsep dasar dan buat rangkuman fondasi ${skillQuery}`, 
        description: 'Tuliskan 3 konsep kunci yang paling penting dalam 1 lembar catatan ringkas.',
        estimatedMinutes: 45,
        priority: 'high'
      },
      { 
        title: `Selesaikan latihan praktik pertama untuk ${skillQuery}`, 
        description: 'Implementasikan contoh kode atau studi kasus mini secara langsung.',
        estimatedMinutes: 60,
        priority: 'medium'
      }
    ]
  };
}

function detectCategory(query: string): SkillCategory {
  const q = query.toLowerCase();
  if (q.includes('react') || q.includes('css') || q.includes('html') || q.includes('front') || q.includes('vue') || q.includes('svelte')) return 'Frontend';
  if (q.includes('node') || q.includes('backend') || q.includes('sql') || q.includes('api') || q.includes('database') || q.includes('java') || q.includes('go')) return 'Backend';
  if (q.includes('data') || q.includes('python') || q.includes('ai') || q.includes('machine') || q.includes('analytics')) return 'Data';
  if (q.includes('design') || q.includes('ui') || q.includes('ux') || q.includes('figma')) return 'Design';
  if (q.includes('english') || q.includes('bahasa') || q.includes('speaking') || q.includes('japan') || q.includes('language')) return 'Language';
  if (q.includes('docker') || q.includes('linux') || q.includes('cloud') || q.includes('devops') || q.includes('aws')) return 'DevOps';
  if (q.includes('flutter') || q.includes('android') || q.includes('ios') || q.includes('react native') || q.includes('mobile')) return 'Mobile';
  return 'Lainnya';
}
