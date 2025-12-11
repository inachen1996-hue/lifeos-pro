/**
 * Main App Progress Integration
 * Replaces the existing progress page implementation in index.html
 * Implements Requirements 1.1, 1.2, 1.3
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AchievementJarProgressPage } from './AchievementJarProgressPage';
import { EmptyStateHandler } from './EmptyStateHandler';
import { VisualConsistencyIntegration } from './VisualConsistencyIntegration';
import { MobileOptimization } from './MobileOptimization';
import { DataCachingProvider } from './DataCaching';
import { CodeSplittingProvider } from './CodeSplitting';

interface MainAppProgressIntegrationProps {
  fullHistory: string;
  progressScope: 'today' | 'week' | 'month';
  onScopeChange: (scope: 'today' | 'week' | 'month') => void;
  categoryMap: Record<string, any>;
  customSounds: Record<string, string>;
  danmakus: any[];
  setDanmakus: (danmakus: any[]) => void;
  playSound: (type: string) => void;
  className?: string;
}

interface ProgressStats {
  [category: string]: number;
}

interface ProgressItem {
  id: number;
  date: string;
  category: string;
  duration: number;
  description: string;
}

/**
 * Data Processing Utilities
 * Maintains compatibility with existing data format
 */
export class ProgressDataProcessor {
  /**
   * Get date ranges for scope (maintains existing logic)
   */
  static getDateRangesForScope(scope: 'today' | 'week' | 'month') {
    const now = new Date();
    let currentStart: Date, currentEnd: Date;

    switch (scope) {
      case 'today':
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        monday.setHours(0, 0, 0, 0);
        currentStart = monday;
        currentEnd = new Date(monday);
        currentEnd.setDate(monday.getDate() + 6);
        currentEnd.setHours(23, 59, 59);
        break;
      case 'month':
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      default:
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    return { currentStart, currentEnd };
  }

  /**
   * Get logs in date range (maintains existing logic)
   */
  static getLogsInDateRange(fullHistory: string, startDate: Date, endDate: Date): string {
    if (!fullHistory) return '';

    const lines = fullHistory.split('\n');
    const filteredLines = lines.filter(line => {
      const dateMatch = line.match(/(\d{4}-\d{1,2}-\d{1,2})/);
      if (!dateMatch) return false;

      const lineDate = new Date(dateMatch[1]);
      return lineDate >= startDate && lineDate <= endDate;
    });

    return filteredLines.join('\n');
  }

  /**
   * Calculate stats from logs (maintains existing logic)
   */
  static calculateStatsFromLogs(logsInRange: string): ProgressStats {
    const stats: ProgressStats = {};
    
    if (!logsInRange) return stats;

    const lines = logsInRange.split('\n').filter(l => l.trim());
    
    lines.forEach(line => {
      const categoryMatch = line.match(/\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]/i);
      const durationMatch = line.match(/(\d+(\.\d+)?)\s*(h|m|min|hour)/i);
      
      if (categoryMatch && durationMatch) {
        const category = categoryMatch[1].toLowerCase();
        const val = parseFloat(durationMatch[1]);
        const unit = durationMatch[3].toLowerCase();
        const duration = unit.startsWith('m') ? val / 60 : val;
        
        stats[category] = (stats[category] || 0) + duration;
      }
    });

    return stats;
  }

  /**
   * Parse items from logs (maintains existing logic)
   */
  static parseItemsFromLogs(logsInRange: string): ProgressItem[] {
    if (!logsInRange) return [];

    const items = logsInRange.split('\n').filter(l => l.trim()).map((line, idx) => {
      const dateMatch = line.match(/(\d{4}-\d{1,2}-\d{1,2})/);
      const durationMatch = line.match(/(\d+(\.\d+)?)\s*(h|m|min|hour)/i);
      const categoryMatch = line.match(/\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]/i);
      
      let duration = 0;
      if (durationMatch) {
        const val = parseFloat(durationMatch[1]);
        const unit = durationMatch[3].toLowerCase();
        duration = unit.startsWith('m') ? val / 60 : val;
      }
      
      const description = line
        .replace(/\d{4}-\d{1,2}-\d{1,2}:\s*/, '')
        .replace(/\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]\s*/i, '')
        .replace(/\d+(\.\d+)?\s*(h|m|min|hour)/i, '')
        .trim();
      
      return {
        id: idx,
        date: dateMatch ? dateMatch[1] : '',
        category: categoryMatch ? categoryMatch[1].toLowerCase() : 'work',
        duration,
        description
      };
    }).filter(item => item.duration > 0);

    return items;
  }

  /**
   * Convert to Achievement Jar format
   */
  static convertToAchievementJarFormat(items: ProgressItem[], categoryMap: Record<string, any>) {
    return items.map(item => ({
      id: item.id.toString(),
      timestamp: new Date(item.date).toISOString(),
      category: item.category,
      duration: item.duration * 3600, // Convert hours to seconds
      title: item.description,
      metadata: {
        originalFormat: true,
        source: 'lifeos'
      }
    }));
  }
}

/**
 * Legacy Compatibility Layer
 * Maintains existing functionality while integrating Achievement Jar
 */
export const LegacyCompatibilityLayer: React.FC<{
  children: React.ReactNode;
  items: ProgressItem[];
  stats: ProgressStats;
  totalHours: number;
  onPlaySound: (type: string) => void;
  onGenerateDanmaku: () => void;
}> = ({ 
  children, 
  items, 
  stats, 
  totalHours, 
  onPlaySound, 
  onGenerateDanmaku 
}) => {
  // Legacy categories mapping
  const CATEGORIES = [
    { id: 'work', name: '工作', color: 'bg-blue-500' },
    { id: 'study', name: '学习', color: 'bg-green-500' },
    { id: 'rest', name: '休息', color: 'bg-purple-500' },
    { id: 'sleep', name: '睡眠', color: 'bg-indigo-500' },
    { id: 'life', name: '生活', color: 'bg-yellow-500' },
    { id: 'entertainment', name: '娱乐', color: 'bg-pink-500' },
    { id: 'health', name: '健康', color: 'bg-red-500' },
    { id: 'hobby', name: '爱好', color: 'bg-orange-500' }
  ];

  return (
    <div className="legacy-compatibility-layer">
      {/* Achievement Jar Integration */}
      <div className="achievement-jar-section mb-8">
        {children}
      </div>

      {/* Legacy Celebration Buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          🎉 庆祝成就
        </h3>
        <p className="text-slate-600 mb-4">
          为你的努力喝彩！点击按钮播放庆祝音效和弹幕。
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => { onPlaySound('cheer'); onGenerateDanmaku(); }}
            className="px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl font-bold shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105 flex items-center gap-2"
          >
            🎉 喝彩
          </button>
          <button 
            onClick={() => { onPlaySound('clap'); onGenerateDanmaku(); }}
            className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-bold shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105 flex items-center gap-2"
          >
            👏 鼓掌
          </button>
          <button 
            onClick={() => { onPlaySound('drum'); onGenerateDanmaku(); }}
            className="px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-xl font-bold shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105 flex items-center gap-2"
          >
            🥁 打鼓
          </button>
        </div>
      </div>

      {/* Legacy Completed Items List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          已完成事项 ({items.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-slate-400 py-8">暂无完成记录</p>
          ) : (
            items.map(item => {
              const cat = CATEGORIES.find(c => c.id === item.category);
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${cat?.color || 'bg-gray-500'}`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-700">{item.description}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.date}</div>
                  </div>
                  <div className="text-sm font-bold text-slate-600">{item.duration.toFixed(1)}h</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Main App Progress Integration Component
 */
export const MainAppProgressIntegration: React.FC<MainAppProgressIntegrationProps> = ({
  fullHistory,
  progressScope,
  onScopeChange,
  categoryMap,
  customSounds,
  danmakus,
  setDanmakus,
  playSound,
  className = ''
}) => {
  const [enableAchievementJar, setEnableAchievementJar] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Process data using existing logic
  const processedData = useMemo(() => {
    const { currentStart, currentEnd } = ProgressDataProcessor.getDateRangesForScope(progressScope);
    const logsInRange = ProgressDataProcessor.getLogsInDateRange(fullHistory, currentStart, currentEnd);
    const stats = ProgressDataProcessor.calculateStatsFromLogs(logsInRange);
    const items = ProgressDataProcessor.parseItemsFromLogs(logsInRange);
    const totalHours = Object.values(stats).reduce((a, b) => a + b, 0);
    
    // Convert to Achievement Jar format
    const achievementJarData = ProgressDataProcessor.convertToAchievementJarFormat(items, categoryMap);

    return {
      logsInRange,
      stats,
      items,
      totalHours,
      achievementJarData
    };
  }, [fullHistory, progressScope, categoryMap]);

  // Generate danmaku (maintains existing logic)
  const generateDanmaku = useCallback(() => {
    const DANMAKU_MESSAGES = [
      "太棒了！继续保持！ 💪",
      "你真的很努力！ ✨",
      "每一分努力都值得！ 🌟",
      "进步就是最好的奖励！ 🎯",
      "坚持就是胜利！ 🏆",
      "你的努力让人敬佩！ 👏",
      "成功属于坚持的人！ 🚀",
      "每天进步一点点！ 📈"
    ];

    const shuffled = [...DANMAKU_MESSAGES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    
    const newDanmakus = selected.map((text, index) => ({
      id: Date.now() + index,
      text,
      top: 15 + index * 20 + Math.random() * 10,
      duration: 4 + Math.random() * 1.5,
      delay: 0
    }));
    
    setDanmakus([...danmakus, ...newDanmakus]);
    
    setTimeout(() => {
      setDanmakus(prev => prev.filter(d => !newDanmakus.find(nd => nd.id === d.id)));
    }, 6000);
  }, [danmakus, setDanmakus]);

  // Initialize
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600">正在加载进度数据...</div>
        </div>
      </div>
    );
  }

  return (
    <CodeSplittingProvider enableLazyLoading={true}>
      <DataCachingProvider enableMemoryOptimization={true}>
        <VisualConsistencyIntegration>
          <MobileOptimization>
            <div className={`main-app-progress-integration ${className}`}>
              <EmptyStateHandler
                fullHistory={processedData.achievementJarData}
                categoryMap={categoryMap}
                timeRange={progressScope}
                onCreateTimer={() => {
                  // Trigger main app's create timer functionality
                  console.log('Create timer triggered from Achievement Jar');
                }}
              >
                {enableAchievementJar ? (
                  <LegacyCompatibilityLayer
                    items={processedData.items}
                    stats={processedData.stats}
                    totalHours={processedData.totalHours}
                    onPlaySound={playSound}
                    onGenerateDanmaku={generateDanmaku}
                  >
                    <AchievementJarProgressPage
                      fullHistory={processedData.achievementJarData}
                      categoryMap={categoryMap}
                      progressScope={progressScope}
                      onScopeChange={onScopeChange}
                    />
                  </LegacyCompatibilityLayer>
                ) : (
                  <LegacyCompatibilityLayer
                    items={processedData.items}
                    stats={processedData.stats}
                    totalHours={processedData.totalHours}
                    onPlaySound={playSound}
                    onGenerateDanmaku={generateDanmaku}
                  >
                    <div className="text-center py-8">
                      <div className="text-slate-600 mb-4">Achievement Jar 已禁用</div>
                      <button
                        onClick={() => setEnableAchievementJar(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        启用 Achievement Jar
                      </button>
                    </div>
                  </LegacyCompatibilityLayer>
                )}
              </EmptyStateHandler>

              {/* Toggle Achievement Jar */}
              <div className="fixed bottom-4 right-4 z-50">
                <button
                  onClick={() => setEnableAchievementJar(!enableAchievementJar)}
                  className={`p-3 rounded-full shadow-lg transition-all ${
                    enableAchievementJar 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                  title={enableAchievementJar ? '禁用 Achievement Jar' : '启用 Achievement Jar'}
                >
                  🏺
                </button>
              </div>
            </div>
          </MobileOptimization>
        </VisualConsistencyIntegration>
      </DataCachingProvider>
    </CodeSplittingProvider>
  );
};

export default MainAppProgressIntegration;