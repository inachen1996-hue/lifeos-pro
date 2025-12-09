/**
 * Alarm Service
 * Implements Requirements 4.3, 5.2, 5.3
 *
 * Provides alarm functionality using Web Audio API with fallback to visual alarm
 */
/**
 * Alarm Service - Handles audio and visual alarms
 */
export class AlarmService {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.customSounds = {
            cheer: null,
            clap: null,
            drum: null,
        };
        this.loadCustomSounds();
    }
    /**
     * Load custom sounds from localStorage
     */
    loadCustomSounds() {
        try {
            const stored = localStorage.getItem('lifeos_pro_custom_sounds');
            if (stored) {
                const sounds = JSON.parse(stored);
                this.customSounds = {
                    cheer: sounds.cheer || null,
                    clap: sounds.clap || null,
                    drum: sounds.drum || null,
                };
                console.log('✅ 自定义音效已加载');
            }
        }
        catch (error) {
            console.warn('Failed to load custom sounds:', error);
        }
    }
    /**
     * Reload custom sounds from localStorage
     */
    reloadCustomSounds() {
        this.loadCustomSounds();
    }
    /**
     * Play alarm sound
     * Requirement 4.3, 5.2, 5.3: Trigger alarm when countdown/Pomodoro period completes
     */
    playAlarm(soundType = 'cheer') {
        if (this.isPlaying) {
            return; // Already playing
        }
        this.isPlaying = true;
        try {
            // Try to play custom sound first
            const customSound = this.customSounds[soundType];
            if (customSound) {
                this.playCustomSound(customSound);
            }
            else {
                // Fallback to Web Audio API beep
                this.playWebAudioAlarm();
            }
        }
        catch (error) {
            console.warn('Audio playback failed, falling back to visual alarm:', error);
            // Fallback to visual alarm
            this.showVisualAlarm();
        }
    }
    /**
     * Play custom sound from data URL
     */
    playCustomSound(dataUrl) {
        const audio = new Audio(dataUrl);
        audio.volume = 0.5;
        audio.onended = () => {
            this.isPlaying = false;
        };
        audio.onerror = (error) => {
            console.error('Failed to play custom sound:', error);
            this.isPlaying = false;
            // Fallback to beep
            this.playWebAudioAlarm();
        };
        audio.play().catch((error) => {
            console.error('Audio play failed:', error);
            this.isPlaying = false;
            this.playWebAudioAlarm();
        });
    }
    /**
     * Stop alarm sound
     */
    stopAlarm() {
        this.isPlaying = false;
        if (this.audioContext) {
            try {
                this.audioContext.close();
                this.audioContext = null;
            }
            catch (error) {
                console.error('Failed to close audio context:', error);
            }
        }
        // Remove visual alarm if present
        this.hideVisualAlarm();
    }
    /**
     * Play alarm using Web Audio API
     * Generates an 800 Hz beep sound
     */
    playWebAudioAlarm() {
        // Create audio context
        const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContextClass) {
            throw new Error('Web Audio API not supported');
        }
        this.audioContext = new AudioContextClass();
        if (!this.audioContext) {
            throw new Error('Failed to create audio context');
        }
        // Create oscillator for beep sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        // Configure oscillator
        oscillator.frequency.value = 800; // 800 Hz beep
        oscillator.type = 'sine';
        // Configure gain (volume envelope)
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        // Play for 0.5 seconds
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        // Clean up after playing
        oscillator.onended = () => {
            this.isPlaying = false;
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
        };
    }
    /**
     * Show visual alarm as fallback
     * Flashes the screen border
     */
    showVisualAlarm() {
        // Create visual alarm element
        const alarmElement = document.createElement('div');
        alarmElement.id = 'visual-alarm';
        alarmElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 10px solid #ff4444;
      pointer-events: none;
      z-index: 9999;
      animation: flash 0.5s ease-in-out 3;
    `;
        // Add flash animation
        const style = document.createElement('style');
        style.textContent = `
      @keyframes flash {
        0%, 100% { opacity: 0; }
        50% { opacity: 1; }
      }
    `;
        document.head.appendChild(style);
        document.body.appendChild(alarmElement);
        // Remove after animation completes (3 flashes * 0.5s = 1.5s)
        setTimeout(() => {
            this.hideVisualAlarm();
            this.isPlaying = false;
        }, 1500);
    }
    /**
     * Hide visual alarm
     */
    hideVisualAlarm() {
        const alarmElement = document.getElementById('visual-alarm');
        if (alarmElement) {
            alarmElement.remove();
        }
    }
    /**
     * Test if Web Audio API is available
     */
    static isWebAudioSupported() {
        const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
        return !!AudioContextClass;
    }
}
/**
 * Global alarm service instance
 */
export const alarmService = new AlarmService();
//# sourceMappingURL=alarm-service.js.map