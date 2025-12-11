/**
 * Property-Based Tests for Complex Pattern Matcher
 * **Feature: pomodoro-plan-sync, Property 8: Complex Pattern Extraction**
 * **Validates: Requirements 3.2**
 */

import * as fc from 'fast-check';
import { ComplexPatternMatcher } from './complex-pattern-matcher.js';

describe('ComplexPatternMatcher Property Tests', () => {
  
  /**
   * Property 8: Complex Pattern Extraction
   * For any text matching the pattern "忙X分钟，休息Y分钟", 
   * the system should extract both work duration X and rest duration Y correctly
   */
  test('Property 8: Complex Pattern Extraction', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 120 }),
      fc.integer({ min: 1, max: 60 }),
      (workDuration: number, restDuration: number) => {
        // Test Chinese pattern
        const chinesePattern = `忙${workDuration}分钟，休息${restDuration}分钟`;
        const chineseResult = ComplexPatternMatcher.extractComplexPattern(chinesePattern);
        
        expect(chineseResult.workDuration).toBe(workDuration);
        expect(chineseResult.restDuration).toBe(restDuration);
        expect(chineseResult.confidence).toBeGreaterThan(0.5);
        
        // Test formal Chinese pattern
        const formalPattern = `工作${workDuration}分钟，休息${restDuration}分钟`;
        const formalResult = ComplexPatternMatcher.extractComplexPattern(formalPattern);
        
        expect(formalResult.workDuration).toBe(workDuration);
        expect(formalResult.restDuration).toBe(restDuration);
        expect(formalResult.confidence).toBeGreaterThan(0.5);
        
        // Test English pattern
        const englishPattern = `work ${workDuration}min, break ${restDuration}min`;
        const englishResult = ComplexPatternMatcher.extractComplexPattern(englishPattern);
        
        expect(englishResult.workDuration).toBe(workDuration);
        expect(englishResult.restDuration).toBe(restDuration);
        expect(englishResult.confidence).toBeGreaterThan(0.5);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Full complex pattern extraction
   * For complete pomodoro descriptions, all components should be extracted
   */
  test('Property: Full complex pattern extraction', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: 1, max: 120 }),
        restDuration: fc.integer({ min: 1, max: 60 }),
        cycles: fc.integer({ min: 1, max: 10 }),
        longBreakDuration: fc.integer({ min: 5, max: 60 })
      }),
      (config) => {
        // Test the exact pattern from requirements
        const complexPattern = `忙${config.workDuration}分钟，休息${config.restDuration}分钟，${config.cycles}个番茄钟之后，休息${config.longBreakDuration}分钟`;
        const result = ComplexPatternMatcher.extractComplexPattern(complexPattern);
        
        expect(result.workDuration).toBe(config.workDuration);
        expect(result.restDuration).toBe(config.restDuration);
        expect(result.cycles).toBe(config.cycles);
        expect(result.longBreakDuration).toBe(config.longBreakDuration);
        expect(result.confidence).toBeGreaterThan(0.8);
        expect(result.matchedPattern).toBe('complex_chinese_full');
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Pattern extraction is deterministic
   */
  test('Property: Pattern extraction is deterministic', () => {
    fc.assert(fc.property(
      fc.string(),
      (text: string) => {
        const result1 = ComplexPatternMatcher.extractComplexPattern(text);
        const result2 = ComplexPatternMatcher.extractComplexPattern(text);
        const result3 = ComplexPatternMatcher.extractComplexPattern(text);
        
        // Results should be identical
        expect(result2.workDuration).toBe(result1.workDuration);
        expect(result2.restDuration).toBe(result1.restDuration);
        expect(result2.cycles).toBe(result1.cycles);
        expect(result2.longBreakDuration).toBe(result1.longBreakDuration);
        expect(result2.confidence).toBe(result1.confidence);
        expect(result2.matchedPattern).toBe(result1.matchedPattern);
        
        expect(result3.workDuration).toBe(result1.workDuration);
        expect(result3.restDuration).toBe(result1.restDuration);
        expect(result3.cycles).toBe(result1.cycles);
        expect(result3.longBreakDuration).toBe(result1.longBreakDuration);
        expect(result3.confidence).toBe(result1.confidence);
        expect(result3.matchedPattern).toBe(result1.matchedPattern);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Invalid input handling
   */
  test('Property: Invalid input is handled gracefully', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.constant(undefined)
      ),
      (invalidInput: any) => {
        const result = ComplexPatternMatcher.extractComplexPattern(invalidInput);
        
        expect(result.confidence).toBe(0);
        expect(result.matchedPattern).toBe('none');
        expect(result.workDuration).toBeUndefined();
        expect(result.restDuration).toBeUndefined();
        expect(result.cycles).toBeUndefined();
        expect(result.longBreakDuration).toBeUndefined();
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Extracted values are within valid ranges
   */
  test('Property: Extracted values are within valid ranges', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      (text: string) => {
        const result = ComplexPatternMatcher.extractComplexPattern(text);
        
        if (result.workDuration !== undefined) {
          expect(result.workDuration).toBeGreaterThanOrEqual(1);
          expect(result.workDuration).toBeLessThanOrEqual(120);
        }
        
        if (result.restDuration !== undefined) {
          expect(result.restDuration).toBeGreaterThanOrEqual(1);
          expect(result.restDuration).toBeLessThanOrEqual(60);
        }
        
        if (result.cycles !== undefined) {
          expect(result.cycles).toBeGreaterThanOrEqual(1);
          expect(result.cycles).toBeLessThanOrEqual(10);
        }
        
        if (result.longBreakDuration !== undefined) {
          expect(result.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(result.longBreakDuration).toBeLessThanOrEqual(60);
        }
        
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Multiple patterns with conflict resolution
   */
  test('Property: Multiple patterns conflict resolution', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration1: fc.integer({ min: 1, max: 60 }),
        workDuration2: fc.integer({ min: 61, max: 120 }),
        restDuration: fc.integer({ min: 1, max: 30 })
      }),
      (config) => {
        // Create text with conflicting work durations
        const conflictText = `忙${config.workDuration1}分钟，休息${config.restDuration}分钟。另外工作${config.workDuration2}分钟也可以。`;
        
        const result = ComplexPatternMatcher.extractMultiplePatternsWithConflictResolution(conflictText);
        
        // Should resolve to one of the work durations
        expect([config.workDuration1, config.workDuration2]).toContain(result.workDuration);
        expect(result.restDuration).toBe(config.restDuration);
        expect(result.confidence).toBeGreaterThan(0);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Pattern normalization preserves valid values
   */
  test('Property: Pattern normalization preserves valid values', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: 1, max: 120 }),
        restDuration: fc.integer({ min: 1, max: 60 }),
        cycles: fc.integer({ min: 1, max: 10 }),
        confidence: fc.float({ min: 0, max: 1 }),
        matchedPattern: fc.string()
      }),
      (pattern) => {
        const normalized = ComplexPatternMatcher.normalizePatternMatch(pattern);
        
        // Valid values should be preserved
        expect(normalized.workDuration).toBe(pattern.workDuration);
        expect(normalized.restDuration).toBe(pattern.restDuration);
        expect(normalized.cycles).toBe(pattern.cycles);
        expect(normalized.confidence).toBe(pattern.confidence);
        expect(normalized.matchedPattern).toBe(pattern.matchedPattern);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Pattern normalization clamps invalid values
   */
  test('Property: Pattern normalization clamps invalid values', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: -100, max: 200 }),
        restDuration: fc.integer({ min: -50, max: 100 }),
        cycles: fc.integer({ min: -10, max: 20 }),
        confidence: fc.float({ min: 0, max: 1 }),
        matchedPattern: fc.string()
      }),
      (pattern) => {
        const normalized = ComplexPatternMatcher.normalizePatternMatch(pattern);
        
        // Values should be clamped to valid ranges
        if (normalized.workDuration !== undefined) {
          expect(normalized.workDuration).toBeGreaterThanOrEqual(1);
          expect(normalized.workDuration).toBeLessThanOrEqual(120);
        }
        
        if (normalized.restDuration !== undefined) {
          expect(normalized.restDuration).toBeGreaterThanOrEqual(1);
          expect(normalized.restDuration).toBeLessThanOrEqual(60);
        }
        
        if (normalized.cycles !== undefined) {
          expect(normalized.cycles).toBeGreaterThanOrEqual(1);
          expect(normalized.cycles).toBeLessThanOrEqual(10);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Pattern statistics are consistent
   */
  test('Property: Pattern statistics are consistent', () => {
    fc.assert(fc.property(
      fc.string(),
      (text: string) => {
        const stats = ComplexPatternMatcher.getPatternStats(text);
        
        expect(stats.totalPatterns).toBeGreaterThan(0);
        expect(Array.isArray(stats.matchedPatterns)).toBe(true);
        expect(typeof stats.bestMatch).toBe('object');
        
        // Best match should have highest confidence among matched patterns
        if (stats.matchedPatterns.length > 0) {
          expect(stats.bestMatch.confidence).toBeGreaterThan(0);
        } else {
          expect(stats.bestMatch.confidence).toBe(0);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Confidence reflects pattern complexity
   */
  test('Property: Confidence reflects pattern complexity', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: 1, max: 60 }),
        restDuration: fc.integer({ min: 1, max: 30 }),
        cycles: fc.integer({ min: 1, max: 5 })
      }),
      (config) => {
        // Simple pattern
        const simplePattern = `忙${config.workDuration}分钟，休息${config.restDuration}分钟`;
        const simpleResult = ComplexPatternMatcher.extractComplexPattern(simplePattern);
        
        // Complex pattern
        const complexPattern = `忙${config.workDuration}分钟，休息${config.restDuration}分钟，${config.cycles}个番茄钟`;
        const complexResult = ComplexPatternMatcher.extractComplexPattern(complexPattern);
        
        // Complex patterns should generally have higher or equal confidence
        if (complexResult.confidence > 0 && simpleResult.confidence > 0) {
          expect(complexResult.confidence).toBeGreaterThanOrEqual(simpleResult.confidence - 0.1);
        }
      }
    ), { numRuns: 100 });
  });
});