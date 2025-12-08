/**
 * Data Models for LifeOS Timer Rework
 * These interfaces define the core data structures for the application
 */
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
};
/**
 * Default Categories - The 8 default timer categories
 */
export const DEFAULT_CATEGORIES = [
    { id: 'work', name: '工作', isDefault: true, color: 'bg-macaron-blue', icon: 'Briefcase' },
    { id: 'study', name: '学习', isDefault: true, color: 'bg-macaron-green', icon: 'BookOpen' },
    { id: 'rest', name: '休息', isDefault: true, color: 'bg-macaron-pink', icon: 'Coffee' },
    { id: 'sleep', name: '睡眠', isDefault: true, color: 'bg-macaron-purple', icon: 'Moon' },
    { id: 'life', name: '生活', isDefault: true, color: 'bg-macaron-orange', icon: 'Home' },
    { id: 'entertainment', name: '娱乐', isDefault: true, color: 'bg-macaron-yellow', icon: 'Gamepad2' },
    { id: 'health', name: '健康', isDefault: true, color: 'bg-emerald-200', icon: 'Heart' },
    { id: 'hobby', name: '兴趣', isDefault: true, color: 'bg-macaron-rose', icon: 'Palette' }
];
//# sourceMappingURL=types.js.map