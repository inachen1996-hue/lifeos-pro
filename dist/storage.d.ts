/**
 * Storage Infrastructure for LifeOS Timer Rework
 * Handles localStorage operations and data serialization
 */
import { Timer, TimerCategory, Event, BlankPeriod } from './types.js';
/**
 * Generic localStorage operations
 */
export declare class Storage {
    /**
     * Save data to localStorage
     */
    static save<T>(key: string, data: T): void;
    /**
     * Load data from localStorage
     */
    static load<T>(key: string, defaultValue: T): T;
    /**
     * Remove data from localStorage
     */
    static remove(key: string): void;
    /**
     * Check if key exists in localStorage
     */
    static exists(key: string): boolean;
}
/**
 * Timer-specific storage operations
 */
export declare class TimerStorage {
    /**
     * Save timers to localStorage
     */
    static saveTimers(timers: Timer[]): void;
    /**
     * Load timers from localStorage
     */
    static loadTimers(): Timer[];
    /**
     * Save a single timer
     */
    static saveTimer(timer: Timer): void;
    /**
     * Delete a timer
     */
    static deleteTimer(timerId: string): void;
}
/**
 * Category-specific storage operations
 */
export declare class CategoryStorage {
    /**
     * Save categories to localStorage
     */
    static saveCategories(categories: TimerCategory[]): void;
    /**
     * Load categories from localStorage
     */
    static loadCategories(): TimerCategory[];
    /**
     * Save a single category
     */
    static saveCategory(category: TimerCategory): void;
    /**
     * Delete a category
     */
    static deleteCategory(categoryId: string): void;
    /**
     * Update category order
     */
    static updateCategoryOrder(categoryIds: string[]): void;
}
/**
 * Event-specific storage operations
 */
export declare class EventStorage {
    /**
     * Save events to localStorage
     */
    static saveEvents(events: Event[]): void;
    /**
     * Load events from localStorage
     */
    static loadEvents(): Event[];
    /**
     * Save a single event
     */
    static saveEvent(event: Event): void;
    /**
     * Delete an event
     */
    static deleteEvent(eventId: string): void;
}
/**
 * Blank Period-specific storage operations
 */
export declare class BlankPeriodStorage {
    /**
     * Save blank periods to localStorage
     */
    static saveBlankPeriods(periods: BlankPeriod[]): void;
    /**
     * Load blank periods from localStorage
     */
    static loadBlankPeriods(): BlankPeriod[];
    /**
     * Save a single blank period
     */
    static saveBlankPeriod(period: BlankPeriod): void;
    /**
     * Delete a blank period
     */
    static deleteBlankPeriod(periodId: string): void;
}
//# sourceMappingURL=storage.d.ts.map