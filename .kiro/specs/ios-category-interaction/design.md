# Design Document

## Overview

本设计实现完整的 iOS 风格分类按钮交互系统，包括长按检测、编辑模式管理、抖动动画、拖放排序和删除功能。设计遵循 iOS 主屏幕应用图标的交互模式，提供熟悉且直观的用户体验。

## Architecture

### 组件层次结构

```
TimerPage (主组件)
├── EditModeContext (编辑模式状态)
├── CategoryButton (分类按钮)
│   ├── LongPressDetector (长按检测)
│   ├── ShakeAnimation (抖动动画)
│   ├── DeleteButton (删除按钮)
│   └── DragHandler (拖动处理)
└── DeleteConfirmModal (删除确认对话框)
```

### 状态管理

```javascript
// TimerPage 组件状态
const [isEditMode, setIsEditMode] = useState(false);
const [longPressTimer, setLongPressTimer] = useState(null);
const [draggedCategoryId, setDraggedCategoryId] = useState(null);
const [dragOverCategoryId, setDragOverCategoryId] = useState(null);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [categoryToDelete, setCategoryToDelete] = useState(null);
```

## Components and Interfaces

### 1. LongPressDetector

**职责**: 检测长按手势并触发编辑模式

**接口**:
```javascript
interface LongPressDetectorProps {
  onLongPress: () => void;
  delay: number; // 500-800ms
  children: ReactNode;
}
```

**实现逻辑**:
- 监听 `mousedown`/`touchstart` 事件启动定时器
- 监听 `mouseup`/`touchend`/`mouseleave` 事件清除定时器
- 定时器到期时调用 `onLongPress` 回调
- 防止与正常点击冲突

### 2. ShakeAnimation

**职责**: 提供 iOS 风格的抖动动画

**CSS 实现**:
```css
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

.shake {
  animation: shake 0.3s infinite;
}
```

**应用条件**:
- 仅在编辑模式下应用
- 不应用于新建分类按钮
- 退出编辑模式时立即移除

### 3. DragHandler

**职责**: 处理拖放操作和排序逻辑

**接口**:
```javascript
interface DragHandlerProps {
  categoryId: string;
  index: number;
  onDragStart: (categoryId: string) => void;
  onDragOver: (categoryId: string) => void;
  onDrop: (targetIndex: number) => void;
  isEditMode: boolean;
}
```

**实现方式**:
- 使用 HTML5 Drag & Drop API
- 或使用原生事件实现（更好的移动端支持）
- 提供拖动中的视觉反馈
- 实时更新排序预览

### 4. DeleteButton

**职责**: 显示删除按钮并处理删除操作

**接口**:
```javascript
interface DeleteButtonProps {
  categoryId: string;
  categoryName: string;
  onDelete: (categoryId: string) => void;
  isVisible: boolean;
  isLastCategory: boolean;
}
```

**视觉设计**:
- 位置：分类按钮左上角
- 样式：圆形背景 + X 图标
- 颜色：红色背景（bg-red-500）+ 白色图标
- 大小：w-5 h-5
- 动画：淡入淡出

### 5. DeleteConfirmModal

**职责**: 显示删除确认对话框

**接口**:
```javascript
interface DeleteConfirmModalProps {
  isOpen: boolean;
  categoryName: string;
  timerCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**内容**:
- 标题：确认删除分类
- 信息：显示分类名称和计时器数量
- 警告：如果有计时器，提示将移动到默认分类
- 按钮：取消 / 确认删除

## Data Models

### Category 数据结构

```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  order?: number; // 新增：排序顺序
  createdAt: string;
  updatedAt: string;
}
```

### CategoryStorage 扩展

```typescript
interface CategoryStorage {
  // 现有方法
  saveCategory(category: Category): void;
  loadCategories(): Category[];
  
  // 新增方法
  updateCategoryOrder(categoryIds: string[]): void;
  deleteCategory(categoryId: string): void;
  getCategoryById(categoryId: string): Category | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 长按触发编辑模式

*For any* 分类按钮，当用户按住超过 500ms 且未移开时，系统应进入编辑模式并显示抖动动画

**Validates: Requirements 1.1**

### Property 2: 快速点击不触发编辑模式

*For any* 分类按钮，当用户按住少于 500ms 就释放时，系统应执行正常点击操作而不进入编辑模式

**Validates: Requirements 5.4**

### Property 3: 拖动排序保持一致性

*For any* 分类列表和任意拖动操作，拖动后的分类顺序应与 CategoryStorage 中保存的顺序一致

**Validates: Requirements 3.4, 6.1**

### Property 4: 删除分类保持计时器关联

*For any* 被删除的分类，该分类下的所有计时器应被移动到默认分类，且计时器数据不丢失

**Validates: Requirements 4.4**

### Property 5: 最后一个分类不可删除

*For any* 分类列表，当只剩一个分类时，该分类的删除按钮应被隐藏或禁用

**Validates: Requirements 4.6**

### Property 6: 编辑模式下禁用切换

*For any* 分类按钮，在编辑模式下点击按钮应不触发分类切换操作

**Validates: Requirements 1.4**

### Property 7: 退出编辑模式恢复状态

*For any* 编辑模式会话，退出编辑模式后所有按钮应停止抖动并恢复到正常交互状态

**Validates: Requirements 2.4**

### Property 8: 排序持久化

*For any* 分类排序操作，页面刷新后分类应按照保存的顺序显示

**Validates: Requirements 6.3**

## Error Handling

### 长按检测错误

- **场景**: 定时器未正确清除导致误触发
- **处理**: 在组件卸载时清除所有定时器
- **代码**: `useEffect(() => () => clearTimeout(longPressTimer), [longPressTimer])`

### 拖放操作错误

- **场景**: 拖动过程中数据丢失或顺序错误
- **处理**: 在拖放前保存原始顺序，失败时回滚
- **提示**: "排序失败，已恢复原始顺序"

### 删除操作错误

- **场景**: CategoryStorage 删除失败
- **处理**: 捕获异常，显示错误提示，不更新 UI 状态
- **提示**: "删除失败，请重试"

### 最后一个分类保护

- **场景**: 用户尝试删除最后一个分类
- **处理**: 隐藏删除按钮或显示禁用状态
- **提示**: "至少需要保留一个分类"

### 计时器迁移错误

- **场景**: 删除分类时计时器迁移失败
- **处理**: 阻止删除操作，显示错误提示
- **提示**: "无法删除分类，计时器迁移失败"

## Testing Strategy

### Unit Tests

1. **长按检测测试**
   - 测试 500ms 长按触发编辑模式
   - 测试 300ms 快速点击不触发编辑模式
   - 测试长按过程中移开取消操作

2. **拖放排序测试**
   - 测试拖动分类到新位置
   - 测试排序保存到 CategoryStorage
   - 测试排序失败回滚

3. **删除功能测试**
   - 测试删除分类并迁移计时器
   - 测试删除当前选中分类自动切换
   - 测试最后一个分类不可删除

4. **编辑模式测试**
   - 测试进入/退出编辑模式
   - 测试编辑模式下禁用切换
   - 测试点击空白区域退出编辑模式

### Property-Based Tests

使用 fast-check 库进行属性测试，每个测试运行至少 100 次迭代。

**Property Test 1: 长按时间阈值**
```javascript
// Feature: ios-category-interaction, Property 1: 长按触发编辑模式
fc.assert(
  fc.property(
    fc.integer({ min: 500, max: 2000 }), // 长按时间
    (pressTime) => {
      // 模拟长按
      const result = simulateLongPress(pressTime);
      // 验证：超过 500ms 应触发编辑模式
      return pressTime >= 500 ? result.isEditMode : !result.isEditMode;
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 2: 拖动排序一致性**
```javascript
// Feature: ios-category-interaction, Property 3: 拖动排序保持一致性
fc.assert(
  fc.property(
    fc.array(fc.string(), { minLength: 2, maxLength: 10 }), // 分类列表
    fc.integer({ min: 0, max: 9 }), // 源索引
    fc.integer({ min: 0, max: 9 }), // 目标索引
    (categories, fromIndex, toIndex) => {
      if (fromIndex >= categories.length || toIndex >= categories.length) return true;
      
      // 执行拖动排序
      const newOrder = reorderCategories(categories, fromIndex, toIndex);
      
      // 保存到存储
      saveCategoryOrder(newOrder);
      
      // 从存储加载
      const loadedOrder = loadCategoryOrder();
      
      // 验证：加载的顺序应与新顺序一致
      return JSON.stringify(newOrder) === JSON.stringify(loadedOrder);
    }
  ),
  { numRuns: 100 }
);
```

**Property Test 3: 删除分类计时器迁移**
```javascript
// Feature: ios-category-interaction, Property 4: 删除分类保持计时器关联
fc.assert(
  fc.property(
    fc.array(fc.record({
      id: fc.string(),
      categoryId: fc.string()
    }), { minLength: 1, maxLength: 20 }), // 计时器列表
    fc.string(), // 要删除的分类 ID
    (timers, categoryToDelete) => {
      const timersInCategory = timers.filter(t => t.categoryId === categoryToDelete);
      const totalTimersBefore = timers.length;
      
      // 执行删除
      deleteCategory(categoryToDelete);
      
      // 获取删除后的计时器
      const timersAfter = loadAllTimers();
      
      // 验证：计时器总数不变，且原分类的计时器已迁移
      return timersAfter.length === totalTimersBefore &&
             timersAfter.filter(t => t.categoryId === categoryToDelete).length === 0;
    }
  ),
  { numRuns: 100 }
);
```

### Integration Tests

1. **完整交互流程测试**
   - 长按进入编辑模式 → 拖动排序 → 退出编辑模式 → 验证排序保存
   - 长按进入编辑模式 → 删除分类 → 确认删除 → 验证分类和计时器状态

2. **跨设备测试**
   - 在触摸设备上测试长按和拖动
   - 在鼠标设备上测试长按和拖动
   - 验证两种输入方式的一致性

3. **边界条件测试**
   - 只有一个分类时的行为
   - 删除当前选中分类的行为
   - 删除包含大量计时器的分类

### Testing Framework

- **Unit Tests**: Vitest
- **Property Tests**: fast-check
- **Integration Tests**: Vitest + Testing Library
- **E2E Tests**: 手动测试（由于是单文件应用）

### Test Coverage Goals

- 核心逻辑覆盖率：> 90%
- 边界条件覆盖：100%
- 属性测试迭代：每个属性至少 100 次
