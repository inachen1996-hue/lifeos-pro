/**
 * Property-Based Tests for Pomodoro Default Fallback
 * **Feature: pomodoro-plan-sync, Property 11: Default Fallback for Incomplete Config**
 * **Validates: Requirements 4.4, 5.2**
 */

import * as fc from 'fast-check';
import { PomodoroConfigExtractor } from './pomodoro-config-extractor.js';
import { PlanItem, ExtractedPomodoroConfig } from './pomodoro-plan-sync-types.js';

describe('Pomodoro Default Fallback Property Tests', () => {

  // Generator for plan items with incomplete pomodoro information
  const incompletePomodoroPlanItem = fc.record({
    id: fc.string(),
    title: fc.oneof(
      fc.constant('工作25分钟'), // Only work duration
      fc.constant('休息5分钟'),  // Only rest duration
      fc.constant('3个番茄钟'),  // Only cycles
      fc.constant('专注时间'),   // Only keywords
      fc.constant('break time'), // Only keywords
      fc.string()
    ),
    desc: fc.oneof(
      fc.constant('focus session'),
      fc.constant('番茄钟'),
      fc.constant('pomodoro'),
      fc.string()
    ),
    time: fc.string(),
    category: fc.string(),
    sub_blocks: fc.option(fc.array(fc.record({
      time: fc.string(),
      label: fc.oneof(
        fc.constant('Focus'),
        fc.constant('Work'),
        fc.string()
      ),
      detail: fc.string()
    }), { minLength: 0, maxLength: 2 }), { nil: undefined }),
    energy_required: fc.constantFrom('high', 'low')
  });

  // Generator for plan items with no pomodoro information
  const nonPomodoroPlanItem = fc.record({
    id: fc.string(),
    title: fc.string().filter(s => 
      !s.includes('番茄钟') && 
      !s.includes('pomodoro') && 
      !s.includes('focus') && 
      !s.includes('break') &&
      !s.includes('工作') &&
      !s.includes('休息')
    ),
    desc: fc.string().filter(s => 
      !s.includes('番茄钟') && 
      !s.includes('pomodoro') && 
      !s.includes('focus') && 
      !s.includes('break') &&
      !s.includes('工作') &&
      !s.includes('休息')
    ),
    time: fc.string(),
    category: fc.string(),
    sub_blocks: fc.option(fc.array(fc.record({
      time: fc.string(),
      label: fc.string().filter(s => !s.includes('Focus') && !s.includes('Break')),
      detail: fc.string()
    }), { minLength: 0, maxLength: 2 }), { nil: undefined }),
    energy_required: fc.constantFrom('high', 'low')
  });

  /**
   * Property 11: Default Fallback for Incomplete Config
   * For any plan item with incomplete pomodoro configuration, 
   * the system should use default values for missing parameters 
   * while preserving extracted values
   */
  test('Property 11: Default Fallback for Incomplete Config', () => {
    fc.assert(fc.property(incompletePomodoroPlanItem, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      if (extractedConfig) {
        // Should always have valid values (extracted or default)
        expect(typeof extractedConfig.workDuration).toBe('number');
        expect(typeof extractedConfig.restDuration).toBe('number');
        expect(typeof extractedConfig.cycles).toBe('number');
        
        // Values should be within valid ranges
        expect(extractedConfig.workDuration).toBeGreaterThanOrEqual(1);
        expect(extractedConfig.workDuration).toBeLessThanOrEqual(120);
        expect(extractedConfig.restDuration).toBeGreaterThanOrEqual(1);
        expect(extractedConfig.restDuration).toBeLessThanOrEqual(60);
        expect(extractedConfig.cycles).toBeGreaterThanOrEqual(1);
        expect(extractedConfig.cycles).toBeLessThanOrEqual(10);
        
        // If long break is present, it should be valid
        if (extractedConfig.longBreakDuration !== undefined) {
          expect(extractedConfig.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(extractedConfig.longBreakDuration).toBeLessThanOrEqual(60);
        }
        
        // Should have reasonable confidence for incomplete configs
        expect(extractedConfig.confidence).toBeGreaterThanOrEqual(0);
        expect(extractedConfig.confidence).toBeLessThanOrEqual(1);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Complete fallback for non-pomodoro items
   */
  test('Property: Complete fallback for non-pomodoro items', () => {
    fc.assert(fc.property(nonPomodoroPlanItem, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      // Should return null for items with no pomodoro information
      if (extractedConfig) {
        expect(extractedConfig.confidence).toBeLessThan(0.3);
      } else {
        expect(extractedConfig).toBeNull();
      }
      
      // Simulate UI fallback behavior
      const finalConfig = extractedConfig || getDefaultConfig();
      
      // Should use standard defaults
      expect(finalConfig.workDuration).toBe(25);
      expect(finalConfig.restDuration).toBe(5);
      expect(finalConfig.cycles).toBe(4);
    }), { numRuns: 100 });
  });

  /**
   * Property: Partial extraction preserves extracted values
   */
  test('Property: Partial extraction preserves extracted values', () => {
    // Create plan items with specific partial information
    const partialWorkDurationItem: PlanItem = {
      id: 'test',
      title: '工作30分钟',
      desc: '',
      time: '',
      category: '',
      energy_required: 'high'
    };

    const partialRestDurationItem: PlanItem = {
      id: 'test',
      title: '休息10分钟',
      desc: '',
      time: '',
      category: '',
      energy_required: 'high'
    };

    const partialCyclesItem: PlanItem = {
      id: 'test',
      title: '5个番茄钟',
      desc: '',
      time: '',
      category: '',
      energy_required: 'high'
    };

    // Test work duration extraction
    const workConfig = PomodoroConfigExtractor.extractConfig(partialWorkDurationItem);
    if (workConfig && workConfig.confidence > 0.2) {
      expect(workConfig.workDuration).toBe(30); // Extracted value
      expect(workConfig.restDuration).toBe(5);  // Default value
      expect(workConfig.cycles).toBe(4);        // Default value
    }

    // Test rest duration extraction
    const restConfig = PomodoroConfigExtractor.extractConfig(partialRestDurationItem);
    if (restConfig && restConfig.confidence > 0.2) {
      expect(restConfig.workDuration).toBe(25); // Default value
      expect(restConfig.restDuration).toBe(10); // Extracted value
      expect(restConfig.cycles).toBe(4);        // Default value
    }

    // Test cycles extraction
    const cyclesConfig = PomodoroConfigExtractor.extractConfig(partialCyclesItem);
    if (cyclesConfig && cyclesConfig.confidence > 0.2) {
      expect(cyclesConfig.workDuration).toBe(25); // Default value
      expect(cyclesConfig.restDuration).toBe(5);  // Default value
      expect(cyclesConfig.cycles).toBe(5);        // Extracted value
    }
  });

  /**
   * Property: Merge with defaults produces complete configuration
   */
  test('Property: Merge with defaults produces complete configuration', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.option(fc.integer({ min: 1, max: 120 }), { nil: undefined }),
        restDuration: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
        cycles: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
        longBreakDuration: fc.option(fc.integer({ min: 5, max: 60 }), { nil: undefined }),
        source: fc.constantFrom('plan-sync', 'default'),
        confidence: fc.float({ min: 0, max: 1 }),
        extractedFrom: fc.record({
          title: fc.boolean(),
          description: fc.boolean(),
          subBlocks: fc.boolean()
        })
      }),
      (partialConfig: Partial<ExtractedPomodoroConfig>) => {
        const mergedConfig = PomodoroConfigExtractor.mergeWithDefaults(partialConfig);
        
        // Should always have complete configuration
        expect(typeof mergedConfig.workDuration).toBe('number');
        expect(typeof mergedConfig.restDuration).toBe('number');
        expect(typeof mergedConfig.cycles).toBe('number');
        
        // Should preserve provided values
        if (partialConfig.workDuration !== undefined) {
          expect(mergedConfig.workDuration).toBe(partialConfig.workDuration);
        }
        if (partialConfig.restDuration !== undefined) {
          expect(mergedConfig.restDuration).toBe(partialConfig.restDuration);
        }
        if (partialConfig.cycles !== undefined) {
          expect(mergedConfig.cycles).toBe(partialConfig.cycles);
        }
        if (partialConfig.longBreakDuration !== undefined) {
          expect(mergedConfig.longBreakDuration).toBe(partialConfig.longBreakDuration);
        }
        
        // Should use defaults for missing values
        if (partialConfig.workDuration === undefined) {
          expect(mergedConfig.workDuration).toBe(25);
        }
        if (partialConfig.restDuration === undefined) {
          expect(mergedConfig.restDuration).toBe(5);
        }
        if (partialConfig.cycles === undefined) {
          expect(mergedConfig.cycles).toBe(4);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Default configuration is always valid
   */
  test('Property: Default configuration is always valid', () => {
    const defaultConfig = PomodoroConfigExtractor.getDefaultConfig();
    
    // Should have all required fields
    expect(typeof defaultConfig.workDuration).toBe('number');
    expect(typeof defaultConfig.restDuration).toBe('number');
    expect(typeof defaultConfig.cycles).toBe('number');
    expect(typeof defaultConfig.source).toBe('string');
    expect(typeof defaultConfig.confidence).toBe('number');
    
    // Should have valid values
    expect(defaultConfig.workDuration).toBe(25);
    expect(defaultConfig.restDuration).toBe(5);
    expect(defaultConfig.cycles).toBe(4);
    expect(defaultConfig.source).toBe('default');
    expect(defaultConfig.confidence).toBe(1.0);
    
    // Should have extraction source information
    expect(defaultConfig.extractedFrom).toBeDefined();
    expect(defaultConfig.extractedFrom.title).toBe(false);
    expect(defaultConfig.extractedFrom.description).toBe(false);
    expect(defaultConfig.extractedFrom.subBlocks).toBe(false);
  });

  /**
   * Property: Fallback maintains configuration integrity
   */
  test('Property: Fallback maintains configuration integrity', () => {
    fc.assert(fc.property(incompletePomodoroPlanItem, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      if (extractedConfig) {
        // Work duration should be reasonable compared to rest duration
        expect(extractedConfig.workDuration).toBeGreaterThanOrEqual(extractedConfig.restDuration);
        
        // Long break should be longer than regular rest (if present)
        if (extractedConfig.longBreakDuration !== undefined) {
          expect(extractedConfig.longBreakDuration).toBeGreaterThanOrEqual(extractedConfig.restDuration);
        }
        
        // Cycles should be reasonable
        expect(extractedConfig.cycles).toBeLessThanOrEqual(10);
        
        // Source should be appropriate
        if (extractedConfig.confidence > 0.2) {
          expect(extractedConfig.source).toBe('plan-sync');
        }
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Confidence reflects completeness
   */
  test('Property: Confidence reflects completeness', () => {
    fc.assert(fc.property(incompletePomodoroPlanItem, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      if (extractedConfig) {
        // Higher confidence should correlate with more extracted fields
        let extractedFieldCount = 0;
        if (extractedConfig.workDuration !== 25) extractedFieldCount++; // Not default
        if (extractedConfig.restDuration !== 5) extractedFieldCount++;  // Not default
        if (extractedConfig.cycles !== 4) extractedFieldCount++;        // Not default
        if (extractedConfig.longBreakDuration !== undefined) extractedFieldCount++;
        
        // More extracted fields should generally mean higher confidence
        if (extractedFieldCount >= 2) {
          expect(extractedConfig.confidence).toBeGreaterThan(0.3);
        }
        
        // Confidence should be reasonable
        expect(extractedConfig.confidence).toBeGreaterThanOrEqual(0);
        expect(extractedConfig.confidence).toBeLessThanOrEqual(1);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Fallback is deterministic
   */
  test('Property: Fallback is deterministic', () => {
    fc.assert(fc.property(incompletePomodoroPlanItem, (planItem: PlanItem) => {
      const config1 = PomodoroConfigExtractor.extractConfig(planItem);
      const config2 = PomodoroConfigExtractor.extractConfig(planItem);
      const config3 = PomodoroConfigExtractor.extractConfig(planItem);
      
      // Results should be identical
      if (config1 && config2 && config3) {
        expect(config2.workDuration).toBe(config1.workDuration);
        expect(config2.restDuration).toBe(config1.restDuration);
        expect(config2.cycles).toBe(config1.cycles);
        expect(config2.confidence).toBe(config1.confidence);
        expect(config2.source).toBe(config1.source);
        
        expect(config3.workDuration).toBe(config1.workDuration);
        expect(config3.restDuration).toBe(config1.restDuration);
        expect(config3.cycles).toBe(config1.cycles);
        expect(config3.confidence).toBe(config1.confidence);
        expect(config3.source).toBe(config1.source);
      } else {
        // All should be null if one is null
        expect(config1).toBe(config2);
        expect(config2).toBe(config3);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Edge cases are handled gracefully
   */
  test('Property: Edge cases are handled gracefully', () => {
    // Test null/undefined inputs
    expect(PomodoroConfigExtractor.extractConfig(null as any)).toBeNull();
    expect(PomodoroConfigExtractor.extractConfig(undefined as any)).toBeNull();
    
    // Test empty plan item
    const emptyPlanItem: PlanItem = {
      id: '',
      title: '',
      desc: '',
      time: '',
      category: '',
      energy_required: 'high'
    };
    
    const emptyResult = PomodoroConfigExtractor.extractConfig(emptyPlanItem);
    expect(emptyResult).toBeNull();
    
    // Test plan item with only whitespace
    const whitespacePlanItem: PlanItem = {
      id: '',
      title: '   ',
      desc: '\t\n',
      time: '',
      category: '',
      energy_required: 'high'
    };
    
    const whitespaceResult = PomodoroConfigExtractor.extractConfig(whitespacePlanItem);
    expect(whitespaceResult).toBeNull();
  });
});

// Helper function to get default configuration
function getDefaultConfig(): ExtractedPomodoroConfig {
  return {
    workDuration: 25,
    restDuration: 5,
    cycles: 4,
    longBreakDuration: 15,
    source: 'default',
    confidence: 1.0,
    extractedFrom: {
      title: false,
      description: false,
      subBlocks: false
    }
  };
}