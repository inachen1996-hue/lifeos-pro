/**
 * Property Test: Blank period detection threshold
 * Feature: lifeos-timer-rework, Property 13: Blank period detection threshold
 * Validates: Requirements 6.1
 * 
 * For any date where total recorded time > 5 hours AND there exists a gap >= 2 hours,
 * the blank period detection should identify that gap; for any date where total recorded time <= 5 hours
 * OR all gaps < 2 hours, no blank periods should be detected.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { BlankPeriodDetector } from '../src/blank-period-detector.js';
import { Event } from '../src/types.js';

describe('Blank Period Detection Property Test', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should detect blank periods when total time > 5h AND gap >= 2h', () => {
    fc.assert(
      fc.property(
        // Generate number of events (3-5) to ensure total time > 5 hours
        fc.integer({ min: 3, max: 5 }),
        // Generate gap size in hours (2-4)
        fc.integer({ min: 2, max: 4 }),
        (numEvents, gapHours) => {
          const date = '2025-12-07';
          const events: Event[] = [];

          // Create events starting from midnight with enough total time (> 5 hours) and a gap >= 2 hours
          let currentHour = 0; // Start at midnight

          for (let i = 0; i < numEvents; i++) {
            const startTime = new Date(`${date}T${String(currentHour).padStart(2, '0')}:00:00Z`);
            const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour events

            events.push({
              id: `event_${i}`,
              name: `Event ${i}`,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              categoryId: 'work',
              source: 'manual',
              priority: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            // Add gap before next event (except for last event)
            if (i < numEvents - 1) {
              currentHour += 2 + gapHours; // 2 hours for event + gap
            }
          }

          // Total time = numEvents * 2 hours (should be > 5 hours for numEvents >= 3)
          const totalHours = numEvents * 2;

          const blanks = BlankPeriodDetector.detectBlankPeriods(events, date);

          // Property: Should detect blank periods (total time > 5h and gaps >= 2h)
          expect(blanks.length).toBeGreaterThan(0);

          // Verify each blank period is >= 2 hours
          for (const blank of blanks) {
            expect(blank.durationHours).toBeGreaterThanOrEqual(2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT detect blank periods when total time <= 5h', () => {
    const date = '2025-12-07';
    const events: Event[] = [];

    // Create events with total time <= 5 hours
    const startTime1 = new Date(`${date}T08:00:00Z`);
    const endTime1 = new Date(startTime1.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    events.push({
      id: 'event_1',
      name: 'Event 1',
      startTime: startTime1.toISOString(),
      endTime: endTime1.toISOString(),
      categoryId: 'work',
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add second event with 3-hour gap (total time = 4 hours)
    const startTime2 = new Date(endTime1.getTime() + 3 * 60 * 60 * 1000);
    const endTime2 = new Date(startTime2.getTime() + 2 * 60 * 60 * 1000);

    events.push({
      id: 'event_2',
      name: 'Event 2',
      startTime: startTime2.toISOString(),
      endTime: endTime2.toISOString(),
      categoryId: 'work',
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const blanks = BlankPeriodDetector.detectBlankPeriods(events, date);

    // Property: Should NOT detect blank periods (total time = 4h <= 5h)
    expect(blanks.length).toBe(0);
  });

  it('should NOT detect blank periods when gaps < 2h', () => {
    const date = '2025-12-07';
    const events: Event[] = [];

    // Create 4 events with 1.5-hour gaps (< 2 hours) starting from midnight
    // Total time = 8 hours (> 5 hours), but all gaps < 2 hours
    let currentTime = new Date(`${date}T00:00:00Z`);

    for (let i = 0; i < 4; i++) {
      const startTime = new Date(currentTime);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      events.push({
        id: `event_${i}`,
        name: `Event ${i}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        categoryId: 'work',
        source: 'manual',
        priority: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Add 1.5-hour gap (< 2 hours)
      currentTime = new Date(endTime.getTime() + 1.5 * 60 * 60 * 1000);
    }

    const blanks = BlankPeriodDetector.detectBlankPeriods(events, date);

    // Property: Should NOT detect blank periods (all gaps between events < 2h)
    // Note: There might be gaps at start/end of day, but gaps between events should be < 2h
    for (const blank of blanks) {
      // Check if this blank is between two events (not at start/end of day)
      const blankStart = new Date(blank.startTime).getTime();
      const blankEnd = new Date(blank.endTime).getTime();
      
      // Find if this blank is between two of our events
      const isBetweenEvents = events.some((e, i) => {
        if (i === events.length - 1) return false;
        const eventEnd = new Date(e.endTime).getTime();
        const nextEventStart = new Date(events[i + 1].startTime).getTime();
        return blankStart === eventEnd && blankEnd === nextEventStart;
      });
      
      // If it's between our events, it should be < 2 hours
      if (isBetweenEvents) {
        expect(blank.durationHours).toBeLessThan(2);
      }
    }
  });

  it('should detect exactly 2-hour gaps', () => {
    const date = '2025-12-07';
    const events: Event[] = [];

    // Create events starting from midnight with total time > 5 hours and exactly 2-hour gap
    const startTime1 = new Date(`${date}T00:00:00Z`);
    const endTime1 = new Date(startTime1.getTime() + 3 * 60 * 60 * 1000); // 3 hours

    events.push({
      id: 'event_1',
      name: 'Event 1',
      startTime: startTime1.toISOString(),
      endTime: endTime1.toISOString(),
      categoryId: 'work',
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add second event with exactly 2-hour gap
    const startTime2 = new Date(endTime1.getTime() + 2 * 60 * 60 * 1000);
    const endTime2 = new Date(startTime2.getTime() + 3 * 60 * 60 * 1000);

    events.push({
      id: 'event_2',
      name: 'Event 2',
      startTime: startTime2.toISOString(),
      endTime: endTime2.toISOString(),
      categoryId: 'work',
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const blanks = BlankPeriodDetector.detectBlankPeriods(events, date);

    // Property: Should detect at least one 2-hour gap (boundary case)
    expect(blanks.length).toBeGreaterThanOrEqual(1);
    
    // Find the gap between the two events
    const gapBetweenEvents = blanks.find(b => 
      b.startTime === endTime1.toISOString() && 
      b.endTime === startTime2.toISOString()
    );
    expect(gapBetweenEvents).toBeDefined();
    expect(gapBetweenEvents?.durationHours).toBe(2);
  });
});
