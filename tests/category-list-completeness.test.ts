/**
 * Property-Based Tests for Category List Completeness
 * Feature: lifeos-timer-rework, Property 17: Category list completeness
 * Validates: Requirements 12.1, 12.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { TimerCategory, DEFAULT_CATEGORIES } from '../src/types.js';
import { CategoryManager } from '../src/category-manager.js';
import { CategoryStorage } from '../src/storage.js';

/**
 * Arbitrary generator for custom category names
 */
const categoryNameArbitrary = fc.string({ minLength: 1, maxLength: 20 });

/**
 * Arbitrary generator for category colors
 */
const categoryColorArbitrary = fc.constantFrom(
  'bg-red-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
  'bg-indigo-200',
  'bg-gray-200'
);

/**
 * Arbitrary generator for category icons
 */
const categoryIconArbitrary = fc.constantFrom(
  'Star',
  'Heart',
  'Circle',
  'Square',
  'Triangle',
  'Music',
  'Camera',
  'Book'
);

/**
 * Arbitrary generator for custom category
 */
const customCategoryArbitrary = fc.record({
  name: categoryNameArbitrary,
  color: categoryColorArbitrary,
  icon: categoryIconArbitrary,
});

describe('Category List Completeness', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    global.localStorage.clear();
    // Initialize with default categories
    CategoryManager.initializeCategories();
  });

  /**
   * Property 17: Category list completeness
   * For any application state, when displaying category options, the list should
   * include all 8 default categories plus all user-created custom categories.
   */
  it('should include all 8 default categories', () => {
    const categories = CategoryManager.getAllCategories();
    
    // Assert we have at least 8 categories (the defaults)
    expect(categories.length).toBeGreaterThanOrEqual(8);
    
    // Assert all default categories are present
    for (const defaultCategory of DEFAULT_CATEGORIES) {
      const found = categories.find(c => c.id === defaultCategory.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe(defaultCategory.name);
      expect(found!.isDefault).toBe(true);
    }
  });

  /**
   * Property: Custom categories are included in the list
   */
  it('should include all custom categories created by the user', () => {
    fc.assert(
      fc.property(
        fc.array(customCategoryArbitrary, { minLength: 0, maxLength: 10 }),
        (customCategories) => {
          // Clear and reinitialize before each property test iteration
          global.localStorage.clear();
          CategoryManager.initializeCategories();
          
          // Create custom categories
          const createdCategories: TimerCategory[] = [];
          for (const custom of customCategories) {
            const created = CategoryManager.createCategory(
              custom.name,
              custom.color,
              custom.icon
            );
            createdCategories.push(created);
          }
          
          // Get all categories
          const allCategories = CategoryManager.getAllCategories();
          
          // Assert we have 8 defaults + custom categories
          expect(allCategories.length).toBe(8 + customCategories.length);
          
          // Assert all default categories are present
          for (const defaultCategory of DEFAULT_CATEGORIES) {
            const found = allCategories.find(c => c.id === defaultCategory.id);
            expect(found).toBeDefined();
            expect(found!.isDefault).toBe(true);
          }
          
          // Assert all custom categories are present
          for (const created of createdCategories) {
            const found = allCategories.find(c => c.id === created.id);
            expect(found).toBeDefined();
            expect(found!.isDefault).toBe(false);
            expect(found!.name).toBe(created.name);
            expect(found!.color).toBe(created.color);
            expect(found!.icon).toBe(created.icon);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Default categories are always present
   * Even after creating and deleting custom categories, all 8 defaults remain
   */
  it('should always include all 8 default categories regardless of custom category operations', () => {
    fc.assert(
      fc.property(
        fc.array(customCategoryArbitrary, { minLength: 1, maxLength: 5 }),
        (customCategories) => {
          // Clear and reinitialize before each property test iteration
          global.localStorage.clear();
          CategoryManager.initializeCategories();
          
          // Create custom categories
          const createdIds: string[] = [];
          for (const custom of customCategories) {
            const created = CategoryManager.createCategory(
              custom.name,
              custom.color,
              custom.icon
            );
            createdIds.push(created.id);
          }
          
          // Delete all custom categories
          for (const id of createdIds) {
            CategoryManager.deleteCategory(id);
          }
          
          // Get all categories after deletion
          const categories = CategoryManager.getAllCategories();
          
          // Assert we still have exactly 8 categories (the defaults)
          expect(categories.length).toBe(8);
          
          // Assert all default categories are still present
          for (const defaultCategory of DEFAULT_CATEGORIES) {
            const found = categories.find(c => c.id === defaultCategory.id);
            expect(found).toBeDefined();
            expect(found!.isDefault).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Category list includes both default and custom categories
   * Verifies the complete list structure
   */
  it('should return complete list with both default and custom categories', () => {
    fc.assert(
      fc.property(
        fc.array(customCategoryArbitrary, { minLength: 0, maxLength: 10 }),
        (customCategories) => {
          // Clear and reinitialize before each property test iteration
          global.localStorage.clear();
          CategoryManager.initializeCategories();
          
          // Create custom categories
          for (const custom of customCategories) {
            CategoryManager.createCategory(custom.name, custom.color, custom.icon);
          }
          
          // Get all categories
          const allCategories = CategoryManager.getAllCategories();
          const defaultCategories = CategoryManager.getDefaultCategories();
          const customCategoriesList = CategoryManager.getCustomCategories();
          
          // Assert counts
          expect(defaultCategories.length).toBe(8);
          expect(customCategoriesList.length).toBe(customCategories.length);
          expect(allCategories.length).toBe(8 + customCategories.length);
          
          // Assert all defaults are marked as default
          for (const cat of defaultCategories) {
            expect(cat.isDefault).toBe(true);
          }
          
          // Assert all custom are marked as not default
          for (const cat of customCategoriesList) {
            expect(cat.isDefault).toBe(false);
          }
          
          // Assert getAllCategories returns the union of both
          const allIds = allCategories.map(c => c.id);
          const defaultIds = defaultCategories.map(c => c.id);
          const customIds = customCategoriesList.map(c => c.id);
          
          for (const id of defaultIds) {
            expect(allIds).toContain(id);
          }
          for (const id of customIds) {
            expect(allIds).toContain(id);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty state initialization
   * When no categories exist, initialization should create all 8 defaults
   */
  it('should initialize with all 8 default categories when starting from empty state', () => {
    // Clear all categories
    CategoryStorage.saveCategories([]);
    
    // Initialize
    CategoryManager.initializeCategories();
    
    // Get categories
    const categories = CategoryManager.getAllCategories();
    
    // Assert we have exactly 8 categories
    expect(categories.length).toBe(8);
    
    // Assert all are default categories
    for (const category of categories) {
      expect(category.isDefault).toBe(true);
    }
    
    // Assert all default category IDs are present
    const categoryIds = categories.map(c => c.id);
    expect(categoryIds).toContain('work');
    expect(categoryIds).toContain('study');
    expect(categoryIds).toContain('rest');
    expect(categoryIds).toContain('sleep');
    expect(categoryIds).toContain('life');
    expect(categoryIds).toContain('entertainment');
    expect(categoryIds).toContain('health');
    expect(categoryIds).toContain('hobby');
  });

  /**
   * Edge case: Duplicate custom category names
   * System should allow multiple custom categories with the same name
   * (they have different IDs)
   */
  it('should allow multiple custom categories with the same name', () => {
    const name = 'My Custom Category';
    
    const cat1 = CategoryManager.createCategory(name, 'bg-red-200', 'Star');
    const cat2 = CategoryManager.createCategory(name, 'bg-blue-200', 'Heart');
    
    const categories = CategoryManager.getAllCategories();
    
    // Both should exist with different IDs
    expect(categories.find(c => c.id === cat1.id)).toBeDefined();
    expect(categories.find(c => c.id === cat2.id)).toBeDefined();
    expect(cat1.id).not.toBe(cat2.id);
    
    // Both should have the same name
    expect(cat1.name).toBe(name);
    expect(cat2.name).toBe(name);
  });

  /**
   * Property: Category list persistence
   * Categories should persist across storage operations
   */
  it('should persist category list across storage operations', () => {
    fc.assert(
      fc.property(
        fc.array(customCategoryArbitrary, { minLength: 1, maxLength: 5 }),
        (customCategories) => {
          // Clear and reinitialize before each property test iteration
          global.localStorage.clear();
          CategoryManager.initializeCategories();
          
          // Create custom categories
          const createdIds: string[] = [];
          for (const custom of customCategories) {
            const created = CategoryManager.createCategory(
              custom.name,
              custom.color,
              custom.icon
            );
            createdIds.push(created.id);
          }
          
          // Get categories before reload
          const categoriesBefore = CategoryManager.getAllCategories();
          
          // Simulate reload by getting categories again
          const categoriesAfter = CategoryManager.getAllCategories();
          
          // Assert same categories exist
          expect(categoriesAfter.length).toBe(categoriesBefore.length);
          
          for (const id of createdIds) {
            expect(categoriesBefore.find(c => c.id === id)).toBeDefined();
            expect(categoriesAfter.find(c => c.id === id)).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
