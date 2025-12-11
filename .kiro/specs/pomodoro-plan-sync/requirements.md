# Requirements Document

## Introduction

本文档定义了番茄钟与今日计划同步功能的需求。该功能旨在让用户在今日计划中开启计时任务时，番茄钟的默认参数能够自动与今日计划中的设置保持一致，提供无缝的工作流体验。当今日计划包含具体的番茄钟配置（如忙20分钟，休息5分钟，3个番茄钟后休息10分钟）时，系统应该自动将这些参数设置为番茄钟的默认值。

## Glossary

- **System**: LifeOS Pro 计时器管理系统
- **User**: 使用 LifeOS Pro 应用的终端用户
- **Daily Plan**: 今日计划，包含用户当天的任务安排
- **Plan Item**: 计划事项，今日计划中的单个任务或活动
- **Pomodoro Timer**: 番茄钟计时器，交替进行工作和休息周期的计时工具
- **Work Duration**: 工作时长，番茄钟中专注工作的时间长度
- **Rest Duration**: 休息时长，番茄钟中短暂休息的时间长度
- **Long Break Duration**: 长休息时长，完成多个番茄钟周期后的长时间休息
- **Cycles**: 循环次数，连续进行的番茄钟工作周期数量
- **Timer Creation Modal**: 创建计时器的弹窗界面
- **Plan Block**: 计划块，今日计划中包含时间和标签信息的子项

## Requirements

### Requirement 1

**User Story:** 作为用户，我希望从今日计划启动番茄钟时，系统能够自动识别计划中的番茄钟配置信息，这样我不需要重复设置相同的参数。

#### Acceptance Criteria

1. WHEN the User opens Timer Creation Modal from a Plan Item THEN the System SHALL analyze the Plan Item for Pomodoro configuration information
2. WHEN the Plan Item contains Work Duration information THEN the System SHALL extract the work time value and set it as default Work Duration
3. WHEN the Plan Item contains Rest Duration information THEN the System SHALL extract the rest time value and set it as default Rest Duration
4. WHEN the Plan Item contains Cycles information THEN the System SHALL extract the cycle count and set it as default Cycles
5. WHEN the Plan Item contains Long Break Duration information THEN the System SHALL extract the long break time value for future use

### Requirement 2

**User Story:** 作为用户，我希望系统能够解析今日计划中的番茄钟时间格式，这样无论我如何描述时间，系统都能正确理解。

#### Acceptance Criteria

1. WHEN the Plan Item contains time information in "X分钟" format THEN the System SHALL parse the numeric value as minutes
2. WHEN the Plan Item contains time information in "Xmin" format THEN the System SHALL parse the numeric value as minutes  
3. WHEN the Plan Item contains time information in "X minutes" format THEN the System SHALL parse the numeric value as minutes
4. WHEN the Plan Item contains invalid or unrecognizable time format THEN the System SHALL use default Pomodoro settings
5. WHEN the Plan Item contains multiple time values THEN the System SHALL map them to appropriate Pomodoro parameters based on context

### Requirement 3

**User Story:** 作为用户，我希望系统能够识别今日计划中的番茄钟模式描述，这样系统知道何时应用番茄钟同步功能。

#### Acceptance Criteria

1. WHEN the Plan Item contains keywords "番茄钟", "pomodoro", "focus", "break" THEN the System SHALL identify it as Pomodoro-related
2. WHEN the Plan Item contains pattern "忙X分钟，休息Y分钟" THEN the System SHALL extract work and rest durations
3. WHEN the Plan Item contains pattern "X个番茄钟" or "X cycles" THEN the System SHALL extract the cycle count
4. WHEN the Plan Item contains pattern "休息Z分钟，再继续" THEN the System SHALL identify long break duration
5. WHEN the Plan Item does not contain Pomodoro-related information THEN the System SHALL use standard default settings

### Requirement 4

**User Story:** 作为用户，我希望番茄钟创建界面能够显示从今日计划同步的参数，这样我可以确认设置是否正确。

#### Acceptance Criteria

1. WHEN the System detects Pomodoro configuration in Plan Item THEN the System SHALL pre-fill the Pomodoro mode settings with extracted values
2. WHEN the System pre-fills settings from Plan Item THEN the System SHALL display a visual indicator showing the source is from daily plan
3. WHEN the User modifies pre-filled settings THEN the System SHALL allow the changes and remove the sync indicator
4. WHEN the System cannot extract complete Pomodoro settings THEN the System SHALL use default values for missing parameters
5. WHEN the System successfully syncs settings THEN the System SHALL highlight Pomodoro mode as recommended option

### Requirement 5

**User Story:** 作为用户，我希望系统能够处理复杂的番茄钟配置模式，这样我可以在今日计划中描述完整的工作流程。

#### Acceptance Criteria

1. WHEN the Plan Item describes "忙20分钟，休息5分钟，3个番茄钟之后，休息10分钟" THEN the System SHALL set Work Duration to 20, Rest Duration to 5, Cycles to 3, and Long Break Duration to 10
2. WHEN the Plan Item describes partial configuration THEN the System SHALL use extracted values and fill missing parameters with defaults
3. WHEN the Plan Item contains conflicting time information THEN the System SHALL prioritize the most specific Pomodoro-related values
4. WHEN the Plan Item contains multiple Pomodoro configurations THEN the System SHALL use the first complete configuration found
5. WHEN the System processes Plan Item configuration THEN the System SHALL validate all extracted values are within acceptable ranges

### Requirement 6

**User Story:** 作为用户，我希望番茄钟同步功能不会影响手动创建计时器的体验，这样我可以灵活选择使用方式。

#### Acceptance Criteria

1. WHEN the User creates timer not from Plan Item THEN the System SHALL use standard default Pomodoro settings
2. WHEN the User manually opens Timer Creation Modal THEN the System SHALL not apply any Plan Item synchronization
3. WHEN the User creates timer from Plan Item without Pomodoro information THEN the System SHALL behave as standard timer creation
4. WHEN the System applies Plan Item synchronization THEN the System SHALL not modify the User's saved default preferences
5. WHEN the User saves a timer with synced settings THEN the System SHALL not update global default settings

### Requirement 7

**User Story:** 作为用户，我希望系统能够记住我对同步设置的修改，这样下次从相同计划创建计时器时能够使用我的偏好。

#### Acceptance Criteria

1. WHEN the User modifies synced Pomodoro settings THEN the System SHALL store the modifications temporarily for the current session
2. WHEN the User creates another timer from the same Plan Item THEN the System SHALL use the previously modified settings
3. WHEN the User starts a new session THEN the System SHALL reset to original Plan Item synchronization behavior
4. WHEN the User explicitly resets settings THEN the System SHALL revert to Plan Item extracted values
5. WHEN the System stores temporary modifications THEN the System SHALL not persist them beyond the current session
