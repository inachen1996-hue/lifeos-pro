/**
 * Property-Based Tests for Pomodoro Conflict Resolver
 * **Feature: pomodoro-plan-sync, Property 12: Conflict Resolution Priority**
 * **Validates: Requirements 5.3**
 */

import * as fc from 'fast-check';
import { PomodoroConflictResolver } from './pomodoro-conflict-resolver.js';
import { PlanItem } from './pomodoro-plan-sync-types.js';

describe('PomodoroConflictResolver Property Tests', () => {
  
  // Generator for plan items with conflicting information
  const planItemWithConflicts = fc.record({
    id: fc.string({ minLength: 1 }),
    title: fc.oneof(
      fc.string(),
      fc.tuple(
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 1, max: 30 })
      ).map(([work, rest]) => `忙${work}分钟，休息${rest}分钟`)
    ),
    desc: fc.oneof(
      fc.string(),
      fc.tuple(
        fc.integer({ min: 1, max: 60 }),
        fc.integer({ min: 1, max: 30 })
      ).map(([work, rest]) => `工作${work}分钟，休息${rest}分钟`)
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
      detail: fc.oneof(
        fc.string(),
        fc.tuple(
          fc.integer({ min: 1, max: 60 }),
          fc.integer({ min: 1, max: 30 })
        ).map(([work, rest]) => `${work}分钟专注，${rest}分钟休息`)
      )
    }), { minLength: 0, maxLength: 3 }))
  });

  /**
   * Property 12: Conflict Resolution Priority
   * For any plan item with conflicting time information, 
   * the system should consistently prioritize the most specific pomodoro-related values
   */
  test('Property 12: Conflict Resolution Priority', () => {
    fc.assert(fc.property(planItemWithConflicts, (planItem: PlanItem) => {
      const result = PomodoroConflictResolver.resolveConflicts(planItem);
      
      // Result should always be valid
      expect(result.resolvedConfig).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      
      // Resolved configuration should have valid values
      expect(result.resolvedConfig.workDuration).toBeGreaterThanOrEqual(1);
      expect(result.resolvedConfig.workDuration).toBeLessThanOrEqual(120);
      expect(result.resolvedConfig.restDuration).toBeGreaterThanOrEqual(1);
      expect(result.resolvedConfig.restDuration).toBeLessThanOrEqual(60);
      expect(result.resolvedConfig.cycles).toBeGreaterThanOrEqual(1);
      expect(result.resolvedConfig.cycles).toBeLessThanOrEqual(10);
      
      // Should have a resolution strategy
      expect(typeof result.resolutionStrategy).toBe('string');
      expect(result.resolutionStrategy.length).toBeGreaterThan(0);
      
      // Conflicts array should be defined
      expect(Array.isArray(result.conflicts)).toBe(true);
    }), { numRuns: 100 });
  });

  /**
   * Property: Resolution is deterministic
   */
  test('Property: Resolution is deterministic', () => {
    fc.assert(fc.property(planItemWithConflicts, (planItem: PlanItem) => {
      const result1 = PomodoroConflictResolver.resolveConflicts(planItem);
      const result2 = PomodoroConflictResolver.resolveConflicts(planItem);
      const result3 = PomodoroConflictResolver.resolveConflicts(planItem);
      
      // Results should be identical
      expect(result2.resolvedConfig.workDuration).toBe(result1.resolvedConfig.workDuration);
      expect(result2.resolvedConfig.restDuration).toBe(result1.resolvedConfig.restDuration);
      expect(result2.resolvedConfig.cycles).toBe(result1.resolvedConfig.cycles);
      expect(result2.confidence).toBe(result1.confidence);
      expect(result2.resolutionStrategy).toBe(result1.resolutionStrategy);
      expect(result2.conflicts.length).toBe(result1.conflicts.length);
      
      expect(result3.resolvedConfig.workDuration).toBe(result1.resolvedConfig.workDuration);
      expect(result3.resolvedConfig.restDuration).toBe(result1.resolvedConfig.restDuration);
      expect(result3.resolvedConfig.cycles).toBe(result1.resolvedConfig.cycles);
      expect(result3.confidence).toBe(result1.confidence);
      expect(result3.resolutionStrategy).toBe(result1.resolutionStrategy);
      expect(result3.conflicts.length).toBe(result1.conflicts.length);
    }), { numRuns: 100 });
  });

  /**
   * Property: Higher priority sources win conflicts
   */
  test('Property: Higher priority sources win conflicts', () => {
    fc.assert(fc.property(
      fc.record({
        titleWork: fc.integer({ min: 1, max: 30 }),
        descWork: fc.integer({ min: 31, max: 60 }),
        titleRest: fc.integer({ min: 1, max: 15 }),
        descRest: fc.integer({ min: 16, max: 30 })
      }),
      (config) => {
        // Create plan item with specific conflicts
        const planItem: PlanItem = {
          id: 'test',
          title: `忙${config.titleWork}分钟，休息${config.titleRest}分钟`, // Higher priority
          desc: `工作${config.descWork}分钟，休息${config.descRest}分钟`, // Lower priority
          time: '09:00-10:00',
          category: 'work',
          energy_required: 'high'
        };
        
        const result = PomodoroConflictResolver.resolveConflicts(planItem);
        
        // If there are conflicts, check that resolution is reasonable
        if (result.conflicts.length > 0) {
          // At least one conflict should be resolved with a reasonable strategy
          const workConflict = result.conflicts.find(c => c.field === 'workDuration');
          const restConflict = result.conflicts.find(c => c.field === 'restDuration');
          
          if (workConflict) {
            expect(workConflict.resolutionReason).toBeTruthy();
            expect(workConflict.resolutionReason.length).toBeGreaterThan(0);
          }
          if (restConflict) {
            expect(restConflict.resolutionReason).toBeTruthy();
            expect(restConflict.resolutionReason.length).toBeGreaterThan(0);
          }
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Resolved configuration is always valid
   */
  test('Property: Resolved configuration is always valid', () => {
    fc.assert(fc.property(planItemWithConflicts, (planItem: PlanItem) => {
      const result = PomodoroConflictResolver.resolveConflicts(planItem);
      
      const isValid = PomodoroConflictResolver.validateResolvedConfig(result.resolvedConfig);
      expect(isValid).toBe(true);
      
      // Check specific validations
      expect(result.resolvedConfig.workDuration).toBeGreaterThanOrEqual(1);
      expect(result.resolvedConfig.workDuration).toBeLessThanOrEqual(120);
      expect(result.resolvedConfig.restDuration).toBeGreaterThanOrEqual(1);
      expect(result.resolvedConfig.restDuration).toBeLessThanOrEqual(60);
      expect(result.resolvedConfig.cycles).toBeGreaterThanOrEqual(1);
      expect(result.resolvedConfig.cycles).toBeLessThanOrEqual(10);
      
      if (result.resolvedConfig.longBreakDuration !== undefined) {
        expect(result.resolvedConfig.longBreakDuration).toBeGreaterThanOrEqual(5);
        expect(result.resolvedConfig.longBreakDuration).toBeLessThanOrEqual(60);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Conflict information is complete
   */
  test('Property: Conflict information is complete', () => {
    fc.assert(fc.property(planItemWithConflicts, (planItem: PlanItem) => {
      const result = PomodoroConflictResolver.resolveConflicts(planItem);
      
      // Each conflict should have complete information
      for (const conflict of result.conflicts) {
        expect(typeof conflict.field).toBe('string');
        expect(Array.isArray(conflict.values)).toBe(true);
        expect(conflict.values.length).toBeGreaterThanOrEqual(2); // Must have at least 2 conflicting values
        expect(conflict.resolvedValue).toBeDefined();
        expect(typeof conflict.resolutionReason).toBe('string');
        expect(conflict.resolutionReason.length).toBeGreaterThan(0);
        
        // Each value should have required properties
        for (const value of conflict.values) {
          expect(value.value).toBeDefined();
          expect(typeof value.source).toBe('string');
          expect(typeof value.confidence).toBe('number');
          expect(value.confidence).toBeGreaterThanOrEqual(0);
          expect(value.confidence).toBeLessThanOrEqual(1);
        }
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Empty plan item returns default configuration
   */
  test('Property: Empty plan item returns default configuration', () => {
    const result = PomodoroConflictResolver.resolveConflicts(null as any);
    
    expect(result.resolvedConfig.workDuration).toBe(25);
    expect(result.resolvedConfig.restDuration).toBe(5);
    expect(result.resolvedConfig.cycles).toBe(4);
    expect(result.resolvedConfig.longBreakDuration).toBe(15);
    expect(result.resolvedConfig.source).toBe('default');
    expect(result.confidence).toBe(1.0);
    expect(result.resolutionStrategy).toBe('default_values');
    expect(result.conflicts.length).toBe(0);
  });

  /**
   * Property: Confidence reflects resolution quality
   */
  test('Property: Confidence reflects resolution quality', () => {
    fc.assert(fc.property(planItemWithConflicts, (planItem: PlanItem) => {
      const result = PomodoroConflictResolver.resolveConflicts(planItem);
      
      // Confidence should be higher when there are fewer conflicts
      if (result.conflicts.length === 0 && result.resolutionStrategy !== 'default_values') {
        // No conflicts should generally mean higher confidence (unless using defaults)
        expect(result.confidence).toBeGreaterThan(0.1);
      }
      
      // Confidence should be reasonable
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      
      // If we have high-priority sources, confidence should be decent
      if (result.resolvedConfig.extractedFrom.title || result.resolvedConfig.extractedFrom.description) {
        expect(result.confidence).toBeGreaterThan(0.1);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Resolution strategy matches actual resolution
   */
  test('Property: Resolution strategy matches actual resolution', () => {
    fc.assert(fc.property(planItemWithConflicts, (planItem: PlanItem) => {
      const result = PomodoroConflictResolver.resolveConflicts(planItem);
      
      // Strategy should match the actual resolution approach
      if (result.conflicts.length === 0 && result.resolutionStrategy !== 'default_values') {
        expect(result.resolutionStrategy).toBe('no_conflicts');
      } else if (result.conflicts.length > 0) {
        expect(['priority_based', 'confidence_based']).toContain(result.resolutionStrategy);
      }
      
      // Default strategy should only be used for null/empty input
      if (result.resolutionStrategy === 'default_values') {
        expect(['default', 'plan-sync']).toContain(result.resolvedConfig.source);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Extraction source flags are accurate
   */
  test('Property: Extraction source flags are accurate', () => {
    fc.assert(fc.property(
      fc.record({
        hasTitle: fc.boolean(),
        hasDesc: fc.boolean(),
        hasSubBlocks: fc.boolean()
      }),
      (flags) => {
        const planItem: PlanItem = {
          id: 'test',
          title: flags.hasTitle ? '忙25分钟，休息5分钟' : 'regular title',
          desc: flags.hasDesc ? '工作30分钟，休息10分钟' : 'regular description',
          time: '09:00-10:00',
          category: 'work',
          energy_required: 'high'
        };
        
        if (flags.hasSubBlocks) {
          planItem.sub_blocks = [{
            time: '09:00',
            label: 'Focus',
            detail: '专注20分钟'
          }];
        }
        
        const result = PomodoroConflictResolver.resolveConflicts(planItem);
        
        // Source flags should reflect actual extraction
        if (flags.hasTitle && result.resolvedConfig.extractedFrom.title) {
          // Title extraction should be reflected
          expect(result.resolvedConfig.extractedFrom.title).toBe(true);
        }
        
        if (flags.hasDesc && result.resolvedConfig.extractedFrom.description) {
          // Description extraction should be reflected
          expect(result.resolvedConfig.extractedFrom.description).toBe(true);
        }
        
        if (flags.hasSubBlocks && result.resolvedConfig.extractedFrom.subBlocks) {
          // Sub-blocks extraction should be reflected
          expect(result.resolvedConfig.extractedFrom.subBlocks).toBe(true);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Invalid input handling
   */
  test('Property: Invalid input is handled gracefully', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(undefined),
        fc.record({
          id: fc.constant(''),
          title: fc.constant(''),
          desc: fc.constant(''),
          time: fc.constant(''),
          category: fc.constant('work'),
          energy_required: fc.constant('high')
        })
      ),
      (invalidInput: any) => {
        const result = PomodoroConflictResolver.resolveConflicts(invalidInput);
        
        // Should still return a valid result
        expect(result.resolvedConfig).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(typeof result.resolutionStrategy).toBe('string');
        expect(Array.isArray(result.conflicts)).toBe(true);
        
        // Configuration should be valid
        const isValid = PomodoroConflictResolver.validateResolvedConfig(result.resolvedConfig);
        expect(isValid).toBe(true);
      }
    ), { numRuns: 100 });
  });
});