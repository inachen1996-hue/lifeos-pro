# Passive Event Listener 错误修复

## 问题描述

控制台出现大量错误：
```
Unable to preventDefault inside passive event listener invocation.
```

这是因为在 React 的 `onTouchMove` 事件中调用了 `preventDefault()`，而 React 的触摸事件默认是 passive 的。

## 根本原因

1. **React 合成事件的限制**：React 的 `onTouchMove` 等触摸事件默认是 passive 的
2. **无法控制 passive 选项**：在 React JSX 中无法直接设置 `{ passive: false }`
3. **preventDefault 调用失败**：在 passive 事件监听器中调用 `preventDefault()` 会被忽略并报错

## 修复方案

### 1. 使用原生事件监听器

通过 `useEffect` 添加原生 DOM 事件监听器，可以完全控制 passive 选项：

```javascript
useEffect(() => {
  if (!isMobile) return;
  
  const planContainer = document.querySelector('[data-plan-container]');
  if (!planContainer) return;

  const handleNativeTouchMove = (e) => {
    if (touchDragState.isDragging) {
      const touch = e.touches[0];
      const deltaY = Math.abs(touch.clientY - touchDragState.startY);
      const deltaX = Math.abs(touch.clientX - touchDragState.startX);
      
      // 只在拖拽时阻止默认滚动
      if (deltaY > 10 || deltaX > 10) {
        e.preventDefault();
      }
    }
  };

  // 关键：设置 passive: false
  planContainer.addEventListener('touchmove', handleNativeTouchMove, { passive: false });

  return () => {
    planContainer.removeEventListener('touchmove', handleNativeTouchMove);
  };
}, [isMobile, touchDragState.isDragging, touchDragState.startY, touchDragState.startX]);
```

### 2. 移除 React 事件中的 preventDefault

在 React 的 `onTouchMove` 中不再调用 `preventDefault()`：

```javascript
const handleTouchMove = (e, index) => {
  if (!isMobile || !touchDragState.isDragging) return;
  
  const touch = e.touches[0];
  const currentY = touch.clientY;
  const currentX = touch.clientX;
  
  // 计算移动距离
  const deltaY = Math.abs(currentY - touchDragState.startY);
  const deltaX = Math.abs(currentX - touchDragState.startX);
  
  if (deltaY > 10 || deltaX > 10) {
    // 不在这里调用 preventDefault
    // 由原生事件监听器处理
    
    setTouchDragState(prev => ({
      ...prev,
      currentY,
      currentX
    }));
    
    // ... 拖拽逻辑
  }
};
```

### 3. 更新状态结构

确保 touchDragState 包含所有需要的字段：

```javascript
const [touchDragState, setTouchDragState] = useState({
  isDragging: false,
  startY: 0,
  startX: 0,  // 新增
  currentY: 0,
  currentX: 0  // 新增
});
```

## 技术要点

### Passive Event Listeners

- **Passive = true**：浏览器不会等待事件处理器，直接执行默认行为（如滚动）
- **Passive = false**：浏览器会等待事件处理器，允许调用 `preventDefault()`
- **默认行为**：Chrome 等浏览器对 `touchstart` 和 `touchmove` 默认使用 passive: true

### 为什么需要 passive: false

1. **拖拽操作**：需要阻止页面滚动
2. **自定义手势**：需要完全控制触摸行为
3. **避免冲突**：防止拖拽时触发滚动

### 性能考虑

- 只在必要时使用 `passive: false`
- 只在拖拽状态时调用 `preventDefault()`
- 正确清理事件监听器

## 测试方法

1. 打开 `test-passive-fix.html`
2. 打开浏览器控制台
3. 在移动设备或模拟器上测试拖拽
4. 确认没有 "Unable to preventDefault" 错误

## 影响范围

- ✅ 计划页面的拖拽排序
- ✅ 移动端触摸交互
- ✅ 控制台错误清理

## 相关文件

- `index.html` - 主应用文件（已修复）
- `test-passive-fix.html` - 测试文件
- `PASSIVE_EVENT_FIX.md` - 本文档

## 参考资料

- [MDN: addEventListener passive option](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#passive)
- [Chrome: Passive Event Listeners](https://developer.chrome.com/blog/passive-event-listeners/)
- [React: Event System](https://react.dev/learn/responding-to-events)
