export type Screen = 'landing' | 'onboarding' | 'upload' | 'skills' | 'roadmap' | 'weekly' | 'chat' | 'quizzes';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SkillEntry {
  name: string;
  current: number;
  required: number;
  priority?: boolean;
  notes?: string;
  source?: 'detected' | 'baseline' | 'user';
}

export interface RoadmapNode {
  id: string;
  label: string;
  done: boolean;
  current?: boolean;
  goal?: boolean;
  children?: string[];
  matchedSkill?: string;
  currentScore?: number;
  requiredScore?: number;
  statusBadge?: string;
  explanation?: string;
}

export interface CourseItem {
  id: string;
  title: string;
  provider: string;
  type: 'free' | 'paid';
  free?: boolean;
  url: string;
  description: string;
  duration?: string;
  rating?: number;
  highlight?: string;
}

export interface DayPlan {
  day: string;
  topic: string;
  tasks: string[];
  ai?: boolean;
  courses?: CourseItem[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'ai';
  text: string;
  tags?: string[];
  cta?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  exampleSnippet?: string;
  skillTag?: string;
}

export interface QuizHistoryItem {
  id: string;
  topic: string;
  difficulty: ExperienceLevel;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
}

export interface UserEducationalProfile {
  id: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  goal: string;
  experience: ExperienceLevel;
  hoursPerWeek: number;
  resumeFileName?: string;
  bioNote?: string;
  recognizedSkills?: string[];
  customSkillRatings?: Record<string, number>;
  currentScreen: Screen;
  weeklyChecks: Record<string, boolean>;
  dynamicTasks?: Record<string, string[]>;
  quizHistory?: QuizHistoryItem[];
  updatedAt?: string;
  createdAt?: string;
}
