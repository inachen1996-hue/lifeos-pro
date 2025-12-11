/**
 * Achievement Jar Error Boundary
 * Provides error handling and graceful fallback to traditional statistics interface
 * Implements Requirements 1.5, 5.1, 5.3
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  lastErrorTime: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  className?: string;
}

/**
 * Error Boundary for Achievement Jar components
 * Automatically falls back to traditional interface on errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('🚨 Achievement Jar Error Boundary caught error:', error);
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Achievement Jar Error Details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error for debugging
    this.logError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    // Store error log in localStorage for debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('achievement_jar_error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 error logs
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      
      localStorage.setItem('achievement_jar_error_logs', JSON.stringify(existingLogs));
    } catch (logError) {
      console.error('Failed to log error to localStorage:', logError);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    const { retryCount, lastErrorTime } = this.state;

    if (retryCount >= maxRetries) {
      console.warn('🚨 Max retries reached, staying in fallback mode');
      return;
    }

    // Prevent rapid retries
    const timeSinceLastError = Date.now() - lastErrorTime;
    if (timeSinceLastError < retryDelay) {
      console.log('⏳ Retry delayed to prevent rapid failures');
      this.retryTimeoutId = setTimeout(this.handleRetry, retryDelay - timeSinceLastError);
      return;
    }

    console.log(`🔄 Retrying Achievement Jar (attempt ${retryCount + 1}/${maxRetries})`);
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleFallbackToTraditional = () => {
    console.log('🔄 Falling back to traditional statistics interface');
    
    // Emit custom event to notify parent components
    const fallbackEvent = new CustomEvent('achievement-jar-fallback', {
      detail: {
        error: this.state.error,
        retryCount: this.state.retryCount
      }
    });
    window.dispatchEvent(fallbackEvent);

    // Clear error state to prevent retry loops
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallbackComponent, maxRetries = 3, className = '' } = this.props;

    if (hasError && error) {
      // If we have a custom fallback component, use it
      if (fallbackComponent) {
        return (
          <div className={`error-boundary-fallback ${className}`}>
            {fallbackComponent}
          </div>
        );
      }

      // Default error UI with retry and fallback options
      return (
        <div className={`error-boundary-container ${className} p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200`}>
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-red-700 mb-2">
              Achievement Jar 暂时不可用
            </h3>
            <p className="text-red-600 mb-4">
              遇到了一些技术问题，但不用担心！
            </p>
            
            {retryCount < maxRetries && (
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={this.handleRetry}
                  className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl font-medium shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105"
                >
                  🔄 重试 ({retryCount + 1}/{maxRetries})
                </button>
                <button
                  onClick={this.handleFallbackToTraditional}
                  className="px-6 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-medium shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105"
                >
                  📊 使用传统界面
                </button>
              </div>
            )}

            {retryCount >= maxRetries && (
              <div className="mb-4">
                <p className="text-red-500 text-sm mb-3">
                  已达到最大重试次数，建议使用传统界面
                </p>
                <button
                  onClick={this.handleFallbackToTraditional}
                  className="px-8 py-3 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl font-bold shadow-airy-soft hover:shadow-airy-hover transition-all hover:scale-105"
                >
                  📊 切换到传统统计界面
                </button>
              </div>
            )}

            <details className="text-left mt-4 p-4 bg-red-100 rounded-xl">
              <summary className="cursor-pointer text-red-700 font-medium">
                🔍 技术详情 (开发者)
              </summary>
              <div className="mt-2 text-sm text-red-600 font-mono">
                <p><strong>错误:</strong> {error.message}</p>
                <p><strong>时间:</strong> {new Date().toLocaleString()}</p>
                <p><strong>重试次数:</strong> {retryCount}</p>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }
}

/**
 * Hook for using error boundary functionality
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('🚨 Manual error capture:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
    hasError: !!error
  };
};

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;