/**
 * Special Ball Manager - Handles dropping and managing special balls
 * Integrates with Achievement Jar for celebration feedback
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SpecialBall, SpecialBallType, getSpecialBallType, generateDropPosition, triggerHapticFeedback } from './SpecialBall.js';
import { CelebrationType } from './types.js';

export interface SpecialBallData {
  id: string;
  type: SpecialBallType;
  celebrationType: CelebrationType;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  timestamp: number;
}

interface SpecialBallManagerProps {
  jarWidth: number;
  jarHeight: number;
  onBallLanded?: (ball: SpecialBallData) => void;
}

export const SpecialBallManager: React.FC<SpecialBallManagerProps> = ({
  jarWidth,
  jarHeight,
  onBallLanded
}) => {
  const [specialBalls, setSpecialBalls] = useState<SpecialBallData[]>([]);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  // 物理模拟参数
  const GRAVITY = 0.5;
  const BOUNCE_DAMPING = 0.7;
  const FRICTION = 0.98;

  // 掉落特殊球体
  const dropSpecialBall = useCallback((celebrationType: CelebrationType) => {
    const type = getSpecialBallType(celebrationType);
    const position = generateDropPosition(jarWidth);
    
    const newBall: SpecialBallData = {
      id: `special-${Date.now()}-${Math.random()}`,
      type,
      celebrationType,
      position,
      velocity: { x: 0, y: 0 },
      timestamp: Date.now()
    };

    setSpecialBalls(prev => [...prev, newBall]);
    
    // 触觉反馈
    triggerHapticFeedback('medium');
    
    // 通知父组件
    setTimeout(() => {
      onBallLanded?.(newBall);
    }, 600); // 等待掉落动画完成

    // 5秒后自动移除
    setTimeout(() => {
      setSpecialBalls(prev => prev.filter(b => b.id !== newBall.id));
    }, 5000);
  }, [jarWidth, onBallLanded]);

  // 简单的物理模拟（如果需要更复杂的，可以集成 Matter.js）
  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 16.67; // 标准化到 60fps
      lastUpdateRef.current = now;

      setSpecialBalls(prev => {
        return prev.map(ball => {
          // 应用重力
          let newVelocityY = ball.velocity.y + GRAVITY * deltaTime;
          let newVelocityX = ball.velocity.x * FRICTION;

          // 更新位置
          let newY = ball.position.y + newVelocityY;
          let newX = ball.position.x + newVelocityX;

          // 底部碰撞检测
          const ballSize = 40 * 1.3; // 特殊球体大小
          if (newY + ballSize > jarHeight) {
            newY = jarHeight - ballSize;
            newVelocityY = -newVelocityY * BOUNCE_DAMPING;
            
            // 如果速度很小，停止弹跳
            if (Math.abs(newVelocityY) < 0.5) {
              newVelocityY = 0;
            }
          }

          // 左右边界碰撞
          if (newX < 0) {
            newX = 0;
            newVelocityX = -newVelocityX * BOUNCE_DAMPING;
          } else if (newX + ballSize > jarWidth) {
            newX = jarWidth - ballSize;
            newVelocityX = -newVelocityX * BOUNCE_DAMPING;
          }

          return {
            ...ball,
            position: { x: newX, y: newY },
            velocity: { x: newVelocityX, y: newVelocityY }
          };
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (specialBalls.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [specialBalls.length, jarWidth, jarHeight]);

  return (
    <>
      {specialBalls.map(ball => (
        <SpecialBall
          key={ball.id}
          id={ball.id}
          type={ball.type}
          celebrationType={ball.celebrationType}
          position={ball.position}
          onClick={() => {
            // 点击球体时移除
            setSpecialBalls(prev => prev.filter(b => b.id !== ball.id));
            triggerHapticFeedback('light');
          }}
        />
      ))}
    </>
  );
};

// Hook for using special ball manager
export function useSpecialBallManager(jarWidth: number, jarHeight: number) {
  const managerRef = useRef<{ dropSpecialBall: (type: CelebrationType) => void }>();
  const [ballCount, setBallCount] = useState(0);

  const dropSpecialBall = useCallback((celebrationType: CelebrationType) => {
    managerRef.current?.dropSpecialBall(celebrationType);
    setBallCount(prev => prev + 1);
  }, []);

  return {
    dropSpecialBall,
    ballCount,
    SpecialBallManagerComponent: (props: Omit<SpecialBallManagerProps, 'jarWidth' | 'jarHeight'>) => (
      <SpecialBallManager
        {...props}
        jarWidth={jarWidth}
        jarHeight={jarHeight}
        ref={managerRef}
      />
    )
  };
}
