/**
 * Achievement Jar Integration - Main App Integration Utilities
 * Utilities for integrating Achievement Jar into the main LifeOS application
 */

import React from 'react';
import { IntegratedProgressPage } from './IntegratedProgressPage.js';
import { DataAdapter } from './DataAdapter.js';
import { CategoryMapper } from './CategoryMapper.js';
import { TimeRangeProcessor } from './TimeRangeProcessor.js';
import { TimeRange } from './types.js';

export interface MainAppIntegrationConfig {
  enableAchievementJar: boolean;
  fallbackOnError: boolean;
  performanceThreshold: number;
  enablePhysics: boolean;
  enableCelebrationEffects: boolean;
  debugMode: boolean;
}

export interface LifeOSProgressPageProps {
  progressScope: TimeRange;
  fullHistory: string;
  categories: any[];
  customSounds?: Record<string, string>;
  onScopeChange: (scope: TimeRange) => void;
  calculateStatsFromLogs?: (logText: string) => any;
  getDateRangesForScope?: (scope: TimeRange) => any;
  getLogsInDateRange?: (fullHistory: string, start: string, end: string) => string;
}

/**
 * Main integration class for LifeOS
 */
export class MainAppIntegration {
  private config: MainAppIntegrationConfig;
  private dataAdapter: DataAdapter;

  constructor(config: Partial<MainAppIntegrationConfig> = {}) {
    this.config = {
      enableAchievementJar: true,
      fallbackOnError: true,
      performanceThreshold: 30,
      enablePhysics: true,
      enableCelebrationEffects: true,
      debugMode: false,
      ...config
    };

    this.dataAdapter = new DataAdapter({
      enableAchievementJar: this.config.enableAchievementJar,
      fallbackOnError: this.config.fallbackOnError,
      performanceThreshold: this.config.performanceThreshold,
      enablePhysics: this.config.enablePhysics,
      enableCelebrationEffects: this.config.enableCelebrationEffects
    });

    if (this.config.debugMode) {
      console.log('Achievement Jar Integration initialized:', this.config);
    }
  }

  /**
   * Create the integrated progress page component
   */
  createProgressPage(props: LifeOSProgressPageProps): React.ReactElement {
    return React.createElement(IntegratedProgressPage, {
      progressScope: props.progressScope,
      fullHistory: props.fullHistory,
      categories: props.categories,
      customSounds: props.customSounds,
      onScopeChange: props.onScopeChange,
      enableAchievementJar: this.config.enableAchievementJar,
      fallbackComponent: this.createTraditionalProgressComponent(props)
    });
  }

  /**
   * Create traditional progress component for fallback
   */
  private createTraditionalProgressComponent(props: LifeOSProgressPageProps) {
    return React.forwardRef<HTMLDivElement, any>((fallbackProps, ref) => {
      // This would render the traditional progress cards
      // Implementation would depend on the existing LifeOS progress card structure
      return React.createElement('div', {
        ref,
        className: 'traditional-progress-fallback',
        children: 'Traditional progress view (fallback)'
      });
    });
  }

  /**
   * Check if Achievement Jar should be enabled based on current conditions
   */
  shouldEnableAchievementJar(currentFps?: number): boolean {
    return this.dataAdapter.shouldEnableAchievementJar(currentFps);
  }

  /**
   * Get current configuration
   */
  getConfig(): MainAppIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MainAppIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.dataAdapter.updateConfig({
      enableAchievementJar: this.config.enableAchievementJar,
      fallbackOnError: this.config.fallbackOnError,
      performanceThreshold: this.config.performanceThreshold,
      enablePhysics: this.config.enablePhysics,
      enableCelebrationEffects: this.config.enableCelebrationEffects
    });

    if (this.config.debugMode) {
      console.log('Achievement Jar Integration config updated:', this.config);
    }
  }

  /**
   * Test data transformation with current settings
   */
  testDataTransformation(fullHistory: string, timeRange: TimeRange): any {
    try {
      const filteredLogs = TimeRangeProcessor.getLogsForTimeRange(fullHistory, timeRange);
      const result = this.dataAdapter.transformProgressData(filteredLogs, timeRange, []);
      
      if (this.config.debugMode) {
        console.log('Data transformation test result:', result);
      }
      
      return {
        success: true,
        data: result,
        isEmpty: result.isEmpty,
        categoryCount: result.categoryStats.length,
        totalTime: result.totalTime
      };
    } catch (error) {
      if (this.config.debugMode) {
        console.error('Data transformation test failed:', error);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }
}

/**
 * Global integration instance for easy access from main app
 */
let globalIntegration: MainAppIntegration | null = null;

/**
 * Initialize Achievement Jar integration for LifeOS
 */
export function initializeAchievementJarIntegration(
  config: Partial<MainAppIntegrationConfig> = {}
): MainAppIntegration {
  if (!globalIntegration) {
    globalIntegration = new MainAppIntegration(config);
  }
  return globalIntegration;
}

/**
 * Get the global integration instance
 */
export function getAchievementJarIntegration(): MainAppIntegration | null {
  return globalIntegration;
}

/**
 * Create Achievement Jar progress page (convenience function for main app)
 */
export function createAchievementJarProgressPage(props: LifeOSProgressPageProps): React.ReactElement {
  const integration = globalIntegration || initializeAchievementJarIntegration();
  return integration.createProgressPage(props);
}

/**
 * Utility functions for main app integration
 */
export const AchievementJarUtils = {
  /**
   * Check if browser supports Achievement Jar features
   */
  checkBrowserSupport(): { supported: boolean; missing: string[] } {
    const missing: string[] = [];
    
    // Check for required APIs
    if (typeof window === 'undefined') {
      missing.push('window object');
    }
    
    if (typeof requestAnimationFrame === 'undefined') {
      missing.push('requestAnimationFrame');
    }
    
    if (!CSS.supports('backdrop-filter', 'blur(10px)')) {
      missing.push('backdrop-filter (optional)');
    }
    
    if (!('IntersectionObserver' in window)) {
      missing.push('IntersectionObserver');
    }
    
    return {
      supported: missing.length === 0,
      missing
    };
  },

  /**
   * Get recommended configuration based on device capabilities
   */
  getRecommendedConfig(): Partial<MainAppIntegrationConfig> {
    const support = this.checkBrowserSupport();
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    
    return {
      enableAchievementJar: support.supported,
      enablePhysics: !isMobile && !isLowEnd,
      enableCelebrationEffects: support.supported,
      performanceThreshold: isMobile ? 45 : 30,
      fallbackOnError: true,
      debugMode: false
    };
  },

  /**
   * Create CSS classes for Achievement Jar integration
   */
  generateIntegrationCSS(): string {
    return `
      .integrated-progress-page {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 400px;
      }
      
      .achievement-jar-mode {
        background: linear-gradient(135deg, #FDFCFB 0%, #F9F7F5 100%);
      }
      
      .traditional-fallback {
        background: #FFFFFF;
      }
      
      .fallback-mode {
        border: 2px dashed #E0E0E0;
        border-radius: 12px;
      }
      
      @media (max-width: 768px) {
        .integrated-progress-page {
          min-height: 300px;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .integrated-progress-page * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
  }
};

/**
 * React hook for using Achievement Jar integration
 */
export function useAchievementJarIntegration(config?: Partial<MainAppIntegrationConfig>) {
  const [integration] = React.useState(() => 
    globalIntegration || initializeAchievementJarIntegration(config)
  );
  
  const [isEnabled, setIsEnabled] = React.useState(integration.getConfig().enableAchievementJar);
  
  const updateConfig = React.useCallback((newConfig: Partial<MainAppIntegrationConfig>) => {
    integration.updateConfig(newConfig);
    setIsEnabled(integration.getConfig().enableAchievementJar);
  }, [integration]);
  
  const createProgressPage = React.useCallback((props: LifeOSProgressPageProps) => {
    return integration.createProgressPage(props);
  }, [integration]);
  
  return {
    integration,
    isEnabled,
    updateConfig,
    createProgressPage,
    config: integration.getConfig()
  };
}

export default MainAppIntegration;