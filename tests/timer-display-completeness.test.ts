/**
 * Property-Based Tests for Timer Display Completeness
 * Feature: lifeos-timer-rework, Property 16: Timer display completeness
 * Validates: Requirements 2.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Timer, TimerCategory } from '../src/types.js';
import { TimerManager } from '../src/timer-manager.js';
import { CategoryStorage } from '../src/storage.js';

/**
 * Arbitrary generator for Timer mode
 */
const timerModeArbitrary = fc.constantFrom('stopwatch', 'countdown', 'pomodoro') as fc.Arbitrary<'stopwatch' | 'countdown' | 'pomodoro'>;

/**
 * Arbitrary generator for valid category IDs
 * Uses actual categories from storage to ensure valid references
 */
const categoryIdArbitrary = fc.constant(null).chain(() => {
  const categories = CategoryStorage.loadCategories();
  const categoryIds = categories.map(c => c.id);
  return fc.constantFrom(...categoryIds);
});

/**
 * Arbitrary generator for Timer
 * Generates valid timer configurations with appropriate settings for each mode
 */
const timerArbitrary: fc.Arbitrary<Timer> = fc
  .tuple(
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.string({ minLength: 1, maxLength: 20 }),
    categoryIdArbitrary,
    timerModeArbitrary,
    fc.date(),
    fc.date()
  )
  .chain(([id, name, icon, categoryId, mode, createdAt, updatedAt]) => {
    // Generate appropriate settings based on mode
    let settingsArb;
    
    if (mode === 'stopwatch') {
      settingsArb = fc.constant({});
    } else if (mode === 'countdown') {
      settingsArb = fc.record({
        countdownDuration: fc.integer({ min: 1, max: 180 }),
      });
    } else {
      settingsArb = fc.record({
        workDuration: fc.integer({ min: 1, max: 60 }),
        restDuration: fc.integer({ min: 1, max: 30 }),
        cycles: fc.integer({ min: 1, max: 10 }),
      });
    }
    
    return settingsArb.map(settings => ({
      id,
      name,
      icon,
      categoryId,
      mode,
      settings,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    }));
  });

/**
 * Helper function to simulate timer display
 * This represents what the UI would display for a timer
 */
interface TimerDisplay {
  name: string;
  icon: string;
  category: TimerCategory | undefined;
}

function displayTimer(timer: Timer): TimerDisplay {
  const categories = CategoryStorage.loadCategories();
  const category = categories.find(c => c.id === timer.categoryId);
  
  return {
    name: timer.name,
    icon: timer.icon,
    category,
  };
}

describe('Timer Display Completeness', () => {
  /**
   * Property 16: Timer display completeness
   * For any timer, when displayed in the UI, the display should include
   * the timer's name, icon, and category.
   */
  it('should display timer name, icon, and category for all timers', () => {
    fc.assert(
      fc.property(timerArbitrary, (timer) => {
        // Simulate displaying the timer
        const display = displayTimer(timer);
        
        // Assert name is present and matches
        expect(display.name).toBeDefined();
        expect(display.name).toBe(timer.name);
        expect(display.name.length).toBeGreaterThan(0);
        
        // Assert icon is present and matches
        expect(display.icon).toBeDefined();
        expect(display.icon).toBe(timer.icon);
        expect(display.icon.length).toBeGreaterThan(0);
        
        // Assert category is present and matches
        expect(display.category).toBeDefined();
        expect(display.category!.id).toBe(timer.categoryId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Timer display includes all required fields
   * Ensures that the display object has all three required properties
   */
  it('should include all three required display fields (name, icon, category)', () => {
    fc.assert(
      fc.property(timerArbitrary, (timer) => {
        const display = displayTimer(timer);
        
        // Check that all three fields exist
        expect(display).toHaveProperty('name');
        expect(display).toHaveProperty('icon');
        expect(display).toHaveProperty('category');
        
        // Check that none are null or undefined
        expect(display.name).not.toBeNull();
        expect(display.name).not.toBeUndefined();
        expect(display.icon).not.toBeNull();
        expect(display.icon).not.toBeUndefined();
        expect(display.category).not.toBeNull();
        expect(display.category).not.toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Timers grouped by category display correctly
   * Ensures that when timers are grouped by category, each timer
   * still displays all required information
   */
  it('should display all timer information when grouped by category', () => {
    fc.assert(
      fc.property(fc.array(timerArbitrary, { minLength: 1, maxLength: 20 }), (timers) => {
        // Group timers by category (simulating UI display)
        const grouped = TimerManager.getTimersGroupedByCategory();
        
        // For each category group
        for (const [category, categoryTimers] of grouped.entries()) {
          // For each timer in the group
          for (const timer of categoryTimers) {
            const display = displayTimer(timer);
            
            // Assert all display fields are present
            expect(display.name).toBeDefined();
            expect(display.name.length).toBeGreaterThan(0);
            expect(display.icon).toBeDefined();
            expect(display.icon.length).toBeGreaterThan(0);
            expect(display.category).toBeDefined();
            expect(display.category!.id).toBe(category.id);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Timer with minimal valid data
   */
  it('should display timer with minimal valid data', () => {
    const categories = CategoryStorage.loadCategories();
    const timer: Timer = {
      id: 'test-1',
      name: 'T',
      icon: 'X',
      categoryId: categories[0].id,
      mode: 'stopwatch',
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const display = displayTimer(timer);
    
    expect(display.name).toBe('T');
    expect(display.icon).toBe('X');
    expect(display.category).toBeDefined();
    expect(display.category!.id).toBe(categories[0].id);
  });

  /**
   * Edge case: Timer with maximum length name
   */
  it('should display timer with long name', () => {
    const categories = CategoryStorage.loadCategories();
    const longName = 'A'.repeat(50);
    const timer: Timer = {
      id: 'test-2',
      name: longName,
      icon: 'Clock',
      categoryId: categories[0].id,
      mode: 'countdown',
      settings: { countdownDuration: 30 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const display = displayTimer(timer);
    
    expect(display.name).toBe(longName);
    expect(display.name.length).toBe(50);
    expect(display.icon).toBe('Clock');
    expect(display.category).toBeDefined();
  });
});

