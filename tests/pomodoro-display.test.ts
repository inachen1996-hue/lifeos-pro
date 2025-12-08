/**
 * Property Test: Pomodoro display completeness
 * Feature: lifeos-timer-rework, Property 20: Pomodoro display completeness
 * Validates: Requirements 5.5
 * 
 * For any running Pomodoro timer, the display should show current period type (Work/Rest),
 * remaining time, and cycle progress.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { PomodoroEngine } from '../src/pomodoro-engine.js';
import { Timer } from '../src/types.js';

describe('Pomodoro Display Completeness Property Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should display period type, remaining time, and cycle progress', () => {
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

          const engine = new PomodoroEngine(timer);

          // Start the Pomodoro
          engine.start();

          // Get display info
          const displayInfo = engine.getDisplayInfo();

          // Property: Display should include period type
          expect(displayInfo.period).toBeDefined();
          expect(['work', 'rest']).toContain(displayInfo.period);

          // Property: Display should include remaining time in HH:MM:SS format
          expect(displayInfo.remaining).toBeDefined();
          expect(displayInfo.remaining).toMatch(/^\d{2}:\d{2}:\d{2}$/);

          // Property: Display should include cycle progress
          expect(displayInfo.cycle).toBeDefined();
          expect(displayInfo.cycle).toMatch(/^\d+\/\d+$/);

          // Verify cycle progress format
          const [current, total] = displayInfo.cycle.split('/').map(Number);
          expect(current).toBeGreaterThanOrEqual(1);
          expect(current).toBeLessThanOrEqual(cycles);
          expect(total).toBe(cycles);

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show correct period type at different stages', () => {
    const now = new Date('2025-12-07T09:00:00Z').toISOString();
    const timer: Timer = {
      id: 'test-timer',
      name: 'Test Pomodoro',
      icon: '🍅',
      categoryId: 'work',
      mode: 'pomodoro',
      settings: {
        workDuration: 25,
        restDuration: 5,
        cycles: 2,
      },
      createdAt: now,
      updatedAt: now,
    };

    const engine = new PomodoroEngine(timer);

    // Start - should be in work period
    engine.start();
    let displayInfo = engine.getDisplayInfo();
    expect(displayInfo.period).toBe('work');
    expect(displayInfo.cycle).toBe('1/2');

    // Simulate work period completion and transition to rest
    const engineAny = engine as any;
    engineAny.currentPeriod = 'rest';
    engineAny.state = 'rest_running';

    displayInfo = engine.getDisplayInfo();
    expect(displayInfo.period).toBe('rest');
    expect(displayInfo.cycle).toBe('1/2');

    // Simulate moving to second cycle
    engineAny.currentCycle = 2;
    engineAny.currentPeriod = 'work';
    engineAny.state = 'work_running';

    displayInfo = engine.getDisplayInfo();
    expect(displayInfo.period).toBe('work');
    expect(displayInfo.cycle).toBe('2/2');
  });

  it('should format remaining time correctly', () => {
    const now = new Date('2025-12-07T09:00:00Z').toISOString();
    const timer: Timer = {
      id: 'test-timer',
      name: 'Test Pomodoro',
      icon: '🍅',
      categoryId: 'work',
      mode: 'pomodoro',
      settings: {
        workDuration: 25,
        restDuration: 5,
        cycles: 1,
      },
      createdAt: now,
      updatedAt: now,
    };

    const engine = new PomodoroEngine(timer);
    engine.start();

    // Test various remaining times
    const testCases = [
      { seconds: 1500, expected: '00:25:00' }, // 25 minutes
      { seconds: 300, expected: '00:05:00' },  // 5 minutes
      { seconds: 61, expected: '00:01:01' },   // 1 minute 1 second
      { seconds: 0, expected: '00:00:00' },    // 0 seconds
    ];

    for (const { seconds, expected } of testCases) {
      const engineAny = engine as any;
      engineAny.remainingSeconds = seconds;

      const formattedTime = engine.getFormattedTime();
      expect(formattedTime).toBe(expected);
    }
  });

  it('should provide all required display components', () => {
    const now = new Date('2025-12-07T09:00:00Z').toISOString();
    const timer: Timer = {
      id: 'test-timer',
      name: 'Test Pomodoro',
      icon: '🍅',
      categoryId: 'work',
      mode: 'pomodoro',
      settings: {
        workDuration: 25,
        restDuration: 5,
        cycles: 4,
      },
      createdAt: now,
      updatedAt: now,
    };

    const engine = new PomodoroEngine(timer);
    engine.start();

    const displayInfo = engine.getDisplayInfo();

    // Verify all required components are present
    expect(displayInfo).toHaveProperty('period');
    expect(displayInfo).toHaveProperty('remaining');
    expect(displayInfo).toHaveProperty('cycle');

    // Verify types
    expect(typeof displayInfo.period).toBe('string');
    expect(typeof displayInfo.remaining).toBe('string');
    expect(typeof displayInfo.cycle).toBe('string');
  });
});
