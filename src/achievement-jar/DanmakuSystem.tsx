/**
 * Achievement Jar Danmaku System
 * Full-screen floating text animations triggered by celebration buttons
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DanmakuItem, CelebrationType } from './types';

interface DanmakuSystemProps {
  isActive: boolean;
  celebrationType?: CelebrationType;
  onComplete?: () => void;
  className?: string;
}

// 庆祝文本配置
const CELEBRATION_TEXTS: Record<CelebrationType, string[]> = {
  drum: [
    '🥁 节拍感满满！',
    '🎵 音乐响起来！',
    '🔥 激情四射！',
    '⚡ 能量爆发！',
    '🌟 超级棒！'
  ],
  clap: [
    '👏 掌声雷动！',
    '🎉 精彩表现！',
    '✨ 太棒了！',
    '🏆 值得鼓掌！',
    '💫 完美！'
  ],
  cheer: [
    '🎉 欢呼庆祝！',
    '🎊 太厉害了！',
    '🌈 彩虹般精彩！',
    '🚀 冲向云霄！',
    '💖 爱心满满！'
  ]
};

// 主题颜色配置
const THEME_COLORS: Record<CelebrationType, string[]> = {
  drum: ['#8B5CF6', '#A855F7', '#9333EA', '#7C3AED'],
  clap: ['#EF4444', '#F87171', '#DC2626', '#B91C1C'],
  cheer: ['#F97316', '#FB923C', '#EA580C', '#C2410C']
};

/**
 * 单个弹幕项组件
 */
const DanmakuItemComponent: React.FC<{
  item: DanmakuItem;
  onAnimationEnd: (id: string) => void;
}> = ({ item, onAnimationEnd }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 设置初始位置（屏幕右侧外）
    element.style.transform = `translateX(100vw) translateY(${item.top}vh)`;
    element.style.opacity = '0';

    // 延迟开始动画
    const startTimer = setTimeout(() => {
      element.style.transition = `transform ${item.duration}s linear, opacity 0.5s ease-in-out`;
      element.style.transform = `translateX(-100vw) translateY(${item.top}vh)`;
      element.style.opacity = '1';

      // 动画结束后淡出
      const fadeTimer = setTimeout(() => {
        element.style.opacity = '0';
        setTimeout(() => onAnimationEnd(item.id), 500);
      }, (item.duration - 0.5) * 1000);

      return () => clearTimeout(fadeTimer);
    }, item.delay * 1000);

    return () => clearTimeout(startTimer);
  }, [item, onAnimationEnd]);

  return (
    <div
      ref={elementRef}
      className="fixed pointer-events-none z-50 whitespace-nowrap"
      style={{
        color: item.color,
        fontSize: '1.5rem',
        fontWeight: '600',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
      }}
    >
      {item.text}
    </div>
  );
};

/**
 * 弹幕系统主组件
 */
export const DanmakuSystem: React.FC<DanmakuSystemProps> = ({
  isActive,
  celebrationType = 'cheer',
  onComplete,
  className = ''
}) => {
  const [danmakuItems, setDanmakuItems] = useState<DanmakuItem[]>([]);
  const nextIdRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // 生成随机弹幕项
  const generateDanmakuItem = useCallback((): DanmakuItem => {
    const texts = CELEBRATION_TEXTS[celebrationType];
    const colors = THEME_COLORS[celebrationType];
    
    return {
      id: `danmaku-${nextIdRef.current++}`,
      text: texts[Math.floor(Math.random() * texts.length)],
      top: Math.random() * 80 + 10, // 10% - 90% 的屏幕高度
      duration: Math.random() * 2 + 4, // 4-6秒的动画时间
      delay: Math.random() * 0.5, // 0-0.5秒的延迟
      color: colors[Math.floor(Math.random() * colors.length)],
      celebrationType
    };
  }, [celebrationType]);

  // 移除弹幕项
  const removeDanmakuItem = useCallback((id: string) => {
    setDanmakuItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // 启动弹幕效果
  useEffect(() => {
    if (!isActive) {
      // 清理所有弹幕
      setDanmakuItems([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // 立即生成第一批弹幕
    const initialItems = Array.from({ length: 3 }, () => generateDanmakuItem());
    setDanmakuItems(initialItems);

    // 定期生成新的弹幕
    intervalRef.current = setInterval(() => {
      setDanmakuItems(prev => {
        // 限制同时显示的弹幕数量
        if (prev.length >= 8) return prev;
        
        return [...prev, generateDanmakuItem()];
      });
    }, 800); // 每800ms生成一个新弹幕

    // 3秒后停止生成新弹幕，等待现有弹幕完成
    const stopTimer = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // 等待所有弹幕完成后调用完成回调
      setTimeout(() => {
        onComplete?.();
      }, 6000); // 最长弹幕动画时间 + 缓冲
    }, 3000);

    return () => {
      clearTimeout(stopTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, generateDanmakuItem, onComplete]);

  if (!isActive && danmakuItems.length === 0) {
    return null;
  }

  return (
    <div className={`danmaku-system fixed inset-0 pointer-events-none z-40 ${className}`}>
      {danmakuItems.map(item => (
        <DanmakuItemComponent
          key={item.id}
          item={item}
          onAnimationEnd={removeDanmakuItem}
        />
      ))}
    </div>
  );
};

/**
 * Hook for managing danmaku effects
 */
export const useDanmakuSystem = () => {
  const [isActive, setIsActive] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationType>('cheer');

  const startDanmaku = useCallback((type: CelebrationType) => {
    setCelebrationType(type);
    setIsActive(true);
  }, []);

  const stopDanmaku = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    celebrationType,
    startDanmaku,
    stopDanmaku,
    handleComplete
  };
};

export default DanmakuSystem;