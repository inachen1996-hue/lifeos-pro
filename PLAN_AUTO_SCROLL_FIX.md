# 计划页面自动滚动 - Hook 错误修复 ✅

## 问题描述
点击"今日计划"按钮时，页面显示"出了一点小问题"错误。

## 错误原因
在 `renderPlanPage` 函数内部使用了 React Hooks（`useRef` 和 `useEffect`），但 Hooks 只能在组件顶层使用，不能在普通函数内部使用。

## 错误代码
```javascript
const renderPlanPage = () => {
  const currentBlockRef = useRef(null);  // ❌ 错误：在函数内部使用 Hook
  
  useEffect(() => {  // ❌ 错误：在函数内部使用 Hook
    // ...
  }, [planItems]);
  
  // ...
};
```

## 修复方案
将 Hooks 移到 App 组件的顶层：

### 1. 移动 useRef 到组件顶层
```javascript
function App() {
  // ... 其他状态
  
  // 计划页面自动滚动相关
  const currentBlockRef = useRef(null);  // ✅ 正确：在组件顶层
  
  // ...
}
```

### 2. 移动辅助函数到组件顶层
```javascript
// 找到当前时间对应的时间块
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
    
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return i;
    }
    
    if (currentMinutes < startMinutes) {
      return i;
    }
  }
  
  return planItems.length - 1;
};
```

### 3. 移动 useEffect 到组件顶层
```javascript
// 自动滚动到当前时间块
useEffect(() => {
  if (currentBlockRef.current && planItems.length > 0 && activePage === 'plan') {
    setTimeout(() => {
      currentBlockRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 300);
  }
}, [planItems, activePage]);  // ✅ 添加 activePage 依赖
```

### 4. 简化 renderPlanPage 函数
```javascript
const renderPlanPage = () => {
  const currentBlockIndex = getCurrentBlockIndex();  // ✅ 只调用函数
  
  // ... 渲染逻辑
};
```

## 修复细节

### 1. 添加 activePage 依赖
在 useEffect 中添加 `activePage` 依赖，确保只在计划页面时才滚动：
```javascript
useEffect(() => {
  if (currentBlockRef.current && planItems.length > 0 && activePage === 'plan') {
    // ...
  }
}, [planItems, activePage]);  // 添加 activePage
```

### 2. 移除重复的 Hook
原来的代码在 renderPlanPage 函数内部有重复的 Hook 定义，现在统一移到组件顶层。

### 3. 保持功能不变
修复后的功能与原设计完全一致：
- 自动滚动到当前时间块
- 高亮显示当前时间块
- 显示"当前"标签

## React Hooks 规则

### Hook 使用规则
1. **只在顶层调用 Hook**
   - ✅ 在组件顶层调用
   - ❌ 不要在循环、条件或嵌套函数中调用

2. **只在 React 函数中调用 Hook**
   - ✅ 在 React 函数组件中调用
   - ✅ 在自定义 Hook 中调用
   - ❌ 不要在普通 JavaScript 函数中调用

### 正确示例
```javascript
function MyComponent() {
  const [state, setState] = useState(0);  // ✅ 顶层
  const ref = useRef(null);               // ✅ 顶层
  
  useEffect(() => {                       // ✅ 顶层
    // ...
  }, []);
  
  const renderSomething = () => {
    // ❌ 不要在这里使用 Hook
    return <div>...</div>;
  };
  
  return renderSomething();
}
```

### 错误示例
```javascript
function MyComponent() {
  const renderSomething = () => {
    const [state, setState] = useState(0);  // ❌ 在函数内部
    const ref = useRef(null);               // ❌ 在函数内部
    
    useEffect(() => {                       // ❌ 在函数内部
      // ...
    }, []);
    
    return <div>...</div>;
  };
  
  return renderSomething();
}
```

## 代码修改位置

### 1. 添加 ref（第 1833 行）
```javascript
// 计划页面自动滚动相关
const currentBlockRef = useRef(null);
```

### 2. 添加辅助函数（第 2044 行）
```javascript
// 找到当前时间对应的时间块
const getCurrentBlockIndex = () => {
  // ...
};
```

### 3. 添加 useEffect（第 2075 行）
```javascript
// 自动滚动到当前时间块
useEffect(() => {
  // ...
}, [planItems, activePage]);
```

### 4. 简化 renderPlanPage（第 2690 行）
```javascript
const renderPlanPage = () => {
  const currentBlockIndex = getCurrentBlockIndex();
  // ...
};
```

## 测试验证

### 测试步骤
1. 打开应用
2. 完成状态打卡
3. 生成今日计划
4. 点击"计划"按钮
5. 验证页面是否正常显示
6. 验证是否自动滚动到当前时间块
7. 验证当前时间块是否高亮

### 预期结果
- ✅ 页面正常显示，无错误
- ✅ 自动滚动到当前时间块
- ✅ 当前时间块高亮显示
- ✅ 显示"当前"标签

## 经验教训

### 1. Hook 规则很重要
React Hooks 有严格的使用规则，必须遵守：
- 只在顶层调用
- 只在 React 函数中调用
- 不要在循环、条件或嵌套函数中调用

### 2. 渲染函数不是组件
`renderXXX` 这样的函数不是 React 组件，不能在其中使用 Hook。如果需要使用 Hook，应该：
- 将 Hook 移到父组件顶层
- 或者将渲染函数改为真正的组件

### 3. 依赖数组要完整
useEffect 的依赖数组要包含所有使用的外部变量，避免闭包陷阱。

## 相关文档
- `PLAN_AUTO_SCROLL.md` - 自动滚动功能文档
- React Hooks 官方文档：https://react.dev/reference/react

## 修复状态
✅ 已修复并测试

## 修复时间
2025-12-08

---

**修复者**: Kiro AI Assistant
**版本**: v1.1
