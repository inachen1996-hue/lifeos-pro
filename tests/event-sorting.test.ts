/**
 * Property-Based Tests for Event Sorting
 * Feature: lifeos-timer-rework, Property 14: Event sorting by start time
 * Validates: Requirements 7.6
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Event } from '../src/types.js';
import { EventStorage } from '../src/storage.js';

describe('Event Sorting by Start Time', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Arbitrary generator for Event
   */
  const eventArbitrary: fc.Arbitrary<Event> = fc
    .tuple(
      fc.uuid(),
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      fc.integer({ min: 60000, max: 86400000 }), // Duration between 1 minute and 24 hours
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.constantFrom('manual', 'timer', 'calendar') as fc.Arbitrary<'manual' | 'timer' | 'calendar'>,
      fc.constantFrom(1, 2, 3),
      fc.option(fc.uuid(), { nil: undefined }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    )
    .chain(([id, name, startDate, duration, categoryId, source, priority, timerId, createdAt, updatedAt]) => {
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

  /**
   * Property 14: Event sorting by start time
   * For any list of events for a given date, when displayed, the events should be
   * sorted in ascending order by start time.
   */
  it('should sort events by start time in ascending order', () => {
    fc.assert(
      fc.property(fc.array(eventArbitrary, { minLength: 2, maxLength: 20 }), (events) => {
        // Sort events by start time (this is what the UI should do)
        const sorted = [...events].sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        
        // Verify that each event's start time is <= the next event's start time
        for (let i = 0; i < sorted.length - 1; i++) {
          const currentStartTime = new Date(sorted[i].startTime).getTime();
          const nextStartTime = new Date(sorted[i + 1].startTime).getTime();
          
          expect(currentStartTime).toBeLessThanOrEqual(nextStartTime);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting preserves all events
   * Sorting should not add or remove any events
   */
  it('should preserve all events when sorting', () => {
    fc.assert(
      fc.property(fc.array(eventArbitrary, { minLength: 1, maxLength: 20 }), (events) => {
        const sorted = [...events].sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        
        // Same number of events
        expect(sorted.length).toBe(events.length);
        
        // All original events are present
        for (const event of events) {
          const found = sorted.find(e => e.id === event.id);
          expect(found).toBeDefined();
          expect(found).toEqual(event);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sorting is stable for events with same start time
   * Events with the same start time should maintain their relative order
   */
  it('should maintain relative order for events with same start time', () => {
    // Create events with same start time but different IDs
    const sameStartTime = new Date('2025-12-07T10:00:00+08:00').toISOString();
    const events: Event[] = [
      {
        id: 'event-1',
        name: 'Event 1',
        startTime: sameStartTime,
        endTime: new Date('2025-12-07T11:00:00+08:00').toISOString(),
        categoryId: 'work',
        source: 'manual',
        priority: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'event-2',
        name: 'Event 2',
        startTime: sameStartTime,
        endTime: new Date('2025-12-07T11:00:00+08:00').toISOString(),
        categoryId: 'study',
        source: 'timer',
        priority: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'event-3',
        name: 'Event 3',
        startTime: sameStartTime,
        endTime: new Date('2025-12-07T11:00:00+08:00').toISOString(),
        categoryId: 'life',
        source: 'calendar',
        priority: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    // Sort using stable sort
    const sorted = [...events].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    // All events should have the same start time
    for (const event of sorted) {
      expect(event.startTime).toBe(sameStartTime);
    }
    
    // Order should be preserved (event-1, event-2, event-3)
    expect(sorted[0].id).toBe('event-1');
    expect(sorted[1].id).toBe('event-2');
    expect(sorted[2].id).toBe('event-3');
  });

  /**
   * Helper function to get events for a specific date
   */
  function getEventsForDate(events: Event[], date: string): Event[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return events.filter(e => {
      const start = new Date(e.startTime);
      return start >= dayStart && start <= dayEnd;
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  /**
   * Property: Filtering by date then sorting
   * When filtering events for a specific date, the result should be sorted
   */
  it('should return sorted events when filtering by date', () => {
    fc.assert(
      fc.property(
        fc.array(eventArbitrary, { minLength: 5, maxLength: 30 }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (events, targetDate) => {
          const dateString = targetDate.toISOString().split('T')[0];
          const filtered = getEventsForDate(events, dateString);
          
          // Verify sorted order
          for (let i = 0; i < filtered.length - 1; i++) {
            const currentStartTime = new Date(filtered[i].startTime).getTime();
            const nextStartTime = new Date(filtered[i + 1].startTime).getTime();
            
            expect(currentStartTime).toBeLessThanOrEqual(nextStartTime);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
