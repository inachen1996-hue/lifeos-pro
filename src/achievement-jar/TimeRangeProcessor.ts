/**
 * Achievement Jar Integration - Time Range Processor
 * Handles filtering and processing data for different time ranges
 */

import { TimeRange } from './types.js';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeRangeConfig {
  timeRange: TimeRange;
  dateRange: DateRange;
  label: string;
}

/**
 * Time range processor for filtering data by different time periods
 */
export class TimeRangeProcessor {
  /**
   * Get date range for a specific time range scope
   */
  static getDateRangeForScope(scope: TimeRange): DateRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (scope) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today
        };
        
      case 'weekly':
        // Get start of current week (Monday)
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as 0
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + mondayOffset);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return {
          start: weekStart,
          end: weekEnd
        };
        
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        return {
          start: monthStart,
          end: monthEnd
        };
        
      default:
        // Default to today
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
    }
  }

  /**
   * Filter log text by date range
   */
  static filterLogsByDateRange(logText: string, dateRange: DateRange): string {
    if (!logText) return '';
    
    const lines = logText.split('\n');
    const filteredLines: string[] = [];
    
    lines.forEach(line => {
      if (!line.trim()) return;
      
      // Extract date from log line
      const dateMatch = line.match(/(\d{4}-\d{1,2}-\d{1,2})/);
      if (dateMatch) {
        const logDate = new Date(dateMatch[1]);
        
        // Check if log date is within the specified range
        if (logDate >= dateRange.start && logDate <= dateRange.end) {
          filteredLines.push(line);
        }
      }
    });
    
    return filteredLines.join('\n');
  }

  /**
   * Get filtered logs for a specific time range scope
   */
  static getLogsForTimeRange(fullHistory: string, timeRange: TimeRange): string {
    const dateRange = this.getDateRangeForScope(timeRange);
    return this.filterLogsByDateRange(fullHistory, dateRange);
  }

  /**
   * Get time range configuration with labels
   */
  static getTimeRangeConfig(timeRange: TimeRange): TimeRangeConfig {
    const dateRange = this.getDateRangeForScope(timeRange);
    
    const labels = {
      today: '今日',
      weekly: '本周',
      monthly: '本月'
    };
    
    return {
      timeRange,
      dateRange,
      label: labels[timeRange]
    };
  }

  /**
   * Get all available time range options
   */
  static getAllTimeRangeOptions(): TimeRangeConfig[] {
    const ranges: TimeRange[] = ['today', 'weekly', 'monthly'];
    return ranges.map(range => this.getTimeRangeConfig(range));
  }

  /**
   * Format date range for display
   */
  static formatDateRange(dateRange: DateRange): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    };
    
    const startStr = formatDate(dateRange.start);
    const endStr = formatDate(dateRange.end);
    
    if (startStr === endStr) {
      return startStr;
    }
    
    return `${startStr} - ${endStr}`;
  }

  /**
   * Check if a date is within a date range
   */
  static isDateInRange(date: Date, dateRange: DateRange): boolean {
    return date >= dateRange.start && date <= dateRange.end;
  }

  /**
   * Get the number of days in a time range
   */
  static getDaysInRange(timeRange: TimeRange): number {
    switch (timeRange) {
      case 'today':
        return 1;
      case 'weekly':
        return 7;
      case 'monthly':
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return daysInMonth;
      default:
        return 1;
    }
  }

  /**
   * Calculate average daily time for a time range
   */
  static calculateDailyAverage(totalHours: number, timeRange: TimeRange): number {
    const days = this.getDaysInRange(timeRange);
    return totalHours / days;
  }

  /**
   * Get relative time description
   */
  static getRelativeTimeDescription(timeRange: TimeRange): string {
    const descriptions = {
      today: '今天的进度',
      weekly: '这周的进度',
      monthly: '这个月的进度'
    };
    
    return descriptions[timeRange];
  }

  /**
   * Check if current time is within business hours (for contextual messaging)
   */
  static isBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 9 && hour < 18; // 9 AM to 6 PM
  }

  /**
   * Get contextual message based on time range and current time
   */
  static getContextualMessage(timeRange: TimeRange, totalHours: number): string {
    const isBusinessTime = this.isBusinessHours();
    const dailyAverage = this.calculateDailyAverage(totalHours, timeRange);
    
    if (totalHours === 0) {
      if (timeRange === 'today' && isBusinessTime) {
        return '新的一天开始了！准备创造精彩吧 ✨';
      }
      return '还没有记录，开始你的第一个任务吧！';
    }
    
    if (timeRange === 'today') {
      if (totalHours >= 8) {
        return '今天真充实！继续保持这个节奏 🎉';
      } else if (totalHours >= 4) {
        return '进展不错！再接再厉 💪';
      } else {
        return '刚刚开始，加油！';
      }
    }
    
    if (timeRange === 'weekly') {
      if (dailyAverage >= 6) {
        return '这周表现优秀！工作学习都很充实 🌟';
      } else if (dailyAverage >= 3) {
        return '这周进展稳定，继续努力！';
      } else {
        return '这周可以更充实一些哦！';
      }
    }
    
    if (timeRange === 'monthly') {
      if (dailyAverage >= 5) {
        return '这个月非常充实！你是时间管理大师 🏆';
      } else if (dailyAverage >= 2) {
        return '这个月进展良好，保持节奏！';
      } else {
        return '这个月还有提升空间！';
      }
    }
    
    return '继续加油！每一分努力都有意义 ✨';
  }
}