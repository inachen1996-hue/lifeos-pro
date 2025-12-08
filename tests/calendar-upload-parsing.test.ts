/**
 * Property-Based Tests for Calendar Upload Parsing
 * Feature: lifeos-timer-rework, Property 3: Calendar upload parsing round trip
 * Validates: Requirements 8.2
 * 
 * Feature: lifeos-timer-rework, Property 21: Calendar upload validation
 * Validates: Requirements 8.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  parseCalendarUpload,
  formatCalendarUpload,
  isValidISO8601,
  findEventsWithMissingEndTimes,
  fillMissingEndTimes,
} from '../src/calendar-parser.js';

describe('Calendar Upload Parsing Round Trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Property 3: Calendar upload parsing round trip
   * For any valid calendar event string, parsing then formatting should produce
   * an equivalent string.
   */
  it('should preserve event data through parse and format cycle', () => {
    // Arbitrary for valid event name (non-empty after trim, no pipe characters)
    const eventNameArbitrary = fc
      .string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0 && !s.includes('｜') && !s.includes('|'))
      .map(s => s.trim()); // Normalize by trimming
    
    // Arbitrary for valid ISO 8601 timestamp
    const iso8601Arbitrary = fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map(date => date.toISOString());
    
    // Arbitrary for calendar event with both start and end times
    const calendarEventArbitrary = fc.tuple(
      eventNameArbitrary,
      iso8601Arbitrary,
      fc.integer({ min: 60000, max: 86400000 }) // Duration between 1 minute and 24 hours
    ).map(([name, startTime, duration]) => {
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + duration);
      return {
        name,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };
    });
    
    fc.assert(
      fc.property(fc.array(calendarEventArbitrary, { minLength: 1, maxLength: 20 }), (events) => {
        // Format events to calendar upload string
        const formatted = formatCalendarUpload(events);
        
        // Parse the formatted string
        const { events: parsed, errors } = parseCalendarUpload(formatted);
        
        // Should have no errors
        expect(errors).toEqual([]);
        
        // Should have same number of events
        expect(parsed.length).toBe(events.length);
        
        // Each event should match
        for (let i = 0; i < events.length; i++) {
          expect(parsed[i].name).toBe(events[i].name);
          expect(parsed[i].startTime).toBe(events[i].startTime);
          expect(parsed[i].endTime).toBe(events[i].endTime);
          expect(parsed[i].source).toBe('calendar');
          expect(parsed[i].priority).toBe(1);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Parsing with missing end times
   * Events without end times should be parsed successfully with endTime as undefined
   */
  it('should handle events with missing end times', () => {
    const eventNameArbitrary = fc
      .string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0 && !s.includes('｜') && !s.includes('|'))
      .map(s => s.trim());
    const iso8601Arbitrary = fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map(date => date.toISOString());
    
    fc.assert(
      fc.property(
        fc.array(fc.tuple(eventNameArbitrary, iso8601Arbitrary), { minLength: 1, maxLength: 10 }),
        (eventData) => {
          // Format events without end times
          const formatted = eventData.map(([name, startTime]) => `${name}｜${startTime}`).join('\n');
          
          // Parse
          const { events, errors } = parseCalendarUpload(formatted);
          
          // Should have no errors
          expect(errors).toEqual([]);
          
          // Should have same number of events
          expect(events.length).toBe(eventData.length);
          
          // Each event should have undefined endTime
          for (let i = 0; i < events.length; i++) {
            expect(events[i].name).toBe(eventData[i][0]);
            expect(events[i].startTime).toBe(eventData[i][1]);
            expect(events[i].endTime).toBeUndefined();
          }
          
          // findEventsWithMissingEndTimes should return all events
          const missingEndTimes = findEventsWithMissingEndTimes(events);
          expect(missingEndTimes.length).toBe(events.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filling missing end times
   * After filling missing end times, all events should have valid end times
   */
  it('should fill missing end times correctly', () => {
    const eventNameArbitrary = fc
      .string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0 && !s.includes('｜') && !s.includes('|'))
      .map(s => s.trim());
    const iso8601Arbitrary = fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map(date => date.toISOString());
    
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(eventNameArbitrary, iso8601Arbitrary, fc.integer({ min: 60000, max: 86400000 })),
          { minLength: 1, maxLength: 10 }
        ),
        (eventData) => {
          // Create events without end times
          const eventsWithoutEnd = eventData.map(([name, startTime]) => ({
            name,
            startTime,
            source: 'calendar' as const,
            priority: 1,
          }));
          
          // Create end times map
          const endTimesMap = new Map<number, string>();
          eventData.forEach(([, startTime, duration], index) => {
            const endTime = new Date(new Date(startTime).getTime() + duration).toISOString();
            endTimesMap.set(index, endTime);
          });
          
          // Fill missing end times
          const filled = fillMissingEndTimes(eventsWithoutEnd, endTimesMap);
          
          // All events should now have end times
          expect(filled.every(e => e.endTime !== undefined)).toBe(true);
          
          // End times should match what we provided
          filled.forEach((event, index) => {
            expect(event.endTime).toBe(endTimesMap.get(index));
            
            // End time should be after start time
            expect(new Date(event.endTime!).getTime()).toBeGreaterThan(
              new Date(event.startTime!).getTime()
            );
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Calendar Upload Validation', () => {
  /**
   * Property 21: Calendar upload validation
   * For any calendar upload input, the parser should validate ISO 8601 timestamp
   * format and report errors for invalid formats.
   */
  it('should validate ISO 8601 timestamp format', () => {
    // Valid ISO 8601 formats
    const validFormats = [
      '2025-12-07T10:00:00+08:00',
      '2025-12-07T10:00:00Z',
      '2025-12-07T10:00:00.000Z',
      '2025-12-07T10:00:00.123+08:00',
      '2020-01-01T00:00:00-05:00',
    ];
    
    validFormats.forEach(format => {
      expect(isValidISO8601(format)).toBe(true);
    });
  });

  it('should reject invalid ISO 8601 formats', () => {
    // Invalid formats
    const invalidFormats = [
      '2025-12-07',                    // Missing time
      '10:00:00',                      // Missing date
      '2025/12/07 10:00:00',          // Wrong separators
      '2025-12-07 10:00:00',          // Space instead of T
      '2025-13-01T10:00:00Z',         // Invalid month
      '2025-12-32T10:00:00Z',         // Invalid day
      '2025-12-07T25:00:00Z',         // Invalid hour
      '2025-12-07T10:60:00Z',         // Invalid minute
      '2025-12-07T10:00:60Z',         // Invalid second
      'not a date',                    // Completely invalid
      '',                              // Empty string
    ];
    
    invalidFormats.forEach(format => {
      expect(isValidISO8601(format)).toBe(false);
    });
  });

  it('should report errors for invalid input lines', () => {
    const invalidInput = `
Valid Event｜2025-12-07T10:00:00+08:00｜2025-12-07T11:00:00+08:00
Invalid Time｜not-a-date｜2025-12-07T11:00:00+08:00
Missing Name｜｜2025-12-07T10:00:00+08:00｜2025-12-07T11:00:00+08:00
Invalid Format
｜2025-12-07T10:00:00+08:00｜2025-12-07T11:00:00+08:00
End Before Start｜2025-12-07T11:00:00+08:00｜2025-12-07T10:00:00+08:00
    `.trim();
    
    const { events, errors } = parseCalendarUpload(invalidInput);
    
    // Should have 1 valid event
    expect(events.length).toBe(1);
    expect(events[0].name).toBe('Valid Event');
    
    // Should have errors for invalid lines
    expect(errors.length).toBeGreaterThan(0);
    
    // Check specific error messages
    expect(errors.some(e => e.includes('Invalid start time format'))).toBe(true);
    expect(errors.some(e => e.includes('Event name is required'))).toBe(true);
    expect(errors.some(e => e.includes('Invalid format'))).toBe(true);
    expect(errors.some(e => e.includes('End time must be after start time'))).toBe(true);
  });

  it('should handle empty input', () => {
    const { events, errors } = parseCalendarUpload('');
    
    expect(events).toEqual([]);
    expect(errors).toEqual([]);
  });

  it('should handle input with only whitespace', () => {
    const { events, errors } = parseCalendarUpload('   \n\n   \n   ');
    
    expect(events).toEqual([]);
    expect(errors).toEqual([]);
  });

  it('should support both full-width and half-width pipe separators', () => {
    const fullWidthInput = 'Event1｜2025-12-07T10:00:00+08:00｜2025-12-07T11:00:00+08:00';
    const halfWidthInput = 'Event2|2025-12-07T12:00:00+08:00|2025-12-07T13:00:00+08:00';
    
    const { events: events1, errors: errors1 } = parseCalendarUpload(fullWidthInput);
    const { events: events2, errors: errors2 } = parseCalendarUpload(halfWidthInput);
    
    expect(errors1).toEqual([]);
    expect(errors2).toEqual([]);
    expect(events1.length).toBe(1);
    expect(events2.length).toBe(1);
    expect(events1[0].name).toBe('Event1');
    expect(events2[0].name).toBe('Event2');
  });

  /**
   * Property: All parsed events have calendar source and priority 1
   */
  it('should assign calendar source and priority to all parsed events', () => {
    const eventNameArbitrary = fc
      .string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0 && !s.includes('｜') && !s.includes('|'))
      .map(s => s.trim());
    const iso8601Arbitrary = fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map(date => date.toISOString());
    
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(eventNameArbitrary, iso8601Arbitrary, fc.integer({ min: 60000, max: 86400000 })),
          { minLength: 1, maxLength: 20 }
        ),
        (eventData) => {
          const formatted = eventData
            .map(([name, startTime, duration]) => {
              const endTime = new Date(new Date(startTime).getTime() + duration).toISOString();
              return `${name}｜${startTime}｜${endTime}`;
            })
            .join('\n');
          
          const { events, errors } = parseCalendarUpload(formatted);
          
          expect(errors).toEqual([]);
          
          // All events should have calendar source and priority 1
          events.forEach(event => {
            expect(event.source).toBe('calendar');
            expect(event.priority).toBe(1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
