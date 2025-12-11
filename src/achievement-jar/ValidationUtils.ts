/**
 * Achievement Jar Integration - Validation and Error Handling Utils
 * Provides data validation and error handling for the integration
 */

import { CategoryTimeStats, CategoryMetric, RawProgressData, TimeRange } from './types.js';
import { AdaptedProgressData } from './DataAdapter.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ErrorContext {
  component: string;
  operation: string;
  data?: any;
  timestamp: number;
}

/**
 * Validation utilities for Achievement Jar integration
 */
export class ValidationUtils {
  /**
   * Validate raw progress data
   */
  static validateRawProgressData(data: RawProgressData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data object exists
    if (!data || typeof data !== 'object') {
      errors.push('Raw progress data is not a valid object');
      return { isValid: false, errors, warnings };
    }

    // Check required categories
    const requiredCategories = ['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby'];
    const missingCategories = requiredCategories.filter(cat => !(cat in data));
    
    if (missingCategories.length > 0) {
      warnings.push(`Missing categories: ${missingCategories.join(', ')}`);
    }

    // Validate numeric values
    Object.entries(data).forEach(([category, hours]) => {
      if (typeof hours !== 'number') {
        errors.push(`Category '${category}' has non-numeric value: ${hours}`);
      } else if (isNaN(hours)) {
        errors.push(`Category '${category}' has NaN value`);
      } else if (hours < 0) {
        errors.push(`Category '${category}' has negative value: ${hours}`);
      } else if (hours > 24) {
        warnings.push(`Category '${category}' has unusually high value: ${hours} hours`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate category time stats
   */
  static validateCategoryTimeStats(stats: CategoryTimeStats[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(stats)) {
      errors.push('Category stats is not an array');
      return { isValid: false, errors, warnings };
    }

    stats.forEach((stat, index) => {
      const prefix = `Category ${index} (${stat.categoryId || 'unknown'})`;

      // Required fields
      if (!stat.categoryId) {
        errors.push(`${prefix}: Missing categoryId`);
      }
      if (!stat.name) {
        errors.push(`${prefix}: Missing name`);
      }
      if (!stat.color) {
        errors.push(`${prefix}: Missing color`);
      }
      if (!stat.icon) {
        errors.push(`${prefix}: Missing icon`);
      }

      // Numeric validations
      if (typeof stat.totalMinutes !== 'number' || isNaN(stat.totalMinutes)) {
        errors.push(`${prefix}: Invalid totalMinutes value`);
      } else if (stat.totalMinutes < 0) {
        errors.push(`${prefix}: Negative totalMinutes value`);
      }

      if (typeof stat.ballCount !== 'number' || isNaN(stat.ballCount)) {
        errors.push(`${prefix}: Invalid ballCount value`);
      } else if (stat.ballCount < 0) {
        errors.push(`${prefix}: Negative ballCount value`);
      } else if (stat.ballCount > 10) {
        warnings.push(`${prefix}: High ballCount (${stat.ballCount}) may affect performance`);
      }

      if (typeof stat.percentage !== 'number' || isNaN(stat.percentage)) {
        errors.push(`${prefix}: Invalid percentage value`);
      } else if (stat.percentage < 0 || stat.percentage > 100) {
        errors.push(`${prefix}: Percentage out of range (0-100): ${stat.percentage}`);
      }

      // Priority validation
      if (!['high', 'normal'].includes(stat.priority)) {
        errors.push(`${prefix}: Invalid priority value: ${stat.priority}`);
      }
    });

    // Check for duplicate category IDs
    const categoryIds = stats.map(s => s.categoryId).filter(Boolean);
    const duplicates = categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate category IDs found: ${duplicates.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate adapted progress data
   */
  static validateAdaptedProgressData(data: AdaptedProgressData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Adapted progress data is not a valid object');
      return { isValid: false, errors, warnings };
    }

    // Validate category stats
    const statsValidation = this.validateCategoryTimeStats(data.categoryStats);
    errors.push(...statsValidation.errors);
    warnings.push(...statsValidation.warnings);

    // Validate total time
    if (typeof data.totalTime !== 'number' || isNaN(data.totalTime)) {
      errors.push('Invalid totalTime value');
    } else if (data.totalTime < 0) {
      errors.push('Negative totalTime value');
    }

    // Validate time range
    if (!['today', 'weekly', 'monthly'].includes(data.timeRange)) {
      errors.push(`Invalid timeRange value: ${data.timeRange}`);
    }

    // Validate isEmpty flag consistency
    const shouldBeEmpty = data.totalTime === 0 || data.categoryStats.length === 0;
    if (data.isEmpty !== shouldBeEmpty) {
      warnings.push(`isEmpty flag (${data.isEmpty}) doesn't match data state (${shouldBeEmpty})`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate log text format
   */
  static validateLogText(logText: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof logText !== 'string') {
      errors.push('Log text is not a string');
      return { isValid: false, errors, warnings };
    }

    if (logText.trim().length === 0) {
      warnings.push('Log text is empty');
      return { isValid: true, errors, warnings };
    }

    const lines = logText.split('\n').filter(line => line.trim());
    let validEntries = 0;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for date format
      const dateMatch = line.match(/\d{4}-\d{1,2}-\d{1,2}/);
      if (!dateMatch) {
        warnings.push(`Line ${lineNum}: No date found`);
      }

      // Check for duration format
      const durationMatch = line.match(/\d+(\.\d+)?\s*(h|m|min|hour)/i);
      const isoTimeMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      if (!durationMatch && !isoTimeMatch) {
        warnings.push(`Line ${lineNum}: No duration or time range found`);
      } else {
        validEntries++;
      }

      // Check line length (very long lines might indicate formatting issues)
      if (line.length > 500) {
        warnings.push(`Line ${lineNum}: Unusually long line (${line.length} characters)`);
      }
    });

    if (validEntries === 0 && lines.length > 0) {
      warnings.push('No valid time entries found in log text');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize and clean data
   */
  static sanitizeRawProgressData(data: RawProgressData): RawProgressData {
    const sanitized: RawProgressData = {
      work: 0,
      study: 0,
      rest: 0,
      sleep: 0,
      life: 0,
      entertainment: 0,
      health: 0,
      hobby: 0
    };

    Object.entries(data).forEach(([category, hours]) => {
      if (category in sanitized) {
        const numericValue = Number(hours);
        if (Number.isFinite(numericValue) && numericValue >= 0) {
          sanitized[category as keyof RawProgressData] = Math.min(numericValue, 24); // Cap at 24 hours
        }
      }
    });

    return sanitized;
  }

  /**
   * Create error context for logging
   */
  static createErrorContext(component: string, operation: string, data?: any): ErrorContext {
    return {
      component,
      operation,
      data: data ? JSON.stringify(data, null, 2) : undefined,
      timestamp: Date.now()
    };
  }

  /**
   * Log validation results
   */
  static logValidationResults(context: ErrorContext, result: ValidationResult): void {
    if (result.errors.length > 0) {
      console.error(`[${context.component}] ${context.operation} validation failed:`, {
        errors: result.errors,
        warnings: result.warnings,
        context
      });
    } else if (result.warnings.length > 0) {
      console.warn(`[${context.component}] ${context.operation} validation warnings:`, {
        warnings: result.warnings,
        context
      });
    }
  }

  /**
   * Check if data is safe for rendering
   */
  static isSafeForRendering(data: AdaptedProgressData): boolean {
    const validation = this.validateAdaptedProgressData(data);
    
    // Allow rendering if there are only warnings, but not if there are errors
    return validation.isValid;
  }

  /**
   * Get fallback data for error states
   */
  static getFallbackData(timeRange: TimeRange): AdaptedProgressData {
    return {
      categoryStats: [],
      totalTime: 0,
      metrics: [],
      timeRange,
      isEmpty: true
    };
  }
}