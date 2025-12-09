/**
 * Alarm Service
 * Implements Requirements 4.3, 5.2, 5.3
 *
 * Provides alarm functionality using Web Audio API with fallback to visual alarm
 */
/**
 * Sound type for different alarm scenarios
 */
export type SoundType = 'cheer' | 'clap' | 'drum';
/**
 * Alarm Service - Handles audio and visual alarms
 */
export declare class AlarmService {
    private audioContext;
    private isPlaying;
    private customSounds;
    constructor();
    /**
     * Load custom sounds from localStorage
     */
    private loadCustomSounds;
    /**
     * Reload custom sounds from localStorage
     */
    reloadCustomSounds(): void;
    /**
     * Play alarm sound
     * Requirement 4.3, 5.2, 5.3: Trigger alarm when countdown/Pomodoro period completes
     */
    playAlarm(soundType?: SoundType): void;
    /**
     * Play custom sound from data URL
     */
    private playCustomSound;
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