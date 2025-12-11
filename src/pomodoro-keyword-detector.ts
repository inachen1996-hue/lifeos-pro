/**
 * Pomodoro Keyword Detector
 * Detects pomodoro-related keywords and patterns in text
 * Implements Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

export class PomodoroKeywordDetector {
  private static readonly POMODORO_KEYWORDS = [
    // Chinese keywords
    '番茄钟', '番茄', '专注', '休息', '工作', '忙',
    
    // English keywords
    'pomodoro', 'focus', 'break', 'work', 'rest',
    
    // Pattern indicators
    '循环', 'cycle', 'cycles', '个', '轮'
  ];

  private static readonly WORK_PATTERNS = [
    /忙\s*(\d+)\s*分钟/g,
    /工作\s*(\d+)\s*分钟/g,
    /专注\s*(\d+)\s*分钟/g,
    /focus\s*(\d+)\s*min/gi,
    /work\s*(\d+)\s*min/gi,
  ];

  private static readonly REST_PATTERNS = [
    /休息\s*(\d+)\s*分钟/g,
    /break\s*(\d+)\s*min/gi,
    /rest\s*(\d+)\s*min/gi,
  ];

  private static readonly CYCLE_PATTERNS = [
    /(\d+)\s*个\s*番茄钟/g,
    /(\d+)\s*轮/g,
    /(\d+)\s*cycles?/gi,
    /(\d+)\s*个\s*循环/g,
  ];

  private static readonly LONG_BREAK_PATTERNS = [
    /休息\s*(\d+)\s*分钟\s*[，,]\s*再继续/g,
    /之后\s*[，,]?\s*休息\s*(\d+)\s*分钟/g,
    /long\s*break\s*(\d+)\s*min/gi,
  ];

  /**
   * Detect if text contains pomodoro-related keywords
   * Requirement 3.1: Identify pomodoro-related content
   */
  static detectPomodoroKeywords(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    const lowerText = text.toLowerCase();
    return this.POMODORO_KEYWORDS.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }

  /**
   * Extract work duration from text patterns
   * Requirement 3.2: Extract work and rest durations from patterns
   */
  static extractWorkDuration(text: string): number | null {
    if (!text || typeof text !== 'string') {
      return null;
    }

    for (const pattern of this.WORK_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const value = parseInt(matches[0][1], 10);
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Extract rest duration from text patterns
   * Requirement 3.2: Extract work and rest durations from patterns
   */
  static extractRestDuration(text: string): number | null {
    if (!text || typeof text !== 'string') {
      return null;
    }

    for (const pattern of this.REST_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const value = parseInt(matches[0][1], 10);
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Extract cycle count from text patterns
   * Requirement 3.3: Extract cycle count
   */
  static extractCycleCount(text: string): number | null {
    if (!text || typeof text !== 'string') {
      return null;
    }

    for (const pattern of this.CYCLE_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const value = parseInt(matches[0][1], 10);
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Extract long break duration from text patterns
   * Requirement 3.4: Identify long break duration
   */
  static extractLongBreakDuration(text: string): number | null {
    if (!text || typeof text !== 'string') {
      return null;
    }

    for (const pattern of this.LONG_BREAK_PATTERNS) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const value = parseInt(matches[0][1], 10);
        if (!isNaN(value) && value > 0) {
          return value;
        }
      }
    }

    return null;
  }

  /**
   * Extract complex pomodoro pattern
   * Requirement 5.1: Handle complex patterns like "忙20分钟，休息5分钟，3个番茄钟之后，休息10分钟"
   */
  static extractComplexPattern(text: string): {
    workDuration?: number;
    restDuration?: number;
    cycles?: number;
    longBreakDuration?: number;
    confidence: number;
  } {
    if (!text || typeof text !== 'string') {
      return { confidence: 0 };
    }

    const result: any = { confidence: 0 };
    let matchCount = 0;

    // Extract work duration
    const workDuration = this.extractWorkDuration(text);
    if (workDuration !== null) {
      result.workDuration = workDuration;
      matchCount++;
    }

    // Extract rest duration
    const restDuration = this.extractRestDuration(text);
    if (restDuration !== null) {
      result.restDuration = restDuration;
      matchCount++;
    }

    // Extract cycle count
    const cycles = this.extractCycleCount(text);
    if (cycles !== null) {
      result.cycles = cycles;
      matchCount++;
    }

    // Extract long break duration
    const longBreakDuration = this.extractLongBreakDuration(text);
    if (longBreakDuration !== null) {
      result.longBreakDuration = longBreakDuration;
      matchCount++;
    }

    // Calculate confidence based on number of matches and keyword presence
    const hasKeywords = this.detectPomodoroKeywords(text);
    result.confidence = (matchCount * 0.25) + (hasKeywords ? 0.2 : 0);

    return result;
  }

  /**
   * Get confidence score for pomodoro detection
   */
  static getConfidenceScore(text: string): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    let score = 0;

    // Keyword presence
    if (this.detectPomodoroKeywords(text)) {
      score += 0.3;
    }

    // Pattern matches
    if (this.extractWorkDuration(text) !== null) score += 0.2;
    if (this.extractRestDuration(text) !== null) score += 0.2;
    if (this.extractCycleCount(text) !== null) score += 0.2;
    if (this.extractLongBreakDuration(text) !== null) score += 0.1;

    return Math.min(score, 1.0);
  }
}