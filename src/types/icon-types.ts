/**
 * Icon Selection Types for Timer Icon Selection Feature
 * These interfaces define the data structures for icon selection functionality
 */

/**
 * Icon Source - Tracks how the icon was selected
 */
export type IconSource = 'default' | 'smart' | 'manual';

/**
 * Icon Size - Different sizes for various use cases
 */
export type IconSize = 'small' | 'medium' | 'large';

/**
 * Icon Mapping - Maps keywords to icons with metadata
 */
export interface IconMapping {
  keywords: string[];
  icon: string;
  category?: string;
  priority: number;
}

/**
 * Icon Selection State - Manages the state of icon selection
 */
export interface IconSelectionState {
  selectedIcon: string;
  isSmartMatchEnabled: boolean;
  userHasManuallySelected: boolean;
  lastSmartMatchInput: string;
  availableIcons: string[];
}

/**
 * Smart Matcher Configuration
 */
export interface SmartMatcherConfig {
  keywordMappings: Record<string, string>;
  enabledCategories: string[];
  matchThreshold: number;
}

/**
 * Icon Selector Props
 */
export interface IconSelectorProps {
  selectedIcon: string;
  categoryId: string;
  onIconChange: (icon: string) => void;
  onSmartMatch?: (icon: string) => void;
  disabled?: boolean;
}

/**
 * Glass Icon Props
 */
export interface GlassIconProps {
  icon: string;
  categoryColor: string;
  size?: IconSize;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Category Color Service Interface
 */
export interface CategoryColorService {
  getThemeColor(categoryId: string): string;
  getGlowEffect(categoryId: string): string;
  getCSSVariables(categoryId: string): Record<string, string>;
}

/**
 * Extended Timer Interface with Icon Selection Support
 */
export interface TimerWithIconSelection {
  id: string;
  name: string;
  icon: string;
  iconSource: IconSource; // New: tracks how icon was selected
  iconSelectedAt?: string; // New: timestamp of icon selection
  categoryId: string;
  mode: 'stopwatch' | 'countdown' | 'pomodoro';
  settings: {
    countdownDuration?: number;
    workDuration?: number;
    restDuration?: number;
    cycles?: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Default Icon Mappings - Common keyword to icon mappings
 */
export const DEFAULT_ICON_MAPPINGS: IconMapping[] = [
  // Study & Learning
  {
    keywords: ['看书', '阅读', '读书', '学习', '书', 'study', 'read', 'book'],
    icon: '📖',
    category: 'study',
    priority: 1
  },
  {
    keywords: ['写作', '写字', '笔记', 'write', 'note'],
    icon: '✍️',
    category: 'study',
    priority: 1
  },
  {
    keywords: ['考试', '测试', 'exam', 'test'],
    icon: '📝',
    category: 'study',
    priority: 1
  },

  // Work & Programming
  {
    keywords: ['代码', '编程', '开发', '写代码', 'code', 'programming', 'dev'],
    icon: '💻',
    category: 'work',
    priority: 1
  },
  {
    keywords: ['会议', '开会', 'meeting'],
    icon: '👥',
    category: 'work',
    priority: 1
  },
  {
    keywords: ['设计', 'design'],
    icon: '🎭',
    category: 'work',
    priority: 1
  },

  // Health & Exercise
  {
    keywords: ['跑步', '运动', '健身', '锻炼', 'run', 'exercise', 'workout'],
    icon: '👟',
    category: 'health',
    priority: 1
  },
  {
    keywords: ['瑜伽', 'yoga'],
    icon: '🧘',
    category: 'health',
    priority: 1
  },
  {
    keywords: ['游泳', 'swim'],
    icon: '🏊‍♂️',
    category: 'health',
    priority: 1
  },

  // Food & Cooking
  {
    keywords: ['做饭', '烹饪', '料理', 'cook', 'cooking'],
    icon: '👨‍🍳',
    category: 'life',
    priority: 1
  },
  {
    keywords: ['吃饭', '用餐', 'eat', 'meal'],
    icon: '🍽️',
    category: 'life',
    priority: 1
  },

  // Entertainment
  {
    keywords: ['游戏', '玩游戏', 'game', 'gaming'],
    icon: '🎮',
    category: 'entertainment',
    priority: 1
  },
  {
    keywords: ['电影', '看电影', 'movie', 'film'],
    icon: '🎬',
    category: 'entertainment',
    priority: 1
  },
  {
    keywords: ['音乐', '听音乐', 'music'],
    icon: '🎵',
    category: 'entertainment',
    priority: 1
  },

  // Rest & Sleep
  {
    keywords: ['睡觉', '休息', '小憩', 'sleep', 'rest', 'nap'],
    icon: '😴',
    category: 'sleep',
    priority: 1
  },
  {
    keywords: ['冥想', '放松', 'meditation', 'relax'],
    icon: '🧘‍♀️',
    category: 'rest',
    priority: 1
  },

  // Travel & Transportation
  {
    keywords: ['开车', '驾驶', 'drive', 'driving'],
    icon: '🚗',
    category: 'life',
    priority: 1
  },
  {
    keywords: ['旅行', '旅游', 'travel'],
    icon: '✈️',
    category: 'hobby',
    priority: 1
  },

  // Hobbies
  {
    keywords: ['画画', '绘画', 'draw', 'paint'],
    icon: '🎭',
    category: 'hobby',
    priority: 1
  },
  {
    keywords: ['摄影', 'photo', 'photography'],
    icon: '📷',
    category: 'hobby',
    priority: 1
  }
];

/**
 * Available Icons - Comprehensive list of available emoji icons
 */
export const AVAILABLE_ICONS = [
  // Work & Productivity
  '💻', '📊', '📈', '📉', '📋', '📝', '✍️', '🖊️', '📞', '📧', '💼', '🏢', '👥', '🤝', '💡', '🎯',
  
  // Study & Learning
  '📖', '📚', '📓', '📔', '📕', '📗', '📘', '📙', '🔍', '🧠', '🎓', '✏️', '📐', '📏', '🧮', '🔬',
  
  // Health & Exercise
  '👟', '🏃‍♂️', '🏃‍♀️', '🚴‍♂️', '🚴‍♀️', '🏊‍♂️', '🏊‍♀️', '🧘‍♂️', '🧘‍♀️', '💪', '🏋️‍♂️', '🏋️‍♀️', '⚽', '🏀', '🎾', '🏓',
  
  // Food & Cooking
  '🍽️', '👨‍🍳', '👩‍🍳', '🥘', '🍳', '🥗', '🍕', '🍔', '🍜', '🍱', '🥙', '🌮', '🍰', '☕', '🍵', '🥤',
  
  // Entertainment
  '🎮', '🎬', '🎵', '🎸', '🎹', '🎤', '📺', '📱', '🎲', '🃏', '🎪', '🎭', '📷', '🎳',
  
  // Rest & Sleep
  '😴', '🛏️', '💤', '🧘', '🕯️', '🛀', '🧖‍♀️', '🧖‍♂️', '🦋', '🌸', '🍃',
  
  // Transportation
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵',
  '🚲', '🛴', '🛹', '🚁', '✈️', '🛫', '🛬', '🚀', '🛸', '⛵', '🚤', '🛥️', '🚢', '⚓', '🚂', '🚃',
  
  // Nature & Weather
  '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '⭐', '🌟',
  '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️',
  
  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  
  // Objects & Tools
  '⏰', '⏲️', '⏱️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🔔',
  '🔕', '📢', '📣', '📯', '🔊', '🔉', '🔈', '🔇', '🎧', '📻', '🎙️', '🎚️', '🎛️', '⚙️', '🔧', '🔨',
  
  // Symbols & Misc
  '✅', '❌', '⭕', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹',
  '💎', '💍', '👑', '🎁', '🎀', '🎊', '🎉', '🎈', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🌹'
];