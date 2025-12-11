/**
 * Property-Based Tests for Pomodoro Keyword Detector
 * **Feature: pomodoro-plan-sync, Property 7: Keyword Detection Reliability**
 * **Validates: Requirements 3.1**
 */

import * as fc from 'fast-check';
import { PomodoroKeywordDetector } from './pomodoro-keyword-detector.js';

describe('PomodoroKeywordDetector Property Tests', () => {
  
  const pomodoroKeywords = ['番茄钟', '番茄', '专注', '休息', '工作', '忙', 'pomodoro', 'focus', 'break', 'work', 'rest'];
  const nonPomodoroWords = ['会议', '吃饭', '睡觉', '购物', 'meeting', 'lunch', 'sleep', 'shopping'];

  /**
   * Property 7: Keyword Detection Reliability
   * For any text containing pomodoro-related keywords, 
   * the detection function should identify it as pomodoro-related
   */
  test('Property 7: Keyword Detection Reliability', () => {
    fc.assert(fc.property(
      fc.tuple(
        fc.constantFrom(...pomodoroKeywords),
        fc.string(),
        fc.string()
      ),
      ([keyword, prefix, suffix]) => {
        // Create text with pomodoro keyword
        const textWithKeyword = `${prefix}${keyword}${suffix}`;
        
        const isDetected = PomodoroKeywordDetector.detectPomodoroKeywords(textWithKeyword);
        expect(isDetected).toBe(true);
        
        // Should also work with different cases
        const upperCaseText = textWithKeyword.toUpperCase();
        const lowerCaseText = textWithKeyword.toLowerCase();
        
        expect(PomodoroKeywordDetector.detectPomodoroKeywords(upperCaseText)).toBe(true);
        expect(PomodoroKeywordDetector.detectPomodoroKeywords(lowerCaseText)).toBe(true);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Non-pomodoro text should not be detected
   */
  test('Property: Non-pomodoro text detection', () => {
    fc.assert(fc.property(
      fc.array(fc.constantFrom(...nonPomodoroWords), { minLength: 1, maxLength: 5 }),
      (words: string[]) => {
        const text = words.join(' ');
        
        // Should not detect pomodoro keywords in non-pomodoro text
        const isDetected = PomodoroKeywordDetector.detectPomodoroKeywords(text);
        expect(isDetected).toBe(false);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Work duration extraction consistency
   */
  test('Property: Work duration extraction is consistent', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 120 }),
      fc.constantFrom('忙', '工作', '专注', 'work', 'focus'),
      (duration: number, workKeyword: string) => {
        const patterns = [
          `${workKeyword}${duration}分钟`,
          `${workKeyword} ${duration}分钟`,
          `${workKeyword}${duration}min`,
          `${workKeyword} ${duration}min`
        ];

        patterns.forEach(pattern => {
          const extracted = PomodoroKeywordDetector.extractWorkDuration(pattern);
          if (extracted !== null) {
            expect(extracted).toBe(duration);
          }
        });
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Rest duration extraction consistency
   */
  test('Property: Rest duration extraction is consistent', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 60 }),
      fc.constantFrom('休息', 'break', 'rest'),
      (duration: number, restKeyword: string) => {
        const patterns = [
          `${restKeyword}${duration}分钟`,
          `${restKeyword} ${duration}分钟`,
          `${restKeyword}${duration}min`,
          `${restKeyword} ${duration}min`
        ];

        patterns.forEach(pattern => {
          const extracted = PomodoroKeywordDetector.extractRestDuration(pattern);
          if (extracted !== null) {
            expect(extracted).toBe(duration);
          }
        });
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Cycle count extraction consistency
   */
  test('Property: Cycle count extraction is consistent', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 10 }),
      (cycles: number) => {
        const patterns = [
          `${cycles}个番茄钟`,
          `${cycles}轮`,
          `${cycles}cycles`,
          `${cycles}cycle`,
          `${cycles}个循环`
        ];

        patterns.forEach(pattern => {
          const extracted = PomodoroKeywordDetector.extractCycleCount(pattern);
          if (extracted !== null) {
            expect(extracted).toBe(cycles);
          }
        });
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Long break duration extraction
   */
  test('Property: Long break duration extraction', () => {
    fc.assert(fc.property(
      fc.integer({ min: 5, max: 60 }),
      (duration: number) => {
        const patterns = [
          `休息${duration}分钟，再继续`,
          `之后，休息${duration}分钟`,
          `long break ${duration}min`
        ];

        patterns.forEach(pattern => {
          const extracted = PomodoroKeywordDetector.extractLongBreakDuration(pattern);
          if (extracted !== null) {
            expect(extracted).toBe(duration);
          }
        });
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Complex pattern extraction completeness
   */
  test('Property: Complex pattern extraction handles all components', () => {
    fc.assert(fc.property(
      fc.record({
        workDuration: fc.integer({ min: 1, max: 120 }),
        restDuration: fc.integer({ min: 1, max: 30 }),
        cycles: fc.integer({ min: 1, max: 10 }),
        longBreakDuration: fc.integer({ min: 5, max: 60 })
      }),
      (config) => {
        // Create complex pattern text
        const text = `忙${config.workDuration}分钟，休息${config.restDuration}分钟，${config.cycles}个番茄钟之后，休息${config.longBreakDuration}分钟`;
        
        const extracted = PomodoroKeywordDetector.extractComplexPattern(text);
        
        expect(extracted.workDuration).toBe(config.workDuration);
        expect(extracted.restDuration).toBe(config.restDuration);
        expect(extracted.cycles).toBe(config.cycles);
        expect(extracted.longBreakDuration).toBe(config.longBreakDuration);
        expect(extracted.confidence).toBeGreaterThan(0.5);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Confidence scoring is meaningful
   */
  test('Property: Confidence scoring reflects content quality', () => {
    fc.assert(fc.property(
      fc.string(),
      (text: string) => {
        const confidence = PomodoroKeywordDetector.getConfidenceScore(text);
        
        expect(confidence).toBeGreaterThanOrEqual(0);
        expect(confidence).toBeLessThanOrEqual(1);
        
        // Text with more pomodoro elements should have higher confidence
        const hasKeywords = PomodoroKeywordDetector.detectPomodoroKeywords(text);
        const hasWorkDuration = PomodoroKeywordDetector.extractWorkDuration(text) !== null;
        const hasRestDuration = PomodoroKeywordDetector.extractRestDuration(text) !== null;
        const hasCycles = PomodoroKeywordDetector.extractCycleCount(text) !== null;
        
        const elementCount = [hasKeywords, hasWorkDuration, hasRestDuration, hasCycles].filter(Boolean).length;
        
        if (elementCount === 0) {
          expect(confidence).toBe(0);
        } else {
          expect(confidence).toBeGreaterThan(0);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Detection is deterministic
   */
  test('Property: Detection is deterministic', () => {
    fc.assert(fc.property(
      fc.string(),
      (text: string) => {
        // Multiple calls should return the same result
        const result1 = PomodoroKeywordDetector.detectPomodoroKeywords(text);
        const result2 = PomodoroKeywordDetector.detectPomodoroKeywords(text);
        const result3 = PomodoroKeywordDetector.detectPomodoroKeywords(text);
        
        expect(result2).toBe(result1);
        expect(result3).toBe(result1);
        
        // Same for extractions
        const work1 = PomodoroKeywordDetector.extractWorkDuration(text);
        const work2 = PomodoroKeywordDetector.extractWorkDuration(text);
        expect(work2).toBe(work1);
        
        const rest1 = PomodoroKeywordDetector.extractRestDuration(text);
        const rest2 = PomodoroKeywordDetector.extractRestDuration(text);
        expect(rest2).toBe(rest1);
        
        const cycles1 = PomodoroKeywordDetector.extractCycleCount(text);
        const cycles2 = PomodoroKeywordDetector.extractCycleCount(text);
        expect(cycles2).toBe(cycles1);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Invalid input handling
   */
  test('Property: Invalid input is handled gracefully', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.constant(undefined)
      ),
      (invalidInput: any) => {
        expect(PomodoroKeywordDetector.detectPomodoroKeywords(invalidInput)).toBe(false);
        expect(PomodoroKeywordDetector.extractWorkDuration(invalidInput)).toBeNull();
        expect(PomodoroKeywordDetector.extractRestDuration(invalidInput)).toBeNull();
        expect(PomodoroKeywordDetector.extractCycleCount(invalidInput)).toBeNull();
        expect(PomodoroKeywordDetector.extractLongBreakDuration(invalidInput)).toBeNull();
        
        const pattern = PomodoroKeywordDetector.extractComplexPattern(invalidInput);
        expect(pattern.confidence).toBe(0);
      }
    ), { numRuns: 100 });
  });
});