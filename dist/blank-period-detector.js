/**
 * Blank Period Detector
 * Implements Requirements 6.1, 6.2
 *
 * Detects gaps in the daily schedule that meet threshold criteria
 */
import { BlankPeriodStorage } from './storage.js';
/**
 * Blank Period Detector - Identifies gaps in daily schedule
 */
export class BlankPeriodDetector {
    /**
     * Detect blank periods for a specific date
     * Requirement 6.1: Check trigger conditions (total time > 5h AND gap >= 2h)
     * Requirement 6.2: Identify continuous blank periods in daily schedule
     */
    static detectBlankPeriods(events, date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        // Filter events for the specified date
        const dayEvents = events
            .filter(e => {
            const start = new Date(e.startTime);
            return start >= dayStart && start <= dayEnd;
        })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        // Calculate total recorded time
        const totalRecordedHours = dayEvents.reduce((sum, e) => {
            const duration = (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / (1000 * 60 * 60);
            return sum + duration;
        }, 0);
        // Requirement 6.1: Only detect blanks if total recorded time > 5 hours
        if (totalRecordedHours <= 5) {
            return [];
        }
        const blanks = [];
        let lastEndTime = dayStart;
        for (const event of dayEvents) {
            const eventStart = new Date(event.startTime);
            const gapHours = (eventStart.getTime() - lastEndTime.getTime()) / (1000 * 60 * 60);
            // Requirement 6.1: Blank period must be >= 2 hours
            if (gapHours >= 2) {
                blanks.push({
                    id: `blank_${date}_${lastEndTime.getTime()}`,
                    date,
                    startTime: lastEndTime.toISOString(),
                    endTime: eventStart.toISOString(),
                    durationHours: gapHours,
                    status: 'pending',
                });
            }
            lastEndTime = new Date(event.endTime);
        }
        return blanks;
    }
    /**
     * Detect and save blank periods for a date
     */
    static detectAndSave(events, date) {
        const blanks = this.detectBlankPeriods(events, date);
        // Save detected blank periods
        for (const blank of blanks) {
            BlankPeriodStorage.saveBlankPeriod(blank);
        }
        return blanks;
    }
    /**
     * Get all pending blank periods
     */
    static getPendingBlankPeriods() {
        const allBlanks = BlankPeriodStorage.loadBlankPeriods();
        return allBlanks.filter(b => b.status === 'pending');
    }
    /**
     * Mark a blank period as filled
     */
    static markAsFilled(blankId) {
        const blanks = BlankPeriodStorage.loadBlankPeriods();
        const blank = blanks.find(b => b.id === blankId);
        if (blank) {
            blank.status = 'filled';
            BlankPeriodStorage.saveBlankPeriod(blank);
        }
    }
    /**
     * Dismiss a blank period
     */
    static dismiss(blankId) {
        const blanks = BlankPeriodStorage.loadBlankPeriods();
        const blank = blanks.find(b => b.id === blankId);
        if (blank) {
            blank.status = 'dismissed';
            BlankPeriodStorage.saveBlankPeriod(blank);
        }
    }
}
//# sourceMappingURL=blank-period-detector.js.map