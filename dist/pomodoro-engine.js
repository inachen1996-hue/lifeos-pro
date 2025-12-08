/**
 * Pomodoro Timer Engine
 * Implements Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 *
 * State Machine: CONFIGURED → WORK_RUNNING → WORK_PAUSED → REST_RUNNING → REST_PAUSED → [NEXT_CYCLE or ALL_COMPLETE]
 */
import { EventStorage } from './storage.js';
/**
 * Pomodoro Engine - Manages Pomodoro timer sessions
 */
export class PomodoroEngine {
    constructor(timer, dateProvider) {
        this.session = null;
        this.intervalId = null;
        this.remainingSeconds = 0;
        this.state = 'configured';
        this.currentCycle = 1;
        this.currentPeriod = 'work';
        this.workPeriods = [];
        this.currentPeriodStart = null;
        this.onUpdate = null;
        this.onPeriodComplete = null;
        this.onAllComplete = null;
        if (timer.mode !== 'pomodoro') {
            throw new Error('Timer must be in pomodoro mode');
        }
        if (!timer.settings.workDuration || timer.settings.workDuration <= 0) {
            throw new Error('Work duration must be greater than 0');
        }
        if (!timer.settings.restDuration || timer.settings.restDuration <= 0) {
            throw new Error('Rest duration must be greater than 0');
        }
        if (!timer.settings.cycles || timer.settings.cycles <= 0) {
            throw new Error('Number of cycles must be greater than 0');
        }
        this.timer = timer;
        this.dateProvider = dateProvider || (() => new Date());
    }
    /**
     * Start the Pomodoro session
     * Requirement 5.1: Create Pomodoro state machine
     */
    start() {
        if (this.state !== 'configured' && this.state !== 'work_paused' && this.state !== 'rest_paused') {
            throw new Error('Pomodoro can only be started from configured or paused state');
        }
        const now = this.dateProvider().toISOString();
        if (this.state === 'configured') {
            // First start - begin work period
            this.session = {
                timerId: this.timer.id,
                startTime: now,
                mode: 'pomodoro',
                status: 'running',
                currentCycle: 1,
                currentPeriod: 'work',
                workPeriods: [],
            };
            this.currentCycle = 1;
            this.currentPeriod = 'work';
            this.workPeriods = [];
            this.startWorkPeriod();
        }
        else if (this.state === 'work_paused') {
            // Resume work period
            this.state = 'work_running';
            if (this.session) {
                this.session.status = 'running';
            }
            this.startInterval();
        }
        else if (this.state === 'rest_paused') {
            // Resume rest period
            this.state = 'rest_running';
            if (this.session) {
                this.session.status = 'running';
            }
            this.startInterval();
        }
    }
    /**
     * Pause the current period
     */
    pause() {
        if (this.state !== 'work_running' && this.state !== 'rest_running') {
            throw new Error('Pomodoro can only be paused from running state');
        }
        if (this.state === 'work_running') {
            this.state = 'work_paused';
        }
        else {
            this.state = 'rest_paused';
        }
        if (this.session) {
            this.session.status = 'paused';
        }
        this.stopInterval();
    }
    /**
     * Resume from pause
     */
    resume() {
        this.start(); // Reuse start logic for resume
    }
    /**
     * Stop the Pomodoro session manually
     */
    stop() {
        this.stopInterval();
        // If we have completed work periods, create events for them
        if (this.workPeriods.length > 0) {
            const events = this.createWorkPeriodEvents();
            return {
                recorded: true,
                events,
                message: `Pomodoro stopped. ${events.length} work period(s) recorded.`,
            };
        }
        return {
            recorded: false,
            events: [],
            message: 'Pomodoro stopped. No work periods completed.',
        };
    }
    /**
     * Get remaining time in seconds
     */
    getRemainingSeconds() {
        return this.remainingSeconds;
    }
    /**
     * Get formatted remaining time
     * Requirement 5.5: Display current period type, remaining time, and cycle progress
     */
    getFormattedTime() {
        return this.formatTime(this.remainingSeconds);
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Get current cycle
     */
    getCurrentCycle() {
        return this.currentCycle;
    }
    /**
     * Get total cycles
     */
    getTotalCycles() {
        return this.timer.settings.cycles || 0;
    }
    /**
     * Get current period type
     */
    getCurrentPeriod() {
        return this.currentPeriod;
    }
    /**
     * Get display info
     * Requirement 5.5: Display current period type, remaining time, and cycle progress
     */
    getDisplayInfo() {
        return {
            period: this.currentPeriod,
            remaining: this.getFormattedTime(),
            cycle: `${this.currentCycle}/${this.getTotalCycles()}`,
        };
    }
    /**
     * Set update callback
     */
    setOnUpdate(callback) {
        this.onUpdate = callback;
    }
    /**
     * Set period complete callback
     * Requirement 5.2: Trigger alarms at end of each period
     */
    setOnPeriodComplete(callback) {
        this.onPeriodComplete = callback;
    }
    /**
     * Set all complete callback
     */
    setOnAllComplete(callback) {
        this.onAllComplete = callback;
    }
    /**
     * Start a work period
     * Requirement 5.1: Implement automatic transitions between work and rest periods
     */
    startWorkPeriod() {
        this.currentPeriod = 'work';
        this.state = 'work_running';
        this.remainingSeconds = (this.timer.settings.workDuration || 0) * 60;
        this.currentPeriodStart = this.dateProvider().toISOString();
        if (this.session) {
            this.session.currentPeriod = 'work';
            this.session.currentCycle = this.currentCycle;
        }
        this.startInterval();
    }
    /**
     * Start a rest period
     * Requirement 5.1: Implement automatic transitions between work and rest periods
     */
    startRestPeriod() {
        this.currentPeriod = 'rest';
        this.state = 'rest_running';
        this.remainingSeconds = (this.timer.settings.restDuration || 0) * 60;
        if (this.session) {
            this.session.currentPeriod = 'rest';
        }
        this.startInterval();
    }
    /**
     * Start the interval timer
     */
    startInterval() {
        if (this.intervalId !== null) {
            return; // Already running
        }
        this.intervalId = globalThis.setInterval(() => {
            this.remainingSeconds--;
            if (this.onUpdate) {
                this.onUpdate(this.remainingSeconds, this.state, this.currentCycle, this.currentPeriod);
            }
            // Check if period completed
            if (this.remainingSeconds <= 0) {
                this.handlePeriodCompletion();
            }
        }, 1000);
    }
    /**
     * Stop the interval timer
     */
    stopInterval() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    /**
     * Handle period completion
     * Requirement 5.2: Trigger alarms at end of each period
     * Requirement 5.3: Implement automatic transitions between work and rest periods
     */
    handlePeriodCompletion() {
        this.stopInterval();
        const now = this.dateProvider().toISOString();
        if (this.currentPeriod === 'work') {
            // Work period completed - record it
            if (this.currentPeriodStart) {
                this.workPeriods.push({
                    start: this.currentPeriodStart,
                    end: now,
                });
                this.currentPeriodStart = null;
            }
            // Trigger alarm for work period completion
            if (this.onPeriodComplete) {
                this.onPeriodComplete('work');
            }
            // Check if all cycles completed
            if (this.currentCycle >= (this.timer.settings.cycles || 0)) {
                // All cycles complete
                this.handleAllComplete();
            }
            else {
                // Start rest period
                this.startRestPeriod();
            }
        }
        else {
            // Rest period completed
            // Trigger alarm for rest period completion
            if (this.onPeriodComplete) {
                this.onPeriodComplete('rest');
            }
            // Move to next cycle
            this.currentCycle++;
            if (this.session) {
                this.session.currentCycle = this.currentCycle;
            }
            // Start next work period
            this.startWorkPeriod();
        }
    }
    /**
     * Handle all cycles completion
     * Requirement 5.4: Create event records for work periods on completion
     */
    handleAllComplete() {
        this.state = 'completed';
        if (this.session) {
            this.session.endTime = this.dateProvider().toISOString();
            this.session.status = 'completed';
            this.session.workPeriods = this.workPeriods;
        }
        // Create events for all work periods (rest periods excluded)
        const events = this.createWorkPeriodEvents();
        // Trigger completion callback
        if (this.onAllComplete) {
            this.onAllComplete();
        }
    }
    /**
     * Create event records for work periods
     * Requirement 5.4: Track work periods only (exclude rest periods)
     */
    createWorkPeriodEvents() {
        const events = [];
        const now = this.dateProvider().toISOString();
        for (const period of this.workPeriods) {
            const event = {
                id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: this.timer.name,
                startTime: period.start,
                endTime: period.end,
                categoryId: this.timer.categoryId,
                source: 'timer',
                priority: 2,
                timerId: this.timer.id,
                createdAt: now,
                updatedAt: now,
            };
            EventStorage.saveEvent(event);
            events.push(event);
        }
        return events;
    }
    /**
     * Format seconds to HH:MM:SS
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }
    /**
     * Pad number with leading zero
     */
    pad(num) {
        return num.toString().padStart(2, '0');
    }
}
//# sourceMappingURL=pomodoro-engine.js.map