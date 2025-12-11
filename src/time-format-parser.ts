/**
 * Time Format Parser
 * Parses various time formats from plan item text
 * Implements Requirements 2.1, 2.2, 2.3, 2.4
 */

import { TimeParseResult } from './pomodoro-plan-sync-types.js';

export class TimeFormatParser {
  private static readonly TIME_PATTERNS = [
    // Chinese formats
    { pattern: /(\d+)\s*分钟/g, unit: 'minutes' as const, confidence: 1.0 },
    { pattern: /(\d+)\s*小时/g, unit: 'hours' as const, confidence: 1.0 },
    
    // English formats
    { pattern: /(\d+)\s*min(?:ute)?s?/gi, unit: 'minutes' as const, confidence: 0.9 },
    { pattern: /(\d+)\s*hour?s?/gi, unit: 'hours' as const, confidence: 0.9 },
    
    // Abbreviated formats
    { pattern: /(\d+)\s*m(?!\w)/gi, unit: 'minutes' as const, confidence: 0.7 },
    { pattern: /(\d+)\s*h(?!\w)/gi, unit: 'hours' as const, confidence: 0.7 },
  ];

  /**
   * Parse time format from text string
   * Requirement 2.1: Parse "X分钟" format
   * Requirement 2.2: Parse "Xmin" format  
   * Requirement 2.3: Parse "X minutes" format
   * Requirement 2.4: Handle invalid formats gracefully
   */
  static parseTimeFormat(text: string): TimeParseResult {
    if (!text || typeof text !== 'string') {
      return { value: null, unit: null, confidence: 0 };
    }

    const results: TimeParseResult[] = [];

    for (const { pattern, unit, confidence } of this.TIME_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const value = parseInt(match[1], 10);
        if (!isNaN(value) && value > 0) {
          // Convert hours to minutes for consistency
          const normalizedValue = unit === 'hours' ? value * 60 : value;
          results.push({
            value: normalizedValue,
            unit: 'minutes',
            confidence: confidence
          });
        }
      }
    }

    // Return the result with highest confidence, or null if no matches
    if (results.length === 0) {
      return { value: null, unit: null, confidence: 0 };
    }

    // Sort by confidence (descending) and return the best match
    results.sort((a, b) => b.confidence - a.confidence);
    return results[0];
  }

  /**
   * Parse all time values from text
   * Requirement 2.5: Handle multiple time values
   */
  static parseAllTimeValues(text: string): TimeParseResult[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const results: TimeParseResult[] = [];
    const processedPositions = new Set<number>();

    for (const { pattern, unit, confidence } of this.TIME_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      
      for (const match of matches) {
        const startPos = match.index || 0;
        
        // Skip if we've already processed this position with a higher confidence pattern
        if (processedPositions.has(startPos)) {
          continue;
        }

        const value = parseInt(match[1], 10);
        if (!isNaN(value) && value > 0) {
          // Convert hours to minutes for consistency
          const normalizedValue = unit === 'hours' ? value * 60 : value;
          results.push({
            value: normalizedValue,
            unit: 'minutes',
            confidence: confidence
          });
          
          // Mark this position as processed
          processedPositions.add(startPos);
        }
      }
    }

    // Sort by confidence (descending)
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Validate if a time value is within acceptable range
   * Requirement 5.5: Validate extracted values are within acceptable ranges
   */
  static validateTimeValue(value: number): boolean {
    return value >= 1 && value <= 120; // 1 minute to 2 hours
  }

  /**
   * Normalize time value to acceptable range
   */
  static normalizeTimeValue(value: number): number {
    if (value < 1) return 1;
    if (value > 120) return 120;
    return Math.round(value);
  }
}