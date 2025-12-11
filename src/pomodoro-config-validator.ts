/**
 * Pomodoro Configuration Validator
 * Validates and normalizes pomodoro configuration values
 * Implements Requirements 5.5
 */

import { ExtractedPomodoroConfig } from './pomodoro-plan-sync-types.js';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  normalizedConfig?: ExtractedPomodoroConfig;
}

export interface ValidationError {
  field: keyof ExtractedPomodoroConfig;
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: keyof ExtractedPomodoroConfig;
  value: any;
  message: string;
  suggestion?: any;
}

export class PomodoroConfigValidator {
  // Validation rules for each field
  private static readonly VALIDATION_RULES = {
    workDuration: {
      min: 1,
      max: 120,
      recommended: { min: 15, max: 60 },
      message: 'Work duration must be between 1 and 120 minutes'
    },
    restDuration: {
      min: 1,
      max: 60,
      recommended: { min: 3, max: 15 },
      message: 'Rest duration must be between 1 and 60 minutes'
    },
    cycles: {
      min: 1,
      max: 10,
      recommended: { min: 2, max: 6 },
      message: 'Cycles must be between 1 and 10'
    },
    longBreakDuration: {
      min: 5,
      max: 60,
      recommended: { min: 10, max: 30 },
      message: 'Long break duration must be between 5 and 60 minutes'
    }
  };

  // Default values for normalization
  private static readonly DEFAULT_VALUES = {
    workDuration: 25,
    restDuration: 5,
    cycles: 4,
    longBreakDuration: 15
  };

  /**
   * Validate pomodoro configuration
   * Requirement 5.5: Validate extracted values are within acceptable ranges
   */
  static validateConfig(config: ExtractedPomodoroConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let isValid = true;

    // Validate work duration
    if (config.workDuration !== undefined) {
      const workValidation = this.validateField('workDuration', config.workDuration);
      if (workValidation.error) {
        errors.push(workValidation.error);
        isValid = false;
      }
      if (workValidation.warning) {
        warnings.push(workValidation.warning);
      }
    }

    // Validate rest duration
    if (config.restDuration !== undefined) {
      const restValidation = this.validateField('restDuration', config.restDuration);
      if (restValidation.error) {
        errors.push(restValidation.error);
        isValid = false;
      }
      if (restValidation.warning) {
        warnings.push(restValidation.warning);
      }
    }

    // Validate cycles
    if (config.cycles !== undefined) {
      const cyclesValidation = this.validateField('cycles', config.cycles);
      if (cyclesValidation.error) {
        errors.push(cyclesValidation.error);
        isValid = false;
      }
      if (cyclesValidation.warning) {
        warnings.push(cyclesValidation.warning);
      }
    }

    // Validate long break duration
    if (config.longBreakDuration !== undefined && config.longBreakDuration !== null) {
      const longBreakValidation = this.validateField('longBreakDuration', config.longBreakDuration);
      if (longBreakValidation.error) {
        errors.push(longBreakValidation.error);
        isValid = false;
      }
      if (longBreakValidation.warning) {
        warnings.push(longBreakValidation.warning);
      }
    }

    // Cross-field validations
    const crossValidations = this.validateCrossFields(config);
    errors.push(...crossValidations.errors);
    warnings.push(...crossValidations.warnings);
    
    if (crossValidations.errors.length > 0) {
      isValid = false;
    }

    // Create normalized config if valid
    const normalizedConfig = isValid ? this.normalizeConfig(config) : undefined;

    return {
      isValid,
      errors,
      warnings,
      normalizedConfig
    };
  }

  /**
   * Validate a single field
   */
  private static validateField(
    field: keyof typeof PomodoroConfigValidator.VALIDATION_RULES,
    value: any
  ): {
    error?: ValidationError;
    warning?: ValidationWarning;
  } {
    const rules = this.VALIDATION_RULES[field];
    const result: { error?: ValidationError; warning?: ValidationWarning } = {};

    // Type validation
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      result.error = {
        field: field as keyof ExtractedPomodoroConfig,
        value,
        message: `${field} must be a positive integer`,
        severity: 'error'
      };
      return result;
    }

    // Range validation
    if (value < rules.min || value > rules.max) {
      result.error = {
        field: field as keyof ExtractedPomodoroConfig,
        value,
        message: rules.message,
        severity: 'error'
      };
      return result;
    }

    // Recommendation warnings
    if (value < rules.recommended.min || value > rules.recommended.max) {
      result.warning = {
        field: field as keyof ExtractedPomodoroConfig,
        value,
        message: `${field} of ${value} is outside recommended range (${rules.recommended.min}-${rules.recommended.max})`,
        suggestion: value < rules.recommended.min ? rules.recommended.min : rules.recommended.max
      };
    }

    return result;
  }

  /**
   * Validate cross-field relationships
   */
  private static validateCrossFields(config: ExtractedPomodoroConfig): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Work duration should typically be longer than rest duration
    if (config.workDuration !== undefined && config.restDuration !== undefined) {
      if (config.workDuration <= config.restDuration) {
        warnings.push({
          field: 'workDuration',
          value: config.workDuration,
          message: 'Work duration is not longer than rest duration, which is unusual for pomodoro technique',
          suggestion: Math.max(config.restDuration + 5, 25)
        });
      }

      // Very unbalanced ratios
      const ratio = config.workDuration / config.restDuration;
      if (ratio > 10) {
        warnings.push({
          field: 'restDuration',
          value: config.restDuration,
          message: 'Rest duration is very short compared to work duration',
          suggestion: Math.max(Math.round(config.workDuration / 5), 5)
        });
      } else if (ratio < 2) {
        warnings.push({
          field: 'workDuration',
          value: config.workDuration,
          message: 'Work duration is very short compared to rest duration',
          suggestion: config.restDuration * 3
        });
      }
    }

    // Long break should be longer than regular rest
    if (config.longBreakDuration !== undefined && config.restDuration !== undefined) {
      if (config.longBreakDuration <= config.restDuration) {
        warnings.push({
          field: 'longBreakDuration',
          value: config.longBreakDuration,
          message: 'Long break duration should be longer than regular rest duration',
          suggestion: Math.max(config.restDuration * 2, 15)
        });
      }
    }

    // Very high cycle counts might be impractical
    if (config.cycles !== undefined && config.cycles > 6) {
      warnings.push({
        field: 'cycles',
        value: config.cycles,
        message: 'High cycle count might be difficult to complete in practice',
        suggestion: 4
      });
    }

    return { errors, warnings };
  }

  /**
   * Normalize configuration values
   */
  static normalizeConfig(config: ExtractedPomodoroConfig): ExtractedPomodoroConfig {
    const normalized = { ...config };

    // Ensure all values are integers within valid ranges
    if (normalized.workDuration !== undefined) {
      normalized.workDuration = this.clampAndRound('workDuration', normalized.workDuration);
    }

    if (normalized.restDuration !== undefined) {
      normalized.restDuration = this.clampAndRound('restDuration', normalized.restDuration);
    }

    if (normalized.cycles !== undefined) {
      normalized.cycles = this.clampAndRound('cycles', normalized.cycles);
    }

    if (normalized.longBreakDuration !== undefined && normalized.longBreakDuration !== null) {
      normalized.longBreakDuration = this.clampAndRound('longBreakDuration', normalized.longBreakDuration);
    }

    return normalized;
  }

  /**
   * Clamp value to valid range and round to integer
   */
  private static clampAndRound(
    field: keyof typeof PomodoroConfigValidator.VALIDATION_RULES,
    value: number
  ): number {
    const rules = this.VALIDATION_RULES[field];
    return Math.max(rules.min, Math.min(rules.max, Math.round(value)));
  }

  /**
   * Apply automatic fixes to configuration
   */
  static autoFixConfig(config: ExtractedPomodoroConfig): ExtractedPomodoroConfig {
    const fixed = this.normalizeConfig(config);

    // Apply intelligent defaults for missing or invalid values
    if (fixed.workDuration === undefined || fixed.workDuration === null || typeof fixed.workDuration !== 'number') {
      fixed.workDuration = this.DEFAULT_VALUES.workDuration;
    }

    if (fixed.restDuration === undefined || fixed.restDuration === null || typeof fixed.restDuration !== 'number') {
      fixed.restDuration = this.DEFAULT_VALUES.restDuration;
    }

    if (fixed.cycles === undefined || fixed.cycles === null || typeof fixed.cycles !== 'number') {
      fixed.cycles = this.DEFAULT_VALUES.cycles;
    }

    // Auto-calculate long break if not specified
    if ((fixed.longBreakDuration === undefined || fixed.longBreakDuration === null) && fixed.restDuration !== undefined) {
      fixed.longBreakDuration = Math.max(
        Math.min(fixed.restDuration * 3, this.VALIDATION_RULES.longBreakDuration.max),
        this.DEFAULT_VALUES.longBreakDuration
      );
    }

    // Apply cross-field fixes
    if (fixed.workDuration <= fixed.restDuration) {
      // Adjust work duration to be reasonable compared to rest
      fixed.workDuration = Math.min(
        Math.max(fixed.restDuration * 3, 20),
        this.VALIDATION_RULES.workDuration.max
      );
    }

    if (fixed.longBreakDuration && fixed.longBreakDuration <= fixed.restDuration) {
      // Adjust long break to be longer than rest
      fixed.longBreakDuration = Math.min(
        Math.max(fixed.restDuration * 2, 15),
        this.VALIDATION_RULES.longBreakDuration.max
      );
    }

    return fixed;
  }

  /**
   * Check if configuration is within recommended ranges
   */
  static isRecommendedConfig(config: ExtractedPomodoroConfig): boolean {
    const rules = this.VALIDATION_RULES;

    if (config.workDuration !== undefined) {
      const workRules = rules.workDuration;
      if (config.workDuration < workRules.recommended.min || config.workDuration > workRules.recommended.max) {
        return false;
      }
    }

    if (config.restDuration !== undefined) {
      const restRules = rules.restDuration;
      if (config.restDuration < restRules.recommended.min || config.restDuration > restRules.recommended.max) {
        return false;
      }
    }

    if (config.cycles !== undefined) {
      const cycleRules = rules.cycles;
      if (config.cycles < cycleRules.recommended.min || config.cycles > cycleRules.recommended.max) {
        return false;
      }
    }

    if (config.longBreakDuration !== undefined) {
      const longBreakRules = rules.longBreakDuration;
      if (config.longBreakDuration < longBreakRules.recommended.min || config.longBreakDuration > longBreakRules.recommended.max) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(result: ValidationResult): string {
    if (result.isValid && result.warnings.length === 0) {
      return 'Configuration is valid and follows recommended practices';
    }

    if (result.isValid && result.warnings.length > 0) {
      return `Configuration is valid but has ${result.warnings.length} recommendation(s)`;
    }

    return `Configuration has ${result.errors.length} error(s) and ${result.warnings.length} warning(s)`;
  }
}