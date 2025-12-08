/**
 * Property Test: Pomodoro records only work periods
 * Feature: lifeos-timer-rework, Property 6: Pomodoro records only work periods
 * Validates: Requirements 5.4
 * 
 * For any completed Pomodoro session with N cycles, exactly N work period events should be created,
 * and zero rest period events should be created.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { PomodoroEngine } from '../src/pomodoro-engine.js';
import { Timer } from '../src/types.js';
import { EventStorage } from '../src/storage.js';

describe('Pomodoro Work Periods Only Property Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should create exactly N work period events for N cycles', () => {
    fc.assert(
      fc.property(
        // Generate timer configuration
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
        }),
        // Generate Pomodoro settings
        fc.integer({ min: 1, max: 10 }), // cycles
        fc.integer({ min: 1, max: 60 }), // work duration (minutes)
        fc.integer({ min: 1, max: 30 }), // rest duration (minutes)
        (timerConfig, cycles, workDuration, restDuration) => {
          // Create a Pomodoro timer
          const now = new Date('2025-12-07T09:00:00Z').toISOString();
          const timer: Timer = {
            ...timerConfig,
            mode: 'pomodoro',
            settings: {
              workDuration,
              restDuration,
              cycles,
            },
            createdAt: now,
            updatedAt: now,
          };

          // Mock Date provider to simulate time progression
          let currentTime = new Date('2025-12-07T10:00:00Z');
          const dateProvider = () => {
            return currentTime;
          };

          // Create Pomodoro engine
          const engine = new PomodoroEngine(timer, dateProvider);

          // Simulate completing all cycles
          const engineAny = engine as any;
          
          // Start the session
          engine.start();

          // Manually complete all work and rest periods
          for (let cycle = 1; cycle <= cycles; cycle++) {
            // Complete work period
            const workStart = new Date(currentTime);
            currentTime = new Date(currentTime.getTime() + workDuration * 60 * 1000);
            
            engineAny.workPeriods.push({
              start: workStart.toISOString(),
              end: currentTime.toISOString(),
            });

            // If not the last cycle, simulate rest period
            if (cycle < cycles) {
              currentTime = new Date(currentTime.getTime() + restDuration * 60 * 1000);
            }
          }

          // Trigger completion
          engineAny.handleAllComplete();

          // Load events from storage
          const events = EventStorage.loadEvents();

          // Property: Exactly N work period events should be created
          expect(events.length).toBe(cycles);

          // Verify each event is a work period (not rest)
          for (let i = 0; i < events.length; i++) {
            const event = events[i];
            expect(event.name).toBe(timer.name);
            expect(event.categoryId).toBe(timer.categoryId);
            expect(event.source).toBe('timer');
            expect(event.priority).toBe(2);
            expect(event.timerId).toBe(timer.id);

            // Verify duration matches work duration
            const eventStart = new Date(event.startTime).getTime();
            const eventEnd = new Date(event.endTime).getTime();
            const actualDurationMinutes = (eventEnd - eventStart) / (1000 * 60);
            expect(actualDurationMinutes).toBe(workDuration);
          }

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create correct number of work periods for specific cycle counts', () => {
    const testCases = [
      { cycles: 1, workDuration: 25, restDuration: 5 },
      { cycles: 2, workDuration: 25, restDuration: 5 },
      { cycles: 4, workDuration: 25, restDuration: 5 },
      { cycles: 8, workDuration: 15, restDuration: 3 },
    ];

    for (const { cycles, workDuration, restDuration } of testCases) {
      localStorage.clear();

      const now = new Date('2025-12-07T09:00:00Z').toISOString();
      const timer: Timer = {
        id: `timer-${cycles}`,
        name: `Pomodoro ${cycles} cycles`,
        icon: '🍅',
        categoryId: 'work',
        mode: 'pomodoro',
        settings: {
          workDuration,
          restDuration,
          cycles,
        },
        createdAt: now,
        updatedAt: now,
      };

      let currentTime = new Date('2025-12-07T10:00:00Z');
      const dateProvider = () => currentTime;

      const engine = new PomodoroEngine(timer, dateProvider);
      const engineAny = engine as any;

      engine.start();

      // Simulate all cycles
      for (let cycle = 1; cycle <= cycles; cycle++) {
        const workStart = new Date(currentTime);
        currentTime = new Date(currentTime.getTime() + workDuration * 60 * 1000);

        engineAny.workPeriods.push({
          start: workStart.toISOString(),
          end: currentTime.toISOString(),
        });

        if (cycle < cycles) {
          currentTime = new Date(currentTime.getTime() + restDuration * 60 * 1000);
        }
      }

      engineAny.handleAllComplete();

      const events = EventStorage.loadEvents();
      expect(events.length).toBe(cycles);

      // Verify no rest periods are recorded
      const totalRecordedMinutes = events.reduce((sum, event) => {
        const duration = (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60);
        return sum + duration;
      }, 0);

      expect(totalRecordedMinutes).toBe(cycles * workDuration);
    }
  });
});
