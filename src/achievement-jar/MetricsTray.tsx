/**
 * Achievement Jar Progress Visualization - MetricsTray Component
 * Horizontal scrollable display of category statistics with enhanced Airy Macaron styling
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { MetricsTrayProps, CategoryMetric, MacaronColor } from './types.js';
import { generateMetricPillStyle, getAiryMacaronColor } from './AiryMacaronStyles.js';

interface MetricPillCardProps extends CategoryMetric {
  onClick?: () => void;
  className?: string;
}

/**
 * Individual metric pill card component with enhanced Airy Macaron styling
 */
const MetricPillCard: React.FC<MetricPillCardProps> = ({
  categoryId,
  name,
  icon,
  duration,
  color,
  percentage,
  priority,
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate enhanced airy macaron styling
  const pillStyle = useMemo(() => 
    generateMetricPillStyle(color, isHovered), 
    [color, isHovered]
  );
  
  // Get color configuration for enhanced effects
  const colorConfig = useMemo(() => getAiryMacaronColor(color), [color]);
  
  // Format duration display
  const formattedDuration = useMemo(() => {
    if (duration < 1) {
      return `${Math.round(duration * 60)}分钟`;
    }
    return `${duration.toFixed(1)}小时`;
  }, [duration]);

  return (
    <div
      className={`metric-pill-card flex-shrink-0 cursor-pointer airy-smooth-scroll ${className}`}
      style={{
        width: '168px',
        height: '68px',
        ...pillStyle,
        zIndex: priority === 'high' ? 10 : 5
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Pill content container */}
      <div className="flex items-center h-full px-5 relative">
        {/* Enhanced 3D Icon container with airy styling */}
        <div 
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mr-3"
          style={{
            background: colorConfig.gradient,
            boxShadow: `
              0 4px 12px ${colorConfig.shadow},
              inset 0 2px 4px rgba(255, 255, 255, 0.7),
              inset 0 -1px 2px rgba(100, 116, 139, 0.1)
            `,
            border: `1px solid ${colorConfig.accent}40`
          }}
        >
          <span 
            className="text-lg" 
            role="img" 
            aria-label={name}
            style={{
              filter: 'drop-shadow(0 1px 2px rgba(100, 116, 139, 0.2))'
            }}
          >
            {icon}
          </span>
        </div>

        {/* Enhanced Text content with airy typography */}
        <div className="flex-1 min-w-0">
          <div 
            className="text-sm font-semibold truncate"
            style={{
              color: 'var(--airy-text-primary)',
              letterSpacing: '0.025em'
            }}
          >
            {name}
          </div>
          <div 
            className="text-xs flex items-center"
            style={{
              color: 'var(--airy-text-secondary)',
              letterSpacing: '0.01em'
            }}
          >
            <span>{formattedDuration}</span>
            <span className="mx-1.5 opacity-60">·</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
        </div>

        {/* Enhanced Priority indicator with airy glow */}
        {priority === 'high' && (
          <div 
            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${colorConfig.accent} 0%, ${colorConfig.glow} 100%)`,
              boxShadow: `0 0 8px ${colorConfig.glow}, 0 2px 4px ${colorConfig.shadow}`,
              animation: 'gentle-pulse 2.5s ease-in-out infinite'
            }}
          />
        )}

        {/* Enhanced highlight overlay with airy aesthetics */}
        <div 
          className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.4) 50%, transparent 100%)',
            borderRadius: '32px'
          }}
        />
        
        {/* Subtle inner glow for depth */}
        <div 
          className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${colorConfig.glow} 0%, transparent 70%)`,
            borderRadius: '32px',
            filter: 'blur(8px)'
          }}
        />
      </div>
    </div>
  );
};

/**
 * Main MetricsTray component with horizontal scrolling
 */
export const MetricsTray: React.FC<MetricsTrayProps> = ({
  metrics,
  onCategorySelect,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sort metrics by priority and percentage
  const sortedMetrics = useMemo(() => {
    return [...metrics].sort((a, b) => {
      // High priority first
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }
      // Then by percentage (highest first)
      return b.percentage - a.percentage;
    });
  }, [metrics]);

  // Check scroll state
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Handle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [sortedMetrics]);

  // Smooth scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: -200,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: 200,
      behavior: 'smooth'
    });
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  if (sortedMetrics.length === 0) {
    return (
      <div className={`metrics-tray-empty text-center py-8 ${className}`}>
        <div 
          className="text-sm"
          style={{
            color: 'var(--airy-text-secondary)',
            letterSpacing: '0.025em'
          }}
        >
          暂无统计数据
        </div>
      </div>
    );
  }

  return (
    <div className={`metrics-tray relative ${className}`}>
      {/* Enhanced Left scroll button with airy styling */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full airy-backdrop-blur flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 6px 20px rgba(148, 163, 184, 0.15), 0 2px 6px rgba(203, 213, 225, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.6)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path 
              d="M10 12L6 8L10 4" 
              stroke="var(--airy-text-primary)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Enhanced Right scroll button with airy styling */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 rounded-full airy-backdrop-blur flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 6px 20px rgba(148, 163, 184, 0.15), 0 2px 6px rgba(203, 213, 225, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.6)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path 
              d="M6 4L10 8L6 12" 
              stroke="var(--airy-text-primary)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Enhanced Scrollable container with airy aesthetics */}
      <div
        ref={scrollContainerRef}
        className="metrics-scroll-container flex gap-5 overflow-x-auto airy-hidden-scrollbar px-8 py-5"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {sortedMetrics.map((metric) => (
          <div
            key={metric.categoryId}
            style={{ scrollSnapAlign: 'start' }}
          >
            <MetricPillCard
              {...metric}
              onClick={() => handleCategorySelect(metric.categoryId)}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Gradient fade effects with airy colors */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, var(--airy-bg-primary) 0%, rgba(254, 254, 254, 0.8) 50%, transparent 100%)'
        }}
      />
      <div 
        className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(270deg, var(--airy-bg-primary) 0%, rgba(254, 254, 254, 0.8) 50%, transparent 100%)'
        }}
      />
    </div>
  );
};

