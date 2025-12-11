/**
 * Visual Consistency Integration
 * Ensures Achievement Jar components maintain visual consistency with main app
 * Implements Requirements 3.4, 3.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  AiryMacaronStyleProvider, 
  airyMacaronColors, 
  generateFrostedGlassStyle,
  generateResponsiveContainerStyle,
  supportsBackdropFilter 
} from './AiryMacaronStyles';

interface VisualTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
  gradientDirection: string;
}

interface VisualConsistencyProps {
  children: React.ReactNode;
  mainAppTheme?: VisualTheme;
  enableTransitions?: boolean;
  enableAnimations?: boolean;
  className?: string;
}

/**
 * Theme Detection Utility
 * Detects the main app's current theme and color scheme
 */
export class ThemeDetector {
  private static instance: ThemeDetector;
  private currentTheme: VisualTheme | null = null;
  private observers: ((theme: VisualTheme) => void)[] = [];

  static getInstance(): ThemeDetector {
    if (!ThemeDetector.instance) {
      ThemeDetector.instance = new ThemeDetector();
    }
    return ThemeDetector.instance;
  }

  /**
   * Detect current theme from main app
   */
  detectMainAppTheme(): VisualTheme {
    if (typeof window === 'undefined') {
      return this.getDefaultTheme();
    }

    try {
      // Try to detect from CSS custom properties
      const computedStyle = getComputedStyle(document.documentElement);
      
      const primaryColor = computedStyle.getPropertyValue('--primary-color')?.trim() ||
                          computedStyle.getPropertyValue('--color-primary')?.trim() ||
                          '#667eea';
      
      const secondaryColor = computedStyle.getPropertyValue('--secondary-color')?.trim() ||
                            computedStyle.getPropertyValue('--color-secondary')?.trim() ||
                            '#764ba2';
      
      const accentColor = computedStyle.getPropertyValue('--accent-color')?.trim() ||
                         computedStyle.getPropertyValue('--color-accent')?.trim() ||
                         '#f093fb';
      
      const backgroundColor = computedStyle.getPropertyValue('--bg-color')?.trim() ||
                             computedStyle.getPropertyValue('--background-color')?.trim() ||
                             '#ffffff';
      
      const textColor = computedStyle.getPropertyValue('--text-color')?.trim() ||
                       computedStyle.getPropertyValue('--color-text')?.trim() ||
                       '#64748b';

      // Detect from existing elements if CSS properties not available
      if (!primaryColor.startsWith('#') && !primaryColor.startsWith('rgb')) {
        return this.detectFromElements();
      }

      const theme: VisualTheme = {
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        borderColor: this.lightenColor(textColor, 0.8),
        shadowColor: this.addAlpha(textColor, 0.1),
        gradientDirection: '135deg'
      };

      this.currentTheme = theme;
      return theme;
    } catch (error) {
      console.warn('Failed to detect main app theme:', error);
      return this.getDefaultTheme();
    }
  }

  /**
   * Detect theme from existing DOM elements
   */
  private detectFromElements(): VisualTheme {
    try {
      // Look for common navigation or header elements
      const navElements = document.querySelectorAll('nav, header, .navbar, .header');
      const buttonElements = document.querySelectorAll('button, .btn, .button');
      
      let primaryColor = '#667eea';
      let backgroundColor = '#ffffff';
      let textColor = '#64748b';

      // Analyze navigation elements
      for (const element of navElements) {
        const styles = getComputedStyle(element);
        const bgColor = styles.backgroundColor;
        const color = styles.color;
        
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          primaryColor = bgColor;
        }
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          textColor = color;
        }
      }

      // Analyze button elements for accent colors
      for (const element of buttonElements) {
        const styles = getComputedStyle(element);
        const bgColor = styles.backgroundColor;
        
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          // Use first non-transparent button color as accent
          break;
        }
      }

      // Detect body background
      const bodyStyles = getComputedStyle(document.body);
      const bodyBg = bodyStyles.backgroundColor;
      if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)') {
        backgroundColor = bodyBg;
      }

      return {
        primaryColor,
        secondaryColor: this.adjustColor(primaryColor, -20),
        accentColor: this.adjustColor(primaryColor, 30),
        backgroundColor,
        textColor,
        borderColor: this.lightenColor(textColor, 0.8),
        shadowColor: this.addAlpha(textColor, 0.1),
        gradientDirection: '135deg'
      };
    } catch (error) {
      console.warn('Failed to detect theme from elements:', error);
      return this.getDefaultTheme();
    }
  }

  /**
   * Get default airy macaron theme
   */
  private getDefaultTheme(): VisualTheme {
    return {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      accentColor: '#f093fb',
      backgroundColor: '#ffffff',
      textColor: '#64748b',
      borderColor: '#e2e8f0',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      gradientDirection: '135deg'
    };
  }

  /**
   * Color manipulation utilities
   */
  private lightenColor(color: string, amount: number): string {
    try {
      // Simple lightening by mixing with white
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
        const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
        const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
      }
      return color;
    } catch {
      return '#e2e8f0';
    }
  }

  private addAlpha(color: string, alpha: number): string {
    try {
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const num = parseInt(hex, 16);
        const r = num >> 16;
        const g = (num >> 8) & 0x00FF;
        const b = num & 0x0000FF;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      }
      return `rgba(100, 116, 139, ${alpha})`;
    } catch {
      return `rgba(100, 116, 139, ${alpha})`;
    }
  }

  private adjustColor(color: string, adjustment: number): string {
    try {
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const num = parseInt(hex, 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + adjustment));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + adjustment));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + adjustment));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
      }
      return color;
    } catch {
      return color;
    }
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(callback: (theme: VisualTheme) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Notify observers of theme changes
   */
  private notifyObservers(theme: VisualTheme): void {
    this.observers.forEach(callback => callback(theme));
  }

  /**
   * Watch for theme changes in the main app
   */
  startWatching(): void {
    if (typeof window === 'undefined') return;

    // Watch for CSS custom property changes
    const observer = new MutationObserver(() => {
      const newTheme = this.detectMainAppTheme();
      if (JSON.stringify(newTheme) !== JSON.stringify(this.currentTheme)) {
        this.currentTheme = newTheme;
        this.notifyObservers(newTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Watch for media query changes (dark mode, etc.)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const newTheme = this.detectMainAppTheme();
      this.currentTheme = newTheme;
      this.notifyObservers(newTheme);
    });
  }
}

/**
 * Visual Consistency Integration Component
 */
export const VisualConsistencyIntegration: React.FC<VisualConsistencyProps> = ({
  children,
  mainAppTheme,
  enableTransitions = true,
  enableAnimations = true,
  className = ''
}) => {
  const [detectedTheme, setDetectedTheme] = useState<VisualTheme | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Detect and sync with main app theme
  useEffect(() => {
    const detector = ThemeDetector.getInstance();
    
    // Initial theme detection
    const initialTheme = mainAppTheme || detector.detectMainAppTheme();
    setDetectedTheme(initialTheme);
    setIsInitialized(true);

    // Start watching for theme changes
    detector.startWatching();
    
    // Subscribe to theme updates
    const unsubscribe = detector.subscribe((newTheme) => {
      setDetectedTheme(newTheme);
    });

    return unsubscribe;
  }, [mainAppTheme]);

  // Apply theme to CSS custom properties
  useEffect(() => {
    if (!detectedTheme || typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Apply Achievement Jar specific theme properties
    root.style.setProperty('--aj-primary-color', detectedTheme.primaryColor);
    root.style.setProperty('--aj-secondary-color', detectedTheme.secondaryColor);
    root.style.setProperty('--aj-accent-color', detectedTheme.accentColor);
    root.style.setProperty('--aj-background-color', detectedTheme.backgroundColor);
    root.style.setProperty('--aj-text-color', detectedTheme.textColor);
    root.style.setProperty('--aj-border-color', detectedTheme.borderColor);
    root.style.setProperty('--aj-shadow-color', detectedTheme.shadowColor);
    root.style.setProperty('--aj-gradient-direction', detectedTheme.gradientDirection);

    // Apply animation preferences
    root.style.setProperty('--aj-transition-duration', enableTransitions ? '0.3s' : '0s');
    root.style.setProperty('--aj-animation-duration', enableAnimations ? '0.4s' : '0s');

    console.log('🎨 Applied Achievement Jar theme:', detectedTheme);
  }, [detectedTheme, enableTransitions, enableAnimations]);

  // Generate consistent styling
  const getConsistentContainerStyle = useCallback(() => {
    if (!detectedTheme) return {};

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const baseStyle = generateResponsiveContainerStyle(isMobile);
    
    return {
      ...baseStyle,
      background: `linear-gradient(${detectedTheme.gradientDirection}, ${detectedTheme.backgroundColor} 0%, ${detectedTheme.borderColor} 100%)`,
      color: detectedTheme.textColor,
      '--theme-primary': detectedTheme.primaryColor,
      '--theme-secondary': detectedTheme.secondaryColor,
      '--theme-accent': detectedTheme.accentColor
    };
  }, [detectedTheme]);

  if (!isInitialized) {
    return (
      <div className="achievement-jar-loading" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '200px',
        color: '#64748b'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #667eea', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div>正在同步主题...</div>
        </div>
      </div>
    );
  }

  return (
    <AiryMacaronStyleProvider>
      <div 
        className={`achievement-jar-visual-consistency ${className}`}
        style={getConsistentContainerStyle()}
      >
        <style>{`
          /* Achievement Jar Theme Integration */
          .achievement-jar-visual-consistency {
            --aj-frosted-glass-bg: ${supportsBackdropFilter() 
              ? 'rgba(255, 255, 255, 0.25)' 
              : detectedTheme?.backgroundColor || '#ffffff'};
            --aj-frosted-glass-border: ${detectedTheme?.borderColor || '#e2e8f0'};
            --aj-frosted-glass-shadow: ${detectedTheme?.shadowColor || 'rgba(0, 0, 0, 0.1)'};
          }

          /* Consistent button styling */
          .achievement-jar-visual-consistency .celebration-button {
            background: linear-gradient(135deg, 
              var(--aj-primary-color) 0%, 
              var(--aj-secondary-color) 100%);
            border: 1px solid var(--aj-border-color);
            box-shadow: 0 4px 12px var(--aj-shadow-color);
            transition: all var(--aj-transition-duration) ease;
          }

          .achievement-jar-visual-consistency .celebration-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px var(--aj-shadow-color);
          }

          /* Consistent metric card styling */
          .achievement-jar-visual-consistency .metric-card {
            background: var(--aj-frosted-glass-bg);
            border: 1px solid var(--aj-frosted-glass-border);
            box-shadow: 0 4px 12px var(--aj-frosted-glass-shadow);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          /* Consistent text colors */
          .achievement-jar-visual-consistency .primary-text {
            color: var(--aj-text-color);
          }

          .achievement-jar-visual-consistency .secondary-text {
            color: var(--aj-border-color);
          }

          /* Consistent spacing and typography */
          .achievement-jar-visual-consistency {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                         'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            letter-spacing: -0.01em;
          }

          /* Smooth transitions */
          .achievement-jar-visual-consistency * {
            transition-duration: var(--aj-transition-duration);
            animation-duration: var(--aj-animation-duration);
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            .achievement-jar-visual-consistency * {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
            }
          }

          /* Loading animation */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        {children}
      </div>
    </AiryMacaronStyleProvider>
  );
};

/**
 * Hook for accessing consistent theme values
 */
export const useVisualConsistency = () => {
  const [theme, setTheme] = useState<VisualTheme | null>(null);

  useEffect(() => {
    const detector = ThemeDetector.getInstance();
    const currentTheme = detector.detectMainAppTheme();
    setTheme(currentTheme);

    const unsubscribe = detector.subscribe(setTheme);
    return unsubscribe;
  }, []);

  const getThemeColor = useCallback((colorType: keyof VisualTheme) => {
    return theme?.[colorType] || '';
  }, [theme]);

  const generateConsistentStyle = useCallback((baseStyle: React.CSSProperties = {}) => {
    if (!theme) return baseStyle;

    return {
      ...baseStyle,
      '--theme-primary': theme.primaryColor,
      '--theme-secondary': theme.secondaryColor,
      '--theme-accent': theme.accentColor,
      '--theme-background': theme.backgroundColor,
      '--theme-text': theme.textColor,
      '--theme-border': theme.borderColor,
      '--theme-shadow': theme.shadowColor
    };
  }, [theme]);

  return {
    theme,
    getThemeColor,
    generateConsistentStyle,
    isThemeReady: !!theme
  };
};

export default VisualConsistencyIntegration;