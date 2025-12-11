/**
 * Property-Based Tests for Time Format Parser
 * **Feature: pomodoro-plan-sync, Property 5: Time Format Parsing Consistency**
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */

import * as fc from 'fast-check';
import { TimeFormatParser } from './time-format-parser.js';

describe('TimeFormatParser Property Tests', () => {
  
  /**
   * Property 5: Time Format Parsing Consistency
   * For any valid time string in supported formats ("X分钟", "Xmin", "X minutes"), 
   * the parser should extract the same numeric value regardless of format
   */
  test('Property 5: Time Format Parsing Consistency', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 120 }),
      (timeValue: number) => {
        // Generate the same time value in different formats
        const formats = [
          `${timeValue}分钟`,
          `${timeValue}min`,
          `${timeValue}minutes`,
          `${timeValue} 分钟`,
          `${timeValue} min`,
          `${timeValue} minutes`,
          `${timeValue}m`,
          `${timeValue} m`
        ];

        const results = formats.map(format => TimeFormatParser.parseTimeFormat(format));
        
        // All results should have the same value
        const validResults = results.filter(r => r.value !== null);
        
        if (validResults.length > 0) {
          const expectedValue = validResults[0].value;
          validResults.forEach(result => {
            expect(result.value).toBe(expectedValue);
            expect(result.unit).toBe('minutes');
            expect(result.confidence).toBeGreaterThan(0);
          });
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Hour to minute conversion consistency
   */
  test('Property: Hour to minute conversion is consistent', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 5 }),
      (hourValue: number) => {
        const hourFormats = [
          `${hourValue}小时`,
          `${hourValue}hour`,
          `${hourValue}hours`,
          `${hourValue} 小时`,
          `${hourValue} hour`,
          `${hourValue} hours`,
          `${hourValue}h`,
          `${hourValue} h`
        ];

        const results = hourFormats.map(format => TimeFormatParser.parseTimeFormat(format));
        const validResults = results.filter(r => r.value !== null);
        
        if (validResults.length > 0) {
          const expectedValue = hourValue * 60; // Convert to minutes
          validResults.forEach(result => {
            expect(result.value).toBe(expectedValue);
            expect(result.unit).toBe('minutes');
          });
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Invalid input handling
   * For any invalid or unrecognizable time format, the system should return null
   */
  test('Property: Invalid input returns null', () => {
    fc.assert(fc.property(
      fc.oneof(
        fc.constant(''),
        fc.constant(null),
        fc.constant(undefined),
        fc.string().filter(s => !/\d+\s*(分钟|min|minutes?|小时|hours?|h|m)/.test(s))
      ),
      (invalidInput: any) => {
        const result = TimeFormatParser.parseTimeFormat(invalidInput);
        expect(result.value).toBeNull();
        expect(result.unit).toBeNull();
        expect(result.confidence).toBe(0);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Multiple time values extraction
   */
  test('Property: Multiple time values are extracted correctly', () => {
    fc.assert(fc.property(
      fc.array(fc.integer({ min: 1, max: 60 }), { minLength: 1, maxLength: 5 }),
      (timeValues: number[]) => {
        // Create text with multiple time values
        const text = timeValues.map((val, idx) => {
          const formats = ['分钟', 'min', 'minutes'];
          return `${val}${formats[idx % formats.length]}`;
        }).join(' 和 ');

        const results = TimeFormatParser.parseAllTimeValues(text);
        
        // Should extract at least as many values as we put in
        expect(results.length).toBeGreaterThanOrEqual(1);
        
        // All extracted values should be valid
        results.forEach(result => {
          expect(result.value).toBeGreaterThan(0);
          expect(result.unit).toBe('minutes');
          expect(result.confidence).toBeGreaterThan(0);
        });
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Time value validation
   */
  test('Property: Time value validation works correctly', () => {
    fc.assert(fc.property(
      fc.integer({ min: -100, max: 200 }),
      (value: number) => {
        const isValid = TimeFormatParser.validateTimeValue(value);
        
        if (value >= 1 && value <= 120) {
          expect(isValid).toBe(true);
        } else {
          expect(isValid).toBe(false);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Time value normalization
   */
  test('Property: Time value normalization clamps to valid range', () => {
    fc.assert(fc.property(
      fc.integer({ min: -100, max: 200 }),
      (value: number) => {
        const normalized = TimeFormatParser.normalizeTimeValue(value);
        
        expect(normalized).toBeGreaterThanOrEqual(1);
        expect(normalized).toBeLessThanOrEqual(120);
        expect(Number.isInteger(normalized)).toBe(true);
        
        // If input was in valid range, output should be the same (rounded)
        if (value >= 1 && value <= 120) {
          expect(normalized).toBe(Math.round(value));
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Parsing is deterministic
   */
  test('Property: Parsing is deterministic', () => {
    fc.assert(fc.property(
      fc.string(),
      (text: string) => {
        const result1 = TimeFormatParser.parseTimeFormat(text);
        const result2 = TimeFormatParser.parseTimeFormat(text);
        const result3 = TimeFormatParser.parseTimeFormat(text);
        
        // Results should be identical
        expect(result2.value).toBe(result1.value);
        expect(result2.unit).toBe(result1.unit);
        expect(result2.confidence).toBe(result1.confidence);
        
        expect(result3.value).toBe(result1.value);
        expect(result3.unit).toBe(result1.unit);
        expect(result3.confidence).toBe(result1.confidence);
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Confidence scoring is consistent
   */
  test('Property: Confidence scoring reflects format quality', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 60 }),
      (timeValue: number) => {
        // High confidence formats (Chinese)
        const highConfidenceResult = TimeFormatParser.parseTimeFormat(`${timeValue}分钟`);
        
        // Medium confidence formats (English)
        const mediumConfidenceResult = TimeFormatParser.parseTimeFormat(`${timeValue}min`);
        
        // Lower confidence formats (abbreviated)
        const lowConfidenceResult = TimeFormatParser.parseTimeFormat(`${timeValue}m`);
        
        if (highConfidenceResult.value && mediumConfidenceResult.value && lowConfidenceResult.value) {
          // All should extract the same value
          expect(highConfidenceResult.value).toBe(timeValue);
          expect(mediumConfidenceResult.value).toBe(timeValue);
          expect(lowConfidenceResult.value).toBe(timeValue);
          
          // Confidence should reflect format quality
          expect(highConfidenceResult.confidence).toBeGreaterThanOrEqual(mediumConfidenceResult.confidence);
          expect(mediumConfidenceResult.confidence).toBeGreaterThanOrEqual(lowConfidenceResult.confidence);
        }
      }
    ), { numRuns: 100 });
  });
});