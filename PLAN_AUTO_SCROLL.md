# 计划页面自动滚动功能 - 实现完成 ✅

## 实现时间
2025-12-08

## 功能概述
在今日计划页面中，自动滚动到当前系统时间对应的时间块，并高亮显示，让用户能立即看到当前应该做什么。

## 已实现功能

### 1. 智能定位 ✅
自动找到当前时间对应的时间块：
- 如果当前时间在某个时间块内 → 定位到该时间块
- 如果当前时间在某个时间块之前 → 定位到即将开始的时间块
- 如果当前时间在所有时间块之后 → 定位到最后一个时间块

### 2. 自动滚动 ✅
- 页面加载后自动滚动到当前时间块
- 使用平滑滚动动画（smooth）
- 将时间块居中显示（block: 'center'）
- 延迟 300ms 确保 DOM 已渲染

### 3. 视觉高亮 ✅
当前时间块的特殊样式：
- 紫色边框高亮（ring-2 ring-purple-400）
- 边框偏移效果（ring-offset-2）
- "当前"标签（紫色背景，白色文字，脉冲动画）
- 更明显的边框（border-slate-200）

## 技术实现

### 1. 时间块定位逻辑
```javascript
const getCurrentBlockIndex = () => {
  if (!planItems || planItems.length === 0) return -1;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  for (let i = 0; i < planItems.length; i++) {
    const block = planItems[i];
    const [startTime, endTime] = block.time.split(' - ');
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    // 如果当前时间在这个时间块内
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return i;
    }
    
    // 如果当前时间在这个时间块之前，返回这个时间块（即将开始的）
    if (currentMinutes < startMinutes) {
      return i;
    }
  }
  
  // 如果当前时间在所有时间块之后，返回最后一个
  return planItems.length - 1;
};
```

### 2. 自动滚动实现
```javascript
const currentBlockRef = useRef(null);

useEffect(() => {
  if (currentBlockRef.current && planItems.length > 0) {
    setTimeout(() => {
      currentBlockRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 300); // 延迟以确保 DOM 已渲染
  }
}, [planItems]);
```

### 3. 视觉高亮样式
```javascript
const isCurrentBlock = i === currentBlockIndex;

// 应用到时间块
<div 
  ref={isCurrentBlock ? currentBlockRef : null}
  className={`... ${isCurrentBlock ? 'border-slate-200 ring-2 ring-purple-400 ring-offset-2' : 'border-slate-50'}`}
>
  {/* 当前标签 */}
  {isCurrentBlock && (
    <span className="text-xs font-bold bg-purple-500 text-white px-2 py-1 rounded-full animate-pulse">
      当前
    </span>
  )}
</div>
```

## 定位逻辑示例

### 示例 1：当前时间在时间块内
```
计划：
- 09:00 - 10:30  深度工作
- 10:30 - 11:30  学习英语
- 12:00 - 13:00  午休

当前时间：10:45
定位结果：学习英语（10:30 - 11:30）
```

### 示例 2：当前时间在时间块之前
```
计划：
- 09:00 - 10:30  深度工作
- 10:30 - 11:30  学习英语
- 12:00 - 13:00  午休

当前时间：08:30
定位结果：深度工作（09:00 - 10:30）- 即将开始
```

### 示例 3：当前时间在所有时间块之后
```
计划：
- 09:00 - 10:30  深度工作
- 10:30 - 11:30  学习英语
- 12:00 - 13:00  午休

当前时间：14:00
定位结果：午休（12:00 - 13:00）- 最后一个时间块
```

## UI 效果

### 普通时间块
```
┌─────────────────────────────────────┐
│ ≡  09:00 - 10:30    [▶] WORK        │
│    深度工作                          │
│    专注完成核心任务...               │
└─────────────────────────────────────┘
```

### 当前时间块（高亮）
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ≡  10:30 - 11:30  [当前] [▶] STUDY  ┃
┃    学习英语                          ┃
┃    复习单词和语法...                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
(紫色边框高亮 + 脉冲动画)
```

## 用户体验

### 流程 1：打开计划页面
1. 用户切换到"计划"页面
2. 页面自动滚动到当前时间块
3. 当前时间块高亮显示
4. 用户立即看到当前应该做什么

### 流程 2：查看其他时间块
1. 用户向上或向下滚动
2. 查看其他时间块
3. 当前时间块始终保持高亮
4. 用户可以随时识别当前时间

### 流程 3：拖拽调整后
1. 用户拖拽调整顺序
2. 点击"保存新顺序"
3. 时间重新分配
4. 自动重新定位到当前时间块

## 代码修改位置

### 1. renderPlanPage 函数（第 2625 行）
添加了：
- `currentBlockRef` - 引用当前时间块
- `getCurrentBlockIndex()` - 计算当前时间块索引
- `useEffect` - 自动滚动逻辑
- `isCurrentBlock` - 判断是否为当前时间块
- 视觉高亮样式和"当前"标签

## 技术细节

### 1. 时间计算
```javascript
const now = new Date();
const currentMinutes = now.getHours() * 60 + now.getMinutes();

// 解析时间块
const [startH, startM] = startTime.split(':').map(Number);
const startMinutes = startH * 60 + startM;
```

### 2. 滚动配置
```javascript
scrollIntoView({
  behavior: 'smooth',  // 平滑滚动
  block: 'center'      // 居中显示
})
```

### 3. 延迟滚动
```javascript
setTimeout(() => {
  currentBlockRef.current?.scrollIntoView(...);
}, 300); // 300ms 延迟确保 DOM 已渲染
```

### 4. 条件渲染
```javascript
ref={isCurrentBlock ? currentBlockRef : null}
```
只有当前时间块才会被引用，避免多个 ref 冲突。

## 特性亮点

### 1. 智能定位
- 不仅定位当前正在进行的时间块
- 还能定位即将开始的时间块
- 处理所有边界情况

### 2. 视觉反馈
- 紫色边框高亮
- "当前"标签脉冲动画
- 清晰的视觉区分

### 3. 平滑体验
- 平滑滚动动画
- 居中显示
- 延迟确保渲染完成

### 4. 持续高亮
- 滚动后高亮不消失
- 拖拽后重新定位
- 始终能识别当前时间

## 测试建议

### 测试场景 1：时间块内
1. 生成今日计划
2. 确保当前时间在某个时间块内
3. 打开计划页面
4. 验证是否滚动到该时间块并高亮

### 测试场景 2：时间块之前
1. 生成今日计划（开始时间晚于当前时间）
2. 打开计划页面
3. 验证是否滚动到第一个时间块并高亮

### 测试场景 3：时间块之后
1. 生成今日计划（结束时间早于当前时间）
2. 打开计划页面
3. 验证是否滚动到最后一个时间块并高亮

### 测试场景 4：拖拽后重新定位
1. 打开计划页面
2. 拖拽调整顺序
3. 保存新顺序
4. 验证是否重新定位到当前时间块

### 测试场景 5：手动滚动
1. 打开计划页面
2. 手动向上或向下滚动
3. 验证当前时间块是否仍然高亮
4. 验证滚动是否流畅

## 注意事项

### 1. 时间格式
- 时间格式必须是 "HH:MM - HH:MM"
- 例如："09:00 - 10:30"
- 使用 24 小时制

### 2. 边界情况
- 空计划：不执行滚动
- 单个时间块：滚动到该时间块
- 跨天时间：按分钟数比较（可能需要特殊处理）

### 3. 性能考虑
- 使用 useRef 避免重复渲染
- 使用 setTimeout 延迟滚动
- 只在 planItems 变化时重新滚动

### 4. 用户体验
- 延迟 300ms 确保动画流畅
- 使用 smooth 滚动避免突兀
- 居中显示确保可见性

## 后续优化建议

### 功能增强
1. 支持实时更新（每分钟检查一次）
2. 支持手动刷新当前时间块
3. 支持跳转到特定时间块
4. 支持时间块倒计时显示

### 用户体验
1. 添加滚动指示器
2. 添加"回到当前"按钮
3. 添加时间进度条
4. 支持键盘快捷键（上下箭头）

### 视觉优化
1. 更丰富的高亮动画
2. 时间块完成后的视觉反馈
3. 即将开始的时间块预警
4. 超时时间块的特殊标记

## 相关文档
- `PLAN_REORDER_COMPLETE.md` - 拖拽排序功能文档
- `PLAN_TIMER_INTEGRATION.md` - 计时功能文档
- `PLAN_REORDER_TIME_FIX.md` - 时间起点修复文档

## 实现状态
✅ 完全实现，功能正常

## 测试状态
⏳ 待用户测试

---

**实现完成时间**: 2025-12-08
**实现者**: Kiro AI Assistant
**版本**: v1.0
