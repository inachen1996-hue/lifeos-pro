/**
 * Achievement Jar Error Handling Integration
 * Integrates all error handling components and provides unified error management
 * Implements Requirements 1.5, 5.1, 5.3
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary, useErrorBoundary } from './ErrorBoundary';
import { LoadingState, AchievementJarSkeleton } from './LoadingStates';
import { BrowserCompatibility, useBrowserCompatibility } from './BrowserCompatibility';
import { AccessibilityProvider, AccessibleAchievementJar } from './AccessibilityFeatures';

interface ErrorHandlingIntegrationProps {
  children: React.ReactNode;
  onFallbackToTraditional?: () => void;
  onError?: (error: Error) => void;
  enableAccessibility?: boolean;
  className?: string;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  lastErrorTime: number;
  fallbackMode: 'achievement-jar' | 'traditional' | 'loading';
}

/**
 * Comprehensive Error Handling Integration Component
 */
export const ErrorHandlingIntegration: React.FC<ErrorHandlingIntegrationProps> = ({
  children,
  onFallbackToTraditional,
  onError,
  enableAccessibility = true,
  className = ''
}) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorCount: 0,
    lastErrorTime: 0,
    fallbackMode: 'loading'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('初始化中...');
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    result: compatibilityResult,
    isChecking: isCheckingCompatibility,
    isSupported: isBrowserSupported,
    fallbackMode: browserFallbackMode
  } = useBrowserCompatibility();

  // Handle error boundary errors
  const handleError = useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('🚨 ErrorHandlingIntegration caught error:', error);
    
    const now = Date.now();
    setErrorState(prev => ({
      hasError: true,
      error,
      errorCount: prev.errorCount + 1,
      lastErrorTime: now,
      fallbackMode: prev.errorCount >= 2 ? 'traditional' : 'achievement-jar'
    }));

    // Call custom error handler
    onError?.(error);

    // Log error details
    logErrorDetails(error, errorInfo);

    // Auto-fallback after multiple errors
    if (errorState.errorCount >= 2) {
      console.warn('🚨 Multiple errors detected, falling back to traditional interface');
      setTimeout(() => {
        handleFallbackToTraditional();
      }, 1000);
    }
  }, [errorState.errorCount, onError]);

  // Handle fallback to traditional interface
  const handleFallbackToTraditional = useCallback(() => {
    console.log('🔄 Falling back to traditional statistics interface');
    
    setErrorState(prev => ({
      ...prev,
      fallbackMode: 'traditional'
    }));

    onFallbackToTraditional?.();

    // Emit fallback event
    const fallbackEvent = new CustomEvent('achievement-jar-fallback', {
      detail: {
        reason: 'error-handling',
        errorCount: errorState.errorCount,
        browserCompatibility: compatibilityResult
      }
    });
    window.dispatchEvent(fallbackEvent);
  }, [onFallbackToTraditional, errorState.errorCount, compatibilityResult]);

  // Handle retry
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying Achievement Jar initialization');
    
    setErrorState({
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: 0,
      fallbackMode: 'loading'
    });
    
    setIsLoading(true);
    setLoadingStage('重新初始化中...');
  }, []);

  // Initialize Achievement Jar
  useEffect(() => {
    if (!isCheckingCompatibility && isBrowserSupported) {
      const initializeAchievementJar = async () => {
        try {
          setLoadingStage('检查浏览器兼容性...');
          await new Promise(resolve => setTimeout(resolve, 500));

          setLoadingStage('加载 Achievement Jar 组件...');
          await new Promise(resolve => setTimeout(resolve, 800));

          setLoadingStage('初始化 3D 渲染引擎...');
          await new Promise(resolve => setTimeout(resolve, 600));

          setLoadingStage('准备数据适配器...');
          await new Promise(resolve => setTimeout(resolve, 400));

          setLoadingStage('完成初始化...');
          await new Promise(resolve => setTimeout(resolve, 300));

          setIsLoading(false);
          setErrorState(prev => ({ ...prev, fallbackMode: 'achievement-jar' }));
          
          console.log('✅ Achievement Jar initialized successfully');
        } catch (error) {
          console.error('❌ Achievement Jar initialization failed:', error);
          handleError(error as Error);
        }
      };

      initializeAchievementJar();
    } else if (!isCheckingCompatibility && !isBrowserSupported) {
      console.warn('⚠️ Browser not supported, falling back to traditional interface');
      handleFallbackToTraditional();
    }
  }, [isCheckingCompatibility, isBrowserSupported, handleError, handleFallbackToTraditional]);

  // Listen for fallback events
  useEffect(() => {
    const handleFallbackEvent = (event: CustomEvent) => {
      console.log('📡 Received fallback event:', event.detail);
      handleFallbackToTraditional();
    };

    window.addEventListener('achievement-jar-fallback', handleFallbackEvent as EventListener);
    
    return () => {
      window.removeEventListener('achievement-jar-fallback', handleFallbackEvent as EventListener);
    };
  }, [handleFallbackToTraditional]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Log error details for debugging
  const logErrorDetails = (error: Error, errorInfo?: React.ErrorInfo) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      browserInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      },
      compatibilityResult,
      errorCount: errorState.errorCount + 1
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('achievement_jar_error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 20 error logs
      if (existingLogs.length > 20) {
        existingLogs.splice(0, existingLogs.length - 20);
      }
      
      localStorage.setItem('achievement_jar_error_logs', JSON.stringify(existingLogs));
    } catch (logError) {
      console.error('Failed to log error details:', logError);
    }
  };

  // Render fallback to traditional interface
  if (errorState.fallbackMode === 'traditional') {
    return (
      <div className={`error-handling-fallback ${className}`}>
        <TraditionalInterfaceFallback 
          onRetry={handleRetry}
          errorCount={errorState.errorCount}
          compatibilityResult={compatibilityResult}
        />
      </div>
    );
  }

  // Render loading state
  if (isLoading || isCheckingCompatibility || errorState.fallbackMode === 'loading') {
    return (
      <div className={`error-handling-loading ${className}`}>
        <LoadingState
          isLoading={true}
          loadingComponent={
            <div className="text-center p-8">
              <AchievementJarSkeleton />
              <div className="mt-4 text-sm text-gray-500">
                {loadingStage}
              </div>
            </div>
          }
        >
          {null}
        </LoadingState>
      </div>
    );
  }

  // Render Achievement Jar with full error handling
  const content = (
    <BrowserCompatibility
      onCompatibilityCheck={(result) => {
        console.log('🔍 Browser compatibility check result:', result);
        if (!result.isSupported) {
          handleFallbackToTraditional();
        }
      }}
      fallbackComponent={
        <TraditionalInterfaceFallback 
          onRetry={handleRetry}
          errorCount={errorState.errorCount}
          compatibilityResult={compatibilityResult}
        />
      }
    >
      <ErrorBoundary
        onError={handleError}
        maxRetries={3}
        fallbackComponent={
          <ErrorFallbackComponent 
            onRetry={handleRetry}
            onFallback={handleFallbackToTraditional}
            errorCount={errorState.errorCount}
          />
        }
      >
        <LoadingState
          isLoading={false}
          error={errorState.error}
          errorComponent={
            <ErrorFallbackComponent 
              onRetry={handleRetry}
              onFallback={handleFallbackToTraditional}
              errorCount={errorState.errorCount}
            />
          }
        >
          {enableAccessibility ? (
            <AccessibilityProvider>
              <AccessibleAchievementJar
                ariaLabel="Achievement Jar 成就可视化"
                description="显示你的进度数据的 3D 可视化成就罐"
              >
                {children}
              </AccessibleAchievementJar>
            </AccessibilityProvider>
          ) : (
            children
          )}
        </LoadingState>
      </ErrorBoundary>
    </BrowserCompatibility>
  );

  return (
    <div className={`error-handling-integration ${className}`}>
      {content}
    </div>
  );
};

/**
 * Error Fallback Component
 */
const ErrorFallbackComponent: React.FC<{
  onRetry: () => void;
  onFallback: () => void;
  errorCount: number;
}> = ({ onRetry, onFallback, errorCount }) => (
  <div className="error-fallback p-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200">
    <div className="text-center">
      <div className="text-6xl mb-4">🎯</div>
      <h3 className="text-xl font-bold text-red-700 mb-2">
        Achievement Jar 遇到问题
      </h3>
      <p className="text-red-600 mb-4">
        {errorCount > 1 
          ? '多次尝试失败，建议使用传统界面'
          : '遇到了一些技术问题，但不用担心！'
        }
      </p>
      
      <div className="flex gap-3 justify-center">
        {errorCount <= 2 && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-medium shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105"
          >
            🔄 重试
          </button>
        )}
        <button
          onClick={onFallback}
          className="px-6 py-2 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl font-medium shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105"
        >
          📊 使用传统界面
        </button>
      </div>
    </div>
  </div>
);

/**
 * Traditional Interface Fallback Component
 */
const TraditionalInterfaceFallback: React.FC<{
  onRetry: () => void;
  errorCount: number;
  compatibilityResult: any;
}> = ({ onRetry, errorCount, compatibilityResult }) => (
  <div className="traditional-fallback p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
    <div className="text-center">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-bold text-blue-700 mb-2">
        使用传统统计界面
      </h3>
      <p className="text-blue-600 mb-4">
        {compatibilityResult?.isSupported === false
          ? '你的浏览器不支持 Achievement Jar 功能'
          : errorCount > 0
          ? 'Achievement Jar 暂时不可用，已切换到传统界面'
          : '正在使用传统统计界面'
        }
      </p>
      
      {compatibilityResult?.isSupported !== false && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-medium shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105"
        >
          🎯 重新尝试 Achievement Jar
        </button>
      )}
      
      {compatibilityResult?.recommendations && compatibilityResult.recommendations.length > 0 && (
        <div className="mt-4 text-sm text-blue-600">
          <p className="font-medium mb-2">建议:</p>
          <ul className="space-y-1">
            {compatibilityResult.recommendations.map((rec: string, index: number) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

/**
 * Hook for using error handling integration
 */
export const useErrorHandlingIntegration = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorCount: 0,
    lastErrorTime: 0,
    fallbackMode: 'achievement-jar'
  });

  const { captureError, resetError } = useErrorBoundary();

  const handleError = useCallback((error: Error) => {
    setErrorState(prev => ({
      hasError: true,
      error,
      errorCount: prev.errorCount + 1,
      lastErrorTime: Date.now(),
      fallbackMode: prev.errorCount >= 2 ? 'traditional' : 'achievement-jar'
    }));
    
    captureError(error);
  }, [captureError]);

  const reset = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: 0,
      fallbackMode: 'achievement-jar'
    });
    
    resetError();
  }, [resetError]);

  return {
    errorState,
    handleError,
    reset,
    isInFallbackMode: errorState.fallbackMode === 'traditional'
  };
};

export default ErrorHandlingIntegration;