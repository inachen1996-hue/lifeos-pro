/**
 * Event Manager - Handles event operations with priority system
 * Implements Requirements 9.1, 9.4, 9.5
 */
import { Event } from './types.js';
/**
 * Event Priority Levels
 * Requirement 9.1: Priority field (1=calendar, 2=timer, 3=manual)
 */
export declare enum EventPriority {
    CALENDAR = 1,// Lowest - imported calendar events
    TIMER = 2,// Medium - events created by timers
    MANUAL = 3
}
/**
 * Event Manager - Handles all event operations
 */
export declare class EventManager {
    /**
     * Create a new event
     */
    static createEvent(name: string, startTime: string, endTime: string, categoryId: string, source: 'manual' | 'timer' | 'calendar', timerId?: string): Event;
    /**
     * Update an existing event
     * Requirement 9.4: Automatic priority upgrade on event edit
     */
    static updateEvent(eventId: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Event;
    /**
     * Delete an event
     */
    static deleteEvent(eventId: string): void;
    /**
     * Get all events
     */
    static getAllEvents(): Event[];
    /**
     * Get events for a specific date
     */
    static getEventsForDate(date: string): Event[];
    /**
     * Get events by category
     */
    static getEventsByCategory(categoryId: string): Event[];
    /**
     * Get events by timer
     */
    static getEventsByTimer(timerId: string): Event[];
    /**
     * Get priority from source
     */
    private static getPriorityFromSource;
    /**
     * Get source icon
     * Requirement 9.1: Visual indicators for event sources
     */
    static getSourceIcon(source: 'manual' | 'timer' | 'calendar'): string;
}
//# sourceMappingURL=event-manager.d.ts.map