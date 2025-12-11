/**
 * Achievement Jar Progress Visualization - State Management
 * Manages state synchronization with LifeOS system and time range selection
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CategoryTimeStats } from './types.js';

// State types
interface AchievementJarState {
  // Data state
  categoryStats: CategoryTimeStats[];
  totalTime: number;
  isEmpty: boolean;
  isLoading: boolean;
  
  // UI state
  timeRange: 'today' | 'weekly' | 'monthly';
  selectedCategory: string | null;
  showCelebration: boolean;
  
  // Integration state
  lastDataUpdate: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  error: string | null;
}

// Action types
type AchievementJarAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { stats: CategoryTimeStats[]; totalTime: number } }
  | { type: 'SET_TIME_RANGE'; payload: 'today' | 'weekly' | 'monthly' }
  | { type: 'SELECT_CATEGORY'; payload: string | null }
  | { type: 'SHOW_CELEBRATION'; payload: boolean }
  | { type: 'SET_SYNC_STATUS'; payload: 'idle' | 'syncing' | 'error' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_TIMESTAMP' };

// Initial state
const initialState: AchievementJarState = {
  categoryStats: [],
  totalTime: 0,
  isEmpty: true,
  isLoading: false,
  timeRange: 'today',
  selectedCategory: null,
  showCelebration: false,
  lastDataUpdate: 0,
  syncStatus: 'idle',
  error: null
};

// Reducer
function achievementJarReducer(state: AchievementJarState, action: AchievementJarAction): AchievementJarState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };

    case 'SET_DATA':
      return {
        ...state,
        categoryStats: action.payload.stats,
        totalTime: action.payload.totalTime,
        isEmpty: action.payload.stats.length === 0,
        isLoading: false,
        lastDataUpdate: Date.now(),
        syncStatus: 'idle',
        error: null
      };

    case 'SET_TIME_RANGE':
      return {
        ...state,
        timeRange: action.payload,
        selectedCategory: null, // Clear selection when changing time range
        showCelebration: false
      };

    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload
      };

    case 'SHOW_CELEBRATION':
      return {
        ...state,
        showCelebration: action.payload
      };

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        syncStatus: 'error',
        isLoading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        syncStatus: 'idle'
      };

    case 'UPDATE_TIMESTAMP':
      return {
        ...state,
        lastDataUpdate: Date.now()
      };

    default:
      return state;
  }
}

// Context
interface AchievementJarContextType {
  state: AchievementJarState;
  dispatch: React.Dispatch<AchievementJarAction>;
  
  // Action creators
  setLoading: (loading: boolean) => void;
  setData: (stats: CategoryTimeStats[], totalTime: number) => void;
  setTimeRange: (range: 'today' | 'weekly' | 'monthly') => void;
  selectCategory: (categoryId: string | null) => void;
  showCelebration: (show: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed values
  hasData: boolean;
  isDataStale: boolean;
  priorityCategories: CategoryTimeStats[];
}

const AchievementJarContext = createContext<AchievementJarContextType | null>(null);

// Provider component
interface AchievementJarProviderProps {
  children: React.ReactNode;
  dataRefreshInterval?: number; // milliseconds
  staleDataThreshold?: number; // milliseconds
}

export const AchievementJarProvider: React.FC<AchievementJarProviderProps> = ({
  children,
  dataRefreshInterval = 30000, // 30 seconds
  staleDataThreshold = 60000 // 1 minute
}) => {
  const [state, dispatch] = useReducer(achievementJarReducer, initialState);

  // Action creators
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setData = useCallback((stats: CategoryTimeStats[], totalTime: number) => {
    dispatch({ type: 'SET_DATA', payload: { stats, totalTime } });
  }, []);

  const setTimeRange = useCallback((range: 'today' | 'weekly' | 'monthly') => {
    dispatch({ type: 'SET_TIME_RANGE', payload: range });
  }, []);

  const selectCategory = useCallback((categoryId: string | null) => {
    dispatch({ type: 'SELECT_CATEGORY', payload: categoryId });
  }, []);

  const showCelebration = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_CELEBRATION', payload: show });
  }, []);

  const setSyncStatus = useCallback((status: 'idle' | 'syncing' | 'error') => {
    dispatch({ type: 'SET_SYNC_STATUS', payload: status });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Computed values
  const hasData = state.categoryStats.length > 0;
  const isDataStale = Date.now() - state.lastDataUpdate > staleDataThreshold;
  const priorityCategories = state.categoryStats
    .filter(stat => stat.priority >= 8) // High priority categories
    .slice(0, 3); // Top 3

  // Auto-refresh data periodically
  useEffect(() => {
    if (!dataRefreshInterval) return;

    const interval = setInterval(() => {
      if (state.syncStatus === 'idle' && hasData) {
        dispatch({ type: 'UPDATE_TIMESTAMP' });
      }
    }, dataRefreshInterval);

    return () => clearInterval(interval);
  }, [dataRefreshInterval, state.syncStatus, hasData]);

  // Context value
  const contextValue: AchievementJarContextType = {
    state,
    dispatch,
    setLoading,
    setData,
    setTimeRange,
    selectCategory,
    showCelebration,
    setSyncStatus,
    setError,
    clearError,
    hasData,
    isDataStale,
    priorityCategories
  };

  return (
    <AchievementJarContext.Provider value={contextValue}>
      {children}
    </AchievementJarContext.Provider>
  );
};

// Hook to use the context
export const useAchievementJar = (): AchievementJarContextType => {
  const context = useContext(AchievementJarContext);
  if (!context) {
    throw new Error('useAchievementJar must be used within an AchievementJarProvider');
  }
  return context;
};

// Hook for LifeOS integration with automatic data synchronization
export const useLifeOSSync = (
  fullHistory: string,
  categoryMap: Record<string, any>
) => {
  const { state, setLoading, setData, setError, setSyncStatus } = useAchievementJar();

  // Sync data with LifeOS when dependencies change
  useEffect(() => {
    const syncData = async () => {
      try {
        setSyncStatus('syncing');
        setLoading(true);

        // Import the integration functions dynamically to avoid circular dependencies
        const { parseLifeOSData } = await import('./LifeOSIntegration.js');
        
        // Parse LifeOS data
        const { stats, totalTime } = await parseLifeOSData(
          fullHistory,
          categoryMap,
          state.timeRange
        );

        setData(stats, totalTime);
      } catch (error) {
        console.error('Failed to sync LifeOS data:', error);
        setError(error instanceof Error ? error.message : 'Failed to sync data');
      } finally {
        setLoading(false);
      }
    };

    // Debounce data sync to avoid excessive updates
    const timeoutId = setTimeout(syncData, 100);
    return () => clearTimeout(timeoutId);
  }, [fullHistory, categoryMap, state.timeRange, setLoading, setData, setError, setSyncStatus]);

  return {
    syncStatus: state.syncStatus,
    lastUpdate: state.lastDataUpdate,
    error: state.error
  };
};

// Hook for celebration management
export const useCelebrationManager = () => {
  const { state, showCelebration } = useAchievementJar();

  const triggerCelebration = useCallback((type: 'achievement' | 'milestone' | 'completion') => {
    showCelebration(true);
    
    // Auto-hide celebration after delay
    setTimeout(() => {
      showCelebration(false);
    }, type === 'achievement' ? 3000 : type === 'milestone' ? 2000 : 1500);
  }, [showCelebration]);

  const hideCelebration = useCallback(() => {
    showCelebration(false);
  }, [showCelebration]);

  return {
    isShowingCelebration: state.showCelebration,
    triggerCelebration,
    hideCelebration
  };
};

// Hook for category management
export const useCategoryManager = () => {
  const { state, selectCategory } = useAchievementJar();

  const selectCategoryById = useCallback((categoryId: string) => {
    selectCategory(categoryId);
  }, [selectCategory]);

  const clearSelection = useCallback(() => {
    selectCategory(null);
  }, [selectCategory]);

  const getSelectedCategory = useCallback(() => {
    if (!state.selectedCategory) return null;
    return state.categoryStats.find(stat => stat.categoryId === state.selectedCategory) || null;
  }, [state.selectedCategory, state.categoryStats]);

  return {
    selectedCategoryId: state.selectedCategory,
    selectedCategory: getSelectedCategory(),
    selectCategory: selectCategoryById,
    clearSelection,
    allCategories: state.categoryStats
  };
};

// Hook for time range management with persistence
export const useTimeRangeManager = () => {
  const { state, setTimeRange } = useAchievementJar();

  // Persist time range to localStorage
  useEffect(() => {
    localStorage.setItem('lifeos_achievement_jar_time_range', state.timeRange);
  }, [state.timeRange]);

  // Load time range from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lifeos_achievement_jar_time_range');
    if (saved && ['today', 'weekly', 'monthly'].includes(saved)) {
      setTimeRange(saved as 'today' | 'weekly' | 'monthly');
    }
  }, [setTimeRange]);

  const changeTimeRange = useCallback((range: 'today' | 'weekly' | 'monthly') => {
    setTimeRange(range);
  }, [setTimeRange]);

  return {
    currentRange: state.timeRange,
    changeTimeRange,
    isToday: state.timeRange === 'today',
    isWeekly: state.timeRange === 'weekly',
    isMonthly: state.timeRange === 'monthly'
  };
};

// Utility function to parse LifeOS data (to be used by integration)
export const parseLifeOSData = async (
  fullHistory: string,
  categoryMap: Record<string, any>,
  timeRange: 'today' | 'weekly' | 'monthly'
): Promise<{ stats: CategoryTimeStats[]; totalTime: number }> => {
  // Import the actual parsing logic from LifeOSIntegration
  const { parseHistoryLogs, groupByCategory, getCategoryInfo, getDateRangeForScope, getLogsInDateRange } = await import('./LifeOSIntegration.js');
  
  try {
    // Get date range based on scope
    const dateRange = getDateRangeForScope(timeRange);
    const logsInRange = getLogsInDateRange(fullHistory, dateRange.start, dateRange.end);
    
    // Parse logs into structured data
    const parsedEntries = parseHistoryLogs(logsInRange);
    
    // Group by category and calculate statistics
    const categoryGroups = groupByCategory(parsedEntries);
    
    // Convert to CategoryTimeStats format
    const stats: CategoryTimeStats[] = Object.entries(categoryGroups).map(([categoryId, entries]) => {
      const totalMinutes = entries.reduce((sum: number, entry: any) => sum + entry.duration, 0);
      const category = getCategoryInfo(categoryId, categoryMap);
      
      return {
        categoryId,
        name: category.name,
        icon: category.icon,
        color: '#BDE0FE', // Will be set by CategoryColorService
        totalMinutes,
        percentage: 0, // Will be calculated after all categories are processed
        priority: category.priority || 0,
        entries: entries.length
      };
    });

    // Calculate percentages
    const totalTime = stats.reduce((sum, stat) => sum + stat.totalMinutes, 0);
    if (totalTime > 0) {
      stats.forEach(stat => {
        stat.percentage = (stat.totalMinutes / totalTime) * 100;
      });
    }

    // Sort by priority and time
    stats.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return b.totalMinutes - a.totalMinutes; // More time first
    });

    return { stats, totalTime: totalTime / 60 }; // Convert to hours
  } catch (error) {
    console.error('Error parsing LifeOS data:', error);
    return { stats: [], totalTime: 0 };
  }
};

export default AchievementJarProvider;