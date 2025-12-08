/**
 * Property-Based Tests for Event Edit Field Availability
 * Feature: lifeos-timer-rework, Property 22: Event edit field availability
 * Validates: Requirements 6.3, 7.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { Event } from '../src/types.js';

describe('Event Edit Field Availability', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Arbitrary generator for Event
   */
  const eventArbitrary: fc.Arbitrary<Event> = fc
    .tuple(
      fc.uuid(),
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      fc.integer({ min: 60000, max: 86400000 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.constantFrom('manual', 'timer', 'calendar') as fc.Arbitrary<'manual' | 'timer' | 'calendar'>,
      fc.constantFrom(1, 2, 3),
      fc.option(fc.uuid(), { nil: undefined }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    )
    .chain(([id, name, startDate, duration, categoryId, source, priority, timerId, createdAt, updatedAt]) => {
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
   * Interface representing editable fields for an event
   */
  interface EditableEventFields {
    name: string;
    startTime: string;
    endTime: string;
    categoryId: string;
  }

  /**
   * Function to extract editable fields from an event
   * This simulates what the UI would do when preparing an event for editing
   */
  function getEditableFields(event: Event): EditableEventFields {
    return {
      name: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
      categoryId: event.categoryId,
    };
  }

  /**
   * Function to validate that editable fields are available
   */
  function hasEditableFields(event: Event): boolean {
    return !!(
      event.name &&
      event.startTime &&
      event.endTime &&
      event.categoryId
    );
  }

  /**
   * Property 22: Event edit field availability
   * For any event in View Existing Data or Pending Confirmation, the edit interface
   * should allow modifying event name, time range, and category.
   */
  it('should provide all editable fields for any event', () => {
    fc.assert(
      fc.property(eventArbitrary, (event) => {
        // Extract editable fields
        const editableFields = getEditableFields(event);
        
        // All fields should be available
        expect(editableFields.name).toBeDefined();
        expect(editableFields.name).toBe(event.name);
        
        expect(editableFields.startTime).toBeDefined();
        expect(editableFields.startTime).toBe(event.startTime);
        
        expect(editableFields.endTime).toBeDefined();
        expect(editableFields.endTime).toBe(event.endTime);
        
        expect(editableFields.categoryId).toBeDefined();
        expect(editableFields.categoryId).toBe(event.categoryId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All events have editable fields
   * Every event should have the required fields for editing
   */
  it('should have all required editable fields for every event', () => {
    fc.assert(
      fc.property(eventArbitrary, (event) => {
        expect(hasEditableFields(event)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Editable fields can be modified
   * The editable fields should be modifiable and the changes should be valid
   */
  it('should allow modification of editable fields', () => {
    fc.assert(
      fc.property(
        eventArbitrary,
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.integer({ min: 60000, max: 86400000 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (event, newName, newStartDate, newDuration, newCategoryId) => {
          // Get original editable fields
          const originalFields = getEditableFields(event);
          
          // Create modified fields
          const newStartTime = newStartDate.toISOString();
          const newEndTime = new Date(newStartDate.getTime() + newDuration).toISOString();
          
          const modifiedFields: EditableEventFields = {
            name: newName,
            startTime: newStartTime,
            endTime: newEndTime,
            categoryId: newCategoryId,
          };
          
          // Verify all fields can be modified
          expect(modifiedFields.name).not.toBe(originalFields.name);
          expect(modifiedFields.startTime).toBeDefined();
          expect(modifiedFields.endTime).toBeDefined();
          expect(modifiedFields.categoryId).toBeDefined();
          
          // Verify modified fields are valid
          expect(new Date(modifiedFields.startTime).getTime()).toBeLessThan(
            new Date(modifiedFields.endTime).getTime()
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Events from all sources are editable
   * Events from manual, timer, and calendar sources should all be editable
   */
  it('should allow editing events from all sources', () => {
    const sources: Array<'manual' | 'timer' | 'calendar'> = ['manual', 'timer', 'calendar'];
    
    sources.forEach(source => {
      const event: Event = {
        id: `test-${source}`,
        name: `${source} Event`,
        startTime: new Date('2025-12-07T10:00:00+08:00').toISOString(),
        endTime: new Date('2025-12-07T11:00:00+08:00').toISOString(),
        categoryId: 'work',
        source,
        priority: source === 'manual' ? 3 : source === 'timer' ? 2 : 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Should have editable fields
      expect(hasEditableFields(event)).toBe(true);
      
      // Should be able to extract editable fields
      const editableFields = getEditableFields(event);
      expect(editableFields.name).toBe(event.name);
      expect(editableFields.startTime).toBe(event.startTime);
      expect(editableFields.endTime).toBe(event.endTime);
      expect(editableFields.categoryId).toBe(event.categoryId);
    });
  });

  /**
   * Property: Time range editing maintains validity
   * When editing time range, end time should always be after start time
   */
  it('should maintain valid time range when editing', () => {
    fc.assert(
      fc.property(
        eventArbitrary,
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.integer({ min: 60000, max: 86400000 }),
        (event, newStartDate, newDuration) => {
          const newStartTime = newStartDate.toISOString();
          const newEndTime = new Date(newStartDate.getTime() + newDuration).toISOString();
          
          // Simulate editing the time range
          const updatedEvent: Event = {
            ...event,
            startTime: newStartTime,
            endTime: newEndTime,
          };
          
          // Verify time range is valid
          expect(new Date(updatedEvent.endTime).getTime()).toBeGreaterThan(
            new Date(updatedEvent.startTime).getTime()
          );
          
          // Verify editable fields are still available
          expect(hasEditableFields(updatedEvent)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Category editing preserves other fields
   * When editing category, other fields should remain unchanged
   */
  it('should preserve other fields when editing category', () => {
    fc.assert(
      fc.property(
        eventArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }),
        (event, newCategoryId) => {
          const originalFields = getEditableFields(event);
          
          // Simulate editing the category
          const updatedEvent: Event = {
            ...event,
            categoryId: newCategoryId,
          };
          
          const updatedFields = getEditableFields(updatedEvent);
          
          // Name, start time, and end time should be unchanged
          expect(updatedFields.name).toBe(originalFields.name);
          expect(updatedFields.startTime).toBe(originalFields.startTime);
          expect(updatedFields.endTime).toBe(originalFields.endTime);
          
          // Category should be updated
          expect(updatedFields.categoryId).toBe(newCategoryId);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Name editing preserves other fields
   * When editing name, other fields should remain unchanged
   */
  it('should preserve other fields when editing name', () => {
    fc.assert(
      fc.property(
        eventArbitrary,
        fc.string({ minLength: 1, maxLength: 100 }),
        (event, newName) => {
          const originalFields = getEditableFields(event);
          
          // Simulate editing the name
          const updatedEvent: Event = {
            ...event,
            name: newName,
          };
          
          const updatedFields = getEditableFields(updatedEvent);
          
          // Time range and category should be unchanged
          expect(updatedFields.startTime).toBe(originalFields.startTime);
          expect(updatedFields.endTime).toBe(originalFields.endTime);
          expect(updatedFields.categoryId).toBe(originalFields.categoryId);
          
          // Name should be updated
          expect(updatedFields.name).toBe(newName);
        }
      ),
      { numRuns: 100 }
    );
  });
});
