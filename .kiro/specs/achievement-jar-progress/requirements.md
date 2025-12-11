# Requirements Document

## Introduction

This specification defines the redesign of the "当前进度" (Current Progress) page in LifeOS with an Airy Macaron visual style, featuring a 3D achievement jar filled with clay balls representing completed time across different categories. The design emphasizes healing aesthetics, soft visual experiences, and gamified progress visualization.

## Glossary

- **Achievement_Jar**: A central 3D frosted glass container that visually represents accumulated progress through colored clay balls
- **Clay_Ball**: A 3D rendered sphere representing completed time in a specific category, with physics-based stacking behavior
- **Metrics_Tray**: A horizontal scrollable row of pill-shaped cards displaying category statistics below the jar
- **Interaction_Dock**: Three arcade-style buttons at the bottom that trigger celebratory effects and add special reward balls to the jar
- **Airy_Macaron_Style**: A design aesthetic featuring low saturation, high brightness colors with 3D clay textures and frosted glass effects
- **Danmaku**: Full-screen floating text animations triggered by interaction buttons
- **Confetti_Effect**: Animated colorful particles that fall from the top of the screen during celebrations

## Requirements

### Requirement 1

**User Story:** As a user, I want to see my progress visualized as a beautiful 3D jar filled with colored balls, so that I feel motivated and can easily understand my time allocation across different categories.

#### Acceptance Criteria

1. WHEN the user opens the current progress page, THE Achievement_Jar SHALL display as a large frosted glass container in the center of the screen
2. WHEN progress data exists for categories, THE Achievement_Jar SHALL contain 3D Clay_Balls in different colors representing each category's completed time
3. WHEN Clay_Balls are displayed in the jar, THE system SHALL simulate physics-based stacking and collision effects between balls
4. WHEN the user has work or study time logged, THE system SHALL display blue and pink Clay_Balls respectively with larger visual prominence
5. WHEN special achievements are earned, THE system SHALL display golden star-shaped reward balls in the jar

### Requirement 2

**User Story:** As a user, I want to see detailed statistics about my progress in an elegant format, so that I can quickly understand my time distribution without overwhelming visual complexity.

#### Acceptance Criteria

1. WHEN progress statistics are available, THE Metrics_Tray SHALL display horizontally scrollable pill-shaped cards below the Achievement_Jar
2. WHEN displaying category metrics, THE system SHALL show a 3D icon, category name, and time duration for each category
3. WHEN rendering metric cards, THE system SHALL use corresponding macaron colors with no borders and full rounded corners
4. WHEN multiple categories exist, THE system SHALL arrange them in a scrollable horizontal layout with subtle shadows
5. WHEN no data exists for a time period, THE system SHALL display an appropriate empty state message

### Requirement 3

**User Story:** As a user, I want to celebrate my achievements through interactive elements, so that I feel encouraged and motivated to continue my progress.

#### Acceptance Criteria

1. WHEN the user wants to celebrate, THE Interaction_Dock SHALL provide three circular arcade-style buttons at the bottom of the screen
2. WHEN the user taps the drum button, THE system SHALL play a drum sound effect and trigger purple-themed visual celebrations
3. WHEN the user taps the clap button, THE system SHALL play a clapping sound effect and trigger red-themed visual celebrations
4. WHEN the user taps the cheer button, THE system SHALL play a cheering sound effect and trigger orange-themed visual celebrations
5. WHEN any celebration button is pressed, THE system SHALL display full-screen Danmaku effects and falling Confetti_Effect animations

### Requirement 4

**User Story:** As a user, I want the interface to have a healing and soft visual experience, so that using the app feels calming and pleasant rather than stressful or overwhelming.

#### Acceptance Criteria

1. WHEN rendering the interface, THE system SHALL use Airy_Macaron_Style with low saturation and high brightness colors
2. WHEN displaying backgrounds, THE system SHALL use extremely light gradient colors or pure white backgrounds
3. WHEN rendering 3D elements, THE system SHALL combine clay textures with frosted glass effects for a soft, tactile appearance
4. WHEN showing interactive elements, THE system SHALL provide smooth scale animations and gentle visual feedback
5. WHEN the user interacts with buttons, THE system SHALL display obvious press-and-release bounce animations

### Requirement 5

**User Story:** As a user, I want the progress visualization to work smoothly on mobile devices, so that I can check my achievements anywhere with optimal performance.

#### Acceptance Criteria

1. WHEN the interface is displayed on mobile devices, THE system SHALL maintain responsive design with proper touch targets
2. WHEN physics effects cannot be rendered smoothly, THE system SHALL fall back to CSS animations that simulate ball dropping and stacking
3. WHEN the user interacts with touch gestures, THE system SHALL provide appropriate haptic feedback where supported
4. WHEN rendering on lower-performance devices, THE system SHALL optimize animations to maintain 60fps performance
5. WHEN the screen size changes, THE system SHALL adapt the jar size and layout proportionally while maintaining visual hierarchy