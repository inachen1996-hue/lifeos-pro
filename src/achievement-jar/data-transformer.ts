/**
 * Achievement Jar Progress Visualization - Data Transformer
 * Utility functions to transform existing progress data into jar visualization format
 */

import { CategoryTimeStats, CategoryMetric, ParsedLogItem, RawProgressData, MacaronColor, CategoryPriority, ClayBallProps, AchievementCondition } from './types.js';
import { CategoryMapper } from './CategoryMapper.js';
import { ValidationUtils } from './ValidationUtils.js';

// Category mapping from existing system to Achievement Jar format
const CATEGORY_MAPPINGS = {
  work: {
    name: '工作',
    color: 'bg-macaron-blue' as MacaronColor,
    icon: '💻',
    priority: 'high' as CategoryPriority
  },
  study: {
    name: '学习',
    color: 'bg-macaron-pink' as MacaronColor,
    icon: '📚',
    priority: 'high' as CategoryPriority
  },
  rest: {
    name: '休息',
    color: 'bg-macaron-green' as MacaronColor,
    icon: '🛋️',
    priority: 'normal' as CategoryPriority
  },
  sleep: {
    name: '睡眠',
    color: 'bg-macaron-purple' as MacaronColor,
    icon: '😴',
    priority: 'normal' as CategoryPriority
  },
  life: {
    name: '生活',
    color: 'bg-macaron-orange' as MacaronColor,
    icon: '🏠',
    priority: 'normal' as CategoryPriority
  },
  entertainment: {
    name: '娱乐',
    color: 'bg-macaron-yellow' as MacaronColor,
    icon: '🎮',
    priority: 'normal' as CategoryPriority
  },
  health: {
    name: '健康',
    color: 'bg-emerald-200' as MacaronColor,
    icon: '💪',
    priority: 'normal' as CategoryPriority
  },
  hobby: {
    name: '兴趣',
    color: 'bg-macaron-rose' as MacaronColor,
    icon: '🎨',
    priority: 'normal' as CategoryPriority
  }
};

/**
 * Transform raw progress statistics into CategoryTimeStats for jar visualization
 */
export function transformProgressStats(rawStats: RawProgressData): CategoryTimeStats[] {
  // Validate and sanitize input data
  const validation = ValidationUtils.validateRawProgressData(rawStats);
  if (!validation.isValid) {
    console.warn('Invalid raw progress data:', validation.errors);
    return [];
  }

  const sanitizedStats = ValidationUtils.sanitizeRawProgressData(rawStats);
  
  // Filter out invalid values (NaN, negative, extremely small)
  const validStats = Object.fromEntries(
    Object.entries(sanitizedStats).filter(([_, hours]) => 
      Number.isFinite(hours) && hours > 0.001 // Minimum 0.001 hours (3.6 seconds)
    )
  );
  
  const totalMinutes = Object.values(validStats).reduce((sum, hours) => sum + (hours * 60), 0);
  
  return Object.entries(validStats)
    .map(([categoryId, hours]) => {
      const minutes = hours * 60;
      
      return {
        categoryId,
        name: CategoryMapper.getCategoryName(categoryId),
        totalMinutes: minutes,
        color: CategoryMapper.getAchievementJarColor(categoryId),
        icon: CategoryMapper.getCategoryIcon(categoryId),
        ballCount: calculateBallCount(minutes),
        priority: CategoryMapper.getCategoryPriority(categoryId),
        percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0
      };
    })
    .sort((a, b) => {
      // Sort by priority first (high priority first), then by time
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }
      return b.totalMinutes - a.totalMinutes;
    });
}

/**
 * Calculate number of clay balls based on time duration
 * More time = more balls, with diminishing returns for visual balance
 */
export function calculateBallCount(minutes: number): number {
  // Handle invalid inputs
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  if (minutes < 240) return 4;
  if (minutes < 480) return 5;
  return Math.min(8, Math.floor(minutes / 120) + 2); // Max 8 balls for visual clarity
}

/**
 * Calculate clay ball size based on time duration and priority
 * Work/Study categories get larger balls for visual prominence
 */
export function calculateBallSize(minutes: number, priority: CategoryPriority): number {
  // Ensure minutes is a valid finite number
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 20; // Minimum size
  }
  
  const baseSize = Math.max(20, Math.min(60, 20 + (minutes / 30) * 5));
  
  // High priority categories (work/study) get 20% larger balls
  const priorityMultiplier = priority === 'high' ? 1.2 : 1.0;
  
  return Math.round(baseSize * priorityMultiplier);
}

/**
 * Transform CategoryTimeStats into CategoryMetric for metrics tray
 */
export function transformToMetrics(categoryStats: CategoryTimeStats[]): CategoryMetric[] {
  return categoryStats.map(stat => ({
    categoryId: stat.categoryId,
    name: stat.name,
    icon: stat.icon,
    duration: stat.totalMinutes / 60, // Convert to hours
    color: stat.color,
    percentage: stat.percentage,
    priority: stat.priority
  }));
}

/**
 * Generate clay balls from category statistics
 */
export function generateClayBalls(categoryStats: CategoryTimeStats[]): ClayBallProps[] {
  const balls: ClayBallProps[] = [];
  let ballId = 0;
  
  categoryStats.forEach(stat => {
    const ballSize = calculateBallSize(stat.totalMinutes, stat.priority);
    
    for (let i = 0; i < stat.ballCount; i++) {
      balls.push({
        id: `ball-${ballId++}`,
        categoryId: stat.categoryId,
        size: ballSize,
        color: stat.color,
        position: { x: 0, y: 0 }, // Will be set by physics engine
        isSpecial: false,
        glowIntensity: stat.priority === 'high' ? 0.3 : 0.1,
        priority: stat.priority
      });
    }
  });
  
  return balls;
}

/**
 * Parse fullHistory log text into structured data
 */
export function parseHistoryLogs(logText: string): ParsedLogItem[] {
  if (!logText) return [];
  
  const lines = logText.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    const dateMatch = line.match(/(\d{4}-\d{1,2}-\d{1,2})/);
    const durationMatch = line.match(/(\d+(?:\.\d+)?)\s*(h|m|min|hour)/i);
    const categoryMatch = line.match(/\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]/i);
    const timeRangeMatch = line.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
    
    let duration = 0;
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      duration = unit.startsWith('m') ? value / 60 : value;
    }
    
    const description = line
      .replace(/\d{4}-\d{1,2}-\d{1,2}:\s*/, '')
      .replace(/\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]\s*/i, '')
      .replace(/\d+(?:\.\d+)?\s*(h|m|min|hour)/i, '')
      .replace(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/, '')
      .replace(/\|\s*$/, '')
      .trim();
    
    // Skip entries with invalid or empty descriptions
    if (!description || description.length < 2) {
      return null;
    }
    
    return {
      id: index,
      date: dateMatch ? dateMatch[1] : '',
      category: categoryMatch ? categoryMatch[1].toLowerCase() : 'work',
      duration,
      description,
      startTime: timeRangeMatch ? timeRangeMatch[1] : undefined,
      endTime: timeRangeMatch ? timeRangeMatch[2] : undefined
    };
  }).filter((item): item is ParsedLogItem => item !== null && item.duration > 0);
}

/**
 * Calculate achievement conditions and generate special reward balls
 */
export function checkAchievements(categoryStats: CategoryTimeStats[], totalTime: number): ClayBallProps[] {
  const achievements: AchievementCondition[] = [
    {
      id: 'work-focus',
      name: '专注达人',
      description: '工作时间超过4小时',
      condition: (stats) => {
        const workStat = stats.find(s => s.categoryId === 'work');
        return workStat ? workStat.totalMinutes >= 240 : false;
      },
      rewardType: 'golden-star',
      celebrationMessage: '🌟 专注达人！工作超过4小时！'
    },
    {
      id: 'study-master',
      name: '学习大师',
      description: '学习时间超过3小时',
      condition: (stats) => {
        const studyStat = stats.find(s => s.categoryId === 'study');
        return studyStat ? studyStat.totalMinutes >= 180 : false;
      },
      rewardType: 'golden-star',
      celebrationMessage: '📚 学习大师！持续学习3小时！'
    },
    {
      id: 'balanced-life',
      name: '生活平衡',
      description: '各类活动都有参与',
      condition: (stats) => {
        const categories = ['work', 'study', 'rest', 'health'];
        return categories.every(cat => stats.some(s => s.categoryId === cat && s.totalMinutes > 0));
      },
      rewardType: 'rainbow-ball',
      celebrationMessage: '🌈 生活平衡大师！各方面都有涉及！'
    },
    {
      id: 'time-warrior',
      name: '时间战士',
      description: '总时间超过8小时',
      condition: (_, total) => total >= 8,
      rewardType: 'golden-star',
      celebrationMessage: '⚡ 时间战士！今日充实度满分！'
    }
  ];
  
  const rewardBalls: ClayBallProps[] = [];
  let rewardId = 0;
  
  achievements.forEach(achievement => {
    if (achievement.condition(categoryStats, totalTime)) {
      const ball: ClayBallProps = {
        id: `reward-${rewardId++}`,
        categoryId: 'achievement',
        size: 45, // Slightly larger than normal balls
        color: 'bg-macaron-yellow', // Golden color for achievements
        position: { x: 0, y: 0 },
        isSpecial: true,
        glowIntensity: 0.8, // High glow for special balls
        priority: 'high'
      };
      
      rewardBalls.push(ball);
    }
  });
  
  return rewardBalls;
}

/**
 * Get category color theme for celebrations
 */
export function getCelebrationColors(celebrationType: 'drum' | 'clap' | 'cheer'): string[] {
  switch (celebrationType) {
    case 'drum':
      return ['#C8A2E0', '#9B6BB8', '#8B5A9F']; // Purple theme
    case 'clap':
      return ['#F5C2D6', '#E8A5C0', '#D89BB3']; // Pink/Red theme
    case 'cheer':
      return ['#FFE9D6', '#FFB366', '#FF9500']; // Orange theme
    default:
      return ['#BDE0FE', '#A2D2FF', '#48CAE4']; // Default blue theme
  }
}

/**
 * Generate empty state data for when no progress exists
 */
export function generateEmptyStateData(): CategoryTimeStats[] {
  return [
    {
      categoryId: 'sample-work',
      name: '开始工作',
      totalMinutes: 0,
      color: 'bg-macaron-blue',
      icon: '💻',
      ballCount: 0,
      priority: 'high',
      percentage: 0
    },
    {
      categoryId: 'sample-study',
      name: '开始学习',
      totalMinutes: 0,
      color: 'bg-macaron-pink',
      icon: '📚',
      ballCount: 0,
      priority: 'high',
      percentage: 0
    }
  ];
}

/**
 * Validate and sanitize category data
 */
export function validateCategoryData(stats: CategoryTimeStats[]): CategoryTimeStats[] {
  return stats.filter(stat => {
    // Ensure required fields exist and are valid
    return stat.categoryId && 
           stat.name && 
           typeof stat.totalMinutes === 'number' && 
           stat.totalMinutes >= 0 &&
           stat.color &&
           stat.icon;
  }).map(stat => ({
    ...stat,
    // Ensure ball count is reasonable
    ballCount: Math.max(0, Math.min(8, stat.ballCount)),
    // Ensure percentage is valid
    percentage: Number.isFinite(stat.percentage) ? Math.max(0, Math.min(100, stat.percentage)) : 0
  }));
}