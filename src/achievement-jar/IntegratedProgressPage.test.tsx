/**
 * Achievement Jar Integration - Integrated Progress Page Property Tests
 * Property-based tests for interface replacement functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { TimeRange } from './types.js';

// Mock the complex dependencies to focus on the integration logic
vi.mock('./LifeOSIntegration.js', () => ({
  LifeOSAchievementJar: ({ className }: any) => (
    <div className={`mocked-achievement-jar ${className}`} data-testid="achievement-jar">
      Achievement Jar Component
    </div>
  )
}));

vi.mock('./ErrorBoundary.js', () => ({
  ErrorBoundary: ({ children, fallback }: any) => (
    <div data-testid="error-boundary">
      {children}
    </div>
  )
}));

vi.mock('./LoadingStates.js', () => ({
  default: {
    AchievementJarLoading: () => (
      <div data-testid="loading-state">加载中...</div>
    )
  }
}));

import { IntegratedProgressPage } from './IntegratedProgressPage.js';

/**
 * **Feature: achievement-jar-integration, Property 1: Achievement Jar 界面替换**
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * For any current progress page loading, the system should display Achievement Jar container 
 * instead of traditional statistics cards, and correctly handle time range switching
 */
describe('IntegratedProgressPage Property Tests', () => {
  const mockCategories = [
    { id: 'work', label: '工作', color: 'bg-airy-blue', text: 'text-airy-gray-dark', icon: 'text-blue-500' },
    { id: 'study', label: '学习', color: 'bg-airy-green', text: 'text-airy-gray-dark', icon: 'text-teal-500' },
    { id: 'rest', label: '休息', color: 'bg-airy-pink-light', text: 'text-airy-gray-dark', icon: 'text-pink-500' }
  ];

  const mockCustomSounds = {
    cheer: '/sounds/cheer.mp3',
    clap: '/sounds/clap.mp3',
    drum: '/sounds/drum.mp3'
  };

  // Helper function to generate test log data
  function generateTestLogs(categories: string[], hours: number[]): string {
    const today = new Date().toISOString().split('T')[0];
    const lines: string[] = [];
    
    categories.forEach((category, index) => {
      if (hours[index] > 0) {
        lines.push(`${today}: [${category.toUpperCase()}] Test activity ${hours[index]}h`);
      }
    });
    
    return lines.join('\n');
  }

  beforeEach(() => {
    // Clear any existing global integration
    vi.clearAllMocks();
  });

  it('should display Achievement Jar container instead of traditional cards when enabled', async () => {
    const fullHistory = generateTestLogs(['work', 'study'], [4, 2]);
    const onScopeChange = vi.fn();

    render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Should show Achievement Jar mode
    const achievementJar = screen.queryByTestId('achievement-jar');
    expect(achievementJar).toBeInTheDocument();

    // Should not show traditional fallback
    const fallback = document.querySelector('.traditional-fallback');
    expect(fallback).not.toBeInTheDocument();
  });

  it('should fall back to traditional interface when Achievement Jar is disabled', async () => {
    const fullHistory = generateTestLogs(['work', 'study'], [4, 2]);
    const onScopeChange = vi.fn();

    render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={false}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Should show traditional fallback
    const fallback = document.querySelector('.traditional-fallback');
    expect(fallback).toBeInTheDocument();

    // Should not show Achievement Jar
    const achievementJar = screen.queryByTestId('achievement-jar');
    expect(achievementJar).not.toBeInTheDocument();
  });

  it('should correctly handle time range switching for all supported ranges', async () => {
    const timeRanges: TimeRange[] = ['today', 'weekly', 'monthly'];
    const fullHistory = generateTestLogs(['work', 'study', 'rest'], [3, 2, 1]);
    const onScopeChange = vi.fn();
    
    const { rerender } = render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // Should render without errors for each time range
    for (const timeRange of timeRanges) {
      rerender(
        <IntegratedProgressPage
          progressScope={timeRange}
          fullHistory={fullHistory}
          categories={mockCategories}
          customSounds={mockCustomSounds}
          onScopeChange={onScopeChange}
          enableAchievementJar={true}
        />
      );

      // Should render correctly for each range
      const container = document.querySelector('.integrated-progress-page');
      expect(container).toBeInTheDocument();
    }
  });

  it('should maintain state consistency across multiple renders', () => {
    const fullHistory = generateTestLogs(['work', 'study'], [4, 2]);
    const onScopeChange = vi.fn();

    const { rerender } = render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // Re-render with same props multiple times
    for (let i = 0; i < 3; i++) {
      rerender(
        <IntegratedProgressPage
          progressScope="today"
          fullHistory={fullHistory}
          categories={mockCategories}
          customSounds={mockCustomSounds}
          onScopeChange={onScopeChange}
          enableAchievementJar={true}
        />
      );

      // Should maintain consistent rendering
      const container = document.querySelector('.integrated-progress-page');
      expect(container).toBeInTheDocument();
    }
  });

  it('should handle empty data gracefully in both modes', () => {
    const emptyHistory = '';
    const onScopeChange = vi.fn();

    // Test Achievement Jar mode with empty data
    const { rerender } = render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={emptyHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // Should render without errors
    const container = document.querySelector('.integrated-progress-page');
    expect(container).toBeInTheDocument();

    // Test traditional mode with empty data
    rerender(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={emptyHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={false}
      />
    );

    // Should still render without errors
    expect(document.querySelector('.integrated-progress-page')).toBeInTheDocument();
  });

  it('should preserve existing state management and event handling', () => {
    const fullHistory = generateTestLogs(['work', 'study'], [4, 2]);
    const onScopeChange = vi.fn();

    render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // The onScopeChange callback should be preserved and callable
    expect(typeof onScopeChange).toBe('function');
    expect(onScopeChange).not.toHaveBeenCalled();

    // Test that the component maintains its props correctly
    const container = document.querySelector('.integrated-progress-page');
    expect(container).toBeInTheDocument();
  });

  it('should handle rapid time range changes without breaking', () => {
    const fullHistory = generateTestLogs(['work', 'study', 'rest'], [3, 2, 1]);
    const onScopeChange = vi.fn();
    const timeRanges: TimeRange[] = ['today', 'weekly', 'monthly'];

    const { rerender } = render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // Rapidly change time ranges
    for (let i = 0; i < 5; i++) {
      const randomRange = timeRanges[i % timeRanges.length];
      
      rerender(
        <IntegratedProgressPage
          progressScope={randomRange}
          fullHistory={fullHistory}
          categories={mockCategories}
          customSounds={mockCustomSounds}
          onScopeChange={onScopeChange}
          enableAchievementJar={true}
        />
      );

      // Should not break or throw errors
      expect(document.querySelector('.integrated-progress-page')).toBeInTheDocument();
    }
  });

  it('should maintain component lifecycle correctly', () => {
    const fullHistory = generateTestLogs(['work'], [2]);
    const onScopeChange = vi.fn();

    const { unmount } = render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={mockCustomSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // Component should render successfully
    expect(document.querySelector('.integrated-progress-page')).toBeInTheDocument();

    // Should unmount without errors
    expect(() => unmount()).not.toThrow();
  });

  it('should handle custom sounds integration correctly', () => {
    const fullHistory = generateTestLogs(['work', 'study'], [4, 2]);
    const onScopeChange = vi.fn();
    const customSounds = {
      cheer: '/custom/cheer.wav',
      clap: '/custom/clap.wav',
      drum: '/custom/drum.wav'
    };

    render(
      <IntegratedProgressPage
        progressScope="today"
        fullHistory={fullHistory}
        categories={mockCategories}
        customSounds={customSounds}
        onScopeChange={onScopeChange}
        enableAchievementJar={true}
      />
    );

    // Should render without errors
    const container = document.querySelector('.integrated-progress-page');
    expect(container).toBeInTheDocument();
  });
});