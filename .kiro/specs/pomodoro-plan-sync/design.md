# Design Document

## Overview

番茄钟与今日计划同步功能是一个智能参数提取和预填充系统，旨在为用户提供无缝的工作流体验。当用户从今日计划中启动计时任务时，系统会自动分析计划事项中的番茄钟相关信息，提取工作时长、休息时长、循环次数等参数，并将这些参数作为番茄钟的默认设置。

该功能的核心价值在于减少用户的重复配置工作，提高从计划到执行的效率。系统支持多种时间格式和描述模式，能够智能识别和解析复杂的番茄钟配置，同时保持与现有计时器创建流程的兼容性。

## Architecture

系统采用分层架构设计，包含以下主要层次：

### 1. 数据层 (Data Layer)
- **Plan Item Parser**: 负责解析今日计划事项的数据结构
- **Configuration Extractor**: 从计划事项中提取番茄钟配置信息
- **Session Storage**: 管理用户在当前会话中的设置修改

### 2. 业务逻辑层 (Business Logic Layer)
- **Pomodoro Config Analyzer**: 分析和验证提取的番茄钟配置
- **Pattern Matcher**: 识别各种时间格式和描述模式
- **Conflict Resolver**: 处理配置冲突和优先级

### 3. 表现层 (Presentation Layer)
- **Timer Creation Modal**: 增强的计时器创建界面
- **Sync Indicator**: 显示同步状态的视觉组件
- **Settings Pre-filler**: 负责预填充设置的UI组件

### 4. 集成层 (Integration Layer)
- **Plan Item Bridge**: 连接今日计划和计时器系统
- **Default Settings Manager**: 管理默认设置和用户偏好

## Components and Interfaces

### PomodoroConfigExtractor

负责从计划事项中提取番茄钟配置的核心组件。

```typescript
interface PomodoroConfigExtractor {
  extractConfig(planItem: PlanItem): PomodoroConfig | null;
  parseTimeFormat(timeString: string): number | null;
  detectPomodoroKeywords(text: string): boolean;
  extractComplexPattern(description: string): Partial<PomodoroConfig>;
}

interface PomodoroConfig {
  workDuration: number;
  restDuration: number;
  cycles: number;
  longBreakDuration?: number;
  source: 'plan-sync' | 'default' | 'user-modified';
}
```

### PlanItemAnalyzer

分析计划事项结构和内容的组件。

```typescript
interface PlanItemAnalyzer {
  analyzeSubBlocks(subBlocks: SubBlock[]): PomodoroHints;
  identifyFocusBlocks(subBlocks: SubBlock[]): SubBlock[];
  identifyBreakBlocks(subBlocks: SubBlock[]): SubBlock[];
  calculateDurations(blocks: SubBlock[]): DurationInfo;
}

interface PomodoroHints {
  hasPomodoroInfo: boolean;
  workDuration?: number;
  restDuration?: number;
  cycles?: number;
  confidence: number;
}
```

### TimerCreationEnhancer

增强计时器创建流程的组件。

```typescript
interface TimerCreationEnhancer {
  preFillSettings(config: PomodoroConfig): void;
  showSyncIndicator(source: string): void;
  hideSyncIndicator(): void;
  recommendPomodoroMode(): void;
  handleUserModification(field: string, value: any): void;
}
```

### SessionConfigManager

管理会话级别的配置修改。

```typescript
interface SessionConfigManager {
  storeModification(planItemId: string, config: Partial<PomodoroConfig>): void;
  getModification(planItemId: string): Partial<PomodoroConfig> | null;
  clearSession(): void;
  resetToOriginal(planItemId: string): void;
}
```

## Data Models

### 扩展的计划事项接口

```typescript
interface PlanItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: string;
  sub_blocks?: SubBlock[];
  energy_required: 'high' | 'low';
}

interface SubBlock {
  time: string;
  label: string;
  detail: string;
}
```

### 番茄钟配置模型

```typescript
interface ExtractedPomodoroConfig {
  workDuration: number;
  restDuration: number;
  cycles: number;
  longBreakDuration?: number;
  source: ConfigSource;
  confidence: number;
  extractedFrom: {
    title?: boolean;
    description?: boolean;
    subBlocks?: boolean;
  };
}

type ConfigSource = 'plan-sync' | 'default' | 'user-modified' | 'session-cached';
```

### 会话存储模型

```typescript
interface SessionConfig {
  planItemId: string;
  originalConfig: PomodoroConfig;
  modifiedConfig: Partial<PomodoroConfig>;
  timestamp: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Plan Item Analysis Consistency
*For any* plan item with pomodoro-related information, the analysis function should consistently identify it as pomodoro-related across multiple calls
**Validates: Requirements 1.1**

### Property 2: Work Duration Extraction Accuracy
*For any* plan item containing work duration information in supported formats, the extraction function should return the correct numeric value in minutes
**Validates: Requirements 1.2**

### Property 3: Rest Duration Extraction Accuracy
*For any* plan item containing rest duration information in supported formats, the extraction function should return the correct numeric value in minutes
**Validates: Requirements 1.3**

### Property 4: Cycle Count Extraction Accuracy
*For any* plan item containing cycle count information, the extraction function should return the correct integer value
**Validates: Requirements 1.4**

### Property 5: Time Format Parsing Consistency
*For any* valid time string in supported formats ("X分钟", "Xmin", "X minutes"), the parser should extract the same numeric value regardless of format
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 6: Invalid Format Fallback
*For any* invalid or unrecognizable time format, the system should consistently fall back to default pomodoro settings
**Validates: Requirements 2.4**

### Property 7: Keyword Detection Reliability
*For any* text containing pomodoro-related keywords ("番茄钟", "pomodoro", "focus", "break"), the detection function should identify it as pomodoro-related
**Validates: Requirements 3.1**

### Property 8: Complex Pattern Extraction
*For any* text matching the pattern "忙X分钟，休息Y分钟", the system should extract both work duration X and rest duration Y correctly
**Validates: Requirements 3.2**

### Property 9: Settings Pre-fill Accuracy
*For any* detected pomodoro configuration, the UI pre-fill function should set all extracted values correctly in the corresponding form fields
**Validates: Requirements 4.1**

### Property 10: User Modification Preservation
*For any* user modification to pre-filled settings, the system should preserve the changes and update the configuration source accordingly
**Validates: Requirements 4.3**

### Property 11: Default Fallback for Incomplete Config
*For any* plan item with incomplete pomodoro configuration, the system should use default values for missing parameters while preserving extracted values
**Validates: Requirements 4.4, 5.2**

### Property 12: Conflict Resolution Priority
*For any* plan item with conflicting time information, the system should consistently prioritize the most specific pomodoro-related values
**Validates: Requirements 5.3**

### Property 13: Value Range Validation
*For any* extracted pomodoro configuration values, the system should validate that all values are within acceptable ranges (e.g., 1-120 minutes for durations, 1-10 for cycles)
**Validates: Requirements 5.5**

### Property 14: Non-Plan Timer Independence
*For any* timer creation not initiated from a plan item, the system should use standard default settings without applying any synchronization
**Validates: Requirements 6.1, 6.2**

### Property 15: Global Settings Preservation
*For any* plan item synchronization operation, the user's saved default preferences should remain unchanged
**Validates: Requirements 6.4, 6.5**

### Property 16: Session Modification Persistence
*For any* user modification to synced settings within a session, creating another timer from the same plan item should use the modified settings
**Validates: Requirements 7.1, 7.2**

### Property 17: Settings Reset Functionality
*For any* explicitly triggered reset operation, the system should revert all settings to the original plan item extracted values
**Validates: Requirements 7.4**

## Error Handling

### 1. 解析错误处理
- **无效时间格式**: 当遇到无法识别的时间格式时，系统记录警告并使用默认值
- **数值超出范围**: 当提取的数值超出合理范围时，系统使用最接近的有效值
- **格式冲突**: 当同一计划事项包含冲突信息时，系统按优先级选择最可靠的值

### 2. 数据完整性保护
- **原始设置保护**: 确保同步操作不会修改用户的全局默认设置
- **会话隔离**: 确保不同会话之间的临时修改不会相互影响
- **回滚机制**: 提供重置到原始提取值的功能

### 3. 用户体验保护
- **渐进式降级**: 当部分功能不可用时，确保基本的计时器创建功能仍然可用
- **视觉反馈**: 通过UI指示器清楚地显示同步状态和数据来源
- **错误提示**: 为用户提供清晰的错误信息和建议操作

### 4. 性能保护
- **解析超时**: 为复杂文本解析设置合理的超时限制
- **缓存机制**: 对相同计划事项的重复解析结果进行缓存
- **异步处理**: 确保解析操作不会阻塞UI响应

## Testing Strategy

### Unit Testing
单元测试将验证各个组件的核心功能：

- **解析器测试**: 验证各种时间格式和模式的正确解析
- **提取器测试**: 测试从不同结构的计划事项中提取配置的准确性
- **验证器测试**: 确保配置验证逻辑的正确性
- **UI组件测试**: 验证设置预填充和视觉指示器的行为

### Property-Based Testing
属性测试将使用 **fast-check** 库验证系统的通用属性：

- **配置**: 每个属性测试运行最少100次迭代
- **标记**: 每个属性测试使用注释标记对应的设计文档属性
- **格式**: 使用 `**Feature: pomodoro-plan-sync, Property {number}: {property_text}**` 格式

属性测试将覆盖：
- 解析函数的一致性和准确性
- 配置提取的完整性
- 错误处理的鲁棒性
- UI状态管理的正确性

### Integration Testing
集成测试将验证组件间的协作：

- **端到端流程**: 从计划事项到计时器创建的完整流程
- **数据流验证**: 确保数据在各层之间正确传递
- **状态同步**: 验证UI状态与业务逻辑的同步
- **错误传播**: 测试错误在系统中的正确处理和传播

### 测试数据生成策略
- **智能生成器**: 创建符合真实使用场景的测试数据
- **边界值测试**: 包含极值和边界条件的测试用例
- **格式变体**: 涵盖所有支持的时间格式和描述模式
- **错误场景**: 包含各种无效输入和异常情况