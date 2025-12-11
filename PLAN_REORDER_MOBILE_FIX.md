# 计划拖拽排序移动端修复 ✅

## 修复时间
2025-12-11

## 问题描述
用户反馈：今日计划页面"按住"计划时，无法改变顺序

## 问题分析
经过分析发现，原有的计划拖拽排序功能只实现了桌面端的HTML5拖拽API，缺少移动端的触摸事件支持。在移动设备上，HTML5拖拽API支持有限，需要使用触摸事件来实现拖拽功能。

## 修复内容

### 1. 添加设备检测 ✅
```javascript
// 检测是否为移动设备
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
```

### 2. 添加触摸拖拽状态 ✅
```javascript
// 触摸拖拽状态
const [touchDragState, setTouchDragState] = useState({
  isDragging: false,
  startY: 0,
  currentY: 0
});
```

### 3. 修改桌面端拖拽函数 ✅
为桌面端拖拽函数添加移动端检测，避免冲突：
- `handleDragStart`: 添加 `if (isMobile) return;`
- `handleDragOver`: 添加 `if (isMobile) return;`
- `handleDragEnd`: 添加 `if (isMobile) return;`

### 4. 新增移动端触摸事件处理 ✅

#### handleTouchStart
```javascript
const handleTouchStart = (e, index) => {
  if (!isMobile) return;
  e.preventDefault();
  const touch = e.touches[0];
  
  setDraggedIndex(index);
  setTouchDragState({
    isDragging: true,
    startY: touch.clientY,
    currentY: touch.clientY
  });
};
```

#### handleTouchMove
```javascript
const handleTouchMove = (e, index) => {
  if (!isMobile || !touchDragState.isDragging) return;
  e.preventDefault();
  
  const touch = e.touches[0];
  const currentY = touch.clientY;
  
  // 计算拖拽到哪个位置
  const planContainer = document.querySelector('[data-plan-container]');
  const items = planContainer.querySelectorAll('[data-plan-item]');
  let targetIndex = draggedIndex;

  items.forEach((item, idx) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    
    if (currentY < itemCenter && idx < draggedIndex) {
      targetIndex = idx;
    } else if (currentY > itemCenter && idx > draggedIndex) {
      targetIndex = idx;
    }
  });

  if (targetIndex !== draggedIndex) {
    // 重新排序逻辑
    const newItems = [...planItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    setPlanItems(newItems);
    setDraggedIndex(targetIndex);
    setHasReordered(true);
  }
};
```

#### handleTouchEnd
```javascript
const handleTouchEnd = () => {
  if (!isMobile || !touchDragState.isDragging) return;
  
  setDraggedIndex(null);
  setTouchDragState({
    isDragging: false,
    startY: 0,
    currentY: 0
  });
};
```

### 5. 更新UI渲染 ✅

#### 计划容器
添加 `data-plan-container` 属性用于触摸事件中的元素查找：
```jsx
<div className="space-y-4" data-plan-container>
```

#### 计划项目
为每个计划项目添加：
- `data-plan-item={i}` 属性
- 条件性拖拽属性：`draggable={!isMobile}`
- 条件性桌面端事件：`onDragStart={!isMobile ? ... : undefined}`
- 移动端触摸事件：`onTouchStart={isMobile ? ... : undefined}`
- 防选择样式：`select-none`
- 触摸行为：`style={{ touchAction: 'none' }}`

```jsx
<div 
  key={b.id} 
  data-plan-item={i}
  draggable={!isMobile}
  onDragStart={!isMobile ? (e) => handleDragStart(e, i) : undefined}
  onDragOver={!isMobile ? (e) => handleDragOver(e, i) : undefined}
  onDragEnd={!isMobile ? handleDragEnd : undefined}
  onTouchStart={isMobile ? (e) => handleTouchStart(e, i) : undefined}
  onTouchMove={isMobile ? (e) => handleTouchMove(e, i) : undefined}
  onTouchEnd={isMobile ? handleTouchEnd : undefined}
  className="... select-none ..."
  style={{ touchAction: 'none' }}
>
```

## 技术细节

### 设备检测
使用两种方法检测移动设备：
1. `'ontouchstart' in window` - 检测触摸事件支持
2. `navigator.maxTouchPoints > 0` - 检测触摸点数量

### 触摸事件处理
- `touchstart`: 记录触摸开始位置和拖拽项目
- `touchmove`: 实时计算目标位置并重新排序
- `touchend`: 清理拖拽状态

### 位置计算算法
通过比较触摸位置与每个计划项目的中心点，确定拖拽目标位置：
```javascript
const itemCenter = rect.top + rect.height / 2;
if (currentY < itemCenter && idx < draggedIndex) {
  targetIndex = idx; // 向上拖拽
} else if (currentY > itemCenter && idx > draggedIndex) {
  targetIndex = idx; // 向下拖拽
}
```

### 防冲突机制
- 桌面端函数添加 `if (isMobile) return;` 检查
- 移动端函数添加 `if (!isMobile) return;` 检查
- 条件性事件绑定避免重复处理

## 用户体验优化

### 移动端优化
- `e.preventDefault()` 防止默认滚动行为
- `select-none` 防止文本选择
- `touchAction: 'none'` 禁用浏览器手势
- 实时视觉反馈（透明度、缩放、阴影）

### 桌面端保持
- 保持原有HTML5拖拽API
- 保持原有视觉效果
- 保持原有交互逻辑

## 测试建议

### 移动端测试
1. 在手机/平板上打开应用
2. 生成今日计划
3. 长按计划项目的拖拽手柄（三条横线图标）
4. 拖拽到新位置
5. 检查顺序是否正确更新
6. 点击"保存新顺序"按钮
7. 验证时间重新分配

### 桌面端测试
1. 在电脑浏览器中打开应用
2. 生成今日计划
3. 拖拽计划项目
4. 验证功能正常工作

### 跨设备测试
1. 在不同设备间切换
2. 验证自动检测正确
3. 验证功能不冲突

## 修复文件
- `index.html`: 主要修复文件
- `test-plan-reorder-fix.html`: 基础测试文件
- `fix-plan-reorder-mobile.html`: 移动端修复测试文件

## 相关文档
- `PLAN_REORDER_COMPLETE.md`: 原始功能文档
- `PLAN_REORDER_FEATURE_SPEC.md`: 功能规范
- `PLAN_REORDER_IMPLEMENTATION.md`: 实现指南

## 修复状态
✅ 完全修复，支持桌面端和移动端

## 测试状态
⏳ 待用户测试

---

**修复完成时间**: 2025-12-11
**修复者**: Kiro AI Assistant
**版本**: v2.0 (移动端支持)