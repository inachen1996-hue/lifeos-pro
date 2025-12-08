/**
 * Timer Category Management
 * Handles CRUD operations for timer categories
 */
import { TimerCategory } from './types.js';
/**
 * Category Manager - Handles all category operations
 */
export declare class CategoryManager {
    /**
     * Get all categories (default + custom)
     */
    static getAllCategories(): TimerCategory[];
    /**
     * Get a category by ID
     */
    static getCategoryById(categoryId: string): TimerCategory | undefined;
    /**
     * Create a new custom category
     */
    static createCategory(name: string, color: string, icon: string): TimerCategory;
    /**
     * Edit an existing category
     * For default categories, only name can be edited
     * For custom categories, all fields can be edited
     */
    static editCategory(categoryId: string, updates: Partial<Omit<TimerCategory, 'id' | 'isDefault'>>): TimerCategory | null;
    /**
     * Delete a category
     * Default categories cannot be deleted
     * Returns list of affected timers and events that need reassignment
     */
    static deleteCategory(categoryId: string): {
        success: boolean;
        affectedTimers: string[];
        affectedEvents: string[];
        message: string;
    };
    /**
     * Reassign timers and events from one category to another
     * Used when deleting a category
     */
    static reassignCategory(fromCategoryId: string, toCategoryId: string): {
        success: boolean;
        message: string;
    };
    /**
     * Initialize categories with defaults if none exist
     */
    static initializeCategories(): void;
    /**
     * Get default categories only
     */
    static getDefaultCategories(): TimerCategory[];
    /**
     * Get custom categories only
     */
    static getCustomCategories(): TimerCategory[];
}
//# sourceMappingURL=category-manager.d.ts.map