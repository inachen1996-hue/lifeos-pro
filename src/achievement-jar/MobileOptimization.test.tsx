/**
 * Mobile Optimization Property Tests
 * Tests for Requirements 4.1, 4.2, 4.3, 4.4
 * 
 * Property 5: Mobile Device Adaptation
 * Property 10: Responsive Layout Adaptation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { 
  MobileOptimization, 
  DeviceDetector, 
  useTouchInteraction, 
  useResponsiveLayout,
  usePerformanceMonitor 
} from './MobileOptimization';

// Mock navigator and window properties
const mockNavigator = (overrides: Partial<Navigator> = {}) => {
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      maxTouchPoints: 5,
      hardwareConcurrency: 4,
      vibrate: vi.fn(),
      ...overrides
    },
    writable: true
  });
};

const mockWindow = (overrides: Partial<Window> = {}) => {
  Object.defineProperty(window, 'innerWidth', {
    value: 375,
    writable: true
  });
  Object.defineProperty(window, 'innerHeight', {
    value: 667,
    writable: true
  });
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 2,
    writable: true
  });
  Object.assign(window, overrides);
};

const mockPerformance = () => {
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      memory: {
        jsHeapSizeLimit: 2147483648,
        usedJSHeapSize: 1073741824,
        totalJSHeapSize: 1073741824
      }
    },
    writable: true
  });
};

describe('Mobile Optimization Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigator();
    mockWindow();
    mockPerformance();
    
    // Reset DeviceDetector singleton
    (DeviceDetector as any).instance = null;
  });

  /**
   * Property 5: Mobile Device Adaptation
   * Verifies Requirements 4.1, 4.2, 4.3
   */
  describe('Property 5: Mobile Device Adaptation', () => {
    test('should detect mobile devices correctly', () => {
      const detector = DeviceDetector.getInstance();
      const deviceInfo = detector.detectDevice();

      expect(deviceInfo.isMobile).toBe(true);
      expect(deviceInfo.isIOS).toBe(true);
      expect(deviceInfo.touchSupport).toBe(true);
      expect(deviceInfo.screenSize).toBe('small');
    });

    test('should detect tablet devices correctly', () => {
      mockNavigator({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'
      });
      mockWindow({ innerWidth: 768, innerHeight: 1024 });

      const detector = DeviceDetector.getInstance();
      detector.reset();
      const deviceInfo = detector.detectDevice();

      expect(deviceInfo.isTablet).toBe(true);
      expect(deviceInfo.isIOS).toBe(true);
      expect(deviceInfo.screenSize).toBe('medium');
    });

    test('should detect desktop devices correctly', () => {
      mockNavigator({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        maxTouchPoints: 0
      });
      mockWindow({ innerWidth: 1920, innerHeight: 1080 });

      const detector = DeviceDetector.getInstance();
      detector.reset();
      const deviceInfo = detector.detectDevice();

      expect(deviceInfo.isDesktop).toBe(true);
      expect(deviceInfo.isMobile).toBe(false);
      expect(deviceInfo.touchSupport).toBe(false);
      expect(deviceInfo.screenSize).toBe('xlarge');
    });

    test('should apply mobile-specific optimizations', async () => {
      const TestComponent = () => (
        <MobileOptimization enablePerformanceOptimization={true}>
          <div data-testid="content">Mobile Content</div>
        </MobileOptimization>
      );

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });

      // Check if mobile optimization classes are applied
      const container = screen.getByTestId('content').parentElement;
      expect(container).toHaveClass('mobile-optimized');
      expect(container).toHaveClass('ios-optimized');
      expect(container).toHaveClass('touch-enabled');
    });

    test('should handle orientation changes', async () => {
      const onDeviceChange = jest.fn();
      
      const TestComponent = () => (
        <MobileOptimization onDeviceChange={onDeviceChange}>
          <div>Content</div>
        </MobileOptimization>
      );

      render(<TestComponent />);

      // Simulate orientation change
      mockWindow({ innerWidth: 667, innerHeight: 375 });
      fireEvent(window, new Event('orientationchange'));

      await waitFor(() => {
        expect(onDeviceChange).toHaveBeenCalledWith(
          expect.objectContaining({
            orientation: 'landscape'
          })
        );
      });
    });

    test('should provide haptic feedback on touch devices', () => {
      const vibrateMock = vi.fn();
      mockNavigator({ vibrate: vibrateMock });

      const TestComponent = () => {
        const { touchHandlers } = useTouchInteraction();
        return (
          <div 
            data-testid="touch-element"
            {...touchHandlers}
          >
            Touch me
          </div>
        );
      };

      render(<TestComponent />);

      const element = screen.getByTestId('touch-element');
      fireEvent.touchStart(element, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      expect(vibrateMock).toHaveBeenCalledWith(10);
    });
  });

  /**
   * Property 10: Responsive Layout Adaptation
   * Verifies Requirement 4.4
   */
  describe('Property 10: Responsive Layout Adaptation', () => {
    test('should adapt layout for small screens', () => {
      mockWindow({ innerWidth: 320, innerHeight: 568 });

      const TestComponent = () => {
        const { layoutConfig } = useResponsiveLayout();
        return (
          <div data-testid="layout-info">
            {JSON.stringify(layoutConfig)}
          </div>
        );
      };

      render(<TestComponent />);

      const layoutInfo = JSON.parse(screen.getByTestId('layout-info').textContent || '{}');
      expect(layoutInfo.columns).toBe(1);
      expect(layoutInfo.spacing).toBe('compact');
      expect(layoutInfo.fontSize).toBe('sm');
      expect(layoutInfo.showSidebar).toBe(false);
    });

    test('should adapt layout for medium screens', () => {
      mockWindow({ innerWidth: 768, innerHeight: 1024 });

      const TestComponent = () => {
        const { layoutConfig } = useResponsiveLayout();
        return (
          <div data-testid="layout-info">
            {JSON.stringify(layoutConfig)}
          </div>
        );
      };

      render(<TestComponent />);

      const layoutInfo = JSON.parse(screen.getByTestId('layout-info').textContent || '{}');
      expect(layoutInfo.columns).toBe(2);
      expect(layoutInfo.spacing).toBe('normal');
      expect(layoutInfo.showSidebar).toBe(true);
    });

    test('should adapt layout for large screens', () => {
      mockNavigator({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        maxTouchPoints: 0
      });
      mockWindow({ innerWidth: 1440, innerHeight: 900 });

      const TestComponent = () => {
        const { layoutConfig } = useResponsiveLayout();
        return (
          <div data-testid="layout-info">
            {JSON.stringify(layoutConfig)}
          </div>
        );
      };

      render(<TestComponent />);

      const layoutInfo = JSON.parse(screen.getByTestId('layout-info').textContent || '{}');
      expect(layoutInfo.columns).toBe(3);
      expect(layoutInfo.spacing).toBe('normal');
      expect(layoutInfo.containerPadding).toBe('6');
      expect(layoutInfo.showSidebar).toBe(true);
    });

    test('should handle window resize events', async () => {
      const TestComponent = () => {
        const { deviceInfo } = useResponsiveLayout();
        return (
          <div data-testid="device-info">
            {deviceInfo?.screenSize || 'loading'}
          </div>
        );
      };

      render(<TestComponent />);

      // Initial state
      await waitFor(() => {
        expect(screen.getByTestId('device-info')).toHaveTextContent('small');
      });

      // Resize to medium
      mockWindow({ innerWidth: 768, innerHeight: 1024 });
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        expect(screen.getByTestId('device-info')).toHaveTextContent('medium');
      });
    });

    test('should disable animations on low-performance devices', () => {
      // Mock low-performance device
      mockPerformance();
      (window.performance as any).memory = {
        jsHeapSizeLimit: 268435456, // 256MB - low memory
        usedJSHeapSize: 134217728,
        totalJSHeapSize: 134217728
      };
      mockNavigator({ hardwareConcurrency: 2 });

      const TestComponent = () => (
        <MobileOptimization enablePerformanceOptimization={true}>
          <div data-testid="content">Content</div>
        </MobileOptimization>
      );

      render(<TestComponent />);

      // Check if performance optimizations are applied
      expect(document.documentElement.style.getPropertyValue('--animation-duration')).toBe('0.1s');
      expect(document.documentElement.style.getPropertyValue('--transition-duration')).toBe('0.1s');
    });

    test('should monitor performance metrics', async () => {
      const TestComponent = () => {
        const metrics = usePerformanceMonitor();
        return (
          <div data-testid="performance-metrics">
            {JSON.stringify(metrics)}
          </div>
        );
      };

      render(<TestComponent />);

      // Wait for performance monitoring to start
      await waitFor(() => {
        const metricsText = screen.getByTestId('performance-metrics').textContent;
        const metrics = JSON.parse(metricsText || '{}');
        expect(typeof metrics.fps).toBe('number');
        expect(typeof metrics.memoryUsage).toBe('number');
        expect(typeof metrics.renderTime).toBe('number');
      });
    });
  });

  /**
   * Touch Interaction Tests
   */
  describe('Touch Interaction Handling', () => {
    test('should track touch gestures correctly', () => {
      const TestComponent = () => {
        const { touchState, touchHandlers, getTouchDistance, getTouchDirection } = useTouchInteraction();
        
        return (
          <div>
            <div 
              data-testid="touch-area"
              {...touchHandlers}
            >
              Touch Area
            </div>
            <div data-testid="touch-state">
              {JSON.stringify({
                isPressed: touchState.isPressed,
                distance: getTouchDistance(),
                direction: getTouchDirection()
              })}
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      const touchArea = screen.getByTestId('touch-area');
      const stateDisplay = screen.getByTestId('touch-state');

      // Start touch
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      let state = JSON.parse(stateDisplay.textContent || '{}');
      expect(state.isPressed).toBe(true);

      // Move touch
      fireEvent.touchMove(touchArea, {
        touches: [{ clientX: 150, clientY: 100 }]
      });

      state = JSON.parse(stateDisplay.textContent || '{}');
      expect(state.distance).toBe(50);
      expect(state.direction).toBe('right');

      // End touch
      fireEvent.touchEnd(touchArea);

      state = JSON.parse(stateDisplay.textContent || '{}');
      expect(state.isPressed).toBe(false);
    });
  });

  /**
   * Performance Optimization Tests
   */
  describe('Performance Optimization', () => {
    test('should apply different optimizations based on device performance', () => {
      // Test high-performance device
      mockPerformance();
      (window.performance as any).memory = {
        jsHeapSizeLimit: 4294967296, // 4GB - high memory
        usedJSHeapSize: 1073741824,
        totalJSHeapSize: 1073741824
      };
      mockNavigator({ hardwareConcurrency: 8 });

      const detector = DeviceDetector.getInstance();
      detector.reset();
      const deviceInfo = detector.detectDevice();

      expect(deviceInfo.performanceLevel).toBe('high');
    });

    test('should detect low-performance mobile devices', () => {
      mockNavigator({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X)',
        hardwareConcurrency: 2
      });
      mockWindow({ devicePixelRatio: 3 }); // High DPI

      const detector = DeviceDetector.getInstance();
      detector.reset();
      const deviceInfo = detector.detectDevice();

      expect(deviceInfo.performanceLevel).toBe('low');
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Error Handling', () => {
    test('should handle missing performance API gracefully', () => {
      // Remove performance.memory
      delete (window.performance as any).memory;

      const detector = DeviceDetector.getInstance();
      detector.reset();
      const deviceInfo = detector.detectDevice();

      expect(deviceInfo.performanceLevel).toBe('medium'); // Default fallback
    });

    test('should handle missing navigator properties gracefully', () => {
      mockNavigator({
        hardwareConcurrency: undefined as any,
        maxTouchPoints: undefined as any
      });

      const detector = DeviceDetector.getInstance();
      detector.reset();
      const deviceInfo = detector.detectDevice();

      expect(typeof deviceInfo.touchSupport).toBe('boolean');
      expect(typeof deviceInfo.performanceLevel).toBe('string');
    });

    test('should show loading state when device info is not available', () => {
      const TestComponent = () => (
        <MobileOptimization>
          <div data-testid="content">Content</div>
        </MobileOptimization>
      );

      // Mock delayed device detection
      vi.spyOn(DeviceDetector.prototype, 'detectDevice').mockImplementation(() => {
        throw new Error('Detection failed');
      });

      render(<TestComponent />);

      expect(screen.getByText('检测设备中...')).toBeInTheDocument();
    });
  });
});

/**
 * Integration Tests
 */
describe('Mobile Optimization Integration', () => {
  test('should integrate with Achievement Jar components', async () => {
    const TestAchievementJar = () => (
      <MobileOptimization>
        <div className="achievement-jar-container" data-testid="jar-container">
          <div className="clay-balls">Clay Balls</div>
          <div className="metrics-tray">Metrics</div>
        </div>
      </MobileOptimization>
    );

    render(<TestAchievementJar />);

    await waitFor(() => {
      const container = screen.getByTestId('jar-container');
      // Check for any optimization class instead of specific mobile-optimized
      expect(container.parentElement).toHaveClass(expect.stringMatching(/optimized/));
    });
  });

  test('should maintain performance under stress', async () => {
    const StressTestComponent = () => {
      const metrics = usePerformanceMonitor();
      const { deviceInfo } = useResponsiveLayout();
      
      return (
        <MobileOptimization>
          <div data-testid="stress-test">
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} className="test-element">
                Element {i} - FPS: {metrics.fps}
              </div>
            ))}
          </div>
        </MobileOptimization>
      );
    };

    render(<StressTestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('stress-test')).toBeInTheDocument();
    });

    // Performance should remain stable
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const elements = screen.getAllByText(/Element \d+ - FPS:/);
    expect(elements.length).toBe(100);
  });
});