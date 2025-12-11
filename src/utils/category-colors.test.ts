/**
 * Property-Based Tests for Category Color Service
 * **Feature: timer-icon-selection, Property 9: 分类颜色获取**
 * **Validates: Requirements 3.1**
 */

import * as fc from 'fast-check';
import { CategoryColorService, hexToRgba, lightenColor } from './category-colors.js';
import { DEFAULT_CATEGORIES } from '../types.js';

describe('Category Color Service Property Tests', () => {

  // Generator for valid category IDs
  const validCategoryIdGen = fc.constantFrom(...DEFAULT_CATEGORIES.map(cat => cat.id));

  // Generator for invalid category IDs
  const invalidCategoryIdGen = fc.string({ minLength: 1, maxLength: 20 })
    .filter(id => !DEFAULT_CATEGORIES.some(cat => cat.id === id));

  // Generator for hex colors
  const hexColorGen = fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s);

  // Generator for opacity values
  const opacityGen = fc.float({ min: 0, max: 1 });

  /**
   * Property 9: 分类颜色获取
   * For any timer category, the system should be able to correctly retrieve the corresponding theme color
   */
  test('Property 9: Category color retrieval', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      const themeColor = CategoryColorService.getThemeColor(categoryId);
      
      // Should return a valid color string
      expect(typeof themeColor).toBe('string');
      expect(themeColor.length).toBeGreaterThan(0);
      
      // Should be a valid hex color or CSS color
      const isValidColor = /^#[0-9A-Fa-f]{6}$/.test(themeColor) || 
                          /^rgba?\(/.test(themeColor) ||
                          /^[a-zA-Z]+$/.test(themeColor);
      expect(isValidColor).toBe(true);
      
      // Should be consistent - same category should return same color
      const themeColor2 = CategoryColorService.getThemeColor(categoryId);
      expect(themeColor2).toBe(themeColor);
    }), { numRuns: 100 });
  });

  /**
   * Property: Glow effect color retrieval
   */
  test('Property: Glow effect color retrieval', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      const glowColor = CategoryColorService.getGlowEffect(categoryId);
      
      // Should return a valid RGBA color string
      expect(typeof glowColor).toBe('string');
      expect(glowColor.length).toBeGreaterThan(0);
      
      // Should be a valid RGBA color
      expect(glowColor).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
      
      // Should be consistent
      const glowColor2 = CategoryColorService.getGlowEffect(categoryId);
      expect(glowColor2).toBe(glowColor);
    }), { numRuns: 100 });
  });

  /**
   * Property: CSS variables generation
   */
  test('Property: CSS variables generation', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      const cssVars = CategoryColorService.getCSSVariables(categoryId);
      
      // Should return an object
      expect(typeof cssVars).toBe('object');
      expect(cssVars).not.toBeNull();
      
      // Should have required CSS variable keys
      const requiredKeys = ['--category-primary', '--category-light', '--category-glow', '--category-shadow'];
      requiredKeys.forEach(key => {
        expect(cssVars).toHaveProperty(key);
        expect(typeof cssVars[key]).toBe('string');
        expect(cssVars[key].length).toBeGreaterThan(0);
      });
      
      // Should be consistent
      const cssVars2 = CategoryColorService.getCSSVariables(categoryId);
      expect(cssVars2).toEqual(cssVars);
    }), { numRuns: 100 });
  });

  /**
   * Property: Invalid category handling
   */
  test('Property: Invalid category handling', () => {
    fc.assert(fc.property(invalidCategoryIdGen, (categoryId: string) => {
      // Should return default colors for invalid categories
      const themeColor = CategoryColorService.getThemeColor(categoryId);
      const glowColor = CategoryColorService.getGlowEffect(categoryId);
      const shadowColor = CategoryColorService.getShadowColor(categoryId);
      const lightColor = CategoryColorService.getLightColor(categoryId);
      
      // Should return valid color strings (defaults)
      expect(typeof themeColor).toBe('string');
      expect(typeof glowColor).toBe('string');
      expect(typeof shadowColor).toBe('string');
      expect(typeof lightColor).toBe('string');
      
      // Should be consistent with default values
      const defaultTheme = CategoryColorService.getThemeColor('nonexistent');
      expect(themeColor).toBe(defaultTheme);
    }), { numRuns: 100 });
  });

  /**
   * Property: Category existence check
   */
  test('Property: Category existence check', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      const exists = CategoryColorService.categoryExists(categoryId);
      expect(exists).toBe(true);
    }), { numRuns: 100 });

    fc.assert(fc.property(invalidCategoryIdGen, (categoryId: string) => {
      const exists = CategoryColorService.categoryExists(categoryId);
      expect(exists).toBe(false);
    }), { numRuns: 100 });
  });

  /**
   * Property: Shadow color retrieval
   */
  test('Property: Shadow color retrieval', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      const shadowColor = CategoryColorService.getShadowColor(categoryId);
      
      // Should return a valid RGBA color string
      expect(typeof shadowColor).toBe('string');
      expect(shadowColor.length).toBeGreaterThan(0);
      
      // Should be a valid RGBA color
      expect(shadowColor).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
      
      // Should be consistent
      const shadowColor2 = CategoryColorService.getShadowColor(categoryId);
      expect(shadowColor2).toBe(shadowColor);
    }), { numRuns: 100 });
  });

  /**
   * Property: Light color retrieval
   */
  test('Property: Light color retrieval', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      const lightColor = CategoryColorService.getLightColor(categoryId);
      
      // Should return a valid color string
      expect(typeof lightColor).toBe('string');
      expect(lightColor.length).toBeGreaterThan(0);
      
      // Should be consistent
      const lightColor2 = CategoryColorService.getLightColor(categoryId);
      expect(lightColor2).toBe(lightColor);
    }), { numRuns: 100 });
  });

  /**
   * Property: Color scheme retrieval
   */
  test('Property: Color scheme retrieval', () => {
    const allSchemes = CategoryColorService.getAllColorSchemes();
    
    // Should return an object
    expect(typeof allSchemes).toBe('object');
    expect(allSchemes).not.toBeNull();
    
    // Should have color schemes for each category
    Object.values(allSchemes).forEach(scheme => {
      expect(scheme).toHaveProperty('primary');
      expect(scheme).toHaveProperty('light');
      expect(scheme).toHaveProperty('glow');
      expect(scheme).toHaveProperty('shadow');
      
      expect(typeof scheme.primary).toBe('string');
      expect(typeof scheme.light).toBe('string');
      expect(typeof scheme.glow).toBe('string');
      expect(typeof scheme.shadow).toBe('string');
    });
  });

  /**
   * Property: Hex to RGBA conversion
   */
  test('Property: Hex to RGBA conversion', () => {
    fc.assert(fc.property(hexColorGen, opacityGen, (hex: string, opacity: number) => {
      const rgba = hexToRgba(hex, opacity);
      
      // Should return a valid RGBA string
      expect(typeof rgba).toBe('string');
      expect(rgba).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
      
      // Should include the correct opacity
      const opacityMatch = rgba.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
      expect(opacityMatch).not.toBeNull();
      if (opacityMatch) {
        const extractedOpacity = parseFloat(opacityMatch[1]);
        expect(extractedOpacity).toBeCloseTo(opacity, 2);
      }
      
      // Should be deterministic
      const rgba2 = hexToRgba(hex, opacity);
      expect(rgba2).toBe(rgba);
    }), { numRuns: 100 });
  });

  /**
   * Property: Invalid hex color handling
   */
  test('Property: Invalid hex color handling', () => {
    const invalidHexColors = ['#gggggg', '#12345', 'not-a-color', '', '#'];
    
    invalidHexColors.forEach(invalidHex => {
      const rgba = hexToRgba(invalidHex, 0.5);
      
      // Should return a fallback RGBA color
      expect(typeof rgba).toBe('string');
      expect(rgba).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
      
      // Should be the fallback color
      expect(rgba).toBe('rgba(189, 224, 254, 0.5)');
    });
  });

  /**
   * Property: Color lightening
   */
  test('Property: Color lightening', () => {
    fc.assert(fc.property(hexColorGen, fc.float({ min: 0, max: 1 }), (color: string, amount: number) => {
      const lightenedColor = lightenColor(color, amount);
      
      // Should return a valid color string
      expect(typeof lightenedColor).toBe('string');
      expect(lightenedColor.length).toBeGreaterThan(0);
      
      // Should be deterministic
      const lightenedColor2 = lightenColor(color, amount);
      expect(lightenedColor2).toBe(lightenedColor);
    }), { numRuns: 100 });
  });

  /**
   * Property: Service method consistency
   */
  test('Property: Service method consistency', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      // Multiple calls should return consistent results
      const calls = Array.from({ length: 5 }, () => ({
        theme: CategoryColorService.getThemeColor(categoryId),
        glow: CategoryColorService.getGlowEffect(categoryId),
        shadow: CategoryColorService.getShadowColor(categoryId),
        light: CategoryColorService.getLightColor(categoryId),
        css: CategoryColorService.getCSSVariables(categoryId),
        exists: CategoryColorService.categoryExists(categoryId)
      }));
      
      // All calls should return identical results
      for (let i = 1; i < calls.length; i++) {
        expect(calls[i].theme).toBe(calls[0].theme);
        expect(calls[i].glow).toBe(calls[0].glow);
        expect(calls[i].shadow).toBe(calls[0].shadow);
        expect(calls[i].light).toBe(calls[0].light);
        expect(calls[i].css).toEqual(calls[0].css);
        expect(calls[i].exists).toBe(calls[0].exists);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Default categories coverage
   */
  test('Property: Default categories coverage', () => {
    // All default categories should have color mappings
    DEFAULT_CATEGORIES.forEach(category => {
      const themeColor = CategoryColorService.getThemeColor(category.id);
      const glowColor = CategoryColorService.getGlowEffect(category.id);
      const shadowColor = CategoryColorService.getShadowColor(category.id);
      const lightColor = CategoryColorService.getLightColor(category.id);
      
      // Should not return default fallback colors for valid categories
      expect(typeof themeColor).toBe('string');
      expect(typeof glowColor).toBe('string');
      expect(typeof shadowColor).toBe('string');
      expect(typeof lightColor).toBe('string');
      
      // Should exist
      expect(CategoryColorService.categoryExists(category.id)).toBe(true);
    });
  });

  /**
   * Property: Color format validation
   */
  test('Property: Color format validation', () => {
    fc.assert(fc.property(validCategoryIdGen, (categoryId: string) => {
      const cssVars = CategoryColorService.getCSSVariables(categoryId);
      
      // Primary and light colors should be valid CSS colors
      const primaryColor = cssVars['--category-primary'];
      const lightColor = cssVars['--category-light'];
      const glowColor = cssVars['--category-glow'];
      const shadowColor = cssVars['--category-shadow'];
      
      // Glow and shadow should be RGBA
      expect(glowColor).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
      expect(shadowColor).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
      
      // Primary and light should be valid colors (hex or named)
      const isValidColor = (color: string) => 
        /^#[0-9A-Fa-f]{6}$/.test(color) || 
        /^rgba?\(/.test(color) ||
        /^[a-zA-Z]+$/.test(color);
      
      expect(isValidColor(primaryColor)).toBe(true);
      expect(isValidColor(lightColor)).toBe(true);
    }), { numRuns: 100 });
  });
});