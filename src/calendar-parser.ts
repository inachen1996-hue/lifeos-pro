/**
 * Calendar Upload Parser
 * Parses calendar event data in the format: "EventName｜ISO8601｜ISO8601"
 * Validates ISO 8601 timestamps and handles missing end times
 */

import { Event } from './types.js';

/**
 * Result of parsing calendar upload
 */
export interface ParseResult {
  events: Partial<Event>[];
  errors: string[];
}

/**
 * Parse calendar upload text
 * Expected format: "EventName｜2025-12-02T12:30:00+08:00｜2025-12-02T13:30:00+08:00"
 * Or: "EventName｜2025-12-02T12:30:00+08:00" (missing end time)
 * 
 * @param text - Raw calendar upload text (one event per line)
 * @returns ParseResult with parsed events and any errors
 */
export function parseCalendarUpload(text: string): ParseResult {
  const lines = text.split('\n').filter(line => line.trim());
  const events: Partial<Event>[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Split by either full-width or half-width pipe character
    const parts = line.split(/[｜|]/);
    
    if (parts.length < 2) {
      errors.push(`Line ${i + 1}: Invalid format - expected "EventName｜StartTime｜EndTime"`);
      continue;
    }
    
    const name = parts[0].trim();
    const startTime = parts[1].trim();
    const endTime = parts[2]?.trim();
    
    // Validate event name
    if (!name) {
      errors.push(`Line ${i + 1}: Event name is required`);
      continue;
    }
    
    // Validate start time ISO 8601 format
    if (!isValidISO8601(startTime)) {
      errors.push(`Line ${i + 1}: Invalid start time format - expected ISO 8601 (e.g., 2025-12-07T10:00:00+08:00)`);
      continue;
    }
    
    // Validate end time if provided
    if (endTime && !isValidISO8601(endTime)) {
      errors.push(`Line ${i + 1}: Invalid end time format - expected ISO 8601`);
      continue;
    }
    
    // Check if end time is after start time
    if (endTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      if (endDate <= startDate) {
        errors.push(`Line ${i + 1}: End time must be after start time`);
        continue;
      }
    }
    
    events.push({
      name,
      startTime,
      endTime: endTime || undefined, // undefined indicates missing end time
      source: 'calendar',
      priority: 1,
    });
  }
  
  return { events, errors };
}

/**
 * Validate ISO 8601 timestamp format
 * Accepts formats like:
 * - 2025-12-07T10:00:00+08:00
 * - 2025-12-07T10:00:00Z
 * - 2025-12-07T10:00:00.000Z
 * 
 * @param dateString - Date string to validate
 * @returns true if valid ISO 8601 format
 */
export function isValidISO8601(dateString: string): boolean {
  // ISO 8601 regex pattern
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
  
  if (!iso8601Regex.test(dateString)) {
    return false;
  }
  
  // Verify the date is actually valid (not something like 2025-13-45)
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Format parsed events back to calendar upload format
 * Used for round-trip testing
 * 
 * @param events - Array of parsed events
 * @returns Formatted calendar upload string
 */
export function formatCalendarUpload(events: Partial<Event>[]): string {
  return events
    .map(event => {
      const parts = [event.name, event.startTime];
      if (event.endTime) {
        parts.push(event.endTime);
      }
      return parts.join('｜');
    })
    .join('\n');
}

/**
 * Detect events with missing end times
 * 
 * @param events - Array of parsed events
 * @returns Array of events missing end times
 */
export function findEventsWithMissingEndTimes(events: Partial<Event>[]): Partial<Event>[] {
  return events.filter(event => !event.endTime);
}

/**
 * Add missing end times to events
 * Typically used after user provides end times via UI
 * 
 * @param events - Array of events
 * @param endTimes - Map of event index to end time
 * @returns Updated events with end times filled in
 */
export function fillMissingEndTimes(
  events: Partial<Event>[],
  endTimes: Map<number, string>
): Partial<Event>[] {
  return events.map((event, index) => {
    if (!event.endTime && endTimes.has(index)) {
      return { ...event, endTime: endTimes.get(index) };
    }
    return event;
  });
}
