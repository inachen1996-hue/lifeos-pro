/**
 * Property-Based Tests for Timer Serialization
 * Feature: lifeos-timer-rework, Property 1: Timer serialization round trip
 * Validates: Requirements 14.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Timer, TimerSettings } from '../src/types.js';
import { TimerStorage } from '../src/storage.js';

/**
 * Arbitrary generator for TimerSettings
 */
const timerSettingsArbitrary = fc.record({
  countdownDuration: fc.option(fc.integer({ min: 1, max: 180 }), { nil: undefined }),
  workDuration: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
  restDuration: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
  cycles: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
});

/**
 * Arbitrary generator for Timer mode
 */
const timerModeArbitrary = fc.constantFrom('stopwatch', 'countdown', 'pomodoro') as fc.Arbitrary<'stopwatch' | 'countdown' | 'pomodoro'>;

/**
 * Arbitrary generator for Timer
 * Generates valid timer configurations with appropriate settings for each mode
 */
const timerArbitrary: fc.Arbitrary<Timer> = fc
  .tuple(
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.string({ minLength: 1, maxLength: 20 }),
    timerModeArbitrary,
    fc.date(),
    fc.date()
  )
  .chain(([id, name, icon, categoryId, mode, createdAt, updatedAt]) => {
    // Generate appropriate settings based on mode
    let settingsArb: fc.Arbitrary<TimerSettings>;
    
    if (mode === 'stopwatch') {
      // Stopwatch doesn't need settings
      settingsArb = fc.constant({});
    } else if (mode === 'countdown') {
      // Countdown needs countdownDuration
      settingsArb = fc.record({
        countdownDuration: fc.integer({ min: 1, max: 180 }),
      });
    } else {
      // Pomodoro needs workDuration, restDuration, and cycles
      settingsArb = fc.record({
        workDuration: fc.integer({ min: 1, max: 60 }),
        restDuration: fc.integer({ min: 1, max: 30 }),
        cycles: fc.integer({ min: 1, max: 10 }),
      });
    }
    
    return settingsArb.map(settings => ({
      id,
      name,
      icon,
      categoryId,
      mode,
      settings,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    }));
  });

describe('Timer Serialization Round Trip', () => {
  /**
   * Property 1: Timer serialization round trip
   * For any valid timer configuration, serializing then deserializing should produce
   * an equivalent timer configuration with all fields preserved.
   */
  it('should preserve all timer fields after serialization and deserialization', () => {
    fc.assert(
      fc.property(timerArbitrary, (timer) => {
        // Save the timer
        TimerStorage.saveTimer(timer);
        
        // Load all timers
        const loadedTimers = TimerStorage.loadTimers();
        
        // Find the timer we just saved
        const loadedTimer = loadedTimers.find(t => t.id === timer.id);
        
        // Assert the timer was found
        expect(loadedTimer).toBeDefined();
        
        // Assert all fields are preserved
        expect(loadedTimer).toEqual(timer);
        expect(loadedTimer!.id).toBe(timer.id);
        expect(loadedTimer!.name).toBe(timer.name);
        expect(loadedTimer!.icon).toBe(timer.icon);
        expect(loadedTimer!.categoryId).toBe(timer.categoryId);
        expect(loadedTimer!.mode).toBe(timer.mode);
        expect(loadedTimer!.createdAt).toBe(timer.createdAt);
        expect(loadedTimer!.updatedAt).toBe(timer.updatedAt);
        
        // Assert settings are preserved
        expect(loadedTimer!.settings).toEqual(timer.settings);
        
        // For countdown mode, verify countdownDuration
        if (timer.mode === 'countdown') {
          expect(loadedTimer!.settings.countdownDuration).toBe(timer.settings.countdownDuration);
        }
        
        // For pomodoro mode, verify all pomodoro settings
        if (timer.mode === 'pomodoro') {
          expect(loadedTimer!.settings.workDuration).toBe(timer.settings.workDuration);
          expect(loadedTimer!.settings.restDuration).toBe(timer.settings.restDuration);
          expect(loadedTimer!.settings.cycles).toBe(timer.settings.cycles);
        }
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });

  /**
   * Additional test: Multiple timers serialization
   * Ensures that saving multiple timers preserves all of them correctly
   */
  it('should preserve multiple timers after serialization', () => {
    fc.assert(
      fc.property(fc.array(timerArbitrary, { minLength: 1, maxLength: 10 }), (timers) => {
        // Save all timers
        TimerStorage.saveTimers(timers);
        
        // Load all timers
        const loadedTimers = TimerStorage.loadTimers();
        
        // Assert same number of timers
        expect(loadedTimers.length).toBe(timers.length);
        
        // Assert each timer is preserved
        for (const timer of timers) {
          const loadedTimer = loadedTimers.find(t => t.id === timer.id);
          expect(loadedTimer).toEqual(timer);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty settings object
   */
  it('should handle timers with empty settings', () => {
    const timer: Timer = {
      id: 'test-1',
      name: 'Test Timer',
      icon: 'Clock',
      categoryId: 'work',
      mode: 'stopwatch',
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    TimerStorage.saveTimer(timer);
    const loaded = TimerStorage.loadTimers().find(t => t.id === timer.id);
    
    expect(loaded).toEqual(timer);
  });
});
