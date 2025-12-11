/**
 * Performance Optimized Achievement Jar Container
 * Integrates all performance optimizations: object pooling, lazy loading, monitoring
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { performanceMonitor, PerformanceMetrics } from './PerformanceMonitor.js';
import { poolManager } from './ObjectPool.js';
import { lazyLoadManager, useLazyLoad, useIntersectionObserver } from './LazyLoader.js';
import { CategoryTimeStats } from './types.js';
import { LifeOSAchievementJar } from './LifeOSIntegration.js';

interface PerformanceOptimizedContainerProps {
  // Legacy support for direct category stats
  categoryStats?: CategoryTimeStats[];
  totalTime?: number;
  
  // New LifeOS integration props
  fullHistory?: string;
  categoryMap?: Record<string, any>;
  
  timeRange: 'today' | 'weekly' | 'monthly';
  onBallClick?: (categoryId: string) => void;
  onCategorySelect?: (categoryId: string) => void;
  onScopeChange?: (scope: 'today' | 'weekly' | 'monthly') => void;
  isEmpty?: boolean;
  isLoading?: boolean;
  className?: string;
  enablePerformanceMode?: boolean;
  performanceThresholds?: {
    minFPS?: number;
    maxMemoryUsage?: number;
    maxRenderTime?: number;
    maxObjects?: number;
  };
  userPreferences?: {
    enablePhysics: boolean;
    enableCelebrations: boolean;
    enableSounds: boolean;
    performanceMode: 'high' | 'medium' | 'low' | 'auto';
  };
}

// Performance mode settings
interface PerformanceModeSettings {
  enablePhysics: boolean;
  enableCelebrationEffects: boolean;
  enableSoundEffects: boolean;
  maxVisibleBalls: number;
  animationQuality: 'high' | 'medium' | 'low';
  updateFrequency: number; // ms between updates
}

const DEFAULT_PERFORMANCE_SETTINGS: PerformanceModeSettings = {
  enablePhysics: true,
  enableCelebrationEffects: true,
  enableSoundEffects: true,
  maxVisibleBalls: 200,
  animationQuality: 'high',
  updateFrequency: 16 // 60fps
};

const PERFORMANCE_MODE_SETTINGS: PerformanceModeSettings = {
  enablePhysics: false,
  enableCelebrationEffects: false,
  enableSoundEffects: false,
  maxVisibleBalls: 50,
  animationQuality: 'low',
  updateFrequency: 33 // 30fps
};

export const PerformanceOptimizedContainer: React.FC<PerformanceOptimizedContainerProps> = ({
  categoryStats,
  totalTime,
  fullHistory,
  categoryMap,
  timeRange,
  onBallClick,
  onCategorySelect,
  onScopeChange,
  isEmpty,
  isLoading,
  className = '',
  enablePerformanceMode = false,
  performanceThresholds,
  userPreferences
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isPerformanceModeActive, setIsPerformanceModeActive] = useState(enablePerformanceMode);
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceModeSettings>(
    enablePerformanceMode ? PERFORMANCE_MODE_SETTINGS : DEFAULT_PERFORMANCE_SETTINGS
  );

  // LifeOS Integration - use LifeOSAchievementJar if fullHistory is provided
  const shouldUseLifeOSIntegration = Boolean(fullHistory && categoryMap);
  
  // Apply user preferences to performance settings
  useEffect(() => {
    if (userPreferences) {
      const newSettings: PerformanceModeSettings = {
        ...performanceSettings,
        enablePhysics: userPreferences.enablePhysics,
        enableCelebrationEffects: userPreferences.enableCelebrations,
        enableSoundEffects: userPreferences.enableSounds
      };
      
      // Adjust settings based on performance mode
      switch (userPreferences.performanceMode) {
        case 'high':
          newSettings.maxVisibleBalls = 300;
          newSettings.animationQuality = 'high';
          newSettings.updateFrequency = 16;
          break;
        case 'medium':
          newSettings.maxVisibleBalls = 150;
          newSettings.animationQuality = 'medium';
          newSettings.updateFrequency = 32;
          break;
        case 'low':
          newSettings.maxVisibleBalls = 50;
          newSettings.animationQuality = 'low';
          newSettings.updateFrequency = 64;
          newSettings.enablePhysics = false;
          newSettings.enableCelebrationEffects = false;
          break;
        case 'auto':
          // Keep current auto-detected settings
          break;
      }
      
      setPerformanceSettings(newSettings);
    }
  }, [userPreferences]);

  // Intersection observer for lazy loading
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Lazy load heavy components
  const {
    module: achievementJarModule,
    isLoaded: jarLoaded,
    load: loadJar
  } = useLazyLoad(
    'achievement-jar-container',
    () => import('./AchievementJarContainer.js'),
    { priority: 'high' }
  );

  const {
    module: physicsModule,
    isLoaded: physicsLoaded,
    load: loadPhysics
  } = useLazyLoad(
    'physics-engine',
    () => import('./PhysicsEngine.js'),
    { priority: 'normal' }
  );

  const {
    module: celebrationModule,
    isLoaded: celebrationLoaded,
    load: loadCelebration
  } = useLazyLoad(
    'celebration-effects',
    () => import('./CelebrationEffectsSystem.js'),
    { priority: 'low' }
  );

  // Performance monitoring setup
  useEffect(() => {
    if (performanceThresholds) {
      performanceMonitor.updateThresholds(performanceThresholds);
    }

    performanceMonitor.setCallbacks({
      onMetricsUpdate: (metrics) => {
        setPerformanceMetrics(metrics);
      },
      onPerformanceIssue: (issue, metrics) => {
        console.warn('Performance issue detected:', issue);
        
        // Auto-enable performance mode if issues detected
        if (!isPerformanceModeActive && performanceMonitor.shouldEnablePerformanceMode()) {
          console.log('Auto-enabling performance mode due to performance issues');
          setIsPerformanceModeActive(true);
          setPerformanceSettings(PERFORMANCE_MODE_SETTINGS);
        }
      }
    });

    performanceMonitor.startMonitoring();

    return () => {
      performanceMonitor.stopMonitoring();
    };
  }, [performanceThresholds, isPerformanceModeActive]);

  // Update object count for performance monitoring
  useEffect(() => {
    const objectCount = categoryStats.length + 
      (performanceSettings.enableCelebrationEffects ? 50 : 0) + // Estimated particles
      (performanceSettings.enablePhysics ? categoryStats.length * 2 : 0); // Physics bodies
    
    performanceMonitor.setObjectCount(objectCount);
  }, [categoryStats.length, performanceSettings]);

  // Load components based on intersection and performance settings
  useEffect(() => {
    if (hasIntersected) {
      loadJar();
      
      if (performanceSettings.enablePhysics) {
        loadPhysics();
      }
      
      if (performanceSettings.enableCelebrationEffects) {
        loadCelebration();
      }
    }
  }, [hasIntersected, performanceSettings, loadJar, loadPhysics, loadCelebration]);

  // Optimized category stats (limit visible balls in performance mode)
  const optimizedCategoryStats = useMemo(() => {
    if (categoryStats.length <= performanceSettings.maxVisibleBalls) {
      return categoryStats;
    }

    // Keep top categories by time and merge smaller ones
    const sortedStats = [...categoryStats].sort((a, b) => b.totalMinutes - a.totalMinutes);
    const visibleStats = sortedStats.slice(0, performanceSettings.maxVisibleBalls - 1);
    const hiddenStats = sortedStats.slice(performanceSettings.maxVisibleBalls - 1);

    if (hiddenStats.length > 0) {
      const mergedStat: CategoryTimeStats = {
        categoryId: 'others',
        name: '其他',
        icon: '📊',
        color: '#94a3b8',
        totalMinutes: hiddenStats.reduce((sum, stat) => sum + stat.totalMinutes, 0),
        percentage: hiddenStats.reduce((sum, stat) => sum + stat.percentage, 0),
        priority: 0,
        entries: hiddenStats.reduce((sum, stat) => sum + stat.entries, 0)
      };
      
      visibleStats.push(mergedStat);
    }

    return visibleStats;
  }, [categoryStats, performanceSettings.maxVisibleBalls]);

  // Performance-aware render timing
  const renderWithPerformanceTracking = useCallback((renderFn: () => React.ReactNode) => {
    performanceMonitor.startRender();
    const result = renderFn();
    performanceMonitor.endRender();
    return result;
  }, []);

  // Handle performance mode toggle
  const togglePerformanceMode = useCallback(() => {
    const newMode = !isPerformanceModeActive;
    setIsPerformanceModeActive(newMode);
    setPerformanceSettings(newMode ? PERFORMANCE_MODE_SETTINGS : DEFAULT_PERFORMANCE_SETTINGS);
    
    console.log(`Performance mode ${newMode ? 'enabled' : 'disabled'}`);
  }, [isPerformanceModeActive]);

  // Performance stats display
  const performanceGrade = performanceMetrics ? performanceMonitor.getPerformanceGrade() : 'N/A';
  const poolStats = poolManager.getAllStats();

  return (
    <div 
      ref={(el) => {
        containerRef.current = el;
        elementRef.current = el;
      }}
      className={`performance-optimized-container ${className}`}
      data-performance-mode={isPerformanceModeActive}
      data-performance-grade={performanceGrade}
    >
      {/* Performance Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && performanceMetrics && (
        <div className="performance-debug-panel">
          <div className="performance-stats">
            <span>FPS: {performanceMetrics.fps}</span>
            <span>Grade: {performanceGrade}</span>
            <span>Objects: {performanceMetrics.totalObjects}</span>
            <span>Memory: {(performanceMetrics.memoryUsage.percentage * 100).toFixed(1)}%</span>
            <span>Pool: {poolStats.clayBalls.inUse}/{poolStats.clayBalls.totalSize}</span>
          </div>
          <button onClick={togglePerformanceMode} className="performance-toggle">
            {isPerformanceModeActive ? 'Disable' : 'Enable'} Performance Mode
          </button>
        </div>
      )}

      {/* Main Content */}
      {renderWithPerformanceTracking(() => (
        <>
          {/* Loading State */}
          {!jarLoaded && (
            <div className="performance-loading">
              <div className="loading-spinner"></div>
              <p>Loading optimized achievement jar...</p>
            </div>
          )}

          {/* Achievement Jar Container */}
          {shouldUseLifeOSIntegration ? (
            // Use LifeOS Integration when fullHistory is available
            <LifeOSAchievementJar
              fullHistory={fullHistory!}
              categoryMap={categoryMap!}
              timeRange={timeRange}
              onScopeChange={onScopeChange}
              performanceSettings={performanceSettings}
              className={`optimized-jar ${isPerformanceModeActive ? 'performance-mode' : ''}`}
            />
          ) : (
            // Use direct Achievement Jar Container for legacy support
            jarLoaded && achievementJarModule && (
              <achievementJarModule.AchievementJarContainer
                categoryStats={optimizedCategoryStats}
                totalTime={totalTime}
                timeRange={timeRange}
                onBallClick={onBallClick}
                onCategorySelect={onCategorySelect}
                isEmpty={isEmpty}
                isLoading={isLoading}
                className={`optimized-jar ${isPerformanceModeActive ? 'performance-mode' : ''}`}
                enablePhysics={performanceSettings.enablePhysics && physicsLoaded}
                animationQuality={performanceSettings.animationQuality}
                updateFrequency={performanceSettings.updateFrequency}
              />
            )
          )}

          {/* Performance Mode Indicator */}
          {isPerformanceModeActive && (
            <div className="performance-mode-indicator">
              <span>⚡ Performance Mode Active</span>
            </div>
          )}
        </>
      ))}

      <style jsx>{`
        .performance-optimized-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .performance-debug-panel {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .performance-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .performance-toggle {
          background: #8b5cf6;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
        }

        .performance-toggle:hover {
          background: #7c3aed;
        }

        .performance-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top: 3px solid #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .performance-mode-indicator {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .optimized-jar.performance-mode {
          filter: contrast(0.9) brightness(1.1);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .performance-debug-panel {
            top: 5px;
            right: 5px;
            padding: 6px;
            font-size: 10px;
          }

          .performance-stats {
            gap: 6px;
          }

          .performance-mode-indicator {
            bottom: 5px;
            left: 5px;
            padding: 6px 10px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

// Performance optimization hook
export const usePerformanceOptimization = (
  categoryStats: CategoryTimeStats[],
  options: {
    enableAutoOptimization?: boolean;
    performanceThresholds?: {
      minFPS?: number;
      maxMemoryUsage?: number;
      maxObjects?: number;
    };
  } = {}
) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<'none' | 'light' | 'aggressive'>('none');

  useEffect(() => {
    if (!options.enableAutoOptimization) return;

    const checkPerformance = () => {
      const metrics = performanceMonitor.getMetrics();
      const shouldOptimize = performanceMonitor.shouldEnablePerformanceMode();
      
      if (shouldOptimize && !isOptimized) {
        setIsOptimized(true);
        
        // Determine optimization level based on severity
        if (metrics.fps < 20 || metrics.memoryUsage.percentage > 0.9) {
          setOptimizationLevel('aggressive');
        } else {
          setOptimizationLevel('light');
        }
      } else if (!shouldOptimize && isOptimized) {
        setIsOptimized(false);
        setOptimizationLevel('none');
      }
    };

    const interval = setInterval(checkPerformance, 2000);
    return () => clearInterval(interval);
  }, [isOptimized, options.enableAutoOptimization]);

  const getOptimizedSettings = useCallback((): PerformanceModeSettings => {
    switch (optimizationLevel) {
      case 'aggressive':
        return {
          enablePhysics: false,
          enableCelebrationEffects: false,
          enableSoundEffects: false,
          maxVisibleBalls: 20,
          animationQuality: 'low',
          updateFrequency: 50 // 20fps
        };
      case 'light':
        return {
          enablePhysics: false,
          enableCelebrationEffects: true,
          enableSoundEffects: true,
          maxVisibleBalls: 100,
          animationQuality: 'medium',
          updateFrequency: 33 // 30fps
        };
      default:
        return DEFAULT_PERFORMANCE_SETTINGS;
    }
  }, [optimizationLevel]);

  return {
    isOptimized,
    optimizationLevel,
    optimizedSettings: getOptimizedSettings(),
    forceOptimization: (level: 'light' | 'aggressive') => {
      setIsOptimized(true);
      setOptimizationLevel(level);
    },
    disableOptimization: () => {
      setIsOptimized(false);
      setOptimizationLevel('none');
    }
  };
};

export default PerformanceOptimizedContainer;