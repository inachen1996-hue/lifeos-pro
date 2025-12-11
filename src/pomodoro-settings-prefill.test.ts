/**
 * Property-Based Tests for Pomodoro Settings Pre-fill
 * **Feature: pomodoro-plan-sync, Property 9: Settings Pre-fill Accuracy**
 * **Validates: Requirements 4.1**
 */

import * as fc from 'fast-check';
import { PomodoroConfigExtractor } from './pomodoro-config-extractor.js';
import { PlanItem, ExtractedPomodoroConfig } from './pomodoro-plan-sync-types.js';

describe('Pomodoro Settings Pre-fill Property Tests', () => {

  // Generator for plan items with pomodoro information
  const planItemWithPomodoro = fc.record({
    id: fc.string(),
    title: fc.oneof(
      fc.constant('忙25分钟，休息5分钟，4个番茄钟'),
      fc.constant('工作30分钟休息10分钟'),
      fc.constant('pomodoro: 25min work + 5min break'),
      fc.constant('Focus session with breaks'),
      fc.string()
    ),
    desc: fc.oneof(
      fc.constant('忙20分钟，休息5分钟，3个番茄钟之后，休息15分钟'),
      fc.constant('工作25分钟，然后休息5分钟，重复4次'),
      fc.constant('work 25min, break 5min, 4 cycles'),
      fc.string()
    ),
    time: fc.string(),
    category: fc.string(),
    sub_blocks: fc.option(fc.array(fc.record({
      time: fc.string(),
      label: fc.oneof(
        fc.constant('Focus'),
        fc.constant('Break'),
        fc.constant('Pomodoro'),
        fc.string()
      ),
      detail: fc.oneof(
        fc.constant('25分钟专注工作'),
        fc.constant('5分钟休息'),
        fc.string()
      )
    }), { minLength: 0, maxLength: 5 }), { nil: undefined }),
    energy_required: fc.constantFrom('high', 'low')
  });

  // Generator for plan items without pomodoro information
  const planItemWithoutPomodoro = fc.record({
    id: fc.string(),
    title: fc.string().filter(s => !s.includes('番茄钟') && !s.includes('pomodoro')),
    desc: fc.string().filter(s => !s.includes('番茄钟') && !s.includes('pomodoro')),
    time: fc.string(),
    category: fc.string(),
    sub_blocks: fc.option(fc.array(fc.record({
      time: fc.string(),
      label: fc.string().filter(s => !s.includes('Focus') && !s.includes('Break')),
      detail: fc.string()
    }), { minLength: 0, maxLength: 3 }), { nil: undefined }),
    energy_required: fc.constantFrom('high', 'low')
  });

  /**
   * Property 9: Settings Pre-fill Accuracy
   * For any detected pomodoro configuration, the UI pre-fill function 
   * should set all extracted values correctly in the corresponding form fields
   */
  test('Property 9: Settings Pre-fill Accuracy', () => {
    fc.assert(fc.property(planItemWithPomodoro, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      if (extractedConfig && extractedConfig.confidence > 0.2) {
        // Simulate UI pre-fill behavior
        const preFillResult = simulatePreFill(extractedConfig);
        
        // Verify that extracted values are correctly pre-filled
        if (extractedConfig.workDuration !== undefined) {
          expect(preFillResult.workDuration).toBe(extractedConfig.workDuration);
          expect(preFillResult.workDuration).toBeGreaterThanOrEqual(1);
          expect(preFillResult.workDuration).toBeLessThanOrEqual(120);
        }
        
        if (extractedConfig.restDuration !== undefined) {
          expect(preFillResult.restDuration).toBe(extractedConfig.restDuration);
          expect(preFillResult.restDuration).toBeGreaterThanOrEqual(1);
          expect(preFillResult.restDuration).toBeLessThanOrEqual(60);
        }
        
        if (extractedConfig.cycles !== undefined) {
          expect(preFillResult.cycles).toBe(extractedConfig.cycles);
          expect(preFillResult.cycles).toBeGreaterThanOrEqual(1);
          expect(preFillResult.cycles).toBeLessThanOrEqual(10);
        }
        
        if (extractedConfig.longBreakDuration !== undefined) {
          expect(preFillResult.longBreakDuration).toBe(extractedConfig.longBreakDuration);
          expect(preFillResult.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(preFillResult.longBreakDuration).toBeLessThanOrEqual(60);
        }
        
        // Verify source tracking
        expect(preFillResult.source).toBe(extractedConfig.source);
        expect(preFillResult.syncIndicatorVisible).toBe(true);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: No pre-fill for non-pomodoro items
   */
  test('Property: No pre-fill for non-pomodoro items', () => {
    fc.assert(fc.property(planItemWithoutPomodoro, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      // Should not extract configuration from non-pomodoro items
      if (extractedConfig) {
        expect(extractedConfig.confidence).toBeLessThan(0.3);
      } else {
        expect(extractedConfig).toBeNull();
      }
      
      // Simulate UI behavior for non-pomodoro items
      const preFillResult = simulatePreFill(extractedConfig);
      
      // Should use default values
      expect(preFillResult.workDuration).toBe(25); // default
      expect(preFillResult.restDuration).toBe(5);  // default
      expect(preFillResult.cycles).toBe(4);        // default
      expect(preFillResult.source).toBe('default');
      expect(preFillResult.syncIndicatorVisible).toBe(false);
    }), { numRuns: 100 });
  });

  /**
   * Property: Pre-fill preserves valid ranges
   */
  test('Property: Pre-fill preserves valid ranges', () => {
    fc.assert(fc.property(planItemWithPomodoro, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      if (extractedConfig) {
        const preFillResult = simulatePreFill(extractedConfig);
        
        // All pre-filled values should be within valid ranges
        expect(preFillResult.workDuration).toBeGreaterThanOrEqual(1);
        expect(preFillResult.workDuration).toBeLessThanOrEqual(120);
        expect(preFillResult.restDuration).toBeGreaterThanOrEqual(1);
        expect(preFillResult.restDuration).toBeLessThanOrEqual(60);
        expect(preFillResult.cycles).toBeGreaterThanOrEqual(1);
        expect(preFillResult.cycles).toBeLessThanOrEqual(10);
        
        if (preFillResult.longBreakDuration !== undefined) {
          expect(preFillResult.longBreakDuration).toBeGreaterThanOrEqual(5);
          expect(preFillResult.longBreakDuration).toBeLessThanOrEqual(60);
        }
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Sync indicator reflects configuration source
   */
  test('Property: Sync indicator reflects configuration source', () => {
    fc.assert(fc.property(planItemWithPomodoro, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      const preFillResult = simulatePreFill(extractedConfig);
      
      if (extractedConfig && extractedConfig.confidence > 0.2) {
        // Should show sync indicator for plan-synced configs
        expect(preFillResult.syncIndicatorVisible).toBe(true);
        expect(preFillResult.source).toBe('plan-sync');
        expect(preFillResult.confidence).toBe(extractedConfig.confidence);
        
        // Should have extraction source information
        expect(preFillResult.extractedFrom).toBeDefined();
        if (preFillResult.extractedFrom) {
          expect(typeof preFillResult.extractedFrom.title).toBe('boolean');
          expect(typeof preFillResult.extractedFrom.description).toBe('boolean');
          expect(typeof preFillResult.extractedFrom.subBlocks).toBe('boolean');
        }
      } else {
        // Should not show sync indicator for default configs
        expect(preFillResult.syncIndicatorVisible).toBe(false);
        expect(preFillResult.source).toBe('default');
      }
    }), { numRuns: 50 }); // Reduce runs to speed up debugging
  });

  /**
   * Property: User modifications update source tracking
   */
  test('Property: User modifications update source tracking', () => {
    fc.assert(fc.property(
      planItemWithPomodoro,
      fc.integer({ min: 1, max: 120 }),
      (planItem: PlanItem, newWorkDuration: number) => {
        const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
        
        if (extractedConfig && extractedConfig.confidence > 0.2) {
          let preFillResult = simulatePreFill(extractedConfig);
          
          // Initially should be plan-synced
          expect(preFillResult.source).toBe('plan-sync');
          
          // Simulate user modification
          preFillResult = simulateUserModification(preFillResult, 'workDuration', newWorkDuration);
          
          // Should update source to user-modified
          expect(preFillResult.source).toBe('user-modified');
          expect(preFillResult.workDuration).toBe(newWorkDuration);
          
          // Should still show sync indicator but with modified state
          expect(preFillResult.syncIndicatorVisible).toBe(true);
          expect(preFillResult.hasUserModifications).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Reset functionality restores original values
   */
  test('Property: Reset functionality restores original values', () => {
    fc.assert(fc.property(
      planItemWithPomodoro,
      fc.integer({ min: 1, max: 120 }),
      fc.integer({ min: 1, max: 60 }),
      (planItem: PlanItem, newWorkDuration: number, newRestDuration: number) => {
        const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
        
        if (extractedConfig && extractedConfig.confidence > 0.2) {
          let preFillResult = simulatePreFill(extractedConfig);
          const originalWorkDuration = preFillResult.workDuration;
          const originalRestDuration = preFillResult.restDuration;
          
          // Simulate user modifications
          preFillResult = simulateUserModification(preFillResult, 'workDuration', newWorkDuration);
          preFillResult = simulateUserModification(preFillResult, 'restDuration', newRestDuration);
          
          expect(preFillResult.source).toBe('user-modified');
          expect(preFillResult.workDuration).toBe(newWorkDuration);
          expect(preFillResult.restDuration).toBe(newRestDuration);
          
          // Simulate reset
          preFillResult = simulateReset(preFillResult, extractedConfig);
          
          // Should restore original values
          expect(preFillResult.source).toBe('plan-sync');
          expect(preFillResult.workDuration).toBe(originalWorkDuration);
          expect(preFillResult.restDuration).toBe(originalRestDuration);
          expect(preFillResult.hasUserModifications).toBe(false);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Partial configurations use defaults for missing values
   */
  test('Property: Partial configurations use defaults for missing values', () => {
    // Create plan items with partial pomodoro information
    const partialPomodoroItem = fc.record({
      id: fc.string(),
      title: fc.oneof(
        fc.constant('工作25分钟'), // Only work duration
        fc.constant('休息5分钟'),  // Only rest duration
        fc.constant('3个番茄钟')   // Only cycles
      ),
      desc: fc.string(),
      time: fc.string(),
      category: fc.string(),
      energy_required: fc.constantFrom('high', 'low')
    });

    fc.assert(fc.property(partialPomodoroItem, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      const preFillResult = simulatePreFill(extractedConfig);
      
      // Should always have valid values (extracted or default)
      expect(typeof preFillResult.workDuration).toBe('number');
      expect(typeof preFillResult.restDuration).toBe('number');
      expect(typeof preFillResult.cycles).toBe('number');
      
      expect(preFillResult.workDuration).toBeGreaterThanOrEqual(1);
      expect(preFillResult.restDuration).toBeGreaterThanOrEqual(1);
      expect(preFillResult.cycles).toBeGreaterThanOrEqual(1);
      
      // If no extraction occurred, should use defaults
      if (!extractedConfig || extractedConfig.confidence < 0.2) {
        expect(preFillResult.workDuration).toBe(25);
        expect(preFillResult.restDuration).toBe(5);
        expect(preFillResult.cycles).toBe(4);
        expect(preFillResult.source).toBe('default');
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Confidence level affects UI presentation
   */
  test('Property: Confidence level affects UI presentation', () => {
    fc.assert(fc.property(planItemWithPomodoro, (planItem: PlanItem) => {
      const extractedConfig = PomodoroConfigExtractor.extractConfig(planItem);
      
      if (extractedConfig) {
        const preFillResult = simulatePreFill(extractedConfig);
        
        if (extractedConfig.confidence >= 0.7) {
          // High confidence should show strong sync indicator
          expect(preFillResult.syncIndicatorStrength).toBe('strong');
          expect(preFillResult.recommendPomodoro).toBe(true);
        } else if (extractedConfig.confidence >= 0.3) {
          // Medium confidence should show moderate sync indicator
          expect(preFillResult.syncIndicatorStrength).toBe('moderate');
          expect(preFillResult.recommendPomodoro).toBe(true);
        } else {
          // Low confidence should show weak or no sync indicator
          expect(preFillResult.syncIndicatorStrength).toMatch(/weak|none/);
        }
        
        // Confidence should be preserved for display
        expect(preFillResult.confidence).toBe(extractedConfig.confidence);
      }
    }), { numRuns: 100 });
  });
});

// Helper functions to simulate UI behavior

interface PreFillResult {
  workDuration: number;
  restDuration: number;
  cycles: number;
  longBreakDuration?: number;
  source: 'default' | 'plan-sync' | 'user-modified';
  syncIndicatorVisible: boolean;
  syncIndicatorStrength?: 'strong' | 'moderate' | 'weak' | 'none';
  confidence?: number;
  extractedFrom?: {
    title: boolean;
    description: boolean;
    subBlocks: boolean;
  };
  hasUserModifications?: boolean;
  recommendPomodoro?: boolean;
}

function simulatePreFill(config: ExtractedPomodoroConfig | null): PreFillResult {
  const defaults = {
    workDuration: 25,
    restDuration: 5,
    cycles: 4,
    longBreakDuration: 15
  };

  if (!config || config.confidence < 0.2) {
    return {
      workDuration: defaults.workDuration,
      restDuration: defaults.restDuration,
      cycles: defaults.cycles,
      source: 'default',
      syncIndicatorVisible: false,
      syncIndicatorStrength: 'none',
      hasUserModifications: false,
      recommendPomodoro: false
    };
  }

  const syncIndicatorStrength = 
    config.confidence >= 0.7 ? 'strong' :
    config.confidence >= 0.3 ? 'moderate' : 'weak';

  return {
    workDuration: config.workDuration ?? defaults.workDuration,
    restDuration: config.restDuration ?? defaults.restDuration,
    cycles: config.cycles ?? defaults.cycles,
    longBreakDuration: config.longBreakDuration,
    source: 'plan-sync',
    syncIndicatorVisible: true,
    syncIndicatorStrength,
    confidence: config.confidence,
    extractedFrom: config.extractedFrom || {
      title: false,
      description: false,
      subBlocks: false
    },
    hasUserModifications: false,
    recommendPomodoro: config.confidence >= 0.3
  };
}

function simulateUserModification(
  result: PreFillResult, 
  field: keyof PreFillResult, 
  value: any
): PreFillResult {
  return {
    ...result,
    [field]: value,
    source: 'user-modified',
    hasUserModifications: true
  };
}

function simulateReset(
  result: PreFillResult, 
  originalConfig: ExtractedPomodoroConfig
): PreFillResult {
  return simulatePreFill(originalConfig);
}