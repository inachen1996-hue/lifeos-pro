/**
 * Achievement Jar Integration - Category Mapper
 * Maps existing LifeOS categories to Achievement Jar color system
 */

import { MacaronColor, CategoryPriority } from './types.js';

export interface LifeOSCategory {
  id: string;
  label: string;
  color: string;
  text: string;
  icon: string;
}

export interface MappedCategory {
  id: string;
  name: string;
  color: MacaronColor;
  icon: string;
  priority: CategoryPriority;
  originalColor: string;
}

/**
 * Category mapper for converting LifeOS categories to Achievement Jar format
 */
export class CategoryMapper {
  private static readonly CATEGORY_MAPPINGS: Record<string, Omit<MappedCategory, 'id' | 'originalColor'>> = {
    work: {
      name: '工作',
      color: 'bg-macaron-blue',
      icon: '💻',
      priority: 'high'
    },
    study: {
      name: '学习',
      color: 'bg-macaron-pink',
      icon: '📚',
      priority: 'high'
    },
    rest: {
      name: '休息',
      color: 'bg-macaron-green',
      icon: '🛋️',
      priority: 'normal'
    },
    sleep: {
      name: '睡眠',
      color: 'bg-macaron-purple',
      icon: '😴',
      priority: 'normal'
    },
    life: {
      name: '生活',
      color: 'bg-macaron-orange',
      icon: '🏠',
      priority: 'normal'
    },
    entertainment: {
      name: '娱乐',
      color: 'bg-macaron-yellow',
      icon: '🎮',
      priority: 'normal'
    },
    health: {
      name: '健康',
      color: 'bg-emerald-200',
      icon: '💪',
      priority: 'normal'
    },
    hobby: {
      name: '兴趣',
      color: 'bg-macaron-rose',
      icon: '🎨',
      priority: 'normal'
    }
  };

  /**
   * Map a single LifeOS category to Achievement Jar format
   */
  static mapCategory(lifeOSCategory: LifeOSCategory): MappedCategory {
    const mapping = this.CATEGORY_MAPPINGS[lifeOSCategory.id];
    
    if (mapping) {
      return {
        id: lifeOSCategory.id,
        name: mapping.name,
        color: mapping.color,
        icon: mapping.icon,
        priority: mapping.priority,
        originalColor: lifeOSCategory.color
      };
    }

    // Fallback for unknown categories
    return {
      id: lifeOSCategory.id,
      name: lifeOSCategory.label || lifeOSCategory.id,
      color: 'bg-macaron-blue', // Default color
      icon: '⏰', // Default icon
      priority: 'normal',
      originalColor: lifeOSCategory.color
    };
  }

  /**
   * Map multiple LifeOS categories to Achievement Jar format
   */
  static mapCategories(lifeOSCategories: LifeOSCategory[]): MappedCategory[] {
    return lifeOSCategories
      .filter(category => category.id !== 'trash') // Exclude trash category
      .map(category => this.mapCategory(category));
  }

  /**
   * Get Achievement Jar color for a category ID
   */
  static getAchievementJarColor(categoryId: string): MacaronColor {
    const mapping = this.CATEGORY_MAPPINGS[categoryId];
    return mapping?.color || 'bg-macaron-blue';
  }

  /**
   * Get category priority for a category ID
   */
  static getCategoryPriority(categoryId: string): CategoryPriority {
    const mapping = this.CATEGORY_MAPPINGS[categoryId];
    return mapping?.priority || 'normal';
  }

  /**
   * Get category icon for a category ID
   */
  static getCategoryIcon(categoryId: string): string {
    const mapping = this.CATEGORY_MAPPINGS[categoryId];
    return mapping?.icon || '⏰';
  }

  /**
   * Get category display name for a category ID
   */
  static getCategoryName(categoryId: string): string {
    const mapping = this.CATEGORY_MAPPINGS[categoryId];
    return mapping?.name || categoryId;
  }

  /**
   * Check if a category is high priority (work/study)
   */
  static isHighPriority(categoryId: string): boolean {
    return this.getCategoryPriority(categoryId) === 'high';
  }

  /**
   * Get all supported category IDs
   */
  static getSupportedCategoryIds(): string[] {
    return Object.keys(this.CATEGORY_MAPPINGS);
  }

  /**
   * Validate if a category ID is supported
   */
  static isSupportedCategory(categoryId: string): boolean {
    return categoryId in this.CATEGORY_MAPPINGS;
  }

  /**
   * Get color mapping for celebrations based on category
   */
  static getCelebrationColors(categoryId: string): string[] {
    const color = this.getAchievementJarColor(categoryId);
    
    // Map macaron colors to celebration color palettes
    switch (color) {
      case 'bg-macaron-blue':
        return ['#BDE0FE', '#A2D2FF', '#48CAE4'];
      case 'bg-macaron-pink':
        return ['#F5C2D6', '#E8A5C0', '#D89BB3'];
      case 'bg-macaron-green':
        return ['#D9EFE8', '#B8E6D3', '#95D5B2'];
      case 'bg-macaron-purple':
        return ['#C8A2E0', '#9B6BB8', '#8B5A9F'];
      case 'bg-macaron-orange':
        return ['#FFE9D6', '#FFB366', '#FF9500'];
      case 'bg-macaron-yellow':
        return ['#FFF8E1', '#FFE082', '#FFC107'];
      case 'bg-emerald-200':
        return ['#A7F3D0', '#6EE7B7', '#34D399'];
      case 'bg-macaron-rose':
        return ['#FFE5E5', '#FFCCCB', '#FF9999'];
      default:
        return ['#BDE0FE', '#A2D2FF', '#48CAE4']; // Default blue
    }
  }

  /**
   * Create a reverse mapping from Achievement Jar colors to category IDs
   */
  static createColorToCategoryMap(): Record<MacaronColor, string[]> {
    const colorMap: Record<MacaronColor, string[]> = {} as Record<MacaronColor, string[]>;
    
    Object.entries(this.CATEGORY_MAPPINGS).forEach(([categoryId, mapping]) => {
      if (!colorMap[mapping.color]) {
        colorMap[mapping.color] = [];
      }
      colorMap[mapping.color].push(categoryId);
    });
    
    return colorMap;
  }
}