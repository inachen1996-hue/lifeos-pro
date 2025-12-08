/**
 * Property Test: Priority upgrade on edit
 * Feature: lifeos-timer-rework, Property 10: Priority upgrade on edit
 * Validates: Requirements 9.4
 * 
 * For any event with source 'timer' or 'calendar', when the event's name or time is edited,
 * the event's priority should be upgraded to 3 (manual edit priority).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { EventManager, EventPriority } from '../src/event-manager.js';
import { Event } from '../src/types.js';
import { EventStorage } from '../src/storage.js';

describe('Priority Upgrade on Edit Property Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should upgrade priority to manual when name is edited', () => {
    fc.assert(
      fc.property(
        // Generate event configuration
        fc.record({
          name: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
          source: fc.constantFrom('timer', 'calendar') as fc.Arbitrary<'timer' | 'calendar'>,
        }),
        // Generate new name (different from original)
        fc.string({ minLength: 1 }),
        (eventConfig, newName) => {
          // Skip if new name is same as original
          if (newName === eventConfig.name) {
            return;
          }

          // Create an event with timer or calendar source
          const startTime = new Date('2025-12-07T10:00:00Z').toISOString();
          const endTime = new Date('2025-12-07T11:00:00Z').toISOString();

          const event = EventManager.createEvent(
            eventConfig.name,
            startTime,
            endTime,
            eventConfig.categoryId,
            eventConfig.source
          );

          // Verify initial priority
          const initialPriority = eventConfig.source === 'timer' ? EventPriority.TIMER : EventPriority.CALENDAR;
          expect(event.priority).toBe(initialPriority);
          expect(event.source).toBe(eventConfig.source);

          // Edit the event name
          const updatedEvent = EventManager.updateEvent(event.id, {
            name: newName,
          });

          // Property: Priority should be upgraded to manual
          expect(updatedEvent.priority).toBe(EventPriority.MANUAL);
          expect(updatedEvent.source).toBe('manual');
          expect(updatedEvent.name).toBe(newName);

          // Verify in storage
          const events = EventStorage.loadEvents();
          const savedEvent = events.find(e => e.id === event.id);
          expect(savedEvent?.priority).toBe(EventPriority.MANUAL);
          expect(savedEvent?.source).toBe('manual');

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should upgrade priority to manual when start time is edited', () => {
    fc.assert(
      fc.property(
        // Generate event configuration
        fc.record({
          name: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
          source: fc.constantFrom('timer', 'calendar') as fc.Arbitrary<'timer' | 'calendar'>,
        }),
        // Generate time offset in minutes (1 to 30) - keep it less than the 1 hour duration
        fc.integer({ min: 1, max: 30 }),
        (eventConfig, offsetMinutes) => {
          // Create an event
          const startTime = new Date('2025-12-07T10:00:00Z');
          const endTime = new Date('2025-12-07T11:00:00Z');

          const event = EventManager.createEvent(
            eventConfig.name,
            startTime.toISOString(),
            endTime.toISOString(),
            eventConfig.categoryId,
            eventConfig.source
          );

          // Verify initial priority
          const initialPriority = eventConfig.source === 'timer' ? EventPriority.TIMER : EventPriority.CALENDAR;
          expect(event.priority).toBe(initialPriority);

          // Edit the start time (move it forward but keep it before end time)
          const newStartTime = new Date(startTime.getTime() + offsetMinutes * 60 * 1000);
          const updatedEvent = EventManager.updateEvent(event.id, {
            startTime: newStartTime.toISOString(),
          });

          // Property: Priority should be upgraded to manual
          expect(updatedEvent.priority).toBe(EventPriority.MANUAL);
          expect(updatedEvent.source).toBe('manual');

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should upgrade priority to manual when end time is edited', () => {
    fc.assert(
      fc.property(
        // Generate event configuration
        fc.record({
          name: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
          source: fc.constantFrom('timer', 'calendar') as fc.Arbitrary<'timer' | 'calendar'>,
        }),
        // Generate time offset in minutes (1 to 60)
        fc.integer({ min: 1, max: 60 }),
        (eventConfig, offsetMinutes) => {
          // Create an event
          const startTime = new Date('2025-12-07T10:00:00Z');
          const endTime = new Date('2025-12-07T11:00:00Z');

          const event = EventManager.createEvent(
            eventConfig.name,
            startTime.toISOString(),
            endTime.toISOString(),
            eventConfig.categoryId,
            eventConfig.source
          );

          // Verify initial priority
          const initialPriority = eventConfig.source === 'timer' ? EventPriority.TIMER : EventPriority.CALENDAR;
          expect(event.priority).toBe(initialPriority);

          // Edit the end time
          const newEndTime = new Date(endTime.getTime() + offsetMinutes * 60 * 1000);
          const updatedEvent = EventManager.updateEvent(event.id, {
            endTime: newEndTime.toISOString(),
          });

          // Property: Priority should be upgraded to manual
          expect(updatedEvent.priority).toBe(EventPriority.MANUAL);
          expect(updatedEvent.source).toBe('manual');

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT upgrade priority when only category is edited', () => {
    const startTime = new Date('2025-12-07T10:00:00Z').toISOString();
    const endTime = new Date('2025-12-07T11:00:00Z').toISOString();

    // Test with timer source
    const timerEvent = EventManager.createEvent(
      'Test Event',
      startTime,
      endTime,
      'work',
      'timer'
    );

    expect(timerEvent.priority).toBe(EventPriority.TIMER);

    // Edit only category
    const updatedTimerEvent = EventManager.updateEvent(timerEvent.id, {
      categoryId: 'study',
    });

    // Priority should remain unchanged
    expect(updatedTimerEvent.priority).toBe(EventPriority.TIMER);
    expect(updatedTimerEvent.source).toBe('timer');

    localStorage.clear();

    // Test with calendar source
    const calendarEvent = EventManager.createEvent(
      'Test Event',
      startTime,
      endTime,
      'work',
      'calendar'
    );

    expect(calendarEvent.priority).toBe(EventPriority.CALENDAR);

    // Edit only category
    const updatedCalendarEvent = EventManager.updateEvent(calendarEvent.id, {
      categoryId: 'rest',
    });

    // Priority should remain unchanged
    expect(updatedCalendarEvent.priority).toBe(EventPriority.CALENDAR);
    expect(updatedCalendarEvent.source).toBe('calendar');
  });

  it('should handle manual events without changing priority', () => {
    const startTime = new Date('2025-12-07T10:00:00Z').toISOString();
    const endTime = new Date('2025-12-07T11:00:00Z').toISOString();

    const manualEvent = EventManager.createEvent(
      'Manual Event',
      startTime,
      endTime,
      'work',
      'manual'
    );

    expect(manualEvent.priority).toBe(EventPriority.MANUAL);

    // Edit name
    const updatedEvent = EventManager.updateEvent(manualEvent.id, {
      name: 'Updated Manual Event',
    });

    // Priority should remain manual
    expect(updatedEvent.priority).toBe(EventPriority.MANUAL);
    expect(updatedEvent.source).toBe('manual');
  });

  it('should upgrade priority for both timer and calendar sources', () => {
    const startTime = new Date('2025-12-07T10:00:00Z').toISOString();
    const endTime = new Date('2025-12-07T11:00:00Z').toISOString();

    // Test timer source
    const timerEvent = EventManager.createEvent(
      'Timer Event',
      startTime,
      endTime,
      'work',
      'timer'
    );

    expect(timerEvent.priority).toBe(EventPriority.TIMER);

    const updatedTimerEvent = EventManager.updateEvent(timerEvent.id, {
      name: 'Updated Timer Event',
    });

    expect(updatedTimerEvent.priority).toBe(EventPriority.MANUAL);

    localStorage.clear();

    // Test calendar source
    const calendarEvent = EventManager.createEvent(
      'Calendar Event',
      startTime,
      endTime,
      'work',
      'calendar'
    );

    expect(calendarEvent.priority).toBe(EventPriority.CALENDAR);

    const updatedCalendarEvent = EventManager.updateEvent(calendarEvent.id, {
      name: 'Updated Calendar Event',
    });

    expect(updatedCalendarEvent.priority).toBe(EventPriority.MANUAL);
  });
});
