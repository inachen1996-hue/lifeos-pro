# LifeOS Timer Rework - 集成指南

## 概述

本指南将帮助你将新的 Timer 功能集成到现有的 `index.html` 中。

## 前提条件

✅ 后端代码已编译到 `dist/` 目录
✅ `timer-integration.js` 文件已创建
✅ 现有 `index.html` 正常运行

## 集成步骤

### 步骤 1：添加模块导入

在 `index.html` 的 `<script type="text/babel" data-type="module">` 标签**之前**，添加以下代码：

```html
<!-- Timer Backend Modules -->
<script type="module">
  // 导入后端模块并暴露到全局
  import { TimerStorage, CategoryStorage, EventStorage } from './dist/storage.js';
  import { TimerManager } from './dist/timer-manager.js';
  import { CategoryManager } from './dist/category-manager.js';
  import { StopwatchEngine } from './dist/stopwatch-engine.js';
  import { CountdownEngine } from './dist/countdown-engine.js';
  import { PomodoroEngine } from './dist/pomodoro-engine.js';
  import { EventManager } from './dist/event-manager.js';
  import { ConflictResolver } from './dist/conflict-resolver.js';
  import { BlankPeriodDetector } from './dist/blank-period-detector.js';
  import { alarmService } from './dist/alarm-service.js';
  import { DEFAULT_CATEGORIES } from './dist/types.js';

  // 暴露到全局供 React 使用
  window.TimerBackend = {
    TimerStorage,
    CategoryStorage,
    EventStorage,
    TimerManager,
    CategoryManager,
    StopwatchEngine,
    CountdownEngine,
    PomodoroEngine,
    EventManager,
    ConflictResolver,
    BlankPeriodDetector,
    alarmService,
    DEFAULT_CATEGORIES
  };
</script>

<!-- Timer UI Components -->
<script src="./timer-integration.js"></script>
```

### 步骤 2：在 App 组件中添加 Timer 状态

在 `App` 函数组件的开头，添加 Timer 相关的状态：

```javascript
function App() {
  // ... 现有状态 ...

  // Timer 状态
  const [timerCategories, setTimerCategories] = useState(() => {
    if (window.TimerBackend) {
      return window.TimerBackend.CategoryStorage.loadCategories();
    }
    return [];
  });

  const [timers, setTimers] = useState(() => {
    if (window.TimerBackend) {
      return window.TimerBackend.TimerStorage.loadTimers();
    }
    return [];
  });

  const [activeTimerSession, setActiveTimerSession] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const expanded = {};
    timerCategories.forEach(cat => {
      expanded[cat.id] = true; // 默认展开所有分类
    });
    return expanded;
  });

  // Timer 操作函数
  const handleCreateTimer = (timer) => {
    if (window.TimerBackend) {
      window.TimerBackend.TimerStorage.saveTimer(timer);
      setTimers(window.TimerBackend.TimerStorage.loadTimers());
      showToast('计时器已创建');
    }
  };

  const handleStartTimer = (timer) => {
    // 创建新的 session
    const session = {
      timerId: timer.id,
      startTime: new Date().toISOString(),
      mode: timer.mode,
      status: 'running',
      ...(timer.mode === 'pomodoro' && {
        currentCycle: 1,
        currentPeriod: 'work',
        workPeriods: []
      })
    };
    setActiveTimerSession({ timer, session });
  };

  const handlePauseTimer = () => {
    if (activeTimerSession) {
      setActiveTimerSession({
        ...activeTimerSession,
        session: { ...activeTimerSession.session, status: 'paused' }
      });
    }
  };

  const handleResumeTimer = () => {
    if (activeTimerSession) {
      setActiveTimerSession({
        ...activeTimerSession,
        session: { ...activeTimerSession.session, status: 'running' }
      });
    }
  };

  const handleStopTimer = () => {
    if (activeTimerSession && window.TimerBackend) {
      const { timer, session } = activeTimerSession;
      const endTime = new Date().toISOString();
      const startTime = new Date(session.startTime).getTime();
      const duration = (Date.now() - startTime) / 1000; // 秒

      // 秒表模式：只有 >= 60 秒才记录
      if (timer.mode === 'stopwatch' && duration >= 60) {
        const event = {
          id: `event_${Date.now()}`,
          name: timer.name,
          startTime: session.startTime,
          endTime,
          categoryId: timer.categoryId,
          source: 'timer',
          priority: 2,
          timerId: timer.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        window.TimerBackend.EventStorage.saveEvent(event);
        showToast('已记录到数据源');
      } else if (timer.mode === 'stopwatch') {
        showToast('时长不足 1 分钟，未记录', 'error');
      }

      // 倒计时和番茄钟的记录逻辑在引擎中处理
      // 这里只是示例，实际应该使用引擎

      setActiveTimerSession(null);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // ... 其他现有代码 ...
}
```

### 步骤 3：添加 Timer 页面渲染函数

在 `App` 组件中，添加 `renderTimerPage` 函数：

```javascript
const renderTimerPage = () => {
  if (!window.TimerComponents) {
    return <div className="text-center py-12 text-slate-400">Timer 组件加载中...</div>;
  }

  const { TimerPage, TimerControlModal } = window.TimerComponents;

  return (
    <>
      <TimerPage
        categories={timerCategories}
        timers={timers}
        onCreateTimer={handleCreateTimer}
        onStartTimer={handleStartTimer}
        onEditTimer={(timer) => console.log('Edit timer:', timer)}
        onDeleteTimer={(timerId) => console.log('Delete timer:', timerId)}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
      />

      {/* Timer Control Modal */}
      {activeTimerSession && (
        <TimerControlModal
          timer={activeTimerSession.timer}
          session={activeTimerSession.session}
          onPause={handlePauseTimer}
          onResume={handleResumeTimer}
          onStop={handleStopTimer}
          onClose={() => setActiveTimerSession(null)}
        />
      )}
    </>
  );
};
```

### 步骤 4：更新主渲染逻辑

在 `main` 标签中，添加 Timer 页面的渲染：

```javascript
<main className="pt-28 px-5 max-w-md mx-auto">
  {activePage === 'timer' && renderTimerPage()}  {/* 新增 */}
  {activePage === 'data' && renderDataPage()}
  {activePage === 'diary' && renderDiaryPage()}
  {activePage === 'review' && renderReviewPage()}
  {activePage === 'status' && renderStatusPage()}
  {activePage === 'plan' && renderPlanPage()}
</main>
```

### 步骤 5：更新导航栏

修改底部导航栏，添加 Timer 按钮：

```javascript
<nav className="fixed bottom-8 inset-x-6 max-w-md mx-auto z-[100] flex gap-3">
  <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-[2rem] p-2 shadow-2xl shadow-slate-200/50 flex justify-between items-center border border-white/50 ring-1 ring-slate-900/5">
    {/* 新增 Timer 按钮 */}
    <NavBtn 
      page="timer" 
      icon={Timer} 
      label="计时器" 
      groupColor="bg-transparent" 
      activeColor="bg-macaron-green" 
      activePage={activePage} 
      setActivePage={setActivePage} 
      loading={loading} 
    />
    <NavBtn page="data" icon={Database} label="数据源" groupColor="bg-transparent" activeColor="bg-macaron-blue" activePage={activePage} setActivePage={setActivePage} loading={loading} />
    <NavBtn page="diary" icon={Book} label="日记" groupColor="bg-transparent" activeColor="bg-macaron-pink" activePage={activePage} setActivePage={setActivePage} loading={loading} />
    <NavBtn page="review" icon={PieIcon} label="复盘" groupColor="bg-transparent" activeColor="bg-macaron-purple" activePage={activePage} setActivePage={setActivePage} loading={loading} />
  </div>
  
  {/* 状态和计划按钮组保持不变 */}
  <div className="flex-[0.6] bg-[#FFC8DD]/95 backdrop-blur-xl rounded-[2rem] p-2 shadow-2xl shadow-pink-200/50 flex justify-between items-center border border-white/50 ring-1 ring-pink-900/5">
    <NavBtn page="status" icon={UserCheck} label="状态" groupColor="bg-transparent" activeColor="bg-white text-macaron-dark shadow-sm" activePage={activePage} setActivePage={setActivePage} loading={loading} />
    <NavBtn page="plan" icon={CalendarDays} label="计划" groupColor="bg-transparent" activeColor="bg-white text-macaron-dark shadow-sm" activePage={activePage} setActivePage={setActivePage} loading={loading} />
  </div>
</nav>
```

### 步骤 6：更新初始页面

将默认页面改为 Timer：

```javascript
const [activePage, setActivePage] = useState('timer'); // 从 'data' 改为 'timer'
```

## 测试步骤

1. **编译后端代码**
   ```bash
   npm run build
   ```

2. **在浏览器中打开 index.html**
   - 使用本地服务器（推荐）：`python -m http.server 8000`
   - 或直接打开文件（可能有 CORS 问题）

3. **测试功能**
   - ✅ 查看默认分类
   - ✅ 创建新计时器
   - ✅ 启动秒表
   - ✅ 启动倒计时
   - ✅ 启动番茄钟
   - ✅ 暂停/继续/停止
   - ✅ 查看记录是否保存到 localStorage

## 常见问题

### Q: 模块导入失败
A: 确保使用本地服务器运行，不要直接打开 HTML 文件

### Q: Timer 组件不显示
A: 检查浏览器控制台是否有错误，确认 `window.TimerBackend` 和 `window.TimerComponents` 已正确加载

### Q: localStorage 数据不同步
A: 检查 STORAGE_KEYS 是否正确，确保使用相同的 key

## 下一步

完成基础集成后，可以继续实现：
1. Data Source 页面的新子标签（Pending、View Data、Upload）
2. 事件冲突解决
3. 空白时段检测
4. 更多 UI 优化

## 需要帮助？

如果遇到问题，请检查：
1. 浏览器控制台的错误信息
2. Network 标签查看模块是否正确加载
3. localStorage 中的数据结构
