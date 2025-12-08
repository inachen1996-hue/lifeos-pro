# Design Document

## Overview

This design document outlines the architecture and implementation strategy for the LifeOS Pro Timer Rework. The system will be enhanced with a comprehensive timer management system featuring three distinct timer modes (Stopwatch, Countdown, Pomodoro), an intelligent data merge system with priority-based conflict resolution, and improved data visualization capabilities.

The design maintains the existing React-based single-page application architecture while introducing new state management patterns for timers, a sophisticated event conflict resolution engine, and enhanced UI components for timer management and data validation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Timer Tab   │  │  Data Tab    │  │  Review Tab  │     │
│  │              │  │              │  │              │     │
│  │ - Categories │  │ - Pending    │  │ - Ideal      │     │
│  │ - Timers     │  │ - View Data  │  │   Ratio      │     │
│  │ - Controls   │  │ - Upload     │  │ - TEP        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    State Management Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Timer State  │  │  Event State │  │ Category     │     │
│  │              │  │              │  │ State        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Timer Engine │  │ Conflict     │  │ Blank Period │     │
│  │              │  │ Resolver     │  │ Detector     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    Persistence Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              localStorage Manager                     │  │
│  │  - Timers  - Events  - Categories  - Settings       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

The application follows a component-based architecture:

1. **App Component**: Root component managing global state and navigation
2. **Timer Tab Components**: Category list, timer list, timer controls, timer creation/edit modals
3. **Data Tab Components**: Pending confirmation list, event list, date picker, calendar upload, event editor
4. **Review Tab Components**: Ideal ratio display, TEP display, comparison charts
5. **Shared Components**: Modal dialogs, toast notifications, confirmation prompts

## Components and Interfaces

### UI/UX Design

#### Page Structure

The application has 4 main pages accessible via bottom navigation:

1. **Timer Tab** - Timer management and controls
2. **Data Source Tab** - Event data management (3 sub-tabs)
3. **Diary Tab** - Personal diary entries (existing)
4. **Review Tab** - Analytics and insights (with Ideal Ratio moved here)

#### Timer Tab Layout

```
┌─────────────────────────────────────────┐
│  Timer Tab                         [+]  │ ← Header with "New Timer" button
├─────────────────────────────────────────┤
│                                         │
│  📁 Work (Category Group)          [▼]  │ ← Expandable category
│    ├─ 💼 Meeting Timer        [▶️]     │ ← Timer with play button
│    ├─ 📝 Deep Work            [▶️]     │
│    └─ [+ Add Timer]                    │
│                                         │
│  📁 Study                          [▼]  │
│    ├─ 📚 Reading               [▶️]     │
│    └─ [+ Add Timer]                    │
│                                         │
│  📁 Health                         [▼]  │
│    ├─ 🏃 Workout               [▶️]     │
│    └─ [+ Add Timer]                    │
│                                         │
│  [+ New Category Group]                │
│                                         │
└─────────────────────────────────────────┘
```

**Timer Tab Features:**
- Category groups are collapsible/expandable
- Each timer shows: icon, name, play button
- Long-press or click edit icon to modify timer
- "New Timer" button in header opens creation modal
- "New Category Group" at bottom creates custom categories

#### Timer Control Modal (When Timer is Running)

```
┌─────────────────────────────────────────┐
│  💼 Meeting Timer                  [✕]  │
├─────────────────────────────────────────┤
│                                         │
│         ⏱️  00:15:32                    │ ← Large time display
│                                         │
│  Mode: Stopwatch                        │
│  Category: Work                         │
│                                         │
│         [⏸️ Pause]  [⏹️ Stop]           │
│                                         │
└─────────────────────────────────────────┘

For Countdown:
┌─────────────────────────────────────────┐
│  ⏰ Focus Session                  [✕]  │
├─────────────────────────────────────────┤
│                                         │
│         ⏱️  24:45                       │ ← Countdown display
│         Remaining                       │
│                                         │
│  Mode: Countdown (30 min)               │
│  Category: Study                        │
│                                         │
│         [⏸️ Pause]  [⏹️ Stop]           │
│                                         │
└─────────────────────────────────────────┘

For Pomodoro:
┌─────────────────────────────────────────┐
│  🍅 Pomodoro Session               [✕]  │
├─────────────────────────────────────────┤
│                                         │
│         ⏱️  18:30                       │
│         Work Period                     │
│                                         │
│  Cycle: 2/4                             │ ← Cycle progress
│  Next: Rest (5 min)                     │
│                                         │
│         [⏸️ Pause]  [⏹️ Stop]           │
│                                         │
└─────────────────────────────────────────┘
```

#### Data Source Tab Layout

```
┌─────────────────────────────────────────┐
│  Data Source                            │
├─────────────────────────────────────────┤
│  [Pending] [View Data] [Upload]         │ ← 3 Sub-tabs
├─────────────────────────────────────────┤
│                                         │
│  (Content varies by selected tab)       │
│                                         │
└─────────────────────────────────────────┘
```

**Sub-tab 1: Pending Confirmation**

```
┌─────────────────────────────────────────┐
│  Pending Confirmation                   │
│  3 blank periods to review              │ ← Clear description
├─────────────────────────────────────────┤
│                                         │
│  📅 2025-12-07                          │
│  ⏰ 10:00 - 12:30 (2.5 hours)          │
│  💡 AI Suggestion: "休息"               │
│                                         │
│  Event Name: [_____________]            │
│  Category: [Work ▼]                     │
│  Time: [10:00] - [12:30]                │
│                                         │
│  [✓ Confirm] [✕ Dismiss] [🗑️ Delete]  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  📅 2025-12-07                          │
│  ⏰ 15:00 - 17:15 (2.25 hours)         │
│  ...                                    │
│                                         │
└─────────────────────────────────────────┘
```

**Sub-tab 2: View Existing Data**

```
┌─────────────────────────────────────────┐
│  📅 2025-12-07 (Today)        [📅]      │ ← Date header with picker
│  [🔍 Data Validation]                   │ ← Validation button
├─────────────────────────────────────────┤
│  [▼ Upload Calendar]                    │ ← Collapsed upload section
├─────────────────────────────────────────┤
│                                         │
│  08:00 - 09:00  💼 Morning Meeting      │
│  Category: Work  [✏️]                   │ ← Edit button
│                                         │
│  09:00 - 12:00  📝 Deep Work            │
│  Category: Work  [✏️]                   │
│                                         │
│  12:00 - 13:00  🍽️ Lunch               │
│  Category: Life  [✏️]                   │
│                                         │
│  13:00 - 15:00  📚 Study Session        │
│  Category: Study  [✏️]                  │
│                                         │
└─────────────────────────────────────────┘
```

**Upload Calendar (Expanded)**

```
┌─────────────────────────────────────────┐
│  [▲ Upload Calendar]                    │
├─────────────────────────────────────────┤
│                                         │
│  Paste calendar events (one per line):  │
│  Format: EventName｜Start｜End          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Meeting｜2025-12-07T10:00:00+08│   │
│  │ Lunch｜2025-12-07T12:00:00+08:0│   │
│  │ Study｜2025-12-07T14:00:00+08:0│   │
│  └─────────────────────────────────┘   │
│                                         │
│  [📤 Upload & Parse]                    │
│                                         │
└─────────────────────────────────────────┘
```

**Data Validation View**

```
┌─────────────────────────────────────────┐
│  Data Validation - 2025-12-07           │
│  [✓ Save All] [✕ Cancel]                │
├─────────────────────────────────────────┤
│                                         │
│  1. [08:00] - [09:00]                   │
│     Name: [Morning Meeting_____]        │
│     Category: [Work ▼]                  │
│     [🗑️]                                │
│                                         │
│  2. [09:00] - [12:00]                   │
│     Name: [Deep Work___________]        │
│     Category: [Work ▼]                  │
│     [🗑️]                                │
│                                         │
│  3. [12:00] - [13:00]                   │
│     Name: [Lunch_______________]        │
│     Category: [Life ▼]                  │
│     [🗑️]                                │
│                                         │
│  [+ Add Event]                          │
│                                         │
└─────────────────────────────────────────┘
```

#### Review Tab Layout (Updated)

```
┌─────────────────────────────────────────┐
│  Review                                 │
├─────────────────────────────────────────┤
│  [Ideal Ratio] [Today TEP] [Weekly]     │ ← Ideal Ratio moved here
├─────────────────────────────────────────┤
│                                         │
│  Ideal Time Allocation                  │
│                                         │
│  💼 Work:     8.0h  ████████░░  80%     │
│  📚 Study:    2.0h  ██░░░░░░░░  20%     │
│  ☕ Rest:     2.0h  ██░░░░░░░░  20%     │
│  😴 Sleep:    7.0h  ███████░░░  70%     │
│  🏠 Life:     2.5h  ██░░░░░░░░  25%     │
│  🎮 Entertainment: 2.5h  ██░░░░  25%     │
│  💪 Health:   1.0h  █░░░░░░░░░  10%     │
│  🎨 Hobby:    0.0h  ░░░░░░░░░░   0%     │
│                                         │
│  [Edit Allocations]                     │
│                                         │
└─────────────────────────────────────────┘
```

### Timer Management Components

#### TimerCategory Interface
```typescript
interface TimerCategory {
  id: string;
  name: string;
  isDefault: boolean;
  color: string;
  icon: string;
  timers: Timer[]; // Timers nested under category
}
```

#### Timer Interface
```typescript
interface Timer {
  id: string;
  name: string;
  icon: string;
  categoryId: string;
  mode: 'stopwatch' | 'countdown' | 'pomodoro';
  settings: TimerSettings;
  createdAt: string;
  updatedAt: string;
}

interface TimerSettings {
  // For countdown mode
  countdownDuration?: number; // in minutes
  
  // For pomodoro mode
  workDuration?: number; // in minutes
  restDuration?: number; // in minutes
  cycles?: number;
}
```

#### TimerSession Interface
```typescript
interface TimerSession {
  timerId: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  mode: 'stopwatch' | 'countdown' | 'pomodoro';
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  
  // For pomodoro tracking
  currentCycle?: number;
  currentPeriod?: 'work' | 'rest';
  workPeriods?: Array<{ start: string; end: string }>;
}
```

### Event Management Components

#### Event Interface
```typescript
interface Event {
  id: string;
  name: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  categoryId: string;
  source: 'manual' | 'timer' | 'calendar';
  priority: number; // 3=manual, 2=timer, 1=calendar
  timerId?: string; // Reference to timer if source is 'timer'
  createdAt: string;
  updatedAt: string;
}
```

#### BlankPeriod Interface
```typescript
interface BlankPeriod {
  id: string;
  date: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  durationHours: number;
  aiSuggestion?: string;
  status: 'pending' | 'filled' | 'dismissed';
}
```

### Conflict Resolution Engine

#### ConflictResolver Interface
```typescript
interface ConflictResolver {
  resolveConflicts(events: Event[]): Event[];
  detectOverlaps(events: Event[]): Overlap[];
  splitEvent(event: Event, cutStart: string, cutEnd: string): Event[];
}

interface Overlap {
  higherPriorityEvent: Event;
  lowerPriorityEvent: Event;
  overlapType: 'full' | 'partial';
  overlapStart: string;
  overlapEnd: string;
}
```

## Data Models

### Storage Schema

The application uses localStorage with the following keys:

1. **lifeos_pro_timers_v1**: Array of Timer objects
2. **lifeos_pro_timer_categories_v1**: Array of TimerCategory objects
3. **lifeos_pro_events_v3**: Array of Event objects (upgraded from history_v2)
4. **lifeos_pro_blank_periods_v1**: Array of BlankPeriod objects
5. **lifeos_pro_allocations_v2**: Ideal ratio settings (existing)
6. **lifeos_pro_diary_v1**: Diary entries (existing)
7. **lifeos_pro_reviews**: Review results (existing)

### Data Migration Strategy

Since the existing system uses `lifeos_pro_history_v2` as a text-based log format, we need a migration strategy:

1. Parse existing history text into Event objects
2. Assign `source: 'manual'` and `priority: 3` to all migrated events
3. Extract timestamps and durations from text format
4. Map category tags to categoryId references
5. Store migrated events in `lifeos_pro_events_v3`
6. Keep `lifeos_pro_history_v2` for backward compatibility (read-only)

### Default Categories

```typescript
const DEFAULT_CATEGORIES: TimerCategory[] = [
  { id: 'work', name: '工作', isDefault: true, color: 'bg-macaron-blue', icon: 'Briefcase' },
  { id: 'study', name: '学习', isDefault: true, color: 'bg-macaron-green', icon: 'BookOpen' },
  { id: 'rest', name: '休息', isDefault: true, color: 'bg-macaron-pink', icon: 'Coffee' },
  { id: 'sleep', name: '睡眠', isDefault: true, color: 'bg-macaron-purple', icon: 'Moon' },
  { id: 'life', name: '生活', isDefault: true, color: 'bg-macaron-orange', icon: 'Home' },
  { id: 'entertainment', name: '娱乐', isDefault: true, color: 'bg-macaron-yellow', icon: 'Gamepad2' },
  { id: 'health', name: '健康', isDefault: true, color: 'bg-emerald-200', icon: 'Heart' },
  { id: 'hobby', name: '兴趣', isDefault: true, color: 'bg-macaron-rose', icon: 'Palette' }
];
```

## User Flows

### Flow 1: Creating and Using a Timer

1. User clicks "+" button in Timer tab header
2. Modal opens: "Create New Timer"
   - Name input field
   - Icon picker (grid of icons)
   - Category dropdown (all categories)
   - Mode selector: [Stopwatch] [Countdown] [Pomodoro]
   - If Countdown: Duration input (minutes)
   - If Pomodoro: Work duration, Rest duration, Cycles inputs
3. User fills form and clicks "Create"
4. Timer appears under selected category
5. User clicks play button on timer
6. Timer control modal opens showing running timer
7. User clicks stop when done
8. If stopwatch < 1 min: Session discarded, no record
9. If stopwatch >= 1 min OR countdown/pomodoro: Event created in data source

### Flow 2: Editing a Timer

1. User long-presses or clicks edit icon on timer
2. Edit modal opens with current values
3. User modifies name/icon/category/mode/settings
4. System prompts: "Sync changes with existing data source records?"
   - [Yes, update all] [No, keep records unchanged]
5. If Yes: All events created by this timer get updated name/category
6. Timer updated in list

### Flow 3: Deleting a Timer

1. User clicks delete icon on timer
2. System prompts: "Delete associated records from data source?"
   - [Delete timer only] [Delete timer and all records]
3. If "Delete timer and all records": All events from this timer removed
4. Timer removed from list

### Flow 4: Uploading Calendar Events

1. User navigates to Data Source → View Data tab
2. User clicks "Upload Calendar" to expand section
3. User pastes calendar data (one event per line)
   - Format: EventName｜2025-12-07T10:00:00+08:00｜2025-12-07T11:00:00+08:00
4. User clicks "Upload & Parse"
5. System validates each line:
   - Check ISO 8601 format
   - Check for missing end times
6. If missing end times: Prompt appears for each event
   - "Event 'Meeting' is missing end time. Please provide:"
   - Time picker input
7. After all times provided: Category assignment screen
   - List of parsed events with category dropdowns
8. User assigns categories and clicks "Import"
9. Events added to data source with priority=1 (calendar)
10. Conflict resolution runs automatically

### Flow 5: Filling Blank Periods

1. System detects: Total time today > 5h AND gap >= 2h exists
2. "Pending Confirmation" tab shows badge with count
3. User opens Pending Confirmation tab
4. Each blank period shows:
   - Date and time range
   - Duration
   - AI suggestion (if available)
   - Editable fields: Event name, Category, Time range
5. User fills in details or modifies AI suggestion
6. User clicks "Confirm"
7. Event created with priority=3 (manual)
8. Blank period removed from pending list

### Flow 6: Data Validation

1. User opens Data Source → View Data tab
2. User clicks "Data Validation" button
3. All events for selected date shown in editable list
4. User can:
   - Edit event names, times, categories
   - Delete events
   - Add new events
   - Reorder events (automatically sorted by time)
5. User clicks "Save All"
6. All changes applied
7. Edited events upgraded to priority=3 (manual)
8. Conflict resolution runs automatically

### Flow 7: Conflict Resolution (Automatic)

1. Trigger: New event added OR event edited OR priority changed
2. System collects all events for affected date(s)
3. Sort by priority (3→2→1) then by start time
4. For each event:
   - Check against all higher priority events
   - If full overlap: Remove lower priority event
   - If partial overlap: Split lower priority event
5. Final schedule has no overlaps
6. UI updates to show resolved schedule
7. If events were removed/split: Show notification
   - "3 calendar events adjusted due to conflicts"

## Timer Engine Design

### Stopwatch Mode

**State Machine:**
```
IDLE → RUNNING → PAUSED → RUNNING → STOPPED → [RECORD_CREATED or DISCARDED]
```

**Detailed Logic:**
1. **Start**: 
   - Record `startTime = new Date().toISOString()`
   - Set `status = 'running'`
   - Begin interval: `setInterval(() => updateDisplay(), 1000)`
   - Display format: HH:MM:SS

2. **Pause**:
   - Set `status = 'paused'`
   - Clear interval
   - Keep elapsed time

3. **Resume**:
   - Set `status = 'running'`
   - Resume interval

4. **Stop**:
   - Record `endTime = new Date().toISOString()`
   - Calculate `duration = (endTime - startTime) / 1000` (seconds)
   - Clear interval
   - **If duration < 60 seconds**: 
     - Show message: "Session too short, not recorded"
     - Discard session
   - **If duration >= 60 seconds**:
     - Create Event:
       ```typescript
       {
         name: timer.name,
         startTime: session.startTime,
         endTime: session.endTime,
         categoryId: timer.categoryId,
         source: 'timer',
         priority: 2,
         timerId: timer.id
       }
       ```
     - Show message: "Session recorded"

### Countdown Mode

**State Machine:**
```
CONFIGURED → RUNNING → PAUSED → RUNNING → COMPLETED → RECORD_CREATED
```

**Detailed Logic:**
1. **Configure**:
   - User sets `countdownDuration` (in minutes)
   - Convert to seconds: `totalSeconds = countdownDuration * 60`

2. **Start**:
   - Record `startTime = new Date().toISOString()`
   - Set `remainingSeconds = totalSeconds`
   - Set `status = 'running'`
   - Begin interval: `setInterval(() => { remainingSeconds--; updateDisplay(); }, 1000)`
   - Display format: MM:SS or HH:MM:SS

3. **Pause/Resume**: Same as stopwatch

4. **Complete** (when remainingSeconds reaches 0):
   - Record `endTime = new Date().toISOString()`
   - **Trigger alarm**: Play sound + visual notification
   - Create Event for **entire configured duration**:
     ```typescript
     {
       name: timer.name,
       startTime: session.startTime,
       endTime: session.endTime,
       categoryId: timer.categoryId,
       source: 'timer',
       priority: 2,
       timerId: timer.id
       }
     ```
   - Show message: "Countdown complete! Session recorded"

### Pomodoro Mode

**State Machine:**
```
CONFIGURED → WORK_RUNNING → WORK_PAUSED → WORK_RUNNING → REST_RUNNING → REST_PAUSED → REST_RUNNING → [NEXT_CYCLE or ALL_COMPLETE]
```

**Detailed Logic:**
1. **Configure**:
   - User sets: `workDuration` (minutes), `restDuration` (minutes), `cycles` (count)
   - Initialize: `currentCycle = 1`, `currentPeriod = 'work'`, `workPeriods = []`

2. **Start Work Period**:
   - Record `workStartTime = new Date().toISOString()`
   - Set `remainingSeconds = workDuration * 60`
   - Set `status = 'running'`, `currentPeriod = 'work'`
   - Display: "Work Period - Cycle 1/4 - 24:30"
   - Begin countdown interval

3. **Work Period Complete**:
   - Record `workEndTime = new Date().toISOString()`
   - **Trigger alarm**: Play sound + visual notification
   - Store work period: `workPeriods.push({ start: workStartTime, end: workEndTime })`
   - Show message: "Work period complete! Take a rest"
   - **Automatically start rest period**

4. **Start Rest Period**:
   - Set `remainingSeconds = restDuration * 60`
   - Set `currentPeriod = 'rest'`
   - Display: "Rest Period - Cycle 1/4 - 04:30"
   - Begin countdown interval

5. **Rest Period Complete**:
   - **Trigger alarm**: Play sound + visual notification
   - Increment `currentCycle++`
   - **If currentCycle <= cycles**:
     - Show message: "Rest complete! Starting next work period"
     - **Automatically start next work period** (go to step 2)
   - **If currentCycle > cycles**:
     - Show message: "Pomodoro session complete!"
     - Go to step 6

6. **All Cycles Complete**:
   - Create Events for **work periods only** (rest periods excluded):
     ```typescript
     for (const period of workPeriods) {
       createEvent({
         name: timer.name,
         startTime: period.start,
         endTime: period.end,
         categoryId: timer.categoryId,
         source: 'timer',
         priority: 2,
         timerId: timer.id
       });
     }
     ```
   - Show message: "4 work sessions recorded (rest periods excluded)"

### Alarm System

```typescript
interface AlarmService {
  playAlarm(): void;
  stopAlarm(): void;
}

// Implementation uses Web Audio API or HTML5 Audio
const playAlarm = () => {
  // Try Web Audio API first
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // 800 Hz beep
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Fallback: Visual-only notification
    console.warn('Audio alarm failed, showing visual notification only');
    showVisualAlarm();
  }
};

const showVisualAlarm = () => {
  // Flash screen border or show prominent notification
  document.body.style.animation = 'flash 0.5s ease-in-out 3';
};
```

## Priority System and Manual Edits

### Priority Levels

```typescript
enum EventPriority {
  CALENDAR = 1,  // Lowest - imported calendar events
  TIMER = 2,     // Medium - events created by timers
  MANUAL = 3     // Highest - user manual edits
}
```

### Automatic Priority Upgrade (Requirement 9.4)

When a user edits any event's name or time, the system automatically upgrades that event to manual priority:

```typescript
function handleEventEdit(eventId: string, updates: Partial<Event>) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;
  
  // Check if name or time was edited
  const nameChanged = updates.name && updates.name !== event.name;
  const timeChanged = (updates.startTime && updates.startTime !== event.startTime) ||
                      (updates.endTime && updates.endTime !== event.endTime);
  
  if (nameChanged || timeChanged) {
    // Upgrade to manual priority
    updates.priority = EventPriority.MANUAL;
    updates.source = 'manual';
    
    console.log(`Event ${eventId} upgraded to manual priority due to edit`);
  }
  
  // Apply updates
  const updatedEvent = { ...event, ...updates, updatedAt: new Date().toISOString() };
  
  // Update event in state
  setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
  
  // Trigger conflict resolution
  triggerConflictResolution();
}
```

### Conflict Resolution Trigger Points

Conflict resolution runs automatically when:
1. New event is added (from timer, calendar upload, or manual creation)
2. Existing event is edited (name, time, or category)
3. Event priority changes
4. Event is deleted (to check if lower priority events can expand)

```typescript
function triggerConflictResolution() {
  // Get all events
  const allEvents = [...events];
  
  // Run resolution algorithm
  const resolved = resolveConflicts(allEvents);
  
  // Detect changes
  const removedEvents = allEvents.filter(e => !resolved.find(r => r.id === e.id));
  const splitEvents = resolved.filter(e => e.id.includes('_before') || e.id.includes('_after'));
  
  // Update state
  setEvents(resolved);
  
  // Notify user if events were affected
  if (removedEvents.length > 0 || splitEvents.length > 0) {
    showToast(
      `${removedEvents.length} events removed, ${splitEvents.length} events split due to conflicts`,
      'info'
    );
  }
}
```

## Conflict Resolution Algorithm

### Priority-Based Resolution

```typescript
function resolveConflicts(events: Event[]): Event[] {
  // Sort by priority (descending) then by start time
  const sorted = events.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  
  const resolved: Event[] = [];
  
  for (const event of sorted) {
    let currentEvent = event;
    let fragments = [currentEvent];
    
    // Check against all higher priority events already resolved
    for (const resolvedEvent of resolved) {
      const newFragments: Event[] = [];
      
      for (const fragment of fragments) {
        const overlap = detectOverlap(fragment, resolvedEvent);
        
        if (!overlap) {
          newFragments.push(fragment);
        } else if (overlap.type === 'full') {
          // Fragment is fully covered, discard it
          console.log(`Event ${fragment.id} fully overlapped by ${resolvedEvent.id}, removing`);
          continue;
        } else {
          // Partial overlap, split the fragment
          const splits = splitEvent(fragment, resolvedEvent.startTime, resolvedEvent.endTime);
          console.log(`Event ${fragment.id} partially overlapped, split into ${splits.length} fragments`);
          newFragments.push(...splits);
        }
      }
      
      fragments = newFragments;
    }
    
    resolved.push(...fragments);
  }
  
  return resolved.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

function detectOverlap(event1: Event, event2: Event): Overlap | null {
  const start1 = new Date(event1.startTime).getTime();
  const end1 = new Date(event1.endTime).getTime();
  const start2 = new Date(event2.startTime).getTime();
  const end2 = new Date(event2.endTime).getTime();
  
  // No overlap
  if (end1 <= start2 || end2 <= start1) return null;
  
  // Full overlap: event1 is completely covered by event2
  if (start1 >= start2 && end1 <= end2) {
    return { type: 'full', overlapStart: event1.startTime, overlapEnd: event1.endTime };
  }
  
  // Partial overlap
  const overlapStart = new Date(Math.max(start1, start2)).toISOString();
  const overlapEnd = new Date(Math.min(end1, end2)).toISOString();
  
  return { type: 'partial', overlapStart, overlapEnd };
}

function splitEvent(event: Event, cutStart: string, cutEnd: string): Event[] {
  const eventStart = new Date(event.startTime).getTime();
  const eventEnd = new Date(event.endTime).getTime();
  const cutStartTime = new Date(cutStart).getTime();
  const cutEndTime = new Date(cutEnd).getTime();
  
  const fragments: Event[] = [];
  
  // Before the cut
  if (eventStart < cutStartTime) {
    fragments.push({
      ...event,
      id: `${event.id}_before`,
      endTime: cutStart
    });
  }
  
  // After the cut
  if (eventEnd > cutEndTime) {
    fragments.push({
      ...event,
      id: `${event.id}_after`,
      startTime: cutEnd
    });
  }
  
  return fragments;
}
```

## Blank Period Detection

### Detection Algorithm

```typescript
function detectBlankPeriods(events: Event[], date: string): BlankPeriod[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  
  // Filter events for the specified date
  const dayEvents = events.filter(e => {
    const start = new Date(e.startTime);
    return start >= dayStart && start <= dayEnd;
  }).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  // Calculate total recorded time
  const totalRecordedHours = dayEvents.reduce((sum, e) => {
    const duration = (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);
  
  // Only detect blanks if total recorded time > 5 hours
  if (totalRecordedHours <= 5) return [];
  
  const blanks: BlankPeriod[] = [];
  let lastEndTime = dayStart;
  
  for (const event of dayEvents) {
    const eventStart = new Date(event.startTime);
    const gapHours = (eventStart.getTime() - lastEndTime.getTime()) / (1000 * 60 * 60);
    
    // Blank period must be >= 2 hours
    if (gapHours >= 2) {
      blanks.push({
        id: `blank_${date}_${lastEndTime.getTime()}`,
        date,
        startTime: lastEndTime.toISOString(),
        endTime: eventStart.toISOString(),
        durationHours: gapHours,
        status: 'pending'
      });
    }
    
    lastEndTime = new Date(event.endTime);
  }
  
  return blanks;
}
```

## Calendar Upload Parser

### Parser Implementation

```typescript
function parseCalendarUpload(text: string): Partial<Event>[] {
  const lines = text.split('\n').filter(line => line.trim());
  const events: Partial<Event>[] = [];
  const errors: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Expected format: "EventName｜2025-12-02T12:30:00+08:00｜2025-12-02T13:30:00+08:00"
    // Or: "EventName｜2025-12-02T12:30:00+08:00" (missing end time)
    const parts = line.split(/[｜|]/);
    
    if (parts.length < 2) {
      errors.push(`Line ${i + 1}: Invalid format`);
      continue;
    }
    
    const name = parts[0].trim();
    const startTime = parts[1].trim();
    const endTime = parts[2]?.trim();
    
    // Validate ISO 8601 format
    if (!isValidISO8601(startTime)) {
      errors.push(`Line ${i + 1}: Invalid start time format`);
      continue;
    }
    
    if (endTime && !isValidISO8601(endTime)) {
      errors.push(`Line ${i + 1}: Invalid end time format`);
      continue;
    }
    
    events.push({
      name,
      startTime,
      endTime: endTime || null, // null indicates missing end time
      source: 'calendar',
      priority: 1
    });
  }
  
  return { events, errors };
}

function isValidISO8601(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)?$/;
  if (!iso8601Regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
```


## Bug Fixes

### Known Issues to Address

1. **Diary Page Crash (Requirement 13.1)**
   - **Issue**: App crashes when clicking Diary button
   - **Root Cause**: Likely null reference or undefined state access in Diary component
   - **Fix Strategy**: 
     - Add null checks for `diaryEntries` state
     - Wrap Diary component in error boundary
     - Add defensive checks before accessing diary entry properties
     - Ensure `diaryInput` state is properly initialized

2. **Edit Button Unresponsive (Requirement 13.2)**
   - **Issue**: Edit button in Existing Data does not respond
   - **Root Cause**: Event handler not properly bound or missing onClick
   - **Fix Strategy**:
     - Verify onClick handler is attached to edit button
     - Check if event propagation is being stopped elsewhere
     - Ensure edit modal state management is working
     - Add console logging to debug click events

3. **Pending Confirmation Count Unclear (Requirement 13.3)**
   - **Issue**: Shows "31 records" without context
   - **Root Cause**: Generic count display without descriptive text
   - **Fix Strategy**:
     - Change display to: "3 blank periods to review"
     - Add icon indicator (⚠️ or 📋)
     - Show total hours of blank time
     - Update badge on tab to show count

4. **New Timer Button Not Responding (Requirement 13.4)**
   - **Issue**: New Timer button does not open creation modal
   - **Root Cause**: Modal state not updating or handler not attached
   - **Fix Strategy**:
     - Verify `showTimerModal` state exists and is toggled
     - Check if modal component is rendered conditionally
     - Ensure button is not disabled by CSS or state
     - Add click handler with proper state update

5. **Review Page Crash (Requirement 13.5)**
   - **Issue**: App crashes when entering Review Page
   - **Root Cause**: Likely accessing undefined review data or calculation error
   - **Fix Strategy**:
     - Add null checks for `reviewResults` state
     - Ensure `allocations` state is initialized with defaults
     - Add try-catch around stats calculations
     - Provide fallback UI when data is missing

6. **Global Button Unresponsiveness (Requirement 13.6)**
   - **Issue**: Many buttons across app not responding to clicks
   - **Root Cause**: Possible z-index issues, event handler issues, or CSS pointer-events
   - **Fix Strategy**:
     - Audit all button components for onClick handlers
     - Check for overlapping elements with higher z-index
     - Verify no CSS `pointer-events: none` on buttons
     - Ensure buttons are not disabled by state
     - Add visual feedback (hover states) to confirm interactivity
     - Test on different devices/browsers

### Implementation Approach for Bug Fixes

```typescript
// Example: Defensive Diary Component
function DiaryPage() {
  const [diaryEntries, setDiaryEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeos_pro_diary_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load diary entries:', error);
      return [];
    }
  });
  
  // Ensure diaryEntries is always an array
  const safeDiaryEntries = Array.isArray(diaryEntries) ? diaryEntries : [];
  
  return (
    <div className="diary-page">
      {safeDiaryEntries.length === 0 ? (
        <EmptyState message="No diary entries yet" />
      ) : (
        safeDiaryEntries.map(entry => (
          <DiaryEntry key={entry.id} entry={entry} />
        ))
      )}
    </div>
  );
}

// Example: Responsive Edit Button
function EventListItem({ event, onEdit }) {
  const handleEdit = useCallback(() => {
    console.log('Edit clicked for event:', event.id);
    onEdit(event);
  }, [event, onEdit]);
  
  return (
    <div className="event-item">
      <span>{event.name}</span>
      <button 
        onClick={handleEdit}
        className="edit-btn hover:bg-blue-100 active:bg-blue-200"
        aria-label="Edit event"
      >
        <Edit3 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Example: Safe Review Page
function ReviewPage() {
  const [reviewResults, setReviewResults] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeos_pro_reviews');
      return saved ? JSON.parse(saved) : { today: null, yesterday: null, weekly: null, monthly: null };
    } catch (error) {
      console.error('Failed to load review results:', error);
      return { today: null, yesterday: null, weekly: null, monthly: null };
    }
  });
  
  const [allocations, setAllocations] = useState(() => {
    try {
      const saved = localStorage.getItem('lifeos_pro_allocations_v2');
      return saved ? JSON.parse(saved) : DEFAULT_ALLOCATIONS;
    } catch (error) {
      console.error('Failed to load allocations:', error);
      return DEFAULT_ALLOCATIONS;
    }
  });
  
  // Safe stats calculation
  const stats = useMemo(() => {
    try {
      return calculateStatsFromLogs(fullHistory);
    } catch (error) {
      console.error('Stats calculation failed:', error);
      return DEFAULT_STATS;
    }
  }, [fullHistory]);
  
  return (
    <ErrorBoundary fallback={<ReviewErrorFallback />}>
      <div className="review-page">
        {/* Review content */}
      </div>
    </ErrorBoundary>
  );
}
```

## Error Handling

### Error Categories

1. **User Input Errors**
   - Invalid timer configurations (negative durations, zero cycles)
   - Invalid date/time formats in calendar upload
   - Missing required fields

2. **Data Integrity Errors**
   - Corrupted localStorage data
   - Missing references (timer ID not found, category ID not found)
   - Timestamp inconsistencies (end time before start time)

3. **Runtime Errors**
   - Timer state machine violations
   - Conflict resolution failures
   - Alarm playback failures

4. **UI Interaction Errors**
   - Button click handlers not firing
   - Modal state not updating
   - Component crashes due to null/undefined data

### Error Handling Strategies

```typescript
// Validation with user feedback
function validateTimerConfig(timer: Partial<Timer>): ValidationResult {
  const errors: string[] = [];
  
  if (!timer.name?.trim()) errors.push('Timer name is required');
  if (!timer.categoryId) errors.push('Category is required');
  if (!timer.mode) errors.push('Timer mode is required');
  
  if (timer.mode === 'countdown' && (!timer.settings?.countdownDuration || timer.settings.countdownDuration <= 0)) {
    errors.push('Countdown duration must be greater than 0');
  }
  
  if (timer.mode === 'pomodoro') {
    if (!timer.settings?.workDuration || timer.settings.workDuration <= 0) {
      errors.push('Work duration must be greater than 0');
    }
    if (!timer.settings?.restDuration || timer.settings.restDuration <= 0) {
      errors.push('Rest duration must be greater than 0');
    }
    if (!timer.settings?.cycles || timer.settings.cycles <= 0) {
      errors.push('Number of cycles must be greater than 0');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Graceful degradation for corrupted data
function loadTimersFromStorage(): Timer[] {
  try {
    const stored = localStorage.getItem('lifeos_pro_timers_v1');
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      console.error('Invalid timers data structure');
      return [];
    }
    
    // Validate each timer
    return parsed.filter(timer => {
      const isValid = timer.id && timer.name && timer.categoryId && timer.mode;
      if (!isValid) console.warn('Skipping invalid timer:', timer);
      return isValid;
    });
  } catch (error) {
    console.error('Failed to load timers:', error);
    return [];
  }
}

// User-friendly error messages
const ERROR_MESSAGES = {
  TIMER_NOT_FOUND: '找不到指定的计时器',
  CATEGORY_NOT_FOUND: '找不到指定的分类',
  INVALID_TIME_FORMAT: '时间格式无效，请使用 ISO 8601 格式',
  CONFLICT_RESOLUTION_FAILED: '无法解决事件冲突，请手动调整',
  STORAGE_FULL: '存储空间已满，请清理部分数据',
  ALARM_FAILED: '无法播放提醒音，请检查浏览器设置'
};
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Timer State Transitions**
   - Test stopwatch: idle → running → stopped
   - Test countdown: configured → running → completed
   - Test pomodoro: work → rest → work cycles

2. **Conflict Resolution Edge Cases**
   - Test full overlap removal
   - Test partial overlap splitting
   - Test multi-event conflicts with 3+ overlapping events

3. **Parser Edge Cases**
   - Test calendar upload with missing end times
   - Test invalid ISO 8601 formats
   - Test empty input

4. **Blank Period Detection Edge Cases**
   - Test exactly 5 hours recorded (boundary)
   - Test exactly 2 hour gap (boundary)
   - Test day with no events

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript property testing library). Each test will run a minimum of 100 iterations.

Property tests will be tagged with comments referencing the design document properties:
```javascript
// Feature: lifeos-timer-rework, Property 1: Timer serialization round trip
```

Key properties to test:

1. **Serialization Round Trips**
   - Timer configurations
   - Event records
   - Category definitions

2. **Conflict Resolution Invariants**
   - No overlaps after resolution
   - Higher priority events unchanged
   - Fragment properties preserved

3. **Time Calculations**
   - Duration calculations always non-negative
   - Event ordering preserved
   - Blank period detection consistency

4. **Data Integrity**
   - Category references valid
   - Timer references valid
   - Timestamps chronologically ordered

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timer serialization round trip
*For any* valid timer configuration, serializing then deserializing should produce an equivalent timer configuration with all fields (name, icon, category, mode, settings) preserved.
**Validates: Requirements 14.5**

### Property 2: Event serialization round trip
*For any* valid event record, serializing then deserializing should produce an equivalent event with all fields (name, start time, end time, category, priority source) preserved.
**Validates: Requirements 15.5**

### Property 3: Calendar upload parsing round trip
*For any* valid calendar event string in the format "EventName｜ISO8601｜ISO8601", parsing then formatting should produce an equivalent string.
**Validates: Requirements 8.2**

### Property 4: Stopwatch duration threshold
*For any* stopwatch session with duration >= 60 seconds, stopping the timer should create an event record; for any session with duration < 60 seconds, no record should be created.
**Validates: Requirements 3.2, 3.3**

### Property 5: Countdown creates full duration record
*For any* countdown timer with configured duration D, when the timer completes, the created event should have duration exactly equal to D.
**Validates: Requirements 4.4**

### Property 6: Pomodoro records only work periods
*For any* completed Pomodoro session with N cycles, exactly N work period events should be created, and zero rest period events should be created.
**Validates: Requirements 5.4**

### Property 7: Conflict resolution eliminates overlaps
*For any* set of events (regardless of priorities and time ranges), after applying conflict resolution, no two events should have overlapping time ranges.
**Validates: Requirements 10.4**

### Property 8: Higher priority events unchanged by resolution
*For any* set of events where event A has higher priority than event B, after conflict resolution, event A's start time and end time should remain unchanged.
**Validates: Requirements 10.2**

### Property 9: Event fragments preserve properties
*For any* event that is split due to partial overlap, each resulting fragment should have the same name and category as the original event.
**Validates: Requirements 10.3**

### Property 10: Priority upgrade on edit
*For any* event with source 'timer' or 'calendar', when the event's name or time is edited, the event's priority should be upgraded to 3 (manual edit priority).
**Validates: Requirements 9.4**

### Property 11: Full overlap removal
*For any* two events where event A (higher priority) fully overlaps event B (lower priority), after conflict resolution, event B should not exist in the final event list.
**Validates: Requirements 9.2**

### Property 12: Partial overlap splitting
*For any* two events where event A (higher priority) partially overlaps event B (lower priority), after conflict resolution, event B should be split into fragments that do not overlap with event A.
**Validates: Requirements 9.3**

### Property 13: Blank period detection threshold
*For any* date where total recorded time > 5 hours AND there exists a gap >= 2 hours, the blank period detection should identify that gap; for any date where total recorded time <= 5 hours OR all gaps < 2 hours, no blank periods should be detected.
**Validates: Requirements 6.1**

### Property 14: Event sorting by start time
*For any* list of events for a given date, when displayed, the events should be sorted in ascending order by start time.
**Validates: Requirements 7.6**

### Property 15: Category assignment to timer events
*For any* timer with category C, when that timer creates an event record, the event's category should be C.
**Validates: Requirements 3.5**

### Property 16: Timer display completeness
*For any* timer, when displayed in the UI, the display should include the timer's name, icon, and category.
**Validates: Requirements 2.5**

### Property 17: Category list completeness
*For any* application state, when displaying category options, the list should include all 8 default categories plus all user-created custom categories.
**Validates: Requirements 12.1, 12.2**

### Property 18: Ideal ratio persistence
*For any* modification to ideal ratio values, the changes should be persisted to storage and reflected in subsequent comparison calculations.
**Validates: Requirements 11.3**

### Property 19: Time format consistency
*For any* running stopwatch or countdown timer, the displayed time should be in HH:MM:SS format.
**Validates: Requirements 3.4, 4.5**

### Property 20: Pomodoro display completeness
*For any* running Pomodoro timer, the display should show current period type (Work/Rest), remaining time, and cycle progress.
**Validates: Requirements 5.5**

### Property 21: Calendar upload validation
*For any* calendar upload input, the parser should validate ISO 8601 timestamp format and report errors for invalid formats.
**Validates: Requirements 8.5**

### Property 22: Event edit field availability
*For any* event in View Existing Data or Pending Confirmation, the edit interface should allow modifying event name, time range, and category.
**Validates: Requirements 6.3, 7.4**

### Property 23: Conflict recalculation on priority change
*For any* set of events, when any event's priority changes, all conflicts involving that event should be automatically recalculated and resolved.
**Validates: Requirements 9.5**

### Property 24: Multi-event priority chain
*For any* set of overlapping events with mixed priorities (manual, timer, calendar), after resolution, the final schedule should preserve manual edits completely, then timer events, then calendar events.
**Validates: Requirements 10.1**

### Property 25: Custom category deletion prompting
*For any* custom category that has associated events or timers, when the category is deleted, the system should prompt the user to reassign those items.
**Validates: Requirements 12.5**

## Implementation Notes

### State Management

The application will use React hooks for state management:

1. **useState** for component-local state (UI state, form inputs)
2. **useEffect** for side effects (localStorage sync, timer intervals)
3. **useCallback** for memoized event handlers
4. **useMemo** for expensive computations (conflict resolution, blank period detection)

### Performance Considerations

1. **Conflict Resolution**: O(n²) worst case for n events. Acceptable for typical daily event counts (< 100 events/day)
2. **Blank Period Detection**: O(n) for n events in a day
3. **Timer Updates**: Use requestAnimationFrame for smooth UI updates
4. **localStorage**: Debounce writes to avoid excessive I/O

### Browser Compatibility

- Target: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Required APIs: localStorage, Web Audio API (for alarms), Date API, requestAnimationFrame
- Fallbacks: Graceful degradation if Web Audio API unavailable (visual-only alarms)

### Accessibility

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Readers**: ARIA labels for timer controls and status
3. **Visual Feedback**: Clear visual indicators for timer state (running, paused, completed)
4. **Color Contrast**: Maintain WCAG AA contrast ratios for all text

### Displaying Split Events

When events are split due to conflicts, they should be displayed clearly to the user:

```typescript
function EventListItem({ event }) {
  const isSplitEvent = event.id.includes('_before') || event.id.includes('_after');
  const originalId = isSplitEvent ? event.id.split('_')[0] : event.id;
  
  return (
    <div className={`event-item ${isSplitEvent ? 'split-event' : ''}`}>
      <div className="event-time">
        {formatTime(event.startTime)} - {formatTime(event.endTime)}
      </div>
      <div className="event-name">
        {event.name}
        {isSplitEvent && (
          <span className="split-indicator" title="This event was split due to a conflict">
            ✂️
          </span>
        )}
      </div>
      <div className="event-category">
        <CategoryBadge categoryId={event.categoryId} />
      </div>
      <div className="event-source">
        {event.source === 'manual' && <span title="Manual edit">✏️</span>}
        {event.source === 'timer' && <span title="From timer">⏱️</span>}
        {event.source === 'calendar' && <span title="From calendar">📅</span>}
      </div>
      <button onClick={() => handleEdit(event)} className="edit-btn">
        <Edit3 className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### Time Range Selection Component

For editing event times and filling blank periods:

```typescript
function TimeRangePicker({ startTime, endTime, onChange }) {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);
  
  const handleStartChange = (newStart) => {
    setStart(newStart);
    // Validate: start must be before end
    if (new Date(newStart) >= new Date(end)) {
      // Auto-adjust end time to be 1 hour after start
      const newEnd = new Date(new Date(newStart).getTime() + 60 * 60 * 1000).toISOString();
      setEnd(newEnd);
      onChange({ startTime: newStart, endTime: newEnd });
    } else {
      onChange({ startTime: newStart, endTime: end });
    }
  };
  
  const handleEndChange = (newEnd) => {
    setEnd(newEnd);
    // Validate: end must be after start
    if (new Date(newEnd) <= new Date(start)) {
      showToast('End time must be after start time', 'error');
      return;
    }
    onChange({ startTime: start, endTime: newEnd });
  };
  
  return (
    <div className="time-range-picker">
      <div className="time-input">
        <label>Start Time</label>
        <input 
          type="datetime-local" 
          value={formatForInput(start)}
          onChange={(e) => handleStartChange(new Date(e.target.value).toISOString())}
        />
      </div>
      <div className="time-separator">→</div>
      <div className="time-input">
        <label>End Time</label>
        <input 
          type="datetime-local" 
          value={formatForInput(end)}
          onChange={(e) => handleEndChange(new Date(e.target.value).toISOString())}
        />
      </div>
      <div className="duration-display">
        Duration: {calculateDuration(start, end)}
      </div>
    </div>
  );
}

function formatForInput(isoString) {
  // Convert ISO 8601 to datetime-local format (YYYY-MM-DDTHH:mm)
  return isoString.slice(0, 16);
}

function calculateDuration(start, end) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}
```

### Migration Path

For existing users with data in `lifeos_pro_history_v2`:

1. On first load after update, detect presence of old format
2. Parse text-based history into Event objects
3. Store in new `lifeos_pro_events_v3` format
4. Keep old format for rollback capability (read-only)
5. Show migration success message to user
6. Provide "Undo Migration" option for 24 hours

```typescript
function migrateHistoryToEvents(historyText: string): Event[] {
  const events: Event[] = [];
  const lines = historyText.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse existing format: [CATEGORY] Description | ISO8601 | ISO8601
    const categoryMatch = line.match(/^\[(WORK|STUDY|REST|SLEEP|LIFE|ENTERTAINMENT|HEALTH|HOBBY)\]/i);
    const timeMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2})/g);
    
    if (timeMatch && timeMatch.length >= 2) {
      const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'life';
      const name = line.replace(/^\[.*?\]/, '').split('|')[0].trim();
      
      events.push({
        id: `migrated_${Date.now()}_${Math.random()}`,
        name,
        startTime: timeMatch[0],
        endTime: timeMatch[1],
        categoryId: category,
        source: 'manual',
        priority: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }
  
  return events;
}

function performMigration() {
  const historyText = localStorage.getItem('lifeos_pro_history_v2');
  if (!historyText) return;
  
  // Check if already migrated
  const existingEvents = localStorage.getItem('lifeos_pro_events_v3');
  if (existingEvents) {
    console.log('Migration already completed');
    return;
  }
  
  try {
    // Parse old format
    const events = migrateHistoryToEvents(historyText);
    
    // Store in new format
    localStorage.setItem('lifeos_pro_events_v3', JSON.stringify(events));
    
    // Store migration timestamp
    localStorage.setItem('lifeos_pro_migration_date', new Date().toISOString());
    
    // Keep old format for rollback (mark as backup)
    localStorage.setItem('lifeos_pro_history_v2_backup', historyText);
    
    showToast(`✅ Successfully migrated ${events.length} events to new format`, 'success');
    
    return events;
  } catch (error) {
    console.error('Migration failed:', error);
    showToast('❌ Migration failed. Please contact support.', 'error');
    return [];
  }
}

function undoMigration() {
  const backup = localStorage.getItem('lifeos_pro_history_v2_backup');
  if (!backup) {
    showToast('No backup found', 'error');
    return;
  }
  
  // Restore old format
  localStorage.setItem('lifeos_pro_history_v2', backup);
  
  // Remove new format
  localStorage.removeItem('lifeos_pro_events_v3');
  localStorage.removeItem('lifeos_pro_migration_date');
  
  showToast('Migration undone. Please refresh the page.', 'success');
  setTimeout(() => window.location.reload(), 2000);
}
```
