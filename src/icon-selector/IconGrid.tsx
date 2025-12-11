/**
 * IconGrid Component - Displays a grid of selectable icons
 * Features:
 * - Responsive grid layout
 * - Glass morphism icons
 * - Category-based filtering
 * - Keyboard navigation
 */

import React, { useState, useEffect, useRef } from 'react';
import { GlassIcon } from './GlassIcon.js';
import { AVAILABLE_ICONS } from '../types/icon-types.js';

interface IconGridProps {
  selectedIcon: string;
  categoryId: string;
  onIconSelect: (icon: string) => void;
  className?: string;
  maxHeight?: string;
}

export const IconGrid: React.FC<IconGridProps> = ({
  selectedIcon,
  categoryId,
  onIconSelect,
  className = '',
  maxHeight = '300px'
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter icons based on category (future enhancement)
  const displayIcons = AVAILABLE_ICONS;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gridRef.current?.contains(document.activeElement)) return;

      const cols = 6; // Grid columns
      const totalIcons = displayIcons.length;
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, totalIcons - 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + cols, totalIcons - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - cols, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < totalIcons) {
            onIconSelect(displayIcons[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, displayIcons, onIconSelect]);

  // Focus the selected icon when focused index changes
  useEffect(() => {
    if (focusedIndex >= 0 && iconRefs.current[focusedIndex]) {
      iconRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleIconClick = (icon: string, index: number) => {
    setFocusedIndex(index);
    onIconSelect(icon);
  };

  return (
    <div
      ref={gridRef}
      className={`
        grid grid-cols-6 gap-3 p-4
        overflow-y-auto
        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
        ${className}
      `}
      style={{ maxHeight }}
      role="grid"
      aria-label="图标选择网格"
    >
      {displayIcons.map((icon, index) => (
        <div
          key={`${icon}-${index}`}
          ref={el => iconRefs.current[index] = el}
          className="flex justify-center"
          role="gridcell"
          tabIndex={focusedIndex === index ? 0 : -1}
        >
          <GlassIcon
            icon={icon}
            categoryColor={categoryId}
            size="medium"
            isSelected={selectedIcon === icon}
            onClick={() => handleIconClick(icon, index)}
            className={`
              transition-all duration-200
              ${focusedIndex === index ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
            `}
          />
        </div>
      ))}
    </div>
  );
};

export default IconGrid;