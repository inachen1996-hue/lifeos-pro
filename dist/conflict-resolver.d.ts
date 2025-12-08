/**
 * Conflict Resolution Engine
 * Implements Requirements 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 10.5
 *
 * Resolves overlapping events based on priority
 */
import { Event } from './types.js';
/**
 * Overlap type
 */
export type OverlapType = 'full' | 'partial';
/**
 * Overlap information
 */
export interface Overlap {
    higherPriorityEvent: Event;
    lowerPriorityEvent: Event;
    overlapType: OverlapType;
    overlapStart: string;
    overlapEnd: string;
}
/**
 * Conflict Resolver - Resolves event conflicts based on priority
 */
export declare class ConflictResolver {
    /**
     * Resolve conflicts for all events
     * Requirement 10.1: Priority-based resolution (manual > timer > calendar)
     * Requirement 10.4: Ensure no overlaps remain after resolution
     */
    static resolveConflicts(events: Event[]): Event[];
    /**
     * Detect overlap between two events
     * Requirement 9.2: Detect full overlap
     * Requirement 9.3: Detect partial overlap
     */
    static detectOverlap(event1: Event, event2: Event): Overlap | null;
    /**
     * Split an event around a conflicting time range
     * Requirement 10.3: Maintain event properties in fragments
     */
    static splitEvent(event: Event, cutStart: string, cutEnd: string): Event[];
    /**
     * Resolve conflicts and save to storage
     * Requirement 9.5: Trigger conflict resolution on priority changes
     */
    static resolveAndSave(): {
        removed: number;
        split: number;
    };
    /**
     * Check if an event is a split fragment
     */
    static isSplitEvent(event: Event): boolean;
    /**
     * Get original event ID from a split fragment
     */
    static getOriginalEventId(event: Event): string;
}
//# sourceMappingURL=conflict-resolver.d.ts.map