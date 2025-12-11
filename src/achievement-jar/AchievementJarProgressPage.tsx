/**
 * Achievement Jar Progress Page - Task 15: Final Integration and Polish
 * Replaces existing progress page implementation with new Achievement Jar system
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LifeOSAchievementJar } from './LifeOSIntegration.js';
import { PerformanceOptimizedContainer } from './PerformanceOptimizedContainer.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { LoadingStates } from './LoadingStates.js';

interface AchievementJarProgressPageProps {
  fullHistory: string;
  categoryMap: Record<string, any>;
  onScopeChange?: (scope: 'today' | 'weekly' | 'monthly') => void;
  // Legacy compatibility props
  progressScope?: 'today' | 'weekly' | 'monthly';
  setProgressScope?: (scope: 'today' | 'weekly' | 'monthly') => void;
}

/**
 * Main Achievement Jar Progress Page Component
 * Provides smooth transition from legacy progress page to new Achievement Jar system
 */
export const AchievementJarProgressPage: React.FC<AchievementJarProgressPageProps> = ({
  fullHistory,
  categoryMap,
  onScopeChange,
  progressScope = 'today',
  setProgressScope
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [useNewInterface, setUseNewInterface] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    enablePhysics: true,
    enableCelebrations: true,
    enableSounds: true,
    performanceMode: 'auto' as 'high' | 'medium' | 'low' | 'auto'
  });

  // Load user preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifeos_achievement_jar_preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setUserPreferences(prev => ({ ...prev, ...preferences }));
      }
    } catch (error) {
      console.warn('Failed to load Achievement Jar preferences:', error);
    }
  }, []);

  // Save user preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<typeof userPreferences>) => {
    const updated = { ...userPreferences, ...newPreferences };
    setUserPreferences(updated);
    try {
      localStorage.setItem('lifeos_achievement_jar_preferences', JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save Achievement Jar preferences:', error);
    }
  }, [userPreferences]);

  // Handle scope changes with smooth transitions
  const handleScopeChange = useCallback((newScope: 'today' | 'weekly' | 'monthly') => {
    setIsTransitioning(true);
    
    // Call legacy setter if provided
    if (setProgressScope) {
      setProgressScope(newScope);
    }
    
    // Call new callback if provided
    if (onScopeChange) {
      onScopeChange(newScope);
    }
    
    // End transition after animation
    setTimeout(() => setIsTransitioning(false), 300);
  }, [setProgressScope, onScopeChange]);

  // Memoized scope selector component
  const ScopeSelector = useMemo(() => (
    <div className="bg-white p-1.5 rounded-2xl shadow-sm flex gap-1 border border-slate-100 mb-6">
      {(['today', 'weekly', 'monthly'] as const).map(scope => (
        <button 
          key={scope} 
          onClick={() => handleScopeChange(scope)} 
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
            progressScope === scope 
              ? 'bg-gradient-to-r from-airy-blue-accent to-airy-blue-cloud text-white shadow-airy-blue-accent' 
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
          }`}
          disabled={isTransitioning}
        >
          {scope === 'today' ? '今日' : scope === 'weekly' ? '本周' : '本月'}
        </button>
      ))}
    </div>
  ), [progressScope, handleScopeChange, isTransitioning]);

  // Settings panel for user preferences
  const SettingsPanel = useMemo(() => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-airy-gray-dark">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        视觉效果设置
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={userPreferences.enablePhysics}
            onChange={(e) => savePreferences({ enablePhysics: e.target.checked })}
            className="w-4 h-4 text-airy-blue-accent rounded focus:ring-airy-blue-accent"
          />
          <span className="text-sm font-medium text-airy-gray-dark">物理效果</span>
        </label>
        
        <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={userPreferences.enableCelebrations}
            onChange={(e) => savePreferences({ enableCelebrations: e.target.checked })}
            className="w-4 h-4 text-airy-blue-accent rounded focus:ring-airy-blue-accent"
          />
          <span className="text-sm font-medium text-airy-gray-dark">庆祝动画</span>
        </label>
        
        <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={userPreferences.enableSounds}
            onChange={(e) => savePreferences({ enableSounds: e.target.checked })}
            className="w-4 h-4 text-airy-blue-accent rounded focus:ring-airy-blue-accent"
          />
          <span className="text-sm font-medium text-airy-gray-dark">音效</span>
        </label>
        
        <div className="p-3">
          <label className="block text-sm font-medium text-airy-gray-dark mb-2">性能模式</label>
          <select
            value={userPreferences.performanceMode}
            onChange={(e) => savePreferences({ performanceMode: e.target.value as any })}
            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-airy-blue-accent focus:border-transparent"
          >
            <option value="auto">自动</option>
            <option value="high">高性能</option>
            <option value="medium">中等</option>
            <option value="low">省电模式</option>
          </select>
        </div>
      </div>
    </div>
  ), [userPreferences, savePreferences]);

  // Interface toggle for smooth transition
  const InterfaceToggle = useMemo(() => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-airy-gray-dark">Achievement Jar 可视化</h4>
          <p className="text-sm text-airy-gray-text">使用新的3D进度可视化界面</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useNewInterface}
            onChange={(e) => {
              setIsTransitioning(true);
              setUseNewInterface(e.target.checked);
              setTimeout(() => setIsTransitioning(false), 500);
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-airy-blue-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-airy-blue-accent"></div>
        </label>
      </div>
    </div>
  ), [useNewInterface]);

  // Main content with transition effects
  const MainContent = useMemo(() => {
    if (!useNewInterface) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-airy-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-airy-blue-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-airy-gray-dark mb-2">传统进度视图</h3>
            <p className="text-airy-gray-text mb-6">切换到上方开关启用 Achievement Jar 3D 可视化</p>
            <div className="text-sm text-airy-gray-text">
              当前使用传统的进度统计界面
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <ErrorBoundary>
          <PerformanceOptimizedContainer
            fullHistory={fullHistory}
            categoryMap={categoryMap}
            timeRange={progressScope}
            onScopeChange={handleScopeChange}
            userPreferences={userPreferences}
          />
        </ErrorBoundary>
      </div>
    );
  }, [useNewInterface, isTransitioning, fullHistory, categoryMap, progressScope, handleScopeChange, userPreferences]);

  return (
    <div className="space-y-6 animate-in">
      {/* Scope Selector */}
      {ScopeSelector}
      
      {/* Interface Toggle */}
      {InterfaceToggle}
      
      {/* Settings Panel */}
      {useNewInterface && SettingsPanel}
      
      {/* Main Content */}
      {MainContent}
      
      {/* Loading Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingStates 
            isLoading={true} 
            message="切换界面中..." 
            type="transition"
          />
        </div>
      )}
    </div>
  );
};

export default AchievementJarProgressPage;