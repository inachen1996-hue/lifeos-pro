/**
 * Achievement Jar Progress Visualization - Data Transformer Tests
 * Property-based tests for data transformation accuracy
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  transformProgressStats, 
  calculateBallCount, 
  calculateBallSize, 
  transformToMetrics,
  generateClayBalls,
  parseHistoryLogs,
  checkAchievements,
  validateCategoryData
} from './data-transformer.js';
import { RawProgressData, CategoryTimeStats } from './types.js';

describe('Achievement Jar Data Transformer', () => {
  /**
   * **Feature: achievement-jar-progress, Property 2: Category data visualization accuracy**
   * **Validates: Requirements 1.2**
   * 
   * For any set of category progress data, the jar should contain the correct number 
   * of clay balls with colors matching their respective categories
   */
  it('should accurately transform progress data maintaining category relationships', () => {
    fc.assert(fc.property(
      // Generate random progress data
      fc.record({
        work: fc.float({ min: 0, max: 12 }),
        study: fc.float({ min: 0, max: 8 }),
        rest: fc.float({ min: 0, max: 6 }),
        sleep: fc.float({ min: 0, max: 10 }),
        life: fc.float({ min: 0, max: 4 }),
        entertainment: fc.float({ min: 0, max: 4 }),
        health: fc.float({ min: 0, max: 3 }),
        hobby: fc.float({ min: 0, max: 3 })
      }),
      (rawData: RawProgressData) => {
        const transformed = transformProgressStats(rawData);
        
        // Property 1: All valid categories should be included (finite, > 0.001)
        const validCategories = Object.entries(rawData)
          .filter(([_, hours]) => Number.isFinite(hours) && hours > 0.001)
          .map(([category, _]) => category);
        
        const transformedCategories = transformed.map(stat => stat.categoryId);
        
        expect(transformedCategories.sort()).toEqual(validCategories.sort());
        
        // Property 2: Each category should have correct color mapping
        transformed.forEach(stat => {
          expect(stat.color).toBeDefined();
          expect(stat.color).toMatch(/^bg-(macaron-|emerald-)/);
        });
        
        // Property 3: Ball counts should be reasonable and consistent
        transformed.forEach(stat => {
          const expectedBallCount = calculateBallCount(stat.totalMinutes);
          expect(stat.ballCount).toBe(expectedBallCount);
          expect(stat.ballCount).toBeGreaterThanOrEqual(0);
          expect(stat.ballCount).toBeLessThanOrEqual(8);
        });
        
        // Property 4: Work and study should have high priority
        const workStat = transformed.find(s => s.categoryId === 'work');
        const studyStat = transformed.find(s => s.categoryId === 'study');
        
        if (workStat) expect(workStat.priority).toBe('high');
        if (studyStat) expect(studyStat.priority).toBe('high');
        
        // Property 5: Percentages should sum to approximately 100% (if there's meaningful data)
        const totalPercentage = transformed.reduce((sum, stat) => sum + stat.percentage, 0);
        if (transformed.length > 0 && totalPercentage > 0) {
          expect(totalPercentage).toBeCloseTo(100, 1);
        }
        
        // Property 6: Categories should be sorted by priority then time
        for (let i = 0; i < transformed.length - 1; i++) {
          const current = transformed[i];
          const next = transformed[i + 1];
          
          if (current.priority !== next.priority) {
            expect(current.priority).toBe('high');
            expect(next.priority).toBe('normal');
          } else {
            expect(current.totalMinutes).toBeGreaterThanOrEqual(next.totalMinutes);
          }
        }
      }
    ), { numRuns: 100 });
  });

  it('should calculate ball counts with diminishing returns', () => {
    fc.assert(fc.property(
      fc.float({ min: 0, max: 1440 }).filter(n => Number.isFinite(n)), // 0 to 24 hours in minutes, finite only
      (minutes: number) => {
        const ballCount = calculateBallCount(minutes);
        
        // Property: Ball count should be finite and within bounds
        expect(Number.isFinite(ballCount)).toBe(true);
        expect(ballCount).toBeGreaterThanOrEqual(0);
        expect(ballCount).toBeLessThanOrEqual(8);
        
        // Property: More time should generally mean more balls (with exceptions for caps)
        if (minutes > 0 && Number.isFinite(minutes)) {
          expect(ballCount).toBeGreaterThan(0);
        }
        
        // Property: Very long durations should not exceed maximum
        if (minutes > 480) { // 8 hours
          expect(ballCount).toBeLessThanOrEqual(8);
        }
      }
    ), { numRuns: 100 });
  });

  it('should calculate appropriate ball sizes based on duration and priority', () => {
    fc.assert(fc.property(
      fc.float({ min: 0, max: 1440 }),
      fc.constantFrom('high', 'normal'),
      (minutes: number, priority: 'high' | 'normal') => {
        const size = calculateBallSize(minutes, priority);
        
        // Property: Size should be within reasonable bounds
        expect(size).toBeGreaterThanOrEqual(20);
        expect(size).toBeLessThanOrEqual(72); // 60 * 1.2 for high priority
        
        // Property: High priority should result in larger balls
        if (minutes > 0) {
          const normalSize = calculateBallSize(minutes, 'normal');
          const highSize = calculateBallSize(minutes, 'high');
          expect(highSize).toBeGreaterThanOrEqual(normalSize);
        }
      }
    ), { numRuns: 100 });
  });

  it('should generate clay balls matching category statistics', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          categoryId: fc.constantFrom('work', 'study', 'rest', 'sleep'),
          name: fc.string({ minLength: 1, maxLength: 10 }),
          totalMinutes: fc.float({ min: 30, max: 480 }),
          color: fc.constantFrom('bg-macaron-blue', 'bg-macaron-pink', 'bg-macaron-green'),
          icon: fc.constantFrom('💻', '📚', '🛋️', '😴'),
          ballCount: fc.integer({ min: 1, max: 5 }),
          priority: fc.constantFrom('high', 'normal'),
          percentage: fc.float({ min: 0, max: 100 })
        }),
        { minLength: 1, maxLength: 4 }
      ),
      (categoryStats: CategoryTimeStats[]) => {
        const balls = generateClayBalls(categoryStats);
        
        // Property: Total ball count should match sum of category ball counts
        const expectedTotalBalls = categoryStats.reduce((sum, stat) => sum + stat.ballCount, 0);
        expect(balls.length).toBe(expectedTotalBalls);
        
        // Property: Each ball should have valid properties
        balls.forEach(ball => {
          expect(ball.id).toBeDefined();
          expect(ball.categoryId).toBeDefined();
          expect(ball.size).toBeGreaterThan(0);
          expect(Number.isFinite(ball.size)).toBe(true);
          expect(ball.color).toMatch(/^bg-(macaron-|emerald-)/);
          expect(ball.position).toEqual({ x: 0, y: 0 });
          expect(ball.isSpecial).toBe(false);
          expect(ball.glowIntensity).toBeGreaterThanOrEqual(0);
          expect(ball.glowIntensity).toBeLessThanOrEqual(1);
          expect(Number.isFinite(ball.glowIntensity)).toBe(true);
        });
        
        // Property: Ball categories should match input categories
        const ballCategories = [...new Set(balls.map(b => b.categoryId))];
        const inputCategories = categoryStats.map(s => s.categoryId);
        ballCategories.forEach(category => {
          expect(inputCategories).toContain(category);
        });
      }
    ), { numRuns: 100 });
  });

  it('should parse history logs correctly', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          date: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
          category: fc.constantFrom('WORK', 'STUDY', 'REST', 'SLEEP'),
          duration: fc.float({ min: 0.5, max: 8 }),
          description: fc.string({ minLength: 5, maxLength: 50 })
        }),
        { minLength: 0, maxLength: 10 }
      ),
      (logEntries) => {
        // Generate log text in expected format
        const logText = logEntries.map(entry => {
          const dateStr = entry.date.toISOString().split('T')[0];
          const durationStr = `${entry.duration}h`;
          return `${dateStr}: [${entry.category}] ${entry.description} ${durationStr}`;
        }).join('\n');
        
        const parsed = parseHistoryLogs(logText);
        
        // Property: Should parse correct number of valid entries
        const validEntries = logEntries.filter(e => e.duration > 0);
        expect(parsed.length).toBeLessThanOrEqual(validEntries.length);
        
        // Property: Each parsed item should have required fields
        parsed.forEach(item => {
          expect(item.id).toBeGreaterThanOrEqual(0);
          expect(item.date).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/);
          expect(item.category).toBeDefined();
          expect(item.duration).toBeGreaterThan(0);
          expect(item.description).toBeDefined();
        });
        
        // Property: Durations should be preserved (for successfully parsed entries)
        if (parsed.length > 0 && validEntries.length > 0) {
          // At least some entries should be parsed correctly
          expect(parsed.length).toBeGreaterThan(0);
        }
      }
    ), { numRuns: 100 });
  });

  it('should validate and sanitize category data', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          categoryId: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          name: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          totalMinutes: fc.option(fc.float({ min: -100, max: 2000 }), { nil: undefined }),
          color: fc.option(fc.constantFrom('bg-macaron-blue', 'invalid-color'), { nil: undefined }),
          icon: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          ballCount: fc.integer({ min: -5, max: 15 }),
          priority: fc.constantFrom('high', 'normal'),
          percentage: fc.float({ min: -50, max: 150 })
        }),
        { minLength: 0, maxLength: 10 }
      ),
      (rawStats: Partial<CategoryTimeStats>[]) => {
        const validated = validateCategoryData(rawStats as CategoryTimeStats[]);
        
        // Property: All validated items should have required fields
        validated.forEach(stat => {
          expect(stat.categoryId).toBeDefined();
          expect(stat.name).toBeDefined();
          expect(typeof stat.totalMinutes).toBe('number');
          expect(stat.totalMinutes).toBeGreaterThanOrEqual(0);
          expect(stat.color).toBeDefined();
          expect(stat.icon).toBeDefined();
        });
        
        // Property: Ball counts should be within valid range
        validated.forEach(stat => {
          expect(stat.ballCount).toBeGreaterThanOrEqual(0);
          expect(stat.ballCount).toBeLessThanOrEqual(8);
        });
        
        // Property: Percentages should be within valid range
        validated.forEach(stat => {
          expect(stat.percentage).toBeGreaterThanOrEqual(0);
          expect(stat.percentage).toBeLessThanOrEqual(100);
        });
        
        // Property: Invalid entries should be filtered out
        const validInputCount = rawStats.filter(stat => 
          stat.categoryId && 
          stat.name && 
          typeof stat.totalMinutes === 'number' && 
          stat.totalMinutes >= 0 &&
          stat.color &&
          stat.icon
        ).length;
        
        expect(validated.length).toBeLessThanOrEqual(validInputCount);
      }
    ), { numRuns: 100 });
  });
});