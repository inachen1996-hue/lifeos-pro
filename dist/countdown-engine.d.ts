/**
 * Countdown Timer Engine
 * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * State Machine: CONFIGURED → RUNNING → PAUSED → RUNNING → COMPLETED → RECORD_CREATED
 */
import { Timer, Event } from './types.js';
/**
 * Countdown state
 */
export type CountdownState = 'configured' | 'running' | 'paused' | 'completed';
/**
 * Countdown Engine - Manages countdown timer sessions
 */
export declare class CountdownEngine {
    private timer;
    private session;
    private intervalId;
    private remainingSeconds;
    private totalSeconds;
    private state;
    private onUpdate;
    private onComplete;
    private dateProvider;
    constructor(timer: Timer, dateProvider?: () => Date);
    /**
     * Start the countdown
     * Requirement 4.1: Create countdown state machine (configured → running)
     */
    start(): void;
    /**
     * Pause the countdown
     * Requirement 4.1: State transition (running → paused)
     */
    pause(): void;
    /**
     * Resume the countdown
     * Requirement 4.1: State transition (paused → running)
     */
    resume(): void;
    /**
     * Stop the countdown manually (before completion)
     */
    stop(): {
        recorded: boolean;
        event?: Event;
        message: string;
    };
    /**
     * Get remaining time in seconds
     */
    getRemainingSeconds(): number;
    /**
     * Get formatted remaining time
     * Requirement 4.2: Display remaining time in HH:MM:SS format
     */
    getFormattedTime(): string;
    /**
     * Get current state
     */
    getState(): CountdownState;
    /**
     * Set update callback
     */
    setOnUpdate(callback: (remaining: number, state: CountdownState) => void): void;
    /**
     * Set completion callback
     * Requirement 4.3: Trigger alarm when countdown reaches zero
     */
    setOnComplete(callback: () => void): void;
    /**
     * Reset the countdown to configured state
     */
    reset(): void;
    /**
     * Start the interval timer
     * Requirement 4.2: Implement countdown logic with 1-second intervals
     */
    private startInterval;
    /**
     * Stop the interval timer
     */
    private stopInterval;
    /**
     * Handle countdown completion
     * Requirement 4.3: Trigger alarm when countdown reaches zero
     * Requirement 4.4: Create event record for full duration on completion
     */
    private handleCompletion;
    /**
     * Format seconds to HH:MM:SS
     * Requirement 4.2: Display remaining time in HH:MM:SS format
     */
    private formatTime;
    /**
     * Pad number with leading zero
     */
    private pad;
}
//# sourceMappingURL=countdown-engine.d.ts.map