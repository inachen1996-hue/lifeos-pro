/**
 * Countdown Timer Engine
 * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * State Machine: CONFIGURED → RUNNING → PAUSED → RUNNING → COMPLETED → RECORD_CREATED
 */
import { EventStorage } from './storage.js';
/**
 * Countdown Engine - Manages countdown timer sessions
 */
export class CountdownEngine {
    constructor(timer, dateProvider) {
        this.session = null;
        this.intervalId = null;
        this.remainingSeconds = 0;
        this.totalSeconds = 0;
        this.state = 'configured';
        this.onUpdate = null;
        this.onComplete = null;
        if (timer.mode !== 'countdown') {
            throw new Error('Timer must be in countdown mode');
        }
        if (!timer.settings.countdownDuration || timer.settings.countdownDuration <= 0) {
            throw new Error('Countdown duration must be greater than 0');
        }
        this.timer = timer;
        this.totalSeconds = timer.settings.countdownDuration * 60; // Convert minutes to seconds
        this.remainingSeconds = this.totalSeconds;
        this.dateProvider = dateProvider || (() => new Date());
    }
    /**
     * Start the countdown
     * Requirement 4.1: Create countdown state machine (configured → running)
     */
    start() {
        if (this.state !== 'configured' && this.state !== 'paused') {
            throw new Error('Countdown can only be started from configured or paused state');
        }
        const now = this.dateProvider().toISOString();
        if (this.state === 'configured') {
            // First start
            this.session = {
                timerId: this.timer.id,
                startTime: now,
                mode: 'countdown',
                status: 'running',
            };
        }
        else {
            // Resume from pause
            if (this.session) {
                this.session.status = 'running';
            }
        }
        this.state = 'running';
        this.startInterval();
    }
    /**
     * Pause the countdown
     * Requirement 4.1: State transition (running → paused)
     */
    pause() {
        if (this.state !== 'running') {
            throw new Error('Countdown can only be paused from running state');
        }
        this.state = 'paused';
        if (this.session) {
            this.session.status = 'paused';
        }
        this.stopInterval();
    }
    /**
     * Resume the countdown
     * Requirement 4.1: State transition (paused → running)
     */
    resume() {
        this.start(); // Reuse start logic for resume
    }
    /**
     * Stop the countdown manually (before completion)
     */
    stop() {
        if (this.state !== 'running' && this.state !== 'paused') {
            throw new Error('Countdown can only be stopped from running or paused state');
        }
        this.stopInterval();
        const now = this.dateProvider().toISOString();
        if (!this.session) {
            throw new Error('No active session');
        }
        this.session.endTime = now;
        this.session.status = 'cancelled';
        this.state = 'completed';
        // When manually stopped, create event for elapsed time
        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: this.timer.name,
            startTime: this.session.startTime,
            endTime: now,
            categoryId: this.timer.categoryId,
            source: 'timer',
            priority: 2,
            timerId: this.timer.id,
            createdAt: now,
            updatedAt: now,
        };
        EventStorage.saveEvent(event);
        return {
            recorded: true,
            event,
            message: 'Countdown stopped, partial session recorded',
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
     * Requirement 4.2: Display remaining time in HH:MM:SS format
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
     * Set update callback
     */
    setOnUpdate(callback) {
        this.onUpdate = callback;
    }
    /**
     * Set completion callback
     * Requirement 4.3: Trigger alarm when countdown reaches zero
     */
    setOnComplete(callback) {
        this.onComplete = callback;
    }
    /**
     * Reset the countdown to configured state
     */
    reset() {
        this.stopInterval();
        this.session = null;
        this.remainingSeconds = this.totalSeconds;
        this.state = 'configured';
        if (this.onUpdate) {
            this.onUpdate(this.remainingSeconds, this.state);
        }
    }
    /**
     * Start the interval timer
     * Requirement 4.2: Implement countdown logic with 1-second intervals
     */
    startInterval() {
        if (this.intervalId !== null) {
            return; // Already running
        }
        this.intervalId = globalThis.setInterval(() => {
            this.remainingSeconds--;
            if (this.onUpdate) {
                this.onUpdate(this.remainingSeconds, this.state);
            }
            // Check if countdown completed
            if (this.remainingSeconds <= 0) {
                this.handleCompletion();
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
     * Handle countdown completion
     * Requirement 4.3: Trigger alarm when countdown reaches zero
     * Requirement 4.4: Create event record for full duration on completion
     */
    handleCompletion() {
        this.stopInterval();
        const now = this.dateProvider().toISOString();
        if (!this.session) {
            throw new Error('No active session');
        }
        this.session.endTime = now;
        this.session.status = 'completed';
        this.state = 'completed';
        // Requirement 4.4: Create event record for FULL configured duration
        const event = {
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: this.timer.name,
            startTime: this.session.startTime,
            endTime: now,
            categoryId: this.timer.categoryId,
            source: 'timer',
            priority: 2,
            timerId: this.timer.id,
            createdAt: now,
            updatedAt: now,
        };
        EventStorage.saveEvent(event);
        // Requirement 4.3: Trigger alarm/callback
        if (this.onComplete) {
            this.onComplete();
        }
    }
    /**
     * Format seconds to HH:MM:SS
     * Requirement 4.2: Display remaining time in HH:MM:SS format
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
//# sourceMappingURL=countdown-engine.js.map