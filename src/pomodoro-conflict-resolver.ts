/**
 * Pomodoro Conflict Resolver
 * Handles conflicts when multiple pomodoro configurations are found
 * Implements Requirements 5.3, 5.4
 */

import { ExtractedPomodoroConfig, PlanItem } from './pomodoro-plan-sync-types.js';
import { ComplexPatternMatcher, PatternMatch } from './complex-pattern-matcher.js';
import { PlanItemAnalyzer } from './plan-item-analyzer.js';

export interface ConflictResolutionResult {
  resolvedConfig: ExtractedPomodoroConfig;
  conflicts: ConflictInfo[];
  resolutionStrategy: string;
  confidence: number;
}

export interface ConflictInfo {
  field: keyof ExtractedPomodoroConfig;
  values: Array<{ value: any; source: string; confidence: number }>;
  resolvedValue: any;
  resolutionReason: string;
}

export class PomodoroConflictResolver {
  // Priority order for different sources
  private static readonly SOURCE_PRIORITY = {
    'complex_pattern': 10,
    'title_specific': 9,
    'description_specific': 8,
    'subblock_specific': 7,
    'title_general': 6,
    'description_general': 5,
    'subblock_general': 4,
    'fallback': 3,
    'default': 1
  };

  // Default values for missing configurations
  private static readonly DEFAULT_VALUES = {
    workDuration: 25,
    restDuration: 5,
    cycles: 4,
    longBreakDuration: 15
  };

  /**
   * Resolve conflicts in pomodoro configuration
   * Requirement 5.3: Prioritize most specific pomodoro-related values
   * Requirement 5.4: Use first complete configuration found
   */
  static resolveConflicts(planItem: PlanItem): ConflictResolutionResult {
    if (!planItem) {
      return this.createDefaultResult();
    }

    // Extract configurations from different sources
    const sources = this.extractFromAllSources(planItem);
    
    // Identify conflicts
    const conflicts = this.identifyConflicts(sources);
    
    // Resolve conflicts
    const resolvedConfig = this.resolveConfigurationConflicts(sources, conflicts);
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(sources, resolvedConfig);

    return {
      resolvedConfig,
      conflicts,
      resolutionStrategy: this.determineResolutionStrategy(sources, conflicts),
      confidence
    };
  }

  /**
   * Extract configurations from all possible sources
   */
  private static extractFromAllSources(planItem: PlanItem): Array<{
    config: Partial<ExtractedPomodoroConfig>;
    source: string;
    confidence: number;
  }> {
    const sources: Array<{
      config: Partial<ExtractedPomodoroConfig>;
      source: string;
      confidence: number;
    }> = [];

    // Extract from title using complex pattern matching
    if (planItem.title) {
      const titlePattern = ComplexPatternMatcher.extractComplexPattern(planItem.title);
      if (titlePattern.confidence > 0) {
        sources.push({
          config: this.patternMatchToConfig(titlePattern),
          source: titlePattern.confidence > 0.7 ? 'title_specific' : 'title_general',
          confidence: titlePattern.confidence
        });
      }
    }

    // Extract from description using complex pattern matching
    if (planItem.desc) {
      const descPattern = ComplexPatternMatcher.extractComplexPattern(planItem.desc);
      if (descPattern.confidence > 0) {
        sources.push({
          config: this.patternMatchToConfig(descPattern),
          source: descPattern.confidence > 0.7 ? 'description_specific' : 'description_general',
          confidence: descPattern.confidence
        });
      }
    }

    // Extract from sub-blocks
    if (planItem.sub_blocks && planItem.sub_blocks.length > 0) {
      for (const block of planItem.sub_blocks) {
        const blockText = `${block.label} ${block.detail}`;
        const blockPattern = ComplexPatternMatcher.extractComplexPattern(blockText);
        if (blockPattern.confidence > 0) {
          sources.push({
            config: this.patternMatchToConfig(blockPattern),
            source: blockPattern.confidence > 0.7 ? 'subblock_specific' : 'subblock_general',
            confidence: blockPattern.confidence
          });
        }
      }
    }

    // Try multiple patterns with conflict resolution
    const fullText = `${planItem.title} ${planItem.desc}`;
    const multiPattern = ComplexPatternMatcher.extractMultiplePatternsWithConflictResolution(fullText);
    if (multiPattern.confidence > 0) {
      sources.push({
        config: this.patternMatchToConfig(multiPattern),
        source: 'complex_pattern',
        confidence: multiPattern.confidence
      });
    }

    return sources;
  }

  /**
   * Convert pattern match to configuration
   */
  private static patternMatchToConfig(pattern: PatternMatch): Partial<ExtractedPomodoroConfig> {
    const config: Partial<ExtractedPomodoroConfig> = {};
    
    if (pattern.workDuration !== undefined) {
      config.workDuration = pattern.workDuration;
    }
    if (pattern.restDuration !== undefined) {
      config.restDuration = pattern.restDuration;
    }
    if (pattern.cycles !== undefined) {
      config.cycles = pattern.cycles;
    }
    if (pattern.longBreakDuration !== undefined) {
      config.longBreakDuration = pattern.longBreakDuration;
    }
    
    return config;
  }

  /**
   * Identify conflicts between different sources
   */
  private static identifyConflicts(sources: Array<{
    config: Partial<ExtractedPomodoroConfig>;
    source: string;
    confidence: number;
  }>): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    const fields: Array<keyof ExtractedPomodoroConfig> = ['workDuration', 'restDuration', 'cycles', 'longBreakDuration'];

    for (const field of fields) {
      const values = sources
        .filter(s => s.config[field] !== undefined)
        .map(s => ({
          value: s.config[field],
          source: s.source,
          confidence: s.confidence
        }));

      if (values.length > 1) {
        // Check if there are actually different values
        const uniqueValues = [...new Set(values.map(v => v.value))];
        if (uniqueValues.length > 1) {
          // There's a conflict
          const resolvedValue = this.resolveFieldConflict(field, values);
          conflicts.push({
            field,
            values,
            resolvedValue,
            resolutionReason: this.getResolutionReason(field, values, resolvedValue)
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts for a specific field
   */
  private static resolveFieldConflict(
    field: keyof ExtractedPomodoroConfig,
    values: Array<{ value: any; source: string; confidence: number }>
  ): any {
    // Sort by priority and confidence
    values.sort((a, b) => {
      const aPriority = this.SOURCE_PRIORITY[a.source as keyof typeof this.SOURCE_PRIORITY] || 0;
      const bPriority = this.SOURCE_PRIORITY[b.source as keyof typeof this.SOURCE_PRIORITY] || 0;
      
      if (bPriority !== aPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      return b.confidence - a.confidence; // Higher confidence first
    });

    // Return the value from the highest priority/confidence source
    return values[0].value;
  }

  /**
   * Get resolution reason for a field conflict
   */
  private static getResolutionReason(
    field: keyof ExtractedPomodoroConfig,
    values: Array<{ value: any; source: string; confidence: number }>,
    resolvedValue: any
  ): string {
    const winningValue = values.find(v => v.value === resolvedValue);
    if (!winningValue) {
      return 'Unknown resolution';
    }

    const priority = this.SOURCE_PRIORITY[winningValue.source as keyof typeof this.SOURCE_PRIORITY] || 0;
    
    if (priority >= 9) {
      return `Used value from ${winningValue.source} due to high specificity`;
    } else if (priority >= 7) {
      return `Used value from ${winningValue.source} due to source priority`;
    } else {
      return `Used value from ${winningValue.source} due to higher confidence (${winningValue.confidence.toFixed(2)})`;
    }
  }

  /**
   * Resolve all configuration conflicts
   */
  private static resolveConfigurationConflicts(
    sources: Array<{
      config: Partial<ExtractedPomodoroConfig>;
      source: string;
      confidence: number;
    }>,
    conflicts: ConflictInfo[]
  ): ExtractedPomodoroConfig {
    const resolvedConfig: ExtractedPomodoroConfig = {
      workDuration: this.DEFAULT_VALUES.workDuration,
      restDuration: this.DEFAULT_VALUES.restDuration,
      cycles: this.DEFAULT_VALUES.cycles,
      longBreakDuration: this.DEFAULT_VALUES.longBreakDuration,
      source: 'plan-sync',
      confidence: 0,
      extractedFrom: {
        title: false,
        description: false,
        subBlocks: false
      }
    };

    // Apply resolved conflict values
    for (const conflict of conflicts) {
      (resolvedConfig as any)[conflict.field] = conflict.resolvedValue;
    }

    // Fill in non-conflicted values
    const fields: Array<keyof ExtractedPomodoroConfig> = ['workDuration', 'restDuration', 'cycles', 'longBreakDuration'];
    
    for (const field of fields) {
      if (!conflicts.some(c => c.field === field)) {
        // No conflict for this field, use the best available value
        const bestSource = sources
          .filter(s => s.config[field] !== undefined)
          .sort((a, b) => {
            const aPriority = this.SOURCE_PRIORITY[a.source as keyof typeof this.SOURCE_PRIORITY] || 0;
            const bPriority = this.SOURCE_PRIORITY[b.source as keyof typeof this.SOURCE_PRIORITY] || 0;
            
            if (bPriority !== aPriority) {
              return bPriority - aPriority;
            }
            
            return b.confidence - a.confidence;
          })[0];

        if (bestSource) {
          (resolvedConfig as any)[field] = bestSource.config[field];
        }
      }
    }

    // Set extraction source flags
    resolvedConfig.extractedFrom = {
      title: sources.some(s => s.source.includes('title')),
      description: sources.some(s => s.source.includes('description')),
      subBlocks: sources.some(s => s.source.includes('subblock'))
    };

    return resolvedConfig;
  }

  /**
   * Calculate overall confidence based on sources and resolution
   */
  private static calculateOverallConfidence(
    sources: Array<{
      config: Partial<ExtractedPomodoroConfig>;
      source: string;
      confidence: number;
    }>,
    resolvedConfig: ExtractedPomodoroConfig
  ): number {
    if (sources.length === 0) {
      return 0;
    }

    // Weight confidence by source priority and number of extracted fields
    let totalWeightedConfidence = 0;
    let totalWeight = 0;

    for (const source of sources) {
      const priority = this.SOURCE_PRIORITY[source.source as keyof typeof this.SOURCE_PRIORITY] || 1;
      const fieldCount = Object.keys(source.config).length;
      const weight = priority * fieldCount;
      
      totalWeightedConfidence += source.confidence * weight;
      totalWeight += weight;
    }

    const baseConfidence = totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0;
    
    // Boost confidence if we have a complete configuration
    const completenessBonus = this.getCompletenessBonus(resolvedConfig);
    
    return Math.min(1.0, baseConfidence + completenessBonus);
  }

  /**
   * Get completeness bonus for configuration
   */
  private static getCompletenessBonus(config: ExtractedPomodoroConfig): number {
    let extractedFields = 0;
    
    if (config.workDuration !== this.DEFAULT_VALUES.workDuration) extractedFields++;
    if (config.restDuration !== this.DEFAULT_VALUES.restDuration) extractedFields++;
    if (config.cycles !== this.DEFAULT_VALUES.cycles) extractedFields++;
    if (config.longBreakDuration && config.longBreakDuration !== this.DEFAULT_VALUES.longBreakDuration) extractedFields++;
    
    return extractedFields * 0.05; // 5% bonus per extracted field
  }

  /**
   * Determine resolution strategy used
   */
  private static determineResolutionStrategy(
    sources: Array<{
      config: Partial<ExtractedPomodoroConfig>;
      source: string;
      confidence: number;
    }>,
    conflicts: ConflictInfo[]
  ): string {
    if (sources.length === 0) {
      return 'default_values';
    }
    
    if (conflicts.length === 0) {
      return 'no_conflicts';
    }
    
    const hasHighPrioritySource = sources.some(s => 
      (this.SOURCE_PRIORITY[s.source as keyof typeof this.SOURCE_PRIORITY] || 0) >= 9
    );
    
    if (hasHighPrioritySource) {
      return 'priority_based';
    }
    
    return 'confidence_based';
  }

  /**
   * Create default result when no plan item is provided
   */
  private static createDefaultResult(): ConflictResolutionResult {
    return {
      resolvedConfig: {
        workDuration: this.DEFAULT_VALUES.workDuration,
        restDuration: this.DEFAULT_VALUES.restDuration,
        cycles: this.DEFAULT_VALUES.cycles,
        longBreakDuration: this.DEFAULT_VALUES.longBreakDuration,
        source: 'default',
        confidence: 1.0,
        extractedFrom: {
          title: false,
          description: false,
          subBlocks: false
        }
      },
      conflicts: [],
      resolutionStrategy: 'default_values',
      confidence: 1.0
    };
  }

  /**
   * Validate resolved configuration
   */
  static validateResolvedConfig(config: ExtractedPomodoroConfig): boolean {
    return (
      config.workDuration >= 1 && config.workDuration <= 120 &&
      config.restDuration >= 1 && config.restDuration <= 60 &&
      config.cycles >= 1 && config.cycles <= 10 &&
      (!config.longBreakDuration || (config.longBreakDuration >= 5 && config.longBreakDuration <= 60))
    );
  }
}