/**
 * Pomodoro Configuration Extractor
 * Main component for extracting pomodoro configuration from plan items
 * Implements Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { PlanItem, ExtractedPomodoroConfig, ConfigSource } from './pomodoro-plan-sync-types.js';
import { PlanItemAnalyzer } from './plan-item-analyzer.js';
import { TimeFormatParser } from './time-format-parser.js';

export class PomodoroConfigExtractor {
  // Default pomodoro settings
  private static readonly DEFAULT_CONFIG = {
    workDuration: 25,
    restDuration: 5,
    cycles: 4,
    longBreakDuration: 15
  };

  // Acceptable ranges for validation
  private static readonly RANGES = {
    workDuration: { min: 1, max: 120 },
    restDuration: { min: 1, max: 60 },
    cycles: { min: 1, max: 10 },
    longBreakDuration: { min: 5, max: 60 }
  };

  /**
   * Extract pomodoro configuration from plan item
   * Requirement 1.1: Analyze Plan Item for Pomodoro configuration information
   * Requirement 5.1: Handle complex configuration patterns
   */
  static extractConfig(planItem: PlanItem): ExtractedPomodoroConfig | null {
    if (!planItem) {
      return null;
    }

    // Analyze the plan item
    const hints = PlanItemAnalyzer.analyzePlanItem(planItem);
    
    // If no pomodoro information detected, return null
    if (!hints.hasPomodoroInfo || hints.confidence < 0.2) {
      return null;
    }

    // Build configuration from hints
    const config: ExtractedPomodoroConfig = {
      workDuration: this.validateAndNormalize('workDuration', hints.workDuration) || this.DEFAULT_CONFIG.workDuration,
      restDuration: this.validateAndNormalize('restDuration', hints.restDuration) || this.DEFAULT_CONFIG.restDuration,
      cycles: this.validateAndNormalize('cycles', hints.cycles) || this.DEFAULT_CONFIG.cycles,
      source: 'plan-sync' as ConfigSource,
      confidence: hints.confidence,
      extractedFrom: {
        title: this.hasInfoInText(planItem.title || ''),
        description: this.hasInfoInText(planItem.desc || ''),
        subBlocks: planItem.sub_blocks && planItem.sub_blocks.length > 0 && 
                   planItem.sub_blocks.some(block => this.hasInfoInText(`${block.label} ${block.detail}`))
      }
    };

    // Add long break duration if found
    if (hints.longBreakDuration) {
      config.longBreakDuration = this.validateAndNormalize('longBreakDuration', hints.longBreakDuration);
    }

    return config;
  }

  /**
   * Extract configuration with conflict resolution
   * Requirement 5.3: Prioritize most specific pomodoro-related values
   * Requirement 5.4: Use first complete configuration found
   */
  static extractConfigWithConflictResolution(planItem: PlanItem): ExtractedPomodoroConfig | null {
    if (!planItem) {
      return null;
    }

    // Try to extract from different sources in priority order
    const sources = [
      { text: planItem.title, priority: 3, source: 'title' },
      { text: planItem.desc, priority: 2, source: 'description' },
    ];

    // Add sub-blocks as sources
    if (planItem.sub_blocks) {
      planItem.sub_blocks.forEach((block, index) => {
        sources.push({
          text: `${block.label} ${block.detail}`,
          priority: 1,
          source: `subBlock_${index}`
        });
      });
    }

    // Sort by priority (highest first)
    sources.sort((a, b) => b.priority - a.priority);

    let bestConfig: ExtractedPomodoroConfig | null = null;
    let bestScore = 0;

    for (const source of sources) {
      const hints = PlanItemAnalyzer['analyzeText'](source.text);
      if (hints.hasPomodoroInfo && hints.confidence > bestScore) {
        const config = this.buildConfigFromHints(hints, planItem);
        if (config) {
          bestConfig = config;
          bestScore = hints.confidence;
        }
      }
    }

    return bestConfig;
  }

  /**
   * Build configuration from hints
   */
  private static buildConfigFromHints(hints: any, planItem: PlanItem): ExtractedPomodoroConfig | null {
    if (!hints.hasPomodoroInfo) {
      return null;
    }

    const config: ExtractedPomodoroConfig = {
      workDuration: this.validateAndNormalize('workDuration', hints.workDuration) || this.DEFAULT_CONFIG.workDuration,
      restDuration: this.validateAndNormalize('restDuration', hints.restDuration) || this.DEFAULT_CONFIG.restDuration,
      cycles: this.validateAndNormalize('cycles', hints.cycles) || this.DEFAULT_CONFIG.cycles,
      source: 'plan-sync' as ConfigSource,
      confidence: hints.confidence,
      extractedFrom: {
        title: this.hasInfoInText(planItem.title),
        description: this.hasInfoInText(planItem.desc),
        subBlocks: planItem.sub_blocks && planItem.sub_blocks.length > 0
      }
    };

    if (hints.longBreakDuration) {
      config.longBreakDuration = this.validateAndNormalize('longBreakDuration', hints.longBreakDuration);
    }

    return config;
  }

  /**
   * Validate and normalize configuration values
   * Requirement 5.5: Validate extracted values are within acceptable ranges
   */
  private static validateAndNormalize(
    field: keyof typeof PomodoroConfigExtractor.RANGES, 
    value: number | undefined
  ): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const range = this.RANGES[field];
    if (!range) {
      return value;
    }

    // Clamp value to acceptable range
    return Math.max(range.min, Math.min(range.max, Math.round(value)));
  }

  /**
   * Check if text contains pomodoro information
   */
  private static hasInfoInText(text: string): boolean {
    if (!text) return false;
    
    const hints = PlanItemAnalyzer['analyzeText'](text);
    return hints.hasPomodoroInfo;
  }

  /**
   * Parse time format from string
   * Requirement 2.1, 2.2, 2.3: Parse various time formats
   */
  static parseTimeFormat(timeString: string): number | null {
    const result = TimeFormatParser.parseTimeFormat(timeString);
    return result.value;
  }

  /**
   * Detect pomodoro keywords in text
   * Requirement 3.1: Identify pomodoro-related content
   */
  static detectPomodoroKeywords(text: string): boolean {
    const hints = PlanItemAnalyzer['analyzeText'](text);
    return hints.hasPomodoroInfo;
  }

  /**
   * Extract complex pattern from description
   * Requirement 5.1: Handle complex patterns
   */
  static extractComplexPattern(description: string): Partial<ExtractedPomodoroConfig> {
    const hints = PlanItemAnalyzer['analyzeText'](description);
    
    const result: Partial<ExtractedPomodoroConfig> = {};
    
    if (hints.workDuration) {
      result.workDuration = this.validateAndNormalize('workDuration', hints.workDuration);
    }
    if (hints.restDuration) {
      result.restDuration = this.validateAndNormalize('restDuration', hints.restDuration);
    }
    if (hints.cycles) {
      result.cycles = this.validateAndNormalize('cycles', hints.cycles);
    }
    if (hints.longBreakDuration) {
      result.longBreakDuration = this.validateAndNormalize('longBreakDuration', hints.longBreakDuration);
    }

    return result;
  }

  /**
   * Get default configuration
   */
  static getDefaultConfig(): ExtractedPomodoroConfig {
    return {
      ...this.DEFAULT_CONFIG,
      source: 'default' as ConfigSource,
      confidence: 1.0,
      extractedFrom: {
        title: false,
        description: false,
        subBlocks: false
      }
    };
  }

  /**
   * Merge partial configuration with defaults
   * Requirement 5.2: Use extracted values and fill missing parameters with defaults
   */
  static mergeWithDefaults(partial: Partial<ExtractedPomodoroConfig>): ExtractedPomodoroConfig {
    const defaults = this.getDefaultConfig();
    
    return {
      workDuration: partial.workDuration ?? defaults.workDuration,
      restDuration: partial.restDuration ?? defaults.restDuration,
      cycles: partial.cycles ?? defaults.cycles,
      longBreakDuration: partial.longBreakDuration ?? defaults.longBreakDuration,
      source: partial.source ?? 'plan-sync',
      confidence: partial.confidence ?? 0.5,
      extractedFrom: partial.extractedFrom ?? defaults.extractedFrom
    };
  }
}