/**
 * Achievement Jar Mobile Optimization
 * Provides mobile device detection and performance optimization
 * Implements Requirements 4.1, 4.2, 4.3, 4.4
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  pixelRatio: number;
  touchSupport: boolean;
  performanceLevel: 'low' | 'medium' | 'high';
}

interface MobileOptimizationProps {
  children: React.ReactNode;
  onDeviceChange?: (deviceInfo: DeviceInfo) => void;
  enablePerformanceOptimization?: boolean;
  className?: string;
}

/**
 * Device Detection Utility
 */
export class DeviceDetector {
  private static instance: DeviceDetector;
  private deviceInfo: DeviceInfo | null = null;

  static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }

  /**
   * Detect device information
   */
  detectDevice(): DeviceInfo {
    if (this.deviceInfo) {
      return this.deviceInfo;
    }

    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Device type detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                     screenWidth <= 768;
    const isTablet = /iPad|Android/i.test(userAgent) && screenWidth >= 768 && screenWidth <= 1024;
    const isDesktop = !isMobile && !isTablet;

    // OS detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    // Screen size classification
    let screenSize: 'small' | 'medium' | 'large' | 'xlarge';
    if (screenWidth < 640) {
      screenSize = 'small';
    } else if (screenWidth < 1024) {
      screenSize = 'medium';
    } else if (screenWidth < 1440) {
      screenSize = 'large';
    } else {
      screenSize = 'xlarge';
    }

    // Orientation detection
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';

    // Pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;

    // Touch support detection
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Performance level estimation
    let performanceLevel: 'low' | 'medium' | 'high' = 'medium';
    
    // Basic performance heuristics
    const memoryInfo = (performance as any).memory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    if (memoryInfo) {
      const totalMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024); // MB
      if (totalMemory > 2000 && hardwareConcurrency >= 8) {
        performanceLevel = 'high';
      } else if (totalMemory < 500 || hardwareConcurrency <= 2) {
        performanceLevel = 'low';
      }
    } else if (isMobile && pixelRatio > 2) {
      performanceLevel = 'low'; // High DPI mobile devices may have performance constraints
    }

    this.deviceInfo = {
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      screenSize,
      orientation,
      pixelRatio,
      touchSupport,
      performanceLevel
    };

    console.log('🔍 Device detected:', this.deviceInfo);
    return this.deviceInfo;
  }

  /**
   * Reset device info (for testing or when device changes)
   */
  reset(): void {
    this.deviceInfo = null;
  }
}

/**
 * Mobile Optimization Component
 */
export const MobileOptimization: React.FC<MobileOptimizationProps> = ({
  children,
  onDeviceChange,
  enablePerformanceOptimization = true,
  className = ''
}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect device on mount
  useEffect(() => {
    const detector = DeviceDetector.getInstance();
    const info = detector.detectDevice();
    setDeviceInfo(info);
    onDeviceChange?.(info);
  }, [onDeviceChange]);

  // Handle orientation and resize changes
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        const detector = DeviceDetector.getInstance();
        detector.reset(); // Force re-detection
        const newInfo = detector.detectDevice();
        setDeviceInfo(newInfo);
        onDeviceChange?.(newInfo);
      }, 300); // Debounce resize events
    };

    const handleOrientationChange = () => {
      // Wait for orientation change to complete
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [onDeviceChange]);

  // Apply performance optimizations
  useEffect(() => {
    if (!deviceInfo || !enablePerformanceOptimization) return;

    const applyOptimizations = () => {
      // Reduce animations for low-performance devices
      if (deviceInfo.performanceLevel === 'low') {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        document.documentElement.style.setProperty('--transition-duration', '0.1s');
      } else {
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
        document.documentElement.style.setProperty('--transition-duration', '0.2s');
      }

      // Adjust rendering quality for mobile devices
      if (deviceInfo.isMobile) {
        document.documentElement.style.setProperty('--blur-intensity', '5px');
        document.documentElement.style.setProperty('--shadow-intensity', '0.1');
      } else {
        document.documentElement.style.setProperty('--blur-intensity', '10px');
        document.documentElement.style.setProperty('--shadow-intensity', '0.2');
      }

      setIsOptimized(true);
    };

    applyOptimizations();
  }, [deviceInfo, enablePerformanceOptimization]);

  // Generate responsive classes
  const getResponsiveClasses = () => {
    if (!deviceInfo) return '';

    const classes = [
      deviceInfo.isMobile && 'mobile-optimized',
      deviceInfo.isTablet && 'tablet-optimized',
      deviceInfo.isDesktop && 'desktop-optimized',
      deviceInfo.isIOS && 'ios-optimized',
      deviceInfo.isAndroid && 'android-optimized',
      `screen-${deviceInfo.screenSize}`,
      `orientation-${deviceInfo.orientation}`,
      `performance-${deviceInfo.performanceLevel}`,
      deviceInfo.touchSupport && 'touch-enabled',
      isOptimized && 'performance-optimized'
    ].filter(Boolean);

    return classes.join(' ');
  };

  if (!deviceInfo) {
    return (
      <div className={`mobile-optimization-loading ${className}`}>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">检测设备中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`mobile-optimization ${getResponsiveClasses()} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Touch Interaction Handler
 */
export const useTouchInteraction = () => {
  const [touchState, setTouchState] = useState({
    isPressed: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      isPressed: true,
      startPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY }
    });

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.isPressed) return;

    const touch = e.touches[0];
    setTouchState(prev => ({
      ...prev,
      currentPosition: { x: touch.clientX, y: touch.clientY }
    }));
  }, [touchState.isPressed]);

  const handleTouchEnd = useCallback(() => {
    setTouchState(prev => ({
      ...prev,
      isPressed: false
    }));
  }, []);

  const getTouchDistance = () => {
    const dx = touchState.currentPosition.x - touchState.startPosition.x;
    const dy = touchState.currentPosition.y - touchState.startPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchDirection = () => {
    const dx = touchState.currentPosition.x - touchState.startPosition.x;
    const dy = touchState.currentPosition.y - touchState.startPosition.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  };

  return {
    touchState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    getTouchDistance,
    getTouchDirection
  };
};

/**
 * Responsive Layout Hook
 */
export const useResponsiveLayout = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    const detector = DeviceDetector.getInstance();
    const info = detector.detectDevice();
    setDeviceInfo(info);

    const handleResize = () => {
      detector.reset();
      const newInfo = detector.detectDevice();
      setDeviceInfo(newInfo);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLayoutConfig = () => {
    if (!deviceInfo) return null;

    return {
      columns: deviceInfo.screenSize === 'small' ? 1 : 
               deviceInfo.screenSize === 'medium' ? 2 : 3,
      spacing: deviceInfo.isMobile ? 'compact' : 'normal',
      fontSize: deviceInfo.screenSize === 'small' ? 'sm' : 'base',
      containerPadding: deviceInfo.isMobile ? '4' : '6',
      showSidebar: !deviceInfo.isMobile,
      enableAnimations: deviceInfo.performanceLevel !== 'low'
    };
  };

  return {
    deviceInfo,
    layoutConfig: getLayoutConfig(),
    isMobile: deviceInfo?.isMobile ?? false,
    isTablet: deviceInfo?.isTablet ?? false,
    isDesktop: deviceInfo?.isDesktop ?? false
  };
};

/**
 * Performance Monitor Hook
 */
export const usePerformanceMonitor = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Memory usage (if available)
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? 
          Math.round(memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit * 100) : 0;

        setPerformanceMetrics({
          fps,
          memoryUsage,
          renderTime: currentTime - lastTime
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return performanceMetrics;
};

export default MobileOptimization;