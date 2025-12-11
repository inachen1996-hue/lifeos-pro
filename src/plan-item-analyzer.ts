/**
 * Plan Item Analyzer
 * Analyzes plan items and sub-blocks for pomodoro information
 * Implements Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { PlanItem, SubBlock, PomodoroHints, DurationInfo } from './pomodoro-plan-sync-types.js';
import { TimeFormatParser } from './time-format-parser.js';
import { PomodoroKeywordDetector } from './pomodoro-keyword-detector.js';

export class PlanItemAnalyzer {
  /**
   * Analyze plan item for pomodoro information
   * Requirement 1.1: Analyze Plan Item for Pomodoro configuration information
   */
  static analyzePlanItem(planItem: PlanItem): PomodoroHints {
    if (!planItem) {
      return { hasPomodoroInfo: false, confidence: 0 };
    }

    const hints: PomodoroHints = {
      hasPomodoroInfo: false,
      confidence: 0
    };

    let totalConfidence = 0;
    let sourceCount = 0;

    // Analyze title
    const titleHints = this.analyzeText(planItem.title);
    if (titleHints.confidence > 0) {
      this.mergeHints(hints, titleHints);
      totalConfidence += titleHints.confidence;
      sourceCount++;
    }

    // Analyze description
    const descHints = this.analyzeText(planItem.desc);
    if (descHints.confidence > 0) {
      this.mergeHints(hints, descHints);
      totalConfidence += descHints.confidence;
      sourceCount++;
    }

    // Analyze sub-blocks
    if (planItem.sub_blocks && planItem.sub_blocks.length > 0) {
      const subBlockHints = this.analyzeSubBlocks(planItem.sub_blocks);
      if (subBlockHints.confidence > 0) {
        this.mergeHints(hints, subBlockHints);
        totalConfidence += subBlockHints.confidence;
        sourceCount++;
      }
    }

    // Calculate overall confidence
    hints.confidence = sourceCount > 0 ? totalConfidence / sourceCount : 0;
    hints.hasPomodoroInfo = hints.confidence > 0.2;

    return hints;
  }

  /**
   * Analyze sub-blocks for pomodoro patterns
   */
  static analyzeSubBlocks(subBlocks: SubBlock[]): PomodoroHints {
    if (!subBlocks || subBlocks.length === 0) {
      return { hasPomodoroInfo: false, confidence: 0 };
    }

    const hints: PomodoroHints = {
      hasPomodoroInfo: false,
      confidence: 0
    };

    let totalConfidence = 0;
    let blockCount = 0;

    for (const block of subBlocks) {
      // Analyze block label and detail
      const blockText = `${block.label} ${block.detail}`.trim();
      const blockHints = this.analyzeText(blockText);
      
      if (blockHints.confidence > 0) {
        this.mergeHints(hints, blockHints);
        totalConfidence += blockHints.confidence;
        blockCount++;
      }

      // Special handling for focus/break blocks
      if (this.isFocusBlock(block)) {
        const duration = this.extractDurationFromBlock(block);
        if (duration && !hints.workDuration) {
          hints.workDuration = duration;
          totalConfidence += 0.3;
        }
      } else if (this.isBreakBlock(block)) {
        const duration = this.extractDurationFromBlock(block);
        if (duration && !hints.restDuration) {
          hints.restDuration = duration;
          totalConfidence += 0.3;
        }
      }
    }

    hints.confidence = blockCount > 0 ? totalConfidence / Math.max(blockCount, 1) : 0;
    hints.hasPomodoroInfo = hints.confidence > 0.2;

    return hints;
  }

  /**
   * Analyze text for pomodoro information
   */
  private static analyzeText(text: string): PomodoroHints {
    if (!text || typeof text !== 'string') {
      return { hasPomodoroInfo: false, confidence: 0 };
    }

    const hints: PomodoroHints = {
      hasPomodoroInfo: false,
      confidence: 0
    };

    // Use keyword detector for complex pattern extraction
    const pattern = PomodoroKeywordDetector.extractComplexPattern(text);
    
    if (pattern.workDuration) hints.workDuration = pattern.workDuration;
    if (pattern.restDuration) hints.restDuration = pattern.restDuration;
    if (pattern.cycles) hints.cycles = pattern.cycles;
    if (pattern.longBreakDuration) hints.longBreakDuration = pattern.longBreakDuration;
    
    hints.confidence = pattern.confidence;
    hints.hasPomodoroInfo = hints.confidence > 0.2;

    return hints;
  }

  /**
   * Merge hints from multiple sources
   */
  private static mergeHints(target: PomodoroHints, source: PomodoroHints): void {
    // Use the first non-null value found, or the one with higher confidence
    if (source.workDuration && !target.workDuration) {
      target.workDuration = source.workDuration;
    }
    if (source.restDuration && !target.restDuration) {
      target.restDuration = source.restDuration;
    }
    if (source.cycles && !target.cycles) {
      target.cycles = source.cycles;
    }
    if (source.longBreakDuration && !target.longBreakDuration) {
      target.longBreakDuration = source.longBreakDuration;
    }
  }

  /**
   * Identify focus blocks
   */
  static identifyFocusBlocks(subBlocks: SubBlock[]): SubBlock[] {
    if (!subBlocks) return [];
    
    return subBlocks.filter(block => this.isFocusBlock(block));
  }

  /**
   * Identify break blocks
   */
  static identifyBreakBlocks(subBlocks: SubBlock[]): SubBlock[] {
    if (!subBlocks) return [];
    
    return subBlocks.filter(block => this.isBreakBlock(block));
  }

  /**
   * Check if block is a focus block
   */
  private static isFocusBlock(block: SubBlock): boolean {
    const text = `${block.label} ${block.detail}`.toLowerCase();
    return text.includes('focus') || 
           text.includes('专注') || 
           text.includes('工作') ||
           text.includes('忙');
  }

  /**
   * Check if block is a break block
   */
  private static isBreakBlock(block: SubBlock): boolean {
    const text = `${block.label} ${block.detail}`.toLowerCase();
    return text.includes('break') || 
           text.includes('休息') || 
           text.includes('rest');
  }

  /**
   * Extract duration from block
   */
  private static extractDurationFromBlock(block: SubBlock): number | null {
    const text = `${block.label} ${block.detail} ${block.time}`;
    const timeResult = TimeFormatParser.parseTimeFormat(text);
    return timeResult.value;
  }

  /**
   * Calculate durations from blocks
   */
  static calculateDurations(blocks: SubBlock[]): DurationInfo {
    if (!blocks || blocks.length === 0) {
      return {
        totalDuration: 0,
        workPeriods: [],
        breakPeriods: []
      };
    }

    const workPeriods: number[] = [];
    const breakPeriods: number[] = [];
    let totalDuration = 0;

    for (const block of blocks) {
      const duration = this.extractDurationFromBlock(block);
      if (duration) {
        totalDuration += duration;
        
        if (this.isFocusBlock(block)) {
          workPeriods.push(duration);
        } else if (this.isBreakBlock(block)) {
          breakPeriods.push(duration);
        }
      }
    }

    return {
      totalDuration,
      workPeriods,
      breakPeriods
    };
  }
}