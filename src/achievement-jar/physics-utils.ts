/**
 * Achievement Jar Progress Visualization - Physics Utilities
 * Utility functions for physics simulation and ball positioning
 */

import { ClayBallProps, PhysicsBody, PerformanceMetrics } from './types.js';

/**
 * Convert ClayBall to PhysicsBody for Matter.js simulation
 */
export function createPhysicsBody(ball: ClayBallProps, jarBounds: { width: number; height: number }): PhysicsBody {
  const radius = ball.size / 2;
  
  // Calculate mass based on size and priority
  const baseMass = Math.PI * radius * radius * 0.001; // Base density
  const priorityMass = ball.priority === 'high' ? baseMass * 1.2 : baseMass;
  
  return {
    id: ball.id,
    x: jarBounds.width / 2 + (Math.random() - 0.5) * 20, // Slight random offset
    y: -radius, // Start above the jar
    radius,
    mass: priorityMass,
    velocity: { x: 0, y: 0 },
    categoryId: ball.categoryId,
    isStatic: false,
    restitution: ball.isSpecial ? 0.8 : 0.6, // Special balls are more bouncy
    friction: 0.3
  };
}

/**
 * Generate stable stacking positions using CSS fallback
 * Used when Matter.js is not available or performance is poor
 */
export function generateStackedPositions(
  balls: ClayBallProps[], 
  jarBounds: { width: number; height: number; bottomY: number }
): { [ballId: string]: { x: number; y: number } } {
  const positions: { [ballId: string]: { x: number; y: number } } = {};
  
  // Sort balls by priority first, then by size (larger balls at bottom)
  const sortedBalls = [...balls].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : 1; // High priority first
    }
    return b.size - a.size; // Larger balls first within same priority
  });
  
  let currentLayer = 0;
  let ballsInCurrentLayer = 0;
  const baseBallsPerLayer = Math.floor(jarBounds.width / 35); // More conservative spacing
  
  sortedBalls.forEach((ball, index) => {
    const radius = ball.size / 2;
    
    // Dynamic balls per layer based on ball sizes in current layer
    const maxBallsPerLayer = Math.max(1, Math.floor(jarBounds.width / (ball.size + 5)));
    
    // Calculate layer and position within layer
    if (ballsInCurrentLayer >= maxBallsPerLayer) {
      currentLayer++;
      ballsInCurrentLayer = 0;
    }
    
    // Enhanced layer positioning with curved bottom simulation
    const layerY = jarBounds.bottomY - (currentLayer * ball.size * 0.75) - radius;
    const layerWidth = Math.max(ball.size * 2, jarBounds.width - (currentLayer * 8)); // Gradually narrower
    const ballsInThisLayer = Math.min(maxBallsPerLayer, sortedBalls.length - (currentLayer * maxBallsPerLayer));
    
    // Center the layer and distribute balls evenly
    const layerStartX = (jarBounds.width - layerWidth) / 2;
    const ballSpacing = ballsInThisLayer > 1 ? layerWidth / (ballsInThisLayer - 1) : 0;
    const ballX = layerStartX + (ballsInCurrentLayer * ballSpacing);
    
    // Add slight random offset for more natural look
    const randomOffset = (Math.random() - 0.5) * Math.min(10, ball.size * 0.2);
    
    positions[ball.id] = {
      x: Math.max(radius, Math.min(jarBounds.width - radius, ballX + randomOffset)),
      y: Math.max(radius, layerY)
    };
    
    ballsInCurrentLayer++;
  });
  
  return positions;
}

/**
 * Check for ball collisions in CSS fallback mode
 */
export function checkCollisions(
  positions: { [ballId: string]: { x: number; y: number } },
  balls: ClayBallProps[],
  jarBounds?: { width: number; height: number; bottomY: number }
): { [ballId: string]: { x: number; y: number } } {
  const adjustedPositions = { ...positions };
  const ballMap = new Map(balls.map(ball => [ball.id, ball]));
  
  // Use default bounds if not provided
  const bounds = jarBounds || { width: 400, height: 300, bottomY: 280 };
  
  // Multiple passes to resolve all collisions
  for (let pass = 0; pass < 5; pass++) {
    let hasCollisions = false;
    
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const ballA = balls[i];
        const ballB = balls[j];
        
        if (ballA.id === ballB.id) continue;
        
        const posA = adjustedPositions[ballA.id];
        const posB = adjustedPositions[ballB.id];
        
        if (!posA || !posB) continue;
        
        const radiusA = ballA.size / 2;
        const radiusB = ballB.size / 2;
        const minDistance = radiusA + radiusB + 3; // Slightly larger gap for stability
        
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance && distance > 0.1) {
          hasCollisions = true;
          
          // Calculate separation vector
          const overlap = minDistance - distance;
          const separationX = (dx / distance) * overlap * 0.5;
          const separationY = (dy / distance) * overlap * 0.5;
          
          // Move balls apart with boundary constraints
          const newPosA = {
            x: Math.max(radiusA, Math.min(bounds.width - radiusA, posA.x - separationX)),
            y: Math.max(radiusA, posA.y - separationY)
          };
          
          const newPosB = {
            x: Math.max(radiusB, Math.min(bounds.width - radiusB, posB.x + separationX)),
            y: Math.max(radiusB, posB.y + separationY)
          };
          
          adjustedPositions[ballA.id] = newPosA;
          adjustedPositions[ballB.id] = newPosB;
        }
      }
    }
    
    // If no collisions found, we're done
    if (!hasCollisions) break;
  }
  
  return adjustedPositions;
}

/**
 * Animate ball dropping effect for CSS fallback
 */
export function createDropAnimation(
  ball: ClayBallProps,
  startY: number,
  endY: number,
  duration: number = 800
): string {
  const animationName = `drop-${ball.id}`;
  
  // Create keyframes for the drop animation
  const keyframes = `
    @keyframes ${animationName} {
      0% {
        transform: translateY(${startY}px) scale(1);
        opacity: 0.8;
      }
      70% {
        transform: translateY(${endY}px) scale(1.1);
        opacity: 1;
      }
      85% {
        transform: translateY(${endY + 5}px) scale(0.95);
      }
      100% {
        transform: translateY(${endY}px) scale(1);
        opacity: 1;
      }
    }
  `;
  
  // Inject keyframes into document
  if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);
    
    // Clean up after animation
    setTimeout(() => {
      document.head.removeChild(styleSheet);
    }, duration + 100);
  }
  
  return `${animationName} ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
}

/**
 * Calculate jar bounds based on container size
 */
export function calculateJarBounds(containerWidth: number, containerHeight: number): {
  width: number;
  height: number;
  bottomY: number;
  centerX: number;
} {
  // Jar takes up 70% of container width, 60% of height
  const jarWidth = containerWidth * 0.7;
  const jarHeight = containerHeight * 0.6;
  const bottomY = containerHeight * 0.8; // Leave space at bottom
  const centerX = containerWidth / 2;
  
  return {
    width: jarWidth,
    height: jarHeight,
    bottomY,
    centerX
  };
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private degradationCount = 0;
  
  constructor() {
    this.lastTime = performance.now();
  }
  
  update(): PerformanceMetrics {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameCount++;
    
    // Calculate FPS every second
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Track FPS history for trend analysis
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }
      
      // Track memory history
      const memoryUsage = this.getMemoryUsage();
      this.memoryHistory.push(memoryUsage);
      if (this.memoryHistory.length > 10) {
        this.memoryHistory.shift();
      }
    }
    
    return {
      fps: this.fps,
      memoryUsage: this.getMemoryUsage(),
      ballCount: 0, // Will be set by caller
      renderTime: deltaTime,
      physicsEnabled: true, // Will be set by caller
      averageFps: this.getAverageFps(),
      memoryTrend: this.getMemoryTrend()
    };
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  private getAverageFps(): number {
    if (this.fpsHistory.length === 0) return this.fps;
    return Math.round(this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length);
  }
  
  private getMemoryTrend(): 'increasing' | 'stable' | 'decreasing' {
    if (this.memoryHistory.length < 3) return 'stable';
    
    const recent = this.memoryHistory.slice(-3);
    const isIncreasing = recent[2] > recent[1] && recent[1] > recent[0];
    const isDecreasing = recent[2] < recent[1] && recent[1] < recent[0];
    
    if (isIncreasing) return 'increasing';
    if (isDecreasing) return 'decreasing';
    return 'stable';
  }
  
  shouldDegrade(metrics: PerformanceMetrics): boolean {
    // Enhanced degradation logic with hysteresis
    const lowFps = metrics.fps < 25;
    const highMemory = metrics.memoryUsage > 120;
    const poorAverageFps = this.getAverageFps() < 30;
    const memoryIncreasing = this.getMemoryTrend() === 'increasing' && metrics.memoryUsage > 80;
    
    const shouldDegrade = lowFps || highMemory || poorAverageFps || memoryIncreasing;
    
    if (shouldDegrade) {
      this.degradationCount++;
      // Only degrade after consistent poor performance
      return this.degradationCount >= 3;
    } else {
      this.degradationCount = Math.max(0, this.degradationCount - 1);
      return false;
    }
  }
  
  reset(): void {
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.degradationCount = 0;
  }
}

/**
 * Generate random positions for celebration balls
 */
export function generateCelebrationBallPositions(
  count: number,
  jarBounds: { width: number; height: number; centerX: number }
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  
  for (let i = 0; i < count; i++) {
    positions.push({
      x: jarBounds.centerX + (Math.random() - 0.5) * jarBounds.width * 0.8,
      y: -50 - Math.random() * 100 // Start above the jar
    });
  }
  
  return positions;
}

/**
 * Validate physics body constraints
 */
export function validatePhysicsBody(body: PhysicsBody, jarBounds: { width: number; height: number }): PhysicsBody {
  return {
    ...body,
    x: Math.max(body.radius, Math.min(jarBounds.width - body.radius, body.x)),
    y: Math.max(body.radius, body.y),
    radius: Math.max(10, Math.min(30, body.radius)), // Reasonable size limits
    mass: Math.max(0.001, Math.min(1, body.mass)) // Reasonable mass limits
  };
}