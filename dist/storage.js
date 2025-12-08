/**
 * Storage Infrastructure for LifeOS Timer Rework
 * Handles localStorage operations and data serialization
 */
import { STORAGE_KEYS, DEFAULT_CATEGORIES, } from './types.js';
/**
 * Generic localStorage operations
 */
export class Storage {
    /**
     * Save data to localStorage
     */
    static save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
        }
        catch (error) {
            console.error(`Failed to save to localStorage (${key}):`, error);
            throw new Error(`Storage save failed: ${error}`);
        }
    }
    /**
     * Load data from localStorage
     */
    static load(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        }
        catch (error) {
            console.error(`Failed to load from localStorage (${key}):`, error);
            return defaultValue;
        }
    }
    /**
     * Remove data from localStorage
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error(`Failed to remove from localStorage (${key}):`, error);
        }
    }
    /**
     * Check if key exists in localStorage
     */
    static exists(key) {
        return localStorage.getItem(key) !== null;
    }
}
/**
 * Timer-specific storage operations
 */
export class TimerStorage {
    /**
     * Save timers to localStorage
     */
    static saveTimers(timers) {
        Storage.save(STORAGE_KEYS.TIMERS, timers);
    }
    /**
     * Load timers from localStorage
     */
    static loadTimers() {
        return Storage.load(STORAGE_KEYS.TIMERS, []);
    }
    /**
     * Save a single timer
     */
    static saveTimer(timer) {
        const timers = this.loadTimers();
        const index = timers.findIndex(t => t.id === timer.id);
        if (index >= 0) {
            timers[index] = timer;
        }
        else {
            timers.push(timer);
        }
        this.saveTimers(timers);
    }
    /**
     * Delete a timer
     */
    static deleteTimer(timerId) {
        const timers = this.loadTimers();
        const filtered = timers.filter(t => t.id !== timerId);
        this.saveTimers(filtered);
    }
}
/**
 * Category-specific storage operations
 */
export class CategoryStorage {
    /**
     * Save categories to localStorage
     */
    static saveCategories(categories) {
        Storage.save(STORAGE_KEYS.TIMER_CATEGORIES, categories);
    }
    /**
     * Load categories from localStorage
     */
    static loadCategories() {
        const categories = Storage.load(STORAGE_KEYS.TIMER_CATEGORIES, []);
        // If no categories exist, initialize with defaults
        if (categories.length === 0) {
            this.saveCategories(DEFAULT_CATEGORIES);
            return DEFAULT_CATEGORIES;
        }
        return categories;
    }
    /**
     * Save a single category
     */
    static saveCategory(category) {
        const categories = this.loadCategories();
        const index = categories.findIndex(c => c.id === category.id);
        if (index >= 0) {
            categories[index] = category;
        }
        else {
            categories.push(category);
        }
        this.saveCategories(categories);
    }
    /**
     * Delete a category
     */
    static deleteCategory(categoryId) {
        const categories = this.loadCategories();
        const filtered = categories.filter(c => c.id !== categoryId);
        this.saveCategories(filtered);
    }
    /**
     * Update category order
     */
    static updateCategoryOrder(categoryIds) {
        const categories = this.loadCategories();
        const orderedCategories = categoryIds
            .map(id => categories.find(c => c.id === id))
            .filter((c) => c !== undefined);
        this.saveCategories(orderedCategories);
    }
}
/**
 * Event-specific storage operations
 */
export class EventStorage {
    /**
     * Save events to localStorage
     */
    static saveEvents(events) {
        Storage.save(STORAGE_KEYS.EVENTS, events);
    }
    /**
     * Load events from localStorage
     */
    static loadEvents() {
        return Storage.load(STORAGE_KEYS.EVENTS, []);
    }
    /**
     * Save a single event
     */
    static saveEvent(event) {
        const events = this.loadEvents();
        const index = events.findIndex(e => e.id === event.id);
        if (index >= 0) {
            events[index] = event;
        }
        else {
            events.push(event);
        }
        this.saveEvents(events);
    }
    /**
     * Delete an event
     */
    static deleteEvent(eventId) {
        const events = this.loadEvents();
        const filtered = events.filter(e => e.id !== eventId);
        this.saveEvents(filtered);
    }
}
/**
 * Blank Period-specific storage operations
 */
export class BlankPeriodStorage {
    /**
     * Save blank periods to localStorage
     */
    static saveBlankPeriods(periods) {
        Storage.save(STORAGE_KEYS.BLANK_PERIODS, periods);
    }
    /**
     * Load blank periods from localStorage
     */
    static loadBlankPeriods() {
        return Storage.load(STORAGE_KEYS.BLANK_PERIODS, []);
    }
    /**
     * Save a single blank period
     */
    static saveBlankPeriod(period) {
        const periods = this.loadBlankPeriods();
        const index = periods.findIndex(p => p.id === period.id);
        if (index >= 0) {
            periods[index] = period;
        }
        else {
            periods.push(period);
        }
        this.saveBlankPeriods(periods);
    }
    /**
     * Delete a blank period
     */
    static deleteBlankPeriod(periodId) {
        const periods = this.loadBlankPeriods();
        const filtered = periods.filter(p => p.id !== periodId);
        this.saveBlankPeriods(filtered);
    }
}
//# sourceMappingURL=storage.js.map