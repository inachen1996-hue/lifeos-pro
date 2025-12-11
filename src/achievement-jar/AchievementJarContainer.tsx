/**
 * Achievement Jar Progress Visualization - Main Container Component
 * Central 3D frosted glass jar with responsive sizing and empty state handling
 * Enhanced with Airy Macaron styling system
 */

import React, { useMemo } from 'react';
import { AchievementJarProps, CategoryTimeStats, CategoryMetric } from './types.js';
import { generateEmptyStateData, generateClayBalls, checkAchievements } from './data-transformer.js';
import { ClayBallCollection } from './ClayBall.js';
import { MetricsTray } from './MetricsTray.js';
import { 
  AiryMacaronStyleProvider, 
  generateFrostedGlassStyle, 
  generateResponsiveContainerStyle,
  supportsBackdropFilter 
} from './AiryMacaronStyles.js';
import { 
  useViewport, 
  useResponsiveConfig, 
  ResponsiveContainer,
  usePerformanceMonitor 
} from './ResponsiveDesign.js';

interface AchievementJarContainerProps extends AchievementJarProps {
  isEmpty?: boolean;
  isLoading?: boolean;
  onCategorySelect?: (categoryId: string) => void;
}

export const AchievementJarContainer: React.FC<AchievementJarContainerProps> = ({
  categoryStats,
  totalTime,
  timeRange,
  onBallClick,
  className = '',
  isEmpty = false,
  isLoading = false,
  onCategorySelect
}) => {
  // Responsive design hooks
  const viewport = useViewport();
  const responsiveConfig = useResponsiveConfig();
  const performanceMetrics = usePerformanceMonitor();

  // Use empty state data when no progress exists
  const displayStats = useMemo(() => {
    if (isEmpty || categoryStats.length === 0) {
      return generateEmptyStateData();
    }
    return categoryStats;
  }, [categoryStats, isEmpty]);

  // Responsive jar dimensions
  const jarDimensions = useMemo(() => responsiveConfig.jarSize, [responsiveConfig]);

  // Transform category stats to metrics for the tray
  const categoryMetrics = useMemo((): CategoryMetric[] => {
    if (isEmpty || categoryStats.length === 0) return [];
    
    return categoryStats.map(stat => ({
      categoryId: stat.categoryId,
      name: stat.name,
      icon: stat.icon,
      duration: stat.totalMinutes / 60, // Convert to hours
      color: stat.color,
      percentage: stat.percentage,
      priority: stat.priority
    }));
  }, [categoryStats, isEmpty]);

  // Responsive styling
  const containerStyle = generateResponsiveContainerStyle(viewport.isMobile);
  const glassStyle = generateFrostedGlassStyle('heavy');

  return (
    <AiryMacaronStyleProvider>
      <ResponsiveContainer 
        className={`achievement-jar-container flex flex-col items-center justify-center ${className}`}
        enableGestures={viewport.isMobile}
      >
        {/* Jar Container */}
        <div 
          className="achievement-jar relative"
          style={{
            width: jarDimensions.width,
            height: jarDimensions.height,
            maxWidth: jarDimensions.maxWidth
          }}
        >
          {/* 真实玻璃罐子造型 - 瓶颈部分 */}
          <div 
            className="jar-neck absolute top-0 left-1/2 transform -translate-x-1/2"
            style={{
              width: '35%',
              height: '20%',
              background: supportsBackdropFilter() 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(248, 250, 252, 0.4) 50%, rgba(241, 245, 249, 0.3) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.85) 50%, rgba(241, 245, 249, 0.8) 100%)',
              borderRadius: '12px 12px 8px 8px',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: `
                0 8px 24px rgba(148, 163, 184, 0.1),
                inset 0 2px 8px rgba(255, 255, 255, 0.7),
                inset 0 -1px 4px rgba(148, 163, 184, 0.05)
              `,
              zIndex: 2
            }}
          />

          {/* 瓶颈开口 */}
          <div 
            className="jar-opening absolute top-0 left-1/2 transform -translate-x-1/2"
            style={{
              width: '30%',
              height: '8px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(241, 245, 249, 0.5) 100%)',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 2px 8px rgba(148, 163, 184, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
              zIndex: 3
            }}
          />

          {/* 瓶颈内部阴影 */}
          <div 
            className="jar-opening-shadow absolute top-2 left-1/2 transform -translate-x-1/2"
            style={{
              width: '28%',
              height: '6px',
              background: 'linear-gradient(180deg, rgba(100, 116, 139, 0.12) 0%, transparent 100%)',
              borderRadius: '50px',
              zIndex: 1
            }}
          />

          {/* 主罐体 - 圆润的玻璃罐造型 */}
          <div 
            className="jar-body absolute"
            style={{
              top: '15%',
              left: '0',
              right: '0',
              bottom: '0',
              background: supportsBackdropFilter() 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.3) 50%, rgba(241, 245, 249, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.8) 50%, rgba(241, 245, 249, 0.75) 100%)',
              borderRadius: '50% 50% 40px 40px',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)',
              boxShadow: `
                0 16px 48px rgba(148, 163, 184, 0.15),
                0 8px 24px rgba(203, 213, 225, 0.1),
                inset 0 4px 20px rgba(255, 255, 255, 0.6),
                inset 0 -4px 20px rgba(148, 163, 184, 0.05)
              `,
              overflow: 'hidden'
            }}
          />

          {/* 瓶颈与罐体连接处 */}
          <div 
            className="jar-connection absolute left-1/2 transform -translate-x-1/2"
            style={{
              top: '18%',
              width: '45%',
              height: '8px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.5) 50%, rgba(241, 245, 249, 0.4) 100%)',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.7)',
              zIndex: 2
            }}
          />

          {/* Content Area - where balls will be rendered */}
          <div 
            className="jar-content absolute overflow-hidden"
            style={{
              top: '25%',
              left: '8px',
              right: '8px',
              bottom: '8px',
              borderRadius: '45% 45% 32px 32px'
            }}
          >
            {isEmpty || isLoading ? (
              <EmptyJarState isLoading={isLoading} timeRange={timeRange} />
            ) : (
              <JarContent categoryStats={displayStats} onBallClick={onBallClick} />
            )}
          </div>

          {/* 真实玻璃罐子高光效果 */}
          <div className="jar-highlights absolute inset-0 pointer-events-none">
            {/* 瓶颈主要反光 */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 opacity-60"
              style={{
                top: '2%',
                width: '20%',
                height: '15%',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.5) 50%, transparent 80%)',
                borderRadius: '50%',
                filter: 'blur(8px)'
              }}
            />

            {/* 罐体左侧主要反光 */}
            <div 
              className="absolute left-4 opacity-50"
              style={{
                top: '25%',
                width: '12%',
                height: '40%',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.4) 50%, transparent 80%)',
                borderRadius: '50%',
                filter: 'blur(14px)'
              }}
            />
            
            {/* 罐体右侧次要反光 */}
            <div 
              className="absolute right-6 opacity-25"
              style={{
                top: '30%',
                width: '8%',
                height: '35%',
                background: 'linear-gradient(225deg, rgba(203, 213, 225, 0.4) 0%, rgba(148, 163, 184, 0.2) 50%, transparent 80%)',
                borderRadius: '50%',
                filter: 'blur(10px)'
              }}
            />
            
            {/* 罐底反光 */}
            <div 
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-30"
              style={{
                width: '70%',
                height: '8%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(241, 245, 249, 0.5) 50%, transparent 100%)',
                borderRadius: '50%',
                filter: 'blur(8px)'
              }}
            />

            {/* 罐体曲面高光 */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 opacity-20"
              style={{
                top: '20%',
                width: '80%',
                height: '60%',
                background: 'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
                borderRadius: '50%',
                filter: 'blur(20px)'
              }}
            />
          </div>
        </div>

        {/* Enhanced Jar Label with Airy Typography */}
        <div className="jar-label mt-6 text-center">
          <div 
            className="text-sm font-semibold mb-2"
            style={{
              color: 'var(--airy-text-primary)',
              letterSpacing: '0.025em',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            {isEmpty ? '开始你的进度之旅' : '成就收集罐'}
          </div>
          <div 
            className="text-xs leading-relaxed"
            style={{
              color: 'var(--airy-text-secondary)',
              letterSpacing: '0.01em'
            }}
          >
            {isEmpty 
              ? '完成任务后，彩色小球会出现在这里' 
              : `${totalTime.toFixed(1)}小时 · ${timeRange === 'today' ? '今日' : timeRange === 'weekly' ? '本周' : '本月'}`
            }
          </div>
        </div>

      {/* Metrics Tray */}
      {!isEmpty && !isLoading && categoryMetrics.length > 0 && (
        <div className="mt-6">
          <MetricsTray 
            metrics={categoryMetrics}
            onCategorySelect={onCategorySelect}
          />
        </div>
      )}
      </ResponsiveContainer>
    </AiryMacaronStyleProvider>
  );
};

/**
 * Empty State Component - Enhanced with Airy Macaron styling
 */
const EmptyJarState: React.FC<{ isLoading: boolean; timeRange: string }> = ({ isLoading, timeRange }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {/* Enhanced loading spinner with airy aesthetics */}
        <div 
          className="w-8 h-8 rounded-full mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.2) 25%, transparent 25%, transparent 50%, rgba(148, 163, 184, 0.2) 50%, rgba(148, 163, 184, 0.2) 75%, transparent 75%)',
            backgroundSize: '16px 16px',
            animation: 'airy-shimmer 1.5s ease-in-out infinite',
            border: '2px solid rgba(203, 213, 225, 0.3)',
            boxShadow: '0 4px 12px rgba(148, 163, 184, 0.1)'
          }}
        />
        <div 
          className="text-sm font-medium"
          style={{
            color: 'var(--airy-text-secondary)',
            letterSpacing: '0.025em'
          }}
        >
          加载进度数据...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Enhanced floating sample balls with airy macaron colors */}
      <div className="relative mb-8">
        <div 
          className="w-12 h-12 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #E8F4FD 0%, #D1E9FC 50%, #B3DDFB 100%)',
            boxShadow: '0 6px 20px rgba(162, 210, 255, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
            animation: 'gentle-float 3s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
        <div 
          className="absolute -right-4 -top-2 w-8 h-8 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #F9A8D4 100%)',
            boxShadow: '0 6px 20px rgba(245, 194, 214, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
            animation: 'gentle-float 3.5s ease-in-out infinite',
            animationDelay: '0.7s'
          }}
        />
        <div 
          className="absolute -left-3 top-4 w-6 h-6 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)',
            boxShadow: '0 6px 20px rgba(167, 243, 208, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
            animation: 'gentle-float 2.8s ease-in-out infinite',
            animationDelay: '1.2s'
          }}
        />
        
        {/* Subtle ambient glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(203, 213, 225, 0.1) 0%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'gentle-pulse 4s ease-in-out infinite'
          }}
        />
      </div>

      <div 
        className="text-sm font-medium mb-3"
        style={{
          color: 'var(--airy-text-primary)',
          letterSpacing: '0.025em'
        }}
      >
        {timeRange === 'today' ? '今日' : timeRange === 'weekly' ? '本周' : '本月'}暂无进度数据
      </div>
      <div 
        className="text-xs leading-relaxed"
        style={{
          color: 'var(--airy-text-secondary)',
          letterSpacing: '0.01em',
          lineHeight: '1.6'
        }}
      >
        开始计时或记录活动<br />
        彩色小球会在这里堆积
      </div>
    </div>
  );
};

/**
 * Jar Content Component - renders the actual progress balls
 */
const JarContent: React.FC<{ 
  categoryStats: CategoryTimeStats[]; 
  onBallClick?: (categoryId: string) => void;
}> = ({ categoryStats, onBallClick }) => {
  // Generate clay balls from category statistics
  const clayBalls = useMemo(() => {
    const regularBalls = generateClayBalls(categoryStats);
    const totalTime = categoryStats.reduce((sum, stat) => sum + stat.totalMinutes / 60, 0);
    const achievementBalls = checkAchievements(categoryStats, totalTime);
    return [...regularBalls, ...achievementBalls];
  }, [categoryStats]);

  // Responsive container dimensions for ball positioning
  const containerDimensions = useMemo(() => {
    const baseWidth = 240;
    const baseHeight = 260;
    
    return {
      width: Math.round(baseWidth),
      height: Math.round(baseHeight)
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <ClayBallCollection
        balls={clayBalls}
        onBallClick={onBallClick}
        containerWidth={containerDimensions.width}
        containerHeight={containerDimensions.height}
        enablePhysics={true}
        onPerformanceUpdate={(metrics) => {
          // Handle performance metrics and auto-optimization
          if (metrics.fps < 30) {
            console.warn('Physics performance degraded:', metrics);
            // Could trigger automatic quality reduction here
          }
        }}
      />
    </div>
  );
};

