/**
 * Achievement Jar Confetti Renderer
 * Animated colorful particles that fall from the top of the screen during celebrations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConfettiParticle, CelebrationType } from './types';

interface ConfettiRendererProps {
  isActive: boolean;
  celebrationType?: CelebrationType;
  intensity?: 'low' | 'medium' | 'high';
  onComplete?: () => void;
  className?: string;
}

// 主题颜色配置
const THEME_COLORS: Record<CelebrationType, string[]> = {
  drum: ['#8B5CF6', '#A855F7', '#9333EA', '#7C3AED', '#DDD6FE', '#C4B5FD'],
  clap: ['#EF4444', '#F87171', '#DC2626', '#B91C1C', '#FECACA', '#FCA5A5'],
  cheer: ['#F97316', '#FB923C', '#EA580C', '#C2410C', '#FED7AA', '#FDBA74']
};

// 强度配置
const INTENSITY_CONFIG = {
  low: { particleCount: 30, spawnRate: 5, duration: 3000 },
  medium: { particleCount: 60, spawnRate: 8, duration: 4000 },
  high: { particleCount: 100, spawnRate: 12, duration: 5000 }
};

/**
 * 单个五彩纸屑粒子组件
 */
const ConfettiParticleComponent: React.FC<{
  particle: ConfettiParticle;
  onRemove: (id: string) => void;
}> = ({ particle, onRemove }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let currentParticle = { ...particle };
    const gravity = 0.5;
    const airResistance = 0.99;

    const animate = () => {
      // 更新物理属性
      currentParticle.vy += gravity;
      currentParticle.vx *= airResistance;
      currentParticle.vy *= airResistance;
      
      currentParticle.x += currentParticle.vx;
      currentParticle.y += currentParticle.vy;
      
      currentParticle.rotation += currentParticle.rotationSpeed;
      currentParticle.life -= 0.01;

      // 应用变换
      element.style.transform = `
        translate(${currentParticle.x}px, ${currentParticle.y}px) 
        rotate(${currentParticle.rotation}deg)
      `;
      element.style.opacity = Math.max(0, currentParticle.life).toString();

      // 检查是否需要移除
      if (currentParticle.life <= 0 || currentParticle.y > window.innerHeight + 100) {
        onRemove(particle.id);
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particle, onRemove]);

  return (
    <div
      ref={elementRef}
      className="fixed pointer-events-none z-50"
      style={{
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: particle.color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        boxShadow: '0 0 6px rgba(255, 255, 255, 0.3)'
      }}
    />
  );
};

/**
 * 五彩纸屑渲染器主组件
 */
export const ConfettiRenderer: React.FC<ConfettiRendererProps> = ({
  isActive,
  celebrationType = 'cheer',
  intensity = 'medium',
  onComplete,
  className = ''
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const nextIdRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 生成随机粒子
  const generateParticle = useCallback((): ConfettiParticle => {
    const colors = THEME_COLORS[celebrationType];
    
    return {
      id: `confetti-${nextIdRef.current++}`,
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 8, // 水平速度
      vy: Math.random() * 3 + 2, // 垂直速度
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4, // 4-12px
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 1.0
    };
  }, [celebrationType]);

  // 移除粒子
  const removeParticle = useCallback((id: string) => {
    setParticles(prev => prev.filter(particle => particle.id !== id));
  }, []);

  // 启动五彩纸屑效果
  useEffect(() => {
    if (!isActive) {
      // 清理所有粒子
      setParticles([]);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const config = INTENSITY_CONFIG[intensity];

    // 立即生成初始粒子
    const initialParticles = Array.from({ length: config.particleCount / 4 }, () => generateParticle());
    setParticles(initialParticles);

    // 定期生成新粒子
    intervalRef.current = setInterval(() => {
      setParticles(prev => {
        // 限制最大粒子数量
        if (prev.length >= config.particleCount) return prev;
        
        const newParticles = Array.from({ length: config.spawnRate }, () => generateParticle());
        return [...prev, ...newParticles];
      });
    }, 200); // 每200ms生成一批新粒子

    // 设置效果持续时间
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // 等待现有粒子完成动画
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    }, config.duration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, intensity, generateParticle, onComplete]);

  if (!isActive && particles.length === 0) {
    return null;
  }

  return (
    <div className={`confetti-renderer fixed inset-0 pointer-events-none z-40 ${className}`}>
      {particles.map(particle => (
        <ConfettiParticleComponent
          key={particle.id}
          particle={particle}
          onRemove={removeParticle}
        />
      ))}
    </div>
  );
};

/**
 * Hook for managing confetti effects
 */
export const useConfettiRenderer = () => {
  const [isActive, setIsActive] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationType>('cheer');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  const startConfetti = useCallback((type: CelebrationType, intensityLevel: 'low' | 'medium' | 'high' = 'medium') => {
    setCelebrationType(type);
    setIntensity(intensityLevel);
    setIsActive(true);
  }, []);

  const stopConfetti = useCallback(() => {
    setIsActive(false);
  }, []);

  const handleComplete = useCallback(() => {
    setIsActive(false);
  }, []);

  return {
    isActive,
    celebrationType,
    intensity,
    startConfetti,
    stopConfetti,
    handleComplete
  };
};

export default ConfettiRenderer;