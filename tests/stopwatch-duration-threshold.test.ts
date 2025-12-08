/**
 * Property Test: Stopwatch duration threshold
 * Feature: lifeos-timer-rework, Property 4: Stopwatch duration threshold
 * Validates: Requirements 3.2, 3.3
 * 
 * For any stopwatch session with duration >= 60 seconds, stopping the timer should create an event record;
 * for any session with duration < 60 seconds, no record should be created.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { StopwatchEngine } from '../src/stopwatch-engine.js';
import { Timer, TimerSession } from '../src/types.js';
import { EventStorage } from '../src/storage.js';

describe('Stopwatch Duration Threshold Property Test', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create event record for sessions >= 60 seconds and discard sessions < 60 seconds', () => {
    fc.assert(
      fc.property(
        // Generate timer configuration
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          icon: fc.string({ minLength: 1 }),
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'),
        }),
        // Generate duration in seconds (0 to 300 seconds = 5 minutes)
        fc.integer({ min: 0, max: 300 }),
        (timerConfig, durationSeconds) => {
          // Create a stopwatch timer
          const now = new Date('2025-12-07T09:00:00Z').toISOString();
          const timer: Timer = {
            ...timerConfig,
            mode: 'stopwatch',
            settings: {},
            createdAt: now,
            updatedAt: now,
          };

          // Mock Date provider to control time
          const startTime = new Date('2025-12-07T10:00:00Z');
          const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

          let callCount = 0;
          const dateProvider = () => {
            callCount++;
            // First call is for startTime, subsequent calls are for endTime
            return callCount === 1 ? startTime : endTime;
          };

          // Create stopwatch engine with date provider
          const engine = new StopwatchEngine(timer, dateProvider);

          // Start the stopwatch
          engine.start();

          // Stop the stopwatch
          const result = engine.stop();

          // Load events from storage
          const events = EventStorage.loadEvents();

          // Property: If duration >= 60 seconds, event should be recorded
          if (durationSeconds >= 60) {
            expect(result.recorded).toBe(true);
            expect(result.event).toBeDefined();
            expect(events.length).toBeGreaterThan(0);
            
            // Verify event properties
            const savedEvent = events.find(e => e.id === result.event?.id);
            expect(savedEvent).toBeDefined();
            expect(savedEvent?.name).toBe(timer.name);
            expect(savedEvent?.categoryId).toBe(timer.categoryId);
            expect(savedEvent?.source).toBe('timer');
            expect(savedEvent?.priority).toBe(2);
            expect(savedEvent?.timerId).toBe(timer.id);
          } else {
            // Property: If duration < 60 seconds, event should NOT be recorded
            expect(result.recorded).toBe(false);
            expect(result.event).toBeUndefined();
            expect(events.length).toBe(0);
          }

          // Clean up
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle boundary case: exactly 60 seconds', () => {
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

    // Mock Date provider to control time - exactly 60 seconds
    const startTime = new Date('2025-12-07T10:00:00Z');
    const endTime = new Date(startTime.getTime() + 60 * 1000);

    let callCount = 0;
    const dateProvider = () => {
      callCount++;
      return callCount === 1 ? startTime : endTime;
    };

    const engine = new StopwatchEngine(timer, dateProvider);

    engine.start();
    const result = engine.stop();

    // At exactly 60 seconds, should be recorded
    expect(result.recorded).toBe(true);
    expect(result.event).toBeDefined();

    const events = EventStorage.loadEvents();
    expect(events.length).toBe(1);
  });

  it('should handle boundary case: 59 seconds', () => {
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

    // Mock Date provider to control time - exactly 59 seconds
    const startTime = new Date('2025-12-07T10:00:00Z');
    const endTime = new Date(startTime.getTime() + 59 * 1000);

    let callCount = 0;
    const dateProvider = () => {
      callCount++;
      return callCount === 1 ? startTime : endTime;
    };

    const engine = new StopwatchEngine(timer, dateProvider);

    engine.start();
    const result = engine.stop();

    // At 59 seconds, should NOT be recorded
    expect(result.recorded).toBe(false);
    expect(result.event).toBeUndefined();

    const events = EventStorage.loadEvents();
    expect(events.length).toBe(0);
  });
});
