/**
 * Category Color Service - Provides color utilities for timer categories
 */

import { DEFAULT_CATEGORIES } from '../types.js';

/**
 * Color mapping for different category colors
 */
const COLOR_MAPPINGS = {
  'bg-macaron-blue': {
    primary: '#BDE0FE',
    light: '#E7F5FF',
    glow: 'rgba(189, 224, 254, 0.4)',
    shadow: 'rgba(162, 210, 255, 0.3)'
  },
  'bg-macaron-green': {
    primary: '#D9EFE8',
    light: '#F0F9F5',
    glow: 'rgba(217, 239, 232, 0.4)',
    shadow: 'rgba(167, 243, 208, 0.3)'
  },
  'bg-macaron-pink': {
    primary: '#F5C2D6',
    light: '#FDF5F8',
    glow: 'rgba(245, 194, 214, 0.4)',
    shadow: 'rgba(245, 194, 214, 0.3)'
  },
  'bg-macaron-purple': {
    primary: '#C8A2E0',
    light: '#F3EBFA',
    glow: 'rgba(200, 162, 224, 0.4)',
    shadow: 'rgba(200, 162, 224, 0.3)'
  },
  'bg-macaron-orange': {
    primary: '#FFE9D6',
    light: '#FFF5ED',
    glow: 'rgba(255, 233, 214, 0.4)',
    shadow: 'rgba(255, 183, 107, 0.3)'
  },
  'bg-macaron-yellow': {
    primary: '#FFF8E1',
    light: '#FFFEF7',
    glow: 'rgba(255, 248, 225, 0.4)',
    shadow: 'rgba(255, 235, 153, 0.3)'
  },
  'bg-emerald-200': {
    primary: '#A7F3D0',
    light: '#ECFDF5',
    glow: 'rgba(167, 243, 208, 0.4)',
    shadow: 'rgba(110, 231, 183, 0.3)'
  },
  'bg-macaron-rose': {
    primary: '#FFE5E5',
    light: '#FFF5F5',
    glow: 'rgba(255, 229, 229, 0.4)',
    shadow: 'rgba(252, 165, 165, 0.3)'
  }
};

/**
 * Default color scheme for unknown categories
 */
const DEFAULT_COLOR_SCHEME = {
  primary: '#BDE0FE',
  light: '#E7F5FF',
  glow: 'rgba(189, 224, 254, 0.4)',
  shadow: 'rgba(162, 210, 255, 0.3)'
};

/**
 * Category Color Service Implementation
 */
export class CategoryColorService {
  /**
   * Get the primary theme color for a category
   */
  static getThemeColor(categoryId: string): string {
    const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) {
      return DEFAULT_COLOR_SCHEME.primary;
    }
    
    const colorScheme = COLOR_MAPPINGS[category.color as keyof typeof COLOR_MAPPINGS];
    return colorScheme ? colorScheme.primary : DEFAULT_COLOR_SCHEME.primary;
  }

  /**
   * Get the glow effect color for a category
   */
  static getGlowEffect(categoryId: string): string {
    const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) {
      return DEFAULT_COLOR_SCHEME.glow;
    }
    
    const colorScheme = COLOR_MAPPINGS[category.color as keyof typeof COLOR_MAPPINGS];
    return colorScheme ? colorScheme.glow : DEFAULT_COLOR_SCHEME.glow;
  }

  /**
   * Get CSS variables for a category
   */
  static getCSSVariables(categoryId: string): Record<string, string> {
    const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
    const colorScheme = category 
      ? COLOR_MAPPINGS[category.color as keyof typeof COLOR_MAPPINGS] || DEFAULT_COLOR_SCHEME
      : DEFAULT_COLOR_SCHEME;

    return {
      '--category-primary': colorScheme.primary,
      '--category-light': colorScheme.light,
      '--category-glow': colorScheme.glow,
      '--category-shadow': colorScheme.shadow
    };
  }

  /**
   * Get the shadow color for a category
   */
  static getShadowColor(categoryId: string): string {
    const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) {
      return DEFAULT_COLOR_SCHEME.shadow;
    }
    
    const colorScheme = COLOR_MAPPINGS[category.color as keyof typeof COLOR_MAPPINGS];
    return colorScheme ? colorScheme.shadow : DEFAULT_COLOR_SCHEME.shadow;
  }

  /**
   * Get the light background color for a category
   */
  static getLightColor(categoryId: string): string {
    const category = DEFAULT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) {
      return DEFAULT_COLOR_SCHEME.light;
    }
    
    const colorScheme = COLOR_MAPPINGS[category.color as keyof typeof COLOR_MAPPINGS];
    return colorScheme ? colorScheme.light : DEFAULT_COLOR_SCHEME.light;
  }

  /**
   * Check if a category exists
   */
  static categoryExists(categoryId: string): boolean {
    return DEFAULT_CATEGORIES.some(cat => cat.id === categoryId);
  }

  /**
   * Get all available color schemes
   */
  static getAllColorSchemes(): Record<string, any> {
    return COLOR_MAPPINGS;
  }
}

/**
 * Utility function to convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return `rgba(189, 224, 254, ${opacity})`; // fallback
  }
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Utility function to lighten a color
 */
export function lightenColor(color: string, amount: number): string {
  // Simple implementation - in a real app you might want a more sophisticated color manipulation library
  const colorScheme = Object.values(COLOR_MAPPINGS).find(scheme => scheme.primary === color);
  if (colorScheme) {
    return colorScheme.light;
  }
  return color;
}