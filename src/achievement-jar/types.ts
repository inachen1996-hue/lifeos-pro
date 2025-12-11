/**
 * Achievement Jar Progress Visualization - Type Definitions
 * Core TypeScript interfaces for the Achievement Jar system
 */

// Macaron color type from existing system
export type MacaronColor = 
  | 'bg-macaron-blue' 
  | 'bg-macaron-green' 
  | 'bg-macaron-pink' 
  | 'bg-macaron-purple' 
  | 'bg-macaron-orange' 
  | 'bg-macaron-yellow' 
  | 'bg-emerald-200' 
  | 'bg-macaron-rose';

// Time range selector options
export type TimeRange = 'today' | 'weekly' | 'monthly';

// Category priority levels
export type CategoryPriority = 'high' | 'normal';

// Category statistics for jar visualization
export interface CategoryTimeStats {
  categoryId: string;
  name: string;
  totalMinutes: number;
  color: MacaronColor;
  icon: string;
  ballCount: number; // Calculated based on time duration
  priority: CategoryPriority; // Work/Study get high priority
  percentage: number; // Percentage of total time
}

// Individual clay ball properties
export interface ClayBallProps {
  id: string;
  categoryId: string;
  size: number; // Diameter in pixels (20-60px based on time duration)
  color: MacaronColor;
  position: { x: number; y: number };
  isSpecial?: boolean; // For reward balls (golden stars)
  glowIntensity?: number; // 0-1 for glow effect
  priority: CategoryPriority;
}

// Physics body for Matter.js simulation
export interface PhysicsBody {
  id: string;
  x: number;
  y: number;
  radius: number;
  mass: number;
  velocity: { x: number; y: number };
  categoryId: string;
  isStatic: boolean;
  restitution?: number; // Bounciness factor
  friction?: number; // Surface friction
}

// Metric card data for horizontal tray
export interface CategoryMetric {
  categoryId: string;
  name: string;
  icon: string;
  duration: number; // In hours
  color: MacaronColor;
  percentage: number;
  priority: CategoryPriority;
}

// Celebration effect types
export type CelebrationType = 'drum' | 'clap' | 'cheer';

export interface CelebrationEffect {
  type: 'danmaku' | 'confetti' | 'special-ball';
  duration: number; // In milliseconds
  intensity: 'low' | 'medium' | 'high';
  colors: string[];
  position?: { x: number; y: number };
  celebrationType?: CelebrationType;
}

// Danmaku (floating text) properties
export interface DanmakuItem {
  id: string;
  text: string;
  top: number; // Percentage from top
  duration: number; // Animation duration in seconds
  delay: number; // Delay before animation starts
  color?: string;
  celebrationType?: CelebrationType;
}

// Confetti particle properties
export interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number; // 0-1, decreases over time
}

// Achievement jar container props
export interface AchievementJarProps {
  categoryStats: CategoryTimeStats[];
  totalTime: number; // Total time in hours
  timeRange: TimeRange;
  onBallClick?: (categoryId: string) => void;
  className?: string;
}

// Metrics tray props
export interface MetricsTrayProps {
  metrics: CategoryMetric[];
  onCategorySelect?: (categoryId: string) => void;
  className?: string;
}

// Interaction dock props
export interface InteractionDockProps {
  onCelebration: (type: CelebrationType) => void;
  disabled?: boolean;
  className?: string;
}

// Raw progress data from existing system
export interface RawProgressData {
  work: number;
  study: number;
  rest: number;
  sleep: number;
  life: number;
  entertainment: number;
  health: number;
  hobby: number;
}

// Parsed log item from fullHistory
export interface ParsedLogItem {
  id: number;
  date: string;
  category: string;
  duration: number; // In hours
  description: string;
  startTime?: string;
  endTime?: string;
}

// Achievement conditions for special rewards
export interface AchievementCondition {
  id: string;
  name: string;
  description: string;
  condition: (stats: CategoryTimeStats[], totalTime: number) => boolean;
  rewardType: 'golden-star' | 'rainbow-ball' | 'special-effect';
  celebrationMessage: string;
}

// Performance monitoring data
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  ballCount: number;
  renderTime: number;
  physicsEnabled: boolean;
  averageFps?: number;
  memoryTrend?: 'increasing' | 'stable' | 'decreasing';
  bodyCount?: number;
  constraintCount?: number;
  sleepingBodies?: number;
}

// Error handling types
export type ErrorType = 
  | 'physics-engine-failure'
  | 'data-parsing-error'
  | 'audio-system-failure'
  | 'browser-compatibility'
  | 'performance-degradation';

export interface ErrorState {
  type: ErrorType;
  message: string;
  fallbackActive: boolean;
  timestamp: number;
}