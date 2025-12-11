/**
 * SmartMatcher Service - Intelligent icon matching based on keywords
 * Features:
 * - Keyword-based icon matching
 * - Priority-based selection
 * - Caching for performance
 * - Multi-language support (Chinese/English)
 */

import { DEFAULT_ICON_MAPPINGS, type IconMapping, type SmartMatcherConfig } from '../types/icon-types.js';

export class SmartMatcher {
  private static cache = new Map<string, string>();
  private static config: SmartMatcherConfig = {
    keywordMappings: {},
    enabledCategories: ['study', 'work', 'health', 'life', 'entertainment', 'sleep', 'rest', 'hobby'],
    matchThreshold: 0.8
  };

  /**
   * Initialize the smart matcher with default mappings
   */
  static initialize(): void {
    // Build keyword mappings from default icon mappings
    const keywordMappings: Record<string, string> = {};
    
    DEFAULT_ICON_MAPPINGS.forEach(mapping => {
      mapping.keywords.forEach(keyword => {
        keywordMappings[keyword.toLowerCase()] = mapping.icon;
      });
    });

    this.config.keywordMappings = keywordMappings;
  }

  /**
   * Match an icon based on input text
   */
  static matchIcon(input: string): string | null {
    if (!input || input.trim().length === 0) {
      return null;
    }

    const normalizedInput = input.toLowerCase().trim();
    
    // Check cache first
    if (this.cache.has(normalizedInput)) {
      return this.cache.get(normalizedInput) || null;
    }

    // Find matching keywords
    const matches = this.findMatches(normalizedInput);
    
    if (matches.length === 0) {
      this.cache.set(normalizedInput, '');
      return null;
    }

    // Get the highest priority match
    const bestMatch = matches.reduce((best, current) => {
      const bestMapping = this.getMappingForIcon(best.icon);
      const currentMapping = this.getMappingForIcon(current.icon);
      
      if (!bestMapping) return current;
      if (!currentMapping) return best;
      
      return currentMapping.priority > bestMapping.priority ? current : best;
    });

    // Cache the result
    this.cache.set(normalizedInput, bestMatch.icon);
    return bestMatch.icon;
  }

  /**
   * Find all matching keywords in the input
   */
  private static findMatches(input: string): Array<{ keyword: string; icon: string; score: number }> {
    const matches: Array<{ keyword: string; icon: string; score: number }> = [];

    Object.entries(this.config.keywordMappings).forEach(([keyword, icon]) => {
      const score = this.calculateMatchScore(input, keyword);
      if (score >= this.config.matchThreshold) {
        matches.push({ keyword, icon, score });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate match score between input and keyword
   */
  private static calculateMatchScore(input: string, keyword: string): number {
    // Exact match
    if (input.includes(keyword)) {
      return 1.0;
    }

    // Partial match (for compound words)
    const inputChars = input.split('');
    const keywordChars = keyword.split('');
    
    let matchCount = 0;
    let keywordIndex = 0;
    
    for (const char of inputChars) {
      if (keywordIndex < keywordChars.length && char === keywordChars[keywordIndex]) {
        matchCount++;
        keywordIndex++;
      }
    }

    return matchCount / keywordChars.length;
  }

  /**
   * Get mapping configuration for an icon
   */
  private static getMappingForIcon(icon: string): IconMapping | null {
    return DEFAULT_ICON_MAPPINGS.find(mapping => mapping.icon === icon) || null;
  }

  /**
   * Get all keywords for a specific icon
   */
  static getKeywordsForIcon(icon: string): string[] {
    const mapping = this.getMappingForIcon(icon);
    return mapping ? mapping.keywords : [];
  }

  /**
   * Update keyword mappings
   */
  static updateMappings(mappings: Record<string, string>): void {
    this.config.keywordMappings = { ...this.config.keywordMappings, ...mappings };
    this.cache.clear(); // Clear cache when mappings change
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current configuration
   */
  static getConfig(): SmartMatcherConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  static updateConfig(newConfig: Partial<SmartMatcherConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.keywordMappings) {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}

// Initialize the smart matcher
SmartMatcher.initialize();