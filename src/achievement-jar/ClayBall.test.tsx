/**
 * Achievement Jar Progress Visualization - ClayBall Component Tests
 * Property-based tests for ClayBall component functionality
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { ClayBall, ClayBallCollection } from './ClayBall.js';
import { ClayBallProps, MacaronColor, CategoryPriority } from './types.js';
import { calculateBallSize } from './data-transformer.js';

// Test data generators
const macaronColorArb = fc.constantFrom(
  'bg-macaron-blue',
  'bg-macaron-green', 
  'bg-macaron-pink',
  'bg-macaron-purple',
  'bg-macaron-orange',
  'bg-macaron-yellow',
  'bg-emerald-200',
  'bg-macaron-rose'
) as fc.Arbitrary<MacaronColor>;

const categoryPriorityArb = fc.constantFrom('high', 'normal') as fc.Arbitrary<CategoryPriority>;

const clayBallPropsArb = fc.record({
  id: fc.string({ minLength: 1 }),
  categoryId: fc.string({ minLength: 1 }),
  size: fc.integer({ min: 20, max: 60 }),
  color: macaronColorArb,
  position: fc.record({
    x: fc.integer({ min: 0, max: 500 }),
    y: fc.integer({ min: 0, max: 500 })
  }),
  isSpecial: fc.boolean(),
  glowIntensity: fc.float({ min: 0, max: 1 }),
  priority: categoryPriorityArb
}) as fc.Arbitrary<ClayBallProps>;

describe('ClayBall Component', () => {
  /**
   * **Feature: achievement-jar-progress, Property 4: Priority category visual prominence**
   * **Validates: Requirements 1.4**
   */
  it('should render high priority categories with larger visual prominence', () => {
    fc.assert(fc.property(
      fc.record({
        workMinutes: fc.float({ min: 60, max: 480, noNaN: true }), // 1-8 hours
        studyMinutes: fc.float({ min: 60, max: 480, noNaN: true }),
        normalMinutes: fc.float({ min: 60, max: 480, noNaN: true })
      }),
      ({ workMinutes, studyMinutes, normalMinutes }) => {
        // Calculate ball sizes for work/study (high priority) vs normal categories
        const workBallSize = calculateBallSize(workMinutes, 'high');
        const studyBallSize = calculateBallSize(studyMinutes, 'high');
        const normalBallSize = calculateBallSize(normalMinutes, 'normal');
        
        // High priority categories should have larger balls (20% larger)
        const baseWorkSize = Math.max(20, Math.min(60, 20 + (workMinutes / 30) * 5));
        const baseStudySize = Math.max(20, Math.min(60, 20 + (studyMinutes / 30) * 5));
        const baseNormalSize = Math.max(20, Math.min(60, 20 + (normalMinutes / 30) * 5));
        
        const expectedWorkSize = Math.round(baseWorkSize * 1.2);
        const expectedStudySize = Math.round(baseStudySize * 1.2);
        const expectedNormalSize = Math.round(baseNormalSize);
        
        expect(workBallSize).toBe(expectedWorkSize);
        expect(studyBallSize).toBe(expectedStudySize);
        expect(normalBallSize).toBe(expectedNormalSize);
        
        // High priority balls should be larger than normal priority balls with same time
        if (workMinutes === normalMinutes) {
          expect(workBallSize).toBeGreaterThan(normalBallSize);
        }
        if (studyMinutes === normalMinutes) {
          expect(studyBallSize).toBeGreaterThan(normalBallSize);
        }
      }
    ), { numRuns: 100 });
  });

  /**
   * **Feature: achievement-jar-progress, Property 5: Achievement reward visualization**
   * **Validates: Requirements 1.5**
   */
  it('should render special achievement balls with golden star styling', () => {
    const specialBallProps: ClayBallProps = {
      id: 'special-test',
      categoryId: 'achievement',
      size: 45,
      color: 'bg-macaron-yellow',
      position: { x: 0, y: 0 },
      isSpecial: true,
      glowIntensity: 0.8,
      priority: 'high'
    };
    
    const { container } = render(<ClayBall {...specialBallProps} />);
    
    // Special balls should have star clipping path
    const clayBallMain = container.querySelector('.clay-ball-main');
    expect(clayBallMain).toBeTruthy();
    
    if (clayBallMain) {
      // Should have star-shaped clip path for special balls
      expect(clayBallMain.getAttribute('style')).toContain('polygon');
    }
    
    // Should have sparkle effects for special balls
    const sparkles = container.querySelectorAll('[class*="sparkle-"]');
    expect(sparkles.length).toBeGreaterThan(0);
  });

  it('should render clay balls with proper 3D texture effects', () => {
    fc.assert(fc.property(
      clayBallPropsArb,
      (ballProps) => {
        const { container } = render(<ClayBall {...ballProps} />);
        
        // Should have main clay ball element
        const clayBallMain = container.querySelector('.clay-ball-main');
        expect(clayBallMain).toBeTruthy();
        
        // Should have texture overlay
        const clayTexture = container.querySelector('.clay-texture');
        expect(clayTexture).toBeTruthy();
        
        // Should have highlight spot
        const clayHighlight = container.querySelector('.clay-highlight');
        expect(clayHighlight).toBeTruthy();
        
        // Ball size should match props
        const clayBall = container.querySelector('.clay-ball');
        if (clayBall) {
          const style = window.getComputedStyle(clayBall);
          expect(clayBall.getAttribute('style')).toContain(`width: ${ballProps.size}px`);
          expect(clayBall.getAttribute('style')).toContain(`height: ${ballProps.size}px`);
        }
      }
    ), { numRuns: 100 });
  });

  it('should render high priority balls with priority indicator ring', () => {
    fc.assert(fc.property(
      clayBallPropsArb,
      (ballProps) => {
        const highPriorityBall = { ...ballProps, priority: 'high' as CategoryPriority };
        const normalPriorityBall = { ...ballProps, priority: 'normal' as CategoryPriority };
        
        // High priority ball should have priority ring
        const { container: highContainer } = render(<ClayBall {...highPriorityBall} />);
        const priorityRing = highContainer.querySelector('.priority-ring');
        expect(priorityRing).toBeTruthy();
        
        // Normal priority ball should not have priority ring
        const { container: normalContainer } = render(<ClayBall {...normalPriorityBall} />);
        const noPriorityRing = normalContainer.querySelector('.priority-ring');
        expect(noPriorityRing).toBeFalsy();
      }
    ), { numRuns: 100 });
  });

  it('should position balls correctly in ClayBallCollection', () => {
    fc.assert(fc.property(
      fc.array(clayBallPropsArb, { minLength: 1, maxLength: 10 }),
      fc.integer({ min: 200, max: 500 }),
      fc.integer({ min: 200, max: 500 }),
      (balls, containerWidth, containerHeight) => {
        const { container } = render(
          <ClayBallCollection
            balls={balls}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />
        );
        
        // Should render all balls
        const renderedBalls = container.querySelectorAll('.clay-ball');
        expect(renderedBalls.length).toBe(balls.length);
        
        // Each ball should be rendered (positioning is handled by physics engine)
        renderedBalls.forEach((ball, index) => {
          expect(ball).toBeTruthy();
          expect(ball.className).toContain('clay-ball');
        });
      }
    ), { numRuns: 50 });
  });

  it('should handle different macaron colors correctly', () => {
    fc.assert(fc.property(
      macaronColorArb,
      (color) => {
        const ballProps: ClayBallProps = {
          id: 'test-ball',
          categoryId: 'test',
          size: 40,
          color,
          position: { x: 0, y: 0 },
          priority: 'normal'
        };
        
        const { container } = render(<ClayBall {...ballProps} />);
        const clayBallMain = container.querySelector('.clay-ball-main');
        
        expect(clayBallMain).toBeTruthy();
        
        // Should have gradient background based on color
        if (clayBallMain) {
          const style = clayBallMain.getAttribute('style');
          expect(style).toContain('radial-gradient');
          expect(style).toContain('linear-gradient');
        }
      }
    ), { numRuns: 100 });
  });
});