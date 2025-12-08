/**
 * Storage Infrastructure for LifeOS Timer Rework
 * Handles localStorage operations and data serialization
 */

import {
  Timer,
  TimerCategory,
  Event,
  BlankPeriod,
  STORAGE_KEYS,
  DEFAULT_CATEGORIES,
} from './types.js';

/**
 * Generic localStorage operations
 */
export class Storage {
  /**
   * Save data to localStorage
   */
  static save<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to save to localStorage (${key}):`, error);
      throw new Error(`Storage save failed: ${error}`);
    }
  }

  /**
   * Load data from localStorage
   */
  static load<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to load from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from localStorage
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove from localStorage (${key}):`, error);
    }
  }

  /**
   * Check if key exists in localStorage
   */
  static exists(key: string): boolean {
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
  static saveTimers(timers: Timer[]): void {
    Storage.save(STORAGE_KEYS.TIMERS, timers);
  }

  /**
   * Load timers from localStorage
   */
  static loadTimers(): Timer[] {
    return Storage.load<Timer[]>(STORAGE_KEYS.TIMERS, []);
  }

  /**
   * Save a single timer
   */
  static saveTimer(timer: Timer): void {
    const timers = this.loadTimers();
    const index = timers.findIndex(t => t.id === timer.id);
    if (index >= 0) {
      timers[index] = timer;
    } else {
      timers.push(timer);
    }
    this.saveTimers(timers);
  }

  /**
   * Delete a timer
   */
  static deleteTimer(timerId: string): void {
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
  static saveCategories(categories: TimerCategory[]): void {
    Storage.save(STORAGE_KEYS.TIMER_CATEGORIES, categories);
  }

  /**
   * Load categories from localStorage
   */
  static loadCategories(): TimerCategory[] {
    const categories = Storage.load<TimerCategory[]>(STORAGE_KEYS.TIMER_CATEGORIES, []);
    
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
  static saveCategory(category: TimerCategory): void {
    const categories = this.loadCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    this.saveCategories(categories);
  }

  /**
   * Delete a category
   */
  static deleteCategory(categoryId: string): void {
    const categories = this.loadCategories();
    const filtered = categories.filter(c => c.id !== categoryId);
    this.saveCategories(filtered);
  }

  /**
   * Update category order
   */
  static updateCategoryOrder(categoryIds: string[]): void {
    const categories = this.loadCategories();
    const orderedCategories = categoryIds
      .map(id => categories.find(c => c.id === id))
      .filter((c): c is TimerCategory => c !== undefined);
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
  static saveEvents(events: Event[]): void {
    Storage.save(STORAGE_KEYS.EVENTS, events);
  }

  /**
   * Load events from localStorage
   */
  static loadEvents(): Event[] {
    return Storage.load<Event[]>(STORAGE_KEYS.EVENTS, []);
  }

  /**
   * Save a single event
   */
  static saveEvent(event: Event): void {
    const events = this.loadEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    this.saveEvents(events);
  }

  /**
   * Delete an event
   */
  static deleteEvent(eventId: string): void {
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
  static saveBlankPeriods(periods: BlankPeriod[]): void {
    Storage.save(STORAGE_KEYS.BLANK_PERIODS, periods);
  }

  /**
   * Load blank periods from localStorage
   */
  static loadBlankPeriods(): BlankPeriod[] {
    return Storage.load<BlankPeriod[]>(STORAGE_KEYS.BLANK_PERIODS, []);
  }

  /**
   * Save a single blank period
   */
  static saveBlankPeriod(period: BlankPeriod): void {
    const periods = this.loadBlankPeriods();
    const index = periods.findIndex(p => p.id === period.id);
    if (index >= 0) {
      periods[index] = period;
    } else {
      periods.push(period);
    }
    this.saveBlankPeriods(periods);
  }

  /**
   * Delete a blank period
   */
  static deleteBlankPeriod(periodId: string): void {
    const periods = this.loadBlankPeriods();
    const filtered = periods.filter(p => p.id !== periodId);
    this.saveBlankPeriods(filtered);
  }
}
