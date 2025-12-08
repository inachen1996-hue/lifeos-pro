/**
 * Property Test: Countdown creates full duration record
 * Feature: lifeos-timer-rework, Property 5: Countdown creates full duration record
 * Validates: Requirements 4.4
 * 
 * For any countdown timer with configured duration D, when the timer completes,
 * the created event should have duration exactly equal to D.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { CountdownEngine } from '../src/countdown-engine.js';
import { Timer } from '../src/types.js';
import { EventStorage } from '../src/storage.js';

describe('Countdown Full Duration Record Property Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should create event with full configured duration when countdown completes', () => {
    fc.assert(
      fc.property(
        // Generate timer configuration
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
        }),
        // Generate countdown duration in minutes (1 to 120 minutes = 2 hours)
        fc.integer({ min: 1, max: 120 }),
        (timerConfig, durationMinutes) => {
          // Create a countdown timer
          const now = new Date('2025-12-07T09:00:00Z').toISOString();
          const timer: Timer = {
            ...timerConfig,
            mode: 'countdown',
            settings: {
              countdownDuration: durationMinutes,
            },
            createdAt: now,
            updatedAt: now,
          };

          // Mock Date provider to simulate countdown completion
          const startTime = new Date('2025-12-07T10:00:00Z');
          const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

          let callCount = 0;
          const dateProvider = () => {
            callCount++;
            // First call is for startTime, second call is for endTime
            return callCount === 1 ? startTime : endTime;
          };

          // Create countdown engine with date provider
          const engine = new CountdownEngine(timer, dateProvider);

          // Start the countdown
          engine.start();
          
          // Manually trigger completion by setting remaining seconds to 0
          const engineAny = engine as any;
          engineAny.remainingSeconds = 0;
          
          // Trigger completion
          engineAny.handleCompletion();

          // Load events from storage
          const events = EventStorage.loadEvents();

          // Property: Event should be created with full configured duration
          expect(events.length).toBe(1);
          const event = events[0];

          // Calculate actual duration from event
          const eventStart = new Date(event.startTime).getTime();
          const eventEnd = new Date(event.endTime).getTime();
          const actualDurationMinutes = (eventEnd - eventStart) / (1000 * 60);

          // Duration should match configured duration
          expect(actualDurationMinutes).toBe(durationMinutes);
          expect(event.name).toBe(timer.name);
          expect(event.categoryId).toBe(timer.categoryId);
          expect(event.source).toBe('timer');
          expect(event.priority).toBe(2);
          expect(event.timerId).toBe(timer.id);

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create event with exact duration for specific countdown values', () => {
    const testCases = [
      { minutes: 1, expectedMs: 60 * 1000 },
      { minutes: 5, expectedMs: 5 * 60 * 1000 },
      { minutes: 25, expectedMs: 25 * 60 * 1000 },
      { minutes: 60, expectedMs: 60 * 60 * 1000 },
    ];

    for (const { minutes, expectedMs } of testCases) {
      localStorage.clear();

      const now = new Date('2025-12-07T09:00:00Z').toISOString();
      const timer: Timer = {
        id: `timer-${minutes}`,
        name: `Test Timer ${minutes}min`,
        icon: '⏱️',
        categoryId: 'work',
        mode: 'countdown',
        settings: {
          countdownDuration: minutes,
        },
        createdAt: now,
        updatedAt: now,
      };

      const startTime = new Date('2025-12-07T10:00:00Z');
      const endTime = new Date(startTime.getTime() + expectedMs);

      let callCount = 0;
      const dateProvider = () => {
        callCount++;
        return callCount === 1 ? startTime : endTime;
      };

      const engine = new CountdownEngine(timer, dateProvider);

      // Start the countdown
      engine.start();
      
      // Manually trigger completion
      const engineAny = engine as any;
      engineAny.remainingSeconds = 0;
      engineAny.handleCompletion();

      const events = EventStorage.loadEvents();
      expect(events.length).toBe(1);

      const event = events[0];
      const eventStart = new Date(event.startTime).getTime();
      const eventEnd = new Date(event.endTime).getTime();
      const actualDuration = eventEnd - eventStart;

      expect(actualDuration).toBe(expectedMs);
    }
  });
});
