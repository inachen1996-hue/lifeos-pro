/**
 * IconSelector Component - Main icon selection interface
 * Features:
 * - Smart matching integration
 * - Manual icon selection
 * - Glass morphism design
 * - Responsive layout
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GlassIcon } from './GlassIcon.js';
import { IconGrid } from './IconGrid.js';
import { SmartMatcher } from './SmartMatcher.js';
import type { IconSelectorProps, IconSelectionState } from '../types/icon-types.js';

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  categoryId,
  onIconChange,
  onSmartMatch,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionState, setSelectionState] = useState<IconSelectionState>({
    selectedIcon,
    isSmartMatchEnabled: true,
    userHasManuallySelected: false,
    lastSmartMatchInput: '',
    availableIcons: []
  });

  // Update selection state when props change
  useEffect(() => {
    setSelectionState(prev => ({
      ...prev,
      selectedIcon
    }));
  }, [selectedIcon]);

  /**
   * Handle smart matching from external input
   */
  const handleSmartMatch = useCallback((input: string) => {
    // Don't match if user has manually selected an icon
    if (selectionState.userHasManuallySelected) {
      return;
    }

    // Don't match if smart matching is disabled
    if (!selectionState.isSmartMatchEnabled) {
      return;
    }

    // Don't match if input is the same as last match
    if (input === selectionState.lastSmartMatchInput) {
      return;
    }

    const matchedIcon = SmartMatcher.matchIcon(input);
    
    if (matchedIcon && matchedIcon !== selectedIcon) {
      setSelectionState(prev => ({
        ...prev,
        selectedIcon: matchedIcon,
        lastSmartMatchInput: input
      }));
      
      onIconChange(matchedIcon);
      
      if (onSmartMatch) {
        onSmartMatch(matchedIcon);
      }
    } else {
      setSelectionState(prev => ({
        ...prev,
        lastSmartMatchInput: input
      }));
    }
  }, [selectedIcon, selectionState.userHasManuallySelected, selectionState.isSmartMatchEnabled, onIconChange, onSmartMatch]);

  /**
   * Handle manual icon selection
   */
  const handleManualSelection = (icon: string) => {
    setSelectionState(prev => ({
      ...prev,
      selectedIcon: icon,
      userHasManuallySelected: true,
      isSmartMatchEnabled: false // Disable smart matching after manual selection
    }));
    
    onIconChange(icon);
    setIsOpen(false);
  };

  /**
   * Reset smart matching (called when input is cleared)
   */
  const resetSmartMatch = () => {
    setSelectionState(prev => ({
      ...prev,
      isSmartMatchEnabled: true,
      userHasManuallySelected: false,
      lastSmartMatchInput: ''
    }));
  };

  /**
   * Toggle icon selector dropdown
   */
  const toggleSelector = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Expose smart match function to parent
  useEffect(() => {
    // Store the smart match function on the component instance
    // This allows parent components to trigger smart matching
    (IconSelector as any).triggerSmartMatch = handleSmartMatch;
    (IconSelector as any).resetSmartMatch = resetSmartMatch;
  }, [handleSmartMatch]);

  return (
    <div className="relative">
      {/* Current Icon Display */}
      <div className="mb-3">
        <label className="text-sm font-black text-[#023E8A] mb-3 block drop-shadow-sm">
          图标
          {selectionState.userHasManuallySelected && (
            <span className="ml-2 text-xs text-gray-500">(手动选择)</span>
          )}
          {!selectionState.userHasManuallySelected && selectionState.lastSmartMatchInput && (
            <span className="ml-2 text-xs text-green-600">(智能匹配)</span>
          )}
        </label>
        
        <div 
          className={`
            flex items-center justify-center
            w-full p-4 rounded-[20px] 
            bg-white/90 
            cursor-pointer
            transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/95'}
            ${isOpen ? 'ring-4 ring-[#A2D2FF]/50' : ''}
          `}
          style={{
            boxShadow: '0 4px 12px -2px rgba(162, 210, 255, 0.2), inset 0 1px 4px rgba(255, 255, 255, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.9)'
          }}
          onClick={toggleSelector}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              toggleSelector();
            }
          }}
        >
          <GlassIcon
            icon={selectedIcon}
            categoryColor={categoryId}
            size="large"
            className="pointer-events-none"
          />
        </div>
        
        {/* Helper Text */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {disabled ? '已禁用' : '点击选择图标'}
        </div>
      </div>

      {/* Icon Grid Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          <div 
            className="bg-white/95 backdrop-blur-lg rounded-[24px] shadow-2xl border border-white/90 overflow-hidden"
            style={{
              boxShadow: '0 12px 32px -4px rgba(162, 210, 255, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100/50">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-[#023E8A] text-lg">选择图标</h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Smart Match Status */}
              {selectionState.lastSmartMatchInput && (
                <div className="mt-2 text-xs text-green-600">
                  智能匹配: "{selectionState.lastSmartMatchInput}"
                </div>
              )}
            </div>

            {/* Icon Grid */}
            <IconGrid
              selectedIcon={selectedIcon}
              categoryId={categoryId}
              onIconSelect={handleManualSelection}
              maxHeight="240px"
            />

            {/* Footer */}
            <div className="p-3 border-t border-gray-100/50 text-center">
              <div className="text-xs text-gray-500">
                使用方向键导航，回车选择
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Static methods for external control
(IconSelector as any).triggerSmartMatch = (input: string) => {
  console.warn('IconSelector.triggerSmartMatch called before component mount');
};

(IconSelector as any).resetSmartMatch = () => {
  console.warn('IconSelector.resetSmartMatch called before component mount');
};

export default IconSelector;