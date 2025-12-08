/**
 * Blank Period Detector
 * Implements Requirements 6.1, 6.2
 *
 * Detects gaps in the daily schedule that meet threshold criteria
 */
import { Event, BlankPeriod } from './types.js';
/**
 * Blank Period Detector - Identifies gaps in daily schedule
 */
export declare class BlankPeriodDetector {
    /**
     * Detect blank periods for a specific date
     * Requirement 6.1: Check trigger conditions (total time > 5h AND gap >= 2h)
     * Requirement 6.2: Identify continuous blank periods in daily schedule
     */
    static detectBlankPeriods(events: Event[], date: string): BlankPeriod[];
    /**
     * Detect and save blank periods for a date
     */
    static detectAndSave(events: Event[], date: string): BlankPeriod[];
    /**
     * Get all pending blank periods
     */
    static getPendingBlankPeriods(): BlankPeriod[];
    /**
     * Mark a blank period as filled
     */
    static markAsFilled(blankId: string): void;
    /**
     * Dismiss a blank period
     */
    static dismiss(blankId: string): void;
}
//# sourceMappingURL=blank-period-detector.d.ts.map