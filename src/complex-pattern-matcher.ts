/**
 * Complex Pattern Matcher
 * Handles advanced pattern matching for complex pomodoro configurations
 * Implements Requirements 3.2, 3.4, 5.1, 5.2, 5.3, 5.4
 */

import { ExtractedPomodoroConfig } from './pomodoro-plan-sync-types.js';
import { TimeFormatParser } from './time-format-parser.js';

export interface PatternMatch {
  workDuration?: number;
  restDuration?: number;
  cycles?: number;
  longBreakDuration?: number;
  confidence: number;
  matchedPattern: string;
}

export class ComplexPatternMatcher {
  // Complex patterns for comprehensive pomodoro configurations
  private static readonly COMPLEX_PATTERNS = [
    // Chinese patterns
    {
      // "忙20分钟，休息5分钟，3个番茄钟之后，休息10分钟"
      pattern: /忙\s*(\d+)\s*分钟[，,]\s*休息\s*(\d+)\s*分钟[，,]\s*(\d+)\s*个\s*番茄钟\s*之后[，,]\s*休息\s*(\d+)\s*分钟/g,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        cycles: parseInt(match[3], 10),
        longBreakDuration: parseInt(match[4], 10),
        confidence: 0.95,
        matchedPattern: 'complex_chinese_full'
      })
    },
    {
      // "工作25分钟休息5分钟，重复4次"
      pattern: /工作\s*(\d+)\s*分钟\s*休息\s*(\d+)\s*分钟[，,]\s*重复\s*(\d+)\s*次/g,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        cycles: parseInt(match[3], 10),
        confidence: 0.9,
        matchedPattern: 'work_rest_repeat_chinese'
      })
    },
    {
      // "专注30分钟，然后休息10分钟，循环3轮"
      pattern: /专注\s*(\d+)\s*分钟[，,]\s*然后\s*休息\s*(\d+)\s*分钟[，,]\s*循环\s*(\d+)\s*轮/g,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        cycles: parseInt(match[3], 10),
        confidence: 0.9,
        matchedPattern: 'focus_rest_cycle_chinese'
      })
    },
    
    // English patterns
    {
      // "work 25min, break 5min, 4 cycles, long break 15min"
      pattern: /work\s*(\d+)\s*min[，,]\s*break\s*(\d+)\s*min[，,]\s*(\d+)\s*cycles?[，,]\s*long\s*break\s*(\d+)\s*min/gi,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        cycles: parseInt(match[3], 10),
        longBreakDuration: parseInt(match[4], 10),
        confidence: 0.9,
        matchedPattern: 'english_full'
      })
    },
    {
      // "25min focus, 5min break, repeat 4 times"
      pattern: /(\d+)\s*min\s*focus[，,]\s*(\d+)\s*min\s*break[，,]\s*repeat\s*(\d+)\s*times?/gi,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        cycles: parseInt(match[3], 10),
        confidence: 0.85,
        matchedPattern: 'english_focus_break_repeat'
      })
    },
    
    // Mixed patterns
    {
      // "pomodoro: 25分钟工作 + 5分钟休息 × 4轮"
      pattern: /pomodoro\s*[:：]\s*(\d+)\s*分钟\s*工作\s*[+]\s*(\d+)\s*分钟\s*休息\s*[×]\s*(\d+)\s*轮/gi,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        cycles: parseInt(match[3], 10),
        confidence: 0.85,
        matchedPattern: 'mixed_pomodoro_formula'
      })
    }
  ];

  // Partial patterns for incomplete configurations
  private static readonly PARTIAL_PATTERNS = [
    {
      // "忙20分钟，休息5分钟"
      pattern: /忙\s*(\d+)\s*分钟[，,]\s*休息\s*(\d+)\s*分钟/g,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        confidence: 0.7,
        matchedPattern: 'partial_work_rest_chinese'
      })
    },
    {
      // "工作25分钟，休息5分钟"
      pattern: /工作\s*(\d+)\s*分钟[，,]\s*休息\s*(\d+)\s*分钟/g,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        confidence: 0.7,
        matchedPattern: 'partial_work_rest_formal_chinese'
      })
    },
    {
      // "work 25min, break 5min"
      pattern: /work\s*(\d+)\s*min[，,]\s*break\s*(\d+)\s*min/gi,
      extract: (match: RegExpMatchArray) => ({
        workDuration: parseInt(match[1], 10),
        restDuration: parseInt(match[2], 10),
        confidence: 0.65,
        matchedPattern: 'partial_work_break_english'
      })
    },
    {
      // "3个番茄钟"
      pattern: /(\d+)\s*个\s*番茄钟/g,
      extract: (match: RegExpMatchArray) => ({
        cycles: parseInt(match[1], 10),
        confidence: 0.6,
        matchedPattern: 'cycles_only_chinese'
      })
    },
    {
      // "4 pomodoro cycles"
      pattern: /(\d+)\s*pomodoro\s*cycles?/gi,
      extract: (match: RegExpMatchArray) => ({
        cycles: parseInt(match[1], 10),
        confidence: 0.6,
        matchedPattern: 'cycles_only_english'
      })
    }
  ];

  /**
   * Extract complex pomodoro pattern from text
   * Requirement 5.1: Handle complex patterns like "忙20分钟，休息5分钟，3个番茄钟之后，休息10分钟"
   */
  static extractComplexPattern(text: string): PatternMatch {
    if (!text || typeof text !== 'string') {
      return { confidence: 0, matchedPattern: 'none' };
    }

    // Try complex patterns first (higher confidence)
    for (const { pattern, extract } of this.COMPLEX_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const result = extract(matches[0]);
        if (this.validateExtractedValues(result)) {
          return result;
        }
      }
    }

    // Try partial patterns
    for (const { pattern, extract } of this.PARTIAL_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const result = extract(matches[0]);
        if (this.validateExtractedValues(result)) {
          return result;
        }
      }
    }

    // Fallback to individual component extraction
    return this.extractIndividualComponents(text);
  }

  /**
   * Extract multiple patterns from text and resolve conflicts
   * Requirement 5.3: Prioritize most specific pomodoro-related values
   * Requirement 5.4: Use first complete configuration found
   */
  static extractMultiplePatternsWithConflictResolution(text: string): PatternMatch {
    if (!text || typeof text !== 'string') {
      return { confidence: 0, matchedPattern: 'none' };
    }

    const allMatches: PatternMatch[] = [];

    // Collect all pattern matches
    for (const { pattern, extract } of [...this.COMPLEX_PATTERNS, ...this.PARTIAL_PATTERNS]) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        const result = extract(match);
        if (this.validateExtractedValues(result)) {
          allMatches.push(result);
        }
      }
    }

    if (allMatches.length === 0) {
      return this.extractIndividualComponents(text);
    }

    // Sort by confidence and completeness
    allMatches.sort((a, b) => {
      // First by confidence
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Then by completeness (number of defined properties)
      const aComplete = this.getCompletenessScore(a);
      const bComplete = this.getCompletenessScore(b);
      return bComplete - aComplete;
    });

    // Return the best match, but merge with others if needed
    const bestMatch = allMatches[0];
    
    // Try to fill missing values from other matches
    for (const match of allMatches.slice(1)) {
      if (!bestMatch.workDuration && match.workDuration) {
        bestMatch.workDuration = match.workDuration;
      }
      if (!bestMatch.restDuration && match.restDuration) {
        bestMatch.restDuration = match.restDuration;
      }
      if (!bestMatch.cycles && match.cycles) {
        bestMatch.cycles = match.cycles;
      }
      if (!bestMatch.longBreakDuration && match.longBreakDuration) {
        bestMatch.longBreakDuration = match.longBreakDuration;
      }
    }

    return bestMatch;
  }

  /**
   * Extract individual components when no complex pattern matches
   */
  private static extractIndividualComponents(text: string): PatternMatch {
    const result: PatternMatch = {
      confidence: 0,
      matchedPattern: 'individual_components'
    };

    // Try to extract individual time values
    const timeValues = TimeFormatParser.parseAllTimeValues(text);
    
    // Simple heuristics for mapping time values to components
    if (timeValues.length >= 2) {
      // Assume first value is work duration, second is rest duration
      result.workDuration = timeValues[0].value || undefined;
      result.restDuration = timeValues[1].value || undefined;
      result.confidence = 0.4;
    } else if (timeValues.length === 1) {
      // Single time value - could be work duration
      if (text.includes('工作') || text.includes('专注') || text.includes('忙') || 
          text.includes('work') || text.includes('focus')) {
        result.workDuration = timeValues[0].value || undefined;
        result.confidence = 0.3;
      } else if (text.includes('休息') || text.includes('break') || text.includes('rest')) {
        result.restDuration = timeValues[0].value || undefined;
        result.confidence = 0.3;
      }
    }

    // Look for cycle indicators
    const cyclePatterns = [
      /(\d+)\s*个/g,
      /(\d+)\s*轮/g,
      /(\d+)\s*次/g,
      /(\d+)\s*cycles?/gi
    ];

    for (const pattern of cyclePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const cycles = parseInt(matches[0][1], 10);
        if (cycles >= 1 && cycles <= 10) {
          result.cycles = cycles;
          result.confidence = Math.max(result.confidence, 0.3);
          break;
        }
      }
    }

    return result;
  }

  /**
   * Validate extracted values are within acceptable ranges
   * Requirement 5.5: Validate extracted values are within acceptable ranges
   */
  private static validateExtractedValues(result: PatternMatch): boolean {
    if (result.workDuration !== undefined) {
      if (result.workDuration < 1 || result.workDuration > 120) {
        return false;
      }
    }
    
    if (result.restDuration !== undefined) {
      if (result.restDuration < 1 || result.restDuration > 60) {
        return false;
      }
    }
    
    if (result.cycles !== undefined) {
      if (result.cycles < 1 || result.cycles > 10) {
        return false;
      }
    }
    
    if (result.longBreakDuration !== undefined) {
      if (result.longBreakDuration < 5 || result.longBreakDuration > 60) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Calculate completeness score for a pattern match
   */
  private static getCompletenessScore(match: PatternMatch): number {
    let score = 0;
    if (match.workDuration !== undefined) score++;
    if (match.restDuration !== undefined) score++;
    if (match.cycles !== undefined) score++;
    if (match.longBreakDuration !== undefined) score++;
    return score;
  }

  /**
   * Normalize and validate pattern match
   */
  static normalizePatternMatch(match: PatternMatch): PatternMatch {
    const normalized = { ...match };
    
    // Normalize values to acceptable ranges
    if (normalized.workDuration !== undefined) {
      normalized.workDuration = Math.max(1, Math.min(120, Math.round(normalized.workDuration)));
    }
    
    if (normalized.restDuration !== undefined) {
      normalized.restDuration = Math.max(1, Math.min(60, Math.round(normalized.restDuration)));
    }
    
    if (normalized.cycles !== undefined) {
      normalized.cycles = Math.max(1, Math.min(10, Math.round(normalized.cycles)));
    }
    
    if (normalized.longBreakDuration !== undefined) {
      normalized.longBreakDuration = Math.max(5, Math.min(60, Math.round(normalized.longBreakDuration)));
    }
    
    return normalized;
  }

  /**
   * Get pattern matching statistics for debugging
   */
  static getPatternStats(text: string): {
    totalPatterns: number;
    matchedPatterns: string[];
    bestMatch: PatternMatch;
  } {
    const matchedPatterns: string[] = [];
    let bestMatch: PatternMatch = { confidence: 0, matchedPattern: 'none' };

    // Check all patterns
    for (const { pattern, extract } of [...this.COMPLEX_PATTERNS, ...this.PARTIAL_PATTERNS]) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const result = extract(matches[0]);
        if (this.validateExtractedValues(result)) {
          matchedPatterns.push(result.matchedPattern);
          if (result.confidence > bestMatch.confidence) {
            bestMatch = result;
          }
        }
      }
    }

    return {
      totalPatterns: this.COMPLEX_PATTERNS.length + this.PARTIAL_PATTERNS.length,
      matchedPatterns,
      bestMatch
    };
  }
}