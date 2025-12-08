# LifeOS Timer Rework

This project implements a comprehensive timer management system for LifeOS Pro with three distinct timer modes (Stopwatch, Countdown, Pomodoro), intelligent data merge with priority-based conflict resolution, and enhanced data visualization.

## Project Structure

```
.
├── src/
│   ├── types.ts          # TypeScript interfaces for data models
│   ├── storage.ts        # localStorage operations and serialization
│   └── migration.ts      # Data migration from v2 to v3
├── tests/
│   ├── setup.ts          # Test setup with localStorage mock
│   ├── timer-serialization.test.ts  # Property tests for Timer serialization
│   └── event-serialization.test.ts  # Property tests for Event serialization
├── index.html            # Main application (React SPA)
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Vitest configuration
```

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

## Running Tests

### Run all tests once

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

## Data Models

### Timer
Represents a configured timer with mode (stopwatch, countdown, or pomodoro) and settings.

### TimerCategory
Groups timers into logical categories (8 default categories: Work, Study, Rest, Sleep, Life, Entertainment, Health, Hobby).

### Event
Represents a recorded time event with priority-based conflict resolution (manual > timer > calendar).

### BlankPeriod
Represents a detected gap in the schedule that needs to be filled.

### TimerSession
Tracks an active or completed timer session.

## Storage

All data is stored in localStorage with the following keys:

- `lifeos_pro_timers_v1` - Timer configurations
- `lifeos_pro_timer_categories_v1` - Timer categories
- `lifeos_pro_events_v3` - Event records (new format)
- `lifeos_pro_blank_periods_v1` - Blank periods
- `lifeos_pro_history_v2` - Old text-based format (for migration)

## Migration

The system includes automatic migration from the old text-based format (`lifeos_pro_history_v2`) to the new structured format (`lifeos_pro_events_v3`). Migration can be undone within 24 hours.

## Testing Strategy

The project uses property-based testing with fast-check to verify correctness properties:

- **Property 1**: Timer serialization round trip - All timer fields preserved after save/load
- **Property 2**: Event serialization round trip - All event fields preserved after save/load

Each property test runs 100 iterations with randomly generated data to ensure robustness.

## Implementation Status

### Task 1: Set up data models and storage infrastructure ✅
- [x] Create TypeScript interfaces
- [x] Set up localStorage keys and default values
- [x] Implement data migration
- [x] Property test for timer serialization (Task 1.1)
- [x] Property test for event serialization (Task 1.2)
