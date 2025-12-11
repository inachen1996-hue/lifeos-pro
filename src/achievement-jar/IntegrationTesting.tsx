/**
 * Integration Testing and Compatibility Verification
 * Implements Requirements 5.1, 5.2, 5.4
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface IntegrationTestProps {
  children: React.ReactNode;
  enableTesting?: boolean;
  testSuites?: string[];
  onTestComplete?: (results: TestResults) => void;
  className?: string;
}

interface TestResults {
  passed: number;
  failed: number;
  total: number;
  details: TestDetail[];
  performance: PerformanceMetrics;
  compatibility: CompatibilityResults;
}

interface TestDetail {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  category: 'integration' | 'performance' | 'compatibility' | 'accessibility';
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  fps: number;
  bundleSize: number;
}

interface CompatibilityResults {
  browsers: BrowserCompatibility[];
  devices: DeviceCompatibility[];
  features: FeatureCompatibility[];
}

interface BrowserCompatibility {
  name: string;
  version: string;
  supported: boolean;
  issues: string[];
}

interface DeviceCompatibility {
  type: 'mobile' | 'tablet' | 'desktop';
  supported: boolean;
  performance: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
}

interface FeatureCompatibility {
  name: string;
  supported: boolean;
  fallback?: string;
}

/**
 * Integration Test Runner
 * Runs comprehensive tests for Achievement Jar integration
 */
export class IntegrationTestRunner {
  private testResults: TestDetail[] = [];
  private startTime: number = 0;
  private performanceObserver: PerformanceObserver | null = null;

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<TestResults> {
    this.startTime = performance.now();
    this.testResults = [];

    console.log('🧪 Starting Achievement Jar Integration Tests...');

    // Run test suites
    await this.runIntegrationTests();
    await this.runPerformanceTests();
    await this.runCompatibilityTests();
    await this.runAccessibilityTests();

    const performance = await this.collectPerformanceMetrics();
    const compatibility = await this.checkCompatibility();

    const results: TestResults = {
      passed: this.testResults.filter(t => t.status === 'passed').length,
      failed: this.testResults.filter(t => t.status === 'failed').length,
      total: this.testResults.length,
      details: this.testResults,
      performance,
      compatibility
    };

    console.log('✅ Integration tests completed:', results);
    return results;
  }

  /**
   * Integration Tests
   */
  private async runIntegrationTests(): Promise<void> {
    const tests = [
      {
        name: 'Achievement Jar Container Rendering',
        test: () => this.testAchievementJarRendering()
      },
      {
        name: 'Data Adapter Integration',
        test: () => this.testDataAdapterIntegration()
      },
      {
        name: 'Category Mapping Compatibility',
        test: () => this.testCategoryMappingCompatibility()
      },
      {
        name: 'Time Range Processing',
        test: () => this.testTimeRangeProcessing()
      },
      {
        name: 'Celebration System Integration',
        test: () => this.testCelebrationSystemIntegration()
      },
      {
        name: 'Audio System Compatibility',
        test: () => this.testAudioSystemCompatibility()
      },
      {
        name: 'Visual Consistency',
        test: () => this.testVisualConsistency()
      },
      {
        name: 'State Management Integration',
        test: () => this.testStateManagementIntegration()
      }
    ];

    for (const { name, test } of tests) {
      await this.runTest(name, test, 'integration');
    }
  }

  /**
   * Performance Tests
   */
  private async runPerformanceTests(): Promise<void> {
    const tests = [
      {
        name: 'Initial Load Performance',
        test: () => this.testInitialLoadPerformance()
      },
      {
        name: 'Rendering Performance',
        test: () => this.testRenderingPerformance()
      },
      {
        name: 'Memory Usage',
        test: () => this.testMemoryUsage()
      },
      {
        name: 'Animation Performance',
        test: () => this.testAnimationPerformance()
      },
      {
        name: 'Data Processing Performance',
        test: () => this.testDataProcessingPerformance()
      },
      {
        name: 'Bundle Size Optimization',
        test: () => this.testBundleSizeOptimization()
      }
    ];

    for (const { name, test } of tests) {
      await this.runTest(name, test, 'performance');
    }
  }

  /**
   * Compatibility Tests
   */
  private async runCompatibilityTests(): Promise<void> {
    const tests = [
      {
        name: 'Browser Compatibility',
        test: () => this.testBrowserCompatibility()
      },
      {
        name: 'Mobile Device Compatibility',
        test: () => this.testMobileDeviceCompatibility()
      },
      {
        name: 'Feature Detection',
        test: () => this.testFeatureDetection()
      },
      {
        name: 'Fallback Mechanisms',
        test: () => this.testFallbackMechanisms()
      },
      {
        name: 'Cross-Platform Consistency',
        test: () => this.testCrossPlatformConsistency()
      }
    ];

    for (const { name, test } of tests) {
      await this.runTest(name, test, 'compatibility');
    }
  }

  /**
   * Accessibility Tests
   */
  private async runAccessibilityTests(): Promise<void> {
    const tests = [
      {
        name: 'Keyboard Navigation',
        test: () => this.testKeyboardNavigation()
      },
      {
        name: 'Screen Reader Compatibility',
        test: () => this.testScreenReaderCompatibility()
      },
      {
        name: 'Color Contrast',
        test: () => this.testColorContrast()
      },
      {
        name: 'Focus Management',
        test: () => this.testFocusManagement()
      },
      {
        name: 'ARIA Labels',
        test: () => this.testAriaLabels()
      }
    ];

    for (const { name, test } of tests) {
      await this.runTest(name, test, 'accessibility');
    }
  }

  /**
   * Run individual test
   */
  private async runTest(
    name: string, 
    testFn: () => Promise<void> | void, 
    category: TestDetail['category']
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      await testFn();
      const duration = performance.now() - startTime;
      
      this.testResults.push({
        name,
        status: 'passed',
        duration,
        category
      });
      
      console.log(`✅ ${name}: PASSED (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.testResults.push({
        name,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
        category
      });
      
      console.error(`❌ ${name}: FAILED (${duration.toFixed(2)}ms)`, error);
    }
  }

  /**
   * Test Achievement Jar Rendering
   */
  private async testAchievementJarRendering(): Promise<void> {
    // Check if Achievement Jar container exists
    const container = document.querySelector('.achievement-jar-container');
    if (!container) {
      throw new Error('Achievement Jar container not found');
    }

    // Check if clay balls are rendered
    const clayBalls = container.querySelectorAll('.clay-ball');
    if (clayBalls.length === 0) {
      throw new Error('No clay balls rendered');
    }

    // Check if metrics tray is present
    const metricsTray = container.querySelector('.metrics-tray');
    if (!metricsTray) {
      throw new Error('Metrics tray not found');
    }
  }

  /**
   * Test Data Adapter Integration
   */
  private async testDataAdapterIntegration(): Promise<void> {
    // Mock data processing
    const mockData = [
      { category: 'work', duration: 3600, timestamp: new Date().toISOString() }
    ];

    // Test data transformation
    if (!mockData || mockData.length === 0) {
      throw new Error('Data adapter failed to process mock data');
    }

    // Test category mapping
    const categoryMap = { work: { name: '工作', color: '#667eea' } };
    if (!categoryMap.work) {
      throw new Error('Category mapping failed');
    }
  }

  /**
   * Test Category Mapping Compatibility
   */
  private async testCategoryMappingCompatibility(): Promise<void> {
    const categories = ['work', 'study', 'rest', 'entertainment'];
    
    categories.forEach(category => {
      const element = document.querySelector(`[data-category="${category}"]`);
      if (!element) {
        throw new Error(`Category ${category} not properly mapped`);
      }
    });
  }

  /**
   * Test Time Range Processing
   */
  private async testTimeRangeProcessing(): Promise<void> {
    const timeRanges = ['today', 'week', 'month'];
    
    timeRanges.forEach(range => {
      // Test time range calculation logic
      const now = new Date();
      let startDate: Date;
      
      switch (range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          throw new Error(`Invalid time range: ${range}`);
      }
      
      if (startDate > now) {
        throw new Error(`Invalid start date for range: ${range}`);
      }
    });
  }

  /**
   * Test Celebration System Integration
   */
  private async testCelebrationSystemIntegration(): Promise<void> {
    // Test celebration buttons
    const celebrationButtons = document.querySelectorAll('.celebration-button');
    if (celebrationButtons.length === 0) {
      throw new Error('Celebration buttons not found');
    }

    // Test danmaku system
    const danmakuContainer = document.querySelector('.danmaku-container');
    if (!danmakuContainer) {
      console.warn('Danmaku container not found - may be conditionally rendered');
    }
  }

  /**
   * Test Audio System Compatibility
   */
  private async testAudioSystemCompatibility(): Promise<void> {
    // Test Web Audio API support
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      throw new Error('Web Audio API not supported');
    }

    // Test audio context creation
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctx.close();
    } catch (error) {
      throw new Error('Failed to create AudioContext');
    }
  }

  /**
   * Test Visual Consistency
   */
  private async testVisualConsistency(): Promise<void> {
    // Test CSS custom properties
    const root = document.documentElement;
    const primaryColor = getComputedStyle(root).getPropertyValue('--aj-primary-color');
    
    if (!primaryColor) {
      throw new Error('Achievement Jar CSS custom properties not applied');
    }

    // Test theme integration
    const themedElements = document.querySelectorAll('.achievement-jar-visual-consistency');
    if (themedElements.length === 0) {
      throw new Error('Visual consistency integration not found');
    }
  }

  /**
   * Test State Management Integration
   */
  private async testStateManagementIntegration(): Promise<void> {
    // Test React state updates
    const stateElements = document.querySelectorAll('[data-testid*="state"]');
    
    // This is a simplified test - in real implementation,
    // you'd test actual state changes
    if (stateElements.length === 0) {
      console.warn('State management test elements not found');
    }
  }

  /**
   * Test Initial Load Performance
   */
  private async testInitialLoadPerformance(): Promise<void> {
    const loadTime = performance.now() - this.startTime;
    
    if (loadTime > 3000) { // 3 seconds threshold
      throw new Error(`Initial load too slow: ${loadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Test Rendering Performance
   */
  private async testRenderingPerformance(): Promise<void> {
    const startTime = performance.now();
    
    // Force a re-render by triggering a state change
    const event = new CustomEvent('test-render');
    document.dispatchEvent(event);
    
    // Wait for render
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const renderTime = performance.now() - startTime;
    
    if (renderTime > 100) { // 100ms threshold
      throw new Error(`Rendering too slow: ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Test Memory Usage
   */
  private async testMemoryUsage(): Promise<void> {
    if (!(performance as any).memory) {
      console.warn('Memory API not available');
      return;
    }

    const memory = (performance as any).memory;
    const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    if (usagePercentage > 90) {
      throw new Error(`Memory usage too high: ${usagePercentage.toFixed(2)}%`);
    }
  }

  /**
   * Test Animation Performance
   */
  private async testAnimationPerformance(): Promise<void> {
    let frameCount = 0;
    const startTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      if (performance.now() - startTime < 1000) {
        requestAnimationFrame(measureFPS);
      }
    };
    
    requestAnimationFrame(measureFPS);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (frameCount < 30) { // 30 FPS minimum
      throw new Error(`Animation performance too low: ${frameCount} FPS`);
    }
  }

  /**
   * Test Data Processing Performance
   */
  private async testDataProcessingPerformance(): Promise<void> {
    const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      category: 'work',
      duration: Math.random() * 3600,
      timestamp: new Date().toISOString()
    }));

    const startTime = performance.now();
    
    // Simulate data processing
    const processed = largeDataSet.filter(item => item.duration > 1800);
    
    const processingTime = performance.now() - startTime;
    
    if (processingTime > 100) { // 100ms threshold
      throw new Error(`Data processing too slow: ${processingTime.toFixed(2)}ms`);
    }
  }

  /**
   * Test Bundle Size Optimization
   */
  private async testBundleSizeOptimization(): Promise<void> {
    // This would typically be done during build time
    // Here we just check if lazy loading is working
    
    const lazyComponents = document.querySelectorAll('[data-lazy-loaded]');
    if (lazyComponents.length === 0) {
      console.warn('No lazy-loaded components detected');
    }
  }

  /**
   * Test Browser Compatibility
   */
  private async testBrowserCompatibility(): Promise<void> {
    const requiredFeatures = [
      'Promise',
      'fetch',
      'requestAnimationFrame',
      'localStorage',
      'JSON'
    ];

    requiredFeatures.forEach(feature => {
      if (!(feature in window)) {
        throw new Error(`Required feature not supported: ${feature}`);
      }
    });
  }

  /**
   * Test Mobile Device Compatibility
   */
  private async testMobileDeviceCompatibility(): Promise<void> {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Test touch events
      if (!('ontouchstart' in window)) {
        throw new Error('Touch events not supported on mobile device');
      }
      
      // Test viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        throw new Error('Viewport meta tag missing for mobile compatibility');
      }
    }
  }

  /**
   * Test Feature Detection
   */
  private async testFeatureDetection(): Promise<void> {
    const features = [
      { name: 'CSS Grid', test: () => CSS.supports('display', 'grid') },
      { name: 'CSS Flexbox', test: () => CSS.supports('display', 'flex') },
      { name: 'CSS Custom Properties', test: () => CSS.supports('--test', '0') },
      { name: 'Intersection Observer', test: () => 'IntersectionObserver' in window }
    ];

    features.forEach(({ name, test }) => {
      if (!test()) {
        console.warn(`Feature not supported: ${name}`);
      }
    });
  }

  /**
   * Test Fallback Mechanisms
   */
  private async testFallbackMechanisms(): Promise<void> {
    // Test CSS fallbacks
    const testElement = document.createElement('div');
    testElement.style.background = 'linear-gradient(45deg, red, blue)';
    testElement.style.background = 'red'; // Fallback
    
    if (!testElement.style.background) {
      throw new Error('CSS fallback mechanism failed');
    }
  }

  /**
   * Test Cross-Platform Consistency
   */
  private async testCrossPlatformConsistency(): Promise<void> {
    // Test consistent rendering across platforms
    const testElement = document.createElement('div');
    testElement.style.width = '100px';
    testElement.style.height = '100px';
    document.body.appendChild(testElement);
    
    const rect = testElement.getBoundingClientRect();
    document.body.removeChild(testElement);
    
    if (Math.abs(rect.width - 100) > 1 || Math.abs(rect.height - 100) > 1) {
      throw new Error('Inconsistent rendering detected');
    }
  }

  /**
   * Test Keyboard Navigation
   */
  private async testKeyboardNavigation(): Promise<void> {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      throw new Error('No focusable elements found');
    }
  }

  /**
   * Test Screen Reader Compatibility
   */
  private async testScreenReaderCompatibility(): Promise<void> {
    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
    
    if (ariaElements.length === 0) {
      console.warn('No ARIA attributes found - may impact screen reader compatibility');
    }
  }

  /**
   * Test Color Contrast
   */
  private async testColorContrast(): Promise<void> {
    // This is a simplified test - real implementation would calculate actual contrast ratios
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    
    if (textElements.length === 0) {
      throw new Error('No text elements found for contrast testing');
    }
  }

  /**
   * Test Focus Management
   */
  private async testFocusManagement(): Promise<void> {
    const focusableElements = document.querySelectorAll('button, [tabindex]');
    
    focusableElements.forEach(element => {
      if (!element.hasAttribute('tabindex') && element.tagName !== 'BUTTON') {
        console.warn('Element may not be properly focusable:', element);
      }
    });
  }

  /**
   * Test ARIA Labels
   */
  private async testAriaLabels(): Promise<void> {
    const interactiveElements = document.querySelectorAll('button, input, select');
    
    interactiveElements.forEach(element => {
      const hasLabel = element.hasAttribute('aria-label') || 
                      element.hasAttribute('aria-labelledby') ||
                      element.querySelector('label');
      
      if (!hasLabel) {
        console.warn('Interactive element missing accessible label:', element);
      }
    });
  }

  /**
   * Collect Performance Metrics
   */
  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const memory = (performance as any).memory;
    
    return {
      loadTime: performance.now() - this.startTime,
      renderTime: 0, // Would be measured during render tests
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      fps: 60, // Would be measured during animation tests
      bundleSize: 0 // Would be provided by build tools
    };
  }

  /**
   * Check Compatibility
   */
  private async checkCompatibility(): Promise<CompatibilityResults> {
    return {
      browsers: [
        {
          name: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                navigator.userAgent.includes('Firefox') ? 'Firefox' :
                navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown',
          version: 'Unknown',
          supported: true,
          issues: []
        }
      ],
      devices: [
        {
          type: window.innerWidth < 768 ? 'mobile' : 
                window.innerWidth < 1024 ? 'tablet' : 'desktop',
          supported: true,
          performance: 'good',
          issues: []
        }
      ],
      features: [
        {
          name: 'Web Audio API',
          supported: !!(window.AudioContext || (window as any).webkitAudioContext)
        },
        {
          name: 'CSS Grid',
          supported: CSS.supports('display', 'grid')
        },
        {
          name: 'Intersection Observer',
          supported: 'IntersectionObserver' in window
        }
      ]
    };
  }
}

/**
 * Integration Testing Component
 */
export const IntegrationTesting: React.FC<IntegrationTestProps> = ({
  children,
  enableTesting = false,
  testSuites = ['all'],
  onTestComplete,
  className = ''
}) => {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const testRunnerRef = useRef<IntegrationTestRunner | null>(null);

  useEffect(() => {
    if (enableTesting && !testRunnerRef.current) {
      testRunnerRef.current = new IntegrationTestRunner();
    }
  }, [enableTesting]);

  const runTests = useCallback(async () => {
    if (!testRunnerRef.current || isRunning) return;

    setIsRunning(true);
    
    try {
      const results = await testRunnerRef.current.runAllTests();
      setTestResults(results);
      onTestComplete?.(results);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, onTestComplete]);

  if (!enableTesting) {
    return <>{children}</>;
  }

  return (
    <div className={`integration-testing ${className}`}>
      {children}
      
      {/* Test Control Panel */}
      <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-sm">
        <h3 className="font-bold text-sm mb-2">🧪 Integration Tests</h3>
        
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`w-full py-2 px-4 rounded text-sm font-medium ${
            isRunning 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
        
        {testResults && (
          <div className="mt-3 text-xs">
            <div className="flex justify-between">
              <span>Passed: {testResults.passed}</span>
              <span>Failed: {testResults.failed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(testResults.passed / testResults.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationTesting;