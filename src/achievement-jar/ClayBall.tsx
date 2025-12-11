/**
 * Achievement Jar Progress Visualization - ClayBall Component
 * Individual 3D clay balls representing time categories with enhanced Airy Macaron styling
 */

import React, { useMemo, useState, useCallback } from 'react';
import { ClayBallProps, MacaronColor } from './types.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { generateClayBallStyle, getAiryMacaronColor } from './AiryMacaronStyles.js';
import { useViewport, useResponsiveConfig, useTouchCapabilities } from './ResponsiveDesign.js';

interface ClayBallComponentProps extends ClayBallProps {
  onClick?: () => void;
  className?: string;
  animationDelay?: number;
}

export const ClayBall: React.FC<ClayBallComponentProps> = ({
  id,
  categoryId,
  size,
  color,
  position,
  isSpecial = false,
  glowIntensity = 0.1,
  priority,
  onClick,
  className = '',
  animationDelay = 0
}) => {
  // Responsive design hooks
  const viewport = useViewport();
  const responsiveConfig = useResponsiveConfig();
  const touchCapabilities = useTouchCapabilities();

  // Calculate responsive size
  const responsiveSize = useMemo(() => {
    const scaledSize = Math.round(size * responsiveConfig.ballSizes.scale);
    // Ensure minimum touch target size on mobile
    if (touchCapabilities.hasTouch && onClick) {
      return Math.max(scaledSize, responsiveConfig.touchTargets.minSize);
    }
    return scaledSize;
  }, [size, responsiveConfig, touchCapabilities.hasTouch, onClick]);

  // Generate enhanced airy macaron styling with responsive size
  const ballStyle = useMemo(() => 
    generateClayBallStyle(color, priority, responsiveSize, isSpecial), 
    [color, priority, responsiveSize, isSpecial]
  );
  
  // Get airy macaron color configuration
  const colorConfig = useMemo(() => getAiryMacaronColor(color), [color]);
  
  // Calculate enhanced glow effect with responsive sizing
  const glowEffect = useMemo(() => {
    const baseIntensity = isSpecial ? 1.0 : glowIntensity;
    const glowColor = isSpecial ? '#FFD700' : colorConfig.glow;
    
    // Reduce glow effects on low-performance devices
    const performanceScale = responsiveConfig.animations.complexity === 'low' ? 0.5 : 1.0;
    
    return {
      intensity: baseIntensity * performanceScale,
      color: glowColor,
      blur: Math.max(12, responsiveSize * 0.4),
      spread: Math.max(4, responsiveSize * 0.1)
    };
  }, [isSpecial, glowIntensity, colorConfig.glow, responsiveSize, responsiveConfig.animations.complexity]);

  // Enhanced star shape for special achievement balls
  const starShape = isSpecial && {
    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    filter: `drop-shadow(0 0 ${glowEffect.blur}px ${glowEffect.color}) drop-shadow(0 0 ${glowEffect.spread}px ${glowEffect.color}80)`
  };

  return (
    <div
      className={`clay-ball relative cursor-pointer ${className}`}
      style={{
        ...ballStyle,
        left: `${position.x}px`,
        top: `${position.y}px`,
        animationDelay: `${animationDelay}ms`,
        zIndex: priority === 'high' ? 10 : isSpecial ? 8 : 5,
        ...starShape
      }}
      onClick={onClick}
    >
      {/* Enhanced Main Clay Ball with Airy Macaron Styling */}
      <div
        className="clay-ball-main absolute inset-0 rounded-full"
        style={{
          background: colorConfig.gradient,
          boxShadow: responsiveConfig.animations.complexity !== 'low' ? `
            0 ${responsiveSize * 0.12}px ${responsiveSize * 0.35}px ${colorConfig.shadow},
            0 ${responsiveSize * 0.06}px ${responsiveSize * 0.18}px rgba(100, 116, 139, 0.08),
            inset 0 ${responsiveSize * 0.06}px ${responsiveSize * 0.12}px rgba(255, 255, 255, 0.7),
            inset 0 -${responsiveSize * 0.04}px ${responsiveSize * 0.1}px rgba(100, 116, 139, 0.1)
          ` : `0 ${responsiveSize * 0.08}px ${responsiveSize * 0.2}px ${colorConfig.shadow}`,
          borderRadius: '50%',
          ...(isSpecial && starShape)
        }}
      />

      {/* Enhanced Clay Texture Overlay with Airy Aesthetics */}
      <div
        className="clay-texture absolute inset-0 rounded-full opacity-50"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.6) 0%, transparent 45%),
            radial-gradient(circle at 75% 75%, rgba(100, 116, 139, 0.08) 0%, transparent 45%),
            conic-gradient(from 45deg at 50% 50%, transparent 0deg, rgba(255, 255, 255, 0.03) 90deg, transparent 180deg, rgba(100, 116, 139, 0.02) 270deg, transparent 360deg)
          `,
          borderRadius: '50%',
          ...(isSpecial && starShape)
        }}
      />

      {/* Enhanced Highlight Spot with Responsive Sizing */}
      {responsiveConfig.animations.complexity !== 'low' && (
        <>
          <div
            className="clay-highlight absolute rounded-full"
            style={{
              width: `${responsiveSize * 0.35}px`,
              height: `${responsiveSize * 0.28}px`,
              top: `${responsiveSize * 0.12}px`,
              left: `${responsiveSize * 0.18}px`,
              background: `radial-gradient(ellipse, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 60%, transparent 100%)`,
              filter: 'blur(2px)',
              transform: 'rotate(-12deg)',
              opacity: 0.8
            }}
          />

          {/* Subtle Secondary Highlight */}
          <div
            className="clay-secondary-highlight absolute rounded-full"
            style={{
              width: `${responsiveSize * 0.15}px`,
              height: `${responsiveSize * 0.12}px`,
              top: `${responsiveSize * 0.25}px`,
              right: `${responsiveSize * 0.2}px`,
              background: `radial-gradient(ellipse, rgba(255, 255, 255, 0.5) 0%, transparent 100%)`,
              filter: 'blur(1px)',
              opacity: 0.6
            }}
          />
        </>
      )}

      {/* Enhanced Priority Indicator Ring with Airy Glow */}
      {priority === 'high' && (
        <div
          className="priority-ring absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${colorConfig.accent}`,
            borderRadius: '50%',
            opacity: 0.7,
            transform: 'scale(1.15)',
            boxShadow: `0 0 ${responsiveSize * 0.3}px ${colorConfig.glow}, inset 0 0 ${responsiveSize * 0.2}px ${colorConfig.accent}40`,
            animation: 'gentle-pulse 3s ease-in-out infinite'
          }}
        />
      )}

      {/* Enhanced Special Achievement Sparkle Effect with Responsive Sizing */}
      {isSpecial && responsiveConfig.animations.enabled && (
        <>
          <div
            className="sparkle-1 absolute rounded-full"
            style={{
              width: `${responsiveSize * 0.08}px`,
              height: `${responsiveSize * 0.08}px`,
              top: `${responsiveSize * 0.08}px`,
              right: `${responsiveSize * 0.08}px`,
              background: 'radial-gradient(circle, #FEF3C7 0%, #FDE047 70%, transparent 100%)',
              boxShadow: responsiveConfig.animations.complexity !== 'low' 
                ? '0 0 8px #FDE047, 0 0 16px #FEF3C7' 
                : '0 0 4px #FDE047',
              animation: responsiveConfig.animations.enabled 
                ? `gentle-pulse ${responsiveConfig.animations.duration * 6}ms ease-in-out infinite` 
                : 'none',
              animationDelay: '0s'
            }}
          />
          <div
            className="sparkle-2 absolute rounded-full"
            style={{
              width: `${responsiveSize * 0.06}px`,
              height: `${responsiveSize * 0.06}px`,
              bottom: `${responsiveSize * 0.12}px`,
              left: `${responsiveSize * 0.12}px`,
              background: 'radial-gradient(circle, #FFFBEB 0%, #FEF3C7 70%, transparent 100%)',
              boxShadow: responsiveConfig.animations.complexity !== 'low' 
                ? '0 0 6px #FEF3C7, 0 0 12px #FFFBEB' 
                : '0 0 3px #FEF3C7',
              animation: responsiveConfig.animations.enabled 
                ? `gentle-pulse ${responsiveConfig.animations.duration * 8}ms ease-in-out infinite` 
                : 'none',
              animationDelay: '0.8s'
            }}
          />
          <div
            className="sparkle-3 absolute rounded-full"
            style={{
              width: `${responsiveSize * 0.07}px`,
              height: `${responsiveSize * 0.07}px`,
              top: `${responsiveSize * 0.55}px`,
              right: `${responsiveSize * 0.18}px`,
              background: 'radial-gradient(circle, #FEF08A 0%, #FACC15 70%, transparent 100%)',
              boxShadow: responsiveConfig.animations.complexity !== 'low' 
                ? '0 0 7px #FACC15, 0 0 14px #FEF08A' 
                : '0 0 4px #FACC15',
              animation: responsiveConfig.animations.enabled 
                ? `gentle-pulse ${responsiveConfig.animations.duration * 7}ms ease-in-out infinite` 
                : 'none',
              animationDelay: '1.5s'
            }}
          />
          
          {/* Ambient golden glow for special balls - only on high performance */}
          {responsiveConfig.animations.complexity === 'high' && (
            <div
              className="special-glow absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(254, 240, 138, 0.1) 0%, transparent 70%)',
                transform: 'scale(1.8)',
                animation: `gentle-pulse ${responsiveConfig.animations.duration * 13}ms ease-in-out infinite`,
                filter: 'blur(8px)'
              }}
            />
          )}
        </>
      )}
    </div>
  );
};



/**
 * ClayBallCollection Component - renders multiple clay balls with physics
 */
interface ClayBallCollectionProps {
  balls: ClayBallProps[];
  onBallClick?: (categoryId: string) => void;
  containerWidth: number;
  containerHeight: number;
  enablePhysics?: boolean;
  onPerformanceUpdate?: (metrics: any) => void;
}

export const ClayBallCollection: React.FC<ClayBallCollectionProps> = ({
  balls,
  onBallClick,
  containerWidth,
  containerHeight,
  enablePhysics = true,
  onPerformanceUpdate
}) => {
  const [ballPositions, setBallPositions] = useState<{ [ballId: string]: { x: number; y: number } }>({});
  
  // Handle position updates from physics engine
  const handlePositionsUpdate = useCallback((positions: { [ballId: string]: { x: number; y: number } }) => {
    setBallPositions(positions);
  }, []);

  // Render balls with physics-based or fallback positions
  const positionedBalls = useMemo(() => {
    return balls.map((ball) => {
      const physicsPosition = ballPositions[ball.id];
      return {
        ...ball,
        position: physicsPosition || ball.position
      };
    });
  }, [balls, ballPositions]);

  return (
    <div className="clay-ball-collection relative w-full h-full">
      {/* Physics Engine (invisible, handles positioning) */}
      <PhysicsEngine
        balls={balls}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        onPositionsUpdate={handlePositionsUpdate}
        onPerformanceUpdate={onPerformanceUpdate}
        enablePhysics={enablePhysics}
      />
      
      {/* Rendered Clay Balls */}
      {positionedBalls.map((ball, index) => (
        <ClayBall
          key={ball.id}
          {...ball}
          onClick={() => onBallClick?.(ball.categoryId)}
          animationDelay={index * 100}
        />
      ))}
    </div>
  );
};