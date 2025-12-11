/**
 * Achievement Jar Celebration Effects System
 * Combines DanmakuSystem and ConfettiRenderer for comprehensive celebration effects
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CelebrationType } from './types';
import { DanmakuSystem, useDanmakuSystem } from './DanmakuSystem';
import { ConfettiRenderer, useConfettiRenderer } from './ConfettiRenderer';

interface CelebrationEffectsSystemProps {
  onEffectsComplete?: () => void;
  className?: string;
}

interface CelebrationConfig {
  danmaku: boolean;
  confetti: boolean;
  confettiIntensity: 'low' | 'medium' | 'high';
  specialBallDrop?: boolean;
}

// 不同庆祝类型的效果配置
const CELEBRATION_CONFIGS: Record<CelebrationType, CelebrationConfig> = {
  drum: {
    danmaku: true,
    confetti: true,
    confettiIntensity: 'high',
    specialBallDrop: true
  },
  clap: {
    danmaku: true,
    confetti: true,
    confettiIntensity: 'medium',
    specialBallDrop: false
  },
  cheer: {
    danmaku: true,
    confetti: true,
    confettiIntensity: 'high',
    specialBallDrop: true
  }
};

/**
 * 庆祝效果系统主组件
 */
export const CelebrationEffectsSystem: React.FC<CelebrationEffectsSystemProps> = ({
  onEffectsComplete,
  className = ''
}) => {
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set());
  const [currentCelebrationType, setCurrentCelebrationType] = useState<CelebrationType>('cheer');
  
  // 弹幕系统
  const {
    isActive: isDanmakuActive,
    celebrationType: danmakuType,
    startDanmaku,
    handleComplete: handleDanmakuComplete
  } = useDanmakuSystem();

  // 五彩纸屑系统
  const {
    isActive: isConfettiActive,
    celebrationType: confettiType,
    intensity: confettiIntensity,
    startConfetti,
    handleComplete: handleConfettiComplete
  } = useConfettiRenderer();

  // 处理单个效果完成
  const handleEffectComplete = useCallback((effectName: string) => {
    setActiveEffects(prev => {
      const newSet = new Set(prev);
      newSet.delete(effectName);
      return newSet;
    });
  }, []);

  // 处理弹幕完成
  const onDanmakuComplete = useCallback(() => {
    handleDanmakuComplete();
    handleEffectComplete('danmaku');
  }, [handleDanmakuComplete, handleEffectComplete]);

  // 处理五彩纸屑完成
  const onConfettiComplete = useCallback(() => {
    handleConfettiComplete();
    handleEffectComplete('confetti');
  }, [handleConfettiComplete, handleEffectComplete]);

  // 监听所有效果完成
  useEffect(() => {
    if (activeEffects.size === 0 && (isDanmakuActive || isConfettiActive)) {
      // 所有效果都已完成
      onEffectsComplete?.();
    }
  }, [activeEffects.size, isDanmakuActive, isConfettiActive, onEffectsComplete]);

  // 启动庆祝效果
  const startCelebration = useCallback((type: CelebrationType) => {
    const config = CELEBRATION_CONFIGS[type];
    setCurrentCelebrationType(type);
    
    const newActiveEffects = new Set<string>();

    // 启动弹幕效果
    if (config.danmaku) {
      startDanmaku(type);
      newActiveEffects.add('danmaku');
    }

    // 启动五彩纸屑效果
    if (config.confetti) {
      startConfetti(type, config.confettiIntensity);
      newActiveEffects.add('confetti');
    }

    // TODO: 实现特殊球掉落动画
    if (config.specialBallDrop) {
      // 这里可以触发特殊球掉落到成就罐中的动画
      console.log(`Special ball drop animation for ${type}`);
    }

    setActiveEffects(newActiveEffects);
  }, [startDanmaku, startConfetti]);

  // 停止所有庆祝效果
  const stopAllCelebrations = useCallback(() => {
    setActiveEffects(new Set());
    // 弹幕和五彩纸屑会在各自的组件中处理停止逻辑
  }, []);

  return (
    <div className={`celebration-effects-system ${className}`}>
      {/* 弹幕系统 */}
      <DanmakuSystem
        isActive={isDanmakuActive}
        celebrationType={danmakuType}
        onComplete={onDanmakuComplete}
      />
      
      {/* 五彩纸屑渲染器 */}
      <ConfettiRenderer
        isActive={isConfettiActive}
        celebrationType={confettiType}
        intensity={confettiIntensity}
        onComplete={onConfettiComplete}
      />
    </div>
  );
};

/**
 * Hook for managing celebration effects
 */
export const useCelebrationEffects = () => {
  const [isActive, setIsActive] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationType>('cheer');
  const celebrationSystemRef = React.useRef<{
    startCelebration: (type: CelebrationType) => void;
    stopAllCelebrations: () => void;
  } | null>(null);

  const startCelebration = useCallback((type: CelebrationType) => {
    setCelebrationType(type);
    setIsActive(true);
    celebrationSystemRef.current?.startCelebration(type);
  }, []);

  const stopCelebration = useCallback(() => {
    setIsActive(false);
    celebrationSystemRef.current?.stopAllCelebrations();
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    celebrationType,
    startCelebration,
    stopCelebration,
    handleComplete,
    celebrationSystemRef
  };
};

export default CelebrationEffectsSystem;