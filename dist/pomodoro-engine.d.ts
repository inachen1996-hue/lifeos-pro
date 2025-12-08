/**
 * Pomodoro Timer Engine
 * Implements Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 *
 * State Machine: CONFIGURED → WORK_RUNNING → WORK_PAUSED → REST_RUNNING → REST_PAUSED → [NEXT_CYCLE or ALL_COMPLETE]
 */
import { Timer, Event } from './types.js';
/**
 * Pomodoro state
 */
export type PomodoroState = 'configured' | 'work_running' | 'work_paused' | 'rest_running' | 'rest_paused' | 'completed';
/**
 * Pomodoro period type
 */
export type PeriodType = 'work' | 'rest';
/**
 * Pomodoro Engine - Manages Pomodoro timer sessions
 */
export declare class PomodoroEngine {
    private timer;
    private session;
    private intervalId;
    private remainingSeconds;
    private state;
    private currentCycle;
    private currentPeriod;
    private workPeriods;
    private currentPeriodStart;
    private onUpdate;
    private onPeriodComplete;
    private onAllComplete;
    private dateProvider;
    constructor(timer: Timer, dateProvider?: () => Date);
    /**
     * Start the Pomodoro session
     * Requirement 5.1: Create Pomodoro state machine
     */
    start(): void;
    /**
     * Pause the current period
     */
    pause(): void;
    /**
     * Resume from pause
     */
    resume(): void;
    /**
     * Stop the Pomodoro session manually
     */
    stop(): {
        recorded: boolean;
        events: Event[];
        message: string;
    };
    /**
     * Get remaining time in seconds
     */
    getRemainingSeconds(): number;
    /**
     * Get formatted remaining time
     * Requirement 5.5: Display current period type, remaining time, and cycle progress
     */
    getFormattedTime(): string;
    /**
     * Get current state
     */
    getState(): PomodoroState;
    /**
     * Get current cycle
     */
    getCurrentCycle(): number;
    /**
     * Get total cycles
     */
    getTotalCycles(): number;
    /**
     * Get current period type
     */
    getCurrentPeriod(): PeriodType;
    /**
     * Get display info
     * Requirement 5.5: Display current period type, remaining time, and cycle progress
     */
    getDisplayInfo(): {
        period: PeriodType;
        remaining: string;
        cycle: string;
    };
    /**
     * Set update callback
     */
    setOnUpdate(callback: (remaining: number, state: PomodoroState, cycle: number, period: PeriodType) => void): void;
    /**
     * Set period complete callback
     * Requirement 5.2: Trigger alarms at end of each period
     */
    setOnPeriodComplete(callback: (period: PeriodType) => void): void;
    /**
     * Set all complete callback
     */
    setOnAllComplete(callback: () => void): void;
    /**
     * Start a work period
     * Requirement 5.1: Implement automatic transitions between work and rest periods
     */
    private startWorkPeriod;
    /**
     * Start a rest period
     * Requirement 5.1: Implement automatic transitions between work and rest periods
     */
    private startRestPeriod;
    /**
     * Start the interval timer
     */
    private startInterval;
    /**
     * Stop the interval timer
     */
    private stopInterval;
    /**
     * Handle period completion
     * Requirement 5.2: Trigger alarms at end of each period
     * Requirement 5.3: Implement automatic transitions between work and rest periods
     */
    private handlePeriodCompletion;
    /**
     * Handle all cycles completion
     * Requirement 5.4: Create event records for work periods on completion
     */
    private handleAllComplete;
    /**
     * Create event records for work periods
     * Requirement 5.4: Track work periods only (exclude rest periods)
     */
    private createWorkPeriodEvents;
    /**
     * Format seconds to HH:MM:SS
     */
    private formatTime;
    /**
     * Pad number with leading zero
     */
    private pad;
}
//# sourceMappingURL=pomodoro-engine.d.ts.map