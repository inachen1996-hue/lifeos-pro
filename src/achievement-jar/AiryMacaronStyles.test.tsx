/**
 * Achievement Jar Progress Visualization - Airy Macaron Styles Property Tests
 * Property-based tests for style consistency and visual requirements
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  getAiryMacaronColor, 
  generateClayBallStyle, 
  generateMetricPillStyle,
  generateCelebrationButtonStyle,
  generateFrostedGlassStyle,
  supportsBackdropFilter,
  airyMacaronColors,
  priorityColorEnhancement,
  frostedGlassEffects,
  clayTextureEffects,
  airyAnimations
} from './AiryMacaronStyles.js';
import { MacaronColor, CategoryPriority } from './types.js';

// Arbitraries for property-based testing
const macaronColorArb = fc.constantFrom(
  'bg-macaron-blue',
  'bg-macaron-green', 
  'bg-macaron-pink',
  'bg-macaron-purple',
  'bg-macaron-orange',
  'bg-macaron-yellow',
  'bg-emerald-200',
  'bg-macaron-rose'
) as fc.Arbitrary<MacaronColor>;

const priorityArb = fc.constantFrom('high', 'normal') as fc.Arbitrary<CategoryPriority>;

const sizeArb = fc.integer({ min: 20, max: 80 });

const intensityArb = fc.constantFrom('light', 'medium', 'heavy');

const gradientColorsArb = fc.tuple(
  fc.hexaString({ minLength: 7, maxLength: 7 }),
  fc.hexaString({ minLength: 7, maxLength: 7 })
) as fc.Arbitrary<[string, string]>;

describe('Achievement Jar Airy Macaron Styles', () => {
  /**
   * Property 11: Airy macaron style consistency
   * For any macaron color, the color configuration should meet low saturation 
   * and high brightness criteria, and all styling functions should return 
   * consistent CSS properties
   * Validates: Requirements 4.1, 4.2, 4.3
   */
  it('Property 11: Airy macaron style consistency', () => {
    fc.assert(
      fc.property(macaronColorArb, (color) => {
        const colorConfig = getAiryMacaronColor(color);
        
        // Verify color configuration structure
        expect(colorConfig).toHaveProperty('primary');
        expect(colorConfig).toHaveProperty('secondary');
        expect(colorConfig).toHaveProperty('accent');
        expect(colorConfig).toHaveProperty('glow');
        expect(colorConfig).toHaveProperty('shadow');
        expect(colorConfig).toHaveProperty('gradient');
        
        // Verify all colors are valid CSS color values
        expect(colorConfig.primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorConfig.secondary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorConfig.accent).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorConfig.glow).toMatch(/^#[0-9A-F]{6}$/i);
        
        // Verify shadow is a valid rgba string
        expect(colorConfig.shadow).toMatch(/^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/);
        
        // Verify gradient is a valid CSS gradient
        expect(colorConfig.gradient).toMatch(/^linear-gradient\(/);
        
        // Verify low saturation, high brightness characteristics
        // Colors should be very light (high brightness)
        const primaryHex = colorConfig.primary.replace('#', '');
        const r = parseInt(primaryHex.substr(0, 2), 16);
        const g = parseInt(primaryHex.substr(2, 2), 16);
        const b = parseInt(primaryHex.substr(4, 2), 16);
        
        // All RGB values should be high (> 200) for light colors
        expect(r).toBeGreaterThan(200);
        expect(g).toBeGreaterThan(200);
        expect(b).toBeGreaterThan(200);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should generate consistent clay ball styles', () => {
    fc.assert(
      fc.property(
        macaronColorArb,
        priorityArb,
        sizeArb,
        fc.boolean(),
        (color, priority, size, isSpecial) => {
          const style = generateClayBallStyle(color, priority, size, isSpecial);
          
          // Verify required CSS properties
          expect(style).toHaveProperty('width');
          expect(style).toHaveProperty('height');
          expect(style).toHaveProperty('background');
          expect(style).toHaveProperty('boxShadow');
          expect(style).toHaveProperty('borderRadius', '50%');
          expect(style).toHaveProperty('transition');
          expect(style).toHaveProperty('cursor', 'pointer');
          expect(style).toHaveProperty('position', 'absolute');
          
          // Verify size consistency
          const expectedSize = size * priorityColorEnhancement[priority].scaleMultiplier;
          expect(style.width).toBe(`${expectedSize}px`);
          expect(style.height).toBe(`${expectedSize}px`);
          
          // Verify special effects for achievement balls
          if (isSpecial) {
            expect(style).toHaveProperty('filter');
            expect(style).toHaveProperty('animation');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate consistent metric pill styles', () => {
    fc.assert(
      fc.property(
        macaronColorArb,
        fc.boolean(),
        (color, isActive) => {
          const style = generateMetricPillStyle(color, isActive);
          
          // Verify required CSS properties
          expect(style).toHaveProperty('background');
          expect(style).toHaveProperty('border');
          expect(style).toHaveProperty('borderRadius', '32px');
          expect(style).toHaveProperty('padding', '12px 20px');
          expect(style).toHaveProperty('boxShadow');
          expect(style).toHaveProperty('transition');
          expect(style).toHaveProperty('cursor', 'pointer');
          expect(style).toHaveProperty('transform');
          expect(style).toHaveProperty('backdropFilter', 'blur(8px)');
          expect(style).toHaveProperty('WebkitBackdropFilter', 'blur(8px)');
          
          // Verify active state differences
          if (isActive) {
            expect(style.transform).toContain('scale(1.02)');
          } else {
            expect(style.transform).toContain('scale(1)');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate consistent celebration button styles', () => {
    fc.assert(
      fc.property(
        fc.hexaString({ minLength: 7, maxLength: 7 }),
        gradientColorsArb,
        fc.boolean(),
        fc.boolean(),
        (themeColor, gradientColors, isPressed, isAnimating) => {
          const style = generateCelebrationButtonStyle(themeColor, gradientColors, isPressed, isAnimating);
          
          // Verify required CSS properties
          expect(style).toHaveProperty('width');
          expect(style).toHaveProperty('height');
          expect(style).toHaveProperty('background');
          expect(style).toHaveProperty('borderRadius', '50%');
          expect(style).toHaveProperty('border', 'none');
          expect(style).toHaveProperty('cursor', 'pointer');
          expect(style).toHaveProperty('position', 'relative');
          expect(style).toHaveProperty('overflow', 'hidden');
          expect(style).toHaveProperty('boxShadow');
          expect(style).toHaveProperty('transform');
          expect(style).toHaveProperty('transition');
          
          // Verify responsive sizing
          const expectedSize = (typeof window !== 'undefined' && window.innerWidth < 768) ? 72 : 80;
          expect(style.width).toBe(`${expectedSize}px`);
          expect(style.height).toBe(`${expectedSize}px`);
          
          // Verify gradient background
          expect(style.background).toContain('linear-gradient');
          expect(style.background).toContain(gradientColors[0]);
          expect(style.background).toContain(gradientColors[1]);
          
          // Verify state-based transforms
          if (isPressed) {
            expect(style.transform).toContain('scale(0.95)');
          } else if (isAnimating) {
            expect(style.transform).toContain('scale(1.05)');
          } else {
            expect(style.transform).toContain('scale(1)');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate consistent frosted glass effects', () => {
    fc.assert(
      fc.property(
        intensityArb,
        fc.option(fc.string()),
        (intensity, customBackground) => {
          const style = generateFrostedGlassStyle(intensity, customBackground);
          
          // Verify required CSS properties
          expect(style).toHaveProperty('backdropFilter');
          expect(style).toHaveProperty('background');
          expect(style).toHaveProperty('border');
          expect(style).toHaveProperty('boxShadow');
          expect(style).toHaveProperty('WebkitBackdropFilter');
          expect(style).toHaveProperty('borderRadius', '20px');
          expect(style).toHaveProperty('position', 'relative');
          
          // Verify intensity-based effects
          const expectedEffect = frostedGlassEffects[intensity];
          expect(style.backdropFilter).toBe(expectedEffect.backdropFilter);
          expect(style.WebkitBackdropFilter).toBe(expectedEffect.backdropFilter);
          expect(style.border).toBe(expectedEffect.border);
          expect(style.boxShadow).toBe(expectedEffect.boxShadow);
          
          // Verify custom background override
          if (customBackground) {
            expect(style.background).toBe(customBackground);
          } else {
            expect(style.background).toBe(expectedEffect.background);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain color palette consistency', () => {
    // Verify all macaron colors are defined
    const expectedColors: MacaronColor[] = [
      'bg-macaron-blue',
      'bg-macaron-green',
      'bg-macaron-pink',
      'bg-macaron-purple',
      'bg-macaron-orange',
      'bg-macaron-yellow',
      'bg-emerald-200',
      'bg-macaron-rose'
    ];
    
    expectedColors.forEach(color => {
      expect(airyMacaronColors).toHaveProperty(color);
      
      const colorConfig = airyMacaronColors[color];
      expect(colorConfig).toHaveProperty('primary');
      expect(colorConfig).toHaveProperty('secondary');
      expect(colorConfig).toHaveProperty('accent');
      expect(colorConfig).toHaveProperty('glow');
      expect(colorConfig).toHaveProperty('shadow');
      expect(colorConfig).toHaveProperty('gradient');
    });
  });

  it('should maintain priority enhancement consistency', () => {
    const priorities: CategoryPriority[] = ['high', 'normal'];
    
    priorities.forEach(priority => {
      expect(priorityColorEnhancement).toHaveProperty(priority);
      
      const enhancement = priorityColorEnhancement[priority];
      expect(enhancement).toHaveProperty('glowIntensity');
      expect(enhancement).toHaveProperty('shadowSpread');
      expect(enhancement).toHaveProperty('borderGlow');
      expect(enhancement).toHaveProperty('scaleMultiplier');
      
      // Verify numeric values are reasonable
      expect(enhancement.glowIntensity).toBeGreaterThan(0);
      expect(enhancement.scaleMultiplier).toBeGreaterThan(0);
      expect(enhancement.scaleMultiplier).toBeLessThanOrEqual(2);
    });
  });

  it('should maintain clay texture effect consistency', () => {
    const textureTypes = ['soft', 'medium', 'prominent'] as const;
    
    textureTypes.forEach(type => {
      expect(clayTextureEffects).toHaveProperty(type);
      
      const texture = clayTextureEffects[type];
      expect(texture).toHaveProperty('background');
      expect(texture).toHaveProperty('boxShadow');
      
      // Verify functions return valid CSS
      const testColor = '#E8F4FD';
      const testShadow = 'rgba(162, 210, 255, 0.15)';
      
      const background = texture.background(testColor);
      const boxShadow = texture.boxShadow(testShadow);
      
      expect(background).toContain(testColor);
      expect(boxShadow).toContain(testShadow);
    });
  });

  it('should maintain animation configuration consistency', () => {
    const animationTypes = ['gentle', 'bouncy', 'smooth'] as const;
    
    animationTypes.forEach(type => {
      expect(airyAnimations).toHaveProperty(type);
      
      const animation = airyAnimations[type];
      expect(animation).toHaveProperty('duration');
      expect(animation).toHaveProperty('easing');
      expect(animation).toHaveProperty('scale');
      
      const scale = animation.scale;
      expect(scale).toHaveProperty('hover');
      expect(scale).toHaveProperty('active');
      expect(scale).toHaveProperty('rest');
      
      // Verify scale values are valid CSS transforms
      expect(scale.hover).toMatch(/^scale\([\d.]+\)$/);
      expect(scale.active).toMatch(/^scale\([\d.]+\)$/);
      expect(scale.rest).toMatch(/^scale\([\d.]+\)$/);
    });
  });

  it('should detect backdrop filter support correctly', () => {
    const hasSupport = supportsBackdropFilter();
    expect(typeof hasSupport).toBe('boolean');
  });

  it('should handle edge cases gracefully', () => {
    // Test with invalid color (should fallback to blue)
    const invalidColor = 'invalid-color' as MacaronColor;
    const fallbackConfig = getAiryMacaronColor(invalidColor);
    const blueConfig = getAiryMacaronColor('bg-macaron-blue');
    expect(fallbackConfig).toEqual(blueConfig);
    
    // Test with extreme sizes
    const extremeSmallStyle = generateClayBallStyle('bg-macaron-blue', 'normal', 1, false);
    const extremeLargeStyle = generateClayBallStyle('bg-macaron-blue', 'normal', 1000, false);
    
    expect(extremeSmallStyle.width).toBe('1px');
    expect(extremeLargeStyle.width).toBe('1000px');
    
    // Test with empty gradient colors
    const emptyGradientStyle = generateCelebrationButtonStyle('#000000', ['', ''], false, false);
    expect(emptyGradientStyle.background).toContain('linear-gradient');
  });
});

/**
 * Feature: achievement-jar-progress, Property 11: Airy macaron style consistency
 * 
 * This test suite validates that the Airy Macaron styling system maintains
 * consistent visual properties across all components and color variations.
 * 
 * Key validations:
 * - Color configurations meet low saturation, high brightness criteria
 * - All styling functions return valid CSS properties
 * - Priority-based enhancements are applied consistently
 * - Frosted glass effects work across different intensities
 * - Animation configurations are properly structured
 * - Edge cases are handled gracefully with appropriate fallbacks
 */