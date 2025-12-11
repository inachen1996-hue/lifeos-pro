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
    countdownDuration?: number;
    workDuration?: number;
    restDuration?: number;
    cycles?: number;
}
/**
 * Timer - Represents a configured timer
 */
export interface Timer {
    id: string;
    name: string;
    icon: string;
    iconSource?: 'default' | 'smart' | 'manual';
    iconSelectedAt?: string;
    categoryId: string;
    mode: 'stopwatch' | 'countdown' | 'pomodoro';
    settings: TimerSettings;
    createdAt: string;
    updatedAt: string;
}
/**
 * Timer Session - Tracks an active or completed timer session
 */
export interface TimerSession {
    timerId: string;
    startTime: string;
    endTime?: string;
    mode: 'stopwatch' | 'countdown' | 'pomodoro';
    status: 'running' | 'paused' | 'completed' | 'cancelled';
    currentCycle?: number;
    currentPeriod?: 'work' | 'rest';
    workPeriods?: Array<{
        start: string;
        end: string;
    }>;
}
/**
 * Event - Represents a recorded time event
 */
export interface Event {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    categoryId: string;
    source: 'manual' | 'timer' | 'calendar';
    priority: number;
    timerId?: string;
    createdAt: string;
    updatedAt: string;
}
/**
 * Blank Period - Represents a detected gap in the schedule
 */
export interface BlankPeriod {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    aiSuggestion?: string;
    status: 'pending' | 'filled' | 'dismissed';
}
/**
 * Storage Keys - localStorage keys used by the application
 */
export declare const STORAGE_KEYS: {
    readonly TIMERS: "lifeos_pro_timers_v1";
    readonly TIMER_CATEGORIES: "lifeos_pro_timer_categories_v1";
    readonly EVENTS: "lifeos_pro_events_v3";
    readonly BLANK_PERIODS: "lifeos_pro_blank_periods_v1";
    readonly ALLOCATIONS: "lifeos_pro_allocations_v2";
    readonly DIARY: "lifeos_pro_diary_v1";
    readonly REVIEWS: "lifeos_pro_reviews";
    readonly HISTORY_V2: "lifeos_pro_history_v2";
};
/**
 * Default Categories - The 8 default timer categories
 */
export declare const DEFAULT_CATEGORIES: TimerCategory[];
//# sourceMappingURL=types.d.ts.map