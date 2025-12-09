/**
 * Pomodoro Timer Engine
 * Implements Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * State Machine: CONFIGURED → WORK_RUNNING → WORK_PAUSED → REST_RUNNING → REST_PAUSED → [NEXT_CYCLE or ALL_COMPLETE]
 */

import { Timer, TimerSession, Event } from './types.js';
import { EventStorage } from './storage.js';

/**
 * Pomodoro state
 */
export type PomodoroState = 'configured' | 'work_running' | 'work_paused' | 'work_complete' | 'rest_running' | 'rest_paused' | 'rest_complete' | 'completed';

/**
 * Pomodoro period type
 */
export type PeriodType = 'work' | 'rest';

/**
 * Pomodoro Engine - Manages Pomodoro timer sessions
 */
export class PomodoroEngine {
  private timer: Timer;
  private session: TimerSession | null = null;
  private intervalId: number | null = null;
  private remainingSeconds: number = 0;
  private state: PomodoroState = 'configured';
  private currentCycle: number = 1;
  private currentPeriod: PeriodType = 'work';
  private workPeriods: Array<{ start: string; end: string }> = [];
  private currentPeriodStart: string | null = null;
  private onUpdate: ((remaining: number, state: PomodoroState, cycle: number, period: PeriodType) => void) | null = null;
  private onPeriodComplete: ((period: PeriodType) => void) | null = null;
  private onAllComplete: (() => void) | null = null;
  private dateProvider: () => Date;
  private extendedSeconds: number = 0; // 延长的秒数

  constructor(timer: Timer, dateProvider?: () => Date) {
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
  start(): void {
    if (this.state !== 'configured' && this.state !== 'work_paused' && this.state !== 'rest_paused' && this.state !== 'work_complete' && this.state !== 'rest_complete') {
      throw new Error('Pomodoro can only be started from configured, paused, or complete state');
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
    } else if (this.state === 'work_paused') {
      // Resume work period
      this.state = 'work_running';
      if (this.session) {
        this.session.status = 'running';
      }
      this.startInterval();
    } else if (this.state === 'rest_paused') {
      // Resume rest period
      this.state = 'rest_running';
      if (this.session) {
        this.session.status = 'running';
      }
      this.startInterval();
    } else if (this.state === 'work_complete') {
      // Confirm to start rest
      this.confirmStartRest();
    } else if (this.state === 'rest_complete') {
      // Confirm to start next work
      this.confirmStartWork();
    }
  }

  /**
   * Pause the current period
   */
  pause(): void {
    if (this.state !== 'work_running' && this.state !== 'rest_running') {
      throw new Error('Pomodoro can only be paused from running state');
    }

    if (this.state === 'work_running') {
      this.state = 'work_paused';
    } else {
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
  resume(): void {
    this.start(); // Reuse start logic for resume
  }

  /**
   * Stop the Pomodoro session manually
   */
  stop(): { recorded: boolean; events: Event[]; message: string } {
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
  getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  /**
   * Get formatted remaining time
   * Requirement 5.5: Display current period type, remaining time, and cycle progress
   */
  getFormattedTime(): string {
    return this.formatTime(this.remainingSeconds);
  }

  /**
   * Get current state
   */
  getState(): PomodoroState {
    return this.state;
  }

  /**
   * Get current cycle
   */
  getCurrentCycle(): number {
    return this.currentCycle;
  }

  /**
   * Get total cycles
   */
  getTotalCycles(): number {
    return this.timer.settings.cycles || 0;
  }

  /**
   * Get current period type
   */
  getCurrentPeriod(): PeriodType {
    return this.currentPeriod;
  }

  /**
   * Get display info
   * Requirement 5.5: Display current period type, remaining time, and cycle progress
   */
  getDisplayInfo(): { period: PeriodType; remaining: string; cycle: string } {
    return {
      period: this.currentPeriod,
      remaining: this.getFormattedTime(),
      cycle: `${this.currentCycle}/${this.getTotalCycles()}`,
    };
  }

  /**
   * Set update callback
   */
  setOnUpdate(callback: (remaining: number, state: PomodoroState, cycle: number, period: PeriodType) => void): void {
    this.onUpdate = callback;
  }

  /**
   * Set period complete callback
   * Requirement 5.2: Trigger alarms at end of each period
   */
  setOnPeriodComplete(callback: (period: PeriodType) => void): void {
    this.onPeriodComplete = callback;
  }

  /**
   * Set all complete callback
   */
  setOnAllComplete(callback: () => void): void {
    this.onAllComplete = callback;
  }

  /**
   * Start a work period
   * Requirement 5.1: Implement automatic transitions between work and rest periods
   */
  private startWorkPeriod(): void {
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
  private startRestPeriod(): void {
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
  private startInterval(): void {
    if (this.intervalId !== null) {
      return; // Already running
    }

    this.intervalId = globalThis.setInterval(() => {
      // 如果剩余时间为0或负数，说明在延长时间（正计时）
      if (this.remainingSeconds <= 0) {
        this.extendedSeconds++;
        this.remainingSeconds = -this.extendedSeconds; // 负数表示延长时间
      } else {
        this.remainingSeconds--;
      }

      if (this.onUpdate) {
        this.onUpdate(this.remainingSeconds, this.state, this.currentCycle, this.currentPeriod);
      }

      // Check if period completed (only for countdown, not for extended time)
      if (this.remainingSeconds === 0 && this.extendedSeconds === 0) {
        this.handlePeriodCompletion();
      }
    }, 1000) as unknown as number;
  }

  /**
   * Stop the interval timer
   */
  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Confirm to start rest period (manual transition)
   */
  confirmStartRest(): void {
    if (this.state !== 'work_complete') {
      throw new Error('Can only start rest from work_complete state');
    }
    
    // 如果有延长时间，记录到工作周期
    if (this.extendedSeconds > 0 && this.currentPeriodStart) {
      const now = this.dateProvider().toISOString();
      // 更新最后一个工作周期的结束时间（包含延长时间）
      if (this.workPeriods.length > 0) {
        this.workPeriods[this.workPeriods.length - 1].end = now;
      }
      this.extendedSeconds = 0;
    }
    
    this.startRestPeriod();
  }

  /**
   * Confirm to start next work period (manual transition)
   */
  confirmStartWork(): void {
    if (this.state !== 'rest_complete') {
      throw new Error('Can only start work from rest_complete state');
    }
    
    // 休息延长时间不记录（只记录工作时间）
    this.extendedSeconds = 0;
    
    // Move to next cycle
    this.currentCycle++;
    if (this.session) {
      this.session.currentCycle = this.currentCycle;
    }
    
    this.startWorkPeriod();
  }

  /**
   * Continue current period (extend time)
   */
  continueCurrentPeriod(): void {
    if (this.state !== 'work_complete' && this.state !== 'rest_complete') {
      throw new Error('Can only continue from complete state');
    }
    
    // 切换回运行状态，开始正计时
    if (this.state === 'work_complete') {
      this.state = 'work_running';
      this.currentPeriod = 'work';
    } else {
      this.state = 'rest_running';
      this.currentPeriod = 'rest';
    }
    
    if (this.session) {
      this.session.status = 'running';
    }
    
    // 重置剩余时间为0，开始正计时
    this.remainingSeconds = 0;
    this.startInterval();
  }

  /**
   * Get extended seconds
   */
  getExtendedSeconds(): number {
    return this.extendedSeconds;
  }

  /**
   * Handle period completion
   * Requirement 5.2: Trigger alarms at end of each period
   * Requirement 5.3: Wait for manual confirmation between periods
   */
  private handlePeriodCompletion(): void {
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
      } else {
        // Wait for manual confirmation to start rest
        this.state = 'work_complete';
        if (this.session) {
          this.session.status = 'paused';
        }
      }
    } else {
      // Rest period completed
      // Trigger alarm for rest period completion
      if (this.onPeriodComplete) {
        this.onPeriodComplete('rest');
      }

      // Wait for manual confirmation to start next work period
      this.state = 'rest_complete';
      if (this.session) {
        this.session.status = 'paused';
      }
    }
  }

  /**
   * Handle all cycles completion
   * Requirement 5.4: Create event records for work periods on completion
   */
  private handleAllComplete(): void {
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
  private createWorkPeriodEvents(): Event[] {
    const events: Event[] = [];
    const now = this.dateProvider().toISOString();

    for (const period of this.workPeriods) {
      const event: Event = {
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
  private formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  /**
   * Pad number with leading zero
   */
  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
