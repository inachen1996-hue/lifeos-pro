/**
 * Achievement Jar Integration - Data Adapter
 * Converts existing LifeOS data formats to Achievement Jar system format
 */

import { CategoryTimeStats, CategoryMetric, RawProgressData, TimeRange } from './types.js';
import { transformProgressStats, transformToMetrics, validateCategoryData } from './data-transformer.js';

export interface AdaptedProgressData {
  categoryStats: CategoryTimeStats[];
  totalTime: number;
  metrics: CategoryMetric[];
  timeRange: TimeRange;
  isEmpty: boolean;
}

export interface IntegrationConfig {
  enableAchievementJar: boolean;
  fallbackOnError: boolean;
  performanceThreshold: number;
  enablePhysics: boolean;
  enableCelebrationEffects: boolean;
}

/**
 * Main data adapter class for converting LifeOS data to Achievement Jar format
 */
export class DataAdapter {
  private config: IntegrationConfig;

  constructor(config: Partial<IntegrationConfig> = {}) {
    this.config = {
      enableAchievementJar: true,
      fallbackOnError: true,
      performanceThreshold: 30, // Minimum FPS
      enablePhysics: true,
      enableCelebrationEffects: true,
      ...config
    };
  }

  /**
   * Transform progress data from existing LifeOS format to Achievement Jar format
   */
  transformProgressData(
    fullHistory: string,
    timeRange: TimeRange,
    categories: any[]
  ): AdaptedProgressData {
    try {
      // Use existing calculateStatsFromLogs logic
      const rawStats = this.calculateStatsFromLogs(fullHistory);
      
      // Transform to Achievement Jar format
      const categoryStats = transformProgressStats(rawStats);
      const validatedStats = validateCategoryData(categoryStats);
      
      // Calculate total time
      const totalTime = Object.values(rawStats).reduce((sum, hours) => sum + hours, 0);
      
      // Generate metrics for tray
      const metrics = transformToMetrics(validatedStats);
      
      // Check if data is empty
      const isEmpty = totalTime === 0 || validatedStats.length === 0;

      return {
        categoryStats: validatedStats,
        totalTime,
        metrics,
        timeRange,
        isEmpty
      };
    } catch (error) {
      console.error('DataAdapter: Error transforming progress data:', error);
      
      // Return empty state on error
      return {
        categoryStats: [],
        totalTime: 0,
        metrics: [],
        timeRange,
        isEmpty: true
      };
    }
  }

  /**
   * Calculate statistics from log text (mirrors existing LifeOS logic)
   */
  private calculateStatsFromLogs(logText: string): RawProgressData {
    const stats: RawProgressData = { 
      work: 0, 
      study: 0, 
      rest: 0, 
      sleep: 0, 
      life: 0, 
      entertainment: 0, 
      health: 0, 
      hobby: 0 
    };
    
    if (!logText) return stats;
    
    const lines = logText.split('\n');
    const durationRegex = /(\d+(\.\d+)?)\s*(h|m|min|hour)/i; 
    const isoTimeRegex = /(?:\||｜)\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:\d{2})?)\s*(?:\||｜)\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:\d{2})?)/;
    const categoryRegex = /\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]/i;
    
    lines.forEach(line => {
      if (!line.trim()) return;

      let hours = 0;
      const isoMatch = line.match(isoTimeRegex);
      if (isoMatch) {
        const start = new Date(isoMatch[1]).getTime();
        const end = new Date(isoMatch[2]).getTime();
        if (!isNaN(start) && !isNaN(end) && end > start) {
          hours = (end - start) / (1000 * 60 * 60);
        }
      } else {
        const durMatch = line.match(durationRegex);
        if (durMatch) {
          const val = parseFloat(durMatch[1]);
          const unit = durMatch[3].toLowerCase();
          hours = unit.startsWith('m') ? val / 60 : val;
        }
      }

      if (hours > 0) {
        const catMatch = line.match(categoryRegex);
        if (catMatch) {
          const cat = catMatch[1].toLowerCase() as keyof RawProgressData;
          if (stats[cat] !== undefined) {
            stats[cat] += hours;
          }
        } else {
          // Fallback Keywords (mirrors existing logic)
          const l = line.toLowerCase();
          if (l.includes('工作') || l.includes('work')) stats.work += hours;
          else if (l.includes('学习') || l.includes('study')) stats.study += hours;
          else if (l.includes('休息') || l.includes('rest')) stats.rest += hours;
          else if (l.includes('睡觉') || l.includes('sleep')) stats.sleep += hours;
          else if (l.includes('生活') || l.includes('life')) stats.life += hours;
          else if (l.includes('娱乐') || l.includes('entertainment')) stats.entertainment += hours;
          else if (l.includes('健康') || l.includes('health')) stats.health += hours;
          else if (l.includes('兴趣') || l.includes('hobby')) stats.hobby += hours;
          else stats.work += hours; // Default to work
        }
      }
    });

    return stats;
  }

  /**
   * Get current configuration
   */
  getConfig(): IntegrationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if Achievement Jar should be enabled based on configuration and performance
   */
  shouldEnableAchievementJar(currentFps?: number): boolean {
    if (!this.config.enableAchievementJar) return false;
    
    if (currentFps !== undefined && currentFps < this.config.performanceThreshold) {
      return false;
    }
    
    return true;
  }
}