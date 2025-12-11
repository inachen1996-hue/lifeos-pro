/**
 * Types for Pomodoro Plan Sync Feature
 * Defines interfaces and types for plan item analysis and configuration extraction
 */

/**
 * Plan Item structure from daily plan
 */
export interface PlanItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: string;
  sub_blocks?: SubBlock[];
  energy_required: 'high' | 'low';
}

/**
 * Sub-block within a plan item
 */
export interface SubBlock {
  time: string;
  label: string;
  detail: string;
}

/**
 * Configuration source type
 */
export type ConfigSource = 'plan-sync' | 'default' | 'user-modified' | 'session-cached';

/**
 * Extracted Pomodoro configuration
 */
export interface ExtractedPomodoroConfig {
  workDuration: number;
  restDuration: number;
  cycles: number;
  longBreakDuration?: number;
  source: ConfigSource;
  confidence: number;
  extractedFrom: {
    title?: boolean;
    description?: boolean;
    subBlocks?: boolean;
  };
}

/**
 * Pomodoro hints from analysis
 */
export interface PomodoroHints {
  hasPomodoroInfo: boolean;
  workDuration?: number;
  restDuration?: number;
  cycles?: number;
  longBreakDuration?: number;
  confidence: number;
}

/**
 * Duration information from blocks
 */
export interface DurationInfo {
  totalDuration: number;
  workPeriods: number[];
  breakPeriods: number[];
}

/**
 * Session configuration for temporary modifications
 */
export interface SessionConfig {
  planItemId: string;
  originalConfig: ExtractedPomodoroConfig;
  modifiedConfig: Partial<ExtractedPomodoroConfig>;
  timestamp: string;
}

/**
 * Time parsing result
 */
export interface TimeParseResult {
  value: number | null;
  unit: 'minutes' | 'hours' | null;
  confidence: number;
}