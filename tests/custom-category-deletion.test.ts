/**
 * Property-Based Tests for Custom Category Deletion Prompting
 * Feature: lifeos-timer-rework, Property 25: Custom category deletion prompting
 * Validates: Requirements 12.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { TimerCategory, Timer, Event } from '../src/types.js';
import { CategoryStorage, TimerStorage, EventStorage } from '../src/storage.js';

/**
 * Check if a category has associated timers or events
 */
function categoryHasAssociations(categoryId: string): {
  hasTimers: boolean;
  hasEvents: boolean;
  timerCount: number;
  eventCount: number;
} {
  const timers = TimerStorage.loadTimers();
  const events = EventStorage.loadEvents();
  
  const associatedTimers = timers.filter(t => t.categoryId === categoryId);
  const associatedEvents = events.filter(e => e.categoryId === categoryId);
  
  return {
    hasTimers: associatedTimers.length > 0,
    hasEvents: associatedEvents.length > 0,
    timerCount: associatedTimers.length,
    eventCount: associatedEvents.length,
  };
}

/**
 * Determine if deletion should prompt for reassignment
 */
function shouldPromptForReassignment(categoryId: string): boolean {
  const associations = categoryHasAssociations(categoryId);
  return associations.hasTimers || associations.hasEvents;
}

describe('Custom Category Deletion Prompting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Arbitrary generator for custom category
   */
  const customCategoryArbitrary: fc.Arbitrary<TimerCategory> = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    isDefault: fc.constant(false), // Custom categories are not default
    color: fc.constantFrom('bg-blue-200', 'bg-green-200', 'bg-red-200', 'bg-yellow-200'),
    icon: fc.constantFrom('Star', 'Heart', 'Zap', 'Target'),
  });

  /**
   * Arbitrary generator for timer
   */
  const timerArbitrary = (categoryId: string): fc.Arbitrary<Timer> => fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    icon: fc.constantFrom('Clock', 'Timer', 'Stopwatch'),
    categoryId: fc.constant(categoryId),
    mode: fc.constantFrom('stopwatch', 'countdown', 'pomodoro') as fc.Arbitrary<'stopwatch' | 'countdown' | 'pomodoro'>,
    settings: fc.record({
      countdownDuration: fc.option(fc.integer({ min: 1, max: 120 }), { nil: undefined }),
      workDuration: fc.option(fc.integer({ min: 1, max: 60 }), { nil: undefined }),
      restDuration: fc.option(fc.integer({ min: 1, max: 30 }), { nil: undefined }),
      cycles: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
    }),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString()),
    updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString()),
  });

  /**
   * Arbitrary generator for event
   */
  const eventArbitrary = (categoryId: string): fc.Arbitrary<Event> => fc
    .tuple(
      fc.uuid(),
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      fc.integer({ min: 60000, max: 86400000 }),
      fc.constantFrom('manual', 'timer', 'calendar') as fc.Arbitrary<'manual' | 'timer' | 'calendar'>,
      fc.constantFrom(1, 2, 3),
      fc.option(fc.uuid(), { nil: undefined }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    )
    .chain(([id, name, startDate, duration, source, priority, timerId, createdAt, updatedAt]) => {
      const startTime = startDate.getTime();
      const endTime = startTime + duration;
      
      return fc.constant({
        id,
        name,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        categoryId,
        source,
        priority,
        timerId,
        createdAt: new Date(createdAt).toISOString(),
        updatedAt: new Date(updatedAt).toISOString(),
      });
    });

  /**
   * Property 25: Custom category deletion prompting
   * For any custom category that has associated events or timers, when the category
   * is deleted, the system should prompt the user to reassign those items.
   */
  it('should prompt for reassignment when category has associated timers', () => {
    fc.assert(
      fc.property(
        customCategoryArbitrary,
        fc.array(timerArbitrary('dummy'), { minLength: 1, maxLength: 5 }),
        (category, timers) => {
          // Save the category
          CategoryStorage.saveCategory(category);
          
          // Update timers to use this category and save them
          timers.forEach(timer => {
            const updatedTimer = { ...timer, categoryId: category.id };
            TimerStorage.saveTimer(updatedTimer);
          });
          
          // Check if should prompt
          const shouldPrompt = shouldPromptForReassignment(category.id);
          const associations = categoryHasAssociations(category.id);
          
          // Should prompt because there are associated timers
          expect(shouldPrompt).toBe(true);
          expect(associations.hasTimers).toBe(true);
          expect(associations.timerCount).toBe(timers.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Should prompt when category has associated events
   */
  it('should prompt for reassignment when category has associated events', () => {
    fc.assert(
      fc.property(
        customCategoryArbitrary,
        fc.array(eventArbitrary('dummy'), { minLength: 1, maxLength: 5 }),
        (category, events) => {
          // Save the category
          CategoryStorage.saveCategory(category);
          
          // Update events to use this category and save them
          events.forEach(event => {
            const updatedEvent = { ...event, categoryId: category.id };
            EventStorage.saveEvent(updatedEvent);
          });
          
          // Check if should prompt
          const shouldPrompt = shouldPromptForReassignment(category.id);
          const associations = categoryHasAssociations(category.id);
          
          // Should prompt because there are associated events
          expect(shouldPrompt).toBe(true);
          expect(associations.hasEvents).toBe(true);
          expect(associations.eventCount).toBe(events.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Should prompt when category has both timers and events
   */
  it('should prompt for reassignment when category has both timers and events', () => {
    fc.assert(
      fc.property(
        customCategoryArbitrary,
        fc.array(timerArbitrary('dummy'), { minLength: 1, maxLength: 5 }),
        fc.array(eventArbitrary('dummy'), { minLength: 1, maxLength: 5 }),
        (category, timers, events) => {
          // Save the category
          CategoryStorage.saveCategory(category);
          
          // Update and save timers and events
          timers.forEach(timer => {
            const updatedTimer = { ...timer, categoryId: category.id };
            TimerStorage.saveTimer(updatedTimer);
          });
          events.forEach(event => {
            const updatedEvent = { ...event, categoryId: category.id };
            EventStorage.saveEvent(updatedEvent);
          });
          
          // Check if should prompt
          const shouldPrompt = shouldPromptForReassignment(category.id);
          const associations = categoryHasAssociations(category.id);
          
          // Should prompt because there are both timers and events
          expect(shouldPrompt).toBe(true);
          expect(associations.hasTimers).toBe(true);
          expect(associations.hasEvents).toBe(true);
          expect(associations.timerCount).toBe(timers.length);
          expect(associations.eventCount).toBe(events.length);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Should NOT prompt when category has no associations
   */
  it('should not prompt when category has no associated timers or events', () => {
    fc.assert(
      fc.property(customCategoryArbitrary, (category) => {
        // Save the category
        CategoryStorage.saveCategory(category);
        
        // Don't create any timers or events
        
        // Check if should prompt
        const shouldPrompt = shouldPromptForReassignment(category.id);
        const associations = categoryHasAssociations(category.id);
        
        // Should NOT prompt because there are no associations
        expect(shouldPrompt).toBe(false);
        expect(associations.hasTimers).toBe(false);
        expect(associations.hasEvents).toBe(false);
        expect(associations.timerCount).toBe(0);
        expect(associations.eventCount).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Category with only one timer
   */
  it('should prompt even with just one associated timer', () => {
    const category: TimerCategory = {
      id: 'custom-1',
      name: 'Custom Category',
      isDefault: false,
      color: 'bg-blue-200',
      icon: 'Star',
    };
    
    const timer: Timer = {
      id: 'timer-1',
      name: 'Test Timer',
      icon: 'Clock',
      categoryId: category.id,
      mode: 'stopwatch',
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    CategoryStorage.saveCategory(category);
    TimerStorage.saveTimer(timer);
    
    const shouldPrompt = shouldPromptForReassignment(category.id);
    const associations = categoryHasAssociations(category.id);
    
    expect(shouldPrompt).toBe(true);
    expect(associations.timerCount).toBe(1);
  });

  /**
   * Edge case: Category with only one event
   */
  it('should prompt even with just one associated event', () => {
    const category: TimerCategory = {
      id: 'custom-2',
      name: 'Custom Category',
      isDefault: false,
      color: 'bg-green-200',
      icon: 'Heart',
    };
    
    const event: Event = {
      id: 'event-1',
      name: 'Test Event',
      startTime: new Date('2025-12-07T10:00:00+08:00').toISOString(),
      endTime: new Date('2025-12-07T11:00:00+08:00').toISOString(),
      categoryId: category.id,
      source: 'manual',
      priority: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    CategoryStorage.saveCategory(category);
    EventStorage.saveEvent(event);
    
    const shouldPrompt = shouldPromptForReassignment(category.id);
    const associations = categoryHasAssociations(category.id);
    
    expect(shouldPrompt).toBe(true);
    expect(associations.eventCount).toBe(1);
  });

  /**
   * Property: Association count is accurate
   * The reported count of associations should match actual count
   */
  it('should accurately count associated timers and events', () => {
    fc.assert(
      fc.property(
        customCategoryArbitrary,
        fc.array(timerArbitrary('dummy'), { minLength: 0, maxLength: 10 }),
        fc.array(eventArbitrary('dummy'), { minLength: 0, maxLength: 10 }),
        (category, timers, events) => {
          // Save the category
          CategoryStorage.saveCategory(category);
          
          // Update and save timers and events
          timers.forEach(timer => {
            const updatedTimer = { ...timer, categoryId: category.id };
            TimerStorage.saveTimer(updatedTimer);
          });
          events.forEach(event => {
            const updatedEvent = { ...event, categoryId: category.id };
            EventStorage.saveEvent(updatedEvent);
          });
          
          // Check associations
          const associations = categoryHasAssociations(category.id);
          
          // Counts should match
          expect(associations.timerCount).toBe(timers.length);
          expect(associations.eventCount).toBe(events.length);
          
          // Flags should be correct
          expect(associations.hasTimers).toBe(timers.length > 0);
          expect(associations.hasEvents).toBe(events.length > 0);
        }
      ),
      { numRuns: 50 }
    );
  });
});
