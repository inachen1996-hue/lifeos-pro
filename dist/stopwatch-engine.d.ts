/**
 * Stopwatch Timer Engine
 * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 *
 * State Machine: IDLE → RUNNING → PAUSED → RUNNING → STOPPED → [RECORD_CREATED or DISCARDED]
 */
import { Timer, Event } from './types.js';
/**
 * Stopwatch state
 */
export type StopwatchState = 'idle' | 'running' | 'paused' | 'stopped';
/**
 * Stopwatch Engine - Manages stopwatch timer sessions
 */
export declare class StopwatchEngine {
    private timer;
    private session;
    private intervalId;
    private elapsedSeconds;
    private state;
    private onUpdate;
    private dateProvider;
    constructor(timer: Timer, dateProvider?: () => Date);
    /**
     * Start the stopwatch
     * Requirement 3.1: Create stopwatch state machine (idle → running)
     */
    start(): void;
    /**
     * Pause the stopwatch
     * Requirement 3.1: State transition (running → paused)
     */
    pause(): void;
    /**
     * Resume the stopwatch
     * Requirement 3.1: State transition (paused → running)
     */
    resume(): void;
    /**
     * Stop the stopwatch and create event record if duration >= 1 minute
     * Requirement 3.2: 1-minute threshold logic (< 1 min discard, >= 1 min record)
     * Requirement 3.3: Create event record with timer name and category on stop
     */
    stop(): {
        recorded: boolean;
        event?: Event;
        message: string;
    };
    /**
     * Get current elapsed time in seconds
     */
    getElapsedSeconds(): number;
    /**
     * Get formatted elapsed time
     * Requirement 3.4: Display elapsed time in HH:MM:SS format
     */
    getFormattedTime(): string;
    /**
     * Get current state
     */
    getState(): StopwatchState;
    /**
     * Set update callback
     */
    setOnUpdate(callback: (elapsed: number, state: StopwatchState) => void): void;
    /**
     * Reset the stopwatch to idle state
     */
    reset(): void;
    /**
     * Start the interval timer
     */
    private startInterval;
    /**
     * Stop the interval timer
     */
    private stopInterval;
    /**
     * Format seconds to HH:MM:SS
     * Requirement 3.4: Display elapsed time in HH:MM:SS format
     */
    private formatTime;
    /**
     * Pad number with leading zero
     */
    private pad;
}
//# sourceMappingURL=stopwatch-engine.d.ts.map