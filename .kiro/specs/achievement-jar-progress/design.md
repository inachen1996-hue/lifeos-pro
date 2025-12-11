# Achievement Jar Progress Visualization Design Document

## Overview

The Achievement Jar Progress Visualization redesigns the existing "当前进度" (Current Progress) page with a healing, gamified interface featuring a 3D frosted glass jar filled with physics-based clay balls. This design transforms mundane progress tracking into an engaging, visually appealing experience that motivates users through beautiful aesthetics and interactive celebrations.

The system builds upon the existing progress data infrastructure while introducing a completely new visual paradigm focused on the Airy Macaron design language - characterized by soft textures, low saturation colors, and tactile 3D elements that evoke feelings of calm and accomplishment.

## Architecture

### Component Hierarchy
```
AchievementJarProgressPage
├── TimeRangeSelector (existing, styled)
├── AchievementJarContainer
│   ├── FrostedGlassJar (3D CSS/Canvas)
│   ├── PhysicsEngine (Matter.js or CSS fallback)
│   └── ClayBallCollection
│       ├── CategoryBall (work, study, etc.)
│       ├── RewardBall (achievements)
│       └── SpecialEffectBall (celebrations)
├── MetricsTray
│   ├── ScrollableContainer
│   └── MetricPillCard[]
└── InteractionDock
    ├── DrumButton (purple theme)
    ├── ClapButton (red theme)
    ├── CheerButton (orange theme)
    └── CelebrationEffects
        ├── DanmakuSystem
        └── ConfettiRenderer
```

### Data Flow Architecture
```
ExistingProgressData → DataTransformer → VisualElements
                                      ↓
PhysicsEngine ← ClayBallGenerator ← CategoryStats
     ↓
RenderEngine → 3DJarVisualization
```

## Components and Interfaces

### AchievementJarContainer
**Purpose**: Central container managing the 3D jar visualization and physics simulation

**Props**:
```typescript
interface AchievementJarProps {
  categoryStats: CategoryTimeStats[];
  totalTime: number;
  timeRange: 'today' | 'weekly' | 'monthly';
  onBallClick?: (categoryId: string) => void;
}
```

**Key Features**:
- Responsive jar sizing (60% viewport width on mobile, 40% on desktop)
- Frosted glass effect using CSS backdrop-filter and gradients
- Physics-based ball stacking with collision detection
- Smooth animations for ball additions/removals

### ClayBall Component
**Purpose**: Individual 3D spheres representing time categories

**Props**:
```typescript
interface ClayBallProps {
  categoryId: string;
  size: number; // Based on time duration
  color: MacaronColor;
  position: { x: number; y: number };
  isSpecial?: boolean; // For reward balls
  glowIntensity?: number;
}
```

**Visual Properties**:
- Diameter: 20-60px based on time duration
- Clay texture using CSS gradients and shadows
- Subtle bounce animation on creation
- Glow effect for special achievements

### MetricsTray Component
**Purpose**: Horizontal scrollable display of category statistics

**Props**:
```typescript
interface MetricsTrayProps {
  metrics: CategoryMetric[];
  onCategorySelect?: (categoryId: string) => void;
}

interface CategoryMetric {
  categoryId: string;
  name: string;
  icon: string;
  duration: number;
  color: MacaronColor;
  percentage: number;
}
```

**Design Specifications**:
- Pill height: 64px
- Horizontal padding: 16px
- Scroll snap for smooth navigation
- Macaron color backgrounds with 0.7 opacity

### InteractionDock Component
**Purpose**: Celebration buttons with arcade-style feedback

**Props**:
```typescript
interface InteractionDockProps {
  onCelebration: (type: 'drum' | 'clap' | 'cheer') => void;
  disabled?: boolean;
}
```

**Button Specifications**:
- Diameter: 72px on mobile, 80px on desktop
- Gradient backgrounds with theme colors
- Scale animation: 0.95 on press, 1.05 on release
- Haptic feedback on supported devices

## Data Models

### CategoryTimeStats
```typescript
interface CategoryTimeStats {
  categoryId: string;
  name: string;
  totalMinutes: number;
  color: MacaronColor;
  icon: string;
  ballCount: number; // Calculated based on time
  priority: 'high' | 'normal'; // Work/Study get high priority
}
```

### PhysicsBody
```typescript
interface PhysicsBody {
  id: string;
  x: number;
  y: number;
  radius: number;
  mass: number;
  velocity: { x: number; y: number };
  categoryId: string;
  isStatic: boolean;
}
```

### CelebrationEffect
```typescript
interface CelebrationEffect {
  type: 'danmaku' | 'confetti' | 'special-ball';
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  colors: string[];
  position?: { x: number; y: number };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- **Celebration button properties (3.2, 3.3, 3.4)** can be combined into a single comprehensive property that tests all three button types
- **Visual styling properties (4.1, 4.2, 4.3)** can be consolidated into a comprehensive style consistency property
- **Animation properties (4.4, 4.5)** can be combined into a single interaction feedback property

### Core Properties

**Property 1: Achievement jar visual presence**
*For any* progress page load, the achievement jar should be rendered as a centered frosted glass container with appropriate CSS styling
**Validates: Requirements 1.1**

**Property 2: Category data visualization accuracy**
*For any* set of category progress data, the jar should contain the correct number of clay balls with colors matching their respective categories
**Validates: Requirements 1.2**

**Property 3: Physics simulation stability**
*For any* collection of clay balls in the jar, the physics system should position balls without inappropriate overlapping and in stable configurations
**Validates: Requirements 1.3**

**Property 4: Priority category visual prominence**
*For any* progress data containing work or study categories, those categories should render with blue/pink colors respectively and larger visual sizes than other categories
**Validates: Requirements 1.4**

**Property 5: Achievement reward visualization**
*For any* special achievement conditions, the system should render golden star-shaped reward balls in the jar
**Validates: Requirements 1.5**

**Property 6: Metrics tray layout consistency**
*For any* available progress statistics, the metrics tray should display as a horizontally scrollable container with pill-shaped cards positioned below the jar
**Validates: Requirements 2.1**

**Property 7: Metric card data completeness**
*For any* category metric, the rendered card should contain a 3D icon, category name, and time duration
**Validates: Requirements 2.2**

**Property 8: Metric card visual styling**
*For any* metric card, the element should have macaron colors, no borders, full rounded corners, and subtle shadows when multiple cards exist
**Validates: Requirements 2.3, 2.4**

**Property 9: Celebration button interaction consistency**
*For any* celebration button (drum, clap, cheer), clicking should trigger the corresponding sound effect and themed visual celebrations
**Validates: Requirements 3.2, 3.3, 3.4**

**Property 10: Universal celebration effects**
*For any* celebration button press, the system should display full-screen danmaku effects and falling confetti animations
**Validates: Requirements 3.5**

**Property 11: Airy macaron style consistency**
*For any* interface element, colors should meet low saturation and high brightness criteria, backgrounds should be extremely light, and 3D elements should combine clay textures with frosted glass effects
**Validates: Requirements 4.1, 4.2, 4.3**

**Property 12: Interactive feedback consistency**
*For any* interactive element, the system should provide smooth scale animations and bounce effects during user interactions
**Validates: Requirements 4.4, 4.5**

**Property 13: Mobile responsiveness**
*For any* mobile viewport, interface elements should maintain proper touch target sizes and responsive layout proportions
**Validates: Requirements 5.1**

**Property 14: Performance graceful degradation**
*For any* performance constraints, the system should fall back to CSS animations when physics effects cannot render smoothly
**Validates: Requirements 5.2**

**Property 15: Haptic feedback integration**
*For any* touch interaction on supported devices, the system should trigger appropriate haptic feedback
**Validates: Requirements 5.3**

**Property 16: Responsive layout adaptation**
*For any* screen size change, the jar size and layout should adapt proportionally while maintaining visual hierarchy
**Validates: Requirements 5.5**

<function_calls>
<invoke name="prework">
<parameter name="featureName">achievement-jar-progress

## Error Handling

### Physics Engine Fallbacks
- **Matter.js Load Failure**: Gracefully degrade to CSS-based animations
- **Performance Issues**: Automatically reduce ball count and disable complex effects
- **Memory Constraints**: Implement object pooling for clay balls and effects

### Data Handling
- **Empty Progress Data**: Display motivational empty state with sample jar
- **Invalid Category Data**: Use default colors and generic icons
- **Missing Audio Files**: Silent fallback with visual-only celebrations

### Browser Compatibility
- **No backdrop-filter Support**: Use gradient overlays for frosted glass effect
- **No Web Audio API**: Use HTML5 audio elements for sound effects
- **Limited CSS 3D**: Flatten to 2D with enhanced shadows and gradients

## Testing Strategy

### Dual Testing Approach
The testing strategy combines unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing Focus**:
- Specific edge cases (empty data, single category, maximum categories)
- Integration points between physics engine and rendering
- Error handling scenarios and fallback behaviors
- Browser compatibility edge cases

**Property-Based Testing Focus**:
- Universal properties that should hold across all inputs using **fast-check** library
- Each property-based test configured to run minimum 100 iterations
- Tests tagged with explicit references to design document properties

**Property-Based Testing Requirements**:
- Library: **fast-check** for JavaScript/TypeScript property-based testing
- Minimum iterations: 100 per property test
- Each test tagged with format: **Feature: achievement-jar-progress, Property {number}: {property_text}**
- Each correctness property implemented by a single property-based test

### Testing Implementation Guidelines
- Unit tests catch concrete bugs and verify specific examples
- Property tests verify general correctness across random inputs
- Together they provide comprehensive coverage of both specific and general behaviors
- Property tests focus on universal rules while unit tests handle edge cases

### Performance Testing
- Frame rate monitoring during physics simulations
- Memory usage tracking for ball collections
- Load testing with maximum category counts
- Mobile device performance validation

### Visual Regression Testing
- Screenshot comparison for jar rendering
- Animation sequence validation
- Color accuracy verification
- Responsive layout testing across viewports

## Implementation Notes

### Technology Stack Integration
- **React**: Component-based architecture with hooks for state management
- **Framer Motion**: Smooth animations and gesture handling
- **Matter.js**: Physics simulation with CSS fallback
- **Tailwind CSS**: Utility-first styling with custom macaron color extensions
- **Web Audio API**: High-quality sound generation with HTML5 audio fallback

### Performance Optimizations
- **Virtualization**: Only render visible balls in large datasets
- **RAF Throttling**: Limit physics updates to 60fps
- **CSS Transforms**: Use GPU acceleration for animations
- **Lazy Loading**: Load celebration effects on first interaction

### Accessibility Considerations
- **Screen Readers**: Provide text descriptions of visual progress
- **Reduced Motion**: Respect prefers-reduced-motion settings
- **High Contrast**: Ensure sufficient color contrast in all themes
- **Keyboard Navigation**: Full keyboard support for all interactions

### Integration with Existing System
- **Data Source**: Leverage existing `fullHistory` and `calculateStatsFromLogs` functions
- **Color System**: Extend existing macaron color utilities
- **Audio System**: Build upon current custom sound effect infrastructure
- **Navigation**: Integrate seamlessly with existing review page tab system