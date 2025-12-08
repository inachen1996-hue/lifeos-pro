/**
 * Timer Manager - Handles CRUD operations for timers
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */
import { Timer, TimerSettings, TimerCategory } from './types.js';
/**
 * Validation result for timer operations
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
/**
 * Timer Manager - Handles all timer CRUD operations
 */
export declare class TimerManager {
    /**
     * Create a new timer
     * Requirement 2.1: Timer creation with name, icon, category, mode selection
     */
    static createTimer(name: string, icon: string, categoryId: string, mode: 'stopwatch' | 'countdown' | 'pomodoro', settings: TimerSettings): Timer;
    /**
     * Update an existing timer
     * Requirement 2.2: Timer edit with sync prompt for existing records
     */
    static updateTimer(timerId: string, updates: Partial<Omit<Timer, 'id' | 'createdAt'>>, syncExistingRecords?: boolean): Timer;
    /**
     * Delete a timer
     * Requirement 2.3: Timer delete with record deletion prompt
     */
    static deleteTimer(timerId: string, deleteRecords?: boolean): void;
    /**
     * Get all timers
     */
    static getAllTimers(): Timer[];
    /**
     * Get a single timer by ID
     */
    static getTimer(timerId: string): Timer | undefined;
    /**
     * Get timers by category
     * Requirement 2.5: Display timers under categories
     */
    static getTimersByCategory(categoryId: string): Timer[];
    /**
     * Get timers grouped by category
     * Requirement 2.5: Display timers under categories with icons and names
     */
    static getTimersGroupedByCategory(): Map<TimerCategory, Timer[]>;
    /**
     * Validate timer configuration
     * Requirement 2.1: Validation during timer creation
     */
    static validateTimerConfig(timer: Partial<Timer>): ValidationResult;
    /**
     * Sync timer changes to existing event records
     * Requirement 2.2: Sync changes with existing data source records
     */
    private static syncTimerRecords;
    /**
     * Delete all event records associated with a timer
     * Requirement 2.3: Delete timer and all records
     */
    private static deleteTimerRecords;
}
//# sourceMappingURL=timer-manager.d.ts.map