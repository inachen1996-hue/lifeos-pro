/**
 * Empty State Handler
 * Handles empty states and edge cases for Achievement Jar
 * Implements Requirement 1.4
 */

import React, { useState, useEffect, useCallback } from 'react';
import { generateFrostedGlassStyle, airyMacaronColors } from './AiryMacaronStyles';

interface EmptyStateProps {
  type: 'no-data' | 'loading' | 'error' | 'single-category' | 'minimal-data';
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
  className?: string;
}

interface EmptyStateHandlerProps {
  children: React.ReactNode;
  fullHistory: any[];
  categoryMap: Record<string, any>;
  timeRange: string;
  onRetry?: () => void;
  onCreateTimer?: () => void;
  className?: string;
}

/**
 * Empty State Detection Utility
 */
export class EmptyStateDetector {
  /**
   * Analyze data and determine empty state type
   */
  static analyzeData(fullHistory: any[], categoryMap: Record<string, any>, timeRange: string) {
    // No data at all
    if (!fullHistory || fullHistory.length === 0) {
      return {
        type: 'no-data' as const,
        severity: 'high',
        suggestions: ['create-timer', 'import-data']
      };
    }

    // Filter data by time range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredData = fullHistory.filter(item => {
      const itemDate = new Date(item.date || item.timestamp || item.time);
      return itemDate >= startDate;
    });

    // No data for selected time range
    if (filteredData.length === 0) {
      return {
        type: 'no-data' as const,
        severity: 'medium',
        timeRange,
        suggestions: ['expand-range', 'create-timer']
      };
    }

    // Very minimal data (less than 3 entries)
    if (filteredData.length < 3) {
      return {
        type: 'minimal-data' as const,
        severity: 'low',
        dataCount: filteredData.length,
        suggestions: ['continue-tracking']
      };
    }

    // Single category only
    const categories = new Set(filteredData.map(item => item.category || 'uncategorized'));
    if (categories.size === 1) {
      return {
        type: 'single-category' as const,
        severity: 'low',
        category: Array.from(categories)[0],
        suggestions: ['diversify-activities']
      };
    }

    // Data looks good
    return {
      type: 'sufficient' as const,
      severity: 'none',
      dataCount: filteredData.length,
      categoryCount: categories.size
    };
  }

  /**
   * Get appropriate empty state configuration
   */
  static getEmptyStateConfig(analysis: ReturnType<typeof EmptyStateDetector.analyzeData>) {
    switch (analysis.type) {
      case 'no-data':
        return {
          title: analysis.timeRange 
            ? `${this.getTimeRangeLabel(analysis.timeRange)}暂无数据` 
            : '还没有任何数据',
          message: analysis.timeRange
            ? `在${this.getTimeRangeLabel(analysis.timeRange)}内没有找到任何计时记录。试试创建一个新的计时器开始记录吧！`
            : '看起来你还没有开始使用计时功能。创建第一个计时器，开始你的效率之旅！',
          actionText: '创建计时器',
          illustration: '🏺'
        };

      case 'minimal-data':
        return {
          title: '数据较少',
          message: `当前只有 ${analysis.dataCount} 条记录。继续使用计时器，让你的成就罐子更加丰富多彩！`,
          actionText: '继续计时',
          illustration: '🌱'
        };

      case 'single-category':
        return {
          title: '单一分类',
          message: `目前只记录了「${analysis.category}」分类的活动。尝试添加更多不同类型的活动，让生活更加平衡！`,
          actionText: '添加新分类',
          illustration: '🎨'
        };

      default:
        return null;
    }
  }

  private static getTimeRangeLabel(timeRange: string): string {
    switch (timeRange) {
      case 'today': return '今天';
      case 'week': return '本周';
      case 'month': return '本月';
      default: return '当前时间范围';
    }
  }
}

/**
 * Motivational Empty State Component
 */
export const MotivationalEmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  message,
  actionText,
  onAction,
  illustration,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');

  // Motivational quotes for different states
  const quotes = {
    'no-data': [
      '每一个伟大的成就都始于决定去尝试。',
      '千里之行，始于足下。',
      '今天是你余生的第一天。',
      '成功的秘诀就是开始行动。'
    ],
    'loading': [
      '好事即将发生...',
      '正在为你准备精彩内容...',
      '马上就好...'
    ],
    'error': [
      '暂时的挫折不会阻止坚定的心。',
      '每个问题都是伪装的机会。',
      '重新开始，永远不会太晚。'
    ],
    'single-category': [
      '多样性是生活的调味料。',
      '平衡的生活带来持久的快乐。',
      '尝试新事物，发现新的自己。'
    ],
    'minimal-data': [
      '坚持就是胜利。',
      '每一小步都在接近目标。',
      '持续的努力创造奇迹。'
    ]
  };

  useEffect(() => {
    const typeQuotes = quotes[type] || quotes['no-data'];
    const randomQuote = typeQuotes[Math.floor(Math.random() * typeQuotes.length)];
    setMotivationalQuote(randomQuote);

    // Trigger animation
    const timer = setTimeout(() => setIsAnimating(true), 100);
    return () => clearTimeout(timer);
  }, [type]);

  const handleAction = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onAction?.();
      setIsAnimating(true);
    }, 200);
  };

  const containerStyle = {
    ...generateFrostedGlassStyle('light'),
    padding: '48px 32px',
    textAlign: 'center' as const,
    maxWidth: '500px',
    margin: '0 auto',
    transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
    opacity: isAnimating ? 1 : 0,
    transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  };

  const illustrationStyle = {
    fontSize: '64px',
    marginBottom: '24px',
    display: 'block',
    animation: 'gentle-float 3s ease-in-out infinite'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#64748b',
    marginBottom: '16px',
    lineHeight: '1.4'
  };

  const messageStyle = {
    fontSize: '16px',
    color: '#94a3b8',
    lineHeight: '1.6',
    marginBottom: '24px'
  };

  const quoteStyle = {
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#a0aec0',
    marginBottom: '32px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '12px',
    borderLeft: '4px solid #667eea'
  };

  const actionButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(0)'
  };

  return (
    <div className={`motivational-empty-state ${className}`} style={containerStyle}>
      <div style={illustrationStyle}>{illustration}</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={messageStyle}>{message}</p>
      <div style={quoteStyle}>"{motivationalQuote}"</div>
      {actionText && onAction && (
        <button
          style={actionButtonStyle}
          onClick={handleAction}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

/**
 * Loading State Component
 */
export const LoadingState: React.FC<{ message?: string }> = ({ 
  message = '正在加载你的成就...' 
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '24px'
      }} />
      <div style={{
        fontSize: '18px',
        color: '#64748b',
        fontWeight: '500'
      }}>
        {message}{dots}
      </div>
    </div>
  );
};

/**
 * Error State Component
 */
export const ErrorState: React.FC<{
  error?: Error | string;
  onRetry?: () => void;
}> = ({ 
  error, 
  onRetry 
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || '发生了未知错误';

  return (
    <MotivationalEmptyState
      type="error"
      title="哎呀，出了点问题"
      message={`${errorMessage}。不用担心，我们可以重试一下。`}
      actionText="重试"
      onAction={onRetry}
      illustration="🔧"
    />
  );
};

/**
 * Main Empty State Handler Component
 */
export const EmptyStateHandler: React.FC<EmptyStateHandlerProps> = ({
  children,
  fullHistory,
  categoryMap,
  timeRange,
  onRetry,
  onCreateTimer,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate loading and error handling
    const timer = setTimeout(() => {
      try {
        setIsLoading(false);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fullHistory, timeRange]);

  // Show loading state
  if (isLoading) {
    return <LoadingState message="正在分析你的数据..." />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Analyze data for empty states
  const analysis = EmptyStateDetector.analyzeData(fullHistory, categoryMap, timeRange);
  
  // Show appropriate empty state
  if (analysis.type !== 'sufficient') {
    const config = EmptyStateDetector.getEmptyStateConfig(analysis);
    
    if (config) {
      return (
        <div className={`empty-state-handler ${className}`}>
          <MotivationalEmptyState
            type={analysis.type}
            title={config.title}
            message={config.message}
            actionText={config.actionText}
            onAction={onCreateTimer}
            illustration={config.illustration}
          />
        </div>
      );
    }
  }

  // Show normal content
  return <>{children}</>;
};

/**
 * Hook for empty state management
 */
export const useEmptyState = (
  data: any[], 
  timeRange: string,
  categoryMap: Record<string, any> = {}
) => {
  const [analysis, setAnalysis] = useState<ReturnType<typeof EmptyStateDetector.analyzeData> | null>(null);

  useEffect(() => {
    const newAnalysis = EmptyStateDetector.analyzeData(data, categoryMap, timeRange);
    setAnalysis(newAnalysis);
  }, [data, timeRange, categoryMap]);

  const isEmpty = analysis?.type !== 'sufficient';
  const emptyStateConfig = analysis ? EmptyStateDetector.getEmptyStateConfig(analysis) : null;

  return {
    isEmpty,
    analysis,
    emptyStateConfig,
    isLoading: !analysis
  };
};

export default EmptyStateHandler;