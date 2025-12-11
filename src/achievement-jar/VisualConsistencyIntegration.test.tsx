/**
 * Visual Consistency Integration Property Tests
 * Tests for Requirements 3.4, 3.5
 * 
 * Property 8: Visual Consistency Maintenance
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { 
  VisualConsistencyIntegration, 
  ThemeDetector, 
  useVisualConsistency 
} from './VisualConsistencyIntegration';

// Mock window and document
const mockWindow = () => {
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    writable: true
  });
  
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    writable: true
  });
};

const mockDocument = () => {
  const mockElement = {
    style: {
      setProperty: vi.fn(),
      getPropertyValue: vi.fn().mockReturnValue(''),
    }
  };

  Object.defineProperty(document, 'documentElement', {
    value: mockElement,
    writable: true
  });

  Object.defineProperty(window, 'getComputedStyle', {
    value: vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue(''),
      backgroundColor: '#ffffff',
      color: '#64748b'
    }),
    writable: true
  });

  Object.defineProperty(document, 'querySelectorAll', {
    value: vi.fn().mockReturnValue([]),
    writable: true
  });

  Object.defineProperty(document, 'body', {
    value: {
      style: {
        backgroundColor: '#ffffff'
      }
    },
    writable: true
  });
};

const mockMutationObserver = () => {
  global.MutationObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
  }));
};

describe('Visual Consistency Integration Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindow();
    mockDocument();
    mockMutationObserver();
    
    // Reset ThemeDetector singleton
    (ThemeDetector as any).instance = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 8: Visual Consistency Maintenance
   * Verifies Requirements 3.4, 3.5
   */
  describe('Property 8: Visual Consistency Maintenance', () => {
    test('should detect and apply main app theme correctly', async () => {
      // Mock CSS custom properties
      const mockGetPropertyValue = vi.fn()
        .mockReturnValueOnce('#667eea')  // --primary-color
        .mockReturnValueOnce('#764ba2')  // --secondary-color
        .mockReturnValueOnce('#f093fb')  // --accent-color
        .mockReturnValueOnce('#ffffff')  // --bg-color
        .mockReturnValueOnce('#64748b'); // --text-color

      (window.getComputedStyle as any).mockReturnValue({
        getPropertyValue: mockGetPropertyValue
      });

      const detector = ThemeDetector.getInstance();
      const theme = detector.detectMainAppTheme();

      expect(theme.primaryColor).toBe('#667eea');
      expect(theme.secondaryColor).toBe('#764ba2');
      expect(theme.accentColor).toBe('#f093fb');
      expect(theme.backgroundColor).toBe('#ffffff');
      expect(theme.textColor).toBe('#64748b');
    });

    test('should apply theme to CSS custom properties', async () => {
      const mockSetProperty = vi.fn();
      (document.documentElement.style.setProperty as any) = mockSetProperty;

      const TestComponent = () => (
        <VisualConsistencyIntegration>
          <div data-testid="themed-content">Content</div>
        </VisualConsistencyIntegration>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('themed-content')).toBeInTheDocument();
      });

      // Verify CSS custom properties were set
      expect(mockSetProperty).toHaveBeenCalledWith('--aj-primary-color', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--aj-secondary-color', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--aj-accent-color', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--aj-background-color', expect.any(String));
      expect(mockSetProperty).toHaveBeenCalledWith('--aj-text-color', expect.any(String));
    });

    test('should maintain consistent styling across components', async () => {
      const customTheme = {
        primaryColor: '#ff6b6b',
        secondaryColor: '#4ecdc4',
        accentColor: '#45b7d1',
        backgroundColor: '#f8f9fa',
        textColor: '#2c3e50',
        borderColor: '#e9ecef',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        gradientDirection: '135deg'
      };

      const TestComponent = () => (
        <VisualConsistencyIntegration mainAppTheme={customTheme}>
          <div data-testid="consistent-container" className="achievement-jar-container">
            <button data-testid="celebration-button" className="celebration-button">
              Celebrate
            </button>
            <div data-testid="metric-card" className="metric-card">
              Metric
            </div>
          </div>
        </VisualConsistencyIntegration>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('consistent-container')).toBeInTheDocument();
      });

      const container = screen.getByTestId('consistent-container');
      expect(container).toHaveClass('achievement-jar-visual-consistency');
    });

    test('should adapt to different screen sizes', async () => {
      // Test mobile
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });

      const TestComponent = () => (
        <VisualConsistencyIntegration>
          <div data-testid="responsive-content">Mobile Content</div>
        </VisualConsistencyIntegration>
      );

      const { rerender } = render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('responsive-content')).toBeInTheDocument();
      });

      // Test desktop
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
      
      rerender(
        <VisualConsistencyIntegration>
          <div data-testid="responsive-content">Desktop Content</div>
        </VisualConsistencyIntegration>
      );

      await waitFor(() => {
        expect(screen.getByTestId('responsive-content')).toBeInTheDocument();
      });
    });

    test('should handle theme changes dynamically', async () => {
      const TestComponent = () => {
        const { theme, isThemeReady } = useVisualConsistency();
        
        return (
          <div data-testid="theme-info">
            {isThemeReady ? JSON.stringify(theme) : 'Loading...'}
          </div>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        const themeInfo = screen.getByTestId('theme-info');
        expect(themeInfo).not.toHaveTextContent('Loading...');
      });

      const themeData = JSON.parse(screen.getByTestId('theme-info').textContent || '{}');
      expect(themeData).toHaveProperty('primaryColor');
      expect(themeData).toHaveProperty('secondaryColor');
      expect(themeData).toHaveProperty('backgroundColor');
    });

    test('should provide fallback theme when detection fails', () => {
      // Mock failed detection
      (window.getComputedStyle as any).mockImplementation(() => {
        throw new Error('Detection failed');
      });

      const detector = ThemeDetector.getInstance();
      const theme = detector.detectMainAppTheme();

      // Should return default theme
      expect(theme.primaryColor).toBe('#667eea');
      expect(theme.secondaryColor).toBe('#764ba2');
      expect(theme.backgroundColor).toBe('#ffffff');
    });

    test('should detect theme from DOM elements when CSS properties unavailable', () => {
      // Mock elements with styles
      const mockNavElement = {
        style: {},
        getAttribute: vi.fn(),
        classList: { contains: vi.fn() }
      };

      const mockButtonElement = {
        style: {},
        getAttribute: vi.fn(),
        classList: { contains: vi.fn() }
      };

      (document.querySelectorAll as any)
        .mockReturnValueOnce([mockNavElement])  // nav elements
        .mockReturnValueOnce([mockButtonElement]); // button elements

      (window.getComputedStyle as any)
        .mockReturnValueOnce({
          getPropertyValue: vi.fn().mockReturnValue(''), // CSS properties not available
          backgroundColor: '#667eea',
          color: '#ffffff'
        })
        .mockReturnValueOnce({
          backgroundColor: '#f093fb',
          color: '#333333'
        })
        .mockReturnValueOnce({
          backgroundColor: '#f8f9fa'
        });

      const detector = ThemeDetector.getInstance();
      const theme = detector.detectMainAppTheme();

      expect(typeof theme.primaryColor).toBe('string');
      expect(typeof theme.backgroundColor).toBe('string');
      expect(typeof theme.textColor).toBe('string');
    });

    test('should support reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
        writable: true
      });

      const TestComponent = () => (
        <VisualConsistencyIntegration enableAnimations={false} enableTransitions={false}>
          <div data-testid="reduced-motion-content">Content</div>
        </VisualConsistencyIntegration>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('reduced-motion-content')).toBeInTheDocument();
      });

      // Verify reduced motion CSS properties were set
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--aj-transition-duration', '0s');
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--aj-animation-duration', '0s');
    });

    test('should handle color manipulation utilities correctly', () => {
      const detector = ThemeDetector.getInstance();
      
      // Test private methods through public interface
      const theme = detector.detectMainAppTheme();
      
      // Verify theme has all required properties
      expect(theme).toHaveProperty('primaryColor');
      expect(theme).toHaveProperty('secondaryColor');
      expect(theme).toHaveProperty('accentColor');
      expect(theme).toHaveProperty('backgroundColor');
      expect(theme).toHaveProperty('textColor');
      expect(theme).toHaveProperty('borderColor');
      expect(theme).toHaveProperty('shadowColor');
      expect(theme).toHaveProperty('gradientDirection');

      // Verify shadow color has alpha
      expect(theme.shadowColor).toMatch(/rgba?\(/);
    });

    test('should watch for theme changes', async () => {
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        takeRecords: vi.fn()
      };

      (global.MutationObserver as any).mockImplementation((callback) => {
        // Simulate theme change
        setTimeout(() => {
          callback([{ type: 'attributes', attributeName: 'style' }]);
        }, 100);
        return mockObserver;
      });

      const detector = ThemeDetector.getInstance();
      const mockCallback = vi.fn();
      
      const unsubscribe = detector.subscribe(mockCallback);
      detector.startWatching();

      // Wait for theme change simulation
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockObserver.observe).toHaveBeenCalledWith(
        document.documentElement,
        expect.objectContaining({
          attributes: true,
          attributeFilter: ['style', 'class']
        })
      );

      unsubscribe();
    });
  });

  /**
   * Integration Tests
   */
  describe('Visual Consistency Integration', () => {
    test('should integrate with Achievement Jar components seamlessly', async () => {
      const TestAchievementJar = () => (
        <VisualConsistencyIntegration>
          <div className="achievement-jar-container" data-testid="jar-container">
            <div className="clay-balls">Clay Balls</div>
            <div className="metrics-tray">
              <div className="metric-card">Metric 1</div>
              <div className="metric-card">Metric 2</div>
            </div>
            <div className="interaction-dock">
              <button className="celebration-button">🎉</button>
              <button className="celebration-button">👏</button>
            </div>
          </div>
        </VisualConsistencyIntegration>
      );

      render(<TestAchievementJar />);

      await waitFor(() => {
        expect(screen.getByTestId('jar-container')).toBeInTheDocument();
      });

      const container = screen.getByTestId('jar-container');
      expect(container.parentElement).toHaveClass('achievement-jar-visual-consistency');
    });

    test('should maintain performance with theme updates', async () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        const { theme } = useVisualConsistency();
        
        return (
          <VisualConsistencyIntegration>
            <div data-testid="performance-test">
              Render count: {renderCount}, Theme: {theme?.primaryColor || 'loading'}
            </div>
          </VisualConsistencyIntegration>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('performance-test')).toBeInTheDocument();
      });

      // Should not cause excessive re-renders
      expect(renderCount).toBeLessThan(5);
    });

    test('should handle server-side rendering gracefully', () => {
      // Mock SSR environment
      const originalWindow = global.window;
      delete (global as any).window;

      const TestComponent = () => (
        <VisualConsistencyIntegration>
          <div data-testid="ssr-content">SSR Content</div>
        </VisualConsistencyIntegration>
      );

      expect(() => render(<TestComponent />)).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });
});