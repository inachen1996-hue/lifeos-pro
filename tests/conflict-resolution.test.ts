/**
 * Property Tests: Conflict Resolution
 * Feature: lifeos-timer-rework
 * 
 * Tests for conflict resolution properties:
 * - Property 7: Conflict resolution eliminates overlaps (Requirements 10.4)
 * - Property 8: Higher priority events unchanged (Requirements 10.2)
 * - Property 9: Event fragments preserve properties (Requirements 10.3)
 * - Property 11: Full overlap removal (Requirements 9.2)
 * - Property 12: Partial overlap splitting (Requirements 9.3)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ConflictResolver } from '../src/conflict-resolver.js';
import { Event } from '../src/types.js';

describe('Conflict Resolution Property Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Property 7: Conflict resolution eliminates overlaps
   * Validates: Requirements 10.4
   */
  it('should eliminate all overlaps after resolution', () => {
    fc.assert(
      fc.property(
        // Generate array of events with potential overlaps
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            categoryId: fc.constantFrom('work', 'study', 'rest'),
            priority: fc.integer({ min: 1, max: 3 }),
            // Generate start time within a day
            startHour: fc.integer({ min: 0, max: 22 }),
            durationMinutes: fc.integer({ min: 30, max: 180 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (eventConfigs) => {
          // Create events from configs
          const events: Event[] = eventConfigs.map((config, index) => {
            const startTime = new Date('2025-12-07T00:00:00Z');
            startTime.setHours(config.startHour);
            const endTime = new Date(startTime.getTime() + config.durationMinutes * 60 * 1000);

            return {
              id: `event_${index}`,
              name: config.name,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              categoryId: config.categoryId,
              source: config.priority === 3 ? 'manual' : config.priority === 2 ? 'timer' : 'calendar',
              priority: config.priority,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });

          // Resolve conflicts
          const resolved = ConflictResolver.resolveConflicts(events);

          // Property: No two events should overlap
          for (let i = 0; i < resolved.length; i++) {
            for (let j = i + 1; j < resolved.length; j++) {
              const event1 = resolved[i];
              const event2 = resolved[j];

              const start1 = new Date(event1.startTime).getTime();
              const end1 = new Date(event1.endTime).getTime();
              const start2 = new Date(event2.startTime).getTime();
              const end2 = new Date(event2.endTime).getTime();

              // Check no overlap
              const noOverlap = end1 <= start2 || end2 <= start1;
              expect(noOverlap).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Higher priority events unchanged by resolution
   * Validates: Requirements 10.2
   */
  it('should preserve higher priority events unchanged', () => {
    fc.assert(
      fc.property(
        // Generate a high priority event
        fc.record({
          name: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest'),
          startHour: fc.integer({ min: 8, max: 16 }),
        }),
        // Generate lower priority events that might overlap
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            categoryId: fc.constantFrom('work', 'study', 'rest'),
            startHour: fc.integer({ min: 8, max: 16 }),
            durationMinutes: fc.integer({ min: 30, max: 120 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (highPriorityConfig, lowPriorityConfigs) => {
          // Create high priority event (manual)
          const highPriorityStart = new Date('2025-12-07T00:00:00Z');
          highPriorityStart.setHours(highPriorityConfig.startHour);
          const highPriorityEnd = new Date(highPriorityStart.getTime() + 60 * 60 * 1000); // 1 hour

          const highPriorityEvent: Event = {
            id: 'high_priority',
            name: highPriorityConfig.name,
            startTime: highPriorityStart.toISOString(),
            endTime: highPriorityEnd.toISOString(),
            categoryId: highPriorityConfig.categoryId,
            source: 'manual',
            priority: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Create lower priority events
          const lowPriorityEvents: Event[] = lowPriorityConfigs.map((config, index) => {
            const startTime = new Date('2025-12-07T00:00:00Z');
            startTime.setHours(config.startHour);
            const endTime = new Date(startTime.getTime() + config.durationMinutes * 60 * 1000);

            return {
              id: `low_priority_${index}`,
              name: config.name,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              categoryId: config.categoryId,
              source: 'calendar',
              priority: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });

          const allEvents = [highPriorityEvent, ...lowPriorityEvents];

          // Resolve conflicts
          const resolved = ConflictResolver.resolveConflicts(allEvents);

          // Property: High priority event should be unchanged
          const resolvedHighPriority = resolved.find(e => e.id === 'high_priority');
          expect(resolvedHighPriority).toBeDefined();
          expect(resolvedHighPriority?.startTime).toBe(highPriorityEvent.startTime);
          expect(resolvedHighPriority?.endTime).toBe(highPriorityEvent.endTime);
          expect(resolvedHighPriority?.name).toBe(highPriorityEvent.name);
          expect(resolvedHighPriority?.categoryId).toBe(highPriorityEvent.categoryId);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Event fragments preserve properties
   * Validates: Requirements 10.3
   */
  it('should preserve event properties in split fragments', () => {
    // Create a scenario where an event will be split
    const lowPriorityEvent: Event = {
      id: 'low_priority',
      name: 'Low Priority Event',
      startTime: new Date('2025-12-07T10:00:00Z').toISOString(),
      endTime: new Date('2025-12-07T14:00:00Z').toISOString(), // 4 hours
      categoryId: 'work',
      source: 'calendar',
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const highPriorityEvent: Event = {
      id: 'high_priority',
      name: 'High Priority Event',
      startTime: new Date('2025-12-07T11:00:00Z').toISOString(),
      endTime: new Date('2025-12-07T13:00:00Z').toISOString(), // 2 hours in the middle
      categoryId: 'study',
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const events = [lowPriorityEvent, highPriorityEvent];
    const resolved = ConflictResolver.resolveConflicts(events);

    // Find the split fragments
    const fragments = resolved.filter(e => e.id.startsWith('low_priority'));

    // Property: Fragments should preserve original event properties
    for (const fragment of fragments) {
      expect(fragment.name).toBe(lowPriorityEvent.name);
      expect(fragment.categoryId).toBe(lowPriorityEvent.categoryId);
      expect(fragment.source).toBe(lowPriorityEvent.source);
      expect(fragment.priority).toBe(lowPriorityEvent.priority);
    }
  });

  /**
   * Property 11: Full overlap removal
   * Validates: Requirements 9.2
   */
  it('should remove fully overlapped lower priority events', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest'),
          startHour: fc.integer({ min: 8, max: 16 }),
        }),
        (config) => {
          // Create a high priority event
          const highPriorityStart = new Date('2025-12-07T00:00:00Z');
          highPriorityStart.setHours(config.startHour);
          const highPriorityEnd = new Date(highPriorityStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours

          const highPriorityEvent: Event = {
            id: 'high_priority',
            name: config.name,
            startTime: highPriorityStart.toISOString(),
            endTime: highPriorityEnd.toISOString(),
            categoryId: config.categoryId,
            source: 'manual',
            priority: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Create a low priority event that is fully contained
          const lowPriorityStart = new Date(highPriorityStart.getTime() + 30 * 60 * 1000); // 30 min after
          const lowPriorityEnd = new Date(lowPriorityStart.getTime() + 60 * 60 * 1000); // 1 hour duration

          const lowPriorityEvent: Event = {
            id: 'low_priority',
            name: 'Low Priority',
            startTime: lowPriorityStart.toISOString(),
            endTime: lowPriorityEnd.toISOString(),
            categoryId: config.categoryId,
            source: 'calendar',
            priority: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const events = [highPriorityEvent, lowPriorityEvent];
          const resolved = ConflictResolver.resolveConflicts(events);

          // Property: Low priority event should be removed
          const lowPriorityExists = resolved.some(e => e.id === 'low_priority');
          expect(lowPriorityExists).toBe(false);

          // High priority event should still exist
          const highPriorityExists = resolved.some(e => e.id === 'high_priority');
          expect(highPriorityExists).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Partial overlap splitting
   * Validates: Requirements 9.3
   */
  it('should split partially overlapped events', () => {
    // Create a scenario with partial overlap
    const lowPriorityEvent: Event = {
      id: 'low_priority',
      name: 'Low Priority Event',
      startTime: new Date('2025-12-07T10:00:00Z').toISOString(),
      endTime: new Date('2025-12-07T14:00:00Z').toISOString(), // 10:00-14:00
      categoryId: 'work',
      source: 'calendar',
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const highPriorityEvent: Event = {
      id: 'high_priority',
      name: 'High Priority Event',
      startTime: new Date('2025-12-07T12:00:00Z').toISOString(),
      endTime: new Date('2025-12-07T16:00:00Z').toISOString(), // 12:00-16:00 (overlaps 12:00-14:00)
      categoryId: 'study',
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const events = [lowPriorityEvent, highPriorityEvent];
    const resolved = ConflictResolver.resolveConflicts(events);

    // Property: Low priority event should be split
    const lowPriorityFragments = resolved.filter(e => e.id.startsWith('low_priority'));
    
    // Should have at least one fragment (the part before the overlap: 10:00-12:00)
    expect(lowPriorityFragments.length).toBeGreaterThan(0);

    // Verify the fragment doesn't overlap with high priority event
    for (const fragment of lowPriorityFragments) {
      const fragmentStart = new Date(fragment.startTime).getTime();
      const fragmentEnd = new Date(fragment.endTime).getTime();
      const highStart = new Date(highPriorityEvent.startTime).getTime();
      const highEnd = new Date(highPriorityEvent.endTime).getTime();

      const noOverlap = fragmentEnd <= highStart || fragmentStart >= highEnd;
      expect(noOverlap).toBe(true);
    }
  });
});
