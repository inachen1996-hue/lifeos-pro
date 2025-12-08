/**
 * Data Models for LifeOS Timer Rework
 * These interfaces define the core data structures for the application
 */

/**
 * Timer Category - Groups timers into logical categories
 */
export interface TimerCategory {
  id: string;
  name: string;
  isDefault: boolean;
  color: string;
  icon: string;
}

/**
 * Timer Settings - Configuration for different timer modes
 */
export interface TimerSettings {
  // For countdown mode
  countdownDuration?: number; // in minutes
  
  // For pomodoro mode
  workDuration?: number; // in minutes
  restDuration?: number; // in minutes
  cycles?: number;
}

/**
 * Timer - Represents a configured timer
 */
export interface Timer {
  id: string;
  name: string;
  icon: string;
  categoryId: string;
  mode: 'stopwatch' | 'countdown' | 'pomodoro';
  settings: TimerSettings;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Timer Session - Tracks an active or completed timer session
 */
export interface TimerSession {
  timerId: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  mode: 'stopwatch' | 'countdown' | 'pomodoro';
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  
  // For pomodoro tracking
  currentCycle?: number;
  currentPeriod?: 'work' | 'rest';
  workPeriods?: Array<{ start: string; end: string }>;
}

/**
 * Event - Represents a recorded time event
 */
export interface Event {
  id: string;
  name: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  categoryId: string;
  source: 'manual' | 'timer' | 'calendar';
  priority: number; // 3=manual, 2=timer, 1=calendar
  timerId?: string; // Reference to timer if source is 'timer'
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Blank Period - Represents a detected gap in the schedule
 */
export interface BlankPeriod {
  id: string;
  date: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  durationHours: number;
  aiSuggestion?: string;
  status: 'pending' | 'filled' | 'dismissed';
}

/**
 * Storage Keys - localStorage keys used by the application
 */
export const STORAGE_KEYS = {
  TIMERS: 'lifeos_pro_timers_v1',
  TIMER_CATEGORIES: 'lifeos_pro_timer_categories_v1',
  EVENTS: 'lifeos_pro_events_v3',
  BLANK_PERIODS: 'lifeos_pro_blank_periods_v1',
  ALLOCATIONS: 'lifeos_pro_allocations_v2',
  DIARY: 'lifeos_pro_diary_v1',
  REVIEWS: 'lifeos_pro_reviews',
  HISTORY_V2: 'lifeos_pro_history_v2', // Old format for migration
} as const;

/**
 * Default Categories - The 8 default timer categories
 */
export const DEFAULT_CATEGORIES: TimerCategory[] = [
  { id: 'work', name: '工作', isDefault: true, color: 'bg-macaron-blue', icon: 'Briefcase' },
  { id: 'study', name: '学习', isDefault: true, color: 'bg-macaron-green', icon: 'BookOpen' },
  { id: 'rest', name: '休息', isDefault: true, color: 'bg-macaron-pink', icon: 'Coffee' },
  { id: 'sleep', name: '睡眠', isDefault: true, color: 'bg-macaron-purple', icon: 'Moon' },
  { id: 'life', name: '生活', isDefault: true, color: 'bg-macaron-orange', icon: 'Home' },
  { id: 'entertainment', name: '娱乐', isDefault: true, color: 'bg-macaron-yellow', icon: 'Gamepad2' },
  { id: 'health', name: '健康', isDefault: true, color: 'bg-emerald-200', icon: 'Heart' },
  { id: 'hobby', name: '兴趣', isDefault: true, color: 'bg-macaron-rose', icon: 'Palette' }
];
