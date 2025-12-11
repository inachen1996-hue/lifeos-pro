/**
 * Achievement Jar Progress Visualization - Airy Macaron Styling System
 * Comprehensive color system with low saturation, high brightness colors
 * and frosted glass effects for healing aesthetics
 */

import React from 'react';
import { MacaronColor, CategoryPriority } from './types.js';

// Airy Macaron Color Palette - Low saturation, high brightness
export const airyMacaronColors = {
  // Primary category colors - extremely soft and light
  'bg-macaron-blue': {
    primary: '#E8F4FD',      // Very light blue
    secondary: '#D1E9FC',    // Slightly deeper blue
    accent: '#B3DDFB',       // Accent blue
    glow: '#A2D2FF',         // Glow effect
    shadow: 'rgba(162, 210, 255, 0.15)',
    gradient: 'linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 50%, #D1E9FC 100%)'
  },
  'bg-macaron-green': {
    primary: '#F0FDF4',      // Very light green
    secondary: '#DCFCE7',    // Slightly deeper green
    accent: '#BBF7D0',       // Accent green
    glow: '#A7F3D0',         // Glow effect
    shadow: 'rgba(167, 243, 208, 0.15)',
    gradient: 'linear-gradient(135deg, #F7FFFA 0%, #F0FDF4 50%, #DCFCE7 100%)'
  },
  'bg-macaron-pink': {
    primary: '#FDF2F8',      // Very light pink
    secondary: '#FCE7F3',    // Slightly deeper pink
    accent: '#F9A8D4',       // Accent pink
    glow: '#F5C2D6',         // Glow effect
    shadow: 'rgba(245, 194, 214, 0.15)',
    gradient: 'linear-gradient(135deg, #FFFAFC 0%, #FDF2F8 50%, #FCE7F3 100%)'
  },
  'bg-macaron-purple': {
    primary: '#FAF5FF',      // Very light purple
    secondary: '#F3E8FF',    // Slightly deeper purple
    accent: '#C084FC',       // Accent purple
    glow: '#DDD6FE',         // Glow effect
    shadow: 'rgba(221, 214, 254, 0.15)',
    gradient: 'linear-gradient(135deg, #FEFCFF 0%, #FAF5FF 50%, #F3E8FF 100%)'
  },
  'bg-macaron-orange': {
    primary: '#FFF7ED',      // Very light orange
    secondary: '#FFEDD5',    // Slightly deeper orange
    accent: '#FB923C',       // Accent orange
    glow: '#FED7AA',         // Glow effect
    shadow: 'rgba(254, 215, 170, 0.15)',
    gradient: 'linear-gradient(135deg, #FFFBF7 0%, #FFF7ED 50%, #FFEDD5 100%)'
  },
  'bg-macaron-yellow': {
    primary: '#FEFCE8',      // Very light yellow
    secondary: '#FEF3C7',    // Slightly deeper yellow
    accent: '#FDE047',       // Accent yellow
    glow: '#FEF08A',         // Glow effect
    shadow: 'rgba(254, 240, 138, 0.15)',
    gradient: 'linear-gradient(135deg, #FFFEF5 0%, #FEFCE8 50%, #FEF3C7 100%)'
  },
  'bg-emerald-200': {
    primary: '#F0FDF4',      // Very light emerald
    secondary: '#D1FAE5',    // Slightly deeper emerald
    accent: '#6EE7B7',       // Accent emerald
    glow: '#A7F3D0',         // Glow effect
    shadow: 'rgba(167, 243, 208, 0.15)',
    gradient: 'linear-gradient(135deg, #F7FFFA 0%, #F0FDF4 50%, #D1FAE5 100%)'
  },
  'bg-macaron-rose': {
    primary: '#FFF1F2',      // Very light rose
    secondary: '#FFE4E6',    // Slightly deeper rose
    accent: '#FB7185',       // Accent rose
    glow: '#FECACA',         // Glow effect
    shadow: 'rgba(254, 202, 202, 0.15)',
    gradient: 'linear-gradient(135deg, #FFFBFB 0%, #FFF1F2 50%, #FFE4E6 100%)'
  }
} as const;

// Priority-based color enhancement
export const priorityColorEnhancement = {
  high: {
    glowIntensity: 1.2,
    shadowSpread: '0 8px 32px',
    borderGlow: '0 0 20px',
    scaleMultiplier: 1.15
  },
  normal: {
    glowIntensity: 0.8,
    shadowSpread: '0 4px 16px',
    borderGlow: '0 0 12px',
    scaleMultiplier: 1.0
  }
} as const;

// Frosted glass effect configurations
export const frostedGlassEffects = {
  light: {
    backdropFilter: 'blur(10px) saturate(180%)',
    background: 'rgba(255, 255, 255, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
  },
  medium: {
    backdropFilter: 'blur(16px) saturate(180%)',
    background: 'rgba(255, 255, 255, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.45)'
  },
  heavy: {
    backdropFilter: 'blur(24px) saturate(200%)',
    background: 'rgba(255, 255, 255, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    boxShadow: '0 16px 48px rgba(31, 38, 135, 0.55)'
  }
} as const;

// Clay texture effects for 3D elements
export const clayTextureEffects = {
  soft: {
    background: (color: string) => `
      radial-gradient(ellipse at top left, ${color} 0%, transparent 50%),
      radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at bottom left, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
      linear-gradient(135deg, ${color} 0%, ${color} 100%)
    `,
    boxShadow: (shadowColor: string) => `
      0 4px 12px ${shadowColor},
      inset 0 2px 4px rgba(255, 255, 255, 0.6),
      inset 0 -2px 4px rgba(0, 0, 0, 0.05)
    `
  },
  medium: {
    background: (color: string) => `
      radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.6) 0%, transparent 40%),
      radial-gradient(ellipse at bottom right, rgba(0, 0, 0, 0.08) 0%, transparent 40%),
      linear-gradient(135deg, ${color} 0%, ${color} 100%)
    `,
    boxShadow: (shadowColor: string) => `
      0 6px 20px ${shadowColor},
      inset 0 3px 6px rgba(255, 255, 255, 0.7),
      inset 0 -3px 6px rgba(0, 0, 0, 0.08)
    `
  },
  prominent: {
    background: (color: string) => `
      radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.8) 0%, transparent 35%),
      radial-gradient(ellipse at bottom right, rgba(0, 0, 0, 0.1) 0%, transparent 35%),
      linear-gradient(135deg, ${color} 0%, ${color} 100%)
    `,
    boxShadow: (shadowColor: string) => `
      0 8px 28px ${shadowColor},
      inset 0 4px 8px rgba(255, 255, 255, 0.8),
      inset 0 -4px 8px rgba(0, 0, 0, 0.1)
    `
  }
} as const;

// Animation configurations for smooth interactions
export const airyAnimations = {
  gentle: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    scale: {
      hover: 'scale(1.02)',
      active: 'scale(0.98)',
      rest: 'scale(1)'
    }
  },
  bouncy: {
    duration: '0.4s',
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    scale: {
      hover: 'scale(1.05)',
      active: 'scale(0.95)',
      rest: 'scale(1)'
    }
  },
  smooth: {
    duration: '0.2s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    scale: {
      hover: 'scale(1.01)',
      active: 'scale(0.99)',
      rest: 'scale(1)'
    }
  }
} as const;

/**
 * Get color configuration for a macaron color
 */
export const getAiryMacaronColor = (color: MacaronColor) => {
  return airyMacaronColors[color] || airyMacaronColors['bg-macaron-blue'];
};

/**
 * Generate clay ball styling with airy macaron aesthetics
 */
export const generateClayBallStyle = (
  color: MacaronColor,
  priority: CategoryPriority,
  size: number,
  isSpecial: boolean = false
) => {
  const colorConfig = getAiryMacaronColor(color);
  const priorityConfig = priorityColorEnhancement[priority];
  const textureLevel = priority === 'high' ? 'prominent' : isSpecial ? 'medium' : 'soft';
  const texture = clayTextureEffects[textureLevel];

  return {
    width: `${size * priorityConfig.scaleMultiplier}px`,
    height: `${size * priorityConfig.scaleMultiplier}px`,
    background: texture.background(colorConfig.primary),
    boxShadow: texture.boxShadow(colorConfig.shadow),
    borderRadius: '50%',
    transition: `all ${airyAnimations.gentle.duration} ${airyAnimations.gentle.easing}`,
    cursor: 'pointer',
    position: 'absolute' as const,
    // Special glow effect for achievements
    ...(isSpecial && {
      filter: `drop-shadow(${priorityConfig.borderGlow} ${colorConfig.glow})`,
      animation: 'gentle-pulse 2s ease-in-out infinite'
    })
  };
};

/**
 * Generate frosted glass container styling
 */
export const generateFrostedGlassStyle = (
  intensity: 'light' | 'medium' | 'heavy' = 'medium',
  customBackground?: string
) => {
  const effect = frostedGlassEffects[intensity];
  
  return {
    ...effect,
    background: customBackground || effect.background,
    WebkitBackdropFilter: effect.backdropFilter,
    borderRadius: '20px',
    position: 'relative' as const
  };
};

/**
 * Generate metric pill styling with airy aesthetics
 */
export const generateMetricPillStyle = (color: MacaronColor, isActive: boolean = false) => {
  const colorConfig = getAiryMacaronColor(color);
  
  return {
    background: colorConfig.gradient,
    border: `1px solid ${colorConfig.accent}40`,
    borderRadius: '32px',
    padding: '12px 20px',
    boxShadow: isActive 
      ? `0 8px 24px ${colorConfig.shadow}, inset 0 2px 4px rgba(255, 255, 255, 0.6)`
      : `0 4px 12px ${colorConfig.shadow}`,
    transition: `all ${airyAnimations.smooth.duration} ${airyAnimations.smooth.easing}`,
    cursor: 'pointer',
    transform: isActive ? airyAnimations.gentle.scale.hover : airyAnimations.gentle.scale.rest,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)'
  };
};

/**
 * Generate celebration button styling with theme colors
 */
export const generateCelebrationButtonStyle = (
  themeColor: string,
  gradientColors: [string, string],
  isPressed: boolean = false,
  isAnimating: boolean = false
) => {
  const baseSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 72 : 80;
  
  return {
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    boxShadow: isPressed 
      ? `0 2px 8px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)`
      : `0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)`,
    transform: isPressed 
      ? airyAnimations.bouncy.scale.active 
      : isAnimating 
        ? airyAnimations.bouncy.scale.hover 
        : airyAnimations.bouncy.scale.rest,
    transition: `all ${airyAnimations.bouncy.duration} ${airyAnimations.bouncy.easing}`,
    // Add subtle glow effect
    '&::before': {
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 50%)',
      borderRadius: '50%',
      opacity: 0.3,
      pointerEvents: 'none' as const
    }
  };
};

/**
 * Airy Macaron Style Provider Component
 * Injects CSS custom properties and keyframes
 */
export const AiryMacaronStyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <style>{`
        /* Airy Macaron CSS Custom Properties */
        :root {
          --airy-bg-primary: #FEFEFE;
          --airy-bg-secondary: #FBFBFB;
          --airy-text-primary: #64748B;
          --airy-text-secondary: #94A3B8;
          --airy-border-light: rgba(255, 255, 255, 0.2);
          --airy-shadow-soft: rgba(0, 0, 0, 0.05);
          --airy-glow-radius: 20px;
        }

        /* Gentle pulse animation for special elements */
        @keyframes gentle-pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.02); 
            opacity: 0.9; 
          }
        }

        /* Floating animation for empty state */
        @keyframes gentle-float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-8px); 
          }
        }

        /* Shimmer effect for loading states */
        @keyframes airy-shimmer {
          0% { 
            background-position: -200px 0; 
          }
          100% { 
            background-position: calc(200px + 100%) 0; 
          }
        }

        /* Smooth backdrop blur support */
        .airy-backdrop-blur {
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }

        /* Fallback for browsers without backdrop-filter */
        @supports not (backdrop-filter: blur()) {
          .airy-backdrop-blur {
            background: rgba(255, 255, 255, 0.8);
          }
        }

        /* Smooth scrolling for metric trays */
        .airy-smooth-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Hide scrollbars while maintaining functionality */
        .airy-hidden-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .airy-hidden-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .gentle-pulse,
          .gentle-float,
          .airy-shimmer {
            animation: none;
          }
          
          * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
      {children}
    </>
  );
};

/**
 * Utility function to check if browser supports backdrop-filter
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') return false;
  
  try {
    return CSS.supports('backdrop-filter', 'blur(1px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  } catch (error) {
    return false;
  }
};

/**
 * Generate responsive container styling
 */
export const generateResponsiveContainerStyle = (isMobile: boolean) => {
  return {
    padding: isMobile ? '16px' : '24px',
    maxWidth: isMobile ? '100%' : '1200px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #FEFEFE 0%, #FBFBFB 100%)',
    minHeight: '100vh',
    position: 'relative' as const
  };
};