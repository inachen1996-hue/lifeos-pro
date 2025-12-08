/**
 * Conflict Resolution Engine
 * Implements Requirements 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 10.5
 *
 * Resolves overlapping events based on priority
 */
import { EventStorage } from './storage.js';
/**
 * Conflict Resolver - Resolves event conflicts based on priority
 */
export class ConflictResolver {
    /**
     * Resolve conflicts for all events
     * Requirement 10.1: Priority-based resolution (manual > timer > calendar)
     * Requirement 10.4: Ensure no overlaps remain after resolution
     */
    static resolveConflicts(events) {
        // Sort by priority (descending) then by start time
        const sorted = [...events].sort((a, b) => {
            if (a.priority !== b.priority)
                return b.priority - a.priority;
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
        const resolved = [];
        for (const event of sorted) {
            let fragments = [event];
            // Check against all higher priority events already resolved
            for (const resolvedEvent of resolved) {
                const newFragments = [];
                for (const fragment of fragments) {
                    const overlap = this.detectOverlap(fragment, resolvedEvent);
                    if (!overlap) {
                        // No overlap, keep the fragment
                        newFragments.push(fragment);
                    }
                    else if (overlap.overlapType === 'full') {
                        // Fragment is fully covered, discard it
                        console.log(`Event ${fragment.id} fully overlapped by ${resolvedEvent.id}, removing`);
                        // Don't add to newFragments (discard)
                    }
                    else {
                        // Partial overlap, split the fragment
                        const splits = this.splitEvent(fragment, resolvedEvent.startTime, resolvedEvent.endTime);
                        console.log(`Event ${fragment.id} partially overlapped, split into ${splits.length} fragments`);
                        newFragments.push(...splits);
                    }
                }
                fragments = newFragments;
            }
            // Add all remaining fragments to resolved list
            resolved.push(...fragments);
        }
        // Sort by start time for final output
        return resolved.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    /**
     * Detect overlap between two events
     * Requirement 9.2: Detect full overlap
     * Requirement 9.3: Detect partial overlap
     */
    static detectOverlap(event1, event2) {
        const start1 = new Date(event1.startTime).getTime();
        const end1 = new Date(event1.endTime).getTime();
        const start2 = new Date(event2.startTime).getTime();
        const end2 = new Date(event2.endTime).getTime();
        // No overlap
        if (end1 <= start2 || end2 <= start1) {
            return null;
        }
        // Determine which event has higher priority
        const higherPriorityEvent = event1.priority > event2.priority ? event1 : event2;
        const lowerPriorityEvent = event1.priority > event2.priority ? event2 : event1;
        // Full overlap: event1 is completely covered by event2
        if (start1 >= start2 && end1 <= end2) {
            return {
                higherPriorityEvent,
                lowerPriorityEvent,
                overlapType: 'full',
                overlapStart: event1.startTime,
                overlapEnd: event1.endTime,
            };
        }
        // Partial overlap
        const overlapStart = new Date(Math.max(start1, start2)).toISOString();
        const overlapEnd = new Date(Math.min(end1, end2)).toISOString();
        return {
            higherPriorityEvent,
            lowerPriorityEvent,
            overlapType: 'partial',
            overlapStart,
            overlapEnd,
        };
    }
    /**
     * Split an event around a conflicting time range
     * Requirement 10.3: Maintain event properties in fragments
     */
    static splitEvent(event, cutStart, cutEnd) {
        const eventStart = new Date(event.startTime).getTime();
        const eventEnd = new Date(event.endTime).getTime();
        const cutStartTime = new Date(cutStart).getTime();
        const cutEndTime = new Date(cutEnd).getTime();
        const fragments = [];
        // Before the cut
        if (eventStart < cutStartTime) {
            fragments.push({
                ...event,
                id: `${event.id}_before`,
                endTime: cutStart,
            });
        }
        // After the cut
        if (eventEnd > cutEndTime) {
            fragments.push({
                ...event,
                id: `${event.id}_after`,
                startTime: cutEnd,
            });
        }
        return fragments;
    }
    /**
     * Resolve conflicts and save to storage
     * Requirement 9.5: Trigger conflict resolution on priority changes
     */
    static resolveAndSave() {
        const events = EventStorage.loadEvents();
        const originalCount = events.length;
        const resolved = this.resolveConflicts(events);
        // Count removed and split events
        const removedCount = originalCount - resolved.length;
        const splitCount = resolved.filter(e => e.id.includes('_before') || e.id.includes('_after')).length;
        // Save resolved events
        EventStorage.saveEvents(resolved);
        return {
            removed: removedCount,
            split: splitCount,
        };
    }
    /**
     * Check if an event is a split fragment
     */
    static isSplitEvent(event) {
        return event.id.includes('_before') || event.id.includes('_after');
    }
    /**
     * Get original event ID from a split fragment
     */
    static getOriginalEventId(event) {
        if (this.isSplitEvent(event)) {
            return event.id.split('_before')[0].split('_after')[0];
        }
        return event.id;
    }
}
//# sourceMappingURL=conflict-resolver.js.map