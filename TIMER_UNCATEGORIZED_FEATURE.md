# 计时器待分类功能完成

## 功能概述
支持将今日计划中开启的计时器同步到"计时器"页面的"待分类"，用户可以将计时器分配到不同的分类底下。

## 已实现功能

### 1. 待分类 Tab ✅
- 在计时器页面左侧新增"待分类"tab
- 使用 Archive 图标和灰色配色方案
- 显示待分类计时器数量徽章
- 位于分类列表顶部，用分隔线与其他分类区分

### 2. 今日计划计时器同步 ✅
- 从今日计划启动的计时器自动分配到"待分类"
- 修改 `handleStartPlanTimer` 函数，设置 `categoryId: 'uncategorized'`
- 启动后自动切换到计时器页面

### 3. 分类分配功能 ✅
- 待分类计时器显示绿色分配按钮（箭头图标）
- 点击分配按钮打开分类选择模态框
- 支持将计时器移动到任意现有分类
- 移动后显示成功提示

### 4. UI 优化 ✅
- 待分类状态使用灰色马卡龙配色
- 空状态显示专门的提示文案
- 待分类状态下不显示"新增计时器"按钮
- 分类分配模态框使用马卡龙设计风格

## 核心代码实现

### 1. 待分类状态管理
```javascript
// 获取待分类计时器
const uncategorizedTimers = timers.filter(t => t.categoryId === 'uncategorized');

// 根据选择的分类获取计时器
const selectedCategoryData = selectedCategory === 'uncategorized' 
  ? { id: 'uncategorized', name: '待分类', color: 'bg-gray-200', icon: 'Archive' }
  : categories.find(c => c.id === selectedCategory);
```

### 2. 今日计划计时器创建
```javascript
const handleStartPlanTimer = (mode, settings = {}) => {
  const tempTimer = {
    id: `plan_timer_${Date.now()}`,
    name: selectedPlanItem.title,
    icon: '📋',
    categoryId: 'uncategorized', // 分配到待分类
    mode,
    settings: { ...settings },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  handleStartTimer(tempTimer);
  setActivePage('timer');
};
```

### 3. 分类分配功能
```javascript
const handleMoveTimerToCategory = (timerId, categoryId) => {
  if (window.TimerBackend) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
      const updatedTimer = {
        ...timer,
        categoryId: categoryId,
        updatedAt: new Date().toISOString()
      };
      
      window.TimerBackend.TimerStorage.saveTimer(updatedTimer);
      setTimers(window.TimerBackend.TimerStorage.loadTimers());
      
      const category = timerCategories.find(c => c.id === categoryId);
      showToast(`已移动到 ${category?.name || '分类'}`);
    }
  }
};
```

## 使用流程

### 流程 1：从今日计划启动计时器
1. 在今日计划页面点击任意事项的计时按钮
2. 选择计时模式（正计时/倒计时/番茄钟）
3. 计时器自动创建并分配到"待分类"
4. 自动切换到计时器页面，默认显示待分类

### 流程 2：分配计时器到分类
1. 在计时器页面选择"待分类"tab
2. 找到需要分配的计时器
3. 点击绿色箭头按钮
4. 在弹出的模态框中选择目标分类
5. 计时器移动到选定分类

## 界面设计

### 待分类 Tab
```
┌─────────────────┐
│  📦  待分类      │  ← Archive 图标 + 灰色配色
│      (2)        │  ← 数量徽章
└─────────────────┘
```

### 分类分配模态框
```
┌─────────────────────────────────┐
│          选择分类                │
│     📋 写周报总结               │
│   将计时器分配到合适的分类        │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │  工作   │  │  学习   │      │
│  │ 3个计时器│  │ 2个计时器│      │
│  └─────────┘  └─────────┘      │
│  ┌─────────┐  ┌─────────┐      │
│  │  休息   │  │  生活   │      │
│  │ 1个计时器│  │ 0个计时器│      │
│  └─────────┘  └─────────┘      │
│                                 │
│        [取消]                   │
└─────────────────────────────────┘
```

## 技术特点

1. **无缝集成**：与现有计时器系统完全兼容
2. **状态管理**：使用 `categoryId: 'uncategorized'` 标识待分类状态
3. **UI 一致性**：遵循马卡龙治愈系设计风格
4. **用户体验**：直观的分配流程和视觉反馈

## 测试建议

### 测试场景 1：今日计划计时器创建
1. 生成今日计划
2. 点击任意事项的计时按钮
3. 选择任意模式并启动
4. 验证计时器是否出现在"待分类"

### 测试场景 2：分类分配
1. 确保待分类中有计时器
2. 点击绿色箭头按钮
3. 选择目标分类
4. 验证计时器是否移动到正确分类

### 测试场景 3：UI 状态
1. 验证待分类 tab 的样式和图标
2. 验证空状态的提示文案
3. 验证分配按钮只在待分类状态显示
4. 验证新增按钮在待分类状态隐藏

## 总结

待分类功能成功实现了今日计划与计时器系统的深度整合，提供了灵活的计时器管理方式。用户可以快速从计划启动计时器，然后根据需要将其分配到合适的分类，提升了工作流程的效率。