/**
 * Property-Based Tests for Ideal Ratio Persistence
 * Feature: lifeos-timer-rework, Property 18: Ideal ratio persistence
 * Validates: Requirements 11.3
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Storage } from '../src/storage.js';
import { STORAGE_KEYS } from '../src/types.js';

/**
 * Interface for ideal ratio allocations
 */
interface IdealRatioAllocations {
  work: number;
  study: number;
  rest: number;
  sleep: number;
  life: number;
  entertainment: number;
  health: number;
  hobby: number;
}

/**
 * Save ideal ratio allocations to storage
 */
function saveIdealRatioAllocations(allocations: IdealRatioAllocations): void {
  Storage.save(STORAGE_KEYS.ALLOCATIONS, allocations);
}

/**
 * Load ideal ratio allocations from storage
 */
function loadIdealRatioAllocations(): IdealRatioAllocations | null {
  return Storage.load<IdealRatioAllocations>(STORAGE_KEYS.ALLOCATIONS, null);
}

/**
 * Default allocations
 */
const DEFAULT_ALLOCATIONS: IdealRatioAllocations = {
  work: 8.0,
  study: 2.0,
  rest: 2.0,
  sleep: 7.0,
  life: 2.5,
  entertainment: 2.5,
  health: 1.0,
  hobby: 0.0,
};

describe('Ideal Ratio Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Arbitrary generator for ideal ratio allocations
   * Hours should be non-negative and reasonable (0-24 hours per category)
   */
  const allocationsArbitrary: fc.Arbitrary<IdealRatioAllocations> = fc.record({
    work: fc.float({ min: 0, max: 24, noNaN: true }),
    study: fc.float({ min: 0, max: 24, noNaN: true }),
    rest: fc.float({ min: 0, max: 24, noNaN: true }),
    sleep: fc.float({ min: 0, max: 24, noNaN: true }),
    life: fc.float({ min: 0, max: 24, noNaN: true }),
    entertainment: fc.float({ min: 0, max: 24, noNaN: true }),
    health: fc.float({ min: 0, max: 24, noNaN: true }),
    hobby: fc.float({ min: 0, max: 24, noNaN: true }),
  });

  /**
   * Property 18: Ideal ratio persistence
   * For any modification to ideal ratio values, the changes should be persisted
   * to storage and reflected in subsequent comparison calculations.
   */
  it('should persist ideal ratio modifications to storage', () => {
    fc.assert(
      fc.property(allocationsArbitrary, (allocations) => {
        // Save allocations
        saveIdealRatioAllocations(allocations);
        
        // Load allocations
        const loaded = loadIdealRatioAllocations();
        
        // Should not be null
        expect(loaded).not.toBeNull();
        
        // All fields should match
        expect(loaded!.work).toBeCloseTo(allocations.work, 5);
        expect(loaded!.study).toBeCloseTo(allocations.study, 5);
        expect(loaded!.rest).toBeCloseTo(allocations.rest, 5);
        expect(loaded!.sleep).toBeCloseTo(allocations.sleep, 5);
        expect(loaded!.life).toBeCloseTo(allocations.life, 5);
        expect(loaded!.entertainment).toBeCloseTo(allocations.entertainment, 5);
        expect(loaded!.health).toBeCloseTo(allocations.health, 5);
        expect(loaded!.hobby).toBeCloseTo(allocations.hobby, 5);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple saves preserve latest values
   * When saving multiple times, the latest values should be persisted
   */
  it('should preserve latest values when saving multiple times', () => {
    fc.assert(
      fc.property(
        fc.array(allocationsArbitrary, { minLength: 2, maxLength: 10 }),
        (allocationsList) => {
          // Save all allocations in sequence
          allocationsList.forEach(allocations => {
            saveIdealRatioAllocations(allocations);
          });
          
          // Load allocations
          const loaded = loadIdealRatioAllocations();
          
          // Should match the last saved allocations
          const lastAllocations = allocationsList[allocationsList.length - 1];
          expect(loaded!.work).toBeCloseTo(lastAllocations.work, 5);
          expect(loaded!.study).toBeCloseTo(lastAllocations.study, 5);
          expect(loaded!.rest).toBeCloseTo(lastAllocations.rest, 5);
          expect(loaded!.sleep).toBeCloseTo(lastAllocations.sleep, 5);
          expect(loaded!.life).toBeCloseTo(lastAllocations.life, 5);
          expect(loaded!.entertainment).toBeCloseTo(lastAllocations.entertainment, 5);
          expect(loaded!.health).toBeCloseTo(lastAllocations.health, 5);
          expect(loaded!.hobby).toBeCloseTo(lastAllocations.hobby, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Partial updates preserve other fields
   * When updating only some fields, other fields should remain unchanged
   */
  it('should preserve unchanged fields when updating partial allocations', () => {
    // Save initial allocations
    saveIdealRatioAllocations(DEFAULT_ALLOCATIONS);
    
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 24, noNaN: true }),
        fc.float({ min: 0, max: 24, noNaN: true }),
        (newWork, newStudy) => {
          // Load current allocations
          const current = loadIdealRatioAllocations()!;
          
          // Update only work and study
          const updated: IdealRatioAllocations = {
            ...current,
            work: newWork,
            study: newStudy,
          };
          
          // Save updated allocations
          saveIdealRatioAllocations(updated);
          
          // Load and verify
          const loaded = loadIdealRatioAllocations()!;
          
          // Updated fields should match
          expect(loaded.work).toBeCloseTo(newWork, 5);
          expect(loaded.study).toBeCloseTo(newStudy, 5);
          
          // Other fields should be preserved
          expect(loaded.rest).toBeCloseTo(current.rest, 5);
          expect(loaded.sleep).toBeCloseTo(current.sleep, 5);
          expect(loaded.life).toBeCloseTo(current.life, 5);
          expect(loaded.entertainment).toBeCloseTo(current.entertainment, 5);
          expect(loaded.health).toBeCloseTo(current.health, 5);
          expect(loaded.hobby).toBeCloseTo(current.hobby, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Zero allocations
   */
  it('should handle zero allocations', () => {
    const zeroAllocations: IdealRatioAllocations = {
      work: 0,
      study: 0,
      rest: 0,
      sleep: 0,
      life: 0,
      entertainment: 0,
      health: 0,
      hobby: 0,
    };
    
    saveIdealRatioAllocations(zeroAllocations);
    const loaded = loadIdealRatioAllocations();
    
    expect(loaded).toEqual(zeroAllocations);
  });

  /**
   * Edge case: Maximum allocations
   */
  it('should handle maximum allocations', () => {
    const maxAllocations: IdealRatioAllocations = {
      work: 24,
      study: 24,
      rest: 24,
      sleep: 24,
      life: 24,
      entertainment: 24,
      health: 24,
      hobby: 24,
    };
    
    saveIdealRatioAllocations(maxAllocations);
    const loaded = loadIdealRatioAllocations();
    
    expect(loaded!.work).toBeCloseTo(24, 5);
    expect(loaded!.study).toBeCloseTo(24, 5);
    expect(loaded!.rest).toBeCloseTo(24, 5);
    expect(loaded!.sleep).toBeCloseTo(24, 5);
    expect(loaded!.life).toBeCloseTo(24, 5);
    expect(loaded!.entertainment).toBeCloseTo(24, 5);
    expect(loaded!.health).toBeCloseTo(24, 5);
    expect(loaded!.hobby).toBeCloseTo(24, 5);
  });

  /**
   * Property: Persistence survives page reload simulation
   * Clearing and reloading should still retrieve saved values
   */
  it('should persist across simulated page reloads', () => {
    fc.assert(
      fc.property(allocationsArbitrary, (allocations) => {
        // Save allocations
        saveIdealRatioAllocations(allocations);
        
        // Simulate page reload by loading again
        const loaded1 = loadIdealRatioAllocations();
        const loaded2 = loadIdealRatioAllocations();
        
        // Both loads should return the same values
        expect(loaded1).toEqual(loaded2);
        
        // Values should match original
        expect(loaded1!.work).toBeCloseTo(allocations.work, 5);
        expect(loaded1!.study).toBeCloseTo(allocations.study, 5);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All categories are persisted
   * Every category in the allocations should be persisted
   */
  it('should persist all category allocations', () => {
    fc.assert(
      fc.property(allocationsArbitrary, (allocations) => {
        saveIdealRatioAllocations(allocations);
        const loaded = loadIdealRatioAllocations()!;
        
        // Verify all categories are present
        expect(loaded).toHaveProperty('work');
        expect(loaded).toHaveProperty('study');
        expect(loaded).toHaveProperty('rest');
        expect(loaded).toHaveProperty('sleep');
        expect(loaded).toHaveProperty('life');
        expect(loaded).toHaveProperty('entertainment');
        expect(loaded).toHaveProperty('health');
        expect(loaded).toHaveProperty('hobby');
        
        // Verify all are numbers
        expect(typeof loaded.work).toBe('number');
        expect(typeof loaded.study).toBe('number');
        expect(typeof loaded.rest).toBe('number');
        expect(typeof loaded.sleep).toBe('number');
        expect(typeof loaded.life).toBe('number');
        expect(typeof loaded.entertainment).toBe('number');
        expect(typeof loaded.health).toBe('number');
        expect(typeof loaded.hobby).toBe('number');
      }),
      { numRuns: 100 }
    );
  });
});
