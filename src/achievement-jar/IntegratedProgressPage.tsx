/**
 * Achievement Jar Integration - Integrated Progress Page
 * Main component that replaces the traditional progress page in LifeOS
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataAdapter, AdaptedProgressData } from './DataAdapter.js';
import { TimeRangeProcessor } from './TimeRangeProcessor.js';
import { ValidationUtils } from './ValidationUtils.js';
import { LifeOSAchievementJar } from './LifeOSIntegration.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import LoadingStates from './LoadingStates.js';
import { TimeRange } from './types.js';

export interface IntegratedProgressPageProps {
  progressScope: TimeRange;
  fullHistory: string;
  categories: any[];
  customSounds?: Record<string, string>;
  onScopeChange: (scope: TimeRange) => void;
  className?: string;
  enableAchievementJar?: boolean;
  fallbackComponent?: React.ComponentType<any>;
}

interface ProgressPageState {
  isAchievementJarEnabled: boolean;
  isLoading: boolean;
  error: Error | null;
  fallbackMode: boolean;
  adaptedData: AdaptedProgressData | null;
}

/**
 * Integrated Progress Page component that conditionally renders Achievement Jar or fallback UI
 */
export const IntegratedProgressPage: React.FC<IntegratedProgressPageProps> = ({
  progressScope,
  fullHistory,
  categories,
  customSounds = {},
  onScopeChange,
  className = '',
  enableAchievementJar = true,
  fallbackComponent: FallbackComponent
}) => {
  const [state, setState] = useState<ProgressPageState>({
    isAchievementJarEnabled: enableAchievementJar,
    isLoading: true,
    error: null,
    fallbackMode: false,
    adaptedData: null
  });

  // Initialize data adapter
  const dataAdapter = useMemo(() => new DataAdapter({
    enableAchievementJar: enableAchievementJar,
    fallbackOnError: true,
    performanceThreshold: 30,
    enablePhysics: true,
    enableCelebrationEffects: true
  }), [enableAchievementJar]);

  // Process data when inputs change
  const processData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Filter logs by time range
      const filteredLogs = TimeRangeProcessor.getLogsForTimeRange(fullHistory, progressScope);
      
      // Transform data using adapter
      const adaptedData = dataAdapter.transformProgressData(filteredLogs, progressScope, categories);
      
      // Validate the adapted data
      const validation = ValidationUtils.validateAdaptedProgressData(adaptedData);
      if (!validation.isValid) {
        console.warn('Data validation failed:', validation.errors);
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      setState(prev => ({
        ...prev,
        adaptedData,
        isLoading: false,
        fallbackMode: false
      }));

    } catch (error) {
      console.error('IntegratedProgressPage: Data processing failed:', error);
      
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
        fallbackMode: true,
        adaptedData: ValidationUtils.getFallbackData(progressScope)
      }));
    }
  }, [fullHistory, progressScope, categories, dataAdapter]);

  // Process data on mount and when dependencies change
  useEffect(() => {
    processData();
  }, [processData]);

  // Handle scope changes
  const handleScopeChange = useCallback((newScope: TimeRange) => {
    onScopeChange(newScope);
  }, [onScopeChange]);

  // Handle Achievement Jar errors
  const handleAchievementJarError = useCallback((error: Error) => {
    console.error('Achievement Jar error:', error);
    setState(prev => ({
      ...prev,
      error,
      fallbackMode: true
    }));
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      fallbackMode: false,
      isAchievementJarEnabled: enableAchievementJar
    }));
    processData();
  }, [processData, enableAchievementJar]);

  // Render loading state
  if (state.isLoading) {
    return (
      <div className={`integrated-progress-page ${className}`}>
        <LoadingStates.AchievementJarLoading />
      </div>
    );
  }

  // Render fallback component if provided and in fallback mode
  if (state.fallbackMode && FallbackComponent) {
    return (
      <div className={`integrated-progress-page fallback-mode ${className}`}>
        <FallbackComponent
          progressScope={progressScope}
          fullHistory={fullHistory}
          categories={categories}
          onScopeChange={handleScopeChange}
          error={state.error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Render traditional progress cards as fallback
  if (state.fallbackMode || !state.isAchievementJarEnabled || !state.adaptedData) {
    return (
      <div className={`integrated-progress-page traditional-fallback ${className}`}>
        <TraditionalProgressFallback
          adaptedData={state.adaptedData}
          progressScope={progressScope}
          onScopeChange={handleScopeChange}
          error={state.error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Render Achievement Jar
  return (
    <div className={`integrated-progress-page achievement-jar-mode ${className}`}>
      <ErrorBoundary
        onError={handleAchievementJarError}
        fallback={
          <TraditionalProgressFallback
            adaptedData={state.adaptedData}
            progressScope={progressScope}
            onScopeChange={handleScopeChange}
            error={state.error}
            onRetry={handleRetry}
          />
        }
      >
        <LifeOSAchievementJar
          categoryStats={state.adaptedData.categoryStats}
          totalTime={state.adaptedData.totalTime}
          timeRange={state.adaptedData.timeRange}
          metrics={state.adaptedData.metrics}
          isEmpty={state.adaptedData.isEmpty}
          customSounds={customSounds}
          onTimeRangeChange={handleScopeChange}
          className="w-full h-full"
        />
      </ErrorBoundary>
    </div>
  );
};

/**
 * Traditional progress fallback component
 */
interface TraditionalProgressFallbackProps {
  adaptedData: AdaptedProgressData | null;
  progressScope: TimeRange;
  onScopeChange: (scope: TimeRange) => void;
  error: Error | null;
  onRetry: () => void;
}

const TraditionalProgressFallback: React.FC<TraditionalProgressFallbackProps> = ({
  adaptedData,
  progressScope,
  onScopeChange,
  error,
  onRetry
}) => {
  const timeRangeLabels = {
    today: '今日',
    weekly: '本周',
    monthly: '本月'
  };

  return (
    <div className="traditional-progress-fallback p-6 bg-white rounded-2xl shadow-airy-soft">
      {/* Time Range Selector */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-airy-gray-border rounded-xl p-1">
          {(['today', 'weekly', 'monthly'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => onScopeChange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                progressScope === range
                  ? 'bg-airy-blue text-white shadow-airy-blue'
                  : 'text-airy-gray-text hover:text-airy-gray-dark'
              }`}
            >
              {timeRangeLabels[range]}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-800 font-medium">加载失败</h3>
              <p className="text-red-600 text-sm mt-1">
                Achievement Jar 暂时无法使用，已切换到传统界面
              </p>
            </div>
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* Progress Cards */}
      {adaptedData && !adaptedData.isEmpty ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {adaptedData.categoryStats.map((stat) => (
            <div
              key={stat.categoryId}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-airy-soft border border-airy-gray-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-xs text-airy-gray-text">
                  {stat.percentage.toFixed(1)}%
                </span>
              </div>
              <h3 className="font-medium text-airy-gray-dark mb-1">{stat.name}</h3>
              <p className="text-sm text-airy-gray-text">
                {(stat.totalMinutes / 60).toFixed(1)} 小时
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-medium text-airy-gray-dark mb-2">
            {TimeRangeProcessor.getContextualMessage(progressScope, 0)}
          </h3>
          <p className="text-airy-gray-text">
            {TimeRangeProcessor.getRelativeTimeDescription(progressScope)}
          </p>
        </div>
      )}

      {/* Total Time Summary */}
      {adaptedData && !adaptedData.isEmpty && (
        <div className="mt-6 pt-4 border-t border-airy-gray-border">
          <div className="text-center">
            <p className="text-sm text-airy-gray-text">
              {timeRangeLabels[progressScope]}总计
            </p>
            <p className="text-2xl font-bold text-airy-gray-dark">
              {adaptedData.totalTime.toFixed(1)} 小时
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedProgressPage;