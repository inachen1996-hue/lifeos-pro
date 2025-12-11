/**
 * Achievement Jar Accessibility Features
 * Provides accessibility enhancements and ARIA support
 * Implements Requirements 5.1, 5.4
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AccessibilityOptions {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

interface AccessibilityProps {
  children: React.ReactNode;
  options?: Partial<AccessibilityOptions>;
  className?: string;
}

/**
 * Accessibility Context
 */
const AccessibilityContext = React.createContext<{
  options: AccessibilityOptions;
  updateOptions: (newOptions: Partial<AccessibilityOptions>) => void;
}>({
  options: {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true
  },
  updateOptions: () => {}
});

/**
 * Accessibility Provider Component
 */
export const AccessibilityProvider: React.FC<AccessibilityProps> = ({
  children,
  options: initialOptions = {},
  className = ''
}) => {
  const [options, setOptions] = useState<AccessibilityOptions>(() => {
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const screenReaderDetected = detectScreenReader();

    return {
      reduceMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      largeText: false,
      screenReader: screenReaderDetected,
      keyboardNavigation: true,
      focusIndicators: true,
      ...initialOptions
    };
  });

  const updateOptions = useCallback((newOptions: Partial<AccessibilityOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      updateOptions({ reduceMotion: e.matches });
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updateOptions({ highContrast: e.matches });
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, [updateOptions]);

  // Apply accessibility classes
  const accessibilityClasses = [
    options.reduceMotion && 'reduce-motion',
    options.highContrast && 'high-contrast',
    options.largeText && 'large-text',
    options.screenReader && 'screen-reader-optimized',
    options.keyboardNavigation && 'keyboard-navigation',
    options.focusIndicators && 'focus-indicators'
  ].filter(Boolean).join(' ');

  return (
    <AccessibilityContext.Provider value={{ options, updateOptions }}>
      <div className={`accessibility-container ${accessibilityClasses} ${className}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

/**
 * Screen Reader Detection
 */
function detectScreenReader(): boolean {
  // Check for common screen reader indicators
  const indicators = [
    'speechSynthesis' in window,
    navigator.userAgent.includes('NVDA'),
    navigator.userAgent.includes('JAWS'),
    navigator.userAgent.includes('VoiceOver'),
    'webkitSpeechSynthesis' in window
  ];

  return indicators.some(Boolean);
}

/**
 * Accessible Achievement Jar Container
 */
export const AccessibleAchievementJar: React.FC<{
  children: React.ReactNode;
  ariaLabel?: string;
  description?: string;
  className?: string;
}> = ({ children, ariaLabel = "成就罐进度可视化", description, className = '' }) => {
  const { options } = React.useContext(AccessibilityContext);
  const containerRef = useRef<HTMLDivElement>(null);

  // Announce changes to screen readers
  const announceChange = useCallback((message: string) => {
    if (options.screenReader) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [options.screenReader]);

  return (
    <div
      ref={containerRef}
      className={`accessible-achievement-jar ${className}`}
      role="region"
      aria-label={ariaLabel}
      aria-describedby={description ? 'achievement-jar-description' : undefined}
      tabIndex={options.keyboardNavigation ? 0 : -1}
    >
      {description && (
        <div id="achievement-jar-description" className="sr-only">
          {description}
        </div>
      )}
      
      {/* Skip link for keyboard users */}
      {options.keyboardNavigation && (
        <a
          href="#achievement-jar-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
        >
          跳转到成就罐内容
        </a>
      )}
      
      <div id="achievement-jar-content">
        {children}
      </div>
    </div>
  );
};

/**
 * Accessible Button Component
 */
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, ariaLabel, description, disabled = false, className = '' }) => {
  const { options } = React.useContext(AccessibilityContext);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
      
      // Provide haptic feedback if available
      if ('vibrate' in navigator && options.keyboardNavigation) {
        navigator.vibrate(50);
      }
    }
  }, [onClick, disabled, options.keyboardNavigation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <button
      ref={buttonRef}
      className={`accessible-button ${className} ${options.focusIndicators ? 'focus-visible:ring-2 focus-visible:ring-blue-500' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={description ? `${ariaLabel}-description` : undefined}
      disabled={disabled}
      tabIndex={options.keyboardNavigation ? 0 : -1}
    >
      {description && (
        <span id={`${ariaLabel}-description`} className="sr-only">
          {description}
        </span>
      )}
      {children}
    </button>
  );
};

/**
 * Accessible Progress Indicator
 */
export const AccessibleProgress: React.FC<{
  value: number;
  max: number;
  label: string;
  description?: string;
  className?: string;
}> = ({ value, max, label, description, className = '' }) => {
  const { options } = React.useContext(AccessibilityContext);
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={`accessible-progress ${className}`} role="group" aria-labelledby="progress-label">
      <div id="progress-label" className="text-sm font-medium text-gray-700 mb-2">
        {label}
      </div>
      
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}% 完成`}
        aria-describedby={description ? 'progress-description' : undefined}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <div
          className={`bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all ${options.reduceMotion ? '' : 'duration-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {description && (
        <div id="progress-description" className="sr-only">
          {description}
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-1" aria-hidden="true">
        {value} / {max} ({percentage}%)
      </div>
    </div>
  );
};

/**
 * Accessible Modal Component
 */
export const AccessibleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className = '' }) => {
  const { options } = React.useContext(AccessibilityContext);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      // Return focus to previous element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 ${className}`}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            {title}
          </h2>
          <AccessibleButton
            onClick={onClose}
            ariaLabel="关闭对话框"
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </AccessibleButton>
        </div>
        
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Accessibility Settings Panel
 */
export const AccessibilitySettings: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const { options, updateOptions } = React.useContext(AccessibilityContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (key: keyof AccessibilityOptions) => {
    updateOptions({ [key]: !options[key] });
  };

  return (
    <div className={`accessibility-settings ${className}`}>
      <AccessibleButton
        onClick={() => setIsOpen(true)}
        ariaLabel="打开无障碍设置"
        description="调整无障碍功能选项"
        className="p-2 text-gray-600 hover:text-gray-800"
      >
        ♿
      </AccessibleButton>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="无障碍设置"
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="reduce-motion" className="text-sm font-medium">
              减少动画效果
            </label>
            <input
              id="reduce-motion"
              type="checkbox"
              checked={options.reduceMotion}
              onChange={() => toggleOption('reduceMotion')}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="high-contrast" className="text-sm font-medium">
              高对比度模式
            </label>
            <input
              id="high-contrast"
              type="checkbox"
              checked={options.highContrast}
              onChange={() => toggleOption('highContrast')}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="large-text" className="text-sm font-medium">
              大字体模式
            </label>
            <input
              id="large-text"
              type="checkbox"
              checked={options.largeText}
              onChange={() => toggleOption('largeText')}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="keyboard-nav" className="text-sm font-medium">
              键盘导航
            </label>
            <input
              id="keyboard-nav"
              type="checkbox"
              checked={options.keyboardNavigation}
              onChange={() => toggleOption('keyboardNavigation')}
              className="rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="focus-indicators" className="text-sm font-medium">
              焦点指示器
            </label>
            <input
              id="focus-indicators"
              type="checkbox"
              checked={options.focusIndicators}
              onChange={() => toggleOption('focusIndicators')}
              className="rounded"
            />
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
};

/**
 * Hook for using accessibility features
 */
export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  
  return context;
};

export default AccessibilityProvider;