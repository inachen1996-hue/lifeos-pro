/**
 * Stopwatch Timer Engine
 * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 *
 * State Machine: IDLE → RUNNING → PAUSED → RUNNING → STOPPED → [RECORD_CREATED or DISCARDED]
 */
import { EventStorage } from './storage.js';
/**
 * Stopwatch Engine - Manages stopwatch timer sessions
 */
export class StopwatchEngine {
    constructor(timer, dateProvider) {
        this.session = null;
        this.intervalId = null;
        this.elapsedSeconds = 0;
        this.state = 'idle';
        this.onUpdate = null;
        if (timer.mode !== 'stopwatch') {
            throw new Error('Timer must be in stopwatch mode');
        }
        this.timer = timer;
        this.dateProvider = dateProvider || (() => new Date());
    }
    /**
     * Start the stopwatch
     * Requirement 3.1: Create stopwatch state machine (idle → running)
     */
    start() {
        if (this.state !== 'idle') {
            throw new Error('Stopwatch can only be started from idle state');
        }
        const now = this.dateProvider().toISOString();
        this.session = {
            timerId: this.timer.id,
            startTime: now,
            mode: 'stopwatch',
            status: 'running',
        };
        this.state = 'running';
        this.elapsedSeconds = 0;
        this.startInterval();
    }
    /**
     * Pause the stopwatch
     * Requirement 3.1: State transition (running → paused)
     */
    pause() {
        if (this.state !== 'running') {
            throw new Error('Stopwatch can only be paused from running state');
        }
        this.state = 'paused';
        if (this.session) {
            this.session.status = 'paused';
        }
        this.stopInterval();
    }
    /**
     * Resume the stopwatch
     * Requirement 3.1: State transition (paused → running)
     */
    resume() {
        if (this.state !== 'paused') {
            throw new Error('Stopwatch can only be resumed from paused state');
        }
        this.state = 'running';
        if (this.session) {
            this.session.status = 'running';
        }
        this.startInterval();
    }
    /**
     * Stop the stopwatch and create event record if duration >= 1 minute
     * Requirement 3.2: 1-minute threshold logic (< 1 min discard, >= 1 min record)
     * Requirement 3.3: Create event record with timer name and category on stop
     */
    stop() {
        if (this.state !== 'running' && this.state !== 'paused') {
            throw new Error('Stopwatch can only be stopped from running or paused state');
        }
        this.stopInterval();
        const now = this.dateProvider().toISOString();
        if (!this.session) {
            throw new Error('No active session');
        }
        this.session.endTime = now;
        this.session.status = 'completed';
        this.state = 'stopped';
        // Calculate duration in seconds
        const startTime = new Date(this.session.startTime).getTime();
        const endTime = new Date(now).getTime();
        const durationSeconds = (endTime - startTime) / 1000;
        // Requirement 3.2: Check 1-minute threshold
        if (durationSeconds < 60) {
            // Discard session
            return {
                recorded: false,
                message: 'Session too short, not recorded',
            };
        }
        // Requirement 3.3: Create event record
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
            message: 'Session recorded',
        };
    }
    /**
     * Get current elapsed time in seconds
     */
    getElapsedSeconds() {
        return this.elapsedSeconds;
    }
    /**
     * Get formatted elapsed time
     * Requirement 3.4: Display elapsed time in HH:MM:SS format
     */
    getFormattedTime() {
        return this.formatTime(this.elapsedSeconds);
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
     * Reset the stopwatch to idle state
     */
    reset() {
        this.stopInterval();
        this.session = null;
        this.elapsedSeconds = 0;
        this.state = 'idle';
        if (this.onUpdate) {
            this.onUpdate(this.elapsedSeconds, this.state);
        }
    }
    /**
     * Start the interval timer
     */
    startInterval() {
        if (this.intervalId !== null) {
            return; // Already running
        }
        this.intervalId = globalThis.setInterval(() => {
            this.elapsedSeconds++;
            if (this.onUpdate) {
                this.onUpdate(this.elapsedSeconds, this.state);
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
     * Format seconds to HH:MM:SS
     * Requirement 3.4: Display elapsed time in HH:MM:SS format
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
//# sourceMappingURL=stopwatch-engine.js.map