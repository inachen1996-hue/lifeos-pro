/**
 * Property-Based Tests for Event Serialization
 * Feature: lifeos-timer-rework, Property 2: Event serialization round trip
 * Validates: Requirements 15.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Event } from '../src/types.js';
import { EventStorage } from '../src/storage.js';

/**
 * Arbitrary generator for Event source
 */
const eventSourceArbitrary = fc.constantFrom('manual', 'timer', 'calendar') as fc.Arbitrary<'manual' | 'timer' | 'calendar'>;

/**
 * Arbitrary generator for Event priority
 * Priority levels: 1=calendar, 2=timer, 3=manual
 */
const eventPriorityArbitrary = fc.constantFrom(1, 2, 3);

/**
 * Arbitrary generator for Event
 * Generates valid event records with all required fields
 */
const eventArbitrary: fc.Arbitrary<Event> = fc
  .tuple(
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    fc.integer({ min: 60000, max: 86400000 }), // Duration between 1 minute and 24 hours
    fc.string({ minLength: 1, maxLength: 20 }),
    eventSourceArbitrary,
    eventPriorityArbitrary,
    fc.option(fc.uuid(), { nil: undefined }),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  )
  .chain(([id, name, startDate, duration, categoryId, source, priority, timerId, createdAt, updatedAt]) => {
    // Ensure valid dates and endTime is after startTime
    const startTime = startDate.getTime();
    const endTime = startTime + duration;
    
    return fc.constant({
      id,
      name,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      categoryId,
      source,
      priority,
      timerId,
      createdAt: new Date(createdAt).toISOString(),
      updatedAt: new Date(updatedAt).toISOString(),
    });
  });

describe('Event Serialization Round Trip', () => {
  /**
   * Property 2: Event serialization round trip
   * For any valid event record, serializing then deserializing should produce
   * an equivalent event with all fields preserved.
   */
  it('should preserve all event fields after serialization and deserialization', () => {
    fc.assert(
      fc.property(eventArbitrary, (event) => {
        // Save the event
        EventStorage.saveEvent(event);
        
        // Load all events
        const loadedEvents = EventStorage.loadEvents();
        
        // Find the event we just saved
        const loadedEvent = loadedEvents.find(e => e.id === event.id);
        
        // Assert the event was found
        expect(loadedEvent).toBeDefined();
        
        // Assert all fields are preserved
        expect(loadedEvent).toEqual(event);
        expect(loadedEvent!.id).toBe(event.id);
        expect(loadedEvent!.name).toBe(event.name);
        expect(loadedEvent!.startTime).toBe(event.startTime);
        expect(loadedEvent!.endTime).toBe(event.endTime);
        expect(loadedEvent!.categoryId).toBe(event.categoryId);
        expect(loadedEvent!.source).toBe(event.source);
        expect(loadedEvent!.priority).toBe(event.priority);
        expect(loadedEvent!.timerId).toBe(event.timerId);
        expect(loadedEvent!.createdAt).toBe(event.createdAt);
        expect(loadedEvent!.updatedAt).toBe(event.updatedAt);
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });

  /**
   * Additional test: Multiple events serialization
   * Ensures that saving multiple events preserves all of them correctly
   */
  it('should preserve multiple events after serialization', () => {
    fc.assert(
      fc.property(fc.array(eventArbitrary, { minLength: 1, maxLength: 20 }), (events) => {
        // Save all events
        EventStorage.saveEvents(events);
        
        // Load all events
        const loadedEvents = EventStorage.loadEvents();
        
        // Assert same number of events
        expect(loadedEvents.length).toBe(events.length);
        
        // Assert each event is preserved
        for (const event of events) {
          const loadedEvent = loadedEvents.find(e => e.id === event.id);
          expect(loadedEvent).toEqual(event);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Event without timerId (manual or calendar events)
   */
  it('should handle events without timerId', () => {
    const event: Event = {
      id: 'test-1',
      name: 'Manual Event',
      startTime: new Date('2025-12-07T10:00:00+08:00').toISOString(),
      endTime: new Date('2025-12-07T11:00:00+08:00').toISOString(),
      categoryId: 'work',
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    EventStorage.saveEvent(event);
    const loaded = EventStorage.loadEvents().find(e => e.id === event.id);
    
    expect(loaded).toEqual(event);
    expect(loaded!.timerId).toBeUndefined();
  });

  /**
   * Edge case: Event with timerId (timer-generated events)
   */
  it('should handle events with timerId', () => {
    const event: Event = {
      id: 'test-2',
      name: 'Timer Event',
      startTime: new Date('2025-12-07T14:00:00+08:00').toISOString(),
      endTime: new Date('2025-12-07T15:30:00+08:00').toISOString(),
      categoryId: 'study',
      source: 'timer',
      priority: 2,
      timerId: 'timer-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    EventStorage.saveEvent(event);
    const loaded = EventStorage.loadEvents().find(e => e.id === event.id);
    
    expect(loaded).toEqual(event);
    expect(loaded!.timerId).toBe('timer-123');
  });

  /**
   * Property: Source and priority consistency
   * Verifies that the relationship between source and priority is preserved
   */
  it('should preserve source and priority relationship', () => {
    fc.assert(
      fc.property(eventArbitrary, (event) => {
        EventStorage.saveEvent(event);
        const loaded = EventStorage.loadEvents().find(e => e.id === event.id);
        
        expect(loaded!.source).toBe(event.source);
        expect(loaded!.priority).toBe(event.priority);
        
        // Verify typical source-priority relationships
        if (event.source === 'manual') {
          // Manual events typically have priority 3, but we preserve whatever was set
          expect(loaded!.priority).toBe(event.priority);
        }
        if (event.source === 'timer') {
          // Timer events typically have priority 2
          expect(loaded!.priority).toBe(event.priority);
        }
        if (event.source === 'calendar') {
          // Calendar events typically have priority 1
          expect(loaded!.priority).toBe(event.priority);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: ISO 8601 timestamp format preservation
   * Ensures that timestamps remain in valid ISO 8601 format
   */
  it('should preserve ISO 8601 timestamp format', () => {
    fc.assert(
      fc.property(eventArbitrary, (event) => {
        EventStorage.saveEvent(event);
        const loaded = EventStorage.loadEvents().find(e => e.id === event.id);
        
        // Verify timestamps are valid ISO 8601 strings
        expect(new Date(loaded!.startTime).toISOString()).toBe(loaded!.startTime);
        expect(new Date(loaded!.endTime).toISOString()).toBe(loaded!.endTime);
        expect(new Date(loaded!.createdAt).toISOString()).toBe(loaded!.createdAt);
        expect(new Date(loaded!.updatedAt).toISOString()).toBe(loaded!.updatedAt);
        
        // Verify endTime is after startTime
        expect(new Date(loaded!.endTime).getTime()).toBeGreaterThan(
          new Date(loaded!.startTime).getTime()
        );
      }),
      { numRuns: 100 }
    );
  });
});
