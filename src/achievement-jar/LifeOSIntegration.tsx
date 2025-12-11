/**
 * Achievement Jar Progress Visualization - LifeOS System Integration
 * Connects Achievement Jar with existing LifeOS data sources and navigation
 */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { AchievementJarContainer } from './AchievementJarContainer.js';
import { CelebrationIntegration } from './CelebrationIntegration';
import { CategoryTimeStats, CelebrationType } from './types.js';
import { CategoryColorService } from '../utils/category-colors.js';

// Type definitions for LifeOS integration
interface LifeOSData {
  fullHistory: string;
  categoryMap: Record<string, any>;
  timeRange?: 'today' | 'weekly' | 'monthly';
  progressScope?: 'today' | 'weekly' | 'monthly'; // Legacy support
  onScopeChange?: (scope: 'today' | 'weekly' | 'monthly') => void;
  customSounds?: Record<string, string>;
  performanceSettings?: {
    enablePhysics: boolean;
    enableCelebrationEffects: boolean;
    enableSoundEffects: boolean;
    maxVisibleBalls: number;
    animationQuality: 'high' | 'medium' | 'low';
    updateFrequency: number;
  };
  className?: string;
}

interface ParsedLogEntry {
  date: string;
  category: string;
  icon: string;
  name: string;
  duration: number; // in minutes
  startTime: string;
  endTime: string;
}

/**
 * LifeOS Integration Component
 * Bridges Achievement Jar with existing LifeOS system
 */
export const LifeOSAchievementJar: React.FC<LifeOSData> = ({
  fullHistory,
  categoryMap,
  timeRange,
  progressScope,
  onScopeChange,
  customSounds = {},
  performanceSettings,
  className = ''
}) => {
  // Use timeRange if provided, fallback to progressScope for legacy support
  const currentScope = timeRange || progressScope || 'today';
  const [isLoading, setIsLoading] = useState(false);

  // Parse LifeOS history data into Achievement Jar format
  const categoryStats = useMemo((): CategoryTimeStats[] => {
    if (!fullHistory) return [];

    try {
      setIsLoading(true);
      
      // Get date range based on scope
      const dateRange = getDateRangeForScope(currentScope);
      const logsInRange = getLogsInDateRange(fullHistory, dateRange.start, dateRange.end);
      
      // Parse logs into structured data
      const parsedEntries = parseHistoryLogs(logsInRange);
      
      // Group by category and calculate statistics
      const categoryGroups = groupByCategory(parsedEntries);
      
      // Convert to CategoryTimeStats format
      const stats = Object.entries(categoryGroups).map(([categoryId, entries]) => {
        const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
        const category = getCategoryInfo(categoryId, categoryMap);
        
        return {
          categoryId,
          name: category.name,
          icon: category.icon,
          color: CategoryColorService.getThemeColor(categoryId),
          totalMinutes,
          percentage: 0, // Will be calculated after all categories are processed
          priority: category.priority || 0,
          entries: entries.length
        };
      });

      // Calculate percentages
      const totalTime = stats.reduce((sum, stat) => sum + stat.totalMinutes, 0);
      if (totalTime > 0) {
        stats.forEach(stat => {
          stat.percentage = (stat.totalMinutes / totalTime) * 100;
        });
      }

      // Sort by priority and time
      stats.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return b.totalMinutes - a.totalMinutes; // More time first
      });

      return stats;
    } catch (error) {
      console.error('Error parsing LifeOS history data:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fullHistory, currentScope, categoryMap]);

  // Calculate total time
  const totalTime = useMemo(() => {
    return categoryStats.reduce((sum, stat) => sum + stat.totalMinutes / 60, 0);
  }, [categoryStats]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    // Could trigger navigation to detailed view or filter
    console.log('Category selected:', categoryId);
    // Integration point for future detailed views
  }, []);

  // Handle ball click
  const handleBallClick = useCallback((categoryId: string) => {
    handleCategorySelect(categoryId);
  }, [handleCategorySelect]);

  // Handle celebration
  const handleCelebration = useCallback((type: CelebrationType) => {
    console.log('🎉 Celebration triggered in LifeOS Integration:', type);
    // This will be handled by the CelebrationIntegration component
  }, []);

  return (
    <div className="lifeos-achievement-jar-integration">
      {/* Time Range Selector */}
      <div className="mb-6">
        <TimeRangeSelector 
          currentScope={currentScope}
          onScopeChange={onScopeChange}
        />
      </div>

      {/* Achievement Jar Container */}
      <AchievementJarContainer
        categoryStats={categoryStats}
        totalTime={totalTime}
        timeRange={currentScope}
        onBallClick={handleBallClick}
        onCategorySelect={handleCategorySelect}
        isEmpty={categoryStats.length === 0}
        isLoading={isLoading}
        className="lifeos-integrated"
      />

      {/* Celebration Integration System */}
      <div className="mt-6">
        <CelebrationIntegration
          onCelebrationComplete={() => console.log('🎊 Celebration completed')}
          className="celebration-integration-lifeos"
        />
      </div>
    </div>
  );
};

/**
 * Time Range Selector Component
 */
const TimeRangeSelector: React.FC<{
  currentScope: string;
  onScopeChange: (scope: 'today' | 'weekly' | 'monthly') => void;
}> = ({ currentScope, onScopeChange }) => {
  const timeRanges = [
    { key: 'today', label: '今日', icon: '📅' },
    { key: 'weekly', label: '本周', icon: '📊' },
    { key: 'monthly', label: '本月', icon: '📈' }
  ];

  return (
    <div className="flex gap-2 justify-center mb-4">
      {timeRanges.map(range => (
        <button
          key={range.key}
          onClick={() => onScopeChange(range.key as any)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition-all
            ${currentScope === range.key 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200' 
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }
          `}
        >
          <span className="mr-1">{range.icon}</span>
          {range.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Utility Functions for LifeOS Integration
 */

// Get date range based on scope (compatible with existing LifeOS logic)
function getDateRangeForScope(scope: string): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  switch (scope) {
    case 'today':
      return { start: today, end: today };
    
    case 'weekly': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return {
        start: startOfWeek.toISOString().split('T')[0],
        end: endOfWeek.toISOString().split('T')[0]
      };
    }
    
    case 'monthly': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      return {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
      };
    }
    
    default:
      return { start: today, end: today };
  }
}

// Get logs in date range (compatible with existing LifeOS function)
function getLogsInDateRange(fullHistory: string, startDate: string, endDate: string): string {
  if (!fullHistory) return "";
  
  const lines = fullHistory.split('\n');
  const filteredLines: string[] = [];
  const dateRegex = /(\d{4}-\d{1,2}-\d{1,2})/;
  
  lines.forEach(line => {
    const match = line.match(dateRegex);
    if (match) {
      const lineDate = match[1];
      const normalizedLineDate = normalizeDate(lineDate);
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = normalizeDate(endDate);
      
      if (normalizedLineDate >= normalizedStartDate && normalizedLineDate <= normalizedEndDate) {
        filteredLines.push(line);
      }
    }
  });
  
  return filteredLines.join('\n');
}

// Normalize date format for comparison
function normalizeDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

// Parse LifeOS history logs into structured entries
function parseHistoryLogs(logText: string): ParsedLogEntry[] {
  if (!logText) return [];
  
  const lines = logText.split('\n').filter(line => line.trim());
  const entries: ParsedLogEntry[] = [];
  
  lines.forEach(line => {
    try {
      // Parse LifeOS log format: [CATEGORY] YYYY-MM-DD: ICON NAME DURATION | START-END
      const categoryMatch = line.match(/^\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY|TRASH)\]/i);
      const dateMatch = line.match(/(\d{4}-\d{1,2}-\d{1,2})/);
      const timeMatch = line.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
      const durationMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:小时|h|分钟|min|m)/i);
      
      if (categoryMatch && dateMatch) {
        const category = categoryMatch[1].toLowerCase();
        const date = dateMatch[1];
        const startTime = timeMatch ? timeMatch[1] : '';
        const endTime = timeMatch ? timeMatch[2] : '';
        
        // Extract duration (convert to minutes)
        let duration = 0;
        if (durationMatch) {
          const value = parseFloat(durationMatch[1]);
          const unit = durationMatch[0].toLowerCase();
          if (unit.includes('小时') || unit.includes('h')) {
            duration = value * 60;
          } else {
            duration = value;
          }
        } else if (timeMatch) {
          // Calculate duration from time range
          duration = calculateDurationFromTimeRange(startTime, endTime);
        }
        
        // Extract icon and name
        const contentAfterDate = line.split(': ')[1] || '';
        const iconMatch = contentAfterDate.match(/^([^\s]+)/);
        const icon = iconMatch ? iconMatch[1] : '⏰';
        
        // Extract name (everything between icon and duration/time)
        let name = contentAfterDate
          .replace(/^[^\s]+\s*/, '') // Remove icon
          .replace(/\s*\d+(?:\.\d+)?\s*(?:小时|h|分钟|min|m).*$/, '') // Remove duration and after
          .replace(/\s*\|\s*\d{1,2}:\d{2}-\d{1,2}:\d{2}.*$/, '') // Remove time range and after
          .trim();
        
        if (!name) name = '未命名活动';
        
        entries.push({
          date,
          category,
          icon,
          name,
          duration,
          startTime,
          endTime
        });
      }
    } catch (error) {
      console.warn('Failed to parse log line:', line, error);
    }
  });
  
  return entries;
}

// Calculate duration from time range
function calculateDurationFromTimeRange(startTime: string, endTime: string): number {
  try {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight periods
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return endMinutes - startMinutes;
  } catch (error) {
    return 0;
  }
}

// Group parsed entries by category
function groupByCategory(entries: ParsedLogEntry[]): Record<string, ParsedLogEntry[]> {
  const groups: Record<string, ParsedLogEntry[]> = {};
  
  entries.forEach(entry => {
    if (!groups[entry.category]) {
      groups[entry.category] = [];
    }
    groups[entry.category].push(entry);
  });
  
  return groups;
}

// Get category information (compatible with LifeOS category system)
function getCategoryInfo(categoryId: string, categoryMap: Record<string, any>) {
  // Default category mappings
  const defaultCategories: Record<string, any> = {
    work: { name: '工作', icon: '💼', priority: 10 },
    study: { name: '学习', icon: '📚', priority: 9 },
    health: { name: '健康', icon: '🏃', priority: 8 },
    hobby: { name: '爱好', icon: '🎨', priority: 7 },
    life: { name: '生活', icon: '🏠', priority: 6 },
    entertainment: { name: '娱乐', icon: '🎮', priority: 5 },
    rest: { name: '休息', icon: '😴', priority: 4 },
    sleep: { name: '睡眠', icon: '🌙', priority: 3 }
  };
  
  // Check custom category map first
  if (categoryMap && categoryMap[categoryId]) {
    return categoryMap[categoryId];
  }
  
  // Fall back to default categories
  return defaultCategories[categoryId] || { 
    name: categoryId, 
    icon: '⏰', 
    priority: 0 
  };
}

// Export utility functions for use by other modules
export { 
  getDateRangeForScope,
  getLogsInDateRange,
  parseHistoryLogs,
  groupByCategory,
  getCategoryInfo
};

export default LifeOSAchievementJar;