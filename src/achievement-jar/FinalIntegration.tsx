/**
 * Final Integration and Polish
 * Complete Achievement Jar integration with all features
 * Implements all requirements for complete system integration
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MainAppProgressIntegration } from './MainAppProgressIntegration';
import { IntegrationTesting } from './IntegrationTesting';
import { CodeSplittingProvider } from './CodeSplitting';
import { DataCachingProvider } from './DataCaching';
import { VisualConsistencyIntegration } from './VisualConsistencyIntegration';
import { MobileOptimization } from './MobileOptimization';
import { EmptyStateHandler } from './EmptyStateHandler';

interface FinalIntegrationProps {
  // Main app props
  fullHistory: string;
  progressScope: 'today' | 'week' | 'month';
  onScopeChange: (scope: 'today' | 'week' | 'month') => void;
  categoryMap: Record<string, any>;
  customSounds: Record<string, string>;
  danmakus: any[];
  setDanmakus: (danmakus: any[]) => void;
  playSound: (type: string) => void;
  
  // Configuration options
  config?: AchievementJarConfig;
  onConfigChange?: (config: AchievementJarConfig) => void;
  className?: string;
}

interface AchievementJarConfig {
  enabled: boolean;
  enablePhysics: boolean;
  enableCelebrations: boolean;
  enableSounds: boolean;
  enableAnimations: boolean;
  performanceMode: 'auto' | 'high' | 'medium' | 'low';
  theme: 'auto' | 'light' | 'dark';
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  advanced: {
    enableTesting: boolean;
    enableDebugMode: boolean;
    enablePerformanceMonitoring: boolean;
    cacheEnabled: boolean;
    lazyLoadingEnabled: boolean;
  };
}

/**
 * Configuration Manager
 * Manages Achievement Jar configuration and preferences
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: AchievementJarConfig;
  private observers: ((config: AchievementJarConfig) => void)[] = [];

  constructor() {
    this.config = this.getDefaultConfig();
    this.loadConfig();
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AchievementJarConfig {
    return {
      enabled: true,
      enablePhysics: true,
      enableCelebrations: true,
      enableSounds: true,
      enableAnimations: true,
      performanceMode: 'auto',
      theme: 'auto',
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        screenReader: false
      },
      advanced: {
        enableTesting: process.env.NODE_ENV === 'development',
        enableDebugMode: process.env.NODE_ENV === 'development',
        enablePerformanceMonitoring: true,
        cacheEnabled: true,
        lazyLoadingEnabled: true
      }
    };
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('achievement_jar_config');
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        this.config = { ...this.config, ...parsedConfig };
      }
    } catch (error) {
      console.warn('Failed to load Achievement Jar config:', error);
    }

    // Apply system preferences
    this.applySystemPreferences();
  }

  /**
   * Apply system preferences (accessibility, performance)
   */
  private applySystemPreferences(): void {
    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.accessibility.reducedMotion = true;
      this.config.enableAnimations = false;
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.config.accessibility.highContrast = true;
    }

    // Detect color scheme preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.config.theme = 'dark';
    }

    // Auto-detect performance mode
    if (this.config.performanceMode === 'auto') {
      this.config.performanceMode = this.detectPerformanceMode();
    }
  }

  /**
   * Detect optimal performance mode
   */
  private detectPerformanceMode(): 'high' | 'medium' | 'low' {
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const memoryInfo = (performance as any).memory;
    
    let score = 0;
    
    // CPU score
    if (hardwareConcurrency >= 8) score += 3;
    else if (hardwareConcurrency >= 4) score += 2;
    else score += 1;
    
    // Memory score
    if (memoryInfo) {
      const totalMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024);
      if (totalMemory > 2000) score += 3;
      else if (totalMemory > 1000) score += 2;
      else score += 1;
    } else {
      score += 2;
    }
    
    // Network score
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '4g') score += 3;
      else if (connection.effectiveType === '3g') score += 2;
      else score += 1;
    } else {
      score += 2;
    }

    if (score >= 8) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  /**
   * Get current configuration
   */
  getConfig(): AchievementJarConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AchievementJarConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.notifyObservers();
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('achievement_jar_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save Achievement Jar config:', error);
    }
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(callback: (config: AchievementJarConfig) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Notify observers of configuration changes
   */
  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.config));
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.config = this.getDefaultConfig();
    this.applySystemPreferences();
    this.saveConfig();
    this.notifyObservers();
  }
}

/**
 * Configuration Panel Component
 */
export const ConfigurationPanel: React.FC<{
  config: AchievementJarConfig;
  onConfigChange: (config: AchievementJarConfig) => void;
  onClose: () => void;
}> = ({ config, onConfigChange, onClose }) => {
  const handleToggle = (path: string, value: boolean) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onConfigChange(newConfig);
  };

  const handleSelect = (path: string, value: string) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onConfigChange(newConfig);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">🏺 Achievement Jar 设置</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">基础设置</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>启用 Achievement Jar</span>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => handleToggle('enabled', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>启用物理效果</span>
                <input
                  type="checkbox"
                  checked={config.enablePhysics}
                  onChange={(e) => handleToggle('enablePhysics', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>启用庆祝效果</span>
                <input
                  type="checkbox"
                  checked={config.enableCelebrations}
                  onChange={(e) => handleToggle('enableCelebrations', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>启用音效</span>
                <input
                  type="checkbox"
                  checked={config.enableSounds}
                  onChange={(e) => handleToggle('enableSounds', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>启用动画</span>
                <input
                  type="checkbox"
                  checked={config.enableAnimations}
                  onChange={(e) => handleToggle('enableAnimations', e.target.checked)}
                  className="toggle"
                />
              </label>
            </div>
          </div>

          {/* Performance Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">性能设置</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>性能模式</span>
                <select
                  value={config.performanceMode}
                  onChange={(e) => handleSelect('performanceMode', e.target.value)}
                  className="px-3 py-1 border rounded"
                >
                  <option value="auto">自动</option>
                  <option value="high">高性能</option>
                  <option value="medium">中等</option>
                  <option value="low">低性能</option>
                </select>
              </label>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">无障碍设置</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>减少动画</span>
                <input
                  type="checkbox"
                  checked={config.accessibility.reducedMotion}
                  onChange={(e) => handleToggle('accessibility.reducedMotion', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>高对比度</span>
                <input
                  type="checkbox"
                  checked={config.accessibility.highContrast}
                  onChange={(e) => handleToggle('accessibility.highContrast', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>屏幕阅读器优化</span>
                <input
                  type="checkbox"
                  checked={config.accessibility.screenReader}
                  onChange={(e) => handleToggle('accessibility.screenReader', e.target.checked)}
                  className="toggle"
                />
              </label>
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">高级设置</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>启用测试模式</span>
                <input
                  type="checkbox"
                  checked={config.advanced.enableTesting}
                  onChange={(e) => handleToggle('advanced.enableTesting', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>启用调试模式</span>
                <input
                  type="checkbox"
                  checked={config.advanced.enableDebugMode}
                  onChange={(e) => handleToggle('advanced.enableDebugMode', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>性能监控</span>
                <input
                  type="checkbox"
                  checked={config.advanced.enablePerformanceMonitoring}
                  onChange={(e) => handleToggle('advanced.enablePerformanceMonitoring', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>启用缓存</span>
                <input
                  type="checkbox"
                  checked={config.advanced.cacheEnabled}
                  onChange={(e) => handleToggle('advanced.cacheEnabled', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span>懒加载</span>
                <input
                  type="checkbox"
                  checked={config.advanced.lazyLoadingEnabled}
                  onChange={(e) => handleToggle('advanced.lazyLoadingEnabled', e.target.checked)}
                  className="toggle"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => {
              ConfigurationManager.getInstance().reset();
              onConfigChange(ConfigurationManager.getInstance().getConfig());
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            重置默认
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Final Integration Component
 * The complete Achievement Jar integration with all features
 */
export const FinalIntegration: React.FC<FinalIntegrationProps> = ({
  fullHistory,
  progressScope,
  onScopeChange,
  categoryMap,
  customSounds,
  danmakus,
  setDanmakus,
  playSound,
  config: initialConfig,
  onConfigChange,
  className = ''
}) => {
  const [config, setConfig] = useState<AchievementJarConfig>(() => 
    initialConfig || ConfigurationManager.getInstance().getConfig()
  );
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize configuration manager
  useEffect(() => {
    const configManager = ConfigurationManager.getInstance();
    
    const unsubscribe = configManager.subscribe((newConfig) => {
      setConfig(newConfig);
      onConfigChange?.(newConfig);
    });

    setIsInitialized(true);
    
    return unsubscribe;
  }, [onConfigChange]);

  // Handle configuration changes
  const handleConfigChange = useCallback((newConfig: AchievementJarConfig) => {
    ConfigurationManager.getInstance().updateConfig(newConfig);
  }, []);

  // Apply configuration to document
  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    
    // Apply accessibility settings
    if (config.accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Apply performance settings
    if (config.performanceMode === 'low') {
      root.classList.add('performance-low');
    } else {
      root.classList.remove('performance-low');
    }
    
    // Apply theme settings
    if (config.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    console.log('🎯 Achievement Jar configuration applied:', config);
  }, [config, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600">正在初始化 Achievement Jar...</div>
        </div>
      </div>
    );
  }

  if (!config.enabled) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏺</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Achievement Jar 已禁用</h3>
        <p className="text-gray-500 mb-6">在设置中启用以查看 3D 进度可视化</p>
        <button
          onClick={() => setShowConfigPanel(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          打开设置
        </button>
      </div>
    );
  }

  return (
    <div className={`final-integration ${className}`}>
      <CodeSplittingProvider 
        enableLazyLoading={config.advanced.lazyLoadingEnabled}
        preloadComponents={config.performanceMode === 'high' ? ['all'] : ['essential']}
      >
        <DataCachingProvider 
          enableMemoryOptimization={config.advanced.enablePerformanceMonitoring}
          cacheConfig={{
            maxSize: config.performanceMode === 'high' ? 100 : 50,
            compressionEnabled: config.performanceMode !== 'high'
          }}
        >
          <VisualConsistencyIntegration
            enableTransitions={config.enableAnimations && !config.accessibility.reducedMotion}
            enableAnimations={config.enableAnimations && !config.accessibility.reducedMotion}
          >
            <MobileOptimization enablePerformanceOptimization={true}>
              <IntegrationTesting
                enableTesting={config.advanced.enableTesting}
                onTestComplete={(results) => {
                  console.log('🧪 Integration test results:', results);
                }}
              >
                <MainAppProgressIntegration
                  fullHistory={fullHistory}
                  progressScope={progressScope}
                  onScopeChange={onScopeChange}
                  categoryMap={categoryMap}
                  customSounds={config.enableSounds ? customSounds : {}}
                  danmakus={danmakus}
                  setDanmakus={setDanmakus}
                  playSound={config.enableSounds ? playSound : () => {}}
                />
              </IntegrationTesting>
            </MobileOptimization>
          </VisualConsistencyIntegration>
        </DataCachingProvider>
      </CodeSplittingProvider>

      {/* Configuration Button */}
      <button
        onClick={() => setShowConfigPanel(true)}
        className="fixed bottom-20 right-4 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all z-40"
        title="Achievement Jar 设置"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Configuration Panel */}
      {showConfigPanel && (
        <ConfigurationPanel
          config={config}
          onConfigChange={handleConfigChange}
          onClose={() => setShowConfigPanel(false)}
        />
      )}

      {/* Debug Information */}
      {config.advanced.enableDebugMode && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
          <div>🏺 Achievement Jar Debug</div>
          <div>Performance: {config.performanceMode}</div>
          <div>Physics: {config.enablePhysics ? '✅' : '❌'}</div>
          <div>Animations: {config.enableAnimations ? '✅' : '❌'}</div>
          <div>Cache: {config.advanced.cacheEnabled ? '✅' : '❌'}</div>
          <div>Lazy Loading: {config.advanced.lazyLoadingEnabled ? '✅' : '❌'}</div>
        </div>
      )}
    </div>
  );
};

export default FinalIntegration;