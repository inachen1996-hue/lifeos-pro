/**
 * Lazy Loading System for Achievement Jar Components
 * Implements lazy loading for celebration effects and heavy components
 */

import React, { Suspense, lazy } from 'react';

// Lazy loading state
interface LazyLoadState {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

// Lazy loading manager
export class LazyLoadManager {
  private static instance: LazyLoadManager;
  private loadedModules: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private loadStates: Map<string, LazyLoadState> = new Map();

  private constructor() {}

  static getInstance(): LazyLoadManager {
    if (!LazyLoadManager.instance) {
      LazyLoadManager.instance = new LazyLoadManager();
    }
    return LazyLoadManager.instance;
  }

  // Load module with caching
  async loadModule<T>(
    moduleId: string,
    loader: () => Promise<T>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    // Return cached module if already loaded
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    // Update loading state
    this.updateLoadState(moduleId, { isLoaded: false, isLoading: true, error: null });

    // Create loading promise
    const loadingPromise = this.createLoadingPromise(moduleId, loader, priority);
    this.loadingPromises.set(moduleId, loadingPromise);

    try {
      const module = await loadingPromise;
      this.loadedModules.set(moduleId, module);
      this.updateLoadState(moduleId, { isLoaded: true, isLoading: false, error: null });
      return module;
    } catch (error) {
      this.updateLoadState(moduleId, { 
        isLoaded: false, 
        isLoading: false, 
        error: error as Error 
      });
      throw error;
    } finally {
      this.loadingPromises.delete(moduleId);
    }
  }

  private async createLoadingPromise<T>(
    moduleId: string,
    loader: () => Promise<T>,
    priority: 'high' | 'normal' | 'low'
  ): Promise<T> {
    // Add delay for low priority loads to avoid blocking
    if (priority === 'low') {
      await this.waitForIdleTime();
    }

    return loader();
  }

  private waitForIdleTime(): Promise<void> {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(resolve, { timeout: 1000 });
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  private updateLoadState(moduleId: string, state: LazyLoadState): void {
    this.loadStates.set(moduleId, state);
  }

  // Get loading state
  getLoadState(moduleId: string): LazyLoadState {
    return this.loadStates.get(moduleId) || {
      isLoaded: false,
      isLoading: false,
      error: null
    };
  }

  // Preload modules
  async preloadModules(moduleConfigs: Array<{
    id: string;
    loader: () => Promise<any>;
    priority?: 'high' | 'normal' | 'low';
  }>): Promise<void> {
    const promises = moduleConfigs.map(config =>
      this.loadModule(config.id, config.loader, config.priority)
        .catch(error => {
          console.warn(`Failed to preload module ${config.id}:`, error);
          return null;
        })
    );

    await Promise.allSettled(promises);
  }

  // Clear cache
  clearCache(): void {
    this.loadedModules.clear();
    this.loadingPromises.clear();
    this.loadStates.clear();
  }

  // Get cache statistics
  getCacheStats(): {
    loadedModules: number;
    loadingModules: number;
    totalSize: number;
  } {
    return {
      loadedModules: this.loadedModules.size,
      loadingModules: this.loadingPromises.size,
      totalSize: this.loadedModules.size + this.loadingPromises.size
    };
  }
}

// Lazy loaded components
export const LazyComponents = {
  // Celebration effects (heavy components)
  ConfettiRenderer: lazy(() => 
    import('./ConfettiRenderer.js').then(module => ({ default: module.ConfettiRenderer }))
  ),
  
  DanmakuSystem: lazy(() =>
    import('./DanmakuSystem.js').then(module => ({ default: module.DanmakuSystem }))
  ),

  // Physics engine (heavy computation)
  PhysicsEngine: lazy(() =>
    import('./PhysicsEngine.js').then(module => ({ default: module.PhysicsEngine }))
  ),

  // Sound effects system
  SoundEffectsSystem: lazy(() =>
    import('./SoundEffectsSystem.js').then(module => ({ default: module.SoundEffectsSystem }))
  )
};

// Lazy loading hook
export const useLazyLoad = <T>(
  moduleId: string,
  loader: () => Promise<T>,
  options: {
    priority?: 'high' | 'normal' | 'low';
    preload?: boolean;
  } = {}
) => {
  const [state, setState] = React.useState<LazyLoadState>({
    isLoaded: false,
    isLoading: false,
    error: null
  });
  const [module, setModule] = React.useState<T | null>(null);

  const lazyLoader = LazyLoadManager.getInstance();

  const loadModule = React.useCallback(async () => {
    try {
      setState({ isLoaded: false, isLoading: true, error: null });
      const loadedModule = await lazyLoader.loadModule(moduleId, loader, options.priority);
      setModule(loadedModule);
      setState({ isLoaded: true, isLoading: false, error: null });
    } catch (error) {
      setState({ isLoaded: false, isLoading: false, error: error as Error });
    }
  }, [moduleId, loader, options.priority, lazyLoader]);

  // Preload if requested
  React.useEffect(() => {
    if (options.preload) {
      loadModule();
    }
  }, [options.preload, loadModule]);

  return {
    module,
    ...state,
    load: loadModule
  };
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const elementRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected
  };
};

// Lazy celebration effects component
export const LazyCelebrationEffects: React.FC<{
  isActive: boolean;
  type: 'confetti' | 'danmaku' | 'both';
  onLoad?: () => void;
}> = ({ isActive, type, onLoad }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver();
  
  const {
    module: confettiModule,
    isLoaded: confettiLoaded,
    load: loadConfetti
  } = useLazyLoad(
    'confetti-renderer',
    () => import('./ConfettiRenderer.js'),
    { priority: 'low' }
  );

  const {
    module: danmakuModule,
    isLoaded: danmakuLoaded,
    load: loadDanmaku
  } = useLazyLoad(
    'danmaku-system',
    () => import('./DanmakuSystem.js'),
    { priority: 'low' }
  );

  // Load effects when needed
  React.useEffect(() => {
    if (isActive && hasIntersected) {
      if (type === 'confetti' || type === 'both') {
        loadConfetti();
      }
      if (type === 'danmaku' || type === 'both') {
        loadDanmaku();
      }
    }
  }, [isActive, hasIntersected, type, loadConfetti, loadDanmaku]);

  // Notify when loaded
  React.useEffect(() => {
    const shouldNotify = 
      (type === 'confetti' && confettiLoaded) ||
      (type === 'danmaku' && danmakuLoaded) ||
      (type === 'both' && confettiLoaded && danmakuLoaded);

    if (shouldNotify && onLoad) {
      onLoad();
    }
  }, [type, confettiLoaded, danmakuLoaded, onLoad]);

  return React.createElement('div', 
    { ref: elementRef, className: 'lazy-celebration-effects' },
    isActive && hasIntersected && React.createElement(Suspense,
      { fallback: React.createElement('div', { className: 'celebration-loading' }, 'Loading effects...') },
      (type === 'confetti' || type === 'both') && confettiModule && 
        React.createElement(confettiModule.ConfettiRenderer),
      (type === 'danmaku' || type === 'both') && danmakuModule && 
        React.createElement(danmakuModule.DanmakuSystem)
    )
  );
};

// Lazy physics engine component
export const LazyPhysicsEngine: React.FC<{
  isEnabled: boolean;
  onLoad?: () => void;
  fallback?: React.ReactNode;
}> = ({ isEnabled, onLoad, fallback }) => {
  const { elementRef, hasIntersected } = useIntersectionObserver();
  
  const {
    module: physicsModule,
    isLoaded,
    isLoading,
    error,
    load
  } = useLazyLoad(
    'physics-engine',
    () => import('./PhysicsEngine.js'),
    { priority: 'normal' }
  );

  React.useEffect(() => {
    if (isEnabled && hasIntersected) {
      load();
    }
  }, [isEnabled, hasIntersected, load]);

  React.useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  if (error) {
    console.warn('Failed to load physics engine:', error);
    return fallback ? React.createElement(React.Fragment, null, fallback) : null;
  }

  return React.createElement('div',
    { ref: elementRef, className: 'lazy-physics-engine' },
    isEnabled && hasIntersected && React.createElement(Suspense,
      { fallback: React.createElement('div', { className: 'physics-loading' }, 'Loading physics...') },
      isLoaded && physicsModule && React.createElement(physicsModule.PhysicsEngine)
    )
  );
};

// Preload configuration
export const PRELOAD_CONFIG = [
  {
    id: 'confetti-renderer',
    loader: () => import('./ConfettiRenderer.js'),
    priority: 'low' as const
  },
  {
    id: 'danmaku-system',
    loader: () => import('./DanmakuSystem.js'),
    priority: 'low' as const
  },
  {
    id: 'physics-engine',
    loader: () => import('./PhysicsEngine.js'),
    priority: 'normal' as const
  },
  {
    id: 'sound-effects',
    loader: () => import('./SoundEffectsSystem.js'),
    priority: 'normal' as const
  }
];

// Initialize lazy loading
export const initializeLazyLoading = async (): Promise<void> => {
  const lazyLoader = LazyLoadManager.getInstance();
  
  // Preload high priority modules immediately
  const highPriorityModules = PRELOAD_CONFIG.filter(config => config.priority === 'high');
  if (highPriorityModules.length > 0) {
    await lazyLoader.preloadModules(highPriorityModules);
  }

  // Preload normal priority modules after a delay
  setTimeout(() => {
    const normalPriorityModules = PRELOAD_CONFIG.filter(config => config.priority === 'normal');
    lazyLoader.preloadModules(normalPriorityModules);
  }, 1000);

  // Preload low priority modules when idle
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      const lowPriorityModules = PRELOAD_CONFIG.filter(config => config.priority === 'low');
      lazyLoader.preloadModules(lowPriorityModules);
    });
  }
};

// Export singleton instance
export const lazyLoadManager = LazyLoadManager.getInstance();

export default {
  LazyLoadManager,
  LazyComponents,
  useLazyLoad,
  useIntersectionObserver,
  LazyCelebrationEffects,
  LazyPhysicsEngine,
  initializeLazyLoading,
  lazyLoadManager
};