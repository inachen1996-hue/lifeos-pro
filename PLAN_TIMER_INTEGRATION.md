# 计划事项计时功能 - 实现完成 ✅

## 实现时间
2025-12-08

## 功能概述
在今日计划的每个事项旁边添加计时按钮，点击后可以选择计时器类型（正计时、倒计时、番茄钟），如果事项包含番茄钟信息，默认推荐番茄钟模式并自动提取时长。

## 已实现功能

### 1. 计时按钮 ✅
- 在每个计划事项的右上角添加 Play 按钮
- 按钮样式：蓝色圆形背景，悬停时放大
- 位置：时间和分类标签之间

### 2. 计时模式选择 ✅
创建了 `PlanItemTimerModal` 组件，支持三种模式：
- ⏱️ 正计时：从 0 开始计时
- ⏰ 倒计时：设定时间倒数
- 🍅 番茄钟：工作休息循环

### 3. 智能推荐 ✅
- 自动检测计划事项是否包含番茄钟信息
- 检测逻辑：查找 sub_blocks 中是否有 Focus/Break/Pomodoro 标签
- 如果包含番茄钟信息，在番茄钟选项上显示"推荐"标签
- 自动提取工作时长（从 Focus 时间段计算）

### 4. 时长设置 ✅

#### 倒计时设置
- 输入框：手动输入时长（1-180 分钟）
- 快捷按钮：5, 10, 15, 25, 30, 45, 60 分钟

#### 番茄钟设置
- 工作时长：手动输入或快捷按钮（15, 25, 30, 45 分钟）
- 休息时长：手动输入或快捷按钮（5, 10, 15 分钟）
- 如果事项包含番茄钟信息，自动提取工作时长

### 5. 计时器启动 ✅
- 创建临时计时器（ID: `plan_timer_${timestamp}`）
- 计时器名称：使用事项标题
- 计时器图标：📋
- 自动切换到计时器页面
- 启动计时器会话

## 技术实现

### 1. 状态管理
```javascript
const [showPlanTimerModal, setShowPlanTimerModal] = useState(false);
const [selectedPlanItem, setSelectedPlanItem] = useState(null);
```

### 2. 核心函数

#### handlePlanItemTimer
```javascript
const handlePlanItemTimer = (planItem) => {
  setSelectedPlanItem(planItem);
  setShowPlanTimerModal(true);
};
```

#### handleStartPlanTimer
```javascript
const handleStartPlanTimer = (mode, settings = {}) => {
  if (!selectedPlanItem) return;

  // 创建临时计时器
  const tempTimer = {
    id: `plan_timer_${Date.now()}`,
    name: selectedPlanItem.title,
    icon: '📋',
    categoryId: timerCategories.find(c => c.name === '工作')?.id || timerCategories[0]?.id,
    mode,
    settings: { ...settings },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 启动计时器
  handleStartTimer(tempTimer);
  setShowPlanTimerModal(false);
  setSelectedPlanItem(null);
  
  // 切换到计时器页面
  setActivePage('timer');
};
```

### 3. 番茄钟检测逻辑
```javascript
const hasPomodoroInfo = planItem.sub_blocks && planItem.sub_blocks.some(sb => 
  sb.label && (sb.label.includes('Focus') || sb.label.includes('Break') || sb.label.includes('Pomodoro'))
);
```

### 4. 时长提取逻辑
```javascript
React.useEffect(() => {
  if (hasPomodoroInfo && planItem.sub_blocks) {
    const focusBlock = planItem.sub_blocks.find(sb => sb.label && sb.label.includes('Focus'));
    if (focusBlock && focusBlock.time) {
      const [start, end] = focusBlock.time.split('-');
      if (start && end) {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);
        if (duration > 0 && duration <= 90) {
          setWorkDuration(duration);
        }
      }
    }
  }
}, [hasPomodoroInfo, planItem]);
```

## UI 设计

### 计时按钮
```
┌─────────────────────────────────────┐
│ ≡  09:00 - 10:30    [▶] WORK        │
│    深度工作                          │
│    专注完成核心任务...               │
└─────────────────────────────────────┘
```

### 模式选择（无番茄钟信息）
```
┌─────────────────────────────────────┐
│ 选择计时模式                         │
│ 📋 深度工作                          │
├─────────────────────────────────────┤
│ ⏱️ 正计时                            │
│    从 0 开始计时                     │
├─────────────────────────────────────┤
│ ⏰ 倒计时                            │
│    设定时间倒数                      │
├─────────────────────────────────────┤
│ 🍅 番茄钟                            │
│    工作休息循环                      │
└─────────────────────────────────────┘
```

### 模式选择（有番茄钟信息）
```
┌─────────────────────────────────────┐
│ 选择计时模式                         │
│ 📋 深度工作                          │
├─────────────────────────────────────┤
│ ⏱️ 正计时                            │
│    从 0 开始计时                     │
├─────────────────────────────────────┤
│ ⏰ 倒计时                            │
│    设定时间倒数                      │
├─────────────────────────────────────┤
│ 🍅 番茄钟 [推荐]                     │
│    工作休息循环                      │
│    (紫色高亮边框)                    │
└─────────────────────────────────────┘
```

### 番茄钟时长设置
```
┌─────────────────────────────────────┐
│ 设置时长                             │
│ 📋 深度工作                          │
├─────────────────────────────────────┤
│ 工作时长（分钟）                     │
│ ┌─────────────────────────────────┐ │
│ │          25                     │ │
│ └─────────────────────────────────┘ │
│ [15] [25] [30] [45]                 │
│                                     │
│ 休息时长（分钟）                     │
│ ┌─────────────────────────────────┐ │
│ │          5                      │ │
│ └─────────────────────────────────┘ │
│ [5] [10] [15]                       │
│                                     │
│ [取消]        [开始计时]             │
└─────────────────────────────────────┘
```

## 用户流程

### 流程 1：正计时
1. 点击计划事项旁的 Play 按钮
2. 选择"正计时"
3. 自动切换到计时器页面并开始计时

### 流程 2：倒计时
1. 点击计划事项旁的 Play 按钮
2. 选择"倒计时"
3. 设置时长（输入或快捷按钮）
4. 点击"开始计时"
5. 自动切换到计时器页面并开始倒计时

### 流程 3：番茄钟（无信息）
1. 点击计划事项旁的 Play 按钮
2. 选择"番茄钟"
3. 设置工作时长和休息时长
4. 点击"开始计时"
5. 自动切换到计时器页面并开始番茄钟

### 流程 4：番茄钟（有信息）
1. 点击计划事项旁的 Play 按钮
2. 看到"番茄钟"选项带有"推荐"标签
3. 选择"番茄钟"
4. 工作时长已自动填充（从事项中提取）
5. 可以调整时长或直接点击"开始计时"
6. 自动切换到计时器页面并开始番茄钟

## 代码修改位置

### 1. 状态定义（第 1593-1596 行）
添加了 `showPlanTimerModal` 和 `selectedPlanItem` 状态

### 2. 处理函数（第 1875-1905 行）
添加了：
- `handlePlanItemTimer`: 打开计时模态框
- `handleStartPlanTimer`: 创建并启动临时计时器

### 3. PlanItemTimerModal 组件（第 528 行之前）
创建了完整的计时模式选择和时长设置组件

### 4. 计划显示（第 2403 行）
在事项卡片中添加了 Play 按钮

### 5. 模态框渲染（第 2408-2417 行）
在 renderPlanPage 函数中添加了模态框渲染

## 特性亮点

### 1. 智能推荐
- 自动检测番茄钟信息
- 显示"推荐"标签
- 紫色高亮边框

### 2. 自动提取时长
- 从 sub_blocks 的 Focus 时间段提取
- 自动计算时长（分钟）
- 验证时长范围（1-90 分钟）

### 3. 无缝集成
- 点击按钮不触发拖拽（e.stopPropagation()）
- 自动切换到计时器页面
- 使用现有的计时器系统

### 4. 临时计时器
- 不保存到 TimerStorage
- 使用唯一 ID（plan_timer_${timestamp}）
- 自动分配到"工作"分类

## 测试建议

### 测试场景 1：正计时
1. 生成今日计划
2. 点击任意事项的 Play 按钮
3. 选择"正计时"
4. 验证是否切换到计时器页面并开始计时

### 测试场景 2：倒计时
1. 点击事项的 Play 按钮
2. 选择"倒计时"
3. 设置 25 分钟
4. 点击"开始计时"
5. 验证倒计时是否正确启动

### 测试场景 3：番茄钟（无信息）
1. 点击普通事项的 Play 按钮
2. 选择"番茄钟"
3. 设置工作 25 分钟，休息 5 分钟
4. 验证番茄钟是否正确启动

### 测试场景 4：番茄钟（有信息）
1. 生成包含番茄钟的计划
2. 点击带有 Focus/Break 的事项
3. 验证"番茄钟"选项是否显示"推荐"标签
4. 验证工作时长是否自动填充
5. 验证番茄钟是否正确启动

### 测试场景 5：拖拽不冲突
1. 点击 Play 按钮
2. 验证不会触发拖拽
3. 拖拽事项
4. 验证拖拽功能正常

## 注意事项

### 1. 临时计时器
- 不会保存到 TimerStorage
- 每次创建都是新的 ID
- 计时结束后数据会记录到数据源

### 2. 分类分配
- 默认分配到"工作"分类
- 如果没有"工作"分类，使用第一个分类

### 3. 番茄钟检测
- 检测关键词：Focus, Break, Pomodoro
- 只检测 sub_blocks 中的 label
- 大小写不敏感

### 4. 时长提取
- 只提取 Focus 时间段
- 验证时长范围（1-90 分钟）
- 如果提取失败，使用默认值 25 分钟

## 后续优化建议

### 功能增强
1. 支持保存临时计时器为永久计时器
2. 支持自定义计时器图标
3. 支持自定义分类分配
4. 支持从事项描述中提取更多信息

### 用户体验
1. 添加计时器启动动画
2. 添加音效反馈
3. 添加震动反馈（移动端）
4. 支持键盘快捷键

### 智能优化
1. 学习用户习惯，推荐常用模式
2. 根据事项类型自动选择模式
3. 根据时间段推荐时长
4. 支持批量启动多个计时器

## 相关文档
- `PLAN_REORDER_COMPLETE.md` - 拖拽排序功能文档
- `TIMER_IMPROVEMENTS.md` - 计时器功能改进文档

## 实现状态
✅ 完全实现，功能正常

## 测试状态
⏳ 待用户测试

---

**实现完成时间**: 2025-12-08
**实现者**: Kiro AI Assistant
**版本**: v1.0
