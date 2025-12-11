/**
 * Empty State Handler Property Tests
 * Tests for Requirement 1.4
 * 
 * Property 9: Empty State Handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { 
  EmptyStateHandler, 
  EmptyStateDetector, 
  MotivationalEmptyState,
  LoadingState,
  ErrorState,
  useEmptyState 
} from './EmptyStateHandler';

// Mock data generators
const generateMockData = (count: number, categories: string[] = ['work', 'study'], timeRange: 'today' | 'week' | 'month' = 'today') => {
  const now = new Date();
  const data = [];
  
  for (let i = 0; i < count; i++) {
    let date: Date;
    
    switch (timeRange) {
      case 'today':
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(Math.random() * 24));
        break;
      case 'week':
        date = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        date = new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random() * 30));
        break;
    }
    
    data.push({
      id: i,
      date: date.toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      duration: Math.floor(Math.random() * 3600) + 300, // 5 minutes to 1 hour
      title: `Task ${i + 1}`
    });
  }
  
  return data;
};

const mockCategoryMap = {
  work: { name: '工作', color: '#667eea' },
  study: { name: '学习', color: '#764ba2' },
  exercise: { name: '运动', color: '#f093fb' },
  rest: { name: '休息', color: '#4facfe' }
};

describe('Empty State Handler Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 9: Empty State Handling
   * Verifies Requirement 1.4
   */
  describe('Property 9: Empty State Handling', () => {
    test('should detect no-data state correctly', () => {
      const analysis = EmptyStateDetector.analyzeData([], mockCategoryMap, 'today');
      
      expect(analysis.type).toBe('no-data');
      expect(analysis.severity).toBe('high');
      expect(analysis.suggestions).toContain('create-timer');
    });

    test('should detect minimal-data state correctly', () => {
      const minimalData = generateMockData(2, ['work'], 'today');
      const analysis = EmptyStateDetector.analyzeData(minimalData, mockCategoryMap, 'today');
      
      expect(analysis.type).toBe('minimal-data');
      expect(analysis.severity).toBe('low');
      expect(analysis.dataCount).toBe(2);
    });

    test('should detect single-category state correctly', () => {
      const singleCategoryData = generateMockData(10, ['work'], 'today');
      const analysis = EmptyStateDetector.analyzeData(singleCategoryData, mockCategoryMap, 'today');
      
      expect(analysis.type).toBe('single-category');
      expect(analysis.category).toBe('work');
      expect(analysis.suggestions).toContain('diversify-activities');
    });

    test('should detect sufficient data correctly', () => {
      const sufficientData = generateMockData(10, ['work', 'study', 'exercise'], 'today');
      const analysis = EmptyStateDetector.analyzeData(sufficientData, mockCategoryMap, 'today');
      
      expect(analysis.type).toBe('sufficient');
      expect(analysis.severity).toBe('none');
      expect(analysis.dataCount).toBe(10);
      expect(analysis.categoryCount).toBe(3);
    });

    test('should handle different time ranges correctly', () => {
      const todayData = generateMockData(5, ['work'], 'today');
      const weekData = generateMockData(5, ['work'], 'week');
      
      // Test today range with week data (should show no-data)
      const todayAnalysis = EmptyStateDetector.analyzeData(weekData, mockCategoryMap, 'today');
      expect(todayAnalysis.type).toBe('no-data');
      expect(todayAnalysis.timeRange).toBe('today');
      
      // Test week range with week data (should show data)
      const weekAnalysis = EmptyStateDetector.analyzeData(weekData, mockCategoryMap, 'week');
      expect(weekAnalysis.type).toBe('single-category');
    });

    test('should generate appropriate empty state configurations', () => {
      // No data config
      const noDataAnalysis = { type: 'no-data' as const, severity: 'high' as const, suggestions: ['create-timer'] };
      const noDataConfig = EmptyStateDetector.getEmptyStateConfig(noDataAnalysis);
      
      expect(noDataConfig?.title).toContain('还没有任何数据');
      expect(noDataConfig?.actionText).toBe('创建计时器');
      expect(noDataConfig?.illustration).toBe('🏺');

      // Minimal data config
      const minimalAnalysis = { type: 'minimal-data' as const, severity: 'low' as const, dataCount: 2, suggestions: ['continue-tracking'] };
      const minimalConfig = EmptyStateDetector.getEmptyStateConfig(minimalAnalysis);
      
      expect(minimalConfig?.title).toBe('数据较少');
      expect(minimalConfig?.message).toContain('2 条记录');
      expect(minimalConfig?.illustration).toBe('🌱');

      // Single category config
      const singleAnalysis = { type: 'single-category' as const, severity: 'low' as const, category: 'work', suggestions: ['diversify-activities'] };
      const singleConfig = EmptyStateDetector.getEmptyStateConfig(singleAnalysis);
      
      expect(singleConfig?.title).toBe('单一分类');
      expect(singleConfig?.message).toContain('work');
      expect(singleConfig?.illustration).toBe('🎨');
    });

    test('should render motivational empty state with correct content', async () => {
      const mockAction = vi.fn();
      
      render(
        <MotivationalEmptyState
          type="no-data"
          title="测试标题"
          message="测试消息"
          actionText="测试按钮"
          onAction={mockAction}
          illustration="🎯"
        />
      );

      expect(screen.getByText('测试标题')).toBeInTheDocument();
      expect(screen.getByText('测试消息')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
      
      const actionButton = screen.getByText('测试按钮');
      expect(actionButton).toBeInTheDocument();
      
      fireEvent.click(actionButton);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    test('should display motivational quotes correctly', async () => {
      render(
        <MotivationalEmptyState
          type="no-data"
          title="测试"
          message="测试"
        />
      );

      // Should display a motivational quote
      await waitFor(() => {
        const quoteElements = screen.getAllByText(/.*/, { selector: 'div' });
        const hasQuote = quoteElements.some(el => 
          el.textContent?.includes('每一个伟大的成就') ||
          el.textContent?.includes('千里之行') ||
          el.textContent?.includes('今天是你余生') ||
          el.textContent?.includes('成功的秘诀')
        );
        expect(hasQuote).toBe(true);
      });
    });

    test('should render loading state correctly', () => {
      render(<LoadingState message="自定义加载消息" />);
      
      expect(screen.getByText(/自定义加载消息/)).toBeInTheDocument();
      
      // Should have loading spinner
      const spinner = document.querySelector('[style*="animation"]');
      expect(spinner).toBeInTheDocument();
    });

    test('should render error state correctly', () => {
      const mockRetry = vi.fn();
      const testError = new Error('测试错误');
      
      render(<ErrorState error={testError} onRetry={mockRetry} />);
      
      expect(screen.getByText('哎呀，出了点问题')).toBeInTheDocument();
      expect(screen.getByText(/测试错误/)).toBeInTheDocument();
      
      const retryButton = screen.getByText('重试');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    test('should handle empty state handler with no data', async () => {
      const mockCreateTimer = vi.fn();
      
      render(
        <EmptyStateHandler
          fullHistory={[]}
          categoryMap={mockCategoryMap}
          timeRange="today"
          onCreateTimer={mockCreateTimer}
        >
          <div data-testid="normal-content">正常内容</div>
        </EmptyStateHandler>
      );

      // Should show loading first
      expect(screen.getByText(/正在分析你的数据/)).toBeInTheDocument();

      // Wait for loading to complete and empty state to show
      await waitFor(() => {
        expect(screen.getByText(/还没有任何数据/)).toBeInTheDocument();
      });

      // Should not show normal content
      expect(screen.queryByTestId('normal-content')).not.toBeInTheDocument();

      // Should have create timer button
      const createButton = screen.getByText('创建计时器');
      fireEvent.click(createButton);
      expect(mockCreateTimer).toHaveBeenCalledTimes(1);
    });

    test('should handle empty state handler with sufficient data', async () => {
      const sufficientData = generateMockData(10, ['work', 'study', 'exercise'], 'today');
      
      render(
        <EmptyStateHandler
          fullHistory={sufficientData}
          categoryMap={mockCategoryMap}
          timeRange="today"
        >
          <div data-testid="normal-content">正常内容</div>
        </EmptyStateHandler>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('normal-content')).toBeInTheDocument();
      });

      // Should not show empty state
      expect(screen.queryByText(/还没有任何数据/)).not.toBeInTheDocument();
    });

    test('should handle error state in empty state handler', async () => {
      const mockRetry = vi.fn();
      
      // Mock console.error to avoid test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <EmptyStateHandler
          fullHistory={null as any} // This should cause an error
          categoryMap={mockCategoryMap}
          timeRange="today"
          onRetry={mockRetry}
        >
          <div data-testid="normal-content">正常内容</div>
        </EmptyStateHandler>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('哎呀，出了点问题')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    test('should use empty state hook correctly', () => {
      const TestComponent = ({ data, timeRange }: { data: any[], timeRange: string }) => {
        const { isEmpty, analysis, emptyStateConfig, isLoading } = useEmptyState(data, timeRange, mockCategoryMap);
        
        if (isLoading) return <div>Loading...</div>;
        if (isEmpty && emptyStateConfig) {
          return <div data-testid="empty-state">{emptyStateConfig.title}</div>;
        }
        return <div data-testid="has-data">Has Data</div>;
      };

      // Test with no data
      const { rerender } = render(<TestComponent data={[]} timeRange="today" />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();

      // Test with sufficient data
      const sufficientData = generateMockData(10, ['work', 'study'], 'today');
      rerender(<TestComponent data={sufficientData} timeRange="today" />);
      expect(screen.getByTestId('has-data')).toBeInTheDocument();
    });

    test('should handle animation states correctly', async () => {
      const TestComponent = () => {
        const [show, setShow] = React.useState(false);
        
        React.useEffect(() => {
          const timer = setTimeout(() => setShow(true), 100);
          return () => clearTimeout(timer);
        }, []);

        if (!show) return null;

        return (
          <MotivationalEmptyState
            type="no-data"
            title="动画测试"
            message="测试动画效果"
          />
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByText('动画测试')).toBeInTheDocument();
      });

      // Check if animation classes are applied
      const container = screen.getByText('动画测试').closest('.motivational-empty-state');
      expect(container).toBeInTheDocument();
    });

    test('should handle different time range labels correctly', () => {
      const todayAnalysis = EmptyStateDetector.analyzeData([], mockCategoryMap, 'today');
      const todayConfig = EmptyStateDetector.getEmptyStateConfig(todayAnalysis);
      expect(todayConfig?.title).toContain('今天');

      const weekAnalysis = EmptyStateDetector.analyzeData([], mockCategoryMap, 'week');
      const weekConfig = EmptyStateDetector.getEmptyStateConfig(weekAnalysis);
      expect(weekConfig?.title).toContain('本周');

      const monthAnalysis = EmptyStateDetector.analyzeData([], mockCategoryMap, 'month');
      const monthConfig = EmptyStateDetector.getEmptyStateConfig(monthAnalysis);
      expect(monthConfig?.title).toContain('本月');
    });
  });

  /**
   * Edge Cases and Error Handling
   */
  describe('Edge Cases and Error Handling', () => {
    test('should handle malformed data gracefully', () => {
      const malformedData = [
        { /* missing required fields */ },
        { date: 'invalid-date', category: null },
        { date: new Date().toISOString(), category: 'work', duration: 'invalid' }
      ];

      expect(() => {
        EmptyStateDetector.analyzeData(malformedData, mockCategoryMap, 'today');
      }).not.toThrow();
    });

    test('should handle null/undefined inputs gracefully', () => {
      expect(() => {
        EmptyStateDetector.analyzeData(null as any, {}, 'today');
      }).not.toThrow();

      expect(() => {
        EmptyStateDetector.analyzeData([], null as any, 'today');
      }).not.toThrow();

      expect(() => {
        EmptyStateDetector.analyzeData([], {}, null as any);
      }).not.toThrow();
    });

    test('should handle very large datasets efficiently', () => {
      const largeData = generateMockData(10000, ['work', 'study'], 'month');
      
      const startTime = performance.now();
      const analysis = EmptyStateDetector.analyzeData(largeData, mockCategoryMap, 'month');
      const endTime = performance.now();
      
      expect(analysis.type).toBe('sufficient');
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    test('should handle empty category map gracefully', () => {
      const data = generateMockData(5, ['unknown-category'], 'today');
      const analysis = EmptyStateDetector.analyzeData(data, {}, 'today');
      
      expect(analysis.type).toBe('single-category');
      expect(analysis.category).toBe('unknown-category');
    });
  });

  /**
   * Integration Tests
   */
  describe('Integration Tests', () => {
    test('should integrate with Achievement Jar components', async () => {
      const TestIntegration = () => (
        <EmptyStateHandler
          fullHistory={[]}
          categoryMap={mockCategoryMap}
          timeRange="today"
        >
          <div className="achievement-jar-container">
            <div className="clay-balls">Clay Balls</div>
            <div className="metrics-tray">Metrics</div>
          </div>
        </EmptyStateHandler>
      );

      render(<TestIntegration />);

      await waitFor(() => {
        expect(screen.getByText(/还没有任何数据/)).toBeInTheDocument();
      });
    });

    test('should maintain consistent styling with main app', async () => {
      render(
        <MotivationalEmptyState
          type="no-data"
          title="样式测试"
          message="测试样式一致性"
          className="custom-class"
        />
      );

      const container = screen.getByText('样式测试').closest('.motivational-empty-state');
      expect(container).toHaveClass('custom-class');
    });
  });
});