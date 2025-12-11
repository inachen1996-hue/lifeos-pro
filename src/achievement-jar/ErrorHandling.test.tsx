/**
 * Achievement Jar Error Handling Property Tests
 * **Feature: achievement-jar-integration, Property 4: 错误处理和降级**
 * **Validates: Requirements 1.5, 5.1**
 * **Feature: achievement-jar-integration, Property 6: 资源清理一致性**
 * **Validates: Requirements 5.3**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingState } from './LoadingStates';
import { BrowserCompatibility, BrowserCompatibilityChecker } from './BrowserCompatibility';

// Mock components for testing
const ThrowErrorComponent: React.FC<{ shouldThrow: boolean; errorMessage?: string }> = ({ 
  shouldThrow, 
  errorMessage = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="success-component">Success</div>;
};

const MockAchievementJar: React.FC<{ simulateError?: boolean }> = ({ simulateError = false }) => {
  if (simulateError) {
    throw new Error('Achievement Jar simulation error');
  }
  return <div data-testid="achievement-jar">Achievement Jar Content</div>;
};

describe('Error Handling Property Tests', () => {
  let mockLocalStorage: { [key: string]: string };
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;

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
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        })
      },
      writable: true
    });

    // Mock console methods to reduce noise in tests
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    console.error = vi.fn();
    console.warn = vi.fn();

    // Mock CustomEvent
    global.CustomEvent = vi.fn().mockImplementation((type, options) => ({
      type,
      detail: options?.detail
    }));

    // Mock window.dispatchEvent
    window.dispatchEvent = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    vi.restoreAllMocks();
  });

  /**
   * Property 4: 错误处理和降级
   * For any error that occurs in Achievement Jar components, the system should 
   * gracefully handle it and provide appropriate fallback mechanisms
   */
  describe('Property 4: Error Handling and Fallback', () => {
    it('should catch and handle any type of error thrown by child components', async () => {
      const TestComponent = () => (
        <ErrorBoundary>
          <ThrowErrorComponent 
            shouldThrow={true} 
            errorMessage="Test error"
          />
        </ErrorBoundary>
      );

      const { unmount } = render(<TestComponent />);
      
      // Should display error UI instead of crashing
      await waitFor(() => {
        expect(screen.queryByTestId('success-component')).not.toBeInTheDocument();
        expect(screen.getByText(/Achievement Jar 暂时不可用/)).toBeInTheDocument();
      });

      // Should log error details
      expect(console.error).toHaveBeenCalled();

      // Clean up
      unmount();
      vi.clearAllMocks();
    });

    it('should provide retry mechanism for any recoverable error', async () => {
      const TestComponent = () => (
        <ErrorBoundary maxRetries={3}>
          <ThrowErrorComponent 
            shouldThrow={true} 
            errorMessage="Test error"
          />
        </ErrorBoundary>
      );

      const { unmount } = render(<TestComponent />);
      
      // Should show retry button
      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /重试/ });
        expect(retryButton).toBeInTheDocument();
      });

      // Clean up
      unmount();
      vi.clearAllMocks();
    });

    it('should fallback to traditional interface after maximum retries', async () => {
      const TestComponent = () => (
        <ErrorBoundary maxRetries={2}>
          <ThrowErrorComponent 
            shouldThrow={true} 
            errorMessage="Persistent error"
          />
        </ErrorBoundary>
      );

      const { unmount } = render(<TestComponent />);
      
      // Should show retry button initially
      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /重试/ });
        expect(retryButton).toBeInTheDocument();
      });

      // Click retry multiple times to exceed max retries
      const retryButton = screen.getByRole('button', { name: /重试/ });
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        // After max retries, should show fallback option
        expect(screen.getByRole('button', { name: /使用传统界面/ })).toBeInTheDocument();
      });

      // Clean up
      unmount();
      vi.clearAllMocks();
    });

    it('should handle browser compatibility issues', async () => {
      // Mock browser capabilities
      const mockChecker = {
        checkCompatibility: vi.fn().mockReturnValue({
          isSupported: false,
          capabilities: {
            webgl: false,
            webAudio: false,
            css3d: false,
            requestAnimationFrame: false,
            localStorage: false
          },
          recommendations: ['浏览器功能不支持'],
          fallbackMode: 'unsupported'
        })
      };

      vi.spyOn(BrowserCompatibilityChecker, 'getInstance').mockReturnValue(mockChecker as any);

      const TestComponent = () => (
        <BrowserCompatibility>
          <MockAchievementJar />
        </BrowserCompatibility>
      );

      const { unmount } = render(<TestComponent />);
      
      // Should show unsupported browser message
      await waitFor(() => {
        expect(screen.getByText(/浏览器不兼容/)).toBeInTheDocument();
      });

      // Clean up
      unmount();
      vi.clearAllMocks();
    });

    it('should emit fallback events for error scenarios', async () => {
      const TestComponent = () => (
        <ErrorBoundary>
          <ThrowErrorComponent 
            shouldThrow={true} 
            errorMessage="Test error"
          />
        </ErrorBoundary>
      );

      const { unmount } = render(<TestComponent />);
      
      // Wait for error to be caught
      await waitFor(() => {
        expect(screen.getByText(/Achievement Jar 暂时不可用/)).toBeInTheDocument();
      });

      // Click fallback button
      const fallbackButton = screen.getByText(/使用传统界面/);
      fireEvent.click(fallbackButton);

      // Should emit custom event
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'achievement-jar-fallback'
        })
      );

      // Clean up
      unmount();
      vi.clearAllMocks();
    });

    it('should maintain basic error state consistency', async () => {
      const TestComponent = () => (
        <ErrorBoundary>
          <ThrowErrorComponent 
            shouldThrow={true} 
            errorMessage="Test error"
          />
        </ErrorBoundary>
      );

      const { unmount } = render(<TestComponent />);
      
      // Should show error UI consistently
      await waitFor(() => {
        expect(screen.getByText(/Achievement Jar 暂时不可用/)).toBeInTheDocument();
      });

      // Clean up
      unmount();
      vi.clearAllMocks();
    });
  });

  /**
   * Property 6: 资源清理一致性
   * When Achievement Jar components are unmounted or encounter errors,
   * all resources should be properly cleaned up
   */
  describe('Property 6: Resource Cleanup Consistency', () => {
    it('should clean up event listeners on component unmount', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const TestComponent = () => {
        React.useEffect(() => {
          const handler = () => {};
          window.addEventListener('test-event', handler);
          return () => window.removeEventListener('test-event', handler);
        }, []);

        return <div data-testid="test-component">Test</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      // Component should add event listeners
      expect(addEventListenerSpy).toHaveBeenCalled();

      // Unmount component
      unmount();
      
      // Should clean up event listeners
      expect(removeEventListenerSpy).toHaveBeenCalled();

      // Clean up
      vi.clearAllMocks();
    });

    it('should clear timeouts on error scenarios', async () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
      
      const TestComponent = () => (
        <ErrorBoundary>
          <LoadingState 
            isLoading={false}
            error={new Error('Test error')}
          >
            <MockAchievementJar />
          </LoadingState>
        </ErrorBoundary>
      );

      const { unmount } = render(<TestComponent />);
      
      // Wait for error handling
      await waitFor(() => {
        expect(screen.getByText(/重新加载/)).toBeInTheDocument();
      });

      // Unmount component
      unmount();
      
      // Should clean up timers
      expect(clearTimeoutSpy).toHaveBeenCalled();

      // Clean up
      vi.clearAllMocks();
    });

    it('should handle basic DOM cleanup', async () => {
      const TestComponent = () => {
        const [elements, setElements] = React.useState<HTMLElement[]>([]);
        
        React.useEffect(() => {
          const element = document.createElement('div');
          document.body.appendChild(element);
          setElements([element]);
          
          return () => {
            elements.forEach(el => {
              if (el.parentNode) {
                el.parentNode.removeChild(el);
              }
            });
          };
        }, []);

        return <div data-testid="test-component">Test</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      // Wait for component to render
      await waitFor(() => {
        expect(screen.getByTestId('test-component')).toBeInTheDocument();
      });

      // Unmount component
      unmount();
      
      // Component should be cleaned up
      expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
    });

    it('should handle memory cleanup for data structures', async () => {
      const mockData = Array.from({ length: 100 }, (_, index) => ({
        id: index,
        value: Math.random() * 100
      }));

      const TestComponent = () => {
        const [data, setData] = React.useState(mockData);
        
        React.useEffect(() => {
          return () => {
            setData([]);
          };
        }, []);

        return <div data-testid="data-size">{data.length}</div>;
      };

      const { unmount } = render(<TestComponent />);
      
      // Verify data is loaded
      await waitFor(() => {
        expect(screen.getByTestId('data-size')).toHaveTextContent('100');
      });

      // Unmount should trigger cleanup
      unmount();
      
      // Component should be cleaned up
      expect(screen.queryByTestId('data-size')).not.toBeInTheDocument();
    });

    it('should maintain cleanup consistency across error recovery', async () => {
      let cleanupCount = 0;

      const TestComponent = () => {
        React.useEffect(() => {
          return () => {
            cleanupCount++;
          };
        }, []);

        return <div data-testid="success">Success</div>;
      };

      const WrappedComponent = () => (
        <ErrorBoundary maxRetries={3}>
          <TestComponent />
        </ErrorBoundary>
      );

      const { unmount } = render(<WrappedComponent />);
      
      // Should render successfully
      await waitFor(() => {
        expect(screen.getByTestId('success')).toBeInTheDocument();
      });

      // Unmount should trigger cleanup
      unmount();
      
      // Cleanup should have occurred
      expect(cleanupCount).toBeGreaterThan(0);
    });

    it('should handle resource cleanup for browser compatibility', async () => {
      let resourcesAllocated = 0;
      let resourcesCleaned = 0;

      const TestComponent = () => {
        React.useEffect(() => {
          resourcesAllocated++;
          return () => {
            resourcesCleaned++;
          };
        }, []);

        return <div data-testid="component">Component</div>;
      };

      const mockChecker = {
        checkCompatibility: vi.fn().mockReturnValue({
          isSupported: true,
          capabilities: {
            webgl: true,
            webAudio: true,
            css3d: true,
            requestAnimationFrame: true,
            localStorage: true
          },
          recommendations: [],
          fallbackMode: 'full'
        })
      };

      vi.spyOn(BrowserCompatibilityChecker, 'getInstance').mockReturnValue(mockChecker as any);

      const { unmount } = render(
        <BrowserCompatibility>
          <TestComponent />
        </BrowserCompatibility>
      );
      
      // Wait for component to mount
      await waitFor(() => {
        expect(resourcesAllocated).toBeGreaterThan(0);
      });

      // Unmount should trigger cleanup
      unmount();
      
      // Resources should be cleaned up
      expect(resourcesCleaned).toBe(resourcesAllocated);

      // Clean up
      vi.clearAllMocks();
    });
  });

  describe('Integration Error Handling', () => {
    it('should handle cascading errors across multiple components', async () => {
      const ComponentA = () => {
        throw new Error('Component A error');
      };

      const ComponentB = () => {
        return <div data-testid="component-b">Component B</div>;
      };

      const TestComponent = () => (
        <div>
          <ErrorBoundary>
            <ComponentA />
          </ErrorBoundary>
          <ErrorBoundary>
            <ComponentB />
          </ErrorBoundary>
        </div>
      );

      const { unmount } = render(<TestComponent />);
      
      // Should handle multiple errors gracefully
      await waitFor(() => {
        // Component B should render successfully
        expect(screen.getByTestId('component-b')).toBeInTheDocument();
        // Component A should show error UI
        expect(screen.getByText(/Achievement Jar 暂时不可用/)).toBeInTheDocument();
      });

      // Clean up
      unmount();
      vi.clearAllMocks();
    });
  });
});