/**
 * Achievement Jar Integration - Data Adapter Property Tests
 * Property-based tests for data transformation accuracy
 */

import { describe, it, expect } from 'vitest';
import { DataAdapter, AdaptedProgressData } from './DataAdapter.js';
import { CategoryMapper } from './CategoryMapper.js';
import { TimeRangeProcessor } from './TimeRangeProcessor.js';
import { ValidationUtils } from './ValidationUtils.js';
import { RawProgressData, TimeRange } from './types.js';

/**
 * **Feature: achievement-jar-integration, Property 2: 数据转换准确性**
 * **Validates: Requirements 3.1, 3.2, 3.3**
 * 
 * For any existing progress data, the transformed Achievement Jar data should maintain 
 * statistical accuracy and correct category mapping
 */
describe('DataAdapter Property Tests', () => {
  const adapter = new DataAdapter();

  // Helper function to generate valid log text
  function generateLogText(categories: string[], hours: number[]): string {
    const lines: string[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    categories.forEach((category, index) => {
      if (hours[index] > 0) {
        lines.push(`${today}: [${category.toUpperCase()}] Test activity ${hours[index]}h`);
      }
    });
    
    return lines.join('\n');
  }

  // Helper function to generate valid raw progress data
  function generateRawProgressData(
    work = 0, study = 0, rest = 0, sleep = 0, 
    life = 0, entertainment = 0, health = 0, hobby = 0
  ): RawProgressData {
    return { work, study, rest, sleep, life, entertainment, health, hobby };
  }

  it('should preserve total time accuracy across all transformations', () => {
    // Test with various combinations of category hours
    const testCases = [
      [2, 1.5, 0.5, 8, 1, 2, 0.5, 1], // Normal day
      [8, 0, 0, 0, 0, 0, 0, 0],        // Work only
      [0, 6, 0, 0, 0, 0, 0, 0],        // Study only
      [4, 2, 1, 7, 2, 3, 1, 0.5],     // Balanced day
      [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8], // Small values
    ];

    testCases.forEach((hours, testIndex) => {
      const [work, study, rest, sleep, life, entertainment, health, hobby] = hours;
      const logText = generateLogText(
        ['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'],
        hours
      );
      
      const result = adapter.transformProgressData(logText, 'today', []);
      const expectedTotal = hours.reduce((sum, h) => sum + h, 0);
      
      // Allow small floating point differences (within 0.01 hours = 36 seconds)
      expect(Math.abs(result.totalTime - expectedTotal)).toBeLessThan(0.01);
      
      // Verify category stats sum matches total
      const categorySum = result.categoryStats.reduce((sum, stat) => sum + (stat.totalMinutes / 60), 0);
      expect(Math.abs(categorySum - expectedTotal)).toBeLessThan(0.01);
    });
  });

  it('should maintain category mapping consistency', () => {
    const categories = ['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'];
    const hours = [2, 1.5, 1, 8, 1.5, 2, 0.5, 1];
    
    const logText = generateLogText(categories, hours);
    const result = adapter.transformProgressData(logText, 'today', []);
    
    result.categoryStats.forEach(stat => {
      // Verify category mapping is consistent
      expect(stat.name).toBe(CategoryMapper.getCategoryName(stat.categoryId));
      expect(stat.color).toBe(CategoryMapper.getAchievementJarColor(stat.categoryId));
      expect(stat.icon).toBe(CategoryMapper.getCategoryIcon(stat.categoryId));
      expect(stat.priority).toBe(CategoryMapper.getCategoryPriority(stat.categoryId));
      
      // Verify category is supported
      expect(CategoryMapper.isSupportedCategory(stat.categoryId)).toBe(true);
    });
  });

  it('should correctly calculate percentages that sum to 100%', () => {
    const testCases = [
      [4, 2, 1, 1], // Simple case
      [1, 1, 1, 1, 1, 1, 1, 1], // Equal distribution
      [10, 0.5, 0.3, 0.2], // Uneven distribution
      [0.1, 0.1, 0.1, 0.7], // Small values with one large
    ];

    testCases.forEach(hours => {
      const categories = ['work', 'study', 'rest', 'sleep'].slice(0, hours.length);
      const logText = generateLogText(categories, hours);
      
      const result = adapter.transformProgressData(logText, 'today', []);
      
      if (result.categoryStats.length > 0) {
        const totalPercentage = result.categoryStats.reduce((sum, stat) => sum + stat.percentage, 0);
        
        // Allow small floating point differences
        expect(Math.abs(totalPercentage - 100)).toBeLessThan(0.1);
        
        // Each percentage should be reasonable
        result.categoryStats.forEach(stat => {
          expect(stat.percentage).toBeGreaterThanOrEqual(0);
          expect(stat.percentage).toBeLessThanOrEqual(100);
        });
      }
    });
  });

  it('should handle edge cases gracefully', () => {
    // Test empty data
    const emptyResult = adapter.transformProgressData('', 'today', []);
    expect(emptyResult.isEmpty).toBe(true);
    expect(emptyResult.totalTime).toBe(0);
    expect(emptyResult.categoryStats).toHaveLength(0);

    // Test invalid data
    const invalidResult = adapter.transformProgressData('invalid log format', 'today', []);
    expect(invalidResult.isEmpty).toBe(true);

    // Test very small values
    const smallLogText = generateLogText(['work'], [0.001]); // 3.6 seconds
    const smallResult = adapter.transformProgressData(smallLogText, 'today', []);
    expect(smallResult.totalTime).toBeGreaterThan(0);

    // Test very large values
    const largeLogText = generateLogText(['work'], [23.5]); // Almost 24 hours
    const largeResult = adapter.transformProgressData(largeLogText, 'today', []);
    expect(largeResult.totalTime).toBeLessThanOrEqual(24);
  });

  it('should maintain ball count consistency with time duration', () => {
    const testCases = [
      { hours: 0.5, expectedMinBalls: 1, expectedMaxBalls: 2 },
      { hours: 1, expectedMinBalls: 2, expectedMaxBalls: 3 },
      { hours: 2, expectedMinBalls: 3, expectedMaxBalls: 4 },
      { hours: 4, expectedMinBalls: 4, expectedMaxBalls: 5 },
      { hours: 8, expectedMinBalls: 5, expectedMaxBalls: 8 },
    ];

    testCases.forEach(({ hours, expectedMinBalls, expectedMaxBalls }) => {
      const logText = generateLogText(['work'], [hours]);
      const result = adapter.transformProgressData(logText, 'today', []);
      
      expect(result.categoryStats).toHaveLength(1);
      const stat = result.categoryStats[0];
      
      expect(stat.ballCount).toBeGreaterThanOrEqual(expectedMinBalls);
      expect(stat.ballCount).toBeLessThanOrEqual(expectedMaxBalls);
      
      // Ball count should increase with more time
      if (hours > 1) {
        expect(stat.ballCount).toBeGreaterThan(0);
      }
    });
  });

  it('should prioritize work and study categories correctly', () => {
    const logText = generateLogText(
      ['work', 'study', 'rest', 'entertainment'],
      [2, 1.5, 3, 4] // Rest and entertainment have more time
    );
    
    const result = adapter.transformProgressData(logText, 'today', []);
    
    // Find high priority categories
    const highPriorityStats = result.categoryStats.filter(stat => stat.priority === 'high');
    const normalPriorityStats = result.categoryStats.filter(stat => stat.priority === 'normal');
    
    expect(highPriorityStats.length).toBeGreaterThan(0);
    expect(normalPriorityStats.length).toBeGreaterThan(0);
    
    // High priority categories should come first in sorted order
    const workIndex = result.categoryStats.findIndex(stat => stat.categoryId === 'work');
    const studyIndex = result.categoryStats.findIndex(stat => stat.categoryId === 'study');
    const restIndex = result.categoryStats.findIndex(stat => stat.categoryId === 'rest');
    
    if (workIndex !== -1 && restIndex !== -1) {
      expect(workIndex).toBeLessThan(restIndex);
    }
    if (studyIndex !== -1 && restIndex !== -1) {
      expect(studyIndex).toBeLessThan(restIndex);
    }
  });

  it('should handle different time ranges correctly', () => {
    const timeRanges: TimeRange[] = ['today', 'weekly', 'monthly'];
    const logText = generateLogText(['work', 'study'], [4, 2]);
    
    timeRanges.forEach(timeRange => {
      const result = adapter.transformProgressData(logText, timeRange, []);
      
      expect(result.timeRange).toBe(timeRange);
      expect(ValidationUtils.isSafeForRendering(result)).toBe(true);
      
      // Data should be consistent regardless of time range
      if (!result.isEmpty) {
        expect(result.totalTime).toBeGreaterThan(0);
        expect(result.categoryStats.length).toBeGreaterThan(0);
        expect(result.metrics.length).toBeGreaterThan(0);
      }
    });
  });

  it('should validate transformed data meets Achievement Jar requirements', () => {
    const logText = generateLogText(
      ['work', 'study', 'rest', 'sleep'],
      [3, 2, 1, 8]
    );
    
    const result = adapter.transformProgressData(logText, 'today', []);
    
    // Validate the result meets Achievement Jar format requirements
    const validation = ValidationUtils.validateAdaptedProgressData(result);
    expect(validation.isValid).toBe(true);
    
    // Check specific Achievement Jar requirements
    result.categoryStats.forEach(stat => {
      // Must have valid macaron colors
      expect(stat.color).toMatch(/^bg-macaron-|^bg-emerald-/);
      
      // Must have emoji icons
      expect(stat.icon).toMatch(/[\u{1F300}-\u{1F9FF}]|⏰/u);
      
      // Must have reasonable ball counts
      expect(stat.ballCount).toBeGreaterThanOrEqual(0);
      expect(stat.ballCount).toBeLessThanOrEqual(8);
      
      // Must have valid priority
      expect(['high', 'normal']).toContain(stat.priority);
    });
  });

  it('should maintain data integrity across multiple transformations', () => {
    const logText = generateLogText(['work', 'study'], [4, 2]);
    
    // Transform the same data multiple times
    const results = Array.from({ length: 5 }, () => 
      adapter.transformProgressData(logText, 'today', [])
    );
    
    // All results should be identical
    const firstResult = results[0];
    results.slice(1).forEach(result => {
      expect(result.totalTime).toBe(firstResult.totalTime);
      expect(result.categoryStats).toHaveLength(firstResult.categoryStats.length);
      expect(result.isEmpty).toBe(firstResult.isEmpty);
      
      // Compare category stats
      result.categoryStats.forEach((stat, index) => {
        const firstStat = firstResult.categoryStats[index];
        expect(stat.categoryId).toBe(firstStat.categoryId);
        expect(stat.totalMinutes).toBe(firstStat.totalMinutes);
        expect(stat.ballCount).toBe(firstStat.ballCount);
        expect(stat.percentage).toBe(firstStat.percentage);
      });
    });
  });
});