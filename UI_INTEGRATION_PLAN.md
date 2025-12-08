# LifeOS Timer Rework - UI 集成计划

## 当前状态
- ✅ 后端逻辑已完成并编译到 `dist/` 目录
- ✅ 所有测试通过（106 个测试）
- ✅ 现有 index.html 使用 React + Tailwind + Macaron 设计

## 集成方案

### 第一阶段：准备工作 ✅
1. ✅ 配置 TypeScript 编译为 ES Modules
2. ✅ 编译后端代码到 `dist/`
3. ✅ 修复编译错误

### 第二阶段：集成后端模块（进行中）
1. 在 index.html 中添加模块导入
2. 创建 Timer 页面组件
3. 添加 Timer 到导航栏

### 第三阶段：实现 Timer UI 组件
1. Timer Tab 主页面
   - 分类列表（可折叠）
   - 计时器列表
   - 新建计时器按钮
   
2. Timer 控制模态框
   - 秒表模式
   - 倒计时模式
   - 番茄钟模式
   
3. Timer 创建/编辑模态框
   - 名称输入
   - 图标选择
   - 分类选择
   - 模式选择
   - 设置配置

### 第四阶段：实现 Data Source 新功能
1. Pending Confirmation 子标签
2. View Existing Data 子标签
3. Calendar Upload 功能
4. Data Validation 模态框

### 第五阶段：集成冲突解决和空白检测
1. 自动冲突解决
2. 空白时段检测
3. 事件优先级管理

## 技术细节

### 模块导入方式
```html
<script type="module">
  // 导入后端模块
  import { TimerManager } from './dist/timer-manager.js';
  import { CategoryStorage } from './dist/storage.js';
  import { StopwatchEngine } from './dist/stopwatch-engine.js';
  // ... 其他模块
</script>
```

### React 组件结构
```
App
├── Timer Page (新增)
│   ├── CategoryList
│   │   └── TimerList
│   ├── TimerControlModal
│   └── TimerCreateModal
├── Data Source Page (扩展)
│   ├── Pending Tab (新增)
│   ├── View Data Tab (新增)
│   └── Upload Tab (新增)
├── Diary Page (保持不变)
├── Review Page (保持不变)
├── Status Page (保持不变)
└── Plan Page (保持不变)
```

### 状态管理
使用 React Hooks：
- `useState` 管理 Timer 状态
- `useEffect` 同步 localStorage
- `useCallback` 优化性能

## 下一步
开始实施第二阶段：在 index.html 中集成后端模块
