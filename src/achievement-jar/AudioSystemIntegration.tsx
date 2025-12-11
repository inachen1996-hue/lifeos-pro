/**
 * Achievement Jar Progress Visualization - Audio System Integration
 * Integrates with existing LifeOS audio infrastructure for celebration sounds
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { SoundEffectsSystem } from './SoundEffectsSystem.js';

// Types for audio integration
interface AudioSystemIntegrationProps {
  customSounds?: {
    celebration?: string; // Base64 encoded audio
    applause?: string;
    drumbeat?: string;
  };
  volume?: number;
  enabled?: boolean;
  onAudioError?: (error: Error) => void;
}

/**
 * Audio System Integration Component
 * Bridges Achievement Jar audio with existing LifeOS audio system
 */
export const AudioSystemIntegration: React.FC<AudioSystemIntegrationProps> = ({
  customSounds = {},
  volume = 0.7,
  enabled = true,
  onAudioError
}) => {
  const soundSystemRef = useRef<SoundEffectsSystem | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio system with LifeOS compatibility
  useEffect(() => {
    if (!enabled) return;

    try {
      // Create audio context (compatible with existing LifeOS audio)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }

      // Initialize sound effects system
      soundSystemRef.current = new SoundEffectsSystem({
        audioContext: audioContextRef.current,
        volume,
        enableBuiltInSounds: true,
        enableCustomSounds: Object.keys(customSounds).length > 0
      });

      // Load custom sounds if provided
      if (customSounds.celebration) {
        soundSystemRef.current.loadCustomSound('celebration', customSounds.celebration);
      }
      if (customSounds.applause) {
        soundSystemRef.current.loadCustomSound('applause', customSounds.applause);
      }
      if (customSounds.drumbeat) {
        soundSystemRef.current.loadCustomSound('drumbeat', customSounds.drumbeat);
      }

    } catch (error) {
      console.warn('Failed to initialize audio system:', error);
      onAudioError?.(error as Error);
    }

    return () => {
      // Cleanup audio resources
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [enabled, volume, customSounds, onAudioError]);

  // Play celebration sound (compatible with LifeOS audio patterns)
  const playCelebrationSound = useCallback(async () => {
    if (!enabled || !soundSystemRef.current) return;

    try {
      // Resume audio context if suspended (required for user interaction)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      await soundSystemRef.current.playCelebrationSound();
    } catch (error) {
      console.warn('Failed to play celebration sound:', error);
      onAudioError?.(error as Error);
    }
  }, [enabled, onAudioError]);

  // Play applause sound
  const playApplauseSound = useCallback(async () => {
    if (!enabled || !soundSystemRef.current) return;

    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      await soundSystemRef.current.playApplauseSound();
    } catch (error) {
      console.warn('Failed to play applause sound:', error);
      onAudioError?.(error as Error);
    }
  }, [enabled, onAudioError]);

  // Play drumbeat sound
  const playDrumbeatSound = useCallback(async () => {
    if (!enabled || !soundSystemRef.current) return;

    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      await soundSystemRef.current.playDrumbeatSound();
    } catch (error) {
      console.warn('Failed to play drumbeat sound:', error);
      onAudioError?.(error as Error);
    }
  }, [enabled, onAudioError]);

  // Update volume
  const updateVolume = useCallback((newVolume: number) => {
    if (soundSystemRef.current) {
      soundSystemRef.current.setVolume(Math.max(0, Math.min(1, newVolume)));
    }
  }, []);

  // Check if audio is supported
  const isAudioSupported = useCallback(() => {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }, []);

  // Get audio system status
  const getAudioStatus = useCallback(() => {
    return {
      enabled,
      supported: isAudioSupported(),
      contextState: audioContextRef.current?.state || 'unknown',
      hasCustomSounds: Object.keys(customSounds).length > 0,
      volume
    };
  }, [enabled, customSounds, volume, isAudioSupported]);

  // Expose audio functions through ref or context
  return {
    playCelebrationSound,
    playApplauseSound,
    playDrumbeatSound,
    updateVolume,
    getAudioStatus,
    isAudioSupported
  };
};

/**
 * Hook for using LifeOS Audio Integration
 * Provides a convenient way to access audio functions in components
 */
export const useLifeOSAudio = (options: AudioSystemIntegrationProps = {}) => {
  const audioIntegration = AudioSystemIntegration(options);
  
  return audioIntegration;
};

/**
 * Audio Storage Integration
 * Manages custom audio files with LifeOS localStorage patterns
 */
export class LifeOSAudioStorage {
  private static readonly STORAGE_KEY = 'lifeos_pro_custom_audio_v2';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Save custom audio to localStorage (compatible with LifeOS storage patterns)
   */
  static saveCustomAudio(type: 'celebration' | 'applause' | 'drumbeat', audioData: string): boolean {
    try {
      // Check file size
      if (audioData.length > this.MAX_FILE_SIZE) {
        throw new Error('Audio file too large (max 5MB)');
      }

      const existingData = this.getCustomAudioData();
      existingData[type] = audioData;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
      return true;
    } catch (error) {
      console.error('Failed to save custom audio:', error);
      return false;
    }
  }

  /**
   * Load custom audio from localStorage
   */
  static loadCustomAudio(type: 'celebration' | 'applause' | 'drumbeat'): string | null {
    try {
      const data = this.getCustomAudioData();
      return data[type] || null;
    } catch (error) {
      console.error('Failed to load custom audio:', error);
      return null;
    }
  }

  /**
   * Remove custom audio
   */
  static removeCustomAudio(type: 'celebration' | 'applause' | 'drumbeat'): boolean {
    try {
      const existingData = this.getCustomAudioData();
      delete existingData[type];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
      return true;
    } catch (error) {
      console.error('Failed to remove custom audio:', error);
      return false;
    }
  }

  /**
   * Get all custom audio data
   */
  static getAllCustomAudio(): Record<string, string> {
    return this.getCustomAudioData();
  }

  /**
   * Clear all custom audio
   */
  static clearAllCustomAudio(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear custom audio:', error);
      return false;
    }
  }

  /**
   * Check if custom audio exists
   */
  static hasCustomAudio(type: 'celebration' | 'applause' | 'drumbeat'): boolean {
    const data = this.getCustomAudioData();
    return !!data[type];
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = JSON.stringify(this.getCustomAudioData());
      const used = new Blob([data]).size;
      const available = this.MAX_FILE_SIZE - used;
      const percentage = (used / this.MAX_FILE_SIZE) * 100;

      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: this.MAX_FILE_SIZE, percentage: 0 };
    }
  }

  /**
   * Private method to get custom audio data from localStorage
   */
  private static getCustomAudioData(): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to parse custom audio data:', error);
      return {};
    }
  }
}

/**
 * Audio File Validator
 * Validates audio files for LifeOS compatibility
 */
export class AudioFileValidator {
  private static readonly SUPPORTED_FORMATS = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
  private static readonly MAX_DURATION = 10; // seconds

  /**
   * Validate audio file
   */
  static async validateAudioFile(file: File): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check file type
      if (!this.SUPPORTED_FORMATS.includes(file.type)) {
        return { valid: false, error: 'Unsupported audio format. Please use MP3, WAV, OGG, or M4A.' };
      }

      // Check file size
      if (file.size > LifeOSAudioStorage['MAX_FILE_SIZE']) {
        return { valid: false, error: 'File too large. Maximum size is 5MB.' };
      }

      // Check audio duration (if possible)
      const duration = await this.getAudioDuration(file);
      if (duration > this.MAX_DURATION) {
        return { valid: false, error: `Audio too long. Maximum duration is ${this.MAX_DURATION} seconds.` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to validate audio file.' };
    }
  }

  /**
   * Get audio duration from file
   */
  private static getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio metadata'));
      });

      audio.src = url;
    });
  }

  /**
   * Convert file to base64 for storage
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

export default AudioSystemIntegration;