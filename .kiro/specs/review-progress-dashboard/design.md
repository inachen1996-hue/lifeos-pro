# Design Document

## Overview

The Review Progress Dashboard is a comprehensive analytics and motivation system within the LifeOS timer application. It transforms raw time tracking data into meaningful insights through visual statistics, category breakdowns, and gamified audio feedback. The system is designed to enhance user engagement and provide actionable productivity insights while maintaining the application's signature macaron aesthetic.

## Architecture

The Review Progress Dashboard follows a component-based architecture integrated into the main React application:

```
Review Progress Dashboard
├── Data Layer
│   ├── History Parser (fullHistory processing)
│   ├── Statistics Calculator (time aggregation)
│   └── Date Range Manager (scope filtering)
├── Presentation Layer
│   ├── Progress Statistics Display
│   ├── Category Breakdown Cards
│   ├── Completed Items List
│   └── Audio Feedback Controls
├── Audio System
│   ├── Web Audio API Engine (built-in sounds)
│   ├── Custom Audio Manager (user uploads)
│   └── Audio Storage Service (localStorage)
└── UI Enhancement Layer
    ├── Danmaku Animation System
    ├── Responsive Layout Manager
    └── Visual Feedback Controller
```

## Components and Interfaces

### Core Components

#### 1. ProgressDashboard
**Purpose**: Main container component that orchestrates all dashboard functionality
**Props**: 
- `progressScope`: Time range selection ('today', 'weekly', 'monthly')
- `fullHistory`: Complete timer history data
- `onScopeChange`: Callback for time range changes

**State Management**:
- `danmakus`: Array of floating celebration messages
- `customSounds`: User-uploaded audio files
- `isLoading`: Loading state for data processing

#### 2. StatisticsDisplay
**Purpose**: Shows total accumulated time and key metrics
**Features**:
- Large gradient display for total hours
- Precision to one decimal place
- Blue-purple gradient styling
- Responsive text sizing

#### 3. CategoryBreakdown
**Purpose**: Visual breakdown of time allocation by category
**Features**:
- Priority display for work/study categories (larger cards)
- 2-column responsive grid layout
- Macaron color scheme integration
- Zero-time category filtering

#### 4. CompletedItemsList
**Purpose**: Detailed list of finished timer sessions
**Features**:
- Scrollable container (max-height: 96)
- Item metadata: description, date, duration, category
- Chronological sorting (newest first)
- Empty state handling

#### 5. AudioFeedbackSystem
**Purpose**: Motivational sound effects with customization
**Components**:
- Three gradient buttons (celebration, applause, drumbeat)
- Custom audio upload interface
- Built-in Web Audio API sound generation
- Storage management for custom files

### Data Interfaces

#### ProgressData
```typescript
interface ProgressData {
  totalHours: number;
  categoryStats: Record<string, number>;
  completedItems: CompletedItem[];
  dateRange: {
    start: Date;
    end: Date;
  };
}
```

#### CompletedItem
```typescript
interface CompletedItem {
  id: number;
  date: string;
  category: string;
  duration: number;
  description: string;
}
```

#### CustomAudioConfig
```typescript
interface CustomAudioConfig {
  cheer?: string; // Base64 encoded audio
  clap?: string;  // Base64 encoded audio
  drum?: string;  // Base64 encoded audio
}
```

## Data Models

### History Processing Pipeline

1. **Raw History Parsing**
   - Input: `fullHistory` string from localStorage
   - Process: Line-by-line parsing with regex extraction
   - Output: Structured array of timer sessions

2. **Date Range Filtering**
   - Input: Parsed sessions + scope selection
   - Process: Date comparison and filtering
   - Output: Sessions within selected time range

3. **Statistics Calculation**
   - Input: Filtered sessions
   - Process: Category aggregation and time summation
   - Output: `ProgressData` object

### Audio Data Management

1. **Built-in Audio Generation**
   - Web Audio API synthesis
   - Real-time sound generation
   - No storage requirements

2. **Custom Audio Storage**
   - Base64 encoding for localStorage compatibility
   - 5MB file size limit
   - Format validation (MP3, WAV, OGG, M4A)
   - Persistent storage with error handling

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework, I've identified several areas where properties can be consolidated to eliminate redundancy:

**Consolidation Opportunities:**
- Properties 2.2 and 2.4 (macaron colors and required information) can be combined into a comprehensive category card rendering property
- Properties 3.1 and 3.5 (item information and formatting) can be combined into a comprehensive item display property  
- Properties 5.3, 5.4, and 5.5 (custom audio storage, priority, and UI feedback) can be combined into a comprehensive custom audio management property
- Properties 6.1, 6.2, and 6.4 (reset behavior) can be combined into a comprehensive audio reset property
- Properties 7.1 and 7.2 (responsive layout) can be combined into a comprehensive responsive design property

**Unique Properties Retained:**
- Time calculation accuracy (1.2, 1.4)
- Formatting consistency (1.3)
- Audio system functionality (4.2, 5.1, 5.2)
- Data persistence (8.1, 8.2, 8.3)
- Error handling (6.5, 8.4, 8.5)

Property 1: Time calculation accuracy
*For any* timer history data and time scope selection, the calculated total time should equal the sum of all timer sessions within that scope's date range
**Validates: Requirements 1.2, 1.4**

Property 2: Time formatting consistency  
*For any* time value displayed in the dashboard, it should be formatted in hours with exactly one decimal place
**Validates: Requirements 1.3**

Property 3: Category filtering and prioritization
*For any* set of category statistics, categories with zero time should be excluded from display, and work/study categories should have larger visual emphasis than others
**Validates: Requirements 2.1, 2.3**

Property 4: Category card comprehensive display
*For any* displayed category card, it should use macaron color scheme and show both category name and accumulated duration
**Validates: Requirements 2.2, 2.4**

Property 5: Completed items comprehensive display
*For any* displayed completed item, it should show task description, date, duration, and category, with dates and times formatted in user-friendly format
**Validates: Requirements 3.1, 3.5**

Property 6: Completed items sorting consistency
*For any* list of completed items, they should be sorted by completion time in descending order (newest first)
**Validates: Requirements 3.4**

Property 7: Audio button interaction consistency
*For any* audio button click, the corresponding sound effect should play at exactly 50% volume
**Validates: Requirements 4.2**

Property 8: Custom audio file validation
*For any* file upload attempt, files in MP3, WAV, OGG, and M4A formats under 5MB should be accepted, while other formats or oversized files should be rejected with error messages
**Validates: Requirements 5.1, 5.2**

Property 9: Custom audio comprehensive management
*For any* successfully uploaded custom audio, it should be stored as Base64 in localStorage, prioritized over built-in sounds when playing, and show green checkmark visual feedback
**Validates: Requirements 5.3, 5.4, 5.5**

Property 10: Audio reset comprehensive behavior
*For any* custom audio reset action, the custom file should be removed from storage, built-in sounds should be used immediately, and button appearance should update to reflect default state
**Validates: Requirements 6.1, 6.2, 6.4**

Property 11: Storage error handling robustness
*For any* storage operation failure, the system should handle errors gracefully without crashing and provide appropriate user feedback
**Validates: Requirements 6.5, 8.4, 8.5**

Property 12: Responsive design comprehensive adaptation
*For any* screen size, the dashboard should maintain proper layout with appropriate card sizes, spacing, and touch interaction feedback
**Validates: Requirements 7.1, 7.2, 7.3, 7.5**

Property 13: Mobile audio integration
*For any* audio playback on mobile devices, the system should respect device audio settings and permissions
**Validates: Requirements 7.4**

Property 14: Data persistence reliability
*For any* custom audio upload, the data should be immediately persisted to localStorage and restored correctly on application reload
**Validates: Requirements 8.1, 8.2**

Property 15: Storage fallback behavior
*For any* localStorage unavailability scenario, the system should gracefully fallback to built-in audio only without errors
**Validates: Requirements 8.3**

## Error Handling

### Audio System Error Handling

1. **Web Audio API Failures**
   - Fallback to HTML5 Audio API
   - User notification for audio context issues
   - Graceful degradation when audio is unavailable

2. **Custom Audio Upload Errors**
   - File format validation with clear error messages
   - File size limit enforcement (5MB)
   - Base64 encoding error handling
   - Storage quota exceeded handling

3. **Storage System Errors**
   - localStorage unavailability detection
   - Data corruption recovery
   - Automatic fallback to default state
   - User notification for storage issues

### Data Processing Error Handling

1. **History Parsing Errors**
   - Malformed data detection and skipping
   - Partial data recovery when possible
   - Default empty state for invalid data
   - Logging for debugging purposes

2. **Date Range Calculation Errors**
   - Invalid date handling
   - Timezone consideration
   - Boundary condition handling
   - Default to current date on errors

## Testing Strategy

### Dual Testing Approach

The Review Progress Dashboard requires both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Testing Focus:**
- Specific UI component rendering
- Edge cases like empty states
- Error condition handling
- Integration between components
- Mobile-specific interactions

**Property-Based Testing Focus:**
- Time calculation accuracy across all possible inputs
- Data aggregation correctness
- Audio system behavior consistency
- Storage and retrieval reliability
- Responsive design adaptation

### Property-Based Testing Implementation

**Testing Library:** fast-check (JavaScript property-based testing library)
**Test Configuration:** Minimum 100 iterations per property test
**Property Test Tagging:** Each test must include comment with format: `**Feature: review-progress-dashboard, Property {number}: {property_text}**`

**Key Property Test Areas:**
1. **Time Calculation Properties** - Generate random timer sessions and verify aggregation accuracy
2. **Audio System Properties** - Test audio playback consistency and custom audio management
3. **Data Persistence Properties** - Verify storage and retrieval reliability
4. **UI Rendering Properties** - Test responsive behavior and visual consistency
5. **Error Handling Properties** - Verify graceful failure handling

### Unit Testing Implementation

**Testing Framework:** Jest with React Testing Library
**Coverage Areas:**
- Component mounting and unmounting
- User interaction flows
- Empty state displays
- Error boundary behavior
- Mobile touch interactions

**Integration Testing:**
- Full dashboard rendering with real data
- Audio system integration with UI
- Storage system integration
- Cross-component communication

### Testing Requirements

- Each correctness property must be implemented by a single property-based test
- Property-based tests must run a minimum of 100 iterations
- Each property-based test must be tagged with the exact format specified
- Unit tests should focus on specific examples and edge cases
- Both testing approaches are required and complementary
- Tests must validate real functionality without mocks for core logic