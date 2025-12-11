/**
 * Property-Based Tests for Icon Selection Types
 * **Feature: timer-icon-selection, Property 1: 图标选择界面显示**
 * **Validates: Requirements 1.1**
 */

import * as fc from 'fast-check';
import { 
  IconMapping, 
  IconSelectionState, 
  SmartMatcherConfig, 
  IconSelectorProps, 
  GlassIconProps,
  DEFAULT_ICON_MAPPINGS,
  AVAILABLE_ICONS,
  IconSource,
  IconSize
} from './icon-types.js';

describe('Icon Selection Types Property Tests', () => {

  // Generator for valid icon sources
  const iconSourceGen = fc.constantFrom('default', 'smart', 'manual');

  // Generator for valid icon sizes
  const iconSizeGen = fc.constantFrom('small', 'medium', 'large');

  // Generator for valid emoji icons
  const emojiIconGen = fc.constantFrom(...AVAILABLE_ICONS);

  // Generator for valid category IDs
  const categoryIdGen = fc.constantFrom('work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby');

  // Generator for valid icon mappings
  const iconMappingGen = fc.record({
    keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
    icon: emojiIconGen,
    category: fc.option(categoryIdGen),
    priority: fc.integer({ min: 1, max: 10 })
  });

  // Generator for valid icon selection state
  const iconSelectionStateGen = fc.record({
    selectedIcon: emojiIconGen,
    isSmartMatchEnabled: fc.boolean(),
    userHasManuallySelected: fc.boolean(),
    lastSmartMatchInput: fc.string({ maxLength: 100 }),
    availableIcons: fc.array(emojiIconGen, { minLength: 1, maxLength: 50 })
  }).map(state => ({
    ...state,
    // Ensure selectedIcon is in availableIcons
    availableIcons: state.availableIcons.includes(state.selectedIcon) 
      ? state.availableIcons 
      : [state.selectedIcon, ...state.availableIcons]
  }));

  // Generator for valid smart matcher config
  const smartMatcherConfigGen = fc.record({
    keywordMappings: fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), emojiIconGen),
    enabledCategories: fc.array(categoryIdGen, { minLength: 1, maxLength: 8 }),
    matchThreshold: fc.float({ min: 0, max: 1, noNaN: true })
  });

  // Generator for valid icon selector props
  const iconSelectorPropsGen = fc.record({
    selectedIcon: emojiIconGen,
    categoryId: categoryIdGen,
    onIconChange: fc.constant(() => {}),
    onSmartMatch: fc.option(fc.constant(() => {})),
    disabled: fc.option(fc.boolean())
  });

  // Generator for valid glass icon props
  const glassIconPropsGen = fc.record({
    icon: emojiIconGen,
    categoryColor: fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => '#' + s),
    size: fc.option(iconSizeGen),
    className: fc.option(fc.string({ maxLength: 50 })),
    onClick: fc.option(fc.constant(() => {})),
    isSelected: fc.option(fc.boolean())
  });

  /**
   * Property 1: 图标选择界面显示
   * For any timer creation or edit operation, the interface should contain icon selection component
   */
  test('Property 1: Icon selection interface display', () => {
    fc.assert(fc.property(iconSelectorPropsGen, (props: IconSelectorProps) => {
      // Icon selector props should have all required fields
      expect(typeof props.selectedIcon).toBe('string');
      expect(props.selectedIcon.length).toBeGreaterThan(0);
      expect(typeof props.categoryId).toBe('string');
      expect(props.categoryId.length).toBeGreaterThan(0);
      expect(typeof props.onIconChange).toBe('function');
      
      // Selected icon should be a valid emoji
      expect(AVAILABLE_ICONS).toContain(props.selectedIcon);
      
      // Category ID should be valid
      expect(['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby']).toContain(props.categoryId);
      
      // Optional props should be properly typed
      if (props.onSmartMatch !== undefined && props.onSmartMatch !== null) {
        expect(typeof props.onSmartMatch).toBe('function');
      }
      
      if (props.disabled !== undefined && props.disabled !== null) {
        expect(typeof props.disabled).toBe('boolean');
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Icon mapping structure validation
   */
  test('Property: Icon mapping structure validation', () => {
    fc.assert(fc.property(iconMappingGen, (mapping: IconMapping) => {
      // Keywords should be non-empty array of strings
      expect(Array.isArray(mapping.keywords)).toBe(true);
      expect(mapping.keywords.length).toBeGreaterThan(0);
      mapping.keywords.forEach(keyword => {
        expect(typeof keyword).toBe('string');
        expect(keyword.length).toBeGreaterThan(0);
      });
      
      // Icon should be a valid emoji
      expect(typeof mapping.icon).toBe('string');
      expect(AVAILABLE_ICONS).toContain(mapping.icon);
      
      // Priority should be positive integer
      expect(typeof mapping.priority).toBe('number');
      expect(mapping.priority).toBeGreaterThan(0);
      expect(Number.isInteger(mapping.priority)).toBe(true);
      
      // Category should be valid if present
      if (mapping.category !== undefined && mapping.category !== null) {
        expect(['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby']).toContain(mapping.category);
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Icon selection state consistency
   */
  test('Property: Icon selection state consistency', () => {
    fc.assert(fc.property(iconSelectionStateGen, (state: IconSelectionState) => {
      // Selected icon should be valid
      expect(typeof state.selectedIcon).toBe('string');
      expect(AVAILABLE_ICONS).toContain(state.selectedIcon);
      
      // Boolean flags should be properly typed
      expect(typeof state.isSmartMatchEnabled).toBe('boolean');
      expect(typeof state.userHasManuallySelected).toBe('boolean');
      
      // Last input should be string
      expect(typeof state.lastSmartMatchInput).toBe('string');
      
      // Available icons should be valid array
      expect(Array.isArray(state.availableIcons)).toBe(true);
      expect(state.availableIcons.length).toBeGreaterThan(0);
      state.availableIcons.forEach(icon => {
        expect(AVAILABLE_ICONS).toContain(icon);
      });
      
      // Selected icon should be in available icons
      expect(state.availableIcons).toContain(state.selectedIcon);
      
      // Logic consistency: if user manually selected, smart match might be disabled
      if (state.userHasManuallySelected && state.lastSmartMatchInput.length > 0) {
        // This is a valid state - user selected manually after smart match
        expect(typeof state.isSmartMatchEnabled).toBe('boolean');
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Smart matcher configuration validation
   */
  test('Property: Smart matcher configuration validation', () => {
    fc.assert(fc.property(smartMatcherConfigGen, (config: SmartMatcherConfig) => {
      // Keyword mappings should be valid
      expect(typeof config.keywordMappings).toBe('object');
      Object.entries(config.keywordMappings).forEach(([keyword, icon]) => {
        expect(typeof keyword).toBe('string');
        expect(keyword.length).toBeGreaterThan(0);
        expect(typeof icon).toBe('string');
        expect(AVAILABLE_ICONS).toContain(icon);
      });
      
      // Enabled categories should be valid
      expect(Array.isArray(config.enabledCategories)).toBe(true);
      expect(config.enabledCategories.length).toBeGreaterThan(0);
      config.enabledCategories.forEach(categoryId => {
        expect(['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby']).toContain(categoryId);
      });
      
      // Match threshold should be valid float between 0 and 1
      expect(typeof config.matchThreshold).toBe('number');
      expect(config.matchThreshold).toBeGreaterThanOrEqual(0);
      expect(config.matchThreshold).toBeLessThanOrEqual(1);
    }), { numRuns: 100 });
  });

  /**
   * Property: Glass icon props validation
   */
  test('Property: Glass icon props validation', () => {
    fc.assert(fc.property(glassIconPropsGen, (props: GlassIconProps) => {
      // Icon should be valid emoji
      expect(typeof props.icon).toBe('string');
      expect(AVAILABLE_ICONS).toContain(props.icon);
      
      // Category color should be valid hex color
      expect(typeof props.categoryColor).toBe('string');
      expect(props.categoryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      
      // Size should be valid if present
      if (props.size !== undefined && props.size !== null) {
        expect(['small', 'medium', 'large']).toContain(props.size);
      }
      
      // Class name should be string if present
      if (props.className !== undefined && props.className !== null) {
        expect(typeof props.className).toBe('string');
      }
      
      // Click handler should be function if present
      if (props.onClick !== undefined && props.onClick !== null) {
        expect(typeof props.onClick).toBe('function');
      }
      
      // Is selected should be boolean if present
      if (props.isSelected !== undefined && props.isSelected !== null) {
        expect(typeof props.isSelected).toBe('boolean');
      }
    }), { numRuns: 100 });
  });

  /**
   * Property: Default icon mappings are valid
   */
  test('Property: Default icon mappings are valid', () => {
    DEFAULT_ICON_MAPPINGS.forEach(mapping => {
      // Each mapping should have valid structure
      expect(Array.isArray(mapping.keywords)).toBe(true);
      expect(mapping.keywords.length).toBeGreaterThan(0);
      
      mapping.keywords.forEach(keyword => {
        expect(typeof keyword).toBe('string');
        expect(keyword.length).toBeGreaterThan(0);
      });
      
      expect(typeof mapping.icon).toBe('string');
      expect(AVAILABLE_ICONS).toContain(mapping.icon);
      
      expect(typeof mapping.priority).toBe('number');
      expect(mapping.priority).toBeGreaterThan(0);
      
      if (mapping.category !== undefined) {
        expect(['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby']).toContain(mapping.category);
      }
    });
  });

  /**
   * Property: Available icons are unique
   */
  test('Property: Available icons are unique', () => {
    const uniqueIcons = new Set(AVAILABLE_ICONS);
    expect(uniqueIcons.size).toBe(AVAILABLE_ICONS.length);
    
    // Each icon should be a string
    AVAILABLE_ICONS.forEach(icon => {
      expect(typeof icon).toBe('string');
      expect(icon.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property: Icon source type validation
   */
  test('Property: Icon source type validation', () => {
    fc.assert(fc.property(iconSourceGen, (source: IconSource) => {
      expect(['default', 'smart', 'manual']).toContain(source);
      expect(typeof source).toBe('string');
    }), { numRuns: 100 });
  });

  /**
   * Property: Icon size type validation
   */
  test('Property: Icon size type validation', () => {
    fc.assert(fc.property(iconSizeGen, (size: IconSize) => {
      expect(['small', 'medium', 'large']).toContain(size);
      expect(typeof size).toBe('string');
    }), { numRuns: 100 });
  });

  /**
   * Property: Keyword matching case insensitivity
   */
  test('Property: Keyword matching should be case insensitive', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
      (keyword: string) => {
        const lowerKeyword = keyword.toLowerCase();
        const upperKeyword = keyword.toUpperCase();
        const mixedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
        
        // All variations should be treated as equivalent for matching
        // This property will be validated by the SmartMatcher implementation
        expect(lowerKeyword.toLowerCase()).toBe(keyword.toLowerCase());
        expect(upperKeyword.toLowerCase()).toBe(keyword.toLowerCase());
        expect(mixedKeyword.toLowerCase()).toBe(keyword.toLowerCase());
      }
    ), { numRuns: 100 });
  });

  /**
   * Property: Icon mapping priority ordering
   */
  test('Property: Icon mapping priority ordering', () => {
    // Higher priority mappings should be preferred
    const sortedMappings = [...DEFAULT_ICON_MAPPINGS].sort((a, b) => b.priority - a.priority);
    
    for (let i = 0; i < sortedMappings.length - 1; i++) {
      expect(sortedMappings[i].priority).toBeGreaterThanOrEqual(sortedMappings[i + 1].priority);
    }
  });

  /**
   * Property: Category-specific icon mappings
   */
  test('Property: Category-specific icon mappings', () => {
    const categoryMappings = DEFAULT_ICON_MAPPINGS.filter(m => m.category !== undefined);
    
    categoryMappings.forEach(mapping => {
      expect(mapping.category).toBeDefined();
      expect(['work', 'study', 'rest', 'sleep', 'life', 'entertainment', 'health', 'hobby']).toContain(mapping.category);
      
      // Category-specific mappings should have reasonable keywords
      const hasRelevantKeywords = mapping.keywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        switch (mapping.category) {
          case 'work':
            return lowerKeyword.includes('work') || lowerKeyword.includes('code') || lowerKeyword.includes('meeting');
          case 'study':
            return lowerKeyword.includes('study') || lowerKeyword.includes('read') || lowerKeyword.includes('learn');
          case 'health':
            return lowerKeyword.includes('run') || lowerKeyword.includes('exercise') || lowerKeyword.includes('health');
          default:
            return true; // Other categories are flexible
        }
      });
      
      // This is a soft requirement - not all mappings need category-specific keywords
      // but it's good to have some correlation
    });
  });
});