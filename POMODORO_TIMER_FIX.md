# 番茄钟计时功能修复

## 问题描述
番茄钟开启后，一直没有开始倒计时，显示时间不变。

## 根本原因
在 `TimerControlModal` 组件的 `useEffect` 中，只处理了 `stopwatch` 和 `countdown` 模式，但没有处理 `pomodoro` 模式的计时逻辑。

## 修复方案

### 1. 添加番茄钟计时逻辑
```javascript
useEffect(() => {
  if (session.status === 'running') {
    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(session.startTime).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      
      if (timer.mode === 'stopwatch') {
        setDisplayTime(formatTime(elapsed));
      } else if (timer.mode === 'countdown') {
        const duration = timer.settings?.countdownDuration || 25;
        const remaining = Math.max(0, (duration * 60) - elapsed);
        setDisplayTime(formatTime(remaining));
      } else if (timer.mode === 'pomodoro') {
        // 番茄钟：根据当前周期显示倒计时
        const workDuration = timer.settings?.workDuration || 25;
        const restDuration = timer.settings?.restDuration || 5;
        const currentPeriod = session.currentPeriod || 'work';
        const duration = currentPeriod === 'work' ? workDuration : restDuration;
        const remaining = Math.max(0, (duration * 60) - elapsed);
        setDisplayTime(formatTime(remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}, [session, timer]);
```

### 2. 改进番茄钟显示文本
显示当前是工作阶段还是休息阶段：

```javascript
{timer.mode === 'pomodoro' && (
  <div>
    <div className="font-bold text-lg mb-1">
      {session.currentPeriod === 'work' ? '🍅 工作时间' : '☕ 休息时间'}
    </div>
    <div className="text-xs">
      {session.currentPeriod === 'work' 
        ? `${timer.settings?.workDuration || 25} 分钟` 
        : `${timer.settings?.restDuration || 5} 分钟`}
    </div>
  </div>
)}
```

## 番茄钟逻辑说明

### 当前实现
- 根据 `session.currentPeriod` 判断当前是工作还是休息阶段
- 默认从 'work' 阶段开始
- 根据不同阶段使用对应的时长（workDuration 或 restDuration）
- 显示倒计时剩余时间

### 显示效果
**工作阶段**：
- 🍅 工作时间
- 25 分钟（或用户设置的时长）
- 倒计时显示

**休息阶段**：
- ☕ 休息时间
- 5 分钟（或用户设置的时长）
- 倒计时显示

## 注意事项
当前实现只处理了单个周期的倒计时显示。完整的番茄钟功能还需要：
- 工作阶段结束后自动切换到休息阶段
- 休息阶段结束后自动切换到下一个工作阶段
- 周期计数和完成提示
- 这些功能需要在后续迭代中实现

## 文件修改
- `index.html` - 修复 `TimerControlModal` 组件中的番茄钟计时逻辑

## 状态
✅ 修复完成
✅ 代码编译成功
✅ 番茄钟倒计时正常显示
