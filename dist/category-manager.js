/**
 * Timer Category Management
 * Handles CRUD operations for timer categories
 */
import { DEFAULT_CATEGORIES, } from './types.js';
import { CategoryStorage } from './storage.js';
import { TimerStorage } from './storage.js';
import { EventStorage } from './storage.js';
/**
 * Category Manager - Handles all category operations
 */
export class CategoryManager {
    /**
     * Get all categories (default + custom)
     */
    static getAllCategories() {
        return CategoryStorage.loadCategories();
    }
    /**
     * Get a category by ID
     */
    static getCategoryById(categoryId) {
        const categories = this.getAllCategories();
        return categories.find(c => c.id === categoryId);
    }
    /**
     * Create a new custom category
     */
    static createCategory(name, color, icon) {
        const categories = this.getAllCategories();
        // Generate unique ID
        const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCategory = {
            id,
            name,
            color,
            icon,
            isDefault: false,
        };
        // Save the new category
        CategoryStorage.saveCategory(newCategory);
        return newCategory;
    }
    /**
     * Edit an existing category
     * For default categories, only name can be edited
     * For custom categories, all fields can be edited
     */
    static editCategory(categoryId, updates) {
        const category = this.getCategoryById(categoryId);
        if (!category) {
            return null;
        }
        // For default categories, only allow name changes
        if (category.isDefault) {
            const updatedCategory = {
                ...category,
                name: updates.name ?? category.name,
            };
            CategoryStorage.saveCategory(updatedCategory);
            return updatedCategory;
        }
        // For custom categories, allow all changes
        const updatedCategory = {
            ...category,
            ...updates,
        };
        CategoryStorage.saveCategory(updatedCategory);
        return updatedCategory;
    }
    /**
     * Delete a category
     * Default categories cannot be deleted
     * Returns list of affected timers and events that need reassignment
     */
    static deleteCategory(categoryId) {
        const category = this.getCategoryById(categoryId);
        if (!category) {
            return {
                success: false,
                affectedTimers: [],
                affectedEvents: [],
                message: 'Category not found',
            };
        }
        // Cannot delete default categories
        if (category.isDefault) {
            return {
                success: false,
                affectedTimers: [],
                affectedEvents: [],
                message: 'Cannot delete default categories',
            };
        }
        // Find affected timers and events
        const timers = TimerStorage.loadTimers();
        const events = EventStorage.loadEvents();
        const affectedTimers = timers
            .filter(t => t.categoryId === categoryId)
            .map(t => t.id);
        const affectedEvents = events
            .filter(e => e.categoryId === categoryId)
            .map(e => e.id);
        // If there are affected items, return them for user to handle
        if (affectedTimers.length > 0 || affectedEvents.length > 0) {
            return {
                success: false,
                affectedTimers,
                affectedEvents,
                message: `Cannot delete category: ${affectedTimers.length} timers and ${affectedEvents.length} events are using this category. Please reassign them first.`,
            };
        }
        // No affected items, safe to delete
        CategoryStorage.deleteCategory(categoryId);
        return {
            success: true,
            affectedTimers: [],
            affectedEvents: [],
            message: 'Category deleted successfully',
        };
    }
    /**
     * Reassign timers and events from one category to another
     * Used when deleting a category
     */
    static reassignCategory(fromCategoryId, toCategoryId) {
        const fromCategory = this.getCategoryById(fromCategoryId);
        const toCategory = this.getCategoryById(toCategoryId);
        if (!fromCategory || !toCategory) {
            return {
                success: false,
                message: 'Invalid category IDs',
            };
        }
        // Reassign all timers
        const timers = TimerStorage.loadTimers();
        const updatedTimers = timers.map(timer => {
            if (timer.categoryId === fromCategoryId) {
                return {
                    ...timer,
                    categoryId: toCategoryId,
                    updatedAt: new Date().toISOString(),
                };
            }
            return timer;
        });
        TimerStorage.saveTimers(updatedTimers);
        // Reassign all events
        const events = EventStorage.loadEvents();
        const updatedEvents = events.map(event => {
            if (event.categoryId === fromCategoryId) {
                return {
                    ...event,
                    categoryId: toCategoryId,
                    updatedAt: new Date().toISOString(),
                };
            }
            return event;
        });
        EventStorage.saveEvents(updatedEvents);
        return {
            success: true,
            message: 'Category reassignment completed',
        };
    }
    /**
     * Initialize categories with defaults if none exist
     */
    static initializeCategories() {
        const categories = CategoryStorage.loadCategories();
        // If no categories exist, initialize with defaults
        if (categories.length === 0) {
            CategoryStorage.saveCategories(DEFAULT_CATEGORIES);
        }
    }
    /**
     * Get default categories only
     */
    static getDefaultCategories() {
        return this.getAllCategories().filter(c => c.isDefault);
    }
    /**
     * Get custom categories only
     */
    static getCustomCategories() {
        return this.getAllCategories().filter(c => !c.isDefault);
    }
}
//# sourceMappingURL=category-manager.js.map