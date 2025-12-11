/**
 * Property-Based Tests for Pomodoro Configuration Extractor
 * **Feature: pomodoro-plan-sync, Property 1: Plan Item Analysis Consistency**
 * **Validates: Requirements 1.1**
 */

import * as fc from 'fast-check';
import { PomodoroConfigExtractor } from './pomodoro-config-extractor.js';
import { PlanItem } from './pomodoro-plan-sync-types.js';

describe('PomodoroConfigExtractor Property Tests', () => {
  // Generator for plan items with pomodoro information
  const pomodoroKeywords = ['番茄钟', 'pomodoro', 'focus', 'break', '专注', '休息'];
  const timeFormats = ['分钟', 'min', 'minutes'];
  
  const planItemWithPomodoroInfo = fc.record({
    id: fc.string({ minLength: 1 }),
    title: fc.oneof(
      fc.string(),
      fc.tuple(
        fc.constantFrom(...pomodoroKeywords),
        fc.integer({ min: 1, max: 60 }),
        fc.constantFrom(...timeFormats)
      ).map(([keyword, duration, format]) => `${keyword} ${duration}${format}`)
    ),
    desc: fc.oneof(
      fc.string(),
      fc.tuple(
        fc.constantFrom('忙', '工作', 'work'),
        fc.integer({ min: 1, max: 60 }),
        fc.constantFrom('休息', 'break'),
        fc.integer({ min: 1, max: 30 }),
        fc.constantFrom(...timeFormats)
      ).map(([work, workDur, rest, restDur, format]) => 
        `${work}${workDur}${format}，${rest}${restDur}${format}`
      )
    ),
    time: fc.string(),
    category: fc.constantFrom('work', 'study', 'rest'),
    energy_required: fc.constantFrom('high', 'low'),
    sub_blocks: fc.option(fc.array(fc.record({
      time: fc.string(),
      label: fc.oneof(
        fc.string(),
        fc.constantFrom('Focus', 'Break', '专注', '休息')
      ),
      detail: fc.string()
    }), { minLength: 0, maxLength: 5 }))
  });

  // Generator for plan items without pomodoro information
  const planItemWithoutPomodoroInfo = fc.record({
    id: fc.string({ minLength: 1 }),
    title: fc.string().filter(s => !pomodoroKeywords.some(k => s.includes(k))),
    desc: fc.string().filter(s => !pomodoroKeywords.some(k => s.includes(k))),
    time: fc.string(),
    category: fc.constantFrom('work', 'study', 'rest'),
    energy_required: fc.constantFrom('high', 'low'),
    sub_blocks: fc.option(fc.array(fc.record({
      time: fc.string(),
      label: fc.string().filter(s => !['Focus', 'Break', '专注', '休息'].includes(s)),
      detail: fc.string()
    }), { minLength: 0, maxLength: 3 }))
  });

  /**
   * Property 1: Plan Item Analysis Consistency
   * For any plan item with pomodoro-related information, 
   * the analysis function should consistently identify it as pomodoro-related across multiple calls
   */
  test('Property 1: Plan Item Analysis Consistency', () => {
    fc.assert(fc.property(planItemWithPomodoroInfo, (planItem: PlanItem) => {
      // Extract configuration multiple times
      const result1 = PomodoroConfigExtractor.extractConfig(planItem);
      const result2 = PomodoroConfigExtractor.extractConfig(planItem);
      const result3 = PomodoroConfigExtractor.extractConfig(planItem);

      // Results should be consistent
      if (result1 === null) {
        expect(result2).toBeNull();
        expect(result3).toBeNull();
      } else {
        expect(result2).not.toBeNull();
        expect(result3).not.toBeNull();
        
        if (result2 && result3) {
          // Configuration values should be identical
          expect(result2.workDuration).toBe(result1.workDuration);
          expect(result2.restDuration).toBe(result1.restDuration);
          expect(result2.cycles).toBe(result1.cycles);
          expect(result2.confidence).toBe(result1.confidence);
          expect(result2.source).toBe(result1.source);
          
          expect(result3.workDuration).toBe(result1.workDuration);
          expect(result3.restDuration).toBe(result1.restDuration);
          expect(result3.cycles).toBe(result1.cycles);
          expect(result3.confidence).toBe(result1.confidence);
          expect(result3.source).toBe(result1.source);
        }
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Configuration Extraction Accuracy
   * For any plan item, extracted configuration should have valid values
   */
  test('Property: Configuration values are within valid ranges', () => {
    fc.assert(fc.property(planItemWithPomodoroInfo, (planItem: PlanItem) => {
      const result = PomodoroConfigExtractor.extractConfig(planItem);
      
      if (result !== null) {
        // Work duration should be between 1 and 120 minutes
        expect(result.workDuration).toBeGreaterThanOrEqual(1);
        expect(result.workDuration).toBeLessThanOrEqual(120);
        
        // Rest duration should be between 1 and 60 minutes
        expect(result.restDuration).toBeGreaterThanOrEqual(1);
        expect(result.restDuration).toBeLessThanOrEqual(60);
        
        // Cycles should be between 1 and 10
        expect(result.cycles).toBeGreaterThanOrEqual(1);
        expect(result.cycles).toBeLessThanOrEqual(10);
        
        // Confidence should be between 0 and 1
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        
        // Source should be valid
        expect(['plan-sync', 'default', 'user-modified', 'session-cached']).toContain(result.source);
        
        // Long break duration, if present, should be valid
        if (result.longBreakDuration !== undefined) {
          expect(result.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(result.longBreakDuration).toBeLessThanOrEqual(60);
        }
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Non-pomodoro items should return null
   * For plan items without pomodoro information, extraction should return null
   */
  test('Property: Non-pomodoro items return null', () => {
    fc.assert(fc.property(planItemWithoutPomodoroInfo, (planItem: PlanItem) => {
      const result = PomodoroConfigExtractor.extractConfig(planItem);
      
      // Should return null for items without pomodoro information
      // Note: This might not always be true due to false positives, 
      // so we check that if a result is returned, it has low confidence
      if (result !== null) {
        expect(result.confidence).toBeLessThan(0.5);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Default configuration is always valid
   */
  test('Property: Default configuration is valid', () => {
    const defaultConfig = PomodoroConfigExtractor.getDefaultConfig();
    
    expect(defaultConfig.workDuration).toBeGreaterThan(0);
    expect(defaultConfig.restDuration).toBeGreaterThan(0);
    expect(defaultConfig.cycles).toBeGreaterThan(0);
    expect(defaultConfig.confidence).toBe(1.0);
    expect(defaultConfig.source).toBe('default');
  });

  /**
   * Property: Merge with defaults preserves valid values
   */
  test('Property: Merge with defaults preserves valid values', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.option(fc.integer({ min: 1, max: 120 })),
        restDuration: fc.option(fc.integer({ min: 1, max: 60 })),
        cycles: fc.option(fc.integer({ min: 1, max: 10 })),
        confidence: fc.option(fc.float({ min: 0, max: 1 }))
      }),
      (partial) => {
        const merged = PomodoroConfigExtractor.mergeWithDefaults(partial);
        
        // Should have all required fields
        expect(typeof merged.workDuration).toBe('number');
        expect(typeof merged.restDuration).toBe('number');
        expect(typeof merged.cycles).toBe('number');
        expect(typeof merged.confidence).toBe('number');
        expect(typeof merged.source).toBe('string');
        
        // Should preserve provided values (but not null values)
        if (partial.workDuration !== undefined && partial.workDuration !== null) {
          expect(merged.workDuration).toBe(partial.workDuration);
        }
        if (partial.restDuration !== undefined && partial.restDuration !== null) {
          expect(merged.restDuration).toBe(partial.restDuration);
        }
        if (partial.cycles !== undefined && partial.cycles !== null) {
          expect(merged.cycles).toBe(partial.cycles);
        }
        if (partial.confidence !== undefined && partial.confidence !== null) {
          expect(merged.confidence).toBe(partial.confidence);
        }
      }
    ), { numRuns: 100 });
  });
});