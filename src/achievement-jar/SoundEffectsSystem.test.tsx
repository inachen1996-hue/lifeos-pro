/**
 * Achievement Jar Sound Effects System - Property-Based Tests
 * Tests Web Audio API sound generation with HTML5 audio fallback
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import SoundEffectsSystemClass, { useSoundEffects } from './SoundEffectsSystem';
import { CelebrationType } from './types';

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: 'sine'
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    }
  })),
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(1000))
  })),
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    buffer: null
  })),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
  close: vi.fn(),
  resume: vi.fn()
};

// Mock HTML5 Audio
const mockAudio = {
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  volume: 1,
  src: '',
  preload: 'auto'
};

// Test component for hook testing
const TestComponent: React.FC<{ options?: any }> = ({ options }) => {
  const { playSound, isReady, isWebAudioSupported } = useSoundEffects(options);
  
  return (
    <div>
      <button onClick={() => playSound('drum')} data-testid="drum-button">
        Drum
      </button>
      <button onClick={() => playSound('clap')} data-testid="clap-button">
        Clap
      </button>
      <button onClick={() => playSound('cheer')} data-testid="cheer-button">
        Cheer
      </button>
      <div data-testid="ready-status">{isReady ? 'ready' : 'not-ready'}</div>
      <div data-testid="webaudio-status">{isWebAudioSupported ? 'webaudio' : 'html5'}</div>
    </div>
  );
};

describe('SoundEffectsSystem Component', () => {
  beforeEach(() => {
    // Use fake timers
    vi.useFakeTimers();
    
    // Mock global Audio constructor
    global.Audio = vi.fn(() => mockAudio) as any;
    
    // Mock AudioContext
    global.AudioContext = vi.fn(() => mockAudioContext) as any;
    (global as any).webkitAudioContext = vi.fn(() => mockAudioContext);
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /**
   * Feature: achievement-jar-progress, Property 17: Sound effect generation consistency
   * For any celebration type (drum, clap, cheer), the system should generate appropriate
   * sound effects using Web Audio API or HTML5 audio fallback
   * Validates: Requirements 3.2, 3.3, 3.4
   */
  it('should generate appropriate sound effects for each celebration type', () => {
    fc.assert(fc.property(
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      fc.float({ min: 0, max: 1 }),
      fc.boolean(),
      (celebrationType, volume, useWebAudio) => {
        const onError = vi.fn();
        
        const { container } = render(
          <TestComponent options={{ volume, useWebAudio, onError }} />
        );

        // Wait for initialization
        act(() => {
          vi.advanceTimersByTime(200);
        });

        const button = container.querySelector(`[data-testid="${celebrationType}-button"]`);
        expect(button).toBeTruthy();

        // Simulate button click
        act(() => {
          button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        // Verify sound generation was attempted
        if (useWebAudio) {
          expect(mockAudioContext.createOscillator).toHaveBeenCalled();
          expect(mockAudioContext.createGain).toHaveBeenCalled();
        } else {
          expect(mockAudio.play).toHaveBeenCalled();
        }

        // Should not have errors for valid inputs
        expect(onError).not.toHaveBeenCalled();
      }
    ), { numRuns: 100 });
  });

  /**
   * Feature: achievement-jar-progress, Property 18: Audio system fallback reliability
   * For any audio system failure, the system should gracefully fallback to alternative
   * audio methods without crashing
   * Validates: Requirements 3.2, 3.3, 3.4 (error handling)
   */
  it('should gracefully fallback when Web Audio API fails', () => {
    fc.assert(fc.property(
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      fc.float({ min: 0, max: 1 }),
      (celebrationType, volume) => {
        // Mock Web Audio API failure
        const failingAudioContext = {
          ...mockAudioContext,
          createOscillator: vi.fn(() => {
            throw new Error('Web Audio API failed');
          })
        };
        global.AudioContext = vi.fn(() => failingAudioContext) as any;

        const onError = vi.fn();
        
        const { container } = render(
          <TestComponent options={{ volume, useWebAudio: true, onError }} />
        );

        act(() => {
          vi.advanceTimersByTime(200);
        });

        const button = container.querySelector(`[data-testid="${celebrationType}-button"]`);
        
        // Should not crash when clicking
        expect(() => {
          act(() => {
            button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          });
        }).not.toThrow();

        // Should fallback to HTML5 audio
        expect(mockAudio.play).toHaveBeenCalled();
      }
    ), { numRuns: 100 });
  });

  /**
   * Feature: achievement-jar-progress, Property 19: Volume control consistency
   * For any volume setting (0-1), all sound effects should respect the volume level
   * and maintain consistent audio output levels
   * Validates: Requirements 3.2, 3.3, 3.4 (volume control)
   */
  it('should respect volume settings consistently across all sound types', () => {
    fc.assert(fc.property(
      fc.float({ min: 0, max: 1 }),
      fc.array(fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType), { minLength: 1, maxLength: 3 }),
      (volume, celebrationTypes) => {
        const { container } = render(
          <TestComponent options={{ volume }} />
        );

        act(() => {
          vi.advanceTimersByTime(200);
        });

        // Test each celebration type
        celebrationTypes.forEach(type => {
          const button = container.querySelector(`[data-testid="${type}-button"]`);
          
          act(() => {
            button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          });
        });

        // Verify volume was applied to HTML5 audio elements
        expect(mockAudio.volume).toBe(volume);
        
        // Verify Web Audio API gain nodes received correct volume
        const gainCalls = mockAudioContext.createGain().gain.setValueAtTime.mock.calls;
        if (gainCalls.length > 0) {
          gainCalls.forEach(call => {
            const gainValue = call[0];
            // Gain should be proportional to volume (allowing for envelope scaling)
            expect(gainValue).toBeGreaterThanOrEqual(0);
            expect(gainValue).toBeLessThanOrEqual(volume);
          });
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Feature: achievement-jar-progress, Property 20: Custom sound integration
   * For any custom sound URLs provided, the system should use them instead of
   * default sounds while maintaining all functionality
   * Validates: Requirements 3.2, 3.3, 3.4 (customization)
   */
  it('should integrate custom sounds correctly', () => {
    fc.assert(fc.property(
      fc.record({
        drum: fc.option(fc.webUrl(), { nil: undefined }),
        clap: fc.option(fc.webUrl(), { nil: undefined }),
        cheer: fc.option(fc.webUrl(), { nil: undefined })
      }),
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      (customSounds, celebrationType) => {
        const { container } = render(
          <TestComponent options={{ customSounds }} />
        );

        act(() => {
          vi.advanceTimersByTime(200);
        });

        const button = container.querySelector(`[data-testid="${celebrationType}-button"]`);
        
        act(() => {
          button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        // Verify custom URL was used if provided
        if (customSounds[celebrationType]) {
          expect(mockAudio.src).toBe(customSounds[celebrationType]);
        }

        // Should still work regardless of custom sounds
        expect(mockAudio.play).toHaveBeenCalled();
      }
    ), { numRuns: 100 });
  });

  /**
   * Feature: achievement-jar-progress, Property 21: Audio context state management
   * For any audio context state changes, the system should handle suspended/running
   * states correctly and resume when needed
   * Validates: Requirements 3.2, 3.3, 3.4 (browser compatibility)
   */
  it('should handle audio context state changes correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom('suspended', 'running', 'closed'),
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      (contextState, celebrationType) => {
        const contextWithState = {
          ...mockAudioContext,
          state: contextState
        };
        global.AudioContext = vi.fn(() => contextWithState) as any;

        const { container } = render(
          <TestComponent options={{ useWebAudio: true }} />
        );

        act(() => {
          vi.advanceTimersByTime(200);
        });

        const button = container.querySelector(`[data-testid="${celebrationType}-button"]`);
        
        act(() => {
          button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        if (contextState === 'running') {
          // Should use Web Audio API
          expect(mockAudioContext.createOscillator).toHaveBeenCalled();
        } else {
          // Should fallback to HTML5 audio
          expect(mockAudio.play).toHaveBeenCalled();
        }
      }
    ), { numRuns: 100 });
  });

  // Unit tests for specific edge cases
  it('should handle missing audio files gracefully', () => {
    const onError = vi.fn();
    mockAudio.play = vi.fn(() => Promise.reject(new Error('Audio file not found')));

    const { container } = render(
      <TestComponent options={{ useWebAudio: false, onError }} />
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const drumButton = container.querySelector('[data-testid="drum-button"]');
    
    act(() => {
      drumButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Should not crash
    expect(container).toBeTruthy();
  });

  it('should initialize correctly without Web Audio API support', () => {
    // Remove Web Audio API support
    delete (global as any).AudioContext;
    delete (global as any).webkitAudioContext;

    const { container } = render(<TestComponent />);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const status = container.querySelector('[data-testid="webaudio-status"]');
    expect(status?.textContent).toBe('html5');
  });

  it('should handle rapid successive sound triggers', () => {
    const { container } = render(<TestComponent />);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const drumButton = container.querySelector('[data-testid="drum-button"]');
    
    // Trigger multiple sounds rapidly
    act(() => {
      for (let i = 0; i < 5; i++) {
        drumButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    // Should handle multiple calls without errors
    expect(mockAudio.play).toHaveBeenCalledTimes(5);
  });
});

describe('useSoundEffects Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.Audio = vi.fn(() => mockAudio) as any;
    global.AudioContext = vi.fn(() => mockAudioContext) as any;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide sound playing functionality', () => {
    const { container } = render(<TestComponent />);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const readyStatus = container.querySelector('[data-testid="ready-status"]');
    expect(readyStatus?.textContent).toBe('ready');
  });

  it('should handle initialization errors gracefully', () => {
    global.AudioContext = vi.fn(() => {
      throw new Error('AudioContext initialization failed');
    }) as any;

    const { container } = render(<TestComponent />);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should still render without crashing
    expect(container).toBeTruthy();
  });
});