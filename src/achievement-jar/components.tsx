/**
 * Achievement Jar Integration - Component Exports
 * Simplified component exports for main application integration
 */

// Main integration components
export { IntegratedProgressPage } from './IntegratedProgressPage.js';
export { MainAppIntegration, initializeAchievementJarIntegration, createAchievementJarProgressPage, AchievementJarUtils, useAchievementJarIntegration } from './MainAppIntegration.js';

// Data processing
export { DataAdapter } from './DataAdapter.js';
export { CategoryMapper } from './CategoryMapper.js';
export { TimeRangeProcessor } from './TimeRangeProcessor.js';
export { ValidationUtils } from './ValidationUtils.js';

// Core Achievement Jar components (re-exported from index)
export { 
  LifeOSAchievementJar as AchievementJar,
  AchievementJarContainer,
  MetricsTray,
  InteractionDock,
  ClayBall,
  ClayBallCollection
} from './index.js';

// Error handling and loading states
export { ErrorBoundary } from './ErrorBoundary.js';
export { LoadingStates } from './LoadingStates.js';

// Types for main app
export type { 
  TimeRange,
  CategoryTimeStats,
  CategoryMetric,
  AchievementJarProps,
  CelebrationType
} from './types.js';

export type { 
  IntegratedProgressPageProps 
} from './IntegratedProgressPage.js';

export type { 
  MainAppIntegrationConfig,
  LifeOSProgressPageProps 
} from './MainAppIntegration.js';

export type { 
  AdaptedProgressData,
  IntegrationConfig 
} from './DataAdapter.js';

/**
 * Quick setup function for main application
 * This is the main entry point for integrating Achievement Jar into LifeOS
 */
export const setupAchievementJar = (config?: {
  enableAchievementJar?: boolean;
  enablePhysics?: boolean;
  enableCelebrationEffects?: boolean;
  debugMode?: boolean;
}) => {
  const integration = initializeAchievementJarIntegration(config);
  
  // Add CSS to document if not already present
  if (!document.getElementById('achievement-jar-styles')) {
    const style = document.createElement('style');
    style.id = 'achievement-jar-styles';
    style.textContent = AchievementJarUtils.generateIntegrationCSS();
    document.head.appendChild(style);
  }
  
  return integration;
};

/**
 * React component factory for easy integration
 */
export const createProgressPageComponent = (defaultConfig?: any) => {
  return (props: any) => {
    const integration = initializeAchievementJarIntegration(defaultConfig);
    return integration.createProgressPage(props);
  };
};