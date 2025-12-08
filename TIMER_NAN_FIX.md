# 倒计时 NaN 显示问题修复

## 问题描述
倒计时功能显示 `NaN:NaN:NaN` 而不是正确的时间。

## 根本原因
1. **formatTime 函数缺少 NaN 检查**：当 `seconds` 参数为 `NaN`、`null` 或 `undefined` 时，`Math.floor()` 会返回 `NaN`
2. **countdownDuration 可能未定义**：当用户从计时器列表点击计时器并选择模式时，`timer.settings.countdownDuration` 可能不存在
3. **缺少可选链操作符**：访问 `timer.settings.countdownDuration` 时没有使用安全访问

## 修复方案

### 1. 增强 formatTime 函数的健壮性
```javascript
const formatTime = (seconds) => {
  // 添加 NaN 检查
  if (isNaN(seconds) || seconds === null || seconds === undefined) {
    return '00:00:00';
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);  // 确保 s 也是整数
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
```

### 2. 使用可选链和默认值
```javascript
// 在 useEffect 中
const duration = timer.settings?.countdownDuration || 25;
const remaining = Math.max(0, (duration * 60) - elapsed);

// 在显示文本中
{timer.mode === 'countdown' && `倒计时 ${timer.settings?.countdownDuration || 25} 分钟`}
```

### 3. 统一术语
- 将"秒表模式"改为"正计时模式"，与按钮文本保持一致

## 测试场景
1. ✅ 创建倒计时计时器 → 点击开始 → 选择倒计时模式 → 确认显示正确时间
2. ✅ 创建正计时计时器 → 点击开始 → 选择正计时模式 → 确认显示正确时间
3. ✅ 创建番茄钟计时器 → 点击开始 → 选择番茄钟模式 → 确认显示正确时间
4. ✅ 倒计时到 0 时显示 00:00:00

## 文件修改
- `index.html` - 修复 `TimerControlModal` 组件中的 `formatTime` 函数和倒计时逻辑

## 状态
✅ 修复完成
✅ 代码编译成功
