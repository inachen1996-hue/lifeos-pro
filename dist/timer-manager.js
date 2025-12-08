/**
 * Timer Manager - Handles CRUD operations for timers
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */
import { TimerStorage, EventStorage, CategoryStorage } from './storage.js';
/**
 * Timer Manager - Handles all timer CRUD operations
 */
export class TimerManager {
    /**
     * Create a new timer
     * Requirement 2.1: Timer creation with name, icon, category, mode selection
     */
    static createTimer(name, icon, categoryId, mode, settings) {
        // Validate inputs
        const validation = this.validateTimerConfig({ name, icon, categoryId, mode, settings });
        if (!validation.valid) {
            throw new Error(`Invalid timer configuration: ${validation.errors.join(', ')}`);
        }
        const now = new Date().toISOString();
        const timer = {
            id: `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            icon,
            categoryId,
            mode,
            settings,
            createdAt: now,
            updatedAt: now,
        };
        TimerStorage.saveTimer(timer);
        return timer;
    }
    /**
     * Update an existing timer
     * Requirement 2.2: Timer edit with sync prompt for existing records
     */
    static updateTimer(timerId, updates, syncExistingRecords = false) {
        const timers = TimerStorage.loadTimers();
        const timer = timers.find(t => t.id === timerId);
        if (!timer) {
            throw new Error(`Timer not found: ${timerId}`);
        }
        // Apply updates
        const updatedTimer = {
            ...timer,
            ...updates,
            id: timer.id, // Preserve ID
            createdAt: timer.createdAt, // Preserve creation date
            updatedAt: new Date().toISOString(),
        };
        // Validate the updated timer
        const validation = this.validateTimerConfig(updatedTimer);
        if (!validation.valid) {
            throw new Error(`Invalid timer configuration: ${validation.errors.join(', ')}`);
        }
        // Save the updated timer
        TimerStorage.saveTimer(updatedTimer);
        // Sync existing records if requested
        if (syncExistingRecords) {
            this.syncTimerRecords(timerId, updates);
        }
        return updatedTimer;
    }
    /**
     * Delete a timer
     * Requirement 2.3: Timer delete with record deletion prompt
     */
    static deleteTimer(timerId, deleteRecords = false) {
        const timers = TimerStorage.loadTimers();
        const timer = timers.find(t => t.id === timerId);
        if (!timer) {
            throw new Error(`Timer not found: ${timerId}`);
        }
        // Delete the timer
        TimerStorage.deleteTimer(timerId);
        // Delete associated records if requested
        if (deleteRecords) {
            this.deleteTimerRecords(timerId);
        }
    }
    /**
     * Get all timers
     */
    static getAllTimers() {
        return TimerStorage.loadTimers();
    }
    /**
     * Get a single timer by ID
     */
    static getTimer(timerId) {
        const timers = TimerStorage.loadTimers();
        return timers.find(t => t.id === timerId);
    }
    /**
     * Get timers by category
     * Requirement 2.5: Display timers under categories
     */
    static getTimersByCategory(categoryId) {
        const timers = TimerStorage.loadTimers();
        return timers.filter(t => t.categoryId === categoryId);
    }
    /**
     * Get timers grouped by category
     * Requirement 2.5: Display timers under categories with icons and names
     */
    static getTimersGroupedByCategory() {
        const categories = CategoryStorage.loadCategories();
        const timers = TimerStorage.loadTimers();
        const grouped = new Map();
        for (const category of categories) {
            const categoryTimers = timers.filter(t => t.categoryId === category.id);
            grouped.set(category, categoryTimers);
        }
        return grouped;
    }
    /**
     * Validate timer configuration
     * Requirement 2.1: Validation during timer creation
     */
    static validateTimerConfig(timer) {
        const errors = [];
        // Validate name
        if (!timer.name?.trim()) {
            errors.push('Timer name is required');
        }
        // Validate icon
        if (!timer.icon?.trim()) {
            errors.push('Timer icon is required');
        }
        // Validate category
        if (!timer.categoryId) {
            errors.push('Category is required');
        }
        else {
            // Check if category exists
            const categories = CategoryStorage.loadCategories();
            const categoryExists = categories.some(c => c.id === timer.categoryId);
            if (!categoryExists) {
                errors.push(`Category not found: ${timer.categoryId}`);
            }
        }
        // Validate mode
        if (!timer.mode) {
            errors.push('Timer mode is required');
        }
        else if (!['stopwatch', 'countdown', 'pomodoro'].includes(timer.mode)) {
            errors.push('Invalid timer mode');
        }
        // Validate settings based on mode
        if (timer.mode === 'countdown') {
            if (!timer.settings?.countdownDuration || timer.settings.countdownDuration <= 0) {
                errors.push('Countdown duration must be greater than 0');
            }
        }
        if (timer.mode === 'pomodoro') {
            if (!timer.settings?.workDuration || timer.settings.workDuration <= 0) {
                errors.push('Work duration must be greater than 0');
            }
            if (!timer.settings?.restDuration || timer.settings.restDuration <= 0) {
                errors.push('Rest duration must be greater than 0');
            }
            if (!timer.settings?.cycles || timer.settings.cycles <= 0) {
                errors.push('Number of cycles must be greater than 0');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Sync timer changes to existing event records
     * Requirement 2.2: Sync changes with existing data source records
     */
    static syncTimerRecords(timerId, updates) {
        const events = EventStorage.loadEvents();
        const timerEvents = events.filter(e => e.timerId === timerId);
        for (const event of timerEvents) {
            const updatedEvent = {
                ...event,
                updatedAt: new Date().toISOString(),
            };
            // Update name if changed
            if (updates.name !== undefined) {
                updatedEvent.name = updates.name;
            }
            // Update category if changed
            if (updates.categoryId !== undefined) {
                updatedEvent.categoryId = updates.categoryId;
            }
            EventStorage.saveEvent(updatedEvent);
        }
    }
    /**
     * Delete all event records associated with a timer
     * Requirement 2.3: Delete timer and all records
     */
    static deleteTimerRecords(timerId) {
        const events = EventStorage.loadEvents();
        const remainingEvents = events.filter(e => e.timerId !== timerId);
        EventStorage.saveEvents(remainingEvents);
    }
}
//# sourceMappingURL=timer-manager.js.map