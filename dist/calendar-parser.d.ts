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
export declare function parseCalendarUpload(text: string): ParseResult;
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
export declare function isValidISO8601(dateString: string): boolean;
/**
 * Format parsed events back to calendar upload format
 * Used for round-trip testing
 *
 * @param events - Array of parsed events
 * @returns Formatted calendar upload string
 */
export declare function formatCalendarUpload(events: Partial<Event>[]): string;
/**
 * Detect events with missing end times
 *
 * @param events - Array of parsed events
 * @returns Array of events missing end times
 */
export declare function findEventsWithMissingEndTimes(events: Partial<Event>[]): Partial<Event>[];
/**
 * Add missing end times to events
 * Typically used after user provides end times via UI
 *
 * @param events - Array of events
 * @param endTimes - Map of event index to end time
 * @returns Updated events with end times filled in
 */
export declare function fillMissingEndTimes(events: Partial<Event>[], endTimes: Map<number, string>): Partial<Event>[];
//# sourceMappingURL=calendar-parser.d.ts.map