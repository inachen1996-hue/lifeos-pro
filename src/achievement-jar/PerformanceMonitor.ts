/**
 * Performance Monitoring System
 * Tracks frame rate, memory usage, and performance metrics
 */

// Performance metrics interface
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  renderTime: number;
  updateTime: number;
  totalObjects: number;
  activeAnimations: number;
  timestamp: number;
}

// Performance thresholds
export interface PerformanceThresholds {
  minFPS: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  maxObjects: number;
}

// Default performance thresholds
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFPS: 30,
  maxMemoryUsage: 0.8, // 80% of available memory
  maxRenderTime: 16.67, // 60fps = 16.67ms per frame
  maxObjects: 200
};

// Performance monitor class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private thresholds: PerformanceThresholds;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private frameStartTime: number = 0;
  private renderStartTime: number = 0;
  private updateStartTime: number = 0;
  private isMonitoring: boolean = false;
  private animationId: number = 0;
  private callbacks: {
    onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
    onPerformanceIssue?: (issue: string, metrics: PerformanceMetrics) => void;
    onThresholdExceeded?: (threshold: keyof PerformanceThresholds, value: number) => void;
  } = {};

  private constructor(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
    this.metrics = this.createInitialMetrics();
  }

  static getInstance(thresholds?: PerformanceThresholds): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(thresholds);
    }
    return PerformanceMonitor.instance;
  }

  private createInitialMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: {
        used: 0,
        total: 0,
        percentage: 0
      },
      renderTime: 0,
      updateTime: 0,
      totalObjects: 0,
      activeAnimations: 0,
      timestamp: performance.now()
    };
  }

  // Start monitoring performance
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.measurePerformance();
  }

  // Stop monitoring performance
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  // Main performance measurement loop
  private measurePerformance = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameStartTime = currentTime;
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.lastTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      const frameTime = (currentTime - this.lastTime) / this.frameCount;

      this.metrics.fps = fps;
      this.metrics.frameTime = frameTime;
      this.metrics.timestamp = currentTime;

      // Update memory usage
      this.updateMemoryUsage();

      // Check for performance issues
      this.checkPerformanceThresholds();

      // Notify callbacks
      if (this.callbacks.onMetricsUpdate) {
        this.callbacks.onMetricsUpdate(this.metrics);
      }

      // Reset counters
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.animationId = requestAnimationFrame(this.measurePerformance);
  };

  // Update memory usage metrics
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryUsage = {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        percentage: memInfo.usedJSHeapSize / memInfo.totalJSHeapSize
      };
    }
  }

  // Check if performance thresholds are exceeded
  private checkPerformanceThresholds(): void {
    const { fps, memoryUsage, renderTime } = this.metrics;

    // Check FPS threshold
    if (fps < this.thresholds.minFPS) {
      this.notifyThresholdExceeded('minFPS', fps);
      this.notifyPerformanceIssue(`Low FPS detected: ${fps}fps (threshold: ${this.thresholds.minFPS}fps)`);
    }

    // Check memory usage threshold
    if (memoryUsage.percentage > this.thresholds.maxMemoryUsage) {
      this.notifyThresholdExceeded('maxMemoryUsage', memoryUsage.percentage);
      this.notifyPerformanceIssue(`High memory usage: ${(memoryUsage.percentage * 100).toFixed(1)}% (threshold: ${(this.thresholds.maxMemoryUsage * 100).toFixed(1)}%)`);
    }

    // Check render time threshold
    if (renderTime > this.thresholds.maxRenderTime) {
      this.notifyThresholdExceeded('maxRenderTime', renderTime);
      this.notifyPerformanceIssue(`Slow rendering: ${renderTime.toFixed(2)}ms (threshold: ${this.thresholds.maxRenderTime.toFixed(2)}ms)`);
    }

    // Check object count threshold
    if (this.metrics.totalObjects > this.thresholds.maxObjects) {
      this.notifyThresholdExceeded('maxObjects', this.metrics.totalObjects);
      this.notifyPerformanceIssue(`Too many objects: ${this.metrics.totalObjects} (threshold: ${this.thresholds.maxObjects})`);
    }
  }

  private notifyThresholdExceeded(threshold: keyof PerformanceThresholds, value: number): void {
    if (this.callbacks.onThresholdExceeded) {
      this.callbacks.onThresholdExceeded(threshold, value);
    }
  }

  private notifyPerformanceIssue(issue: string): void {
    if (this.callbacks.onPerformanceIssue) {
      this.callbacks.onPerformanceIssue(issue, this.metrics);
    }
  }

  // Mark start of render phase
  startRender(): void {
    this.renderStartTime = performance.now();
  }

  // Mark end of render phase
  endRender(): void {
    if (this.renderStartTime > 0) {
      this.metrics.renderTime = performance.now() - this.renderStartTime;
      this.renderStartTime = 0;
    }
  }

  // Mark start of update phase
  startUpdate(): void {
    this.updateStartTime = performance.now();
  }

  // Mark end of update phase
  endUpdate(): void {
    if (this.updateStartTime > 0) {
      this.metrics.updateTime = performance.now() - this.updateStartTime;
      this.updateStartTime = 0;
    }
  }

  // Update object count
  setObjectCount(count: number): void {
    this.metrics.totalObjects = count;
  }

  // Update active animation count
  setAnimationCount(count: number): void {
    this.metrics.activeAnimations = count;
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get performance recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const { fps, memoryUsage, renderTime, totalObjects } = this.metrics;

    if (fps < 30) {
      recommendations.push('Consider reducing visual effects or enabling performance mode');
    }

    if (memoryUsage.percentage > 0.7) {
      recommendations.push('High memory usage detected - consider clearing unused objects');
    }

    if (renderTime > 20) {
      recommendations.push('Rendering is slow - consider reducing complexity or using object pooling');
    }

    if (totalObjects > 150) {
      recommendations.push('Many objects active - consider implementing object culling');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal');
    }

    return recommendations;
  }

  // Set performance callbacks
  setCallbacks(callbacks: {
    onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
    onPerformanceIssue?: (issue: string, metrics: PerformanceMetrics) => void;
    onThresholdExceeded?: (threshold: keyof PerformanceThresholds, value: number) => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Update thresholds
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  // Get performance grade (A-F)
  getPerformanceGrade(): string {
    const { fps, memoryUsage, renderTime } = this.metrics;
    let score = 100;

    // FPS scoring (40% weight)
    if (fps >= 60) score -= 0;
    else if (fps >= 45) score -= 10;
    else if (fps >= 30) score -= 20;
    else if (fps >= 20) score -= 30;
    else score -= 40;

    // Memory scoring (30% weight)
    if (memoryUsage.percentage <= 0.5) score -= 0;
    else if (memoryUsage.percentage <= 0.7) score -= 10;
    else if (memoryUsage.percentage <= 0.8) score -= 20;
    else score -= 30;

    // Render time scoring (30% weight)
    if (renderTime <= 16.67) score -= 0;
    else if (renderTime <= 25) score -= 10;
    else if (renderTime <= 33.33) score -= 20;
    else score -= 30;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Check if performance mode should be enabled
  shouldEnablePerformanceMode(): boolean {
    const { fps, memoryUsage, renderTime } = this.metrics;
    
    return fps < this.thresholds.minFPS ||
           memoryUsage.percentage > this.thresholds.maxMemoryUsage ||
           renderTime > this.thresholds.maxRenderTime;
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      grade: this.getPerformanceGrade(),
      recommendations: this.getRecommendations()
    }, null, 2);
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  private static rafCallbacks: (() => void)[] = [];
  private static rafId: number = 0;
  private static isRunning: boolean = false;

  // Batch RAF callbacks for better performance
  static scheduleUpdate(callback: () => void): void {
    this.rafCallbacks.push(callback);
    
    if (!this.isRunning) {
      this.isRunning = true;
      this.rafId = requestAnimationFrame(this.processCallbacks);
    }
  }

  private static processCallbacks = (): void => {
    const callbacks = [...this.rafCallbacks];
    this.rafCallbacks.length = 0;
    this.isRunning = false;

    callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in RAF callback:', error);
      }
    });
  };

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = performance.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }

  // Debounce function calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

export default {
  PerformanceMonitor,
  PerformanceOptimizer,
  performanceMonitor,
  DEFAULT_THRESHOLDS
};