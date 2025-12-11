/**
 * GlassIcon Component - Renders emoji icons with glass morphism effect
 * Features:
 * - Frosted glass container with blur effect
 * - Dynamic glow effect following category colors
 * - Responsive sizing
 * - Smooth animations
 */

import React from 'react';
import { CategoryColorService } from '../utils/category-colors.js';
import type { GlassIconProps } from '../types/icon-types.js';

export const GlassIcon: React.FC<GlassIconProps> = ({
  icon,
  categoryColor,
  size = 'medium',
  className = '',
  onClick,
  isSelected = false
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-8 h-8',
      text: 'text-sm',
      blur: 'backdrop-blur-sm',
      shadow: '0 2px 8px -1px'
    },
    medium: {
      container: 'w-12 h-12',
      text: 'text-lg',
      blur: 'backdrop-blur-md',
      shadow: '0 4px 12px -2px'
    },
    large: {
      container: 'w-16 h-16',
      text: 'text-2xl',
      blur: 'backdrop-blur-lg',
      shadow: '0 6px 16px -3px'
    }
  };

  const config = sizeConfig[size];
  
  // Get glow color from category
  const glowColor = CategoryColorService.getGlowEffect(categoryColor);
  const shadowColor = CategoryColorService.getShadowColor(categoryColor);

  // Dynamic styles
  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.9)',
    boxShadow: `${config.shadow} ${glowColor}, inset 0 1px 4px rgba(255, 255, 255, 0.8)`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(isSelected && {
      boxShadow: `${config.shadow} ${shadowColor}, 0 0 0 2px ${CategoryColorService.getThemeColor(categoryColor)}, inset 0 2px 8px rgba(255, 255, 255, 0.9)`,
      transform: 'scale(1.05)'
    })
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        ${config.container}
        rounded-full
        ${config.blur}
        flex items-center justify-center
        cursor-pointer
        select-none
        relative
        overflow-hidden
        hover:scale-110
        active:scale-95
        ${className}
      `}
      style={containerStyle}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Emoji Icon */}
      <span 
        className={`${config.text} relative z-10 drop-shadow-sm`}
        style={{ 
          filter: 'drop-shadow(0 1px 2px rgba(255, 255, 255, 0.8))',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}
      >
        {icon}
      </span>
      
      {/* Glass shine effect */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none"
        style={{ opacity: isSelected ? 0.8 : 0.6 }}
      />
      
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(4px)'
        }}
      />
    </div>
  );
};

export default GlassIcon;