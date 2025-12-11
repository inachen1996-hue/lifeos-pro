/**
 * Achievement Jar Progress Visualization - InteractionDock Component
 * Three arcade-style celebration buttons with haptic feedback and animations
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { InteractionDockProps, CelebrationType } from './types.js';
import { useCelebrationIntegration } from './CelebrationIntegration';
import { generateCelebrationButtonStyle, generateFrostedGlassStyle } from './AiryMacaronStyles.js';
import { useViewport, useResponsiveConfig, useTouchCapabilities } from './ResponsiveDesign.js';

interface CelebrationButtonProps {
  type: CelebrationType;
  icon: string;
  themeColor: string;
  gradientColors: [string, string];
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Individual celebration button component
 */
const CelebrationButton: React.FC<CelebrationButtonProps> = ({
  type,
  icon,
  themeColor,
  gradientColors,
  onClick,
  disabled = false,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle press start (mouse down / touch start)
  const handlePressStart = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    setIsAnimating(true);
    
    // Trigger haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [disabled]);

  // Handle press end (mouse up / touch end)
  const handlePressEnd = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    
    // Trigger celebration after release animation
    timeoutRef.current = setTimeout(() => {
      onClick();
      setIsAnimating(false);
    }, 150); // Match animation duration
  }, [disabled, onClick]);

  // Handle press cancel (mouse leave while pressed)
  const handlePressCancel = useCallback(() => {
    setIsPressed(false);
    setIsAnimating(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Generate enhanced button styling with airy macaron aesthetics
  const buttonStyle = generateCelebrationButtonStyle(themeColor, gradientColors, isPressed, isAnimating);
  
  return (
    <button
      ref={buttonRef}
      className={`celebration-button relative overflow-hidden border-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{
        ...buttonStyle,
        opacity: disabled ? 0.5 : 1
      }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressCancel}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressCancel}
      disabled={disabled}
      aria-label={`${type} celebration button`}
    >
      {/* Enhanced gradient overlay with airy aesthetics */}
      <div 
        className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.4) 50%, transparent 70%)'
        }}
      />
      
      {/* Icon container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-2xl select-none"
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
            transform: isPressed ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.15s ease-out'
          }}
        >
          {icon}
        </span>
      </div>
      
      {/* Enhanced ripple effect with airy glow */}
      {isAnimating && (
        <div 
          className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${themeColor}30 0%, ${themeColor}10 50%, transparent 80%)`,
            animation: 'gentle-pulse 0.6s ease-out'
          }}
        />
      )}
      
      {/* Press indicator */}
      {isPressed && (
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%)`
          }}
        />
      )}
    </button>
  );
};

/**
 * Main InteractionDock component
 */
export const InteractionDock: React.FC<InteractionDockProps> = ({
  onCelebration,
  disabled = false,
  className = ''
}) => {
  const [lastCelebration, setLastCelebration] = useState<CelebrationType | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  
  // Responsive design hooks
  const viewport = useViewport();
  const responsiveConfig = useResponsiveConfig();
  const touchCapabilities = useTouchCapabilities();
  
  // Initialize celebration integration system
  const { 
    isActive: isCelebrationActive,
    triggerCelebration,
    handleComplete,
    integrationRef
  } = useCelebrationIntegration();

  // Handle celebration with cooldown to prevent spam
  const handleCelebration = useCallback(async (type: CelebrationType) => {
    if (disabled || cooldownActive || isCelebrationActive) return;
    
    setLastCelebration(type);
    setCooldownActive(true);
    
    try {
      // Trigger integrated celebration (sound + visual effects)
      await triggerCelebration(type);
      
      // Trigger the celebration callback
      onCelebration(type);
    } catch (error) {
      console.error('Failed to trigger celebration:', error);
    }
    
    // Reset cooldown after 1 second
    setTimeout(() => {
      setCooldownActive(false);
    }, 1000);
  }, [disabled, cooldownActive, isCelebrationActive, onCelebration, triggerCelebration]);

  // Responsive button configurations
  const buttonConfigs = [
    {
      type: 'drum' as CelebrationType,
      icon: '🥁',
      themeColor: '#8B5CF6', // Purple
      gradientColors: ['#A855F7', '#7C3AED'] as [string, string],
      label: '鼓声庆祝'
    },
    {
      type: 'clap' as CelebrationType,
      icon: '👏',
      themeColor: '#EF4444', // Red
      gradientColors: ['#F87171', '#DC2626'] as [string, string],
      label: '掌声庆祝'
    },
    {
      type: 'cheer' as CelebrationType,
      icon: '🎉',
      themeColor: '#F97316', // Orange
      gradientColors: ['#FB923C', '#EA580C'] as [string, string],
      label: '欢呼庆祝'
    }
  ];

  // Calculate responsive spacing
  const buttonSpacing = viewport.isMobile ? 6 : 8;
  const containerPadding = viewport.isMobile ? 6 : 8;

  return (
    <>
      <div 
        className={`interaction-dock flex items-center justify-center ${className}`}
        style={{
          gap: `${buttonSpacing * 4}px`,
          padding: `${containerPadding * 4}px`,
          // Ensure minimum touch target spacing on mobile
          minHeight: touchCapabilities.hasTouch ? `${responsiveConfig.touchTargets.minSize + containerPadding * 8}px` : 'auto'
        }}
      >
        {/* Enhanced Dock background with airy macaron styling */}
        <div 
          className="absolute inset-0 rounded-3xl airy-backdrop-blur"
          style={{
            ...generateFrostedGlassStyle('light'),
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(248, 250, 252, 0.15) 50%, rgba(241, 245, 249, 0.1) 100%)',
            boxShadow: '0 12px 40px rgba(148, 163, 184, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        />
        
        {/* Enhanced Responsive Buttons container */}
        <div 
          className="relative flex items-center"
          style={{
            gap: `${buttonSpacing * 4}px`,
            flexWrap: viewport.isMobile && viewport.orientation === 'portrait' ? 'wrap' : 'nowrap',
            justifyContent: 'center'
          }}
        >
          {buttonConfigs.map((config) => (
            <CelebrationButton
              key={config.type}
              type={config.type}
              icon={config.icon}
              themeColor={config.themeColor}
              gradientColors={config.gradientColors}
              onClick={() => handleCelebration(config.type)}
              disabled={disabled || cooldownActive || isCelebrationActive}
              className={lastCelebration === config.type ? 'animate-bounce' : ''}
            />
          ))}
        </div>
        
        {/* Enhanced Cooldown indicator with airy styling */}
        {(cooldownActive || isCelebrationActive) && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div 
              className="px-4 py-2 airy-backdrop-blur rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 12px rgba(148, 163, 184, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}
            >
              <span 
                className="text-xs font-medium"
                style={{
                  color: 'var(--airy-text-secondary)',
                  letterSpacing: '0.025em'
                }}
              >
                庆祝中...
              </span>
            </div>
          </div>
        )}
        
        {/* Enhanced Accessibility hint */}
        <div className="sr-only">
          庆祝按钮组：包含鼓声、掌声和欢呼三种庆祝方式，点击按钮可触发相应的音效和视觉庆祝效果
        </div>
      </div>

    </>
  );
};

/**
 * Hook for managing celebration state and effects
 */
export const useCelebrationEffects = () => {
  const [activeCelebrations, setActiveCelebrations] = useState<CelebrationType[]>([]);
  const [celebrationHistory, setCelebrationHistory] = useState<{
    type: CelebrationType;
    timestamp: number;
  }[]>([]);

  const addCelebration = useCallback((type: CelebrationType) => {
    setActiveCelebrations(prev => [...prev, type]);
    setCelebrationHistory(prev => [
      ...prev.slice(-9), // Keep last 10 celebrations
      { type, timestamp: Date.now() }
    ]);

    // Remove from active after animation duration
    setTimeout(() => {
      setActiveCelebrations(prev => prev.filter(t => t !== type));
    }, 3000); // 3 second celebration duration
  }, []);

  const clearCelebrations = useCallback(() => {
    setActiveCelebrations([]);
  }, []);

  return {
    activeCelebrations,
    celebrationHistory,
    addCelebration,
    clearCelebrations
  };
};