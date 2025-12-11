/**
 * Achievement Jar Browser Compatibility
 * Provides browser compatibility checks and feature detection
 * Implements Requirements 5.1, 5.2
 */

import React, { useState, useEffect, useCallback } from 'react';

interface BrowserCapabilities {
  webgl: boolean;
  webAudio: boolean;
  css3d: boolean;
  requestAnimationFrame: boolean;
  localStorage: boolean;
  touchEvents: boolean;
  deviceMotion: boolean;
  performanceAPI: boolean;
  intersectionObserver: boolean;
}

interface CompatibilityResult {
  isSupported: boolean;
  capabilities: BrowserCapabilities;
  recommendations: string[];
  fallbackMode: 'full' | 'reduced' | 'minimal' | 'unsupported';
}

/**
 * Browser Compatibility Checker
 */
export class BrowserCompatibilityChecker {
  private static instance: BrowserCompatibilityChecker;
  private capabilities: BrowserCapabilities | null = null;

  static getInstance(): BrowserCompatibilityChecker {
    if (!BrowserCompatibilityChecker.instance) {
      BrowserCompatibilityChecker.instance = new BrowserCompatibilityChecker();
    }
    return BrowserCompatibilityChecker.instance;
  }

  /**
   * Check WebGL support
   */
  private checkWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (error) {
      console.warn('WebGL check failed:', error);
      return false;
    }
  }

  /**
   * Check Web Audio API support
   */
  private checkWebAudio(): boolean {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      return !!AudioContext;
    } catch (error) {
      console.warn('Web Audio API check failed:', error);
      return false;
    }
  }

  /**
   * Check CSS 3D transforms support
   */
  private checkCSS3D(): boolean {
    try {
      const testElement = document.createElement('div');
      testElement.style.transform = 'translate3d(0, 0, 0)';
      return testElement.style.transform !== '';
    } catch (error) {
      console.warn('CSS 3D check failed:', error);
      return false;
    }
  }

  /**
   * Check requestAnimationFrame support
   */
  private checkRequestAnimationFrame(): boolean {
    return !!(
      window.requestAnimationFrame ||
      (window as any).webkitRequestAnimationFrame ||
      (window as any).mozRequestAnimationFrame ||
      (window as any).msRequestAnimationFrame
    );
  }

  /**
   * Check localStorage support
   */
  private checkLocalStorage(): boolean {
    try {
      const testKey = '__test_localStorage__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage check failed:', error);
      return false;
    }
  }

  /**
   * Check touch events support
   */
  private checkTouchEvents(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Check device motion support
   */
  private checkDeviceMotion(): boolean {
    return 'DeviceMotionEvent' in window;
  }

  /**
   * Check Performance API support
   */
  private checkPerformanceAPI(): boolean {
    return !!(window.performance && window.performance.now);
  }

  /**
   * Check Intersection Observer support
   */
  private checkIntersectionObserver(): boolean {
    return 'IntersectionObserver' in window;
  }

  /**
   * Run all compatibility checks
   */
  checkCompatibility(): CompatibilityResult {
    if (this.capabilities) {
      return this.generateResult(this.capabilities);
    }

    console.log('🔍 Running browser compatibility checks...');

    this.capabilities = {
      webgl: this.checkWebGL(),
      webAudio: this.checkWebAudio(),
      css3d: this.checkCSS3D(),
      requestAnimationFrame: this.checkRequestAnimationFrame(),
      localStorage: this.checkLocalStorage(),
      touchEvents: this.checkTouchEvents(),
      deviceMotion: this.checkDeviceMotion(),
      performanceAPI: this.checkPerformanceAPI(),
      intersectionObserver: this.checkIntersectionObserver()
    };

    const result = this.generateResult(this.capabilities);
    
    console.log('✅ Browser compatibility check complete:', {
      capabilities: this.capabilities,
      fallbackMode: result.fallbackMode,
      isSupported: result.isSupported
    });

    return result;
  }

  /**
   * Generate compatibility result based on capabilities
   */
  private generateResult(capabilities: BrowserCapabilities): CompatibilityResult {
    const recommendations: string[] = [];
    let fallbackMode: 'full' | 'reduced' | 'minimal' | 'unsupported' = 'full';

    // Check critical features
    const criticalFeatures = [
      'requestAnimationFrame',
      'localStorage'
    ];

    const missingCritical = criticalFeatures.filter(feature => 
      !capabilities[feature as keyof BrowserCapabilities]
    );

    if (missingCritical.length > 0) {
      fallbackMode = 'unsupported';
      recommendations.push('浏览器缺少关键功能，建议升级到现代浏览器');
      return {
        isSupported: false,
        capabilities,
        recommendations,
        fallbackMode
      };
    }

    // Check advanced features
    const advancedFeatures = ['webgl', 'webAudio', 'css3d'];
    const missingAdvanced = advancedFeatures.filter(feature => 
      !capabilities[feature as keyof BrowserCapabilities]
    );

    if (missingAdvanced.length >= 2) {
      fallbackMode = 'minimal';
      recommendations.push('浏览器功能有限，将使用简化版本');
    } else if (missingAdvanced.length === 1) {
      fallbackMode = 'reduced';
      recommendations.push('部分高级功能不可用，将使用兼容模式');
    }

    // Performance recommendations
    if (!capabilities.performanceAPI) {
      recommendations.push('性能监控功能不可用');
    }

    if (!capabilities.intersectionObserver) {
      recommendations.push('滚动优化功能受限');
    }

    // Mobile-specific recommendations
    if (capabilities.touchEvents && !capabilities.deviceMotion) {
      recommendations.push('设备运动传感器不可用，部分交互功能受限');
    }

    return {
      isSupported: true,
      capabilities,
      recommendations,
      fallbackMode
    };
  }

  /**
   * Get user agent information
   */
  getUserAgentInfo() {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid || /Mobile/.test(ua);
    const isChrome = /Chrome/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    const isSafari = /Safari/.test(ua) && !isChrome;
    const isEdge = /Edge/.test(ua);

    return {
      userAgent: ua,
      isIOS,
      isAndroid,
      isMobile,
      isChrome,
      isFirefox,
      isSafari,
      isEdge,
      platform: navigator.platform
    };
  }
}

/**
 * Browser Compatibility Component
 */
interface BrowserCompatibilityProps {
  children: React.ReactNode;
  onCompatibilityCheck?: (result: CompatibilityResult) => void;
  fallbackComponent?: React.ReactNode;
  className?: string;
}

export const BrowserCompatibility: React.FC<BrowserCompatibilityProps> = ({
  children,
  onCompatibilityCheck,
  fallbackComponent,
  className = ''
}) => {
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checker = BrowserCompatibilityChecker.getInstance();
    
    // Run compatibility check
    setTimeout(() => {
      const result = checker.checkCompatibility();
      setCompatibilityResult(result);
      setIsChecking(false);
      onCompatibilityCheck?.(result);
    }, 100);
  }, [onCompatibilityCheck]);

  if (isChecking) {
    return (
      <div className={`compatibility-checking ${className} p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            检查浏览器兼容性
          </h3>
          <p className="text-gray-500">
            正在检测浏览器功能...
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!compatibilityResult?.isSupported) {
    return (
      <div className={`compatibility-unsupported ${className}`}>
        {fallbackComponent || <UnsupportedBrowserComponent result={compatibilityResult} />}
      </div>
    );
  }

  // Show warnings for reduced functionality
  if (compatibilityResult.fallbackMode !== 'full' && compatibilityResult.recommendations.length > 0) {
    return (
      <div className={className}>
        <CompatibilityWarning result={compatibilityResult} />
        {children}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

/**
 * Unsupported Browser Component
 */
const UnsupportedBrowserComponent: React.FC<{ result: CompatibilityResult | null }> = ({ 
  result 
}) => (
  <div className="unsupported-browser p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200">
    <div className="text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h3 className="text-xl font-bold text-red-700 mb-2">
        浏览器不兼容
      </h3>
      <p className="text-red-600 mb-4">
        你的浏览器不支持 Achievement Jar 所需的功能
      </p>
      
      {result?.recommendations && (
        <div className="mb-6">
          <h4 className="font-medium text-red-700 mb-2">建议:</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {result.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <a
          href="https://www.google.com/chrome/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          📱 下载 Chrome
        </a>
        <a
          href="https://www.mozilla.org/firefox/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          🦊 下载 Firefox
        </a>
      </div>
    </div>
  </div>
);

/**
 * Compatibility Warning Component
 */
const CompatibilityWarning: React.FC<{ result: CompatibilityResult }> = ({ result }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getWarningColor = () => {
    switch (result.fallbackMode) {
      case 'reduced': return 'from-yellow-50 to-orange-50 border-yellow-200';
      case 'minimal': return 'from-orange-50 to-red-50 border-orange-200';
      default: return 'from-blue-50 to-purple-50 border-blue-200';
    }
  };

  const getWarningIcon = () => {
    switch (result.fallbackMode) {
      case 'reduced': return '⚠️';
      case 'minimal': return '🔧';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`compatibility-warning mb-4 p-4 bg-gradient-to-r ${getWarningColor()} rounded-xl border`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getWarningIcon()}</div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-700 mb-1">
            兼容性提醒
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {result.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/**
 * Hook for using browser compatibility
 */
export const useBrowserCompatibility = () => {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkCompatibility = useCallback(() => {
    setIsChecking(true);
    const checker = BrowserCompatibilityChecker.getInstance();
    const compatibilityResult = checker.checkCompatibility();
    setResult(compatibilityResult);
    setIsChecking(false);
    return compatibilityResult;
  }, []);

  useEffect(() => {
    checkCompatibility();
  }, [checkCompatibility]);

  return {
    result,
    isChecking,
    isSupported: result?.isSupported ?? false,
    fallbackMode: result?.fallbackMode ?? 'unsupported',
    capabilities: result?.capabilities,
    recommendations: result?.recommendations ?? [],
    recheckCompatibility: checkCompatibility
  };
};

export default BrowserCompatibility;