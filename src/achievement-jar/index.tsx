/**
 * Achievement Jar Progress Visualization - Main Export
 * Complete integration with LifeOS system
 */

// Core components
export { AchievementJarContainer } from './AchievementJarContainer.js';
export { ClayBall, ClayBallCollection } from './ClayBall.js';
export { MetricsTray } from './MetricsTray.js';
export { InteractionDock } from './InteractionDock.js';

// Physics and effects
export { PhysicsEngine } from './PhysicsEngine.js';
export { CelebrationEffectsSystem } from './CelebrationEffectsSystem.js';
export { SoundEffectsSystem } from './SoundEffectsSystem.js';
export { ConfettiRenderer } from './ConfettiRenderer.js';
export { DanmakuSystem } from './DanmakuSystem.js';

// Styling and responsive design
export { 
  AiryMacaronStyleProvider,
  generateFrostedGlassStyle,
  generateResponsiveContainerStyle,
  supportsBackdropFilter
} from './AiryMacaronStyles.js';

export {
  useViewport,
  useResponsiveConfig,
  useTouchCapabilities,
  usePerformanceCapabilities,
  ResponsiveContainer,
  ResponsiveGrid,
  usePerformanceMonitor,
  useOrientationChange,
  useAdaptiveQuality,
  responsiveUtils,
  generateResponsiveStyles,
  generateAnimationKeyframes
} from './ResponsiveDesign.js';

// Data transformation and utilities
export {
  generateEmptyStateData,
  generateClayBalls,
  checkAchievements,
  transformCategoryData,
  calculateBallSize,
  calculateBallColor
} from './data-transformer.js';

// Types
export type {
  AchievementJarProps,
  CategoryTimeStats,
  CategoryMetric,
  ClayBall as ClayBallType,
  PhysicsBody,
  CelebrationEffect,
  SoundEffect,
  AiryMacaronTheme,
  ViewportDimensions,
  TouchCapabilities,
  PerformanceCapabilities,
  ResponsiveConfig
} from './types.js';

// LifeOS Integration
export { 
  LifeOSAchievementJar as default,
  LifeOSAchievementJar 
} from './LifeOSIntegration.js';

export {
  AudioSystemIntegration,
  useLifeOSAudio,
  LifeOSAudioStorage,
  AudioFileValidator
} from './AudioSystemIntegration.js';

export {
  AchievementJarProvider,
  useAchievementJar,
  useLifeOSSync,
  useCelebrationManager,
  useCategoryManager,
  useTimeRangeManager
} from './StateManagement.js';

// Utility functions for easy integration
export const createAchievementJarWithLifeOS = (
  fullHistory: string,
  categoryMap: Record<string, any>,
  options: {
    progressScope?: 'today' | 'weekly' | 'monthly';
    enableAudio?: boolean;
    enablePhysics?: boolean;
    enableCelebrations?: boolean;
    customSounds?: Record<string, string>;
  } = {}
) => {
  const {
    progressScope = 'today',
    enableAudio = true,
    enablePhysics = true,
    enableCelebrations = true,
    customSounds = {}
  } = options;

  return {
    fullHistory,
    categoryMap,
    progressScope,
    enableAudio,
    enablePhysics,
    enableCelebrations,
    customSounds
  };
};

// Quick setup function for LifeOS integration
export const setupAchievementJarForLifeOS = () => {
  // This function can be called from the main LifeOS app to set up the Achievement Jar
  console.log('Achievement Jar system ready for LifeOS integration');
  
  return {
    version: '1.0.0',
    features: [
      'Responsive design and mobile optimization',
      'LifeOS data source integration',
      'Category color system compatibility',
      'Audio system integration',
      'State management and synchronization',
      'Property-based testing coverage'
    ],
    requirements: {
      react: '>=18.0.0',
      typescript: '>=4.5.0',
      vitest: '>=1.0.0'
    }
  };
};