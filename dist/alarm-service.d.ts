/**
 * Alarm Service
 * Implements Requirements 4.3, 5.2, 5.3
 *
 * Provides alarm functionality using Web Audio API with fallback to visual alarm
 */
/**
 * Alarm Service - Handles audio and visual alarms
 */
export declare class AlarmService {
    private audioContext;
    private isPlaying;
    /**
     * Play alarm sound
     * Requirement 4.3, 5.2, 5.3: Trigger alarm when countdown/Pomodoro period completes
     */
    playAlarm(): void;
    /**
     * Stop alarm sound
     */
    stopAlarm(): void;
    /**
     * Play alarm using Web Audio API
     * Generates an 800 Hz beep sound
     */
    private playWebAudioAlarm;
    /**
     * Show visual alarm as fallback
     * Flashes the screen border
     */
    private showVisualAlarm;
    /**
     * Hide visual alarm
     */
    private hideVisualAlarm;
    /**
     * Test if Web Audio API is available
     */
    static isWebAudioSupported(): boolean;
}
/**
 * Global alarm service instance
 */
export declare const alarmService: AlarmService;
//# sourceMappingURL=alarm-service.d.ts.map