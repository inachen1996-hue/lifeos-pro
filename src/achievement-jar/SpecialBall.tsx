/**
 * Special Ball Component - Rainbow Candy, Gold Coin, Star
 * Dropped when user clicks celebration buttons for emotional feedback
 */

import React from 'react';
import { CelebrationType } from './types.js';

export type SpecialBallType = 'rainbow-candy' | 'gold-coin' | 'star';

export interface SpecialBallProps {
  id: string;
  type: SpecialBallType;
  celebrationType: CelebrationType;
  position: { x: number; y: number };
  size?: number;
  onClick?: () => void;
}

// 特殊球体配置
const SPECIAL_BALL_CONFIG = {
  'rainbow-candy': {
    emoji: '🍬',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 25%, #6BCF7F 50%, #4ECDC4 75%, #A78BFA 100%)',
    shadow: '0 8px 24px rgba(255, 107, 107, 0.4), 0 4px 12px rgba(167, 139, 250, 0.3)',
    animation: 'rainbow-pulse',
    sizeMultiplier: 1.3
  },
  'gold-coin': {
    emoji: '🪙',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
    shadow: '0 8px 24px rgba(255, 215, 0, 0.5), 0 4px 12px rgba(255, 140, 0, 0.4)',
    animation: 'coin-spin',
    sizeMultiplier: 1.2
  },
  'star': {
    emoji: '⭐',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #C084FC 50%, #E879F9 100%)',
    shadow: '0 8px 24px rgba(167, 139, 250, 0.5), 0 4px 12px rgba(232, 121, 249, 0.4)',
    animation: 'star-glow',
    sizeMultiplier: 1.25
  }
};

// 根据庆祝类型映射特殊球体类型
export function getSpecialBallType(celebrationType: CelebrationType): SpecialBallType {
  const mapping: Record<CelebrationType, SpecialBallType> = {
    'cheer': 'rainbow-candy',
    'clap': 'gold-coin',
    'drum': 'star'
  };
  return mapping[celebrationType] || 'rainbow-candy';
}

export const SpecialBall: React.FC<SpecialBallProps> = ({
  id,
  type,
  celebrationType,
  position,
  size = 40,
  onClick
}) => {
  const config = SPECIAL_BALL_CONFIG[type];
  const actualSize = size * config.sizeMultiplier;

  return (
    <>
      <style>{`
        @keyframes rainbow-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: brightness(1) saturate(1);
          }
          50% { 
            transform: scale(1.1) rotate(180deg);
            filter: brightness(1.2) saturate(1.3);
          }
        }

        @keyframes coin-spin {
          0% { 
            transform: rotateY(0deg) scale(1);
          }
          50% { 
            transform: rotateY(180deg) scale(1.05);
          }
          100% { 
            transform: rotateY(360deg) scale(1);
          }
        }

        @keyframes star-glow {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            box-shadow: ${config.shadow};
          }
          50% { 
            transform: scale(1.15) rotate(72deg);
            box-shadow: ${config.shadow}, 0 0 40px rgba(167, 139, 250, 0.6);
          }
        }

        .special-ball-${type} {
          animation: ${config.animation} 2s ease-in-out infinite;
        }

        .special-ball-drop {
          animation: drop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes drop-in {
          0% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
          }
          60% {
            transform: translateY(10px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div
        className={`special-ball special-ball-${type} special-ball-drop`}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          background: config.gradient,
          borderRadius: type === 'gold-coin' ? '50%' : '50%',
          boxShadow: config.shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${actualSize * 0.6}px`,
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 100,
          // 3D 效果
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          // 玻璃质感
          border: '2px solid rgba(255, 255, 255, 0.3)',
          // 内部高光
          backgroundImage: `
            ${config.gradient},
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%)
          `
        }}
        onClick={onClick}
        data-special-ball-id={id}
        data-celebration-type={celebrationType}
      >
        <span style={{
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
          animation: 'bounce 1s ease-in-out infinite'
        }}>
          {config.emoji}
        </span>
      </div>
    </>
  );
};

// 触觉反馈工具函数
export function triggerHapticFeedback(pattern: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if (!('vibrate' in navigator)) return;

  const patterns = {
    light: [30],
    medium: [50, 30, 50],
    heavy: [100, 50, 100, 50, 100]
  };

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (error) {
    console.warn('Haptic feedback not supported:', error);
  }
}

// 生成随机掉落位置（罐子顶部区域）
export function generateDropPosition(jarWidth: number): { x: number; y: number } {
  // 在罐子宽度的 20%-80% 范围内随机生成 x 坐标
  const minX = jarWidth * 0.2;
  const maxX = jarWidth * 0.8;
  const x = minX + Math.random() * (maxX - minX);
  
  // y 坐标从罐子顶部开始（负值，表示在罐子上方）
  const y = -50;
  
  return { x, y };
}
