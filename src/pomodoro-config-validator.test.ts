/**
 * Property-Based Tests for Pomodoro Configuration Validator
 * **Feature: pomodoro-plan-sync, Property 13: Value Range Validation**
 * **Validates: Requirements 5.5**
 */

import * as fc from 'fast-check';
import { PomodoroConfigValidator } from './pomodoro-config-validator.js';
import { ExtractedPomodoroConfig } from './pomodoro-plan-sync-types.js';

describe('PomodoroConfigValidator Property Tests', () => {
  
  // Generator for valid configurations
  const validConfig = fc.record({
    workDuration: fc.integer({ min: 1, max: 120 }),
    restDuration: fc.integer({ min: 1, max: 60 }),
    cycles: fc.integer({ min: 1, max: 10 }),
    longBreakDuration: fc.option(fc.integer({ min: 5, max: 60 }), { nil: undefined }),
    source: fc.constantFrom('plan-sync', 'default', 'user-modified'),
    confidence: fc.float({ min: 0, max: 1 }),
    extractedFrom: fc.record({
      title: fc.boolean(),
      description: fc.boolean(),
      subBlocks: fc.boolean()
    })
  });

  // Generator for invalid configurations
  const invalidConfig = fc.record({
    workDuration: fc.oneof(
      fc.integer({ min: -100, max: 0 }),
      fc.integer({ min: 121, max: 200 })
    ),
    restDuration: fc.oneof(
      fc.integer({ min: -50, max: 0 }),
      fc.integer({ min: 61, max: 100 })
    ),
    cycles: fc.oneof(
      fc.integer({ min: -10, max: 0 }),
      fc.integer({ min: 11, max: 20 })
    ),
    longBreakDuration: fc.option(fc.oneof(
      fc.integer({ min: -20, max: 4 }),
      fc.integer({ min: 61, max: 100 })
    ), { nil: undefined }),
    source: fc.constantFrom('plan-sync', 'default', 'user-modified'),
    confidence: fc.float({ min: 0, max: 1 }),
    extractedFrom: fc.record({
      title: fc.boolean(),
      description: fc.boolean(),
      subBlocks: fc.boolean()
    })
  });

  /**
   * Property 13: Value Range Validation
   * For any extracted pomodoro configuration values, 
   * the system should validate that all values are within acceptable ranges
   */
  test('Property 13: Value Range Validation', () => {
    fc.assert(fc.property(validConfig, (config: ExtractedPomodoroConfig) => {
      const result = PomodoroConfigValidator.validateConfig(config);
      
      // Valid configurations should pass validation
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      
      // Should have normalized config
      expect(result.normalizedConfig).toBeDefined();
      if (result.normalizedConfig) {
        expect(result.normalizedConfig.workDuration).toBeGreaterThanOrEqual(1);
        expect(result.normalizedConfig.workDuration).toBeLessThanOrEqual(120);
        expect(result.normalizedConfig.restDuration).toBeGreaterThanOrEqual(1);
        expect(result.normalizedConfig.restDuration).toBeLessThanOrEqual(60);
        expect(result.normalizedConfig.cycles).toBeGreaterThanOrEqual(1);
        expect(result.normalizedConfig.cycles).toBeLessThanOrEqual(10);
        
        if (result.normalizedConfig.longBreakDuration !== undefined) {
          expect(result.normalizedConfig.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(result.normalizedConfig.longBreakDuration).toBeLessThanOrEqual(60);
        }
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Invalid configurations are rejected
   */
  test('Property: Invalid configurations are rejected', () => {
    fc.assert(fc.property(invalidConfig, (config: ExtractedPomodoroConfig) => {
      const result = PomodoroConfigValidator.validateConfig(config);
      
      // Invalid configurations should fail validation
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Should not have normalized config
      expect(result.normalizedConfig).toBeUndefined();
      
      // Each error should have required properties
      for (const error of result.errors) {
        expect(typeof error.field).toBe('string');
        expect(error.value).toBeDefined();
        expect(typeof error.message).toBe('string');
        expect(error.message.length).toBeGreaterThan(0);
        expect(['error', 'warning']).toContain(error.severity);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Normalization preserves valid values
   */
  test('Property: Normalization preserves valid values', () => {
    fc.assert(fc.property(validConfig, (config: ExtractedPomodoroConfig) => {
      const normalized = PomodoroConfigValidator.normalizeConfig(config);
      
      // Valid values should be preserved
      expect(normalized.workDuration).toBe(config.workDuration);
      expect(normalized.restDuration).toBe(config.restDuration);
      expect(normalized.cycles).toBe(config.cycles);
      expect(normalized.source).toBe(config.source);
      expect(normalized.confidence).toBe(config.confidence);
      
      if (config.longBreakDuration !== undefined && config.longBreakDuration !== null) {
        expect(normalized.longBreakDuration).toBe(config.longBreakDuration);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Normalization clamps invalid values
   */
  test('Property: Normalization clamps invalid values', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: -100, max: 200 }),
        restDuration: fc.integer({ min: -50, max: 100 }),
        cycles: fc.integer({ min: -10, max: 20 }),
        longBreakDuration: fc.option(fc.integer({ min: -20, max: 100 })),
        source: fc.constantFrom('plan-sync', 'default', 'user-modified'),
        confidence: fc.float({ min: 0, max: 1 }),
        extractedFrom: fc.record({
          title: fc.boolean(),
          description: fc.boolean(),
          subBlocks: fc.boolean()
        })
      }),
      (config: ExtractedPomodoroConfig) => {
        const normalized = PomodoroConfigValidator.normalizeConfig(config);
        
        // Values should be clamped to valid ranges
        expect(normalized.workDuration).toBeGreaterThanOrEqual(1);
        expect(normalized.workDuration).toBeLessThanOrEqual(120);
        expect(normalized.restDuration).toBeGreaterThanOrEqual(1);
        expect(normalized.restDuration).toBeLessThanOrEqual(60);
        expect(normalized.cycles).toBeGreaterThanOrEqual(1);
        expect(normalized.cycles).toBeLessThanOrEqual(10);
        
        if (normalized.longBreakDuration !== undefined && normalized.longBreakDuration !== null) {
          expect(normalized.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(normalized.longBreakDuration).toBeLessThanOrEqual(60);
        }
        
        // All values should be integers
        expect(Number.isInteger(normalized.workDuration)).toBe(true);
        expect(Number.isInteger(normalized.restDuration)).toBe(true);
        expect(Number.isInteger(normalized.cycles)).toBe(true);
        if (normalized.longBreakDuration !== undefined && normalized.longBreakDuration !== null) {
          expect(Number.isInteger(normalized.longBreakDuration)).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Auto-fix produces valid configurations
   */
  test('Property: Auto-fix produces valid configurations', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.option(fc.integer({ min: -100, max: 200 }), { nil: undefined }),
        restDuration: fc.option(fc.integer({ min: -50, max: 100 }), { nil: undefined }),
        cycles: fc.option(fc.integer({ min: -10, max: 20 }), { nil: undefined }),
        longBreakDuration: fc.option(fc.integer({ min: -20, max: 100 }), { nil: undefined }),
        source: fc.constantFrom('plan-sync', 'default', 'user-modified'),
        confidence: fc.float({ min: 0, max: 1 }),
        extractedFrom: fc.record({
          title: fc.boolean(),
          description: fc.boolean(),
          subBlocks: fc.boolean()
        })
      }),
      (config: ExtractedPomodoroConfig) => {
        const fixed = PomodoroConfigValidator.autoFixConfig(config);
        
        // Fixed config should always be valid
        expect(fixed.workDuration).toBeGreaterThanOrEqual(1);
        expect(fixed.workDuration).toBeLessThanOrEqual(120);
        expect(fixed.restDuration).toBeGreaterThanOrEqual(1);
        expect(fixed.restDuration).toBeLessThanOrEqual(60);
        expect(fixed.cycles).toBeGreaterThanOrEqual(1);
        expect(fixed.cycles).toBeLessThanOrEqual(10);
        
        // Should have all required fields
        expect(typeof fixed.workDuration).toBe('number');
        expect(typeof fixed.restDuration).toBe('number');
        expect(typeof fixed.cycles).toBe('number');
        
        // Long break should be reasonable if present
        if (fixed.longBreakDuration !== undefined) {
          expect(fixed.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(fixed.longBreakDuration).toBeLessThanOrEqual(60);
          expect(fixed.longBreakDuration).toBeGreaterThanOrEqual(fixed.restDuration);
        }
        
        // Work duration should be longer than rest duration (after auto-fix)
        expect(fixed.workDuration).toBeGreaterThanOrEqual(fixed.restDuration);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Validation is deterministic
   */
  test('Property: Validation is deterministic', () => {
    fc.assert(fc.property(validConfig, (config: ExtractedPomodoroConfig) => {
      const result1 = PomodoroConfigValidator.validateConfig(config);
      const result2 = PomodoroConfigValidator.validateConfig(config);
      const result3 = PomodoroConfigValidator.validateConfig(config);
      
      // Results should be identical
      expect(result2.isValid).toBe(result1.isValid);
      expect(result2.errors.length).toBe(result1.errors.length);
      expect(result2.warnings.length).toBe(result1.warnings.length);
      
      expect(result3.isValid).toBe(result1.isValid);
      expect(result3.errors.length).toBe(result1.errors.length);
      expect(result3.warnings.length).toBe(result1.warnings.length);
    }), { numRuns: 100 });
  });

  /**
   * Property: Recommended configuration detection
   */
  test('Property: Recommended configuration detection', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: 15, max: 60 }),
        restDuration: fc.integer({ min: 3, max: 15 }),
        cycles: fc.integer({ min: 2, max: 6 }),
        longBreakDuration: fc.integer({ min: 10, max: 30 }),
        source: fc.constantFrom('plan-sync', 'default', 'user-modified'),
        confidence: fc.float({ min: 0, max: 1 }),
        extractedFrom: fc.record({
          title: fc.boolean(),
          description: fc.boolean(),
          subBlocks: fc.boolean()
        })
      }),
      (config: ExtractedPomodoroConfig) => {
        const isRecommended = PomodoroConfigValidator.isRecommendedConfig(config);
        
        // Should be true for configurations within recommended ranges
        expect(isRecommended).toBe(true);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Non-recommended configuration detection
   */
  test('Property: Non-recommended configuration detection', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.oneof(
          fc.integer({ min: 1, max: 14 }),
          fc.integer({ min: 61, max: 120 })
        ),
        restDuration: fc.integer({ min: 3, max: 15 }),
        cycles: fc.integer({ min: 2, max: 6 }),
        source: fc.constantFrom('plan-sync', 'default', 'user-modified'),
        confidence: fc.float({ min: 0, max: 1 }),
        extractedFrom: fc.record({
          title: fc.boolean(),
          description: fc.boolean(),
          subBlocks: fc.boolean()
        })
      }),
      (config: ExtractedPomodoroConfig) => {
        const isRecommended = PomodoroConfigValidator.isRecommendedConfig(config);
        
        // Should be false for configurations outside recommended ranges
        expect(isRecommended).toBe(false);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Validation summary is meaningful
   */
  test('Property: Validation summary is meaningful', () => {
    fc.assert(fc.property(
      fc.oneof(validConfig, invalidConfig),
      (config: ExtractedPomodoroConfig) => {
        const result = PomodoroConfigValidator.validateConfig(config);
        const summary = PomodoroConfigValidator.getValidationSummary(result);
        
        expect(typeof summary).toBe('string');
        expect(summary.length).toBeGreaterThan(0);
        
        // Summary should reflect validation state
        if (result.isValid && result.warnings.length === 0) {
          expect(summary).toContain('valid');
          expect(summary).toContain('recommended');
        } else if (result.isValid && result.warnings.length > 0) {
          expect(summary).toContain('valid');
          expect(summary).toContain('recommendation');
        } else {
          expect(summary).toContain('error');
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Cross-field validation detects issues
   */
  test('Property: Cross-field validation detects issues', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: 1, max: 10 }),
        restDuration: fc.integer({ min: 11, max: 30 }),
        cycles: fc.integer({ min: 1, max: 10 }),
        source: fc.constantFrom('plan-sync', 'default', 'user-modified'),
        confidence: fc.float({ min: 0, max: 1 }),
        extractedFrom: fc.record({
          title: fc.boolean(),
          description: fc.boolean(),
          subBlocks: fc.boolean()
        })
      }),
      (config: ExtractedPomodoroConfig) => {
        const result = PomodoroConfigValidator.validateConfig(config);
        
        // Should detect that work duration is shorter than rest duration
        if (config.workDuration <= config.restDuration) {
          expect(result.warnings.length).toBeGreaterThan(0);
          
          // Should have a warning about the unusual ratio
          const ratioWarning = result.warnings.find(w => 
            w.message.includes('work duration') || w.message.includes('rest duration')
          );
          expect(ratioWarning).toBeDefined();
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Type validation catches non-numeric values
   */
  test('Property: Type validation catches non-numeric values', () => {
    const invalidTypeConfig = {
      workDuration: 'twenty-five' as any,
      restDuration: 5,
      cycles: 4,
      source: 'plan-sync' as const,
      confidence: 0.8,
      extractedFrom: {
        title: true,
        description: false,
        subBlocks: false
      }
    };

    const result = PomodoroConfigValidator.validateConfig(invalidTypeConfig);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    
    const typeError = result.errors.find(e => e.field === 'workDuration');
    expect(typeError).toBeDefined();
    expect(typeError?.message).toContain('integer');
  });
});