/**
 * Achievement Jar Progress Visualization - Responsive Design System
 * Mobile optimization and responsive layout adaptation utilities
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Breakpoint definitions for responsive design
export const breakpoints = {
  xs: 320,   // Extra small devices (small phones)
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  xxl: 1536  // Extra extra large devices
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Device type detection
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Viewport dimensions interface
export interface ViewportDimensions {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: 'portrait' | 'landscape';
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  pixelRatio: number;
}

// Touch capabilities detection
export interface TouchCapabilities {
  hasTouch: boolean;
  maxTouchPoints: number;
  supportsHover: boolean;
  supportsPointer: boolean;
}

// Performance capabilities
export interface PerformanceCapabilities {
  hardwareConcurrency: number;
  deviceMemory?: number;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  reducedMotion: boolean;
  highContrast: boolean;
}

// Responsive configuration for components
export interface ResponsiveConfig {
  jarSize: {
    width: string;
    height: string;
    maxWidth: string;
  };
  ballSizes: {
    min: number;
    max: number;
    scale: number;
  };
  touchTargets: {
    minSize: number;
    spacing: number;
  };
  animations: {
    enabled: boolean;
    duration: number;
    complexity: 'low' | 'medium' | 'high';
  };
  physics: {
    enabled: boolean;
    quality: 'low' | 'medium' | 'high';
  };
}

/**
 * Hook for detecting viewport dimensions and device capabilities
 */
export const useViewport = (): ViewportDimensions => {
  const calculateDimensions = useCallback((): ViewportDimensions => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Determine breakpoint
    let breakpoint: Breakpoint = 'xs';
    if (width >= breakpoints.xxl) breakpoint = 'xxl';
    else if (width >= breakpoints.xl) breakpoint = 'xl';
    else if (width >= breakpoints.lg) breakpoint = 'lg';
    else if (width >= breakpoints.md) breakpoint = 'md';
    else if (width >= breakpoints.sm) breakpoint = 'sm';

    // Determine device type
    let deviceType: DeviceType = 'mobile';
    if (width >= breakpoints.lg) deviceType = 'desktop';
    else if (width >= breakpoints.md) deviceType = 'tablet';

    // Determine orientation
    const orientation = width > height ? 'landscape' : 'portrait';

    return {
      width,
      height,
      deviceType,
      orientation,
      breakpoint,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      pixelRatio
    };
  }, []);

  const [dimensions, setDimensions] = useState<ViewportDimensions>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        deviceType: 'desktop',
        orientation: 'landscape',
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        pixelRatio: 1
      };
    }

    return calculateDimensions();
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions(calculateDimensions());
    };

    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        setDimensions(calculateDimensions());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [calculateDimensions]);

  return dimensions;
};

/**
 * Hook for detecting touch capabilities
 */
export const useTouchCapabilities = (): TouchCapabilities => {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        hasTouch: false,
        maxTouchPoints: 0,
        supportsHover: true,
        supportsPointer: true
      };
    }

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    
    // Check for hover and pointer support (with fallback for testing)
    const supportsHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;
    const supportsPointer = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : true;

    return {
      hasTouch,
      maxTouchPoints,
      supportsHover,
      supportsPointer
    };
  }, []);
};

/**
 * Hook for detecting performance capabilities
 */
export const usePerformanceCapabilities = (): PerformanceCapabilities => {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        hardwareConcurrency: 4,
        reducedMotion: false,
        highContrast: false
      };
    }

    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // Device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory;
    
    // Network information (if available)
    const connection = (navigator as any).connection;
    
    // Accessibility preferences (with fallback for testing)
    const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    const highContrast = window.matchMedia ? window.matchMedia('(prefers-contrast: high)').matches : false;

    return {
      hardwareConcurrency,
      deviceMemory,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      } : undefined,
      reducedMotion,
      highContrast
    };
  }, []);
};

/**
 * Enhanced hook for generating responsive configuration based on device capabilities
 */
export const useResponsiveConfig = (): ResponsiveConfig => {
  const viewport = useViewport();
  const touch = useTouchCapabilities();
  const performance = usePerformanceCapabilities();

  return useMemo(() => {
    // Enhanced jar sizing with aspect ratio preservation
    const jarSize = responsiveUtils.getJarDimensions(viewport);

    // Enhanced ball sizes with performance optimization
    const ballSizes = responsiveUtils.getBallSizeRange(viewport, performance);

    // Enhanced touch targets with accessibility compliance
    const touchTargets = {
      minSize: responsiveUtils.getTouchTargetSize(touch, 32),
      spacing: touch.hasTouch ? (viewport.isMobile ? 12 : 8) : 4
    };

    // Enhanced animation settings with network awareness
    const animations = (() => {
      if (performance.reducedMotion) {
        return {
          enabled: false,
          duration: 0,
          complexity: 'low' as const
        };
      }

      const baseDuration = 300;
      const duration = responsiveUtils.getAnimationDuration(performance, baseDuration);
      const supportsAdvanced = responsiveUtils.supportsAdvancedFeatures(performance);

      if (!supportsAdvanced || viewport.isMobile) {
        return {
          enabled: true,
          duration: Math.max(duration, 150), // Minimum duration for smooth animations
          complexity: 'low' as const
        };
      }

      return {
        enabled: true,
        duration,
        complexity: viewport.isDesktop ? 'high' as const : 'medium' as const
      };
    })();

    // Enhanced physics settings with quality adaptation
    const physics = (() => {
      const quality = responsiveUtils.getPhysicsQuality(viewport, performance);
      
      return {
        enabled: quality !== 'low' && !performance.reducedMotion,
        quality
      };
    })();

    return {
      jarSize,
      ballSizes,
      touchTargets,
      animations,
      physics
    };
  }, [viewport, touch, performance]);
};

/**
 * Enhanced responsive container component with advanced mobile optimization
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  enableGestures?: boolean;
  enableHaptics?: boolean;
  adaptiveLayout?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  enableGestures = true,
  enableHaptics = true,
  adaptiveLayout = true
}) => {
  const viewport = useViewport();
  const touch = useTouchCapabilities();
  const config = useResponsiveConfig();
  const performance = usePerformanceCapabilities();

  // Enhanced gesture handling for mobile devices
  const [gestureState, setGestureState] = useState({
    isGesturing: false,
    scale: 1,
    rotation: 0,
    lastTouchTime: 0,
    touchCount: 0
  });

  // Haptic feedback utility
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics || !touch.hasTouch) return;
    
    try {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      // Silently fail if haptics not supported
    }
  }, [enableHaptics, touch.hasTouch]);

  // Enhanced touch event handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !touch.hasTouch) return;
    
    const currentTime = Date.now();
    const touchCount = e.touches.length;
    
    // Handle multi-touch gestures
    if (touchCount === 2) {
      setGestureState(prev => ({ 
        ...prev, 
        isGesturing: true,
        touchCount,
        lastTouchTime: currentTime
      }));
      triggerHapticFeedback('light');
    }
    
    // Prevent default behavior for better touch handling
    if (touchCount > 1) {
      e.preventDefault();
    }
  }, [enableGestures, touch.hasTouch, triggerHapticFeedback]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !gestureState.isGesturing) return;
    
    // Handle pinch-to-zoom prevention
    if (e.touches.length === 2) {
      e.preventDefault();
    }
  }, [enableGestures, gestureState.isGesturing]);

  const handleTouchEnd = useCallback(() => {
    if (!enableGestures) return;
    
    setGestureState({
      isGesturing: false,
      scale: 1,
      rotation: 0,
      lastTouchTime: 0,
      touchCount: 0
    });
  }, [enableGestures]);

  // Adaptive container styling based on device capabilities
  const containerStyle = useMemo(() => {
    const baseStyle = {
      width: '100%',
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      // Prevent zoom on double tap for iOS
      touchAction: enableGestures ? 'manipulation' : 'auto',
      // Optimize for touch scrolling
      WebkitOverflowScrolling: 'touch',
      // Prevent text selection on mobile
      WebkitUserSelect: viewport.isMobile ? 'none' : 'auto',
      userSelect: viewport.isMobile ? 'none' : 'auto',
      // Optimize rendering performance
      willChange: viewport.isMobile ? 'transform' : 'auto',
      // Improve scrolling performance on mobile
      WebkitTransform: 'translateZ(0)',
      transform: 'translateZ(0)'
    };

    // Adaptive layout adjustments
    if (adaptiveLayout) {
      const adaptiveStyles = {
        minHeight: viewport.isMobile ? '100vh' : 'auto',
        padding: responsiveUtils.getSpacing(viewport, 24),
        overflow: viewport.isMobile ? 'hidden' : 'visible'
      };

      // Performance-based optimizations
      if (performance.reducedMotion) {
        adaptiveStyles.willChange = 'auto';
        adaptiveStyles.WebkitTransform = 'none';
        adaptiveStyles.transform = 'none';
      }

      return { ...baseStyle, ...adaptiveStyles };
    }

    return baseStyle;
  }, [viewport, enableGestures, adaptiveLayout, performance.reducedMotion]);

  // Safe area insets for devices with notches/home indicators
  const safeAreaStyle = useMemo(() => {
    if (!viewport.isMobile) return {};
    
    return {
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)'
    };
  }, [viewport.isMobile]);

  return (
    <div
      className={`responsive-container ${className}`}
      style={{ ...containerStyle, ...safeAreaStyle }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
      
      {/* Enhanced viewport meta tag injection for mobile */}
      {viewport.isMobile && (
        <style>{`
          @viewport {
            width: device-width;
            initial-scale: 1.0;
            maximum-scale: 1.0;
            user-scalable: no;
            viewport-fit: cover;
          }
          
          /* Safe area support for devices with notches */
          @supports (padding: env(safe-area-inset-top)) {
            .responsive-container {
              padding-top: env(safe-area-inset-top);
              padding-bottom: env(safe-area-inset-bottom);
              padding-left: env(safe-area-inset-left);
              padding-right: env(safe-area-inset-right);
            }
          }
          
          /* Prevent overscroll bounce on iOS */
          body {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Optimize font rendering on mobile */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `}</style>
      )}
    </div>
  );
};

/**
 * Responsive grid system for layout adaptation
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 16,
  className = ''
}) => {
  const viewport = useViewport();

  const gridColumns = useMemo(() => {
    const { breakpoint } = viewport;
    
    if (breakpoint === 'xs') return columns.xs || 1;
    if (breakpoint === 'sm') return columns.sm || columns.xs || 1;
    if (breakpoint === 'md') return columns.md || columns.sm || columns.xs || 1;
    if (breakpoint === 'lg') return columns.lg || columns.md || columns.sm || columns.xs || 1;
    return columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1;
  }, [viewport.breakpoint, columns]);

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
    gap: `${gap}px`,
    width: '100%'
  }), [gridColumns, gap]);

  return (
    <div className={`responsive-grid ${className}`} style={gridStyle}>
      {children}
    </div>
  );
};

/**
 * Enhanced performance monitor for responsive optimization with mobile-specific metrics
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    isOptimized: true,
    batteryLevel: 1,
    isLowPowerMode: false,
    networkSpeed: 'fast'
  });

  const viewport = useViewport();

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;
    let performanceObserver: PerformanceObserver | null = null;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Memory usage (if available)
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

        // Battery status (if available)
        const battery = (navigator as any).battery;
        const batteryLevel = battery ? battery.level : 1;
        const isLowPowerMode = battery ? battery.level < 0.2 : false;

        // Network speed estimation
        const connection = (navigator as any).connection;
        const networkSpeed = connection ? 
          (connection.effectiveType === '4g' ? 'fast' : 
           connection.effectiveType === '3g' ? 'medium' : 'slow') : 'fast';

        // Mobile-specific optimization thresholds
        const mobileOptimizationThreshold = viewport.isMobile ? 45 : 30;
        const memoryThreshold = viewport.isMobile ? 50 : 100;

        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage,
          batteryLevel,
          isLowPowerMode,
          networkSpeed,
          isOptimized: fps >= mobileOptimizationThreshold && 
                       memoryUsage < memoryThreshold && 
                       !isLowPowerMode
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    // Set up performance observer for render timing
    if ('PerformanceObserver' in window) {
      try {
        performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const renderTimes = entries
            .filter(entry => entry.entryType === 'measure')
            .map(entry => entry.duration);
          
          if (renderTimes.length > 0) {
            const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
            setMetrics(prev => ({ ...prev, renderTime: avgRenderTime }));
          }
        });
        
        performanceObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        // Performance observer not supported
      }
    }

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      cancelAnimationFrame(animationId);
      if (performanceObserver) {
        performanceObserver.disconnect();
      }
    };
  }, [viewport.isMobile]);

  return metrics;
};

/**
 * Hook for handling orientation changes with debouncing
 */
export const useOrientationChange = (callback?: (orientation: 'portrait' | 'landscape') => void) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleOrientationChange = () => {
      // Debounce orientation changes to avoid rapid updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        
        if (newOrientation !== orientation) {
          setOrientation(newOrientation);
          callback?.(newOrientation);
        }
      }, 150);
    };

    // Listen to both resize and orientationchange events
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, [orientation, callback]);

  return orientation;
};

/**
 * Hook for adaptive quality management based on performance
 */
export const useAdaptiveQuality = () => {
  const performance = usePerformanceMonitor();
  const viewport = useViewport();
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high'>('high');

  useEffect(() => {
    // Automatically adjust quality based on performance metrics
    if (performance.fps < 30 || performance.isLowPowerMode || performance.memoryUsage > 80) {
      setQualityLevel('low');
    } else if (performance.fps < 45 || viewport.isMobile || performance.networkSpeed === 'slow') {
      setQualityLevel('medium');
    } else {
      setQualityLevel('high');
    }
  }, [performance, viewport.isMobile]);

  const getQualityConfig = useCallback(() => {
    switch (qualityLevel) {
      case 'low':
        return {
          enablePhysics: false,
          enableAnimations: false,
          maxBalls: 20,
          renderQuality: 0.5
        };
      case 'medium':
        return {
          enablePhysics: true,
          enableAnimations: true,
          maxBalls: 50,
          renderQuality: 0.75
        };
      case 'high':
      default:
        return {
          enablePhysics: true,
          enableAnimations: true,
          maxBalls: 100,
          renderQuality: 1.0
        };
    }
  }, [qualityLevel]);

  return {
    qualityLevel,
    qualityConfig: getQualityConfig(),
    performanceMetrics: performance
  };
};

/**
 * Enhanced utility functions for responsive calculations and mobile optimization
 */
export const responsiveUtils = {
  // Calculate responsive font size with enhanced scaling
  getFontSize: (viewport: ViewportDimensions, baseSize: number): number => {
    let scale = 1.0;
    
    // Device type scaling
    if (viewport.isMobile) {
      scale = viewport.orientation === 'portrait' ? 0.9 : 0.85;
    } else if (viewport.isTablet) {
      scale = 0.95;
    }
    
    // Pixel ratio adjustment for high-DPI displays (limited to prevent excessive scaling)
    if (viewport.pixelRatio > 2) {
      scale *= Math.min(1.1, 1 + (viewport.pixelRatio - 2) * 0.05);
    }
    
    return Math.round(baseSize * scale);
  },

  // Calculate responsive spacing with orientation awareness
  getSpacing: (viewport: ViewportDimensions, baseSpacing: number): number => {
    let scale = 1.0;
    
    if (viewport.isMobile) {
      scale = viewport.orientation === 'portrait' ? 0.8 : 0.7;
    } else if (viewport.isTablet) {
      scale = 0.9;
    }
    
    return Math.round(baseSpacing * scale);
  },

  // Get optimal touch target size with accessibility compliance
  getTouchTargetSize: (touch: TouchCapabilities, baseSize: number): number => {
    if (!touch.hasTouch) return baseSize;
    
    // iOS HIG minimum 44pt, Android minimum 48dp
    const minSize = touch.maxTouchPoints > 5 ? 48 : 44;
    return Math.max(baseSize, minSize);
  },

  // Calculate optimal animation duration with performance awareness
  getAnimationDuration: (performance: PerformanceCapabilities, baseDuration: number): number => {
    if (performance.reducedMotion) return 0;
    
    let scale = 1.0;
    
    // Hardware performance scaling
    if (performance.hardwareConcurrency < 4) {
      scale *= 0.7;
    }
    
    // Memory-based scaling
    if (performance.deviceMemory && performance.deviceMemory < 4) {
      scale *= 0.8;
    }
    
    // Network-based scaling for slower connections
    if (performance.connection && performance.connection.effectiveType === 'slow-2g') {
      scale *= 0.5;
    }
    
    return Math.round(baseDuration * scale);
  },

  // Calculate responsive jar dimensions with aspect ratio preservation
  getJarDimensions: (viewport: ViewportDimensions): { width: string; height: string; maxWidth: string } => {
    const { deviceType, orientation, width, height } = viewport;
    
    switch (deviceType) {
      case 'mobile':
        if (orientation === 'portrait') {
          return {
            width: '90%',
            height: Math.min(height * 0.4, 280) + 'px',
            maxWidth: '320px'
          };
        } else {
          return {
            width: '70%',
            height: Math.min(height * 0.6, 200) + 'px',
            maxWidth: '280px'
          };
        }
      case 'tablet':
        return {
          width: '75%',
          height: orientation === 'portrait' ? '350px' : '300px',
          maxWidth: '400px'
        };
      case 'desktop':
      default:
        return {
          width: '60%',
          height: '400px',
          maxWidth: '480px'
        };
    }
  },

  // Calculate optimal ball sizes based on container and performance
  getBallSizeRange: (viewport: ViewportDimensions, performance: PerformanceCapabilities): { min: number; max: number; scale: number } => {
    let baseScale = 1.0;
    
    // Device-based scaling
    if (viewport.isMobile) {
      baseScale = viewport.orientation === 'portrait' ? 0.8 : 0.7;
    } else if (viewport.isTablet) {
      baseScale = 0.9;
    }
    
    // Performance-based scaling
    if (performance.hardwareConcurrency < 4 || (performance.deviceMemory && performance.deviceMemory < 4)) {
      baseScale *= 0.9;
    }
    
    return {
      min: Math.round(20 * baseScale),
      max: Math.round(60 * baseScale),
      scale: baseScale
    };
  },

  // Check if device supports advanced features
  supportsAdvancedFeatures: (performance: PerformanceCapabilities): boolean => {
    return performance.hardwareConcurrency >= 4 && 
           (!performance.deviceMemory || performance.deviceMemory >= 4) &&
           !performance.reducedMotion;
  },

  // Get optimal physics quality based on device capabilities
  getPhysicsQuality: (viewport: ViewportDimensions, performance: PerformanceCapabilities): 'low' | 'medium' | 'high' => {
    if (performance.reducedMotion) return 'low';
    
    const isLowPerformance = performance.hardwareConcurrency < 4 || 
                           (performance.deviceMemory && performance.deviceMemory < 4);
    
    if (isLowPerformance) return 'low';
    if (viewport.isMobile) return 'medium';
    return 'high';
  },

  // Calculate safe area adjustments for modern mobile devices
  getSafeAreaAdjustments: (viewport: ViewportDimensions): { top: number; bottom: number; left: number; right: number } => {
    if (!viewport.isMobile) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
    
    // Estimate safe area insets based on common device patterns
    const hasNotch = viewport.height > 800 && viewport.pixelRatio > 2;
    const hasHomeIndicator = viewport.height > 700;
    
    return {
      top: hasNotch ? 44 : 20,
      bottom: hasHomeIndicator ? 34 : 0,
      left: 0,
      right: 0
    };
  }
};

/**
 * Enhanced CSS-in-JS responsive styles generator with mobile-first approach
 */
export const generateResponsiveStyles = (viewport: ViewportDimensions, touch: TouchCapabilities, performance: PerformanceCapabilities) => {
  const safeArea = responsiveUtils.getSafeAreaAdjustments(viewport);
  
  return {
    // Enhanced container styles with safe area support
    container: {
      maxWidth: viewport.isMobile ? '100%' : '1200px',
      margin: '0 auto',
      padding: responsiveUtils.getSpacing(viewport, 24),
      paddingTop: safeArea.top,
      paddingBottom: safeArea.bottom,
      paddingLeft: Math.max(safeArea.left, responsiveUtils.getSpacing(viewport, 24)),
      paddingRight: Math.max(safeArea.right, responsiveUtils.getSpacing(viewport, 24)),
      minHeight: viewport.isMobile ? '100vh' : 'auto',
      boxSizing: 'border-box' as const
    },

    // Enhanced typography with dynamic scaling
    heading: {
      fontSize: responsiveUtils.getFontSize(viewport, viewport.isMobile ? 24 : viewport.isTablet ? 28 : 32),
      lineHeight: viewport.isMobile ? '1.3' : '1.4',
      fontWeight: viewport.isMobile ? '600' : '700',
      letterSpacing: viewport.isMobile ? '0.01em' : '0.02em'
    },

    body: {
      fontSize: responsiveUtils.getFontSize(viewport, 16),
      lineHeight: viewport.isMobile ? '1.5' : '1.6',
      fontWeight: '400',
      letterSpacing: '0.01em'
    },

    // Enhanced button styles with touch optimization
    button: {
      padding: viewport.isMobile ? '14px 24px' : '16px 28px',
      fontSize: responsiveUtils.getFontSize(viewport, 16),
      minHeight: responsiveUtils.getTouchTargetSize(touch, 40),
      minWidth: responsiveUtils.getTouchTargetSize(touch, 40),
      borderRadius: viewport.isMobile ? '12px' : '8px',
      cursor: touch.hasTouch ? 'default' : 'pointer',
      userSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: performance.reducedMotion ? 'none' : 'all 0.2s ease'
    },

    // Enhanced card styles with adaptive spacing
    card: {
      padding: responsiveUtils.getSpacing(viewport, 24),
      borderRadius: viewport.isMobile ? '16px' : '12px',
      boxShadow: viewport.isMobile 
        ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
        : '0 2px 12px rgba(0, 0, 0, 0.06)',
      transition: performance.reducedMotion ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease'
    },

    // Achievement jar specific styles
    achievementJar: {
      width: responsiveUtils.getJarDimensions(viewport).width,
      height: responsiveUtils.getJarDimensions(viewport).height,
      maxWidth: responsiveUtils.getJarDimensions(viewport).maxWidth,
      margin: '0 auto',
      position: 'relative' as const,
      // Optimize for mobile rendering
      willChange: viewport.isMobile ? 'transform' : 'auto',
      backfaceVisibility: 'hidden' as const,
      WebkitBackfaceVisibility: 'hidden' as const
    },

    // Metrics tray styles with horizontal scrolling
    metricsTray: {
      display: 'flex',
      overflowX: 'auto' as const,
      overflowY: 'hidden' as const,
      gap: responsiveUtils.getSpacing(viewport, 12),
      padding: `${responsiveUtils.getSpacing(viewport, 8)}px ${responsiveUtils.getSpacing(viewport, 16)}px`,
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none' as const,
      msOverflowStyle: 'none' as const,
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },

    // Metric pill styles with touch optimization
    metricPill: {
      minWidth: viewport.isMobile ? '120px' : '140px',
      height: viewport.isMobile ? '56px' : '64px',
      padding: `${responsiveUtils.getSpacing(viewport, 12)}px ${responsiveUtils.getSpacing(viewport, 16)}px`,
      borderRadius: '28px',
      display: 'flex',
      alignItems: 'center',
      gap: responsiveUtils.getSpacing(viewport, 8),
      cursor: touch.hasTouch ? 'default' : 'pointer',
      transition: performance.reducedMotion ? 'none' : 'transform 0.2s ease',
      '&:active': touch.hasTouch ? {
        transform: 'scale(0.95)'
      } : {}
    },

    // Interaction dock styles with safe area consideration
    interactionDock: {
      position: 'fixed' as const,
      bottom: safeArea.bottom + responsiveUtils.getSpacing(viewport, 24),
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: responsiveUtils.getSpacing(viewport, 16),
      zIndex: 1000
    },

    // Celebration button styles with enhanced touch targets
    celebrationButton: {
      width: responsiveUtils.getTouchTargetSize(touch, viewport.isMobile ? 72 : 80),
      height: responsiveUtils.getTouchTargetSize(touch, viewport.isMobile ? 72 : 80),
      borderRadius: '50%',
      border: 'none',
      cursor: touch.hasTouch ? 'default' : 'pointer',
      transition: performance.reducedMotion ? 'none' : 'transform 0.15s ease',
      WebkitTapHighlightColor: 'transparent',
      '&:active': {
        transform: 'scale(0.9)'
      }
    },

    // Loading state styles
    loadingSpinner: {
      width: viewport.isMobile ? '32px' : '40px',
      height: viewport.isMobile ? '32px' : '40px',
      borderRadius: '50%',
      animation: performance.reducedMotion ? 'none' : 'spin 1s linear infinite'
    },

    // Empty state styles
    emptyState: {
      padding: responsiveUtils.getSpacing(viewport, 32),
      textAlign: 'center' as const,
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center'
    }
  };
};

/**
 * Generate CSS keyframes for animations with reduced motion support
 */
export const generateAnimationKeyframes = (performance: PerformanceCapabilities) => {
  if (performance.reducedMotion) {
    return '';
  }

  return `
    @keyframes gentle-float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-8px) rotate(1deg); }
      66% { transform: translateY(-4px) rotate(-1deg); }
    }
    
    @keyframes gentle-pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.05); }
    }
    
    @keyframes airy-shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes bounce-in {
      0% { transform: scale(0.3) rotate(0deg); opacity: 0; }
      50% { transform: scale(1.1) rotate(180deg); opacity: 0.8; }
      100% { transform: scale(1) rotate(360deg); opacity: 1; }
    }
    
    @keyframes fade-in-up {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `;
};