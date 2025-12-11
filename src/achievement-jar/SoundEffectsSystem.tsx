/**
 * Achievement Jar Sound Effects System
 * Provides Web Audio API sound generation with HTML5 audio fallback
 * Integrates with existing custom sound effect infrastructure
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CelebrationType } from './types';

// Sound effect configuration
interface SoundConfig {
  type: CelebrationType;
  frequency: number;
  duration: number;
  volume: number;
  waveType: OscillatorType;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

// Default sound configurations for each celebration type
const DEFAULT_SOUND_CONFIGS: Record<CelebrationType, SoundConfig> = {
  drum: {
    type: 'drum',
    frequency: 80,
    duration: 0.3,
    volume: 0.7,
    waveType: 'sine',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
  },
  clap: {
    type: 'clap',
    frequency: 1000,
    duration: 0.15,
    volume: 0.6,
    waveType: 'square',
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.1, release: 0.1 }
  },
  cheer: {
    type: 'cheer',
    frequency: 440,
    duration: 0.5,
    volume: 0.8,
    waveType: 'triangle',
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.3 }
  }
};

// HTML5 audio fallback URLs (can be customized)
const FALLBACK_AUDIO_URLS: Record<CelebrationType, string> = {
  drum: '/sounds/drum.mp3',
  clap: '/sounds/clap.mp3',
  cheer: '/sounds/cheer.mp3'
};

interface SoundEffectsSystemProps {
  volume?: number; // Global volume 0-1
  useWebAudio?: boolean; // Force Web Audio API usage
  customSounds?: Partial<Record<CelebrationType, string>>; // Custom sound URLs
  onError?: (error: string) => void;
}

// Sound Effects System Class (non-React component)
class SoundEffectsSystemClass {
  private audioContext: AudioContext | null = null;
  private audioElements: Record<CelebrationType, HTMLAudioElement> = {} as any;
  private isWebAudioSupported = false;
  private isInitialized = false;
  private volume: number;
  private useWebAudio: boolean;
  private customSounds: Partial<Record<CelebrationType, string>>;
  private onError?: (error: string) => void;

  constructor(options: SoundEffectsSystemProps = {}) {
    this.volume = options.volume || 0.7;
    this.useWebAudio = options.useWebAudio !== false;
    this.customSounds = options.customSounds || {};
    this.onError = options.onError;
    
    this.initialize();
  }

  private async initialize() {
    try {
      // Try to initialize Web Audio API
      if (this.useWebAudio && typeof AudioContext !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isWebAudioSupported = true;
      }
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 audio');
      this.isWebAudioSupported = false;
    }

    // Initialize HTML5 audio elements as fallback
    const audioElements: Partial<Record<CelebrationType, HTMLAudioElement>> = {};
    
    for (const type of Object.keys(DEFAULT_SOUND_CONFIGS) as CelebrationType[]) {
      const audio = new Audio();
      const soundUrl = this.customSounds[type] || FALLBACK_AUDIO_URLS[type];
      
      audio.src = soundUrl;
      audio.preload = 'auto';
      audio.volume = this.volume;
      
      // Handle loading errors gracefully
      audio.addEventListener('error', () => {
        console.warn(`Failed to load sound for ${type}: ${soundUrl}`);
      });
      
      audioElements[type] = audio;
    }
    
    this.audioElements = audioElements as Record<CelebrationType, HTMLAudioElement>;
    this.isInitialized = true;
  }

  public dispose() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Generate Web Audio API sound effect
  private generateWebAudioSound(config: SoundConfig) {
    const audioContext = this.audioContext;
    if (!audioContext) return;

    try {
      // Create oscillator for main tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure oscillator
      oscillator.type = config.waveType;
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      
      // Apply ADSR envelope
      const now = audioContext.currentTime;
      const { attack, decay, sustain, release } = config.envelope || DEFAULT_SOUND_CONFIGS[config.type].envelope!;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(config.volume * this.volume, now + attack);
      gainNode.gain.linearRampToValueAtTime(config.volume * this.volume * sustain, now + attack + decay);
      gainNode.gain.setValueAtTime(config.volume * this.volume * sustain, now + config.duration - release);
      gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
      
      // Special effects for different celebration types
      if (config.type === 'drum') {
        // Add noise for drum-like effect
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.3;
        }
        
        const noiseSource = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        noiseSource.buffer = noiseBuffer;
        noiseSource.connect(noiseGain);
        noiseGain.connect(audioContext.destination);
        
        noiseGain.gain.setValueAtTime(0.5 * this.volume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        noiseSource.start(now);
        noiseSource.stop(now + 0.1);
      } else if (config.type === 'clap') {
        // Add multiple quick bursts for clap effect
        for (let i = 0; i < 3; i++) {
          const clapOsc = audioContext.createOscillator();
          const clapGain = audioContext.createGain();
          
          clapOsc.connect(clapGain);
          clapGain.connect(audioContext.destination);
          
          clapOsc.type = 'square';
          clapOsc.frequency.setValueAtTime(800 + i * 200, audioContext.currentTime);
          
          const startTime = now + i * 0.02;
          clapGain.gain.setValueAtTime(0, startTime);
          clapGain.gain.linearRampToValueAtTime(0.3 * this.volume, startTime + 0.005);
          clapGain.gain.linearRampToValueAtTime(0, startTime + 0.03);
          
          clapOsc.start(startTime);
          clapOsc.stop(startTime + 0.03);
        }
      } else if (config.type === 'cheer') {
        // Add harmonics for cheer effect
        const harmonic = audioContext.createOscillator();
        const harmonicGain = audioContext.createGain();
        
        harmonic.connect(harmonicGain);
        harmonicGain.connect(audioContext.destination);
        
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(config.frequency * 2, audioContext.currentTime);
        
        harmonicGain.gain.setValueAtTime(0, now);
        harmonicGain.gain.linearRampToValueAtTime(0.2 * this.volume, now + attack);
        harmonicGain.gain.linearRampToValueAtTime(0, now + config.duration);
        
        harmonic.start(now);
        harmonic.stop(now + config.duration);
      }
      
      // Start main oscillator
      oscillator.start(now);
      oscillator.stop(now + config.duration);
      
    } catch (error) {
      console.error('Web Audio API sound generation failed:', error);
      this.onError?.('Web Audio API sound generation failed');
    }
  }

  // Play HTML5 audio fallback
  private playHTML5Audio(type: CelebrationType) {
    const audio = this.audioElements[type];
    if (!audio) return;

    try {
      audio.currentTime = 0;
      audio.volume = this.volume;
      audio.play().catch(error => {
        console.error(`HTML5 audio playback failed for ${type}:`, error);
        this.onError?.(`HTML5 audio playback failed for ${type}`);
      });
    } catch (error) {
      console.error(`HTML5 audio error for ${type}:`, error);
      this.onError?.(`HTML5 audio error for ${type}`);
    }
  }

  // Main play sound function
  public playSound(type: CelebrationType, customConfig?: Partial<SoundConfig>) {
    if (!this.isInitialized) {
      console.warn('Sound system not initialized yet');
      return;
    }

    const config = { ...DEFAULT_SOUND_CONFIGS[type], ...customConfig };

    // Try Web Audio API first, fallback to HTML5 audio
    if (this.isWebAudioSupported && this.audioContext?.state === 'running') {
      this.generateWebAudioSound(config);
    } else {
      this.playHTML5Audio(type);
    }
  }

  // Resume audio context on user interaction (required by browsers)
  public async resumeAudioContext() {
    if (this.audioContext?.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }

  // Update volume
  public setVolume(newVolume: number) {
    this.volume = newVolume;
    // Update HTML5 audio volumes
    Object.values(this.audioElements).forEach(audio => {
      if (audio) audio.volume = newVolume;
    });
  }

  // Getters
  public get ready() { return this.isInitialized; }
  public get webAudioSupported() { return this.isWebAudioSupported; }
}

// Hook for using sound effects in components
export const useSoundEffects = (options?: SoundEffectsSystemProps) => {
  const soundSystemRef = useRef<SoundEffectsSystemClass | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create sound system instance
    const soundSystem = new SoundEffectsSystemClass(options || {});
    soundSystemRef.current = soundSystem;
    
    // Wait for initialization
    const checkReady = () => {
      if (soundSystem.ready) {
        setIsReady(true);
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();

    // Cleanup on unmount
    return () => {
      soundSystem.dispose();
    };
  }, []);

  const playSound = useCallback((type: CelebrationType, customConfig?: Partial<SoundConfig>) => {
    soundSystemRef.current?.playSound(type, customConfig);
  }, []);

  const resumeAudioContext = useCallback(async () => {
    await soundSystemRef.current?.resumeAudioContext();
  }, []);

  return {
    playSound,
    resumeAudioContext,
    isReady,
    isWebAudioSupported: soundSystemRef.current?.webAudioSupported || false
  };
};

export default SoundEffectsSystemClass;