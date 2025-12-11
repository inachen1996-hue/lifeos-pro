/**
 * Achievement Jar Loading States
 * Provides loading indicators and skeleton screens for Achievement Jar components
 * Implements Requirements 1.5, 5.1
 */

import React, { useState, useEffect } from 'react';

interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  timeout?: number;
  className?: string;
}

/**
 * Loading State Wrapper Component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  timeout = 10000,
  className = ''
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (isLoading && timeout > 0) {
      const timeoutId = setTimeout(() => {
        setHasTimedOut(true);
        console.warn('🚨 Achievement Jar loading timeout reached');
      }, timeout);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, timeout]);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
    }
  }, [isLoading]);

  if (error || hasTimedOut) {
    return (
      <div className={`loading-error ${className}`}>
        {errorComponent || <DefaultErrorComponent error={error} hasTimedOut={hasTimedOut} />}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`loading-container ${className}`}>
        {loadingComponent || <DefaultLoadingComponent />}
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Default Loading Component
 */
const DefaultLoadingComponent: React.FC = () => (
  <div className="achievement-jar-loading flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
    <div className="relative mb-6">
      {/* Animated jar outline */}
      <div className="w-24 h-32 border-4 border-blue-300 rounded-b-3xl rounded-t-lg relative animate-pulse">
        <div className="absolute top-2 left-2 right-2 h-2 bg-blue-200 rounded animate-pulse"></div>
        <div className="absolute top-6 left-3 right-3 h-3 bg-purple-200 rounded animate-pulse delay-100"></div>
        <div className="absolute top-12 left-2 right-2 h-4 bg-pink-200 rounded animate-pulse delay-200"></div>
        <div className="absolute top-18 left-4 right-4 h-3 bg-yellow-200 rounded animate-pulse delay-300"></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
      <div className="absolute top-4 -left-3 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
    </div>
    
    <h3 className="text-xl font-bold text-gray-700 mb-2">
      🎯 正在加载 Achievement Jar
    </h3>
    <p className="text-gray-500 text-center mb-4">
      正在准备你的成就可视化...
    </p>
    
    {/* Progress dots */}
    <div className="flex gap-2">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200"></div>
    </div>
  </div>
);

/**
 * Default Error Component
 */
const DefaultErrorComponent: React.FC<{ error?: Error | null; hasTimedOut: boolean }> = ({ 
  error, 
  hasTimedOut 
}) => (
  <div className="achievement-jar-error flex flex-col items-center justify-center p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200">
    <div className="text-6xl mb-4">
      {hasTimedOut ? '⏰' : '🚨'}
    </div>
    <h3 className="text-xl font-bold text-red-700 mb-2">
      {hasTimedOut ? '加载超时' : '加载失败'}
    </h3>
    <p className="text-red-600 text-center mb-4">
      {hasTimedOut 
        ? 'Achievement Jar 加载时间过长，可能网络较慢或设备性能不足'
        : error?.message || '遇到未知错误，请稍后重试'
      }
    </p>
    <button
      onClick={() => window.location.reload()}
      className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-xl font-medium shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105"
    >
      🔄 重新加载
    </button>
  </div>
);

/**
 * Skeleton Component for Achievement Jar Container
 */
export const AchievementJarSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <div className={`achievement-jar-skeleton ${className} p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl`}>
    {/* Header skeleton */}
    <div className="flex justify-between items-center mb-6">
      <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
      <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
    </div>
    
    {/* Jar container skeleton */}
    <div className="relative h-64 bg-gray-200 rounded-2xl mb-6 animate-pulse">
      <div className="absolute inset-4 bg-gray-300 rounded-xl animate-pulse delay-100"></div>
      <div className="absolute top-8 left-8 right-8 h-4 bg-gray-400 rounded animate-pulse delay-200"></div>
      <div className="absolute top-16 left-12 right-12 h-6 bg-gray-400 rounded animate-pulse delay-300"></div>
    </div>
    
    {/* Metrics skeleton */}
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 bg-gray-200 rounded-xl animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-16 mb-2 animate-pulse delay-100"></div>
          <div className="h-6 bg-gray-400 rounded w-12 animate-pulse delay-200"></div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton Component for Metrics Tray
 */
export const MetricsSkeleton: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <div className={`metrics-skeleton ${className} grid grid-cols-2 md:grid-cols-4 gap-4`}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="p-4 bg-gray-100 rounded-xl animate-pulse">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse delay-100"></div>
        </div>
        <div className="h-6 bg-gray-400 rounded w-20 animate-pulse delay-200"></div>
        <div className="h-3 bg-gray-300 rounded w-24 mt-2 animate-pulse delay-300"></div>
      </div>
    ))}
  </div>
);

/**
 * Progressive Loading Hook
 */
export const useProgressiveLoading = (stages: string[], stageDelay: number = 500) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStage < stages.length) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, stageDelay);

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentStage, stages.length, stageDelay]);

  const reset = () => {
    setCurrentStage(0);
    setIsComplete(false);
  };

  return {
    currentStage: Math.min(currentStage, stages.length - 1),
    currentStageName: stages[Math.min(currentStage, stages.length - 1)],
    progress: (currentStage / stages.length) * 100,
    isComplete,
    reset
  };
};

/**
 * Progressive Loading Component
 */
export const ProgressiveLoader: React.FC<{
  stages: string[];
  stageDelay?: number;
  onComplete?: () => void;
  className?: string;
}> = ({ stages, stageDelay = 500, onComplete, className = '' }) => {
  const { currentStageName, progress, isComplete } = useProgressiveLoading(stages, stageDelay);

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className={`progressive-loader ${className} p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl`}>
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          正在初始化 Achievement Jar
        </h3>
        <p className="text-gray-500">
          {currentStageName}
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        {Math.round(progress)}% 完成
      </div>
    </div>
  );
};

/**
 * Lazy Loading Wrapper
 */
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ children, fallback, className = '' }) => {
  return (
    <React.Suspense fallback={fallback || <DefaultLoadingComponent />}>
      <div className={className}>
        {children}
      </div>
    </React.Suspense>
  );
};

export default LoadingState;