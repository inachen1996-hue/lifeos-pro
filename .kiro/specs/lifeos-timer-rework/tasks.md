# Implementation Plan

- [x] 1. Set up data models and storage infrastructure
  - Create TypeScript interfaces for Timer, TimerCategory, TimerSession, Event, BlankPeriod
  - Set up localStorage keys and default values
  - Implement data migration from lifeos_pro_history_v2 to lifeos_pro_events_v3
  - _Requirements: 14.1, 14.2, 15.1, 15.2_

- [x] 1.1 Write property test for timer serialization round trip
  - **Property 1: Timer serialization round trip**
  - **Validates: Requirements 14.5**

- [x] 1.2 Write property test for event serialization round trip
  - **Property 2: Event serialization round trip**
  - **Validates: Requirements 15.5**

- [x] 2. Implement timer category management
  - Create TimerCategory state management with default 8 categories
  - Implement create/edit/delete category operations
  - Add category sync prompts when editing/deleting
  - Build category list UI with collapsible groups
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.1, 12.2_

- [x] 2.1 Write property test for category list completeness
  - **Property 17: Category list completeness**
  - **Validates: Requirements 12.1, 12.2**

- [x] 3. Implement timer CRUD operations
  - Create Timer state management
  - Build timer creation modal with name, icon, category, mode selection
  - Implement timer edit with sync prompt for existing records
  - Implement timer delete with record deletion prompt
  - Display timers under categories with icons and names
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.1 Write property test for timer display completeness
  - **Property 16: Timer display completeness**
  - **Validates: Requirements 2.5**

- [x] 4. Implement stopwatch timer mode
  - Create stopwatch state machine (idle → running → paused → stopped)
  - Implement start/pause/resume/stop controls
  - Display elapsed time in HH:MM:SS format
  - Implement 1-minute threshold logic (< 1 min discard, >= 1 min record)
  - Create event record with timer name and category on stop
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.1 Write property test for stopwatch duration threshold
  - **Property 4: Stopwatch duration threshold**
  - **Validates: Requirements 3.2, 3.3**

- [x] 4.2 Write property test for category assignment to timer events
  - **Property 15: Category assignment to timer events**
  - **Validates: Requirements 3.5**

- [x] 4.3 Write property test for time format consistency
  - **Property 19: Time format consistency**
  - **Validates: Requirements 3.4, 4.5**

- [x] 5. Implement countdown timer mode
  - Create countdown state machine (configured → running → paused → completed)
  - Implement duration configuration input
  - Display remaining time in HH:MM:SS format
  - Implement countdown logic with 1-second intervals
  - Trigger alarm when countdown reaches zero
  - Create event record for full duration on completion
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5.1 Write property test for countdown creates full duration record
  - **Property 5: Countdown creates full duration record**
  - **Validates: Requirements 4.4**

- [x] 6. Implement Pomodoro timer mode
  - Create Pomodoro state machine (work → rest → work cycles)
  - Implement configuration for work duration, rest duration, cycles
  - Display current period type, remaining time, and cycle progress
  - Implement automatic transitions between work and rest periods
  - Trigger alarms at end of each period
  - Track work periods only (exclude rest periods)
  - Create event records for work periods on completion
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6.1 Write property test for Pomodoro records only work periods
  - **Property 6: Pomodoro records only work periods**
  - **Validates: Requirements 5.4**

- [x] 6.2 Write property test for Pomodoro display completeness
  - **Property 20: Pomodoro display completeness**
  - **Validates: Requirements 5.5**

- [x] 7. Implement alarm system
  - Create alarm service using Web Audio API
  - Implement fallback visual alarm for browsers without audio support
  - Add alarm sound generation (800 Hz beep)
  - Integrate alarm triggers into countdown and Pomodoro modes
  - _Requirements: 4.3, 5.2, 5.3_

- [x] 8. Implement event priority system
  - Add priority field to Event interface (1=calendar, 2=timer, 3=manual)
  - Implement automatic priority upgrade on event edit
  - Add visual indicators for event sources (✏️ manual, ⏱️ timer, 📅 calendar)
  - Trigger conflict resolution on priority changes
  - _Requirements: 9.1, 9.4, 9.5_

- [x] 8.1 Write property test for priority upgrade on edit
  - **Property 10: Priority upgrade on edit**
  - **Validates: Requirements 9.4**

- [x] 9. Implement conflict resolution engine
  - Create conflict detection algorithm (full overlap, partial overlap)
  - Implement event splitting for partial overlaps
  - Implement priority-based resolution (manual > timer > calendar)
  - Ensure no overlaps remain after resolution
  - Preserve higher priority events unchanged
  - Maintain event properties in fragments
  - _Requirements: 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 9.1 Write property test for conflict resolution eliminates overlaps
  - **Property 7: Conflict resolution eliminates overlaps**
  - **Validates: Requirements 10.4**

- [x] 9.2 Write property test for higher priority events unchanged
  - **Property 8: Higher priority events unchanged by resolution**
  - **Validates: Requirements 10.2**

- [x] 9.3 Write property test for event fragments preserve properties
  - **Property 9: Event fragments preserve properties**
  - **Validates: Requirements 10.3**

- [x] 9.4 Write property test for full overlap removal
  - **Property 11: Full overlap removal**
  - **Validates: Requirements 9.2**

- [x] 9.5 Write property test for partial overlap splitting
  - **Property 12: Partial overlap splitting**
  - **Validates: Requirements 9.3**

- [x] 9.6 Write property test for multi-event priority chain
  - **Property 24: Multi-event priority chain**
  - **Validates: Requirements 10.1**

- [x] 9.7 Write property test for conflict recalculation on priority change
  - **Property 23: Conflict recalculation on priority change**
  - **Validates: Requirements 9.5**

- [x] 10. Implement blank period detection
  - Create blank period detection algorithm
  - Check trigger conditions (total time > 5h AND gap >= 2h)
  - Identify continuous blank periods in daily schedule
  - Calculate blank period durations
  - Store detected blank periods with pending status
  - _Requirements: 6.1, 6.2_

- [x] 10.1 Write property test for blank period detection threshold
  - **Property 13: Blank period detection threshold**
  - **Validates: Requirements 6.1**

- [ ] 11. Implement Pending Confirmation tab
  - Create Pending Confirmation UI with clear count description
  - Display blank periods with date, time range, duration
  - Add editable fields for event name, category, time range
  - Integrate AI suggestions (if available) with modify/delete options
  - Implement confirm action to create manual priority events
  - Implement dismiss action to remove from pending list
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 13.3_

- [ ] 12. Implement View Existing Data tab
  - Create date header with current date display
  - Implement date picker for selecting any date
  - Default selected date to today on page load
  - Display events sorted by start time for selected date
  - Add edit button for each event
  - Implement event editing (name, time range, category)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [x] 12.1 Write property test for event sorting by start time
  - **Property 14: Event sorting by start time**
  - **Validates: Requirements 7.6**

- [x] 12.2 Write property test for event edit field availability
  - **Property 22: Event edit field availability**
  - **Validates: Requirements 6.3, 7.4**

- [ ] 13. Implement Data Validation feature
  - Create Data Validation modal/view
  - Display all events for selected day in editable list
  - Allow editing event names, times, categories
  - Allow deleting events
  - Allow adding new events
  - Implement "Save All" to apply changes
  - Trigger conflict resolution after save
  - _Requirements: 7.5_

- [x] 14. Implement calendar upload feature
  - Create collapsible upload section in View Existing Data tab
  - Build text area for pasting calendar data
  - Implement parser for format "EventName｜ISO8601｜ISO8601"
  - Validate ISO 8601 timestamp format
  - Detect and prompt for missing end times
  - Display parsed events with category assignment dropdowns
  - Implement import action to create calendar priority events
  - Report parsing errors clearly
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 14.1 Write property test for calendar upload parsing round trip
  - **Property 3: Calendar upload parsing round trip**
  - **Validates: Requirements 8.2**

- [x] 14.2 Write property test for calendar upload validation
  - **Property 21: Calendar upload validation**
  - **Validates: Requirements 8.5**

- [ ] 15. Implement time range picker component
  - Create TimeRangePicker component with start/end inputs
  - Use datetime-local input type
  - Validate end time is after start time
  - Display calculated duration
  - Auto-adjust end time if start time moves past it
  - _Requirements: 6.3, 7.4, 8.3_

- [ ] 16. Implement Ideal Ratio tab in Review page
  - Move Ideal Ratio from Data Source to Review page
  - Position Ideal Ratio tab before Today TEP tab
  - Display target time allocation percentages per category
  - Implement edit allocations functionality
  - Persist changes to localStorage
  - Calculate and display variance between actual and ideal
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 16.1 Write property test for ideal ratio persistence
  - **Property 18: Ideal ratio persistence**
  - **Validates: Requirements 11.3**

- [ ] 17. Fix Diary page crash
  - Add null checks for diaryEntries state
  - Wrap Diary component in error boundary
  - Add defensive checks before accessing diary entry properties
  - Ensure diaryInput state is properly initialized
  - Test Diary button click and page load
  - _Requirements: 13.1_

- [ ] 18. Fix Edit button unresponsiveness
  - Verify onClick handler is attached to edit buttons
  - Check event propagation issues
  - Ensure edit modal state management works
  - Add hover states for visual feedback
  - Test edit button in Existing Data tab
  - _Requirements: 13.2_

- [ ] 19. Fix New Timer button unresponsiveness
  - Verify showTimerModal state exists and toggles correctly
  - Check if modal component renders conditionally
  - Ensure button is not disabled by CSS or state
  - Add click handler with proper state update
  - Test New Timer button in Timer tab
  - _Requirements: 13.4_

- [ ] 20. Fix Review Page crash
  - Add null checks for reviewResults state
  - Ensure allocations state is initialized with defaults
  - Add try-catch around stats calculations
  - Provide fallback UI when data is missing
  - Test Review page load and navigation
  - _Requirements: 13.5_

- [ ] 21. Fix global button unresponsiveness
  - Audit all button components for onClick handlers
  - Check for z-index issues with overlapping elements
  - Verify no CSS pointer-events: none on buttons
  - Ensure buttons are not disabled by state
  - Add visual feedback (hover/active states) to all buttons
  - Test buttons across all pages
  - _Requirements: 13.6_

- [ ] 22. Implement custom category management
  - Add "New Category Group" button in Timer tab
  - Create category creation modal
  - Implement category editing
  - Implement category deletion with reassignment prompt
  - Allow category selection in timers and events
  - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 22.1 Write property test for custom category deletion prompting
  - **Property 25: Custom category deletion prompting**
  - **Validates: Requirements 12.5**

- [ ] 23. Implement split event display
  - Add visual indicator (✂️) for split events
  - Display split events with original name and category
  - Show event source icons (✏️ manual, ⏱️ timer, 📅 calendar)
  - Ensure split events are editable
  - _Requirements: 10.3, 10.5_

- [x] 24. Implement data migration system
  - Create migration function from lifeos_pro_history_v2 to lifeos_pro_events_v3
  - Parse text-based history into Event objects
  - Assign manual priority to migrated events
  - Keep backup of old format for rollback
  - Show migration success message
  - Implement undo migration function (24-hour window)
  - _Requirements: 14.2, 15.2_

- [ ] 25. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Polish UI and add final touches
  - Ensure all modals have proper close buttons
  - Add loading states for async operations
  - Add confirmation dialogs for destructive actions
  - Ensure responsive design works on mobile
  - Add keyboard shortcuts for common actions
  - Test accessibility (keyboard navigation, screen readers)
  - _Requirements: All_

- [ ] 27. Final testing and bug verification
  - Test all timer modes (stopwatch, countdown, Pomodoro)
  - Test conflict resolution with various scenarios
  - Test calendar upload with valid and invalid data
  - Test blank period detection and filling
  - Verify all bug fixes (Diary, Edit button, New Timer, Review page, global buttons)
  - Test data migration from old format
  - _Requirements: All_
