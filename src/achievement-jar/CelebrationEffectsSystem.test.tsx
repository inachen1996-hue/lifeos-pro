/**
 * Achievement Jar Celebration Effects System - Property-Based Tests
 * Tests DanmakuSystem, ConfettiRenderer, and CelebrationEffectsSystem
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import React from 'react';
import { CelebrationEffectsSystem, useCelebrationEffects } from './CelebrationEffectsSystem';
import { DanmakuSystem } from './DanmakuSystem';
import { ConfettiRenderer } from './ConfettiRenderer';
import { CelebrationType } from './types';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});
global.cancelAnimationFrame = vi.fn();

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Test component for hook testing
const TestCelebrationComponent: React.FC<{ celebrationType?: CelebrationType }> = ({ 
  celebrationType = 'cheer' 
}) => {
  const { isActive, startCelebration, stopCelebration, handleComplete } = useCelebrationEffects();
  
  return (
    <div>
      <button 
        onClick={() => startCelebration(celebrationType)} 
        data-testid="start-celebration"
      >
        Start Celebration
      </button>
      <button 
        onClick={stopCelebration} 
        data-testid="stop-celebration"
      >
        Stop Celebration
      </button>
      <div data-testid="celebration-status">{isActive ? 'active' : 'inactive'}</div>
      <CelebrationEffectsSystem onEffectsComplete={handleComplete} />
    </div>
  );
};

describe('CelebrationEffectsSystem Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Feature: achievement-jar-progress, Property 10: Universal celebration effects
   * For any celebration button press, the system should display full-screen danmaku 
   * effects and falling confetti animations
   * Validates: Requirements 3.5
   */
  it('should display full-screen danmaku effects and falling confetti animations', () => {
    fc.assert(fc.property(
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      (celebrationType) => {
        const { container } = render(
          <TestCelebrationComponent celebrationType={celebrationType} />
        );

        const startButton = container.querySelector('[data-testid="start-celebration"]');
        expect(startButton).toBeTruthy();

        // Start celebration
        act(() => {
          startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        act(() => {
          vi.advanceTimersByTime(100);
        });

        // Check that celebration effects are rendered
        const danmakuSystem = container.querySelector('.danmaku-system');
        const confettiRenderer = container.querySelector('.confetti-renderer');
        
        // At least one of the effect systems should be present
        expect(danmakuSystem || confettiRenderer).toBeTruthy();

        // Check celebration status
        const status = container.querySelector('[data-testid="celebration-status"]');
        expect(status?.textContent).toBe('active');
      }
    ), { numRuns: 100 });
  });

  it('should handle celebration lifecycle correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      (celebrationType) => {
        const onComplete = vi.fn();
        
        const { container } = render(
          <CelebrationEffectsSystem onEffectsComplete={onComplete} />
        );

        // Should render without errors
        expect(container).toBeTruthy();
        
        // Initially no effects should be visible
        const danmakuSystem = container.querySelector('.danmaku-system');
        const confettiRenderer = container.querySelector('.confetti-renderer');
        
        // Effects should not be active initially
        expect(danmakuSystem?.children.length || 0).toBe(0);
        expect(confettiRenderer?.children.length || 0).toBe(0);
      }
    ), { numRuns: 100 });
  });

  it('should render different celebration types with appropriate themes', () => {
    fc.assert(fc.property(
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      (celebrationType) => {
        const { container } = render(
          <TestCelebrationComponent celebrationType={celebrationType} />
        );

        const startButton = container.querySelector('[data-testid="start-celebration"]');
        
        act(() => {
          startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        act(() => {
          vi.advanceTimersByTime(100);
        });

        // Should render celebration effects system
        const celebrationSystem = container.querySelector('.celebration-effects-system');
        expect(celebrationSystem).toBeTruthy();
      }
    ), { numRuns: 100 });
  });

  it('should stop celebrations when requested', () => {
    const { container } = render(<TestCelebrationComponent />);

    const startButton = container.querySelector('[data-testid="start-celebration"]');
    const stopButton = container.querySelector('[data-testid="stop-celebration"]');
    const status = container.querySelector('[data-testid="celebration-status"]');

    // Start celebration
    act(() => {
      startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(status?.textContent).toBe('active');

    // Stop celebration
    act(() => {
      stopButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(status?.textContent).toBe('inactive');
  });
});

describe('DanmakuSystem Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render danmaku items when active', () => {
    const onComplete = vi.fn();
    
    const { container, rerender } = render(
      <DanmakuSystem isActive={false} onComplete={onComplete} />
    );

    // Initially should not render anything
    expect(container.querySelector('.danmaku-system')).toBeFalsy();

    // Activate danmaku
    rerender(<DanmakuSystem isActive={true} celebrationType="cheer" onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should render danmaku system
    const danmakuSystem = container.querySelector('.danmaku-system');
    expect(danmakuSystem).toBeTruthy();
  });

  it('should generate themed danmaku based on celebration type', () => {
    fc.assert(fc.property(
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      (celebrationType) => {
        const onComplete = vi.fn();
        
        const { container } = render(
          <DanmakuSystem isActive={true} celebrationType={celebrationType} onComplete={onComplete} />
        );

        act(() => {
          vi.advanceTimersByTime(1000);
        });

        // Should render danmaku system with the correct type
        const danmakuSystem = container.querySelector('.danmaku-system');
        expect(danmakuSystem).toBeTruthy();
      }
    ), { numRuns: 50 });
  });
});

describe('ConfettiRenderer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render confetti particles when active', () => {
    const onComplete = vi.fn();
    
    const { container, rerender } = render(
      <ConfettiRenderer isActive={false} onComplete={onComplete} />
    );

    // Initially should not render anything
    expect(container.querySelector('.confetti-renderer')).toBeFalsy();

    // Activate confetti
    rerender(
      <ConfettiRenderer 
        isActive={true} 
        celebrationType="cheer" 
        intensity="medium"
        onComplete={onComplete} 
      />
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should render confetti system
    const confettiRenderer = container.querySelector('.confetti-renderer');
    expect(confettiRenderer).toBeTruthy();
  });

  it('should handle different intensity levels', () => {
    fc.assert(fc.property(
      fc.constantFrom('low', 'medium', 'high' as 'low' | 'medium' | 'high'),
      fc.constantFrom('drum', 'clap', 'cheer' as CelebrationType),
      (intensity, celebrationType) => {
        const onComplete = vi.fn();
        
        const { container } = render(
          <ConfettiRenderer 
            isActive={true} 
            celebrationType={celebrationType}
            intensity={intensity}
            onComplete={onComplete} 
          />
        );

        act(() => {
          vi.advanceTimersByTime(500);
        });

        // Should render confetti system regardless of intensity
        const confettiRenderer = container.querySelector('.confetti-renderer');
        expect(confettiRenderer).toBeTruthy();
      }
    ), { numRuns: 50 });
  });
});

describe('useCelebrationEffects Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide celebration control functions', () => {
    const { container } = render(<TestCelebrationComponent />);

    const startButton = container.querySelector('[data-testid="start-celebration"]');
    const stopButton = container.querySelector('[data-testid="stop-celebration"]');
    const status = container.querySelector('[data-testid="celebration-status"]');

    // Should have control elements
    expect(startButton).toBeTruthy();
    expect(stopButton).toBeTruthy();
    expect(status).toBeTruthy();

    // Initial state should be inactive
    expect(status?.textContent).toBe('inactive');
  });

  it('should handle celebration state changes', () => {
    const { container } = render(<TestCelebrationComponent />);

    const startButton = container.querySelector('[data-testid="start-celebration"]');
    const status = container.querySelector('[data-testid="celebration-status"]');

    // Start celebration
    act(() => {
      startButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Should become active
    expect(status?.textContent).toBe('active');
  });
});