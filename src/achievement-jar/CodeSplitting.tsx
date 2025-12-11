/**
 * Code Splitting and Lazy Loading for Achievement Jar
 * Implements Requirements 4.2, 5.2
 */

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { LoadingState } from './EmptyStateHandler';

// Lazy loaded components
const LazyAchievementJarContainer = lazy(() => 
  import('./AchievementJarContainer').then(module => ({ 
    default: module.AchievementJarContainer 
  }))
);

const LazyMetricsTray = lazy(() => 
  import('./MetricsTray').then(module => ({ 
    default: module.MetricsTray 
  }))
);

const LazyInteractionDock = lazy(() => 
  import('./InteractionDock').then(module => ({ 
    default: module.InteractionDock 
  }))
);

const LazyCelebrationEffectsSystem = lazy(() => 
  import('./CelebrationEffectsSystem').then(module => ({ 
    default: module.CelebrationEffectsSystem 
  }))
);

const LazyPhysicsEngine = lazy(() => 
  import('./PhysicsEngine').then(module => ({ 
    default: module.PhysicsEngine 
  }))
);

interface CodeSplittingProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  preloadComponents?: string[];
  fallback?: React.ComponentType;
  className?: string;
}

interface LazyComponentWrapperProps {
  componentName: string;
  children: React.ReactNode;
  fallback?: React.ComponentType;
  preload?: boolean;
}

/**
 * Component Preloader
 * Preloads components in the background for better UX
 */
export class ComponentPreloader {
  private static instance: ComponentPreloader;
  private preloadedComponents = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  static getInstance(): ComponentPreloader {
    if (!ComponentPreloader.instance) {
      ComponentPreloader.instance = new ComponentPreloader();
    }
    return ComponentPreloader.instance;
  }

  /**
   * Preload a component by name
   */
  async preloadComponent(componentName: string): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    if (this.preloadPromises.has(componentName)) {
      return this.preloadPromises.get(componentName);
    }

    let preloadPromise: Promise<any>;

    switch (componentName) {
      case 'AchievementJarContainer':
        preloadPromise = import('./AchievementJarContainer');
        break;
      case 'MetricsTray':
        preloadPromise = import('./MetricsTray');
        break;
      case 'InteractionDock':
        preloadPromise = import('./InteractionDock');
        break;
      case 'CelebrationEffectsSystem':
        preloadPromise = import('./CelebrationEffectsSystem');
        break;
      case 'PhysicsEngine':
        preloadPromise = import('./PhysicsEngine');
        break;
      case 'VisualConsistencyIntegration':
        preloadPromise = import('./VisualConsistencyIntegration');
        break;
      case 'MobileOptimization':
        preloadPromise = import('./MobileOptimization');
        break;
      default:
        console.warn(`Unknown component for preloading: ${componentName}`);
        return;
    }

    this.preloadPromises.set(componentName, preloadPromise);

    try {
      await preloadPromise;
      this.preloadedComponents.add(componentName);
      console.log(`✅ Preloaded component: ${componentName}`);
    } catch (error) {
      console.error(`❌ Failed to preload component ${componentName}:`, error);
    } finally {
      this.preloadPromises.delete(componentName);
    }
  }

  /**
   * Preload multiple components
   */
  async preloadComponents(componentNames: string[]): Promise<void> {
    const preloadPromises = componentNames.map(name => this.preloadComponent(name));
    await Promise.allSettled(preloadPromises);
  }

  /**
   * Check if component is preloaded
   */
  isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }

  /**
   * Get preload statistics
   */
  getStats() {
    return {
      preloadedCount: this.preloadedComponents.size,
      preloadedComponents: Array.from(this.preloadedComponents),
      pendingCount: this.preloadPromises.size,
      pendingComponents: Array.from(this.preloadPromises.keys())
    };
  }
}

/**
 * Intelligent Loading Strategy
 * Determines optimal loading strategy based on device and network conditions
 */
export class LoadingStrategy {
  private static instance: LoadingStrategy;
  
  static getInstance(): LoadingStrategy {
    if (!LoadingStrategy.instance) {
      LoadingStrategy.instance = new LoadingStrategy();
    }
    return LoadingStrategy.instance;
  }

  /**
   * Determine if lazy loading should be enabled
   */
  shouldUseLazyLoading(): boolean {
    if (typeof window === 'undefined') return false;

    // Check device performance
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memoryInfo = (performance as any).memory;
    
    let deviceScore = 0;
    
    // CPU score
    if (hardwareConcurrency >= 8) deviceScore += 3;
    else if (hardwareConcurrency >= 4) deviceScore += 2;
    else deviceScore += 1;
    
    // Memory score
    if (memoryInfo) {
      const totalMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024); // MB
      if (totalMemory > 2000) deviceScore += 3;
      else if (totalMemory > 1000) deviceScore += 2;
      else deviceScore += 1;
    } else {
      deviceScore += 2; // Default assumption
    }
    
    // Network score
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '4g') deviceScore += 3;
      else if (connection.effectiveType === '3g') deviceScore += 2;
      else deviceScore += 1;
    } else {
      deviceScore += 2; // Default assumption
    }

    // Use lazy loading for lower-end devices (score < 6)
    return deviceScore < 6;
  }

  /**
   * Get recommended preload components based on usage patterns
   */
  getRecommendedPreloads(): string[] {
    const baseComponents = ['AchievementJarContainer', 'MetricsTray'];
    
    // Add more components for higher-end devices
    if (!this.shouldUseLazyLoading()) {
      return [
        ...baseComponents,
        'InteractionDock',
        'CelebrationEffectsSystem',
        'VisualConsistencyIntegration'
      ];
    }
    
    return baseComponents;
  }

  /**
   * Get loading priority for components
   */
  getLoadingPriority(componentName: string): 'high' | 'medium' | 'low' {
    const priorities = {
      'AchievementJarContainer': 'high',
      'MetricsTray': 'high',
      'InteractionDock': 'medium',
      'CelebrationEffectsSystem': 'low',
      'PhysicsEngine': 'low',
      'VisualConsistencyIntegration': 'medium',
      'MobileOptimization': 'medium'
    } as const;

    return priorities[componentName as keyof typeof priorities] || 'low';
  }
}

/**
 * Lazy Component Wrapper
 * Wraps lazy components with intelligent loading and error handling
 */
export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  componentName,
  children,
  fallback: CustomFallback,
  preload = false
}) => {
  const [isPreloading, setIsPreloading] = useState(preload);
  const [preloadError, setPreloadError] = useState<Error | null>(null);

  useEffect(() => {
    if (preload) {
      const preloader = ComponentPreloader.getInstance();
      preloader.preloadComponent(componentName)
        .then(() => setIsPreloading(false))
        .catch(error => {
          setPreloadError(error);
          setIsPreloading(false);
        });
    }
  }, [componentName, preload]);

  const FallbackComponent = CustomFallback || (() => (
    <LoadingState message={`正在加载 ${componentName}...`} />
  ));

  if (preloadError) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#dc3545',
        background: '#f8d7da',
        borderRadius: '8px',
        border: '1px solid #f5c6cb'
      }}>
        <div>组件加载失败: {componentName}</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          {preloadError.message}
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<FallbackComponent />}>
      {children}
    </Suspense>
  );
};

/**
 * Code Splitting Provider
 * Main component that manages code splitting and lazy loading
 */
export const CodeSplittingProvider: React.FC<CodeSplittingProps> = ({
  children,
  enableLazyLoading,
  preloadComponents = [],
  fallback: CustomFallback,
  className = ''
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingStrategy] = useState(() => LoadingStrategy.getInstance());
  const [shouldLazyLoad, setShouldLazyLoad] = useState(false);

  // Initialize loading strategy
  useEffect(() => {
    const shouldUse = enableLazyLoading ?? loadingStrategy.shouldUseLazyLoading();
    setShouldLazyLoad(shouldUse);
    
    console.log('🚀 Code splitting initialized:', {
      lazyLoading: shouldUse,
      preloadComponents,
      strategy: loadingStrategy.getRecommendedPreloads()
    });
    
    setIsInitialized(true);
  }, [enableLazyLoading, loadingStrategy, preloadComponents]);

  // Preload components
  useEffect(() => {
    if (!isInitialized) return;

    const preloader = ComponentPreloader.getInstance();
    const componentsToPreload = preloadComponents.length > 0 
      ? preloadComponents 
      : loadingStrategy.getRecommendedPreloads();

    // Preload with priority-based delay
    componentsToPreload.forEach((componentName, index) => {
      const priority = loadingStrategy.getLoadingPriority(componentName);
      const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 200;
      
      setTimeout(() => {
        preloader.preloadComponent(componentName);
      }, delay * index);
    });
  }, [isInitialized, preloadComponents, loadingStrategy]);

  if (!isInitialized) {
    const FallbackComponent = CustomFallback || LoadingState;
    return <FallbackComponent message="正在初始化代码分割..." />;
  }

  return (
    <div className={`code-splitting-provider ${className}`}>
      {children}
    </div>
  );
};

/**
 * Lazy Achievement Jar Components
 * Pre-configured lazy components with optimal loading strategies
 */
export const LazyAchievementJar: React.FC<any> = (props) => (
  <LazyComponentWrapper componentName="AchievementJarContainer" preload={true}>
    <LazyAchievementJarContainer {...props} />
  </LazyComponentWrapper>
);

export const LazyMetrics: React.FC<any> = (props) => (
  <LazyComponentWrapper componentName="MetricsTray" preload={true}>
    <LazyMetricsTray {...props} />
  </LazyComponentWrapper>
);

export const LazyInteractions: React.FC<any> = (props) => (
  <LazyComponentWrapper componentName="InteractionDock">
    <LazyInteractionDock {...props} />
  </LazyComponentWrapper>
);

export const LazyCelebrations: React.FC<any> = (props) => (
  <LazyComponentWrapper componentName="CelebrationEffectsSystem">
    <LazyCelebrationEffectsSystem {...props} />
  </LazyComponentWrapper>
);

export const LazyPhysics: React.FC<any> = (props) => (
  <LazyComponentWrapper componentName="PhysicsEngine">
    <LazyPhysicsEngine {...props} />
  </LazyComponentWrapper>
);

/**
 * Performance Monitoring Hook
 */
export const useCodeSplittingMetrics = () => {
  const [metrics, setMetrics] = useState({
    loadedComponents: 0,
    totalComponents: 0,
    loadingTime: 0,
    preloadedComponents: 0
  });

  useEffect(() => {
    const preloader = ComponentPreloader.getInstance();
    
    const updateMetrics = () => {
      const stats = preloader.getStats();
      setMetrics({
        loadedComponents: stats.preloadedCount,
        totalComponents: 7, // Total number of lazy components
        loadingTime: performance.now(),
        preloadedComponents: stats.preloadedCount
      });
    };

    updateMetrics();
    
    // Update metrics periodically
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};

/**
 * Bundle Size Analyzer (Development only)
 */
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const components = [
    'AchievementJarContainer',
    'MetricsTray', 
    'InteractionDock',
    'CelebrationEffectsSystem',
    'PhysicsEngine',
    'VisualConsistencyIntegration',
    'MobileOptimization'
  ];

  console.group('📦 Bundle Size Analysis');
  
  components.forEach(async (componentName) => {
    const startTime = performance.now();
    
    try {
      await import(`./${componentName}`);
      const loadTime = performance.now() - startTime;
      console.log(`${componentName}: ${loadTime.toFixed(2)}ms`);
    } catch (error) {
      console.error(`${componentName}: Failed to load`);
    }
  });
  
  console.groupEnd();
};

export default CodeSplittingProvider;