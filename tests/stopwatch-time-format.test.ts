/**
 * Property Test: Time format consistency
 * Feature: lifeos-timer-rework, Property 19: Time format consistency
 * Validates: Requirements 3.4, 4.5
 * 
 * For any running stopwatch or countdown timer, the displayed time should be in HH:MM:SS format.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StopwatchEngine } from '../src/stopwatch-engine.js';
import { Timer } from '../src/types.js';

describe('Time Format Consistency Property Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should format elapsed time in HH:MM:SS format for any duration', () => {
    fc.assert(
      fc.property(
        // Generate timer configuration
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
        }),
        // Generate elapsed seconds (0 to 86400 = 24 hours)
        fc.integer({ min: 0, max: 86400 }),
        (timerConfig, elapsedSeconds) => {
          // Create a stopwatch timer
          const now = new Date('2025-12-07T09:00:00Z').toISOString();
          const timer: Timer = {
            ...timerConfig,
            mode: 'stopwatch',
            settings: {},
            createdAt: now,
            updatedAt: now,
          };

          const engine = new StopwatchEngine(timer);

          // Start the stopwatch
          engine.start();

          // Manually set elapsed seconds for testing
          // We access the private method through reflection for testing
          const engineAny = engine as any;
          engineAny.elapsedSeconds = elapsedSeconds;

          // Get formatted time
          const formattedTime = engine.getFormattedTime();

          // Property: Time should be in HH:MM:SS format
          const hhMmSsPattern = /^\d{2}:\d{2}:\d{2}$/;
          expect(formattedTime).toMatch(hhMmSsPattern);

          // Verify the format components
          const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
          
          // Hours, minutes, and seconds should be valid
          expect(hours).toBeGreaterThanOrEqual(0);
          expect(minutes).toBeGreaterThanOrEqual(0);
          expect(minutes).toBeLessThan(60);
          expect(seconds).toBeGreaterThanOrEqual(0);
          expect(seconds).toBeLessThan(60);

          // Verify the calculation is correct
          const expectedHours = Math.floor(elapsedSeconds / 3600);
          const expectedMinutes = Math.floor((elapsedSeconds % 3600) / 60);
          const expectedSeconds = elapsedSeconds % 60;

          expect(hours).toBe(expectedHours);
          expect(minutes).toBe(expectedMinutes);
          expect(seconds).toBe(expectedSeconds);

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format specific time values correctly', () => {
    const testCases = [
      { seconds: 0, expected: '00:00:00' },
      { seconds: 1, expected: '00:00:01' },
      { seconds: 59, expected: '00:00:59' },
      { seconds: 60, expected: '00:01:00' },
      { seconds: 61, expected: '00:01:01' },
      { seconds: 3599, expected: '00:59:59' },
      { seconds: 3600, expected: '01:00:00' },
      { seconds: 3661, expected: '01:01:01' },
      { seconds: 7200, expected: '02:00:00' },
      { seconds: 86399, expected: '23:59:59' },
    ];

    for (const { seconds, expected } of testCases) {
      const now = new Date('2025-12-07T09:00:00Z').toISOString();
      const timer: Timer = {
        id: 'test-timer',
        name: 'Test Timer',
        icon: '⏱️',
        categoryId: 'work',
        mode: 'stopwatch',
        settings: {},
        createdAt: now,
        updatedAt: now,
      };

      const engine = new StopwatchEngine(timer);
      engine.start();

      // Set elapsed seconds
      const engineAny = engine as any;
      engineAny.elapsedSeconds = seconds;

      const formattedTime = engine.getFormattedTime();
      expect(formattedTime).toBe(expected);
    }
  });

  it('should pad single digit values with leading zeros', () => {
    const now = new Date('2025-12-07T09:00:00Z').toISOString();
    const timer: Timer = {
      id: 'test-timer',
      name: 'Test Timer',
      icon: '⏱️',
      categoryId: 'work',
      mode: 'stopwatch',
      settings: {},
      createdAt: now,
      updatedAt: now,
    };

    const engine = new StopwatchEngine(timer);
    engine.start();

    // Test padding for hours, minutes, and seconds
    const testCases = [
      { seconds: 3661, expected: '01:01:01' }, // 1 hour, 1 minute, 1 second
      { seconds: 3605, expected: '01:00:05' }, // 1 hour, 0 minutes, 5 seconds
      { seconds: 65, expected: '00:01:05' },   // 0 hours, 1 minute, 5 seconds
      { seconds: 5, expected: '00:00:05' },    // 0 hours, 0 minutes, 5 seconds
    ];

    for (const { seconds, expected } of testCases) {
      const engineAny = engine as any;
      engineAny.elapsedSeconds = seconds;

      const formattedTime = engine.getFormattedTime();
      expect(formattedTime).toBe(expected);
      
      // Verify all parts have exactly 2 digits
      const parts = formattedTime.split(':');
      expect(parts).toHaveLength(3);
      parts.forEach(part => {
        expect(part).toHaveLength(2);
      });
    }
  });
});
