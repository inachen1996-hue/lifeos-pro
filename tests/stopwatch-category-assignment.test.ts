/**
 * Property Test: Category assignment to timer events
 * Feature: lifeos-timer-rework, Property 15: Category assignment to timer events
 * Validates: Requirements 3.5
 * 
 * For any timer with category C, when that timer creates an event record,
 * the event's category should be C.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StopwatchEngine } from '../src/stopwatch-engine.js';
import { Timer } from '../src/types.js';
import { EventStorage } from '../src/storage.js';

describe('Category Assignment to Timer Events Property Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should assign timer category to created events', () => {
    fc.assert(
      fc.property(
        // Generate timer configuration
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
        }),
        (timerConfig) => {
          // Create a stopwatch timer
          const now = new Date('2025-12-07T09:00:00Z').toISOString();
          const timer: Timer = {
            ...timerConfig,
            mode: 'stopwatch',
            settings: {},
            createdAt: now,
            updatedAt: now,
          };

          // Mock Date provider to control time - use 120 seconds to ensure event is recorded
          const startTime = new Date('2025-12-07T10:00:00Z');
          const endTime = new Date(startTime.getTime() + 120 * 1000);

          let callCount = 0;
          const dateProvider = () => {
            callCount++;
            return callCount === 1 ? startTime : endTime;
          };

          // Create stopwatch engine with date provider
          const engine = new StopwatchEngine(timer, dateProvider);

          // Start and stop the stopwatch
          engine.start();
          const result = engine.stop();

          // Property: Event should be created with the same category as the timer
          expect(result.recorded).toBe(true);
          expect(result.event).toBeDefined();
          expect(result.event?.categoryId).toBe(timer.categoryId);

          // Verify in storage
          const events = EventStorage.loadEvents();
          const savedEvent = events.find(e => e.id === result.event?.id);
          expect(savedEvent).toBeDefined();
          expect(savedEvent?.categoryId).toBe(timer.categoryId);

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve category across different timer categories', () => {
    const categories = ['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'];
    
    for (const categoryId of categories) {
      localStorage.clear();

      const now = new Date('2025-12-07T09:00:00Z').toISOString();
      const timer: Timer = {
        id: `timer-${categoryId}`,
        name: `Test Timer ${categoryId}`,
        icon: '⏱️',
        categoryId,
        mode: 'stopwatch',
        settings: {},
        createdAt: now,
        updatedAt: now,
      };

      // Mock Date provider - 90 seconds to ensure event is recorded
      const startTime = new Date('2025-12-07T10:00:00Z');
      const endTime = new Date(startTime.getTime() + 90 * 1000);

      let callCount = 0;
      const dateProvider = () => {
        callCount++;
        return callCount === 1 ? startTime : endTime;
      };

      const engine = new StopwatchEngine(timer, dateProvider);

      engine.start();
      const result = engine.stop();

      // Verify category assignment
      expect(result.recorded).toBe(true);
      expect(result.event?.categoryId).toBe(categoryId);

      const events = EventStorage.loadEvents();
      expect(events.length).toBe(1);
      expect(events[0].categoryId).toBe(categoryId);
    }
  });
});
