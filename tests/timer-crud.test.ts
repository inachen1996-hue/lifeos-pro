/**
 * Unit Tests for Timer CRUD Operations
 * Tests Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Timer } from '../src/types.js';
import { TimerManager } from '../src/timer-manager.js';
import { TimerStorage, EventStorage, CategoryStorage } from '../src/storage.js';

describe('Timer CRUD Operations', () => {
  beforeEach(() => {
    // Clear storage before each test
    TimerStorage.saveTimers([]);
    EventStorage.saveEvents([]);
  });

  describe('Create Timer (Requirement 2.1)', () => {
    it('should create a stopwatch timer', () => {
      const timer = TimerManager.createTimer(
        'Morning Workout',
        'Dumbbell',
        'health',
        'stopwatch',
        {}
      );

      expect(timer.id).toBeDefined();
      expect(timer.name).toBe('Morning Workout');
      expect(timer.icon).toBe('Dumbbell');
      expect(timer.categoryId).toBe('health');
      expect(timer.mode).toBe('stopwatch');
      expect(timer.createdAt).toBeDefined();
      expect(timer.updatedAt).toBeDefined();
    });

    it('should create a countdown timer with duration', () => {
      const timer = TimerManager.createTimer(
        'Focus Session',
        'Clock',
        'work',
        'countdown',
        { countdownDuration: 25 }
      );

      expect(timer.mode).toBe('countdown');
      expect(timer.settings.countdownDuration).toBe(25);
    });

    it('should create a pomodoro timer with all settings', () => {
      const timer = TimerManager.createTimer(
        'Study Pomodoro',
        'Tomato',
        'study',
        'pomodoro',
        { workDuration: 25, restDuration: 5, cycles: 4 }
      );

      expect(timer.mode).toBe('pomodoro');
      expect(timer.settings.workDuration).toBe(25);
      expect(timer.settings.restDuration).toBe(5);
      expect(timer.settings.cycles).toBe(4);
    });

    it('should throw error for invalid timer (missing name)', () => {
      expect(() => {
        TimerManager.createTimer('', 'Clock', 'work', 'stopwatch', {});
      }).toThrow('Invalid timer configuration');
    });

    it('should throw error for countdown without duration', () => {
      expect(() => {
        TimerManager.createTimer('Test', 'Clock', 'work', 'countdown', {});
      }).toThrow('Countdown duration must be greater than 0');
    });

    it('should throw error for pomodoro without required settings', () => {
      expect(() => {
        TimerManager.createTimer('Test', 'Clock', 'work', 'pomodoro', {});
      }).toThrow('Work duration must be greater than 0');
    });
  });

  describe('Update Timer (Requirement 2.2)', () => {
    it('should update timer name', () => {
      const timer = TimerManager.createTimer(
        'Old Name',
        'Clock',
        'work',
        'stopwatch',
        {}
      );

      const updated = TimerManager.updateTimer(timer.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(timer.id);
      expect(updated.createdAt).toBe(timer.createdAt);
      // updatedAt should be a valid ISO string
      expect(updated.updatedAt).toBeDefined();
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(timer.createdAt).getTime());
    });

    it('should update timer category', () => {
      const timer = TimerManager.createTimer(
        'Test Timer',
        'Clock',
        'work',
        'stopwatch',
        {}
      );

      const updated = TimerManager.updateTimer(timer.id, { categoryId: 'study' });

      expect(updated.categoryId).toBe('study');
    });

    it('should sync existing event records when requested', () => {
      // Create a timer
      const timer = TimerManager.createTimer(
        'Original Name',
        'Clock',
        'work',
        'stopwatch',
        {}
      );

      // Create an event from this timer
      const event = {
        id: 'event-1',
        name: 'Original Name',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        categoryId: 'work',
        source: 'timer' as const,
        priority: 2,
        timerId: timer.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      EventStorage.saveEvent(event);

      // Update timer with sync
      TimerManager.updateTimer(
        timer.id,
        { name: 'Updated Name', categoryId: 'study' },
        true
      );

      // Check that event was updated
      const events = EventStorage.loadEvents();
      const updatedEvent = events.find(e => e.id === 'event-1');
      expect(updatedEvent?.name).toBe('Updated Name');
      expect(updatedEvent?.categoryId).toBe('study');
    });

    it('should not sync existing records when not requested', () => {
      const timer = TimerManager.createTimer(
        'Original Name',
        'Clock',
        'work',
        'stopwatch',
        {}
      );

      const event = {
        id: 'event-1',
        name: 'Original Name',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        categoryId: 'work',
        source: 'timer' as const,
        priority: 2,
        timerId: timer.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      EventStorage.saveEvent(event);

      // Update timer without sync
      TimerManager.updateTimer(timer.id, { name: 'Updated Name' }, false);

      // Check that event was NOT updated
      const events = EventStorage.loadEvents();
      const unchangedEvent = events.find(e => e.id === 'event-1');
      expect(unchangedEvent?.name).toBe('Original Name');
    });

    it('should throw error when updating non-existent timer', () => {
      expect(() => {
        TimerManager.updateTimer('non-existent-id', { name: 'New Name' });
      }).toThrow('Timer not found');
    });
  });

  describe('Delete Timer (Requirement 2.3)', () => {
    it('should delete timer without deleting records', () => {
      const timer = TimerManager.createTimer(
        'Test Timer',
        'Clock',
        'work',
        'stopwatch',
        {}
      );

      const event = {
        id: 'event-1',
        name: 'Test Event',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        categoryId: 'work',
        source: 'timer' as const,
        priority: 2,
        timerId: timer.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      EventStorage.saveEvent(event);

      // Delete timer without deleting records
      TimerManager.deleteTimer(timer.id, false);

      // Timer should be deleted
      const timers = TimerStorage.loadTimers();
      expect(timers.find(t => t.id === timer.id)).toBeUndefined();

      // Event should still exist
      const events = EventStorage.loadEvents();
      expect(events.find(e => e.id === 'event-1')).toBeDefined();
    });

    it('should delete timer and all associated records', () => {
      const timer = TimerManager.createTimer(
        'Test Timer',
        'Clock',
        'work',
        'stopwatch',
        {}
      );

      const event = {
        id: 'event-1',
        name: 'Test Event',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        categoryId: 'work',
        source: 'timer' as const,
        priority: 2,
        timerId: timer.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      EventStorage.saveEvent(event);

      // Delete timer with records
      TimerManager.deleteTimer(timer.id, true);

      // Timer should be deleted
      const timers = TimerStorage.loadTimers();
      expect(timers.find(t => t.id === timer.id)).toBeUndefined();

      // Event should also be deleted
      const events = EventStorage.loadEvents();
      expect(events.find(e => e.id === 'event-1')).toBeUndefined();
    });

    it('should throw error when deleting non-existent timer', () => {
      expect(() => {
        TimerManager.deleteTimer('non-existent-id');
      }).toThrow('Timer not found');
    });
  });

  describe('Get Timers (Requirement 2.4, 2.5)', () => {
    it('should get all timers', () => {
      TimerManager.createTimer('Timer 1', 'Clock', 'work', 'stopwatch', {});
      TimerManager.createTimer('Timer 2', 'Clock', 'study', 'stopwatch', {});

      const timers = TimerManager.getAllTimers();
      expect(timers.length).toBe(2);
    });

    it('should get timer by id', () => {
      const timer = TimerManager.createTimer(
        'Test Timer',
        'Clock',
        'work',
        'stopwatch',
        {}
      );

      const found = TimerManager.getTimer(timer.id);
      expect(found).toBeDefined();
      expect(found?.name).toBe('Test Timer');
    });

    it('should get timers by category', () => {
      TimerManager.createTimer('Work Timer 1', 'Clock', 'work', 'stopwatch', {});
      TimerManager.createTimer('Work Timer 2', 'Clock', 'work', 'stopwatch', {});
      TimerManager.createTimer('Study Timer', 'Clock', 'study', 'stopwatch', {});

      const workTimers = TimerManager.getTimersByCategory('work');
      expect(workTimers.length).toBe(2);
      expect(workTimers.every(t => t.categoryId === 'work')).toBe(true);
    });

    it('should get timers grouped by category', () => {
      TimerManager.createTimer('Work Timer', 'Clock', 'work', 'stopwatch', {});
      TimerManager.createTimer('Study Timer', 'Clock', 'study', 'stopwatch', {});

      const grouped = TimerManager.getTimersGroupedByCategory();
      
      // Should have entries for all categories
      expect(grouped.size).toBeGreaterThan(0);

      // Find work category and its timers
      let workTimers: Timer[] | undefined;
      for (const [category, timers] of grouped.entries()) {
        if (category.id === 'work') {
          workTimers = timers;
          break;
        }
      }
      
      expect(workTimers).toBeDefined();
      expect(workTimers!.length).toBe(1);
      expect(workTimers![0].name).toBe('Work Timer');
    });
  });

  describe('Display Timers (Requirement 2.5)', () => {
    it('should display timer with name, icon, and category', () => {
      const timer = TimerManager.createTimer(
        'Morning Workout',
        'Dumbbell',
        'health',
        'stopwatch',
        {}
      );

      // Verify all display fields are present
      expect(timer.name).toBe('Morning Workout');
      expect(timer.icon).toBe('Dumbbell');
      expect(timer.categoryId).toBe('health');

      // Verify category exists
      const categories = CategoryStorage.loadCategories();
      const category = categories.find(c => c.id === timer.categoryId);
      expect(category).toBeDefined();
      expect(category?.name).toBe('健康');
    });
  });
});

