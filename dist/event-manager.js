/**
 * Event Manager - Handles event operations with priority system
 * Implements Requirements 9.1, 9.4, 9.5
 */
import { EventStorage } from './storage.js';
/**
 * Event Priority Levels
 * Requirement 9.1: Priority field (1=calendar, 2=timer, 3=manual)
 */
export var EventPriority;
(function (EventPriority) {
    EventPriority[EventPriority["CALENDAR"] = 1] = "CALENDAR";
    EventPriority[EventPriority["TIMER"] = 2] = "TIMER";
    EventPriority[EventPriority["MANUAL"] = 3] = "MANUAL"; // Highest - user manual edits
})(EventPriority || (EventPriority = {}));
/**
 * Event Manager - Handles all event operations
 */
export class EventManager {
    /**
     * Create a new event
     */
    static createEvent(name, startTime, endTime, categoryId, source, timerId) {
        // Validate times
        if (new Date(startTime) >= new Date(endTime)) {
            throw new Error('End time must be after start time');
        }
        // Determine priority based on source
        const priority = this.getPriorityFromSource(source);
        const now = new Date().toISOString();
        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            startTime,
            endTime,
            categoryId,
            source,
            priority,
            timerId,
            createdAt: now,
            updatedAt: now,
        };
        EventStorage.saveEvent(event);
        return event;
    }
    /**
     * Update an existing event
     * Requirement 9.4: Automatic priority upgrade on event edit
     */
    static updateEvent(eventId, updates) {
        const events = EventStorage.loadEvents();
        const event = events.find(e => e.id === eventId);
        if (!event) {
            throw new Error(`Event not found: ${eventId}`);
        }
        // Check if name or time was edited
        const nameChanged = updates.name !== undefined && updates.name !== event.name;
        const timeChanged = (updates.startTime !== undefined && updates.startTime !== event.startTime) ||
            (updates.endTime !== undefined && updates.endTime !== event.endTime);
        // Requirement 9.4: Upgrade to manual priority if name or time edited
        if (nameChanged || timeChanged) {
            updates.priority = EventPriority.MANUAL;
            updates.source = 'manual';
            console.log(`Event ${eventId} upgraded to manual priority due to edit`);
        }
        // Apply updates
        const updatedEvent = {
            ...event,
            ...updates,
            id: event.id, // Preserve ID
            createdAt: event.createdAt, // Preserve creation date
            updatedAt: new Date().toISOString(),
        };
        // Validate times if changed
        if (updatedEvent.startTime && updatedEvent.endTime) {
            if (new Date(updatedEvent.startTime) >= new Date(updatedEvent.endTime)) {
                throw new Error('End time must be after start time');
            }
        }
        EventStorage.saveEvent(updatedEvent);
        // Requirement 9.5: Trigger conflict resolution on priority change
        if (updates.priority !== undefined && updates.priority !== event.priority) {
            console.log(`Priority changed for event ${eventId}, conflict resolution needed`);
        }
        return updatedEvent;
    }
    /**
     * Delete an event
     */
    static deleteEvent(eventId) {
        EventStorage.deleteEvent(eventId);
    }
    /**
     * Get all events
     */
    static getAllEvents() {
        return EventStorage.loadEvents();
    }
    /**
     * Get events for a specific date
     */
    static getEventsForDate(date) {
        const events = EventStorage.loadEvents();
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);
        return events.filter(e => {
            const eventStart = new Date(e.startTime);
            return eventStart >= targetDate && eventStart < nextDate;
        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    /**
     * Get events by category
     */
    static getEventsByCategory(categoryId) {
        const events = EventStorage.loadEvents();
        return events.filter(e => e.categoryId === categoryId);
    }
    /**
     * Get events by timer
     */
    static getEventsByTimer(timerId) {
        const events = EventStorage.loadEvents();
        return events.filter(e => e.timerId === timerId);
    }
    /**
     * Get priority from source
     */
    static getPriorityFromSource(source) {
        switch (source) {
            case 'manual':
                return EventPriority.MANUAL;
            case 'timer':
                return EventPriority.TIMER;
            case 'calendar':
                return EventPriority.CALENDAR;
            default:
                return EventPriority.MANUAL;
        }
    }
    /**
     * Get source icon
     * Requirement 9.1: Visual indicators for event sources
     */
    static getSourceIcon(source) {
        switch (source) {
            case 'manual':
                return '✏️'; // Manual edit
            case 'timer':
                return '⏱️'; // Timer
            case 'calendar':
                return '📅'; // Calendar
            default:
                return '';
        }
    }
}
//# sourceMappingURL=event-manager.js.map