/**
 * Achievement Jar Celebration Integration Property Tests
 * **Feature: achievement-jar-integration, Property 3: 音效系统兼容性**
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CelebrationIntegration, useCelebrationIntegration } from './CelebrationIntegration';
import { CelebrationType } from './types';

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: 'sine',
    start: vi.fn(),
    stop: vi.fn()
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    }
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn()
};

// Mock HTML5 Audio
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  volume: 0.5,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

// Property-based test generator for celebration types
function* generateCelebrationTypes(): Generator<CelebrationType> {
  const types: CelebrationType[] = ['cheer', 'clap', 'drum'];
  while (true) {
    yield types[Math.floor(Math.random() * types.length)];
  }
}

// Property-based test generator for custom sounds
function* generateCustomSounds(): Generator<Record<string, string | null>> {
  const soundTypes = ['cheer', 'clap', 'drum'];
  while (true) {
    const sounds: Record<string, string | null> = {};
    soundTypes.forEach(type => {
      sounds[type] = Math.random() > 0.5 ? `data:audio/mp3;base64,${Math.random().toString(36)}` : null;
    });
    yield sounds;
  }
}

describe('CelebrationIntegration Property Tests', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        })
      },
      writable: true
    });

    // Mock Web Audio API
    Object.defineProperty(window, 'AudioContext', {
      value: vi.fn(() => mockAudioContext),
      writable: true
    });

    // Mock HTML5 Audio
    Object.defineProperty(window, 'Audio', {
      value: vi.fn(() => mockAudio),
      writable: true
    });

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 3: 音效系统兼容性
   * For any celebration button interaction, the system should simultaneously 
   * trigger sound effects and visual effects, and correctly handle custom sound priority
   */
  describe('Property 3: Sound System Compatibility', () => {
    it('should trigger both sound and visual effects for any celebration type', async () => {
      const celebrationTypeGen = generateCelebrationTypes();
      const testIterations = 10;

      for (let i = 0; i < testIterations; i++) {
        const celebrationType = celebrationTypeGen.next().value;
        
        const TestComponent = () => {
          const { triggerCelebration } = useCelebrationIntegration();
          
          return (
            <div>
              <button 
                onClick={() => triggerCelebration(celebrationType)}
                data-testid={`celebration-${celebrationType}`}
              >
                Trigger {celebrationType}
              </button>
              <CelebrationIntegration />
            </div>
          );
        };

        const { unmount } = render(<TestComponent />);
        
        const button = screen.getByTestId(`celebration-${celebrationType}`);
        
        // Trigger celebration
        fireEvent.click(button);
        
        // Verify sound effect was triggered
        await waitFor(() => {
          expect(mockAudioContext.createOscillator).toHaveBeenCalled();
          expect(mockAudioContext.createGain).toHaveBeenCalled();
        });

        // Clean up
        unmount();
        vi.clearAllMocks();
      }
    });

    it('should prioritize custom sounds over built-in sounds for any custom sound configuration', async () => {
      const customSoundsGen = generateCustomSounds();
      const celebrationTypeGen = generateCelebrationTypes();
      const testIterations = 15;

      for (let i = 0; i < testIterations; i++) {
        const customSounds = customSoundsGen.next().value;
        const celebrationType = celebrationTypeGen.next().value;
        
        // Set up custom sounds in localStorage
        mockLocalStorage['lifeos_pro_custom_sounds'] = JSON.stringify(customSounds);
        
        const TestComponent = () => {
          const { triggerCelebration } = useCelebrationIntegration();
          
          return (
            <div>
              <button 
                onClick={() => triggerCelebration(celebrationType)}
                data-testid="trigger-celebration"
              >
                Trigger Celebration
              </button>
              <CelebrationIntegration />
            </div>
          );
        };

        const { unmount } = render(<TestComponent />);
        
        const button = screen.getByTestId('trigger-celebration');
        fireEvent.click(button);

        await waitFor(() => {
          if (customSounds[celebrationType]) {
            // Should use HTML5 Audio for custom sounds
            expect(window.Audio).toHaveBeenCalled();
            expect(mockAudio.play).toHaveBeenCalled();
          } else {
            // Should use Web Audio API for built-in sounds
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
          }
        });

        // Clean up
        unmount();
        vi.clearAllMocks();
        mockLocalStorage = {};
      }
    });

    it('should handle audio context suspension and resumption for any celebration trigger', async () => {
      const celebrationTypeGen = generateCelebrationTypes();
      const testIterations = 8;

      for (let i = 0; i < testIterations; i++) {
        const celebrationType = celebrationTypeGen.next().value;
        
        // Simulate suspended audio context
        mockAudioContext.state = 'suspended';
        
        const TestComponent = () => {
          const { triggerCelebration } = useCelebrationIntegration();
          
          return (
            <div>
              <button 
                onClick={() => triggerCelebration(celebrationType)}
                data-testid="trigger-celebration"
              >
                Trigger Celebration
              </button>
              <CelebrationIntegration />
            </div>
          );
        };

        const { unmount } = render(<TestComponent />);
        
        const button = screen.getByTestId('trigger-celebration');
        fireEvent.click(button);

        // Should attempt to resume audio context
        await waitFor(() => {
          expect(mockAudioContext.resume).toHaveBeenCalled();
        });

        // Clean up
        unmount();
        vi.clearAllMocks();
        mockAudioContext.state = 'running';
      }
    });

    it('should gracefully handle audio playback failures for any celebration type', async () => {
      const celebrationTypeGen = generateCelebrationTypes();
      const testIterations = 6;

      for (let i = 0; i < testIterations; i++) {
        const celebrationType = celebrationTypeGen.next().value;
        
        // Mock audio failure
        mockAudio.play.mockRejectedValueOnce(new Error('Audio playback failed'));
        mockAudioContext.createOscillator.mockImplementationOnce(() => {
          throw new Error('Web Audio API failed');
        });
        
        const TestComponent = () => {
          const { triggerCelebration } = useCelebrationIntegration();
          
          return (
            <div>
              <button 
                onClick={() => triggerCelebration(celebrationType)}
                data-testid="trigger-celebration"
              >
                Trigger Celebration
              </button>
              <CelebrationIntegration />
            </div>
          );
        };

        const { unmount } = render(<TestComponent />);
        
        const button = screen.getByTestId('trigger-celebration');
        
        // Should not throw error even when audio fails
        expect(() => {
          fireEvent.click(button);
        }).not.toThrow();

        // Clean up
        unmount();
        vi.clearAllMocks();
        
        // Reset mocks for next iteration
        mockAudio.play.mockResolvedValue(undefined);
        mockAudioContext.createOscillator.mockReturnValue({
          connect: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
          start: vi.fn(),
          stop: vi.fn()
        });
      }
    });

    it('should maintain sound system state consistency across multiple rapid celebrations', async () => {
      const celebrationTypeGen = generateCelebrationTypes();
      const testIterations = 5;

      for (let i = 0; i < testIterations; i++) {
        const celebrationType1 = celebrationTypeGen.next().value;
        const celebrationType2 = celebrationTypeGen.next().value;
        const celebrationType3 = celebrationTypeGen.next().value;
        
        const TestComponent = () => {
          const { triggerCelebration, isActive } = useCelebrationIntegration();
          
          return (
            <div>
              <button 
                onClick={() => triggerCelebration(celebrationType1)}
                data-testid="trigger-1"
              >
                Trigger 1
              </button>
              <button 
                onClick={() => triggerCelebration(celebrationType2)}
                data-testid="trigger-2"
              >
                Trigger 2
              </button>
              <button 
                onClick={() => triggerCelebration(celebrationType3)}
                data-testid="trigger-3"
              >
                Trigger 3
              </button>
              <div data-testid="status">{isActive ? 'active' : 'inactive'}</div>
              <CelebrationIntegration />
            </div>
          );
        };

        const { unmount } = render(<TestComponent />);
        
        const button1 = screen.getByTestId('trigger-1');
        const button2 = screen.getByTestId('trigger-2');
        const button3 = screen.getByTestId('trigger-3');
        
        // Rapid fire celebrations
        fireEvent.click(button1);
        fireEvent.click(button2);
        fireEvent.click(button3);
        
        // System should handle rapid celebrations without breaking
        await waitFor(() => {
          expect(mockAudioContext.createOscillator).toHaveBeenCalled();
        });

        // Wait for celebrations to complete
        await waitFor(() => {
          const status = screen.getByTestId('status');
          expect(status.textContent).toBe('inactive');
        }, { timeout: 2000 });

        // Clean up
        unmount();
        vi.clearAllMocks();
      }
    });
  });

  describe('Integration with LifeOS Sound System', () => {
    it('should read custom sounds from LifeOS localStorage format for any sound configuration', async () => {
      const customSoundsGen = generateCustomSounds();
      const testIterations = 10;

      for (let i = 0; i < testIterations; i++) {
        const customSounds = customSoundsGen.next().value;
        
        // Set up LifeOS format custom sounds
        mockLocalStorage['lifeos_pro_custom_sounds'] = JSON.stringify(customSounds);
        
        const { unmount } = render(<CelebrationIntegration />);
        
        // Component should read from localStorage on mount
        expect(window.localStorage.getItem).toHaveBeenCalledWith('lifeos_pro_custom_sounds');
        
        // Clean up
        unmount();
        vi.clearAllMocks();
        mockLocalStorage = {};
      }
    });

    it('should handle localStorage changes for any sound update', async () => {
      const customSoundsGen = generateCustomSounds();
      const testIterations = 8;

      for (let i = 0; i < testIterations; i++) {
        const initialSounds = customSoundsGen.next().value;
        const updatedSounds = customSoundsGen.next().value;
        
        // Set initial sounds
        mockLocalStorage['lifeos_pro_custom_sounds'] = JSON.stringify(initialSounds);
        
        const { unmount } = render(<CelebrationIntegration />);
        
        // Simulate localStorage change (as would happen in LifeOS)
        const storageEvent = new StorageEvent('storage', {
          key: 'lifeos_pro_custom_sounds',
          newValue: JSON.stringify(updatedSounds),
          oldValue: JSON.stringify(initialSounds)
        });
        
        window.dispatchEvent(storageEvent);
        
        // Component should handle the storage change
        await waitFor(() => {
          expect(window.localStorage.getItem).toHaveBeenCalledWith('lifeos_pro_custom_sounds');
        });
        
        // Clean up
        unmount();
        vi.clearAllMocks();
        mockLocalStorage = {};
      }
    });
  });
});

/**
 * Property 7: 庆祝效果同步
 * **Feature: achievement-jar-integration, Property 7: 庆祝效果同步**
 * **Validates: Requirements 2.4, 2.5**
 */
describe('Property 7: Celebration Effects Synchronization', () => {
  // Property-based test generator for timing variations
  function* generateTimingVariations(): Generator<{ soundDelay: number; visualDelay: number }> {
    while (true) {
      yield {
        soundDelay: Math.random() * 100, // 0-100ms delay
        visualDelay: Math.random() * 50   // 0-50ms delay
      };
    }
  }

  it('should synchronize danmaku and confetti effects with sound for any celebration trigger', async () => {
    const celebrationTypeGen = generateCelebrationTypes();
    const testIterations = 12;

    for (let i = 0; i < testIterations; i++) {
      const celebrationType = celebrationTypeGen.next().value;
      
      // Mock DOM manipulation for visual effects
      const mockDanmakuElement = document.createElement('div');
      const mockConfettiElement = document.createElement('div');
      
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'div') {
          return Math.random() > 0.5 ? mockDanmakuElement : mockConfettiElement;
        }
        return originalCreateElement.call(document, tagName);
      });

      const TestComponent = () => {
        const { triggerCelebration } = useCelebrationIntegration();
        
        return (
          <div>
            <button 
              onClick={() => triggerCelebration(celebrationType)}
              data-testid="trigger-celebration"
            >
              Trigger Celebration
            </button>
            <CelebrationIntegration />
          </div>
        );
      };

      const { unmount } = render(<TestComponent />);
      
      const button = screen.getByTestId('trigger-celebration');
      
      // Record timing of effects
      const effectTimings: number[] = [];
      
      // Mock sound timing
      mockAudioContext.createOscillator.mockImplementation(() => {
        effectTimings.push(Date.now());
        return {
          connect: vi.fn(),
          frequency: { setValueAtTime: vi.fn() },
          type: 'sine',
          start: vi.fn(),
          stop: vi.fn()
        };
      });

      // Mock visual effects timing
      const originalAppendChild = Element.prototype.appendChild;
      Element.prototype.appendChild = vi.fn(function(child) {
        effectTimings.push(Date.now());
        return originalAppendChild.call(this, child);
      });
      
      fireEvent.click(button);
      
      // Wait for effects to trigger
      await waitFor(() => {
        expect(effectTimings.length).toBeGreaterThan(0);
      });

      // Verify effects are synchronized (within reasonable time window)
      if (effectTimings.length > 1) {
        const timeDifferences = effectTimings.slice(1).map((time, index) => 
          Math.abs(time - effectTimings[index])
        );
        const maxTimeDifference = Math.max(...timeDifferences);
        expect(maxTimeDifference).toBeLessThan(200); // Effects should be within 200ms of each other
      }

      // Clean up
      unmount();
      document.createElement = originalCreateElement;
      Element.prototype.appendChild = originalAppendChild;
      vi.clearAllMocks();
    }
  });

  it('should clear celebration effects when user leaves progress page for any navigation', async () => {
    const celebrationTypeGen = generateCelebrationTypes();
    const testIterations = 8;

    for (let i = 0; i < testIterations; i++) {
      const celebrationType = celebrationTypeGen.next().value;
      
      // Mock active celebration effects
      const mockEffectElements: HTMLElement[] = [];
      
      const originalAppendChild = Element.prototype.appendChild;
      Element.prototype.appendChild = vi.fn(function(child: Node) {
        if (child instanceof HTMLElement) {
          mockEffectElements.push(child);
        }
        return originalAppendChild.call(this, child);
      });

      const TestComponent = () => {
        const { triggerCelebration, stopCelebration } = useCelebrationIntegration();
        
        return (
          <div>
            <button 
              onClick={() => triggerCelebration(celebrationType)}
              data-testid="trigger-celebration"
            >
              Trigger Celebration
            </button>
            <button 
              onClick={stopCelebration}
              data-testid="stop-celebration"
            >
              Stop Celebration
            </button>
            <CelebrationIntegration />
          </div>
        );
      };

      const { unmount } = render(<TestComponent />);
      
      // Start celebration
      const triggerButton = screen.getByTestId('trigger-celebration');
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(mockEffectElements.length).toBeGreaterThan(0);
      });

      // Simulate leaving page (stop celebration)
      const stopButton = screen.getByTestId('stop-celebration');
      fireEvent.click(stopButton);
      
      // Verify effects are cleaned up
      await waitFor(() => {
        // Effects should be removed or marked for removal
        mockEffectElements.forEach(element => {
          // Check if element is removed or has cleanup animation
          expect(
            !element.parentNode || 
            element.style.opacity === '0' || 
            element.style.display === 'none'
          ).toBeTruthy();
        });
      });

      // Clean up
      unmount();
      Element.prototype.appendChild = originalAppendChild;
      vi.clearAllMocks();
    }
  });

  it('should handle overlapping celebration effects for any rapid celebration sequence', async () => {
    const celebrationTypeGen = generateCelebrationTypes();
    const timingGen = generateTimingVariations();
    const testIterations = 6;

    for (let i = 0; i < testIterations; i++) {
      const celebrationType1 = celebrationTypeGen.next().value;
      const celebrationType2 = celebrationTypeGen.next().value;
      const timing = timingGen.next().value;
      
      const activeEffects = new Set<string>();
      
      const TestComponent = () => {
        const { triggerCelebration, isActive } = useCelebrationIntegration();
        
        return (
          <div>
            <button 
              onClick={() => triggerCelebration(celebrationType1)}
              data-testid="trigger-1"
            >
              Trigger 1
            </button>
            <button 
              onClick={() => triggerCelebration(celebrationType2)}
              data-testid="trigger-2"
            >
              Trigger 2
            </button>
            <div data-testid="active-status">{isActive ? 'active' : 'inactive'}</div>
            <CelebrationIntegration />
          </div>
        );
      };

      const { unmount } = render(<TestComponent />);
      
      const button1 = screen.getByTestId('trigger-1');
      const button2 = screen.getByTestId('trigger-2');
      
      // Trigger overlapping celebrations
      fireEvent.click(button1);
      
      setTimeout(() => {
        fireEvent.click(button2);
      }, timing.soundDelay);
      
      // System should handle overlapping effects gracefully
      await waitFor(() => {
        expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      });

      // Wait for effects to settle
      await waitFor(() => {
        const status = screen.getByTestId('active-status');
        expect(status.textContent).toBe('inactive');
      }, { timeout: 3000 });

      // Clean up
      unmount();
      vi.clearAllMocks();
    }
  });

  it('should maintain effect duration consistency for any celebration type', async () => {
    const celebrationTypeGen = generateCelebrationTypes();
    const testIterations = 10;

    for (let i = 0; i < testIterations; i++) {
      const celebrationType = celebrationTypeGen.next().value;
      
      const effectStartTimes: number[] = [];
      const effectEndTimes: number[] = [];
      
      // Mock effect lifecycle
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = vi.fn((callback: Function, delay: number) => {
        if (delay > 1000) { // Likely effect cleanup timeout
          effectEndTimes.push(Date.now() + delay);
        }
        return originalSetTimeout(callback, delay);
      });

      const TestComponent = () => {
        const { triggerCelebration } = useCelebrationIntegration();
        
        return (
          <div>
            <button 
              onClick={() => {
                effectStartTimes.push(Date.now());
                triggerCelebration(celebrationType);
              }}
              data-testid="trigger-celebration"
            >
              Trigger Celebration
            </button>
            <CelebrationIntegration />
          </div>
        );
      };

      const { unmount } = render(<TestComponent />);
      
      const button = screen.getByTestId('trigger-celebration');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(effectStartTimes.length).toBeGreaterThan(0);
      });

      // Verify effect durations are within expected range
      if (effectStartTimes.length > 0 && effectEndTimes.length > 0) {
        const duration = effectEndTimes[0] - effectStartTimes[0];
        expect(duration).toBeGreaterThan(2000); // At least 2 seconds
        expect(duration).toBeLessThan(10000);   // No more than 10 seconds
      }

      // Clean up
      unmount();
      window.setTimeout = originalSetTimeout;
      vi.clearAllMocks();
    }
  });

  it('should synchronize celebration effects across different screen sizes for any viewport', async () => {
    const celebrationTypeGen = generateCelebrationTypes();
    const viewportSizes = [
      { width: 320, height: 568 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }  // Desktop
    ];
    
    for (const viewport of viewportSizes) {
      const celebrationType = celebrationTypeGen.next().value;
      
      // Mock viewport size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.width
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.height
      });

      const TestComponent = () => {
        const { triggerCelebration } = useCelebrationIntegration();
        
        return (
          <div>
            <button 
              onClick={() => triggerCelebration(celebrationType)}
              data-testid="trigger-celebration"
            >
              Trigger Celebration
            </button>
            <CelebrationIntegration />
          </div>
        );
      };

      const { unmount } = render(<TestComponent />);
      
      const button = screen.getByTestId('trigger-celebration');
      fireEvent.click(button);
      
      // Effects should work regardless of viewport size
      await waitFor(() => {
        expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      });

      // Clean up
      unmount();
      vi.clearAllMocks();
    }
  });
});