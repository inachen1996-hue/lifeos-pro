/**
 * Achievement Jar Celebration Integration
 * Integrates existing LifeOS sound system with Achievement Jar visual effects
 * Maintains compatibility with custom sounds and existing celebration buttons
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CelebrationType } from './types';
import { CelebrationEffectsSystem, useCelebrationEffects } from './CelebrationEffectsSystem';

interface CelebrationIntegrationProps {
  onCelebrationComplete?: () => void;
  className?: string;
}

interface CustomSounds {
  cheer: string | null;
  clap: string | null;
  drum: string | null;
}

/**
 * Celebration Integration Component
 * Coordinates sound effects with visual effects for Achievement Jar
 */
export const CelebrationIntegration: React.FC<CelebrationIntegrationProps> = ({
  onCelebrationComplete,
  className = ''
}) => {
  const [customSounds, setCustomSounds] = useState<CustomSounds>(() => {
    try {
      const saved = localStorage.getItem('lifeos_pro_custom_sounds');
      return saved ? JSON.parse(saved) : { cheer: null, clap: null, drum: null };
    } catch (error) {
      console.error('Failed to load custom sounds:', error);
      return { cheer: null, clap: null, drum: null };
    }
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const {
    isActive: isCelebrationActive,
    celebrationType,
    startCelebration,
    stopCelebration,
    handleComplete: handleCelebrationComplete,
    celebrationSystemRef
  } = useCelebrationEffects();

  // Initialize audio context
  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Listen for custom sounds changes from localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lifeos_pro_custom_sounds' && e.newValue) {
        try {
          const newSounds = JSON.parse(e.newValue);
          setCustomSounds(newSounds);
          console.log('✅ Custom sounds updated:', newSounds);
        } catch (err) {
          console.error('Failed to parse custom sounds data:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Play sound function - compatible with existing LifeOS sound system
  const playSound = useCallback(async (type: CelebrationType) => {
    console.log('🎵 CelebrationIntegration playSound called, type:', type);

    // Resume audio context if suspended (required by browsers)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }

    // Get latest custom sounds from localStorage
    let currentCustomSounds = customSounds;
    try {
      const saved = localStorage.getItem('lifeos_pro_custom_sounds');
      if (saved) {
        currentCustomSounds = JSON.parse(saved);
        console.log('🔍 Latest custom sounds:', {
          cheer: currentCustomSounds.cheer ? 'Set' : 'Not set',
          clap: currentCustomSounds.clap ? 'Set' : 'Not set',
          drum: currentCustomSounds.drum ? 'Set' : 'Not set'
        });

        // Update state if different
        if (JSON.stringify(currentCustomSounds) !== JSON.stringify(customSounds)) {
          setCustomSounds(currentCustomSounds);
          console.log('🔄 Custom sounds synchronized');
        }
      }
    } catch (err) {
      console.error('❌ Failed to read custom sounds:', err);
    }

    // Use custom sound if available
    if (currentCustomSounds[type]) {
      console.log('✅ Using custom sound:', type);
      const audio = new Audio(currentCustomSounds[type]);
      audio.volume = 0.5;
      try {
        await audio.play();
        console.log('🔊 Custom sound played successfully');
      } catch (err) {
        console.error('❌ Failed to play custom sound:', err);
        // Fallback to built-in sound
        playBuiltInSound(type);
      }
      return;
    }

    console.log('⚠️ No custom sound found, using built-in sound');
    playBuiltInSound(type);
  }, [customSounds]);

  // Play built-in sound using Web Audio API (compatible with existing implementation)
  const playBuiltInSound = useCallback((type: CelebrationType) => {
    console.log(`🎵 Playing built-in sound: ${type}`);

    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      playInternalSound(ctx, type);
    } catch (error) {
      console.error('Failed to play built-in sound:', error);
    }
  }, []);

  // Internal sound generation (compatible with existing LifeOS implementation)
  const playInternalSound = useCallback((ctx: AudioContext, type: CelebrationType) => {
    console.log(`🎵 Starting built-in sound: ${type}`);

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);

    const now = ctx.currentTime;

    if (type === 'cheer') {
      // Cheer sound - ascending melody
      const frequencies = [440, 554, 659, 880];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        osc.type = 'triangle';
        
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.8, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
        
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.3);
      });
    } else if (type === 'clap') {
      // Clap sound - noise bursts
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.frequency.setValueAtTime(800 + Math.random() * 400, now + i * 0.05);
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.6, now + i * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.08);
        
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.08);
      }
    } else if (type === 'drum') {
      // Drum sound - low frequency with noise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    }

    console.log(`✅ ${type} sound playback completed`);
    
    setTimeout(() => {
      try {
        if (ctx.state !== 'closed') {
          ctx.close();
        }
      } catch (error) {
        console.warn('Failed to close audio context:', error);
      }
    }, 1000);
  }, []);

  // Trigger celebration with both sound and visual effects
  const triggerCelebration = useCallback(async (type: CelebrationType) => {
    console.log('🎉 Triggering celebration:', type);

    try {
      // Play sound first
      await playSound(type);
      
      // Start visual effects
      startCelebration(type);
    } catch (error) {
      console.error('Failed to trigger celebration:', error);
    }
  }, [playSound, startCelebration]);

  // Handle celebration completion
  const handleComplete = useCallback(() => {
    handleCelebrationComplete();
    onCelebrationComplete?.();
  }, [handleCelebrationComplete, onCelebrationComplete]);

  // Generate danmaku (compatible with existing LifeOS danmaku system)
  const generateDanmaku = useCallback(() => {
    // This will be handled by the CelebrationEffectsSystem
    // but we maintain compatibility with existing generateDanmaku calls
    console.log('🎭 Danmaku generation triggered via CelebrationIntegration');
  }, []);

  return (
    <div className={`celebration-integration ${className}`}>
      {/* Celebration Effects System */}
      <CelebrationEffectsSystem
        onEffectsComplete={handleComplete}
        ref={celebrationSystemRef}
      />
      
      {/* Celebration Buttons - compatible with existing LifeOS buttons */}
      <div className="celebration-buttons flex gap-3 justify-center">
        <button 
          onClick={() => triggerCelebration('cheer')}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-bold shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105 flex items-center gap-2"
          disabled={isCelebrationActive}
        >
          🎺 喝彩
        </button>
        <button 
          onClick={() => triggerCelebration('clap')}
          className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-bold shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105 flex items-center gap-2"
          disabled={isCelebrationActive}
        >
          👏 鼓掌
        </button>
        <button 
          onClick={() => triggerCelebration('drum')}
          className="px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-xl font-bold shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105 flex items-center gap-2"
          disabled={isCelebrationActive}
        >
          🥁 打鼓
        </button>
      </div>
    </div>
  );
};

/**
 * Hook for using celebration integration
 */
export const useCelebrationIntegration = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentType, setCurrentType] = useState<CelebrationType>('cheer');
  const integrationRef = useRef<{
    triggerCelebration: (type: CelebrationType) => Promise<void>;
    playSound: (type: CelebrationType) => Promise<void>;
    generateDanmaku: () => void;
  } | null>(null);

  const triggerCelebration = useCallback(async (type: CelebrationType) => {
    setCurrentType(type);
    setIsActive(true);
    await integrationRef.current?.triggerCelebration(type);
  }, []);

  const playSound = useCallback(async (type: CelebrationType) => {
    await integrationRef.current?.playSound(type);
  }, []);

  const generateDanmaku = useCallback(() => {
    integrationRef.current?.generateDanmaku();
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    currentType,
    triggerCelebration,
    playSound,
    generateDanmaku,
    handleComplete,
    integrationRef
  };
};

export default CelebrationIntegration;